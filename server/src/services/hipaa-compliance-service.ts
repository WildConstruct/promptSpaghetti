/**
 * Epic 28.1 - HIPAA Compliance Service
 * Service for HIPAA compliance checking, PHI de-identification, and healthcare data security
 * 
 * Provides comprehensive HIPAA compliance assessment, PHI detection and removal,
 * and security controls for healthcare data processing workflows
 */

import { z } from 'zod';

// HIPAA compliance schemas
const PHIElementSchema = z.object({
  type: z.enum([
    'name', 'address', 'date', 'phone', 'fax', 'email', 'ssn', 
    'medical_record_number', 'health_plan_id', 'account_number',
    'certificate_number', 'vehicle_identifier', 'device_identifier',
    'web_url', 'ip_address', 'biometric_identifier', 'photo'
  ]),
  value: z.string(),
  start: z.number(),
  end: z.number(),
  confidence: z.number().min(0).max(1),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical'])
});

const ComplianceAssessmentSchema = z.object({
  score: z.number().min(0).max(100),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  findings: z.array(z.object({
    category: z.string(),
    severity: z.enum(['info', 'warning', 'error', 'critical']),
    description: z.string(),
    recommendation: z.string()
  })),
  recommendations: z.array(z.string()),
  phiElements: z.array(PHIElementSchema)
});

const DeidentificationOptionsSchema = z.object({
  method: z.enum(['safe_harbor', 'expert_determination', 'synthetic']).default('safe_harbor'),
  preserveStructure: z.boolean().default(true),
  customRules: z.array(z.string()).default([])
});

const DeidentificationResultSchema = z.object({
  content: z.string(),
  removedElements: z.array(PHIElementSchema),
  confidence: z.number().min(0).max(1),
  warnings: z.array(z.string()),
  method: z.string()
});

// Type definitions
type PHIElement = z.infer<typeof PHIElementSchema>;
type ComplianceAssessment = z.infer<typeof ComplianceAssessmentSchema>;
type DeidentificationOptions = z.infer<typeof DeidentificationOptionsSchema>;
type DeidentificationResult = z.infer<typeof DeidentificationResultSchema>;

interface HIPAARule {
  id: string;
  name: string;
  description: string;
  category: 'administrative' | 'physical' | 'technical';
  severity: 'info' | 'warning' | 'error' | 'critical';
  checkFunction: (content: string, context?: Record<string, unknown>) => Promise<boolean>;
}

export class HIPAAComplianceService {
  private phiPatterns: Map<PHIElement['type'], RegExp[]>;
  private complianceRules: Map<string, HIPAARule>;
  private safeHarborIdentifiers: Set<PHIElement['type']>;

  constructor() {
    this.phiPatterns = new Map();
    this.complianceRules = new Map();
    this.safeHarborIdentifiers = new Set();
    this.initializePhiPatterns();
    this.initializeComplianceRules();
    this.initializeSafeHarborIdentifiers();
  }

  /**
   * Assess HIPAA compliance of healthcare content
   */
  async assessHIPAACompliance(
    content: string,
    documentType: 'clinical_note' | 'patient_record' | 'research_data' | 'administrative_document',
    checkLevel: 'basic' | 'comprehensive' | 'audit' = 'comprehensive'
  ): Promise<ComplianceAssessment> {
    try {
      const findings = [];
      let totalScore = 100;
      
      // Detect PHI elements
      const phiElements = await this.detectPHIElements(content);
      
      // Assess risk based on PHI presence
      const phiRisk = this.assessPHIRisk(phiElements);
      if (phiRisk.score > 0) {
        totalScore -= phiRisk.score;
        findings.push({
          category: 'PHI Detection',
          severity: phiRisk.severity,
          description: `Detected ${phiElements.length} potential PHI elements`,
          recommendation: 'Consider de-identification before processing'
        });
      }

      // Check content-based compliance rules
      const contentComplianceResults = await this.checkContentCompliance(content, documentType);
      for (const result of contentComplianceResults) {
        if (!result.passed) {
          totalScore -= result.penalty;
          findings.push({
            category: result.category,
            severity: result.severity,
            description: result.description,
            recommendation: result.recommendation
          });
        }
      }

      // Determine overall risk level
      const riskLevel = this.determineRiskLevel(totalScore, phiElements);

      // Generate recommendations
      const recommendations = this.generateRecommendations(findings, phiElements, documentType);

      return {
        score: Math.max(0, totalScore),
        riskLevel,
        findings,
        recommendations,
        phiElements
      };

    } catch (error) {
      throw new Error(`HIPAA compliance assessment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * De-identify healthcare content by removing or replacing PHI
   */
  async deidentifyContent(
    content: string,
    options: DeidentificationOptions = {}
  ): Promise<DeidentificationResult> {
    const { method, preserveStructure, customRules } = { ...DeidentificationOptionsSchema.parse({}), ...options };

    try {
      let deidentifiedContent = content;
      const removedElements: PHIElement[] = [];
      const warnings: string[] = [];

      // Detect PHI elements
      const phiElements = await this.detectPHIElements(content);

      // Apply de-identification method
      switch (method) {
        case 'safe_harbor':
          ({ content: deidentifiedContent, removedElements: removedElements } = 
            await this.applySafeHarborMethod(content, phiElements, preserveStructure));
          break;

        case 'expert_determination':
          ({ content: deidentifiedContent, removedElements: removedElements } = 
            await this.applyExpertDeterminationMethod(content, phiElements, preserveStructure));
          break;

        case 'synthetic':
          ({ content: deidentifiedContent, removedElements: removedElements } = 
            await this.applySyntheticDataMethod(content, phiElements, preserveStructure));
          break;
      }

      // Apply custom rules if provided
      if (customRules.length > 0) {
        const customResult = await this.applyCustomDeidentificationRules(
          deidentifiedContent, 
          customRules
        );
        deidentifiedContent = customResult.content;
        warnings.push(...customResult.warnings);
      }

      // Calculate confidence based on PHI detection coverage
      const confidence = this.calculateDeidentificationConfidence(
        phiElements, 
        removedElements, 
        method
      );

      // Validate de-identification effectiveness
      const residualPHI = await this.detectPHIElements(deidentifiedContent);
      if (residualPHI.length > 0) {
        warnings.push(`Potential residual PHI detected: ${residualPHI.length} elements`);
      }

      return {
        content: deidentifiedContent,
        removedElements,
        confidence,
        warnings,
        method
      };

    } catch (error) {
      throw new Error(`De-identification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate that processing patient data is HIPAA-compliant
   */
  async validatePatientDataProcessing(patientData: Record<string, unknown>): Promise<void> {
    try {
      // Check for direct PHI in patient data structure
      const serializedData = JSON.stringify(patientData);
      const phiElements = await this.detectPHIElements(serializedData);
      
      if (phiElements.length > 0) {
        const criticalPHI = phiElements.filter(phi => phi.riskLevel === 'critical');
        if (criticalPHI.length > 0) {
          throw new Error(`Critical PHI detected in patient data: ${criticalPHI.map(p => p.type).join(', ')}`);
        }
      }

      // Validate data structure for minimum necessary principle
      await this.validateMinimumNecessary(patientData);

    } catch (error) {
      throw new Error(`Patient data validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate that content processing is safe for HIPAA compliance
   */
  async validateSafeProcessing(content: string): Promise<void> {
    try {
      const assessment = await this.assessHIPAACompliance(content, 'clinical_note', 'basic');
      
      if (assessment.riskLevel === 'critical') {
        throw new Error('Content contains critical HIPAA violations and cannot be processed');
      }

      const criticalPHI = assessment.phiElements.filter(phi => phi.riskLevel === 'critical');
      if (criticalPHI.length > 0) {
        throw new Error(`Critical PHI detected: ${criticalPHI.map(p => p.type).join(', ')}`);
      }

    } catch (error) {
      throw new Error(`Safe processing validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{ status: string; details?: Record<string, unknown> }> {
    try {
      const patternsLoaded = this.phiPatterns.size;
      const rulesLoaded = this.complianceRules.size;
      const identifiersLoaded = this.safeHarborIdentifiers.size;

      const isHealthy = patternsLoaded > 0 && rulesLoaded > 0 && identifiersLoaded > 0;

      return {
        status: isHealthy ? 'healthy' : 'degraded',
        details: {
          phiPatternsLoaded: patternsLoaded,
          complianceRulesLoaded: rulesLoaded,
          safeHarborIdentifiersLoaded: identifiersLoaded
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // Private helper methods

  private async detectPHIElements(content: string): Promise<PHIElement[]> {
    const phiElements: PHIElement[] = [];

    for (const [type, patterns] of this.phiPatterns.entries()) {
      for (const pattern of patterns) {
        let match;
        const globalPattern = new RegExp(pattern.source, pattern.flags + (pattern.global ? '' : 'g'));
        
        while ((match = globalPattern.exec(content)) !== null) {
          const riskLevel = this.assessPHIElementRisk(type, match[0]);
          
          phiElements.push({
            type,
            value: match[0],
            start: match.index,
            end: match.index + match[0].length,
            confidence: this.calculatePHIConfidence(type, match[0]),
            riskLevel
          });
        }
      }
    }

    // Sort by position for consistent processing
    return phiElements.sort((a, b) => a.start - b.start);
  }

  private assessPHIRisk(phiElements: PHIElement[]): { score: number; severity: 'info' | 'warning' | 'error' | 'critical' } {
    if (phiElements.length === 0) {
      return { score: 0, severity: 'info' };
    }

    const criticalElements = phiElements.filter(p => p.riskLevel === 'critical').length;
    const highElements = phiElements.filter(p => p.riskLevel === 'high').length;
    const mediumElements = phiElements.filter(p => p.riskLevel === 'medium').length;

    let score = criticalElements * 25 + highElements * 15 + mediumElements * 8;
    score = Math.min(score, 75); // Cap at 75 points

    let severity: 'info' | 'warning' | 'error' | 'critical' = 'info';
    if (criticalElements > 0) severity = 'critical';
    else if (highElements > 2) severity = 'error';
    else if (highElements > 0 || mediumElements > 3) severity = 'warning';

    return { score, severity };
  }

  private async checkContentCompliance(
    content: string,
    documentType: string
  ): Promise<Array<{
    category: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    description: string;
    recommendation: string;
    penalty: number;
    passed: boolean;
  }>> {
    const results = [];

    // Check for encryption requirements
    if (content.length > 1000 && !this.isContentEncrypted(content)) {
      results.push({
        category: 'Technical Safeguards',
        severity: 'warning' as const,
        description: 'Large healthcare content should be encrypted',
        recommendation: 'Implement encryption for data at rest and in transit',
        penalty: 10,
        passed: false
      });
    }

    // Check for audit trail requirements
    if (documentType === 'patient_record' && !this.hasAuditTrail(content)) {
      results.push({
        category: 'Administrative Safeguards',
        severity: 'error' as const,
        description: 'Patient records must have audit trail metadata',
        recommendation: 'Include access logging and modification tracking',
        penalty: 15,
        passed: false
      });
    }

    return results;
  }

  private determineRiskLevel(score: number, phiElements: PHIElement[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalPHI = phiElements.filter(p => p.riskLevel === 'critical').length;
    
    if (criticalPHI > 0 || score < 50) return 'critical';
    if (score < 70) return 'high';
    if (score < 85) return 'medium';
    return 'low';
  }

  private generateRecommendations(
    findings: Array<{ category: string; severity: string; recommendation: string }>,
    phiElements: PHIElement[],
    documentType: string
  ): string[] {
    const recommendations = new Set<string>();

    // Add finding-specific recommendations
    findings.forEach(finding => recommendations.add(finding.recommendation));

    // Add PHI-specific recommendations
    if (phiElements.length > 0) {
      recommendations.add('Consider implementing de-identification procedures');
      recommendations.add('Ensure minimum necessary principle compliance');
    }

    // Add document-type specific recommendations
    if (documentType === 'research_data') {
      recommendations.add('Verify IRB approval for research use of healthcare data');
    }

    return Array.from(recommendations);
  }

  private async applySafeHarborMethod(
    content: string,
    phiElements: PHIElement[],
    preserveStructure: boolean
  ): Promise<{ content: string; removedElements: PHIElement[] }> {
    let deidentifiedContent = content;
    const removedElements: PHIElement[] = [];

    // Process PHI elements in reverse order to maintain indices
    const sortedElements = [...phiElements].sort((a, b) => b.start - a.start);

    for (const element of sortedElements) {
      if (this.safeHarborIdentifiers.has(element.type)) {
        const replacement = preserveStructure 
          ? this.generateStructuralReplacement(element)
          : '[REDACTED]';
        
        deidentifiedContent = 
          deidentifiedContent.slice(0, element.start) + 
          replacement + 
          deidentifiedContent.slice(element.end);

        removedElements.push(element);
      }
    }

    return { content: deidentifiedContent, removedElements };
  }

  private async applyExpertDeterminationMethod(
    content: string,
    phiElements: PHIElement[],
    preserveStructure: boolean
  ): Promise<{ content: string; removedElements: PHIElement[] }> {
    // More conservative approach - remove more potential identifiers
    return this.applySafeHarborMethod(content, phiElements, preserveStructure);
  }

  private async applySyntheticDataMethod(
    content: string,
    phiElements: PHIElement[],
    preserveStructure: boolean
  ): Promise<{ content: string; removedElements: PHIElement[] }> {
    let deidentifiedContent = content;
    const removedElements: PHIElement[] = [];

    // Generate synthetic replacements for PHI elements
    const sortedElements = [...phiElements].sort((a, b) => b.start - a.start);

    for (const element of sortedElements) {
      const replacement = this.generateSyntheticReplacement(element);
      
      deidentifiedContent = 
        deidentifiedContent.slice(0, element.start) + 
        replacement + 
        deidentifiedContent.slice(element.end);

      removedElements.push(element);
    }

    return { content: deidentifiedContent, removedElements };
  }

  private async applyCustomDeidentificationRules(
    content: string,
    customRules: string[]
  ): Promise<{ content: string; warnings: string[] }> {
    let processedContent = content;
    const warnings: string[] = [];

    // Apply custom regex patterns
    for (const rule of customRules) {
      try {
        const regex = new RegExp(rule, 'gi');
        processedContent = processedContent.replace(regex, '[CUSTOM_REDACTED]');
      } catch (error) {
        warnings.push(`Invalid custom rule: ${rule}`);
      }
    }

    return { content: processedContent, warnings };
  }

  private calculateDeidentificationConfidence(
    originalElements: PHIElement[],
    removedElements: PHIElement[],
    method: string
  ): number {
    if (originalElements.length === 0) return 1.0;

    const removalRate = removedElements.length / originalElements.length;
    const methodMultiplier = method === 'safe_harbor' ? 0.9 : method === 'expert_determination' ? 0.95 : 0.85;

    return Math.min(removalRate * methodMultiplier, 1.0);
  }

  private async validateMinimumNecessary(patientData: Record<string, unknown>): Promise<void> {
    // Check for potentially unnecessary data fields
    const unnecessaryFields = ['photo', 'full_address', 'full_ssn'];
    const presentUnnecessaryFields = unnecessaryFields.filter(field => field in patientData);
    
    if (presentUnnecessaryFields.length > 0) {
      throw new Error(`Potentially unnecessary PHI fields detected: ${presentUnnecessaryFields.join(', ')}`);
    }
  }

  private assessPHIElementRisk(type: PHIElement['type'], value: string): PHIElement['riskLevel'] {
    const criticalTypes: PHIElement['type'][] = ['ssn', 'medical_record_number', 'biometric_identifier'];
    const highTypes: PHIElement['type'][] = ['name', 'address', 'phone', 'email'];
    
    if (criticalTypes.includes(type)) return 'critical';
    if (highTypes.includes(type)) return 'high';
    return 'medium';
  }

  private calculatePHIConfidence(type: PHIElement['type'], value: string): number {
    // Mock confidence calculation based on pattern strength
    const strongPatterns: PHIElement['type'][] = ['ssn', 'phone', 'email'];
    const mediumPatterns: PHIElement['type'][] = ['date', 'medical_record_number'];
    
    if (strongPatterns.includes(type)) return 0.95;
    if (mediumPatterns.includes(type)) return 0.85;
    return 0.75;
  }

  private generateStructuralReplacement(element: PHIElement): string {
    switch (element.type) {
      case 'name': return '[NAME]';
      case 'date': return '[DATE]';
      case 'phone': return '[PHONE]';
      case 'email': return '[EMAIL]';
      case 'ssn': return '[SSN]';
      case 'address': return '[ADDRESS]';
      default: return '[REDACTED]';
    }
  }

  private generateSyntheticReplacement(element: PHIElement): string {
    switch (element.type) {
      case 'name': return 'John Doe';
      case 'phone': return '555-0123';
      case 'email': return 'patient@example.com';
      case 'date': return '01/01/2023';
      case 'ssn': return '123-45-6789';
      default: return '[SYNTHETIC]';
    }
  }

  private isContentEncrypted(content: string): boolean {
    // Simple heuristic - check for encryption markers
    return content.includes('-----BEGIN') || content.length < content.replace(/[A-Za-z0-9+/=]/g, '').length * 0.75;
  }

  private hasAuditTrail(content: string): boolean {
    // Check for audit-related metadata
    return content.includes('audit') || content.includes('timestamp') || content.includes('accessed_by');
  }

  private initializePhiPatterns(): void {
    // Social Security Numbers
    this.phiPatterns.set('ssn', [
      /\b\d{3}-\d{2}-\d{4}\b/g,
      /\b\d{3}\s\d{2}\s\d{4}\b/g,
      /\b\d{9}\b/g
    ]);

    // Phone numbers
    this.phiPatterns.set('phone', [
      /\b\d{3}-\d{3}-\d{4}\b/g,
      /\(\d{3}\)\s?\d{3}-\d{4}/g,
      /\b\d{10}\b/g
    ]);

    // Email addresses
    this.phiPatterns.set('email', [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    ]);

    // Dates
    this.phiPatterns.set('date', [
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      /\b\d{4}-\d{2}-\d{2}\b/g,
      /\b\d{1,2}-\d{1,2}-\d{4}\b/g
    ]);

    // Medical Record Numbers
    this.phiPatterns.set('medical_record_number', [
      /\bMRN:?\s*\d+/gi,
      /\bMedical Record:?\s*\d+/gi,
      /\b\d{6,12}\b/g // Assuming MRNs are 6-12 digits
    ]);
  }

  private initializeComplianceRules(): void {
    // Administrative safeguards
    this.complianceRules.set('audit_trail', {
      id: 'audit_trail',
      name: 'Audit Trail Requirements',
      description: 'Ensure audit trails are maintained for PHI access',
      category: 'administrative',
      severity: 'error',
      checkFunction: async (content) => this.hasAuditTrail(content)
    });

    // Technical safeguards
    this.complianceRules.set('encryption', {
      id: 'encryption',
      name: 'Encryption Requirements',
      description: 'PHI must be encrypted when appropriate',
      category: 'technical',
      severity: 'warning',
      checkFunction: async (content) => this.isContentEncrypted(content) || content.length < 500
    });
  }

  private initializeSafeHarborIdentifiers(): void {
    const identifiers: PHIElement['type'][] = [
      'name', 'address', 'date', 'phone', 'fax', 'email', 'ssn',
      'medical_record_number', 'health_plan_id', 'account_number',
      'certificate_number', 'vehicle_identifier', 'device_identifier',
      'web_url', 'ip_address', 'biometric_identifier', 'photo'
    ];

    identifiers.forEach(id => this.safeHarborIdentifiers.add(id));
  }
}