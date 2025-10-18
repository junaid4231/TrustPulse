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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!widget) return null;

  const embedCode = `<script src="https://proofpulse.vercel.app/widget/widget.js" data-widget="${widgetId}"></script>`;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
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

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {widget.name}
          </h1>
          <p className="text-gray-600">{widget.domain}</p>
        </div>
        <button
          onClick={deleteWidget}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Widget
        </button>
      </div>

      {/* Embed Code Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Installation Code</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Copy this code and paste it before the closing{" "}
          <code className="bg-gray-100 px-2 py-1 rounded">&lt;/body&gt;</code>{" "}
          tag on your website.
        </p>
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{embedCode}</code>
          </pre>
          <button
            onClick={copyEmbedCode}
            className="absolute top-2 right-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Widget Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Widget Settings
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-600">Position</label>
            <p className="font-medium capitalize">
              {widget.position.replace("-", " ")}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Primary Color</label>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: widget.primary_color }}
              ></div>
              <p className="font-medium">{widget.primary_color}</p>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600">Status</label>
            <p
              className={`font-medium ${
                widget.is_active ? "text-green-600" : "text-gray-600"
              }`}
            >
              {widget.is_active ? "Active" : "Inactive"}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Created</label>
            <p className="font-medium">
              {new Date(widget.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {notifications.length} total
            </span>
          </div>
          <Link
            href={`/dashboard/widgets/${widgetId}/notifications/new`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Notification
          </Link>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No notifications yet</p>
            <Link
              href={`/dashboard/widgets/${widgetId}/notifications/new`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Bell className="w-4 h-4" />
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
                    {notification.location && ` from ${notification.location}`}
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
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        notification.type === "activity"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {notification.type}
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
                  <li>Notifications rotate automatically every 8 seconds</li>
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
  );
}
