import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Task } from '../../models/task.js';
import type { TaskRepository } from '../interfaces/task-repository.js';

export class JsonTaskRepository implements TaskRepository {
  constructor(private readonly filePath: string) {}

  async add(task: Task): Promise<Task> {
    const tasks = await this.read();
    tasks.push(task);
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(tasks, null, 2)}\n`);
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
}
