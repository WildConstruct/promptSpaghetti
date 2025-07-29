/**
 * State Synchronizer
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 2: Real-Time Data Synchronization
 * 
 * Handles real-time state synchronization across clients
 */
import { EventEmitter } from 'events';
import { StateChange } from '../containers/BaseStateContainer';
import { DomainStateContainer, CrossDomainChange } from './StateOrchestrator';
import { globalConflictResolver } from './ConflictResolver';

// Synchronization types

export interface SyncMessage {
  id: string;
  type: SyncMessageType;
  domain: string;
  payload: any;
  timestamp: number;
  userId: string;
  sessionId: string;
  version: number;
  checksum?: string;
}
export type SyncMessageType = 
  | 'STATE_CHANGE'
  | 'BULK_CHANGE' 
  | 'SYNC_REQUEST'
  | 'SYNC_RESPONSE'
  | 'CONFLICT_RESOLUTION'
  | 'HEARTBEAT'
  | 'CLIENT_JOIN'
  | 'CLIENT_LEAVE'
  | 'FORCE_SYNC';

export interface SyncClient {
  id: string;
  userId: string;
  sessionId: string;
  domains: string;
  lastSeen: number;
  version: number;
  isActive: boolean;
  latency: number;
  metadata: {
  userAgent?: string;
  ip?: string;
  location?: string;
};
}
export interface SyncState {
  version: number;
  clients: Map<string, SyncClient>;
  pendingChanges: Map<string, PendingChange>;
  conflictQueue: ConflictQueueItem;
  syncHistory: SyncHistoryEntry;
  lastFullSync: number;
}
export interface PendingChange {
  id: string;
  change: StateChange<any>;
  domain: string;
  clientId: string;
  timestamp: number;
  acknowledged: Set<string>;
  requiredAcks: number;
  timeout: number;
  retryCount: number;
}
export interface ConflictQueueItem {
  id: string;
  conflictId: string;
  localChange: StateChange<any>;
  remoteChange: StateChange<any>;
  domain: string;
  priority: number;
  timestamp: number;
}
export interface SyncHistoryEntry {
  timestamp: number;
  type: 'sync' | 'conflict' | 'error' | 'client_event';
  clientId?: string;
  domain?: string;
  message: string;
  metadata?: Record<string, any>;
}
export interface OptimisticUpdate {
  id: string;
  domain: string;
  change: StateChange<any>;
  rollbackFn: () => void;
  timestamp: number;
  confirmed: boolean;
  clientId: string;
}
export interface SyncConfiguration {
  batchInterval: number;
  maxBatchSize: number;
  conflictResolutionTimeout: number;
  heartbeatInterval: number;
  clientTimeout: number;
  maxRetries: number;
  enableOptimisticUpdates: boolean;
  enableConflictResolution: boolean;
  syncQuality: 'fast' | 'reliable' | 'eventual';
  // Main state synchronizer class
}
export class StateSynchronizer extends EventEmitter {
  private syncState: SyncState;
  private domains = new Map<string, DomainStateContainer>();
  private optimisticUpdates = new Map<string, OptimisticUpdate>();
  private batchQueue: SyncMessage = [];
  private batchTimer?: NodeJS.Timeout;
  private heartbeatTimer?: NodeJS.Timeout;
  private cleanupTimer?: NodeJS.Timeout;
  private config: SyncConfiguration;
  private isServer: boolean;
  private clientId: string;
  constructor();
    config: Partial<SyncConfiguration> = {},
    isServer: boolean = false,
    clientId?: string
    super();
    this.config = {
  batchInterval: 50, // 50ms batching,
  maxBatchSize: 100,
  conflictResolutionTimeout: 5000,
  heartbeatInterval: 30000, // 30 seconds,
  clientTimeout: 60000, // 1 minute,
  maxRetries: 3,
  enableOptimisticUpdates: true,
  enableConflictResolution: true,
  syncQuality: 'reliable',
  ...config
};
    this.isServer = isServer;
    this.clientId = clientId || this.generateClientId();
    this.syncState = {
  version: 1,
  clients: new Map(),
  pendingChanges: new Map(),
  conflictQueue: [],
  syncHistory: [],
  lastFullSync: Date.now(),
};
    this.setupTimers();
    this.setupEventHandlers();
  // Domain registration
  registerDomain(domain: DomainStateContainer): void {
    const domainName = domain.getDomainName();
    this.domains.set(domainName, domain);
    // Subscribe to domain state changes
    domain.on('stateChanged', (event) => {
      this.handleDomainStateChange(domainName, event);
    });
    this.emit('domainRegistered', { domain: domainName, clientId: this.clientId });
  unregisterDomain(domainName: string): void {
    const domain = this.domains.get(domainName);
    if (domain) {
      domain.removeAllListeners('stateChanged');
      this.domains.delete(domainName);
      this.emit('domainUnregistered', { domain: domainName, clientId: this.clientId });
  // Client management
  addClient(client: SyncClient): void {
    this.syncState.clients.set(client.id, client);
    this.addToHistory('client_event', `Client ${client.id} joined`, { clientId: client.id });}
    this.emit('clientJoined', client);
    // Send current state to new client
    if (this.isServer) {
      this.sendFullSyncToClient(client.id);
  removeClient(clientId: string): void {
    const client = this.syncState.clients.get(clientId);
    if (client) {
      this.syncState.clients.delete(clientId);
      this.addToHistory('client_event', `Client ${clientId} left`, { clientId });}
      this.emit('clientLeft', client);
      // Clean up pending changes for this client
      this.cleanupClientPendingChanges(clientId);
  updateClientActivity(clientId: string): void {
  const client = this.syncState.clients.get(clientId);
  if (client) {
  client.lastSeen = Date.now();
  client.isActive = true;
  // State synchronization
  async broadcastStateChange(domain: string)
  change: StateChange<any>,
  excludeClient?: string): Promise<void> {,
  const message: SyncMessage = {,
  id: this.generateMessageId(),
  type: 'STATE_CHANGE',
  domain,
  payload: {
  change,
  optimistic: false,
},
  timestamp: Date.now(),
      userId: change.userId || 'system',
      sessionId: this.clientId,
      version: this.syncState.version++,
      checksum: this.calculateChecksum(change);
  };
    // Add to batch queue
    this.batchQueue.push(message);
    // Track as pending change if reliable sync required
    if (this.config.syncQuality === 'reliable') {
      this.trackPendingChange(message, excludeClient);
    // Process batch if needed
    if (this.batchQueue.length >= this.config.maxBatchSize) {
      await this.processBatch();
    this.emit('stateChangeBroadcast', { message, excludeClient });
  async handleRemoteStateChange(message: SyncMessage): Promise<void> {
    try {
      this.updateClientActivity(message.sessionId);
      const domain = this.domains.get(message.domain);
      if (!domain) {
        console.warn(`Domain ${message.domain} not found for sync message`);}
        return;
      // Validate message
      if (!this.validateSyncMessage(message)) {
        console.error('Invalid sync message received:', message);
        return;
      // Check for conflicts
      const conflict = await this.detectConflict(message);
      if (conflict) {
        await this.handleConflict(conflict);
        return;
      // Apply the change
      await this.applyRemoteChange(domain, message);
      // Send acknowledgment if required
      if (this.config.syncQuality === 'reliable') {
        await this.sendAcknowledgment(message);
      this.addToHistory('sync', `Applied remote change in ${message.domain}`, {)}
  },
  messageId: message.id,
        clientId: message.sessionId;
  });
    } catch (error) {
      console.error('Failed to handle remote state change:', error);
      this.addToHistory('error', `Failed to apply remote change: ${error.message}`, {)}
  },
  messageId: message.id,
        error: error.message;
  });
  // Optimistic updates
  async applyOptimisticUpdate(()
    domain: string,
    change: StateChange<any>,
  ): Promise<string> {
    if (!this.config.enableOptimisticUpdates) {
      throw new Error('Optimistic updates are disabled');
    const domainContainer = this.domains.get(domain);
    if (!domainContainer) {
      throw new Error(`Domain ${domain} not found`);}
    // Store current state for rollback
    const currentState = domainContainer.getState();
    const rollbackFn = () => {
  domainContainer.setState(() => currentState, {
  id: this.generateChangeId(),
  timestamp: Date.now(),
  type: 'ROLLBACK',
  payload: currentState,
  source: 'system',
});
    };
    // Apply optimistic update
    const updateId = this.generateUpdateId();
    const optimisticUpdate: OptimisticUpdate = {,
  id: updateId,
  domain,
  change,
  rollbackFn,
  timestamp: Date.now(),
  confirmed: false,
  clientId: this.clientId,
};
    this.optimisticUpdates.set(updateId, optimisticUpdate);
    // Apply the change locally
    await domainContainer.setState()
      (prevState) => this.applyChangeToState(prevState, change),
      { ...change, source: 'local' }
    );
    // Broadcast to other clients
    await this.broadcastStateChange(domain, {)
  ...change,
      payload: { ...change.payload, optimistic: true, updateId }
    });
    return updateId;
  async confirmOptimisticUpdate(updateId: string): Promise<void> {
    const update = this.optimisticUpdates.get(updateId);
    if (update) {
      update.confirmed = true;
      this.addToHistory('sync', `Optimistic update ${updateId} confirmed`);}
  async rollbackOptimisticUpdate(updateId: string): Promise<void> {
    const update = this.optimisticUpdates.get(updateId);
    if (update && !update.confirmed) {
      update.rollbackFn();
      this.optimisticUpdates.delete(updateId);
      this.addToHistory('sync', `Optimistic update ${updateId} rolled back`);}
      this.emit('optimisticUpdateRolledBack', { updateId, domain: update.domain });
  // Conflict detection and resolution
  private async detectConflict(message: SyncMessage): Promise<ConflictQueueItem | null> {
  const domain = message.domain;
  const remoteChange = message.payload.change;
  // Find pending local changes that might conflict
  for (const [pendingId, pendingChange] of this.syncState.pendingChanges) {
  if (pendingChange.domain === domain) {
  // Check if changes conflict (simplified check)
  if (this.changesConflict(pendingChange.change, remoteChange)) {
  return {
  id: this.generateConflictId(),
  conflictId: pendingId,
  localChange: pendingChange.change,
  remoteChange,
  domain,
  priority: this.calculateConflictPriority(pendingChange.change, remoteChange),
  timestamp: Date.now(),
};
    return null;
  private async handleConflict(conflict: ConflictQueueItem): Promise<void> {
    if (!this.config.enableConflictResolution) {
      console.warn('Conflict detected but resolution is disabled:', conflict.id);
      return;
    this.syncState.conflictQueue.push(conflict);
    this.addToHistory('conflict', `Conflict detected: ${conflict.id}`, {)}
  },
  domain: conflict.domain,
      conflictId: conflict.conflictId;
  });
    try {
      // Use the global conflict resolver
      const resolutions = await globalConflictResolver.detectAndResolveConflicts(;);
        [conflict.localChange],
        [conflict.remoteChange],
        this.domains.get(conflict.domain)?.getState(),
        conflict.domain
      );
      if (resolutions.length > 0) {
        const resolution = resolutions[0];
        // Apply the resolved state
        const domain = this.domains.get(conflict.domain);
        if (domain) {
          await domain.setState(() => resolution.resolvedState);
        // Remove from conflict queue
        this.syncState.conflictQueue = this.syncState.conflictQueue.filter()
          c => c.id !== conflict.id
        );
        this.addToHistory('conflict', `Conflict ${conflict.id} resolved`, {)}
  },
  strategy: resolution.strategy,
          confidence: resolution.confidence;
  });
        this.emit('conflictResolved', { conflict, resolution });
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      this.addToHistory('error', `Conflict resolution failed: ${error.message}`, {)}
  },
  conflictId: conflict.id;
  });
  // Batch processing
  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;
    const batch = this.batchQueue.splice(0, this.config.maxBatchSize);
    try {
      // Group by domain for efficient processing
      const domainGroups = new Map<string, SyncMessage>();
      batch.forEach(message => {)
  const existing = domainGroups.get(message.domain) || [];
        existing.push(message);
        domainGroups.set(message.domain, existing);
      });
      // Process each domain group
      for (const [domain, messages] of domainGroups) {
        await this.processDomainBatch(domain, messages);
      this.emit('batchProcessed', { messageCount: batch.length, domains: domainGroups.size });
    } catch (error) {
      console.error('Batch processing failed:', error);
      // Re-queue failed messages
      this.batchQueue.unshift(...batch);
  private async processDomainBatch(domain: string, messages: SyncMessage): Promise<void> {
    // Sort messages by timestamp to maintain order
    messages.sort((a, b) => a.timestamp - b.timestamp);
    for (const message of messages) {
      await this.broadcastMessage(message);
  // Message broadcasting (implementation depends on transport layer)
  private async broadcastMessage(message: SyncMessage): Promise<void> {
    // This would integrate with WebSocket server/client
    // For now, emit an event that can be handled by transport layer
    this.emit('broadcastMessage', message);
  // Full synchronization
  private async sendFullSyncToClient(clientId: string): Promise<void> {
    const client = this.syncState.clients.get(clientId);
    if (!client) return;
    try {
      // Collect current state from all domains
      const domainStates: Record<string, any> = {};
      for (const [domainName, domain] of this.domains) {
  if (client.domains.includes(domainName)) {
  domainStates[domainName] = domain.getState();
  const fullSyncMessage: SyncMessage = {,
  id: this.generateMessageId(),
  type: 'SYNC_RESPONSE',
  domain: 'all',
  payload: {
  states: domainStates,
  version: this.syncState.version,
  timestamp: Date.now(),
},
  timestamp: Date.now(),
        userId: 'system',
        sessionId: this.clientId,
        version: this.syncState.version;
  };
      this.emit('sendToClient', { clientId, message: fullSyncMessage });
    } catch (error) {
      console.error(`Failed to send full sync to client ${clientId}:`, error);}
  async requestFullSync(): Promise<void> {
  const syncRequest: SyncMessage = {,
  id: this.generateMessageId(),
  type: 'SYNC_REQUEST',
  domain: 'all',
  payload: {
  clientId: this.clientId,
  domains: Array.from(this.domains.keys()),
  lastSync: this.syncState.lastFullSync,
},
  timestamp: Date.now(),
      userId: 'system',
      sessionId: this.clientId,
      version: this.syncState.version;
  };
    this.emit('requestFullSync', syncRequest);
  // Event handlers and utilities
  private setupTimers(): void {
  // Batch processing timer
  this.batchTimer = setInterval(() => {
  this.processBatch().catch(error => {)
  console.error('Batch processing error:', error);
});
    }, this.config.batchInterval);
    // Heartbeat timer
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.config.heartbeatInterval);
    // Cleanup timer
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredData();
    }, 60000); // Clean up every minute
  private setupEventHandlers(): void {
  // Handle client timeouts
  this.on('clientTimeout', (clientId: string) => {,
  this.removeClient(clientId);
});
  private handleDomainStateChange(domainName: string, event: any): void {
  // Broadcast domain state changes to other clients
  this.broadcastStateChange(domainName, event.change).catch(error => {)
  console.error('Failed to broadcast state change:', error);
});
  private sendHeartbeat(): void {
  const heartbeat: SyncMessage = {,
  id: this.generateMessageId(),
  type: 'HEARTBEAT',
  domain: 'system',
  payload: {
  clientId: this.clientId,
  timestamp: Date.now(),
  activeClients: this.syncState.clients.size,
  pendingChanges: this.syncState.pendingChanges.size,
},
  timestamp: Date.now(),
      userId: 'system',
      sessionId: this.clientId,
      version: this.syncState.version;
  };
    this.emit('heartbeat', heartbeat);
  private cleanupExpiredData(): void {
    const now = Date.now();
    // Cleanup expired pending changes
    for (const [id, pending] of this.syncState.pendingChanges) {
      if (now > pending.timeout) {
        this.syncState.pendingChanges.delete(id);
        this.addToHistory('error', `Pending change ${id} timed out`);}
    // Cleanup expired optimistic updates
    for (const [id, update] of this.optimisticUpdates) {
      if (now - update.timestamp > this.config.conflictResolutionTimeout) {
        if (!update.confirmed) {
          this.rollbackOptimisticUpdate(id);
        } else {
  this.optimisticUpdates.delete(id);
  // Cleanup inactive clients
  for (const [id, client] of this.syncState.clients) {
  if (now - client.lastSeen > this.config.clientTimeout) {
  this.emit('clientTimeout', id);
  // Trim sync history
  if (this.syncState.syncHistory.length > 1000) {
  this.syncState.syncHistory = this.syncState.syncHistory.slice(-500);
  // Utility methods
  private validateSyncMessage(message: SyncMessage): boolean {,
  return !!()
  message.id &&
  message.type &&
  message.domain &&
  message.timestamp &&
  message.sessionId &&
  typeof message.version === 'number'
  );
  private calculateChecksum(data: any): string {,
  return JSON.stringify(data).split('').reduce((a, b) => {
  a = ((a << 5) - a) + b.charCodeAt(0);
  return a & a;
}, 0).toString(36);
  private changesConflict(change1: StateChange<any>, change2: StateChange<any>): boolean {
  // Simplified conflict detection - in practice this would be more sophisticated
  return change1.type === change2.type &&
  JSON.stringify(change1.payload) !== JSON.stringify(change2.payload);
  private calculateConflictPriority(local: StateChange<any>, remote: StateChange<any>): number {,
  // Higher priority for more recent changes
  let priority = remote.timestamp - local.timestamp;
  // Security changes get higher priority
  if (remote.type.includes('SECURITY') || remote.type.includes('ACCESS')) {
  priority += 1000;
  return priority;
  private trackPendingChange(message: SyncMessage, excludeClient?: string): void {,
  const activeClients = Array.from(this.syncState.clients.keys());
  .filter(id => id !== excludeClient && id !== this.clientId);
  const pending: PendingChange = {,
  id: message.id,
  change: message.payload.change,
  domain: message.domain,
  clientId: message.sessionId,
  timestamp: Date.now(),
  acknowledged: new Set(),
  requiredAcks: activeClients.length,
  timeout: Date.now() + this.config.conflictResolutionTimeout,
  retryCount: 0,
};
    this.syncState.pendingChanges.set(message.id, pending);
  private async sendAcknowledgment(message: SyncMessage): Promise<void> {
  const ackMessage: SyncMessage = {,
  id: this.generateMessageId(),
  type: 'SYNC_RESPONSE',
  domain: message.domain,
  payload: {
  originalMessageId: message.id,
  acknowledged: true,
},
  timestamp: Date.now(),
      userId: 'system',
      sessionId: this.clientId,
      version: this.syncState.version;
  };
    this.emit('sendAcknowledgment', { targetClient: message.sessionId, message: ackMessage });
  private async applyRemoteChange(domain: DomainStateContainer, message: SyncMessage): Promise<void> {
  const change = message.payload.change;
  // Apply the remote change
  await domain.applyExternalChange({)
  domain: message.domain,
  path: change.payload?.path || '',
  value: change.payload?.value,
  operation: change.payload?.operation || 'update',
  metadata: {
  remote: true,
  clientId: message.sessionId,
  messageId: message.id,
});
  private applyChangeToState(state: any, change: StateChange<any>): any {
    // This would apply the change to the state
    // Implementation depends on the specific change format
    return { ...state, ...change.payload };
  private cleanupClientPendingChanges(clientId: string): void {
  for (const [id, pending] of this.syncState.pendingChanges) {
  if (pending.clientId === clientId) {
  this.syncState.pendingChanges.delete(id);
  private addToHistory(type: SyncHistoryEntry['type'])
  message: string,
  metadata?: Record<string, any>): void {,
  this.syncState.syncHistory.push({)
  timestamp: Date.now(),
  type,
  message,
  metadata,
  ...metadata
});
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateUpdateId(): string {
    return `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateChangeId(): string {
    return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  // Public API methods
  getSyncState(): Readonly<SyncState> {
  return {
  ...this.syncState,
  clients: new Map(this.syncState.clients),
  pendingChanges: new Map(this.syncState.pendingChanges),
  conflictQueue: [...this.syncState.conflictQueue],
  syncHistory: [...this.syncState.syncHistory],
};
  getConnectedClients(): SyncClient {
    return Array.from(this.syncState.clients.values());
  getPendingChanges(): PendingChange {
    return Array.from(this.syncState.pendingChanges.values());
  getConflictQueue(): ConflictQueueItem {
    return [...this.syncState.conflictQueue];
  getSyncHistory(limit: number = 100): SyncHistoryEntry {
    return this.syncState.syncHistory.slice(-limit);
  // Cleanup
  destroy(): void {
    if (this.batchTimer) clearInterval(this.batchTimer);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
    this.domains.clear();
    this.optimisticUpdates.clear();
    this.syncState.clients.clear();
    this.syncState.pendingChanges.clear();
    this.removeAllListeners();

// Global state synchronizer instance
export const globalStateSynchronizer = new StateSynchronizer();