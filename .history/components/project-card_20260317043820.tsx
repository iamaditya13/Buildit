'use client';

import { Project } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle, ExternalLink, Github } from 'lucide-react';
import { VoteButton } from './vote-button';
import Image from 'next/image';

interface ProjectCardProps {
  project: Project & {
    profiles?: { username: string; avatar_url?: string };
  };
  commentCount?: number;
  userVote: 'up' | 'down' | null;
  index?: number;
}

export function ProjectCard({
  project,
  commentCount = 0,
  userVote,
  index = 0,
}: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="card-hover bg-card rounded-xl overflow-hidden group"
    >
      {/* Thumbnail */}
      {project.image_url && (
        <div className="relative h-44 w-full overflow-hidden bg-muted">
          <Image
            src={project.image_url}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-5">
        {/* Title + description */}
        <Link href={`/projects/${project.id}`} className="block group/link">
          <h3 className="text-base font-bold text-foreground group-hover/link:text-primary transition-colors line-clamp-1 tracking-tight">
            {project.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
          {project.short_description || project.description}
        </p>

        {/* Tech pills */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {project.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="tech-pill px-2 py-0.5 rounded-md">
                {tag}
              </span>
            ))}
            {project.tags.length > 4 && (
              <span className="text-xs text-muted-foreground/60 px-1 py-0.5">
                +{project.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Bottom bar */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          {/* Vote */}
          <VoteButton
            projectId={project.id}
            initialScore={project.score || 0}
            initialUserVote={userVote}
            layout="horizontal"
            size="sm"
          />

          <div className="flex items-center gap-3">
            {/* Comments */}
            <Link
              href={`/projects/${project.id}#comments`}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle size={13} />
              <span className="text-xs">{commentCount}</span>
            </Link>

            {/* Links */}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github size={13} />
              </a>
            )}
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <ExternalLink size={13} />
              </a>
            )}

            {/* Author */}
            <Link href={`/profile/${project.user_id}`} className="flex items-center gap-1.5 ml-1">
              <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-semibold text-primary">
                {project.profiles?.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
                {project.profiles?.username || 'anon'}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
