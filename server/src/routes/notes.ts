import { Router, type Request, type Response, type NextFunction } from 'express';
import prisma from '../prisma.js';
import { createNoteSchema, updateNoteSchema, uuidSchema } from '../validation.js';

const router = Router();

// GET /api/notes
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const notes = await prisma.note.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(notes);
  } catch (err) {
    next(err);
  }
});

// GET /api/notes/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { success, data, error } = uuidSchema.safeParse(req.params.id);
    if (!success) {
      res.status(400).json({ error: error.issues[0]?.message ?? 'Invalid ID' });
      return;
    }
    const note = await prisma.note.findUnique({ where: { id: data } });
    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    res.json(note);
  } catch (err) {
    next(err);
  }
});

// POST /api/notes
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { success, data, error } = createNoteSchema.safeParse(req.body);
    if (!success) {
      res.status(400).json({ error: error.issues[0]?.message ?? 'Invalid input' });
      return;
    }
    const note = await prisma.note.create({
      data: {
        title: data.title,
        content: data.content ?? null,
      },
    });
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

// PUT /api/notes/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idResult = uuidSchema.safeParse(req.params.id);
    if (!idResult.success) {
      res.status(400).json({ error: idResult.error.issues[0]?.message ?? 'Invalid ID' });
      return;
    }
    const { success, data, error } = updateNoteSchema.safeParse(req.body);
    if (!success) {
      res.status(400).json({ error: error.issues[0]?.message ?? 'Invalid input' });
      return;
    }
    const existing = await prisma.note.findUnique({ where: { id: idResult.data } });
    if (!existing) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    const note = await prisma.note.update({
      where: { id: idResult.data },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
      },
    });
    res.json(note);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notes/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { success, data, error } = uuidSchema.safeParse(req.params.id);
    if (!success) {
      res.status(400).json({ error: error.issues[0]?.message ?? 'Invalid ID' });
      return;
    }
    const existing = await prisma.note.findUnique({ where: { id: data } });
    if (!existing) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    await prisma.note.delete({ where: { id: data } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
