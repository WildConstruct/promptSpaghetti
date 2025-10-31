/**
 * Session timeout warning component
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../providers/AuthUserProvider';

interface SessionTimeoutWarningProps {
  sessionDuration?: number; // milliseconds
  warningTime?: number; // milliseconds before timeout to show warning
  onExtend?: () => void;
}

export function SessionTimeoutWarning({
  sessionDuration = 30 * 60 * 1000, // 30 minutes
  warningTime = 5 * 60 * 1000, // 5 minutes before timeout
  onExtend
}: SessionTimeoutWarningProps) {
  const { isAuthenticated, refreshSession } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const updateActivity = () => {
      setLastActivity(Date.now());
      setShowWarning(false);
    };

    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [isAuthenticated]);

  // Check for timeout
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      const timeUntilTimeout = sessionDuration - timeSinceActivity;

      if (timeUntilTimeout <= 0) {
        // Session expired
        setShowWarning(false);
        // Could trigger auto-logout here
      } else if (timeUntilTimeout <= warningTime) {
        // Show warning
        setShowWarning(true);
        setTimeRemaining(Math.ceil(timeUntilTimeout / 1000));
      } else {
        // Hide warning if shown
        setShowWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity, sessionDuration, warningTime]);

  const handleExtend = useCallback(async () => {
    setLastActivity(Date.now());
    setShowWarning(false);

    // Refresh the session
    await refreshSession();
    onExtend?.();
  }, [refreshSession, onExtend]);

  const handleLogout = useCallback(() => {
    setShowWarning(false);
    // Trigger logout through auth provider
  }, []);

  if (!showWarning || !isAuthenticated) {
    return null;
  }

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        border: '1px solid #fbbf24',
        padding: '20px',
        maxWidth: '400px',
        zIndex: 10000,
        animation: 'slideIn 0.3s ease'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}
      >
        <span
          style={{
            fontSize: '24px',
            flexShrink: 0
          }}
        >
          ⏱️
        </span>

        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#92400e'
            }}
          >
            Session Expiring Soon
          </h3>

          <p
            style={{
              margin: '0 0 16px 0',
              fontSize: '14px',
              color: '#78350f',
              lineHeight: '1.5'
            }}
          >
            Your session will expire in{' '}
            <strong>
              {minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`}
            </strong>
            . Would you like to continue working?
          </p>

          <div
            style={{
              display: 'flex',
              gap: '8px'
            }}
          >
            <button
              onClick={handleExtend}
              style={{
                flex: 1,
                padding: '8px 16px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#d97706';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#f59e0b';
              }}
            >
              Stay Signed In
            </button>

            <button
              onClick={handleLogout}
              style={{
                flex: 1,
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#92400e',
                border: '1px solid #fbbf24',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#fef3c7';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: '#fed7aa',
          borderRadius: '0 0 8px 8px',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            height: '100%',
            backgroundColor: '#f59e0b',
            width: `${(timeRemaining / (warningTime / 1000)) * 100}%`,
            transition: 'width 1s linear'
          }}
        />
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
