import { useState } from 'react';
import { Calendar, Compass } from 'lucide-react';
import { EventCategory } from '../types';

interface MediaBannerProps {
  src?: string;
  alt: string;
  category: EventCategory;
  title: string;
  className?: string;
}

const FALLBACK_GRADIENTS: Record<EventCategory, string> = {
  'Tech & Hackathons': 'from-[#EDE9FE] via-[#E2E7FF] to-[#C4E7FF]',
  'Arts & Design': 'from-[#F2F3FF] via-[#EDE9FE] to-[#FAF8FF]',
  'Music & Social': 'from-[#E5DEFF] via-[#FAF8FF] to-[#C4E7FF]',
  Academic: 'from-[#EAEDFF] via-[#F2F3FF] to-[#E2E7FF]',
  Athletics: 'from-[#E2E7FF] via-[#FAF8FF] to-[#EDE9FE]',
};

export function MediaBanner({ src, alt, category, title, className = '' }: MediaBannerProps) {
  const [hasError, setHasError] = useState(false);

  const showFallback = !src || hasError;
  const gradient = FALLBACK_GRADIENTS[category] ?? 'from-[#EDE9FE] to-[#EAEDFF]';

  if (showFallback) {
    return (
      <div
        className={`relative aspect-video w-full overflow-hidden bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-5 text-center border-b border-[#E2E8F0] ${className}`}
        role="img"
        aria-label={alt || title}
      >
        <div className="w-10 h-10 rounded-lg bg-white/80 border border-[#E2E8F0] flex items-center justify-center text-[#6546E8] mb-2">
          {category === 'Tech & Hackathons' || category === 'Academic' ? (
            <Compass className="w-5 h-5" />
          ) : (
            <Calendar className="w-5 h-5" />
          )}
        </div>
        <p className="text-xs font-medium text-[#484555] line-clamp-1 max-w-[80%]">{title}</p>
      </div>
    );
  }

  return (
    <div className={`relative aspect-video w-full overflow-hidden bg-[#F2F3FF] ${className}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
      />
    </div>
  );
}
