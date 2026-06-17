import React, { useEffect, useRef } from 'react';
import {
  groundYAt,
  type CardNormalization
} from '@promptscape/core/services/cardNormalization';
import {
  CardFigure,
  CARD_IMAGE_WIDTH,
  CARD_IMAGE_HEIGHT
} from './figures';

export type NormTool = 'head' | 'ground' | 'pivot';
export interface ViewLayers {
  guide: boolean;
  mask: boolean;
  skeleton: boolean;
  grid: boolean;
}

interface Props {
  value: CardNormalization;
  onChange: (next: CardNormalization) => void;
  paletteIndex: number;
  heads: number;
  /** Real asset image (data/URL); when set it replaces the drawn placeholder. */
  imageUri?: string;
  view: ViewLayers;
}

const CX = CARD_IMAGE_WIDTH / 2;
const GROUND_HW = 170;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const deg = (r: number) => (r * 180) / Math.PI;

type DragType = 'head' | 'headSize' | 'ground' | 'groundL' | 'groundR' | 'pivot';

export const NormalizationCanvas: React.FC<Props> = ({
  value,
  onChange,
  paletteIndex,
  heads,
  imageUri,
  view
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ type: DragType; start: { x: number; y: number }; v: CardNormalization } | null>(null);

  const toSvg = (e: PointerEvent | React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) {
      return { x: 0, y: 0 };
    }
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const m = svg.getScreenCTM();
    if (!m) {
      return { x: 0, y: 0 };
    }
    const p = pt.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) {
        return;
      }
      const p = toSvg(e);
      const dx = p.x - d.start.x;
      const dy = p.y - d.start.y;
      const v = d.v;
      let next: CardNormalization = v;
      if (d.type === 'head') {
        next = { ...v, head: { ...v.head, centerX: clamp(v.head.centerX + dx, 60, CARD_IMAGE_WIDTH - 60), centerY: clamp(v.head.centerY + dy, 50, 400) } };
      } else if (d.type === 'headSize') {
        const h = clamp(v.head.height + dy, 36, 220);
        const ratio = h / v.head.height;
        next = { ...v, head: { ...v.head, height: h, width: v.head.width * ratio } };
      } else if (d.type === 'ground') {
        next = { ...v, ground: { ...v.ground, y: clamp(v.ground.y + dy, 320, CARD_IMAGE_HEIGHT - 8) } };
      } else if (d.type === 'groundL' || d.type === 'groundR') {
        const side = d.type === 'groundR' ? 1 : -1;
        const endY0 = v.ground.y + side * GROUND_HW * Math.tan((v.ground.angle * Math.PI) / 180);
        const endY = endY0 + dy;
        const ang = clamp(deg(Math.atan2(side * (endY - v.ground.y), GROUND_HW)), -14, 14);
        next = { ...v, ground: { ...v.ground, angle: ang } };
      } else if (d.type === 'pivot') {
        next = { ...v, pivot: { ...v.pivot, x: clamp(v.pivot.x + dx, CX - GROUND_HW + 10, CX + GROUND_HW - 10) } };
      }
      onChange(next);
    };
    const up = () => {
      drag.current = null;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [onChange]);

  const startDrag = (type: DragType) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    drag.current = { type, start: toSvg(e), v: value };
  };

  const h = value.head;
  const g = value.ground;
  const headTop = h.centerY - h.height / 2;
  const unit = h.height;
  const lx = CX - GROUND_HW;
  const rx = CX + GROUND_HW;
  const lY = groundYAt(g, lx);
  const rY = groundYAt(g, rx);
  const py = value.pivot.lockToGround ? groundYAt(g, value.pivot.x) : value.pivot.y;
  const obs = value.observedHeadCount;

  const ticks = [];
  for (let i = 0; i <= 8; i++) {
    const y = headTop + i * unit;
    if (y > 766) {
      break;
    }
    ticks.push(
      <g key={i}>
        <line x1={36} y1={y} x2={66} y2={y} stroke="#5b9bf5" strokeDasharray="4 4" strokeWidth={1} opacity={i === 8 ? 0.5 : 0.85} />
        <text x={30} y={y + 4} fontSize={13} fill="#7fb0f0" textAnchor="end">{i}</text>
      </g>
    );
    const y2 = headTop + (i + 0.5) * unit;
    if (i === 7 && y2 < 766) {
      ticks.push(
        <g key="t75">
          <line x1={36} y1={y2} x2={72} y2={y2} stroke="#5b9bf5" strokeWidth={2} />
          <text x={30} y={y2 + 4} fontSize={13} fill="#9cc6ff" textAnchor="end">7.5</text>
        </g>
      );
    }
  }
  const obsY = headTop + obs * unit;

  return (
    <svg ref={svgRef} viewBox={`0 0 ${CARD_IMAGE_WIDTH} ${CARD_IMAGE_HEIGHT}`} style={{ width: '100%', display: 'block', touchAction: 'none' }} role="img" aria-label="Card normalization canvas">
      <defs>
        <pattern id="cnGrid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="0" y="0" width={CARD_IMAGE_WIDTH} height={CARD_IMAGE_HEIGHT} fill="#111111" />
      {view.grid && <rect x="0" y="0" width={CARD_IMAGE_WIDTH} height={CARD_IMAGE_HEIGHT} fill="url(#cnGrid)" />}

      {imageUri ? (
        <image href={imageUri} x={0} y={0} width={CARD_IMAGE_WIDTH} height={CARD_IMAGE_HEIGHT} preserveAspectRatio="xMidYMid meet" />
      ) : (
        <CardFigure paletteIndex={paletteIndex} heads={heads} />
      )}

      {view.mask && (
        <path opacity={0.22} fill="#7f77dd" d="M226 60 C228 46 284 46 286 60 C300 66 312 96 304 112 L320 168 C342 196 348 270 322 300 L322 420 L300 716 L266 716 L256 510 L246 716 L212 716 L214 420 L190 352 C176 300 178 220 194 184 L208 112 C200 96 212 66 226 60 Z" />
      )}
      {view.skeleton && (
        <g opacity={0.9} stroke="#5fd6e8" strokeWidth={3} fill="none" strokeLinecap="round">
          <circle cx={256} cy={118} r={13} fill="#5fd6e8" />
          <path d="M256 131 L256 420" />
          <path d="M198 172 L256 182 L314 172" />
          <path d="M198 172 L190 352 M314 172 L318 300" />
          <path d="M256 420 L230 560 L232 716 M256 420 L282 560 L280 716" />
        </g>
      )}

      {view.guide && (
        <>
          <g>{ticks}</g>
          <line x1={58} y1={headTop} x2={58} y2={Math.min(headTop + 8 * unit, 764)} stroke="#5b9bf5" strokeWidth={2} />
          <polygon points={`48,${obsY} 62,${obsY - 6} 62,${obsY + 6}`} fill="#5b9bf5" />
        </>
      )}

      <line x1={lx} y1={lY} x2={rx} y2={rY} stroke="#46d07f" strokeWidth={2.5} style={{ cursor: 'ns-resize' }} onPointerDown={startDrag('ground')} />
      <circle cx={lx} cy={lY} r={9} fill="#46d07f" style={{ cursor: 'grab' }} onPointerDown={startDrag('groundL')} />
      <circle cx={rx} cy={rY} r={9} fill="#46d07f" style={{ cursor: 'grab' }} onPointerDown={startDrag('groundR')} />
      <circle cx={g.leftContact.x} cy={g.leftContact.y} r={6} fill="#111111" stroke="#46d07f" strokeWidth={2} />
      <circle cx={g.rightContact.x} cy={g.rightContact.y} r={6} fill="#111111" stroke="#46d07f" strokeWidth={2} />
      <text x={rx + 8} y={rY - 6} fontSize={13} fill="#46d07f">Ground plane</text>

      <g transform={`rotate(${h.rotation} ${h.centerX} ${h.centerY})`}>
        <ellipse cx={h.centerX} cy={h.centerY} rx={h.width / 2} ry={h.height / 2} fill="none" stroke="#b07cff" strokeWidth={2.5} style={{ cursor: 'move' }} onPointerDown={startDrag('head')} />
      </g>
      <circle cx={h.centerX} cy={h.centerY} r={4} fill="#b07cff" />
      <rect x={h.centerX + h.width / 2 - 6} y={h.centerY + h.height / 2 - 6} width={12} height={12} rx={2} fill="#b07cff" style={{ cursor: 'nwse-resize' }} onPointerDown={startDrag('headSize')} />
      <line x1={h.centerX + h.width / 2 + 4} y1={headTop + 6} x2={h.centerX + h.width / 2 + 64} y2={headTop + 6} stroke="#b07cff" strokeWidth={1.5} strokeDasharray="5 4" />
      <text x={h.centerX + h.width / 2 + 10} y={headTop - 6} fontSize={13} fill="#b07cff">Head unit</text>
      <text x={h.centerX + h.width / 2 + 10} y={headTop + 24} fontSize={12} fill="#a98fd0">{Math.round(h.height)} px</text>

      <g transform={`translate(${value.pivot.x} ${py})`}>
        <circle r={15} fill="none" stroke="#f6b042" strokeWidth={2} style={{ cursor: 'ew-resize' }} onPointerDown={startDrag('pivot')} />
        <line x1={-22} x2={22} y1={0} y2={0} stroke="#f6b042" strokeWidth={2} />
        <line y1={-20} y2={26} x1={0} x2={0} stroke="#f6b042" strokeWidth={2} />
        <circle r={3.5} fill="#f6b042" />
      </g>
      <text x={value.pivot.x} y={py + 46} textAnchor="middle" fontSize={13} fill="#f6b042">Pivot / anchor</text>
    </svg>
  );
};
