import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().trim().min(1),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
