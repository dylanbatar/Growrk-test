# 001 — Todo UI Foundation Specification

## Context

The todo project needs a runnable frontend foundation before task-management screens are introduced. This milestone establishes a Vue app that starts with local defaults, uses feature folders, Pinia, and a dedicated API layer, and maps backend errors consistently.

Outside this milestone: listing, creating, or completing tasks in the UI, visual design and Tailwind styling work, authentication, authorization, application logging, and offline or cached copies of tasks.

Technology choices, architecture, file organization, and implementation details belong in the later plan.

## Objective

Provide a UI foundation that starts locally, talks to the Todo API only through an `api/` module, holds client state in Pinia, and does not implement task screens yet.

## Functional Requirements

### FR-1 — Start the UI

The application must start in local development when its configuration is valid.

**Acceptance criteria**

- Starting with valid configuration makes the UI available in a browser.
- Startup does not call task endpoints or load task data.

### FR-2 — Support API configuration defaults

The application must provide a documented default for the Todo API base URL and use a supplied value when one is present.

**Acceptance criteria**

- Missing optional configuration uses its documented default.
- A supplied value overrides the default.

### FR-3 — Render a running shell

The UI must show that it can mount without depending on task data.

**Acceptance criteria**

- A running app renders a simple shell that does not list, create, or complete tasks.
- The shell does not require credentials.
- The shell does not call `GET /tasks`, `POST /tasks`, or `PATCH /tasks/:id`.

### FR-4 — Map API errors consistently

The HTTP layer must turn backend error responses into a stable client error with a code and a readable message.

**Acceptance criteria**

- A backend `{ "error": { "code", "message" } }` body becomes a client error with that code and message.
- Views and components do not parse HTTP envelopes or status codes.

### FR-5 — Keep HTTP out of components

Requests must live in a feature `api/` folder. Views and components must not create HTTP requests.

**Acceptance criteria**

- Feature code is grouped under `src/features/<feature>/` with `api/`, `stores/`, `views/`, and `components/`.
- No view or component module contains `fetch` or another HTTP client call.
- Pinia is registered and is the place for future task state.
- Changing the API host does not require changes to views or components.

### FR-6 — Allow use without authentication

The foundation must be usable without user accounts or credentials.

**Acceptance criteria**

- The shell renders without authentication.
- The app does not require an account, token, or session.
- Login, account management, and permission enforcement are not provided in this milestone.
