import React, { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, X, Check, CheckCheck, Filter, Settings } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { NotificationPreferences } from './NotificationPreferences';
import { NotificationType, NotificationPriority } from '../../types/NotificationTypes';
interface NotificationCenterProps {
  userId: string;
  workspaceId?: string;
  className?: string;
}
const NotificationCenter: React.FC<NotificationCenterProps> = ({ )
  userId, 
  workspaceId, 
  className 
}) => {
  const [showPreferences, setShowPreferences] = useState(false);
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    realTimeConnection
  } = useNotifications(userId, workspaceId);
  const filteredNotifications = notifications.filter(notification => {)
    if (showUnreadOnly && notification.read_at) return false;
    if (filter !== 'all' && notification.type !== filter) return false;
    return true;
  });
  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    await markAsRead(notificationId);
  }, [markAsRead]);
  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);
  const handleDelete = useCallback(async (notificationId: string) => {
    await deleteNotification(notificationId);
  }, [deleteNotification]);
  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      refreshNotifications();
    }
  };
  // Real-time connection status indicator
  const connectionStatus = realTimeConnection?.status || 'disconnected';
  return ()
    <div className={`relative ${className}`}>}
      {/* Notification Bell Button */}
      <button
        onClick={toggleOpen}
        className={`relative p-2 rounded-lg transition-colors ${
          isOpen 
            ? 'bg-blue-100 text-blue-600' 
            : 'hover:bg-gray-100 text-gray-600'
        }`}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        {unreadCount > 0 ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        {/* Unread Badge */}
        {unreadCount > 0 && ()
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {/* Connection Status Indicator */}
        <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${
          connectionStatus === 'connected' ? 'bg-green-400' :
          connectionStatus === 'connecting' ? 'bg-yellow-400' :
          'bg-red-400'
        }`} />
      </button>
      {/* Notification Dropdown */}
      {isOpen && ()
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
                {unreadCount > 0 && ()
                  <span className="ml-2 text-sm text-gray-500">
                    ({unreadCount} unread)
                  </span>
                )}
              </h3>
              <div className="flex items-center space-x-2">
                {/* Mark All Read */}
                {unreadCount > 0 && ()
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                {/* Preferences */}
                <button
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Notification preferences"
                >
                  <Settings className="w-4 h-4" />
                </button>
                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Filters */}
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as NotificationType | 'all')}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All Types</option>
                  <option value="comment">Comments</option>
                  <option value="mention">Mentions</option>
                  <option value="approval">Approvals</option>
                  <option value="workflow">Workflow</option>
                  <option value="collaboration">Collaboration</option>
                  <option value="system">System</option>
                </select>
              </div>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span>Unread only</span>
              </label>
            </div>
          </div>
          {/* Preferences Panel */}
          {showPreferences && ()
            <div className="border-b border-gray-200">
              <NotificationPreferences
                userId={userId}
                workspaceId={workspaceId}
                onClose={() => setShowPreferences(false)}
              />
            </div>
          )}
          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {loading && ()
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            )}
            {error && ()
              <div className="p-4 text-center text-red-500">
                Error loading notifications: {error.message}
              </div>
            )}
            {!loading && !error && filteredNotifications.length === 0 && ()
              <div className="p-4 text-center text-gray-500">
                {showUnreadOnly ? 'No unread notifications' : 'No notifications'}
              </div>
            )}
            {!loading && !error && filteredNotifications.map((notification) => ()
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
          {/* Footer */}
          {filteredNotifications.length > 0 && ()
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={refreshNotifications}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;