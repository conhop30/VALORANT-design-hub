const { app, BrowserWindow, screen, ipcMain, shell } = require("electron");
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

// Kept in sync with SCREEN_SIZE_OPTIONS in src/platform/useElectronDisplay.ts —
// the renderer only ever sends a mode id over IPC, never raw pixels.
// "fullscreenWindow" and "fullscreen" aren't sized presets — they're handled
// as their own modes below (OS maximize vs. true setFullScreen).
const SIZE_PRESETS = {
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

/**
 * Single source of truth for "what display mode are we in", derived from
 * live window state rather than tracked separately — avoids the mode and
 * the actual window state ever drifting out of sync.
 */
function getDisplayMode() {
  if (mainWindow.isFullScreen()) return "fullscreen";
  if (mainWindow.isMaximized()) return "fullscreenWindow";
  const [width, height] = mainWindow.getSize();
  const match = Object.entries(SIZE_PRESETS).find(
    ([, size]) => size.width === width && size.height === height
  );
  return match ? match[0] : null;
}

function getDisplayState() {
  return { mode: getDisplayMode() };
}

/** Persists the current mode, plus the window's last non-maximized/fullscreen
 * size so a later "compact"/"standard"/"large" or plain drag-resize survives
 * a relaunch even if the window is currently maximized or fullscreen. */
function persistDisplayState() {
  const mode = getDisplayMode();
  const partial = { mode };
  if (mode !== "fullscreen" && !mainWindow.isMaximized()) {
    const [width, height] = mainWindow.getSize();
    partial.width = width;
    partial.height = height;
  }
  saveWindowState(partial);
}

async function createWindow() {
  await startServer();

  const saved = loadWindowState();

  // Default (first launch, or after a saved size no longer fits): the
  // "standard" preset, capped to the actual display so it still fits on a
  // smaller screen.
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const defaultWidth = Math.min(SIZE_PRESETS.standard.width, Math.round(screenWidth * 0.9));
  const defaultHeight = Math.min(SIZE_PRESETS.standard.height, Math.round(screenHeight * 0.9));

  mainWindow = new BrowserWindow({
    width: saved.width ?? defaultWidth,
    height: saved.height ?? defaultHeight,
    minWidth: 800,
    minHeight: 600,
    title: "VALORANT Design Hub",
    icon: path.join(__dirname, "..", "assets", "icon.png"),
    autoHideMenuBar: true,
    fullscreen: saved.mode === "fullscreen",
    backgroundColor: "#0F1923",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.on("page-title-updated", (event) => event.preventDefault());

  // Links out of the app (e.g. the update download) open in the user's real
  // browser, never in a new app window; only https URLs are ever passed on.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) shell.openExternal(url);
    return { action: "deny" };
  });

  if (saved.mode === "fullscreenWindow") {
    mainWindow.maximize();
  }

  // F11 and Escape both exit/toggle fullscreen — standard convention, and
  // Escape in particular matters here: true fullscreen hides all OS window
  // chrome (no title bar, no close/minimize buttons), so without a keyboard
  // escape hatch a user who doesn't know F11 would be stuck relying on the
  // in-app Settings sheet or exit button to get back to a normal window.
  mainWindow.webContents.on("before-input-event", (_event, input) => {
    if (input.type !== "keyDown") return;
    if (input.key === "F11") {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    } else if (input.key === "Escape" && mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
    }
  });

  mainWindow.on("resize", () => {
    if (mainWindow.isFullScreen() || mainWindow.isMaximized()) return;
    clearTimeout(resizeSaveTimer);
    resizeSaveTimer = setTimeout(persistDisplayState, 300);
  });

  mainWindow.on("enter-full-screen", persistDisplayState);
  mainWindow.on("leave-full-screen", persistDisplayState);
  mainWindow.on("maximize", persistDisplayState);
  mainWindow.on("unmaximize", persistDisplayState);

  mainWindow.loadURL(`http://127.0.0.1:${PORT}`);
}

ipcMain.handle("display:get-state", () => getDisplayState());

ipcMain.handle("display:set-mode", (_event, mode) => {
  if (mode === "fullscreen") {
    mainWindow.setFullScreen(true);
  } else if (mode === "fullscreenWindow") {
    if (mainWindow.isFullScreen()) mainWindow.setFullScreen(false);
    mainWindow.maximize();
  } else if (SIZE_PRESETS[mode]) {
    if (mainWindow.isFullScreen()) mainWindow.setFullScreen(false);
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    const size = SIZE_PRESETS[mode];
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow.setSize(Math.min(size.width, screenWidth), Math.min(size.height, screenHeight));
    mainWindow.center();
  }
  persistDisplayState();
  return getDisplayState();
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
