/**
 * Classification-Based Encryption Policy Service
 *
 * Implements encryption policies and requirements based on data classification levels.
 * Manages encryption algorithms, key management, and compliance validation.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import { DataClassificationLevel, EncryptionRequirements, OperationContext, ValidationResult } from '../types/DataClassification';
export interface EncryptionPolicy {
    id: string;
    name: string;
    description: string;
    classification: DataClassificationLevel;
    requirements: EncryptionRequirements;
    algorithms: EncryptionAlgorithm[];
    keyManagement: KeyManagementPolicy;
    complianceFrameworks: string[];
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
    violations: string[];
    recommendations: string[];
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
export declare class ClassificationEncryptionPolicyService {
    private encryptionPolicies;
    private approvedAlgorithms;
    private complianceRecords;
    private auditEvents;
    constructor();
    /**
     * Initialize approved encryption algorithms
     */
    private initializeApprovedAlgorithms;
    /**
     * Initialize default encryption policies for each classification level
     */
    private initializeDefaultEncryptionPolicies;
    /**
     * Get approved algorithms for a classification level
     */
    private getAlgorithmsForClassification;
    /**
     * Check if algorithm is approved for classification level
     */
    private isAlgorithmApprovedForClassification;
    /**
     * Get encryption policy for classification level
     */
    getEncryptionPolicy(classification: DataClassificationLevel): EncryptionPolicy | undefined;
    /**
     * Validate encryption compliance for data
     */
    validateEncryptionCompliance(dataId: string, classification: DataClassificationLevel, encryptionStatus: {
        encrypted: boolean;
        algorithm?: string;
        keyLength?: number;
        lastRotationDate?: Date;
    }, context: OperationContext): Promise<ValidationResult>;
    /**
     * Validate encryption algorithm
     */
    private validateEncryptionAlgorithm;
    /**
     * Validate key rotation compliance
     */
    private validateKeyRotation;
    /**
     * Calculate compliance score
     */
    private calculateComplianceScore;
    /**
     * Record audit event
     */
    private recordAuditEvent;
    /**
     * Get encryption requirements for classification level
     */
    getEncryptionRequirements(classification: DataClassificationLevel): EncryptionRequirements | undefined;
    /**
     * Get approved algorithms for classification level
     */
    getApprovedAlgorithms(classification?: DataClassificationLevel): EncryptionAlgorithm[];
    /**
     * Get all algorithms (including deprecated ones)
     */
    getAllAlgorithms(): EncryptionAlgorithm[];
    /**
     * Get compliance records
     */
    getComplianceRecords(classification?: DataClassificationLevel): EncryptionCompliance[];
    /**
     * Get audit events
     */
    getAuditEvents(classification?: DataClassificationLevel, eventType?: string): EncryptionAuditEvent[];
    /**
     * Update encryption policy
     */
    updateEncryptionPolicy(classification: DataClassificationLevel, updates: Partial<EncryptionPolicy>): Promise<void>;
    /**
     * Add or update approved algorithm
     */
    addApprovedAlgorithm(algorithm: EncryptionAlgorithm): void;
    /**
     * Deprecate algorithm
     */
    deprecateAlgorithm(algorithmName: string, deprecationDate: Date): void;
    /**
     * Get overall compliance score for classification level
     */
    getOverallComplianceScore(classification: DataClassificationLevel): number;
    /**
     * Get encryption recommendations for classification level
     */
    getEncryptionRecommendations(classification: DataClassificationLevel): string[];
    /**
     * Increment policy version
     */
    private incrementVersion;
}
export default ClassificationEncryptionPolicyService;
//# sourceMappingURL=ClassificationEncryptionPolicyService.d.ts.map