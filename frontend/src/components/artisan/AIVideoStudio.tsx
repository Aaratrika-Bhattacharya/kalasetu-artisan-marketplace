import { useEffect, useState, type ChangeEvent } from 'react';
import { Film, ImagePlus, Sparkles } from 'lucide-react';
import { requestShowcaseVideo, videoStyles, type VideoStyle } from '../../services/aiVideo';

export function AIVideoStudio() {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [style, setStyle] = useState<VideoStyle | ''>('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [images]);

  function selectImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    const supported = files.filter((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 10 * 1024 * 1024);
    setImages(supported.slice(0, 5));
    setMessage(supported.length !== files.length || files.length > 5 ? 'Choose up to five JPEG, PNG or WebP images, up to 10 MB each.' : '');
  }

  return <section className="grid overflow-hidden rounded-2xl border border-clayborder bg-white md:grid-cols-[1fr_1fr]">
    <div className="space-y-4 p-5 sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold">AI video studio</h2>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-950">Coming Soon</span>
      </div>
      <p className="text-sm leading-relaxed text-stone-600">Preview the images and style you would use for a short product showcase.</p>
      <label className="block space-y-2 text-sm font-semibold">
        <span className="flex items-center gap-2"><ImagePlus size={17} /> Product images</span>
        <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={selectImages} className="craft-input" />
      </label>
      <label className="block space-y-2 text-sm font-semibold">
        <span>Video style (optional)</span>
        <select className="craft-input font-normal" value={style} onChange={(event) => { setStyle(event.target.value as VideoStyle | ''); setMessage(''); }}>
          <option value="">Choose a style</option>{videoStyles.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <button type="button" className="craft-button" disabled={!images.length}
        onClick={() => setMessage(requestShowcaseVideo({ images, style: style || undefined }).message)}>
        <Sparkles size={17} /> Generate AI Video
      </button>
      <p className="text-sm text-stone-600" role="status">{message || 'Image previews are available on this device.'}</p>
    </div>
    <div className="flex min-h-56 flex-col justify-center gap-3 bg-claysand p-5 sm:p-8">
      {previews.length ? <div className="grid grid-cols-2 gap-3">{previews.map((url, index) =>
        <img key={url} src={url} alt={`Selected image ${index + 1}`} className="aspect-square w-full rounded-xl object-cover" />)}</div> :
        <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-stone-300 py-12 text-sm text-stone-600">
          <Film size={28} className="text-terracotta-700" /> Your image preview will appear here
        </div>}
    </div>
  </section>;
}
