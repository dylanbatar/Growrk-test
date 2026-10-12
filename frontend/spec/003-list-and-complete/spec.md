# 003 — List and Complete Tasks Specification

## Context

The create sheet already sends `POST /tasks` and shows the task the API returns. The screen still starts empty, and the complete sheet only changes the task on screen. The Todo API already accepts `GET /tasks` and `PATCH /tasks/:id`.

This milestone loads the stored tasks when the screen opens and completes a pending task through the API.

Outside this milestone: editing a title, deleting a task, reverting a task to pending, fetching one task, filtering, pagination, authentication, authorization, application logging, and offline or cached copies of tasks.

Technology choices, file organization, and implementation details belong in the later plan.

## Objective

Allow a person to see the tasks already stored by the API, and to mark a pending task completed through the API. The API remains the authority for the list order, the id, the title, and the status.

## Functional Requirements

### FR-1 — Load tasks when the screen opens

Opening the task screen must load every stored task.

**Acceptance criteria**

- Opening the screen sends `GET /tasks`.
- The request uses the configured API base URL. Views and components do not choose the host.
- A success response is HTTP `200` with a JSON array of `{ "id", "title", "status" }`.
- The screen shows those tasks in the response order. It does not sort, filter, or rewrite `id`, `title`, or `status`.
- HTTP `200` with `[]` shows the existing empty text `No tasks yet.`
- While the list request is in flight, the screen does not show `No tasks yet.`
- Listing does not require credentials.
- Opening the screen does not send `POST /tasks` or `PATCH /tasks/:id`.
- A successful create still appends the `201` task. It does not send another `GET /tasks`.

### FR-2 — Show a list failure without inventing tasks

When the list request fails, the screen must not pretend the collection is empty and must not invent tasks.

**Acceptance criteria**

- HTTP `500` with `INTERNAL_ERROR` shows that error's message and does not show `No tasks yet.`
- A failed request that has no error envelope is shown as `INTERNAL_ERROR` with the fixed message `The request could not be completed.`
- The visible failure text is the error message only. It does not include the HTTP status, the request URL, a stack trace, or the raw response body.
- Views and components do not read the HTTP envelope or status code.
- A failed load leaves the on-screen list empty.

### FR-3 — Complete a pending task through the API

Confirming the existing complete sheet must mark that task completed on the API and show the task the API returns.

**Acceptance criteria**

- Confirming the sheet sends `PATCH /tasks/:id` with a JSON body `{ "status": "completed" }`. `:id` is the id of the selected task.
- The request uses the configured API base URL. Views and components do not choose the host.
- A success response is HTTP `200` with `{ "id", "title", "status" }`.
- That list item then uses the response `id`, `title`, and `status`. The status is `completed`.
- The UI does not mark the task completed before the response arrives.
- After success, the complete sheet closes.
- Completing a task does not require credentials.
- Completing a task does not send `GET /tasks` or `POST /tasks`.
- A completed task still cannot open the complete sheet.

### FR-4 — Show a complete failure without changing the task

When complete fails, the sheet stays open and the task stays pending.

**Acceptance criteria**

- HTTP `404` with `TASK_NOT_FOUND` leaves the sheet open, leaves the task `pending`, shows that error's message, and does not remove the task.
- HTTP `400` with `VALIDATION_ERROR` leaves the sheet open, leaves the task `pending`, and shows that error's message.
- HTTP `500` with `INTERNAL_ERROR` leaves the sheet open, leaves the task `pending`, and shows that error's message.
- A failed request that has no error envelope is shown as `INTERNAL_ERROR` with the fixed message `The request could not be completed.`
- The visible failure text is the error message only. It does not include the HTTP status, the request URL, a stack trace, or the raw response body.
- Views and components do not read the HTTP envelope or status code.
- A second complete cannot start while the first request is still in flight.
- Closing the sheet clears the visible failure.

### FR-5 — Keep create and the layout

Create, the Hello heading, the empty-list text, the create control, the create sheet, and the complete sheet stay as they are, except for the list load and the complete request defined above.

**Acceptance criteria**

- The create sheet still sends `POST /tasks` as specified in 002.
- The existing layout remains: the Hello heading, the empty-list text `No tasks yet.`, the create control, the create sheet, and the complete sheet.
- Login, account management, and permission enforcement are not provided in this milestone.
