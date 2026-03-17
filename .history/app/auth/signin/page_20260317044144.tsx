import { SignInForm } from '@/components/auth/signin-form';
import Link from 'next/link';
import { Suspense } from 'react';
import { Rocket } from 'lucide-react';

function SignInMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="bg-primary/10 border border-primary/25 text-primary px-4 py-2 rounded-lg text-sm mb-4">{message}</div>;
}

export default function SignInPage(props: { searchParams?: Promise<{ message?: string }> }) {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <div className="w-full max-w-md">
        <div className="glass-card border border-border rounded-xl shadow-2xl p-8">
          <div className="mb-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-4">
              <Rocket size={22} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to continue to BuildIt</p>
          </div>
          <Suspense fallback={null}><SignInFormWrapper {...props} /></Suspense>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}<Link href="/auth/signup" className="text-primary font-medium hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

async function SignInFormWrapper(props: { searchParams?: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams;
  return <><SignInMessage message={searchParams?.message} /><SignInForm /></>;
}
