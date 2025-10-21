"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Copy,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Search,
} from "lucide-react";

type Notification = {
  id: string;
  type: string;
  message: string | null;
  name: string | null;
  is_active: boolean;
  timestamp: string;
  product_name?: string | null;
};

export default function NotificationsListPage() {
  const params = useParams();
  const widgetId = params.id as string;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadNotifications();
  }, [widgetId]);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("widget_id", widgetId)
        .order("timestamp", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setNotifications(
        notifications.map((n) =>
          n.id === id ? { ...n, is_active: !currentStatus } : n
        )
      );

      showMessage(
        "success",
        `Notification ${!currentStatus ? "activated" : "deactivated"}`
      );
    } catch (error: any) {
      showMessage("error", error.message || "Failed to update notification");
    }
  };

  const duplicateNotification = async (id: string) => {
    try {
      const original = notifications.find((n) => n.id === id);
      if (!original) return;

      const { id: _, timestamp: __, ...rest } = original;
      const { error } = await supabase
        .from("notifications")
        .insert({ ...rest, widget_id: widgetId });

      if (error) throw error;

      showMessage("success", "Notification duplicated successfully");
      loadNotifications();
    } catch (error: any) {
      showMessage("error", error.message || "Failed to duplicate notification");
    }
  };

  const deleteNotification = async (id: string) => {
    if (!confirm("Delete this notification? This cannot be undone.")) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setNotifications(notifications.filter((n) => n.id !== id));
      showMessage("success", "Notification deleted successfully");
    } catch (error: any) {
      showMessage("error", error.message || "Failed to delete notification");
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    const query = searchQuery.toLowerCase();
    return (
      n.type?.toLowerCase().includes(query) ||
      n.message?.toLowerCase().includes(query) ||
      n.name?.toLowerCase().includes(query) ||
      n.product_name?.toLowerCase().includes(query)
    );
  });

  const getTypeColor = (type: string) => {
    const t = (type || "").toLowerCase().replace(/-/g, "_");
    const colors: Record<string, string> = {
      purchase: "bg-blue-100 text-blue-700",
      review: "bg-yellow-100 text-yellow-700",
      live_activity: "bg-green-100 text-green-700",
      low_stock: "bg-red-100 text-red-700",
      milestone: "bg-purple-100 text-purple-700",
    };
    return colors[t] || "bg-gray-100 text-gray-700";
  };

  const formatTypeLabel = (type: string) => {
    const label = (type || "").replace(/[-_]/g, " ");
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <Link
        href={`/dashboard/widgets/${widgetId}`}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Widget
      </Link>

      {/* Message Display */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
          <button
            onClick={() => setMessage(null)}
            className="ml-auto hover:opacity-70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Notifications
            </h1>
            <p className="text-gray-600">
              Manage your widget notifications
            </p>
          </div>
          <Link
            href={`/dashboard/widgets/${widgetId}/notifications/new`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Notification
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Total Notifications</p>
          <p className="text-3xl font-bold text-gray-900">
            {notifications.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Active</p>
          <p className="text-3xl font-bold text-green-600">
            {notifications.filter((n) => n.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Inactive</p>
          <p className="text-3xl font-bold text-gray-600">
            {notifications.filter((n) => !n.is_active).length}
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? "No notifications found"
                : "No notifications yet"}
            </p>
            {!searchQuery && (
              <Link
                href={`/dashboard/widgets/${widgetId}/notifications/new`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Your First Notification
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        {formatTypeLabel(notification.type)}
                      </span>
                      <span
                        className={`flex items-center gap-1 text-sm ${
                          notification.is_active
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            notification.is_active
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        />
                        {notification.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 mb-1">
                      {notification.name || "Unnamed"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {notification.message}
                    </p>
                    {notification.product_name && (
                      <p className="text-sm text-gray-500 mt-1">
                        Product: {notification.product_name}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() =>
                        toggleActive(notification.id, notification.is_active)
                      }
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title={
                        notification.is_active ? "Deactivate" : "Activate"
                      }
                    >
                      {notification.is_active ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => duplicateNotification(notification.id)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
