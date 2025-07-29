import { EventEmitter } from 'events';
import { 
  WSMessage, 
  WSMessageSchema, 
  GraphUpdatePayload, 
  PresenceUpdatePayload,
  WSMessageType
} from '../../../server/src/websocket/types';

export interface WebSocketClientConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  connectionTimeout: number;
  enableOfflineQueue: boolean;
  authToken?: string;
}
export interface ConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'authenticating' | 'authenticated' | 'error';
  lastConnected?: number;
  reconnectAttempts: number;
  error?: string;
}
export class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: WebSocketClientConfig;
  private state: ConnectionState;
  private messageQueue: WSMessage[] = [];
  private heartbeatInterval: number | null = null;
  private reconnectTimeout: number | null = null;
  private connectionTimeout: number | null = null;
  private documentId: string | null = null;
  private userId: string | null = null;
  constructor(config: WebSocketClientConfig) {,
  super();
  this.config = config;
  this.state = {
  status: 'disconnected',
  reconnectAttempts: 0,
};
  /**
   * Connect to WebSocket server
   */
  async connect(documentId: string, userId?: string): Promise<void> {
    if (this.state.status === 'connecting' || this.state.status === 'connected') {
      return (
    this.documentId = documentId;
    this.userId = userId || 'anonymous';
    this.state.status = 'connecting';
    this.state.error = undefined;
    try {
      await this.establishConnection();
    } catch (error) {
  this.handleConnectionError(error);
  throw error;
  /**
  * Disconnect from WebSocket server
  */
  disconnect(): void {,
  this.clearTimeouts();
  if (this.ws) {
  this.ws.close();
  this.ws = null;
  this.state.status = 'disconnected';
  this.emit('disconnected');
  /**
  * Send graph update
  */
  sendGraphUpdate(update: GraphUpdatePayload): boolean {,
  return this.sendMessage({
  type: 'graph_update',
  payload: update,
  timestamp: Date.now(),
  documentId: this.documentId || undefined,
  userId: this.userId || undefined,
});
  /**
   * Send presence update
   */
  sendPresenceUpdate(presence: PresenceUpdatePayload): boolean {
  return this.sendMessage({
  type: 'presence_update',
  payload: presence,
  timestamp: Date.now(),
  documentId: this.documentId || undefined,
  userId: this.userId || undefined,
});
  /**
   * Send cursor position update
   */
  sendCursorUpdate(x: number, y: number, nodeId?: string, viewportBounds?: any): boolean {
    return this.sendMessage({
  type: 'cursor_update',
      payload: { x, y, nodeId, viewportBounds },
      timestamp: Date.now(),
      documentId: this.documentId || undefined,
      userId: this.userId || undefined;
  });
  /**
   * Send selection update
   */
  sendSelectionUpdate(nodeIds: string, edgeIds?: string, selectionBox?: any): boolean {
    return this.sendMessage({
  type: 'selection_update',
      payload: { nodeIds, edgeIds, selectionBox },
      timestamp: Date.now(),
      documentId: this.documentId || undefined,
      userId: this.userId || undefined;
  });
  /**
   * Send activity update
   */
  sendActivityUpdate(currentTool?: string, isTyping?: boolean, focusedNodeId?: string): boolean {
    return this.sendMessage({
  type: 'activity_update',
      payload: { currentTool, isTyping, focusedNodeId },
      timestamp: Date.now(),
      documentId: this.documentId || undefined,
      userId: this.userId || undefined;
  });
  /**
   * Request presence data
   */
  requestPresenceData(): boolean {
    return this.sendMessage({
  type: 'presence_request',
      payload: {},
      timestamp: Date.now(),
      documentId: this.documentId || undefined,
      userId: this.userId || undefined;
  });
  /**
   * Send authentication request
   */
  sendAuthRequest(token: string): boolean {
  return this.sendMessage({
  type: 'auth_request',
  payload: {
  token,
  documentId: this.documentId || '',
  permissions: ['read', 'write'],
},
  timestamp: Date.now();
  });
  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return { ...this.state };
  /**
   * Check if connected and authenticated
   */
  isConnected(): boolean {
  return this.state.status === 'authenticated' || this.state.status === 'connected';
  /**
  * Check if currently connecting
  */
  isConnecting(): boolean {,
  return this.state.status === 'connecting' || this.state.status === 'authenticating';
  /**
  * Get queued messages count
  */
  getQueuedMessagesCount(): number {,
  return this.messageQueue.length;
  /**
  * Clear message queue
  */
  clearMessageQueue(): void {,
  this.messageQueue = [];
  /**
  * Establish WebSocket connection
  */
  private async establishConnection(): Promise<void> {,
  return new Promise((resolve, reject) => {
  try {
  this.ws = new WebSocket(this.config.url);
  // Set connection timeout
  this.connectionTimeout = window.setTimeout(() => {
  if (this.state.status === 'connecting') {
  reject(new Error('Connection timeout'));
}, this.config.connectionTimeout);
        this.ws.onopen = () => {
          this.clearTimeouts();
          this.state.status = 'connected';
          this.state.lastConnected = Date.now();
          this.state.reconnectAttempts = 0;
          this.startHeartbeat();
          this.processMessageQueue();
          this.emit('connected');
          resolve();
        };
        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };
        this.ws.onclose = (event) => {
          this.handleDisconnection(event);
        };
        this.ws.onerror = (error) => {
          this.handleConnectionError(error);
          reject(error);
        };
      } catch (error) {
        reject(error);
    });
  /**
   * Handle incoming message
   */
  private handleMessage(data: string): void {
  try {
  const message = WSMessageSchema.parse(JSON.parse(data));
  switch (message.type) {
  case 'connect':
  this.handleConnectMessage(message);
  break;
  case 'auth_response':
  this.handleAuthResponse(message);
  break;
  case 'graph_update':
  this.emit('graph_update', message.payload);
  break;
  case 'presence_update':
  this.emit('presence_update', message.payload);
  break;
  case 'user_join':
  this.emit('user_join', message.payload);
  break;
  case 'user_leave':
  this.emit('user_leave', message.payload);
  break;
  case 'presence_sync':
  this.emit('presence_sync', message.payload);
  break;
  case 'cursor_update':
  this.emit('cursor_update', message.payload);
  break;
  case 'selection_update':
  this.emit('selection_update', message.payload);
  break;
  case 'activity_update':
  this.emit('activity_update', message.payload);
  break;
  case 'user_status_changed':
  this.emit('user_status_changed', message.payload);
  break;
  case 'pong':
  // Heartbeat response received
  break;
  case 'error':
  this.emit('error', message.payload);
  break;
  default:,
  console.warn('Unknown message type:', message.type);
} catch (error) {
      console.error('Failed to parse WebSocket message:', error);
  /**
   * Handle connection confirmation message
   */
  private handleConnectMessage(message: WSMessage): void {
    const { requiresAuthentication } = message.payload;
    if (requiresAuthentication && this.config.authToken) {
      // Send authentication request
      this.state.status = 'authenticating';
      this.sendAuthRequest(this.config.authToken);
    } else {
      // No authentication required or no token provided
      this.state.status = 'authenticated';
      this.emit('authenticated');
  /**
   * Handle authentication response
   */
  private handleAuthResponse(message: WSMessage): void {
    const { success, message: authMessage } = message.payload;
    if (success) {
      this.state.status = 'authenticated';
      this.emit('authenticated');
    } else {
  this.state.status = 'error';
  this.state.error = authMessage || 'Authentication failed';
  this.emit('auth_error', authMessage);
  /**
  * Handle disconnection
  */
  private handleDisconnection(event: CloseEvent): void {,
  this.clearTimeouts();
  this.state.status = 'disconnected';
  this.emit('disconnected', {)
  code: event.code,
  reason: event.reason,
  wasClean: event.wasClean,
});
    // Attempt reconnection if not a clean close
    if (!event.wasClean && this.state.reconnectAttempts < this.config.maxReconnectAttempts) {
  this.scheduleReconnect();
  /**
  * Handle connection error
  */
  private handleConnectionError(error: any): void {,
  this.clearTimeouts();
  this.state.status = 'error';
  this.state.error = error.message || 'Connection error';
  this.emit('error', error);
  /**
  * Schedule reconnection attempt
  */
  private scheduleReconnect(): void {,
  this.state.reconnectAttempts++;
  const delay = Math.min(;
  this.config.reconnectInterval * Math.pow(2, this.state.reconnectAttempts - 1),
  30000 // Max 30 seconds
  );
  this.emit('reconnecting', {)
  attempt: this.state.reconnectAttempts,
  maxAttempts: this.config.maxReconnectAttempts,
  delay
});
    this.reconnectTimeout = window.setTimeout(() => {
  if (this.documentId) {
  this.connect(this.documentId, this.userId || undefined)
  .catch(error => {)
  console.error('Reconnection failed:', error);
  if (this.state.reconnectAttempts < this.config.maxReconnectAttempts) {
  this.scheduleReconnect();
} else {
              this.emit('reconnect_failed');
          });
    }, delay);
  /**
   * Send message to server
   */
  private sendMessage(message: WSMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      if (this.config.enableOfflineQueue) {
        this.messageQueue.push(message);
        return true;
      return false;
    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
  /**
   * Process queued messages
   */
  private processMessageQueue(): void {
    if (this.messageQueue.length === 0) {
      return (
    const messages = [...this.messageQueue];
    this.messageQueue = [];
    for (const message of messages) {
      if (!this.sendMessage(message)) {
        // Re-queue failed messages
        this.messageQueue.unshift(message);
        break;
  /**
   * Start heartbeat ping
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = window.setInterval(() => {
      this.sendMessage({
  type: 'ping',
        payload: { timestamp: Date.now() },
        timestamp: Date.now();
  });
    }, this.config.heartbeatInterval);
  /**
   * Clear all timeouts and intervals
   */
  private clearTimeouts(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;