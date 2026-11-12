// Cover images for the home page cards. Articles have no cover field yet (generated covers come
// after release, tools/featured-image), so the design's illustrations are mapped by slug.
import type { ImageMetadata } from 'astro';
import sales from '../assets/home/12e13e5d91.jpg';
import market from '../assets/home/b8918e6bc1.jpg';
import ai from '../assets/home/289c5f9310.jpg';
import start from '../assets/home/02e620181b.jpg';
import income from '../assets/home/5144f6bb5a.jpg';
import insta from '../assets/home/f9dca9d830.jpg';

export const covers: Record<string, { img: ImageMetadata; alt: [string, string] }> = {
  'sales-calendar': { img: sales, alt: ['雪の集落でスマホを見る旅行者と Travelpayouts の吹き出し', 'A smiling traveller in earmuffs checking her phone in a snowy village of thatched houses, beside a Travelpayouts speech bubble'] },
  'travel-demand': { img: market, alt: ['山小屋の外でノートPCを開くハイカー', 'A hiker in a yellow jacket working on a laptop outside a mountain hut, with snowy peaks behind'] },
  'ai-seo': { img: ai, alt: ['海辺の町の上に浮かぶチェックマーク付き検索結果の水彩イラスト', 'Watercolour illustration of search results with a checkmark floating above a coastal road and hillside village'] },
  'start-guide': { img: start, alt: ['夕暮れのルーフトップカフェでノートPCを使う旅行者', 'A traveller working on a laptop at a rooftop café above the city at dusk, beside a Travelpayouts speech bubble'] },
  'income-guide': { img: income, alt: ['ヤシの木の下のビーチカフェでノートPCを使う旅行者', 'A traveller in a bucket hat working on a laptop at a beachside café under palm trees'] },
  instagram: { img: insta, alt: ['日本の旅先でスマホを使う旅行者の3枚のインスタント写真', 'Three instant photos of a traveller using his phone on trips in Japan, the middle one captioned 草津温泉 (Kusatsu Onsen)'] },
};
