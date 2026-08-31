---
id: lesson-09
slug: dynamic-routes
title: "Dynamic Routes and Route Params"
level: intermediate
order: 9
duration: 24
tags:
  - dynamic-routes
  - params
  - generate-static-params
  - catch-all
  - segments
summary: "Create routes with dynamic segments like [id], read the (async) params in Next.js 15, and pre-render them with generateStaticParams."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Create dynamic routes with `[param]` folders.
- Read route params — remembering they're **async** in Next.js 15.
- Match many paths with catch-all (`[...slug]`) and optional catch-all segments.
- Pre-render dynamic pages at build time with `generateStaticParams`.
- Show a 404 for unknown items with `notFound()`.

# Why It Matters

Most real apps have pages that follow a pattern: `/blog/my-post`, `/products/42`, `/users/ada`. You can't create a folder for every possible value. **Dynamic routes** let one file serve infinitely many URLs by treating part of the path as a variable — and `generateStaticParams` lets you pre-render the known ones at build time for maximum speed.

# Concept Explanation

### Dynamic segments with `[param]`

Wrap a folder name in square brackets to make it a variable segment:

```text
app/blog/[slug]/page.tsx   →  /blog/anything
```

The matched value arrives in the page's `params`. **In Next.js 15, `params` is a Promise**, so you `await` it:

```tsx
// app/blog/[slug]/page.tsx
export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <h1>Post: {slug}</h1>;
}
```

### Catch-all and optional catch-all

- `[...slug]` matches **one or more** segments; `params.slug` is a `string[]`. `app/docs/[...slug]` matches `/docs/a`, `/docs/a/b`, etc.
- `[[...slug]]` (double brackets) is **optional** — it also matches the parent route `/docs` (with `slug` undefined).

### Pre-rendering with `generateStaticParams`

To render dynamic pages as static HTML at build time, export `generateStaticParams`, returning the list of params to build. This is the App Router replacement for the Pages Router's `getStaticPaths`:

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then((r) => r.json());
  return posts.map((post: { slug: string }) => ({ slug: post.slug }));
}
```

At build time, Next.js renders one static page per returned entry.

### Handling missing items with `notFound()`

If a param doesn't correspond to real data, call `notFound()` (from `next/navigation`). It stops rendering and shows the nearest `not-found.tsx`:

```tsx
import { notFound } from 'next/navigation';
// …
if (!post) notFound();
```

# Key Terminology

- **Dynamic segment** — a `[param]` folder whose value varies per URL.
- **`params`** — the object of matched segment values; **a Promise in Next.js 15** (await it).
- **Catch-all segment** — `[...name]`, matching one or more path parts as an array.
- **Optional catch-all** — `[[...name]]`, which also matches the parent path.
- **`generateStaticParams`** — returns the params to pre-render at build (replaces `getStaticPaths`).
- **`notFound()`** — renders the nearest `not-found.tsx` and returns a 404.

# Options and Trade-offs

| Folder | Matches | `params` shape |
| --- | --- | --- |
| `[id]` | one segment | `{ id: string }` |
| `[...slug]` | one or more segments | `{ slug: string[] }` |
| `[[...slug]]` | zero or more (incl. parent) | `{ slug?: string[] }` |
| `[id]` + `generateStaticParams` | listed values, pre-rendered | `{ id: string }` |

# Worked Example

A blog where each post is pre-rendered at build time.

```tsx
// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';

async function getPost(slug: string) {
  const res = await fetch(`https://api.example.com/posts/${slug}`);
  return res.ok ? res.json() : null;
}

// 1. Which slugs to build ahead of time
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then((r) => r.json());
  return posts.map((p: { slug: string }) => ({ slug: p.slug }));
}

// 2. The page — params is awaited (Next.js 15)
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}
```

`generateStaticParams` lists the posts to pre-render; the page awaits `params`, fetches the post, and 404s cleanly if it's missing.

# Real World Analogy

A dynamic route is like a **hotel key card template**. There's one physical design (`[room]`), and the front desk programs it with a specific room number when a guest checks in. One template opens any room. `generateStaticParams` is the housekeeping list printed each morning of exactly which rooms are occupied today — so those are prepared in advance — while `notFound()` is what happens when someone tries a room number that doesn't exist.

# Examples

## Example 1 — Basic: Reading one param

```tsx
// app/products/[id]/page.tsx
export default async function Product({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <h1>Product #{id}</h1>;
}
```

**Why this matters:** One file serves `/products/1`, `/products/2`, and every other id — and it awaits `params` as Next.js 15 requires.

## Example 2 — Real-world: A docs catch-all

```tsx
// app/docs/[...slug]/page.tsx
export default async function Docs({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params; // e.g. ['guides', 'routing']
  return <h1>/{slug.join('/')}</h1>;
}
```

**Why this matters:** A catch-all serves an entire nested docs tree from a single file; `slug` is an array of the path parts.

## Example 3 — Pitfall: Not awaiting params

```tsx
// BROKEN in Next.js 15: params is a Promise
export default function Product({ params }: { params: { id: string } }) {
  return <h1>Product #{params.id}</h1>; // params.id is not available synchronously
}
```

**Why this matters:** In Next.js 15 `params` is async. Make the component `async` and `const { id } = await params;`. (In older versions it was synchronous — a common source of copy-paste bugs.)

# Common Mistakes

- **Reading `params.id` synchronously in Next.js 15.** It's a Promise now. **Fix:** `const { id } = await params` in an `async` component.
- **Using `getStaticPaths`.** That's Pages Router. **Fix:** export `generateStaticParams`.
- **Returning a 200 for missing data.** Users and crawlers see a broken page. **Fix:** call `notFound()` when data is absent.
- **Confusing `[slug]` and `[...slug]`.** One is a string, the other an array. **Fix:** type `params` to match the folder shape.

# Best Practices

- Type `params` explicitly (as a `Promise<…>`) so TypeScript catches mistakes.
- Use `generateStaticParams` to pre-render known dynamic pages for speed and SEO.
- Call `notFound()` for missing records so you return real 404s.
- Choose catch-all routes for deep, variable hierarchies (docs, file trees); a single `[id]` for flat collections.
- Keep data-loading logic in a small helper function shared by the page and `generateStaticParams`.

# Summary

- `[param]` folders create **dynamic routes**; the value arrives in `params`.
- In **Next.js 15, `params` is a Promise** — `await` it in an `async` component.
- `[...slug]` matches multiple segments (an array); `[[...slug]]` also matches the parent.
- **`generateStaticParams`** pre-renders listed dynamic pages at build time (replacing `getStaticPaths`).
- Call **`notFound()`** to show a 404 when a param has no matching data.

# Flash Cards

Q: How do you create a dynamic route segment for a blog post slug?
A: Make a folder named [slug] — e.g. app/blog/[slug]/page.tsx — and read params.slug.

Q: In Next.js 15, is params synchronous or a Promise, and how do you read it?
A: It's a Promise — make the component async and do `const { slug } = await params`.

Q: What's the difference between [...slug] and [[...slug]]?
A: [...slug] matches one or more segments (a required array); [[...slug]] is optional and also matches the parent route.

Q: Which function pre-renders dynamic pages at build time, and what did it replace?
A: generateStaticParams — the App Router replacement for the Pages Router's getStaticPaths.

Q: How do you return a 404 when a dynamic item doesn't exist?
A: Call notFound() from next/navigation; it renders the nearest not-found.tsx.

Q: For app/docs/[...slug], what is the type of params.slug?
A: string[] — an array of the matched path segments.

# Exercises

### Easy

Create `app/users/[id]/page.tsx` that reads `id` (remember to `await params`) and renders "User {id}". Visit a few different ids.

### Medium

Add `generateStaticParams` to a `app/blog/[slug]/page.tsx` that returns three hard-coded slugs, and render the slug on the page. Run `npm run build` and confirm three static pages were generated.

### Challenging

Build `app/docs/[...slug]/page.tsx` that renders the joined path, and call `notFound()` when the first segment isn't in an allow-list (e.g. only `guides` and `api` are valid). Add an `app/docs/not-found.tsx`. Test valid and invalid paths.

# Further Reading

- [Next.js — Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Next.js — generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Next.js — params (page)](https://nextjs.org/docs/app/api-reference/file-conventions/page)
- [Next.js — notFound](https://nextjs.org/docs/app/api-reference/functions/not-found)
