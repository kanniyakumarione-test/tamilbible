import { app, BrowserWindow, Menu, screen, powerSaveBlocker, dialog } from 'electron';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the local backend runs on a specific port and state dir
process.env.PORT = process.env.PORT || '8787';
process.env.STATE_DIR = app.getPath('userData');

// Import and start the backend/server logic seamlessly
import './backend/index.mjs';

let mainWindow;

// Prevent the computer from going to sleep while the app is running
let powerBlockerId = 0;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Tamil Bible Premium",
    icon: path.join(__dirname, 'dist/logo.png'),
    autoHideMenuBar: true, // Hides the default Electron menu (File, Edit, View, etc.)
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Start sleep block
  powerBlockerId = powerSaveBlocker.start('prevent-display-sleep');

  // Give the server a tiny fraction of a second to initialize
  setTimeout(() => {
    mainWindow.loadURL(`http://localhost:${process.env.PORT}`);
  }, 500);

  // Handle popups (like "Main Display" or "Stage Display") to open in fullscreen on an external monitor if available
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('/presentation/') || url.includes('/stage/') || url.includes('presentation')) {
      const displays = screen.getAllDisplays();
      const externalDisplay = displays.find((display) => {
        return display.bounds.x !== 0 || display.bounds.y !== 0;
      });

      let windowX = undefined;
      let windowY = undefined;
      
      // If a second projector/monitor exists, force it to open exactly on that monitor!
      if (externalDisplay) {
        windowX = externalDisplay.bounds.x + 50;
        windowY = externalDisplay.bounds.y + 50;
      }

      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          x: windowX,
          y: windowY,
          fullscreen: true,
          autoHideMenuBar: true,
          icon: path.join(__dirname, 'dist/logo.png')
        }
      };
    }
    return { action: 'allow' };
  });

  // Catch ESC in any new windows to exit fullscreen or close them
  mainWindow.webContents.on('did-create-window', (childWindow) => {
    childWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'Escape' && input.type === 'keyDown') {
        if (childWindow.isFullScreen()) {
          childWindow.setFullScreen(false);
        } else {
          childWindow.close();
        }
      }
    });
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
    if (powerSaveBlocker.isStarted(powerBlockerId)) {
      powerSaveBlocker.stop(powerBlockerId);
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  // Automatically check for updates silently in the background
  autoUpdater.checkForUpdatesAndNotify();
});

// When an update is fully downloaded, prompt the user to restart
autoUpdater.on('update-downloaded', (info) => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Ready',
    message: 'A new version of Tamil Bible Premium has been downloaded in the background. The application will restart to install the update.',
    buttons: ['Restart Now', 'Later']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
