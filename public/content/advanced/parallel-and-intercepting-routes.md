---
id: lesson-20
slug: parallel-and-intercepting-routes
title: "Parallel and Intercepting Routes"
level: advanced
order: 20
duration: 24
tags:
  - parallel-routes
  - intercepting-routes
  - slots
  - modals
  - advanced-routing
summary: "Render multiple pages in one layout with parallel routes (@slots), and load a route in the current context with intercepting routes—the classic modal pattern."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Render several independent pages in one layout with **parallel routes**.
- Provide fallbacks for unmatched slots using `default.tsx`.
- Load a route in the current context with **intercepting routes**.
- Recognize the intercepting-route conventions `(.)`, `(..)`, `(...)`.
- Build the classic "route as a modal" pattern.

# Why It Matters

Some UIs don't fit one-page-per-URL. A dashboard might show a feed and analytics side by side, each navigating independently. Or you want clicking a photo to open a **modal** over the current page — but a direct link to that photo should show a full page. **Parallel** and **intercepting** routes are the App Router's tools for exactly these advanced layouts, without hacks.

# Concept Explanation

### Parallel routes with `@slots`

A folder named `@name` is a **slot** — a named area of a layout that renders its own route independently. Slots are passed to the layout as props, alongside `children`:

```text
app/dashboard/
  layout.tsx
  page.tsx
  @analytics/page.tsx
  @team/page.tsx
```

```tsx
// app/dashboard/layout.tsx
export default function Layout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div>
      {children}
      <section>{analytics}</section>
      <section>{team}</section>
    </div>
  );
}
```

Each slot navigates independently and can have its own `loading.tsx` and `error.tsx`. The `@` prefix does **not** affect the URL.

### `default.tsx` for unmatched slots

When you navigate or reload and a slot has no matching segment for the current URL, Next.js renders that slot's `default.tsx`. Without one, a hard reload can 404. Provide a `default.tsx` per slot as its fallback.

### Intercepting routes

An **intercepting route** loads a route's content **within the current layout** instead of navigating to it fully. You mark the interception with a path convention on the folder:

- `(.)` — intercept a segment at the **same** level
- `(..)` — one level **up**
- `(..)(..)` — two levels up
- `(...)` — from the **root**

### The modal pattern

Combine a parallel `@modal` slot with an intercepting route: clicking a link **intercepts** the target route and shows it in the modal slot (a dialog over the current page), while a **direct visit or refresh** to that URL renders the real, full page. Same URL, two presentations — shareable and refresh-safe.

# Key Terminology

- **Parallel route (slot)** — an `@name` folder rendered as a named prop in a layout.
- **`default.tsx`** — the fallback a slot renders when it has no match for the current URL.
- **Intercepting route** — a route loaded within the current layout using `(.)`, `(..)`, or `(...)`.
- **Modal pattern** — intercepting a route into a `@modal` slot to show it as a dialog.
- **Route group `(folder)`** — organizes files without affecting the URL (related, for structure).

# Options and Trade-offs

| Convention | Meaning |
| --- | --- |
| `@name` | A parallel-route slot (named layout prop) |
| `default.tsx` | Fallback for an unmatched slot |
| `(.)segment` | Intercept a segment at the same level |
| `(..)segment` | Intercept one level up |
| `(...)segment` | Intercept from the root |

# Worked Example

A dashboard rendering two independent slots.

```text
app/dashboard/
  layout.tsx
  page.tsx              → the main area (children)
  @metrics/page.tsx     → a metrics panel
  @metrics/default.tsx  → fallback when unmatched
  @activity/page.tsx    → an activity feed
  @activity/default.tsx
```

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  metrics,
  activity,
}: {
  children: React.ReactNode;
  metrics: React.ReactNode;
  activity: React.ReactNode;
}) {
  return (
    <div className="grid">
      <main>{children}</main>
      <aside>{metrics}</aside>
      <aside>{activity}</aside>
    </div>
  );
}
```

`metrics` and `activity` render their own pages simultaneously, each with independent loading and error states — and `default.tsx` keeps reloads from 404-ing.

# Real World Analogy

Parallel routes are like a **TV with picture-in-picture**: the main show and a second channel play at once, each changing independently. Intercepting routes are like a **"quick look" preview**: clicking an item pops a preview card over your current view instead of leaving the page — but if you share the item's link, your friend opens it as its own full page. The `default.tsx` is the "no signal" placeholder a picture-in-picture box shows when nothing's tuned in.

# Examples

## Example 1 — Basic: A single slot

```tsx
// app/layout.tsx — renders a notifications slot beside the page
export default function Layout({
  children,
  notifications,
}: {
  children: React.ReactNode;
  notifications: React.ReactNode;
}) {
  return <>{children}{notifications}</>;
}
// with app/@notifications/page.tsx and app/@notifications/default.tsx
```

**Why this matters:** The `@notifications` slot renders independently of the main page — the foundation of parallel routing.

## Example 2 — Real-world: A photo modal

```text
app/
  photos/[id]/page.tsx           → full photo page (direct visit / refresh)
  @modal/(.)photos/[id]/page.tsx → same route intercepted into a modal slot
  @modal/default.tsx             → renders nothing when no modal is open
```

**Why this matters:** Clicking a photo shows it in a modal over the gallery; refreshing or sharing the URL shows the full page — one URL, the right presentation each time.

## Example 3 — Pitfall: Missing `default.tsx`

```text
app/dashboard/@metrics/page.tsx   ← slot with no default.tsx
```

**Why this matters:** On a hard reload of a URL where `@metrics` has no match, the missing `default.tsx` can cause a 404. Add a `default.tsx` to each slot as its fallback.

# Common Mistakes

- **Expecting `@slot` to change the URL.** It doesn't. **Fix:** treat slots as layout regions, not path segments.
- **Forgetting `default.tsx`.** Reloads can 404. **Fix:** add a `default.tsx` to every slot.
- **Misreading interception levels.** `(.)`, `(..)`, `(...)` differ. **Fix:** match the convention to how far up the target segment is.
- **Overusing these features.** They add complexity. **Fix:** use them only when a real UI needs concurrent or intercepted routes.

# Best Practices

- Use parallel routes for genuinely **independent** regions (dashboards, side panels).
- Always pair slots with **`default.tsx`** so reloads behave.
- Reserve intercepting routes for **modal/preview** flows where the URL should still resolve fully.
- Give each slot its own **`loading`/`error`** for isolated states.
- Keep the folder conventions documented — `@` and `(.)` are easy to misread.

# Summary

- **Parallel routes** (`@name` folders) render independent pages as named **slots** in a layout.
- Add a **`default.tsx`** per slot so unmatched slots have a fallback (and reloads don't 404).
- **Intercepting routes** load a route in the current layout via `(.)`, `(..)`, `(..)(..)`, or `(...)`.
- The **modal pattern** intercepts a route into a `@modal` slot, while direct visits show the full page.
- These are advanced tools — reach for them only when a UI truly needs them.

# Flash Cards

Q: What does a folder named @analytics create, and how is it used?
A: A parallel-route slot; it's passed to the layout as a named prop (analytics) alongside children and renders independently. The @ doesn't affect the URL.

Q: What is default.tsx for in a parallel route?
A: It's the fallback a slot renders when it has no matching segment for the current URL — without it, a hard reload can 404.

Q: What do the intercepting conventions (.), (..), and (...) mean?
A: Intercept a segment at the same level, one level up, and from the root, respectively (there's also (..)(..) for two levels up).

Q: How do you build a route that opens as a modal but is still shareable?
A: Combine a @modal parallel slot with an intercepting route: clicking intercepts into the modal, while a direct visit/refresh renders the full page.

Q: Does the @ prefix on a slot folder change the URL?
A: No — parallel-route slots are layout regions, not URL segments.

Q: Why give each slot its own loading.tsx/error.tsx?
A: So each parallel region can show independent loading and error states without affecting the others.

# Exercises

### Easy

Add a `@sidebar` parallel slot to a layout with its own `page.tsx` and `default.tsx`, and render it beside the main content.

### Medium

Create a dashboard with two slots (`@metrics`, `@activity`), each with its own `loading.tsx`. Confirm they render together and can show independent loading states.

### Challenging

Implement the photo-modal pattern: a `photos/[id]` full page plus a `@modal/(.)photos/[id]` interception and a `@modal/default.tsx`. Verify that clicking a photo opens a modal while refreshing that URL shows the full page.

# Further Reading

- [Next.js — Parallel Routes](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes)
- [Next.js — Intercepting Routes](https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes)
- [Next.js — default.js file convention](https://nextjs.org/docs/app/api-reference/file-conventions/default)
- [Next.js — Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
