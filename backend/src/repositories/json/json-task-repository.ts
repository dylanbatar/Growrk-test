import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Task } from '../../models/task.js';
import type { TaskRepository } from '../interfaces/task-repository.js';

export class JsonTaskRepository implements TaskRepository {
  constructor(private readonly filePath: string) {}

  async add(task: Task): Promise<Task> {
    const tasks = await this.read();
    tasks.push(task);
    await this.write(tasks);
    return task;
  }

  listAll(): Promise<Task[]> {
    return this.read();
  }

  async findById(id: string): Promise<Task | undefined> {
    const tasks = await this.read();
    return tasks.find((task) => task.id === id);
  }

  async update(task: Task): Promise<Task> {
    const tasks = await this.read();
    const index = tasks.findIndex((stored) => stored.id === task.id);

    if (index === -1) {
      throw new Error('Cannot update a task that is not stored.');
    }

    tasks[index] = task;
    await this.write(tasks);
    return task;
  }

  private async read(): Promise<Task[]> {
    try {
      const contents = await readFile(this.filePath, 'utf8');
      return JSON.parse(contents) as Task[];
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return [];
      }

      throw error;
    }
  }

  private async write(tasks: Task[]) {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(tasks, null, 2)}\n`);
  }
}
