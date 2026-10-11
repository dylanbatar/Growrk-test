# agents.md - Todo list

## Project

A simple todo user interface written in Vue 3 with TypeScript and Vite. It talks to the existing Todo API in `backend/`. State is held in Pinia. Styles use Tailwind CSS.

## Endpoints and important commands

The UI uses these API operations:

- `GET /tasks` — list all tasks
- `POST /tasks` — create a task
- `PATCH /tasks/:id` — mark a task as completed

Commands will be documented after the frontend foundation spec is implemented. Until then, run backend commands from `backend/`.

## Project style

Use Vue 3, TypeScript, Vite, Pinia, and Tailwind CSS.

Organize the app by feature, not by technical type at the top level. Each feature owns its `api/`, Pinia store, and components:

```text
src/features/<feature>/
  api/
  stores/
  components/
```

HTTP requests live only under a feature `api/` folder. Components and stores call those functions. Components never create `fetch` or Axios calls.

Use a simple flow: components → Pinia store → `api/`. The store holds UI state loaded from the Todo API. The `api/` module is the only place that knows the backend URL and HTTP details.

## Rules

Additional project rules are defined in `/docs/constitution.md`. Follow that file; do not invent additional rules unless explicitly requested.

## Testing and task completion

- After every task, run the relevant tests and the existing test suite to verify the new functionality and check for regressions.
- If something outside the task fails, stop and notify the user with the failure details. Do not attempt to fix it without the user's direction.
- Report the checks performed and their results. If tests or test commands are unavailable, state that verification is incomplete.
