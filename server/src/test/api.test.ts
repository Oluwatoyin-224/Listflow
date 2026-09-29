import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import prisma from '../prisma.js';
import app from '../index.js';

beforeEach(async () => {
  await prisma.task.deleteMany();
  await prisma.note.deleteMany();
});

describe('Task API', () => {
  describe('POST /api/tasks', () => {
    it('creates a task with valid data', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Buy groceries', priority: 'high' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Buy groceries');
      expect(res.body.priority).toBe('high');
      expect(res.body.completed).toBe(false);
    });

    it('defaults priority to medium when not specified', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Walk the dog' })
        .expect(201);

      expect(res.body.priority).toBe('medium');
    });

    it('rejects a task without a title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ priority: 'high' })
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });

    it('rejects an invalid priority value', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test', priority: 'urgent' })
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });

    it('accepts a due date', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Submit report', due_date: new Date('2026-12-31T23:59:59Z').toISOString() })
        .expect(201);

      expect(res.body.dueDate).toBeTruthy();
    });
  });

  describe('GET /api/tasks', () => {
    it('returns all tasks', async () => {
      await prisma.task.create({ data: { title: 'Task 1' } });
      await prisma.task.create({ data: { title: 'Task 2' } });

      const res = await request(app).get('/api/tasks').expect(200);

      expect(res.body).toHaveLength(2);
    });

    it('returns empty array when no tasks exist', async () => {
      const res = await request(app).get('/api/tasks').expect(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('returns a single task by ID', async () => {
      const task = await prisma.task.create({ data: { title: 'Find me' } });

      const res = await request(app).get(`/api/tasks/${task.id}`).expect(200);
      expect(res.body.title).toBe('Find me');
    });

    it('returns 404 for non-existent task', async () => {
      await request(app).get('/api/tasks/nonexistent-uuid').expect(400);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('updates a task', async () => {
      const task = await prisma.task.create({ data: { title: 'Original' } });

      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ title: 'Updated', completed: true })
        .expect(200);

      expect(res.body.title).toBe('Updated');
      expect(res.body.completed).toBe(true);
    });

    it('returns 404 for non-existent task', async () => {
      await request(app)
        .put('/api/tasks/00000000-0000-0000-0000-000000000000')
        .send({ title: 'Updated' })
        .expect(404);
    });

    it('rejects empty title on update', async () => {
      const task = await prisma.task.create({ data: { title: 'Original' } });

      await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ title: '' })
        .expect(400);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('deletes a task', async () => {
      const task = await prisma.task.create({ data: { title: 'Delete me' } });

      await request(app).delete(`/api/tasks/${task.id}`).expect(204);

      const found = await prisma.task.findUnique({ where: { id: task.id } });
      expect(found).toBeNull();
    });

    it('returns 404 for non-existent task', async () => {
      await request(app)
        .delete('/api/tasks/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});

describe('Note API', () => {
  describe('POST /api/notes', () => {
    it('creates a note with valid data', async () => {
      const res = await request(app)
        .post('/api/notes')
        .send({ title: 'Meeting Notes', content: 'Discussed project timeline' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Meeting Notes');
      expect(res.body.content).toBe('Discussed project timeline');
    });

    it('rejects a note without a title', async () => {
      const res = await request(app)
        .post('/api/notes')
        .send({ content: 'No title' })
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/notes', () => {
    it('returns all notes', async () => {
      await prisma.note.create({ data: { title: 'Note 1' } });
      await prisma.note.create({ data: { title: 'Note 2' } });

      const res = await request(app).get('/api/notes').expect(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('updates a note', async () => {
      const note = await prisma.note.create({ data: { title: 'Original' } });

      const res = await request(app)
        .put(`/api/notes/${note.id}`)
        .send({ title: 'Updated', content: 'New content' })
        .expect(200);

      expect(res.body.title).toBe('Updated');
      expect(res.body.content).toBe('New content');
    });

    it('returns 404 for non-existent note', async () => {
      await request(app)
        .put('/api/notes/00000000-0000-0000-0000-000000000000')
        .send({ title: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('deletes a note', async () => {
      const note = await prisma.note.create({ data: { title: 'Delete me' } });

      await request(app).delete(`/api/notes/${note.id}`).expect(204);

      const found = await prisma.note.findUnique({ where: { id: note.id } });
      expect(found).toBeNull();
    });
  });
});

describe('Dashboard API', () => {
  it('returns correct stats', async () => {
    await prisma.task.create({ data: { title: 'Task 1', completed: true } });
    await prisma.task.create({ data: { title: 'Task 2', completed: false, priority: 'high' } });
    await prisma.task.create({
      data: { title: 'Task 3', completed: false, dueDate: new Date('2020-01-01') },
    });

    const res = await request(app).get('/api/dashboard').expect(200);

    expect(res.body.total).toBe(3);
    expect(res.body.completed).toBe(1);
    expect(res.body.active).toBe(2);
    expect(res.body.highPriority).toBe(1);
    expect(res.body.overdue).toBe(2); // Task 2 (no due date, not overdue) + Task 3 (overdue)
    expect(res.body.completionRate).toBe(33);
  });

  it('returns zeros when no tasks exist', async () => {
    const res = await request(app).get('/api/dashboard').expect(200);

    expect(res.body.total).toBe(0);
    expect(res.body.completionRate).toBe(0);
  });
});

describe('Health check', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
  });
});
