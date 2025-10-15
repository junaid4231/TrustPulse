(function () {
  "use strict";

  // Get the script tag - FIXED VERSION
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
        : "https://proofpulse.vercel.app", // Make sure this is YOUR URL
    NOTIFICATION_DURATION: 6000,
    NOTIFICATION_GAP: 2000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
  };

  console.log("[ProofPulse] Initialized with API:", CONFIG.API_BASE_URL);
  console.log("[ProofPulse] Widget ID to fetch:", widgetId);

  // Rest of your code continues...

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
  // Fetch widget data from API
  async function fetchWidgetData() {
    try {
      // MAKE SURE THIS LINE USES TEMPLATE LITERALS CORRECTLY:
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
      // Silent fail for analytics - don't break widget
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

  // Create notification element
  function createNotificationElement(notification, settings) {
    const notif = document.createElement("div");
    notif.className = "proofpulse-notification";
    notif.style.cssText = `
      position: fixed;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      padding: 16px;
      max-width: 320px;
      z-index: 999999;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-left: 4px solid ${settings.primary_color};
      animation: slideIn 0.5s ease-out;
    `;

    // Position based on settings
    const position = settings.position || "bottom-right";
    if (position === "bottom-right") {
      notif.style.bottom = "20px";
      notif.style.right = "20px";
    } else if (position === "bottom-left") {
      notif.style.bottom = "20px";
      notif.style.left = "20px";
    } else if (position === "top-right") {
      notif.style.top = "20px";
      notif.style.right = "20px";
    }

    // Add keyframe animation
    if (!document.getElementById("proofpulse-styles")) {
      const style = document.createElement("style");
      style.id = "proofpulse-styles";
      style.textContent = `
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .proofpulse-notification:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
        }
        @media (max-width: 640px) {
          .proofpulse-notification {
            max-width: calc(100vw - 40px);
            left: 20px !important;
            right: 20px !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Content
    const initials = getInitials(notification.name);
    const relativeTime = getRelativeTime(notification.timestamp);

    notif.innerHTML = `
      <div style="display: flex; align-items: start; gap: 12px;">
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${settings.primary_color};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          flex-shrink: 0;
        ">
          ${initials}
        </div>
        <div style="flex: 1; min-width: 0;">
          <p style="
            margin: 0 0 4px 0;
            font-size: 14px;
            font-weight: 500;
            color: #1f2937;
            line-height: 1.4;
          ">
            <strong style="font-weight: 600;">${notification.name}</strong>
            ${notification.location ? ` from ${notification.location}` : ""}
          </p>
          <p style="
            margin: 0;
            font-size: 13px;
            color: #6b7280;
            line-height: 1.4;
          ">
            ${notification.message}
          </p>
          <p style="
            margin: 4px 0 0 0;
            font-size: 11px;
            color: #9ca3af;
          ">
            ${relativeTime}
          </p>
        </div>
      </div>
    `;

    // Click handler
    notif.addEventListener("click", () => {
      trackEvent("click", notification.id);
    });

    return notif;
  }

  // Show notification
  function showNotification(notification, settings) {
    if (isShowing) return;
    isShowing = true;

    const notifElement = createNotificationElement(notification, settings);
    notificationContainer.appendChild(notifElement);

    // Track impression
    trackEvent("impression", notification.id);

    // Auto-hide after duration
    setTimeout(() => {
      notifElement.style.opacity = "0";
      notifElement.style.transform = "translateY(20px)";

      setTimeout(() => {
        if (notifElement.parentNode) {
          notifElement.parentNode.removeChild(notifElement);
        }
        isShowing = false;
      }, 300);
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
