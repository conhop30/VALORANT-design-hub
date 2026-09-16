const { app, BrowserWindow, screen } = require("electron");
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

async function createWindow() {
  await startServer();

  // Windowed fallback size (used once the user drops out of fullscreen) —
  // sized off the actual display instead of a fixed 1280x900, so it still
  // fits sensibly on a smaller screen.
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const width = Math.min(1280, Math.round(screenWidth * 0.9));
  const height = Math.min(900, Math.round(screenHeight * 0.9));

  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 800,
    minHeight: 600,
    title: "VALORANT Design Hub",
    icon: path.join(__dirname, "..", "assets", "icon.png"),
    autoHideMenuBar: true,
    fullscreen: true,
    backgroundColor: "#0F1923",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // F11 toggles fullscreen (standard convention) — the only way out once
  // launched fullscreen, since fullscreen mode hides the native title bar
  // (and its minimize/maximize/close controls) entirely.
  mainWindow.webContents.on("before-input-event", (_event, input) => {
    if (input.type === "keyDown" && input.key === "F11") {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  mainWindow.loadURL(`http://127.0.0.1:${PORT}`);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
