#!/usr/bin/env node
// 05-verify-ww.mjs
// Static smoke test of the generated ww3000-data.js — runs it in a stubbed
// browser environment and checks structural invariants + migration logic.

import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const file = readFileSync(new URL('../../../vocabulary-quiz/ww3000-data.js', import.meta.url), 'utf8');

const store = {};
const sandbox = {
  window: {},
  localStorage: {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
  },
  console,
};
vm.createContext(sandbox);

// Seed migration fixtures
store['ww3000_slashed'] = JSON.stringify({
  'old-id-1': { id: 'old-id-1', word: 'accustom', bookId: 'gone', slashedAt: '2024-01-01' },
  'orphan': { id: 'orphan', word: 'no-such-ww-word-ever', slashedAt: '2024-01-01' },
});
store['vocab_quiz_review_plan'] = JSON.stringify({
  'ww:gone-lesson::accustom': { word: 'accustom', categoryId: 'ww:gone-lesson', due: Date.now(), interval: 3, ease: 2.5 },
  'unrelated::cat': { word: 'cat' },
});
store['vocab_quiz_word_stats'] = JSON.stringify({
  'ww:gone-lesson::accustom': { word: 'accustom', categoryId: 'ww:gone-lesson', totalCount: 4, wrongCount: 1 },
});

vm.runInContext(file, sandbox);

const books = sandbox.window.WW3000_BOOKS;
const lessons = sandbox.window.WW3000_LESSONS;
const flat = sandbox.window.WW3000_WORDS;

let errors = 0;
function check(cond, msg) {
  if (!cond) { errors++; console.error('  FAIL:', msg); } else console.log('  ok:', msg);
}

console.log('=== Summary ===');
console.log('books:', books.length, '| lessons:', lessons.length, '| words:', flat.length);

console.log('=== Structural ===');
check(books.length === 6, `expected 6 books, got ${books.length}`);
check(lessons.length >= 119 && lessons.length <= 121, `expected ~120 lessons, got ${lessons.length}`);
check(flat.length >= 1700, `expected >=1700 words, got ${flat.length}`);
const expectedGrades = [5, 6, 7, 8, 9, 10];
const grades = books.map(b => b.grade);
check(JSON.stringify(grades) === JSON.stringify(expectedGrades), `books grades = ${grades}`);

for (const book of books) {
  check(book.lessons.length === 20, `Book ${book.grade} has 20 lessons (got ${book.lessons.length})`);
}

console.log('=== Field completeness ===');
const missing = flat.filter(w => !w.id || !w.word || !w.definitionCn || !w.bookId || !w.lessonId);
check(missing.length === 0, `every word has id+word+definitionCn+bookId+lessonId (missing ${missing.length})`);
if (missing.length) console.log('  examples:', missing.slice(0, 5).map(x => x.word));

const dupIds = (() => {
  const c = {};
  flat.forEach(w => { c[w.id] = (c[w.id] || 0) + 1; });
  return Object.entries(c).filter(([_, n]) => n > 1);
})();
check(dupIds.length === 0, `every flat.id unique (dupes: ${dupIds.length})`);

console.log('=== Slashed migration ===');
const slashedAfter = JSON.parse(store['ww3000_slashed']);
const accustomId = flat.find(w => w.word === 'accustom')?.id;
check(!!accustomId, 'accustom lands in the new vocabulary');
check(!slashedAfter['old-id-1'], 'old slashed id "old-id-1" removed');
check(!!accustomId && !!slashedAfter[accustomId], `slashed re-keyed to ${accustomId}`);
check(!!slashedAfter['orphan'], 'orphan slashed entry preserved');

console.log('=== Review plan / word stats migration ===');
const planAfter = JSON.parse(store['vocab_quiz_review_plan']);
const accustomLesson = flat.find(w => w.word === 'accustom')?.lessonId;
const desiredKey = 'ww:' + accustomLesson + '::accustom';
check(!planAfter['ww:gone-lesson::accustom'], 'old plan key removed');
check(!!planAfter[desiredKey], `plan re-keyed to ${desiredKey}`);
check(!!planAfter['unrelated::cat'], 'non-ww plan rows untouched');

const statsAfter = JSON.parse(store['vocab_quiz_word_stats']);
check(!!statsAfter[desiredKey], `word-stats re-keyed to ${desiredKey}`);

console.log('=== Per-book counts ===');
console.table(books.map(b => ({
  id: b.id,
  grade: b.grade,
  lessons: b.lessons.length,
  words: b.lessons.reduce((a, l) => a + l.items.length, 0),
  sample: b.lessons[0]?.items[0]?.word,
})));

if (errors) {
  console.error(`\n${errors} check(s) failed`);
  process.exit(1);
} else {
  console.log('\nAll checks passed.');
}
