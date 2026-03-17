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
  const [project, setProject] = useState(initialProject);
  const [voteCount, setVoteCount] = useState(0);
  const [userVoted, setUserVoted] = useState(false);
  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, [project.id, user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load vote count
      const { count: voteCount } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);

      setVoteCount(voteCount || 0);

      // Check if user voted
      if (user) {
        const { data } = await supabase
          .from('votes')
          .select('id')
          .eq('project_id', project.id)
          .eq('user_id', user.id)
          .single();

        setUserVoted(!!data);
      }

      // Load author profile
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
        <div className="relative h-96 w-full rounded-lg overflow-hidden bg-muted">
          <Image
            src={project.image_url}
            alt={project.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-foreground">{project.title}</h1>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {authorProfile && (
              <Link href={`/profile/${project.user_id}`} className="hover:text-accent transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    {authorProfile.avatar_url ? (
                      <Image
                        src={authorProfile.avatar_url}
                        alt={authorProfile.username}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-accent">
                        {authorProfile.username?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{authorProfile.full_name || authorProfile.username}</p>
                    <p className="text-sm text-muted-foreground">@{authorProfile.username}</p>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {isOwner && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              disabled={deleting}
              className="text-destructive hover:text-destructive/80 transition-colors p-2"
              title="Delete project"
            >
              <Trash2 size={20} />
            </motion.button>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Posted {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-foreground whitespace-pre-wrap">{project.description}</p>
      </div>

      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="bg-secondary text-secondary-foreground text-sm px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-6 py-4 border-y border-border">
        <div className="flex items-center gap-2">
          <VoteButton projectId={project.id} userVoted={userVoted} />
          <span className="text-sm text-muted-foreground">{voteCount} votes</span>
        </div>

        {project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
          >
            <Github size={20} />
            <span className="text-sm">GitHub</span>
          </a>
        )}

        {project.live_url && (
          <a
            href={project.live_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
          >
            <ExternalLink size={20} />
            <span className="text-sm">Live Demo</span>
          </a>
        )}
      </div>
    </motion.div>
  );
}
