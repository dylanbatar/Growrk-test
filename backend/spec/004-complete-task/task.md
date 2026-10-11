# 004 — Complete Task Tasks

Target: `backend/spec/004-complete-task/task.md`, beside the spec and plan.

- [x] **T01 — Extend the model and error contract.** Allow `status: 'completed'`. Add `TASK_NOT_FOUND`. **Covers:** FR-1, FR-4.

- [x] **T02 — Add find/update on the repository.** JSON looks up by id and replaces the stored task. **Covers:** FR-1. **Depends on:** T01.

- [x] **T03 — Validate complete input.** Schema requires `status: "completed"`. **Covers:** FR-3. **Depends on:** none.

- [x] **T04 — Add complete service, controller, and route.** `PATCH /tasks/:id` with validation then controller. Missing id → `TASK_NOT_FOUND`. Already completed → return as-is. **Covers:** FR-1, FR-2, FR-4. **Depends on:** T01–T03.

- [x] **T05 — Test complete over HTTP.** Pending → completed, persisted. **Covers:** FR-1. **Depends on:** T04.

- [x] **T06 — Test idempotent complete.** Second PATCH returns the same completed task. **Covers:** FR-2. **Depends on:** T04.

- [x] **T07 — Test unknown id and invalid body separately.** **Covers:** FR-3, FR-4. **Depends on:** T04.

- [x] **T08 — Test persistence failure and unauthenticated complete.** **Covers:** FR-1, FR-5. **Depends on:** T04.

- [x] **T09 — Document complete-task.** **Supports:** FR-1–FR-6. **Depends on:** T05–T08.

- [x] **T10 — Complete acceptance verification.** Typecheck, build, full suite. **Covers:** FR-1–FR-6. **Depends on:** T09.
