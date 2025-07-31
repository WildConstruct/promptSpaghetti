/**
 * Core Domains - Main Export
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Unified entry point for all domain modules
 */
// Graph Editor Domain
export * from './graph-editor';
// Admin Dashboard Domain
export * from './admin-dashboard/AdminDashboardDomain';
export * from './admin-dashboard/types/AdminTypes';
// Security Domain
export * from './security';
// Runtime Domain
export * from './runtime';
// Targeting Domain
export * from './targeting';
// Domain event constants
export { DOMAIN_EVENTS, globalEventBus } from '../shared/services/EventBus';
// Shared infrastructure
export * from '../shared/ui/Dashboard';
export const createDomainRegistry = () => ({
    'graph-editor': () => import('./graph-editor'),
    'admin-dashboard': () => import('./admin-dashboard'),
    'security': () => import('./security'),
    'targeting': () => import('./targeting'),
    'runtime': () => import('./runtime'),
});
// Domain metadata
export const DOMAIN_METADATA = {
    'graph-editor': {
        name: 'Graph Editor',
        description: 'Visual graph editing and execution',
        version: '1.0.0',
        status: 'active',
        dependencies: ['runtime', 'shared'],
        features: ['node-editing', 'visual-flow', 'execution', 'validation', 'inspector-system'],
        components: 15,
        hooks: 6,
        services: 4,
    },
    'admin-dashboard': {
        name: 'Admin Dashboard',
        description: 'Administrative interface and controls',
        version: '1.0.0',
        status: 'active',
        dependencies: ['security', 'shared'],
        features: ['user-management', 'security-monitoring', 'api-management', 'system-metrics', 'widget-system'],
        components: 12,
        hooks: 5,
        services: 6,
    },
    'security': {
        name: 'Security Framework',
        description: 'Authentication, authorization, and security monitoring',
        version: '1.0.0',
        status: 'active',
        dependencies: ['shared'],
        features: ['access-control', 'audit-logging', 'threat-detection', 'compliance', 'encryption'],
        components: 8,
        hooks: 5,
        services: 7,
    },
    'runtime': {
        name: 'Runtime Engine',
        description: 'Core execution engine for graphs and nodes',
        version: '1.0.0',
        status: 'active',
        dependencies: ['shared'],
        features: ['node-execution', 'graph-processing', 'validation', 'performance-monitoring', 'caching'],
        components: 6,
        hooks: 5,
        services: 6,
    },
    'targeting': {
        name: 'Advanced Targeting',
        description: 'Audience targeting and segmentation (Epic 17)',
        version: '0.1.0',
        status: 'planned',
        dependencies: ['runtime', 'shared'],
        features: ['audience-builder', 'condition-engine', 'preview', 'analytics', 'segmentation'],
        components: 0,
        hooks: 0,
        services: 0,
    },
    type, DomainName = keyof, typeof: DOMAIN_METADATA
};
export class DomainManager {
    domains = new Map();
    status = new Map();
    registry;
    constructor() {
        this.registry = createDomainRegistry();
        // Initialize status for all domains
        Object.keys(DOMAIN_METADATA).forEach(name => { });
        this.status.set(name, {});
        name: name,
            loaded;
        false,
            initialized;
        false,
        ;
    }
    ;
}
;
async;
loadDomain(name, DomainName);
Promise < any > {
    : .domains.has(name)
};
{
    return this.domains.get(name);
    const startTime = Date.now();
    try {
        const domainModule = await this.registry[name]();
        const loadTime = Date.now() - startTime;
        this.domains.set(name, domainModule);
        this.status.set(name, {});
        name,
            loaded;
        true,
            initialized;
        false,
            loadTime;
    }
    finally { }
    ;
    return domainModule;
}
try { }
catch (error) {
    this.status.set(name, {});
    name,
        loaded;
    false,
        initialized;
    false,
        error;
    error,
    ;
}
;
throw error;
getDomain(name, DomainName);
any;
{
    return this.domains.get(name);
    getDomainStatus(name, DomainName);
    DomainStatus | undefined;
    {
        return this.status.get(name);
        getAllDomainStatus();
        DomainStatus;
        {
            return Array.from(this.status.values());
            isLoaded(name, DomainName);
            boolean;
            {
                return this.status.get(name)?.loaded ?? false;
                async;
                preloadDomains(domains, DomainName);
                Promise < void  > {
                    await, Promise, : .all(domains.map(name => this.loadDomain(name))),
                    unloadDomain(name) {
                        this.domains.delete(name);
                        const status = this.status.get(name);
                        if (status) {
                            this.status.set(name, {});
                        }
                    },
                    ...status,
                    loaded: false,
                    initialized: false, };
                ;
                // Global domain manager instance
                export const domainManager = new DomainManager();
            }
        }
    }
}
