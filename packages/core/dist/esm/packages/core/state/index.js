/**
 * State Management System - Main Export
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 *
 * Unified entry point for all state management functionality
 */
// Base state container
export * from './containers/BaseStateContainer';
// State orchestration
export * from './orchestration/StateOrchestrator';
export * from './orchestration/ConflictResolver';
// Middleware system
export * from './middleware/StateMiddleware';
// Domain state containers
export * from '../domains/graph-editor/state/GraphStateContainer';
// Global instances for easy access
export { globalStateOrchestrator } from './orchestration/StateOrchestrator';
export { globalConflictResolver } from './orchestration/ConflictResolver';
// React hooks
export { useStateOrchestrator, useCrossDomainState } from './orchestration/StateOrchestrator';
// Utility functions
export { createStateSelector } from './containers/BaseStateContainer';
export { createDefaultMiddleware, MiddlewareFactory } from './middleware/StateMiddleware';
export const defaultStateConfig = {
    enableValidation: true,
    enableHistory: true,
    maxHistorySize: 100,
    enablePersistence: true,
    enableDebug: false,
    enableCrossDomainSync: true,
    conflictResolutionStrategy: 'last_writer_wins',
    performanceMonitoring: true,
    securityRules: true,
};
// State system initialization
export async function initializeStateSystem(config = {}) {
    const finalConfig = { ...defaultStateConfig, ...config };
    // Initialize state orchestrator with domains
    // This would be implemented as the system grows
    console.log('State management system initialized with config:', finalConfig);
    return {
        orchestrator: globalStateOrchestrator.getHealthStatus(),
        conflictResolver: {
            activeConflicts: globalConflictResolver.getActiveConflicts().length,
            resolutionHistory: globalConflictResolver.getResolutionHistory().length,
        },
        domains: globalStateOrchestrator.getRegisteredDomains(),
        status: 'healthy'
    };
}
