# 001 — UI Foundation Plan

## Summary

Create `frontend/spec/001-architecture/plan.md` documenting the architecture below. No application code is part of this documentation task.

The implementation milestone covers Vite startup, API base URL configuration, feature folders, Pinia registration, a shared error mapper, and a shell with no task operations. Visual design and Tailwind styling work are deferred; Tailwind may be installed only if needed to satisfy the stack, without designing screens.

Future task features are limited to listing, creating, and completing tasks against the existing backend.

## Feature architecture and module structure

Use Vue 3, TypeScript, Vite, and Pinia as required by the constitution.

```text
src/
  main.ts
  app/
    App.vue
  shared/
    config/
    api/
      errors.ts
  features/
    tasks/
      api/
      stores/
      views/
      components/
```

| Module | Responsibility |
|---|---|
| `main.ts` | Create the Vue app, register Pinia, mount `App.vue`. |
| `app/App.vue` | Application shell. No task HTTP. No `fetch`. |
| `shared/config/` | Validate the API base URL and provide the local default. |
| `shared/api/errors.ts` | Map backend `{ error: { code, message } }` and unexpected failures to a client error type. |
| `features/tasks/api/` | Future HTTP functions for tasks. Empty or placeholder in this milestone. |
| `features/tasks/stores/` | Future Pinia store. Register Pinia now; do not load tasks. |
| `features/tasks/views/` | Future task screens. Unused this milestone. |
| `features/tasks/components/` | Future pieces composed by those views. Unused this milestone. |

Request flow for later task work:

`views → components → Pinia store → features/tasks/api/ → Todo API`

`shared/api/errors.ts` is shared HTTP-error mapping, not a mixed feature client. Do not create top-level `src/api/`, `src/stores/`, `src/views/`, or `src/components/` folders.

This milestone introduces no list, create, or complete UI and does not call task endpoints.

## Foundation behavior

- Optional API base URL defaults to `http://127.0.0.1:3000`. A supplied `VITE_API_BASE_URL` overrides it.
- The shell renders without credentials and without task requests.
- Client errors use `{ code, message }` matching the backend public codes when the envelope is present.

| Backend condition | Client error code |
|---|---|
| Malformed JSON | `INVALID_JSON` |
| Invalid request input | `VALIDATION_ERROR` |
| Unknown task | `TASK_NOT_FOUND` |
| Unknown route | `NOT_FOUND` |
| Unexpected failure | `INTERNAL_ERROR` |

The client mapper returns the envelope's `code` and `message`.

Vite dev server, type checking, and tests run from `frontend/`. Proxying or CORS details belong in implementation only if required for the default local API host.

## Future task UI

The backend already supports:

| Operation | HTTP |
|---|---|
| List tasks | `GET /tasks` |
| Create a task | `POST /tasks` `{ "title" }` |
| Complete a task | `PATCH /tasks/:id` `{ "status": "completed" }` |

Task shape: `{ id, title, status }` with `status` of `pending` or `completed`.

Do not implement those screens in this milestone. Before implementing them, extend the specification with empty-list, create, and complete UI behavior.

Editing titles, deleting tasks, reverting to pending, and fetching a single task remain outside the project scope.

## Verification and delivery

For the documentation task, verify consistency with the frontend constitution, the feature folder layout, and the decision that styling is out of scope.

For subsequent foundation implementation:

- Test configuration default and override separately.
- Test that the shell mounts without calling task endpoints.
- Test mapping of each backend error envelope separately.
- Confirm no view or component file contains `fetch`.
- Run type checking, build, and the complete test suite.

Document runtime dependencies and provide development, build, type-check, and test commands. Report incomplete verification and stop on unrelated failures, as required by the constitution.
