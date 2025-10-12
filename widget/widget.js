(function () {
  "use strict";

  // Get widget ID from script tag
  const script = document.currentScript;
  const widgetId = script.getAttribute("data-widget");

  if (!widgetId) {
    console.error("TrustPulse: No widget ID provided");
    return;
  }

  // API endpoint (change this to your production URL later)
  const API_URL = "http://localhost:3000/api";

  // Widget state
  let notifications = [];
  let currentIndex = 0;
  let widgetSettings = {};
  let notificationElement = null;

  // Fetch widget data
  async function fetchWidgetData() {
    try {
      const response = await fetch(`${API_URL}/widget/${widgetId}`);
      if (!response.ok) throw new Error("Failed to fetch widget data");

      const data = await response.json();
      widgetSettings = data.widget;
      notifications = data.notifications.filter((n) => n.is_active);

      if (notifications.length > 0) {
        createWidget();
        showNextNotification();
      }
    } catch (error) {
      console.error("TrustPulse Error:", error);
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

  // Get widget position styles
  function getWidgetStyles() {
    const position = widgetSettings.position || "bottom-right";
    const baseStyles = `
        position: fixed;
        z-index: 9999;
        max-width: 350px;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        pointer-events: auto;
      `;

    const positions = {
      "bottom-right": "bottom: 20px; right: 20px;",
      "bottom-left": "bottom: 20px; left: 20px;",
      "top-right": "top: 20px; right: 20px;",
    };

    return baseStyles + (positions[position] || positions["bottom-right"]);
  }

  // Show next notification
  function showNextNotification() {
    if (!notifications.length) return;

    const notification = notifications[currentIndex];
    displayNotification(notification);

    // Move to next notification
    currentIndex = (currentIndex + 1) % notifications.length;

    // Show next after delay
    setTimeout(() => {
      hideNotification(() => {
        setTimeout(showNextNotification, 2000); // 2 second gap between notifications
      });
    }, 6000); // Show each notification for 6 seconds
  }

  // Display notification
  function displayNotification(notification) {
    const primaryColor = widgetSettings.primary_color || "#3B82F6";

    // Get initials for avatar
    const initials = notification.name
      ? notification.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "?";

    notificationElement.innerHTML = `
        <div style="
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          padding: 16px;
          border-left: 4px solid ${primaryColor};
          cursor: pointer;
        " onclick="window.trustpulseClick('${notification.id}')">
          <div style="display: flex; align-items: start; gap: 12px;">
            <div style="
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: ${primaryColor};
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
                margin: 0;
                font-size: 14px;
                color: #1f2937;
                font-weight: 500;
                line-height: 1.4;
              ">
                <strong>${notification.name || "Someone"}</strong>
                ${notification.location ? ` from ${notification.location}` : ""}
              </p>
              <p style="
                margin: 4px 0 0 0;
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
                ${getTimeAgo(notification.timestamp)}
              </p>
            </div>
          </div>
        </div>
      `;

    // Animate in
    setTimeout(() => {
      notificationElement.style.opacity = "1";
      notificationElement.style.transform = "translateY(0)";
    }, 100);

    // Track impression
    trackEvent("impression", notification.id);
  }

  // Hide notification
  function hideNotification(callback) {
    notificationElement.style.opacity = "0";
    notificationElement.style.transform = "translateY(20px)";
    setTimeout(callback, 400);
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

  // Track events (impressions and clicks)
  function trackEvent(eventType, notificationId) {
    fetch(`${API_URL}/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        widget_id: widgetId,
        event_type: eventType,
        notification_id: notificationId,
      }),
    }).catch((err) => console.error("Analytics error:", err));
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
