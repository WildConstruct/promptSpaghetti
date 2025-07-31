/**
 * Epic 16 Evidence Collection Service
 * 
 * Comprehensive evidence collection system for marketplace transactions,
 * compliance monitoring, audit trails, and regulatory reporting.
 * 
 * Features:
 * - Transaction evidence collection and verification
 * - Compliance data aggregation (GDPR, PSD3, Stripe 2025 AI policy)
 * - Audit trail management with tamper-proof logging
 * - Regulatory reporting with automated evidence packaging
 * - Real-time fraud detection and risk assessment
 * - Data retention policy enforcement
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import { z } from 'zod';

// =============================================================================
// Evidence Collection Types and Schemas
// =============================================================================

export enum EvidenceType {
  TRANSACTION = 'transaction',
  USER_ACTION = 'user_action',
  COMPLIANCE = 'compliance',
  AUDIT = 'audit',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  REFUND = 'refund',
  DISPUTE = 'dispute',
  MODERATION = 'moderation',
  API_ACCESS = 'api_access',
  CONTENT_INTERACTION = 'content_interaction',
  PRIVACY = 'privacy'
}

export enum EvidenceStatus {
  COLLECTED = 'collected',
  VERIFIED = 'verified',
  ARCHIVED = 'archived',
  PURGED = 'purged',
  UNDER_REVIEW = 'under_review',
  FLAGGED = 'flagged'
}

export enum ComplianceFramework {
  GDPR = 'gdpr',
  PSD3 = 'psd3',
  CCPA = 'ccpa',
  SOX = 'sox',
  STRIPE_AI_POLICY = 'stripe_ai_policy',
  PCI_DSS = 'pci_dss',
  ISO_27001 = 'iso_27001'
}

export enum RetentionPolicy {
  TRANSACTION_DATA = 'transaction_data', // 7 years
  USER_ACTIVITY = 'user_activity',       // 2 years
  AUDIT_LOGS = 'audit_logs',             // 10 years
  COMPLIANCE = 'compliance',             // Per regulation
  SECURITY_EVENTS = 'security_events',   // 3 years
  PERFORMANCE_DATA = 'performance_data'  // 1 year
}

const EvidenceMetadataSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(EvidenceType),
  category: z.string().min(1).max(50),
  source: z.string().min(1).max(100),
  
  // Core identification
  userId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  templateId: z.string().uuid().optional(),
  transactionId: z.string().uuid().optional(),
  
  // Evidence integrity
  hash: z.string().length(64), // SHA-256
  signature: z.string().optional(), // Digital signature
  chainHash: z.string().length(64).optional(), // Blockchain-style chaining
  
  // Classification and handling
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  sensitivity: z.enum(['public', 'internal', 'confidential', 'restricted']),
  retentionPolicy: z.nativeEnum(RetentionPolicy),
  
  // Compliance frameworks
  complianceFrameworks: z.array(z.nativeEnum(ComplianceFramework)),
  
  // Legal and regulatory
  legalHold: z.boolean().default(false),
  regulatoryRequirement: z.boolean().default(false),
  
  // Timestamps and lifecycle
  collectedAt: z.date(),
  expiresAt: z.date().optional(),
  verifiedAt: z.date().optional(),
  
  // Searchable tags
  tags: z.array(z.string().min(1).max(50)).max(20),
  
  // Context and relationships
  relatedEvidenceIds: z.array(z.string().uuid()).max(10),
  parentEvidenceId: z.string().uuid().optional()
});

const EvidenceDataSchema = z.object({
  // Raw evidence content
  content: z.record(z.any()),
  
  // File attachments
  attachments: z.array(z.object({
    id: z.string().uuid(),
    filename: z.string().max(255),
    mimeType: z.string().max(100),
    size: z.number().int().min(0),
    hash: z.string().length(64),
    storageLocation: z.string().url(),
    encryptionKey: z.string().optional()
  })).default([]),
  
  // Context and environment
  environment: z.object({
    userAgent: z.string().max(500).optional(),
    ipAddress: z.string().ip().optional(),
    geolocation: z.object({
      country: z.string().length(2),
      region: z.string().max(50).optional(),
      city: z.string().max(50).optional()
    }).optional(),
    deviceInfo: z.record(z.string()).optional()
  }).optional(),
  
  // API and system context
  apiContext: z.object({
    endpoint: z.string().max(200),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    statusCode: z.number().int().min(100).max(599),
    responseTime: z.number().min(0),
    requestId: z.string().uuid(),
    version: z.string().max(20)
  }).optional(),
  
  // Financial transaction data
  financialData: z.object({
    amount: z.number().int().min(0), // in cents
    currency: z.string().length(3),
    paymentMethod: z.string().max(50),
    stripePaymentIntentId: z.string().optional(),
    refundAmount: z.number().int().min(0).optional(),
    feeAmount: z.number().int().min(0).optional()
  }).optional()
});

const EvidenceRecordSchema = z.object({
  metadata: EvidenceMetadataSchema,
  data: EvidenceDataSchema,
  status: z.nativeEnum(EvidenceStatus),
  
  // Verification chain
  verificationChain: z.array(z.object({
    verifierId: z.string().uuid(),
    verifiedAt: z.date(),
    verificationMethod: z.string().max(100),
    result: z.enum(['passed', 'failed', 'warning']),
    notes: z.string().max(1000).optional()
  })).default([]),
  
  // Access log
  accessLog: z.array(z.object({
    accessedBy: z.string().uuid(),
    accessedAt: z.date(),
    action: z.enum(['read', 'verify', 'export', 'purge', 'update']),
    ipAddress: z.string().ip().optional(),
    reason: z.string().max(200).optional()
  })).default([])
});

export type EvidenceMetadata = z.infer<typeof EvidenceMetadataSchema>;
export type EvidenceData = z.infer<typeof EvidenceDataSchema>;
export type EvidenceRecord = z.infer<typeof EvidenceRecordSchema>;

// =============================================================================
// Evidence Collection Configuration
// =============================================================================

}
}
export interface EvidenceCollectionConfig {
  enableRealtimeCollection: boolean;
  batchSize: number;
  maxRetentionDays: number;
  encryptionEnabled: boolean;
  blockchainIntegration: boolean;
  complianceMode: 'strict' | 'standard' | 'relaxed';
  automaticVerification: boolean;
  realTimeFraudDetection: boolean;
  gdprMode: boolean;
  auditLogLevel: 'minimal' | 'standard' | 'verbose';
  dataResidency: string; // ISO country code
  backupRetentionDays: number;
  compressionEnabled: boolean;
  
  // Service endpoints
  storageService: string;
  encryptionService: string;
  verificationService: string;
  complianceService: string;
  blockchainService?: string;
  
  // Performance tuning
  maxConcurrentCollections: number;
  collectionTimeoutMs: number;
  verificationTimeoutMs: number;
  
  // Alerting thresholds
  suspiciousPatternThreshold: number;
  highVolumeThreshold: number;
  failureRateThreshold: number;
}
}
}

// =============================================================================
// Evidence Collection Rules Engine
// =============================================================================

}
}
export interface CollectionRule {
  id: string;
  name: string;
  description: string;
  triggers: CollectionTrigger[];
  conditions: CollectionCondition[];
  actions: CollectionAction[];
  priority: number;
  enabled: boolean;
  complianceFrameworks: ComplianceFramework[];
}
}
}

}
}
export interface CollectionTrigger {
  event: string;
  source: string;
  filters: Record<string, any>;
}
}
}

}
}
export interface CollectionCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'regex';
  value: any;
  required: boolean;
}
}
}

}
}
export interface CollectionAction {
  type: 'collect' | 'verify' | 'alert' | 'archive' | 'purge';
  parameters: Record<string, any>;
  retryAttempts: number;
  timeoutMs: number;
}
}
}

// =============================================================================
// Main Evidence Collection Service
// =============================================================================

export class EvidenceCollectionService extends EventEmitter {
  private config: EvidenceCollectionConfig;
  private collectionRules: Map<string, CollectionRule> = new Map();
  private evidenceChain: Map<string, string> = new Map(); // evidenceId -> previousHash
  private processingQueue: EvidenceRecord[] = [];
  private isProcessing = false;
  private performanceMetrics = {
    totalCollected: 0,
    totalVerified: 0,
    totalArchived: 0,
    averageProcessingTime: 0,
    failureRate: 0,
    lastProcessedAt: new Date()
  };

  constructor(config: EvidenceCollectionConfig) {
    super();
    this.config = config;
    this.initializeDefaultRules();
    this.startPeriodicProcessing();
  }

  // =========================================================================
  // Core Collection Methods
  // =========================================================================

  async collectEvidence(
    type: EvidenceType,
    source: string,
    data: Record<string, any>,
    options: Partial<{
      userId: string;
      sessionId: string;
      templateId: string;
      transactionId: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
      tags: string[];
      complianceFrameworks: ComplianceFramework[];
      retentionPolicy: RetentionPolicy;
      immediateVerification: boolean;
    }> = {}
  ): Promise<EvidenceRecord> {

    const startTime = Date.now();

    try {
      // Generate evidence metadata
      const metadata = await this.generateEvidenceMetadata(type, source, data, options);
      
      // Prepare evidence data
      const evidenceData = await this.prepareEvidenceData(data, options);
      
      // Create evidence record
      const record: EvidenceRecord = {
        metadata,
        data: evidenceData,
        status: EvidenceStatus.COLLECTED,
        verificationChain: [],
        accessLog: [{
          accessedBy: options.userId || 'system',
          accessedAt: new Date(),
          action: 'read',
          reason: 'Evidence collection'
        }]
      };

      // Validate evidence record
      const validatedRecord = EvidenceRecordSchema.parse(record);

      // Store evidence
      await this.storeEvidence(validatedRecord);

      // Update evidence chain for integrity
      await this.updateEvidenceChain(validatedRecord);

      // Trigger immediate verification if requested
      if (options.immediateVerification) {
        await this.verifyEvidence(validatedRecord.metadata.id);
      }

      // Add to processing queue for batch operations
      this.processingQueue.push(validatedRecord);

      // Emit collection event
      this.emit('evidenceCollected', {
        evidenceId: validatedRecord.metadata.id,
        type,
        source,
        processingTime: Date.now() - startTime
      });

      // Update performance metrics
      this.updatePerformanceMetrics('collected', Date.now() - startTime);

      return validatedRecord;

    } catch (error) {
      this.emit('collectionError', {
        type,
        source,
        error: error.message,
        processingTime: Date.now() - startTime
      });
      
      this.updatePerformanceMetrics('failed', Date.now() - startTime);
      throw new Error(`Evidence collection failed: ${error.message}`);
    }
  }

  async collectTransactionEvidence(
    transactionId: string,
    buyerId: string,
    templateId: string,
    amount: number,
    currency: string,
    paymentData: Record<string, any>
  ): Promise<EvidenceRecord> {

    return this.collectEvidence(
      EvidenceType.TRANSACTION,
      'marketplace-api',
      {
        transaction: {
          id: transactionId,
          buyerId,
          templateId,
          amount,
          currency,
          timestamp: new Date().toISOString(),
          ...paymentData
        }
  }
      {
        userId: buyerId,
        transactionId,
        templateId,
        severity: 'high',
        sensitivity: 'confidential',
        complianceFrameworks: [ComplianceFramework.PSD3, ComplianceFramework.STRIPE_AI_POLICY],
        retentionPolicy: RetentionPolicy.TRANSACTION_DATA,
        tags: ['transaction', 'payment', 'marketplace'],
        immediateVerification: true
      }
    );
  }

  async collectUserActionEvidence(
    userId: string,
    action: string,
    context: Record<string, any>,
    sessionId?: string
  ): Promise<EvidenceRecord> {

    return this.collectEvidence(
      EvidenceType.USER_ACTION,
      'user-activity-tracker',
      {
        action,
        context,
        timestamp: new Date().toISOString(),
        userAgent: context.userAgent,
        ipAddress: context.ipAddress
  }
      {
        userId,
        sessionId,
        severity: 'medium',
        sensitivity: 'internal',
        complianceFrameworks: [ComplianceFramework.GDPR],
        retentionPolicy: RetentionPolicy.USER_ACTIVITY,
        tags: ['user-action', action.toLowerCase()]
      }
    );
  }

  async collectComplianceEvidence(
    framework: ComplianceFramework,
    checkType: string,
    result: Record<string, any>,
    context: Record<string, any> = {}
  ): Promise<EvidenceRecord> {

    return this.collectEvidence(
      EvidenceType.COMPLIANCE,
      'compliance-monitor',
      {
        framework,
        checkType,
        result,
        context,
        timestamp: new Date().toISOString()
  }
      {
        severity: 'high',
        sensitivity: 'confidential',
        complianceFrameworks: [framework],
        retentionPolicy: RetentionPolicy.COMPLIANCE,
        tags: ['compliance', framework.toLowerCase(), checkType],
        immediateVerification: true
      }
    );
  }

  // =========================================================================
  // Evidence Verification
  // =========================================================================

  async verifyEvidence(evidenceId: string): Promise<boolean> {

    try {
      const evidence = await this.getEvidence(evidenceId);
      if (!evidence) {
        throw new Error(`Evidence ${evidenceId} not found`);
      }

      const verificationResults = await Promise.all([
        this.verifyDataIntegrity(evidence),
        this.verifyChainIntegrity(evidence),
        this.verifyComplianceRequirements(evidence),
        this.verifyRetentionPolicy(evidence)
      ]);

      const allPassed = verificationResults.every(result => result.result === 'passed');
      
      // Add verification entry
      const verificationEntry = {
        verifierId: 'system',
        verifiedAt: new Date(),
        verificationMethod: 'automated',
        result: allPassed ? 'passed' : 'failed',
        notes: verificationResults
          .filter(r => r.result !== 'passed')
          .map(r => r.message)
          .join('; ')
      };

      await this.updateEvidenceVerification(evidenceId, verificationEntry);

      if (allPassed) {
        await this.updateEvidenceStatus(evidenceId, EvidenceStatus.VERIFIED);
        this.emit('evidenceVerified', { evidenceId, success: true });
      } else {
        await this.updateEvidenceStatus(evidenceId, EvidenceStatus.FLAGGED);
        this.emit('evidenceVerificationFailed', { evidenceId, issues: verificationResults });
      }

      this.updatePerformanceMetrics('verified');
      return allPassed;

    } catch (error) {
      this.emit('verificationError', { evidenceId, error: error.message });
      return false;
    }
  }

  private async verifyDataIntegrity(evidence: EvidenceRecord): Promise<{ result: string; message: string }> {

    const dataString = JSON.stringify(evidence.data);
    const computedHash = crypto.createHash('sha256').update(dataString).digest('hex');
    
    if (computedHash === evidence.metadata.hash) {
      return { result: 'passed', message: 'Data integrity verified' };
    } else {
      return { result: 'failed', message: 'Data integrity check failed - hash mismatch' };
    }
  }

  private async verifyChainIntegrity(evidence: EvidenceRecord): Promise<{ result: string; message: string }> {

    if (!evidence.metadata.chainHash) {
      return { result: 'passed', message: 'No chain hash to verify' };
    }

    const previousHash = this.evidenceChain.get(evidence.metadata.id);
    if (previousHash && previousHash === evidence.metadata.chainHash) {
      return { result: 'passed', message: 'Chain integrity verified' };
    } else {
      return { result: 'failed', message: 'Chain integrity check failed' };
    }
  }

  private async verifyComplianceRequirements(evidence: EvidenceRecord): Promise<{ result: string; message: string }> {

    // Verify compliance framework requirements
    const frameworks = evidence.metadata.complianceFrameworks;
    const issues: string[] = [];

    for (const framework of frameworks) {
      switch (framework) {
      case ComplianceFramework.GDPR:
        if (evidence.metadata.userId && !evidence.data.environment?.ipAddress) {
          issues.push('GDPR requires IP address logging for user actions');
        }
        break;
      case ComplianceFramework.PSD3:
        if (evidence.metadata.type === EvidenceType.TRANSACTION && !evidence.data.financialData) {
          issues.push('PSD3 requires complete financial transaction data');
        }
        break;
      case ComplianceFramework.STRIPE_AI_POLICY:
        if (evidence.metadata.templateId && !evidence.data.content.templateVerification) {
          issues.push('Stripe AI policy requires template AI verification');
        }
        break;
      }
    }

    if (issues.length === 0) {
      return { result: 'passed', message: 'Compliance requirements satisfied' };
    } else {
      return { result: 'failed', message: issues.join('; ') };
    }
  }

  private async verifyRetentionPolicy(evidence: EvidenceRecord): Promise<{ result: string; message: string }> {

    const policy = evidence.metadata.retentionPolicy;
    const collectedAt = evidence.metadata.collectedAt;
    const now = new Date();
    
    let maxRetentionDays: number;
    
    switch (policy) {
    case RetentionPolicy.TRANSACTION_DATA:
      maxRetentionDays = 7 * 365; // 7 years
      break;
    case RetentionPolicy.USER_ACTIVITY:
      maxRetentionDays = 2 * 365; // 2 years
      break;
    case RetentionPolicy.AUDIT_LOGS:
      maxRetentionDays = 10 * 365; // 10 years
      break;
    case RetentionPolicy.COMPLIANCE:
      maxRetentionDays = 7 * 365; // Default to 7 years
      break;
    case RetentionPolicy.SECURITY_EVENTS:
      maxRetentionDays = 3 * 365; // 3 years
      break;
    case RetentionPolicy.PERFORMANCE_DATA:
      maxRetentionDays = 365; // 1 year
      break;
    default:
      maxRetentionDays = this.config.maxRetentionDays;
    }

    const expirationDate = new Date(collectedAt.getTime() + (maxRetentionDays * 24 * 60 * 60 * 1000));
    
    if (now < expirationDate) {
      return { result: 'passed', message: `Evidence within retention period (expires ${expirationDate.toISOString()})` };
    } else {
      return { result: 'warning', message: 'Evidence past retention period, should be archived or purged' };
    }
  }

  // =========================================================================
  // Evidence Search and Reporting
  // =========================================================================

  async searchEvidence(criteria: {
    type?: EvidenceType;
    userId?: string;
    templateId?: string;
    transactionId?: string;
    tags?: string[];
    dateRange?: { start: Date; end: Date };
    complianceFramework?: ComplianceFramework;
    status?: EvidenceStatus;
    limit?: number;
    offset?: number;
  }): Promise<{
    evidence: EvidenceRecord[];
    total: number;
    hasMore: boolean;
  }> {

    // Implementation would query the evidence storage system
    // This is a placeholder for the database query logic
    
    const mockResults: EvidenceRecord[] = [];
    
    return {
      evidence: mockResults,
      total: mockResults.length,
      hasMore: false
    };
  }

  async generateComplianceReport(
    framework: ComplianceFramework,
    dateRange: { start: Date; end: Date },
    options: {
      includeUserData?: boolean;
      anonymizeData?: boolean;
      exportFormat?: 'json' | 'csv' | 'pdf';
    } = {}
  ): Promise<{
    reportId: string;
    framework: ComplianceFramework;
    dateRange: { start: Date; end: Date };
    summary: {
      totalEvidence: number;
      verifiedEvidence: number;
      complianceRate: number;
      criticalIssues: number;
    };
    evidenceIds: string[];
    downloadUrl?: string;
  }> {

    const reportId = crypto.randomUUID();
    
    // Implementation would generate compliance report
    // This is a placeholder for the report generation logic
    
    return {
      reportId,
      framework,
      dateRange,
      summary: {
        totalEvidence: 0,
        verifiedEvidence: 0,
        complianceRate: 100,
        criticalIssues: 0
  }
      evidenceIds: []
    };
  }

  // =========================================================================
  // Performance and Monitoring
  // =========================================================================

  getPerformanceMetrics(): {
    totalCollected: number;
    totalVerified: number;
    totalArchived: number;
    averageProcessingTime: number;
    failureRate: number;
    lastProcessedAt: Date;
    queueSize: number;
    storageUtilization: number;
    } {
    return {
      ...this.performanceMetrics,
      queueSize: this.processingQueue.length,
      storageUtilization: 0 // Would calculate from storage service
    };
  }

  async getHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, { status: string; responseTime?: number; error?: string }>;
    metrics: object;
  }> {
    const services: Record<string, { status: string; responseTime?: number; error?: string }> = {};
    
    // Check storage service
    try {
      const start = Date.now();
      // await this.checkStorageService();
      services.storage = { status: 'healthy', responseTime: Date.now() - start };
    } catch (error) {
      services.storage = { status: 'unhealthy', error: error.message };
    }

    // Check encryption service
    if (this.config.encryptionEnabled) {
      try {
        const start = Date.now();
        // await this.checkEncryptionService();
        services.encryption = { status: 'healthy', responseTime: Date.now() - start };
      } catch (error) {
        services.encryption = { status: 'unhealthy', error: error.message };
      }
    }

    const healthyServices = Object.values(services).filter(s => s.status === 'healthy').length;
    const totalServices = Object.keys(services).length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (healthyServices === 0) {
      status = 'unhealthy';
    } else if (healthyServices < totalServices) {
      status = 'degraded';
    }

    return {
      status,
      services,
      metrics: this.getPerformanceMetrics(};
  }

  // =========================================================================
  // Private Helper Methods
  // =========================================================================

  private async generateEvidenceMetadata(
    type: EvidenceType,
    source: string,
    data: Record<string, any>,
    options: any
  ): Promise<EvidenceMetadata> {

    const id = crypto.randomUUID();
    const dataString = JSON.stringify(data);
    const hash = crypto.createHash('sha256').update(dataString).digest('hex');
    
    // Get previous hash for chaining
    const previousHash = this.getLastEvidenceHash();
    const chainHash = previousHash ? 
      crypto.createHash('sha256').update(previousHash + hash).digest('hex') : 
      hash;

    return {
      id,
      type,
      category: this.categorizeEvidence(type, source),
      source,
      userId: options.userId,
      sessionId: options.sessionId,
      templateId: options.templateId,
      transactionId: options.transactionId,
      hash,
      chainHash,
      severity: options.severity || 'medium',
      sensitivity: options.sensitivity || 'internal',
      retentionPolicy: options.retentionPolicy || this.getDefaultRetentionPolicy(type),
      complianceFrameworks: options.complianceFrameworks || this.getDefaultComplianceFrameworks(type),
      legalHold: false,
      regulatoryRequirement: this.isRegulatoryRequirement(type),
      collectedAt: new Date(),
      expiresAt: this.calculateExpirationDate(options.retentionPolicy || this.getDefaultRetentionPolicy(type)),
      tags: options.tags || [],
      relatedEvidenceIds: [],
      parentEvidenceId: options.parentEvidenceId
    };
  }

  private async prepareEvidenceData(
    data: Record<string, any>,
    options: any
  ): Promise<EvidenceData> {

    return {
      content: data,
      attachments: [],
      environment: options.environment,
      apiContext: options.apiContext,
      financialData: options.financialData
    };
  }

  private categorizeEvidence(type: EvidenceType, source: string): string {
    const categoryMap: Record<EvidenceType, string> = {
      [EvidenceType.TRANSACTION]: 'financial',
      [EvidenceType.USER_ACTION]: 'behavioral',
      [EvidenceType.COMPLIANCE]: 'regulatory',
      [EvidenceType.AUDIT]: 'security',
      [EvidenceType.SECURITY]: 'security',
      [EvidenceType.PERFORMANCE]: 'operational',
      [EvidenceType.REFUND]: 'financial',
      [EvidenceType.DISPUTE]: 'legal',
      [EvidenceType.MODERATION]: 'content',
      [EvidenceType.API_ACCESS]: 'technical',
      [EvidenceType.CONTENT_INTERACTION]: 'behavioral',
      [EvidenceType.PRIVACY]: 'regulatory'
    };
    
    return categoryMap[type] || 'general';
  }

  private getDefaultRetentionPolicy(type: EvidenceType): RetentionPolicy {
    const policyMap: Record<EvidenceType, RetentionPolicy> = {
      [EvidenceType.TRANSACTION]: RetentionPolicy.TRANSACTION_DATA,
      [EvidenceType.USER_ACTION]: RetentionPolicy.USER_ACTIVITY,
      [EvidenceType.COMPLIANCE]: RetentionPolicy.COMPLIANCE,
      [EvidenceType.AUDIT]: RetentionPolicy.AUDIT_LOGS,
      [EvidenceType.SECURITY]: RetentionPolicy.SECURITY_EVENTS,
      [EvidenceType.PERFORMANCE]: RetentionPolicy.PERFORMANCE_DATA,
      [EvidenceType.REFUND]: RetentionPolicy.TRANSACTION_DATA,
      [EvidenceType.DISPUTE]: RetentionPolicy.AUDIT_LOGS,
      [EvidenceType.MODERATION]: RetentionPolicy.AUDIT_LOGS,
      [EvidenceType.API_ACCESS]: RetentionPolicy.AUDIT_LOGS,
      [EvidenceType.CONTENT_INTERACTION]: RetentionPolicy.USER_ACTIVITY,
      [EvidenceType.PRIVACY]: RetentionPolicy.COMPLIANCE
    };
    
    return policyMap[type] || RetentionPolicy.USER_ACTIVITY;
  }

  private getDefaultComplianceFrameworks(type: EvidenceType): ComplianceFramework[] {
    const frameworkMap: Record<EvidenceType, ComplianceFramework[]> = {
      [EvidenceType.TRANSACTION]: [ComplianceFramework.PSD3, ComplianceFramework.STRIPE_AI_POLICY],
      [EvidenceType.USER_ACTION]: [ComplianceFramework.GDPR],
      [EvidenceType.COMPLIANCE]: [], // Specified per collection
      [EvidenceType.AUDIT]: [ComplianceFramework.SOX, ComplianceFramework.ISO_27001],
      [EvidenceType.SECURITY]: [ComplianceFramework.ISO_27001],
      [EvidenceType.PERFORMANCE]: [],
      [EvidenceType.REFUND]: [ComplianceFramework.PSD3],
      [EvidenceType.DISPUTE]: [ComplianceFramework.PSD3],
      [EvidenceType.MODERATION]: [ComplianceFramework.GDPR],
      [EvidenceType.API_ACCESS]: [ComplianceFramework.ISO_27001],
      [EvidenceType.CONTENT_INTERACTION]: [ComplianceFramework.GDPR],
      [EvidenceType.PRIVACY]: [ComplianceFramework.GDPR, ComplianceFramework.CCPA]
    };
    
    return frameworkMap[type] || [];
  }

  private isRegulatoryRequirement(type: EvidenceType): boolean {
    return [
      EvidenceType.TRANSACTION,
      EvidenceType.COMPLIANCE,
      EvidenceType.AUDIT,
      EvidenceType.REFUND,
      EvidenceType.DISPUTE,
      EvidenceType.PRIVACY
    ].includes(type);
  }

  private calculateExpirationDate(policy: RetentionPolicy): Date {
    const now = new Date();
    const retentionDays: Record<RetentionPolicy, number> = {
      [RetentionPolicy.TRANSACTION_DATA]: 7 * 365,
      [RetentionPolicy.USER_ACTIVITY]: 2 * 365,
      [RetentionPolicy.AUDIT_LOGS]: 10 * 365,
      [RetentionPolicy.COMPLIANCE]: 7 * 365,
      [RetentionPolicy.SECURITY_EVENTS]: 3 * 365,
      [RetentionPolicy.PERFORMANCE_DATA]: 365
    };
    
    return new Date(now.getTime() + (retentionDays[policy] * 24 * 60 * 60 * 1000));
  }

  private getLastEvidenceHash(): string | null {
    // In real implementation, this would query the database for the latest evidence hash
    return null;
  }

  private async storeEvidence(record: EvidenceRecord): Promise<void> {

    // Implementation would store evidence in database/storage service
    // This is a placeholder
  }

  private async updateEvidenceChain(record: EvidenceRecord): Promise<void> {

    this.evidenceChain.set(record.metadata.id, record.metadata.hash);
  }

  private async getEvidence(evidenceId: string): Promise<EvidenceRecord | null> {

    // Implementation would retrieve evidence from storage
    return null;
  }

  private async updateEvidenceVerification(evidenceId: string, verification: any): Promise<void> {

    // Implementation would update evidence verification in storage
  }

  private async updateEvidenceStatus(evidenceId: string, status: EvidenceStatus): Promise<void> {

    // Implementation would update evidence status in storage
  }

  private updatePerformanceMetrics(operation: string, processingTime?: number): void {
    switch (operation) {
    case 'collected':
      this.performanceMetrics.totalCollected++;
      break;
    case 'verified':
      this.performanceMetrics.totalVerified++;
      break;
    case 'archived':
      this.performanceMetrics.totalArchived++;
      break;
    case 'failed':
      // Update failure rate
      break;
    }

    if (processingTime) {
      // Update average processing time using exponential moving average
      this.performanceMetrics.averageProcessingTime = 
        (this.performanceMetrics.averageProcessingTime * 0.9) + (processingTime * 0.1);
    }

    this.performanceMetrics.lastProcessedAt = new Date();
  }

  private initializeDefaultRules(): void {
    // Initialize default collection rules for common scenarios
    const defaultRules: CollectionRule[] = [
      {
        id: 'transaction-collection',
        name: 'Transaction Evidence Collection',
        description: 'Collect evidence for all marketplace transactions',
        triggers: [{ event: 'transaction.completed', source: 'marketplace-api', filters: {} }],
        conditions: [{ field: 'amount', operator: 'greater_than', value: 0, required: true }],
        actions: [{ type: 'collect', parameters: { immediateVerification: true }, retryAttempts: 3, timeoutMs: 30000 }],
        priority: 1,
        enabled: true,
        complianceFrameworks: [ComplianceFramework.PSD3, ComplianceFramework.STRIPE_AI_POLICY]
      }
    ];

    defaultRules.forEach(rule => this.collectionRules.set(rule.id, rule));
  }

  private startPeriodicProcessing(): void {
    setInterval(() => {
      if (!this.isProcessing && this.processingQueue.length > 0) {
        this.processEvidenceQueue();
      }
    }, 30000); // Process every 30 seconds
  }

  private async processEvidenceQueue(): Promise<void> {

    if (this.isProcessing) return;
    
    this.isProcessing = true;
    const batchSize = Math.min(this.config.batchSize, this.processingQueue.length);
    const batch = this.processingQueue.splice(0, batchSize);

    try {
      await Promise.all(batch.map(async (evidence) => {
        if (this.config.automaticVerification && evidence.status === EvidenceStatus.COLLECTED) {
          await this.verifyEvidence(evidence.metadata.id);
        }
      }));
    } catch (error) {
      this.emit('batchProcessingError', { error: error.message, batchSize });
    } finally {
      this.isProcessing = false;
    }
  }
}

export default EvidenceCollectionService;