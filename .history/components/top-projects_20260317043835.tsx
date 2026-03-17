'use client';

import { useEffect, useState } from 'react';
import { supabase, Project } from '@/lib/supabase';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, ArrowRight } from 'lucide-react';
import { VoteButton } from './vote-button';
import { useAuth } from '@/lib/auth-context';

interface ProjectWithProfile extends Project {
  profiles?: { username: string; avatar_url?: string };
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
        const ids = (data || []).map(p => p.id);
        if (ids.length > 0) {
          const { data: votes } = await supabase.from('votes').select('project_id, type').eq('user_id', user.id).in('project_id', ids);
          const map: Record<string, 'up' | 'down'> = {};
          votes?.forEach(v => { map[v.project_id] = v.type as 'up' | 'down'; });
          setUserVotes(map);
        }
      }
    } catch (err) {
      console.error('Error loading top projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const medals = ['🥇', '🥈', '🥉'];
  const medalBorder = ['border-l-yellow-500', 'border-l-gray-400', 'border-l-amber-700'];

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
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Trophy size={18} />
              <span className="text-xs font-semibold uppercase tracking-widest">Top Projects This Week</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Community Favorites</h2>
          </div>
          <Link href="/leaderboard" className="hidden sm:flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
            View Leaderboard
            <ArrowRight size={15} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`card-hover bg-card rounded-xl overflow-hidden border-l-[3px] ${medalBorder[index] || 'border-l-border'} group`}
            >
              {/* Thumbnail */}
              {project.image_url && (
                <div className="relative h-40 w-full overflow-hidden bg-muted">
                  <Image src={project.image_url} alt={project.title} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
              )}

              <div className="p-4">
                {/* Medal + title */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{medals[index]}</span>
                  <Link href={`/projects/${project.id}`}>
                    <h3 className="text-base font-bold text-foreground hover:text-primary transition-colors truncate tracking-tight">
                      {project.title}
                    </h3>
                  </Link>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {project.short_description || project.description}
                </p>

                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {project.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tech-pill px-2 py-0.5 rounded-md">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <VoteButton
                    projectId={project.id}
                    initialScore={project.score || 0}
                    initialUserVote={userVotes[project.id] || null}
                    layout="horizontal"
                    size="sm"
                  />
                  <Link href={`/profile/${project.user_id}`} className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-semibold text-primary">
                      {project.profiles?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="text-xs text-muted-foreground">{project.profiles?.username}</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link href="/leaderboard" className="text-sm text-primary font-medium inline-flex items-center gap-1.5">
            View Leaderboard <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
