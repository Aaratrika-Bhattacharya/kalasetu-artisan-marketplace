import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles, ShieldCheck, TrendingUp, Award, ArrowRight } from 'lucide-react';

interface Props {
  onExplore: () => void;
  onOpenCommission: () => void;
  onOpenCalculator: () => void;
}

export const HeroBanner: React.FC<Props> = ({ onExplore, onOpenCommission, onOpenCalculator }) => {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#F5ECE4] via-claycream to-claycream border-b border-clayborder pt-12 pb-16">
      {/* Background Decorative Mandala Rings */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full border-8 border-terracotta-200/40 pointer-events-none" />
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-72 h-72 rounded-full border-4 border-dashed border-amber-300/40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-amber-100/80 border border-amber-300/70 text-amber-950 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Direct-to-Connoisseur Fair Trade Initiative</span>
            </div>

            <h1 className="font-heritage text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-[1.15] tracking-tight">
              Direct from Bharat’s{' '}
              <span className="text-terracotta-600 underline decoration-amber-400 decoration-wavy decoration-2">
                Master Kilns
              </span>{' '}
              to Your Home.
            </h1>

            <p className="text-stone-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {t('hero_subtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3.5 justify-center lg:justify-start pt-2">
              <button
                onClick={onExplore}
                className="px-6 py-3.5 rounded-xl bg-terracotta-600 text-white font-semibold text-sm hover:bg-terracotta-700 transition-all shadow-md terracotta-glow flex items-center space-x-2"
              >
                <span>Explore Masterpieces</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenCommission}
                className="px-5 py-3.5 rounded-xl bg-white border border-stone-300 text-stone-800 font-semibold text-sm hover:bg-stone-50 hover:border-stone-400 transition-all shadow-sm flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Commission Bespoke Sculpture</span>
              </button>

              <button
                onClick={onOpenCalculator}
                className="px-4 py-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-medium text-xs hover:bg-amber-100 transition-all flex items-center space-x-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
                <span>Fair-Share Transparency Ledger</span>
              </button>
            </div>
          </div>

          {/* Right Metrics & Hero Card Column */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-clayborder space-y-6 relative">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h3 className="font-heritage font-bold text-lg text-stone-900">
                    Fieldwork Impact Benchmark
                  </h3>
                  <p className="text-stone-500 text-xs">
                    Empirical data from 7 surveyed artisan clusters
                  </p>
                </div>
                <div className="bg-terracotta-50 text-terracotta-700 p-2 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
              </div>

              {/* Stat Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                  <div className="text-2xl font-extrabold text-terracotta-600 font-heritage">
                    85%
                  </div>
                  <div className="text-[11px] font-semibold text-stone-800 mt-0.5">
                    Artisan Realization
                  </div>
                  <div className="text-[10px] text-stone-500">vs 18% in traditional retail</div>
                </div>

                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                  <div className="text-2xl font-extrabold text-amber-600 font-heritage">
                    &lt; 3%
                  </div>
                  <div className="text-[11px] font-semibold text-stone-800 mt-0.5">
                    Transit Breakage
                  </div>
                  <div className="text-[10px] text-stone-500">Reduced from 27.5% baseline</div>
                </div>

                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                  <div className="text-2xl font-extrabold text-stone-900 font-heritage">
                    +423%
                  </div>
                  <div className="text-[11px] font-semibold text-stone-800 mt-0.5">
                    Hourly Wage Gain
                  </div>
                  <div className="text-[10px] text-stone-500">₹13.10/hr → ₹68.60/hr</div>
                </div>

                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                  <div className="text-2xl font-extrabold text-emerald-700 font-heritage">
                    100%
                  </div>
                  <div className="text-[11px] font-semibold text-stone-800 mt-0.5">
                    Free Replacement
                  </div>
                  <div className="text-[10px] text-stone-500">Zero cost to artisan pool</div>
                </div>
              </div>

              {/* SafeTransit Guarantee Banner */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-center space-x-3 text-xs text-amber-950">
                <ShieldCheck className="w-8 h-8 text-amber-600 shrink-0" />
                <div>
                  <div className="font-bold">SafeTransit™ Bio-Straw Guarantee</div>
                  <div className="text-[11px] text-amber-800">
                    Natural paddy straw shock-inserts replace thermocol, protecting fragile Terracotta & GI Blue Pottery.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
