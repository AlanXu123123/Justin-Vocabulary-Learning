#!/usr/bin/env node
// 04-categorize.mjs
// Map candidates to the 15 life-vocab categories.
// Strategy:
//   1. Match imsky topic + YLE topic to categories (priority order).
//   2. Use POS + CEFR as fallback (adjectives -> texture/feelings, verbs -> actions).
//   3. Within each category, sort by COCA rank ascending and cap to a target size.
//   4. Emit:
//      - data/clean/by-category.json (full machine data)
//      - output/draft-review.csv     (human-friendly review file)

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLEAN = join(__dirname, '..', 'data', 'clean');
const OUTDIR = join(__dirname, '..', 'output');

const CATEGORIES = [
  { id: 'food-drinks', name: 'Food & Drinks 食物饮料', description: '日常吃饭、点餐和描述食物饮品。', target: 130 },
  { id: 'ingredients-flavor', name: 'Ingredients & Flavor 食材调味与口感', description: '调味、口感、新鲜度、甜咸酸辣等。', target: 90 },
  { id: 'house-building', name: 'House & Building 房屋建筑与材料', description: 'asphalt、cement、tile、wood、brick 等建筑材料和房屋结构。', target: 140 },
  { id: 'yard-outdoor', name: 'Yard & Outdoor 户外庭院', description: 'lawn、garden、fence、tree、soil 等户外环境。', target: 100 },
  { id: 'tools-repairs', name: 'Tools & Repairs 工具维修', description: 'hammer、screwdriver、nail、wrench 等工具与修理。', target: 110 },
  { id: 'home-items', name: 'Home Items 家居用品', description: '家具、家电、容器、收纳。', target: 140 },
  { id: 'bathroom-cleaning', name: 'Bathroom & Cleaning 洗漱清洁', description: '洗澡、清洁、打扫工具与动作。', target: 90 },
  { id: 'texture-surface', name: 'Texture & Surface 质地表面', description: '粗糙、光滑、湿润、生锈等手感和天气感受。', target: 110 },
  { id: 'clothes-details', name: 'Clothes & Accessories 衣物配饰', description: '衣物、鞋袜、配件、拉链口袋等。', target: 110 },
  { id: 'body-actions', name: 'Body & Health 身体健康', description: '身体部位、感受、健康问题、医疗。', target: 130 },
  { id: 'precise-actions', name: 'Precise Actions 精细动作', description: '敲、抠、捏、扭、撕、剥、切、倒等动作动词。', target: 140 },
  { id: 'school-life', name: 'School Life 学校生活', description: '教室、文具、作业、考试、课堂指令。', target: 110 },
  { id: 'street-city', name: 'Street & City 街道城市', description: '街道、交通、车辆、城市公共设施。', target: 110 },
  { id: 'shopping-money', name: 'Shopping & Money 购物金钱', description: '购物、价格、支付、工作。', target: 90 },
  { id: 'feelings-social', name: 'Feelings & Social 情绪社交', description: '情绪、性格、社交、表达。', target: 110 },
];

// imsky topic -> category id (ordered priority list per topic)
const IMSKY_MAP = {
  // food / drinks
  'nouns/food': ['food-drinks'],
  'nouns/fruit': ['food-drinks'],
  'nouns/fast_food': ['food-drinks'],
  'nouns/meat': ['food-drinks'],
  'nouns/fish': ['food-drinks'],
  'nouns/water': ['food-drinks'],
  'nouns/spirits': ['food-drinks'],
  'nouns/wine': ['food-drinks'],
  // flavors
  'nouns/seasonings': ['ingredients-flavor'],
  'nouns/condiments': ['ingredients-flavor'],
  'adjectives/taste': ['ingredients-flavor'],
  'adjectives/food': ['ingredients-flavor'],
  'verbs/cooking': ['ingredients-flavor', 'precise-actions'],
  // house & building
  'nouns/houses': ['house-building'],
  'nouns/buildings': ['house-building'],
  'nouns/architecture': ['house-building'],
  'nouns/infrastructure': ['house-building'],
  'nouns/real_estate': ['house-building'],
  'nouns/construction': ['house-building'],
  'nouns/metals': ['house-building'],
  'nouns/minerals': ['house-building'],
  'nouns/wood': ['house-building'],
  'adjectives/construction': ['house-building'],
  'adjectives/materials': ['house-building'],
  // yard / outdoor
  'nouns/geography': ['yard-outdoor'],
  'nouns/plants': ['yard-outdoor'],
  'nouns/birds': ['yard-outdoor'],
  'nouns/dogs': ['yard-outdoor'],
  'nouns/cats': ['yard-outdoor'],
  // home items
  'nouns/furniture': ['home-items'],
  'nouns/containers': ['home-items'],
  'nouns/storage': ['home-items'],
  'nouns/phones': ['home-items'],
  'nouns/music_instruments': ['home-items'],
  // texture / surface
  'adjectives/appearance': ['texture-surface'],
  'adjectives/shape': ['texture-surface'],
  'adjectives/size': ['texture-surface'],
  'adjectives/temperature': ['texture-surface'],
  'adjectives/weather': ['texture-surface'],
  'adjectives/sound': ['texture-surface'],
  'adjectives/quantity': ['texture-surface'],
  'adjectives/colors': ['texture-surface'],
  // clothing — not in imsky directly; YLE handles it
  // body & actions
  'verbs/movement': ['body-actions', 'precise-actions'],
  'verbs/look': ['body-actions'],
  'verbs/manipulation': ['precise-actions'],
  'verbs/destruction': ['precise-actions'],
  'verbs/creation': ['precise-actions'],
  'verbs/collection': ['precise-actions'],
  'verbs/sports': ['body-actions'],
  // street / city — partial via cars
  'nouns/automobiles': ['street-city'],
  'nouns/car_parts': ['street-city'],
  'verbs/driving': ['street-city'],
  'nouns/driving': ['street-city'],
  'nouns/travel': ['street-city'],
  // shopping money
  'nouns/shopping': ['shopping-money'],
  // feelings / social
  'adjectives/emotions': ['feelings-social'],
  'adjectives/character': ['feelings-social'],
  'adjectives/age': ['feelings-social'],
  'verbs/communication': ['feelings-social'],
  'verbs/thought': ['feelings-social'],
  // misc adjectives -> texture by default if speed/loudness
  'adjectives/speed': ['precise-actions'],
};

// YLE topic -> category id
const YLE_MAP = {
  food_and_drink: ['food-drinks'],
  clothes: ['clothes-details'],
  body_and_face: ['body-actions'],
  home: ['home-items'],
  materials: ['house-building'],
  school: ['school-life'],
  transport: ['street-city'],
  weather: ['texture-surface'],
  sports_and_leisure: ['body-actions'],
  work: ['shopping-money'],
  health: ['body-actions'],
  toys: ['home-items'],
  world_around_us: ['yard-outdoor'],
  places_and_directions: ['street-city'],
  animals: ['yard-outdoor'],
  family_and_friends: ['feelings-social'],
  time: ['feelings-social'],
  colours: ['texture-surface'],
  numbers: ['feelings-social'],
  names: ['feelings-social'],
};

// Manual category assignment for high-value daily words missing from upstream topics.
// Curated by hand around real ELL daily-life gaps (asphalt, tile, lawn, faucet, etc).
const MANUAL_PINS = {
  // house & materials
  'house-building': [
    'asphalt', 'cement', 'concrete', 'brick', 'tile', 'plaster', 'lime', 'gravel', 'pavement',
    'drywall', 'plywood', 'lumber', 'beam', 'pillar', 'shingle', 'foundation', 'mortar',
    'ceiling', 'roof', 'basement', 'attic', 'driveway', 'sidewalk', 'fence', 'railing',
    'gutter', 'chimney', 'staircase', 'banister', 'porch', 'balcony', 'doorway', 'hallway',
    'studio', 'duplex', 'condo', 'townhouse', 'cabin', 'shed', 'garage', 'apartment',
    'insulation', 'siding', 'vent', 'pipe', 'wiring', 'outlet', 'rebar', 'tarp',
  ],
  // yard / outdoor
  'yard-outdoor': [
    'lawn', 'grass', 'weed', 'soil', 'mud', 'dirt', 'sprinkler', 'hose', 'shovel', 'rake',
    'broom', 'wheelbarrow', 'flowerbed', 'mulch', 'pebble', 'rock', 'pond', 'puddle', 'mound',
    'compost', 'leaves', 'twig', 'branch', 'trunk', 'root', 'stump', 'bush', 'shrub', 'hedge',
    'patio', 'deck', 'backyard', 'lawnmower', 'sandbox', 'swing', 'slide', 'treehouse',
    'birdhouse', 'beehive', 'anthill', 'spiderweb', 'fertilizer', 'pesticide', 'pollen', 'thorn',
  ],
  // tools & repairs
  'tools-repairs': [
    'hammer', 'nail', 'screw', 'screwdriver', 'wrench', 'drill', 'saw', 'pliers',
    'tape measure', 'level', 'glue', 'tape', 'duct tape', 'sandpaper', 'paintbrush',
    'roller', 'ladder', 'stepstool', 'toolbox', 'workbench', 'clamp', 'vise',
    'hinge', 'latch', 'bolt', 'washer', 'nut', 'spring', 'spanner', 'mallet',
    'crowbar', 'pickaxe', 'axe', 'chisel', 'file', 'plunger', 'utility knife',
    'flashlight', 'battery', 'cord', 'extension', 'plug', 'socket', 'switch', 'fuse',
    'faucet', 'tap', 'leak', 'crack', 'gap', 'rust', 'jam',
    'fix', 'repair', 'replace', 'tighten', 'loosen', 'adjust', 'unclog', 'rewire',
    'paint', 'sand', 'patch', 'weld', 'solder', 'screw in', 'screw out', 'mount',
    'install', 'measure', 'mark', 'cut', 'drill in', 'unscrew',
  ],
  // home items
  'home-items': [
    'mattress', 'pillow', 'blanket', 'sheet', 'duvet', 'comforter', 'curtain', 'blinds',
    'rug', 'carpet', 'doormat', 'shelf', 'cabinet', 'cupboard', 'drawer', 'closet',
    'wardrobe', 'dresser', 'nightstand', 'lamp', 'chandelier', 'fan', 'heater', 'cooler',
    'fridge', 'freezer', 'microwave', 'oven', 'stove', 'toaster', 'kettle', 'blender',
    'mixer', 'dishwasher', 'washer', 'dryer', 'vacuum', 'iron', 'remote', 'charger',
  ],
  // bathroom & cleaning
  'bathroom-cleaning': [
    'sink', 'mirror', 'tub', 'shower', 'showerhead', 'drain', 'toilet', 'toilet paper',
    'tissue', 'towel', 'washcloth', 'sponge', 'rag', 'mop', 'broom', 'dustpan',
    'vacuum cleaner', 'detergent', 'bleach', 'disinfectant', 'soap', 'shampoo', 'conditioner',
    'lotion', 'razor', 'shaving cream', 'toothbrush', 'toothpaste', 'floss', 'mouthwash',
    'shower curtain', 'bath mat', 'plunger',
    'stain', 'dust', 'mold', 'mildew', 'crumbs', 'lint', 'foam', 'grime', 'grease',
    'wipe', 'scrub', 'sweep', 'rinse', 'soak', 'lather', 'flush', 'spray', 'mop up',
    'tidy up', 'declutter', 'organize', 'sanitize',
  ],
  // texture & surface
  'texture-surface': [
    'rough', 'smooth', 'slippery', 'sticky', 'dusty', 'greasy', 'damp', 'soggy',
    'cracked', 'stained', 'rusty', 'shiny', 'glossy', 'matte', 'fluffy', 'spongy',
    'lumpy', 'bumpy', 'soft', 'firm', 'hard', 'flaky', 'brittle', 'fragile', 'sturdy',
    'wrinkled', 'creased', 'dented', 'chipped', 'frayed', 'torn', 'patchy',
  ],
  // ingredients & flavor
  'ingredients-flavor': [
    'sour', 'bitter', 'salty', 'savory', 'bland', 'spicy', 'crispy', 'crunchy', 'chewy',
    'tender', 'juicy', 'stale', 'ripe', 'rotten', 'mushy', 'tart', 'zesty', 'creamy',
    'flaky', 'fluffy', 'tangy', 'sticky', 'gooey', 'rich', 'fatty', 'lean', 'fresh',
    'flavor', 'aroma', 'seasoning', 'dressing', 'sauce', 'gravy', 'broth', 'syrup',
    'oil', 'vinegar', 'mustard', 'ketchup', 'mayo', 'soy sauce', 'salsa', 'jam', 'jelly',
    'sugar', 'salt', 'pepper', 'flour', 'yeast', 'baking soda', 'starch',
  ],
  // precise actions
  'precise-actions': [
    'tap', 'knock', 'poke', 'pinch', 'squeeze', 'scratch', 'scrape', 'peel', 'twist',
    'fold', 'unfold', 'bend', 'grab', 'toss', 'spill', 'flip', 'tug', 'pat', 'rub',
    'wring', 'plug', 'unplug', 'sprinkle', 'stir', 'whisk', 'chop', 'slice', 'mash',
    'crush', 'grind', 'shake', 'wiggle', 'jiggle', 'lift', 'drop', 'pour', 'fill',
    'empty', 'wipe down', 'rinse off', 'scoop', 'dump', 'load', 'unload', 'pack', 'unpack',
    'sort', 'stack', 'flatten', 'crumple', 'shred', 'snap', 'click', 'tighten', 'loosen',
    'rip', 'tear', 'puncture', 'crack open', 'shut', 'kick', 'shove', 'pry', 'wedge',
  ],
  // street & city
  'street-city': [
    'curb', 'crosswalk', 'pavement', 'pothole', 'intersection', 'sidewalk', 'lane',
    'sign', 'signal', 'traffic light', 'stop sign', 'roundabout', 'overpass', 'underpass',
    'bridge', 'tunnel', 'highway', 'freeway', 'exit', 'ramp', 'shoulder', 'median',
    'parking lot', 'parking meter', 'bus stop', 'bus lane', 'bike lane', 'fire hydrant',
    'streetlight', 'lamppost', 'manhole', 'fence', 'wall', 'gate', 'barrier',
    'driver', 'pedestrian', 'cyclist', 'jaywalker', 'commuter', 'rush hour', 'traffic jam',
    'pull over', 'merge', 'yield', 'detour', 'tow', 'park', 'honk', 'speed up', 'slow down',
  ],
  // school life
  'school-life': [
    'binder', 'folder', 'worksheet', 'handout', 'rubric', 'syllabus', 'locker', 'hallway',
    'classroom', 'lab', 'gym', 'cafeteria', 'principal', 'counselor', 'janitor',
    'glue stick', 'highlighter', 'marker', 'eraser', 'sharpener', 'clipboard', 'stapler',
    'ruler', 'compass', 'protractor', 'calculator', 'notebook', 'notepad', 'planner',
    'textbook', 'workbook', 'novel', 'paperback', 'hardcover',
    'pencil case', 'backpack', 'lunchbox', 'water bottle',
    'assignment', 'quiz', 'test', 'midterm', 'final', 'essay', 'report', 'presentation',
    'project', 'experiment', 'lab report', 'field trip', 'recess', 'detention',
    'circle', 'underline', 'highlight', 'cross out', 'fill in', 'submit', 'hand in', 'turn in',
    'attendance', 'tardy', 'absent', 'permission slip', 'rubber band', 'paperclip',
  ],
  // clothes & accessories details
  'clothes-details': [
    'sleeve', 'collar', 'button', 'zipper', 'pocket', 'shoelace', 'hood', 'cuff',
    'seam', 'hem', 'wrinkle', 'lining', 'strap', 'belt loop', 'buckle', 'fly',
    'snap', 'velcro', 'lace', 'ribbon', 'patch', 'stitch',
    'underwear', 'undershirt', 'tank top', 'long sleeve', 'sweatshirt', 'hoodie',
    'pullover', 'cardigan', 'vest', 'raincoat', 'parka', 'windbreaker', 'scarf',
    'beanie', 'mittens', 'flip-flops', 'sandals', 'sneakers', 'slippers', 'boots',
    'jacket', 'pajamas', 'robe', 'apron', 'overalls', 'jumpsuit',
    'cotton', 'denim', 'wool', 'silk', 'leather', 'nylon', 'polyester', 'fleece',
    'plaid', 'striped', 'checkered', 'baggy', 'snug', 'tight', 'loose', 'oversized',
    'wash', 'dry', 'fold', 'hang', 'iron', 'mend', 'tear', 'stain',
  ],
  // body & health
  'body-actions': [
    'blink', 'yawn', 'sneeze', 'cough', 'shiver', 'sweat', 'limp', 'itch', 'numb',
    'dizzy', 'sore', 'gasp', 'sniff', 'frown', 'flinch', 'wince', 'twitch', 'hiccup',
    'burp', 'belch', 'gag', 'choke', 'cramp', 'bruise', 'scab', 'blister', 'rash',
    'wheeze', 'snore', 'drool', 'spit', 'grin', 'pout', 'wave', 'nod', 'shrug',
    'fingernail', 'toenail', 'eyebrow', 'eyelash', 'eyelid', 'gums', 'tongue', 'lip',
    'forehead', 'temple', 'cheekbone', 'chin', 'jaw', 'collarbone', 'wrist', 'ankle',
    'palm', 'sole', 'heel', 'spine', 'ribs', 'hip', 'thigh', 'calf', 'elbow',
  ],
  // shopping & money
  'shopping-money': [
    'cashier', 'aisle', 'shelf', 'rack', 'shelf tag', 'barcode', 'register', 'receipt',
    'change', 'coin', 'bill', 'wallet', 'purse', 'shopping cart', 'shopping bag',
    'tote', 'grocery list', 'discount', 'coupon', 'voucher', 'gift card', 'membership',
    'refund', 'exchange', 'return', 'warranty', 'tag', 'sticker', 'price tag',
    'on sale', 'sold out', 'in stock', 'out of stock', 'free sample', 'self-checkout',
    'tip', 'tax', 'cash', 'credit', 'debit', 'check', 'ATM', 'deposit', 'withdraw',
    'budget', 'spend', 'save', 'lend', 'borrow', 'owe', 'pay back', 'split', 'share',
    'cheap', 'affordable', 'expensive', 'pricey', 'overpriced', 'worth it',
  ],
};

const candidates = JSON.parse(readFileSync(join(CLEAN, 'life-candidates.json'), 'utf8'));
const byWord = new Map(candidates.map(w => [w.word, w]));

const buckets = new Map(CATEGORIES.map(c => [c.id, []]));
const skipped = [];

// Helper: assign a candidate to its best category (first hit by priority order)
function pickCategory(w) {
  // 1. imsky topics
  for (const t of w.imskyTopics || []) {
    const arr = IMSKY_MAP[t];
    if (arr && arr.length) return { cat: arr[0], reason: `imsky:${t}` };
  }
  // 2. YLE topics
  for (const t of w.yleTopics || []) {
    const arr = YLE_MAP[t];
    if (arr && arr.length) return { cat: arr[0], reason: `yle:${t}` };
  }
  // 3. POS-based fallback (only for words with daily-life rank signal)
  if (w.cocaRank && w.cocaRank <= 6000) {
    if (w.contentPos.includes('verb')) return { cat: 'precise-actions', reason: 'fallback:verb-coca' };
    if (w.contentPos.includes('adjective')) return { cat: 'feelings-social', reason: 'fallback:adj-coca' };
  }
  return null;
}

// Pass 1: imsky/yle/POS heuristics
for (const w of candidates) {
  const pick = pickCategory(w);
  if (!pick) { skipped.push(w.word); continue; }
  buckets.get(pick.cat).push({ ...w, _reason: pick.reason });
}

// Pass 2: manual pins promote/override
for (const [catId, words] of Object.entries(MANUAL_PINS)) {
  for (const w of words) {
    if (!byWord.has(w)) {
      // word not in candidates – still add as a manual entry (no upstream metadata)
      buckets.get(catId).push({
        word: w,
        pos: w.includes(' ') ? ['noun'] : [],
        contentPos: [],
        cefr: null,
        phon_us: null,
        phon_br: null,
        oxfordDef: null,
        cocaRank: null,
        cocaPos: null,
        imskyTopics: [],
        yleTopics: [],
        yleLevel: null,
        sources: ['manual-pin'],
        _reason: 'manual-pin',
        _manual: true,
      });
      continue;
    }
    const wd = byWord.get(w);
    // Remove from any current bucket first
    for (const b of buckets.values()) {
      const idx = b.findIndex(x => x.word === w);
      if (idx >= 0) b.splice(idx, 1);
    }
    buckets.get(catId).push({ ...wd, _reason: 'manual-pin' });
  }
}

// Sort each bucket: manual pins first, then by CEFR rank then COCA rank
const cefrOrder = { a1: 1, a2: 2, b1: 3, b2: 4 };
for (const [, b] of buckets) {
  b.sort((a, b2) => {
    if (a._reason === 'manual-pin' && b2._reason !== 'manual-pin') return -1;
    if (b2._reason === 'manual-pin' && a._reason !== 'manual-pin') return 1;
    const ca = cefrOrder[a.cefr] || 9;
    const cb = cefrOrder[b2.cefr] || 9;
    if (ca !== cb) return ca - cb;
    return (a.cocaRank || 99999) - (b2.cocaRank || 99999);
  });
}

// Cap each category by target size
const capped = {};
let total = 0;
for (const cat of CATEGORIES) {
  const items = buckets.get(cat.id).slice(0, cat.target);
  capped[cat.id] = items;
  total += items.length;
}

writeFileSync(join(CLEAN, 'by-category.json'), JSON.stringify({ categories: CATEGORIES, buckets: capped }, null, 0));

// CSV review
let csv = 'category,word,cefr,cocaRank,pos,reason,oxfordDef\n';
for (const cat of CATEGORIES) {
  for (const w of capped[cat.id]) {
    const pos = (w.contentPos || w.pos || []).join('|');
    const def = (w.oxfordDef || '').replace(/[\n"]/g, ' ').slice(0, 120);
    csv += `${cat.id},"${w.word}",${w.cefr || ''},${w.cocaRank || ''},${pos},${w._reason || ''},"${def}"\n`;
  }
}
writeFileSync(join(OUTDIR, 'draft-review.csv'), csv);

// Stats per bucket
const stats = CATEGORIES.map(c => ({ id: c.id, target: c.target, kept: capped[c.id].length }));
console.log('Categorize done. Total:', total);
console.table(stats);
console.log('Skipped (no category):', skipped.length);
