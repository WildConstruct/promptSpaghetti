/**
 * Key Backup and Recovery Service
 *
 * Comprehensive backup and recovery system for cryptographic keys with multi-tier
 * storage, encryption, integrity verification, and disaster recovery capabilities.
 *
 * Features:
 * - Multi-tier backup storage (local, remote, cold storage)
 * - Encrypted backup with key splitting and threshold schemes
 * - Automated backup scheduling and verification
 * - Point-in-time recovery and versioning
 * - Disaster recovery procedures
 * - Backup integrity monitoring and corruption detection
 * - Compliance and audit logging
 * - Emergency key escrow and recovery
 */
import { EventEmitter } from 'events';
import { KeyStatus, KeyType, KeyPurpose, KeyManagementService } from './KeyManagementService';
export declare enum BackupType {
    FULL = "full",// Complete key store backup
    INCREMENTAL = "incremental",// Changes since last backup
    DIFFERENTIAL = "differential",// Changes since last full backup
    SELECTIVE = "selective",// Specific keys only
    EMERGENCY = "emergency"

export declare enum RecoveryType {
    COMPLETE = "complete",// Full key store recovery
    SELECTIVE = "selective",// Specific keys recovery
    POINT_IN_TIME = "point_in_time",// Recovery to specific timestamp
    EMERGENCY = "emergency",// Emergency recovery procedure
    VERIFICATION = "verification"

export declare enum BackupStorageTier {
    LOCAL = "local",// Local filesystem
    REMOTE = "remote",// Remote secure storage
    CLOUD = "cloud",// Cloud storage service
    OFFLINE = "offline",// Offline/air-gapped storage
    ESCROW = "escrow"

export declare enum BackupStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed",
    VERIFIED = "verified",
    CORRUPTED = "corrupted",
    EXPIRED = "expired"

export declare enum RecoveryStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed",
    PARTIAL = "partial",
    VERIFICATION_FAILED = "verification_failed"

export interface BackupMetadata {
    id: string;
    type: BackupType;
    status: BackupStatus;
    tier: BackupStorageTier;
    createdAt: Date;
    completedAt?: Date;
    expiresAt?: Date;
    verifiedAt?: Date;
    keyCount: number;
    totalSize: number;
    compressionRatio: number;
    encrypted: boolean;
    encryptionAlgorithm: string;
    integrityHash: string;
    backupKeyId?: string;
    escrowKeyIds?: string[];
    version: string;
    source: string;
    description?: string;
    tags: Record<string, string>;
    recoveryComplexity: 'simple' | 'moderate' | 'complex' | 'critical';
    requiredApprovals: number;
    emergencyContacts: string[];
    verificationResults?: BackupVerificationResult;
    checksums: Record<string, string>;
    createdBy: string;
    accessLog: BackupAccessEvent[];


export interface BackupVerificationResult {
    id: string;
    backupId: string;
    timestamp: Date;
    successful: boolean;
    integrityCheck: boolean;
    decryptionCheck: boolean;
    keyCountCheck: boolean;
    metadataCheck: boolean;
    checksumVerification: boolean;
    verifiedKeys: number;
    failedKeys: string[];
    corruptedData: string[];
    missingKeys: string[];
    verificationTime: number;
    issues: BackupIssue[];


export interface BackupIssue {
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: 'corruption' | 'missing_data' | 'encryption_error' | 'integrity_failure' | 'metadata_mismatch';
    description: string;
    affectedKeys?: string[];
    resolution?: string;
    detectedAt: Date;


export interface RecoveryRequest {
    id: string;
    type: RecoveryType;
    backupId?: string;
    targetTimestamp?: Date;
    specificKeys?: string[];
    overwriteExisting: boolean;
    verifyBeforeRestore: boolean;
    createRecoveryPoint: boolean;
    requestedBy: string;
    approvals: RecoveryApproval[];
    emergencyProcedure: boolean;
    reason: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    createdAt: Date;
    metadata: Record<string, any>;


export interface RecoveryApproval {
    approver: string;
    approvedAt: Date;
    signature?: string;
    conditions?: string[];


export interface RecoveryResult {
    id: string;
    requestId: string;
    status: RecoveryStatus;
    recoveredKeys: number;
    failedKeys: string[];
    skippedKeys: string[];
    startedAt: Date;
    completedAt?: Date;
    duration?: number;
    verificationResult?: BackupVerificationResult;
    errors: string[];
    warnings: string[];


export interface BackupAccessEvent {
    id: string;
    timestamp: Date;
    action: 'created' | 'accessed' | 'verified' | 'restored' | 'deleted' | 'modified';
    userId: string;
    ipAddress: string;
    userAgent?: string;
    details: Record<string, any>;


export interface BackupConfiguration {
    enableAutomaticBackup: boolean;
    fullBackupIntervalHours: number;
    incrementalBackupIntervalHours: number;
    retentionPolicyDays: number;
    defaultTier: BackupStorageTier;
    enableMultiTierStorage: boolean;
    storageLocations: BackupStorageLocation[];
    encryptBackups: boolean;
    useKeyEscrow: boolean;
    escrowThreshold: number;
    backupEncryptionKeyRotationDays: number;
    enableAutomaticVerification: boolean;
    verificationIntervalHours: number;
    verificationSamplePercentage: number;
    auditRetentionDays: number;
    complianceMode: boolean;
    encryptionStandard: string;
    emergencyProceduresEnabled: boolean;
    emergencyContactNotification: boolean;
    emergencyDecryptionKeys: string[];
    compressionEnabled: boolean;
    maxConcurrentBackups: number;
    backupTimeoutMinutes: number;


export interface BackupStorageLocation {
    id: string;
    tier: BackupStorageTier;
    path: string;
    encrypted: boolean;
    credentials?: {
        username?: string;
        password?: string;
        apiKey?: string;
        certificatePath?: string;

    };
    maxSize: number;
    retentionDays: number;
    redundancy: number;

export interface BackupPackage {
    metadata: BackupMetadata;
    encryptedData: Buffer;
    keyManifest: KeyManifestEntry[];
    checksums: Record<string, string>;
    signature: string;


export interface KeyManifestEntry {
    keyId: string;
    keyType: KeyType;
    purpose: KeyPurpose;
    algorithm: string;
    status: KeyStatus;
    size: number;
    checksum: string;
    encrypted: boolean;
    offset: number;
    length: number;


export interface BackupStatistics {
    totalBackups: number;
    successfulBackups: number;
    failedBackups: number;
    totalRecoveries: number;
    successfulRecoveries: number;
    averageBackupTime: number;
    averageRecoveryTime: number;
    totalStorageUsed: number;
    compressionEfficiency: number;
    verificationSuccessRate: number;
    lastBackupTime?: Date;
    nextScheduledBackup?: Date;
    criticalIssues: number;


/**
 * Key Backup and Recovery Service
 */
export declare class KeyBackupRecoveryService extends EventEmitter {
    private keyManagementService;
    private config;
    private backups;
    private recoveryRequests;
    private backupScheduler?;
    private verificationScheduler?;
    private statistics;
    constructor(keyManagementService: KeyManagementService, config: BackupConfiguration);
    /**
     * Create a backup of keys
     */
    createBackup(type: BackupType, options?: {)
        tier?: BackupStorageTier;
        description?: string;
        specificKeys?: string[];
        tags?: Record<string, string>;
        emergency?: boolean;
    }): Promise<BackupMetadata>;
    /**
     * Verify backup integrity
     */
    verifyBackup(backupId: string): Promise<BackupVerificationResult>;
    /**
     * Recover keys from backup
     */
    recoverKeys(request: RecoveryRequest): Promise<RecoveryResult>;
    /**
     * List available backups
     */
    listBackups(filters?: {)
        type?: BackupType;
        status?: BackupStatus;
        tier?: BackupStorageTier;
        createdAfter?: Date;
        createdBefore?: Date;
    }): BackupMetadata[];
    /**
     * Delete backup
     */
    deleteBackup(backupId: string, reason: string): Promise<void>;
    /**
     * Get backup statistics
     */
    getStatistics(): BackupStatistics;
    /**
     * Create emergency recovery package
     */
    createEmergencyRecoveryPackage(keyIds: string[]): Promise<Buffer>;
    private initializeStatistics;
    private startScheduledTasks;
    private determineKeysToBackup;
    private createBackupPackage;
    private encryptBackupData;
    private decryptBackupData;
    private storeBackup;
    private loadBackup;
    private deleteFromStorage;
    private calculateHash;
    private signBackupPackage;
    private verifyBackupMetadata;
    private verifyKeyChecksums;
    private validateRecoveryRequest;
    private findBackupForRecovery;
    private determineKeysToRecover;
    private extractKeyData;
    private restoreKey;
    private logBackupAccess;
    private updateStatistics;
    private performScheduledBackup;
    private performScheduledVerification;
    private generateBackupId;
    private generateVerificationId;
    private generateRecoveryId;
    private generateRecoveryInstructions;
    /**
     * Cleanup and shutdown
     */
    destroy(): void;

export default KeyBackupRecoveryService;
//# sourceMappingURL=KeyBackupRecoveryService.d.ts.map