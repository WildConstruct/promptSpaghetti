/**
 * Loading indicator for state restoration
 */

import React from 'react';

interface RestorationLoaderProps {
  message?: string;
}

export function RestorationLoader({
  message = 'Restoring your work...'
}: RestorationLoaderProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading state"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}
      >
        {/* Animated Loader */}
        <div
          style={{
            width: '60px',
            height: '60px',
            position: 'relative'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: '3px solid #e9ecef',
              borderRadius: '50%'
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: '3px solid transparent',
              borderTopColor: '#007bff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
        </div>

        {/* Loading Message */}
        <div
          style={{
            fontSize: '16px',
            color: '#495057',
            fontWeight: '500',
            textAlign: 'center'
          }}
        >
          {message}
        </div>

        {/* Progress Dots */}
        <div
          style={{
            display: 'flex',
            gap: '8px'
          }}
        >
          {[0, 1, 2].map(index => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#007bff',
                opacity: 0.3,
                animation: `pulse 1.5s ease-in-out ${index * 0.2}s infinite`
              }}
            />
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

/**
 * Toast notification for restoration status
 */
export function RestorationToast({
  type,
  message,
  onClose
}: {
  type: 'success' | 'error' | 'warning';
  message: string;
  onClose?: () => void;
}) {
  React.useEffect(() => {
    if (onClose) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [onClose]);

  const colors = {
    success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724', icon: '✓' },
    error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24', icon: '✗' },
    warning: { bg: '#fff3cd', border: '#ffeeba', text: '#856404', icon: '⚠' }
  };

  const style = colors[type];

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 16px',
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: '6px',
        color: style.text,
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 10000,
        animation: 'slideIn 0.3s ease',
        maxWidth: '400px'
      }}
      role="alert"
    >
      <span style={{ fontSize: '18px' }}>{style.icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: style.text,
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0 4px',
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '0.7';
          }}
          aria-label="Close"
        >
          ×
        </button>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
