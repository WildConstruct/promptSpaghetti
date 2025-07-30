/**
 * Data Classification Engine
 * 
 * Automated classification system for sensitive data identification
 * and security level assignment based on content, context, and compliance requirements.
 */

// Browser-compatible event emitter
class BrowserEventEmitter {
  private events: Map<string, Function[]> = new Map();
  
  on(event: string, listener: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
  }
  
  emit(event: string, ...args: any[]) {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(...args));
    }
  }
  
  removeAllListeners() {
    this.events.clear();
  }
}

// Classification Levels
export enum ClassificationLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted'
}

// Data Categories  
export enum DataCategory {
  PII = 'pii',
  AUTHENTICATION = 'authentication',
  SYSTEM_CONFIG = 'system_config',
  OPERATIONAL = 'operational',
  BUSINESS = 'business'
}

// Compliance Frameworks
export enum ComplianceFramework {
  GDPR = 'gdpr',
  NIST = 'nist',
  HIPAA = 'hipaa',
  PCI_DSS = 'pci_dss'
}

export interface ClassificationRule {
  id: string;
  name: string;
  description: string;
  category: DataCategory;
  level: ClassificationLevel;
  patterns: RegExp[];
  keywords: string[];
  contextRules?: ContextRule[];
  complianceRequirements: ComplianceFramework[];
  priority: number;
  enabled: boolean;
}

export interface ContextRule {
  field: string;
  condition: 'equals' | 'contains' | 'matches' | 'exists';
  value?: string | RegExp;
}

export interface ClassificationResult {
  level: ClassificationLevel;
  category: DataCategory;
  confidence: number;
  matchedRules: string[];
  complianceRequirements: ComplianceFramework[];
  encryptionRequired: boolean;
  retentionPeriod: string;
  accessControls: string[];
  reasoning: string[];
}

export interface DataElement {
  id: string;
  fieldName: string;
  value: any;
  dataType: string;
  context: Record<string, any>;
  source: string;
  timestamp: Date;
}

export interface ClassificationMetadata {
  classifiedAt: Date;
  classifiedBy: string;
  version: string;
  reviewDate: Date;
  lastModified: Date;
  approvedBy?: string;
}

/**
 * Comprehensive data classification engine
 */
export class DataClassifier extends BrowserEventEmitter {
  private rules: Map<string, ClassificationRule> = new Map();
  private classifications: Map<string, ClassificationResult & ClassificationMetadata> = new Map();

  constructor() {
    super();
    this.initializeDefaultRules();
  }

  /**
   * Classify a data element
   */
  public classify(data: DataElement): ClassificationResult {
    const matchedRules: ClassificationRule[] = [];
    const reasoning: string[] = [];
    
    // Apply classification rules
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;
      
      const matchResult = this.evaluateRule(rule, data);
      if (matchResult.matches) {
        matchedRules.push(rule);
        reasoning.push(...matchResult.reasons);
      }
    }
    
    // Determine final classification
    const result = this.determineClassification(matchedRules, data, reasoning);
    
    // Store classification result
    const metadata: ClassificationMetadata = {
      classifiedAt: new Date(),
      classifiedBy: 'automated',
      version: '1.0',
      reviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      lastModified: new Date()
    };
    
    this.classifications.set(data.id, { ...result, ...metadata });
    
    // Emit classification event
    this.emit('dataClassified', {
      dataId: data.id,
      classification: result,
      metadata
    });
    
    return result;
  }

  /**
   * Bulk classify multiple data elements
   */
  public async classifyBatch(dataElements: DataElement[]): Promise<Map<string, ClassificationResult>> {
    const results = new Map<string, ClassificationResult>();
    
    for (const element of dataElements) {
      try {
        const result = this.classify(element);
        results.set(element.id, result);
      } catch (error) {
        console.error(`Classification failed for ${element.id}:`, error);
        results.set(element.id, this.getDefaultClassification());
      }
    }
    
    this.emit('batchClassificationComplete', {
      total: dataElements.length,
      successful: results.size,
      timestamp: new Date()
    });
    
    return results;
  }

  /**
   * Get classification for a specific data element
   */
  public getClassification(dataId: string): (ClassificationResult & ClassificationMetadata) | null {
    return this.classifications.get(dataId) || null;
  }

  /**
   * Update classification for a data element
   */
  public updateClassification(
    dataId: string,
    newLevel: ClassificationLevel,
    reason: string,
    approvedBy?: string
  ): void {
    const existing = this.classifications.get(dataId);
    if (!existing) {
      throw new Error(`No classification found for data ID: ${dataId}`);
    }
    
    const updated = {
      ...existing,
      level: newLevel,
      lastModified: new Date(),
      approvedBy,
      reasoning: [...existing.reasoning, `Manual update: ${reason}`]
    };
    
    this.classifications.set(dataId, updated);
    
    this.emit('classificationUpdated', {
      dataId,
      oldLevel: existing.level,
      newLevel,
      reason,
      approvedBy,
      timestamp: new Date()
    });
  }

  /**
   * Add or update classification rule
   */
  public addRule(rule: ClassificationRule): void {
    this.rules.set(rule.id, rule);
    this.emit('ruleAdded', {
      ruleId: rule.id,
      name: rule.name,
      level: rule.level,
      timestamp: new Date()
    });
  }

  /**
   * Remove classification rule
   */
  public removeRule(ruleId: string): void {
    const removed = this.rules.delete(ruleId);
    if (removed) {
      this.emit('ruleRemoved', {
        ruleId,
        timestamp: new Date()
      });
    }
  }

  /**
   * Get encryption requirements for classification level
   */
  public getEncryptionRequirements(level: ClassificationLevel): {
    atRest: boolean;
    inTransit: boolean;
    algorithm: string;
    keyRotation: string;
    keyStorage: string;
  } {
    switch (level) {
      case ClassificationLevel.RESTRICTED:
        return {
          atRest: true,
          inTransit: true,
          algorithm: 'AES-256-GCM',
          keyRotation: '90 days',
          keyStorage: 'HSM'
        };
      case ClassificationLevel.CONFIDENTIAL:
        return {
          atRest: true,
          inTransit: true,
          algorithm: 'AES-256-CBC',
          keyRotation: '1 year',
          keyStorage: 'Cloud KMS'
        };
      case ClassificationLevel.INTERNAL:
        return {
          atRest: false,
          inTransit: true,
          algorithm: 'TLS 1.3',
          keyRotation: 'N/A',
          keyStorage: 'Certificate store'
        };
      default:
        return {
          atRest: false,
          inTransit: false,
          algorithm: 'None',
          keyRotation: 'N/A',
          keyStorage: 'N/A'
        };
    }
  }

  /**
   * Get retention requirements for classification level
   */
  public getRetentionRequirements(level: ClassificationLevel, category: DataCategory): {
    period: string;
    disposal: string;
    archival: boolean;
  } {
    if (category === DataCategory.PII) {
      return {
        period: 'As required by GDPR (minimal necessary)',
        disposal: 'Secure deletion with verification',
        archival: false
      };
    }
    
    switch (level) {
      case ClassificationLevel.RESTRICTED:
        return {
          period: '7 years',
          disposal: 'Cryptographic erasure',
          archival: true
        };
      case ClassificationLevel.CONFIDENTIAL:
        return {
          period: '3 years',
          disposal: 'Secure deletion',
          archival: true
        };
      case ClassificationLevel.INTERNAL:
        return {
          period: '1 year',
          disposal: 'Standard deletion',
          archival: false
        };
      default:
        return {
          period: 'As needed',
          disposal: 'Standard deletion',
          archival: false
        };
    }
  }

  // Private helper methods
  private initializeDefaultRules(): void {
    const defaultRules: ClassificationRule[] = [
      // PII - Email addresses
      {
        id: 'pii-email',
        name: 'Email Address Detection',
        description: 'Detects email addresses as PII',
        category: DataCategory.PII,
        level: ClassificationLevel.RESTRICTED,
        patterns: [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/],
        keywords: ['email', 'e-mail', 'mail'],
        complianceRequirements: [ComplianceFramework.GDPR],
        priority: 10,
        enabled: true
      },
      // PII - Phone numbers
      {
        id: 'pii-phone',
        name: 'Phone Number Detection',
        description: 'Detects phone numbers as PII',
        category: DataCategory.PII,
        level: ClassificationLevel.RESTRICTED,
        patterns: [
          /\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/,
          /\+[1-9]\d{1,14}$/
        ],
        keywords: ['phone', 'mobile', 'tel', 'telephone'],
        complianceRequirements: [ComplianceFramework.GDPR],
        priority: 10,
        enabled: true
      },
      // Authentication - Passwords
      {
        id: 'auth-password',
        name: 'Password Hash Detection',
        description: 'Detects password hashes and related data',
        category: DataCategory.AUTHENTICATION,
        level: ClassificationLevel.RESTRICTED,
        patterns: [/\$2[aby]?\$\d+\$.{53}/], // bcrypt hashes
        keywords: ['password', 'hash', 'passwd', 'pwd'],
        complianceRequirements: [ComplianceFramework.NIST],
        priority: 10,
        enabled: true
      },
      // Authentication - TOTP secrets
      {
        id: 'auth-totp',
        name: 'TOTP Secret Detection',
        description: 'Detects TOTP secrets and MFA data',
        category: DataCategory.AUTHENTICATION,
        level: ClassificationLevel.RESTRICTED,
        patterns: [/[A-Z2-7]{32}/], // Base32 TOTP secrets
        keywords: ['totp', 'secret', 'mfa', 'authenticator'],
        complianceRequirements: [ComplianceFramework.NIST],
        priority: 10,
        enabled: true
      },
      // Authentication - Session tokens
      {
        id: 'auth-session',
        name: 'Session Token Detection',
        description: 'Detects session tokens and cookies',
        category: DataCategory.AUTHENTICATION,
        level: ClassificationLevel.RESTRICTED,
        patterns: [
          /[A-Za-z0-9+/]{40}={0,2}/, // Base64 tokens
          /[A-Fa-f0-9]{32,64}/ // Hex tokens
        ],
        keywords: ['session', 'token', 'cookie', 'jwt'],
        complianceRequirements: [ComplianceFramework.NIST],
        priority: 9,
        enabled: true
      },
      // System Configuration - API keys
      {
        id: 'config-api-key',
        name: 'API Key Detection',
        description: 'Detects API keys and service credentials',
        category: DataCategory.SYSTEM_CONFIG,
        level: ClassificationLevel.CONFIDENTIAL,
        patterns: [
          /api[_-]?key[s]?['"\s]*[:=]['"\s]*[A-Za-z0-9+/]{20,}/i,
          /secret[_-]?key['"\s]*[:=]['"\s]*[A-Za-z0-9+/]{20}/i
        ],
        keywords: ['api_key', 'secret_key', 'access_key'],
        complianceRequirements: [ComplianceFramework.NIST],
        priority: 8,
        enabled: true
      },
      // System Configuration - Database credentials
      {
        id: 'config-db-creds',
        name: 'Database Credential Detection',
        description: 'Detects database connection strings and credentials',
        category: DataCategory.SYSTEM_CONFIG,
        level: ClassificationLevel.CONFIDENTIAL,
        patterns: [
          /(?:database|db)[_-]?(?:password|pwd)['"\s]*[:=]['"\s]*[^\s'"]+/i,
          /connectionstring['"\s]*[:=]['"\s]*[^'"]*password[^'"]*['"]/i
        ],
        keywords: ['database', 'connection', 'db_password'],
        complianceRequirements: [ComplianceFramework.NIST],
        priority: 9,
        enabled: true
      },
      // Business Data - Financial information
      {
        id: 'business-financial',
        name: 'Financial Data Detection',
        description: 'Detects financial and payment information',
        category: DataCategory.BUSINESS,
        level: ClassificationLevel.RESTRICTED,
        patterns: [
          /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/, // Credit cards
          /\b\d{3}-\d{2}-\d{4}\b/ // SSN
        ],
        keywords: ['credit_card', 'ssn', 'payment', 'financial'],
        complianceRequirements: [ComplianceFramework.PCI_DSS, ComplianceFramework.GDPR],
        priority: 10,
        enabled: true
      }
    ];
    
    defaultRules.forEach(rule => this.addRule(rule));
  }

  private evaluateRule(rule: ClassificationRule, data: DataElement): {
    matches: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let matches = false;
    
    // Check patterns
    for (const pattern of rule.patterns) {
      if (pattern.test(String(data.value))) {
        matches = true;
        reasons.push(`Matched pattern: ${pattern.source}`);
      }
    }
    
    // Check keywords
    const valueStr = String(data.value).toLowerCase();
    const fieldNameStr = data.fieldName.toLowerCase();
    
    for (const keyword of rule.keywords) {
      if (valueStr.includes(keyword.toLowerCase()) || fieldNameStr.includes(keyword.toLowerCase())) {
        matches = true;
        reasons.push(`Matched keyword: ${keyword}`);
      }
    }
    
    // Check context rules
    if (rule.contextRules) {
      for (const contextRule of rule.contextRules) {
        const contextValue = data.context[contextRule.field];
        let contextMatches = false;
        
        switch (contextRule.condition) {
          case 'equals':
            contextMatches = contextValue === contextRule.value;
            break;
          case 'contains':
            contextMatches = String(contextValue).includes(String(contextRule.value));
            break;
          case 'matches':
            contextMatches = contextRule.value instanceof RegExp && 
                             contextRule.value.test(String(contextValue));
            break;
          case 'exists':
            contextMatches = contextValue !== undefined && contextValue !== null;
            break;
        }
        
        if (contextMatches) {
          matches = true;
          reasons.push(`Context rule matched: ${contextRule.field} ${contextRule.condition} ${contextRule.value}`);
        }
      }
    }
    
    return { matches, reasons };
  }

  private determineClassification(
    matchedRules: ClassificationRule[],
    data: DataElement,
    reasoning: string[]
  ): ClassificationResult {
    if (matchedRules.length === 0) {
      return this.getDefaultClassification();
    }
    
    // Sort by priority and take highest classification level
    matchedRules.sort((a, b) => b.priority - a.priority);
    const highestPriorityRule = matchedRules[0];
    
    const allComplianceRequirements = new Set<ComplianceFramework>();
    matchedRules.forEach(rule => {
      rule.complianceRequirements.forEach(req => allComplianceRequirements.add(req));
    });
    
    // Determine if encryption is required
    const encryptionRequired = highestPriorityRule.level === ClassificationLevel.RESTRICTED ||
                             highestPriorityRule.level === ClassificationLevel.CONFIDENTIAL;
    
    // Get retention period
    const retention = this.getRetentionRequirements(
      highestPriorityRule.level, 
      highestPriorityRule.category
    );
    
    // Determine access controls
    const accessControls = this.getAccessControls(highestPriorityRule.level);
    
    // Calculate confidence based on number and priority of matched rules
    const confidence = Math.min(100,
      (matchedRules.reduce((sum, rule) => sum + rule.priority, 0) / matchedRules.length) * 10
    );
    
    return {
      level: highestPriorityRule.level,
      category: highestPriorityRule.category,
      confidence,
      matchedRules: matchedRules.map(rule => rule.id),
      complianceRequirements: Array.from(allComplianceRequirements),
      encryptionRequired,
      retentionPeriod: retention.period,
      accessControls,
      reasoning
    };
  }

  private getDefaultClassification(): ClassificationResult {
    return {
      level: ClassificationLevel.INTERNAL,
      category: DataCategory.OPERATIONAL,
      confidence: 50,
      matchedRules: [],
      complianceRequirements: [],
      encryptionRequired: false,
      retentionPeriod: '1 year',
      accessControls: ['authenticated-users'],
      reasoning: ['Default classification applied - no specific rules matched']
    };
  }

  private getAccessControls(level: ClassificationLevel): string[] {
    switch (level) {
      case ClassificationLevel.RESTRICTED:
        return [
          'mfa-required',
          'need-to-know',
          'privileged-access-management',
          'dual-authorization',
          'continuous-monitoring'
        ];
      case ClassificationLevel.CONFIDENTIAL:
        return [
          'mfa-required',
          'role-based-access',
          'audit-logging',
          'data-loss-prevention'
        ];
      case ClassificationLevel.INTERNAL:
        return [
          'authenticated-users',
          'role-based-access'
        ];
      default:
        return [];
    }
  }
}

/**
 * Classification policy manager
 */
export class ClassificationPolicyManager {
  private policies: Map<string, ClassificationPolicy> = new Map();

  public addPolicy(policy: ClassificationPolicy): void {
    this.policies.set(policy.id, policy);
  }

  public getPolicy(id: string): ClassificationPolicy | undefined {
    return this.policies.get(id);
  }

  public getAllPolicies(): ClassificationPolicy[] {
    return Array.from(this.policies.values());
  }

  public validateCompliance(
    classification: ClassificationResult,
    policyId: string
  ): ComplianceValidationResult {
    const policy = this.policies.get(policyId);
    if (!policy) {
      throw new Error(`Policy not found: ${policyId}`);
    }
    
    const violations: string[] = [];
    
    // Check encryption requirements
    if (policy.encryptionRequired && !classification.encryptionRequired) {
      violations.push('Encryption required by policy but not enforced');
    }
    
    // Check access controls
    const requiredControls = new Set(policy.requiredAccessControls);
    const appliedControls = new Set(classification.accessControls);
    
    for (const control of requiredControls) {
      if (!appliedControls.has(control)) {
        violations.push(`Missing required access control: ${control}`);
      }
    }
    
    return {
      compliant: violations.length === 0,
      violations,
      policy: policy.id,
      timestamp: new Date()
    };
  }
}

// Supporting interfaces
export interface ClassificationPolicy {
  id: string;
  name: string;
  description: string;
  applicableFrameworks: ComplianceFramework[];
  encryptionRequired: boolean;
  requiredAccessControls: string[];
  retentionRequirements: {
    minimumPeriod: string;
    maximumPeriod: string;
    disposalMethod: string;
  };
  auditRequirements: {
    frequency: string;
    scope: string[];
  };
}

export interface ComplianceValidationResult {
  compliant: boolean;
  violations: string[];
  policy: string;
  timestamp: Date;
}

// Export default instance
export default DataClassifier;