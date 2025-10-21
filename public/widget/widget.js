(function () {
  "use strict";

  // Get the script tag
  const currentScript =
    document.currentScript || document.querySelector("script[data-widget]");
  const widgetId = currentScript
    ? currentScript.getAttribute("data-widget")
    : null;

  // Debug log
  console.log("[ProofPulse] Script tag:", currentScript);
  console.log("[ProofPulse] Widget ID:", widgetId);

  if (!widgetId) {
    console.error("[ProofPulse] Error: data-widget attribute is required");
    console.error(
      "[ProofPulse] Make sure your script tag looks like: <script src='...' data-widget='YOUR-ID'></script>"
    );
    return;
  }

  // Configuration
  // Check if script is loaded from localhost OR page is on localhost
  const scriptSrc = currentScript ? currentScript.src : "";
  const isLocalScript = scriptSrc.includes("localhost") || scriptSrc.includes("127.0.0.1");
  const isLocalPage = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  
  console.log("[ProofPulse] Script src:", scriptSrc);
  console.log("[ProofPulse] Is local script:", isLocalScript);
  console.log("[ProofPulse] Is local page:", isLocalPage);
  
  const CONFIG = {
    API_BASE_URL:
      (isLocalScript || isLocalPage)
        ? "http://localhost:3000"
        : "https://proofpulse.vercel.app",
    NOTIFICATION_DURATION: 6000,
    NOTIFICATION_GAP: 2000,
    START_DELAY: 2000,
    LOOP: true,
    SHUFFLE: false,
    ANIM: "standard", // subtle | standard | vivid
    RADIUS: 14,
    SHADOW: "medium", // minimal | medium | bold
    DISMISS_TTL: null, // ms; null means disabled
    MAX_PER_PAGE: null,
    MAX_PER_SESSION: null,
    COOLDOWN_MS: 0,
    LOCALE: null,
    INCLUDE_PATHS: null,
    EXCLUDE_PATHS: null,
    DEVICE: null,
    UTM_MATCH: null,
    THEME: null,
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
    DEBUG: true,
  };

  // Allow non-breaking overrides via script data-* attributes
  const ds = currentScript ? currentScript.dataset : {};
  if (ds.duration) {
    const d = parseInt(String(ds.duration), 10);
    if (!isNaN(d) && d > 0) CONFIG.NOTIFICATION_DURATION = d * (String(ds.duration).endsWith("ms") ? 1 : 1000);
  }
  if (ds.gap) {
    const g = parseInt(String(ds.gap), 10);
    if (!isNaN(g) && g >= 0) CONFIG.NOTIFICATION_GAP = g * (String(ds.gap).endsWith("ms") ? 1 : 1000);
  }
  if (ds.startDelay) {
    const sd = String(ds.startDelay);
    const n = parseInt(sd, 10);
    if (!isNaN(n) && n >= 0) {
      if (sd.endsWith("ms")) CONFIG.START_DELAY = n;
      else CONFIG.START_DELAY = n; // interpret as ms for precision
    }
  }

  function applyThemePreset() {
    const t = CONFIG.THEME;
    if (!t) return;
    if (t === "minimal") {
      CONFIG.ANIM = CONFIG.ANIM || "subtle";
      CONFIG.SHADOW = CONFIG.SHADOW || "minimal";
      CONFIG.RADIUS = CONFIG.RADIUS ?? 10;
    } else if (t === "vibrant") {
      CONFIG.ANIM = CONFIG.ANIM || "vivid";
      CONFIG.SHADOW = CONFIG.SHADOW || "bold";
      CONFIG.RADIUS = CONFIG.RADIUS ?? 16;
    } else if (t === "luxury") {
      CONFIG.ANIM = CONFIG.ANIM || "standard";
      CONFIG.SHADOW = CONFIG.SHADOW || "bold";
      CONFIG.RADIUS = CONFIG.RADIUS ?? 18;
    } else if (t === "trust") {
      CONFIG.ANIM = CONFIG.ANIM || "standard";
      CONFIG.SHADOW = CONFIG.SHADOW || "medium";
      CONFIG.RADIUS = CONFIG.RADIUS ?? 14;
    }
  }

  function wildcardToRegExp(pattern) {
    const esc = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp("^" + esc.replace(/\\\*/g, ".*") + "$");
  }

  function matchesPath() {
    const path = window.location.pathname;
    if (CONFIG.INCLUDE_PATHS && CONFIG.INCLUDE_PATHS.length) {
      const ok = CONFIG.INCLUDE_PATHS.some((p) => wildcardToRegExp(p).test(path));
      if (!ok) return false;
    }
    if (CONFIG.EXCLUDE_PATHS && CONFIG.EXCLUDE_PATHS.length) {
      const bad = CONFIG.EXCLUDE_PATHS.some((p) => wildcardToRegExp(p).test(path));
      if (bad) return false;
    }
    return true;
  }

  function matchesDevice() {
    if (!CONFIG.DEVICE) return true;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent) || (window.innerWidth || 0) < 768;
    return CONFIG.DEVICE === "mobile" ? isMobile : !isMobile;
  }

  function matchesUtm() {
    if (!CONFIG.UTM_MATCH) return true;
    const sp = new URLSearchParams(window.location.search);
    for (const k in CONFIG.UTM_MATCH) {
      if (sp.get(k) !== CONFIG.UTM_MATCH[k]) return false;
    }
    return true;
  }

  function sessionKey(name) {
    return `pp_${name}_${widgetId}`;
  }
  function getSessionCount() {
    try {
      const v = sessionStorage.getItem(sessionKey("count"));
      return v ? parseInt(v, 10) || 0 : 0;
    } catch (e) {
      return 0;
    }
  }
  function setSessionCount(n) {
    try { sessionStorage.setItem(sessionKey("count"), String(n)); } catch (e) {}
  }
  function getLastShownTs() {
    try { const v = sessionStorage.getItem(sessionKey("last")); return v ? parseInt(v, 10) || 0 : 0; } catch (e) { return 0; }
  }
  function setLastShownTs(ts) {
    try { sessionStorage.setItem(sessionKey("last"), String(ts)); } catch (e) {}
  }
  function frequencyAvailable() {
    if (CONFIG.MAX_PER_PAGE != null && pageShownCount >= CONFIG.MAX_PER_PAGE) return false;
    const sess = getSessionCount();
    if (CONFIG.MAX_PER_SESSION != null && sess >= CONFIG.MAX_PER_SESSION) return false;
    if (CONFIG.COOLDOWN_MS > 0) {
      const last = getLastShownTs();
      if (Date.now() - last < CONFIG.COOLDOWN_MS) return false;
    }
    return true;
  }
  if (ds.loop) {
    CONFIG.LOOP = String(ds.loop).toLowerCase() !== "false";
  }
  if (ds.shuffle) {
    CONFIG.SHUFFLE = String(ds.shuffle).toLowerCase() === "true";
  }
  if (ds.anim) {
    const val = String(ds.anim).toLowerCase();
    if (["subtle", "standard", "vivid"].includes(val)) CONFIG.ANIM = val;
  }
  if (ds.radius) {
    const r = parseInt(String(ds.radius), 10);
    if (!isNaN(r) && r >= 0) CONFIG.RADIUS = r;
  }
  if (ds.shadow) {
    const s = String(ds.shadow).toLowerCase();
    if (["minimal", "medium", "bold"].includes(s)) CONFIG.SHADOW = s;
  }
  if (ds.dismissTtl) {
    const raw = String(ds.dismissTtl).toLowerCase();
    let ttl = parseInt(raw, 10);
    if (!isNaN(ttl)) {
      if (raw.endsWith("ms")) CONFIG.DISMISS_TTL = ttl;
      else if (raw.endsWith("m")) CONFIG.DISMISS_TTL = ttl * 60 * 1000;
      else if (raw.endsWith("s") || !/[a-z]$/.test(raw)) CONFIG.DISMISS_TTL = ttl * 1000;
    }
  }
  if (ds.maxPerPage) {
    const n = parseInt(String(ds.maxPerPage), 10);
    if (!isNaN(n) && n >= 0) CONFIG.MAX_PER_PAGE = n;
  }
  if (ds.maxPerSession) {
    const n = parseInt(String(ds.maxPerSession), 10);
    if (!isNaN(n) && n >= 0) CONFIG.MAX_PER_SESSION = n;
  }
  if (ds.cooldown) {
    const raw = String(ds.cooldown).toLowerCase();
    let v = parseInt(raw, 10);
    if (!isNaN(v)) {
      if (raw.endsWith("ms")) CONFIG.COOLDOWN_MS = v;
      else if (raw.endsWith("s") || !/[a-z]$/.test(raw)) CONFIG.COOLDOWN_MS = v * 1000;
    }
  }
  if (ds.includePath) {
    CONFIG.INCLUDE_PATHS = String(ds.includePath)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (ds.excludePath) {
    CONFIG.EXCLUDE_PATHS = String(ds.excludePath)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (ds.device) {
    const d = String(ds.device).toLowerCase();
    if (["mobile", "desktop"].includes(d)) CONFIG.DEVICE = d;
  }
  if (ds.utm) {
    const entries = String(ds.utm)
      .split(",")
      .map((p) => p.split(":").map((s) => s.trim()))
      .filter((kv) => kv.length === 2 && kv[0] && kv[1]);
    if (entries.length) CONFIG.UTM_MATCH = Object.fromEntries(entries);
  }
  if (ds.theme) {
    CONFIG.THEME = String(ds.theme).toLowerCase();
  }
  if (ds.locale) {
    CONFIG.LOCALE = String(ds.locale);
  }
  if (ds.debug) {
    CONFIG.DEBUG = String(ds.debug).toLowerCase() === "true";
  }

  console.log("[ProofPulse] Initialized with API:", CONFIG.API_BASE_URL);
  console.log("[ProofPulse] Widget ID to fetch:", widgetId);

  // State
  let widgetData = null;
  let currentNotificationIndex = 0;
  let notificationContainer = null;
  let isShowing = false;
  let retryCount = 0;
  // Premium UX state
  let currentHideTimeout = null;
  let nextShowTimeout = null;
  let currentEndTime = 0;
  let remainingDuration = 0;
  let paused = false;
  let completedOneCycle = false;
  let pageShownCount = 0;

  function getShadowValue() {
    if (CONFIG.SHADOW === "minimal") return "0 6px 20px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)";
    if (CONFIG.SHADOW === "bold") return "0 16px 60px rgba(0,0,0,0.20), 0 8px 30px rgba(0,0,0,0.12)";
    return "0 10px 40px rgba(0, 0, 0, 0.15), 0 3px 12px rgba(0, 0, 0, 0.1)";
  }

  function getDismissKey(nid) {
    return `pp_dismiss_${widgetId}_${nid}`;
  }
  function setDismissed(nid) {
    if (!CONFIG.DISMISS_TTL) return;
    try {
      const expiresAt = Date.now() + CONFIG.DISMISS_TTL;
      localStorage.setItem(getDismissKey(nid), String(expiresAt));
    } catch (e) {}
  }
  function isDismissed(nid) {
    try {
      const v = localStorage.getItem(getDismissKey(nid));
      if (!v) return false;
      const ts = parseInt(v, 10);
      if (isNaN(ts)) return false;
      if (Date.now() < ts) return true;
      localStorage.removeItem(getDismissKey(nid));
      return false;
    } catch (e) {
      return false;
    }
  }

  // Utility: Fetch with retry logic
  async function fetchWithRetry(
    url,
    options = {},
    retries = CONFIG.MAX_RETRIES
  ) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (retries > 0) {
        console.warn(
          `[ProofPulse] Fetch failed, retrying... (${retries} attempts left)`
        );
        await new Promise((resolve) => setTimeout(resolve, CONFIG.RETRY_DELAY));
        return fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  // Fetch widget data from API
  async function fetchWidgetData() {
    try {
      const sp = new URLSearchParams();
      // Send optional context (non-breaking; API may ignore)
      try {
        sp.set("ctx_path", window.location.pathname || "");
        const isMobile = /Mobi|Android/i.test(navigator.userAgent) || (window.innerWidth || 0) < 768;
        sp.set("ctx_device", isMobile ? "mobile" : "desktop");
        const qs = new URLSearchParams(window.location.search);
        ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"].forEach((k)=>{
          const v = qs.get(k);
          if (v) sp.set(k, v);
        });

      // Cleanup on unload
      window.addEventListener("beforeunload", () => {
        try {
          if (currentHideTimeout) clearTimeout(currentHideTimeout);
          if (nextShowTimeout) clearTimeout(nextShowTimeout);
        } catch (e) {}
      });
      } catch (e) {}
      const url = `${CONFIG.API_BASE_URL}/api/widget/${widgetId}` + (sp.toString() ? `?${sp.toString()}` : "");
      console.log("[ProofPulse] Fetching from:", url);

      const data = await fetchWithRetry(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cache: "no-cache",
      });

      if (
        !data.widget ||
        !data.notifications ||
        data.notifications.length === 0
      ) {
        console.warn("[ProofPulse] No active notifications found");
        return null;
      }

      return data;
    } catch (error) {
      console.error("[ProofPulse] Failed to fetch widget data:", error);
      return null;
    }
  }

  // Track analytics event
  async function trackEvent(eventType, notificationId = null) {
    try {
      await fetch(`${CONFIG.API_BASE_URL}/api/analytics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          widget_id: widgetId,
          event_type: eventType,
          notification_id: notificationId,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          user_agent: navigator.userAgent,
        }),
      });
    } catch (error) {
      if (CONFIG.DEBUG) console.debug("[ProofPulse] Analytics tracking failed:", error);
    }
  }

  // Get relative time string
  function getRelativeTime(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins} ${mins === 1 ? "minute" : "minutes"} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }

  // Get initials from name
  function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Detect device type
  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet";
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return "mobile";
    }
    return "desktop";
  }

  // Match URL patterns with wildcard support
  function matchUrlPatterns(currentPath, patterns) {
    try {
      // If no patterns configured, show everywhere (default)
      if (!patterns || patterns.length === 0) {
        return true;
      }

      // Normalize current path
      const normalizedPath = currentPath.toLowerCase().trim();
      
      for (const pattern of patterns) {
        try {
          const rule = pattern.trim();
          if (!rule) continue;

          // Check if it's an exclude rule (starts with !)
          const isExclude = rule.startsWith('!');
          const cleanRule = isExclude ? rule.substring(1) : rule;
          
          // Convert wildcard pattern to regex
          // * matches any characters, ** matches across path segments
          let regexPattern = cleanRule
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
            .replace(/\*\*/g, '___DOUBLE___') // Temporarily replace **
            .replace(/\*/g, '[^/]*') // * matches within segment
            .replace(/___DOUBLE___/g, '.*'); // ** matches everything
          
          // Special case: if pattern ends with /*, also match without the trailing part
          // e.g., /products/* should match both /products and /products/item
          if (cleanRule.endsWith('/*')) {
            const basePath = cleanRule.slice(0, -2); // Remove /*
            const basePattern = basePath.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
            regexPattern = `(?:${basePattern}|${regexPattern})`;
          }
          
          const regex = new RegExp('^' + regexPattern + '$', 'i');
          const matches = regex.test(normalizedPath);

          // If exclude rule matches, hide widget
          if (isExclude && matches) {
            if (CONFIG.DEBUG) console.log(`[ProofPulse] URL excluded by rule: ${rule}`);
            return false;
          }
          
          // If include rule matches, show widget
          if (!isExclude && matches) {
            if (CONFIG.DEBUG) console.log(`[ProofPulse] URL matched by rule: ${rule}`);
            return true;
          }
        } catch (patternError) {
          // If individual pattern fails, log and continue
          console.warn(`[ProofPulse] Invalid URL pattern: ${pattern}`, patternError);
          continue;
        }
      }

      // If we have include rules but none matched, hide widget
      const hasIncludeRules = patterns.some(p => !p.trim().startsWith('!'));
      if (hasIncludeRules) {
        if (CONFIG.DEBUG) console.log(`[ProofPulse] URL did not match any include rules`);
        return false;
      }

      // If only exclude rules and none matched, show widget
      return true;
    } catch (error) {
      // On any error, default to showing widget (non-breaking)
      console.error('[ProofPulse] URL matching error:', error);
      return true;
    }
  }

  // Map dashboard time_ago values to human text when timestamp isn't present
  function mapTimeAgo(value) {
    switch (value) {
      case "just_now":
        return "just now";
      case "1_min":
        return "1 minute ago";
      case "2_min":
        return "2 minutes ago";
      case "5_min":
        return "5 minutes ago";
      case "10_min":
        return "10 minutes ago";
      case "30_min":
        return "30 minutes ago";
      case "1_hour":
        return "1 hour ago";
      default:
        return "just now";
    }
  }

  // Locale-aware number formatter
  function formatNumber(n) {
    try {
      const loc = CONFIG.LOCALE || navigator.language || "en-US";
      return new Intl.NumberFormat(loc).format(n);
    } catch (e) {
      return String(n);
    }
  }

  // Create notification element with ENHANCED styling
  function createNotificationElement(notification, settings) {
    const notif = document.createElement("div");
    notif.className = "proofpulse-notification";
    notif.setAttribute("role", "status");
    notif.setAttribute("aria-live", "polite");
    notif.setAttribute("aria-atomic", "true");
    notif.tabIndex = 0;

    // ENHANCED STYLES - Clean white with subtle transparency
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const borderRadiusPx = `${CONFIG.RADIUS}px`;
    const enableGlow = CONFIG.ANIM !== "subtle" && !prefersReducedMotion;
    const enableFloat = CONFIG.ANIM === "vivid" && !prefersReducedMotion;
    const slideIn = !prefersReducedMotion;

    // Get background settings
    const bgColor = settings.bg_color || '#FFFFFF';
    const bgOpacity = settings.bg_opacity !== undefined ? settings.bg_opacity : 100;
    
    if (CONFIG.DEBUG) {
      console.log("[ProofPulse] Background settings:", {
        bg_color: settings.bg_color,
        bg_opacity: settings.bg_opacity,
        bgColor: bgColor,
        bgOpacity: bgOpacity,
        fullSettings: settings
      });
    }
    
    // Convert hex to rgba with opacity
    const hexToRgba = (hex, opacity) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
    };
    
    // Smart contrast: Calculate if background is dark or light
    const isColorDark = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      // Calculate perceived brightness using luminance formula
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness < 128;
    };
    
    // Auto-select text color based on background
    const textColor = isColorDark(bgColor) && bgOpacity > 50 ? '#ffffff' : '#111827';
    const textColorSecondary = isColorDark(bgColor) && bgOpacity > 50 ? '#e5e7eb' : '#6b7280';
    
    const bgColorRgba = hexToRgba(bgColor, bgOpacity);
    const bgColorRgbaLight = hexToRgba(bgColor, Math.max(bgOpacity - 2, 0));

    if (CONFIG.DEBUG) {
      console.log("[ProofPulse] Applying background:", {
        bgColorRgba: bgColorRgba,
        bgColorRgbaLight: bgColorRgbaLight,
        willApply: `linear-gradient(135deg, ${bgColorRgba} 0%, ${bgColorRgbaLight} 100%)`
      });
    }

    notif.style.cssText = `
      position: fixed;
      background: linear-gradient(135deg, ${bgColorRgba} 0%, ${bgColorRgbaLight} 100%) !important;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: ${borderRadiusPx};
      box-shadow: ${getShadowValue()}, inset 0 1px 0 rgba(255, 255, 255, ${bgOpacity / 100 * 0.8});
      padding: 14px 16px;
      max-width: 340px;
      min-width: 280px;
      z-index: 999999;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, ${bgOpacity / 100 * 0.8});
      overflow: hidden;
      ${slideIn ? "animation: proofpulse-slideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" : ""}${enableGlow ? ", proofpulse-glow 2s ease-in-out infinite" : ""};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    `;

    // Position based on settings
    const position = settings.position || "bottom-right";
    if (position === "bottom-right") {
      notif.style.bottom = "24px";
      notif.style.right = "24px";
    } else if (position === "bottom-left") {
      notif.style.bottom = "24px";
      notif.style.left = "24px";
    } else if (position === "top-right") {
      notif.style.top = "24px";
      notif.style.right = "24px";
    }

    // Add enhanced keyframe animations
    if (!document.getElementById("proofpulse-styles")) {
      const style = document.createElement("style");
      style.id = "proofpulse-styles";
      style.textContent = `
        @keyframes proofpulse-slideIn {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.92);
          }
          60% {
            opacity: 1;
            transform: translateY(-5px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes proofpulse-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 12px ${adjustColor(
              settings.primary_color || "#3B82F6",
              0,
              0.3
            )};
          }
          50% {
            transform: scale(1.08);
            box-shadow: 0 6px 20px ${adjustColor(
              settings.primary_color || "#3B82F6",
              0,
              0.5
            )};
          }
        }

        @keyframes proofpulse-glow {
          0%, 100% {
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 
                        0 3px 12px rgba(0, 0, 0, 0.1),
                        inset 0 1px 0 rgba(255, 255, 255, 0.8);
          }
          50% {
            box-shadow: 0 12px 50px rgba(59, 130, 246, 0.25), 
                        0 5px 20px rgba(59, 130, 246, 0.15),
                        inset 0 1px 0 rgba(255, 255, 255, 0.9);
          }
        }

        @keyframes proofpulse-shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes proofpulse-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        
        .proofpulse-notification:hover {
          ${enableFloat ? "transform: translateY(-6px) scale(1.03);" : ""}
          box-shadow: 0 16px 60px rgba(59, 130, 246, 0.3),
                      0 8px 30px rgba(0, 0, 0, 0.15);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.99) 0%, rgba(255, 255, 255, 0.98) 100%);
          ${enableFloat ? "animation: proofpulse-float 1.5s ease-in-out infinite;" : ""}
        }

        .proofpulse-notification::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            ${settings.primary_color || "#3B82F6"},
            transparent
          );
          background-size: 200% 100%;
          ${enableGlow ? "animation: proofpulse-shimmer 2.5s ease-in-out infinite;" : ""}
          border-radius: ${borderRadiusPx} ${borderRadiusPx} 0 0;
          opacity: 0.4;
          overflow: hidden;
        }
        
        .proofpulse-avatar {
          animation: proofpulse-pulse 2.5s ease-in-out infinite;
        }

        /* Dark mode support - Light background */
        @media (prefers-color-scheme: dark) {
          .proofpulse-notification {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.97) 0%, rgba(250, 250, 250, 0.95) 100%) !important;
            border: 1px solid rgba(220, 220, 220, 0.6);
            box-shadow: 0 12px 45px rgba(0, 0, 0, 0.3),
                        0 4px 15px rgba(0, 0, 0, 0.2);
          }
          .proofpulse-notification:hover {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.99) 0%, rgba(252, 252, 252, 0.98) 100%) !important;
            box-shadow: 0 18px 70px rgba(59, 130, 246, 0.35),
                        0 8px 30px rgba(0, 0, 0, 0.25);
          }
        }
        
        /* Mobile responsive */
        @media (max-width: 640px) {
          .proofpulse-notification {
            max-width: calc(100vw - 24px);
            min-width: calc(100vw - 24px);
            left: 12px !important;
            right: 12px !important;
            bottom: 12px !important;
            padding: 12px 14px;
          }
        }

        /* Smooth exit animation */
        .proofpulse-notification.proofpulse-exit {
          animation: proofpulse-slideOut 0.4s cubic-bezier(0.4, 0, 0.6, 1) forwards;
        }

        @keyframes proofpulse-slideOut {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Content with enhanced styling
    const initials = getInitials(notification.name || "");
    
    // Debug time_ago
    if (CONFIG.DEBUG) {
      console.log("[ProofPulse] Notification time_ago:", notification.time_ago);
      console.log("[ProofPulse] Notification timestamp:", notification.timestamp);
    }
    
    const relativeTime = notification.time_ago
      ? mapTimeAgo(notification.time_ago)
      : (notification.timestamp ? getRelativeTime(notification.timestamp) : "just now");
    const primaryColor = settings.primary_color || "#3B82F6";

    // Per-type content rendering
    const type = notification.type || "generic";

    let contentHTML = "";

    if (type === "purchase") {
      const emoji = notification.use_emoji ? "🛒 " : "";
      const product = notification.product_name || "";
      contentHTML = `
        <div style=\"display: flex; align-items: start; gap: 14px;\">
          <div class=\"proofpulse-avatar\" style=\"
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -15)} 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 15px;
            flex-shrink: 0;
            box-shadow: 0 4px 16px ${adjustColor(primaryColor, 0, 0.35)};
            border: 2.5px solid rgba(255, 255, 255, 0.9);
          \">
            ${initials}
          </div>
          <div style=\"flex: 1; min-width: 0; overflow: hidden;\">
            <p class=\"proofpulse-name\" style=\"margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: ${textColor}; line-height: 1.5; letter-spacing: -0.01em; word-wrap: break-word; overflow-wrap: break-word;\">
              ${notification.name || ""}${notification.location ? `<span style=\"font-weight: 400; color: ${textColorSecondary};\"> from ${notification.location}</span>` : ""}
            </p>
            <p class=\"proofpulse-message\" style=\"margin: 0; font-size: 14px; color: ${textColorSecondary}; line-height: 1.5; font-weight: 400; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;\">${emoji}${notification.message || `purchased ${product}`}</p>
          </div>
        </div>`;
    } else if (type === "review") {
      const rating = Number(notification.rating) || 5;
      let starsHTML = "";
      for (let i = 0; i < 5; i++) {
        if (i < rating) {
          starsHTML += '<span style="color:#FCD34D;">★</span>';
        } else {
          starsHTML += '<span style="color:#E5E7EB;">★</span>';
        }
      }
      contentHTML = `
        <div style="display: flex; align-items: start; gap: 14px;">
          <div class="proofpulse-avatar" style="
            width: 44px; height: 44px; border-radius: 50%;
            background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -15)} 100%);
            color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; flex-shrink: 0; box-shadow: 0 4px 16px ${adjustColor(primaryColor, 0, 0.35)}; border: 2.5px solid rgba(255,255,255,0.9);
          ">${initials}</div>
          <div style="flex:1; min-width:0; overflow:hidden;">
            <div style="display:flex; align-items:center; gap:2px; margin-bottom:6px; font-size:18px; line-height:1;">${starsHTML}</div>
            <p class="proofpulse-message" style="margin: 0 0 6px 0; font-size: 14px; color: ${textColor}; line-height: 1.6; font-style: italic; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${notification.use_emoji ? "⭐ " : ""}"${notification.message || ""}"</p>
            <p class="proofpulse-name" style="margin:0; font-size:13px; font-weight:600; color:${textColor}; word-wrap: break-word; overflow-wrap: break-word;">
              ${notification.name || ""}${notification.location ? `<span style="font-weight:400; color:${textColorSecondary};">, ${notification.location}</span>` : ""}
            </p>
          </div>
        </div>`;
    } else if (type === "live_activity") {
      const message = notification.message || "people viewing now";
      contentHTML = `
        <div style="display:flex; align-items:center; gap:14px;">
          <div class="proofpulse-avatar" style="width:44px; height:44px; border-radius:50%; background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -15)} 100%); color:white; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 16px ${adjustColor(primaryColor, 0, 0.35)}; border:2.5px solid rgba(255,255,255,0.9); flex-shrink:0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
          <div style="flex:1; min-width:0; overflow:hidden;">
            <p style="margin:0; font-size:16px; font-weight:700; color:${textColor}; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${message}</p>
          </div>
        </div>`;
    } else if (type === "low_stock") {
      const stock = notification.stock_count || 0;
      const product = notification.product_name || "";
      contentHTML = `
        <div style="display:flex; align-items:center; gap:14px;">
          <div class="proofpulse-avatar" style="width:44px; height:44px; border-radius:12px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color:white; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 16px rgba(245, 158, 11, 0.35); border:2.5px solid rgba(255,255,255,0.9); flex-shrink:0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div style="flex:1; min-width:0; overflow:hidden;">
            <p style="margin:0; font-size:14px; font-weight:700; color:${textColor}; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">Only ${formatNumber(stock)} left in stock!</p>
            ${product ? `<p style="margin:2px 0 0 0; font-size:13px; color:${textColorSecondary}; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${product}</p>` : ""}
          </div>
        </div>`;
    } else if (type === "milestone") {
      const milestoneText = notification.milestone_text || "";
      if (CONFIG.DEBUG) {
        console.log("[ProofPulse] Milestone notification:", notification);
        console.log("[ProofPulse] milestone_text:", notification.milestone_text);
      }
      contentHTML = `
        <div style="display:flex; align-items:start; gap:14px;">
          <div class="proofpulse-avatar" style="width:44px; height:44px; border-radius:50%; background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -15)} 100%); color:white; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 16px ${adjustColor(primaryColor, 0, 0.35)}; border:2.5px solid rgba(255,255,255,0.9); flex-shrink:0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
              <path d="M4 22h16"></path>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
            </svg>
          </div>
          <div style="flex:1; min-width:0; overflow:hidden;">
            <p style="margin:0; font-size:14px; font-weight:700; color:${textColor}; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${notification.name || ""} is our ${milestoneText} customer!</p>
            ${notification.location ? `<p style="margin:2px 0 0 0; font-size:12px; color:${textColorSecondary}; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">from ${notification.location}</p>` : ""}
          </div>
        </div>`;
    } else {
      // Fallback to generic
      contentHTML = `
        <div style="display: flex; align-items: start; gap: 14px;">
          <div class="proofpulse-avatar" style="
            width: 44px; height: 44px; border-radius: 50%;
            background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -15)} 100%);
            color: white; display: flex; align-items: center; justify-content: center;
            font-weight: 700; font-size: 15px; flex-shrink: 0; box-shadow: 0 4px 16px ${adjustColor(primaryColor, 0, 0.35)}; border: 2.5px solid rgba(255, 255, 255, 0.9);
          ">${initials}</div>
          <div style="flex: 1; min-width: 0; overflow: hidden;">
            <p class="proofpulse-name" style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: ${textColor}; line-height: 1.5; letter-spacing: -0.01em; word-wrap: break-word; overflow-wrap: break-word;">
              ${notification.name || ""}${notification.location ? `<span style="font-weight: 400; color: ${textColorSecondary};"> from ${notification.location}</span>` : ""}
            </p>
            <p class="proofpulse-message" style="margin: 0 0 6px 0; font-size: 14px; color: ${textColorSecondary}; line-height: 1.5; font-weight: 400; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${notification.message || ""}</p>
          </div>
        </div>`;
    }

    // Dismiss button (optional)
    const canDismiss = CONFIG.DISMISS_TTL != null;

    // A11y label per notification
    let ariaLabel = "Notification";
    if (type === "purchase") ariaLabel = `${notification.name || "Someone"} just purchased ${notification.product_name || "a product"}`;
    else if (type === "review") ariaLabel = `${notification.name || "Customer"} left a ${Number(notification.rating)||0} star review`;
    else if (type === "live_activity") ariaLabel = `${formatNumber(Number(notification.visitor_count)||0)} people ${notification.message?.replace(/^[0-9]+\s+people\s+/, "") || "active"}`;
    else if (type === "low_stock") ariaLabel = `Only ${formatNumber(Number(notification.stock_count)||0)} left in stock`;
    else if (type === "milestone") ariaLabel = `${notification.name || "Customer"} is our ${notification.milestone_text || "milestone"} customer`;
    notif.setAttribute("aria-label", ariaLabel);

    notif.innerHTML = `
      <div style="position: relative; z-index: 1;">
        ${contentHTML}
        ${canDismiss ? `<button class="proofpulse-dismiss" aria-label="Dismiss" style="position:absolute;top:-8px;right:-8px;width:24px;height:24px;border:none;background:rgba(0,0,0,0.04);border-radius:9999px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:${textColorSecondary};z-index:10;">×</button>` : ""}
        <div style="display: ${relativeTime ? "flex" : "none"}; align-items: center; gap: 6px; margin-top: 8px;">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="opacity: 0.5;"><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.5"/><path d="M6 3v3l2 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          <p class="proofpulse-time" style="margin: 0; font-size: 12px; color: ${textColorSecondary}; font-weight: 500;">${relativeTime || ""}</p>
        </div>
      </div>`;

    // Enhanced click handler with ripple effect
    notif.addEventListener("click", (e) => {
      // Don't trigger if clicking dismiss button
      if (e.target.closest(".proofpulse-dismiss")) return;
      
      // Create subtle ripple effect
      const ripple = document.createElement("div");
      const rect = notif.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(59, 130, 246, 0.15);
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        animation: proofpulse-ripple 0.5s ease-out;
        z-index: 0;
      `;

      if (!document.getElementById("proofpulse-ripple-style")) {
        const rippleStyle = document.createElement("style");
        rippleStyle.id = "proofpulse-ripple-style";
        rippleStyle.textContent = `
          @keyframes proofpulse-ripple {
            0% {
              transform: scale(0);
              opacity: 0.8;
            }
            100% {
              transform: scale(2.5);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(rippleStyle);
      }

      // Overflow is already set in main style, no need to set again
      notif.appendChild(ripple);

      setTimeout(() => ripple.remove(), 500);

      trackEvent("click", notification.id);
    });

    // Dismiss handler
    if (canDismiss) {
      const btn = notif.querySelector(".proofpulse-dismiss");
      if (btn) {
        btn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          setDismissed(notification.id);
          notif.classList.add("proofpulse-exit");
          setTimeout(() => {
            if (notif.parentNode) notif.parentNode.removeChild(notif);
            isShowing = false;
          }, 400);
        });
      }
    }

    pageShownCount += 1;
    setSessionCount(getSessionCount() + 1);
    setLastShownTs(Date.now());

    return notif;
  }

  // Helper function to adjust color brightness
  function adjustColor(color, percent, alpha = null) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));

    if (alpha !== null) {
      return `rgba(${R}, ${G}, ${B}, ${alpha})`;
    }

    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B)
      .toString(16)
      .slice(1)}`;
  }

  // Show notification with enhanced animation + pause/resume support
  function showNotification(notification, settings) {
    if (isShowing) return;
    isShowing = true;

    const notifElement = createNotificationElement(notification, settings);
    notificationContainer.appendChild(notifElement);

    // Track impression
    trackEvent("impression", notification.id);

    const start = Date.now();
    currentEndTime = start + CONFIG.NOTIFICATION_DURATION;
    remainingDuration = CONFIG.NOTIFICATION_DURATION;

    const scheduleHide = (delay) => {
      if (currentHideTimeout) clearTimeout(currentHideTimeout);
      currentHideTimeout = setTimeout(() => {
        notifElement.classList.add("proofpulse-exit");
        setTimeout(() => {
          if (notifElement.parentNode) {
            notifElement.parentNode.removeChild(notifElement);
          }
          isShowing = false;
        }, 400);
      }, Math.max(0, delay));
    };

    scheduleHide(remainingDuration);

    // Pause on hover/focus
    const pause = () => {
      if (paused) return;
      paused = true;
      const now = Date.now();
      remainingDuration = currentEndTime - now;
      if (currentHideTimeout) clearTimeout(currentHideTimeout);
      notifElement.style.animationPlayState = "paused";
    };
    const resume = () => {
      if (!paused) return;
      paused = false;
      currentEndTime = Date.now() + remainingDuration;
      scheduleHide(remainingDuration);
      notifElement.style.animationPlayState = "running";
    };

    notifElement.addEventListener("mouseenter", pause);
    notifElement.addEventListener("focusin", pause);
    notifElement.addEventListener("mouseleave", resume);
    notifElement.addEventListener("focusout", resume);
  }

  // Notification loop
  function startNotificationLoop() {
    console.log('[ProofPulse] startNotificationLoop called');
    
    if (
      !widgetData ||
      !widgetData.notifications ||
      widgetData.notifications.length === 0
    ) {
      console.warn('[ProofPulse] Cannot start loop - no widget data or notifications');
      return;
    }

    // Reset state when starting loop
    isShowing = false;
    console.log(`[ProofPulse] Starting loop with ${widgetData.notifications.length} notifications, START_DELAY: ${CONFIG.START_DELAY}ms, isShowing reset to: ${isShowing}`);

    const showNext = () => {
      console.log('[ProofPulse] showNext called, isShowing:', isShowing);
      
      if (!isShowing) {
        if (!frequencyAvailable()) {
          console.log('[ProofPulse] Frequency not available, waiting...');
          if (!CONFIG.LOOP) return;
          if (nextShowTimeout) clearTimeout(nextShowTimeout);
          nextShowTimeout = setTimeout(showNext, Math.max(CONFIG.COOLDOWN_MS, CONFIG.NOTIFICATION_GAP));
          return;
        }
        
        console.log('[ProofPulse] Frequency available, preparing to show notification');
        // Skip dismissed notifications if applicable
        let attempts = 0;
        while (
          attempts < widgetData.notifications.length &&
          CONFIG.DISMISS_TTL != null &&
          isDismissed(widgetData.notifications[currentNotificationIndex].id)
        ) {
          currentNotificationIndex =
            (currentNotificationIndex + 1) % widgetData.notifications.length;
          attempts++;
          if (!CONFIG.LOOP && currentNotificationIndex === 0) {
            completedOneCycle = true;
            break;
          }
        }

        if (!(CONFIG.DISMISS_TTL != null && attempts >= widgetData.notifications.length)) {
          if (!completedOneCycle) {
            const notification = widgetData.notifications[currentNotificationIndex];
            console.log('[ProofPulse] Showing notification:', currentNotificationIndex, notification?.type);
            showNotification(notification, widgetData.widget);
          } else {
            console.log('[ProofPulse] Completed one cycle, not showing');
          }
        } else {
          console.log('[ProofPulse] All notifications dismissed');
        }

        const prevIndex = currentNotificationIndex;
        currentNotificationIndex =
          (currentNotificationIndex + 1) % widgetData.notifications.length;
        if (!CONFIG.LOOP && currentNotificationIndex === 0) {
          completedOneCycle = true;
        }
      }

      if (!CONFIG.LOOP && completedOneCycle) return; // stop scheduling further

      if (nextShowTimeout) clearTimeout(nextShowTimeout);
      nextShowTimeout = setTimeout(
        showNext,
        CONFIG.NOTIFICATION_DURATION + CONFIG.NOTIFICATION_GAP
      );
    };

    // Start first notification after small delay
    setTimeout(showNext, CONFIG.START_DELAY);
  }

  // Initialize widget
  async function initWidget() {
    try {
      // Create container if not exists
      notificationContainer = document.getElementById("proofpulse-container");
      if (!notificationContainer) {
        notificationContainer = document.createElement("div");
        notificationContainer.id = "proofpulse-container";
        document.body.appendChild(notificationContainer);
      }

      // Fetch widget data
      widgetData = await fetchWidgetData();

      if (!widgetData) {
        console.warn("[ProofPulse] Widget initialization failed - no data");
        return;
      }

      // Check device targeting (non-breaking - only if configured)
      const currentDevice = getDeviceType();
      console.log(`[ProofPulse] Device detected: ${currentDevice}`);
      
      if (widgetData.widget.device_targeting) {
        const targetDevices = widgetData.widget.device_targeting;
        console.log(`[ProofPulse] Device targeting configured:`, targetDevices);
        
        // If device_targeting is set and current device is not in the list, don't show widget
        if (Array.isArray(targetDevices) && targetDevices.length > 0 && !targetDevices.includes(currentDevice)) {
          console.log(`[ProofPulse] ❌ Widget hidden - device targeting (current: ${currentDevice}, targets: ${targetDevices.join(', ')})`);
          return;
        } else {
          console.log(`[ProofPulse] ✅ Widget shown - device matches targeting`);
        }
      } else {
        console.log(`[ProofPulse] ✅ Widget shown - no device targeting configured (show on all devices)`);
      }

      // Check URL targeting (non-breaking - only if configured)
      try {
        if (widgetData.widget.url_targeting) {
          const currentPath = window.location.pathname;
          const urlPatterns = widgetData.widget.url_targeting;
          console.log(`[ProofPulse] URL targeting configured:`, urlPatterns);
          console.log(`[ProofPulse] Current path:`, currentPath);
          
          const urlMatches = matchUrlPatterns(currentPath, urlPatterns);
          if (!urlMatches) {
            console.log(`[ProofPulse] ❌ Widget hidden - URL targeting (path: ${currentPath})`);
            return;
          } else {
            console.log(`[ProofPulse] ✅ Widget shown - URL matches targeting`);
          }
        } else {
          console.log(`[ProofPulse] ✅ Widget shown - no URL targeting configured (show on all pages)`);
        }
      } catch (urlError) {
        // On error, show widget (non-breaking)
        console.error('[ProofPulse] URL targeting error:', urlError);
        console.log(`[ProofPulse] ✅ Widget shown - URL targeting error (defaulting to show)`);
      }

      // Check time-based rules (non-breaking - only if configured)
      try {
        if (widgetData.widget.time_rules && widgetData.widget.time_rules.enabled) {
          const rules = widgetData.widget.time_rules;
          const now = new Date();
          
          if (CONFIG.DEBUG) {
            console.log(`[ProofPulse] Time rules configured:`, rules);
            console.log(`[ProofPulse] Current time:`, now.toISOString());
          }
          
          // Check day of week (0 = Sunday, 6 = Saturday)
          if (rules.days && Array.isArray(rules.days) && rules.days.length > 0) {
            const currentDay = now.getDay();
            if (!rules.days.includes(currentDay)) {
              console.log(`[ProofPulse] ❌ Widget hidden - Not in allowed days (current: ${currentDay}, allowed: ${rules.days.join(',')})`);
              return;
            }
            if (CONFIG.DEBUG) {
              console.log(`[ProofPulse] ✅ Day check passed (current: ${currentDay})`);
            }
          }
          
          // Check active hours
          if (rules.active_hours && rules.active_hours.start !== undefined && rules.active_hours.end !== undefined) {
            const currentHour = now.getHours();
            const startHour = rules.active_hours.start;
            const endHour = rules.active_hours.end;
            
            if (currentHour < startHour || currentHour >= endHour) {
              console.log(`[ProofPulse] ❌ Widget hidden - Outside active hours (current: ${currentHour}, allowed: ${startHour}-${endHour})`);
              return;
            }
            if (CONFIG.DEBUG) {
              console.log(`[ProofPulse] ✅ Hour check passed (current: ${currentHour}, allowed: ${startHour}-${endHour})`);
            }
          }
          
          console.log(`[ProofPulse] ✅ Widget shown - Time rules passed`);
        } else {
          if (CONFIG.DEBUG) {
            console.log(`[ProofPulse] ✅ Widget shown - no time rules configured (show at all times)`);
          }
        }
      } catch (timeError) {
        // On error, show widget (non-breaking)
        console.error('[ProofPulse] Time rules error:', timeError);
        console.log(`[ProofPulse] ✅ Widget shown - Time rules error (defaulting to show)`);
      }

      // Apply widget-specific timing settings from database
      if (widgetData.widget.duration) CONFIG.NOTIFICATION_DURATION = widgetData.widget.duration * 1000;
      if (widgetData.widget.gap !== undefined) CONFIG.NOTIFICATION_GAP = widgetData.widget.gap * 1000;
      if (widgetData.widget.start_delay !== undefined) CONFIG.START_DELAY = widgetData.widget.start_delay * 1000;
      if (widgetData.widget.loop !== undefined) CONFIG.LOOP = widgetData.widget.loop;
      if (widgetData.widget.shuffle !== undefined) CONFIG.SHUFFLE = widgetData.widget.shuffle;
      
      // Apply widget-specific style settings
      if (widgetData.widget.radius !== undefined) CONFIG.RADIUS = widgetData.widget.radius;
      if (widgetData.widget.shadow) CONFIG.SHADOW = widgetData.widget.shadow;
      if (widgetData.widget.anim) CONFIG.ANIM = widgetData.widget.anim;
      
      // Apply script attribute overrides to widget settings (non-breaking)
      if (ds.color) widgetData.widget.primary_color = ds.color;
      if (ds.position) widgetData.widget.position = ds.position;

      applyThemePreset();
      
      console.log("[ProofPulse] Applied settings:", {
        duration: CONFIG.NOTIFICATION_DURATION / 1000 + 's',
        gap: CONFIG.NOTIFICATION_GAP / 1000 + 's',
        start_delay: CONFIG.START_DELAY / 1000 + 's',
        loop: CONFIG.LOOP,
        shuffle: CONFIG.SHUFFLE,
        bg_color: widgetData.widget.bg_color || '#FFFFFF',
        bg_opacity: widgetData.widget.bg_opacity !== undefined ? widgetData.widget.bg_opacity : 100,
      });

      if (!(matchesPath() && matchesDevice() && matchesUtm())) {
        return;
      }

      // Optionally shuffle order per pageview
      if (CONFIG.SHUFFLE && widgetData.notifications && widgetData.notifications.length > 1) {
        for (let i = widgetData.notifications.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [widgetData.notifications[i], widgetData.notifications[j]] = [
            widgetData.notifications[j],
            widgetData.notifications[i],
          ];
        }
      }

      // Start showing notifications
      startNotificationLoop();

      // Monitor URL changes for SPA navigation (Next.js, React Router, etc.)
      let lastPath = window.location.pathname;
      
      const checkUrlAndToggleWidget = () => {
        const currentPath = window.location.pathname;
        
        if (currentPath !== lastPath) {
          lastPath = currentPath;
          console.log(`[ProofPulse] URL changed to: ${currentPath}`);
          
          // Check if widget should be visible on new URL
          if (widgetData.widget.url_targeting) {
            const urlMatches = matchUrlPatterns(currentPath, widgetData.widget.url_targeting);
            
            if (!urlMatches) {
              console.log(`[ProofPulse] ❌ Hiding widget - URL doesn't match targeting`);
              // Hide widget
              if (notificationContainer) {
                notificationContainer.style.display = 'none';
              }
              // Clear any active notifications
              if (nextShowTimeout) {
                clearTimeout(nextShowTimeout);
                nextShowTimeout = null;
              }
              const active = notificationContainer?.querySelector(".proofpulse-notification");
              if (active) active.remove();
            } else {
              console.log(`[ProofPulse] ✅ Showing widget - URL matches targeting`);
              // Show widget
              if (notificationContainer) {
                notificationContainer.style.display = 'block';
                console.log(`[ProofPulse] Container display set to: block`);
              } else {
                console.warn(`[ProofPulse] ⚠️ Container not found!`);
              }
              
              // Clear any existing notifications
              const active = notificationContainer?.querySelector(".proofpulse-notification");
              if (active) {
                active.remove();
                console.log(`[ProofPulse] Removed existing notification`);
              }
              
              // Always restart notification loop when showing
              if (nextShowTimeout) {
                clearTimeout(nextShowTimeout);
                nextShowTimeout = null;
                console.log(`[ProofPulse] Cleared existing timeout`);
              }
              
              console.log(`[ProofPulse] 🔄 Restarting notification loop...`);
              console.log(`[ProofPulse] Available notifications: ${widgetData?.notifications?.length || 0}`);
              
              if (widgetData?.notifications?.length > 0) {
                startNotificationLoop();
              } else {
                console.warn(`[ProofPulse] ⚠️ No notifications to show!`);
              }
            }
          }
        }
      };
      
      // Listen for URL changes (works with pushState/replaceState)
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = function() {
        originalPushState.apply(this, arguments);
        checkUrlAndToggleWidget();
      };
      
      history.replaceState = function() {
        originalReplaceState.apply(this, arguments);
        checkUrlAndToggleWidget();
      };
      
      // Also listen for popstate (back/forward buttons)
      window.addEventListener('popstate', checkUrlAndToggleWidget);
      
      // Also check periodically as a fallback (for frameworks that don't use history API)
      setInterval(checkUrlAndToggleWidget, 1000);

      // Pause when page is hidden, resume when visible
      document.addEventListener("visibilitychange", () => {
        if (!notificationContainer) return;
        
        if (document.hidden) {
          // Pause: Clear timers when tab becomes hidden
          console.log('[ProofPulse] Tab hidden - pausing notifications');
          const active = notificationContainer.querySelector(".proofpulse-notification");
          if (active) active.dispatchEvent(new Event("mouseenter"));
          if (nextShowTimeout) {
            clearTimeout(nextShowTimeout);
            nextShowTimeout = null;
          }
        } else {
          // Resume: Restart notification loop when tab becomes visible
          console.log('[ProofPulse] Tab visible - resuming notifications');
          
          // Check if we should show widget on current URL
          if (widgetData?.widget?.url_targeting) {
            const currentPath = window.location.pathname;
            const urlMatches = matchUrlPatterns(currentPath, widgetData.widget.url_targeting);
            
            if (!urlMatches) {
              console.log('[ProofPulse] Not resuming - URL does not match targeting');
              return;
            }
          }
          
          // Clear any existing notification
          const active = notificationContainer.querySelector(".proofpulse-notification");
          if (active) active.remove();
          
          // Restart the notification loop
          if (nextShowTimeout) {
            clearTimeout(nextShowTimeout);
            nextShowTimeout = null;
          }
          
          if (widgetData?.notifications?.length > 0) {
            console.log('[ProofPulse] Restarting notification loop after tab became visible');
            startNotificationLoop();
          }
        }
      });

      console.log("[ProofPulse] Widget initialized successfully");
    } catch (error) {
      console.error("[ProofPulse] Widget initialization error:", error);
    }
  }

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWidget);
  } else {
    initWidget();
  }
})();
