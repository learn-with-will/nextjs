---
id: lesson-08
slug: images-fonts-and-assets
title: "Images, Fonts, and Static Assets"
level: beginner
order: 8
duration: 22
tags:
  - next-image
  - next-font
  - static-assets
  - optimization
  - public
summary: "Use next/image and next/font to serve optimized images and self-hosted fonts, and learn how the public/ folder serves static files."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Serve optimized images with the `next/image` component.
- Explain why `<Image>` needs dimensions and an `alt`.
- Self-host web fonts with `next/font` to avoid layout shift.
- Serve static files from the `public/` folder.
- Know what changes for images when you use a static export.

# Why It Matters

Images and fonts are usually the heaviest things a page loads, and done naively they cause slow loads and **layout shift** — content jumping as images and fonts arrive. Next.js ships built-in tools, `next/image` and `next/font`, that optimize both automatically: right-sized images in modern formats, and fonts that are self-hosted with reserved space. Using them is one of the easiest ways to make a site fast and stable.

# Concept Explanation

### `next/image`

The `<Image>` component optimizes images: it lazy-loads off-screen images, serves modern formats and appropriately sized versions, and reserves space so the layout doesn't jump.

```tsx
import Image from 'next/image';
import hero from './hero.png'; // a local import

export default function Banner() {
  return <Image src={hero} alt="A mountain at sunrise" />;
}
```

When you **import a local image**, Next.js reads its intrinsic `width` and `height` for you. For **remote images** (a URL string), you must pass `width` and `height` yourself (or use `fill`), and allow the domain in `next.config`'s `images.remotePatterns`. Every image needs an `alt` for accessibility, and you can mark your largest above-the-fold image with `priority` so it loads eagerly.

### `next/font`

`next/font` self-hosts fonts at build time — no request to a font CDN at runtime — and reserves space to eliminate layout shift:

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

Use `next/font/google` for Google Fonts (downloaded and self-hosted for you) or `next/font/local` for your own font files.

### The `public/` folder

Anything in `public/` is served as-is from the site root. `public/favicon.ico` is available at `/favicon.ico`, `public/docs/guide.pdf` at `/docs/guide.pdf`. Use it for files you reference by a stable URL — favicons, `robots.txt`, downloads — that don't need processing.

### A note on static export

If you deploy as a **static export** (`output: 'export'`), there's no server to optimize images at request time, so you set `images: { unoptimized: true }` in `next.config` (or use a custom loader) — the trade-off of hosting on a static host like GitHub Pages. `next/font` still works, because fonts are handled at build time.

# Key Terminology

- **`next/image`** — the `<Image>` component that optimizes images automatically.
- **Layout shift** — content jumping as images/fonts load; measured by Cumulative Layout Shift (CLS).
- **`priority`** — an `<Image>` prop that loads a key image eagerly (for your largest visible image).
- **`next/font`** — the module that self-hosts and optimizes fonts with no layout shift.
- **`public/`** — a folder whose files are served unchanged from the site root.

# Options and Trade-offs

| Task | Use | Notes |
| --- | --- | --- |
| App images (photos, art) | `next/image` | Auto-optimized; needs dimensions + `alt` |
| A big above-the-fold image | `next/image` with `priority` | Loads eagerly to improve LCP |
| Web fonts | `next/font` | Self-hosted, no layout shift, no runtime CDN call |
| Favicons, robots.txt, PDFs | `public/` folder | Served as-is from the root URL |
| Images in a static export | `next/image` + `unoptimized` | No server to optimize at runtime |

# Worked Example

A page with an optimized hero image, using the Inter font from the layout.

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

```tsx
// app/page.tsx
import Image from 'next/image';
import hero from './hero.jpg';

export default function HomePage() {
  return (
    <main>
      <h1>Welcome</h1>
      <Image src={hero} alt="Sunrise over the hills" priority />
    </main>
  );
}
```

The font is self-hosted (no layout shift), and the hero is optimized and loads eagerly because it's the largest visible image.

# Real World Analogy

`next/image` is like a **professional photo lab that resizes prints to fit each frame**. Hand it one high-resolution photo and it makes exactly the right size for a phone, a tablet, or a billboard — and it leaves the empty frame on the wall (reserved space) so the gallery layout never lurches while a print is being hung. `next/font` is the lab pre-printing your captions in the exact font and size, so nothing reflows when they go up.

# Examples

## Example 1 — Basic: A local image

```tsx
import Image from 'next/image';
import logo from './logo.png';

export default function Header() {
  return <Image src={logo} alt="Company logo" />;
}
```

**Why this matters:** A local import gives Next.js the image's dimensions automatically, so you get optimization and reserved space with almost no code.

## Example 2 — Real-world: A remote image

```tsx
import Image from 'next/image';

export default function Avatar() {
  return (
    <Image
      src="https://example.com/avatar.jpg"
      alt="User avatar"
      width={64}
      height={64}
    />
  );
}
```

**Why this matters:** Remote images need explicit `width`/`height` (Next.js can't read them at build time) and the domain allowed in `images.remotePatterns`.

## Example 3 — Pitfall: A remote image with no dimensions

```tsx
// BROKEN: a remote <Image> without width/height (and no fill) errors
<Image src="https://example.com/photo.jpg" alt="Photo" />
```

**Why this matters:** Without dimensions Next.js can't reserve space, so it requires `width`+`height` (or `fill` with a sized, positioned parent). The fix is to supply them.

# Common Mistakes

- **Omitting `alt`.** Images become inaccessible. **Fix:** always provide a meaningful `alt` (empty `alt=""` only for purely decorative images).
- **Remote `<Image>` without `width`/`height`.** It errors. **Fix:** pass dimensions or use `fill` with a positioned parent.
- **Loading Google Fonts with a `<link>` tag.** That adds a runtime request and risks layout shift. **Fix:** use `next/font`.
- **Forgetting `unoptimized` in a static export.** Optimization needs a server. **Fix:** set `images: { unoptimized: true }` when using `output: 'export'`.

# Best Practices

- Prefer `next/image` over `<img>` for automatic optimization and stable layout.
- Add `priority` to your **largest above-the-fold** image; leave the rest lazy.
- Use `next/font` for all web fonts to self-host and avoid layout shift.
- Put stable, unprocessed files (favicons, `robots.txt`) in `public/`.
- Write real `alt` text; use `alt=""` only for decorative images.

# Summary

- **`next/image`** optimizes images, lazy-loads them, and reserves space to prevent layout shift.
- Local image imports supply dimensions automatically; **remote** images need explicit `width`/`height` and an allowed domain.
- Every image needs an **`alt`**; mark the key hero image with **`priority`**.
- **`next/font`** self-hosts fonts at build time with no layout shift and no runtime CDN request.
- The **`public/`** folder serves files as-is from the site root; static exports need `images: { unoptimized: true }`.

# Flash Cards

Q: Why use next/image instead of a plain <img>?
A: It automatically optimizes images (size, format), lazy-loads them, and reserves space to prevent layout shift.

Q: What must you provide for a remote (URL) image with next/image that a local import gives you automatically?
A: The width and height (local imports read intrinsic dimensions for you); remote images also need the domain allowed in images.remotePatterns.

Q: What does next/font do for you?
A: It self-hosts fonts at build time (no runtime CDN request) and reserves space so there's no layout shift.

Q: Where do favicons and robots.txt go, and at what URL are they served?
A: In the public/ folder; a file at public/robots.txt is served at /robots.txt.

Q: What image setting do you need for a static export (output: 'export')?
A: images: { unoptimized: true } (or a custom loader), because there's no server to optimize images at request time.

Q: Which <Image> prop should the largest above-the-fold image use?
A: priority — it loads that image eagerly to improve the Largest Contentful Paint.

# Exercises

### Easy

Add a local image to a page with `next/image` (import it) and give it a descriptive `alt`. Confirm the browser reserves its space before it loads.

### Medium

Apply the Inter font from `next/font/google` in your root layout so the whole app uses it. Verify there's no font "flash" or layout jump on load.

### Challenging

Display a remote avatar image with `next/image`, configure `images.remotePatterns` in `next.config` for its domain, and add `priority` to a hero image while leaving a gallery of thumbnails lazy. Explain how each choice affects loading and layout stability.

# Further Reading

- [Next.js — Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Next.js — Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Next.js — Static Assets in public](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder)
- [web.dev — Cumulative Layout Shift (CLS)](https://web.dev/articles/cls)
