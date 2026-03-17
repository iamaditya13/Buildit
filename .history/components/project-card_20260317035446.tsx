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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="bg-card border border-border rounded-xl overflow-hidden hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 group"
    >
      {project.image_url && (
        <div className="relative h-44 w-full overflow-hidden bg-muted">
          <Image
            src={project.image_url}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      <div className="p-5">
        <div className="flex gap-3">
          {/* Vote buttons */}
          <VoteButton
            projectId={project.id}
            initialScore={project.score || 0}
            initialUserVote={userVote}
            layout="vertical"
            size="sm"
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
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
                {project.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="tech-pill text-xs px-2 py-0.5 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
                {project.tags.length > 4 && (
                  <span className="text-muted-foreground text-xs px-1 py-0.5">
                    +{project.tags.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-3">
            {/* Author */}
            <Link
              href={`/profile/${project.user_id}`}
              className="flex items-center gap-2 hover:text-accent transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent">
                {project.profiles?.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="text-xs text-muted-foreground">
                {project.profiles?.username || 'anonymous'}
              </span>
            </Link>

            <span className="text-xs text-muted-foreground/50">·</span>

            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/projects/${project.id}#comments`}
              className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors"
            >
              <MessageCircle size={14} />
              <span className="text-xs">{commentCount}</span>
            </Link>

            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors p-1"
                title="GitHub"
              >
                <Github size={14} />
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors p-1"
                title="Live Demo"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
