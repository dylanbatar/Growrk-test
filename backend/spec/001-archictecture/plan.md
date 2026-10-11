# 001 — API Foundation Plan

## Summary

Create `backend/spec/001-archictecture/plan.md` documenting the architecture below. No application code is part of this documentation task.

The implementation milestone covers startup, configuration, health checks, and consistent errors. Future task features are limited to adding tasks and listing all tasks.

## Layered architecture and module structure

Use Node.js, TypeScript, Express, and Zod as required by the constitution.

```text
src/
  routes/
  schemas/
  middlewares/
  controllers/
  services/
  repositories/
    interfaces/
    json/
  models/
  config/
  app.ts
  server.ts
```

| Module | Responsibility |
|---|---|
| `routes/` | Map HTTP methods and paths to validation middleware and controllers. |
| `schemas/` | Define Zod request-validation schemas outside controllers. |
| `middlewares/` | Validate input, handle unknown routes, and normalize errors. |
| `controllers/` | Read validated input, call services, and produce HTTP responses. |
| `services/` | Apply business rules without depending on Express or file storage. |
| `repositories/interfaces/` | Define storage contracts consumed by services. |
| `repositories/json/` | Implement storage contracts using JSON files. |
| `models/` | Define domain types independent of HTTP and persistence. |
| `config/` | Validate configuration and provide defaults. |
| `app.ts` | Assemble the application and wire dependencies without opening a listening port. |
| `server.ts` | Load configuration, start the server, and report startup failures. |

Request flow:

`routes → validation middleware → controllers → services → repository interfaces`

JSON repositories implement the interfaces and are injected when assembling the application.

The health check uses only a route and controller. Task services, repositories, schemas, and models remain documented future structure; this milestone introduces no task implementations or storage access.

## Foundation behavior

- Optional `PORT` defaults to `3000`. Accept decimal integers from `1` through `65535`; reject empty, whitespace-only, nonnumeric, and out-of-range supplied values.
- Bind to `127.0.0.1` for local development.
- Invalid configuration or listening failures terminate startup with a nonzero exit status and a concise explanation on standard error. Do not echo configuration values.
- `GET /health` returns HTTP `200` with `{"status":"ok"}`, without authentication, metadata, or storage access.
- Errors use `{"error":{"code":"…","message":"…"}}`.

| Condition | HTTP status | Error code |
|---|---|---|
| Malformed JSON | 400 | `INVALID_JSON` |
| Invalid request input | 400 | `VALIDATION_ERROR` |
| Unknown route | 404 | `NOT_FOUND` |
| Unexpected request-processing failure | 500 | `INTERNAL_ERROR` |

Parse JSON before routing. Register unknown-route handling after routes and error handling last. Malformed JSON therefore takes precedence over an unknown route.

Unexpected errors return a generic message without internal details. Recoverable request failures leave the application available for subsequent requests. If a response has already started, delegate connection handling to Express.

Application logging, graceful shutdown, request-size policy, and process-level crash recovery remain outside this milestone.

## Future JSON data model

| Field | Type | Meaning |
|---|---|---|
| `id` | String | Server-generated UUID |
| `title` | String | Required task title |
| `status` | String | Always `pending` when created |

Store tasks as a JSON array; an empty collection is `[]`.

```json
[
  {
    "id": "718ed075-93ed-46ab-a32b-1f32049780e0",
    "title": "Buy groceries",
    "status": "pending"
  },
  {
    "id": "b9e6a37e-b165-4aef-a675-c94639f71c48",
    "title": "Read a chapter",
    "status": "pending"
  }
]
```

The future repository contract exposes only `add` and `listAll`. Do not create or load a task-data file during the foundation milestone.

Editing, deleting, changing status, and retrieving individual tasks are outside the project scope. Before implementing add/list behavior, extend the specification with title validation, listing order, and persistence failure behavior.

## Verification and delivery

For the documentation task, verify consistency with the existing specification and constitution, the accepted folder structure, and the JSON example.

For subsequent foundation implementation:

- Test configuration defaults, overrides, and invalid values separately.
- Test successful startup and failure when the listening port is occupied.
- Verify the exact health response without credentials or storage access.
- Test each error category and malformed-JSON precedence separately.
- Exercise validation and unexpected failures through test-only handlers.
- Verify that a successful request can follow a recoverable failure.
- Run type checking, build, and the complete test suite.

Document runtime dependencies and provide development, build, start, type-check, and test commands. Report incomplete verification and stop on unrelated failures, as required by the constitution.
