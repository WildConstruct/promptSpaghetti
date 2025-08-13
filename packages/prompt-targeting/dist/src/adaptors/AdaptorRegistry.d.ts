/**
 * Adaptor registry for discovery and management
 * Epic 10.1.2 - Common Interface Definition
 */
import { ModelAdaptor, AdaptorRegistry, PlatformCapabilities } from '../types';
import { EventEmitter } from 'events';
/**
 * Events emitted by the adaptor registry
 */
export interface AdaptorRegistryEvents {
    'adaptor:registered': (adaptor: ModelAdaptor) => void;
    'adaptor:unregistered': (adaptorId: string) => void;
    'adaptor:updated': (adaptor: ModelAdaptor, oldVersion: string) => void;
    'capabilities:changed': (adaptorId: string, capabilities: PlatformCapabilities) => void;
}
/**
 * Implementation of adaptor registry for managing platform adaptors
 */
export declare class DefaultAdaptorRegistry extends EventEmitter implements AdaptorRegistry {
    private adaptors;
    private capabilitiesCache;
    private platformIndex;
    private capabilityIndex;
    private logger;
    constructor();
    /**
     * Register an adaptor in the registry
     */
    register(adaptor: ModelAdaptor): Promise<void>;
    /**
     * Unregister an adaptor from the registry
     */
    unregister(adaptorId: string): Promise<void>;
    /**
     * Get adaptor by ID
     */
    get(adaptorId: string): ModelAdaptor | undefined;
    /**
     * List all registered adaptors
     */
    list(): ModelAdaptor[];
    /**
     * Find adaptors by platform
     */
    findByPlatform(platform: string): ModelAdaptor[];
    /**
     * Find adaptors by capability
     */
    findByCapability(capability: string): ModelAdaptor[];
    /**
     * Get cached capabilities for an adaptor
     */
    getCapabilities(adaptorId: string): PlatformCapabilities | undefined;
    /**
     * Refresh capabilities for an adaptor
     */
    refreshCapabilities(adaptorId: string): Promise<PlatformCapabilities>;
    /**
     * Get all supported platforms
     */
    getSupportedPlatforms(): string[];
    /**
     * Get all available capabilities
     */
    getAvailableCapabilities(): string[];
    /**
     * Find best adaptor for platform with specific requirements
     */
    findBestAdaptor(platform: string, requirements?: {
        minVersion?: string;
        requiredCapabilities?: string[];
        preferredCapabilities?: string[];
    }): ModelAdaptor | undefined;
    /**
     * Validate adaptor interface compliance
     */
    private validateAdaptor;
    /**
     * Handle version conflicts when registering adaptors
     */
    private handleVersionConflict;
    /**
     * Update platform index for fast platform-based lookups
     */
    private updatePlatformIndex;
    /**
     * Remove adaptor from platform index
     */
    private removePlatformIndex;
    /**
     * Update capability index for fast capability-based lookups
     */
    private updateCapabilityIndex;
    /**
     * Remove adaptor from capability index
     */
    private removeCapabilityIndex;
    /**
     * Setup event handlers for registry management
     */
    private setupEventHandlers;
    /**
     * Get registry statistics
     */
    getStatistics(): {
        totalAdaptors: number;
        platformCount: number;
        capabilityCount: number;
        adaptorsByPlatform: Record<string, number>;
        mostCommonCapabilities: Array<{
            capability: string;
            count: number;
        }>;
    };
}
//# sourceMappingURL=AdaptorRegistry.d.ts.map