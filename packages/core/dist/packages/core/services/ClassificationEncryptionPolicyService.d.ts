/**
 * Classification-Based Encryption Policy Service
 *
 * Implements encryption policies and requirements based on data classification levels.
 * Manages encryption algorithms, key management, and compliance validation.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import { DataClassificationLevel, EncryptionRequirements } from '../types/DataClassification';
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
     * Check if algorithm is approved for classification level
     */
    private isAlgorithmApprovedForClassification;
}
//# sourceMappingURL=ClassificationEncryptionPolicyService.d.ts.map