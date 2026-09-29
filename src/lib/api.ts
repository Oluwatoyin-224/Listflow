import { supabase } from './supabase';
import type { Task, Note, TaskInput, NoteInput, DashboardStats } from '@/types';

// If VITE_API_URL is set, use the REST backend; otherwise fall back to Supabase client.
const API_URL = import.meta.env.VITE_API_URL as string | undefined;

async function restFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---------- Tasks ----------

export async function fetchTasks(): Promise<Task[]> {
  if (API_URL) return restFetch<Task[]>('/api/tasks');
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Task[];
}

export async function createTask(input: TaskInput): Promise<Task> {
  if (API_URL) return restFetch<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(input) });
  const { data, error } = await supabase
    .from('tasks')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Task;
}

export async function updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
  if (API_URL) return restFetch<Task>(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(input) });
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
  if (API_URL) {
    await restFetch<void>(`/api/tasks/${id}`, { method: 'DELETE' });
    return;
  }
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Notes ----------

export async function fetchNotes(): Promise<Note[]> {
  if (API_URL) return restFetch<Note[]>('/api/notes');
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Note[];
}

export async function createNote(input: NoteInput): Promise<Note> {
  if (API_URL) return restFetch<Note>('/api/notes', { method: 'POST', body: JSON.stringify(input) });
  const { data, error } = await supabase
    .from('notes')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Note;
}

export async function updateNote(id: string, input: Partial<NoteInput>): Promise<Note> {
  if (API_URL) return restFetch<Note>(`/api/notes/${id}`, { method: 'PUT', body: JSON.stringify(input) });
  const { data, error } = await supabase
    .from('notes')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Note;
}

export async function deleteNote(id: string): Promise<void> {
  if (API_URL) {
    await restFetch<void>(`/api/notes/${id}`, { method: 'DELETE' });
    return;
  }
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Dashboard stats ----------

export async function fetchDashboardStats(): Promise<DashboardStats> {
  if (API_URL) return restFetch<DashboardStats>('/api/dashboard');
  const { data, error } = await supabase.from('tasks').select('completed, priority, due_date');
  if (error) throw error;
  const tasks = data ?? [];
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;
  const highPriority = tasks.filter((t) => t.priority === 'high').length;
  const now = new Date();
  const overdue = tasks.filter(
    (t) => !t.completed && t.due_date && new Date(t.due_date) < now
  ).length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, active, highPriority, overdue, completionRate };
}
