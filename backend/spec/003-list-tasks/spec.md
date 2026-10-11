# 003 — List Tasks Specification

## Context

The API can create a task and store it through a JSON repository. This milestone adds listing every stored task.

Outside this milestone: editing, deleting, changing status, retrieving a task by id, filtering, pagination, user interfaces, authentication, authorization, application logging, graceful shutdown, and request-size requirements.

Technology choices, architecture, file organization, and implementation details belong in the later plan.

## Objective

Allow an unauthenticated client to list all tasks in insertion order.

## Functional Requirements

### FR-1 — List all tasks

The API must return every stored task as a JSON array.

**Acceptance criteria**

- `GET /tasks` returns HTTP `200`.
- The response body is a JSON array of task objects with `id`, `title`, and `status`.
- Tasks appear in the order they were created.
- Listing does not require credentials.
- Listing does not change stored data.

### FR-2 — List an empty collection

When no tasks exist, the API must return an empty array.

**Acceptance criteria**

- `GET /tasks` against empty storage returns HTTP `200` and `[]`.
- A missing data file is treated as an empty collection.
- Listing an empty collection does not create a data file.

### FR-3 — Read through a repository

The list operation must use the existing repository interface. The service must not read files directly.

**Acceptance criteria**

- The repository exposes `listAll`.
- The JSON implementation returns the current array without writing.
- Tests use isolated storage and do not share files.

### FR-4 — Handle persistence failure consistently

If storage cannot complete the list, the API must fail with the existing server-error contract.

**Acceptance criteria**

- A persistence failure returns HTTP `500` with error code `INTERNAL_ERROR`.
- The response does not expose file paths, stack traces, or storage details.
- A persistence failure does not prevent later requests from being answered.
- No new public error codes are introduced in this milestone.

### FR-5 — Keep existing behavior unchanged

Create, health, configuration, unknown routes, and malformed JSON keep their existing contracts.

**Acceptance criteria**

- `POST /tasks` still creates a task as specified in 002.
- `GET /health` still returns HTTP `200` and `{"status":"ok"}` without storage access.
- Editing, deleting, completing, and fetching a single task are not provided.
