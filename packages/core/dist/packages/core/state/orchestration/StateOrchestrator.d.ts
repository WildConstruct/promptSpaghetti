/**
 * State Orchestrator
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 *
 * Cross-domain state coordination and synchronization
 */
import { EventEmitter } from 'events';
import { BaseStateContainer } from '../containers/BaseStateContainer';
export interface DomainEvent {
    domain: string;
    type: string;
    payload: any;
    timestamp: number;
    userId?: string;
    source: 'local' | 'remote' | 'system';
    correlationId?: string;
}
export interface CrossDomainChange {
    id: string;
    sourceDomain: string;
    targetDomains: string[];
    changes: DomainStateChange[];
    timestamp: number;
    transactionId?: string;
}
export interface DomainStateChange {
    domain: string;
    path: string;
    value: any;
    operation: 'create' | 'update' | 'delete';
    metadata?: Record<string, any>;
}
export interface TransactionContext {
    id: string;
    initiator: string;
    participants: string[];
    status: 'pending' | 'committed' | 'aborted';
    changes: CrossDomainChange[];
    startTime: number;
    timeout: number;
}
export interface StateCoordinationRule {
    name: string;
    sourceDomain: string;
    targetDomains: string[];
    eventTypes: string[];
    transform?: (event: DomainEvent) => DomainEvent[];
    condition?: (event: DomainEvent) => boolean;
    priority: number;
}
export interface DomainStateContainer extends BaseStateContainer<any> {
    getDomainName(): string;
    applyExternalChange(change: DomainStateChange): Promise<void>;
    canAcceptChange(change: DomainStateChange): boolean;
    prepareForTransaction(transactionId: string): Promise<void>;
    commitTransaction(transactionId: string): Promise<void>;
    rollbackTransaction(transactionId: string): Promise<void>;
}
export declare class StateOrchestrator extends EventEmitter {
    private domains;
    private coordinationRules;
    private activeTransactions;
    private eventQueue;
    private isProcessingQueue;
    private maxRetries;
    private transactionTimeout;
    constructor();
    registerDomain(domain: DomainStateContainer): void;
    unregisterDomain(domainName: string): void;
    handleCrossDomainEvent(event: DomainEvent): Promise<void>;
    private processEventQueue;
    private processEvent;
    private applyCoordinationRule;
    atomicCrossDomainUpdate(changes: CrossDomainChange[]): Promise<void>;
    private prepareTransaction;
    private applyTransactionChanges;
    private commitTransaction;
    private rollbackTransaction;
    private applyCrossDomainChanges;
    private handleDomainStateChange;
    private setupCoordinationRules;
    private setupEventHandling;
    private handleSyncRequest;
    private handleConflict;
    private cleanupExpiredTransactions;
    addCoordinationRule(rule: StateCoordinationRule): void;
    removeCoordinationRule(name: string): void;
    getCoordinationRules(): StateCoordinationRule[];
    private generateChangeId;
    private generateTransactionId;
    getDomain(name: string): DomainStateContainer | undefined;
    getRegisteredDomains(): string[];
    getDomainCount(): number;
    getHealthStatus(): any;
    resolveDomainDependencies(): Promise<string[]>;
}
export declare class CrossDomainSyncError extends Error {
    cause?: Error;
    constructor(message: string, cause?: Error);
}
export declare class TransactionError extends Error {
    transactionId: string;
    cause?: Error;
    constructor(message: string, transactionId: string, cause?: Error);
}
export declare const globalStateOrchestrator: StateOrchestrator;
export declare function useStateOrchestrator(): StateOrchestrator;
export declare function useCrossDomainState<T>(domains: string[], selector: (states: Record<string, any>) => T): T | null;
//# sourceMappingURL=StateOrchestrator.d.ts.map