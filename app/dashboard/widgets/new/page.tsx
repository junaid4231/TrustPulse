"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Eye, Palette, Sliders } from "lucide-react";

export default function NewWidgetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [position, setPosition] = useState("bottom-right");
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [radius, setRadius] = useState(14);
  const [shadow, setShadow] = useState<"minimal" | "medium" | "bold">("medium");
  const [anim, setAnim] = useState<"subtle" | "standard" | "vivid">("standard");
  
  // Timing controls
  const [duration, setDuration] = useState(6);
  const [gap, setGap] = useState(2);
  const [startDelay, setStartDelay] = useState(2);
  const [loop, setLoop] = useState(true);
  const [shuffle, setShuffle] = useState(false);
  
  // Background customization
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [bgOpacity, setBgOpacity] = useState(100);
  
  // Device targeting (empty array = show on all devices)
  const [deviceTargeting, setDeviceTargeting] = useState<string[]>([]);
  
  // URL targeting (empty array = show on all pages)
  const [urlTargeting, setUrlTargeting] = useState<string>("");

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
            radius,
            shadow,
            anim,
            duration,
            gap,
            start_delay: startDelay,
            loop,
            shuffle,
            bg_color: bgColor,
            bg_opacity: bgOpacity,
            device_targeting: deviceTargeting.length > 0 ? deviceTargeting : null,
            url_targeting: urlTargeting.trim() ? urlTargeting.split('\n').map(s => s.trim()).filter(Boolean) : null,
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
              <Palette className="w-4 h-4 inline mr-1" />
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
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { name: 'Blue', color: '#3B82F6' },
                { name: 'Purple', color: '#9333EA' },
                { name: 'Pink', color: '#EC4899' },
                { name: 'Green', color: '#10B981' },
                { name: 'Orange', color: '#F59E0B' },
                { name: 'Red', color: '#EF4444' },
              ].map((preset) => (
                <button
                  key={preset.color}
                  type="button"
                  onClick={() => setPrimaryColor(preset.color)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs hover:border-gray-400 transition-colors"
                  style={{ backgroundColor: preset.color, color: 'white' }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Customization */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sliders className="w-5 h-5" />
              Visual Customization
            </h3>
            
            {/* Border Radius */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Radius: <span className="font-semibold text-gray-900">{radius}px</span>
              </label>
              <input
                type="range"
                min={0}
                max={32}
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Sharp (0px)</span>
                <span>Rounded (32px)</span>
              </div>
            </div>

            {/* Shadow Style */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shadow Style
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['minimal', 'medium', 'bold'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setShadow(s)}
                    className={`p-3 border-2 rounded-lg text-center transition-all capitalize ${
                      shadow === s
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Animation Style */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animation Style
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['subtle', 'standard', 'vivid'] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAnim(a)}
                    className={`p-3 border-2 rounded-lg text-center transition-all capitalize ${
                      anim === a
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-mono"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { name: 'White', color: '#FFFFFF' },
                  { name: 'Black', color: '#000000' },
                  { name: 'Blue', color: '#3B82F6' },
                  { name: 'Gray', color: '#6B7280' },
                ].map((preset) => (
                  <button
                    key={preset.color}
                    type="button"
                    onClick={() => setBgColor(preset.color)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs hover:border-gray-400 transition-colors"
                    style={{ 
                      backgroundColor: preset.color, 
                      color: preset.color === '#FFFFFF' ? '#000' : 'white' 
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Opacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Opacity: <span className="font-semibold text-gray-900">{bgOpacity}%</span>
              </label>
              <input
                type="range"
                min={20}
                max={100}
                step={1}
                value={bgOpacity}
                onChange={(e) => setBgOpacity(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Transparent (20%)</span>
                <span>Solid (100%)</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Lower opacity creates a frosted glass effect</p>
            </div>
          </div>

          {/* Timing & Behavior */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sliders className="w-5 h-5" />
              Timing & Behavior
            </h3>
            
            {/* Duration */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Duration: <span className="font-semibold text-gray-900">{duration}s</span>
              </label>
              <input
                type="range"
                min={3}
                max={30}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Quick (3s)</span>
                <span>Long (30s)</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">How long each notification stays visible</p>
            </div>

            {/* Gap */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gap Between Notifications: <span className="font-semibold text-gray-900">{gap}s</span>
              </label>
              <input
                type="range"
                min={1}
                max={60}
                value={gap}
                onChange={(e) => setGap(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Fast (1s)</span>
                <span>Slow (60s)</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Pause between each notification</p>
            </div>

            {/* Start Delay */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Delay: <span className="font-semibold text-gray-900">{startDelay}s</span>
              </label>
              <input
                type="range"
                min={0}
                max={10}
                value={startDelay}
                onChange={(e) => setStartDelay(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Instant (0s)</span>
                <span>Delayed (10s)</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Delay before first notification appears</p>
            </div>

            {/* Loop & Shuffle */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Loop</p>
                  <p className="text-xs text-gray-600 mt-0.5">Keep cycling</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loop}
                    onChange={(e) => setLoop(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Shuffle</p>
                  <p className="text-xs text-gray-600 mt-0.5">Random order</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffle}
                    onChange={(e) => setShuffle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-900">💡 Total cycle time: <strong>{duration + gap}s per notification</strong></p>
            </div>
            
            {/* Device Targeting */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Device Targeting
              </label>
              <div className="space-y-2">
                {[
                  { value: "desktop", label: "Desktop", icon: "💻" },
                  { value: "tablet", label: "Tablet", icon: "📱" },
                  { value: "mobile", label: "Mobile", icon: "📱" }
                ].map((device) => (
                  <label key={device.value} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={deviceTargeting.includes(device.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDeviceTargeting([...deviceTargeting, device.value]);
                        } else {
                          setDeviceTargeting(deviceTargeting.filter(d => d !== device.value));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {device.icon} {device.label}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {deviceTargeting.length === 0 
                  ? "✅ Widget will show on all devices (default)" 
                  : `Widget will only show on: ${deviceTargeting.join(", ")}`}
              </p>
            </div>
            
            {/* URL Targeting */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Targeting (Advanced)
              </label>
              <p className="text-xs text-gray-600 mb-3">
                Control which pages show the widget. Add one pattern per line. Leave empty to show on all pages.
              </p>
              <textarea
                value={urlTargeting}
                onChange={(e) => setUrlTargeting(e.target.value)}
                placeholder="Leave empty to show on all pages&#10;&#10;Examples:&#10;/products/*&#10;/blog/**&#10;!/checkout"
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
              <div className="mt-3 space-y-3">
                {/* Common Patterns */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-blue-900 mb-2">📘 Common Patterns:</p>
                  <div className="space-y-2 text-xs text-blue-800">
                    <div>
                      <code className="bg-white px-2 py-1 rounded font-mono">/products/*</code>
                      <p className="mt-1 text-blue-700">Shows on /products, /products/item1, /products/item2</p>
                    </div>
                    <div>
                      <code className="bg-white px-2 py-1 rounded font-mono">/blog/**</code>
                      <p className="mt-1 text-blue-700">Shows on all blog pages including nested paths</p>
                    </div>
                    <div>
                      <code className="bg-white px-2 py-1 rounded font-mono">!/checkout</code>
                      <p className="mt-1 text-blue-700">Hide on checkout (! means exclude)</p>
                    </div>
                    <div>
                      <code className="bg-white px-2 py-1 rounded font-mono">/</code>
                      <p className="mt-1 text-blue-700">Homepage only</p>
                    </div>
                  </div>
                </div>

                {/* Wildcards Explained */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs font-semibold text-gray-700 mb-2">🎯 Wildcard Guide:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li><strong>*</strong> - Matches anything in one path segment</li>
                    <li><strong>**</strong> - Matches anything across multiple segments</li>
                    <li><strong>!</strong> - Exclude pattern (hide on matching pages)</li>
                  </ul>
                </div>

                {/* Real Examples */}
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs font-semibold text-green-900 mb-2">💡 Real-World Examples:</p>
                  <div className="space-y-2 text-xs text-green-800">
                    <div>
                      <strong>E-commerce:</strong>
                      <pre className="mt-1 bg-white p-2 rounded font-mono text-xs">/products/*{'\n'}!/checkout{'\n'}!/cart</pre>
                    </div>
                    <div>
                      <strong>Blog:</strong>
                      <pre className="mt-1 bg-white p-2 rounded font-mono text-xs">/blog/**{'\n'}/articles/**</pre>
                    </div>
                    <div>
                      <strong>Everywhere except admin:</strong>
                      <pre className="mt-1 bg-white p-2 rounded font-mono text-xs">!/admin/**</pre>
                    </div>
                  </div>
                </div>

                {/* Current Status */}
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs font-semibold text-yellow-900">
                    Current: {urlTargeting.trim() 
                      ? `${urlTargeting.split('\n').filter(s => s.trim()).length} rules configured` 
                      : "All pages (default)"}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {urlTargeting.trim() 
                      ? "⚠️ Widget will only show on matching pages" 
                      : "✅ Widget will show on all pages"}
                  </p>
                </div>
              </div>
            </div>
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
            <div className="p-6 rounded-lg" style={{
              background: 'repeating-conic-gradient(#f3f4f6 0% 25%, #e5e7eb 0% 50%) 50% / 20px 20px'
            }}>
              <h3 className="font-medium text-gray-900 mb-4">Live Widget Preview</h3>
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
                  } p-4 max-w-sm animate-slide-up`}
                  style={{ 
                    backgroundColor: `${bgColor}${Math.round(bgOpacity * 2.55).toString(16).padStart(2, '0')}`,
                    backdropFilter: bgOpacity < 100 ? 'blur(12px)' : 'none',
                    WebkitBackdropFilter: bgOpacity < 100 ? 'blur(12px)' : 'none',
                    border: `1px solid rgba(255, 255, 255, ${bgOpacity / 100 * 0.8})`,
                    borderRadius: `${radius}px`,
                    boxShadow: shadow === 'minimal' 
                      ? '0 6px 20px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)'
                      : shadow === 'bold'
                      ? '0 16px 60px rgba(0,0,0,0.20), 0 8px 30px rgba(0,0,0,0.12)'
                      : '0 10px 40px rgba(0, 0, 0, 0.15), 0 3px 12px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      JD
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{
                        color: (() => {
                          const r = parseInt(bgColor.slice(1, 3), 16);
                          const g = parseInt(bgColor.slice(3, 5), 16);
                          const b = parseInt(bgColor.slice(5, 7), 16);
                          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                          return brightness < 128 && bgOpacity > 50 ? '#ffffff' : '#111827';
                        })()
                      }}>
                        <span className="font-semibold">John Doe</span> from New York
                      </p>
                      <p className="text-xs" style={{
                        color: (() => {
                          const r = parseInt(bgColor.slice(1, 3), 16);
                          const g = parseInt(bgColor.slice(3, 5), 16);
                          const b = parseInt(bgColor.slice(5, 7), 16);
                          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                          return brightness < 128 && bgOpacity > 50 ? '#e5e7eb' : '#6b7280';
                        })()
                      }}>
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

