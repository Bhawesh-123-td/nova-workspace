const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('novaDesktop', {
  getAppInfo: () => ipcRenderer.invoke('nova:app-info'),
  isDesktop: true,
});
