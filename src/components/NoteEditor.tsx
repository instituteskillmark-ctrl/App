'use client';

import React, { useState, useTransition } from 'react';
import { actionCreateNote, actionDeleteNote } from '@/lib/actions/app-actions';
import { FileText, Plus, Trash2, Tag, Search, BookOpen, Loader2 } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredNotes = initialNotes.filter((n) => {
    const query = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query) ||
      (n.tags && n.tags.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-8">
      {/* Create Note Form */}
      <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            CREATE NEW ENGINEERING NOTE
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Persisted Knowledge Base</span>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Note Title (e.g., n8n Webhook Signature Verification in Node.js)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <textarea
              placeholder="Write your note markdown / code snippet / concept summary here..."
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed"
            ></textarea>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Tags (e.g. n8n, webhooks, security)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-[#080d19] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-mono text-xs font-bold rounded-lg transition shadow-md shadow-cyan-950 flex items-center justify-center gap-1.5 shrink-0"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Note</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Notes List & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3 gap-3">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            SAVED KNOWLEDGE NOTES ({filteredNotes.length})
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search notes or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0e1420] border border-slate-800/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 bg-[#0e1420] border border-dashed border-slate-800/80 rounded-xl space-y-2 p-6">
            <FileText className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400 font-mono">No notes match your filter or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-5 space-y-3 flex flex-col justify-between shadow-lg hover:border-slate-700/80 transition group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{note.title}</span>
                    </h4>
                    <button
                      onClick={() => handleDelete(note.id)}
                      disabled={isPending}
                      className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-rose-950/40 transition shrink-0"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 whitespace-pre-wrap mt-3 font-mono bg-[#080d19] p-3.5 rounded-lg border border-slate-800/80 leading-relaxed">
                    {note.content}
                  </p>
                </div>

                {note.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
                    {note.tags.split(',').map((t: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] bg-[#080d19] text-cyan-400 px-2 py-0.5 rounded-md border border-cyan-900/60 font-mono font-semibold"
                      >
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

