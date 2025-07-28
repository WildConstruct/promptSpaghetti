/**
 * Epic 17 Tag Merging and Splitting Service - API Management System
 * Task: E17-1753114396892-864734 - Implement tag merging and splitting
 * 
 * Comprehensive tag management system for Epic 17 API Management System that handles
 * tag consolidation, splitting, relationship management, duplicate detection, and
 * automated tag optimization to maintain clean and organized tagging structures.
 */

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

// =============================================================================
// Tag Merging and Splitting Types and Interfaces
// =============================================================================

}
export interface TagMergingSplittingConfig {
  // General settings
  enabled: boolean;
  processingMode: 'manual' | 'semi_automatic' | 'automatic';
  duplicateDetectionThreshold: number; // 0-1 similarity threshold
  
  // Merging settings
  merging: {
    enabled: boolean;
    autoMergeThreshold: number; // 0-1 confidence threshold for automatic merging
    preserveHistory: boolean;
    requireApproval: boolean;
    maxMergeDepth: number; // Prevent infinite merge chains
}
  };
  
  // Splitting settings
  splitting: {
    enabled: boolean;
    autoSplitThreshold: number; // 0-1 confidence threshold for automatic splitting
    minResourcesForSplit: number; // Minimum resources before considering split
    preserveOriginal: boolean;
    requireApproval: boolean;
  };
  
  // Duplicate detection
  duplicateDetection: {
    enabled: boolean;
    algorithms: ('levenshtein' | 'soundex' | 'semantic' | 'pattern')[];
    caseSensitive: boolean;
    ignoreCommonWords: boolean;
    customSimilarityRules: Record<string, any>;
  };
  
  // Relationship management
  relationshipManagement: {
    enabled: boolean;
    autoDetectHierarchies: boolean;
    maintainSynonyms: boolean;
    trackTagEvolution: boolean;
  };
  
  // Safety and validation
  validation: {
    requireBusinessRules: boolean;
    validateResourceImpact: boolean;
    rollbackSupport: boolean;
    backupBeforeOperations: boolean;
  };
  
  // Performance settings
  performance: {
    batchSize: number;
    maxConcurrentOperations: number;
    cacheResults: boolean;
    useParallelProcessing: boolean;
  };
  
  // Notification settings
  notifications: {
    onMergeCompletion: boolean;
    onSplitCompletion: boolean;
    onDuplicateDetection: boolean;
    onConflictResolution: boolean;
  };
}

export enum TagOperationType {
  MERGE = 'merge',
  SPLIT = 'split',
  RENAME = 'rename',
  DELETE = 'delete',
  CONSOLIDATE = 'consolidate',
  HIERARCHY_ADJUSTMENT = 'hierarchy_adjustment'
}

export enum TagOperationStatus {
  PENDING = 'pending',
  ANALYZING = 'analyzing',
  APPROVED = 'approved',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  ROLLED_BACK = 'rolled_back'
}

}
export interface TagMergeOperation {
  operationId: string;
  operationType: TagOperationType.MERGE;
  status: TagOperationStatus;
  
  // Source and target information
  sourceTags: string[];
  targetTag: string;
  mergeReason: string;
  
  // Operation configuration
  preserveSourceHistory: boolean;
  transferAllResources: boolean;
  updateRelatedTags: boolean;
  
  // Analysis results
  impactAnalysis: TagImpactAnalysis;
  similarityScore: number;
  confidenceScore: number;
  
  // Approval workflow
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  approvalComments?: string;
  
  // Execution tracking
  resourcesAffected: number;
  resourcesProcessed: number;
  errors: TagOperationError[];
  warnings: TagOperationWarning[];
  
  // Operation metadata
  initiatedBy: string;
  initiatedAt: Date;
  completedAt?: Date;
  executionTime?: number; // milliseconds
}
}

}
export interface TagSplitOperation {
  operationId: string;
  operationType: TagOperationType.SPLIT;
  status: TagOperationStatus;
  
  // Source and target information
  sourceTag: string;
  targetTags: string[];
  splitCriteria: SplitCriteria;
  splitReason: string;
  
  // Operation configuration
  preserveSourceTag: boolean;
  splitMethod: 'pattern' | 'semantic' | 'manual' | 'usage_based';
  resourceDistribution: ResourceDistributionStrategy;
  
  // Analysis results
  impactAnalysis: TagImpactAnalysis;
  splitFeasibility: number; // 0-1 score
  confidenceScore: number;
  
  // Resource allocation
  resourceMapping: Record<string, string[]>; // resource_id -> new_tag_names
  unmappedResources: string[]; // Resources that couldn't be automatically mapped
  
  // Approval workflow
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  approvalComments?: string;
  
  // Execution tracking
  resourcesAffected: number;
  resourcesProcessed: number;
  errors: TagOperationError[];
  warnings: TagOperationWarning[];
  
  // Operation metadata
  initiatedBy: string;
  initiatedAt: Date;
  completedAt?: Date;
  executionTime?: number;
}
}

}
export interface SplitCriteria {
  criteriaType: 'pattern' | 'semantic' | 'usage' | 'metadata' | 'custom';
  
  // Pattern-based criteria
  patterns?: {
    delimiter?: string;
    regex?: string;
}
    prefixSuffix?: { prefix?: string; suffix?: string; };
  };
  
  // Semantic criteria
  semantic?: {
    concepts: string[];
    threshold: number;
    useNLP: boolean;
  };
  
  // Usage-based criteria
  usage?: {
    usagePatterns: string[];
    resourceTypes: string[];
    contextualFactors: string[];
  };
  
  // Metadata criteria
  metadata?: {
    metadataFields: string[];
    valueMappings: Record<string, string>;
  };
  
  // Custom criteria
  custom?: {
    expression: string;
    parameters: Record<string, any>;
  };
}

export enum ResourceDistributionStrategy {
  EVEN = 'even',
  PROPORTIONAL = 'proportional',
  PATTERN_BASED = 'pattern_based',
  SEMANTIC_BASED = 'semantic_based',
  MANUAL = 'manual'
}

}
export interface TagImpactAnalysis {
  analysisId: string;
  analyzedAt: Date;
  
  // Resource impact
  totalResourcesAffected: number;
  resourceTypeBreakdown: Record<string, number>;
  criticalResourcesAffected: number;
  
  // Relationship impact
  relatedTagsAffected: string[];
  hierarchyChanges: HierarchyChange[];
  synonymRelationshipsAffected: number;
  
  // System impact
  performanceImpact: PerformanceImpact;
  compatibilityIssues: string[];
  rollbackComplexity: 'low' | 'medium' | 'high';
  
  // Business impact
  businessRuleViolations: BusinessRuleViolation[];
  complianceImpact: string[];
  userExperienceImpact: 'minimal' | 'moderate' | 'significant';
  
  // Risk assessment
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  mitigationStrategies: string[];
  recommendedActions: string[];
}
}

}
export interface HierarchyChange {
  changeType: 'parent_change' | 'child_addition' | 'child_removal' | 'level_change';
  affectedTag: string;
  previousState: any;
  newState: any;
  impact: string;
}
}

}
export interface PerformanceImpact {
  estimatedExecutionTime: number; // milliseconds
  resourceConsumption: {
    cpu: number; // percentage
    memory: number; // MB
    storage: number; // MB
}
  };
  systemLoad: 'low' | 'medium' | 'high';
  concurrencyConstraints: string[];
}

}
export interface BusinessRuleViolation {
  ruleId: string;
  ruleName: string;
  violationType: 'constraint' | 'policy' | 'compliance';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution: string;
}
}

}
export interface TagOperationError {
  errorId: string;
  errorType: 'validation' | 'execution' | 'rollback' | 'system';
  errorMessage: string;
  affectedResource?: string;
  affectedTag?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  stackTrace?: string;
}
}

}
export interface TagOperationWarning {
  warningId: string;
  warningType: 'performance' | 'data_loss' | 'conflict' | 'recommendation';
  warningMessage: string;
  affectedResource?: string;
  affectedTag?: string;
  timestamp: Date;
  actionable: boolean;
}
}

}
export interface DuplicateTagGroup {
  groupId: string;
  primaryTag: string;
  duplicateTags: string[];
  similarityScores: Record<string, number>;
  detectionMethod: string;
  
  // Analysis
  mergeRecommendation: {
    recommended: boolean;
    confidence: number;
    targetTag: string;
    reasoning: string;
}
  };
  
  // Usage information
  totalUsageCount: number;
  resourceDistribution: Record<string, number>; // tag -> resource_count
  
  // Detection metadata
  detectedAt: Date;
  lastValidated?: Date;
  falsePositive: boolean;
}

}
export interface TagRelationship {
  relationshipId: string;
  relationshipType: 'synonym' | 'parent_child' | 'related' | 'mutually_exclusive';
  sourceTag: string;
  targetTag: string;
  
  // Relationship metadata
  strength: number; // 0-1
  confidence: number; // 0-1
  bidirectional: boolean;
  
  // Lifecycle
  establishedAt: Date;
  establishedBy: string;
  validatedAt?: Date;
  deprecated: boolean;
}
}

// =============================================================================
// Epic 17 Tag Merging and Splitting Service Implementation
// =============================================================================

export class Epic17TagMergingSplittingService extends EventEmitter {
  private config: TagMergingSplittingConfig;
  private activeOperations: Map<string, TagMergeOperation | TagSplitOperation> = new Map();
  private duplicateCache: Map<string, DuplicateTagGroup[]> = new Map();

  constructor(
    private dbService: DatabaseService,
    private redisService: RedisService,
    private auditService: AuditService,
    config?: Partial<TagMergingSplittingConfig>
  ) {
    super();
    this.config = {
      enabled: true,
      processingMode: 'semi_automatic',
      duplicateDetectionThreshold: 0.85,
      
      merging: {
        enabled: true,
        autoMergeThreshold: 0.95,
        preserveHistory: true,
        requireApproval: true,
        maxMergeDepth: 5,
        ...config?.merging
  }
      splitting: {
        enabled: true,
        autoSplitThreshold: 0.90,
        minResourcesForSplit: 10,
        preserveOriginal: false,
        requireApproval: true,
        ...config?.splitting
  }
      duplicateDetection: {
        enabled: true,
        algorithms: ['levenshtein', 'soundex', 'semantic'],
        caseSensitive: false,
        ignoreCommonWords: true,
        customSimilarityRules: {},
        ...config?.duplicateDetection
  }
      relationshipManagement: {
        enabled: true,
        autoDetectHierarchies: true,
        maintainSynonyms: true,
        trackTagEvolution: true,
        ...config?.relationshipManagement
  }
      validation: {
        requireBusinessRules: true,
        validateResourceImpact: true,
        rollbackSupport: true,
        backupBeforeOperations: true,
        ...config?.validation
  }
      performance: {
        batchSize: 100,
        maxConcurrentOperations: 3,
        cacheResults: true,
        useParallelProcessing: true,
        ...config?.performance
  }
      notifications: {
        onMergeCompletion: true,
        onSplitCompletion: true,
        onDuplicateDetection: true,
        onConflictResolution: true,
        ...config?.notifications
  }
      ...config
    };
  }

  // =============================================================================
  // Tag Merging Methods
  // =============================================================================

  /**
   * Create and execute a tag merge operation
   */
  public async createTagMergeOperation(
    sourceTags: string[],
    targetTag: string,
    mergeReason: string,
    options: {
      initiatedBy: string;
      preserveHistory?: boolean;
      transferAllResources?: boolean;
      updateRelatedTags?: boolean;
      bypassApproval?: boolean;
    }
  ): Promise<TagMergeOperation> {

    if (sourceTags.length === 0) {
      throw new Error('At least one source tag must be specified');
    }

    if (sourceTags.includes(targetTag)) {
      throw new Error('Target tag cannot be one of the source tags');
    }

    // Validate source tags exist
    await this.validateTagsExist(sourceTags);

    const operation: TagMergeOperation = {
      operationId: crypto.randomUUID(),
      operationType: TagOperationType.MERGE,
      status: TagOperationStatus.PENDING,
      
      sourceTags,
      targetTag,
      mergeReason,
      
      preserveSourceHistory: options.preserveHistory ?? this.config.merging.preserveHistory,
      transferAllResources: options.transferAllResources ?? true,
      updateRelatedTags: options.updateRelatedTags ?? true,
      
      impactAnalysis: await this.analyzeMergeImpact(sourceTags, targetTag),
      similarityScore: await this.calculateTagSimilarity(sourceTags, targetTag),
      confidenceScore: 0, // Will be calculated based on various factors
      
      requiresApproval: options.bypassApproval ? false : this.config.merging.requireApproval,
      
      resourcesAffected: 0,
      resourcesProcessed: 0,
      errors: [],
      warnings: [],
      
      initiatedBy: options.initiatedBy,
      initiatedAt: new Date()
    };

    // Calculate confidence score
    operation.confidenceScore = this.calculateMergeConfidence(operation);

    // Store operation in database
    await this.storeTagOperation(operation);

    // Add to active operations
    this.activeOperations.set(operation.operationId, operation);

    // If approval is required, create approval request
    if (operation.requiresApproval && operation.confidenceScore < this.config.merging.autoMergeThreshold) {
      await this.createApprovalRequest(operation);
    } else {
      // Execute immediately
      await this.executeMergeOperation(operation);
    }

    this.emit('mergeOperationCreated', operation);
    
    return operation;
  }

  /**
   * Execute a tag merge operation
   */
  private async executeMergeOperation(operation: TagMergeOperation): Promise<void> {

    const startTime = Date.now();
    operation.status = TagOperationStatus.EXECUTING;
    
    try {
      // Create backup if configured
      if (this.config.validation.backupBeforeOperations) {
        await this.createOperationBackup(operation);
      }

      // Get all resources with source tags
      const affectedResources = await this.getResourcesWithTags(operation.sourceTags);
      operation.resourcesAffected = affectedResources.length;

      // Process resources in batches
      const batches = this.createBatches(affectedResources, this.config.performance.batchSize);
      
      for (const batch of batches) {
        await this.processMergeBatch(operation, batch);
        operation.resourcesProcessed += batch.length;
        
        // Update operation progress
        await this.updateOperationProgress(operation);
      }

      // Update tag relationships if configured
      if (operation.updateRelatedTags) {
        await this.updateTagRelationshipsAfterMerge(operation);
      }

      // Handle source tag cleanup
      await this.handleSourceTagCleanup(operation);

      operation.status = TagOperationStatus.COMPLETED;
      operation.completedAt = new Date();
      operation.executionTime = Date.now() - startTime;

      await this.storeTagOperation(operation);
      
      // Audit the merge
      await this.auditService.logActivity({
        userId: operation.initiatedBy,
        action: 'tag_merge_completed',
        resource: `merge_operation:${operation.operationId}`,
        details: {
          sourceTags: operation.sourceTags,
          targetTag: operation.targetTag,
          resourcesAffected: operation.resourcesAffected,
          executionTime: operation.executionTime
        }
      });

      this.emit('mergeOperationCompleted', operation);

    } catch (error) {
      operation.status = TagOperationStatus.FAILED;
      operation.errors.push({
        errorId: crypto.randomUUID(),
        errorType: 'execution',
        errorMessage: `Merge operation failed: ${error.message}`,
        severity: 'critical',
        timestamp: new Date(),
        stackTrace: error.stack
      });
      
      await this.storeTagOperation(operation);
      
      this.emit('mergeOperationFailed', operation);
      throw error;
    } finally {
      this.activeOperations.delete(operation.operationId);
    }
  }

  // =============================================================================
  // Tag Splitting Methods
  // =============================================================================

  /**
   * Create and execute a tag split operation
   */
  public async createTagSplitOperation(
    sourceTag: string,
    targetTags: string[],
    splitCriteria: SplitCriteria,
    splitReason: string,
    options: {
      initiatedBy: string;
      preserveSource?: boolean;
      splitMethod?: 'pattern' | 'semantic' | 'manual' | 'usage_based';
      distributionStrategy?: ResourceDistributionStrategy;
      bypassApproval?: boolean;
    }
  ): Promise<TagSplitOperation> {

    if (targetTags.length === 0) {
      throw new Error('At least one target tag must be specified');
    }

    if (targetTags.includes(sourceTag)) {
      throw new Error('Target tags cannot include the source tag');
    }

    // Validate source tag exists
    await this.validateTagsExist([sourceTag]);

    // Analyze split feasibility
    const splitAnalysis = await this.analyzeSplitFeasibility(sourceTag, targetTags, splitCriteria);

    const operation: TagSplitOperation = {
      operationId: crypto.randomUUID(),
      operationType: TagOperationType.SPLIT,
      status: TagOperationStatus.ANALYZING,
      
      sourceTag,
      targetTags,
      splitCriteria,
      splitReason,
      
      preserveSourceTag: options.preserveSource ?? this.config.splitting.preserveOriginal,
      splitMethod: options.splitMethod ?? 'semantic',
      resourceDistribution: options.distributionStrategy ?? ResourceDistributionStrategy.SEMANTIC_BASED,
      
      impactAnalysis: await this.analyzeSplitImpact(sourceTag, targetTags),
      splitFeasibility: splitAnalysis.feasibilityScore,
      confidenceScore: splitAnalysis.confidenceScore,
      
      resourceMapping: {},
      unmappedResources: [],
      
      requiresApproval: options.bypassApproval ? false : this.config.splitting.requireApproval,
      
      resourcesAffected: 0,
      resourcesProcessed: 0,
      errors: [],
      warnings: [],
      
      initiatedBy: options.initiatedBy,
      initiatedAt: new Date()
    };

    // Generate resource mapping based on split criteria
    const mappingResult = await this.generateResourceMapping(operation);
    operation.resourceMapping = mappingResult.mapping;
    operation.unmappedResources = mappingResult.unmapped;

    // Store operation in database
    await this.storeTagOperation(operation);
    this.activeOperations.set(operation.operationId, operation);

    // Check if approval is required
    if (operation.requiresApproval && operation.confidenceScore < this.config.splitting.autoSplitThreshold) {
      await this.createApprovalRequest(operation);
    } else {
      // Execute immediately
      await this.executeSplitOperation(operation);
    }

    this.emit('splitOperationCreated', operation);
    
    return operation;
  }

  /**
   * Execute a tag split operation
   */
  private async executeSplitOperation(operation: TagSplitOperation): Promise<void> {

    const startTime = Date.now();
    operation.status = TagOperationStatus.EXECUTING;
    
    try {
      // Create backup if configured
      if (this.config.validation.backupBeforeOperations) {
        await this.createOperationBackup(operation);
      }

      // Get all resources with the source tag
      const affectedResources = await this.getResourcesWithTags([operation.sourceTag]);
      operation.resourcesAffected = affectedResources.length;

      // Process resources in batches
      const batches = this.createBatches(affectedResources, this.config.performance.batchSize);
      
      for (const batch of batches) {
        await this.processSplitBatch(operation, batch);
        operation.resourcesProcessed += batch.length;
        
        // Update operation progress
        await this.updateOperationProgress(operation);
      }

      // Handle source tag cleanup
      if (!operation.preserveSourceTag) {
        await this.removeSourceTag(operation.sourceTag);
      }

      // Update tag relationships
      await this.updateTagRelationshipsAfterSplit(operation);

      operation.status = TagOperationStatus.COMPLETED;
      operation.completedAt = new Date();
      operation.executionTime = Date.now() - startTime;

      await this.storeTagOperation(operation);
      
      // Audit the split
      await this.auditService.logActivity({
        userId: operation.initiatedBy,
        action: 'tag_split_completed',
        resource: `split_operation:${operation.operationId}`,
        details: {
          sourceTag: operation.sourceTag,
          targetTags: operation.targetTags,
          resourcesAffected: operation.resourcesAffected,
          executionTime: operation.executionTime
        }
      });

      this.emit('splitOperationCompleted', operation);

    } catch (error) {
      operation.status = TagOperationStatus.FAILED;
      operation.errors.push({
        errorId: crypto.randomUUID(),
        errorType: 'execution',
        errorMessage: `Split operation failed: ${error.message}`,
        severity: 'critical',
        timestamp: new Date(),
        stackTrace: error.stack
      });
      
      await this.storeTagOperation(operation);
      
      this.emit('splitOperationFailed', operation);
      throw error;
    } finally {
      this.activeOperations.delete(operation.operationId);
    }
  }

  // =============================================================================
  // Duplicate Detection Methods
  // =============================================================================

  /**
   * Detect duplicate tags using various algorithms
   */
  public async detectDuplicateTags(
    resourceType?: string,
    options: {
      algorithms?: ('levenshtein' | 'soundex' | 'semantic' | 'pattern')[];
      threshold?: number;
      includeCache?: boolean;
    } = {}
  ): Promise<DuplicateTagGroup[]> {

    const cacheKey = `duplicate_detection:${resourceType || 'all'}`;
    
    // Check cache if enabled
    if (options.includeCache !== false && this.duplicateCache.has(cacheKey)) {
      const cached = this.duplicateCache.get(cacheKey);
      if (cached) return cached;
    }

    const algorithms = options.algorithms || this.config.duplicateDetection.algorithms;
    const threshold = options.threshold || this.config.duplicateDetectionThreshold;

    // Get all tags for analysis
    let query = `
      SELECT DISTINCT tag, COUNT(*) as usage_count
      FROM resource_tags
    `;
    
    const params: any[] = [];
    if (resourceType) {
      query += ' WHERE resource_type = $1';
      params.push(resourceType);
    }
    
    query += ' GROUP BY tag ORDER BY usage_count DESC';
    
    const tags = await this.dbService.query(query, params);
    
    // Detect duplicates using specified algorithms
    const duplicateGroups: DuplicateTagGroup[] = [];
    
    for (let i = 0; i < tags.length; i++) {
      for (let j = i + 1; j < tags.length; j++) {
        const tag1 = tags[i];
        const tag2 = tags[j];
        
        const similarities = await this.calculateTagSimilarities(tag1.tag, tag2.tag, algorithms);
        const maxSimilarity = Math.max(...Object.values(similarities));
        
        if (maxSimilarity >= threshold) {
          // Find or create duplicate group
          let group = duplicateGroups.find(g => 
            g.primaryTag === tag1.tag || g.duplicateTags.includes(tag1.tag) ||
            g.primaryTag === tag2.tag || g.duplicateTags.includes(tag2.tag)
          );
          
          if (!group) {
            group = {
              groupId: crypto.randomUUID(),
              primaryTag: tag1.usage_count >= tag2.usage_count ? tag1.tag : tag2.tag,
              duplicateTags: [],
              similarityScores: {},
              detectionMethod: Object.keys(similarities).find(k => similarities[k] === maxSimilarity) || 'unknown',
              mergeRecommendation: {
                recommended: true,
                confidence: maxSimilarity,
                targetTag: tag1.usage_count >= tag2.usage_count ? tag1.tag : tag2.tag,
                reasoning: `High similarity score (${maxSimilarity.toFixed(2)}) detected via ${Object.keys(similarities).find(k => similarities[k] === maxSimilarity)}`
  }
              totalUsageCount: 0,
              resourceDistribution: {},
              detectedAt: new Date(),
              falsePositive: false
            };
            duplicateGroups.push(group);
          }
          
          // Add tags to group
          const primaryTag = tag1.usage_count >= tag2.usage_count ? tag1.tag : tag2.tag;
          const secondaryTag = tag1.usage_count >= tag2.usage_count ? tag2.tag : tag1.tag;
          
          if (group.primaryTag !== primaryTag) {
            if (!group.duplicateTags.includes(primaryTag)) {
              group.duplicateTags.push(primaryTag);
            }
          }
          
          if (!group.duplicateTags.includes(secondaryTag)) {
            group.duplicateTags.push(secondaryTag);
          }
          
          group.similarityScores[`${tag1.tag}:${tag2.tag}`] = maxSimilarity;
          group.resourceDistribution[tag1.tag] = tag1.usage_count;
          group.resourceDistribution[tag2.tag] = tag2.usage_count;
          group.totalUsageCount += tag1.usage_count + tag2.usage_count;
        }
      }
    }

    // Cache results
    if (this.config.performance.cacheResults) {
      this.duplicateCache.set(cacheKey, duplicateGroups);
      
      // Set cache expiry
      setTimeout(() => {
        this.duplicateCache.delete(cacheKey);
      }, 30 * 60 * 1000); // 30 minutes
    }

    this.emit('duplicateDetectionCompleted', {
      resourceType,
      duplicateGroupsFound: duplicateGroups.length,
      algorithmsUsed: algorithms,
      threshold
    });

    return duplicateGroups;
  }

  // =============================================================================
  // Utility and Analysis Methods
  // =============================================================================

  private async validateTagsExist(tags: string[]): Promise<void> {

    const existingTags = await this.dbService.query(
      'SELECT DISTINCT tag FROM resource_tags WHERE tag = ANY($1)',
      [tags]
    );

    const existingTagNames = existingTags.map(row => row.tag);
    const missingTags = tags.filter(tag => !existingTagNames.includes(tag));

    if (missingTags.length > 0) {
      throw new Error(`Tags do not exist: ${missingTags.join(', ')}`);
    }
  }

  private async analyzeMergeImpact(sourceTags: string[], targetTag: string): Promise<TagImpactAnalysis> {

    const analysisId = crypto.randomUUID();
    
    // Get resources affected by source tags
    const resourcesQuery = `
      SELECT resource_type, COUNT(*) as count
      FROM resource_tags
      WHERE tag = ANY($1)
      GROUP BY resource_type
    `;
    
    const resourceResults = await this.dbService.query(resourcesQuery, [sourceTags]);
    const resourceTypeBreakdown: Record<string, number> = {};
    let totalResourcesAffected = 0;
    
    resourceResults.forEach(row => {
      resourceTypeBreakdown[row.resource_type] = row.count;
      totalResourcesAffected += row.count;
    });

    return {
      analysisId,
      analyzedAt: new Date(),
      totalResourcesAffected,
      resourceTypeBreakdown,
      criticalResourcesAffected: 0, // Would need to implement criticality detection
      relatedTagsAffected: [],
      hierarchyChanges: [],
      synonymRelationshipsAffected: 0,
      performanceImpact: {
        estimatedExecutionTime: totalResourcesAffected * 10, // 10ms per resource estimate
        resourceConsumption: {
          cpu: Math.min(totalResourcesAffected * 0.1, 50),
          memory: Math.min(totalResourcesAffected * 0.01, 100),
          storage: 0
  }
        systemLoad: totalResourcesAffected > 1000 ? 'high' : totalResourcesAffected > 100 ? 'medium' : 'low',
        concurrencyConstraints: []
  }
      compatibilityIssues: [],
      rollbackComplexity: 'low',
      businessRuleViolations: [],
      complianceImpact: [],
      userExperienceImpact: 'minimal',
      riskLevel: 'low',
      mitigationStrategies: [],
      recommendedActions: []
    };
  }

  private async analyzeSplitImpact(sourceTag: string, targetTags: string[]): Promise<TagImpactAnalysis> {

    // Similar to analyzeMergeImpact but for split operations
    return this.analyzeMergeImpact([sourceTag], targetTags[0]);
  }

  private async analyzeSplitFeasibility(
    sourceTag: string,
    targetTags: string[],
    criteria: SplitCriteria
  ): Promise<{ feasibilityScore: number; confidenceScore: number; }> {

    // Get resources with the source tag
    const resources = await this.getResourcesWithTags([sourceTag]);
    
    if (resources.length < this.config.splitting.minResourcesForSplit) {
      return { feasibilityScore: 0.1, confidenceScore: 0.1 };
    }

    // Analyze how well resources can be distributed
    const distributionAnalysis = await this.analyzeResourceDistribution(resources, targetTags, criteria);
    
    return {
      feasibilityScore: distributionAnalysis.feasibility,
      confidenceScore: distributionAnalysis.confidence
    };
  }

  private async analyzeResourceDistribution(
    resources: any[],
    targetTags: string[],
    criteria: SplitCriteria
  ): Promise<{ feasibility: number; confidence: number; }> {

    // Simplified analysis - would implement sophisticated algorithms
    const evenDistribution = Math.floor(resources.length / targetTags.length);
    const remainder = resources.length % targetTags.length;
    
    // Basic feasibility based on even distribution possibility
    const feasibility = remainder === 0 ? 1.0 : 0.8;
    const confidence = criteria.criteriaType === 'manual' ? 0.9 : 0.7;
    
    return { feasibility, confidence };
  }

  private calculateMergeConfidence(operation: TagMergeOperation): number {
    let confidence = operation.similarityScore * 0.4;
    
    // Factor in usage patterns
    confidence += Math.min(operation.resourcesAffected / 100, 1) * 0.3;
    
    // Factor in approval requirements
    if (operation.requiresApproval) {
      confidence += 0.2;
    }
    
    // Factor in risk level
    if (operation.impactAnalysis.riskLevel === 'low') {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  private async calculateTagSimilarity(sourceTags: string[], targetTag: string): Promise<number> {

    let maxSimilarity = 0;
    
    for (const sourceTag of sourceTags) {
      const similarities = await this.calculateTagSimilarities(sourceTag, targetTag, ['levenshtein', 'soundex']);
      const similarity = Math.max(...Object.values(similarities));
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }
    
    return maxSimilarity;
  }

  private async calculateTagSimilarities(
    tag1: string,
    tag2: string,
    algorithms: string[]
  ): Promise<Record<string, number>> {
    const similarities: Record<string, number> = {};
    
    // Levenshtein distance
    if (algorithms.includes('levenshtein')) {
      similarities.levenshtein = this.calculateLevenshteinSimilarity(tag1, tag2);
    }
    
    // Soundex comparison
    if (algorithms.includes('soundex')) {
      similarities.soundex = this.calculateSoundexSimilarity(tag1, tag2);
    }
    
    // Semantic similarity (simplified)
    if (algorithms.includes('semantic')) {
      similarities.semantic = this.calculateSemanticSimilarity(tag1, tag2);
    }
    
    // Pattern similarity
    if (algorithms.includes('pattern')) {
      similarities.pattern = this.calculatePatternSimilarity(tag1, tag2);
    }
    
    return similarities;
  }

  private calculateLevenshteinSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : (maxLength - distance) / maxLength;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private calculateSoundexSimilarity(str1: string, str2: string): number {
    const soundex1 = this.soundex(str1);
    const soundex2 = this.soundex(str2);
    return soundex1 === soundex2 ? 1 : 0;
  }

  private soundex(str: string): string {
    const code = str.toUpperCase().charAt(0);
    const mapping = {
      'B': '1', 'F': '1', 'P': '1', 'V': '1',
      'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
      'D': '3', 'T': '3',
      'L': '4',
      'M': '5', 'N': '5',
      'R': '6'
    };
    
    let soundexCode = code;
    for (let i = 1; i < str.length && soundexCode.length < 4; i++) {
      const char = str.toUpperCase().charAt(i);
      if (mapping[char] && soundexCode[soundexCode.length - 1] !== mapping[char]) {
        soundexCode += mapping[char];
      }
    }
    
    return soundexCode.padEnd(4, '0');
  }

  private calculateSemanticSimilarity(tag1: string, tag2: string): number {
    // Simplified semantic similarity based on word overlap
    const words1 = tag1.toLowerCase().split(/[-_\s]+/);
    const words2 = tag2.toLowerCase().split(/[-_\s]+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  private calculatePatternSimilarity(tag1: string, tag2: string): number {
    // Check for common patterns like prefixes, suffixes, etc.
    const commonPrefixes = this.findCommonPrefixes(tag1, tag2);
    const commonSuffixes = this.findCommonSuffixes(tag1, tag2);
    
    const prefixScore = commonPrefixes.length / Math.max(tag1.length, tag2.length);
    const suffixScore = commonSuffixes.length / Math.max(tag1.length, tag2.length);
    
    return Math.max(prefixScore, suffixScore);
  }

  private findCommonPrefixes(str1: string, str2: string): string {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
      i++;
    }
    return str1.substring(0, i);
  }

  private findCommonSuffixes(str1: string, str2: string): string {
    let i = str1.length - 1;
    let j = str2.length - 1;
    while (i >= 0 && j >= 0 && str1[i] === str2[j]) {
      i--;
      j--;
    }
    return str1.substring(i + 1);
  }

  // Additional helper methods would be implemented here...
  private async getResourcesWithTags(tags: string[]): Promise<any[]> {

    const query = `
      SELECT DISTINCT resource_id, resource_type
      FROM resource_tags
      WHERE tag = ANY($1)
    `;
    
    return await this.dbService.query(query, [tags]);
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private async storeTagOperation(operation: TagMergeOperation | TagSplitOperation): Promise<void> {

    // Store operation in database - implementation depends on schema
    await this.dbService.query(
      `INSERT INTO epic17_tag_operations (
        operation_id, operation_type, status, operation_data, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (operation_id) DO UPDATE SET
        status = $3, operation_data = $4, updated_at = NOW()`,
      [
        operation.operationId,
        operation.operationType,
        operation.status,
        JSON.stringify(operation)
      ]
    );
  }

  // Placeholder methods for missing implementations
  private async createApprovalRequest(operation: any): Promise<void> {

    // Implementation would create approval workflow
  }

  private async createOperationBackup(operation: any): Promise<void> {

    // Implementation would create backup of current state
  }

  private async processMergeBatch(operation: TagMergeOperation, batch: any[]): Promise<void> {

    // Implementation would process batch of resources for merge
  }

  private async processSplitBatch(operation: TagSplitOperation, batch: any[]): Promise<void> {

    // Implementation would process batch of resources for split
  }

  private async updateOperationProgress(operation: any): Promise<void> {

    // Implementation would update operation progress
  }

  private async updateTagRelationshipsAfterMerge(operation: TagMergeOperation): Promise<void> {

    // Implementation would update tag relationships after merge
  }

  private async updateTagRelationshipsAfterSplit(operation: TagSplitOperation): Promise<void> {

    // Implementation would update tag relationships after split
  }

  private async handleSourceTagCleanup(operation: TagMergeOperation): Promise<void> {

    // Implementation would handle cleanup of source tags
  }

  private async removeSourceTag(tag: string): Promise<void> {

    // Implementation would remove source tag
  }

  private async generateResourceMapping(operation: TagSplitOperation): Promise<{
    mapping: Record<string, string[]>;
    unmapped: string[];
  }> {
    // Implementation would generate resource to tag mapping
    return { mapping: {}, unmapped: [] };
  }

  /**
   * Get comprehensive metrics for tag merging and splitting operations
   */
  public async getTagManagementMetrics(timeWindowDays: number = 7): Promise<any> {

    // Implementation would return comprehensive metrics
    return {};
  }
}