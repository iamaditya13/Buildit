'use client';

import { useEffect, useState } from 'react';
import { supabase, Project } from '@/lib/supabase';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, ArrowUpRight } from 'lucide-react';
import { VoteButton } from './vote-button';
import { useAuth } from '@/lib/auth-context';

interface ProjectWithProfile extends Project {
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

export function TopProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithProfile[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopProjects();
  }, [user]);

  const loadTopProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`*, profiles(username, avatar_url)`)
        .order('score', { ascending: false })
        .limit(3);

      if (error) throw error;
      setProjects(data || []);

      if (user) {
        const projectIds = (data || []).map(p => p.id);
        if (projectIds.length > 0) {
          const { data: votes } = await supabase
            .from('votes')
            .select('project_id, type')
            .eq('user_id', user.id)
            .in('project_id', projectIds);

          const voteMap: Record<string, 'up' | 'down'> = {};
          votes?.forEach(v => { voteMap[v.project_id] = v.type as 'up' | 'down'; });
          setUserVotes(voteMap);
        }
      }
    } catch (error) {
      console.error('Error loading top projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const medals = [
    { emoji: '🥇', gradient: 'from-yellow-500/20 to-amber-600/10 border-yellow-500/30', label: '1st' },
    { emoji: '🥈', gradient: 'from-slate-300/20 to-gray-400/10 border-slate-400/30', label: '2nd' },
    { emoji: '🥉', gradient: 'from-orange-600/20 to-amber-700/10 border-orange-700/30', label: '3rd' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl h-72 animate-pulse" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) return null;

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 text-accent mb-4">
            <Trophy size={20} />
            <span className="text-sm font-semibold uppercase tracking-wider">Leaderboard</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Top Ranked Projects</h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            The community-voted best developer projects right now
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -6 }}
              className={`relative bg-gradient-to-br ${medals[index]?.gradient || ''} border rounded-xl overflow-hidden group`}
            >
              {/* Medal badge */}
              <div className="absolute top-4 left-4 z-10 text-2xl">
                {medals[index]?.emoji}
              </div>

              {/* Project image */}
              {project.image_url && (
                <div className="relative h-40 w-full overflow-hidden bg-muted">
                  <Image
                    src={project.image_url}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                </div>
              )}

              <div className="p-5">
                <Link href={`/projects/${project.id}`} className="block group/link">
                  <h3 className="text-lg font-bold text-foreground group-hover/link:text-accent transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                </Link>

                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {project.short_description || project.description}
                </p>

                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {project.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tech-pill text-xs px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent">
                      {project.profiles?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {project.profiles?.username || 'anonymous'}
                    </span>
                  </div>

                  <VoteButton
                    projectId={project.id}
                    initialScore={project.score || 0}
                    initialUserVote={userVotes[project.id] || null}
                    layout="horizontal"
                    size="sm"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-semibold transition-colors"
          >
            View Full Leaderboard
            <ArrowUpRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
