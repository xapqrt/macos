const { app, clipboard, screen, globalShortcut } = require("electron");
const Store = require("electron-store");
const fs = require("fs-extra");
const path = require("path");
const store = new Store();

const registerShortcuts = (window) => {
  const _unregisterAll = () => globalShortcut.unregisterAll();
  window.on("closed", _unregisterAll);
  const reg = (accelerator, action) => globalShortcut.register(accelerator, () => {
    if (window.isDestroyed()) { _unregisterAll(); return; }
    action();
  });
  reg("Escape", () =>
    window.webContents.executeJavaScript("document.exitPointerLock()")
  );
  reg("F2", () => {
    const { x, y, width, height } = screen.getPrimaryDisplay().bounds;
    const screenshotsFolder = path.join(app.getPath("documents"), "macos-client", "gallery", "screenshots");
    if (!fs.existsSync(screenshotsFolder)) fs.mkdirSync(screenshotsFolder, { recursive: true });

    window.capturePage({ x, y, width, height }).then((image) => {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const timestamp = `macos-${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}-${pad(now.getMinutes())}`;
      const filePath = path.join(screenshotsFolder, `${timestamp}.png`);

      fs.writeFileSync(filePath, image.toPNG());
      clipboard.writeImage(image);
      window.webContents.send("notification", {
        message: "Screenshot saved to gallery and copied to clipboard",
        icon: image.toDataURL(),
      });
    });
  });
  reg("F4", () => {
    window.loadURL(store.get("settings").base_url);
  });
  reg("F5", () => {
    window.reload();
  });
  reg("F6", () => {
    window.loadURL(clipboard.readText());
  });
  reg("F7", () => clipboard.writeText(window.webContents.getURL()));
  reg("F11", () => window.setFullScreen(!window.isFullScreen()));
  reg("F12", () => window.webContents.toggleDevTools());
  reg("CmdOrCtrl+Shift+I", () => window.webContents.toggleDevTools());
  reg("CmdOrCtrl+Shift+C", () => window.webContents.toggleDevTools());
  reg("CmdOrCtrl+Shift+J", () => window.webContents.toggleDevTools());
  reg("Alt+F4", () => app.quit());
};

module.exports = { registerShortcuts };
