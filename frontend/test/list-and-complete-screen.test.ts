import assert from 'node:assert/strict';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { afterEach, test, vi } from 'vitest';
import TasksView from '../src/features/tasks/views/TasksView.vue';

const second = {
  id: 'id-2',
  title: 'Doodle a sunset',
  status: 'pending' as const,
};

const first = {
  id: 'id-1',
  title: 'Snap texture photos',
  status: 'completed' as const,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

test('loads tasks in response order without credentials', async () => {
  const calls: Array<{ url: string | URL; init?: RequestInit }> = [];
  vi.stubGlobal('fetch', async (url: string | URL, init?: RequestInit) => {
    calls.push({ url, init });
    return Response.json([second, first], { status: 200 });
  });
  const screen = mountScreen();
  await flushPromises();

  const items = screen.findAll('[role="listitem"]');
  assert.deepEqual(
    items.map((item) => item.attributes('data-task-id')),
    ['id-2', 'id-1'],
  );
  assert.equal(items[1]?.attributes('data-status'), 'completed');
  assert.equal(calls.length, 1);
  assert.equal(String(calls[0]?.url), 'http://127.0.0.1:3000/tasks');
  assert.equal(calls[0]?.init?.method, 'GET');
  assert.equal(headerValue(calls[0]?.init?.headers, 'authorization'), undefined);
});

test('shows no tasks yet when the API returns an empty list', async () => {
  vi.stubGlobal('fetch', async () => Response.json([], { status: 200 }));
  const screen = mountScreen();
  await flushPromises();

  assert.match(screen.text(), /No tasks yet/);
});

test('shows a list failure without an empty list', async () => {
  vi.stubGlobal('fetch', async () =>
    Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 },
    ),
  );
  const screen = mountScreen();
  await flushPromises();

  assert.match(screen.text(), /An unexpected error occurred\./);
  assert.equal(screen.text().includes('No tasks yet.'), false);
  assert.equal(screen.text().includes('500'), false);
});

test('does not show an empty list while tasks are loading', async () => {
  vi.stubGlobal('fetch', () => new Promise(() => {}));
  const screen = mountScreen();
  await flushPromises();

  assert.equal(screen.text().includes('No tasks yet.'), false);
});

test('marks a loaded task completed and closes the sheet', async () => {
  const calls: Array<{ url: string | URL; init?: RequestInit }> = [];
  vi.stubGlobal('fetch', async (url: string | URL, init?: RequestInit) => {
    calls.push({ url, init });
    if (init?.method === 'PATCH') {
      return Response.json({ ...second, status: 'completed' }, { status: 200 });
    }
    return Response.json([second], { status: 200 });
  });
  const screen = mountScreen();
  await flushPromises();

  await screen.get('button[data-task-id="id-2"]').trigger('click');
  await screen.get('[data-action="complete"]').trigger('click');
  await flushPromises();

  assert.equal(screen.get('li[data-task-id="id-2"]').attributes('data-status'), 'completed');
  assert.equal(screen.find('[role="dialog"]').exists(), false);
  const patch = calls.filter((call) => call.init?.method === 'PATCH');
  assert.equal(patch.length, 1);
  assert.equal(calls.filter((call) => call.init?.method === 'GET').length, 1);
  assert.equal(new URL(String(patch[0]?.url)).pathname, '/tasks/id-2');
  assert.deepEqual(JSON.parse(String(patch[0]?.init?.body)), { status: 'completed' });
});

test('keeps the sheet open when complete is rejected', async () => {
  vi.stubGlobal('fetch', async (_url: string | URL, init?: RequestInit) => {
    if (init?.method === 'PATCH') {
      return Response.json(
        { error: { code: 'TASK_NOT_FOUND', message: 'Task not found.' } },
        { status: 404 },
      );
    }
    return Response.json([second], { status: 200 });
  });
  const screen = mountScreen();
  await flushPromises();

  await screen.get('button[data-task-id="id-2"]').trigger('click');
  await screen.get('[data-action="complete"]').trigger('click');
  await flushPromises();

  assert.equal(screen.get('[role="dialog"]').isVisible(), true);
  assert.equal(screen.get('li[data-task-id="id-2"]').attributes('data-status'), 'pending');
  assert.equal(screen.get('[role="alert"]').text(), 'Task not found.');
});

test('clears the complete failure when the sheet closes', async () => {
  vi.stubGlobal('fetch', async (_url: string | URL, init?: RequestInit) => {
    if (init?.method === 'PATCH') {
      return Response.json(
        { error: { code: 'TASK_NOT_FOUND', message: 'Task not found.' } },
        { status: 404 },
      );
    }
    return Response.json([second], { status: 200 });
  });
  const screen = mountScreen();
  await flushPromises();

  await screen.get('button[data-task-id="id-2"]').trigger('click');
  await screen.get('[data-action="complete"]').trigger('click');
  await flushPromises();
  await screen.get('[aria-label="Close"]').trigger('click');

  assert.equal(screen.find('[role="dialog"]').exists(), false);
  assert.equal(screen.find('[role="alert"]').exists(), false);
  assert.equal(screen.get('li[data-task-id="id-2"]').attributes('data-status'), 'pending');
});

function mountScreen() {
  return mount(TasksView, {
    global: { plugins: [createPinia()] },
  });
}

function headerValue(headers: HeadersInit | undefined, name: string): string | undefined {
  return new Headers(headers).get(name) ?? undefined;
}
