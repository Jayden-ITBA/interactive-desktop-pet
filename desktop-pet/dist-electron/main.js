import { BrowserWindow, app, ipcMain } from "electron";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";
//#region electron/main.ts
var __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
var VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
var MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
var RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
var win;
function createWindow() {
	win = new BrowserWindow({
		width: 800,
		height: 600,
		transparent: true,
		frame: false,
		alwaysOnTop: true,
		hasShadow: false,
		resizable: true,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false
		}
	});
	win.maximize();
	win.setIgnoreMouseEvents(true, { forward: true });
	ipcMain.on("set-ignore-mouse-events", (event, ignore, options) => {
		const win = BrowserWindow.fromWebContents(event.sender);
		if (win) win.setIgnoreMouseEvents(ignore, options);
	});
	ipcMain.handle("save-pet-assets", async (event, petId, states) => {
		try {
			const petDir = path.join(app.getPath("userData"), "pets", petId);
			await fs.mkdir(petDir, { recursive: true });
			for (const [state, dataUrl] of Object.entries(states)) {
				const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
				if (matches && matches.length === 3) {
					const buffer = Buffer.from(matches[2], "base64");
					const ext = matches[1] === "image/jpeg" ? "jpg" : matches[1] === "image/webp" ? "webp" : "png";
					await fs.writeFile(path.join(petDir, `${state}.${ext}`), buffer);
				}
			}
			return true;
		} catch (e) {
			console.error("Failed to save pet assets", e);
			return false;
		}
	});
	if (VITE_DEV_SERVER_URL) win.loadURL(VITE_DEV_SERVER_URL);
	else win.loadFile(path.join(RENDERER_DIST, "index.html"));
}
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.whenReady().then(createWindow);
//#endregion
export { MAIN_DIST, RENDERER_DIST, VITE_DEV_SERVER_URL };
