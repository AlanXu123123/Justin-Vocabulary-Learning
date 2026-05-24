#!/usr/bin/env node
// 16-categorize-hs.mjs
// Map merged-hs candidates into 19 high-school life categories.
// Strategy:
//   Pass 1: manual pins (per category)              - forced placement
//   Pass 2: imsky topic -> category                 - strong signal
//   Pass 3: YLE topic -> category                   - medium signal
//   Pass 4: POS + signal heuristics                 - weak fallback
//   Cap each bucket at its target size, keepCore words always survive.
//
// Output: data/clean/by-category-hs.json
//         output/draft-review-hs.csv

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLEAN = join(__dirname, '..', 'data', 'clean');
const OUTDIR = join(__dirname, '..', 'output');

const CATEGORIES = [
  { id: 'food-drinks', name: 'Food & Drinks 食物饮料', description: '日常吃喝、餐厅点单、北美超市常见食材。', target: 130 },
  { id: 'ingredients-flavor', name: 'Ingredients & Flavor 食材调味与口感', description: '调味、口感、烹饪方式与食物质感。', target: 110 },
  { id: 'house-building', name: 'House & Building 房屋建筑与材料', description: '建材、户型、北美房屋结构与术语。', target: 130 },
  { id: 'yard-outdoor', name: 'Yard & Outdoor 户外庭院', description: '草坪、园艺、户外环境与日常打理。', target: 110 },
  { id: 'tools-repairs', name: 'Tools & Repairs 工具维修', description: '工具、五金、修理动作与水电维护。', target: 120 },
  { id: 'home-items', name: 'Home Items 家居用品', description: '家具家电、收纳、家居杂物。', target: 130 },
  { id: 'bathroom-cleaning', name: 'Bathroom & Cleaning 洗漱清洁', description: '盥洗、洗护用品、家务清洁。', target: 100 },
  { id: 'texture-surface', name: 'Texture & Surface 质地表面', description: '表面、质感、状态变化（粗糙、潮湿、磨损）。', target: 110 },
  { id: 'clothes-details', name: 'Clothes & Accessories 衣物配饰', description: '衣物、鞋袜、配件、面料与穿搭。', target: 120 },
  { id: 'body-actions', name: 'Body & Health 身体与健康', description: '身体部位、生理感受、动作。', target: 130 },
  { id: 'precise-actions', name: 'Precise Actions 精细动作', description: '敲、抠、捏、切、拧、剥、撕等精细动词。', target: 130 },
  { id: 'school-life', name: 'School Life 学校生活', description: '北美高中课程、文具、考试、活动。', target: 130 },
  { id: 'street-city', name: 'Street & City 街道城市', description: '街道、交通、城市公共设施与出行。', target: 120 },
  { id: 'shopping-money', name: 'Shopping & Money 购物金钱', description: '购物、价格、消费习惯、银行与账单。', target: 110 },
  { id: 'feelings-social', name: 'Feelings & Social 情绪社交', description: '情绪、性格、社交互动与表达。', target: 130 },
  { id: 'tech-social', name: 'Tech & Social Media 数字生活', description: '手机、电脑、社交平台、网络用语。', target: 110 },
  { id: 'mental-health', name: 'Mental & Physical Health 身心健康', description: '心理健康、压力、睡眠、就医、药物。', target: 110 },
  { id: 'part-time-work', name: 'Part-time Work & Finance 打工与高中财经', description: '兼职、面试、工资、税务、保险、学贷。', target: 100 },
  { id: 'outdoor-adventure', name: 'Outdoor Adventure 户外探险', description: '徒步、露营、滑雪、自然灾害与北美户外生活。', target: 110 },
];

// imsky topic -> [priorityCategoryIds]
const IMSKY_MAP = {
  'nouns/food': ['food-drinks'],
  'nouns/fruit': ['food-drinks'],
  'nouns/fast_food': ['food-drinks'],
  'nouns/meat': ['food-drinks'],
  'nouns/fish': ['food-drinks'],
  'nouns/water': ['food-drinks'],
  'nouns/spirits': ['food-drinks'],
  'nouns/wine': ['food-drinks'],
  'nouns/seasonings': ['ingredients-flavor'],
  'nouns/condiments': ['ingredients-flavor'],
  'adjectives/taste': ['ingredients-flavor'],
  'adjectives/food': ['ingredients-flavor'],
  'verbs/cooking': ['ingredients-flavor', 'precise-actions'],
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
  'nouns/geography': ['outdoor-adventure', 'yard-outdoor'],
  'nouns/plants': ['yard-outdoor'],
  'nouns/birds': ['outdoor-adventure'],
  'nouns/dogs': ['yard-outdoor'],
  'nouns/cats': ['yard-outdoor'],
  'nouns/furniture': ['home-items'],
  'nouns/containers': ['home-items'],
  'nouns/storage': ['home-items'],
  'nouns/phones': ['tech-social'],
  'nouns/music_instruments': ['home-items'],
  'adjectives/appearance': ['feelings-social'],
  'adjectives/shape': ['texture-surface'],
  'adjectives/size': ['texture-surface'],
  'adjectives/temperature': ['texture-surface'],
  'adjectives/weather': ['outdoor-adventure'],
  'adjectives/sound': ['texture-surface'],
  'adjectives/quantity': ['shopping-money'],
  'adjectives/colors': ['texture-surface'],
  'verbs/movement': ['body-actions', 'precise-actions'],
  'verbs/look': ['body-actions'],
  'verbs/manipulation': ['precise-actions'],
  'verbs/destruction': ['precise-actions'],
  'verbs/creation': ['precise-actions'],
  'verbs/collection': ['precise-actions'],
  'verbs/sports': ['outdoor-adventure'],
  'nouns/automobiles': ['street-city'],
  'nouns/car_parts': ['street-city'],
  'verbs/driving': ['street-city'],
  'nouns/driving': ['street-city'],
  'nouns/travel': ['outdoor-adventure'],
  'nouns/shopping': ['shopping-money'],
  'adjectives/emotions': ['feelings-social'],
  'adjectives/character': ['feelings-social'],
  'adjectives/age': ['feelings-social'],
  'verbs/communication': ['feelings-social'],
  'verbs/thought': ['feelings-social'],
  'adjectives/speed': ['precise-actions'],
};

const YLE_MAP = {
  food_and_drink: ['food-drinks'],
  clothes: ['clothes-details'],
  body_and_face: ['body-actions'],
  home: ['home-items'],
  materials: ['house-building'],
  school: ['school-life'],
  transport: ['street-city'],
  weather: ['outdoor-adventure'],
  sports_and_leisure: ['outdoor-adventure'],
  work: ['part-time-work'],
  health: ['mental-health'],
  toys: ['home-items'],
  world_around_us: ['outdoor-adventure'],
  places_and_directions: ['street-city'],
  animals: ['outdoor-adventure'],
  family_and_friends: ['feelings-social'],
  time: ['feelings-social'],
  colours: ['texture-surface'],
  numbers: ['shopping-money'],
  names: ['feelings-social'],
};

// Manual pins — curated HS-level words guaranteed to land in their category.
// These cover gaps the upstream corpora miss (especially the 4 new categories).
const MANUAL_PINS = {
  'food-drinks': [
    'avocado', 'bagel', 'burrito', 'taco', 'quesadilla', 'sushi', 'ramen', 'pho',
    'salmon', 'tuna', 'shrimp', 'lobster', 'crab', 'oyster', 'mussel', 'scallop',
    'broccoli', 'spinach', 'kale', 'arugula', 'asparagus', 'zucchini', 'eggplant',
    'mushroom', 'pepper', 'jalapeno', 'cilantro', 'parsley', 'basil', 'mint',
    'ginger', 'garlic', 'lime', 'lemon', 'grapefruit', 'mango', 'pineapple', 'kiwi',
    'blueberry', 'raspberry', 'cranberry', 'pomegranate', 'melon', 'cantaloupe',
    'pancake', 'waffle', 'omelet', 'smoothie', 'latte', 'espresso', 'cappuccino',
    'soda', 'sparkling water', 'iced tea', 'lemonade', 'wine', 'cocktail',
    'cereal', 'granola', 'yogurt', 'oatmeal', 'porridge', 'muffin', 'donut',
    'brownie', 'cookie', 'pie', 'cheesecake', 'tiramisu', 'ice cream', 'gelato',
    'leftover', 'takeout', 'delivery', 'reservation', 'appetizer', 'entree', 'side',
    'buffet', 'brunch', 'happy hour', 'tip', 'check', 'cashier',
  ],
  'ingredients-flavor': [
    'savory', 'umami', 'tangy', 'zesty', 'aromatic', 'pungent', 'acrid', 'rancid',
    'fermented', 'pickled', 'cured', 'smoked', 'roasted', 'grilled', 'fried',
    'baked', 'steamed', 'broiled', 'simmered', 'sauteed', 'braised', 'marinated',
    'seasoned', 'glazed', 'caramelized', 'crusty', 'flaky', 'tender', 'juicy',
    'mushy', 'stale', 'spoiled', 'ripe', 'overripe', 'underripe', 'fresh', 'frozen',
    'thawed', 'preserved', 'organic', 'gluten-free', 'vegan', 'vegetarian', 'dairy',
    'whisk', 'stir', 'fold', 'knead', 'sift', 'measure', 'pour', 'drizzle',
    'sprinkle', 'season', 'taste', 'chop', 'mince', 'dice', 'slice', 'cube',
    'peel', 'grate', 'shred', 'crush', 'mash', 'puree', 'blend',
    'broth', 'stock', 'gravy', 'sauce', 'syrup', 'glaze', 'marinade', 'dressing',
    'vinegar', 'olive oil', 'soy sauce', 'mustard', 'mayo', 'ketchup', 'hot sauce',
    'flour', 'sugar', 'yeast', 'baking soda', 'baking powder', 'cornstarch',
  ],
  'house-building': [
    'asphalt', 'cement', 'concrete', 'brick', 'tile', 'plaster', 'gravel', 'pavement',
    'drywall', 'plywood', 'lumber', 'beam', 'pillar', 'shingle', 'foundation', 'mortar',
    'ceiling', 'attic', 'basement', 'crawl space', 'garage', 'driveway', 'sidewalk',
    'fence', 'railing', 'gutter', 'chimney', 'staircase', 'banister', 'hallway',
    'porch', 'balcony', 'doorway', 'archway', 'partition', 'panel', 'insulation',
    'siding', 'stucco', 'vinyl', 'hardwood', 'laminate', 'subfloor', 'baseboard',
    'molding', 'trim', 'sheetrock', 'rebar', 'rafter', 'joist', 'truss',
    'studio', 'duplex', 'condo', 'townhouse', 'cabin', 'shed', 'apartment',
    'mortgage', 'lease', 'sublease', 'eviction', 'landlord', 'tenant', 'utilities',
    'square footage', 'blueprint', 'permit', 'inspection', 'renovation', 'remodel',
    'vent', 'pipe', 'wiring', 'outlet', 'fuse box', 'circuit breaker', 'plumbing',
    'tarp', 'scaffolding',
  ],
  'yard-outdoor': [
    'lawn', 'grass', 'weed', 'soil', 'mud', 'dirt', 'sprinkler', 'hose', 'shovel',
    'rake', 'broom', 'wheelbarrow', 'flowerbed', 'mulch', 'pebble', 'boulder',
    'pond', 'puddle', 'compost', 'leaves', 'twig', 'branch', 'trunk', 'root',
    'stump', 'bush', 'shrub', 'hedge', 'patio', 'deck', 'backyard', 'lawnmower',
    'sandbox', 'swing set', 'trampoline', 'treehouse', 'birdhouse', 'beehive',
    'anthill', 'spiderweb', 'fertilizer', 'pesticide', 'pollen', 'thorn',
    'gardening', 'planter', 'pot', 'trowel', 'pruning shears', 'leaf blower',
    'rake leaves', 'mow', 'prune', 'trim', 'plant', 'water', 'fertilize',
    'firepit', 'gazebo', 'pergola', 'awning', 'umbrella', 'lounger', 'hammock',
    'barbecue', 'grill', 'cooler', 'lawn chair', 'picnic table',
  ],
  'tools-repairs': [
    'hammer', 'nail', 'screw', 'screwdriver', 'wrench', 'drill', 'saw', 'pliers',
    'tape measure', 'level', 'glue', 'duct tape', 'sandpaper', 'paintbrush',
    'roller', 'ladder', 'stepstool', 'toolbox', 'workbench', 'clamp', 'vise',
    'hinge', 'latch', 'bolt', 'washer', 'nut', 'spring', 'mallet',
    'crowbar', 'pickaxe', 'axe', 'chisel', 'plunger', 'utility knife',
    'flashlight', 'cord', 'extension cord', 'plug', 'socket', 'switch', 'fuse',
    'faucet', 'leak', 'crack', 'gap', 'rust', 'jam', 'clog', 'mildew',
    'fix', 'repair', 'replace', 'tighten', 'loosen', 'adjust', 'unclog', 'rewire',
    'patch', 'weld', 'solder', 'caulk', 'sealant', 'putty', 'epoxy',
    'install', 'measure', 'mark', 'cut', 'unscrew', 'sand', 'paint', 'stain',
    'wallpaper', 'grout', 'spackle', 'pressure washer', 'shop vacuum',
    'circular saw', 'jigsaw', 'angle grinder', 'router', 'lathe', 'soldering iron',
  ],
  'home-items': [
    'mattress', 'pillow', 'blanket', 'sheet', 'duvet', 'comforter', 'curtain', 'blinds',
    'rug', 'carpet', 'doormat', 'shelf', 'cabinet', 'cupboard', 'drawer', 'closet',
    'wardrobe', 'dresser', 'nightstand', 'lamp', 'chandelier', 'fan', 'heater',
    'air conditioner', 'fridge', 'freezer', 'microwave', 'oven', 'stove', 'toaster',
    'kettle', 'blender', 'mixer', 'dishwasher', 'washer', 'dryer', 'vacuum',
    'iron', 'remote', 'charger', 'power strip', 'extension cord', 'thermostat',
    'smoke detector', 'fire extinguisher', 'humidifier', 'dehumidifier', 'air purifier',
    'crockpot', 'instant pot', 'air fryer', 'rice cooker', 'food processor',
    'coffee maker', 'espresso machine', 'juicer', 'stand mixer', 'hand mixer',
    'spatula', 'whisk', 'tongs', 'ladle', 'colander', 'strainer', 'cutting board',
    'mixing bowl', 'measuring cup', 'baking sheet', 'cookie sheet', 'casserole dish',
    'tupperware', 'food container', 'pantry', 'spice rack',
  ],
  'bathroom-cleaning': [
    'sink', 'mirror', 'tub', 'shower', 'showerhead', 'drain', 'toilet', 'toilet paper',
    'tissue', 'towel', 'washcloth', 'sponge', 'rag', 'mop', 'broom', 'dustpan',
    'detergent', 'bleach', 'disinfectant', 'soap', 'shampoo', 'conditioner',
    'lotion', 'razor', 'shaving cream', 'toothbrush', 'toothpaste', 'floss', 'mouthwash',
    'shower curtain', 'bath mat', 'plunger', 'air freshener', 'scented candle',
    'sanitizer', 'antibacterial', 'antiperspirant', 'deodorant', 'cologne', 'perfume',
    'tweezers', 'nail clippers', 'cotton swab', 'cotton ball', 'hairdryer', 'comb',
    'brush', 'curling iron', 'flat iron',
    'stain', 'dust', 'mold', 'mildew', 'crumbs', 'lint', 'foam', 'grime', 'grease',
    'wipe', 'scrub', 'sweep', 'rinse', 'soak', 'lather', 'flush', 'spray',
    'tidy up', 'declutter', 'organize', 'sanitize', 'disinfect', 'launder', 'iron',
    'fold laundry', 'change sheets', 'take out trash', 'recycle',
  ],
  'texture-surface': [
    'rough', 'smooth', 'slippery', 'sticky', 'dusty', 'greasy', 'damp', 'soggy',
    'cracked', 'stained', 'rusty', 'shiny', 'glossy', 'matte', 'fluffy', 'spongy',
    'lumpy', 'bumpy', 'soft', 'firm', 'flaky', 'brittle', 'fragile', 'sturdy',
    'wrinkled', 'creased', 'dented', 'chipped', 'frayed', 'torn', 'patchy',
    'translucent', 'transparent', 'opaque', 'reflective', 'iridescent', 'metallic',
    'velvety', 'silky', 'leathery', 'rubbery', 'plastic', 'porous', 'absorbent',
    'waterproof', 'breathable', 'insulated', 'lined', 'padded', 'cushioned',
    'jagged', 'serrated', 'pointy', 'blunt', 'curved', 'arched', 'tapered',
    'hollow', 'solid', 'liquid', 'gelatinous', 'molten', 'frothy', 'foamy',
    'crusty', 'crumbly', 'powdery', 'gritty', 'slimy', 'mushy', 'tender',
  ],
  'clothes-details': [
    'sleeve', 'collar', 'button', 'zipper', 'pocket', 'shoelace', 'hood', 'cuff',
    'seam', 'hem', 'wrinkle', 'lining', 'strap', 'belt loop', 'buckle', 'fly',
    'snap', 'velcro', 'lace', 'ribbon', 'patch', 'stitch', 'embroidery', 'fringe',
    'pleat', 'ruffle', 'sequin', 'rhinestone',
    'underwear', 'undershirt', 'tank top', 'long sleeve', 'sweatshirt', 'hoodie',
    'pullover', 'cardigan', 'vest', 'raincoat', 'parka', 'windbreaker', 'scarf',
    'beanie', 'mittens', 'flip-flops', 'sandals', 'sneakers', 'slippers', 'boots',
    'jacket', 'pajamas', 'robe', 'apron', 'overalls', 'jumpsuit', 'leggings',
    'jeans', 'shorts', 'skirt', 'blouse', 'turtleneck', 'crewneck', 'V-neck',
    'cotton', 'denim', 'wool', 'silk', 'leather', 'nylon', 'polyester', 'fleece',
    'cashmere', 'linen', 'spandex', 'flannel', 'corduroy', 'tweed',
    'plaid', 'striped', 'checkered', 'floral', 'paisley', 'tie-dye', 'graphic',
    'baggy', 'snug', 'tight', 'loose', 'oversized', 'cropped', 'high-waisted',
    'iron', 'mend', 'tear', 'tailor', 'alter', 'dry-clean', 'hand wash',
  ],
  'body-actions': [
    'blink', 'yawn', 'sneeze', 'cough', 'shiver', 'sweat', 'limp', 'itch', 'numb',
    'dizzy', 'sore', 'gasp', 'sniff', 'frown', 'flinch', 'wince', 'twitch', 'hiccup',
    'burp', 'belch', 'gag', 'choke', 'cramp', 'bruise', 'scab', 'blister', 'rash',
    'wheeze', 'snore', 'drool', 'spit', 'grin', 'pout', 'wave', 'nod', 'shrug',
    'fingernail', 'toenail', 'eyebrow', 'eyelash', 'eyelid', 'gums', 'tongue', 'lip',
    'forehead', 'temple', 'cheekbone', 'chin', 'jaw', 'collarbone', 'wrist', 'ankle',
    'palm', 'sole', 'heel', 'spine', 'ribs', 'hip', 'thigh', 'calf', 'elbow',
    'kneecap', 'shin', 'knuckle', 'earlobe', 'nostril', 'eardrum', 'eyeball',
    'pinky', 'index finger', 'middle finger', 'ring finger',
    'flex', 'stretch', 'crouch', 'kneel', 'lean', 'slouch', 'tiptoe', 'tumble',
    'sprint', 'jog', 'stroll', 'wander', 'march', 'tiptoe', 'crawl',
  ],
  'precise-actions': [
    'tap', 'knock', 'poke', 'pinch', 'squeeze', 'scratch', 'scrape', 'peel', 'twist',
    'fold', 'unfold', 'bend', 'grab', 'toss', 'spill', 'flip', 'tug', 'pat', 'rub',
    'wring', 'plug', 'unplug', 'sprinkle', 'stir', 'whisk', 'chop', 'slice', 'mash',
    'crush', 'grind', 'shake', 'wiggle', 'jiggle', 'lift', 'drop', 'pour', 'fill',
    'empty', 'rinse off', 'scoop', 'dump', 'load', 'unload', 'pack', 'unpack',
    'sort', 'stack', 'flatten', 'crumple', 'shred', 'snap', 'click', 'tighten', 'loosen',
    'rip', 'tear', 'puncture', 'crack', 'shut', 'kick', 'shove', 'pry', 'wedge',
    'thread', 'unthread', 'tie', 'untie', 'knot', 'lace', 'unlace', 'buckle',
    'unbuckle', 'zip', 'unzip', 'button', 'unbutton', 'fasten', 'unfasten',
    'screw in', 'unscrew', 'hammer in', 'pry off', 'pop open', 'wedge in',
    'spread', 'smear', 'dab', 'pat down', 'wipe down', 'rub off', 'polish',
    'shovel', 'sweep up', 'mop up', 'sponge off', 'swab', 'sift', 'strain',
  ],
  'school-life': [
    'binder', 'folder', 'worksheet', 'handout', 'rubric', 'syllabus', 'locker', 'hallway',
    'classroom', 'lab', 'gym', 'cafeteria', 'auditorium', 'library', 'principal',
    'counselor', 'janitor', 'substitute', 'TA', 'tutor', 'mentor', 'advisor',
    'glue stick', 'highlighter', 'marker', 'eraser', 'sharpener', 'clipboard', 'stapler',
    'ruler', 'compass', 'protractor', 'calculator', 'notebook', 'planner',
    'textbook', 'workbook', 'novel', 'paperback', 'hardcover',
    'pencil case', 'backpack', 'lunchbox', 'water bottle',
    'assignment', 'quiz', 'exam', 'midterm', 'final', 'essay', 'report', 'presentation',
    'project', 'experiment', 'lab report', 'field trip', 'recess', 'detention',
    'circle', 'underline', 'highlight', 'cross out', 'fill in', 'submit', 'hand in',
    'attendance', 'tardy', 'absent', 'permission slip', 'paperclip',
    'GPA', 'transcript', 'honor roll', 'valedictorian', 'salutatorian', 'graduation',
    'diploma', 'commencement', 'prom', 'homecoming', 'pep rally', 'spirit week',
    'extracurricular', 'club', 'varsity', 'JV', 'tryout', 'scholarship', 'recommendation',
    'AP class', 'honors', 'IB', 'dual enrollment', 'elective', 'prerequisite', 'credit',
    'semester', 'quarter', 'block schedule', 'study hall', 'free period', 'cram',
    'plagiarism', 'citation', 'bibliography', 'thesis', 'rough draft', 'final draft',
  ],
  'street-city': [
    'curb', 'crosswalk', 'pothole', 'intersection', 'sidewalk', 'lane', 'shoulder',
    'sign', 'signal', 'traffic light', 'stop sign', 'roundabout', 'overpass', 'underpass',
    'bridge', 'tunnel', 'highway', 'freeway', 'exit', 'ramp', 'median',
    'parking lot', 'parking meter', 'bus stop', 'bus lane', 'bike lane', 'fire hydrant',
    'streetlight', 'lamppost', 'manhole', 'gate', 'barrier', 'guardrail',
    'driver', 'pedestrian', 'cyclist', 'jaywalker', 'commuter', 'rush hour', 'traffic jam',
    'pull over', 'merge', 'yield', 'detour', 'tow', 'park', 'honk', 'speed up',
    'tailgate', 'cut off', 'rear-end', 'side swipe', 'fender bender',
    'subway', 'metro', 'tram', 'streetcar', 'taxi', 'rideshare', 'Uber', 'Lyft',
    'fare', 'toll', 'transit pass', 'platform', 'terminal', 'station',
    'downtown', 'uptown', 'suburb', 'neighborhood', 'block', 'avenue', 'boulevard',
    'alley', 'plaza', 'square', 'district', 'zip code', 'address',
    'skyscraper', 'high-rise', 'low-rise', 'mall', 'plaza', 'arcade', 'gallery',
  ],
  'shopping-money': [
    'cashier', 'aisle', 'shelf', 'rack', 'barcode', 'register', 'receipt',
    'change', 'coin', 'bill', 'wallet', 'purse', 'shopping cart', 'shopping bag',
    'tote', 'discount', 'coupon', 'voucher', 'gift card', 'membership',
    'refund', 'exchange', 'return', 'warranty', 'tag', 'sticker', 'price tag',
    'on sale', 'sold out', 'in stock', 'out of stock', 'free sample', 'self-checkout',
    'tip', 'tax', 'cash', 'credit', 'debit', 'check', 'ATM', 'deposit', 'withdraw',
    'budget', 'spend', 'save', 'lend', 'borrow', 'owe', 'pay back', 'split',
    'cheap', 'affordable', 'expensive', 'pricey', 'overpriced', 'worth it',
    'subscription', 'monthly fee', 'annual fee', 'auto-pay', 'installment', 'down payment',
    'loan', 'interest rate', 'credit score', 'debit card', 'checking account', 'savings account',
    'overdraft', 'bounce', 'venmo', 'paypal', 'zelle', 'cashback', 'rewards points',
    'haggle', 'negotiate', 'bargain', 'clearance', 'mark down', 'sticker shock',
    'brand name', 'generic', 'knockoff', 'authentic', 'counterfeit',
  ],
  'feelings-social': [
    'happy', 'sad', 'angry', 'excited', 'nervous', 'scared', 'bored', 'tired',
    'lonely', 'jealous', 'proud', 'embarrassed', 'ashamed', 'guilty', 'frustrated',
    'annoyed', 'relieved', 'grateful', 'thankful', 'awkward', 'cringe', 'cringey',
    'awesome', 'amazing', 'incredible', 'mind-blowing', 'overwhelmed', 'hyped',
    'salty', 'savage', 'lit', 'chill', 'vibe', 'flex', 'shade', 'tea',
    'crush', 'date', 'dating', 'hookup', 'ghosted', 'ghosting', 'breakup', 'rebound',
    'BFF', 'frenemy', 'squad', 'crew', 'inner circle', 'mutual friend', 'roommate',
    'argue', 'fight', 'apologize', 'forgive', 'reconcile', 'make up', 'fall out',
    'gossip', 'rumor', 'compliment', 'insult', 'tease', 'mock', 'roast', 'banter',
    'introvert', 'extrovert', 'shy', 'outgoing', 'reserved', 'sociable', 'charming',
    'sarcastic', 'cynical', 'optimistic', 'pessimistic', 'realistic', 'idealistic',
    'empathy', 'sympathy', 'compassion', 'remorse', 'resentment', 'envy', 'spite',
    'condescending', 'patronizing', 'judgmental', 'open-minded', 'narrow-minded',
    'reliable', 'trustworthy', 'flaky', 'fake', 'genuine', 'authentic', 'two-faced',
    'fall in love', 'have a crush', 'hit it off', 'click', 'bond', 'drift apart',
  ],
  'tech-social': [
    'scroll', 'swipe', 'tap', 'pinch to zoom', 'double-tap', 'long press', 'drag',
    'screenshot', 'screen record', 'crop', 'filter', 'edit', 'caption', 'tag',
    'hashtag', 'mention', 'comment', 'reply', 'thread', 'retweet', 'repost', 'share',
    'like', 'unlike', 'love', 'react', 'upvote', 'downvote', 'subscribe', 'unsubscribe',
    'follow', 'unfollow', 'block', 'unblock', 'mute', 'unmute', 'snooze',
    'DM', 'direct message', 'group chat', 'inbox', 'notification', 'banner',
    'feed', 'timeline', 'story', 'reel', 'short', 'livestream', 'stream', 'broadcast',
    'profile', 'bio', 'avatar', 'username', 'handle', 'verified', 'blue check',
    'follower', 'following', 'subscriber', 'creator', 'influencer', 'sponsor',
    'algorithm', 'trending', 'viral', 'meme', 'GIF', 'emoji', 'sticker',
    'app', 'icon', 'widget', 'home screen', 'lock screen', 'wallpaper',
    'browser', 'tab', 'window', 'bookmark', 'history', 'cache', 'cookie',
    'download', 'upload', 'attach', 'forward', 'cc', 'bcc',
    'wifi', 'hotspot', 'bluetooth', 'airdrop', 'data plan', 'roaming', 'coverage',
    'login', 'log in', 'log out', 'sign up', 'sign in', 'password', 'two-factor',
    'recover', 'reset', 'verify', 'authenticate', 'biometric', 'face ID', 'fingerprint',
    'glitch', 'lag', 'crash', 'freeze', 'reboot', 'restart', 'update', 'upgrade',
    'virus', 'malware', 'spam', 'phishing', 'scam', 'hack', 'leak', 'breach',
  ],
  'mental-health': [
    'anxiety', 'anxious', 'stress', 'stressed', 'burnout', 'overwhelmed', 'panic',
    'panic attack', 'depression', 'depressed', 'mood', 'mood swing', 'irritable',
    'sad', 'lonely', 'hopeless', 'helpless', 'worthless', 'numb',
    'therapy', 'therapist', 'counselor', 'psychologist', 'psychiatrist',
    'meditate', 'meditation', 'mindfulness', 'breathing exercise', 'grounding',
    'journal', 'reflect', 'vent', 'cope', 'coping', 'process', 'heal', 'recover',
    'self-care', 'self-esteem', 'self-worth', 'self-doubt', 'self-conscious',
    'boundary', 'set boundaries', 'people-please', 'overthink', 'rumination',
    'trauma', 'triggered', 'trigger warning', 'safe space', 'support system',
    'antidepressant', 'medication', 'prescription', 'side effect', 'dosage',
    'sleep', 'insomnia', 'oversleep', 'nap', 'snooze', 'doze off', 'drowsy',
    'energy', 'fatigue', 'exhausted', 'drained', 'recharged',
    'dehydrated', 'hydrated', 'cramps', 'period', 'PMS', 'bloated', 'nausea',
    'migraine', 'headache', 'fever', 'chills', 'sore throat', 'congested',
    'sneeze', 'cough', 'runny nose', 'stuffy nose', 'allergy', 'allergic',
    'asthma', 'inhaler', 'epi-pen', 'concussion', 'sprain', 'fracture',
    'urgent care', 'ER', 'emergency room', 'walk-in clinic', 'pediatrician',
    'pharmacy', 'pharmacist', 'refill', 'copay', 'deductible', 'insurance',
    'workout', 'cardio', 'strength training', 'stretching', 'yoga', 'pilates',
    'hydrate', 'electrolyte', 'protein', 'fiber', 'carbs', 'calorie', 'nutrient',
  ],
  'part-time-work': [
    'shift', 'paycheck', 'hourly wage', 'minimum wage', 'overtime', 'commission',
    'tip', 'gratuity', 'salary', 'bonus', 'raise', 'promotion', 'demotion',
    'punch in', 'punch out', 'clock in', 'clock out', 'time card', 'schedule',
    'rota', 'shift swap', 'cover a shift', 'call out', 'call in sick',
    'on call', 'flex hours', 'graveyard shift', 'split shift', 'closing shift',
    'employee', 'employer', 'manager', 'supervisor', 'coworker', 'colleague',
    'customer', 'client', 'patron', 'guest', 'regular',
    'resume', 'CV', 'cover letter', 'interview', 'reference', 'recommendation',
    'application', 'apply', 'hire', 'fire', 'lay off', 'let go', 'quit', 'resign',
    'orientation', 'training', 'onboarding', 'probation', 'evaluation', 'review',
    'internship', 'apprenticeship', 'volunteer', 'unpaid', 'paid', 'stipend',
    'W-2', 'W-4', '1099', 'tax form', 'withholding', 'deduction',
    'paystub', 'direct deposit', 'tip pool', 'tip-out', 'cash-only', 'card-only',
    'POS', 'cash register', 'till', 'drawer', 'change fund',
    'uniform', 'name tag', 'apron', 'badge',
    'union', 'overtime pay', 'sick leave', 'PTO', 'vacation', 'holiday pay',
    'tax return', 'refund', 'file taxes', 'FAFSA', 'student loan', 'scholarship',
    'grant', 'work-study', 'tuition', 'fees', 'dorm', 'meal plan',
    'budget', 'spending', 'saving', 'investing', 'stock', 'cryptocurrency', 'bitcoin',
    'inflation', 'recession', 'economy', 'GDP', 'paycheck-to-paycheck',
  ],
  'outdoor-adventure': [
    'trail', 'trailhead', 'hike', 'backpacking', 'camp', 'campsite', 'tent',
    'sleeping bag', 'sleeping pad', 'tarp', 'rainfly', 'campfire', 'firewood',
    'kindling', 'matches', 'lighter', 'stove', 'lantern', 'flashlight',
    'compass', 'map', 'GPS', 'waypoint', 'topo map', 'trail marker',
    'kayak', 'canoe', 'paddle', 'paddleboard', 'raft', 'tube', 'innertube',
    'snorkel', 'scuba', 'wetsuit', 'life jacket', 'PFD',
    'ski', 'snowboard', 'snowshoe', 'sled', 'toboggan', 'sledding', 'tubing',
    'chairlift', 'gondola', 'lift ticket', 'ski pass', 'goggles', 'helmet',
    'mountain bike', 'road bike', 'BMX', 'trail running', 'rock climbing',
    'bouldering', 'belay', 'harness', 'carabiner', 'rappel', 'crampon',
    'blizzard', 'whiteout', 'frostbite', 'hypothermia', 'heatstroke', 'sunburn',
    'wildfire', 'forest fire', 'smoke', 'air quality', 'AQI', 'evacuation',
    'drought', 'flood', 'flash flood', 'hurricane', 'tornado', 'thunderstorm',
    'lightning', 'hail', 'sleet', 'frost', 'icy', 'slushy', 'overcast',
    'RV', 'motorhome', 'camper', 'trailer', 'cottage', 'cabin', 'lodge',
    'bear spray', 'bear bag', 'bear canister', 'mosquito', 'mosquito repellent',
    'sunscreen', 'SPF', 'bug bite', 'tick', 'poison ivy', 'poison oak',
    'wildlife', 'deer', 'moose', 'elk', 'bear', 'cougar', 'coyote', 'raccoon',
    'fishing rod', 'tackle', 'bait', 'lure', 'reel', 'catch and release',
    'national park', 'state park', 'provincial park', 'campground', 'backcountry',
    'leave no trace', 'pack out',
  ],
};

const candidates = JSON.parse(readFileSync(join(CLEAN, 'merged-hs.json'), 'utf8'));
const byWord = new Map(candidates.map(w => [w.word, w]));

const buckets = new Map(CATEGORIES.map(c => [c.id, []]));

function pickCategory(w) {
  for (const t of w.imskyTopics || []) {
    const arr = IMSKY_MAP[t];
    if (arr && arr.length) return { cat: arr[0], reason: `imsky:${t}` };
  }
  for (const t of w.yleTopics || []) {
    const arr = YLE_MAP[t];
    if (arr && arr.length) return { cat: arr[0], reason: `yle:${t}` };
  }
  return null;
}

// Pass 1: manual pins (override any prior placement)
const pinnedWords = new Set();
for (const [catId, words] of Object.entries(MANUAL_PINS)) {
  for (const w of words) {
    const lower = w.toLowerCase().trim();
    pinnedWords.add(lower);
    const base = byWord.get(lower);
    if (base) {
      buckets.get(catId).push({ ...base, _reason: 'manual-pin', _manualWord: lower });
    } else {
      // not in corpus — synthesize a manual-only entry
      buckets.get(catId).push({
        word: lower,
        pos: [],
        cefr: null,
        phon_us: null,
        phon_br: null,
        oxfordDef: null,
        cocaRank: null,
        googleRank: null,
        sat: false,
        isAcademic: false,
        isBasic: false,
        imskyTopics: [],
        yleTopics: [],
        yleLevel: null,
        sources: ['manual-pin'],
        keepCore: false,
        _reason: 'manual-pin',
        _manualWord: lower,
        _manual: true,
      });
    }
  }
}

// Pass 2 & 3: topic-based placement for non-pinned words
for (const w of candidates) {
  if (pinnedWords.has(w.word)) continue;
  const pick = pickCategory(w);
  if (!pick) continue;
  buckets.get(pick.cat).push({ ...w, _reason: pick.reason });
}

// Pass 4: keepCore words that didn't land anywhere — distribute via a softer rule
for (const w of candidates) {
  if (pinnedWords.has(w.word)) continue;
  if (!w.keepCore) continue;
  const alreadyPlaced = [...buckets.values()].some(b => b.some(x => x.word === w.word));
  if (alreadyPlaced) continue;
  const target = 'home-items'; // most generic fallback for core words
  buckets.get(target).push({ ...w, _reason: 'core-fallback' });
}

// Cap each category at target. Priority order:
//   1. manual-pin
//   2. keepCore
//   3. SAT
//   4. CEFR B1/B2/C1 with topic signal
//   5. by COCA rank ascending
const cefrOrder = { b1: 1, b2: 2, c1: 3 };
function priorityKey(w) {
  if (w._reason === 'manual-pin') return 0;
  if (w.keepCore) return 1;
  if (w.sat) return 2;
  if (cefrOrder[w.cefr]) return 3;
  return 4;
}

const capped = {};
let total = 0;
for (const cat of CATEGORIES) {
  const items = buckets.get(cat.id);
  // dedupe within bucket
  const seen = new Set();
  const dedup = [];
  for (const w of items) {
    if (seen.has(w.word)) continue;
    seen.add(w.word);
    dedup.push(w);
  }
  dedup.sort((a, b) => {
    const pa = priorityKey(a), pb = priorityKey(b);
    if (pa !== pb) return pa - pb;
    return (a.cocaRank || a.googleRank || 99999) - (b.cocaRank || b.googleRank || 99999);
  });
  const slice = dedup.slice(0, cat.target);
  capped[cat.id] = slice;
  total += slice.length;
}

writeFileSync(join(CLEAN, 'by-category-hs.json'), JSON.stringify({ categories: CATEGORIES, buckets: capped }, null, 0));

let csv = 'category,word,cefr,cocaRank,sat,keepCore,reason,oxfordDef\n';
for (const cat of CATEGORIES) {
  for (const w of capped[cat.id]) {
    const def = (w.oxfordDef || '').replace(/[\n"]/g, ' ').slice(0, 120);
    csv += `${cat.id},"${w.word}",${w.cefr || ''},${w.cocaRank || ''},${w.sat ? 'Y' : ''},${w.keepCore ? 'Y' : ''},${w._reason || ''},"${def}"\n`;
  }
}
writeFileSync(join(OUTDIR, 'draft-review-hs.csv'), csv);

console.log('categorize-hs done. total:', total);
console.table(CATEGORIES.map(c => ({ id: c.id, target: c.target, kept: capped[c.id].length })));
