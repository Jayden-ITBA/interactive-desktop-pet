import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  setIgnoreMouseEvents: (ignore: boolean, options?: { forward: boolean }) => 
    ipcRenderer.send('set-ignore-mouse-events', ignore, options),
  savePetAssets: (petId: string, states: Record<string, string>) =>
    ipcRenderer.invoke('save-pet-assets', petId, states)
});
