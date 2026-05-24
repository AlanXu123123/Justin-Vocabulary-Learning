#!/usr/bin/env node
// 13-filter-hs.mjs
// Filter the enriched corpus down to high-school-level, life-flavored words.
//
// Keep if ANY of:
//   - cefr in B1/B2/C1
//   - cocaRank between 1500 and 18000  (drops ultra-basic + ultra-rare)
//   - googleRank between 1500 and 9000
//   - sat=true AND not too academic-only
//   - imsky/yle topic present (everyday-life signal)
//
// Drop if:
//   - bad word shape (non-letters, single char, >18 chars)
//   - isAcademic=true AND no imsky topic AND not SAT (pure academic core)
//   - imsky topic only blocked academic domains (chemistry/programming/etc.)
//   - YLE starters-only words with no other signal (too kindergarten)
//
// Output: data/clean/hs-candidates.json

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLEAN = join(__dirname, '..', 'data', 'clean');

const all = JSON.parse(readFileSync(join(CLEAN, 'all-words-hs.json'), 'utf8'));

const IMSKY_BLOCK_TOPICS = new Set([
  'nouns/3d_graphics', 'nouns/3d_printing', 'nouns/algorithms', 'nouns/coding',
  'nouns/data_structures', 'nouns/linear_algebra', 'nouns/machine_learning',
  'nouns/set_theory', 'nouns/software', 'nouns/vcs', 'nouns/web_development',
  'nouns/physics', 'nouns/physics_optics', 'nouns/physics_units', 'nouns/physics_waves',
  'nouns/chemistry', 'nouns/geometry', 'nouns/astronomy',
  'nouns/accounting', 'nouns/insurance', 'nouns/corporate', 'nouns/corporate_job', 'nouns/startups',
  'nouns/military_airforce', 'nouns/military_army', 'nouns/military_navy', 'nouns/fortifications',
  'nouns/screenwriting', 'nouns/typography', 'nouns/history', 'nouns/ghosts',
  'nouns/apex_predators', 'nouns/monkeys', 'nouns/snakes', 'nouns/cheese', 'nouns/cotton',
  'nouns/music_theory', 'nouns/music_production',
  'adjectives/algorithms', 'adjectives/complexity', 'adjectives/corporate_prefixes', 'adjectives/linguistics', 'adjectives/music_theory', 'adjectives/physics',
  'verbs/3d_graphics', 'verbs/programming', 'verbs/vcs', 'verbs/web', 'verbs/startups', 'verbs/military_navy', 'verbs/radio', 'verbs/music_production',
]);

const ALPHA_ONLY = /^[a-z][a-z\-]+[a-z]$/;

let kept = 0;
const dropped = { shape: 0, kinder: 0, academicOnly: 0, blockedTopic: 0, rareNotLife: 0 };
const out = [];

for (const w of all) {
  if (!w.word || w.word.length < 3 || w.word.length > 18 || !ALPHA_ONLY.test(w.word)) {
    dropped.shape++; continue;
  }

  const cefr = (w.cefr || '').toLowerCase();
  const cefrInHs = ['b1', 'b2', 'c1'].includes(cefr);
  const cefrTooBasic = ['a1', 'a2'].includes(cefr);
  const cocaInRange = w.cocaRank && w.cocaRank >= 1500 && w.cocaRank <= 18000;
  const googInRange = w.googleRank && w.googleRank >= 1500 && w.googleRank <= 9000;
  const hasImsky = (w.imskyTopics || []).length > 0;
  const usableImsky = (w.imskyTopics || []).filter(t => !IMSKY_BLOCK_TOPICS.has(t));
  const hasYle = (w.yleTopics || []).length > 0;
  const yleStartersOnly = w.yleLevel === 'starters' && !cocaInRange && !googInRange && !cefrInHs && !w.sat;

  // exclusions first
  if (yleStartersOnly) { dropped.kinder++; continue; }

  // pure academic with no everyday-life signal: drop
  if (w.isAcademic && !hasImsky && !hasYle && !w.sat && !cocaInRange && !googInRange) {
    dropped.academicOnly++; continue;
  }

  // imsky present but only in blocked domains and no other signal
  if (hasImsky && usableImsky.length === 0 && !cocaInRange && !googInRange && !cefrInHs && !w.sat && !hasYle) {
    dropped.blockedTopic++; continue;
  }

  // must have at least one high-school relevance signal
  const inHs = cefrInHs || cocaInRange || googInRange || w.sat || usableImsky.length > 0 || hasYle;
  if (!inHs) { dropped.rareNotLife++; continue; }

  // demote ultra-basic-only words (cefr a1/a2 with no Oxford B+ and no SAT and no advanced rank)
  // We still keep them, but downstream keep-core script will pick the truly useful ones from the
  // existing v1 by-category data, and these get an "isBasic" tag for awareness.
  const isBasic = cefrTooBasic && !w.sat && !cocaInRange && !googInRange;

  out.push({
    word: w.word,
    pos: w.pos,
    cefr: cefr || null,
    phon_us: w.phon_us,
    phon_br: w.phon_br,
    oxfordDef: w.oxfordDef,
    cocaRank: w.cocaRank,
    googleRank: w.googleRank,
    sat: !!w.sat,
    isAcademic: !!w.isAcademic,
    isBasic,
    imskyTopics: usableImsky,
    yleTopics: w.yleTopics || [],
    yleLevel: w.yleLevel,
    sources: w.sources,
  });
  kept++;
}

writeFileSync(join(CLEAN, 'hs-candidates.json'), JSON.stringify(out, null, 0));
console.log('filter-hs done:', { kept, dropped, total: out.length });
const sat = out.filter(x => x.sat).length;
const cefrB = out.filter(x => ['b1', 'b2', 'c1'].includes(x.cefr || '')).length;
const coca = out.filter(x => x.cocaRank).length;
const basic = out.filter(x => x.isBasic).length;
console.log('signals:', { sat, cefrB, coca, basic });
