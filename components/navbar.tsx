'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Plus, Menu, X, Compass, Trophy, Rocket } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const navLinks = [
    { href: '/explore', label: 'Explore', icon: Compass },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <span className="text-xl font-bold tracking-tight text-foreground">
            Build<span className="text-primary">it</span>
          </span>
        </Link>

        {/* Center nav — desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <Icon size={15} />
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right side — desktop */}
        <div className="hidden md:flex items-center gap-3">
          {!loading && user ? (
            <>
              <Link href="/projects/create">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Post a Project
                </Button>
              </Link>
              <Link href={`/profile/${user.id}`}>
                <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-xs font-semibold text-primary hover:border-primary/40 transition-colors cursor-pointer">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              </Link>
              <button
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : !loading ? (
            <>
              <Link href="/auth/signin">
                <Button variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Sign Up
                </Button>
              </Link>
            </>
          ) : null}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-muted-foreground hover:text-foreground p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile slide-in panel */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-16 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-16 right-0 bottom-0 w-72 bg-card border-l border-border z-50 md:hidden overflow-y-auto"
            >
              <div className="p-5 space-y-1">
                {navLinks.map(link => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors min-h-[44px]"
                    >
                      <Icon size={18} />
                      {link.label}
                    </Link>
                  );
                })}

                <div className="border-t border-border my-3" />

                {!loading && user ? (
                  <>
                    <Link
                      href="/projects/create"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-primary min-h-[44px]"
                    >
                      <Plus size={18} />
                      Post a Project
                    </Link>
                    <Link
                      href={`/profile/${user.id}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground min-h-[44px]"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => { handleSignOut(); setMobileOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground w-full min-h-[44px]"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </>
                ) : !loading ? (
                  <div className="space-y-2 pt-2">
                    <Link href="/auth/signin" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full border-primary/40 text-primary hover:bg-primary/10 min-h-[44px]">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px]">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
