const { app, BrowserWindow, screen, ipcMain } = require("electron");
const path = require("path");
const http = require("http");
const fs = require("fs");

const DIST_DIR = path.join(__dirname, "..", "dist");
const PORT = 17632;

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json",
};

// Kept in sync with WINDOW_SIZE_PRESETS in src/platform/useElectronDisplay.ts —
// the renderer only ever sends a preset id over IPC, never raw pixels.
const WINDOW_SIZE_PRESETS = {
  compact: { width: 1024, height: 768 },
  standard: { width: 1280, height: 900 },
  large: { width: 1600, height: 1000 },
};

const STATE_FILE = path.join(app.getPath("userData"), "window-state.json");

function loadWindowState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveWindowState(partial) {
  const next = { ...loadWindowState(), ...partial };
  try {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(next));
  } catch {
    // Best-effort — losing remembered window geometry isn't worth surfacing an error for.
  }
}

function matchPreset(width, height) {
  const match = Object.entries(WINDOW_SIZE_PRESETS).find(
    ([, size]) => size.width === width && size.height === height
  );
  return match ? match[0] : null;
}

function getDisplayState() {
  const [width, height] = mainWindow.getSize();
  return {
    fullscreen: mainWindow.isFullScreen(),
    preset: matchPreset(width, height),
  };
}

/**
 * Expo's static web export emits absolute paths (`/favicon.ico`,
 * `/_expo/static/...`), which resolve to the filesystem root — not the
 * export folder — under Electron's `file://` protocol. A tiny loopback-only
 * static server sidesteps that instead of post-processing every absolute
 * path Expo happens to emit. Also serves as the SPA's catch-all: any
 * unmatched path falls back to index.html.
 */
function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const requestedPath = decodeURIComponent(req.url.split("?")[0]);
      const resolved = path.normalize(path.join(DIST_DIR, requestedPath));

      if (!resolved.startsWith(DIST_DIR)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      const filePath = resolved.endsWith(path.sep) ? path.join(resolved, "index.html") : resolved;

      fs.readFile(filePath, (err, data) => {
        if (err) {
          fs.readFile(path.join(DIST_DIR, "index.html"), (err2, indexData) => {
            if (err2) {
              res.writeHead(404);
              res.end("Not found");
              return;
            }
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(indexData);
          });
          return;
        }
        const ext = path.extname(filePath);
        res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
        res.end(data);
      });
    });
    server.listen(PORT, "127.0.0.1", () => resolve(server));
    server.on("error", reject);
  });
}

let mainWindow;
let resizeSaveTimer;

async function createWindow() {
  await startServer();

  const saved = loadWindowState();

  // Default (first launch, or after a saved size no longer fits): the
  // "standard" preset, capped to the actual display so it still fits on a
  // smaller screen.
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const defaultWidth = Math.min(WINDOW_SIZE_PRESETS.standard.width, Math.round(screenWidth * 0.9));
  const defaultHeight = Math.min(WINDOW_SIZE_PRESETS.standard.height, Math.round(screenHeight * 0.9));

  mainWindow = new BrowserWindow({
    width: saved.width ?? defaultWidth,
    height: saved.height ?? defaultHeight,
    minWidth: 800,
    minHeight: 600,
    title: "VALORANT Design Hub",
    icon: path.join(__dirname, "..", "assets", "icon.png"),
    autoHideMenuBar: true,
    fullscreen: saved.fullscreen ?? false,
    backgroundColor: "#0F1923",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // F11 toggles fullscreen (standard convention), independent of the
  // Settings sheet's own fullscreen toggle — both end up calling
  // setFullScreen, and the 'enter/leave-full-screen' listeners below persist
  // whichever one fired.
  mainWindow.webContents.on("before-input-event", (_event, input) => {
    if (input.type === "keyDown" && input.key === "F11") {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  mainWindow.on("resize", () => {
    if (mainWindow.isFullScreen()) return;
    clearTimeout(resizeSaveTimer);
    resizeSaveTimer = setTimeout(() => {
      const [width, height] = mainWindow.getSize();
      saveWindowState({ width, height });
    }, 300);
  });

  mainWindow.on("enter-full-screen", () => saveWindowState({ fullscreen: true }));
  mainWindow.on("leave-full-screen", () => saveWindowState({ fullscreen: false }));

  mainWindow.loadURL(`http://127.0.0.1:${PORT}`);
}

ipcMain.handle("display:get-state", () => getDisplayState());

ipcMain.handle("display:set-fullscreen", (_event, value) => {
  mainWindow.setFullScreen(Boolean(value));
  return getDisplayState();
});

ipcMain.handle("display:set-size", (_event, presetId) => {
  const size = WINDOW_SIZE_PRESETS[presetId];
  if (!size) return getDisplayState();
  if (mainWindow.isFullScreen()) mainWindow.setFullScreen(false);
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow.setSize(Math.min(size.width, screenWidth), Math.min(size.height, screenHeight));
  mainWindow.center();
  saveWindowState({ width: size.width, height: size.height });
  return getDisplayState();
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
