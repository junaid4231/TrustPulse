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
} from "lucide-react";

// Types from DB
type AnalyticsRow = {
  id?: string;
  widget_id: string;
  event_type: "impression" | "click";
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
      // Fetch analytics rows
      const { data: events, error: aerr } = await supabase
        .from("analytics")
        .select("widget_id,event_type,notification_id,timestamp,url,user_agent")
        .eq("widget_id", widgetId)
        .gte("timestamp", fromISO)
        .order("timestamp", { ascending: true });
      if (aerr) throw aerr;

      const analytics = (events as AnalyticsRow[]) || [];
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
    } catch (e: any) {
      setError(e.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetId, fromISO]);

  // Aggregate helpers
  const summary = useMemo(() => {
    const impressions = rows.filter((r) => r.event_type === "impression").length;
    const clicks = rows.filter((r) => r.event_type === "click").length;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    return { impressions, clicks, ctr };
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-950 py-8">
      <div className="max-w-6xl mx-auto px-4 text-gray-900 dark:text-gray-100">
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/dashboard/widgets/${widgetId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Widget
          </Link>
          <div className="flex items-center gap-2">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRangeKey(r.key as any)}
                className={`px-3 py-2 rounded-lg border text-sm inline-flex items-center gap-2 ${rangeKey === r.key ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 bg-white"}`}
              >
                <CalendarDays className="w-4 h-4" /> {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-xs text-gray-500 mb-1">Impressions</div>
            <div className="text-2xl font-bold text-gray-900">{summary.impressions}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-xs text-gray-500 mb-1">Clicks</div>
            <div className="text-2xl font-bold text-gray-900">{summary.clicks}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-xs text-gray-500 mb-1">CTR</div>
            <div className="text-2xl font-bold text-gray-900">{summary.ctr.toFixed(2)}%</div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading analytics...
          </div>
        ) : error ? (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{error}</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3 text-gray-900 font-semibold"><LineChart className="w-4 h-4" /> Trend (Impressions / Clicks)</div>
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

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3 text-gray-900 font-semibold"><BarChart3 className="w-4 h-4" /> Top Notifications</div>
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

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:col-span-2">
              <div className="flex items-center gap-2 mb-3 text-gray-900 font-semibold"><BarChart3 className="w-4 h-4" /> Top Paths</div>
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
          </div>
        )}
      </div>
    </div>
  );
}
