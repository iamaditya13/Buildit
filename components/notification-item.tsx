'use client';

import { Notification } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { UserPlus, ChevronUp, MessageCircle } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification & {
    from_profile?: { username: string; avatar_url?: string };
    project?: { title: string; image_url?: string };
  };
}

const typeConfig = {
  follow: { icon: UserPlus, text: 'started following you', color: 'text-primary' },
  upvote: { icon: ChevronUp, text: 'upvoted your project', color: 'text-primary' },
  comment: { icon: MessageCircle, text: 'commented on your project', color: 'text-accent' },
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 min-h-[56px] ${!notification.seen ? 'bg-primary/5' : ''}`}>
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
        {notification.from_profile?.avatar_url ? (
          <img src={notification.from_profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <span className="text-sm font-bold text-primary">
            {notification.from_profile?.username?.charAt(0).toUpperCase() || '?'}
          </span>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <Link href={`/profile/${notification.from_user_id}`} className="font-semibold hover:text-primary transition-colors">
            {notification.from_profile?.username || 'Someone'}
          </Link>
          {' '}<span className="text-muted-foreground">{config.text}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>

      {/* Project thumbnail (if applicable) */}
      {notification.project?.image_url && (
        <Link href={`/project/${notification.project_id}`} className="flex-shrink-0">
          <img src={notification.project.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
        </Link>
      )}

      {/* Unseen dot */}
      {!notification.seen && (
        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
      )}
    </div>
  );
}
