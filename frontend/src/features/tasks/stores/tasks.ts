import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ClientError } from '../../../shared/api/errors';
import { completeTask, createTask, listTasks } from '../api/tasks';
import type { Task } from '../task';

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([]);
  const loading = ref(false);
  const loadError = ref<ClientError | null>(null);
  const creating = ref(false);
  const createError = ref<ClientError | null>(null);
  const completing = ref(false);
  const completeError = ref<ClientError | null>(null);

  async function load() {
    loading.value = true;

    try {
      tasks.value = await listTasks();
      loadError.value = null;
    } catch (error) {
      tasks.value = [];
      loadError.value = isClientError(error) ? error : unexpectedFailure();
    } finally {
      loading.value = false;
    }
  }

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

  async function complete(id: string) {
    if (completing.value) {
      return;
    }

    completing.value = true;

    try {
      const task = await completeTask(id);
      tasks.value = tasks.value.map((item) => (item.id === id ? task : item));
      completeError.value = null;
    } catch (error) {
      completeError.value = isClientError(error) ? error : unexpectedFailure();
    } finally {
      completing.value = false;
    }
  }

  return {
    tasks,
    loading,
    loadError,
    creating,
    createError,
    completing,
    completeError,
    load,
    create,
    complete,
  };
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
