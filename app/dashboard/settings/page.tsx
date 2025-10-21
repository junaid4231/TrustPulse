"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Save,
  User,
  Lock,
  Bell,
  Code,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Gift,
  Copy,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [showWidgetId, setShowWidgetId] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form states
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    new_password: "",
    confirm_password: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    widget_alerts: true,
    weekly_reports: true,
    marketing_emails: false,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Auth error:", userError);
        router.push("/login");
        return;
      }

      console.log("Loaded user:", user);
      setUser(user);

      // Set form data from auth user
      setProfileData({
        full_name: user.user_metadata?.full_name || "",
        email: user.email || "",
      });

      // Load profile settings from database
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      console.log("Profile data:", profileData);
      console.log("Profile error:", profileError);

      if (profileData) {
        // Update notification settings from database
        setNotificationSettings({
          email_notifications: profileData.email_notifications ?? true,
          widget_alerts: profileData.widget_alerts ?? true,
          weekly_reports: profileData.weekly_reports ?? true,
          marketing_emails: profileData.marketing_emails ?? false,
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      console.log("Updating profile with:", profileData.full_name);

      // Step 1: Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: profileData.full_name },
      });

      if (authError) {
        console.error("Auth update error:", authError);
        throw authError;
      }

      console.log("Auth metadata updated successfully");

      // Step 2: Update profiles table using UPDATE with WHERE clause
      const { error: profileError, data: updatedData } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select();

      console.log("Profile update result:", { profileError, updatedData });

      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }

      showMessage("success", "Profile updated successfully!");

      // Reload user data to reflect changes
      await loadUserData();
    } catch (error: any) {
      console.error("Profile update failed:", error);
      showMessage(
        "error",
        error.message || "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (passwordData.new_password !== passwordData.confirm_password) {
        throw new Error("Passwords don't match");
      }

      if (passwordData.new_password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordData.new_password,
      });

      if (error) throw error;

      setPasswordData({
        new_password: "",
        confirm_password: "",
      });

      showMessage("success", "Password updated successfully!");
    } catch (error: any) {
      showMessage("error", error.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          email_notifications: notificationSettings.email_notifications,
          widget_alerts: notificationSettings.widget_alerts,
          weekly_reports: notificationSettings.weekly_reports,
          marketing_emails: notificationSettings.marketing_emails,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      showMessage("success", "Notification preferences updated!");
    } catch (error: any) {
      showMessage("error", error.message || "Failed to update notifications");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      showMessage("error", "Failed to copy to clipboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load user data</p>
        </div>
      </div>
    );
  }

  const widgetScript = `<script src="${
    typeof window !== "undefined" ? window.location.origin : ""
  }/widget/widget.js" data-widget-id="${user.id}"></script>`;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Profile Information
            </h2>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.full_name}
                onChange={(e) =>
                  setProfileData({ ...profileData, full_name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed for security reasons
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Password Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Change Password
            </h2>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    new_password: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new password"
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 6 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirm_password: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm new password"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={
                saving ||
                !passwordData.new_password ||
                !passwordData.confirm_password
              }
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Lock className="w-4 h-4" />
              {saving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Widget Installation - IMPROVED */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Code className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Widget Installation
              </h2>
              <p className="text-sm text-gray-600">
                Add ProofPulse to your website
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Widget ID */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  1
                </div>
                <h3 className="font-semibold text-gray-900">
                  Your Widget ID (for reference)
                </h3>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showWidgetId ? "text" : "password"}
                    value={user.id}
                    readOnly
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWidgetId(!showWidgetId)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showWidgetId ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(user.id, "widget-id")}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  {copiedItem === "widget-id" ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This is your unique identifier. Keep it safe - it's needed for
                the widget to work.
              </p>
            </div>

            {/* Step 2: Installation Code */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  2
                </div>
                <h3 className="font-semibold text-gray-900">
                  Copy Installation Code
                </h3>
              </div>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                  <code>{widgetScript}</code>
                </pre>
                <button
                  type="button"
                  onClick={() => copyToClipboard(widgetScript, "widget-script")}
                  className="absolute top-3 right-3 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm flex items-center gap-2 transition-colors"
                >
                  {copiedItem === "widget-script" ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step 3: Instructions */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  3
                </div>
                <h3 className="font-semibold text-gray-900">
                  Add to Your Website
                </h3>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 mb-3 font-medium">
                  Paste before the closing &lt;/body&gt; tag:
                </p>
                <div className="space-y-2 text-sm text-blue-800">
                  <p className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>
                      <strong>HTML/Static:</strong> Add to index.html
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>
                      <strong>WordPress:</strong> Use "Insert Headers and
                      Footers" plugin
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>
                      <strong>Shopify:</strong> Edit theme.liquid file
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>
                      <strong>Webflow/Wix:</strong> Add in custom code settings
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-900 mb-2 font-medium">
                Need help installing?
              </p>
              <p className="text-sm text-purple-800 mb-3">
                Contact support for installation assistance.
              </p>
              <a
                href="mailto:proofpulse.official@gmail.com"
                className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Notification Preferences
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                key: "email_notifications",
                title: "Email Notifications",
                description: "Important account updates and alerts",
              },
              {
                key: "widget_alerts",
                title: "Widget Alerts",
                description: "Notifications about widget activity",
              },
              {
                key: "weekly_reports",
                title: "Weekly Reports",
                description: "Analytics summaries every week",
              },
              {
                key: "marketing_emails",
                title: "Product Updates",
                description: "New features and improvements",
              },
            ].map((setting) => (
              <div
                key={setting.key}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{setting.title}</h3>
                  <p className="text-sm text-gray-600">{setting.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      notificationSettings[
                        setting.key as keyof typeof notificationSettings
                      ]
                    }
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        [setting.key]: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}

            <button
              type="button"
              onClick={handleNotificationUpdate}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Bell className="w-4 h-4" />
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </div>

        {/* Beta Status */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-sm border-2 border-blue-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Beta Tester Status
              </h2>
              <p className="text-sm text-gray-600">
                Thank you for being an early adopter! 🎉
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-blue-200 mb-4">
            <div className="flex items-start gap-3">
              <Gift className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Your Benefits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                  {[
                    "Unlimited widgets",
                    "Unlimited notifications",
                    "No branding",
                    "Priority support",
                    "Early feature access",
                    "50% lifetime discount",
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💙 Early Adopter Benefit:</strong> Keep these features
              forever with your loyalty discount when we launch paid plans!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

