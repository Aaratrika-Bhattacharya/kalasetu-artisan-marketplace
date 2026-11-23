import React, { useState } from 'react';
import { ShieldCheck, CheckSquare, Square, AlertCircle, Award } from 'lucide-react';

export const SafeTransitPackagingGuide: React.FC = () => {
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const steps = [
    {
      title: 'Step 1: Bio-Composite Straw Insert Base Insertion',
      detail: 'Position the moulded chopped paddy straw lower cavity inside the 5-ply corrugated carton box. Ensure it sits flush with the base.',
    },
    {
      title: 'Step 2: Butter Paper Abrasion Wrap',
      detail: 'Wrap the terracotta / pottery piece in unbleached breathable butter paper to prevent friction markings on the natural clay slip.',
    },
    {
      title: 'Step 3: Snug Cavity Locking (Zero Lateral Play)',
      detail: 'Gently lower the piece into the contoured bio-straw cavity. Test with light finger pressure to ensure zero movement.',
    },
    {
      title: 'Step 4: Interlocking Bio-Straw Lid Placement',
      detail: 'Fit the upper interlocking straw lid over the top contour. The natural starch binder absorbs 98% of shock vibrations.',
    },
    {
      title: 'Step 5: Tamper-Evident SafeTransit™ Seal & Red Fragile Label',
      detail: 'Tape carton with reinforced paper tape. Affix the prominent bilingual "FRAGILE - HERITAGE CLAY" label.',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-clayborder shadow-sm space-y-6">
      <div className="flex items-start justify-between border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-700">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h3 className="font-heritage font-bold text-xl text-stone-900">
              SafeTransit™ Bio-Composite Packaging Protocol
            </h3>
          </div>
          <p className="text-stone-500 text-xs mt-1">
            Moulded paddy straw packaging reduces terracotta breakage from 27.5% to under 3%.
          </p>
        </div>

        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center">
          <Award className="w-4 h-4 mr-1 text-emerald-600" />
          <span>4.5 FT DROP-TEST RATED</span>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        {steps.map((s, idx) => {
          const isDone = checkedSteps.includes(idx);
          return (
            <div
              key={idx}
              onClick={() => toggleStep(idx)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                isDone
                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                  : 'bg-stone-50 border-stone-200 text-stone-800 hover:border-stone-300'
              }`}
            >
              <button type="button" className="mt-0.5 text-stone-400 hover:text-stone-600 shrink-0">
                {isDone ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Square className="w-5 h-5 text-stone-400" />
                )}
              </button>
              <div className="text-xs">
                <div className={`font-bold ${isDone ? 'line-through text-emerald-800' : 'text-stone-900'}`}>
                  {s.title}
                </div>
                <div className="text-stone-600 text-[11px] mt-0.5 leading-relaxed">
                  {s.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zero Plastic Callout */}
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          <strong>Eco-Guarantee:</strong> Never use plastic thermocol or synthetic foam. All SafeTransit packaging boxes are fully compostable within 45 days.
        </span>
      </div>
    </div>
  );
};
