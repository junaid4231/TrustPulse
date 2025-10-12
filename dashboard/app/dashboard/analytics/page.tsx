"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  BarChart3,
  TrendingUp,
  Eye,
  MousePointerClick,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [stats, setStats] = useState({
    totalImpressions: 0,
    totalClicks: 0,
    conversionRate: 0,
    avgImpressions: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [widgetPerformance, setWidgetPerformance] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's widgets
      const { data: widgets } = await supabase
        .from("widgets")
        .select("*")
        .eq("user_id", user.id);

      const widgetIds = widgets?.map((w) => w.id) || [];

      if (widgetIds.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate date range
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Load analytics
      const { data: analyticsData } = await supabase
        .from("analytics")
        .select("*")
        .in("widget_id", widgetIds)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      // Calculate overall stats
      const impressions =
        analyticsData?.filter((a) => a.event_type === "impression").length || 0;
      const clicks =
        analyticsData?.filter((a) => a.event_type === "click").length || 0;
      const conversionRate = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const avgImpressions = impressions / daysAgo;

      setStats({
        totalImpressions: impressions,
        totalClicks: clicks,
        conversionRate: Number(conversionRate.toFixed(1)),
        avgImpressions: Number(avgImpressions.toFixed(0)),
      });

      // Prepare chart data (group by day)
      const dailyData = groupByDay(analyticsData || [], daysAgo);
      setChartData(dailyData);

      // Widget performance
      const widgetStats = calculateWidgetPerformance(
        analyticsData || [],
        widgets || []
      );
      setWidgetPerformance(widgetStats);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupByDay = (data: any[], days: number) => {
    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayData = data.filter((item) => {
        const itemDate = new Date(item.created_at);
        return itemDate >= date && itemDate < nextDate;
      });

      const impressions = dayData.filter(
        (d) => d.event_type === "impression"
      ).length;
      const clicks = dayData.filter((d) => d.event_type === "click").length;

      result.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        impressions,
        clicks,
      });
    }

    return result;
  };

  const calculateWidgetPerformance = (analyticsData: any[], widgets: any[]) => {
    return widgets
      .map((widget) => {
        const widgetAnalytics = analyticsData.filter(
          (a) => a.widget_id === widget.id
        );
        const impressions = widgetAnalytics.filter(
          (a) => a.event_type === "impression"
        ).length;
        const clicks = widgetAnalytics.filter(
          (a) => a.event_type === "click"
        ).length;
        const ctr =
          impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : "0.0";

        return {
          name: widget.name,
          domain: widget.domain,
          impressions,
          clicks,
          ctr,
        };
      })
      .sort((a, b) => b.impressions - a.impressions);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">
            Track your widget performance and engagement
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setTimeRange("7d")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === "7d"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange("30d")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === "30d"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange("90d")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === "90d"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100">Total Impressions</p>
            <Eye className="w-5 h-5 text-blue-100" />
          </div>
          <p className="text-4xl font-bold">
            {stats.totalImpressions.toLocaleString()}
          </p>
          <p className="text-sm text-blue-100 mt-2">
            Avg {stats.avgImpressions}/day
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-100">Total Clicks</p>
            <MousePointerClick className="w-5 h-5 text-purple-100" />
          </div>
          <p className="text-4xl font-bold">
            {stats.totalClicks.toLocaleString()}
          </p>
          <p className="text-sm text-purple-100 mt-2">User engagement</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-100">Conversion Rate</p>
            <TrendingUp className="w-5 h-5 text-green-100" />
          </div>
          <p className="text-4xl font-bold">{stats.conversionRate}%</p>
          <p className="text-sm text-green-100 mt-2">Click-through rate</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-orange-100">Time Range</p>
            <Calendar className="w-5 h-5 text-orange-100" />
          </div>
          <p className="text-4xl font-bold">
            {timeRange === "7d" ? "7" : timeRange === "30d" ? "30" : "90"}
          </p>
          <p className="text-sm text-orange-100 mt-2">Days of data</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Line Chart - Impressions & Clicks Over Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Engagement Over Time
          </h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="impressions"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: "#3B82F6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: "#8B5CF6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No data available yet</p>
                <p className="text-sm">Widget impressions will appear here</p>
              </div>
            </div>
          )}
        </div>

        {/* Bar Chart - Widget Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Widget Performance
          </h2>
          {widgetPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={widgetPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="impressions"
                  fill="#3B82F6"
                  radius={[8, 8, 0, 0]}
                />
                <Bar dataKey="clicks" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No widgets yet</p>
                <p className="text-sm">Create a widget to see performance</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Widget Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Detailed Widget Stats
        </h2>
        {widgetPerformance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Widget Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Domain
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Impressions
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Clicks
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    CTR
                  </th>
                </tr>
              </thead>
              <tbody>
                {widgetPerformance.map((widget, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {widget.name}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{widget.domain}</td>
                    <td className="py-3 px-4 text-center text-blue-600 font-semibold">
                      {widget.impressions.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center text-purple-600 font-semibold">
                      {widget.clicks.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {widget.ctr}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>No widget data available</p>
            <p className="text-sm mt-1">
              Create and install widgets to see stats
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
