# 003 — List and Complete Tasks

Target: `frontend/spec/003-list-and-complete/task.md`, beside the spec and plan.

Tasks are ordered by dependency. Each implementation task includes focused tests and running the available suite. Report incomplete checks and stop on unrelated failures. Do not add a runtime dependency.

- [x] **T01 — Add `listTasks`.** In `src/features/tasks/api/tasks.ts`, add `listTasks(): Promise<Task[]>`. `GET /tasks` on `readApiBaseUrl()`. Return the `200` JSON array unchanged. Reuse the existing failure read. Test success, an empty array, an `INTERNAL_ERROR` envelope, a non-envelope response, and a thrown `fetch` separately. The non-envelope and thrown cases use `{ code: "INTERNAL_ERROR", message: "The request could not be completed." }` and do not include the URL. **Covers:** FR-1, FR-2. **Depends on:** none.

- [x] **T02 — Add `completeTask`.** In the same module, add `completeTask(id: string): Promise<Task>`. `PATCH /tasks/:id` with `{ "status": "completed" }` and `content-type: application/json`. Return the `200` JSON task unchanged. No credential header. Test success, `TASK_NOT_FOUND`, `VALIDATION_ERROR`, `INTERNAL_ERROR`, and a non-envelope response separately. **Covers:** FR-3, FR-4. **Depends on:** T01.

- [x] **T03 — Load and complete in the store.** Extend `src/features/tasks/stores/tasks.ts` with `loading`, `loadError`, `completing`, and `completeError`. `load()` calls `listTasks` and replaces `tasks` on success. On failure it sets `loadError` and leaves `tasks` empty. `complete(id)` calls `completeTask`, replaces that task on success, and records `completeError` without changing `tasks` on failure. Ignore `complete` while `completing` is true. Remove `completeLocally`. `create` still appends and does not call `listTasks`. Test load success, load failure, complete success, complete failure, and the ignored second complete separately. **Covers:** FR-1, FR-2, FR-3, FR-4. **Depends on:** T02.

- [x] **T04 — Show list and complete failures.** Update `TaskList.vue` so `No tasks yet.` is hidden while loading or when the load failed. Update `CompleteTaskSheet.vue` to accept `error: string | null` and `submitting: boolean`. Render the message with no status code or URL. Disable Mark completed while `submitting` is true. Do not import `fetch` or the store in either component. Test the hidden empty text, the visible complete message, and the disabled in-flight button separately. **Covers:** FR-2, FR-4, FR-5. **Depends on:** none.

- [x] **T05 — Wire the screen.** Change `TasksView.vue` so opening the screen calls `store.load`. Show `loadError?.message` and pass loading into the list. On confirm, call `store.complete` and close the sheet only after success. Pass `completeError?.message` and `completing` into the complete sheet. Clear `completeError` when the sheet closes. Remove `completeLocally`. Keep the Hello heading, the create control, and the create sheet. Test one successful load: response order, server ids, and no credential header. **Covers:** FR-1, FR-3, FR-5. **Depends on:** T03, T04.

- [x] **T06 — Test the empty list and a failed load.** In separate tests, assert HTTP `200` `[]` shows `No tasks yet.`, and assert a load `INTERNAL_ERROR` shows `An unexpected error occurred.` and does not show `No tasks yet.` Assert the in-flight screen does not show `No tasks yet.` **Covers:** FR-1, FR-2. **Depends on:** T05.

- [x] **T07 — Test complete on the screen.** Stub a pending task from `GET /tasks`. Confirm the sheet and assert one `PATCH` with `{ "status": "completed" }`, the item `completed`, and the sheet closed. In a separate test, stub `404` `TASK_NOT_FOUND` with message `Task not found.` Assert the sheet stays open, the task stays `pending`, and that message is visible. **Covers:** FR-3, FR-4. **Depends on:** T05.

- [x] **T08 — Keep create on `POST` only.** Update the 002 screen tests that assert mount sends no `fetch` and that complete sends no `fetch`. Assert a successful create, after the list has loaded, sends `POST /tasks` and appends the `201` task without another `GET`. **Covers:** FR-1, FR-5. **Depends on:** T05.

- [x] **T09 — Document list and complete.** Update the frontend README so opening the screen calls `GET /tasks` and the complete sheet calls `PATCH /tasks/:id`. State the `200` list, the `200` completed task, and `TASK_NOT_FOUND`, `VALIDATION_ERROR`, and `INTERNAL_ERROR`. **Supports:** FR-1–FR-5. **Depends on:** T06–T08.

- [x] **T10 — Complete acceptance verification.** Run `npm run typecheck`, `npm test`, and `npm run build` from `frontend/`. Map results to every acceptance criterion and report failures or unverified behavior. **Covers:** FR-1–FR-5. **Depends on:** T09.
