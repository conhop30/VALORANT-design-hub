const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  getDisplayState: () => ipcRenderer.invoke("display:get-state"),
  setDisplayMode: (mode) => ipcRenderer.invoke("display:set-mode", mode),
});
