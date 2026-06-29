const { app } = require("electron");

app.commandLine.appendSwitch("js-flags", "--max-old-space-size=1024 --turbo-fast-api-calls");

const { initSplash } = require("./windows/splash");

app.on("ready", async () => {
  initSplash();
});

app.on("window-all-closed", () => app.quit());