import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Client مشترك — استخدمه في جميع مكونات الـ Client */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// ─── Types ──────────────────────────────────────────────────────────────────

export type SavedTrip = {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  input: Record<string, unknown>;
  result: Record<string, unknown>;
  selected_hotel: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};
