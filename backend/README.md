# Todo API foundation

Requires Node.js 24 or newer and npm.

## Dependencies

- Express: HTTP routing and middleware.
- Zod: configuration and request validation.
- cors: lets the browser call the API from another local port.

TypeScript, tsx, and type declarations are development dependencies. Tests use Node's built-in test runner and assertions.

## Commands

Run commands from `backend/`.

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm start
```

The build produces `dist/`; production startup requires a completed build.

`npm test` builds the application first, then runs isolated unit and HTTP tests. Startup tests launch the compiled server in child processes. HTTP tests need permission to open temporary localhost ports.

## Configuration and startup

| Setting | Default | Accepted values |
|---|---|---|
| `PORT` | `3000` | Decimal integer from `1` through `65535` |

The service binds to `127.0.0.1`. Missing `PORT` uses the default; empty, whitespace-padded, nonnumeric, fractional, and out-of-range values prevent startup. Unrelated environment variables are ignored.

```sh
PORT=8080 npm start
```

Invalid configuration exits with status `1` and identifies `PORT` on standard error without echoing its value. A listening failure, such as an occupied port, also exits with status `1` and a safe explanation. Successful startup produces no application log messages.

## Health

```sh
curl http://127.0.0.1:3000/health
```

`GET /health` returns HTTP `200` and exactly:

```json
{"status":"ok"}
```

This confirms API responsiveness only. Startup and health checks do not create, read, validate, or modify task storage. No credentials, accounts, tokens, or sessions are required.

## Error responses

Every handled API error uses this envelope:

```json
{"error":{"code":"NOT_FOUND","message":"Route not found."}}
```

| Condition | HTTP status | Code | Message |
|---|---|---|---|
| Malformed JSON | 400 | `INVALID_JSON` | Request body must contain valid JSON. |
| Invalid request input | 400 | `VALIDATION_ERROR` | Request input is invalid. |
| Unknown route | 404 | `NOT_FOUND` | Route not found. |
| Unexpected request failure | 500 | `INTERNAL_ERROR` | An unexpected error occurred. |

Public messages are fixed; parser errors, validation details, stack traces, submitted values, and internal paths are not returned. JSON parsing precedes routing, so malformed JSON takes precedence over an unknown route. Body-validation middleware is available for future routes; no production input endpoint is registered in this milestone.

Synchronous throws and rejected promises handled by Express do not prevent later requests. When an error occurs after response headers have been sent, the middleware delegates connection handling to Express rather than sending a second response. Process-level crash recovery is outside scope.

## Architecture

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

Routes select validation middleware and controllers. Schemas stay outside controllers. Future services will contain business rules and depend on repository interfaces; JSON repositories will implement those interfaces. Reserved directories contain only placeholders, with no task implementations.

The health route calls its controller directly because it has no business or persistence logic. `app.ts` assembles the middleware and routes without listening; `server.ts` validates configuration and starts the HTTP server. An optional router supplied to the application factory allows isolated test handlers; production startup registers only the health route.

## Future task features and exclusions

Adding tasks and listing all tasks are future work. The planned JSON collection is an array of objects with `id`, `title`, and `status`; each new task starts as `pending`. No task-data file is currently created or accessed. The full example is in [the implementation plan](spec/001-archictecture/plan.md).

Editing, deleting, changing task status, and retrieving individual tasks are outside the project scope. This milestone also excludes a UI, authentication, permissions, application logging, graceful shutdown, and custom request-size policy. Express's existing parser defaults are unchanged.

## Verification references

Acceptance criteria and their evidence are recorded in [the verification report](docs/verification.md). The source documents are [the specification](spec/001-archictecture/spec.md), [the plan](spec/001-archictecture/plan.md), and [the task checklist](spec/001-archictecture/task.md).

Implementation references: [Express error handling](https://expressjs.com/en/guide/error-handling/), [Zod parsing](https://zod.dev/basics), and [Node test runner](https://nodejs.org/api/test.html).
