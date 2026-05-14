#!/usr/bin/env node
// 03-filter.mjs
// Keep daily-life relevant words. Drop academic/technical and rare words.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLEAN = join(__dirname, '..', 'data', 'clean');

const all = JSON.parse(readFileSync(join(CLEAN, 'all-words.json'), 'utf8'));

// imsky topic blocklist: clearly non-daily-life domains
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

const ALPHA_ONLY = /^[a-z][a-z\- ]*[a-z]$|^[a-z]$/;

let kept = 0, dropped = 0;
const reasons = { tooRare: 0, notDailyLife: 0, badShape: 0, properNoun: 0 };

const out = [];
for (const w of all) {
  // basic word shape: only English letters, hyphens and single spaces
  if (!ALPHA_ONLY.test(w.word)) { dropped++; reasons.badShape++; continue; }
  // 2-letter abbreviations or very short non-content tokens
  if (w.word.length < 2) { dropped++; reasons.badShape++; continue; }

  // Daily-life signal: must have at least one of these
  const cefrRank = ({ a1: 1, a2: 2, b1: 3, b2: 4 })[w.cefr] || 9;
  const inCefrRange = cefrRank <= 4;
  const inCoca = w.cocaRank && w.cocaRank <= 12000;
  const inImsky = w.imskyTopics.length > 0;
  const inYle = w.yleTopics.length > 0;

  if (!(inCefrRange || inCoca || inImsky || inYle)) {
    dropped++; reasons.tooRare++; continue;
  }

  // Filter out academic/professional imsky topics: if ALL imsky topics are blocked, drop
  // unless the word has a daily-life signal from other sources.
  if (inImsky) {
    const usable = w.imskyTopics.filter(t => !IMSKY_BLOCK_TOPICS.has(t));
    w._usableImsky = usable;
  } else {
    w._usableImsky = [];
  }

  // Drop if the only signal we have is a blocklisted imsky topic
  if (!inCefrRange && !inCoca && !inYle && w._usableImsky.length === 0) {
    dropped++; reasons.notDailyLife++; continue;
  }

  // POS filter: keep content words only (noun, verb, adjective, adverb)
  const contentPos = ['noun', 'verb', 'adjective', 'adverb'];
  const pos = w.pos.filter(p => contentPos.includes(p));
  if (!pos.length) {
    // YLE may classify common life words like "yes/no" as discourse/exclamation – still useful
    if (!inCefrRange && !inCoca) { dropped++; reasons.notDailyLife++; continue; }
  }

  out.push({
    word: w.word,
    pos: w.pos,
    contentPos: pos,
    cefr: w.cefr,
    phon_us: w.phon_us,
    phon_br: w.phon_br,
    oxfordDef: w.oxfordDef,
    cocaRank: w.cocaRank,
    cocaPos: w.cocaPos,
    imskyTopics: w._usableImsky,
    yleTopics: w.yleTopics,
    yleLevel: w.yleLevel,
    sources: w.sources,
  });
  kept++;
}

writeFileSync(join(CLEAN, 'life-candidates.json'), JSON.stringify(out, null, 0));
console.log('Filter done:', { kept, dropped, reasons, totalOut: out.length });
