import assert from 'node:assert/strict';
import { afterEach, test, vi } from 'vitest';
import { listTasks } from '../src/features/tasks/api/tasks';

const tasks = [
  {
    id: '718ed075-93ed-46ab-a32b-1f32049780e0',
    title: 'Buy groceries',
    status: 'pending' as const,
  },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

test('lists tasks from a 200 response', async () => {
  const calls: Array<{ url: string | URL; init?: RequestInit }> = [];
  vi.stubGlobal('fetch', async (url: string | URL, init?: RequestInit) => {
    calls.push({ url, init });
    return Response.json(tasks, { status: 200 });
  });

  const listed = await listTasks();

  assert.deepEqual(listed, tasks);
  assert.equal(calls.length, 1);
  assert.equal(String(calls[0]?.url), 'http://127.0.0.1:3000/tasks');
  assert.equal(calls[0]?.init?.method, 'GET');
  assert.equal(calls[0]?.init?.body, undefined);
  assert.equal(headerValue(calls[0]?.init?.headers, 'authorization'), undefined);
});

test('lists an empty 200 response', async () => {
  vi.stubGlobal('fetch', async () => Response.json([], { status: 200 }));

  assert.deepEqual(await listTasks(), []);
});

test('maps an INTERNAL_ERROR envelope from list', async () => {
  stubError(500, { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } });

  assert.deepEqual(await captureFailure(), {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred.',
  });
});

test('maps a non-envelope list failure without the request URL', async () => {
  stubError(502, 'upstream failed at http://127.0.0.1:3000/tasks');

  const error = await captureFailure();

  assert.deepEqual(error, {
    code: 'INTERNAL_ERROR',
    message: 'The request could not be completed.',
  });
  assert.equal(JSON.stringify(error).includes('127.0.0.1'), false);
  assert.equal(JSON.stringify(error).includes('/tasks'), false);
});

test('maps a thrown list fetch without the request URL', async () => {
  vi.stubGlobal('fetch', async () => {
    throw new Error('connect ECONNREFUSED 127.0.0.1:3000/tasks');
  });

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
    await listTasks();
  } catch (error) {
    return error;
  }

  assert.fail('expected listTasks to fail');
}

function headerValue(headers: HeadersInit | undefined, name: string): string | undefined {
  return new Headers(headers).get(name) ?? undefined;
}
