'use client';

import { Navbar } from '@/components/navbar';
import { EditProfileForm } from '@/components/edit-profile-form';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function EditProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  useEffect(() => {
    if (!loading && (!user || user.id !== userId)) {
      router.push('/');
    }
  }, [user, loading, router, userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || user.id !== userId) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">Update your profile information</p>
        </div>
        <EditProfileForm userId={userId} />
      </div>
    </main>
  );
}
