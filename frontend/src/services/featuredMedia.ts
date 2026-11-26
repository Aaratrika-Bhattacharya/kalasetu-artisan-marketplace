import type { Product } from '../types';
import media from './featuredMediaAssets.json';

const previews = [
  { media: media.mirror, title: 'KaPra Mirror Mandala Wall Plate', category: 'Wall Decor', artForm: 'Mandala mirror work', price: 1490,
    description: 'Concentric teal, cobalt and white motifs surround inset mirrors on this decorative wall plate.',
    process: 'The clip illustrates decorating the circular design and attaching a wall mount.' },
  { media: media.ganesha, title: 'Black Ganesha Decorative Plate', category: 'Wall Decor', artForm: 'Decorative pottery', price: 1290,
    description: 'A black decorative plate with a fine Ganesha design, a small mouse motif and a patterned border.',
    process: 'The clip illustrates wheel shaping, applying a dark finish and adding the decorative linework.' },
  { media: media.vase, title: 'Blue-and-White Floral Vase', category: 'Pottery & Ceramics', artForm: 'Blue and white pottery', price: 1690,
    description: 'A narrow-necked ceramic vase with dense cobalt floral patterns against a white ground.',
    process: 'The clips illustrate shaping, decorating and firing a blue-and-white vase.' },
  { media: media.horse, title: 'Bankura Terracotta Horse', category: 'Sculpture', artForm: 'Bengal Terracotta', price: 950,
    description: 'A terracotta horse with tall pointed ears and raised ornament on its chest.',
    process: 'The clip illustrates shaping and firing a terracotta horse.' },
];

export const mediaPreviews: Product[] = previews.map(({ media: { slug, image, videos }, title, category, artForm, price, description, process }) => ({
  id: `media-preview-${slug}`, slug, isDemo: true, isTrendingSample: true,
  title, category, description, tags: [artForm], retailPrice: price,
  artisanBasePrice: Math.round(price * 0.85), stockQuantity: 1,
  fragilityClass: 'HIGH', safeTransitCertified: false,
  images: [{ id: `${slug}-photo`, imageUrl: image, isPrimary: true }],
  craftDetails: { videos, artForm, makingProcess: process, collections: ['Home decor'] },
}));

export function attachFeaturedMedia(product: Product): Product {
  if (product.slug !== media.horse.slug) return product;
  const image = product.images.find((item) => item.imageUrl === media.horse.image);
  const primaryImage = { id: `${product.id}-uploaded-photo`, ...image, imageUrl: media.horse.image, isPrimary: true };
  const existingVideos = product.craftDetails?.videos || [];
  const videos = [...existingVideos, ...media.horse.videos.filter((clip) => !existingVideos.some((existing) => existing.url === clip.url))];
  return {
    ...product,
    images: [primaryImage, ...product.images.filter((item) => item.imageUrl !== media.horse.image)
      .map((item) => ({ ...item, isPrimary: false }))],
    craftDetails: { ...product.craftDetails, videos },
  };
}
