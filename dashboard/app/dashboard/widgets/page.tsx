"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  Plus,
  Bell,
  ExternalLink,
  Trash2,
  Eye,
  MousePointerClick,
  Copy,
  Check,
  MoreVertical,
} from "lucide-react";
import { WidgetListSkeleton } from "@/components/LoadingSkeleton";

export default function WidgetsListPage() {
  const [widgets, setWidgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [widgetStats, setWidgetStats] = useState<Record<string, any>>({});
  const [copiedWidgetId, setCopiedWidgetId] = useState<string | null>(null);

  useEffect(() => {
    loadWidgets();
  }, []);

  const loadWidgets = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Load widgets
      const { data: widgetsData } = await supabase
        .from("widgets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setWidgets(widgetsData || []);

      // Load stats for each widget
      if (widgetsData && widgetsData.length > 0) {
        const stats: Record<string, any> = {};

        for (const widget of widgetsData) {
          const { data: analytics } = await supabase
            .from("analytics")
            .select("event_type")
            .eq("widget_id", widget.id);

          const impressions =
            analytics?.filter((a) => a.event_type === "impression").length || 0;
          const clicks =
            analytics?.filter((a) => a.event_type === "click").length || 0;
          const ctr =
            impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : "0.0";

          stats[widget.id] = { impressions, clicks, ctr };
        }

        setWidgetStats(stats);
      }
    } catch (error) {
      console.error("Error loading widgets:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteWidget = async (widgetId: string, widgetName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${widgetName}"? This cannot be undone.`
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

      // Reload widgets
      loadWidgets();
    } catch (error) {
      console.error("Error deleting widget:", error);
      alert("Failed to delete widget");
    }
  };

  const copyWidgetScript = async (widgetId: string) => {
    const script = `<script src="${window.location.origin}/widget/widget.js" data-widget="${widgetId}"></script>`;

    try {
      await navigator.clipboard.writeText(script);
      setCopiedWidgetId(widgetId);
      setTimeout(() => setCopiedWidgetId(null), 2000);
    } catch (error) {
      console.error("Failed to copy script:", error);
      alert("Failed to copy script to clipboard");
    }
  };

  if (loading) {
    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Widgets
            </h1>
            <p className="text-gray-600">
              Manage all your social proof widgets
            </p>
          </div>
          <Link
            href="/dashboard/widgets/new"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Create Widget
          </Link>
        </div>

        {/* Loading Skeleton */}
        <WidgetListSkeleton />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Widgets
          </h1>
          <p className="text-gray-600">Manage all your social proof widgets</p>
        </div>
        <Link
          href="/dashboard/widgets/new"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Create Widget
        </Link>
      </div>

      {/* Widgets Grid */}
      {widgets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No widgets yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first widget to start showing social proof on your
            website
          </p>
          <Link
            href="/dashboard/widgets/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Create Your First Widget
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((widget) => {
            const stats = widgetStats[widget.id] || {
              impressions: 0,
              clicks: 0,
              ctr: "0.0",
            };

            return (
              <div
                key={widget.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Widget Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {widget.name}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        {widget.domain}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        widget.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {widget.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Widget Preview */}
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: widget.primary_color }}
                    >
                      JD
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 truncate">
                        John Doe from New York
                      </p>
                      <p className="text-xs text-gray-500">just signed up</p>
                    </div>
                  </div>
                </div>

                {/* Widget Stats */}
                <div className="p-4 bg-gray-50">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                        <Eye className="w-4 h-4" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {stats.impressions}
                      </p>
                      <p className="text-xs text-gray-600">Views</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                        <MousePointerClick className="w-4 h-4" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {stats.clicks}
                      </p>
                      <p className="text-xs text-gray-600">Clicks</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                        <Bell className="w-4 h-4" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {stats.ctr}%
                      </p>
                      <p className="text-xs text-gray-600">CTR</p>
                    </div>
                  </div>
                </div>

                {/* Widget Actions */}
                <div className="p-4 border-t border-gray-100 flex gap-2">
                  <Link
                    href={`/dashboard/widgets/${widget.id}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 text-center transition-colors"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => copyWidgetScript(widget.id)}
                    className="px-4 py-2 bg-gray-50 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                    title="Copy widget script"
                  >
                    {copiedWidgetId === widget.id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteWidget(widget.id, widget.name)}
                    className="px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 transition-colors"
                    title="Delete widget"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Stats */}
      {widgets.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {widgets.length}
              </p>
              <p className="text-sm text-gray-600">Total Widgets</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {widgets.filter((w) => w.is_active).length}
              </p>
              <p className="text-sm text-gray-600">Active Widgets</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {Object.values(widgetStats).reduce(
                  (sum: number, stat: any) => sum + stat.impressions,
                  0
                )}
              </p>
              <p className="text-sm text-gray-600">Total Impressions</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {Object.values(widgetStats).reduce(
                  (sum: number, stat: any) => sum + stat.clicks,
                  0
                )}
              </p>
              <p className="text-sm text-gray-600">Total Clicks</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
