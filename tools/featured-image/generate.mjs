#!/usr/bin/env node
// Генерация featured-картинки статьи через OpenRouter.
// Использование: node tools/featured-image/generate.mjs <slug> [--model=id] [--out=dir]
// Ключ: OPENROUTER_KEY в .env. Логика промпта описана в docs/featured-images.md.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const env = Object.fromEntries(
  readFileSync(resolve(ROOT, '.env'), 'utf8').split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);

// Биом = набор сцен фона + одежда/снаряжение по полу. Писатель выбирает только `biome` (и при желании свою `scene`),
// а конкретная сцена и наряд выбираются по хэшу слага (или --scene=N / --outfit=N).
export const BIOMES = {
  mediterranean: {
    scenes: ['a sunny old-town street with terracotta rooftops and a seaside promenade', 'a golden-hour hillside viewpoint over a coastal town and sea', 'a whitewashed Greek-island lane with blue shutters and bougainvillea'],
    man: ['a light linen shirt with rolled sleeves, beige chinos and a canvas crossbody bag', 'a pale polo shirt, tailored shorts, sunglasses and a small suede sling bag', 'a white t-shirt with an open striped shirt over it, light trousers and a slim grey daypack'],
    woman: ['a light summer dress with a straw hat and a small leather shoulder bag', 'a breezy linen jumpsuit, sunglasses in the hair and a woven basket bag', 'a striped boat-neck top, wide cream trousers and a compact tan backpack'],
  },
  tropical: {
    scenes: ['a bright tropical beach cafe terrace with palm trees and turquoise water', 'an Okinawa-style white-sand beach with a wooden pier and clear shallow water', 'a beach-club hammock area under palms at sunset'],
    man: ['a loose short-sleeve floral resort shirt, shorts, a woven bucket hat and a small waterproof sling bag', 'a sleeveless linen shirt, board shorts, a sun cap and a roll-top dry bag', 'a plain tee, quick-dry shorts, flip-flops and a small teal daypack'],
    woman: ['a breezy sleeveless top, light shorts, sunglasses pushed up in the hair and a colourful tote bag', 'a floral sundress with a wide-brim sun hat and a woven bag', 'a coral swim-cover shirt, denim-free quick-dry shorts, a visor cap and a small turquoise backpack'],
  },
  jungle: {
    scenes: ['Bali-style emerald rice terraces with palms in the haze', 'a rainforest canopy walkway with misty green hills', 'a riverside bamboo lodge in a tropical valley'],
    man: ['a quick-dry olive shirt with sleeves rolled, lightweight cargo trousers, a bucket hat and a green hydration daypack', 'a breathable grey tee, zip-off hiking shorts, a neck buff and a compact khaki pack'],
    woman: ['a light sleeveless trekking top, quick-dry hiking shorts, a cap and a small mint daypack', 'a long-sleeve UPF shirt in sage, lightweight leggings and a bucket hat with a lime sling pack'],
  },
  desert: {
    scenes: ['golden sand dunes at sunrise with long soft shadows', 'a red-rock canyon desert landscape in the warm afternoon', 'a Moroccan desert-edge town with sand-coloured walls and palms'],
    man: ['a loose sand-coloured linen shirt, a light scarf around the neck, cargo trousers and a leather satchel', 'a long-sleeve breathable shirt in terracotta, a wide-brim hat, sunglasses and a canvas daypack'],
    woman: ['a flowing long-sleeve tunic in ochre, a light head scarf worn as a sun shield, linen trousers and a leather crossbody bag', 'a rust-coloured shirt dress, a wide-brim hat, sunglasses and a small khaki backpack'],
  },
  mountain: {
    scenes: ['a high alpine meadow with a mountain lodge terrace and snow-capped peaks', 'a rocky ridge trail above a green valley with low clouds', 'a Japanese Alps lakeside lookout with jagged peaks'],
    man: ['a bright technical shell jacket, hiking trousers, a beanie and a large red trekking backpack', 'a fleece pullover, softshell vest, hiking pants and a green mountaineering rucksack', 'a wool flannel overshirt over a base layer, trail trousers and an olive hiking pack'],
    woman: ['a magenta softshell jacket, black hiking leggings, a headband and a blue trekking pack', 'a cream fleece, a quilted vest, hiking trousers and an orange daypack', 'a teal rain shell, a patterned beanie, trail pants and a large grey rucksack'],
  },
  winter: {
    scenes: ['a snowy Hokkaido-style town street at dusk with warm lantern lights', 'a ski resort village with snow-covered chalets and falling snow', 'a frozen lake shore with snowy pines in soft blue light'],
    man: ['a puffy down jacket, wool scarf, knit hat, gloves and a compact black daypack', 'a padded ski-style jacket in a bright colour, neck gaiter and a small orange backpack', 'a navy parka with a fur-trim hood, thick scarf and a charcoal backpack'],
    woman: ['a long wool coat, thick scarf, a beret-style hat and a small crossbody bag', 'a coral puffer jacket, cream knit beanie, scarf and a small teal backpack', 'a white down coat, earmuffs, mittens and a small red shoulder bag'],
  },
  city: {
    scenes: ['a neon-lit night street in a big Asian city with soft bokeh lights', 'a modern glass-and-steel downtown plaza at blue hour', 'a rooftop terrace overlooking a sparkling skyline at dusk'],
    man: ['a tailored light jacket, plain tee, slim trousers and a leather messenger bag', 'a hoodie with a bomber jacket and a sleek black commuter backpack', 'a smart-casual overshirt, white sneakers and a small canvas tote'],
    woman: ['a trench coat over a knit top, a scarf and a small structured tote', 'an oversized blazer, wide trousers, white sneakers and a slim crossbody bag', 'a pastel bomber jacket, a midi skirt and a compact city backpack'],
  },
  japan_traditional: {
    scenes: ['an old Kyoto stone lane with wooden machiya houses and a vermilion torii gate', 'a historic Japanese temple garden in vivid autumn maple colours', 'a hot-spring onsen town street with steam and wooden bridges'],
    man: ['a casual indigo-dyed cotton jacket, plain tee, dark trousers and a small canvas shoulder bag', 'a simple linen shirt, a light cardigan, chinos and a compact waxed-canvas backpack', 'a modern jinbei-inspired relaxed top with trousers and a leather crossbody bag'],
    woman: ['a light knit cardigan over a blouse, a long skirt and a small cloth tote (modern casual, not a kimono)', 'a camel trench coat, a scarf, wide trousers and a small leather backpack', 'a soft sweater, pleated midi skirt, sneakers and a woven shoulder bag'],
  },
  cherry_blossom: {
    scenes: ['a riverside park under full-bloom cherry blossom trees with falling petals', 'a castle moat lined with pink sakura in soft spring light', 'a hillside path tunnelled by blossoming cherry trees'],
    man: ['a light beige spring jacket, white tee, slim trousers and a small tote', 'a soft pastel shirt, a thin knit vest and a slim grey daypack'],
    woman: ['a pastel cardigan, a floral blouse, a light skirt and a small pink shoulder bag', 'a trench jacket in cream, a white top, jeans-free wide trousers and a mint mini backpack'],
  },
  savanna: {
    scenes: ['an African savanna at golden hour with acacia trees and distant animals', 'a safari lodge veranda looking over open grassland at sunrise', 'a dry grassland plain with baobab trees and warm haze'],
    man: ['a khaki safari shirt with chest pockets, a wide-brim hat, cargo shorts and a leather-trimmed canvas bag', 'an olive utility vest over a tan shirt, sunglasses and a sand-coloured daypack'],
    woman: ['a sand-coloured safari shirt tied at the waist, a wide-brim hat, tan trousers and a small canvas crossbody', 'an olive linen jumpsuit with a neck scarf, sunglasses and a khaki backpack'],
  },
  arctic: {
    scenes: ['a snowy Nordic landscape with a green aurora glowing over a frozen lake', 'an Icelandic coast with black sand, basalt cliffs and a moody sky', 'a glass-roofed cabin overlooking snowy fells at twilight'],
    man: ['a heavy red expedition parka with a fur-trimmed hood, a knit hat, thick gloves and a black pack', 'a grey insulated jacket, a thick wool beanie, a neck warmer and a yellow dry bag'],
    woman: ['a long cream parka with a hood, a chunky knit scarf, mittens and a small red backpack', 'a bright-blue insulated jacket, a pom-pom beanie, thermal gloves and a black daypack'],
  },
  lakeside: {
    scenes: ['a calm forest lake in summer with a wooden dock and reflections', 'a green lakeside campsite with tents and mist on the water', 'a meadow beside a clear blue lake with pine-covered hills'],
    man: ['a green flannel shirt, cargo shorts, a baseball cap and a navy canvas backpack', 'a grey hooded sweatshirt, hiking shorts and a small orange daypack'],
    woman: ['a plaid shirt tied over a tank top, shorts, a bucket hat and a mustard daypack', 'a lightweight hoodie in dusty blue, leggings and a woven crossbody bag'],
  },
  countryside: {
    scenes: ['rolling Tuscan hills with cypress trees and a vineyard in warm light', 'a Japanese satoyama countryside with rice fields and a thatched-roof farmhouse', 'a lavender field in bloom with a stone farmhouse in the distance'],
    man: ['a chambray work shirt, canvas trousers, a straw hat and a leather satchel', 'a cream knit polo, olive chinos and a small waxed-canvas backpack'],
    woman: ['a gingham shirt dress, a straw hat and a wicker basket bag', 'a linen shirt, a long denim-free skirt in sage, sandals and a small leather backpack'],
  },
};
// Подписи мест (по одной на сцену, тот же порядок, что в BIOMES[...].scenes). Для polaroid: надпись маркером на нижней полосе главной карточки.
export const LOCATIONS = {
  mediterranean: [{ ja: 'ドゥブロヴニク', en: 'Dubrovnik' }, { ja: 'チンクエテッレ', en: 'Cinque Terre' }, { ja: 'サントリーニ島', en: 'Santorini' }],
  tropical: [{ ja: 'プーケット', en: 'Phuket' }, { ja: '沖縄', en: 'Okinawa' }, { ja: 'セブ島', en: 'Cebu' }],
  jungle: [{ ja: 'ウブド', en: 'Ubud' }, { ja: 'ボルネオ島', en: 'Borneo' }, { ja: 'チェンマイ', en: 'Chiang Mai' }],
  desert: [{ ja: 'サハラ砂漠', en: 'Sahara' }, { ja: 'ワディ・ラム', en: 'Wadi Rum' }, { ja: 'ワルザザート', en: 'Ouarzazate' }],
  mountain: [{ ja: 'スイスアルプス', en: 'Swiss Alps' }, { ja: 'ドロミーティ', en: 'Dolomites' }, { ja: '上高地', en: 'Kamikochi' }],
  winter: [{ ja: '小樽', en: 'Otaru' }, { ja: 'ニセコ', en: 'Niseko' }, { ja: '阿寒湖', en: 'Lake Akan' }],
  city: [{ ja: 'ソウル', en: 'Seoul' }, { ja: 'シンガポール', en: 'Singapore' }, { ja: '東京', en: 'Tokyo' }],
  japan_traditional: [{ ja: '京都', en: 'Kyoto' }, { ja: '日光', en: 'Nikko' }, { ja: '草津温泉', en: 'Kusatsu Onsen' }],
  cherry_blossom: [{ ja: '目黒川', en: 'Meguro River' }, { ja: '弘前城', en: 'Hirosaki Castle' }, { ja: '吉野山', en: 'Mt. Yoshino' }],
  savanna: [{ ja: 'セレンゲティ', en: 'Serengeti' }, { ja: 'マサイマラ', en: 'Masai Mara' }, { ja: 'マダガスカル', en: 'Madagascar' }],
  arctic: [{ ja: 'ラップランド', en: 'Lapland' }, { ja: 'アイスランド', en: 'Iceland' }, { ja: 'トロムソ', en: 'Tromsø' }],
  lakeside: [{ ja: 'バンフ', en: 'Banff' }, { ja: '河口湖', en: 'Lake Kawaguchi' }, { ja: 'ワナカ湖', en: 'Lake Wanaka' }],
  countryside: [{ ja: 'トスカーナ', en: 'Tuscany' }, { ja: '白川郷', en: 'Shirakawa-go' }, { ja: '富良野', en: 'Furano' }],
};

const hash = (str, salt) => [...(str + salt)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
export const pickOutfit = (slug, biome, gender, n) => { const l = BIOMES[biome][gender]; return l[n ?? hash(slug, 'outfit') % l.length]; };
export const pickScene = (slug, biome, n) => { const l = BIOMES[biome].scenes; return l[n ?? hash(slug, 'scene') % l.length]; };

// Камера и настройки: тип съёмки, оптика, диафрагма, ракурс, цветовая обработка. Фон всегда остаётся размытым (требование стиля),
// меняется степень размытия и «характер» кадра. Выбор по хэшу слага или --camera=N.
export const CAMERAS = [
  { id: 'portrait-85', text: 'shot on a full-frame mirrorless camera with an 85mm f/1.4 portrait lens, eye-level, very shallow depth of field with creamy bokeh, soft natural rim light, clean neutral colour' },
  { id: 'reportage-35', text: 'candid reportage look, 35mm f/2 lens on a mirrorless camera, eye-level, moderate depth of field (background clearly readable but softly blurred), natural contrast, slight documentary feel' },
  { id: 'lowangle-50', text: '50mm f/1.8 lens, LOW camera angle looking slightly up at the person, gentle backlight with a glowing edge, background blurred, optimistic heroic feel' },
  { id: 'wide-24', text: '24mm wide-angle f/2.8 lens, camera held slightly ABOVE eye level looking down a little, more of the environment visible (still softly blurred), airy and spacious feel' },
  { id: 'film-56', text: 'shot on a Fujifilm-style mirrorless camera, 56mm f/1.2, warm film colour grade with gentle highlights roll-off and very subtle grain, nostalgic holiday-photo feel' },
  { id: 'phone-26', text: 'looks like a high-quality modern smartphone photo, 26mm f/1.8 main camera, crisp and bright, punchy colours, slightly stronger contrast, authentic social-media travel snapshot, natural moderate background blur' },
  { id: 'tele-135', text: '135mm telephoto f/2 lens shot from a distance, compressed perspective, strongly blurred, dreamy background, subject isolated and sharp' },
  { id: 'medium-80', text: 'medium-format camera, 80mm f/2.8, ultra-clean fine detail, soft muted pastel-leaning tones, calm editorial feel' },
];
export const pickCamera = (slug, n) => CAMERAS[n ?? hash(slug, 'camera') % CAMERAS.length];

// Для стиля polaroid нужны 3 разные сцены и 3 разных наряда одного биома (человек один и тот же).
const rotate = (list, k, n = 3) => Array.from({ length: n }, (_, i) => list[(k + i) % list.length]);
export const pickScenes3 = (slug, biome) => rotate(BIOMES[biome].scenes, hash(slug, 'scene'));
export const pickLocations3 = (slug, biome) => rotate(LOCATIONS[biome], hash(slug, 'scene'));
export const pickOutfits3 = (slug, biome, gender) => rotate(BIOMES[biome][gender], hash(slug, 'outfit'));

export const FACINGS = [
  'facing and looking toward the LEFT side of the frame (body turned three-quarters to the left)',
  'facing and looking toward the RIGHT side of the frame (body turned three-quarters to the right)',
  'facing the camera almost frontally, looking down at the device, with a slight head tilt',
  'in profile-ish three-quarter view facing the LEFT, glancing up from the device toward the scenery',
];
export const pickFacing = (slug, n) => FACINGS[n ?? hash(slug, 'facing') % FACINGS.length];

// Поля, зависящие от статьи (в проде их отдаёт писатель в `image_brief`): biome, gender, device, action; `scene` — необязательно.
export const BRIEFS = {
  'what-is-affiliate': { biome: 'cherry_blossom', gender: 'woman', device: 'phone', action: 'standing under the blossoms, reading something on a smartphone with a curious smile' },
  'ad-affiliate': { biome: 'desert', gender: 'man', device: 'phone', action: 'standing on a dune ridge, checking a smartphone' },
  'earn-or-not': { biome: 'japan_traditional', gender: 'man', device: 'phone', action: 'standing on a stone path, thoughtfully looking at a smartphone' },
  'pick-niche': { biome: 'city', gender: 'woman', device: 'laptop', action: 'sitting at an outdoor cafe table with an open laptop' },
  'travel-blog-income': { biome: 'mediterranean', gender: 'man', device: 'laptop', action: 'sitting on a low stone wall, working on an open laptop on their knees' },
  'ai-seo': { biome: 'mountain', gender: 'man', device: 'laptop', action: 'sitting on a wooden bench outside a mountain hut with an open laptop, a thermos beside them' },
  'sales-calendar': { biome: 'winter', gender: 'woman', device: 'phone', action: 'standing in the snow checking a smartphone with a happy expression' },
  'travel-demand': { biome: 'jungle', gender: 'woman', device: 'phone', action: 'standing on a viewpoint, looking at a smartphone and smiling' },
  'income-guide': { biome: 'savanna', gender: 'man', device: 'laptop', action: 'sitting on a lodge veranda with an open laptop' },
  instagram: { biome: 'mediterranean', gender: 'woman', device: 'phone', action: 'standing on a path, scrolling and tapping on a smartphone and smiling' },
  'start-guide': { biome: 'tropical', gender: 'woman', device: 'laptop', action: 'sitting at a small table, looking at an open laptop with a relaxed smile' },
  'click-reward': { biome: 'arctic', gender: 'woman', device: 'phone', action: 'standing in the snow with a smartphone, delighted' },
};

// ───────────────────────── Стили (шаблоны) ─────────────────────────
// Каждый стиль = эталон-картинка + набор раскладок + сборщик промпта. Новый шаблон = новая запись в STYLES.
// Общие для всех стилей: японские персонажи, одежда по биому, ракурс, запрет на посторонний текст.

const personBlock = ({ brief, facing, outfit, framing }) =>
  `${framing} A ${brief.gender}, ${brief.action}. Pose: ${facing}. The person is JAPANESE (Japanese ${brief.gender}, East Asian features, black or dark-brown hair), photorealistic, natural, friendly, authentic candid look. OUTFIT, matched to the scenery's climate: ${outfit}. Do NOT use a denim jacket or a brown backpack. The ${brief.device} is clearly visible in their hands.`;

const COMMON_RULES = `- No extra logos, no UI screenshots on the device screen (screen should be dark or facing away).
- No readable or pseudo-readable text anywhere in the scene (signs, lanterns, shop fronts, posters and clothing must be blank or abstract).
- Do not copy the person, clothing or location from the reference; take only its visual style and the brand elements. The layout is defined by the COMPOSITION section, NOT by the reference.
- All people depicted must look Japanese.`;

// Стиль A — «tile»: светлый фон, клякса-маска с персонажем в центре, логотип-плитка, штрих логотип→устройство.
export const TILE_LAYOUTS = [
  { shift: 'shifted to the LEFT: the group centre sits at about 35% of the canvas width', logo: 'medium size (about 22% of canvas height), upper right, rotated ~15 degrees clockwise' },
  { shift: 'shifted to the RIGHT: the group centre sits at about 65% of the canvas width', logo: 'large (about 32% of canvas height), upper left, rotated ~12 degrees counter-clockwise' },
  { shift: 'almost centred horizontally: the group centre sits at about 45% of the canvas width', logo: 'small (about 14% of canvas height), lower right, rotated ~20 degrees clockwise' },
  { shift: 'shifted far to the LEFT, partly cropped by the left canvas edge: the group centre sits at about 30% of the canvas width', logo: 'large (about 34% of canvas height), centre right, rotated ~8 degrees counter-clockwise' },
  { shift: 'shifted far to the RIGHT, partly cropped by the right canvas edge: the group centre sits at about 70% of the canvas width', logo: 'medium (about 20% of canvas height), lower left, rotated ~18 degrees clockwise' },
];

function buildTile({ color, gradientTo, brief, layout, outfit, facing, camera }) {
  const pale = `${color.pale} (a very pale tint of ${color.hex})`;
  const bg = gradientTo ? `a smooth diagonal gradient from ${pale} to ${gradientTo}` : `a solid flat ${pale} background`;
  return `Create a 16:9 editorial blog featured image in the exact visual style of the attached reference image (image 1), but with a new scene.

COMPOSITION
- Background: ${bg}. Very light, airy, calm.
- The main group = a large organic "squiggle" blob mask (sharp pointed, flame-like spikes on its edges, like torn paper / brush flicks) with the traveller in its CENTRE. The whole group is ${layout.shift}.
- Inside the mask: a photographic, softly BLURRED (shallow depth of field) travel scenery: ${brief.scene}. Lighting appropriate to the scene.
- PHOTO LOOK: ${camera.text}. (The softly blurred background is still required.)
- ${personBlock({ brief, facing, outfit, framing: 'The traveller is placed exactly in the horizontal and vertical CENTRE of the mask, sharp (not blurred), slightly overlapping the mask edge at the bottom.' })}
- Logo: ${layout.logo}, on the plain background, not covering the person's face. It is the Travelpayouts app logo exactly as in the reference (white rounded-square tile with a soft shadow, containing a blue rounded square with a white "tp" monogram). Copy it faithfully; only its size, position and rotation change.
- ONE hand-drawn white curved squiggle stroke (rounded ends, about 6px thick, brush-pen feel) CONNECTING the logo to the ${brief.device} in the person's hands: it starts at the logo and its far end TOUCHES the device (loop, arrow tip or plain arc), never ending in empty air, never covering the screen or the hands. Plus one or two tiny extra white flicks near the mask edges.

STRICT RULES
- No text, letters, captions, watermarks or numbers anywhere except the "tp" inside the logo.
${COMMON_RULES}`;
}

// Стиль B — «bubble»: насыщенный плоский фон, фото почти во всю рамку (цвет виден только острыми языками по краям),
// крупный план персонажа, белая «речевая» плашка с логотипом и словом travelpayouts, хвостик указывает на устройство.
export const BUBBLE_LAYOUTS = [
  { person: 'close-up shot, the person fills the RIGHT half of the frame, cropped by the right edge (part of the face and the shoulder/backpack may be cut off)', bubble: 'upper-left, about 45% of the canvas width, slightly rotated (-8 degrees), tail pointing down-right to the device', content: 'logo tile on top, the wordmark below it (stacked, centred)' },
  { person: 'close-up shot, the person fills the LEFT half of the frame, cropped by the left edge', bubble: 'upper-right, about 42% of the canvas width, slightly rotated (+6 degrees), tail pointing down-left to the device', content: 'logo tile on top, the wordmark below it (stacked, centred)' },
  { person: 'medium close-up, the person sits right of centre, head and shoulders and the device all in frame', bubble: 'left-centre, about 38% of the canvas width, not rotated, tail pointing right to the device', content: 'logo tile on the left and the wordmark on the right (one horizontal row)' },
  { person: 'close-up shot, the person fills the LEFT-CENTRE of the frame', bubble: 'lower-right, about 40% of the canvas width, slightly rotated (-5 degrees), tail pointing left-down to the device', content: 'logo tile on the left and the wordmark on the right (one horizontal row)' },
];

function buildBubble({ color, brief, layout, outfit, facing, camera }) {
  return `Create a 16:9 editorial blog featured image in the exact visual style of the attached reference image (image 1), but with a new scene.

COMPOSITION
- Background colour: a vivid, saturated, cheerful flat colour in the hue family of ${color.hex} (the reference uses lime green; use the equivalent bright shade of this hue). It is visible ONLY as sharp, pointed, flame-like spikes and slivers around the edges and corners of the canvas, like torn paper / brush flicks.
- A photographic image fills almost the entire canvas inside that spiky mask: softly BLURRED (shallow depth of field) travel scenery: ${brief.scene}. Lighting appropriate to the scene.
- PHOTO LOOK: ${camera.text}. (The softly blurred background is still required.)
- ${personBlock({ brief, facing, outfit, framing: `Sharp (not blurred) in the foreground: ${layout.person}.` })}
- A white rounded-rectangle speech bubble (soft corners, clean flat white, a small pointed tail) placed ${layout.bubble}. Inside it: ${layout.content}. The logo is the Travelpayouts logo tile (blue rounded square with a white "tp" monogram) and the wordmark is the word "travelpayouts" in bold dark-navy lowercase geometric sans-serif, both copied exactly from the reference. The bubble must not cover the person's eyes or mouth.
- The bubble's tail points at the ${brief.device} in the person's hands.

STRICT RULES
- The ONLY text in the image is the word "travelpayouts" inside the bubble (spelled exactly: t-r-a-v-e-l-p-a-y-o-u-t-s) next to/under the logo.
${COMMON_RULES}`;
}

// Стиль C — «polaroid»: мягкий пастельный градиент, три белые instant-карточки с небольшими поворотами, на каждой — ОДИН И ТОТ ЖЕ человек
// в разных местах биома и в разных нарядах; на подписи средней карточки — логотип Travelpayouts (вместо имени из эталона).
export const POLAROID_LAYOUTS = [
  { arrange: 'a fan of three prints side by side: left print tilted -7 degrees, the middle print in front, slightly lower and larger, almost straight, the right print tilted +6 degrees; they overlap slightly at the edges', hero: 'middle', heroIndex: 1 },
  { arrange: 'a DIAGONAL cascade from the upper-left corner to the lower-right corner of the canvas: three prints overlapping like a casually dropped stack, each one lower and further right than the previous, tilted -10, +3 and +8 degrees; the lower-right print is on top and the largest; empty gradient space is visible in the lower-left and upper-right corners', hero: 'lower-right', heroIndex: 2 },
  { arrange: 'a PYRAMID: two smaller prints in the upper area (left and right, tilted -9 and +9 degrees, the tops near the top of the canvas) and ONE LARGER print in front at the bottom centre, nearly straight, overlapping the lower parts of the other two; the large front print extends close to the bottom edge', hero: 'front-centre', heroIndex: 2 },
  { arrange: 'three prints in a loose row with alternating tilts (+5, -6, +4 degrees) and slightly different vertical offsets (up, down, up), no overlap in the middle but touching at the corners', hero: 'middle', heroIndex: 1 },
];

function buildPolaroid({ color, brief, layout, facing, camera, scenes, outfits, location, lang }) {
  return `Create a 16:9 editorial blog featured image in the exact visual style of the attached reference image (image 1): a collage of three instant-camera (Polaroid-style) prints on a soft pastel gradient, but with a new person and new places. Ignore any name text in the reference; it is replaced as described below.

COMPOSITION
- Background: a soft, airy pastel gradient in the hue family of ${color.hex} blended with warm cream/blush tones (like the reference's yellow-to-pink), very light, with a subtle soft shadow under the prints.
- Three white instant-photo prints (square-ish photo area, wider white bottom border, soft rounded corners, gentle paper shadow) arranged EXACTLY as follows (this arrangement is mandatory and must DIFFER from the reference's arrangement unless it happens to match): ${layout.arrange}. Do not default to the reference's fan layout.
- ALL THREE photos show the SAME JAPANESE ${brief.gender.toUpperCase()}: the same face, same hair, same age and build in all three, East Asian features, black or dark-brown hair. Natural, friendly, candid, photorealistic.
${[0, 1, 2].map((i) => `  - Photo ${i + 1} (${['first in reading order, upper-left/left', 'second in reading order', 'third in reading order, right/lower-right'][i]}${i === layout.heroIndex ? '; THIS IS THE HERO PRINT, the most prominent one' : ''}): ${scenes[i]}; outfit: ${outfits[i]}; ${i === layout.heroIndex ? `${brief.action}; ${facing}` : i === 0 ? brief.action : `a different relaxed travel moment, still clearly holding or using the ${brief.device}`}.`).join('\n')}
- The ${brief.device} is clearly visible in every photo. The outfits are different in each photo but each suits its place's climate. Do NOT use a denim jacket or a brown backpack.
- PHOTO LOOK (applies to all three photos): ${camera.text}. Keep each background natural (the photo is a normal travel snapshot, background not necessarily blurred).
- On the wider white bottom strip of the hero print (${layout.hero}) the location name is HAND-WRITTEN with a black Sharpie permanent marker, like a traveller labelling their instant photo: the text "${location}" (${lang === 'en' ? 'Latin letters' : 'Japanese script, copied character by character exactly as given'}), slightly uneven, casual marker handwriting, medium-large size, centred or gently slanted, with real ink strokes and a little marker pressure variation. It names the place shown in that hero photo. The other prints' bottom strips stay blank white. No logo anywhere.

STRICT RULES
- The ONLY text in the image is the handwritten location "${location}" on the hero print. Spell/draw it exactly as given; do not add any other words, dates, names or numbers.
${COMMON_RULES}`;
}

export const STYLES = {
  tile: { ref: 'featured-template.png', layouts: TILE_LAYOUTS, build: buildTile },
  bubble: { ref: 'featured-template-bubble.png', layouts: BUBBLE_LAYOUTS, build: buildBubble },
  polaroid: { ref: 'featured-template-polaroid.png', layouts: POLAROID_LAYOUTS, build: buildPolaroid, },
};
export const pickStyle = (slug, name) => (name && STYLES[name] ? name : Object.keys(STYLES)[hash(slug, 'style') % Object.keys(STYLES).length]);
export const pickLayout = (slug, style, n) => STYLES[style].layouts[n ?? hash(slug, 'layout') % STYLES[style].layouts.length];

async function main() {
  const slug = process.argv[2];
  const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').split('=')[1] || d;
  const num = (k) => (arg(k, '') === '' ? undefined : Number(arg(k, '')));
  const model = arg('model', 'google/gemini-3.1-flash-image');
  const outDir = resolve(ROOT, arg('out', 'out/featured'));
  const baseBrief = BRIEFS[slug];
  if (!baseBrief) throw new Error(`no brief for "${slug}"`);
  const brief = { ...baseBrief, scene: baseBrief.scene ?? pickScene(slug, baseBrief.biome, num('scene')) };
  const lang = arg('lang', 'ja');
  const styleName = pickStyle(slug, arg('style', ''));
  const style = STYLES[styleName];
  const layout = pickLayout(slug, styleName, num('layout'));

  const cats = JSON.parse(readFileSync(resolve(ROOT, 'content/categories.json'), 'utf8'));
  const arts = JSON.parse(readFileSync(resolve(ROOT, 'content/articles.json'), 'utf8'));
  const art = (Array.isArray(arts) ? arts : arts.articles).find((a) => a.slug === slug);
  const hex = cats.find((c) => c.id === art.category).c;
  const tint = (h, k) => '#' + [1, 3, 5].map((i) => Math.round(255 - (255 - parseInt(h.slice(i, i + 2), 16)) * k).toString(16).padStart(2, '0')).join('');
  const prompt = style.build({
    color: { hex, pale: tint(hex, 0.14) }, gradientTo: slug === 'start-guide' ? '#ffffff' : null, brief, layout,
    outfit: pickOutfit(slug, brief.biome, brief.gender, num('outfit')), facing: pickFacing(slug, num('facing')), camera: pickCamera(slug, num('camera')),
    scenes: pickScenes3(slug, brief.biome), location: arg('location', '') || pickLocations3(slug, brief.biome)[layout.heroIndex ?? 0][lang], lang, outfits: pickOutfits3(slug, brief.biome, brief.gender),
  });

  const ref = readFileSync(resolve(ROOT, 'docs/design-reference', style.ref)).toString('base64');
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.OPENROUTER_KEY}`, 'Content-Type': 'application/json', 'X-Title': 'seo-blog-featured-images' },
    body: JSON.stringify({
      model,
      modalities: ['image', 'text'],
      image_config: { aspect_ratio: '16:9' },
      messages: [{ role: 'user', content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${ref}` } },
        ...(style.extraRefs || []).map((f) => ({ type: 'image_url', image_url: { url: `data:image/png;base64,${readFileSync(resolve(ROOT, 'docs/design-reference', f)).toString('base64')}` } })),
      ] }],
    }),
  });
  const json = await res.json();
  const url = json?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!url) throw new Error(`no image: ${JSON.stringify(json).slice(0, 600)}`);
  mkdirSync(outDir, { recursive: true });
  const camera = pickCamera(slug, num('camera'));
  const file = resolve(outDir, `${slug}-${styleName}${arg('suffix', '') ? '-' + arg('suffix', '') : ''}.png`);
  writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
  console.log(`${slug}: ${file} (style ${styleName}, layout ${STYLES[styleName].layouts.indexOf(layout)}, biome ${brief.biome}, camera ${camera.id}, cost ${json.usage?.cost ?? 'n/a'})`);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch((e) => { console.error(e.message); process.exit(1); });
