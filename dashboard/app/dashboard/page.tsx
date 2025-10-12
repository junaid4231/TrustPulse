"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  Plus,
  TrendingUp,
  Eye,
  MousePointerClick,
  Bell,
  BarChart3,
} from "lucide-react";

export default function DashboardPage() {
  const [widgets, setWidgets] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalWidgets: 0,
    totalImpressions: 0,
    totalClicks: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
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

      // Get widget IDs for analytics
      const widgetIds = widgetsData?.map((w) => w.id) || [];

      // Load analytics data
      if (widgetIds.length > 0) {
        const { data: analyticsData } = await supabase
          .from("analytics")
          .select("event_type, created_at")
          .in("widget_id", widgetIds);

        const impressions =
          analyticsData?.filter((a) => a.event_type === "impression").length ||
          0;
        const clicks =
          analyticsData?.filter((a) => a.event_type === "click").length || 0;
        const conversionRate =
          impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : 0;

        setStats({
          totalWidgets: widgetsData?.length || 0,
          totalImpressions: impressions,
          totalClicks: clicks,
          conversionRate: Number(conversionRate),
        });
      } else {
        setStats({
          totalWidgets: 0,
          totalImpressions: 0,
          totalClicks: 0,
          conversionRate: 0,
        });
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your overview.</p>
        </div>
        <Link
          href="/dashboard/analytics"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          View Analytics
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Widgets</p>
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalWidgets}
          </p>
          <p className="text-xs text-gray-500 mt-1">Active widgets</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Impressions</p>
            <Eye className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalImpressions}
          </p>
          <p className="text-xs text-green-600 mt-1">↑ 0% from last week</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Clicks</p>
            <MousePointerClick className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalClicks}
          </p>
          <p className="text-xs text-purple-600 mt-1">↑ 0% from last week</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Conversion Rate</p>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.conversionRate}%
          </p>
          <p className="text-xs text-orange-600 mt-1">↑ 0% from last week</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link
            href="/dashboard/widgets/new"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create New Widget
          </Link>
          <Link
            href="/dashboard/widgets"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:border-blue-600 transition-colors"
          >
            View All Widgets
          </Link>
        </div>
      </div>

      {/* Recent Widgets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Widgets</h2>

        {widgets.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No widgets yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first widget to start showing social proof
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
          <div className="space-y-4">
            {widgets.slice(0, 5).map((widget) => (
              <div
                key={widget.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-600 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{widget.name}</h3>
                  <p className="text-sm text-gray-600">{widget.domain}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      widget.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {widget.is_active ? "Active" : "Inactive"}
                  </span>
                  <Link
                    href={`/dashboard/widgets/${widget.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
