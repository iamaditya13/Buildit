import { SignUpForm } from '@/components/auth/signup-form';
import Link from 'next/link';
import { Rocket } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <div className="w-full max-w-md">
        <div className="glass-strong border border-border/50 rounded-xl shadow-2xl shadow-accent/5 p-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Rocket size={20} className="text-accent-foreground" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Join BuildIt</h1>
            <p className="text-muted-foreground">Create your account and start sharing projects</p>
          </div>

          <SignUpForm />

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-accent font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
