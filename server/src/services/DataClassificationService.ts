// Data Classification Service
// Comprehensive data classification and transfer control system
// Epic 19-2: Data governance and transfer controls with classification-based policies

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import * as crypto from 'crypto';

}
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
}
  };
  approvalRequired: {
    confidential: boolean;
    restricted: boolean;
    internal: boolean;
    public: boolean;
  };
  driftDetection: {
    enabled: boolean;
    thresholds: {
      significantChange: number; // Percentage of data items that changed classification
      rapidChange: number; // Percentage change within short time window
      timeWindow: number; // Hours for rapid change detection
    };
    alerting: {
      enabled: boolean;
      notifyOnSignificant: boolean;
      notifyOnRapid: boolean;
      notifyOnDowngrade: boolean; // Alert when classification level decreases
      notifyOnUpgrade: boolean; // Alert when classification level increases
    };
  };
}

export type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted';
export type TransferDestination = DataClassification | 'external';

}
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
}

}
export interface ClassificationCondition {
  field: string; // 'content', 'metadata', 'filename', 'size', 'source'
  operator: 'contains' | 'matches' | 'equals' | 'gt' | 'lt' | 'in' | 'pattern';
  value: string | number | string[];
  caseSensitive?: boolean;
}
}

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
}

export type TransferType = 'api_export' | 'file_download' | 'data_sync' | 'backup' | 'migration' | 'sharing';
export type PolicyAction = 'allow' | 'deny' | 'require_approval' | 'encrypt_only';
export type AuditLevel = 'none' | 'basic' | 'detailed' | 'full';

}
export interface TransferCondition {
  type: 'user_role' | 'time_window' | 'location' | 'approval_status' | 'encryption_status';
  operator: 'equals' | 'in' | 'between' | 'not_in';
}
  value: string | string[] | { start: string; end: string };
}

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
}

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
}

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
}

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
}

}
export interface ClassificationDriftEvent {
  id: string;
  dataId: string;
  previousClassification: DataClassification;
  newClassification: DataClassification;
  previousRuleId: string;
  newRuleId: string;
  driftType: DriftType;
  severity: DriftSeverity;
  confidence: number;
  reasoning: string[];
  metadata: Record<string, any>;
  detectedAt: Date;
}
}

export type DriftType = 'upgrade' | 'downgrade' | 'lateral' | 'oscillation';
export type DriftSeverity = 'low' | 'medium' | 'high' | 'critical';

}
export interface DriftAnalysisResult {
  analysisId: string;
  timeRange: {
    start: Date;
    end: Date;
}
  };
  totalDataItems: number;
  driftEvents: number;
  driftPercentage: number;
  driftPatterns: {
    upgrades: number;
    downgrades: number;
    oscillations: number;
    lateral: number;
  };
  severityBreakdown: Record<DriftSeverity, number>;
  mostAffectedRules: Array<{
    ruleId: string;
    ruleName: string;
    affectedItems: number;
    percentage: number;
  }>;
  alerts: DriftAlert[];
  recommendations: string[];
}

}
export interface DriftAlert {
  id: string;
  type: 'significant_change' | 'rapid_change' | 'classification_downgrade' | 'classification_upgrade' | 'rule_instability';
  severity: DriftSeverity;
  message: string;
  dataItems: string[];
  affectedPercentage: number;
  timeWindow: string;
  createdAt: Date;
}
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
  }
  approvalRequired: {
    confidential: true,
    restricted: true,
    internal: false,
    public: false
  }
  driftDetection: {
    enabled: true,
    thresholds: {
      significantChange: 10.0, // 10% of data items changed classification
      rapidChange: 5.0, // 5% change within time window
      timeWindow: 24 // 24 hours for rapid change detection
  }
    alerting: {
      enabled: true,
      notifyOnSignificant: true,
      notifyOnRapid: true,
      notifyOnDowngrade: true,
      notifyOnUpgrade: false // Usually upgrades are less concerning
    }
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

      // Get previous classification for drift detection
      const previousClassifications = await this.getClassificationHistory(dataId);
      const previousClassification = previousClassifications.length > 0 ? previousClassifications[0] : null;

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

      // Detect and handle classification drift
      if (this.config.driftDetection.enabled && previousClassification) {
        await this.detectAndRecordDrift(previousClassification, result);
      }

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
  }
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
  }
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
      const params: unknown[] = [];
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

  async analyzeDrift(timeRange: { start: Date; end: Date }): Promise<DriftAnalysisResult> {

    try {
      const analysisId = this.generateId('drift_analysis');
      
      // Get all drift events in the time range
      const driftEvents = await this.getDriftEvents({
        startDate: timeRange.start,
        endDate: timeRange.end
      });

      // Get total number of data items classified in this period
      const totalDataItems = await this.getTotalClassificationsInRange(timeRange.start, timeRange.end);

      // Calculate drift statistics
      const driftPercentage = totalDataItems > 0 ? (driftEvents.length / totalDataItems) * 100 : 0;

      // Analyze drift patterns
      const driftPatterns = {
        upgrades: driftEvents.filter(e => e.driftType === 'upgrade').length,
        downgrades: driftEvents.filter(e => e.driftType === 'downgrade').length,
        oscillations: driftEvents.filter(e => e.driftType === 'oscillation').length,
        lateral: driftEvents.filter(e => e.driftType === 'lateral').length
      };

      // Severity breakdown
      const severityBreakdown = {
        low: driftEvents.filter(e => e.severity === 'low').length,
        medium: driftEvents.filter(e => e.severity === 'medium').length,
        high: driftEvents.filter(e => e.severity === 'high').length,
        critical: driftEvents.filter(e => e.severity === 'critical').length
      };

      // Find most affected rules
      const ruleStats = new Map<string, { count: number; ruleName: string }>();
      driftEvents.forEach(event => {
        const current = ruleStats.get(event.newRuleId) || { count: 0, ruleName: '' };
        current.count++;
        if (!current.ruleName) {
          const rule = this.config.classificationRules.find(r => r.id === event.newRuleId);
          current.ruleName = rule?.name || 'Unknown Rule';
        }
        ruleStats.set(event.newRuleId, current);
      });

      const mostAffectedRules = Array.from(ruleStats.entries())
        .map(([ruleId, stats]) => ({
          ruleId,
          ruleName: stats.ruleName,
          affectedItems: stats.count,
          percentage: totalDataItems > 0 ? (stats.count / totalDataItems) * 100 : 0
        }))
        .sort((a, b) => b.affectedItems - a.affectedItems)
        .slice(0, 10);

      // Generate alerts
      const alerts = await this.generateDriftAlerts(driftEvents, driftPercentage, timeRange);

      // Generate recommendations
      const recommendations = this.generateDriftRecommendations(driftEvents, driftPatterns, severityBreakdown);

      return {
        analysisId,
        timeRange,
        totalDataItems,
        driftEvents: driftEvents.length,
        driftPercentage,
        driftPatterns,
        severityBreakdown,
        mostAffectedRules,
        alerts,
        recommendations
      };
    } catch (error) {
      console.error('Error analyzing drift:', error);
      throw new Error('Failed to analyze classification drift');
    }
  }

  async getDriftEvents(filters: {
    dataId?: string;
    startDate?: Date;
    endDate?: Date;
    driftType?: DriftType;
    severity?: DriftSeverity;
    limit?: number;
  } = {}): Promise<ClassificationDriftEvent[]> {

    try {
      let query = 'SELECT * FROM classification_drift_events WHERE 1=1';
      const params: unknown[] = [];
      let paramIndex = 1;

      if (filters.dataId) {
        query += ` AND data_id = $${paramIndex++}`;
        params.push(filters.dataId);
      }

      if (filters.startDate) {
        query += ` AND detected_at >= $${paramIndex++}`;
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ` AND detected_at <= $${paramIndex++}`;
        params.push(filters.endDate);
      }

      if (filters.driftType) {
        query += ` AND drift_type = $${paramIndex++}`;
        params.push(filters.driftType);
      }

      if (filters.severity) {
        query += ` AND severity = $${paramIndex++}`;
        params.push(filters.severity);
      }

      query += ' ORDER BY detected_at DESC';

      if (filters.limit) {
        query += ` LIMIT $${paramIndex++}`;
        params.push(filters.limit);
      }

      const result = await this.db.query(query, params);

      return result.rows.map(row => ({
        id: row.id,
        dataId: row.data_id,
        previousClassification: row.previous_classification,
        newClassification: row.new_classification,
        previousRuleId: row.previous_rule_id,
        newRuleId: row.new_rule_id,
        driftType: row.drift_type,
        severity: row.severity,
        confidence: row.confidence,
        reasoning: JSON.parse(row.reasoning || '[]'),
        metadata: JSON.parse(row.metadata || '{}'),
        detectedAt: row.detected_at
      }));
    } catch (error) {
      console.error('Error getting drift events:', error);
      return [];
    }
  }

  async getDriftAlerts(filters: {
    severity?: DriftSeverity;
    type?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}): Promise<DriftAlert[]> {

    try {
      let query = 'SELECT * FROM classification_drift_alerts WHERE 1=1';
      const params: unknown[] = [];
      let paramIndex = 1;

      if (filters.severity) {
        query += ` AND severity = $${paramIndex++}`;
        params.push(filters.severity);
      }

      if (filters.type) {
        query += ` AND type = $${paramIndex++}`;
        params.push(filters.type);
      }

      if (filters.startDate) {
        query += ` AND created_at >= $${paramIndex++}`;
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ` AND created_at <= $${paramIndex++}`;
        params.push(filters.endDate);
      }

      query += ' ORDER BY created_at DESC';

      if (filters.limit) {
        query += ` LIMIT $${paramIndex++}`;
        params.push(filters.limit);
      }

      const result = await this.db.query(query, params);

      return result.rows.map(row => ({
        id: row.id,
        type: row.type,
        severity: row.severity,
        message: row.message,
        dataItems: JSON.parse(row.data_items || '[]'),
        affectedPercentage: row.affected_percentage,
        timeWindow: row.time_window,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error getting drift alerts:', error);
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
      )`,
      
      // Classification drift events table
      `CREATE TABLE IF NOT EXISTS classification_drift_events (
        id VARCHAR(255) PRIMARY KEY,
        data_id VARCHAR(255) NOT NULL,
        previous_classification VARCHAR(50) NOT NULL,
        new_classification VARCHAR(50) NOT NULL,
        previous_rule_id VARCHAR(255) NOT NULL,
        new_rule_id VARCHAR(255) NOT NULL,
        drift_type VARCHAR(20) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        confidence DECIMAL(3,2) NOT NULL,
        reasoning JSONB,
        metadata JSONB,
        detected_at TIMESTAMP WITH TIME ZONE NOT NULL
      )`,
      
      // Classification drift alerts table
      `CREATE TABLE IF NOT EXISTS classification_drift_alerts (
        id VARCHAR(255) PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        data_items JSONB NOT NULL,
        affected_percentage DECIMAL(5,2) NOT NULL,
        time_window VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL
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
      'CREATE INDEX IF NOT EXISTS idx_transfer_decisions_request_id ON transfer_decisions(request_id)',
      'CREATE INDEX IF NOT EXISTS idx_drift_events_data_id ON classification_drift_events(data_id)',
      'CREATE INDEX IF NOT EXISTS idx_drift_events_detected_at ON classification_drift_events(detected_at)',
      'CREATE INDEX IF NOT EXISTS idx_drift_events_drift_type ON classification_drift_events(drift_type)',
      'CREATE INDEX IF NOT EXISTS idx_drift_events_severity ON classification_drift_events(severity)',
      'CREATE INDEX IF NOT EXISTS idx_drift_alerts_created_at ON classification_drift_alerts(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_drift_alerts_severity ON classification_drift_alerts(severity)',
      'CREATE INDEX IF NOT EXISTS idx_drift_alerts_type ON classification_drift_alerts(type)'
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
    let fieldValue: Error;
    
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
  }
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
  }
        severity: decision.action === 'deny' ? 'warning' : 'info'
      });
    } catch (error) {
      console.error('Error auditing transfer decision:', error);
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private async detectAndRecordDrift(
    previousClassification: ClassificationResult,
    newClassification: ClassificationResult
  ): Promise<void> {

    try {
      // Only detect drift if classification actually changed
      if (previousClassification.classification === newClassification.classification) {
        return;
      }

      // Determine drift type and severity
      const driftType = this.determineDriftType(
        previousClassification.classification,
        newClassification.classification,
        newClassification.dataId
      );
      
      const severity = this.determineDriftSeverity(
        previousClassification.classification,
        newClassification.classification,
        newClassification.confidence
      );

      // Check for oscillation pattern
      const recentHistory = await this.getClassificationHistory(newClassification.dataId);
      const isOscillation = this.detectOscillationPattern(recentHistory);

      const finalDriftType = isOscillation ? 'oscillation' : driftType;
      const finalSeverity = isOscillation ? this.escalateSeverity(severity) : severity;

      // Create drift event
      const driftEvent: ClassificationDriftEvent = {
        id: this.generateId('drift'),
        dataId: newClassification.dataId,
        previousClassification: previousClassification.classification,
        newClassification: newClassification.classification,
        previousRuleId: previousClassification.ruleId,
        newRuleId: newClassification.ruleId,
        driftType: finalDriftType,
        severity: finalSeverity,
        confidence: newClassification.confidence,
        reasoning: [
          `Classification changed from ${previousClassification.classification} to ${newClassification.classification}`,
          `Previous rule: ${previousClassification.ruleName}`,
          `New rule: ${newClassification.ruleName}`,
          ...newClassification.reasoning
        ],
        metadata: {
          previousConfidence: previousClassification.confidence,
          newConfidence: newClassification.confidence,
          timeSinceLastClassification: new Date().getTime() - previousClassification.classifiedAt.getTime(),
          isOscillation
  }
        detectedAt: new Date()
      };

      // Store drift event
      await this.storeDriftEvent(driftEvent);

      // Check if this triggers any alerts
      await this.checkAndCreateDriftAlerts(driftEvent);

      // Audit drift detection
      await this.auditDriftDetection(driftEvent);

    } catch (error) {
      console.error('Error detecting drift:', error);
      // Don't throw - drift detection failure shouldn't block classification
    }
  }

  private determineDriftType(
    previousClassification: DataClassification,
    newClassification: DataClassification,
    _dataId: string
  ): DriftType {
    const classificationLevels = {
      'public': 0,
      'internal': 1,
      'confidential': 2,
      'restricted': 3
    };

    const previousLevel = classificationLevels[previousClassification];
    const newLevel = classificationLevels[newClassification];

    if (newLevel > previousLevel) {
      return 'upgrade';
    } else if (newLevel < previousLevel) {
      return 'downgrade';
    } else {
      return 'lateral';
    }
  }

  private determineDriftSeverity(
    previousClassification: DataClassification,
    newClassification: DataClassification,
    confidence: number
  ): DriftSeverity {
    const classificationLevels = {
      'public': 0,
      'internal': 1,
      'confidential': 2,
      'restricted': 3
    };

    const previousLevel = classificationLevels[previousClassification];
    const newLevel = classificationLevels[newClassification];
    const levelDifference = Math.abs(newLevel - previousLevel);

    // Low confidence changes are more concerning
    if (confidence < 0.6) {
      if (levelDifference >= 2) return 'critical';
      if (levelDifference === 1) return 'high';
      return 'medium';
    }

    // High confidence changes
    if (levelDifference >= 3) return 'high';
    if (levelDifference === 2) return 'medium';
    if (levelDifference === 1) return 'low';
    
    return 'low';
  }

  private detectOscillationPattern(history: ClassificationResult[]): boolean {
    if (history.length < 4) return false;

    // Check if the last 4 classifications show an oscillating pattern
    const recent = history.slice(0, 4);
    const classifications = recent.map(h => h.classification);

    // Pattern: A-B-A-B or similar back-and-forth
    return (
      classifications[0] === classifications[2] &&
      classifications[1] === classifications[3] &&
      classifications[0] !== classifications[1]
    );
  }

  private escalateSeverity(severity: DriftSeverity): DriftSeverity {
    const escalation = {
      'low': 'medium',
      'medium': 'high',
      'high': 'critical',
      'critical': 'critical'
    };
    return escalation[severity] as DriftSeverity;
  }

  private async storeDriftEvent(event: ClassificationDriftEvent): Promise<void> {

    await this.db.query(`
      INSERT INTO classification_drift_events (
        id, data_id, previous_classification, new_classification,
        previous_rule_id, new_rule_id, drift_type, severity,
        confidence, reasoning, metadata, detected_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      event.id,
      event.dataId,
      event.previousClassification,
      event.newClassification,
      event.previousRuleId,
      event.newRuleId,
      event.driftType,
      event.severity,
      event.confidence,
      JSON.stringify(event.reasoning),
      JSON.stringify(event.metadata),
      event.detectedAt
    ]);
  }

  private async checkAndCreateDriftAlerts(driftEvent: ClassificationDriftEvent): Promise<void> {

    const alerts: DriftAlert[] = [];

    // Check for downgrade alerts
    if (this.config.driftDetection.alerting.notifyOnDowngrade && driftEvent.driftType === 'downgrade') {
      alerts.push({
        id: this.generateId('alert'),
        type: 'classification_downgrade',
        severity: driftEvent.severity,
        message: `Data classification downgraded from ${driftEvent.previousClassification} to ${driftEvent.newClassification}`,
        dataItems: [driftEvent.dataId],
        affectedPercentage: 0, // Will be calculated in batch analysis
        timeWindow: 'immediate',
        createdAt: new Date()
      });
    }

    // Check for upgrade alerts
    if (this.config.driftDetection.alerting.notifyOnUpgrade && driftEvent.driftType === 'upgrade') {
      alerts.push({
        id: this.generateId('alert'),
        type: 'classification_upgrade',
        severity: driftEvent.severity,
        message: `Data classification upgraded from ${driftEvent.previousClassification} to ${driftEvent.newClassification}`,
        dataItems: [driftEvent.dataId],
        affectedPercentage: 0,
        timeWindow: 'immediate',
        createdAt: new Date()
      });
    }

    // Check for oscillation alerts
    if (driftEvent.driftType === 'oscillation') {
      alerts.push({
        id: this.generateId('alert'),
        type: 'rule_instability',
        severity: 'high',
        message: 'Oscillating classification pattern detected for data item',
        dataItems: [driftEvent.dataId],
        affectedPercentage: 0,
        timeWindow: 'recent_history',
        createdAt: new Date()
      });
    }

    // Store alerts
    for (const alert of alerts) {
      await this.storeDriftAlert(alert);
    }
  }

  private async storeDriftAlert(alert: DriftAlert): Promise<void> {

    await this.db.query(`
      INSERT INTO classification_drift_alerts (
        id, type, severity, message, data_items,
        affected_percentage, time_window, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      alert.id,
      alert.type,
      alert.severity,
      alert.message,
      JSON.stringify(alert.dataItems),
      alert.affectedPercentage,
      alert.timeWindow,
      alert.createdAt
    ]);
  }

  private async auditDriftDetection(driftEvent: ClassificationDriftEvent): Promise<void> {

    try {
      await this.auditService.logEvent({
        userId: undefined,
        action: 'classification_drift_detected',
        details: {
          dataId: driftEvent.dataId,
          driftType: driftEvent.driftType,
          severity: driftEvent.severity,
          previousClassification: driftEvent.previousClassification,
          newClassification: driftEvent.newClassification,
          confidence: driftEvent.confidence
  }
        severity: driftEvent.severity === 'critical' ? 'warning' : 'info'
      });
    } catch (error) {
      console.error('Error auditing drift detection:', error);
    }
  }

  private async getTotalClassificationsInRange(start: Date, end: Date): Promise<number> {

    try {
      const result = await this.db.query(`
        SELECT COUNT(DISTINCT data_id) as count
        FROM data_classifications
        WHERE classified_at >= $1 AND classified_at <= $2
      `, [start, end]);
      
      return parseInt(result.rows[0]?.count || '0');
    } catch (error) {
      console.error('Error getting total classifications:', error);
      return 0;
    }
  }

  private async generateDriftAlerts(
    driftEvents: ClassificationDriftEvent[],
    driftPercentage: number,
    timeRange: { start: Date; end: Date }
  ): Promise<DriftAlert[]> {

    const alerts: DriftAlert[] = [];

    // Check for significant change threshold
    if (this.config.driftDetection.alerting.notifyOnSignificant && 
        driftPercentage >= this.config.driftDetection.thresholds.significantChange) {
      alerts.push({
        id: this.generateId('alert'),
        type: 'significant_change',
        severity: driftPercentage >= 20 ? 'critical' : driftPercentage >= 15 ? 'high' : 'medium',
        message: `Significant classification drift detected: ${driftPercentage.toFixed(1)}% of data items changed classification`,
        dataItems: driftEvents.map(e => e.dataId),
        affectedPercentage: driftPercentage,
        timeWindow: `${timeRange.start.toISOString()} to ${timeRange.end.toISOString()}`,
        createdAt: new Date()
      });
    }

    // Check for rapid change threshold (within configured time window)
    const rapidTimeWindow = new Date(timeRange.end.getTime() - (this.config.driftDetection.thresholds.timeWindow * 60 * 60 * 1000));
    const rapidEvents = driftEvents.filter(e => e.detectedAt >= rapidTimeWindow);
    const rapidPercentage = driftEvents.length > 0 ? (rapidEvents.length / driftEvents.length) * 100 : 0;

    if (this.config.driftDetection.alerting.notifyOnRapid && 
        rapidPercentage >= this.config.driftDetection.thresholds.rapidChange) {
      alerts.push({
        id: this.generateId('alert'),
        type: 'rapid_change',
        severity: rapidPercentage >= 10 ? 'critical' : 'high',
        message: `Rapid classification drift detected: ${rapidPercentage.toFixed(1)}% of changes occurred within ${this.config.driftDetection.thresholds.timeWindow} hours`,
        dataItems: rapidEvents.map(e => e.dataId),
        affectedPercentage: rapidPercentage,
        timeWindow: `Last ${this.config.driftDetection.thresholds.timeWindow} hours`,
        createdAt: new Date()
      });
    }

    return alerts;
  }

  private generateDriftRecommendations(
    driftEvents: ClassificationDriftEvent[],
    driftPatterns: { upgrades: number; downgrades: number; oscillations: number; lateral: number },
    severityBreakdown: Record<DriftSeverity, number>
  ): string[] {
    const recommendations: string[] = [];

    // High oscillation recommendations
    if (driftPatterns.oscillations > driftEvents.length * 0.2) {
      recommendations.push(
        'High oscillation rate detected - Review classification rules for conflicts or ambiguous conditions'
      );
      recommendations.push(
        'Consider consolidating overlapping rules or adjusting rule priorities'
      );
    }

    // High downgrade rate recommendations
    if (driftPatterns.downgrades > driftEvents.length * 0.6) {
      recommendations.push(
        'High classification downgrade rate - Review if data sensitivity is being properly maintained'
      );
      recommendations.push(
        'Consider implementing approval workflow for classification downgrades'
      );
    }

    // High severity events recommendations
    if (severityBreakdown.critical > 0 || severityBreakdown.high > driftEvents.length * 0.3) {
      recommendations.push(
        'High-severity drift events detected - Review classification rules accuracy and data quality'
      );
      recommendations.push(
        'Consider implementing manual review for high-impact classification changes'
      );
    }

    // Low confidence recommendations
    const lowConfidenceEvents = driftEvents.filter(e => e.confidence < 0.7);
    if (lowConfidenceEvents.length > driftEvents.length * 0.4) {
      recommendations.push(
        'Many low-confidence classifications detected - Review and refine classification rules'
      );
      recommendations.push(
        'Consider implementing human-in-the-loop validation for low-confidence classifications'
      );
    }

    // General recommendations
    if (driftEvents.length > 0) {
      recommendations.push(
        'Monitor drift patterns regularly to identify systemic issues'
      );
      recommendations.push(
        'Establish baseline metrics and set up automated alerting for unusual drift patterns'
      );
    }

    return recommendations;
  }
}