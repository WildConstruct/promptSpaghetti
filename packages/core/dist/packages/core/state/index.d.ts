/**
 * State Management System - Main Export
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 *
 * Unified entry point for all state management functionality
 */
export * from './containers/BaseStateContainer';
export * from './orchestration/StateOrchestrator';
export * from './orchestration/ConflictResolver';
export * from './middleware/StateMiddleware';
export * from '../domains/graph-editor/state/GraphStateContainer';
export { globalStateOrchestrator } from './orchestration/StateOrchestrator';
export { globalConflictResolver } from './orchestration/ConflictResolver';
export { useStateOrchestrator, useCrossDomainState } from './orchestration/StateOrchestrator';
export { createStateSelector } from './containers/BaseStateContainer';
export { createDefaultMiddleware, MiddlewareFactory } from './middleware/StateMiddleware';
export interface StateSystemConfig {
    enableValidation: boolean;
    enableHistory: boolean;
    maxHistorySize: number;
    enablePersistence: boolean;
    enableDebug: boolean;
    enableCrossDomainSync: boolean;
    conflictResolutionStrategy: 'last_writer_wins' | 'merge' | 'user_intervention';
    performanceMonitoring: boolean;
    securityRules: boolean;
}
export declare const defaultStateConfig: StateSystemConfig;
export declare function initializeStateSystem(config?: Partial<StateSystemConfig>): Promise<void>;
export declare function getStateSystemHealth(): {
    orchestrator: any;
    conflictResolver: any;
    domains: string[];
    status: 'healthy' | 'degraded' | 'error';
};
//# sourceMappingURL=index.d.ts.map