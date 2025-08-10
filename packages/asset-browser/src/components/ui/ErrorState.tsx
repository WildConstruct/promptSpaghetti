import React from 'react';

export type ErrorStateProps = {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({ title = 'Something went wrong', message, retryLabel = 'Retry', onRetry }: ErrorStateProps) {
  return (
    <div role="alert" aria-live="assertive" style={{ padding: 12, color: '#b00', border: '1px solid #f3c2c2', background: '#fff6f6', borderRadius: 6, marginTop: 8 }}>
      {title && <strong style={{ display: 'block', marginBottom: 4 }}>{title}</strong>}
      <div>{message}</div>
      {onRetry && (
        <div style={{ marginTop: 8 }}>
          <button type="button" onClick={onRetry}>{retryLabel}</button>
        </div>
      )}
    </div>
  );
}
