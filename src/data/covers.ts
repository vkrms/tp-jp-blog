// Article cover images, mapped by slug. The first block is the set of illustrations from the design;
// the generated ones come from tools/featured-image (see docs/featured-images.md) and are converted
// to WebP before being committed here.
import type { ImageMetadata } from 'astro';
import sales from '../assets/home/12e13e5d91.jpg';
import market from '../assets/home/b8918e6bc1.jpg';
import start from '../assets/home/02e620181b.jpg';
import income from '../assets/home/5144f6bb5a.jpg';
import insta from '../assets/home/f9dca9d830.jpg';
import ai from '../assets/home/ai-seo-featured.webp';
import whatIs from '../assets/home/what-is-affiliate-featured.webp';
import ad from '../assets/home/ad-affiliate-featured.webp';
import earnOrNot from '../assets/home/earn-or-not-featured.webp';
import niche from '../assets/home/pick-niche-featured.webp';
import blogIncome from '../assets/home/travel-blog-income-featured.webp';
import clickReward from '../assets/home/click-reward-featured.webp';

// Downscaled card renditions emitted next to the 1424px covers (convert.mjs). Keyed by slug so the
// registry does not need a second manual entry per article; falls back to the full cover when absent.
const cardFiles = import.meta.glob<ImageMetadata>('../assets/home/*-card.webp', {
  eager: true,
  import: 'default',
});
const cardBySlug = new Map(
  Object.entries(cardFiles).map(([key, img]) => [key.slice(key.lastIndexOf('/') + 1).replace(/-card\.webp$/, ''), img]),
);
export const coverCard = (slug: string) => cardBySlug.get(slug);

export const covers: Record<string, { img: ImageMetadata; alt: [string, string] }> = {
  // from the design
  'sales-calendar': { img: sales, alt: ['雪の集落でスマホを見る旅行者と Travelpayouts の吹き出し', 'A smiling traveller in earmuffs checking her phone in a snowy village of thatched houses, beside a Travelpayouts speech bubble'] },
  'travel-demand': { img: market, alt: ['山小屋の外でノートPCを開くハイカー', 'A hiker in a yellow jacket working on a laptop outside a mountain hut, with snowy peaks behind'] },
  'start-guide': { img: start, alt: ['夕暮れのルーフトップカフェでノートPCを使う旅行者', 'A traveller working on a laptop at a rooftop café above the city at dusk, beside a Travelpayouts speech bubble'] },
  'income-guide': { img: income, alt: ['ヤシの木の下のビーチカフェでノートPCを使う旅行者', 'A traveller in a bucket hat working on a laptop at a beachside café under palm trees'] },
  instagram: { img: insta, alt: ['日本の旅先でスマホを使う旅行者の3枚のインスタント写真', 'Three instant photos of a traveller using his phone on trips in Japan, the middle one captioned 草津温泉 (Kusatsu Onsen)'] },

  // generated
  'ai-seo': { img: ai, alt: ['山小屋のベンチでノートPCを開く日本人男性旅行者と travelpayouts の吹き出し', 'A Japanese male traveller with a red backpack working on a laptop outside a mountain hut, beside a travelpayouts speech bubble'] },
  'what-is-affiliate': { img: whatIs, alt: ['桜並木の小道でスマホを見る旅行者と travelpayouts の吹き出し', 'A traveller checking her phone on a cherry-blossom path, beside a travelpayouts speech bubble'] },
  'ad-affiliate': { img: ad, alt: ['砂漠の町の外でスマホを見る旅行者と travelpayouts の吹き出し', 'A traveller in a straw hat checking his phone outside a desert town, beside a travelpayouts speech bubble'] },
  'earn-or-not': { img: earnOrNot, alt: ['紅葉の寺院庭園でスマホを見る旅行者と Travelpayouts のロゴ', 'A traveller checking his phone in an autumn temple garden, with the Travelpayouts logo beside him'] },
  'pick-niche': { img: niche, alt: ['夕暮れの屋上カフェでノートPCを開く旅行者と travelpayouts の吹き出し', 'A traveller working on a laptop at a rooftop cafe at dusk, beside a travelpayouts speech bubble'] },
  'travel-blog-income': { img: blogIncome, alt: ['海辺の町を見下ろす石垣でノートPCを開く旅行者と Travelpayouts のロゴ', 'A traveller working on a laptop on a stone wall overlooking a coastal town, with the Travelpayouts logo'] },
  'click-reward': { img: clickReward, alt: ['オーロラ・黒砂海岸・ガラス屋根のロッジでスマホを見る旅行者の3枚のインスタント写真（トロムソ）', 'Three instant photos of a traveller with her phone under the aurora, on a black-sand coast and in a glass-roofed cabin, labelled Tromsø'] },
};
