---
id: lesson-01
slug: what-is-nextjs
title: "What Is Next.js?"
level: beginner
order: 1
duration: 18
tags:
  - nextjs
  - react
  - app-router
  - framework
  - fundamentals
summary: "Understand what Next.js is—a full-stack React framework—why it exists, and how the App Router renders components on the server by default."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain what Next.js is and how it relates to React.
- Describe the problems a framework solves that plain React does not.
- Tell the **App Router** apart from the older **Pages Router**.
- Recognize that App Router components render on the **server by default**.
- Name the core capabilities Next.js adds: routing, rendering, and data fetching.

# Why It Matters

React gives you components, but it deliberately stops there. It says nothing about how to structure routes, how to render pages on a server for fast first loads or good SEO, how to fetch data, or how to bundle and ship your app. On your own, you would stitch together a router, a bundler, a server, and a dozen conventions — and every team would do it differently.

**Next.js is a React framework**: it takes React's component model and wraps it in the missing pieces — a file-based router, server and client rendering, data fetching, and an optimized build — with sensible defaults. You write components; Next.js decides where and when they run. That lets a beginner ship a fast, SEO-friendly, full-stack app without first becoming a build-tooling expert.

# Concept Explanation

### A framework, not just a library

React is a **library** for building user interfaces from components. Next.js is a **framework** built *on top of* React: it keeps everything you know about components and hooks, then adds structure and features around them. If React is an engine, Next.js is the whole car built around that engine.

### The App Router

Modern Next.js is organized around the **App Router** — a system where the folders and files inside a special `app/` directory define your application's URLs. A file named `app/page.tsx` is your home page; `app/about/page.tsx` is `/about`. You will spend the next lessons learning this directory.

> There is also an older **Pages Router** (the `pages/` directory) still supported for existing apps. This course teaches the **App Router**, which is the recommended approach for new projects. The two use different APIs, so be careful when reading older tutorials.

### Server by default

The single most important idea in the App Router: **your components render on the server by default.** A component in `app/` is a **Server Component** — it runs on the server (or at build time), can talk directly to a database or filesystem, and sends finished HTML to the browser. You opt a component into running in the browser (a **Client Component**) only when you need interactivity. A later lesson covers this in depth; for now, just remember the default is *server*.

### What Next.js adds to React

- **Routing** — files and folders become URLs; no router library to configure.
- **Rendering** — static (built ahead of time), dynamic (per request), or streamed, chosen per route.
- **Data fetching** — fetch data right inside a Server Component with `async`/`await`.
- **Optimization** — automatic code-splitting, image and font optimization, and a production build.
- **Full-stack** — Route Handlers and Server Actions let the same project handle backend logic.

# Key Terminology

- **React** — a library for building UIs from components; the foundation Next.js builds on.
- **Framework** — a structured toolkit with conventions and built-in features (here: routing, rendering, bundling).
- **Next.js** — a React framework maintained by Vercel that adds routing, rendering strategies, and data fetching.
- **App Router** — the `app/` directory system where files define routes; the modern Next.js approach.
- **Pages Router** — the older `pages/` directory system; still supported but not taught here.
- **Server Component** — a component that runs on the server/at build time and is the default in the App Router.
- **Client Component** — a component that runs in the browser for interactivity; opted into with `"use client"`.

# Options and Trade-offs

| Approach | What you write | You manage the tooling? | Server rendering & SEO | Best for |
| --- | --- | --- | --- | --- |
| Plain React (e.g. Vite SPA) | Components + your own router | Yes — router, data, build | Client-only by default | Small, interactive, non-SEO apps |
| Next.js **App Router** | Components in `app/` | No — built in | Server-first, per-route control | New full-stack, SEO-friendly apps |
| Next.js **Pages Router** | Components in `pages/` | No — built in | Server rendering via `getServerSideProps` etc. | Existing/older Next.js apps |

# Worked Example

Here is the smallest possible Next.js page. In the App Router, a `page.tsx` file that default-exports a component *is* a route:

```tsx
// app/page.tsx  →  the route "/"
export default function HomePage() {
  return <h1>Hello, Next.js!</h1>;
}
```

This component has no `"use client"` directive, so it is a **Server Component**. When someone visits `/`, Next.js runs this function on the server, turns it into HTML, and sends that HTML to the browser — so the user sees content immediately, and search engines get a fully-rendered page. You did not configure a router, a server, or a bundler; the framework supplied all of it.

# Real World Analogy

Think of React as a set of **high-quality LEGO bricks** and Next.js as the **model kit built around them**: the box, the numbered bags, the instruction booklet, and the baseplate. With loose bricks you *can* build anything, but you decide every convention yourself. The kit keeps the same bricks but adds structure — a clear order, a baseplate to build on, and pieces pre-sorted — so you finish a sturdy model quickly instead of first inventing your own system.

# Examples

## Example 1 — Basic: A static page

```tsx
// app/about/page.tsx  →  the route "/about"
export default function AboutPage() {
  return (
    <main>
      <h1>About us</h1>
      <p>We build things with Next.js.</p>
    </main>
  );
}
```

**Why this matters:** Creating a new URL is just creating a folder with a `page.tsx` — the file system *is* the router.

## Example 2 — Real-world: Fetching data on the server

```tsx
// app/stars/page.tsx
export default async function StarsPage() {
  const res = await fetch('https://api.github.com/repos/vercel/next.js');
  const repo = await res.json();
  return <p>Next.js has {repo.stargazers_count} stars.</p>;
}
```

**Why this matters:** Because this is a Server Component, you can `await` data right inside it and render the result to HTML — no `useEffect`, no loading spinner, no separate API layer for a simple read.

## Example 3 — Pitfall: Assuming the browser is available

```tsx
// app/page.tsx — BROKEN: window does not exist on the server
export default function HomePage() {
  const width = window.innerWidth; // ReferenceError during server render
  return <p>Width: {width}</p>;
}
```

**Why this matters:** Server Components run where there is no `window` or `document`. Browser-only code must live in a Client Component (`"use client"`) — a distinction you will learn to make deliberately.

# Common Mistakes

- **Thinking Next.js replaces React.** It *is* React, plus structure. Everything you know about components, props, and hooks still applies. **Fix:** treat Next.js knowledge as additive.
- **Following Pages Router tutorials in an App Router project.** APIs like `getServerSideProps` do not exist in `app/`. **Fix:** confirm a tutorial targets the App Router before copying its code.
- **Assuming components run in the browser.** In `app/` they run on the server by default. **Fix:** reach for `"use client"` only when you need browser APIs or interactivity.
- **Reaching for a separate backend too early.** Route Handlers and Server Actions may already cover your needs. **Fix:** learn the built-ins before adding services.

# Best Practices

- Start new projects with the **App Router**; keep the `pages/` router only for legacy code.
- Default to **Server Components**; add `"use client"` deliberately, not by habit.
- Let the **file system** define your routes rather than configuring a router.
- Read the **official Next.js docs** for your version — defaults (especially around caching) change between major versions.
- Keep components small and composable, exactly as you would in plain React.

# Summary

- **Next.js is a React framework**: React's components plus routing, rendering, data fetching, and an optimized build.
- The **App Router** (`app/` directory) is the modern system where files and folders define URLs.
- In the App Router, components are **Server Components by default** and render to HTML on the server.
- Next.js adds file-based **routing**, flexible **rendering** strategies, server **data fetching**, and automatic **optimization**.
- The older **Pages Router** still works but uses different APIs; this course teaches the App Router.

# Flash Cards

Q: In one sentence, what is Next.js?
A: A React framework that adds routing, rendering strategies, data fetching, and build optimization on top of React's component model.

Q: What is the difference between a library and a framework here?
A: React is a UI library (components only); Next.js is a framework that wraps React with conventions and built-in features like routing and rendering.

Q: In the App Router, do components run on the server or the client by default?
A: On the server — every component in `app/` is a Server Component unless you opt into the client with `"use client"`.

Q: Which directory defines routes in the modern App Router?
A: The `app/` directory — a `page.tsx` file inside a folder becomes that folder's URL.

Q: Name two things a framework gives you that plain React does not.
A: A file-based router and built-in server rendering (also data fetching, code-splitting, and image/font optimization).

Q: Why does the App Router router being "server by default" help SEO?
A: Pages are rendered to complete HTML on the server, so search engines and users receive fully-formed content instead of an empty shell.

# Exercises

### Easy

In your own words, write two sentences: one explaining what React provides, and one explaining what Next.js adds on top of it.

### Medium

List three concrete features Next.js gives you that you would otherwise have to assemble yourself in a plain React (Vite) app. For each, name the problem it solves.

### Challenging

Sketch (on paper) the `app/` folder structure for a tiny blog with a home page (`/`), an about page (`/about`), and a contact page (`/contact`). For each route, note whether its page could be a Server Component and why. Then explain what would need to change if the contact page had an interactive form.

# Further Reading

- [Next.js — Introduction](https://nextjs.org/docs)
- [Next.js — App Router](https://nextjs.org/docs/app)
- [Next.js — Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [React — Thinking in React](https://react.dev/learn/thinking-in-react)
