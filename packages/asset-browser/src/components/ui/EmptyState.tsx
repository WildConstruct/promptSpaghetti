import React from 'react';

export type EmptyStateProps = {
  title?: string;
  message: string;
  helpUrl?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title = 'Nothing here yet', message, helpUrl, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div role="status" aria-live="polite" style={{ padding: 12, color: '#555', border: '1px dashed #ddd', borderRadius: 6, marginTop: 8 }}>
      {title && <strong style={{ display: 'block', marginBottom: 4 }}>{title}</strong>}
      <div>{message}</div>
      <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
        {actionLabel && onAction && (
          <button type="button" onClick={onAction}>{actionLabel}</button>
        )}
        {helpUrl && (
          <a href={helpUrl} target="_blank" rel="noreferrer">Learn more</a>
        )}
      </div>
    </div>
  );
}
