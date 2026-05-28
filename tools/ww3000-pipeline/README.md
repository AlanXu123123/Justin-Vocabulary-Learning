# WW3000 vocabulary pipeline (Books 5-10)

Builds `vocabulary-quiz/ww3000-data.js` from
[busiyiworld/maimemo-export](https://github.com/busiyiworld/maimemo-export) and
Gemini-backed `enhanceWord` Cloud Function.

## Stages

1. `01-download-ww.mjs` — pulls Books 5-10 `.txt` lesson lists and `.csv`
   Chinese translations into `data/raw/ww/`.
2. `02-parse-ww.mjs` — parses txt by `#Lesson N Word List` and joins each row
   to the matching CSV translation. Emits `data/clean/parsed.json`.
3. `03-translate-ww.mjs` — reuses
   `tools/life-vocab-pipeline/data/clean/ai-cache.json` and incrementally
   calls `enhanceWord` for any word that's still missing phonetic or
   `definitionCn`. If Gemini returns nothing, the CSV translation is the
   guaranteed fallback so no word is dropped.
4. `04-emit-ww.mjs` — produces `vocabulary-quiz/ww3000-data.js` exposing
   `window.WW3000_BOOKS`, `window.WW3000_LESSONS`, `window.WW3000_WORDS` plus
   a `ww3000_slashed` id-migration block (mirrors the life-basics shape).
5. `05-verify-ww.mjs` — static smoke test: 6 books, 120 lessons, every row
   has core fields, slashed-migration block runs cleanly.

## Run

```bash
cd Justin-Vocabulary-Learning/tools/ww3000-pipeline
node scripts/01-download-ww.mjs
node scripts/02-parse-ww.mjs
node scripts/03-translate-ww.mjs
node scripts/04-emit-ww.mjs
node scripts/05-verify-ww.mjs
```
