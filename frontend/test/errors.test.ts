import assert from 'node:assert/strict';
import { test } from 'vitest';
import { mapApiError } from '../src/shared/api/errors';

const envelopes = [
  ['INVALID_JSON', 'Request body must contain valid JSON.'],
  ['VALIDATION_ERROR', 'Request input is invalid.'],
  ['TASK_NOT_FOUND', 'No task exists for that id.'],
  ['NOT_FOUND', 'Route not found.'],
  ['INTERNAL_ERROR', 'An unexpected error occurred.'],
] as const;

for (const [code, message] of envelopes) {
  test(`maps a backend ${code} envelope`, () => {
    assert.deepEqual(mapApiError({ error: { code, message } }), { code, message });
  });
}
