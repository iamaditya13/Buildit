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
  image_url?: string;
  github_url?: string;
  live_url?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  vote_count?: number;
  comment_count?: number;
}

export interface Vote {
  id: string;
  project_id: string;
  user_id: string;
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
  created_at: string;
  updated_at: string;
}
