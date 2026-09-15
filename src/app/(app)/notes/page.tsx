import React from 'react';
import { Header } from '@/components/Header';
import { getUserNotes } from '@/lib/services/notes';
import { NoteEditor } from '@/components/NoteEditor';

export const revalidate = 0;

export default async function NotesPage() {
  const userNotes = await getUserNotes();

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Personal Knowledge Base & Notes"
        subtitle="Capture concepts, code snippets, n8n node settings & debugging steps"
      />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <NoteEditor initialNotes={userNotes} />
      </div>
    </div>
  );
}
