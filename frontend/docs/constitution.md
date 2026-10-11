# Constitution

1. **Simple stack:** Use Vue 3, TypeScript, Vite, Pinia, and Tailwind CSS. Document the need for every added runtime dependency. Do not add another CSS framework or another client state library.
2. **Spec before code:** Every behavior change must match an agreed specification; update the specification before changing that behavior. Work in `spec/<id>-<name>/` with `spec.md`, `plan.md`, and `task.md`, the same way as the backend.
3. **Feature architecture:** Group code by feature. Each feature keeps its HTTP functions, Pinia store, and components together.

```text
src/features/<feature>/
  api/
  stores/
  components/
```

Shared UI or configuration that more than one feature needs may live under `src/shared/`. Do not create top-level `components/`, `stores/`, or `api/` folders that mix unrelated features.

4. **API folder owns HTTP:** Every request to the Todo API belongs in that feature's `api/` folder. Components must call `api/` functions (directly or through the feature store). Components must not create requests with `fetch`, Axios, or any other HTTP client.

# example

These snippets illustrate client structure, not a new UI specification.

# AVOID

Create the request inside a component:

```vue
<script setup lang="ts">
async function addTask(title: string) {
  const response = await fetch('http://127.0.0.1:3000/tasks', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title })
  })

  if (response.status !== 201) {
    throw new Error(await response.text())
  }

  return response.json()
}
</script>
```

# INSTEAD DO

Put the request in the feature `api/` folder:

```typescript
// src/features/tasks/api/tasks.ts
export async function createTask(title: string): Promise<Task> {
  const response = await fetch(new URL('/tasks', apiBaseUrl), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title })
  })

  if (!response.ok) {
    throw new ApiRequestError(response.status)
  }

  return response.json() as Promise<Task>
}
```

The Pinia store calls that function and holds the result. The component dispatches a store action and renders state. It does not construct URLs or interpret HTTP envelopes.

Do not reimplement backend business rules (UUID generation, persistence, title trimming as the source of truth). The API remains authoritative. The UI may disable an empty submit for usability; it must still handle `VALIDATION_ERROR` from the API.

The snippets assume `apiBaseUrl` and `ApiRequestError` live in shared configuration. This follows [the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), [Pinia](https://pinia.vuejs.org/), and [Vue `<script setup>`](https://vuejs.org/api/sfc-script-setup.html).

5. **Pinia holds client state:** Feature stores in `stores/` are the UI state manager. Load and update tasks through store actions that call `api/`. Do not keep a parallel copy of server data only inside component `ref`s when a store already owns that data.
6. **Tailwind for styles:** Style with Tailwind utility classes in templates. Do not add another CSS framework. Document any extra Tailwind plugin.

7. **Tests required:** Test each behavior separately; do not combine create, list, and complete checks in one test. Cover new behavior and run the existing suite after every task. Report results and any incomplete verification.

# example

These snippets illustrate test structure, not a new UI specification. The example helpers are not implemented yet. Creating a task as setup for another behavior is fine; assertions should verify the behavior named in the test.

# AVOID

```typescript
test('lists, creates and completes a task in one flow', async () => {
  const screen = await setup()

  expect(screen.queryAllByRole('listitem')).toHaveLength(0)

  await screen.addTask('  Aprender Vue  ')
  expect(screen.getByText('Aprender Vue')).toBeTruthy()

  await screen.completeTask('Aprender Vue')
  expect(screen.getByText('Aprender Vue').closest('[data-status]')).toHaveAttribute(
    'data-status',
    'completed'
  )
})
```

# INSTEAD DO

```typescript
test('lists no tasks when the API returns an empty collection', async () => {
  const screen = await setup({ tasks: [] })

  expect(screen.queryAllByRole('listitem')).toHaveLength(0)
})

test('creates a task', async () => {
  const screen = await setup({ tasks: [] })

  await screen.addTask('  Aprender Vue  ')

  expect(screen.getByText('Aprender Vue')).toBeTruthy()
})

// it's the same with another ones
```

8. **Unrelated failures:** Stop and report failures outside the task. Wait for the user's direction before fixing them.
9. **API is the data source:** The frontend does not keep a second source of truth on disk. Task data comes from `GET /tasks`, `POST /tasks`, and `PATCH /tasks/:id` through `api/` and Pinia. Changing the API host must not require changes to components.
