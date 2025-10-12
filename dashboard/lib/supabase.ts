import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";

// For client components
export const supabase = createClientComponentClient();

// For server-side operations (optional, we'll use this later)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Database types
export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  stripe_customer_id: string | null;
  subscription_status: string;
  subscription_plan: string;
};

export type Widget = {
  id: string;
  user_id: string;
  name: string;
  domain: string;
  position: string;
  primary_color: string;
  created_at: string;
  is_active: boolean;
};

export type Notification = {
  id: string;
  widget_id: string;
  type: string;
  message: string;
  name: string | null;
  location: string | null;
  avatar_url: string | null;
  timestamp: string;
  is_active: boolean;
};
