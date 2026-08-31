---
id: lesson-17
slug: server-actions
title: "Server Actions and Mutations"
level: advanced
order: 17
duration: 26
tags:
  - server-actions
  - use-server
  - mutations
  - forms
  - revalidate-path
summary: "Run server-side mutations directly from your components with Server Actions—async functions marked 'use server' that handle forms and refresh data."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Define a Server Action with the `"use server"` directive.
- Wire an action to a form with the `action` prop.
- Read submitted data from `FormData`.
- Refresh cached data after a mutation with `revalidatePath`/`revalidateTag`.
- Redirect after a successful action.

# Why It Matters

Historically, changing data from the browser meant building an API route, writing `fetch` calls, wiring up loading and error state, and keeping the two sides in sync. **Server Actions** collapse all of that: you write one async function that runs on the server and call it directly from a form or component. Less glue code, secrets stay server-side, and forms even work before JavaScript loads.

# Concept Explanation

### What a Server Action is

A **Server Action** is an `async` function that runs on the server, marked with the `"use server"` directive. You can mark a single function inline, or mark a whole module (so every export is an action):

```typescript
// app/actions.ts — every export here is a Server Action
'use server';

export async function createTodo(formData: FormData) {
  const text = formData.get('text') as string;
  // …save to the database…
}
```

### Calling an action from a form

Pass the action to a `<form>`'s `action` prop. On submit, Next.js sends the form data to the server and runs the action — no `onSubmit`, no manual `fetch`:

```tsx
// app/todos/page.tsx
import { createTodo } from '../actions';

export default function TodosPage() {
  return (
    <form action={createTodo}>
      <input name="text" />
      <button type="submit">Add</button>
    </form>
  );
}
```

Because it's a real form submission, it works even before the page's JavaScript has loaded — a property called **progressive enhancement**.

### Refreshing data after a change

After a mutation, the cached UI is stale. Call `revalidatePath` or `revalidateTag` inside the action to refresh it, or `redirect()` to send the user elsewhere:

```typescript
'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createTodo(formData: FormData) {
  await db.todo.create({ data: { text: formData.get('text') as string } });
  revalidatePath('/todos'); // refresh the list
  // or: redirect('/todos');
}
```

### They run only on the server

Actions execute on the server, so they can use secrets and the database safely. Their arguments and return values must be **serializable**. Under the hood, Next.js exposes each action as a POST endpoint and handles the wiring.

# Key Terminology

- **Server Action** — an `async`, server-only function marked `"use server"`.
- **`"use server"`** — a directive marking a function (or whole module) as a Server Action.
- **`FormData`** — the web-standard object holding submitted form fields.
- **Progressive enhancement** — forms working before/without client JavaScript.
- **`revalidatePath` / `revalidateTag`** — refresh cached data after a mutation.

# Options and Trade-offs

| Task | Approach | Note |
| --- | --- | --- |
| Submit a form and mutate | Server Action via `<form action>` | Progressive enhancement; least glue |
| Mutate from a button/handler | Import the action, call it in a Client Component | Wrap with transitions for pending UI |
| External client mutating data | Route Handler (`POST`) | Actions target your own UI |
| Refresh UI after the mutation | `revalidatePath`/`revalidateTag` | Or `redirect()` |

# Worked Example

A todo form whose action creates an item and refreshes the list.

```typescript
// app/todos/actions.ts
'use server';
import { revalidatePath } from 'next/cache';

const todos: { id: number; text: string }[] = [];

export async function addTodo(formData: FormData) {
  const text = (formData.get('text') as string)?.trim();
  if (!text) return;
  todos.push({ id: todos.length + 1, text });
  revalidatePath('/todos'); // the list re-renders with the new item
}

export async function listTodos() {
  return todos;
}
```

```tsx
// app/todos/page.tsx
import { addTodo, listTodos } from './actions';

export default async function TodosPage() {
  const todos = await listTodos();
  return (
    <main>
      <form action={addTodo}>
        <input name="text" placeholder="New todo" />
        <button type="submit">Add</button>
      </form>
      <ul>{todos.map((t) => <li key={t.id}>{t.text}</li>)}</ul>
    </main>
  );
}
```

Submitting runs `addTodo` on the server, saves the item, and `revalidatePath('/todos')` refreshes the list — all without a hand-written API call.

# Real World Analogy

A Server Action is like a **pneumatic tube at a bank drive-through**. You put your deposit slip in the tube (submit the form) and it's whisked to the teller inside (the server), who does the actual work with access to the vault (the database) — you never step inside. The teller sends back a receipt (the result), and updates your balance on the screen (`revalidatePath`). You interact with a simple slot; all the secure machinery stays behind the glass.

# Examples

## Example 1 — Basic: An inline action

```tsx
// app/feedback/page.tsx
export default function Feedback() {
  async function submit(formData: FormData) {
    'use server';
    console.log('Feedback:', formData.get('message'));
  }
  return (
    <form action={submit}>
      <textarea name="message" />
      <button type="submit">Send</button>
    </form>
  );
}
```

**Why this matters:** The `"use server"` directive inside the function makes it a Server Action, callable straight from the form.

## Example 2 — Real-world: A separate actions module with revalidation

```typescript
// app/posts/actions.ts
'use server';
import { revalidateTag } from 'next/cache';

export async function publishPost(formData: FormData) {
  await savePost(formData.get('title') as string);
  revalidateTag('posts'); // refresh any fetch tagged 'posts'
}
```

**Why this matters:** Keeping actions in a `"use server"` module organizes mutations and pairs each with the exact cache to refresh.

## Example 3 — Pitfall: Forgetting `"use server"`

```tsx
// BROKEN: without "use server", this runs as normal code, not a Server Action
export default function Page() {
  async function save(formData: FormData) {
    await db.save(formData.get('x')); // no directive → not a server action
  }
  return <form action={save}>…</form>;
}
```

**Why this matters:** Without `"use server"` (in the function or its module), it isn't a Server Action. Add the directive so Next.js runs it on the server.

# Common Mistakes

- **Omitting `"use server"`.** It won't be a Server Action. **Fix:** add the directive to the function or module.
- **Not revalidating after a mutation.** The UI shows stale data. **Fix:** call `revalidatePath`/`revalidateTag` (or `redirect`).
- **Returning non-serializable values.** Actions must return serializable data. **Fix:** return plain objects/strings.
- **Trusting form input.** Actions are public endpoints. **Fix:** validate and authorize inside the action.

# Best Practices

- Keep actions in a **`"use server"` module** and give each a single responsibility.
- Always **validate and authorize** inside the action — it's a server endpoint.
- Pair each mutation with the right **revalidation** so the UI updates.
- Prefer `<form action>` for progressive enhancement; use transitions for pending UI in Client Components.
- Return simple, serializable results (e.g. `{ ok: true }` or an error message).

# Summary

- A **Server Action** is an `async`, server-only function marked **`"use server"`**.
- Wire it to a form with **`<form action={fn}>`**; it receives **`FormData`** and works with progressive enhancement.
- Actions run on the server, so they can use secrets and the database; args/returns must be **serializable**.
- After mutating, call **`revalidatePath`/`revalidateTag`** (or **`redirect`**) to refresh the UI.
- Always **validate and authorize** input — actions are public endpoints.

# Flash Cards

Q: What directive marks a function as a Server Action?
A: "use server" — placed in the function body, or at the top of a module to mark all its exports as actions.

Q: How do you run a Server Action when a form is submitted?
A: Pass it to the form's action prop: <form action={myAction}>; it receives the submitted FormData.

Q: After a Server Action mutates data, how do you refresh the stale UI?
A: Call revalidatePath('/path') or revalidateTag('tag') inside the action (or redirect() to another page).

Q: Why can Server Actions safely use secrets and the database?
A: They run only on the server; their code and secrets are never sent to the browser.

Q: What is progressive enhancement in the context of Server Actions?
A: Because <form action> is a real form submission, it works even before the page's JavaScript has loaded.

Q: What must a Server Action's arguments and return value be?
A: Serializable — plain data like strings, numbers, and plain objects (not functions or class instances).

# Exercises

### Easy

Create a form whose Server Action logs a submitted field on the server. Confirm the log appears in the terminal (server), not the browser console.

### Medium

Build an in-memory list with an `addItem` Server Action that pushes a new item and calls `revalidatePath` so the rendered list updates after each submit.

### Challenging

Write a Server Action that validates input (rejecting empty or too-long values), saves on success, calls `revalidateTag`, and `redirect`s to a detail page. Explain why validation and authorization must happen inside the action rather than only in the form.

# Further Reading

- [Next.js — Server Actions and Mutations](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js — Updating data (getting started)](https://nextjs.org/docs/app/getting-started/updating-data)
- [React — "use server" directive](https://react.dev/reference/rsc/use-server)
- [MDN — FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
