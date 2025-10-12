(function () {
  "use strict";

  // Get widget ID from script tag
  const script = document.currentScript;
  const widgetId = script.getAttribute("data-widget");

  if (!widgetId) {
    console.error("TrustPulse: No widget ID provided");
    return;
  }

  // API endpoint - automatically detect environment
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3000/api"
      : `${window.location.protocol}//${window.location.host}/api`;

  // Widget state
  let notifications = [];
  let currentIndex = 0;
  let widgetSettings = {};
  let notificationElement = null;
  let isVisible = false;
  let retryCount = 0;
  const MAX_RETRIES = 3;

  // Fetch widget data with retry logic
  async function fetchWidgetData() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`${API_URL}/widget/${widgetId}`, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.widget) {
        throw new Error("Invalid widget data received");
      }

      widgetSettings = data.widget;
      notifications = data.notifications.filter((n) => n.is_active);

      // Reset retry count on success
      retryCount = 0;

      if (notifications.length > 0) {
        createWidget();
        startNotificationCycle();
      }
    } catch (error) {
      console.error("TrustPulse Error:", error.message);

      // Retry logic for network errors
      if (
        retryCount < MAX_RETRIES &&
        (error.name === "AbortError" ||
          error.message.includes("Failed to fetch"))
      ) {
        retryCount++;
        console.log(`TrustPulse: Retrying... (${retryCount}/${MAX_RETRIES})`);
        setTimeout(fetchWidgetData, Math.pow(2, retryCount) * 1000); // Exponential backoff
      }
    }
  }

  // Create widget container
  function createWidget() {
    // Check if widget already exists
    if (document.getElementById("trustpulse-widget")) return;

    // Create container
    notificationElement = document.createElement("div");
    notificationElement.id = "trustpulse-widget";
    notificationElement.style.cssText = getWidgetStyles();

    // Add to page
    document.body.appendChild(notificationElement);
  }

  // Get widget position styles with responsive design
  function getWidgetStyles() {
    const position = widgetSettings.position || "bottom-right";
    const baseStyles = `
        position: fixed;
        z-index: 9999;
        max-width: min(350px, 90vw);
        width: 100%;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        pointer-events: auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

    const positions = {
      "bottom-right": "bottom: 20px; right: 20px;",
      "bottom-left": "bottom: 20px; left: 20px;",
      "top-right": "top: 20px; right: 20px;",
      "top-left": "top: 20px; left: 20px;",
    };

    return baseStyles + (positions[position] || positions["bottom-right"]);
  }

  // Start the notification cycle
  function startNotificationCycle() {
    if (!notifications.length) return;

    // Wait for page to be fully loaded before showing notifications
    if (document.readyState !== "complete") {
      window.addEventListener("load", () => {
        setTimeout(showNextNotification, 2000);
      });
    } else {
      setTimeout(showNextNotification, 2000);
    }
  }

  // Show next notification
  function showNextNotification() {
    if (!notifications.length || !notificationElement) return;

    const notification = notifications[currentIndex];
    displayNotification(notification);

    // Move to next notification
    currentIndex = (currentIndex + 1) % notifications.length;

    // Show next after delay
    setTimeout(() => {
      hideNotification(() => {
        // Random delay between 3-8 seconds for more natural feel
        const delay = 3000 + Math.random() * 5000;
        setTimeout(showNextNotification, delay);
      });
    }, 5000); // Show each notification for 5 seconds
  }

  // Display notification with enhanced design
  function displayNotification(notification) {
    const primaryColor = widgetSettings.primary_color || "#3B82F6";

    // Get initials for avatar with fallback
    const initials = notification.name
      ? notification.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "👤";

    // Generate gradient colors based on primary color
    const gradientColors = generateGradient(primaryColor);

    notificationElement.innerHTML = `
        <div class="trustpulse-notification" style="
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 8px 25px rgba(0,0,0,0.08);
          padding: 18px;
          border: 1px solid rgba(255,255,255,0.8);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
        " onclick="window.trustpulseClick('${notification.id}')">
          
          <!-- Decorative elements -->
          <div style="
            position: absolute;
            top: 0;
            right: 0;
            width: 60px;
            height: 60px;
            background: ${gradientColors.light};
            border-radius: 0 16px 0 60px;
            opacity: 0.1;
          "></div>
          
          <div style="display: flex; align-items: start; gap: 14px; position: relative; z-index: 1;">
            <div style="
              width: 44px;
              height: 44px;
              border-radius: 50%;
              background: linear-gradient(135deg, ${primaryColor} 0%, ${
      gradientColors.dark
    } 100%);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              font-size: 16px;
              flex-shrink: 0;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              border: 2px solid rgba(255,255,255,0.2);
            ">
              ${initials}
            </div>
            <div style="flex: 1; min-width: 0;">
              <p style="
                margin: 0;
                font-size: 15px;
                color: #1f2937;
                font-weight: 600;
                line-height: 1.3;
              ">
                <strong>${notification.name || "Someone"}</strong>
                ${
                  notification.location
                    ? ` <span style="color: #6b7280; font-weight: 400;">from ${notification.location}</span>`
                    : ""
                }
              </p>
              <p style="
                margin: 6px 0 0 0;
                font-size: 14px;
                color: #4b5563;
                line-height: 1.4;
                font-weight: 500;
              ">
                ${notification.message}
              </p>
              <p style="
                margin: 8px 0 0 0;
                font-size: 12px;
                color: #9ca3af;
                font-weight: 500;
              ">
                <span style="
                  display: inline-block;
                  width: 6px;
                  height: 6px;
                  background: #10b981;
                  border-radius: 50%;
                  margin-right: 6px;
                "></span>
                ${getTimeAgo(notification.timestamp)}
              </p>
            </div>
          </div>
        </div>
      `;

    // Enhanced animation
    notificationElement.style.opacity = "0";
    notificationElement.style.transform = "translateY(30px) scale(0.95)";

    setTimeout(() => {
      notificationElement.style.opacity = "1";
      notificationElement.style.transform = "translateY(0) scale(1)";
    }, 50);

    // Track impression
    trackEvent("impression", notification.id);
  }

  // Generate gradient colors from primary color
  function generateGradient(primaryColor) {
    // Convert hex to RGB
    const hex = primaryColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Generate lighter and darker versions
    const light = `rgb(${Math.min(255, r + 30)}, ${Math.min(
      255,
      g + 30
    )}, ${Math.min(255, b + 30)})`;
    const dark = `rgb(${Math.max(0, r - 30)}, ${Math.max(
      0,
      g - 30
    )}, ${Math.max(0, b - 30)})`;

    return { light, dark };
  }

  // Hide notification with enhanced animation
  function hideNotification(callback) {
    notificationElement.style.opacity = "0";
    notificationElement.style.transform = "translateY(-20px) scale(0.95)";
    setTimeout(callback, 500);
  }

  // Get relative time
  function getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000); // seconds

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  // Track events (impressions and clicks) with improved error handling
  function trackEvent(eventType, notificationId) {
    // Use sendBeacon for better reliability on page unload
    const data = JSON.stringify({
      widget_id: widgetId,
      event_type: eventType,
      notification_id: notificationId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      user_agent: navigator.userAgent,
    });

    // Try sendBeacon first (better for page unload)
    if (navigator.sendBeacon) {
      try {
        navigator.sendBeacon(`${API_URL}/analytics`, data);
        return;
      } catch (e) {
        // Fallback to fetch if sendBeacon fails
      }
    }

    // Fallback to fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    fetch(`${API_URL}/analytics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: data,
      signal: controller.signal,
      keepalive: true, // Helps with page unload scenarios
    })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.warn("TrustPulse analytics error:", err.message);
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });
  }

  // Handle clicks
  window.trustpulseClick = function (notificationId) {
    trackEvent("click", notificationId);
  };

  // Initialize
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fetchWidgetData);
  } else {
    fetchWidgetData();
  }
})();
