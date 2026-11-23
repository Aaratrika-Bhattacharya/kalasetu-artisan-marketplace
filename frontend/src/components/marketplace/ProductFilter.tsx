import React from 'react';
import { Search, Sparkles, Filter, Award } from 'lucide-react';

interface Props {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  giOnly: boolean;
  setGiOnly: (gi: boolean) => void;
  selectedFragility: string;
  setSelectedFragility: (f: string) => void;
}

const CATEGORIES = [
  { id: '', label: 'All Crafts' },
  { id: 'Sculpture', label: 'Sculptures & Figurines' },
  { id: 'Serveware', label: 'Pottery & Serveware' },
  { id: 'Wall Decor', label: 'Wall Decor & Lippan' },
  { id: 'Home Decor', label: 'Home Accents' },
];

export const ProductFilter: React.FC<Props> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  giOnly,
  setGiOnly,
  selectedFragility,
  setSelectedFragility,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-clayborder shadow-sm space-y-4 mb-8">
      {/* Top Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="AI Search: Try 'Bankura horse', 'slow cooking handi', 'blue pottery dinner plate', or 'Kutch mirror'..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:bg-white transition-all text-stone-900 placeholder:text-stone-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-stone-100">
        {/* Categories Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white font-semibold shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Action Toggles */}
        <div className="flex items-center space-x-2">
          {/* GI Tagged Only Toggle */}
          <button
            onClick={() => setGiOnly(!giOnly)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              giOnly
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-amber-50/80 text-amber-900 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>GI Certified Only</span>
          </button>

          {/* Fragility Class Filter */}
          <select
            value={selectedFragility}
            onChange={(e) => setSelectedFragility(e.target.value)}
            className="text-xs bg-stone-100 border border-stone-200 text-stone-700 rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-terracotta-500 font-medium"
          >
            <option value="">All Fragility Classes</option>
            <option value="EXTREME">Extreme (Terracotta / Hollow)</option>
            <option value="HIGH">High (Ceramic / Pottery)</option>
            <option value="MEDIUM">Medium (Lippan / MDF)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
