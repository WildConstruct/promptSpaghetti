// Epic 9.4.3 - Lock Notifications Component
// Display and manage lock-related notifications

import React, { useState } from 'react';
import { Bell, Clock, Lock, AlertTriangle, Check, X, Filter } from 'lucide-react';
import { LockNotification } from '../types/locking';

interface LockNotificationsProps {
  notifications: LockNotification[];
  onMarkAsRead: (notificationId: string) => void;
}

export const LockNotifications: React.FC<LockNotificationsProps> = ({
  notifications,
  onMarkAsRead
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'type'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'acquired':
        return <Lock className="h-4 w-4 text-green-500" />;
      case 'released':
        return <Check className="h-4 w-4 text-blue-500" />;
      case 'broken':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'conflict':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'queue_position':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'expiring':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'acquired':
        return 'border-l-green-500 bg-green-50';
      case 'released':
        return 'border-l-blue-500 bg-blue-50';
      case 'broken':
        return 'border-l-red-500 bg-red-50';
      case 'conflict':
        return 'border-l-orange-500 bg-orange-50';
      case 'queue_position':
        return 'border-l-blue-500 bg-blue-50';
      case 'expiring':
        return 'border-l-amber-500 bg-amber-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read_at) return false;
    if (typeFilter !== 'all' && notification.notification_type !== typeFilter) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read_at).length;
  const notificationTypes = Array.from(new Set(notifications.map(n => n.notification_type)));

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
        <p className="text-gray-500">
          You have no lock-related notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'type')}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="all">All ({notifications.length})</option>
              <option value="unread">Unread ({unreadCount})</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="all">All Types</option>
              {notificationTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {filteredNotifications.length} notifications
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              border-l-4 border border-gray-200 rounded-lg p-4 transition-colors
              ${getNotificationColor(notification.notification_type)}
              ${!notification.read_at ? 'shadow-sm' : 'opacity-75'}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.notification_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h4>
                    {!notification.read_at && (
                      <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>
                      Resource: {notification.resource_id.substring(0, 8)}...
                    </span>
                    <span>
                      {formatRelativeTime(notification.sent_at)}
                    </span>
                    <span className="capitalize">
                      {notification.notification_type.replace('_', ' ')}
                    </span>
                  </div>
                  {notification.action_url && (
                    <a
                      href={notification.action_url}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
                    >
                      View Details →
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!notification.read_at && (
                  <button
                    onClick={() => onMarkAsRead(notification.id)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <span className="text-xs text-gray-400">
                  {new Date(notification.sent_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No notifications match your current filter.
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-500">Total</div>
            <div className="font-medium text-gray-900">{notifications.length}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Unread</div>
            <div className="font-medium text-gray-900">{unreadCount}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Types</div>
            <div className="font-medium text-gray-900">{notificationTypes.length}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Today</div>
            <div className="font-medium text-gray-900">
              {notifications.filter(n => 
                new Date(n.sent_at).toDateString() === new Date().toDateString()
              ).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};