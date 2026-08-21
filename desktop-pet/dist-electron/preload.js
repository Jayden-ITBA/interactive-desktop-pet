import { contextBridge, ipcRenderer } from "electron";
//#region electron/preload.ts
contextBridge.exposeInMainWorld("electronAPI", {
	setIgnoreMouseEvents: (ignore, options) => ipcRenderer.send("set-ignore-mouse-events", ignore, options),
	savePetAssets: (petId, states) => ipcRenderer.invoke("save-pet-assets", petId, states)
});
//#endregion
export {};
