import React from 'react';
import { Header } from '@/components/Header';
import { getUserNotes } from '@/lib/services/notes';
import { NoteEditor } from '@/components/NoteEditor';

import { getAuthUserId } from '@/lib/supabase/server';

export const revalidate = 0;

export default async function NotesPage() {
  const userId = await getAuthUserId();
  const userNotes = await getUserNotes(userId);

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Notes"
        subtitle="Personal Knowledge Notes & Code Snippets"
      />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <NoteEditor initialNotes={userNotes} />
      </div>
    </div>
  );
}

