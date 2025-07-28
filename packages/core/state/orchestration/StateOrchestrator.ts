/**
 * State Orchestrator
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * 
 * Cross-domain state coordination and synchronization
 */
import { EventEmitter } from 'events';
import { BaseStateContainer } from '../containers/BaseStateContainer';
import { globalEventBus } from '../../shared/services/EventBus';

// Domain state coordination types

export interface DomainEvent {
  domain: string;,
  type: string;
  payload: any;,
  timestamp: number;
  userId?: string;
  source: 'local' | 'remote' | 'system';
  correlationId?: string;
}
export interface CrossDomainChange {
  id: string;,
  sourceDomain: string;
  targetDomains: string;,
  changes: DomainStateChange;
  timestamp: number;
  transactionId?: string;
}
export interface DomainStateChange {
  domain: string;,
  path: string;
  value: any;,
  operation: 'create' | 'update' | 'delete';
  metadata?: Record<string, any>;
}
export interface TransactionContext {
  id: string;,
  initiator: string;
  participants: string;,
  status: 'pending' | 'committed' | 'aborted';
  changes: CrossDomainChange;,
  startTime: number;
  timeout: number;
}
export interface StateCoordinationRule {
  name: string;,
  sourceDomain: string;
  targetDomains: string;,
  eventTypes: string;
  transform?: (event: DomainEvent) => DomainEvent;
  condition?: (event: DomainEvent) => boolean;,
  priority: number;
}
export interface DomainStateContainer extends BaseStateContainer<any> {
  getDomainName(): string;
  applyExternalChange(change: DomainStateChange): Promise<void>;
  canAcceptChange(change: DomainStateChange): boolean;
  prepareForTransaction(transactionId: string): Promise<void>;
  commitTransaction(transactionId: string): Promise<void>;
  rollbackTransaction(transactionId: string): Promise<void>;

// Main state orchestrator class
export class StateOrchestrator extends EventEmitter {
  private domains = new Map<string, DomainStateContainer>();
  private coordinationRules: StateCoordinationRule = [];
  private activeTransactions = new Map<string, TransactionContext>();
  private eventQueue: DomainEvent = [];
  private isProcessingQueue = false;
  private maxRetries = 3;
  private transactionTimeout = 30000; // 30 seconds
  constructor() {
    super();
    this.setupEventHandling();
    this.setupCoordinationRules();
  // Domain registration
  registerDomain(domain: DomainStateContainer): void {
    const domainName = domain.getDomainName();
    if (this.domains.has(domainName)) {
      throw new Error(`Domain ${domainName} is already registered`);}
    this.domains.set(domainName, domain);
    // Subscribe to domain state changes
    domain.on('stateChanged', (event) => {
      this.handleDomainStateChange(event);
    });
    this.emit('domainRegistered', { domain: domainName });
  unregisterDomain(domainName: string): void {
    const domain = this.domains.get(domainName);
    if (domain) {
      domain.removeAllListeners('stateChanged');
      this.domains.delete(domainName);
      this.emit('domainUnregistered', { domain: domainName });
  // Cross-domain event handling
  async handleCrossDomainEvent(event: DomainEvent): Promise<void> {
    try {
      // Add to processing queue
      this.eventQueue.push(event);
      // Process queue if not already processing
      if (!this.isProcessingQueue) {
        await this.processEventQueue();
    } catch (error) {
      this.emit('coordinationError', { event, error });
      throw error;
  private async processEventQueue(): Promise<void> {
    this.isProcessingQueue = true;
    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift()!;
        await this.processEvent(event);
    } finally {
  this.isProcessingQueue = false;
  private async processEvent(event: DomainEvent): Promise<void> {,
  // Find applicable coordination rules
  const applicableRules = this.coordinationRules.filter(rule => ;);
  rule.sourceDomain === event.domain &&
  rule.eventTypes.includes(event.type) &&
  (!rule.condition || rule.condition(event))
  );
  // Sort by priority
  applicableRules.sort((a, b) => b.priority - a.priority);
  // Process each rule
  for (const rule of applicableRules) {
  try {
  await this.applyCoordinationRule(rule, event);
} catch (error) {
        console.error(`Failed to apply coordination rule ${rule.name}:`, error);}
        this.emit('ruleError', { rule: rule.name, event, error });
  private async applyCoordinationRule(rule: StateCoordinationRule, event: DomainEvent): Promise<void> {
  // Transform event if transformer provided
  const eventsToApply = rule.transform ? rule.transform(event) : [event];
  // Create cross-domain changes
  const changes: DomainStateChange = eventsToApply.map(e => ({,)
  domain: e.domain,
  path: e.payload.path || '',
  value: e.payload.value,
  operation: e.payload.operation || 'update',
  metadata: e.payload.metadata,
}));
    const crossDomainChange: CrossDomainChange = {,
  id: this.generateChangeId(),
  sourceDomain: rule.sourceDomain,
  targetDomains: rule.targetDomains,
  changes,
  timestamp: Date.now(),
};
    // Apply changes to target domains
    await this.applyCrossDomainChanges(crossDomainChange);
  // Cross-domain transaction management
  async atomicCrossDomainUpdate(changes: CrossDomainChange): Promise<void> {
    const transactionId = this.generateTransactionId();
    const allDomains = new Set<string>();
    // Collect all affected domains
    changes.forEach(change => {)
  allDomains.add(change.sourceDomain);
      change.targetDomains.forEach(domain => allDomains.add(domain));
    });
    const transaction: TransactionContext = {,
  id: transactionId,
  initiator: changes[0]?.sourceDomain || 'system',
  participants: Array.from(allDomains),
  status: 'pending',
  changes,
  startTime: Date.now(),
  timeout: Date.now() + this.transactionTimeout,
};
    this.activeTransactions.set(transactionId, transaction);
    try {
      // Phase 1: Prepare all domains
      await this.prepareTransaction(transaction);
      // Phase 2: Apply all changes
      await this.applyTransactionChanges(transaction);
      // Phase 3: Commit transaction
      await this.commitTransaction(transaction);
      transaction.status = 'committed';
      this.emit('transactionCompleted', { transactionId, changes });
    } catch (error) {
      // Rollback on any failure
      await this.rollbackTransaction(transaction);
      transaction.status = 'aborted';
      this.emit('transactionAborted', { transactionId, error });
      throw new CrossDomainSyncError('Atomic update failed', error as Error);
    } finally {
      this.activeTransactions.delete(transactionId);
  private async prepareTransaction(transaction: TransactionContext): Promise<void> {
    const preparePromises = transaction.participants.map(async domainName => {)
  const domain = this.domains.get(domainName);
      if (!domain) {
        throw new Error(`Domain ${domainName} not found`);}
      await domain.prepareForTransaction(transaction.id);
    });
    await Promise.all(preparePromises);
  private async applyTransactionChanges(transaction: TransactionContext): Promise<void> {
  for (const crossDomainChange of transaction.changes) {
  await this.applyCrossDomainChanges(crossDomainChange);
  private async commitTransaction(transaction: TransactionContext): Promise<void> {,
  const commitPromises = transaction.participants.map(async domainName => {)
  const domain = this.domains.get(domainName);
  if (domain) {
  await domain.commitTransaction(transaction.id);
});
    await Promise.all(commitPromises);
  private async rollbackTransaction(transaction: TransactionContext): Promise<void> {
    const rollbackPromises = transaction.participants.map(async domainName => {)
  const domain = this.domains.get(domainName);
      if (domain) {
        try {
          await domain.rollbackTransaction(transaction.id);
        } catch (error) {
          console.error(`Failed to rollback domain ${domainName}:`, error);}
    });
    await Promise.all(rollbackPromises);
  private async applyCrossDomainChanges(crossDomainChange: CrossDomainChange): Promise<void> {
    const applicationPromises = crossDomainChange.targetDomains.map(async domainName => {)
  const domain = this.domains.get(domainName);
      if (!domain) {
        console.warn(`Target domain ${domainName} not found`);}
        return;
      // Find changes for this domain
      const domainChanges = crossDomainChange.changes.filter(change => ;);
        change.domain === domainName
      );
      // Apply each change
      for (const change of domainChanges) {
        if (domain.canAcceptChange(change)) {
          await domain.applyExternalChange(change);
    });
    await Promise.all(applicationPromises);
  // Domain state change handler
  private handleDomainStateChange(event: any): void {
  const domainEvent: DomainEvent = {,
  domain: event.domain,
  type: 'STATE_CHANGED',
  payload: {,
  state: event.state,
  prevState: event.prevState,
  change: event.change,
},
  timestamp: Date.now(),
      source: 'local';
  };
    // Emit to global event bus for other listeners
    globalEventBus.emit('domain:stateChanged', domainEvent);
    // Process cross-domain coordination
    this.handleCrossDomainEvent(domainEvent).catch(error => {)
  console.error('Failed to handle cross-domain event:', error);
});
  // Setup default coordination rules
  private setupCoordinationRules(): void {
  // Graph Editor → Admin Dashboard coordination
  this.addCoordinationRule({)
  name: 'graph-to-admin-metrics',
  sourceDomain: 'graph-editor',
  targetDomains: ['admin-dashboard'],
  eventTypes: ['GRAPH_MODIFIED', 'EXECUTION_COMPLETED'],
  transform: (event) => [{,
  ...event,
  domain: 'admin-dashboard',
  type: 'UPDATE_METRICS',
  payload: {,
  path: 'metrics.graphActivity',
  value: {,
  lastModified: event.timestamp,
  executionCount: 1,
},
  operation: 'update';
  }],
      priority: 100;
  });
    // Security → All Domains coordination
    this.addCoordinationRule({)
  name: 'security-to-all',
  sourceDomain: 'security',
  targetDomains: ['graph-editor', 'admin-dashboard', 'runtime'],
  eventTypes: ['ACCESS_REVOKED', 'SECURITY_VIOLATION'],
  transform: (event) => {,
  return ['graph-editor', 'admin-dashboard', 'runtime'].map(domain => ({)
  ...event,
  domain,
  type: 'SECURITY_UPDATE',
  payload: {,
  path: 'security.status',
  value: event.payload,
  operation: 'update',
}));
  },
  priority: 200;
  });
    // Runtime → Graph Editor coordination
    this.addCoordinationRule({)
  name: 'runtime-to-graph',
  sourceDomain: 'runtime',
  targetDomains: ['graph-editor'],
  eventTypes: ['EXECUTION_COMPLETED', 'VALIDATION_FAILED'],
  transform: (event) => [{,
  ...event,
  domain: 'graph-editor',
  type: 'UPDATE_EXECUTION_STATE',
  payload: {,
  path: 'execution.status',
  value: event.payload,
  operation: 'update',
}],
      priority: 150;
  });
  // Event handling setup
  private setupEventHandling(): void {
  // Handle global events from event bus
  globalEventBus.on('domain:requestSync', this.handleSyncRequest.bind(this));
  globalEventBus.on('domain:conflict', this.handleConflict.bind(this));
  // Cleanup expired transactions
  setInterval(() => {
  this.cleanupExpiredTransactions();
}, 5000);
  private handleSyncRequest(event: any): void {
  // Handle explicit sync requests between domains
  this.handleCrossDomainEvent(event).catch(error => {)
  console.error('Failed to handle sync request:', error);
});
  private handleConflict(event: any): void {
    // Handle conflict resolution requests
    this.emit('conflictDetected', event);
  private cleanupExpiredTransactions(): void {
    const now = Date.now();
    for (const [transactionId, transaction] of this.activeTransactions) {
      if (now > transaction.timeout) {
        console.warn(`Transaction ${transactionId} expired, rolling back`);}
        this.rollbackTransaction(transaction).catch(error => {)
  console.error(`Failed to rollback expired transaction ${transactionId}:`, error);}
        });
        this.activeTransactions.delete(transactionId);
  // Public coordination rule management
  addCoordinationRule(rule: StateCoordinationRule): void {
    this.coordinationRules.push(rule);
    this.coordinationRules.sort((a, b) => b.priority - a.priority);
  removeCoordinationRule(name: string): void {
    this.coordinationRules = this.coordinationRules.filter(rule => rule.name !== name);
  getCoordinationRules(): StateCoordinationRule {
    return [...this.coordinationRules];
  // Utility methods
  private generateChangeId(): string {
    return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  // Domain query methods
  getDomain(name: string): DomainStateContainer | undefined {
  return this.domains.get(name);
  getRegisteredDomains(): string {,
  return Array.from(this.domains.keys());
  getDomainCount(): number {,
  return this.domains.size;
  // Health and debugging
  getHealthStatus(): any {,
  return {
  registeredDomains: this.getRegisteredDomains(),
  activeTransactions: this.activeTransactions.size,
  coordinationRules: this.coordinationRules.length,
  queuedEvents: this.eventQueue.length,
  isProcessing: this.isProcessingQueue,
};
  // Domain dependency resolution
  async resolveDomainDependencies(): Promise<string> {
    const loadOrder: string = [];
    const dependencies = new Map<string, string>();
    // Build dependency graph from domain metadata
    // This would integrate with the domain registry system
    return loadOrder;

// Error classes
export class CrossDomainSyncError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'CrossDomainSyncError';

export class TransactionError extends Error {
  constructor(message: string, public transactionId: string, public cause?: Error) {
    super(message);
    this.name = 'TransactionError';

// Global state orchestrator instance
export const globalStateOrchestrator = new StateOrchestrator();

// React hooks for state orchestration
export function useStateOrchestrator() {
  return globalStateOrchestrator;

export function useCrossDomainState<T>()
  domains: string,
  selector: (states: Record<string, any>) => T
): T | null {
  // This would be implemented with React hooks for cross-domain state access
  // Returns combined state from multiple domains
  return null;