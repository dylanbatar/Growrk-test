import type { ErrorRequestHandler } from 'express';
import { ApiError, errorResponse } from './error-contract.js';

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  const normalized = error instanceof SyntaxError && 'type' in error && error.type === 'entity.parse.failed'
    ? new ApiError('INVALID_JSON')
    : error;
  const result = errorResponse(normalized);
  response.status(result.status).json(result.body);
};
