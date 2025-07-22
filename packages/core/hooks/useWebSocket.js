import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { WebSocketClient } from '../websocket/WebSocketClient';
const DEFAULT_CONFIG = {
    reconnectInterval: 1000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000,
    connectionTimeout: 10000,
    enableOfflineQueue: true
};
export function useWebSocket(options) {
    const { url = 'ws://localhost:8001', documentId, userId = 'anonymous', authToken, enabled = true, reconnectInterval = DEFAULT_CONFIG.reconnectInterval, maxReconnectAttempts = DEFAULT_CONFIG.maxReconnectAttempts, onGraphUpdate, onPresenceUpdate, onUserJoin, onUserLeave, onError } = options;
    const [connectionState, setConnectionState] = useState({
        status: 'disconnected',
        reconnectAttempts: 0
    });
    const [queuedMessages, setQueuedMessages] = useState(0);
    const clientRef = useRef(null);
    const optionsRef = useRef(options);
    // Update options ref when options change
    useEffect(() => {
        optionsRef.current = options;
    }, [options]);
    // Initialize WebSocket client
    useEffect(() => {
        if (!enabled || !documentId) {
            return;
        }
        const config = {
            url,
            reconnectInterval: reconnectInterval || DEFAULT_CONFIG.reconnectInterval,
            maxReconnectAttempts: maxReconnectAttempts || DEFAULT_CONFIG.maxReconnectAttempts,
            heartbeatInterval: DEFAULT_CONFIG.heartbeatInterval,
            connectionTimeout: DEFAULT_CONFIG.connectionTimeout,
            enableOfflineQueue: DEFAULT_CONFIG.enableOfflineQueue,
            authToken
        };
        const client = new WebSocketClient(config);
        clientRef.current = client;
        // Set up event listeners
        const handleConnectionStateChange = () => {
            setConnectionState(client.getConnectionState());
            setQueuedMessages(client.getQueuedMessagesCount());
        };
        client.on('connected', handleConnectionStateChange);
        client.on('disconnected', handleConnectionStateChange);
        client.on('authenticated', handleConnectionStateChange);
        client.on('reconnecting', handleConnectionStateChange);
        client.on('reconnect_failed', handleConnectionStateChange);
        client.on('auth_error', handleConnectionStateChange);
        client.on('graph_update', (update) => {
            optionsRef.current.onGraphUpdate?.(update);
        });
        client.on('presence_update', (presence) => {
            optionsRef.current.onPresenceUpdate?.(presence);
        });
        client.on('user_join', (user) => {
            optionsRef.current.onUserJoin?.(user);
        });
        client.on('user_leave', (user) => {
            optionsRef.current.onUserLeave?.(user);
        });
        client.on('error', (error) => {
            optionsRef.current.onError?.(error);
        });
        // Auto-connect if enabled
        if (enabled) {
            client.connect(documentId, userId).catch((error) => {
                console.error('Failed to connect WebSocket:', error);
                optionsRef.current.onError?.(error);
            });
        }
        return () => {
            client.disconnect();
            client.removeAllListeners();
            clientRef.current = null;
        };
    }, [url, documentId, userId, authToken, enabled, reconnectInterval, maxReconnectAttempts]);
    const sendGraphUpdate = useCallback((update) => {
        return clientRef.current?.sendGraphUpdate(update) || false;
    }, []);
    const sendPresenceUpdate = useCallback((presence) => {
        return clientRef.current?.sendPresenceUpdate(presence) || false;
    }, []);
    const connect = useCallback(async () => {
        if (clientRef.current && documentId) {
            await clientRef.current.connect(documentId, userId);
        }
    }, [documentId, userId]);
    const disconnect = useCallback(() => {
        clientRef.current?.disconnect();
    }, []);
    const clearQueue = useCallback(() => {
        clientRef.current?.clearMessageQueue();
        setQueuedMessages(0);
    }, []);
    return {
        connectionState,
        isConnected: connectionState.status === 'authenticated' || connectionState.status === 'connected',
        isConnecting: connectionState.status === 'connecting' || connectionState.status === 'authenticating',
        sendGraphUpdate,
        sendPresenceUpdate,
        connect,
        disconnect,
        queuedMessages,
        clearQueue
    };
}
// Enhanced hook for managing user presence
export function usePresence(documentId, userId, userName, userAvatar) {
    const [cursor, setCursor] = useState(null);
    const [selection, setSelection] = useState([]);
    const [currentTool, setCurrentTool] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [focusedNodeId, setFocusedNodeId] = useState('');
    // Other users' presence data
    const [otherUsers, setOtherUsers] = useState(new Map());
    const [userCursors, setUserCursors] = useState(new Map());
    const [userSelections, setUserSelections] = useState(new Map());
    const [userActivity, setUserActivity] = useState(new Map());
    const { sendCursorUpdate, sendSelectionUpdate, sendActivityUpdate, requestPresenceData, isConnected } = useWebSocket({
        documentId,
        userId,
        authToken: undefined, // Add your auth token here
        onPresenceSync: (data) => {
            const usersMap = new Map();
            data.users.forEach((user) => {
                usersMap.set(user.userId, user);
            });
            setOtherUsers(usersMap);
        },
        onPresenceUpdate: (presence) => {
            if (presence.userId !== userId) {
                setOtherUsers(prev => new Map(prev.set(presence.userId, presence)));
            }
        },
        onCursorUpdate: (data) => {
            if (data.userId !== userId) {
                setUserCursors(prev => new Map(prev.set(data.userId, data.cursor)));
            }
        },
        onSelectionUpdate: (data) => {
            if (data.userId !== userId) {
                setUserSelections(prev => new Map(prev.set(data.userId, data.selection)));
            }
        },
        onActivityUpdate: (data) => {
            if (data.userId !== userId) {
                setUserActivity(prev => new Map(prev.set(data.userId, {
                    currentTool: data.currentTool,
                    isTyping: data.isTyping,
                    focusedNodeId: data.focusedNodeId
                })));
            }
        },
        onUserJoin: (user) => {
            // User will be added via presence_sync
        },
        onUserLeave: (user) => {
            setOtherUsers(prev => {
                const next = new Map(prev);
                next.delete(user.userId);
                return next;
            });
            setUserCursors(prev => {
                const next = new Map(prev);
                next.delete(user.userId);
                return next;
            });
            setUserSelections(prev => {
                const next = new Map(prev);
                next.delete(user.userId);
                return next;
            });
            setUserActivity(prev => {
                const next = new Map(prev);
                next.delete(user.userId);
                return next;
            });
        },
        onUserStatusChanged: (data) => {
            setOtherUsers(prev => {
                const user = prev.get(data.userId);
                if (user) {
                    return new Map(prev.set(data.userId, { ...user, status: data.status }));
                }
                return prev;
            });
        }
    });
    // Request presence data when connected
    useEffect(() => {
        if (isConnected) {
            requestPresenceData();
        }
    }, [isConnected, requestPresenceData]);
    const updateCursor = useCallback((x, y, nodeId, viewportBounds) => {
        setCursor({ x, y, nodeId });
        sendCursorUpdate(x, y, nodeId, viewportBounds);
    }, [sendCursorUpdate]);
    const updateSelection = useCallback((newSelection) => {
        setSelection(newSelection);
        sendSelectionUpdate(newSelection);
    }, [sendSelectionUpdate]);
    const updateActivity = useCallback((tool, typing, focusedNode) => {
        if (tool !== undefined)
            setCurrentTool(tool);
        if (typing !== undefined)
            setIsTyping(typing);
        if (focusedNode !== undefined)
            setFocusedNodeId(focusedNode);
        sendActivityUpdate(tool !== undefined ? tool : currentTool, typing !== undefined ? typing : isTyping, focusedNode !== undefined ? focusedNode : focusedNodeId);
    }, [currentTool, isTyping, focusedNodeId, sendActivityUpdate]);
    // Auto-clear typing indicator
    useEffect(() => {
        if (isTyping) {
            const timeout = setTimeout(() => {
                setIsTyping(false);
                sendActivityUpdate(currentTool, false, focusedNodeId);
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [isTyping, currentTool, focusedNodeId, sendActivityUpdate]);
    // Combine all user data
    const allUsers = useMemo(() => {
        const users = [];
        for (const [userId, userData] of otherUsers) {
            const cursor = userCursors.get(userId);
            const selection = userSelections.get(userId);
            const activity = userActivity.get(userId);
            users.push({
                ...userData,
                cursor,
                selection: selection?.nodeIds || [],
                currentTool: activity?.currentTool,
                isTyping: activity?.isTyping,
                focusedNodeId: activity?.focusedNodeId
            });
        }
        return users;
    }, [otherUsers, userCursors, userSelections, userActivity]);
    return {
        // Current user state
        cursor,
        selection,
        currentTool,
        isTyping,
        focusedNodeId,
        // Other users
        otherUsers: allUsers,
        userCursors: Array.from(userCursors.entries()),
        userSelections: Array.from(userSelections.entries()),
        typingUsers: allUsers.filter(user => user.isTyping),
        // Actions
        updateCursor,
        updateSelection,
        updateActivity
    };
}
