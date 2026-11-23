import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { MapPin, Users, Award, ShieldCheck, ArrowRight, TrendingUp } from 'lucide-react';

interface Props {
  onSelectArtisan: (artisanId: string) => void;
}

export const ArtisansDirectoryView: React.FC<Props> = ({ onSelectArtisan }) => {
  const [artisans, setArtisans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getArtisans()
      .then((res) => {
        if (res.success && res.artisans) {
          setArtisans(res.artisans);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold">
          <Users className="w-4 h-4 text-amber-600" />
          <span>Generational Master Potters & Sculptors</span>
        </div>
        <h2 className="font-heritage text-3xl sm:text-4xl font-bold text-stone-900">
          The Master Lineages
        </h2>
        <p className="text-stone-500 max-w-xl mx-auto text-xs sm:text-sm">
          Connect directly with Bharat’s traditional craftspeople, eliminating exploitative middlemen markups.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artisans.map((a) => (
            <div
              key={a.id}
              className="heritage-card rounded-2xl p-6 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 shrink-0">
                    <img
                      src={
                        a.avatarUrl ||
                        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={a.artisanName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-heritage font-bold text-base text-stone-900 group-hover:text-terracotta-700 transition-colors">
                      {a.artisanName}
                    </h3>
                    <p className="text-stone-500 text-xs">{a.artisanLineage || a.brandName}</p>
                    <span className="text-[11px] text-amber-800 font-semibold flex items-center mt-0.5">
                      <MapPin className="w-3 h-3 mr-0.5" />
                      {a.cluster} ({a.state})
                    </span>
                  </div>
                </div>

                <p className="text-stone-600 text-xs leading-relaxed line-clamp-3">
                  {a.storyNarrative}
                </p>

                {/* Realization Tag */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-500 text-[10px] block">Fieldwork Realization:</span>
                    <span className="font-bold text-stone-900">₹{a.hourlyEarningBase}/hr baseline</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-700 font-bold block">On KalaSetu</span>
                    <span className="font-extrabold text-emerald-800 text-sm">85% Direct</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 mt-4">
                <button
                  onClick={() => onSelectArtisan(a.id)}
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-terracotta-600 text-white text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
                >
                  <span>View Storefront & Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
