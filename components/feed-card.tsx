'use client';

import { useState, useCallback, useRef } from 'react';
import { Project } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { VoteButton } from './vote-button';
import { FollowButton } from './follow-button';
import { BookmarkButton } from './bookmark-button';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Share2, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedCardProps {
  project: Project & {
    profiles?: { username: string; avatar_url?: string };
  };
  commentCount?: number;
  userVote: 'up' | 'down' | null;
  isFollowing: boolean;
  isBookmarked: boolean;
}

export function FeedCard({
  project,
  commentCount = 0,
  userVote,
  isFollowing,
  isBookmarked,
}: FeedCardProps) {
  const { user } = useAuth();
  const [showHeart, setShowHeart] = useState(false);
  const lastTap = useRef(0);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 900);
    }
    lastTap.current = now;
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: project.title, url: `/projects/${project.id}` });
      } catch {}
    }
  };

  return (
    <article className="feed-card">
      {/* Author header */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <Link href={`/profile/${project.user_id}`} className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
            {project.profiles?.avatar_url ? (
              <Image src={project.profiles.avatar_url} alt="" width={32} height={32} className="rounded-full object-cover" />
            ) : (
              project.profiles?.username?.charAt(0).toUpperCase() || '?'
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{project.profiles?.username || 'anon'}</p>
          </div>
        </Link>
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
        </span>
        {user?.id !== project.user_id && (
          <FollowButton targetUserId={project.user_id} initialFollowing={isFollowing} size="sm" />
        )}
      </div>

      {/* Thumbnail */}
      <div className="relative" onClick={handleDoubleTap}>
        {project.image_url ? (
          <div className="relative w-full aspect-[16/10] bg-muted">
            <Image src={project.image_url} alt={project.title} fill className="object-cover" sizes="100vw" />
          </div>
        ) : (
          <div className="w-full aspect-[16/10] bg-secondary flex items-center justify-center">
            <span className="text-3xl font-bold text-primary/20">{project.title.charAt(0)}</span>
          </div>
        )}
        {/* Double-tap heart */}
        <AnimatePresence>
          {showHeart && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ChevronUp size={80} className="text-primary heart-pop drop-shadow-lg" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action row */}
      <div className="flex items-center px-4 pt-2.5 pb-1 gap-1">
        <VoteButton
          projectId={project.id}
          initialScore={project.score || 0}
          initialUserVote={userVote}
          layout="horizontal"
          size="sm"
        />
        <Link href={`/project/${project.id}#comments`} className="flex items-center gap-1 px-2 py-1 text-muted-foreground hover:text-foreground transition-colors min-h-[44px]">
          <MessageCircle size={20} strokeWidth={1.6} />
          {commentCount > 0 && <span className="text-sm">{commentCount}</span>}
        </Link>
        <button onClick={handleShare} className="p-2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px]">
          <Share2 size={20} strokeWidth={1.6} />
        </button>
        <div className="ml-auto">
          <BookmarkButton projectId={project.id} initialBookmarked={isBookmarked} />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 space-y-1.5">
        <Link href={`/project/${project.id}`}>
          <h3 className="text-sm font-bold text-foreground">{project.title}</h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {project.short_description || project.description}
        </p>
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {project.tags.slice(0, 4).map(tag => (
              <span key={tag} className="tech-pill px-2 py-0.5 rounded-md">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
