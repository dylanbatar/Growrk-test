import assert from 'node:assert/strict';
import { afterEach, test, vi } from 'vitest';
import { createTask } from '../src/features/tasks/api/tasks';

const task = {
  id: '718ed075-93ed-46ab-a32b-1f32049780e0',
  title: 'Buy groceries',
  status: 'pending' as const,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

test('creates a task from a 201 response', async () => {
  const calls: Array<{ url: string | URL; init?: RequestInit }> = [];

  vi.stubGlobal('fetch', async (url: string | URL, init?: RequestInit) => {
    calls.push({ url, init });
    return Response.json(task, { status: 201 });
  });

  const created = await createTask('Buy groceries');

  assert.deepEqual(created, task);
  assert.equal(calls.length, 1);
  assert.equal(String(calls[0]?.url), 'http://127.0.0.1:3000/tasks');
  assert.equal(calls[0]?.init?.method, 'POST');
  assert.equal(headerValue(calls[0]?.init?.headers, 'content-type'), 'application/json');
  assert.equal(headerValue(calls[0]?.init?.headers, 'authorization'), undefined);
  assert.deepEqual(JSON.parse(String(calls[0]?.init?.body)), { title: 'Buy groceries' });
});

test('maps a VALIDATION_ERROR envelope', async () => {
  stubError(400, { error: { code: 'VALIDATION_ERROR', message: 'Request input is invalid.' } });

  const error = await captureFailure('Buy groceries');

  assert.deepEqual(error, { code: 'VALIDATION_ERROR', message: 'Request input is invalid.' });
});

test('maps an INTERNAL_ERROR envelope', async () => {
  stubError(500, { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } });

  const error = await captureFailure('Buy groceries');

  assert.deepEqual(error, { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
});

test('maps a non-envelope failure without the request URL', async () => {
  stubError(502, 'upstream failed at http://127.0.0.1:3000/tasks');

  const error = await captureFailure('Buy groceries');

  assert.deepEqual(error, {
    code: 'INTERNAL_ERROR',
    message: 'The request could not be completed.',
  });
  assert.equal(JSON.stringify(error).includes('127.0.0.1'), false);
  assert.equal(JSON.stringify(error).includes('/tasks'), false);
});

test('maps a thrown fetch without the request URL', async () => {
  vi.stubGlobal('fetch', async () => {
    throw new Error('connect ECONNREFUSED 127.0.0.1:3000/tasks');
  });

  const error = await captureFailure('Buy groceries');

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

async function captureFailure(title: string): Promise<unknown> {
  try {
    await createTask(title);
  } catch (error) {
    return error;
  }

  assert.fail('expected createTask to fail');
}

function headerValue(headers: HeadersInit | undefined, name: string): string | undefined {
  const value = new Headers(headers).get(name);
  return value ?? undefined;
}
