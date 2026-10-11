# 002 — Create Task Plan

## Summary

Create `frontend/spec/002-create-task/plan.md` documenting how the existing create sheet calls `POST /tasks`. No application code is part of this documentation task.

This milestone covers the create request, Pinia state for the on-screen list, failure messages, and keeping list and complete API calls out of scope.

## Feature flow

Reuse Vue 3, TypeScript, Vite, Pinia, and Tailwind. Add no runtime dependency. Follow the constitution flow:

`TasksView → Pinia store → features/tasks/api/ → POST /tasks`

The sheet only emits `submit` and `input`. `TasksView` is the module that calls the store.

`shared/api/errors.ts` maps a backend envelope to `{ code, message }`. The create function uses it. Views and components do not.

```text
src/features/tasks/
  task.ts
  api/tasks.ts
  stores/tasks.ts
  views/TasksView.vue
  components/CreateTaskSheet.vue
  components/TaskList.vue
  components/CompleteTaskSheet.vue
```

| Module | Responsibility |
|---|---|
| `task.ts` | Existing `Task` type `{ id, title, status }`. Do not add a second task type. |
| `api/tasks.ts` | `createTask(title: string): Promise<Task>`. The only new HTTP function. |
| `stores/tasks.ts` | Pinia store. Holds `tasks`, `creating`, and `createError`. `create(title)` calls `createTask`. `completeLocally(id)` changes status on screen only. |
| `views/TasksView.vue` | Reads the store. Opens and closes the sheets. Does not call `fetch`. |
| `components/CreateTaskSheet.vue` | Collects the title, blocks an empty submit, shows `error`, and disables Create while `submitting` is true. No `fetch` and no store. |
| `components/TaskList.vue` | Renders `tasks`. Unchanged except it already shows `id`, `title`, and `status`. |
| `components/CompleteTaskSheet.vue` | Unchanged. Confirm still emits `confirm` and does not call the API. |

`readApiBaseUrl()` supplies the host. `createTask` builds the URL with `new URL('/tasks', readApiBaseUrl())`.

## Create contract

`createTask` sends:

- Method: `POST`
- Header: `content-type: application/json`
- Body: `{ "title": "<trimmed title>" }`
- No `Authorization` header and no other credential header

Success is HTTP `201` and a JSON task. Return that object. Do not rewrite `id`, `title`, or `status`.

Failure:

| Response | Thrown `ClientError` |
|---|---|
| Envelope `{ "error": { "code", "message" } }` | `mapApiError` result |
| Any other failed HTTP response | `{ code: "INTERNAL_ERROR", message: "The request could not be completed." }` |
| `fetch` throws | The same fixed `INTERNAL_ERROR` |

Do not put the URL, status, stack, or raw body on the thrown error.

The store:

- `tasks` starts as `[]`.
- `createError` starts as `null`.
- `creating` starts as `false` and is `true` only while `create` is waiting.
- `create` ignores a new call when `creating` is already `true`.
- On success, append the returned task, set `createError` to `null`, then set `creating` to `false`.
- On failure, set `createError` to the thrown `ClientError`, leave `tasks` unchanged, then set `creating` to `false`.
- `completeLocally(id)` sets that task's `status` to `completed`. It does not call `api/`.

`TasksView` passes `createError?.message` and `creating` into the sheet. On `submit`, it calls `store.create`. On success it closes the sheet. On failure it leaves the sheet open. Closing the sheet, or a title change, clears `createError`.

The sheet still trims before `submit` and does not emit when the trim is empty. It does not clear the field inside `submit`. The sheet is rendered only while open, so closing it discards the field. Create is disabled when the trim is empty or `submitting` is true. A title edit emits `input`, and `TasksView` clears `createError` on that event.

## Out of scope in code

Do not add `listTasks` or `completeTask` to `api/tasks.ts`. Do not call `GET /tasks` or `PATCH /tasks/:id`. Do not load `data/tasks.json` or any other local task file. The complete sheet continues to call `completeLocally`.

## Verification and delivery

- Test `createTask` success: `POST`, JSON body, `201`, and the returned task, with no credential header.
- Test `VALIDATION_ERROR` and `INTERNAL_ERROR` envelopes separately.
- Test a non-envelope failure and a thrown `fetch` separately; both use the fixed `INTERNAL_ERROR` message and do not include the URL.
- Test the store success append and the store failure with an unchanged list separately.
- Test a second `create` during an in-flight request does not send another call.
- Test the screen: a submitted title renders the response title and server id, then the sheet closes.
- Test empty and whitespace-only titles separately; neither calls `fetch`.
- Test a validation failure keeps the sheet open, keeps the title, shows the message, and adds no list item.
- Test that editing the title after that failure clears the message.
- Test create performs no `GET` or `PATCH`.
- Test confirm on the complete sheet marks the task completed and performs no `fetch`.
- Re-run the existing error-mapping tests.
- Run type checking, build, and the complete test suite.

Document `POST /tasks` from the create sheet in the frontend README. Leave loading the list and completing through the API marked as out of scope.
