import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { VoiceMultimodalUpload } from './VoiceMultimodalUpload';
import { SafeTransitPackagingGuide } from './SafeTransitPackagingGuide';
import { LanguagePicker } from '../common/LanguagePicker';
import {
  Mic,
  Package,
  Wallet,
  ShieldCheck,
  PlusCircle,
  Truck,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

export const ArtisanDashboardView: React.FC = () => {
  const { user, isArtisan } = useAuth();
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'upload' | 'packaging' | 'orders' | 'products'>('upload');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboard = () => {
    setLoading(true);
    api
      .getMyArtisanDashboard()
      .then((res) => {
        if (res.success) {
          setDashboardData(res);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner & Language Pill */}
      <div className="bg-gradient-to-r from-stone-900 to-terracotta-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Mic className="w-4 h-4 animate-pulse" />
            <span>KalaSetu Artisan Vernacular Studio</span>
          </div>
          <h2 className="font-heritage text-2xl sm:text-3xl font-bold">
            Welcome, {user?.fullName || 'Master Artisan'}
          </h2>
          <p className="text-stone-300 text-xs mt-1">
            Cluster: {dashboardData?.profile?.cluster || 'Bishnupur Heritage Terracotta'} • Direct Bank Settlement Active
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <LanguagePicker />
          <button
            onClick={() => setActiveSubTab('upload')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Speak to List Item</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-clayborder shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total Earnings
            </span>
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="font-heritage text-2xl sm:text-3xl font-bold text-stone-900">
            ₹{dashboardData?.metrics?.totalArtisanEarnedInr || 810}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Direct 85% payout to your UPI/Bank
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-clayborder shadow-sm">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Orders Pending Pack
            </span>
            <Package className="w-5 h-5 text-amber-600" />
          </div>
          <div className="font-heritage text-2xl sm:text-3xl font-bold text-stone-900">
            {dashboardData?.metrics?.pendingPackagingCount || 0}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            Bio-straw insert required
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-clayborder shadow-sm">
          <div className="flex items-center justify-between text-terracotta-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Active Products
            </span>
            <Layers className="w-5 h-5 text-terracotta-600" />
          </div>
          <div className="font-heritage text-2xl sm:text-3xl font-bold text-stone-900">
            {dashboardData?.metrics?.totalProductsCount || 2}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">GI certified catalog</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-clayborder shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Breakage Prevented
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="font-heritage text-2xl sm:text-3xl font-bold text-emerald-800">
            100% Intact
          </div>
          <div className="text-[11px] text-stone-500 mt-1">SafeTransit drop-tested</div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-stone-200 space-x-4 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('upload')}
          className={`pb-3 border-b-2 transition-all flex items-center space-x-1.5 ${
            activeSubTab === 'upload'
              ? 'border-terracotta-600 text-terracotta-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Multimodal Voice Upload (AI)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('packaging')}
          className={`pb-3 border-b-2 transition-all flex items-center space-x-1.5 ${
            activeSubTab === 'packaging'
              ? 'border-terracotta-600 text-terracotta-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>SafeTransit™ Packaging Checklist</span>
        </button>

        <button
          onClick={() => setActiveSubTab('orders')}
          className={`pb-3 border-b-2 transition-all flex items-center space-x-1.5 ${
            activeSubTab === 'orders'
              ? 'border-terracotta-600 text-terracotta-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Fulfillment Queue</span>
        </button>
      </div>

      {/* Active Tab View */}
      <div>
        {activeSubTab === 'upload' && (
          <VoiceMultimodalUpload onSuccess={() => {
            fetchDashboard();
            setActiveSubTab('orders');
          }} />
        )}

        {activeSubTab === 'packaging' && <SafeTransitPackagingGuide />}

        {activeSubTab === 'orders' && (
          <div className="bg-white rounded-2xl p-6 border border-clayborder shadow-sm space-y-4">
            <h3 className="font-heritage font-bold text-lg text-stone-900">
              Recent Order Fulfillment
            </h3>
            {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
              <div className="divide-y divide-stone-100">
                {dashboardData.recentOrders.map((item: any) => (
                  <div key={item.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                    <div>
                      <div className="font-bold text-stone-900 text-sm">{item.product?.title}</div>
                      <div className="text-stone-500 mt-0.5">
                        Order #{item.order?.orderNumber} • Qty: {item.quantity} • Subtotal: ₹{item.subtotal}
                      </div>
                      <div className="text-emerald-700 font-semibold mt-1">
                        Your Realization: ₹{item.artisanUnitShare * item.quantity} (85%)
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-bold">
                        {item.packagingStatus}
                      </span>
                      <button
                        onClick={() => setActiveSubTab('packaging')}
                        className="px-3 py-1 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800"
                      >
                        View Packaging Guide
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-stone-400 text-xs">
                No pending orders. New customer orders will show here with packaging guides!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
