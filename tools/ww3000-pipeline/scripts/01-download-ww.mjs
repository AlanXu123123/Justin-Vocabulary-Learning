#!/usr/bin/env node
// 01-download-ww.mjs
// Fetch Wordly Wise 3000 Book 5-10 lesson lists and Chinese translations
// from busiyiworld/maimemo-export. Two files per book: a .txt with word
// lists grouped by `#Lesson N Word List`, and a .csv with `word,定义`.

import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW = join(__dirname, '..', 'data', 'raw', 'ww');
if (!existsSync(RAW)) mkdirSync(RAW, { recursive: true });

const BOOKS = [5, 6, 7, 8, 9, 10];
const BASE = 'https://raw.githubusercontent.com/busiyiworld/maimemo-export/main/exported';

const targets = [];
for (const n of BOOKS) {
  targets.push({
    url: `${BASE}/list/Wordly%20Wise%203000%20Book%20${n}.txt`,
    out: join(RAW, `book-${n}-list.txt`),
  });
  targets.push({
    url: `${BASE}/translation/Wordly%20Wise%203000%20Book%20${n}.csv`,
    out: join(RAW, `book-${n}-cn.csv`),
  });
}

const MAX_TRIES = 4;
for (const t of targets) {
  if (existsSync(t.out) && statSync(t.out).size > 0) {
    console.log(`[skip] ${t.out} (${statSync(t.out).size} bytes)`);
    continue;
  }
  let lastErr;
  for (let i = 1; i <= MAX_TRIES; i++) {
    try {
      console.log(`[fetch ${i}/${MAX_TRIES}] ${t.url}`);
      execSync(`curl -fsSL --max-time 45 --retry 2 --retry-delay 2 -o "${t.out}" "${t.url}"`, { stdio: 'inherit' });
      const sz = statSync(t.out).size;
      if (sz === 0) throw new Error('empty file');
      console.log(`  saved ${t.out} (${sz} bytes)`);
      lastErr = null;
      break;
    } catch (err) {
      lastErr = err;
      console.warn(`  attempt ${i} failed: ${err.message}`);
    }
  }
  if (lastErr) throw lastErr;
}

console.log('ww-download done.');
