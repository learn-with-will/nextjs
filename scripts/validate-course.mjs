// Validates the whole course against the authoring contract:
//   - 24 lessons ↔ 24 quizzes ↔ manifest all agree
//   - front-matter is complete and matches the file location/order
//   - every required H1 section is present, exactly 5 tags, >= 6 flash cards
//   - code fences use only the allowed languages
//   - each quiz matches the per-type schema and spans all five question types
// Exits non-zero on any error so it can gate CI / the build.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontMatter } from './lib/frontmatter.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = resolve(root, 'public/content');
const quizDir = resolve(root, 'public/quizzes');
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const ALLOWED_FENCES = new Set(['tsx', 'typescript', 'javascript', 'bash', 'json', 'css', 'text']);
const REQUIRED_SECTIONS = [
  'Learning Objectives',
  'Why It Matters',
  'Concept Explanation',
  'Key Terminology',
  'Options and Trade-offs',
  'Worked Example',
  'Real World Analogy',
  'Examples',
  'Common Mistakes',
  'Best Practices',
  'Summary',
  'Flash Cards',
  'Exercises',
  'Further Reading',
];
const QUESTION_TYPES = ['single-choice', 'multiple-choice', 'fill-blank', 'ordering', 'match-pair'];

const errors = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);

/** Split a lesson body into H1 sections, tracking heading text and fence langs. */
function analyzeBody(body) {
  const lines = body.split(/\r?\n/);
  const h1 = [];
  const fences = [];
  const sections = {}; // h1 title -> array of its lines
  let inFence = false;
  let current = null;
  for (const line of lines) {
    const fence = /^\s*```(\S*)/.exec(line);
    if (fence) {
      if (!inFence && fence[1]) fences.push(fence[1]);
      inFence = !inFence;
      if (current) sections[current].push(line);
      continue;
    }
    if (!inFence) {
      const m = /^# (.+?)\s*$/.exec(line);
      if (m) {
        current = m[1].trim();
        h1.push(current);
        sections[current] = [];
        continue;
      }
    }
    if (current) sections[current].push(line);
  }
  return { h1, fences, sections };
}

// ---- Lessons -------------------------------------------------------------
const lessons = [];
for (const level of LEVELS) {
  const dir = resolve(contentDir, level);
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    const where = `${level}/${file}`;
    const raw = readFileSync(resolve(dir, file), 'utf8');
    let parsed;
    try {
      parsed = parseFrontMatter(raw);
    } catch (e) {
      err(where, e.message);
      continue;
    }
    const { data, body } = parsed;

    // front-matter fields
    if (!/^lesson-\d{2}$/.test(data.id || '')) err(where, `bad id "${data.id}"`);
    if (!data.slug) err(where, 'missing slug');
    if (data.slug && file !== `${data.slug}.md`) err(where, `slug "${data.slug}" != file name`);
    if (!data.title) err(where, 'missing title');
    if (data.level !== level) err(where, `level "${data.level}" != folder "${level}"`);
    if (!Number.isInteger(Number(data.order))) err(where, `order not an integer`);
    if (!Number.isInteger(Number(data.duration))) err(where, `duration not an integer`);
    if (!Array.isArray(data.tags) || data.tags.length !== 5)
      err(where, `expected exactly 5 tags, got ${data.tags ? data.tags.length : 0}`);
    if (!data.summary) err(where, 'missing summary');
    if (data.id && data.order && Number(data.id.slice(-2)) !== Number(data.order))
      err(where, `id number != order (${data.id} vs ${data.order})`);

    // body sections
    const { h1, fences, sections } = analyzeBody(body);
    for (const section of REQUIRED_SECTIONS) {
      if (!h1.includes(section)) err(where, `missing required section "# ${section}"`);
    }
    // fences
    for (const lang of fences) {
      if (!ALLOWED_FENCES.has(lang)) err(where, `disallowed code fence language "${lang}"`);
    }
    // examples subheadings
    const ex = (sections['Examples'] || []).join('\n');
    for (const n of [1, 2, 3]) {
      if (!new RegExp(`^## Example ${n}\\b`, 'm').test(ex))
        err(where, `Examples missing "## Example ${n}"`);
    }
    // flash cards
    const fc = (sections['Flash Cards'] || []).join('\n');
    const qs = (fc.match(/^Q:\s/gm) || []).length;
    const as = (fc.match(/^A:\s/gm) || []).length;
    if (qs < 6) err(where, `expected >= 6 flash-card Q: lines, got ${qs}`);
    if (qs !== as) err(where, `flash-card Q/A mismatch (${qs} Q vs ${as} A)`);

    lessons.push({ level, file, data });
  }
}

// ---- Quizzes -------------------------------------------------------------
const quizzes = [];
for (const file of readdirSync(quizDir)) {
  if (!file.endsWith('.json')) continue;
  const where = `quizzes/${file}`;
  let quiz;
  try {
    quiz = JSON.parse(readFileSync(resolve(quizDir, file), 'utf8'));
  } catch (e) {
    err(where, `invalid JSON: ${e.message}`);
    continue;
  }
  const m = /^lesson-(\d{2})\.json$/.exec(file);
  if (!m) {
    err(where, 'unexpected quiz file name');
    continue;
  }
  const num = m[1];
  if (quiz.id !== `quiz-lesson-${num}`) err(where, `id should be "quiz-lesson-${num}"`);
  if (quiz.lessonId !== `lesson-${num}`) err(where, `lessonId should be "lesson-${num}"`);
  if (quiz.passingScore !== 60) err(where, `passingScore should be 60`);
  const questions = quiz.questions || [];
  if (questions.length < 5 || questions.length > 6)
    err(where, `expected 5-6 questions, got ${questions.length}`);

  const typesSeen = new Set();
  const ids = new Set();
  for (const q of questions) {
    const qw = `${where}#${q.id}`;
    if (!q.id) err(qw, 'missing question id');
    if (ids.has(q.id)) err(qw, 'duplicate question id');
    ids.add(q.id);
    if (!QUESTION_TYPES.includes(q.type)) err(qw, `bad type "${q.type}"`);
    typesSeen.add(q.type);
    if (!q.prompt) err(qw, 'missing prompt');
    if (!q.explanation) err(qw, 'missing explanation');

    if (q.type === 'single-choice') {
      const ids2 = (q.options || []).map((o) => o.id);
      if (ids2.length < 2) err(qw, 'single-choice needs >= 2 options');
      if (!ids2.includes(q.answer)) err(qw, 'single-choice answer not an option id');
    } else if (q.type === 'multiple-choice') {
      const ids2 = (q.options || []).map((o) => o.id);
      if (!Array.isArray(q.answer) || q.answer.length < 1)
        err(qw, 'multiple-choice answer must be a non-empty array');
      for (const a of q.answer || []) if (!ids2.includes(a)) err(qw, `answer "${a}" not an option id`);
    } else if (q.type === 'fill-blank') {
      if (!Array.isArray(q.answer) || q.answer.length < 1)
        err(qw, 'fill-blank answer must be a non-empty string array');
    } else if (q.type === 'ordering') {
      const itemIds = (q.items || []).map((i) => i.id);
      if (itemIds.length < 2) err(qw, 'ordering needs >= 2 items');
      if (!Array.isArray(q.answer)) err(qw, 'ordering answer must be an array');
      else {
        const a = [...q.answer].sort().join(',');
        const b = [...itemIds].sort().join(',');
        if (a !== b) err(qw, 'ordering answer must be a permutation of item ids');
      }
    } else if (q.type === 'match-pair') {
      if (!Array.isArray(q.pairs) || q.pairs.length < 2) err(qw, 'match-pair needs >= 2 pairs');
      for (const p of q.pairs || [])
        if (!p.left || !p.right) err(qw, 'each pair needs left and right');
    }
  }
  for (const t of QUESTION_TYPES)
    if (!typesSeen.has(t)) err(where, `quiz should include a "${t}" question`);

  quizzes.push({ num, quiz });
}

// ---- Cross-checks --------------------------------------------------------
const lessonIds = new Set(lessons.map((l) => l.data.id));
const quizIds = new Set(quizzes.map((q) => `lesson-${q.num}`));
for (const id of lessonIds) if (!quizIds.has(id)) err('cross', `lesson ${id} has no quiz`);
for (const id of quizIds) if (!lessonIds.has(id)) err('cross', `quiz ${id} has no lesson`);

// tier counts + orders (only enforce the 8/8/8/24 shape once complete)
const counts = { beginner: 0, intermediate: 0, advanced: 0 };
for (const l of lessons) counts[l.level]++;
const total = lessons.length;
if (total === 24) {
  for (const level of LEVELS)
    if (counts[level] !== 8) err('counts', `${level} should have 8 lessons, has ${counts[level]}`);
  const orders = lessons.map((l) => Number(l.data.order)).sort((a, b) => a - b);
  const expected = Array.from({ length: 24 }, (_, i) => i + 1);
  if (orders.join(',') !== expected.join(',')) err('counts', `orders must be exactly 1..24 (got ${orders.join(',')})`);
}

// ---- Manifest ------------------------------------------------------------
const manifestPath = resolve(contentDir, 'course-manifest.json');
if (existsSync(manifestPath)) {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    err('manifest', `invalid JSON: ${e.message}`);
    manifest = null;
  }
  if (Array.isArray(manifest)) {
    if (manifest.length !== lessons.length)
      err('manifest', `has ${manifest.length} entries but there are ${lessons.length} lessons`);
    const byId = new Map(lessons.map((l) => [l.data.id, l]));
    const seenOrders = new Set();
    for (const entry of manifest) {
      const mw = `manifest#${entry.id}`;
      const lesson = byId.get(entry.id);
      if (!lesson) {
        err(mw, 'no matching lesson file');
        continue;
      }
      const d = lesson.data;
      if (entry.slug !== d.slug) err(mw, 'slug mismatch with front-matter');
      if (entry.title !== d.title) err(mw, 'title mismatch with front-matter');
      if (entry.level !== d.level) err(mw, 'level mismatch with front-matter');
      if (Number(entry.order) !== Number(d.order)) err(mw, 'order mismatch with front-matter');
      if (Number(entry.duration) !== Number(d.duration)) err(mw, 'duration mismatch with front-matter');
      if (entry.file !== `${d.level}/${lesson.file}`) err(mw, `file should be "${d.level}/${lesson.file}"`);
      if (!entry.summary) err(mw, 'missing summary');
      if (!Array.isArray(entry.tags) || entry.tags.length !== 5) err(mw, 'tags should be exactly 5');
      if (seenOrders.has(entry.order)) err(mw, `duplicate order ${entry.order}`);
      seenOrders.add(entry.order);
    }
  }
} else {
  console.log('validate: note — course-manifest.json not present yet (run npm run manifest)');
}

// ---- Report --------------------------------------------------------------
console.log(
  `validate: ${lessons.length} lessons (${counts.beginner}/${counts.intermediate}/${counts.advanced}), ${quizzes.length} quizzes`,
);
if (errors.length) {
  console.error(`\n✗ ${errors.length} problem(s):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log('✓ all checks passed');
