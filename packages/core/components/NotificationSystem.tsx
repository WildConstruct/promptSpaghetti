import React, { useState, useEffect } from 'react';
import { useCorrectionsStore, Notification } from '../correctionsStore';
interface NotificationSystemProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxVisible?: number;
  autoHideDuration?: number;
  export const NotificationSystem: React.FC<NotificationSystemProps> = ({,)
  position = 'top-right',
  maxVisible = 5,
  autoHideDuration = 5000
}) => {
  const { notifications, dismissNotification, clearNotifications } = useCorrectionsStore();
  const [visibleNotifications, setVisibleNotifications] = useState<Notification>([]);
  useEffect(() => {
    // Show only the most recent notifications
    setVisibleNotifications(notifications.slice(0, maxVisible));
  }, [notifications, maxVisible]);
  useEffect(() => {
    // Auto-hide notifications after duration
    if (autoHideDuration > 0) {
      const timers = visibleNotifications.map(notification => {)
  return setTimeout(() => {
          dismissNotification(notification.id);
        }, autoHideDuration);
      });
      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
  }, [visibleNotifications, autoHideDuration, dismissNotification]);
  const getPositionStyles = () => {
  const baseStyles = {
  position: 'fixed' as const,
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '8px',
  width: '320px',
  maxWidth: '90vw',
};
    switch (position) {
    case 'top-right':
      return { ...baseStyles, top: '20px', right: '20px' };
    case 'top-left':
      return { ...baseStyles, top: '20px', left: '20px' };
    case 'bottom-right':
      return { ...baseStyles, bottom: '20px', right: '20px' };
    case 'bottom-left':
      return { ...baseStyles, bottom: '20px', left: '20px' };
    default:
      return { ...baseStyles, top: '20px', right: '20px' };
  };
  const getNotificationStyles = (type: Notification['type']) => {
  const baseStyles = {
  padding: '12px 16px',
  borderRadius: '6px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  border: '1px solid',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '12px',
  animation: 'slideIn 0.3s ease-out',
  fontSize: '14px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};
    switch (type) {
  case 'success':,
  return {
  ...baseStyles,
  background: '#065f46',
  borderColor: '#10b981',
  color: '#d1fae5',
};
    case 'error':
      return {
  ...baseStyles,
  background: '#7f1d1d',
  borderColor: '#ef4444',
  color: '#fee2e2',
};
    case 'warning':
      return {
  ...baseStyles,
  background: '#78350f',
  borderColor: '#f59e0b',
  color: '#fef3c7',
};
    case 'info':
    default:
      return {
  ...baseStyles,
  background: '#1e3a8a',
  borderColor: '#3b82f6',
  color: '#dbeafe',
};
  };
  const getIcon = (type: Notification['type']) => {
  switch (type) {
  case 'success':,
  return '✓';
  case 'error':,
  return '✕';
  case 'warning':,
  return '⚠';
  case 'info':,
  default:,
  return 'ℹ';
};
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;}
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;}
    const days = Math.floor(hours / 24);
    return `${days}d ago`;}
  };
  if (visibleNotifications.length === 0) {
    return null;
  return;
    <>
      {/* CSS Animation */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);,
  opacity: 0;
          to {
            transform: translateX(0);,
  opacity: 1;
        @keyframes fadeOut {
          from {
            opacity: 1;
          to {
            opacity: 0;
      `}</style>
      <div style={getPositionStyles()}>
        {visibleNotifications.map((notification) => ()
          <div
            key={notification.id}
            style={getNotificationStyles(notification.type)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
              <div style={{
  fontSize: '16px',
  marginTop: '2px',
  flexShrink: 0,
}}>
                {getIcon(notification.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
  fontWeight: 600,
  marginBottom: '2px',
  fontSize: '13px',
}}>
                  {notification.title}
                </div>
                <div style={{
  fontSize: '12px',
  opacity: 0.9,
  lineHeight: '1.4',
}}>
                  {notification.message}
                </div>
                <div style={{
  fontSize: '10px',
  opacity: 0.7,
  marginTop: '4px',
}}>
                  {formatTimestamp(notification.timestamp)}
                </div>
              </div>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              style={{
  background: 'none',
  border: 'none',
  color: 'inherit',
  cursor: 'pointer',
  fontSize: '14px',
  padding: '0 4px',
  opacity: 0.7,
  flexShrink: 0,
}}
              title="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
        {notifications.length > maxVisible && ()
          <div style={{
  padding: '8px 12px',
  background: '#2d3748',
  border: '1px solid #4a5568',
  borderRadius: '4px',
  color: '#a0aec0',
  fontSize: '12px',
  textAlign: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}}>
            <span>+{notifications.length - maxVisible} more notifications</span>
            <button
              onClick={clearNotifications}
              style={{
  background: 'none',
  border: 'none',
  color: '#63b3ed',
  cursor: 'pointer',
  fontSize: '11px',
  padding: 0,
}}
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationSystem;