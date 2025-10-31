import { memo, useEffect, useMemo, useRef } from 'react';
import type { Conflict } from '../../../hooks/useConsistency';

export interface NodeConsistencyBadgesProps {
  conflicts: Conflict[];
}

type ConsistencySeverity = 'red' | 'orange' | 'yellow';

const SEVERITY_RANK: Record<ConsistencySeverity, number> = {
  red: 3,
  orange: 2,
  yellow: 1
};

const getNodeBadge = (conflicts: Conflict[]) => {
  const bySeverity = new Map<string, { severity: ConsistencySeverity; message: string }>();

  conflicts.forEach(conflict => {
    const { nodeId, severity, message } = conflict;
    const existing = bySeverity.get(nodeId)?.severity;
    if (!existing || SEVERITY_RANK[severity] > SEVERITY_RANK[existing]) {
      bySeverity.set(nodeId, { severity, message });
    }
  });

  return bySeverity;
};

const ensureBadgeStyles = () => {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.getElementById('consistency-badge-style')) {
    return;
  }

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
};

// eslint-disable-next-line react/prop-types
const NodeConsistencyBadgesComponent: React.FC<NodeConsistencyBadgesProps> = ({ conflicts }) => {
  const appliedRef = useRef<Set<string>>(new Set());

  const badges = useMemo(() => getNodeBadge(conflicts), [conflicts]);

  useEffect(() => {
    ensureBadgeStyles();

    const touched = new Set<string>();
    badges.forEach(({ severity, message }, nodeId) => {
      const element = document.querySelector<HTMLElement>(
        `.react-flow__node[data-id='${nodeId}']`
      );
      if (element) {
        element.setAttribute('data-consistency', severity);
        element.setAttribute('title', message);
        touched.add(nodeId);
      }
    });

    appliedRef.current.forEach(nodeId => {
      if (!touched.has(nodeId)) {
        const element = document.querySelector<HTMLElement>(
          `.react-flow__node[data-id='${nodeId}']`
        );
        element?.removeAttribute('data-consistency');
        appliedRef.current.delete(nodeId);
      }
    });

    touched.forEach(nodeId => appliedRef.current.add(nodeId));
  }, [badges]);

  return null;
};

export const NodeConsistencyBadges = memo(NodeConsistencyBadgesComponent);

export default NodeConsistencyBadges;
