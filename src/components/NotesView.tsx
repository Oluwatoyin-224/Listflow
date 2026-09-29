import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  FileText,
  X,
  StickyNote,
  Eye,
} from 'lucide-react';
import { fetchNotes, createNote, updateNote, deleteNote } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import type { Note, NoteInput } from '@/types';
import { NoteForm } from './NoteForm';

export function NotesView() {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotes();
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const filtered = useMemo(() => {
    if (!search.trim()) return notes;
    const q = search.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.content ?? '').toLowerCase().includes(q)
    );
  }, [notes, search]);

  const handleSubmit = async (input: NoteInput) => {
    if (editingNote) {
      const updated = await updateNote(editingNote.id, input);
      setNotes((prev) => prev.map((n) => (n.id === editingNote.id ? updated : n)));
      toast('Note updated successfully', 'success');
    } else {
      const created = await createNote(input);
      setNotes((prev) => [created, ...prev]);
      toast('Note created successfully', 'success');
    }
    setEditingNote(null);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteNote(confirmDelete.id);
      setNotes((prev) => prev.filter((n) => n.id !== confirmDelete.id));
      toast('Note deleted', 'success');
      setConfirmDelete(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to delete note', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setFormOpen(true);
  };

  const openCreate = () => {
    setEditingNote(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Notes</h1>
          <p className="text-slate-500 mt-1">Jot down ideas, reminders, and reference notes.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Note
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Notes grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={loadNotes}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
            <StickyNote className="h-8 w-8 text-amber-600" />
          </div>
          <h3 className="font-semibold text-slate-700">
            {search ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {search ? 'Try a different search term.' : 'Create your first note to get started.'}
          </p>
          {!search && (
            <button
              onClick={openCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Create Note
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <div
              key={note.id}
              className="group bg-white rounded-2xl border border-slate-200 p-5 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col"
              onClick={() => setViewingNote(note)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <h3 className="font-semibold text-slate-900 truncate">{note.title}</h3>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEdit(note)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Edit note"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(note)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    aria-label="Delete note"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {note.content ? (
                <p className="text-sm text-slate-600 line-clamp-4 flex-1 whitespace-pre-wrap">{note.content}</p>
              ) : (
                <p className="text-sm text-slate-400 italic flex-1">No content</p>
              )}
              <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
                {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {formOpen && (
        <NoteForm
          note={editingNote}
          onSubmit={handleSubmit}
          onClose={() => {
            setFormOpen(false);
            setEditingNote(null);
          }}
        />
      )}

      {/* View modal */}
      {viewingNote && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => setViewingNote(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center gap-2 min-w-0">
                <Eye className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <h2 className="text-lg font-semibold text-slate-900 truncate">{viewingNote.title}</h2>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    const n = viewingNote;
                    setViewingNote(null);
                    openEdit(n);
                  }}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                  aria-label="Edit note"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewingNote(null)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                  aria-label="Close note"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {viewingNote.content ? (
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{viewingNote.content}</p>
              ) : (
                <p className="text-sm text-slate-400 italic">No content</p>
              )}
              <p className="text-xs text-slate-400 mt-6 pt-4 border-t border-slate-100">
                Created {new Date(viewingNote.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => !deleting && setConfirmDelete(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-sm p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
          >
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Delete this note?</h3>
              <p className="text-sm text-slate-500 mt-1">"{confirmDelete.title}" will be permanently deleted.</p>
              <div className="flex gap-3 w-full mt-5">
                <button
                  onClick={() => setConfirmDelete(null)}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-500 transition-colors disabled:opacity-60"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
