import { useEffect, useRef } from 'react';
import type { Conflict } from '../../../hooks/useConsistency';

export const NodeConsistencyBadges: React.FC<{ conflicts: Conflict[] } > = ({ conflicts }) => {
  const appliedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // inject styles once
    if (!document.getElementById('consistency-badge-style')) {
      const style = document.createElement('style');
      style.id = 'consistency-badge-style';
      style.textContent = `
      .react-flow__node[data-consistency]::after {
        content: attr(data-consistency);
        position: absolute; top: -8px; right: -8px;
        font-size: 10px; padding: 2px 6px; border-radius: 10px;
        color: #fff; z-index: 2; pointer-events: none;
      }
      .react-flow__node[data-consistency='red']::after { background: #ef4444; }
      .react-flow__node[data-consistency='orange']::after { background: #f59e0b; }
      .react-flow__node[data-consistency='yellow']::after { background: #eab308; color: #111; }
      `;
      document.head.appendChild(style);
    }

    const bySeverity = new Map<string, { sev: 'red' | 'orange' | 'yellow'; msg: string }>();
    conflicts.forEach(c => {
      const prev = bySeverity.get(c.nodeId)?.sev;
      const sev = c.severity;
      const rank = (s: string) => s === 'red' ? 3 : s === 'orange' ? 2 : 1;
      if (!prev || rank(sev) > rank(prev)) bySeverity.set(c.nodeId, { sev, msg: c.message });
    });

    // apply attributes
    const touched = new Set<string>();
    bySeverity.forEach(({ sev, msg }, nodeId) => {
      const el = document.querySelector(`.react-flow__node[data-id='${nodeId}']`) as HTMLElement | null;
      if (el) {
        el.setAttribute('data-consistency', sev);
        el.setAttribute('title', msg);
        touched.add(nodeId);
      }
    });

    // clear old badges that are not in current conflicts
    appliedRef.current.forEach(nodeId => {
      if (!touched.has(nodeId)) {
        const el = document.querySelector(`.react-flow__node[data-id='${nodeId}']`) as HTMLElement | null;
        if (el) el.removeAttribute('data-consistency');
        appliedRef.current.delete(nodeId);
      }
    });
    // update applied set
    touched.forEach(id => appliedRef.current.add(id));

    return () => {
      // do not remove styles; attributes will be cleaned as conflicts change
    };
  }, [conflicts]);

  return null;
};

export default NodeConsistencyBadges;
