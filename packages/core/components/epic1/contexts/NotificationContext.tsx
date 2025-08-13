import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (
    type: Notification['type'], 
    message: string, 
    options?: {
      duration?: number;
      action?: Notification['action'];
    }
  ) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  defaultDuration?: number;
  maxNotifications?: number;
}

/**
 * NotificationProvider - Manages all notifications/toasts in the application
 * Provides a centralized notification system
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  defaultDuration = 5000,
  maxNotifications = 5,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((
    type: Notification['type'],
    message: string,
    options?: {
      duration?: number;
      action?: Notification['action'];
    }
  ) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const notification: Notification = {
      id,
      type,
      message,
      duration: options?.duration ?? defaultDuration,
      action: options?.action,
    };

    setNotifications(prev => {
      // Keep only the most recent notifications
      const updated = [notification, ...prev];
      if (updated.length > maxNotifications) {
        updated.pop();
      }
      return updated;
    });

    // Auto-dismiss after duration (unless duration is 0)
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        dismissNotification(id);
      }, notification.duration);
    }
  }, [defaultDuration, maxNotifications]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextType = {
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

/**
 * useNotifications - Hook to access notification context
 */
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

/**
 * NotificationContainer - Renders all active notifications
 * Place this at the root of your app
 */
export const NotificationContainer: React.FC<{
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}> = ({ position = 'top-right' }) => {
  const { notifications, dismissNotification } = useNotifications();

  return (
    <div className={`epic1-notification-container epic1-notification-${position}`}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`epic1-notification epic1-notification-${notification.type}`}
        >
          <div className="epic1-notification-content">
            <span className="epic1-notification-message">{notification.message}</span>
            {notification.action && (
              <button
                className="epic1-notification-action"
                onClick={notification.action.onClick}
              >
                {notification.action.label}
              </button>
            )}
          </div>
          <button
            className="epic1-notification-dismiss"
            onClick={() => dismissNotification(notification.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};