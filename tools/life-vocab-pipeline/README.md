# Life Vocab Pipeline

Generates `vocabulary-quiz/life-basics-data.js` from four public English word
corpora plus a curated set of daily-life pins, then enriches every word with
Chinese definitions, phonetics, and part of speech via the existing
`enhanceWord` Cloud Function.

## Stages

| step | script                | output                                  |
|------|-----------------------|-----------------------------------------|
| 1    | `01-download.mjs`     | `data/raw/*` (4 GitHub repos, git-ignored) |
| 2    | `02-normalize.mjs`    | `data/clean/all-words.json`             |
| 3    | `03-filter.mjs`       | `data/clean/life-candidates.json`       |
| 4    | `04-categorize.mjs`   | `data/clean/by-category.json` + `output/draft-review.csv` |
| 5    | `05-translate.mjs`    | `data/clean/ai-cache.json` (resumable)  |
| 5b   | `05b-force-missing-cn.mjs` | refreshes legacy Firestore cache entries that lack `definitionCn` |
| 6    | `06-emit.mjs`         | `vocabulary-quiz/life-basics-data.js`   |
| 7    | `07-verify.mjs`       | static smoke test (categories, fields, migration) |

## Run end-to-end

```bash
cd tools/life-vocab-pipeline
node scripts/01-download.mjs
node scripts/02-normalize.mjs
node scripts/03-filter.mjs
node scripts/04-categorize.mjs
node scripts/05-translate.mjs       # ~25 minutes (1.6k words @ concurrency 6)
node scripts/05b-force-missing-cn.mjs
node scripts/06-emit.mjs
node scripts/07-verify.mjs
```

`05-translate.mjs` saves `ai-cache.json` every 12 words and skips anything
already cached, so a crash or rate-limit is just a rerun away.

## Sources

- `imsky/wordlists` — topic-tagged English nouns/adjectives/verbs.
- `ozbonus/yle-vocabulary-dataset` — Cambridge Young Learners with topic columns.
- `winterdl/oxford-5000-vocabulary-audio-definition` — CEFR levels, phonetics, definitions.
- `brucewlee/COCA-WordFrequency` — North American word-frequency ranks.

## Categories (15)

`food-drinks`, `ingredients-flavor`, `house-building`, `yard-outdoor`,
`tools-repairs`, `home-items`, `bathroom-cleaning`, `texture-surface`,
`clothes-details`, `body-actions`, `precise-actions`, `school-life`,
`street-city`, `shopping-money`, `feelings-social`.

The emitted JS file also contains a tiny migration block that re-points old
`life_basics_slashed` records to their new ids by matching on the word string,
so previously slashed words remain hidden after the rebuild.
