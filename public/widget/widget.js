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
  const CONFIG = {
    API_BASE_URL:
      window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : "https://proofpulse.vercel.app",
    NOTIFICATION_DURATION: 6000,
    NOTIFICATION_GAP: 2000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
  };

  console.log("[ProofPulse] Initialized with API:", CONFIG.API_BASE_URL);
  console.log("[ProofPulse] Widget ID to fetch:", widgetId);

  // State
  let widgetData = null;
  let currentNotificationIndex = 0;
  let notificationContainer = null;
  let isShowing = false;
  let retryCount = 0;

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
      const url = `${CONFIG.API_BASE_URL}/api/widget/${widgetId}`;
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
      console.debug("[ProofPulse] Analytics tracking failed:", error);
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

  // Create notification element with ENHANCED styling
  function createNotificationElement(notification, settings) {
    const notif = document.createElement("div");
    notif.className = "proofpulse-notification";

    // ENHANCED STYLES - Clean white with subtle transparency
    notif.style.cssText = `
      position: fixed;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.96) 100%);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: 14px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 
                  0 3px 12px rgba(0, 0, 0, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8);
      padding: 14px 16px;
      max-width: 340px;
      min-width: 280px;
      z-index: 999999;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, 0.8);
      animation: proofpulse-slideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), proofpulse-glow 2s ease-in-out infinite;
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
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 16px 60px rgba(59, 130, 246, 0.3),
                      0 8px 30px rgba(0, 0, 0, 0.15);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.99) 0%, rgba(255, 255, 255, 0.98) 100%);
          animation: proofpulse-float 1.5s ease-in-out infinite;
        }

        .proofpulse-notification::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(
            90deg,
            transparent,
            ${settings.primary_color || "#3B82F6"},
            transparent
          );
          background-size: 200% 100%;
          animation: proofpulse-shimmer 2.5s ease-in-out infinite;
          border-radius: 14px 14px 0 0;
          opacity: 0.8;
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
    const initials = getInitials(notification.name);
    const relativeTime = getRelativeTime(notification.timestamp);
    const primaryColor = settings.primary_color || "#3B82F6";

    notif.innerHTML = `
      <div style="display: flex; align-items: start; gap: 14px;">
        <div class="proofpulse-avatar" style="
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(
      primaryColor,
      -15
    )} 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 15px;
          flex-shrink: 0;
          box-shadow: 0 4px 16px ${adjustColor(primaryColor, 0, 0.35)};
          border: 2.5px solid rgba(255, 255, 255, 0.9);
        ">
          ${initials}
        </div>
        <div style="flex: 1; min-width: 0;">
          <p class="proofpulse-name" style="
            margin: 0 0 4px 0;
            font-size: 15px;
            font-weight: 600;
            color: #1f2937;
            line-height: 1.5;
            letter-spacing: -0.01em;
          ">
            ${notification.name}${
      notification.location
        ? `<span style="font-weight: 400; color: #6b7280;"> from ${notification.location}</span>`
        : ""
    }
          </p>
          <p class="proofpulse-message" style="
            margin: 0 0 6px 0;
            font-size: 14px;
            color: #4b5563;
            line-height: 1.5;
            font-weight: 400;
          ">
            ${notification.message}
          </p>
          <div style="display: flex; align-items: center; gap: 6px;">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="opacity: 0.5;">
              <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M6 3v3l2 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <p class="proofpulse-time" style="
              margin: 0;
              font-size: 12px;
              color: #9ca3af;
              font-weight: 500;
            ">
              ${relativeTime}
            </p>
          </div>
        </div>
      </div>
    `;

    // Enhanced click handler with ripple effect
    notif.addEventListener("click", (e) => {
      // Create ripple effect
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
        background: rgba(255, 255, 255, 0.6);
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        animation: proofpulse-ripple 0.6s ease-out;
      `;

      if (!document.getElementById("proofpulse-ripple-style")) {
        const rippleStyle = document.createElement("style");
        rippleStyle.id = "proofpulse-ripple-style";
        rippleStyle.textContent = `
          @keyframes proofpulse-ripple {
            0% {
              transform: scale(0);
              opacity: 1;
            }
            100% {
              transform: scale(2);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(rippleStyle);
      }

      notif.style.position = "relative";
      notif.style.overflow = "hidden";
      notif.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);

      trackEvent("click", notification.id);
    });

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

  // Show notification with enhanced animation
  function showNotification(notification, settings) {
    if (isShowing) return;
    isShowing = true;

    const notifElement = createNotificationElement(notification, settings);
    notificationContainer.appendChild(notifElement);

    // Track impression
    trackEvent("impression", notification.id);

    // Auto-hide after duration with smooth exit animation
    setTimeout(() => {
      notifElement.classList.add("proofpulse-exit");

      setTimeout(() => {
        if (notifElement.parentNode) {
          notifElement.parentNode.removeChild(notifElement);
        }
        isShowing = false;
      }, 400);
    }, CONFIG.NOTIFICATION_DURATION);
  }

  // Notification loop
  function startNotificationLoop() {
    if (
      !widgetData ||
      !widgetData.notifications ||
      widgetData.notifications.length === 0
    ) {
      return;
    }

    const showNext = () => {
      if (!isShowing) {
        const notification = widgetData.notifications[currentNotificationIndex];
        showNotification(notification, widgetData.widget);

        currentNotificationIndex =
          (currentNotificationIndex + 1) % widgetData.notifications.length;
      }

      setTimeout(
        showNext,
        CONFIG.NOTIFICATION_DURATION + CONFIG.NOTIFICATION_GAP
      );
    };

    // Start first notification after small delay
    setTimeout(showNext, 2000);
  }

  // Initialize widget
  async function initWidget() {
    try {
      // Create container
      notificationContainer = document.createElement("div");
      notificationContainer.id = "proofpulse-container";
      document.body.appendChild(notificationContainer);

      // Fetch widget data
      widgetData = await fetchWidgetData();

      if (!widgetData) {
        console.warn("[ProofPulse] Widget initialization failed - no data");
        return;
      }

      // Start showing notifications
      startNotificationLoop();

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
