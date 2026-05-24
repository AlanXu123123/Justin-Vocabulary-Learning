#!/usr/bin/env node
// 17-translate.mjs
// Incrementally fill ai-cache.json with translations for words in
// by-category-hs.json that are not yet cached. Uses the same enhanceWord
// endpoint as 05-translate; the cache is shared so every word the v1 run
// already paid for is reused for free.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLEAN = join(__dirname, '..', 'data', 'clean');
const CACHE_PATH = join(CLEAN, 'ai-cache.json');
const ENHANCE_URL = 'https://enhanceword-tbj6ixfqaa-uc.a.run.app';
const CONCURRENCY = 6;
const MAX_RETRIES = 3;
const PER_CALL_TIMEOUT_MS = 45000;
const SAVE_EVERY = 12;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const byCat = JSON.parse(readFileSync(join(CLEAN, 'by-category-hs.json'), 'utf8'));
const allWords = new Set();
for (const cat of byCat.categories) {
  for (const w of byCat.buckets[cat.id]) allWords.add(w.word);
}
const wordList = [...allWords];

let cache = {};
if (existsSync(CACHE_PATH)) {
  try { cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8')); } catch { cache = {}; }
}

const todo = wordList.filter(w => !cache[w] || !cache[w].definitionCn);
console.log(`Total HS words: ${wordList.length}, cached: ${wordList.length - todo.length}, to fetch: ${todo.length}`);

let saveCounter = 0;
function saveCache() {
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 0));
}

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

async function worker(slot) {
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
        console.log(`  [${done}/${done + todo.length + failed}] +${word} | failed=${failed} | ${elapsed}s elapsed`);
      }
    } catch (err) {
      failed++;
      failedWords.push(word);
      console.warn(`  FAIL ${word}: ${err.message}`);
    }
  }
}

console.log(`Running with concurrency=${CONCURRENCY}...`);
await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)));

saveCache();
const withCn = Object.values(cache).filter(c => c.definitionCn).length;
const totalSecs = ((Date.now() - startTs) / 1000).toFixed(0);
console.log(`HS translate done in ${totalSecs}s. cache size: ${Object.keys(cache).length}, with Cn: ${withCn}, failed: ${failed}`);
if (failedWords.length) {
  console.log('failed words sample:', failedWords.slice(0, 20));
}
