# macos client

A performance-optimized Electron client for Kirka.io, forked from [Dawn Client](https://github.com/zVipexx/dawn-client) by zVipexx.

Built for **maximum stable FPS, minimal input latency, and zero micro-stuttering** on macOS. Runs **native arm64** on Apple Silicon (M1–M4) — no Rosetta 2 translation, no double-JIT penalty.

---

## Changes vs Dawn Client

### Architecture

| Area | Dawn Client | macos client |
|------|-------------|--------------|
| Electron | 10.4.7 (x64 only, Rosetta 2 on Apple Silicon) | **12.2.3** (native arm64 on M1–M4, zero translation overhead) |
| Chromium | 85 | **89** — improved WebGL driver stack, fewer draw-call overhead |
| V8 | 8.5 | **8.8** — better JIT inline caching, faster property access in hot paths |
| Node.js | 12.16 | **14.16** — better performance, stable diagnostics |
| Binary format | Mach-O x86_64 | **Mach-O arm64** — executes directly on Apple Silicon performance cores |
| Auto-updater | `electron-updater` with GitHub check on launch (blocking) | **Removed** — instant startup, no network fetch |
| electron-updater package | Present as dependency | **Removed** from dependencies |

### Performance (WebGL Hot Path)

| Area | Dawn Client | macos client |
|------|-------------|--------------|
| Matrix dedup data structure | `new Set()` allocated once per context | `Object.create(null)` — faster has/add/delete for small sets |
| Frame tracking | `seenMatricesThisFrame.clear()` | `_clearSeen()` — deletes individual keys, avoids full reallocate for <64 entries |
| Config fallback objects | Created inline `{ size:, offsetX:, ... }` on every weapon matrix call | Pre-hoisted constants `_cfgFallback`, `_globalFallback`, `_armFallback` — zero allocs per frame |
| Hex color parsing | `hex.substring()` + `parseInt()` on every frame (3 new strings) | `_hexCache` Map — parsed once, cached forever |
| Matched-weapon dedup | `[...badgesElem.children].some(...)` — new array per badge check | Indexed `for` loop — zero allocation |
| `forEach` on badge iteration | `customs.badges.forEach(...)` — callback per badge | Indexed `for` loop — direct iteration |
| In-flight deduplication | None — multiple simultaneous `fetch()` for same URL | `inflightFetches` Map — reuses in-flight promise |

### Forced Layout Elimination

| Area | Dawn Client | macos client |
|------|-------------|--------------|
| Menu position tracking | `getComputedStyle(menu).transform` + regex parse every drag/resize start | `menu._posX` / `menu._posY` — tracked in JS variables, never reads computed style |
| Menu dimensions | `menu.offsetWidth` / `menu.offsetHeight` read on every resize mousedown + mouseup | Cached in `_menuW` / `_menuH` at mousedown, written back on mouseup — single layout read |
| Resize mousemove handler | `getMenuPosition()` called on every pixel (forced layout + string parse) | Only writes `style.width/height/transform` — no reads at all |
| Window resize handler | 4x `menu.offsetWidth/Height` reads + `getMenuPosition()` + `centerMenu()` | 2x reads cached in local vars, position from `menu._posX/Y` |
| Checkbox toggle animation | `transition: left 0.3s` — triggers layout every frame | `transition: transform 0.3s` + `translateX()` — pure compositing |
| Server list MutationObserver | `document.querySelectorAll(".server")` on every mutation (full DOM query of all servers) | Iterates only `mutation.addedNodes` / `removedNodes` — processes exactly what changed |

### Image Decode Optimization

| Area | Dawn Client | macos client |
|------|-------------|--------------|
| Badge images | `document.createElement("img")` + `.src =` on main thread (decode blocks) | `img.decoding = "async"` + `img.loading = "lazy"` — decode off main thread |
| Lobby news images | No optimization | `decoding = "async"`, `loading = "lazy"` |
| Badge preview in menu | No optimization | `decoding = "async"` |
| Map backgrounds | No lazy loading | `IntersectionObserver` with 200px rootMargin (already in Dawn) |

### Render Pipeline

| Area | Dawn Client | macos client |
|------|-------------|--------------|
| Observer callbacks | Run synchronously in mutation handler | `queueStyleWrite()` — all DOM writes batched to RAF flush |
| RAF flush | No batching | Single RAF per frame, all style writes consolidated |
| CSS will-change | Not present on `.menu` | `will-change: transform` on `.menu` + `contain: layout style paint` (inherited from Dawn) |
| CSS composited layers | No hints | `translateZ(0)` on `#game`, `will-change` on interface, `contain: paint` on kill-feed (inherited from Dawn) |

### Startup & Resource Loading

| Area | Dawn Client | macos client |
|------|-------------|--------------|
| Auto-updater | `checkForUpdates()` on every launch — GitHub API fetch blocks startup | Removed entirely — instant splash → game transition |
| Preconnect hints | None | `raw.githubusercontent.com`, `juice.irrvlo.xyz`, `api.kirka.io` |
| Menu DOM | Built on `DOMContentLoaded` (1292-line HTML + 2747-line CSS file reads) | Built on first keybind press — deferred until needed |
| Window resize handler | No debounce | 100ms debounce |
| cachedFetch | localStorage only (disk read every tab switch) | In-memory `Map` checked before localStorage — no disk reads for repeated access |

### Game Mode & macOS Integration

| Area | Dawn Client | macos client |
|------|-------------|--------------|
| `LSApplicationCategoryType` | Not set | `public.app-category.games` |
| `LSSupportsGameMode` | Not set | `true` — macOS Game Mode API on supported versions |
| `backgroundThrottling` | Default (`true`) | `false` — timers/animations never throttle in background |
| Native fullscreen | Default | Always `true` on `ready-to-show` |
| Product name | "dawn-client" | "macos client" |

### GPU & Chromium Flags

| Flag | Dawn Client | macos client |
|------|-------------|--------------|
| `force-gpu-mem-available-mb` | Not set | `4096` — prevents texture thrashing on Rosetta |
| `enable-webgl-image-chromium` | Not set | Enabled |
| `force-color-profile` | Not set | `srgb` |
| `canvas-msaa-sample-count` | Not set | `0` — no MSAA, saves GPU memory |
| `disable-2d-canvas-clip-aa` | Not set | Enabled |
| `--optimize-for-size` | Not set | Added to V8 flags |
| `--optimize-for-max-heap` | Not set | Added to V8 flags |

### Disabled Chrome Features

11 features disabled to free CPU/memory:
`MediaRouter`, `TranslateUI`, `LanguageDetection`, `PasswordGeneration`,
`AutofillServerCommunication`, `AutofillMembershipPhp`, `InterestFeedContentSuggestions`,
`InterestFeed`, `NotificationIndicator`, `RendererPriorityManagement`,
`TranslateGoogletranslateIntegration`

## Keybind Fixes

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Right Shift menu flicker | `window.load` listener never fires (already fired before menu init); menu shown before position applied | Position set synchronously after DOM build; `e.preventDefault()` added; 250ms debounce prevents double-fire |

## Community Content Fixes

| Content | Issue | Fix |
|---------|-------|-----|
| CSS themes | `settings.css_link` never updated in renderer's in-memory settings (whitelist didn't include it) | All `juice-settings-changed` events now update `settings[setting]` unconditionally |
| Kill Icons | `applyKillIcon()` didn't persist via IPC — lost on restart | Added `ipcRenderer.send("update-setting", "killicon_link", url)` |
| Crosshairs | localStorage only, no IPC persistence | Added `ipcRenderer.send("update-setting", "crosshair_url", url)` |
| Textures | localStorage only, no IPC persistence | Added `ipcRenderer.send("update-setting", "texture_url", url)` |
| Injected styles | Game SPA navigation could remove Dawn's `<style>` elements | MutationObserver re-injects `#juice-styles-theme` and `#juice-styles-ui-features` if removed |

## Thermal & Performance

| Setting | Before | After |
|---------|--------|-------|
| `backgroundThrottling` | `false` — RAF runs at full speed even when minimized | `true` (default) — Chromium throttles to 1fps when hidden, saves battery/heat |
| Electron native module | `electron-localshortcut` (C++ addon, arm64 rebuild required) | Removed, replaced with built-in `globalShortcut`

## Prerequisites

- macOS 10.13+ (Apple Silicon via Rosetta 2)
- Node.js 14+ (for building)

## Build

```bash
npm install
npm run build
```

Output: `build/dawn-client-setup-mac-1.1.0.dmg` (native arm64)

## Credits

Built on top of [Dawn Client](https://github.com/zVipexx/dawn-client) by zVipexx.
