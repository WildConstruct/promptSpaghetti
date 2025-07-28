/**
 * Core Domains - Main Export
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Unified entry point for all domain modules
 */
export * from './graph-editor';
export type { IGraphEditorDomain } from './graph-editor/GraphEditorDomain';
export * from './admin-dashboard/AdminDashboardDomain';
export * from './admin-dashboard/types/AdminTypes';
export * from './security';
export type { ISecurityDomain } from './security/SecurityDomain';
export * from './runtime';
export type { IRuntimeDomain } from './runtime/RuntimeDomain';
export * from './targeting';
export { DOMAIN_EVENTS, globalEventBus } from '../shared/services/EventBus';
export type { DomainEventType } from '../shared/services/EventBus';
export * from '../shared/ui/Dashboard';
export interface DomainRegistry {
    'graph-editor': () => Promise<any>;
    'admin-dashboard': () => Promise<any>;
    'security': () => Promise<any>;
    'targeting': () => Promise<any>;
    'runtime': () => Promise<any>;
}
export declare const createDomainRegistry: () => DomainRegistry;
export declare const DOMAIN_METADATA: any, DomainName: any;
export declare class DomainManager {
    private domains;
    private status;
    private registry;
    constructor();
}
//# sourceMappingURL=index.d.ts.map