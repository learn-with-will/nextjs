---
id: lesson-23
slug: performance-optimization
title: "Performance and Optimization"
level: advanced
order: 23
duration: 24
tags:
  - performance
  - code-splitting
  - dynamic-import
  - core-web-vitals
  - bundle-size
summary: "Ship less JavaScript and improve Core Web Vitals with Server Components, dynamic imports, image/font optimization, and next/script."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Reduce client JavaScript by keeping work in Server Components.
- Lazy-load heavy client code with `next/dynamic`.
- Name the Core Web Vitals and what each measures.
- Load third-party scripts efficiently with `next/script`.
- Reason about bundle size and where to optimize.

# Why It Matters

Performance is a feature: faster pages convert better, rank better, and frustrate users less. Next.js gives you strong defaults — automatic code-splitting, image and font optimization, Server Components — but the biggest wins come from *shipping less JavaScript* and *loading what remains at the right time*. Knowing the levers lets you hit good Core Web Vitals without guesswork.

# Concept Explanation

### Ship less JavaScript with Server Components

Every Client Component adds to the browser's bundle. The single most effective optimization is keeping components on the **server** and pushing `"use client"` to small leaves. Server Components ship **zero** JavaScript for themselves.

### Automatic code-splitting

Next.js automatically **splits code per route**, so visiting `/about` doesn't download `/dashboard`'s code. You get this for free; your job is to keep individual routes lean.

### Lazy-loading with `next/dynamic`

For a heavy Client Component that isn't needed immediately (a chart, a rich editor), load it on demand with `next/dynamic`. It code-splits the component and can show a placeholder while it loads:

```tsx
'use client';
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <p>Loading chart…</p>,
});
```

This keeps the heavy code out of the initial bundle until it's actually rendered.

### Core Web Vitals

Google's user-centered metrics:

- **LCP (Largest Contentful Paint)** — loading: when the main content appears.
- **CLS (Cumulative Layout Shift)** — visual stability: how much the layout jumps.
- **INP (Interaction to Next Paint)** — responsiveness: how quickly the UI responds to input. (As of 2024, INP replaced FID as a Core Web Vital.)

`next/image` and `next/font` directly improve LCP and CLS; less client JS improves INP.

### Third-party scripts with `next/script`

Load analytics and widgets with `next/script` and a `strategy` so they don't block your page:

```tsx
import Script from 'next/script';

<Script src="https://example.com/analytics.js" strategy="afterInteractive" />;
```

# Key Terminology

- **Bundle** — the JavaScript shipped to the browser for a route.
- **Code-splitting** — breaking the bundle into per-route chunks loaded on demand.
- **`next/dynamic`** — dynamic import that lazy-loads a component with an optional placeholder.
- **Core Web Vitals** — LCP, CLS, and INP: Google's loading, stability, and responsiveness metrics.
- **`next/script`** — the component for loading third-party scripts with a strategy.

# Options and Trade-offs

| Lever | Effect | When |
| --- | --- | --- |
| Server Components | Zero JS for that component | Default for anything non-interactive |
| `next/dynamic` | Defers a heavy client chunk | Charts, editors, below-the-fold widgets |
| `next/image` / `next/font` | Better LCP / less CLS | Images and fonts |
| `next/script` strategy | Non-blocking third-party JS | Analytics, embeds |
| Streaming (`<Suspense>`) | Faster perceived load | Slow data sections |

# Worked Example

Defer a heavy chart so it doesn't bloat the initial load.

```tsx
// app/reports/Report.tsx
'use client';
import dynamic from 'next/dynamic';

// The chart library only loads when <Report> renders
const Chart = dynamic(() => import('./Chart'), {
  loading: () => <p>Loading chart…</p>,
});

export default function Report() {
  return (
    <section>
      <h2>Monthly report</h2>
      <Chart />
    </section>
  );
}
```

The (potentially large) chart code is split into its own chunk and fetched only when `Report` renders — the rest of the page stays light and fast.

# Real World Analogy

Optimizing a Next.js app is like **packing for a trip**. Server Components are the things you leave at home entirely (zero weight to carry). Code-splitting is packing separate day-bags so you only grab what each day needs. `next/dynamic` is shipping the bulky gear ahead to arrive only when you'll use it. And Core Web Vitals are the airline's checks: total weight (LCP), whether your bag stays put on the belt (CLS), and how fast it comes off the carousel when you reach for it (INP).

# Examples

## Example 1 — Basic: A dynamically imported widget

```tsx
'use client';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('./RichEditor'));
export default function Page() {
  return <Editor />;
}
```

**Why this matters:** The rich editor's code loads only when this component renders, keeping other routes unaffected.

## Example 2 — Real-world: Non-blocking analytics

```tsx
import Script from 'next/script';

export default function Analytics() {
  return <Script src="https://example.com/a.js" strategy="afterInteractive" />;
}
```

**Why this matters:** `strategy="afterInteractive"` loads the script after the page is usable, so it doesn't delay your content or hurt responsiveness.

## Example 3 — Pitfall: Turning everything into a Client Component

```tsx
'use client'; // at the top of a big page just to use one onClick
// Now the entire page's tree ships to the browser as JS.
```

**Why this matters:** One stray `"use client"` at a high level drags a whole subtree into the bundle. Keep the page a Server Component and isolate the interactive part.

# Common Mistakes

- **Over-using `"use client"`.** It bloats the bundle. **Fix:** default to Server Components; isolate interactivity.
- **Loading heavy libraries eagerly.** They delay first load. **Fix:** `next/dynamic` for on-demand code.
- **Plain `<img>`/`<script>` tags.** They hurt LCP/CLS and can block. **Fix:** use `next/image` and `next/script`.
- **Optimizing without measuring.** You guess wrong. **Fix:** measure Core Web Vitals and bundle size first.

# Best Practices

- Keep the default **Server Component**; push `"use client"` to the leaves.
- **Lazy-load** heavy, non-critical client code with `next/dynamic`.
- Use **`next/image`** and **`next/font`** to protect LCP and CLS.
- Load third-party scripts via **`next/script`** with an appropriate `strategy`.
- **Measure** (Core Web Vitals, bundle analyzer) before and after changes.

# Summary

- The biggest performance lever is **shipping less JavaScript** — favor Server Components.
- Next.js **code-splits per route** automatically; **`next/dynamic`** defers heavy client chunks.
- **Core Web Vitals** are **LCP** (loading), **CLS** (stability), and **INP** (responsiveness).
- **`next/image`/`next/font`** improve LCP/CLS; **`next/script`** loads third-party JS without blocking.
- Always **measure** before and after optimizing.

# Flash Cards

Q: What is the single most effective way to reduce a page's JavaScript bundle?
A: Keep components as Server Components (which ship zero JS) and push "use client" to small interactive leaves.

Q: What does next/dynamic do?
A: It dynamically imports (code-splits) a component so its JavaScript loads on demand, optionally showing a loading placeholder.

Q: Name the three Core Web Vitals and what each measures.
A: LCP (loading — when main content appears), CLS (visual stability — layout shift), and INP (responsiveness — how fast the UI responds).

Q: Which Core Web Vital replaced FID, and as of when?
A: INP (Interaction to Next Paint) replaced FID as a Core Web Vital as of 2024.

Q: How should you load a third-party analytics script?
A: With next/script and a strategy like afterInteractive, so it doesn't block your content.

Q: Why is a high-level "use client" a performance risk?
A: It pulls its entire subtree into the client bundle, shipping far more JavaScript than a small isolated interactive component would.

# Exercises

### Easy

Take a heavy Client Component and load it with `next/dynamic`, adding a loading placeholder. Confirm its code is split into a separate chunk.

### Medium

Add an analytics-style script with `next/script` using `strategy="afterInteractive"`, and explain how that differs from a plain `<script>` tag in the head.

### Challenging

Audit a page that marks the whole route `"use client"`. Refactor it so the page is a Server Component and only the interactive widget is a Client Component. Describe the expected effect on bundle size and on LCP/INP, and how you'd measure it.

# Further Reading

- [Next.js — Lazy Loading (next/dynamic)](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [Next.js — Script component (next/script)](https://nextjs.org/docs/app/building-your-application/optimizing/scripts)
- [Next.js — Optimizing overview](https://nextjs.org/docs/app/building-your-application/optimizing)
- [web.dev — Core Web Vitals](https://web.dev/articles/vitals)
