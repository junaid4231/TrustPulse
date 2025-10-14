"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Eye } from "lucide-react";

export default function NewWidgetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [position, setPosition] = useState("bottom-right");
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");

  // Preview state
  const [showPreview, setShowPreview] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create widget
      const { data: widget, error: widgetError } = await supabase
        .from("widgets")
        .insert([
          {
            user_id: user.id,
            name,
            domain,
            position,
            primary_color: primaryColor,
          },
        ])
        .select()
        .single();

      if (widgetError) throw widgetError;

      // Create sample notifications
      const sampleNotifications = [
        {
          widget_id: widget.id,
          type: "activity",
          message: "just signed up",
          name: "John Doe",
          location: "New York",
        },
        {
          widget_id: widget.id,
          type: "activity",
          message: "just purchased",
          name: "Sarah Smith",
          location: "California",
        },
        {
          widget_id: widget.id,
          type: "testimonial",
          message: "Amazing product! Highly recommend.",
          name: "Mike Johnson",
          location: "Texas",
        },
      ];

      const { error: notifError } = await supabase
        .from("notifications")
        .insert(sampleNotifications);

      if (notifError) throw notifError;

      // Redirect to widget detail page
      router.push(`/dashboard/widgets/${widget.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create widget");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Widget
        </h1>
        <p className="text-gray-600 mb-8">
          Set up your social proof widget in minutes
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-6">
          {/* Widget Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Widget Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Homepage Widget"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              A friendly name to identify this widget
            </p>
          </div>

          {/* Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website Domain <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g., mywebsite.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              The domain where this widget will be displayed (without https://)
            </p>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Widget Position
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setPosition("bottom-left")}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  position === "bottom-left"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:border-blue-300"
                }`}
              >
                <div className="text-sm font-medium">Bottom Left</div>
              </button>
              <button
                type="button"
                onClick={() => setPosition("bottom-right")}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  position === "bottom-right"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:border-blue-300"
                }`}
              >
                <div className="text-sm font-medium">Bottom Right</div>
              </button>
              <button
                type="button"
                onClick={() => setPosition("top-right")}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  position === "top-right"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:border-blue-300"
                }`}
              >
                <div className="text-sm font-medium">Top Right</div>
              </button>
            </div>
          </div>

          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Choose a color that matches your brand
            </p>
          </div>

          {/* Preview Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Eye className="w-5 h-5" />
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="p-6 bg-gray-100 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4">Widget Preview</h3>
              <div className="bg-white h-64 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  Your Website
                </div>
                {/* Sample notification */}
                <div
                  className={`absolute ${
                    position === "bottom-left"
                      ? "bottom-4 left-4"
                      : position === "bottom-right"
                      ? "bottom-4 right-4"
                      : "top-4 right-4"
                  } bg-white rounded-lg shadow-xl p-4 max-w-sm animate-slide-up`}
                  style={{ borderLeft: `4px solid ${primaryColor}` }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      JD
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-medium">
                        <span className="font-semibold">John Doe</span> from New
                        York
                      </p>
                      <p className="text-xs text-gray-500">
                        just signed up • 2 minutes ago
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Widget"
              )}
            </button>
            <Link
              href="/dashboard"
              className="px-8 py-3 border border-gray-300 rounded-lg hover:border-blue-600 font-medium text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
