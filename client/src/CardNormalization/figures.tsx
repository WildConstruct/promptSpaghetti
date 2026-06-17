import React from 'react';

/**
 * Placeholder card-figure illustrations drawn in a 512×768 image space.
 *
 * Until real EraCrowd render outputs are wired in (the eventual asset source),
 * these stand in as the "asset image" behind the normalization overlays. Each
 * palette is a 1960s racegoer variant so the demo library reads as a real set.
 */

export const CARD_IMAGE_WIDTH = 512;
export const CARD_IMAGE_HEIGHT = 768;

export interface FigurePalette {
  hat: string;
  hatBand: string;
  shirt: string;
  shirtShade: string;
  pants: string;
  skin: string;
  shoe: string;
}

export const FIGURE_PALETTES: FigurePalette[] = [
  { hat: '#d8bf86', hatBand: '#b3955b', shirt: '#dad4c2', shirtShade: '#cdc7b3', pants: '#b6986a', skin: '#c79f73', shoe: '#3f2d1f' },
  { hat: '#cfd6dc', hatBand: '#9aa3ab', shirt: '#b9d2e0', shirtShade: '#a6c2d2', pants: '#6f7c86', skin: '#caa074', shoe: '#2b2b30' },
  { hat: '#e3d2a0', hatBand: '#c2a85f', shirt: '#e8dca8', shirtShade: '#dccf96', pants: '#9a8456', skin: '#b98e62', shoe: '#4a3526' },
  { hat: '#c9b6d8', hatBand: '#9c80b2', shirt: '#d9cae0', shirtShade: '#c7b4d2', pants: '#7a6e86', skin: '#c79f73', shoe: '#332b3a' },
  { hat: '#cdb072', hatBand: '#a4863e', shirt: '#dfd9c8', shirtShade: '#d0c9b4', pants: '#8a6f4a', skin: '#caa074', shoe: '#3a2a1a' }
];

export const CardFigure: React.FC<{ paletteIndex: number }> = ({ paletteIndex }) => {
  const p = FIGURE_PALETTES[paletteIndex % FIGURE_PALETTES.length];
  return (
    <g>
      <ellipse cx="230" cy="722" rx="30" ry="11" fill={p.shoe} />
      <ellipse cx="282" cy="722" rx="30" ry="11" fill={p.shoe} />
      <path d="M214 420 L208 716 L246 716 L256 500 L266 716 L304 716 L298 420 Z" fill={p.pants} />
      <path d="M198 172 C176 214 174 300 188 352 L208 348 C198 300 204 224 220 184 Z" fill={p.shirtShade} />
      <path d="M198 168 Q256 150 314 168 L320 352 Q256 366 192 352 Z" fill={p.shirt} />
      <path d="M256 176 L256 350" stroke={p.shirtShade} strokeWidth="2" />
      <g transform="rotate(-12 322 296)">
        <rect x="300" y="270" width="48" height="38" rx="3" fill="#e9e4d4" stroke="#b7ae8c" />
        <text x="324" y="295" textAnchor="middle" fontSize="15" fill="#9a3b2a" fontWeight="500">500</text>
      </g>
      <path d="M314 172 C338 200 344 270 318 300 L300 290 C320 258 314 214 296 184 Z" fill={p.shirtShade} />
      <rect x="245" y="146" width="22" height="18" fill={p.skin} opacity="0.85" />
      <ellipse cx="256" cy="118" rx="31" ry="37" fill={p.skin} />
      <rect x="230" y="112" width="52" height="11" rx="4" fill="#26262b" />
      <ellipse cx="256" cy="88" rx="70" ry="15" fill={p.hat} />
      <path d="M222 82 C224 50 288 50 290 82 Z" fill={p.hat} />
      <rect x="222" y="76" width="68" height="8" fill={p.hatBand} />
    </g>
  );
};
