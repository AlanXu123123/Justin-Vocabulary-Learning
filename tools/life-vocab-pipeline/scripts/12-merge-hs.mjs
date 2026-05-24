#!/usr/bin/env node
// 12-merge-hs.mjs
// Re-read existing all-words.json from the v1 pipeline and decorate every row
// (plus any new rows introduced by the v2 sources) with:
//   - googleRank   : rank in first20hours/google-10000-english
//   - sat          : true if KyleBing SAT 8887 contains the word
//   - isAcademic   : true if it appears in Coxhead AWL headwords or subwords
// Output: data/clean/all-words-hs.json

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLEAN = join(__dirname, '..', 'data', 'clean');
const RAW = join(__dirname, '..', 'data', 'raw', 'hs');
if (!existsSync(CLEAN)) mkdirSync(CLEAN, { recursive: true });

// --- load v1 normalized words ---
const allWords = JSON.parse(readFileSync(join(CLEAN, 'all-words.json'), 'utf8'));
const byWord = new Map();
for (const w of allWords) {
  byWord.set(w.word, { ...w, googleRank: null, sat: false, isAcademic: false });
}

function getOrAdd(word) {
  const key = word.toLowerCase().trim();
  if (!key) return null;
  if (!byWord.has(key)) {
    byWord.set(key, {
      word: key,
      pos: [],
      cefr: null,
      phon_us: null,
      phon_br: null,
      oxfordDef: null,
      cocaRank: null,
      cocaPos: null,
      cocaFreq: null,
      imskyTopics: [],
      yleTopics: [],
      yleLevel: null,
      sources: [],
      googleRank: null,
      sat: false,
      isAcademic: false,
    });
  }
  return byWord.get(key);
}

// --- Google 10k: rank by line number (1-based) ---
const goog = readFileSync(join(RAW, 'google-10000-english.txt'), 'utf8').split(/\r?\n/);
let gRank = 0;
let gNew = 0;
const ALPHA = /^[a-z][a-z\-]*$/;
for (const line of goog) {
  const w = line.trim().toLowerCase();
  if (!w || !ALPHA.test(w)) continue;
  gRank++;
  const rec = getOrAdd(w);
  if (!rec) continue;
  const wasNew = !rec.sources.includes('google10k');
  rec.googleRank = gRank;
  if (!rec.sources.includes('google10k')) rec.sources.push('google10k');
  if (wasNew && !allWords.find(x => x.word === w)) gNew++;
}
console.log(`google: ranked ${gRank} words, ${gNew} were new to the corpus`);

// --- SAT: KyleBing format "word\tdefinition" per line ---
const satText = readFileSync(join(RAW, 'kyle-sat.txt'), 'utf8');
let satCount = 0;
let satNew = 0;
for (const line of satText.split(/\r?\n/)) {
  if (!line.trim()) continue;
  const m = line.split(/\s+/, 1)[0];
  const w = (m || '').toLowerCase();
  if (!w || !ALPHA.test(w)) continue;
  const rec = getOrAdd(w);
  if (!rec) continue;
  const wasNew = !rec.sources.includes('sat');
  rec.sat = true;
  if (!rec.sources.includes('sat')) rec.sources.push('sat');
  satCount++;
  if (wasNew && !allWords.find(x => x.word === w)) satNew++;
}
console.log(`sat: tagged ${satCount} entries, ${satNew} new to the corpus`);

// --- AWL: nested sublist_N -> headword -> { subwords: [] } ---
const awl = JSON.parse(readFileSync(join(RAW, 'awl.json'), 'utf8'));
const awlSet = new Set();
for (const sub of Object.keys(awl)) {
  for (const head of Object.keys(awl[sub])) {
    awlSet.add(head.toLowerCase());
    const subwords = awl[sub][head]?.subwords || [];
    for (const s of subwords) awlSet.add(String(s).toLowerCase());
  }
}
let academicHits = 0;
for (const [w, rec] of byWord) {
  if (awlSet.has(w)) {
    rec.isAcademic = true;
    if (!rec.sources.includes('awl')) rec.sources.push('awl');
    academicHits++;
  }
}
console.log(`awl: ${awlSet.size} headwords/subwords loaded, ${academicHits} corpus rows flagged academic`);

// --- emit ---
const out = [...byWord.values()];
out.sort((a, b) => {
  const ra = a.cocaRank || a.googleRank || 999999;
  const rb = b.cocaRank || b.googleRank || 999999;
  return ra - rb;
});
writeFileSync(join(CLEAN, 'all-words-hs.json'), JSON.stringify(out, null, 0));

const stats = {
  total: out.length,
  withCefr: out.filter(x => x.cefr).length,
  withCoca: out.filter(x => x.cocaRank).length,
  withGoogle: out.filter(x => x.googleRank).length,
  sat: out.filter(x => x.sat).length,
  academic: out.filter(x => x.isAcademic).length,
};
console.log('merge-hs done:', stats);
