# Next.js — Learning-Portal course (to be built)

This repository will host the **Next.js** course for the
[Learning Portal](https://thachthanhthien.github.io/) family of self-paced, static course micro-apps.

It is currently seeded with a single build prompt. To create the course, open a Claude Code session
connected to this repo and hand it [`prompts/new-course-prompt.md`](prompts/new-course-prompt.md):
that prompt derives every detail from the topic and builds the full 24-lesson course end-to-end
(React 19 + Vite + TypeScript shell, Markdown lessons, JSON quizzes), then publishes it to GitHub Pages
at `https://thachthanhthien.github.io/nextjs/`.

> Scope: The Next.js React framework — the App Router, file-based routing & nested layouts, Server and Client Components (RSC), rendering strategies (SSR / SSG / ISR / streaming), data fetching & caching, Server Actions & mutations, route handlers, metadata & SEO, and deployment.
