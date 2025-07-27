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
export declare const DOMAIN_METADATA: {
    readonly 'graph-editor': {
        readonly name: "Graph Editor";
        readonly description: "Visual graph editing and execution";
        readonly version: "1.0.0";
        readonly status: "active";
        readonly dependencies: readonly ["runtime", "shared"];
        readonly features: readonly ["node-editing", "visual-flow", "execution", "validation", "inspector-system"];
        readonly components: 15;
        readonly hooks: 6;
        readonly services: 4;
    };
    readonly 'admin-dashboard': {
        readonly name: "Admin Dashboard";
        readonly description: "Administrative interface and controls";
        readonly version: "1.0.0";
        readonly status: "active";
        readonly dependencies: readonly ["security", "shared"];
        readonly features: readonly ["user-management", "security-monitoring", "api-management", "system-metrics", "widget-system"];
        readonly components: 12;
        readonly hooks: 5;
        readonly services: 6;
    };
    readonly security: {
        readonly name: "Security Framework";
        readonly description: "Authentication, authorization, and security monitoring";
        readonly version: "1.0.0";
        readonly status: "active";
        readonly dependencies: readonly ["shared"];
        readonly features: readonly ["access-control", "audit-logging", "threat-detection", "compliance", "encryption"];
        readonly components: 8;
        readonly hooks: 5;
        readonly services: 7;
    };
    readonly runtime: {
        readonly name: "Runtime Engine";
        readonly description: "Core execution engine for graphs and nodes";
        readonly version: "1.0.0";
        readonly status: "active";
        readonly dependencies: readonly ["shared"];
        readonly features: readonly ["node-execution", "graph-processing", "validation", "performance-monitoring", "caching"];
        readonly components: 6;
        readonly hooks: 5;
        readonly services: 6;
    };
    readonly targeting: {
        readonly name: "Advanced Targeting";
        readonly description: "Audience targeting and segmentation (Epic 17)";
        readonly version: "0.1.0";
        readonly status: "planned";
        readonly dependencies: readonly ["runtime", "shared"];
        readonly features: readonly ["audience-builder", "condition-engine", "preview", "analytics", "segmentation"];
        readonly components: 0;
        readonly hooks: 0;
        readonly services: 0;
    };
};
export type DomainName = keyof typeof DOMAIN_METADATA;
export interface DomainStatus {
    name: DomainName;
    loaded: boolean;
    initialized: boolean;
    error?: Error;
    loadTime?: number;
}
export declare class DomainManager {
    private domains;
    private status;
    private registry;
    constructor();
    loadDomain(name: DomainName): Promise<any>;
    getDomain(name: DomainName): any;
    getDomainStatus(name: DomainName): DomainStatus | undefined;
    getAllDomainStatus(): DomainStatus[];
    isLoaded(name: DomainName): boolean;
    preloadDomains(domains: DomainName[]): Promise<void>;
    unloadDomain(name: DomainName): void;
}
export declare const domainManager: DomainManager;
//# sourceMappingURL=index.d.ts.map