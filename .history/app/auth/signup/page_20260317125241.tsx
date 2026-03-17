import { SignUpForm } from '@/components/auth/signup-form';
import Link from 'next/link';
import { Rocket } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <div className="w-full max-w-md">
        <div className="glass-card border border-border rounded-xl shadow-2xl p-8">
          <div className="mb-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-4">
              <Rocket size={22} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Build<span className="text-primary">it</span></h1>
            <p className="text-muted-foreground text-sm mt-1">Create your account and start sharing projects</p>
          </div>
          <SignUpForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}<Link href="/auth/signin" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
