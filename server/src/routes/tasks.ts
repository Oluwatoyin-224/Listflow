import { Router, type Request, type Response, type NextFunction } from 'express';
import prisma from './prisma.js';
import { createTaskSchema, updateTaskSchema, uuidSchema } from './validation.js';

const router = Router();

// GET /api/tasks — list all tasks (newest first)
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:id — get a single task
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { success, data, error } = uuidSchema.safeParse(req.params.id);
    if (!success) {
      res.status(400).json({ error: error.issues[0]?.message ?? 'Invalid ID' });
      return;
    }
    const task = await prisma.task.findUnique({ where: { id: data } });
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks — create a task
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { success, data, error } = createTaskSchema.safeParse(req.body);
    if (!success) {
      res.status(400).json({ error: error.issues[0]?.message ?? 'Invalid input' });
      return;
    }
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        priority: data.priority,
        dueDate: data.due_date ? new Date(data.due_date) : null,
        completed: data.completed ?? false,
      },
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// PUT /api/tasks/:id — update a task
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idResult = uuidSchema.safeParse(req.params.id);
    if (!idResult.success) {
      res.status(400).json({ error: idResult.error.issues[0]?.message ?? 'Invalid ID' });
      return;
    }
    const { success, data, error } = updateTaskSchema.safeParse(req.body);
    if (!success) {
      res.status(400).json({ error: error.issues[0]?.message ?? 'Invalid input' });
      return;
    }
    const existing = await prisma.task.findUnique({ where: { id: idResult.data } });
    if (!existing) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    const task = await prisma.task.update({
      where: { id: idResult.data },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.due_date !== undefined && { dueDate: data.due_date ? new Date(data.due_date) : null }),
        ...(data.completed !== undefined && { completed: data.completed }),
      },
    });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id — delete a task
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { success, data, error } = uuidSchema.safeParse(req.params.id);
    if (!success) {
      res.status(400).json({ error: error.issues[0]?.message ?? 'Invalid ID' });
      return;
    }
    const existing = await prisma.task.findUnique({ where: { id: data } });
    if (!existing) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    await prisma.task.delete({ where: { id: data } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
