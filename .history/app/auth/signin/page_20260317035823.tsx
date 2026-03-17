import { SignInForm } from '@/components/auth/signin-form';
import Link from 'next/link';
import { Suspense } from 'react';
import { Rocket } from 'lucide-react';

function SignInMessage({ message }: { message?: string }) {
  if (!message) return null;
  
  return (
    <div className="bg-accent/10 border border-accent/30 text-accent px-4 py-2 rounded-lg text-sm mb-4">
      {message}
    </div>
  );
}

export default function SignInPage(props: { searchParams?: Promise<{ message?: string }> }) {
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to continue to BuildIt</p>
          </div>

          <Suspense fallback={null}>
            <SignInFormWrapper {...props} />
          </Suspense>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-accent font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

async function SignInFormWrapper(props: { searchParams?: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams;
  return (
    <>
      <SignInMessage message={searchParams?.message} />
      <SignInForm />
    </>
  );
}
