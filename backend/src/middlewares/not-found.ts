import type { RequestHandler } from 'express';
import { ApiError } from './error-contract.js';

export const notFound: RequestHandler = (_request, _response, next) => {
  next(new ApiError('NOT_FOUND'));
};
