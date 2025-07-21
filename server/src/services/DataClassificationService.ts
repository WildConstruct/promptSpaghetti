// Data Classification Service
// Comprehensive data classification and transfer control system
// Epic 19-2: Data governance and transfer controls with classification-based policies

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import * as crypto from 'crypto';

export interface DataClassificationConfig {
  enabled: boolean;
  defaultClassification: DataClassification;
  inheritanceEnabled: boolean;
  autoClassificationEnabled: boolean;
  classificationRules: ClassificationRule[];
  transferPolicies: TransferPolicy[];
  auditAllTransfers: boolean;
  encryptionRequired: {
    confidential: boolean;
    restricted: boolean;
    internal: boolean;
    public: boolean;
  };
  approvalRequired: {
    confidential: boolean;
    restricted: boolean;
    internal: boolean;
    public: boolean;
  };
}

export type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted';
export type TransferDestination = DataClassification | 'external';

export interface ClassificationRule {
  id: string;
  name: string;
  description: string;
  priority: number;
  conditions: ClassificationCondition[];
  classification: DataClassification;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassificationCondition {
  field: string; // 'content', 'metadata', 'filename', 'size', 'source'
  operator: 'contains' | 'matches' | 'equals' | 'gt' | 'lt' | 'in' | 'pattern';
  value: string | number | string[];
  caseSensitive?: boolean;
}

export interface TransferPolicy {
  id: string;
  name: string;
  description: string;
  sourceClassification: DataClassification;
  targetClassification: TransferDestination;
  transferType: TransferType;
  action: PolicyAction;
  conditions: TransferCondition[];
  approvalRequired: boolean;
  encryptionRequired: boolean;
  auditLevel: AuditLevel;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TransferType = 'api_export' | 'file_download' | 'data_sync' | 'backup' | 'migration' | 'sharing';
export type PolicyAction = 'allow' | 'deny' | 'require_approval' | 'encrypt_only';
export type AuditLevel = 'none' | 'basic' | 'detailed' | 'full';

export interface TransferCondition {
  type: 'user_role' | 'time_window' | 'location' | 'approval_status' | 'encryption_status';
  operator: 'equals' | 'in' | 'between' | 'not_in';
  value: string | string[] | { start: string; end: string };
}

export interface DataTransferRequest {
  id: string;
  dataId: string;
  dataType: string;
  sourceClassification: DataClassification;
  targetClassification: TransferDestination;
  transferType: TransferType;
  userId: string;
  userRoles: string[];
  destination: string;
  metadata: Record<string, any>;
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  encryptionRequired: boolean;
  auditRequired: boolean;
}

export interface TransferDecision {
  requestId: string;
  action: PolicyAction;
  policyId: string;
  policyName: string;
  reasoning: string[];
  requiresApproval: boolean;
  requiresEncryption: boolean;
  auditLevel: AuditLevel;
  conditions: string[];
  decidedAt: Date;
}

export interface ClassificationResult {
  dataId: string;
  classification: DataClassification;
  confidence: number;
  ruleId: string;
  ruleName: string;
  reasoning: string[];
  metadata: Record<string, any>;
  classifiedAt: Date;
}

export interface TransferAuditEvent {
  id: string;
  requestId: string;
  dataId: string;
  dataClassification: DataClassification;
  transferType: TransferType;
  userId: string;
  action: PolicyAction;
  policyId: string;
  decision: 'allowed' | 'denied' | 'pending_approval';
  encryptionUsed: boolean;
  auditLevel: AuditLevel;
  metadata: Record<string, any>;
  timestamp: Date;
}

export const defaultDataClassificationConfig: DataClassificationConfig = {
  enabled: true,
  defaultClassification: 'internal',
  inheritanceEnabled: true,
  autoClassificationEnabled: true,
  classificationRules: [],
  transferPolicies: [],
  auditAllTransfers: true,
  encryptionRequired: {
    confidential: true,
    restricted: true,
    internal: false,
    public: false
  },
  approvalRequired: {
    confidential: true,
    restricted: true,
    internal: false,
    public: false
  }
};

export class DataClassificationService {
  private db: DatabaseService;
  private redis: RedisService;
  private auditService: AuditService;
  private config: DataClassificationConfig;

  constructor(
    db: DatabaseService,
    redis: RedisService,
    auditService: AuditService,
    config: DataClassificationConfig = defaultDataClassificationConfig
  ) {
    this.db = db;
    this.redis = redis;
    this.auditService = auditService;
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      // Create database tables if they don't exist
      await this.createTables();
      
      // Load classification rules from database
      await this.loadClassificationRules();
      
      // Load transfer policies from database
      await this.loadTransferPolicies();
      
      console.log('Data classification service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize data classification service:', error);
      throw error;
    }
  }

  async classifyData(
    dataId: string,
    content: string,
    metadata: Record<string, any> = {},
    filename?: string
  ): Promise<ClassificationResult> {
    try {
      // Check cache first
      const cacheKey = `classification:${dataId}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Convert date strings back to Date objects
        parsed.classifiedAt = new Date(parsed.classifiedAt);
        return parsed;
      }

      // Apply classification rules in priority order
      const rules = this.config.classificationRules
        .filter(rule => rule.enabled)
        .sort((a, b) => b.priority - a.priority);

      let classification = this.config.defaultClassification;
      let confidence = 0.5;
      let appliedRule: ClassificationRule | null = null;
      const reasoning: string[] = [];

      for (const rule of rules) {
        const ruleResult = await this.evaluateClassificationRule(rule, {
          content,
          metadata,
          filename: filename || '',
          size: content.length
        });

        if (ruleResult.matches) {
          classification = rule.classification;
          confidence = ruleResult.confidence;
          appliedRule = rule;
          reasoning.push(...ruleResult.reasoning);
          break; // Use first matching rule (highest priority)
        }
      }

      if (!appliedRule) {
        reasoning.push(`No matching rules found, using default classification: ${classification}`);
      }

      const result: ClassificationResult = {
        dataId,
        classification,
        confidence,
        ruleId: appliedRule?.id || 'default',
        ruleName: appliedRule?.name || 'Default Classification',
        reasoning,
        metadata,
        classifiedAt: new Date()
      };

      // Store classification in database
      await this.storeClassification(result);

      // Cache for 1 hour
      await this.redis.setex(cacheKey, 3600, JSON.stringify(result));

      // Audit classification
      await this.auditClassification(result);

      return result;
    } catch (error) {
      console.error('Error classifying data:', error);
      throw new Error('Failed to classify data');
    }
  }

  async evaluateTransferRequest(request: DataTransferRequest): Promise<TransferDecision> {
    try {
      // Find applicable transfer policies
      const policies = this.config.transferPolicies
        .filter(policy => 
          policy.enabled &&
          policy.sourceClassification === request.sourceClassification &&
          policy.transferType === request.transferType
        )
        .sort((a, b) => a.name.localeCompare(b.name)); // Deterministic ordering

      let decision: TransferDecision | null = null;

      for (const policy of policies) {
        const policyResult = await this.evaluateTransferPolicy(policy, request);
        
        if (policyResult.applicable) {
          decision = {
            requestId: request.id,
            action: policy.action,
            policyId: policy.id,
            policyName: policy.name,
            reasoning: policyResult.reasoning,
            requiresApproval: policy.approvalRequired,
            requiresEncryption: policy.encryptionRequired,
            auditLevel: policy.auditLevel,
            conditions: policyResult.conditions,
            decidedAt: new Date()
          };
          break; // Use first applicable policy
        }
      }

      if (!decision) {
        // Default policy: require approval for confidential/restricted
        const requiresApproval = ['confidential', 'restricted'].includes(request.sourceClassification);
        const requiresEncryption = ['confidential', 'restricted'].includes(request.sourceClassification);
        
        decision = {
          requestId: request.id,
          action: requiresApproval ? 'require_approval' : 'allow',
          policyId: 'default',
          policyName: 'Default Transfer Policy',
          reasoning: ['No specific policy found, using default behavior'],
          requiresApproval,
          requiresEncryption,
          auditLevel: 'basic',
          conditions: [],
          decidedAt: new Date()
        };
      }

      // Store decision
      await this.storeTransferDecision(decision);

      // Audit transfer decision
      await this.auditTransferDecision(request, decision);

      return decision;
    } catch (error) {
      console.error('Error evaluating transfer request:', error);
      throw new Error('Failed to evaluate transfer request');
    }
  }

  async createClassificationRule(
    rule: Omit<ClassificationRule,
    'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ClassificationRule> {
    try {
      const ruleId = this.generateId('rule');
      const now = new Date();
      
      const newRule: ClassificationRule = {
        ...rule,
        id: ruleId,
        createdAt: now,
        updatedAt: now
      };

      await this.db.query(`
        INSERT INTO data_classification_rules (
          id, name, description, priority, conditions, classification, enabled, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        ruleId,
        rule.name,
        rule.description,
        rule.priority,
        JSON.stringify(rule.conditions),
        rule.classification,
        rule.enabled,
        now,
        now
      ]);

      // Add to in-memory rules
      this.config.classificationRules.push(newRule);
      
      // Sort by priority
      this.config.classificationRules.sort((a, b) => b.priority - a.priority);

      await this.auditService.logEvent({
        userId: undefined,
        action: 'data_classification_rule_created',
        details: {
          ruleId,
          ruleName: rule.name,
          classification: rule.classification
        },
        severity: 'info'
      });

      return newRule;
    } catch (error) {
      console.error('Error creating classification rule:', error);
      throw new Error('Failed to create classification rule');
    }
  }

  async createTransferPolicy(policy: Omit<TransferPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<TransferPolicy> {
    try {
      const policyId = this.generateId('policy');
      const now = new Date();
      
      const newPolicy: TransferPolicy = {
        ...policy,
        id: policyId,
        createdAt: now,
        updatedAt: now
      };

      await this.db.query(`
        INSERT INTO data_transfer_policies (
          id, name, description, source_classification, target_classification, 
          transfer_type, action, conditions, approval_required, encryption_required,
          audit_level, enabled, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        policyId,
        policy.name,
        policy.description,
        policy.sourceClassification,
        policy.targetClassification,
        policy.transferType,
        policy.action,
        JSON.stringify(policy.conditions),
        policy.approvalRequired,
        policy.encryptionRequired,
        policy.auditLevel,
        policy.enabled,
        now,
        now
      ]);

      // Add to in-memory policies
      this.config.transferPolicies.push(newPolicy);

      await this.auditService.logEvent({
        userId: undefined,
        action: 'data_transfer_policy_created',
        details: {
          policyId,
          policyName: policy.name,
          action: policy.action,
          sourceClassification: policy.sourceClassification
        },
        severity: 'info'
      });

      return newPolicy;
    } catch (error) {
      console.error('Error creating transfer policy:', error);
      throw new Error('Failed to create transfer policy');
    }
  }

  async getClassificationHistory(dataId: string): Promise<ClassificationResult[]> {
    try {
      const result = await this.db.query(`
        SELECT * FROM data_classifications 
        WHERE data_id = $1 
        ORDER BY classified_at DESC
      `, [dataId]);

      return result.rows.map(row => ({
        dataId: row.data_id,
        classification: row.classification,
        confidence: row.confidence,
        ruleId: row.rule_id,
        ruleName: row.rule_name,
        reasoning: JSON.parse(row.reasoning || '[]'),
        metadata: JSON.parse(row.metadata || '{}'),
        classifiedAt: row.classified_at
      }));
    } catch (error) {
      console.error('Error getting classification history:', error);
      return [];
    }
  }

  async getTransferAuditLog(filters: {
    dataId?: string;
    userId?: string;
    classification?: DataClassification;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}): Promise<TransferAuditEvent[]> {
    try {
      let query = 'SELECT * FROM transfer_audit_log WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (filters.dataId) {
        query += ` AND data_id = $${paramIndex++}`;
        params.push(filters.dataId);
      }

      if (filters.userId) {
        query += ` AND user_id = $${paramIndex++}`;
        params.push(filters.userId);
      }

      if (filters.classification) {
        query += ` AND data_classification = $${paramIndex++}`;
        params.push(filters.classification);
      }

      if (filters.startDate) {
        query += ` AND timestamp >= $${paramIndex++}`;
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ` AND timestamp <= $${paramIndex++}`;
        params.push(filters.endDate);
      }

      query += ' ORDER BY timestamp DESC';

      if (filters.limit) {
        query += ` LIMIT $${paramIndex++}`;
        params.push(filters.limit);
      }

      const result = await this.db.query(query, params);

      return result.rows.map(row => ({
        id: row.id,
        requestId: row.request_id,
        dataId: row.data_id,
        dataClassification: row.data_classification,
        transferType: row.transfer_type,
        userId: row.user_id,
        action: row.action,
        policyId: row.policy_id,
        decision: row.decision,
        encryptionUsed: row.encryption_used,
        auditLevel: row.audit_level,
        metadata: JSON.parse(row.metadata || '{}'),
        timestamp: row.timestamp
      }));
    } catch (error) {
      console.error('Error getting transfer audit log:', error);
      return [];
    }
  }

  // Private helper methods

  private async createTables(): Promise<void> {
    const tables = [
      // Classification rules table
      `CREATE TABLE IF NOT EXISTS data_classification_rules (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        priority INTEGER NOT NULL DEFAULT 0,
        conditions JSONB NOT NULL,
        classification VARCHAR(50) NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL
      )`,
      
      // Transfer policies table
      `CREATE TABLE IF NOT EXISTS data_transfer_policies (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        source_classification VARCHAR(50) NOT NULL,
        target_classification VARCHAR(50),
        transfer_type VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        conditions JSONB,
        approval_required BOOLEAN NOT NULL DEFAULT false,
        encryption_required BOOLEAN NOT NULL DEFAULT false,
        audit_level VARCHAR(20) NOT NULL DEFAULT 'basic',
        enabled BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL
      )`,
      
      // Data classifications table
      `CREATE TABLE IF NOT EXISTS data_classifications (
        id VARCHAR(255) PRIMARY KEY,
        data_id VARCHAR(255) NOT NULL,
        classification VARCHAR(50) NOT NULL,
        confidence DECIMAL(3,2) NOT NULL,
        rule_id VARCHAR(255) NOT NULL,
        rule_name VARCHAR(255) NOT NULL,
        reasoning JSONB,
        metadata JSONB,
        classified_at TIMESTAMP WITH TIME ZONE NOT NULL
      )`,
      
      // Transfer decisions table
      `CREATE TABLE IF NOT EXISTS transfer_decisions (
        id VARCHAR(255) PRIMARY KEY,
        request_id VARCHAR(255) NOT NULL,
        action VARCHAR(50) NOT NULL,
        policy_id VARCHAR(255) NOT NULL,
        policy_name VARCHAR(255) NOT NULL,
        reasoning JSONB,
        requires_approval BOOLEAN NOT NULL,
        requires_encryption BOOLEAN NOT NULL,
        audit_level VARCHAR(20) NOT NULL,
        conditions JSONB,
        decided_at TIMESTAMP WITH TIME ZONE NOT NULL
      )`,
      
      // Transfer audit log table
      `CREATE TABLE IF NOT EXISTS transfer_audit_log (
        id VARCHAR(255) PRIMARY KEY,
        request_id VARCHAR(255) NOT NULL,
        data_id VARCHAR(255) NOT NULL,
        data_classification VARCHAR(50) NOT NULL,
        transfer_type VARCHAR(50) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        action VARCHAR(50) NOT NULL,
        policy_id VARCHAR(255) NOT NULL,
        decision VARCHAR(50) NOT NULL,
        encryption_used BOOLEAN NOT NULL,
        audit_level VARCHAR(20) NOT NULL,
        metadata JSONB,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL
      )`
    ];

    for (const table of tables) {
      await this.db.query(table);
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_data_classifications_data_id ON data_classifications(data_id)',
      'CREATE INDEX IF NOT EXISTS idx_data_classifications_classification ON data_classifications(classification)',
      'CREATE INDEX IF NOT EXISTS idx_transfer_audit_log_data_id ON transfer_audit_log(data_id)',
      'CREATE INDEX IF NOT EXISTS idx_transfer_audit_log_user_id ON transfer_audit_log(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_transfer_audit_log_timestamp ON transfer_audit_log(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_transfer_decisions_request_id ON transfer_decisions(request_id)'
    ];

    for (const index of indexes) {
      await this.db.query(index);
    }
  }

  private async loadClassificationRules(): Promise<void> {
    try {
      const result = await this.db.query(`
        SELECT * FROM data_classification_rules 
        WHERE enabled = true 
        ORDER BY priority DESC
      `);

      this.config.classificationRules = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        priority: row.priority,
        conditions: JSON.parse(row.conditions),
        classification: row.classification,
        enabled: row.enabled,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      console.error('Error loading classification rules:', error);
      this.config.classificationRules = [];
    }
  }

  private async loadTransferPolicies(): Promise<void> {
    try {
      const result = await this.db.query(`
        SELECT * FROM data_transfer_policies 
        WHERE enabled = true 
        ORDER BY name
      `);

      this.config.transferPolicies = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        sourceClassification: row.source_classification,
        targetClassification: row.target_classification,
        transferType: row.transfer_type,
        action: row.action,
        conditions: JSON.parse(row.conditions || '[]'),
        approvalRequired: row.approval_required,
        encryptionRequired: row.encryption_required,
        auditLevel: row.audit_level,
        enabled: row.enabled,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      console.error('Error loading transfer policies:', error);
      this.config.transferPolicies = [];
    }
  }

  private async evaluateClassificationRule(
    rule: ClassificationRule,
    data: { content: string; metadata: Record<string, any>; filename: string; size: number }
  ): Promise<{ matches: boolean; confidence: number; reasoning: string[] }> {
    const reasoning: string[] = [];
    let matchCount = 0;
    
    for (const condition of rule.conditions) {
      const conditionResult = this.evaluateCondition(condition, data);
      if (conditionResult.matches) {
        matchCount++;
        reasoning.push(conditionResult.reason);
      }
    }

    const matches = matchCount === rule.conditions.length; // All conditions must match
    const confidence = matches ? Math.min(0.9, 0.6 + (matchCount * 0.1)) : 0;

    if (matches) {
      reasoning.unshift(`Rule "${rule.name}" matched all ${rule.conditions.length} conditions`);
    }

    return { matches, confidence, reasoning };
  }

  private evaluateCondition(
    condition: ClassificationCondition,
    data: { content: string; metadata: Record<string, any>; filename: string; size: number }
  ): { matches: boolean; reason: string } {
    let fieldValue: any;
    
    switch (condition.field) {
      case 'content':
        fieldValue = data.content;
        break;
      case 'filename':
        fieldValue = data.filename;
        break;
      case 'size':
        fieldValue = data.size;
        break;
      case 'metadata':
        fieldValue = JSON.stringify(data.metadata);
        break;
      default:
        fieldValue = data.metadata[condition.field] || '';
    }

    const normalizedValue = condition.caseSensitive !== false ? 
      fieldValue : 
      (typeof fieldValue === 'string' ? fieldValue.toLowerCase() : fieldValue);
    
    const normalizedConditionValue = condition.caseSensitive !== false ? 
      condition.value : 
      (typeof condition.value === 'string' ? condition.value.toLowerCase() : condition.value);

    let matches = false;
    let reason = '';

    switch (condition.operator) {
      case 'contains':
        matches = typeof normalizedValue === 'string' && 
                 typeof normalizedConditionValue === 'string' &&
                 normalizedValue.includes(normalizedConditionValue);
        reason = `Field "${condition.field}" ${matches ? 'contains' : 'does not contain'} "${condition.value}"`;
        break;
        
      case 'equals':
        matches = normalizedValue === normalizedConditionValue;
        reason = `Field "${condition.field}" ${matches ? 'equals' : 'does not equal'} "${condition.value}"`;
        break;
        
      case 'matches':
      case 'pattern':
        try {
          const regex = new RegExp(condition.value as string, condition.caseSensitive !== false ? '' : 'i');
          matches = typeof normalizedValue === 'string' && regex.test(normalizedValue);
          reason = `Field "${condition.field}" ${matches ? 'matches' : 'does not match'} pattern "${condition.value}"`;
        } catch (error) {
          matches = false;
          reason = `Invalid regex pattern "${condition.value}"`;
        }
        break;
        
      case 'gt':
        matches = typeof fieldValue === 'number' && fieldValue > (condition.value as number);
        reason = `Field "${condition.field}" (${fieldValue}) ${matches ? 'is greater than' : 'is not greater than'} ${condition.value}`;
        break;
        
      case 'lt':
        matches = typeof fieldValue === 'number' && fieldValue < (condition.value as number);
        reason = `Field "${condition.field}" (${fieldValue}) ${matches ? 'is less than' : 'is not less than'} ${condition.value}`;
        break;
        
      case 'in':
        matches = Array.isArray(condition.value) && condition.value.includes(normalizedValue);
        reason = `Field "${condition.field}" ${matches ? 'is in' : 'is not in'} allowed values`;
        break;
        
      default:
        matches = false;
        reason = `Unknown operator "${condition.operator}"`;
    }

    return { matches, reason };
  }

  private async evaluateTransferPolicy(
    policy: TransferPolicy,
    request: DataTransferRequest
  ): Promise<{ applicable: boolean; reasoning: string[]; conditions: string[] }> {
    const reasoning: string[] = [];
    const conditions: string[] = [];
    let applicable = true;

    // Check basic policy match
    if (policy.sourceClassification !== request.sourceClassification) {
      applicable = false;
      reasoning.push(
        `Source classification mismatch: expected ${policy.sourceClassification},
        got ${request.sourceClassification}`
      );
    }

    if (policy.transferType !== request.transferType) {
      applicable = false;
      reasoning.push(`Transfer type mismatch: expected ${policy.transferType}, got ${request.transferType}`);
    }

    if (!applicable) {
      return { applicable, reasoning, conditions };
    }

    // Evaluate policy conditions
    for (const condition of policy.conditions) {
      const conditionResult = this.evaluateTransferCondition(condition, request);
      if (!conditionResult.matches) {
        applicable = false;
        reasoning.push(conditionResult.reason);
      } else {
        conditions.push(conditionResult.reason);
      }
    }

    if (applicable) {
      reasoning.push(`Policy "${policy.name}" is applicable`);
    }

    return { applicable, reasoning, conditions };
  }

  private evaluateTransferCondition(
    condition: TransferCondition,
    request: DataTransferRequest
  ): { matches: boolean; reason: string } {
    let matches = false;
    let reason = '';

    switch (condition.type) {
      case 'user_role':
        if (condition.operator === 'in' && Array.isArray(condition.value)) {
          matches = request.userRoles.some(role => (condition.value as string[]).includes(role));
          reason = `User roles ${matches ? 'include' : 'do not include'} required roles`;
        } else if (condition.operator === 'equals') {
          matches = request.userRoles.includes(condition.value as string);
          reason = `User ${matches ? 'has' : 'does not have'} required role "${condition.value}"`;
        }
        break;
        
      case 'time_window':
        const now = new Date();
        const currentHour = now.getHours();
        if (condition.operator === 'between' && typeof condition.value === 'object' && 'start' in condition.value) {
          const start = parseInt(condition.value.start);
          const end = parseInt(condition.value.end);
          matches = currentHour >= start && currentHour <= end;
          reason = `Current time ${matches ? 'is within' : 'is outside'} allowed window (${start}-${end})`;
        }
        break;
        
      case 'approval_status':
        matches = condition.operator === 'equals' ? 
          (request.approvedBy !== undefined) === (condition.value === 'approved') :
          false;
        reason = `Transfer ${matches ? 'has' : 'does not have'} required approval status`;
        break;
        
      case 'encryption_status':
        matches = condition.operator === 'equals' ? 
          request.encryptionRequired === (condition.value === 'required') :
          false;
        reason = `Encryption ${matches ? 'meets' : 'does not meet'} requirements`;
        break;
        
      default:
        matches = false;
        reason = `Unknown condition type "${condition.type}"`;
    }

    return { matches, reason };
  }

  private async storeClassification(result: ClassificationResult): Promise<void> {
    const classificationId = this.generateId('classification');
    
    await this.db.query(`
      INSERT INTO data_classifications (
        id, data_id, classification, confidence, rule_id, rule_name, reasoning, metadata, classified_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      classificationId,
      result.dataId,
      result.classification,
      result.confidence,
      result.ruleId,
      result.ruleName,
      JSON.stringify(result.reasoning),
      JSON.stringify(result.metadata),
      result.classifiedAt
    ]);
  }

  private async storeTransferDecision(decision: TransferDecision): Promise<void> {
    const decisionId = this.generateId('decision');
    
    await this.db.query(`
      INSERT INTO transfer_decisions (
        id, request_id, action, policy_id, policy_name, reasoning, 
        requires_approval, requires_encryption, audit_level, conditions, decided_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      decisionId,
      decision.requestId,
      decision.action,
      decision.policyId,
      decision.policyName,
      JSON.stringify(decision.reasoning),
      decision.requiresApproval,
      decision.requiresEncryption,
      decision.auditLevel,
      JSON.stringify(decision.conditions),
      decision.decidedAt
    ]);
  }

  private async auditClassification(result: ClassificationResult): Promise<void> {
    try {
      await this.auditService.logEvent({
        userId: undefined,
        action: 'data_classified',
        details: {
          dataId: result.dataId,
          classification: result.classification,
          confidence: result.confidence,
          ruleId: result.ruleId,
          ruleName: result.ruleName
        },
        severity: 'info'
      });
    } catch (error) {
      console.error('Error auditing classification:', error);
    }
  }

  private async auditTransferDecision(request: DataTransferRequest, decision: TransferDecision): Promise<void> {
    try {
      const auditId = this.generateId('audit');
      
      // Store in audit log table
      await this.db.query(`
        INSERT INTO transfer_audit_log (
          id, request_id, data_id, data_classification, transfer_type, user_id,
          action, policy_id, decision, encryption_used, audit_level, metadata, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        auditId,
        request.id,
        request.dataId,
        request.sourceClassification,
        request.transferType,
        request.userId,
        decision.action,
        decision.policyId,
        decision.action === 'allow' ? 'allowed' : decision.action === 'deny' ? 'denied' : 'pending_approval',
        decision.requiresEncryption,
        decision.auditLevel,
        JSON.stringify({ request: request.metadata, decision: decision.reasoning }),
        new Date()
      ]);

      // Also log to audit service
      await this.auditService.logEvent({
        userId: request.userId,
        action: 'data_transfer_evaluated',
        details: {
          requestId: request.id,
          dataId: request.dataId,
          classification: request.sourceClassification,
          transferType: request.transferType,
          decision: decision.action,
          policyId: decision.policyId,
          requiresApproval: decision.requiresApproval,
          requiresEncryption: decision.requiresEncryption
        },
        severity: decision.action === 'deny' ? 'warning' : 'info'
      });
    } catch (error) {
      console.error('Error auditing transfer decision:', error);
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }
}