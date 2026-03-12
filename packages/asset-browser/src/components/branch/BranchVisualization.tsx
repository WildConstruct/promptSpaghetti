import React from 'react';
import type { BranchMap } from '../../services/PreviewService';

export function BranchVisualization({ data }: { data: BranchMap }) {
  // simple horizontal layout
  const width = 320;
  const height = 120;
  const toFiniteNumber = (
    value: number | undefined,
    fallback: number
  ): number =>
    typeof value === 'number' && Number.isFinite(value) ? value : fallback;
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
        const x1 = toFiniteNumber(a?.x, 0);
        const y1 = toFiniteNumber(a?.y, height / 2);
        const x2 = toFiniteNumber(b?.x, width);
        const y2 = toFiniteNumber(b?.y, height / 2);
        return (
          <line
            key={idx}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#999"
            strokeWidth={2}
          />
        );
      })}
      {data.nodes.map(n => {
        const p = positions[n.id];
        const cx = toFiniteNumber(p?.x, 0);
        const cy = toFiniteNumber(p?.y, height / 2);
        const r = toFiniteNumber(12, 12);
        return (
          <g key={n.id}>
            <circle cx={cx} cy={cy} r={r} fill="#4a90e2" />
            <text
              x={cx}
              y={cy - 16}
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
