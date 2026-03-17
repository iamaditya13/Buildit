'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, PlusCircle, Trophy, User } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/feed', icon: Home, label: 'Feed' },
  { href: '/explore', icon: Search, label: 'Explore' },
  { href: '/submit', icon: PlusCircle, label: 'Post' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getHref = (item: typeof navItems[0]) => {
    if (item.href === '/profile' && user) return `/profile/${user.id}`;
    if (item.href === '/submit' && !user) return '/auth/signin';
    return item.href;
  };

  const isActive = (href: string) => {
    if (href === '/feed') return pathname === '/' || pathname === '/feed';
    if (href === '/profile') return pathname.startsWith('/profile');
    return pathname.startsWith(href);
  };

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around h-[52px] max-w-lg mx-auto px-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={getHref(item)}
              className={`flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
              aria-label={item.label}
            >
              <Icon
                size={24}
                strokeWidth={active ? 2.2 : 1.6}
                fill={active && item.icon !== PlusCircle ? 'currentColor' : 'none'}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
