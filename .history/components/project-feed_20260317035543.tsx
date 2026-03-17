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

  useEffect(() => {
    loadProjects();
  }, [sortBy]);

  useEffect(() => {
    if (user) loadUserVotes();
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('projects')
        .select(`*, profiles(username, avatar_url), comments(count)`);

      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'top') {
        query = query.order('score', { ascending: false });
      } else {
        // Trending: high score + recent
        query = query.order('score', { ascending: false }).order('created_at', { ascending: false });
      }

      query = query.limit(50);

      const { data, error } = await query;
      if (error) throw error;
      setProjects((data || []) as ProjectWithMeta[]);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserVotes = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('project_id, type')
        .eq('user_id', user.id);

      if (error) throw error;

      const voteMap: Record<string, 'up' | 'down'> = {};
      data?.forEach(v => { voteMap[v.project_id] = v.type as 'up' | 'down'; });
      setUserVotes(voteMap);
    } catch (error) {
      console.error('Error loading user votes:', error);
    }
  };

  const tabs: { key: SortTab; label: string; icon: React.ElementType }[] = [
    { key: 'trending', label: 'Trending', icon: TrendingUp },
    { key: 'top', label: 'Top Rated', icon: Star },
    { key: 'newest', label: 'Newest', icon: Clock },
  ];

  const filteredProjects = searchQuery
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
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 w-28 bg-secondary rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl h-80 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search + Filter tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSortBy(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                  sortBy === tab.key
                    ? 'bg-accent text-accent-foreground glow-violet-sm'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
          />
        </div>
      </div>

      {/* Projects grid */}
      {filteredProjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="text-muted-foreground text-lg">
            {searchQuery ? 'No projects match your search.' : 'No projects yet. Be the first to share!'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
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
