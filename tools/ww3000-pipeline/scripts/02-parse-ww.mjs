#!/usr/bin/env node
// 02-parse-ww.mjs
// Read each Book N pair (list.txt + cn.csv) and emit a structured tree:
// data/clean/parsed.json
//   [{ book: 5, lesson: 1, words: [{ word, cnRaw }, ...] }, ...]
//
// The CSV uses RFC-4180 quoting for multi-line definitions, so we parse it
// with a small state machine instead of split(',').

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW = join(__dirname, '..', 'data', 'raw', 'ww');
const CLEAN = join(__dirname, '..', 'data', 'clean');
if (!existsSync(CLEAN)) mkdirSync(CLEAN, { recursive: true });

const BOOKS = [5, 6, 7, 8, 9, 10];

// Tiny CSV parser supporting two columns; quoted cells may contain newlines.
function parseTwoColCSV(text) {
  const rows = [];
  let i = 0;
  const n = text.length;
  while (i < n) {
    // skip BOM / blank lines
    while (i < n && (text[i] === '\r' || text[i] === '\n' || text[i] === '\uFEFF')) i++;
    if (i >= n) break;
    let col0 = '';
    let col1 = '';
    let inQuotes = false;
    let cur = '';
    let col = 0;
    while (i < n) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"' && text[i + 1] === '"') { cur += '"'; i += 2; continue; }
        if (c === '"') { inQuotes = false; i++; continue; }
        cur += c; i++; continue;
      }
      if (c === '"') { inQuotes = true; i++; continue; }
      if (c === ',' && col === 0) { col0 = cur; cur = ''; col = 1; i++; continue; }
      if (c === '\n' || c === '\r') {
        if (col === 0) col0 = cur; else col1 = cur;
        // consume CRLF
        if (c === '\r' && text[i + 1] === '\n') i += 2; else i++;
        break;
      }
      cur += c; i++;
    }
    if (i >= n) {
      if (col === 0) col0 = cur; else col1 = cur;
    }
    if (col0 || col1) rows.push([col0, col1]);
  }
  return rows;
}

function parseListTxt(text) {
  // Returns Map<lessonNumber, string[]>
  const lessons = new Map();
  let current = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const m = line.match(/^#Lesson\s+(\d+)\s+Word\s+List/i);
    if (m) {
      current = parseInt(m[1], 10);
      if (!lessons.has(current)) lessons.set(current, []);
      continue;
    }
    if (current == null) continue;
    if (line.startsWith('#')) continue;
    lessons.get(current).push(line.toLowerCase());
  }
  return lessons;
}

const out = [];
const stats = {};
for (const book of BOOKS) {
  const listPath = join(RAW, `book-${book}-list.txt`);
  const csvPath = join(RAW, `book-${book}-cn.csv`);
  const txt = readFileSync(listPath, 'utf8');
  const csv = readFileSync(csvPath, 'utf8');

  const lessons = parseListTxt(txt);
  const cnMap = new Map();
  for (const [w, def] of parseTwoColCSV(csv)) {
    if (!w) continue;
    cnMap.set(w.toLowerCase(), (def || '').trim());
  }

  let bookWordCount = 0;
  const sortedLessonNums = [...lessons.keys()].sort((a, b) => a - b);
  for (const lessonNum of sortedLessonNums) {
    const words = lessons.get(lessonNum);
    const items = words.map((w) => ({ word: w, cnRaw: cnMap.get(w) || '' }));
    out.push({ book, lesson: lessonNum, words: items });
    bookWordCount += items.length;
  }
  stats[`Book ${book}`] = {
    lessons: sortedLessonNums.length,
    words: bookWordCount,
    cnCovered: out
      .filter((g) => g.book === book)
      .flatMap((g) => g.words)
      .filter((w) => w.cnRaw)
      .length,
  };
}

writeFileSync(join(CLEAN, 'parsed.json'), JSON.stringify(out, null, 0));
console.log('parse-ww done:', stats);
console.log('total groups:', out.length, 'total words:', out.reduce((a, g) => a + g.words.length, 0));
