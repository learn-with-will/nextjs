---
id: lesson-11
slug: rendering-strategies
title: "Rendering Strategies: Static and Dynamic"
level: intermediate
order: 11
duration: 24
tags:
  - rendering
  - static-rendering
  - dynamic-rendering
  - ssg
  - ssr
summary: "Learn how Next.js chooses between static rendering (at build time) and dynamic rendering (per request), and how to control it."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Distinguish **static rendering** from **dynamic rendering**.
- Explain which Dynamic APIs push a route to render dynamically.
- Map the terms SSG and SSR onto static and dynamic.
- Control a route's rendering with `export const dynamic`.
- Choose the right strategy for a given page.

# Why It Matters

The same page can be built once and reused by everyone (fast and cheap) or built fresh for each visitor (always current, but slower). Picking correctly is the core performance decision in Next.js. Get it right and a marketing page is served instantly from cache while a personalized dashboard stays up to date. Get it wrong and you either serve stale data or needlessly rebuild a page on every request.

# Concept Explanation

### Static rendering (the default)

By default, Next.js **statically renders** a route: it runs the component **at build time**, produces HTML once, and serves that same HTML to every visitor. It's the fastest option and can be cached on a CDN. Pages that look the same for everyone — marketing pages, docs, most blog posts — should be static. Static rendering is what people mean by **SSG (Static Site Generation)**.

### Dynamic rendering

A route is **dynamically rendered** when it's built **at request time**, once per visit. You need this when the output depends on something only known per request — the signed-in user, cookies, request headers, or search-params. Dynamic rendering is what people mean by **SSR (Server-Side Rendering)** in the App Router.

### What triggers dynamic rendering

Next.js switches a route to dynamic automatically when it uses a **Dynamic API** — data that only exists per request:

- `cookies()` — reading request cookies
- `headers()` — reading request headers
- `draftMode()` — draft/preview mode
- the `searchParams` prop of a page

If a route uses none of these (and doesn't opt out of caching), it stays static.

### Forcing a strategy

You can override the automatic choice with **route segment config** exported from a `layout` or `page`:

```tsx
export const dynamic = 'force-dynamic'; // always render at request time
// or
export const dynamic = 'force-static';  // always render statically
```

The default is `'auto'`, which lets Next.js decide based on the APIs you use.

# Key Terminology

- **Static rendering (SSG)** — render at build time; one HTML output reused for all requests.
- **Dynamic rendering (SSR)** — render at request time; a fresh output per request.
- **Dynamic API** — request-time data (`cookies()`, `headers()`, `draftMode()`, `searchParams`) whose use makes a route dynamic.
- **Route segment config** — exports like `export const dynamic` that control rendering.
- **`force-dynamic` / `force-static`** — config values that pin a route's strategy.

# Options and Trade-offs

| | Static (SSG) | Dynamic (SSR) |
| --- | --- | --- |
| Rendered | At build time | On each request |
| Speed | Fastest (cacheable) | Slower (per-request work) |
| Freshness | As of the last build/revalidate | Always current |
| Uses request data? | No | Yes (cookies, headers, searchParams) |
| Good for | Marketing, docs, blogs | Dashboards, personalized pages |

# Worked Example

Two pages in the same app — one static, one dynamic.

```tsx
// app/pricing/page.tsx — static: same for everyone, built once
export default function PricingPage() {
  return <h1>Simple, flat pricing</h1>;
}
```

```tsx
// app/account/page.tsx — dynamic: reads a per-request cookie
import { cookies } from 'next/headers';

export default async function AccountPage() {
  const store = await cookies();          // Dynamic API → dynamic rendering
  const theme = store.get('theme')?.value ?? 'light';
  return <p>Your theme preference: {theme}</p>;
}
```

`/pricing` is built once and served from cache. `/account` reads a cookie, so Next.js renders it per request. You didn't configure anything — using `cookies()` made the difference.

# Real World Analogy

Static rendering is a **printed newspaper**: one edition is printed and everyone gets the identical copy — cheap and instant to hand out, but fixed until the next print run. Dynamic rendering is a **barista making your coffee to order**: it takes a moment and happens per customer, but it's exactly what you asked for. You print the parts everyone shares and make-to-order only the parts that must be personal.

# Examples

## Example 1 — Basic: A static page

```tsx
// app/about/page.tsx — no request data → static by default
export default function AboutPage() {
  return <h1>About our company</h1>;
}
```

**Why this matters:** With no Dynamic APIs, this renders once at build and is served instantly to everyone.

## Example 2 — Real-world: A page that reads search params

```tsx
// app/search/page.tsx — searchParams makes it dynamic
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <p>Results for: {q ?? '(nothing)'}</p>;
}
```

**Why this matters:** Reading `searchParams` (a Dynamic API, and async in Next.js 15) means the page depends on the request, so it renders dynamically.

## Example 3 — Pitfall: Making a page dynamic by accident

```tsx
// app/blog/page.tsx — reads cookies just to show a banner, forcing dynamic
import { cookies } from 'next/headers';

export default async function BlogList() {
  await cookies(); // now the WHOLE list renders per request
  return <h1>Blog</h1>;
}
```

**Why this matters:** Touching a Dynamic API opts the entire route out of static rendering. If only a small part needs request data, isolate it (e.g. in a Client Component) so the rest can stay static.

# Common Mistakes

- **Using `cookies()`/`headers()` where you don't need them.** It forces dynamic rendering. **Fix:** only read request data on routes that truly depend on it.
- **Expecting a static page to show fresh, per-user data.** It's built once. **Fix:** use dynamic rendering (or revalidation, next lesson) for changing data.
- **Reading `searchParams` synchronously.** It's a Promise in Next.js 15. **Fix:** `const { q } = await searchParams`.
- **Forcing `dynamic = 'force-dynamic'` everywhere "to be safe."** You lose static speed. **Fix:** let `'auto'` decide unless you have a reason.

# Best Practices

- Default to **static**; reach for dynamic only when the page depends on the request.
- Keep pages that everyone sees the same **static** for CDN-level speed.
- Isolate per-request bits so one small dynamic need doesn't make a whole page dynamic.
- Use `export const dynamic` deliberately, and document why when you pin it.
- Remember the middle ground — **revalidation/ISR** — for data that changes occasionally (next lesson).

# Summary

- Next.js renders **statically by default** (build time, reused for all) and **dynamically** when needed (per request).
- **Dynamic APIs** — `cookies()`, `headers()`, `draftMode()`, and `searchParams` — switch a route to dynamic.
- **SSG** = static rendering; **SSR** = dynamic rendering in App Router terms.
- Control it with `export const dynamic = 'force-dynamic' | 'force-static'` (default `'auto'`).
- Prefer static for shared content; reserve dynamic for request-specific pages.

# Flash Cards

Q: What is the default rendering strategy in Next.js, and when does it happen?
A: Static rendering — the route is rendered at build time and the same HTML is reused for every request.

Q: Name three Dynamic APIs that cause a route to render dynamically.
A: Any three of: cookies(), headers(), draftMode(), and reading the searchParams prop.

Q: How do SSG and SSR map to Next.js App Router terms?
A: SSG = static rendering (build time); SSR = dynamic rendering (request time).

Q: How do you force a route to always render dynamically?
A: export const dynamic = 'force-dynamic' from the page or layout (force-static pins it static).

Q: Why might reading cookies() in a page hurt performance?
A: It's a Dynamic API, so it opts the whole route out of static rendering — the page is then built on every request.

Q: When should you choose dynamic rendering over static?
A: When the output depends on request-specific data (the signed-in user, cookies, headers, or search params) or must always be current.

# Exercises

### Easy

Create a static `/features` page (no request data) and confirm `npm run build` marks it as static.

### Medium

Create `/greeting` that reads a `name` search param and greets the user. Note in the build output that it's rendered dynamically, and explain why.

### Challenging

Take a mostly-static page that currently calls `cookies()` at the top just to show a small personalized badge. Refactor so the page stays static and only the badge (a Client Component reading the cookie in the browser, or a separate dynamic segment) handles the per-request part. Explain the trade-off you made.

# Further Reading

- [Next.js — Rendering: Static and Dynamic](https://nextjs.org/docs/app/building-your-application/rendering/server-components#server-rendering-strategies)
- [Next.js — Partial Prerendering and rendering overview](https://nextjs.org/docs/app/building-your-application/rendering)
- [Next.js — Route Segment Config (dynamic)](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)
- [Next.js — cookies()](https://nextjs.org/docs/app/api-reference/functions/cookies)
