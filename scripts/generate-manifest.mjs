// Generates public/content/course-manifest.json from each lesson's YAML front-matter.
// The manifest is derived, so it can't drift from the lessons. Run: node scripts/generate-manifest.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = resolve(root, 'public', 'content');
const LEVELS = ['beginner', 'intermediate', 'advanced'];

/** Minimal YAML front-matter parser for this course's fixed shape. */
export function parseFrontMatter(raw) {
  const m = /^﻿?---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!m) throw new Error('missing front-matter');
  const meta = {};
  let listKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    const item = /^\s*-\s+(.*)$/.exec(line);
    if (item && listKey) {
      meta[listKey].push(unquote(item[1]));
      continue;
    }
    const kv = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    const [, key, valueRaw] = kv;
    if (valueRaw === '') {
      listKey = key;
      meta[key] = [];
    } else {
      listKey = null;
      const v = unquote(valueRaw);
      meta[key] = /^\d+$/.test(v) ? Number(v) : v;
    }
  }
  return meta;
}

function unquote(s) {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

export function generateManifest() {
  const entries = [];
  for (const level of LEVELS) {
    const dir = resolve(contentDir, level);
    for (const fname of readdirSync(dir)) {
      if (!fname.endsWith('.md')) continue;
      const raw = readFileSync(resolve(dir, fname), 'utf8');
      const fm = parseFrontMatter(raw);
      entries.push({
        id: fm.id,
        slug: fm.slug,
        title: fm.title,
        level: fm.level,
        order: fm.order,
        duration: fm.duration,
        file: `${level}/${fname}`,
        summary: fm.summary,
        tags: fm.tags,
      });
    }
  }
  entries.sort((a, b) => a.order - b.order);
  const out = resolve(contentDir, 'course-manifest.json');
  writeFileSync(out, JSON.stringify(entries, null, 2) + '\n');
  return { count: entries.length, out };
}

// Only regenerate when run directly (so importing parseFrontMatter has no side effects).
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { count, out } = generateManifest();
  console.log(`generate-manifest: wrote ${count} entries to ${out}`);
}
