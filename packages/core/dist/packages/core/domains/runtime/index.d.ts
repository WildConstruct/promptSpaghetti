/**
 * Runtime Domain - Main Export
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Main entry point for the runtime execution domain
 */
export * from './RuntimeDomain';
export * from './types/RuntimeTypes';
export * from '../../runtime';
export * from '../../runtime/advanced';
export * from '../../runtime/io-system';
export * from '../../runtime/nodes';
export declare const createRuntimeDomain: (config?: any) => {
    components: {};
    hooks: {};
    services: {};
    events: {};
    config: {};
    utils: {};
};
//# sourceMappingURL=index.d.ts.map