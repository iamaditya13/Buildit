import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
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
  user?: {
    username: string;
    avatar_url?: string;
  };
}

export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  github_url?: string;
  portfolio_url?: string;
  created_at: string;
  updated_at: string;
}
