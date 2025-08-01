/**
 * Key Management System Definitions - Epic 17.4.4 Implementation
 * Task: E17-1753114397214-9C3464 - Define key management
 * 
 * Comprehensive key management system definitions that extend existing infrastructure
 * for the Backstage Admin Controls system. Provides formal specifications for API key
 * lifecycle management, cryptographic operations, access control, and compliance.
 */

import { ApiPermissionType, ApiPermissionAction, ApiPermissionScope } from './services/ApiPermissionAssignmentService';

// =============================================================================
// Core Key Management Types
// =============================================================================

export enum KeyType {
  // API Management Keys
  API_ACCESS_KEY = 'api_access_key',
  API_SECRET_KEY = 'api_secret_key',
  API_SIGNING_KEY = 'api_signing_key',
  
  // System Keys  
  MASTER_KEY = 'master_key',
  ENCRYPTION_KEY = 'encryption_key',
  SIGNING_KEY = 'signing_key',
  
  // Session Keys
  SESSION_KEY = 'session_key',
  TEMPORARY_KEY = 'temporary_key',
  
  // Cryptographic Keys
  SYMMETRIC_KEY = 'symmetric_key',
  ASYMMETRIC_KEY = 'asymmetric_key',
  HMAC_KEY = 'hmac_key',
  
  // Special Purpose Keys
  BACKUP_KEY = 'backup_key',
  RECOVERY_KEY = 'recovery_key',
  AUDIT_KEY = 'audit_key'


export enum KeyStatus {
  PENDING = 'pending',        // Key created but not yet active
  ACTIVE = 'active',          // Key is active and can be used
  EXPIRING = 'expiring',      // Key is approaching expiration
  EXPIRED = 'expired',        // Key has expired but not yet revoked
  ROTATING = 'rotating',      // Key is in rotation process
  REVOKED = 'revoked',        // Key has been revoked
  COMPROMISED = 'compromised',// Key suspected of being compromised
  ARCHIVED = 'archived',      // Key archived for compliance
  DESTROYED = 'destroyed'     // Key permanently destroyed


export enum KeyAlgorithm {
  // Symmetric Algorithms
  AES_128_GCM = 'aes-128-gcm',
  AES_256_GCM = 'aes-256-gcm',
  AES_128_CBC = 'aes-128-cbc', 
  AES_256_CBC = 'aes-256-cbc',
  CHACHA20_POLY1305 = 'chacha20-poly1305',
  
  // Asymmetric Algorithms
  RSA_2048 = 'rsa-2048',
  RSA_3072 = 'rsa-3072',
  RSA_4096 = 'rsa-4096',
  ECDSA_P256 = 'ecdsa-p256',
  ECDSA_P384 = 'ecdsa-p384',
  ECDSA_P521 = 'ecdsa-p521',
  ECDH_P256 = 'ecdh-p256',
  ECDH_P384 = 'ecdh-p384',
  ED25519 = 'ed25519',
  
  // Hash-based
  HMAC_SHA256 = 'hmac-sha256',
  HMAC_SHA384 = 'hmac-sha384',
  HMAC_SHA512 = 'hmac-sha512',
  
  // Key Derivation
  PBKDF2_SHA256 = 'pbkdf2-sha256',
  SCRYPT = 'scrypt',
  ARGON2ID = 'argon2id'


export enum KeySecurityLevel {
  LOW = 'low',              // Basic protection
  STANDARD = 'standard',    // Standard enterprise security
  HIGH = 'high',           // Enhanced security
  CRITICAL = 'critical',   // Maximum security
  ULTRA = 'ultra'         // Ultra-high security with HSM


export enum KeyStorageTier {
  MEMORY = 'memory',       // In-memory cache (fastest)
  DATABASE = 'database',   // Encrypted database storage
  FILE = 'file',          // Encrypted file storage
  HSM = 'hsm',            // Hardware Security Module
  CLOUD = 'cloud',        // Cloud key management service
  HYBRID = 'hybrid'       // Multi-tier storage


// =============================================================================
// Key Management Interfaces
// =============================================================================



export interface KeyDefinition {
  // Identity
  keyId: string;
  keyName: string;
  keyType: KeyType;
  
  // Cryptographic Properties
  algorithm: KeyAlgorithm;
  keySize: number;
  version: number;
  
  // Security
  securityLevel: KeySecurityLevel;
  storageTier: KeyStorageTier;
  
  // Lifecycle
  status: KeyStatus;
  createdAt: Date;
  activatedAt?: Date;
  expiresAt?: Date;
  lastUsedAt?: Date;
  rotatedAt?: Date;
  
  // Usage Tracking
  usageCount: number;
  maxUsageCount?: number;
  
  // Access Control
  ownerId: string;
  authorizedUsers: string[];
  authorizedServices: string[];
  permissions: KeyPermission[];
  
  // Metadata
  purpose: string;
  description?: string;
  tags: Record<string, string>;
  complianceLabels: string[];
  
  // Technical
  keyMaterial?: Buffer;      // Encrypted key data
  publicKey?: Buffer;        // Public key for asymmetric keys
  parentKeyId?: string;      // For derived keys
  derivationParams?: KeyDerivationParams;







export interface KeyPermission {
  permissionId: string;
  permissionType: ApiPermissionType;
  action: ApiPermissionAction;
  scope: ApiPermissionScope;
  resourcePattern: string;
  conditions?: PermissionCondition[];
  grantedAt: Date;
  grantedBy: string;
  expiresAt?: Date;







export interface PermissionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'gte' | 'lt' | 'lte' | 'regex' | 'exists';
  value: unknown;
  logicalOperator?: 'AND' | 'OR';







export interface KeyDerivationParams {
  algorithm: KeyAlgorithm;
  salt: Buffer;
  iterations?: number;
  memoryFactor?: number;
  parallelism?: number;
  keyLength: number;
  additionalData?: Buffer;





// =============================================================================
// Key Management Operations
// =============================================================================



export interface KeyGenerationRequest {
  keyName: string;
  keyType: KeyType;
  algorithm: KeyAlgorithm;
  keySize?: number;
  securityLevel: KeySecurityLevel;
  storageTier?: KeyStorageTier;
  purpose: string;
  description?: string;
  expirationDays?: number;
  maxUsageCount?: number;
  permissions?: KeyPermissionRequest[];
  tags?: Record<string, string>;
  complianceLabels?: string[];
  parentKeyId?: string;
  derivationParams?: Partial<KeyDerivationParams>;







export interface KeyPermissionRequest {
  permissionType: ApiPermissionType;
  action: ApiPermissionAction;
  scope: ApiPermissionScope;
  resourcePattern: string;
  conditions?: PermissionCondition[];
  expiresAt?: Date;







export interface KeyRotationRequest {
  keyId: string;
  reason: string;
  gracePeriodHours?: number;
  forceRotation?: boolean;
  notifyUsers?: boolean;
  inheritPermissions?: boolean;







export interface KeyRevocationRequest {
  keyId: string;
  reason: string;
  revokedBy: string;
  effectiveAt?: Date;
  notifyUsers?: boolean;







export interface KeyOperationContext {
  operationId: string;
  userId: string;
  sessionId?: string;
  ipAddress: string;
  userAgent?: string;
  timestamp: Date;
  operationType: KeyOperationType;
  requestedResource?: string;
  securityContext?: SecurityContext;
  auditMetadata?: Record<string, unknown>;







export interface SecurityContext {
  authenticationLevel: 'basic' | 'mfa' | 'strong' | 'certificate';
  authorizationLevel: 'user' | 'admin' | 'system';
  riskScore: number;
  trustLevel: 'untrusted' | 'low' | 'medium' | 'high';
  deviceInfo?: DeviceInfo;
  locationInfo?: LocationInfo;







export interface DeviceInfo {
  deviceId?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'server' | 'iot';
  isManaged: boolean;
  isTrusted: boolean;
  lastSeen?: Date;







export interface LocationInfo {
  country?: string;
  region?: string;
  city?: string;
  ipAddress: string;
  isTrustedLocation: boolean;
  vpnDetected?: boolean;





// =============================================================================
// Key Management Policies
// =============================================================================



export interface KeyManagementPolicy {
  policyId: string;
  policyName: string;
  description: string;
  
  // Scope
  appliesToKeyTypes: KeyType[];
  appliesToSecurityLevels: KeySecurityLevel[];
  appliesToPurposes: string[];
  
  // Generation Policies
  generationRules: KeyGenerationRules;
  
  // Rotation Policies
  rotationRules: KeyRotationRules;
  
  // Access Policies
  accessRules: KeyAccessRules;
  
  // Compliance
  complianceRequirements: ComplianceRequirement[];
  
  // Lifecycle
  createdAt: Date;
  updatedAt: Date;
  version: number;
  isActive: boolean;







export interface KeyGenerationRules {
  minimumKeySize: number;
  allowedAlgorithms: KeyAlgorithm[];
  requiredSecurityLevel: KeySecurityLevel;
  defaultExpirationDays: number;
  maximumExpirationDays?: number;
  requireApproval: boolean;
  approvalRoles: string[];
  mandatoryTags: string[];
  forbiddenPurposes?: string[];







export interface KeyRotationRules {
  mandatoryRotationDays: number;
  warningDays: number;
  gracePeriodHours: number;
  autoRotationEnabled: boolean;
  requireApprovalForManual: boolean;
  maxUsageBeforeRotation?: number;
  rotationOnCompromise: boolean;







export interface KeyAccessRules {
  requireMFA: boolean;
  allowedRoles: string[];
  restrictedOperations: KeyOperationType[];
  timeRestrictions?: TimeRestriction[];
  locationRestrictions?: LocationRestriction[];
  concurrentAccessLimit?: number;
  sessionTimeout: number;
  auditAllAccess: boolean;







export interface TimeRestriction {
  allowedHours: number[];      // 0-23
  allowedDays: number[];       // 0-6 (Sunday-Saturday)
  timezone: string;
  exceptions?: TimeException[];







export interface TimeException {
  startTime: Date;
  endTime: Date;
  reason: string;
  approvedBy: string;







export interface LocationRestriction {
  allowedCountries?: string[];
  blockedCountries?: string[];
  allowedNetworks?: string[];  // CIDR blocks
  blockedNetworks?: string[];
  allowVPN: boolean;
  allowMobileData: boolean;







export interface ComplianceRequirement {
  framework: string;          // e.g., 'SOC2', 'PCI-DSS', 'FIPS-140-2'
  requirement: string;
  description: string;
  mandatoryFields: string[];
  validationRules: ValidationRule[];
  retentionPeriod: number;    // days







export interface ValidationRule {
  field: string;
  rule: 'required' | 'min_length' | 'max_length' | 'pattern' | 'enum';
  value?: unknown;
  errorMessage: string;





// =============================================================================
// Key Management Operations and Events  
// =============================================================================

export enum KeyOperationType {
  // Lifecycle Operations
  GENERATE = 'generate',
  ACTIVATE = 'activate', 
  ROTATE = 'rotate',
  REVOKE = 'revoke',
  DESTROY = 'destroy',
  ARCHIVE = 'archive',
  
  // Access Operations
  READ = 'read',
  USE = 'use',
  EXPORT = 'export',
  IMPORT = 'import',
  
  // Cryptographic Operations
  ENCRYPT = 'encrypt',
  DECRYPT = 'decrypt',
  SIGN = 'sign',
  VERIFY = 'verify',
  DERIVE = 'derive',
  
  // Administrative Operations
  UPDATE_PERMISSIONS = 'update_permissions',
  UPDATE_METADATA = 'update_metadata',
  BACKUP = 'backup',
  RESTORE = 'restore',
  AUDIT = 'audit'




export interface KeyEvent {
  eventId: string;
  eventType: KeyOperationType;
  keyId: string;
  timestamp: Date;
  userId: string;
  sessionId?: string;
  
  // Context
  ipAddress: string;
  userAgent?: string;
  deviceInfo?: DeviceInfo;
  
  // Event Details
  operationSuccess: boolean;
  errorMessage?: string;
  oldValue?: unknown;
  newValue?: unknown;
  
  // Security
  riskScore: number;
  anomalyDetected: boolean;
  securityFlags: string[];
  
  // Compliance
  complianceContext: ComplianceContext;
  
  // Metadata
  metadata: Record<string, unknown>;







export interface ComplianceContext {
  frameworks: string[];
  requirements: string[];
  evidenceLevel: 'minimal' | 'standard' | 'enhanced' | 'comprehensive';
  retentionRequired: boolean;
  retentionPeriod?: number;
  classification?: string;





// =============================================================================
// Key Management Analytics and Monitoring
// =============================================================================



export interface KeyMetrics {
  // Key Counts
  totalKeys: number;
  activeKeys: number;
  expiredKeys: number;
  revokedKeys: number;
  rotatingKeys: number;
  
  // Usage Statistics
  totalOperations: number;
  operationsLastHour: number;
  operationsLastDay: number;
  averageOperationsPerKey: number;
  
  // Security Metrics
  failedOperations: number;
  anomaliesDetected: number;
  compromisedKeys: number;
  emergencyRevocations: number;
  
  // Performance Metrics
  averageResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  
  // Compliance Metrics
  complianceViolations: number;
  auditEventsGenerated: number;
  retentionCompliance: number;
  
  // Operational Metrics
  scheduledRotations: number;
  emergencyRotations: number;
  backupsCreated: number;
  recoveriesPerformed: number;







export interface KeyAnalytics {
  timeRange: {
    start: Date;
    end: Date;



  };
  
  // Usage Patterns
  usageByKeyType: Record<KeyType, number>;
  usageByPurpose: Record<string, number>;
  usageByUser: Array<{ userId: string; count: number }>;
  usageByHour: number[];
  usageByDay: number[];
  
  // Security Analytics
  riskDistribution: Record<string, number>;
  anomaliesByType: Record<string, number>;
  failuresByReason: Record<string, number>;
  
  // Lifecycle Analytics
  keyAgeDistribution: Array<{ ageRange: string; count: number }>;
  rotationFrequency: Array<{ period: string; count: number }>;
  expirationForecast: Array<{ date: Date; count: number }>;
  
  // Performance Analytics
  responseTimePercentiles: Record<string, number>;
  throughputTrends: Array<{ timestamp: Date; value: number }>;
  resourceUtilization: Record<string, number>;


// =============================================================================
// Key Management Configuration
// =============================================================================



export interface KeyManagementConfiguration {
  // Service Configuration
  serviceName: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  
  // Storage Configuration
  defaultStorageTier: KeyStorageTier;
  storageConfigs: Record<KeyStorageTier, StorageConfig>;
  
  // Encryption Configuration
  masterKeyConfig: MasterKeyConfig;
  encryptionDefaults: EncryptionDefaults;
  
  // Policy Configuration
  defaultPolicies: Record<KeyType, KeyManagementPolicy>;
  customPolicies: KeyManagementPolicy[];
  
  // Security Configuration
  securityDefaults: SecurityDefaults;
  accessControlConfig: AccessControlConfig;
  
  // Compliance Configuration
  complianceMode: boolean;
  enabledFrameworks: string[];
  auditConfiguration: AuditConfiguration;
  
  // Monitoring Configuration
  metricsEnabled: boolean;
  alertingConfig: AlertingConfig;
  
  // Performance Configuration
  cacheConfiguration: CacheConfiguration;
  concurrencyLimits: ConcurrencyLimits;







export interface StorageConfig {
  provider: string;
  endpoint?: string;
  credentials: Record<string, string>;
  encryption: {
    enabled: boolean;
    algorithm: string;
    keyId?: string;



  };
  backup: {
    enabled: boolean;
    schedule: string;
    retention: number;
  };




export interface MasterKeyConfig {
  algorithm: KeyAlgorithm;
  keySize: number;
  rotationInterval: number;
  backupEnabled: boolean;
  hsmEnabled: boolean;
  hsmConfig?: HSMConfig;







export interface HSMConfig {
  provider: 'aws-cloudhsm' | 'azure-keyvault' | 'gcp-hsm' | 'pkcs11';
  endpoint: string;
  credentials: Record<string, string>;
  keySlots: number[];







export interface EncryptionDefaults {
  symmetricAlgorithm: KeyAlgorithm;
  asymmetricAlgorithm: KeyAlgorithm;
  signingAlgorithm: KeyAlgorithm;
  hashingAlgorithm: string;
  keyDerivationAlgorithm: KeyAlgorithm;







export interface SecurityDefaults {
  minimumKeySize: number;
  defaultSecurityLevel: KeySecurityLevel;
  requireMFA: boolean;
  sessionTimeout: number;
  maxFailedAttempts: number;
  accountLockoutDuration: number;







export interface AccessControlConfig {
  enabled: boolean;
  defaultDeny: boolean;
  permissionCaching: boolean;
  cacheTTL: number;
  auditAllDecisions: boolean;







export interface AuditConfiguration {
  enabled: boolean;
  logAllOperations: boolean;
  retentionPeriod: number;
  encryptLogs: boolean;
  signLogs: boolean;
  realTimeAlerting: boolean;







export interface AlertingConfig {
  enabled: boolean;
  alertChannels: string[];
  thresholds: {
    errorRate: number;
    responseTime: number;
    failedAuthentications: number;
    anomaliesPerHour: number;



  };




export interface CacheConfiguration {
  enabled: boolean;
  provider: 'memory' | 'redis';
  ttl: number;
  maxSize: number;
  compressionEnabled: boolean;







export interface ConcurrencyLimits {
  maxConcurrentOperations: number;
  maxConcurrentGenerations: number;
  maxConcurrentRotations: number;
  rateLimits: Record<KeyOperationType, number>;





// =============================================================================
// Export Statement
// =============================================================================

export default {
  KeyType,
  KeyStatus, 
  KeyAlgorithm,
  KeySecurityLevel,
  KeyStorageTier,
  KeyOperationType
};