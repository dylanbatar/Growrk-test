import { mapApiError, type ClientError } from '../../../shared/api/errors';
import { readApiBaseUrl } from '../../../shared/config/api-base-url';
import type { Task } from '../task';

const unexpectedFailure: ClientError = {
  code: 'INTERNAL_ERROR',
  message: 'The request could not be completed.',
};

export async function listTasks(): Promise<Task[]> {
  let response: Response;

  try {
    response = await fetch(new URL('/tasks', readApiBaseUrl()), {
      method: 'GET',
    });
  } catch {
    throw { ...unexpectedFailure };
  }

  if (!response.ok) {
    throw await readFailure(response);
  }

  return response.json() as Promise<Task[]>;
}

export async function completeTask(id: string): Promise<Task> {
  let response: Response;

  try {
    response = await fetch(new URL(`/tasks/${encodeURIComponent(id)}`, readApiBaseUrl()), {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
  } catch {
    throw { ...unexpectedFailure };
  }

  if (!response.ok) {
    throw await readFailure(response);
  }

  return response.json() as Promise<Task>;
}

export async function createTask(title: string): Promise<Task> {
  let response: Response;

  try {
    response = await fetch(new URL('/tasks', readApiBaseUrl()), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title }),
    });
  } catch {
    throw { ...unexpectedFailure };
  }

  if (!response.ok) {
    throw await readFailure(response);
  }

  return response.json() as Promise<Task>;
}

async function readFailure(response: Response): Promise<ClientError> {
  try {
    return mapApiError(await response.json());
  } catch {
    return { ...unexpectedFailure };
  }
}
