import { Router, type Request, type Response, type NextFunction } from 'express';
import prisma from '../prisma.js';

const router = Router();

// GET /api/dashboard — productivity stats
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await prisma.task.findMany({
      select: { completed: true, priority: true, dueDate: true },
    });
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const active = total - completed;
    const highPriority = tasks.filter((t) => t.priority === 'high').length;
    const now = new Date();
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate < now
    ).length;
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    res.json({ total, completed, active, highPriority, overdue, completionRate });
  } catch (err) {
    next(err);
  }
});

export default router;
