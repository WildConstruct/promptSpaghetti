import React from 'react';

export const BatchProgressOverlay: React.FC<{
  title?: string;
  done: number;
  total: number;
  onCancel: () => void;
}> = ({ title = 'Processing…', done, total, onCancel }) => {
  const pct = Math.min(100, Math.round((done / Math.max(1, total)) * 100));
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          width: 360,
          background: '#111',
          color: '#fff',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.45)'
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {title}
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>
            Processed {done} of {total}
          </div>
          <div
            style={{
              height: 8,
              background: '#222',
              borderRadius: 6,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: pct + '%',
                height: '100%',
                background: '#10b981'
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: 12
            }}
          >
            <button
              onClick={onCancel}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '6px 10px',
                borderRadius: 6,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchProgressOverlay;
