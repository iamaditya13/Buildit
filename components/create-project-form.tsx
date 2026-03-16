'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { motion } from 'framer-motion';

export function CreateProjectForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    githubUrl: '',
    liveUrl: '',
    tags: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!user) throw new Error('You must be logged in');
      if (!formData.title || !formData.description) {
        throw new Error('Please fill in all required fields');
      }

      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const { data, error: insertError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          image_url: formData.imageUrl || null,
          github_url: formData.githubUrl || null,
          live_url: formData.liveUrl || null,
          tags,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/projects/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6 bg-card border border-border rounded-lg p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {error && (
        <motion.div
          className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.div>
      )}

      <FieldGroup>
        <FieldLabel htmlFor="title">Project Title *</FieldLabel>
        <Input
          id="title"
          name="title"
          type="text"
          placeholder="My Amazing Project"
          value={formData.title}
          onChange={handleChange}
          disabled={loading}
          required
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="description">Description *</FieldLabel>
        <textarea
          id="description"
          name="description"
          placeholder="Tell us about your project..."
          value={formData.description}
          onChange={handleChange}
          disabled={loading}
          required
          rows={6}
          className="w-full bg-input border border-border rounded px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="imageUrl">Project Image URL</FieldLabel>
        <Input
          id="imageUrl"
          name="imageUrl"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={formData.imageUrl}
          onChange={handleChange}
          disabled={loading}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="githubUrl">GitHub URL</FieldLabel>
        <Input
          id="githubUrl"
          name="githubUrl"
          type="url"
          placeholder="https://github.com/username/repo"
          value={formData.githubUrl}
          onChange={handleChange}
          disabled={loading}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="liveUrl">Live Demo URL</FieldLabel>
        <Input
          id="liveUrl"
          name="liveUrl"
          type="url"
          placeholder="https://myproject.com"
          value={formData.liveUrl}
          onChange={handleChange}
          disabled={loading}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="tags">Tags (comma-separated)</FieldLabel>
        <Input
          id="tags"
          name="tags"
          type="text"
          placeholder="React, Next.js, Tailwind"
          value={formData.tags}
          onChange={handleChange}
          disabled={loading}
        />
      </FieldGroup>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {loading ? 'Creating...' : 'Create Project'}
      </Button>
    </motion.form>
  );
}
