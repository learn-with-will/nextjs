---
id: lesson-18
slug: forms-and-optimistic-ui
title: "Forms, useActionState, and Optimistic UI"
level: advanced
order: 18
duration: 26
tags:
  - use-action-state
  - use-form-status
  - use-optimistic
  - forms
  - pending-ui
summary: "Add rich form UX to Server Actions with React 19 hooks: useActionState for results and errors, useFormStatus for pending state, and useOptimistic for instant feedback."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Track a Server Action's result and errors with `useActionState`.
- Show a pending state during submission with `useFormStatus`.
- Give instant feedback with `useOptimistic`.
- Know which module each hook comes from.
- Return and display validation errors from an action.

# Why It Matters

A raw Server Action submits and refreshes, but users expect more: a disabled button while saving, inline validation errors, and lists that update the instant they click — not after a round trip. React 19 ships three hooks that layer this UX onto Server Actions cleanly, keeping progressive enhancement intact. Together they turn a bare form into a polished, responsive experience.

# Concept Explanation

### `useActionState` — result, errors, and pending

`useActionState` wraps an action so you can render its return value (a result or error) and know when it's pending. It comes from **`react`**:

```tsx
'use client';
import { useActionState } from 'react';
import { submitContact } from './actions';

const initialState = { error: '' };

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContact, initialState);
  return (
    <form action={formAction}>
      <input name="email" />
      {state.error && <p role="alert">{state.error}</p>}
      <button disabled={isPending}>{isPending ? 'Sending…' : 'Send'}</button>
    </form>
  );
}
```

The action's signature gains a first argument — the previous state:

```typescript
'use server';
export async function submitContact(prevState: { error: string }, formData: FormData) {
  const email = formData.get('email') as string;
  if (!email.includes('@')) return { error: 'Enter a valid email.' };
  // …save…
  return { error: '' };
}
```

> Note: `useActionState` is the current name. It was previously `useFormState` (and imported from `react-dom`). Update older code to the new name and module.

### `useFormStatus` — pending state of the parent form

`useFormStatus` (from **`react-dom`**) reports the enclosing form's pending state. It must be used in a component **rendered inside** the `<form>`, not the one that renders the form:

```tsx
'use client';
import { useFormStatus } from 'react-dom';

export function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>;
}
```

### `useOptimistic` — instant feedback

`useOptimistic` (from **`react`**) shows a provisional UI immediately, before the server confirms — then reconciles with the real result:

```tsx
'use client';
import { useOptimistic } from 'react';

const [optimisticTodos, addOptimistic] = useOptimistic(
  todos,
  (current, newTodo: string) => [...current, { id: 'temp', text: newTodo }],
);
```

Call `addOptimistic(text)` as you submit; the item appears at once and is replaced when the action's revalidation lands.

# Key Terminology

- **`useActionState`** — (from `react`) tracks a Server Action's return value and pending state.
- **`useFormStatus`** — (from `react-dom`) reports the parent form's `pending` state.
- **`useOptimistic`** — (from `react`) shows a provisional state before the server responds.
- **Pending state** — the in-flight period while an action runs.
- **Optimistic update** — updating the UI immediately, assuming success.

# Options and Trade-offs

| You want | Hook | From |
| --- | --- | --- |
| Action result / validation errors + pending | `useActionState` | `react` |
| A submit button that disables while pending | `useFormStatus` | `react-dom` |
| Instant UI before the server confirms | `useOptimistic` | `react` |
| Just submit, no extra UX | none (plain `<form action>`) | — |

# Worked Example

A form that shows validation errors and disables while saving.

```typescript
// app/contact/actions.ts
'use server';
export async function submit(prev: { error: string }, formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  if (!name) return { error: 'Name is required.' };
  // …save…
  return { error: '' };
}
```

```tsx
// app/contact/ContactForm.tsx
'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submit } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>;
}

export default function ContactForm() {
  const [state, formAction] = useActionState(submit, { error: '' });
  return (
    <form action={formAction}>
      <input name="name" />
      {state.error && <p role="alert">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
```

`useActionState` surfaces the validation error; `useFormStatus` (in the child `SubmitButton`) disables the button while the action runs.

# Real World Analogy

These hooks are the **feedback lights on a self-checkout machine**. `useFormStatus` is the "processing…" light that blinks while your payment goes through (pending). `useActionState` is the receipt or the "item not recognized" message it prints back (result/errors). `useOptimistic` is the screen adding your scanned item to the list the instant it beeps — before the system has fully confirmed it — so checkout feels snappy.

# Examples

## Example 1 — Basic: Pending button with `useFormStatus`

```tsx
'use client';
import { useFormStatus } from 'react-dom';
export function Submit() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? '…' : 'Go'}</button>;
}
```

**Why this matters:** Placed inside a `<form>`, it disables itself during submission with almost no code.

## Example 2 — Real-world: Optimistic list

```tsx
'use client';
import { useOptimistic } from 'react';

export function Likes({ count, like }: { count: number; like: () => Promise<void> }) {
  const [optimistic, addOptimistic] = useOptimistic(count, (c) => c + 1);
  return (
    <form action={async () => { addOptimistic(null); await like(); }}>
      <button>♥ {optimistic}</button>
    </form>
  );
}
```

**Why this matters:** The like count bumps immediately, so the UI feels instant even though the server confirms a moment later.

## Example 3 — Pitfall: `useFormStatus` in the wrong place

```tsx
'use client';
import { useFormStatus } from 'react-dom';

export default function Form() {
  const { pending } = useFormStatus(); // WRONG: same component that renders the form
  return <form action={save}><button disabled={pending}>Save</button></form>;
}
```

**Why this matters:** `useFormStatus` reads the status of a form **above** it in the tree. It must live in a child rendered *inside* the `<form>` (like a separate `SubmitButton`), not in the component that renders the form.

# Common Mistakes

- **Using the old `useFormState` name/module.** It's now `useActionState` from `react`. **Fix:** update the import and name.
- **Calling `useFormStatus` in the form's own component.** It won't report pending. **Fix:** put it in a child inside the `<form>`.
- **Optimistic UI with no reconciliation.** State drifts if the action fails. **Fix:** rely on the action's revalidation to replace optimistic state.
- **Returning non-serializable action state.** Breaks `useActionState`. **Fix:** return plain serializable objects.

# Best Practices

- Return structured results from actions (e.g. `{ error }` or `{ ok, message }`) for `useActionState`.
- Extract a `SubmitButton` child so `useFormStatus` works and is reusable.
- Use `useOptimistic` for high-frequency, low-risk actions (likes, toggles).
- Keep these hooks in **Client Components**; keep the action itself server-side.
- Always validate on the server too — client UX is not a security boundary.

# Summary

- **`useActionState`** (from `react`) exposes a Server Action's return value and pending state; the action gains a `prevState` first argument.
- **`useFormStatus`** (from `react-dom`) reports the parent form's `pending` — use it in a child inside the `<form>`.
- **`useOptimistic`** (from `react`) shows provisional UI instantly, reconciled by the action's revalidation.
- `useActionState` **replaced** `useFormState` (formerly from `react-dom`).
- These hooks live in Client Components and enhance Server Actions without losing progressive enhancement.

# Flash Cards

Q: Which hook exposes a Server Action's return value and pending state, and where is it imported from?
A: useActionState, from 'react'. It also gives the action a prevState first argument.

Q: What did useActionState used to be called, and from which module?
A: useFormState, previously imported from 'react-dom'; it was renamed to useActionState (now from 'react').

Q: Where must useFormStatus be used to report a form's pending state?
A: In a component rendered inside the <form> (e.g. a separate SubmitButton), not in the component that renders the form. It comes from 'react-dom'.

Q: What does useOptimistic do?
A: Shows a provisional (optimistic) UI immediately, before the server confirms, then reconciles with the real result.

Q: How do you show a validation error from a Server Action in the form?
A: Return it as state (e.g. { error: '...' }) and read it via useActionState's state to render an inline message.

Q: Do these hooks remove the need for server-side validation?
A: No — client UX is not a security boundary; always validate and authorize inside the action too.

# Exercises

### Easy

Create a `SubmitButton` child using `useFormStatus` that disables and shows "Saving…" while its parent form submits.

### Medium

Use `useActionState` with an action that returns `{ error }` when a required field is empty, and render the error inline. Confirm the button shows a pending label during submission.

### Challenging

Build a "like" button with `useOptimistic` that increments instantly on click and calls a Server Action that persists the like and revalidates. Handle the case where the action fails so the optimistic value is corrected.

# Further Reading

- [Next.js — Forms and Mutations (Server Actions)](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React — useActionState](https://react.dev/reference/react/useActionState)
- [React — useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus)
- [React — useOptimistic](https://react.dev/reference/react/useOptimistic)
