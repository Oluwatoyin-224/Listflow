import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Inbox,
  Flag,
  Calendar,
  X,
} from 'lucide-react';
import { fetchTasks, createTask, updateTask, deleteTask } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import type { Task, TaskInput, TaskFilter, TaskSort, Priority } from '@/types';
import { TaskForm } from './TaskForm';

const priorityConfig: Record<Priority, { label: string; badge: string; dot: string }> = {
  low: { label: 'Low', badge: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  medium: { label: 'Medium', badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  high: { label: 'High', badge: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
};

const filterOptions: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'high', label: 'High Priority' },
];

const sortOptions: { value: TaskSort; label: string }[] = [
  { value: 'created_desc', label: 'Newest First' },
  { value: 'created_asc', label: 'Oldest First' },
  { value: 'due_asc', label: 'Due Date (Earliest)' },
  { value: 'due_desc', label: 'Due Date (Latest)' },
  { value: 'priority_desc', label: 'Priority (High to Low)' },
  { value: 'priority_asc', label: 'Priority (Low to High)' },
  { value: 'title_asc', label: 'Title (A-Z)' },
  { value: 'title_desc', label: 'Title (Z-A)' },
];

const priorityRank: Record<Priority, number> = { high: 3, medium: 2, low: 1 };

export function TasksView() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [sort, setSort] = useState<TaskSort>('created_desc');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const filtered = useMemo(() => {
    let result = [...tasks];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description ?? '').toLowerCase().includes(q)
      );
    }
    switch (filter) {
      case 'active':
        result = result.filter((t) => !t.completed);
        break;
      case 'completed':
        result = result.filter((t) => t.completed);
        break;
      case 'high':
        result = result.filter((t) => t.priority === 'high');
        break;
    }
    result.sort((a, b) => {
      switch (sort) {
        case 'created_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'created_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'due_asc': {
          const ad = a.due_date ? new Date(a.due_date).getTime() : Infinity;
          const bd = b.due_date ? new Date(b.due_date).getTime() : Infinity;
          return ad - bd;
        }
        case 'due_desc': {
          const ad = a.due_date ? new Date(a.due_date).getTime() : -Infinity;
          const bd = b.due_date ? new Date(b.due_date).getTime() : -Infinity;
          return bd - ad;
        }
        case 'priority_desc':
          return priorityRank[b.priority] - priorityRank[a.priority];
        case 'priority_asc':
          return priorityRank[a.priority] - priorityRank[b.priority];
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
    return result;
  }, [tasks, search, filter, sort]);

  const handleToggle = async (task: Task) => {
    try {
      await updateTask(task.id, { completed: !task.completed });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
      );
      toast(task.completed ? 'Task marked as active' : 'Task completed!', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update task', 'error');
    }
  };

  const handleSubmit = async (input: TaskInput) => {
    if (editingTask) {
      const updated = await updateTask(editingTask.id, input);
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
      toast('Task updated successfully', 'success');
    } else {
      const created = await createTask(input);
      setTasks((prev) => [created, ...prev]);
      toast('Task created successfully', 'success');
    }
    setEditingTask(null);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteTask(confirmDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== confirmDelete.id));
      toast('Task deleted', 'success');
      setConfirmDelete(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to delete task', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const openCreate = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500 mt-1">Create, organize, and complete your tasks.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
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

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filter tabs */}
          <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 overflow-x-auto">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-all whitespace-nowrap ${
                  filter === opt.value
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as TaskSort)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={loadTasks}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Inbox className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700">
            {search || filter !== 'all' ? 'No tasks match your filters' : 'No tasks yet'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {search || filter !== 'all' ? 'Try adjusting your search or filters.' : 'Create your first task to get started.'}
          </p>
          {!search && filter === 'all' && (
            <button
              onClick={openCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Create Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((task) => {
            const pc = priorityConfig[task.priority];
            const isOverdue = !task.completed && task.due_date && new Date(task.due_date) < new Date();
            return (
              <div
                key={task.id}
                className={`group bg-white rounded-xl border border-slate-200 p-4 transition-all hover:shadow-sm hover:border-slate-300 ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggle(task)}
                    className="mt-0.5 flex-shrink-0 text-slate-300 hover:text-emerald-500 transition-colors"
                    aria-label={task.completed ? 'Mark as not completed' : 'Mark as completed'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`font-medium text-slate-900 ${
                          task.completed ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {task.title}
                      </h3>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${pc.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${pc.dot}`} />
                        {pc.label}
                      </span>
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                          <AlertTriangle className="h-3 w-3" />
                          Overdue
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                    )}

                    {task.due_date && (
                      <div className={`flex items-center gap-1.5 mt-2 text-xs ${isOverdue ? 'text-red-600' : 'text-slate-400'}`}>
                        <Calendar className="h-3.5 w-3.5" />
                        Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(task)}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label="Edit task"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(task)}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      aria-label="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {formOpen && (
        <TaskForm
          task={editingTask}
          onSubmit={handleSubmit}
          onClose={() => {
            setFormOpen(false);
            setEditingTask(null);
          }}
        />
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
              <h3 className="font-semibold text-slate-900">Delete this task?</h3>
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
