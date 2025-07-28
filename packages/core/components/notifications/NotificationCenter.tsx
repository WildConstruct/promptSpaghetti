/**
 * Epic 9.2.5 - Notification Center UI Component
 * Complete notification system with real-time updates, filtering, and user preferences
 */
import React, { useState, useEffect, useRef } from 'react';
import { NotificationManager } from './NotificationManager';

export interface Notification {
  id: string;
  user_id: string;
  workspace_id: string;
  event_id?: string;
  notification_type: string;
  title: string;
  message: string;
  action_url?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  delivery_channel: 'in_app' | 'email' | 'push';
  read_at?: string;
  delivered_at: string;
  // Additional UI properties
  icon?: string;
  color?: string;
  action_label?: string;
}
interface NotificationCenterProps {
  notificationManager: NotificationManager;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({)
  notificationManager,
  isOpen,
  onClose,
  className = ''
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'mentions' | 'workspace'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'priority' | 'type'>('newest');
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, filter, sortBy]);
  useEffect(() => {
    // Set up real-time notification updates
    const unsubscribe = notificationManager.onNotificationReceived((notification) => {
      setNotifications(prev => [notification, ...prev]);
      if (!notification.read_at) {
        setUnreadCount(prev => prev + 1);
      }
    });
    return unsubscribe;
  }, [notificationManager]);
  useEffect(() => {
    // Close panel when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const result = await notificationManager.getNotifications({)
        filter,
        sort_by: sortBy,
        limit: 50,
      });
      setNotifications(result.notifications);
      setUnreadCount(result.unread_count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationManager.markAsRead(notificationId);
      setNotifications(prev => )
        prev.map(n => )
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id);
      await notificationManager.markAllAsRead(unreadIds);
      setNotifications(prev => )
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };
  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationManager.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      // Navigate to the action URL
      window.location.href = notification.action_url;
    }
  };
  const getNotificationIcon = (notification: Notification): string => {
    if (notification.icon) return notification.icon;
    switch (notification.notification_type) {
    case 'comment':
      return '💬';
    case 'mention':
      return '@';
    case 'collaboration':
      return '👥';
    case 'workspace':
      return '🏢';
    case 'template':
      return '📋';
    case 'approval':
      return '✅';
    case 'rejection':
      return '❌';
    case 'system':
      return 'ℹ️';
    default:
      return '🔔';
    }
  };
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
    case 'urgent':
      return 'text-red-600 bg-red-100';
    case 'high':
      return 'text-orange-600 bg-orange-100';
    case 'normal':
      return 'text-blue-600 bg-blue-100';
    case 'low':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
    }
  };
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;}
    if (diffHours < 24) return `${diffHours}h ago`;}
    if (diffDays < 7) return `${diffDays}d ago`;}
    return date.toLocaleDateString();
  };
  if (!isOpen) return null;
  return ()
    <div className={`notification-center ${className}`}>}
      <div 
        ref={panelRef}
        className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && ()
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          {/* Filters */}
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="mentions">Mentions</option>
              <option value="workspace">Workspace</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest</option>
              <option value="priority">Priority</option>
              <option value="type">Type</option>
            </select>
          </div>
        </div>
        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? ()
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : notifications.length === 0 ? ()
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🔔</div>
              <h4 className="font-medium text-gray-900 mb-1">All caught up!</h4>
              <p className="text-sm">No notifications to display.</p>
            </div>
          ) : ()
            <div className="divide-y divide-gray-100">
              {notifications.map(notification => ()
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                  onMarkAsRead={() => markAsRead(notification.id)}
                  onDelete={() => deleteNotification(notification.id)}
                  getIcon={getNotificationIcon}
                  getPriorityColor={getPriorityColor}
                  formatTimeAgo={formatTimeAgo}
                />
              ))}
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              // Navigate to notification preferences
              window.location.href = '/settings/notifications';
            }}
            className="w-full text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Notification Settings
          </button>
        </div>
      </div>
    </div>
  );
};
interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
  getIcon: (notification: Notification) => string;
  getPriorityColor: (priority: string) => string;
  formatTimeAgo: (dateString: string) => string;
}
const NotificationItem: React.FC<NotificationItemProps> = ({)
  notification,
  onClick,
  onMarkAsRead,
  onDelete,
  getIcon,
  getPriorityColor,
  formatTimeAgo
}) => {
  const [showActions, setShowActions] = useState(false);
  return ()
    <div 
      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${
        !notification.read_at ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <span className="text-lg">{getIcon(notification)}</span>
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {notification.title}
            </h4>
            <div className="flex items-center space-x-2">
              {notification.priority !== 'normal' && ()
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(notification.priority)}`}>}
                  {notification.priority}
                </span>
              )}
              <span className="text-xs text-gray-500">
                {formatTimeAgo(notification.delivered_at)}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {notification.message}
          </p>
          {notification.action_label && ()
            <button className="text-xs text-blue-600 hover:text-blue-800 mt-2">
              {notification.action_label}
            </button>
          )}
        </div>
        {/* Action Buttons */}
        {showActions && ()
          <div className="absolute top-2 right-2 flex space-x-1">
            {!notification.read_at && ()
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead();
                }}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Mark as read"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};