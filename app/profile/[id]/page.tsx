import { notFound } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { UserProfile } from '@/components/user-profile';
import { supabase } from '@/lib/supabase';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username')
    .eq('id', params.id)
    .single();

  if (!profile) {
    return {
      title: 'Profile Not Found',
    };
  }

  return {
    title: `${profile.full_name || profile.username} - Buildit`,
    description: `Check out ${profile.full_name || profile.username}'s projects on Buildit`,
  };
}

export default async function ProfilePage(props: PageProps) {
  const params = await props.params;
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!profile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <UserProfile profile={profile} userId={params.id} />
      </div>
    </main>
  );
}
