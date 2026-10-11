# 003 — List Tasks Plan

## Summary

Create `backend/spec/003-list-tasks/plan.md` documenting how `GET /tasks` is added to the existing create-task flow. No application code is part of this documentation task.

This milestone covers listing all tasks in insertion order, an empty collection, and mapped persistence failures. Editing and fetching a single task remain out of scope.

## Layered architecture

Reuse the existing request flow:

`routes → controllers → services → repository interfaces`

List has no request body or query string, so it does not use validation middleware.

| Module | Change |
|---|---|
| `repositories/interfaces/task-repository.ts` | Add `listAll(): Promise<Task[]>`. |
| `repositories/json/json-task-repository.ts` | Return the current array. Missing file → `[]`. Do not write. |
| `services/task.service.ts` | `list()` calls `repository.listAll()`. |
| `controllers/task.controller.ts` | Call `list` and return HTTP `200`. |
| `routes/task.routes.ts` | `GET /tasks` → list controller. |

## List-task contract

- `GET /tasks`
- No request body and no query parameters
- Success: HTTP `200` and a JSON array
- Empty store or missing file: `[]`
- Order: creation order (array order in the JSON file)
- Persistence failure: existing `500 / INTERNAL_ERROR`
- No authentication

## Verification and delivery

- Test empty list returns `200` and `[]` without creating a file.
- Test listing created tasks in insertion order.
- Test a list persistence failure as `INTERNAL_ERROR` without leaking paths.
- Test list without credentials.
- Re-run create and health tests.
- Run type checking, build, and the complete test suite.

Document `GET /tasks` in the backend README. Leave editing, deleting, and status changes marked as out of scope.
