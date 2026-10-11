import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test, { type TestContext } from 'node:test';
import { createApp } from '../src/app.js';
import type { Task } from '../src/models/task.js';
import type { TaskRepository } from '../src/repositories/interfaces/task-repository.js';
import { JsonTaskRepository } from '../src/repositories/json/json-task-repository.js';
import { json, serve } from './helpers/http.js';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const validationError = {
  error: { code: 'VALIDATION_ERROR', message: 'Request input is invalid.' },
};

async function isolatedApp(t: TestContext) {
  const directory = await mkdtemp(join(tmpdir(), 'tasks-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const filePath = join(directory, 'tasks.json');
  const request = await serve(t, createApp({
    taskRepository: new JsonTaskRepository(filePath),
  }));
  return { request, filePath };
}

test('creates a task', async (t) => {
  const { request, filePath } = await isolatedApp(t);

  const response = await request('/tasks', json('POST', { title: '  Buy groceries  ' }));
  const task = await response.json() as Task;
  const stored = JSON.parse(await readFile(filePath, 'utf8'));

  assert.equal(response.status, 201);
  assert.match(response.headers.get('content-type') ?? '', /^application\/json/);
  assert.match(task.id, uuid);
  assert.equal(task.title, 'Buy groceries');
  assert.equal(task.status, 'pending');
  assert.deepEqual(stored, [task]);
});

test('appends a second task to storage', async (t) => {
  const { request, filePath } = await isolatedApp(t);

  const first = await (await request('/tasks', json('POST', { title: 'Buy groceries' }))).json() as Task;
  const second = await (await request('/tasks', json('POST', { title: 'Read a chapter' }))).json() as Task;
  const stored = JSON.parse(await readFile(filePath, 'utf8'));

  assert.deepEqual(stored, [first, second]);
});

test('rejects an empty title without writing storage', async (t) => {
  const { request, filePath } = await isolatedApp(t);

  const response = await request('/tasks', json('POST', { title: '' }));

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), validationError);
  await assert.rejects(() => access(filePath), { code: 'ENOENT' });
});

test('rejects a whitespace-only title without writing storage', async (t) => {
  const { request, filePath } = await isolatedApp(t);

  const response = await request('/tasks', json('POST', { title: '   ' }));

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), validationError);
  await assert.rejects(() => access(filePath), { code: 'ENOENT' });
});

test('rejects a missing title without writing storage', async (t) => {
  const { request, filePath } = await isolatedApp(t);

  const response = await request('/tasks', json('POST', {}));

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), validationError);
  await assert.rejects(() => access(filePath), { code: 'ENOENT' });
});

test('rejects a non-string title without writing storage', async (t) => {
  const { request, filePath } = await isolatedApp(t);

  const response = await request('/tasks', json('POST', { title: 1 }));

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), validationError);
  await assert.rejects(() => access(filePath), { code: 'ENOENT' });
});

test('persistence failure returns INTERNAL_ERROR without leaking details', async (t) => {
  const repository: TaskRepository = {
    async add() {
      throw new Error('EACCES /private/internal/tasks.json\n    at JsonTaskRepository.add');
    },
  };
  const request = await serve(t, createApp({ taskRepository: repository }));

  const failed = await request('/tasks', json('POST', { title: 'Buy groceries' }));
  const body = await failed.json();
  const health = await request('/health');

  assert.equal(failed.status, 500);
  assert.deepEqual(body, {
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
  });
  assert.equal(JSON.stringify(body).includes('tasks.json'), false);
  assert.equal(JSON.stringify(body).includes('JsonTaskRepository'), false);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: 'ok' });
});

test('creates a task without authentication headers', async (t) => {
  const { request } = await isolatedApp(t);

  const response = await request('/tasks', json('POST', { title: 'Buy groceries' }));

  assert.equal(response.status, 201);
  assert.equal(response.headers.get('www-authenticate'), null);
});

test('health does not access task storage', async (t) => {
  const repository: TaskRepository = {
    async add() {
      throw new Error('storage must not be used');
    },
  };
  const request = await serve(t, createApp({ taskRepository: repository }));

  const response = await request('/health');

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('malformed JSON on POST /tasks returns INVALID_JSON', async (t) => {
  const { request } = await isolatedApp(t);

  const response = await request('/tasks', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{"title":',
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(body, {
    error: { code: 'INVALID_JSON', message: 'Request body must contain valid JSON.' },
  });
});

test('unknown route returns NOT_FOUND', async (t) => {
  const { request } = await isolatedApp(t);

  const response = await request('/missing');
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.deepEqual(body, {
    error: { code: 'NOT_FOUND', message: 'Route not found.' },
  });
});
