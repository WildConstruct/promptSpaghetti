/**
 * Runtime Domain - Main Export
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Main entry point for the runtime execution domain
 */
// Domain interface and types
export * from './RuntimeDomain';
export * from './types/RuntimeTypes';
// Re-export existing runtime components
export * from '../../runtime';
export * from '../../runtime/advanced';
export * from '../../runtime/io-system';
// Re-export node implementations
export * from '../../runtime/nodes';
// Domain factory (to be implemented)
export const createRuntimeDomain = (config) => {
    // TODO: Implement domain factory
    return {
        components: {},
        hooks: {},
        services: {},
        events: {},
        config: {},
        utils: {},
    };
};
