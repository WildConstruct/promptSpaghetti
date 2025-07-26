/**
 * Key Management Service
 *
 * Comprehensive cryptographic key management system for generating, storing,
 * rotating, and securing cryptographic keys across all security operations.
 *
 * Features:
 * - Secure key generation with multiple algorithms
 * - Hardware Security Module (HSM) integration
 * - Key rotation and lifecycle management
 * - Multi-tiered key storage with encryption at rest
 * - Key derivation and key wrapping
 * - Audit logging and compliance tracking
 * - Performance monitoring and caching
 * - Backup and recovery integration
 */
import { EventEmitter } from 'events';
export declare enum KeyType {
    SYMMETRIC = "symmetric",
    ASYMMETRIC_RSA = "asymmetric_rsa",
    ASYMMETRIC_ECDSA = "asymmetric_ecdsa",
    ASYMMETRIC_ECDH = "asymmetric_ecdh",
    HMAC = "hmac",
    DERIVATION = "derivation",
    ENCRYPTION = "encryption",
    SIGNING = "signing",
    WRAPPING = "wrapping"
}
export declare enum KeyPurpose {
    SESSION_ENCRYPTION = "session_encryption",
    DATA_ENCRYPTION = "data_encryption",
    TOKEN_SIGNING = "token_signing",
    API_AUTHENTICATION = "api_authentication",
    MFA_VERIFICATION = "mfa_verification",
    DEVICE_VERIFICATION = "device_verification",
    PASSWORD_HASHING = "password_hashing",
    DATABASE_ENCRYPTION = "database_encryption",
    FILE_ENCRYPTION = "file_encryption",
    COMMUNICATION_ENCRYPTION = "communication_encryption"
}
export declare enum KeyStatus {
    ACTIVE = "active",
    EXPIRED = "expired",
    REVOKED = "revoked",
    COMPROMISED = "compromised",
    PENDING_ACTIVATION = "pending_activation",
    RETIRED = "retired"
}
export declare enum StorageTier {
    HOT = "hot",// In-memory cache, fastest access
    WARM = "warm",// Encrypted database storage
    COLD = "cold",// Encrypted file storage
    ARCHIVE = "archive",// Long-term encrypted backup
    HSM = "hsm"
}
export declare enum KeyAlgorithm {
    AES_256_GCM = "aes-256-gcm",
    AES_256_CBC = "aes-256-cbc",
    CHACHA20_POLY1305 = "chacha20-poly1305",
    RSA_2048 = "rsa-2048",
    RSA_4096 = "rsa-4096",
    ECDSA_P256 = "ecdsa-p256",
    ECDSA_P384 = "ecdsa-p384",
    ECDH_P256 = "ecdh-p256",
    ECDH_P384 = "ecdh-p384",
    HMAC_SHA256 = "hmac-sha256",
    HMAC_SHA512 = "hmac-sha512",
    PBKDF2_SHA256 = "pbkdf2-sha256",
    SCRYPT = "scrypt",
    ARGON2ID = "argon2id"
}
export interface KeyMetadata {
    id: string;
    name: string;
    type: KeyType;
    purpose: KeyPurpose;
    algorithm: KeyAlgorithm;
    status: KeyStatus;
    tier: StorageTier;
    createdAt: Date;
    activatedAt?: Date;
    expiresAt?: Date;
    revokedAt?: Date;
    retiredAt?: Date;
    lastUsed?: Date;
    keySize: number;
    version: number;
    parentKeyId?: string;
    wrappedBy?: string;
    usageCount: number;
    maxUsages?: number;
    createdBy: string;
    approvedBy?: string;
    complianceLevel: 'low' | 'medium' | 'high' | 'critical';
    auditTrail: KeyAuditEvent[];
    authorizedUsers: string[];
    authorizedServices: string[];
    accessPolicy: KeyAccessPolicy;
    encoding: 'base64' | 'hex' | 'buffer';
    compressed: boolean;
    checksumSHA256: string;
    tags: Record<string, string>;
    metadata: Record<string, any>;
}
export interface CryptographicKey {
    metadata: KeyMetadata;
    keyData?: Buffer;
    publicKey?: Buffer;
    privateKey?: Buffer;
    wrappedKeyData?: Buffer;
    derivationParameters?: KeyDerivationParameters;
}
export interface KeyDerivationParameters {
    algorithm: KeyAlgorithm;
    salt: Buffer;
    iterations?: number;
    memoryFactor?: number;
    parallelism?: number;
    keyLength: number;
    additionalData?: Buffer;
}
export interface KeyAccessPolicy {
    requireMultiAuth: boolean;
    minApprovals: number;
    timeRestrictions?: {
        allowedHours: number[];
        allowedDays: number[];
        timezone: string;
    };
    locationRestrictions?: {
        allowedCountries: string[];
        allowedNetworks: string[];
    };
    requireSecureChannel: boolean;
    maxConcurrentAccess: number;
    sessionTimeout: number;
}
export interface KeyAuditEvent {
    id: string;
    timestamp: Date;
    event: 'created' | 'accessed' | 'modified' | 'rotated' | 'revoked' | 'expired' | 'backed_up' | 'restored';
    userId: string;
    serviceId?: string;
    ipAddress: string;
    userAgent?: string;
    details: Record<string, any>;
    riskScore: number;
}
export interface KeyGenerationOptions {
    type: KeyType;
    purpose: KeyPurpose;
    algorithm: KeyAlgorithm;
    keySize?: number;
    name?: string;
    expirationDays?: number;
    tier?: StorageTier;
    complianceLevel?: 'low' | 'medium' | 'high' | 'critical';
    accessPolicy?: Partial<KeyAccessPolicy>;
    parentKeyId?: string;
    derivationParams?: Partial<KeyDerivationParameters>;
    metadata?: Record<string, any>;
    tags?: Record<string, string>;
}
export interface KeyRotationOptions {
    forceRotation?: boolean;
    gracePeriodDays?: number;
    notifyUsers?: boolean;
    automatedRotation?: boolean;
    rotationReason?: string;
}
export interface KeySearchCriteria {
    type?: KeyType;
    purpose?: KeyPurpose;
    status?: KeyStatus;
    tier?: StorageTier;
    createdAfter?: Date;
    createdBefore?: Date;
    expiringBefore?: Date;
    tags?: Record<string, string>;
    authorizedUser?: string;
    complianceLevel?: string;
}
export interface KeyManagementConfig {
    defaultTier: StorageTier;
    hotCacheSize: number;
    warmStorageEncryption: boolean;
    coldStorageLocation: string;
    masterKeyRotationDays: number;
    defaultKeyExpirationDays: number;
    requireKeyApproval: boolean;
    enableHSMIntegration: boolean;
    hsmConfig?: HSMConfiguration;
    cacheEnabled: boolean;
    cacheTTL: number;
    backgroundRotationEnabled: boolean;
    auditRetentionDays: number;
    complianceMode: boolean;
    encryptionAtRest: boolean;
    keyDerivationComplexity: 'low' | 'medium' | 'high';
    performanceMonitoring: boolean;
    alertThresholds: {
        keyUsageRate: number;
        failureRate: number;
        responseTime: number;
    };
}
export interface HSMConfiguration {
    provider: 'aws-cloudhsm' | 'azure-keyvault' | 'gcp-hsm' | 'pkcs11';
    endpoint: string;
    credentials: {
        username?: string;
        password?: string;
        certificatePath?: string;
        tokenPath?: string;
    };
    keySlots: number[];
    partitionLabel?: string;
}
export interface KeyPerformanceMetrics {
    operationsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    cacheHitRate: number;
    activeKeyCount: number;
    totalKeyCount: number;
    storageUtilization: Record<StorageTier, number>;
    hotPathOperations: number;
    slowPathOperations: number;
}
/**
 * Key Management Service
 */
export declare class KeyManagementService extends EventEmitter {
    private config;
    private keys;
    private keyCache;
    private masterKeys;
    private metrics;
    private performanceTimer?;
    constructor(config: KeyManagementConfig);
    /**
     * Generate a new cryptographic key
     */
    generateKey(options: KeyGenerationOptions): Promise<CryptographicKey>;
    /**
     * Get key metadata without access validation (for administrative/testing purposes)
     */
    getKeyMetadata(keyId: string): Promise<CryptographicKey | null>;
    /**
     * Retrieve a key by ID
     */
    getKey(keyId: string, requesterId: string): Promise<CryptographicKey | null>;
    /**
     * Rotate a key
     */
    rotateKey(keyId: string, requesterId: string, options?: KeyRotationOptions): Promise<CryptographicKey>;
    /**
     * Revoke a key
     */
    revokeKey(keyId: string, requesterId: string, reason: string): Promise<void>;
    /**
     * Derive a key from a parent key
     */
    deriveKey(
      parentKeyId: string,
      derivationParams: KeyDerivationParameters,
      requesterId: string
    ): Promise<CryptographicKey>;
    /**
     * Search keys by criteria
     */
    searchKeys(criteria: KeySearchCriteria, requesterId: string): Promise<KeyMetadata[]>;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): KeyPerformanceMetrics;
    /**
     * Export key for backup (encrypted)
     */
    exportKey(keyId: string, requesterId: string): Promise<Buffer>;
    private initializeMetrics;
    private initializeMasterKeysSync;
    private startBackgroundTasks;
    private validateKeyGenerationOptions;
    private createKeyMetadata;
    private generateKeyMaterial;
    private generateSymmetricKey;
    private generateRSAKeyPair;
    private generateECKeyPair;
    private generateHMACKey;
    private generateDerivationKey;
    private performKeyDerivation;
    private wrapKey;
    private unwrapKey;
    private wrapKeyForExport;
    private storeKey;
    private loadKey;
    private shouldCacheKey;
    private cacheKey;
    private getCachedKey;
    private validateKeyAccess;
    private hasKeyAccess;
    private updateKeyUsage;
    private shouldRotateKey;
    private matchesSearchCriteria;
    private generateMasterKey;
    private generateKeyId;
    private calculateHash;
    private getDefaultKeySize;
    private logKeyEvent;
    private calculateEventRiskScore;
    private updateMetrics;
    private updatePerformanceMetrics;
    private performBackgroundRotation;
    private cleanupCache;
    /**
     * Cleanup and shutdown
     */
    destroy(): void;
}
export default KeyManagementService;
//# sourceMappingURL=KeyManagementService.d.ts.map