"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  BarChart3,
  LineChart,
  Loader2,
  CalendarDays,
  TrendingUp,
  Eye,
  MousePointerClick,
  RefreshCw,
} from "lucide-react";

// Types from DB
type AnalyticsRow = {
  id?: string;
  widget_id: string;
  event_type: "impression" | "click" | "scratch_complete" | "code_copied";
  notification_id: string | null;
  timestamp: string; // ISO
  url: string | null;
  user_agent: string | null;
  ip_address?: string | null;
};

type NotificationRow = {
  id: string;
  type: string;
  message: string | null;
  name: string | null;
  product_name: string | null;
};

const RANGES = [
  { key: "7", label: "Last 7 days", days: 7 },
  { key: "30", label: "Last 30 days", days: 30 },
];

export default function AnalyticsPage() {
  const params = useParams();
  const widgetId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [rangeKey, setRangeKey] = useState<"7" | "30">("7");
  const [rows, setRows] = useState<AnalyticsRow[]>([]);
  const [notifs, setNotifs] = useState<Record<string, NotificationRow>>({});
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fromISO = useMemo(() => {
    const days = RANGES.find((r) => r.key === rangeKey)!.days;
    const d = new Date();
    d.setDate(d.getDate() - (days - 1));
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, [rangeKey]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      console.log('[Analytics] Loading data for widget:', widgetId, 'from:', fromISO);
      
      // Fetch analytics rows
      const { data: events, error: aerr } = await supabase
        .from("analytics")
        .select("widget_id,event_type,notification_id,timestamp,url,user_agent")
        .eq("widget_id", widgetId)
        .gte("timestamp", fromISO)
        .order("timestamp", { ascending: true });
      
      console.log('[Analytics] Query result:', { events, error: aerr });
      
      if (aerr) throw aerr;

      const analytics = (events as AnalyticsRow[]) || [];
      console.log('[Analytics] Processed events:', analytics.length, 'events');
      setRows(analytics);

      // Fetch referenced notifications for display context
      const notifIds = Array.from(
        new Set(analytics.map((e) => e.notification_id).filter(Boolean))
      ) as string[];

      if (notifIds.length > 0) {
        const { data: notifRows, error: nerr } = await supabase
          .from("notifications")
          .select("id,type,message,name,product_name")
          .in("id", notifIds);
        if (nerr) throw nerr;
        const dict: Record<string, NotificationRow> = {};
        (notifRows as NotificationRow[]).forEach((n) => {
          dict[n.id] = n;
        });
        setNotifs(dict);
      } else {
        setNotifs({});
      }
      
      // Update last updated timestamp
      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      console.log('[Analytics] Auto-refreshing data...');
      load();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetId, fromISO]);

  // Aggregate helpers
  const summary = useMemo(() => {
    const impressions = rows.filter((r) => r.event_type === "impression").length;
    const clicks = rows.filter((r) => r.event_type === "click").length;
    const scratches = rows.filter((r) => r.event_type === "scratch_complete").length;
    const codeCopies = rows.filter((r) => r.event_type === "code_copied").length;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const scratchRate = impressions > 0 ? (scratches / impressions) * 100 : 0;
    const copyRate = scratches > 0 ? (codeCopies / scratches) * 100 : 0;
    return { impressions, clicks, ctr, scratches, codeCopies, scratchRate, copyRate };
  }, [rows]);

  const byDay = useMemo(() => {
    const map: Record<string, { impressions: number; clicks: number }> = {};
    const days = RANGES.find((r) => r.key === rangeKey)!.days;
    const d = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const dt = new Date(d);
      dt.setDate(dt.getDate() - i);
      const key = dt.toISOString().slice(0, 10);
      map[key] = { impressions: 0, clicks: 0 };
    }
    rows.forEach((r) => {
      const key = new Date(r.timestamp).toISOString().slice(0, 10);
      if (!map[key]) map[key] = { impressions: 0, clicks: 0 };
      if (r.event_type === "impression") map[key].impressions += 1;
      else if (r.event_type === "click") map[key].clicks += 1;
    });
    return map;
  }, [rows, rangeKey]);

  const byNotification = useMemo(() => {
    const map: Record<string, { impressions: number; clicks: number }> = {};
    rows.forEach((r) => {
      const key = r.notification_id || "unknown";
      if (!map[key]) map[key] = { impressions: 0, clicks: 0 };
      if (r.event_type === "impression") map[key].impressions += 1;
      else if (r.event_type === "click") map[key].clicks += 1;
    });
    const list = Object.entries(map).map(([id, v]) => ({
      id,
      impressions: v.impressions,
      clicks: v.clicks,
      ctr: v.impressions > 0 ? (v.clicks / v.impressions) * 100 : 0,
    }));
    list.sort((a, b) => b.impressions - a.impressions);
    return list;
  }, [rows]);

  const byPath = useMemo(() => {
    const map: Record<string, { impressions: number; clicks: number }> = {};
    rows.forEach((r) => {
      const u = r.url || "";
      try {
        const path = new URL(u).pathname || "/";
        if (!map[path]) map[path] = { impressions: 0, clicks: 0 };
        if (r.event_type === "impression") map[path].impressions += 1;
        else if (r.event_type === "click") map[path].clicks += 1;
      } catch {
        const path = u || "(unknown)";
        if (!map[path]) map[path] = { impressions: 0, clicks: 0 };
        if (r.event_type === "impression") map[path].impressions += 1;
        else if (r.event_type === "click") map[path].clicks += 1;
      }
    });
    const list = Object.entries(map).map(([path, v]) => ({
      path,
      impressions: v.impressions,
      clicks: v.clicks,
      ctr: v.impressions > 0 ? (v.clicks / v.impressions) * 100 : 0,
    }));
    list.sort((a, b) => b.impressions - a.impressions);
    return list.slice(0, 10);
  }, [rows]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 text-gray-900">
        {/* Back Button */}
        <Link
          href={`/dashboard/widgets/${widgetId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Widget
        </Link>

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-10 h-10 text-white" />
                <h1 className="text-4xl font-bold text-white">Analytics Dashboard</h1>
              </div>
              <p className="text-blue-100 text-lg">Track your widget performance and engagement metrics</p>
              {lastUpdated && (
                <p className="text-white/70 text-sm mt-2">
                  🔄 Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refreshes every 30s
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => load()}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-sm font-medium inline-flex items-center gap-2 transition-all bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh data now"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRangeKey(r.key as any)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium inline-flex items-center gap-2 transition-all ${rangeKey === r.key ? "bg-white text-blue-600 shadow-lg" : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20"}`}
                >
                  <CalendarDays className="w-4 h-4" /> {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Key Performance Metrics
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-blue-100 text-sm font-medium">Total Impressions</div>
                <Eye className="w-5 h-5 text-blue-100" />
              </div>
              <div className="text-4xl font-bold mb-1">{summary.impressions.toLocaleString()}</div>
              <div className="text-blue-100 text-sm">Views of your notifications</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-purple-100 text-sm font-medium">Total Clicks</div>
                <MousePointerClick className="w-5 h-5 text-purple-100" />
              </div>
              <div className="text-4xl font-bold mb-1">{summary.clicks.toLocaleString()}</div>
              <div className="text-purple-100 text-sm">User engagements</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-green-100 text-sm font-medium">Click-Through Rate</div>
                <TrendingUp className="w-5 h-5 text-green-100" />
              </div>
              <div className="text-4xl font-bold mb-1">{summary.ctr.toFixed(2)}%</div>
              <div className="text-green-100 text-sm">Conversion performance</div>
            </div>
          </div>
        </div>

        {/* Scratch Card Analytics */}
        {summary.scratches > 0 && (
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border-2 border-pink-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-2xl">🎰</div>
              <h3 className="text-lg font-bold text-gray-900">Scratch Card Performance</h3>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white/80 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-1">Scratches Completed</div>
                <div className="text-2xl font-bold text-pink-600">{summary.scratches}</div>
              </div>
              <div className="bg-white/80 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-1">Codes Copied</div>
                <div className="text-2xl font-bold text-purple-600">{summary.codeCopies}</div>
              </div>
              <div className="bg-white/80 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-1">Scratch Rate</div>
                <div className="text-2xl font-bold text-pink-600">{summary.scratchRate.toFixed(2)}%</div>
                <div className="text-xs text-gray-500 mt-1">of impressions</div>
              </div>
              <div className="bg-white/80 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-1">Copy Rate</div>
                <div className="text-2xl font-bold text-purple-600">{summary.copyRate.toFixed(2)}%</div>
                <div className="text-xs text-gray-500 mt-1">of scratches</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white/60 rounded-lg">
              <div className="text-sm text-gray-700">
                <strong>💡 Insights:</strong>
                {summary.scratchRate > 50 && " Amazing engagement! Over 50% of visitors are scratching."}
                {summary.scratchRate > 30 && summary.scratchRate <= 50 && " Great engagement! Keep optimizing your rewards."}
                {summary.scratchRate <= 30 && " Try different reward values or messaging to boost engagement."}
                {summary.copyRate > 70 && " Excellent! Most scratchers are copying codes."}
                {summary.copyRate <= 70 && summary.copyRate > 0 && " Consider making the code more visible or valuable."}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading analytics...
          </div>
        ) : error ? (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{error}</div>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Analytics Data Yet</h3>
            <p className="text-gray-600 mb-4">
              Your widget hasn't received any impressions or clicks yet.
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>✅ Make sure your widget is installed on your website</p>
              <p>✅ Check that the widget ID is correct</p>
              <p>✅ Visit your website to generate test data</p>
            </div>
          </div>
        ) : (
          <>
            {/* Detailed Analytics Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <LineChart className="w-6 h-6 text-purple-600" />
                Detailed Analytics
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold text-lg">
                    <LineChart className="w-5 h-5 text-blue-600" /> 
                    Daily Trend
                  </div>
              <div className="space-y-2">
                {Object.entries(byDay).map(([day, v]) => (
                  <div key={day} className="flex items-center justify-between text-sm text-gray-700">
                    <div className="w-28 text-gray-500">{day}</div>
                    <div className="flex-1 ml-2 h-2 bg-gray-100 rounded overflow-hidden">
                      <div className="h-2 bg-blue-500" style={{ width: `${Math.min(100, v.impressions)}%` }} />
                    </div>
                    <div className="w-24 text-right">{v.impressions} imp</div>
                    <div className="w-24 text-right text-purple-700">{v.clicks} clk</div>
                  </div>
                ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold text-lg">
                    <BarChart3 className="w-5 h-5 text-purple-600" /> 
                    Top Performing Notifications
                  </div>
                  <div className="space-y-3">
                {byNotification.slice(0, 8).map((n) => {
                  const meta = n.id !== "unknown" ? notifs[n.id] : undefined;
                  const label = meta
                    ? meta.type === "purchase"
                      ? `${meta.name || "Someone"} purchased ${meta.product_name || "a product"}`
                      : meta.type === "review"
                      ? `${meta.name || "Customer"} reviewed ${meta.message || ""}`
                      : meta.type === "live_activity"
                      ? `${meta.message || "Live activity"}`
                      : meta.type === "low_stock"
                      ? `${meta.product_name || "Product"} low stock`
                      : meta.type === "milestone"
                      ? `${meta.name || "Customer"} milestone`
                      : meta.type === "reward"
                      ? `🎰 ${meta.message || "Scratch card reward"}`
                      : meta.message || "Notification"
                    : "(unknown)";
                  return (
                    <div key={n.id} className="text-sm text-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="line-clamp-1 mr-3">{label}</div>
                        <div className="text-gray-500">{n.impressions} / {n.clicks} ({n.ctr.toFixed(2)}%)</div>
                      </div>
                      <div className="mt-1 h-2 bg-gray-100 rounded overflow-hidden">
                        <div className="h-2 bg-blue-500" style={{ width: `${Math.min(100, n.impressions)}%` }} />
                        <div className="h-2 bg-purple-500 -mt-2 opacity-70" style={{ width: `${Math.min(100, n.clicks)}%` }} />
                      </div>
                    </div>
                  );
                })}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Pages Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold text-lg">
                <BarChart3 className="w-5 h-5 text-green-600" /> 
                Top Pages
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-2.5">Path</th>
                      <th className="py-2.5">Impressions</th>
                      <th className="py-2.5">Clicks</th>
                      <th className="py-2.5">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byPath.map((p) => (
                      <tr key={p.path} className="border-t border-gray-100">
                        <td className="py-2.5">{p.path}</td>
                        <td className="py-2.5">{p.impressions}</td>
                        <td className="py-2.5">{p.clicks}</td>
                        <td className="py-2.5">{p.ctr.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
