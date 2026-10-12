import assert from 'node:assert/strict';
import { mount } from '@vue/test-utils';
import { test } from 'vitest';
import CreateTaskSheet from '../src/features/tasks/components/CreateTaskSheet.vue';

test('disables Create when the title is empty', () => {
  const sheet = mount(CreateTaskSheet, { props: { open: true, error: null, submitting: false } });

  assert.equal(sheet.get('[data-action="create"]').attributes('disabled'), '');
});

test('disables Create when the title is whitespace only', async () => {
  const sheet = mount(CreateTaskSheet, { props: { open: true, error: null, submitting: false } });

  await sheet.get('input[name="title"]').setValue('   ');

  assert.equal(sheet.get('[data-action="create"]').attributes('disabled'), '');
  assert.equal(sheet.emitted('submit'), undefined);
});

test('disables Create while a request is in flight', async () => {
  const sheet = mount(CreateTaskSheet, { props: { open: true, error: null, submitting: true } });

  await sheet.get('input[name="title"]').setValue('Buy groceries');
  await sheet.get('[data-action="create"]').trigger('click');

  assert.equal(sheet.get('[data-action="create"]').attributes('disabled'), '');
  assert.equal(sheet.emitted('submit'), undefined);
});

test('shows the create failure message', () => {
  const sheet = mount(CreateTaskSheet, {
    props: { open: true, error: 'Request input is invalid.', submitting: false },
  });

  assert.equal(sheet.get('[role="alert"]').text(), 'Request input is invalid.');
});

test('keeps the title after submit', async () => {
  const sheet = mount(CreateTaskSheet, { props: { open: true, error: null, submitting: false } });
  const input = sheet.get('input[name="title"]');

  await input.setValue('  Buy groceries  ');
  await sheet.get('[data-action="create"]').trigger('click');

  assert.equal((input.element as HTMLInputElement).value, '  Buy groceries  ');
  assert.deepEqual(sheet.emitted('submit')?.[0], ['Buy groceries']);
});

test('emits input when the title changes', async () => {
  const sheet = mount(CreateTaskSheet, { props: { open: true, error: null, submitting: false } });

  await sheet.get('input[name="title"]').setValue('B');

  assert.equal(sheet.emitted('input')?.length, 1);
});
