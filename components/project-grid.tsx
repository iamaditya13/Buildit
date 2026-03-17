'use client';

import { Project } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-sm">No projects yet.</p>
      </div>
    );
  }

  return (
    <div className="project-grid">
      {projects.map(project => (
        <Link key={project.id} href={`/project/${project.id}`} className="block">
          <div className="relative aspect-square bg-secondary overflow-hidden">
            {project.image_url ? (
              <Image
                src={project.image_url}
                alt={project.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 33vw, 200px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                <span className="text-2xl font-bold text-primary/30">
                  {project.title.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
