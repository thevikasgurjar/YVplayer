// ============================================================
// YVPLAYER DOCUMENTATION INTERACTIONS (SCROLLSPY, COPY, SEARCH, MODAL)
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
  // 1. Copy Code Buttons
  var copyButtons = document.querySelectorAll(".btn-copy-code");
  copyButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var code = btn.getAttribute("data-code");
      if (!code) {
        var pre = btn.closest(".code-block") ? btn.closest(".code-block").querySelector("pre code") : null;
        code = pre ? pre.textContent : "";
      }
      if (!code) return;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(code);
      } else {
        var ta = document.createElement("textarea");
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }

      var origHtml = btn.innerHTML;
      btn.classList.add("is-copied");
      btn.innerHTML = '<i class="ti ti-check"></i> Copied!';
      setTimeout(function () {
        btn.classList.remove("is-copied");
        btn.innerHTML = origHtml;
      }, 2000);
    });
  });

  // 2. Sidebar ScrollSpy & Active Container Synchronization
  var sections = document.querySelectorAll(".docs-section");
  var sidebarLinks = document.querySelectorAll(".sidebar-link");
  var sidebarContainer = document.querySelector(".docs-sidebar");

  function onScrollSpy() {
    var currentSectionId = "";
    var scrollThreshold = 180; // slightly below sticky navbar

    // Sections are evaluated top-down; the last one passing scrollThreshold wins
    sections.forEach(function (sec) {
      var rect = sec.getBoundingClientRect();
      if (rect.top <= scrollThreshold) {
        currentSectionId = sec.getAttribute("id");
      }
    });

    // Default to first section if at top
    if (!currentSectionId && sections.length > 0) {
      currentSectionId = sections[0].getAttribute("id");
    }

    // If reached bottom of document, force activate the last section
    if ((window.innerHeight + window.pageYOffset) >= document.documentElement.scrollHeight - 60) {
      if (sections.length > 0) {
        currentSectionId = sections[sections.length - 1].getAttribute("id");
      }
    }

    sidebarLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === "#" + currentSectionId) {
        if (!link.classList.contains("is-active")) {
          link.classList.add("is-active");
          // Smoothly keep active sidebar link in view
          if (sidebarContainer && typeof link.getBoundingClientRect === "function") {
            var sRect = sidebarContainer.getBoundingClientRect();
            var lRect = link.getBoundingClientRect();
            if (lRect.top < sRect.top + 60) {
              sidebarContainer.scrollTop -= (sRect.top + 60 - lRect.top);
            } else if (lRect.bottom > sRect.bottom - 60) {
              sidebarContainer.scrollTop += (lRect.bottom - (sRect.bottom - 60));
            }
          }
        }
      } else {
        link.classList.remove("is-active");
      }
    });
  }

  var scrollTicking = false;
  function handleScroll() {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(function () {
        onScrollSpy();
        scrollTicking = false;
      });
    }
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  onScrollSpy();


  // 3. Notion Help Center Universal Search & Sidebar Filter
  var mainSearchInput = document.getElementById("notion-main-search");
  var sidebarSearchInput = document.getElementById("docs-search-input");
  var quickChips = document.querySelectorAll(".notion-quick-chip");

  function performDocsSearch(query) {
    var q = query.toLowerCase().trim();
    if (mainSearchInput && mainSearchInput.value !== query) mainSearchInput.value = query;
    if (sidebarSearchInput && sidebarSearchInput.value !== query) sidebarSearchInput.value = query;

    // Filter sidebar navigation
    sidebarLinks.forEach(function (link) {
      var txt = link.textContent.toLowerCase();
      var match = !q || txt.includes(q);
      link.style.display = match ? "flex" : "none";
    });

    // If query has length, find first matching section
    if (q.length >= 2) {
      for (var s = 0; s < sections.length; s++) {
        var sec = sections[s];
        var secText = (sec.querySelector(".section-title") ? sec.querySelector(".section-title").textContent : "") + " " + sec.textContent;
        if (secText.toLowerCase().includes(q)) {
          sec.scrollIntoView({ behavior: "smooth", block: "start" });
          sec.style.transition = "outline 0.3s ease";
          sec.style.outline = "2px solid var(--themeAccent, #fe0001)";
          setTimeout(function () { sec.style.outline = "none"; }, 1600);
          break;
        }
      }
    }
  }

  if (mainSearchInput) {
    mainSearchInput.addEventListener("input", function (e) {
      performDocsSearch(e.target.value);
    });
  }

  if (sidebarSearchInput) {
    sidebarSearchInput.addEventListener("input", function (e) {
      performDocsSearch(e.target.value);
    });
  }

  quickChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var query = chip.getAttribute("data-search") || chip.textContent;
      performDocsSearch(query);
    });
  });

  // Global Ctrl+K / Cmd+K search shortcut
  window.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      if (mainSearchInput) {
        mainSearchInput.focus();
        mainSearchInput.select();
      } else if (sidebarSearchInput) {
        sidebarSearchInput.focus();
        sidebarSearchInput.select();
      }
    } else if (e.key === "Escape") {
      if (mainSearchInput && document.activeElement === mainSearchInput) {
        mainSearchInput.value = "";
        performDocsSearch("");
        mainSearchInput.blur();
      }
    }
  });


  // ============================================================
  // 4. INTERACTIVE LIVE DEMO SANDBOX POPUP
  // ============================================================
  var demoModal = document.getElementById("docs-demo-modal");
  var closeDemoBtn = document.getElementById("close-docs-demo-btn");
  var demoBackdrop = demoModal ? demoModal.querySelector(".docs-demo-backdrop") : null;
  var demoInput = document.getElementById("docs-modal-input");
  var demoLoadBtn = document.getElementById("docs-modal-load-btn");
  var demoChips = document.querySelectorAll(".docs-sample-chip");
  var demoThemeBtns = document.querySelectorAll(".modal-theme-btn");
  var currentModalVideoId = "LXb3EKWsInQ";
  var currentModalTheme = "red";
  var currentModalColor = "#fe0001";

  function ensureYVPlayer(callback) {
    if (window.YVPlayer) return callback(window.YVPlayer);
    var attempts = 0;
    var timer = setInterval(function () {
      attempts++;
      if (window.YVPlayer) {
        clearInterval(timer);
        callback(window.YVPlayer);
      } else if (attempts > 80) {
        clearInterval(timer);
        console.error("YVPlayer library failed to load");
      }
    }, 50);
  }

  function extractId(input) {
    if (!input) return null;
    input = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
    var match = input.match(/(?:v=|\/v\/|\/embed\/|\/shorts\/|\/live\/|youtu\.be\/|\/e\/)([^#&?\/]{11})/);
    return match ? match[1] : null;
  }

  var currentModalIsShorts = false;
  var currentModalIsBackground = false;

  function playInModal(id, modeOptions) {
    if (!id) return;
    currentModalVideoId = id;

    var isLiveMode = false;
    var isShortsMode = false;
    var isBgMode = false;

    if (modeOptions && typeof modeOptions === "object") {
      isLiveMode = !!modeOptions.isLive;
      isShortsMode = !!modeOptions.shorts;
      isBgMode = !!modeOptions.background;
    } else {
      var raw = (demoInput && demoInput.value) || "";
      isLiveMode = raw.includes("/live/") || (id === "0sfDth4lMLc");
      isShortsMode = raw.includes("/shorts/") || (id === "YlyI2jmHEYc");
      isBgMode = raw.includes("background=true");
    }

    currentModalIsShorts = isShortsMode;
    currentModalIsBackground = isBgMode;

    if (demoInput) {
      if (isShortsMode) {
        demoInput.value = "https://www.youtube.com/shorts/" + id;
      } else if (isLiveMode) {
        demoInput.value = "https://www.youtube.com/live/" + id;
      } else {
        demoInput.value = "https://www.youtube.com/watch?v=" + id;
      }
    }

    var chips = document.querySelectorAll(".docs-sample-chip");
    chips.forEach(function (chip) {
      var chipId = chip.getAttribute("data-id");
      var chipIsShorts = chip.getAttribute("data-shorts") === "true";
      var chipIsBg = chip.getAttribute("data-background") === "true";
      var match = (chipId === id);
      if (isShortsMode) match = match && chipIsShorts;
      else if (isBgMode) match = match && chipIsBg;
      chip.classList.toggle("is-active", match);
    });

    var wrap = document.querySelector(".docs-modal-player-wrap");
    if (wrap) {
      wrap.classList.toggle("is-shorts-stage", isShortsMode);
    }
    var stage = document.getElementById("docs-player-stage");
    if (stage) {
      stage.classList.toggle("is-shorts-stage", isShortsMode);
    }

    ensureYVPlayer(function (player) {
      if (player.initialized("docs-player-stage")) {
        player.changeVideo("docs-player-stage", id, {
          isLive: isLiveMode,
          shorts: isShortsMode,
          background: isBgMode,
          autoplay: true,
          loop: (isBgMode || isShortsMode)
        });
        if (isBgMode) {
          player.mute("docs-player-stage");
          player.setVolume("docs-player-stage", 0);
        } else {
          player.play("docs-player-stage");
        }
        return;
      }

      player.init("docs-player-stage", {
        defaultId: id,
        autoplay: true,
        thumbnail: isBgMode ? false : true,
        isLive: isLiveMode,
        shorts: isShortsMode,
        background: isBgMode,
        theme: currentModalTheme,
        customColor: currentModalColor,
        loop: (isBgMode || isShortsMode) ? true : false,
        storyboard: isShortsMode ? false : true,
        pipMode: "os",
        enableHotkeys: !isBgMode
      }).then(function () {
        if (player.setTheme && currentModalColor) {
          player.setTheme("docs-player-stage", currentModalColor, currentModalTheme);
        }
        if (isBgMode) {
          player.mute("docs-player-stage");
          player.setVolume("docs-player-stage", 0);
        } else {
          player.play("docs-player-stage");
        }
      }).catch(function (err) {
        console.error("Modal player init error:", err);
      });
    });
  }

  function openDemoModal(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!demoModal) return;
    demoModal.style.display = "flex";
    playInModal(currentModalVideoId);
  }

  function closeDemoModal() {
    if (!demoModal) return;
    demoModal.style.display = "none";
    var player = window.YVPlayer;
    if (player && player.initialized("docs-player-stage")) {
      player.pause("docs-player-stage");
    }
  }

  // Bind all demo trigger buttons in docs (only explicit demo triggers, never Home/navigation links)
  var demoTriggers = document.querySelectorAll('.btn-open-demo, #open-docs-demo-btn');
  demoTriggers.forEach(function (trigger) {
    trigger.addEventListener("click", openDemoModal);
  });

  if (closeDemoBtn) closeDemoBtn.addEventListener("click", closeDemoModal);
  if (demoBackdrop) demoBackdrop.addEventListener("click", closeDemoModal);

  window.addEventListener("keydown", function (e) {
    if (demoModal && demoModal.style.display !== "none") {
      if (currentModalIsBackground && (e.key === " " || e.key === "k" || e.key === "K")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.key === "Escape") {
        closeDemoModal();
      }
    }
  });

  // Modal Input
  function handleModalPlay() {
    var raw = demoInput ? demoInput.value.trim() : "";
    var id = extractId(raw);
    if (id) {
      var isLive = raw.includes("/live/") || (id === "0sfDth4lMLc");
      var isShorts = raw.includes("/shorts/") || (id === "YlyI2jmHEYc");
      var isBg = raw.includes("background=true");
      playInModal(id, { isLive: isLive, shorts: isShorts, background: isBg });
    }
  }

  if (demoLoadBtn) demoLoadBtn.addEventListener("click", handleModalPlay);
  if (demoInput) {
    demoInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") handleModalPlay();
    });
  }

  // Modal Sample Chips
  var demoChips = document.querySelectorAll(".docs-sample-chip");
  demoChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var id = chip.getAttribute("data-id");
      var isLive = chip.getAttribute("data-live") === "true";
      var isShorts = chip.getAttribute("data-shorts") === "true";
      var isBg = chip.getAttribute("data-background") === "true";
      if (id) {
        playInModal(id, { isLive: isLive, shorts: isShorts, background: isBg });
      }
    });
  });

  // Modal Theme Buttons
  demoThemeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      demoThemeBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var color = btn.getAttribute("data-color");
      var theme = btn.getAttribute("data-theme");
      currentModalColor = color || "#fe0001";
      currentModalTheme = theme || "red";
      var player = window.YVPlayer;
      var stage = document.getElementById("docs-player-stage");
      if (stage) {
        stage.style.setProperty("--themeAccent", color);
        stage.style.setProperty("--sliderSeekTrackColor", color);
        stage.style.setProperty("--sliderThumbColor", color);
        stage.style.setProperty("--yv-theme", color);
        var inner = stage.querySelector(".yvPlayer");
        if (inner) {
          inner.style.setProperty("--themeAccent", color);
          inner.style.setProperty("--sliderSeekTrackColor", color);
          inner.style.setProperty("--sliderThumbColor", color);
          inner.style.setProperty("--yv-theme", color);
        }
      }
      if (player && player.setTheme) {
        player.setTheme("docs-player-stage", color, theme);
      }
    });
  });
});

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


// Mobile Sidebar Navigation Drawer
(function initMobileSidebar() {
  var toggleBtn = document.getElementById("mobile-sidebar-toggle");
  var sidebar = document.querySelector(".docs-sidebar");
  var backdrop = document.getElementById("sidebar-backdrop");

  if (!toggleBtn || !sidebar) return;

  function openSidebar() {
    sidebar.classList.add("is-open");
    if (backdrop) backdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("is-open");
    if (backdrop) backdrop.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  toggleBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    if (sidebar.classList.contains("is-open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  if (backdrop) {
    backdrop.addEventListener("click", closeSidebar);
  }

  // Close drawer when any sidebar link is clicked
  sidebar.querySelectorAll(".nav-link").forEach(function(link) {
    link.addEventListener("click", function() {
      if (window.innerWidth <= 900) {
        closeSidebar();
      }
    });
  });
})();

// Dynamic OS detection for keyboard shortcuts (replace Mac ⌘ with Ctrl on Windows/Linux)
(function initOSShortcuts() {
  var isMac = typeof navigator !== "undefined" && /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform || "");
  document.querySelectorAll(".kbd-pill, .notion-kbd-pill").forEach(function(el) {
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
    var cdnBase = "https://cdn.jsdelivr.net/gh/thevikasgurjar/yvplayer@main";
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


document.addEventListener("DOMContentLoaded", function () {
  initPromptGenerator("#ai-prompt-generator");
});
