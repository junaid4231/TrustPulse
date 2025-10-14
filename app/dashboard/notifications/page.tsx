"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Bell, Trash2, Eye, EyeOff, Search } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      name: string;
      message: string;
      widget_id: string;
      type: string;
      location?: string;
      timestamp: string;
      is_active: boolean;
    }>
  >([]);
  const [widgets, setWidgets] = useState<
    Array<{
      id: string;
      name: string;
      primary_color?: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterWidget, setFilterWidget] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Load widgets
      const { data: widgetsData } = await supabase
        .from("widgets")
        .select("*")
        .eq("user_id", user.id);

      setWidgets(widgetsData || []);

      // Load notifications for all widgets
      if (widgetsData && widgetsData.length > 0) {
        const widgetIds = widgetsData.map((w) => w.id);
        const { data: notificationsData } = await supabase
          .from("notifications")
          .select("*")
          .in("widget_id", widgetIds)
          .order("timestamp", { ascending: false });

        setNotifications(notificationsData || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotificationStatus = async (
    notificationId: string,
    currentStatus: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_active: !currentStatus })
        .eq("id", notificationId);

      if (error) throw error;

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId
            ? { ...notif, is_active: !currentStatus }
            : notif
        )
      );
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const deleteNotification = async (
    notificationId: string,
    notificationName: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete "${notificationName}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWidget =
      filterWidget === "all" || notification.widget_id === filterWidget;
    const matchesType =
      filterType === "all" || notification.type === filterType;

    return matchesSearch && matchesWidget && matchesType;
  });

  const getWidgetName = (widgetId: string) => {
    const widget = widgets.find((w) => w.id === widgetId);
    return widget?.name || "Unknown Widget";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Notifications
          </h1>
          <p className="text-gray-600">
            Manage all your social proof notifications across widgets
          </p>
        </div>
        <Link
          href="/dashboard/widgets"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Notification
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Widget Filter */}
          <div className="md:w-48">
            <select
              value={filterWidget}
              onChange={(e) => setFilterWidget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Widgets</option>
              {widgets.map((widget) => (
                <option key={widget.id} value={widget.id}>
                  {widget.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="md:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="activity">Activity</option>
              <option value="testimonial">Testimonial</option>
              <option value="purchase">Purchase</option>
              <option value="signup">Signup</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {notifications.length === 0
              ? "No notifications yet"
              : "No notifications match your filters"}
          </h3>
          <p className="text-gray-600 mb-6">
            {notifications.length === 0
              ? "Create your first notification to start showing social proof"
              : "Try adjusting your search or filter criteria"}
          </p>
          {notifications.length === 0 && (
            <Link
              href="/dashboard/widgets"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Create Your First Notification
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{
                      backgroundColor:
                        widgets.find((w) => w.id === notification.widget_id)
                          ?.primary_color || "#3B82F6",
                    }}
                  >
                    {notification.name?.charAt(0) || "?"}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {notification.name}
                      </h3>
                      {notification.location && (
                        <span className="text-sm text-gray-500">
                          from {notification.location}
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          notification.type === "activity"
                            ? "bg-blue-100 text-blue-700"
                            : notification.type === "testimonial"
                            ? "bg-green-100 text-green-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {notification.type}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-2">{notification.message}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        Widget: {getWidgetName(notification.widget_id)}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(notification.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() =>
                      toggleNotificationStatus(
                        notification.id,
                        notification.is_active
                      )
                    }
                    className={`p-2 rounded-lg transition-colors ${
                      notification.is_active
                        ? "text-green-600 hover:bg-green-50"
                        : "text-gray-400 hover:bg-gray-50"
                    }`}
                    title={
                      notification.is_active
                        ? "Hide notification"
                        : "Show notification"
                    }
                  >
                    {notification.is_active ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() =>
                      deleteNotification(notification.id, notification.name)
                    }
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {notifications.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Notification Stats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {notifications.length}
              </p>
              <p className="text-sm text-gray-600">Total Notifications</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {notifications.filter((n) => n.is_active).length}
              </p>
              <p className="text-sm text-gray-600">Active Notifications</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {new Set(notifications.map((n) => n.widget_id)).size}
              </p>
              <p className="text-sm text-gray-600">
                Widgets with Notifications
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {new Set(notifications.map((n) => n.type)).size}
              </p>
              <p className="text-sm text-gray-600">Notification Types</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
