// A tiny YAML front-matter parser covering exactly the shapes the lessons use:
// `key: value`, quoted strings, numbers, and a `tags:` list of `- item` lines.
// Kept dependency-free so the build/validate scripts run with plain Node.

function unquote(s) {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

/** Returns { data, body }. Throws if no front-matter block is present. */
export function parseFrontMatter(raw) {
  const match = /^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) throw new Error('Missing front-matter (--- … ---) block');

  const body = raw.slice(match[0].length);
  const lines = match[1].split(/\r?\n/);
  const data = {};
  let currentListKey = null;

  for (const line of lines) {
    if (line.trim() === '') continue;
    const listItem = /^\s*-\s+(.*)$/.exec(line);
    if (listItem && currentListKey) {
      data[currentListKey].push(unquote(listItem[1]));
      continue;
    }
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    const key = kv[1];
    const value = kv[2];
    if (value === '') {
      // Start of a nested list (e.g. tags:)
      data[key] = [];
      currentListKey = key;
    } else {
      data[key] = unquote(value);
      currentListKey = null;
    }
  }
  return { data, body };
}
