# 002 — Create Task Specification

## Context

The API foundation can start, report health, and return consistent errors. This milestone adds the first todo operation: creating a task.

Outside this milestone: listing tasks, editing, deleting, changing status, retrieving a task by id, user interfaces, authentication, authorization, application logging, graceful shutdown, and request-size requirements.

Technology choices, architecture, file organization, and implementation details belong in the later plan.

## Objective

Allow an unauthenticated client to create a task with a title. The API assigns an id, starts the task as pending, and stores it through a replaceable repository.

## Functional Requirements

### FR-1 — Create a task

The API must accept a create-task request and return the stored task.

**Acceptance criteria**

- `POST /tasks` with a valid JSON body creates a task.
- The success response status is `201`.
- The response body is a task object with `id`, `title`, and `status`.
- `id` is a server-generated UUID. The client cannot choose it.
- `status` is always `pending` on create. The client cannot choose it.
- Leading and trailing whitespace is removed from `title` before it is stored and returned.
- Creating a task does not require credentials.

### FR-2 — Validate the title

The API must reject invalid create input with the existing validation error, before the controller runs.

**Acceptance criteria**

- `title` is required and must be a string.
- After trimming, `title` must contain at least one character.
- Empty strings, whitespace-only strings, missing `title`, and non-string `title` values are invalid.
- Invalid input returns HTTP `400` with error code `VALIDATION_ERROR`.
- Invalid input is not stored.
- Validation details, submitted values, and internal paths are not returned.

### FR-3 — Persist through a repository

Created tasks must be stored through a repository interface. The first implementation uses a JSON file.

**Acceptance criteria**

- Services do not read or write files directly.
- A JSON repository appends the created task to a JSON array.
- A missing data file is treated as an empty collection and then written on the first successful create.
- Tests use isolated storage and do not share files.
- Changing the storage implementation later must not require changes to create-task business rules.

### FR-4 — Handle persistence failure consistently

If storage cannot complete the create, the API must fail with the existing server-error contract and must not return a created task.

**Acceptance criteria**

- A persistence failure returns HTTP `500` with error code `INTERNAL_ERROR`.
- The response does not expose file paths, stack traces, or storage details.
- A persistence failure does not prevent later requests from being answered.
- No new public error codes are introduced in this milestone.

### FR-5 — Keep foundation behavior unchanged

Health, configuration, unknown routes, and malformed JSON keep their existing contracts.

**Acceptance criteria**

- `GET /health` still returns HTTP `200` and `{"status":"ok"}` without storage access.
- Malformed JSON still returns `400 / INVALID_JSON`.
- Unknown routes still return `404 / NOT_FOUND`.
- Create-task requests do not require authentication.
- Listing, updating, deleting, completing, and fetching a single task are not provided.
