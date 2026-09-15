import React from 'react';
import { Header } from '@/components/Header';
import { getAllProjects } from '@/lib/services/projects';
import { ProjectManager } from '@/components/ProjectManager';

export const revalidate = 0;

export default async function ProjectsPage() {
  const projectList = await getAllProjects();

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Hands-On Projects Portfolio"
        subtitle="Build Throughout • 6 Preserved Roadmap Automation Projects"
      />

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <ProjectManager initialProjects={projectList as any} />
      </div>
    </div>
  );
}
