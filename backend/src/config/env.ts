import { z } from 'zod';

const environmentSchema = z.object({
  PORT: z.string().regex(/^\d+$/).transform(Number)
    .pipe(z.number().int().min(1).max(65535)).prefault('3000'),
});

export class ConfigurationError extends Error {
  constructor() {
    super('Invalid configuration: PORT must be a decimal integer from 1 to 65535.');
    this.name = 'ConfigurationError';
  }
}

export function readConfig(environment: NodeJS.ProcessEnv = process.env) {
  const result = environmentSchema.safeParse(environment);

  if (!result.success) {
    throw new ConfigurationError();
  }

  return { port: result.data.PORT, host: '127.0.0.1' };
}
