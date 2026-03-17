'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { motion } from 'framer-motion';

export function SignInForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      if (!formData.email || !formData.password) throw new Error('Please enter your email and password');
      await signIn(formData.email, formData.password);
      router.push('/');
    } catch (err) { setError(err instanceof Error ? err.message : 'An error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <motion.form onSubmit={handleSubmit} className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-2 rounded-lg text-sm">{error}</div>
      )}

      <FieldGroup>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} disabled={loading}
          className="bg-input border-border focus:ring-primary/50 focus:border-primary/30" />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <Input id="password" name="password" type="password" placeholder="••••••" value={formData.password} onChange={handleChange} disabled={loading}
          className="bg-input border-border focus:ring-primary/50 focus:border-primary/30" />
      </FieldGroup>

      <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 min-h-[44px] font-semibold" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </motion.form>
  );
}
