'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing: boolean;
  size?: 'sm' | 'md';
  onToggle?: (following: boolean) => void;
}

export function FollowButton({ targetUserId, initialFollowing, size = 'sm', onToggle }: FollowButtonProps) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  if (user?.id === targetUserId) return null;

  const handleToggle = async () => {
    if (!user) return;
    setLoading(true);
    const prev = following;
    setFollowing(!following);

    try {
      if (following) {
        await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId);
      } else {
        await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId });
        // Create notification
        await supabase.from('notifications').insert({
          user_id: targetUserId, type: 'follow', from_user_id: user.id,
        });
      }
      onToggle?.(!prev);
    } catch {
      setFollowing(prev);
    } finally {
      setLoading(false);
    }
  };

  const isSmall = size === 'sm';

  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <Button
        onClick={handleToggle}
        disabled={loading}
        size={isSmall ? 'sm' : 'default'}
        variant={following ? 'outline' : 'default'}
        className={`font-semibold min-h-[32px] ${
          following
            ? 'border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        } ${isSmall ? 'text-xs px-4 h-7' : 'text-sm px-5 h-9'}`}
      >
        {following ? 'Following' : 'Follow'}
      </Button>
    </motion.div>
  );
}
