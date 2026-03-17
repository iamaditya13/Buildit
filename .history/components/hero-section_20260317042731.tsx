'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-[88vh] flex items-center justify-center gradient-hero overflow-hidden">
      {/* Subtle animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, hsla(217,91%,60%,0.15), transparent 70%)', top: '5%', left: '10%' }}
          animate={{ x: [0, 40, 0], y: [0, -25, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, hsla(191,91%,37%,0.12), transparent 70%)', bottom: '0%', right: '5%' }}
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8"
        >
          <Sparkles size={13} className="text-primary" />
          <span className="text-xs font-medium text-primary tracking-wide">Community-Powered Developer Showcase</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight leading-[1.05]"
        >
          <span className="text-foreground">Build. Share.</span>
          <br />
          <span className="bg-gradient-to-r from-primary via-sky-400 to-accent bg-clip-text text-transparent">
            Get Ranked.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
        >
          The platform where developers showcase side projects, the community votes
          them up, and the best work rises to the top.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/projects/create">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-7 text-sm font-semibold gap-2 rounded-xl glow-blue-sm w-full sm:w-auto min-h-[48px]">
              Post a Project
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/explore">
            <Button size="lg" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 h-12 px-7 text-sm font-semibold gap-2 rounded-xl w-full sm:w-auto min-h-[48px]">
              <Sparkles size={16} />
              Explore Projects
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
        >
          {[
            { icon: Code2, label: 'Projects', value: 'Open Source' },
            { icon: Trophy, label: 'Rankings', value: 'Live' },
            { icon: Sparkles, label: 'Community', value: 'Driven' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <s.icon size={14} className="text-primary" />
              <span><span className="text-foreground font-medium">{s.value}</span> {s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
