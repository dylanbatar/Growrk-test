import assert from 'node:assert/strict';
import { afterEach, test, vi } from 'vitest';
import { completeTask } from '../src/features/tasks/api/tasks';

const taskId = '718ed075-93ed-46ab-a32b-1f32049780e0';
const completed = {
  id: taskId,
  title: 'Buy groceries',
  status: 'completed' as const,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

test('completes a task from a 200 response', async () => {
  const calls: Array<{ url: string | URL; init?: RequestInit }> = [];
  vi.stubGlobal('fetch', async (url: string | URL, init?: RequestInit) => {
    calls.push({ url, init });
    return Response.json(completed, { status: 200 });
  });

  const result = await completeTask(taskId);

  assert.deepEqual(result, completed);
  assert.equal(calls.length, 1);
  assert.equal(String(calls[0]?.url), `http://127.0.0.1:3000/tasks/${taskId}`);
  assert.equal(calls[0]?.init?.method, 'PATCH');
  assert.equal(headerValue(calls[0]?.init?.headers, 'content-type'), 'application/json');
  assert.equal(headerValue(calls[0]?.init?.headers, 'authorization'), undefined);
  assert.deepEqual(JSON.parse(String(calls[0]?.init?.body)), { status: 'completed' });
});

test('maps a TASK_NOT_FOUND envelope', async () => {
  stubError(404, { error: { code: 'TASK_NOT_FOUND', message: 'Task not found.' } });

  assert.deepEqual(await captureFailure(), {
    code: 'TASK_NOT_FOUND',
    message: 'Task not found.',
  });
});

test('maps a VALIDATION_ERROR envelope from complete', async () => {
  stubError(400, { error: { code: 'VALIDATION_ERROR', message: 'Request input is invalid.' } });

  assert.deepEqual(await captureFailure(), {
    code: 'VALIDATION_ERROR',
    message: 'Request input is invalid.',
  });
});

test('maps an INTERNAL_ERROR envelope from complete', async () => {
  stubError(500, { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } });

  assert.deepEqual(await captureFailure(), {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred.',
  });
});

test('maps a non-envelope complete failure without the request URL', async () => {
  stubError(502, 'upstream failed at http://127.0.0.1:3000/tasks');

  const error = await captureFailure();

  assert.deepEqual(error, {
    code: 'INTERNAL_ERROR',
    message: 'The request could not be completed.',
  });
  assert.equal(JSON.stringify(error).includes('127.0.0.1'), false);
  assert.equal(JSON.stringify(error).includes('/tasks'), false);
});

function stubError(status: number, body: unknown) {
  vi.stubGlobal('fetch', async () =>
    new Response(typeof body === 'string' ? body : JSON.stringify(body), {
      status,
      headers: { 'content-type': typeof body === 'string' ? 'text/plain' : 'application/json' },
    }),
  );
}

async function captureFailure(): Promise<unknown> {
  try {
    await completeTask(taskId);
  } catch (error) {
    return error;
  }

  assert.fail('expected completeTask to fail');
}

function headerValue(headers: HeadersInit | undefined, name: string): string | undefined {
  return new Headers(headers).get(name) ?? undefined;
}
