---
id: lesson-15
slug: route-handlers
title: "Route Handlers and APIs"
level: intermediate
order: 15
duration: 24
tags:
  - route-handlers
  - api
  - request
  - response
  - http-methods
summary: "Build API endpoints inside your app with route.ts files that export HTTP method handlers and return Response objects."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Create an API endpoint with a `route.ts` file.
- Export handlers for HTTP methods like `GET` and `POST`.
- Read query params and JSON request bodies.
- Return JSON with `Response.json()` / `NextResponse`.
- Decide when you need a Route Handler versus fetching directly in a Server Component.

# Why It Matters

Sometimes you need a real HTTP endpoint: a webhook target, a form submission URL, an API for a mobile app, or something a third party will call. **Route Handlers** let you build those endpoints inside the same `app/` directory, using web-standard `Request` and `Response` — no separate backend project. Knowing when to use them (and when a Server Component is enough) keeps your architecture simple.

# Concept Explanation

### `route.ts` defines an endpoint

Instead of a `page.tsx` (UI), a folder can contain a `route.ts` (an API endpoint). You export async functions named after HTTP methods:

```typescript
// app/api/hello/route.ts  →  GET /api/hello
export async function GET() {
  return Response.json({ message: 'Hello' });
}
```

Supported method exports: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`. A segment can have a `route.ts` **or** a `page.tsx`, but not both.

### Reading the request

Handlers receive a web-standard `Request`. Read query params from the URL and the body with `.json()`:

```typescript
// app/api/search/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  return Response.json({ query: q });
}
```

```typescript
// app/api/todos/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  // …save body…
  return Response.json({ created: true }, { status: 201 });
}
```

### `NextRequest` / `NextResponse`

For extra conveniences (cookies, `nextUrl`, redirects), import `NextRequest`/`NextResponse` from `next/server`:

```typescript
import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ ok: true });
}
```

### Route Handlers are dynamic by default

In Next.js 15, Route Handlers are **not cached by default** — each request runs the handler. You can opt a `GET` handler into caching with route segment config (`export const dynamic = 'force-static'` or `export const revalidate`) when its output is stable.

# Key Terminology

- **Route Handler** — a `route.ts` that responds to HTTP requests instead of rendering a page.
- **Method handler** — an exported async function named `GET`, `POST`, etc.
- **`Request` / `Response`** — the web-standard objects Route Handlers use.
- **`NextRequest` / `NextResponse`** — Next.js extensions (from `next/server`) with extra helpers.
- **`Response.json()`** — a convenient way to return a JSON response.

# Options and Trade-offs

| Need | Route Handler? | Better option |
| --- | --- | --- |
| Read data to render a page | No | `await fetch`/DB in a Server Component |
| A webhook or third-party callback | Yes | `route.ts` with `POST` |
| An endpoint for a mobile/external client | Yes | `route.ts` |
| A form submission from your own app | Sometimes | Often a **Server Action** (next lessons) |

# Worked Example

A tiny todos API: `GET` lists, `POST` creates.

```typescript
// app/api/todos/route.ts
const todos = [{ id: 1, text: 'Learn Route Handlers' }];

export async function GET() {
  return Response.json(todos);
}

export async function POST(request: Request) {
  const { text } = await request.json();
  const todo = { id: todos.length + 1, text };
  todos.push(todo);
  return Response.json(todo, { status: 201 });
}
```

Now `GET /api/todos` returns the list and `POST /api/todos` with `{ "text": "…" }` creates one and returns it with a `201`. Both live in one `route.ts`, exported by method.

# Real World Analogy

A Route Handler is like a **service window at a government office**. Each window (endpoint) handles specific requests, and there are different forms for different actions: the "GET" window hands you information, the "POST" window accepts a filled-in form and files it. You don't build a separate building for the window — it's part of the same office (your app) — and one window can't simultaneously be a service desk (route) and a waiting-room display (page).

# Examples

## Example 1 — Basic: A GET endpoint

```typescript
// app/api/time/route.ts
export async function GET() {
  return Response.json({ now: new Date().toISOString() });
}
```

**Why this matters:** A single exported `GET` function is a complete JSON endpoint at `/api/time`.

## Example 2 — Real-world: A webhook receiver

```typescript
// app/api/webhook/route.ts
export async function POST(request: Request) {
  const event = await request.json();
  // …verify signature, process the event…
  return new Response('ok', { status: 200 });
}
```

**Why this matters:** Third-party services (payments, GitHub, etc.) need a URL to POST to — a Route Handler is exactly that.

## Example 3 — Pitfall: `route.ts` and `page.tsx` in the same folder

```text
app/dashboard/
  page.tsx    ← a page
  route.ts    ← CONFLICT: a segment can't be both a page and an endpoint
```

**Why this matters:** A single segment is either UI (`page.tsx`) or an endpoint (`route.ts`), not both. Put the API under a different path (e.g. `app/api/dashboard/route.ts`).

# Common Mistakes

- **Building an internal API to feed your own pages.** Server Components can fetch directly. **Fix:** only add Route Handlers for external consumers, webhooks, or form endpoints.
- **Putting `route.ts` beside `page.tsx`.** They conflict. **Fix:** give the endpoint its own segment (often under `app/api/…`).
- **Forgetting to set a status code.** Created resources should return `201`, errors `4xx/5xx`. **Fix:** pass `{ status }` to the response.
- **Not awaiting `request.json()`.** The body is a promise. **Fix:** `const body = await request.json()`.

# Best Practices

- Reach for Route Handlers for **external** needs (webhooks, public APIs, form posts), not internal page data.
- Name a segment's handlers by method (`GET`, `POST`) and keep each focused.
- Use **`Response.json()`** / **`NextResponse.json()`** and set meaningful status codes.
- Validate and sanitize request bodies before using them.
- Keep endpoints under a clear prefix like `app/api/…` for discoverability.

# Summary

- A **`route.ts`** turns a segment into an HTTP endpoint; export functions named `GET`, `POST`, etc.
- Handlers use web-standard **`Request`/`Response`**; `NextRequest`/`NextResponse` add helpers.
- Read query via the URL and the body via **`await request.json()`**; return **`Response.json()`**.
- A segment can have **`route.ts` or `page.tsx`**, not both.
- Prefer Server Components for internal data; use Route Handlers for **external** consumers and webhooks.

# Flash Cards

Q: What file makes a segment an API endpoint, and how do you handle GET requests?
A: A route.ts file; export an async function named GET (also POST, PUT, PATCH, DELETE, etc.).

Q: Can a folder have both page.tsx and route.ts?
A: No — a segment is either a page (UI) or a Route Handler (endpoint), not both.

Q: How do you read a JSON request body in a Route Handler?
A: await request.json() — the body arrives as a promise.

Q: What's a convenient way to return JSON with a status code?
A: Response.json(data, { status: 201 }) (or NextResponse.json from next/server).

Q: When should you NOT use a Route Handler?
A: To fetch data for your own pages — Server Components can fetch directly; use handlers for webhooks, external APIs, or form endpoints.

Q: Are Route Handlers cached by default in Next.js 15?
A: No — they run per request by default; a GET handler can opt into caching via route segment config.

# Exercises

### Easy

Create `app/api/ping/route.ts` with a `GET` that returns `{ pong: true }`. Visit `/api/ping` and confirm the JSON.

### Medium

Add a `POST` to an endpoint that reads `{ name }` from the body and returns a greeting with status `201`. Test it with `fetch('/api/greet', { method: 'POST', body: JSON.stringify({ name: 'Ada' }) })`.

### Challenging

Build `app/api/notes/route.ts` supporting `GET` (list) and `POST` (create, validating that `text` is a non-empty string; return `400` if not). Explain why you'd use this Route Handler for an external client but fetch notes directly in a Server Component for your own page.

# Further Reading

- [Next.js — Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Next.js — route.js file convention](https://nextjs.org/docs/app/api-reference/file-conventions/route)
- [Next.js — NextRequest / NextResponse](https://nextjs.org/docs/app/api-reference/functions/next-request)
- [MDN — Request and Response](https://developer.mozilla.org/en-US/docs/Web/API/Request)
