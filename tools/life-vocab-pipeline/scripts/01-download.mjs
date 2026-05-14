#!/usr/bin/env node
// 01-download.mjs
// Clone 4 GitHub repos as raw sources for the life-vocab pipeline.

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW_DIR = join(__dirname, '..', 'data', 'raw');

const sources = [
  { name: 'imsky-wordlists', repo: 'https://github.com/imsky/wordlists.git' },
  { name: 'yle-vocabulary-dataset', repo: 'https://github.com/ozbonus/yle-vocabulary-dataset.git' },
  { name: 'oxford-5000', repo: 'https://github.com/winterdl/oxford-5000-vocabulary-audio-definition.git' },
  { name: 'coca-frequency', repo: 'https://github.com/brucewlee/COCA-WordFrequency.git' },
];

if (!existsSync(RAW_DIR)) mkdirSync(RAW_DIR, { recursive: true });

for (const src of sources) {
  const target = join(RAW_DIR, src.name);
  if (existsSync(target)) {
    console.log(`[skip] ${src.name} already cloned`);
    continue;
  }
  console.log(`[clone] ${src.repo}`);
  execSync(`git clone --depth 1 ${src.repo} "${target}"`, { stdio: 'inherit' });
}

console.log('Done. Raw sources at:', RAW_DIR);
