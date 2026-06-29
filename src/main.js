const { app } = require("electron");

app.commandLine.appendSwitch("js-flags", "--max-old-space-size=768 --compact-on-empty --optimize-for-size --optimize-for-max-heap --turbo-fast-api-calls --turbo-prophet --min-heap-size=256");

const { initSplash } = require("./windows/splash");

app.on("ready", async () => {
  initSplash();
});

app.on("window-all-closed", () => app.quit());