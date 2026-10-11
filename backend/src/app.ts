import express, { type Router } from 'express';
import { errorHandler } from './middlewares/error-handler.js';
import { healthRoutes } from './routes/health.routes.js';
import { taskRoutes } from './routes/task.routes.js';
import { notFound } from './middlewares/not-found.js';
import { JsonTaskRepository } from './repositories/json/json-task-repository.js';
import type { TaskRepository } from './repositories/interfaces/task-repository.js';
import { TaskService } from './services/task.service.js';

export const defaultTaskFilePath = 'data/tasks.json';

export type AppOptions = {
  taskRepository?: TaskRepository;
  additionalRoutes?: Router;
};

export function createApp(options: AppOptions = {}) {
  const repository = options.taskRepository ?? new JsonTaskRepository(defaultTaskFilePath);
  const app = express();
  app.use(express.json());
  app.use(healthRoutes);
  app.use(taskRoutes(new TaskService(repository)));

  if (options.additionalRoutes) {
    app.use(options.additionalRoutes);
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
