# Constitution

1. **Simple stack:** Use Node.js, TypeScript, Express, and Zod. Document the need for every added runtime dependency.
2. **Spec before code:** Every behavior change must match an agreed specification; update the specification before changing that behavior.
3. **Clear boundaries:** Validate requests with Zod middleware before controllers; keep validation schemas outside controllers. Controllers handle HTTP, services enforce business rules, and repositories handle storage.

# example

These snippets illustrate validation structure, not a new API specification. Validate request input before the controller. This illustrative example validates only `req.body`; query parameters need their own schema when applicable.

# AVOID

Manual validation inside the endpoint:

```typescript
router.post('/tasks', async (req, res) => {
  const { title } = req.body

  if (typeof title !== 'string' || title.trim() === '') {
    res.status(400).json({ message: 'Title must not be empty' })
    return
  }

  const task = await taskService.create({ title: title.trim() })
  res.status(201).json(task)
})
```

# INSTEAD DO

Define the schema separately from the controller:

```typescript
import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title must not be empty')
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
```

Use reusable middleware to validate the body and pass the parsed data forward:

```typescript
import type { RequestHandler } from 'express'
import { z } from 'zod'

export function validateRequest(schema: z.ZodType): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      res.status(400).json({ errors: result.error.issues })
      return
    }

    req.body = result.data
    next()
  }
}
```

Keep the controller focused on calling the service and returning the response. Type its body using the schema's inferred type:

```typescript
export const createTask: RequestHandler<
  Record<string, string>,
  unknown,
  CreateTaskInput
> = async (req, res, next) => {
  try {
    const task = await taskService.create(req.body)
    res.status(201).json(task)
  } catch (error) {
    next(error)
  }
}
```

Register validation before the controller:

```typescript
router.post(
  '/tasks',
  validateRequest(createTaskSchema),
  createTask
)
```

The snippets assume JSON body parsing runs before the router and the illustrated symbols are imported into their respective modules. `taskService` represents the future service implementation. Middleware performs runtime validation; the explicit controller type supplies TypeScript typing. This follows [Zod parsing and inference](https://zod.dev/basics) and [Express middleware ordering](https://expressjs.com/en/guide/using-middleware/).

4. **Tests required:** Test each behavior separately; do not combine create, update, and delete checks in one test. Cover new behavior and run the existing suite after every task. Report results and any incomplete verification.

# example

These snippets illustrate test structure, not a new API specification. The example helpers are not implemented yet. Store parsed responses in named variables before assertions. Each `setup(t)` must provide isolated test data.

# AVOID

```typescript
test('creates, lists and completes a task; completing twice is idempotent', async (t) => {
  const request = await setup(t)

  const initialResponse = await request('/tasks')
  const initialTasks = await initialResponse.json()
  assert.deepEqual(initialTasks, [])

  const response = await request('/tasks', json('POST', {
    title: '  Aprender Vue  '
  }))
  const task = await response.json()

  assert.equal(response.status, 201)
  assert.match(task.id, /^[0-9a-f-]{36}$/)
  assert.equal(task.title, 'Aprender Vue')
  assert.equal(task.status, 'pending')

  const listResponse = await request('/tasks')
  const tasks = await listResponse.json()
  assert.deepEqual(tasks, [task])

  for (let attempt = 0; attempt < 2; attempt++) {
    const completed = await request(`/tasks/${task.id}`, json('PATCH', {
      status: 'completed'
    }))
    const completedTask = await completed.json()

    assert.equal(completed.status, 200)
    assert.deepEqual(completedTask, {
      ...task,
      status: 'completed'
    })
  }
})
```

# INSTEAD DO

Keep each test focused on one behavior. Creating a task as setup for another behavior is fine; assertions should verify the behavior named in the test.

```typescript
test('lists no tasks when the store is empty', async (t) => {
  const request = await setup(t)

  const response = await request('/tasks')
  const tasks = await response.json()

  assert.equal(response.status, 200)
  assert.deepEqual(tasks, [])
})

test('creates a task', async (t) => {
  const request = await setup(t)

  const response = await request('/tasks', json('POST', {
    title: '  Aprender Vue  '
  }))
  const task = await response.json()

  assert.equal(response.status, 201)
  assert.match(task.id, /^[0-9a-f-]{36}$/)
  assert.equal(task.title, 'Aprender Vue')
  assert.equal(task.status, 'pending')
})

// it's the same with another ones
```

5. **Unrelated failures:** Stop and report failures outside the task. Wait for the user's direction before fixing them.
6. **Replaceable persistence:** Access storage through repository interfaces. Use JSON initially; changing storage must not require changes to business rules.
