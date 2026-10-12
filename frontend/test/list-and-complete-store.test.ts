import assert from 'node:assert/strict';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, test, vi } from 'vitest';
import { useTasksStore } from '../src/features/tasks/stores/tasks';

const pending = {
  id: '718ed075-93ed-46ab-a32b-1f32049780e0',
  title: 'Buy groceries',
  status: 'pending' as const,
};

const completed = {
  ...pending,
  status: 'completed' as const,
};

beforeEach(() => {
  setActivePinia(createPinia());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('replaces tasks with the loaded list', async () => {
  vi.stubGlobal('fetch', async () => Response.json([pending], { status: 200 }));
  const store = useTasksStore();

  await store.load();

  assert.deepEqual(store.tasks, [pending]);
  assert.equal(store.loadError, null);
  assert.equal(store.loading, false);
});

test('clears tasks when the list request fails', async () => {
  vi.stubGlobal('fetch', async () =>
    Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 },
    ),
  );
  const store = useTasksStore();

  await store.load();

  assert.deepEqual(store.tasks, []);
  assert.deepEqual(store.loadError, {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred.',
  });
  assert.equal(store.loading, false);
});

test('replaces a task with the completed response', async () => {
  vi.stubGlobal('fetch', async (_url: string | URL, init?: RequestInit) => {
    if (init?.method === 'PATCH') {
      return Response.json(completed, { status: 200 });
    }
    return Response.json([pending], { status: 200 });
  });
  const store = useTasksStore();
  await store.load();

  await store.complete(pending.id);

  assert.deepEqual(store.tasks, [completed]);
  assert.equal(store.completeError, null);
  assert.equal(store.completing, false);
});

test('leaves tasks unchanged when complete fails', async () => {
  vi.stubGlobal('fetch', async (_url: string | URL, init?: RequestInit) => {
    if (init?.method === 'PATCH') {
      return Response.json(
        { error: { code: 'TASK_NOT_FOUND', message: 'Task not found.' } },
        { status: 404 },
      );
    }
    return Response.json([pending], { status: 200 });
  });
  const store = useTasksStore();
  await store.load();

  await store.complete(pending.id);

  assert.deepEqual(store.tasks, [pending]);
  assert.deepEqual(store.completeError, {
    code: 'TASK_NOT_FOUND',
    message: 'Task not found.',
  });
  assert.equal(store.completing, false);
});

test('ignores a second complete while the first request is in flight', async () => {
  let patchCalls = 0;
  let finish: (response: Response) => void = () => {};
  vi.stubGlobal('fetch', (_url: string | URL, init?: RequestInit) => {
    if (init?.method === 'PATCH') {
      patchCalls += 1;
      return new Promise<Response>((resolve) => {
        finish = resolve;
      });
    }
    return Promise.resolve(Response.json([pending], { status: 200 }));
  });
  const store = useTasksStore();
  await store.load();

  const first = store.complete(pending.id);
  const second = store.complete(pending.id);
  assert.equal(patchCalls, 1);

  finish(Response.json(completed, { status: 200 }));
  await first;
  await second;

  assert.equal(patchCalls, 1);
  assert.deepEqual(store.tasks, [completed]);
});
