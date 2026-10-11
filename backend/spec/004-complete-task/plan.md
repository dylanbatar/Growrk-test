# 004 — Complete Task Plan

## Summary

Create `backend/spec/004-complete-task/plan.md` documenting how `PATCH /tasks/:id` marks a task completed. No application code is part of this documentation task.

## Layered architecture

`routes → validation middleware → controllers → services → repository interfaces`

| Module | Change |
|---|---|
| `models/task.ts` | `status` is `'pending' \| 'completed'`. |
| `schemas/complete-task.ts` | Body `{ status: 'completed' }`. |
| `middlewares/error-contract.ts` | Add `TASK_NOT_FOUND` / 404 / `Task not found.` |
| `repositories/interfaces/task-repository.ts` | Add `findById(id)` and `update(task)`. |
| `repositories/json/json-task-repository.ts` | Look up by id; replace the matching array item and write. |
| `services/task.service.ts` | Load the task, set `completed`, save. Throw `TASK_NOT_FOUND` when missing. Return as-is when already completed. |
| `controllers/task.controller.ts` | Call complete with `req.params.id` and return HTTP `200`. |
| `routes/task.routes.ts` | `PATCH /tasks/:id` with `validateRequest(completeTaskSchema)`. |

## Complete-task contract

- `PATCH /tasks/:id`
- Request body: `{ "status": "completed" }`
- Success: HTTP `200` and the completed task
- Unknown id: `404 / TASK_NOT_FOUND`
- Invalid body: `400 / VALIDATION_ERROR`
- Persistence failure: `500 / INTERNAL_ERROR`
- No authentication
- Completing twice returns the same completed task

The client cannot change `title` or set `status` to `pending` on this endpoint.

## Verification and delivery

- Test completing a pending task.
- Test completing twice as its own test.
- Test unknown id, invalid status, and missing status separately.
- Test a persistence failure as `INTERNAL_ERROR`.
- Test complete without credentials.
- Run type checking, build, and the complete test suite.

Document `PATCH /tasks/:id` in the backend README. Leave title edits, deletes, and get-by-id out of scope.
