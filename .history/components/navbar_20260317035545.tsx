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
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong sticky top-0 z-50 border-b border-border/50"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Rocket size={18} className="text-accent-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Build<span className="text-accent">It</span>
            </span>
          </motion.div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all flex items-center gap-2"
                >
                  <Icon size={16} />
                  {link.label}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Desktop auth section */}
        <div className="hidden md:flex items-center gap-3">
          {!loading && user ? (
            <>
              <Link href="/projects/create">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 rounded-lg glow-violet-sm">
                  <Plus size={16} />
                  Share Project
                </Button>
              </Link>
              <Link href={`/profile/${user.id}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-sm font-semibold text-accent border border-accent/30 hover:border-accent/50 transition-colors cursor-pointer"
                >
                  {user.email?.charAt(0).toUpperCase()}
                </motion.div>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-accent transition-colors p-2"
                title="Sign out"
              >
                <LogOut size={18} />
              </motion.button>
            </>
          ) : !loading ? (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg">
                  Sign Up
                </Button>
              </Link>
            </>
          ) : null}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-muted-foreground hover:text-foreground p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border/50"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}

              <div className="border-t border-border/50 pt-3 mt-3 space-y-2">
                {!loading && user ? (
                  <>
                    <Link
                      href="/projects/create"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-accent"
                    >
                      <Plus size={18} />
                      Share Project
                    </Link>
                    <Link
                      href={`/profile/${user.id}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => { handleSignOut(); setMobileOpen(false); }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground w-full"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </>
                ) : !loading ? (
                  <>
                    <Link
                      href="/auth/signin"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2.5 rounded-lg text-sm font-medium bg-accent text-accent-foreground text-center"
                    >
                      Sign Up
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
