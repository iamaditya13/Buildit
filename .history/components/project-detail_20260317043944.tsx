'use client';

import { useEffect, useState } from 'react';
import { Project, supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Trash2, Calendar } from 'lucide-react';
import { VoteButton } from './vote-button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface ProjectDetailProps {
  project: Project;
}

export function ProjectDetail({ project: initialProject }: ProjectDetailProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [project] = useState(initialProject);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadData(); }, [project.id, user]);

  const loadData = async () => {
    if (user) {
      const { data } = await supabase.from('votes').select('type').eq('project_id', project.id).eq('user_id', user.id).single();
      setUserVote(data?.type as 'up' | 'down' || null);
    }
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', project.user_id).single();
    setAuthorProfile(profile);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('projects').delete().eq('id', project.id).eq('user_id', user!.id);
      if (error) throw error;
      router.push('/');
    } catch { alert('Failed to delete project'); }
    finally { setDeleting(false); }
  };

  const isOwner = user?.id === project.user_id;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main column */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Hero image */}
          {project.image_url && (
            <div className="relative h-64 sm:h-80 w-full rounded-xl overflow-hidden bg-muted border border-border">
              <Image src={project.image_url} alt={project.title} fill className="object-cover" priority />
            </div>
          )}

          {/* Title + meta */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">{project.title}</h1>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Calendar size={14} />
                <span>{formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}</span>
              </div>
            </div>
            {isOwner && (
              <button onClick={handleDelete} disabled={deleting} className="text-muted-foreground hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10 min-h-[44px] min-w-[44px] flex items-center justify-center" title="Delete project">
                <Trash2 size={18} />
              </button>
            )}
          </div>

          {/* Vote bar */}
          <div className="flex items-center justify-center py-4 border-y border-border">
            <VoteButton projectId={project.id} initialScore={project.score || 0} initialUserVote={userVote} layout="horizontal" size="lg" />
          </div>

          {/* Tech tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.tags.map(tag => (
                <span key={tag} className="tech-pill px-3 py-1 rounded-lg text-sm">{tag}</span>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">{project.description}</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-3">
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium min-h-[44px]">
                <Github size={16} /> View on GitHub
              </a>
            )}
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium min-h-[44px]">
                <ExternalLink size={16} /> Live Demo
              </a>
            )}
          </div>
        </div>

        {/* Sidebar — author card */}
        {authorProfile && (
          <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="lg:w-80 lg:sticky lg:top-24 lg:self-start bg-card border border-border rounded-xl p-6 space-y-4">
            <Link href={`/profile/${project.user_id}`} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center border border-primary/25">
                {authorProfile.avatar_url
                  ? <Image src={authorProfile.avatar_url} alt={authorProfile.username} width={48} height={48} className="rounded-full" />
                  : <span className="text-lg font-bold text-primary">{authorProfile.username?.charAt(0).toUpperCase()}</span>}
              </div>
              <div>
                <p className="font-semibold text-foreground">{authorProfile.full_name || authorProfile.username}</p>
                <p className="text-sm text-muted-foreground">@{authorProfile.username}</p>
              </div>
            </Link>

            {authorProfile.bio && <p className="text-sm text-muted-foreground">{authorProfile.bio}</p>}

            <div className="flex gap-3 pt-2 border-t border-border">
              {authorProfile.github_url && (
                <a href={authorProfile.github_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Github size={16} /></a>
              )}
              {authorProfile.portfolio_url && (
                <a href={authorProfile.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><ExternalLink size={16} /></a>
              )}
            </div>
          </motion.aside>
        )}
      </div>
    </motion.div>
  );
}
