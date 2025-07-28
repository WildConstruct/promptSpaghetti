import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { WebSocketClient, WebSocketClientConfig, ConnectionState } from '../websocket/WebSocketClient';
import { GraphUpdatePayload, PresenceUpdatePayload } from '../../../server/src/websocket/types';

export interface UseWebSocketOptions {
  url?: string;
  documentId: string;
  userId?: string;
  authToken?: string;
  enabled?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onGraphUpdate?: (update: GraphUpdatePayload) => void;
  onPresenceUpdate?: (presence: PresenceUpdatePayload) => void;
  onUserJoin?: (user: any) => void;
  onUserLeave?: (user: any) => void;
  onError?: (error: any) => void;
}
export interface UseWebSocketReturn {
  connectionState: ConnectionState;,
  isConnected: boolean;
  isConnecting: boolean;,
  sendGraphUpdate: (update: GraphUpdatePayload) => boolean;,
  sendPresenceUpdate: (presence: PresenceUpdatePayload) => boolean;,
  connect: () => Promise<void>;
  disconnect: () => void;,
  queuedMessages: number;
  clearQueue: () => void;
  const DEFAULT_CONFIG: Partial<WebSocketClientConfig> = {,
  reconnectInterval: 1000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
  connectionTimeout: 10000,
  enableOfflineQueue: true,
};
}
export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
  url = 'ws://localhost:8001',
  documentId,
  userId = 'anonymous',
  authToken,
  enabled = true,
  reconnectInterval = DEFAULT_CONFIG.reconnectInterval,
  maxReconnectAttempts = DEFAULT_CONFIG.maxReconnectAttempts,
  onGraphUpdate,
  onPresenceUpdate,
  onUserJoin,
  onUserLeave,
  onError
} = options;
  const [connectionState, setConnectionState] = useState<ConnectionState>({)
  status: 'disconnected',
  reconnectAttempts: 0,
});
  const [queuedMessages, setQueuedMessages] = useState(0);
  const clientRef = useRef<WebSocketClient | null>(null);
  const optionsRef = useRef(options);
  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  // Initialize WebSocket client
  useEffect(() => {
  if (!enabled || !documentId) {
  return;
  const config: WebSocketClientConfig = {,
  url,
  reconnectInterval: reconnectInterval || DEFAULT_CONFIG.reconnectInterval!,
  maxReconnectAttempts: maxReconnectAttempts || DEFAULT_CONFIG.maxReconnectAttempts!,
  heartbeatInterval: DEFAULT_CONFIG.heartbeatInterval!,
  connectionTimeout: DEFAULT_CONFIG.connectionTimeout!,
  enableOfflineQueue: DEFAULT_CONFIG.enableOfflineQueue!,
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
    client.on('graph_update', (update: GraphUpdatePayload) => {
      optionsRef.current.onGraphUpdate?.(update);
    });
    client.on('presence_update', (presence: PresenceUpdatePayload) => {
      optionsRef.current.onPresenceUpdate?.(presence);
    });
    client.on('user_join', (user: any) => {
      optionsRef.current.onUserJoin?.(user);
    });
    client.on('user_leave', (user: any) => {
      optionsRef.current.onUserLeave?.(user);
    });
    client.on('error', (error: any) => {
      optionsRef.current.onError?.(error);
    });
    // Auto-connect if enabled
    if (enabled) {
  client.connect(documentId, userId).catch((error) => {
  console.error('Failed to connect WebSocket:', error);
  optionsRef.current.onError?.(error);
});
    return () => {
      client.disconnect();
      client.removeAllListeners();
      clientRef.current = null;
    };
  }, [url, documentId, userId, authToken, enabled, reconnectInterval, maxReconnectAttempts]);
  const sendGraphUpdate = useCallback((update: GraphUpdatePayload): boolean => {
    return clientRef.current?.sendGraphUpdate(update) || false;
  }, []);
  const sendPresenceUpdate = useCallback((presence: PresenceUpdatePayload): boolean => {
    return clientRef.current?.sendPresenceUpdate(presence) || false;
  }, []);
  const connect = useCallback(async (): Promise<void> => {
    if (clientRef.current && documentId) {
      await clientRef.current.connect(documentId, userId);
  }, [documentId, userId]);
  const disconnect = useCallback((): void => {
    clientRef.current?.disconnect();
  }, []);
  const clearQueue = useCallback((): void => {
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

// Enhanced hook for managing user presence
export function usePresence(documentId: string, userId: string, userName?: string, userAvatar?: string) {
  const [cursor, setCursor] = useState<{ x: number; y: number; nodeId?: string } | null>(null);
  const [selection, setSelection] = useState<string>([]);
  const [currentTool, setCurrentTool] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [focusedNodeId, setFocusedNodeId] = useState<string>('');
  // Other users' presence data
  const [otherUsers, setOtherUsers] = useState<Map<string, any>>(new Map());
  const [userCursors, setUserCursors] = useState<Map<string, any>>(new Map());
  const [userSelections, setUserSelections] = useState<Map<string, any>>(new Map());
  const [userActivity, setUserActivity] = useState<Map<string, any>>(new Map());
  const { 
    sendCursorUpdate, 
    sendSelectionUpdate, 
    sendActivityUpdate,
    requestPresenceData,
    isConnected 
  } = useWebSocket({)
  documentId,
  userId,
  authToken: undefined, // Add your auth token here,
  onPresenceSync: (data) => {,
  const usersMap = new Map();
  data.users.forEach((user: any) => {,
  usersMap.set(user.userId, user);
});
      setOtherUsers(usersMap);
  },
  onPresenceUpdate: (presence) => {,
      if (presence.userId !== userId) {
        setOtherUsers(prev => new Map(prev.set(presence.userId, presence)));
  },
  onCursorUpdate: (data) => {,
      if (data.userId !== userId) {
        setUserCursors(prev => new Map(prev.set(data.userId, data.cursor)));
  },
  onSelectionUpdate: (data) => {,
      if (data.userId !== userId) {
        setUserSelections(prev => new Map(prev.set(data.userId, data.selection)));
  },
  onActivityUpdate: (data) => {,
  if (data.userId !== userId) {
  setUserActivity(prev => new Map(prev.set(data.userId, {)
  currentTool: data.currentTool,
  isTyping: data.isTyping,
  focusedNodeId: data.focusedNodeId,
})));
  },
  onUserJoin: (user) => {,
      // User will be added via presence_sync
  },
  onUserLeave: (user) => {,
      setOtherUsers(prev => {)
  const next = new Map(prev);
        next.delete(user.userId);
        return next;
      });
      setUserCursors(prev => {)
  const next = new Map(prev);
        next.delete(user.userId);
        return next;
      });
      setUserSelections(prev => {)
  const next = new Map(prev);
        next.delete(user.userId);
        return next;
      });
      setUserActivity(prev => {)
  const next = new Map(prev);
        next.delete(user.userId);
        return next;
      });
  },
  onUserStatusChanged: (data) => {,
      setOtherUsers(prev => {)
  const user = prev.get(data.userId);
        if (user) {
          return new Map(prev.set(data.userId, { ...user, status: data.status }));
        return prev;
      });
  });
  // Request presence data when connected
  useEffect(() => {
    if (isConnected) {
      requestPresenceData();
  }, [isConnected, requestPresenceData]);
  const updateCursor = useCallback((x: number, y: number, nodeId?: string, viewportBounds?: any) => {
    setCursor({ x, y, nodeId });
    sendCursorUpdate(x, y, nodeId, viewportBounds);
  }, [sendCursorUpdate]);
  const updateSelection = useCallback((newSelection: string) => {
    setSelection(newSelection);
    sendSelectionUpdate(newSelection);
  }, [sendSelectionUpdate]);
  const updateActivity = useCallback((tool?: string, typing?: boolean, focusedNode?: string) => {
  if (tool !== undefined) setCurrentTool(tool);
  if (typing !== undefined) setIsTyping(typing);
  if (focusedNode !== undefined) setFocusedNodeId(focusedNode);
  sendActivityUpdate();
  tool !== undefined ? tool : currentTool,
  typing !== undefined ? typing : isTyping,
  focusedNode !== undefined ? focusedNode : focusedNodeId);
}, [currentTool, isTyping, focusedNodeId, sendActivityUpdate]);
  // Auto-clear typing indicator
  useEffect(() => {
    if (isTyping) {
      const timeout = setTimeout(() => {
        setIsTyping(false);
        sendActivityUpdate(currentTool, false, focusedNodeId);
      }, 3000);
      return () => clearTimeout(timeout);
  }, [isTyping, currentTool, focusedNodeId, sendActivityUpdate]);
  // Combine all user data
  const allUsers = useMemo(() => {
  const users: any = [];
  for (const [userId, userData] of otherUsers) {
  const cursor = userCursors.get(userId);
  const selection = userSelections.get(userId);
  const activity = userActivity.get(userId);
  users.push({)
  ...userData,
  cursor,
  selection: selection?.nodeIds || [],
  currentTool: activity?.currentTool,
  isTyping: activity?.isTyping,
  focusedNodeId: activity?.focusedNodeId,
});
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