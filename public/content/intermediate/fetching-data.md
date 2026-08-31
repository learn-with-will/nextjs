---
id: lesson-10
slug: fetching-data
title: "Fetching Data in Server Components"
level: intermediate
order: 10
duration: 24
tags:
  - data-fetching
  - fetch
  - async-components
  - server-components
  - promises
summary: "Fetch data directly inside async Server Components with await—no useEffect—and avoid waterfalls by loading independent data in parallel."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Fetch data inside an `async` Server Component with `await`.
- Explain why the App Router doesn't need `useEffect` or `getServerSideProps` for reads.
- Access a database or backend directly from a Server Component.
- Avoid request waterfalls by fetching independent data in **parallel**.
- Pass fetched data down to Client Components.

# Why It Matters

In a client-only app, fetching data means `useEffect`, loading states, and an extra round trip after the page loads — plus a public API for the browser to call. Server Components let you fetch **where the data lives**: right inside the component, on the server, before any HTML is sent. That means less client JavaScript, no exposed API keys, and content that's already in the HTML for users and search engines.

# Concept Explanation

### `async` components with `await`

A Server Component can be an `async` function, so you fetch data inline:

```tsx
// app/users/page.tsx
export default async function UsersPage() {
  const res = await fetch('https://api.example.com/users');
  const users = await res.json();
  return (
    <ul>
      {users.map((u: { id: number; name: string }) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

No `useEffect`, no loading flag, no separate API route — the data is fetched and rendered on the server.

### Fetch anything, including your database

Because the code runs on the server, you're not limited to `fetch`. You can call a database or ORM directly:

```tsx
import { db } from '@/lib/db';

export default async function PostsPage() {
  const posts = await db.post.findMany();
  return <p>{posts.length} posts</p>;
}
```

Secrets and connection strings stay on the server — never shipped to the browser.

### Request memoization

If several components in one render fetch the **same** URL with `fetch`, Next.js automatically **dedupes** them into a single request (request memoization). So you can fetch the same data in a layout and a page without worrying about duplicate network calls.

### Parallel vs sequential

Awaiting one fetch, then another, creates a **waterfall** — each waits for the previous. When requests don't depend on each other, start them together and await in parallel:

```tsx
// Parallel: both requests start immediately
const [user, posts] = await Promise.all([
  fetch(`/api/users/${id}`).then((r) => r.json()),
  fetch(`/api/users/${id}/posts`).then((r) => r.json()),
]);
```

Only make a fetch sequential when it genuinely needs the previous result.

# Key Terminology

- **Async Server Component** — a Server Component declared `async` so it can `await` data.
- **Request memoization** — automatic de-duplication of identical `fetch` calls within one render pass.
- **Waterfall** — sequential requests where each waits for the previous, slowing the page.
- **Parallel fetching** — starting independent requests together (e.g. with `Promise.all`).
- **ORM** — a library (like Prisma) for querying a database with typed code.

# Options and Trade-offs

| Situation | Approach | Why |
| --- | --- | --- |
| Reads for a page | `await fetch` in an async Server Component | Runs on the server; no client JS or API needed |
| Independent data | `Promise.all([...])` | Avoids waterfalls |
| Data that depends on earlier data | Sequential `await` | You genuinely need the first result |
| Interactive client widget needing live data | Fetch on the server, pass props down | Keeps secrets off the client |
| Same URL fetched in layout and page | Just fetch in both | Memoization dedupes it automatically |

# Worked Example

A profile page that loads a user and their posts in parallel.

```tsx
// app/profile/[id]/page.tsx
async function getUser(id: string) {
  return fetch(`https://api.example.com/users/${id}`).then((r) => r.json());
}
async function getPosts(id: string) {
  return fetch(`https://api.example.com/users/${id}/posts`).then((r) => r.json());
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Both requests start at once — no waterfall
  const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);

  return (
    <main>
      <h1>{user.name}</h1>
      <p>{posts.length} posts</p>
    </main>
  );
}
```

The two independent requests run together, so total wait is the slower of the two — not their sum.

# Real World Analogy

Sequential fetching is like **ordering one dish, waiting for it to arrive, then ordering the next**. Parallel fetching is placing your **whole order at once** so the kitchen prepares everything simultaneously. You only wait dish-by-dish when a course truly depends on the previous one (you can't ice a cake before it's baked). And request memoization is the waiter noticing two tables asked for the same special and firing it once.

# Examples

## Example 1 — Basic: One fetch

```tsx
export default async function StatsPage() {
  const stats = await fetch('https://api.example.com/stats').then((r) => r.json());
  return <p>Total: {stats.total}</p>;
}
```

**Why this matters:** Fetching and rendering happen on the server in a few lines — the content is in the HTML immediately.

## Example 2 — Real-world: Parallel requests

```tsx
export default async function DashboardPage() {
  const [sales, visitors] = await Promise.all([
    fetch('https://api.example.com/sales').then((r) => r.json()),
    fetch('https://api.example.com/visitors').then((r) => r.json()),
  ]);
  return <p>{sales.total} sales · {visitors.count} visitors</p>;
}
```

**Why this matters:** Independent data loads concurrently, so the page isn't slowed by a chain of round trips.

## Example 3 — Pitfall: An accidental waterfall

```tsx
// SLOW: the second fetch waits for the first even though it doesn't need it
const user = await fetch(`/api/users/${id}`).then((r) => r.json());
const posts = await fetch(`/api/users/${id}/posts`).then((r) => r.json());
```

**Why this matters:** These requests are independent, so awaiting them one after another doubles the wait. Use `Promise.all` to run them together.

# Common Mistakes

- **Fetching read data in a `useEffect`.** That adds a client round trip and exposes the API. **Fix:** fetch in an async Server Component.
- **Reaching for `getServerSideProps`.** It doesn't exist in the App Router. **Fix:** `await` inside the component.
- **Chaining independent awaits.** That's a waterfall. **Fix:** `Promise.all` for independent requests.
- **Duplicating a fetch to "avoid" a duplicate request.** Memoization already dedupes identical fetches. **Fix:** just fetch where you need it.

# Best Practices

- Do reads in **Server Components** with `await`; keep API keys and DB access server-side.
- Use **`Promise.all`** for independent requests; go sequential only on real dependencies.
- Push data fetching **up** to the component that needs it, then pass props down.
- Extract fetches into small, named async functions for readability and reuse.
- Rely on **request memoization** rather than manually threading data just to avoid duplicate calls.

# Summary

- Server Components can be **`async`** and fetch data inline with **`await`** — no `useEffect`, no `getServerSideProps`.
- You can query a **database/ORM directly**; secrets stay on the server.
- Identical `fetch` calls in one render are **memoized** (deduped) automatically.
- Fetch independent data in **parallel** (`Promise.all`) to avoid waterfalls.
- Fetch on the server, then pass **serializable data** down to Client Components.

# Flash Cards

Q: How do you fetch data for a page in the App Router?
A: Make the page an async Server Component and `await fetch(...)` (or query your database) directly inside it.

Q: Why don't you need useEffect or getServerSideProps to read data?
A: Server Components run on the server and can await data before rendering, so the data is in the HTML — no client round trip and no Pages Router data functions.

Q: What is request memoization?
A: Next.js automatically dedupes identical fetch() calls made during a single render pass into one request.

Q: What is a data-fetching waterfall and how do you avoid it?
A: Sequential awaits where each request waits for the previous unnecessarily; avoid it by starting independent requests together with Promise.all.

Q: Can a Server Component talk to a database directly?
A: Yes — it runs on the server, so it can query an ORM/database, and secrets never reach the browser.

Q: When should fetches be sequential rather than parallel?
A: Only when a later request genuinely depends on the result of an earlier one.

# Exercises

### Easy

Write a Server Component page that fetches a list from a public API (e.g. `https://dummyjson.com/products`) and renders the item count and names.

### Medium

Create a profile page that fetches a user and their to-dos from a public API in **parallel** with `Promise.all`, and render both. Confirm they load together.

### Challenging

Build a page that (1) fetches a user, then (2) uses the user's `companyId` to fetch the company — a genuine dependency — while also fetching the user's unrelated notifications in parallel. Structure the awaits so only the true dependency is sequential.

# Further Reading

- [Next.js — Data Fetching and Caching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching)
- [Next.js — Fetching data (getting started)](https://nextjs.org/docs/app/getting-started/fetching-data)
- [Next.js — Request Memoization](https://nextjs.org/docs/app/deep-dive/caching#request-memoization)
- [MDN — Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
