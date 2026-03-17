'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';

export function CreateProjectForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', shortDescription: '', description: '', imageUrl: '', githubUrl: '', liveUrl: '' });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) { setTags(p => [...p, t]); setTagInput(''); }
  };
  const removeTag = (t: string) => setTags(p => p.filter(x => x !== t));
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      if (!user) throw new Error('You must be logged in');
      if (!formData.title || !formData.description) throw new Error('Please fill in all required fields');
      const { data, error: err } = await supabase.from('projects').insert({
        user_id: user.id, title: formData.title, short_description: formData.shortDescription || null,
        description: formData.description, image_url: formData.imageUrl || null,
        github_url: formData.githubUrl || null, live_url: formData.liveUrl || null, tags,
      }).select().single();
      if (err) throw err;
      router.push(`/project/${data.id}`);
    } catch (err) { setError(err instanceof Error ? err.message : 'An error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <motion.form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-xl p-6 sm:p-8"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

      {error && <div className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <FieldGroup>
        <FieldLabel htmlFor="title">Project Title *</FieldLabel>
        <Input id="title" name="title" placeholder="My Amazing Project" value={formData.title} onChange={handleChange} disabled={loading} required
          className="bg-input border-border focus:ring-primary/50 focus:border-primary/30" />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="shortDescription">Short Description</FieldLabel>
        <Input id="shortDescription" name="shortDescription" placeholder="A one-liner about your project" value={formData.shortDescription} onChange={handleChange} disabled={loading} maxLength={200}
          className="bg-input border-border focus:ring-primary/50 focus:border-primary/30" />
        <p className="text-xs text-muted-foreground mt-1">{formData.shortDescription.length}/200 — Shows on cards and leaderboard</p>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="description">Full Description *</FieldLabel>
        <textarea id="description" name="description" placeholder="Tell us about your project in detail..." value={formData.description} onChange={handleChange} disabled={loading} required rows={8}
          className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all" />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Tech Stack</FieldLabel>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <motion.span key={tag} initial={{ scale: 0.85 }} animate={{ scale: 1 }} className="tech-pill px-3 py-1 rounded-lg text-sm flex items-center gap-1.5">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-red-400 transition-colors"><X size={12} /></button>
            </motion.span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="e.g. React, Next.js, Tailwind..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} disabled={loading || tags.length >= 10}
            className="bg-input border-border focus:ring-primary/50" />
          <Button type="button" onClick={addTag} disabled={!tagInput.trim() || tags.length >= 10} variant="outline" size="icon" className="flex-shrink-0 border-border min-h-[44px] min-w-[44px]"><Plus size={16} /></Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{tags.length}/10 — Press Enter or comma</p>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="imageUrl">Screenshot URL</FieldLabel>
        <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://..." value={formData.imageUrl} onChange={handleChange} disabled={loading}
          className="bg-input border-border focus:ring-primary/50" />
      </FieldGroup>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel htmlFor="githubUrl">GitHub URL</FieldLabel>
          <Input id="githubUrl" name="githubUrl" type="url" placeholder="https://github.com/..." value={formData.githubUrl} onChange={handleChange} disabled={loading}
            className="bg-input border-border focus:ring-primary/50" />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="liveUrl">Live Demo URL</FieldLabel>
          <Input id="liveUrl" name="liveUrl" type="url" placeholder="https://..." value={formData.liveUrl} onChange={handleChange} disabled={loading}
            className="bg-input border-border focus:ring-primary/50" />
        </FieldGroup>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-sm font-semibold glow-blue-sm min-h-[48px]">
        {loading ? 'Creating...' : 'Launch Project'}
      </Button>
    </motion.form>
  );
}
