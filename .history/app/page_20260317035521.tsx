import { HeroSection } from '@/components/hero-section';
import { TopProjects } from '@/components/top-projects';
import { Navbar } from '@/components/navbar';

export const metadata = {
  title: 'BuildIt — Build. Share. Get Ranked.',
  description: 'The community-driven platform where developers showcase their projects, get votes, and climb the leaderboard.',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <TopProjects />
    </main>
  );
}
