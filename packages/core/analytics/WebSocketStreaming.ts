/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * WebSocket Streaming System - Story 1.5 Task 4
 * 
 * Implements real-time WebSocket streaming for analytics dashboard
 * with secure event broadcasting and connection management.
 */
import { EventEmitter } from 'events';
import { z } from 'zod';
import { UnifiedEventBus, UnifiedAnalyticsEvent, EventFilter } from './UnifiedEventBus';
import { AnalyticsAuthorizationService, AuthContext } from './AnalyticsAuthorization';

// WebSocket Message Types
export enum WSMessageType { SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  EVENT = 'event',
  HEARTBEAT = 'heartbeat',
  ERROR = 'error',
  AUTH = 'auth',
  CONFIG = 'config',
  METRICS = 'metrics'
  // WebSocket Message Schema
  export const WSMessageSchema = z.object({)
  type: z.nativeEnum(WSMessageType),
  id: z.string().optional(),
  payload: z.unknown().optional(),
  timestamp: z.number(),
  clientId: z.string().optional() }
});

export type WSMessage = z.infer<typeof WSMessageSchema>;

// Subscription Configuration
export const SubscriptionConfigSchema = z.object({ )
  subscriptionId: z.string()
  filter: z.object({);
  types: z.array(z.string()).optional()
  categories: z.array(z.string()).optional()
  sources: z.array(z.string()).optional()
  severities: z.array(z.string()).optional()
  userId: z.string().optional()
  organizationId: z.string().optional() }
}).optional()
  batchSize: z.number().min(1).max(1000).default(1)
  batchTimeoutMs: z.number().min(100).max(10000).default(1000)
  includeMetadata: z.boolean().default(true)
  maxQueueSize: z.number().min(10).max(10000).default(1000);
  });

export type SubscriptionConfig = z.infer<typeof SubscriptionConfigSchema>;

// Client Connection


interface ClientConnection { id: string;
  ws: WebSocket | any; // WebSocket interface }
  authContext?: AuthContext;
  subscriptions: Map<string, SubscriptionConfig>;
  isAuthenticated: boolean;
  lastHeartbeat: number;
  eventQueue: UnifiedAnalyticsEvent;
  connected: boolean;
  ipAddress?: string;
  userAgent?: string;
  // Connection Statistics



interface ConnectionStats {
  totalConnections: number;
  activeConnections: number;
  authenticatedConnections: number;
  totalSubscriptions: number;
  messagesPerSecond: number;
  bytesPerSecond: number;
  errorRate: number;
  // WebSocket Server Configuration



interface WSServerConfig { port: number;
  heartbeatInterval: number;
  connectionTimeout: number;
  maxConnections: number;
  maxSubscriptionsPerClient: number;
  requireAuthentication: boolean;
  enableCompression: boolean;
  enableCors: boolean;
  corsOrigins: string;
  /**
  * WebSocket Streaming Server
  *
  * Manages real-time WebSocket connections for analytics dashboard streaming
  */
  export class WebSocketStreamingServer extends EventEmitter {
  private eventBus: UnifiedEventBus;
  private authService: AnalyticsAuthorizationService;
  private server: any; // WebSocket server instance;
  private clients: Map<string, ClientConnection> = new Map();
  private config: WSServerConfig;
  private stats: ConnectionStats;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private metricsTimer: NodeJS.Timeout | null = null;
  constructor();
  eventBus: UnifiedEventBus;
  authService: AnalyticsAuthorizationService }

},
  config: Partial<WSServerConfig> = {}
    super();
    this.eventBus = eventBus;
    this.authService = authService;
    this.config = { port: 8080
  heartbeatInterval: 30000, // 30 seconds
  connectionTimeout: 60000, // 60 seconds
  maxConnections: 1000
  maxSubscriptionsPerClient: 10
  requireAuthentication: true
  enableCompression: true
  enableCors: true
  corsOrigins: ['*'] }
  ...config
};
    this.stats = { totalConnections: 0
  activeConnections: 0
  authenticatedConnections: 0
  totalSubscriptions: 0
  messagesPerSecond: 0
  bytesPerSecond: 0
  errorRate: 0 }
};
    this.setupEventBusSubscription();
  /**
   * Start WebSocket server
   */
  async start(): Promise<void> {

    try {
      // In production, this would use an actual WebSocket library like 'ws'
      console.log(`Starting WebSocket server on port ${this.config.port}`);}
      // Setup heartbeat timer
      this.heartbeatTimer = setInterval(() => { this.sendHeartbeats() }, this.config.heartbeatInterval);
      // Setup metrics collection timer
      this.metricsTimer = setInterval(() => { this.updateMetrics() }, 5000);
      this.emit('server:started', { port: this.config.port });
      console.log(`WebSocket streaming server started on port ${this.config.port}`);}
 catch (error) { this.emit('server:error', error);
  throw error;
  /**
  * Stop WebSocket server
  */
  async stop(): Promise<void> { }
  try { console.log('Stopping WebSocket server...');
  // Clear timers
  if (this.heartbeatTimer) {
  clearInterval(this.heartbeatTimer);
  this.heartbeatTimer = null;
  if (this.metricsTimer) {
  clearInterval(this.metricsTimer);
  this.metricsTimer = null;
  // Close all client connections
  for (const client of this.clients.values()) {
  await this.disconnectClient(client.id, 'Server shutdown');
  // Close server
  if (this.server) {
  this.server.close();
  this.emit('server:stopped');
  console.log('WebSocket server stopped') } catch (error) { this.emit('server:error', error);
  throw error;
  /**
  * Handle new client connection
  */
  async handleConnection(ws: any, request: any): Promise<void> {
  const clientId = this.generateClientId();
  const ipAddress = request.connection?.remoteAddress || request.socket?.remoteAddress;
  const userAgent = request.headers?.['user-agent'];
  // Check connection limits
  if (this.clients.size >= this.config.maxConnections) {
  ws.close(1013, 'Server overloaded');
  return;
  // Create client connection
  const client: ClientConnection = {
  id: clientId
  ws
  subscriptions: new Map()
  isAuthenticated: !this.config.requireAuthentication
  lastHeartbeat: Date.now()
  eventQueue: []
  connected: true
  ipAddress }
  userAgent
};
    this.clients.set(clientId, client);
    this.stats.totalConnections++;
    this.stats.activeConnections++;
    console.log(`Client ${clientId} connected from ${ipAddress}`);}
    // Setup WebSocket event handlers
    ws.on('message', (data: any) => { this.handleMessage(clientId, data) });
    ws.on('close', (code: number, reason: string) => { this.handleDisconnection(clientId, code, reason) });
    ws.on('error', (error: Error) => { this.handleError(clientId, error) });
    // Send connection acknowledgment
    await this.sendMessage(client, { )
  type: WSMessageType.CONFIG
  payload: {
  clientId
  requireAuthentication: this.config.requireAuthentication
  maxSubscriptions: this.config.maxSubscriptionsPerClient
  heartbeatInterval: this.config.heartbeatInterval }

  timestamp: Date.now();
  });
    this.emit('client:connected', { clientId, ipAddress, userAgent });
  /**
   * Handle client message
   */
  private async handleMessage(clientId: string, data: any): Promise<void> { const client = this.clients.get(clientId);
  if (!client) return;
  try {
  // Parse message
  const rawMessage = typeof data === 'string' ? JSON.parse(data) : data;
  const message = WSMessageSchema.parse(rawMessage);
  client.lastHeartbeat = Date.now();
  switch (message.type) {
  case WSMessageType.AUTH:
  await this.handleAuthentication(client, message.payload);
  break;
  case WSMessageType.SUBSCRIBE:
  await this.handleSubscription(client, message.payload);
  break;
  case WSMessageType.UNSUBSCRIBE:
  await this.handleUnsubscription(client, message.payload);
  break;
  case WSMessageType.HEARTBEAT:
  await this.handleHeartbeat(client);
  break;
  case WSMessageType.CONFIG:
  await this.handleConfigRequest(client);
  break;
  default: }
  await this.sendError(client, 'Unknown message type', message.type);
 catch (error) {
      console.error(`Error handling message from client ${clientId}:`, error);}
      await this.sendError(client, 'Invalid message format', error instanceof Error ? error.message : String(error));
  /**
   * Handle client authentication
   */
  private async handleAuthentication(client: ClientConnection, payload: any): Promise<void> {

    try {
      const { token } = payload;
      if (!token) { await this.sendError(client, 'Authentication token required');
  return;
  // Validate token using authentication service
  const authContext = await this.authService.createAuthContextFromToken(token);
  if (!authContext) {
  await this.sendError(client, 'Invalid authentication token');
  return;
  // Check analytics dashboard access
  const dashboardAuth = await this.authService.authorizeDashboardAccess('user', authContext);
  if (!dashboardAuth.allowed) {
  await this.sendError(client, 'Dashboard access denied');
  return;
  client.authContext = authContext;
  client.isAuthenticated = true;
  this.stats.authenticatedConnections++;
  await this.sendMessage(client, {)
  type: WSMessageType.AUTH
  payload: {
  authenticated: true
  userId: authContext.userId
  permissions: authContext.permissions }

  timestamp: Date.now();
  });
      console.log(`Client ${client.id} authenticated as user ${authContext.userId}`);}
      this.emit('client:authenticated', { clientId: client.id, userId: authContext.userId });
 catch (error) {
      console.error(`Authentication error for client ${client.id}:`, error);}
      await this.sendError(client, 'Authentication failed');
  /**
   * Handle subscription request
   */
  private async handleSubscription(client: ClientConnection, payload: any): Promise<void> { try {
  // Check authentication if required
  if (this.config.requireAuthentication && !client.isAuthenticated) {
  await this.sendError(client, 'Authentication required for subscriptions');
  return;
  // Check subscription limits
  if (client.subscriptions.size >= this.config.maxSubscriptionsPerClient) {
  await this.sendError(client, 'Maximum subscriptions exceeded');
  return;
  // Parse subscription configuration
  const subscriptionConfig = SubscriptionConfigSchema.parse(payload);
  // Authorize subscription filter if authenticated
  let authorizedFilter = subscriptionConfig.filter;
  if (client.authContext) {
  // Convert string arrays to proper enum types for EventFilter
  const eventFilter: EventFilter = {
  ...subscriptionConfig.filter
  types: subscriptionConfig.filter?.types as AnalyticsEventType | undefined
  categories: subscriptionConfig.filter?.categories as EventCategory | undefined
  severities: subscriptionConfig.filter?.severities as EventSeverity | undefined }
};
        const queryAuth = await this.authService.authorizeAnalyticsQuery(;);
          eventFilter
          client.authContext
        );
        if (!queryAuth.allowed) { await this.sendError(client, 'Subscription access denied');
  return;
  authorizedFilter = queryAuth.filteredQuery;
  // Create subscription with authorized filter
  const finalConfig = {
  ...subscriptionConfig
  filter: authorizedFilter }
};
      client.subscriptions.set(subscriptionConfig.subscriptionId, finalConfig);
      this.stats.totalSubscriptions++;
      await this.sendMessage(client, { )
  type: WSMessageType.SUBSCRIBE
  payload: {
  subscriptionId: subscriptionConfig.subscriptionId
  subscribed: true
  filter: authorizedFilter }

  timestamp: Date.now();
  });
      console.log(`Client ${client.id} subscribed to ${subscriptionConfig.subscriptionId}`);}
      this.emit('client:subscribed', { )
        clientId: client.id }
        subscriptionId: subscriptionConfig.subscriptionId ;
  });
 catch (error) {
      console.error(`Subscription error for client ${client.id}:`, error);}
      await this.sendError(client, 'Subscription failed', error instanceof Error ? error.message : String(error));
  /**
   * Handle unsubscription request
   */
  private async handleUnsubscription(client: ClientConnection, payload: any): Promise<void> {

    try {
      const { subscriptionId } = payload;
      if (client.subscriptions.has(subscriptionId)) { client.subscriptions.delete(subscriptionId);
  this.stats.totalSubscriptions--;
  await this.sendMessage(client, {)
  type: WSMessageType.UNSUBSCRIBE
  payload: {
  subscriptionId
  unsubscribed: true }

  timestamp: Date.now();
  });
        console.log(`Client ${client.id} unsubscribed from ${subscriptionId}`);}
        this.emit('client:unsubscribed', { clientId: client.id, subscriptionId });
 catch (error) {
      console.error(`Unsubscription error for client ${client.id}:`, error);}
      await this.sendError(client, 'Unsubscription failed');
  /**
   * Handle heartbeat
   */
  private async handleHeartbeat(client: ClientConnection): Promise<void> { client.lastHeartbeat = Date.now();
    await this.sendMessage(client, {)
  type: WSMessageType.HEARTBEAT }
      payload: { timestamp: Date.now() }
      timestamp: Date.now();
  });
  /**
   * Handle configuration request
   */
  private async handleConfigRequest(client: ClientConnection): Promise<void> { await this.sendMessage(client, {)
  type: WSMessageType.CONFIG
  payload: {
  clientId: client.id
  isAuthenticated: client.isAuthenticated
  subscriptions: Array.from(client.subscriptions.keys())
  heartbeatInterval: this.config.heartbeatInterval
  maxSubscriptions: this.config.maxSubscriptionsPerClient }

  timestamp: Date.now();
  });
  /**
   * Handle client disconnection
   */
  private handleDisconnection(clientId: string, code: number, reason: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.connected = false;
      this.stats.activeConnections--;
      this.stats.totalSubscriptions -= client.subscriptions.size;
      if (client.isAuthenticated) {
        this.stats.authenticatedConnections--;
      this.clients.delete(clientId);
      console.log(`Client ${clientId})}
  disconnected: ${code} ${reason}`);}
      this.emit('client:disconnected', { clientId, code, reason });
  /**
   * Handle client error
   */
  private handleError(clientId: string, error: Error): void {
    console.error(`Client ${clientId})}
  error:`, error);}
    this.emit('client:error', { clientId, error });
  /**
   * Setup event bus subscription for broadcasting
   */
  private setupEventBusSubscription(): void { this.eventBus.subscribe({)
  name: 'websocket-broadcaster' }
      filter: {}, // Subscribe to all events
      handler: (event: UnifiedAnalyticsEvent) => { 
        this.broadcastEvent(event) }
  priority: 500
      enabled: true;
  });
  /**
   * Broadcast event to matching subscribers
   */
  private async broadcastEvent(event: UnifiedAnalyticsEvent): Promise<void> { const broadcastPromises: Promise<void>[] = [];
  for (const client of this.clients.values()) {
  if (!client.connected) continue;
  // Check each subscription for matches
  for (const [subscriptionId, config] of client.subscriptions) {
  // Convert subscription filter to EventFilter format
  const eventFilter: EventFilter | undefined = config.filter ? {
  ...config.filter
  types: config.filter.types as AnalyticsEventType | undefined
  categories: config.filter.categories as EventCategory | undefined
  severities: config.filter.severities as EventSeverity | undefined }
 : undefined;
        if (this.eventMatchesFilter(event, eventFilter)) { broadcastPromises.push(
  this.sendEventToClient(client, event, subscriptionId, config)
  );
  await Promise.allSettled(broadcastPromises);
  /**
  * Send event to specific client
  */
  private async sendEventToClient(client: ClientConnection)
  event: UnifiedAnalyticsEvent
  subscriptionId: string
  config: SubscriptionConfig): Promise<void> { }
  try { // Authorize event access if client is authenticated
  if (client.authContext) {
  const eventAuth = await this.authService.authorizeEventAccess(event, client.authContext);
  if (!eventAuth.allowed) {
  return; // Skip unauthorized events
  // Use filtered event if redaction was applied
  if (eventAuth.filteredEvent) {
  event = eventAuth.filteredEvent as UnifiedAnalyticsEvent;
  // Add to client queue for batching
  client.eventQueue.push(event);
  // Check if we should flush the queue
  if (client.eventQueue.length >= config.batchSize) {
  await this.flushClientQueue(client, subscriptionId, config) } catch (error) {
      console.error(`Error sending event to client ${client.id}:`, error);}
  /**
   * Flush client event queue
   */
  private async flushClientQueue(client: ClientConnection)
  subscriptionId: string
    config: SubscriptionConfig): Promise<void> { 
  if (client.eventQueue.length === 0) return;
  const events = client.eventQueue.splice(0, config.batchSize);
  await this.sendMessage(client, {)
  type: WSMessageType.EVENT
  payload: {
  subscriptionId
  events: config.includeMetadata ? events : events.map(e => ({)
  id: e.id
  type: e.type
  timestamp: e.timestamp
  data: e.data }
}))
        batchSize: events.length

  timestamp: Date.now();
  });
  /**
   * Check if event matches subscription filter
   */
  private eventMatchesFilter(event: UnifiedAnalyticsEvent, filter?: EventFilter): boolean { if (!filter) return true;
  if (filter.types && !filter.types.includes(event.type)) return false;
  if (filter.categories && !filter.categories.includes(event.category)) return false;
  if (filter.sources && !filter.sources.includes(event.source)) return false;
  if (filter.severities && !filter.severities.includes(event.severity)) return false;
  if (filter.userId && event.userId !== filter.userId) return false;
  if (filter.organizationId && event.organizationId !== filter.organizationId) return false;
  return true;
  /**
  * Send heartbeats to all clients
  */
  private async sendHeartbeats(): Promise<void> {
  const now = Date.now();
  const timeoutThreshold = now - this.config.connectionTimeout;
  const clientsToRemove: string = [];
  for (const [clientId, client] of this.clients) {
  if (client.lastHeartbeat < timeoutThreshold) {
  // Client timed out
  clientsToRemove.push(clientId);
  continue;
  // Flush any pending events
  for (const [subscriptionId, config] of client.subscriptions) {
  if (client.eventQueue.length > 0) {
  await this.flushClientQueue(client, subscriptionId, config);
  // Remove timed out clients
  for (const clientId of clientsToRemove) {
  await this.disconnectClient(clientId, 'Connection timeout');
  /**
  * Update connection statistics
  */
  private updateMetrics(): void {,
  // Calculate messages per second and bytes per second
  // This would be implemented with actual counters in production
  this.emit('metrics:updated', this.stats);
  /**
  * Send message to client
  */
  private async sendMessage(client: ClientConnection, message: WSMessage): Promise<void> { }
  if (!client.connected || !client.ws) return;
  try { const messageString = JSON.stringify(message);
  client.ws.send(messageString) } catch (error) {
      console.error(`Failed to send message to client ${client.id}:`, error);}
      await this.disconnectClient(client.id, 'Send error');
  /**
   * Send error message to client
   */
  private async sendError(client: ClientConnection, message: string, details?: any): Promise<void> { await this.sendMessage(client, {)
  type: WSMessageType.ERROR }
      payload: { message, details }
      timestamp: Date.now();
  });
  /**
   * Disconnect client
   */
  private async disconnectClient(clientId: string, reason: string): Promise<void> { const client = this.clients.get(clientId);
    if (client) {
      try {
        if (client.ws && client.connected) {
          client.ws.close(1000, reason) } catch (error) {
        console.error(`Error disconnecting client ${clientId}:`, error);}
      this.handleDisconnection(clientId, 1000, reason);
  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  /**
   * Public API Methods
   */
  /**
   * Get connection statistics
   */
  getStats(): ConnectionStats {
    // Update active connections count
    this.stats.activeConnections = Array.from(this.clients.values())
      .filter(client => client.connected).length;
    this.stats.authenticatedConnections = Array.from(this.clients.values())
      .filter(client => client.connected && client.isAuthenticated).length;
    this.stats.totalSubscriptions = Array.from(this.clients.values())
      .reduce((sum, client) => sum + client.subscriptions.size, 0);
    return { ...this.stats };
  /**
   * Get connected clients
   */
  getClients(): Array<{ id: string;
  isAuthenticated: boolean;
  subscriptions: number;
  lastHeartbeat: number;
  ipAddress?: string }> { return Array.from(this.clients.values()).map(client => ({)
  id: client.id,
  isAuthenticated: client.isAuthenticated,
  subscriptions: client.subscriptions.size,
  lastHeartbeat: client.lastHeartbeat,
  ipAddress: client.ipAddress }
}));
  /**
   * Broadcast custom message to all clients
   */
  async broadcastMessage(message: WSMessage, filter?: (client: ClientConnection) => boolean): Promise<void> { const clients = filter ;
  ? Array.from(this.clients.values()).filter(filter)
  : Array.from(this.clients.values());
  const promises = clients.map(client => this.sendMessage(client, message));
  await Promise.allSettled(promises);
  /**
  * Get client by ID
  */
  getClient(clientId: string): ClientConnection | null {
  return this.clients.get(clientId) || null;
  /**
  * Force disconnect client
  */
  async forceDisconnect(clientId: string, reason: string = 'Forced disconnect'): Promise<boolean> {
  const client = this.clients.get(clientId);
  if (client) {
  await this.disconnectClient(clientId, reason);
  return true;
  return false;
  /**
  * WebSocket Client for testing and integration
  */
  export class WebSocketAnalyticsClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private authToken?: string;
  private subscriptions: Map<string, SubscriptionConfig> = new Map();
  private reconnectInterval: number = 5000;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private connected: boolean = false;
  constructor(url: string, authToken?: string) {
  super();
  this.url = url;
  this.authToken = authToken;
  /**
  * Connect to WebSocket server
  */
  async connect(): Promise<void> { }
  return new Promise((resolve, reject) => { try {
  this.ws = new WebSocket(this.url);
  this.ws.onopen = () => {
  this.connected = true;
  console.log('WebSocket client connected');
  // Authenticate if token provided
  if (this.authToken) {
  this.authenticate(this.authToken);
  this.startHeartbeat();
  this.emit('connected');
  resolve() };
        this.ws.onmessage = (event) => { this.handleMessage(event.data) };
        this.ws.onclose = (event) => { this.connected = false;
  this.stopHeartbeat();
  console.log('WebSocket client disconnected:', event.code, event.reason);
  this.emit('disconnected', event.code, event.reason);
  // Auto-reconnect
  setTimeout(() => {
  if (!this.connected) {
  this.connect() }, this.reconnectInterval);
        };
        this.ws.onerror = (error) => { console.error('WebSocket client error:', error);
  this.emit('error', error);
  reject(error) };
 catch (error) { reject(error) });
  /**
   * Disconnect from server
   */
  disconnect(): void { if (this.ws) {
      this.connected = false;
      this.stopHeartbeat();
      this.ws.close();
      this.ws = null;
  /**
   * Authenticate with server
   */
  authenticate(token: string): void {
    this.send({)
  type: WSMessageType.AUTH }
      payload: { token }
      timestamp: Date.now();
  });
  /**
   * Subscribe to events
   */
  subscribe(config: SubscriptionConfig): void { this.subscriptions.set(config.subscriptionId, config);
  this.send({)
  type: WSMessageType.SUBSCRIBE
  payload: config
  timestamp: Date.now() }
});
  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): void { this.subscriptions.delete(subscriptionId);
    this.send({)
  type: WSMessageType.UNSUBSCRIBE }
      payload: { subscriptionId }
      timestamp: Date.now();
  });
  /**
   * Send message to server
   */
  private send(message: WSMessage): void { if (this.ws && this.connected) {
  this.ws.send(JSON.stringify(message));
  /**
  * Handle incoming message
  */
  private handleMessage(data: string): void {
  try {
  const message = JSON.parse(data);
  switch (message.type) {
  case WSMessageType.EVENT:
  this.emit('events', message.payload);
  break;
  case WSMessageType.AUTH:
  this.emit('authenticated', message.payload);
  break;
  case WSMessageType.ERROR:
  this.emit('error', new Error(message.payload.message));
  break;
  case WSMessageType.HEARTBEAT:
  // Heartbeat received
  break;
  default: }
  this.emit('message', message);
 catch (error) { console.error('Error parsing WebSocket message:', error);
  this.emit('error', error);
  /**
  * Start heartbeat
  */
  private startHeartbeat(): void {
  this.heartbeatTimer = setInterval(() => {
  this.send({)
  type: WSMessageType.HEARTBEAT
  timestamp: Date.now() }
});
    }, 25000); // Send heartbeat every 25 seconds
  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;

export default WebSocketStreamingServer;