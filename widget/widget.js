(function () {
  "use strict";

  console.log("TrustPulse: Widget script loaded");

  // Get widget ID from script tag
  const script = document.currentScript;
  const widgetId = script.getAttribute("data-widget");

  console.log("TrustPulse: Widget ID:", widgetId);

  if (!widgetId) {
    console.error("TrustPulse: No widget ID provided");
    return;
  }

  // API endpoint - HARDCODED for development
  // In production, this should be replaced with your deployed API URL
  const API_URL = "http://localhost:3000/api";

  console.log("TrustPulse: API URL:", API_URL);
  console.log("TrustPulse: Will fetch from:", `${API_URL}/widget/${widgetId}`);

  // Widget state
  let notifications = [];
  let currentIndex = 0;
  let widgetSettings = {};
  let notificationElement = null;
  let retryCount = 0;
  const MAX_RETRIES = 3;

  // Fetch widget data with retry logic
  async function fetchWidgetData() {
    console.log("TrustPulse: Starting fetch...");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const fetchUrl = `${API_URL}/widget/${widgetId}`;
      console.log("TrustPulse: Fetching from:", fetchUrl);

      const response = await fetch(fetchUrl, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      console.log("TrustPulse: Response received, status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("TrustPulse: API Error:", errorData);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("TrustPulse: Data received:", data);

      if (!data.widget) {
        throw new Error("Invalid widget data received");
      }

      widgetSettings = data.widget;
      notifications = data.notifications.filter((n) => n.is_active !== false);

      console.log("TrustPulse: Widget settings:", widgetSettings);
      console.log("TrustPulse: Notifications loaded:", notifications.length);

      retryCount = 0;

      if (notifications.length > 0) {
        createWidget();
        startNotificationCycle();
      } else {
        console.warn("TrustPulse: No active notifications found");
      }
    } catch (error) {
      console.error("TrustPulse Error:", error.message);
      console.error("TrustPulse Error stack:", error.stack);

      if (
        retryCount < MAX_RETRIES &&
        (error.name === "AbortError" ||
          error.message.includes("Failed to fetch"))
      ) {
        retryCount++;
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(
          `TrustPulse: Retrying in ${delay}ms... (${retryCount}/${MAX_RETRIES})`
        );
        setTimeout(fetchWidgetData, delay);
      }
    }
  }

  function createWidget() {
    console.log("TrustPulse: Creating widget container");

    if (document.getElementById("trustpulse-widget")) {
      console.log("TrustPulse: Widget already exists");
      return;
    }

    notificationElement = document.createElement("div");
    notificationElement.id = "trustpulse-widget";
    notificationElement.style.cssText = getWidgetStyles();
    document.body.appendChild(notificationElement);

    console.log("TrustPulse: Widget container created and added to body");
  }

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

  function startNotificationCycle() {
    console.log("TrustPulse: Starting notification cycle");

    if (!notifications.length) {
      console.warn("TrustPulse: No notifications to show");
      return;
    }

    if (document.readyState !== "complete") {
      console.log("TrustPulse: Waiting for page to load...");
      window.addEventListener("load", () => {
        console.log("TrustPulse: Page loaded, starting in 2s");
        setTimeout(showNextNotification, 2000);
      });
    } else {
      console.log("TrustPulse: Page already loaded, starting in 2s");
      setTimeout(showNextNotification, 2000);
    }
  }

  function showNextNotification() {
    if (!notifications.length || !notificationElement) {
      console.warn("TrustPulse: Cannot show notification");
      return;
    }

    const notification = notifications[currentIndex];
    console.log(
      `TrustPulse: Showing notification ${currentIndex + 1}/${
        notifications.length
      }:`,
      notification.name
    );

    displayNotification(notification);

    currentIndex = (currentIndex + 1) % notifications.length;

    setTimeout(() => {
      hideNotification(() => {
        const delay = 3000 + Math.random() * 5000;
        console.log(
          `TrustPulse: Next notification in ${Math.round(delay / 1000)}s`
        );
        setTimeout(showNextNotification, delay);
      });
    }, 5000);
  }

  function displayNotification(notification) {
    const primaryColor = widgetSettings.primary_color || "#3B82F6";

    const initials = notification.name
      ? notification.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "👤";

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

    notificationElement.style.opacity = "0";
    notificationElement.style.transform = "translateY(30px) scale(0.95)";

    setTimeout(() => {
      notificationElement.style.opacity = "1";
      notificationElement.style.transform = "translateY(0) scale(1)";
      console.log("TrustPulse: Notification displayed and animated");
    }, 50);

    trackEvent("impression", notification.id);
  }

  function generateGradient(primaryColor) {
    const hex = primaryColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

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

  function hideNotification(callback) {
    notificationElement.style.opacity = "0";
    notificationElement.style.transform = "translateY(-20px) scale(0.95)";
    setTimeout(callback, 500);
  }

  function getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  function trackEvent(eventType, notificationId) {
    console.log(`TrustPulse: Tracking ${eventType}`);

    const data = JSON.stringify({
      widget_id: widgetId,
      event_type: eventType,
      notification_id: notificationId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      user_agent: navigator.userAgent,
    });

    if (navigator.sendBeacon) {
      try {
        const sent = navigator.sendBeacon(`${API_URL}/analytics`, data);
        if (sent) {
          console.log("TrustPulse: Analytics sent via sendBeacon");
          return;
        }
      } catch (e) {
        console.warn("TrustPulse: sendBeacon failed:", e);
      }
    }

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
      keepalive: true,
    })
      .then(() => console.log("TrustPulse: Analytics sent via fetch"))
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.warn("TrustPulse: Analytics error:", err.message);
        }
      })
      .finally(() => clearTimeout(timeoutId));
  }

  window.trustpulseClick = function (notificationId) {
    console.log("TrustPulse: Notification clicked");
    trackEvent("click", notificationId);
  };

  console.log("TrustPulse: Initializing...");
  console.log("TrustPulse: Page ready state:", document.readyState);

  if (document.readyState === "loading") {
    console.log("TrustPulse: Waiting for DOMContentLoaded");
    document.addEventListener("DOMContentLoaded", fetchWidgetData);
  } else {
    console.log("TrustPulse: Starting immediately");
    fetchWidgetData();
  }
})();
