#!/usr/bin/env node
// 05b-force-missing-cn.mjs
// For cache entries that have data but lack definitionCn, call enhanceWord
// with ?force=1 so Gemini regenerates and the Firestore cache is updated.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = join(__dirname, '..', 'data', 'clean', 'ai-cache.json');
const ENHANCE_URL = 'https://enhanceword-tbj6ixfqaa-uc.a.run.app';
const CONCURRENCY = 6;
const MAX_RETRIES = 3;
const TIMEOUT_MS = 45000;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8'));
const todo = Object.keys(cache).filter(k => !cache[k].definitionCn);
console.log(`force-regen: ${todo.length} words`);

async function fetchOne(word, attempt = 1) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const url = `${ENHANCE_URL}?word=${encodeURIComponent(word)}&force=1`;
    const resp = await fetch(url, { signal: ac.signal });
    const text = await resp.text();
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text.slice(0, 120)}`);
    const json = JSON.parse(text);
    if (!json.ok || !json.data) throw new Error(json.error || 'no data');
    return json.data;
  } catch (err) {
    if (attempt <= MAX_RETRIES) {
      await sleep(1500 * attempt);
      return fetchOne(word, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

let done = 0, failed = 0;
async function worker() {
  while (todo.length) {
    const word = todo.shift();
    try {
      const d = await fetchOne(word);
      cache[word] = {
        word: d.word || word,
        phonetic: d.phonetic || '',
        partOfSpeech: d.partOfSpeech || '',
        definitionEn: d.definitionEn || '',
        definitionCn: d.definitionCn || '',
        synonyms: d.synonyms || [],
        relatedWords: d.relatedWords || {},
      };
      done++;
      writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 0));
      console.log(`  +${word} done=${done} cn=${cache[word].definitionCn.slice(0,40)}`);
    } catch (err) {
      failed++;
      console.warn(`  FAIL ${word}: ${err.message}`);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
console.log(`done. ok=${done} failed=${failed}`);
