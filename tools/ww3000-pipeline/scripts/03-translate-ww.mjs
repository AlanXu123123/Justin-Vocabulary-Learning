#!/usr/bin/env node
// 03-translate-ww.mjs
// Walk parsed.json, fill the shared ai-cache.json with enhanceWord results
// for every WW word that's missing definitionCn or phonetic. After the
// Gemini pass, any word that still lacks definitionCn falls back to the
// CSV cnRaw so the emit step is guaranteed to produce a complete dataset.
//
// We deliberately reuse `tools/life-vocab-pipeline/data/clean/ai-cache.json`
// so the ~2600 entries already paid for by previous runs are reused.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLEAN = join(__dirname, '..', 'data', 'clean');
const CACHE_PATH = join(__dirname, '..', '..', 'life-vocab-pipeline', 'data', 'clean', 'ai-cache.json');
const ENHANCE_URL = 'https://enhanceword-tbj6ixfqaa-uc.a.run.app';
const CONCURRENCY = 6;
const MAX_RETRIES = 3;
const PER_CALL_TIMEOUT_MS = 45000;
const SAVE_EVERY = 12;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const groups = JSON.parse(readFileSync(join(CLEAN, 'parsed.json'), 'utf8'));
const wordIndex = new Map();   // word -> first cnRaw we see for it
for (const g of groups) {
  for (const w of g.words) {
    if (!wordIndex.has(w.word)) wordIndex.set(w.word, w.cnRaw || '');
  }
}
const wordList = [...wordIndex.keys()];
console.log(`WW3000 unique words: ${wordList.length}`);

let cache = {};
if (existsSync(CACHE_PATH)) {
  try { cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8')); } catch { cache = {}; }
}
console.log(`Shared cache start size: ${Object.keys(cache).length}`);

const todo = wordList.filter((w) => {
  const c = cache[w];
  return !c || !c.definitionCn;
});
console.log(`Need enhanceWord call: ${todo.length}`);

let saveCounter = 0;
function saveCache() { writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 0)); }

async function fetchOne(word, attempt = 1) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), PER_CALL_TIMEOUT_MS);
  try {
    const url = `${ENHANCE_URL}?word=${encodeURIComponent(word)}`;
    const resp = await fetch(url, { signal: ac.signal });
    const text = await resp.text();
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text.slice(0, 160)}`);
    const json = JSON.parse(text);
    if (!json.ok || !json.data) throw new Error(`Server: ${json.error || 'no data'}`);
    return json.data;
  } catch (err) {
    clearTimeout(timer);
    if (attempt <= MAX_RETRIES) {
      await sleep(1500 * attempt);
      return fetchOne(word, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

let done = 0;
let failed = 0;
const failedWords = [];
const startTs = Date.now();

async function worker() {
  while (todo.length) {
    const word = todo.shift();
    if (!word) return;
    try {
      const data = await fetchOne(word);
      cache[word] = {
        word: data.word || word,
        phonetic: data.phonetic || '',
        partOfSpeech: data.partOfSpeech || '',
        definitionEn: data.definitionEn || '',
        definitionCn: data.definitionCn || '',
        synonyms: data.synonyms || [],
        relatedWords: data.relatedWords || {},
      };
      done++;
      saveCounter++;
      if (saveCounter >= SAVE_EVERY) { saveCache(); saveCounter = 0; }
      if (done % 24 === 0 || todo.length === 0) {
        const elapsed = ((Date.now() - startTs) / 1000).toFixed(0);
        console.log(`  [${done}/${done + todo.length + failed}] +${word} | failed=${failed} | ${elapsed}s`);
      }
    } catch (err) {
      failed++;
      failedWords.push(word);
      console.warn(`  FAIL ${word}: ${err.message}`);
    }
  }
}

console.log(`Running enhanceWord pass, concurrency=${CONCURRENCY}...`);
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
saveCache();

// CSV fallback for anything still missing definitionCn
let csvFallbacks = 0;
for (const word of wordList) {
  const cnRaw = wordIndex.get(word) || '';
  if (!cache[word]) {
    cache[word] = {
      word,
      phonetic: '',
      partOfSpeech: '',
      definitionEn: '',
      definitionCn: cnRaw,
      synonyms: [],
      relatedWords: {},
      _wwFallback: true,
    };
    if (cnRaw) csvFallbacks++;
  } else if (!cache[word].definitionCn && cnRaw) {
    cache[word].definitionCn = cnRaw;
    cache[word]._wwFallback = true;
    csvFallbacks++;
  }
}
saveCache();

const totalSecs = ((Date.now() - startTs) / 1000).toFixed(0);
const withCn = wordList.filter((w) => cache[w] && cache[w].definitionCn).length;
console.log(`translate-ww done in ${totalSecs}s. ok=${done} failed=${failed} csvFallback=${csvFallbacks}`);
console.log(`Coverage: ${withCn}/${wordList.length} words have definitionCn`);
if (failedWords.length) console.log('failed sample:', failedWords.slice(0, 15));
