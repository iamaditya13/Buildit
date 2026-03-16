import { notFound } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { ProjectDetail } from '@/components/project-detail';
import { CommentsSection } from '@/components/comments-section';
import { supabase } from '@/lib/supabase';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const { data: project } = await supabase
    .from('projects')
    .select('title, description')
    .eq('id', params.id)
    .single();

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: `${project.title} - Buildit`,
    description: project.description,
  };
}

export default async function ProjectPage(props: PageProps) {
  const params = await props.params;
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ProjectDetail project={project} />
        <div id="comments" className="mt-12 pt-12 border-t border-border">
          <CommentsSection projectId={params.id} />
        </div>
      </div>
    </main>
  );
}
