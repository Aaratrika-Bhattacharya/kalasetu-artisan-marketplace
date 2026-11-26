import { useState } from 'react';
import { ChevronLeft, ChevronRight, Film, Play } from 'lucide-react';
import type { Product, ProductVideo } from '../../types';
import { productImage } from '../../services/catalog';
import { CraftImage } from './CraftImage';

type Slide = { kind: 'photo'; url: string; label: string } | ({ kind: 'video' } & ProductVideo);

export function ProductGallery({ product, title }: { product: Product; title: string }) {
  const [selected, setSelected] = useState<Slide>();
  const [failedVideo, setFailedVideo] = useState<string>();
  const cover = productImage(product);
  const videos = [...(product.craftDetails?.videos || [])];
  const uploadedVideo = product.craftDetails?.videoUrl;
  if (uploadedVideo && !videos.some(({ url }) => url === uploadedVideo)) {
    videos.unshift({ url: uploadedVideo, label: 'Workshop video' });
  }

  const photoUrls = [...new Set([cover, ...product.images.map((image) => image.imageUrl)])];
  const photos: Slide[] = photoUrls.map((url, index) => ({ kind: 'photo', url, label: `Photo ${index + 1}` }));
  const slides: Slide[] = [photos[0], ...videos.map((video) => ({ ...video, kind: 'video' as const })), ...photos.slice(1)];
  const current = Math.max(0, slides.findIndex((slide) => slide.kind === selected?.kind && slide.url === selected.url));
  const slide = slides[current];
  const move = (direction: number) => setSelected(slides[(current + direction + slides.length) % slides.length]);

  return <section aria-label="Product media gallery" className="min-w-0 space-y-3">
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-clayborder bg-white">
      {slide.kind === 'photo' ? (
        <CraftImage src={slide.url} alt={current === 0 ? title : `${title}, ${slide.label.toLowerCase()}`}
          className="h-full w-full object-contain" />
      ) : failedVideo === slide.url ? (
        <div className="grid h-full content-center justify-items-center gap-3 bg-claysand p-12 text-center text-sm text-stone-700">
          <Film size={24} aria-hidden="true" />
          <p>This video could not be played.</p>
          <button className="craft-outline" onClick={() => setFailedVideo(undefined)}>Try again</button>
        </div>
      ) : (
        <video key={slide.url} src={slide.url} poster={cover} controls playsInline preload="metadata"
          aria-label={`${slide.label} for ${title}`} onError={() => setFailedVideo(slide.url)} className="h-full w-full bg-stone-950" />
      )}
      {slides.length > 1 && <>
        <button type="button" onClick={() => move(-1)} aria-label="Previous slide"
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-clayborder bg-white p-2 text-stone-900 shadow-sm hover:bg-claysand sm:left-3"><ChevronLeft size={19} /></button>
        <button type="button" onClick={() => move(1)} aria-label="Next slide"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-clayborder bg-white p-2 text-stone-900 shadow-sm hover:bg-claysand sm:right-3"><ChevronRight size={19} /></button>
      </>}
    </div>

    {slides.length > 1 && <div className="flex gap-2 overflow-x-auto px-0.5 py-1" aria-label="Gallery thumbnails">
      {slides.map((item, index) => (
        <button key={`${item.kind}-${item.url}`} type="button" onClick={() => setSelected(item)}
          aria-label={`Slide ${index + 1}: ${item.label}`} aria-pressed={current === index}
          className={`relative shrink-0 overflow-hidden rounded-lg border-2 bg-white ${current === index ? 'border-terracotta-600' : 'border-clayborder hover:border-stone-400'}`}>
          <CraftImage src={item.kind === 'video' ? cover : item.url} alt="" className="h-14 w-[4.5rem] object-cover sm:h-16 sm:w-20" />
          {item.kind === 'video' && <span className="absolute inset-0 grid place-items-center bg-stone-950/35 text-white">
            <span className="rounded-full bg-stone-950/80 p-1.5"><Play size={15} fill="currentColor" /></span>
          </span>}
        </button>
      ))}
    </div>}
    <p className={slide.kind === 'video' ? 'text-sm text-stone-600' : 'sr-only'} aria-live="polite">
      {current + 1} / {slides.length} · {slide.label}
      {slide.kind === 'video' && slide.isIllustrative && ' · Illustrative video'}
    </p>
  </section>;
}
