/**
 * Evidence Classification Service
 * 
 * Provides automated and manual classification of audit evidence based on
 * content analysis, metadata inspection, and compliance requirements.
 * Integrates with existing DataClassificationService and AuditEvidenceMapper.
 */

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { DataClassificationService, DataClassification } from './DataClassificationService';
import { AuditEvidenceMapper, EvidenceType, ComplianceFramework } from './AuditEvidenceMapper';
import * as crypto from 'crypto';

// =============================================================================
// Evidence Classification Interfaces
// =============================================================================

}
}
export interface EvidenceClassificationConfig {
  enabled: boolean;
  autoClassificationEnabled: boolean;
  inheritanceEnabled: boolean;
  classificationRules: EvidenceClassificationRule[];
  sensitivityAnalysis: {
    enabled: boolean;
    patterns: SensitivityPattern[];
    scoring: SensitivityScoring;
}
}
  };
  contentAnalysis: {
    enabled: boolean;
    textAnalysisEnabled: boolean;
    metadataAnalysisEnabled: boolean;
    structuralAnalysisEnabled: boolean;
  };
  auditIntegration: {
    enabled: boolean;
    inheritFromRequirement: boolean;
    escalateOnHighRisk: boolean;
  };
  notifications: {
    enabled: boolean;
    notifyOnReclassification: boolean;
    notifyOnHighRisk: boolean;
    notifyOnClassificationFailure: boolean;
  };
}

}
}
export interface EvidenceClassificationRule {
  id: string;
  name: string;
  description: string;
  priority: number;
  enabled: boolean;
  conditions: EvidenceClassificationCondition[];
  classification: DataClassification;
  confidence: number; // 0.0 to 1.0
  evidenceTypes: string[]; // Specific evidence types this rule applies to
  complianceFrameworks: string[]; // Specific frameworks this rule applies to
  actions: ClassificationAction[];
  createdAt: Date;
  updatedAt: Date;
}
}
}

}
}
export interface EvidenceClassificationCondition {
  field: 'content' | 'metadata' | 'filename' | 'size' | 'source' | 'evidence_type' | 'compliance_framework';
  operator: 'contains' | 'matches' | 'equals' | 'gt' | 'lt' | 'in' | 'pattern' | 'exists';
  value: string | number | string[] | RegExp;
  caseSensitive?: boolean;
  weight?: number; // Weight for confidence calculation
}
}
}

}
}
export interface SensitivityPattern {
  id: string;
  name: string;
  pattern: string | RegExp;
  type: 'regex' | 'keyword' | 'semantic';
  sensitivity: DataClassification;
  weight: number;
  description: string;
}
}
}

}
}
export interface SensitivityScoring {
  thresholds: {
    public: number;
    internal: number;
    confidential: number;
    restricted: number;
}
}
  };
  weightingFactors: {
    contentMatch: number;
    metadataMatch: number;
    structuralMatch: number;
    contextMatch: number;
  };
}

}
}
export interface ClassificationAction {
  type: 'notify' | 'encrypt' | 'restrict_access' | 'require_approval' | 'audit_log';
  parameters: Record<string, any>;
}
}
}

}
}
export interface EvidenceClassificationResult {
  evidenceId: string;
  classification: DataClassification;
  confidence: number;
  method: 'automatic' | 'manual' | 'inherited';
  appliedRules: string[];
  sensitivityAnalysis?: SensitivityAnalysisResult;
  recommendations: string[];
  warnings: string[];
  timestamp: Date;
}
}
}

}
}
export interface SensitivityAnalysisResult {
  overallScore: number;
  patterns: {
    patternId: string;
    matches: number;
    score: number;
    locations: string[];
}
}
  }[];
  contentAnalysis: {
    textScore: number;
    metadataScore: number;
    structuralScore: number;
  };
}

}
}
export interface EvidenceItem {
  id: string;
  type: string;
  content: string;
  metadata: Record<string, any>;
  filename?: string;
  size: number;
  source: string;
  complianceFramework?: string;
  auditRequirement?: string;
  classification?: DataClassification;
  classificationMetadata?: {
    classifiedAt: Date;
    classifiedBy: string;
    method: string;
    confidence: number;
}
}
  };
}

// =============================================================================
// Main Service Class
// =============================================================================

export class EvidenceClassificationService {
  private config: EvidenceClassificationConfig;
  private dataClassificationService: DataClassificationService;
  private auditEvidenceMapper: AuditEvidenceMapper;
  
  constructor(
    private databaseService: DatabaseService,
    private redisService: RedisService,
    private auditService: AuditService
  ) {
    this.config = this.getDefaultConfig();
    this.dataClassificationService = new DataClassificationService(
      databaseService, redisService, auditService
    );
    this.auditEvidenceMapper = new AuditEvidenceMapper();
    
    this.initializeService();
  }

  // =============================================================================
  // Public API Methods
  // =============================================================================

  /**
   * Classify evidence item automatically or manually
   */
  async classifyEvidence(
    evidence: EvidenceItem,
    manualClassification?: DataClassification
  ): Promise<EvidenceClassificationResult> {

    try {
      // Manual classification takes precedence
      if (manualClassification) {
        return this.applyManualClassification(evidence, manualClassification);
      }

      // Automatic classification
      if (this.config.autoClassificationEnabled) {
        return await this.performAutomaticClassification(evidence);
      }

      // Fallback to inherited classification
      return this.performInheritedClassification(evidence);

    } catch (error) {
      throw new Error(`Evidence classification failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Bulk classify multiple evidence items
   */
  async classifyEvidenceBulk(evidenceItems: EvidenceItem[]): Promise<EvidenceClassificationResult[]> {

    const results: EvidenceClassificationResult[] = [];
    
    for (const evidence of evidenceItems) {
      try {
        const result = await this.classifyEvidence(evidence);
        results.push(result);
      } catch (error) {
        // Continue with other items, log error
        console.error(`Failed to classify evidence ${evidence.id}:`, error);
        results.push({
          evidenceId: evidence.id,
          classification: 'internal', // Default fallback
          confidence: 0,
          method: 'automatic',
          appliedRules: [],
          recommendations: [],
          warnings: [`Classification failed: ${error instanceof Error ? error.message : String(error)}`],
          timestamp: new Date()
        });
      }
    }
    
    return results;
  }

  /**
   * Re-classify evidence based on updated rules or requirements
   */
  async reclassifyEvidence(evidenceId: string): Promise<EvidenceClassificationResult> {

    const evidence = await this.loadEvidence(evidenceId);
    if (!evidence) {
      throw new Error(`Evidence not found: ${evidenceId}`);
    }

    const result = await this.classifyEvidence(evidence);
    
    // Check if classification changed
    const previousClassification = evidence.classification;
    if (previousClassification && previousClassification !== result.classification) {
      if (this.config.notifications.notifyOnReclassification) {
        await this.notifyClassificationChange(evidenceId, previousClassification, result.classification);
      }
    }
    
    return result;
  }

  /**
   * Get classification recommendations for evidence
   */
  async getClassificationRecommendations(evidence: EvidenceItem): Promise<{
    recommended: DataClassification;
    alternatives: DataClassification[];
    reasoning: string[];
    confidence: number;
  }> {

    const analysis = await this.performSensitivityAnalysis(evidence);
    const matchingRules = await this.findMatchingRules(evidence);
    
    const recommendations = this.generateRecommendations(analysis, matchingRules);
    
    return {
      recommended: recommendations.primary,
      alternatives: recommendations.alternatives,
      reasoning: recommendations.reasoning,
      confidence: recommendations.confidence
    };
  }

  /**
   * Update classification configuration
   */
  async updateConfig(config: Partial<EvidenceClassificationConfig>): Promise<void> {

    this.config = { ...this.config, ...config };
    await this.saveConfig();
  }

  /**
   * Add new classification rule
   */
  async addClassificationRule(
    rule: Omit<EvidenceClassificationRule,
    'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {

    const newRule: EvidenceClassificationRule = {
      ...rule,
      id: this.generateRuleId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.config.classificationRules.push(newRule);
    await this.saveConfig();
    
    return newRule.id;
  }

  // =============================================================================
  // Core Classification Methods
  // =============================================================================

  private async performAutomaticClassification(evidence: EvidenceItem): Promise<EvidenceClassificationResult> {

    const analysisResults = await Promise.all([
      this.performSensitivityAnalysis(evidence),
      this.performContentAnalysis(evidence),
      this.performComplianceAnalysis(evidence)
    ]);

    const [sensitivityAnalysis, contentAnalysis, complianceAnalysis] = analysisResults;
    const matchingRules = await this.findMatchingRules(evidence);
    
    // Calculate weighted classification
    const classification = this.calculateWeightedClassification(
      sensitivityAnalysis,
      contentAnalysis,
      complianceAnalysis,
      matchingRules
    );

    return {
      evidenceId: evidence.id,
      classification: classification.classification,
      confidence: classification.confidence,
      method: 'automatic',
      appliedRules: matchingRules.map(rule => rule.id),
      sensitivityAnalysis,
      recommendations: classification.recommendations,
      warnings: classification.warnings,
      timestamp: new Date(};
  }

  private async performSensitivityAnalysis(evidence: EvidenceItem): Promise<SensitivityAnalysisResult> {

    const patterns = this.config.sensitivityAnalysis.patterns;
    const contentMatches: unknown[] = [];
    let overallScore = 0;

    // Analyze content against sensitivity patterns
    for (const pattern of patterns) {
      const matches = this.findPatternMatches(evidence.content, pattern);
      if (matches.length > 0) {
        const score = matches.length * pattern.weight;
        contentMatches.push({
          patternId: pattern.id,
          matches: matches.length,
          score,
          locations: matches
        });
        overallScore += score;
      }
    }

    // Analyze metadata
    const metadataScore = this.analyzeMetadataSensitivity(evidence.metadata);
    
    // Analyze structural elements
    const structuralScore = this.analyzeStructuralSensitivity(evidence);

    return {
      overallScore,
      patterns: contentMatches,
      contentAnalysis: {
        textScore: overallScore,
        metadataScore,
        structuralScore
      }
    };
  }

  private async performContentAnalysis(evidence: EvidenceItem): Promise<unknown> {

    if (!this.config.contentAnalysis.enabled) {
      return { enabled: false };
    }

    const analysis: unknown = {
      enabled: true,
      textAnalysis: null,
      metadataAnalysis: null,
      structuralAnalysis: null
    };

    if (this.config.contentAnalysis.textAnalysisEnabled) {
      analysis.textAnalysis = this.analyzeTextContent(evidence.content);
    }

    if (this.config.contentAnalysis.metadataAnalysisEnabled) {
      analysis.metadataAnalysis = this.analyzeMetadataContent(evidence.metadata);
    }

    if (this.config.contentAnalysis.structuralAnalysisEnabled) {
      analysis.structuralAnalysis = this.analyzeStructuralContent(evidence);
    }

    return analysis;
  }

  private async performComplianceAnalysis(evidence: EvidenceItem): Promise<unknown> {

    if (!evidence.complianceFramework) {
      return { applicable: false };
    }

    // Get evidence type requirements
    const evidenceType = await this.auditEvidenceMapper.evidenceTypes.get(evidence.type);
    if (!evidenceType) {
      return { applicable: false, error: 'Unknown evidence type' };
    }

    // Determine classification based on compliance requirements
    const requiredClassification = this.getComplianceRequiredClassification(
      evidence.complianceFramework,
      evidenceType
    );

    return {
      applicable: true,
      framework: evidence.complianceFramework,
      evidenceType: evidence.type,
      requiredClassification,
      sensitivity: evidenceType.sensitivity
    };
  }

  private async findMatchingRules(evidence: EvidenceItem): Promise<EvidenceClassificationRule[]> {

    const matchingRules: EvidenceClassificationRule[] = [];

    for (const rule of this.config.classificationRules) {
      if (!rule.enabled) continue;

      // Check if rule applies to this evidence type
      if (rule.evidenceTypes.length > 0 && !rule.evidenceTypes.includes(evidence.type)) {
        continue;
      }

      // Check if rule applies to this compliance framework
      if (rule.complianceFrameworks.length > 0 && evidence.complianceFramework && 
          !rule.complianceFrameworks.includes(evidence.complianceFramework)) {
        continue;
      }

      // Check all conditions
      const conditionsMet = rule.conditions.every(condition => 
        this.evaluateCondition(evidence, condition)
      );

      if (conditionsMet) {
        matchingRules.push(rule);
      }
    }

    // Sort by priority
    return matchingRules.sort((a, b) => b.priority - a.priority);
  }

  private calculateWeightedClassification(
    sensitivityAnalysis: SensitivityAnalysisResult,
    contentAnalysis: unknown,
    complianceAnalysis: unknown,
    matchingRules: EvidenceClassificationRule[]
  ): {
    classification: DataClassification;
    confidence: number;
    recommendations: string[];
    warnings: string[];
  } {
    const classifications: { [key in DataClassification]: number } = {
      public: 0,
      internal: 0,
      confidential: 0,
      restricted: 0
    };

    const recommendations: string[] = [];
    const warnings: string[] = [];

    // Weight from sensitivity analysis
    const sensitivityWeight = this.mapScoreToClassification(sensitivityAnalysis.overallScore);
    classifications[sensitivityWeight.classification] += sensitivityWeight.confidence;

    // Weight from matching rules
    for (const rule of matchingRules) {
      classifications[rule.classification] += rule.confidence;
    }

    // Weight from compliance analysis
    if (complianceAnalysis.applicable && complianceAnalysis.requiredClassification) {
      classifications[complianceAnalysis.requiredClassification] += 0.9;
      recommendations.push(`Compliance framework ${complianceAnalysis.framework} recommends ${complianceAnalysis.requiredClassification}`);
    }

    // Find the highest weighted classification
    const maxWeight = Math.max(...Object.values(classifications));
    const finalClassification = Object.entries(classifications)
      .find(([_, weight]) => weight === maxWeight)?.[0] as DataClassification || 'internal';

    // Calculate confidence based on distribution
    const totalWeight = Object.values(classifications).reduce((sum, weight) => sum + weight, 0);
    const confidence = totalWeight > 0 ? maxWeight / totalWeight : 0;

    // Generate warnings for low confidence
    if (confidence < 0.7) {
      warnings.push(`Low classification confidence (${Math.round(confidence * 100)}%). Manual review recommended.`);
    }

    return {
      classification: finalClassification,
      confidence,
      recommendations,
      warnings
    };
  }

  // =============================================================================
  // Helper Methods
  // =============================================================================

  private applyManualClassification(
    evidence: EvidenceItem,
    classification: DataClassification
  ): EvidenceClassificationResult {
    return {
      evidenceId: evidence.id,
      classification,
      confidence: 1.0,
      method: 'manual',
      appliedRules: [],
      recommendations: [],
      warnings: [],
      timestamp: new Date(};
  }

  private performInheritedClassification(evidence: EvidenceItem): EvidenceClassificationResult {
    // Try to inherit from audit requirement or evidence type
    let inheritedClassification: DataClassification = 'internal'; // Default
    
    if (evidence.auditRequirement) {
      // Inherit from audit requirement
      inheritedClassification = this.getAuditRequirementClassification(evidence.auditRequirement);
    } else if (evidence.type) {
      // Inherit from evidence type
      inheritedClassification = this.getEvidenceTypeClassification(evidence.type);
    }

    return {
      evidenceId: evidence.id,
      classification: inheritedClassification,
      confidence: 0.8,
      method: 'inherited',
      appliedRules: [],
      recommendations: [`Classification inherited from ${evidence.auditRequirement ? 'audit requirement' : 'evidence type'}`],
      warnings: [],
      timestamp: new Date(};
  }

  private findPatternMatches(content: string, pattern: SensitivityPattern): string[] {
    const matches: string[] = [];
    
    try {
      if (pattern.type === 'regex') {
        const regex = pattern.pattern instanceof RegExp ? pattern.pattern : new RegExp(pattern.pattern as string, 'gi');
        const regexMatches = content.match(regex);
        if (regexMatches) {
          matches.push(...regexMatches);
        }
      } else if (pattern.type === 'keyword') {
        const keywords = Array.isArray(pattern.pattern) ? pattern.pattern : [pattern.pattern];
        for (const keyword of keywords) {
          if (content.toLowerCase().includes(keyword.toString().toLowerCase())) {
            matches.push(keyword.toString());
          }
        }
      }
    } catch (error) {
      console.warn(`Pattern matching failed for pattern ${pattern.id}:`, error);
    }
    
    return matches;
  }

  private analyzeMetadataSensitivity(metadata: Record<string, any>): number {
    let score = 0;
    
    // Common sensitive metadata fields
    const sensitiveFields = ['ssn', 'credit_card', 'password', 'token', 'key', 'secret'];
    
    for (const [key, value] of Object.entries(metadata)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        score += 0.5;
      }
      
      if (typeof value === 'string' && value.length > 0) {
        // Check for patterns in metadata values
        if (this.containsSensitivePattern(value)) {
          score += 0.3;
        }
      }
    }
    
    return Math.min(score, 1.0);
  }

  private analyzeStructuralSensitivity(evidence: EvidenceItem): number {
    let score = 0;
    
    // File size indicators
    if (evidence.size > 10485760) { // > 10MB
      score += 0.1;
    }
    
    // Source indicators
    if (evidence.source) {
      const secureSourcePatterns = ['secure', 'protected', 'encrypted', 'vault'];
      if (secureSourcePatterns.some(pattern => evidence.source.toLowerCase().includes(pattern))) {
        score += 0.3;
      }
    }
    
    return Math.min(score, 1.0);
  }

  private analyzeTextContent(content: string): unknown {
    return {
      length: content.length,
      wordCount: content.split(/\s+/).length,
      hasNumbers: /\d/.test(content),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(content),
      entropy: this.calculateEntropy(content)
    };
  }

  private analyzeMetadataContent(metadata: Record<string, any>): unknown {
    return {
      fieldCount: Object.keys(metadata).length,
      hasNestedObjects: Object.values(metadata).some(v => typeof v === 'object'),
      sensitiveFieldCount: this.countSensitiveFields(metadata)
    };
  }

  private analyzeStructuralContent(evidence: EvidenceItem): unknown {
    return {
      hasFilename: !!evidence.filename,
      fileExtension: evidence.filename ? evidence.filename.split('.').pop() : null,
      sizeCategory: this.categorizeSizeType(evidence.size)
    };
  }

  private evaluateCondition(evidence: EvidenceItem, condition: EvidenceClassificationCondition): boolean {
    let fieldValue: Error;
    
    switch (condition.field) {
    case 'content':
      fieldValue = evidence.content;
      break;
    case 'metadata':
      fieldValue = JSON.stringify(evidence.metadata);
      break;
    case 'filename':
      fieldValue = evidence.filename || '';
      break;
    case 'size':
      fieldValue = evidence.size;
      break;
    case 'source':
      fieldValue = evidence.source;
      break;
    case 'evidence_type':
      fieldValue = evidence.type;
      break;
    case 'compliance_framework':
      fieldValue = evidence.complianceFramework || '';
      break;
    default:
      return false;
    }

    return this.evaluateOperator(fieldValue, condition.operator, condition.value, condition.caseSensitive);
  }

  private evaluateOperator(
    fieldValue: Error,
    operator: string,
    conditionValue: Error,
    caseSensitive: boolean = true
  ): boolean {
    const normalize = (val: string) => caseSensitive ? val : val.toLowerCase();
    
    switch (operator) {
    case 'contains':
      return normalize(String(fieldValue)).includes(normalize(String(conditionValue)));
    case 'equals':
      return String(fieldValue) === String(conditionValue);
    case 'matches':
      const regex = conditionValue instanceof RegExp ? conditionValue : new RegExp(conditionValue);
      return regex.test(String(fieldValue));
    case 'gt':
      return Number(fieldValue) > Number(conditionValue);
    case 'lt':
      return Number(fieldValue) < Number(conditionValue);
    case 'in':
      const values = Array.isArray(conditionValue) ? conditionValue : [conditionValue];
      return values.includes(fieldValue);
    case 'exists':
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
    default:
      return false;
    }
  }

  private mapScoreToClassification(score: number): { classification: DataClassification; confidence: number } {
    const thresholds = this.config.sensitivityAnalysis.scoring.thresholds;
    
    if (score >= thresholds.restricted) {
      return { classification: 'restricted', confidence: 0.9 };
    } else if (score >= thresholds.confidential) {
      return { classification: 'confidential', confidence: 0.8 };
    } else if (score >= thresholds.internal) {
      return { classification: 'internal', confidence: 0.7 };
    } else {
      return { classification: 'public', confidence: 0.6 };
    }
  }

  private generateRecommendations(
    analysis: SensitivityAnalysisResult,
    matchingRules: EvidenceClassificationRule[]
  ): {
    primary: DataClassification;
    alternatives: DataClassification[];
    reasoning: string[];
    confidence: number;
  } {
    const classifications = new Map<DataClassification, number>();
    const reasoning: string[] = [];

    // Add reasoning from sensitivity analysis
    if (analysis.overallScore > 0) {
      const mapped = this.mapScoreToClassification(analysis.overallScore);
      classifications.set(mapped.classification, mapped.confidence);
      reasoning.push(`Sensitivity analysis suggests ${mapped.classification} (score: ${analysis.overallScore.toFixed(2)})`);
    }

    // Add reasoning from matching rules
    for (const rule of matchingRules) {
      const current = classifications.get(rule.classification) || 0;
      classifications.set(rule.classification, Math.max(current, rule.confidence));
      reasoning.push(`Rule "${rule.name}" recommends ${rule.classification} (confidence: ${rule.confidence})`);
    }

    const sorted = Array.from(classifications.entries())
      .sort((a, b) => b[1] - a[1]);

    return {
      primary: sorted[0]?.[0] || 'internal',
      alternatives: sorted.slice(1).map(([classification]) => classification),
      reasoning,
      confidence: sorted[0]?.[1] || 0.5
    };
  }

  // =============================================================================
  // Utility Methods
  // =============================================================================

  private containsSensitivePattern(text: string): boolean {
    const patterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // Credit card
      /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2
}/ // Email
    ];
    
    return patterns.some(pattern => pattern.test(text));
  }

  private calculateEntropy(text: string): number {
    const charFreq: { [key: string]: number } = {};
    
    for (const char of text) {
      charFreq[char] = (charFreq[char] || 0) + 1;
    }
    
    const textLength = text.length;
    let entropy = 0;
    
    for (const count of Object.values(charFreq)) {
      const probability = count / textLength;
      entropy -= probability * Math.log2(probability);
    }
    
    return entropy;
  }

  private countSensitiveFields(metadata: Record<string, any>): number {
    const sensitiveFieldNames = ['password', 'token', 'key', 'secret', 'ssn', 'credit_card'];
    return Object.keys(metadata).filter(key => 
      sensitiveFieldNames.some(sensitive => key.toLowerCase().includes(sensitive))
    ).length;
  }

  private categorizeSizeType(size: number): string {
    if (size < 1024) return 'tiny';
    if (size < 10240) return 'small';
    if (size < 102400) return 'medium';
    if (size < 1048576) return 'large';
    return 'huge';
  }

  private generateRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getComplianceRequiredClassification(
    frameworkId: string,
    evidenceType: EvidenceType
  ): DataClassification {
    // Map compliance requirements to classifications
    if (frameworkId === 'hipaa-1996' || frameworkId === 'gdpr-2018') {
      return 'confidential'; // Healthcare and privacy data
    }
    if (frameworkId === 'soc2-2017') {
      return evidenceType.sensitivity as DataClassification || 'internal';
    }
    return evidenceType.sensitivity as DataClassification || 'internal';
  }

  private getAuditRequirementClassification(__requirementId: string): DataClassification {
    // This would typically query the audit requirements
    return 'internal'; // Default
  }

  private getEvidenceTypeClassification(evidenceType: string): DataClassification {
    const evidenceTypeObj = this.auditEvidenceMapper.evidenceTypes?.get?.(evidenceType);
    return evidenceTypeObj?.sensitivity as DataClassification || 'internal';
  }

  private async loadEvidence(__evidenceId: string): Promise<EvidenceItem | null> {

    // This would load from database
    // Implementation depends on evidence storage schema
    return null;
  }

  private async notifyClassificationChange(
    evidenceId: string,
    oldClassification: DataClassification,
    newClassification: DataClassification
  ): Promise<void> {

    await this.auditService.logActivity({
      type: 'evidence_reclassification',
      details: {
        evidenceId,
        oldClassification,
        newClassification,
        timestamp: new Date()
      }
    });
  }

  private async saveConfig(): Promise<void> {

    // Save configuration to persistent storage
    await this.databaseService.query(
      'INSERT OR REPLACE INTO evidence_classification_config (id, config) VALUES (1, ?)',
      [JSON.stringify(this.config)]
    );
  }

  private async loadConfig(): Promise<void> {

    const result = await this.databaseService.query(
      'SELECT config FROM evidence_classification_config WHERE id = 1'
    );
    
    if (result.length > 0) {
      this.config = { ...this.config, ...JSON.parse(result[0].config) };
    }
  }

  private initializeService(): void {
    this.loadConfig().catch(error => {
      console.warn('Failed to load classification config:', error);
    });
  }

  private getDefaultConfig(): EvidenceClassificationConfig {
    return {
      enabled: true,
      autoClassificationEnabled: true,
      inheritanceEnabled: true,
      classificationRules: [],
      sensitivityAnalysis: {
        enabled: true,
        patterns: [
          {
            id: 'ssn_pattern',
            name: 'Social Security Number',
            pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
            type: 'regex',
            sensitivity: 'restricted',
            weight: 1.0,
            description: 'Detects US Social Security Numbers'
  }
          {
            id: 'cc_pattern',
            name: 'Credit Card Number',
            pattern: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
            type: 'regex',
            sensitivity: 'restricted',
            weight: 1.0,
            description: 'Detects credit card numbers'
  }
          {
            id: 'email_pattern',
            name: 'Email Address',
            pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2
}/g,
            type: 'regex',
            sensitivity: 'confidential',
            weight: 0.6,
            description: 'Detects email addresses'
          }
        ],
        scoring: {
          thresholds: {
            public: 0.0,
            internal: 0.3,
            confidential: 0.7,
            restricted: 1.0
  }
          weightingFactors: {
            contentMatch: 0.4,
            metadataMatch: 0.2,
            structuralMatch: 0.2,
            contextMatch: 0.2
          }
        }
  }
      contentAnalysis: {
        enabled: true,
        textAnalysisEnabled: true,
        metadataAnalysisEnabled: true,
        structuralAnalysisEnabled: true
  }
      auditIntegration: {
        enabled: true,
        inheritFromRequirement: true,
        escalateOnHighRisk: true
  }
      notifications: {
        enabled: true,
        notifyOnReclassification: true,
        notifyOnHighRisk: true,
        notifyOnClassificationFailure: true
      }
    };
  }
}

export default EvidenceClassificationService;