"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Repeat,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Filter,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Copy,
  Sparkles,
  TrendingUp,
  Users,
  Star,
  Package,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Smartphone,
  Monitor,
  Target,
} from "lucide-react";

type NotificationRow = {
  id: string;
  type: string;
  message: string | null;
  name: string | null;
  location: string | null;
  timestamp: string;
  is_active: boolean;
  product_name?: string | null;
  rating?: number | null;
  visitor_count?: number | null;
  stock_count?: number | null;
  milestone_text?: string | null;
  time_ago?: string | null;
  use_emoji?: boolean | null;
  target_url_patterns?: string | null;
  target_devices?: string[] | null;
  target_utms?: Record<string, any> | null;
  active_time_windows?: any | null;
};

const TYPE_CONFIG = {
  purchase: {
    icon: Package,
    color: "blue",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    label: "Purchase",
  },
  review: {
    icon: Star,
    color: "amber",
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    label: "Review",
  },
  live_activity: {
    icon: Users,
    color: "purple",
    bgLight: "bg-purple-50",
    bgDark: "dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-700 dark:text-purple-300",
    label: "Live Activity",
  },
  low_stock: {
    icon: AlertCircle,
    color: "red",
    bgLight: "bg-red-50",
    bgDark: "dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-300",
    label: "Low Stock",
  },
  milestone: {
    icon: TrendingUp,
    color: "green",
    bgLight: "bg-green-50",
    bgDark: "dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-700 dark:text-green-300",
    label: "Milestone",
  },
};

export default function NotificationsIndexPage() {
  const params = useParams();
  const router = useRouter();
  const widgetId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: "success" | "error" } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (showActiveOnly && !r.is_active) return false;
      if (!q) return true;
      return (
        (r.type || "").toLowerCase().includes(q) ||
        (r.message || "").toLowerCase().includes(q) ||
        (r.name || "").toLowerCase().includes(q) ||
        (r.product_name || "").toLowerCase().includes(q)
      );
    });
  }, [rows, query, showActiveOnly]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("widget_id", widgetId)
        .order("timestamp", { ascending: false });
      if (error) throw error;
      setRows((data as NotificationRow[]) || []);
    } catch (e: any) {
      setError(e.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [widgetId]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function toggleActive(id: string, isActive: boolean) {
    setBusyId(id);
    try {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, is_active: !isActive } : r)));
      const { error } = await supabase
        .from("notifications")
        .update({ is_active: !isActive })
        .eq("id", id);
      if (error) throw error;
      setToast({ msg: !isActive ? "Notification activated" : "Notification deactivated", kind: "success" });
    } catch (e: any) {
      setToast({ msg: e.message || "Failed to update", kind: "error" });
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, is_active: isActive } : r)));
    } finally {
      setBusyId(null);
    }
  }

  async function duplicate(id: string) {
    setBusyId(id);
    try {
      const original = rows.find((r) => r.id === id);
      if (!original) return;
      const { id: _, timestamp: __, ...rest } = original;
      const { error } = await supabase.from("notifications").insert({ ...rest, widget_id: widgetId });
      if (error) throw error;
      setToast({ msg: "Notification duplicated", kind: "success" });
      await load();
    } catch (e: any) {
      setToast({ msg: e.message || "Failed to duplicate", kind: "error" });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this notification? This cannot be undone.")) return;
    setBusyId(id);
    try {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
      setRows((prev) => prev.filter((r) => r.id !== id));
      setToast({ msg: "Notification deleted", kind: "success" });
    } catch (e: any) {
      setToast({ msg: e.message || "Failed to delete", kind: "error" });
    } finally {
      setBusyId(null);
    }
  }

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function getPreviewText(n: NotificationRow) {
    if (n.type === "purchase") return `${n.name || "Someone"} purchased ${n.product_name || "a product"}`;
    if (n.type === "review") return `${n.name || "Customer"} left a ${n.rating || 0}-star review`;
    if (n.type === "live_activity") return `${n.visitor_count || 0} people ${n.message?.replace(/^[0-9]+\s+people\s+/, "") || "active"}`;
    if (n.type === "low_stock") return `Only ${n.stock_count || 0} left${n.product_name ? ` of ${n.product_name}` : ""}`;
    if (n.type === "milestone") return `${n.name || "Customer"} is our ${n.milestone_text || "milestone"} customer`;
    return n.message || "Notification";
  }

  const hasTargeting = (n: NotificationRow) => {
    return !!(n.target_url_patterns || n.target_devices?.length || n.target_utms || n.active_time_windows);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 text-gray-900 dark:text-gray-100">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2 animate-slide-in ${
              toast.kind === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
            role="status"
            aria-live="polite"
          >
            {toast.kind === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href={`/dashboard/widgets/${widgetId}`}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Widget
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your social proof notifications</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/widgets/${widgetId}/settings`}
              className="px-4 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-sm font-medium transition-all"
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Settings
            </Link>
            <button
              onClick={refresh}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-sm font-medium transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 inline mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href={`/dashboard/widgets/${widgetId}/notifications/new`}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white text-sm font-semibold inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" /> New Notification
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
                <p className="text-3xl font-bold">{rows.length}</p>
              </div>
              <Sparkles className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active</p>
                <p className="text-3xl font-bold text-green-600">{rows.filter((r) => r.is_active).length}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Inactive</p>
                <p className="text-3xl font-bold text-gray-400">{rows.filter((r) => !r.is_active).length}</p>
              </div>
              <EyeOff className="w-10 h-10 text-gray-400 opacity-50" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Targeted</p>
                <p className="text-3xl font-bold text-purple-600">{rows.filter(hasTargeting).length}</p>
              </div>
              <Target className="w-10 h-10 text-purple-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by type, name, product, or message..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => setShowActiveOnly((v) => !v)}
              className={`px-4 py-3 rounded-lg border-2 text-sm font-medium inline-flex items-center gap-2 transition-all ${
                showActiveOnly
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              }`}
            >
              {showActiveOnly ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              Active Only
            </button>
          </div>
        </div>

        {/* Content */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl text-sm text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No notifications found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {query || showActiveOnly ? "Try adjusting your filters" : "Create your first notification to get started"}
            </p>
            <Link
              href={`/dashboard/widgets/${widgetId}/notifications/new`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <Plus className="w-5 h-5" /> Create Notification
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((n) => {
              const typeConfig = TYPE_CONFIG[n.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.purchase;
              const Icon = typeConfig.icon;
              const isBusy = busyId === n.id;

              return (
                <div
                  key={n.id}
                  className={`group relative bg-white dark:bg-gray-900 rounded-xl border-2 ${
                    n.is_active ? "border-gray-200 dark:border-gray-700" : "border-gray-300 dark:border-gray-600 opacity-60"
                  } p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                >
                  {/* Type Badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${typeConfig.bgLight} ${typeConfig.bgDark} ${typeConfig.border} border mb-4`}>
                    <Icon className={`w-4 h-4 ${typeConfig.text}`} />
                    <span className={`text-xs font-semibold ${typeConfig.text}`}>{typeConfig.label}</span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-6 right-6">
                    {n.is_active ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium text-green-700 dark:text-green-300">Live</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Paused</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 pr-20 line-clamp-1">{n.name || "Anonymous"}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{getPreviewText(n)}</p>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-2 mb-4 text-xs text-gray-500 dark:text-gray-400">
                    {n.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {n.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(n.timestamp).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Targeting Indicators */}
                  {hasTargeting(n) && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {n.target_url_patterns && (
                        <div className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
                          URL
                        </div>
                      )}
                      {n.target_devices && n.target_devices.length > 0 && (
                        <div className="px-2 py-1 rounded bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1">
                          {n.target_devices.includes("mobile") && <Smartphone className="w-3 h-3" />}
                          {n.target_devices.includes("desktop") && <Monitor className="w-3 h-3" />}
                        </div>
                      )}
                      {n.target_utms && Object.keys(n.target_utms).length > 0 && (
                        <div className="px-2 py-1 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
                          UTM
                        </div>
                      )}
                      {n.active_time_windows && (
                        <div className="px-2 py-1 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Schedule
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActive(n.id, n.is_active)}
                      disabled={isBusy}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                        n.is_active
                          ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                          : "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300"
                      }`}
                      title={n.is_active ? "Pause" : "Activate"}
                    >
                      {isBusy ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : n.is_active ? <EyeOff className="w-4 h-4 inline mr-1" /> : <Eye className="w-4 h-4 inline mr-1" />}
                      {!isBusy && (n.is_active ? "Pause" : "Activate")}
                    </button>
                    <button
                      onClick={() => duplicate(n.id)}
                      disabled={isBusy}
                      className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium transition-all disabled:opacity-50"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remove(n.id)}
                      disabled={isBusy}
                      className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium transition-all disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
