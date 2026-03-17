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
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    const previousVote = userVote;
    const previousScore = score;

    try {
      if (userVote === type) {
        // Toggle off — remove vote
        setUserVote(null);
        setScore(prev => type === 'up' ? prev - 1 : prev + 1);

        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else if (userVote === null) {
        // New vote
        setUserVote(type);
        setScore(prev => type === 'up' ? prev + 1 : prev - 1);

        const { error } = await supabase
          .from('votes')
          .insert({
            project_id: projectId,
            user_id: user.id,
            type,
          });

        if (error) throw error;
      } else {
        // Switch vote (up→down or down→up)
        setUserVote(type);
        setScore(prev => type === 'up' ? prev + 2 : prev - 2);

        // Delete old vote then insert new one
        const { error: deleteError } = await supabase
          .from('votes')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        const { error: insertError } = await supabase
          .from('votes')
          .insert({
            project_id: projectId,
            user_id: user.id,
            type,
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Vote error:', error);
      // Rollback optimistic update
      setUserVote(previousVote);
      setScore(previousScore);
    } finally {
      setLoading(false);
    }
  };

  const containerClass = layout === 'vertical'
    ? 'flex flex-col items-center gap-0.5'
    : 'flex items-center gap-1';

  return (
    <>
      <div className={containerClass}>
        <motion.button
          onClick={() => handleVote('up')}
          disabled={loading}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className={`p-1 rounded-md transition-all duration-200 ${
            userVote === 'up'
              ? 'text-accent bg-accent/15 glow-violet-sm'
              : 'text-muted-foreground hover:text-accent hover:bg-accent/10'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title="Upvote"
          aria-label="Upvote"
        >
          <ChevronUp size={iconSize} strokeWidth={userVote === 'up' ? 3 : 2} />
        </motion.button>

        <AnimatePresence mode="wait">
          <motion.span
            key={score}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`text-sm font-bold tabular-nums min-w-[2ch] text-center ${
              score > 0
                ? 'text-accent'
                : score < 0
                  ? 'text-red-400'
                  : 'text-muted-foreground'
            }`}
          >
            {score}
          </motion.span>
        </AnimatePresence>

        <motion.button
          onClick={() => handleVote('down')}
          disabled={loading}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className={`p-1 rounded-md transition-all duration-200 ${
            userVote === 'down'
              ? 'text-red-400 bg-red-400/15'
              : 'text-muted-foreground hover:text-red-400 hover:bg-red-400/10'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title="Downvote"
          aria-label="Downvote"
        >
          <ChevronDown size={iconSize} strokeWidth={userVote === 'down' ? 3 : 2} />
        </motion.button>
      </div>

      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        message="Sign in to vote on projects and help the community rank the best work."
      />
    </>
  );
}
