import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, ShieldCheck, UserRound } from 'lucide-react';
import type { ArtisanProfile, Product } from '../../types';
import { api } from '../../services/api';
import { getSampleArtisan } from '../../services/sampleCatalog';
import { productImage } from '../../services/catalog';
import { useSaved } from '../../context/SavedContext';
import { CraftImage } from './CraftImage';

type Storefront = ArtisanProfile & { avatarUrl?: string; products: Product[]; isDemo?: boolean };

export function ArtisanProfileView({ id, onBack, onProduct }: { id: string; onBack: () => void; onProduct: (product: Product) => void }) {
  const [artisan, setArtisan] = useState<Storefront>(() => getSampleArtisan(id));
  const [error, setError] = useState('');
  const { following, toggleFollow } = useSaved();
  const followed = following.includes(id);

  useEffect(() => {
    if (getSampleArtisan(id)) return;
    let current = true;
    api.getArtisan(id).then(({ artisan: profile }) => current && setArtisan(profile))
      .catch(() => current && setError('The artisan profile could not be loaded. Please try again.'));
    return () => { current = false; };
  }, [id]);

  return <article className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
    <button className="craft-outline" onClick={onBack}><ArrowLeft size={16} /> Back to browsing</button>
    {!artisan ? <p role="status">{error || 'Loading artisan profile…'}</p> : <>
      <header className="grid items-center gap-6 rounded-2xl bg-stone-900 p-6 text-white sm:grid-cols-[10rem_1fr_auto] sm:p-8">
        {artisan.avatarUrl ?
          <CraftImage src={artisan.avatarUrl} alt={artisan.artisanName} className="aspect-square w-32 rounded-xl object-cover sm:w-full" /> :
          <div className="grid aspect-square w-32 place-items-center rounded-xl bg-stone-800 text-stone-400 sm:w-full"><UserRound size={40} aria-label="Portrait unavailable" /></div>}
        <div>
          <p className="text-sm text-amber-300">{artisan.brandName}{artisan.isDemo && ' · Fictional artisan profile'}</p>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{artisan.artisanName}</h1>
          {artisan.verificationStatus === 'VERIFIED' && <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300"><ShieldCheck size={16} /> Verified artisan</span>}
          <p className="mt-2 flex items-center gap-2 text-sm text-stone-300"><MapPin size={15} />{artisan.workshopAddress || artisan.cluster?.state || 'Location unavailable'}</p>
          <p className="mt-2 text-sm text-stone-300">{[artisan.cluster?.name, artisan.experienceYears > 0 && `${artisan.experienceYears} years of experience`].filter(Boolean).join(' · ')}</p>
        </div>
        <button aria-pressed={followed} className="craft-outline justify-self-start" onClick={() => toggleFollow(id)}>{followed ? 'Following' : 'Follow artisan'}</button>
      </header>
      <section className="rounded-2xl border border-clayborder bg-white p-5 sm:p-6">
        <h2 className="mb-3 text-2xl font-bold">The artisan’s story</h2>
        <p className="whitespace-pre-line leading-relaxed text-stone-700">{artisan.storyNarrative || 'The artisan has yet to share their story.'}</p>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-bold">From the workshop</h2>
        {artisan.products.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {artisan.products.map((product) => <button key={product.id} className="heritage-card overflow-hidden rounded-xl text-left" onClick={() => onProduct(product)}>
            <CraftImage src={productImage(product)} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
            <span className="block p-3 text-sm font-semibold">{product.title}<span className="mt-1 block text-stone-600">₹{product.retailPrice}</span></span>
          </button>)}
        </div> : <p className="text-sm text-stone-600">This workshop has no active listings.</p>}
      </section>
    </>}
  </article>;
}
