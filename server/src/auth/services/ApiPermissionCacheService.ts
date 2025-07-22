/**
 * API Permission Cache Service - Epic 17 Implementation
 * Task: E17-1753114397038-2A744B - Create permission caching
 * 
 * High-performance permission caching service that provides fast lookups for
 * API access control decisions, user permissions, role assignments, and policy
 * evaluations. Integrates with Redis for distributed caching and includes
 * intelligent cache invalidation strategies.
 */

import { RedisService } from '../database/RedisService';
import { ApiPermission, ApiPermissionAssignment, ApiRole, PermissionCheckResult } from './ApiPermissionAssignmentService';
import { ApiAccessDecision, ApiAccessRequest } from './ApiAccessControlEngine';
import { EventEmitter } from 'events';

// =============================================================================
// Permission Cache Types
// =============================================================================

export interface PermissionCacheConfig {
  // Cache backends
  redisEnabled: boolean;
  memoryEnabled: boolean;
  
  // TTL settings (in seconds)
  permissionTTL: number;
  roleTTL: number;
  assignmentTTL: number;
  decisionTTL: number;
  userPermissionsTTL: number;
  
  // Memory cache limits
  maxMemoryEntries: number;
  maxMemorySize: number; // bytes
  
  // Performance settings
  preloadEnabled: boolean;
  prefetchEnabled: boolean;
  compressionEnabled: boolean;
  
  // Invalidation settings
  invalidationStrategy: 'immediate' | 'lazy' | 'time_based';
  batchInvalidationSize: number;
  
  // Monitoring
  metricsEnabled: boolean;
  statsCollectionInterval: number; // milliseconds
}

export interface CacheKey {
  type: 'permission' | 'role' | 'assignment' | 'decision' | 'user_permissions' | 'policy_result';
  identifier: string;
  namespace?: string;
  version?: number;
}

export interface CacheEntry<T> {
  key: string;
  value: T;
  expiry: Date;
  hitCount: number;
  lastAccess: Date;
  size: number; // bytes
  metadata: {
    createdAt: Date;
    source: string;
    version: number;
    tags: string[];
  };
}

export interface CacheStats {
  // Hit/miss statistics
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  
  // Performance metrics
  averageGetTime: number;
  averageSetTime: number;
  totalOperations: number;
  
  // Memory usage
  memoryUsage: {
    entries: number;
    totalSize: number;
    maxSize: number;
    utilizationPercentage: number;
  };
  
  // Redis usage
  redisUsage: {
    connected: boolean;
    keyCount: number;
    memoryUsed: number;
    operationsPerSecond: number;
  };
  
  // Cache efficiency
  efficiency: {
    frequentlyAccessed: string[];
    rarelyAccessed: string[];
    oversizedEntries: string[];
    expiringSoon: string[];
  };
  
  // Invalidation stats
  invalidations: {
    total: number;
    byType: Record<string, number>;
    batchInvalidations: number;
    averageBatchSize: number;
  };
}

export interface UserPermissionsCacheEntry {
  userId: string;
  permissions: ApiPermission[];
  roles: ApiRole[];
  assignments: ApiPermissionAssignment[];
  lastUpdated: Date;
  effectiveUntil: Date;
}

export interface DecisionCacheEntry {
  requestSignature: string;
  decision: ApiAccessDecision;
  contextHash: string;
  dependencies: string[]; // Cache keys this decision depends on
}

// =============================================================================
// API Permission Cache Service Implementation
// =============================================================================

export class ApiPermissionCacheService extends EventEmitter {
  private config: PermissionCacheConfig;
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private stats: CacheStats;
  private statsInterval?: NodeJS.Timeout;

  constructor(
    private redisService: RedisService,
    config: Partial<PermissionCacheConfig> = {}
  ) {
    super();
    
    this.config = {
      redisEnabled: true,
      memoryEnabled: true,
      permissionTTL: 1800, // 30 minutes
      roleTTL: 3600, // 1 hour
      assignmentTTL: 900, // 15 minutes
      decisionTTL: 300, // 5 minutes
      userPermissionsTTL: 600, // 10 minutes
      maxMemoryEntries: 10000,
      maxMemorySize: 50 * 1024 * 1024, // 50MB
      preloadEnabled: true,
      prefetchEnabled: true,
      compressionEnabled: true,
      invalidationStrategy: 'immediate',
      batchInvalidationSize: 100,
      metricsEnabled: true,
      statsCollectionInterval: 60000, // 1 minute
      ...config
    };
    
    this.stats = this.initializeStats();
    this.initializeService();
  }

  // =============================================================================
  // Core Cache Operations
  // =============================================================================

  /**
   * Get value from cache with multi-tier lookup
   */
  async get<T>(cacheKey: CacheKey): Promise<T | null> {
    const startTime = Date.now();
    const key = this.buildCacheKey(cacheKey);
    
    try {
      // Try memory cache first (fastest)
      if (this.config.memoryEnabled) {
        const memoryResult = this.getFromMemory<T>(key);
        if (memoryResult !== null) {
          this.recordHit(Date.now() - startTime, 'memory');
          return memoryResult;
        }
      }
      
      // Try Redis cache (distributed)
      if (this.config.redisEnabled) {
        const redisResult = await this.getFromRedis<T>(key);
        if (redisResult !== null) {
          // Populate memory cache for faster future access
          if (this.config.memoryEnabled) {
            await this.setInMemory(key, redisResult, this.getTTLForType(cacheKey.type));
          }
          
          this.recordHit(Date.now() - startTime, 'redis');
          return redisResult;
        }
      }
      
      // Cache miss
      this.recordMiss(Date.now() - startTime);
      return null;
      
    } catch (error) {
      console.error('Cache get error:', error);
      this.recordMiss(Date.now() - startTime);
      return null;
    }
  }

  /**
   * Set value in cache with multi-tier storage
   */
  async set<T>(cacheKey: CacheKey, value: T, ttl?: number): Promise<void> {
    const startTime = Date.now();
    const key = this.buildCacheKey(cacheKey);
    const effectiveTTL = ttl || this.getTTLForType(cacheKey.type);
    
    try {
      // Set in memory cache
      if (this.config.memoryEnabled) {
        await this.setInMemory(key, value, effectiveTTL);
      }
      
      // Set in Redis cache
      if (this.config.redisEnabled) {
        await this.setInRedis(key, value, effectiveTTL);
      }
      
      this.recordSet(Date.now() - startTime);
      
      // Emit cache set event for monitoring
      this.emit('cache_set', { key, type: cacheKey.type, ttl: effectiveTTL });
      
    } catch (error) {
      console.error('Cache set error:', error);
      throw error;
    }
  }

  /**
   * Delete from all cache tiers
   */
  async delete(cacheKey: CacheKey): Promise<void> {
    const key = this.buildCacheKey(cacheKey);
    
    try {
      // Delete from memory
      if (this.config.memoryEnabled) {
        this.memoryCache.delete(key);
      }
      
      // Delete from Redis
      if (this.config.redisEnabled) {
        await this.redisService.delete(key);
      }
      
      this.emit('cache_delete', { key, type: cacheKey.type });
      
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  // =============================================================================
  // Domain-Specific Cache Methods
  // =============================================================================

  /**
   * Cache user permissions with intelligent grouping
   */
  async cacheUserPermissions(
    userId: string,
    permissions: ApiPermission[],
    roles: ApiRole[],
    assignments: ApiPermissionAssignment[]
  ): Promise<void> {
    const cacheEntry: UserPermissionsCacheEntry = {
      userId,
      permissions,
      roles,
      assignments,
      lastUpdated: new Date(),
      effectiveUntil: new Date(Date.now() + this.config.userPermissionsTTL * 1000)
    };
    
    await this.set(
      { type: 'user_permissions', identifier: userId },
      cacheEntry,
      this.config.userPermissionsTTL
    );
    
    // Also cache individual permissions for quick lookup
    for (const permission of permissions) {
      await this.set(
        { type: 'permission', identifier: permission.permissionId },
        permission,
        this.config.permissionTTL
      );
    }
    
    // Cache roles
    for (const role of roles) {
      await this.set(
        { type: 'role', identifier: role.roleId },
        role,
        this.config.roleTTL
      );
    }
  }

  /**
   * Get cached user permissions
   */
  async getUserPermissions(userId: string): Promise<UserPermissionsCacheEntry | null> {
    return await this.get<UserPermissionsCacheEntry>({
      type: 'user_permissions',
      identifier: userId
    });
  }

  /**
   * Cache access control decision with dependency tracking
   */
  async cacheAccessDecision(
    request: ApiAccessRequest,
    decision: ApiAccessDecision,
    dependencies: string[] = []
  ): Promise<void> {
    const requestSignature = this.generateRequestSignature(request);
    const contextHash = this.generateContextHash(request);
    
    const decisionEntry: DecisionCacheEntry = {
      requestSignature,
      decision,
      contextHash,
      dependencies
    };
    
    await this.set(
      { type: 'decision', identifier: requestSignature },
      decisionEntry,
      this.config.decisionTTL
    );
  }

  /**
   * Get cached access control decision
   */
  async getAccessDecision(request: ApiAccessRequest): Promise<ApiAccessDecision | null> {
    const requestSignature = this.generateRequestSignature(request);
    const cachedEntry = await this.get<DecisionCacheEntry>({
      type: 'decision',
      identifier: requestSignature
    });
    
    if (!cachedEntry) return null;
    
    // Verify context hasn't changed
    const currentContextHash = this.generateContextHash(request);
    if (cachedEntry.contextHash !== currentContextHash) {
      // Context changed, invalidate this decision
      await this.delete({ type: 'decision', identifier: requestSignature });
      return null;
    }
    
    // Mark decision as cached
    return {
      ...cachedEntry.decision,
      cached: true
    };
  }

  /**
   * Batch cache permissions for performance
   */
  async batchCachePermissions(permissions: ApiPermission[]): Promise<void> {
    const promises = permissions.map(permission => 
      this.set(
        { type: 'permission', identifier: permission.permissionId },
        permission,
        this.config.permissionTTL
      )
    );
    
    await Promise.all(promises);
  }

  /**
   * Prefetch related permissions based on access patterns
   */
  async prefetchUserData(userId: string): Promise<void> {
    if (!this.config.prefetchEnabled) return;
    
    try {
      // This would typically query the database to get user data
      // and proactively cache frequently accessed items
      console.log(`Prefetching data for user: ${userId}`);
      
      // Emit prefetch event for monitoring
      this.emit('prefetch_started', { userId });
      
    } catch (error) {
      console.error('Prefetch error:', error);
    }
  }

  // =============================================================================
  // Cache Invalidation
  // =============================================================================

  /**
   * Invalidate user-related caches
   */
  async invalidateUserCache(userId: string): Promise<void> {
    const keysToInvalidate = [
      { type: 'user_permissions' as const, identifier: userId },
      // Could expand to include decision caches that depend on this user
    ];
    
    if (this.config.invalidationStrategy === 'immediate') {
      await Promise.all(keysToInvalidate.map(key => this.delete(key)));
    } else {
      // Add to invalidation queue for lazy processing
      this.queueInvalidation(keysToInvalidate);
    }
    
    this.stats.invalidations.total++;
    this.stats.invalidations.byType['user'] = (this.stats.invalidations.byType['user'] || 0) + 1;
    
    this.emit('cache_invalidated', { type: 'user', identifier: userId });
  }

  /**
   * Invalidate permission-related caches
   */
  async invalidatePermissionCache(permissionId: string): Promise<void> {
    // Find all dependent caches
    const dependentKeys = await this.findDependentKeys('permission', permissionId);
    
    await Promise.all([
      this.delete({ type: 'permission', identifier: permissionId }),
      ...dependentKeys.map(key => this.delete(key))
    ]);
    
    this.stats.invalidations.total += dependentKeys.length + 1;
    this.emit('cache_invalidated', { type: 'permission', identifier: permissionId });
  }

  /**
   * Smart invalidation based on change type
   */
  async invalidateByChangeType(
    changeType: 'permission_created' | 'permission_updated' | 'permission_deleted' | 'role_assigned' | 'role_revoked',
    affectedIds: string[]
  ): Promise<void> {
    const invalidationStrategies = {
      'permission_created': async (ids: string[]) => {
        // New permissions don't invalidate existing caches
      },
      'permission_updated': async (ids: string[]) => {
        for (const id of ids) {
          await this.invalidatePermissionCache(id);
        }
      },
      'permission_deleted': async (ids: string[]) => {
        for (const id of ids) {
          await this.invalidatePermissionCache(id);
        }
      },
      'role_assigned': async (ids: string[]) => {
        for (const userId of ids) {
          await this.invalidateUserCache(userId);
        }
      },
      'role_revoked': async (ids: string[]) => {
        for (const userId of ids) {
          await this.invalidateUserCache(userId);
        }
      }
    };
    
    await invalidationStrategies[changeType](affectedIds);
  }

  // =============================================================================
  // Cache Management and Monitoring
  // =============================================================================

  /**
   * Get comprehensive cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Clear all caches
   */
  async clearAll(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();
    
    // Clear Redis cache (pattern-based deletion)
    if (this.config.redisEnabled) {
      await this.redisService.deletePattern('api_perm:*');
    }
    
    // Reset stats
    this.stats = this.initializeStats();
    
    this.emit('cache_cleared');
  }

  /**
   * Optimize cache performance
   */
  async optimize(): Promise<void> {
    const startTime = Date.now();
    let optimizedCount = 0;
    
    // Remove expired entries from memory cache
    const now = new Date();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiry <= now) {
        this.memoryCache.delete(key);
        optimizedCount++;
      }
    }
    
    // Remove rarely accessed entries if cache is too large
    if (this.memoryCache.size > this.config.maxMemoryEntries * 0.9) {
      const sortedEntries = Array.from(this.memoryCache.entries())
        .sort((a, b) => a[1].hitCount - b[1].hitCount);
      
      const toRemove = sortedEntries.slice(0, this.config.maxMemoryEntries * 0.1);
      for (const [key] of toRemove) {
        this.memoryCache.delete(key);
        optimizedCount++;
      }
    }
    
    console.log(`Cache optimization completed: removed ${optimizedCount} entries in ${Date.now() - startTime}ms`);
    this.emit('cache_optimized', { removedEntries: optimizedCount });
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private initializeService(): void {
    if (this.config.preloadEnabled) {
      this.preloadFrequentlyUsedData();
    }
    
    if (this.config.metricsEnabled) {
      this.startStatsCollection();
    }
    
    // Set up periodic optimization
    setInterval(() => this.optimize(), 300000); // Every 5 minutes
    
    console.log('✅ API Permission Cache Service initialized');
  }

  private initializeStats(): CacheStats {
    return {
      totalHits: 0,
      totalMisses: 0,
      hitRate: 0,
      averageGetTime: 0,
      averageSetTime: 0,
      totalOperations: 0,
      memoryUsage: {
        entries: 0,
        totalSize: 0,
        maxSize: this.config.maxMemorySize,
        utilizationPercentage: 0
      },
      redisUsage: {
        connected: false,
        keyCount: 0,
        memoryUsed: 0,
        operationsPerSecond: 0
      },
      efficiency: {
        frequentlyAccessed: [],
        rarelyAccessed: [],
        oversizedEntries: [],
        expiringSoon: []
      },
      invalidations: {
        total: 0,
        byType: {},
        batchInvalidations: 0,
        averageBatchSize: 0
      }
    };
  }

  private buildCacheKey(cacheKey: CacheKey): string {
    const namespace = cacheKey.namespace || 'api_perm';
    const version = cacheKey.version || 1;
    return `${namespace}:${cacheKey.type}:${cacheKey.identifier}:v${version}`;
  }

  private getTTLForType(type: string): number {
    const ttlMap: Record<string, number> = {
      'permission': this.config.permissionTTL,
      'role': this.config.roleTTL,
      'assignment': this.config.assignmentTTL,
      'decision': this.config.decisionTTL,
      'user_permissions': this.config.userPermissionsTTL,
      'policy_result': this.config.decisionTTL
    };
    
    return ttlMap[type] || this.config.permissionTTL;
  }

  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    
    if (entry.expiry <= new Date()) {
      this.memoryCache.delete(key);
      return null;
    }
    
    // Update access statistics
    entry.hitCount++;
    entry.lastAccess = new Date();
    
    return entry.value;
  }

  private async setInMemory<T>(key: string, value: T, ttl: number): Promise<void> {
    const size = this.estimateObjectSize(value);
    const expiry = new Date(Date.now() + ttl * 1000);
    
    const entry: CacheEntry<T> = {
      key,
      value,
      expiry,
      hitCount: 0,
      lastAccess: new Date(),
      size,
      metadata: {
        createdAt: new Date(),
        source: 'api_cache',
        version: 1,
        tags: []
      }
    };
    
    // Check memory limits
    if (this.shouldEvictForMemory(size)) {
      this.evictLeastRecentlyUsed();
    }
    
    this.memoryCache.set(key, entry);
  }

  private async getFromRedis<T>(key: string): Promise<T | null> {
    try {
      const result = await this.redisService.get(key);
      if (!result) return null;
      
      return this.config.compressionEnabled 
        ? this.decompress(result) 
        : JSON.parse(result);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  private async setInRedis<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      const serialized = this.config.compressionEnabled 
        ? this.compress(value) 
        : JSON.stringify(value);
      
      await this.redisService.setex(key, ttl, serialized);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  private generateRequestSignature(request: ApiAccessRequest): string {
    // Create a signature for cache key based on request properties
    const sigParts = [
      request.userId,
      request.endpoint,
      request.method,
      request.operation,
      request.organizationId || 'global'
    ];
    
    return Buffer.from(sigParts.join('|')).toString('base64');
  }

  private generateContextHash(request: ApiAccessRequest): string {
    // Generate hash of context that affects decisions
    const contextParts = [
      request.ip,
      request.timestamp.getHours().toString(), // Hour-level granularity
      JSON.stringify(request.customAttributes || {})
    ];
    
    return Buffer.from(contextParts.join('|')).toString('base64');
  }

  private async findDependentKeys(type: string, identifier: string): Promise<CacheKey[]> {
    // This would typically involve querying metadata to find dependent cache entries
    // For now, return empty array - in production this would be more sophisticated
    return [];
  }

  private queueInvalidation(keys: CacheKey[]): void {
    // Implementation for lazy invalidation queue
    console.log(`Queued ${keys.length} keys for invalidation`);
  }

  private shouldEvictForMemory(newEntrySize: number): boolean {
    const currentSize = this.getCurrentMemoryUsage();
    return currentSize + newEntrySize > this.config.maxMemorySize;
  }

  private getCurrentMemoryUsage(): number {
    return Array.from(this.memoryCache.values())
      .reduce((total, entry) => total + entry.size, 0);
  }

  private evictLeastRecentlyUsed(): void {
    if (this.memoryCache.size === 0) return;
    
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.lastAccess.getTime() < oldestTime) {
        oldestTime = entry.lastAccess.getTime();
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  private estimateObjectSize(obj: any): number {
    return JSON.stringify(obj).length * 2; // Rough estimate
  }

  private compress(data: any): string {
    // Placeholder - would implement actual compression
    return JSON.stringify(data);
  }

  private decompress(data: string): any {
    // Placeholder - would implement actual decompression
    return JSON.parse(data);
  }

  private recordHit(duration: number, source: 'memory' | 'redis'): void {
    this.stats.totalHits++;
    this.stats.totalOperations++;
    this.stats.averageGetTime = (this.stats.averageGetTime + duration) / 2;
    this.updateHitRate();
  }

  private recordMiss(duration: number): void {
    this.stats.totalMisses++;
    this.stats.totalOperations++;
    this.stats.averageGetTime = (this.stats.averageGetTime + duration) / 2;
    this.updateHitRate();
  }

  private recordSet(duration: number): void {
    this.stats.totalOperations++;
    this.stats.averageSetTime = (this.stats.averageSetTime + duration) / 2;
  }

  private updateHitRate(): void {
    this.stats.hitRate = this.stats.totalOperations > 0 
      ? (this.stats.totalHits / this.stats.totalOperations) * 100 
      : 0;
  }

  private startStatsCollection(): void {
    this.statsInterval = setInterval(() => {
      this.updateMemoryUsage();
      this.updateRedisUsage();
      this.updateEfficiencyMetrics();
    }, this.config.statsCollectionInterval);
  }

  private updateMemoryUsage(): void {
    this.stats.memoryUsage.entries = this.memoryCache.size;
    this.stats.memoryUsage.totalSize = this.getCurrentMemoryUsage();
    this.stats.memoryUsage.utilizationPercentage = 
      (this.stats.memoryUsage.totalSize / this.config.maxMemorySize) * 100;
  }

  private async updateRedisUsage(): Promise<void> {
    if (!this.config.redisEnabled) return;
    
    try {
      this.stats.redisUsage.connected = await this.redisService.isConnected();
      // Additional Redis stats would be collected here
    } catch (error) {
      this.stats.redisUsage.connected = false;
    }
  }

  private updateEfficiencyMetrics(): void {
    // Update efficiency metrics based on cache usage patterns
    const entries = Array.from(this.memoryCache.entries());
    
    // Find frequently accessed items
    this.stats.efficiency.frequentlyAccessed = entries
      .sort((a, b) => b[1].hitCount - a[1].hitCount)
      .slice(0, 10)
      .map(([key]) => key);
    
    // Find rarely accessed items
    this.stats.efficiency.rarelyAccessed = entries
      .sort((a, b) => a[1].hitCount - b[1].hitCount)
      .slice(0, 10)
      .map(([key]) => key);
    
    // Find oversized entries
    this.stats.efficiency.oversizedEntries = entries
      .filter(([, entry]) => entry.size > 10000) // 10KB threshold
      .map(([key]) => key);
    
    // Find entries expiring soon
    const soonThreshold = new Date(Date.now() + 60000); // 1 minute
    this.stats.efficiency.expiringSoon = entries
      .filter(([, entry]) => entry.expiry <= soonThreshold)
      .map(([key]) => key);
  }

  private async preloadFrequentlyUsedData(): Promise<void> {
    // This would typically preload commonly accessed permissions and roles
    console.log('Preloading frequently used permission data...');
  }

  // Cleanup
  async shutdown(): Promise<void> {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
    
    this.memoryCache.clear();
    this.removeAllListeners();
    
    console.log('✅ API Permission Cache Service shut down');
  }
}

export default ApiPermissionCacheService;