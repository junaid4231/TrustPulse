"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Code,
  Bell,
  Trash2,
  Check,
  Edit2,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
  Plus,
} from "lucide-react";

export default function WidgetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const widgetId = params.id as string;

  const [widget, setWidget] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadWidget();
  }, [widgetId]);

  const loadWidget = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Load widget
      const { data: widgetData, error: widgetError } = await supabase
        .from("widgets")
        .select("*")
        .eq("id", widgetId)
        .eq("user_id", user.id)
        .single();

      if (widgetError) throw widgetError;
      setWidget(widgetData);

      // Load notifications
      const { data: notificationsData } = await supabase
        .from("notifications")
        .select("*")
        .eq("widget_id", widgetId)
        .order("timestamp", { ascending: false });

      setNotifications(notificationsData || []);
    } catch (error) {
      console.error("Error loading widget:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteWidget = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this widget? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("widgets")
        .delete()
        .eq("id", widgetId);

      if (error) throw error;
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting widget:", error);
      alert("Failed to delete widget");
    }
  };

  const deleteNotification = async (
    notificationId: string,
    notificationName: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete the notification "${notificationName}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(notificationId);

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      // Remove from local state
      setNotifications(notifications.filter((n) => n.id !== notificationId));
      showMessage("success", "Notification deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      showMessage("error", error.message || "Failed to delete notification");
    } finally {
      setDeletingId(null);
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
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, is_active: !currentStatus } : n
        )
      );

      showMessage(
        "success",
        `Notification ${
          !currentStatus ? "activated" : "deactivated"
        } successfully!`
      );
    } catch (error: any) {
      console.error("Error toggling notification:", error);
      showMessage("error", error.message || "Failed to update notification");
    }
  };

  // Helpers: normalize type for colors/labels (match list page behavior)
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
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!widget) return null;

  const embedCode = `<script
  src="https://proofpulse.vercel.app/widget/widget.js"
  data-widget="${widgetId}"
  data-color="${widget.primary_color || "#3B82F6"}"
  data-radius="${widget.radius || 14}"
  data-shadow="${widget.shadow || "medium"}"
  data-anim="${widget.anim || "standard"}"
></script>`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
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

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {widget.name}
              </h1>
              <p className="text-blue-100 text-lg flex items-center gap-2">
                <Code className="w-5 h-5" />
                {widget.domain}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/dashboard/widgets/${widgetId}/analytics`}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium inline-flex items-center gap-2 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                Analytics
              </Link>
              <Link
                href={`/dashboard/widgets/${widgetId}/notifications`}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium inline-flex items-center gap-2 transition-all"
              >
                <Bell className="w-5 h-5" /> Notifications
              </Link>
              <Link
                href={`/dashboard/widgets/${widgetId}/settings`}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium transition-all"
              >
                Edit Widget
              </Link>
              <button
                onClick={deleteWidget}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-400/30 text-white font-medium transition-all"
              >
                <Trash2 className="w-5 h-5" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 rounded-lg bg-blue-50">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  widget.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {widget.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {notifications.length}
            </p>
            <p className="text-sm text-gray-600">Total Notifications</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {notifications.filter((n) => n.is_active).length}
            </p>
            <p className="text-sm text-gray-600">Active Notifications</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 rounded-lg bg-purple-50">
                <Edit2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {widget.position.replace("-", " ")}
            </p>
            <p className="text-sm text-gray-600">Position</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${widget.primary_color}20` }}
              >
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: widget.primary_color }}
                />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {widget.primary_color}
            </p>
            <p className="text-sm text-gray-600">Primary Color</p>
          </div>
        </div>

        {/* Embed Code Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Installation Code
              </h2>
              <p className="text-sm text-gray-600">
                Add this snippet to your website
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-4 border border-blue-200">
            <p className="text-gray-700 mb-2 font-medium">
              📋 Paste this code before the closing{" "}
              <code className="bg-white px-3 py-1 rounded-lg font-mono text-sm border border-gray-300">
                &lt;/body&gt;
              </code>{" "}
              tag
            </p>
            <p className="text-sm text-gray-600">
              The widget will automatically load and display your notifications.
            </p>
          </div>
          <div className="relative">
            <pre className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-6 rounded-xl overflow-x-auto text-sm font-mono shadow-inner border border-gray-700">
              <code>{embedCode}</code>
            </pre>
            <button
              onClick={copyEmbedCode}
              className="absolute top-4 right-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Widget Settings */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
              <MoreVertical className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Widget Configuration
              </h2>
              <p className="text-sm text-gray-600">
                Current settings and preferences
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                Position
              </label>
              <p className="font-bold text-lg text-gray-900 capitalize">
                {widget.position.replace("-", " ")}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-white shadow-md"
                  style={{ backgroundColor: widget.primary_color }}
                ></div>
                <p className="font-mono font-bold text-gray-900">
                  {widget.primary_color}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                Status
              </label>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    widget.is_active
                      ? "bg-green-500 animate-pulse"
                      : "bg-gray-400"
                  }`}
                />
                <p
                  className={`font-bold text-lg ${
                    widget.is_active ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  {widget.is_active ? "Live" : "Paused"}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                Created
              </label>
              <p className="font-bold text-lg text-gray-900">
                {new Date(widget.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Notifications
                </h2>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{notifications.length}</span>{" "}
                  total ·
                  <span className="font-semibold text-green-600">
                    {" "}
                    {notifications.filter((n) => n.is_active).length}
                  </span>{" "}
                  active
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/widgets/${widgetId}/notifications/new`}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Notification
            </Link>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-6">
                <Bell className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Create your first notification to start building social proof
                and trust with your visitors.
              </p>
              <Link
                href={`/dashboard/widgets/${widgetId}/notifications/new`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Bell className="w-5 h-5" />
                Create Your First Notification
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="group relative flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: widget.primary_color }}
                  >
                    {notification.name?.charAt(0) || "?"}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{notification.name}</span>
                      {notification.location &&
                        ` from ${notification.location}`}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-xs text-gray-500">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          notification.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {notification.is_active ? "Active" : "Inactive"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        {formatTypeLabel(notification.type)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Toggle Active/Inactive */}
                    <button
                      onClick={() =>
                        toggleNotificationStatus(
                          notification.id,
                          notification.is_active
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        notification.is_active
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                      title={notification.is_active ? "Deactivate" : "Activate"}
                    >
                      {notification.is_active ? "Deactivate" : "Activate"}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() =>
                        deleteNotification(notification.id, notification.name)
                      }
                      disabled={deletingId === notification.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete notification"
                    >
                      {deletingId === notification.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          {notifications.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">💡 Notification Tips:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>Inactive notifications won't appear on your website</li>
                    <li>
                      Notifications rotate automatically according to the
                      durations selected
                    </li>
                    <li>
                      Use realistic names and locations for better credibility
                    </li>
                    <li>Mix activity and testimonial types for variety</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
