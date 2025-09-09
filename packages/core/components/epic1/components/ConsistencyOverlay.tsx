import React from 'react';
import type { Conflict } from '../../../hooks/useConsistency';

export const ConsistencyOverlay: React.FC<{\n  conflicts: Conflict[];\n  onFix: (conflict: Conflict) => void;\n  onFixAll?: () => void;\n  hints?: { style?: string; time?: string; category?: string };\n}> = ({ conflicts, onFix, onFixAll, hints }) => {
  const red = conflicts.filter(c => c.severity === 'red');
  const orange = conflicts.filter(c => c.severity === 'orange');
  const yellow = conflicts.filter(c => c.severity === 'yellow');
  return (
    <div style={{ position: 'fixed', top: 80, right: 16, width: 320, background: '#0b0b0b', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, zIndex: 9999 }}>
      <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <strong>Consistency</strong>
        {onFixAll && (
          <button onClick={onFixAll} style={{ float: 'right' }}>Fix All</button>
        )}
      </div>
      \n        {hints && (\n          <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>\n            {hints.style && (<div>Fix to dominant style: <strong>{hints.style}</strong></div>)}\n            {hints.time && (<div>Fix to dominant time: <strong>{hints.time}</strong></div>)}\n            {hints.category && (<div>Fix to dominant category: <strong>{hints.category}</strong></div>)}\n          </div>\n        )}
        {red.length > 0 && <Section title="Major (red)" items={red} onFix={onFix} />}
        {orange.length > 0 && <Section title="Moderate (orange)" items={orange} onFix={onFix} />}
        {yellow.length > 0 && <Section title="Minor (yellow)" items={yellow} onFix={onFix} />}
        {conflicts.length === 0 && <div style={{ opacity: 0.75 }}>No conflicts detected</div>}
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; items: Conflict[]; onFix: (c: Conflict) => void }> = ({ title, items, onFix }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ fontWeight: 600, marginBottom: 4 }}>{title} • {items.length}</div>
    <ul style={{ margin: 0, paddingLeft: 16 }}>
      {items.map(c => (
        <li key={c.id} style={{ marginBottom: 4 }}>
          <span style={{ opacity: 0.9 }}>{c.message}</span>
          <button onClick={() => onFix(c)} style={{ marginLeft: 8 }}>Apply fix</button>
        </li>
      ))}
    </ul>
  </div>
);

export default ConsistencyOverlay;


