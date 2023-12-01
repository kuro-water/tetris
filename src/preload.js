const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    readJson: (jsonPath) => ipcRenderer.invoke('readJson', jsonPath),
    writeJson: (jsonPath, data) => ipcRenderer.invoke('writeJson', jsonPath, data),
})
contextBridge.exposeInMainWorld("I_MINO", 0);
