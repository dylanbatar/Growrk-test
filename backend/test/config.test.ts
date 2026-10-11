import assert from 'node:assert/strict';
import test from 'node:test';
import { readConfig } from '../src/config/env.js';

test('missing PORT uses the documented local defaults', () => {
  assert.deepEqual(readConfig({}), { port: 3000, host: '127.0.0.1' });
});

for (const port of ['1', '8080', '65535', '03000']) {
  test(`accepts valid PORT ${port}`, () => {
    assert.equal(readConfig({ PORT: port }).port, Number(port));
  });
}

test('configuration errors name the setting without disclosing its value', () => {
  assert.throws(() => readConfig({ PORT: 'private-secret-value' }), {
    name: 'ConfigurationError',
    message: 'Invalid configuration: PORT must be a decimal integer from 1 to 65535.',
  });
});
