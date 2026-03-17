'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogIn, Rocket } from 'lucide-react';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

export function LoginModal({ open, onOpenChange, message }: LoginModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-border/50 sm:max-w-md">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="mx-auto mb-4 w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center"
          >
            <Rocket className="w-8 h-8 text-accent" />
          </motion.div>
          <DialogTitle className="text-2xl font-bold text-foreground text-center">
            Join BuildIt
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-center">
            {message || 'Sign in to vote, comment, and share your projects with the community.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Link href="/auth/signin" className="w-full">
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base gap-2">
              <LogIn size={18} />
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup" className="w-full">
            <Button variant="outline" className="w-full h-12 text-base border-border/50 hover:bg-secondary">
              Create Account
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-2">
          Join thousands of developers showcasing their work
        </p>
      </DialogContent>
    </Dialog>
  );
}
