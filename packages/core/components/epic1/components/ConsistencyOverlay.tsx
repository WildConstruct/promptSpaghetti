import React from 'react';
import type { Conflict } from '../../../hooks/useConsistency';

interface ConsistencyOverlayProps {
  conflicts: Conflict[];
  onFix: (conflict: Conflict) => void;
  onFixAll?: () => void;
  hints?: {
    style?: string;
    time?: string;
    category?: string;
  };
}

export const ConsistencyOverlay: React.FC<ConsistencyOverlayProps> = ({
  conflicts,
  onFix,
  onFixAll,
  hints
}) => {
  const red = conflicts.filter(conflict => conflict.severity === 'red');
  const orange = conflicts.filter(conflict => conflict.severity === 'orange');
  const yellow = conflicts.filter(conflict => conflict.severity === 'yellow');

  return (
    <div className="consistency-overlay">
      <div className="consistency-header">
        <strong>Consistency</strong>
        {onFixAll && (
          <button onClick={onFixAll} className="consistency-float-right">
            Fix All
          </button>
        )}
      </div>

      {hints && (
        <div className="consistency-hints">
          {hints.style && (
            <div>
              Fix to dominant style: <strong>{hints.style}</strong>
            </div>
          )}
          {hints.time && (
            <div>
              Fix to dominant time: <strong>{hints.time}</strong>
            </div>
          )}
          {hints.category && (
            <div>
              Fix to dominant category: <strong>{hints.category}</strong>
            </div>
          )}
        </div>
      )}

      {red.length > 0 && <Section title="Major (red)" items={red} onFix={onFix} />}
      {orange.length > 0 && (
        <Section title="Moderate (orange)" items={orange} onFix={onFix} />
      )}
      {yellow.length > 0 && (
        <Section title="Minor (yellow)" items={yellow} onFix={onFix} />
      )}
      {conflicts.length === 0 && (
        <div className="consistency-empty">No conflicts detected</div>
      )}
    </div>
  );
};

interface SectionProps {
  title: string;
  items: Conflict[];
  onFix: (conflict: Conflict) => void;
}

const Section: React.FC<SectionProps> = ({ title, items, onFix }) => (
  <div className="consistency-section">
    <div className="consistency-title">
      {title} • {items.length}
    </div>
    <ul className="consistency-list">
      {items.map(conflict => (
        <li key={conflict.id} className="consistency-item">
          <span className="consistency-message">{conflict.message}</span>
          <button onClick={() => onFix(conflict)} className="ml-8">
            Apply fix
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default ConsistencyOverlay;
