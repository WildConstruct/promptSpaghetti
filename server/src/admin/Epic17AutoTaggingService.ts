/**
 * Epic 17 Auto-Tagging Service - API Management System
 * Task: E17-1753114396874-E274EC - Implement auto-tagging
 * 
 * Comprehensive auto-tagging system for Epic 17 API Management System that automatically
 * applies tags to API keys, users, permissions, and resources based on intelligent analysis
 * of patterns, characteristics, usage analytics, and configurable rules.
 */

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { Epic17TagMergingSplittingService } from './Epic17TagMergingSplittingService';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

// =============================================================================
// Auto-Tagging Types and Interfaces
// =============================================================================

export interface AutoTaggingConfig {
  // General settings
  enabled: boolean;
  processingMode: 'real_time' | 'batch' | 'hybrid';
  batchProcessingInterval: number; // minutes
  maxTagsPerResource: number;
  
  // Rule processing
  ruleProcessing: {
    maxRulesPerExecution: number;
    ruleEvaluationTimeout: number; // seconds
    priorityBasedProcessing: boolean;
    parallelProcessing: boolean;
  };
  
  // Pattern detection
  patternDetection: {
    enabled: boolean;
    minimumPatternStrength: number; // 0-1
    learningMode: boolean;
    historicalAnalysisDays: number;
  };
  
  // Machine learning integration
  mlIntegration: {
    enabled: boolean;
    modelVersion: string;
    confidenceThreshold: number; // 0-1
    fallbackToRules: boolean;
  };
  
  // Tag management
  tagManagement: {
    autoCleanup: boolean;
    tagExpiryDays: number;
    conflictResolution: 'merge' | 'replace' | 'manual';
    tagValidation: boolean;
  };
  
  // Performance settings
  performance: {
    cacheEnabled: boolean;
    cacheTTL: number; // seconds
    batchSize: number;
    maxConcurrentOperations: number;
  };
  
  // Notification settings
  notifications: {
    onTaggingCompletion: boolean;
    onRuleConflicts: boolean;
    onHighVolumeTagging: boolean;
    tagChangeNotifications: boolean;
  };
}

export enum AutoTaggingTrigger {
  RESOURCE_CREATED = 'resource_created',
  RESOURCE_UPDATED = 'resource_updated',
  USAGE_PATTERN_DETECTED = 'usage_pattern_detected',
  SCHEDULED_BATCH = 'scheduled_batch',
  MANUAL_TRIGGER = 'manual_trigger',
  RULE_UPDATED = 'rule_updated',
  THRESHOLD_EXCEEDED = 'threshold_exceeded',
  ANOMALY_DETECTED = 'anomaly_detected'
}

export enum TaggingRuleType {
  PATTERN_BASED = 'pattern_based',
  CHARACTERISTIC_BASED = 'characteristic_based',
  USAGE_BASED = 'usage_based',
  RELATIONSHIP_BASED = 'relationship_based',
  TIME_BASED = 'time_based',
  CONDITIONAL = 'conditional',
  ML_BASED = 'ml_based'
}

export interface AutoTaggingRule {
  ruleId: string;
  ruleName: string;
  description: string;
  ruleType: TaggingRuleType;
  
  // Rule configuration
  enabled: boolean;
  priority: number;
  conditions: AutoTaggingCondition[];
  actions: TaggingAction[];
  
  // Target configuration
  targetResourceTypes: string[];
  resourceFilters: Record<string, any>;
  
  // Execution settings
  executionMode: 'immediate' | 'deferred' | 'conditional';
  requiresApproval: boolean;
  conflictResolution: 'merge' | 'replace' | 'skip';
  
  // Pattern analysis
  patternConfig?: PatternAnalysisConfig;
  
  // Machine learning
  mlConfig?: MLTaggingConfig;
  
  // Rule lifecycle
  createdBy: string;
  createdAt: Date;
  lastExecuted?: Date;
  executionCount: number;
  successRate: number;
  
  // Validation and testing
  testMode: boolean;
  validationRules: ValidationRule[];
}

export interface AutoTaggingCondition {
  conditionId: string;
  conditionType: 'property' | 'pattern' | 'usage' | 'relationship' | 'custom';
  
  // Condition definition
  field: string;
  operator: 'equals' | 'contains' | 'matches' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'exists' | 'custom';
  value: any;
  
  // Advanced conditions
  customExpression?: string;
  aggregation?: 'count' | 'sum' | 'avg' | 'max' | 'min';
  timeWindow?: number; // hours
  
  // Condition metadata
  weight: number;
  required: boolean;
  negated: boolean;
}

export interface TaggingAction {
  actionId: string;
  actionType: 'add_tag' | 'remove_tag' | 'replace_tag' | 'merge_tags' | 'conditional_tag';
  
  // Tag configuration
  tags: string[];
  tagMetadata?: Record<string, any>;
  tagCategory?: string;
  tagExpiry?: Date;
  
  // Action conditions
  conditions?: string[];
  confidence?: number;
  
  // Action behavior
  overrideExisting: boolean;
  validateTags: boolean;
  notifyOnApply: boolean;
}

export interface PatternAnalysisConfig {
  analysisType: 'naming' | 'usage' | 'relationship' | 'temporal';
  patternStrength: number;
  minOccurrences: number;
  timeWindowHours: number;
  includeHistorical: boolean;
}

export interface MLTaggingConfig {
  modelType: 'classification' | 'clustering' | 'regression';
  features: string[];
  confidenceThreshold: number;
  fallbackRules: string[];
  retrainingEnabled: boolean;
}

export interface ValidationRule {
  ruleId: string;
  validationType: 'format' | 'uniqueness' | 'business_logic' | 'dependency';
  expression: string;
  errorMessage: string;
}

export interface TaggingExecution {
  executionId: string;
  trigger: AutoTaggingTrigger;
  executedAt: Date;
  
  // Execution scope
  rulesExecuted: string[];
  resourcesProcessed: number;
  
  // Results
  tagsAdded: number;
  tagsRemoved: number;
  tagsUpdated: number;
  conflictsResolved: number;
  
  // Performance metrics
  executionTime: number; // milliseconds
  rulesExecutionTime: Record<string, number>;
  
  // Error handling
  errors: TaggingError[];
  warnings: TaggingWarning[];
  
  // Metadata
  executedBy: string;
  batchId?: string;
  parentExecutionId?: string;
}

export interface TaggingError {
  errorId: string;
  errorType: 'validation' | 'execution' | 'conflict' | 'system';
  errorMessage: string;
  resourceId?: string;
  ruleId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export interface TaggingWarning {
  warningId: string;
  warningType: 'conflict' | 'performance' | 'validation' | 'suggestion';
  warningMessage: string;
  resourceId?: string;
  ruleId?: string;
  timestamp: Date;
}

export interface ResourceTaggingResult {
  resourceId: string;
  resourceType: string;
  previousTags: string[];
  newTags: string[];
  appliedRules: string[];
  confidence: number;
  conflicts: TaggingConflict[];
  metadata: Record<string, any>;
}

export interface TaggingConflict {
  conflictType: 'duplicate' | 'contradictory' | 'validation' | 'permission';
  conflictingRules: string[];
  conflictingTags: string[];
  resolutionStrategy: string;
  resolved: boolean;
}

// =============================================================================
// Epic 17 Auto-Tagging Service Implementation
// =============================================================================

export class Epic17AutoTaggingService extends EventEmitter {
  private config: AutoTaggingConfig;
  private isProcessing: boolean = false;
  private activeExecutions: Map<string, TaggingExecution> = new Map();

  constructor(
    private dbService: DatabaseService,
    private redisService: RedisService,
    private auditService: AuditService,
    private tagMergingSplittingService: Epic17TagMergingSplittingService,
    config?: Partial<AutoTaggingConfig>
  ) {
    super();
    this.config = {
      enabled: true,
      processingMode: 'hybrid',
      batchProcessingInterval: 60,
      maxTagsPerResource: 20,
      
      ruleProcessing: {
        maxRulesPerExecution: 50,
        ruleEvaluationTimeout: 30,
        priorityBasedProcessing: true,
        parallelProcessing: true,
        ...config?.ruleProcessing
      },
      
      patternDetection: {
        enabled: true,
        minimumPatternStrength: 0.7,
        learningMode: true,
        historicalAnalysisDays: 30,
        ...config?.patternDetection
      },
      
      mlIntegration: {
        enabled: false,
        modelVersion: '1.0',
        confidenceThreshold: 0.8,
        fallbackToRules: true,
        ...config?.mlIntegration
      },
      
      tagManagement: {
        autoCleanup: true,
        tagExpiryDays: 365,
        conflictResolution: 'merge',
        tagValidation: true,
        ...config?.tagManagement
      },
      
      performance: {
        cacheEnabled: true,
        cacheTTL: 3600,
        batchSize: 100,
        maxConcurrentOperations: 5,
        ...config?.performance
      },
      
      notifications: {
        onTaggingCompletion: true,
        onRuleConflicts: true,
        onHighVolumeTagging: true,
        tagChangeNotifications: false,
        ...config?.notifications
      },
      
      ...config
    };
  }

  // =============================================================================
  // Main Auto-Tagging Methods
  // =============================================================================

  /**
   * Execute auto-tagging for resources based on trigger
   */
  public async executeAutoTagging(
    trigger: AutoTaggingTrigger,
    resourceIds?: string[],
    ruleIds?: string[],
    options: {
      dryRun?: boolean;
      bypassApproval?: boolean;
      maxResources?: number;
    } = {}
  ): Promise<TaggingExecution> {
    const executionId = crypto.randomUUID();
    const execution: TaggingExecution = {
      executionId,
      trigger,
      executedAt: new Date(),
      rulesExecuted: [],
      resourcesProcessed: 0,
      tagsAdded: 0,
      tagsRemoved: 0,
      tagsUpdated: 0,
      conflictsResolved: 0,
      executionTime: 0,
      rulesExecutionTime: {},
      errors: [],
      warnings: [],
      executedBy: 'system'
    };

    const startTime = Date.now();
    this.activeExecutions.set(executionId, execution);

    try {
      // Get applicable rules
      const rules = await this.getApplicableRules(trigger, ruleIds);
      
      // Get target resources
      const resources = await this.getTargetResources(resourceIds, rules, options.maxResources);
      
      if (resources.length === 0) {
        execution.warnings.push({
          warningId: crypto.randomUUID(),
          warningType: 'suggestion',
          warningMessage: 'No resources found matching criteria',
          timestamp: new Date()
        });
      }

      // Execute rules in priority order
      const sortedRules = this.config.ruleProcessing.priorityBasedProcessing
        ? rules.sort((a, b) => b.priority - a.priority)
        : rules;

      for (const rule of sortedRules) {
        const ruleStartTime = Date.now();
        
        try {
          const ruleResults = await this.executeRule(rule, resources, options);
          
          // Update execution metrics
          execution.rulesExecuted.push(rule.ruleId);
          execution.tagsAdded += ruleResults.tagsAdded;
          execution.tagsRemoved += ruleResults.tagsRemoved;
          execution.tagsUpdated += ruleResults.tagsUpdated;
          execution.conflictsResolved += ruleResults.conflictsResolved;
          
          execution.rulesExecutionTime[rule.ruleId] = Date.now() - ruleStartTime;
          
        } catch (error) {
          execution.errors.push({
            errorId: crypto.randomUUID(),
            errorType: 'execution',
            errorMessage: `Failed to execute rule ${rule.ruleId}: ${error.message}`,
            ruleId: rule.ruleId,
            severity: 'high',
            timestamp: new Date()
          });
        }
      }

      execution.resourcesProcessed = resources.length;
      execution.executionTime = Date.now() - startTime;

      // Audit the execution
      await this.auditService.logActivity({
        userId: execution.executedBy,
        action: 'auto_tagging_execution',
        resource: 'auto_tagging_system',
        details: {
          executionId,
          trigger,
          resourcesProcessed: execution.resourcesProcessed,
          rulesExecuted: execution.rulesExecuted.length,
          tagsModified: execution.tagsAdded + execution.tagsRemoved + execution.tagsUpdated
        }
      });

      this.emit('taggingCompleted', execution);
      
      return execution;

    } catch (error) {
      execution.errors.push({
        errorId: crypto.randomUUID(),
        errorType: 'system',
        errorMessage: `Auto-tagging execution failed: ${error.message}`,
        severity: 'critical',
        timestamp: new Date()
      });
      
      execution.executionTime = Date.now() - startTime;
      
      throw error;
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * Create a new auto-tagging rule
   */
  public async createAutoTaggingRule(
    ruleData: Omit<AutoTaggingRule, 'ruleId' | 'createdAt' | 'executionCount' | 'successRate'>
  ): Promise<AutoTaggingRule> {
    const rule: AutoTaggingRule = {
      ...ruleData,
      ruleId: crypto.randomUUID(),
      createdAt: new Date(),
      executionCount: 0,
      successRate: 0
    };

    // Validate rule structure
    await this.validateRule(rule);

    // Store rule in database
    await this.dbService.query(
      `INSERT INTO epic17_auto_tagging_rules (
        rule_id, rule_name, description, rule_type, enabled, priority,
        conditions, actions, target_resource_types, resource_filters,
        execution_mode, requires_approval, conflict_resolution,
        pattern_config, ml_config, created_by, test_mode, validation_rules
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
      [
        rule.ruleId,
        rule.ruleName,
        rule.description,
        rule.ruleType,
        rule.enabled,
        rule.priority,
        JSON.stringify(rule.conditions),
        JSON.stringify(rule.actions),
        JSON.stringify(rule.targetResourceTypes),
        JSON.stringify(rule.resourceFilters),
        rule.executionMode,
        rule.requiresApproval,
        rule.conflictResolution,
        JSON.stringify(rule.patternConfig),
        JSON.stringify(rule.mlConfig),
        rule.createdBy,
        rule.testMode,
        JSON.stringify(rule.validationRules)
      ]
    );

    // Cache rule for performance
    if (this.config.performance.cacheEnabled) {
      await this.redisService.setex(
        `auto_tagging_rule:${rule.ruleId}`,
        this.config.performance.cacheTTL,
        JSON.stringify(rule)
      );
    }

    await this.auditService.logActivity({
      userId: rule.createdBy,
      action: 'create_auto_tagging_rule',
      resource: rule.ruleId,
      details: { ruleName: rule.ruleName, ruleType: rule.ruleType }
    });

    this.emit('ruleCreated', rule);
    
    return rule;
  }

  /**
   * Analyze patterns in existing resources to suggest new tagging rules
   */
  public async analyzeTaggingPatterns(
    resourceType?: string,
    timeWindowDays: number = 30
  ): Promise<{
    patterns: TaggingPattern[];
    suggestions: RuleSuggestion[];
    confidence: number;
  }> {
    const analysisStartTime = Date.now();

    // Analyze naming patterns
    const namingPatterns = await this.analyzeNamingPatterns(resourceType, timeWindowDays);
    
    // Analyze usage patterns
    const usagePatterns = await this.analyzeUsagePatterns(resourceType, timeWindowDays);
    
    // Analyze relationship patterns
    const relationshipPatterns = await this.analyzeRelationshipPatterns(resourceType, timeWindowDays);
    
    // Combine patterns
    const allPatterns = [...namingPatterns, ...usagePatterns, ...relationshipPatterns];
    
    // Generate rule suggestions
    const suggestions = await this.generateRuleSuggestions(allPatterns);
    
    // Calculate overall confidence
    const confidence = allPatterns.length > 0
      ? allPatterns.reduce((sum, p) => sum + p.confidence, 0) / allPatterns.length
      : 0;

    const result = {
      patterns: allPatterns,
      suggestions,
      confidence
    };

    // Cache results for performance
    if (this.config.performance.cacheEnabled) {
      const cacheKey = `pattern_analysis:${resourceType || 'all'}:${timeWindowDays}`;
      await this.redisService.setex(cacheKey, 1800, JSON.stringify(result)); // 30 minutes cache
    }

    this.emit('patternAnalysisCompleted', {
      resourceType,
      timeWindowDays,
      patternsFound: allPatterns.length,
      suggestionsGenerated: suggestions.length,
      executionTime: Date.now() - analysisStartTime
    });

    return result;
  }

  /**
   * Get comprehensive auto-tagging statistics and metrics
   */
  public async getAutoTaggingMetrics(timeWindowDays: number = 7): Promise<{
    executionMetrics: any;
    ruleMetrics: any;
    tagMetrics: any;
    performanceMetrics: any;
    errorMetrics: any;
  }> {
    const query = `
      SELECT 
        -- Execution metrics
        COUNT(*) as total_executions,
        COUNT(*) FILTER (WHERE executed_at >= NOW() - INTERVAL '24 hours') as executions_today,
        AVG(resources_processed) as avg_resources_per_execution,
        AVG(execution_time) as avg_execution_time,
        
        -- Tag metrics
        SUM(tags_added) as total_tags_added,
        SUM(tags_removed) as total_tags_removed,
        SUM(tags_updated) as total_tags_updated,
        SUM(conflicts_resolved) as total_conflicts_resolved,
        
        -- Error metrics
        SUM(array_length(errors::text[], 1)) as total_errors,
        SUM(array_length(warnings::text[], 1)) as total_warnings
        
      FROM epic17_auto_tagging_executions
      WHERE executed_at >= NOW() - INTERVAL '${timeWindowDays} days'
    `;

    const [executionResults] = await this.dbService.query(query);

    const ruleMetrics = await this.getRuleMetrics(timeWindowDays);
    const tagMetrics = await this.getTagMetrics(timeWindowDays);
    const performanceMetrics = await this.getPerformanceMetrics(timeWindowDays);
    const errorMetrics = await this.getErrorMetrics(timeWindowDays);

    return {
      executionMetrics: executionResults,
      ruleMetrics,
      tagMetrics,
      performanceMetrics,
      errorMetrics
    };
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private async getApplicableRules(
    trigger: AutoTaggingTrigger,
    ruleIds?: string[]
  ): Promise<AutoTaggingRule[]> {
    let query = `
      SELECT * FROM epic17_auto_tagging_rules 
      WHERE enabled = true AND test_mode = false
    `;
    
    const params: any[] = [];
    
    if (ruleIds && ruleIds.length > 0) {
      query += ` AND rule_id = ANY($${params.length + 1})`;
      params.push(ruleIds);
    }
    
    query += ` ORDER BY priority DESC`;
    
    const results = await this.dbService.query(query, params);
    
    return results.map(row => ({
      ruleId: row.rule_id,
      ruleName: row.rule_name,
      description: row.description,
      ruleType: row.rule_type,
      enabled: row.enabled,
      priority: row.priority,
      conditions: JSON.parse(row.conditions),
      actions: JSON.parse(row.actions),
      targetResourceTypes: JSON.parse(row.target_resource_types),
      resourceFilters: JSON.parse(row.resource_filters),
      executionMode: row.execution_mode,
      requiresApproval: row.requires_approval,
      conflictResolution: row.conflict_resolution,
      patternConfig: JSON.parse(row.pattern_config || '{}'),
      mlConfig: JSON.parse(row.ml_config || '{}'),
      createdBy: row.created_by,
      createdAt: row.created_at,
      lastExecuted: row.last_executed,
      executionCount: row.execution_count,
      successRate: row.success_rate,
      testMode: row.test_mode,
      validationRules: JSON.parse(row.validation_rules || '[]')
    }));
  }

  private async getTargetResources(
    resourceIds?: string[],
    rules?: AutoTaggingRule[],
    maxResources?: number
  ): Promise<any[]> {
    // Get resource types from rules
    const resourceTypes = new Set<string>();
    if (rules) {
      rules.forEach(rule => {
        rule.targetResourceTypes.forEach(type => resourceTypes.add(type));
      });
    }

    // Build resource query based on types and filters
    const resources: any[] = [];
    
    for (const resourceType of resourceTypes) {
      let query = '';
      let params: any[] = [];
      
      switch (resourceType) {
        case 'api_key':
          query = 'SELECT key_id as id, \'api_key\' as type, * FROM api_keys WHERE status = $1';
          params = ['active'];
          break;
          
        case 'user':
          query = 'SELECT user_id as id, \'user\' as type, * FROM users WHERE active = $1';
          params = [true];
          break;
          
        case 'permission':
          query = 'SELECT permission_id as id, \'permission\' as type, * FROM permissions WHERE enabled = $1';
          params = [true];
          break;
          
        default:
          continue;
      }

      if (resourceIds && resourceIds.length > 0) {
        query += ` AND id = ANY($${params.length + 1})`;
        params.push(resourceIds);
      }

      if (maxResources) {
        query += ` LIMIT $${params.length + 1}`;
        params.push(maxResources);
      }

      const results = await this.dbService.query(query, params);
      resources.push(...results);
    }

    return resources;
  }

  private async executeRule(
    rule: AutoTaggingRule,
    resources: any[],
    options: any
  ): Promise<{
    tagsAdded: number;
    tagsRemoved: number;
    tagsUpdated: number;
    conflictsResolved: number;
  }> {
    let tagsAdded = 0;
    let tagsRemoved = 0;
    let tagsUpdated = 0;
    let conflictsResolved = 0;

    for (const resource of resources) {
      // Check if resource matches rule conditions
      const matches = await this.evaluateConditions(rule.conditions, resource);
      
      if (matches) {
        // Execute rule actions
        for (const action of rule.actions) {
          const result = await this.executeAction(action, resource, rule, options);
          
          tagsAdded += result.tagsAdded;
          tagsRemoved += result.tagsRemoved;
          tagsUpdated += result.tagsUpdated;
          conflictsResolved += result.conflictsResolved;
        }
      }
    }

    // Update rule statistics
    await this.updateRuleStatistics(rule.ruleId, {
      tagsAdded,
      tagsRemoved,
      tagsUpdated,
      conflictsResolved
    });

    return {
      tagsAdded,
      tagsRemoved,
      tagsUpdated,
      conflictsResolved
    };
  }

  private async evaluateConditions(
    conditions: AutoTaggingCondition[],
    resource: any
  ): Promise<boolean> {
    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, resource);
      
      if (condition.required && !result) {
        return false;
      }
    }
    
    return true;
  }

  private async evaluateCondition(
    condition: AutoTaggingCondition,
    resource: any
  ): Promise<boolean> {
    const fieldValue = this.getResourceFieldValue(resource, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
        
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
        
      case 'matches':
        const regex = new RegExp(condition.value, 'i');
        return regex.test(String(fieldValue));
        
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
        
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
        
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
        
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
        
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
        
      default:
        return false;
    }
  }

  private getResourceFieldValue(resource: any, field: string): any {
    const fieldParts = field.split('.');
    let value = resource;
    
    for (const part of fieldParts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  private async executeAction(
    action: TaggingAction,
    resource: any,
    rule: AutoTaggingRule,
    options: any
  ): Promise<{
    tagsAdded: number;
    tagsRemoved: number;
    tagsUpdated: number;
    conflictsResolved: number;
  }> {
    let result = {
      tagsAdded: 0,
      tagsRemoved: 0,
      tagsUpdated: 0,
      conflictsResolved: 0
    };

    if (options.dryRun) {
      // In dry run mode, just simulate the action
      return result;
    }

    switch (action.actionType) {
      case 'add_tag':
        result.tagsAdded += await this.addTagsToResource(resource, action.tags, action.tagMetadata);
        break;
        
      case 'remove_tag':
        result.tagsRemoved += await this.removeTagsFromResource(resource, action.tags);
        break;
        
      case 'replace_tag':
        // Remove old tags and add new ones
        result.tagsRemoved += await this.removeTagsFromResource(resource, action.tags.slice(0, 1));
        result.tagsAdded += await this.addTagsToResource(resource, action.tags.slice(1), action.tagMetadata);
        break;
    }

    return result;
  }

  private async addTagsToResource(
    resource: any,
    tags: string[],
    metadata?: Record<string, any>
  ): Promise<number> {
    let addedCount = 0;
    
    for (const tag of tags) {
      // Check if tag already exists
      const existsQuery = `
        SELECT COUNT(*) as count FROM resource_tags 
        WHERE resource_id = $1 AND resource_type = $2 AND tag = $3
      `;
      
      const [existsResult] = await this.dbService.query(existsQuery, [
        resource.id,
        resource.type,
        tag
      ]);

      if (existsResult.count === 0) {
        // Add new tag
        await this.dbService.query(
          `INSERT INTO resource_tags (resource_id, resource_type, tag, metadata, created_at, created_by) 
           VALUES ($1, $2, $3, $4, NOW(), 'auto_tagging_system')`,
          [resource.id, resource.type, tag, JSON.stringify(metadata || {})]
        );
        
        addedCount++;
      }
    }
    
    return addedCount;
  }

  private async removeTagsFromResource(resource: any, tags: string[]): Promise<number> {
    const result = await this.dbService.query(
      `DELETE FROM resource_tags 
       WHERE resource_id = $1 AND resource_type = $2 AND tag = ANY($3)`,
      [resource.id, resource.type, tags]
    );
    
    return result.rowCount || 0;
  }

  private async validateRule(rule: AutoTaggingRule): Promise<void> {
    // Validate rule structure
    if (!rule.ruleName || rule.ruleName.trim().length === 0) {
      throw new Error('Rule name is required');
    }

    if (!rule.conditions || rule.conditions.length === 0) {
      throw new Error('Rule must have at least one condition');
    }

    if (!rule.actions || rule.actions.length === 0) {
      throw new Error('Rule must have at least one action');
    }

    if (!rule.targetResourceTypes || rule.targetResourceTypes.length === 0) {
      throw new Error('Rule must target at least one resource type');
    }

    // Validate conditions
    for (const condition of rule.conditions) {
      if (!condition.field || !condition.operator) {
        throw new Error('Each condition must have a field and operator');
      }
    }

    // Validate actions
    for (const action of rule.actions) {
      if (!action.actionType || !action.tags || action.tags.length === 0) {
        throw new Error('Each action must have a type and at least one tag');
      }
    }
  }

  private async analyzeNamingPatterns(
    resourceType?: string,
    timeWindowDays: number = 30
  ): Promise<TaggingPattern[]> {
    // Implement naming pattern analysis
    // This would analyze resource names for common patterns
    return [];
  }

  private async analyzeUsagePatterns(
    resourceType?: string,
    timeWindowDays: number = 30
  ): Promise<TaggingPattern[]> {
    // Implement usage pattern analysis
    // This would analyze usage metrics for pattern detection
    return [];
  }

  private async analyzeRelationshipPatterns(
    resourceType?: string,
    timeWindowDays: number = 30
  ): Promise<TaggingPattern[]> {
    // Implement relationship pattern analysis
    // This would analyze relationships between resources
    return [];
  }

  private async generateRuleSuggestions(patterns: TaggingPattern[]): Promise<RuleSuggestion[]> {
    // Generate rule suggestions based on detected patterns
    return [];
  }

  private async updateRuleStatistics(
    ruleId: string,
    stats: {
      tagsAdded: number;
      tagsRemoved: number;
      tagsUpdated: number;
      conflictsResolved: number;
    }
  ): Promise<void> {
    await this.dbService.query(
      `UPDATE epic17_auto_tagging_rules 
       SET 
         execution_count = execution_count + 1,
         last_executed = NOW(),
         updated_at = NOW()
       WHERE rule_id = $1`,
      [ruleId]
    );
  }

  private async getRuleMetrics(timeWindowDays: number): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_rules,
        COUNT(*) FILTER (WHERE enabled = true) as enabled_rules,
        AVG(success_rate) as avg_success_rate,
        MAX(execution_count) as max_executions
      FROM epic17_auto_tagging_rules
    `;
    
    const [result] = await this.dbService.query(query);
    return result;
  }

  private async getTagMetrics(timeWindowDays: number): Promise<any> {
    // Implementation would analyze tag usage patterns
    return {};
  }

  private async getPerformanceMetrics(timeWindowDays: number): Promise<any> {
    // Implementation would analyze performance metrics
    return {};
  }

  private async getErrorMetrics(timeWindowDays: number): Promise<any> {
    // Implementation would analyze error patterns
    return {};
  }
}

// =============================================================================
// Supporting Types and Interfaces
// =============================================================================

export interface TaggingPattern {
  patternId: string;
  patternType: 'naming' | 'usage' | 'relationship' | 'temporal';
  pattern: string;
  confidence: number;
  occurrences: number;
  resourceTypes: string[];
  suggestedTags: string[];
}

export interface RuleSuggestion {
  suggestionId: string;
  suggestedRuleName: string;
  description: string;
  ruleType: TaggingRuleType;
  confidence: number;
  basedOnPatterns: string[];
  estimatedImpact: {
    affectedResources: number;
    tagsToAdd: number;
    conflictsExpected: number;
  };
  suggestedRule: Partial<AutoTaggingRule>;
}