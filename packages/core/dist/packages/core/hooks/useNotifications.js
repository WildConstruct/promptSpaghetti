import { useState, useEffect, useCallback, useRef } from 'react';
userId: string;
workspaceId ?  : string;
UseNotificationsReturn => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [filter, setFilterState] = useState('all');
    const [unreadOnly, setUnreadOnlyState] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [cursor, setCursor] = useState();
    // Real-time connection state
    const [realTimeConnection, setRealTimeConnection] = useState({
        status: 'disconnected',
        reconnectAttempts: 0
    });
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    // API base URL
    const apiBase = '/api/notifications';
    // Fetch notifications from API
    const fetchNotifications = useCallback(async (reset = false) => {
        try {
            if (reset) {
                setLoading(true);
                setCursor(undefined);
            }
            const params = new URLSearchParams({
                userId,
                ...(workspaceId && { workspaceId }),
                ...(filter !== 'all' && { type: filter }),
                ...(unreadOnly && { unread: 'true' }),
                ...(cursor && !reset && { cursor })
            });
            const response = await fetch(`${apiBase}?${params}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch notifications: ${response.statusText}`);
            }
            const data = await response.json();
            if (reset) {
                setNotifications(data.notifications);
            }
            else {
                setNotifications(prev => [...prev, ...data.notifications]);
            }
            setUnreadCount(data.unread_count);
            setHasMore(data.has_more);
            setCursor(data.next_cursor);
            setError(null);
        }
        catch (err) {
            setError(err);
            console.error('Failed to fetch notifications:', err);
        }
        finally {
            setLoading(false);
        }
    }, [userId, workspaceId, filter, unreadOnly, cursor]);
    // Fetch notification stats
    const fetchStats = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                userId,
                ...(workspaceId && { workspaceId })
            });
            const response = await fetch(`${apiBase}/stats?${params}`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        }
        catch (err) {
            console.error('Failed to fetch notification stats:', err);
        }
    }, [userId, workspaceId]);
    // Mark notification as read
    const markAsRead = useCallback(async (id) => {
        try {
            const response = await fetch(`${apiBase}/${id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to mark notification as read');
            }
            // Update local state
            setNotifications(prev => prev.map(notification => notification.id === id
                ? { ...notification, read_at: new Date().toISOString() }
                : notification));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        catch (err) {
            console.error('Failed to mark notification as read:', err);
            throw err;
        }
    }, []);
    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                userId,
                ...(workspaceId && { workspaceId })
            });
            const response = await fetch(`${apiBase}/read-all?${params}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to mark all notifications as read');
            }
            // Update local state
            const now = new Date().toISOString();
            setNotifications(prev => prev.map(notification => ({ ...notification, read_at: now })));
            setUnreadCount(0);
        }
        catch (err) {
            console.error('Failed to mark all notifications as read:', err);
            throw err;
        }
    }, [userId, workspaceId]);
    // Delete notification
    const deleteNotification = useCallback(async (id) => {
        try {
            const response = await fetch(`${apiBase}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete notification');
            }
            // Update local state
            const deletedNotification = notifications.find(n => n.id === id);
            setNotifications(prev => prev.filter(notification => notification.id !== id));
            if (deletedNotification && !deletedNotification.read_at) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        }
        catch (err) {
            console.error('Failed to delete notification:', err);
            throw err;
        }
    }, [notifications]);
    // Refresh notifications
    const refreshNotifications = useCallback(async () => {
        await fetchNotifications(true);
        await fetchStats();
    }, [fetchNotifications, fetchStats]);
    // Load more notifications
    const loadMore = useCallback(async () => {
        if (!hasMore || loading)
            return;
        await fetchNotifications(false);
    }, [hasMore, loading, fetchNotifications]);
    // Set filter
    const setFilter = useCallback((newFilter) => {
        setFilterState(newFilter);
    }, []);
    // Set unread only
    const setUnreadOnly = useCallback((newUnreadOnly) => {
        setUnreadOnlyState(newUnreadOnly);
    }, []);
    // WebSocket connection management
    const connectWebSocket = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }
        setRealTimeConnection(prev => ({
            ...prev,
            status: 'connecting'
        }));
        const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/notifications`;
        const ws = new WebSocket(`${wsUrl}?userId=${userId}${workspaceId ? `&workspaceId=${workspaceId}` : ''}`);
        ws.onopen = () => {
            setRealTimeConnection({
                status: 'connected',
                lastConnected: new Date(),
                reconnectAttempts: 0
            });
            // Clear any pending reconnect timeout
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        };
        ws.onmessage = (event) => {
            try {
                const notificationEvent = JSON.parse(event.data);
                switch (notificationEvent.type) {
                    case 'notification_created':
                        setNotifications(prev => [notificationEvent.notification, ...prev]);
                        if (!notificationEvent.notification.read_at) {
                            setUnreadCount(prev => prev + 1);
                        }
                        break;
                    case 'notification_updated':
                        setNotifications(prev => prev.map(n => n.id === notificationEvent.notification.id
                            ? notificationEvent.notification
                            : n));
                        break;
                    case 'notification_deleted':
                        const deletedNotification = notifications.find(n => n.id === notificationEvent.notification.id);
                        setNotifications(prev => prev.filter(n => n.id !== notificationEvent.notification.id));
                        if (deletedNotification && !deletedNotification.read_at) {
                            setUnreadCount(prev => Math.max(0, prev - 1));
                        }
                        break;
                }
                // Refresh stats
                fetchStats();
            }
            catch (err) {
                console.error('Failed to parse WebSocket message:', err);
            }
        };
        ws.onclose = () => {
            setRealTimeConnection(prev => ({
                ...prev,
                status: 'disconnected'
            }));
            // Attempt to reconnect with exponential backoff
            const reconnectDelay = Math.min(1000 * Math.pow(2, realTimeConnection.reconnectAttempts), 30000);
            reconnectTimeoutRef.current = setTimeout(() => {
                setRealTimeConnection(prev => ({
                    ...prev,
                    reconnectAttempts: prev.reconnectAttempts + 1
                }));
                connectWebSocket();
            }, reconnectDelay);
        };
        ws.onerror = (error) => {
            setRealTimeConnection(prev => ({
                ...prev,
                status: 'error',
                error: 'WebSocket connection error'
            }));
        };
        wsRef.current = ws;
    }, [userId, workspaceId, realTimeConnection.reconnectAttempts, notifications, fetchStats]);
    // Initialize data and WebSocket connection
    useEffect(() => {
        refreshNotifications();
        connectWebSocket();
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, []);
    // Refetch when filter or unreadOnly changes
    useEffect(() => {
        fetchNotifications(true);
    }, [filter, unreadOnly]);
    return {
        notifications,
        unreadCount,
        loading,
        error,
        stats,
        realTimeConnection,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
        loadMore,
        setFilter,
        setUnreadOnly
    };
};
