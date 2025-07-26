import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { Bell, BellOff, X, CheckCheck, Filter, Settings } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { NotificationPreferences } from './NotificationPreferences';
export const NotificationCenter = ({ userId, workspaceId, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);
    const [filter, setFilter] = useState('all');
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);
    const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead, deleteNotification, refreshNotifications, realTimeConnection } = useNotifications(userId, workspaceId);
    const filteredNotifications = notifications.filter(notification => {
        if (showUnreadOnly && notification.read_at)
            return false;
        if (filter !== 'all' && notification.type !== filter)
            return false;
        return true;
    });
    const handleMarkAsRead = useCallback(async (notificationId) => {
        await markAsRead(notificationId);
    }, [markAsRead]);
    const handleMarkAllAsRead = useCallback(async () => {
        await markAllAsRead();
    }, [markAllAsRead]);
    const handleDelete = useCallback(async (notificationId) => {
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
    return (_jsxs("div", { className: `relative ${className}`, children: [_jsxs("button", { onClick: toggleOpen, className: `relative p-2 rounded-lg transition-colors ${isOpen
                    ? 'bg-blue-100 text-blue-600'
                    : 'hover:bg-gray-100 text-gray-600'}`, "aria-label": `Notifications (${unreadCount} unread)`, children: [unreadCount > 0 ? _jsx(Bell, { className: "w-5 h-5" }) : _jsx(BellOff, { className: "w-5 h-5" }), unreadCount > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center", children: unreadCount > 99 ? '99+' : unreadCount })), _jsx("div", { className: `absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' :
                            connectionStatus === 'connecting' ? 'bg-yellow-400' :
                                'bg-red-400'}` })] }), isOpen && (_jsxs("div", { className: "absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900", children: ["Notifications", unreadCount > 0 && (_jsxs("span", { className: "ml-2 text-sm text-gray-500", children: ["(", unreadCount, " unread)"] }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [unreadCount > 0 && (_jsx("button", { onClick: handleMarkAllAsRead, className: "p-1 text-gray-400 hover:text-gray-600 transition-colors", title: "Mark all as read", children: _jsx(CheckCheck, { className: "w-4 h-4" }) })), _jsx("button", { onClick: () => setShowPreferences(!showPreferences), className: "p-1 text-gray-400 hover:text-gray-600 transition-colors", title: "Notification preferences", children: _jsx(Settings, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setIsOpen(false), className: "p-1 text-gray-400 hover:text-gray-600 transition-colors", children: _jsx(X, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { className: "flex items-center space-x-4 mt-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Filter, { className: "w-4 h-4 text-gray-400" }), _jsxs("select", { value: filter, onChange: (e) => setFilter(e.target.value), className: "text-sm border border-gray-300 rounded px-2 py-1", children: [_jsx("option", { value: "all", children: "All Types" }), _jsx("option", { value: "comment", children: "Comments" }), _jsx("option", { value: "mention", children: "Mentions" }), _jsx("option", { value: "approval", children: "Approvals" }), _jsx("option", { value: "workflow", children: "Workflow" }), _jsx("option", { value: "collaboration", children: "Collaboration" }), _jsx("option", { value: "system", children: "System" })] })] }), _jsxs("label", { className: "flex items-center space-x-2 text-sm", children: [_jsx("input", { type: "checkbox", checked: showUnreadOnly, onChange: (e) => setShowUnreadOnly(e.target.checked), className: "rounded border-gray-300" }), _jsx("span", { children: "Unread only" })] })] })] }), showPreferences && (_jsx("div", { className: "border-b border-gray-200", children: _jsx(NotificationPreferences, { userId: userId, workspaceId: workspaceId, onClose: () => setShowPreferences(false) }) })), _jsxs("div", { className: "max-h-64 overflow-y-auto", children: [loading && (_jsx("div", { className: "p-4 text-center text-gray-500", children: "Loading notifications..." })), error && (_jsxs("div", { className: "p-4 text-center text-red-500", children: ["Error loading notifications: ", error.message] })), !loading && !error && filteredNotifications.length === 0 && (_jsx("div", { className: "p-4 text-center text-gray-500", children: showUnreadOnly ? 'No unread notifications' : 'No notifications' })), !loading && !error && filteredNotifications.map((notification) => (_jsx(NotificationItem, { notification: notification, onMarkAsRead: handleMarkAsRead, onDelete: handleDelete }, notification.id)))] }), filteredNotifications.length > 0 && (_jsx("div", { className: "p-3 border-t border-gray-200 text-center", children: _jsx("button", { onClick: refreshNotifications, className: "text-sm text-blue-600 hover:text-blue-800 transition-colors", children: "Refresh" }) }))] }))] }));
};
