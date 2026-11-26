import { useEffect, useState } from 'react';
import { ArrowRight, MapPin, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useSaved } from '../../context/SavedContext';
import { getSampleArtisan, sampleProducts } from '../../services/sampleCatalog';
import { CraftImage } from './CraftImage';

interface DirectoryEntry {
  id: string;
  brandName: string;
  artisanName: string;
  artisanLineage?: string;
  storyNarrative: string;
  cluster: string;
  state: string;
  avatarUrl?: string;
  experienceYears: number;
  verificationStatus: string;
  isDemo?: boolean;
}

const sampleArtisans: DirectoryEntry[] = [...new Set(sampleProducts.map((p) => p.artisan.id))].map((id) => {
  const sample = getSampleArtisan(id);
  return { ...sample, cluster: sample.cluster.name, state: sample.cluster.state };
});

export function ArtisansDirectoryView({ onSelectArtisan }: { onSelectArtisan: (artisanId: string) => void }) {
  const [artisans, setArtisans] = useState<DirectoryEntry[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'offline'>('loading');
  const [followingOnly, setFollowingOnly] = useState(false);
  const { following, toggleFollow } = useSaved();

  useEffect(() => {
    let current = true;
    api.getArtisans().then((result) => {
      if (!Array.isArray(result.artisans)) throw new Error('Artisans unavailable');
      if (current) {
        setArtisans(result.artisans);
        setStatus('ready');
      }
    }).catch(() => current && setStatus('offline'));
    return () => { current = false; };
  }, []);

  const visible = [...artisans, ...sampleArtisans].filter((artisan) => !followingOnly || following.includes(artisan.id));

  return <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-3xl font-bold sm:text-4xl">Meet the artisans</h1>
        <p className="mt-2 text-sm text-stone-600">Explore workshops, craft traditions and the pieces made there.</p></div>
      <button className="craft-outline" aria-pressed={followingOnly} onClick={() => setFollowingOnly(!followingOnly)}>
        {followingOnly ? 'Show all artisans' : 'Artisans I follow'}
      </button>
    </div>
    {status !== 'ready' && <p role="status" className="text-sm text-stone-600">{status === 'loading' ? 'Loading live profiles…' : 'Live profiles are unavailable. Browse the sample workshops below.'}</p>}
    {visible.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((artisan) => <article key={artisan.id} className="heritage-card flex flex-col gap-4 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <CraftImage src={artisan.avatarUrl} alt={artisan.avatarUrl ? artisan.artisanName : 'Portrait unavailable'} className="h-14 w-14 shrink-0 rounded-full object-cover" />
          <div>
            <h2 className="text-lg font-bold">{artisan.artisanName}</h2>
            <p className="text-xs text-stone-600">{artisan.artisanLineage || artisan.brandName}{artisan.isDemo && ' · Sample artisan'}</p>
            {artisan.verificationStatus === 'VERIFIED' && <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-800"><ShieldCheck size={14} /> Verified artisan</p>}
          </div>
        </div>
        <p className="flex items-center gap-1 text-sm font-semibold text-terracotta-800"><MapPin size={15} className="shrink-0" /> {artisan.cluster} · {artisan.state}</p>
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-stone-600">{artisan.storyNarrative}</p>
        <div className="flex flex-wrap gap-2">
          <button className="craft-button" onClick={() => onSelectArtisan(artisan.id)}>View workshop <ArrowRight size={15} /></button>
          <button className="craft-outline" aria-pressed={following.includes(artisan.id)} onClick={() => toggleFollow(artisan.id)}>{following.includes(artisan.id) ? 'Following' : 'Follow'}</button>
        </div>
      </article>)}
    </div> : <p className="rounded-xl border border-clayborder bg-white p-5 text-sm text-stone-600">Follow artisans to keep their workshops here.</p>}
  </section>;
}
