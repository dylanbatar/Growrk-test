# 002 — Create Task Plan

## Summary

Create `backend/spec/002-create-task/plan.md` documenting how `POST /tasks` is implemented on the existing Express foundation. No application code is part of this documentation task.

This milestone covers title validation, task creation, JSON persistence through a repository, and mapped persistence failures. Listing tasks remains future work.

## Layered architecture

Reuse Node.js, TypeScript, Express, and Zod. Follow the constitution request flow:

`routes → validation middleware → controllers → services → repository interfaces`

JSON repositories implement the interfaces and are injected when assembling the application.

```text
src/
  models/task.ts
  schemas/create-task.ts
  repositories/interfaces/task-repository.ts
  repositories/json/json-task-repository.ts
  services/task.service.ts
  controllers/task.controller.ts
  routes/task.routes.ts
  app.ts
```

| Module | Responsibility |
|---|---|
| `models/task.ts` | Domain type `{ id, title, status }` with `status` limited to `'pending'`. |
| `schemas/create-task.ts` | Zod schema for the create body. Controllers do not validate. |
| `repositories/interfaces/task-repository.ts` | Storage contract with `add(task)`. |
| `repositories/json/json-task-repository.ts` | JSON-file implementation of `add`. |
| `services/task.service.ts` | Trimmed title already arrives from the schema; assign UUID and `pending`; call `add`. |
| `controllers/task.controller.ts` | Call the service and return HTTP `201`. |
| `routes/task.routes.ts` | `POST /tasks` with `validateRequest(createTaskSchema)` then the controller. |
| `app.ts` | Wire a task repository into the service and register task routes beside health. |

The health check stays a route plus controller with no storage access.

## Create-task contract

- `POST /tasks`
- Request body: `{ "title": "<string>" }`
- Success: HTTP `201` and `{ "id": "<uuid>", "title": "<trimmed title>", "status": "pending" }`
- Schema: `title` is a string, trimmed, minimum length 1. Unknown fields are stripped. `id` and `status` are not accepted from the client.
- Invalid body: existing `400 / VALIDATION_ERROR` and `{ "error": { "code": "VALIDATION_ERROR", "message": "Request input is invalid." } }`
- Persistence failure: existing `500 / INTERNAL_ERROR`
- No authentication headers or accounts

Generate `id` with `crypto.randomUUID()`.

## JSON persistence

Default production file: `data/tasks.json`, relative to the process working directory.

Store tasks as a JSON array. An empty collection is `[]`.

```json
[
  {
    "id": "718ed075-93ed-46ab-a32b-1f32049780e0",
    "title": "Buy groceries",
    "status": "pending"
  }
]
```

`add` reads the current array (missing file → `[]`), appends the task, and writes the array back. Do not write through the service. Inject the repository into the service so tests can use a temporary file.

Do not add `listAll` in this milestone. Do not add environment variables for the file path; pass the path into the JSON repository constructor.

## Application assembly

`createApp` accepts an optional task repository for tests. Production startup uses `JsonTaskRepository` with the default file path.

Register JSON parsing, then health and task routes, then unknown-route handling, then the error handler. Keep the optional test-only router.

## Verification and delivery

- Test title defaults: trim, reject empty/whitespace/missing/non-string, each in its own test.
- Test successful create returns `201`, a UUID `id`, trimmed `title`, and `status: "pending"`.
- Test that a created task is appended to the JSON file.
- Test a persistence failure as `INTERNAL_ERROR` without leaking paths.
- Test create without credentials.
- Re-run health and the existing error-contract suite.
- Run type checking, build, and the complete test suite.

Document `POST /tasks` in the backend README. Leave listing, editing, deleting, and status changes marked as out of scope.
