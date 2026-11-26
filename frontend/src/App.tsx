import React, { useState, useEffect, useMemo } from 'react';
import type { Product } from './types';
import { api } from './services/api';
import { artForm, defaultFilters, filterCatalog, materials, type CatalogFilters } from './services/catalog';
import { attachFeaturedMedia, mediaPreviews } from './services/featuredMedia';
import { sampleProducts } from './services/sampleCatalog';
import { useSaved } from './context/SavedContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HeroBanner } from './components/marketplace/HeroBanner';
import { Discovery } from './components/marketplace/Discovery';
import { ProductFilter } from './components/marketplace/ProductFilter';
import { ProductCard } from './components/marketplace/ProductCard';
import { ProductDetails } from './components/marketplace/ProductDetails';
import { CraftClustersView } from './components/marketplace/CraftClustersView';
import { ArtisansDirectoryView } from './components/marketplace/ArtisansDirectoryView';
import { ArtisanProfileView } from './components/marketplace/ArtisanProfileView';
import { FairShareCalculatorModal } from './components/marketplace/FairShareCalculatorModal';
import { ArtisanDashboardView } from './components/artisan/ArtisanDashboardView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { OrderTrackingView } from './components/tracking/OrderTrackingView';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { CustomCommissionModal } from './components/commissions/CustomCommissionModal';
import { AuthModal } from './components/common/AuthModal';

const unique = (values: string[]) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

export const App: React.FC = () => {
  const { wishlist } = useSaved();
  const [activeTab, setActiveTab] = useState('marketplace');
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogStatus, setCatalogStatus] = useState<'loading' | 'ready' | 'offline'>('loading');
  const [catalogRevision, setCatalogRevision] = useState(0);
  const [filters, setFilters] = useState(defaultFilters);
  const [breakdownProduct, setBreakdownProduct] = useState<Product | 'example' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [artisanId, setArtisanId] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCommissionOpen, setIsCommissionOpen] = useState(false);
  const [trackingOrderNum, setTrackingOrderNum] = useState('KS-2026-884120');

  useEffect(() => {
    let current = true;
    async function loadCatalog() {
      try {
        const first = await api.getProducts({ limit: 100 });
        if (!current) return;
        if (!Array.isArray(first.products)) throw new Error('Catalog unavailable');
        const records: Product[] = first.products;
        for (let page = 2; current && page <= first.totalPages; page++) {
          const result = await api.getProducts({ limit: 100, page });
          records.push(...result.products);
        }
        if (current) {
          setProducts([...new Map(records.map((record) => [record.id, record])).values()]);
          setCatalogStatus('ready');
        }
      } catch {
        if (current) setCatalogStatus('offline');
      }
    }
    loadCatalog();
    return () => { current = false; };
  }, [catalogRevision]);

  const catalog = useMemo(() => [
    ...products.map(attachFeaturedMedia),
    ...mediaPreviews.filter((preview) => !products.some((product) => product.slug === preview.slug)),
    ...sampleProducts,
  ], [products]);
  const facets = useMemo(() => ({
    regions: unique(catalog.map((product) => product.cluster?.state)),
    crafts: unique(catalog.map(artForm)),
    materials: unique(catalog.flatMap(materials)),
  }), [catalog]);
  const visible = filterCatalog(catalog, filters, wishlist);

  useEffect(() => {
    if (activeTab !== 'product' || !selectedProduct || selectedProduct.isDemo) return;
    const id = selectedProduct.id;
    let current = true;
    api.getProduct(id).then(({ product }) => {
      if (current) setSelectedProduct((previous) => previous?.id === id ? attachFeaturedMedia({ ...previous, ...product }) : previous);
    }).catch(() => { /* The listing preview carries the same public craft metadata. */ });
    return () => { current = false; };
  }, [activeTab, selectedProduct?.id]);

  const goTo = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const scrollToCatalog = () => requestAnimationFrame(() => document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' }));
  const browse = (next: Partial<CatalogFilters>) => {
    setFilters({ ...defaultFilters, ...next });
    setActiveTab('marketplace');
    scrollToCatalog();
  };
  const returnToCatalog = () => {
    setActiveTab('marketplace');
    scrollToCatalog();
  };
  const openProduct = (product: Product) => {
    setSelectedProduct(attachFeaturedMedia(product));
    goTo('product');
  };
  const openArtisan = (id: string) => {
    setArtisanId(id);
    goTo('artisan_profile');
  };
  const handleOrderSuccess = (orderNumber: string) => {
    setIsCheckoutOpen(false);
    setTrackingOrderNum(orderNumber);
    goTo('tracking');
  };

  return (
    <div className="min-h-screen flex flex-col bg-claycream selection:bg-terracotta-200 selection:text-terracotta-900">
      <Navbar activeTab={activeTab} setActiveTab={(tab) => {
        if (tab === 'marketplace') setFilters(defaultFilters);
        goTo(tab);
      }} onOpenWishlist={() => browse({ saved: true })} onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCommission={() => setIsCommissionOpen(true)} />
      <main className="flex-1">
        {activeTab === 'marketplace' && <>
          <HeroBanner onExplore={scrollToCatalog} onOpenCommission={() => setIsCommissionOpen(true)}
            onOpenCalculator={() => setBreakdownProduct('example')} />
          <Discovery facets={facets} products={catalog} selectedCategory={filters.category} onBrowse={browse} onProduct={openProduct} />
          <section id="catalog-section" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">{filters.saved ? 'My wishlist' : filters.category || filters.collection || 'Browse the marketplace'}</h2>
            {catalogStatus === 'offline' && <p className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950" role="status">
              {products.length ? 'Showing the last loaded catalog and sample listings.' : 'Live catalog unavailable. You can still browse sample listings.'}
              <button className="font-semibold underline" onClick={() => {
                setCatalogStatus('loading');
                setCatalogRevision((revision) => revision + 1);
              }}>Retry live catalog</button>
            </p>}
            {catalogStatus === 'loading' && <p className="mb-4 text-sm text-stone-600" role="status">Loading the live catalog…</p>}
            <ProductFilter filters={filters} onChange={(changes) => setFilters((previous) => ({ ...previous, ...changes }))}
              onReset={() => setFilters(defaultFilters)} facets={facets} count={visible.length} />
            {visible.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((product) => <ProductCard key={product.id} product={product} onOpenProduct={openProduct}
                onOpenBreakdown={setBreakdownProduct} onOpenArtisanStory={openArtisan} />)}
            </div> : <div className="rounded-2xl border border-clayborder bg-white p-10 text-center">
              <h3 className="text-xl font-bold">{filters.saved ? 'No saved pieces match' : 'No pieces match these filters'}</h3>
              <p className="mt-2 text-sm text-stone-600">{filters.saved ? 'Use the heart on a listing to save it here.' : 'Try another category or clear the filters.'}</p>
              <button className="craft-outline mt-4" onClick={() => setFilters(defaultFilters)}>Browse all pieces</button>
            </div>}
          </section>
        </>}
        {activeTab === 'product' && selectedProduct && <ProductDetails key={selectedProduct.id} product={selectedProduct} catalog={catalog}
          onBack={returnToCatalog} onProduct={openProduct} onArtisan={openArtisan} onBreakdown={setBreakdownProduct} />}
        {activeTab === 'artisan_profile' && artisanId && <ArtisanProfileView key={artisanId} id={artisanId} onBack={() => goTo('artisans')} onProduct={openProduct} />}
        {activeTab === 'clusters' && <CraftClustersView onSelectCluster={(cluster) => browse({ cluster })} />}
        {activeTab === 'artisans' && <ArtisansDirectoryView onSelectArtisan={openArtisan} />}
        {(activeTab === 'tracking' || activeTab === 'my_orders') && <OrderTrackingView initialOrderNumber={trackingOrderNum} />}
        {activeTab === 'artisan_portal' && <ArtisanDashboardView onOpenAuth={() => setIsAuthOpen(true)} onCatalogChange={() => setCatalogRevision((revision) => revision + 1)} />}
        {activeTab === 'admin_console' && <AdminDashboardView />}
      </main>
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />
      {isCheckoutOpen && <CheckoutModal onClose={() => setIsCheckoutOpen(false)} onOrderSuccess={handleOrderSuccess} />}
      {isCommissionOpen && <CustomCommissionModal onClose={() => setIsCommissionOpen(false)} />}
      {breakdownProduct && <FairShareCalculatorModal product={breakdownProduct === 'example' ? null : breakdownProduct} onClose={() => setBreakdownProduct(null)} />}
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
      <Footer />
    </div>
  );
};
