/**
 * Key Management System Interfaces - Epic 17.4.4 Implementation
 * Task: E17-1753114397214-9C3464 - Define key management
 * 
 * Comprehensive interfaces and service contracts for the key management system
 * that integrates with existing API key management and permission systems.
 */

import {
  KeyDefinition,
  KeyGenerationRequest,
  KeyRotationRequest,
  KeyRevocationRequest,
  KeyOperationContext,
  KeyEvent,
  KeyMetrics,
  KeyAnalytics,
  KeyManagementConfiguration,
  KeyType,
  KeyStatus,
  KeyOperationType,
  KeyManagementPolicy
 from '../KeyManagementDefinitions';

// =============================================================================
// Service Interfaces
// =============================================================================



export interface IKeyManagementService {
  // Core Key Operations
  generateKey(request: KeyGenerationRequest, context: KeyOperationContext): Promise<KeyDefinition>;
  getKey(keyId: string, context: KeyOperationContext): Promise<KeyDefinition | null>;
  listKeys(filters: KeyListFilters, context: KeyOperationContext): Promise<KeyListResult>;
  updateKey(keyId: string, updates: Partial<KeyDefinition>, context: KeyOperationContext): Promise<KeyDefinition>;
  
  // Lifecycle Operations
  activateKey(keyId: string, context: KeyOperationContext): Promise<boolean>;
  rotateKey(request: KeyRotationRequest, context: KeyOperationContext): Promise<KeyDefinition>;
  revokeKey(request: KeyRevocationRequest, context: KeyOperationContext): Promise<boolean>;
  archiveKey(keyId: string, context: KeyOperationContext): Promise<boolean>;
  destroyKey(keyId: string, context: KeyOperationContext): Promise<boolean>;
  
  // Cryptographic Operations
  encryptData(keyId: string, data: Buffer, context: KeyOperationContext): Promise<EncryptionResult>;
  decryptData(keyId: string, encryptedData: Buffer, context: KeyOperationContext): Promise<Buffer>;
  signData(keyId: string, data: Buffer, context: KeyOperationContext): Promise<Buffer>;
  verifySignature(keyId: string, data: Buffer, signature: Buffer, context: KeyOperationContext): Promise<boolean>;
  deriveKey(parentKeyId: string, derivationParams: any, context: KeyOperationContext): Promise<KeyDefinition>;
  
  // Permission Operations
  grantKeyPermissions(keyId: string, permissions: KeyPermissionGrant[], context: KeyOperationContext): Promise<boolean>;
  revokeKeyPermissions(keyId: string, permissionIds: string[], context: KeyOperationContext): Promise<boolean>;
  checkKeyPermissions(keyId: string, operation: KeyOperationType, context: KeyOperationContext): Promise<PermissionCheckResult>;
  
  // Backup and Recovery
  backupKey(keyId: string, backupOptions: KeyBackupOptions, context: KeyOperationContext): Promise<KeyBackupResult>;
  restoreKey(backupId: string, restoreOptions: KeyRestoreOptions, context: KeyOperationContext): Promise<KeyDefinition>;
  exportKey(keyId: string, exportOptions: KeyExportOptions, context: KeyOperationContext): Promise<Buffer>;
  importKey(keyData: Buffer, importOptions: KeyImportOptions, context: KeyOperationContext): Promise<KeyDefinition>;
  
  // Monitoring and Analytics
  getKeyMetrics(filters?: MetricsFilters): Promise<KeyMetrics>;
  getKeyAnalytics(request: AnalyticsRequest): Promise<KeyAnalytics>;
  getKeyEvents(filters: EventFilters): Promise<KeyEvent[]>;
  
  // Policy Management
  getKeyPolicy(keyId: string): Promise<KeyManagementPolicy | null>;
  setKeyPolicy(keyId: string, policy: KeyManagementPolicy, context: KeyOperationContext): Promise<boolean>;
  validateKeyCompliance(keyId: string): Promise<ComplianceValidationResult>;
  
  // Health and Status
  getServiceHealth(): Promise<ServiceHealthResult>;
  getKeyStatus(keyId: string): Promise<KeyStatusResult>;







export interface IKeyStorageProvider {
  // Basic Storage Operations
  store(keyId: string, keyData: KeyStorageData): Promise<boolean>;
  retrieve(keyId: string): Promise<KeyStorageData | null>;
  update(keyId: string, updates: Partial<KeyStorageData>): Promise<boolean>;
  delete(keyId: string): Promise<boolean>;
  exists(keyId: string): Promise<boolean>;
  
  // Query Operations
  list(filters: StorageFilters): Promise<KeyStorageData[]>;
  count(filters?: StorageFilters): Promise<number>;
  search(criteria: SearchCriteria): Promise<KeyStorageData[]>;
  
  // Batch Operations



  storeBatch(items: Array<{ keyId: string; keyData: KeyStorageData }>): Promise<BatchResult>;
  retrieveBatch(keyIds: string[]): Promise<Array<{ keyId: string; keyData: KeyStorageData | null }>>;
  deleteBatch(keyIds: string[]): Promise<BatchResult>;
  
  // Maintenance Operations
  cleanup(): Promise<CleanupResult>;
  migrate(migrationOptions: MigrationOptions): Promise<MigrationResult>;
  backup(backupOptions: StorageBackupOptions): Promise<StorageBackupResult>;




export interface IKeyAccessController {
  // Access Control
  checkAccess(keyId: string, operation: KeyOperationType, context: KeyOperationContext): Promise<AccessDecision>;
  grantAccess(keyId: string, principal: string, permissions: string[], context: KeyOperationContext): Promise<boolean>;
  revokeAccess(keyId: string, principal: string, permissions: string[], context: KeyOperationContext): Promise<boolean>;
  
  // Policy Evaluation
  evaluatePolicy(keyId: string, operation: KeyOperationType, context: KeyOperationContext): Promise<PolicyEvaluationResult>;
  createPolicy(policy: AccessPolicy, context: KeyOperationContext): Promise<string>;
  updatePolicy(policyId: string, updates: Partial<AccessPolicy>, context: KeyOperationContext): Promise<boolean>;
  deletePolicy(policyId: string, context: KeyOperationContext): Promise<boolean>;
  
  // Session Management
  createSession(keyId: string, context: KeyOperationContext): Promise<AccessSession>;
  validateSession(sessionId: string): Promise<boolean>;
  extendSession(sessionId: string, extensionMinutes: number): Promise<boolean>;
  terminateSession(sessionId: string): Promise<boolean>;







export interface IKeyAuditLogger {
  // Event Logging
  logEvent(event: KeyEvent): Promise<boolean>;
  logBatch(events: KeyEvent[]): Promise<BatchResult>;
  
  // Event Retrieval
  getEvents(filters: EventFilters): Promise<KeyEvent[]>;
  getEventById(eventId: string): Promise<KeyEvent | null>;
  
  // Analytics
  getEventAnalytics(request: EventAnalyticsRequest): Promise<EventAnalytics>;
  getComplianceReport(request: ComplianceReportRequest): Promise<ComplianceReport>;
  
  // Maintenance
  archiveEvents(olderThan: Date): Promise<number>;
  purgeEvents(olderThan: Date): Promise<number>;





// =============================================================================
// Data Transfer Objects
// =============================================================================



export interface KeyListFilters {
  keyTypes?: KeyType[];
  statuses?: KeyStatus[];
  purposes?: string[];
  ownerId?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  expiringBefore?: Date;
  tags?: Record<string, string>;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';







export interface KeyListResult {
  keys: KeyDefinition[];
  total: number;
  hasMore: boolean;
  filters: KeyListFilters;







export interface KeyPermissionGrant {
  principalId: string;
  principalType: 'user' | 'service' | 'role';
  permissions: string[];
  conditions?: Record<string, any>;
  expiresAt?: Date;
  reason: string;







export interface PermissionCheckResult {
  allowed: boolean;
  permissions: string[];
  conditions: Record<string, any>;
  reason: string;
  ttl?: number;







export interface KeyBackupOptions {
  backupType: 'full' | 'metadata' | 'keys_only';
  encryption: boolean;
  compression: boolean;
  storageLocation?: string;
  retention?: number;







export interface KeyBackupResult {
  backupId: string;
  createdAt: Date;
  size: number;
  checksum: string;
  storageLocation: string;
  encrypted: boolean;







export interface KeyRestoreOptions {
  validateChecksum: boolean;
  overwriteExisting: boolean;
  restorePermissions: boolean;
  newOwnerId?: string;







export interface KeyExportOptions {
  format: 'pem' | 'jwk' | 'pkcs8' | 'pkcs12' | 'raw';
  includePrivateKey: boolean;
  encryption?: {
    algorithm: string;
    passphrase: string;



  };




export interface KeyImportOptions {
  format: 'pem' | 'jwk' | 'pkcs8' | 'pkcs12' | 'raw';
  passphrase?: string;
  keyName?: string;
  purpose?: string;
  overwriteExisting?: boolean;







export interface EncryptionResult {
  encryptedData: Buffer;
  nonce?: Buffer;
  tag?: Buffer;
  algorithm: string;
  keyId: string;







export interface MetricsFilters {
  timeRange?: {
    start: Date;
    end: Date;



  };
  keyTypes?: KeyType[];
  operations?: KeyOperationType[];
  users?: string[];




export interface AnalyticsRequest {
  timeRange: {
    start: Date;
    end: Date;



  };
  granularity: 'hour' | 'day' | 'week' | 'month';
  includeUsage: boolean;
  includeSecurity: boolean;
  includePerformance: boolean;
  includeCompliance: boolean;




export interface EventFilters {
  timeRange?: {
    start: Date;
    end: Date;



  };
  eventTypes?: KeyOperationType[];
  keyIds?: string[];
  userIds?: string[];
  success?: boolean;
  riskScoreMin?: number;
  riskScoreMax?: number;
  limit?: number;
  offset?: number;




export interface ComplianceValidationResult {
  compliant: boolean;
  violations: ComplianceViolation[];
  warnings: ComplianceWarning[];
  framework: string;
  validatedAt: Date;







export interface ComplianceViolation {
  violationType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  requirement: string;
  remediation: string;







export interface ComplianceWarning {
  warningType: string;
  description: string;
  recommendation: string;







export interface ServiceHealthResult {
  healthy: boolean;
  version: string;
  uptime: number;
  dependencies: DependencyHealth[];
  metrics: {
    totalKeys: number;
    activeKeys: number;
    operationsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;



  };
  issues: ServiceIssue[];




export interface DependencyHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastCheck: Date;
  message?: string;







export interface ServiceIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  firstSeen: Date;
  count: number;







export interface KeyStatusResult {
  keyId: string;
  status: KeyStatus;
  isAccessible: boolean;
  lastUsed?: Date;
  nextRotation?: Date;
  permissions: string[];
  warnings: string[];
  healthScore: number;





// =============================================================================
// Storage and Persistence Interfaces
// =============================================================================



export interface KeyStorageData {
  keyId: string;
  keyDefinition: KeyDefinition;
  encryptedKeyMaterial?: Buffer;
  keyMaterialChecksum: string;
  storageMetadata: StorageMetadata;
  accessMetadata: AccessMetadata;
  complianceMetadata: ComplianceMetadata;







export interface StorageMetadata {
  storedAt: Date;
  updatedAt: Date;
  version: number;
  tier: string;
  compressed: boolean;
  encrypted: boolean;
  backupCount: number;
  lastBackup?: Date;







export interface AccessMetadata {
  lastAccess?: Date;
  accessCount: number;
  failedAccessCount: number;
  lastFailedAccess?: Date;
  concurrentSessions: number;
  averageSessionDuration: number;







export interface ComplianceMetadata {
  frameworks: string[];
  classifications: string[];
  retentionRequirement: number;
  destructionDate?: Date;
  auditRequired: boolean;
  lastAudit?: Date;







export interface StorageFilters {
  keyTypes?: KeyType[];
  statuses?: KeyStatus[];
  storageTier?: string;
  createdAfter?: Date;
  updatedAfter?: Date;
  tags?: Record<string, string>;







export interface SearchCriteria {
  query: string;
  fields: string[];
  operators: Record<string, any>;
  fuzzy: boolean;
  limit: number;







export interface BatchResult {
  successful: number;
  failed: number;



  errors: Array<{ id: string; error: string }>;




export interface CleanupResult {
  deletedKeys: number;
  archivedKeys: number;
  freedSpace: number;
  duration: number;







export interface MigrationOptions {
  sourceVersion: string;
  targetVersion: string;
  batchSize: number;
  validateData: boolean;
  createBackup: boolean;







export interface MigrationResult {
  migratedKeys: number;
  failedKeys: number;
  duration: number;
  backupId?: string;



  issues: Array<{ keyId: string; issue: string }>;




export interface StorageBackupOptions {
  includeMetadata: boolean;
  compressionLevel: number;
  encryptBackup: boolean;
  destination: string;







export interface StorageBackupResult {
  backupId: string;
  keyCount: number;
  size: number;
  compressed: boolean;
  encrypted: boolean;
  checksum: string;
  location: string;





// =============================================================================
// Access Control Interfaces
// =============================================================================



export interface AccessDecision {
  allowed: boolean;
  reason: string;
  permissions: string[];
  conditions: Record<string, any>;
  sessionId?: string;
  expires?: Date;







export interface AccessPolicy {
  policyId: string;
  name: string;
  description: string;
  effect: 'allow' | 'deny';
  principals: PolicyPrincipal[];
  resources: string[];
  actions: string[];
  conditions: PolicyCondition[];
  createdAt: Date;
  version: number;







export interface PolicyPrincipal {
  type: 'user' | 'service' | 'role' | 'group';
  identifier: string;







export interface PolicyCondition {
  key: string;
  operator: string;
  values: any[];







export interface PolicyEvaluationResult {
  decision: 'allow' | 'deny' | 'not_applicable';
  matchingPolicies: string[];
  evaluationContext: Record<string, any>;
  cacheable: boolean;
  cacheTtl?: number;







export interface AccessSession {
  sessionId: string;
  keyId: string;
  principalId: string;
  createdAt: Date;
  expiresAt: Date;
  permissions: string[];
  usageCount: number;
  lastActivity: Date;





// =============================================================================
// Event and Audit Interfaces
// =============================================================================



export interface EventAnalyticsRequest {
  timeRange: {
    start: Date;
    end: Date;



  };
  groupBy: 'hour' | 'day' | 'week' | 'user' | 'operation' | 'key';
  includeSuccess: boolean;
  includeFailures: boolean;
  includeAnomalies: boolean;




export interface EventAnalytics {
  timeRange: {
    start: Date;
    end: Date;



  };
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  anomalousEvents: number;
  breakdown: Record<string, number>;
  trends: Array<{ timestamp: Date; value: number }>;
  topUsers: Array<{ userId: string; count: number }>;
  topOperations: Array<{ operation: string; count: number }>;
  riskDistribution: Record<string, number>;




export interface ComplianceReportRequest {
  framework: string;
  timeRange: {
    start: Date;
    end: Date;



  };
  includeDetails: boolean;
  keyIds?: string[];




export interface ComplianceReport {
  framework: string;
  reportId: string;
  generatedAt: Date;
  timeRange: {
    start: Date;
    end: Date;



  };
  overallCompliance: number;
  totalRequirements: number;
  metRequirements: number;
  violations: ComplianceViolation[];
  recommendations: string[];
  keyDetails: Array<{
    keyId: string;
    compliant: boolean;
    violations: ComplianceViolation[];
>;


// =============================================================================
// Factory and Configuration Interfaces
// =============================================================================



export interface IKeyManagementServiceFactory {
  createService(config: KeyManagementConfiguration): IKeyManagementService;
  createStorageProvider(type: string, config: any): IKeyStorageProvider;
  createAccessController(config: any): IKeyAccessController;
  createAuditLogger(config: any): IKeyAuditLogger;







export interface ServiceConfiguration {
  storage: {
    primary: string;
    backup?: string;
    cache?: string;



  };
  security: {
    encryption: boolean;
    hsmEnabled: boolean;
    accessControl: boolean;
  };
  monitoring: {
    metrics: boolean;
    events: boolean;
    alerts: boolean;
  };
  compliance: {
    enabled: boolean;
    frameworks: string[];
    auditRetention: number;
  };


export default {
  IKeyManagementService,
  IKeyStorageProvider,
  IKeyAccessController,
  IKeyAuditLogger,
  IKeyManagementServiceFactory
};