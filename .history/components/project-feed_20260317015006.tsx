'use client';

import { useEffect, useState } from 'react';
import { supabase, Project } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { ProjectCard } from './project-card';
import { motion } from 'framer-motion';

interface ProjectWithCounts extends Project {
  votes: { count: number };
  comments: { count: number };
}

export function ProjectFeed() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithCounts[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  useEffect(() => {
    loadProjects();
    loadUserVotes();
  }, [user, sortBy]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('projects')
        .select(`
          *,
          votes(count),
          comments(count)
        `)
        .order('created_at', { ascending: false });

      if (sortBy === 'popular') {
        // We'll need to sort by vote count on the client since Supabase count is limited
        query = query.limit(100);
      }

      const { data, error } = await query;

      if (error) throw error;

      let processedData = (data || []) as ProjectWithCounts[];

      if (sortBy === 'popular') {
        processedData = processedData.sort(
          (a, b) => (b.votes?.count || 0) - (a.votes?.count || 0)
        );
      }

      setProjects(processedData);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserVotes = async () => {
    if (!user) {
      setUserVotes(new Set());
      return;
    }

    try {
      const { data, error } = await supabase
        .from('votes')
        .select('project_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const votedProjects = new Set(data?.map(v => v.project_id) || []);
      setUserVotes(votedProjects);
    } catch (error) {
      console.error('Error loading user votes:', error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg h-96 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">Featured Projects</h1>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSortBy('recent')}
            className={`px-4 py-2 rounded transition-colors ${
              sortBy === 'recent'
                ? 'bg-accent text-accent-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Recent
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSortBy('popular')}
            className={`px-4 py-2 rounded transition-colors ${
              sortBy === 'popular'
                ? 'bg-accent text-accent-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Popular
          </motion.button>
        </div>
      </div>

      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground text-lg">No projects yet. Be the first to share!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              voteCount={project.votes?.count || 0}
              commentCount={project.comments?.count || 0}
              userVoted={userVotes.has(project.id)}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
