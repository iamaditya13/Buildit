'use client';

import { useEffect, useState } from 'react';
import { supabase, Notification } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { NotificationItem } from '@/components/notification-item';
import { ArrowLeft, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

type NotificationWithData = Notification & {
  from_profile?: { username: string; avatar_url?: string };
  project?: { title: string; image_url?: string };
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) loadNotifications(); }, [user]);

  const loadNotifications = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select(`*, from_profile:profiles!notifications_from_user_id_fkey(username, avatar_url), project:projects(title, image_url)`)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifications(data || []);

    // Mark all as seen
    await supabase.from('notifications').update({ seen: true }).eq('user_id', user!.id).eq('seen', false);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={() => window.history.back()} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-foreground">Notifications</h1>
      </div>

      {loading ? (
        <div className="space-y-2 p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 h-14">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                <div className="h-2 w-20 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : !user ? (
        <div className="text-center py-16 px-4">
          <p className="text-muted-foreground text-sm">Sign in to see notifications.</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 px-4">
          <Bell size={40} className="text-muted-foreground/30 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground mb-1">No notifications</h2>
          <p className="text-sm text-muted-foreground">When people interact with your projects, you'll see it here.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {notifications.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
              <NotificationItem notification={n} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
