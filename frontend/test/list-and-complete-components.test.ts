import assert from 'node:assert/strict';
import { mount } from '@vue/test-utils';
import { test } from 'vitest';
import CompleteTaskSheet from '../src/features/tasks/components/CompleteTaskSheet.vue';
import TaskList from '../src/features/tasks/components/TaskList.vue';

test('hides the empty text while the list is loading', () => {
  const screen = mount(TaskList, { props: { tasks: [], loading: true } });

  assert.equal(screen.text().includes('No tasks yet.'), false);
});

test('hides the empty text when the load failed', () => {
  const screen = mount(TaskList, { props: { tasks: [], loadFailed: true } });

  assert.equal(screen.text().includes('No tasks yet.'), false);
});

test('shows the complete failure message', () => {
  const screen = mount(CompleteTaskSheet, {
    props: { title: 'Doodle a sunset', error: 'Task not found.' },
  });

  assert.equal(screen.get('[role="alert"]').text(), 'Task not found.');
  assert.equal(screen.text().includes('404'), false);
  assert.equal(screen.text().includes('/tasks'), false);
});

test('disables mark completed while the request is in flight', () => {
  const screen = mount(CompleteTaskSheet, {
    props: { title: 'Doodle a sunset', submitting: true },
  });

  assert.equal((screen.get('[data-action="complete"]').element as HTMLButtonElement).disabled, true);
});
