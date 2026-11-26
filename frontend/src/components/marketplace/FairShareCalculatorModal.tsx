import React, { useState } from 'react';
import { Product } from '../../types';
import { X, TrendingUp, CheckCircle, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

interface Props {
  product: Product | null;
  onClose: () => void;
}

export const FairShareCalculatorModal: React.FC<Props> = ({ product, onClose }) => {
  const [baseAmount, setBaseAmount] = useState<number>(
    product ? product.retailPrice : 1000
  );

  const artisanDirect = Math.round(baseAmount * 0.85);
  const packagingReserve = Math.round(baseAmount * 0.03);
  const breakagePoolReserve = Math.round(baseAmount * 0.04);
  const platformTechFee = Math.round(baseAmount * 0.08);

  const commercialMiddleman = Math.round(baseAmount * 0.72);
  const commercialArtisan = Math.round(baseAmount * 0.18);
  const additionalArtisanBenefit = artisanDirect - commercialArtisan;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-clayborder shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="bg-terracotta-600 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-heritage font-bold text-lg">
                Fair-Share Transparency Ledger
              </h3>
              <p className="text-stone-400 text-xs">
                {product ? product.title : 'Fieldwork Unit Economics Simulation (₹1,000 Base)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close earnings breakdown"
            className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {product ? <div className="space-y-4 p-6 text-sm">
          <dl className="divide-y divide-clayborder rounded-xl border border-clayborder px-4">
            <div className="flex justify-between py-3"><dt>Listed price</dt><dd>₹{product.retailPrice.toLocaleString('en-IN')}</dd></div>
            <div className="flex justify-between py-3 font-bold text-emerald-800"><dt>Artisan earnings per piece</dt><dd>₹{product.artisanBasePrice.toLocaleString('en-IN')}</dd></div>
            <div className="flex justify-between py-3"><dt>Remaining share of listed price</dt><dd>₹{(product.retailPrice - product.artisanBasePrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</dd></div>
          </dl>
          <p className="text-stone-600">Shipping is calculated at checkout.</p>
        </div> : <div className="p-6 space-y-6 overflow-y-auto text-sm">
          {/* Base Amount Control */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex items-center justify-between">
            <span className="font-semibold text-stone-700 text-xs uppercase tracking-wide">
              Simulated Retail Price:
            </span>
            <div className="flex items-center space-x-2">
              <span className="font-heritage font-bold text-xl text-stone-900">₹</span>
              <input
                type="number"
                value={baseAmount}
                onChange={(e) => setBaseAmount(Math.max(100, Number(e.target.value)))}
                className="w-28 px-3 py-1.5 rounded-lg border border-stone-300 font-bold text-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
              />
            </div>
          </div>

          {/* Side by Side Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* KalaSetu Direct Model */}
            <div className="bg-emerald-50/60 border-2 border-emerald-500/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <span className="font-bold text-emerald-950 font-heritage text-base">
                  KalaSetu Direct Model
                </span>
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  85% TO ARTISAN
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-emerald-100">
                  <span className="text-stone-600 font-medium">Artisan Direct Bank Payout:</span>
                  <span className="font-bold text-emerald-800 text-sm">₹{artisanDirect} (85%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100">
                  <span className="text-stone-600 flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600 mr-1" />
                    Zero-Breakage Mutual Reserve:
                  </span>
                  <span className="font-semibold text-stone-800">₹{breakagePoolReserve} (4%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100">
                  <span className="text-stone-600">Bio-Composite Straw Packaging:</span>
                  <span className="font-semibold text-stone-800">₹{packagingReserve} (3%)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-600">Platform Maintenance & Tech:</span>
                  <span className="font-semibold text-stone-800">₹{platformTechFee} (8%)</span>
                </div>
              </div>

              <div className="bg-emerald-100/70 p-2.5 rounded-lg text-emerald-900 text-xs font-semibold flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Effective Hourly Return: ~₹68.60/hr</span>
              </div>
            </div>

            {/* Traditional Commercial Retail Markup */}
            <div className="bg-rose-50/40 border border-rose-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                <span className="font-bold text-rose-950 font-heritage text-base">
                  Commercial Retail Model
                </span>
                <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  72% TO MIDDLEMEN
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-rose-100">
                  <span className="text-stone-600">Artisan Received:</span>
                  <span className="font-bold text-rose-700 text-sm">₹{commercialArtisan} (18%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-100">
                  <span className="text-stone-600">Urban Middleman Markup:</span>
                  <span className="font-semibold text-rose-800">₹{commercialMiddleman} (72%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-100">
                  <span className="text-stone-600">Artisan Transit Breakage Loss:</span>
                  <span className="font-semibold text-rose-800">Artisan Bears 100%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-600">Packaging Quality:</span>
                  <span className="font-semibold text-rose-800">Old newspaper / straw</span>
                </div>
              </div>

              <div className="bg-rose-100/70 p-2.5 rounded-lg text-rose-900 text-xs font-semibold flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                <span>Fieldwork Hourly Return: ₹13.10/hr</span>
              </div>
            </div>
          </div>

          {/* Net Impact Highlight */}
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-amber-800 font-semibold uppercase tracking-wider">
                Extra Family Earnings on KalaSetu
              </div>
              <div className="font-heritage text-2xl font-bold text-amber-950 mt-0.5">
                +₹{additionalArtisanBenefit} per piece (+372% increase)
              </div>
            </div>
            <div className="text-right text-xs text-stone-600">
              <span className="font-bold text-stone-900">4.7x Realization</span>
              <br />
              Direct to Artisan Family
            </div>
          </div>
        </div>}

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
};
