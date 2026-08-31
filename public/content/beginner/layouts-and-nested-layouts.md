---
id: lesson-04
slug: layouts-and-nested-layouts
title: "Layouts and Nested Layouts"
level: beginner
order: 4
duration: 24
tags:
  - layouts
  - nested-layouts
  - root-layout
  - app-router
  - children
summary: "Use layout.tsx to share UI like navigation across pages, and nest layouts so each section of your app can add its own wrapper."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Create the required **root layout** and explain what it must contain.
- Share UI (navigation, footers) across many pages with a layout.
- Nest layouts so each section adds its own wrapper.
- Use the `children` prop to render nested pages inside a layout.
- Explain why layouts preserve state and don't re-render on navigation.

# Why It Matters

Almost every app repeats the same shell on every page: a header, a navigation bar, a footer. Copy-pasting that into every `page.tsx` is tedious and drifts out of sync. **Layouts** let you write shared UI once and wrap many pages in it. And because layouts *nest*, a dashboard section can add a sidebar on top of the global header without either one knowing about the other.

# Concept Explanation

### The root layout is required

Every App Router app must have a **root layout** at `app/layout.tsx`. It wraps every page, and — because it's the top of the HTML document — it must render the `<html>` and `<body>` tags itself:

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

The `children` prop is where Next.js renders the current page (or a more deeply nested layout).

### Layouts nest

A `layout.tsx` inside any folder wraps that segment **and everything under it**. So layouts stack from the root down to the page:

```text
app/
  layout.tsx            wraps everything  (header + footer)
  dashboard/
    layout.tsx          wraps /dashboard/*  (adds a sidebar)
    page.tsx            /dashboard
    settings/
      page.tsx          /dashboard/settings
```

Visiting `/dashboard/settings` renders: root layout → dashboard layout → the settings page, each nested inside the previous one's `children`.

### Layouts preserve state across navigation

A key benefit: when you navigate between routes that **share** a layout, that layout does **not** re-render — it stays mounted. A sidebar's scroll position, an open menu, or a running timer inside the layout is preserved as you move between its child pages. Only the changed segment below re-renders.

> Need the opposite — a fresh instance on every navigation? Use a `template.tsx` instead of `layout.tsx`; a template re-mounts on each navigation.

### Layouts are Server Components too

Like pages, layouts are Server Components by default. They can export **metadata** (covered later) and fetch data. If a layout needs interactivity or a browser-only hook, move that part into a Client Component and render it inside the layout.

# Key Terminology

- **Layout** — a `layout.tsx` component that wraps a segment and its children with shared UI.
- **Root layout** — the required `app/layout.tsx`; it must render `<html>` and `<body>`.
- **`children`** — the prop where a layout renders the nested layout or page.
- **Nested layout** — a layout deeper in the tree that adds UI on top of its parent layouts.
- **Template** — `template.tsx`; like a layout but re-mounts on every navigation.

# Options and Trade-offs

| File | Re-renders on navigation between its children? | Use it for |
| --- | --- | --- |
| `layout.tsx` | No — it stays mounted (state preserved) | Persistent shells: nav, sidebars, footers |
| `template.tsx` | Yes — a new instance each time | Per-navigation effects or reset animations |
| Repeating UI in each `page.tsx` | N/A | Avoid — it duplicates and drifts |

# Worked Example

Let's build a global shell plus a dashboard sidebar.

1. The root layout adds a site header on every page:

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header><nav>My Site</nav></header>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

2. A dashboard layout adds a sidebar for `/dashboard/*` only:

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <aside>Dashboard menu</aside>
      <section>{children}</section>
    </div>
  );
}
```

Now `/dashboard` and `/dashboard/settings` both show the site header *and* the dashboard sidebar, and switching between them keeps the sidebar mounted.

# Real World Analogy

Nested layouts are like the **frames around a painting inside a gallery inside a building**. The building (root layout) surrounds everything. Inside, a gallery wing (dashboard layout) adds its own walls and signage. The painting itself (the page) hangs in the middle. Walk from one painting to another in the same wing and the building and wing stay exactly as they are — only the artwork on the wall changes.

# Examples

## Example 1 — Basic: A minimal root layout

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Why this matters:** This is the smallest legal root layout — it renders `<html>`/`<body>` and drops the page into `children`. Every app needs exactly one.

## Example 2 — Real-world: A section layout with shared navigation

```tsx
// app/blog/layout.tsx  — wraps /blog and every post under it
import Link from 'next/link';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav>
        <Link href="/blog">All posts</Link>
      </nav>
      {children}
    </div>
  );
}
```

**Why this matters:** Every blog page gets the "All posts" link automatically, and it stays put as readers move between posts.

## Example 3 — Pitfall: A root layout missing `<html>`/`<body>`

```tsx
// app/layout.tsx — BROKEN: the root layout must render <html> and <body>
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>; // missing <html>/<body>
}
```

**Why this matters:** The root layout is the document itself. Omitting `<html>` and `<body>` is an error — only nested (non-root) layouts may skip them.

# Common Mistakes

- **Forgetting `<html>` and `<body>` in the root layout.** It's the document shell. **Fix:** the root `app/layout.tsx` must render both tags.
- **Not rendering `{children}`.** Then nested pages disappear. **Fix:** every layout must render its `children` somewhere.
- **Putting `useState` in a layout without `"use client"`.** Layouts are Server Components. **Fix:** move interactive parts into a Client Component rendered inside the layout.
- **Expecting a layout to re-run on every navigation.** It won't — that's a feature. **Fix:** if you truly need a reset per navigation, use `template.tsx`.

# Best Practices

- Keep exactly one **root layout** and put truly global UI (fonts, header, footer) there.
- Add **nested layouts** per section instead of repeating shells in each page.
- Always render `{children}` and type it as `React.ReactNode`.
- Keep layouts as **Server Components**; isolate interactivity in small Client Components.
- Use a layout's persistence to your advantage — put stateful shells (sidebars) there so state survives navigation.

# Summary

- Every app needs a **root layout** at `app/layout.tsx` that renders `<html>` and `<body>`.
- Layouts wrap a segment and its children via the **`children`** prop and **nest** from the root down.
- Shared layouts **do not re-render** when navigating between their child pages, so their state is preserved.
- Layouts are **Server Components**; move interactivity into Client Components.
- Use **`template.tsx`** when you need a fresh instance on every navigation instead of a persistent layout.

# Flash Cards

Q: What must the root layout (app/layout.tsx) render that other layouts don't have to?
A: The `<html>` and `<body>` tags — the root layout is the document shell.

Q: How does a layout render the nested page or layout inside it?
A: By rendering its `children` prop.

Q: What happens to a shared layout's state when you navigate between its child pages?
A: It's preserved — the layout stays mounted and does not re-render; only the changed segment below updates.

Q: How do you scope a layout to only one section, like /dashboard?
A: Put a layout.tsx inside that folder (app/dashboard/layout.tsx); it wraps that segment and everything under it.

Q: What is template.tsx and how does it differ from layout.tsx?
A: It's like a layout but re-mounts (a new instance) on every navigation, instead of persisting.

Q: Can a layout use useState directly?
A: Not by default — layouts are Server Components; put stateful/interactive UI in a Client Component ("use client") rendered inside the layout.

# Exercises

### Easy

Create a root layout that renders a `<header>` with your site name above `{children}`. Confirm the header appears on every page.

### Medium

Add a `/dashboard` section with its own `layout.tsx` that shows a sidebar. Create `/dashboard` and `/dashboard/settings` pages and verify both show the global header and the sidebar.

### Challenging

Put a Client Component counter (with `useState`) inside your dashboard layout, and a second counter inside the `/dashboard` page. Navigate to `/dashboard/settings` and back. Explain which counter keeps its value and why.

# Further Reading

- [Next.js — Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages)
- [Next.js — layout.js (file convention)](https://nextjs.org/docs/app/api-reference/file-conventions/layout)
- [Next.js — template.js](https://nextjs.org/docs/app/api-reference/file-conventions/template)
- [Next.js — Linking and Navigating](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating)
