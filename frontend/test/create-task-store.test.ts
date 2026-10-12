import assert from 'node:assert/strict';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, test, vi } from 'vitest';
import { useTasksStore } from '../src/features/tasks/stores/tasks';

const created = {
  id: '718ed075-93ed-46ab-a32b-1f32049780e0',
  title: 'Buy groceries',
  status: 'pending' as const,
};

beforeEach(() => {
  setActivePinia(createPinia());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('appends the task returned by create', async () => {
  vi.stubGlobal('fetch', async () => Response.json(created, { status: 201 }));
  const store = useTasksStore();

  await store.create('Buy groceries');

  assert.deepEqual(store.tasks, [created]);
  assert.equal(store.createError, null);
  assert.equal(store.creating, false);
});

test('keeps the list unchanged when create fails', async () => {
  vi.stubGlobal('fetch', async () =>
    Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Request input is invalid.' } },
      { status: 400 },
    ),
  );
  const store = useTasksStore();

  await store.create('Buy groceries');

  assert.deepEqual(store.tasks, []);
  assert.deepEqual(store.createError, {
    code: 'VALIDATION_ERROR',
    message: 'Request input is invalid.',
  });
  assert.equal(store.creating, false);
});

test('ignores a second create while the first request is in flight', async () => {
  let calls = 0;
  let finish: (response: Response) => void = () => {};
  vi.stubGlobal('fetch', () => {
    calls += 1;
    return new Promise<Response>((resolve) => {
      finish = resolve;
    });
  });
  const store = useTasksStore();

  const first = store.create('Buy groceries');
  const second = store.create('Read a chapter');
  assert.equal(calls, 1);

  finish(Response.json(created, { status: 201 }));
  await first;
  await second;

  assert.deepEqual(store.tasks, [created]);
  assert.equal(calls, 1);
});

test('marks a task completed on screen without calling the API', async () => {
  let calls = 0;
  vi.stubGlobal('fetch', async () => {
    calls += 1;
    return Response.json(created, { status: 201 });
  });
  const store = useTasksStore();
  await store.create('Buy groceries');
  calls = 0;

  store.completeLocally(created.id);

  assert.deepEqual(store.tasks, [{ ...created, status: 'completed' }]);
  assert.equal(calls, 0);
});
