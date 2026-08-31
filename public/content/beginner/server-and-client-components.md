---
id: lesson-06
slug: server-and-client-components
title: "Server and Client Components"
level: beginner
order: 6
duration: 26
tags:
  - server-components
  - client-components
  - use-client
  - rendering
  - boundaries
summary: "Understand the App Router's biggest idea: components render on the server by default, and you opt into the browser with the 'use client' directive."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain what Server Components and Client Components are.
- Decide when a component needs `"use client"`.
- List what each kind of component can and cannot do.
- Compose them correctly — passing Server Components into Client Components as children.
- Understand why keeping components on the server reduces the JavaScript sent to the browser.

# Why It Matters

The App Router lets a single component tree run partly on the server and partly in the browser. Getting this split right is the difference between a fast, secure app and one that ships too much JavaScript or leaks secrets. Server Components let you fetch data and touch the backend directly, sending only HTML; Client Components add the interactivity users expect. Knowing which is which — and when to cross the line — is the central skill of App Router development.

# Concept Explanation

### Server Components (the default)

Every component in `app/` is a **Server Component** unless you say otherwise. It runs on the server or at build time, never ships its code to the browser, and can:

- `await` data directly (fetch, database, filesystem),
- read server-only secrets (API keys, environment variables),
- render to HTML that the browser receives ready-made.

What it **cannot** do: use state or lifecycle hooks (`useState`, `useEffect`), attach event handlers (`onClick`), or touch browser APIs (`window`, `localStorage`) — none of those exist on the server.

### Client Components (opt in with `"use client"`)

When you need interactivity, put the string `"use client"` as the very first line of the file. That marks the component (and everything it imports) as a **Client Component**: it's sent to the browser, hydrated, and can use hooks, event handlers, and browser APIs.

```tsx
'use client';
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>;
}
```

The `"use client"` directive marks a **boundary**: from that file inward, everything runs on the client.

### Composing the two

The rules for combining them:

- A **Server Component can render a Client Component** — that's the normal case.
- A **Client Component cannot import a Server Component**, but it *can* render one passed to it as `children` (or another prop). This "slot" pattern lets server content live inside a client shell.
- Props passed from a Server Component to a Client Component must be **serializable** (strings, numbers, plain objects, arrays — not functions or class instances). Server Actions are the special exception you can pass.

```tsx
// Server Component
import Counter from './Counter';       // a Client Component
import ServerInfo from './ServerInfo'; // a Server Component

export default function Page() {
  return (
    <Counter>        {/* client shell… */}
      <ServerInfo /> {/* …with server content passed as children */}
    </Counter>
  );
}
```

### Why default to the server?

Code that stays on the server isn't shipped to the browser, so pages load less JavaScript and start faster. Push interactivity to small Client Components at the leaves of your tree, and keep everything else on the server.

# Key Terminology

- **Server Component** — the default; runs on the server, can fetch data and use secrets, ships no JS.
- **Client Component** — opted in with `"use client"`; runs in the browser, can use state, effects, and events.
- **`"use client"`** — a directive at the top of a file marking a client boundary.
- **Hydration** — the browser attaching interactivity to server-rendered HTML for Client Components.
- **Serializable props** — data (not functions/classes) that can cross the server → client boundary.

# Options and Trade-offs

| Feature | Server Component | Client Component |
| --- | --- | --- |
| Fetch data with `await` | Yes | No (use hooks/effects) |
| `useState` / `useEffect` | No | Yes |
| Event handlers (`onClick`) | No | Yes |
| Browser APIs (`window`) | No | Yes |
| Access server secrets | Yes | No |
| Ships JavaScript to browser | No | Yes |

# Worked Example

A product page that fetches on the server and adds a client-side "add to cart" button.

```tsx
// app/product/AddToCart.tsx  — interactive, so it's a Client Component
'use client';
import { useState } from 'react';

export default function AddToCart() {
  const [added, setAdded] = useState(false);
  return (
    <button onClick={() => setAdded(true)}>
      {added ? 'Added ✓' : 'Add to cart'}
    </button>
  );
}
```

```tsx
// app/product/page.tsx  — Server Component (default): fetches, then renders the button
import AddToCart from './AddToCart';

export default async function ProductPage() {
  const res = await fetch('https://dummyjson.com/products/1');
  const product = await res.json();
  return (
    <main>
      <h1>{product.title}</h1>
      <p>${product.price}</p>
      <AddToCart />
    </main>
  );
}
```

The page fetches on the server (no client JS for the data) and delegates just the interactive button to the client. That's the ideal shape: server by default, client at the edges.

# Real World Analogy

Think of a **restaurant kitchen (server) and dining room (client)**. The kitchen prepares the food out of sight — it has the pantry, the recipes, the secret sauce (data and secrets) — and sends out finished plates (HTML). The dining room is where guests interact: they pick up forks, chat, and press the call button (clicks and state). You don't put the pantry in the dining room, and you don't ask the kitchen to hold the guests' conversation. Each does what it's best placed to do.

# Examples

## Example 1 — Basic: A minimal Client Component

```tsx
'use client';
import { useState } from 'react';

export default function Toggle() {
  const [on, setOn] = useState(false);
  return <button onClick={() => setOn((v) => !v)}>{on ? 'On' : 'Off'}</button>;
}
```

**Why this matters:** The `"use client"` line is what makes `useState` and `onClick` legal here.

## Example 2 — Real-world: Server data with a client island

```tsx
// app/dashboard/page.tsx (Server Component)
import LiveClock from './LiveClock'; // 'use client'

export default async function Dashboard() {
  const res = await fetch('https://api.example.com/stats', { cache: 'no-store' });
  const stats = await res.json();
  return (
    <main>
      <h1>Users: {stats.users}</h1>
      <LiveClock />
    </main>
  );
}
```

**Why this matters:** Data fetching stays on the server; only the ticking clock ships to the browser — the smallest possible client footprint.

## Example 3 — Pitfall: State in a Server Component

```tsx
// app/page.tsx — BROKEN: hooks and events don't exist on the server
import { useState } from 'react';

export default function Page() {
  const [n, setN] = useState(0);           // Error: no hooks in a Server Component
  return <button onClick={() => setN(1)}>Go</button>; // onClick won't work either
}
```

**Why this matters:** The fix is to add `"use client"` at the top (or extract the interactive part into a Client Component). Server Components have no state, effects, or event handlers.

# Common Mistakes

- **Using `useState`/`onClick` without `"use client"`.** They don't exist on the server. **Fix:** add the directive or extract a Client Component.
- **Marking the whole page `"use client"` just for one button.** That ships needless JS and loses server data fetching. **Fix:** keep the page a Server Component; make only the button a Client Component.
- **Importing a Server Component into a Client Component.** Not allowed. **Fix:** pass the Server Component as `children`/props instead.
- **Passing a function as a prop to a Client Component.** Functions aren't serializable. **Fix:** pass data, or a Server Action.

# Best Practices

- Default to **Server Components**; reach for `"use client"` only where you need interactivity or browser APIs.
- Keep Client Components **small and at the leaves** of the tree.
- Fetch data and read secrets in **Server Components**, then pass serializable data down.
- Use the **children/slot pattern** to nest server content inside client shells.
- Name interactive files clearly (e.g. `LikeButton.tsx`) so the client boundary is obvious.

# Summary

- In the App Router, components are **Server Components by default**; `"use client"` opts a file into being a **Client Component**.
- **Server Components** fetch data, use secrets, and ship no JS; they **can't** use state, effects, events, or browser APIs.
- **Client Components** provide interactivity but ship JavaScript and can't `await` data directly.
- A Client Component can't import a Server Component but can render one passed as **children**.
- Props crossing the boundary must be **serializable** (Server Actions excepted).

# Flash Cards

Q: In the App Router, are components server or client by default?
A: Server by default — a component is a Server Component unless its file starts with "use client".

Q: What does the "use client" directive do?
A: It marks a client boundary: that file (and everything it imports) becomes a Client Component that runs in the browser and can use hooks, events, and browser APIs.

Q: Name two things a Server Component can do that a Client Component cannot.
A: Await data directly and read server-only secrets (it also ships no JavaScript to the browser).

Q: Can a Client Component import and render a Server Component?
A: It can't import one, but it can render a Server Component passed to it as children (or another prop).

Q: What kind of props can cross from a Server to a Client Component?
A: Serializable props (strings, numbers, plain objects/arrays) — not functions or class instances (Server Actions are the exception).

Q: Why prefer keeping components on the server?
A: Server code isn't shipped to the browser, so pages load less JavaScript and start faster.

# Exercises

### Easy

Write a `Counter` Client Component with `useState`. Render it inside a Server Component page. Confirm the counter works and the page has no `"use client"`.

### Medium

Build a Server Component page that fetches a joke from a public API and renders it, plus a Client Component "New joke" button that calls `router.refresh()`. Keep data fetching on the server.

### Challenging

Create a Client Component `Card` shell (with a collapse toggle) and pass a Server Component `Details` (which fetches data) into it as `children`. Explain why this works even though a Client Component can't import a Server Component.

# Further Reading

- [Next.js — Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js — Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Next.js — Composition Patterns](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)
- [React — "use client" directive](https://react.dev/reference/rsc/use-client)
