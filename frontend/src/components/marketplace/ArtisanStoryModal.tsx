import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { X, Award, MapPin, Users, Clock, ShieldCheck } from 'lucide-react';

interface Props {
  artisanId: string | null;
  onClose: () => void;
  onSelectProduct?: (product: any) => void;
}

export const ArtisanStoryModal: React.FC<Props> = ({ artisanId, onClose, onSelectProduct }) => {
  const [artisan, setArtisan] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!artisanId) return;
    setLoading(true);
    api
      .getArtisan(artisanId)
      .then((res) => {
        if (res.success && res.artisan) {
          setArtisan(res.artisan);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [artisanId]);

  if (!artisanId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-clayborder shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-stone-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-stone-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {loading ? (
            <div className="h-20 animate-pulse bg-stone-800 rounded-lg" />
          ) : artisan ? (
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 shadow-md shrink-0">
                <img
                  src={
                    artisan.avatarUrl ||
                    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={artisan.artisanName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-heritage font-bold text-xl text-white">
                    {artisan.artisanName}
                  </h3>
                  {artisan.cluster?.isGiTagged && (
                    <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      GI VERIFIED
                    </span>
                  )}
                </div>
                <p className="text-amber-400 text-xs font-semibold mt-0.5">
                  {artisan.artisanLineage || artisan.brandName}
                </p>
                <p className="text-stone-400 text-xs flex items-center mt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-stone-500" />
                  {artisan.workshopAddress}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm text-stone-700">
          {loading ? (
            <div className="space-y-4">
              <div className="h-4 bg-stone-100 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-stone-100 rounded w-full animate-pulse" />
              <div className="h-4 bg-stone-100 rounded w-2/3 animate-pulse" />
            </div>
          ) : artisan ? (
            <>
              {/* Lineage & Craft Narrative */}
              <div>
                <h4 className="font-heritage font-bold text-base text-stone-900 mb-2">
                  Heritage Lineage & Craft Story
                </h4>
                <p className="text-xs leading-relaxed text-stone-600 whitespace-pre-line">
                  {artisan.storyNarrative}
                </p>
              </div>

              {/* Cluster & Material Composition */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  <span className="text-stone-500 font-medium block">Craft Tradition:</span>
                  <span className="font-semibold text-stone-900 mt-0.5 block">
                    {artisan.cluster?.name}
                  </span>
                  {artisan.cluster?.giRegNumber && (
                    <span className="text-[10px] text-amber-700 font-mono mt-1 block">
                      {artisan.cluster.giRegNumber}
                    </span>
                  )}
                </div>

                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  <span className="text-stone-500 font-medium block">Natural Materials:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {artisan.cluster?.materials?.map((m: string, i: number) => (
                      <span
                        key={i}
                        className="bg-stone-200/70 text-stone-800 text-[10px] px-1.5 py-0.5 rounded"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Master Products */}
              {artisan.products && artisan.products.length > 0 && (
                <div>
                  <h4 className="font-heritage font-bold text-base text-stone-900 mb-3">
                    Available Masterpieces
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {artisan.products.map((p: any) => (
                      <div
                        key={p.id}
                        className="border border-stone-200 rounded-xl p-3 flex space-x-3 items-center hover:border-terracotta-500 cursor-pointer transition-colors"
                        onClick={() => {
                          if (onSelectProduct) onSelectProduct(p);
                          onClose();
                        }}
                      >
                        <img
                          src={
                            p.images?.[0]?.imageUrl ||
                            'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=200&q=80'
                          }
                          alt={p.title}
                          className="w-14 h-14 object-cover rounded-lg shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-heritage font-bold text-xs text-stone-900 truncate">
                            {p.title}
                          </h5>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="font-bold text-sm text-stone-900">
                              ₹{p.retailPrice}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-semibold">
                              (₹{p.artisanBasePrice} to artisan)
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-1.5 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>KYC Verified Master Artisan</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
