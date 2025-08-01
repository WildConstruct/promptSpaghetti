import { EventEmitter } from 'events';
import { OfflineOperationQueue, QueuedOperation, OfflineQueueConfig } from './OfflineOperationQueue';
import { ConnectionStateManager, ConnectionState, ConnectionQuality, ConnectionStateConfig } from './ConnectionStateManager';
import { ReconnectionHandler, ReconnectionState, ReconnectionConfig } from './ReconnectionHandler';
import { SynchronizationRecovery, DocumentState, SyncDelta, RecoveryConfig } from './SynchronizationRecovery';


export interface NetworkResilienceConfig { enabled: boolean;
  offlineQueue: Partial<OfflineQueueConfig>;
  connectionState: Partial<ConnectionStateConfig>;
  reconnection: Partial<ReconnectionConfig>;
  recovery: Partial<RecoveryConfig>;
  notifications: { }
  enabled: boolean;
  showOfflineIndicator: boolean;
  showConnectionQuality: boolean;
  notifyOnReconnect: boolean;
  notifyOnSyncComplete: boolean;


};
  persistence: { ,
  enabled: boolean;
  storageKey: string;
  maxStorageSize: number };
  performance: { ,
  enableMetrics: boolean;
  metricsInterval: number;
  enableProfiling: boolean };


export interface ResilienceMetrics { uptime: number;
  totalDowntime: number;
  connectionAttempts: number;
  successfulReconnections: number;
  queuedOperations: number;
  syncedOperations: number;
  pendingOperations: number;
  averageReconnectTime: number;
  dataLoss: number;
  conflicts: number }



export interface NetworkStatus { isOnline: boolean;
  connectionState: ConnectionState;
  connectionQuality: ConnectionQuality;
  reconnectionState: ReconnectionState;
  queueSize: number;
  pendingSync: boolean;
  lastSync: number | null }
  metrics: ResilienceMetrics;


export class NetworkResilienceManager extends EventEmitter {
  private config: NetworkResilienceConfig;
  private offlineQueue: OfflineOperationQueue;
  private connectionState: ConnectionStateManager;
  private reconnectionHandler: ReconnectionHandler;
  private syncRecovery: SynchronizationRecovery;
  private isInitialized: boolean = false;
  private isEnabled: boolean = true;
  private documentId: string | null = null;
  private userId: string | null = null;
  private websocket: WebSocket | null = null;
  private metricsTimer: NodeJS.Timeout | null = null;
  private persistenceTimer: NodeJS.Timeout | null = null;
  private syncInProgress: boolean = false;
  private lastSyncTime: number | null = null;
  private metrics: ResilienceMetrics;
  constructor(config: Partial<NetworkResilienceConfig> = {}) { super();
    this.config = {
      enabled: true }
      offlineQueue: {}
      connectionState: {}
      reconnection: {}
      recovery: {}
      notifications: { 
  enabled: true
  showOfflineIndicator: true
  showConnectionQuality: true
  notifyOnReconnect: true
  notifyOnSyncComplete: true }

  persistence: { 
  enabled: true
  storageKey: 'network-resilience-state'
  maxStorageSize: 50 * 1024 * 1024 // 50MB }

  performance: { 
  enableMetrics: true
  metricsInterval: 30000, // 30 seconds
  enableProfiling: false }

      ...config
    };
    this.metrics = { uptime: 0
  totalDowntime: 0
  connectionAttempts: 0
  successfulReconnections: 0
  queuedOperations: 0
  syncedOperations: 0
  pendingOperations: 0
  averageReconnectTime: 0
  dataLoss: 0
  conflicts: 0 }
};
    this.initializeComponents();
    this.setupEventHandlers();
  /**
   * Initialize the network resilience system
   */
  async initialize(documentId: string, userId: string): Promise<void> {

    if (this.isInitialized) {
      console.warn('NetworkResilienceManager already initialized');
      return;
    this.documentId = documentId;
    this.userId = userId;
    console.log(`Initializing network resilience for document ${documentId}, user ${userId}`);}
    // Load persisted state
    if (this.config.persistence.enabled) {
      await this.loadPersistedState();
    // Start monitoring
    this.startMetricsCollection();
    this.startPersistence();
    this.isInitialized = true;
    this.emit('initialized', { documentId, userId });
  /**
   * Connect to WebSocket server
   */
  async connect(websocketUrl: string, authToken?: string): Promise<void> {

    if (!this.isInitialized) {
      throw new Error('Manager not initialized. Call initialize() first.');
    console.log(`Connecting to ${websocketUrl}`);}
    this.connectionState.setState(ConnectionState.CONNECTING, 'User initiated connection');
    try { await this.establishWebSocketConnection(websocketUrl, authToken);
      this.connectionState.setState(ConnectionState.CONNECTED, 'WebSocket connected');
      // Process any queued operations
      await this.processQueuedOperations() } catch (error) {
      console.error('Connection failed:', error);
      this.connectionState.setState(ConnectionState.FAILED, 'Connection attempt failed');
      // Start reconnection process
      if (this.config.reconnection) {
        await this.startReconnection();
      throw error;
  /**
   * Disconnect from server
   */
  disconnect(reason: string = 'User requested'): void {
    console.log(`Disconnecting: ${reason}`);}
    this.reconnectionHandler.stopReconnection();
    if (this.websocket) { this.websocket.close(1000, reason);
  this.websocket = null;
  this.connectionState.setState(ConnectionState.DISCONNECTED, reason);
  /**
  * Queue operation for processing (offline or online)
  */
  queueOperation(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount'>): string {
  if (!this.isEnabled) {
  throw new Error('Network resilience is disabled');
  const operationId = this.offlineQueue.enqueue({)
  ...operation
  documentId: this.documentId || 'unknown'
  userId: this.userId || 'unknown' }
});
    this.metrics.queuedOperations++;
    this.updateMetrics();
    // Try to process immediately if online
    if (this.connectionState.isOnline() && !this.syncInProgress) { this.processQueuedOperations().catch(error => {)
  console.error('Failed to process queued operations:', error) });
    return operationId;
  /**
   * Get current network status
   */
  getStatus(): NetworkStatus { return {
      isOnline: this.connectionState.isOnline()
      connectionState: this.connectionState.getState()
      connectionQuality: this.connectionState.getQuality()
      reconnectionState: this.reconnectionHandler.getState()
      queueSize: this.offlineQueue.size()
      pendingSync: this.syncInProgress
      lastSync: this.lastSyncTime }
      metrics: { ...this.metrics }
    };
  /**
   * Force synchronization
   */
  async forceSync(): Promise<SyncDelta | null> { if (!this.isInitialized || !this.documentId) {
  throw new Error('Manager not properly initialized');
  if (this.syncInProgress) {
  console.log('Sync already in progress');
  return null;
  console.log('Forcing synchronization');
  this.syncInProgress = true;
  try {
  // Get current document state (would integrate with actual document system)
  const localState = await this.getCurrentDocumentState();
  // Perform recovery sync
  const delta = await this.syncRecovery.startRecovery(;);
  this.documentId
  localState
  () => this.getServerDocumentState()
  );
  this.lastSyncTime = Date.now();
  this.metrics.syncedOperations += delta.operations.length;
  this.metrics.conflicts += delta.conflicts.length;
  this.emit('sync_completed', {)
  operationsSynced: delta.operations.length
  conflicts: delta.conflicts.length
  duration: Date.now() - (this.lastSyncTime - 1000) // Approximate }
});
      return delta;
 finally { this.syncInProgress = false;
  /**
   * Get comprehensive metrics
   */
  getMetrics(): ResilienceMetrics {
    return {
      ...this.metrics
      pendingOperations: this.offlineQueue.size()
      ...this.connectionState.getStatistics()
      ...this.reconnectionHandler.getStats() }
      ...this.syncRecovery.getStats(})
  /**
   * Enable or disable network resilience
   */
  setEnabled(enabled: boolean): void { this.isEnabled = enabled;
  if (!enabled) {
  this.reconnectionHandler.stopReconnection();
  this.emit('enabled_changed', enabled);
  /**
  * Clear all queued operations
  */
  clearQueue(): void {
  const clearedCount = this.offlineQueue.size();
  this.offlineQueue.clear();
  this.emit('queue_cleared', clearedCount);
  /**
  * Export current state for debugging
  */
  exportState(): any {
  return {
  config: this.config
  status: this.getStatus()
  metrics: this.getMetrics()
  queuedOperations: this.offlineQueue.getMetrics()
  connectionHistory: this.connectionState.getStateData().stateHistory
  reconnectionAttempts: this.reconnectionHandler.getRecentAttempts()
  pendingConflicts: this.syncRecovery.getPendingConflicts()
  timestamp: Date.now() }
};
  /**
   * Cleanup and shutdown
   */
  cleanup(): void { console.log('Cleaning up NetworkResilienceManager');
    this.disconnect('Manager cleanup');
    this.stopMetricsCollection();
    this.stopPersistence();
    this.offlineQueue.cleanup();
    this.connectionState.cleanup();
    this.reconnectionHandler.cleanup();
    this.syncRecovery.cleanup();
    this.removeAllListeners();
    this.isInitialized = false;
  /**
   * Initialize sub-components
   */
  private initializeComponents(): void {
    // Initialize offline queue
    this.offlineQueue = new OfflineOperationQueue({)
  ...this.config.offlineQueue }
      storageKey: `${this.config.persistence.storageKey}-queue`}
    });
    // Initialize connection state manager
    this.connectionState = new ConnectionStateManager(this.config.connectionState);
    // Initialize reconnection handler
    this.reconnectionHandler = new ReconnectionHandler(this.config.reconnection);
    // Initialize sync recovery
    this.syncRecovery = new SynchronizationRecovery(this.config.recovery);
    // Set up reconnection factory
    this.reconnectionHandler.setConnectionFactory(async () => {
      try {
        // Attempt to reconnect WebSocket
        if (this.websocket) {
          this.websocket.close();
        // This would use the last known URL and auth
        // For now, just simulate reconnection
        await new Promise(resolve => setTimeout(resolve, 1000));
        return Math.random() > 0.3; // 70% success rate for simulation
 catch (error) { console.error('Reconnection attempt failed:', error);
  return false });
  /**
   * Set up event handlers between components
   */
  private setupEventHandlers(): void { // Connection state events
    this.connectionState.on('state_changed', (event) => {
      this.emit('connection_state_changed', event);
      if (event.newState === ConnectionState.DISCONNECTED) {
        this.startReconnection() } else if (event.newState === ConnectionState.CONNECTED) { this.processQueuedOperations() });
    this.connectionState.on('quality_changed', (event) => { this.emit('connection_quality_changed', event) });
    // Reconnection events
    this.reconnectionHandler.on('reconnection_success', (event) => { this.metrics.successfulReconnections++;
      this.metrics.averageReconnectTime = (this.metrics.averageReconnectTime * 0.8) + (event.duration * 0.2);
      this.emit('reconnection_success', event);
      this.processQueuedOperations() });
    this.reconnectionHandler.on('reconnection_failed', (event) => { this.emit('reconnection_failed', event) });
    // Queue events
    this.offlineQueue.on('operation_queued', (operation) => { this.emit('operation_queued', operation) });
    this.offlineQueue.on('operation_success', (operation) => { this.metrics.syncedOperations++;
      this.emit('operation_synced', operation) });
    this.offlineQueue.on('operation_failed', (operation, error) => { this.emit('operation_failed', operation, error) });
    // Sync recovery events
    this.syncRecovery.on('recovery_success', (event) => { this.emit('sync_recovery_success', event) });
    this.syncRecovery.on('conflict_detected', (conflict) => { this.metrics.conflicts++;
      this.emit('conflict_detected', conflict) });
  /**
   * Establish WebSocket connection
   */
  private async establishWebSocketConnection(url: string, authToken?: string): Promise<void> { return new Promise((resolve, reject) => {
  try {
  this.websocket = new WebSocket(url);
  this.websocket.onopen = () => {
  console.log('WebSocket connected');
  // Send authentication if provided
  if (authToken && this.documentId && this.userId) {
  this.websocket?.send(JSON.stringify({)
  type: 'auth_request'
  payload: {
  token: authToken
  documentId: this.documentId
  userId: this.userId
  userName: 'User', // Would come from user context
  platform: navigator.platform }
}));
          resolve();
        };
        this.websocket.onerror = (error) => { console.error('WebSocket error:', error);
  reject(new Error('WebSocket connection failed')) };
        this.websocket.onclose = (event) => {
          console.log(`WebSocket closed: ${event.code} - ${event.reason}`);}
          this.connectionState.setState(ConnectionState.DISCONNECTED, event.reason || 'Connection closed');
        };
        this.websocket.onmessage = (event) => { this.handleWebSocketMessage(event) };
        // Connection timeout
        setTimeout(() => { if (this.websocket?.readyState !== WebSocket.OPEN) {
            this.websocket?.close();
            reject(new Error('WebSocket connection timeout')) }, 10000);
 catch (error) { reject(error) });
  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(event: MessageEvent): void { try {
  const message = JSON.parse(event.data);
  switch (message.type) {
  case 'auth_response': }
  if (message.payload.success) { console.log('Authentication successful') } else { console.error('Authentication failed:', message.payload.message);
  break;
  case 'graph_update':
  this.handleRemoteGraphUpdate(message.payload);
  break;
  case 'conflict_detected':
  this.handleConflictDetected(message.payload);
  break;
  case 'pong':
  this.connectionState.updateMetrics({)
  latency: Date.now() - message.payload.timestamp }
});
        break;
      default:
        console.log('Unhandled message type:', message.type);
 catch (error) {
      console.error('Failed to parse WebSocket message:', error);
  /**
   * Start reconnection process
   */
  private async startReconnection(): Promise<void> {

    if (!this.isEnabled || this.reconnectionHandler.isReconnecting()) {
      return;
    this.metrics.connectionAttempts++;
    await this.reconnectionHandler.startReconnection();
  /**
   * Process queued operations
   */
  private async processQueuedOperations(): Promise<void> {

    if (!this.connectionState.isOnline() || this.syncInProgress) {
      return;
    const batch = this.offlineQueue.dequeue(10); // Process in small batches;
    if (batch.length === 0) {
      return;
    console.log(`Processing ${batch.length} queued operations`);}
    for (const operation of batch) { try {
        await this.sendOperationToServer(operation);
        this.offlineQueue.markSuccess(operation.id) } catch (error) {
        console.error(`Failed to process operation ${operation.id}:`, error);}
        this.offlineQueue.markFailure(operation.id, error as Error);
  /**
   * Send operation to server
   */
  private async sendOperationToServer(operation: QueuedOperation): Promise<void> { if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
  throw new Error('WebSocket not connected');
  return new Promise((resolve, reject) => {
  const message = {
  type: operation.type
  payload: operation.payload
  messageId: operation.id }
};
      // Set up response handler
      const handleResponse = (event: MessageEvent) => { try {
          const response = JSON.parse(event.data);
          if (response.messageId === operation.id) {
            this.websocket?.removeEventListener('message', handleResponse);
            if (response.type.includes('error')) {
              reject(new Error(response.payload.error)) } else { resolve() } catch (error) {
          // Ignore parsing errors for other messages
      };
      this.websocket.addEventListener('message', handleResponse);
      this.websocket.send(JSON.stringify(message));
      // Timeout after 10 seconds
      setTimeout(() => { this.websocket?.removeEventListener('message', handleResponse);
        reject(new Error('Operation timeout')) }, 10000);
    });
  /**
   * Handle remote graph updates
   */
  private handleRemoteGraphUpdate(payload: any): void { // This would integrate with the actual graph system
    this.emit('remote_update', payload);
  /**
   * Handle conflict detection
   */
  private handleConflictDetected(payload: any): void {
    this.metrics.conflicts++;
    this.emit('conflict_detected', payload);
  /**
   * Get current document state (stub)
   */
  private async getCurrentDocumentState(): Promise<DocumentState> {

    // This would integrate with the actual document/graph system
    return {
      version: 1
      checksum: 'placeholder'
      lastModified: Date.now()
      operations: [] }
      metadata: {}
    };
  /**
   * Get server document state (stub)
   */
  private async getServerDocumentState(): Promise<DocumentState> { // This would make an HTTP request to get server state
    return {
      version: 2
      checksum: 'server-placeholder'
      lastModified: Date.now()
      operations: [] }
      metadata: {}
    };
  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void { if (!this.config.performance.enableMetrics) return;
    this.metricsTimer = setInterval(() => {
      this.updateMetrics() }, this.config.performance.metricsInterval);
  /**
   * Stop metrics collection
   */
  private stopMetricsCollection(): void { if (this.metricsTimer) {
  clearInterval(this.metricsTimer);
  this.metricsTimer = null;
  /**
  * Update metrics
  */
  private updateMetrics(): void {
  const queueMetrics = this.offlineQueue.getMetrics();
  const connectionStats = this.connectionState.getStatistics();
  this.metrics.pendingOperations = queueMetrics.pendingOperations;
  this.metrics.uptime = connectionStats.uptime;
  this.metrics.totalDowntime = connectionStats.totalDowntime;
  this.emit('metrics_updated', this.metrics);
  /**
  * Start persistence
  */
  private startPersistence(): void { }
  if (!this.config.persistence.enabled) return;
  this.persistenceTimer = setInterval(() => { this.saveState() }, 60000); // Save every minute
  /**
   * Stop persistence
   */
  private stopPersistence(): void { if (this.persistenceTimer) {
  clearInterval(this.persistenceTimer);
  this.persistenceTimer = null;
  /**
  * Save current state to storage
  */
  private saveState(): void {
  if (typeof localStorage === 'undefined') return;
  try {
  const state = {
  metrics: this.metrics
  lastSync: this.lastSyncTime
  timestamp: Date.now() }
};
      localStorage.setItem(this.config.persistence.storageKey, JSON.stringify(state));
 catch (error) {
      console.error('Failed to save state:', error);
  /**
   * Load persisted state
   */
  private async loadPersistedState(): Promise<void> {

    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem(this.config.persistence.storageKey);
      if (!stored) return;
      const state = JSON.parse(stored);
      // Restore metrics
      if (state.metrics) {
        this.metrics = { ...this.metrics, ...state.metrics };
      if (state.lastSync) { this.lastSyncTime = state.lastSync;
      console.log('Restored persisted state') } catch (error) {
      console.error('Failed to load persisted state:', error);