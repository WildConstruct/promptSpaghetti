// TreePreviewModal - preview generated nodes/edges before commit
// Story 2.5b: AC1 Context-Aware Tree Building

import React, { useEffect, useState } from 'react';
import type { BuildTreeResult } from '../../services/TreeBuilder';

interface TreePreviewModalProps {
  result: BuildTreeResult;
  visible: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

export const TreePreviewModal: React.FC<TreePreviewModalProps> = ({
  result,
  visible,
  onAccept,
  onCancel
}) => {
  const [anim, setAnim] = useState(false);
  useEffect(() => {
    if (visible) setTimeout(() => setAnim(true), 0);
  }, [visible]);
  if (!visible) return null;

  const { template, nodes, edges, confidence } = result;

  return (
    <div
      className={`tree-preview-backdrop ${anim ? 'visible' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 10000
      }}
    >
      <div
        className={`tree-preview-modal ${anim ? 'visible' : ''}`}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#111',
          color: '#fff',
          width: 520,
          borderRadius: 8,
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>Build Tree Preview</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              {template.name} • {nodes.length} nodes • {edges.length} edges •
              confidence {Math.round(confidence * 100)}%
            </div>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close"
            style={{
              background: 'transparent',
              color: '#fff',
              border: 0,
              fontSize: 18,
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: 16, maxHeight: 360, overflow: 'auto' }}>
          <div style={{ fontSize: 13, marginBottom: 8, opacity: 0.9 }}>
            {template.description}
          </div>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            <MiniCanvas nodes={nodes as any} edges={edges as any} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Summary</div>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>Nodes: {nodes.length}</li>
                <li>Edges: {edges.length}</li>
                <li>Template: {template.id}</li>
              </ul>
            </div>
          </div>
        </div>
        <div
          style={{
            padding: 16,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8
          }}
        >
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            style={{
              background: '#10b981',
              border: 0,
              color: '#fff',
              padding: '8px 12px',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default TreePreviewModal;

// MiniCanvas: very lightweight static preview using SVG
const MiniCanvas: React.FC<{
  nodes: Array<{
    id: string;
    position: { x: number; y: number };
    data?: any;
    type?: string;
  }>;
  edges: Array<{ source: string; target: string }>;
}> = ({ nodes, edges }) => {
  if (!nodes || nodes.length === 0)
    return (
      <div style={{ fontSize: 12, opacity: 0.7 }}>No nodes to preview</div>
    );
  const minX = Math.min(...nodes.map(n => n.position?.x ?? 0));
  const minY = Math.min(...nodes.map(n => n.position?.y ?? 0));
  const maxX = Math.max(...nodes.map(n => n.position?.x ?? 0));
  const maxY = Math.max(...nodes.map(n => n.position?.y ?? 0));
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  const viewW = 480;
  const viewH = 260;
  const pad = 20;
  const scaleX = (viewW - pad * 2) / (width || 1);
  const scaleY = (viewH - pad * 2) / (height || 1);
  const scale = Math.min(scaleX, scaleY);
  const pos = (n: any) => ({
    x: pad + (n.position.x - minX) * scale,
    y: pad + (n.position.y - minY) * scale
  });
  const posMap = new Map<string, { x: number; y: number }>();
  nodes.forEach(n => posMap.set(n.id, pos(n)));
  return (
    <svg
      width={viewW}
      height={viewH}
      style={{ background: '#0b0b0b', borderRadius: 6 }}
    >
      {edges.map((e, i) => {
        const s = posMap.get(e.source);
        const t = posMap.get(e.target);
        if (!s || !t) return null;
        return (
          <line
            key={i}
            x1={s.x}
            y1={s.y}
            x2={t.x}
            y2={t.y}
            stroke="#555"
            strokeWidth={2}
          />
        );
      })}
      {nodes.map(n => {
        const p = posMap.get(n.id)!;
        return (
          <g key={n.id}>
            <rect
              x={p.x - 18}
              y={p.y - 10}
              width={36}
              height={20}
              rx={4}
              ry={4}
              fill="#1f2937"
              stroke="#6b7280"
            />
            <text
              x={p.x}
              y={p.y + 4}
              fontSize={8}
              fill="#d1d5db"
              textAnchor="middle"
            >
              {(n.data?.label || n.type || n.id).toString().slice(0, 12)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
