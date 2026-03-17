'use client';

import { Project } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, ExternalLink, Github } from 'lucide-react';
import { VoteButton } from './vote-button';
import Image from 'next/image';

interface ProjectCardProps {
  project: Project;
  voteCount: number;
  commentCount: number;
  userVoted: boolean;
  index?: number;
}

export function ProjectCard({
  project,
  voteCount,
  commentCount,
  userVoted,
  index = 0,
}: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      {project.image_url && (
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <Image
            src={project.image_url}
            alt={project.title}
            fill
            className="object-cover hover:scale-105 transition-transform"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-6">
        <Link href={`/projects/${project.id}`} className="block group">
          <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors line-clamp-2">
            {project.title}
          </h3>
        </Link>

        <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
          {project.description}
        </p>

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="text-muted-foreground text-xs px-2 py-1">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="text-xs">
              {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors p-1"
                title="View on GitHub"
              >
                <Github size={18} />
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors p-1"
                title="View Live"
              >
                <ExternalLink size={18} />
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <VoteButton projectId={project.id} userVoted={userVoted} />
          <span className="text-sm text-muted-foreground">{voteCount} votes</span>

          <Link
            href={`/projects/${project.id}#comments`}
            className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
          >
            <MessageCircle size={18} />
            <span className="text-sm">{commentCount}</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
