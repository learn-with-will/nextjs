---
id: lesson-16
slug: metadata-and-seo
title: "Metadata and SEO"
level: intermediate
order: 16
duration: 22
tags:
  - metadata
  - seo
  - generate-metadata
  - open-graph
  - title-template
summary: "Set page titles, descriptions, and social-share tags with the Metadata API—static via the metadata export and dynamic via generateMetadata."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Set a page's title and description with the `metadata` export.
- Generate metadata dynamically with `generateMetadata`.
- Share a title template across pages from a layout.
- Add Open Graph tags for rich social sharing.
- Explain why metadata must come from Server Components.

# Why It Matters

Search engines and social platforms read your page's `<head>` — the title, description, and Open Graph tags — to decide how to list and preview it. Hand-writing `<head>` tags is error-prone and easy to forget. Next.js's **Metadata API** lets you declare metadata in code (static or computed per page) and renders the correct tags for you, so every page is discoverable and shares beautifully.

# Concept Explanation

### Static metadata

Export a `metadata` object from a `page.tsx` or `layout.tsx` (both Server Components). Next.js turns it into the right `<head>` tags:

```tsx
// app/about/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About us',
  description: 'Who we are and what we build.',
};

export default function AboutPage() {
  return <h1>About us</h1>;
}
```

### Dynamic metadata with `generateMetadata`

When the title depends on data (a blog post's title, say), export an async `generateMetadata` function instead. Like a page, its `params` is a **Promise** in Next.js 15:

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post.title, description: post.excerpt };
}
```

### Title templates from a layout

Set a template in the root layout so every page's title is suffixed consistently:

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: { template: '%s | My Site', default: 'My Site' },
  description: 'The default description.',
};
```

Now a page with `title: 'Pricing'` renders `Pricing | My Site`, and pages without a title fall back to `My Site`.

### Open Graph and file conventions

Add `openGraph` (and `twitter`) fields for social previews. Next.js also supports **file-based metadata**: drop in `favicon.ico`, an `opengraph-image.png`, `robots.txt` (or `robots.ts`), and `sitemap.xml` (or `sitemap.ts`), and Next.js wires them up.

```tsx
export const metadata: Metadata = {
  openGraph: { title: 'My Site', images: ['/og.png'] },
};
```

# Key Terminology

- **Metadata API** — Next.js's system for declaring `<head>` metadata in code.
- **`metadata` export** — a static object of title/description/etc. from a page or layout.
- **`generateMetadata`** — an async function returning metadata computed from data.
- **Title template** — a layout-level pattern (`'%s | Site'`) applied to child titles.
- **Open Graph** — tags that control how a link previews on social platforms.
- **File-based metadata** — special files (`favicon.ico`, `opengraph-image`, `sitemap`, `robots`) Next.js recognizes.

# Options and Trade-offs

| Situation | Use | Notes |
| --- | --- | --- |
| Fixed title/description | `export const metadata` | Simplest; static |
| Title depends on data | `generateMetadata` | Async; `await params` |
| Consistent suffix across pages | `title.template` in a layout | Set once at the root |
| Social preview image | `openGraph` field or `opengraph-image` file | Rich link previews |
| Favicon, robots, sitemap | File conventions | Drop the file in `app/` |

# Worked Example

A site-wide title template plus per-post metadata.

```tsx
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { template: '%s | DevBlog', default: 'DevBlog' },
  description: 'Notes on building with Next.js.',
  metadataBase: new URL('https://example.com'),
};
```

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return {
    title: post.title,                                   // → "post title | DevBlog"
    description: post.excerpt,
    openGraph: { title: post.title, images: [post.cover] },
  };
}
```

Each post gets a proper title, description, and social image; the layout's template adds the `| DevBlog` suffix automatically.

# Real World Analogy

Metadata is the **book jacket and library catalog card**. The title, blurb, and cover image (Open Graph) are how browsers, search engines, and social feeds "shelve" and preview your page — just as a catalog card tells a library patron what a book is before they open it. `generateMetadata` is a librarian who writes each card from the actual book, and the title template is the library's house style stamped on every card.

# Examples

## Example 1 — Basic: Static metadata

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with our team.',
};
```

**Why this matters:** A plain object is all it takes to set a page's title and description correctly.

## Example 2 — Real-world: Metadata from data

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  return { title: product.name, description: product.summary };
}
```

**Why this matters:** Titles and descriptions match the actual content, which is exactly what search engines index.

## Example 3 — Pitfall: Exporting metadata from a Client Component

```tsx
'use client';
import type { Metadata } from 'next';

// IGNORED: metadata exports don't work in Client Components
export const metadata: Metadata = { title: 'Nope' };
```

**Why this matters:** The Metadata API only works in **Server Components**. Move the `metadata`/`generateMetadata` export to a Server Component `page`/`layout`, and keep interactivity in a separate Client Component.

# Common Mistakes

- **Exporting `metadata` from a Client Component.** It's ignored. **Fix:** export it from a Server Component page/layout.
- **Writing `<head>` tags by hand.** Fragile and duplicated. **Fix:** use the Metadata API.
- **Reading `params` synchronously in `generateMetadata`.** It's a Promise in Next.js 15. **Fix:** `await params`.
- **Relative OG image URLs with no base.** They may not resolve. **Fix:** set `metadataBase` in the root layout.

# Best Practices

- Set a **title template** and a sensible default in the root layout.
- Give every page a unique, descriptive **title** and **description**.
- Use `generateMetadata` for data-driven pages so previews match content.
- Add **Open Graph** images for shareable pages; set `metadataBase`.
- Prefer **file conventions** (`favicon`, `sitemap`, `robots`) over manual tags.

# Summary

- The **Metadata API** renders `<head>` tags from a `metadata` object or `generateMetadata` function.
- Use **`metadata`** for static values and **`generateMetadata`** for data-driven ones (`await params`).
- A layout's **`title.template`** applies a consistent suffix and default across pages.
- **Open Graph** fields and image files produce rich social previews; set **`metadataBase`**.
- Metadata only works in **Server Components** — never in Client Components.

# Flash Cards

Q: How do you set a static page title and description?
A: Export a `metadata` object (typed Metadata from 'next') from a Server Component page or layout.

Q: When do you use generateMetadata instead of the metadata object?
A: When the metadata depends on data (e.g. a post's title); it's an async function, and in Next.js 15 its params is a Promise you await.

Q: What does title: { template: '%s | My Site', default: 'My Site' } in the root layout do?
A: It suffixes each child page's title with " | My Site", and uses "My Site" when a page has no title.

Q: Why can't a Client Component export metadata?
A: The Metadata API only runs in Server Components; a metadata export in a Client Component is ignored.

Q: What are Open Graph tags for?
A: Controlling how a page previews (title, description, image) when its link is shared on social platforms.

Q: Name two file-based metadata conventions Next.js recognizes.
A: Any two of: favicon.ico, opengraph-image, robots.txt/robots.ts, sitemap.xml/sitemap.ts.

# Exercises

### Easy

Add a static `metadata` export (title + description) to a page and confirm the browser tab title changes.

### Medium

Set a `title.template` and `default` in the root layout, then give two pages their own titles. Verify the suffix is applied and a title-less page shows the default.

### Challenging

For a dynamic `[slug]` route, implement `generateMetadata` that fetches the item and sets `title`, `description`, and an `openGraph` image. Set `metadataBase` in the layout and confirm the OG image URL resolves absolutely.

# Further Reading

- [Next.js — Metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [Next.js — generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js — Metadata files (favicon, sitemap, robots)](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
- [Next.js — metadataBase](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase)
