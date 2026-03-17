'use client';

import { useEffect, useState } from 'react';
import { supabase, Project, Profile } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { ProjectGrid } from '@/components/project-grid';
import { FeedCard } from '@/components/feed-card';
import { DeveloperSuggestion } from '@/components/developer-suggestion';
import Link from 'next/link';
import { Search, LayoutGrid, List, TrendingUp, Star, Clock, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

const filters = [
  { key: 'trending', label: 'Trending', icon: TrendingUp },
  { key: 'top', label: 'Top Rated', icon: Star },
  { key: 'newest', label: 'Newest', icon: Clock },
  { key: 'tech', label: 'By Tech', icon: Code2 },
];

type ExploreProject = Project & { profiles?: { username: string; avatar_url?: string } };

export default function ExplorePage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('trending');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [projects, setProjects] = useState<ExploreProject[]>([]);
  const [suggestedDevs, setSuggestedDevs] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => { loadData(); }, [user, filter]);

  const loadData = async () => {
    setLoading(true);

    let query = supabase.from('projects').select('*, profiles(username, avatar_url)');
    if (filter === 'trending') query = query.order('score', { ascending: false });
    else if (filter === 'top') query = query.order('upvotes', { ascending: false });
    else if (filter === 'newest') query = query.order('created_at', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data } = await query.limit(30);
    setProjects(data || []);

    if (user) {
      const [{ data: follows }, { data: votes }, { data: bms }] = await Promise.all([
        supabase.from('follows').select('following_id').eq('follower_id', user.id),
        supabase.from('votes').select('project_id, type').eq('user_id', user.id),
        supabase.from('bookmarks').select('project_id').eq('user_id', user.id),
      ]);
      setFollowingIds((follows || []).map(f => f.following_id));
      const vm: Record<string, 'up' | 'down'> = {};
      (votes || []).forEach(v => { vm[v.project_id] = v.type; });
      setUserVotes(vm);
      setBookmarks((bms || []).map(b => b.project_id));
    }

    // Suggested developers
    const { data: devs } = await supabase.from('profiles').select('*').limit(8);
    setSuggestedDevs((devs || []).filter(d => d.id !== user?.id));

    setLoading(false);
  };

  const filtered = search
    ? projects.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
        p.profiles?.username?.toLowerCase().includes(search.toLowerCase())
      )
    : projects;

  return (
    <div className="min-h-screen bg-background">
      {/* Search bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects, tech, developers..."
            className="w-full bg-secondary border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all"
          />
        </div>
      </div>

      {/* Filter pills + view toggle */}
      <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-1.5 flex-1 overflow-x-auto no-scrollbar">
          {filters.map(f => {
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap min-h-[32px] ${
                  filter === f.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={13} /> {f.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded min-h-[32px] min-w-[32px] ${viewMode === 'grid' ? 'text-primary' : 'text-muted-foreground'}`}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setViewMode('list')}
            className={`p-1.5 rounded min-h-[32px] min-w-[32px] ${viewMode === 'list' ? 'text-primary' : 'text-muted-foreground'}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Suggested developers */}
      {!search && suggestedDevs.length > 0 && (
        <div className="border-b border-border pb-4 mb-2">
          <div className="flex items-center justify-between px-4 mb-2.5">
            <h2 className="text-sm font-semibold text-foreground">Suggested Developers</h2>
            <span className="text-xs text-primary font-medium">See All</span>
          </div>
          <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar">
            {suggestedDevs.map(dev => (
              <DeveloperSuggestion key={dev.id} developer={dev} isFollowing={followingIds.includes(dev.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        viewMode === 'grid' ? (
          <div className="project-grid">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          [...Array(3)].map((_, i) => (
            <div key={i} className="feed-card">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              </div>
              <div className="w-full aspect-[16/10] bg-muted animate-pulse" />
            </div>
          ))
        )
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 px-4">
          <p className="text-muted-foreground text-sm">No projects found. Try a different search.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <ProjectGrid projects={filtered} />
      ) : (
        filtered.map((project, i) => (
          <motion.div key={project.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
            <FeedCard
              project={project}
              userVote={userVotes[project.id] || null}
              isFollowing={followingIds.includes(project.user_id)}
              isBookmarked={bookmarks.includes(project.id)}
            />
          </motion.div>
        ))
      )}
    </div>
  );
}
