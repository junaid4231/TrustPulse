"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  ShoppingCart,
  Star,
  Users,
  AlertTriangle,
  Trophy,
  Sparkles,
  Clock,
  MapPin,
  User,
  Package,
  MessageSquare,
  Gift,
} from "lucide-react";
import BehaviorTriggersEditor from "@/components/BehaviorTriggersEditor";

// 5 Notification Types for Market Differentiation
const NOTIFICATION_TYPES = [
  {
    id: "purchase",
    name: "Recent Purchase",
    icon: ShoppingCart,
    color: "blue",
    bgColor: "bg-blue-500",
    borderColor: "border-blue-600",
    bgLight: "bg-blue-50",
    description: "Show recent product purchases",
    example: '"John just purchased Premium Plan"',
  },
  {
    id: "review",
    name: "Customer Review",
    icon: Star,
    color: "amber",
    bgColor: "bg-amber-500",
    borderColor: "border-amber-600",
    bgLight: "bg-amber-50",
    description: "Display testimonials with ratings",
    example: '"Amazing! ⭐⭐⭐⭐⭐"',
  },
  {
    id: "live_activity",
    name: "Live Activity",
    icon: Users,
    color: "purple",
    bgColor: "bg-purple-500",
    borderColor: "border-purple-600",
    bgLight: "bg-purple-50",
    description: "Show active visitors count",
    example: '"23 people viewing now"',
  },
  {
    id: "low_stock",
    name: "Low Stock Alert",
    icon: AlertTriangle,
    color: "red",
    bgColor: "bg-red-500",
    borderColor: "border-red-600",
    bgLight: "bg-red-50",
    description: "Create urgency with scarcity",
    example: '"Only 3 left in stock!"',
  },
  {
    id: "milestone",
    name: "Milestone",
    icon: Trophy,
    color: "green",
    bgColor: "bg-green-500",
    borderColor: "border-green-600",
    bgLight: "bg-green-50",
    description: "Celebrate achievements",
    example: '"Sarah is our 1,000th customer!"',
  },
  {
    id: "reward",
    name: "Scratch Card Reward",
    icon: Gift,
    color: "pink",
    bgColor: "bg-pink-500",
    borderColor: "border-pink-600",
    bgLight: "bg-pink-50",
    description: "Interactive gamification with rewards",
    example: '"🎁 Scratch to reveal your discount!"',
  },
];

const TIME_OPTIONS = [
  { value: "just_now", label: "Just now" },
  { value: "1_min", label: "1 minute ago" },
  { value: "2_min", label: "2 minutes ago" },
  { value: "5_min", label: "5 minutes ago" },
  { value: "10_min", label: "10 minutes ago" },
  { value: "30_min", label: "30 minutes ago" },
  { value: "1_hour", label: "1 hour ago" },
];

export default function NewNotificationPage() {
  const params = useParams();
  const router = useRouter();
  const widgetId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("purchase");

  // Form data for all types
  const [formData, setFormData] = useState({
    // Purchase
    purchaseName: "",
    purchaseLocation: "",
    productName: "",
    purchaseTime: "2_min",
    purchaseEmoji: true,
    purchaseClickUrl: "",

    // Review
    reviewName: "",
    reviewLocation: "",
    reviewText: "",
    reviewRating: 5,
    reviewTime: "2_min",
    reviewEmoji: true,
    reviewClickUrl: "",

    // Live Activity
    visitorCount: 23,
    activityText: "viewing this page now",
    activityTime: "just_now",
    activityEmoji: true,
    activityClickUrl: "",

    // Low Stock
    stockProduct: "",
    stockCount: 3,
    stockTime: "5_min",
    stockEmoji: true,
    stockClickUrl: "",

    // Milestone
    milestoneName: "",
    milestoneLocation: "",
    milestoneNumber: "1,000th",
    milestoneTime: "10_min",
    milestoneEmoji: true,
    milestoneClickUrl: "",

    // Reward/Scratch Card
    rewardMessage: "🎁 Scratch to reveal your exclusive discount!",
    rewardType: "discount_code",
    rewardValue: "20% OFF",
    rewardCode: "PROOF20",
    rewardClickUrl: "",
  });

  const [behaviorTriggers, setBehaviorTriggers] = useState<{
    enabled: boolean;
    trigger_mode: 'any' | 'all';
    triggers: Array<{
      type: 'exit_intent' | 'scroll_depth' | 'time_on_page' | 'inactivity' | 'element_visible';
      enabled: boolean;
      settings: {
        sensitivity?: 'low' | 'medium' | 'high';
        percentage?: number;
        direction?: 'down' | 'up';
        seconds?: number;
        selector?: string;
      };
    }>;
  } | null>(null);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const currentType = NOTIFICATION_TYPES.find((t) => t.id === selectedType)!;

  const getTimeDisplay = (timeValue: string) => {
    const time = TIME_OPTIONS.find((t) => t.value === timeValue);
    return time ? time.label : "2 minutes ago";
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let notificationData: any = {
        widget_id: widgetId,
        type: selectedType,
        is_active: true,
        timestamp: null,
      };

      switch (selectedType) {
        case "purchase":
          notificationData = {
            ...notificationData,
            name: formData.purchaseName,
            location: formData.purchaseLocation || null,
            message: `purchased ${formData.productName}`,
            product_name: formData.productName,
            time_ago: formData.purchaseTime,
            use_emoji: formData.purchaseEmoji,
            click_url: formData.purchaseClickUrl.trim() || null,
          };
          break;
        case "review":
          notificationData = {
            ...notificationData,
            name: formData.reviewName,
            location: formData.reviewLocation || null,
            message: formData.reviewText,
            rating: formData.reviewRating,
            time_ago: formData.reviewTime,
            use_emoji: formData.reviewEmoji,
            click_url: formData.reviewClickUrl.trim() || null,
          };
          break;
        case "live_activity":
          notificationData = {
            ...notificationData,
            message: `${formData.visitorCount} people ${formData.activityText}`,
            visitor_count: formData.visitorCount,
            time_ago: formData.activityTime,
            use_emoji: formData.activityEmoji,
            click_url: formData.activityClickUrl.trim() || null,
          };
          break;
        case "low_stock":
          notificationData = {
            ...notificationData,
            message: `Only ${formData.stockCount} left in stock!`,
            product_name: formData.stockProduct,
            stock_count: formData.stockCount,
            time_ago: formData.stockTime,
            use_emoji: formData.stockEmoji,
            click_url: formData.stockClickUrl.trim() || null,
          };
          break;
        case "milestone":
          notificationData = {
            ...notificationData,
            name: formData.milestoneName,
            location: formData.milestoneLocation || null,
            message: `is our ${formData.milestoneNumber} customer!`,
            milestone_text: formData.milestoneNumber,
            time_ago: formData.milestoneTime,
            use_emoji: formData.milestoneEmoji,
            click_url: formData.milestoneClickUrl.trim() || null,
          };
          break;
        case "reward":
          notificationData = {
            ...notificationData,
            message: formData.rewardMessage,
            reward_type: formData.rewardType,
            reward_value: formData.rewardValue,
            reward_code: formData.rewardCode,
            click_url: formData.rewardClickUrl.trim() || null,
            time_ago: null, // Rewards don't show time
            use_emoji: false,
          };
          break;
      }

      console.log("Creating notification with data:", notificationData);

      // Add behavior triggers if configured
      notificationData.behavior_triggers = behaviorTriggers;

      const { error: insertError } = await supabase
        .from("notifications")
        .insert([notificationData]);

      if (insertError) throw insertError;

      router.push(`/dashboard/widgets/${widgetId}/notifications`);
    } catch (err: any) {
      setError(err.message || "Failed to create notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <Link
          href={`/dashboard/widgets/${widgetId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Widget
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-8 rounded-t-2xl">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Create Notification</h1>
            </div>
            <p className="text-blue-100 text-lg">
              Choose from 5 powerful notification types to boost conversions
            </p>
          </div>

          {error && (
            <div className="mx-8 mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleCreate} className="p-8">
            {/* Type Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Step 1: Choose Notification Type</h2>
              <p className="text-gray-600 mb-4">Select the type that best fits your marketing goal</p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {NOTIFICATION_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        isSelected ? `${type.borderColor} ${type.bgLight} shadow-lg scale-105` : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className={`w-12 h-12 ${type.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="font-bold text-sm mb-1">{type.name}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-3 italic">💡 Example: {currentType.example}</p>
            </div>

            {/* Dynamic Form Fields */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Step 2: Configure Details</h2>
              <p className="text-gray-600 mb-4">Fill in the information for your notification</p>

              <div className={`${currentType.bgLight} rounded-xl p-6 space-y-5`}>
                {/* PURCHASE FORM */}
                {selectedType === "purchase" && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"><User className="w-4 h-4" />Customer Name <span className="text-red-500">*</span></label>
                        <input type="text" value={formData.purchaseName} onChange={(e) => updateField("purchaseName", e.target.value)} placeholder="John Doe" required className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"><MapPin className="w-4 h-4" />Location <span className="text-xs text-gray-500">(optional)</span></label>
                        <input type="text" value={formData.purchaseLocation} onChange={(e) => updateField("purchaseLocation", e.target.value)} placeholder="New York" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"><Package className="w-4 h-4" />Product Name <span className="text-red-500">*</span></label>
                        <input type="text" value={formData.productName} onChange={(e) => updateField("productName", e.target.value)} placeholder="Premium Plan" required className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"><Clock className="w-4 h-4" />Time Display <span className="text-red-500">*</span></label>
                        <select value={formData.purchaseTime} onChange={(e) => updateField("purchaseTime", e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          {TIME_OPTIONS.map((time) => (
                            <option key={time.value} value={time.value}>{time.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        Click URL <span className="text-xs text-gray-500">(optional)</span>
                      </label>
                      <input 
                        type="text" 
                        value={formData.purchaseClickUrl} 
                        onChange={(e) => updateField("purchaseClickUrl", e.target.value)} 
                        placeholder="/products/premium-plan or https://yoursite.com/product" 
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      />
                      <p className="text-xs text-gray-500 mt-1">💡 Where to redirect when notification is clicked (leave empty for non-clickable)</p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🛒</span>
                        <div>
                          <div className="font-semibold text-gray-900">Use Emoji</div>
                          <div className="text-sm text-gray-600">Increases engagement</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.purchaseEmoji} onChange={(e) => updateField("purchaseEmoji", e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </>
                )}

                {/* REVIEW FORM */}
                {selectedType === "review" && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"><User className="w-4 h-4" />Customer Name <span className="text-red-500">*</span></label>
                        <input type="text" value={formData.reviewName} onChange={(e) => updateField("reviewName", e.target.value)} placeholder="Sarah Johnson" required className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"><MapPin className="w-4 h-4" />Location <span className="text-xs text-gray-500">(optional)</span></label>
                        <input type="text" value={formData.reviewLocation} onChange={(e) => updateField("reviewLocation", e.target.value)} placeholder="California" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"><MessageSquare className="w-4 h-4" />Review Text <span className="text-red-500">*</span></label>
                      <textarea value={formData.reviewText} onChange={(e) => updateField("reviewText", e.target.value)} placeholder="Amazing product! Really helped my business grow..." required rows={4} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Star Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" onClick={() => updateField("reviewRating", star)} className="focus:outline-none transition-transform hover:scale-110">
                              <Star className={`w-8 h-8 ${star <= formData.reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            </button>
                          ))}
                          <span className="ml-2 text-sm text-gray-600 self-center font-medium">{formData.reviewRating} out of 5</span>
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"><Clock className="w-4 h-4" />Time Display <span className="text-red-500">*</span></label>
                        <select value={formData.reviewTime} onChange={(e) => updateField("reviewTime", e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                          {TIME_OPTIONS.map((time) => (
                            <option key={time.value} value={time.value}>{time.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        Click URL <span className="text-xs text-gray-500">(optional)</span>
                      </label>
                      <input 
                        type="text" 
                        value={formData.reviewClickUrl} 
                        onChange={(e) => updateField("reviewClickUrl", e.target.value)} 
                        placeholder="/products/premium-plan or https://yoursite.com/product" 
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                      />
                      <p className="text-xs text-gray-500 mt-1">💡 Where to redirect when notification is clicked (leave empty for non-clickable)</p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Use emoji</p>
                        <p className="text-xs text-gray-600 mt-0.5">Show ⭐ icon in notification</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.reviewEmoji} onChange={(e) => updateField("reviewEmoji", e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>
                  </>
                )}

                {/* LIVE ACTIVITY FORM */}
                {selectedType === "live_activity" && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"><Users className="w-4 h-4" />Number of Visitors <span className="text-red-500">*</span></label>
                        <input type="number" value={formData.visitorCount} onChange={(e) => updateField("visitorCount", parseInt(e.target.value) || 0)} min="1" max="999" required className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"><Clock className="w-4 h-4" />Time Display <span className="text-red-500">*</span></label>
                        <select value={formData.activityTime} onChange={(e) => updateField("activityTime", e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                          {TIME_OPTIONS.map((time) => (
                            <option key={time.value} value={time.value}>{time.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"><MessageSquare className="w-4 h-4" />Activity Text <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.activityText} onChange={(e) => updateField("activityText", e.target.value)} placeholder="viewing this page now" required className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                      <p className="text-xs text-gray-500 mt-1">Examples: "viewing this page now", "are shopping right now", "signed up today"</p>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        Click URL <span className="text-xs text-gray-500">(optional)</span>
                      </label>
                      <input 
                        type="text" 
                        value={formData.activityClickUrl} 
                        onChange={(e) => updateField("activityClickUrl", e.target.value)} 
                        placeholder="/products/premium-plan or https://yoursite.com/product" 
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                      />
                      <p className="text-xs text-gray-500 mt-1">💡 Where to redirect when notification is clicked (leave empty for non-clickable)</p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Use emoji</p>
                        <p className="text-xs text-gray-600 mt-0.5">Show 👁️ icon in notification</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.activityEmoji} onChange={(e) => updateField("activityEmoji", e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </>
                )}

                {/* LOW STOCK FORM */}
                {selectedType === "low_stock" && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"><Package className="w-4 h-4" />Product Name <span className="text-red-500">*</span></label>
                        <input type="text" value={formData.stockProduct} onChange={(e) => updateField("stockProduct", e.target.value)} placeholder="Premium Plan" required className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"><AlertTriangle className="w-4 h-4" />Items Remaining <span className="text-red-500">*</span></label>
                        <input type="number" value={formData.stockCount} onChange={(e) => updateField("stockCount", parseInt(e.target.value) || 0)} min="1" max="99" required className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"><Clock className="w-4 h-4" />Time Display <span className="text-red-500">*</span></label>
                      <select value={formData.stockTime} onChange={(e) => updateField("stockTime", e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                        {TIME_OPTIONS.map((time) => (
                          <option key={time.value} value={time.value}>{time.label}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Lower numbers (1-10) create stronger urgency</p>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        Click URL <span className="text-xs text-gray-500">(optional)</span>
                      </label>
                      <input 
                        type="text" 
                        value={formData.stockClickUrl} 
                        onChange={(e) => updateField("stockClickUrl", e.target.value)} 
                        placeholder="/products/premium-plan or https://yoursite.com/product" 
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                      />
                      <p className="text-xs text-gray-500 mt-1">💡 Where to redirect when notification is clicked (leave empty for non-clickable)</p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Use emoji</p>
                        <p className="text-xs text-gray-600 mt-0.5">Show ⚠️ icon in notification</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.stockEmoji} onChange={(e) => updateField("stockEmoji", e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </>
                )}

                {/* MILESTONE FORM */}
                {selectedType === "milestone" && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"><User className="w-4 h-4" />Customer Name <span className="text-red-500">*</span></label>
                        <input type="text" value={formData.milestoneName} onChange={(e) => updateField("milestoneName", e.target.value)} placeholder="Sarah" required className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"><MapPin className="w-4 h-4" />Location <span className="text-xs text-gray-500">(optional)</span></label>
                        <input type="text" value={formData.milestoneLocation} onChange={(e) => updateField("milestoneLocation", e.target.value)} placeholder="Texas" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"><Trophy className="w-4 h-4" />Milestone Number <span className="text-red-500">*</span></label>
                        <input type="text" value={formData.milestoneNumber} onChange={(e) => updateField("milestoneNumber", e.target.value)} placeholder="1,000th" required className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                        <p className="text-xs text-gray-500 mt-1">Examples: "1,000th", "500th", "10,000th"</p>
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"><Clock className="w-4 h-4" />Time Display <span className="text-red-500">*</span></label>
                        <select value={formData.milestoneTime} onChange={(e) => updateField("milestoneTime", e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                          {TIME_OPTIONS.map((time) => (
                            <option key={time.value} value={time.value}>{time.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        Click URL <span className="text-xs text-gray-500">(optional)</span>
                      </label>
                      <input 
                        type="text" 
                        value={formData.milestoneClickUrl} 
                        onChange={(e) => updateField("milestoneClickUrl", e.target.value)} 
                        placeholder="/products/premium-plan or https://yoursite.com/product" 
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                      />
                      <p className="text-xs text-gray-500 mt-1">💡 Where to redirect when notification is clicked (leave empty for non-clickable)</p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Use emoji</p>
                        <p className="text-xs text-gray-600 mt-0.5">Show 🎉 icon in notification</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.milestoneEmoji} onChange={(e) => updateField("milestoneEmoji", e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  </>
                )}

                {/* REWARD/SCRATCH CARD FORM */}
                {selectedType === "reward" && (
                  <>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                        <MessageSquare className="w-4 h-4" />
                        Scratch Card Message <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={formData.rewardMessage} 
                        onChange={(e) => updateField("rewardMessage", e.target.value)} 
                        placeholder="🎁 Scratch to reveal your exclusive discount!" 
                        required 
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" 
                      />
                      <p className="text-xs text-gray-500 mt-1">This text appears before scratching</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                          <Gift className="w-4 h-4" />
                          Reward Type <span className="text-red-500">*</span>
                        </label>
                        <select 
                          value={formData.rewardType} 
                          onChange={(e) => updateField("rewardType", e.target.value)} 
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        >
                          <option value="discount_code">Discount Code</option>
                          <option value="free_shipping">Free Shipping</option>
                          <option value="gift">Free Gift</option>
                          <option value="points">Loyalty Points</option>
                        </select>
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                          <Package className="w-4 h-4" />
                          Reward Value <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          value={formData.rewardValue} 
                          onChange={(e) => updateField("rewardValue", e.target.value)} 
                          placeholder="20% OFF" 
                          required 
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" 
                        />
                        <p className="text-xs text-gray-500 mt-1">Display text (e.g., "20% OFF", "FREE")</p>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                        Discount Code <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={formData.rewardCode} 
                        onChange={(e) => updateField("rewardCode", e.target.value.toUpperCase())} 
                        placeholder="PROOF20" 
                        required 
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono" 
                      />
                      <p className="text-xs text-gray-500 mt-1">Code users will copy (auto-uppercase)</p>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        Redirect URL <span className="text-xs text-gray-500">(optional)</span>
                      </label>
                      <input 
                        type="text" 
                        value={formData.rewardClickUrl} 
                        onChange={(e) => updateField("rewardClickUrl", e.target.value)} 
                        placeholder="/checkout or https://yoursite.com/shop" 
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" 
                      />
                      <p className="text-xs text-gray-500 mt-1">Where to send users after scratching (leave empty for no redirect)</p>
                    </div>

                    <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">🎰</div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 mb-1">How Scratch Cards Work:</p>
                          <ul className="text-xs text-gray-700 space-y-1">
                            <li>✅ Visitors swipe/click to scratch and reveal the reward</li>
                            <li>✅ Confetti animation on reveal for excitement</li>
                            <li>✅ One-time per visitor (tracked via browser)</li>
                            <li>✅ Copy-to-clipboard button for easy code copying</li>
                            <li>✅ Tracks scratches and code copies in analytics</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* LIVE PREVIEW */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Step 3: Preview Your Notification</h2>
              <p className="text-gray-600 mb-4">See exactly how it will appear on your website</p>

              <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
                </div>

                <div className="relative">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="ml-4 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-white/60 text-sm">🌐 yourwebsite.com</div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-12 border border-white/10 min-h-[250px] flex items-center justify-center">
                    {/* PURCHASE PREVIEW */}
                    {selectedType === "purchase" && (
                      <div className="bg-white rounded-xl shadow-2xl p-5 max-w-sm w-full">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-lg">
                            {formData.purchaseName ? formData.purchaseName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "JD"}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {formData.purchaseName || "John Doe"}
                              {formData.purchaseLocation && (
                                <span className="font-normal text-gray-600"> from {formData.purchaseLocation}</span>
                              )}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              {formData.purchaseEmoji && "🛒 "}
                              just purchased {formData.productName || "Premium Plan"}
                            </p>
                            <div className="flex items-center gap-1.5 mt-2">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <p className="text-xs text-gray-500">{getTimeDisplay(formData.purchaseTime)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* REVIEW PREVIEW */}
                    {selectedType === "review" && (
                      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-lg">
                            {formData.reviewName
                              ? formData.reviewName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                              : "SJ"}
                          </div>
                          <div className="flex-1">
                            <div className="flex gap-0.5 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < formData.reviewRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-gray-700 italic mb-2">
                              {formData.reviewEmoji && "⭐ "}"{formData.reviewText || "Amazing product! Highly recommend."}"
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formData.reviewName || "Sarah Johnson"}
                              {formData.reviewLocation && (
                                <span className="font-normal text-gray-600">, {formData.reviewLocation}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* LIVE ACTIVITY PREVIEW */}
                    {selectedType === "live_activity" && (
                      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                            {formData.activityEmoji ? <span className="text-2xl">👥</span> : <Users className="w-7 h-7 text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-lg font-bold text-gray-900">
                              {formData.activityEmoji && "👁️ "}{formData.visitorCount} people {formData.activityText}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* LOW STOCK PREVIEW */}
                    {selectedType === "low_stock" && (
                      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                            {formData.stockEmoji ? <span className="text-2xl">⚠️</span> : <AlertTriangle className="w-7 h-7 text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">
                              {formData.stockEmoji && "⚠️ "}Only {formData.stockCount} left in stock!
                            </p>
                            {formData.stockProduct && (
                              <p className="text-sm text-gray-600 mt-1">{formData.stockProduct}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MILESTONE PREVIEW */}
                    {selectedType === "milestone" && (
                      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-lg">
                            {formData.milestoneName
                              ? formData.milestoneName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                              : "SJ"}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">
                              {formData.milestoneEmoji && "🎉 "}{formData.milestoneName || "Sarah"} is our {formData.milestoneNumber} customer!
                            </p>
                            {formData.milestoneLocation && (
                              <p className="text-xs text-gray-600 mt-1">from {formData.milestoneLocation}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* REWARD/SCRATCH CARD PREVIEW */}
                    {selectedType === "reward" && (
                      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
                        <div className="text-center">
                          <div className="text-4xl mb-3">🎁</div>
                          <p className="text-base font-semibold text-gray-900 mb-4">
                            {formData.rewardMessage || "🎁 Scratch to reveal your exclusive discount!"}
                          </p>
                          <div className="relative bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl p-8 mb-4 border-2 border-dashed border-gray-400">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-pink-600 mb-1">{formData.rewardValue || "20% OFF"}</p>
                                <p className="text-xs text-gray-600">Code: <span className="font-mono font-bold">{formData.rewardCode || "PROOF20"}</span></p>
                              </div>
                            </div>
                            <div className="relative z-10 opacity-50">
                              <p className="text-gray-500 font-bold text-lg">SCRATCH HERE</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">👆 Swipe to scratch (interactive on live site)</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-center text-white/60 text-sm mt-4">
                    ✨ This is exactly how your notification will appear
                  </p>
                </div>
              </div>
            </div>

            {/* BEHAVIOR TRIGGERS SECTION */}
            <div className="pt-8 border-t border-gray-200">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  🎯 Behavior Triggers
                  <span className="text-xs font-normal bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    Optional
                  </span>
                </h3>
                <p className="text-sm text-gray-600">
                  Control when this notification appears based on user behavior. Show at the perfect moment for maximum impact!
                </p>
              </div>
              <BehaviorTriggersEditor
                value={behaviorTriggers}
                onChange={setBehaviorTriggers}
              />
            </div>

            {/* SUBMIT BUTTONS */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Create Notification
                  </>
                )}
              </button>
              <Link
                href={`/dashboard/widgets/${widgetId}`}
                className="px-8 py-4 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 font-bold text-lg text-center transition-all"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* PRO TIPS */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-2xl mb-2">💡</div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Mix Notification Types</h4>
            <p className="text-xs text-gray-600">Use different types to keep your content fresh and engaging</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Use Real Data</h4>
            <p className="text-xs text-gray-600">Authentic information builds more trust than fake numbers</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Test & Optimize</h4>
            <p className="text-xs text-gray-600">Create 5-10 notifications and monitor which ones perform best</p>
          </div>
        </div>
      </div>
    </div>
  );
}
