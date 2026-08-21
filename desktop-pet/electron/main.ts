import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: true, // Allow resize if needed, but for MVP keep it simple
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Make the window ignore mouse events where it's transparent, 
  // but catch them where we render something (like the pet)
  // Actually, standard frameless transparent windows do capture events by default.
  // To allow click-through on empty areas, we can use win.setIgnoreMouseEvents
  // but it's tricky to toggle dynamically for MVP. We will just use standard transparent window.
  // A standard transparent window captures mouse everywhere.
  // For a desktop pet, usually the window itself IS the pet, or it's a full screen click-through.
  // We will make the window full screen and set ignoreMouseEvents(true, {forward: true}) 
  // then IPC from renderer can tell main process when hovering the pet.
  // For simplicity right now, we will just make a smaller window that the user can drag around,
  // Or we make it full screen. Let's start with a full screen transparent window that ignores mouse
  // EXCEPT when the mouse is over the pet. 
  
  win.maximize(); // Make it full screen
  win.setIgnoreMouseEvents(true, { forward: true });

  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.setIgnoreMouseEvents(ignore, options);
    }
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);
