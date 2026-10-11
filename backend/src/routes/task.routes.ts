import { Router } from 'express';
import { completeTask, createTask, listTasks } from '../controllers/task.controller.js';
import { validateRequest } from '../middlewares/validate-request.js';
import { completeTaskSchema } from '../schemas/complete-task.js';
import { createTaskSchema } from '../schemas/create-task.js';
import type { TaskService } from '../services/task.service.js';

export function taskRoutes(service: TaskService) {
  const routes = Router();
  routes.get('/tasks', listTasks(service));
  routes.post('/tasks', validateRequest(createTaskSchema), createTask(service));
  routes.patch('/tasks/:id', validateRequest(completeTaskSchema), completeTask(service));
  return routes;
}
