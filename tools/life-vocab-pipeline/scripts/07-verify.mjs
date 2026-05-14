#!/usr/bin/env node
// 07-verify.mjs
// Static smoke test of the generated life-basics-data.js — runs it in a stubbed
// browser environment (window + localStorage) and prints a summary.

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

// Seed an old slashed record with a stale id but matching word, to exercise migration.
store['life_basics_slashed'] = JSON.stringify({
  'old-fruit-3': { id: 'old-fruit-3', word: 'apple', categoryId: 'old-fruit', categoryName: 'Old', slashedAt: '2024-01-01' },
  'old-junk-99': { id: 'old-junk-99', word: 'no-such-word-here', categoryId: 'gone', slashedAt: '2024-01-01' },
});

vm.runInContext(file, sandbox);

const cats = sandbox.window.LIFE_BASICS_CATEGORIES;
const flat = sandbox.window.LIFE_BASICS_WORDS;

console.log('=== life-basics-data.js summary ===');
console.log('categories:', cats.length);
console.log('total words:', flat.length);

const missing = flat.filter(w => !w.id || !w.word || !w.definitionCn);
console.log('words missing core fields:', missing.length);
if (missing.length) console.log(missing.slice(0, 3));

const sample = flat[0];
console.log('sample[0]:', JSON.stringify(sample, null, 2));

const slashedAfter = JSON.parse(store['life_basics_slashed']);
console.log('slashed keys after migration:', Object.keys(slashedAfter));
const appleId = flat.find(w => w.word === 'apple')?.id;
console.log('apple id in new data:', appleId);
console.log('migration ok:', !!slashedAfter[appleId] && !slashedAfter['old-fruit-3']);

console.log('=== per-category counts ===');
console.table(cats.map(c => ({ id: c.id, n: c.items.length, sample: c.items[0]?.word })));
