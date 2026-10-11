# 001 — UI Foundation Tasks

Target: `frontend/spec/001-architecture/task.md`, beside the existing spec and plan.

Tasks are ordered by dependency. Each implementation task includes focused tests and running the available suite. Report incomplete checks and stop on unrelated failures. Do not spend this milestone on visual design.

- [x] **T01 — Configure project tooling.** Set up Vite, Vue 3, TypeScript, and Pinia, plus development/build/type-check/test commands. Document runtime dependencies. Do not implement task screens. **Supports:** FR-1–FR-6. **Depends on:** none.

- [x] **T02 — Establish the feature structure.** Create `src/app/`, `src/shared/`, and `src/features/tasks/{api,stores,views,components}/`. Mount `App.vue` from `main.ts` with Pinia registered. Leave task API functions, store actions, views, and components unimplemented. **Covers:** FR-1, FR-5. **Depends on:** T01.

- [x] **T03 — Provide the API base URL.** Implement optional API base URL with default `http://127.0.0.1:3000`. Test the default and an override separately. **Covers:** FR-2. **Depends on:** T01.

- [x] **T04 — Map API errors.** Implement the shared error mapper so a backend envelope becomes `{ code, message }`. Test each code separately. **Covers:** FR-4. **Depends on:** T01.

- [x] **T05 — Render the shell.** `App.vue` shows a simple running shell with no task list, form, or complete control, and no HTTP calls. Test that it mounts. **Covers:** FR-3, FR-6. **Depends on:** T02.

- [x] **T06 — Verify no view or component HTTP.** Confirm view and component files do not contain `fetch` or another HTTP client. Confirm task endpoints are not called at startup. **Covers:** FR-1, FR-5. **Depends on:** T02, T05.

- [x] **T07 — Verify unauthenticated access.** The shell renders without tokens, sessions, or accounts. Confirm no login UI is introduced. **Covers:** FR-6. **Depends on:** T05.

- [x] **T08 — Document local operation.** Document commands, API base URL default, error mapping, feature folders, and that task screens and styling are future work. **Supports:** FR-1–FR-6. **Depends on:** T03–T07.

- [x] **T09 — Complete acceptance verification.** Run type checking, build, and the full suite. Map results to every acceptance criterion and report failures or unverified behavior. **Covers:** FR-1–FR-6. **Depends on:** T08.
