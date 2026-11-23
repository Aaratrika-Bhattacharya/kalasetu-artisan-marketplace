import React, { useEffect, useState } from 'react';
import { CraftCluster } from '../../types';
import { api } from '../../services/api';
import { Award, ShieldCheck, MapPin, Layers, ArrowRight } from 'lucide-react';

interface Props {
  onSelectCluster: (clusterId: string) => void;
}

export const CraftClustersView: React.FC<Props> = ({ onSelectCluster }) => {
  const [clusters, setClusters] = useState<CraftCluster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getClusters()
      .then((res) => {
        if (res.success && res.clusters) {
          setClusters(res.clusters);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold">
          <Award className="w-4 h-4 text-amber-600" />
          <span>GI Authenticity & Heritage Provenance</span>
        </div>
        <h2 className="font-heritage text-3xl sm:text-4xl font-bold text-stone-900">
          Surveyed Craft Clusters & Mineral Geographies
        </h2>
        <p className="text-stone-500 max-w-xl mx-auto text-xs sm:text-sm">
          Deep heritage traditions shaped by indigenous river silt, mineral slips, quartz frits, and generations of master potter families.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clusters.map((c) => (
            <div
              key={c.id}
              className="heritage-card rounded-2xl overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
                  <img
                    src={
                      c.heroImageUrl ||
                      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {c.isGiTagged && (
                    <div className="absolute top-3 left-3 bg-amber-600 text-white px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center shadow-md">
                      <Award className="w-3.5 h-3.5 mr-1" />
                      <span>{c.giRegNumber || 'GI CERTIFIED'}</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur-sm text-stone-200 px-2.5 py-1 rounded-md text-[11px] flex items-center">
                    <MapPin className="w-3 h-3 mr-1 text-amber-400" />
                    <span>
                      {c.district}, {c.state}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-heritage font-bold text-lg text-stone-900">
                    {c.name}
                  </h3>
                  <p className="text-stone-600 text-xs leading-relaxed line-clamp-3">
                    {c.description}
                  </p>

                  {/* Mineral Base */}
                  <div className="pt-2 border-t border-stone-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                      Mineral & Binder Composition:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {c.materialsUsed?.map((m: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-stone-100 text-stone-700 text-[10px] px-2 py-0.5 rounded font-medium"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => onSelectCluster(c.id)}
                  className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-terracotta-50 hover:text-terracotta-700 text-stone-800 text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
                >
                  <span>Explore Masterpieces ({c.productsCount || 2})</span>
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
