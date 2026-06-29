const { app } = require("electron");

app.commandLine.appendSwitch("js-flags", "--max-old-space-size=768 --compact-on-empty");

const { initSplash } = require("./windows/splash");

app.on("ready", async () => {
  initSplash();
});

app.on("window-all-closed", () => app.quit());