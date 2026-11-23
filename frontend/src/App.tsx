import React, { useState, useEffect } from 'react';
import { Product } from './types';
import { api } from './services/api';
import { useLanguage } from './context/LanguageContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HeroBanner } from './components/marketplace/HeroBanner';
import { ProductFilter } from './components/marketplace/ProductFilter';
import { ProductCard } from './components/marketplace/ProductCard';
import { CraftClustersView } from './components/marketplace/CraftClustersView';
import { ArtisansDirectoryView } from './components/marketplace/ArtisansDirectoryView';
import { FairShareCalculatorModal } from './components/marketplace/FairShareCalculatorModal';
import { ArtisanStoryModal } from './components/marketplace/ArtisanStoryModal';
import { ArtisanDashboardView } from './components/artisan/ArtisanDashboardView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { OrderTrackingView } from './components/tracking/OrderTrackingView';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { CustomCommissionModal } from './components/commissions/CustomCommissionModal';
import { AuthModal } from './components/common/AuthModal';
import { Loader2, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const { language } = useLanguage();

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('marketplace');

  // Products & Filtering State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [giOnly, setGiOnly] = useState<boolean>(false);
  const [selectedFragility, setSelectedFragility] = useState<string>('');
  const [selectedClusterId, setSelectedClusterId] = useState<string>('');

  // Modals
  const [breakdownProduct, setBreakdownProduct] = useState<Product | null>(null);
  const [storyArtisanId, setStoryArtisanId] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isCommissionOpen, setIsCommissionOpen] = useState<boolean>(false);
  const [trackingOrderNum, setTrackingOrderNum] = useState<string>('KS-2026-884120');

  // Fetch Products based on filters
  const fetchProducts = () => {
    setLoading(true);
    const params: Record<string, any> = {};
    if (selectedCategory) params.category = selectedCategory;
    if (giOnly) params.giOnly = 'true';
    if (selectedFragility) params.fragilityClass = selectedFragility;
    if (selectedClusterId) params.clusterId = selectedClusterId;
    if (searchQuery.trim()) params.search = searchQuery.trim();

    api
      .getProducts(params)
      .then((res) => {
        if (res.success && res.products) {
          setProducts(res.products);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, giOnly, selectedFragility, selectedClusterId, searchQuery]);

  const handleOrderSuccess = (orderNumber: string) => {
    setIsCheckoutOpen(false);
    setTrackingOrderNum(orderNumber);
    setActiveTab('tracking');
  };

  return (
    <div className="min-h-screen flex flex-col bg-claycream selection:bg-terracotta-200 selection:text-terracotta-900">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'marketplace') setSelectedClusterId('');
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCommission={() => setIsCommissionOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1">
        {/* Marketplace View */}
        {activeTab === 'marketplace' && (
          <div>
            <HeroBanner
              onExplore={() => {
                const el = document.getElementById('catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenCommission={() => setIsCommissionOpen(true)}
              onOpenCalculator={() => setBreakdownProduct(products[0] || null)}
            />

            <div id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <ProductFilter
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                giOnly={giOnly}
                setGiOnly={setGiOnly}
                selectedFragility={selectedFragility}
                setSelectedFragility={setSelectedFragility}
              />

              {/* Product Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="h-80 bg-stone-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenBreakdown={(p) => setBreakdownProduct(p)}
                      onOpenArtisanStory={(artisanId) => setStoryArtisanId(artisanId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-clayborder p-8 space-y-3">
                  <span className="text-4xl block">🏺</span>
                  <h3 className="font-heritage font-bold text-lg text-stone-800">
                    No artisan craft found matching filters
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Try clearing your search query or selecting "All Crafts" to view the complete heritage collection.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('');
                      setGiOnly(false);
                      setSelectedFragility('');
                      setSelectedClusterId('');
                    }}
                    className="px-4 py-2 rounded-xl bg-terracotta-600 text-white font-semibold text-xs"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GI Craft Clusters View */}
        {activeTab === 'clusters' && (
          <CraftClustersView
            onSelectCluster={(clusterId) => {
              setSelectedClusterId(clusterId);
              setActiveTab('marketplace');
            }}
          />
        )}

        {/* Master Lineages Directory View */}
        {activeTab === 'artisans' && (
          <ArtisansDirectoryView
            onSelectArtisan={(artisanId) => setStoryArtisanId(artisanId)}
          />
        )}

        {/* SafeTransit Live Order Tracking View */}
        {activeTab === 'tracking' && (
          <OrderTrackingView initialOrderNumber={trackingOrderNum} />
        )}

        {/* Artisan Studio Vernacular Portal */}
        {activeTab === 'artisan_portal' && <ArtisanDashboardView />}

        {/* Admin Console */}
        {activeTab === 'admin_console' && <AdminDashboardView />}

        {/* My Orders */}
        {activeTab === 'my_orders' && (
          <OrderTrackingView initialOrderNumber={trackingOrderNum} />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {/* Custom Bespoke Commission Modal */}
      {isCommissionOpen && (
        <CustomCommissionModal onClose={() => setIsCommissionOpen(false)} />
      )}

      {/* Fair-Share Transparency Calculator Modal */}
      {breakdownProduct && (
        <FairShareCalculatorModal
          product={breakdownProduct}
          onClose={() => setBreakdownProduct(null)}
        />
      )}

      {/* Artisan Lineage Story Modal */}
      {storyArtisanId && (
        <ArtisanStoryModal
          artisanId={storyArtisanId}
          onClose={() => setStoryArtisanId(null)}
          onSelectProduct={(p) => setBreakdownProduct(p)}
        />
      )}

      {/* Authentication Modal */}
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}

      {/* Footer */}
      <Footer />
    </div>
  );
};
