/**
 * Conflict Resolver
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 *
 * Handles concurrent state modifications and conflict resolution
 */
import { StateChange } from '../containers/BaseStateContainer';
export interface StateConflict<T = any> {
    id: string;
    timestamp: number;
    localChange: StateChange<T>;
    remoteChange: StateChange<T>;
    conflictType: ConflictType;
    severity: ConflictSeverity;
    affectedPaths: string;
    metadata?: Record<string, any>;
}
export type ConflictType = 'CONCURRENT_UPDATE' | 'DELETE_UPDATE' | 'CREATE_CREATE' | 'TYPE_MISMATCH' | 'DEPENDENCY_VIOLATION' | 'PERMISSION_CONFLICT' | 'SCHEMA_VIOLATION';
export type ConflictSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ResolutionStrategy = 'LAST_WRITER_WINS' | 'FIRST_WRITER_WINS' | 'MERGE_CHANGES' | 'OPERATIONAL_TRANSFORM' | 'USER_INTERVENTION' | 'CUSTOM_RESOLVER' | 'SECURITY_PRIORITY' | 'ROLLBACK_ALL';
export interface ConflictResolution<T = any> {
    id: string;
    conflictId: string;
    strategy: ResolutionStrategy;
    resolvedState: T;
    timestamp: number;
    appliedChanges: StateChange<T>[];
    rejectedChanges: StateChange<T>[];
    userAction?: 'approved' | 'rejected' | 'modified';
    confidence: number;
}
export interface ConflictResolutionRule {
    name: string;
    domain?: string;
    pathPattern?: RegExp;
    conflictTypes: ConflictType;
    strategy: ResolutionStrategy;
    priority: number;
    condition?: (conflict: StateConflict) => boolean;
    customResolver?: (conflict: StateConflict) => ConflictResolution;
}
export interface OperationalTransform {
    apply(operation: any, state: any): any;
    transform(op1: any, op2: any): [any, any];
    compose(ops: any): any;
    inverse(operation: any): any;
}
export interface GraphMutation {
    type: 'ADD_NODE' | 'REMOVE_NODE' | 'UPDATE_NODE' | 'ADD_EDGE' | 'REMOVE_EDGE' | 'UPDATE_EDGE';
    nodeId?: string;
    edgeId?: string;
    data?: any;
    position?: {
        x: number;
        y: number;
    };
    timestamp: number;
}
export interface Permission {
    resource: string;
    action: string;
    level: 'none' | 'read' | 'write' | 'admin';
    conditions?: Record<string, any>;
}
export interface DashboardLayout {
    widgets: Array<{}, id>;
    string: any;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    static?: boolean;
}
export declare class ConflictResolver {
    private resolutionRules;
    private activeConflicts;
    private resolutionHistory;
    private maxHistorySize;
    constructor();
    private lastWriterWins;
    private firstWriterWins;
    private mergeChanges;
    private operationalTransform;
    private securityPriorityResolution;
    private requestUserIntervention;
    private setupDefaultRules;
}
//# sourceMappingURL=ConflictResolver.d.ts.map