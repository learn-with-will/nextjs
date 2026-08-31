---
id: lesson-24
slug: deploying-to-production
title: "Deploying to Production"
level: advanced
order: 24
duration: 24
tags:
  - deployment
  - static-export
  - vercel
  - self-hosting
  - environment-variables
summary: "Ship a Next.js app: compare Vercel, Node self-hosting, and static export, handle environment variables, and know each target's trade-offs."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Build a production bundle with `next build`.
- Compare deploying to Vercel, a Node server, and a static export.
- Configure a **static export** and know its limitations.
- Manage environment variables and the `NEXT_PUBLIC_` prefix.
- Choose the right target for your app — the capstone of this course.

# Why It Matters

A great app helps no one until it's deployed. Next.js runs in several environments, and each supports a different subset of features. Pick the wrong one and Server Actions silently break or images don't optimize. This final lesson ties the course together: you'll match everything you've learned — rendering, data, actions, caching — to a deployment target that supports it.

# Concept Explanation

### Build first

Every deploy starts with the production build:

```bash
npm run build   # runs next build
```

This compiles, optimizes, and reports which routes are static vs dynamic.

### Three ways to deploy

- **Managed platform (Vercel).** Vercel (the company behind Next.js) offers zero-config deploys that support **every** feature: SSR, ISR, Server Actions, Route Handlers, middleware, and image optimization. Push your repo and it builds and hosts it.
- **Node server (self-host).** Run `next start` behind Node.js (often in Docker). This also supports the full feature set — you manage the server.
- **Static export.** Set `output: 'export'` and `next build` emits pure static HTML/CSS/JS you can host anywhere static (GitHub Pages, S3, a CDN) — the same kind of hosting this course's portal uses.

### Static export and its limits

A static export has **no running server**, so request-time features don't work:

- No SSR-on-request, no on-demand ISR, no Server Actions at runtime, no dynamic Route Handlers, no Middleware.
- Images need `images: { unoptimized: true }` (or a custom loader).
- Dynamic routes must provide `generateStaticParams`.
- For a sub-path host (like `example.github.io/my-app/`), set `basePath` and `assetPrefix`.

```typescript
// next.config.ts — static export for a sub-path static host
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/my-app',
  images: { unoptimized: true },
};
export default nextConfig;
```

### Environment variables

Server-side env vars (API keys, DB URLs) stay on the server and are read via `process.env`. To expose a value to the **browser**, prefix it with `NEXT_PUBLIC_`:

```text
DATABASE_URL=...             # server only
NEXT_PUBLIC_API_BASE=https://api.example.com   # available in the browser
```

Set them in `.env.local` for development and in your host's config for production. Never commit secrets.

# Key Terminology

- **`next build`** — produces the optimized production output.
- **Static export (`output: 'export'`)** — a build that emits static files with no server.
- **Self-hosting** — running `next start` (a Node server), often in Docker.
- **`NEXT_PUBLIC_`** — the prefix that exposes an env var to the browser.
- **`basePath` / `assetPrefix`** — config for hosting under a sub-path.

# Options and Trade-offs

| Target | Feature support | Hosting | Best for |
| --- | --- | --- | --- |
| Vercel (managed) | All features | Managed | Fastest path, full features |
| Node self-host | All features | Your server/Docker | Control, existing infra |
| Static export | Static only (no server features) | Any static host | Content sites, GitHub Pages/S3 |

# Worked Example

Ship a static site to a sub-path static host (like GitHub Pages).

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',              // emit static files to ./out
  basePath: '/portfolio',        // hosted at example.github.io/portfolio
  images: { unoptimized: true }, // no server to optimize images
};
export default nextConfig;
```

```bash
npm run build   # produces ./out with static HTML/CSS/JS
```

Upload `./out` to the static host. Because there's no server, this app must avoid Server Actions and dynamic rendering — a great fit for a portfolio or docs site, but not for a personalized dashboard.

# Real World Analogy

Choosing a deployment target is like **choosing how to serve a meal**. A managed platform (Vercel) is a full restaurant kitchen — anything on the menu, cooked to order (all features). Self-hosting is running that kitchen yourself: same menu, but you buy the equipment and staff it. A static export is a **catering tray of pre-made food** — fast, cheap, and servable anywhere, but you can't take custom orders on the spot (no request-time features).

# Examples

## Example 1 — Basic: A full-feature deploy

```bash
# Push to a Git repo connected to Vercel; it runs `next build` and hosts the output.
# SSR, ISR, Server Actions, and middleware all work with no extra config.
```

**Why this matters:** For apps that use dynamic features, a managed platform (or a Node server) is the path of least resistance.

## Example 2 — Real-world: Exposing a public config value

```tsx
// Works in the browser because of the NEXT_PUBLIC_ prefix
const apiBase = process.env.NEXT_PUBLIC_API_BASE;
```

**Why this matters:** Only `NEXT_PUBLIC_`-prefixed variables reach the client; everything else stays server-side, keeping secrets safe.

## Example 3 — Pitfall: Server features in a static export

```typescript
// next.config.ts has output: 'export' …
// …but the app uses a Server Action — which has no server to run on!
'use server';
export async function save() {/* will not run in a static export */}
```

**Why this matters:** A static export has no runtime server, so Server Actions, dynamic Route Handlers, on-demand ISR, and middleware don't work. Either drop those features or choose a server-capable target.

# Common Mistakes

- **Using server features with `output: 'export'`.** They won't run. **Fix:** deploy to Vercel/Node, or remove those features.
- **Forgetting `basePath` on a sub-path host.** Links and assets 404. **Fix:** set `basePath`/`assetPrefix`.
- **Exposing a secret by prefixing it `NEXT_PUBLIC_`.** It ships to the browser. **Fix:** only prefix truly public values.
- **Not running `next build` before deploying.** You ship dev code. **Fix:** always build for production.

# Best Practices

- Match your **deployment target to the features** your app uses.
- Run **`next build`** locally to catch errors and see static/dynamic routes.
- Keep secrets **server-side**; expose only `NEXT_PUBLIC_` values to the browser.
- For static hosts, set **`output: 'export'`**, `basePath`, and `images.unoptimized`.
- Prefer a **managed platform or Node server** when you need SSR, ISR, Server Actions, or middleware.

# Summary

- Deploy after **`next build`**; choose a target that supports your features.
- **Vercel** and **Node self-hosting** support the full feature set; **static export** supports static-only.
- A **static export** (`output: 'export'`) has no server: no SSR-on-request, Server Actions, dynamic Route Handlers, or middleware, and images need `unoptimized`.
- Use **`generateStaticParams`** for dynamic routes and **`basePath`** for sub-path hosts in a static export.
- Keep secrets on the server; expose browser values with the **`NEXT_PUBLIC_`** prefix.

# Flash Cards

Q: Which deployment targets support the full Next.js feature set (SSR, ISR, Server Actions, middleware)?
A: A managed platform like Vercel, and self-hosting with a Node server (next start). A static export does not.

Q: What does output: 'export' produce, and what can't it do?
A: Pure static HTML/CSS/JS with no server — so no SSR-on-request, on-demand ISR, Server Actions, dynamic Route Handlers, or middleware (images need unoptimized).

Q: How do you expose an environment variable to the browser?
A: Prefix it with NEXT_PUBLIC_ (e.g. NEXT_PUBLIC_API_BASE); other variables stay server-only.

Q: What config do you need to host a static export under a sub-path like /my-app?
A: Set basePath (and assetPrefix) to '/my-app' so links and assets resolve correctly.

Q: What must a dynamic route provide to work in a static export?
A: generateStaticParams, so Next.js can pre-render each page at build time.

Q: What command creates the production build, and what does it report?
A: next build (npm run build); it compiles and optimizes the app and reports which routes are static vs dynamic.

# Exercises

### Easy

Run `npm run build` on a small app and read the output. List which routes are static and which are dynamic, and why.

### Medium

Configure `output: 'export'` with `basePath` and `images.unoptimized`, build, and inspect the generated static files. Note what the app can no longer do.

### Challenging

Capstone: take an app you built through this course (routes, layouts, a data-fetching page, and one Server Action). Decide on a deployment target and justify it. If you target a static export, refactor or remove the server-only features and explain each change; if you target Vercel/Node, list the features that rely on a running server.

# Further Reading

- [Next.js — Deploying](https://nextjs.org/docs/app/building-your-application/deploying)
- [Next.js — Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Next.js — Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Next.js — Self-Hosting](https://nextjs.org/docs/app/building-your-application/deploying#self-hosting)
