# Todo UI foundation

Requires Node.js 24 or newer and npm.

The UI is a Vue application. Opening the task screen calls `GET /tasks`. Creating a task calls `POST /tasks`. The complete sheet calls `PATCH /tasks/:id`. The app does not ask for credentials.

## Dependencies

- Vue: application shell.
- Pinia: client state for later task screens. Pinia also installs `@vue/devtools-api` for its devtools hook. No task store is registered in this milestone.

TypeScript, Vue's type checker, Vite, the Vue plugin, and `@vue/tsconfig` are development dependencies. Tests use Vitest, jsdom, and Vue Test Utils.

Tailwind CSS and `@tailwindcss/vite` are installed so later screens can use utility classes. No extra Tailwind plugin is configured. This milestone does not design screens; the shell template has no utility classes.

## Commands

Run commands from `frontend/`.

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm run preview
```

`npm run dev` serves the UI with Vite. `npm run build` type-checks, then writes `dist/`. `npm run preview` serves that build. `npm test` runs the unit suite once.

## Configuration

| Setting | Default |
|---|---|
| `VITE_API_BASE_URL` | `http://127.0.0.1:3000` |

Missing `VITE_API_BASE_URL` uses the default. A supplied value replaces it.

```sh
VITE_API_BASE_URL=https://todo.example.com:8443 npm run dev
```

The shell does not read this setting. Later task requests will use it from `src/shared/config/`, so changing the host does not require view or component edits. This milestone does not call the API, so no dev-server proxy is configured.

## Error mapping

`src/shared/api/errors.ts` turns a backend body into `{ code, message }`. Views and components do not parse envelopes or status codes.

| Backend envelope code | Client code |
|---|---|
| `INVALID_JSON` | `INVALID_JSON` |
| `VALIDATION_ERROR` | `VALIDATION_ERROR` |
| `TASK_NOT_FOUND` | `TASK_NOT_FOUND` |
| `NOT_FOUND` | `NOT_FOUND` |
| `INTERNAL_ERROR` | `INTERNAL_ERROR` |

When the body is `{ "error": { "code", "message" } }`, the client keeps that code and message.

## Architecture

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

`main.ts` reads configuration, registers Pinia, and mounts `App.vue`. The shell renders without task data. Feature folders are reserved for later screens. HTTP for tasks will live only in `src/features/tasks/api/`. There is no top-level `src/api/`, `src/stores/`, `src/views/`, or `src/components/` directory.

Later task flow:

`views → components → Pinia store → features/tasks/api/ → Todo API`

## List and complete

Opening the screen sends `GET /tasks` and shows the returned array in that order. HTTP `200` with `[]` shows `No tasks yet.` A failed load shows the error message and does not show that empty text.

The complete sheet sends `PATCH /tasks/:id` with `{ "status": "completed" }`. HTTP `200` replaces that task with the returned task and closes the sheet. `TASK_NOT_FOUND`, `VALIDATION_ERROR`, and `INTERNAL_ERROR` leave the sheet open and leave the task pending. The visible text is the error message only.

Creating a task still sends `POST /tasks` with `{ "title" }` and appends the `201` task. It does not send another `GET /tasks`.

Editing titles, deleting tasks, reverting a task to pending, and fetching a single task are outside the project scope. The app does not provide accounts, tokens, sessions, or permission checks.

## Source documents

Foundation behavior is defined in [the specification](spec/001-architecture/spec.md). Listing and completing are defined in [spec/003-list-and-complete/spec.md](spec/003-list-and-complete/spec.md). Project rules are in [the constitution](docs/constitution.md).
