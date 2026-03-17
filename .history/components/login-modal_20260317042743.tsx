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
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="mx-auto mb-4 w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
          >
            <Rocket className="w-7 h-7 text-primary" />
          </motion.div>
          <DialogTitle className="text-xl font-bold text-foreground text-center">
            Join BuildIt
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-center text-sm">
            {message || 'Sign in to vote, comment, and share your projects.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 mt-4">
          <Link href="/auth/signin" className="w-full">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 gap-2 min-h-[44px]">
              <LogIn size={16} />
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup" className="w-full">
            <Button variant="outline" className="w-full h-11 border-primary/30 text-primary hover:bg-primary/10 min-h-[44px]">
              Create Account
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
