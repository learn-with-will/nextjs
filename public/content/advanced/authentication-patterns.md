---
id: lesson-21
slug: authentication-patterns
title: "Authentication Patterns"
level: advanced
order: 21
duration: 26
tags:
  - authentication
  - authorization
  - sessions
  - cookies
  - data-access-layer
summary: "Understand authentication vs authorization, session strategies with secure cookies, and where to enforce access checks in the App Router."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Distinguish **authentication** from **authorization**.
- Compare stateless and database-backed **sessions**.
- Store sessions safely in `httpOnly`, `secure` cookies.
- Enforce access checks close to your data (a Data Access Layer).
- Explain the limited role of middleware in auth.

# Why It Matters

Auth is where security bugs are most costly — a wrong check can leak private data to the world. The App Router's server-first model actually helps: you can verify identity and permissions on the server, right before you read sensitive data, without trusting the browser. But you have to put the checks in the right places. This lesson covers the patterns; auth libraries handle the cryptographic details.

# Concept Explanation

### Authentication vs authorization

- **Authentication** answers *"who are you?"* — verifying identity (logging in).
- **Authorization** answers *"what are you allowed to do?"* — checking permissions (can this user edit this post?).

You need both: authenticate first, then authorize each sensitive action.

### Sessions

After login, the server needs to remember the user across requests. Two common approaches:

- **Stateless session** — the session data is encoded in a **signed/encrypted token** (often a JWT) stored in a cookie. No server storage, but harder to revoke.
- **Database session** — a random **session ID** in the cookie maps to a record in your database. Easy to revoke, but requires a lookup.

### Secure cookies

However you store it, put the session cookie behind safe attributes:

- `httpOnly` — JavaScript can't read it (protects against XSS token theft).
- `secure` — sent only over HTTPS.
- `sameSite` — limits cross-site sending (helps against CSRF).

```typescript
// setting a session cookie in a Server Action / Route Handler
cookies().set('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
});
```

### Where to enforce checks

Next.js recommends verifying auth **close to your data** — a **Data Access Layer (DAL)**: a set of server functions that check the session before returning anything sensitive. Call it from Server Components, Server Actions, and Route Handlers.

```typescript
// app/lib/dal.ts
import { cookies } from 'next/headers';

export async function getCurrentUser() {
  const token = (await cookies()).get('session')?.value;
  if (!token) return null;
  return verifyAndLoadUser(token); // your session verification
}
```

Middleware can do **optimistic** checks (redirect if there's no session cookie), but it should not be your only line of defense — always re-verify where you actually read data.

### Server Actions and Route Handlers are public

Both are reachable endpoints. **Authorize inside them** before mutating or returning data — never assume the caller is allowed just because the UI hid a button.

# Key Terminology

- **Authentication** — verifying *who* a user is.
- **Authorization** — verifying *what* a user may do.
- **Session** — server-remembered proof of a logged-in user, referenced by a cookie.
- **`httpOnly` cookie** — a cookie JavaScript cannot read, protecting the token.
- **Data Access Layer (DAL)** — server functions that centralize auth checks near data.

# Options and Trade-offs

| Choice | Pros | Cons |
| --- | --- | --- |
| Stateless (JWT) session | No server storage; scales simply | Hard to revoke before expiry |
| Database session | Easy to revoke; smaller cookie | Requires a lookup per check |
| Check in middleware only | Fast, centralized redirect | Coarse; not sufficient alone |
| Check in a DAL | Enforced right at the data | You must call it consistently |

# Worked Example

Gate a page and a mutation with a shared session check.

```typescript
// app/lib/dal.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requireUser() {
  const token = (await cookies()).get('session')?.value;
  const user = token ? await verifyAndLoadUser(token) : null;
  if (!user) redirect('/login');
  return user;
}
```

```tsx
// app/dashboard/page.tsx — Server Component
import { requireUser } from '../lib/dal';

export default async function Dashboard() {
  const user = await requireUser(); // redirects if not authenticated
  return <h1>Welcome, {user.name}</h1>;
}
```

```typescript
// app/dashboard/actions.ts — mutation re-checks auth
'use server';
import { requireUser } from '../lib/dal';

export async function deleteAccount() {
  const user = await requireUser(); // authorize before mutating
  await db.users.delete(user.id);
}
```

Both the page and the action verify the session through the same DAL function — no path to sensitive data skips the check.

# Real World Analogy

Authentication is **showing your ID at the door**; authorization is the **wristband that says which areas you can enter**. The session cookie is your **coat-check ticket** — it doesn't contain your valuables, just a reference the cloakroom trusts (and `httpOnly` means no one can pickpocket it). Checking auth only at the front door (middleware) isn't enough: the backstage door and the VIP room each have their own guard (the DAL), because someone might slip in a side entrance.

# Examples

## Example 1 — Basic: Reading the session in a Server Component

```tsx
import { cookies } from 'next/headers';

export default async function Account() {
  const token = (await cookies()).get('session')?.value;
  if (!token) return <p>Please log in.</p>;
  return <p>You are signed in.</p>;
}
```

**Why this matters:** Reading the session on the server keeps the check off the client, where it could be tampered with.

## Example 2 — Real-world: Authorizing inside a Server Action

```typescript
'use server';
import { requireUser } from '../lib/dal';

export async function updateProfile(formData: FormData) {
  const user = await requireUser();          // authenticate
  if (!user.canEditProfile) throw new Error('Forbidden'); // authorize
  await db.profiles.update(user.id, { name: formData.get('name') });
}
```

**Why this matters:** The action re-checks identity *and* permission before writing — the UI hiding a button is not a security control.

## Example 3 — Pitfall: Trusting middleware alone

```typescript
// middleware.ts redirects logged-out users… but that's not enough
// If a Server Action or Route Handler doesn't ALSO check auth,
// a direct request can reach it. Always re-verify near the data.
```

**Why this matters:** Middleware is a coarse gate that's easy to bypass with a direct request to an action or endpoint. Real authorization must live where data is read or written.

# Common Mistakes

- **Treating authentication as authorization.** Logged in ≠ allowed. **Fix:** check permissions per action.
- **Storing sessions in a readable cookie.** JavaScript (and XSS) can steal it. **Fix:** use `httpOnly`, `secure`, `sameSite`.
- **Checking auth only in middleware.** It's bypassable. **Fix:** re-verify in the DAL / Server Actions / Route Handlers.
- **Rolling your own crypto.** Easy to get wrong. **Fix:** use a vetted auth library for tokens/sessions.

# Best Practices

- Separate **authentication** and **authorization**; do both, in that order.
- Centralize checks in a **Data Access Layer** and call it wherever you read/write sensitive data.
- Use **`httpOnly` + `secure` + `sameSite`** session cookies.
- Use middleware for **optimistic** redirects only, not as your sole guard.
- Lean on a **maintained auth library** (as of writing, options like Auth.js, Clerk, and Lucia exist) rather than hand-rolling sessions.

# Summary

- **Authentication** verifies identity; **authorization** verifies permissions — you need both.
- Sessions are either **stateless tokens** (JWT in a cookie) or **database sessions** (ID in a cookie).
- Store the session in an **`httpOnly`, `secure`, `sameSite`** cookie.
- Enforce checks in a **Data Access Layer** near your data; middleware is only an optimistic gate.
- **Server Actions and Route Handlers are public** — authorize inside them, and prefer a vetted auth library.

# Flash Cards

Q: What's the difference between authentication and authorization?
A: Authentication verifies who you are (identity); authorization verifies what you're allowed to do (permissions).

Q: What are the two common session strategies?
A: Stateless tokens (e.g. a signed/encrypted JWT in a cookie) and database sessions (a session ID in a cookie mapping to a server record).

Q: Which cookie attributes protect a session cookie, and why?
A: httpOnly (JS can't read it), secure (HTTPS only), and sameSite (limits cross-site sending) — protecting against token theft and CSRF.

Q: Where does Next.js recommend enforcing auth checks, and why not only in middleware?
A: Close to the data in a Data Access Layer; middleware is a coarse, bypassable gate, so real checks must run where data is read/written.

Q: Why must Server Actions and Route Handlers check authorization themselves?
A: They're public endpoints reachable by direct requests; hiding a button in the UI is not a security control.

Q: Should you implement your own session cryptography?
A: No — prefer a vetted auth library; hand-rolled crypto is easy to get dangerously wrong.

# Exercises

### Easy

Write a Server Component that reads a `session` cookie and shows "signed in" or "please log in". Confirm the check runs on the server.

### Medium

Create a `requireUser()` DAL function that reads the session and `redirect`s to `/login` when absent, and use it to protect a dashboard page.

### Challenging

Add a Server Action that both authenticates (via the DAL) and authorizes (checks a permission) before performing a mutation. Explain why relying on a middleware redirect alone would leave this action exposed.

# Further Reading

- [Next.js — Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Next.js — cookies()](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [MDN — Set-Cookie (HttpOnly, Secure, SameSite)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [MDN — Cross-Site Request Forgery (CSRF)](https://developer.mozilla.org/en-US/docs/Glossary/CSRF)
