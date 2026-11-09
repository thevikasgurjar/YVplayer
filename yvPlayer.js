function whenYTReady() {
  return new Promise(function (resolve) {
    if (window.YT && window.YT.Player) return resolve();
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      var tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
    var timer = setInterval(function () {
      if (window.YT && window.YT.Player) {
        clearInterval(timer);
        resolve();
      }
    }, 30);
    setTimeout(function () {
      clearInterval(timer);
      resolve();
    }, 10000);
  });
}

// Fast helper for YouTube ID extraction across formats
function extractVideoId(input) {
  if (!input) return "";
  var str = String(input).trim();
  var match = str.match(/(?:v=|\/v\/|\/embed\/|\/shorts\/|\/live\/|youtu\.be\/|\/e\/|^)([a-zA-Z0-9_-]{11})(?:[?&/#]|$)/);
  return (match && match[1]) ? match[1] : (/^[a-zA-Z0-9_-]{11}$/.test(str) ? str : "");
}

var YVPlayer = {
  players: {},
  extractVideoId: extractVideoId,
  preSetup: (videoTag, playerTagId, defaultId) => {
    var pParams = (YVPlayer.players[videoTag] && YVPlayer.players[videoTag].params) || {};
    var theme = ("theme" in pParams) ? pParams["theme"] : null;
    var themeClass = theme ? "theme-" + theme : "";
    var isLiveInit = !!pParams.isLive;
    var isShortsInit = !!(pParams.shorts || pParams.isShorts);
    var isBgInit = !!pParams.background;
    var liveClass = isLiveInit ? "is-live-stream" : "";
    var shortsClass = isShortsInit ? "is-shorts" : "";
    var bgClass = isBgInit ? "is-background" : "";
    
    var wrapperEl = document.getElementById(videoTag) ? document.getElementById(videoTag).closest(".player-wrapper") : null;
    if (wrapperEl) {
      wrapperEl.classList.toggle("is-shorts-stage", isShortsInit);
    }
    
    return new Promise((resolve, reject) => {
      var hostEl = document.getElementById(videoTag);
      if (hostEl) hostEl.innerHTML = `
      <div class="yvPlayer ${themeClass} ${liveClass} ${shortsClass} ${bgClass}" tabindex="0">
        <div class="yvPlayer-native-pip-notice">Playing in picture-in-picture</div>
        <button type="button" class="yvPlayer-native-pip-exit-btn" aria-label="Exit picture-in-picture">
          <span>Exit picture-in-picture</span>
          <i class="ti ti-app-window"></i>
        </button>
        <div class="yvPlayer-ripple-zone yvPlayer-ripple-left"><div class="yvPlayer-ripple-content"><i class="ti ti-chevrons-left"></i><span>10s</span></div></div>
        <div class="yvPlayer-ripple-zone yvPlayer-ripple-right"><div class="yvPlayer-ripple-content"><i class="ti ti-chevrons-right"></i><span>10s</span></div></div>
        <div class="yvPlayer-hud-pill" style="display:none;"><i class="ti ti-volume"></i><span>100%</span></div>
        <div class="yvPlayer-pip-resizer" data-type="tl"></div>
        <div class="yvPlayer-pip-resizer" data-type="tr"></div>
        <div class="yvPlayer-pip-resizer" data-type="bl"></div>
        <div class="yvPlayer-pip-resizer" data-type="br"></div>

<div class="yvPlayer-container">
 <span><div></div>
 <i class="ti ti-player-play-filled yvPlayer-loading"></i>
 <div></div></span>
 <div id=${playerTagId}></div>
</div>
<div class="yvPlayer-captions-box"><span class="yvPlayer-caption-line"></span></div>
<div class="yvPlayer-controls-box">
  <main>
  <i class="ti ti-rewind-backward-10" title="Rewind 10s"></i>
  <i class="ti yvPlayer-play-pause-btn ti-player-play-filled" title="Play/Pause"></i>
  <i class="ti ti-rewind-forward-10" title="Forward 10s"></i>
  </main>
 <div class="yvPlayer-controls">
  <div class="yvPlayer-slider-container">
    <span class="yvPlayer-rail-track"></span>
    <div class="yvPlayer-chapter-notches"></div>
    <span class="yvPlayer-loaded-track"></span>
    <span class="yvPlayer-hover-track"></span>
    <input type="range" min="0" max="100" value="0" step="any" aria-label="Video seek bar">
    <div class="yvPlayer-timeline-preview">
      <div class="yvPlayer-preview-thumb-box">
        <div class="yvPlayer-preview-thumb"></div>
      </div>
      <span class="yvPlayer-preview-time">00:00</span>
    </div>
  </div>
  <div class="yvPlayer-controls-row">
    <div class="yvPlayer-left-controls">
      <button type="button" class="yvPlayer-btn-pill yvPlayer-bottom-play" title="Play/Pause" aria-label="Play or pause">
        <i class="ti ti-player-play-filled"></i>
      </button>
      <div class="yvPlayer-volume-group">
        <button type="button" class="yvPlayer-btn-pill yvPlayer-vol-btn" title="Mute/Unmute" aria-label="Mute or unmute">
          <i class="ti ti-volume"></i>
        </button>
        <div class="yvPlayer-vol-slider-wrap">
          <input type="range" class="yvPlayer-vol-slider" min="0" max="100" value="100" step="1" aria-label="Volume">
        </div>
      </div>
      <div class="yvPlayer-time-capsule">
        <span class="yvPlayer-curr-time">0:00</span>
        <span class="yvPlayer-time-divider">/</span>
        <span class="yvPlayer-dur-time">0:00</span>
      </div>
      <button type="button" class="yvPlayer-live-badge" title="Live Broadcast (Click to sync to real-time live edge)">
        <span class="yvPlayer-live-dot"></span>
        <span class="yvPlayer-live-text">LIVE</span>
      </button>
    </div>
    <div class="yvPlayer-right-controls">
      <div class="yvPlayer-speed-wrap">
        <div class="yvPlayer-speed-box">
          <button type="button" class="yvPlayer-speed-inline-btn yvPlayer-speed-inline-minus" title="Decrease speed">
            <i class="ti ti-minus"></i>
          </button>
          <button type="button" class="yvPlayer-speed-val-btn yvPlayer-speed-btn" title="Playback speed (s)">
            <span class="yvPlayer-speed-val yvPlayer-speed-val-default">1x</span><span class="yvPlayer-speed-val-hover">1.00</span>
          </button>
          <button type="button" class="yvPlayer-speed-inline-btn yvPlayer-speed-inline-plus" title="Increase speed">
            <i class="ti ti-plus"></i>
          </button>
        </div>
        <div class="yvPlayer-speed-panel">
          <div class="yvPlayer-speed-slider-container">
            <input type="range" class="yvPlayer-speed-slider" min="0.25" max="3" value="1" step="0.05" aria-label="Playback speed">
          </div>
        </div>
      </div>
      <div class="yvPlayer-right-capsule">
        <button type="button" class="yvPlayer-capsule-btn yvPlayer-cc-btn" title="Subtitles/Captions (c)" aria-label="Toggle subtitles and captions">
          <i class="ti ti-badge-cc"></i>
        </button>
        <button type="button" class="yvPlayer-capsule-btn settingsBtn" title="Settings" aria-label="Open player settings">
          <i class="ti ti-settings"></i>
        </button>
        <button type="button" class="yvPlayer-capsule-btn pipBtn" title="Picture in Picture (p)" aria-label="Toggle picture-in-picture">
          <i class="ti ti-picture-in-picture"></i>
        </button>
        <button type="button" class="yvPlayer-capsule-btn fsBtn" title="Full screen (f)" aria-label="Toggle fullscreen">
          <i class="ti ti-maximize"></i>
        </button>
      </div>
    </div>
  </div>
 </div>
 <div class="yvPlayer-settings-box">
  <div class="yvPlayer-settings-page yvPlayer-settings-page-main is-active">
    <div class="yvPlayer-settings-row" data-target="quality">
      <div class="yvPlayer-settings-row-left">
        <i class="ti ti-adjustments-horizontal"></i>
        <span>Quality</span>
      </div>
      <div class="yvPlayer-settings-row-right">
        <b class="yvPlayer-curr-qual-label">auto</b>
        <i class="ti ti-chevron-right"></i>
      </div>
    </div>
    <div class="yvPlayer-settings-row" data-target="speed">
      <div class="yvPlayer-settings-row-left">
        <i class="ti ti-dashboard"></i>
        <span>Playback Speed</span>
      </div>
      <div class="yvPlayer-settings-row-right">
        <b class="yvPlayer-curr-speed-label">1x</b>
        <i class="ti ti-chevron-right"></i>
      </div>
    </div>
    <div class="yvPlayer-settings-row" data-target="theme">
      <div class="yvPlayer-settings-row-left">
        <i class="ti ti-palette"></i>
        <span>Theme Colors</span>
      </div>
      <div class="yvPlayer-settings-row-right">
        <b class="yvPlayer-curr-theme-label">Red</b>
        <i class="ti ti-chevron-right"></i>
      </div>
    </div>
    <div class="yvPlayer-settings-row" data-target="captions">
      <div class="yvPlayer-settings-row-left">
        <i class="ti ti-typography"></i>
        <span>Caption Style</span>
      </div>
      <div class="yvPlayer-settings-row-right">
        <b class="yvPlayer-curr-caption-style-label">Transparent</b>
        <i class="ti ti-chevron-right"></i>
      </div>
    </div>
    <div class="yvPlayer-settings-row" data-target="pipMode">
      <div class="yvPlayer-settings-row-left">
        <i class="ti ti-picture-in-picture"></i>
        <span>PiP Mode</span>
      </div>
      <div class="yvPlayer-settings-row-right">
        <b class="yvPlayer-curr-pip-mode-label">Native Video</b>
        <i class="ti ti-chevron-right"></i>
      </div>
    </div>
    <div class="yvPlayer-settings-row" data-target="sleepTimer">
      <div class="yvPlayer-settings-row-left">
        <i class="ti ti-moon"></i>
        <span>Sleep Timer</span>
      </div>
      <div class="yvPlayer-settings-row-right">
        <b class="yvPlayer-curr-sleep-label">Off</b>
        <i class="ti ti-chevron-right"></i>
      </div>
    </div>

    <div class="yvPlayer-settings-row yvPlayer-loop-row" data-action="toggleLoop">
      <div class="yvPlayer-settings-row-left">
        <i class="ti ti-repeat"></i>
        <span>Loop</span>
      </div>
      <div class="yvPlayer-settings-row-right">
        <b class="yvPlayer-curr-loop-label">Off</b>
        <div class="yvPlayer-toggle-switch" role="switch" aria-checked="false" aria-label="Toggle Loop">
          <div class="yvPlayer-toggle-thumb"></div>
        </div>
      </div>
    </div>

    <div class="yvPlayer-settings-row yvPlayer-shortcuts-row">
      <div class="yvPlayer-settings-row-left">
        <i class="ti ti-keyboard"></i>
        <span>Shortcuts</span>
      </div>
      <div class="yvPlayer-settings-row-right">
        <kbd class="yvPlayer-kbd-hint">?</kbd>
      </div>
    </div>
  </div>

  <div class="yvPlayer-settings-page yvPlayer-settings-page-sub yvPlayer-page-quality" data-page="quality">
    <div class="yvPlayer-settings-sub-header">
      <button type="button" class="yvPlayer-settings-back-btn" title="Back">
        <i class="ti ti-chevron-left"></i>
      </button>
      <span>Playback Quality</span>
    </div>
    <div class="yvPlayer-settings-options-list yvPlayer-quality-options">
      <!-- Dynamic list -->
    </div>
  </div>

  <div class="yvPlayer-settings-page yvPlayer-settings-page-sub yvPlayer-page-speed" data-page="speed">
    <div class="yvPlayer-settings-sub-header">
      <button type="button" class="yvPlayer-settings-back-btn" title="Back">
        <i class="ti ti-chevron-left"></i>
      </button>
      <span>Playback Speed</span>
    </div>
    <div class="yvPlayer-settings-options-list yvPlayer-speed-options">
      <div class="yvPlayer-settings-row yvPlayer-speed-opt" data-rate="0.25"><span>0.25x</span><i class="ti ti-check"></i></div>
      <div class="yvPlayer-settings-row yvPlayer-speed-opt" data-rate="0.5"><span>0.5x</span><i class="ti ti-check"></i></div>
      <div class="yvPlayer-settings-row yvPlayer-speed-opt" data-rate="0.75"><span>0.75x</span><i class="ti ti-check"></i></div>
      <div class="yvPlayer-settings-row yvPlayer-speed-opt is-active" data-rate="1"><span>Normal (1x)</span><i class="ti ti-check"></i></div>
      <div class="yvPlayer-settings-row yvPlayer-speed-opt" data-rate="1.25"><span>1.25x</span><i class="ti ti-check"></i></div>
      <div class="yvPlayer-settings-row yvPlayer-speed-opt" data-rate="1.5"><span>1.5x</span><i class="ti ti-check"></i></div>
      <div class="yvPlayer-settings-row yvPlayer-speed-opt" data-rate="1.75"><span>1.75x</span><i class="ti ti-check"></i></div>
      <div class="yvPlayer-settings-row yvPlayer-speed-opt" data-rate="2"><span>2x</span><i class="ti ti-check"></i></div>
    </div>
  </div>

  <div class="yvPlayer-settings-page yvPlayer-settings-page-sub yvPlayer-page-theme" data-page="theme">
    <div class="yvPlayer-settings-sub-header">
      <button type="button" class="yvPlayer-settings-back-btn" title="Back">
        <i class="ti ti-chevron-left"></i>
      </button>
      <span>Theme Colors</span>
    </div>
    <div class="yvPlayer-settings-section-title">Accent Color</div>
    <div class="yvPlayer-swatches-grid yvPlayer-theme-swatches">
      <button type="button" class="yvPlayer-theme-swatch is-active" data-color="#fe0001" data-name="Classic Red" style="background:#fe0001;" title="Classic Red"></button>
      <button type="button" class="yvPlayer-theme-swatch" data-color="#00e5ff" data-name="City" style="background:#00e5ff;" title="City (Cyan)"></button>
      <button type="button" class="yvPlayer-theme-swatch" data-color="#a855f7" data-name="Fantasy" style="background:#a855f7;" title="Fantasy (Purple)"></button>
      <button type="button" class="yvPlayer-theme-swatch" data-color="#10b981" data-name="Forest" style="background:#10b981;" title="Forest (Emerald)"></button>
      <button type="button" class="yvPlayer-theme-swatch" data-color="#06b6d4" data-name="Sea" style="background:#06b6d4;" title="Sea (Teal)"></button>
      <button type="button" class="yvPlayer-theme-swatch" data-color="#f59e0b" data-name="Amber" style="background:#f59e0b;" title="Amber Gold"></button>
      <button type="button" class="yvPlayer-theme-swatch" data-color="#ffffff" data-name="Minimal" style="background:#ffffff;" title="Minimal White"></button>
    </div>
    <label class="yvPlayer-custom-color-row">
      <span>Custom Theme Color</span>
      <input type="color" class="yvPlayer-custom-theme-picker" value="#fe0001">
    </label>
  </div>

  <div class="yvPlayer-settings-page yvPlayer-settings-page-sub yvPlayer-page-captions" data-page="captions">
    <div class="yvPlayer-settings-sub-header">
      <button type="button" class="yvPlayer-settings-back-btn" title="Back">
        <i class="ti ti-chevron-left"></i>
      </button>
      <span>Caption Style</span>
    </div>
    <div class="yvPlayer-caption-preview-card">
      <div class="yvPlayer-caption-preview-stage">
        <span class="yvPlayer-caption-preview-text">Sample Subtitle Preview</span>
      </div>
    </div>
    <div class="yvPlayer-settings-section-title">Background Style</div>
    <div class="yvPlayer-segmented-control">
      <button type="button" class="yvPlayer-segment-btn is-active" data-bg-mode="none">Without Bg</button>
      <button type="button" class="yvPlayer-segment-btn" data-bg-mode="box">With Bg</button>
    </div>

    <div class="yvPlayer-settings-section-title">Text Color</div>
    <div class="yvPlayer-swatches-row yvPlayer-caption-text-colors">
      <button type="button" class="yvPlayer-color-swatch is-active" data-color="#ffffff" style="background:#ffffff;" title="White"></button>
      <button type="button" class="yvPlayer-color-swatch" data-color="#ffff00" style="background:#ffff00;" title="Yellow"></button>
      <button type="button" class="yvPlayer-color-swatch" data-color="#00e5ff" style="background:#00e5ff;" title="Cyan"></button>
      <button type="button" class="yvPlayer-color-swatch" data-color="#69f0ae" style="background:#69f0ae;" title="Green"></button>
      <button type="button" class="yvPlayer-color-swatch" data-color="#000000" style="background:#000000; border:1px solid rgba(255,255,255,0.4);" title="Black"></button>
      <label class="yvPlayer-custom-swatch-picker" title="Custom text color">
        <i class="ti ti-color-picker"></i>
        <input type="color" class="yvPlayer-caption-custom-text-color" value="#ffffff">
      </label>
    </div>

    <div class="yvPlayer-caption-bg-options-box" style="display:none;">
      <div class="yvPlayer-settings-section-title">Background Color</div>
      <div class="yvPlayer-swatches-row yvPlayer-caption-bg-colors">
        <button type="button" class="yvPlayer-color-swatch is-active" data-color="#000000" style="background:#000000; border:1px solid rgba(255,255,255,0.3);" title="Black"></button>
        <button type="button" class="yvPlayer-color-swatch" data-color="#1e293b" style="background:#1e293b;" title="Navy Slate"></button>
        <button type="button" class="yvPlayer-color-swatch" data-color="#262626" style="background:#262626;" title="Charcoal"></button>
        <button type="button" class="yvPlayer-color-swatch" data-color="#450a0a" style="background:#450a0a;" title="Dark Red"></button>
        <label class="yvPlayer-custom-swatch-picker" title="Custom background color">
          <i class="ti ti-color-picker"></i>
          <input type="color" class="yvPlayer-caption-custom-bg-color" value="#000000">
        </label>
      </div>

      <div class="yvPlayer-settings-section-title">Background Transparency: <b class="yvPlayer-caption-opacity-val">75%</b></div>
      <div class="yvPlayer-opacity-slider-row">
        <input type="range" class="yvPlayer-caption-opacity-slider" min="0" max="100" value="75" step="5">
      </div>
    </div>
  </div>

  <div class="yvPlayer-settings-page yvPlayer-settings-page-sub yvPlayer-page-pip" data-page="pipMode">
    <div class="yvPlayer-settings-sub-header">
      <button type="button" class="yvPlayer-settings-back-btn" title="Back">
        <i class="ti ti-chevron-left"></i>
      </button>
      <span>PiP Mode</span>
    </div>
    <div class="yvPlayer-settings-options-list yvPlayer-pip-options">
      <div class="yvPlayer-settings-row yvPlayer-pip-opt" data-mode="document">
        <div class="yvPlayer-settings-row-left">
          <i class="ti ti-app-window"></i>
          <div>
            <div style="font-weight: 600;">Document PiP</div>
            <div style="font-size: 11px; opacity: 0.65;">Full custom player in OS window</div>
          </div>
        </div>
        <i class="ti ti-check"></i>
      </div>
      <div class="yvPlayer-settings-row yvPlayer-pip-opt is-active" data-mode="os">
        <div class="yvPlayer-settings-row-left">
          <i class="ti ti-device-tv"></i>
          <div>
            <div style="font-weight: 600;">Native Video PiP</div>
            <div style="font-size: 11px; opacity: 0.65;">720p HD stream with synced controls</div>
          </div>
        </div>
        <i class="ti ti-check"></i>
      </div>
      <div class="yvPlayer-settings-row yvPlayer-pip-opt" data-mode="inpage">
        <div class="yvPlayer-settings-row-left">
          <i class="ti ti-layout-bottombar-collapse"></i>
          <div>
            <div style="font-weight: 600;">In-Page Dock</div>
            <div style="font-size: 11px; opacity: 0.65;">16:9 corner-docked mini player</div>
          </div>
        </div>
        <i class="ti ti-check"></i>
      </div>
    </div>
  </div>

  <div class="yvPlayer-settings-page yvPlayer-settings-page-sub yvPlayer-page-sleep" data-page="sleepTimer">
    <div class="yvPlayer-settings-sub-header">
      <button type="button" class="yvPlayer-settings-back-btn" title="Back">
        <i class="ti ti-chevron-left"></i>
      </button>
      <span>Sleep Timer</span>
    </div>
    <div class="yvPlayer-settings-options-list yvPlayer-sleep-options">
      <div class="yvPlayer-settings-row yvPlayer-sleep-opt is-active" data-minutes="0"><span>Off</span><i class="ti ti-check"></i></div>
      <div class="yvPlayer-settings-row yvPlayer-sleep-opt" data-minutes="15"><span>15 minutes</span><i class="ti ti-check"></i></div>
      <div class="yvPlayer-settings-row yvPlayer-sleep-opt" data-minutes="30"><span>30 minutes</span><i class="ti ti-check"></i></div>
      <div class="yvPlayer-settings-row yvPlayer-sleep-opt" data-minutes="45"><span>45 minutes</span><i class="ti ti-check"></i></div>
      <div class="yvPlayer-settings-row yvPlayer-sleep-opt" data-minutes="60"><span>60 minutes</span><i class="ti ti-check"></i></div>
      <div class="yvPlayer-settings-row yvPlayer-sleep-opt" data-minutes="-1"><span>End of video</span><i class="ti ti-check"></i></div>
    </div>
  </div>
 </div>

 <div class="yvPlayer-shortcuts-modal" style="display:none;">
  <div class="yvPlayer-shortcuts-dialog">
    <div class="yvPlayer-shortcuts-header">
      <div class="yvPlayer-shortcuts-title">
        <i class="ti ti-keyboard"></i>
        <span>Keyboard Shortcuts</span>
      </div>
      <button type="button" class="yvPlayer-shortcuts-close-btn" title="Close (Esc)">
        <i class="ti ti-x"></i>
      </button>
    </div>
    <div class="yvPlayer-shortcuts-grid">
      <div class="yvPlayer-shortcut-item"><kbd>Space</kbd> / <kbd>K</kbd> <span>Play / Pause</span></div>
      <div class="yvPlayer-shortcut-item"><kbd>J</kbd> / <kbd>L</kbd> <span>Rewind / Skip 10s</span></div>
      <div class="yvPlayer-shortcut-item"><kbd>←</kbd> / <kbd>→</kbd> <span>Rewind / Skip 5s</span></div>
      <div class="yvPlayer-shortcut-item"><kbd>↑</kbd> / <kbd>↓</kbd> <span>Volume Up / Down 5%</span></div>
      <div class="yvPlayer-shortcut-item"><kbd>M</kbd> <span>Mute / Unmute</span></div>
      <div class="yvPlayer-shortcut-item"><kbd>C</kbd> <span>Subtitles / CC</span></div>
      <div class="yvPlayer-shortcut-item"><kbd>S</kbd> <span>Speed Panel</span></div>
      <div class="yvPlayer-shortcut-item"><kbd>P</kbd> <span>Picture-in-Picture</span></div>
      <div class="yvPlayer-shortcut-item"><kbd>F</kbd> <span>Full Screen</span></div>
      <div class="yvPlayer-shortcut-item"><kbd>,</kbd> / <kbd>.</kbd> <span>Frame Step (When Paused)</span></div>
      <div class="yvPlayer-shortcut-item"><kbd>0</kbd> - <kbd>9</kbd> <span>Seek to 0% - 90%</span></div>
      <div class="yvPlayer-shortcut-item"><kbd>?</kbd> <span>Shortcuts Dialog</span></div>
      <div class="yvPlayer-shortcut-item"><kbd>Esc</kbd> <span>Close Any Menu / Exit</span></div>
    </div>
  </div>
 </div>
</div>
</div>`;
      resolve();
    });
  },
  pauseVideoWithPromise: (x) => {
    return new Promise((resolve, reject) => {
      try {
        if (x && typeof x.pauseVideo === "function") {
          x.pauseVideo();
          resolve('Video paused');
        } else {
          resolve('Player not ready');
        }
      } catch (error) {
        reject('Error pausing video: ' + error);
      }
    });
  },
  YtSetup: (videoTag, playerTagId, defaultId) => {
    var parent = document.querySelector("#" + playerTagId).closest(".yvPlayer");
    var controlsTimeout = null;
    var hasStarted = false;
    var ignorePlayPauseUntil = 0;
    var targetQuality = "auto";
    var captionsEnabled = false;
    var captionsList = [];
    var currentPipMode = "document";
    try {
      currentPipMode = localStorage.getItem("yvPlayer_pipMode") || "document";
    } catch (e) { }

    var playerParams = (YVPlayer.players[videoTag] && YVPlayer.players[videoTag].params) || {};
    var isLiveStream = !!playerParams.isLive;
    var isLiveDvrBehind = false;
    var isShorts = !!(playerParams.shorts || playerParams.isShorts);
    var isBackground = !!playerParams.background;

    if (isLiveStream) {
      parent.classList.add("is-live-stream");
    }
    if (isShorts) {
      parent.classList.add("is-shorts");
      var w = parent.closest(".player-wrapper");
      if (w) w.classList.add("is-shorts-stage");
    }
    if (isBackground) {
      parent.classList.add("is-background");
    }

    function checkLiveBroadcast() {
      try {
        var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
        if (!yt) return;
        var data = yt.getVideoData ? yt.getVideoData() : null;
        var dur = (typeof yt.getDuration === "function") ? yt.getDuration() : 0;
        var curParams = (YVPlayer.players[videoTag] && YVPlayer.players[videoTag].params) || {};
        var isLiveExplicit = !!curParams.isLive;
        var isLiveDetected = isLiveExplicit ||
          (data && (data.isLive || data.isLiveStream || data.isWindowedLive || data.allowLiveDvr)) ||
          (dur === 0 && YVPlayer.players[videoTag] && YVPlayer.players[videoTag]["isPlaying"]);

        if (isLiveDetected) {
          if (!isLiveStream) {
            isLiveStream = true;
            isLiveDvrBehind = false;
            parent.classList.add("is-live-stream");
          }
          if (dur > 30) {
            parent.classList.add("has-dvr");
          }
        } else if (dur > 0 && data && !data.isLive && !isLiveExplicit) {
          if (isLiveStream) {
            isLiveStream = false;
            isLiveDvrBehind = false;
            parent.classList.remove("is-live-stream");
            parent.classList.remove("has-dvr");
            parent.classList.remove("is-live-behind");
          }
        }
      } catch (e) { }
    }

    var hudPill = parent.querySelector(".yvPlayer-hud-pill");
    var hudTimer = null;
    function showHUD(iconClass, text) {
      if (!hudPill) hudPill = parent.querySelector(".yvPlayer-hud-pill");
      if (!hudPill) return;
      clearTimeout(hudTimer);
      var iEl = hudPill.querySelector("i");
      var sEl = hudPill.querySelector("span");
      if (iEl) iEl.className = iconClass;
      if (sEl) sEl.textContent = text;
      hudPill.style.display = "inline-flex";
      hudPill.classList.remove("fade-out");
      hudPill.classList.add("is-visible");
      hudTimer = setTimeout(function () {
        hudPill.classList.add("fade-out");
        setTimeout(function () {
          hudPill.style.display = "none";
          hudPill.classList.remove("is-visible", "fade-out");
        }, 220);
      }, 1200);
    }

    var sleepTimerId = null;
    var sleepEndTimestamp = 0;
    var sleepMode = 0; // 0: off, >0: minutes, -1: end of video
    function updateSleepLabelCountdown() {
      if (sleepMode <= 0) return;
      var sleepLabel = parent.querySelector(".yvPlayer-curr-sleep-label");
      var remaining = Math.max(0, Math.round((sleepEndTimestamp - Date.now()) / 1000));
      if (remaining <= 0) {
        clearInterval(sleepTimerId);
        sleepTimerId = null;
        var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
        if (yt && typeof yt.pauseVideo === "function") yt.pauseVideo();
        setSleepTimer(0);
        showHUD("ti ti-moon", "Sleep Timer: Paused");
        return;
      }
      var mins = Math.floor(remaining / 60);
      var secs = remaining % 60;
      if (sleepLabel) sleepLabel.textContent = mins + "m " + (secs < 10 ? "0" : "") + secs + "s";
    }

    function setSleepTimer(minutes) {
      clearInterval(sleepTimerId);
      sleepTimerId = null;
      sleepMode = minutes;
      var sleepLabel = parent.querySelector(".yvPlayer-curr-sleep-label");

      parent.querySelectorAll(".yvPlayer-sleep-opt").forEach(function (opt) {
        opt.classList.toggle("is-active", parseInt(opt.getAttribute("data-minutes"), 10) === minutes);
      });

      if (minutes === 0) {
        if (sleepLabel) sleepLabel.textContent = "Off";
        showHUD("ti ti-moon-off", "Sleep Timer Off");
      } else if (minutes === -1) {
        if (sleepLabel) sleepLabel.textContent = "End of Video";
        showHUD("ti ti-moon", "Sleep: At Video End");
      } else {
        sleepEndTimestamp = Date.now() + (minutes * 60 * 1000);
        showHUD("ti ti-moon", "Sleep in " + minutes + "m");
        updateSleepLabelCountdown();
        sleepTimerId = setInterval(updateSleepLabelCountdown, 1000);
      }
    }

    function toggleShortcutsModal(open) {
      var shortcutsModal = parent.querySelector(".yvPlayer-shortcuts-modal");
      if (!shortcutsModal) return;
      var show = typeof open === "boolean" ? open : (shortcutsModal.style.display === "none");
      shortcutsModal.style.display = show ? "flex" : "none";
      if (show) {
        var sb = parent.querySelector(".yvPlayer-settings-box");
        if (sb) sb.style.display = "none";
      }
    }

    var pendingPlay = false;

    return new Promise((resolve, reject) => {
      var isResolved = false;
      function safeResolve() {
        if (!isResolved) {
          isResolved = true;
          resolve();
        }
      }
      setTimeout(safeResolve, 4000);

      const initControls = () => {
                try { initSettingsEvents(); } catch (e) { }
                var startOverlay = parent.querySelector(".yvPlayer-container span");
                if (startOverlay) {
                  startOverlay.style.pointerEvents = "auto";
                  startOverlay.style.cursor = "pointer";
                  function handleThumbnailStart(e) {
                    if (e) {
                      e.preventDefault();
                      e.stopPropagation();
                      if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
                    }
                    if (typeof clickTimeout !== "undefined" && clickTimeout) {
                      clearTimeout(clickTimeout);
                      clickTimeout = null;
                    }
                    if (typeof lastClickTime !== "undefined") {
                      lastClickTime = 0;
                    }
                    ignorePlayPauseUntil = Date.now() + 800;
                    hasStarted = true;
                    parent.classList.add("is-active");
                    parent.classList.add("is-playing");
                    parent.classList.remove("is-paused");
                    var wasEnded = parent.classList.contains("is-ended");
                    parent.classList.remove("is-ended");
                    if (YVPlayer.players[videoTag]) {
                      YVPlayer.players[videoTag]["isPlaying"] = true;
                      YVPlayer.players[videoTag]["playerState"] = "playing";
                    }
                    startOverlay.style.setProperty("display", "none", "important");
                    startOverlay.style.setProperty("pointer-events", "none", "important");
                    var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
                    if (yt) {
                      if (typeof yt.unMute === "function" && !(playerParams && playerParams.background)) {
                        try { yt.unMute(); } catch (err) { }
                      }
                      if (wasEnded && typeof yt.seekTo === "function") {
                        try { yt.seekTo(0, true); } catch (err) { }
                      }
                      if (typeof yt.playVideo === "function") {
                        try { yt.playVideo(); } catch (err) { }
                      } else {
                        pendingPlay = true;
                      }
                    } else {
                      pendingPlay = true;
                    }
                    if (typeof initControlsOnce === "function") {
                      try { initControlsOnce(); } catch (err) { }
                    }
                  }
                  startOverlay.addEventListener("click", handleThumbnailStart, true);
                  startOverlay.onclick = handleThumbnailStart;
                }
                var loaderIcon = parent.querySelector(".yvPlayer-container span i");
                if (loaderIcon) loaderIcon.classList.remove("yvPlayer-loading");

                if (YVPlayer.players[videoTag] && YVPlayer.players[videoTag]["videoTag"] && typeof YVPlayer.players[videoTag]["videoTag"].addEventListener === "function") {
                  YVPlayer.players[videoTag]["videoTag"].addEventListener('onStateChange', onPlayerStateChange);
                }
                var btnBack = parent.querySelector(".yvPlayer-controls-box main i:nth-of-type(1)");
                var liveBadgeBtn = parent.querySelector(".yvPlayer-live-badge");
                if (liveBadgeBtn) {
                  liveBadgeBtn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    if (!isLiveStream) return;
                    isLiveDvrBehind = false;
                    parent.classList.remove("is-live-behind");
                    var badgeText = parent.querySelector(".yvPlayer-live-text");
                    if (badgeText) badgeText.textContent = "LIVE";
                    var badge = parent.querySelector(".yvPlayer-live-badge");
                    if (badge) badge.title = "Live Broadcast (Synced to real-time live edge)";
                    var slider = parent.querySelector(".yvPlayer-slider-container input");
                    if (slider) {
                      slider.value = 100;
                      var sc = (YVPlayer.players[videoTag] && YVPlayer.players[videoTag].activeThemeColor) || activeThemeColor || "#fe0001";
                      slider.style.background = "linear-gradient(to right, " + sc + " 100%, transparent 100%)";
                    }
                    var ytPlayer = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
                    if (ytPlayer && typeof ytPlayer.seekTo === "function") {
                      ytPlayer.seekTo(9999999, true);
                    }
                    showHUD("ti ti-broadcast", "Synced to Live");
                  });
                }

                var btnPlayPause = parent.querySelector(".yvPlayer-controls-box main i:nth-of-type(2)");
                var btnFwd = parent.querySelector(".yvPlayer-controls-box main i:nth-of-type(3)");
                if (btnBack) btnBack.addEventListener("click", backward);
                if (btnPlayPause) {
                  btnPlayPause.addEventListener("click", function (e) {
                    if (e) e.stopPropagation();
                    if (Date.now() < ignorePlayPauseUntil) return;
                    togglePlayPause();
                  });
                }
                if (btnFwd) btnFwd.addEventListener("click", forward);

                var bottomPlayBtn = parent.querySelector(".yvPlayer-bottom-play");
                if (bottomPlayBtn) bottomPlayBtn.addEventListener("click", (e) => {
                  e.stopPropagation();
                  if (Date.now() < ignorePlayPauseUntil) return;
                  togglePlayPause();
                });

                var nativePipExitBtn = parent.querySelector(".yvPlayer-native-pip-exit-btn");
                if (nativePipExitBtn) {
                  nativePipExitBtn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    if (document.pictureInPictureElement) {
                      document.exitPictureInPicture().catch(function () { });
                    }
                  });
                }

                var volBtn = parent.querySelector(".yvPlayer-vol-btn");
                var volSlider = parent.querySelector(".yvPlayer-vol-slider");
                var lastVol = 100;

                function updateVolumeIcon(vol, muted) {
                  if (volSlider) {
                    var fillPct = muted ? 0 : vol;
                    volSlider.style.setProperty("--volPercent", fillPct + "%");
                  }
                  if (!volBtn) return;
                  var icon = volBtn.querySelector("i");
                  if (!icon) return;
                  if (muted || vol === 0) {
                    icon.className = "ti ti-volume-off";
                  } else if (vol < 50) {
                    icon.className = "ti ti-volume-2";
                  } else {
                    icon.className = "ti ti-volume";
                  }
                }

                if (volBtn) {
                  volBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (document.pictureInPictureElement && nativePipVideo && document.pictureInPictureElement === nativePipVideo) {
                      nativePipVideo.muted = !nativePipVideo.muted;
                      if (!nativePipVideo.muted && nativePipVideo.volume === 0) nativePipVideo.volume = 1;
                      var currentVal = nativePipVideo.muted ? 0 : Math.round(nativePipVideo.volume * 100);
                      if (volSlider) {
                        volSlider.value = currentVal;
                        volSlider.style.setProperty("--volPercent", currentVal + "%");
                      }
                      updateVolumeIcon(currentVal, nativePipVideo.muted);
                      return;
                    }
                    var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
                    if (!yt) return;
                    if (yt.isMuted && yt.isMuted()) {
                      yt.unMute();
                      var curV = yt.getVolume ? yt.getVolume() : lastVol;
                      if (curV === 0) curV = lastVol || 100;
                      yt.setVolume(curV);
                      if (volSlider) volSlider.value = curV;
                      updateVolumeIcon(curV, false);
                    } else {
                      lastVol = yt.getVolume ? yt.getVolume() : (volSlider ? parseFloat(volSlider.value) : 100);
                      yt.mute();
                      if (volSlider) volSlider.value = 0;
                      updateVolumeIcon(0, true);
                    }
                  });
                }

                if (volSlider) {
                  volSlider.addEventListener("input", (e) => {
                    e.stopPropagation();
                    var val = parseFloat(e.target.value);
                    volSlider.style.setProperty("--volPercent", val + "%");
                    if (document.pictureInPictureElement && nativePipVideo && document.pictureInPictureElement === nativePipVideo) {
                      if (val === 0) {
                        nativePipVideo.muted = true;
                        updateVolumeIcon(0, true);
                      } else {
                        nativePipVideo.muted = false;
                        nativePipVideo.volume = val / 100;
                        updateVolumeIcon(val, false);
                      }
                      return;
                    }
                    var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
                    if (!yt) return;
                    if (val === 0) {
                      yt.mute();
                      updateVolumeIcon(0, true);
                    } else {
                      if (yt.isMuted && yt.isMuted()) yt.unMute();
                      yt.setVolume(val);
                      lastVol = val;
                      updateVolumeIcon(val, false);
                    }
                  });
                }

                var captionBox = parent.querySelector(".yvPlayer-captions-box");
                var captionLine = parent.querySelector(".yvPlayer-caption-line");

                function loadCaptions(vid) {
                  captionsList = [];
                  if (!vid) return;
                  fetch("/api/captions?id=" + encodeURIComponent(vid))
                    .then(r => r.json())
                    .then(data => {
                      if (data && data.success && Array.isArray(data.captions)) {
                        captionsList = data.captions;
                        if (captionsEnabled) updateCaptions();
                      }
                    })
                    .catch(err => {
                      console.warn("Captions fetch notice:", err);
                    });
                }
                loadCaptions(YVPlayer.players[videoTag]["params"]["defaultId"]);
                YVPlayer.players[videoTag]["loadCaptions"] = loadCaptions;

                var lastCueIdx = 0;
                function updateCaptions() {
                  if (!captionBox || !captionLine) return;
                  if (!captionsEnabled || !captionsList || captionsList.length === 0) {
                    if (captionLine.textContent !== "") {
                      captionLine.textContent = "";
                    }
                    captionBox.style.display = "none";
                    return;
                  }
                  var cur = 0;
                  if (document.pictureInPictureElement && nativePipVideo && document.pictureInPictureElement === nativePipVideo) {
                    cur = nativePipVideo.currentTime || 0;
                  } else {
                    var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
                    if (!yt || typeof yt.getCurrentTime !== "function") return;
                    cur = yt.getCurrentTime();
                  }
                  var match = null;
                  var len = captionsList.length;
                  // Fast path: check current cached cue or immediate next cue in O(1)
                  if (lastCueIdx < len) {
                    var c = captionsList[lastCueIdx];
                    if (cur >= c.start && cur < c.end) {
                      match = c;
                    } else if (lastCueIdx + 1 < len && cur >= captionsList[lastCueIdx + 1].start && cur < captionsList[lastCueIdx + 1].end) {
                      lastCueIdx++;
                      match = captionsList[lastCueIdx];
                    }
                  }
                  if (!match) {
                    for (var i = 0; i < len; i++) {
                      var ci = captionsList[i];
                      if (cur >= ci.start && cur < ci.end) {
                        match = ci;
                        lastCueIdx = i;
                        break;
                      }
                    }
                  }
                  if (match) {
                    if (captionLine.textContent !== match.text) {
                      captionLine.textContent = match.text;
                    }
                    captionBox.style.display = "block";
                  } else {
                    if (captionLine.textContent !== "") {
                      captionLine.textContent = "";
                    }
                    captionBox.style.display = "none";
                  }
                }

                function disableNativeCaptions() {
                  try {
                    var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
                    if (yt) {
                      if (typeof yt.unloadModule === "function") {
                        yt.unloadModule("captions");
                        yt.unloadModule("cc");
                      }
                      if (typeof yt.setOption === "function") {
                        yt.setOption("captions", "track", {});
                        yt.setOption("cc", "track", {});
                      }
                    }
                    var iframe = parent.querySelector("iframe");
                    if (iframe && iframe.contentWindow) {
                      iframe.contentWindow.postMessage(JSON.stringify({
                        event: "command",
                        func: "unloadModule",
                        args: ["captions"]
                      }), "*");
                      iframe.contentWindow.postMessage(JSON.stringify({
                        event: "command",
                        func: "unloadModule",
                        args: ["cc"]
                      }), "*");
                      iframe.contentWindow.postMessage(JSON.stringify({
                        event: "command",
                        func: "setOption",
                        args: ["captions", "track", {}]
                      }), "*");
                    }
                  } catch(e) {}
                }
                disableNativeCaptions();
                YVPlayer.players[videoTag]["disableNativeCaptions"] = disableNativeCaptions;

                YVPlayer.players[videoTag]["CaptionsInterval"] = setInterval(updateCaptions, 100);

                var ccBtn = parent.querySelector(".yvPlayer-cc-btn");
                function toggleCaptions(forceState) {
                  captionsEnabled = (typeof forceState === "boolean") ? forceState : !captionsEnabled;
                  if (ccBtn) ccBtn.classList.toggle("active", captionsEnabled);
                  showHUD("ti ti-badge-cc", captionsEnabled ? "Captions On" : "Captions Off");
                  disableNativeCaptions();
                  if (document.pictureInPictureElement && nativePipVideo && document.pictureInPictureElement === nativePipVideo) {
                    for (var t = 0; t < nativePipVideo.textTracks.length; t++) {
                      nativePipVideo.textTracks[t].mode = captionsEnabled ? "showing" : "disabled";
                    }
                  }
                  updateCaptions();
                }
                YVPlayer.players[videoTag]["toggleCaptions"] = toggleCaptions;
                YVPlayer.players[videoTag]["updateCaptions"] = updateCaptions;

                if (ccBtn) {
                  ccBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    toggleCaptions();
                  });
                }

                document.addEventListener("keydown", (e) => {
                  if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
                  if (e.key === "c" || e.key === "C") {
                    e.preventDefault();
                    toggleCaptions();
                  }
                });

                var speedBtn = parent.querySelector(".yvPlayer-speed-btn");
                var speedVal = parent.querySelector(".yvPlayer-speed-val");
                var speedPanel = parent.querySelector(".yvPlayer-speed-panel");
                var speedDisplay = parent.querySelector(".yvPlayer-speed-display");
                var speedSlider = parent.querySelector(".yvPlayer-speed-slider");
                var speedMinusBtn = parent.querySelector(".yvPlayer-speed-minus-btn");
                var speedPlusBtn = parent.querySelector(".yvPlayer-speed-plus-btn");
                var inlineMinusBtn = parent.querySelector(".yvPlayer-speed-inline-minus");
                var inlinePlusBtn = parent.querySelector(".yvPlayer-speed-inline-plus");
                var openedSpeedFromSettings = false;

                function updateSpeedSliderTrack(rate) {
                  if (!speedSlider) return;
                  var min = parseFloat(speedSlider.min) || 0.25;
                  var max = parseFloat(speedSlider.max) || 3.0;
                  var pct = Math.max(0, Math.min(100, ((rate - min) / (max - min)) * 100));
                  speedSlider.style.background = "linear-gradient(to right, #ffffff " + pct + "%, rgba(255, 255, 255, 0.25) " + pct + "%)";
                }

                function setPlaybackSpeed(rate) {
                  rate = Math.max(0.20, Math.min(3.00, Math.round(rate * 100) / 100));
                  var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
                  if (yt && typeof yt.setPlaybackRate === "function") {
                    yt.setPlaybackRate(rate);
                  }
                  var hoverText = rate.toFixed(2);
                  var defaultText = (rate % 1 === 0 ? rate : rate) + "x";

                  var valDefault = parent.querySelector(".yvPlayer-speed-val-default");
                  var valHover = parent.querySelector(".yvPlayer-speed-val-hover");
                  if (valDefault) valDefault.textContent = defaultText;
                  if (valHover) valHover.textContent = hoverText;
                  if (speedVal) speedVal.textContent = defaultText;

                  if (speedDisplay) {
                    speedDisplay.textContent = hoverText + "x";
                  }
                  if (speedSlider) {
                    speedSlider.value = rate;
                    updateSpeedSliderTrack(rate);
                  }
                  var spdLabel = parent.querySelector(".yvPlayer-settings-box p:nth-of-type(1) b");
                  if (spdLabel) spdLabel.textContent = defaultText;
                  var currSpeedLbl = parent.querySelector(".yvPlayer-curr-speed-label");
                  if (currSpeedLbl) currSpeedLbl.textContent = (rate === 1 ? "Normal" : defaultText);
                  parent.querySelectorAll(".yvPlayer-speed-opt").forEach(function(opt) {
                    opt.classList.toggle("is-active", parseFloat(opt.getAttribute("data-rate")) === rate);
                  });
                }

                var speedWrap = parent.querySelector(".yvPlayer-speed-wrap");

                function toggleSpeedPanel(show) {
                  if (!speedPanel) return;
                  var isVisible = (speedPanel.style.display === "flex");
                  var targetVisible = (typeof show === "boolean") ? show : !isVisible;
                  if (targetVisible) {
                    var settingsBox = parent.querySelector(".yvPlayer-settings-box");
                    if (settingsBox) settingsBox.style.display = "none";
                    speedPanel.style.display = "flex";
                    if (speedWrap) speedWrap.classList.add("is-open");
                    clearTimeout(controlsTimeout);
                  } else {
                    speedPanel.style.display = "none";
                    if (speedWrap) speedWrap.classList.remove("is-open");
                    if (openedSpeedFromSettings) {
                      openedSpeedFromSettings = false;
                      var settingsBox = parent.querySelector(".yvPlayer-settings-box");
                      if (settingsBox) settingsBox.style.display = "block";
                    }
                  }
                }

                if (speedSlider) {
                  speedSlider.addEventListener("input", function (e) {
                    e.stopPropagation();
                    clearTimeout(controlsTimeout);
                    var rate = parseFloat(e.target.value);
                    setPlaybackSpeed(rate);
                  });
                  updateSpeedSliderTrack(1.0);
                }

                if (speedMinusBtn) {
                  speedMinusBtn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    clearTimeout(controlsTimeout);
                    var curRate = speedSlider ? parseFloat(speedSlider.value) : 1;
                    var nextRate = Math.max(0.25, Math.round((curRate - 0.05) * 100) / 100);
                    setPlaybackSpeed(nextRate);
                  });
                }

                if (speedPlusBtn) {
                  speedPlusBtn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    clearTimeout(controlsTimeout);
                    var curRate = speedSlider ? parseFloat(speedSlider.value) : 1;
                    var nextRate = Math.min(3.0, Math.round((curRate + 0.05) * 100) / 100);
                    setPlaybackSpeed(nextRate);
                  });
                }

                if (inlineMinusBtn) {
                  inlineMinusBtn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    clearTimeout(controlsTimeout);
                    var curRate = speedSlider ? parseFloat(speedSlider.value) : 1;
                    var nextRate = Math.max(0.20, Math.round((curRate - 0.10) * 100) / 100);
                    setPlaybackSpeed(nextRate);
                  });
                }

                if (inlinePlusBtn) {
                  inlinePlusBtn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    clearTimeout(controlsTimeout);
                    var curRate = speedSlider ? parseFloat(speedSlider.value) : 1;
                    var nextRate = Math.min(3.00, Math.round((curRate + 0.10) * 100) / 100);
                    setPlaybackSpeed(nextRate);
                  });
                }

                if (speedMinusBtn) {
                  speedMinusBtn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    clearTimeout(controlsTimeout);
                    var curRate = speedSlider ? parseFloat(speedSlider.value) : 1;
                    var nextRate = Math.max(0.20, Math.round((curRate - 0.10) * 100) / 100);
                    setPlaybackSpeed(nextRate);
                  });
                }

                if (speedPlusBtn) {
                  speedPlusBtn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    clearTimeout(controlsTimeout);
                    var curRate = speedSlider ? parseFloat(speedSlider.value) : 1;
                    var nextRate = Math.min(3.00, Math.round((curRate + 0.10) * 100) / 100);
                    setPlaybackSpeed(nextRate);
                  });
                }

                parent.querySelectorAll(".yvPlayer-speed-opt").forEach(function(opt) {
                  opt.addEventListener("click", function(e) {
                    e.stopPropagation();
                    var r = parseFloat(opt.getAttribute("data-rate"));
                    if (!isNaN(r)) setPlaybackSpeed(r);
                  });
                });

                if (speedBtn) {
                  speedBtn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    openedSpeedFromSettings = false;
                    toggleSpeedPanel();
                  });
                }

                if (speedPanel) {
                  speedPanel.addEventListener("click", function (e) {
                    e.stopPropagation();
                    clearTimeout(controlsTimeout);
                  });
                }

                YVPlayer.players[videoTag]["TextTimeInterval"] = setInterval(updateTextTime, 500);
                YVPlayer.players[videoTag]["TimeSliderInterval"] = setInterval(updateTimeSlider, 500);
                var sliderContainer = parent.querySelector(".yvPlayer-slider-container");
                var sliderInput = parent.querySelector(".yvPlayer-slider-container input");
                if (sliderInput) sliderInput.addEventListener("input", updateSlider);
                var fsBtn = parent.querySelector(".yvPlayer-controls-box .yvPlayer-controls .fsBtn");
                if (fsBtn) {
                  fsBtn.addEventListener("click", toggleFullscreen);
                  fsBtn.style.display = document.fullscreenEnabled ? "block" : "none";
                  document.addEventListener("fullscreenchange", () => {
                    var isFs = !!document.fullscreenElement;
                    fsBtn.classList.toggle("active", isFs);
                    var fsIcon = fsBtn.querySelector("i");
                    if (fsIcon) {
                      fsIcon.className = isFs ? "ti ti-minimize" : "ti ti-maximize";
                    }
                    fsBtn.title = isFs ? "Exit full screen (f)" : "Full screen (f)";
                  });
                }
                var settingsBtn = parent.querySelector(".settingsBtn");
                if (settingsBtn) {
                  settingsBtn.onclick = function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleSettings();
                  };
                }

                document.addEventListener("click", function (e) {
                  var sp = parent.querySelector(".yvPlayer-speed-panel");
                  var sw = parent.querySelector(".yvPlayer-speed-wrap");
                  var sb = parent.querySelector(".yvPlayer-settings-box");
                  var sBtn = parent.querySelector(".yvPlayer-speed-btn");
                  var stBtn = parent.querySelector(".settingsBtn");

                  if (sp && sp.style.display === "flex") {
                    if (!sp.contains(e.target) && (!sBtn || !sBtn.contains(e.target))) {
                      sp.style.display = "none";
                      if (sw) sw.classList.remove("is-open");
                    }
                  }

                  if (sb && sb.style.display === "block") {
                    if (!sb.contains(e.target) && (!stBtn || !stBtn.contains(e.target))) {
                      sb.style.display = "none";
                      if (typeof resetSettings === "function") resetSettings();
                    }
                  }
                });

                var pipBtn = parent.querySelector(".yvPlayer-controls-box .yvPlayer-controls .pipBtn");
                var curParams = (YVPlayer.players[videoTag] && YVPlayer.players[videoTag].params) || {};
                if (curParams.pip === false || curParams.disablePip) {
                  if (pipBtn) pipBtn.style.display = "none";
                  var pipSettingsRow = parent.querySelector('.yvPlayer-settings-row[data-target="pipMode"]');
                  if (pipSettingsRow) pipSettingsRow.style.display = "none";
                }

                function setPipButtonActive(isActive) {
                  if (!pipBtn) return;
                  pipBtn.classList.toggle("active", isActive);
                  var icon = pipBtn.querySelector("i");
                  if (icon) {
                    icon.className = isActive ? "ti ti-picture-in-picture-off" : "ti ti-picture-in-picture";
                  }
                  pipBtn.title = isActive ? "Exit Picture in Picture (p)" : "Picture in Picture (p)";
                }

                var MARGIN = 16;
                var MIN_PIP_WIDTH = 320;
                var ASPECT = 16 / 9;

                function checkIsShorts() {
                  return parent.classList.contains("is-shorts") || !!(YVPlayer.players[videoTag] && YVPlayer.players[videoTag].params && (YVPlayer.players[videoTag].params.shorts || YVPlayer.players[videoTag].params.isShorts));
                }

                function getPipAspect() {
                  return checkIsShorts() ? (9 / 16) : (16 / 9);
                }

                var STANDARD_HEIGHTS = [180, 216, 240, 270, 300, 338, 360, 405, 450, 480, 540];

                function snapToStandardHeight(rawH) {
                  for (var i = 0; i < STANDARD_HEIGHTS.length; i++) {
                    if (Math.abs(rawH - STANDARD_HEIGHTS[i]) <= 14) {
                      return STANDARD_HEIGHTS[i];
                    }
                  }
                  return rawH;
                }

                function clampPiPBounds(left, top, width) {
                  var isShorts = checkIsShorts();
                  var currentAspect = isShorts ? (9 / 16) : (16 / 9);
                  var minW = isShorts ? 180 : MIN_PIP_WIDTH;
                  var maxW = isShorts ? Math.min(360, window.innerWidth - MARGIN * 2) : Math.max(minW, Math.min(window.innerWidth - MARGIN * 2, (window.innerHeight - MARGIN * 2) * currentAspect));
                  var clampedW = Math.max(minW, Math.min(maxW, width));
                  var clampedH = Math.round(clampedW / currentAspect);

                  var maxLeft = window.innerWidth - clampedW - MARGIN;
                  var maxTop = window.innerHeight - clampedH - MARGIN;
                  var clampedLeft = Math.max(MARGIN, Math.min(Math.max(MARGIN, maxLeft), left));
                  var clampedTop = Math.max(MARGIN, Math.min(Math.max(MARGIN, maxTop), top));

                  return { left: clampedLeft, top: clampedTop, width: clampedW, height: clampedH };
                }

                // currentPipMode initialized at player instance scope

                var activePipWindow = null;

                function getDocPiPContext() {
                  try {
                    if (window.top && window.top.documentPictureInPicture && typeof window.top.documentPictureInPicture.requestWindow === "function") {
                      return window.top.documentPictureInPicture;
                    }
                  } catch (e) { }
                  if (typeof window !== "undefined" && ("documentPictureInPicture" in window) && typeof window.documentPictureInPicture.requestWindow === "function") {
                    return window.documentPictureInPicture;
                  }
                  return null;
                }

                function hasLocalStreamProxy() {
                  try {
                    return (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") &&
                      (window.location.port === "8000" || window.location.port === "5500" || window.location.port === "3000");
                  } catch (e) {
                    return false;
                  }
                }

                async function enterDocumentPiP() {
                  if (activePipWindow) {
                    try { activePipWindow.close(); } catch (e) { }
                    activePipWindow = null;
                    return;
                  }
                  var docPip = getDocPiPContext();
                  if (!docPip) {
                    enterInPagePiP();
                    return;
                  }

                  var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
                  if (!yt || typeof yt.getCurrentTime !== "function") {
                    enterInPagePiP();
                    return;
                  }

                  var currentTime = yt.getCurrentTime() || 0;
                  var isPlaying = YVPlayer.players[videoTag]["isPlaying"] || false;
                  var duration = (yt.getDuration && yt.getDuration()) || 0;
                  var activeId = getActiveVideoId();
                  var isMuted = yt.isMuted ? yt.isMuted() : false;
                  var volume = yt.getVolume ? yt.getVolume() : 100;
                  var playbackRate = yt.getPlaybackRate ? yt.getPlaybackRate() : 1;

                  yt.pauseVideo();
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => { });
                  }

                  var parentContainer = parent.parentElement;
                  var placeholder = null;
                  var isShortsPip = checkIsShorts();
                  if (parentContainer) {
                    placeholder = parentContainer.querySelector(".yvPlayer-pip-placeholder");
                    if (!placeholder) {
                      placeholder = document.createElement("div");
                      placeholder.className = "yvPlayer-pip-placeholder";
                      placeholder.addEventListener("click", () => {
                        if (activePipWindow) {
                          try { activePipWindow.close(); } catch (e) { }
                        }
                      });
                      parentContainer.insertBefore(placeholder, parent);
                    }
                    placeholder.classList.toggle("is-shorts-placeholder", !!isShortsPip);
                    placeholder.innerHTML = `
                      <div class="yvPlayer-pip-placeholder-card">
                        <div class="yvPlayer-pip-placeholder-icon">
                          <i class="ti ti-app-window"></i>
                        </div>
                        <div class="yvPlayer-pip-placeholder-info">
                          <div class="yvPlayer-pip-status-chip">
                            <span class="yvPlayer-pip-live-dot"></span>
                            <span class="yvPlayer-pip-chip-text">${isShortsPip ? "Shorts in Document PiP" : "Document PiP Active"}</span>
                          </div>
                          <span class="yvPlayer-pip-placeholder-title">Playing in Picture-in-Picture</span>
                          <span class="yvPlayer-pip-placeholder-sub">Click anywhere to return playback to this tab</span>
                        </div>
                      </div>
                    `;
                    placeholder.style.display = "flex";
                  }
                  parent.style.display = "none";

                  setPipButtonActive(true);

                  var isShorts = checkIsShorts();
                  var pipWidth = isShorts ? 320 : 480;
                  var pipHeight = isShorts ? 568 : 270;
                  var initialAspect = isShorts ? (9 / 16) : (16 / 9);

                  var pipWin = null;
                  try {
                    pipWin = await docPip.requestWindow({
                      width: pipWidth,
                      height: pipHeight,
                      initialAspectRatio: initialAspect,
                    });
                    activePipWindow = pipWin;
                  } catch (err) {
                    console.warn("documentPictureInPicture request failed, falling back to in-page PiP:", err);
                    if (placeholder) placeholder.style.display = "none";
                    parent.style.display = "";
                    setPipButtonActive(false);
                    enterInPagePiP();
                    return;
                  }

                  pipWin.pipState = {
                    currentTime: currentTime,
                    isPlaying: isPlaying,
                    duration: duration
                  };

                  var isEnforcingAspect = false;
                  var lastPipW = pipWidth;
                  var lastPipH = pipHeight;
                  var resizeDebounce = null;

                  function enforcePipAspect() {
                    if (isEnforcingAspect || !pipWin || pipWin.closed) return;
                    var curW = pipWin.innerWidth;
                    var curH = pipWin.innerHeight;
                    if (!curW || !curH || curW <= 0 || curH <= 0) return;

                    var dw = Math.abs(curW - lastPipW);
                    var dh = Math.abs(curH - lastPipH);

                    if (dw < 2 && dh < 2) return;

                    var ASPECT = videoAspect || (16 / 9);
                    var targetW = curW;
                    var targetH = curH;

                    // If stretched horizontally (from left or right), scale the other side (height) accordingly
                    if (dw >= dh * ASPECT) {
                      targetW = Math.max(320, curW);
                      targetH = Math.round(targetW / ASPECT);
                    } else {
                      // If stretched vertically, scale the other side (width) accordingly
                      targetH = Math.max(180, curH);
                      targetW = Math.round(targetH * ASPECT);
                    }

                    var chromeW = Math.max(0, pipWin.outerWidth - pipWin.innerWidth);
                    var chromeH = Math.max(0, pipWin.outerHeight - pipWin.innerHeight);

                    if (Math.abs(curW - targetW) > 1 || Math.abs(curH - targetH) > 1) {
                      isEnforcingAspect = true;
                      lastPipW = targetW;
                      lastPipH = targetH;
                      try {
                        pipWin.resizeTo(Math.round(targetW + chromeW), Math.round(targetH + chromeH));
                      } catch (e) { }
                      setTimeout(function () {
                        isEnforcingAspect = false;
                      }, 40);
                    } else {
                      lastPipW = curW;
                      lastPipH = curH;
                    }
                  }

                  // Allow flexible OS window resizing; inner Document PiP letterboxes with black borders
                  pipWin.addEventListener("resize", function () {
                    // Flexible sizing - no forced resizeTo fighting the user
                  });

                  var metaRef = pipWin.document.createElement("meta");
                  metaRef.name = "referrer";
                  metaRef.content = "strict-origin-when-cross-origin";
                  pipWin.document.head.appendChild(metaRef);

                  var styleEl = pipWin.document.createElement("style");
                  styleEl.textContent = `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #000;
          margin: 0;
          padding: 0;
        }
        #pip-frame {
          width: 100vw;
          height: 100vh;
          border: none;
          display: block;
          overflow: hidden;
          background: #000;
        }
      `;
                  pipWin.document.head.appendChild(styleEl);

                  var startSec = Math.max(0, Math.floor(currentTime));
                  var isShortsActive = checkIsShorts();
                  var videoAspect = isShortsActive ? (9 / 16) : (16 / 9);
                  if (!isShortsActive && parent.offsetWidth && parent.offsetHeight && parent.offsetHeight > 50) {
                    videoAspect = parent.offsetWidth / parent.offsetHeight;
                  }
                  var baseEmbedOrigin = "https://thevikasgurjar.github.io/YVplayer";
                  try {
                    if (window.location.origin && window.location.origin.includes("thevikasgurjar.github.io")) {
                      baseEmbedOrigin = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "");
                    } else if ((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && (window.location.port === "8000" || window.location.port === "5500" || window.location.port === "3000")) {
                      baseEmbedOrigin = window.location.origin;
                    }
                  } catch (e) { }
                  var embedUrl = `${baseEmbedOrigin}/pip_embed.html?id=${encodeURIComponent(activeId)}&start=${encodeURIComponent(startSec)}&autoplay=1&mute=${isMuted ? 1 : 0}&vol=${volume}&rate=${playbackRate}&aspect=${encodeURIComponent(videoAspect)}${isShortsActive ? "&shorts=1" : ""}${isLiveStream ? "&live=1" : ""}&loop=${playerParams.loop ? 1 : 0}&theme=${encodeURIComponent(activeThemeColor || "#fe0001")}`;

                  pipWin.document.body.innerHTML = `
        <iframe
          id="pip-frame"
          src="${embedUrl}"
          allow="accelerometer; autoplay *; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        ></iframe>
      `;

                  var messageHandler = (evt) => {
                    if (!evt || !evt.data) return;
                    var data = evt.data;
                    if (typeof data === "string") {
                      try { data = JSON.parse(data); } catch (e) { }
                    }
                    if (data && data.type === "pipState") {
                      if (typeof data.currentTime === "number" && !isNaN(data.currentTime)) {
                        pipWin.pipState.currentTime = data.currentTime;
                      }
                      if (typeof data.isPlaying === "boolean") {
                        pipWin.pipState.isPlaying = data.isPlaying;
                      }
                      if (typeof data.loop === "boolean") {
                        if (typeof updateLoopUI === "function") updateLoopUI(data.loop, false);
                      }
                    }
                    if (data && data.type === "pipResize") {
                      if (typeof data.width === "number" && typeof data.height === "number") {
                        try {
                          var cW = Math.max(0, pipWin.outerWidth - pipWin.innerWidth);
                          var cH = Math.max(0, pipWin.outerHeight - pipWin.innerHeight);
                          isEnforcingAspect = true;
                          lastPipW = data.width;
                          lastPipH = data.height;
                          pipWin.resizeTo(Math.round(data.width + cW), Math.round(data.height + cH));
                          setTimeout(function () { isEnforcingAspect = false; }, 40);
                        } catch (e) { }
                      }
                    }
                  };
                  pipWin.addEventListener("message", messageHandler);
                  window.addEventListener("message", messageHandler);
                  try {
                    if (window.top && window.top !== window) {
                      window.top.addEventListener("message", messageHandler);
                    }
                  } catch (e) { }

                  function onPipClose() {
                    activePipWindow = null;
                    window.removeEventListener("message", messageHandler);
                    try {
                      if (window.top && window.top !== window) {
                        window.top.removeEventListener("message", messageHandler);
                      }
                    } catch (e) { }

                    if (placeholder) placeholder.style.display = "none";
                    parent.style.display = "";
                    setPipButtonActive(false);

                    var finalTime = currentTime;
                    var finalPlaying = isPlaying;

                    try {
                      if (pipWin && pipWin.pipState) {
                        if (typeof pipWin.pipState.currentTime === "number" && !isNaN(pipWin.pipState.currentTime)) {
                          finalTime = pipWin.pipState.currentTime;
                        }
                        if (typeof pipWin.pipState.isPlaying === "boolean") {
                          finalPlaying = pipWin.pipState.isPlaying;
                        }
                      }
                    } catch (e) { }

                    if (yt && typeof yt.seekTo === "function") {
                      yt.seekTo(finalTime, true);
                      if (finalPlaying) {
                        yt.playVideo();
                      } else {
                        yt.pauseVideo();
                      }
                    }
                    updateTextTime();
                    updateTimeSlider();
                  }

                  pipWin.addEventListener("pagehide", onPipClose);
                }

                function enterInPagePiP() {
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => { });
                  }
                  var isShorts = checkIsShorts();
                  var currentAspect = isShorts ? (9 / 16) : (16 / 9);
                  parent.classList.add("is-pip");
                  setPipButtonActive(true);

                  var defaultW = isShorts ? 240 : Math.min(480, window.innerWidth - MARGIN * 2);
                  defaultW = Math.max(isShorts ? 180 : MIN_PIP_WIDTH, defaultW);
                  var defaultH = Math.round(defaultW / currentAspect);
                  var defaultLeft = window.innerWidth - defaultW - 24;
                  var defaultTop = window.innerHeight - defaultH - 24;

                  var clamped = clampPiPBounds(defaultLeft, defaultTop, defaultW);
                  parent.style.setProperty("--pip-width", clamped.width + "px");
                  parent.style.setProperty("width", clamped.width + "px", "important");
                  parent.style.setProperty("height", clamped.height + "px", "important");
                  parent.style.setProperty("left", clamped.left + "px", "important");
                  parent.style.setProperty("top", clamped.top + "px", "important");
                  parent.style.setProperty("right", "auto", "important");
                  parent.style.setProperty("bottom", "auto", "important");

                  var parentContainer = parent.parentElement;
                  if (parentContainer) {
                    var placeholder = parentContainer.querySelector(".yvPlayer-pip-placeholder");
                    var isShortsInPage = checkIsShorts();
                    if (!placeholder) {
                      placeholder = document.createElement("div");
                      placeholder.className = "yvPlayer-pip-placeholder";
                      placeholder.addEventListener("click", exitInPagePiP);
                      parentContainer.insertBefore(placeholder, parent);
                    }
                    placeholder.classList.toggle("is-shorts-placeholder", !!isShortsInPage);
                    placeholder.innerHTML = `
            <div class="yvPlayer-pip-placeholder-card">
              <div class="yvPlayer-pip-placeholder-icon">
                <i class="ti ti-layout-bottombar-collapse"></i>
              </div>
              <div class="yvPlayer-pip-placeholder-info">
                <div class="yvPlayer-pip-status-chip">
                  <span class="yvPlayer-pip-live-dot"></span>
                  <span class="yvPlayer-pip-chip-text">${isShortsInPage ? "Shorts Mini-Player" : "In-Page Mini-Player"}</span>
                </div>
                <span class="yvPlayer-pip-placeholder-title">Playing in Mini-Player</span>
                <span class="yvPlayer-pip-placeholder-sub">${isShortsInPage ? "Drag corners to resize freely with locked 9:16 vertical ratio" : "Drag corners to resize freely with locked 16:9 ratio"}</span>
              </div>
              <button type="button" class="yvPlayer-pip-placeholder-expand-btn">
                <i class="ti ti-arrows-maximize"></i>
                <span>Return to Player</span>
              </button>
            </div>
          `;
                    placeholder.style.display = "flex";
                  }


                }

                function exitInPagePiP() {
                  var parentContainer = parent.parentElement;
                  var placeholder = parentContainer ? parentContainer.querySelector(".yvPlayer-pip-placeholder") : null;

                  // Video.js style fluid spring expand transition
                  if (placeholder && placeholder.offsetParent !== null) {
                    var pRect = placeholder.getBoundingClientRect();
                    parent.style.setProperty("transition", "all 0.28s cubic-bezier(0.16, 1, 0.3, 1)", "important");
                    parent.style.setProperty("left", pRect.left + "px", "important");
                    parent.style.setProperty("top", pRect.top + "px", "important");
                    parent.style.setProperty("width", pRect.width + "px", "important");
                    parent.style.setProperty("height", pRect.height + "px", "important");
                    parent.style.setProperty("border-radius", "var(--playerBR, 12px)", "important");

                    setTimeout(function () {
                      cleanupPiPState();
                    }, 280);
                  } else {
                    cleanupPiPState();
                  }

                  function cleanupPiPState() {
                    parent.classList.remove("is-pip");
                    parent.classList.remove("is-dragging");
                    parent.style.removeProperty("--pip-width");
                    parent.style.removeProperty("width");
                    parent.style.removeProperty("height");
                    parent.style.removeProperty("left");
                    parent.style.removeProperty("top");
                    parent.style.removeProperty("right");
                    parent.style.removeProperty("bottom");
                    parent.style.removeProperty("transition");
                    parent.style.removeProperty("border-radius");
                    setPipButtonActive(false);
                    if (placeholder) {
                      placeholder.style.display = "none";
                    }
                  }
                }



                var nativePipVideo = null;

                function getNativePipVideo() {
                  if (!nativePipVideo) {
                    nativePipVideo = document.createElement("video");
                    nativePipVideo.className = "yvPlayer-native-pip-video";
                    nativePipVideo.style.cssText = "position:fixed;width:1px;height:1px;top:-1000px;left:-1000px;opacity:0.001;pointer-events:none;";
                    nativePipVideo.playsInline = true;
                    document.body.appendChild(nativePipVideo);
                  }
                  return nativePipVideo;
                }

                async function enterNativeVideoPiP() {
                  if (document.pictureInPictureElement) {
                    try { await document.exitPictureInPicture(); } catch (e) { }
                    return;
                  }

                  var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
                  if (!yt || typeof yt.getCurrentTime !== "function") {
                    enterInPagePiP();
                    return;
                  }

                  var activeId = getActiveVideoId();
                  if (!activeId) {
                    enterInPagePiP();
                    return;
                  }

                  // Live broadcasts on YouTube use HLS (.m3u8), which desktop Chrome cannot decode in a raw <video> tag.
                  // Route live streams cleanly to Document PiP or In-Page PiP so live streaming never fails!
                  if (isLiveStream) {
                    if (getDocPiPContext()) {
                      enterDocumentPiP();
                    } else {
                      enterInPagePiP();
                    }
                    return;
                  }

                  var currentTime = yt.getCurrentTime() || 0;
                  var isPlaying = YVPlayer.players[videoTag]["isPlaying"] || false;
                  var duration = (yt.getDuration && yt.getDuration()) || 0;
                  var currentVol = yt.getVolume ? yt.getVolume() : 100;
                  // Ensure healthy volume in PiP so sound is never locked to mute
                  var pipVolume = currentVol > 0 ? (currentVol / 100) : 1.0;

                  var videoEl = getNativePipVideo();
                  // Always request 720p HD stream for OS PiP
                  var pParams = (YVPlayer.players[videoTag] && YVPlayer.players[videoTag]["params"]) || {};
                  var streamUrl = "/api/stream?id=" + encodeURIComponent(activeId) + "&fmt=720&quality=720";
                  if (typeof YVPlayer.resolveStreamUrl === "function") {
                    try {
                      var resolved = await YVPlayer.resolveStreamUrl(activeId, pParams);
                      if (resolved) {
                        streamUrl = resolved;
                      }
                    } catch (proxyErr) {
                      console.warn("Notice resolving proxy stream:", proxyErr);
                    }
                  }

                  yt.pauseVideo();
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => { });
                  }

                  // Keep player stage visible and active, apply .is-native-pip exactly matching cinema screenshot
                  parent.classList.add("is-native-pip");
                  setPipButtonActive(true);

                  if (!videoEl.src || videoEl.src !== streamUrl) {
                    videoEl.src = streamUrl;
                    videoEl.load();
                  }

                  videoEl.currentTime = currentTime;
                  videoEl.muted = false;
                  videoEl.volume = pipVolume;

                  // Ship captions into native video text tracks so the OS floating window renders WebVTT captions
                  try {
                    while (videoEl.textTracks.length > 0) {
                      for (var t = 0; t < videoEl.textTracks.length; t++) {
                        videoEl.textTracks[t].mode = "disabled";
                      }
                      break;
                    }
                    if (captionsList && captionsList.length > 0) {
                      var pipTrack = videoEl.addTextTrack("captions", "English", "en");
                      pipTrack.mode = captionsEnabled ? "showing" : "disabled";
                      for (var cIdx = 0; cIdx < captionsList.length; cIdx++) {
                        var cItem = captionsList[cIdx];
                        if (typeof VTTCue !== "undefined") {
                          pipTrack.addCue(new VTTCue(cItem.start, cItem.end, cItem.text));
                        }
                      }
                    }
                  } catch (captionErr) {
                    console.warn("Notice shipping captions to native PiP:", captionErr);
                  }

                  // Synchronize on-page seekbar, timestamps, and captions on timeupdate
                  var onNativeTimeUpdate = function () {
                    if (document.pictureInPictureElement && document.pictureInPictureElement === videoEl) {
                      var cur = videoEl.currentTime || 0;
                      var dur = videoEl.duration || duration || 1;
                      var progress = (cur / dur) * 100;
                      var slider = parent.querySelector(".yvPlayer-slider-container input");
                      if (slider) {
                        slider.value = progress;
                        var seekCol = (YVPlayer.players[videoTag] && YVPlayer.players[videoTag].activeThemeColor) || activeThemeColor || parent.style.getPropertyValue("--sliderSeekTrackColor") || "#fe0001";
                        slider.style.background = "linear-gradient(to right, " + seekCol + " " + progress + "%, transparent " + progress + "%)";
                      }
                      var p1 = parent.querySelector(".yvPlayer-curr-time");
                      var p2 = parent.querySelector(".yvPlayer-dur-time");
                      if (p1) p1.innerHTML = formatTime(String(cur));
                      if (p2 && dur > 0) p2.innerHTML = formatTime(String(dur));
                      if (captionsEnabled) {
                        updateCaptions();
                      }
                    }
                  };
                  videoEl.addEventListener("timeupdate", onNativeTimeUpdate);

                  // Native play/pause state synchronization
                  var onNativePlay = function () {
                    parent.classList.remove("is-paused");
                    parent.classList.add("is-playing");
                    var bottomBtn = parent.querySelector(".yvPlayer-bottom-play i");
                    if (bottomBtn) bottomBtn.className = "ti ti-player-pause-filled";
                  };
                  var onNativePause = function () {
                    parent.classList.remove("is-playing");
                    parent.classList.add("is-paused");
                    var bottomBtn = parent.querySelector(".yvPlayer-bottom-play i");
                    if (bottomBtn) bottomBtn.className = "ti ti-player-play-filled";
                  };
                  videoEl.addEventListener("play", onNativePlay);
                  videoEl.addEventListener("pause", onNativePause);

                  // Global volume hotkeys while OS PiP is active (ArrowUp, ArrowDown, M)
                  var onPipKeydown = function (e) {
                    if (!document.pictureInPictureElement) return;
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      videoEl.muted = false;
                      videoEl.volume = Math.min(1, Math.round((videoEl.volume + 0.05) * 100) / 100);
                      updateVolumeIcon(Math.round(videoEl.volume * 100), false);
                      if (volSlider) {
                        volSlider.value = Math.round(videoEl.volume * 100);
                        volSlider.style.setProperty("--volPercent", Math.round(videoEl.volume * 100) + "%");
                      }
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      videoEl.volume = Math.max(0, Math.round((videoEl.volume - 0.05) * 100) / 100);
                      var isM = videoEl.volume === 0;
                      if (isM) videoEl.muted = true;
                      updateVolumeIcon(Math.round(videoEl.volume * 100), isM);
                      if (volSlider) {
                        volSlider.value = Math.round(videoEl.volume * 100);
                        volSlider.style.setProperty("--volPercent", Math.round(videoEl.volume * 100) + "%");
                      }
                    } else if (e.key === "m" || e.key === "M") {
                      e.preventDefault();
                      videoEl.muted = !videoEl.muted;
                      if (!videoEl.muted && videoEl.volume === 0) videoEl.volume = 1;
                      updateVolumeIcon(Math.round(videoEl.volume * 100), videoEl.muted);
                      if (volSlider) {
                        var vVal = videoEl.muted ? 0 : Math.round(videoEl.volume * 100);
                        volSlider.value = vVal;
                        volSlider.style.setProperty("--volPercent", vVal + "%");
                      }
                    }
                  };
                  window.addEventListener("keydown", onPipKeydown);

                  try {
                    if (videoEl.readyState < 1) {
                      await new Promise(function (resolve, reject) {
                        var timer = setTimeout(function () { resolve(); }, 3000);
                        videoEl.addEventListener("loadedmetadata", function () {
                          clearTimeout(timer);
                          resolve();
                        }, { once: true });
                        videoEl.addEventListener("error", function (err) {
                          clearTimeout(timer);
                          reject(err);
                        }, { once: true });
                      });
                    }

                    await videoEl.play().catch(() => { });
                    await videoEl.requestPictureInPicture();
                  } catch (err) {
                    console.warn("Native video requestPictureInPicture failed, falling back:", err);
                    window.removeEventListener("keydown", onPipKeydown);
                    videoEl.removeEventListener("timeupdate", onNativeTimeUpdate);
                    videoEl.removeEventListener("play", onNativePlay);
                    videoEl.removeEventListener("pause", onNativePause);
                    parent.classList.remove("is-native-pip");
                    setPipButtonActive(false);
                    enterInPagePiP();
                    return;
                  }

                  // Setup MediaSession for Native PiP controls
                  if ("mediaSession" in navigator) {
                    var title = "YouTube Video";
                    try {
                      if (yt.getVideoData && yt.getVideoData().title) {
                        title = yt.getVideoData().title;
                      }
                    } catch (e) { }

                    navigator.mediaSession.metadata = new MediaMetadata({
                      title: title,
                      artist: "YVPlayer",
                      artwork: [
                        { src: `https://img.youtube.com/vi/${encodeURIComponent(activeId)}/hqdefault.jpg`, sizes: "480x360", type: "image/jpeg" }
                      ]
                    });

                    navigator.mediaSession.setActionHandler("play", () => {
                      videoEl.play();
                    });
                    navigator.mediaSession.setActionHandler("pause", () => {
                      videoEl.pause();
                    });
                    navigator.mediaSession.setActionHandler("seekbackward", (details) => {
                      var skip = (details && details.seekOffset) || 10;
                      videoEl.currentTime = Math.max(0, videoEl.currentTime - skip);
                    });
                    navigator.mediaSession.setActionHandler("seekforward", (details) => {
                      var skip = (details && details.seekOffset) || 10;
                      videoEl.currentTime = Math.min(videoEl.duration || duration, videoEl.currentTime + skip);
                    });
                    navigator.mediaSession.setActionHandler("seekto", (details) => {
                      if (details && typeof details.seekTime === "number" && !isNaN(details.seekTime)) {
                        videoEl.currentTime = details.seekTime;
                      }
                    });
                  }

                  var onTimeUpdateMediaSession = function () {
                    if ("mediaSession" in navigator && "setPositionState" in navigator.mediaSession) {
                      try {
                        navigator.mediaSession.setPositionState({
                          duration: videoEl.duration || duration || 0,
                          playbackRate: videoEl.playbackRate || 1,
                          position: videoEl.currentTime || 0
                        });
                      } catch (e) { }
                    }
                  };
                  videoEl.addEventListener("timeupdate", onTimeUpdateMediaSession);

                  var onLeavePiP = function () {
                    window.removeEventListener("keydown", onPipKeydown);
                    videoEl.removeEventListener("leavepictureinpicture", onLeavePiP);
                    videoEl.removeEventListener("timeupdate", onNativeTimeUpdate);
                    videoEl.removeEventListener("timeupdate", onTimeUpdateMediaSession);
                    videoEl.removeEventListener("play", onNativePlay);
                    videoEl.removeEventListener("pause", onNativePause);

                    var finalTime = videoEl.currentTime;
                    var finalPlaying = !videoEl.paused;
                    var finalVol = Math.round(videoEl.volume * 100);
                    var finalMuted = videoEl.muted || finalVol === 0;

                    videoEl.pause();

                    parent.classList.remove("is-native-pip");
                    setPipButtonActive(false);

                    if (yt) {
                      if (typeof yt.setVolume === "function") {
                        yt.setVolume(finalVol);
                        if (volSlider) {
                          volSlider.value = finalVol;
                          volSlider.style.setProperty("--volPercent", finalVol + "%");
                        }
                      }
                      if (finalMuted) {
                        if (typeof yt.mute === "function") yt.mute();
                        updateVolumeIcon(0, true);
                      } else {
                        if (typeof yt.unMute === "function") yt.unMute();
                        updateVolumeIcon(finalVol, false);
                      }
                      if (typeof yt.seekTo === "function") {
                        yt.seekTo(finalTime, true);
                        if (finalPlaying) {
                          yt.playVideo();
                          parent.classList.remove("is-paused");
                          parent.classList.add("is-playing");
                          var bottomBtn = parent.querySelector(".yvPlayer-bottom-play i");
                          if (bottomBtn) bottomBtn.className = "ti ti-player-pause-filled";
                        } else {
                          yt.pauseVideo();
                          parent.classList.remove("is-playing");
                          parent.classList.add("is-paused");
                          var bottomBtn = parent.querySelector(".yvPlayer-bottom-play i");
                          if (bottomBtn) bottomBtn.className = "ti ti-player-play-filled";
                        }
                      }
                    }
                    updateTextTime();
                    updateTimeSlider();
                  };

                  videoEl.addEventListener("leavepictureinpicture", onLeavePiP);
                }

                function togglePiP() {
                  if (document.pictureInPictureElement) {
                    try { document.exitPictureInPicture(); } catch (e) { }
                    return;
                  }
                  if (activePipWindow) {
                    try { activePipWindow.close(); } catch (e) { }
                    activePipWindow = null;
                    return;
                  }
                  if (parent.classList.contains("is-pip")) {
                    exitInPagePiP();
                    return;
                  }

                  var docPip = getDocPiPContext();

                  if (currentPipMode === "inpage") {
                    enterInPagePiP();
                    return;
                  }

                  var hasProxy = (playerParams && playerParams.proxyProvider) || hasLocalStreamProxy();
                  if (currentPipMode === "os" && hasProxy && document.pictureInPictureEnabled) {
                    enterNativeVideoPiP();
                    return;
                  }

                  if (docPip) {
                    enterDocumentPiP();
                  } else if (hasProxy && document.pictureInPictureEnabled) {
                    enterNativeVideoPiP();
                  } else {
                    enterInPagePiP();
                  }
                }

                if (pipBtn) {
                  pipBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    togglePiP();
                  });
                }

                function setupPiPDraggable() {
                  parent.addEventListener("mousedown", (e) => {
                    if (!parent.classList.contains("is-pip")) return;
                    if (e.button !== 0) return;

                    if (
                      e.target.closest(".yvPlayer-pip-resizer") ||
                      e.target.closest(".yvPlayer-controls") ||
                      e.target.closest(".yvPlayer-settings-box") ||
                      e.target.closest("main i") ||
                      e.target.closest("button, input, select, label")
                    ) {
                      return;
                    }

                    e.preventDefault();
                    e.stopPropagation();

                    var rect = parent.getBoundingClientRect();
                    var startX = e.clientX;
                    var startY = e.clientY;
                    var startLeft = rect.left;
                    var startTop = rect.top;
                    var hasMoved = false;

                    parent.classList.add("is-dragging");
                    parent.style.transition = "none";

                    var shield = document.createElement("div");
                    shield.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999999;cursor:grabbing;user-select:none;";
                    document.body.appendChild(shield);

                    function onMouseMove(moveEvt) {
                      var dx = moveEvt.clientX - startX;
                      var dy = moveEvt.clientY - startY;
                      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                        hasMoved = true;
                      }

                      var currentWidth = parent.offsetWidth;
                      var currentHeight = parent.offsetHeight;

                      var maxLeft = window.innerWidth - currentWidth - MARGIN;
                      var maxTop = window.innerHeight - currentHeight - MARGIN;

                      var newLeft = Math.max(MARGIN, Math.min(Math.max(MARGIN, maxLeft), startLeft + dx));
                      var newTop = Math.max(MARGIN, Math.min(Math.max(MARGIN, maxTop), startTop + dy));

                      parent.style.setProperty("left", newLeft + "px", "important");
                      parent.style.setProperty("top", newTop + "px", "important");
                      parent.style.setProperty("right", "auto", "important");
                      parent.style.setProperty("bottom", "auto", "important");
                    }

                    function onMouseUp() {
                      shield.remove();
                      parent.classList.remove("is-dragging");
                      parent.style.transition = "";
                      document.removeEventListener("mousemove", onMouseMove);
                      document.removeEventListener("mouseup", onMouseUp);

                      if (hasMoved) {
                        var blockClick = (clickEvt) => {
                          clickEvt.stopPropagation();
                          clickEvt.preventDefault();
                          window.removeEventListener("click", blockClick, true);
                        };
                        window.addEventListener("click", blockClick, true);
                      }
                    }

                    shield.addEventListener("mousemove", onMouseMove);
                    shield.addEventListener("mouseup", onMouseUp);
                    document.addEventListener("mousemove", onMouseMove);
                    document.addEventListener("mouseup", onMouseUp);
                  });
                }

                // ==========================================================
                // --- ADVANCED FEATURE ENGINE (Video.js Inspired) ---
                // ==========================================================

                // 1. Settings Persistence (localStorage)
                var YVStorage = {
                  get: function (k, def) {
                    try {
                      var val = localStorage.getItem("yv_" + k);
                      return val !== null ? JSON.parse(val) : def;
                    } catch (e) { return def; }
                  },
                  set: function (k, val) {
                    try { localStorage.setItem("yv_" + k, JSON.stringify(val)); } catch (e) { }
                  }
                };

                // 2. Floating On-Screen HUD Pill (defined at player instance scope)

                // 3. Double-Click / Double-Tap to Seek (Mobile & Desktop with Ripple Animation)
                var clickTimeout = null;
                var lastClickTime = 0;
                var rippleLeft = parent.querySelector(".yvPlayer-ripple-left");
                var rippleRight = parent.querySelector(".yvPlayer-ripple-right");

                function triggerRipple(zoneEl) {
                  if (!zoneEl) return;
                  zoneEl.classList.remove("is-active");
                  void zoneEl.offsetWidth; // trigger reflow
                  zoneEl.classList.add("is-active");
                  setTimeout(() => zoneEl.classList.remove("is-active"), 500);
                }

                function handleVideoSurfaceClick(clientX, clientY) {
                  if (!hasStarted || Date.now() < ignorePlayPauseUntil) return;
                  var rect = parent.getBoundingClientRect();
                  var relX = clientX - rect.left;
                  var width = rect.width;
                  var now = Date.now();

                  if (now - lastClickTime < 300) {
                    // Double-click detected!
                    clearTimeout(clickTimeout);
                    clickTimeout = null;
                    lastClickTime = 0;

                    if (relX < width * 0.35) {
                      backward();
                      triggerRipple(rippleLeft);
                      showHUD("ti ti-rewind-backward-10", "10s Rewind");
                    } else if (relX > width * 0.65) {
                      forward();
                      triggerRipple(rippleRight);
                      showHUD("ti ti-rewind-forward-10", "10s Forward");
                    } else {
                      toggleFullscreen();
                    }
                  } else {
                    lastClickTime = now;
                    clickTimeout = setTimeout(function () {
                      if (!hasStarted || Date.now() < ignorePlayPauseUntil) return;
                      togglePlayPause();
                      clickTimeout = null;
                    }, 280);
                  }
                }

                var videoSurface = parent.querySelector(".yvPlayer-container");
                if (videoSurface) {
                  videoSurface.addEventListener("click", function (e) {
                    if (!hasStarted || Date.now() < ignorePlayPauseUntil) return;
                    if (e.target.closest("span, button, input, select, label, .yvPlayer-controls, .yvPlayer-settings-box")) return;
                    handleVideoSurfaceClick(e.clientX, e.clientY);
                  });
                }

                // 4. Mouse-Wheel Volume Scroll
                parent.addEventListener("wheel", function (e) {
                  // Don't hijack if scrolling inside settings or speed panel
                  if (e.target.closest(".yvPlayer-settings-box, .yvPlayer-speed-panel, .yvPlayer-shortcuts-modal")) return;
                  e.preventDefault();
                  var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
                  if (!yt) return;
                  var currentVol = yt.getVolume ? yt.getVolume() : 100;
                  var delta = e.deltaY < 0 ? 5 : -5;
                  var newVol = Math.max(0, Math.min(100, Math.round(currentVol + delta)));

                  if (typeof yt.setVolume === "function") yt.setVolume(newVol);
                  if (newVol > 0 && typeof yt.unMute === "function" && yt.isMuted && yt.isMuted()) yt.unMute();
                  if (newVol === 0 && typeof yt.mute === "function") yt.mute();

                  var volSlider = parent.querySelector(".yvPlayer-vol-slider");
                  if (volSlider) volSlider.value = newVol;
                  updateVolumeIcon(newVol, newVol === 0);
                  YVStorage.set("volume", newVol);

                  var iconClass = newVol === 0 ? "ti ti-volume-3" : (newVol < 50 ? "ti ti-volume-2" : "ti ti-volume");
                  showHUD(iconClass, newVol + "%");
                }, { passive: false });

                // 7. Sleep Timer (Auto-Pause, defined at player instance scope)

                // 8. Keyboard Shortcuts Modal (defined at player instance scope)
                var shortcutsCloseBtn = parent.querySelector(".yvPlayer-shortcuts-close-btn");
                if (shortcutsCloseBtn) {
                  shortcutsCloseBtn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    toggleShortcutsModal(false);
                  });
                }
                var shortcutsModalEl = parent.querySelector(".yvPlayer-shortcuts-modal");
                if (shortcutsModalEl) {
                  shortcutsModalEl.addEventListener("click", function (e) {
                    if (e.target === shortcutsModalEl) toggleShortcutsModal(false);
                  });
                }

                // 9. Frame-by-Frame Stepping & Global Hotkey Controller
                function stepFrame(forward) {
                  var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
                  if (!yt) return;
                  var isPlaying = YVPlayer.players[videoTag]["isPlaying"];
                  if (isPlaying) {
                    yt.pauseVideo();
                  }
                  var cur = yt.getCurrentTime ? yt.getCurrentTime() : 0;
                  var fps = 25; // standard ~0.04s frame step
                  var delta = forward ? (1 / fps) : -(1 / fps);
                  var target = Math.max(0, cur + delta);
                  yt.seekTo(target, true);
                  updateTextTime();
                  updateTimeSlider();
                  showHUD(forward ? "ti ti-chevron-right" : "ti ti-chevron-left", forward ? "Frame +1" : "Frame -1");
                }

                parent.setAttribute("tabindex", "0");
                parent.addEventListener("click", function () {
                  try { parent.focus(); } catch (e) { }
                });

                function handleHotkeys(e) {
                  if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable)) return;
                  var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
                  if (!yt) return;

                  var k = e.key;
                  if (k === " " || k === "Spacebar" || k === "k" || k === "K") {
                    e.preventDefault();
                    togglePlayPause();
                  } else if (k === "j" || k === "J") {
                    e.preventDefault();
                    backward();
                    showHUD("ti ti-rewind-backward-10", "-10s");
                  } else if (k === "l" || k === "L") {
                    e.preventDefault();
                    forward();
                    showHUD("ti ti-rewind-forward-10", "+10s");
                  } else if (k === "ArrowLeft") {
                    e.preventDefault();
                    var cur = yt.getCurrentTime ? yt.getCurrentTime() : 0;
                    yt.seekTo(Math.max(0, cur - 5), true);
                    updateTextTime();
                    updateTimeSlider();
                    showHUD("ti ti-rewind-backward-10", "-5s");
                  } else if (k === "ArrowRight") {
                    e.preventDefault();
                    var cur = yt.getCurrentTime ? yt.getCurrentTime() : 0;
                    var dur = yt.getDuration ? yt.getDuration() : 0;
                    yt.seekTo(dur > 0 ? Math.min(dur, cur + 5) : cur + 5, true);
                    updateTextTime();
                    updateTimeSlider();
                    showHUD("ti ti-rewind-forward-10", "+5s");
                  } else if (k === "ArrowUp") {
                    e.preventDefault();
                    var curV = yt.getVolume ? yt.getVolume() : 100;
                    if (yt.isMuted && yt.isMuted()) { yt.unMute(); curV = 0; }
                    var newV = Math.min(100, Math.round(curV + 5));
                    yt.setVolume(newV);
                    if (volSlider) { volSlider.value = newV; volSlider.style.setProperty("--volPercent", newV + "%"); }
                    updateVolumeIcon(newV, false);
                    YVStorage.set("volume", newV);
                    showHUD(newV < 50 ? "ti ti-volume-2" : "ti ti-volume", newV + "%");
                  } else if (k === "ArrowDown") {
                    e.preventDefault();
                    var curV = yt.getVolume ? yt.getVolume() : 100;
                    var newV = Math.max(0, Math.round(curV - 5));
                    yt.setVolume(newV);
                    if (newV === 0) yt.mute();
                    if (volSlider) { volSlider.value = newV; volSlider.style.setProperty("--volPercent", newV + "%"); }
                    updateVolumeIcon(newV, newV === 0);
                    YVStorage.set("volume", newV);
                    showHUD(newV === 0 ? "ti ti-volume-3" : (newV < 50 ? "ti ti-volume-2" : "ti ti-volume"), newV + "%");
                  } else if (k === "m" || k === "M") {
                    e.preventDefault();
                    if (volBtn) volBtn.click();
                  } else if (k === "f" || k === "F") {
                    e.preventDefault();
                    toggleFullscreen();
                  } else if (k === "p" || k === "P") {
                    e.preventDefault();
                    togglePiP();
                  } else if (k === "c" || k === "C") {
                    e.preventDefault();
                    toggleCaptions();
                  } else if (k === "s" || k === "S") {
                    e.preventDefault();
                    if (speedBtn) speedBtn.click();
                  } else if (k === "?" || (e.shiftKey && (k === "/" || k === "?"))) {
                    e.preventDefault();
                    toggleShortcutsModal();
                  } else if (k === "Escape") {
                    toggleShortcutsModal(false);
                    if (parent.classList.contains("is-pip")) exitInPagePiP();
                    var openSettings = parent.querySelector(".yvPlayer-settings-menu.is-active");
                    if (openSettings) openSettings.classList.remove("is-active");
                    var openSpeed = parent.querySelector(".yvPlayer-speed-panel.is-active");
                    if (openSpeed) openSpeed.classList.remove("is-active");
                  } else if (k === "," || k === "<") {
                    e.preventDefault();
                    stepFrame(false);
                  } else if (k === "." || k === ">") {
                    e.preventDefault();
                    stepFrame(true);
                  } else if (k >= "0" && k <= "9") {
                    e.preventDefault();
                    var pct = parseInt(k, 10) * 10;
                    var dur = yt.getDuration ? yt.getDuration() : 0;
                    if (dur > 0) {
                      var targetSec = (pct / 100) * dur;
                      yt.seekTo(targetSec, true);
                      showHUD("ti ti-clock", pct + "%");
                    }
                  }
                }

                document.addEventListener("keydown", handleHotkeys);
                parent.addEventListener("keydown", handleHotkeys);

                // 10. Interactive Chapter Notches Rendering & Tooltip
                var chaptersList = (YVPlayer.players[videoTag]["params"] && YVPlayer.players[videoTag]["params"]["chapters"]) || [];
                function renderChapterNotches() {
                  var notchContainer = parent.querySelector(".yvPlayer-chapter-notches");
                  if (!notchContainer) return;
                  notchContainer.innerHTML = "";
                  var yt = YVPlayer.players[videoTag]["videoTag"];
                  var dur = (yt && yt.getDuration) ? yt.getDuration() : 0;
                  if (!dur || !chaptersList || chaptersList.length <= 1) return;

                  chaptersList.forEach(ch => {
                    if (ch.time > 0 && ch.time < dur) {
                      var pct = (ch.time / dur) * 100;
                      var notch = document.createElement("span");
                      notch.className = "yvPlayer-chapter-notch";
                      notch.style.left = pct + "%";
                      notch.title = ch.title || "";
                      notchContainer.appendChild(notch);
                    }
                  });
                }

                // 11. Restore User Settings from LocalStorage
                (function restoreSavedPreferences() {
                  var savedTheme = YVStorage.get("theme", null);
                  if (savedTheme && savedTheme.color) {
                    applyThemeColor(savedTheme.color, savedTheme.name || "Theme");
                  }
                  var savedVol = YVStorage.get("volume", null);
                  if (savedVol !== null && typeof savedVol === "number") {
                    var volSlider = parent.querySelector(".yvPlayer-vol-slider");
                    if (volSlider) volSlider.value = savedVol;
                    updateVolumeIcon(savedVol, savedVol === 0);
                  }
                })();

                setupPiPDraggable();

                function setupAllCornerResizers() {
                  var handles = parent.querySelectorAll(".yvPlayer-pip-resizer");
                  handles.forEach((handle) => {
                    var type = handle.getAttribute("data-type");
                    handle.addEventListener("mousedown", (e) => {
                      if (!parent.classList.contains("is-pip")) return;
                      e.preventDefault();
                      e.stopPropagation();

                      var startX = e.clientX;
                      var startY = e.clientY;
                      var rect = parent.getBoundingClientRect();
                      var startWidth = rect.width;
                      var startLeft = rect.left;
                      var startTop = rect.top;
                      var startRight = rect.right;
                      var startBottom = rect.bottom;
                      var cursor = window.getComputedStyle(handle).cursor;

                      var shield = document.createElement("div");
                      shield.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999999;cursor:" + cursor + ";user-select:none;";
                      document.body.appendChild(shield);
                      parent.style.transition = "none";

                      function onMouseMove(moveEvt) {
                        var isShorts = checkIsShorts();
                        var currentAspect = isShorts ? (9 / 16) : (16 / 9);
                        var minW = isShorts ? 180 : MIN_PIP_WIDTH;
                        var dx = moveEvt.clientX - startX;
                        var dy = moveEvt.clientY - startY;

                        var dw = 0;
                        var maxWidth = isShorts ? Math.min(360, window.innerWidth - MARGIN * 2) : (window.innerWidth - MARGIN * 2);

                        if (type === "br") {

                          dw = Math.max(dx, dy * currentAspect);
                          var maxW_byRight = (window.innerWidth - MARGIN) - startLeft;
                          var maxW_byBottom = ((window.innerHeight - MARGIN) - startTop) * currentAspect;
                          maxWidth = Math.max(minW, Math.min(maxW_byRight, maxW_byBottom));
                        } else if (type === "tl") {

                          dw = Math.max(-dx, -dy * currentAspect);
                          var maxW_byLeft = startRight - MARGIN;
                          var maxW_byTop = (startBottom - MARGIN) * currentAspect;
                          maxWidth = Math.max(minW, Math.min(maxW_byLeft, maxW_byTop));
                        } else if (type === "tr") {

                          dw = Math.max(dx, -dy * currentAspect);
                          var maxW_byRight = (window.innerWidth - MARGIN) - startLeft;
                          var maxW_byTop = (startBottom - MARGIN) * currentAspect;
                          maxWidth = Math.max(minW, Math.min(maxW_byRight, maxW_byTop));
                        } else if (type === "bl") {

                          dw = Math.max(-dx, dy * currentAspect);
                          var maxW_byLeft = startRight - MARGIN;
                          var maxW_byBottom = ((window.innerHeight - MARGIN) - startTop) * currentAspect;
                          maxWidth = Math.max(minW, Math.min(maxW_byLeft, maxW_byTop));
                        }

                        var computedWidth = Math.max(minW, Math.min(maxWidth, startWidth + dw));
                        var finalWidth = Math.round(computedWidth);
                        var snappedHeight = Math.round(finalWidth / currentAspect);

                        if (finalWidth > maxWidth) {
                          finalWidth = maxWidth;
                          snappedHeight = Math.round(finalWidth / currentAspect);
                        }
                        if (finalWidth < minW) {
                          finalWidth = minW;
                          snappedHeight = Math.round(finalWidth / currentAspect);
                        }

                        var newLeft = startLeft;
                        var newTop = startTop;

                        if (type === "br") {
                          newLeft = startLeft;
                          newTop = startTop;
                        } else if (type === "tl") {
                          newLeft = startRight - finalWidth;
                          newTop = startBottom - snappedHeight;
                        } else if (type === "tr") {
                          newLeft = startLeft;
                          newTop = startBottom - snappedHeight;
                        } else if (type === "bl") {
                          newLeft = startRight - finalWidth;
                          newTop = startTop;
                        }

                        newLeft = Math.max(MARGIN, Math.min(window.innerWidth - finalWidth - MARGIN, newLeft));
                        newTop = Math.max(MARGIN, Math.min(window.innerHeight - snappedHeight - MARGIN, newTop));

                        parent.style.setProperty("--pip-width", finalWidth + "px");
                        parent.style.setProperty("width", finalWidth + "px", "important");
                        parent.style.setProperty("height", snappedHeight + "px", "important");
                        parent.style.setProperty("left", newLeft + "px", "important");
                        parent.style.setProperty("top", newTop + "px", "important");
                        parent.style.setProperty("right", "auto", "important");
                        parent.style.setProperty("bottom", "auto", "important");
                      }

                      function onMouseUp() {
                        shield.remove();
                        parent.style.transition = "";
                        document.removeEventListener("mousemove", onMouseMove);
                        document.removeEventListener("mouseup", onMouseUp);
                      }

                      shield.addEventListener("mousemove", onMouseMove);
                      shield.addEventListener("mouseup", onMouseUp);
                      document.addEventListener("mousemove", onMouseMove);
                      document.addEventListener("mouseup", onMouseUp);
                    });


                  });
                }

                setupAllCornerResizers();

                window.addEventListener("resize", () => {
                  if (!parent.classList.contains("is-pip")) return;
                  var rect = parent.getBoundingClientRect();
                  var clamped = clampPiPBounds(rect.left, rect.top, rect.width);
                  parent.style.setProperty("--pip-width", clamped.width + "px");
                  parent.style.setProperty("width", clamped.width + "px", "important");
                  parent.style.setProperty("height", clamped.height + "px", "important");
                  parent.style.setProperty("left", clamped.left + "px", "important");
                  parent.style.setProperty("top", clamped.top + "px", "important");
                });

                document.addEventListener("keydown", (e) => {
                  if (e.key === "Escape" && parent.classList.contains("is-pip")) {
                    exitInPagePiP();
                  }
                });

                function fullExitPiP() {
                  if (activePipWindow) {
                    try { activePipWindow.close(); } catch (e) { }
                    activePipWindow = null;
                  }
                  exitInPagePiP();
                }

                YVPlayer.players[videoTag]["togglePiP"] = togglePiP;
                YVPlayer.players[videoTag]["enterPiP"] = togglePiP;
                YVPlayer.players[videoTag]["exitPiP"] = fullExitPiP;

                var previewEl = sliderContainer ? sliderContainer.querySelector(".yvPlayer-timeline-preview") : null;
                var previewBox = previewEl ? previewEl.querySelector(".yvPlayer-preview-thumb-box") : null;
                var previewThumb = previewEl ? previewEl.querySelector(".yvPlayer-preview-thumb") : null;
                var previewTime = previewEl ? previewEl.querySelector(".yvPlayer-preview-time") : null;
                var hoverTrack = sliderContainer ? sliderContainer.querySelector(".yvPlayer-hover-track") : null;

                var storyboardData = null;
                var loadedSheets = new Set();
                var masterReady = false;

                function getActiveVideoId() {
                  return (YVPlayer.players[videoTag] && YVPlayer.players[videoTag]["params"] && YVPlayer.players[videoTag]["params"]["defaultId"]) || defaultId;
                }

                function preloadSheet(sheetIdx) {
                  var activeId = getActiveVideoId();
                  if (!storyboardData || sheetIdx < 0 || sheetIdx >= storyboardData.fragmentCount) return;
                  if (loadedSheets.has(sheetIdx)) return;
                  var img = new Image();
                  img.onload = () => {
                    if (getActiveVideoId() === activeId) {
                      loadedSheets.add(sheetIdx);
                    }
                  };
                  img.src = `/api/storyboard/sheet?id=${encodeURIComponent(activeId)}&sheet=${sheetIdx}`;
                }

                function setupCdnFallbackStoryboard(vid) {
                  if (!vid) return;
                  storyboardData = {
                    isCdnFallback: true,
                    videoId: vid
                  };
                  try {
                    [1, 2, 3].forEach(n => {
                      var img = new Image();
                      img.src = "https://img.youtube.com/vi/" + vid + "/" + n + ".jpg";
                    });
                  } catch (e) { }
                  if (previewBox) previewBox.classList.add("has-preview");
                }

                function loadStoryboardForVideo(newId) {
                  if (!newId) return;
                  if (YVPlayer.players[videoTag] && YVPlayer.players[videoTag]["params"]) {
                    YVPlayer.players[videoTag]["params"]["defaultId"] = newId;
                  }
                  loadedSheets.clear();
                  masterReady = false;
                  setupCdnFallbackStoryboard(newId);

                  fetch("/api/storyboard?id=" + encodeURIComponent(newId))
                    .then(res => {
                      if (!res.ok) throw new Error("No API");
                      return res.json();
                    })
                    .then(data => {
                      if (getActiveVideoId() !== newId) return;
                      if (data && data.success && data.fragmentCount) {
                        storyboardData = data;
                        if (data.hasMaster) {
                          var mImg = new Image();
                          mImg.onload = () => {
                            if (getActiveVideoId() === newId) {
                              masterReady = true;
                              if (lastHoverSecs !== null && lastDuration !== null) {
                                renderPreviewThumb(lastHoverSecs, lastDuration);
                              }
                            }
                          };
                          mImg.src = `/api/storyboard/master?id=${encodeURIComponent(newId)}`;
                        }
                        for (var s = 0; s < Math.min(3, data.fragmentCount); s++) {
                          preloadSheet(s);
                        }
                      }
                    })
                    .catch(() => { });
                }

                YVPlayer.players[videoTag]["loadStoryboard"] = loadStoryboardForVideo;
                loadStoryboardForVideo(getActiveVideoId());

                var lastHoverSecs = null;
                var lastDuration = null;

                function renderPreviewThumb(hoverSecs, duration) {
                  if (!storyboardData || !previewThumb || !previewBox) return;
                  var activeId = getActiveVideoId();

                  if (storyboardData.isCdnFallback) {
                    var pct = duration > 0 ? (hoverSecs / duration) : 0.5;
                    var frameNum = 1;
                    if (pct < 0.33) {
                      frameNum = 1;
                    } else if (pct < 0.66) {
                      frameNum = 2;
                    } else {
                      frameNum = 3;
                    }
                    var cdnUrl = "https://img.youtube.com/vi/" + activeId + "/" + frameNum + ".jpg";
                    previewThumb.style.backgroundImage = 'url("' + cdnUrl + '")';
                    previewThumb.style.backgroundPosition = "center center";
                    previewThumb.style.backgroundSize = "cover";
                    previewThumb.style.backgroundRepeat = "no-repeat";
                    previewBox.classList.add("has-preview");
                    return;
                  }

                  var totalFrames = storyboardData.totalCount || (storyboardData.fragmentCount * storyboardData.framesPerSheet);
                  var frameIndex = 0;
                  if (storyboardData.intervalMs && storyboardData.intervalMs > 0) {
                    frameIndex = Math.floor((hoverSecs * 1000) / storyboardData.intervalMs);
                  } else if (duration > 0 && totalFrames > 0) {
                    frameIndex = Math.floor((hoverSecs / duration) * totalFrames);
                  }
                  frameIndex = Math.max(0, Math.min(totalFrames - 1, frameIndex));

                  var sheetIndex = Math.floor(frameIndex / storyboardData.framesPerSheet);
                  var subIndex = frameIndex % storyboardData.framesPerSheet;
                  var col = subIndex % storyboardData.columns;
                  var row = Math.floor(subIndex / storyboardData.columns);

                  preloadSheet(sheetIndex);
                  preloadSheet(sheetIndex + 1);
                  preloadSheet(sheetIndex - 1);

                  var sheetUrl = `/api/storyboard/sheet?id=${encodeURIComponent(activeId)}&sheet=${sheetIndex}`;

                  if (loadedSheets.has(sheetIndex)) {
                    previewThumb.style.backgroundImage = `url("${sheetUrl}")`;
                    previewThumb.style.backgroundPosition = `-${col * storyboardData.width}px -${row * storyboardData.height}px`;
                    previewThumb.style.backgroundSize = `${storyboardData.columns * storyboardData.width}px ${storyboardData.rows * storyboardData.height}px`;
                    previewBox.classList.add("has-preview");
                  } else if (masterReady && storyboardData.hasMaster) {
                    var masterCols = storyboardData.masterCols || 10;
                    var masterRows = storyboardData.masterRows || 10;
                    var masterTotal = storyboardData.masterCount || 100;
                    var masterIndex = Math.min(masterTotal - 1, Math.max(0, Math.floor((hoverSecs / duration) * masterTotal)));
                    var mCol = masterIndex % masterCols;
                    var mRow = Math.floor(masterIndex / masterCols);
                    var mUrl = `/api/storyboard/master?id=${encodeURIComponent(activeId)}`;

                    previewThumb.style.backgroundImage = `url("${mUrl}")`;
                    previewThumb.style.backgroundPosition = `-${mCol * 160}px -${mRow * 90}px`;
                    previewThumb.style.backgroundSize = `${masterCols * 160}px ${masterRows * 90}px`;
                    previewBox.classList.add("has-preview");

                    var upgradeImg = new Image();
                    upgradeImg.onload = () => {
                      if (getActiveVideoId() === activeId) {
                        loadedSheets.add(sheetIndex);
                        if (lastHoverSecs !== null && lastDuration !== null) {
                          var curFrame = (storyboardData.intervalMs && storyboardData.intervalMs > 0)
                            ? Math.floor((lastHoverSecs * 1000) / storyboardData.intervalMs)
                            : Math.floor((lastHoverSecs / lastDuration) * totalFrames);
                          curFrame = Math.max(0, Math.min(totalFrames - 1, curFrame));
                          var curSheet = Math.floor(curFrame / storyboardData.framesPerSheet);
                          if (curSheet === sheetIndex) {
                            var curSub = curFrame % storyboardData.framesPerSheet;
                            var curCol = curSub % storyboardData.columns;
                            var curRow = Math.floor(curSub / storyboardData.columns);
                            previewThumb.style.backgroundImage = `url("${sheetUrl}")`;
                            previewThumb.style.backgroundPosition = `-${curCol * storyboardData.width}px -${curRow * storyboardData.height}px`;
                            previewThumb.style.backgroundSize = `${storyboardData.columns * storyboardData.width}px ${storyboardData.rows * storyboardData.height}px`;
                          }
                        }
                      }
                    };
                    upgradeImg.src = sheetUrl;
                  } else {
                    previewThumb.style.backgroundImage = `url("${sheetUrl}")`;
                    previewThumb.style.backgroundPosition = `-${col * storyboardData.width}px -${row * storyboardData.height}px`;
                    previewThumb.style.backgroundSize = `${storyboardData.columns * storyboardData.width}px ${storyboardData.rows * storyboardData.height}px`;
                    previewBox.classList.add("has-preview");
                  }
                }

                function updatePreview(clientX) {
                  var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
                  if (!yt || typeof yt.getDuration !== "function") return;
                  var duration = yt.getDuration();
                  if (typeof duration !== "number" || isNaN(duration) || duration <= 0) return;

                  var rect = sliderContainer.getBoundingClientRect();
                  var offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
                  var percent = rect.width > 0 ? (offsetX / rect.width) : 0;
                  var hoverSecs = percent * duration;
                  lastHoverSecs = hoverSecs;
                  lastDuration = duration;

                  if (hoverTrack) {
                    hoverTrack.style.width = (percent * 100) + "%";
                  }

                  if (storyboardData && previewThumb && previewBox) {
                    renderPreviewThumb(hoverSecs, duration);
                  } else if (previewBox) {
                    previewBox.classList.remove("has-preview");
                  }

                  if (previewTime) {
                    if (isLiveStream) {
                      if (percent >= 0.96) {
                        previewTime.textContent = "LIVE";
                      } else {
                        var behindSecs = Math.max(1, Math.round((1 - percent) * (duration > 60 ? duration : 3600)));
                        var m = Math.floor(behindSecs / 60);
                        var s = behindSecs % 60;
                        previewTime.textContent = "-" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
                      }
                    } else {
                      previewTime.textContent = formatTime(hoverSecs);
                    }
                  }

                  if (previewEl) {
                    var previewHalfWidth = 80;
                    var clampedX = rect.width <= previewHalfWidth * 2
                      ? (rect.width / 2)
                      : Math.max(previewHalfWidth, Math.min(offsetX, rect.width - previewHalfWidth));
                    previewEl.style.left = clampedX + "px";
                    previewEl.classList.add("is-visible");
                  }
                }

                function hidePreview() {
                  lastHoverSecs = null;
                  lastDuration = null;
                  if (previewEl) previewEl.classList.remove("is-visible");
                  if (hoverTrack) hoverTrack.style.width = "0%";
                }

                if (sliderContainer) {
                  sliderContainer.addEventListener("mousemove", (e) => {
                    clearTimeout(controlsTimeout);
                    updatePreview(e.clientX);
                  });
                  sliderContainer.addEventListener("click", () => {
                    var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
                    if (!yt || typeof yt.seekTo !== "function") return;
                    var duration = yt.getDuration ? yt.getDuration() : 0;
                    if (isLiveStream) {
                      var percent = (typeof lastHoverSecs === "number" && lastDuration > 0) ? (lastHoverSecs / lastDuration) : 1;
                      if (percent >= 0.96) {
                        isLiveDvrBehind = false;
                        parent.classList.remove("is-live-behind");
                        var badgeText = parent.querySelector(".yvPlayer-live-text");
                        if (badgeText) badgeText.textContent = "LIVE";
                        var badge = parent.querySelector(".yvPlayer-live-badge");
                        if (badge) badge.title = "Live Broadcast (Synced to real-time live edge)";
                        if (sliderInput) {
                          sliderInput.value = 100;
                          var seekCol = (YVPlayer.players[videoTag] && YVPlayer.players[videoTag].activeThemeColor) || activeThemeColor || parent.style.getPropertyValue("--sliderSeekTrackColor") || "#fe0001";
                          sliderInput.style.background = `linear-gradient(to right, ${seekCol} 100%, transparent 100%)`;
                        }
                        yt.seekTo(9999999, true);
                      } else {
                        isLiveDvrBehind = true;
                        parent.classList.add("is-live-behind");
                        var behindSecs = Math.max(1, Math.round((1 - percent) * (duration > 60 ? duration : 3600)));
                        var m = Math.floor(behindSecs / 60);
                        var s = behindSecs % 60;
                        var badgeText = parent.querySelector(".yvPlayer-live-text");
                        if (badgeText) badgeText.textContent = "-" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
                        var badge = parent.querySelector(".yvPlayer-live-badge");
                        if (badge) badge.title = "Behind live broadcast (Click to sync to live edge)";
                        if (sliderInput) {
                          sliderInput.value = percent * 100;
                          var seekCol = (YVPlayer.players[videoTag] && YVPlayer.players[videoTag].activeThemeColor) || activeThemeColor || parent.style.getPropertyValue("--sliderSeekTrackColor") || "#fe0001";
                          sliderInput.style.background = `linear-gradient(to right, ${seekCol} ${percent * 100}%, rgba(255, 255, 255, 0.2) ${percent * 100}%)`;
                        }
                        yt.seekTo(percent * duration, true);
                      }
                      return;
                    }
                    if (typeof lastHoverSecs === "number" && !isNaN(lastHoverSecs) && lastHoverSecs >= 0) {
                      if (parent.classList.contains("is-ended")) {
                        parent.classList.remove("is-ended");
                      }
                      yt.seekTo(lastHoverSecs, true);
                      if (duration > 0 && sliderInput) {
                        var progress = (lastHoverSecs / duration) * 100;
                        sliderInput.value = progress;
                        var seekCol = (YVPlayer.players[videoTag] && YVPlayer.players[videoTag].activeThemeColor) || activeThemeColor || parent.style.getPropertyValue("--sliderSeekTrackColor") || "#fe0001";
                        sliderInput.style.background = `linear-gradient(to right, ${seekCol} ${progress}%, transparent ${progress}%)`;
                      }
                      updateTextTime();
                    }
                  });
                  sliderContainer.addEventListener("mouseleave", () => {
                    hidePreview();
                    clearTimeout(controlsTimeout);
                    controlsTimeout = setTimeout(() => {
                      if (hasStarted) parent.querySelector(".yvPlayer-controls-box").classList.remove("yvPlayer-controls-open");
                    }, 3000);
                  });
                  sliderContainer.addEventListener("mouseenter", () => {
                    clearTimeout(controlsTimeout);
                  });
                  sliderContainer.addEventListener("touchmove", (e) => {
                    if (e.touches && e.touches[0]) updatePreview(e.touches[0].clientX);
                  }, { passive: true });
                  sliderContainer.addEventListener("touchend", hidePreview);
                }

                parent.addEventListener("mousemove", () => {
                  if (hasStarted) {
                    parent.querySelector(".yvPlayer-controls-box").classList.add("yvPlayer-controls-open");
                    clearTimeout(controlsTimeout);
                    controlsTimeout = setTimeout(() => {
                      var sb = parent.querySelector(".yvPlayer-settings-box");
                      var sp = parent.querySelector(".yvPlayer-speed-panel");
                      if ((sb && sb.style.display === "block") || (sp && sp.style.display === "flex")) {
                        return; // Never auto-hide while settings or speed panel is active
                      }
                      if (!sliderContainer || !sliderContainer.matches(":hover")) {
                        parent.querySelector(".yvPlayer-controls-box").classList.remove("yvPlayer-controls-open");
                      }
                    }, 3000);
                  }
                });
      };

      var controlsInitialized = false;
      function initControlsOnce() {
        if (controlsInitialized) return;
        controlsInitialized = true;
        try {
          initControls();
        } catch (e) {
          console.warn("[yvPlayer] Error initializing controls:", e);
        }
        var loaderIcon = parent.querySelector(".yvPlayer-container span i");
        if (loaderIcon) loaderIcon.classList.remove("yvPlayer-loading");
        safeResolve();
      }

      var fallbackTimer = setTimeout(function () {
        initControlsOnce();
      }, 1200);

      var isShortsInit = !!(YVPlayer.players[videoTag]["params"]["shorts"] || YVPlayer.players[videoTag]["params"]["isShorts"]);
      var isLocalOrSandbox = false;
      try {
        isLocalOrSandbox = !window.location ||
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1" ||
          window.location.origin === "null" ||
          window.location.protocol === "about:";
      } catch (e) {
        isLocalOrSandbox = true;
      }
      var isNoCookie = YVPlayer.players[videoTag]["params"]["nocookie"] !== false;
      var ytHost = (isNoCookie && !isLocalOrSandbox) ? "https://www.youtube-nocookie.com" : "https://www.youtube.com";

      var safeOrigin = undefined;
      try {
        if (window.location && window.location.origin && window.location.origin !== "null" && !window.location.origin.startsWith("about:")) {
          safeOrigin = window.location.origin;
        }
      } catch (e) { }

      var isAutoplay = !!(YVPlayer.players[videoTag]["params"] && (YVPlayer.players[videoTag]["params"]["autoplay"] === true || YVPlayer.players[videoTag]["params"]["autoplay"] === "true"));

      var playerVarsObj = {
        controls: 0,
        mute: isAutoplay ? 1 : 0,
        autoplay: isAutoplay ? 1 : 0,
        disablekb: 1,
        color: "white",
        fs: 0,
        playsinline: 1,
        rel: 0,
        loop: 0,
        cc_load_policy: 0,
        showinfo: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        enablejsapi: 1,
      };
      if (safeOrigin) playerVarsObj.origin = safeOrigin;
      try {
        if (window.location && window.location.href && !window.location.href.startsWith("about:")) {
          playerVarsObj.widget_referrer = window.location.href;
        }
      } catch (e) { }

      try {
        YVPlayer.players[videoTag]["videoTag"] = new YT.Player(playerTagId, {
          host: ytHost,
          videoId: YVPlayer.players[videoTag]["params"]["defaultId"],
          width: isShortsInit ? '666' : '100%',
          height: isShortsInit ? '1600' : '100%',
          playerVars: playerVarsObj,
          events: {
            'onReady': () => {
              clearTimeout(fallbackTimer);
              if (document.getElementById(videoTag) != null && videoTag) {
                var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
                if (pendingPlay) {
                  if (yt) {
                    try { if (typeof yt.unMute === "function" && !(playerParams && playerParams.background)) yt.unMute(); } catch (e) { }
                    try { if (typeof yt.playVideo === "function") yt.playVideo(); } catch (e) { }
                  }
                  initControlsOnce();
                } else if (isAutoplay) {
                  hasStarted = true;
                  parent.classList.add("is-active");
                  parent.classList.add("is-playing");
                  parent.classList.remove("is-paused");
                  var startOverlay = parent.querySelector(".yvPlayer-container span");
                  if (startOverlay) {
                    startOverlay.style.setProperty("display", "none", "important");
                    startOverlay.style.setProperty("pointer-events", "none", "important");
                  }
                  if (yt) {
                    try { if (typeof yt.unMute === "function" && !(playerParams && playerParams.background)) yt.unMute(); } catch (e) { }
                    try { if (typeof yt.playVideo === "function") yt.playVideo(); } catch (e) { }
                  }
                  initControlsOnce();
                } else {
                  YVPlayer.pauseVideoWithPromise(yt).then(function () {
                    initControlsOnce();
                  }).catch(function () {
                    initControlsOnce();
                  });
                }
              }
            },
            'onStateChange': onPlayerStateChange,
            'onError': (err) => {
              clearTimeout(fallbackTimer);
              console.warn("[yvPlayer] YouTube error:", err);
              initControlsOnce();
              if (err && (err.data === 150 || err.data === 101)) {
                showHUD("ti ti-alert-triangle", "Embed restricted by owner");
              }
            }
          }
        });
      } catch (err) {
        clearTimeout(fallbackTimer);
        console.warn("[yvPlayer] YT.Player init exception:", err);
        initControlsOnce();
      }
    });

    function backward() {
      if (document.pictureInPictureElement && nativePipVideo && document.pictureInPictureElement === nativePipVideo) {
        nativePipVideo.currentTime = Math.max(0, nativePipVideo.currentTime - 10);
        updateTextTime();
        updateTimeSlider();
        return;
      }
      var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
      if (!yt) return;
      if (parent.classList.contains("is-ended")) {
        parent.classList.remove("is-ended");
      }
      var currentTime = yt.getCurrentTime();
      yt.seekTo(Math.max(0, currentTime - 10), true);
      updateTextTime();
      updateTimeSlider();
      clearTimeout(controlsTimeout);
      controlsTimeout = setTimeout(() => { parent.querySelector(".yvPlayer-controls-box").classList.remove("yvPlayer-controls-open"); }, 3000);
    }

    function forward() {
      if (document.pictureInPictureElement && nativePipVideo && document.pictureInPictureElement === nativePipVideo) {
        var dur = nativePipVideo.duration || (yt && yt.getDuration ? yt.getDuration() : 0);
        nativePipVideo.currentTime = dur > 0 ? Math.min(dur, nativePipVideo.currentTime + 10) : nativePipVideo.currentTime + 10;
        updateTextTime();
        updateTimeSlider();
        return;
      }
      var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
      if (!yt) return;
      var currentTime = yt.getCurrentTime();
      var duration = yt.getDuration ? yt.getDuration() : 0;
      yt.seekTo(duration > 0 ? Math.min(duration, currentTime + 10) : currentTime + 10, true);
      updateTextTime();
      updateTimeSlider();
      clearTimeout(controlsTimeout);
      controlsTimeout = setTimeout(() => { parent.querySelector(".yvPlayer-controls-box").classList.remove("yvPlayer-controls-open"); }, 3000);
    }

    function togglePlayPause() {
      if (playerParams && playerParams.background) {
        return; // Background mode must never be paused
      }
      if (Date.now() < ignorePlayPauseUntil) {
        return;
      }
      if (document.pictureInPictureElement && nativePipVideo && document.pictureInPictureElement === nativePipVideo) {
        if (nativePipVideo.paused) {
          nativePipVideo.play();
          parent.classList.remove("is-paused");
          parent.classList.add("is-playing");
          var bottomBtn = parent.querySelector(".yvPlayer-bottom-play i");
          if (bottomBtn) bottomBtn.className = "ti ti-player-pause-filled";
        } else {
          nativePipVideo.pause();
          parent.classList.remove("is-playing");
          parent.classList.add("is-paused");
          var bottomBtn = parent.querySelector(".yvPlayer-bottom-play i");
          if (bottomBtn) bottomBtn.className = "ti ti-player-play-filled";
        }
        return;
      }
      hasStarted = true;
      parent.classList.add("is-active");
      var startSpan = parent.querySelector(".yvPlayer-container span");
      if (startSpan) {
        startSpan.style.setProperty("display", "none", "important");
        startSpan.style.setProperty("pointer-events", "none", "important");
      }
      var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
      if (!yt) return;
      if (parent.classList.contains("is-ended")) {
        parent.classList.remove("is-ended");
        if (typeof yt.seekTo === "function") yt.seekTo(0, true);
        if (typeof yt.playVideo === "function") yt.playVideo();
        return;
      }
      if (YVPlayer.players[videoTag]["isPlaying"]) {
        yt.pauseVideo();
        parent.classList.remove("is-playing");
        parent.classList.add("is-paused");
        clearTimeout(controlsTimeout);
      } else {
        if (typeof yt.unMute === "function") yt.unMute();
        yt.playVideo();
        parent.classList.remove("is-paused");
        parent.classList.add("is-playing");
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => { parent.querySelector(".yvPlayer-controls-box").classList.remove("yvPlayer-controls-open"); }, 3000);
      }
    }

    function handleVideoEnded() {
      var isLoop = !!(playerParams.loop === true || (playerParams.loop !== false && (playerParams.background || playerParams.shorts)));
      var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
      if (isLoop && yt && typeof yt.seekTo === "function") {
        try {
          yt.seekTo(0, true);
          yt.playVideo();
          return;
        } catch (e) { }
      }

      YVPlayer.players[videoTag]["isPlaying"] = false;
      YVPlayer.players[videoTag]["playerState"] = "ended";
      parent.classList.add("is-active");
      parent.classList.remove("is-playing");
      parent.classList.add("is-paused");
      parent.classList.add("is-ended");

      var centerBtn = parent.querySelector(".yvPlayer-controls-box main .yvPlayer-play-pause-btn");
      if (centerBtn) {
        centerBtn.className = "ti yvPlayer-play-pause-btn ti-rotate-clockwise";
        centerBtn.title = "Replay";
      }
      var bottomBtn = parent.querySelector(".yvPlayer-bottom-play i");
      if (bottomBtn) {
        bottomBtn.className = "ti ti-rotate-clockwise";
      }

      var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
      if (yt && typeof yt.seekTo === "function") {
        try {
          yt.seekTo(0, true);
          yt.pauseVideo();
        } catch (e) { }
      }

      var duration = (yt && typeof yt.getDuration === "function") ? yt.getDuration() : 0;
      var slider = parent.querySelector(".yvPlayer-slider-container input") || parent.querySelector(".yvPlayer-controls-box .yvPlayer-controls div input");
      if (slider) {
        slider.value = 100;
        var seekCol = (YVPlayer.players[videoTag] && YVPlayer.players[videoTag].activeThemeColor) || activeThemeColor || parent.style.getPropertyValue("--sliderSeekTrackColor") || "#fe0001";
        slider.style.background = `linear-gradient(to right, ${seekCol} 100%, transparent 100%)`;
      }
      var p1 = parent.querySelector(".yvPlayer-curr-time");
      var p2 = parent.querySelector(".yvPlayer-dur-time");
      if (p1 && p2 && duration > 0) {
        p1.innerHTML = formatTime(String(duration));
        p2.innerHTML = formatTime(String(duration));
      }

      var startSpan = parent.querySelector(".yvPlayer-container span");
      if (startSpan) {
        startSpan.style.setProperty("display", "flex", "important");
        startSpan.style.setProperty("pointer-events", "auto", "important");
        var spanIcon = startSpan.querySelector("i");
        if (spanIcon) {
          spanIcon.style.display = "none";
        }
      }

      if (!parent.querySelector(".yvPlayer-controls-box").classList.contains("yvPlayer-controls-open")) {
        parent.querySelector(".yvPlayer-controls-box").classList.add("yvPlayer-controls-open");
      }
    }

    function formatTime(seconds) {
      var sec = (typeof seconds === "number" ? seconds : parseFloat(seconds)) | 0;
      if (sec < 0) sec = 0;
      var h = (sec / 3600) | 0;
      var m = ((sec - (h * 3600)) / 60) | 0;
      var s = sec - (h * 3600) - (m * 60);
      var mm = m < 10 ? "0" + m : "" + m;
      var ss = s < 10 ? "0" + s : "" + s;
      return h > 0 ? (h < 10 ? "0" + h : h) + ":" + mm + ":" + ss : mm + ":" + ss;
    }

    function timeToSeconds(t) {
      var p = t.split(":").map(Number);
      return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
    }

    var cachedP1 = null;
    var cachedP2 = null;
    var cachedSlider = null;
    var cachedLoadedTrack = null;
    var cachedLiveBadge = null;
    var cachedLiveText = null;

    function updateTextTime() {
      var currentTime = 0;
      var duration = 0;
      if (document.pictureInPictureElement && nativePipVideo && document.pictureInPictureElement === nativePipVideo) {
        currentTime = nativePipVideo.currentTime || 0;
        duration = nativePipVideo.duration || 0;
      } else {
        var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
        if (!yt || typeof yt.getCurrentTime !== "function" || typeof yt.getDuration !== "function") return;
        currentTime = yt.getCurrentTime();
        duration = yt.getDuration();
      }
      checkLiveBroadcast();
      if (isLiveStream) {
        if (!cachedLiveBadge) cachedLiveBadge = parent.querySelector(".yvPlayer-live-badge");
        if (!cachedLiveText) cachedLiveText = parent.querySelector(".yvPlayer-live-text");
        if (!cachedSlider) cachedSlider = parent.querySelector(".yvPlayer-slider-container input");
        if (isLiveDvrBehind && cachedSlider && parseFloat(cachedSlider.value) < 96) {
          parent.classList.add("is-live-behind");
          var behindSecs = Math.max(1, Math.round((1 - (parseFloat(cachedSlider.value) / 100)) * (duration > 60 ? duration : 3600)));
          var m = (behindSecs / 60) | 0;
          var s = behindSecs % 60;
          if (cachedLiveText) cachedLiveText.textContent = "-" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
          if (cachedLiveBadge) cachedLiveBadge.title = "Behind live broadcast (Click to sync to live edge)";
        } else {
          isLiveDvrBehind = false;
          parent.classList.remove("is-live-behind");
          if (cachedLiveText) cachedLiveText.textContent = "LIVE";
          if (cachedLiveBadge) cachedLiveBadge.title = "Live Broadcast (Synced to real-time live edge)";
        }
        return;
      }

      if (typeof duration !== "number" || isNaN(duration) || duration <= 0 || typeof currentTime !== "number" || isNaN(currentTime)) return;

      if (!cachedP1) cachedP1 = parent.querySelector(".yvPlayer-curr-time");
      if (!cachedP2) cachedP2 = parent.querySelector(".yvPlayer-dur-time");
      if (cachedP1) cachedP1.textContent = formatTime(currentTime);
      if (cachedP2) cachedP2.textContent = formatTime(duration);
    }

    function updateTimeSlider() {
      if (!cachedSlider) cachedSlider = parent.querySelector(".yvPlayer-slider-container input");
      if (!cachedSlider) return;
      var currentTime = 0;
      var duration = 0;
      var loaded = 0;
      if (document.pictureInPictureElement && nativePipVideo && document.pictureInPictureElement === nativePipVideo) {
        currentTime = nativePipVideo.currentTime || 0;
        duration = nativePipVideo.duration || 0;
        loaded = 100;
      } else {
        var yt = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
        if (!yt || typeof yt.getCurrentTime !== "function" || typeof yt.getDuration !== "function") return;
        currentTime = yt.getCurrentTime();
        duration = yt.getDuration();
        loaded = (yt.getVideoLoadedFraction ? yt.getVideoLoadedFraction() : 0) * 100;
      }
      if (isLiveStream) {
        var sc = (YVPlayer.players[videoTag] && YVPlayer.players[videoTag].activeThemeColor) || activeThemeColor || "#fe0001";
        if (isLiveDvrBehind) {
          var prog = parseFloat(cachedSlider.value) || 0;
          cachedSlider.style.background = "linear-gradient(to right, " + sc + " " + prog + "%, rgba(255, 255, 255, 0.2) " + prog + "%)";
        } else {
          cachedSlider.value = 100;
          cachedSlider.style.background = "linear-gradient(to right, " + sc + " 100%, transparent 100%)";
        }
        return;
      }

      if (typeof duration !== "number" || isNaN(duration) || duration <= 0 || typeof currentTime !== "number" || isNaN(currentTime)) return;

      if (duration > 0 && currentTime >= duration - 0.2) {
        if (YVPlayer.players[videoTag] && YVPlayer.players[videoTag]["isPlaying"]) {
          var isWatchdogLoop = !!(playerParams.loop === true || (playerParams.loop !== false && (playerParams.background || playerParams.shorts)));
          if (isWatchdogLoop) {
            if (document.pictureInPictureElement && nativePipVideo && document.pictureInPictureElement === nativePipVideo) {
              nativePipVideo.currentTime = 0;
              nativePipVideo.play();
            } else {
              yt.seekTo(0, true);
              yt.playVideo();
            }
          } else {
            handleVideoEnded();
            return;
          }
        }
      }

      var progress = (currentTime / duration) * 100;
      if (isNaN(progress)) return;
      cachedSlider.value = progress;
      var seekCol = (YVPlayer.players[videoTag] && YVPlayer.players[videoTag].activeThemeColor) || activeThemeColor || parent.style.getPropertyValue("--sliderSeekTrackColor") || "#fe0001";
      cachedSlider.style.background = `linear-gradient(to right, ${seekCol} ${progress}%, transparent ${progress}%)`;
      if (!cachedLoadedTrack) cachedLoadedTrack = parent.querySelector(".yvPlayer-loaded-track");
      if (cachedLoadedTrack) cachedLoadedTrack.style.width = loaded + "%";
    }
    function updateSlider() {
      clearTimeout(controlsTimeout);
      var slider = parent.querySelector(".yvPlayer-slider-container input") || parent.querySelector(".yvPlayer-controls-box .yvPlayer-controls div input");
      if (!slider) return;
      if (document.pictureInPictureElement && nativePipVideo && document.pictureInPictureElement === nativePipVideo) {
        var dur = nativePipVideo.duration || 1;
        var progress = parseFloat(slider.value);
        var seekCol = (YVPlayer.players[videoTag] && YVPlayer.players[videoTag].activeThemeColor) || activeThemeColor || parent.style.getPropertyValue("--sliderSeekTrackColor") || "#fe0001";
        slider.style.background = `linear-gradient(to right, ${seekCol} ${progress}%, transparent ${progress}%)`;
        nativePipVideo.currentTime = (progress / 100) * dur;
        updateTextTime();
        return;
      }
      var yt = YVPlayer.players[videoTag]["videoTag"];
      if (!yt || typeof yt.getDuration !== "function") return;
      var duration = yt.getDuration();
      var progress = parseFloat(slider.value);
      var seekCol = (YVPlayer.players[videoTag] && YVPlayer.players[videoTag].activeThemeColor) || activeThemeColor || parent.style.getPropertyValue("--sliderSeekTrackColor") || "#fe0001";

      if (isLiveStream) {
        if (progress < 96) {
          isLiveDvrBehind = true;
          parent.classList.add("is-live-behind");
          slider.style.background = `linear-gradient(to right, ${seekCol} ${progress}%, rgba(255, 255, 255, 0.2) ${progress}%)`;
          var behindSecs = Math.max(1, Math.round((1 - (progress / 100)) * (duration > 60 ? duration : 3600)));
          var m = Math.floor(behindSecs / 60);
          var s = behindSecs % 60;
          var badgeText = parent.querySelector(".yvPlayer-live-text");
          if (badgeText) badgeText.textContent = "-" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
          var badge = parent.querySelector(".yvPlayer-live-badge");
          if (badge) badge.title = "Behind live broadcast (Click to sync to live edge)";
          var targetTime = (progress / 100) * (duration > 60 ? duration : 3600);
          yt.seekTo(targetTime, true);
        } else {
          isLiveDvrBehind = false;
          parent.classList.remove("is-live-behind");
          slider.value = 100;
          slider.style.background = `linear-gradient(to right, ${seekCol} 100%, transparent 100%)`;
          var badgeText = parent.querySelector(".yvPlayer-live-text");
          if (badgeText) badgeText.textContent = "LIVE";
          var badge = parent.querySelector(".yvPlayer-live-badge");
          if (badge) badge.title = "Live Broadcast (Synced to real-time live edge)";
          yt.seekTo(9999999, true);
        }
        controlsTimeout = setTimeout(() => { parent.querySelector(".yvPlayer-controls-box").classList.remove("yvPlayer-controls-open"); }, 3000);
        return;
      }

      slider.style.background = `linear-gradient(to right, ${seekCol} ${progress}%, transparent ${progress}%)`;
      var targetTime = (progress / 100) * duration;

      if (parent.classList.contains("is-ended")) {
        parent.classList.remove("is-ended");
      }

      yt.seekTo(targetTime, true);
      updateTextTime();
      controlsTimeout = setTimeout(() => { parent.querySelector(".yvPlayer-controls-box").classList.remove("yvPlayer-controls-open"); }, 3000);
    }

    function toggleFullscreen() {
      const videoContainer = parent;
      if (!document.fullscreenElement && document.fullscreenEnabled) {
        if (videoContainer.requestFullscreen) {
          videoContainer.requestFullscreen();
        } else if (videoContainer.mozRequestFullScreen) {
          videoContainer.mozRequestFullScreen();
        } else if (videoContainer.webkitRequestFullscreen) {
          videoContainer.webkitRequestFullscreen();
        } else if (videoContainer.msRequestFullscreen) {
          videoContainer.msRequestFullscreen();
        }
      }
      else if (document.fullscreenElement && document.fullscreenEnabled) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } else {
        console.warn("Fullscreen api not supported in your browser.");
      }
    }

    // --- Settings & Style System ---
    var activeThemeColor = "#fe0001";
    var captionBgMode = "none";
    var captionTextColor = "#ffffff";
    var captionBgColor = "#000000";
    var captionBgOpacity = 75;

    function applyThemeColor(col, name) {
      if (!col) return;
      activeThemeColor = col;
      parent.style.setProperty("--sliderSeekTrackColor", col);
      parent.style.setProperty("--sliderThumbColor", col);
      parent.style.setProperty("--startBtnBg", col);
      parent.style.setProperty("--themeAccent", col);
      parent.style.setProperty("--yv-theme", col);

      var glowRgba = hexToRgba(col, 0.45);
      parent.style.setProperty("--themeGlow", glowRgba);
      var hoverBgRgba = hexToRgba(col, 0.22);
      parent.style.setProperty("--themeHoverBg", hoverBgRgba);
      var hoverBorderRgba = hexToRgba(col, 0.55);
      parent.style.setProperty("--themeHoverBorder", hoverBorderRgba);

      var themeLabel = parent.querySelector(".yvPlayer-curr-theme-label");
      if (themeLabel) themeLabel.textContent = name || "Custom";
      var themeSwatches = parent.querySelectorAll(".yvPlayer-theme-swatch");
      themeSwatches.forEach(function (sw) {
        var swCol = sw.getAttribute("data-color");
        sw.classList.toggle("is-active", swCol && swCol.toLowerCase() === col.toLowerCase());
      });
      var customThemeInput = parent.querySelector(".yvPlayer-custom-theme-picker");
      if (customThemeInput) customThemeInput.value = col;

      var slider = parent.querySelector(".yvPlayer-slider-container input");
      if (slider) {
        var prog = parseFloat(slider.value) || 0;
        slider.style.background = `linear-gradient(to right, ${col} ${prog}%, transparent ${prog}%)`;
      }
    }

    if (YVPlayer.players[videoTag]) {
      YVPlayer.players[videoTag].applyThemeColor = applyThemeColor;
    }

    var THEME_MAP = {
      "red": { color: "#fe0001", name: "Classic Red" },
      "default": { color: "#fe0001", name: "Classic Red" },
      "cyan": { color: "#00e5ff", name: "City Cyan" },
      "purple": { color: "#a855f7", name: "Fantasy Purple" },
      "emerald": { color: "#10b981", name: "Forest Emerald" },
      "teal": { color: "#14b8a6", name: "Sea Teal" },
      "gold": { color: "#f59e0b", name: "Amber Gold" },
      "white": { color: "#ffffff", name: "Minimal White" },
      "monochrome": { color: "#ffffff", name: "Minimal White" }
    };

    var initTheme = (YVPlayer.players[videoTag] && YVPlayer.players[videoTag]["params"]) ? (YVPlayer.players[videoTag]["params"]["theme"] || "red") : "red";
    var initCustomColor = (YVPlayer.players[videoTag] && YVPlayer.players[videoTag]["params"]) ? YVPlayer.players[videoTag]["params"]["customColor"] : null;
    if (initCustomColor) {
      applyThemeColor(initCustomColor, "Custom");
    } else if (THEME_MAP[initTheme.toLowerCase()]) {
      applyThemeColor(THEME_MAP[initTheme.toLowerCase()].color, THEME_MAP[initTheme.toLowerCase()].name);
    } else {
      applyThemeColor("#fe0001", "Classic Red");
    }

    function hexToRgba(hex, alpha) {
      if (!hex || typeof hex !== "string") {
        return "rgba(0, 0, 0, " + (alpha !== undefined ? alpha : 1) + ")";
      }
      hex = hex.replace("#", "").trim();
      if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      var r = parseInt(hex.substring(0, 2), 16) || 0;
      var g = parseInt(hex.substring(2, 4), 16) || 0;
      var b = parseInt(hex.substring(4, 6), 16) || 0;
      return "rgba(" + r + ", " + g + ", " + b + ", " + (alpha !== undefined ? alpha : 1) + ")";
    }

    function applyCaptionStyles() {
      try {
        if (!captionTextColor) captionTextColor = "#ffffff";
        if (!captionBgColor) captionBgColor = "#000000";
        if (captionBgOpacity === undefined || isNaN(captionBgOpacity)) captionBgOpacity = 75;

        parent.style.setProperty("--captionColor", captionTextColor);
        var bgOptionsBox = parent.querySelector(".yvPlayer-caption-bg-options-box");
        var styleLabel = parent.querySelector(".yvPlayer-curr-caption-style-label");
        var previewText = parent.querySelector(".yvPlayer-caption-preview-text");
        var actualCaptionLine = parent.querySelector(".yvPlayer-caption-line");

        if (captionBgMode === "box") {
          var alpha = (captionBgOpacity / 100);
          var rgba = hexToRgba(captionBgColor, alpha);
          parent.style.setProperty("--captionBg", rgba);
          parent.style.setProperty("--captionPadding", "6px 14px");
          parent.style.setProperty("--captionRadius", "8px");
          parent.style.setProperty("--captionBoxShadow", "0 3px 12px rgba(0, 0, 0, 0.75)");
          parent.style.setProperty("--captionBorder", "1px solid rgba(255, 255, 255, 0.18)");
          parent.style.setProperty("--captionTextShadow", "none");
          if (bgOptionsBox) bgOptionsBox.style.display = "block";
          if (styleLabel) styleLabel.textContent = "With Bg";

          if (actualCaptionLine) {
            actualCaptionLine.style.setProperty("background", rgba, "important");
            actualCaptionLine.style.setProperty("padding", "6px 14px", "important");
            actualCaptionLine.style.setProperty("border-radius", "8px", "important");
            actualCaptionLine.style.setProperty("box-shadow", "0 3px 12px rgba(0, 0, 0, 0.75)", "important");
            actualCaptionLine.style.setProperty("border", "1px solid rgba(255, 255, 255, 0.18)", "important");
            actualCaptionLine.style.setProperty("color", captionTextColor, "important");
            actualCaptionLine.style.setProperty("text-shadow", "none", "important");
          }

          if (previewText) {
            previewText.style.setProperty("color", captionTextColor, "important");
            previewText.style.setProperty("background", rgba, "important");
            previewText.style.setProperty("padding", "6px 14px", "important");
            previewText.style.setProperty("border-radius", "8px", "important");
            previewText.style.setProperty("box-shadow", "0 3px 12px rgba(0, 0, 0, 0.75)", "important");
            previewText.style.setProperty("border", "1px solid rgba(255, 255, 255, 0.18)", "important");
            previewText.style.setProperty("text-shadow", "none", "important");
          }
        } else {
          parent.style.setProperty("--captionBg", "transparent");
          parent.style.setProperty("--captionPadding", "0");
          parent.style.setProperty("--captionRadius", "0");
          parent.style.setProperty("--captionBoxShadow", "none");
          parent.style.setProperty("--captionBorder", "none");
          parent.style.setProperty("--captionTextShadow", "0 0 2px #000000, 0 0 4px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(0, 0, 0, 0.95)");
          if (bgOptionsBox) bgOptionsBox.style.display = "none";
          if (styleLabel) styleLabel.textContent = "Without Bg";

          if (actualCaptionLine) {
            actualCaptionLine.style.setProperty("background", "transparent", "important");
            actualCaptionLine.style.setProperty("padding", "0", "important");
            actualCaptionLine.style.setProperty("border-radius", "0", "important");
            actualCaptionLine.style.setProperty("box-shadow", "none", "important");
            actualCaptionLine.style.setProperty("border", "none", "important");
            actualCaptionLine.style.setProperty("color", captionTextColor, "important");
            actualCaptionLine.style.setProperty("text-shadow", "0 0 2px #000000, 0 0 4px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(0, 0, 0, 0.95)", "important");
          }

          if (previewText) {
            previewText.style.setProperty("color", captionTextColor, "important");
            previewText.style.setProperty("background", "transparent", "important");
            previewText.style.setProperty("padding", "0", "important");
            previewText.style.setProperty("border-radius", "0", "important");
            previewText.style.setProperty("box-shadow", "none", "important");
            previewText.style.setProperty("border", "none", "important");
            previewText.style.setProperty("text-shadow", "0 0 2px #000000, 0 0 4px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(0, 0, 0, 0.95)", "important");
          }
        }

        // Only update captions if they are already enabled; do NOT force-enable on settings open
        if (captionsEnabled) {
          if (YVPlayer.players[videoTag] && typeof YVPlayer.players[videoTag].updateCaptions === "function") {
            YVPlayer.players[videoTag].updateCaptions();
          }
          if (YVPlayer.players[videoTag] && typeof YVPlayer.players[videoTag].disableNativeCaptions === "function") {
            YVPlayer.players[videoTag].disableNativeCaptions();
          }
        }
      } catch (err) {
        console.warn("applyCaptionStyles notice:", err);
      }
    }

    function resetSettings() {
      var settings = parent.querySelector(".yvPlayer-settings-box");
      if (!settings) return;
      settings.querySelectorAll(".yvPlayer-settings-page").forEach(function (page) {
        page.classList.remove("is-active");
      });
      var mainPage = settings.querySelector(".yvPlayer-settings-page-main");
      if (mainPage) mainPage.classList.add("is-active");
    }

    function initSettingsEvents() {
      var settings = parent.querySelector(".yvPlayer-settings-box");
      if (!settings || settings._eventsInitialized) return;
      settings._eventsInitialized = true;

      // Prevent controls bar from hiding when mouse interacts with settings
      settings.addEventListener("mouseenter", function () {
        clearTimeout(controlsTimeout);
        parent.querySelector(".yvPlayer-controls-box").classList.add("yvPlayer-controls-open");
      });
      settings.addEventListener("mousemove", function (e) {
        e.stopPropagation();
        clearTimeout(controlsTimeout);
        parent.querySelector(".yvPlayer-controls-box").classList.add("yvPlayer-controls-open");
      });
      settings.addEventListener("mouseleave", function () {
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(function () {
          var sb = parent.querySelector(".yvPlayer-settings-box");
          if (sb && sb.style.display === "block") return; // stay open if settings visible
          if (hasStarted) parent.querySelector(".yvPlayer-controls-box").classList.remove("yvPlayer-controls-open");
        }, 3000);
      });

      // Navigation rows (Main -> Sub) - only rows in main page with data-target
      settings.querySelectorAll(".yvPlayer-settings-page-main .yvPlayer-settings-row[data-target]").forEach(function (row) {
        row.addEventListener("click", function (e) {
          e.stopPropagation();
          var target = row.getAttribute("data-target");
          if (!target) return;
          settings.querySelectorAll(".yvPlayer-settings-page").forEach(function (page) {
            page.classList.remove("is-active");
          });
          var subPage = settings.querySelector('.yvPlayer-settings-page[data-page="' + target + '"]');
          if (subPage) subPage.classList.add("is-active");
        });
      });

      // Back buttons (Sub -> Main)
      settings.querySelectorAll(".yvPlayer-settings-back-btn").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          resetSettings();
        });
      });

      // PiP Mode Selector UI & Sync
      var pipModeLabel = parent.querySelector(".yvPlayer-curr-pip-mode-label");
      function updatePipModeUI(mode) {
        currentPipMode = mode;
        try { localStorage.setItem("yvPlayer_pipMode", mode); } catch (e) { }
        if (pipModeLabel) {
          if (mode === "document") pipModeLabel.textContent = "Document PiP";
          else if (mode === "inpage") pipModeLabel.textContent = "In-Page Dock";
          else pipModeLabel.textContent = "Native Video";
        }
        settings.querySelectorAll(".yvPlayer-pip-opt").forEach(function (opt) {
          opt.classList.toggle("is-active", opt.getAttribute("data-mode") === mode);
        });
      }
      updatePipModeUI(currentPipMode);
      if (YVPlayer.players[videoTag]) {
        YVPlayer.players[videoTag]["setPipMode"] = updatePipModeUI;
        YVPlayer.players[videoTag]["getPipMode"] = function() { return currentPipMode; };
      }

      settings.querySelectorAll(".yvPlayer-pip-opt").forEach(function (opt) {
        opt.addEventListener("click", function (e) {
          e.stopPropagation();
          var mode = opt.getAttribute("data-mode") || "os";
          updatePipModeUI(mode);
          var label = (mode === "document" ? "Document PiP" : (mode === "inpage" ? "In-Page Dock" : "Native Video PiP"));
          showHUD(mode === "inpage" ? "ti ti-layout-bottombar-collapse" : (mode === "document" ? "ti ti-app-window" : "ti ti-device-tv"), label + " Selected");
        });
      });

      // Sleep Timer Options
      settings.querySelectorAll(".yvPlayer-sleep-opt").forEach(function (opt) {
        opt.addEventListener("click", function (e) {
          e.stopPropagation();
          var mins = parseInt(opt.getAttribute("data-minutes"), 10);
          setSleepTimer(mins);
        });
      });

      // Loop Video Toggle UI & Sync
      var loopRow = settings.querySelector(".yvPlayer-loop-row");
      var loopLabel = parent.querySelector(".yvPlayer-curr-loop-label");
      var loopToggle = parent.querySelector(".yvPlayer-loop-row .yvPlayer-toggle-switch");

      function updateLoopUI(active, notify) {
        var isLooping = !!active;
        playerParams.loop = isLooping;
        if (YVPlayer.players[videoTag] && YVPlayer.players[videoTag]["params"]) {
          YVPlayer.players[videoTag]["params"]["loop"] = isLooping;
        }
        var currLbl = parent.querySelector(".yvPlayer-curr-loop-label");
        if (currLbl) {
          currLbl.textContent = isLooping ? "On" : "Off";
          currLbl.style.color = isLooping ? "var(--themeAccent, #fe0001)" : "rgba(255, 255, 255, 0.6)";
        }
        var currTgl = parent.querySelector(".yvPlayer-loop-row .yvPlayer-toggle-switch");
        if (currTgl) {
          currTgl.classList.toggle("is-active", isLooping);
          currTgl.setAttribute("aria-checked", isLooping ? "true" : "false");
        }
        if (notify) {
          showHUD(isLooping ? "ti ti-repeat" : "ti ti-repeat-off", isLooping ? "Loop On" : "Loop Off");
        }
        if (typeof docPipWindow !== "undefined" && docPipWindow && !docPipWindow.closed) {
          try {
            docPipWindow.postMessage({ type: "setLoop", loop: isLooping }, "*");
          } catch (e) { }
        }
      }

      var initialLoop = (typeof playerParams.loop !== "undefined")
        ? (playerParams.loop === true || playerParams.loop === "true" || playerParams.loop === 1 || playerParams.loop === "1")
        : !!(playerParams.background || playerParams.shorts);

      updateLoopUI(initialLoop, false);

      if (YVPlayer.players[videoTag]) {
        YVPlayer.players[videoTag]["setLoopUI"] = updateLoopUI;
      }

      if (loopRow) {
        loopRow.addEventListener("click", function (e) {
          e.stopPropagation();
          playerParams._userLoop = true;
          var newState = !playerParams.loop;
          updateLoopUI(newState, true);
        });
      }

      // Shortcuts row click
      var shortcutsRow = settings.querySelector(".yvPlayer-shortcuts-row");
      if (shortcutsRow) {
        shortcutsRow.addEventListener("click", function (e) {
          e.stopPropagation();
          toggleShortcutsModal(true);
        });
      }

      // Theme swatches
      settings.querySelectorAll(".yvPlayer-theme-swatch").forEach(function (sw) {
        sw.addEventListener("click", function (e) {
          e.stopPropagation();
          var col = sw.getAttribute("data-color");
          var name = sw.getAttribute("data-name");
          applyThemeColor(col, name);
        });
      });

      var customThemePicker = settings.querySelector(".yvPlayer-custom-theme-picker");
      if (customThemePicker) {
        customThemePicker.addEventListener("input", function (e) {
          e.stopPropagation();
          applyThemeColor(e.target.value, "Custom");
        });
      }

      // Caption background mode segmented control
      settings.querySelectorAll(".yvPlayer-segment-btn").forEach(function (sBtn) {
        sBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          settings.querySelectorAll(".yvPlayer-segment-btn").forEach(function (b) { b.classList.remove("is-active"); });
          sBtn.classList.add("is-active");
          captionBgMode = sBtn.getAttribute("data-bg-mode") || "none";
          applyCaptionStyles();
        });
      });

      // Caption text colors
      settings.querySelectorAll(".yvPlayer-caption-text-colors .yvPlayer-color-swatch").forEach(function (sw) {
        sw.addEventListener("click", function (e) {
          e.stopPropagation();
          settings.querySelectorAll(".yvPlayer-caption-text-colors .yvPlayer-color-swatch").forEach(function (s) { s.classList.remove("is-active"); });
          sw.classList.add("is-active");
          var c = sw.getAttribute("data-color");
          if (c) captionTextColor = c;
          applyCaptionStyles();
        });
      });

      var customTextColorPicker = settings.querySelector(".yvPlayer-caption-custom-text-color");
      if (customTextColorPicker) {
        customTextColorPicker.addEventListener("input", function (e) {
          e.stopPropagation();
          settings.querySelectorAll(".yvPlayer-caption-text-colors .yvPlayer-color-swatch").forEach(function (s) { s.classList.remove("is-active"); });
          if (e.target && e.target.value) captionTextColor = e.target.value;
          applyCaptionStyles();
        });
      }

      // Caption background colors
      settings.querySelectorAll(".yvPlayer-caption-bg-colors .yvPlayer-color-swatch").forEach(function (sw) {
        sw.addEventListener("click", function (e) {
          e.stopPropagation();
          settings.querySelectorAll(".yvPlayer-caption-bg-colors .yvPlayer-color-swatch").forEach(function (s) { s.classList.remove("is-active"); });
          sw.classList.add("is-active");
          var c = sw.getAttribute("data-color");
          if (c) captionBgColor = c;
          applyCaptionStyles();
        });
      });

      var customBgColorPicker = settings.querySelector(".yvPlayer-caption-custom-bg-color");
      if (customBgColorPicker) {
        customBgColorPicker.addEventListener("input", function (e) {
          e.stopPropagation();
          settings.querySelectorAll(".yvPlayer-caption-bg-colors .yvPlayer-color-swatch").forEach(function (s) { s.classList.remove("is-active"); });
          if (e.target && e.target.value) captionBgColor = e.target.value;
          applyCaptionStyles();
        });
      }

      // Caption opacity slider
      var opacitySlider = settings.querySelector(".yvPlayer-caption-opacity-slider");
      var opacityLabel = settings.querySelector(".yvPlayer-caption-opacity-val");
      if (opacitySlider) {
        opacitySlider.addEventListener("input", function (e) {
          e.stopPropagation();
          var v = parseInt(e.target.value, 10);
          if (!isNaN(v)) captionBgOpacity = v;
          if (opacityLabel) opacityLabel.textContent = captionBgOpacity + "%";
          applyCaptionStyles();
        });
      }
    }

    function updateQualityMenu() {
      var settings = parent.querySelector(".yvPlayer-settings-box");
      if (!settings) return;
      var qualContainer = settings.querySelector(".yvPlayer-quality-options");
      if (!qualContainer) return;
      var yt = YVPlayer.players[videoTag]["videoTag"];
      var qualities = yt.getAvailableQualityLevels ? yt.getAvailableQualityLevels() : [];
      var currentQuality = (targetQuality !== "auto" ? targetQuality : (yt.getPlaybackQuality ? yt.getPlaybackQuality() : "auto"));

      var qualityLabels = {
        "highres": "2160p (4K)",
        "hd2160": "2160p (4K)",
        "hd1440": "1440p (2K)",
        "hd1080": "1080p",
        "hd720": "720p",
        "large": "480p",
        "medium": "360p",
        "small": "240p",
        "tiny": "144p",
        "auto": "auto"
      };
      var standardQualities = ["highres", "hd2160", "hd1440", "hd1080", "hd720", "large", "medium", "small", "tiny"];
      var qualList = (qualities && qualities.length > 1) ? qualities : ["auto", ...standardQualities];

      var html = `<div class="yvPlayer-quality-opt${currentQuality === 'auto' ? ' is-active' : ''}" data-val="auto">
    <span>Auto</span><i class="ti ti-check"></i>
  </div>`;

      for (var x of qualList) {
        if (x !== "auto") {
          var isAct = (currentQuality === x);
          var lbl = qualityLabels[x] || x;
          html += `<div class="yvPlayer-quality-opt${isAct ? ' is-active' : ''}" data-val="${x}">
        <span>${lbl}</span><i class="ti ti-check"></i>
      </div>`;
        }
      }
      qualContainer.innerHTML = html;

      qualContainer.querySelectorAll(".yvPlayer-quality-opt").forEach(function (opt) {
        opt.addEventListener("click", function (e) {
          e.stopPropagation();
          var val = opt.getAttribute("data-val");
          targetQuality = val;
          var lbl = qualityLabels[val] || val;
          var currLabel = settings.querySelector(".yvPlayer-curr-qual-label");
          if (currLabel) currLabel.textContent = (val === "auto" ? "auto" : lbl);

          try {
            var playerObj = YVPlayer.players[videoTag]["videoTag"];
            if (typeof playerObj.setPlaybackQuality === "function") playerObj.setPlaybackQuality(val);
            if (typeof playerObj.setPlaybackQualityRange === "function") playerObj.setPlaybackQualityRange(val, val);

            var iframe = parent.querySelector("iframe");
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "setPlaybackQuality", args: [val] }), "*");
              iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "setPlaybackQualityRange", args: [val, val] }), "*");
            }
          } catch (err) {
            console.warn("Quality switch error:", err);
          }
          resetSettings();
        });
      });
    }

    // Initialize settings events immediately so controls and APIs are active from start
    try { initSettingsEvents(); } catch (e) { console.error("INIT_SETTINGS_ERROR:", e.stack || e.message); }

    function toggleSettings() {
      var settings = parent.querySelector(".yvPlayer-settings-box");
      if (!settings) return;
      try { initSettingsEvents(); } catch (e) { console.warn("initSettingsEvents notice:", e); }
      try { updateQualityMenu(); } catch (e) { console.warn("updateQualityMenu notice:", e); }
      try { applyCaptionStyles(); } catch (e) { console.warn("applyCaptionStyles notice:", e); }
      try {
        var isLoopingNow = playerParams.loop === true || (playerParams.loop !== false && (playerParams.background || playerParams.shorts));
        if (typeof updateLoopUI === "function") updateLoopUI(isLoopingNow, false);
      } catch (e) { }

      var isOpen = (settings.style.display === "block");
      if (isOpen) {
        settings.style.display = "none";
        try { resetSettings(); } catch (e) { }
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => {
          if (hasStarted) parent.querySelector(".yvPlayer-controls-box").classList.remove("yvPlayer-controls-open");
        }, 3000);
      } else {
        // Close speed panel if open
        var sp = parent.querySelector(".yvPlayer-speed-panel");
        if (sp) sp.style.display = "none";
        var sw = parent.querySelector(".yvPlayer-speed-wrap");
        if (sw) sw.classList.remove("is-open");

        // Keep controls open while settings is active
        parent.querySelector(".yvPlayer-controls-box").classList.add("yvPlayer-controls-open");
        clearTimeout(controlsTimeout);

        settings.style.display = "block";
        try { resetSettings(); } catch (e) { }
      }
    }
    function onPlayerStateChange(event) {
      checkLiveBroadcast();
      if (event.data == YT.PlayerState.PLAYING) {
        hasStarted = true;
        if (playerParams.background) {
          try { YVPlayer.players[videoTag]["videoTag"].mute(); } catch (e) { }
        }
        if (YVPlayer.players[videoTag] && typeof YVPlayer.players[videoTag].disableNativeCaptions === "function") {
          YVPlayer.players[videoTag].disableNativeCaptions();
        }
        parent.classList.add("is-active");
        parent.classList.add("is-playing");
        parent.classList.remove("is-paused");
        parent.classList.remove("is-ended");
        var startSpan = parent.querySelector(".yvPlayer-container span");
        if (startSpan) {
          startSpan.style.setProperty("display", "none", "important");
          startSpan.style.setProperty("pointer-events", "none", "important");
        }
        YVPlayer.players[videoTag]["isPlaying"] = true;
        YVPlayer.players[videoTag]["playerState"] = "playing";
        var centerBtn = parent.querySelector(".yvPlayer-controls-box main .yvPlayer-play-pause-btn");
        if (centerBtn) {
          centerBtn.className = "ti yvPlayer-play-pause-btn ti-player-pause-filled";
          centerBtn.title = "Play/Pause";
        }
        var bottomBtn = parent.querySelector(".yvPlayer-bottom-play i");
        if (bottomBtn) bottomBtn.className = "ti ti-player-pause-filled";
        if (!playerParams.background) {
          try { YVPlayer.players[videoTag]["videoTag"].unMute(); } catch (e) { }
        } else {
          try {
            YVPlayer.players[videoTag]["videoTag"].mute();
            YVPlayer.players[videoTag]["videoTag"].setVolume(0);
          } catch (e) { }
        }
        parent.querySelector(".yvPlayer-container").style.pointerEvents = "none";
        parent.querySelector(".yvPlayer-controls-box").style.display = "flex";
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => { parent.querySelector(".yvPlayer-controls-box").classList.remove("yvPlayer-controls-open"); }, 3000);

        parent.querySelector(".yvPlayer-controls-box").onclick = function (e) {
          var sp = parent.querySelector(".yvPlayer-controls-box .yvPlayer-speed-panel");
          var sb = parent.querySelector(".yvPlayer-settings-box");
          var wasSpOpen = (sp && sp.style.display === "flex");
          var wasSbOpen = (sb && sb.style.display === "block");

          if (wasSpOpen && !sp.contains(e.target) && !parent.querySelector(".yvPlayer-speed-btn").contains(e.target)) {
            sp.style.display = "none";
            var sw = parent.querySelector(".yvPlayer-speed-wrap");
            if (sw) sw.classList.remove("is-open");
          }
          if (wasSbOpen && !sb.contains(e.target) && !parent.querySelector(".settingsBtn").contains(e.target)) {
            sb.style.display = "none";
            if (typeof resetSettings === "function") resetSettings();
          }

          if (wasSpOpen || wasSbOpen) {
            return;
          }

          if (!parent.querySelector(".yvPlayer-controls-box main").contains(e.target) &&
            !parent.querySelector(".yvPlayer-controls-box .yvPlayer-controls").contains(e.target)) {
            if (Date.now() < ignorePlayPauseUntil) return;
            togglePlayPause();
          }
        };
        parent.querySelector(".yvPlayer-controls-box .yvPlayer-controls").addEventListener("click", () => {
          clearTimeout(controlsTimeout);
          controlsTimeout = setTimeout(() => { parent.querySelector(".yvPlayer-controls-box").classList.remove("yvPlayer-controls-open"); }, 3000);
        });

      } else if (event.data == YT.PlayerState.PAUSED) {
        if (!hasStarted) {
          return;
        }
        parent.classList.add("is-active");
        parent.classList.remove("is-playing");
        parent.classList.add("is-paused");
        var startSpan = parent.querySelector(".yvPlayer-container span");
        if (startSpan && !parent.classList.contains("is-ended")) {
          startSpan.style.setProperty("display", "none", "important");
          startSpan.style.setProperty("pointer-events", "none", "important");
        }
        clearTimeout(controlsTimeout);
        YVPlayer.players[videoTag]["isPlaying"] = false;
        YVPlayer.players[videoTag]["playerState"] = "paused";
        parent.querySelector(".yvPlayer-controls-box").style.display = "flex";
        var centerBtn = parent.querySelector(".yvPlayer-controls-box main .yvPlayer-play-pause-btn");
        if (centerBtn && !parent.classList.contains("is-ended")) {
          centerBtn.className = "ti yvPlayer-play-pause-btn ti-player-play-filled";
          centerBtn.title = "Play/Pause";
        }
        var bottomBtn = parent.querySelector(".yvPlayer-bottom-play i");
        if (bottomBtn && !parent.classList.contains("is-ended")) {
          bottomBtn.className = "ti ti-player-play-filled";
        }
        if (!parent.querySelector(".yvPlayer-controls-box").classList.contains("yvPlayer-controls-open")) {
          parent.querySelector(".yvPlayer-controls-box").classList.add("yvPlayer-controls-open");
        }
      } else if (event.data == YT.PlayerState.BUFFERING) {
        YVPlayer.players[videoTag]["playerState"] = "buffering";
        if (targetQuality && targetQuality !== "auto") {
          try {
            var ytObj = YVPlayer.players[videoTag]["videoTag"];
            if (typeof ytObj.setPlaybackQuality === "function") ytObj.setPlaybackQuality(targetQuality);
            if (typeof ytObj.setPlaybackQualityRange === "function") ytObj.setPlaybackQualityRange(targetQuality, targetQuality);
          } catch (e) { }
        }
      } else if (event.data == YT.PlayerState.CUED) {
        YVPlayer.players[videoTag]["playerState"] = "cued";
      } else if (event.data == YT.PlayerState.ENDED) {
        var isEventLoop = !!(YVPlayer.players[videoTag]["params"]["loop"] === true || (YVPlayer.players[videoTag]["params"]["loop"] !== false && (YVPlayer.players[videoTag]["params"]["background"] || YVPlayer.players[videoTag]["params"]["shorts"])));
        if (isEventLoop) {
          YVPlayer.players[videoTag]["videoTag"].seekTo(0, true);
          YVPlayer.players[videoTag]["videoTag"].playVideo();
        } else {
          handleVideoEnded();
        }
      }
      try {
        var ytCaptions = YVPlayer.players[videoTag] ? YVPlayer.players[videoTag]["videoTag"] : null;
        if (ytCaptions) {
          if (typeof ytCaptions.unloadModule === "function") {
            ytCaptions.unloadModule("captions");
            ytCaptions.unloadModule("cc");
          }
          if (typeof ytCaptions.setOption === "function") {
            ytCaptions.setOption("captions", "track", {});
            ytCaptions.setOption("cc", "track", {});
            ytCaptions.setOption("captions", "fontSize", 0);
          }
        }
      } catch (exception) { }
    }
  },
  init: function (videoTag, params) {
    return new Promise(function (resolve, reject) {
      if (!videoTag || !params || !("defaultId" in params)) {
        reject(new Error("Init function requires target element id and params with defaultId."));
        return;
      }
      var cleanDefaultId = extractVideoId(params.defaultId);
      if (cleanDefaultId) {
        params.defaultId = cleanDefaultId;
      } else {
        reject(new Error("Invalid YouTube video ID format: " + params.defaultId));
        return;
      }
      var targetEl = document.getElementById(videoTag);
      if (!targetEl) {
        reject(new Error("No element found with id " + videoTag));
        return;
      }

      if (YVPlayer.players[videoTag] && YVPlayer.players[videoTag].initialized) {
        YVPlayer.changeVideo(videoTag, params.defaultId, params);
        resolve();
        return;
      }

      if (YVPlayer.players[videoTag]) {
        try { YVPlayer.destroy(videoTag); } catch (e) { }
      }

      YVPlayer.players[videoTag] = {
        videoTag: videoTag,
        params: params,
        isPlaying: false,
        playerState: "paused",
        initialized: false
      };

      var playerTagId = "yvPlayer-" + videoTag;
      whenYTReady().then(function () {
        return YVPlayer.preSetup(videoTag, playerTagId, params.defaultId);
      }).then(function () {
        var parent = document.querySelector("#" + playerTagId).closest(".yvPlayer");
        YVPlayer.updateThumbnail(videoTag, params.defaultId, ("thumbnail" in params) ? params.thumbnail : true);
        return YVPlayer.YtSetup(videoTag, playerTagId, params.defaultId);
      }).then(function () {
        YVPlayer.players[videoTag].initialized = true;
        resolve();
      }).catch(reject);
    });
  },

  updateThumbnail: function (videoTag, videoId, customThumb) {
    if (!videoTag || !videoId) return;
    var container = document.getElementById(videoTag);
    var parent = container ? container.querySelector(".yvPlayer") : null;
    var span = parent ? parent.querySelector(".yvPlayer-container span") : null;
    if (!span) return;

    var p = YVPlayer.players[videoTag];
    var thumb = (customThumb !== undefined) ? customThumb : (p && p.params ? p.params.thumbnail : true);
    if (thumb === false || thumb === "false") {
      span.style.backgroundImage = "none";
      return;
    }
    if (typeof thumb === "string" && thumb !== "true") {
      span.style.backgroundImage = 'url("' + thumb + '")';
      span.style.backgroundSize = "cover";
      span.style.backgroundPosition = "center";
      span.style.backgroundRepeat = "no-repeat";
      return;
    }

    var maxRes = "https://img.youtube.com/vi/" + encodeURIComponent(videoId) + "/maxresdefault.jpg";
    var hqRes = "https://img.youtube.com/vi/" + encodeURIComponent(videoId) + "/hqdefault.jpg";
    span.style.backgroundImage = 'url("' + maxRes + '")';
    span.style.backgroundSize = "cover";
    span.style.backgroundPosition = "center";
    span.style.backgroundRepeat = "no-repeat";

    var probe = new Image();
    probe.onload = function () {
      if (probe.naturalWidth <= 120) {
        span.style.backgroundImage = 'url("' + hqRes + '")';
      }
    };
    probe.onerror = function () {
      span.style.backgroundImage = 'url("' + hqRes + '")';
    };
    probe.src = maxRes;
  },

  pause: function (videoTag) {
    if (!videoTag || !YVPlayer.players[videoTag] || !YVPlayer.players[videoTag].initialized) return;
    var p = YVPlayer.players[videoTag];
    if (p.params && p.params.background) return; // Background mode must never pause
    var yt = p.videoTag;
    if (yt && typeof yt.pauseVideo === "function") {
      try { yt.pauseVideo(); } catch (e) { }
    }
  },

  play: function (videoTag) {
    if (!videoTag || !YVPlayer.players[videoTag] || !YVPlayer.players[videoTag].initialized) return;
    var p = YVPlayer.players[videoTag];
    var yt = p.videoTag;
    if (yt) {
      if (p.params && p.params.background) {
        try { if (typeof yt.mute === "function") yt.mute(); } catch (e) { }
        try { if (typeof yt.setVolume === "function") yt.setVolume(0); } catch (e) { }
      } else {
        try { if (typeof yt.unMute === "function") yt.unMute(); } catch (e) { }
      }
      try { if (typeof yt.playVideo === "function") yt.playVideo(); } catch (e) { }
    }
  },

  getDuration: function (videoTag) {
    if (videoTag && YVPlayer.players[videoTag] && YVPlayer.players[videoTag].initialized) {
      try { return YVPlayer.players[videoTag].videoTag.getDuration(); } catch (e) { return 0; }
    }
    return 0;
  },

  getCurrentTime: function (videoTag) {
    if (videoTag && YVPlayer.players[videoTag] && YVPlayer.players[videoTag].initialized) {
      try { return YVPlayer.players[videoTag].videoTag.getCurrentTime(); } catch (e) { return 0; }
    }
    return 0;
  },

  getVideoTitle: function (videoTag) {
    if (videoTag && YVPlayer.players[videoTag] && YVPlayer.players[videoTag].initialized) {
      try { return YVPlayer.players[videoTag].videoTag.getVideoData().title; } catch (e) { return ""; }
    }
    return "";
  },

  getPlayerState: function (videoTag) {
    if (videoTag && YVPlayer.players[videoTag] && YVPlayer.players[videoTag].initialized) {
      return YVPlayer.players[videoTag].playerState;
    }
    return "unstarted";
  },

  changeVideo: function (videoTag, videoId, opts) {
    if (!videoTag || !videoId) return;
    var autoPlay = (opts && typeof opts.autoplay !== "undefined") ? !!opts.autoplay : true;
    if (!YVPlayer.players[videoTag] || !YVPlayer.players[videoTag].initialized) {
      return YVPlayer.init(videoTag, { defaultId: videoId, autoplay: autoPlay, thumbnail: true, isLive: opts && opts.isLive, shorts: opts && opts.shorts, background: opts && opts.background, loop: opts && opts.loop });
    }
    var p = YVPlayer.players[videoTag];
    p.params.defaultId = videoId;
    if (opts) {
      if (typeof opts.isLive !== "undefined") p.params.isLive = !!opts.isLive;
      if (typeof opts.shorts !== "undefined") p.params.shorts = !!opts.shorts;
      if (typeof opts.background !== "undefined") p.params.background = !!opts.background;
      if (typeof opts.thumbnail !== "undefined") p.params.thumbnail = opts.thumbnail;
      if (typeof opts.loop !== "undefined") {
        p.params.loop = (opts.loop === true || opts.loop === "true" || opts.loop === 1 || opts.loop === "1");
        p.params._userLoop = true;
      } else if (typeof opts.shorts !== "undefined" || typeof opts.background !== "undefined") {
        if (!p.params._userLoop) {
          p.params.loop = !!(p.params.shorts || p.params.background);
        }
      }
    }
    if (typeof p.setLoopUI === "function") {
      p.setLoopUI(p.params.loop, false);
    }

    // Always update thumbnail to current video immediately
    YVPlayer.updateThumbnail(videoTag, videoId, p.params.thumbnail);

    var container = document.getElementById(videoTag);
    var parentEl = container ? container.querySelector(".yvPlayer") : null;
    var wrapperEl = container ? container.closest(".player-wrapper") : null;
    if (parentEl) {
      parentEl.classList.remove("is-ended");
      parentEl.classList.toggle("is-live-stream", !!p.params.isLive);
      if (!p.params.isLive) {
        parentEl.classList.remove("is-live-behind");
        parentEl.classList.remove("has-dvr");
      } else {
        parentEl.classList.remove("is-live-behind");
        var badgeText = parentEl.querySelector(".yvPlayer-live-text");
        if (badgeText) badgeText.textContent = "LIVE";
        var badge = parentEl.querySelector(".yvPlayer-live-badge");
        if (badge) badge.title = "Live Broadcast (Synced to real-time live edge)";
        var slider = parentEl.querySelector(".yvPlayer-slider-container input");
        if (slider) {
          slider.value = 100;
          var sc = p.activeThemeColor || "#fe0001";
          slider.style.background = "linear-gradient(to right, " + sc + " 100%, transparent 100%)";
        }
      }
      parentEl.classList.toggle("is-shorts", !!p.params.shorts);
      parentEl.classList.toggle("is-background", !!p.params.background);
      if (wrapperEl) {
        wrapperEl.classList.toggle("is-shorts-stage", !!p.params.shorts);
      }
      if (p.videoTag && typeof p.videoTag.setSize === "function") {
        if (p.params.shorts) {
          p.videoTag.setSize(666, 1600);
        } else {
          p.videoTag.setSize('100%', '100%');
        }
      }
      if (p.params.background && p.videoTag) {
        try { if (typeof p.videoTag.mute === "function") p.videoTag.mute(); } catch (e) { }
        try { if (typeof p.videoTag.setVolume === "function") p.videoTag.setVolume(0); } catch (e) { }
      }
      parentEl.classList.add("is-active");
      var span = parentEl.querySelector(".yvPlayer-container span");
      if (autoPlay) {
        parentEl.classList.add("is-playing");
        parentEl.classList.remove("is-paused");
        if (span) {
          span.style.setProperty("display", "none", "important");
          span.style.setProperty("pointer-events", "none", "important");
        }
      } else {
        parentEl.classList.remove("is-playing");
        parentEl.classList.add("is-paused");
        if (span) {
          span.style.setProperty("display", "flex", "important");
          span.style.setProperty("pointer-events", "auto", "important");
          var spanIcon = span.querySelector("i");
          if (spanIcon) spanIcon.style.display = "";
        }
      }
    }
    if (typeof p.loadStoryboard === "function") p.loadStoryboard(videoId);
    if (typeof p.loadCaptions === "function") p.loadCaptions(videoId);
    try {
      if (p.params.background) {
        if (p.videoTag && typeof p.videoTag.mute === "function") p.videoTag.mute();
        if (p.videoTag && typeof p.videoTag.setVolume === "function") p.videoTag.setVolume(0);
      } else {
        if (p.videoTag && typeof p.videoTag.unMute === "function") p.videoTag.unMute();
      }
      if (p.videoTag) {
        if (autoPlay && typeof p.videoTag.loadVideoById === "function") {
          p.videoTag.loadVideoById(videoId, 0);
        } else if (typeof p.videoTag.cueVideoById === "function") {
          p.videoTag.cueVideoById(videoId, 0);
        }
      }
    } catch (e) {
      try { p.videoTag.cueVideoById(videoId, 0); } catch (err) { }
    }
  },

  destroy: function (videoTag) {
    if (!videoTag || !YVPlayer.players[videoTag]) return;
    var p = YVPlayer.players[videoTag];
    if (p.TimeSliderInterval) clearInterval(p.TimeSliderInterval);
    if (p.TextTimeInterval) clearInterval(p.TextTimeInterval);
    if (p.CaptionsInterval) clearInterval(p.CaptionsInterval);
    if (p.SleepTimerInterval) clearInterval(p.SleepTimerInterval);
    if (p.videoTag && typeof p.videoTag.destroy === "function") {
      try { p.videoTag.destroy(); } catch (e) { }
    }
    // Clean up PiP state safely
    if (typeof document !== "undefined" && document.pictureInPictureElement) {
      try { document.exitPictureInPicture().catch(function() {}); } catch (e) {}
    }
    delete YVPlayer.players[videoTag];
    var root = document.getElementById(videoTag);
    if (root) {
      var el = root.querySelector(".yvPlayer");
      if (el) el.remove();
      var ph = root.querySelector(".yvPlayer-pip-placeholder");
      if (ph) ph.remove();
    }
    var nativePip = document.getElementById("yv-native-pip-video-" + videoTag);
    if (nativePip) nativePip.remove();
  },

  initialized: function (videoTag) {
    return !!(videoTag && YVPlayer.players[videoTag] && YVPlayer.players[videoTag].initialized);
  },

  togglePiP: function (videoTag) {
    if (videoTag && YVPlayer.players[videoTag] && YVPlayer.players[videoTag].initialized) {
      if (typeof YVPlayer.players[videoTag].togglePiP === "function") {
        YVPlayer.players[videoTag].togglePiP();
      }
    }
  },

  setPipMode: function (videoTag, mode) {
    if (videoTag && YVPlayer.players[videoTag] && YVPlayer.players[videoTag].initialized) {
      if (typeof YVPlayer.players[videoTag].setPipMode === "function") {
        YVPlayer.players[videoTag].setPipMode(mode);
      }
    }
  },

  enterPiP: function (videoTag) {
    if (videoTag && YVPlayer.players[videoTag] && YVPlayer.players[videoTag].initialized) {
      if (typeof YVPlayer.players[videoTag].enterPiP === "function") {
        YVPlayer.players[videoTag].enterPiP();
      }
    }
  },

  exitPiP: function (videoTag) {
    if (videoTag && YVPlayer.players[videoTag] && YVPlayer.players[videoTag].initialized) {
      if (typeof YVPlayer.players[videoTag].exitPiP === "function") {
        YVPlayer.players[videoTag].exitPiP();
      }
    }
  },

  seekTo: function (videoTag, seconds) {
    if (videoTag && YVPlayer.players[videoTag] && YVPlayer.players[videoTag].initialized) {
      var yt = YVPlayer.players[videoTag].videoTag;
      if (yt && typeof yt.seekTo === "function") {
        yt.seekTo(seconds, true);
      }
    }
  },

  setVolume: function (videoTag, vol) {
    if (videoTag && YVPlayer.players[videoTag] && YVPlayer.players[videoTag].initialized) {
      var yt = YVPlayer.players[videoTag].videoTag;
      var clamped = Math.max(0, Math.min(100, Math.round(vol)));
      if (yt && typeof yt.setVolume === "function") {
        yt.setVolume(clamped);
      }
      var root = document.getElementById(videoTag);
      var slider = root ? root.querySelector(".yvPlayer-vol-slider") : null;
      if (slider) slider.value = clamped;
    }
  },

  getVolume: function (videoTag) {
    if (videoTag && YVPlayer.players[videoTag] && YVPlayer.players[videoTag].initialized) {
      var yt = YVPlayer.players[videoTag].videoTag;
      if (yt && typeof yt.getVolume === "function") return yt.getVolume();
    }
    return 100;
  },

  mute: function (videoTag) {
    if (videoTag && YVPlayer.players[videoTag] && YVPlayer.players[videoTag].initialized) {
      var yt = YVPlayer.players[videoTag].videoTag;
      if (yt && typeof yt.mute === "function") yt.mute();
    }
  },

  unMute: function (videoTag) {
    if (videoTag && YVPlayer.players[videoTag] && YVPlayer.players[videoTag].initialized) {
      if (YVPlayer.players[videoTag].params && YVPlayer.players[videoTag].params.background) return;
      var yt = YVPlayer.players[videoTag].videoTag;
      if (yt && typeof yt.unMute === "function") yt.unMute();
    }
  },

  isMuted: function (videoTag) {
    if (videoTag && YVPlayer.players[videoTag] && YVPlayer.players[videoTag].initialized) {
      var yt = YVPlayer.players[videoTag].videoTag;
      if (yt && typeof yt.isMuted === "function") return yt.isMuted();
    }
    return false;
  },

  setBackgroundMode: function (videoTag, enabled) {
    if (!videoTag || !YVPlayer.players[videoTag]) return;
    var p = YVPlayer.players[videoTag];
    p.params.background = !!enabled;
    var container = document.getElementById(videoTag);
    var parentEl = container ? container.querySelector(".yvPlayer") : null;
    if (parentEl) {
      parentEl.classList.toggle("is-background", !!enabled);
    }
    var yt = p.videoTag;
    if (yt && typeof yt.mute === "function" && enabled) {
      try {
        yt.mute();
        yt.playVideo();
      } catch (e) { }
    }
  },

  setShortsMode: function (videoTag, enabled) {
    if (!videoTag || !YVPlayer.players[videoTag]) return;
    var p = YVPlayer.players[videoTag];
    p.params.shorts = !!enabled;
    var container = document.getElementById(videoTag);
    var parentEl = container ? container.querySelector(".yvPlayer") : null;
    var wrapperEl = container ? container.closest(".player-wrapper") : null;
    if (parentEl) {
      parentEl.classList.toggle("is-shorts", !!enabled);
    }
    if (wrapperEl) {
      wrapperEl.classList.toggle("is-shorts-stage", !!enabled);
    }
    if (p.videoTag && typeof p.videoTag.setSize === "function") {
      if (enabled) {
        p.videoTag.setSize(666, 1600);
      } else {
        p.videoTag.setSize('100%', '100%');
      }
    }
    if (typeof p.setLoopUI === "function" && !p.params._userLoop) {
      p.setLoopUI(!!enabled, false);
    }
  },

  /**
   * Resolves a direct playable stream URL for a given video ID using
   * the specified proxy provider ("piped", "invidious", "cobalt", or "local").
   * Provides automatic failover across community instances.
   */
  resolveStreamUrl: function (videoId, options) {
    options = options || {};
    var provider = (options.proxyProvider || "local").toLowerCase();
    return new Promise(function (resolve) {
      if (!videoId) {
        resolve("");
        return;
      }
      var cleanId = extractVideoId(videoId);

      function quickFetch(url, init) {
        init = init || {};
        if (typeof AbortController !== "undefined") {
          var controller = new AbortController();
          init.signal = controller.signal;
          var tid = setTimeout(function () {
            try { controller.abort(); } catch (e) { }
          }, options.timeoutMs || 3000);
          return fetch(url, init).finally(function () {
            clearTimeout(tid);
          });
        }
        return fetch(url, init);
      }

      // 1. Piped API Provider (pipedapi.kavin.rocks)
      if (provider === "piped") {
        var pipedList = [
          options.pipedInstance || "https://pipedapi.kavin.rocks",
          "https://api.piped.privacy.com.de",
          "https://pipedapi.tokhmi.xyz"
        ];
        function tryPiped(idx) {
          if (idx >= pipedList.length) {
            resolve("/api/stream?id=" + encodeURIComponent(cleanId) + "&fmt=720&quality=720");
            return;
          }
          var inst = pipedList[idx].replace(/\/+$/, "");
          quickFetch(inst + "/streams/" + encodeURIComponent(cleanId), { cache: "force-cache" })
            .then(function (res) { return res.json(); })
            .then(function (data) {
              if (data && data.videoStreams && data.videoStreams.length > 0) {
                var stream = data.videoStreams.find(function (s) {
                  return s.mimeType && s.mimeType.includes("mp4") && (s.quality === "720p" || s.quality === "1080p");
                }) || data.videoStreams.find(function (s) {
                  return s.mimeType && s.mimeType.includes("mp4");
                }) || data.videoStreams[0];

                if (stream && stream.url) {
                  resolve(stream.url);
                  return;
                }
              }
              tryPiped(idx + 1);
            })
            .catch(function () { tryPiped(idx + 1); });
        }
        tryPiped(0);
        return;
      }

      // 2. Invidious API Provider (instances.invidious.io)
      if (provider === "invidious") {
        var invidiousList = [
          options.invidiousInstance || "https://inv.tux.pizza",
          "https://vid.puffyan.us",
          "https://invidious.nerdvpn.de"
        ];
        function tryInvidious(idx) {
          if (idx >= invidiousList.length) {
            resolve("/api/stream?id=" + encodeURIComponent(cleanId) + "&fmt=720&quality=720");
            return;
          }
          var inst = invidiousList[idx].replace(/\/+$/, "");
          quickFetch(inst + "/api/v1/videos/" + encodeURIComponent(cleanId), { cache: "force-cache" })
            .then(function (res) { return res.json(); })
            .then(function (data) {
              if (data && data.formatStreams && data.formatStreams.length > 0) {
                var stream = data.formatStreams.find(function (s) {
                  return s.resolution === "720p" || s.qualityLabel === "720p";
                }) || data.formatStreams[0];

                if (stream && stream.url) {
                  resolve(stream.url);
                  return;
                }
              }
              tryInvidious(idx + 1);
            })
            .catch(function () { tryInvidious(idx + 1); });
        }
        tryInvidious(0);
        return;
      }

      // 3. Cobalt API Provider (api.cobalt.tools)
      if (provider === "cobalt") {
        var cobaltEndpoint = (options.cobaltInstance || "https://api.cobalt.tools").replace(/\/+$/, "");
        quickFetch(cobaltEndpoint + "/", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            url: "https://www.youtube.com/watch?v=" + cleanId,
            videoQuality: "720"
          })
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            if (data && data.url) {
              resolve(data.url);
            } else {
              resolve("/api/stream?id=" + encodeURIComponent(cleanId) + "&fmt=720&quality=720");
            }
          })
          .catch(function () {
            resolve("/api/stream?id=" + encodeURIComponent(cleanId) + "&fmt=720&quality=720");
          });
        return;
      }

      // 4. Local Python Stream Proxy Default
      resolve("/api/stream?id=" + encodeURIComponent(cleanId) + "&fmt=720&quality=720");
    });
  },


  setLoop: function (videoTag, enabled) {
    if (!videoTag || !YVPlayer.players[videoTag]) return;
    var p = YVPlayer.players[videoTag];
    var active = !!enabled;
    p.params.loop = active;
    p.params._userLoop = true;
    if (typeof p.setLoopUI === "function") {
      p.setLoopUI(active, false);
    }
  },

  isLooping: function (videoTag) {
    if (!videoTag || !YVPlayer.players[videoTag] || !YVPlayer.players[videoTag].params) return false;
    var p = YVPlayer.players[videoTag];
    return p.params.loop === true || (p.params.loop !== false && (p.params.background || p.params.shorts));
  },

  setPlaybackRate: function (videoTag, rate) {
    if (videoTag && YVPlayer.players[videoTag] && YVPlayer.players[videoTag].initialized) {
      var yt = YVPlayer.players[videoTag].videoTag;
      if (yt && typeof yt.setPlaybackRate === "function") yt.setPlaybackRate(rate);
    }
  },

  getPlaybackRate: function (videoTag) {
    if (videoTag && YVPlayer.players[videoTag] && YVPlayer.players[videoTag].initialized) {
      var yt = YVPlayer.players[videoTag].videoTag;
      if (yt && typeof yt.getPlaybackRate === "function") return yt.getPlaybackRate();
    }
    return 1;
  },

  setTheme: function (videoTag, colorHex, themeName) {
    if (!videoTag) return;

    var THEME_MAP = {
      "red": { color: "#fe0001", name: "Classic Red" },
      "default": { color: "#fe0001", name: "Classic Red" },
      "cyan": { color: "#00e5ff", name: "City Cyan" },
      "purple": { color: "#a855f7", name: "Fantasy Purple" },
      "emerald": { color: "#10b981", name: "Forest Emerald" },
      "teal": { color: "#14b8a6", name: "Sea Teal" },
      "gold": { color: "#f59e0b", name: "Amber Gold" },
      "white": { color: "#ffffff", name: "Minimal White" },
      "monochrome": { color: "#ffffff", name: "Minimal White" }
    };

    var hex = colorHex;
    var name = themeName;
    if (colorHex && THEME_MAP[colorHex.toLowerCase()]) {
      hex = THEME_MAP[colorHex.toLowerCase()].color;
      name = name || THEME_MAP[colorHex.toLowerCase()].name;
    } else if (themeName && THEME_MAP[themeName.toLowerCase()]) {
      hex = THEME_MAP[themeName.toLowerCase()].color;
      name = THEME_MAP[themeName.toLowerCase()].name;
    }

    if (YVPlayer.players[videoTag]) {
      YVPlayer.players[videoTag].activeThemeColor = hex;
      if (typeof YVPlayer.players[videoTag].applyThemeColor === "function") {
        YVPlayer.players[videoTag].applyThemeColor(hex, name || "Custom");
      }
    }

    var root = document.getElementById(videoTag);
    var p = root ? (root.classList.contains("yvPlayer") ? root : root.querySelector(".yvPlayer")) : null;
    if (p) {
      p.style.setProperty("--yv-theme", hex);
      p.style.setProperty("--sliderSeekTrackColor", hex);
      p.style.setProperty("--sliderThumbColor", hex);
      p.style.setProperty("--startBtnBg", hex);
      p.style.setProperty("--themeAccent", hex);
      p.style.setProperty("--themeHoverBg", hex + "2e");
      p.style.setProperty("--themeGlow", hex + "88");

      var slider = p.querySelector(".yvPlayer-slider-container input");
      if (slider) {
        var prog = parseFloat(slider.value) || 0;
        slider.style.background = `linear-gradient(to right, ${hex} ${prog}%, transparent ${prog}%)`;
      }
    }
  }
};

var yvPlayer = YVPlayer;
if (typeof window !== "undefined") {
  window.YVPlayer = YVPlayer;
  window.yvPlayer = YVPlayer;
}
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = YVPlayer;
}

// Auto-initialize elements with data-yv-video (1-Click Drop-In Support)
if (typeof window !== "undefined" && typeof document !== "undefined") {
  function autoInitYVElements() {
    if (typeof window !== "undefined" && window.self !== window.top) {
      try {
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.body.style.margin = "0";
        document.body.style.padding = "0";
      } catch (e) { }
    }
    var elements = document.querySelectorAll("[data-yv-video]");
    elements.forEach(function (el) {
      if (el._yvAutoInitDone) return;
      el._yvAutoInitDone = true;
      var vid = el.getAttribute("data-yv-video");
      if (!vid) return;
      if (!el.id) el.id = "yv-player-" + Math.random().toString(36).substring(2, 9);
      var rawVid = el.getAttribute("data-yv-video");
      var cleanVid = extractVideoId(rawVid);
      if (!/^[a-zA-Z0-9_-]{11}$/.test(cleanVid)) return;

      var theme = el.getAttribute("data-yv-theme") || "default";
      var customColor = el.getAttribute("data-yv-color") || null;
      var autoplay = (el.getAttribute("data-yv-autoplay") === "true") || (el.getAttribute("data-autoplay") === "true");
      var isShorts = (el.getAttribute("data-yv-shorts") === "true") || (el.getAttribute("data-shorts") === "true");
      var isBg = (el.getAttribute("data-yv-background") === "true") || (el.getAttribute("data-background") === "true");
      var isLive = (el.getAttribute("data-yv-live") === "true") || (el.getAttribute("data-live") === "true");

      var pipAttr = el.getAttribute("data-yv-pip") || el.getAttribute("data-pip");
      var disablePip = (pipAttr === "none" || pipAttr === "false" || pipAttr === "off" || pipAttr === "0");

      function startPlayer() {
        whenYTReady().then(function () {
          YVPlayer.init(el.id, {
            defaultId: cleanVid || vid,
            theme: theme,
            autoplay: isBg ? true : autoplay,
            shorts: isShorts,
            background: isBg,
            isLive: isLive,
            pip: !disablePip
          }).then(function () {
            if (customColor) YVPlayer.setTheme(el.id, customColor, "Custom");
          }).catch(function (err) {
            console.error("YVPlayer auto-init error:", err);
          });
        });
      }

      startPlayer();
    });
  }

  YVPlayer.autoInit = autoInitYVElements;

  // Run on initial load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInitYVElements);
  } else {
    autoInitYVElements();
  }

  // Dynamic CMS injection / Astro / client-side hydration support
  if (typeof MutationObserver !== "undefined") {
    var observer = new MutationObserver(function () {
      autoInitYVElements();
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener("DOMContentLoaded", function () {
        if (document.body) observer.observe(document.body, { childList: true, subtree: true });
      });
    }
  }
}
