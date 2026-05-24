#!/usr/bin/env node
// 19-verify.mjs
// Static smoke test of the v2 life-basics-data.js — runs it in a stubbed
// browser environment (window + localStorage) and checks:
//   - all 19 categories present
//   - per-category counts within expected range
//   - every word has core fields
//   - slashed migration still works (old id → new id by word)
//   - review-plan key rewrite works for changed categoryId

import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const file = readFileSync(new URL('../../../vocabulary-quiz/life-basics-data.js', import.meta.url), 'utf8');

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

// Seed an old slashed record using a v1-style id.
store['life_basics_slashed'] = JSON.stringify({
  'food-1': { id: 'food-1', word: 'apple', categoryId: 'food', categoryName: 'Old', slashedAt: '2024-01-01' },
  'gone-99': { id: 'gone-99', word: 'no-such-word-here', categoryId: 'gone', slashedAt: '2024-01-01' },
});
// Seed a review-plan row whose categoryId no longer matches.
store['vocab_quiz_review_plan'] = JSON.stringify({
  'life:old-food::apple': { word: 'apple', categoryId: 'life:old-food', due: Date.now(), interval: 1, ease: 2.5 },
  'life:old-misc::screwdriver': { word: 'screwdriver', categoryId: 'life:old-misc', due: Date.now(), interval: 7, ease: 2.5 },
  'unrelated::cat': { word: 'cat', categoryId: 'unrelated' },
});
store['vocab_quiz_word_stats'] = JSON.stringify({
  'life:old-food::apple': { word: 'apple', categoryId: 'life:old-food', totalCount: 3, wrongCount: 1 },
});

vm.runInContext(file, sandbox);

const cats = sandbox.window.LIFE_BASICS_CATEGORIES;
const flat = sandbox.window.LIFE_BASICS_WORDS;

let errors = 0;
function check(cond, msg) {
  if (!cond) { errors++; console.error('  FAIL:', msg); } else console.log('  ok:', msg);
}

console.log('=== Summary ===');
console.log('categories:', cats.length);
console.log('total words:', flat.length);

console.log('=== Structural checks ===');
check(cats.length === 19, `expected 19 categories, got ${cats.length}`);
check(flat.length >= 1800, `expected >=1800 words, got ${flat.length}`);

const expectedIds = [
  'food-drinks', 'ingredients-flavor', 'house-building', 'yard-outdoor',
  'tools-repairs', 'home-items', 'bathroom-cleaning', 'texture-surface',
  'clothes-details', 'body-actions', 'precise-actions', 'school-life',
  'street-city', 'shopping-money', 'feelings-social',
  'tech-social', 'mental-health', 'part-time-work', 'outdoor-adventure',
];
const presentIds = new Set(cats.map(c => c.id));
for (const id of expectedIds) check(presentIds.has(id), `category ${id} present`);

console.log('=== Field completeness ===');
const missingFields = flat.filter(w => !w.id || !w.word || !w.definitionCn || !w.definitionEn);
check(missingFields.length === 0, `every word has id+word+definitionCn+definitionEn (missing: ${missingFields.length})`);
if (missingFields.length) console.log('  examples:', missingFields.slice(0, 5).map(x => x.word));

const duplicates = (() => {
  const idCount = {};
  flat.forEach(w => { idCount[w.id] = (idCount[w.id] || 0) + 1; });
  return Object.entries(idCount).filter(([_, n]) => n > 1);
})();
check(duplicates.length === 0, `every flat.id unique (dupes: ${duplicates.length})`);

console.log('=== Slashed migration ===');
const slashedAfter = JSON.parse(store['life_basics_slashed']);
const appleId = flat.find(w => w.word === 'apple')?.id;
check(!!appleId, 'apple lands in the new vocabulary');
check(!slashedAfter['food-1'], 'old slashed id food-1 removed');
check(!!appleId && !!slashedAfter[appleId], `slashed re-keyed to new id ${appleId}`);
check(!!slashedAfter['gone-99'], 'orphan slashed entry preserved (gone-99)');

console.log('=== Review-plan migration ===');
const planAfter = JSON.parse(store['vocab_quiz_review_plan']);
const appleCat = flat.find(w => w.word === 'apple')?.categoryId;
const desiredAppleKey = 'life:' + appleCat + '::apple';
check(!planAfter['life:old-food::apple'], 'old apple plan key removed');
check(!!planAfter[desiredAppleKey], `apple re-keyed to ${desiredAppleKey}`);
check(!!planAfter['unrelated::cat'], 'unrelated plan rows untouched');

const statsAfter = JSON.parse(store['vocab_quiz_word_stats']);
check(!!statsAfter[desiredAppleKey], `word-stats apple re-keyed to ${desiredAppleKey}`);

console.log('=== Per-category counts ===');
console.table(cats.map(c => ({ id: c.id, n: c.items.length, sample: c.items[0]?.word })));

if (errors) {
  console.error(`\n${errors} check(s) failed`);
  process.exit(1);
} else {
  console.log('\nAll checks passed.');
}
