const { app } = require("electron");

app.commandLine.appendSwitch("js-flags", "--max-old-space-size=1024 --compact-on-empty --turbo-fast-api-calls --turbo-prophet");

const { initSplash } = require("./windows/splash");

app.on("ready", async () => {
  initSplash();
});

app.on("window-all-closed", () => app.quit());