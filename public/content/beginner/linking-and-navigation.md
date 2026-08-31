---
id: lesson-05
slug: linking-and-navigation
title: "Linking and Navigation"
level: beginner
order: 5
duration: 20
tags:
  - navigation
  - next-link
  - use-router
  - client-navigation
  - prefetching
summary: "Move between routes with the Link component for fast client-side navigation, and navigate programmatically with the useRouter hook."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Navigate between routes with the `<Link>` component.
- Explain client-side navigation and prefetching.
- Highlight the active link using `usePathname`.
- Navigate programmatically with `useRouter` from `next/navigation`.
- Avoid the Pages Router's `next/router` in App Router code.

# Why It Matters

A plain `<a href>` triggers a full page reload: the browser throws away your app and rebuilds it from scratch. That's slow and loses in-memory state. Next.js provides `<Link>`, which navigates **client-side** — swapping only the parts of the page that changed and preloading routes before you click — so moving around your app feels instant.

# Concept Explanation

### The `<Link>` component

Import `Link` from `next/link` and use it like an anchor:

```tsx
import Link from 'next/link';

export default function Nav() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/blog">Blog</Link>
    </nav>
  );
}
```

`<Link>` renders a real `<a>` element under the hood, so it's accessible and works with the keyboard — but it intercepts the click to navigate without a full reload.

### Client-side navigation and prefetching

When you click a `<Link>`, Next.js fetches just the new route's content and updates the page in place. In production, Next.js also **prefetches** a linked route when the link scrolls into view, so the destination is often already loaded by the time you click.

### The active link with `usePathname`

To style the current page's link, you need to know the current URL. The `usePathname` hook (from `next/navigation`) returns it — but hooks run in the browser, so the component must be a **Client Component**:

```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return <Link href={href} aria-current={active ? 'page' : undefined}>{children}</Link>;
}
```

### Programmatic navigation with `useRouter`

Sometimes you navigate in response to logic (after a form submits, say) rather than a click. The `useRouter` hook — **from `next/navigation`**, not `next/router` — gives you methods like `push`, `replace`, `back`, and `refresh`:

```tsx
'use client';
import { useRouter } from 'next/navigation';

export default function BuyButton() {
  const router = useRouter();
  return <button onClick={() => router.push('/checkout')}>Buy now</button>;
}
```

For redirects on the **server** (in a Server Component or Server Action), use the `redirect()` function from `next/navigation` instead.

# Key Terminology

- **`<Link>`** — the `next/link` component for client-side navigation; renders an `<a>`.
- **Client-side navigation** — moving between routes without a full page reload.
- **Prefetching** — Next.js loading a linked route ahead of time so navigation feels instant.
- **`usePathname`** — a `next/navigation` hook returning the current path (Client Components).
- **`useRouter`** — a `next/navigation` hook for programmatic navigation (`push`, `replace`, `back`, `refresh`).
- **`redirect()`** — a `next/navigation` function to redirect from server code.

# Options and Trade-offs

| Need | Use | Where it runs |
| --- | --- | --- |
| A clickable link | `<Link href="…">` | Anywhere |
| Know the current path | `usePathname()` | Client Component |
| Navigate after logic (click handler) | `useRouter().push('…')` | Client Component |
| Redirect during server render/action | `redirect('…')` | Server Component / Action |
| A full reload to an external site | plain `<a href>` | Anywhere |

# Worked Example

Let's build a navigation bar that highlights the active link.

```tsx
// app/components/MainNav.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
];

export default function MainNav() {
  const pathname = usePathname();
  return (
    <nav>
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          style={{ fontWeight: pathname === href ? 'bold' : 'normal' }}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
```

Render `<MainNav />` in your root layout and every page gets fast navigation with the current link bolded. The nav is a Client Component (it uses a hook), but the layout around it can stay a Server Component.

# Real World Analogy

`<Link>` is like a **subway turnstile** compared with the exit door. The plain `<a>` exit dumps you onto the street and you must walk all the way back in (a full reload). The turnstile (`<Link>`) keeps you inside the station and whisks you to the next platform — and the smart system already has your next train waiting (prefetching), so there's barely any wait.

# Examples

## Example 1 — Basic: A simple link

```tsx
import Link from 'next/link';

export default function Page() {
  return <Link href="/pricing">See pricing</Link>;
}
```

**Why this matters:** This is all you need for instant, prefetched navigation — no configuration.

## Example 2 — Real-world: Navigating after an action

```tsx
'use client';
import { useRouter } from 'next/navigation';

export default function SearchBox() {
  const router = useRouter();
  return (
    <input
      placeholder="Search…"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          router.push(`/search?q=${encodeURIComponent(e.currentTarget.value)}`);
        }
      }}
    />
  );
}
```

**Why this matters:** `useRouter().push` navigates from code, which is exactly what you need when the destination depends on user input.

## Example 3 — Pitfall: Importing from `next/router`

```tsx
'use client';
// WRONG in the App Router:
import { useRouter } from 'next/router'; // Pages Router only — will not work

// RIGHT:
import { useRouter } from 'next/navigation';
```

**Why this matters:** `next/router` belongs to the Pages Router. In the App Router you must import navigation hooks from `next/navigation`, and they only work in Client Components.

# Common Mistakes

- **Using a plain `<a>` for internal links.** It forces a full reload. **Fix:** use `<Link href>` for in-app routes.
- **Nesting an `<a>` inside `<Link>`.** `<Link>` already renders one. **Fix:** put your content directly inside `<Link>`.
- **Importing `useRouter` from `next/router`.** That's Pages Router. **Fix:** import from `next/navigation`.
- **Calling `usePathname`/`useRouter` in a Server Component.** Hooks need the client. **Fix:** add `"use client"` to that component.

# Best Practices

- Use `<Link>` for all internal navigation; reserve plain `<a>` for external URLs.
- Keep interactive nav pieces (active states, programmatic pushes) in small Client Components.
- Encode dynamic values in URLs with `encodeURIComponent`.
- Prefer `redirect()` for server-side redirects (in Server Components and Actions).
- Let prefetching do its job — avoid disabling it without a measured reason.

# Summary

- **`<Link href>`** from `next/link` gives fast, client-side navigation and renders a real `<a>`.
- Next.js **prefetches** linked routes in production so navigation feels instant.
- **`usePathname`** returns the current path (Client Component) — handy for active-link styling.
- **`useRouter`** (from **`next/navigation`**) navigates programmatically: `push`, `replace`, `back`, `refresh`.
- Use **`redirect()`** for server-side redirects; never import from `next/router` in the App Router.

# Flash Cards

Q: Why use <Link> instead of a plain <a> for internal navigation?
A: <Link> navigates client-side (no full reload) and prefetches the route, so it's much faster; a plain <a> reloads the whole page.

Q: Which module do you import useRouter and usePathname from in the App Router?
A: `next/navigation` — not `next/router`, which is the Pages Router.

Q: What does usePathname return and where can you use it?
A: The current URL path; it's a hook, so it only works in a Client Component ("use client").

Q: How do you navigate to /checkout from a button click?
A: In a Client Component, call `const router = useRouter(); router.push('/checkout')`.

Q: How do you redirect from server code (a Server Component or Server Action)?
A: Call `redirect('/somewhere')` from `next/navigation`.

Q: Should you nest an <a> inside <Link>?
A: No — <Link> already renders its own <a>; put the link content directly inside it.

# Exercises

### Easy

Build a nav with three `<Link>`s to `/`, `/about`, and `/contact`. Confirm that clicking them does not trigger a full page reload (the browser tab shouldn't show a reload spinner).

### Medium

Turn the nav into a Client Component that bolds the link matching the current path using `usePathname`.

### Challenging

Create a Client Component with a text input that, on submit, navigates to `/search?q=<value>` using `useRouter().push`. Then create `app/search/page.tsx` that reads the query and displays it. (Hint: `searchParams` is available to the page — you'll learn its async form in a later lesson.)

# Further Reading

- [Next.js — Linking and Navigating](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating)
- [Next.js — Link component](https://nextjs.org/docs/app/api-reference/components/link)
- [Next.js — useRouter](https://nextjs.org/docs/app/api-reference/functions/use-router)
- [Next.js — usePathname](https://nextjs.org/docs/app/api-reference/functions/use-pathname)
