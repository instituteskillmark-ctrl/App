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
      <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#252b34] pb-3">
          <h3 className="text-xs font-semibold text-[#f5f7fa] uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            Create Knowledge Note
          </h3>
          <span className="text-[11px] text-[#9aa3af]">Saved Notes</span>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Note Title (e.g. n8n Webhook Signature Verification in Node.js)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-[#171c23] border border-[#252b34] rounded-lg px-4 py-2.5 text-xs text-[#f5f7fa] focus:outline-none focus:border-[#374151]"
            />
          </div>

          <div>
            <textarea
              placeholder="Write your note markdown, code snippet, or concept summary here..."
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full bg-[#171c23] border border-[#252b34] rounded-lg px-4 py-3 text-xs text-[#f5f7fa] focus:outline-none focus:border-[#374151] leading-relaxed"
            ></textarea>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Tag className="w-3.5 h-3.5 text-[#66707c] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Tags (e.g. n8n, webhooks, security)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-[#171c23] border border-[#252b34] rounded-lg pl-9 pr-3 py-2 text-xs text-[#f5f7fa] focus:outline-none focus:border-[#374151]"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-[#f5f7fa] hover:bg-white text-[#08090c] text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 shrink-0"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#252b34] pb-3 gap-3">
          <h3 className="text-xs font-semibold text-[#f5f7fa] uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            Saved Notes ({filteredNotes.length})
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#66707c] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search notes or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#12161c] border border-[#252b34] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#f5f7fa] focus:outline-none focus:border-[#374151]"
            />
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 bg-[#12161c] border border-dashed border-[#252b34] rounded-xl space-y-2 p-6">
            <FileText className="w-8 h-8 text-[#66707c] mx-auto" />
            <p className="text-xs text-[#f5f7fa] font-medium">No notes saved yet</p>
            <p className="text-[11px] text-[#9aa3af]">Save your first learning note above to start building your knowledge base.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-[#12161c] border border-[#252b34] rounded-xl p-5 space-y-3 flex flex-col justify-between shadow-sm hover:border-[#374151] transition group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-semibold text-sm text-[#f5f7fa] group-hover:text-white transition flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#9aa3af] shrink-0" />
                      <span>{note.title}</span>
                    </h4>
                    <button
                      onClick={() => handleDelete(note.id)}
                      disabled={isPending}
                      className="text-[#66707c] hover:text-rose-400 p-1 rounded hover:bg-rose-950/30 transition shrink-0"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-[#9aa3af] whitespace-pre-wrap mt-3 bg-[#171c23] p-3.5 rounded-lg border border-[#252b34] leading-relaxed">
                    {note.content}
                  </p>
                </div>

                {note.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#252b34]">
                    {note.tags.split(',').map((t: string, i: number) => (
                      <span
                        key={i}
                        className="text-[11px] bg-[#171c23] text-[#9aa3af] px-2 py-0.5 rounded border border-[#252b34]"
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


