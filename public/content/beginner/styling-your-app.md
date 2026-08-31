---
id: lesson-07
slug: styling-your-app
title: "Styling Your App"
level: beginner
order: 7
duration: 20
tags:
  - styling
  - css-modules
  - global-css
  - tailwind
  - css
summary: "Compare Next.js's built-in styling options—global CSS, CSS Modules, Tailwind, and inline styles—and know when to reach for each."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Add global styles via a CSS file imported in the root layout.
- Scope styles to a component with **CSS Modules**.
- Recognize how Tailwind CSS fits into a Next.js project.
- Choose the right styling approach for a given need.
- Avoid class-name collisions between components.

# Why It Matters

CSS that works fine in a small project becomes a liability at scale: global class names collide, and nobody dares delete a rule for fear of breaking a far-off page. Next.js supports several styling approaches out of the box — each solving the collision problem differently. Knowing the options lets you keep styles predictable and local instead of a tangled global mess.

# Concept Explanation

### Global CSS

A single stylesheet applied to the whole app. `create-next-app` generates `app/globals.css` and imports it once in the root layout:

```tsx
// app/layout.tsx
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body>{children}</body></html>
  );
}
```

Use global CSS for resets, base typography, and design tokens (CSS variables) — things that truly are app-wide.

### CSS Modules (scoped)

A file named `*.module.css` is a **CSS Module**: Next.js renames its classes to be unique, so they can't collide with any other component's. You import the file as an object and reference class names as properties:

```css
/* app/card.module.css */
.card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; }
```

```tsx
// app/Card.tsx
import styles from './card.module.css';

export default function Card() {
  return <div className={styles.card}>Hello</div>;
}
```

Even if another component also defines `.card`, they won't clash — each is scoped locally.

### Tailwind CSS

Tailwind is a utility-first framework: you compose styles from small classes directly in your markup (`className="p-4 rounded-lg border"`). It's an opt-in during `create-next-app`, and it's a popular default for new Next.js apps because it keeps styles co-located with markup and needs no separate CSS files per component.

### Inline styles

The `style` prop takes an object and is fine for small, dynamic, one-off values:

```tsx
<p style={{ color: 'crimson' }}>Alert</p>
```

It doesn't support pseudo-classes or media queries, so reserve it for dynamic values, not general styling.

# Key Terminology

- **Global CSS** — a stylesheet applied to the entire app, imported once (typically in the root layout).
- **CSS Module** — a `*.module.css` file whose class names are automatically scoped to be unique.
- **Utility-first (Tailwind)** — styling by composing small, single-purpose classes in markup.
- **Design tokens** — reusable values (colors, spacing) usually defined as CSS variables in global CSS.
- **Inline styles** — the `style={{ … }}` prop for one-off, dynamic values.

# Options and Trade-offs

| Approach | Scope | Best for | Watch out for |
| --- | --- | --- | --- |
| Global CSS | Whole app | Resets, tokens, base type | Name collisions if overused |
| CSS Modules | One component | Component-specific styles | A file per component |
| Tailwind | Utilities in markup | Fast, consistent styling | Long `className` strings |
| Inline `style` | One element | Dynamic one-off values | No pseudo/media queries |

# Worked Example

Let's style a reusable badge with a CSS Module so its styles can never leak.

```css
/* app/components/badge.module.css */
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 9999px;
  background: #eef2ff;
  color: #3730a3;
  font-size: 12px;
  font-weight: 600;
}
```

```tsx
// app/components/Badge.tsx
import styles from './badge.module.css';

export default function Badge({ label }: { label: string }) {
  return <span className={styles.badge}>{label}</span>;
}
```

Wherever you render `<Badge label="New" />`, it looks identical, and its `.badge` class won't collide with any other `.badge` in the app because the module scopes it.

# Real World Analogy

CSS Modules are like **name badges at a big conference**. Two attendees can both be named "Alex," but the badge system quietly gives each a unique ID so the organizers never mix them up. Global CSS is the shared conference banner everyone sees; useful, but you wouldn't write every attendee's personal note on it. Scoped modules keep each component's styling on its own badge.

# Examples

## Example 1 — Basic: A global stylesheet

```css
/* app/globals.css */
:root { --brand: #4f46e5; }
body { font-family: system-ui, sans-serif; margin: 0; }
```

**Why this matters:** App-wide concerns (fonts, resets, tokens) belong in one global file imported once.

## Example 2 — Real-world: Component styles that can't collide

```css
/* app/alert.module.css */
.alert { padding: 12px; border-left: 4px solid #dc2626; background: #fef2f2; }
```

```tsx
import styles from './alert.module.css';
export default function Alert({ children }: { children: React.ReactNode }) {
  return <div className={styles.alert}>{children}</div>;
}
```

**Why this matters:** The `.alert` class is scoped to this component, so another team's `.alert` elsewhere can't interfere.

## Example 3 — Pitfall: A plain CSS file used like a module

```tsx
// WRONG: importing a non-module CSS file for its class names
import styles from './card.css';   // not *.module.css → styles is not a class map
export default function Card() {
  return <div className={styles.card}>…</div>; // styles.card is undefined
}
```

**Why this matters:** Only `*.module.css` files export a scoped class-name object. A plain `.css` import applies globally and doesn't give you a `styles` map — rename it to `card.module.css`.

# Common Mistakes

- **Forgetting the `.module.css` extension.** Then styles are global and `styles.x` is undefined. **Fix:** name scoped files `*.module.css`.
- **Piling everything into `globals.css`.** Class collisions and dead code follow. **Fix:** scope component styles with modules (or Tailwind).
- **Using inline styles for pseudo/media styling.** They don't support `:hover` or `@media`. **Fix:** use a CSS class instead.
- **Importing global CSS in many places.** Import truly global CSS once (in the root layout). **Fix:** keep one global import.

# Best Practices

- Reserve **global CSS** for resets, base typography, and design tokens.
- Use **CSS Modules** (or Tailwind) for component styles to avoid collisions.
- Pick **one** primary approach per project for consistency; mix only with intent.
- Define colors and spacing as **CSS variables** so they're reusable and themeable.
- Keep inline `style` for **dynamic** values, not static styling.

# Summary

- Next.js supports **global CSS**, **CSS Modules**, **Tailwind**, and **inline styles** out of the box.
- **Global CSS** (imported once in the root layout) suits app-wide concerns.
- **CSS Modules** (`*.module.css`) scope class names automatically so components can't collide.
- **Tailwind** composes utility classes in markup and is a common default.
- Use **inline styles** only for dynamic, one-off values.

# Flash Cards

Q: What makes a CSS file a CSS Module, and what does that give you?
A: Naming it `*.module.css`; Next.js scopes its class names to be unique so they can't collide across components.

Q: Where do you typically import global CSS, and how often?
A: Once, in the root layout (app/layout.tsx) — global styles apply to the whole app.

Q: How do you reference a CSS Module class in JSX?
A: Import the file as an object (e.g. `import styles from './x.module.css'`) and use `className={styles.className}`.

Q: What's a limitation of inline style={{…}}?
A: It can't express pseudo-classes (:hover) or media queries, so it's best for dynamic one-off values.

Q: What is Tailwind's approach to styling?
A: Utility-first — you compose many small single-purpose classes directly in your markup's className.

Q: Why avoid putting all styles in globals.css?
A: Global class names collide and accumulate dead rules; scoped modules or utilities keep styles local and safe to change.

# Exercises

### Easy

Add a global rule to `globals.css` that sets the body font, and confirm it applies across pages.

### Medium

Create a `Button` component styled with a CSS Module (`button.module.css`) with a hover state. Render two buttons and confirm the styles don't leak to other elements.

### Challenging

Take a component currently styled with a shared global class that collides with another component, and refactor it to a CSS Module. Explain how the module prevents the collision, and what changed in the generated class names.

# Further Reading

- [Next.js — CSS Modules and Global Styles](https://nextjs.org/docs/app/building-your-application/styling/css)
- [Next.js — Tailwind CSS](https://nextjs.org/docs/app/building-your-application/styling/tailwind-css)
- [Next.js — Sass](https://nextjs.org/docs/app/building-your-application/styling/sass)
- [MDN — CSS first steps](https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps)
