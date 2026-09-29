import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { NotesView } from '@/components/NotesView';
import { ToastProvider } from '@/context/ToastContext';

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

import { fetchNotes, createNote, deleteNote } from '@/lib/api';

const mockFetchNotes = vi.mocked(fetchNotes);
const mockCreateNote = vi.mocked(createNote);
const mockDeleteNote = vi.mocked(deleteNote);

function renderNotesView() {
  return render(
    <ToastProvider>
      <NotesView />
    </ToastProvider>
  );
}

const sampleNote = {
  id: 'note-1',
  title: 'Meeting Notes',
  content: 'Discussed the project timeline',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFetchNotes.mockResolvedValue([]);
});

describe('NotesView', () => {
  it('renders the notes heading', async () => {
    renderNotesView();
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('shows empty state when no notes', async () => {
    renderNotesView();
    await waitFor(() => {
      expect(screen.getByText('No notes yet')).toBeInTheDocument();
    });
  });

  it('displays notes from the API', async () => {
    mockFetchNotes.mockResolvedValue([sampleNote]);
    renderNotesView();

    await waitFor(() => {
      expect(screen.getByText('Meeting Notes')).toBeInTheDocument();
      expect(screen.getByText('Discussed the project timeline')).toBeInTheDocument();
    });
  });

  it('opens the create form when New Note is clicked', async () => {
    renderNotesView();
    await waitFor(() => {
      expect(screen.getByText('No notes yet')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('New Note'));
    expect(screen.getByPlaceholderText('Note title')).toBeInTheDocument();
  });

  it('creates a note', async () => {
    mockFetchNotes.mockResolvedValue([]);
    mockCreateNote.mockResolvedValue(sampleNote);

    renderNotesView();
    await waitFor(() => {
      expect(screen.getByText('No notes yet')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('New Note'));
    fireEvent.change(screen.getByPlaceholderText('Note title'), { target: { value: 'Meeting Notes' } });
    fireEvent.change(screen.getByPlaceholderText('Write your note here...'), {
      target: { value: 'Discussed the project timeline' },
    });
    const submitBtn = screen.getAllByText('Create Note').find(
      (el) => el.tagName === 'BUTTON' && el.getAttribute('type') === 'submit'
    )!;
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateNote).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Meeting Notes', content: 'Discussed the project timeline' })
      );
    });
  });

  it('filters notes by search query', async () => {
    mockFetchNotes.mockResolvedValue([
      sampleNote,
      { ...sampleNote, id: 'note-2', title: 'Shopping List', content: 'Apples, oranges' },
    ]);

    renderNotesView();
    await waitFor(() => {
      expect(screen.getByText('Meeting Notes')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search notes...');
    fireEvent.change(searchInput, { target: { value: 'shopping' } });

    expect(screen.getByText('Shopping List')).toBeInTheDocument();
    expect(screen.queryByText('Meeting Notes')).not.toBeInTheDocument();
  });

  it('deletes a note after confirmation', async () => {
    mockFetchNotes.mockResolvedValue([sampleNote]);
    mockDeleteNote.mockResolvedValue(undefined);

    renderNotesView();
    await waitFor(() => {
      expect(screen.getByText('Meeting Notes')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByLabelText('Delete note');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByText('Delete this note?')).toBeInTheDocument();
    });

    const confirmBtn = screen.getAllByText('Delete').find(
      (el) => el.tagName === 'BUTTON'
    )!;
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockDeleteNote).toHaveBeenCalledWith('note-1');
    });
  });
});
