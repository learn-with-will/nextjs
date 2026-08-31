# Next.js Learning Portal

A **frontend-only** Next.js learning platform: read Markdown lessons, take quizzes,
and track your progress — all in the browser, no backend required. It teaches the
**Next.js App Router** (Next.js 15 + React 19): the App Router, file-based routing &
nested layouts, Server and Client Components, rendering strategies (SSR / SSG / ISR /
streaming), data fetching & caching, Server Actions & mutations, route handlers,
metadata & SEO, and deployment.

Live at **https://learn-with-will.github.io/nextjs/**.

> The app shell is built with React 19, Vite, TypeScript, React Router, Tailwind
> CSS v4, `marked`, and PrismJS — the same static, file-driven shell shared across
> the Learning-Portal course family. The *course content* is Next.js.

## The course

24 lessons across three levels (8 / 8 / 8), each with a quiz:

- **Beginner** — what Next.js is, `create-next-app`, file-based routing, layouts,
  navigation, Server vs Client Components, styling, images/fonts/assets.
- **Intermediate** — dynamic routes, data fetching, rendering strategies, caching &
  revalidation, loading UI & streaming, error handling, route handlers, metadata/SEO.
- **Advanced** — Server Actions, forms & optimistic UI, middleware, parallel &
  intercepting routes, authentication patterns, the caching model in depth,
  performance, and production deployment.

Every lesson follows a fixed structure (objectives, concepts, terminology,
trade-offs, worked example, analogy, examples, mistakes, best practices, summary,
flash cards, exercises, further reading) and cites the official
[Next.js docs](https://nextjs.org/docs). See
[`prompts/nextjs-authoring-prompt.md`](prompts/nextjs-authoring-prompt.md) for the
authoring contract and the topic's high-risk-facts checklist.

## Features

- **Roadmap** of lessons grouped by level (beginner / intermediate / advanced).
- **Lesson reader** with Markdown rendering, Prism syntax highlighting, a table of
  contents, previous/next navigation, mark-complete, and bookmarking.
- **Quizzes** with five question types — single-choice, multiple-choice, fill-blank,
  ordering, and match-pair — with grading, review mode, and explanations.
- **Dashboard** with completion stats, per-level progress, and quiz history.
- **Search** and **bookmarks** pages, **dark mode**, responsive layout.
- All progress persists to `localStorage` under `nextjs-learning-*` keys.

## Run it

```bash
npm install
npm run dev        # dev server (Vite) at http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build locally
npm run manifest   # regenerate course-manifest.json from lesson front-matter
npm run validate   # check lessons ↔ quizzes ↔ manifest and every content rule
```

## Project structure

```text
src/
├── core/
│   ├── models/        # Lesson, Quiz, Progress types + constants
│   ├── services/      # lesson/quiz loading, search, grading, asset URLs
│   ├── context/       # Course, Progress, Theme providers
│   └── hooks/         # useDocumentTitle, prism setup
├── shared/components/ # Navbar, Sidebar, Footer, LessonCard, TableOfContents,
│                      # LessonNavigation, LessonContent, QuizQuestion,
│                      # QuizProgress, QuizResult, NextLogo, ScrollManager
├── features/          # home, roadmap, lesson, quiz, dashboard, search, bookmarks
├── App.tsx            # layout + lazy-loaded routes
└── main.tsx           # providers + bootstrap

public/
├── content/           # lesson Markdown + course-manifest.json (24 lessons)
└── quizzes/           # one lesson-NN.json per quiz (24 quizzes)

scripts/
├── build-manifest.mjs # generate course-manifest.json from front-matter
├── validate-course.mjs# validate the whole course against the authoring contract
└── copy-404.mjs       # SPA fallback for GitHub Pages (postbuild)
```

## Adding or editing content — no code changes required

### Add a lesson

1. Create a Markdown file under `public/content/<level>/<slug>.md` starting with
   YAML front-matter (`id`, `slug`, `title`, `level`, `order`, `duration`,
   exactly 5 `tags`, and a one-sentence `summary`), followed by the standard H1
   sections (see any existing lesson or the authoring prompt).
2. Run `npm run manifest` to regenerate `public/content/course-manifest.json`
   from front-matter, then `npm run validate` to check everything.

The lesson appears in the roadmap, sidebar, search, and home automatically.

> **Flash cards:** a heading titled `Flash Cards` followed by `Q: … / A: …` line
> pairs (one blank line between cards) is auto-transformed into interactive flip
> cards.

### Add a quiz

Create `public/quizzes/lesson-NN.json` with `id` `quiz-lesson-NN`, `lessonId`
`lesson-NN`, `passingScore` 60, and 5–6 questions spanning all five types. Run
`npm run validate` to confirm the schema and that answers map to options.

## Tech stack

React 19 · Vite · TypeScript · React Router · Tailwind CSS v4 · marked · PrismJS ·
localStorage. Code fences use `tsx`, `typescript`, `javascript`, `bash`, `json`,
`css`, and `text`.

## Deploying to GitHub Pages

This repo ships a GitHub Actions workflow
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) that builds and
publishes to GitHub Pages on every push to `main`.

One-time setup:

1. On GitHub, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Push to `main` (or run the workflow manually from the **Actions** tab).

The site is served at `https://learn-with-will.github.io/nextjs/`. The workflow
builds with `BASE_PATH=/<repo>/` so assets and content resolve under the sub-path,
and a `postbuild` step copies `dist/index.html` to `dist/404.html` so deep links and
refreshes load correctly. For other static hosts, the `dist/` output works as-is with
an SPA fallback to `index.html`.
