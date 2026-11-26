import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { craftImage } from '../../services/catalog';
import { CraftImage } from './CraftImage';

interface Props {
  onExplore: () => void;
  onOpenCommission: () => void;
  onOpenCalculator: () => void;
}

export function HeroBanner({ onExplore, onOpenCommission, onOpenCalculator }: Props) {
  const { t } = useLanguage();

  return <section className="border-b border-clayborder bg-claysand">
    <div className="mx-auto grid max-w-7xl items-center gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:gap-12 lg:px-8 lg:py-12">
      <div className="space-y-5">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">Every craft has <span className="text-terracotta-700">a story.</span></h1>
        <p className="max-w-xl text-base leading-relaxed text-stone-700 sm:text-lg">{t('hero_subtitle')}</p>
        <div className="flex flex-wrap gap-2">
          <button className="craft-button" onClick={onExplore}>Explore handicrafts <ArrowRight size={16} /></button>
          <button className="craft-outline" onClick={onOpenCommission}><Sparkles size={16} /> Commission a piece</button>
          <button className="craft-outline" onClick={onOpenCalculator}><TrendingUp size={16} /> How artisan earnings work</button>
        </div>
      </div>
      <div className="grid h-52 grid-cols-[1.2fr_1fr] gap-2 sm:h-72 lg:h-80">
        <CraftImage src={craftImage('potter-workshop')} alt="Illustrative portrait of a potter shaping clay on a wheel" className="h-full min-h-0 w-full rounded-l-2xl object-cover" />
        <div className="grid min-h-0 grid-rows-2 gap-2">
          <CraftImage src={craftImage('blue-pottery')} alt="Painted blue pottery bowl" className="h-full min-h-0 w-full rounded-tr-2xl object-cover" />
          <CraftImage src={craftImage('ikat')} alt="Indigo handwoven textile" className="h-full min-h-0 w-full rounded-br-2xl object-cover" />
        </div>
      </div>
    </div>
  </section>;
}
