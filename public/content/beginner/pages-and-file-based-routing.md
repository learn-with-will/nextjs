---
id: lesson-03
slug: pages-and-file-based-routing
title: "Pages and File-Based Routing"
level: beginner
order: 3
duration: 22
tags:
  - routing
  - pages
  - app-router
  - file-based-routing
  - segments
summary: "Learn how folders and page.tsx files in the app/ directory map directly to your application's URLs, including nested routes."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain how the `app/` directory maps folders to URL segments.
- Create routes by adding `page.tsx` files.
- Build nested routes several levels deep.
- Name the special files Next.js reserves and know that other files are safely colocated.
- Recognize why a `page.tsx` needs a default export.

# Why It Matters

In most frameworks you maintain a separate list of routes and wire each one to a component. That list drifts out of sync, and newcomers can't tell which URLs exist. Next.js removes the middleman: **your folder structure is your routing table.** To find the code for `/blog/first-post`, you open `app/blog/first-post/`. New developers can read the URL space just by looking at the file tree.

# Concept Explanation

### Folders are URL segments

Inside `app/`, each folder becomes a **segment** of the URL path. A folder only becomes a *visitable page* when it contains a `page.tsx` file that default-exports a component.

```text
app/
  page.tsx              →  /
  blog/
    page.tsx            →  /blog
    first-post/
      page.tsx          →  /blog/first-post
```

The nesting of folders is the nesting of the URL. There is no separate configuration to keep in sync.

### `page.tsx` makes a route public

A folder with no `page.tsx` is **not** reachable as a URL — it just organizes files. Adding `page.tsx` (or a `route.ts`, covered later) is what publishes that segment. This lets you keep helper components, tests, or styles next to the route that uses them without accidentally creating pages — a practice called **colocation**.

```text
app/
  blog/
    page.tsx            →  /blog  (public)
    PostCard.tsx        →  a helper component; NOT a route
    utils.ts            →  helper code; NOT a route
```

### Reserved file names

Next.js gives special meaning to a small set of filenames inside route folders:

- `page.tsx` — the page UI for that route.
- `layout.tsx` — shared UI that wraps the segment and its children (next lesson).
- `loading.tsx` — a loading state shown while the segment loads.
- `error.tsx` — an error UI for the segment.
- `not-found.tsx` — the UI for a "not found" response.
- `route.ts` — an API endpoint (Route Handler) instead of a page.

Any *other* filename is just a regular file you can safely colocate.

### The default export

The component a `page.tsx` exports must be the **default export** — that's how Next.js knows which component to render for the route.

# Key Terminology

- **Route** — a URL path that your app responds to, e.g. `/blog`.
- **Segment** — one part of a route path, represented by a folder in `app/`.
- **`page.tsx`** — the reserved file whose default-exported component renders a route's UI.
- **Colocation** — keeping non-route files (helpers, styles) inside a route folder without them becoming routes.
- **Nested route** — a route formed by folders inside folders, e.g. `/blog/first-post`.

# Options and Trade-offs

| You want | Do this | Result |
| --- | --- | --- |
| A top-level page | `app/about/page.tsx` | `/about` |
| A nested page | `app/blog/first/page.tsx` | `/blog/first` |
| A private helper next to a route | Add any non-reserved file to the folder | Not a route (colocated) |
| An API endpoint instead of a page | `app/api/hello/route.ts` | `/api/hello` (no page UI) |

# Worked Example

Let's build a tiny blog with a listing page and one post.

1. The blog index at `/blog`:

```tsx
// app/blog/page.tsx
export default function BlogPage() {
  return (
    <main>
      <h1>Blog</h1>
      <ul>
        <li>Hello World</li>
      </ul>
    </main>
  );
}
```

2. A specific post at `/blog/hello-world`:

```tsx
// app/blog/hello-world/page.tsx
export default function HelloWorldPost() {
  return (
    <article>
      <h1>Hello World</h1>
      <p>My first post built with file-based routing.</p>
    </article>
  );
}
```

Two folders, two `page.tsx` files, two working URLs — no router configuration anywhere.

# Real World Analogy

File-based routing is like a **building's room numbers matching its floor plan**. Room 3-201 is on floor 3, wing 2, room 01 — you can find it just by reading the number and walking the halls. You don't consult a separate master directory that someone has to keep updated; the structure *is* the directory. In Next.js, the folder path is the room number and the URL is how you walk there.

# Examples

## Example 1 — Basic: A single page

```tsx
// app/contact/page.tsx  →  /contact
export default function ContactPage() {
  return <h1>Contact us</h1>;
}
```

**Why this matters:** One folder plus `page.tsx` is the entire recipe for a new URL.

## Example 2 — Real-world: Deeper nesting with a colocated helper

```tsx
// app/docs/getting-started/page.tsx  →  /docs/getting-started
import { Callout } from './Callout'; // colocated, not a route

export default function GettingStarted() {
  return (
    <main>
      <h1>Getting Started</h1>
      <Callout>Read this first.</Callout>
    </main>
  );
}
```

**Why this matters:** `Callout.tsx` lives beside the page that uses it. Because its name isn't reserved, it stays a private helper — not an accidental `/docs/getting-started/Callout` route.

## Example 3 — Pitfall: Wrong file name or missing default export

```tsx
// app/blog/index.tsx  ← WRONG: "index.tsx" is not a route in the App Router
// app/blog/Page.tsx   ← WRONG: must be lowercase "page.tsx"

// app/blog/page.tsx   ← RIGHT, but this also fails:
export function BlogPage() {   // named export, not default
  return <h1>Blog</h1>;
}
```

**Why this matters:** The App Router looks for a lowercase `page.tsx` with a **default** export. `index.tsx`, `Page.tsx`, or a named-only export will not render as a route.

# Common Mistakes

- **Using `index.tsx` for a route.** That's a Pages Router habit. **Fix:** in the App Router, the file is `page.tsx`.
- **Naming the file `Page.tsx` (capital P).** File names are case-sensitive. **Fix:** use lowercase `page.tsx`.
- **Forgetting the default export.** A page with only a named export won't render. **Fix:** `export default function Page() { … }`.
- **Expecting a folder alone to be a URL.** A folder without `page.tsx` is not reachable. **Fix:** add `page.tsx` to publish it.

# Best Practices

- Mirror your information architecture in your folder structure — the tree should read like your sitemap.
- Colocate a route's private helpers inside its folder to keep related code together.
- Use clear, kebab-case folder names; they become the URL segments users and search engines see.
- Reserve `page.tsx` strictly for route UI; put shared logic in plainly named files.
- Add a top-level `app/not-found.tsx` later so unknown URLs get a friendly page.

# Summary

- In `app/`, **folders are URL segments** and their nesting is the URL's nesting.
- A folder becomes a visitable route only when it contains a **`page.tsx`** with a **default export**.
- Files with non-reserved names are **colocated** — safely stored beside a route without becoming one.
- Reserved names include `page`, `layout`, `loading`, `error`, `not-found`, and `route`.
- The App Router uses lowercase `page.tsx`, not `index.tsx`.

# Flash Cards

Q: In the App Router, what makes a folder in app/ a visitable route?
A: Adding a `page.tsx` file that default-exports a component (a folder alone is not a route).

Q: What URL does app/blog/first-post/page.tsx map to?
A: `/blog/first-post` — folder nesting mirrors URL nesting.

Q: What is colocation?
A: Keeping non-route files (helpers, styles, tests) inside a route folder; because their names aren't reserved, they don't become routes.

Q: Why won't app/blog/index.tsx work as a route?
A: The App Router uses `page.tsx`, not `index.tsx`; `index.tsx` is a Pages Router convention.

Q: Name three reserved file names in a route folder.
A: Any three of: `page`, `layout`, `loading`, `error`, `not-found`, `route` (also `template`).

Q: What export must a page.tsx component use?
A: A default export — that's how Next.js knows which component renders the route.

# Exercises

### Easy

Create three routes: `/`, `/about`, and `/pricing`, each with its own `page.tsx` rendering a heading. Visit all three in the browser.

### Medium

Build a nested structure: `/shop`, `/shop/shoes`, and `/shop/shoes/running`. Add a colocated helper component in the deepest folder and use it in that page. Confirm the helper does not create its own route.

### Challenging

Given the folder tree below, list every public URL it produces and explain which files are colocated helpers rather than routes:

```text
app/
  page.tsx
  team/
    page.tsx
    Member.tsx
  team/leads/
    page.tsx
```

# Further Reading

- [Next.js — Pages and Layouts](https://nextjs.org/docs/app/getting-started/layouts-and-pages)
- [Next.js — Defining Routes](https://nextjs.org/docs/app/building-your-application/routing/defining-routes)
- [Next.js — Project Organization and Colocation](https://nextjs.org/docs/app/building-your-application/routing/colocation)
- [Next.js — Routing Fundamentals](https://nextjs.org/docs/app/building-your-application/routing)
