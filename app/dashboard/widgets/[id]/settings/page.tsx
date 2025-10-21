"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Palette,
  Copy,
  Save,
  Code,
  Clock,
} from "lucide-react";

export default function WidgetSettingsPage() {
  const params = useParams();
  const widgetId = params.id as string;

  const [primaryColor, setPrimaryColor] = useState<string>("#3B82F6");
  const [radius, setRadius] = useState<number>(14);
  const [shadow, setShadow] = useState<"minimal" | "medium" | "bold">("medium");
  const [anim, setAnim] = useState<"subtle" | "standard" | "vivid">("standard");
  
  // Timing controls
  const [duration, setDuration] = useState<number>(6);
  const [gap, setGap] = useState<number>(2);
  const [startDelay, setStartDelay] = useState<number>(2);
  const [loop, setLoop] = useState<boolean>(true);
  const [shuffle, setShuffle] = useState<boolean>(false);
  
  // Background customization
  const [bgColor, setBgColor] = useState<string>("#FFFFFF");
  const [bgOpacity, setBgOpacity] = useState<number>(100);
  
  // Device targeting
  const [deviceTargeting, setDeviceTargeting] = useState<string[]>([]);
  
  // URL targeting
  const [urlTargeting, setUrlTargeting] = useState<string>("");
  
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load existing widget settings + theme preference
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("widgets")
          .select("primary_color, radius, shadow, anim, duration, gap, start_delay, loop, shuffle, bg_color, bg_opacity, device_targeting, url_targeting")
          .eq("id", widgetId)
          .single();
        if (data?.primary_color) setPrimaryColor(data.primary_color);
        if (data?.radius != null) setRadius(data.radius);
        if (data?.shadow) setShadow(data.shadow);
        if (data?.anim) setAnim(data.anim);
        if (data?.duration != null) setDuration(data.duration);
        if (data?.gap != null) setGap(data.gap);
        if (data?.start_delay != null) setStartDelay(data.start_delay);
        if (data?.loop != null) setLoop(data.loop);
        if (data?.shuffle != null) setShuffle(data.shuffle);
        if (data?.bg_color) setBgColor(data.bg_color);
        if (data?.bg_opacity != null) setBgOpacity(data.bg_opacity);
        if (data?.device_targeting) setDeviceTargeting(data.device_targeting);
        if (data?.url_targeting) setUrlTargeting(data.url_targeting.join('\n'));
      } catch {}
    })();
  }, [widgetId]);

  const previewStyle = useMemo(() => ({
    borderRadius: `${radius}px`,
    boxShadow:
      shadow === "minimal"
        ? "0 6px 20px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)"
        : shadow === "bold"
        ? "0 16px 60px rgba(0,0,0,0.20), 0 8px 30px rgba(0,0,0,0.12)"
        : "0 10px 40px rgba(0, 0, 0, 0.15), 0 3px 12px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255,255,255,0.8)",
  }), [radius, shadow]);

  const embedSnippet = useMemo(() => {
    return (
`<script
  src="https://proofpulse.vercel.app/widget/widget.js"
  data-widget="${widgetId}"
  data-color="${primaryColor}"
  data-anim="${anim}"
  data-radius="${radius}"
  data-shadow="${shadow}"
></script>`
    );
  }, [widgetId, primaryColor, anim, radius, shadow]);

  const copyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const save = async () => {
    setSaving(true);
    try {
      console.log("💾 Saving device_targeting:", deviceTargeting);
      const updateData = { 
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
        url_targeting: urlTargeting.trim() ? urlTargeting.split('\n').map(s => s.trim()).filter(Boolean) : null
      };
      console.log("💾 Full update data:", updateData);
      
      // Persist all customization settings
      const { error } = await supabase
        .from("widgets")
        .update(updateData)
        .eq("id", widgetId);
      if (error) {
        console.error("❌ Save error:", error);
        throw error;
      }
      console.log("✅ Save successful!");
      
      // Verify it was saved
      const { data: verifyData } = await supabase
        .from("widgets")
        .select("device_targeting")
        .eq("id", widgetId)
        .single();
      console.log("🔍 Verified device_targeting in DB:", verifyData?.device_targeting);
    } catch (e) {
      // no-op for now; could add a toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-5xl mx-auto px-4 text-gray-900">
        <Link
          href={`/dashboard/widgets/${widgetId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Widget
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Palette className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Edit Widget</h1>
          </div>
          <p className="text-blue-100 text-lg">Customize your widget's appearance and behavior</p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Branding Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold">Brand Colors</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">Customize your widget's primary color</p>
              <div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-14 h-10 p-0 bg-transparent border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#3B82F6"
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg font-mono text-sm"
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <p className="text-xs text-gray-500 w-full mb-2">Quick presets:</p>
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
            </div>

            {/* Background Customization Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold">Notification Background</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">Customize notification background color and transparency</p>
              <div className="space-y-4">
                {/* Background Color */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Background Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-14 h-10 p-0 bg-transparent border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      placeholder="#FFFFFF"
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg font-mono text-sm"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <p className="text-xs text-gray-500 w-full mb-1">Color presets:</p>
                    {[
                      { name: 'White', color: '#FFFFFF' },
                      { name: 'Black', color: '#000000' },
                      { name: 'Blue', color: '#3B82F6' },
                      { name: 'Purple', color: '#9333EA' },
                      { name: 'Green', color: '#10B981' },
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
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900 mb-2">✨ Popular Styles:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => { setBgColor('#FFFFFF'); setBgOpacity(100); }}
                        className="px-2 py-1 text-xs bg-white border border-blue-300 rounded hover:bg-blue-50"
                      >
                        Classic White
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBgColor('#FFFFFF'); setBgOpacity(85); }}
                        className="px-2 py-1 text-xs bg-white border border-blue-300 rounded hover:bg-blue-50"
                      >
                        Frosted Glass
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBgColor('#000000'); setBgOpacity(90); }}
                        className="px-2 py-1 text-xs bg-gray-900 text-white border border-blue-300 rounded hover:bg-gray-800"
                      >
                        Dark Mode
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBgColor('#3B82F6'); setBgOpacity(95); }}
                        className="px-2 py-1 text-xs bg-blue-600 text-white border border-blue-300 rounded hover:bg-blue-700"
                      >
                        Subtle Blue
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Opacity Slider */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Opacity: <span className="font-semibold text-gray-900">{bgOpacity}%</span>
                  </label>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    step={1}
                    value={bgOpacity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setBgOpacity(val);
                      }
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(bgOpacity - 20) / 0.8}%, #E5E7EB ${(bgOpacity - 20) / 0.8}%, #E5E7EB 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Very Transparent (20%)</span>
                    <span>Solid (100%)</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Lower opacity creates a glass effect with backdrop blur. Minimum 20% for readability.</p>
                  {bgOpacity < 50 && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                      ⚠️ Very low opacity may make text hard to read on some backgrounds
                    </div>
                  )}
                </div>

                {/* Preview Box */}
                <div className="p-4 rounded-lg" style={{
                  background: 'repeating-conic-gradient(#f3f4f6 0% 25%, #e5e7eb 0% 50%) 50% / 20px 20px'
                }}>
                  <p className="text-xs text-gray-700 mb-2 font-semibold">Live Preview:</p>
                  <div 
                    className="p-4 rounded-lg border shadow-lg"
                    style={{
                      backgroundColor: `${bgColor}${Math.round(bgOpacity * 2.55).toString(16).padStart(2, '0')}`,
                      backdropFilter: bgOpacity < 100 ? 'blur(12px)' : 'none',
                      WebkitBackdropFilter: bgOpacity < 100 ? 'blur(12px)' : 'none',
                      borderColor: 'rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        JD
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ 
                          color: (() => {
                            const r = parseInt(bgColor.slice(1, 3), 16);
                            const g = parseInt(bgColor.slice(3, 5), 16);
                            const b = parseInt(bgColor.slice(5, 7), 16);
                            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                            return brightness < 128 && bgOpacity > 50 ? '#ffffff' : '#111827';
                          })()
                        }}>
                          John Doe
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
                          just purchased Premium Plan
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    💡 Opacity: <strong>{bgOpacity}%</strong> {bgOpacity < 100 && '(Glass effect enabled)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Style Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-pink-600" />
                <h2 className="text-lg font-bold">Visual Style</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">Fine-tune your widget's appearance</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Border Radius (px)</label>
                  <input
                    type="range"
                    min={0}
                    max={32}
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value) || 0)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0px</span>
                    <span className="font-semibold text-gray-900">{radius}px</span>
                    <span>32px</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Shadow Style</label>
                  <select
                    value={shadow}
                    onChange={(e) => setShadow(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg"
                  >
                    <option value="minimal">Minimal - Subtle elevation</option>
                    <option value="medium">Medium - Balanced depth</option>
                    <option value="bold">Bold - Strong presence</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Animation Style</label>
                  <select
                    value={anim}
                    onChange={(e) => setAnim(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg"
                  >
                    <option value="subtle">Subtle - Gentle motion</option>
                    <option value="standard">Standard - Balanced animation</option>
                    <option value="vivid">Vivid - Eye-catching effects</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Timing & Behavior Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-bold">Timing & Behavior</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">Control how notifications appear and cycle</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Display Duration (seconds)</label>
                  <input
                    type="range"
                    min={3}
                    max={30}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 6)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>3s</span>
                    <span className="font-semibold text-gray-900">{duration}s</span>
                    <span>30s</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">How long each notification stays visible</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Gap Between Notifications (seconds)</label>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    value={gap}
                    onChange={(e) => setGap(parseInt(e.target.value) || 2)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1s</span>
                    <span className="font-semibold text-gray-900">{gap}s</span>
                    <span>60s</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Pause between each notification</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Start Delay (seconds)</label>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={startDelay}
                    onChange={(e) => setStartDelay(parseInt(e.target.value) || 2)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0s</span>
                    <span className="font-semibold text-gray-900">{startDelay}s</span>
                    <span>10s</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Delay before first notification appears</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Loop Notifications</p>
                    <p className="text-xs text-gray-600 mt-0.5">Keep cycling through notifications infinitely</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={loop}
                      onChange={(e) => setLoop(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Shuffle Order</p>
                    <p className="text-xs text-gray-600 mt-0.5">Randomize notification display order</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shuffle}
                      onChange={(e) => setShuffle(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-900">💡 Total cycle time: <strong>{duration + gap}s per notification</strong></p>
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
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs text-blue-900 font-semibold">
                      Current Selection: {deviceTargeting.length === 0 
                        ? "All devices (default)" 
                        : deviceTargeting.join(", ")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {deviceTargeting.length === 0 
                        ? "✅ Widget will show on all devices" 
                        : `⚠️ Widget will ONLY show on: ${deviceTargeting.join(", ")}`}
                    </p>
                  </div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                  />
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                      📖 View Pattern Guide & Examples
                    </summary>
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
                    </div>
                  </details>

                  {/* Current Status */}
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
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

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4">Actions</h2>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold inline-flex items-center justify-center gap-2 transition-all"
                >
                  <Save className="w-5 h-5" /> {saving ? "Saving Changes..." : "Save Settings"}
                </button>
                <button
                  type="button"
                  onClick={copyEmbed}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 font-semibold inline-flex items-center justify-center gap-2 transition-all"
                >
                  <Copy className="w-5 h-5" /> {copied ? "✓ Copied!" : "Copy Embed Code"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-bold mb-4">Live Preview</h2>
              <div
                className="p-5 bg-white rounded-xl border border-gray-200"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.96) 100%)",
                }}
              >
                <div
                  style={previewStyle as any}
                  className="relative max-w-sm w-full mx-auto p-4"
                >
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)` }} />
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: primaryColor }}>JD</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">John Doe <span className="font-normal text-gray-500">from New York</span></p>
                      <p className="text-sm text-gray-700 mt-0.5">🛒 just purchased Premium Plan</p>
                      <div className="mt-1 text-xs text-gray-500">2 minutes ago</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-2">Embed Code</h3>
                <div className="relative">
                  <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-64"><code>{embedSnippet}</code></pre>
                  <button
                    type="button"
                    onClick={copyEmbed}
                    className="absolute top-2 right-2 px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs"
                  >
                    {copied ? "✓" : "Copy"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Paste this code before the closing &lt;/body&gt; tag on your website.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
