import { useState, useEffect } from 'react';
import type { Task, TaskInput, Priority } from '@/types';
import { X, Calendar, Flag } from 'lucide-react';

interface TaskFormProps {
  task: Task | null;
  onSubmit: (input: TaskInput) => Promise<void>;
  onClose: () => void;
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-700 border-red-300' },
];

export function TaskForm({ task, onSubmit, onClose }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.slice(0, 10) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        due_date: dueDate ? new Date(dueDate + 'T23:59:59').toISOString() : null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 id="task-form-title" className="text-lg font-semibold text-slate-900">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close form"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-slate-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              placeholder="What needs to be done?"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="task-description" className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all resize-none"
              placeholder="Add more details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Flag className="h-4 w-4 inline mr-1" />
              Priority
            </label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                    priority === p.value
                      ? p.color + ' ring-2 ring-offset-1 ring-current'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="task-due-date" className="block text-sm font-medium text-slate-700 mb-1.5">
              <Calendar className="h-4 w-4 inline mr-1" />
              Due Date
            </label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
