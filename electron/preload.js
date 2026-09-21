const { contextBridge, ipcRenderer } = require('electron')

// Expose secure API to renderer (React)
contextBridge.exposeInMainWorld('electronAPI', {
  // Fullscreen controls
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
  setFullscreen: (flag) => ipcRenderer.invoke('set-fullscreen', flag),

  // App info
  getVersion: () => ipcRenderer.invoke('get-version'),
  getPlatform: () => process.platform,

  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),

  // Auto-updater events
  onUpdateAvailable: (callback) =>
    ipcRenderer.on('update-available', (_, info) => callback(info)),
  onUpdateDownloaded: (callback) =>
    ipcRenderer.on('update-downloaded', (_, info) => callback(info)),
  onDownloadProgress: (callback) =>
    ipcRenderer.on('download-progress', (_, progress) => callback(progress)),
  installUpdate: () => ipcRenderer.invoke('install-update'),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
})
