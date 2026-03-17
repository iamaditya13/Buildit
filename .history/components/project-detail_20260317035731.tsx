'use client';

import { useEffect, useState } from 'react';
import { Project, supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Trash2 } from 'lucide-react';
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
  const [score, setScore] = useState(initialProject.score || 0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, [project.id, user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load score
      setScore(project.score || 0);

      // Check user vote
      if (user) {
        const { data } = await supabase
          .from('votes')
          .select('type')
          .eq('project_id', project.id)
          .eq('user_id', user.id)
          .single();

        setUserVote(data?.type as 'up' | 'down' || null);
      }

      // Load author
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', project.user_id)
        .single();

      setAuthorProfile(profile);
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)
        .eq('user_id', user!.id);

      if (error) throw error;
      router.push('/');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const isOwner = user?.id === project.user_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {project.image_url && (
        <div className="relative h-72 sm:h-96 w-full rounded-xl overflow-hidden bg-muted border border-border/50">
          <Image
            src={project.image_url}
            alt={project.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
      )}

      <div className="flex gap-6">
        {/* Vote column */}
        <div className="flex-shrink-0 pt-1">
          <VoteButton
            projectId={project.id}
            initialScore={score}
            initialUserVote={userVote}
            layout="vertical"
            size="lg"
          />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{project.title}</h1>
            {isOwner && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                disabled={deleting}
                className="text-destructive-foreground hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10"
                title="Delete project"
              >
                <Trash2 size={20} />
              </motion.button>
            )}
          </div>

          {/* Author card */}
          {authorProfile && (
            <Link href={`/profile/${project.user_id}`} className="inline-flex items-center gap-3 hover:bg-secondary/30 rounded-lg px-3 py-2 -ml-3 transition-colors">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                {authorProfile.avatar_url ? (
                  <Image src={authorProfile.avatar_url} alt={authorProfile.username} width={40} height={40} className="rounded-full" />
                ) : (
                  <span className="text-sm font-bold text-accent">
                    {authorProfile.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{authorProfile.full_name || authorProfile.username}</p>
                <p className="text-xs text-muted-foreground">@{authorProfile.username}</p>
              </div>
            </Link>
          )}

          <p className="text-sm text-muted-foreground">
            Posted {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-foreground whitespace-pre-wrap leading-relaxed">{project.description}</p>
      </div>

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="tech-pill text-sm px-3 py-1 rounded-lg">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Links */}
      <div className="flex items-center gap-4 py-4 border-y border-border/50">
        {project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
          >
            <Github size={18} />
            View Source
          </a>
        )}

        {project.live_url && (
          <a
            href={project.live_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors text-sm font-medium"
          >
            <ExternalLink size={18} />
            Live Demo
          </a>
        )}
      </div>
    </motion.div>
  );
}
