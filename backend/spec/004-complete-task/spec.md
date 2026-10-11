# 004 — Complete Task Specification

## Context

The API can create and list tasks. This milestone marks a task as completed by id.

Outside this milestone: editing the title, deleting, fetching a single task, reverting to pending, user interfaces, authentication, authorization, application logging, graceful shutdown, and request-size requirements.

Technology choices, architecture, file organization, and implementation details belong in the later plan.

## Objective

Allow an unauthenticated client to mark an existing task as completed. Completing an already completed task is idempotent.

## Functional Requirements

### FR-1 — Mark a task as completed

The API must accept a complete-task request for an existing task and return the updated task.

**Acceptance criteria**

- `PATCH /tasks/:id` with `{ "status": "completed" }` completes the task.
- The success response status is `200`.
- The response body is the task with the same `id` and `title`, and `status` of `completed`.
- The change is stored through the repository.
- Completing a task does not require credentials.

### FR-2 — Completing twice is idempotent

Completing a task that is already completed must succeed without changing it further.

**Acceptance criteria**

- A second `PATCH` with `{ "status": "completed" }` returns HTTP `200`.
- The returned task still has `status` of `completed` and the original `id` and `title`.

### FR-3 — Validate the complete body

The API must reject invalid complete input with the existing validation error, before the controller runs.

**Acceptance criteria**

- `status` is required and must be the string `completed`.
- Missing `status`, non-string `status`, and values other than `completed` are invalid.
- Invalid input returns HTTP `400` with error code `VALIDATION_ERROR`.
- Invalid input does not change stored tasks.
- Validation details are not returned.

### FR-4 — Unknown task

A complete request for an id that is not stored must fail with a distinguishable not-found error.

**Acceptance criteria**

- An unknown id returns HTTP `404` with error code `TASK_NOT_FOUND`.
- The message identifies that the task was not found, not that the route was missing.
- The response does not expose storage paths.

### FR-5 — Handle persistence failure consistently

If storage cannot complete the update, the API must fail with the existing server-error contract.

**Acceptance criteria**

- A persistence failure returns HTTP `500` with error code `INTERNAL_ERROR`.
- The response does not expose file paths, stack traces, or storage details.
- A persistence failure does not prevent later requests from being answered.

### FR-6 — Keep existing behavior unchanged

Create, list, health, unknown routes, and malformed JSON keep their existing contracts.

**Acceptance criteria**

- `POST /tasks` still creates a pending task.
- `GET /tasks` still lists all tasks.
- Title edits, deletes, and fetching a single task are not provided.
