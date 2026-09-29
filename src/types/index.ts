export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  due_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  title: string;
  description?: string | null;
  priority: Priority;
  due_date?: string | null;
  completed?: boolean;
}

export interface NoteInput {
  title: string;
  content?: string | null;
}

export type TaskFilter = 'all' | 'active' | 'completed' | 'high';

export type TaskSort = 'created_desc' | 'created_asc' | 'due_asc' | 'due_desc' | 'priority_desc' | 'priority_asc' | 'title_asc' | 'title_desc';

export interface DashboardStats {
  total: number;
  completed: number;
  active: number;
  highPriority: number;
  overdue: number;
  completionRate: number;
}
