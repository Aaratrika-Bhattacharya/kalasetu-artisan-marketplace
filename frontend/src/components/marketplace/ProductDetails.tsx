import { ArrowLeft, Heart, PackageCheck, ShoppingBag } from 'lucide-react';
import type { Product } from '../../types';
import { availability, artForm, isAvailable, materials, productImage, relatedProducts } from '../../services/catalog';
import { sampleCraftSources } from '../../services/sampleCatalog';
import { useLanguage } from '../../context/LanguageContext';
import { useSaved } from '../../context/SavedContext';
import { useCart } from '../../context/CartContext';
import { CraftImage } from './CraftImage';
import { ProductGallery } from './ProductGallery';

interface Props {
  product: Product;
  catalog: Product[];
  onBack: () => void;
  onArtisan: (id: string) => void;
  onBreakdown: (product: Product) => void;
  onProduct: (product: Product) => void;
}

export function ProductDetails({ product, catalog, onBack, onArtisan, onBreakdown, onProduct }: Props) {
  const { tVernacular } = useLanguage();
  const { wishlist, toggleWishlist } = useSaved();
  const { addItem } = useCart();
  const title = tVernacular(product.vernacularTitles, product.title);
  const description = tVernacular(product.vernacularDescs, product.description);
  const saved = wishlist.includes(product.id);
  const details = product.craftDetails;
  const dimensions = product.dimensions;
  const related = relatedProducts(product, catalog);
  const fragile = ['HIGH', 'EXTREME'].includes(product.fragilityClass);
  const maker = product.artisan;

  return <article className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
    <button className="craft-outline" onClick={onBack}><ArrowLeft size={16} /> Back to browsing</button>
    <div className="grid gap-8 lg:grid-cols-2">
      <ProductGallery product={product} title={title} />
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-terracotta-800">{[artForm(product), product.cluster?.state].filter(Boolean).join(' · ')}</p>
          <h1 className="text-3xl font-bold sm:text-5xl">{title}</h1>
          <p className="mt-3 leading-relaxed text-stone-600">{description}</p>
        </div>
        {product.isDemo && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-950">Sample listing. Pricing and availability are for preview.</p>}
        <div className="flex flex-wrap items-baseline gap-3">
          <strong className="font-heritage text-3xl">₹{product.retailPrice.toLocaleString('en-IN')}</strong>
          <span className="text-sm font-semibold text-terracotta-800">{availability(product)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="craft-button" disabled={!isAvailable(product)} onClick={() => addItem(product)}><ShoppingBag size={17} />{product.isDemo ? 'Try in cart' : 'Add to cart'}</button>
          <button className="craft-outline" aria-pressed={saved} onClick={() => toggleWishlist(product.id)}><Heart size={17} fill={saved ? 'currentColor' : 'none'} />{saved ? 'Saved to wishlist' : 'Save to wishlist'}</button>
        </div>
        <dl className="grid grid-cols-2 gap-4 rounded-2xl border border-clayborder bg-white p-5 text-sm">
          <div><dt className="font-semibold">Materials</dt><dd className="text-stone-600">{materials(product).join(', ') || 'Details unavailable'}</dd></div>
          <div><dt className="font-semibold">Dimensions</dt><dd className="text-stone-600">{dimensions ? `${dimensions.lengthCm} × ${dimensions.widthCm} × ${dimensions.heightCm} cm` : 'Details unavailable'}</dd></div>
          <div><dt className="font-semibold">Estimated delivery</dt><dd className="text-stone-600">{isAvailable(product) && product.leadTimeDays != null ? `${product.leadTimeDays + 3}–${product.leadTimeDays + 7} days, depending on PIN code` : 'Currently unavailable'}</dd></div>
          <div><dt className="font-semibold">Care instructions</dt><dd className="text-stone-600">{details?.careInstructions || 'Ask the artisan for care guidance.'}</dd></div>
        </dl>
        {!product.isDemo && Number.isFinite(product.artisanBasePrice) && <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-950">
          <span>Artisan receives <strong>₹{product.artisanBasePrice.toLocaleString('en-IN')}</strong> per piece</span>
          <button className="font-semibold underline underline-offset-2" onClick={() => onBreakdown(product)}>View breakdown</button>
        </div>}
        {(fragile || product.packagingSpec) && <div className="flex items-start gap-3 rounded-xl border border-clayborder p-4 text-sm">
          <PackageCheck className="shrink-0 text-terracotta-700" size={22} />
          <div><strong>Protective packaging</strong><p className="text-stone-600">{product.packagingSpec?.cushioningMaterial || 'A fitted insert and cushioning help protect fragile surfaces.'}</p></div>
        </div>}
      </div>
    </div>

    <section className="grid gap-3 sm:grid-cols-2" aria-label="The story of this piece">
      <Story title="Making process" text={details?.makingProcess || 'The workshop has yet to share its making process.'} />
      <div className="rounded-2xl border border-clayborder bg-white p-5">
        <h2 className="mb-2 text-lg font-bold">Meet the artisan</h2>
        <p className="text-sm text-stone-600">{maker ? [maker.artisanName, maker.brandName].filter(Boolean).join(' · ') : 'Artisan details are unavailable.'}</p>
        {maker && <button className="mt-3 text-sm font-semibold text-terracotta-800 underline underline-offset-2" onClick={() => onArtisan(maker.id)}>View artisan profile</button>}
      </div>
      <Story title="Story behind the product" text={details?.story || description} />
      <Story title="History and cultural significance" text={details?.heritage || product.cluster?.description || 'A history of this art form is unavailable.'}
        source={product.isDemo ? sampleCraftSources[product.slug] : undefined} />
    </section>

    {related.length > 0 && <section>
      <h2 className="mb-4 text-2xl font-bold">Related pieces</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{related.map((item) =>
        <button key={item.id} className="heritage-card overflow-hidden rounded-xl text-left" onClick={() => onProduct(item)}>
          <CraftImage src={productImage(item)} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
          <span className="block p-3 text-sm font-semibold">{item.title}<small className="mt-1 block text-stone-600">₹{item.retailPrice}{item.isDemo && ' · Sample listing'}</small></span>
        </button>)}</div>
    </section>}
  </article>;
}

function Story({ title, text, source }: { title: string; text: string; source?: string }) {
  return <section className="rounded-2xl border border-clayborder bg-white p-5">
    <h2 className="mb-2 text-lg font-bold">{title}</h2><p className="whitespace-pre-line text-sm leading-relaxed text-stone-600">{text}</p>
    {source && <a href={source} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-terracotta-800 underline underline-offset-2">Read about the craft</a>}
  </section>;
}
