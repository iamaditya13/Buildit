'use client';

import { useEffect, useState } from 'react';
import { supabase, Project } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { VoteButton } from '@/components/vote-button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Github, ExternalLink, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LeaderboardProject extends Project {
  profiles?: { username: string; avatar_url?: string };
  comments: { count: number }[];
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<LeaderboardProject[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (user) loadUserVotes();
  }, [user]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`*, profiles(username, avatar_url), comments(count)`)
        .order('score', { ascending: false })
        .limit(100);

      if (error) throw error;
      setProjects((data || []) as LeaderboardProject[]);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
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
      const map: Record<string, 'up' | 'down'> = {};
      data?.forEach(v => { map[v.project_id] = v.type as 'up' | 'down'; });
      setUserVotes(map);
    } catch (error) {
      console.error('Error loading votes:', error);
    }
  };

  const getMedalStyle = (rank: number) => {
    switch (rank) {
      case 0: return { bg: 'bg-gradient-to-r from-yellow-500/15 to-amber-600/10 border-yellow-500/30', emoji: '🥇', glow: 'shadow-yellow-500/10' };
      case 1: return { bg: 'bg-gradient-to-r from-slate-300/10 to-gray-400/5 border-slate-400/25', emoji: '🥈', glow: 'shadow-slate-400/10' };
      case 2: return { bg: 'bg-gradient-to-r from-orange-600/10 to-amber-700/5 border-orange-700/25', emoji: '🥉', glow: 'shadow-orange-500/10' };
      default: return { bg: 'bg-card border-border', emoji: '', glow: '' };
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 text-accent mb-4">
            <Trophy size={24} />
            <span className="text-sm font-semibold uppercase tracking-wider">Global Rankings</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Projects ranked by community votes. Build something amazing and climb the ranks.
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-card border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <p className="text-muted-foreground text-lg">No projects yet. Be the first to share!</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {projects.map((project, index) => {
              const medal = getMedalStyle(index);
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-lg ${medal.bg} ${medal.glow}`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-10 text-center">
                    {medal.emoji ? (
                      <span className="text-2xl">{medal.emoji}</span>
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                    )}
                  </div>

                  {/* Vote */}
                  <div className="flex-shrink-0">
                    <VoteButton
                      projectId={project.id}
                      initialScore={project.score || 0}
                      initialUserVote={userVotes[project.id] || null}
                      layout="vertical"
                      size="sm"
                    />
                  </div>

                  {/* Thumbnail */}
                  {project.image_url && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted hidden sm:block">
                      <Image
                        src={project.image_url}
                        alt={project.title}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/projects/${project.id}`} className="group">
                      <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors truncate">
                        {project.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                      {project.short_description || project.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {project.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="tech-pill text-xs px-2 py-0.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex-shrink-0 hidden sm:flex items-center gap-3 text-muted-foreground">
                    <Link
                      href={`/profile/${project.user_id}`}
                      className="flex items-center gap-1.5 hover:text-accent transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent">
                        {project.profiles?.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <span className="text-xs">{project.profiles?.username}</span>
                    </Link>

                    <div className="flex items-center gap-1">
                      <MessageCircle size={13} />
                      <span className="text-xs">{project.comments?.[0]?.count || 0}</span>
                    </div>

                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                        <Github size={14} />
                      </a>
                    )}
                    {project.live_url && (
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
