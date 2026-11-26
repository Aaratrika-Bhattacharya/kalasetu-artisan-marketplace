import { useState, type FormEvent } from 'react';
import { Plus, Upload } from 'lucide-react';
import type { CraftDetails, ProductImage } from '../../types';
import { api } from '../../services/api';
import { categories, collections } from '../../services/catalog';
import { CraftImage } from '../marketplace/CraftImage';

export interface SellerListing {
  id: string;
  title: string;
  category: string;
  description: string;
  retailPrice: number;
  artisanBasePrice: number;
  stockQuantity: number;
  leadTimeDays: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightGrams: number;
  isMadeToOrder: boolean;
  status: string;
  images: ProductImage[];
  craftDetails?: CraftDetails;
}

const storyFields = [
  ['makingProcess', 'Making process'], ['story', 'Story behind the product'],
  ['heritage', 'History and cultural significance'], ['careInstructions', 'Care instructions'],
] as const;
const numberFields = [
  ['retailPrice', 'Retail price (₹)', 0.01, 'any'], ['artisanBasePrice', 'Artisan earnings per piece (₹)', 0, 'any'],
  ['stockQuantity', 'Stock quantity', 0, 1], ['leadTimeDays', 'Preparation time (days)', 0, 1],
  ['lengthCm', 'Length (cm)', 0.01, 'any'], ['widthCm', 'Width (cm)', 0.01, 'any'],
  ['heightCm', 'Height (cm)', 0.01, 'any'], ['weightGrams', 'Weight (g)', 0.01, 'any'],
] as const;

export function ListingEditor({ listings, onSaved }: { listings: SellerListing[]; onSaved: () => void }) {
  const [editing, setEditing] = useState<SellerListing | 'new' | null>(null);
  const [message, setMessage] = useState('');
  return <div className="space-y-4 rounded-2xl border border-clayborder bg-white p-4 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-2xl font-bold">Your listings</h2>
      {!editing && <button className="craft-button" onClick={() => { setEditing('new'); setMessage(''); }}><Plus size={17} /> Add product</button>}
    </div>
    {editing ? <ListingForm listing={editing === 'new' ? undefined : editing} onCancel={() => setEditing(null)}
      onSaved={() => { setEditing(null); setMessage('Listing saved.'); onSaved(); }} /> : <>
      {message && <p role="status" className="text-sm font-semibold text-emerald-800">{message}</p>}
      {listings.length ? <ul className="divide-y divide-stone-100">
        {listings.map((listing) => <li key={listing.id} className="flex flex-wrap items-center gap-3 py-3">
          <CraftImage src={listing.images[0]?.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
          <span className="min-w-0 flex-1 text-sm font-semibold">{listing.title}<small className="block font-normal text-stone-500">₹{listing.retailPrice} · {listing.stockQuantity} in stock · {listing.status.toLowerCase().replace(/_/g, ' ')}</small></span>
          <button className="craft-outline" onClick={() => setEditing(listing)}>Edit <span className="sr-only">{listing.title}</span></button>
        </li>)}
      </ul> : <p className="text-sm text-stone-600">Add a product to start your catalog.</p>}
    </>}
  </div>;
}

function ListingForm({ listing, onSaved, onCancel }: { listing?: SellerListing; onSaved: () => void; onCancel: () => void }) {
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(listing?.images.map((image) => image.imageUrl).join('\n') || '');
  const [video, setVideo] = useState(listing?.craftDetails?.videoUrl || '');
  const existingCategory = listing?.category;

  async function upload(files: FileList | null, kind: 'image' | 'video') {
    if (!files?.length) return;
    setUploading(true);
    setError('');
    try {
      if (kind === 'image' && images.split('\n').filter((line) => line.trim()).length + files.length > 10) {
        throw new Error('A listing can have up to 10 images.');
      }
      for (const file of Array.from(files)) {
        const { url } = await api.uploadMedia(file);
        if (kind === 'video') setVideo(url);
        else setImages((current) => [current.trim(), url].filter(Boolean).join('\n'));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading || saving) return;
    const fields = new FormData(event.currentTarget);
    const value = (key: string) => String(fields.get(key) || '').trim();
    const payload = {
      title: value('title'), description: value('description'), category: value('category'),
      ...Object.fromEntries(numberFields.map(([key]) => [key, Number(value(key))])),
      isMadeToOrder: fields.has('madeToOrder'),
      imageUrls: images.split('\n').map((line) => line.trim()).filter(Boolean),
      craftDetails: {
        ...Object.fromEntries(storyFields.map(([key]) => [key, value(key)])),
        videoUrl: video.trim(), artForm: value('artForm'),
        materials: value('materials').split(',').map((term) => term.trim()).filter(Boolean),
        collections: fields.getAll('collections'),
      },
    };
    setSaving(true);
    setError('');
    try {
      if (listing) await api.updateProduct(listing.id, payload);
      else await api.createProduct(payload);
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return <form onSubmit={submit} className="space-y-5">
    <fieldset disabled={saving || uploading} className="space-y-5 disabled:opacity-70">
      <legend className="mb-3 font-semibold">{listing ? `Edit ${listing.title}` : 'New product'}</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">Product name<input name="title" className="craft-input" required defaultValue={listing?.title} /></label>
        <label className="grid gap-1 text-sm font-semibold">Category
          <select name="category" className="craft-input" defaultValue={existingCategory || 'Home Decor'}>
            {existingCategory && !categories.some(([label]) => label === existingCategory) && <option>{existingCategory}</option>}
            {categories.map(([label]) => <option key={label}>{label}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">Art form<input name="artForm" className="craft-input" defaultValue={listing?.craftDetails?.artForm} /></label>
        <label className="grid gap-1 text-sm font-semibold">Materials (comma separated)<input name="materials" className="craft-input" defaultValue={listing?.craftDetails?.materials?.join(', ')} /></label>
      </div>
      <label className="grid gap-1 text-sm font-semibold">Description<textarea name="description" className="craft-input" required defaultValue={listing?.description} /></label>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {numberFields.map(([key, label, min, step]) => <label className="grid gap-1 text-sm font-semibold" key={key}>{label}
          <input className="craft-input" type="number" name={key} min={min} step={step} required
            defaultValue={listing?.[key] ?? ({ stockQuantity: 1, leadTimeDays: 3, lengthCm: 15, widthCm: 15, heightCm: 20, weightGrams: 800 })[key]} />
        </label>)}
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="madeToOrder" defaultChecked={listing?.isMadeToOrder} /> Made to order</label>
      <fieldset className="flex flex-wrap gap-3">
        <legend className="mb-2 text-sm font-semibold">Collections</legend>
        {collections.map((collection) => <label className="flex items-center gap-2 text-sm" key={collection}>
          <input type="checkbox" name="collections" value={collection} defaultChecked={listing?.craftDetails?.collections?.includes(collection)} />{collection}
        </label>)}
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="grid gap-1 text-sm font-semibold">Image URLs (one per line)<textarea className="craft-input" value={images} onChange={(event) => setImages(event.target.value)} /></label>
          <label className="grid gap-1 text-sm font-semibold"><span className="flex items-center gap-2"><Upload size={15} /> Upload product images</span>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="craft-input" onChange={(event) => upload(event.target.files, 'image')} />
          </label>
          {images && <div className="flex flex-wrap gap-2">{images.split('\n').filter((url) => /^https?:\/\/|^\/uploads\//.test(url.trim())).slice(0, 10).map((url, index) =>
            <CraftImage key={`${url}-${index}`} src={url.trim()} alt={`Product image ${index + 1}`} className="h-12 w-12 rounded-lg object-cover" />)}</div>}
        </div>
        <div className="space-y-2">
          <label className="grid gap-1 text-sm font-semibold">Video URL<input className="craft-input" value={video} onChange={(event) => setVideo(event.target.value)} /></label>
          <label className="grid gap-1 text-sm font-semibold"><span className="flex items-center gap-2"><Upload size={15} /> Upload MP4 or WebM (up to 20 MB)</span>
            <input type="file" accept="video/mp4,video/webm" className="craft-input" onChange={(event) => upload(event.target.files, 'video')} />
          </label>
        </div>
        {storyFields.map(([key, label]) => <label className="grid gap-1 text-sm font-semibold" key={key}>{label}
          <textarea name={key} className="craft-input" rows={3} maxLength={4000} defaultValue={listing?.craftDetails?.[key]} />
        </label>)}
      </div>
    </fieldset>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <div className="flex flex-wrap gap-2">
      <button className="craft-button" disabled={saving || uploading}>{uploading ? 'Uploading…' : saving ? 'Saving…' : 'Save product'}</button>
      <button type="button" className="craft-outline" disabled={saving || uploading} onClick={onCancel}>Cancel</button>
    </div>
  </form>;
}
