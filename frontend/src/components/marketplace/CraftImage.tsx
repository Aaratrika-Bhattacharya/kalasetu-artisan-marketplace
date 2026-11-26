import { useState, type ImgHTMLAttributes } from 'react';
import { ImageOff } from 'lucide-react';

export function CraftImage({ src, alt, className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failedSrc, setFailedSrc] = useState<string>();
  if (!src || src === failedSrc) {
    return <span role="img" aria-label={alt || 'Image unavailable'} className={`grid place-items-center bg-stone-100 text-stone-400 ${className || ''}`}>
      <ImageOff className="h-6 w-6" aria-hidden />
    </span>;
  }
  return <img {...props} src={src} alt={alt} className={className} onError={() => setFailedSrc(src)} />;
}
