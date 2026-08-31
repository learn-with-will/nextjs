// Generates public/content/course-manifest.json from every lesson's YAML
// front-matter. Adding or editing a lesson only requires re-running this script
// (`npm run manifest`) — the manifest is derived, never hand-maintained.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontMatter } from './lib/frontmatter.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = resolve(root, 'public/content');
const LEVELS = ['beginner', 'intermediate', 'advanced'];

const entries = [];
for (const level of LEVELS) {
  const dir = resolve(contentDir, level);
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    const raw = readFileSync(resolve(dir, file), 'utf8');
    const { data } = parseFrontMatter(raw);
    entries.push({
      id: data.id,
      slug: data.slug,
      title: data.title,
      level: data.level,
      order: Number(data.order),
      duration: Number(data.duration),
      file: `${level}/${file}`,
      summary: data.summary,
      tags: data.tags,
    });
  }
}

entries.sort((a, b) => a.order - b.order);

const out = resolve(contentDir, 'course-manifest.json');
writeFileSync(out, JSON.stringify(entries, null, 2) + '\n');
console.log(`build-manifest: wrote ${entries.length} entries to course-manifest.json`);
