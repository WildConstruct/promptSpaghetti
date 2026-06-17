import React, { useMemo, useState } from 'react';
import {
  composeCard,
  recomputeDerived,
  headHeightMetres,
  type CardNormalization,
  type SceneLayout
} from '@promptscape/core/services/cardNormalization';
import { CardFigure, figureFeetY } from './figures';

/**
 * Before/after composite. The head is a fixed-size ruler, so head count reads
 * true height regardless of how the card was framed (camera distance = srcZoom).
 *
 * Raw OFF: frames pasted at one image scale — head sizes and feet are ragged
 * because each card was rendered at a different distance.
 * Normalized ON: composeCard equalizes head-pixels (one consistent scale) and
 * plants each pivot on the baseline — so figures land at their TRUE relative
 * heights, readable straight off the metre gridlines.
 */

interface PreviewSpec {
  palette: number;
  heads: number;   // real height (head units)
  srcZoom: number; // how big the card was framed (camera distance)
}

const PREVIEW: PreviewSpec[] = [
  { palette: 0, heads: 7.5, srcZoom: 1.0 },
  { palette: 1, heads: 8.2, srcZoom: 0.78 },
  { palette: 2, heads: 6.7, srcZoom: 1.22 },
  { palette: 3, heads: 7.9, srcZoom: 0.9 },
  { palette: 4, heads: 7.1, srcZoom: 1.08 },
  { palette: 0, heads: 8.0, srcZoom: 0.72 }
];

const SCENE: SceneLayout = { width: 1180, height: 470, groundY: 412, targetHeadPx: 38 };
const SLOTS = [120, 320, 520, 700, 900, 1080];
const RAW_SCALE = 0.46;
const HEAD_M = headHeightMetres('adult-male-racegoer');
const PX_PER_M = (SCENE.targetHeadPx ?? 38) / HEAD_M;

function frameNormalization(spec: PreviewSpec, id: string): CardNormalization {
  const z = spec.srcZoom;
  return recomputeDerived({
    version: 'card-norm/1',
    assetId: id,
    imageWidth: 512,
    imageHeight: 768,
    head: { centerX: 256, centerY: 104 * z, width: 80 * z, height: 88 * z, rotation: 0, mode: 'visual-oval', includesHeadwear: true, confidence: 0.9 },
    ground: { y: figureFeetY(spec.heads) * z, angle: 0, leftContact: { x: 232 * z, y: figureFeetY(spec.heads) * z }, rightContact: { x: 280 * z, y: figureFeetY(spec.heads) * z }, supportWidth: 48 * z, confidence: 0.9 },
    pivot: { x: 256, y: figureFeetY(spec.heads) * z, uv: { u: 0.5, v: 0.9 }, lockToGround: true },
    crop: { x: 0, y: 0, width: 512, height: 768, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
    observedHeadCount: 0,
    canonicalHeadCount: 7.5,
    archetype: 'adult-male-racegoer',
    poseClass: 'standing-relaxed',
    targetHeightM: 1.75,
    confidence: { mask: 0.9, pose: 0.9, head: 0.9, ground: 0.9, overall: 0.9 },
    status: 'approved',
    updatedAt: '2026-06-16T00:00:00.000Z'
  });
}

export const ScenePreview: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [normalized, setNormalized] = useState(true);

  const cards = useMemo(
    () =>
      PREVIEW.map((spec, i) => {
        const id = `preview-${i}`;
        const n = frameNormalization(spec, id);
        const composed = composeCard({ normalization: n, centerX: SLOTS[i] }, SCENE);
        return { spec, id, composed, estM: spec.heads * HEAD_M };
      }),
    []
  );

  const metreLines = [0.5, 1.0, 1.5, 2.0];

  return (
    <div className="cn-preview-overlay">
      <div className="cn-preview-head">
        <span className="cn-preview-title">Scene composite</span>
        <span className="cn-preview-sub">6 cards, one ground line</span>
        <label className="cn-preview-toggle">
          <input type="checkbox" checked={normalized} onChange={e => setNormalized(e.target.checked)} />
          Normalized
        </label>
        <span style={{ flex: 1 }} />
        <button className="cn-btn" onClick={onClose}>Close</button>
      </div>
      <div className="cn-preview-stage">
        <svg viewBox={`0 0 ${SCENE.width} ${SCENE.height + 40}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', display: 'block' }} role="img" aria-label="Scene composite preview">
          <rect x="0" y="0" width={SCENE.width} height={SCENE.height + 40} fill="#0e1014" />
          {normalized && metreLines.map(m => {
            const y = SCENE.groundY - m * PX_PER_M;
            if (y < 16) return null;
            return (
              <g key={m}>
                <line x1={20} y1={y} x2={SCENE.width - 20} y2={y} stroke="#5b9bf5" strokeDasharray="5 7" strokeWidth={1} opacity={0.35} />
                <text x={24} y={y - 4} fontSize={13} fill="#7fb0f0">{m.toFixed(1)} m</text>
              </g>
            );
          })}
          {cards.map(({ spec, id, composed, estM }, i) => {
            const tx = 256 * (1 - spec.srcZoom);
            const frame = normalized
              ? `translate(${composed.drawX} ${composed.drawY}) scale(${composed.scale})`
              : `translate(${SLOTS[i] - 256 * RAW_SCALE} ${SCENE.groundY - 768 * RAW_SCALE}) scale(${RAW_SCALE})`;
            return (
              <g key={id}>
                <g transform={frame}>
                  <g transform={`translate(${tx} 0) scale(${spec.srcZoom})`}>
                    <CardFigure paletteIndex={spec.palette} heads={spec.heads} />
                  </g>
                </g>
                {normalized && (
                  <text x={SLOTS[i]} y={composed.headTopY - 10} textAnchor="middle" fontSize={14} fill="#e7e9ee">{estM.toFixed(2)} m</text>
                )}
              </g>
            );
          })}
          <line x1={0} y1={SCENE.groundY} x2={SCENE.width} y2={SCENE.groundY} stroke="#46d07f" strokeWidth={2} />
          <text x={20} y={SCENE.groundY + 26} fontSize={15} fill="#46d07f">Ground line</text>
        </svg>
      </div>
      <p className="cn-preview-caption">
        {normalized
          ? 'Normalized: one consistent scale from the head ruler, feet on a shared baseline — so a taller racegoer reads as genuinely taller. Heights come straight off the metre lines.'
          : 'Raw frames at a uniform image scale — head sizes and feet are ragged because each card was framed at a different distance, so you cannot read true height.'}
      </p>
    </div>
  );
};

export default ScenePreview;
