# 003 — List Tasks Tasks

Target: `backend/spec/003-list-tasks/task.md`, beside the spec and plan.

Tasks are ordered by dependency. Each implementation task includes focused HTTP tests and running the available suite. Report incomplete checks and stop on unrelated failures.

- [x] **T01 — Add `listAll` to the repository.** Extend the interface and JSON implementation. Missing file returns `[]` and does not write. **Covers:** FR-2, FR-3. **Depends on:** none.

- [x] **T02 — Add list to the service, controller, and route.** `GET /tasks` returns HTTP `200` with the array. No validation middleware. **Covers:** FR-1. **Depends on:** T01.

- [x] **T03 — Test empty list.** `GET /tasks` returns `200` and `[]` and does not create a data file. **Covers:** FR-2. **Depends on:** T02.

- [x] **T04 — Test list after create.** Two created tasks are returned in insertion order. **Covers:** FR-1. **Depends on:** T02.

- [x] **T05 — Test list persistence failure.** Force `listAll` to fail and assert `500 / INTERNAL_ERROR` without file paths. Confirm a later health request still succeeds. **Covers:** FR-4. **Depends on:** T02.

- [x] **T06 — Test unauthenticated list.** Call `GET /tasks` without tokens or sessions. **Covers:** FR-1. **Depends on:** T03.

- [x] **T07 — Document list-task.** Document `GET /tasks`, empty array, insertion order, and that editing remains out of scope. **Supports:** FR-1–FR-5. **Depends on:** T03–T06.

- [x] **T08 — Complete acceptance verification.** Run type checking, build, and the full suite. **Covers:** FR-1–FR-5. **Depends on:** T07.
