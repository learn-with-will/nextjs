---
id: lesson-12
slug: caching-and-revalidation
title: "Caching and Revalidation"
level: intermediate
order: 12
duration: 26
tags:
  - caching
  - revalidation
  - isr
  - fetch-cache
  - revalidate-path
summary: "Control data freshness with fetch caching options and revalidation—time-based (ISR) and on-demand with revalidatePath and revalidateTag."
---

# Learning Objectives

By the end of this lesson you will be able to:

- State the Next.js 15 default for `fetch` caching.
- Opt into caching with `cache: 'force-cache'`.
- Set up time-based revalidation (ISR) with `next: { revalidate }`.
- Trigger on-demand revalidation with `revalidatePath` and `revalidateTag`.
- Choose the right freshness strategy for a piece of data.

# Why It Matters

Caching is the dial between "always fresh" and "blazing fast." Cache too aggressively and users see stale prices; cache too little and you hammer your database on every request. Next.js gives you fine control per request and per route — including **Incremental Static Regeneration (ISR)**, which serves cached pages *and* refreshes them in the background — so you can be both fast and up to date.

# Concept Explanation

### The Next.js 15 default: not cached

**As of Next.js 15, `fetch()` responses are not cached by default.** Each request fetches fresh data. (This changed from Next.js 13/14, where `fetch` was cached by default — a frequent source of confusion when following older tutorials.)

```tsx
// Next.js 15: this fetch is NOT cached — fresh every request
const res = await fetch('https://api.example.com/prices');
```

### Opting into caching

To cache a response indefinitely (until you revalidate), pass `cache: 'force-cache'`:

```tsx
const res = await fetch('https://api.example.com/config', { cache: 'force-cache' });
```

To force it always fresh, use `cache: 'no-store'`.

### Time-based revalidation (ISR)

The middle ground: cache the response but refresh it at most every N seconds. Pass `next: { revalidate }`:

```tsx
// Cached, but refreshed at most once an hour
const res = await fetch('https://api.example.com/posts', {
  next: { revalidate: 3600 },
});
```

You can also set it for a whole route:

```tsx
export const revalidate = 3600; // seconds
```

This is **ISR**: static pages are served from cache and quietly regenerated in the background after the interval, so visitors get fast pages that are never more than an hour stale.

### On-demand revalidation

When data changes because of an action (a new post, an edited product), you don't want to wait for a timer. Revalidate immediately from a Server Action or Route Handler:

- `revalidatePath('/blog')` — invalidate a specific path.
- `revalidateTag('posts')` — invalidate every fetch tagged `posts`.

Tag a fetch so you can target it later:

```tsx
await fetch('https://api.example.com/posts', { next: { tags: ['posts'] } });
// later, after a mutation:
import { revalidateTag } from 'next/cache';
revalidateTag('posts');
```

# Key Terminology

- **Data Cache** — Next.js's server-side cache for `fetch` results.
- **`cache: 'force-cache'` / `'no-store'`** — cache indefinitely / never cache.
- **Revalidation** — refreshing cached data after a time interval or on demand.
- **ISR (Incremental Static Regeneration)** — serving cached static pages and regenerating them in the background.
- **`revalidatePath` / `revalidateTag`** — functions to invalidate cached data on demand.
- **Cache tag** — a label (`next: { tags: [...] }`) you attach to a fetch to invalidate it by name.

# Options and Trade-offs

| Goal | Option | Freshness |
| --- | --- | --- |
| Always current data | `cache: 'no-store'` (the default) | Every request |
| Cache until you say otherwise | `cache: 'force-cache'` | Until revalidated |
| Refresh on a schedule | `next: { revalidate: N }` or route `revalidate` | At most every N seconds |
| Refresh when data changes | `revalidatePath` / `revalidateTag` | Immediately after the mutation |

# Worked Example

A blog list cached with ISR, refreshed immediately when a post is added.

```tsx
// app/blog/page.tsx — cached, revalidated hourly and tagged for on-demand refresh
export default async function BlogPage() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600, tags: ['posts'] },
  });
  const posts = await res.json();
  return (
    <ul>
      {posts.map((p: { id: string; title: string }) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}
```

```typescript
// app/actions.ts — after creating a post, refresh the cached list now
'use server';
import { revalidateTag } from 'next/cache';

export async function createPost(/* … */) {
  // …save the post…
  revalidateTag('posts'); // invalidate every fetch tagged 'posts'
}
```

Readers get a fast, cached list that's at most an hour old — and the moment a new post is created, `revalidateTag('posts')` refreshes it immediately.

# Real World Analogy

Caching with revalidation is like a **café's pastry display**. Baking to order for every customer (no-store) is fresh but slow. Baking a batch each morning and leaving it out all day (force-cache) is instant but goes stale. ISR is baking a batch and setting a timer to refresh it every hour — customers grab from the case instantly, and it's never very old. On-demand revalidation is the baker swapping in a fresh tray the instant the recipe changes, without waiting for the timer.

# Examples

## Example 1 — Basic: Caching a rarely-changing response

```tsx
const res = await fetch('https://api.example.com/site-config', {
  cache: 'force-cache',
});
```

**Why this matters:** Config that almost never changes should be cached so you don't refetch it on every request.

## Example 2 — Real-world: Hourly ISR for a route

```tsx
// app/news/page.tsx
export const revalidate = 3600; // whole route revalidates hourly

export default async function News() {
  const res = await fetch('https://api.example.com/headlines');
  const items = await res.json();
  return <ul>{items.map((i: { id: string; title: string }) => <li key={i.id}>{i.title}</li>)}</ul>;
}
```

**Why this matters:** The page is static-fast yet refreshes itself hourly in the background — the essence of ISR.

## Example 3 — Pitfall: Assuming fetch is cached like older Next.js

```tsx
// MISCONCEPTION: expecting this to be cached automatically
const res = await fetch('https://api.example.com/prices');
// In Next.js 15 this is NOT cached — it refetches every request.
// To cache it: { cache: 'force-cache' } or { next: { revalidate: N } }
```

**Why this matters:** Older tutorials assume `fetch` caches by default. In Next.js 15 you must opt in, or you'll unknowingly refetch every time.

# Common Mistakes

- **Assuming `fetch` is cached by default.** Not in Next.js 15. **Fix:** add `cache: 'force-cache'` or `next: { revalidate }` when you want caching.
- **Caching data that must be current.** Prices/inventory go stale. **Fix:** use `no-store` or a short `revalidate`.
- **Waiting on a timer for content that just changed.** Users see old data. **Fix:** call `revalidatePath`/`revalidateTag` after the mutation.
- **Tagging a fetch but never revalidating the tag.** The tag does nothing. **Fix:** call `revalidateTag('…')` where the data changes.

# Best Practices

- Decide freshness per data source: config (cache), lists (ISR), prices (no-store).
- Prefer **`revalidate`** for content that changes on a rough schedule.
- Use **tags** plus `revalidateTag` to invalidate related data precisely after mutations.
- Pair `revalidatePath`/`revalidateTag` with the **Server Action** that changes the data.
- State assumptions in code comments — caching behavior isn't visible in the UI.

# Summary

- **As of Next.js 15, `fetch` is not cached by default** — opt in explicitly.
- `cache: 'force-cache'` caches indefinitely; `cache: 'no-store'` never caches.
- `next: { revalidate: N }` (or route `export const revalidate`) enables **ISR** — cached pages refreshed on a schedule.
- **`revalidatePath`** and **`revalidateTag`** invalidate cached data **on demand** after a change.
- Attach **tags** to fetches to revalidate exactly the data that changed.

# Flash Cards

Q: As of Next.js 15, is fetch() cached by default?
A: No — fetch is uncached by default in Next.js 15; you opt into caching with cache: 'force-cache' or next: { revalidate }.

Q: How do you cache a fetch response indefinitely until revalidated?
A: Pass { cache: 'force-cache' } to fetch.

Q: What does next: { revalidate: 3600 } do?
A: Caches the response but refreshes it at most once every 3600 seconds — time-based revalidation (ISR).

Q: What is ISR?
A: Incremental Static Regeneration — serving cached static pages and regenerating them in the background after a revalidation interval.

Q: How do you refresh cached data immediately after a mutation?
A: Call revalidatePath('/path') or revalidateTag('tag') (from next/cache) in the Server Action or Route Handler that made the change.

Q: How do you target a specific fetch for on-demand revalidation?
A: Tag it with next: { tags: ['name'] }, then call revalidateTag('name') when the data changes.

# Exercises

### Easy

Fetch a value with `cache: 'force-cache'` and render it. Reload several times and confirm it doesn't change (it's cached).

### Medium

Add `export const revalidate = 30` to a page that fetches the current time from an API. Observe that the displayed time updates at most every 30 seconds, not on every reload.

### Challenging

Tag a `fetch('/posts', { next: { tags: ['posts'] } })` and build a Server Action that "creates" a post and calls `revalidateTag('posts')`. Explain the sequence of what's cached, when it's served stale, and when it refreshes — for both a timed `revalidate` and the on-demand tag.

# Further Reading

- [Next.js — Caching in Next.js](https://nextjs.org/docs/app/deep-dive/caching)
- [Next.js — Revalidating Data](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [Next.js — revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [Next.js — revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
