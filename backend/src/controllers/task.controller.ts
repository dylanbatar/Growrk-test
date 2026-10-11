import type { RequestHandler } from 'express';
import type { Task } from '../models/task.js';
import type { CreateTaskInput } from '../schemas/create-task.js';
import type { TaskService } from '../services/task.service.js';

export function createTask(service: TaskService): RequestHandler<
  Record<string, string>,
  Task,
  CreateTaskInput
> {
  return async (request, response, next) => {
    try {
      const task = await service.create(request.body);
      response.status(201).json(task);
    } catch (error) {
      next(error);
    }
  };
}

export function listTasks(service: TaskService): RequestHandler {
  return async (_request, response, next) => {
    try {
      const tasks = await service.list();
      response.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  };
}
