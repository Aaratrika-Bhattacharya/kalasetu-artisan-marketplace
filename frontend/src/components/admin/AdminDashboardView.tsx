import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  SlidersHorizontal,
  TrendingUp,
  ShieldCheck,
  Users,
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wallet,
  ArrowUpRight,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [pendingQueue, setPendingQueue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.getAdminOverview(), api.getPendingQueue()])
      .then(([overviewRes, queueRes]) => {
        if (overviewRes.success) setAnalytics(overviewRes.analytics);
        if (queueRes.success) setPendingQueue(queueRes);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveArtisan = async (id: string, status: string) => {
    try {
      await api.updateArtisanStatus(id, status);
      setActionMsg(`Artisan KYC marked ${status}`);
      fetchData();
    } catch (err: any) {
      setActionMsg(`Failed: ${err.message}`);
    }
  };

  const handleDisbursePayout = async (artisanId: string, amount: number) => {
    try {
      await api.disbursePayout({ artisanId, amount, payoutMethod: 'UPI' });
      setActionMsg(`Payout of ₹${amount} successfully transferred to artisan.`);
      fetchData();
    } catch (err: any) {
      setActionMsg(`Payout failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <SlidersHorizontal className="w-4 h-4" />
            <span>KalaSetu Governance & Multi-Vendor Control</span>
          </div>
          <h2 className="font-heritage text-2xl sm:text-3xl font-bold">
            Administrative Console
          </h2>
          <p className="text-stone-400 text-xs mt-1">
            Artisan verification, GI authenticity audit, commission escrow, and zero-breakage monitoring.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors"
        >
          Refresh Live Metrics
        </button>
      </div>

      {actionMsg && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-xl text-xs flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-clayborder shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Total GMV Realized
          </span>
          <div className="font-heritage text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            ₹{analytics?.totalGmvInr || 3790}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>Fair-trade direct flow</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-clayborder shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Artisan Disbursements
          </span>
          <div className="font-heritage text-2xl sm:text-3xl font-bold text-emerald-700 mt-1">
            ₹{analytics?.totalArtisanPayoutsInr || 3220}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">85% direct realization</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-clayborder shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Transit Breakage Rate
          </span>
          <div className="font-heritage text-2xl sm:text-3xl font-bold text-amber-700 mt-1">
            {analytics?.transitBreakageRatePct || '0.00'}%
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Baseline: 27.5% (-{analytics?.breakageReductionDeltaPct || 27.5}%)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-clayborder shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Mutual Reserve Pool
          </span>
          <div className="font-heritage text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            ₹{analytics?.totalBreakagePoolFundInr || 152}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Zero-deductible replacement</div>
        </div>
      </div>

      {/* Artisan KYC & Verification Queue */}
      <div className="bg-white rounded-2xl p-6 border border-clayborder shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-terracotta-600" />
            <h3 className="font-heritage font-bold text-lg text-stone-900">
              Artisan Lineage Verification Queue
            </h3>
          </div>
          <span className="text-xs text-stone-500">
            Pending: {pendingQueue?.pendingArtisans?.length || 0}
          </span>
        </div>

        {pendingQueue?.pendingArtisans && pendingQueue.pendingArtisans.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {pendingQueue.pendingArtisans.map((art: any) => (
              <div key={art.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                <div>
                  <div className="font-bold text-stone-900 text-sm">{art.brandName}</div>
                  <div className="text-stone-500 mt-0.5">
                    Artisan: {art.user?.fullName} • Phone: {art.user?.phoneNumber}
                  </div>
                  <div className="text-amber-800 font-medium mt-1">
                    Cluster: {art.cluster?.name} ({art.cluster?.state})
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleApproveArtisan(art.id, 'VERIFIED')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center space-x-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve KYC</span>
                  </button>
                  <button
                    onClick={() => handleApproveArtisan(art.id, 'REJECTED')}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold flex items-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-stone-400">
            All registered artisan lineages are fully verified and active.
          </div>
        )}
      </div>

      {/* Payout & Settlement Simulator */}
      <div className="bg-white rounded-2xl p-6 border border-clayborder shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-stone-100 pb-3">
          <Wallet className="w-5 h-5 text-emerald-600" />
          <h3 className="font-heritage font-bold text-lg text-stone-900">
            Direct Artisan Realization Settlement
          </h3>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          KalaSetu dispatches 85% directly to artisan UPI / Bank accounts. Batch execution ensures zero middleman withholding.
        </p>
        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
          <div>
            <span className="font-bold text-stone-900 block">Bishnupur Pal Lineage (Dipankar Kundu)</span>
            <span className="text-stone-500">UPI: dipankar.pal@upi • Pending Settlement: ₹1,620</span>
          </div>
          <button
            onClick={() => handleDisbursePayout('dipankar-kundu-sample', 1620)}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold"
          >
            Disburse Instant NEFT / UPI
          </button>
        </div>
      </div>
    </div>
  );
};
