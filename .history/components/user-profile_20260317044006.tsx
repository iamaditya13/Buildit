'use client';

import { useEffect, useState } from 'react';
import { Profile, supabase, Project } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { ProjectCard } from './project-card';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink, ArrowUp, Code2, Calendar } from 'lucide-react';

interface UserProfileProps { profile: Profile; userId: string; }

interface ProjectWithMeta extends Project {
  profiles?: { username: string; avatar_url?: string };
  comments: { count: number }[];
}

export function UserProfile({ profile: initialProfile, userId }: UserProfileProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [totalUpvotes, setTotalUpvotes] = useState(0);

  useEffect(() => { loadData(); }, [userId, user]);

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from('projects').select(`*, profiles(username, avatar_url), comments(count)`).eq('user_id', userId).order('created_at', { ascending: false });
    const typed = (data || []) as ProjectWithMeta[];
    setProjects(typed);
    setTotalUpvotes(typed.reduce((s, p) => s + (p.upvotes || 0), 0));

    if (user) {
      const { data: votes } = await supabase.from('votes').select('project_id, type').eq('user_id', user.id);
      const map: Record<string, 'up' | 'down'> = {};
      votes?.forEach(v => { map[v.project_id] = v.type as 'up' | 'down'; });
      setUserVotes(map);
    }
    setLoading(false);
  };

  const isOwn = user?.id === userId;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      {/* Profile header */}
      <div className="text-center">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
          className="w-24 h-24 mx-auto rounded-full bg-primary/15 flex items-center justify-center text-3xl font-bold text-primary border-2 border-primary/25">
          {initialProfile.avatar_url
            ? <Image src={initialProfile.avatar_url} alt={initialProfile.username} width={96} height={96} className="rounded-full" />
            : initialProfile.username.charAt(0).toUpperCase()}
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-4 tracking-tight">
          {initialProfile.full_name || initialProfile.username}
        </h1>
        <p className="text-muted-foreground">@{initialProfile.username}</p>

        {initialProfile.bio && <p className="text-muted-foreground mt-3 max-w-md mx-auto">{initialProfile.bio}</p>}

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm">
          {(initialProfile as any).github_url && (
            <a href={(initialProfile as any).github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
              <Github size={15} /> GitHub
            </a>
          )}
          {(initialProfile as any).portfolio_url && (
            <a href={(initialProfile as any).portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
              <ExternalLink size={15} /> Portfolio
            </a>
          )}
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar size={14} />
            Joined {new Date(initialProfile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </span>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-4 mt-6">
          <div className="bg-card border border-border rounded-xl px-5 py-3 flex items-center gap-2.5">
            <Code2 size={16} className="text-primary" />
            <div className="text-left">
              <p className="text-lg font-bold text-foreground">{projects.length}</p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl px-5 py-3 flex items-center gap-2.5">
            <ArrowUp size={16} className="text-primary" />
            <div className="text-left">
              <p className="text-lg font-bold text-foreground">{totalUpvotes}</p>
              <p className="text-xs text-muted-foreground">Upvotes</p>
            </div>
          </div>
        </div>

        {isOwn && (
          <Link href={`/profile/${userId}/edit`} className="mt-4 inline-block">
            <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">Edit Profile</Button>
          </Link>
        )}
      </div>

      {/* Projects */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-6 tracking-tight">Projects ({projects.length})</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-card border border-border rounded-xl h-80 animate-pulse" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <p className="text-muted-foreground mb-4">{isOwn ? 'You haven\'t shared any projects yet.' : 'No projects yet.'}</p>
            {isOwn && <Link href="/projects/create"><Button className="bg-primary text-primary-foreground hover:bg-primary/90">Post a Project</Button></Link>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p, i) => <ProjectCard key={p.id} project={p} commentCount={p.comments?.[0]?.count || 0} userVote={userVotes[p.id] || null} index={i} />)}
          </div>
        )}
      </div>
    </motion.div>
  );
}
