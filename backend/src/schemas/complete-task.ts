import { z } from 'zod';

export const completeTaskSchema = z.object({
  status: z.literal('completed'),
});

export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;
