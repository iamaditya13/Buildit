import { SignInForm } from '@/components/auth/signin-form';
import Link from 'next/link';
import { Suspense } from 'react';

function SignInMessage({ message }: { message?: string }) {
  if (!message) return null;
  
  return (
    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded text-sm mb-4">
      {message}
    </div>
  );
}

export default function SignInPage(props: { searchParams?: Promise<{ message?: string }> }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 text-center">Buildit</h1>
            <p className="text-muted-foreground text-center">Sign in to your account</p>
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
