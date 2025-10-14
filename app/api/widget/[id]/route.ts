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
        { status: 400 }
      );
    }

    // Fetch widget settings - REMOVED is_active filter for now
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
            "Access-Control-Allow-Headers":
              "Content-Type, Cache-Control, Accept",
          },
        }
      );
    }

    // Fetch active notifications for this widget
    const { data: notifications, error: notificationsError } = await supabase
      .from("notifications")
      .select("*")
      .eq("widget_id", widgetId)
      .eq("is_active", true)
      .order("timestamp", { ascending: false })
      .limit(15);

    console.log("Notifications found:", notifications?.length || 0);

    if (notificationsError) {
      console.error("Notifications fetch error:", notificationsError);
    }

    // Return widget data with enhanced information
    const response = {
      widget: {
        id: widget.id,
        position: widget.position,
        primary_color: widget.primary_color,
        name: widget.name,
        domain: widget.domain,
      },
      notifications: (notifications || []).map((notification) => ({
        id: notification.id,
        type: notification.type,
        message: notification.message,
        name: notification.name,
        location: notification.location,
        timestamp: notification.timestamp,
        is_active: notification.is_active, // Include this for widget.js
      })),
      meta: {
        total_notifications: notifications?.length || 0,
        widget_created: widget.created_at,
        timestamp: new Date().toISOString(),
      },
    };

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

// Handle CORS preflight
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
