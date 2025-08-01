import React, { useMemo } from 'react';
import { DiffResult, DiffSegment } from './DiffEngine';
import './DiffViewer.css';

interface DiffViewerProps {
  diff: DiffResult;
  className?: string;
  showInline?: boolean;
}

/**
 * Component for rendering diff results with visual highlighting
 */
export const DiffViewer: React.FC<DiffViewerProps> = ({ 
  diff, 
  className = '',
  showInline = true 
}) => {
  // Render inline diff with colored segments
  const inlineContent = useMemo(() => {
    if (!showInline || !diff.hasChanges) {
      return null;
    }

    return diff.segments.map((segment, index) => {
      const key = `${segment.type}-${index}`;
      
      switch (segment.type) {
        case 'added':
          return (
            <span key={key} className="epic1-diff-added" title="Added">
              {segment.text}
            </span>
          );
        case 'removed':
          return (
            <span key={key} className="epic1-diff-removed" title="Removed">
              {segment.text}
            </span>
          );
        case 'unchanged':
          return <span key={key}>{segment.text}</span>;
        default:
          return null;
      }
    });
  }, [diff, showInline]);

  // Show summary for significant changes
  const changeSummary = useMemo(() => {
    if (!diff.hasChanges) return null;

    const parts: string[] = [];
    if (diff.addedCount > 0) {
      parts.push(`+${diff.addedCount}`);
    }
    if (diff.removedCount > 0) {
      parts.push(`-${diff.removedCount}`);
    }

    return parts.length > 0 ? `(${parts.join(' ')})` : null;
  }, [diff]);

  if (!diff.hasChanges) {
    return null;
  }

  return (
    <div className={`epic1-diff-viewer ${className}`}>
      {changeSummary && (
        <div className="epic1-diff-summary">{changeSummary}</div>
      )}
      {inlineContent && (
        <div className="epic1-diff-content">{inlineContent}</div>
      )}
    </div>
  );
};

interface DiffIndicatorProps {
  hasChanges: boolean;
  addedCount?: number;
  removedCount?: number;
  className?: string;
}

/**
 * Small indicator badge showing if content has changes
 */
export const DiffIndicator: React.FC<DiffIndicatorProps> = ({
  hasChanges,
  addedCount = 0,
  removedCount = 0,
  className = ''
}) => {
  if (!hasChanges) {
    return null;
  }

  const title = `Changes: +${addedCount} -${removedCount}`;
  
  return (
    <div className={`epic1-diff-indicator ${className}`} title={title}>
      <span className="epic1-diff-indicator-dot" />
      {(addedCount > 0 || removedCount > 0) && (
        <span className="epic1-diff-indicator-text">
          {addedCount > 0 && <span className="epic1-diff-indicator-added">+{addedCount}</span>}
          {removedCount > 0 && <span className="epic1-diff-indicator-removed">-{removedCount}</span>}
        </span>
      )}
    </div>
  );
};

interface ChangeHighlightProps {
  isChanged: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component to highlight changed content
 */
export const ChangeHighlight: React.FC<ChangeHighlightProps> = ({
  isChanged,
  children,
  className = ''
}) => {
  return (
    <div className={`epic1-change-highlight ${isChanged ? 'is-changed' : ''} ${className}`}>
      {children}
    </div>
  );
};