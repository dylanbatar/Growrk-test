# Todo

A small full-stack todo app. The API stores tasks as JSON, and the UI is a Vue screen on top of that API.

Each task has an `id`, a `title`, and a `status` of `pending` or `completed`. There are no accounts, tokens, or sessions.

## Technologies

| Area | Stack |
|---|---|
| Runtime | Node.js 24 or newer, npm |
| Backend | TypeScript, Express 5, Zod |
| Frontend | Vue 3, TypeScript, Vite, Pinia, Tailwind CSS |
| Tests | Node.js built-in test runner (API), Vitest (UI) |
| Persistence | A JSON file behind a repository interface (`backend/data/tasks.json`) |

`backend/` and `frontend/` are separate npm projects. Install and run each one on its own.

## Run locally

You need two terminals.

**API** — listens on `http://127.0.0.1:3000`:

```sh
cd backend
npm ci
npm run dev
```

**UI** — Vite serves it at `http://127.0.0.1:5173`:

```sh
cd frontend
npm ci
npm run dev
```

Start the API first. The UI calls `http://127.0.0.1:3000` by default.

| Setting | Where | Default |
|---|---|---|
| `PORT` | API | `3000` (integer from `1` to `65535`) |
| `VITE_API_BASE_URL` | UI | `http://127.0.0.1:3000` |

```sh
PORT=8080 npm run dev
VITE_API_BASE_URL=http://127.0.0.1:8080 npm run dev
```

`VITE_API_BASE_URL` is read from `frontend/src/shared/config/`. Views and components do not hardcode the host.

Other useful commands, from each package directory:

```sh
npm run typecheck
npm test
npm run build
```

The API production start is `npm start` after `npm run build`. The UI production preview is `npm run preview` after `npm run build`.

### API

| Method | Path | Body |
|---|---|---|
| `GET` | `/health` | — |
| `GET` | `/tasks` | — |
| `POST` | `/tasks` | `{ "title": "Learn Vue" }` |
| `PATCH` | `/tasks/:id` | `{ "status": "completed" }` |

Handled errors use `{ "error": { "code", "message" } }`.

## Considerations

### Project

The application was built entirely with spec-driven development (SDD). The flow is drawn in [`sdd-workflow.excalidraw`](sdd-workflow.excalidraw):
<img width="626" height="993" alt="image" src="https://github.com/user-attachments/assets/47bda5a9-47d6-4978-954b-545547c4a758" />


1. **Constitution** — standing rules in `backend/docs/constitution.md` and `frontend/docs/constitution.md`.
2. **Specification** (`spec.md`) — what the behavior is and why.
3. **Clarification** — open questions closed before design.
4. **Technical plan** (`plan.md`) — how it is built: architecture and data.
5. **Tasks** (`task.md`) — small, verifiable steps.
6. **Implementation** — one task at a time, with tests kept green.
7. **Validation** — acceptance criteria checked against the code. A change goes back to the source document; otherwise the cycle ends.

Backend specs live under `backend/spec/`. Frontend specs live under `frontend/spec/`. Each feature folder contains `spec.md`, `plan.md`, and `task.md`.

Styling was the only hand-written part. Building the rest of the project, backend and frontend together, took an estimated **4 hours 30 minutes**.

### Backend

Layered architecture. A request moves in one direction:

`routes → validation middleware → controllers → services → repositories`

- **Routes** choose the middleware and the controller.
- **Validation** runs in middleware with Zod schemas (`src/schemas/`, `src/middlewares/validate-request.ts`). Controllers receive already-parsed input. They do not validate bodies themselves.
- **Controllers** map HTTP to a service call and a response.
- **Services** hold business rules only: new ids, the initial `pending` status, completing a task, and a missing task. `TaskService` depends on the `TaskRepository` interface, not on the file format.
- **Repositories** own storage. `JsonTaskRepository` writes `data/tasks.json`. Swapping storage means a new repository, not a change to the service.

`src/app.ts` wires middleware and routes. `src/server.ts` reads `PORT` and listens on `127.0.0.1`.

### Frontend

- **Composition API.** Every component uses `<script setup>`. There is no Options API.
- **Pinia** is the client state. The tasks store lives in `src/features/tasks/stores/` and is the place that loads and updates task state. Components read the store; they do not keep a second copy of the server data.
- **Feature architecture.** Code is grouped by feature, not by technical type at the top of `src/`:

```text
src/features/tasks/
  api/          HTTP calls to the Todo API
  stores/       Pinia store
  views/        screens
  components/   pieces a screen composes
src/shared/     config and error mapping used across features
```

Views and components do not call `fetch`. HTTP stays in `src/features/tasks/api/`. Shared error mapping turns the API envelope into `{ code, message }` so screens never parse status codes. Tailwind utility classes are the styling layer.

## Improvements

- **Storage.** A database can replace the JSON file. The repository interface already keeps that choice out of the service, so an in-memory implementation fits the same boundary and is enough for tests or a short-lived process.
- **Setup.** Docker can start the API and the UI together, with one command and the same ports every time.
- **Users.** The app can grow to multiple users, each with their own tasks. Today every task lives in one shared collection.
- **Tests.** Backend HTTP tests can move to Supertest. The UI can add end-to-end coverage with Playwright or Cypress on top of the current Vitest unit tests.
- **List size.** `GET /tasks` returns every task, and a title only has to be a non-empty string. Pagination on the list, plus a maximum title length, keeps the collection usable as it grows.
