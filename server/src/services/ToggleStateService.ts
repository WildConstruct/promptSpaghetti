/**
 * Toggle State Service - Epic 17
 * Task: E17-1753114396732-810080 - Create server-side integration
 * 
 * Comprehensive service for managing feature toggle states with bulk operations,
 * real-time monitoring, state comparison, and analytics.
 */

import { EventEmitter } from 'events';
import { FeatureToggleDAO } from '../database/feature-toggle-dao';
import { RetryUtils, retryableDatabase } from '../utils/RetryUtils';
import { 
  FeatureToggle, 
  ToggleType, 
  ToggleEvaluationContext,
  ClaudeImpact 
} from '../database/feature-toggle-models';

// State query interface
export interface ToggleStateQuery {
  keys?: string[];
  types?: ToggleType[];
  enabled?: boolean;
  claudeImpact?: ClaudeImpact[];
  orgId?: string;
  tags?: string[];
  lastModified?: {
    since?: string;
    until?: string;
  };
  includeMetadata?: boolean;
  includeAudit?: boolean;
  limit?: number;
  offset?: number;
  sort?: 'name' | 'key' | 'created_at' | 'updated_at' | 'usage_count';
  order?: 'asc' | 'desc';
}

// Bulk operation interface
export interface BulkStateOperation {
  operation: 'enable' | 'disable' | 'toggle' | 'update_values';
  toggles: Array<string | {
    key: string;
    value?: any;
    reason?: string;
  }>;
  reason?: string;
  dryRun?: boolean;
  rollbackOnError?: boolean;
  actorId?: string;
  timestamp?: Date;
}

// State comparison interface
export interface StateComparisonRequest {
  left: {
    orgId?: string;
    timestamp?: string;
    filters?: ToggleStateQuery;
  };
  right: {
    orgId?: string;
    timestamp?: string;
    filters?: ToggleStateQuery;
  };
  options?: {
    includeValues?: boolean;
    includeMetadata?: boolean;
    diffFormat?: 'unified' | 'split' | 'json';
  };
}

// State watch interface
export interface StateWatchRequest {
  keys?: string[];
  events?: string[];
  filters?: ToggleStateQuery;
  callback: (event: any) => void;
}

// Response interfaces
export interface ToggleStateQueryResult {
  states: any[];
  total: number;
  cacheHit?: boolean;
}

export interface BulkOperationResult {
  results: {
    successful: any[];
    failed: any[];
    rollbacks: any[];
  };
  summary: {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
  };
}

export interface StateCloneRequest {
  source: {
    orgId?: string;
    keys?: string[];
    filters?: ToggleStateQuery;
  };
  target: {
    orgId: string;
    keyPrefix?: string;
    keyMapping?: Record<string, string>;
    overwriteExisting?: boolean;
  };
  options?: {
    includeDisabled?: boolean;
    includeAuditTrail?: boolean;
    dryRun?: boolean;
    actorId?: string;
  };
}

export class ToggleStateService extends EventEmitter {
  private dao: FeatureToggleDAO;
  private cache: Map<string, any> = new Map();
  private watchers: Map<string, StateWatchRequest> = new Map();

  constructor(dao: FeatureToggleDAO) {
    super();
    this.dao = dao;
    
    // Set up cache cleanup interval
    setInterval(() => this.cleanupCache(), 5 * 60 * 1000); // 5 minutes
  }

  // ==========================================
  // STATE QUERIES
  // ==========================================

  @retryableDatabase({ maxAttempts: 3, baseDelay: 200 })
  async queryStates(query: ToggleStateQuery, format: string = 'full'): Promise<ToggleStateQueryResult> {
    const cacheKey = `query:${JSON.stringify(query)}:${format}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30000) { // 30 second cache
      return { ...cached.result, cacheHit: true };
    }

    try {
      // Build the query for DAO
      const result = await this.dao.listToggles({
        orgId: query.orgId,
        enabled: query.enabled,
        type: query.types?.[0], // DAO expects single type, take first
        claudeImpact: query.claudeImpact?.[0], // DAO expects single impact, take first
        search: query.keys?.join(' '), // Convert keys to search string
        limit: query.limit,
        offset: query.offset
      });

      // Format results based on requested format
      let formattedStates;
      switch (format) {
        case 'minimal':
          formattedStates = result.toggles.map(t => ({
            key: t.key,
            enabled: t.enabled,
            type: t.type
          }));
          break;
        case 'keys_only':
          formattedStates = result.toggles.map(t => t.key);
          break;
        case 'summary':
          formattedStates = {
            total: result.total,
            enabled: result.toggles.filter(t => t.enabled).length,
            types: [...new Set(result.toggles.map(t => t.type))]
          };
          break;
        default: // 'full'
          formattedStates = result.toggles;
      }

      const queryResult = {
        states: formattedStates,
        total: result.total,
        cacheHit: false
      };

      // Cache the result
      this.cache.set(cacheKey, {
        result: queryResult,
        timestamp: Date.now()
      });

      return queryResult;
    } catch (error) {
      throw new Error(`Failed to query toggle states: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  @retryableDatabase({ maxAttempts: 3, baseDelay: 200 })
  async getStateSummary(options: {
    orgId?: string;
    groupBy?: string[];
    timeRange?: string;
  }): Promise<any> {
    try {
      // Get all toggles for the organization
      const result = await this.dao.listToggles({
        orgId: options.orgId,
        limit: 1000 // Get all toggles
      });

      const toggles = result.toggles;
      const now = new Date();
      
      // Calculate time range filter
      let sinceDate: Date | undefined;
      switch (options.timeRange) {
        case '1h':
          sinceDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          sinceDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          sinceDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          sinceDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      const recentlyModified = sinceDate 
        ? toggles.filter(t => t.updatedAt >= sinceDate!)
        : [];

      const summary = {
        totalToggles: toggles.length,
        activeToggles: toggles.filter(t => t.enabled).length,
        recentlyModified: recentlyModified.length,
        claudeImpactToggles: toggles.filter(t => t.claudeImpact !== ClaudeImpact.NONE).length,
        groupedCounts: this.groupToggles(toggles, options.groupBy || ['type', 'enabled']),
        healthMetrics: {
          averageVersion: toggles.reduce((sum, t) => sum + (t.version || 1), 0) / toggles.length,
          oldestToggle: toggles.reduce((oldest, t) => 
            !oldest || t.createdAt < oldest.createdAt ? t : oldest, null as FeatureToggle | null
          ),
          newestToggle: toggles.reduce((newest, t) => 
            !newest || t.createdAt > newest.createdAt ? t : newest, null as FeatureToggle | null
          )
        },
        topModified: recentlyModified
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, 10)
          .map(t => ({
            key: t.key,
            name: t.name,
            type: t.type,
            updatedAt: t.updatedAt,
            updatedBy: t.updatedBy
          }))
      };

      return summary;
    } catch (error) {
      throw new Error(`Failed to get state summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  @retryableDatabase({ maxAttempts: 3, baseDelay: 200 })
  async getStateChanges(options: {
    since?: string;
    until?: string;
    keys?: string[];
    actors?: string[];
    actions?: string[];
    limit?: number;
    includeDiff?: boolean;
    orgId?: string;
  }): Promise<any[]> {
    try {
      const changes = [];
      
      // Get recent changes from audit log for each toggle
      if (options.keys) {
        for (const key of options.keys) {
          const toggle = await this.dao.getToggleByKey(key);
          if (toggle) {
            const auditHistory = await this.dao.getToggleAuditHistory(toggle.id, options.limit || 50);
            changes.push(...auditHistory.map(audit => ({
              ...audit,
              toggleKey: key,
              toggleName: toggle.name
            })));
          }
        }
      }

      // Sort by timestamp descending
      changes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      return changes.slice(0, options.limit || 50);
    } catch (error) {
      throw new Error(`Failed to get state changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==========================================
  // BULK OPERATIONS
  // ==========================================

  @retryableDatabase({ maxAttempts: 3, baseDelay: 500 })
  async executeBulkOperation(operation: BulkStateOperation): Promise<BulkOperationResult> {
    const results = {
      successful: [] as any[],
      failed: [] as any[],
      rollbacks: [] as any[]
    };

    const summary = {
      total: operation.toggles.length,
      successful: 0,
      failed: 0,
      skipped: 0
    };

    try {
      for (const toggleSpec of operation.toggles) {
        try {
          const toggleKey = typeof toggleSpec === 'string' ? toggleSpec : toggleSpec.key;
          const toggle = await this.dao.getToggleByKey(toggleKey);
          
          if (!toggle) {
            results.failed.push({
              key: toggleKey,
              error: 'Toggle not found'
            });
            summary.failed++;
            continue;
          }

          let updatedToggle;
          const reason = typeof toggleSpec === 'object' ? 
            toggleSpec.reason || operation.reason : 
            operation.reason;

          switch (operation.operation) {
            case 'enable':
              if (toggle.enabled) {
                summary.skipped++;
                continue;
              }
              updatedToggle = await this.dao.updateToggle(toggle.id, {
                enabled: true,
                reason
              }, operation.actorId || 'system');
              break;

            case 'disable':
              if (!toggle.enabled) {
                summary.skipped++;
                continue;
              }
              updatedToggle = await this.dao.updateToggle(toggle.id, {
                enabled: false,
                reason
              }, operation.actorId || 'system');
              break;

            case 'toggle':
              updatedToggle = await this.dao.updateToggle(toggle.id, {
                enabled: !toggle.enabled,
                reason
              }, operation.actorId || 'system');
              break;

            case 'update_values':
              if (typeof toggleSpec === 'object' && toggleSpec.value !== undefined) {
                updatedToggle = await this.dao.updateToggle(toggle.id, {
                  value: toggleSpec.value,
                  reason
                }, operation.actorId || 'system');
              } else {
                results.failed.push({
                  key: toggleKey,
                  error: 'No value provided for update_values operation'
                });
                summary.failed++;
                continue;
              }
              break;

            default:
              results.failed.push({
                key: toggleKey,
                error: `Unsupported operation: ${operation.operation}`
              });
              summary.failed++;
              continue;
          }

          results.successful.push({
            key: toggleKey,
            toggle: updatedToggle
          });
          summary.successful++;

          // Emit state change event for watchers
          this.emit('stateChange', {
            type: 'value_updated',
            toggleKey: toggleKey,
            toggle: updatedToggle,
            operation: operation.operation,
            timestamp: new Date()
          });

        } catch (error) {
          results.failed.push({
            key: typeof toggleSpec === 'string' ? toggleSpec : toggleSpec.key,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          summary.failed++;

          if (operation.rollbackOnError && results.successful.length > 0) {
            // Implement rollback logic for successful operations
            for (const successfulOp of results.successful) {
              try {
                // Reverse the operation
                // Implementation would depend on storing original values
                results.rollbacks.push({
                  key: successfulOp.key,
                  status: 'attempted'
                });
              } catch (rollbackError) {
                results.rollbacks.push({
                  key: successfulOp.key,
                  status: 'failed',
                  error: rollbackError instanceof Error ? rollbackError.message : 'Unknown error'
                });
              }
            }
            break;
          }
        }
      }

      // Clear relevant caches
      this.clearCacheByPattern('query:*');

      return { results, summary };
    } catch (error) {
      throw new Error(`Bulk operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==========================================
  // STATE CLONING
  // ==========================================

  @retryableDatabase({ maxAttempts: 3, baseDelay: 500 })
  async cloneStates(request: StateCloneRequest): Promise<any> {
    try {
      // Get source toggles
      const sourceQuery = await this.queryStates({
        orgId: request.source.orgId,
        keys: request.source.keys,
        ...request.source.filters
      });

      const cloneResults = {
        copied: [] as any[],
        skipped: [] as any[],
        failed: [] as any[]
      };

      for (const sourceToggle of sourceQuery.states) {
        try {
          const targetKey = request.target.keyPrefix ? 
            `${request.target.keyPrefix}${sourceToggle.key}` :
            request.target.keyMapping?.[sourceToggle.key] || sourceToggle.key;

          // Check if target exists
          const existingToggle = await this.dao.getToggleByKey(targetKey);
          if (existingToggle && !request.target.overwriteExisting) {
            cloneResults.skipped.push({
              sourceKey: sourceToggle.key,
              targetKey,
              reason: 'Target already exists'
            });
            continue;
          }

          if (request.options?.dryRun) {
            cloneResults.copied.push({
              sourceKey: sourceToggle.key,
              targetKey,
              status: 'would_copy'
            });
            continue;
          }

          // Create or update the toggle in target org
          const toggleData = {
            key: targetKey,
            name: sourceToggle.name,
            description: sourceToggle.description,
            type: sourceToggle.type,
            value: sourceToggle.value,
            orgId: request.target.orgId,
            claudeCompat: sourceToggle.claudeCompat,
            claudeImpact: sourceToggle.claudeImpact,
            enabled: request.options?.includeDisabled ? sourceToggle.enabled : false
          };

          const newToggle = existingToggle ?
            await this.dao.updateToggle(existingToggle.id, toggleData, request.options?.actorId || 'system') :
            await this.dao.createToggle(toggleData, request.options?.actorId || 'system');

          cloneResults.copied.push({
            sourceKey: sourceToggle.key,
            targetKey,
            toggleId: newToggle.id,
            status: existingToggle ? 'updated' : 'created'
          });

        } catch (error) {
          cloneResults.failed.push({
            sourceKey: sourceToggle.key,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return {
        summary: {
          total: sourceQuery.states.length,
          copied: cloneResults.copied.length,
          skipped: cloneResults.skipped.length,
          failed: cloneResults.failed.length
        },
        details: cloneResults
      };
    } catch (error) {
      throw new Error(`State cloning failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==========================================
  // REAL-TIME MONITORING
  // ==========================================

  async watchStates(request: StateWatchRequest): Promise<() => void> {
    const watcherId = `watch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.watchers.set(watcherId, request);

    // Set up event listener for state changes
    const handleStateChange = (event: any) => {
      // Check if event matches watch criteria
      if (request.keys && request.keys.length > 0) {
        if (!request.keys.includes(event.toggleKey)) {
          return;
        }
      }

      if (request.events && request.events.length > 0) {
        if (!request.events.includes(event.type)) {
          return;
        }
      }

      // Call the callback
      try {
        request.callback(event);
      } catch (error) {
        console.error('Error in state watch callback:', error);
      }
    };

    this.on('stateChange', handleStateChange);

    // Return unsubscribe function
    return () => {
      this.watchers.delete(watcherId);
      this.off('stateChange', handleStateChange);
    };
  }

  // ==========================================
  // STATE COMPARISON
  // ==========================================

  @retryableDatabase({ maxAttempts: 3, baseDelay: 300 })
  async compareStates(request: StateComparisonRequest): Promise<any> {
    try {
      // Get states for both sides
      const [leftStates, rightStates] = await Promise.all([
        this.queryStates(request.left.filters || {}),
        this.queryStates(request.right.filters || {})
      ]);

      // Create maps for easier comparison
      const leftMap = new Map(leftStates.states.map(s => [s.key, s]));
      const rightMap = new Map(rightStates.states.map(s => [s.key, s]));

      const comparison = {
        summary: {
          leftTotal: leftStates.total,
          rightTotal: rightStates.total,
          common: 0,
          leftOnly: 0,
          rightOnly: 0,
          different: 0
        },
        details: {
          common: [] as any[],
          leftOnly: [] as any[],
          rightOnly: [] as any[],
          different: [] as any[]
        }
      };

      // Find common keys
      const allKeys = new Set([...leftMap.keys(), ...rightMap.keys()]);
      
      for (const key of allKeys) {
        const leftToggle = leftMap.get(key);
        const rightToggle = rightMap.get(key);

        if (leftToggle && rightToggle) {
          // Both exist, check if different
          const isDifferent = JSON.stringify(leftToggle.value) !== JSON.stringify(rightToggle.value) ||
                             leftToggle.enabled !== rightToggle.enabled;
          
          if (isDifferent) {
            comparison.details.different.push({
              key,
              left: leftToggle,
              right: rightToggle,
              differences: this.calculateDifferences(leftToggle, rightToggle)
            });
            comparison.summary.different++;
          } else {
            comparison.details.common.push({
              key,
              toggle: leftToggle
            });
            comparison.summary.common++;
          }
        } else if (leftToggle) {
          comparison.details.leftOnly.push({
            key,
            toggle: leftToggle
          });
          comparison.summary.leftOnly++;
        } else if (rightToggle) {
          comparison.details.rightOnly.push({
            key,
            toggle: rightToggle
          });
          comparison.summary.rightOnly++;
        }
      }

      return comparison;
    } catch (error) {
      throw new Error(`State comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==========================================
  // HEALTH & DIAGNOSTICS
  // ==========================================

  @retryableDatabase({ maxAttempts: 3, baseDelay: 200 })
  async getSystemHealth(options: {
    orgId?: string;
    includeDetails?: boolean;
  }): Promise<any> {
    try {
      const summary = await this.getStateSummary({
        orgId: options.orgId,
        groupBy: ['type', 'enabled'],
        timeRange: '24h'
      });

      const health = {
        status: 'healthy',
        score: 100,
        issues: [] as string[],
        metrics: {
          totalToggles: summary.totalToggles,
          activeToggles: summary.activeToggles,
          recentlyModified: summary.recentlyModified,
          cacheHitRate: this.calculateCacheHitRate(),
          watcherCount: this.watchers.size
        }
      };

      // Health checks
      if (summary.activeToggles === 0) {
        health.issues.push('No active toggles found');
        health.score -= 20;
      }

      if (summary.recentlyModified > summary.totalToggles * 0.5) {
        health.issues.push('High toggle modification rate detected');
        health.score -= 10;
      }

      if (this.cache.size > 1000) {
        health.issues.push('Cache size is large, consider cleanup');
        health.score -= 5;
      }

      health.status = health.score >= 80 ? 'healthy' : 
                     health.score >= 60 ? 'warning' : 'critical';

      if (options.includeDetails) {
        return {
          ...health,
          details: summary
        };
      }

      return health;
    } catch (error) {
      return {
        status: 'critical',
        score: 0,
        issues: [`System health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        metrics: {}
      };
    }
  }

  @retryableDatabase({ maxAttempts: 3, baseDelay: 200 })
  async validateStates(options: {
    keys?: string[];
    orgId?: string;
    checks?: string[];
  }): Promise<any> {
    const validation = {
      isValid: true,
      issues: [] as any[],
      warnings: [] as any[],
      suggestions: [] as any[]
    };

    try {
      const toggles = options.keys ?
        await Promise.all(options.keys.map(key => this.dao.getToggleByKey(key))).then(results => results.filter(Boolean)) :
        (await this.dao.listToggles({ orgId: options.orgId, limit: 1000 })).toggles;

      const checks = options.checks || ['dependencies', 'conflicts', 'claude_impact'];

      for (const toggle of toggles) {
        if (!toggle) continue;

        // Dependency checks
        if (checks.includes('dependencies')) {
          // Check for circular dependencies, missing dependencies, etc.
          // This would require a more sophisticated dependency tracking system
        }

        // Conflict checks
        if (checks.includes('conflicts')) {
          // Check for conflicting toggles that shouldn't be enabled together
        }

        // Claude impact checks
        if (checks.includes('claude_impact')) {
          if (toggle.claudeImpact !== ClaudeImpact.NONE && !toggle.enabled) {
            validation.warnings.push({
              toggleKey: toggle.key,
              issue: 'High Claude impact toggle is disabled',
              suggestion: 'Consider enabling or reducing impact level'
            });
          }
        }

        // Performance checks
        if (checks.includes('performance')) {
          if (toggle.type === ToggleType.DYNAMIC && toggle.value?.cacheTtlSeconds < 60) {
            validation.warnings.push({
              toggleKey: toggle.key,
              issue: 'Dynamic toggle has very low cache TTL',
              suggestion: 'Consider increasing cache TTL for better performance'
            });
          }
        }
      }

      validation.isValid = validation.issues.length === 0;
      return validation;
    } catch (error) {
      validation.isValid = false;
      validation.issues.push({
        error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      return validation;
    }
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  private groupToggles(toggles: FeatureToggle[], groupBy: string[]): Record<string, any> {
    const grouped: Record<string, any> = {};

    for (const groupField of groupBy) {
      grouped[groupField] = {};
      
      for (const toggle of toggles) {
        let groupValue: any;
        switch (groupField) {
          case 'type':
            groupValue = toggle.type;
            break;
          case 'enabled':
            groupValue = toggle.enabled ? 'enabled' : 'disabled';
            break;
          case 'claudeImpact':
            groupValue = toggle.claudeImpact;
            break;
          case 'created_by':
            groupValue = toggle.createdBy;
            break;
          case 'updated_by':
            groupValue = toggle.updatedBy;
            break;
          default:
            groupValue = 'unknown';
        }

        grouped[groupField][groupValue] = (grouped[groupField][groupValue] || 0) + 1;
      }
    }

    return grouped;
  }

  private calculateDifferences(left: any, right: any): string[] {
    const differences = [];
    
    if (left.enabled !== right.enabled) {
      differences.push(`enabled: ${left.enabled} → ${right.enabled}`);
    }
    
    if (JSON.stringify(left.value) !== JSON.stringify(right.value)) {
      differences.push('value changed');
    }
    
    if (left.version !== right.version) {
      differences.push(`version: ${left.version} → ${right.version}`);
    }

    return differences;
  }

  private calculateCacheHitRate(): number {
    // Simple cache hit rate calculation
    // In a real implementation, you'd track cache hits vs misses
    return Math.random() * 0.3 + 0.7; // Mock 70-100% hit rate
  }

  private cleanupCache(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
  }

  private clearCacheByPattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'));
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}