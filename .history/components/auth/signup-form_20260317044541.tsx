'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { motion } from 'framer-motion';

export function SignUpForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', username: '', fullName: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      if (!formData.email || !formData.password || !formData.username || !formData.fullName) throw new Error('Please fill in all fields');
      if (formData.password !== formData.confirmPassword) throw new Error('Passwords do not match');
      if (formData.password.length < 6) throw new Error('Password must be at least 6 characters');
      if (formData.username.length < 3) throw new Error('Username must be at least 3 characters');
      await signUp(formData.email, formData.password, formData.username, formData.fullName);
      router.push('/auth/signin?message=Check your email to confirm your account');
    } catch (err) { setError(err instanceof Error ? err.message : 'An error occurred'); }
    finally { setLoading(false); }
  };

  const inputClass = "bg-input border-border focus:ring-primary/50 focus:border-primary/30";

  return (
    <motion.form onSubmit={handleSubmit} className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {error && <div className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-2 rounded-lg text-sm">{error}</div>}

      <FieldGroup>
        <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
        <Input id="fullName" name="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleChange} disabled={loading} className={inputClass} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="username">Username</FieldLabel>
        <Input id="username" name="username" placeholder="johndoe" value={formData.username} onChange={handleChange} disabled={loading} className={inputClass} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} disabled={loading} className={inputClass} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <Input id="password" name="password" type="password" placeholder="••••••" value={formData.password} onChange={handleChange} disabled={loading} className={inputClass} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
        <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••" value={formData.confirmPassword} onChange={handleChange} disabled={loading} className={inputClass} />
      </FieldGroup>

      <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 min-h-[44px] font-semibold" disabled={loading}>
        {loading ? 'Creating account...' : 'Sign Up'}
      </Button>
    </motion.form>
  );
}
