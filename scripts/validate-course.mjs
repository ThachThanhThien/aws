// Validates the AWS course: lesson/quiz/manifest counts and consistency, lesson
// structure (front-matter, required H1 sections, tag count, flash cards, code
// fences), and quiz schema per question type. Exits non-zero on any error.
// Run: node scripts/validate-course.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontMatter } from './generate-manifest.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = resolve(root, 'public', 'content');
const quizDir = resolve(root, 'public', 'quizzes');
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const ALLOWED_FENCES = new Set(['bash', 'json', 'yaml', 'python', 'text']);
const VALID_TYPES = new Set([
  'single-choice',
  'multiple-choice',
  'fill-blank',
  'ordering',
  'match-pair',
]);
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

const errors = [];
const err = (m) => errors.push(m);
const typesSeen = new Set();

// ---- Collect lessons -------------------------------------------------------
const lessons = [];
for (const level of LEVELS) {
  const dir = resolve(contentDir, level);
  for (const fname of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const path = resolve(dir, fname);
    const raw = readFileSync(path, 'utf8');
    lessons.push({ level, fname, path, raw });
  }
}

if (lessons.length !== 24) err(`expected 24 lessons, found ${lessons.length}`);
for (const level of LEVELS) {
  const n = lessons.filter((l) => l.level === level).length;
  if (n !== 8) err(`expected 8 ${level} lessons, found ${n}`);
}

// ---- Per-lesson checks -----------------------------------------------------
for (const { level, fname, raw } of lessons) {
  let fm;
  try {
    fm = parseFrontMatter(raw);
  } catch (e) {
    err(`${fname}: ${e.message}`);
    continue;
  }
  const id = fm.id;
  // front-matter keys
  for (const k of ['id', 'slug', 'title', 'level', 'order', 'duration', 'tags', 'summary']) {
    if (fm[k] === undefined || fm[k] === '') err(`${fname}: missing front-matter '${k}'`);
  }
  if (!/^lesson-\d{2}$/.test(String(id))) err(`${fname}: id '${id}' not lesson-NN`);
  if (fm.level !== level) err(`${fname}: level '${fm.level}' != directory '${level}'`);
  if (`${fm.slug}.md` !== fname) err(`${fname}: slug '${fm.slug}' != filename`);
  if (typeof fm.order !== 'number' || fm.order < 1 || fm.order > 24)
    err(`${fname}: order '${fm.order}' out of range`);
  if (typeof fm.duration !== 'number' || fm.duration <= 0)
    err(`${fname}: duration '${fm.duration}' invalid`);
  if (!Array.isArray(fm.tags) || fm.tags.length !== 5)
    err(`${fname}: expected exactly 5 tags, found ${Array.isArray(fm.tags) ? fm.tags.length : 'none'}`);

  const body = raw.slice(raw.indexOf('---', 3) + 3);

  // required H1 sections, in order
  const h1s = [];
  for (const line of body.split(/\r?\n/)) {
    const m = /^#\s+(.+?)\s*$/.exec(line);
    if (m) h1s.push(m[1]);
  }
  for (const sec of REQUIRED_SECTIONS) {
    if (!h1s.includes(sec)) err(`${fname}: missing H1 section '${sec}'`);
  }
  const filtered = h1s.filter((h) => REQUIRED_SECTIONS.includes(h));
  const inOrder = REQUIRED_SECTIONS.filter((s) => filtered.includes(s));
  if (JSON.stringify(filtered) !== JSON.stringify(inOrder))
    err(`${fname}: H1 sections out of order: ${filtered.join(' | ')}`);

  // flash cards: >= 5 Q:/A: pairs. Slice the section by lines (from the
  // "# Flash Cards" heading to the next H1) rather than a regex, so answer
  // text can contain any characters.
  const bodyLines = body.split(/\r?\n/);
  const fcStart = bodyLines.findIndex((l) => /^#\s+Flash Cards\s*$/.test(l));
  if (fcStart !== -1) {
    let fcEnd = bodyLines.findIndex((l, idx) => idx > fcStart && /^#\s+/.test(l));
    if (fcEnd === -1) fcEnd = bodyLines.length;
    const fc = bodyLines.slice(fcStart + 1, fcEnd);
    const qs = fc.filter((l) => /^Q:/.test(l)).length;
    const as = fc.filter((l) => /^A:/.test(l)).length;
    if (qs < 5) err(`${fname}: Flash Cards has ${qs} Q: (need >= 5)`);
    if (qs !== as) err(`${fname}: Flash Cards Q:/A: mismatch (${qs} Q, ${as} A)`);
  }

  // Examples subsections: expect ## Example 1/2/3
  for (const n of [1, 2, 3]) {
    if (!new RegExp(`^##\\s+Example ${n}\\b`, 'm').test(body))
      err(`${fname}: missing '## Example ${n}'`);
  }

  // code fences: language must be allowed
  let inFence = false;
  let ln = 0;
  for (const line of body.split(/\r?\n/)) {
    ln++;
    const fence = /^```(.*)$/.exec(line);
    if (!fence) continue;
    if (!inFence) {
      const lang = fence[1].trim();
      if (!ALLOWED_FENCES.has(lang))
        err(`${fname}:${ln}: fence language '${lang || '(none)'}' not allowed`);
      inFence = true;
    } else {
      inFence = false;
    }
  }
  if (inFence) err(`${fname}: unterminated code fence`);
}

// ---- Manifest --------------------------------------------------------------
const manifestPath = resolve(contentDir, 'course-manifest.json');
let manifest = [];
if (!existsSync(manifestPath)) {
  err('course-manifest.json missing');
} else {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (manifest.length !== 24) err(`manifest: expected 24 entries, found ${manifest.length}`);
  const orders = manifest.map((e) => e.order);
  const expected = [...Array(24)].map((_, i) => i + 1);
  if (JSON.stringify(orders) !== JSON.stringify(expected))
    err(`manifest: orders not 1..24 in sequence: ${orders.join(',')}`);
  const levelCounts = {};
  for (const e of manifest) levelCounts[e.level] = (levelCounts[e.level] || 0) + 1;
  for (const level of LEVELS)
    if (levelCounts[level] !== 8) err(`manifest: expected 8 ${level}, found ${levelCounts[level] || 0}`);
  // each manifest entry matches a lesson's front-matter
  for (const e of manifest) {
    const lesson = lessons.find((l) => l.fname === e.file.split('/')[1] && l.level === e.level);
    if (!lesson) {
      err(`manifest: entry ${e.id} file '${e.file}' has no lesson`);
      continue;
    }
    const fm = parseFrontMatter(lesson.raw);
    for (const k of ['id', 'slug', 'title', 'level', 'order', 'duration', 'summary']) {
      if (JSON.stringify(fm[k]) !== JSON.stringify(e[k]))
        err(`manifest: ${e.id} '${k}' mismatch (manifest=${JSON.stringify(e[k])}, front-matter=${JSON.stringify(fm[k])})`);
    }
    if (JSON.stringify(fm.tags) !== JSON.stringify(e.tags))
      err(`manifest: ${e.id} tags mismatch`);
  }
}

// ---- Quizzes ---------------------------------------------------------------
const quizFiles = readdirSync(quizDir).filter((f) => /^lesson-\d{2}\.json$/.test(f));
if (quizFiles.length !== 24) err(`expected 24 quizzes, found ${quizFiles.length}`);

for (let i = 1; i <= 24; i++) {
  const nn = String(i).padStart(2, '0');
  const qpath = resolve(quizDir, `lesson-${nn}.json`);
  if (!existsSync(qpath)) {
    err(`quiz lesson-${nn}.json missing`);
    continue;
  }
  let quiz;
  try {
    quiz = JSON.parse(readFileSync(qpath, 'utf8'));
  } catch (e) {
    err(`lesson-${nn}.json: invalid JSON (${e.message})`);
    continue;
  }
  const label = `lesson-${nn}.json`;
  if (quiz.id !== `quiz-lesson-${nn}`) err(`${label}: id '${quiz.id}' != quiz-lesson-${nn}`);
  if (quiz.lessonId !== `lesson-${nn}`) err(`${label}: lessonId '${quiz.lessonId}' != lesson-${nn}`);
  if (quiz.passingScore !== 60) err(`${label}: passingScore '${quiz.passingScore}' != 60`);
  if (!Array.isArray(quiz.questions) || quiz.questions.length < 5 || quiz.questions.length > 6)
    err(`${label}: expected 5-6 questions, found ${quiz.questions?.length}`);

  const qids = new Set();
  for (const q of quiz.questions || []) {
    if (!q.id) err(`${label}: question missing id`);
    if (qids.has(q.id)) err(`${label}: duplicate question id '${q.id}'`);
    qids.add(q.id);
    if (!VALID_TYPES.has(q.type)) {
      err(`${label}: bad type '${q.type}' on ${q.id}`);
      continue;
    }
    typesSeen.add(q.type);
    if (!q.prompt) err(`${label}:${q.id}: missing prompt`);
    if (!q.explanation) err(`${label}:${q.id}: missing explanation`);

    if (q.type === 'single-choice' || q.type === 'multiple-choice') {
      if (!Array.isArray(q.options) || q.options.length < 2)
        err(`${label}:${q.id}: needs >=2 options`);
      const ids = new Set((q.options || []).map((o) => o.id));
      if (q.type === 'single-choice') {
        if (typeof q.answer !== 'string' || !ids.has(q.answer))
          err(`${label}:${q.id}: single-choice answer must be a valid option id`);
      } else {
        if (!Array.isArray(q.answer) || q.answer.length < 1 || !q.answer.every((a) => ids.has(a)))
          err(`${label}:${q.id}: multiple-choice answer must be a non-empty array of option ids`);
      }
    } else if (q.type === 'fill-blank') {
      if (!Array.isArray(q.answer) || q.answer.length < 1 || !q.answer.every((a) => typeof a === 'string'))
        err(`${label}:${q.id}: fill-blank answer must be a non-empty string array`);
    } else if (q.type === 'ordering') {
      if (!Array.isArray(q.items) || q.items.length < 2) err(`${label}:${q.id}: ordering needs items`);
      const ids = new Set((q.items || []).map((it) => it.id));
      if (!Array.isArray(q.answer) || q.answer.length !== (q.items || []).length || !q.answer.every((a) => ids.has(a)))
        err(`${label}:${q.id}: ordering answer must permute item ids`);
    } else if (q.type === 'match-pair') {
      if (!Array.isArray(q.pairs) || q.pairs.length < 2 || !q.pairs.every((p) => p.left && p.right))
        err(`${label}:${q.id}: match-pair needs >=2 {left,right} pairs`);
    }
  }
}

for (const t of VALID_TYPES) if (!typesSeen.has(t)) err(`course never uses quiz type '${t}'`);

// ---- Report ----------------------------------------------------------------
if (errors.length) {
  console.error(`\n❌ Validation FAILED with ${errors.length} error(s):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log('✅ Validation passed: 24 lessons, 24 quizzes, manifest consistent.');
console.log(`   Quiz types used: ${[...typesSeen].sort().join(', ')}`);
