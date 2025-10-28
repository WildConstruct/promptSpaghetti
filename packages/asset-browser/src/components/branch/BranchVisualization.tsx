import React from 'react';
import type { BranchMap } from '../../services/PreviewService';

export function BranchVisualization({ data }: { data: BranchMap }) {
  // simple horizontal layout
  const width = 320;
  const height = 120;
  const positions = data.nodes.reduce<Record<string, { x: number; y: number }>>(
    (acc, n, i) => {
      acc[n.id] = { x: 40 + i * 120, y: height / 2 };
      return acc;
    },
    {}
  );

  return (
    <svg
      width={width}
      height={height}
      role="img"
      aria-label="Branch visualization"
    >
      {data.edges.map((e, idx) => {
        const a = positions[e.from];
        const b = positions[e.to];
        if (!a || !b) return null;
        return (
          <line
            key={idx}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#999"
            strokeWidth={2}
          />
        );
      })}
      {data.nodes.map(n => {
        const p = positions[n.id];
        return (
          <g key={n.id}>
            <circle cx={p.x} cy={p.y} r={12} fill="#4a90e2" />
            <text
              x={p.x}
              y={p.y - 16}
              textAnchor="middle"
              fontSize={10}
              fill="#333"
            >
              {n.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
