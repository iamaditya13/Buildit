'use client';

import { useEffect, useState } from 'react';
import { supabase, Comment } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { MessageCircle, Send } from 'lucide-react';

interface CommentsSectionProps { projectId: string; }
interface CommentWithUser extends Comment { profiles?: { username: string; avatar_url?: string }; }

export function CommentsSection({ projectId }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadComments(); }, [projectId]);

  const loadComments = async () => {
    setLoading(true);
    const { data } = await supabase.from('comments').select(`*, profiles(username, avatar_url)`).eq('project_id', projectId).order('created_at', { ascending: false });
    setComments(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    setSubmitting(true);
    await supabase.from('comments').insert({ project_id: projectId, user_id: user.id, content: newComment });
    setNewComment('');
    await loadComments();
    setSubmitting(false);
  };

  return (
    <div id="comments" className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle size={20} className="text-primary" />
        <h2 className="text-xl font-bold text-foreground tracking-tight">Comments {comments.length > 0 && `(${comments.length})`}</h2>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Share your thoughts..."
            className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all resize-none" rows={3} disabled={submitting} />
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting || !newComment.trim()} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 min-h-[36px]">
              <Send size={13} /> {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-secondary/50 border border-border rounded-xl px-5 py-4">
          <p className="text-muted-foreground text-sm"><Link href="/auth/signin" className="text-primary hover:underline font-medium">Sign in</Link> to join the discussion.</p>
        </div>
      )}

      <div className="space-y-2.5">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="bg-card border border-border rounded-xl p-4 h-20 animate-pulse" />)
        ) : comments.length === 0 ? (
          <p className="text-muted-foreground text-center py-10 text-sm">No comments yet. Be the first!</p>
        ) : (
          <AnimatePresence>
            {comments.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/15 transition-colors">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary">
                    {c.profiles?.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <span className="text-sm font-medium text-foreground">{c.profiles?.username || 'Anonymous'}</span>
                  <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap pl-8">{c.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
