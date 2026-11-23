import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface Props {
  variant?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const SafeTransitBadge: React.FC<Props> = ({ variant = 'md', showDetails = false }) => {
  if (variant === 'sm') {
    return (
      <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
        <span>SafeTransit™ Bio-Straw</span>
      </span>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-lg p-2.5 flex items-start space-x-2.5">
      <div className="bg-amber-600 text-white p-1.5 rounded-md mt-0.5 shadow-sm">
        <ShieldCheck className="w-4 h-4" />
      </div>
      <div className="text-xs">
        <div className="font-semibold text-amber-950 flex items-center">
          SafeTransit™ Zero-Breakage Guarantee
          <Sparkles className="w-3 h-3 text-amber-600 ml-1.5" />
        </div>
        <div className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
          {showDetails
            ? 'Cushioned in shock-rated moulded paddy straw inserts. If transit damage occurs, our mutual reserve dispatches an instant replacement at zero cost to you and the artisan.'
            : 'Passes 4.5ft drop test with natural biodegradable straw cushioning. 100% free replacement guarantee.'}
        </div>
      </div>
    </div>
  );
};
