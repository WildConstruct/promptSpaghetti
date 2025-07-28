/**
 * Classification Handling Rules Service
 * 
 * Implements handling rules and requirements for different data classification levels.
 * Enforces storage, transmission, processing, and monitoring requirements.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import { 
  DataClassificationLevel, 
  HandlingRequirements,
  StorageRequirements,
  TransmissionRequirements,
  ProcessingRequirements,
  AccessRequirements,
  MonitoringRequirements,
  CachingRestrictions,
  OperationContext,
  ValidationResult
} from '../types/DataClassification';

export interface HandlingRule {
  id: string;
  name: string;
  description: string;
  classification: DataClassificationLevel;
  ruleType: 'STORAGE' | 'TRANSMISSION' | 'PROCESSING' | 'ACCESS' | 'MONITORING' | 'RETENTION';
  requirements: Record<string, any>;
  mandatory: boolean;
  priority: number;
  effectiveDate: Date;
  expirationDate?: Date;
  complianceFramework: string[];
}

export interface HandlingRuleViolation {
  id: string;
  ruleId: string;
  ruleName: string;
  classification: DataClassificationLevel;
  violationType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  detectedAt: Date;
  context: OperationContext;
  evidence: Record<string, any>;
  remediation: string[];
  status: 'OPEN' | 'INVESTIGATING' | 'REMEDIATED' | 'ACCEPTED_RISK';
}

export interface ComplianceCheck {
  ruleId: string;
  dataElement: string;
  classification: DataClassificationLevel;
  checkType: string;
  passed: boolean;
  details: Record<string, any>;
  timestamp: Date;
}

export class ClassificationHandlingRulesService {
  private handlingRequirements: Map<DataClassificationLevel, HandlingRequirements> = new Map();
  private handlingRules: Map<string, HandlingRule> = new Map();
  private violations: HandlingRuleViolation[] = [];
  private complianceChecks: ComplianceCheck[] = [];
  constructor() {
    this.initializeDefaultHandlingRequirements();
    this.initializeDefaultHandlingRules();
  }
  /**
   * Initialize default handling requirements for each classification level
   */
  private initializeDefaultHandlingRequirements(): void {
    const requirements: Record<DataClassificationLevel, HandlingRequirements> = {
      PUBLIC: {,
        storage: {,
          encryptionRequired: false,
          encryptionAlgorithm: 'none',
          keyRotationDays: 0,
          accessControls: ['read'],
          backupEncryption: false,
          retentionDays: 365,
          approvedLocations: ['any'],
          redundancyLevel: 'NONE',
        },
        transmission: {,
          tlsVersion: 'TLS1.2',
          certificatePinning: false,
          networkRestrictions: [],
          loggingLevel: 'STANDARD',
          compressionAllowed: true,
          endToEndEncryption: false,
        },
        processing: {,
          approvedEnvironments: ['dev', 'staging', 'production'],
          loggingRequired: false,
          cachingRestrictions: {,
            allowed: true,
            encryptionRequired: false,
            maxTtlSeconds: 3600,
            purgeOnAccess: false,
            secureEviction: false,
          },
          thirdPartyProcessing: true,
          isolationRequired: false,
          auditTrailRequired: false,
        },
        access: {,
          authenticationLevel: 'STANDARD',
          authorizationRequired: false,
          approvalWorkflow: false,
          timeRestrictions: false,
          purposeLimitation: false,
          auditLogging: 'STANDARD',
          exportRestrictions: false,
        },
        monitoring: {,
          alertingEnabled: false,
          anomalyDetection: false,
          alertThreshold: 'LOW',
          realtimeMonitoring: false,
          complianceChecks: false,
          incidentResponse: false,
        }
      },
      INTERNAL: {,
        storage: {,
          encryptionRequired: true,
          encryptionAlgorithm: 'AES-256',
          keyRotationDays: 90,
          accessControls: ['authenticated_read', 'authenticated_write'],
          backupEncryption: true,
          retentionDays: 2555, // 7 years
          approvedLocations: ['internal_datacenter', 'approved_cloud'],
          redundancyLevel: 'STANDARD',
        },
        transmission: {,
          tlsVersion: 'TLS1.3',
          certificatePinning: true,
          networkRestrictions: ['internal_network'],
          loggingLevel: 'ENHANCED',
          compressionAllowed: false,
          endToEndEncryption: true,
        },
        processing: {,
          approvedEnvironments: ['production', 'staging'],
          loggingRequired: true,
          cachingRestrictions: {,
            allowed: true,
            encryptionRequired: true,
            maxTtlSeconds: 1800,
            purgeOnAccess: true,
            secureEviction: true,
          },
          thirdPartyProcessing: false,
          isolationRequired: true,
          auditTrailRequired: true,
        },
        access: {,
          authenticationLevel: 'STANDARD',
          authorizationRequired: true,
          approvalWorkflow: false,
          timeRestrictions: false,
          purposeLimitation: true,
          auditLogging: 'ENHANCED',
          exportRestrictions: true,
        },
        monitoring: {,
          alertingEnabled: true,
          anomalyDetection: true,
          alertThreshold: 'MEDIUM',
          realtimeMonitoring: false,
          complianceChecks: true,
          incidentResponse: true,
        }
      },
      CONFIDENTIAL: {,
        storage: {,
          encryptionRequired: true,
          encryptionAlgorithm: 'AES-256-GCM',
          keyRotationDays: 30,
          accessControls: ['mfa_authenticated_read', 'mfa_authenticated_write', 'approval_required'],
          backupEncryption: true,
          retentionDays: 2555, // 7 years
          approvedLocations: ['secure_datacenter'],
          redundancyLevel: 'HIGH',
        },
        transmission: {,
          tlsVersion: 'TLS1.3',
          certificatePinning: true,
          networkRestrictions: ['secure_network', 'vpn_required'],
          loggingLevel: 'COMPREHENSIVE',
          compressionAllowed: false,
          endToEndEncryption: true,
        },
        processing: {,
          approvedEnvironments: ['production'],
          loggingRequired: true,
          cachingRestrictions: {,
            allowed: false,
            encryptionRequired: true,
            maxTtlSeconds: 300,
            purgeOnAccess: true,
            secureEviction: true,
          },
          thirdPartyProcessing: false,
          isolationRequired: true,
          auditTrailRequired: true,
        },
        access: {,
          authenticationLevel: 'MFA',
          authorizationRequired: true,
          approvalWorkflow: true,
          timeRestrictions: true,
          purposeLimitation: true,
          auditLogging: 'ENHANCED',
          exportRestrictions: true,
        },
        monitoring: {,
          alertingEnabled: true,
          anomalyDetection: true,
          alertThreshold: 'HIGH',
          realtimeMonitoring: true,
          complianceChecks: true,
          incidentResponse: true,
        }
      },
      RESTRICTED: {,
        storage: {,
          encryptionRequired: true,
          encryptionAlgorithm: 'AES-256-GCM',
          keyRotationDays: 7,
          accessControls: ['strong_mfa_authenticated_read', 'strong_mfa_authenticated_write', 'dual_approval_required'],
          backupEncryption: true,
          retentionDays: 2555, // 7 years
          approvedLocations: ['air_gapped_datacenter'],
          redundancyLevel: 'CRITICAL',
        },
        transmission: {,
          tlsVersion: 'TLS1.3',
          certificatePinning: true,
          networkRestrictions: ['air_gapped_network', 'dedicated_channel'],
          loggingLevel: 'COMPREHENSIVE',
          compressionAllowed: false,
          endToEndEncryption: true,
        },
        processing: {,
          approvedEnvironments: ['isolated_production'],
          loggingRequired: true,
          cachingRestrictions: {,
            allowed: false,
            encryptionRequired: true,
            maxTtlSeconds: 0,
            purgeOnAccess: true,
            secureEviction: true,
          },
          thirdPartyProcessing: false,
          isolationRequired: true,
          auditTrailRequired: true,
        },
        access: {,
          authenticationLevel: 'STRONG_MFA',
          authorizationRequired: true,
          approvalWorkflow: true,
          timeRestrictions: true,
          purposeLimitation: true,
          auditLogging: 'REALTIME',
          exportRestrictions: true,
        },
        monitoring: {,
          alertingEnabled: true,
          anomalyDetection: true,
          alertThreshold: 'CRITICAL',
          realtimeMonitoring: true,
          complianceChecks: true,
          incidentResponse: true,
        }
      }
    };
    Object.entries(requirements).forEach(([level, req]) => {
      this.handlingRequirements.set(level as DataClassificationLevel, req);
    });
  }
  /**
   * Initialize default handling rules
   */
  private initializeDefaultHandlingRules(): void {
    const rules: HandlingRule[] = [
      {
        id: 'rule-storage-encryption-internal',
        name: 'Internal Data Storage Encryption',
        description: 'All internal data must be encrypted at rest using AES-256',
        classification: 'INTERNAL',
        ruleType: 'STORAGE',
        requirements: {,
          encryptionRequired: true,
          encryptionAlgorithm: 'AES-256',
          keyManagement: 'enterprise_kms',
        },
        mandatory: true,
        priority: 1,
        effectiveDate: new Date('2024-01-01'),
        complianceFramework: ['SOC2', 'ISO27001']
      },
      {
        id: 'rule-transmission-tls-confidential',
        name: 'Confidential Data Transmission Security',
        description: 'Confidential data must use TLS 1.3 with certificate pinning',
        classification: 'CONFIDENTIAL',
        ruleType: 'TRANSMISSION',
        requirements: {,
          tlsVersion: 'TLS1.3',
          certificatePinning: true,
          endToEndEncryption: true,
        },
        mandatory: true,
        priority: 1,
        effectiveDate: new Date('2024-01-01'),
        complianceFramework: ['GDPR', 'HIPAA']
      },
      {
        id: 'rule-processing-isolation-restricted',
        name: 'Restricted Data Processing Isolation',
        description: 'Restricted data must be processed in isolated environments',
        classification: 'RESTRICTED',
        ruleType: 'PROCESSING',
        requirements: {,
          isolationRequired: true,
          approvedEnvironments: ['isolated_production'],
          thirdPartyProcessing: false,
        },
        mandatory: true,
        priority: 1,
        effectiveDate: new Date('2024-01-01'),
        complianceFramework: ['FedRAMP', 'FISMA']
      },
      {
        id: 'rule-access-mfa-confidential',
        name: 'Confidential Data MFA Requirement',
        description: 'Access to confidential data requires multi-factor authentication',
        classification: 'CONFIDENTIAL',
        ruleType: 'ACCESS',
        requirements: {,
          authenticationLevel: 'MFA',
          approvalWorkflow: true,
        },
        mandatory: true,
        priority: 1,
        effectiveDate: new Date('2024-01-01'),
        complianceFramework: ['SOC2', 'GDPR']
      },
      {
        id: 'rule-monitoring-realtime-restricted',
        name: 'Restricted Data Real-time Monitoring',
        description: 'Access to restricted data must be monitored in real-time',
        classification: 'RESTRICTED',
        ruleType: 'MONITORING',
        requirements: {,
          realtimeMonitoring: true,
          alertThreshold: 'CRITICAL',
          incidentResponse: true,
        },
        mandatory: true,
        priority: 1,
        effectiveDate: new Date('2024-01-01'),
        complianceFramework: ['FedRAMP', 'FISMA']
      }
    ];
    rules.forEach(rule => {)
      this.handlingRules.set(rule.id, rule);
    });
  }
  /**
   * Get handling requirements for a classification level
   */
  getHandlingRequirements(classification: DataClassificationLevel): HandlingRequirements | undefined {
    return this.handlingRequirements.get(classification);
  }
  /**
   * Validate data handling against requirements
   */
  async validateDataHandling()
    dataId: string,
    classification: DataClassificationLevel,
    operation: string,
    context: OperationContext,
  ): Promise<ValidationResult> {
    const requirements = this.handlingRequirements.get(classification);
    if (!requirements) {
      return {
        valid: false,
        errors: [`No handling requirements found for classification: ${classification}`],}
        warnings: [],
        recommendations: [],
      };
    }
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    // Validate storage requirements
    const storageValidation = this.validateStorageRequirements(requirements.storage, context);
    errors.push(...storageValidation.errors);
    warnings.push(...storageValidation.warnings);
    // Validate transmission requirements
    const transmissionValidation = this.validateTransmissionRequirements(requirements.transmission, context);
    errors.push(...transmissionValidation.errors);
    warnings.push(...transmissionValidation.warnings);
    // Validate processing requirements
    const processingValidation = this.validateProcessingRequirements(requirements.processing, context);
    errors.push(...processingValidation.errors);
    warnings.push(...processingValidation.warnings);
    // Validate monitoring requirements
    const monitoringValidation = this.validateMonitoringRequirements(requirements.monitoring, context);
    errors.push(...monitoringValidation.errors);
    warnings.push(...monitoringValidation.warnings);
    // Record compliance check
    const complianceCheck: ComplianceCheck = {
      ruleId: `validation-${classification}`,}
      dataElement: dataId,
      classification,
      checkType: operation,
      passed: errors.length === 0,
      details: { errors, warnings, context },
      timestamp: new Date(),
    };
    this.complianceChecks.push(complianceCheck);
    // Generate violations if there are errors
    if (errors.length > 0) {
      await this.recordViolations(dataId, classification, errors, context);
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      recommendations
    };
  }
  /**
   * Validate storage requirements
   */
  private validateStorageRequirements(requirements: StorageRequirements, context: OperationContext): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    // Check encryption requirements
    if (requirements.encryptionRequired) {
      const hasEncryption = this.checkEncryptionCompliance(context);
      if (!hasEncryption) {
        errors.push('Data storage encryption is required but not detected');
      }
    }
    // Check approved locations
    if (requirements.approvedLocations.length > 0 && !requirements.approvedLocations.includes('any')) {
      const isLocationApproved = this.checkLocationCompliance(requirements.approvedLocations, context);
      if (!isLocationApproved) {
        errors.push(`Data must be stored in approved locations: ${requirements.approvedLocations.join(', ')}`);}
      }
    }
    // Check backup encryption
    if (requirements.backupEncryption) {
      const hasBackupEncryption = this.checkBackupEncryptionCompliance(context);
      if (!hasBackupEncryption) {
        warnings.push('Backup encryption is required');
      }
    }
    return { valid: errors.length === 0, errors, warnings, recommendations: [] };
  }
  /**
   * Validate transmission requirements
   */
  private validateTransmissionRequirements()
    requirements: TransmissionRequirements,
    context: OperationContext,
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    // Check TLS version
    const tlsCompliance = this.checkTLSCompliance(requirements.tlsVersion, context);
    if (!tlsCompliance) {
      errors.push(`TLS version ${requirements.tlsVersion} or higher is required`);}
    }
    // Check certificate pinning
    if (requirements.certificatePinning) {
      const hasCertPinning = this.checkCertificatePinningCompliance(context);
      if (!hasCertPinning) {
        errors.push('Certificate pinning is required for transmission');
      }
    }
    // Check end-to-end encryption
    if (requirements.endToEndEncryption) {
      const hasE2EEncryption = this.checkEndToEndEncryptionCompliance(context);
      if (!hasE2EEncryption) {
        errors.push('End-to-end encryption is required for transmission');
      }
    }
    // Check network restrictions
    if (requirements.networkRestrictions.length > 0) {
      const networkCompliance = this.checkNetworkRestrictionCompliance(requirements.networkRestrictions, context);
      if (!networkCompliance) {
        errors.push(`Transmission must use approved networks: ${requirements.networkRestrictions.join(', ')}`);}
      }
    }
    return { valid: errors.length === 0, errors, warnings, recommendations: [] };
  }
  /**
   * Validate processing requirements
   */
  private validateProcessingRequirements()
    requirements: ProcessingRequirements,
    context: OperationContext,
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    // Check approved environments
    if (!requirements.approvedEnvironments.includes(context.environment)) {
      errors.push(`Processing must occur in approved environments: ${requirements.approvedEnvironments.join(', ')}`);}
    }
    // Check isolation requirements
    if (requirements.isolationRequired) {
      const hasIsolation = this.checkIsolationCompliance(context);
      if (!hasIsolation) {
        errors.push('Data processing must occur in isolated environment');
      }
    }
    // Check third-party processing restrictions
    if (!requirements.thirdPartyProcessing) {
      const hasThirdPartyProcessing = this.checkThirdPartyProcessingCompliance(context);
      if (hasThirdPartyProcessing) {
        errors.push('Third-party processing is not allowed for this data classification');
      }
    }
    // Check caching restrictions
    if (!requirements.cachingRestrictions.allowed) {
      const hasCaching = this.checkCachingCompliance(context);
      if (hasCaching) {
        errors.push('Data caching is not allowed for this classification');
      }
    }
    return { valid: errors.length === 0, errors, warnings, recommendations: [] };
  }
  /**
   * Validate monitoring requirements
   */
  private validateMonitoringRequirements()
    requirements: MonitoringRequirements,
    context: OperationContext,
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    // Check real-time monitoring
    if (requirements.realtimeMonitoring) {
      const hasRealtimeMonitoring = this.checkRealtimeMonitoringCompliance(context);
      if (!hasRealtimeMonitoring) {
        warnings.push('Real-time monitoring should be enabled for this classification');
      }
    }
    // Check anomaly detection
    if (requirements.anomalyDetection) {
      const hasAnomalyDetection = this.checkAnomalyDetectionCompliance(context);
      if (!hasAnomalyDetection) {
        warnings.push('Anomaly detection should be enabled for this classification');
      }
    }
    return { valid: errors.length === 0, errors, warnings, recommendations: [] };
  }
  /**
   * Record handling rule violations
   */
  private async recordViolations()
    dataId: string,
    classification: DataClassificationLevel,
    errors: string[],
    context: OperationContext,
  ): Promise<void> {
    for (const error of errors) {
      const violation: HandlingRuleViolation = {
        id: `violation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,}
        ruleId: `handling-${classification}`,}
        ruleName: `${classification} Data Handling Requirements`,}
        classification,
        violationType: 'HANDLING_REQUIREMENT_VIOLATION',
        severity: this.getSeverityForClassification(classification),
        description: error,
        detectedAt: new Date(),
        context,
        evidence: {,
          dataId,
          operation: context.operation,
          environment: context.environment,
        },
        remediation: this.getRemediationSteps(error),
        status: 'OPEN',
      };
      this.violations.push(violation);
    }
  }
  /**
   * Get severity level based on classification
   */
  private getSeverityForClassification(classification: DataClassificationLevel): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const severityMap: Record<DataClassificationLevel, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = {
      PUBLIC: 'LOW',
      INTERNAL: 'MEDIUM',
      CONFIDENTIAL: 'HIGH',
      RESTRICTED: 'CRITICAL',
    };
    return severityMap[classification];
  }
  /**
   * Get remediation steps for error
   */
  private getRemediationSteps(error: string): string[] {
    if (error.includes('encryption')) {
      return [
        'Enable encryption for data at rest',
        'Configure proper key management',
        'Verify encryption algorithms meet requirements'
      ];
    }
    if (error.includes('TLS') || error.includes('transmission')) {
      return [
        'Upgrade to required TLS version',
        'Enable certificate pinning',
        'Configure end-to-end encryption'
      ];
    }
    if (error.includes('environment') || error.includes('processing')) {
      return [
        'Move processing to approved environment',
        'Enable environment isolation',
        'Disable third-party processing'
      ];
    }
    return ['Review compliance requirements and update configuration'];
  }
  // Compliance check methods (simplified for demonstration)
  private checkEncryptionCompliance(context: OperationContext): boolean {
    // In real implementation, this would check encryption status
    return context.environment === 'production';
  }
  private checkLocationCompliance(approvedLocations: string[], context: OperationContext): boolean {
    // In real implementation, this would check data location
    return approvedLocations.includes('internal_datacenter') || approvedLocations.includes('approved_cloud');
  }
  private checkBackupEncryptionCompliance(context: OperationContext): boolean {
    // In real implementation, this would check backup encryption
    return context.environment === 'production';
  }
  private checkTLSCompliance(requiredVersion: string, context: OperationContext): boolean {
    // In real implementation, this would check TLS configuration
    return context.environment === 'production';
  }
  private checkCertificatePinningCompliance(context: OperationContext): boolean {
    // In real implementation, this would check certificate pinning
    return context.environment === 'production';
  }
  private checkEndToEndEncryptionCompliance(context: OperationContext): boolean {
    // In real implementation, this would check E2E encryption
    return context.environment === 'production';
  }
  private checkNetworkRestrictionCompliance(restrictions: string[], context: OperationContext): boolean {
    // In real implementation, this would check network configuration
    return context.environment === 'production';
  }
  private checkIsolationCompliance(context: OperationContext): boolean {
    // In real implementation, this would check environment isolation
    return context.environment === 'production' || context.environment === 'isolated_production';
  }
  private checkThirdPartyProcessingCompliance(context: OperationContext): boolean {
    // In real implementation, this would check for third-party processing
    return false; // Assume no third-party processing
  }
  private checkCachingCompliance(context: OperationContext): boolean {
    // In real implementation, this would check caching configuration
    return false; // Assume no caching for restricted data
  }
  private checkRealtimeMonitoringCompliance(context: OperationContext): boolean {
    // In real implementation, this would check monitoring configuration
    return context.environment === 'production';
  }
  private checkAnomalyDetectionCompliance(context: OperationContext): boolean {
    // In real implementation, this would check anomaly detection
    return context.environment === 'production';
  }
  /**
   * Get all handling rules for a classification level
   */
  getHandlingRules(classification?: DataClassificationLevel): HandlingRule[] {
    if (classification) {
      return Array.from(this.handlingRules.values()).filter(rule => rule.classification === classification);
    }
    return Array.from(this.handlingRules.values());
  }
  /**
   * Get all violations
   */
  getViolations(classification?: DataClassificationLevel): HandlingRuleViolation[] {
    if (classification) {
      return this.violations.filter(violation => violation.classification === classification);
    }
    return this.violations;
  }
  /**
   * Get compliance checks
   */
  getComplianceChecks(classification?: DataClassificationLevel): ComplianceCheck[] {
    if (classification) {
      return this.complianceChecks.filter(check => check.classification === classification);
    }
    return this.complianceChecks;
  }
  /**
   * Add custom handling rule
   */
  addHandlingRule(rule: HandlingRule): void {
    this.handlingRules.set(rule.id, rule);
  }
  /**
   * Update handling requirements for a classification level
   */
  updateHandlingRequirements(classification: DataClassificationLevel, requirements: HandlingRequirements): void {
    this.handlingRequirements.set(classification, requirements);
  }
  /**
   * Get compliance score for a classification level
   */
  getComplianceScore(classification: DataClassificationLevel): number {
    const checks = this.getComplianceChecks(classification);
    if (checks.length === 0) return 100;
    const passedChecks = checks.filter(check => check.passed).length;
    return Math.round((passedChecks / checks.length) * 100);
  }
}

export default ClassificationHandlingRulesService;