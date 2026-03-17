'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, Project } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { StoriesBar } from '@/components/stories-bar';
import { FeedCard } from '@/components/feed-card';
import { DeveloperSuggestion } from '@/components/developer-suggestion';
import Link from 'next/link';
import { Compass, Users } from 'lucide-react';
import { motion } from 'framer-motion';

type FeedProject = Project & {
  profiles?: { username: string; avatar_url?: string };
};

export default function FeedPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<FeedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [following, setFollowing] = useState<string[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [suggestedDevs, setSuggestedDevs] = useState<any[]>([]);
  const observer = useRef<IntersectionObserver>(undefined);
  const page = useRef(0);

  useEffect(() => { loadData(); }, [user]);

  const loadData = async () => {
    setLoading(true);
    page.current = 0;

    let followIds: string[] = [];
    if (user) {
      const { data: follows } = await supabase.from('follows').select('following_id').eq('follower_id', user.id);
      followIds = (follows || []).map(f => f.following_id);
      setFollowing(followIds);

      const { data: votes } = await supabase.from('votes').select('project_id, type').eq('user_id', user.id);
      const voteMap: Record<string, 'up' | 'down'> = {};
      (votes || []).forEach(v => { voteMap[v.project_id] = v.type; });
      setUserVotes(voteMap);

      const { data: bms } = await supabase.from('bookmarks').select('project_id').eq('user_id', user.id);
      setBookmarks((bms || []).map(b => b.project_id));
    }

    if (followIds.length > 0) {
      const { data } = await supabase
        .from('projects')
        .select('*, profiles(username, avatar_url)')
        .in('user_id', followIds)
        .order('created_at', { ascending: false })
        .range(0, 9);
      setProjects(data || []);
      setHasMore((data || []).length === 10);
    } else {
      // No following — show popular projects
      const { data } = await supabase
        .from('projects')
        .select('*, profiles(username, avatar_url)')
        .order('score', { ascending: false })
        .range(0, 9);
      setProjects(data || []);
      setHasMore((data || []).length === 10);

      // Load suggested developers
      const { data: devs } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);
      setSuggestedDevs((devs || []).filter(d => d.id !== user?.id));
    }

    setLoading(false);
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    page.current += 1;
    const start = page.current * 10;

    const query = supabase
      .from('projects')
      .select('*, profiles(username, avatar_url)')
      .order(following.length > 0 ? 'created_at' : 'score', { ascending: false })
      .range(start, start + 9);

    if (following.length > 0) query.in('user_id', following);

    const { data } = await query;
    if (data) {
      setProjects(prev => [...prev, ...data]);
      setHasMore(data.length === 10);
    }
    setLoadingMore(false);
  };

  const lastCardRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) loadMore();
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight">
          Build<span className="text-primary">it</span>
        </h1>
        <Link href="/notifications" className="p-2 text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </Link>
      </header>

      {/* Stories */}
      <StoriesBar />

      {/* Empty state — not following anyone */}
      {!loading && following.length === 0 && user && suggestedDevs.length > 0 && (
        <div className="px-4 py-5">
          <div className="text-center mb-5">
            <Users size={40} className="text-primary/30 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-foreground mb-1">Follow developers to fill your feed</h2>
            <p className="text-sm text-muted-foreground">Discover and follow developers to see their projects here.</p>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {suggestedDevs.map(dev => (
              <DeveloperSuggestion key={dev.id} developer={dev} isFollowing={false} />
            ))}
          </div>
          <div className="text-center mt-4">
            <Link href="/explore" className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline">
              <Compass size={16} /> Explore all developers
            </Link>
          </div>
        </div>
      )}

      {/* Feed */}
      <div>
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="feed-card">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              </div>
              <div className="w-full aspect-[16/10] bg-muted animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-40 bg-muted rounded animate-pulse" />
                <div className="h-3 w-56 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))
        ) : projects.length === 0 && !user ? (
          <div className="text-center py-16 px-4">
            <h2 className="text-lg font-bold text-foreground mb-2">Welcome to BuildIt</h2>
            <p className="text-sm text-muted-foreground mb-4">Sign in to follow developers and see their projects.</p>
            <Link href="/auth/signin" className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold min-h-[44px]">
              Sign In
            </Link>
          </div>
        ) : (
          projects.map((project, i) => (
            <motion.div
              key={project.id}
              ref={i === projects.length - 1 ? lastCardRef : undefined}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
            >
              <FeedCard
                project={project}
                userVote={userVotes[project.id] || null}
                isFollowing={following.includes(project.user_id)}
                isBookmarked={bookmarks.includes(project.id)}
              />
            </motion.div>
          ))
        )}

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
