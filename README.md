# YVPlayer — Custom Player for YouTube Videos Without YouTube Elements &amp; Branding 🎥

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-yellow.svg)](yvPlayer.js)
[![CSS3](https://img.shields.io/badge/CSS3-Responsive-green.svg)](yvPlayer.css)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-yvplayer.pages.dev-orange.svg)](https://yvplayer.pages.dev)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Demo_Live-purple.svg)](https://thevikasgurjar.github.io/YVplayer/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/thevikasgurjar/YVplayer/pulls)

A modern, cinema-grade, distraction-free HTML5 video player overlay designed specifically for **YouTube**. **YVPlayer** is the premier custom player for YouTube videos without YouTube elements, branding, watermarks, or suggested videos. It completely masks and strips native YouTube clutter (title bars, channel watermarks, recommended videos, and end-screen cards) while delivering high-end features inspired by **Video.js 10**: interactive storyboard scrubbing, custom multi-themes, line-by-line customizable captions, connected floating Picture-in-Picture with volume control, and open-source stream proxy integration. Default showcase video: `LXb3EKWsInQ`.

---

### 🌐 Live Interactive Demos & Documentation

- ⚡ **Cloudflare Pages (`demo` branch):** [https://yvplayer.pages.dev](https://yvplayer.pages.dev)
- 🐙 **GitHub Pages (`gh-pages` branch):** [https://thevikasgurjar.github.io/YVplayer/](https://thevikasgurjar.github.io/YVplayer/)

> 💡 *Note: The `main` branch contains strictly the core standalone player library files. The interactive showcase website source is maintained on the [`demo`](https://github.com/thevikasgurjar/YVplayer/tree/demo) and [`gh-pages`](https://github.com/thevikasgurjar/YVplayer/tree/gh-pages) branches where community users can test features and submit edit requests.*

---

## ✨ Features

- 🚫 **Zero Distractions & Zero Branding**: Completely hides YouTube logos, watermarks, suggested videos, and overlays.
- 📱 **Dual Aspect Ratios**: Native support for standard 16:9 Cinema and 9:16 vertical YouTube Shorts.
- 🖼️ **Dual-Engine Picture-in-Picture**: Supports Document PiP (floating OS browser window) and responsive in-page floating dock.
- 🎞️ **Storyboard Scrubbing**: Real-time video thumbnail preview timeline while hovering over the seekbar.
- 💬 **Custom Captions & Subtitles**: Line-by-line subtitle rendering with configurable font styles and backdrop opacity.
- 🎨 **Multi-Theme Accent System**: 6 built-in themes (Classic Red, City Cyan, Fantasy Purple, Forest Emerald, Amber Gold, Minimal White) plus custom hex codes.
- ⚡ **Open-Source Stream Proxies (Zero Local Backend)**: Built-in client resolution for **Piped API**, **Invidious API**, and **Cobalt API** with automatic failover.
- 🔁 **Loop Control**: Settings drawer toggle and API control for seamless repeat playback.
- ⌨️ **Keyboard Gestures**: Rich hotkeys for seeking, volume, playback speed, fullscreen, and PiP.
- 🪶 **Zero External Runtime Dependencies**: Pure Vanilla JavaScript and CSS.

---

## 🚀 Quick Start

### 1. Delivery via jsDelivr CDN

Include the stylesheet and script in your HTML:

```html
<!-- Tabler Icons (Optional for UI icons) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/thevikasgurjar/YVplayer@main/tabler-icons.min.css">

<!-- YVPlayer CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/thevikasgurjar/YVplayer@main/yvPlayer.css">

<!-- YVPlayer JS -->
<script src="https://cdn.jsdelivr.net/gh/thevikasgurjar/YVplayer@main/yvPlayer.js"></script>
```

### 2. Basic Initialization

```html
<div id="my-player" style="width: 100%; max-width: 900px; margin: 0 auto;"></div>

<script>
  YVPlayer.init("my-player", {
    defaultId: "M7lc1UVf-VE",
    theme: "red",
    autoplay: false,
    pipMode: "dual"
  });
</script>
```

### 3. Open-Source Stream Proxy Setup (Zero Python Backend)

```javascript
YVPlayer.init("my-player", {
  defaultId: "M7lc1UVf-VE",
  proxyProvider: "piped",                          // "piped" | "invidious" | "cobalt" | "local"
  pipedInstance: "https://pipedapi.kavin.rocks",   // Optional custom instance
  pipMode: "dual"
});
```

---

## 🛠️ API Reference

| Method | Parameters | Description |
| :--- | :--- | :--- |
| `YVPlayer.init(containerId, options)` | `containerId`, `options` | Initializes the player in the specified container element. |
| `YVPlayer.changeVideo(containerId, videoId, opts)` | `containerId`, `videoId`, `opts` | Seamlessly transitions to a new video or Shorts without rebuilding the player. |
| `YVPlayer.play(containerId)` | `containerId` | Starts playback. |
| `YVPlayer.pause(containerId)` | `containerId` | Pauses playback. |
| `YVPlayer.togglePiP(containerId)` | `containerId` | Toggles Picture-in-Picture mode. |
| `YVPlayer.setTheme(containerId, hexColor, name)` | `containerId`, `hexColor`, `name` | Updates CSS variable accent colors in real time. |
| `YVPlayer.setLoop(containerId, enabled)` | `containerId`, `enabled` | Enables or disables repeat looping. |
| `YVPlayer.extractVideoId(input)` | `input` | Parses any YouTube URL, Shorts URL, or embed string and returns the 11-char ID. |
| `YVPlayer.resolveStreamUrl(videoId, options)` | `videoId`, `options` | Resolves direct streaming media URLs via Piped, Invidious, Cobalt, or local proxy. |
| `YVPlayer.destroy(containerId)` | `containerId` | Cleans up intervals, listeners, and DOM elements. |

---

## 🌐 Demo Websites & Community Contributions

- **Cloudflare Pages (`demo` branch)**: [https://yvplayer.pages.dev](https://yvplayer.pages.dev)
- **GitHub Pages (`gh-pages` branch)**: [https://thevikasgurjar.github.io/YVplayer/](https://thevikasgurjar.github.io/YVplayer/)
- **Demo Source & Edit Requests**: To contribute changes or enhancements to the demo site, please checkout either the [`demo`](https://github.com/thevikasgurjar/YVplayer/tree/demo) or [`gh-pages`](https://github.com/thevikasgurjar/YVplayer/tree/gh-pages) branch and submit a Pull Request!

---

## 📄 License

Distributed under the [MIT License](LICENSE).
