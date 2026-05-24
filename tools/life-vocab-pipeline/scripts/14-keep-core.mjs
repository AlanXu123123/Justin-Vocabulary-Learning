#!/usr/bin/env node
// 14-keep-core.mjs
// Pull truly foundational words from the v1 by-category.json so that even after
// promoting the corpus to HS level, learners still have base words like
// "knife", "school", "hand", "milk", "rain", etc.
//
// Selection rule per v1 word:
//   keep if cocaRank <= 3500 OR cefr in [a1,a2,b1]
//   AND not in known "fluff" categories that we are no longer interested in
//   AND has Chinese cache entry (ai-cache.json) — guarantees we can render it
//
// Also accepts a manual KEEP_HINTS list with high-value basic words that may
// have been dropped from v1 but should never leave the app.
//
// Output: data/clean/core-keep.json — array of { word, fromCategoryId, cocaRank, cefr }

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLEAN = join(__dirname, '..', 'data', 'clean');

const v1 = JSON.parse(readFileSync(join(CLEAN, 'by-category.json'), 'utf8'));
const cache = existsSync(join(CLEAN, 'ai-cache.json'))
  ? JSON.parse(readFileSync(join(CLEAN, 'ai-cache.json'), 'utf8')) : {};

const DROP_HINT_CATS = new Set([
  // These v1 categories will be reshaped in the new layout, but their basic
  // members are still useful (we keep words via the rule, not the category).
]);

const KEEP_HINTS = [
  // body / health (foundational)
  'head', 'face', 'eye', 'ear', 'nose', 'mouth', 'lip', 'tongue', 'tooth', 'teeth',
  'neck', 'shoulder', 'arm', 'hand', 'finger', 'thumb', 'leg', 'knee', 'foot',
  'back', 'chest', 'stomach', 'heart', 'skin', 'bone', 'blood', 'hair', 'nail',
  // food basics
  'rice', 'bread', 'noodle', 'egg', 'milk', 'water', 'juice', 'coffee', 'tea',
  'fruit', 'vegetable', 'apple', 'banana', 'orange', 'tomato', 'potato', 'onion',
  'chicken', 'beef', 'pork', 'fish', 'meat', 'soup', 'salad', 'sandwich', 'pizza',
  'sugar', 'salt', 'pepper', 'butter', 'cheese', 'oil',
  // kitchen / tableware basics
  'plate', 'bowl', 'cup', 'glass', 'fork', 'spoon', 'knife', 'pot', 'pan',
  'fridge', 'oven', 'stove', 'microwave', 'sink', 'kitchen',
  // home basics
  'bed', 'pillow', 'blanket', 'sheet', 'lamp', 'door', 'window', 'wall', 'floor',
  'roof', 'room', 'bathroom', 'bedroom', 'living room',
  // school basics
  'school', 'teacher', 'student', 'class', 'classroom', 'book', 'pen', 'pencil',
  'paper', 'desk', 'chair', 'homework', 'test', 'lesson',
  // clothes basics
  'shirt', 'pants', 'shoes', 'socks', 'hat', 'coat', 'jacket', 'sweater', 'dress',
  // outdoor / weather basics
  'sun', 'moon', 'star', 'sky', 'cloud', 'rain', 'snow', 'wind', 'tree', 'flower',
  'grass', 'leaf', 'park', 'road', 'street', 'house', 'car', 'bus', 'bike', 'train',
  // money basics
  'money', 'price', 'cash', 'card', 'store', 'shop', 'market', 'buy', 'sell',
  // feelings basics
  'happy', 'sad', 'angry', 'tired', 'hungry', 'thirsty', 'sleepy', 'sick',
];

const kept = new Map();
function add(word, source, cocaRank, cefr) {
  const k = word.toLowerCase().trim();
  if (!k) return;
  if (!kept.has(k)) kept.set(k, { word: k, fromCategoryId: source, cocaRank: cocaRank || null, cefr: cefr || null });
}

// Pull from v1 by-category
for (const cat of v1.categories) {
  for (const w of v1.buckets[cat.id] || []) {
    if (DROP_HINT_CATS.has(cat.id)) continue;
    if (!cache[w.word]?.definitionCn) continue;
    const coca = w.cocaRank;
    const cefr = (w.cefr || '').toLowerCase();
    const keep = (coca && coca <= 3500) || ['a1', 'a2', 'b1'].includes(cefr);
    if (keep) add(w.word, cat.id, coca, cefr);
  }
}

// Manual hints
for (const w of KEEP_HINTS) add(w, 'manual', null, null);

const out = [...kept.values()];
writeFileSync(join(CLEAN, 'core-keep.json'), JSON.stringify(out, null, 0));
console.log(`keep-core done: ${out.length} foundational words retained`);
