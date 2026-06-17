import React, { useEffect, useState } from 'react';
import {
  ARCHETYPES,
  POSE_CLASSES,
  getArchetypeOrDefault,
  isHeadCountInRange,
  type PoseClass
} from '@promptscape/core/services/cardNormalization';
import { useCardNormalization } from './useCardNormalization';
import { NormalizationCanvas, type NormTool, type ViewLayers } from './NormalizationCanvas';
import { CardFigure } from './figures';
import { SEED_TOTAL } from './seedAssets';
import './CardNormalization.css';

const STATUS_LABEL: Record<string, string> = {
  unsolved: 'Unsolved',
  auto: 'Auto-solved',
  edited: 'Edited',
  approved: 'Approved'
};
const STATUS_COLOR: Record<string, string> = {
  unsolved: '#f6b042',
  auto: '#5b9bf5',
  edited: '#c9a14a',
  approved: '#46d07f'
};

function Meter({ label, value, accent }: { label: string; value: number; accent?: string }) {
  const pct = Math.round(value * 100);
  return (
    <div className="cn-row">
      <span className="cn-lab">{label}</span>
      <div className="cn-track"><div className="cn-fill" style={{ width: `${pct}%`, background: accent ?? '#46d07f' }} /></div>
      <span className="cn-val" style={{ width: 30, textAlign: 'right' }}>{pct}%</span>
    </div>
  );
}

export const CardNormalizationScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const n = useCardNormalization();
  const [tool, setTool] = useState<NormTool>('head');
  const [view, setView] = useState<ViewLayers>({ guide: true, mask: true, skeleton: false, grid: false });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        return;
      }
      const k = e.key.toLowerCase();
      if (k === 'h') setTool('head');
      if (k === 'g') setTool('ground');
      if (k === 'p') setTool('pivot');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const w = n.working;
  const arche = getArchetypeOrDefault(w.archetype);
  const inRange = isHeadCountInRange(w.observedHeadCount, w.archetype);
  const c = w.confidence;

  return (
    <div className="cn-screen">
      <div className="cn-header">
        <button className="cn-iconbtn" onClick={onBack} aria-label="Back to card assets">←</button>
        <span className="cn-title">Card normalization</span>
        <span className="cn-asset">{w.assetId}</span>
        <span className="cn-pill" style={{ color: STATUS_COLOR[w.status], borderColor: STATUS_COLOR[w.status] }}>{STATUS_LABEL[w.status]}</span>
        {n.dirty && <span className="cn-dirty">Unsaved</span>}
        <span className="cn-spacer" />
        <button className="cn-btn" onClick={n.reset}>Reset</button>
        <button className="cn-btn" onClick={n.autoSolve}>Auto-solve</button>
        <button className="cn-btn cn-btn-primary" onClick={() => n.save(true)}>Save &amp; approve</button>
      </div>

      <div className="cn-body">
        <div className="cn-rail">
          <p className="cn-h">Normalization tools</p>
          {([['head', 'Head', 'H'], ['ground', 'Ground', 'G'], ['pivot', 'Pivot', 'P']] as const).map(([id, label, key]) => (
            <button key={id} className={`cn-tool ${tool === id ? 'active' : ''}`} onClick={() => setTool(id)}>
              {label}<span className="cn-key">{key}</span>
            </button>
          ))}
          <p className="cn-h" style={{ marginTop: 12 }}>View</p>
          {([['guide', 'Head count guide'], ['mask', 'Mask overlay'], ['skeleton', 'Pose skeleton'], ['grid', 'Grid']] as const).map(([id, label]) => (
            <label key={id} className="cn-chk">
              <input type="checkbox" checked={view[id]} onChange={e => setView(v => ({ ...v, [id]: e.target.checked }))} /> {label}
            </label>
          ))}
          <p className="cn-h" style={{ marginTop: 12 }}>Auto-solve status</p>
          <Meter label="Mask" value={c.mask} />
          <Meter label="Pose" value={c.pose} />
          <Meter label="Head" value={c.head} />
          <Meter label="Ground" value={c.ground} />
          <Meter label="Overall" value={c.overall} accent="#f5c84a" />
        </div>

        <div className="cn-canvas-wrap">
          <NormalizationCanvas value={w} onChange={n.change} paletteIndex={n.card.paletteIndex} view={view} />
          <div className="cn-readout">
            <div className="cn-ro-lab">Observed head count</div>
            <div className="cn-ro-big">{w.observedHeadCount.toFixed(2)}</div>
            <div className="cn-ro-status" style={{ color: inRange ? '#46d07f' : '#f6b042' }}>{inRange ? 'Good' : 'Out of range'}</div>
            <div className="cn-ro-lab">Target range</div>
            <div className="cn-ro-val">{arche.headCountRange[0].toFixed(1)} – {arche.headCountRange[1].toFixed(1)}</div>
            <div className="cn-ro-lab">Canonical</div>
            <div className="cn-ro-val">{w.canonicalHeadCount.toFixed(1)} heads · {arche.targetHeightM.toFixed(2)} m</div>
          </div>
        </div>

        <div className="cn-inspect">
          <p className="cn-h">Normalization properties</p>
          <div className={`cn-pblk ${tool === 'head' ? 'active' : ''}`}>
            <div className="cn-pblk-h" style={{ color: '#b07cff' }}>Head</div>
            <Prop k="Center" v={`${Math.round(w.head.centerX)}, ${Math.round(w.head.centerY)}`} />
            <Prop k="Size" v={`${Math.round(w.head.width)} × ${Math.round(w.head.height)}`} />
            <Prop k="Rotation" v={`${w.head.rotation.toFixed(1)}°`} />
            <Prop k="Headwear" v={w.head.includesHeadwear ? 'Included' : 'Excluded'} />
          </div>
          <div className={`cn-pblk ${tool === 'ground' ? 'active' : ''}`}>
            <div className="cn-pblk-h" style={{ color: '#46d07f' }}>Ground plane</div>
            <Prop k="Ground Y" v={`${Math.round(w.ground.y)}`} />
            <Prop k="Angle" v={`${w.ground.angle.toFixed(1)}°`} />
            <Prop k="Support W" v={`${Math.round(w.ground.supportWidth)}`} />
          </div>
          <div className={`cn-pblk ${tool === 'pivot' ? 'active' : ''}`}>
            <div className="cn-pblk-h" style={{ color: '#f6b042' }}>Pivot / anchor</div>
            <Prop k="Anchor" v={`${Math.round(w.pivot.x)}, ${Math.round(w.pivot.y)}`} />
            <Prop k="Pivot UV" v={`${w.pivot.uv.u.toFixed(3)}, ${w.pivot.uv.v.toFixed(3)}`} />
          </div>
          <div className="cn-pblk">
            <div className="cn-pblk-h">Classification</div>
            <label className="cn-field">Archetype
              <select value={w.archetype} onChange={e => n.setArchetype(e.target.value)}>
                {ARCHETYPES.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </label>
            <label className="cn-field">Pose class
              <select value={w.poseClass} onChange={e => n.setPoseClass(e.target.value as PoseClass)}>
                {POSE_CLASSES.map(p => <option key={p} value={p}>{p.replace('-', ' ')}</option>)}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="cn-footer">
        <button className="cn-iconbtn" onClick={n.prev} aria-label="Previous card">‹</button>
        <div className="cn-strip">
          {n.cards.map((card, i) => (
            <button key={card.asset.id} className={`cn-thumb ${i === n.index ? 'sel' : ''}`} onClick={() => n.goTo(i)} title={card.asset.id}>
              <span className="cn-thumb-dot" style={{ background: STATUS_COLOR[n.statuses[i]] }} />
              <svg viewBox="0 0 512 768" width="34" height="51"><CardFigure paletteIndex={card.paletteIndex} /></svg>
            </button>
          ))}
        </div>
        <button className="cn-iconbtn" onClick={n.next} aria-label="Next card">›</button>
        <span className="cn-count">Asset {n.index + 1} of {SEED_TOTAL}</span>
      </div>
    </div>
  );
};

function Prop({ k, v }: { k: string; v: string }) {
  return (
    <div className="cn-pr"><span className="k">{k}</span><span className="v">{v}</span></div>
  );
}

export default CardNormalizationScreen;
