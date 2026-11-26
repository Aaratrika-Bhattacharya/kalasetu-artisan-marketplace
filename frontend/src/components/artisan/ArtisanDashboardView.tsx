import { useEffect, useState, type FormEvent } from 'react';
import { Film, Layers, Mic, Package, ShieldCheck, ShoppingBag, TrendingUp, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { VoiceMultimodalUpload } from './VoiceMultimodalUpload';
import { SafeTransitPackagingGuide } from './SafeTransitPackagingGuide';
import { AIVideoStudio } from './AIVideoStudio';
import { ListingEditor, type SellerListing } from './ListingEditor';

const tabs = [
  ['listings', 'Listings', Layers], ['orders', 'Orders & capacity', Package], ['voice', 'Voice listing', Mic],
  ['packaging', 'Packaging guide', ShieldCheck], ['video', 'AI video studio', Film],
] as const;
type DashboardTab = typeof tabs[number][0];

interface LineItem {
  id: string;
  quantity: number;
  subtotal: number;
  artisanUnitShare: number;
  packagingStatus: string;
  product: { title: string };
  order: { orderNumber: string; status: string };
}

interface Dashboard {
  profile: { cluster: string; weeklyCapacity: number | null };
  metrics: { totalArtisanEarnedInr: number; grossSalesInr: number; totalOrdersCount: number; totalProductsCount: number };
  products: SellerListing[];
  recentOrders: LineItem[];
  fulfillmentQueue: LineItem[];
}

interface Props {
  onOpenAuth: () => void;
  onCatalogChange: () => void;
}

export function ArtisanDashboardView({ onOpenAuth, onCatalogChange }: Props) {
  const { user, isArtisan } = useAuth();
  const [tab, setTab] = useState<DashboardTab>('listings');
  const [data, setData] = useState<Dashboard>(null);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');
  const refresh = () => setRevision((previous) => previous + 1);

  useEffect(() => {
    setData(null);
    setError('');
  }, [user?.id]);

  useEffect(() => {
    if (!isArtisan) return;
    let current = true;
    setError('');
    api.getMyArtisanDashboard().then((result) => current && setData(result))
      .catch((err) => current && setError(err.message));
    return () => { current = false; };
  }, [user?.id, isArtisan, revision]);

  function listingSaved() {
    refresh();
    onCatalogChange();
  }

  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-stone-900 p-6 text-white sm:p-8">
      <div>
        <h1 className="text-3xl font-bold">Artisan studio</h1>
        <p className="mt-2 text-sm text-stone-300">{isArtisan ? [user?.fullName, data?.profile.cluster].filter(Boolean).join(' · ') : 'Preview the AI video studio and sign in as an artisan to manage your shop.'}</p>
      </div>
      {!isArtisan && <button className="craft-outline" onClick={onOpenAuth}>Sign in as an artisan</button>}
    </header>
    {!isArtisan ? <AIVideoStudio /> : <>
      {data && <section aria-label="Sales overview" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {([
          ['Gross product sales', `₹${data.metrics.grossSalesInr.toLocaleString('en-IN')}`, TrendingUp],
          ['Artisan earnings on paid orders', `₹${data.metrics.totalArtisanEarnedInr.toLocaleString('en-IN')}`, Wallet],
          ['Orders', data.metrics.totalOrdersCount, ShoppingBag],
          ['Listings', data.metrics.totalProductsCount, Layers],
        ] as const).map(([label, value, Icon]) => <div className="space-y-2 rounded-xl border border-clayborder bg-white p-4" key={label}>
          <Icon aria-hidden size={18} className="text-terracotta-700" />
          <p className="text-xs font-semibold text-stone-600">{label}</p>
          <strong className="font-heritage text-2xl">{value}</strong>
        </div>)}
      </section>}
      <nav className="flex gap-2 overflow-x-auto pb-2" aria-label="Artisan tools">
        {tabs.map(([id, label, Icon]) => <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)}
          className={`craft-outline shrink-0 ${tab === id ? 'border-terracotta-600 text-terracotta-800' : ''}`}><Icon size={16} />{label}</button>)}
      </nav>
      {error && <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-950">{error} <button onClick={refresh} className="font-bold underline">Retry</button></p>}
      {!data && !error && <p role="status" className="text-sm text-stone-600">Loading shop data…</p>}
      {tab === 'listings' && data && <ListingEditor listings={data.products} onSaved={listingSaved} />}
      {tab === 'orders' && data && <OrderWorkspace data={data} onChange={refresh} onGuide={() => setTab('packaging')} />}
      {tab === 'voice' && <VoiceMultimodalUpload onSuccess={() => { listingSaved(); setTab('listings'); }} />}
      {tab === 'packaging' && <SafeTransitPackagingGuide />}
      {tab === 'video' && <AIVideoStudio />}
    </>}
  </div>;
}

function OrderWorkspace({ data, onChange, onGuide }: { data: Dashboard; onChange: () => void; onGuide: () => void }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [recent, setRecent] = useState(false);
  const rows = recent ? data.recentOrders : data.fulfillmentQueue;
  const queuedUnits = data.fulfillmentQueue.filter((item) => item.packagingStatus !== 'INSPECTED')
    .reduce((sum, item) => sum + item.quantity, 0);

  async function runUpdate(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setMessage('');
    setError('');
    try {
      await action();
      setMessage(success);
      onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function updateCapacity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const weeklyCapacity = Number(new FormData(event.currentTarget).get('weeklyCapacity'));
    runUpdate(() => api.updateArtisanProfile({ weeklyCapacity }), 'Weekly capacity saved.');
  }

  return <div className="space-y-4">
    <section className="space-y-3 rounded-2xl border border-clayborder bg-white p-5 sm:p-6">
      <h2 className="text-xl font-bold">Production capacity</h2>
      <p className="text-sm text-stone-600">{queuedUnits} paid {queuedUnits === 1 ? 'piece awaits' : 'pieces await'} packing or inspection.</p>
      <form className="flex flex-wrap items-end gap-3" onSubmit={updateCapacity}>
        <label className="grid gap-1 text-sm font-semibold">Planned pieces per week
          <input className="craft-input" name="weeklyCapacity" type="number" min="0" max="100000" step="1" required defaultValue={data.profile.weeklyCapacity ?? ''} />
        </label>
        <button className="craft-button" disabled={busy}>Save capacity</button>
      </form>
    </section>
    <section className="space-y-3 rounded-2xl border border-clayborder bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">{recent ? 'Recent orders' : 'Fulfillment queue'}</h2>
        <div className="flex flex-wrap gap-2">
          <button className="craft-outline" onClick={() => setRecent(!recent)}>{recent ? 'View fulfillment queue' : 'View recent orders'}</button>
          <button className="craft-outline" onClick={onGuide}>Packaging guide</button>
        </div>
      </div>
      {rows.length ? <ul className="divide-y divide-stone-100">{rows.map((item) => {
        const next = item.packagingStatus === 'PENDING' ? 'PACKED_IN_BIO_STRAW' : 'INSPECTED';
        return <li className="flex flex-wrap items-center justify-between gap-3 py-3" key={item.id}>
          <div>
            <p className="font-semibold">{item.product.title}</p>
            <p className="text-sm text-stone-600">{item.order.orderNumber} · {item.quantity} pcs · ₹{item.artisanUnitShare * item.quantity} artisan share</p>
            <p className="text-xs capitalize text-stone-600">{item.order.status.toLowerCase().replace(/_/g, ' ')} · {item.packagingStatus.toLowerCase().replace(/_/g, ' ')}</p>
          </div>
          {!recent && item.packagingStatus !== 'INSPECTED' && <button className="craft-button" disabled={busy}
            onClick={() => runUpdate(() => api.updatePackaging(item.id, next), 'Packing status saved.')}>
            {next === 'INSPECTED' ? 'Mark inspected' : 'Mark packed'}
          </button>}
        </li>;
      })}</ul> : <p className="text-sm text-stone-600">{recent ? 'There are no recent orders.' : 'There are no paid orders in the fulfillment queue.'}</p>}
    </section>
    {message && <p role="status" className="text-sm font-semibold text-emerald-800">{message}</p>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </div>;
}
