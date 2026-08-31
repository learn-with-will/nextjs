---
id: lesson-02
slug: creating-a-nextjs-app
title: "Creating a Next.js App"
level: beginner
order: 2
duration: 20
tags:
  - create-next-app
  - project-structure
  - cli
  - setup
  - dev-server
summary: "Scaffold a new project with create-next-app, tour the files it generates, and run the development server to see live changes."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Scaffold a new App Router project with `create-next-app`.
- Identify the key files and folders it generates and what each does.
- Start the development server and edit a page with instant feedback.
- Distinguish the `dev`, `build`, and `start` scripts.
- Know the Node.js version Next.js requires.

# Why It Matters

Getting the initial setup right saves hours of confusion. `create-next-app` gives you a correct, opinionated starting point — TypeScript, the App Router, and a working build already wired together — so you can focus on learning Next.js instead of configuring tooling. Knowing what each generated file is for turns a mysterious folder into a map you can navigate.

# Concept Explanation

### Scaffolding with `create-next-app`

The official way to start is the `create-next-app` CLI, run with `npx` (which downloads and runs it without a global install):

```bash
npx create-next-app@latest my-app
```

It asks a few questions — TypeScript, ESLint, Tailwind CSS, a `src/` directory, the App Router, and an import alias. Accepting the defaults gives you a modern App Router project.

### The files you get

A default App Router project contains roughly this:

```text
my-app/
  app/
    layout.tsx      # the root layout that wraps every page
    page.tsx        # the home page ("/")
    globals.css     # global styles
  public/           # static files served as-is (images, icons)
  next.config.ts    # Next.js configuration
  package.json      # scripts and dependencies
  tsconfig.json     # TypeScript settings
  next-env.d.ts     # Next.js TypeScript types (do not edit)
```

- **`app/`** is where you build — routes, layouts, and components live here.
- **`public/`** holds static assets served from the site root (e.g. `public/logo.png` → `/logo.png`).
- **`next.config.ts`** configures the framework (you will edit this rarely at first).

### The development server

Inside the project, start the dev server:

```bash
npm run dev
```

This runs `next dev` and serves your app at `http://localhost:3000`. It supports **Fast Refresh**: save a file and the browser updates almost instantly, usually without losing component state.

### The three main scripts

`package.json` defines the scripts you will use constantly:

- `dev` → `next dev` — the local development server.
- `build` → `next build` — creates the optimized production build.
- `start` → `next start` — serves the output of `build` (production mode).

# Key Terminology

- **`create-next-app`** — the official CLI that scaffolds a new Next.js project.
- **`npx`** — a tool bundled with npm that runs a package without installing it globally.
- **Fast Refresh** — Next.js's live-reload that applies edits instantly while preserving state where possible.
- **`next.config.ts`** — the file where you configure Next.js behavior.
- **`public/`** — a folder whose contents are served unchanged from the site's root URL.
- **Root layout** — `app/layout.tsx`, the required shell that wraps every page (you'll meet it next lesson).

# Options and Trade-offs

| Command | What it does | When you use it |
| --- | --- | --- |
| `npm run dev` | Starts the dev server with Fast Refresh | Everyday development |
| `npm run build` | Produces the optimized production output | Before deploying; to catch build errors |
| `npm run start` | Serves the built output in production mode | Testing the real production build locally |
| `npm run lint` | Runs ESLint (if enabled) | Checking code quality |

# Worked Example

Let's create and run a project, then make a visible change.

1. Scaffold and enter the project:

```bash
npx create-next-app@latest my-app
cd my-app
```

2. Start the dev server:

```bash
npm run dev
```

3. Open `http://localhost:3000`, then edit the home page:

```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>My first Next.js app</h1>
      <p>Edit app/page.tsx and save to see this update.</p>
    </main>
  );
}
```

Save the file. Thanks to Fast Refresh, the browser updates the moment you save — no manual reload. You are now developing a Next.js app.

# Real World Analogy

`create-next-app` is like a **furnished starter apartment**. Instead of an empty room where you must install plumbing and wiring yourself, you get the essentials already connected — kitchen, lights, water. You still decorate and rearrange (that's your app), but the infrastructure works from day one, so you move in and start living immediately.

# Examples

## Example 1 — Basic: Editing the home page

```tsx
// app/page.tsx
export default function HomePage() {
  return <h1>Hello from my new app</h1>;
}
```

**Why this matters:** The home page is just a `page.tsx` that default-exports a component; editing it is the fastest way to confirm your setup works.

## Example 2 — Real-world: Adding a second route

```tsx
// app/dashboard/page.tsx  →  the route "/dashboard"
export default function DashboardPage() {
  return <h1>Dashboard</h1>;
}
```

**Why this matters:** You add pages by creating folders with a `page.tsx` — no router config — so growing the app is just adding files.

## Example 3 — Pitfall: Forgetting to run the dev server

```bash
# You edited files but the browser shows nothing / an old version
# because no dev server is running.
npm run dev   # start it (or restart after changing next.config)
```

**Why this matters:** Edits only appear while `next dev` is running. Config changes (like `next.config.ts`) also require restarting the dev server to take effect.

# Common Mistakes

- **Using an old Node.js version.** Next.js 15 requires **Node.js 18.18 or later**. **Fix:** install a current LTS release of Node (18.18+ or newer).
- **Running commands outside the project folder.** `npm run dev` must run inside the project directory. **Fix:** `cd my-app` first.
- **Expecting `next.config` changes to hot-reload.** They don't. **Fix:** stop and restart the dev server after editing configuration.
- **Committing `node_modules` or `.next`.** These are generated. **Fix:** the default `.gitignore` already excludes them — keep it.

# Best Practices

- Use `create-next-app@latest` so you get current defaults and conventions.
- Accept **TypeScript** and the **App Router** for new projects.
- Keep `npm run dev` running while you work; use `npm run build` regularly to catch errors early.
- Put static assets in `public/` and reference them from the root path (`/file.png`).
- Read the terminal output — Next.js prints helpful errors and the local URL there.

# Summary

- **`create-next-app`** scaffolds a correct App Router project with one command.
- The important pieces are **`app/`** (your code), **`public/`** (static assets), and **`next.config.ts`** (configuration).
- **`npm run dev`** starts the dev server at `localhost:3000` with **Fast Refresh**.
- **`dev`**, **`build`**, and **`start`** are the three scripts you'll use most.
- Next.js 15 needs **Node.js 18.18+**, and config changes require a dev-server restart.

# Flash Cards

Q: What command scaffolds a new Next.js project?
A: `npx create-next-app@latest my-app` — the official CLI, run with npx.

Q: What does `npm run dev` do and on what URL?
A: It runs `next dev`, the development server with Fast Refresh, at `http://localhost:3000`.

Q: What is the difference between `next build` and `next start`?
A: `next build` creates the optimized production output; `next start` serves that built output in production mode.

Q: Where do static assets like images go, and how are they referenced?
A: In the `public/` folder; a file at `public/logo.png` is served at the URL `/logo.png`.

Q: What Node.js version does Next.js 15 require?
A: Node.js 18.18 or later (a current LTS release).

Q: Why might edits to `next.config.ts` not show up?
A: Config changes are not hot-reloaded — you must stop and restart the dev server for them to take effect.

# Exercises

### Easy

Scaffold a project with `create-next-app`, start the dev server, and change the home page's heading text. Confirm the browser updates on save.

### Medium

Add a new route at `/hello` by creating `app/hello/page.tsx`. Then add a static image to `public/` and display it on the home page using an `<img>` tag with a root-relative `src`.

### Challenging

Run `npm run build` and read the output: note which routes are marked static vs dynamic. Then run `npm run start` and compare the experience to `npm run dev`. Write two differences you notice between development and production mode.

# Further Reading

- [Next.js — Installation](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js — Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js — CLI: create-next-app](https://nextjs.org/docs/app/api-reference/cli/create-next-app)
- [Next.js — CLI: next dev / build / start](https://nextjs.org/docs/app/api-reference/cli/next)
