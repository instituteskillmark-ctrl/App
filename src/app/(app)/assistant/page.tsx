import React from 'react';
import { Header } from '@/components/Header';
import { getDashboardStats } from '@/lib/services/dashboard';
import { AIAssistantWidget } from '@/components/AIAssistantWidget';

export const revalidate = 0;

export default async function AssistantPage() {
  const stats = await getDashboardStats();

  return (
    <div className="flex-1 pb-12">
      <Header
        title="AI Assistant"
        subtitle="Learning Companion & Curriculum Guidance"
      />

      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <AIAssistantWidget
          currentTaskTitle={stats.currentTask?.title}
          currentMonthName={stats.currentMonthName}
        />
      </div>
    </div>
  );
}

