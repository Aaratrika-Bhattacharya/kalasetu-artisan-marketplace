import { Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { categories, collections, type CatalogFilters } from '../../services/catalog';
import type { CatalogFacets } from './Discovery';

function FilterSelect({ label, value, onChange, children }: {
  label: string; value: string; onChange: (value: string) => void; children: ReactNode;
}) {
  return <label className="grid gap-1 text-xs font-semibold">{label}
    <select className="craft-input font-normal" value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
  </label>;
}

export function ProductFilter({ filters, onChange, onReset, facets, count }: {
  filters: CatalogFilters; onChange: (filters: Partial<CatalogFilters>) => void;
  onReset: () => void; facets: CatalogFacets; count: number;
}) {
  const options = (values: readonly string[]) => values.map((value) => <option key={value}>{value}</option>);
  return <div className="mb-6 space-y-4 rounded-2xl border border-clayborder bg-white p-4 sm:p-5">
    <div className="grid gap-3 sm:grid-cols-[1fr_14rem]">
      <label className="grid gap-1 text-xs font-semibold">Search the catalog
        <span className="relative">
          <Search aria-hidden size={17} className="absolute left-3 top-3 text-stone-500" />
          <input className="craft-input pl-9 font-normal" type="search" value={filters.search} placeholder="Try terracotta or Odisha"
            onChange={(e) => onChange({ search: e.target.value })} />
        </span>
      </label>
      <FilterSelect label="Sort by" value={filters.sort} onChange={(sort) => onChange({ sort, trending: false })}>
        <option value="">Newest</option><option value="trending">Trending</option><option value="price-low">Price, low to high</option>
        <option value="price-high">Price, high to low</option><option value="name">Name, A to Z</option>
      </FilterSelect>
    </div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
      <FilterSelect label="Category" value={filters.category} onChange={(category) => onChange({ category })}><option value="">All categories</option>{options(categories.map(([label]) => label))}</FilterSelect>
      <FilterSelect label="Region" value={filters.region} onChange={(region) => onChange({ region })}><option value="">All regions</option>{options(facets.regions)}</FilterSelect>
      <FilterSelect label="Art form" value={filters.craft} onChange={(craft) => onChange({ craft })}><option value="">All art forms</option>{options(facets.crafts)}</FilterSelect>
      <FilterSelect label="Material" value={filters.material} onChange={(material) => onChange({ material })}><option value="">All materials</option>{options(facets.materials)}</FilterSelect>
      <FilterSelect label="Availability" value={filters.availability} onChange={(availability) => onChange({ availability })}>
        <option value="">Any availability</option><option value="ready">Ready to ship</option><option value="made">Made to order</option><option value="sold">Sold out</option>
      </FilterSelect>
      <label className="grid gap-1 text-xs font-semibold">Min price (₹)
        <input className="craft-input font-normal" type="number" min="0" value={filters.min} onChange={(e) => onChange({ min: e.target.value })} />
      </label>
      <label className="grid gap-1 text-xs font-semibold">Max price (₹)
        <input className="craft-input font-normal" type="number" min="0" value={filters.max} onChange={(e) => onChange({ max: e.target.value })} />
      </label>
      <FilterSelect label="Fragility" value={filters.fragility} onChange={(fragility) => onChange({ fragility })}>
        <option value="">Any fragility</option>{options(['LOW', 'MEDIUM', 'HIGH', 'EXTREME'])}
      </FilterSelect>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <div className="flex flex-wrap gap-4 text-stone-700">
        <label className="flex items-center gap-2"><input className="accent-terracotta-700" type="checkbox" checked={filters.gi} onChange={(e) => onChange({ gi: e.target.checked })} /> GI-tagged crafts</label>
        <label className="flex items-center gap-2"><input className="accent-terracotta-700" type="checkbox" checked={filters.saved} onChange={(e) => onChange({ saved: e.target.checked })} /> My wishlist</label>
      </div>
      <span className="text-stone-500" aria-live="polite">{count} {count === 1 ? 'piece' : 'pieces'}</span>
      <button className="craft-outline" onClick={onReset}>Clear filters</button>
    </div>
    {(filters.collection || filters.cluster || filters.trending) && <div className="flex flex-wrap items-center gap-2">
      {(filters.collection || filters.cluster) && <FilterSelect label={filters.cluster ? 'Collection · craft cluster selected' : 'Collection'} value={filters.collection}
        onChange={(collection) => onChange({ collection, cluster: '' })}><option value="">All collections</option>{options(collections)}</FilterSelect>}
      {filters.cluster && <button className="craft-outline" onClick={() => onChange({ cluster: '' })}>Clear cluster</button>}
      {filters.trending && <button className="craft-outline" onClick={() => onChange({ trending: false, sort: '' })}>Clear trending</button>}
    </div>}
  </div>;
}
