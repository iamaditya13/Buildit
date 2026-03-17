'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Rocket, ArrowRight, Code2, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center gradient-hero overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-72 h-72 rounded-full bg-accent/10 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: '10%', left: '15%' }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
          style={{ bottom: '10%', right: '10%' }}
        />
        <motion.div
          className="absolute w-48 h-48 rounded-full bg-chart-4/10 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: '50%', left: '50%' }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-accent/20 mb-8"
        >
          <Sparkles size={14} className="text-accent" />
          <span className="text-sm text-accent font-medium">Community-Powered Developer Showcase</span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6"
        >
          <span className="text-foreground">Build.</span>{' '}
          <span className="text-foreground">Share.</span>{' '}
          <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-chart-4 glow-text">
            Get Ranked.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          The platform where developers showcase side projects, the community votes them up,
          and the best work rises to the top of the leaderboard.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/explore">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 h-14 px-8 text-base font-semibold gap-2 glow-violet rounded-xl"
            >
              <Rocket size={20} />
              Explore Projects
              <ArrowRight size={18} />
            </Button>
          </Link>
          <Link href="/projects/create">
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base font-semibold gap-2 border-border/60 hover:bg-secondary rounded-xl"
            >
              <Code2 size={20} />
              Share Your Project
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex items-center justify-center gap-8 mt-14"
        >
          {[
            { icon: Code2, label: 'Projects', value: 'Open Source' },
            { icon: Trophy, label: 'Rankings', value: 'Live' },
            { icon: Sparkles, label: 'Community', value: 'Driven' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -2 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <stat.icon size={16} className="text-accent" />
              <span className="text-sm">
                <span className="text-foreground font-semibold">{stat.value}</span>{' '}
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
