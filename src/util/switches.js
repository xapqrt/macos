const { app } = require("electron");

function applySwitches(settings) {
  if (settings.unlimited_fps) {
    app.commandLine.appendSwitch("disable-frame-rate-limit");
    app.commandLine.appendSwitch("disable-gpu-vsync");
  }
  if (settings.in_process_gpu) {
    app.commandLine.appendSwitch("in-process-gpu");
  }

  app.commandLine.appendSwitch("high-dpi-support", "1");
  // Both spellings — Dawn used old, Chromium 89 supports new
  app.commandLine.appendSwitch("ignore-gpu-blacklist");
  app.commandLine.appendSwitch("ignore-gpu-blocklist");
  app.commandLine.appendSwitch("enable-gpu-rasterization");
  app.commandLine.appendSwitch("enable-zero-copy");
  app.commandLine.appendSwitch("disable-software-rasterizer");
  app.commandLine.appendSwitch("enable-native-gpu-memory-buffers");

  // Extreme GPU — force Chrome to use full GPU memory
  app.commandLine.appendSwitch("force-gpu-mem-available-mb", "4096");
  app.commandLine.appendSwitch("enable-webgl-image-chromium");
  app.commandLine.appendSwitch("force-color-profile", "srgb");
  app.commandLine.appendSwitch("canvas-msaa-sample-count", "0");
  app.commandLine.appendSwitch("disable-2d-canvas-clip-aa");

  app.allowRendererProcessReuse = true;
}

module.exports = {
  applySwitches,
};
