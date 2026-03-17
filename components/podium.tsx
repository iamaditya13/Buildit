'use client';

import { Project } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { VoteButton } from './vote-button';
import { motion } from 'framer-motion';

interface PodiumProps {
  projects: (Project & { profiles?: { username: string } })[];
  userVotes: Record<string, 'up' | 'down'>;
}

export function Podium({ projects, userVotes }: PodiumProps) {
  if (projects.length < 3) return null;

  const podiumOrder = [projects[1], projects[0], projects[2]]; // silver, gold, bronze
  const podiumStyles = [
    { label: '🥈', cls: 'podium-silver', h: 'h-28' },
    { label: '🥇', cls: 'podium-gold', h: 'h-36' },
    { label: '🥉', cls: 'podium-bronze', h: 'h-24' },
  ];

  return (
    <div className="flex items-end justify-center gap-2.5 px-4 pb-4">
      {podiumOrder.map((project, i) => {
        const style = podiumStyles[i];
        return (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex-1 max-w-[130px] ${style.cls} rounded-xl bg-card overflow-hidden`}
          >
            <Link href={`/project/${project.id}`}>
              <div className={`relative w-full ${style.h} bg-muted`}>
                {project.image_url ? (
                  <Image src={project.image_url} alt={project.title} fill className="object-cover" sizes="130px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl">{style.label}</span>
                  </div>
                )}
              </div>
              <div className="p-2.5 text-center">
                <span className="text-lg mb-1 block">{style.label}</span>
                <h3 className="text-xs font-bold text-foreground truncate">{project.title}</h3>
                <p className="text-[10px] text-muted-foreground truncate">@{project.profiles?.username}</p>
              </div>
            </Link>
            <div className="flex justify-center pb-2">
              <VoteButton
                projectId={project.id}
                initialScore={project.score || 0}
                initialUserVote={userVotes[project.id] || null}
                layout="horizontal"
                size="sm"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
