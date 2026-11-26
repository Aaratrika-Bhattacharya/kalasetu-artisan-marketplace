import { ArrowUpRight } from 'lucide-react';
import { categories, collections, craftImage, productImage, trendScore, type CatalogFilters } from '../../services/catalog';
import { lesserKnownCrafts } from '../../services/sampleCatalog';
import type { Product } from '../../types';
import { CraftImage } from './CraftImage';

export interface CatalogFacets {
  regions: string[];
  crafts: string[];
  materials: string[];
}

interface Props {
  facets: CatalogFacets;
  products: Product[];
  selectedCategory: string;
  onBrowse: (filters: Partial<CatalogFilters>) => void;
  onProduct: (product: Product) => void;
}

export function Discovery({ facets, products, selectedCategory, onBrowse, onProduct }: Props) {
  const trending = products.filter((p) => trendScore(p) > 0)
    .sort((a, b) => trendScore(b) - trendScore(a)).slice(0, 4);

  return <section aria-label="Discover handicrafts" className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
    <div>
      <h2 className="mb-4 text-2xl font-bold sm:text-3xl">Shop by category</h2>
      <nav aria-label="Product categories" className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10 lg:gap-3">
        {categories.map(([label, image]) => <button key={label} type="button" aria-pressed={selectedCategory === label}
          onClick={() => onBrowse({ category: selectedCategory === label ? '' : label })}
          className={`group overflow-hidden rounded-xl border bg-white text-left hover:border-terracotta-500 ${selectedCategory === label ? 'border-terracotta-600 ring-1 ring-terracotta-600' : 'border-clayborder'}`}>
          <div className="overflow-hidden"><CraftImage src={craftImage(image)} alt="" loading="lazy" className="aspect-[2/1] w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:aspect-[4/3]" /></div>
          <span className="block px-2 py-2.5 text-xs font-semibold leading-tight">{label}</span>
        </button>)}
      </nav>
    </div>

    {trending.length > 0 && <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Trending handicrafts</h2>
        <button className="craft-outline" onClick={() => onBrowse({ trending: true, sort: 'trending' })}>Browse trending <ArrowUpRight size={15} /></button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {trending.map((product) => <button key={product.id} onClick={() => onProduct(product)}
          className="heritage-card flex flex-col items-start gap-2 rounded-xl p-2 text-left sm:flex-row sm:items-center sm:p-3">
          <CraftImage src={productImage(product)} alt="" className="aspect-[2/1] w-full rounded-lg object-cover sm:h-14 sm:w-14" loading="lazy" />
          <span className="text-xs font-semibold sm:text-sm">{product.title}{product.isDemo && <small className="mt-1 block font-normal text-stone-500">Sample listing</small>}</span>
        </button>)}
      </div>
    </div>}

    <div className="grid gap-6 rounded-2xl border border-clayborder bg-white p-5 md:grid-cols-3 sm:p-6">
      <div>
        <h2 className="mb-3 text-xl font-bold">Shop by region</h2>
        <div className="flex flex-wrap gap-2">{facets.regions.map((region) => <button className="craft-outline" key={region} onClick={() => onBrowse({ region })}>{region}</button>)}</div>
      </div>
      <div>
        <h2 className="mb-3 text-xl font-bold">Explore by art form</h2>
        <select className="craft-input" aria-label="Explore by art form" value="" onChange={(event) => event.target.value && onBrowse({ craft: event.target.value })}>
          <option value="">Choose an art form</option>{facets.crafts.map((craft) => <option key={craft}>{craft}</option>)}
        </select>
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Lesser-known crafts">
          {lesserKnownCrafts.map(({ craft }) => <button className="craft-outline" key={craft} onClick={() => onBrowse({ craft })}>{craft} <ArrowUpRight size={13} /></button>)}
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-xl font-bold">Curated collections</h2>
        <div className="flex flex-wrap gap-2">{collections.map((collection) => <button className="craft-outline" key={collection} onClick={() => onBrowse({ collection })}>{collection}</button>)}</div>
      </div>
    </div>
  </section>;
}
