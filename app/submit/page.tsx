'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { X, Plus, ChevronRight, Image as ImageIcon, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function SubmitPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '', shortDescription: '', description: '', imageUrl: '', githubUrl: '', liveUrl: '',
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground mb-2">Sign in to post</h2>
          <p className="text-sm text-muted-foreground mb-4">You need an account to share projects.</p>
          <Link href="/auth/signin" className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold min-h-[44px]">Sign In</Link>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) { setTags(p => [...p, t]); setTagInput(''); }
  };

  const handleSubmit = async () => {
    setError(null); setLoading(true);
    try {
      if (!formData.title || !formData.description) throw new Error('Title and description are required');
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

  const inputCls = "w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all";

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={() => step > 1 ? setStep(s => s - 1) : router.back()} className="text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center">
          <X size={22} />
        </button>
        <h1 className="text-sm font-semibold text-foreground">New Project</h1>
        {step < 3 ? (
          <button onClick={() => setStep(s => s + 1)} className="text-primary font-semibold text-sm min-h-[44px] flex items-center gap-1">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} className="text-primary font-bold text-sm min-h-[44px]">
            {loading ? 'Posting...' : 'Post'}
          </button>
        )}
      </div>

      {/* Step indicators */}
      <div className="flex gap-1 px-4 py-3">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-secondary'}`} />
        ))}
      </div>

      {error && <div className="mx-4 mb-3 bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-2 rounded-lg text-sm">{error}</div>}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 space-y-4">
            <div className="text-center py-6">
              <ImageIcon size={48} className="text-primary/30 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-foreground mb-1">Add a thumbnail</h2>
              <p className="text-sm text-muted-foreground">Paste a URL for your project screenshot</p>
            </div>
            <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://i.imgur.com/..." className={inputCls} />
            {formData.imageUrl && (
              <div className="aspect-[16/10] bg-muted rounded-xl overflow-hidden">
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 space-y-4">
            <input name="title" value={formData.title} onChange={handleChange} placeholder="Project name *" className={inputCls} />
            <input name="shortDescription" value={formData.shortDescription} onChange={handleChange} placeholder="Short description (shows on card)" className={inputCls} />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Full description *" rows={5} className={inputCls} />
            {/* Tags */}
            <div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map(tag => (
                  <span key={tag} className="tech-pill px-2.5 py-1 rounded-lg text-xs flex items-center gap-1">
                    {tag}
                    <button onClick={() => setTags(p => p.filter(x => x !== tag))} className="text-muted-foreground hover:text-red-400"><X size={10} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                  placeholder="Add tech (React, Node...)" className={`${inputCls} flex-1`} />
                <button onClick={addTag} disabled={!tagInput.trim()} className="min-w-[44px] min-h-[44px] bg-secondary border border-border rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary">
                  <Plus size={18} />
                </button>
              </div>
            </div>
            <input name="githubUrl" value={formData.githubUrl} onChange={handleChange} placeholder="GitHub URL" className={inputCls} />
            <input name="liveUrl" value={formData.liveUrl} onChange={handleChange} placeholder="Live demo URL" className={inputCls} />
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4">
            <div className="flex items-center gap-2 mb-4">
              <Eye size={16} className="text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Preview</h2>
            </div>
            <div className="feed-card rounded-xl border border-border overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-foreground">You</span>
                <span className="text-xs text-muted-foreground">Just now</span>
              </div>
              {formData.imageUrl ? (
                <div className="w-full aspect-[16/10] bg-muted">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full aspect-[16/10] bg-secondary flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary/20">{formData.title?.charAt(0) || '?'}</span>
                </div>
              )}
              <div className="px-4 py-3 space-y-1.5">
                <h3 className="text-sm font-bold text-foreground">{formData.title || 'Project Title'}</h3>
                <p className="text-sm text-muted-foreground">{formData.shortDescription || formData.description || 'Description...'}</p>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(t => <span key={t} className="tech-pill px-2 py-0.5 rounded-md">{t}</span>)}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
