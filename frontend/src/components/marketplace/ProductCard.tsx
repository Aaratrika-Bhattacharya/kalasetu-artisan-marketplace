import React from 'react';
import { useSaved } from '../../context/SavedContext';
import { availability, isAvailable, productImage } from '../../services/catalog';
import { CraftImage } from './CraftImage';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { SafeTransitBadge } from '../common/SafeTransitBadge';
import {
  ShoppingBag,
  Award,
  CheckCircle2,
  Heart,
} from 'lucide-react';

interface Props {
  product: Product;
  onOpenProduct: (product: Product) => void;
  onOpenBreakdown: (product: Product) => void;
  onOpenArtisanStory: (artisanId: string) => void;
}

export const ProductCard: React.FC<Props> = ({
  product,
  onOpenProduct,
  onOpenBreakdown,
  onOpenArtisanStory,
}) => {
  const { addItem } = useCart();
  const { tVernacular } = useLanguage();

  const title = tVernacular(product.vernacularTitles, product.title);
  const { wishlist, toggleWishlist } = useSaved();
  const saved = wishlist.includes(product.id);

  const artisanSharePct = product.retailPrice > 0 ? Math.round((product.artisanBasePrice / product.retailPrice) * 100) : 0;

  return (
    <div className="heritage-card rounded-2xl overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
          <button className="block h-full w-full" onClick={() => onOpenProduct(product)} aria-label={`View ${title}`}>
          <CraftImage
            src={productImage(product)}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          </button>
          <button type="button" aria-label={saved ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`}
            aria-pressed={saved} onClick={() => toggleWishlist(product.id)}
            className="absolute right-3 top-3 rounded-full bg-white p-2 text-terracotta-800 shadow-sm">
            <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
          </button>

          {/* GI Certification Tag */}
          {product.cluster?.isGiTagged && (
            <div className="absolute top-3 left-3 bg-amber-600/95 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide flex items-center shadow-md">
              <Award className="w-3.5 h-3.5 mr-1" />
              <span>GI CERTIFIED</span>
            </div>
          )}

          {/* Fragility Tag */}
          {product.safeTransitCertified && <div className="absolute bottom-3 right-3">
            <SafeTransitBadge variant="sm" />
          </div>}

          {/* Artisan Lineage Pill Bottom-Left */}
          {product.artisan && (
            <button
              onClick={() => onOpenArtisanStory(product.artisan!.id)}
              className="absolute bottom-3 left-3 bg-stone-900/80 hover:bg-stone-900 backdrop-blur-md text-stone-100 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center space-x-1"
            >
              <span className="truncate max-w-[160px]">{product.artisan.artisanName}</span>
              <span className="text-amber-400">•</span>
              <span className="text-stone-400">{product.cluster?.name.split(' ')[0]}</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heritage font-bold text-stone-900 text-base leading-snug line-clamp-2">
              <button className="text-left hover:text-terracotta-800" onClick={() => onOpenProduct(product)}>{title}</button>
            </h3>
          </div>

          <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed">
            {tVernacular(product.vernacularDescs, product.description)}
          </p>

          <p className="text-xs font-semibold text-terracotta-800">{availability(product)}{product.isDemo && ' · Sample listing'}</p>
          {/* Fair-Trade Earnings Banner */}
          {!product.isDemo && Number.isFinite(product.artisanBasePrice) && <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-lg p-2 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-emerald-950 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Artisan Direct:</span>
              <span className="font-bold text-emerald-800">₹{product.artisanBasePrice}</span>
              <span className="text-[10px] text-emerald-700 font-semibold">({artisanSharePct}%)</span>
            </div>
            <button
              onClick={() => onOpenBreakdown(product)}
              className="text-emerald-700 hover:text-emerald-900 text-[11px] underline font-semibold"
              title="See Rupee-by-Rupee Breakdown"
            >
              Breakdown
            </button>
          </div>}
        </div>
      </div>

      {/* Footer / Price & Add to Cart */}
      <div className="p-4 pt-0">
        <div className="border-t border-stone-100 pt-3 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-bold text-stone-900 font-heritage">
                ₹{product.retailPrice}
              </span>
              {product.marketBenchmarkPrice && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{product.marketBenchmarkPrice}
                </span>
              )}
            </div>
            <span className="text-[10px] text-stone-500 block">Taxes included</span>
          </div>

          <button
            disabled={!isAvailable(product)}
            onClick={() => addItem(product)}
            className="disabled:opacity-50 px-3.5 py-2 rounded-xl bg-terracotta-600 text-white text-xs font-semibold hover:bg-terracotta-700 transition-colors shadow-sm flex items-center space-x-1.5 active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{product.isDemo ? 'Try cart' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
