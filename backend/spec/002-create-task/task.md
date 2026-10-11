# 002 — Create Task Tasks

Target: `backend/spec/002-create-task/task.md`, beside the spec and plan.

Tasks are ordered by dependency. Each implementation task includes focused tests and running the available suite. Report incomplete checks and stop on unrelated failures.

- [ ] **T01 — Define the task model.** Add `src/models/task.ts` with `{ id: string; title: string; status: 'pending' }`. No HTTP or file types. **Supports:** FR-1. **Depends on:** none.

- [ ] **T02 — Define the repository contract.** Add `src/repositories/interfaces/task-repository.ts` with `add(task: Task): Promise<Task>`. Do not add list/update/delete methods. **Supports:** FR-3. **Depends on:** T01.

- [ ] **T03 — Implement JSON `add`.** Add `src/repositories/json/json-task-repository.ts` that appends to a JSON array at a constructor-supplied path. Treat a missing file as `[]`. Test append, missing-file create, and isolated temp files separately. **Covers:** FR-3. **Depends on:** T02.

- [ ] **T04 — Validate create input.** Add `src/schemas/create-task.ts` with `title` trimmed and minimum length 1. Test valid trim plus empty, whitespace-only, missing, and non-string titles separately using the existing validation middleware. **Covers:** FR-2. **Depends on:** none.

- [ ] **T05 — Implement the create service.** Add `src/services/task.service.ts` that assigns `crypto.randomUUID()`, sets `status` to `pending`, and calls `repository.add`. Test the returned task shape. Do not read files in the service. **Covers:** FR-1, FR-3. **Depends on:** T02, T04.

- [ ] **T06 — Add the create route.** Add controller and `POST /tasks` with `validateRequest(createTaskSchema)` before the controller. Return HTTP `201` with the created task. **Covers:** FR-1, FR-2. **Depends on:** T04, T05.

- [ ] **T07 — Wire the application.** Inject an optional task repository into `createApp` for tests; production uses the JSON repository and `data/tasks.json`. Register task routes beside health. **Covers:** FR-3, FR-5. **Depends on:** T03, T06.

- [ ] **T08 — Test successful HTTP create.** Cover `201`, UUID `id`, trimmed `title`, and `status: "pending"` in one focused test. Use isolated storage. **Covers:** FR-1. **Depends on:** T07.

- [ ] **T09 — Test invalid HTTP create.** Cover empty, whitespace-only, missing, and non-string `title` separately. Each returns `400 / VALIDATION_ERROR` and does not write storage. **Covers:** FR-2. **Depends on:** T07.

- [ ] **T10 — Test persistence failure.** Force the repository `add` to fail and assert `500 / INTERNAL_ERROR` without file paths or stack traces. Confirm a later health request still succeeds. **Covers:** FR-4, FR-5. **Depends on:** T07.

- [ ] **T11 — Verify unauthenticated create.** Call `POST /tasks` without tokens, sessions, or accounts. Confirm no login or permission layer is added. **Covers:** FR-1. **Depends on:** T08.

- [ ] **T12 — Verify foundation behavior.** Re-check `GET /health`, malformed JSON, and an unknown route. Health must not access task storage. **Covers:** FR-5. **Depends on:** T07.

- [ ] **T13 — Document create-task.** Document `POST /tasks`, the request/response, validation, JSON file location, and that listing/editing remain out of scope. **Supports:** FR-1–FR-5. **Depends on:** T08–T12.

- [ ] **T14 — Complete acceptance verification.** Run type checking, build, and the full suite. Map results to every acceptance criterion and report failures or unverified behavior. **Covers:** FR-1–FR-5. **Depends on:** T13.
