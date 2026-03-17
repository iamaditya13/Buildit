'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, Project, Comment } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { VoteButton } from '@/components/vote-button';
import { FollowButton } from '@/components/follow-button';
import { BookmarkButton } from '@/components/bookmark-button';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Share2, ExternalLink, Github, MessageCircle, Send } from 'lucide-react';
import { motion } from 'framer-motion';

type ProjectWithUser = Project & {
  profiles?: { username: string; avatar_url?: string };
};
type CommentWithUser = Comment & { profiles?: { username: string; avatar_url?: string } };

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectWithUser | null>(null);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => { loadProject(); }, [params.id, user]);

  const loadProject = async () => {
    setLoading(true);
    const projectId = params.id as string;

    const { data: p } = await supabase.from('projects').select('*, profiles(username, avatar_url)').eq('id', projectId).single();
    setProject(p);

    const { data: c } = await supabase.from('comments').select('*, profiles(username, avatar_url)').eq('project_id', projectId).order('created_at', { ascending: true });
    setComments(c || []);

    if (user && p) {
      const { data: vote } = await supabase.from('votes').select('type').eq('project_id', projectId).eq('user_id', user.id).single();
      setUserVote(vote?.type || null);

      const { data: follow } = await supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', p.user_id).single();
      setIsFollowing(!!follow);

      const { data: bm } = await supabase.from('bookmarks').select('id').eq('user_id', user.id).eq('project_id', projectId).single();
      setIsBookmarked(!!bm);
    }
    setLoading(false);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    setSubmittingComment(true);
    await supabase.from('comments').insert({ project_id: params.id, user_id: user.id, content: newComment });
    setNewComment('');
    const { data: c } = await supabase.from('comments').select('*, profiles(username, avatar_url)').eq('project_id', params.id as string).order('created_at', { ascending: true });
    setComments(c || []);
    setSubmittingComment(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full aspect-[16/10] bg-muted animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-5 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  return (
    <motion.div className="min-h-screen bg-background" initial={{ x: '100%' }} animate={{ x: 0 }} transition={{ type: 'tween', duration: 0.25 }}>
      {/* Hero thumbnail */}
      <div className="relative">
        {project.image_url ? (
          <div className="w-full aspect-[16/10] bg-muted">
            <Image src={project.image_url} alt={project.title} fill className="object-cover" sizes="100vw" />
          </div>
        ) : (
          <div className="w-full aspect-[16/10] bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <span className="text-5xl font-bold text-primary/20">{project.title.charAt(0)}</span>
          </div>
        )}
        {/* Overlay controls */}
        <div className="absolute top-0 left-0 right-0 flex justify-between p-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-background/70 backdrop-blur flex items-center justify-center">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div className="flex gap-2">
            <BookmarkButton projectId={project.id} initialBookmarked={isBookmarked} />
            <button onClick={() => navigator.share?.({ title: project.title, url: window.location.href })} className="w-9 h-9 rounded-full bg-background/70 backdrop-blur flex items-center justify-center">
              <Share2 size={16} className="text-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Vote bar */}
      <div className="flex items-center justify-center py-3 border-b border-border">
        <VoteButton projectId={project.id} initialScore={project.score || 0} initialUserVote={userVote} layout="horizontal" size="lg" />
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        <h1 className="text-xl font-bold text-foreground tracking-tight">{project.title}</h1>

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map(t => <span key={t} className="tech-pill px-2.5 py-1 rounded-lg text-xs">{t}</span>)}
          </div>
        )}

        <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>

        {/* Action buttons */}
        <div className="flex gap-2.5">
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noopener" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold min-h-[44px]">
              <ExternalLink size={15} /> Live Demo
            </a>
          )}
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary border border-border text-foreground rounded-xl text-sm font-semibold min-h-[44px]">
              <Github size={15} /> GitHub
            </a>
          )}
        </div>

        {/* Author card */}
        <div className="flex items-center gap-3 p-3 bg-secondary/50 border border-border rounded-xl">
          <Link href={`/profile/${project.user_id}`} className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
            {project.profiles?.avatar_url ? (
              <Image src={project.profiles.avatar_url} alt="" width={40} height={40} className="rounded-full object-cover" />
            ) : (
              project.profiles?.username?.charAt(0).toUpperCase() || '?'
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${project.user_id}`} className="text-sm font-semibold text-foreground hover:text-primary">{project.profiles?.username}</Link>
            <p className="text-xs text-muted-foreground">Developer</p>
          </div>
          {user?.id !== project.user_id && (
            <FollowButton targetUserId={project.user_id} initialFollowing={isFollowing} size="sm" />
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="border-t border-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <MessageCircle size={16} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Comments ({comments.length})</h2>
        </div>

        <div className="px-4 space-y-3 pb-4">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No comments yet.</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0 mt-0.5">
                  {c.profiles?.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-semibold text-foreground">{c.profiles?.username || 'anon'}</span>{' '}
                    <span className="text-foreground/85">{c.content}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment input — pinned at bottom */}
        {user ? (
          <form onSubmit={handleComment} className="flex items-center gap-2 px-4 py-3 border-t border-border bg-background sticky bottom-[52px] md:bottom-0">
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none"
              disabled={submittingComment}
            />
            <button type="submit" disabled={submittingComment || !newComment.trim()} className="text-primary disabled:text-primary/30 min-h-[44px] min-w-[44px] flex items-center justify-center">
              <Send size={18} />
            </button>
          </form>
        ) : (
          <div className="px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground"><Link href="/auth/signin" className="text-primary font-medium">Sign in</Link> to comment.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
