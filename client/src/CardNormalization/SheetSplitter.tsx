import React, { useRef, useState } from 'react';

/**
 * Break a multi-figure render sheet into single-figure cards: load a sheet,
 * drag a box around each figure, and each crop is handed back as a data URL
 * (which the editor turns into a card to normalize).
 */

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const SheetSplitter: React.FC<{
  onClose: () => void;
  onCrop: (dataUrl: string) => void;
}> = ({ onClose, onCrop }) => {
  const [src, setSrc] = useState<string | null>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [draft, setDraft] = useState<Box | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);

  const loadFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSrc(reader.result);
        setBoxes([]);
      }
    };
    reader.readAsDataURL(file);
  };

  const rel = (e: React.PointerEvent) => {
    const r = layerRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e: React.PointerEvent) => {
    const p = rel(e);
    start.current = p;
    setDraft({ x: p.x, y: p.y, w: 0, h: 0 });
  };
  const onMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    const p = rel(e);
    const s = start.current;
    setDraft({ x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) });
  };
  const onUp = () => {
    if (draft && draft.w > 14 && draft.h > 14) setBoxes(b => [...b, draft]);
    setDraft(null);
    start.current = null;
  };

  const createCards = () => {
    const img = imgRef.current;
    if (!img || boxes.length === 0) return;
    const scale = img.naturalWidth / img.getBoundingClientRect().width;
    const canvas = document.createElement('canvas');
    boxes.forEach(b => {
      const sw = Math.round(b.w * scale);
      const sh = Math.round(b.h * scale);
      if (sw < 4 || sh < 4) return;
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, b.x * scale, b.y * scale, sw, sh, 0, 0, sw, sh);
      onCrop(canvas.toDataURL('image/png'));
    });
    onClose();
  };

  return (
    <div className="cn-preview-overlay">
      <div className="cn-preview-head">
        <span className="cn-preview-title">Split sheet</span>
        <span className="cn-preview-sub">Drag a box around each figure</span>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ''; }} />
        <button className="cn-btn" onClick={() => fileRef.current?.click()}>{src ? 'Replace sheet' : 'Load sheet'}</button>
        {boxes.length > 0 && <button className="cn-btn" onClick={() => setBoxes([])}>Clear boxes</button>}
        <span style={{ flex: 1 }} />
        {boxes.length > 0 && <button className="cn-btn cn-btn-primary" onClick={createCards}>Create {boxes.length} card{boxes.length === 1 ? '' : 's'}</button>}
        <button className="cn-btn" onClick={onClose}>Close</button>
      </div>
      <div
        className="cn-preview-stage"
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) loadFile(f); }}
      >
        {!src ? (
          <div style={{ color: '#9aa1ad', fontSize: 13 }}>Load or drop a multi-figure sheet to begin</div>
        ) : (
          <div ref={layerRef} style={{ position: 'relative', display: 'inline-block', maxHeight: '100%', touchAction: 'none', cursor: 'crosshair' }}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
            <img ref={imgRef} src={src} alt="Sheet" style={{ display: 'block', maxHeight: '74vh', maxWidth: '100%', userSelect: 'none', pointerEvents: 'none' }} draggable={false} />
            {[...boxes, ...(draft ? [draft] : [])].map((b, i) => (
              <div key={i} style={{ position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, border: '2px solid #e6a23c', background: 'rgba(230, 162, 60,0.12)', pointerEvents: 'none' }} />
            ))}
          </div>
        )}
      </div>
      <p className="cn-preview-caption">Each box is cropped to its own card you can then normalize.</p>
    </div>
  );
};

export default SheetSplitter;
