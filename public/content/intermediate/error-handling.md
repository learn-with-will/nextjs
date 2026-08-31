---
id: lesson-14
slug: error-handling
title: "Error Handling"
level: intermediate
order: 14
duration: 22
tags:
  - error-handling
  - error-tsx
  - not-found
  - error-boundary
  - reset
summary: "Catch runtime errors per route with error.tsx (a Client Component with reset), and show 404s with not-found.tsx and the notFound() function."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Catch runtime errors in a segment with `error.tsx`.
- Explain why `error.tsx` must be a Client Component and receives `reset`.
- Show "not found" UI with `not-found.tsx` and the `notFound()` function.
- Understand what `global-error.tsx` handles that `error.tsx` cannot.
- Contain errors so one broken widget doesn't take down the whole app.

# Why It Matters

Things fail: an API times out, a record is missing, a bug throws. Without handling, users hit a blank page or a cryptic crash. Next.js gives you file-based error boundaries so each part of your app can fail gracefully — showing a friendly message and a "try again" button — while the rest keeps working. Good error UI is the difference between a momentary hiccup and a lost user.

# Concept Explanation

### `error.tsx` — catching runtime errors

Add an `error.tsx` to a route folder and it becomes an **error boundary** for that segment and everything below it. If a component throws while rendering, Next.js shows `error.tsx` instead of crashing. It **must be a Client Component**, and it receives two props: the `error` and a `reset` function to retry:

```tsx
// app/dashboard/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <p>Something went wrong loading the dashboard.</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

`reset()` re-renders the segment — often enough to recover from a transient failure.

### `not-found.tsx` and `notFound()`

For "this doesn't exist" (a 404), use `not-found.tsx`. It renders when you call the `notFound()` function or for URLs that match nothing:

```tsx
// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound(); // renders the nearest not-found.tsx, returns a 404
  return <h1>{post.title}</h1>;
}
```

```tsx
// app/blog/[slug]/not-found.tsx
export default function NotFound() {
  return <p>That post doesn't exist.</p>;
}
```

### `global-error.tsx`

An `error.tsx` catches errors in its segment — but **not** errors in the **root layout** itself. For those, add `global-error.tsx` at the top of `app/`. Because it replaces the root layout, it must render its own `<html>` and `<body>`. It's a last resort for catastrophic failures.

# Key Terminology

- **`error.tsx`** — a Client Component error boundary for a segment; gets `error` and `reset`.
- **`reset()`** — a function passed to `error.tsx` that re-renders the segment to retry.
- **`not-found.tsx`** — UI shown for 404s and when `notFound()` is called.
- **`notFound()`** — a function (from `next/navigation`) that triggers the not-found UI and a 404.
- **`global-error.tsx`** — catches errors in the root layout; must render `<html>`/`<body>`.

# Options and Trade-offs

| Situation | Use | Notes |
| --- | --- | --- |
| A component threw at runtime | `error.tsx` | Client Component; offers `reset()` |
| A record/route doesn't exist | `not-found.tsx` + `notFound()` | Returns a real 404 |
| The root layout itself threw | `global-error.tsx` | Renders its own `<html>`/`<body>` |
| Expected, recoverable failure | `try/catch` in the fetch | Handle inline; show a message |

# Worked Example

A dashboard segment that recovers from load errors and 404s missing widgets.

```tsx
// app/dashboard/error.tsx
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section>
      <h2>Couldn't load the dashboard</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Retry</button>
    </section>
  );
}
```

```tsx
// app/dashboard/[widget]/page.tsx
import { notFound } from 'next/navigation';

export default async function Widget({ params }: { params: Promise<{ widget: string }> }) {
  const { widget } = await params;
  const data = await getWidget(widget);
  if (!data) notFound();          // 404 for an unknown widget
  if (data.broken) throw new Error('Widget data is corrupt'); // caught by error.tsx
  return <pre>{JSON.stringify(data)}</pre>;
}
```

A missing widget shows the not-found UI; a thrown error shows the retry UI — the rest of the app is unaffected.

# Real World Analogy

Error boundaries are like **circuit breakers in a house**. When one appliance shorts out, the breaker for that circuit trips — the kitchen goes dark but the rest of the house keeps its lights on, and you can flip the breaker back (that's `reset()`). Without breakers, one fault would black out the whole house. `global-error.tsx` is the main breaker at the panel: it only trips when something upstream of every room fails.

# Examples

## Example 1 — Basic: A segment error boundary

```tsx
// app/settings/error.tsx
'use client';
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <button onClick={() => reset()}>Something broke — retry</button>;
}
```

**Why this matters:** One file makes `/settings` fail gracefully with a retry, without touching the rest of the app.

## Example 2 — Real-world: A proper 404 for missing data

```tsx
import { notFound } from 'next/navigation';

export default async function User({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser(id);
  if (!user) notFound();
  return <h1>{user.name}</h1>;
}
```

**Why this matters:** `notFound()` returns a real 404 and shows `not-found.tsx`, which is correct for users and search engines.

## Example 3 — Pitfall: Forgetting `"use client"` on `error.tsx`

```tsx
// app/error.tsx — BROKEN: error boundaries must be Client Components
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <button onClick={() => reset()}>Retry</button>; // onClick needs the client
}
```

**Why this matters:** `error.tsx` uses interactivity (`reset`, `onClick`), so it must start with `"use client"`. Without it, the file is a Server Component and won't work as an error boundary.

# Common Mistakes

- **Omitting `"use client"` in `error.tsx`.** It won't function. **Fix:** add the directive at the top.
- **Expecting `error.tsx` to catch root-layout errors.** It can't. **Fix:** add `global-error.tsx` (with its own `<html>`/`<body>`).
- **Returning a 200 for missing data.** Bad for SEO and users. **Fix:** call `notFound()` to return a real 404.
- **Not offering a way to recover.** A dead-end error page frustrates users. **Fix:** call `reset()` from a retry button.

# Best Practices

- Add `error.tsx` to segments that fetch or compute, so failures stay contained.
- Always give the user a **retry** via `reset()`.
- Use `notFound()` for missing records; add a friendly `not-found.tsx`.
- Keep a top-level `app/not-found.tsx` for unmatched URLs.
- Use `global-error.tsx` only for catastrophic root failures; keep it minimal.

# Summary

- **`error.tsx`** is a per-segment error boundary — a **Client Component** that receives `error` and **`reset`**.
- **`reset()`** re-renders the segment to retry after a failure.
- **`not-found.tsx`** plus **`notFound()`** produce real 404s for missing content.
- **`global-error.tsx`** handles root-layout errors and must render its own `<html>`/`<body>`.
- Contained error boundaries keep one failure from crashing the whole app.

# Flash Cards

Q: Why must error.tsx be a Client Component?
A: It's interactive — it uses the reset() function and onClick — which require a Client Component, so it must start with "use client".

Q: What two props does error.tsx receive?
A: error (the thrown error, with an optional digest) and reset (a function that re-renders the segment to retry).

Q: How do you return a real 404 for a missing record?
A: Call notFound() from next/navigation; it renders the nearest not-found.tsx and returns a 404 status.

Q: What does error.tsx NOT catch, and what handles it instead?
A: Errors in the root layout itself; global-error.tsx handles those (and must render its own <html> and <body>).

Q: What does reset() do?
A: It re-renders the errored segment, giving the user a chance to recover from a transient failure.

Q: Where does an error boundary catch errors from?
A: Its own segment and everything nested below it — so a failure there doesn't crash unrelated parts of the app.

# Exercises

### Easy

Add an `error.tsx` (with `"use client"`) to a route and throw an error in its page. Confirm the error UI shows and the retry button appears.

### Medium

In a dynamic route, call `notFound()` when data is missing and add a `not-found.tsx`. Verify a valid id renders the page and an invalid one shows the 404 UI.

### Challenging

Create a page with two sections, each in its own segment with its own `error.tsx`. Make one section throw. Show that only that section's error boundary triggers while the other keeps working, and that `reset()` recovers it.

# Further Reading

- [Next.js — Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Next.js — error.js file convention](https://nextjs.org/docs/app/api-reference/file-conventions/error)
- [Next.js — not-found.js and notFound()](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)
- [React — Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
