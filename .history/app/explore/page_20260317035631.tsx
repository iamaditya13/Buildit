import { Suspense } from 'react';
import { Navbar } from '@/components/navbar';
import { ProjectFeed } from '@/components/project-feed';

export const metadata = {
  title: 'Explore Projects — BuildIt',
  description: 'Discover amazing developer projects. Filter by trending, top rated, or newest.',
};

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Explore Projects</h1>
          <p className="text-muted-foreground mt-2">
            Discover what developers are building and vote for your favorites
          </p>
        </div>
        <Suspense fallback={<LoadingSkeleton />}>
          <ProjectFeed />
        </Suspense>
      </div>
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl h-80 animate-pulse" />
      ))}
    </div>
  );
}
