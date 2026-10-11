# 002 — Create Task Specification

## Context

The UI foundation can start, map backend errors, and render the task layout. The layout can open a create sheet, but it stores the new task only in memory and assigns the id itself. The Todo API already accepts `POST /tasks`.

This milestone makes that sheet create a task through the API.

Outside this milestone: loading existing tasks with `GET /tasks`, completing a task with `PATCH /tasks/:id`, editing, deleting, fetching one task, authentication, authorization, application logging, and offline or cached copies of tasks.

Technology choices, file organization, and implementation details belong in the later plan.

## Objective

Allow a person to submit a title from the existing create sheet and see the task returned by `POST /tasks`. The API assigns the id, trims the title, and chooses the status. The UI does not invent those values.

## Functional Requirements

### FR-1 — Create a task through the API

Submitting a title from the create sheet must create a task on the Todo API and show the task the API returns.

**Acceptance criteria**

- A non-empty title sends `POST /tasks` with a JSON body `{ "title": "<trimmed title>" }`.
- The request uses the configured API base URL. Views and components do not choose the host.
- A success response is HTTP `201` with `{ "id", "title", "status" }`.
- The new list item uses that `id`, shows that `title`, and has `status` `pending`.
- The UI does not generate the id and does not prefix it with `local-`.
- The displayed title is the title in the response.
- After success, the create sheet closes, its field is empty, and the new task appears at the end of the on-screen list.
- The field is emptied because the sheet closes, not before the response arrives.
- Creating a task does not require credentials.
- Opening the app does not send `POST /tasks`.

### FR-2 — Keep an empty title on the client

The create sheet must not send a request when the title has no visible characters. The API remains the authority for a title that is sent.

**Acceptance criteria**

- The Create control is unavailable when the field is empty or whitespace only.
- Empty and whitespace-only titles do not send `POST /tasks`.
- A title that is sent is the field value with leading and trailing whitespace removed.
- Disabling the empty submit does not replace API validation.

### FR-3 — Show create failures without adding a task

When create fails, the sheet stays open and the list does not gain an item.

**Acceptance criteria**

- HTTP `400` with `VALIDATION_ERROR` leaves the sheet open, keeps the submitted title, shows that error's message, and does not add a task.
- HTTP `500` with `INTERNAL_ERROR` leaves the sheet open, keeps the submitted title, shows that error's message, and does not add a task.
- A failed request that has no error envelope is shown as `INTERNAL_ERROR` with the fixed message `The request could not be completed.`
- The visible failure text is the error message only. It does not include the HTTP status, the request URL, a stack trace, or the raw response body.
- Views and components do not read the HTTP envelope or status code.
- A second create cannot start while the first request is still in flight.
- Closing the sheet, or changing the title, clears the visible failure.

### FR-4 — Leave listing and completion unchanged

This milestone must not load or complete tasks through the API. The existing complete sheet still updates only the on-screen task.

**Acceptance criteria**

- Create does not call `GET /tasks` or `PATCH /tasks/:id`.
- The screen starts with no tasks until a create in this visit succeeds. Tasks already stored by the API are not loaded.
- Choosing a pending task still opens the existing complete sheet.
- Confirming that sheet marks that task `completed` on screen and does not send a request.
- The existing layout remains: the Hello heading, the empty-list text `No tasks yet.`, the create control, the create sheet, and the complete sheet.

### FR-5 — Allow use without authentication

Creating a task must not ask for an account.

**Acceptance criteria**

- The create request sends no token, session, or account header.
- Login, account management, and permission enforcement are not provided in this milestone.
