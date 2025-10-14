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
  Activity,
  Zap,
  Target,
  ArrowUpRight,
  Sparkles,
  Star,
} from "lucide-react";

export default function DashboardPage() {
  const [widgets, setWidgets] = useState<
    Array<{
      id: string;
      name: string;
      domain: string;
      primary_color?: string;
      is_active: boolean;
    }>
  >([]);
  const [stats, setStats] = useState({
    totalWidgets: 0,
    totalImpressions: 0,
    totalClicks: 0,
    conversionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">Dashboard</h1>
              <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
            </div>
            <p className="text-blue-100 text-lg">
              Welcome back! Here&apos;s your social proof overview.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Live Analytics</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Real-time Updates</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/analytics"
              className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30"
            >
              <BarChart3 className="w-5 h-5" />
              View Analytics
            </Link>
            <Link
              href="/dashboard/widgets/new"
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Widget
            </Link>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Widgets Card */}
        <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 hover:shadow-lg hover:shadow-blue-200/50 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-4 right-4 w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-blue-700 mb-1">
              Total Widgets
            </p>
            {isLoading ? (
              <div className="w-12 h-10 bg-blue-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-4xl font-bold text-blue-900">
                {stats.totalWidgets}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-xs text-blue-600 font-medium">Active widgets</p>
          </div>
        </div>

        {/* Impressions Card */}
        <div className="group relative bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 hover:shadow-lg hover:shadow-green-200/50 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-4 right-4 w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-green-700 mb-1">
              Impressions
            </p>
            {isLoading ? (
              <div className="w-16 h-10 bg-green-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-4xl font-bold text-green-900">
                {stats.totalImpressions.toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-green-600" />
            <p className="text-xs text-green-600 font-medium">
              +12% from last week
            </p>
          </div>
        </div>

        {/* Clicks Card */}
        <div className="group relative bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 hover:shadow-lg hover:shadow-purple-200/50 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-4 right-4 w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <MousePointerClick className="w-6 h-6 text-white" />
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-purple-700 mb-1">Clicks</p>
            {isLoading ? (
              <div className="w-12 h-10 bg-purple-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-4xl font-bold text-purple-900">
                {stats.totalClicks.toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-purple-600" />
            <p className="text-xs text-purple-600 font-medium">
              +8% from last week
            </p>
          </div>
        </div>

        {/* Conversion Rate Card */}
        <div className="group relative bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200 hover:shadow-lg hover:shadow-orange-200/50 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-4 right-4 w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-orange-700 mb-1">
              Conversion Rate
            </p>
            {isLoading ? (
              <div className="w-16 h-10 bg-orange-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-4xl font-bold text-orange-900">
                {stats.conversionRate}%
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <p className="text-xs text-orange-600 font-medium">
              +3.2% from last week
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/widgets/new"
            className="group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Create Widget</h3>
                <p className="text-blue-100 text-sm">
                  Start building social proof
                </p>
              </div>
            </div>
            <ArrowUpRight className="absolute top-4 right-4 w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link
            href="/dashboard/widgets"
            className="group relative bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl p-6 hover:from-purple-700 hover:to-purple-800 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Manage Widgets</h3>
                <p className="text-purple-100 text-sm">View and edit widgets</p>
              </div>
            </div>
            <ArrowUpRight className="absolute top-4 right-4 w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link
            href="/dashboard/analytics"
            className="group relative bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-6 hover:from-green-700 hover:to-green-800 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">View Analytics</h3>
                <p className="text-green-100 text-sm">Track performance</p>
              </div>
            </div>
            <ArrowUpRight className="absolute top-4 right-4 w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </div>

      {/* Enhanced Recent Widgets */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Recent Widgets</h2>
          </div>
          <Link
            href="/dashboard/widgets"
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            View All
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {widgets.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mx-auto flex items-center justify-center">
                <Bell className="w-12 h-12 text-blue-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Ready to create your first widget?
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start building social proof for your website with our easy-to-use
              widget builder
            </p>
            <Link
              href="/dashboard/widgets/new"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-1 font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Your First Widget
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {widgets.slice(0, 5).map((widget, index) => (
              <div
                key={widget.id}
                className="group relative bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                      style={{
                        backgroundColor: widget.primary_color || "#3B82F6",
                      }}
                    >
                      {widget.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                        {widget.name}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {widget.domain}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          widget.is_active
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {widget.is_active ? "Active" : "Inactive"}
                      </span>
                      {widget.is_active && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <Link
                      href={`/dashboard/widgets/${widget.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                {/* Progress indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-xl overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                    style={{ width: `${Math.min(100, (index + 1) * 20)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
