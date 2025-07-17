/**
 * Adaptor registry for discovery and management
 * Epic 10.1.2 - Common Interface Definition
 */

import {
  ModelAdaptor,
  AdaptorRegistry,
  PlatformCapabilities,
  AdaptorError,
} from '../types';
import { EventEmitter } from 'events';
import semver from 'semver';

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
export class DefaultAdaptorRegistry extends EventEmitter implements AdaptorRegistry {
  private adaptors = new Map<string, ModelAdaptor>();
  private capabilitiesCache = new Map<string, PlatformCapabilities>();
  private platformIndex = new Map<string, Set<string>>();
  private capabilityIndex = new Map<string, Set<string>>();
  private logger: Console = console;

  constructor() {
    super();
    this.setupEventHandlers();
  }

  /**
   * Register an adaptor in the registry
   */
  public async register(adaptor: ModelAdaptor): Promise<void> {
    try {
      // Validate adaptor interface
      this.validateAdaptor(adaptor);

      // Check for version conflicts
      const existingAdaptor = this.adaptors.get(adaptor.id);
      if (existingAdaptor) {
        await this.handleVersionConflict(existingAdaptor, adaptor);
      }

      // Initialize adaptor if not already initialized
      if (typeof adaptor.initialize === 'function') {
        await adaptor.initialize();
      }

      // Get and cache capabilities
      const capabilities = await adaptor.capabilities();
      this.capabilitiesCache.set(adaptor.id, capabilities);

      // Update indices
      this.updatePlatformIndex(adaptor);
      this.updateCapabilityIndex(adaptor, capabilities);

      // Register adaptor
      this.adaptors.set(adaptor.id, adaptor);

      this.logger.log(`Registered adaptor: ${adaptor.id} v${adaptor.version}`);
      this.emit('adaptor:registered', adaptor);
    } catch (error) {
      throw new AdaptorError(
        `Failed to register adaptor ${adaptor.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        adaptor.id,
        'REGISTRATION_FAILED',
        { error }
      );
    }
  }

  /**
   * Unregister an adaptor from the registry
   */
  public async unregister(adaptorId: string): Promise<void> {
    const adaptor = this.adaptors.get(adaptorId);
    if (!adaptor) {
      throw new AdaptorError(
        `Adaptor ${adaptorId} not found in registry`,
        adaptorId,
        'ADAPTOR_NOT_FOUND'
      );
    }

    try {
      // Clean up adaptor
      if (typeof adaptor.cleanup === 'function') {
        await adaptor.cleanup();
      }

      // Remove from indices
      this.removePlatformIndex(adaptor);
      this.removeCapabilityIndex(adaptor);

      // Remove from registry
      this.adaptors.delete(adaptorId);
      this.capabilitiesCache.delete(adaptorId);

      this.logger.log(`Unregistered adaptor: ${adaptorId}`);
      this.emit('adaptor:unregistered', adaptorId);
    } catch (error) {
      throw new AdaptorError(
        `Failed to unregister adaptor ${adaptorId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        adaptorId,
        'UNREGISTRATION_FAILED',
        { error }
      );
    }
  }

  /**
   * Get adaptor by ID
   */
  public get(adaptorId: string): ModelAdaptor | undefined {
    return this.adaptors.get(adaptorId);
  }

  /**
   * List all registered adaptors
   */
  public list(): ModelAdaptor[] {
    return Array.from(this.adaptors.values());
  }

  /**
   * Find adaptors by platform
   */
  public findByPlatform(platform: string): ModelAdaptor[] {
    const adaptorIds = this.platformIndex.get(platform);
    if (!adaptorIds) {
      return [];
    }

    return Array.from(adaptorIds)
      .map(id => this.adaptors.get(id))
      .filter((adaptor): adaptor is ModelAdaptor => adaptor !== undefined);
  }

  /**
   * Find adaptors by capability
   */
  public findByCapability(capability: string): ModelAdaptor[] {
    const adaptorIds = this.capabilityIndex.get(capability);
    if (!adaptorIds) {
      return [];
    }

    return Array.from(adaptorIds)
      .map(id => this.adaptors.get(id))
      .filter((adaptor): adaptor is ModelAdaptor => adaptor !== undefined);
  }

  /**
   * Get cached capabilities for an adaptor
   */
  public getCapabilities(adaptorId: string): PlatformCapabilities | undefined {
    return this.capabilitiesCache.get(adaptorId);
  }

  /**
   * Refresh capabilities for an adaptor
   */
  public async refreshCapabilities(adaptorId: string): Promise<PlatformCapabilities> {
    const adaptor = this.adaptors.get(adaptorId);
    if (!adaptor) {
      throw new AdaptorError(
        `Adaptor ${adaptorId} not found`,
        adaptorId,
        'ADAPTOR_NOT_FOUND'
      );
    }

    try {
      const capabilities = await adaptor.capabilities();
      this.capabilitiesCache.set(adaptorId, capabilities);
      this.updateCapabilityIndex(adaptor, capabilities);
      
      this.emit('capabilities:changed', adaptorId, capabilities);
      return capabilities;
    } catch (error) {
      throw new AdaptorError(
        `Failed to refresh capabilities for ${adaptorId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        adaptorId,
        'CAPABILITIES_REFRESH_FAILED',
        { error }
      );
    }
  }

  /**
   * Get all supported platforms
   */
  public getSupportedPlatforms(): string[] {
    return Array.from(this.platformIndex.keys());
  }

  /**
   * Get all available capabilities
   */
  public getAvailableCapabilities(): string[] {
    return Array.from(this.capabilityIndex.keys());
  }

  /**
   * Find best adaptor for platform with specific requirements
   */
  public findBestAdaptor(
    platform: string,
    requirements?: {
      minVersion?: string;
      requiredCapabilities?: string[];
      preferredCapabilities?: string[];
    }
  ): ModelAdaptor | undefined {
    const candidates = this.findByPlatform(platform);
    
    if (candidates.length === 0) {
      return undefined;
    }

    // Filter by version requirement
    let filtered = candidates;
    if (requirements?.minVersion) {
      filtered = candidates.filter(adaptor => 
        semver.gte(adaptor.version, requirements.minVersion!)
      );
    }

    // Filter by required capabilities
    if (requirements?.requiredCapabilities && requirements.requiredCapabilities.length > 0) {
      filtered = filtered.filter(adaptor => {
        const capabilities = this.capabilitiesCache.get(adaptor.id);
        if (!capabilities) return false;
        
        return requirements.requiredCapabilities!.every(req =>
          capabilities.features.includes(req)
        );
      });
    }

    if (filtered.length === 0) {
      return undefined;
    }

    // Sort by preferred capabilities and version
    filtered.sort((a, b) => {
      // First, prefer adaptors with more preferred capabilities
      if (requirements?.preferredCapabilities) {
        const aCapabilities = this.capabilitiesCache.get(a.id);
        const bCapabilities = this.capabilitiesCache.get(b.id);
        
        if (aCapabilities && bCapabilities) {
          const aScore = requirements.preferredCapabilities.filter(pref =>
            aCapabilities.features.includes(pref)
          ).length;
          const bScore = requirements.preferredCapabilities.filter(pref =>
            bCapabilities.features.includes(pref)
          ).length;
          
          if (aScore !== bScore) {
            return bScore - aScore; // Higher score first
          }
        }
      }

      // Then prefer newer versions
      return semver.compare(b.version, a.version);
    });

    return filtered[0];
  }

  /**
   * Validate adaptor interface compliance
   */
  private validateAdaptor(adaptor: ModelAdaptor): void {
    const required = ['id', 'version', 'name', 'description', 'platforms'];
    const missing = required.filter(prop => !(prop in adaptor));
    
    if (missing.length > 0) {
      throw new AdaptorError(
        `Adaptor missing required properties: ${missing.join(', ')}`,
        adaptor.id || 'unknown',
        'INVALID_ADAPTOR_INTERFACE'
      );
    }

    if (!semver.valid(adaptor.version)) {
      throw new AdaptorError(
        `Adaptor version must be valid semver: ${adaptor.version}`,
        adaptor.id,
        'INVALID_VERSION'
      );
    }

    if (!Array.isArray(adaptor.platforms) || adaptor.platforms.length === 0) {
      throw new AdaptorError(
        'Adaptor must support at least one platform',
        adaptor.id,
        'NO_PLATFORMS_SUPPORTED'
      );
    }

    if (typeof adaptor.capabilities !== 'function') {
      throw new AdaptorError(
        'Adaptor must implement capabilities() method',
        adaptor.id,
        'MISSING_CAPABILITIES_METHOD'
      );
    }

    if (typeof adaptor.validate !== 'function') {
      throw new AdaptorError(
        'Adaptor must implement validate() method',
        adaptor.id,
        'MISSING_VALIDATE_METHOD'
      );
    }

    if (typeof adaptor.transform !== 'function') {
      throw new AdaptorError(
        'Adaptor must implement transform() method',
        adaptor.id,
        'MISSING_TRANSFORM_METHOD'
      );
    }
  }

  /**
   * Handle version conflicts when registering adaptors
   */
  private async handleVersionConflict(
    existing: ModelAdaptor,
    incoming: ModelAdaptor
  ): Promise<void> {
    const comparison = semver.compare(incoming.version, existing.version);
    
    if (comparison > 0) {
      // Incoming version is newer
      this.logger.log(`Updating adaptor ${incoming.id} from v${existing.version} to v${incoming.version}`);
      await this.unregister(existing.id);
      this.emit('adaptor:updated', incoming, existing.version);
    } else if (comparison === 0) {
      throw new AdaptorError(
        `Adaptor ${incoming.id} v${incoming.version} is already registered`,
        incoming.id,
        'DUPLICATE_VERSION'
      );
    } else {
      throw new AdaptorError(
        `Cannot register older version ${incoming.version} of adaptor ${incoming.id} (current: v${existing.version})`,
        incoming.id,
        'OLDER_VERSION_REJECTED'
      );
    }
  }

  /**
   * Update platform index for fast platform-based lookups
   */
  private updatePlatformIndex(adaptor: ModelAdaptor): void {
    adaptor.platforms.forEach(platform => {
      if (!this.platformIndex.has(platform)) {
        this.platformIndex.set(platform, new Set());
      }
      this.platformIndex.get(platform)!.add(adaptor.id);
    });
  }

  /**
   * Remove adaptor from platform index
   */
  private removePlatformIndex(adaptor: ModelAdaptor): void {
    adaptor.platforms.forEach(platform => {
      const adaptorIds = this.platformIndex.get(platform);
      if (adaptorIds) {
        adaptorIds.delete(adaptor.id);
        if (adaptorIds.size === 0) {
          this.platformIndex.delete(platform);
        }
      }
    });
  }

  /**
   * Update capability index for fast capability-based lookups
   */
  private updateCapabilityIndex(adaptor: ModelAdaptor, capabilities: PlatformCapabilities): void {
    capabilities.features.forEach(feature => {
      if (!this.capabilityIndex.has(feature)) {
        this.capabilityIndex.set(feature, new Set());
      }
      this.capabilityIndex.get(feature)!.add(adaptor.id);
    });
  }

  /**
   * Remove adaptor from capability index
   */
  private removeCapabilityIndex(adaptor: ModelAdaptor): void {
    const capabilities = this.capabilitiesCache.get(adaptor.id);
    if (capabilities) {
      capabilities.features.forEach(feature => {
        const adaptorIds = this.capabilityIndex.get(feature);
        if (adaptorIds) {
          adaptorIds.delete(adaptor.id);
          if (adaptorIds.size === 0) {
            this.capabilityIndex.delete(feature);
          }
        }
      });
    }
  }

  /**
   * Setup event handlers for registry management
   */
  private setupEventHandlers(): void {
    this.on('adaptor:registered', (adaptor) => {
      this.logger.log(`✓ Adaptor registered: ${adaptor.id} v${adaptor.version} (platforms: ${adaptor.platforms.join(', ')})`);
    });

    this.on('adaptor:unregistered', (adaptorId) => {
      this.logger.log(`✓ Adaptor unregistered: ${adaptorId}`);
    });

    this.on('adaptor:updated', (adaptor, oldVersion) => {
      this.logger.log(`✓ Adaptor updated: ${adaptor.id} v${oldVersion} → v${adaptor.version}`);
    });

    this.on('capabilities:changed', (adaptorId, capabilities) => {
      this.logger.log(`✓ Capabilities refreshed for: ${adaptorId} (${capabilities.features.length} features)`);
    });
  }

  /**
   * Get registry statistics
   */
  public getStatistics(): {
    totalAdaptors: number;
    platformCount: number;
    capabilityCount: number;
    adaptorsByPlatform: Record<string, number>;
    mostCommonCapabilities: Array<{ capability: string; count: number }>;
  } {
    const adaptorsByPlatform: Record<string, number> = {};
    this.platformIndex.forEach((adaptors, platform) => {
      adaptorsByPlatform[platform] = adaptors.size;
    });

    const capabilityCounts = Array.from(this.capabilityIndex.entries())
      .map(([capability, adaptors]) => ({ capability, count: adaptors.size }))
      .sort((a, b) => b.count - a.count);

    return {
      totalAdaptors: this.adaptors.size,
      platformCount: this.platformIndex.size,
      capabilityCount: this.capabilityIndex.size,
      adaptorsByPlatform,
      mostCommonCapabilities: capabilityCounts.slice(0, 10),
    };
  }
}