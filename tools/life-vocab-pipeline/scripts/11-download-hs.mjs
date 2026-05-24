#!/usr/bin/env node
// 11-download-hs.mjs
// Fetch 3 extra public corpora used by the v2 (high-school) pipeline:
//   1. Google 10000 English  - mid-frequency lemma list
//   2. KyleBing SAT 8887     - SAT-ish word list with quick Chinese gloss
//   3. lpmi-13 AWL.json      - Coxhead Academic Word List (used as anti-filter)

import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW_DIR = join(__dirname, '..', 'data', 'raw');

const sources = [
  {
    name: 'google-10000-english.txt',
    url: 'https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt',
  },
  {
    name: 'kyle-sat.txt',
    url: 'https://raw.githubusercontent.com/KyleBing/english-vocabulary/master/7%20SAT-%E4%B9%B1%E5%BA%8F.txt',
  },
  {
    name: 'awl.json',
    url: 'https://raw.githubusercontent.com/lpmi-13/machine_readable_wordlists/master/Academic/AWL/AWL.json',
  },
];

const HS_RAW = join(RAW_DIR, 'hs');
if (!existsSync(HS_RAW)) mkdirSync(HS_RAW, { recursive: true });

for (const src of sources) {
  const out = join(HS_RAW, src.name);
  if (existsSync(out) && statSync(out).size > 0) {
    console.log(`[skip] ${src.name} already on disk (${statSync(out).size} bytes)`);
    continue;
  }
  console.log(`[fetch] ${src.url}`);
  // Use curl: Node fetch sporadically times out on large GitHub raw files.
  execSync(`curl -fsSL --max-time 60 -o "${out}" "${src.url}"`, { stdio: 'inherit' });
  const size = existsSync(out) ? statSync(out).size : 0;
  console.log(`  saved ${out} (${size} bytes)`);
}

console.log('hs-download done.');
