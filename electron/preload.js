const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  getDisplayState: () => ipcRenderer.invoke("display:get-state"),
  setFullscreen: (value) => ipcRenderer.invoke("display:set-fullscreen", value),
  setWindowSize: (presetId) => ipcRenderer.invoke("display:set-size", presetId),
});
