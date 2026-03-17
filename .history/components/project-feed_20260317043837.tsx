'use client';

import { useEffect, useState } from 'react';
import { supabase, Project } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { ProjectCard } from './project-card';
import { motion } from 'framer-motion';
import { TrendingUp, Star, Clock, Search } from 'lucide-react';

interface ProjectWithMeta extends Project {
  profiles?: { username: string; avatar_url?: string };
  comments: { count: number }[];
}

type SortTab = 'trending' | 'top' | 'newest';

export function ProjectFeed() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithMeta[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortTab>('trending');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadProjects(); }, [sortBy]);
  useEffect(() => { if (user) loadUserVotes(); }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      let query = supabase.from('projects').select(`*, profiles(username, avatar_url), comments(count)`);
      if (sortBy === 'newest') query = query.order('created_at', { ascending: false });
      else if (sortBy === 'top') query = query.order('score', { ascending: false });
      else query = query.order('score', { ascending: false }).order('created_at', { ascending: false });
      query = query.limit(50);
      const { data, error } = await query;
      if (error) throw error;
      setProjects((data || []) as ProjectWithMeta[]);
    } catch (err) { console.error('Error loading projects:', err); }
    finally { setLoading(false); }
  };

  const loadUserVotes = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('votes').select('project_id, type').eq('user_id', user.id);
      if (error) throw error;
      const map: Record<string, 'up' | 'down'> = {};
      data?.forEach(v => { map[v.project_id] = v.type as 'up' | 'down'; });
      setUserVotes(map);
    } catch (err) { console.error('Error loading votes:', err); }
  };

  const tabs: { key: SortTab; label: string; icon: React.ElementType }[] = [
    { key: 'trending', label: 'Trending', icon: TrendingUp },
    { key: 'top', label: 'Top Rated', icon: Star },
    { key: 'newest', label: 'Newest', icon: Clock },
  ];

  const filtered = searchQuery
    ? projects.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : projects;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-9 w-28 bg-secondary rounded-full animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-card border border-border rounded-xl h-80 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-1.5 bg-secondary/50 p-1 rounded-full">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setSortBy(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-all min-h-[36px] ${
                  sortBy === tab.key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-60">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <p className="text-muted-foreground">
            {searchQuery ? 'No projects match your search.' : 'No projects yet. Be the first to share!'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              commentCount={project.comments?.[0]?.count || 0}
              userVote={userVotes[project.id] || null}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
