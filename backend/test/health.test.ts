import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/app.js';
import { serve } from './helpers/http.js';

test('health reports only a simple service status', async (t) => {
  const request = await serve(t, createApp());

  const response = await request('/health');
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /^application\/json/);
  assert.deepEqual(body, { status: 'ok' });
});
