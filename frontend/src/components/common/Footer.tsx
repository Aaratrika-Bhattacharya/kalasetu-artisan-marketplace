import React from 'react';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800 text-xs mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          {/* Col 1: Mission */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏺</span>
              <span className="font-heritage text-xl font-bold text-white tracking-wide">
                KalaSetu (कला सेतु)
              </span>
            </div>
            <p className="text-stone-400 leading-relaxed text-xs">
              Direct-to-connoisseur fair-trade e-commerce platform dedicated to traditional Indian clay, terracotta, and ceramic lineages. Eliminating middlemen markups and restoring dignified artisan livelihoods.
            </p>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>SafeTransit™ Certified Packaging</span>
            </div>
          </div>

          {/* Col 2: The 6 Fieldwork Clusters */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm font-heritage uppercase tracking-wider">
              Surveyed Lineages
            </h4>
            <ul className="space-y-2.5 text-stone-400">
              <li className="hover:text-amber-300 transition-colors cursor-pointer">
                • Bishnupur Terracotta (Bankura, WB)
              </li>
              <li className="hover:text-amber-300 transition-colors cursor-pointer">
                • Jaipur GI Blue Pottery (Jaipur, RJ)
              </li>
              <li className="hover:text-amber-300 transition-colors cursor-pointer">
                • Kutch Lippan Mud & Mirror Art (Kutch, GJ)
              </li>
              <li className="hover:text-amber-300 transition-colors cursor-pointer">
                • Nizamabad GI Black Earthenware (Azamgarh, UP)
              </li>
              <li className="hover:text-amber-300 transition-colors cursor-pointer">
                • Krishnanagar Clay Miniatures (Nadia, WB)
              </li>
              <li className="hover:text-amber-300 transition-colors cursor-pointer">
                • Kumartuli Monumental Sculptures (Kolkata, WB)
              </li>
            </ul>
          </div>

          {/* Col 3: SafeTransit Engineering */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm font-heritage uppercase tracking-wider">
              SafeTransit™ Packaging
            </h4>
            <p className="text-stone-400 leading-relaxed mb-3">
              Addressing the 27.5% terracotta transit breakage bottleneck using drop-tested bio-composite chopped straw inserts and 100% free damage replacement.
            </p>
            <div className="bg-stone-800/80 p-3 rounded-lg border border-stone-700/60 text-[11px] text-stone-300">
              <div className="text-amber-400 font-semibold mb-1 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Zero Plastic Thermocol
              </div>
              All packaging is 100% biodegradable natural straw and unbleached tapioca starch binder.
            </div>
          </div>

          {/* Col 4: Vernacular AI & Multilingual Access */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm font-heritage uppercase tracking-wider">
              Vernacular Inclusion
            </h4>
            <p className="text-stone-400 leading-relaxed mb-3">
              Designed for craft elders with limited digital literacy. Multi-dialect hold-to-speak product cataloging in Bengali, Hindi, Gujarati, and English powered by Google Gemini AI.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="bg-stone-800 text-stone-300 px-2.5 py-1 rounded text-[11px] border border-stone-700">
                বাংলা
              </span>
              <span className="bg-stone-800 text-stone-300 px-2.5 py-1 rounded text-[11px] border border-stone-700">
                हिन्दी
              </span>
              <span className="bg-stone-800 text-stone-300 px-2.5 py-1 rounded text-[11px] border border-stone-700">
                ગુજરાતી
              </span>
              <span className="bg-stone-800 text-stone-300 px-2.5 py-1 rounded text-[11px] border border-stone-700">
                English
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-stone-500 text-xs">
          <p>© 2026 KalaSetu (कला सेतु). Built for Bharat’s Heritage Artisans with Fair Realization.</p>
          <div className="flex items-center space-x-1 mt-4 sm:mt-0">
            <span>Preserving Indian Heritage Craft with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 inline fill-red-500 mx-1" />
            <span>and Fair Trade</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
