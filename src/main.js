const { app } = require("electron");

app.commandLine.appendSwitch("js-flags", "--max-old-space-size=768 --compact-on-empty --no-lazy --always-opt --turbo-fast-api-calls --turbo-prophet --min-heap-size=256 --max-inlined-bytecode-size=100000 --max-inlined-bytecode-size-cumulative=1000000");

const { initSplash } = require("./windows/splash");

app.on("ready", async () => {
  initSplash();
});

app.on("window-all-closed", () => app.quit());