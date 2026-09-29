import { z } from 'zod';

const priorityEnum = z.enum(['low', 'medium', 'high']);

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().max(2000, 'Description must be 2000 characters or less').nullable().optional(),
  priority: priorityEnum.default('medium'),
  due_date: z.string().datetime().nullable().optional(),
  completed: z.boolean().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  priority: priorityEnum.optional(),
  due_date: z.string().datetime().nullable().optional(),
  completed: z.boolean().optional(),
});

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  content: z.string().max(10000, 'Content must be 10000 characters or less').nullable().optional(),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200).optional(),
  content: z.string().max(10000).nullable().optional(),
});
