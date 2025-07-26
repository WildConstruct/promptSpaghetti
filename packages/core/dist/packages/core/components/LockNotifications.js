import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Epic 9.4.3 - Lock Notifications Component
// Display and manage lock-related notifications
import { useState } from 'react';
import { Bell, Clock, Lock, AlertTriangle, Check, Filter } from 'lucide-react';
export const LockNotifications = ({ notifications, onMarkAsRead }) => {
    const [filter, setFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'acquired':
                return _jsx(Lock, { className: "h-4 w-4 text-green-500" });
            case 'released':
                return _jsx(Check, { className: "h-4 w-4 text-blue-500" });
            case 'broken':
                return _jsx(AlertTriangle, { className: "h-4 w-4 text-red-500" });
            case 'conflict':
                return _jsx(AlertTriangle, { className: "h-4 w-4 text-orange-500" });
            case 'queue_position':
                return _jsx(Clock, { className: "h-4 w-4 text-blue-500" });
            case 'expiring':
                return _jsx(Clock, { className: "h-4 w-4 text-amber-500" });
            default:
                return _jsx(Bell, { className: "h-4 w-4 text-gray-500" });
        }
    };
    const getNotificationColor = (type) => {
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
        if (filter === 'unread' && notification.read_at)
            return false;
        if (typeFilter !== 'all' && notification.notification_type !== typeFilter)
            return false;
        return true;
    });
    const unreadCount = notifications.filter(n => !n.read_at).length;
    const notificationTypes = Array.from(new Set(notifications.map(n => n.notification_type)));
    const formatRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (minutes < 1)
            return 'Just now';
        if (minutes < 60)
            return `${minutes}m ago`;
        if (hours < 24)
            return `${hours}h ago`;
        return `${days}d ago`;
    };
    if (notifications.length === 0) {
        return (_jsxs("div", { className: "text-center py-8", children: [_jsx(Bell, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Notifications" }), _jsx("p", { className: "text-gray-500", children: "You have no lock-related notifications." })] }));
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Filter, { className: "h-4 w-4 text-gray-400" }), _jsxs("select", { value: filter, onChange: (e) => setFilter(e.target.value), className: "border border-gray-300 rounded px-3 py-1 text-sm", children: [_jsxs("option", { value: "all", children: ["All (", notifications.length, ")"] }), _jsxs("option", { value: "unread", children: ["Unread (", unreadCount, ")"] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Type:" }), _jsxs("select", { value: typeFilter, onChange: (e) => setTypeFilter(e.target.value), className: "border border-gray-300 rounded px-3 py-1 text-sm", children: [_jsx("option", { value: "all", children: "All Types" }), notificationTypes.map(type => (_jsx("option", { value: type, children: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }, type)))] })] })] }), _jsxs("div", { className: "text-sm text-gray-500", children: [filteredNotifications.length, " notifications"] })] }), _jsx("div", { className: "space-y-2", children: filteredNotifications.map((notification) => (_jsx("div", { className: `
              border-l-4 border border-gray-200 rounded-lg p-4 transition-colors
              ${getNotificationColor(notification.notification_type)}
              ${!notification.read_at ? 'shadow-sm' : 'opacity-75'}
            `, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start space-x-3 flex-1", children: [_jsx("div", { className: "flex-shrink-0 mt-1", children: getNotificationIcon(notification.notification_type) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: notification.title }), !notification.read_at && (_jsx("span", { className: "h-2 w-2 bg-blue-500 rounded-full" }))] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: notification.message }), _jsxs("div", { className: "flex items-center space-x-4 mt-2 text-xs text-gray-500", children: [_jsxs("span", { children: ["Resource: ", notification.resource_id.substring(0, 8), "..."] }), _jsx("span", { children: formatRelativeTime(notification.sent_at) }), _jsx("span", { className: "capitalize", children: notification.notification_type.replace('_', ' ') })] }), notification.action_url && (_jsx("a", { href: notification.action_url, className: "text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block", children: "View Details \u2192" }))] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [!notification.read_at && (_jsx("button", { onClick: () => onMarkAsRead(notification.id), className: "p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded", title: "Mark as read", children: _jsx(Check, { className: "h-4 w-4" }) })), _jsx("span", { className: "text-xs text-gray-400", children: new Date(notification.sent_at).toLocaleString() })] })] }) }, notification.id))) }), filteredNotifications.length === 0 && (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No notifications match your current filter." })), _jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-gray-500", children: "Total" }), _jsx("div", { className: "font-medium text-gray-900", children: notifications.length })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-gray-500", children: "Unread" }), _jsx("div", { className: "font-medium text-gray-900", children: unreadCount })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-gray-500", children: "Types" }), _jsx("div", { className: "font-medium text-gray-900", children: notificationTypes.length })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-gray-500", children: "Today" }), _jsx("div", { className: "font-medium text-gray-900", children: notifications.filter(n => new Date(n.sent_at).toDateString() === new Date().toDateString()).length })] })] }) })] }));
};
