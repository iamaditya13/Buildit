'use client';

import { useEffect, useState } from 'react';
import { supabase, Project } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Podium } from '@/components/podium';
import { VoteButton } from '@/components/vote-button';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

type RankedProject = Project & { profiles?: { username: string } };

const filterOptions = [
  { key: 'all', label: 'All Time' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<RankedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});

  useEffect(() => { loadData(); }, [user, filter]);

  const loadData = async () => {
    setLoading(true);

    let query = supabase.from('projects').select('*, profiles(username)').order('score', { ascending: false }).limit(25);

    if (filter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', weekAgo);
    } else if (filter === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', monthAgo);
    }

    const { data } = await query;
    setProjects(data || []);

    if (user) {
      const { data: votes } = await supabase.from('votes').select('project_id, type').eq('user_id', user.id);
      const vm: Record<string, 'up' | 'down'> = {};
      (votes || []).forEach(v => { vm[v.project_id] = v.type; });
      setUserVotes(vm);
    }
    setLoading(false);
  };

  const top3 = projects.slice(0, 3);
  const rest = projects.slice(3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="text-center pt-6 pb-3 px-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Trophy size={18} className="text-primary" />
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">Global Rankings</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Leaderboard</h1>
      </div>

      {/* Filter pills */}
      <div className="flex justify-center gap-2 px-4 pb-4">
        {filterOptions.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all min-h-[32px] ${
              filter === f.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2 px-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 px-4">
          <Trophy size={40} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No projects yet. Be the first to share!</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          <Podium projects={top3} userVotes={userVotes} />

          {/* Ranked list */}
          <div className="px-3">
            {rest.map((project, i) => {
              const rank = i + 4;
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 min-h-[56px] ${
                    i % 2 === 0 ? 'bg-secondary/30' : ''
                  }`}
                >
                  <span className="text-sm font-bold text-muted-foreground w-6 text-center">{rank}</span>
                  <Link href={`/project/${project.id}`} className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {project.image_url ? (
                      <Image src={project.image_url} alt="" width={40} height={40} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-primary/30">{project.title.charAt(0)}</div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/project/${project.id}`}>
                      <p className="text-sm font-semibold text-foreground truncate">{project.title}</p>
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">@{project.profiles?.username}</p>
                  </div>
                  {project.tags && project.tags.length > 0 && (
                    <div className="hidden sm:flex gap-1">
                      {project.tags.slice(0, 2).map(t => (
                        <span key={t} className="tech-pill px-1.5 py-0.5 rounded text-[9px]">{t}</span>
                      ))}
                    </div>
                  )}
                  <VoteButton projectId={project.id} initialScore={project.score || 0} initialUserVote={userVotes[project.id] || null} layout="horizontal" size="sm" />
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
