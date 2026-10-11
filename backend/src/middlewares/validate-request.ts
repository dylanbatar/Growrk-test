import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { ApiError } from './error-contract.js';

export function validateRequest(schema: ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      next(new ApiError('VALIDATION_ERROR'));
      return;
    }

    request.body = result.data;
    next();
  };
}
