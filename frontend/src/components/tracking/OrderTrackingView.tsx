import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  ShieldCheck,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface Props {
  initialOrderNumber?: string;
}

export const OrderTrackingView: React.FC<Props> = ({ initialOrderNumber = 'KS-2026-884120' }) => {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  const fetchTracking = (num: string) => {
    if (!num) return;
    setLoading(true);
    setErrorMsg(null);
    setClaimStatus(null);

    api
      .trackOrder(num)
      .then((res) => {
        if (res.success && res.order) {
          setOrderData(res.order);
        } else {
          setErrorMsg('Order not found with provided tracking code.');
        }
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Tracking lookup failed.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (initialOrderNumber) {
      setOrderNumber(initialOrderNumber);
      fetchTracking(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleReportBreakage = () => {
    setClaimStatus('SafeTransit™ Free Replacement Claim Approved! A fresh replacement has been assigned to the artisan workshop at zero cost.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 animate-fade-in text-xs">
      {/* Title & Lookup */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Zero-Breakage Bio-Composite Logistics</span>
        </div>
        <h2 className="font-heritage text-3xl sm:text-4xl font-bold text-stone-900">
          SafeTransit™ Live Tracking
        </h2>
        <p className="text-stone-500 max-w-md mx-auto">
          Every piece is encased in drop-tested bio-composite straw inserts, moving through dedicated fragile corridors.
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl p-3 border border-clayborder shadow-sm flex items-center space-x-2">
        <Search className="w-4 h-4 text-stone-400 ml-3" />
        <input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Enter Order Number (e.g. KS-2026-884120)..."
          className="flex-1 py-2 text-sm text-stone-900 bg-transparent focus:outline-none font-mono"
        />
        <button
          onClick={() => fetchTracking(orderNumber)}
          className="px-5 py-2.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs transition-colors"
        >
          Track
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl text-xs text-center">
          {errorMsg}
        </div>
      )}

      {claimStatus && (
        <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 p-4 rounded-xl text-xs font-medium space-y-1">
          <div className="font-bold flex items-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
            100% Free Breakage Replacement Pool Triggered
          </div>
          <p>{claimStatus}</p>
        </div>
      )}

      {/* Tracking Card */}
      {orderData && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-clayborder shadow-lg space-y-8">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-stone-100 pb-6">
            <div>
              <span className="text-stone-400 font-mono text-[11px] block">
                ORDER REF: {orderData.orderNumber}
              </span>
              <div className="font-heritage text-2xl font-bold text-stone-900 mt-0.5">
                Status: <span className="text-terracotta-700 uppercase">{orderData.status.replace(/_/g, ' ')}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-amber-950 font-medium">
              <div className="font-bold text-xs flex items-center">
                <Truck className="w-3.5 h-3.5 mr-1 text-amber-700" />
                {orderData.carrierName}
              </div>
              <div className="text-[10px] text-amber-800 font-mono mt-0.5">
                Tracking #{orderData.trackingNumber}
              </div>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-stone-200">
            {orderData.timeline &&
              orderData.timeline.map((step: any, idx: number) => (
                <div key={idx} className="relative flex items-start space-x-4 pl-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-md shrink-0 z-10">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex-1 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-stone-900 text-xs">{step.title}</span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-stone-600 text-[11px]">{step.notes}</p>
                    <div className="text-[10px] text-amber-800 font-semibold pt-1">
                      📍 {step.location}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Bio-Straw Packaging Specifications */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-2">
            <div className="font-bold text-amber-950 flex items-center text-xs">
              <Sparkles className="w-4 h-4 text-amber-600 mr-1.5" />
              Verified SafeTransit™ Bio-Composite Packaging Specs
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Moulded chopped paddy straw insert • Natural tapioca starch adhesive • Passed 4.5ft concrete drop-test • Red fragile handling label applied.
            </p>
          </div>

          {/* Breakage Claim Trigger */}
          <div className="border-t border-stone-100 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="font-bold text-stone-900">Arrived Damaged?</div>
              <div className="text-stone-500 text-[11px]">
                Under KalaSetu Zero-Breakage Guarantee, we replace it 100% free with zero loss to the artisan.
              </div>
            </div>
            <button
              onClick={handleReportBreakage}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors shrink-0"
            >
              Request Free Replacement
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
