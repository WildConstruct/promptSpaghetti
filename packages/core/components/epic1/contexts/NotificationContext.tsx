import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: number;
  duration?: number;
}

export interface NotificationContextValue {
  notifications: Notification[];
  showNotification: (type: NotificationType, message: string, duration?: number) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export interface NotificationProviderProps {
  children: React.ReactNode;
  defaultDuration?: number;
  maxNotifications?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  defaultDuration = 3000,
  maxNotifications = 5,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Auto-dismiss notifications
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    notifications.forEach((notification) => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          dismissNotification(notification.id);
        }, notification.duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [notifications]);

  const showNotification = useCallback(
    (type: NotificationType, message: string, duration?: number) => {
      const id = `notification-${Date.now()}-${Math.random()}`;
      const notification: Notification = {
        id,
        type,
        message,
        timestamp: Date.now(),
        duration: duration ?? defaultDuration,
      };

      setNotifications((prev) => {
        // Keep only the most recent notifications
        const updated = [...prev, notification];
        if (updated.length > maxNotifications) {
          return updated.slice(-maxNotifications);
        }
        return updated;
      });
    },
    [defaultDuration, maxNotifications]
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextValue = {
    notifications,
    showNotification,
    dismissNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// NotificationContainer component for rendering notifications
export interface NotificationContainerProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  className?: string;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  position = 'top-right',
  className = '',
}) => {
  const { notifications, dismissNotification } = useNotifications();

  const getPositionStyles = () => {
    const base = {
      position: 'fixed' as const,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      padding: '16px',
      pointerEvents: 'none' as const,
    };

    switch (position) {
      case 'top-left':
        return { ...base, top: 0, left: 0 };
      case 'top-right':
        return { ...base, top: 0, right: 0 };
      case 'bottom-left':
        return { ...base, bottom: 0, left: 0 };
      case 'bottom-right':
        return { ...base, bottom: 0, right: 0 };
      case 'top-center':
        return { ...base, top: 0, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-center':
        return { ...base, bottom: 0, left: '50%', transform: 'translateX(-50%)' };
      default:
        return base;
    }
  };

  const getNotificationStyles = (type: NotificationType) => {
    const base = {
      padding: '12px 16px',
      borderRadius: '6px',
      backgroundColor: '#fff',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minWidth: '300px',
      maxWidth: '500px',
      pointerEvents: 'auto' as const,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      animation: 'slideIn 0.3s ease',
    };

    const colors = {
      success: { borderLeft: '4px solid #10b981', color: '#065f46' },
      error: { borderLeft: '4px solid #ef4444', color: '#991b1b' },
      warning: { borderLeft: '4px solid #f59e0b', color: '#92400e' },
      info: { borderLeft: '4px solid #3b82f6', color: '#1e40af' },
    };

    return { ...base, ...colors[type] };
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <div style={getPositionStyles()} className={className}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          style={getNotificationStyles(notification.type)}
          onClick={() => dismissNotification(notification.id)}
          role="alert"
          aria-live="polite"
        >
          <span style={{ fontSize: '20px' }}>{getIcon(notification.type)}</span>
          <span style={{ flex: 1 }}>{notification.message}</span>
          <button
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              opacity: 0.6,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
            onClick={(e) => {
              e.stopPropagation();
              dismissNotification(notification.id);
            }}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
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
};