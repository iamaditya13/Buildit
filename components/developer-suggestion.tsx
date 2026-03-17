'use client';

import { Profile } from '@/lib/supabase';
import { FollowButton } from './follow-button';
import Image from 'next/image';
import Link from 'next/link';

interface DeveloperSuggestionProps {
  developer: Profile;
  isFollowing: boolean;
}

export function DeveloperSuggestion({ developer, isFollowing }: DeveloperSuggestionProps) {
  return (
    <div className="flex-shrink-0 w-36 bg-card border border-border rounded-xl p-3 text-center">
      <Link href={`/profile/${developer.id}`} className="block">
        <div className="w-14 h-14 mx-auto rounded-full bg-primary/15 flex items-center justify-center overflow-hidden mb-2">
          {developer.avatar_url ? (
            <Image src={developer.avatar_url} alt={developer.username} width={56} height={56} className="rounded-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-primary">{developer.username.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <p className="text-sm font-semibold text-foreground truncate">{developer.username}</p>
      </Link>
      <p className="text-[10px] text-muted-foreground truncate mt-0.5 mb-2.5">
        {developer.bio || 'Developer'}
      </p>
      <FollowButton targetUserId={developer.id} initialFollowing={isFollowing} size="sm" />
    </div>
  );
}
