import { EventEmitter } from 'events';
/**
 * WebSocket message types
 */
export enum WebSocketMessageType {
  ANALYTICS_UPDATE = 'analytics_update',
  COST_ALERT = 'cost_alert',
  BUDGET_ALERT = 'budget_alert',
  PERFORMANCE_METRIC = 'performance_metric',
  USER_ACTIVITY = 'user_activity',
  SYSTEM_STATUS = 'system_status',
  RECOMMENDATION = 'recommendation',
  ERROR = 'error',
  HEARTBEAT = 'heartbeat',
  SUBSCRIPTION = 'subscription',
  UNSUBSCRIPTION = 'unsubscription'
  /**
  * WebSocket message structure
  */
  export interface WebSocketMessage {
  type: WebSocketMessageType;,
  data: any;
  timestamp: number;
  id?: string;
  /**
  * Subscription configuration
  */
}
export interface SubscriptionConfig {
  topic: string;
  filters?: {,
  userId?: number;
  organizationId?: number;
  eventTypes?: string;
  minSeverity?: 'info' | 'warning' | 'critical';
};
  throttle?: number; // Minimum time between updates in ms
/**
 * WebSocket client configuration
 */
}
export interface WebSocketClientConfig {
  url: string;,
  reconnectInterval: number;
  maxReconnectAttempts: number;,
  heartbeatInterval: number;
  subscriptionTimeout: number;,
  enableLogging: boolean;
  apiKey?: string;
  userId?: number;
  organizationId?: number;
  /**
  * WebSocket connection state
  */
}
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed'
/**
 * Real-time WebSocket client for analytics updates
 */
export class WebSocketClient extends EventEmitter {
  private config: WebSocketClientConfig;
  private socket: WebSocket | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private subscriptions: Map<string, SubscriptionConfig> = new Map();
  private messageQueue: WebSocketMessage = [];
  private lastMessageId: string | null = null;
  constructor(config: Partial<WebSocketClientConfig> = {}) {
  super();
  this.config = {
  url: 'ws://localhost:8000/ws/analytics',
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
  subscriptionTimeout: 10000,
  enableLogging: false,
  ...config
};
    this.setupEventListeners();
  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connectionState === ConnectionState.CONNECTED) {
        resolve();
        return;
      this.connectionState = ConnectionState.CONNECTING;
      this.log('Connecting to WebSocket server...');
      try {
        this.socket = new WebSocket(this.config.url);
        this.socket.onopen = () => {
          this.handleConnectionOpen();
          resolve();
        };
        this.socket.onmessage = (event) => {
          this.handleMessage(event);
        };
        this.socket.onclose = (event) => {
          this.handleConnectionClose(event);
        };
        this.socket.onerror = (error) => {
          this.handleConnectionError(error);
          reject(error);
        };
        // Connection timeout
        setTimeout(() => {
          if (this.connectionState === ConnectionState.CONNECTING) {
            this.socket?.close();
            reject(new Error('Connection timeout'));
        }, this.config.subscriptionTimeout);
      } catch (error) {
        this.connectionState = ConnectionState.FAILED;
        reject(error);
    });
  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
  this.log('Disconnecting from WebSocket server...');
  this.connectionState = ConnectionState.DISCONNECTED;
  this.reconnectAttempts = 0;
  if (this.heartbeatTimer) {
  clearInterval(this.heartbeatTimer);
  this.heartbeatTimer = null;
  if (this.reconnectTimer) {
  clearTimeout(this.reconnectTimer);
  this.reconnectTimer = null;
  if (this.socket) {
  this.socket.close();
  this.socket = null;
  this.subscriptions.clear();
  this.messageQueue = [];
  /**
  * Subscribe to a topic
  */
  subscribe(topic: string, config?: Partial<SubscriptionConfig>): Promise<void> {,
  return new Promise((resolve, reject) => {
  const subscriptionConfig: SubscriptionConfig = {,
  topic,
  filters: {,
  userId: this.config.userId,
  organizationId: this.config.organizationId,
  ...config?.filters
},
  throttle: config?.throttle || 1000;
  };
      this.subscriptions.set(topic, subscriptionConfig);
      if (this.connectionState === ConnectionState.CONNECTED) {
  this.sendMessage({)
  type: WebSocketMessageType.SUBSCRIPTION,
  data: subscriptionConfig,
  timestamp: Date.now(),
});
      this.log(`Subscribed to topic: ${topic}`);}
      resolve();
    });
  /**
   * Unsubscribe from a topic
   */
  unsubscribe(topic: string): void {
    if (this.subscriptions.has(topic)) {
      this.subscriptions.delete(topic);
      if (this.connectionState === ConnectionState.CONNECTED) {
        this.sendMessage({)
  type: WebSocketMessageType.UNSUBSCRIPTION,
          data: { topic },
          timestamp: Date.now();
  });
      this.log(`Unsubscribed from topic: ${topic}`);}
  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  /**
   * Get active subscriptions
   */
  getSubscriptions(): string {
    return Array.from(this.subscriptions.keys());
  /**
   * Send a message to the server
   */
  private sendMessage(message: WebSocketMessage): void {
    if (this.socket && this.connectionState === ConnectionState.CONNECTED) {
      try {
        this.socket.send(JSON.stringify(message));
        this.log(`Sent message: ${message.type}`, message);}
      } catch (error) {
        this.log(`Failed to send message: ${error}`);}
        this.emit('error', error);
    } else {
  // Queue message for when connection is established
  this.messageQueue.push(message);
  /**
  * Handle connection open
  */
  private handleConnectionOpen(): void {,
  this.log('WebSocket connection established');
  this.connectionState = ConnectionState.CONNECTED;
  this.reconnectAttempts = 0;
  // Send authentication if API key is provided
  if (this.config.apiKey) {
  this.sendMessage({)
  type: WebSocketMessageType.SUBSCRIPTION,
  data: {,
  auth: {,
  apiKey: this.config.apiKey,
  userId: this.config.userId,
  organizationId: this.config.organizationId,
},
  timestamp: Date.now();
  });
    // Send queued messages
    this.messageQueue.forEach(message => {)
  this.sendMessage(message);
    });
    this.messageQueue = [];
    // Re-establish subscriptions
    this.subscriptions.forEach((config, topic) => {
  this.sendMessage({)
  type: WebSocketMessageType.SUBSCRIPTION,
  data: config,
  timestamp: Date.now(),
});
    });
    // Start heartbeat
    this.startHeartbeat();
    this.emit('connected');
  /**
   * Handle connection close
   */
  private handleConnectionClose(event: CloseEvent): void {
    this.log(`WebSocket connection closed: ${event.code} - ${event.reason}`);}
    this.connectionState = ConnectionState.DISCONNECTED;
    this.socket = null;
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    this.emit('disconnected', { code: event.code, reason: event.reason });
    // Attempt to reconnect if not manually disconnected
    if (event.code !== 1000 && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.attemptReconnect();
    } else if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.connectionState = ConnectionState.FAILED;
      this.emit('reconnect_failed');
  /**
   * Handle connection error
   */
  private handleConnectionError(error: Event): void {
    this.log(`WebSocket error: ${error}`);}
    this.emit('error', error);
  /**
   * Handle incoming message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.lastMessageId = message.id || null;
      this.log(`Received message: ${message.type}`, message);}
      // Handle different message types
      switch (message.type) {
      case WebSocketMessageType.ANALYTICS_UPDATE:
        this.emit('analytics_update', message.data);
        break;
      case WebSocketMessageType.COST_ALERT:
        this.emit('cost_alert', message.data);
        break;
      case WebSocketMessageType.BUDGET_ALERT:
        this.emit('budget_alert', message.data);
        break;
      case WebSocketMessageType.PERFORMANCE_METRIC:
        this.emit('performance_metric', message.data);
        break;
      case WebSocketMessageType.USER_ACTIVITY:
        this.emit('user_activity', message.data);
        break;
      case WebSocketMessageType.SYSTEM_STATUS:
        this.emit('system_status', message.data);
        break;
      case WebSocketMessageType.RECOMMENDATION:
        this.emit('recommendation', message.data);
        break;
      case WebSocketMessageType.ERROR:
        this.emit('server_error', message.data);
        break;
      case WebSocketMessageType.HEARTBEAT:
        // Heartbeat received, connection is alive
        break;
      default:
        this.log(`Unknown message type: ${message.type}`);}
      // Emit generic message event
      this.emit('message', message);
    } catch (error) {
      this.log(`Failed to parse message: ${error}`);}
      this.emit('error', error);
  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.connectionState === ConnectionState.RECONNECTING) {
      return;
    this.connectionState = ConnectionState.RECONNECTING;
    this.reconnectAttempts++;
    this.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})...`);}
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        this.log(`Reconnection failed: ${error}`);}
        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
          // Exponential backoff
          const delay = Math.min(this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1), 30000);
          this.reconnectTimer = setTimeout(() => {
            this.attemptReconnect();
          }, delay);
        } else {
          this.connectionState = ConnectionState.FAILED;
          this.emit('reconnect_failed');
      });
    }, this.config.reconnectInterval);
    this.emit('reconnecting', this.reconnectAttempts);
  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.sendMessage({)
  type: WebSocketMessageType.HEARTBEAT,
        data: { timestamp: Date.now() },
        timestamp: Date.now();
  });
    }, this.config.heartbeatInterval);
  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Handle browser events
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.disconnect();
      });
      window.addEventListener('online', () => {
        if (this.connectionState === ConnectionState.DISCONNECTED) {
          this.connect();
      });
      window.addEventListener('offline', () => {
        this.disconnect();
      });
  /**
   * Log message (if logging is enabled)
   */
  private log(message: string, data?: any): void {
    if (this.config.enableLogging) {
      console.log(`[WebSocketClient] ${message}`, data);}
/**
 * Analytics WebSocket client with predefined subscriptions
 */
export class AnalyticsWebSocketClient extends WebSocketClient {
  constructor(config: Partial<WebSocketClientConfig> = {}) {
  super(config);
  this.setupAnalyticsListeners();
  /**
  * Subscribe to analytics dashboard updates
  */
  async subscribeToDashboard(): Promise<void> {,
  await this.subscribe('dashboard', {)
  filters: {,
  eventTypes: ['analytics_update', 'performance_metric'],
},
  throttle: 5000 // Update every 5 seconds;
  });
  /**
   * Subscribe to cost alerts
   */
  async subscribeToCostAlerts(): Promise<void> {
  await this.subscribe('cost_alerts', {)
  filters: {,
  eventTypes: ['cost_alert', 'budget_alert'],
  minSeverity: 'warning',
},
  throttle: 1000 // Immediate alerts;
  });
  /**
   * Subscribe to recommendations
   */
  async subscribeToRecommendations(): Promise<void> {
  await this.subscribe('recommendations', {)
  filters: {,
  eventTypes: ['recommendation'],
},
  throttle: 10000 // Update every 10 seconds;
  });
  /**
   * Subscribe to user activity
   */
  async subscribeToUserActivity(): Promise<void> {
  await this.subscribe('user_activity', {)
  filters: {,
  eventTypes: ['user_activity'],
},
  throttle: 2000 // Update every 2 seconds;
  });
  /**
   * Setup analytics-specific event listeners
   */
  private setupAnalyticsListeners(): void {
    this.on('analytics_update', (data) => {
      this.emit('dashboard_update', data);
    });
    this.on('cost_alert', (data) => {
      this.emit('alert', { type: 'cost', ...data });
    });
    this.on('budget_alert', (data) => {
      this.emit('alert', { type: 'budget', ...data });
    });
    this.on('performance_metric', (data) => {
      this.emit('metric_update', data);
    });
    this.on('recommendation', (data) => {
      this.emit('new_recommendation', data);
    });
/**
 * Create analytics WebSocket client instance
 */
export const createAnalyticsWebSocketClient = (config: Partial<WebSocketClientConfig> = {}): AnalyticsWebSocketClient => {
  return new AnalyticsWebSocketClient(config);
};