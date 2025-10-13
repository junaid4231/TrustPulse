"use client";

import { useEffect, useState } from "react";
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
  const [user, setUser] = useState<any>(null);
  const [activeItem, setActiveItem] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    checkUser();
    // Set active item based on current path
    const path = window.location.pathname;
    if (path === "/dashboard") setActiveItem("dashboard");
    else if (path.startsWith("/dashboard/widgets")) setActiveItem("widgets");
    else if (path.startsWith("/dashboard/analytics"))
      setActiveItem("analytics");
    else if (path.startsWith("/dashboard/settings")) setActiveItem("settings");
    else if (path.startsWith("/dashboard/notifications"))
      setActiveItem("notifications");
    else if (path.startsWith("/dashboard/help")) setActiveItem("help");

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true); // Auto-open on desktop
      } else {
        setSidebarOpen(false); // Auto-close on mobile
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const checkUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
    } catch (error) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    console.log("Sidebar toggled:", !sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
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
        {/* Mobile Header */}
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

        {/* Overlay for mobile */}
        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Enhanced Sidebar */}
        <aside
          className={`fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Enhanced Logo Section */}
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
              {/* Close button for mobile */}
              <button
                onClick={closeSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Enhanced Navigation */}
          <nav className="p-4 space-y-1">
            <Link
              href="/dashboard"
              onClick={() => {
                setActiveItem("dashboard");
                closeSidebar();
              }}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeItem === "dashboard"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  activeItem === "dashboard"
                    ? "bg-white/20"
                    : "bg-blue-100 group-hover:bg-blue-200"
                }`}
              >
                <LayoutDashboard
                  className={`w-4 h-4 ${
                    activeItem === "dashboard" ? "text-white" : "text-blue-600"
                  }`}
                />
              </div>
              <span className="font-medium">Dashboard</span>
              {activeItem === "dashboard" && (
                <ChevronRight className="w-4 h-4 ml-auto text-white" />
              )}
            </Link>

            <Link
              href="/dashboard/widgets"
              onClick={() => {
                setActiveItem("widgets");
                closeSidebar();
              }}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeItem === "widgets"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  activeItem === "widgets"
                    ? "bg-white/20"
                    : "bg-blue-100 group-hover:bg-blue-200"
                }`}
              >
                <Bell
                  className={`w-4 h-4 ${
                    activeItem === "widgets" ? "text-white" : "text-blue-600"
                  }`}
                />
              </div>
              <span className="font-medium">Widgets</span>
              {activeItem === "widgets" && (
                <ChevronRight className="w-4 h-4 ml-auto text-white" />
              )}
            </Link>

            <Link
              href="/dashboard/analytics"
              onClick={() => {
                setActiveItem("analytics");
                closeSidebar();
              }}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeItem === "analytics"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  activeItem === "analytics"
                    ? "bg-white/20"
                    : "bg-blue-100 group-hover:bg-blue-200"
                }`}
              >
                <BarChart3
                  className={`w-4 h-4 ${
                    activeItem === "analytics" ? "text-white" : "text-blue-600"
                  }`}
                />
              </div>
              <span className="font-medium">Analytics</span>
              {activeItem === "analytics" && (
                <ChevronRight className="w-4 h-4 ml-auto text-white" />
              )}
            </Link>

            <Link
              href="/dashboard/notifications"
              onClick={() => {
                setActiveItem("notifications");
                closeSidebar();
              }}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeItem === "notifications"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  activeItem === "notifications"
                    ? "bg-white/20"
                    : "bg-blue-100 group-hover:bg-blue-200"
                }`}
              >
                <Bell
                  className={`w-4 h-4 ${
                    activeItem === "notifications"
                      ? "text-white"
                      : "text-blue-600"
                  }`}
                />
              </div>
              <span className="font-medium">Notifications</span>
              {activeItem === "notifications" && (
                <ChevronRight className="w-4 h-4 ml-auto text-white" />
              )}
            </Link>

            <Link
              href="/dashboard/settings"
              onClick={() => {
                setActiveItem("settings");
                closeSidebar();
              }}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeItem === "settings"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  activeItem === "settings"
                    ? "bg-white/20"
                    : "bg-blue-100 group-hover:bg-blue-200"
                }`}
              >
                <Settings
                  className={`w-4 h-4 ${
                    activeItem === "settings" ? "text-white" : "text-blue-600"
                  }`}
                />
              </div>
              <span className="font-medium">Settings</span>
              {activeItem === "settings" && (
                <ChevronRight className="w-4 h-4 ml-auto text-white" />
              )}
            </Link>

            <Link
              href="/dashboard/help"
              onClick={() => {
                setActiveItem("help");
                closeSidebar();
              }}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeItem === "help"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  activeItem === "help"
                    ? "bg-white/20"
                    : "bg-blue-100 group-hover:bg-blue-200"
                }`}
              >
                <HelpCircle
                  className={`w-4 h-4 ${
                    activeItem === "help" ? "text-white" : "text-blue-600"
                  }`}
                />
              </div>
              <span className="font-medium">Help</span>
              {activeItem === "help" && (
                <ChevronRight className="w-4 h-4 ml-auto text-white" />
              )}
            </Link>
          </nav>

          {/* Enhanced User Profile & Logout */}
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

        {/* Main Content */}
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
