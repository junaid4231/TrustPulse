"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  LayoutDashboard,
  Bell,
  Settings,
  LogOut,
  Loader2,
  Zap,
  BarChart3,
  HelpCircle,
  User,
  Crown,
  Sparkles,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [activeItem, setActiveItem] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Define `checkUser` before useEffect
  const checkUser = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fix: Safely extract email for type compatibility
      if (!user.email) {
        router.push("/login");
        return;
      }
      setUser({ email: user.email });
    } catch (error) {
      console.error("Error checking user:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkUser();

    // Set active menu item
    const path = window.location.pathname;
    if (path === "/dashboard") setActiveItem("dashboard");
    else if (path.startsWith("/dashboard/widgets")) setActiveItem("widgets");
    else if (path.startsWith("/dashboard/analytics"))
      setActiveItem("analytics");
    else if (path.startsWith("/dashboard/settings")) setActiveItem("settings");
    else if (path.startsWith("/dashboard/notifications"))
      setActiveItem("notifications");
    else if (path.startsWith("/dashboard/help")) setActiveItem("help");

    // Responsive sidebar handling
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [checkUser]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const closeSidebar = () => {
    if (isMobile) setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* ✅ Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-bold text-gray-900">
                  ProofPulse
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ✅ Overlay for mobile */}
        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* ✅ Sidebar */}
        <aside
          className={`fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-2 h-2 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-bold text-white">
                    ProofPulse
                  </span>
                  <p className="text-blue-100 text-xs">Social Proof Platform</p>
                </div>
              </div>
              <button
                onClick={closeSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {[
              { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { id: "widgets", icon: Bell, label: "Widgets" },
              { id: "analytics", icon: BarChart3, label: "Analytics" },
              { id: "notifications", icon: Bell, label: "Notifications" },
              { id: "settings", icon: Settings, label: "Settings" },
              { id: "help", icon: HelpCircle, label: "Help" },
            ].map(({ id, icon: Icon, label }) => (
              <Link
                key={id}
                href={`/dashboard/${id === "dashboard" ? "" : id}`}
                onClick={() => {
                  setActiveItem(id);
                  closeSidebar();
                }}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeItem === id
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    activeItem === id
                      ? "bg-white/20"
                      : "bg-blue-100 group-hover:bg-blue-200"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      activeItem === id ? "text-white" : "text-blue-600"
                    }`}
                  />
                </div>
                <span className="font-medium">{label}</span>
                {activeItem === id && (
                  <ChevronRight className="w-4 h-4 ml-auto text-white" />
                )}
              </Link>
            ))}
          </nav>

          {/* User Profile & Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
            <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl mb-3 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.email?.split("@")[0] || "User"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Crown className="w-3 h-3 text-yellow-500" />
                    <p className="text-xs text-gray-600">Free Plan</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300 hover:shadow-md group"
            >
              <div className="w-8 h-8 bg-red-100 group-hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors">
                <LogOut className="w-4 h-4 text-red-600" />
              </div>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* ✅ Main Content */}
        <main
          className={`transition-all duration-300 ${
            sidebarOpen ? "ml-72" : "ml-0"
          } ${isMobile ? "pt-16" : "pt-0"} p-4 lg:p-8`}
        >
          {/* Desktop Sidebar Toggle */}
          <div className="hidden lg:block mb-6">
            <button
              onClick={toggleSidebar}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm ${
                sidebarOpen
                  ? "bg-blue-50 border border-blue-200 text-blue-700"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {sidebarOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
              </span>
            </button>
          </div>

          {children}
        </main>
      </div>
    </ErrorBoundary>
  );
}
