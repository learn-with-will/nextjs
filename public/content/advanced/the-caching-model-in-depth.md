---
id: lesson-22
slug: the-caching-model-in-depth
title: "The Caching Model in Depth"
level: advanced
order: 22
duration: 26
tags:
  - caching
  - data-cache
  - full-route-cache
  - router-cache
  - request-memoization
summary: "Understand Next.js's four caching layers—Request Memoization, Data Cache, Full Route Cache, and the client Router Cache—and how each is invalidated."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Name the four caching layers Next.js uses.
- Explain the scope and lifetime of each.
- Describe how revalidation clears the server caches.
- Explain why the client Router Cache can show seemingly stale UI.
- Diagnose caching behavior across a request.

# Why It Matters

Next.js is fast largely because it caches at several levels — but those layers are also the source of the most confusing bugs ("why is my data stale?"). Understanding what each cache holds, how long it lasts, and how to clear it turns caching from a mystery into a tool you control. This lesson consolidates the earlier caching lesson into the full mental model.

# Concept Explanation

Next.js has **four** caches, from the innermost (one render) to the outermost (the browser):

### 1. Request Memoization

A React feature that **dedupes identical `fetch` calls within a single render pass**. If a layout and a page both `fetch` the same URL while rendering one request, the request runs once. It lasts only for that render and needs no configuration. (For non-`fetch` functions, `React.cache` gives the same de-duplication.)

### 2. Data Cache

A **persistent, server-side cache of `fetch` results** that survives across requests and even deployments. This is the cache you control with `cache: 'force-cache'` and `next: { revalidate }` (recall: in Next.js 15, `fetch` is **not** cached by default). It's invalidated by time (`revalidate`) or on demand (`revalidateTag`, `revalidatePath`).

### 3. Full Route Cache

At build time, **statically rendered routes** have their rendered output (the React Server Component payload and HTML) cached on the server. Requests are served this prebuilt output instantly. It's invalidated when the underlying data is revalidated or when you redeploy. Only **static** routes are stored here; dynamic routes are rendered per request.

### 4. Router Cache (client-side)

In the browser, Next.js keeps an **in-memory cache of visited and prefetched routes'** RSC payloads for the session. This makes back/forward and re-navigation instant. It's cleared on a full page refresh, by `router.refresh()`, and by Server Action revalidation. Because it's client-side and short-lived, a navigation can briefly show a cached view until it's refreshed.

### How they work together

For one request: Request Memoization dedupes fetches during render → the Data Cache serves cached fetch results across requests → the Full Route Cache serves prebuilt static output → the Router Cache makes client navigation instant.

# Key Terminology

- **Request Memoization** — per-render de-duplication of identical `fetch` calls.
- **Data Cache** — persistent server cache of `fetch` results (you control it).
- **Full Route Cache** — server cache of statically rendered route output.
- **Router Cache** — client-side in-memory cache of route payloads for the session.
- **Invalidation** — clearing a cache so fresh data is produced.

# Options and Trade-offs

| Cache | Location | Scope / lifetime | Cleared by |
| --- | --- | --- | --- |
| Request Memoization | Server | One render pass | Ends with the render |
| Data Cache | Server | Across requests & deploys | `revalidate`, `revalidateTag`/`revalidatePath` |
| Full Route Cache | Server | Until revalidated / redeploy | Data revalidation, redeploy |
| Router Cache | Browser | The user's session | Refresh, `router.refresh()`, action revalidation |

# Worked Example

Trace what happens when a post is created.

```typescript
// A tagged fetch feeds the Data Cache and the Full Route Cache
await fetch('https://api.example.com/posts', { next: { tags: ['posts'] } });
```

```typescript
'use server';
import { revalidateTag } from 'next/cache';

export async function createPost(/* … */) {
  // …save the post…
  revalidateTag('posts');
}
```

When `revalidateTag('posts')` runs:

1. The **Data Cache** entry for that tagged fetch is invalidated.
2. Any **Full Route Cache** entry that depended on it is invalidated, so the static page is regenerated.
3. The Server Action also refreshes the client **Router Cache** for the affected route.

Result: the next visit shows the new post — because the mutation reached through the server caches *and* the client cache.

# Real World Analogy

The four caches are like **copies of a document at different desks**. Request Memoization is jotting a value on a sticky note so you don't re-ask during one meeting (a single render). The Data Cache is the shared filing cabinet everyone pulls from across meetings. The Full Route Cache is the pre-printed handout made once and reused. The Router Cache is the copy each attendee keeps on their own desk for quick reference. To truly update everyone, you must refresh the filing cabinet *and* tell people to swap their desk copy — which is what revalidation does.

# Examples

## Example 1 — Basic: Memoization within a render

```tsx
// Both call the same fetch during one render → it runs once (memoized)
async function getUser() {
  return fetch('https://api.example.com/me').then((r) => r.json());
}
// called in the layout and the page for the same request
```

**Why this matters:** You can fetch the same data where you need it without causing duplicate requests in a single render.

## Example 2 — Real-world: ISR via the Data + Full Route caches

```tsx
export const revalidate = 3600; // route-level

export default async function News() {
  const items = await fetch('https://api.example.com/news').then((r) => r.json());
  return <ul>{items.map((i: { id: string; t: string }) => <li key={i.id}>{i.t}</li>)}</ul>;
}
```

**Why this matters:** The Data Cache and Full Route Cache together serve a prebuilt page fast and regenerate it hourly — that's ISR working across two layers.

## Example 3 — Pitfall: Expecting instant freshness after a mutation

```typescript
// You mutated data but didn't revalidate — the client Router Cache
// (and the server caches) still serve the old version until refreshed.
'use server';
export async function edit() {
  await save();
  // Missing: revalidatePath('/list') or revalidateTag('list')
}
```

**Why this matters:** Without revalidation, cached layers keep serving old data. Call `revalidatePath`/`revalidateTag` (or `router.refresh()`) so every layer updates.

# Common Mistakes

- **Confusing the Data Cache with the Router Cache.** One is server, one is client. **Fix:** learn which layer holds what before debugging.
- **Mutating without revalidating.** All caches keep old data. **Fix:** revalidate the path/tag in the action.
- **Assuming `fetch` is cached (Next.js 15).** It isn't by default. **Fix:** opt into the Data Cache explicitly.
- **Expecting `router.refresh()` to clear the server Data Cache.** It refreshes the route/client, not tagged data. **Fix:** use `revalidateTag`/`revalidatePath` for server data.

# Best Practices

- Keep the **four layers** straight; identify which one is stale before "fixing" caching.
- Tag fetches so you can **invalidate precisely** with `revalidateTag`.
- Pair every mutation with the right **revalidation** so server *and* client caches update.
- Prefer **static + ISR** for shared content to benefit from the Full Route Cache.
- Remember the **Router Cache** is per-session and client-side — refresh it after changes.

# Summary

- Next.js caches at four layers: **Request Memoization**, **Data Cache**, **Full Route Cache**, and the client **Router Cache**.
- **Request Memoization** dedupes fetches within one render; the **Data Cache** persists fetch results across requests.
- The **Full Route Cache** stores statically rendered route output; the **Router Cache** speeds client navigation.
- **Revalidation** (`revalidateTag`/`revalidatePath`) clears the server caches; `router.refresh()` refreshes the client.
- Most "stale data" bugs come from mutating without revalidating the right layer.

# Flash Cards

Q: What are the four Next.js caching layers?
A: Request Memoization, the Data Cache, the Full Route Cache, and the client-side Router Cache.

Q: Which cache dedupes identical fetch calls within a single render pass?
A: Request Memoization (a React feature) — it lasts only for that render.

Q: What does the Data Cache store, and how is it cleared?
A: Persistent fetch results on the server (across requests/deploys); cleared by time-based revalidate or on-demand revalidateTag/revalidatePath.

Q: What does the Full Route Cache hold?
A: The rendered output (RSC payload + HTML) of statically rendered routes, served instantly until data is revalidated or you redeploy.

Q: Why might the UI look stale even after data changed on the server?
A: The client-side Router Cache holds route payloads for the session; it's cleared by a refresh, router.refresh(), or a Server Action's revalidation.

Q: In Next.js 15, is the Data Cache populated by fetch automatically?
A: No — fetch is uncached by default; you opt into the Data Cache with cache: 'force-cache' or next: { revalidate }.

# Exercises

### Easy

Fetch the same URL in a layout and a page for one route and confirm (via logs or network) it isn't fetched twice — that's Request Memoization.

### Medium

Set `export const revalidate = 20` on a page that fetches data, and observe how the Data Cache and Full Route Cache serve a cached page that regenerates roughly every 20 seconds.

### Challenging

Build a mutation that updates a tagged resource and call `revalidateTag`. Explain, layer by layer, what is invalidated (Data Cache, Full Route Cache) and how the client Router Cache is refreshed so the user sees the change.

# Further Reading

- [Next.js — Caching in Next.js (deep dive)](https://nextjs.org/docs/app/deep-dive/caching)
- [Next.js — Data Cache](https://nextjs.org/docs/app/deep-dive/caching#data-cache)
- [Next.js — Full Route Cache](https://nextjs.org/docs/app/deep-dive/caching#full-route-cache)
- [Next.js — Client-side Router Cache](https://nextjs.org/docs/app/deep-dive/caching#client-side-router-cache)
