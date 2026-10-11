# 001 — Foundation Tasks

Target: `backend/spec/001-archictecture/task.md`, beside the existing spec and plan.

Tasks are ordered by dependency. Each implementation task includes focused tests and running the available suite. Report incomplete checks and stop on unrelated failures.

- [ ] **T01 — Configure project tooling.** Set up TypeScript, Express, Zod, and development/build/start/type-check/test commands. Document runtime dependencies. **Supports:** FR-1–FR-5. **Depends on:** none.

- [ ] **T02 — Establish the layered structure.** Follow the approved folders. Create an application factory in `app.ts` without opening a port. Leave future task services, repositories, and models unimplemented. **Covers:** FR-1, FR-5. **Depends on:** T01.

- [ ] **T03 — Validate configuration.** Implement optional `PORT` with default `3000` and integer range `1–65535`. Test defaults, overrides, boundaries, and invalid values. Failure messages identify the setting without exposing its value. **Covers:** FR-2. **Depends on:** T01.

- [ ] **T04 — Define the error contract.** Establish the planned error envelope, codes, statuses, and readable messages. Exclude sensitive values, internal paths, and stack traces from every error category. **Covers:** FR-4. **Depends on:** T01.

- [ ] **T05 — Implement centralized error handling.** Convert known errors to the agreed contract and unexpected errors to generic `500 / INTERNAL_ERROR` responses. Delegate errors when headers have already been sent. **Covers:** FR-4. **Depends on:** T02, T04.

- [ ] **T06 — Handle malformed JSON.** Register JSON parsing before routes and normalize parsing failures to `400 / INVALID_JSON`. Test that parser details and submitted sensitive values are not exposed. **Covers:** FR-4. **Depends on:** T05.

- [ ] **T07 — Implement reusable request validation.** Run supplied Zod schemas before controllers and return `400 / VALIDATION_ERROR` for invalid input. Use test-only schemas and handlers; add no task endpoints. **Covers:** FR-4. **Depends on:** T05.

- [ ] **T08 — Add the health check.** Implement `GET /health` through a route and controller, returning exactly HTTP `200` and `{"status":"ok"}`. Require no credentials and perform no data operations. **Covers:** FR-3, FR-5. **Depends on:** T02.

- [ ] **T09 — Handle unknown routes.** Register the `404 / NOT_FOUND` handler after application routes and before centralized error handling. Test an unknown route and malformed JSON sent to an unknown route separately. **Covers:** FR-4. **Depends on:** T06, T08.

- [ ] **T10 — Implement server startup.** Validate configuration before listening on `127.0.0.1`. Terminate configuration or listening failures with a nonzero exit status and a safe explanation on standard error. Test successful startup, invalid configuration, and an occupied port separately. **Covers:** FR-1, FR-2. **Depends on:** T03, T09.

- [ ] **T11 — Verify request-failure isolation.** Use a test-only failing handler to verify a generic error response and successful subsequent requests after a recoverable failure. **Covers:** FR-4. **Depends on:** T09.

- [ ] **T12 — Verify storage independence.** Separately verify that startup and health checks neither create, read, nor validate task storage. **Covers:** FR-1, FR-3. **Depends on:** T10.

- [ ] **T13 — Verify unauthenticated access.** Test health and error responses without tokens, sessions, or accounts. Confirm that no login, account-management, or permission-enforcement functionality is introduced. **Covers:** FR-5. **Depends on:** T09.

- [ ] **T14 — Document local operation.** Document commands, configuration defaults, startup failures, health response, and error contract. Clearly mark the JSON task model and add/list operations as future work. **Supports:** FR-1–FR-5. **Depends on:** T10–T13.

- [ ] **T15 — Complete acceptance verification.** Run type checking, build, and the full suite. Map results to every acceptance criterion and report failures or unverified behavior. **Covers:** FR-1–FR-5. **Depends on:** T14.
