import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageCircle, 
  AtSign, 
  CheckCircle, 
  GitBranch, 
  Users, 
  AlertCircle,
  Trash2,
  Check,
  ExternalLink
} from 'lucide-react';
import { Notification, NotificationType } from '../../types/NotificationTypes';
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'comment':
      return MessageCircle;
    case 'mention':
      return AtSign;
    case 'approval':
      return CheckCircle;
    case 'workflow':
      return GitBranch;
    case 'collaboration':
      return Users;
    case 'system':
      return AlertCircle;
    default:
      return AlertCircle;
  }
};
const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'comment':
      return 'text-blue-500';
    case 'mention':
      return 'text-purple-500';
    case 'approval':
      return 'text-green-500';
    case 'workflow':
      return 'text-orange-500';
    case 'collaboration':
      return 'text-indigo-500';
    case 'system':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};
const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ )
  notification, 
  onMarkAsRead, 
  onDelete 
}) => {
  const IconComponent = getNotificationIcon(notification.type);
  const iconColor = getNotificationColor(notification.type);
  const isUnread = !notification.read_at;
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUnread) {
      onMarkAsRead(notification.id);
    }
  };
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };
  const handleClick = () => {
    if (isUnread) {
      onMarkAsRead(notification.id);
    }
    // Navigate to the notification target if available
    if (notification.action_url) {
      window.open(notification.action_url, '_blank');
    }
  };
  return ()
    <div
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
        isUnread ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={`flex-shrink-0 p-1 ${iconColor}`}>}
          <Icon className="w-4 h-4" />
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h4 className={`text-sm font-medium ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>}
                {notification.title}
              </h4>
              {/* Priority Badge */}
              {notification.priority && notification.priority !== 'low' && ()
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(notification.priority)}`}>}
                  {notification.priority}
                </span>
              )}
              {/* Unread Indicator */}
              {isUnread && ()
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </div>
            {/* Timestamp */}
            <div className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </div>
          </div>
          {/* Message */}
          <p className={`text-sm mt-1 ${isUnread ? 'text-gray-800' : 'text-gray-600'}`}>}
            {notification.message}
          </p>
          {/* Metadata */}
          {notification.metadata && ()
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              {notification.metadata.project_name && ()
                <span>Project: {notification.metadata.project_name}</span>
              )}
              {notification.metadata.workspace_name && ()
                <span>Workspace: {notification.metadata.workspace_name}</span>
              )}
              {notification.metadata.actor_name && ()
                <span>By: {notification.metadata.actor_name}</span>
              )}
            </div>
          )}
          {/* Actions */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              {notification.action_url && ()
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(notification.action_url, '_blank');
                  }}
                  className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View</span>
                </button>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {/* Mark as Read/Unread */}
              {isUnread && ()
                <button
                  onClick={handleMarkAsRead}
                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-3 h-3" />
                </button>
              )}
              {/* Delete */}
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete notification"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;