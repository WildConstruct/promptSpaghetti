/**
 * Real-Time State Manager
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 2: Real-Time Data Synchronization
 * 
 * WebSocket-based real-time state management with optimistic updates
 */
import { EventEmitter } from 'events';
import { StateChange } from '../containers/BaseStateContainer';
import { DomainStateContainer } from '../orchestration/StateOrchestrator';
import { StateSynchronizer, SyncMessage, OptimisticUpdate } from '../orchestration/StateSynchronizer';

// Real-time types

}
export interface WebSocketConnection {
  socket: WebSocket;
  id: string;
  userId: string;
  domains: string;
  isReady: boolean;
  lastPing: number;
  latency: number;
  reconnectAttempts: number;
  metadata: ConnectionMetadata;
}
}
}
export interface ConnectionMetadata {
  userAgent: string;
  ip?: string;
  location?: string;
  sessionId: string;
  connectTime: number;
}
}
}
export interface StateSubscription {
  id: string;
  domain: string;
  filters: SubscriptionFilter;
  callback: StateChangeCallback;
  options: SubscriptionOptions;
}
}
}
export interface SubscriptionFilter {
  type: 'path' | 'user' | 'change_type' | 'custom';
  value: string | string | ((change: StateChange<any>) => boolean);
  operator?: 'equals' | 'contains' | 'matches' | 'in'
}
  }
}
export interface SubscriptionOptions {
  includeOptimistic?: boolean;
  batchUpdates?: boolean;
  throttleMs?: number;
  priority?: 'low' | 'normal' | 'high'
}
  }
export type StateChangeCallback = (change: StateChange<any>, metadata: ChangeMetadata) => void;

}
export interface ChangeMetadata {
  source: 'local' | 'remote' | 'server';
  optimistic: boolean;
  clientId: string;
  latency?: number;
  timestamp: number;
}
}
}
export interface StateMutation {
  domain: string;
  operation: MutationOperation;
  path?: string;
  value?: any;
  metadata?: Record<string, any>;
}
}
export type MutationOperation = 'create' | 'update' | 'delete' | 'replace' | 'merge';

}
export interface RealtimeConfig {
  wsUrl: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  pingInterval: number;
  pongTimeout: number;
  batchInterval: number;
  maxBatchSize: number;
  enableOptimistic: boolean;
  enableCompression: boolean;
  enableHeartbeat: boolean;
  debugMode: boolean;
}
}
}
export interface ConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  error?: Error;
  lastConnected?: number;
  reconnectAttempts: number;
  latency: number;
  messagesSent: number;
  messagesReceived: number;
  bytesTransferred: number;
  // Error types
}
}
export class StateConflictError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'StateConflictError';

export class ConnectionError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ConnectionError';

export class OptimisticUpdateError extends Error {
  constructor(message: string, public updateId: string) {
    super(message);
    this.name = 'OptimisticUpdateError';

// Main real-time state manager
export class RealTimeStateManager extends EventEmitter {
  private connection?: WebSocketConnection;
  private synchronizer: StateSynchronizer;
  private subscriptions = new Map<string, StateSubscription>();
  private optimisticUpdates = new Map<string, OptimisticUpdate>();
  private messageQueue: any = [];
  private connectionState: ConnectionState;
  private config: RealtimeConfig;
  private pingTimer?: NodeJS.Timeout;
  private reconnectTimer?: NodeJS.Timeout;
  private batchTimer?: NodeJS.Timeout;
  private domains = new Map<string, DomainStateContainer>();
  constructor(config: Partial<RealtimeConfig> = {}) {
  super();
  this.config = {
  wsUrl: 'ws://localhost:8080/realtime',
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  pingInterval: 30000,
  pongTimeout: 10000,
  batchInterval: 50,
  maxBatchSize: 100,
  enableOptimistic: true,
  enableCompression: false,
  enableHeartbeat: true,
  debugMode: false,
  ...config
};
    this.connectionState = {
  status: 'disconnected',
  reconnectAttempts: 0,
  latency: 0,
  messagesSent: 0,
  messagesReceived: 0,
  bytesTransferred: 0,
};
    this.synchronizer = new StateSynchronizer()
      {
  enableOptimisticUpdates: this.config.enableOptimistic,
  batchInterval: this.config.batchInterval,
  maxBatchSize: this.config.maxBatchSize,
}
      false // Client side
    );
    this.setupSynchronizerEvents();
  // Connection management
  async connect(userId: string, sessionId?: string): Promise<void> {

  if (this.connectionState.status === 'connected' || this.connectionState.status === 'connecting') {
  return;
  this.connectionState.status = 'connecting';
  this.connectionState.reconnectAttempts++;
  try {
  const socket = new WebSocket(this.config.wsUrl);
  this.connection = {
  socket,
  id: this.generateConnectionId(),
  userId,
  domains: Array.from(this.domains.keys()),
  isReady: false,
  lastPing: Date.now(),
  latency: 0,
  reconnectAttempts: this.connectionState.reconnectAttempts,
  metadata: {
  userAgent: navigator.userAgent,
  sessionId: sessionId || this.generateSessionId(),
  connectTime: Date.now(),
};
      this.setupSocketEventHandlers();
      // Wait for connection to open
      await this.waitForConnection();
      // Send initial handshake
      await this.sendHandshake();
      this.connectionState.status = 'connected';
      this.connectionState.lastConnected = Date.now();
      this.connectionState.reconnectAttempts = 0;
      this.startHeartbeat();
      this.processQueuedMessages();
      this.emit('connected', this.connection);
    } catch (error) {
  this.connectionState.status = 'error';
  this.connectionState.error = error as Error;
  this.emit('connectionError', error);
  // Schedule reconnect
  this.scheduleReconnect();
  throw error;
  async disconnect(): Promise<void> {,
  if (this.connection) {
  this.stopHeartbeat();
  this.connection.socket.close(1000, 'Client disconnect');
  this.connection = undefined;
  this.connectionState.status = 'disconnected';
  this.emit('disconnected');
  private async waitForConnection(): Promise<void> {,
  return new Promise((resolve, reject) => {
  if (!this.connection) {
  reject(new Error('No connection available'));
  return;
  const socket = this.connection.socket;
  const onOpen = () => {
  cleanup();
  resolve();
};
      const onError = (error: Event) => {
        cleanup();
        reject(new ConnectionError('WebSocket connection failed'));
      };
      const onClose = () => {
        cleanup();
        reject(new ConnectionError('WebSocket connection closed'));
      };
      const cleanup = () => {
        socket.removeEventListener('open', onOpen);
        socket.removeEventListener('error', onError);
        socket.removeEventListener('close', onClose);
      };
      socket.addEventListener('open', onOpen);
      socket.addEventListener('error', onError);
      socket.addEventListener('close', onClose);
    });
  private setupSocketEventHandlers(): void {
    if (!this.connection) return;
    const socket = this.connection.socket;
    socket.addEventListener('message', (event) => {
      this.handleWebSocketMessage(event);
    });
    socket.addEventListener('close', (event) => {
      this.handleWebSocketClose(event);
    });
    socket.addEventListener('error', (event) => {
      this.handleWebSocketError(event);
    });
  private async handleWebSocketMessage(event: MessageEvent): Promise<void> {

  try {
  this.connectionState.messagesReceived++;
  this.connectionState.bytesTransferred += event.data.length;
  const message = JSON.parse(event.data);
  if (this.config.debugMode) {
  console.log('Received WebSocket message:', message);
  switch (message.type) {
  case 'handshake_ack':,
  await this.handleHandshakeAck(message);
  break;
  case 'state_change':,
  await this.handleStateChangeMessage(message);
  break;
  case 'optimistic_confirm':,
  await this.handleOptimisticConfirm(message);
  break;
  case 'optimistic_reject':,
  await this.handleOptimisticReject(message);
  break;
  case 'sync_request':,
  await this.handleSyncRequest(message);
  break;
  case 'ping':,
  await this.handlePing(message);
  break;
  case 'pong':,
  await this.handlePong(message);
  break;
  default:,
  console.warn('Unknown message type:', message.type);
} catch (error) {
      console.error('Error handling WebSocket message:', error);
      this.emit('messageError', { error, message: event.data });
  private handleWebSocketClose(event: CloseEvent): void {
    this.connectionState.status = 'disconnected';
    this.stopHeartbeat();
    if (event.code !== 1000) { // Not a normal closure
      this.emit('connectionLost', { code: event.code, reason: event.reason });
      this.scheduleReconnect();
    } else {
  this.emit('disconnected');
  private handleWebSocketError(event: Event): void {,
  console.error('WebSocket error:', event);
  this.connectionState.status = 'error';
  this.emit('connectionError', new ConnectionError('WebSocket error'));
  // Message handling
  private async handleHandshakeAck(message: any): Promise<void> {,
  if (this.connection) {
  this.connection.isReady = true;
  this.emit('handshakeComplete', message);
  private async handleStateChangeMessage(message: any): Promise<void> {,
  const syncMessage: SyncMessage = message.payload;
  await this.synchronizer.handleRemoteStateChange(syncMessage);
  // Notify subscribers
  this.notifySubscribers(syncMessage.domain, syncMessage.payload.change, {)
  source: 'remote',
  optimistic: syncMessage.payload.optimistic || false,
  clientId: syncMessage.sessionId,
  timestamp: syncMessage.timestamp,
});
  private async handleOptimisticConfirm(message: any): Promise<void> {

    const { updateId } = message.payload;
    await this.synchronizer.confirmOptimisticUpdate(updateId);
    const update = this.optimisticUpdates.get(updateId);
    if (update) {
      this.optimisticUpdates.delete(updateId);
      this.emit('optimisticUpdateConfirmed', { updateId, domain: update.domain });
  private async handleOptimisticReject(message: any): Promise<void> {

    const { updateId, reason } = message.payload;
    await this.synchronizer.rollbackOptimisticUpdate(updateId);
    const update = this.optimisticUpdates.get(updateId);
    if (update) {
      this.optimisticUpdates.delete(updateId);
      this.emit('optimisticUpdateRejected', { updateId, domain: update.domain, reason });
  private async handleSyncRequest(message: any): Promise<void> {

    // Server is requesting a full sync
    await this.synchronizer.requestFullSync();
  private async handlePing(message: any): Promise<void> {

    await this.sendPong(message.id);
  private async handlePong(message: any): Promise<void> {

    if (this.connection) {
      const now = Date.now();
      this.connection.latency = now - this.connection.lastPing;
      this.connectionState.latency = this.connection.latency;
  // State subscription system
  subscribeToStateChanges();
    domain: string,
    callback: StateChangeCallback,
    filters: SubscriptionFilter = [],
    options: SubscriptionOptions = {}
  ): () => void {
  const subscription: StateSubscription = {,
  id: this.generateSubscriptionId(),
  domain,
  filters,
  callback,
  options: {
  includeOptimistic: true,
  batchUpdates: false,
  throttleMs: 0,
  priority: 'normal',
  ...options
};
    this.subscriptions.set(subscription.id, subscription);
    // Send subscription request to server
    this.sendMessage({)
  type: 'subscribe',
  payload: {
  domain,
  filters,
  options
});
    // Return unsubscribe function
    return () => {
      this.subscriptions.delete(subscription.id);
      this.sendMessage({)
  type: 'unsubscribe',
        payload: { subscriptionId: subscription.id }
      });
    };
  private notifySubscribers(domain: string)
    change: StateChange<any>,
    metadata: ChangeMetadata): void {,
    for (const subscription of this.subscriptions.values()) {
      if (subscription.domain !== domain && subscription.domain !== '*') {
        continue;
      // Apply filters
      if (!this.matchesFilters(change, subscription.filters)) {
        continue;
      // Skip optimistic updates if not requested
      if (metadata.optimistic && !subscription.options.includeOptimistic) {
        continue;
      try {
        subscription.callback(change, metadata);
      } catch (error) {
  console.error('Error in subscription callback:', error);
  private matchesFilters(change: StateChange<any>, filters: SubscriptionFilter): boolean {,
  if (filters.length === 0) return true;
  return filters.every(filter => {)
  switch (filter.type) {
  case 'change_type':,
  return filter.value === change.type;
  case 'user':,
  return filter.value === change.userId;
  case 'path':,
  // This would check if the change affects a specific path
  return true; // Simplified for now
  case 'custom':,
  return typeof filter.value === 'function'
  ? (filter.value as Function)(change)
  : true;
  default:,
  return true;
});
  // Optimistic updates
  async optimisticUpdate(domain: string, mutation: StateMutation): Promise<string> {

    if (!this.config.enableOptimistic) {
      throw new OptimisticUpdateError('Optimistic updates are disabled', '');
    if (!this.isConnected()) {
      throw new OptimisticUpdateError('Not connected to server', '');
    const updateId = this.generateUpdateId();
    try {
      // Create state change from mutation
      const change: StateChange<any> = {,
  id: this.generateChangeId(),
        timestamp: Date.now(),
        type: `OPTIMISTIC_${mutation.operation.toUpperCase()}`}
},
  payload: {
  path: mutation.path,
  value: mutation.value,
  operation: mutation.operation,
  optimistic: true,
  updateId
},
  source: 'local'
  };
      // Apply optimistic update locally
      const rollbackId = await this.synchronizer.applyOptimisticUpdate(domain, change);
      // Track the update
      const optimisticUpdate: OptimisticUpdate = {,
  id: updateId,
  domain,
  change,
  rollbackFn: () => this.synchronizer.rollbackOptimisticUpdate(rollbackId),
  timestamp: Date.now(),
  confirmed: false,
  clientId: this.connection?.id || '',
};
      this.optimisticUpdates.set(updateId, optimisticUpdate);
      // Send to server for confirmation
      await this.sendMessage({)
  type: 'optimistic_update',
  payload: {
  updateId,
  domain,
  mutation,
  change
});
      this.emit('optimisticUpdateApplied', { updateId, domain, mutation });
      return updateId;
    } catch (error) {
      throw new OptimisticUpdateError()
        `Failed to apply optimistic update: ${error.message}`}
}
        updateId
      );
  async syncWithServer(mutation: StateMutation): Promise<void> {

    if (!this.isConnected()) {
      throw new Error('Not connected to server');
    await this.sendMessage({)
  type: 'sync_mutation',
      payload: { mutation }
    });
  // Domain management
  registerDomain(domain: DomainStateContainer): void {
    const domainName = domain.getDomainName();
    this.domains.set(domainName, domain);
    this.synchronizer.registerDomain(domain);
    // If connected, update server about new domain
    if (this.isConnected()) {
      this.sendMessage({)
  type: 'register_domain',
        payload: { domain: domainName }
      });
  unregisterDomain(domainName: string): void {
    this.domains.delete(domainName);
    this.synchronizer.unregisterDomain(domainName);
    if (this.isConnected()) {
      this.sendMessage({)
  type: 'unregister_domain',
        payload: { domain: domainName }
      });
  // Message sending
  private async sendMessage(message: any): Promise<void> {

  if (!this.isConnected() || !this.connection?.isReady) {
  this.messageQueue.push(message);
  return;
  try {
  const payload = JSON.stringify(message);
  this.connection.socket.send(payload);
  this.connectionState.messagesSent++;
  this.connectionState.bytesTransferred += payload.length;
  if (this.config.debugMode) {
  console.log('Sent WebSocket message:', message);
} catch (error) {
  console.error('Failed to send message:', error);
  this.messageQueue.push(message); // Re-queue for retry
  throw error;
  private async sendHandshake(): Promise<void> {,
  await this.sendMessage({)
  type: 'handshake',
  payload: {
  clientId: this.connection?.id,
  userId: this.connection?.userId,
  domains: Array.from(this.domains.keys()),
  capabilities: {
  optimisticUpdates: this.config.enableOptimistic,
  compression: this.config.enableCompression,
  heartbeat: this.config.enableHeartbeat,
},
  metadata: this.connection?.metadata;
  });
  private async sendPing(): Promise<void> {

    if (this.connection) {
      this.connection.lastPing = Date.now();
      await this.sendMessage({)
  type: 'ping',
        payload: { timestamp: this.connection.lastPing }
      });
  private async sendPong(pingId: string): Promise<void> {

    await this.sendMessage({)
  type: 'pong',
      payload: { pingId, timestamp: Date.now() }
    });
  // Connection utilities
  private processQueuedMessages(): void {
  const queue = [...this.messageQueue];
  this.messageQueue = [];
  queue.forEach(message => {)
  this.sendMessage(message).catch(error => {)
  console.error('Failed to send queued message:', error);
});
    });
  private startHeartbeat(): void {
  if (!this.config.enableHeartbeat) return;
  this.pingTimer = setInterval(() => {
  this.sendPing().catch(error => {)
  console.error('Ping failed:', error);
});
    }, this.config.pingInterval);
  private stopHeartbeat(): void {
  if (this.pingTimer) {
  clearInterval(this.pingTimer);
  this.pingTimer = undefined;
  private scheduleReconnect(): void {,
  if (this.connectionState.reconnectAttempts >= this.config.maxReconnectAttempts) {
  this.emit('maxReconnectAttemptsReached');
  return;
  this.connectionState.status = 'reconnecting';
  this.reconnectTimer = setTimeout(() => {
  if (this.connection) {
  this.connect(this.connection.userId, this.connection.metadata.sessionId)
  .catch(error => {)
  console.error('Reconnect failed:', error);
});
    }, this.config.reconnectInterval);
  private setupSynchronizerEvents(): void {
  this.synchronizer.on('broadcastMessage', (message: SyncMessage) => {,
  this.sendMessage({)
  type: 'state_change',
  payload: message,
}).catch(error => {)
  console.error('Failed to broadcast state change:', error);
});
    });
    this.synchronizer.on('conflictResolved', (event) => {
      this.emit('conflictResolved', event);
    });
  // Utility methods
  isConnected(): boolean {
    return this.connectionState.status === 'connected' && 
           this.connection?.socket.readyState === WebSocket.OPEN;
  getConnectionState(): Readonly<ConnectionState> {
    return { ...this.connectionState };
  getLatency(): number {
    return this.connection?.latency || 0;
  getPendingOptimisticUpdates(): OptimisticUpdate {
    return Array.from(this.optimisticUpdates.values());
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateUpdateId(): string {
    return `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateChangeId(): string {
    return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  // Cleanup
  destroy(): void {
    this.disconnect();
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    this.synchronizer.destroy();
    this.subscriptions.clear();
    this.optimisticUpdates.clear();
    this.domains.clear();
    this.removeAllListeners();

// React hooks for real-time state management
export function useRealTimeState() {
  // This would be implemented with React hooks
  // Returns the global real-time state manager instance
  return null;

export function useOptimisticMutation(domain: string) {
  // This would be implemented with React hooks
  // Returns a function to perform optimistic mutations
  return null;

export function useStateSubscription()
  domain: string,
  filters?: SubscriptionFilter,
  options?: SubscriptionOptions
  // This would be implemented with React hooks
  // Returns current state and manages subscription lifecycle
  return null;

// Global real-time state manager instance
export const globalRealTimeManager = new RealTimeStateManager();