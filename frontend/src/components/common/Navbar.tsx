import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguagePicker } from './LanguagePicker';
import {
  ShoppingBag,
  Mic,
  ShieldCheck,
  User as UserIcon,
  Compass,
  LogOut,
  SlidersHorizontal,
  Layers,
  Sparkles,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenCommission: () => void;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab, onOpenAuth, onOpenCommission }) => {
  const { user, logout, isArtisan, isAdmin } = useAuth();
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { t } = useLanguage();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-clayborder shadow-sm">
      {/* Top Heritage Impact Ribbon */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 text-center font-medium tracking-wide flex justify-center items-center space-x-2">
        <span className="bg-terracotta-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">Fair-Trade Guarantee</span>
        <span>85% of retail price disbursed directly to master artisans</span>
        <span className="text-stone-500">•</span>
        <span className="hidden sm:inline text-amber-400 flex items-center">
          <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
          Zero-Breakage Bio-Straw Packaging Certified
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('marketplace')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-terracotta-600 to-terracotta-800 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <span className="text-2xl">🏺</span>
            </div>
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-heritage text-2xl font-bold tracking-tight text-stone-900">
                  KalaSetu
                </span>
                <span className="font-heritage text-base text-terracotta-600 font-semibold">
                  (कला सेतु)
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium tracking-wide">
                Direct-to-Connoisseur Artisan Heritage
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'marketplace'
                  ? 'text-terracotta-700 bg-terracotta-50 font-semibold'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-50'
              }`}
            >
              <Compass className="w-4 h-4 inline mr-1.5 text-stone-500" />
              {t('nav_marketplace')}
            </button>

            <button
              onClick={() => setActiveTab('clusters')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'clusters'
                  ? 'text-terracotta-700 bg-terracotta-50 font-semibold'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-50'
              }`}
            >
              <Layers className="w-4 h-4 inline mr-1.5 text-stone-500" />
              {t('nav_clusters')}
            </button>

            <button
              onClick={() => setActiveTab('artisans')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'artisans'
                  ? 'text-terracotta-700 bg-terracotta-50 font-semibold'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-50'
              }`}
            >
              {t('nav_artisans')}
            </button>

            <button
              onClick={onOpenCommission}
              className="px-3 py-2 rounded-lg text-sm font-medium text-amber-800 hover:bg-amber-50 transition-colors flex items-center"
            >
              <Sparkles className="w-4 h-4 mr-1 text-amber-600" />
              {t('nav_commissions')}
            </button>

            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'tracking'
                  ? 'text-terracotta-700 bg-terracotta-50 font-semibold'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 inline mr-1.5 text-amber-600" />
              {t('nav_track_order')}
            </button>
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center space-x-3">
            <LanguagePicker />

            {/* Artisan Studio Portal Button */}
            <button
              onClick={() => setActiveTab('artisan_portal')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeTab === 'artisan_portal'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-amber-50/80 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
              <span>{t('nav_artisan_portal')}</span>
            </button>

            {/* Admin Console Shortcut */}
            <button
              onClick={() => setActiveTab('admin_console')}
              className={`p-2 rounded-lg border text-stone-600 hover:text-stone-900 transition-colors ${
                activeTab === 'admin_console'
                  ? 'bg-stone-100 border-stone-400 text-stone-900'
                  : 'border-clayborder hover:bg-stone-50'
              }`}
              title={t('nav_admin_console')}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Shopping Cart Pill */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-terracotta-50 text-terracotta-700 hover:bg-terracotta-100 border border-terracotta-200 transition-colors"
              aria-label="Open Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-terracotta-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* User Account Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg border border-clayborder hover:bg-stone-50"
                >
                  <img
                    src={
                      user.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                    }
                    alt={user.fullName}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="text-xs font-semibold text-stone-800 hidden sm:inline max-w-[100px] truncate">
                    {user.fullName.split(' ')[0]}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-clayborder py-2 text-xs z-50">
                    <div className="px-3 py-2 border-b border-stone-100">
                      <p className="font-semibold text-stone-900">{user.fullName}</p>
                      <p className="text-stone-500 text-[10px]">{user.role}</p>
                    </div>

                    {isArtisan && (
                      <button
                        onClick={() => {
                          setActiveTab('artisan_portal');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-stone-50 text-stone-700 flex items-center"
                      >
                        <Mic className="w-3.5 h-3.5 mr-2 text-terracotta-600" />
                        Artisan Studio
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setActiveTab('admin_console');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-stone-50 text-stone-700 flex items-center"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 mr-2 text-stone-600" />
                        Admin Governance
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveTab('my_orders');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-stone-50 text-stone-700 flex items-center"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 mr-2 text-amber-600" />
                      My Orders
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center border-t border-stone-100 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-terracotta-600 text-white text-xs font-semibold hover:bg-terracotta-700 transition-colors shadow-sm flex items-center space-x-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
