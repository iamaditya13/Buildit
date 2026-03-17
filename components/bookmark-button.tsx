'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { LoginModal } from './login-modal';

interface BookmarkButtonProps {
  projectId: string;
  initialBookmarked: boolean;
}

export function BookmarkButton({ projectId, initialBookmarked }: BookmarkButtonProps) {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleToggle = async () => {
    if (!user) { setShowLogin(true); return; }
    setLoading(true);
    const prev = bookmarked;
    setBookmarked(!bookmarked);

    try {
      if (bookmarked) {
        await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('project_id', projectId);
      } else {
        await supabase.from('bookmarks').insert({ user_id: user.id, project_id: projectId });
      }
    } catch {
      setBookmarked(prev);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={handleToggle}
        disabled={loading}
        whileTap={{ scale: 0.85 }}
        className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${
          bookmarked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
      >
        <Bookmark size={20} strokeWidth={1.6} fill={bookmarked ? 'currentColor' : 'none'} />
      </motion.button>
      <LoginModal open={showLogin} onOpenChange={setShowLogin} message="Sign in to bookmark projects." />
    </>
  );
}
