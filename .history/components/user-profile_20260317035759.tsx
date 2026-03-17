'use client';

import { useEffect, useState } from 'react';
import { Profile, supabase, Project } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { ProjectCard } from './project-card';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink, ArrowUp, Code2 } from 'lucide-react';

interface UserProfileProps {
  profile: Profile;
  userId: string;
}

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

  useEffect(() => {
    loadUserProjects();
    loadUserVotes();
  }, [userId, user]);

  const loadUserProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select(`*, profiles(username, avatar_url), comments(count)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const typedData = (data || []) as ProjectWithMeta[];
      setProjects(typedData);

      // Calculate total upvotes
      const total = typedData.reduce((sum, p) => sum + (p.upvotes || 0), 0);
      setTotalUpvotes(total);
    } catch (error) {
      console.error('Error loading user projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserVotes = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('project_id, type')
        .eq('user_id', user.id);

      if (error) throw error;
      const map: Record<string, 'up' | 'down'> = {};
      data?.forEach(v => { map[v.project_id] = v.type as 'up' | 'down'; });
      setUserVotes(map);
    } catch (error) {
      console.error('Error loading user votes:', error);
    }
  };

  const isOwnProfile = user?.id === userId;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-12"
    >
      {/* Profile Header */}
      <div className="bg-card border border-border rounded-xl p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-accent/20 flex items-center justify-center text-3xl font-bold text-accent flex-shrink-0 border-2 border-accent/30"
          >
            {initialProfile.avatar_url ? (
              <Image
                src={initialProfile.avatar_url}
                alt={initialProfile.username}
                width={112}
                height={112}
                className="rounded-full"
              />
            ) : (
              initialProfile.username.charAt(0).toUpperCase()
            )}
          </motion.div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {initialProfile.full_name || initialProfile.username}
                </h1>
                <p className="text-lg text-muted-foreground">@{initialProfile.username}</p>
              </div>

              {isOwnProfile && (
                <Link href={`/profile/${userId}/edit`}>
                  <Button variant="outline" size="sm" className="border-border/50">
                    Edit Profile
                  </Button>
                </Link>
              )}
            </div>

            {initialProfile.bio && (
              <p className="text-foreground mt-3 max-w-2xl">{initialProfile.bio}</p>
            )}

            {/* Links & stats */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              {(initialProfile as any).github_url && (
                <a
                  href={(initialProfile as any).github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  <Github size={16} />
                  GitHub
                </a>
              )}
              {(initialProfile as any).portfolio_url && (
                <a
                  href={(initialProfile as any).portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  <ExternalLink size={16} />
                  Portfolio
                </a>
              )}
              <span className="text-sm text-muted-foreground">
                Joined {new Date(initialProfile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                })}
              </span>
            </div>

            {/* Stats cards */}
            <div className="flex gap-4 mt-6">
              <div className="bg-secondary/50 rounded-lg px-4 py-3 flex items-center gap-2">
                <Code2 size={18} className="text-accent" />
                <div>
                  <p className="text-xl font-bold text-foreground">{projects.length}</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
              </div>
              <div className="bg-secondary/50 rounded-lg px-4 py-3 flex items-center gap-2">
                <ArrowUp size={18} className="text-accent" />
                <div>
                  <p className="text-xl font-bold text-foreground">{totalUpvotes}</p>
                  <p className="text-xs text-muted-foreground">Upvotes Received</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">
          Projects ({projects.length})
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-secondary/20 rounded-xl border border-border/50"
          >
            <p className="text-muted-foreground mb-4">
              {isOwnProfile ? 'You haven\'t shared any projects yet.' : 'No projects yet.'}
            </p>
            {isOwnProfile && (
              <Link href="/projects/create">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Create Project
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                commentCount={project.comments?.[0]?.count || 0}
                userVote={userVotes[project.id] || null}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
