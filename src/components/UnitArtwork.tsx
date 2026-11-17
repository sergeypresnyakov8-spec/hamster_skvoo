import React, { useState } from 'react';
import { UnitDefinition } from '../game/types';

const VARIANT_IMAGES: Record<string, string> = {
  admiral: './src/assets/images/space_hero_admiral_1794916300536.jpg',
  duelist: './src/assets/images/space_commander_duelist_1794916301947.jpg',
  mirra: './src/assets/images/space_advisor_mirra_1794916300368.jpg',
  victoria: './src/assets/images/space_advisor_victoria_1794916300581.jpg',
};

interface UnitArtworkProps {
  unit: UnitDefinition;
  locked?: boolean;
  className?: string;
}

export const UnitArtwork: React.FC<UnitArtworkProps> = ({ unit, locked = false, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const imgSrc = unit.portraitVariant !== 'procedural' ? VARIANT_IMAGES[unit.portraitVariant] : null;

  if (imgSrc && !imgFailed) {
    return (
      <img
        src={imgSrc}
        alt={unit.name}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className={`w-full h-full object-cover object-top transition-transform duration-200 ${
          locked ? 'grayscale opacity-55 contrast-125' : ''
        } ${className}`}
      />
    );
  }

  // Bespoke SVG space-hamster / relic / admiral portrait fallback
  const h = unit.accentHue;
  return (
    <div
      className={`w-full h-full flex items-center justify-center relative overflow-hidden ${
        locked ? 'grayscale-[70%] opacity-80' : ''
      } ${className}`}
      style={{
        background: `radial-gradient(circle at 50% 35%, hsla(${h}, 72%, 34%, 0.95), #0E121D 85%)`,
      }}
    >
      <svg viewBox="0 0 120 120" className="w-4/5 h-4/5 drop-shadow-lg" aria-hidden="true">
        <defs>
          <linearGradient id={`armor-${unit.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={`hsl(${h}, 78%, 62%)`} />
            <stop offset="100%" stopColor={`hsl(${h}, 60%, 26%)`} />
          </linearGradient>
        </defs>
        {/* Starfield & orbital halo */}
        <circle cx="60" cy="58" r="46" fill="none" stroke={`hsla(${h}, 85%, 70%, 0.35)`} strokeWidth="1.5" strokeDasharray="4 4" />
        {unit.category === 'relics' ? (
          <>
            <polygon points="60,18 92,58 60,100 28,58" fill={`url(#armor-${unit.id})`} stroke="#F8D482" strokeWidth="2.5" />
            <circle cx="60" cy="58" r="16" fill="#0B0D14" stroke="#F8D482" strokeWidth="2" />
            <circle cx="60" cy="58" r="7" fill={`hsl(${h}, 95%, 72%)`} />
          </>
        ) : (
          <>
            {/* Shoulders / Space suit */}
            <path d="M22 110 C22 80, 98 80, 98 110 Z" fill={`url(#armor-${unit.id})`} stroke="#E5A93C" strokeWidth="2" />
            {/* Hamster ears */}
            <circle cx="38" cy="34" r="11" fill="#C68B59" stroke="#5C3A21" strokeWidth="2" />
            <circle cx="82" cy="34" r="11" fill="#C68B59" stroke="#5C3A21" strokeWidth="2" />
            {/* Helmet visor rim */}
            <circle cx="60" cy="54" r="28" fill="#182032" stroke={`hsl(${h}, 80%, 66%)`} strokeWidth="2.5" />
            {/* Hamster face */}
            <ellipse cx="60" cy="56" rx="21" ry="18" fill="#D89E68" />
            <ellipse cx="60" cy="63" rx="14" ry="10" fill="#F6E6D2" />
            {/* Visor / Cyber Eyes */}
            <rect x="42" y="47" width="36" height="10" rx="5" fill={`hsla(${h}, 90%, 60%, 0.78)`} stroke="#F8D482" strokeWidth="1.2" />
            <circle cx="51" cy="52" r="2.8" fill="#0B0D14" />
            <circle cx="69" cy="52" r="2.8" fill="#0B0D14" />
            <polygon points="57,59 63,59 60,63" fill="#E07A7A" />
            {unit.category === 'admirals' && (
              <path d="M40 28 L46 18 L60 24 L74 18 L80 28 Z" fill="#E5A93C" stroke="#FFF3C4" strokeWidth="1.2" />
            )}
          </>
        )}
      </svg>
    </div>
  );
};
