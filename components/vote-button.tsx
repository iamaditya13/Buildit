'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface VoteButtonProps {
  projectId: string;
  userVoted: boolean;
}

export function VoteButton({ projectId, userVoted: initialVoted }: VoteButtonProps) {
  const { user } = useAuth();
  const [voted, setVoted] = useState(initialVoted);
  const [loading, setLoading] = useState(false);

  const handleVote = async () => {
    if (!user) {
      // Redirect to sign in
      window.location.href = '/auth/signin';
      return;
    }

    setLoading(true);
    try {
      if (voted) {
        // Remove vote
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', user.id);

        if (error) throw error;
        setVoted(false);
      } else {
        // Add vote
        const { error } = await supabase
          .from('votes')
          .insert({
            project_id: projectId,
            user_id: user.id,
          });

        if (error) throw error;
        setVoted(true);
      }
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Link href="/auth/signin">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="text-muted-foreground hover:text-accent transition-colors p-1"
          type="button"
          title="Sign in to vote"
        >
          <Heart size={18} />
        </motion.button>
      </Link>
    );
  }

  return (
    <motion.button
      onClick={handleVote}
      disabled={loading}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`transition-colors p-1 ${
        voted
          ? 'text-accent'
          : 'text-muted-foreground hover:text-accent'
      }`}
      title={voted ? 'Remove vote' : 'Vote for this project'}
    >
      <Heart size={18} fill={voted ? 'currentColor' : 'none'} />
    </motion.button>
  );
}
