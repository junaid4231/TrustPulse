// Database entity types
export interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
  };
  created_at: string;
  last_sign_in_at?: string;
}

export interface Widget {
  id: string;
  user_id: string;
  name: string;
  domain: string;
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  primary_color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  widget_id: string;
  type: "activity" | "testimonial" | "purchase";
  message: string;
  name?: string;
  location?: string;
  is_active: boolean;
  timestamp: string;
  created_at: string;
}

export interface Analytics {
  id: string;
  widget_id: string;
  event_type: "impression" | "click";
  notification_id?: string;
  timestamp?: string;
  url?: string;
  user_agent?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  email_notifications?: boolean;
  widget_alerts?: boolean;
  weekly_reports?: boolean;
  marketing_emails?: boolean;
  created_at: string;
  updated_at: string;
}

// API response types
export interface WidgetResponse {
  widget: {
    id: string;
    position: string;
    primary_color: string;
  };
  notifications: Notification[];
}

export interface AnalyticsRequest {
  widget_id: string;
  event_type: "impression" | "click";
  notification_id?: string;
  timestamp?: string;
  url?: string;
  user_agent?: string;
}

// Component prop types
export interface DashboardStats {
  totalWidgets: number;
  totalImpressions: number;
  totalClicks: number;
  conversionRate: number;
}

export interface WidgetStats {
  impressions: number;
  clicks: number;
  ctr: string;
}

// Form data types
export interface WidgetFormData {
  name: string;
  domain: string;
  position: string;
  primary_color: string;
}

export interface ProfileFormData {
  full_name: string;
  email: string;
}

export interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  widget_alerts: boolean;
  weekly_reports: boolean;
  marketing_emails: boolean;
}

// Message types
export interface Message {
  type: "success" | "error" | "warning" | "info";
  text: string;
}
