'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase, Project, Profile } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { FollowButton } from '@/components/follow-button';
import { ProjectGrid } from '@/components/project-grid';
import { EditProfileForm } from '@/components/edit-profile-form';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Settings, Github, ExternalLink, Grid3X3, Bookmark, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const params = useParams();
  const { user } = useAuth();
  const userId = params.id as string;
  const isOwnProfile = user?.id === userId;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [bookmarkedProjects, setBookmarkedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'posts' | 'bookmarks'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [editing, setEditing] = useState(false);

  useEffect(() => { loadProfile(); }, [userId, user]);

  const loadProfile = async () => {
    setLoading(true);

    const [
      { data: prof },
      { data: projs },
      { data: followers },
      { data: following },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('follows').select('id').eq('following_id', userId),
      supabase.from('follows').select('id').eq('follower_id', userId),
    ]);

    setProfile(prof);
    setProjects(projs || []);
    setFollowersCount((followers || []).length);
    setFollowingCount((following || []).length);

    if (user && user.id !== userId) {
      const { data: follow } = await supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', userId).single();
      setIsFollowing(!!follow);
    }

    if (isOwnProfile && user) {
      const { data: bms } = await supabase.from('bookmarks').select('project_id').eq('user_id', user.id);
      if (bms && bms.length > 0) {
        const pids = bms.map(b => b.project_id);
        const { data: bmProjs } = await supabase.from('projects').select('*').in('id', pids);
        setBookmarkedProjects(bmProjs || []);
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-3 w-40 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">User not found.</p>
      </div>
    );
  }

  if (editing && isOwnProfile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground min-h-[44px]">Cancel</button>
          <h1 className="text-sm font-semibold">Edit Profile</h1>
          <div className="w-12" />
        </div>
        <div className="px-4 py-4">
          <EditProfileForm userId={userId} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={() => window.history.back()} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-sm font-bold text-foreground">{profile.username}</h1>
        {isOwnProfile ? (
          <button className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground">
            <Settings size={20} />
          </button>
        ) : <div className="w-11" />}
      </div>

      {/* Profile info — Instagram style */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-5 mb-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.username} width={80} height={80} className="rounded-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-primary">{profile.username.charAt(0).toUpperCase()}</span>
            )}
          </div>

          {/* Stats */}
          <div className="flex-1 flex justify-around text-center">
            <div>
              <p className="text-lg font-bold text-foreground">{projects.length}</p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{followersCount}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{followingCount}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </div>
        </div>

        {/* Name & bio */}
        {profile.full_name && <p className="text-sm font-bold text-foreground">{profile.full_name}</p>}
        {profile.bio && <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{profile.bio}</p>}

        {/* Links */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {profile.github_url && (
            <a href={profile.github_url} target="_blank" rel="noopener" className="flex items-center gap-1 text-xs text-primary hover:underline">
              <Github size={12} /> {profile.github_url.replace('https://github.com/', '')}
            </a>
          )}
          {profile.portfolio_url && (
            <a href={profile.portfolio_url} target="_blank" rel="noopener" className="flex items-center gap-1 text-xs text-primary hover:underline">
              <ExternalLink size={12} /> Portfolio
            </a>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          {isOwnProfile ? (
            <>
              <button onClick={() => setEditing(true)} className="flex-1 text-sm font-semibold py-2 border border-border rounded-xl text-foreground hover:bg-secondary/50 min-h-[36px]">
                Edit Profile
              </button>
              <button onClick={() => navigator.share?.({ title: profile.username, url: window.location.href })} className="px-4 py-2 border border-border rounded-xl text-muted-foreground hover:text-foreground min-h-[36px]">
                <Share2 size={16} />
              </button>
            </>
          ) : (
            <>
              <div className="flex-1">
                <FollowButton targetUserId={userId} initialFollowing={isFollowing} size="md" />
              </div>
              <button onClick={() => navigator.share?.({ title: profile.username, url: window.location.href })} className="px-4 py-2 border border-border rounded-xl text-muted-foreground hover:text-foreground min-h-[36px]">
                <Share2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button onClick={() => setTab('posts')} className={`flex-1 flex items-center justify-center py-3 min-h-[44px] border-b-2 ${tab === 'posts' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>
          <Grid3X3 size={20} />
        </button>
        {isOwnProfile && (
          <button onClick={() => setTab('bookmarks')} className={`flex-1 flex items-center justify-center py-3 min-h-[44px] border-b-2 ${tab === 'bookmarks' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>
            <Bookmark size={20} />
          </button>
        )}
      </div>

      {/* Project grid */}
      <ProjectGrid projects={tab === 'posts' ? projects : bookmarkedProjects} />
    </div>
  );
}
