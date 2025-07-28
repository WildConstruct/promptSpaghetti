/**
 * Automated Categorization Service - Epic 17 API Management System
 * Task: E17-1753114396898-873EBB - Implement automated categorization
 * 
 * Comprehensive automated categorization system that analyzes content, users, API keys,
 * tasks, and other entities to automatically assign appropriate categories, teams, and
 * access levels. Integrates with ML flagging service and assignment tools.
 */

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { MLFlaggingService } from '../ml/MLFlaggingService';
import { Epic17AssignmentToolsService, AssignmentType } from './Epic17AssignmentToolsService';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

// =============================================================================
// Categorization Types and Interfaces
// =============================================================================

export enum CategorizationType {
  CONTENT = 'content',
  USER = 'user',
  API_KEY = 'api_key',
  TASK = 'task',
  PERMISSION = 'permission',
  ROLE = 'role',
  GENERAL = 'general'
}

export enum CategorizationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  MANUAL_REVIEW = 'manual_review'
}

export enum ConfidenceLevel {
  VERY_LOW = 'very_low',   // 0-20%
  LOW = 'low',             // 21-40%
  MEDIUM = 'medium',       // 41-60%
  HIGH = 'high',           // 61-80%
  VERY_HIGH = 'very_high'  // 81-100%
}

}
export interface CategorizationRequest {
  requestId: string;
  itemId: string;
  itemType: CategorizationType;
  itemData: Record<string, unknown>;
  requestedBy: string;
  requestedAt: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  context?: CategorizationContext;
  options?: CategorizationOptions;
}
}

}
export interface CategorizationResult {
  requestId: string;
  itemId: string;
  itemType: CategorizationType;
  status: CategorizationStatus;
  
  // Primary categorization
  primaryCategory: string;
  subcategories: string[];
  confidence: number; // 0-100
  confidenceLevel: ConfidenceLevel;
  
  // Suggested assignments
  suggestedAssignments: AutoAssignment[];
  
  // Risk and compliance
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceFlags: string[];
  securityFlags: string[];
  
  // Processing details
  processingMethod: 'rule_based' | 'ml_based' | 'hybrid';
  rulesApplied: string[];
  mlModelsUsed: string[];
  
  // Results metadata
  processedAt: Date;
  processedBy: string;
  processingTime: number; // milliseconds
  reviewRequired: boolean;
  reviewReason?: string;
  
  // Additional data
  tags: string[];
  metadata: Record<string, unknown>;
  reasoningChain: ReasoningStep[];
}
}

}
export interface CategorizationContext {
  organizationId?: string;
  userId?: string;
  teamId?: string;
  departmentId?: string;
  projectId?: string;
  source: string;
  sourceMetadata?: Record<string, unknown>;
  businessContext?: string;
  technicalContext?: string;
  geographicalContext?: {
    region: string;
    country: string;
    timezone: string;
}
  };
}

}
export interface CategorizationOptions {
  enableMLCategorization?: boolean;
  enableRuleBasedCategorization?: boolean;
  requireHumanReview?: boolean;
  autoAssign?: boolean;
  confidenceThreshold?: number;
  maxProcessingTime?: number; // milliseconds
  customRules?: string[];
  excludeCategories?: string[];
  priorityCategories?: string[];
}
}

}
export interface AutoAssignment {
  assignmentType: 'user' | 'team' | 'role' | 'permission' | 'queue' | 'workflow';
  assignmentTarget: string;
  assignmentReason: string;
  confidence: number;
  conditions?: AssignmentCondition[];
  metadata?: Record<string, unknown>;
}
}

}
export interface AssignmentCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'matches';
  value: any;
  description: string;
}
}

}
export interface ReasoningStep {
  stepId: string;
  stepType: 'rule_evaluation' | 'ml_inference' | 'data_analysis' | 'validation';
  description: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  confidence: number;
  processingTime: number;
  metadata?: Record<string, unknown>;
}
}

}
export interface CategorizationRule {
  ruleId: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  
  // Rule triggers
  itemType: CategorizationType;
  triggers: RuleTrigger[];
  
  // Rule conditions
  conditions: RuleCondition[];
  
  // Rule actions
  actions: RuleAction[];
  
  // Rule configuration
  confidenceBoost: number; // -50 to +50
  requiresReview: boolean;
  tags: string[];
  
  // Rule metadata
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  usage: {
    timesTriggered: number;
    lastTriggered?: Date;
    successRate: number;
    averageConfidence: number;
}
  };
}

}
export interface RuleTrigger {
  field: string;
  operator: string;
  value: any;
  weight: number; // 0-100
}
}

}
export interface RuleCondition {
  field: string;
  operator: string;
  value: any;
  logicalOperator?: 'AND' | 'OR';
  negate?: boolean;
}
}

}
export interface RuleAction {
  actionType: 'categorize' | 'assign' | 'flag' | 'escalate' | 'notify';
  parameters: Record<string, unknown>;
  conditions?: Record<string, unknown>;
}
}

}
export interface CategoryDefinition {
  categoryId: string;
  name: string;
  description: string;
  type: CategorizationType;
  
  // Category hierarchy
  parentCategory?: string;
  subcategories: string[];
  level: number;
  
  // Category properties
  defaultRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  defaultAssignments: AutoAssignment[];
  requiredPermissions: string[];
  complianceRequirements: string[];
  
  // Category configuration
  autoAssignmentEnabled: boolean;
  confidenceThreshold: number;
  reviewRequired: boolean;
  
  // Category metadata
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  usage: {
    itemsCategories: number;
    lastUsed?: Date;
    averageConfidence: number;
}
  };
  
  // ML Training
  trainingExamples: Array<{
    itemData: Record<string, unknown>;
    confidence: number;
    verified: boolean;
  }>;
}

}
export interface CategorizationStats {
  totalRequests: number;
  processedRequests: number;
  pendingRequests: number;
  failedRequests: number;
  
  // Performance metrics
  averageProcessingTime: number;
  averageConfidence: number;
  
  // Method breakdown
  ruleBasedCount: number;
  mlBasedCount: number;
  hybridCount: number;
  
  // Category breakdown
  categoryStats: Array<{
    category: string;
    count: number;
    averageConfidence: number;
}
  }>;
  
  // Success metrics
  successRate: number;
  reviewRate: number;
  autoAssignmentRate: number;
}

// =============================================================================
// Automated Categorization Service Implementation
// =============================================================================

export class AutomatedCategorizationService extends EventEmitter {
  private activeRequests: Map<string, CategorizationRequest> = new Map();
  private categorizationRules: Map<string, CategorizationRule> = new Map();
  private categoryDefinitions: Map<string, CategoryDefinition> = new Map();
  private processingQueue: CategorizationRequest[] = [];
  private isProcessing: boolean = false;

  constructor(
    private database: DatabaseService,
    private redis: RedisService,
    private auditService: AuditService,
    private mlFlaggingService: MLFlaggingService,
    private assignmentToolsService: Epic17AssignmentToolsService
  ) {
    super();
    this.initialize();
  }

  // =============================================================================
  // Core Categorization Operations
  // =============================================================================

  /**
   * Submit item for automated categorization
   */
  async categorizeItem(
    itemId: string,
    itemType: CategorizationType,
    itemData: Record<string, unknown>,
    requestedBy: string,
    options: {
      priority?: 'low' | 'medium' | 'high' | 'critical';
      context?: CategorizationContext;
      categorizationOptions?: CategorizationOptions;
    } = {}
  ): Promise<string> {

    try {
      const requestId = crypto.randomUUID();
      
      const request: CategorizationRequest = {
        requestId,
        itemId,
        itemType,
        itemData,
        requestedBy,
        requestedAt: new Date(),
        priority: options.priority || 'medium',
        context: options.context,
        options: options.categorizationOptions
      };

      // Store request
      await this.storeCategorizationRequest(request);
      this.activeRequests.set(requestId, request);

      // Add to processing queue
      this.addToProcessingQueue(request);

      await this.auditService.logAction({
        userId: requestedBy,
        action: 'categorization_requested',
        resource: `${itemType}:${itemId}`,
        details: {
          requestId,
          itemType,
          priority: request.priority
        }
      });

      this.emit('categorization_requested', request);

      return requestId;

    } catch (error) {
      console.error('Error submitting categorization request:', error);
      throw error;
    }
  }

  /**
   * Process categorization request
   */
  private async processCategorizationRequest(request: CategorizationRequest): Promise<CategorizationResult> {

    const startTime = Date.now();
    const reasoningChain: ReasoningStep[] = [];

    try {
      // Initialize result
      const result: CategorizationResult = {
        requestId: request.requestId,
        itemId: request.itemId,
        itemType: request.itemType,
        status: CategorizationStatus.PROCESSING,
        primaryCategory: '',
        subcategories: [],
        confidence: 0,
        confidenceLevel: ConfidenceLevel.VERY_LOW,
        suggestedAssignments: [],
        riskLevel: 'medium',
        complianceFlags: [],
        securityFlags: [],
        processingMethod: 'hybrid',
        rulesApplied: [],
        mlModelsUsed: [],
        processedAt: new Date(),
        processedBy: 'system',
        processingTime: 0,
        reviewRequired: false,
        tags: [],
        metadata: {},
        reasoningChain: []
      };

      // Step 1: Rule-based categorization
      if (request.options?.enableRuleBasedCategorization !== false) {
        const ruleResults = await this.performRuleBasedCategorization(request, reasoningChain);
        this.mergeCategorizationResults(result, ruleResults);
      }

      // Step 2: ML-based categorization (if enabled and confidence is still low)
      if (request.options?.enableMLCategorization !== false && result.confidence < 70) {
        const mlResults = await this.performMLBasedCategorization(request, reasoningChain);
        this.mergeCategorizationResults(result, mlResults);
      }

      // Step 3: Content-specific processing using MLFlaggingService
      if (request.itemType === CategorizationType.CONTENT) {
        const contentResults = await this.processContentCategorization(request, reasoningChain);
        this.mergeCategorizationResults(result, contentResults);
      }

      // Step 4: User-specific processing
      if (request.itemType === CategorizationType.USER) {
        const userResults = await this.processUserCategorization(request, reasoningChain);
        this.mergeCategorizationResults(result, userResults);
      }

      // Step 5: API Key-specific processing
      if (request.itemType === CategorizationType.API_KEY) {
        const keyResults = await this.processAPIKeyCategorization(request, reasoningChain);
        this.mergeCategorizationResults(result, keyResults);
      }

      // Step 6: Task-specific processing
      if (request.itemType === CategorizationType.TASK) {
        const taskResults = await this.processTaskCategorization(request, reasoningChain);
        this.mergeCategorizationResults(result, taskResults);
      }

      // Step 7: Determine confidence level
      result.confidenceLevel = this.getConfidenceLevel(result.confidence);

      // Step 8: Check if review is required
      result.reviewRequired = this.shouldRequireReview(result, request);
      if (result.reviewRequired) {
        result.status = CategorizationStatus.MANUAL_REVIEW;
      }

      // Step 9: Generate auto-assignments if enabled
      if (request.options?.autoAssign !== false && result.confidence >= 60) {
        result.suggestedAssignments = await this.generateAutoAssignments(result, request);
      }

      // Step 10: Assess risk and compliance
      result.riskLevel = this.assessRiskLevel(result, request);
      result.complianceFlags = await this.assessComplianceFlags(result, request);
      result.securityFlags = await this.assessSecurityFlags(result, request);

      // Finalize result
      result.processingTime = Date.now() - startTime;
      result.reasoningChain = reasoningChain;
      result.status = result.status === CategorizationStatus.PROCESSING 
        ? CategorizationStatus.COMPLETED 
        : result.status;

      // Store result
      await this.storeCategorizationResult(result);

      // Execute auto-assignments if confidence is high enough
      if (request.options?.autoAssign !== false && result.confidence >= 80 && !result.reviewRequired) {
        await this.executeAutoAssignments(result.suggestedAssignments, request);
      }

      await this.auditService.logAction({
        userId: request.requestedBy,
        action: 'categorization_completed',
        resource: `${request.itemType}:${request.itemId}`,
        details: {
          requestId: request.requestId,
          primaryCategory: result.primaryCategory,
          confidence: result.confidence,
          processingTime: result.processingTime,
          reviewRequired: result.reviewRequired
        }
      });

      this.emit('categorization_completed', result);

      return result;

    } catch (error) {
      console.error('Error processing categorization request:', error);
      
      const errorResult: CategorizationResult = {
        requestId: request.requestId,
        itemId: request.itemId,
        itemType: request.itemType,
        status: CategorizationStatus.FAILED,
        primaryCategory: 'uncategorized',
        subcategories: [],
        confidence: 0,
        confidenceLevel: ConfidenceLevel.VERY_LOW,
        suggestedAssignments: [],
        riskLevel: 'high',
        complianceFlags: ['processing_error'],
        securityFlags: [],
        processingMethod: 'hybrid',
        rulesApplied: [],
        mlModelsUsed: [],
        processedAt: new Date(),
        processedBy: 'system',
        processingTime: Date.now() - startTime,
        reviewRequired: true,
        reviewReason: error instanceof Error ? error.message : 'Unknown error',
        tags: ['error'],
        metadata: { error: error instanceof Error ? error.message : String(error) },
        reasoningChain
      };

      await this.storeCategorizationResult(errorResult);
      this.emit('categorization_failed', { request, error, result: errorResult });

      return errorResult;
    }
  }

  // =============================================================================
  // Categorization Methods
  // =============================================================================

  /**
   * Perform rule-based categorization
   */
  private async performRuleBasedCategorization(
    request: CategorizationRequest,
    reasoningChain: ReasoningStep[]
  ): Promise<Partial<CategorizationResult>> {
    const stepStart = Date.now();
    const applicableRules = this.getApplicableRules(request.itemType);
    const rulesApplied: string[] = [];
    const categories: Array<{ category: string; confidence: number; source: string }> = [];

    for (const rule of applicableRules) {
      const ruleResult = await this.evaluateRule(rule, request);
      if (ruleResult.matches) {
        rulesApplied.push(rule.ruleId);
        
        // Extract categorization actions
        for (const action of rule.actions) {
          if (action.actionType === 'categorize') {
            categories.push({
              category: action.parameters.category,
              confidence: (action.parameters.confidence || 80) + rule.confidenceBoost,
              source: `rule:${rule.ruleId}`
            });
          }
        }

        // Update rule usage
        rule.usage.timesTriggered++;
        rule.usage.lastTriggered = new Date();
      }
    }

    // Calculate primary category and overall confidence
    const primaryCategoryResult = this.selectPrimaryCategory(categories);
    
    reasoningChain.push({
      stepId: crypto.randomUUID(),
      stepType: 'rule_evaluation',
      description: 'Rule-based categorization analysis',
      input: { itemType: request.itemType, rulesCount: applicableRules.length },
      output: { 
        rulesApplied: rulesApplied.length,
        categoriesFound: categories.length,
        primaryCategory: primaryCategoryResult?.category
  }
      confidence: primaryCategoryResult?.confidence || 0,
      processingTime: Date.now() - stepStart
    });

    return {
      primaryCategory: primaryCategoryResult?.category || '',
      confidence: primaryCategoryResult?.confidence || 0,
      rulesApplied,
      processingMethod: 'rule_based'
    };
  }

  /**
   * Perform ML-based categorization
   */
  private async performMLBasedCategorization(
    request: CategorizationRequest,
    reasoningChain: ReasoningStep[]
  ): Promise<Partial<CategorizationResult>> {
    const stepStart = Date.now();
    
    // Use ML models for categorization based on item type
    const mlResults = await this.invokeMLCategorization(request);
    
    reasoningChain.push({
      stepId: crypto.randomUUID(),
      stepType: 'ml_inference',
      description: 'Machine learning categorization analysis',
      input: { itemType: request.itemType, dataSize: JSON.stringify(request.itemData).length },
      output: mlResults,
      confidence: mlResults.confidence || 0,
      processingTime: Date.now() - stepStart
    });

    return {
      primaryCategory: mlResults.primaryCategory,
      subcategories: mlResults.subcategories,
      confidence: mlResults.confidence,
      mlModelsUsed: mlResults.modelsUsed,
      processingMethod: 'ml_based'
    };
  }

  /**
   * Process content categorization using MLFlaggingService
   */
  private async processContentCategorization(
    request: CategorizationRequest,
    reasoningChain: ReasoningStep[]
  ): Promise<Partial<CategorizationResult>> {
    const stepStart = Date.now();

    try {
      // Use ML flagging service to analyze content
      const flaggingResult = await this.mlFlaggingService.analyzeContent(
        request.itemData.content || JSON.stringify(request.itemData),
        {
          contentType: request.itemData.contentType || 'text',
          source: request.context?.source || 'unknown',
          userId: request.context?.userId
        }
      );

      const categories: string[] = [];
      const securityFlags: string[] = [];
      let confidence = 50;
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';

      // Map flagging results to categories
      if (flaggingResult.flags.length > 0) {
        for (const flag of flaggingResult.flags) {
          switch (flag.type) {
          case 'content_moderation':
            categories.push('content_moderation');
            riskLevel = 'high';
            break;
          case 'security_threat':
            categories.push('security_threat');
            securityFlags.push('threat_detected');
            riskLevel = 'critical';
            break;
          case 'compliance_violation':
            categories.push('compliance_violation');
            riskLevel = 'high';
            break;
          case 'prompt_injection':
            categories.push('prompt_injection');
            securityFlags.push('injection_detected');
            riskLevel = 'critical';
            break;
          case 'data_leak':
            categories.push('data_leak');
            securityFlags.push('data_leak_detected');
            riskLevel = 'critical';
            break;
          }
        }
        confidence = Math.max(80, flaggingResult.confidence * 100);
      } else {
        categories.push('safe_content');
        riskLevel = 'low';
        confidence = flaggingResult.confidence * 100;
      }

      reasoningChain.push({
        stepId: crypto.randomUUID(),
        stepType: 'ml_inference',
        description: 'Content analysis using ML flagging service',
        input: { contentLength: request.itemData.content?.length || 0 },
        output: {
          flagsFound: flaggingResult.flags.length,
          categories,
          riskLevel,
          confidence
  }
        confidence,
        processingTime: Date.now() - stepStart
      });

      return {
        primaryCategory: categories[0] || 'uncategorized',
        subcategories: categories.slice(1),
        confidence,
        riskLevel,
        securityFlags
      };

    } catch (error) {
      console.error('Error in content categorization:', error);
      return {
        primaryCategory: 'uncategorized',
        confidence: 0,
        riskLevel: 'high',
        securityFlags: ['processing_error']
      };
    }
  }

  /**
   * Process user categorization
   */
  private async processUserCategorization(
    request: CategorizationRequest,
    reasoningChain: ReasoningStep[]
  ): Promise<Partial<CategorizationResult>> {
    const stepStart = Date.now();
    const userData = request.itemData;
    
    const categories: string[] = [];
    const suggestedAssignments: AutoAssignment[] = [];
    const confidence = 70;

    // Categorize by role
    if (userData.role) {
      categories.push(`role_${userData.role.toLowerCase()}`);
      
      // Suggest team assignments based on role
      const roleAssignments = this.getRoleBasedAssignments(userData.role);
      suggestedAssignments.push(...roleAssignments);
    }

    // Categorize by department
    if (userData.department) {
      categories.push(`dept_${userData.department.toLowerCase()}`);
    }

    // Categorize by experience level
    if (userData.experienceLevel) {
      categories.push(`exp_${userData.experienceLevel.toLowerCase()}`);
    }

    // Categorize by location
    if (userData.location || request.context?.geographicalContext) {
      const location = userData.location || request.context?.geographicalContext?.country;
      if (location) {
        categories.push(`location_${location.toLowerCase().replace(/\s+/g, '_')}`);
      }
    }

    reasoningChain.push({
      stepId: crypto.randomUUID(),
      stepType: 'data_analysis',
      description: 'User profile categorization analysis',
      input: { userAttributes: Object.keys(userData) },
      output: { categories, assignments: suggestedAssignments.length },
      confidence,
      processingTime: Date.now() - stepStart
    });

    return {
      primaryCategory: categories[0] || 'user_general',
      subcategories: categories.slice(1),
      confidence,
      suggestedAssignments
    };
  }

  /**
   * Process API key categorization
   */
  private async processAPIKeyCategorization(
    request: CategorizationRequest,
    reasoningChain: ReasoningStep[]
  ): Promise<Partial<CategorizationResult>> {
    const stepStart = Date.now();
    const keyData = request.itemData;
    
    const categories: string[] = [];
    const suggestedAssignments: AutoAssignment[] = [];
    const confidence = 75;
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';

    // Categorize by intended use
    if (keyData.purpose || keyData.description) {
      const purpose = (keyData.purpose || keyData.description).toLowerCase();
      
      if (purpose.includes('dev') || purpose.includes('test')) {
        categories.push('development');
        riskLevel = 'low';
      } else if (purpose.includes('prod') || purpose.includes('production')) {
        categories.push('production');
        riskLevel = 'high';
      } else if (purpose.includes('admin') || purpose.includes('super')) {
        categories.push('administrative');
        riskLevel = 'critical';
      } else {
        categories.push('general');
      }
    }

    // Categorize by permissions/scopes
    if (keyData.scopes || keyData.permissions) {
      const scopes = keyData.scopes || keyData.permissions;
      
      if (scopes.includes('admin') || scopes.includes('write')) {
        categories.push('elevated_access');
        riskLevel = 'high';
      } else if (scopes.includes('read')) {
        categories.push('read_only');
        riskLevel = 'low';
      }
    }

    // Suggest access tier based on categorization
    if (categories.includes('administrative')) {
      suggestedAssignments.push({
        assignmentType: 'role',
        assignmentTarget: 'api_admin',
        assignmentReason: 'Administrative API key requires admin role',
        confidence: 85
      });
    } else if (categories.includes('production')) {
      suggestedAssignments.push({
        assignmentType: 'permission',
        assignmentTarget: 'prod_api_access',
        assignmentReason: 'Production API key requires production permissions',
        confidence: 80
      });
    }

    reasoningChain.push({
      stepId: crypto.randomUUID(),
      stepType: 'data_analysis',
      description: 'API key categorization analysis',
      input: { keyAttributes: Object.keys(keyData) },
      output: { categories, riskLevel, assignments: suggestedAssignments.length },
      confidence,
      processingTime: Date.now() - stepStart
    });

    return {
      primaryCategory: categories[0] || 'api_key_general',
      subcategories: categories.slice(1),
      confidence,
      riskLevel,
      suggestedAssignments
    };
  }

  /**
   * Process task categorization
   */
  private async processTaskCategorization(
    request: CategorizationRequest,
    reasoningChain: ReasoningStep[]
  ): Promise<Partial<CategorizationResult>> {
    const stepStart = Date.now();
    const taskData = request.itemData;
    
    const categories: string[] = [];
    const suggestedAssignments: AutoAssignment[] = [];
    const confidence = 80;

    // Categorize by task type or title
    if (taskData.title || taskData.type) {
      const text = (taskData.title || taskData.type).toLowerCase();
      
      // Technical categories
      if (text.includes('bug') || text.includes('fix')) {
        categories.push('bug_fix');
        suggestedAssignments.push({
          assignmentType: 'team',
          assignmentTarget: 'engineering_team',
          assignmentReason: 'Bug fix requires engineering team',
          confidence: 85
        });
      } else if (text.includes('feature') || text.includes('implement')) {
        categories.push('feature_development');
        suggestedAssignments.push({
          assignmentType: 'team',
          assignmentTarget: 'development_team',
          assignmentReason: 'Feature development requires development team',
          confidence: 80
        });
      } else if (text.includes('test') || text.includes('qa')) {
        categories.push('testing');
        suggestedAssignments.push({
          assignmentType: 'team',
          assignmentTarget: 'qa_team',
          assignmentReason: 'Testing task requires QA team',
          confidence: 90
        });
      } else if (text.includes('doc') || text.includes('documentation')) {
        categories.push('documentation');
        suggestedAssignments.push({
          assignmentType: 'team',
          assignmentTarget: 'technical_writing_team',
          assignmentReason: 'Documentation task requires technical writing team',
          confidence: 85
        });
      } else if (text.includes('security') || text.includes('vulnerability')) {
        categories.push('security');
        suggestedAssignments.push({
          assignmentType: 'team',
          assignmentTarget: 'security_team',
          assignmentReason: 'Security task requires security team',
          confidence: 95
        });
      }
    }

    // Categorize by priority
    if (taskData.priority) {
      const priority = taskData.priority.toLowerCase();
      if (priority === 'critical' || priority === 'urgent') {
        categories.push('high_priority');
      } else if (priority === 'low') {
        categories.push('low_priority');
      }
    }

    // Categorize by epic or story
    if (taskData.epic) {
      categories.push(`epic_${taskData.epic.toLowerCase().replace(/\s+/g, '_')}`);
    }

    reasoningChain.push({
      stepId: crypto.randomUUID(),
      stepType: 'data_analysis',
      description: 'Task categorization analysis',
      input: { taskAttributes: Object.keys(taskData) },
      output: { categories, assignments: suggestedAssignments.length },
      confidence,
      processingTime: Date.now() - stepStart
    });

    return {
      primaryCategory: categories[0] || 'task_general',
      subcategories: categories.slice(1),
      confidence,
      suggestedAssignments
    };
  }

  // =============================================================================
  // Helper Methods
  // =============================================================================

  private async initialize(): Promise<void> {

    try {
      await this.loadCategorizationRules();
      await this.loadCategoryDefinitions();
      this.startProcessingLoop();
      console.log('✅ Automated Categorization Service initialized');
    } catch (error) {
      console.error('Error initializing categorization service:', error);
      throw error;
    }
  }

  private addToProcessingQueue(request: CategorizationRequest): void {
    // Insert request in priority order
    const insertIndex = this.processingQueue.findIndex(r => 
      this.getPriorityValue(r.priority) < this.getPriorityValue(request.priority)
    );
    
    if (insertIndex === -1) {
      this.processingQueue.push(request);
    } else {
      this.processingQueue.splice(insertIndex, 0, request);
    }
    
    this.processNextRequest();
  }

  private async processNextRequest(): Promise<void> {

    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const request = this.processingQueue.shift()!;

    try {
      await this.processCategorizationRequest(request);
    } catch (error) {
      console.error('Error processing categorization request:', error);
    } finally {
      this.isProcessing = false;
      setImmediate(() => this.processNextRequest());
    }
  }

  private getPriorityValue(priority: string): number {
    const values = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
    return values[priority as keyof typeof values] || 2;
  }

  private getApplicableRules(itemType: CategorizationType): CategorizationRule[] {
    return Array.from(this.categorizationRules.values())
      .filter(rule => rule.enabled && rule.itemType === itemType)
      .sort((a, b) => b.priority - a.priority);
  }

  private async evaluateRule(
    rule: CategorizationRule,
    request: CategorizationRequest
  ): Promise<{ matches: boolean; confidence: number }> {

    // Simplified rule evaluation - would implement comprehensive logic
    const triggerMatches = rule.triggers.length === 0 || rule.triggers.some(trigger => {
      const fieldValue = request.itemData[trigger.field];
      return this.evaluateCondition(fieldValue, trigger.operator, trigger.value);
    });

    const conditionMatches = rule.conditions.length === 0 || rule.conditions.every(condition => {
      const fieldValue = request.itemData[condition.field];
      const matches = this.evaluateCondition(fieldValue, condition.operator, condition.value);
      return condition.negate ? !matches : matches;
    });

    return {
      matches: triggerMatches && conditionMatches,
      confidence: triggerMatches && conditionMatches ? 80 + rule.confidenceBoost : 0
    };
  }

  private evaluateCondition(fieldValue: any, operator: string, conditionValue: any): boolean {
    switch (operator) {
    case 'eq': return fieldValue === conditionValue;
    case 'ne': return fieldValue !== conditionValue;
    case 'gt': return fieldValue > conditionValue;
    case 'gte': return fieldValue >= conditionValue;
    case 'lt': return fieldValue < conditionValue;
    case 'lte': return fieldValue <= conditionValue;
    case 'in': return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
    case 'contains': return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());
    case 'matches': return new RegExp(conditionValue, 'i').test(String(fieldValue));
    default: return false;
    }
  }

  private selectPrimaryCategory(categories: Array<{ category: string; confidence: number; source: string }>): { category: string; confidence: number } | null {
    if (categories.length === 0) return null;
    
    // Sort by confidence and select highest
    categories.sort((a, b) => b.confidence - a.confidence);
    return { category: categories[0].category, confidence: categories[0].confidence };
  }

  private mergeCategorizationResults(target: CategorizationResult, source: Partial<CategorizationResult>): void {
    if (source.primaryCategory && source.confidence && source.confidence > target.confidence) {
      target.primaryCategory = source.primaryCategory;
      target.confidence = source.confidence;
    }
    
    if (source.subcategories) {
      target.subcategories.push(...source.subcategories);
    }
    
    if (source.suggestedAssignments) {
      target.suggestedAssignments.push(...source.suggestedAssignments);
    }
    
    if (source.rulesApplied) {
      target.rulesApplied.push(...source.rulesApplied);
    }
    
    if (source.mlModelsUsed) {
      target.mlModelsUsed.push(...source.mlModelsUsed);
    }

    if (source.securityFlags) {
      target.securityFlags.push(...source.securityFlags);
    }

    if (source.riskLevel && this.getRiskLevelValue(source.riskLevel) > this.getRiskLevelValue(target.riskLevel)) {
      target.riskLevel = source.riskLevel;
    }
  }

  private getRiskLevelValue(riskLevel: string): number {
    const values = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
    return values[riskLevel as keyof typeof values] || 2;
  }

  private getConfidenceLevel(confidence: number): ConfidenceLevel {
    if (confidence <= 20) return ConfidenceLevel.VERY_LOW;
    if (confidence <= 40) return ConfidenceLevel.LOW;
    if (confidence <= 60) return ConfidenceLevel.MEDIUM;
    if (confidence <= 80) return ConfidenceLevel.HIGH;
    return ConfidenceLevel.VERY_HIGH;
  }

  private shouldRequireReview(result: CategorizationResult, request: CategorizationRequest): boolean {
    return request.options?.requireHumanReview === true ||
           result.confidence < (request.options?.confidenceThreshold || 70) ||
           result.riskLevel === 'critical' ||
           result.securityFlags.length > 0;
  }

  private async generateAutoAssignments(
    result: CategorizationResult,
    request: CategorizationRequest
  ): Promise<AutoAssignment[]> {

    const assignments: AutoAssignment[] = [];
    
    // Add category-based assignments
    const categoryDef = this.categoryDefinitions.get(result.primaryCategory);
    if (categoryDef?.defaultAssignments) {
      assignments.push(...categoryDef.defaultAssignments);
    }
    
    return assignments;
  }

  private assessRiskLevel(
    result: CategorizationResult,
    request: CategorizationRequest
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (result.securityFlags.length > 0) return 'critical';
    if (result.confidence < 50) return 'high';
    if (request.itemType === CategorizationType.API_KEY) return 'medium';
    return result.riskLevel || 'medium';
  }

  private async assessComplianceFlags(result: CategorizationResult, request: CategorizationRequest): Promise<string[]> {

    const flags: string[] = [];
    
    if (request.itemType === CategorizationType.CONTENT && result.primaryCategory === 'content_moderation') {
      flags.push('content_review_required');
    }
    
    if (result.riskLevel === 'critical') {
      flags.push('high_risk_item');
    }
    
    return flags;
  }

  private async assessSecurityFlags(result: CategorizationResult, request: CategorizationRequest): Promise<string[]> {

    return result.securityFlags || [];
  }

  private async executeAutoAssignments(assignments: AutoAssignment[], request: CategorizationRequest): Promise<void> {

    for (const assignment of assignments) {
      try {
        if (assignment.assignmentType === 'team' || assignment.assignmentType === 'user') {
          // Use assignment tools service for actual assignments
          await this.assignmentToolsService.createAssignment(
            AssignmentType.TEAM_ASSIGNMENT,
            assignment.assignmentTarget,
            'team',
            request.itemId,
            request.itemType,
            'system',
            {
              reason: assignment.assignmentReason
            }
          );
        }
      } catch (error) {
        console.error('Error executing auto-assignment:', error);
      }
    }
  }

  private getRoleBasedAssignments(role: string): AutoAssignment[] {
    const roleAssignments: Record<string, AutoAssignment[]> = {
      'developer': [{
        assignmentType: 'team',
        assignmentTarget: 'development_team',
        assignmentReason: 'Developer role automatically assigned to development team',
        confidence: 90
      }],
      'admin': [{
        assignmentType: 'team',
        assignmentTarget: 'admin_team',
        assignmentReason: 'Admin role automatically assigned to admin team',
        confidence: 95
      }],
      'manager': [{
        assignmentType: 'team',
        assignmentTarget: 'management_team',
        assignmentReason: 'Manager role automatically assigned to management team',
        confidence: 85
      }]
    };
    
    return roleAssignments[role.toLowerCase()] || [];
  }

  private async invokeMLCategorization(request: CategorizationRequest): Promise<any> {

    // Placeholder for ML model invocation
    // Would integrate with actual ML models based on item type
    return {
      primaryCategory: 'ml_category',
      subcategories: [],
      confidence: 60,
      modelsUsed: ['general_classifier']
    };
  }

  private startProcessingLoop(): void {
    setInterval(() => {
      this.processNextRequest();
    }, 1000); // Process every second
  }

  // Database operations (placeholders)
  private async loadCategorizationRules(): Promise<void> { }
  private async loadCategoryDefinitions(): Promise<void> { }
  private async storeCategorizationRequest(request: CategorizationRequest): Promise<void> { }
  private async storeCategorizationResult(result: CategorizationResult): Promise<void> { }

  // Public API methods
  async getCategorizationResult(requestId: string): Promise<CategorizationResult | null> {

    // Implementation would fetch from database
    return null;
  }

  async getCategorizationStats(): Promise<CategorizationStats> {

    // Implementation would calculate stats from database
    return {
      totalRequests: 0,
      processedRequests: 0,
      pendingRequests: 0,
      failedRequests: 0,
      averageProcessingTime: 0,
      averageConfidence: 0,
      ruleBasedCount: 0,
      mlBasedCount: 0,
      hybridCount: 0,
      categoryStats: [],
      successRate: 0,
      reviewRate: 0,
      autoAssignmentRate: 0
    };
  }
}

export default AutomatedCategorizationService;