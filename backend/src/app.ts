import express, { type Router } from 'express';
import { errorHandler } from './middlewares/error-handler.js';
import { healthRoutes } from './routes/health.routes.js';
import { notFound } from './middlewares/not-found.js';

export function createApp(additionalRoutes?: Router) {
  const app = express();
  app.use(express.json());
  app.use(healthRoutes);

  if (additionalRoutes) {
    app.use(additionalRoutes);
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
