/**
 * @fileoverview Pure TypeScript graph engine with CRDT integration
 * Core package for cross-platform graph execution and synchronization
 */
export * from './types';
export * from './engine';
export * from './crdt';
export * from './validation';
export * from './runtime';
export { GraphEngine } from './engine';
export { GraphCRDT, createGraphCRDT, mergeGraphs } from './crdt';
export { GraphValidator } from './validation';
export declare const VERSION = "0.1.0";
export declare const PACKAGE_NAME = "@prompt-spaghetti/graph-core";
//# sourceMappingURL=index.d.ts.map