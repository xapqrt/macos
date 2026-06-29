const { app } = require("electron");

// No custom V8 flags — V8 8.8 default heuristics work best for gaming

const { initSplash } = require("./windows/splash");

app.on("ready", async () => {
  initSplash();
});

app.on("window-all-closed", () => app.quit());