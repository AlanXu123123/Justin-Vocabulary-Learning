// Life Basics vocabulary for ELL students who need daily-life foundation words.
// Scope is aligned with Fluent Forever 625, Cambridge Young Learners, CEFR A1/A2, and Oxford high-frequency basics.
(function () {
  function w(word, pos, cn, en, sub, source) {
    return { word: word, pos: pos, definitionCn: cn, definitionEn: en, subcategory: sub || '', source: source || 'Life Basics curated from FF625/Cambridge YLE/CEFR A1-A2/Oxford basics' };
  }

  var categories = [
    {
      id: 'food-drinks',
      name: 'Food & Drinks 食物饮料',
      description: '日常吃饭、点餐和描述食物最基础的词。',
      items: [
        w('rice', 'noun', '米饭；大米', 'Small white or brown grains often eaten as a main food.', 'staple food'),
        w('bread', 'noun', '面包', 'A baked food made from flour and water.', 'staple food'),
        w('egg', 'noun', '鸡蛋', 'An oval food from a chicken, often eaten for breakfast.', 'breakfast'),
        w('chicken', 'noun', '鸡肉；鸡', 'A common bird, or its meat used as food.', 'meat'),
        w('beef', 'noun', '牛肉', 'Meat from a cow.', 'meat'),
        w('pork', 'noun', '猪肉', 'Meat from a pig.', 'meat'),
        w('fish', 'noun', '鱼；鱼肉', 'An animal that lives in water, or its meat.', 'meat'),
        w('soup', 'noun', '汤', 'Hot liquid food made with vegetables, meat, or noodles.', 'meal'),
        w('noodle', 'noun', '面条', 'A long thin strip of dough cooked in water.', 'staple food'),
        w('sandwich', 'noun', '三明治', 'Food made with meat, cheese, or vegetables between bread.', 'meal'),
        w('cereal', 'noun', '早餐谷物', 'A breakfast food made from grains, usually eaten with milk.', 'breakfast'),
        w('snack', 'noun', '零食；小吃', 'A small amount of food eaten between meals.', 'snack'),
        w('water', 'noun', '水', 'A clear liquid that people drink.', 'drink'),
        w('milk', 'noun', '牛奶', 'A white drink from cows or other animals.', 'drink'),
        w('juice', 'noun', '果汁', 'A drink made from fruit or vegetables.', 'drink')
      ]
    },
    {
      id: 'fruit-vegetables',
      name: 'Fruit & Vegetables 水果蔬菜',
      description: '超市、餐厅、学校午餐中常见的水果和蔬菜。',
      items: [
        w('apple', 'noun', '苹果', 'A round fruit with red, green, or yellow skin.', 'fruit'),
        w('banana', 'noun', '香蕉', 'A long yellow fruit with soft sweet flesh.', 'fruit'),
        w('grape', 'noun', '葡萄', 'A small round fruit that grows in bunches.', 'fruit'),
        w('orange', 'noun', '橙子', 'A round orange-colored citrus fruit.', 'fruit'),
        w('strawberry', 'noun', '草莓', 'A small red fruit with tiny seeds on the outside.', 'fruit'),
        w('watermelon', 'noun', '西瓜', 'A large green fruit with red juicy flesh.', 'fruit'),
        w('carrot', 'noun', '胡萝卜', 'A long orange vegetable that grows under the ground.', 'vegetable'),
        w('potato', 'noun', '土豆；马铃薯', 'A round vegetable that grows under the ground.', 'vegetable'),
        w('tomato', 'noun', '番茄；西红柿', 'A soft red fruit often used like a vegetable.', 'vegetable'),
        w('onion', 'noun', '洋葱', 'A round vegetable with layers and a strong smell.', 'vegetable'),
        w('lettuce', 'noun', '生菜', 'A leafy green vegetable often used in salad.', 'vegetable'),
        w('cucumber', 'noun', '黄瓜', 'A long green vegetable often eaten raw.', 'vegetable'),
        w('pepper', 'noun', '甜椒；辣椒', 'A hollow vegetable that can be green, red, or yellow.', 'vegetable'),
        w('corn', 'noun', '玉米', 'A yellow grain vegetable that grows on a cob.', 'vegetable'),
        w('pea', 'noun', '豌豆', 'A small round green vegetable.', 'vegetable')
      ]
    },
    {
      id: 'kitchen-tableware',
      name: 'Kitchen & Tableware 厨房餐具',
      description: '厨房物品、餐具和做饭常用工具。',
      items: [
        w('plate', 'noun', '盘子', 'A flat dish used for eating food.', 'tableware'),
        w('bowl', 'noun', '碗', 'A round deep dish used for soup, rice, or cereal.', 'tableware'),
        w('cup', 'noun', '杯子', 'A small container used for drinking.', 'tableware'),
        w('glass', 'noun', '玻璃杯', 'A drinking container made of glass.', 'tableware'),
        w('fork', 'noun', '叉子', 'A tool with points used for eating food.', 'tableware'),
        w('spoon', 'noun', '勺子', 'A tool with a small bowl shape used for eating.', 'tableware'),
        w('knife', 'noun', '刀', 'A sharp tool used for cutting food.', 'tableware'),
        w('chopsticks', 'noun', '筷子', 'Two thin sticks used for eating food.', 'tableware'),
        w('pan', 'noun', '平底锅', 'A wide shallow container used for cooking food.', 'cooking'),
        w('pot', 'noun', '锅', 'A deep container used for cooking soup or boiling water.', 'cooking'),
        w('fridge', 'noun', '冰箱', 'A machine that keeps food cold.', 'appliance'),
        w('microwave', 'noun', '微波炉', 'A machine that heats food quickly.', 'appliance'),
        w('stove', 'noun', '炉灶', 'A kitchen machine used for cooking food.', 'appliance'),
        w('sink', 'noun', '水槽', 'A bowl-shaped place where water runs for washing.', 'kitchen'),
        w('trash can', 'noun', '垃圾桶', 'A container for garbage.', 'kitchen')
      ]
    },
    {
      id: 'home-items',
      name: 'Home Items 家居用品',
      description: '家里各个房间最常见的物品。',
      items: [
        w('bed', 'noun', '床', 'A piece of furniture used for sleeping.', 'bedroom'),
        w('pillow', 'noun', '枕头', 'A soft object for resting your head in bed.', 'bedroom'),
        w('blanket', 'noun', '毯子；被子', 'A warm cover used when sleeping.', 'bedroom'),
        w('sofa', 'noun', '沙发', 'A long soft seat for two or more people.', 'living room'),
        w('chair', 'noun', '椅子', 'A seat for one person.', 'furniture'),
        w('table', 'noun', '桌子', 'Furniture with a flat top and legs.', 'furniture'),
        w('desk', 'noun', '书桌', 'A table used for studying or working.', 'furniture'),
        w('lamp', 'noun', '台灯；灯', 'An object that gives light.', 'furniture'),
        w('drawer', 'noun', '抽屉', 'A box-shaped part of furniture that slides out.', 'storage'),
        w('shelf', 'noun', '架子', 'A flat board used for holding things.', 'storage'),
        w('closet', 'noun', '衣柜；壁橱', 'A small space or cabinet for clothes and storage.', 'storage'),
        w('mirror', 'noun', '镜子', 'A surface where you can see yourself.', 'home'),
        w('curtain', 'noun', '窗帘', 'Cloth that hangs over a window.', 'home'),
        w('window', 'noun', '窗户', 'An opening in a wall that lets in light and air.', 'home'),
        w('door', 'noun', '门', 'A movable piece used to open or close an entrance.', 'home')
      ]
    },
    {
      id: 'bathroom-cleaning',
      name: 'Bathroom & Cleaning 洗漱清洁',
      description: '洗澡、刷牙、打扫卫生需要的生活词。',
      items: [
        w('toothbrush', 'noun', '牙刷', 'A small brush used to clean teeth.', 'bathroom'),
        w('toothpaste', 'noun', '牙膏', 'A paste used with a toothbrush to clean teeth.', 'bathroom'),
        w('towel', 'noun', '毛巾', 'A piece of cloth used to dry your body or hands.', 'bathroom'),
        w('soap', 'noun', '肥皂', 'A substance used with water for washing.', 'bathroom'),
        w('shampoo', 'noun', '洗发水', 'Liquid soap used for washing hair.', 'bathroom'),
        w('toilet', 'noun', '厕所；马桶', 'A bathroom fixture used for body waste.', 'bathroom'),
        w('shower', 'noun', '淋浴', 'A place or device for washing your body with falling water.', 'bathroom'),
        w('bathtub', 'noun', '浴缸', 'A large container where you sit to wash your body.', 'bathroom'),
        w('broom', 'noun', '扫帚', 'A tool used for sweeping the floor.', 'cleaning'),
        w('mop', 'noun', '拖把', 'A tool used for cleaning floors with water.', 'cleaning'),
        w('vacuum', 'noun', '吸尘器', 'A machine used to clean dust from floors.', 'cleaning'),
        w('laundry', 'noun', '要洗的衣物；洗衣', 'Clothes that need washing or have just been washed.', 'cleaning'),
        w('detergent', 'noun', '洗衣液；清洁剂', 'A liquid or powder used for washing clothes or dishes.', 'cleaning'),
        w('wipe', 'verb', '擦', 'To clean or dry something by rubbing it.', 'cleaning'),
        w('rinse', 'verb', '冲洗', 'To wash something quickly with clean water.', 'cleaning')
      ]
    },
    {
      id: 'clothes-accessories',
      name: 'Clothes & Accessories 衣服配饰',
      description: '穿衣、天气和体育课会常用的服饰词。',
      items: [
        w('shirt', 'noun', '衬衫；上衣', 'Clothing worn on the upper body.', 'top'),
        w('T-shirt', 'noun', 'T恤', 'A simple short-sleeved shirt.', 'top'),
        w('pants', 'noun', '裤子', 'Clothing worn on the legs.', 'bottom'),
        w('jeans', 'noun', '牛仔裤', 'Strong casual pants made of denim.', 'bottom'),
        w('shorts', 'noun', '短裤', 'Pants that end above the knees.', 'bottom'),
        w('jacket', 'noun', '夹克；外套', 'A short coat worn over clothes.', 'outerwear'),
        w('coat', 'noun', '大衣；外套', 'A warm piece of clothing worn outside.', 'outerwear'),
        w('sweater', 'noun', '毛衣', 'A warm knitted top.', 'top'),
        w('socks', 'noun', '袜子', 'Clothing worn on your feet inside shoes.', 'accessory'),
        w('shoes', 'noun', '鞋子', 'Coverings worn on the feet.', 'accessory'),
        w('boots', 'noun', '靴子', 'Shoes that cover the ankle or more of the leg.', 'accessory'),
        w('hat', 'noun', '帽子', 'A covering worn on the head.', 'accessory'),
        w('gloves', 'noun', '手套', 'Clothing worn on the hands.', 'accessory'),
        w('pocket', 'noun', '口袋', 'A small cloth bag in clothing for carrying things.', 'clothing part'),
        w('zipper', 'noun', '拉链', 'A fastener used to open or close clothing or bags.', 'clothing part')
      ]
    },
    {
      id: 'body-health',
      name: 'Body & Health 身体健康',
      description: '描述身体部位、疼痛和看病的基础词。',
      items: [
        w('head', 'noun', '头', 'The top part of the body with the brain, eyes, nose, and mouth.', 'body'),
        w('face', 'noun', '脸', 'The front part of the head.', 'body'),
        w('eye', 'noun', '眼睛', 'The body part used for seeing.', 'body'),
        w('ear', 'noun', '耳朵', 'The body part used for hearing.', 'body'),
        w('mouth', 'noun', '嘴', 'The part of the face used for eating and speaking.', 'body'),
        w('tooth', 'noun', '牙齿', 'A hard white part in the mouth used for biting food.', 'body'),
        w('neck', 'noun', '脖子', 'The body part between the head and shoulders.', 'body'),
        w('shoulder', 'noun', '肩膀', 'The body part where the arm joins the body.', 'body'),
        w('stomach', 'noun', '胃；肚子', 'The body part where food goes after you eat.', 'body'),
        w('knee', 'noun', '膝盖', 'The joint in the middle of the leg.', 'body'),
        w('fever', 'noun', '发烧', 'A body temperature that is higher than normal.', 'health'),
        w('cough', 'noun/verb', '咳嗽', 'To force air out of your throat with a sound.', 'health'),
        w('pain', 'noun', '疼痛', 'A bad feeling in the body when something hurts.', 'health'),
        w('medicine', 'noun', '药', 'Something used to treat illness or pain.', 'health'),
        w('doctor', 'noun', '医生', 'A person trained to treat sick or hurt people.', 'health')
      ]
    },
    {
      id: 'basic-actions',
      name: 'Basic Actions 基础动作',
      description: '小时候最早学到、课堂和生活每天都会听到的动词。',
      items: [
        w('eat', 'verb', '吃', 'To put food in your mouth and swallow it.', 'body action'),
        w('drink', 'verb', '喝', 'To take liquid into your mouth and swallow it.', 'body action'),
        w('sleep', 'verb', '睡觉', 'To rest with your eyes closed and your body inactive.', 'routine'),
        w('wake up', 'verb phrase', '醒来', 'To stop sleeping.', 'routine'),
        w('sit', 'verb', '坐', 'To rest your body on a chair or another surface.', 'movement'),
        w('stand', 'verb', '站', 'To be on your feet.', 'movement'),
        w('walk', 'verb', '走路', 'To move on foot at a normal speed.', 'movement'),
        w('run', 'verb', '跑', 'To move quickly on foot.', 'movement'),
        w('jump', 'verb', '跳', 'To push your body off the ground with your legs.', 'movement'),
        w('open', 'verb', '打开', 'To move something so it is not closed.', 'object action'),
        w('close', 'verb', '关闭', 'To shut something.', 'object action'),
        w('pick up', 'verb phrase', '捡起；拿起', 'To lift something with your hand.', 'object action'),
        w('put down', 'verb phrase', '放下', 'To place something on a surface.', 'object action'),
        w('carry', 'verb', '携带；搬', 'To hold and move something from one place to another.', 'object action'),
        w('pour', 'verb', '倒；倾倒', 'To make liquid flow from one container to another.', 'object action')
      ]
    },
    {
      id: 'daily-routines',
      name: 'Daily Routines 日常活动',
      description: '早上、放学、睡前常用的生活短语。',
      items: [
        w('brush teeth', 'verb phrase', '刷牙', 'To clean your teeth with a toothbrush.', 'morning'),
        w('take a shower', 'verb phrase', '洗澡；淋浴', 'To wash your body under running water.', 'bathroom'),
        w('get dressed', 'verb phrase', '穿衣服', 'To put clothes on your body.', 'morning'),
        w('pack my bag', 'verb phrase', '收拾书包', 'To put needed things into a bag.', 'school'),
        w('make the bed', 'verb phrase', '整理床铺', 'To arrange the sheets and blanket after sleeping.', 'home'),
        w('wash dishes', 'verb phrase', '洗碗', 'To clean plates, bowls, and cups.', 'chores'),
        w('do laundry', 'verb phrase', '洗衣服', 'To wash clothes.', 'chores'),
        w('take out the trash', 'verb phrase', '倒垃圾', 'To carry garbage outside.', 'chores'),
        w('go home', 'verb phrase', '回家', 'To return to your home.', 'movement'),
        w('do homework', 'verb phrase', '做作业', 'To complete school work at home.', 'school'),
        w('go to bed', 'verb phrase', '上床睡觉', 'To get into bed to sleep.', 'night'),
        w('fall asleep', 'verb phrase', '睡着', 'To begin sleeping.', 'night')
      ]
    },
    {
      id: 'school-life',
      name: 'School Life 学校生活',
      description: '学校地点、物品、作业和日常安排。',
      items: [
        w('classroom', 'noun', '教室', 'A room where students learn at school.', 'place'),
        w('hallway', 'noun', '走廊', 'A long passage inside a building.', 'place'),
        w('locker', 'noun', '储物柜', 'A small cupboard at school for books and bags.', 'place'),
        w('library', 'noun', '图书馆', 'A place where people read or borrow books.', 'place'),
        w('gym', 'noun', '体育馆', 'A room or building used for sports and exercise.', 'place'),
        w('worksheet', 'noun', '练习纸', 'A paper with questions or activities for students.', 'work'),
        w('assignment', 'noun', '作业；任务', 'A task a teacher gives students to do.', 'work'),
        w('quiz', 'noun', '小测验', 'A short test.', 'test'),
        w('mark', 'noun', '分数；成绩', 'A score or grade for school work.', 'test'),
        w('recess', 'noun', '课间休息', 'A break time at school when students can play.', 'schedule'),
        w('lunch break', 'noun phrase', '午餐时间', 'The time at school when students eat lunch.', 'schedule'),
        w('permission slip', 'noun phrase', '家长同意书', 'A form that parents sign to allow a school activity.', 'school form')
      ]
    },
    {
      id: 'classroom-instructions',
      name: 'Classroom Instructions 课堂指令',
      description: '老师布置题目、考试和课堂活动时常说的词。',
      items: [
        w('circle', 'verb', '圈出', 'To draw a round line around something.', 'worksheet'),
        w('underline', 'verb', '划线', 'To draw a line under a word or sentence.', 'worksheet'),
        w('match', 'verb', '配对', 'To connect things that go together.', 'worksheet'),
        w('choose', 'verb', '选择', 'To pick one thing from two or more choices.', 'worksheet'),
        w('explain', 'verb', '解释', 'To make something clear or easy to understand.', 'thinking'),
        w('describe', 'verb', '描述', 'To say what something is like.', 'thinking'),
        w('compare', 'verb', '比较', 'To say how things are similar or different.', 'thinking'),
        w('complete', 'verb', '完成', 'To finish something.', 'task'),
        w('hand in', 'verb phrase', '上交', 'To give finished work to a teacher.', 'task'),
        w('line up', 'verb phrase', '排队', 'To stand in a row.', 'classroom routine'),
        w('take turns', 'verb phrase', '轮流', 'To do something one after another.', 'classroom routine'),
        w('raise your hand', 'verb phrase', '举手', 'To lift your hand to ask or answer.', 'classroom routine')
      ]
    },
    {
      id: 'places-transportation',
      name: 'Places & Transportation 地点交通',
      description: '出门、问路、坐车和城市生活会遇到的词。',
      items: [
        w('store', 'noun', '商店', 'A place where people buy things.', 'place'),
        w('market', 'noun', '市场', 'A place where people buy food and other goods.', 'place'),
        w('park', 'noun', '公园', 'A public outdoor area with grass or trees.', 'place'),
        w('clinic', 'noun', '诊所', 'A place where people get medical help.', 'place'),
        w('bus stop', 'noun', '公交车站', 'A place where buses stop for people.', 'transport'),
        w('station', 'noun', '车站', 'A place where trains or buses arrive and leave.', 'transport'),
        w('sidewalk', 'noun', '人行道', 'A path beside a road for people walking.', 'street'),
        w('crosswalk', 'noun', '人行横道', 'A marked place where people cross a street.', 'street'),
        w('entrance', 'noun', '入口', 'The place where you go into a building or area.', 'direction'),
        w('exit', 'noun', '出口', 'The place where you leave a building or area.', 'direction'),
        w('upstairs', 'adverb', '在楼上；往楼上', 'On or toward a higher floor.', 'direction'),
        w('downstairs', 'adverb', '在楼下；往楼下', 'On or toward a lower floor.', 'direction')
      ]
    },
    {
      id: 'shopping-money',
      name: 'Shopping & Money 购物金钱',
      description: '买东西、退换货、看价格时需要的基础词。',
      items: [
        w('price', 'noun', '价格', 'The amount of money you pay for something.', 'shopping'),
        w('cash', 'noun', '现金', 'Money in coins or bills.', 'payment'),
        w('card', 'noun', '银行卡；卡', 'A plastic card used to pay for things.', 'payment'),
        w('change', 'noun', '找零；零钱', 'Money given back when you pay more than the price.', 'payment'),
        w('receipt', 'noun', '收据', 'A paper or message that shows you paid.', 'shopping'),
        w('sale', 'noun', '打折；促销', 'A time when things cost less money.', 'shopping'),
        w('cheap', 'adjective', '便宜的', 'Not costing much money.', 'price'),
        w('expensive', 'adjective', '昂贵的', 'Costing a lot of money.', 'price'),
        w('size', 'noun', '尺码；大小', 'How big or small something is.', 'shopping'),
        w('return', 'verb', '退货', 'To take something back to a store.', 'shopping'),
        w('exchange', 'verb', '换货', 'To give one item back and get another.', 'shopping'),
        w('customer', 'noun', '顾客', 'A person who buys goods or services.', 'shopping')
      ]
    },
    {
      id: 'feelings-social',
      name: 'Feelings & Social Words 情绪社交',
      description: '表达情绪、和同学老师沟通的常用词。',
      items: [
        w('happy', 'adjective', '开心的', 'Feeling good or pleased.', 'feeling'),
        w('sad', 'adjective', '难过的', 'Feeling unhappy.', 'feeling'),
        w('angry', 'adjective', '生气的', 'Feeling mad or upset.', 'feeling'),
        w('nervous', 'adjective', '紧张的', 'Worried or not relaxed.', 'feeling'),
        w('bored', 'adjective', '无聊的', 'Feeling tired because something is not interesting.', 'feeling'),
        w('tired', 'adjective', '累的', 'Needing rest or sleep.', 'feeling'),
        w('proud', 'adjective', '自豪的', 'Feeling happy about something good you did.', 'feeling'),
        w('shy', 'adjective', '害羞的', 'Nervous around other people.', 'personality'),
        w('polite', 'adjective', '有礼貌的', 'Showing good manners and respect.', 'social'),
        w('rude', 'adjective', '粗鲁的', 'Not polite; showing bad manners.', 'social'),
        w('kind', 'adjective', '友善的', 'Helpful and caring toward others.', 'social'),
        w('stranger', 'noun', '陌生人', 'A person you do not know.', 'people')
      ]
    },
    {
      id: 'basic-adjectives',
      name: 'Basic Adjectives 基础形容词',
      description: '描述大小、冷热、干湿、轻重等基础反义词。',
      items: [
        w('clean', 'adjective', '干净的', 'Not dirty.', 'opposites'),
        w('dirty', 'adjective', '脏的', 'Not clean.', 'opposites'),
        w('full', 'adjective', '满的；饱的', 'Having no empty space, or not hungry.', 'opposites'),
        w('empty', 'adjective', '空的', 'Having nothing inside.', 'opposites'),
        w('wet', 'adjective', '湿的', 'Covered with water or another liquid.', 'opposites'),
        w('dry', 'adjective', '干的', 'Not wet.', 'opposites'),
        w('loud', 'adjective', '大声的', 'Making a lot of noise.', 'opposites'),
        w('quiet', 'adjective', '安静的', 'Making little or no noise.', 'opposites'),
        w('heavy', 'adjective', '重的', 'Having a lot of weight.', 'opposites'),
        w('light', 'adjective', '轻的', 'Not heavy.', 'opposites'),
        w('hard', 'adjective', '硬的；难的', 'Solid and not easy to bend, or difficult.', 'opposites'),
        w('soft', 'adjective', '软的', 'Easy to press or bend.', 'opposites'),
        w('deep', 'adjective', '深的', 'Going far down from the top.', 'opposites'),
        w('shallow', 'adjective', '浅的', 'Not deep.', 'opposites'),
        w('fresh', 'adjective', '新鲜的', 'New, clean, or recently made.', 'quality')
      ]
    }
  ];

  var flat = [];
  categories.forEach(function (cat) {
    cat.items.forEach(function (item, idx) {
      flat.push(Object.assign({
        id: cat.id + '-' + (idx + 1),
        categoryId: cat.id,
        categoryName: cat.name,
        level: 'Life Basics Level 1'
      }, item));
    });
  });

  window.LIFE_BASICS_CATEGORIES = categories;
  window.LIFE_BASICS_WORDS = flat;
})();
