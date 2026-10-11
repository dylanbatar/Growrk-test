# 001 — UI Foundation Tasks

Target: `frontend/spec/001-architecture/task.md`, beside the existing spec and plan.

Tasks are ordered by dependency. Each implementation task includes focused tests and running the available suite. Report incomplete checks and stop on unrelated failures. Do not spend this milestone on visual design.

- [ ] **T01 — Configure project tooling.** Set up Vite, Vue 3, TypeScript, and Pinia, plus development/build/type-check/test commands. Document runtime dependencies. Do not implement task screens. **Supports:** FR-1–FR-6. **Depends on:** none.

- [ ] **T02 — Establish the feature structure.** Create `src/app/`, `src/shared/`, and `src/features/tasks/{api,stores,views,components}/`. Mount `App.vue` from `main.ts` with Pinia registered. Leave task API functions, store actions, views, and components unimplemented. **Covers:** FR-1, FR-5. **Depends on:** T01.

- [ ] **T03 — Validate API configuration.** Implement optional API base URL with default `http://127.0.0.1:3000`. Test default, override, and invalid values separately. Failure messages identify the setting without exposing its value. **Covers:** FR-2. **Depends on:** T01.

- [ ] **T04 — Map API errors.** Implement the shared error mapper for the backend envelope and for unexpected failures (`INTERNAL_ERROR`, no internals leaked). Test each mapping separately. **Covers:** FR-4. **Depends on:** T01.

- [ ] **T05 — Render the shell.** `App.vue` shows a simple running shell with no task list, form, or complete control, and no HTTP calls. Test that it mounts. **Covers:** FR-3, FR-6. **Depends on:** T02.

- [ ] **T06 — Verify no view or component HTTP.** Confirm view and component files do not contain `fetch` or another HTTP client. Confirm task endpoints are not called at startup. **Covers:** FR-1, FR-5. **Depends on:** T02, T05.

- [ ] **T07 — Verify unauthenticated access.** The shell renders without tokens, sessions, or accounts. Confirm no login UI is introduced. **Covers:** FR-6. **Depends on:** T05.

- [ ] **T08 — Document local operation.** Document commands, API base URL default, error mapping, feature folders, and that task screens and styling are future work. **Supports:** FR-1–FR-6. **Depends on:** T03–T07.

- [ ] **T09 — Complete acceptance verification.** Run type checking, build, and the full suite. Map results to every acceptance criterion and report failures or unverified behavior. **Covers:** FR-1–FR-6. **Depends on:** T08.
