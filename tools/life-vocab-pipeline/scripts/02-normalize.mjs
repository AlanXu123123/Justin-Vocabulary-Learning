#!/usr/bin/env node
// 02-normalize.mjs
// Merge raw sources into a unified candidate list.
// Output: data/clean/all-words.json

import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW = join(__dirname, '..', 'data', 'raw');
const CLEAN = join(__dirname, '..', 'data', 'clean');
if (!existsSync(CLEAN)) mkdirSync(CLEAN, { recursive: true });

// --- Naive CSV parser that handles quoted fields ---
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (ch === '\r') { /* ignore */ }
      else field += ch;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const candidates = new Map();
function get(word) {
  const key = word.toLowerCase().trim();
  if (!candidates.has(key)) {
    candidates.set(key, {
      word: key,
      pos: new Set(),
      cefr: null,
      phon_us: null,
      phon_br: null,
      oxfordDef: null,
      cocaRank: null,
      cocaPos: null,
      cocaFreq: null,
      imskyTopics: new Set(),
      yleTopics: new Set(),
      yleLevel: null,
      sources: new Set(),
    });
  }
  return candidates.get(key);
}

// --- 1. imsky/wordlists ---
const imskyPosMap = { nouns: 'noun', adjectives: 'adjective', verbs: 'verb' };
const imskyRoot = join(RAW, 'imsky-wordlists');
for (const posDir of ['nouns', 'adjectives', 'verbs']) {
  const dir = join(imskyRoot, posDir);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.txt')) continue;
    const topic = file.replace(/\.txt$/, '');
    const lines = readFileSync(join(dir, file), 'utf8').split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      const w = line.trim();
      if (!w || /[^a-z\- ]/i.test(w)) continue;
      const c = get(w);
      c.pos.add(imskyPosMap[posDir]);
      c.imskyTopics.add(`${posDir}/${topic}`);
      c.sources.add('imsky');
    }
  }
}

// --- 2. YLE Cambridge dataset ---
const yleText = readFileSync(join(RAW, 'yle-vocabulary-dataset', 'yle-vocabulary-dataset.csv'), 'utf8');
const yleRows = parseCsv(yleText);
const yleHeader = yleRows[0];
const yleTopicCols = [
  'animals', 'body_and_face', 'clothes', 'colours', 'family_and_friends',
  'food_and_drink', 'health', 'home', 'materials', 'names', 'numbers',
  'places_and_directions', 'school', 'sports_and_leisure', 'time', 'toys',
  'transport', 'weather', 'work', 'world_around_us',
];
const yleLevelCols = ['starters', 'movers', 'flyers'];
const yleAllPosCols = ['noun', 'verb', 'adjective', 'adverb', 'conjunction', 'determiner', 'discourse_marker', 'exclamation', 'interrogative', 'possessive', 'preposition', 'pronoun', 'title'];

for (let r = 1; r < yleRows.length; r++) {
  const row = yleRows[r];
  if (!row || row.length < 2) continue;
  const usWord = (row[yleHeader.indexOf('american')] || row[yleHeader.indexOf('british')] || '').toLowerCase().trim();
  if (!usWord || /[^a-z\- ]/.test(usWord)) continue;
  const c = get(usWord);
  for (const p of yleAllPosCols) {
    if (row[yleHeader.indexOf(p)] === 'TRUE') c.pos.add(p);
  }
  for (const topic of yleTopicCols) {
    if (row[yleHeader.indexOf(topic)] === 'TRUE') c.yleTopics.add(topic);
  }
  for (const lvl of yleLevelCols) {
    if (row[yleHeader.indexOf(lvl)] === 'TRUE') c.yleLevel = lvl;
  }
  c.sources.add('yle');
}

// --- 3. Oxford 3000 / 5000 ---
function importOxford(file) {
  const obj = JSON.parse(readFileSync(file, 'utf8'));
  for (const key of Object.keys(obj)) {
    const e = obj[key];
    const w = (e.word || '').toLowerCase().trim();
    if (!w || /[^a-z\- ]/.test(w)) continue;
    const c = get(w);
    if (e.type) {
      // Oxford "type" can be "noun, adjective" etc.
      String(e.type).split(/[,;/]/).map(s => s.trim()).forEach(t => {
        if (t) c.pos.add(t.toLowerCase());
      });
    }
    if (e.cefr && !c.cefr) c.cefr = String(e.cefr).toLowerCase();
    if (e.phon_n_am && !c.phon_us) c.phon_us = e.phon_n_am;
    if (e.phon_br && !c.phon_br) c.phon_br = e.phon_br;
    if (e.definition && !c.oxfordDef) c.oxfordDef = e.definition;
    c.sources.add(file.includes('5000') ? 'oxford-5000' : 'oxford-3000');
  }
}
importOxford(join(RAW, 'oxford-5000', 'data', 'oxford_3000.json'));
importOxford(join(RAW, 'oxford-5000', 'data', 'oxford_5000.json'));

// --- 4. COCA frequency ---
const cocaText = readFileSync(join(RAW, 'coca-frequency', 'COCA_WordFrequency.csv'), 'utf8');
const cocaRows = parseCsv(cocaText);
const cocaPosMap = { n: 'noun', v: 'verb', j: 'adjective', r: 'adverb', i: 'preposition', c: 'conjunction', p: 'pronoun', d: 'determiner', a: 'article', m: 'modal', t: 'infinitive', u: 'interjection' };
for (let r = 1; r < cocaRows.length; r++) {
  const row = cocaRows[r];
  if (!row || row.length < 4) continue;
  const rank = parseInt(row[0], 10);
  const lemma = (row[1] || '').toLowerCase().trim();
  const pos = row[2];
  const freq = parseInt(row[3], 10);
  if (!lemma || /[^a-z\- ]/.test(lemma)) continue;
  const c = get(lemma);
  if (!c.cocaRank || rank < c.cocaRank) {
    c.cocaRank = rank;
    c.cocaPos = pos;
    c.cocaFreq = freq;
  }
  if (cocaPosMap[pos]) c.pos.add(cocaPosMap[pos]);
  c.sources.add('coca');
}

// --- Emit ---
const out = [];
for (const [, c] of candidates) {
  out.push({
    word: c.word,
    pos: [...c.pos],
    cefr: c.cefr,
    phon_us: c.phon_us,
    phon_br: c.phon_br,
    oxfordDef: c.oxfordDef,
    cocaRank: c.cocaRank,
    cocaPos: c.cocaPos,
    cocaFreq: c.cocaFreq,
    imskyTopics: [...c.imskyTopics],
    yleTopics: [...c.yleTopics],
    yleLevel: c.yleLevel,
    sources: [...c.sources],
  });
}
out.sort((a, b) => (a.cocaRank || 999999) - (b.cocaRank || 999999));

writeFileSync(join(CLEAN, 'all-words.json'), JSON.stringify(out, null, 0));

// Stats
const stats = {
  total: out.length,
  withCefr: out.filter(x => x.cefr).length,
  withCoca: out.filter(x => x.cocaRank).length,
  withImsky: out.filter(x => x.imskyTopics.length).length,
  withYle: out.filter(x => x.yleTopics.length).length,
  cefrA1: out.filter(x => x.cefr === 'a1').length,
  cefrA2: out.filter(x => x.cefr === 'a2').length,
  cefrB1: out.filter(x => x.cefr === 'b1').length,
  cefrB2: out.filter(x => x.cefr === 'b2').length,
};
console.log('Normalize done:', stats);
