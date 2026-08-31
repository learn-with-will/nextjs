# Learning Portal — card snippet for `nextjs`

Paste these into the **separate** portal repo (`ThachThanhThien/LearningPortal`,
`index.html`). One `COURSES` array entry, plus one `LOGOS` inline monochrome SVG.

## `COURSES` entry

```js
{ id:'nextjs', title:'Next.js', description:'Build fast, full-stack React apps with the Next.js App Router — 24 lessons from your first page through Server & Client Components, rendering (SSR/SSG/ISR/streaming), caching, Server Actions, route handlers, and deployment.',
  url:'https://learn-with-will.github.io/nextjs/', difficulty:'Beginner', category:'Frontend',
  tags:['App Router','Server Components','Rendering','Data Fetching','Server Actions','Routing','Deployment'],
  technologies:['Next.js','React','TypeScript','App Router'], themeColor:'#000000', icon:'N',
  estimatedHours:40, topics:24, isNew:true, isFeatured:true }
```

## `LOGOS['nextjs']` inline SVG (monochrome, uses `currentColor`)

```js
LOGOS['nextjs'] = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10.5"/><path d="M8.5 16.5V7.5l7 9V7.5"/></svg>`;
```
