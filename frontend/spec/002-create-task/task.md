# 002 — Create Task Tasks

Target: `frontend/spec/002-create-task/task.md`, beside the spec and plan.

Tasks are ordered by dependency. Each implementation task includes focused tests and running the available suite. Report incomplete checks and stop on unrelated failures. Do not add a runtime dependency.

- [ ] **T01 — Add `createTask`.** Add `src/features/tasks/api/tasks.ts` with `createTask(title: string): Promise<Task>`. `POST` `{ "title" }` to `/tasks` on `readApiBaseUrl()`. Return the `201` JSON task unchanged. Map an error envelope with `mapApiError`. Map any other failure to `{ code: "INTERNAL_ERROR", message: "The request could not be completed." }` with no URL in the error. Test success, `VALIDATION_ERROR`, `INTERNAL_ERROR`, a non-envelope response, and a thrown `fetch` separately. **Covers:** FR-1, FR-3, FR-5. **Depends on:** none.

- [ ] **T02 — Hold created tasks in Pinia.** Add `src/features/tasks/stores/tasks.ts`. State is `tasks: Task[]`, `creating: boolean`, and `createError: ClientError | null`. `create(title)` calls `createTask`, appends the result, and records `createError` without appending when it throws. Ignore `create` while `creating` is true. `completeLocally(id)` sets `status` to `completed` and does not call `api/`. Test success, failure, the ignored second call, and `completeLocally` separately. **Covers:** FR-1, FR-3, FR-4. **Depends on:** T01.

- [ ] **T03 — Show a create failure on the sheet.** Update `CreateTaskSheet.vue` to accept `error: string | null` and `submitting: boolean`. Render the message with no status code or URL. Keep Create disabled when the trimmed title is empty or `submitting` is true. Do not emit `submit` for an empty or whitespace-only title. Do not clear the title inside `submit`. Emit `input` when the title changes. Do not import `fetch` or the store. Test the disabled empty field, a disabled in-flight submit, the visible message, and the kept title separately. **Covers:** FR-2, FR-3. **Depends on:** none.

- [ ] **T04 — Wire the screen to the store.** Change `TasksView.vue` so the list and create sheet use the store. On `submit`, call `store.create`. Close the sheet only after success. Pass `createError?.message` and `creating` into the sheet. Clear `createError` when the sheet closes or it emits `input`. Remove the local `local-` id. Keep the Hello heading, `No tasks yet.`, and the create control. Test one successful create: response id, response title, `pending`, sheet closed, empty field on the next open, and no credential header. **Covers:** FR-1, FR-5. **Depends on:** T02, T03.

- [ ] **T05 — Test an empty title on the screen.** From the mounted screen, submit an empty title and a whitespace-only title in separate tests. Assert Create is unavailable and `fetch` is not called. **Covers:** FR-2. **Depends on:** T04.

- [ ] **T06 — Test a failed create on the screen.** Stub `POST /tasks` as `400` with `VALIDATION_ERROR` and message `Request input is invalid.` Assert the sheet stays open, the submitted title remains, that message is visible, and the list has no item. In a separate test, change the title after that failure and assert the message is gone. Do not combine either test with the success test. **Covers:** FR-3. **Depends on:** T04.

- [ ] **T07 — Keep list and complete off the API.** Assert mounting the screen calls no `fetch`. Assert a successful create calls only `POST /tasks`. Assert confirming the complete sheet sets that item to `completed` and does not call `fetch`. **Covers:** FR-4. **Depends on:** T04.

- [ ] **T08 — Document create from the UI.** Update the frontend README so the create sheet calls `POST /tasks`, shows the returned task, and surfaces `VALIDATION_ERROR` and `INTERNAL_ERROR`. State that `GET /tasks` and `PATCH /tasks/:id` remain later work. **Supports:** FR-1–FR-5. **Depends on:** T05–T07.

- [ ] **T09 — Complete acceptance verification.** Run `npm run typecheck`, `npm test`, and `npm run build` from `frontend/`. Map results to every acceptance criterion and report failures or unverified behavior. **Covers:** FR-1–FR-5. **Depends on:** T08.
