const { app, BrowserWindow, ipcMain } = require("electron");
const { initGame } = require("./game");
const path = require("path");

let splashWindow;

const createWindow = () => {
  splashWindow = new BrowserWindow({
    icon: path.join(__dirname, "../assets/img/icon.png"),
    width: 500,
    height: 500,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "../preload/splash.js"),
    },
  });

  splashWindow.loadFile(path.join(__dirname, "../assets/html/splash.html"));
  splashWindow.once("ready-to-show", () => {
    splashWindow.show();
    splashWindow.webContents.send("splash-ready");
    handleClose();
  });

  splashWindow.on("closed", () => {
    ipcMain.removeAllListeners("quit-and-install");
    splashWindow = null;
  });
};

ipcMain.on("quit-and-install", () =>
  app.quit()
);

const handleClose = () =>
  setTimeout(() => {
    if (splashWindow) {
      initGame();
      splashWindow.close();
    }
  }, 500);

const initSplash = createWindow;

module.exports = { initSplash };
