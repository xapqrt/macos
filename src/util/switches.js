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
  app.commandLine.appendSwitch("ignore-gpu-blacklist");
  app.commandLine.appendSwitch("enable-gpu-rasterization");
  app.commandLine.appendSwitch("enable-zero-copy");

  app.commandLine.appendSwitch("disable-software-rasterizer");
  app.commandLine.appendSwitch("enable-native-gpu-memory-buffers");
  app.commandLine.appendSwitch("enable-quic");
  app.commandLine.appendSwitch("enable-tcp-fast-open");
  app.commandLine.appendSwitch("disable-background-timer-throttling");
  app.commandLine.appendSwitch("disable-renderer-backgrounding");
  app.commandLine.appendSwitch("enable-features", "ParallelDownloading");

  // Extreme GPU — force Chrome to use full GPU memory
  app.commandLine.appendSwitch("force-gpu-mem-available-mb", "4096");
  app.commandLine.appendSwitch("enable-webgl-image-chromium");
  app.commandLine.appendSwitch("force-color-profile", "srgb");
  app.commandLine.appendSwitch("canvas-msaa-sample-count", "0");
  app.commandLine.appendSwitch("disable-2d-canvas-clip-aa");

  // Disable unnecessary Chrome features — saves CPU and memory
  app.commandLine.appendSwitch("disable-features", [
    "ChromeWhatsNewUI",
    "ChromeWhatsNewOnFOA",
    "EnableExtensionActivityLogging",
    "ShowAutofillSignatures",
    "PasswordGeneration",
    "AutofillServerCommunication",
    "MediaRouter",
    "TranslateUI",
    "LanguageDetection",
    "OptimizationGuideModelDownloading",
    "FeedLoadingPlaceholder",
    "InterestFeedContentSuggestions",
    "NotificationIndicator",
    "RendererPriorityManagement",
  ].join(","));

  app.allowRendererProcessReuse = true;
}

module.exports = {
  applySwitches,
};
