import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // CRITICAL: Await params in Next.js 15
    const { id: widgetId } = await context.params;

    console.log("Fetching widget:", widgetId);

    // Validate widget ID format (basic UUID check)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(widgetId)) {
      return NextResponse.json(
        { error: "Invalid widget ID format" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    // Fetch widget settings
    const { data: widget, error: widgetError } = await supabase
      .from("widgets")
      .select("*")
      .eq("id", widgetId)
      .single();

    console.log("Widget found:", widget);
    console.log("Widget error:", widgetError);

    if (widgetError || !widget) {
      return NextResponse.json(
        { error: "Widget not found or inactive", details: widgetError },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    // Optional limit override (non-breaking)
    const reqUrl = new URL(request.url);
    const rawLimit = parseInt(String(reqUrl.searchParams.get("limit") || ""), 10);
    const appliedLimit = !isNaN(rawLimit) && rawLimit > 0 && rawLimit <= 50 ? rawLimit : 15;

    // Fetch active notifications for this widget
    const { data: notifications, error: notificationsError } = await supabase
      .from("notifications")
      .select("*")
      .eq("widget_id", widgetId)
      .eq("is_active", true)
      .order("timestamp", { ascending: false })
      .limit(appliedLimit);

    console.log("Notifications found:", notifications?.length || 0);

    if (notificationsError) {
      console.error("Notifications fetch error:", notificationsError);
    }

    // Optional, non-breaking: gather request context (may be used by clients or future filters)
    const url = new URL(request.url);
    const sp = url.searchParams;
    const ctx = {
      path: sp.get("ctx_path") || null,
      device: sp.get("ctx_device") || null,
      utm_source: sp.get("utm_source") || null,
      utm_medium: sp.get("utm_medium") || null,
      utm_campaign: sp.get("utm_campaign") || null,
      utm_term: sp.get("utm_term") || null,
      utm_content: sp.get("utm_content") || null,
      referer: request.headers.get("referer") || null,
      origin: request.headers.get("origin") || null,
    };

    // Best-effort domain check (non-blocking)
    let allowedByDomain = true;
    try {
      if (widget.domain) {
        const ref = ctx.referer || ctx.origin;
        if (ref) {
          const host = new URL(ref).hostname.replace(/^www\./, "");
          const expected = String(widget.domain).replace(/^https?:\/\//, "").replace(/^www\./, "");
          allowedByDomain = host.endsWith(expected);
        }
      }
    } catch (e) {
      allowedByDomain = true; // never block on parsing errors
    }

    // Light, non-breaking post-processing: deduplicate by a composite key to avoid near-duplicates
    let dedupRemoved = 0;
    const seen = new Set<string>();
    const deduped = (notifications || []).filter((n) => {
      const key = [
        n.type || "",
        n.message || "",
        n.name || "",
        n.location || "",
        n.product_name || "",
        String(n.rating ?? ""),
        String(n.visitor_count ?? ""),
        String(n.stock_count ?? ""),
        n.milestone_text || "",
      ].join("|");
      if (seen.has(key)) {
        dedupRemoved++;
        return false;
      }
      seen.add(key);
      return true;
    });

    // Helper matchers (server-side targeting v2, optional per row)
    const matchUrlPatterns = (path: string | null, patterns: string | null) => {
      if (!patterns) return true;
      if (!path) return true; // no context => do not block
      const list = String(patterns)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (list.length === 0) return true;
      const toReg = (pat: string) =>
        new RegExp(
          "^" + pat.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&").replace(/\\\*/g, ".*") + "$"
        );
      return list.some((p) => toReg(p).test(path));
    };

    const matchDevice = (ctxDevice: string | null, targets: string[] | null) => {
      if (!targets || targets.length === 0) return true;
      if (!ctxDevice) return true; // no context => do not block
      const normalized = targets.map((t) => String(t).toLowerCase());
      return normalized.includes(ctxDevice.toLowerCase());
    };

    const matchUtms = (
      ctxUtms: Record<string, string | null>,
      utmObj: Record<string, any> | null
    ) => {
      if (!utmObj) return true;
      const entries = Object.entries(utmObj);
      if (entries.length === 0) return true;
      for (const [k, v] of entries) {
        if (!k) continue;
        const want = v == null ? null : String(v);
        const got = ctxUtms[k] == null ? null : String(ctxUtms[k]);
        if (want && want !== got) return false;
      }
      return true;
    };

    const matchTimeWindows = (windows: any) => {
      if (!windows) return true;
      if (!Array.isArray(windows) || windows.length === 0) return true;
      // Each window: { days: [0-6], start: "HH:MM", end: "HH:MM", tz: "UTC" }
      const now = new Date();
      for (const w of windows) {
        try {
          const tz = w.tz || "UTC";
          const fmtDay = new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            weekday: "short",
          }).formatToParts(now);
          const fmtTime = new Intl.DateTimeFormat("en-GB", {
            timeZone: tz,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(now);

          const dayMap: Record<string, number> = {
            Sun: 0,
            Mon: 1,
            Tue: 2,
            Wed: 3,
            Thu: 4,
            Fri: 5,
            Sat: 6,
          };
          const dayToken = fmtDay.find((p) => p.type === "weekday")?.value || "Mon";
          const dow = dayMap[dayToken as keyof typeof dayMap] ?? 1;
          const cur = fmtTime; // "HH:MM"
          const start = (w.start || "00:00").padStart(5, "0");
          const end = (w.end || "23:59").padStart(5, "0");
          const days: number[] = Array.isArray(w.days) ? w.days : [];

          if (days.length && !days.includes(dow)) continue; // not this day
          if (cur >= start && cur <= end) return true;
        } catch (e) {
          // On any parsing error, do not block
          return true;
        }
      }
      return false;
    };

    // Build ctx UTMs map
    const ctxUtms: Record<string, string | null> = {
      utm_source: ctx.utm_source,
      utm_medium: ctx.utm_medium,
      utm_campaign: ctx.utm_campaign,
      utm_term: ctx.utm_term,
      utm_content: ctx.utm_content,
    };

    // Apply optional targeting filters per notification (non-breaking)
    let filteredRemoved = 0;
    const filtered = deduped.filter((n) => {
      try {
        const okUrl = matchUrlPatterns(ctx.path, (n as any).target_url_patterns ?? null);
        if (!okUrl) {
          filteredRemoved++;
          return false;
        }
        const okDev = matchDevice(ctx.device, (n as any).target_devices ?? null);
        if (!okDev) {
          filteredRemoved++;
          return false;
        }
        const okUtm = matchUtms(ctxUtms, (n as any).target_utms ?? null);
        if (!okUtm) {
          filteredRemoved++;
          return false;
        }
        const okTime = matchTimeWindows((n as any).active_time_windows ?? null);
        if (!okTime) {
          filteredRemoved++;
          return false;
        }
        return true;
      } catch (e) {
        return true; // never block on errors
      }
    });

    // Return widget data
    const response = {
      widget: {
        id: widget.id,
        position: widget.position,
        primary_color: widget.primary_color,
        name: widget.name,
        domain: widget.domain,
        // Timing controls
        duration: widget.duration || 6,
        gap: widget.gap || 2,
        start_delay: widget.start_delay || 2,
        loop: widget.loop !== false,
        shuffle: widget.shuffle === true,
        // Style controls
        radius: widget.radius || 14,
        shadow: widget.shadow || 'medium',
        anim: widget.anim || 'standard',
        bg_color: widget.bg_color || '#FFFFFF',
        bg_opacity: widget.bg_opacity !== undefined ? widget.bg_opacity : 100,
        // Device targeting
        device_targeting: widget.device_targeting || null,
        // URL targeting
        url_targeting: widget.url_targeting || null,
        // Time-based rules
        time_rules: widget.time_rules || null,
      },
      notifications: filtered.map((notification) => {
        console.log("[API] Raw notification from DB:", notification);
        return {
          id: notification.id,
          type: notification.type,
          message: notification.message,
          name: notification.name,
          location: notification.location,
          ...(notification.timestamp && { timestamp: notification.timestamp }),
          is_active: notification.is_active,
          // Extended fields used by the widget renderer per type
          product_name: notification.product_name,
          rating: notification.rating,
          visitor_count: notification.visitor_count,
          stock_count: notification.stock_count,
          milestone_text: notification.milestone_text,
          time_ago: notification.time_ago,
          use_emoji: notification.use_emoji,
          // Click URL for clickable notifications
          click_url: notification.click_url || null,
          // Reward/Gamification fields (optional)
          reward_type: notification.reward_type || null,
          reward_value: notification.reward_value || null,
          reward_code: notification.reward_code || null,
          reward_expiry: notification.reward_expiry || null,
          reward_max_claims: notification.reward_max_claims || null,
          reward_claimed_count: notification.reward_claimed_count || 0,
          // Behavior triggers (optional)
          behavior_triggers: notification.behavior_triggers || null,
          // Targeting (optional) - needed for client-side checks with behavior triggers
          target_url_patterns: notification.target_url_patterns || null,
        };
      }),
      meta: {
        total_notifications: notifications?.length || 0,
        widget_created: widget.created_at,
        timestamp: new Date().toISOString(),
        context: ctx,
        allowed_by_domain: allowedByDomain,
        applied_limit: appliedLimit,
        dedup_removed: dedupRemoved,
        filtered_removed: filteredRemoved,
        targeting_applied: filteredRemoved > 0,
      },
    };

    // ✅ CRITICAL: CORS headers MUST be here
    return NextResponse.json(response, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Cache-Control, Accept",
        "Access-Control-Max-Age": "86400",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Widget API Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

// ✅ CRITICAL: Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Cache-Control, Accept",
        "Access-Control-Max-Age": "86400",
      },
    }
  );
}
