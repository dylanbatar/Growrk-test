import assert from 'node:assert/strict';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { afterEach, test, vi } from 'vitest';
import TasksView from '../src/features/tasks/views/TasksView.vue';

const created = {
  id: '718ed075-93ed-46ab-a32b-1f32049780e0',
  title: 'Buy groceries',
  status: 'pending' as const,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

test('shows the task returned by the API', async () => {
  const calls: Array<{ url: string | URL; init?: RequestInit }> = [];
  vi.stubGlobal('fetch', async (url: string | URL, init?: RequestInit) => {
    calls.push({ url, init });
    return Response.json(created, { status: 201 });
  });
  const screen = mountScreen();

  await screen.get('[aria-label="Create todo"]').trigger('click');
  await screen.get('input[name="title"]').setValue('  Buy groceries  ');
  await screen.get('[data-action="create"]').trigger('click');
  await flushPromises();

  const item = screen.get('[data-task-id="718ed075-93ed-46ab-a32b-1f32049780e0"]');
  assert.equal(item.attributes('data-status'), 'pending');
  assert.match(item.text(), /Buy groceries/);
  assert.equal(screen.find('[role="dialog"]').exists(), false);
  assert.equal(calls.length, 1);
  assert.equal(String(calls[0]?.url), 'http://127.0.0.1:3000/tasks');
  assert.equal(calls[0]?.init?.method, 'POST');
  assert.equal(headerValue(calls[0]?.init?.headers, 'authorization'), undefined);
  assert.deepEqual(JSON.parse(String(calls[0]?.init?.body)), { title: 'Buy groceries' });

  await screen.get('[aria-label="Create todo"]').trigger('click');
  assert.equal((screen.get('input[name="title"]').element as HTMLInputElement).value, '');
});

test('does not create a task when the title is empty', async () => {
  const calls = stubFetch(() => Response.json(created, { status: 201 }));
  const screen = mountScreen();

  await screen.get('[aria-label="Create todo"]').trigger('click');
  await screen.get('[data-action="create"]').trigger('click');

  assert.equal(screen.get('[data-action="create"]').attributes('disabled'), '');
  assert.equal(calls.length, 0);
});

test('does not create a task when the title is whitespace', async () => {
  const calls = stubFetch(() => Response.json(created, { status: 201 }));
  const screen = mountScreen();

  await screen.get('[aria-label="Create todo"]').trigger('click');
  await screen.get('input[name="title"]').setValue('   ');
  await screen.get('[data-action="create"]').trigger('click');

  assert.equal(screen.get('[data-action="create"]').attributes('disabled'), '');
  assert.equal(calls.length, 0);
});

test('keeps the sheet open when create is rejected', async () => {
  stubFetch(() =>
    Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Request input is invalid.' } },
      { status: 400 },
    ),
  );
  const screen = mountScreen();

  await screen.get('[aria-label="Create todo"]').trigger('click');
  await screen.get('input[name="title"]').setValue('Buy groceries');
  await screen.get('[data-action="create"]').trigger('click');
  await flushPromises();

  assert.equal(screen.get('[role="dialog"]').isVisible(), true);
  assert.equal((screen.get('input[name="title"]').element as HTMLInputElement).value, 'Buy groceries');
  assert.equal(screen.get('[role="alert"]').text(), 'Request input is invalid.');
  assert.equal(screen.find('[role="listitem"]').exists(), false);
});

test('clears the create failure when the title changes', async () => {
  stubFetch(() =>
    Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Request input is invalid.' } },
      { status: 400 },
    ),
  );
  const screen = mountScreen();

  await screen.get('[aria-label="Create todo"]').trigger('click');
  await screen.get('input[name="title"]').setValue('Buy groceries');
  await screen.get('[data-action="create"]').trigger('click');
  await flushPromises();
  await screen.get('input[name="title"]').setValue('Buy groceries tomorrow');

  assert.equal(screen.find('[role="alert"]').exists(), false);
  assert.equal(screen.find('[role="listitem"]').exists(), false);
});

test('does not call the API when the screen opens', async () => {
  const calls = stubFetch(() => Response.json(created, { status: 201 }));
  const screen = mountScreen();
  await flushPromises();

  assert.match(screen.text(), /No tasks yet/);
  assert.equal(calls.length, 0);
});

test('creates a task with POST /tasks only', async () => {
  const calls = stubFetch(() => Response.json(created, { status: 201 }));
  const screen = mountScreen();

  await screen.get('[aria-label="Create todo"]').trigger('click');
  await screen.get('input[name="title"]').setValue('Buy groceries');
  await screen.get('[data-action="create"]').trigger('click');
  await flushPromises();

  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.init?.method, 'POST');
  assert.equal(new URL(String(calls[0]?.url)).pathname, '/tasks');
});

test('marks a task completed on screen without a request', async () => {
  const calls = stubFetch(() => Response.json(created, { status: 201 }));
  const screen = mountScreen();

  await screen.get('[aria-label="Create todo"]').trigger('click');
  await screen.get('input[name="title"]').setValue('Buy groceries');
  await screen.get('[data-action="create"]').trigger('click');
  await flushPromises();
  await screen.get('button[data-task-id="718ed075-93ed-46ab-a32b-1f32049780e0"]').trigger('click');
  await screen.get('[data-action="complete"]').trigger('click');

  assert.equal(
    screen.get('li[data-task-id="718ed075-93ed-46ab-a32b-1f32049780e0"]').attributes('data-status'),
    'completed',
  );
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.init?.method, 'POST');
});

function stubFetch(respond: () => Response) {
  const calls: Array<{ url: string | URL; init?: RequestInit }> = [];
  vi.stubGlobal('fetch', async (url: string | URL, init?: RequestInit) => {
    calls.push({ url, init });
    return respond();
  });
  return calls;
}

function mountScreen() {
  return mount(TasksView, {
    global: { plugins: [createPinia()] },
  });
}

function headerValue(headers: HeadersInit | undefined, name: string): string | undefined {
  return new Headers(headers).get(name) ?? undefined;
}
