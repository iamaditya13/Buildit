'use client';

import { useEffect, useState } from 'react';
import { Profile, supabase, Project } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { ProjectCard } from './project-card';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface UserProfileProps {
  profile: Profile;
  userId: string;
}

interface ProjectWithCounts extends Project {
  votes: { count: number };
  comments: { count: number };
}

export function UserProfile({ profile: initialProfile, userId }: UserProfileProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUserProjects();
    loadUserVotes();
  }, [userId, user]);

  const loadUserProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          votes(count),
          comments(count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading user projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserVotes = async () => {
    if (!user) {
      setUserVotes(new Set());
      return;
    }

    try {
      const { data, error } = await supabase
        .from('votes')
        .select('project_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const votedProjects = new Set(data?.map(v => v.project_id) || []);
      setUserVotes(votedProjects);
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
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 rounded-full bg-accent/20 flex items-center justify-center text-3xl font-bold text-accent flex-shrink-0">
              {initialProfile.avatar_url ? (
                <Image
                  src={initialProfile.avatar_url}
                  alt={initialProfile.username}
                  width={128}
                  height={128}
                  className="rounded-full"
                />
              ) : (
                initialProfile.username.charAt(0).toUpperCase()
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground">
                {initialProfile.full_name || initialProfile.username}
              </h1>
              <p className="text-xl text-muted-foreground">@{initialProfile.username}</p>

              {initialProfile.bio && (
                <p className="text-foreground mt-3 max-w-2xl">{initialProfile.bio}</p>
              )}

              <p className="text-sm text-muted-foreground mt-3">
                Joined {new Date(initialProfile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
          </div>

          {isOwnProfile && (
            <Link href={`/profile/${userId}/edit`}>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                Edit Profile
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Projects Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">
            Projects ({projects.length})
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg h-96 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-secondary/30 rounded-lg"
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
                voteCount={project.votes?.count || 0}
                commentCount={project.comments?.count || 0}
                userVoted={userVotes.has(project.id)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
