'use client';

import { useEffect, useState } from 'react';
import { supabase, Profile } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import Image from 'next/image';
import { Plus } from 'lucide-react';

export function StoriesBar() {
  const { user } = useAuth();
  const [developers, setDevelopers] = useState<Profile[]>([]);

  useEffect(() => { loadDevelopers(); }, [user]);

  const loadDevelopers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);
      setDevelopers((data || []).filter(d => d.id !== user?.id));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="border-b border-border">
      <div className="flex gap-4 px-4 py-3 overflow-x-auto no-scrollbar">
        {/* Your Story */}
        <Link href="/submit" className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center border-2 border-border">
              {user ? (
                <span className="text-lg font-bold text-primary">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              ) : (
                <Plus size={20} className="text-muted-foreground" />
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-background">
              <Plus size={10} className="text-primary-foreground" />
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground w-16 text-center truncate">Your Story</span>
        </Link>

        {/* Developer stories */}
        {developers.map((dev, i) => {
          const unseen = i < 3; // First 3 treated as unseen for demo
          return (
            <Link
              key={dev.id}
              href={`/profile/${dev.id}`}
              className="flex flex-col items-center gap-1 flex-shrink-0"
            >
              <div className={`rounded-full ${unseen ? 'story-ring-unseen' : 'story-ring-seen'}`}>
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {dev.avatar_url ? (
                    <Image src={dev.avatar_url} alt={dev.username} width={64} height={64} className="rounded-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-primary">
                      {dev.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground w-16 text-center truncate">
                {dev.username}
              </span>
            </Link>
          );
        })}

        {/* Skeleton placeholders when empty */}
        {developers.length === 0 && [...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-secondary animate-pulse" />
            <div className="w-12 h-2 bg-secondary rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
