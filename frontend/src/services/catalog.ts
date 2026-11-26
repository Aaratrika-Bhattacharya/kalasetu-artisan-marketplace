import type { Product } from '../types';

export const categories = [
  ['Wall Decor', 'lippan'], ['Table & Office Decor', 'wood'], ['Home Decor', 'terracotta'],
  ['Pottery & Ceramics', 'blue-pottery'], ['Paintings', 'madhubani'], ['Wooden Crafts', 'wood'],
  ['Metal Crafts', 'dokra'], ['Handloom & Textiles', 'ikat'], ['Jewellery', 'filigree'], ['Gifts', 'diyas'],
] as const;

export const collections = ['Gifting', 'Festivals', 'Home decor', 'Office decor'] as const;

export const craftImage = (name: string) => `/crafts/${name}.webp`;
export const productImage = (product: Product) =>
  (product.images.find((image) => image.isPrimary) || product.images[0])?.imageUrl || craftImage('terracotta');

export const artForm = (p: Product) => p.craftDetails?.artForm || p.cluster?.name || '';
export const materials = (p: Product) => p.craftDetails?.materials?.length ? p.craftDetails.materials : p.cluster?.materialsUsed || [];
export const isAvailable = (p: Product) => Boolean(p.isMadeToOrder || p.stockQuantity > 0);
export const availability = (p: Product) =>
  p.isMadeToOrder ? 'Made to order' : p.stockQuantity <= 0 ? 'Sold out' :
    p.stockQuantity <= 3 ? `Only ${p.stockQuantity} left` : 'Ready to ship';

const pottery = /terracotta|pottery|ceramic|earthenware|stoneware|porcelain/i;

export function matchesCategory(product: Product, category: string) {
  if (product.category === category) return true;
  switch (category) {
    case 'Pottery & Ceramics':
      return [artForm(product), product.subCategory, ...product.tags].some((term) => pottery.test(term || ''));
    case 'Home Decor':
      return ['Wall Decor', 'Sculpture', 'Serveware', 'Spiritual'].includes(product.category);
    case 'Table & Office Decor':
      return product.category === 'Serveware' || product.craftDetails?.collections?.includes('Office decor');
    case 'Gifts':
      return product.craftDetails?.collections?.includes('Gifting') || product.tags.some((tag) => /gift/i.test(tag));
    default:
      return false;
  }
}

export interface CatalogFilters {
  search: string;
  category: string;
  region: string;
  craft: string;
  material: string;
  availability: string;
  min: string;
  max: string;
  sort: string;
  gi: boolean;
  fragility: string;
  cluster: string;
  collection: string;
  saved: boolean;
  trending: boolean;
}

export const defaultFilters: CatalogFilters = {
  search: '', category: '', region: '', craft: '', material: '', availability: '', min: '', max: '',
  sort: '', gi: false, fragility: '', cluster: '', collection: '', saved: false, trending: false,
};

export const trendScore = (p: Product) => (p.reviewsCount || 0) + (p.isTrendingSample ? 1 : 0);

export function filterCatalog(products: Product[], f: CatalogFilters, saved: string[]) {
  const terms = f.search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const rows = products.filter((p) =>
    (!f.category || matchesCategory(p, f.category)) &&
    (!f.region || p.cluster?.state === f.region) && (!f.craft || artForm(p) === f.craft) &&
    (!f.material || materials(p).includes(f.material)) &&
    (!f.availability || (f.availability === 'made' ? p.isMadeToOrder :
      f.availability === 'ready' ? !p.isMadeToOrder && p.stockQuantity > 0 : !isAvailable(p))) &&
    (!f.min || p.retailPrice >= Number(f.min)) && (!f.max || p.retailPrice <= Number(f.max)) &&
    (!f.gi || p.cluster?.isGiTagged) && (!f.fragility || p.fragilityClass === f.fragility) &&
    (!f.cluster || p.cluster?.id === f.cluster) && (!f.saved || saved.includes(p.id)) &&
    (!f.trending || trendScore(p) > 0) &&
    (!f.collection || p.craftDetails?.collections?.includes(f.collection) ||
      (f.collection === 'Home decor' && matchesCategory(p, 'Home Decor'))) &&
    terms.every((term) => [p.title, p.description, p.category, p.subCategory, artForm(p), p.cluster?.state,
      p.artisan?.artisanName, ...p.tags, ...materials(p), ...Object.values(p.vernacularTitles || {})]
      .join(' ').toLowerCase().includes(term))
  );
  if (f.sort === 'price-low') rows.sort((a, b) => a.retailPrice - b.retailPrice);
  if (f.sort === 'price-high') rows.sort((a, b) => b.retailPrice - a.retailPrice);
  if (f.sort === 'name') rows.sort((a, b) => a.title.localeCompare(b.title));
  if (f.sort === 'trending' || f.trending) rows.sort((a, b) => trendScore(b) - trendScore(a));
  return rows;
}

export function relatedProducts(product: Product, catalog: Product[]) {
  const score = (p: Product) =>
    Number(Boolean(product.artisan && p.artisan?.id === product.artisan.id)) * 3 +
    Number(Boolean(artForm(product) && artForm(p) === artForm(product))) * 2 +
    Number(p.category === product.category) + Number(Boolean(product.cluster && p.cluster?.state === product.cluster.state));
  return catalog.filter((p) => p.id !== product.id && score(p) > 0)
    .sort((a, b) => score(b) - score(a)).slice(0, 4);
}
