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
import { randomBytes, pbkdf2, scrypt, createCipher, createDecipher, createHash, createHmac } from 'crypto';
import { promisify } from 'util';

// Async crypto functions
const pbkdf2Async = promisify(pbkdf2);
const scryptAsync = promisify(scrypt);

// Key types
export enum KeyType {
  SYMMETRIC = 'symmetric',
  ASYMMETRIC_RSA = 'asymmetric_rsa',
  ASYMMETRIC_ECDSA = 'asymmetric_ecdsa',
  ASYMMETRIC_ECDH = 'asymmetric_ecdh',
  HMAC = 'hmac',
  DERIVATION = 'derivation',
  ENCRYPTION = 'encryption',
  SIGNING = 'signing',
  WRAPPING = 'wrapping'
  // Key purposes
  export enum KeyPurpose {
  SESSION_ENCRYPTION = 'session_encryption',
  DATA_ENCRYPTION = 'data_encryption',
  TOKEN_SIGNING = 'token_signing',
  API_AUTHENTICATION = 'api_authentication',
  MFA_VERIFICATION = 'mfa_verification',
  DEVICE_VERIFICATION = 'device_verification',
  PASSWORD_HASHING = 'password_hashing',
  DATABASE_ENCRYPTION = 'database_encryption',
  FILE_ENCRYPTION = 'file_encryption',
  COMMUNICATION_ENCRYPTION = 'communication_encryption'
  // Key status
  export enum KeyStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  COMPROMISED = 'compromised',
  PENDING_ACTIVATION = 'pending_activation',
  RETIRED = 'retired'
  // Key storage tiers
  export enum StorageTier {
  HOT = 'hot',           // In-memory cache, fastest access
  WARM = 'warm',         // Encrypted database storage
  COLD = 'cold',         // Encrypted file storage
  ARCHIVE = 'archive',   // Long-term encrypted backup
  HSM = 'hsm'           // Hardware Security Module
  // Key algorithms
  export enum KeyAlgorithm {
  AES_256_GCM = 'aes-256-gcm',
  AES_256_CBC = 'aes-256-cbc',
  CHACHA20_POLY1305 = 'chacha20-poly1305',
  RSA_2048 = 'rsa-2048',
  RSA_4096 = 'rsa-4096',
  ECDSA_P256 = 'ecdsa-p256',
  ECDSA_P384 = 'ecdsa-p384',
  ECDH_P256 = 'ecdh-p256',
  ECDH_P384 = 'ecdh-p384',
  HMAC_SHA256 = 'hmac-sha256',
  HMAC_SHA512 = 'hmac-sha512',
  PBKDF2_SHA256 = 'pbkdf2-sha256',
  SCRYPT = 'scrypt',
  ARGON2ID = 'argon2id'
  // Key metadata
  export interface KeyMetadata {
  id: string;
  name: string;
  type: KeyType;
  purpose: KeyPurpose;
  algorithm: KeyAlgorithm;
  status: KeyStatus;
  tier: StorageTier;
  // Lifecycle
  createdAt: Date;
  activatedAt?: Date;
  expiresAt?: Date;
  revokedAt?: Date;
  retiredAt?: Date;
  lastUsed?: Date;
  // Security properties
  keySize: number;
  version: number;
  parentKeyId?: string; // For derived keys,
  wrappedBy?: string;   // ID of wrapping key,
  // Usage tracking
  usageCount: number;
  maxUsages?: number;
  // Compliance and audit
  createdBy: string;
  approvedBy?: string;
  complianceLevel: 'low' | 'medium' | 'high' | 'critical';
  auditTrail: KeyAuditEvent;
  // Access control
  authorizedUsers: string;
  authorizedServices: string;
  accessPolicy: KeyAccessPolicy;
  // Technical metadata
  encoding: 'base64' | 'hex' | 'buffer';
  compressed: boolean;
  checksumSHA256: string;
  // Custom metadata
  tags: Record<string, string>;
  metadata: Record<string, any>;
  // Key data structure
}
export interface CryptographicKey {
  metadata: KeyMetadata;
  keyData?: Buffer; // Actual key material (may be null for HSM keys),
  publicKey?: Buffer; // For asymmetric keys,
  privateKey?: Buffer; // For asymmetric keys,
  wrappedKeyData?: Buffer; // Encrypted key data,
  derivationParameters?: KeyDerivationParameters;
  // Key derivation parameters
}
export interface KeyDerivationParameters {
  algorithm: KeyAlgorithm;
  salt: Buffer;
  iterations?: number;
  memoryFactor?: number;
  parallelism?: number;
  keyLength: number;
  additionalData?: Buffer;
  // Key access policy
}
export interface KeyAccessPolicy {
  requireMultiAuth: boolean;
  minApprovals: number;
  timeRestrictions?: {
  allowedHours: number;
  allowedDays: number;
  timezone: string;
};
  locationRestrictions?: {
  allowedCountries: string;
  allowedNetworks: string;
};
  requireSecureChannel: boolean;
  maxConcurrentAccess: number;
  sessionTimeout: number;

// Key audit events
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
  // Key generation options
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
  // Key rotation options
}
export interface KeyRotationOptions {
  forceRotation?: boolean;
  gracePeriodDays?: number;
  notifyUsers?: boolean;
  automatedRotation?: boolean;
  rotationReason?: string;
  // Key search criteria
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
  // Service configuration
}
export interface KeyManagementConfig {
  // Storage configuration
  defaultTier: StorageTier;
  hotCacheSize: number;
  warmStorageEncryption: boolean;
  coldStorageLocation: string;
  // Security configuration
  masterKeyRotationDays: number;
  defaultKeyExpirationDays: number;
  requireKeyApproval: boolean;
  enableHSMIntegration: boolean;
  hsmConfig?: HSMConfiguration;
  // Performance configuration
  cacheEnabled: boolean;
  cacheTTL: number;
  backgroundRotationEnabled: boolean;
  // Compliance configuration
  auditRetentionDays: number;
  complianceMode: boolean;
  encryptionAtRest: boolean;
  keyDerivationComplexity: 'low' | 'medium' | 'high';
  // Monitoring
  performanceMonitoring: boolean;
  alertThresholds: {
  keyUsageRate: number;
  failureRate: number;
  responseTime: number;
};

// HSM configuration
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
  keySlots: number;
  partitionLabel?: string;

// Performance metrics
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
  /**
  * Key Management Service
  */
}
export class KeyManagementService extends EventEmitter {
  private keys: Map<string, CryptographicKey> = new Map();
  private keyCache: Map<string, { key: CryptographicKey; timestamp: Date }> = new Map();
  private masterKeys: Map<StorageTier, Buffer> = new Map();
  private metrics!: KeyPerformanceMetrics;
  private performanceTimer?: NodeJS.Timeout;
  constructor(private config: KeyManagementConfig) {
  super();
  this.initializeMetrics();
  this.initializeMasterKeysSync();
  this.startBackgroundTasks();
  /**
  * Generate a new cryptographic key
  */
  public async generateKey(options: KeyGenerationOptions): Promise<CryptographicKey> {,
  const startTime = Date.now();
  try {
  // Validate options
  this.validateKeyGenerationOptions(options);
  // Generate key ID and metadata
  const keyId = this.generateKeyId();
  const metadata = await this.createKeyMetadata(keyId, options);
  // Generate key material
  const keyData = await this.generateKeyMaterial(options);
  // Create key object
  const key: CryptographicKey = {,
  metadata,
  ...keyData
};
      // Set checksum
      if (key.keyData) {
  key.metadata.checksumSHA256 = this.calculateHash(key.keyData);
  // Apply key wrapping if required
  if (metadata.tier !== StorageTier.HSM) {
  await this.wrapKey(key);
  // Store key
  await this.storeKey(key);
  // Cache key if appropriate
  if (this.shouldCacheKey(key)) {
  this.cacheKey(key);
  // Log audit event
  await this.logKeyEvent(key, 'created', {)
  algorithm: options.algorithm,
  purpose: options.purpose,
  tier: options.tier,
});
      // Update metrics
      this.updateMetrics('key_generated', Date.now() - startTime);
      this.emit('keyGenerated', {)
  keyId,
  type: options.type,
  purpose: options.purpose,
  algorithm: options.algorithm,
  timestamp: new Date(),
});
      return key;
    } catch (error) {
  this.updateMetrics('key_generation_error', Date.now() - startTime);
  this.emit('keyGenerationError', {)
  error: error instanceof Error ? error.message : 'Unknown error',
  options,
  timestamp: new Date(),
});
      throw error;
  /**
   * Get key metadata without access validation (for administrative/testing purposes)
   */
  public async getKeyMetadata(keyId: string): Promise<CryptographicKey | null> {
    return await this.loadKey(keyId);
  /**
   * Retrieve a key by ID
   */
  public async getKey(keyId: string, requesterId: string): Promise<CryptographicKey | null> {
    const startTime = Date.now();
    try {
      // Check cache first
      const cached = this.getCachedKey(keyId);
      if (cached) {
        this.updateMetrics('cache_hit', Date.now() - startTime);
        await this.validateKeyAccess(cached, requesterId);
        await this.updateKeyUsage(cached);
        return cached;
      // Load from storage
      const key = await this.loadKey(keyId);
      if (!key) {
        return null;
      // Validate access
      await this.validateKeyAccess(key, requesterId);
      // Unwrap key if needed
      if (key.wrappedKeyData && !key.keyData) {
        await this.unwrapKey(key);
      // Cache the key
      if (this.shouldCacheKey(key)) {
        this.cacheKey(key);
      // Update usage
      await this.updateKeyUsage(key);
      // Log access
      await this.logKeyEvent(key, 'accessed', { requesterId });
      this.updateMetrics('key_retrieved', Date.now() - startTime);
      return key;
    } catch (error) {
      this.updateMetrics('key_retrieval_error', Date.now() - startTime);
      throw error;
  /**
   * Rotate a key
   */
  public async rotateKey()
    keyId: string, 
    requesterId: string, 
    options: KeyRotationOptions = {}
  ): Promise<CryptographicKey> {
    const startTime = Date.now();
    try {
      const existingKey = await this.getKey(keyId, requesterId);
      if (!existingKey) {
        throw new Error('Key not found');
      // Check if rotation is needed
      if (!options.forceRotation && !this.shouldRotateKey(existingKey)) {
        return existingKey;
      // Generate new key with same properties
      const newKeyOptions: KeyGenerationOptions = {,
  type: existingKey.metadata.type,
        purpose: existingKey.metadata.purpose,
        algorithm: existingKey.metadata.algorithm,
        keySize: existingKey.metadata.keySize,
        name: `${existingKey.metadata.name}_rotated`}
},
  tier: existingKey.metadata.tier,
        complianceLevel: existingKey.metadata.complianceLevel,
        accessPolicy: existingKey.metadata.accessPolicy,
        metadata: { ...existingKey.metadata.metadata, rotatedFrom: keyId }
      };
      const newKey = await this.generateKey(newKeyOptions);
      // Update old key status
      existingKey.metadata.status = KeyStatus.RETIRED;
      existingKey.metadata.retiredAt = new Date();
      await this.storeKey(existingKey);
      // Remove from cache
      this.keyCache.delete(keyId);
      // Log rotation
      await this.logKeyEvent(existingKey, 'rotated', {)
  newKeyId: newKey.metadata.id,
  reason: options.rotationReason || 'scheduled_rotation',
  requesterId
});
      this.updateMetrics('key_rotated', Date.now() - startTime);
      this.emit('keyRotated', {)
  oldKeyId: keyId,
  newKeyId: newKey.metadata.id,
  reason: options.rotationReason,
  timestamp: new Date(),
});
      return newKey;
    } catch (error) {
      this.updateMetrics('key_rotation_error', Date.now() - startTime);
      throw error;
  /**
   * Revoke a key
   */
  public async revokeKey(keyId: string, requesterId: string, reason: string): Promise<void> {
    const startTime = Date.now();
    try {
      const key = await this.loadKey(keyId);
      if (!key) {
        throw new Error('Key not found');
      // Update key status
      key.metadata.status = KeyStatus.REVOKED;
      key.metadata.revokedAt = new Date();
      // Store updated key
      await this.storeKey(key);
      // Remove from cache
      this.keyCache.delete(keyId);
      // Log revocation
      await this.logKeyEvent(key, 'revoked', { reason, requesterId });
      this.updateMetrics('key_revoked', Date.now() - startTime);
      this.emit('keyRevoked', {)
  keyId,
  reason,
  requesterId,
  timestamp: new Date(),
});
    } catch (error) {
      this.updateMetrics('key_revocation_error', Date.now() - startTime);
      throw error;
  /**
   * Derive a key from a parent key
   */
  public async deriveKey()
    parentKeyId: string,
    derivationParams: KeyDerivationParameters,
    requesterId: string): Promise<CryptographicKey> {,
    const startTime = Date.now();
    try {
      const parentKey = await this.getKey(parentKeyId, requesterId);
      if (!parentKey) {
        throw new Error('Parent key not found');
      if (!parentKey.keyData) {
        throw new Error('Parent key data not available');
      // Derive key material
      const derivedKeyData = await this.performKeyDerivation(parentKey.keyData, derivationParams);
      // Create derived key metadata
      const keyId = this.generateKeyId();
      const metadata: KeyMetadata = {
        ...parentKey.metadata,
        id: keyId,
        name: `${parentKey.metadata.name}_derived`}
}
        parentKeyId,
        createdAt: new Date(),
        version: 1,
        usageCount: 0,
        checksumSHA256: createHash('sha256').update(derivedKeyData).digest('hex'),
        auditTrail: [];
  };
      const derivedKey: CryptographicKey = {
  metadata,
  keyData: derivedKeyData,
  derivationParameters: derivationParams,
};
      // Store derived key
      await this.storeKey(derivedKey);
      // Log derivation
      await this.logKeyEvent(derivedKey, 'created', {)
  derivedFrom: parentKeyId,
  algorithm: derivationParams.algorithm,
  requesterId
});
      this.updateMetrics('key_derived', Date.now() - startTime);
      return derivedKey;
    } catch (error) {
  this.updateMetrics('key_derivation_error', Date.now() - startTime);
  throw error;
  /**
  * Search keys by criteria
  */
  public async searchKeys(criteria: KeySearchCriteria, requesterId: string): Promise<KeyMetadata> {,
  const startTime = Date.now();
  try {
  const results: KeyMetadata = [];
  for (const [keyId, key] of this.keys) {
  if (this.matchesSearchCriteria(key, criteria)) {
  // Check access permissions
  if (this.hasKeyAccess(key, requesterId)) {
  results.push(key.metadata);
  this.updateMetrics('key_search', Date.now() - startTime);
  return results;
} catch (error) {
      this.updateMetrics('key_search_error', Date.now() - startTime);
      throw error;
  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): KeyPerformanceMetrics {
    return { ...this.metrics };
  /**
   * Export key for backup (encrypted)
   */
  public async exportKey(keyId: string, requesterId: string): Promise<Buffer> {
  const key = await this.getKey(keyId, requesterId);
  if (!key) {
  throw new Error('Key not found');
  // Create export package with metadata and encrypted key data
  const exportData = {
  metadata: key.metadata,
  encryptedKeyData: key.wrappedKeyData || await this.wrapKeyForExport(key),
  exportedAt: new Date(),
  exportedBy: requesterId,
};
    await this.logKeyEvent(key, 'backed_up', { requesterId, exportMethod: 'manual' });
    return Buffer.from(JSON.stringify(exportData));
  // Private helper methods
  private initializeMetrics(): void {
  this.metrics = {
  operationsPerSecond: 0,
  averageResponseTime: 0,
  errorRate: 0,
  cacheHitRate: 0,
  activeKeyCount: 0,
  totalKeyCount: 0,
  storageUtilization: {
  [StorageTier.HOT]: 0,
  [StorageTier.WARM]: 0,
  [StorageTier.COLD]: 0,
  [StorageTier.ARCHIVE]: 0,
  [StorageTier.HSM]: 0,
},
  hotPathOperations: 0,
      slowPathOperations: 0;
  };
  private initializeMasterKeysSync(): void {
  // Generate or load master keys for each storage tier
  for (const tier of Object.values(StorageTier)) {
  if (tier !== StorageTier.HSM) {
  const masterKey = this.generateMasterKey(tier);
  this.masterKeys.set(tier, masterKey);
  private startBackgroundTasks(): void {,
  // Start performance monitoring
  if (this.config.performanceMonitoring) {
  this.performanceTimer = setInterval(() => {
  this.updatePerformanceMetrics();
}, 60000); // Every minute
    // Start background rotation
    if (this.config.backgroundRotationEnabled) {
      setInterval(() => {
        this.performBackgroundRotation();
      }, 3600000); // Every hour
    // Start cache cleanup
    setInterval(() => {
      this.cleanupCache();
    }, 300000); // Every 5 minutes
  private validateKeyGenerationOptions(options: KeyGenerationOptions): void {
    if (!options.type || !options.purpose || !options.algorithm) {
      throw new Error('Key type, purpose, and algorithm are required');
    if (options.keySize && options.keySize < 128) {
      throw new Error('Key size must be at least 128 bits');
    if (options.expirationDays && options.expirationDays < 1) {
      throw new Error('Expiration must be at least 1 day');
  private async createKeyMetadata(keyId: string, options: KeyGenerationOptions): Promise<KeyMetadata> {
    const now = new Date();
    const expiration = options.expirationDays ;
      ? new Date(now.getTime() + options.expirationDays * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + this.config.defaultKeyExpirationDays * 24 * 60 * 60 * 1000);
    return {
      id: keyId,
      name: options.name || `${options.purpose}_${keyId}`}
},
  type: options.type,
      purpose: options.purpose,
      algorithm: options.algorithm,
      status: KeyStatus.PENDING_ACTIVATION,
      tier: options.tier || this.config.defaultTier,
      createdAt: now,
      expiresAt: expiration,
      keySize: options.keySize || this.getDefaultKeySize(options.algorithm),
      version: 1,
      parentKeyId: options.parentKeyId,
      usageCount: 0,
      maxUsages: undefined,
      createdBy: 'system', // Would be actual user ID
      complianceLevel: options.complianceLevel || 'medium',
      auditTrail: [],
      authorizedUsers: [],
      authorizedServices: [],
      accessPolicy: {
  requireMultiAuth: false,
  minApprovals: 1,
  requireSecureChannel: true,
  maxConcurrentAccess: 10,
  sessionTimeout: 3600,
  ...options.accessPolicy
},
  encoding: 'base64',
      compressed: false,
      checksumSHA256: '',
      tags: options.tags || {},
      metadata: options.metadata || {}
    };
  private async generateKeyMaterial(options: KeyGenerationOptions): Promise<Partial<CryptographicKey>> {
    switch (options.type) {
    case KeyType.SYMMETRIC:
      return this.generateSymmetricKey(options);
    case KeyType.ASYMMETRIC_RSA:
      return this.generateRSAKeyPair(options);
    case KeyType.ASYMMETRIC_ECDSA:
    case KeyType.ASYMMETRIC_ECDH:
      return this.generateECKeyPair(options);
    case KeyType.HMAC:
      return this.generateHMACKey(options);
    case KeyType.DERIVATION: return this.generateDerivationKey(options);
  default:
      throw new Error(`Unsupported key type: ${options.type}`);}
  private async generateSymmetricKey(options: KeyGenerationOptions): Promise<Partial<CryptographicKey>> {
    const keySize = options.keySize || this.getDefaultKeySize(options.algorithm);
    const keyData = randomBytes(keySize / 8);
    return {
      keyData
    };
  private async generateRSAKeyPair(options: KeyGenerationOptions): Promise<Partial<CryptographicKey>> {
    // RSA key generation would use Node.js crypto.generateKeyPair
    // For now, return placeholder
    const keySize = options.keySize || 2048;
    const keyData = randomBytes(keySize / 8);
    const publicKey = randomBytes(256);
    const privateKey = randomBytes(keySize / 8);
    return {
      keyData,
      publicKey,
      privateKey
    };
  private async generateECKeyPair(options: KeyGenerationOptions): Promise<Partial<CryptographicKey>> {
    // EC key generation would use Node.js crypto.generateKeyPair
    const keySize = options.keySize || 256;
    const keyData = randomBytes(keySize / 8);
    const publicKey = randomBytes(65); // Uncompressed point;
    const privateKey = randomBytes(keySize / 8);
    return {
      keyData,
      publicKey,
      privateKey
    };
  private async generateHMACKey(options: KeyGenerationOptions): Promise<Partial<CryptographicKey>> {
    const keySize = options.keySize || 256;
    const keyData = randomBytes(keySize / 8);
    return {
      keyData
    };
  private async generateDerivationKey(options: KeyGenerationOptions): Promise<Partial<CryptographicKey>> {
  const keySize = options.keySize || 256;
  const keyData = randomBytes(keySize / 8);
  const salt = randomBytes(32);
  const derivationParams: KeyDerivationParameters = {,
  algorithm: options.algorithm,
  salt,
  iterations: 100000,
  keyLength: keySize / 8,
  ...options.derivationParams
};
    return {
  keyData,
  derivationParameters: derivationParams,
};
  private async performKeyDerivation(parentKey: Buffer, params: KeyDerivationParameters): Promise<Buffer> {
    switch (params.algorithm) {
    case KeyAlgorithm.PBKDF2_SHA256:
      return await pbkdf2Async(parentKey, params.salt, params.iterations || 100000, params.keyLength, 'sha256');
    case KeyAlgorithm.SCRYPT:
      return await scryptAsync(parentKey, params.salt, params.keyLength) as Buffer;
    default:
      throw new Error(`Unsupported derivation algorithm: ${params.algorithm}`);}
  private async wrapKey(key: CryptographicKey): Promise<void> {
    if (!key.keyData) return;
    const masterKey = this.masterKeys.get(key.metadata.tier);
    if (!masterKey) {
      throw new Error(`No master key for tier: ${key.metadata.tier}`);}
    // Simple XOR wrapping (in production, use AES-GCM or similar)
    const wrapped = Buffer.alloc(key.keyData.length);
    for (let i = 0; i < key.keyData.length; i++) {
      wrapped[i] = key.keyData[i] ^ masterKey[i % masterKey.length];
    key.wrappedKeyData = wrapped;
    key.metadata.wrappedBy = 'master_key';
    // Clear plaintext key data for secure storage
    if (key.metadata.tier !== StorageTier.HOT) {
      key.keyData = undefined;
  private async unwrapKey(key: CryptographicKey): Promise<void> {
    if (!key.wrappedKeyData) return;
    const masterKey = this.masterKeys.get(key.metadata.tier);
    if (!masterKey) {
      throw new Error(`No master key for tier: ${key.metadata.tier}`);}
    // Simple XOR unwrapping
    const unwrapped = Buffer.alloc(key.wrappedKeyData.length);
    for (let i = 0; i < key.wrappedKeyData.length; i++) {
      unwrapped[i] = key.wrappedKeyData[i] ^ masterKey[i % masterKey.length];
    key.keyData = unwrapped;
  private async wrapKeyForExport(key: CryptographicKey): Promise<Buffer> {
    if (!key.keyData) {
      throw new Error('Key data not available for export');
    // Use a different wrapping key for exports
    const exportKey = randomBytes(32);
    const wrapped = Buffer.alloc(key.keyData.length);
    for (let i = 0; i < key.keyData.length; i++) {
      wrapped[i] = key.keyData[i] ^ exportKey[i % exportKey.length];
    return wrapped;
  private async storeKey(key: CryptographicKey): Promise<void> {
    const existingKey = this.keys.get(key.metadata.id);
    this.keys.set(key.metadata.id, key);
    // Only set to ACTIVE if this is a new key (not an update)
    if (!existingKey) {
      key.metadata.status = KeyStatus.ACTIVE;
      key.metadata.activatedAt = new Date();
  private async loadKey(keyId: string): Promise<CryptographicKey | null> {
    return this.keys.get(keyId) || null;
  private shouldCacheKey(key: CryptographicKey): boolean {
    return this.config.cacheEnabled && 
           key.metadata.tier === StorageTier.HOT &&
           this.keyCache.size < this.config.hotCacheSize;
  private cacheKey(key: CryptographicKey): void {
    this.keyCache.set(key.metadata.id, {)
  key: { ...key },
      timestamp: new Date();
  });
  private getCachedKey(keyId: string): CryptographicKey | null {
    const cached = this.keyCache.get(keyId);
    if (!cached) return null;
    // Check TTL
    if (Date.now() - cached.timestamp.getTime() > this.config.cacheTTL) {
      this.keyCache.delete(keyId);
      return null;
    return cached.key;
  private async validateKeyAccess(key: CryptographicKey, requesterId: string): Promise<void> {
    // Basic access validation
    if (key.metadata.status !== KeyStatus.ACTIVE) {
      throw new Error(`Key is ${key.metadata.status}`);}
    if (key.metadata.expiresAt && new Date() > key.metadata.expiresAt) {
      throw new Error('Key has expired');
    // Additional access policy checks would go here
  private hasKeyAccess(key: CryptographicKey, requesterId: string): boolean {
    // Simplified access check
    return key.metadata.status === KeyStatus.ACTIVE &&
           (!key.metadata.expiresAt || new Date() < key.metadata.expiresAt);
  private async updateKeyUsage(key: CryptographicKey): Promise<void> {
    key.metadata.usageCount++;
    key.metadata.lastUsed = new Date();
    if (key.metadata.maxUsages && key.metadata.usageCount >= key.metadata.maxUsages) {
      key.metadata.status = KeyStatus.EXPIRED;
  private shouldRotateKey(key: CryptographicKey): boolean {
    if (!key.metadata.expiresAt) return false;
    const daysUntilExpiry = (key.metadata.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
    return daysUntilExpiry <= 7; // Rotate if expiring within 7 days
  private matchesSearchCriteria(key: CryptographicKey, criteria: KeySearchCriteria): boolean {
    if (criteria.type && key.metadata.type !== criteria.type) return false;
    if (criteria.purpose && key.metadata.purpose !== criteria.purpose) return false;
    if (criteria.status && key.metadata.status !== criteria.status) return false;
    if (criteria.tier && key.metadata.tier !== criteria.tier) return false;
    if (criteria.createdAfter && key.metadata.createdAt < criteria.createdAfter) return false;
    if (criteria.createdBefore && key.metadata.createdAt > criteria.createdBefore) return false;
    if (criteria.expiringBefore && (!key.metadata.expiresAt || key.metadata.expiresAt > criteria.expiringBefore)) return false;
    if (criteria.tags) {
      for (const [tagKey, tagValue] of Object.entries(criteria.tags)) {
        if (key.metadata.tags[tagKey] !== tagValue) return false;
    return true;
  private generateMasterKey(tier: StorageTier): Buffer {
    return randomBytes(32); // 256-bit master key
  private generateKeyId(): string {
    return `key_${Date.now()}_${randomBytes(16).toString('hex')}`;}
  private calculateHash(data: Buffer): string {
    return createHash('sha256').update(data).digest('hex');
  private getDefaultKeySize(algorithm: KeyAlgorithm): number {
    switch (algorithm) {
    case KeyAlgorithm.AES_256_GCM:
    case KeyAlgorithm.AES_256_CBC:
      return 256;
    case KeyAlgorithm.RSA_2048:
      return 2048;
    case KeyAlgorithm.RSA_4096:
      return 4096;
    case KeyAlgorithm.ECDSA_P256:
    case KeyAlgorithm.ECDH_P256:
      return 256;
    case KeyAlgorithm.ECDSA_P384:
    case KeyAlgorithm.ECDH_P384: return 384;
  default:
      return 256;
  private async logKeyEvent(key: CryptographicKey)
    event: KeyAuditEvent['event'],
    details: Record<string,
    any>
  ): Promise<void> {
    const auditEvent: KeyAuditEvent = {,
  id: `audit_${Date.now()}_${randomBytes(8).toString('hex')}`}
},
  timestamp: new Date(),
      event,
      userId: details.requesterId || 'system',
      serviceId: details.serviceId,
      ipAddress: details.ipAddress || '127.0.0.1',
      userAgent: details.userAgent,
      details,
      riskScore: this.calculateEventRiskScore(event, details)
    };
    key.metadata.auditTrail.push(auditEvent);
    // Trim audit trail if too long
    if (key.metadata.auditTrail.length > 100) {
  key.metadata.auditTrail = key.metadata.auditTrail.slice(-50);
  private calculateEventRiskScore(event: KeyAuditEvent['event'], details: Record<string, any>): number {,
  switch (event) {
  case 'created': return 10;
  case 'accessed': return 5;
  case 'modified': return 30;
  case 'rotated': return 20;
  case 'revoked': return 50;
  case 'expired': return 15;
  case 'backed_up': return 25;
  case 'restored': return 40;
  default: return 10;
  private updateMetrics(operation: string, duration: number): void {,
  // Update performance metrics
  this.metrics.operationsPerSecond++;
  this.metrics.averageResponseTime = (this.metrics.averageResponseTime + duration) / 2;
  if (operation.includes('error')) {
  this.metrics.errorRate++;
  if (operation === 'cache_hit') {
  this.metrics.hotPathOperations++;
} else {
  this.metrics.slowPathOperations++;
  private updatePerformanceMetrics(): void {,
  // Update cache hit rate
  const totalOps = this.metrics.hotPathOperations + this.metrics.slowPathOperations;
  this.metrics.cacheHitRate = totalOps > 0 ? this.metrics.hotPathOperations / totalOps : 0;
  // Update key counts
  this.metrics.totalKeyCount = this.keys.size;
  this.metrics.activeKeyCount = Array.from(this.keys.values())
  .filter(key => key.metadata.status === KeyStatus.ACTIVE).length;
  // Reset counters
  this.metrics.operationsPerSecond = 0;
  this.metrics.hotPathOperations = 0;
  this.metrics.slowPathOperations = 0;
  private async performBackgroundRotation(): Promise<void> {,
  for (const [keyId, key] of this.keys) {
  if (this.shouldRotateKey(key)) {
  try {
  await this.rotateKey(keyId, 'system', { )
  automatedRotation: true,
  rotationReason: 'automated_expiry_rotation',
});
        } catch (error) {
  this.emit('backgroundRotationError', {)
  keyId,
  error: error instanceof Error ? error.message : 'Unknown error',
});
  private cleanupCache(): void {
    const now = Date.now();
    for (const [keyId, cached] of this.keyCache) {
      if (now - cached.timestamp.getTime() > this.config.cacheTTL) {
        this.keyCache.delete(keyId);
  /**
   * Cleanup and shutdown
   */
  public destroy(): void {
    if (this.performanceTimer) {
      clearInterval(this.performanceTimer);
    this.keyCache.clear();
    this.masterKeys.clear();
    this.removeAllListeners();

// Export default instance
export default KeyManagementService;