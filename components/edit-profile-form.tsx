'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Profile } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { motion } from 'framer-motion';

interface EditProfileFormProps {
  userId: string;
}

export function EditProfileForm({ userId }: EditProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    bio: '',
    avatarUrl: '',
  });

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        setFormData({
          username: data.username || '',
          fullName: data.full_name || '',
          bio: data.bio || '',
          avatarUrl: data.avatar_url || '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName || null,
          bio: formData.bio || null,
          avatar_url: formData.avatarUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        router.push(`/profile/${userId}`);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">Loading profile...</div>
    );
  }

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

      {success && (
        <motion.div
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Profile updated successfully!
        </motion.div>
      )}

      <FieldGroup>
        <FieldLabel htmlFor="username">Username</FieldLabel>
        <Input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          disabled
          className="bg-muted text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground mt-1">Username cannot be changed</p>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={handleChange}
          disabled={saving}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="bio">Bio</FieldLabel>
        <textarea
          id="bio"
          name="bio"
          placeholder="Tell us about yourself..."
          value={formData.bio}
          onChange={handleChange}
          disabled={saving}
          rows={4}
          className="w-full bg-input border border-border rounded px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="avatarUrl">Avatar URL</FieldLabel>
        <Input
          id="avatarUrl"
          name="avatarUrl"
          type="url"
          placeholder="https://example.com/avatar.jpg"
          value={formData.avatarUrl}
          onChange={handleChange}
          disabled={saving}
        />
      </FieldGroup>

      <Button
        type="submit"
        disabled={saving}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </motion.form>
  );
}
