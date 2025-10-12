import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const widgetId = params.id;

    // Validate widget ID format (basic UUID check)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(widgetId)) {
      return NextResponse.json(
        { error: "Invalid widget ID format" },
        { status: 400 }
      );
    }

    // Fetch widget settings with caching headers
    const { data: widget, error: widgetError } = await supabase
      .from("widgets")
      .select("*")
      .eq("id", widgetId)
      .eq("is_active", true)
      .single();

    if (widgetError || !widget) {
      return NextResponse.json(
        { error: "Widget not found or inactive" },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Cache-Control": "no-cache, no-store, must-revalidate",
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
      .limit(15); // Increased limit for better rotation

    if (notificationsError) {
      console.error("Notifications fetch error:", notificationsError);
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
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
      })),
      meta: {
        total_notifications: notifications?.length || 0,
        widget_created: widget.created_at,
      },
    };

    return NextResponse.json(response, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
        ETag: `"${widget.id}-${widget.updated_at}"`,
      },
    });
  } catch (error) {
    console.error("Widget API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
