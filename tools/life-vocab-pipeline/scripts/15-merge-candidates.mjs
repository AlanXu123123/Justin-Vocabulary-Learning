#!/usr/bin/env node
// 15-merge-candidates.mjs
// Combine the HS-level filtered candidates with the core-keep list (and the
// full all-words-hs.json for metadata) so the categorizer has a single,
// deduped pool to draw from. The keepCore flag stays so categorizer can
// guarantee these survive even if their bucket is over target.
//
// Output: data/clean/merged-hs.json

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLEAN = join(__dirname, '..', 'data', 'clean');

const candidates = JSON.parse(readFileSync(join(CLEAN, 'hs-candidates.json'), 'utf8'));
const core = JSON.parse(readFileSync(join(CLEAN, 'core-keep.json'), 'utf8'));
const all = JSON.parse(readFileSync(join(CLEAN, 'all-words-hs.json'), 'utf8'));
const allByWord = new Map(all.map(w => [w.word, w]));

const out = new Map();
for (const c of candidates) {
  out.set(c.word, { ...c, keepCore: false });
}

let coreAddedNew = 0;
for (const c of core) {
  const base = allByWord.get(c.word);
  if (!base) continue; // word not in corpus (skip silently)
  if (out.has(c.word)) {
    out.get(c.word).keepCore = true;
  } else {
    out.set(c.word, {
      word: c.word,
      pos: base.pos || [],
      cefr: (base.cefr || c.cefr || null),
      phon_us: base.phon_us,
      phon_br: base.phon_br,
      oxfordDef: base.oxfordDef,
      cocaRank: base.cocaRank || c.cocaRank || null,
      googleRank: base.googleRank,
      sat: !!base.sat,
      isAcademic: !!base.isAcademic,
      isBasic: false,
      imskyTopics: base.imskyTopics || [],
      yleTopics: base.yleTopics || [],
      yleLevel: base.yleLevel,
      sources: base.sources || [],
      keepCore: true,
    });
    coreAddedNew++;
  }
}

const list = [...out.values()];
list.sort((a, b) => {
  if (a.keepCore !== b.keepCore) return a.keepCore ? -1 : 1;
  const ra = a.cocaRank || a.googleRank || 999999;
  const rb = b.cocaRank || b.googleRank || 999999;
  return ra - rb;
});

writeFileSync(join(CLEAN, 'merged-hs.json'), JSON.stringify(list, null, 0));

console.log('merge-candidates done:', {
  candidates: candidates.length,
  core: core.length,
  coreAddedNew,
  merged: list.length,
  keepCore: list.filter(x => x.keepCore).length,
});
