/**
 * Classification-Based Encryption Policy Service
 * 
 * Implements encryption policies and requirements based on data classification levels.
 * Manages encryption algorithms, key management, and compliance validation.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import { 
  DataClassificationLevel, 
  EncryptionRequirements,
  OperationContext,
  ValidationResult
} from '../types/DataClassification';

export interface EncryptionPolicy {
  id: string;
  name: string;
  description: string;
  classification: DataClassificationLevel;
  requirements: EncryptionRequirements;
  algorithms: EncryptionAlgorithm;
  keyManagement: KeyManagementPolicy;
  complianceFrameworks: string;
  effectiveDate: Date;
  version: string;
}
export interface EncryptionAlgorithm {
  name: string;
  keyLength: number;
  mode?: string;
  approved: boolean;
  minClassification: DataClassificationLevel;
  maxClassification?: DataClassificationLevel;
  fipsCompliant: boolean;
  quantumResistant: boolean;
  deprecatedDate?: Date;
}
export interface KeyManagementPolicy {
  keyRotationDays: number;
  keyEscrowRequired: boolean;
  hsmRequired: boolean;
  keyDerivationFunction: string;
  keyStorageLocation: 'SOFTWARE' | 'HSM' | 'CLOUD_KMS' | 'AIR_GAPPED_HSM';
  multiPartyControl: boolean;
  keyRecoveryProcedure: string;
  auditLogging: boolean;
}
export interface EncryptionCompliance {
  dataId: string;
  classification: DataClassificationLevel;
  encryptionStatus: 'ENCRYPTED' | 'NOT_ENCRYPTED' | 'PARTIAL' | 'UNKNOWN';
  algorithm?: string;
  keyLength?: number;
  keyRotationCompliant: boolean;
  lastRotationDate?: Date;
  complianceScore: number;
  violations: string;
  recommendations: string;
  assessmentDate: Date;
}
export interface EncryptionAuditEvent {
  id: string;
  timestamp: Date;
  eventType: 'KEY_ROTATION' | 'ENCRYPTION_APPLIED' | 'DECRYPTION_ACCESSED' | 'POLICY_VIOLATION' | 'COMPLIANCE_CHECK';
  dataId: string;
  classification: DataClassificationLevel;
  userId: string;
  algorithm: string;
  keyId: string;
  result: 'SUCCESS' | 'FAILURE' | 'WARNING';
  details: Record<string, any>;
}
export class ClassificationEncryptionPolicyService {
  private encryptionPolicies: Map<DataClassificationLevel, EncryptionPolicy> = new Map();
  private approvedAlgorithms: EncryptionAlgorithm = [];
  private complianceRecords: Map<string, EncryptionCompliance> = new Map();
  private auditEvents: EncryptionAuditEvent = [];
  constructor() {
  this.initializeApprovedAlgorithms();
  this.initializeDefaultEncryptionPolicies();
  /**
  * Initialize approved encryption algorithms
  */
  private initializeApprovedAlgorithms(): void {,
  this.approvedAlgorithms = [
  {
  name: 'AES-128',
  keyLength: 128,
  mode: 'CBC',
  approved: true,
  minClassification: 'PUBLIC',
  maxClassification: 'INTERNAL',
  fipsCompliant: true,
  quantumResistant: false,
}
      {
  name: 'AES-256',
  keyLength: 256,
  mode: 'CBC',
  approved: true,
  minClassification: 'PUBLIC',
  fipsCompliant: true,
  quantumResistant: false,
}
      {
  name: 'AES-256-GCM',
  keyLength: 256,
  mode: 'GCM',
  approved: true,
  minClassification: 'INTERNAL',
  fipsCompliant: true,
  quantumResistant: false,
}
      {
  name: 'ChaCha20-Poly1305',
  keyLength: 256,
  approved: true,
  minClassification: 'INTERNAL',
  fipsCompliant: false,
  quantumResistant: false,
}
      {
  name: 'AES-256-XTS',
  keyLength: 256,
  mode: 'XTS',
  approved: true,
  minClassification: 'CONFIDENTIAL',
  fipsCompliant: true,
  quantumResistant: false,
}
      {
  name: 'CRYSTALS-Kyber',
  keyLength: 768,
  approved: true,
  minClassification: 'RESTRICTED',
  fipsCompliant: false,
  quantumResistant: true];
  /**
  * Initialize default encryption policies for each classification level
  */
  private initializeDefaultEncryptionPolicies(): void {,
  const policies: Record<DataClassificationLevel, EncryptionPolicy> = {,
  PUBLIC: {
  id: 'policy-encryption-public',
  name: 'Public Data Encryption Policy',
  description: 'Encryption policy for public data - optional encryption',
  classification: 'PUBLIC',
  requirements: {
  required: false,
  algorithm: 'AES-128',
  keyLength: 128,
  keyRotationDays: 365,
  hsmRequired: false,
  keyEscrow: false,
},
  algorithms: this.getAlgorithmsForClassification('PUBLIC'),
        keyManagement: {
  keyRotationDays: 365,
  keyEscrowRequired: false,
  hsmRequired: false,
  keyDerivationFunction: 'PBKDF2',
  keyStorageLocation: 'SOFTWARE',
  multiPartyControl: false,
  keyRecoveryProcedure: 'STANDARD',
  auditLogging: false,
},
  complianceFrameworks: [],
        effectiveDate: new Date('2024-01-01'),
        version: '1.0.0';
  },
  INTERNAL: {
  id: 'policy-encryption-internal',
  name: 'Internal Data Encryption Policy',
  description: 'Encryption policy for internal data - mandatory AES-256',
  classification: 'INTERNAL',
  requirements: {
  required: true,
  algorithm: 'AES-256',
  keyLength: 256,
  keyRotationDays: 90,
  hsmRequired: false,
  keyEscrow: false,
},
  algorithms: this.getAlgorithmsForClassification('INTERNAL'),
        keyManagement: {
  keyRotationDays: 90,
  keyEscrowRequired: false,
  hsmRequired: false,
  keyDerivationFunction: 'PBKDF2',
  keyStorageLocation: 'CLOUD_KMS',
  multiPartyControl: false,
  keyRecoveryProcedure: 'STANDARD',
  auditLogging: true,
},
  complianceFrameworks: ['SOC2', 'ISO27001'],
        effectiveDate: new Date('2024-01-01'),
        version: '1.0.0';
  },
  CONFIDENTIAL: {
  id: 'policy-encryption-confidential',
  name: 'Confidential Data Encryption Policy',
  description: 'Encryption policy for confidential data - mandatory AES-256-GCM with HSM',
  classification: 'CONFIDENTIAL',
  requirements: {
  required: true,
  algorithm: 'AES-256-GCM',
  keyLength: 256,
  keyRotationDays: 30,
  hsmRequired: true,
  keyEscrow: true,
},
  algorithms: this.getAlgorithmsForClassification('CONFIDENTIAL'),
        keyManagement: {
  keyRotationDays: 30,
  keyEscrowRequired: true,
  hsmRequired: true,
  keyDerivationFunction: 'HKDF',
  keyStorageLocation: 'HSM',
  multiPartyControl: true,
  keyRecoveryProcedure: 'DUAL_CONTROL',
  auditLogging: true,
},
  complianceFrameworks: ['SOC2', 'GDPR', 'HIPAA'],
        effectiveDate: new Date('2024-01-01'),
        version: '1.0.0';
  },
  RESTRICTED: {
  id: 'policy-encryption-restricted',
  name: 'Restricted Data Encryption Policy',
  description: 'Encryption policy for restricted data - quantum-resistant algorithms with air-gapped HSM',
  classification: 'RESTRICTED',
  requirements: {
  required: true,
  algorithm: 'CRYSTALS-Kyber',
  keyLength: 768,
  keyRotationDays: 7,
  hsmRequired: true,
  keyEscrow: true,
},
  algorithms: this.getAlgorithmsForClassification('RESTRICTED'),
        keyManagement: {
  keyRotationDays: 7,
  keyEscrowRequired: true,
  hsmRequired: true,
  keyDerivationFunction: 'HKDF',
  keyStorageLocation: 'AIR_GAPPED_HSM',
  multiPartyControl: true,
  keyRecoveryProcedure: 'TRIPLE_CONTROL',
  auditLogging: true,
},
  complianceFrameworks: ['FedRAMP', 'FISMA', 'NIST'],
        effectiveDate: new Date('2024-01-01'),
        version: '1.0.0';
  };
    Object.entries(policies).forEach(([level, policy]) => {
      this.encryptionPolicies.set(level as DataClassificationLevel, policy);
    });
  /**
   * Get approved algorithms for a classification level
   */
  private getAlgorithmsForClassification(classification: DataClassificationLevel): EncryptionAlgorithm {
    return this.approvedAlgorithms.filter(algorithm => {)
  return this.isAlgorithmApprovedForClassification(algorithm, classification);
    });
  /**
   * Check if algorithm is approved for classification level
   */
  private isAlgorithmApprovedForClassification(()
    algorithm: EncryptionAlgorithm,
    classification: DataClassificationLevel,
  ): boolean {
  const classificationLevels: Record<DataClassificationLevel, number> = {,
  PUBLIC: 1,
  INTERNAL: 2,
  CONFIDENTIAL: 3,
  RESTRICTED: 4,
};
    const minLevel = classificationLevels[algorithm.minClassification];
    const currentLevel = classificationLevels[classification];
    const maxLevel = algorithm.maxClassification ? classificationLevels[algorithm.maxClassification] : 4;
    return currentLevel >= minLevel && currentLevel <= maxLevel && algorithm.approved;
  /**
   * Get encryption policy for classification level
   */
  getEncryptionPolicy(classification: DataClassificationLevel): EncryptionPolicy | undefined {
  return this.encryptionPolicies.get(classification);
  /**
  * Validate encryption compliance for data
  */
  async validateEncryptionCompliance(dataId: string)
  classification: DataClassificationLevel,
  encryptionStatus: {
  encrypted: boolean;
  algorithm?: string;
  keyLength?: number;
  lastRotationDate?: Date;
},
  context: OperationContext): Promise<ValidationResult> {,
    const policy = this.encryptionPolicies.get(classification);
    if (!policy) {
      return {
        valid: false,
        errors: [`No encryption policy found for classification: ${classification}`]}
},
  warnings: [],
        recommendations: [];
  };
    const errors: string = [];
    const warnings: string = [];
    const recommendations: string = [];
    // Check if encryption is required
    if (policy.requirements.required && !encryptionStatus.encrypted) {
      errors.push(`Encryption is mandatory for ${classification} data but data is not encrypted`);}
    // Check algorithm compliance
    if (encryptionStatus.encrypted && encryptionStatus.algorithm) {
      const algorithmValid = this.validateEncryptionAlgorithm(;);
        encryptionStatus.algorithm,
        classification,
        encryptionStatus.keyLength || 0
      );
      if (!algorithmValid.valid) {
        errors.push(...algorithmValid.errors);
        recommendations.push(...algorithmValid.recommendations);
    // Check key rotation compliance
    if (encryptionStatus.encrypted && encryptionStatus.lastRotationDate) {
      const rotationValid = this.validateKeyRotation(;);
        encryptionStatus.lastRotationDate,
        policy.keyManagement.keyRotationDays
      );
      if (!rotationValid) {
        warnings.push(`Key rotation is overdue. Required frequency: ${policy.keyManagement.keyRotationDays} days`);}
        recommendations.push('Schedule immediate key rotation');
    // Record compliance assessment
    const compliance: EncryptionCompliance = {
  dataId,
  classification,
  encryptionStatus: encryptionStatus.encrypted ? 'ENCRYPTED' : 'NOT_ENCRYPTED',
  algorithm: encryptionStatus.algorithm,
  keyLength: encryptionStatus.keyLength,
  keyRotationCompliant: encryptionStatus.lastRotationDate ? ,
  this.validateKeyRotation(encryptionStatus.lastRotationDate, policy.keyManagement.keyRotationDays) : false,
  lastRotationDate: encryptionStatus.lastRotationDate,
  complianceScore: this.calculateComplianceScore(errors, warnings),
  violations: errors,
  recommendations,
  assessmentDate: new Date(),
};
    this.complianceRecords.set(dataId, compliance);
    // Record audit event
    await this.recordAuditEvent({)
  eventType: 'COMPLIANCE_CHECK',
      dataId,
      classification,
      userId: context.userId,
      algorithm: encryptionStatus.algorithm || 'unknown',
      keyId: 'unknown',
      result: errors.length === 0 ? 'SUCCESS' : 'FAILURE',
      details: { encryptionStatus, compliance }
    });
    return {
  valid: errors.length === 0,
  errors,
  warnings,
  recommendations
};
  /**
   * Validate encryption algorithm
   */
  private validateEncryptionAlgorithm(algorithm: string)
    classification: DataClassificationLevel,
    keyLength: number): ValidationResult {,
    const errors: string = [];
    const warnings: string = [];
    const recommendations: string = [];
    const approvedAlgorithm = this.approvedAlgorithms.find(alg => alg.name === algorithm);
    if (!approvedAlgorithm) {
      errors.push(`Algorithm '${algorithm}' is not in the approved algorithms list`);}
      recommendations.push('Use an approved encryption algorithm');
      return { valid: false, errors, warnings, recommendations };
    if (!approvedAlgorithm.approved) {
      errors.push(`Algorithm '${algorithm}' has been deprecated or is not approved`);}
      recommendations.push('Migrate to an approved encryption algorithm');
    if (!this.isAlgorithmApprovedForClassification(approvedAlgorithm, classification)) {
      errors.push(`Algorithm '${algorithm}' is not approved for ${classification} classification level`);}
      recommendations.push(`Use an algorithm approved for ${classification} data`);}
    if (keyLength < approvedAlgorithm.keyLength) {
      errors.push(`Key length ${keyLength} is insufficient. Minimum required: ${approvedAlgorithm.keyLength}`);}
      recommendations.push(`Increase key length to at least ${approvedAlgorithm.keyLength} bits`);}
    // Check for quantum resistance requirement for restricted data
    if (classification === 'RESTRICTED' && !approvedAlgorithm.quantumResistant) {
  warnings.push('Consider using quantum-resistant algorithms for restricted data');
  recommendations.push('Migrate to quantum-resistant encryption algorithms');
  return {
  valid: errors.length === 0,
  errors,
  warnings,
  recommendations
};
  /**
   * Validate key rotation compliance
   */
  private validateKeyRotation(lastRotationDate: Date, requiredRotationDays: number): boolean {
    const daysSinceRotation = Math.floor((Date.now() - lastRotationDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceRotation <= requiredRotationDays;
  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(errors: string, warnings: string): number {
    if (errors.length === 0 && warnings.length === 0) return 100;
    if (errors.length > 0) return Math.max(0, 50 - (errors.length * 10));
    return Math.max(70, 90 - (warnings.length * 5));
  /**
   * Record audit event
   */
  private async recordAuditEvent(event: Omit<EncryptionAuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: EncryptionAuditEvent = {,
  id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`}
},
  timestamp: new Date(),
      ...event
    };
    this.auditEvents.push(auditEvent);
  /**
   * Get encryption requirements for classification level
   */
  getEncryptionRequirements(classification: DataClassificationLevel): EncryptionRequirements | undefined {
    const policy = this.encryptionPolicies.get(classification);
    return policy?.requirements;
  /**
   * Get approved algorithms for classification level
   */
  getApprovedAlgorithms(classification?: DataClassificationLevel): EncryptionAlgorithm {
    if (classification) {
      return this.getAlgorithmsForClassification(classification);
    return this.approvedAlgorithms.filter(alg => alg.approved);
  /**
   * Get all algorithms (including deprecated ones)
   */
  getAllAlgorithms(): EncryptionAlgorithm {
    return this.approvedAlgorithms;
  /**
   * Get compliance records
   */
  getComplianceRecords(classification?: DataClassificationLevel): EncryptionCompliance {
    const records = Array.from(this.complianceRecords.values());
    if (classification) {
      return records.filter(record => record.classification === classification);
    return records;
  /**
   * Get audit events
   */
  getAuditEvents(classification?: DataClassificationLevel, eventType?: string): EncryptionAuditEvent {
    let events = this.auditEvents;
    if (classification) {
      events = events.filter(event => event.classification === classification);
    if (eventType) {
      events = events.filter(event => event.eventType === eventType);
    return events;
  /**
   * Update encryption policy
   */
  async updateEncryptionPolicy(()
    classification: DataClassificationLevel,
    updates: Partial<EncryptionPolicy>,
  ): Promise<void> {
    const existingPolicy = this.encryptionPolicies.get(classification);
    if (!existingPolicy) {
      throw new Error(`No encryption policy found for classification: ${classification}`);}
    const updatedPolicy: EncryptionPolicy = {
  ...existingPolicy,
  ...updates,
  version: this.incrementVersion(existingPolicy.version),
};
    this.encryptionPolicies.set(classification, updatedPolicy);
  /**
   * Add or update approved algorithm
   */
  addApprovedAlgorithm(algorithm: EncryptionAlgorithm): void {
    const existingIndex = this.approvedAlgorithms.findIndex(alg => alg.name === algorithm.name);
    if (existingIndex >= 0) {
      this.approvedAlgorithms[existingIndex] = algorithm;
    } else {
      this.approvedAlgorithms.push(algorithm);
  /**
   * Deprecate algorithm
   */
  deprecateAlgorithm(algorithmName: string, deprecationDate: Date): void {
    const algorithm = this.approvedAlgorithms.find(alg => alg.name === algorithmName);
    if (algorithm) {
      algorithm.approved = false;
      algorithm.deprecatedDate = deprecationDate;
  /**
   * Get overall compliance score for classification level
   */
  getOverallComplianceScore(classification: DataClassificationLevel): number {
    const records = this.getComplianceRecords(classification);
    if (records.length === 0) return 100;
    const totalScore = records.reduce((sum, record) => sum + record.complianceScore, 0);
    return Math.round(totalScore / records.length);
  /**
   * Get encryption recommendations for classification level
   */
  getEncryptionRecommendations(classification: DataClassificationLevel): string {
    const policy = this.encryptionPolicies.get(classification);
    if (!policy) return [];
    const recommendations: string = [];
    const algorithms = this.getAlgorithmsForClassification(classification);
    recommendations.push(`Use ${policy.requirements.algorithm} encryption with ${policy.requirements.keyLength}-bit keys`);}
    if (policy.keyManagement.hsmRequired) {
      recommendations.push('Store encryption keys in Hardware Security Module (HSM)');
    if (policy.keyManagement.keyEscrowRequired) {
      recommendations.push('Implement key escrow for key recovery procedures');
    recommendations.push(`Rotate encryption keys every ${policy.keyManagement.keyRotationDays} days`);}
    if (classification === 'RESTRICTED') {
      recommendations.push('Consider quantum-resistant encryption algorithms for future-proofing');
    return recommendations;
  /**
   * Increment policy version
   */
  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0', 10) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;}

export default ClassificationEncryptionPolicyService;