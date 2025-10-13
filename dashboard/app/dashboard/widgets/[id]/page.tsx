"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Code, Bell, Trash2, Check } from "lucide-react";

export default function WidgetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const widgetId = params.id as string;

  const [widget, setWidget] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

  const copyEmbedCode = () => {
    const embedCode = `<script src="https://cdn.proofpulse.com/widget.js" data-widget="${widgetId}"></script>`;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!widget) return null;

  const embedCode = `<script src="https://cdn.proofpulse.com/widget.js" data-widget="${widgetId}"></script>`;

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
          </div>
          <Link
            href={`/dashboard/widgets/${widgetId}/notifications/new`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Notification
          </Link>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-600 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: widget.primary_color }}
                >
                  {notification.name?.charAt(0) || "?"}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">{notification.name}</span>
                    {notification.location && ` from ${notification.location}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    notification.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {notification.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
