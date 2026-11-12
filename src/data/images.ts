// Article body images live in content/images (outside site/). Vite resolves them to
// ImageMetadata, so <Image> can optimise and size them like any other asset.
import type { ImageMetadata } from 'astro';

const files = import.meta.glob('../../content/images/**/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
}) as Record<string, ImageMetadata>;

const byPath = new Map(
  Object.entries(files).map(([key, img]) => [key.slice(key.indexOf('content/images/') + 'content/images/'.length), img]),
);

/** content image path (images/<slug>/<file>) -> ImageMetadata, or undefined if missing. */
export const contentImage = (src: string) => byPath.get(src.replace(/^images\//, ''));
