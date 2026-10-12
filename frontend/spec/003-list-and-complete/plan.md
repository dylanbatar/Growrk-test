# 003 — List and Complete Tasks Plan

## Summary

The task screen calls the existing `GET /tasks` when it opens, and the existing complete sheet calls `PATCH /tasks/:id`. No new runtime dependency. No new screen.

This milestone replaces two rules from 002: the screen no longer starts without a list request, and confirming the complete sheet no longer changes status only in memory.

## Feature flow

Reuse Vue 3, TypeScript, Vite, Pinia, and Tailwind. Follow the constitution flow:

`TasksView → Pinia store → features/tasks/api/ → GET /tasks and PATCH /tasks/:id`

The list and the complete sheet do not call `fetch`. `TasksView` calls the store. `shared/api/errors.ts` maps a backend envelope. Views and components do not.

```text
src/features/tasks/
  task.ts
  api/tasks.ts
  stores/tasks.ts
  views/TasksView.vue
  components/TaskList.vue
  components/CompleteTaskSheet.vue
  components/CreateTaskSheet.vue
```

| Module | Responsibility |
|---|---|
| `task.ts` | Existing `Task` type. Do not add a second task type. |
| `api/tasks.ts` | Add `listTasks(): Promise<Task[]>` and `completeTask(id: string): Promise<Task>`. Keep `createTask`. Share the existing failure read. |
| `stores/tasks.ts` | Add `loading`, `loadError`, `completing`, and `completeError`. `load()` calls `listTasks`. `complete(id)` calls `completeTask`. Remove `completeLocally`. |
| `views/TasksView.vue` | Loads on open. Passes the list error and the complete error through. Does not call `fetch`. |
| `components/TaskList.vue` | Renders `tasks`. Hides `No tasks yet.` while the first load is in flight or the load failed. |
| `components/CompleteTaskSheet.vue` | Shows `error`, disables Mark completed while `submitting` is true. No `fetch` and no store. |
| `components/CreateTaskSheet.vue` | Unchanged. |

`readApiBaseUrl()` supplies the host. List uses `new URL('/tasks', readApiBaseUrl())`. Complete uses `new URL(`/tasks/${id}`, readApiBaseUrl())`.

## List contract

`listTasks` sends `GET` with no body and no `Authorization` header.

Success is HTTP `200` and a JSON array. Return that array. Do not rewrite items.

Failure uses the same rule as create:

| Response | Thrown `ClientError` |
|---|---|
| Envelope `{ "error": { "code", "message" } }` | `mapApiError` result |
| Any other failed HTTP response | `{ code: "INTERNAL_ERROR", message: "The request could not be completed." }` |
| `fetch` throws | The same fixed `INTERNAL_ERROR` |

Do not put the URL, status, stack, or raw body on the thrown error.

The store:

- `load` sets `loading` to `true` only while it is waiting.
- On success, replace `tasks` with the returned array and set `loadError` to `null`.
- On failure, set `loadError` to the thrown `ClientError` and leave `tasks` empty.
- `create` still appends the `201` task. It does not call `listTasks`.

`TasksView` calls `load` when the screen is set up. It shows `loadError?.message` and does not show `No tasks yet.` while `loading` is true or `loadError` is set.

## Complete contract

`completeTask` sends:

- Method: `PATCH`
- Header: `content-type: application/json`
- Body: `{ "status": "completed" }`
- No `Authorization` header and no other credential header

Success is HTTP `200` and a JSON task. Return that object.

Failure uses the same table as list.

The store:

- `complete` ignores a new call when `completing` is already `true`.
- `completing` is `true` only while `complete` is waiting.
- On success, replace that id with the returned task and set `completeError` to `null`.
- On failure, set `completeError` to the thrown `ClientError` and leave `tasks` unchanged.
- There is no local-only status change.

`TasksView` passes `completeError?.message` and `completing` into the complete sheet. On confirm, it calls `store.complete`. It closes the sheet only after success. Closing the sheet clears `completeError`.

The sheet does not decide the id or the body. Mark completed is disabled while `submitting` is true. The message is the error text only.

## Out of scope in code

Do not add edit, delete, revert, or fetch-one functions. Do not refetch the list after create or complete. Do not load `data/tasks.json`.

## Verification and delivery

- Test `listTasks` success, an empty `200`, an `INTERNAL_ERROR` envelope, a non-envelope failure, and a thrown `fetch` separately.
- Test `completeTask` success, `TASK_NOT_FOUND`, `VALIDATION_ERROR`, `INTERNAL_ERROR`, and a non-envelope failure separately. Assert the `PATCH` body and the absence of a credential header on success.
- Test the store load replacement and the store load failure separately.
- Test the store complete update and the store complete failure separately.
- Test a second `complete` during an in-flight request does not send another call.
- Test the screen loads on open, renders response order, and shows `No tasks yet.` only for a successful empty list.
- Test a list failure shows the message and hides `No tasks yet.`
- Test confirming complete sends `PATCH`, shows the response status, and closes the sheet.
- Test a complete failure keeps the sheet open, keeps the task pending, and shows the message.
- Test create still appends a `201` task and does not send `GET` for that action.
- Update the 002 screen tests that assert the screen never calls `fetch` on open and that complete never calls `fetch`.
- Re-run the existing create and error-mapping tests.
- Run type checking, build, and the complete test suite.

Document `GET /tasks` on open and `PATCH /tasks/:id` from the complete sheet in the frontend README.
