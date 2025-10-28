import React from 'react';
import type { Conflict } from '../../../hooks/useConsistency';

export const ConsistencyOverlay: React.FC<{\n  conflicts: Conflict[];\n  onFix: (conflict: Conflict) => void;\n  onFixAll?: () => void;\n  hints?: { style?: string; time?: string; category?: string };\n}> = ({ conflicts, onFix, onFixAll, hints }) => {
  const red = conflicts.filter(c => c.severity === 'red');
  const orange = conflicts.filter(c => c.severity === 'orange');
  const yellow = conflicts.filter(c => c.severity === 'yellow');
  return (
    <div className="consistency-overlay">
      <div className="consistency-header">
        <strong>Consistency</strong>
        {onFixAll && (
          <button onClick={onFixAll} className="consistency-float-right">Fix All</button>
        )}
      </div>
      \n        {hints && (\n          <div className=\"consistency-hints\">\n            {hints.style && (<div>Fix to dominant style: <strong>{hints.style}</strong></div>)}\n            {hints.time && (<div>Fix to dominant time: <strong>{hints.time}</strong></div>)}\n            {hints.category && (<div>Fix to dominant category: <strong>{hints.category}</strong></div>)}\n          </div>\n        )}
        {red.length > 0 && <Section title="Major (red)" items={red} onFix={onFix} />}
        {orange.length > 0 && <Section title="Moderate (orange)" items={orange} onFix={onFix} />}
        {yellow.length > 0 && <Section title="Minor (yellow)" items={yellow} onFix={onFix} />}
        {conflicts.length === 0 && <div className="consistency-empty">No conflicts detected</div>}
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; items: Conflict[]; onFix: (c: Conflict) => void }> = ({ title, items, onFix }) => (
  <div className=\"consistency-section\">\n    <div className=\"consistency-title\">{title} • {items.length}</div>\n    <ul className=\"consistency-list\">\n      {items.map(c => (\n        <li key={c.id} className=\"consistency-item\">\n          <span className=\"consistency-message\">{c.message}</span>\n          <button onClick={() => onFix(c)} className=\"ml-8\">Apply fix</button>\n        </li>\n      ))}\n    </ul>\n  </div>
);

export default ConsistencyOverlay;


