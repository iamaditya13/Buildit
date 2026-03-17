'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginModal } from './login-modal';

interface VoteButtonProps {
  projectId: string;
  initialScore: number;
  initialUserVote: 'up' | 'down' | null;
  layout?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
}

export function VoteButton({
  projectId,
  initialScore,
  initialUserVote,
  layout = 'vertical',
  size = 'md',
}: VoteButtonProps) {
  const { user } = useAuth();
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(initialUserVote);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  const handleVote = async (type: 'up' | 'down') => {
    if (!user) { setShowLoginModal(true); return; }

    setLoading(true);
    const prev = { vote: userVote, score };

    try {
      if (userVote === type) {
        setUserVote(null);
        setScore(s => type === 'up' ? s - 1 : s + 1);
        const { error } = await supabase.from('votes').delete().eq('project_id', projectId).eq('user_id', user.id);
        if (error) throw error;
      } else if (userVote === null) {
        setUserVote(type);
        setScore(s => type === 'up' ? s + 1 : s - 1);
        const { error } = await supabase.from('votes').insert({ project_id: projectId, user_id: user.id, type });
        if (error) throw error;
      } else {
        setUserVote(type);
        setScore(s => type === 'up' ? s + 2 : s - 2);
        await supabase.from('votes').delete().eq('project_id', projectId).eq('user_id', user.id);
        const { error } = await supabase.from('votes').insert({ project_id: projectId, user_id: user.id, type });
        if (error) throw error;
      }
    } catch {
      setUserVote(prev.vote);
      setScore(prev.score);
    } finally {
      setLoading(false);
    }
  };

  const isVertical = layout === 'vertical';

  return (
    <>
      <div className={isVertical ? 'flex flex-col items-center gap-px' : 'flex items-center gap-1'}>
        <motion.button
          onClick={() => handleVote('up')}
          disabled={loading}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
          className={`p-1 rounded transition-colors ${
            userVote === 'up'
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
          } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
          aria-label="Upvote"
        >
          <ChevronUp size={iconSize} strokeWidth={userVote === 'up' ? 2.8 : 2} />
        </motion.button>

        <AnimatePresence mode="wait">
          <motion.span
            key={score}
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 6, opacity: 0 }}
            transition={{ duration: 0.12 }}
            className={`text-sm font-bold tabular-nums min-w-[2ch] text-center select-none ${
              score > 0 ? 'text-primary' : score < 0 ? 'text-red-400' : 'text-muted-foreground'
            }`}
          >
            {score}
          </motion.span>
        </AnimatePresence>

        <motion.button
          onClick={() => handleVote('down')}
          disabled={loading}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
          className={`p-1 rounded transition-colors ${
            userVote === 'down'
              ? 'text-red-400 bg-red-400/10'
              : 'text-muted-foreground hover:text-red-400 hover:bg-red-400/5'
          } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
          aria-label="Downvote"
        >
          <ChevronDown size={iconSize} strokeWidth={userVote === 'down' ? 2.8 : 2} />
        </motion.button>
      </div>

      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        message="Sign in to vote on projects and help rank the best work."
      />
    </>
  );
}
