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

interface LeaderboardProject extends Project {
  profiles?: { username: string; avatar_url?: string };
  comments: { count: number }[];
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<LeaderboardProject[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { if (user) loadUserVotes(); }, [user]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase.from('projects').select(`*, profiles(username, avatar_url), comments(count)`).order('score', { ascending: false }).limit(100);
      if (error) throw error;
      setProjects((data || []) as LeaderboardProject[]);
    } catch (err) { console.error('Error:', err); }
    finally { setLoading(false); }
  };

  const loadUserVotes = async () => {
    if (!user) return;
    const { data } = await supabase.from('votes').select('project_id, type').eq('user_id', user.id);
    const map: Record<string, 'up' | 'down'> = {};
    data?.forEach(v => { map[v.project_id] = v.type as 'up' | 'down'; });
    setUserVotes(map);
  };

  const getMedalClass = (i: number) => {
    if (i === 0) return 'medal-gold';
    if (i === 1) return 'medal-silver';
    if (i === 2) return 'medal-bronze';
    return '';
  };
  const getMedal = (i: number) => ['🥇', '🥈', '🥉'][i] || '';

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-primary mb-3">
            <Trophy size={20} />
            <span className="text-xs font-semibold uppercase tracking-widest">Global Rankings</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Projects ranked by community votes. Build something amazing and climb the ranks.
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />)}
          </div>
        ) : projects.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No projects yet. Be the first to share!</p>
        ) : (
          <div className="space-y-2">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl border border-border ${getMedalClass(i)} ${i % 2 === 1 ? 'lb-row-alt' : 'bg-card'} lb-row min-h-[64px]`}
              >
                {/* Rank */}
                <div className="w-8 text-center flex-shrink-0">
                  {getMedal(i) ? (
                    <span className="text-xl">{getMedal(i)}</span>
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">#{i + 1}</span>
                  )}
                </div>

                {/* Vote */}
                <div className="flex-shrink-0">
                  <VoteButton projectId={project.id} initialScore={project.score || 0} initialUserVote={userVotes[project.id] || null} layout="vertical" size="sm" />
                </div>

                {/* Thumb */}
                {project.image_url && (
                  <div className="hidden sm:block flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted">
                    <Image src={project.image_url} alt={project.title} width={48} height={48} className="object-cover w-full h-full" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/projects/${project.id}`} className="group">
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{project.title}</h3>
                  </Link>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{project.short_description || project.description}</p>
                  <div className="flex gap-1.5 mt-1">
                    {project.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className="tech-pill text-[10px] px-1.5 py-px rounded">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Meta */}
                <div className="hidden sm:flex items-center gap-3 flex-shrink-0 text-muted-foreground">
                  <Link href={`/profile/${project.user_id}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-semibold text-primary">
                      {project.profiles?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="text-xs">{project.profiles?.username}</span>
                  </Link>
                  <span className="flex items-center gap-0.5"><MessageCircle size={12} /><span className="text-xs">{project.comments?.[0]?.count || 0}</span></span>
                  {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Github size={13} /></a>}
                  {project.live_url && <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><ExternalLink size={13} /></a>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
