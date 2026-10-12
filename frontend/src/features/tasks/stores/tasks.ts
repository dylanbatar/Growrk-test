import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ClientError } from '../../../shared/api/errors';
import { createTask } from '../api/tasks';
import type { Task } from '../task';

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([]);
  const creating = ref(false);
  const createError = ref<ClientError | null>(null);

  async function create(title: string) {
    if (creating.value) {
      return;
    }

    creating.value = true;

    try {
      const task = await createTask(title);
      tasks.value = [...tasks.value, task];
      createError.value = null;
    } catch (error) {
      createError.value = isClientError(error) ? error : unexpectedFailure();
    } finally {
      creating.value = false;
    }
  }

  function completeLocally(id: string) {
    tasks.value = tasks.value.map((task) =>
      task.id === id ? { ...task, status: 'completed' as const } : task,
    );
  }

  return { tasks, creating, createError, create, completeLocally };
});

function isClientError(error: unknown): error is ClientError {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const candidate = error as { code?: unknown; message?: unknown };
  return typeof candidate.code === 'string' && typeof candidate.message === 'string';
}

function unexpectedFailure(): ClientError {
  return {
    code: 'INTERNAL_ERROR',
    message: 'The request could not be completed.',
  };
}
