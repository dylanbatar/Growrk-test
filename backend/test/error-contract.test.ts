import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiError, errorResponse, type ErrorCode } from '../src/middlewares/error-contract.js';

const cases: [ErrorCode, number, string][] = [
  ['INVALID_JSON', 400, 'Request body must contain valid JSON.'],
  ['VALIDATION_ERROR', 400, 'Request input is invalid.'],
  ['TASK_NOT_FOUND', 404, 'Task not found.'],
  ['NOT_FOUND', 404, 'Route not found.'],
  ['INTERNAL_ERROR', 500, 'An unexpected error occurred.'],
];

for (const [code, status, message] of cases) {
  test(`${code} exposes only the public error contract`, () => {
    const error = new ApiError(code);
    error.message = 'private-secret-value /private/internal.ts';

    assert.deepEqual(errorResponse(error), {
      status,
      body: { error: { code, message } },
    });
  });
}

test('an untrusted error cannot supply a public code, status or message', () => {
  const error = { code: 'NOT_FOUND', status: 401, message: 'private-secret-value' };

  assert.deepEqual(errorResponse(error), {
    status: 500,
    body: { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
  });
});
