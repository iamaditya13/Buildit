'use client';

import { useEffect, useState } from 'react';
import { supabase, Comment } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { MessageCircle, Send } from 'lucide-react';

interface CommentsSectionProps {
  projectId: string;
}

interface CommentWithUser extends Comment {
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

export function CommentsSection({ projectId }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [projectId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`*, profiles(username, avatar_url)`)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          project_id: projectId,
          user_id: user.id,
          content: newComment,
        });

      if (error) throw error;
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <MessageCircle size={22} className="text-accent" />
        <h2 className="text-2xl font-bold text-foreground">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h2>
      </div>

      {user ? (
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
            rows={3}
            disabled={submitting}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 rounded-lg"
              size="sm"
            >
              <Send size={14} />
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-secondary/30 border border-border/50 rounded-xl px-5 py-4">
          <p className="text-muted-foreground text-sm">
            <Link href="/auth/signin" className="text-accent hover:underline font-medium">
              Sign in
            </Link>
            {' '}to join the discussion.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 h-24 animate-pulse" />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground text-center py-10 text-sm"
          >
            No comments yet. Be the first to share your thoughts!
          </motion.p>
        ) : (
          <AnimatePresence>
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border/50 rounded-xl p-4 hover:border-border transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                    {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {comment.profiles?.username || 'Anonymous'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <p className="text-foreground text-sm whitespace-pre-wrap pl-10">{comment.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
