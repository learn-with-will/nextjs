---
id: lesson-19
slug: middleware
title: "Middleware"
level: advanced
order: 19
duration: 22
tags:
  - middleware
  - matcher
  - redirects
  - rewrites
  - edge
summary: "Run code before a request is completed with middleware.ts—redirect, rewrite, or add headers—and scope it to specific paths with a matcher."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Create middleware with a root `middleware.ts` file.
- Scope it to specific paths using `config.matcher`.
- Redirect, rewrite, and set headers/cookies with `NextResponse`.
- Explain where middleware runs and why it must be fast.
- Understand its role — and its limits — for authentication.

# Why It Matters

Some logic needs to run **before** a page renders — checking a session cookie, redirecting logged-out users, rewriting a URL for an A/B test, or adding a security header. Middleware is a single entry point that intercepts requests early, letting you apply cross-cutting rules across many routes without repeating code in each one.

# Concept Explanation

### The `middleware.ts` file

Create one `middleware.ts` at the **root** of your project (next to `app/`, or inside `src/`). Export a `middleware` function that receives a `NextRequest` and returns a `NextResponse`:

```typescript
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.has('session');
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next(); // continue as normal
}
```

### Scoping with `config.matcher`

By default middleware runs on every request. Limit it to specific paths with a `matcher`:

```typescript
export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*'],
};
```

Now the middleware runs only for `/dashboard/*` and `/account/*`.

### What you can do with `NextResponse`

- `NextResponse.next()` — let the request proceed.
- `NextResponse.redirect(url)` — send the user elsewhere.
- `NextResponse.rewrite(url)` — serve a different path without changing the URL.
- Set headers or cookies on the response for downstream code.

### Where it runs, and keeping it light

Middleware runs **before the request is completed** — before rendering and caching — on the **Edge runtime** by default. Because it executes on every matched request, keep it fast: no heavy computation or slow database calls.

> Auth caution: use middleware for lightweight checks (e.g. "no session cookie → redirect to login"), but don't treat it as your only authorization. Verify permissions again close to your data (in Server Components or the data layer), where you actually read sensitive records.

# Key Terminology

- **Middleware** — code that runs before a request is completed, from a root `middleware.ts`.
- **`config.matcher`** — the paths a middleware applies to.
- **`NextRequest` / `NextResponse`** — the request/response objects (from `next/server`).
- **Rewrite** — serving a different path while keeping the visible URL.
- **Edge runtime** — the lightweight runtime middleware runs on by default.

# Options and Trade-offs

| Goal | `NextResponse` call | Effect |
| --- | --- | --- |
| Continue the request | `NextResponse.next()` | Proceed as normal |
| Send elsewhere | `NextResponse.redirect(url)` | Browser navigates to a new URL |
| Serve a different path | `NextResponse.rewrite(url)` | URL stays; content differs |
| Add a header/cookie | set on the response | Applies to the response |

# Worked Example

Protect the dashboard by redirecting logged-out users.

```typescript
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has('session');
  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

Any request to `/dashboard/*` without a `session` cookie is redirected to `/login?from=…`; everything else proceeds. This is a lightweight gate — the real permission check still happens where the dashboard reads its data.

# Real World Analogy

Middleware is the **security desk in a building lobby**. Everyone entering passes it first (before reaching any office). The guard does a quick check — is your badge present? — and either waves you through (`next()`), sends you to reception (`redirect`), or quietly routes you to a different floor (`rewrite`). The guard is fast and doesn't do deep background checks; those happen upstairs at the actual vault (your data layer). And the `matcher` is the guard only watching certain entrances.

# Examples

## Example 1 — Basic: A simple redirect

```typescript
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL('/new-home', request.url));
}
export const config = { matcher: ['/old-home'] };
```

**Why this matters:** A one-file redirect for a moved page, applied only to `/old-home`.

## Example 2 — Real-world: Adding a security header

```typescript
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const res = NextResponse.next();
  res.headers.set('X-Frame-Options', 'DENY');
  return res;
}
```

**Why this matters:** Cross-cutting concerns like security headers belong in one place, applied consistently to matched routes.

## Example 3 — Pitfall: Heavy work in middleware

```typescript
// SLOW: querying a database on every matched request
export async function middleware(request: NextRequest) {
  const user = await db.users.find(/* … */); // runs on every request — expensive
  // …
}
```

**Why this matters:** Middleware runs before every matched request and should be fast. Do a lightweight check (like reading a cookie) here, and defer real data access and authorization to the data layer.

# Common Mistakes

- **Putting `middleware.ts` in the wrong place.** It must be at the project root (or `src/`). **Fix:** place a single `middleware.ts` there.
- **No `matcher`, so it runs everywhere.** That adds overhead to every request. **Fix:** scope it with `config.matcher`.
- **Heavy logic or DB calls in middleware.** It slows every request. **Fix:** keep it light; move real work downstream.
- **Relying on middleware as your only auth.** It's a coarse gate. **Fix:** re-verify authorization where you read data.

# Best Practices

- Keep middleware **fast and small**; it's on the hot path for every matched request.
- Always define a **`matcher`** to scope it precisely.
- Use it for redirects, rewrites, headers, and **optimistic** auth gating.
- Do **real authorization** near the data (Server Components / data layer), not only in middleware.
- Remember middleware isn't available in a **static export** — plan accordingly if you deploy that way.

# Summary

- A single root **`middleware.ts`** runs code **before a request is completed**.
- Scope it with **`config.matcher`**; otherwise it runs on every request.
- Use **`NextResponse`** to `next()`, `redirect()`, `rewrite()`, or set headers/cookies.
- It runs on the **Edge runtime** by default and must be **fast**.
- Treat middleware auth as a **lightweight gate**; verify permissions again at the data layer.

# Flash Cards

Q: Where does the middleware file live, and how many are there?
A: A single middleware.ts at the project root (or inside src/); there is one middleware entry point per project.

Q: How do you limit which routes middleware runs on?
A: Export a config with a matcher, e.g. export const config = { matcher: ['/dashboard/:path*'] }.

Q: Name three things middleware can do with NextResponse.
A: NextResponse.next() (continue), NextResponse.redirect(url), NextResponse.rewrite(url); it can also set headers/cookies.

Q: Where does middleware run in the request lifecycle, and on what runtime?
A: Before the request is completed (before rendering/caching), on the Edge runtime by default.

Q: Why shouldn't middleware be your only authorization check?
A: It's a coarse, fast gate; real permission checks must happen where you read sensitive data (Server Components / data layer).

Q: Why must middleware be fast?
A: It runs on every matched request, so heavy computation or database calls there slow down all those requests.

# Exercises

### Easy

Write middleware that redirects `/old` to `/new`, scoped with a matcher so it only runs for `/old`.

### Medium

Protect `/dashboard/*`: redirect to `/login` when a `session` cookie is missing, preserving the intended path in a `from` query param.

### Challenging

Add middleware that sets a couple of security headers on responses for all pages, and a matcher that excludes static assets and `/api`. Then explain why you'd still re-check the user's role inside the dashboard's Server Components rather than trusting the middleware gate alone.

# Further Reading

- [Next.js — Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js — middleware.js file convention](https://nextjs.org/docs/app/api-reference/file-conventions/middleware)
- [Next.js — Authentication guide](https://nextjs.org/docs/app/building-your-application/authentication)
- [Next.js — NextResponse](https://nextjs.org/docs/app/api-reference/functions/next-response)
