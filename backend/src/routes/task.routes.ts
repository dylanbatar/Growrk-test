import { Router } from 'express';
import { createTask } from '../controllers/task.controller.js';
import { validateRequest } from '../middlewares/validate-request.js';
import { createTaskSchema } from '../schemas/create-task.js';
import type { TaskService } from '../services/task.service.js';

export function taskRoutes(service: TaskService) {
  const routes = Router();
  routes.post('/tasks', validateRequest(createTaskSchema), createTask(service));
  return routes;
}
