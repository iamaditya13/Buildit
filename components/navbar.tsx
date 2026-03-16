'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, Plus } from 'lucide-react';

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-b border-border sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold text-accent"
          >
            Buildit
          </motion.div>
        </Link>

        <div className="flex items-center gap-4">
          {!loading && user ? (
            <>
              <Link href="/projects/create">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-2">
                  <Plus size={18} />
                  Share Project
                </Button>
              </Link>
              <Link href={`/profile/${user.id}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-sm font-medium text-foreground hover:text-accent transition-colors"
                >
                  Profile
                </motion.div>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-accent transition-colors"
                title="Sign out"
              >
                <LogOut size={20} />
              </motion.button>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
