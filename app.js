/**
 * YVPlayer Showcase Application Logic
 * v3.7 · Cinema-Grade YouTube Engine
 */

let currentVideoId = "LXb3EKWsInQ";
let currentDrawerTab = "dropin";

const videoInput = document.getElementById("video-input");
const loadBtn = document.getElementById("load-btn");
const presetChips = document.querySelectorAll(".preset-chip");
const themeQuickBtns = document.querySelectorAll(".theme-quick-btn");
const stageCustomizeBtn = document.getElementById("stage-customize-btn");

// Drawer Code Elements
const drawerTabs = document.querySelectorAll(".code-tab");
const drawerCodeContent = document.getElementById("drawer-code-content");
const copyDrawerCodeBtn = document.getElementById("copy-drawer-code-btn");

function extractVideoId(input) {
  if (!input) return null;
  input = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  const match = input.match(/(?:v=|\/v\/|\/embed\/|\/shorts\/|\/live\/|youtu\.be\/|\/e\/)([^#&?\/]{11})/);
  return match ? match[1] : null;
}

let currentIsShorts = false;
let currentIsBackground = false;

function playVideo(id, autoPlayFlag, modeOptions) {
  if (!id) return;
  currentVideoId = id;

  let isLiveMode = false;
  let isShortsMode = false;
  let isBgMode = false;

  if (typeof modeOptions === "boolean") {
    isLiveMode = modeOptions;
  } else if (modeOptions && typeof modeOptions === "object") {
    isLiveMode = !!modeOptions.isLive;
    isShortsMode = !!modeOptions.shorts;
    isBgMode = !!modeOptions.background;
  } else {
    var raw = (videoInput && videoInput.value) || "";
    isLiveMode = raw.includes("/live/") || (id === "0sfDth4lMLc");
    isShortsMode = raw.includes("/shorts/") || (id === "YlyI2jmHEYc");
    isBgMode = raw.includes("background=true");
  }

  currentIsShorts = isShortsMode;
  currentIsBackground = isBgMode;

  // Update input field URL with proper format (Shorts as /shorts/, Live as /live/)
  if (videoInput) {
    if (isShortsMode) {
      videoInput.value = `https://www.youtube.com/shorts/${id}`;
    } else if (isLiveMode) {
      videoInput.value = `https://www.youtube.com/live/${id}`;
    } else {
      videoInput.value = `https://www.youtube.com/watch?v=${id}`;
    }
  }

  // Update preset chip active state
  presetChips.forEach(chip => {
    var chipId = chip.getAttribute("data-id");
    var chipIsShorts = chip.getAttribute("data-shorts") === "true";
    var chipIsBg = chip.getAttribute("data-background") === "true";
    var match = (chipId === id);
    if (isShortsMode) match = match && chipIsShorts;
    else if (isBgMode) match = match && chipIsBg;
    chip.classList.toggle("is-active", match);
  });

  // Stage aspect-ratio adjustment for Shorts
  const stageWrapper = document.querySelector(".player-wrapper");
  if (stageWrapper) {
    stageWrapper.classList.toggle("is-shorts-stage", isShortsMode);
  }
  const stage = document.getElementById("video1");
  if (stage) {
    stage.classList.toggle("is-shorts-stage", isShortsMode);
  }

  const player = window.YVPlayer;
  if (!player) return;

  const shouldAutoplay = isBgMode ? true : ((autoPlayFlag !== undefined) ? !!autoPlayFlag : false);

  if (player.initialized("video1")) {
    player.changeVideo("video1", id, { 
      isLive: isLiveMode,
      shorts: isShortsMode,
      background: isBgMode,
      autoplay: shouldAutoplay,
      loop: (isBgMode || isShortsMode)
    });
    if (isBgMode) {
      player.mute("video1");
      player.setVolume("video1", 0);
    }
    if (shouldAutoplay) {
      player.play("video1");
    }
    if (isBgMode) {
      player.mute("video1");
      player.setVolume("video1", 0);
    }
    updateDrawerCode();
    return;
  }

  player.init("video1", {
    defaultId: id,
    autoplay: shouldAutoplay,
    thumbnail: isBgMode ? false : true,
    isLive: isLiveMode,
    shorts: isShortsMode,
    background: isBgMode,
    theme: currentQuickTheme,
    customColor: currentQuickColor,
    loop: (isBgMode || isShortsMode) ? true : false,
    storyboard: isShortsMode ? false : true,
    pipMode: "os",
    enableHotkeys: !isBgMode,
    enableSleepTimer: true
  }).then(() => {
    if (player && player.setTheme) {
      player.setTheme("video1", currentQuickColor, currentQuickTheme);
    }
    if (isBgMode) {
      player.mute("video1");
      player.setVolume("video1", 0);
    }
    if (shouldAutoplay) {
      player.play("video1");
    }
    if (isBgMode) {
      player.mute("video1");
      player.setVolume("video1", 0);
    }
    updateDrawerCode();
  }).catch((err) => {
    console.error("Playback initialization failed:", err);
  });
}

function handlePlayRequest() {
  const raw = videoInput.value.trim();
  if (!raw) {
    videoInput.focus();
    return;
  }
  const id = extractVideoId(raw);
  if (!id) {
    alert("Please enter a valid YouTube video URL or 11-character video ID.");
    videoInput.focus();
    return;
  }
  const isLive = raw.includes("/live/") || (id === "0sfDth4lMLc");
  const isShorts = raw.includes("/shorts/") || (id === "YlyI2jmHEYc");
  const isBg = raw.includes("background=true");
  playVideo(id, true, { isLive, shorts: isShorts, background: isBg });
}

if (loadBtn) loadBtn.addEventListener("click", handlePlayRequest);
if (videoInput) {
  videoInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handlePlayRequest();
    }
  });
}

// Preset Chip Clicks
presetChips.forEach(chip => {
  chip.addEventListener("click", () => {
    const id = chip.getAttribute("data-id");
    const isLive = chip.getAttribute("data-live") === "true";
    const isShorts = chip.getAttribute("data-shorts") === "true";
    const isBg = chip.getAttribute("data-background") === "true";
    if (id) {
      playVideo(id, true, { isLive, shorts: isShorts, background: isBg });
    }
  });
});

// Live Quick Theme Switcher
let currentQuickTheme = "red";
let currentQuickColor = "#fe0001";

themeQuickBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    themeQuickBtns.forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");

    const color = btn.getAttribute("data-color");
    const themeName = btn.getAttribute("data-theme");
    currentQuickTheme = themeName || "custom";
    currentQuickColor = color || "#fe0001";

    const stage = document.getElementById("video1");
    if (stage) {
      stage.style.setProperty("--themeAccent", currentQuickColor);
      stage.style.setProperty("--sliderSeekTrackColor", currentQuickColor);
      stage.style.setProperty("--sliderThumbColor", currentQuickColor);
      stage.style.setProperty("--yv-theme", currentQuickColor);
      const inner = stage.querySelector(".yvPlayer");
      if (inner) {
        inner.style.setProperty("--themeAccent", currentQuickColor);
        inner.style.setProperty("--sliderSeekTrackColor", currentQuickColor);
        inner.style.setProperty("--sliderThumbColor", currentQuickColor);
        inner.style.setProperty("--yv-theme", currentQuickColor);
      }
    }

    const inner = stage ? stage.querySelector(".yvPlayer") : null;
    if (inner) {
      inner.style.setProperty("--startBtnBg", currentQuickColor);
      inner.style.setProperty("--themeHoverBg", currentQuickColor + "2e");
      inner.style.setProperty("--themeGlow", currentQuickColor + "88");
      const slider = inner.querySelector(".yvPlayer-slider-container input");
      if (slider) {
        const prog = parseFloat(slider.value) || 0;
        slider.style.background = `linear-gradient(to right, ${currentQuickColor} ${prog}%, transparent ${prog}%)`;
      }
    }

    const player = window.YVPlayer;
    if (player && player.setTheme) {
      player.setTheme("video1", currentQuickColor, currentQuickTheme);
    }
  });
});

// Autoload on Page Load
function initMainApp() {
  const params = new URLSearchParams(window.location.search);
  const paramId = params.get("v") || params.get("id");
  const initialId = (paramId && extractVideoId(paramId)) ? extractVideoId(paramId) : "LXb3EKWsInQ";

  // Check if YouTube API is ready or wait for it
  if (window.YT && window.YT.Player) {
    playVideo(initialId, false);
  } else {
    const origReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function() {
      if (typeof origReady === "function") origReady();
      playVideo(initialId, false);
    };
  }

  updateDrawerCode();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initMainApp);
} else {
  initMainApp();
}

// Keyboard Shortcuts
window.addEventListener("keydown", (e) => {
  // Cmd+E or Ctrl+E to open embed modal
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "e") {
    e.preventDefault();
    openEmbedModal();
    return;
  }

  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  const player = window.YVPlayer;
  if (!player || !player.initialized("video1")) return;

  // Background mode must never be paused or controlled by Space / K
  if (currentIsBackground) return;
  const p1 = player.players && player.players["video1"];
  if (p1 && p1.params && p1.params.background) return;

  if (e.key === " " || e.key.toLowerCase() === "k") {
    e.preventDefault();
    const isPlaying = player.players && player.players["video1"] && player.players["video1"].isPlaying;
    if (isPlaying) {
      player.pause("video1");
    } else {
      player.play("video1");
    }
  } else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "j") {
    e.preventDefault();
    const btnBack = document.querySelector("#video1 .ti-rewind-backward-10");
    if (btnBack) btnBack.click();
  } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "l") {
    e.preventDefault();
    const btnFwd = document.querySelector("#video1 .ti-rewind-forward-10");
    if (btnFwd) btnFwd.click();
  } else if (e.key.toLowerCase() === "f") {
    e.preventDefault();
    const fsBtn = document.querySelector("#video1 .fsBtn");
    if (fsBtn) fsBtn.click();
  } else if (e.key.toLowerCase() === "p") {
    e.preventDefault();
    const pipBtn = document.querySelector("#video1 .pipBtn");
    if (pipBtn) pipBtn.click();
  }
});

// ============================================================
// QUICK CODE DRAWER ON MAIN PAGE
// ============================================================
function generateDrawerCode(tab, id) {
  const cleanId = id || currentVideoId || "LXb3EKWsInQ";
  const isShorts = currentIsShorts;
  const isBg = currentIsBackground;

  if (tab === "dropin") {
    if (isBg) {
      return `<!-- Background Play (Muted, looping video behind content) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/your-username/yvplayer@main/yvPlayer.css" />
<script src="https://cdn.jsdelivr.net/gh/your-username/yvplayer@main/yvPlayer.js"></script>

<!-- Ambient Background Layer (Zero controls, fully automated) -->
<div 
  data-yv-video="${cleanId}" 
  data-yv-background="true"
  style="position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none;"
></div>`;
    }

    if (isShorts) {
      return `<!-- YouTube Shorts (9:16 Vertical Aspect Ratio) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/your-username/yvplayer@main/yvPlayer.css" />
<script src="https://cdn.jsdelivr.net/gh/your-username/yvplayer@main/yvPlayer.js"></script>

<div 
  data-yv-video="${cleanId}" 
  data-yv-shorts="true"
  data-yv-theme="red"
  style="width: 100%; max-width: 400px; aspect-ratio: 9 / 16; margin: 0 auto; border-radius: 20px; overflow: hidden;"
></div>`;
    }

    return `<!-- 1. Include Tabler Icons, YVPlayer CSS & JS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/your-username/yvplayer@main/yvPlayer.css" />
<script src="https://cdn.jsdelivr.net/gh/your-username/yvplayer@main/yvPlayer.js"></script>

<!-- 2. Zero-JS Player Element (Drop anywhere) -->
<div 
  data-yv-video="${cleanId}" 
  data-yv-theme="red"
  style="width: 100%; max-width: 960px; aspect-ratio: 16 / 9; margin: 0 auto; border-radius: 14px; overflow: hidden;"
></div>`;
  }

  if (tab === "js") {
    if (isBg) {
      return `<!-- Background Play Setup (Zero Controls, Looping Muted) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/your-username/yvplayer@main/yvPlayer.css" />
<script src="https://www.youtube.com/iframe_api"></script>
<script src="https://cdn.jsdelivr.net/gh/your-username/yvplayer@main/yvPlayer.js"></script>

<div id="bg-player" style="position: absolute; inset: 0; width: 100%; height: 100%;"></div>

<script>
  window.onYouTubeIframeAPIReady = function() {
    YVPlayer.init("bg-player", {
      defaultId: "${cleanId}",
      background: true, // Muted, seamless looping, zero controls
      autoplay: true
    });
  };
</script>`;
    }

    if (isShorts) {
      return `<!-- YouTube Shorts Setup (9:16 Vertical Player) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/your-username/yvplayer@main/yvPlayer.css" />
<script src="https://www.youtube.com/iframe_api"></script>
<script src="https://cdn.jsdelivr.net/gh/your-username/yvplayer@main/yvPlayer.js"></script>

<div id="shorts-player" style="width: 100%; max-width: 400px; aspect-ratio: 9 / 16; margin: 0 auto;"></div>

<script>
  window.onYouTubeIframeAPIReady = function() {
    YVPlayer.init("shorts-player", {
      defaultId: "${cleanId}",
      shorts: true, // 9:16 vertical ratio + streamlined controls
      theme: "red",
      autoplay: true
    });
  };
</script>`;
    }

    return `<!-- Include Dependencies -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/your-username/yvplayer@main/yvPlayer.css" />
<script src="https://www.youtube.com/iframe_api"></script>
<script src="https://cdn.jsdelivr.net/gh/your-username/yvplayer@main/yvPlayer.js"></script>

<!-- Player Target -->
<div id="player" style="width: 100%; max-width: 960px; aspect-ratio: 16 / 9;"></div>

<script>
  window.onYouTubeIframeAPIReady = function() {
    YVPlayer.init("player", {
      defaultId: "${cleanId}",
      theme: "red",
      autoplay: true,
      storyboard: true,
      pipMode: "os",
      enableHotkeys: true
    });
  };
</script>`;
  }

  if (tab === "react") {
    return `import React, { useEffect, useRef } from "react";

export function VideoPlayer({ videoId = "${cleanId}" }) {
  const containerRef = useRef(null);
  const playerId = useRef("yv-" + Math.random().toString(36).substring(2, 9));

  useEffect(() => {
    if (typeof window === "undefined" || !window.YVPlayer) return;
    const id = playerId.current;

    window.YVPlayer.init(id, {
      defaultId: videoId,
      theme: "red",
      autoplay: true,
      shorts: ${isShorts ? "true" : "false"},
      background: ${isBg ? "true" : "false"},
      storyboard: ${isShorts ? "false" : "true"},
      pipMode: "os"
    });

    return () => {
      if (window.YVPlayer && window.YVPlayer.destroy) {
        window.YVPlayer.destroy(id);
      }
    };
  }, [videoId]);

  return (
    <div
      id={playerId.current}
      ref={containerRef}
      style={{ width: "100%", maxWidth: "960px", aspectRatio: "16 / 9", borderRadius: "14px", overflow: "hidden" }}
    />
  );
}`;
  }

  return "";
}

function updateDrawerCode() {
  if (!drawerCodeContent) return;
  drawerCodeContent.textContent = generateDrawerCode(currentDrawerTab, currentVideoId);
}

drawerTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    drawerTabs.forEach(t => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    currentDrawerTab = tab.getAttribute("data-drawer-tab") || "dropin";
    updateDrawerCode();
  });
});

if (copyDrawerCodeBtn) {
  copyDrawerCodeBtn.addEventListener("click", () => {
    const code = generateDrawerCode(currentDrawerTab, currentVideoId);
    copyToClipboard(code, copyDrawerCodeBtn);
  });
}

// ============================================================
// EMBED MODAL LOGIC WITH RICH CUSTOMIZATION
// ============================================================
const embedModal = document.getElementById("embed-modal");
const openEmbedBtn = document.getElementById("open-embed-modal");
const closeEmbedBtn = document.getElementById("close-embed-modal");
const embedBackdrop = embedModal ? embedModal.querySelector(".embed-backdrop") : null;
const embedVideoIdInput = document.getElementById("embed-video-id");
const embedCdnSelect = document.getElementById("embed-cdn-provider");
const embedCodeText = document.getElementById("embed-code-text");
const embedCodeBadge = document.getElementById("embed-code-badge");
const copyEmbedBtn = document.getElementById("copy-embed-btn");
const embedTabs = document.querySelectorAll(".embed-tab");

// Theme Customization Elements
const themeModeRadios = document.querySelectorAll('input[name="embed-theme-mode"]');
const embedPresetBox = document.getElementById("embed-preset-box");
const embedCustomColorBox = document.getElementById("embed-custom-color-box");
const embedSwatchBtns = document.querySelectorAll(".embed-swatch-btn");
const embedColorPicker = document.getElementById("embed-color-picker");
const embedColorHex = document.getElementById("embed-color-hex");
const embedColorPreview = document.getElementById("embed-color-preview");

// Feature Toggles
const optAutoplay = document.getElementById("embed-opt-autoplay");
const optStoryboard = document.getElementById("embed-opt-storyboard");
const optPip = document.getElementById("embed-opt-pip");
const optShortcuts = document.getElementById("embed-opt-shortcuts");
const optSleep = document.getElementById("embed-opt-sleep");
const optMuted = document.getElementById("embed-opt-muted");
const optLoop = document.getElementById("embed-opt-loop");

// Layout & Dimensions
const embedPipModeSelect = document.getElementById("embed-pip-mode");
const embedMaxWidthSelect = document.getElementById("embed-max-width");
const embedRadiusSelect = document.getElementById("embed-radius");

let currentEmbedTab = "dropin";
let currentThemeMode = "preset";
let selectedPresetName = "red";
let selectedCustomHex = "#fe0001";

function getCdnUrls(provider) {
  if (provider === "local") {
    return {
      css: "./yvPlayer.css",
      js: "./yvPlayer.js"
    };
  }
  return {
    css: "https://cdn.jsdelivr.net/gh/your-username/yvplayer@main/yvPlayer.css",
    js: "https://cdn.jsdelivr.net/gh/your-username/yvplayer@main/yvPlayer.js"
  };
}

function generateEmbedCode() {
  const rawId = (embedVideoIdInput ? embedVideoIdInput.value.trim() : "") || currentVideoId || "LXb3EKWsInQ";
  const cleanId = extractVideoId(rawId) || rawId;
  const provider = embedCdnSelect ? embedCdnSelect.value : "jsdelivr";
  const urls = getCdnUrls(provider);

  const isAutoplay = optAutoplay ? optAutoplay.checked : true;
  const isStoryboard = optStoryboard ? optStoryboard.checked : true;
  const isPip = optPip ? optPip.checked : true;
  const isShortcuts = optShortcuts ? optShortcuts.checked : true;
  const isSleep = optSleep ? optSleep.checked : true;
  const isMuted = optMuted ? optMuted.checked : false;
  const isLoop = optLoop ? optLoop.checked : false;

  const pipMode = embedPipModeSelect ? embedPipModeSelect.value : "os";
  const maxWidth = embedMaxWidthSelect ? embedMaxWidthSelect.value : "960px";
  const radius = embedRadiusSelect ? embedRadiusSelect.value : "12px";

  let themeAttr = "";
  let themeProp = "";

  if (currentThemeMode === "preset") {
    themeAttr = ` data-yv-theme="${selectedPresetName}"`;
    themeProp = `\n      theme: "${selectedPresetName}",`;
  } else if (currentThemeMode === "custom") {
    themeAttr = ` data-yv-theme="custom" data-yv-color="${selectedCustomHex}"`;
    themeProp = `\n      theme: "custom",\n      customColor: "${selectedCustomHex}",`;
  }

  const autoplayAttr = !isAutoplay ? ' data-yv-autoplay="false"' : '';
  const storyboardAttr = !isStoryboard ? ' data-yv-storyboard="false"' : '';
  const pipAttr = !isPip ? ' data-yv-pip="none"' : (pipMode === "inpage" ? ' data-yv-pip="inpage"' : '');

  const styleAttr = `style="width: 100%; max-width: ${maxWidth}; aspect-ratio: 16 / 9; margin: 0 auto; border-radius: ${radius}; overflow: hidden;"`;

  if (currentEmbedTab === "dropin") {
    if (embedCodeBadge) embedCodeBadge.textContent = "1-Click Drop-In HTML";
    return `<!-- ============================================================ -->
<!-- YVPlayer: 1-Click Drop-In Embed (Zero JavaScript Required)    -->
<!-- ============================================================ -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
<link rel="stylesheet" href="${urls.css}" />
<script src="${urls.js}"></script>

<!-- Player Element (Drop anywhere on your page) -->
<div 
  data-yv-video="${cleanId}"${themeAttr}${autoplayAttr}${storyboardAttr}${pipAttr}
  ${styleAttr}
></div>`;
  }

  if (currentEmbedTab === "js") {
    if (embedCodeBadge) embedCodeBadge.textContent = "JavaScript API";
    return `<!-- ============================================================ -->
<!-- YVPlayer: Programmatic JavaScript API Embed                  -->
<!-- ============================================================ -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
<link rel="stylesheet" href="${urls.css}" />
<script src="https://www.youtube.com/iframe_api"></script>
<script src="${urls.js}"></script>

<!-- Player Container -->
<div id="player" ${styleAttr}></div>

<script>
  window.onYouTubeIframeAPIReady = function() {
    YVPlayer.init("player", {
      defaultId: "${cleanId}",${themeProp}
      autoplay: ${isAutoplay},
      loop: ${isLoop},
      storyboard: ${isStoryboard},
      pipMode: "${isPip ? pipMode : 'none'}",
      enableHotkeys: ${isShortcuts},
      enableSleepTimer: ${isSleep}
    }).then(function() {
      console.log("YVPlayer initialized and ready!");
    });
  };
</script>`;
  }

  if (currentEmbedTab === "react") {
    if (embedCodeBadge) embedCodeBadge.textContent = "React / Next.js Component";
    return `import React, { useEffect, useRef } from "react";

export function VideoPlayer({ 
  videoId = "${cleanId}", 
  theme = "${currentThemeMode === 'preset' ? selectedPresetName : 'default'}",
  customColor = ${currentThemeMode === 'custom' ? `"${selectedCustomHex}"` : 'undefined'},
  autoplay = ${isAutoplay} 
}) {
  const containerRef = useRef(null);
  const playerIdRef = useRef("yv-" + Math.random().toString(36).substring(2, 9));

  useEffect(() => {
    const id = playerIdRef.current;
    if (typeof window === "undefined" || !window.YVPlayer) return;

    window.YVPlayer.init(id, {
      defaultId: videoId,
      theme: theme,
      autoplay: autoplay,
      loop: ${isLoop},
      storyboard: ${isStoryboard},
      pipMode: "${isPip ? pipMode : 'none'}"
    }).then(() => {
      if (customColor && window.YVPlayer.setTheme) {
        window.YVPlayer.setTheme(id, customColor, "Custom");
      }
    });

    return () => {
      if (window.YVPlayer && window.YVPlayer.destroy) {
        window.YVPlayer.destroy(id);
      }
    };
  }, [videoId, theme, customColor, autoplay]);

  return (
    <div
      id={playerIdRef.current}
      ref={containerRef}
      style={{
        width: "100%",
        maxWidth: "${maxWidth}",
        aspectRatio: "16 / 9",
        margin: "0 auto",
        borderRadius: "${radius}",
        overflow: "hidden"
      }}
    />
  );
}`;
  }

  return "";
}

function updateEmbedCodeUI() {
  if (!embedCodeText) return;
  embedCodeText.textContent = generateEmbedCode();
}

function openEmbedModal() {
  if (!embedModal) return;
  if (embedVideoIdInput && currentVideoId) {
    embedVideoIdInput.value = currentVideoId;
  }
  updateEmbedCodeUI();
  embedModal.style.display = "flex";
}

function closeEmbedModal() {
  if (!embedModal) return;
  embedModal.style.display = "none";
}

if (openEmbedBtn) openEmbedBtn.addEventListener("click", openEmbedModal);
if (stageCustomizeBtn) stageCustomizeBtn.addEventListener("click", openEmbedModal);
if (closeEmbedBtn) closeEmbedBtn.addEventListener("click", closeEmbedModal);
if (embedBackdrop) embedBackdrop.addEventListener("click", closeEmbedModal);

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && embedModal && embedModal.style.display !== "none") {
    closeEmbedModal();
  }
});

embedTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    embedTabs.forEach(t => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    currentEmbedTab = tab.getAttribute("data-tab") || "dropin";
    updateEmbedCodeUI();
  });
});

themeModeRadios.forEach(radio => {
  radio.addEventListener("change", (e) => {
    currentThemeMode = e.target.value;
    if (embedPresetBox) embedPresetBox.style.display = (currentThemeMode === "preset" ? "flex" : "none");
    if (embedCustomColorBox) embedCustomColorBox.style.display = (currentThemeMode === "custom" ? "flex" : "none");
    updateEmbedCodeUI();
  });
});

embedSwatchBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    embedSwatchBtns.forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    selectedPresetName = btn.getAttribute("data-preset") || "red";
    updateEmbedCodeUI();
  });
});

if (embedColorPicker) {
  embedColorPicker.addEventListener("input", (e) => {
    selectedCustomHex = e.target.value;
    if (embedColorHex) embedColorHex.value = selectedCustomHex;
    if (embedColorPreview) embedColorPreview.style.background = selectedCustomHex;
    updateEmbedCodeUI();
  });
}

if (embedColorHex) {
  embedColorHex.addEventListener("input", (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith("#")) val = "#" + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      selectedCustomHex = val;
      if (embedColorPicker) embedColorPicker.value = selectedCustomHex;
      if (embedColorPreview) embedColorPreview.style.background = selectedCustomHex;
      updateEmbedCodeUI();
    }
  });
}

[
  embedVideoIdInput, embedCdnSelect,
  optAutoplay, optStoryboard, optPip, optShortcuts, optSleep, optMuted, optLoop,
  embedPipModeSelect, embedMaxWidthSelect, embedRadiusSelect
].forEach(el => {
  if (el) el.addEventListener("change", updateEmbedCodeUI);
  if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) el.addEventListener("input", updateEmbedCodeUI);
});

function copyToClipboard(text, buttonEl) {
  if (!navigator.clipboard) {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  } else {
    navigator.clipboard.writeText(text);
  }

  const origHtml = buttonEl.innerHTML;
  buttonEl.classList.add("is-copied");
  buttonEl.innerHTML = '<i class="ti ti-check"></i> <span>Copied!</span>';
  setTimeout(() => {
    buttonEl.classList.remove("is-copied");
    buttonEl.innerHTML = origHtml;
  }, 2000);
}

if (copyEmbedBtn) {
  copyEmbedBtn.addEventListener("click", () => {
    const code = generateEmbedCode();
    copyToClipboard(code, copyEmbedBtn);
  });
}

// Theme Toggle (Notion-Inspired Proper Pitch Dark & Clean Light)
(function initSiteTheme() {
  var toggleBtn = document.getElementById("theme-toggle");
  var root = document.documentElement;
  var urlParams = new URLSearchParams(window.location.search);
  var queryTheme = urlParams.get("theme");
  var stored = null;
  try { stored = localStorage.getItem("yv_site_theme"); } catch (e) { }
  var theme = (queryTheme === "light" || queryTheme === "dark") ? queryTheme : (stored || "dark");

  function applyTheme(t) {
    theme = t;
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("yv_site_theme", t); } catch (e) { }
    if (toggleBtn) {
      var icon = toggleBtn.querySelector("i");
      if (icon) {
        icon.className = (t === "dark" ? "ti ti-sun" : "ti ti-moon");
      }
    }
  }

  applyTheme(theme);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      applyTheme(theme === "dark" ? "light" : "dark");
    });
  }
})();


// Dynamic OS detection for keyboard shortcuts (replace Mac ⌘ with Ctrl on Windows/Linux)
(function initOSShortcuts() {
  var isMac = typeof navigator !== "undefined" && /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform || "");
  document.querySelectorAll(".kbd-pill").forEach(function(el) {
    if (isMac) {
      el.textContent = el.textContent.replace("Ctrl+", "⌘").replace("Ctrl", "⌘");
    } else {
      el.textContent = el.textContent.replace("⌘", "Ctrl+");
    }
  });
})();

// ============================================================
// ENHANCED INTERACTIVE LLM PROMPT ARCHITECT (V3)
// ============================================================
function initPromptGenerator(containerSelector) {
  var container = document.querySelector(containerSelector);
  if (!container) return;

  var framework = "react";
  var mode = "standard";
  var pipMode = "dual";
  var captionMode = "custom-both";
  var userCustomization = "full";
  var proxyProvider = "piped";
  var llmFormat = "chat";

  var THEMES = {
    red: { name: "Classic Red", hex: "#fe0001" },
    cyan: { name: "City Cyan", hex: "#00e5ff" },
    purple: { name: "Fantasy Purple", hex: "#a855f7" },
    emerald: { name: "Forest Emerald", hex: "#10b981" },
    amber: { name: "Amber Gold", hex: "#f59e0b" },
    white: { name: "Minimal White", hex: "#ffffff" }
  };

  var MODES = {
    standard: { name: "Standard 16:9 Cinema", ratio: "16 / 9", defaultId: "LXb3EKWsInQ" },
    shorts: { name: "YouTube Shorts (9:16 Vertical)", ratio: "9 / 16", defaultId: "YlyI2jmHEYc" },
    background: { name: "Ambient Background Mode", ratio: "16 / 9", defaultId: "jfKfPfyJRdk" },
    live: { name: "24/7 Live Stream Broadcast", ratio: "16 / 9", defaultId: "0sfDth4lMLc" }
  };

  var pillSelectors = container.querySelectorAll(".prompt-pill-selector");
  var checkboxes = container.querySelectorAll(".prompt-features-grid input[type='checkbox']");
  var themeChips = container.querySelectorAll(".prompt-theme-chip");
  var themeSelect = container.querySelector(".prompt-theme-select");
  var cdnSelect = container.querySelector(".prompt-cdn-select");
  var videoInput = container.querySelector(".prompt-video-input");
  var codeOutput = container.querySelector(".prompt-code-output");
  var statsBadge = container.querySelector(".prompt-stats-badge");
  var copyBtn = container.querySelector(".prompt-copy-btn");

  var storyboardCb = container.querySelector("input[data-feature='storyboard']");
  var storyboardItem = storyboardCb ? storyboardCb.closest(".prompt-checkbox-item") : null;

  function getFeatureMap() {
    var map = {};
    checkboxes.forEach(function (cb) {
      var feat = cb.getAttribute("data-feature");
      if (feat) {
        map[feat] = cb.checked;
      }
    });
    return map;
  }

  function getAllowedThemes() {
    var list = [];
    themeChips.forEach(function (chip) {
      var cb = chip.querySelector("input[type='checkbox']");
      var t = cb ? cb.getAttribute("data-theme-val") : null;
      if (cb && cb.checked && t) {
        list.push(t);
      }
    });
    if (list.length === 0) list = ["red"];
    return list;
  }

  function resolveVideoId(currentMode) {
    if (videoInput && videoInput.value && videoInput.value.trim()) {
      var val = videoInput.value.trim();
      var m = val.match(/(?:v=|\/v\/|\/embed\/|\/shorts\/|\/live\/|youtu\.be\/|\/e\/|^)([a-zA-Z0-9_-]{11})(?:[?&/#]|$)/);
      if (m && m[1]) return m[1];
      if (/^[a-zA-Z0-9_-]{11}$/.test(val)) return val;
    }
    var mainInput = document.getElementById("video-input");
    if (!videoInput && mainInput && mainInput.value) {
      var val2 = mainInput.value.trim();
      var m2 = val2.match(/(?:v=|\/v\/|\/embed\/|\/shorts\/|\/live\/|youtu\.be\/|\/e\/|^)([a-zA-Z0-9_-]{11})(?:[?&/#]|$)/);
      if (m2 && m2[1]) return m2[1];
    }
    return currentMode.defaultId;
  }

  function updateShortsUI() {
    if (!storyboardItem) return;
    var small = storyboardItem.querySelector("small");
    if (mode === "shorts") {
      storyboardItem.classList.add("is-disabled");
      if (small) small.textContent = "N/A for YouTube Shorts";
      if (storyboardCb) storyboardCb.disabled = true;
    } else {
      storyboardItem.classList.remove("is-disabled");
      if (small) small.textContent = "Scrubbing frame hover previews";
      if (storyboardCb) storyboardCb.disabled = false;
    }
  }

  function generatePrompt() {
    var themeKey = themeSelect ? themeSelect.value : "red";
    var theme = THEMES[themeKey] || THEMES.red;
    var cdn = cdnSelect ? cdnSelect.value : "jsdelivr";
    var currentMode = MODES[mode] || MODES.standard;
    var features = getFeatureMap();
    var allowedThemes = getAllowedThemes();
    var videoId = resolveVideoId(currentMode);

    var isShorts = (mode === "shorts");
    var isBg = (mode === "background");
    var isLive = (mode === "live");

    updateShortsUI();

    // Source links
    var cdnBase = "https://cdn.jsdelivr.net/gh/your-username/yvplayer@main";
    var cssUrl = cdn === "jsdelivr" ? cdnBase + "/yvPlayer.css" : "./yvPlayer.css";
    var jsUrl = cdn === "jsdelivr" ? cdnBase + "/yvPlayer.js" : "./yvPlayer.js";
    var iconsUrl = cdn === "jsdelivr"
      ? "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"
      : "./tabler-icons.min.css";
    var pipStageUrl = cdn === "jsdelivr" ? cdnBase + "/pip_embed.html" : "./pip_embed.html";
    var cdnSpec = cdn === "jsdelivr" ? "jsDelivr Production CDN" : "Self-Hosted / Local Bundled Assets";

    // Privacy standard strictly bound to features.nocookie
    var isNoCookie = !!features.nocookie;
    var privacySpec = isNoCookie
      ? "Privacy-Enhanced (`https://www.youtube-nocookie.com` - Zero tracking cookies)"
      : "Standard YouTube (`https://www.youtube.com`)";
    var privacyRule = isNoCookie
      ? "Embed exclusively via privacy-enhanced `https://www.youtube-nocookie.com` (zero tracking cookies)."
      : "Embed via standard `https://www.youtube.com` host.";
    var privacyTask = isNoCookie
      ? "Privacy Standard: Embed via `youtube-nocookie.com` host (zero tracking cookies)."
      : "Embedding Host: Standard `https://www.youtube.com` host.";

    // PiP configuration
    var pipDescriptions = {
      "dual": { label: "Dual-Engine (Window Document PiP & In-Page Floating Mini Player)", val: "dual" },
      "document": { label: "Native OS Document Picture-in-Picture API", val: "document" },
      "inpage": { label: "In-Page Floating Corner Dock (In-Tab Mini Player)", val: "inpage" },
      "none": { label: "Disabled (No Picture-in-Picture)", val: "none" }
    };
    var pipInfo = pipDescriptions[pipMode] || pipDescriptions.dual;

    // Caption configuration
    var captionDescriptions = {
      "custom-both": { label: "Accessible Custom Subtitle Styler (Solid Backdrop & Transparent Box modes)", enabled: true, style: "both" },
      "transparent": { label: "Transparent Box Subtitle Rendering", enabled: true, style: "transparent" },
      "solid": { label: "High-Contrast Solid Backdrop Subtitles", enabled: true, style: "solid" },
      "none": { label: "Disabled / Native Default", enabled: false, style: "none" }
    };
    var captionInfo = captionDescriptions[captionMode] || captionDescriptions["custom-both"];

    // Stream Proxy configuration
    var proxyDescriptions = {
      "piped": { label: "Piped API (Open-Source / Zero Backend)", prop: 'proxyProvider: "piped",\n        pipedInstance: "https://pipedapi.kavin.rocks",' },
      "invidious": { label: "Invidious API (Open-Source / Zero Backend)", prop: 'proxyProvider: "invidious",\n        invidiousInstance: "https://inv.tux.pizza",' },
      "cobalt": { label: "Cobalt API (High-Speed Direct)", prop: 'proxyProvider: "cobalt",\n        cobaltInstance: "https://api.cobalt.tools",' },
      "local": { label: "Self-Hosted Python (yt-dlp)", prop: 'proxyProvider: "local",' }
    };
    var proxyInfo = proxyDescriptions[proxyProvider] || proxyDescriptions.piped;

    // Customization permissions
    var allowCustomizationBool = (userCustomization === "full");
    var customizationSpec = allowCustomizationBool
      ? "Enabled — Viewers have full access to the settings drawer (theme palette, captions styling, speed, quality, sleep timer, loop)."
      : "Locked to Dev Presets — Settings drawer customizers are hidden from end viewers; strict cinema mode enforced.";

    // Theme palette details
    var paletteList = [];
    allowedThemes.forEach(function (t) {
      if (THEMES[t]) {
        paletteList.push(THEMES[t].name + " (`" + THEMES[t].hex + "`)");
      }
    });
    var paletteSpec = paletteList.length > 0 ? paletteList.join(", ") : theme.name + " (`" + theme.hex + "`)";

    // Capabilities bullets
    var activeFeats = [];
    if (isNoCookie) activeFeats.push("Privacy-Enhanced youtube-nocookie.com embedding (zero tracking cookies)");
    if (pipMode !== "none") activeFeats.push("Picture-in-Picture: " + pipInfo.label);
    if (captionInfo.enabled) activeFeats.push("Subtitle & Captions Engine: " + captionInfo.label);
    if (proxyProvider !== "local") activeFeats.push("Stream Proxy Provider: " + proxyInfo.label);
    if (allowedThemes.length > 1) activeFeats.push("Multi-Theme Palette Support: " + allowedThemes.length + " allowed presets (" + allowedThemes.join(", ") + ")");
    if (features.loop) activeFeats.push("Seamless Loop repeat control with auto-replay");
    if (features.storyboard && !isShorts) activeFeats.push("Real-time VTT Storyboard thumbnail hovering along the timeline");
    if (features.sleeptimer) activeFeats.push("Sleep Timer countdown (15m, 30m, 45m, 60m, end of video auto-pause & fade)");
    if (features.speed) activeFeats.push("Playback Speed selector (0.25x – 2.0x playback rates)");
    if (features.quality) activeFeats.push("Direct Quality rendition selection (1080p, 720p, 480p, 360p & adaptive auto)");
    if (features.hotkeys) activeFeats.push("Keyboard Shortcuts modal with interactive help overlay (Space, J, K, L, M, F, P, ?)");
    if (features.autoplay) activeFeats.push("Autoplay enabled on mount (starts muted for browser autoplay policy compliance)");

    var featBullets = activeFeats.length > 0
      ? activeFeats.map(function(f) { return "- " + f; }).join("\n")
      : "- Minimal core cinema playback (all optional interactive overlays disabled)";

    // Enabled drawer controls
    var drawerControls = [];
    if (allowedThemes.length > 1) drawerControls.push("Theme palette switcher");
    if (captionInfo.enabled) drawerControls.push("Captions styler");
    if (features.loop) drawerControls.push("Loop toggle");
    if (features.quality) drawerControls.push("Quality renditions");
    if (features.speed) drawerControls.push("Playback speed rates");
    if (features.sleeptimer) drawerControls.push("Sleep Timer countdown");

    var drawerGuideline = allowCustomizationBool
      ? (drawerControls.length > 0
          ? "- Built-in settings drawer provides interactive viewer controls for: " + drawerControls.join(", ") + "."
          : "- Minimal drawer controls enabled.")
      : "- End-user settings drawer is LOCKED: hide customizer controls and strictly enforce developer configuration presets.";

    // Source code references section
    var sourceRefSection = [
      "### Source Code References & Local Vendoring (For AI Coding Agents)",
      "If you need to inspect the underlying player logic, debug API methods, or copy the library files directly into this repository:",
      "- **Core Library JS**: `" + jsUrl + "`",
      "- **Player Stylesheet**: `" + cssUrl + "`",
      "- **Tabler Icons CSS**: `" + iconsUrl + "`",
      "- **Document PiP Window Stage**: `" + pipStageUrl + "`",
      "",
      "*CLI command to copy and vendor files locally into project:*",
      "```bash",
      "curl -o yvPlayer.js " + jsUrl,
      "curl -o yvPlayer.css " + cssUrl,
      "```"
    ].join("\n");

    var modeParamLine = "";
    if (isShorts) modeParamLine = "        shorts: true,";
    else if (isBg) modeParamLine = "        background: true,";
    else if (isLive) modeParamLine = "        isLive: true,";

    // Framework code generation
    var codeBlock = "";
    var themesJson = JSON.stringify(allowedThemes);

    if (framework === "react") {
      var reactShortsStyle = isShorts ? "        maxWidth: '400px',\n        margin: '0 auto',\n" : "";
      codeBlock = [
        "import React, { useEffect, useRef } from 'react';",
        "",
        "declare global {",
        "  interface Window {",
        "    YVPlayer?: any;",
        "  }",
        "}",
        "",
        "interface YVPlayerProps {",
        "  videoId?: string;",
        "  className?: string;",
        "}",
        "",
        "export const VideoPlayer: React.FC<YVPlayerProps> = ({",
        '  videoId = "' + videoId + '",',
        '  className = ""',
        "}) => {",
        "  const containerRef = useRef<HTMLDivElement>(null);",
        '  const playerId = "yv-player-" + React.useId().replace(/:/g, "");',
        "",
        "  useEffect(() => {",
        "    let isMounted = true;",
        "",
        "    const loadAssets = () => {",
        '      if (!document.getElementById("yvplayer-css")) {',
        '        const link = document.createElement("link");',
        '        link.id = "yvplayer-css";',
        '        link.rel = "stylesheet";',
        '        link.href = "' + cssUrl + '";',
        "        document.head.appendChild(link);",
        "      }",
        '      if (!document.getElementById("tabler-icons-css")) {',
        '        const link = document.createElement("link");',
        '        link.id = "tabler-icons-css";',
        '        link.rel = "stylesheet";',
        '        link.href = "' + iconsUrl + '";',
        "        document.head.appendChild(link);",
        "      }",
        "",
        "      if (window.YVPlayer) {",
        "        init();",
        "        return;",
        "      }",
        "",
        '      const script = document.createElement("script");',
        '      script.src = "' + jsUrl + '";',
        "      script.async = true;",
        "      script.onload = () => {",
        "        if (isMounted) init();",
        "      };",
        "      document.body.appendChild(script);",
        "    };",
        "",
        "    const init = () => {",
        "      if (!window.YVPlayer) return;",
        "      window.YVPlayer.init(playerId, {",
        '        defaultId: videoId,',
        modeParamLine,
        "        nocookie: " + (isNoCookie ? "true" : "false") + ",",
        '        pipMode: "' + pipInfo.val + '",',
        "        " + proxyInfo.prop,
        "        allowUserCustomization: " + (allowCustomizationBool ? "true" : "false") + ",",
        '        theme: "' + themeKey + '",',
        '        customColor: "' + theme.hex + '",',
        "        allowedThemes: " + themesJson + ",",
        "        captions: " + (captionInfo.enabled ? "true" : "false") + ",",
        '        captionStyle: "' + captionInfo.style + '",',
        "        loop: " + (features.loop ? "true" : "false") + ",",
        "        autoplay: " + (features.autoplay ? "true" : "false") + ",",
        features.autoplay ? "        muted: true," : "",
        "        storyboard: " + (features.storyboard && !isShorts ? "true" : "false") + ",",
        "        sleepTimer: " + (features.sleeptimer ? "true" : "false") + ",",
        "        speedControl: " + (features.speed ? "true" : "false") + ",",
        "        qualitySelector: " + (features.quality ? "true" : "false") + ",",
        "        hotkeys: " + (features.hotkeys ? "true" : "false"),
        "      });",
        "    };",
        "",
        "    loadAssets();",
        "",
        "    return () => {",
        "      isMounted = false;",
        '      if (window.YVPlayer && typeof window.YVPlayer.destroy === "function") {',
        "        try { window.YVPlayer.destroy(playerId); } catch (e) {}",
        "      }",
        "    };",
        "  }, [videoId]);",
        "",
        "  return (",
        "    <div",
        "      ref={containerRef}",
        "      className={className}",
        "      style={{",
        '        width: "100%",',
        reactShortsStyle + '        aspectRatio: "' + currentMode.ratio + '",',
        '        borderRadius: "' + (isShorts ? "22px" : "14px") + '",',
        '        overflow: "hidden",',
        '        background: "#000000"',
        "      }}",
        "    >",
        "      <div id={playerId} style={{ width: '100%', height: '100%' }} />",
        "    </div>",
        "  );",
        "};"
      ].filter(Boolean).join("\n");
    } else if (framework === "vue") {
      var vueShortsStyle = isShorts ? "      maxWidth: '400px', margin: '0 auto',\n" : "";
      codeBlock = [
        "<template>",
        '  <div class="yv-player-wrapper"',
        '    :style="{',
        "      width: '100%',",
        vueShortsStyle + "      aspectRatio: '" + currentMode.ratio + "',",
        "      borderRadius: '" + (isShorts ? "22px" : "14px") + "',",
        "      overflow: 'hidden',",
        "      background: '#000000'",
        '    }"',
        "  >",
        '    <div :id="playerId" style="width: 100%; height: 100%;"></div>',
        "  </div>",
        "</template>",
        "",
        '<script setup lang="ts">',
        "import { onMounted, onUnmounted } from 'vue';",
        "",
        "const props = withDefaults(defineProps<{ videoId?: string }>(), {",
        "  videoId: '" + videoId + "'",
        "});",
        "",
        "const playerId = 'yv-player-' + Math.random().toString(36).substring(2, 9);",
        "",
        "onMounted(() => {",
        "  const loadScript = () => {",
        "    if ((window as any).YVPlayer) {",
        "      init();",
        "      return;",
        "    }",
        "    const script = document.createElement('script');",
        "    script.src = '" + jsUrl + "';",
        "    script.async = true;",
        "    script.onload = init;",
        "    document.body.appendChild(script);",
        "  };",
        "",
        "  const init = () => {",
        "    const YVPlayer = (window as any).YVPlayer;",
        "    if (!YVPlayer) return;",
        "    YVPlayer.init(playerId, {",
        "      defaultId: props.videoId,",
        modeParamLine,
        "      nocookie: " + (isNoCookie ? "true" : "false") + ",",
        "      pipMode: '" + pipInfo.val + "',",
        "      " + proxyInfo.prop,
        "      allowUserCustomization: " + (allowCustomizationBool ? "true" : "false") + ",",
        "      theme: '" + themeKey + "',",
        "      customColor: '" + theme.hex + "',",
        "      allowedThemes: " + themesJson + ",",
        "      captions: " + (captionInfo.enabled ? "true" : "false") + ",",
        "      captionStyle: '" + captionInfo.style + "',",
        "      loop: " + (features.loop ? "true" : "false") + ",",
        "      autoplay: " + (features.autoplay ? "true" : "false") + ",",
        features.autoplay ? "      muted: true," : "",
        "      storyboard: " + (features.storyboard && !isShorts ? "true" : "false") + ",",
        "      sleepTimer: " + (features.sleeptimer ? "true" : "false") + ",",
        "      speedControl: " + (features.speed ? "true" : "false") + ",",
        "      qualitySelector: " + (features.quality ? "true" : "false") + ",",
        "      hotkeys: " + (features.hotkeys ? "true" : "false") + "",
        "    });",
        "  };",
        "",
        "  loadScript();",
        "});",
        "",
        "onUnmounted(() => {",
        "  const YVPlayer = (window as any).YVPlayer;",
        "  if (YVPlayer && typeof YVPlayer.destroy === 'function') {",
        "    try { YVPlayer.destroy(playerId); } catch (e) {}",
        "  }",
        "});",
        "</script>"
      ].filter(Boolean).join("\n");
    } else if (framework === "svelte") {
      codeBlock = [
        '<script lang="ts">',
        "  import { onMount, onDestroy } from 'svelte';",
        "",
        '  export let videoId: string = "' + videoId + '";',
        '  const playerId = "yv-player-" + Math.random().toString(36).substring(2, 9);',
        "",
        "  onMount(() => {",
        "    const init = () => {",
        "      if ((window as any).YVPlayer) {",
        "        (window as any).YVPlayer.init(playerId, {",
        "          defaultId: videoId,",
        modeParamLine,
        "          nocookie: " + (isNoCookie ? "true" : "false") + ",",
        '          pipMode: "' + pipInfo.val + '",',
        "          " + proxyInfo.prop,
        "          allowUserCustomization: " + (allowCustomizationBool ? "true" : "false") + ",",
        '          theme: "' + themeKey + '",',
        '          customColor: "' + theme.hex + '",',
        "          allowedThemes: " + themesJson + ",",
        "          captions: " + (captionInfo.enabled ? "true" : "false") + ",",
        '          captionStyle: "' + captionInfo.style + '",',
        "          loop: " + (features.loop ? "true" : "false") + ",",
        "          autoplay: " + (features.autoplay ? "true" : "false") + ",",
        features.autoplay ? "          muted: true," : "",
        "          storyboard: " + (features.storyboard && !isShorts ? "true" : "false") + ",",
        "          sleepTimer: " + (features.sleeptimer ? "true" : "false") + ",",
        "          speedControl: " + (features.speed ? "true" : "false") + ",",
        "          qualitySelector: " + (features.quality ? "true" : "false") + ",",
        "          hotkeys: " + (features.hotkeys ? "true" : "false") + "",
        "        });",
        "      }",
        "    };",
        "",
        "    if ((window as any).YVPlayer) {",
        "      init();",
        "    } else {",
        '      const script = document.createElement("script");',
        '      script.src = "' + jsUrl + '";',
        "      script.onload = init;",
        "      document.body.appendChild(script);",
        "    }",
        "  });",
        "",
        "  onDestroy(() => {",
        "    if ((window as any).YVPlayer && typeof (window as any).YVPlayer.destroy === 'function') {",
        "      try { (window as any).YVPlayer.destroy(playerId); } catch (e) {}",
        "    }",
        "  });",
        "</script>",
        "",
        "<svelte:head>",
        '  <link rel="stylesheet" href="' + cssUrl + '">',
        '  <link rel="stylesheet" href="' + iconsUrl + '">',
        "</svelte:head>",
        "",
        "<div",
        '  style="width: 100%; ' + (isShorts ? "max-width: 400px; margin: 0 auto; " : "") + 'aspect-ratio: ' + currentMode.ratio + '; border-radius: ' + (isShorts ? "22px" : "14px") + '; overflow: hidden; background: #000;"',
        ">",
        "  <div id={playerId} style=\"width: 100%; height: 100%;\"></div>",
        "</div>"
      ].filter(Boolean).join("\n");
    } else {
      // HTML / Vanilla JS
      codeBlock = [
        "<!-- 1. Include Stylesheets in <head> -->",
        '<link rel="stylesheet" href="' + iconsUrl + '">',
        '<link rel="stylesheet" href="' + cssUrl + '">',
        "",
        "<!-- 2. Player Mount Element -->",
        "<div",
        '  style="width: 100%; ' + (isShorts ? "max-width: 400px; margin: 0 auto; " : "max-width: 960px; margin: 0 auto; ") + 'aspect-ratio: ' + currentMode.ratio + '; border-radius: ' + (isShorts ? "22px" : "14px") + '; overflow: hidden; background: #000;"',
        ">",
        '  <div id="video-stage" style="width: 100%; height: 100%;"></div>',
        "</div>",
        "",
        "<!-- 3. Include YVPlayer Script & Initialize -->",
        '<script src="' + jsUrl + '"></script>',
        "<script>",
        '  document.addEventListener("DOMContentLoaded", function () {',
        '    YVPlayer.init("video-stage", {',
        '      defaultId: "' + videoId + '",',
        modeParamLine,
        "      nocookie: " + (isNoCookie ? "true" : "false") + ",",
        '      pipMode: "' + pipInfo.val + '",',
        "      " + proxyInfo.prop,
        "      allowUserCustomization: " + (allowCustomizationBool ? "true" : "false") + ",",
        '      theme: "' + themeKey + '",',
        '      customColor: "' + theme.hex + '",',
        "      allowedThemes: " + themesJson + ",",
        "      captions: " + (captionInfo.enabled ? "true" : "false") + ",",
        '      captionStyle: "' + captionInfo.style + '",',
        "      loop: " + (features.loop ? "true" : "false") + ",",
        "      autoplay: " + (features.autoplay ? "true" : "false") + ",",
        features.autoplay ? "      muted: true," : "",
        "      storyboard: " + (features.storyboard && !isShorts ? "true" : "false") + ",",
        "      sleepTimer: " + (features.sleeptimer ? "true" : "false") + ",",
        "      speedControl: " + (features.speed ? "true" : "false") + ",",
        "      qualitySelector: " + (features.quality ? "true" : "false") + ",",
        "      hotkeys: " + (features.hotkeys ? "true" : "false"),
        "    }).then(function () {",
        '      console.log("YVPlayer successfully mounted in ' + currentMode.name + ' mode");',
        "    });",
        "  });",
        "</script>"
      ].filter(Boolean).join("\n");
    }

    var finalPrompt = "";
    var fwLabel = framework.toUpperCase();
    if (framework === "react") fwLabel = "React / Next.js";
    else if (framework === "html") fwLabel = "HTML & Vanilla JS";
    else if (framework === "vue") fwLabel = "Vue 3 / Nuxt";
    else if (framework === "svelte") fwLabel = "Svelte / SvelteKit";

    if (llmFormat === "cursor") {
      finalPrompt = [
        "# YVPlayer Integration Rules (.cursorrules)",
        "",
        "You are an expert AI software engineer. Always use **YVPlayer** whenever integrating YouTube video playback into this " + fwLabel + " project.",
        "",
        "## Core Rules",
        "1. Never embed raw YouTube iframes with standard distraction-heavy YouTube branding.",
        "2. " + privacyRule,
        "3. Target Framework: " + fwLabel,
        "4. Target Mode: " + currentMode.name + " (" + currentMode.ratio + ")",
        "5. Picture-in-Picture: " + pipInfo.label,
        "6. Subtitle & Captions: " + captionInfo.label,
        "7. Stream Proxy Provider: " + proxyInfo.label,
        "8. End-User Customization: " + (allowCustomizationBool ? "Viewer customization enabled via settings drawer" : "Developer presets locked; hide viewer customizers"),
        "9. Default Accent Theme: " + theme.name + " (`" + theme.hex + "`)",
        "10. Allowed Theme Palette: " + allowedThemes.join(", "),
        "11. Autoplay Policy: " + (features.autoplay ? "Autoplay with initial mute for browser compliance" : "User-initiated playback"),
        "12. Loop Policy: " + (features.loop ? "Loop enabled" : "Single play"),
        "",
        "## Assets & Dependencies",
        "- Stylesheet: `" + cssUrl + "`",
        "- Tabler Icons: `" + iconsUrl + "`",
        "- Script: `" + jsUrl + "`",
        "",
        sourceRefSection,
        "",
        "## Features to Implement",
        featBullets,
        "",
        "## Standard Implementation Template",
        "```" + (framework === "html" ? "html" : framework),
        codeBlock,
        "```",
        "",
        "## Lifecycle & Memory Safety",
        "- Ensure `YVPlayer.destroy(elementId)` is called when tearing down components or unmounting.",
        pipMode !== "none" ? "- The player automatically manages PiP synchronization, watchdog timers, and keyboard navigation." : "- Keyboard navigation and watchdog timers are managed automatically by the player."
      ].join("\n");
    } else if (llmFormat === "task") {
      finalPrompt = [
        "Task: Implement a " + currentMode.name + " YouTube video player using YVPlayer in " + fwLabel + ".",
        "",
        "Context:",
        "We need a clean, zero-distraction YouTube player that strips video titles, avatars, end-screens, and suggested videos, styled with " + theme.name + " (`" + theme.hex + "`).",
        "",
        "Requirements:",
        "1. Target Mode: " + currentMode.name + " (" + currentMode.ratio + ").",
        '2. Target Video ID: "' + videoId + '".',
        "3. " + privacyTask,
        "4. Picture-in-Picture: " + pipInfo.label + ".",
        "5. Captions Engine: " + captionInfo.label + ".",
        "6. Stream Proxy Provider: " + proxyInfo.label + ".",
        "7. Customization Policy: " + (allowCustomizationBool ? "Allow viewer customizer drawer" : "Lock down to developer presets (hide drawer customizers)") + ".",
        "8. Theme Palette: " + paletteSpec + ".",
        "9. Enabled Features:",
        featBullets,
        "10. Memory Management: Clean up event listeners and timers with `YVPlayer.destroy(...)`.",
        "",
        "Dependencies & Source Files for AI Agent:",
        "- CSS: `" + cssUrl + "`",
        "- Icons: `" + iconsUrl + "`",
        "- JS: `" + jsUrl + "`",
        "- PiP Stage: `" + pipStageUrl + "`",
        "",
        "*Local vendoring command:*",
        "```bash",
        "curl -o yvPlayer.js " + jsUrl,
        "curl -o yvPlayer.css " + cssUrl,
        "```",
        "",
        "Please output the complete, production-ready " + fwLabel + " code:",
        "",
        "```" + (framework === "html" ? "html" : framework),
        codeBlock,
        "```"
      ].join("\n");
    } else {
      // Default: Chat format
      finalPrompt = [
        "You are an expert frontend and " + fwLabel + " engineer.",
        "",
        "Please integrate **YVPlayer** (a cinema-grade, zero-distraction YouTube player) into my project with the following configuration:",
        "",
        "### 1. Project Specifications",
        "- **Framework**: " + fwLabel,
        "- **Player Mode**: " + currentMode.name + " (" + currentMode.ratio + ")",
        '- **Video ID**: "' + videoId + '"',
        "- **Privacy Standard**: " + privacySpec,
        "- **Picture-in-Picture Engine**: " + pipInfo.label,
        "- **Subtitle & Captions Engine**: " + captionInfo.label,
        "- **Stream Proxy Provider**: " + proxyInfo.label,
        "- **End-User Customization**: " + customizationSpec,
        "- **Theme Palette**: " + paletteSpec + " (Default: " + theme.name + " `" + theme.hex + "`)",
        "- **CDN Delivery**: " + cdnSpec,
        "- **Autoplay Policy**: " + (features.autoplay ? "Enabled (Initial audio muted for browser compliance)" : "Disabled (User initiates playback)"),
        "- **Loop Mode**: " + (features.loop ? "Enabled (Continuous loop replay)" : "Disabled (Plays once and stops)"),
        "- **Storyboard Thumbnails**: " + (isShorts ? "N/A for YouTube Shorts" : (features.storyboard ? "Enabled (Frame-accurate scrubbing previews)" : "Disabled")),
        "",
        "### 2. Enabled Capabilities & Features",
        featBullets,
        "",
        "### 3. Required Assets",
        "Include these CDN resources:",
        "- Icons: `" + iconsUrl + "`",
        "- Stylesheet: `" + cssUrl + "`",
        "- Library: `" + jsUrl + "`",
        "",
        sourceRefSection,
        "",
        "### 4. Implementation Code",
        "```" + (framework === "html" ? "html" : framework),
        codeBlock,
        "```",
        "",
        "### 5. Implementation Guidelines",
        "- Container styling must preserve `" + currentMode.ratio + "` aspect ratio" + (isShorts ? " with max-width: 400px centered." : "."),
        "- Ensure `YVPlayer.destroy(elementId)` is called on component cleanup to avoid orphaned intervals.",
        drawerGuideline
      ].join("\n");
    }

    if (codeOutput) {
      codeOutput.textContent = finalPrompt;
    }

    if (statsBadge) {
      var wordCount = finalPrompt.trim().split(/\s+/).length;
      var tokenEstimate = Math.round(finalPrompt.length / 3.8);
      statsBadge.textContent = "~" + wordCount + " words (" + tokenEstimate + " tokens)";
    }
  }

  // Pill Selection Logic
  pillSelectors.forEach(function (group) {
    var groupType = group.getAttribute("data-group");
    var pills = group.querySelectorAll(".prompt-pill");
    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        pills.forEach(function (p) { p.classList.remove("is-active"); });
        pill.classList.add("is-active");
        var val = pill.getAttribute("data-val");
        if (groupType === "framework") framework = val;
        else if (groupType === "mode") mode = val;
        else if (groupType === "pipMode") pipMode = val;
        else if (groupType === "captionMode") captionMode = val;
        else if (groupType === "userCustomization") userCustomization = val;
        else if (groupType === "proxyProvider") proxyProvider = val;
        else if (groupType === "llmFormat") llmFormat = val;
        generatePrompt();
      });
    });
  });

  // Theme chips multi-select logic
  themeChips.forEach(function (chip) {
    var cb = chip.querySelector("input[type='checkbox']");
    if (!cb) return;
    cb.addEventListener("change", function () {
      if (cb.checked) {
        chip.classList.add("is-selected");
      } else {
        var checkedCount = 0;
        themeChips.forEach(function (c) {
          if (c.querySelector("input:checked")) checkedCount++;
        });
        if (checkedCount === 0) {
          cb.checked = true;
          return;
        }
        chip.classList.remove("is-selected");
      }
      generatePrompt();
    });
  });

  // Checkboxes & Selects Change
  checkboxes.forEach(function (cb) {
    cb.addEventListener("change", generatePrompt);
  });
  if (themeSelect) themeSelect.addEventListener("change", generatePrompt);
  if (cdnSelect) cdnSelect.addEventListener("change", generatePrompt);
  if (videoInput) videoInput.addEventListener("input", generatePrompt);

  // Copy Prompt Button
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      if (!codeOutput) return;
      var text = codeOutput.textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
      } else {
        var ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }

      var origHtml = copyBtn.innerHTML;
      copyBtn.classList.add("copied");
      copyBtn.innerHTML = '<i class="ti ti-check"></i> <span>Copied!</span>';
      setTimeout(function () {
        copyBtn.classList.remove("copied");
        copyBtn.innerHTML = origHtml;
      }, 2000);
    });
  }

  // Initial prompt generation
  generatePrompt();
}


// Mount prompt generator on home showcase
initPromptGenerator("#prompt-generator");
