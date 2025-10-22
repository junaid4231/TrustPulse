import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Rate limiting (simple in-memory store - use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 1000; // Increased for testing
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = ip;
  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (current.count >= RATE_LIMIT) {
    return false;
  }

  current.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Rate limiting check
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      widget_id,
      event_type,
      notification_id,
      timestamp,
      url,
      user_agent,
    } = body;

    // Enhanced validation
    if (!widget_id || !event_type) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: widget_id and event_type are required",
        },
        { status: 400 }
      );
    }

    if (!["impression", "click", "scratch_complete", "code_copied"].includes(event_type)) {
      return NextResponse.json(
        { error: "Invalid event_type. Must be 'impression', 'click', 'scratch_complete', or 'code_copied'" },
        { status: 400 }
      );
    }

    // Insert analytics event with enhanced data
    const analyticsData = {
      widget_id,
      event_type,
      notification_id: notification_id || null,
      timestamp: timestamp || new Date().toISOString(),
      url: url || null,
      user_agent: user_agent || null,
      ip_address: ip,
    };

    const { error } = await supabase.from("analytics").insert([analyticsData]);

    if (error) {
      console.error("Analytics insert error:", error);
      return NextResponse.json(
        { error: "Failed to record event", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
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
