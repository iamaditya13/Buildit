import { Suspense } from 'react';
import { Navbar } from '@/components/navbar';
import { ProjectFeed } from '@/components/project-feed';

export const metadata = {
  title: 'Home - Buildit',
  description: 'Discover amazing developer projects on Buildit',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Suspense fallback={<LoadingFeed />}>
          <ProjectFeed />
        </Suspense>
      </div>
    </main>
  );
}

function LoadingFeed() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-lg h-96 animate-pulse" />
      ))}
    </div>
  );
}
