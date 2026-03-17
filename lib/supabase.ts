import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// ── Database types ────────────────────────────────────────

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  short_description?: string;
  image_url?: string;
  github_url?: string;
  live_url?: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  score: number;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  project_id: string;
  user_id: string;
  type: 'up' | 'down';
  created_at: string;
}

export interface Comment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: { username: string; avatar_url?: string };
}

export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  project_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'follow' | 'upvote' | 'comment';
  from_user_id?: string;
  project_id?: string;
  seen: boolean;
  created_at: string;
}
