import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { TasksView } from '@/components/TasksView';
import { ToastProvider } from '@/context/ToastContext';

// Mock the API module
vi.mock('@/lib/api', () => ({
  fetchTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  fetchNotes: vi.fn(),
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  fetchDashboardStats: vi.fn(),
}));

import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from '@/lib/api';

const mockFetchTasks = vi.mocked(fetchTasks);
const mockCreateTask = vi.mocked(createTask);
const mockUpdateTask = vi.mocked(updateTask);
const mockDeleteTask = vi.mocked(deleteTask);

function renderTasksView() {
  return render(
    <ToastProvider>
      <TasksView />
    </ToastProvider>
  );
}

const sampleTask = {
  id: 'task-1',
  title: 'Buy groceries',
  description: 'Milk, eggs, bread',
  priority: 'high' as const,
  due_date: null,
  completed: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFetchTasks.mockResolvedValue([]);
});

describe('TasksView', () => {
  it('renders the tasks heading', async () => {
    renderTasksView();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('shows empty state when no tasks', async () => {
    renderTasksView();
    await waitFor(() => {
      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    });
  });

  it('displays tasks from the API', async () => {
    mockFetchTasks.mockResolvedValue([sampleTask]);
    renderTasksView();

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });
  });

  it('opens the create form when New Task is clicked', async () => {
    renderTasksView();
    await waitFor(() => {
      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('New Task'));
    expect(screen.getByText('New Task', { selector: 'h2' })).toBeInTheDocument();
  });

  it('creates a task and shows it in the list', async () => {
    mockFetchTasks.mockResolvedValue([]);
    mockCreateTask.mockResolvedValue(sampleTask);

    renderTasksView();
    await waitFor(() => {
      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('New Task'));
    const titleInput = screen.getByPlaceholderText('What needs to be done?');
    fireEvent.change(titleInput, { target: { value: 'Buy groceries' } });
    const submitBtn = screen.getAllByText('Create Task').find(
      (el) => el.tagName === 'BUTTON' && el.getAttribute('type') === 'submit'
    )!;
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Buy groceries' })
      );
    });
  });

  it('toggles task completion', async () => {
    mockFetchTasks.mockResolvedValue([sampleTask]);
    mockUpdateTask.mockResolvedValue({ ...sampleTask, completed: true });

    renderTasksView();
    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    const toggleButton = screen.getByLabelText('Mark as completed');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith('task-1', { completed: true });
    });
  });

  it('filters tasks by search query', async () => {
    mockFetchTasks.mockResolvedValue([
      sampleTask,
      { ...sampleTask, id: 'task-2', title: 'Walk the dog' },
    ]);

    renderTasksView();
    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(searchInput, { target: { value: 'dog' } });

    expect(screen.getByText('Walk the dog')).toBeInTheDocument();
    expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
  });

  it('deletes a task after confirmation', async () => {
    mockFetchTasks.mockResolvedValue([sampleTask]);
    mockDeleteTask.mockResolvedValue(undefined);

    renderTasksView();
    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    // Click the delete button
    const deleteBtn = screen.getByLabelText('Delete task');
    fireEvent.click(deleteBtn);

    // Confirm deletion
    await waitFor(() => {
      expect(screen.getByText('Delete this task?')).toBeInTheDocument();
    });
    const confirmBtn = screen.getAllByText('Delete').find(
      (el) => el.tagName === 'BUTTON'
    )!;
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith('task-1');
    });
  });
});
