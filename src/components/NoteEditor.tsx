'use client';

import React, { useState, useTransition } from 'react';
import { actionCreateNote, actionDeleteNote } from '@/lib/actions/app-actions';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string | null;
  taskId: string | null;
  projectId: string | null;
  createdAt: Date;
}

export function NoteEditor({ initialNotes }: { initialNotes: Note[] }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    startTransition(async () => {
      await actionCreateNote(title, content, tags);
      setTitle('');
      setContent('');
      setTags('');
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await actionDeleteNote(id);
    });
  };

  return (
    <div className="space-y-8">
      {/* Create Note Form */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-bold text-slate-100 mb-4 font-mono">Create New Learning Note</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Note Title (e.g., n8n Webhook Signature Verification in Node.js)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <textarea
              placeholder="Write your note markdown / code snippet / concept summary here..."
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
            ></textarea>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <input
              type="text"
              placeholder="Tags (e.g. n8n, webhooks, security)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
            />

            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium rounded-lg text-xs transition font-mono"
            >
              {isPending ? 'Saving Note...' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Saved Notes ({initialNotes.length})
        </h3>

        {initialNotes.length === 0 ? (
          <div className="text-center py-8 bg-slate-950 border border-dashed border-slate-800 rounded-xl">
            <p className="text-xs text-slate-500 font-mono">No notes recorded yet. Create your first note above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initialNotes.map((note) => (
              <div key={note.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-100">{note.title}</h4>
                    <button
                      onClick={() => handleDelete(note.id)}
                      disabled={isPending}
                      className="text-xs text-slate-500 hover:text-red-400 font-mono"
                    >
                      Delete
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 whitespace-pre-wrap mt-2 font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-900">
                    {note.content}
                  </p>
                </div>

                {note.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {note.tags.split(',').map((t: string, i: number) => (
                      <span key={i} className="text-[10px] bg-slate-900 text-cyan-400 px-2 py-0.5 rounded border border-slate-800 font-mono">
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
