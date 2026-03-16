import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Missing Supabase credentials' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Create projects table
    const { error: projectsError } = await supabase.from('projects').select('*').limit(1);
    if (projectsError?.code === 'PGRST116') {
      // Table doesn't exist, create it
      const { error } = await supabase.rpc('exec', {
        sql: `CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          image_url VARCHAR(500),
          github_url VARCHAR(500),
          live_url VARCHAR(500),
          tags TEXT[] DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`
      });
      if (error) throw error;
    }

    return NextResponse.json(
      { message: 'Database setup complete' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
