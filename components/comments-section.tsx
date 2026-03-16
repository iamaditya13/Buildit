'use client';

import { useEffect, useState } from 'react';
import { supabase, Comment } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

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
        .select(`
          *,
          profiles(username, avatar_url)
        `)
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
      <h2 className="text-2xl font-bold text-foreground">Comments</h2>

      {user ? (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full bg-input border border-border rounded px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            rows={4}
            disabled={submitting}
          />
          <Button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </form>
      ) : (
        <div className="bg-secondary/50 border border-border rounded px-4 py-3">
          <p className="text-muted-foreground">
            <Link href="/auth/signin" className="text-accent hover:underline">
              Sign in
            </Link>
            {' '}to comment on this project.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded p-4 h-24 animate-pulse" />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground text-center py-8"
          >
            No comments yet. Be the first to share your thoughts!
          </motion.p>
        ) : (
          comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-foreground">
                    {comment.profiles?.username || 'Anonymous'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
