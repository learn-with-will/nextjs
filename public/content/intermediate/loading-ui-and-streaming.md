---
id: lesson-13
slug: loading-ui-and-streaming
title: "Loading UI and Streaming"
level: intermediate
order: 13
duration: 22
tags:
  - loading
  - streaming
  - suspense
  - loading-tsx
  - user-experience
summary: "Show instant loading states with loading.tsx and stream slow parts of a page independently using React Suspense boundaries."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Add an instant loading state with `loading.tsx`.
- Explain how `loading.tsx` uses React `<Suspense>` under the hood.
- Stream slow parts of a page independently with `<Suspense>`.
- Keep the fast parts of a page visible while slow data loads.
- Decide where to place Suspense boundaries.

# Why It Matters

When a page fetches on the server, the visitor stares at a blank screen until *everything* is ready. That feels slow even when it isn't. **Streaming** fixes this: Next.js can send the page shell immediately and stream in slower sections as they finish. The result is a page that appears instantly and fills in progressively — a huge perceived-performance win with almost no extra code.

# Concept Explanation

### Instant loading with `loading.tsx`

Add a `loading.tsx` file to a route folder and Next.js shows it **immediately** while that route's data loads:

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <p>Loading dashboard…</p>;
}
```

Behind the scenes, Next.js wraps the route's `page` in a React `<Suspense>` boundary with your `loading.tsx` as the fallback. The user sees the loading UI right away, then the real page when it's ready.

### Streaming

Streaming means the server sends HTML **in chunks** instead of all at once. The static shell (layout, headers, anything already rendered) arrives first; slow, data-dependent parts stream in as they resolve. This improves the time to first byte and lets users start reading immediately.

### Granular streaming with `<Suspense>`

`loading.tsx` covers a whole route, but you often want the page to appear and only *one slow widget* to show a placeholder. Wrap that widget in `<Suspense>` with its own fallback:

```tsx
import { Suspense } from 'react';
import SlowStats from './SlowStats'; // an async Server Component

export default function Page() {
  return (
    <main>
      <h1>Dashboard</h1>            {/* shows immediately */}
      <Suspense fallback={<p>Loading stats…</p>}>
        <SlowStats />              {/* streams in when ready */}
      </Suspense>
    </main>
  );
}
```

The heading and layout render instantly; only `SlowStats` waits, showing its fallback until its data resolves.

# Key Terminology

- **`loading.tsx`** — a reserved file whose UI shows while a route segment loads.
- **Streaming** — sending HTML to the browser in chunks as it becomes ready.
- **`<Suspense>`** — a React boundary that shows a `fallback` until its children finish loading.
- **Fallback** — the placeholder UI shown while suspended content loads.
- **Perceived performance** — how fast a page *feels*, improved by showing content progressively.

# Options and Trade-offs

| Tool | Scope | Use it for |
| --- | --- | --- |
| `loading.tsx` | The whole route segment | A simple, page-wide loading state |
| `<Suspense>` | One component/subtree | Streaming individual slow widgets |
| No boundary | — | Only when everything is fast |

# Worked Example

A page that appears instantly while a slow feed streams in.

```tsx
// app/feed/SlowFeed.tsx — a Server Component with slow data
export default async function SlowFeed() {
  const res = await fetch('https://api.example.com/feed', { cache: 'no-store' });
  const items = await res.json();
  return (
    <ul>
      {items.map((i: { id: string; text: string }) => (
        <li key={i.id}>{i.text}</li>
      ))}
    </ul>
  );
}
```

```tsx
// app/feed/page.tsx
import { Suspense } from 'react';
import SlowFeed from './SlowFeed';

export default function FeedPage() {
  return (
    <main>
      <h1>Your feed</h1>
      <Suspense fallback={<p>Loading posts…</p>}>
        <SlowFeed />
      </Suspense>
    </main>
  );
}
```

The heading renders immediately; the feed streams in when its data resolves. Add a `loading.tsx` too, and even the very first navigation shows a state instantly.

# Real World Analogy

Streaming is like a **restaurant bringing out courses as they're ready** instead of making you wait for the entire meal. Bread and drinks arrive first (the shell), the appetizer follows, and the slow-roasted main comes when it's done. You're seated and eating within a minute rather than staring at an empty table. A Suspense fallback is the little "your main is on its way" note the server leaves while that one slow dish finishes.

# Examples

## Example 1 — Basic: A route-wide loading state

```tsx
// app/reports/loading.tsx
export default function Loading() {
  return <p>Loading reports…</p>;
}
```

**Why this matters:** Just adding this file gives `/reports` an instant loading UI while its data loads — no other code needed.

## Example 2 — Real-world: Streaming one slow section

```tsx
import { Suspense } from 'react';
import Recommendations from './Recommendations';

export default function ProductPage() {
  return (
    <main>
      <h1>Product</h1>
      <p>Details render immediately.</p>
      <Suspense fallback={<p>Finding recommendations…</p>}>
        <Recommendations />
      </Suspense>
    </main>
  );
}
```

**Why this matters:** The fast product details show at once; only the slow recommendations wait, so the page never feels blocked.

## Example 3 — Pitfall: Wrapping everything in one boundary

```tsx
// The whole page waits on the slowest part
<Suspense fallback={<p>Loading…</p>}>
  <FastHeader />
  <SlowStats />
  <FastFooter />
</Suspense>
```

**Why this matters:** Now even the fast header and footer are hidden until `SlowStats` resolves. Put the boundary *around the slow part only* so the rest can render immediately.

# Common Mistakes

- **No loading state on a slow route.** Users see a blank screen. **Fix:** add `loading.tsx` or a `<Suspense>` boundary.
- **One giant Suspense boundary.** The whole page waits on its slowest child. **Fix:** wrap only the slow subtree.
- **Blocking the page by awaiting slow data at the top.** Nothing streams. **Fix:** move the slow await into a child component behind `<Suspense>`.
- **Forgetting fallbacks should be lightweight.** Heavy fallbacks defeat the purpose. **Fix:** use small skeletons/placeholders.

# Best Practices

- Give slow routes a **`loading.tsx`** for an instant page-level state.
- Use **`<Suspense>`** to stream individual slow widgets while the rest renders.
- Place boundaries **around the slow part only**, not the whole page.
- Keep fallbacks light — skeletons that match the final layout reduce shift.
- Combine streaming with parallel fetching so slow parts don't also waterfall.

# Summary

- **`loading.tsx`** shows an instant loading UI for a route and is powered by React `<Suspense>`.
- **Streaming** sends HTML in chunks: the shell first, slow parts as they resolve.
- Wrap slow components in **`<Suspense fallback={…}>`** to stream them independently.
- Scope boundaries to the **slow subtree** so fast content isn't held back.
- Streaming improves **perceived performance** with minimal code.

# Flash Cards

Q: What does adding a loading.tsx file to a route folder do?
A: It shows that UI instantly while the route's data loads; Next.js wraps the page in a React <Suspense> boundary with loading.tsx as the fallback.

Q: What is streaming in Next.js?
A: Sending the page's HTML to the browser in chunks — the shell first, then slower parts as they finish rendering.

Q: How do you stream just one slow widget while the rest of the page shows immediately?
A: Wrap that widget in <Suspense fallback={...}> so only it waits, showing the fallback until its data resolves.

Q: Why is wrapping the entire page in a single Suspense boundary a mistake?
A: The whole page then waits on its slowest child; fast content is hidden until the slow part resolves.

Q: What powers loading.tsx under the hood?
A: React <Suspense> — Next.js automatically wraps the segment with loading.tsx as the fallback.

Q: What should a Suspense fallback look like?
A: Something lightweight, like a skeleton matching the final layout, so it appears instantly and minimizes layout shift.

# Exercises

### Easy

Add a `loading.tsx` to a route that fetches slow data and confirm the loading UI appears immediately on navigation.

### Medium

On a page with a fast header and a slow list, wrap only the list in `<Suspense>` with a skeleton fallback. Verify the header shows instantly while the list streams in.

### Challenging

Build a page with two independent slow sections. Give each its own `<Suspense>` boundary so they stream in separately as each resolves. Explain how this differs from awaiting both at the top of the page.

# Further Reading

- [Next.js — Loading UI and Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Next.js — loading.js file convention](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
- [React — Suspense](https://react.dev/reference/react/Suspense)
- [web.dev — Time to First Byte (TTFB)](https://web.dev/articles/ttfb)
