/**
 * Security Event Configuration
 * Centralized configuration for security logging and compliance requirements
 * Part of Epic 19 - Security & Compliance Framework
 */
import { ComplianceFramework, DataSensitivityLevel } from './DataProtectionEventLogger';


export interface SecurityEventConfig { logging: LoggingConfiguration;
  alerting: AlertingConfiguration;
  retention: RetentionConfiguration;
  compliance: ComplianceConfiguration;
  performance: PerformanceConfiguration }



export interface LoggingConfiguration { enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  destinations: LogDestination;
  encryption: EncryptionConfiguration;
  batchSize: number;
  flushInterval: number; // milliseconds }
  bufferSize: number;
  enableCircuitBreaker: boolean;
  circuitBreakerConfig: CircuitBreakerConfiguration;




export interface LogDestination { type: 'file' | 'database' | 'siem' | 'webhook' | 'elasticsearch' }
  config: Record<string, any>;
  enabled: boolean;
  filters: LogFilter;
  formatters: LogFormatter;




export interface LogFilter { field: string;
  operator: 'equals' | 'contains' | 'regex' | 'greater_than' | 'less_than';
  value: any;
  invert: boolean }



export interface LogFormatter { type: 'json' | 'structured' | 'syslog' | 'cef' | 'leef';
  template?: string;
  includeFields?: string;
  excludeFields?: string }



export interface EncryptionConfiguration { enabled: boolean;
  algorithm: 'AES-256-GCM' | 'AES-256-CBC';
  keyRotationInterval: number; // days }
  encryptSensitiveFields: boolean;
  sensitiveFields: string;




export interface CircuitBreakerConfiguration { failureThreshold: number;
  resetTimeout: number; // milliseconds;
  monitoringPeriod: number; // milliseconds }
  enabled: boolean;




export interface AlertingConfiguration { enabled: boolean;
  rules: SecurityAlertRule;
  channels: AlertChannel;
  suppressionRules: SuppressionRule;
  escalationPolicies: EscalationPolicy }



export interface SecurityAlertRule { id: string;
  name: string;
  description: string;
  enabled: boolean;
  eventTypes: string;
  conditions: AlertCondition;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string; // Channel IDs;
  suppressionRules?: string; // Suppression rule IDs;
  escalationPolicy?: string; // Escalation policy ID }
  metadata: Record<string, any>;




export interface AlertCondition { type: 'threshold' | 'pattern' | 'anomaly' | 'correlation';
  field: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'contains' | 'regex' | 'exists';
  value: any;
  timeWindow: number; // minutes }
  aggregation?: 'count' | 'sum' | 'avg' | 'max' | 'min';
  groupBy?: string;




export interface AlertChannel { id: string;
  type: 'email' | 'webhook' | 'slack' | 'pagerduty' | 'sms';
  config: Record<string, any>;
  enabled: boolean;
  rateLimits: RateLimit }



export interface RateLimit { maxAlerts: number;
  timeWindow: number; // minutes;
  severity?: 'low' | 'medium' | 'high' | 'critical' }




export interface SuppressionRule { id: string;
  name: string;
  enabled: boolean;
  conditions: AlertCondition;
  duration: number; // minutes }
  reason: string;




export interface EscalationPolicy { id: string;
  name: string;
  enabled: boolean;
  steps: EscalationStep }



export interface EscalationStep { delay: number; // minutes;
  channels: string;
  condition?: 'unacknowledged' | 'unresolved' }




export interface RetentionConfiguration { policies: RetentionPolicy;
  archival: ArchivalConfiguration;
  deletion: DeletionConfiguration }



export interface RetentionPolicy { id: string;
  name: string;
  framework: ComplianceFramework;
  eventTypes: string;
  dataClassifications: DataSensitivityLevel;
  retentionPeriod: number; // days }
  archivalRequired: boolean;
  encryptionRequired: boolean;
  immutableStorage: boolean;
  purgeAfterRetention: boolean;
  exceptions: RetentionException;




export interface RetentionException { reason: 'legal_hold' | 'investigation' | 'regulatory_request' | 'data_subject_request';
  extendedPeriod: number; // days }
  approvalRequired: boolean;
  notificationRequired: boolean;




export interface ArchivalConfiguration { enabled: boolean;
  storageBackend: 'file' | 's3' | 'azure_blob' | 'gcs';
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  verificationEnabled: boolean }



export interface DeletionConfiguration { enabled: boolean;
  scheduledDeletion: boolean;
  batchSize: number;
  verificationRequired: boolean;
  backupBeforeDeletion: boolean;
  auditDeletion: boolean }



export interface ComplianceConfiguration { frameworks: ComplianceFrameworkConfig;
  reporting: ReportingConfiguration;
  monitoring: ComplianceMonitoringConfiguration }



export interface ComplianceFrameworkConfig { framework: ComplianceFramework;
  enabled: boolean;
  requirements: ComplianceRequirement;
  reportingFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  alertOnViolations: boolean }



export interface ComplianceRequirement { id: string;
  name: string;
  description: string;
  mandatory: boolean;
  eventTypes: string;
  validationRules: ValidationRule }



export interface ValidationRule { field: string;
  required: boolean;
  validation: 'regex' | 'range' | 'enum' | 'custom' }
  value: any;
  message: string;




export interface ReportingConfiguration { enabled: boolean;
  autoGeneration: boolean;
  outputFormats: ('json' | 'csv' | 'pdf' | 'xlsx')[] }
  recipients: ReportRecipient;
  schedules: ReportSchedule;




export interface ReportRecipient { email: string;
  role: string;
  frameworks: ComplianceFramework;
  reportTypes: string }



export interface ReportSchedule { id: string;
  framework: ComplianceFramework;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  time: string; // HH:MM format }
  enabled: boolean;




export interface ComplianceMonitoringConfiguration { enabled: boolean;
  continuousMonitoring: boolean;
  violationAlerts: boolean;
  dashboardEnabled: boolean;
  metricsCollection: boolean }



export interface PerformanceConfiguration { monitoring: {;
  enabled: boolean;
  metricsCollectionInterval: number; // milliseconds }
  alertThresholds: PerformanceThreshold;


};
  optimization: { ,
  asyncLogging: boolean;
  batchProcessing: boolean;
  caching: CacheConfiguration;
  compression: boolean };
  scaling: { ,
  autoScaling: boolean;
  maxConcurrentEvents: number;
  queueMaxSize: number;
  workerPoolSize: number };


export interface PerformanceThreshold { metric: 'latency' | 'throughput' | 'error_rate' | 'queue_depth';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'log' | 'alert' | 'throttle' | 'circuit_break' }




export interface CacheConfiguration { enabled: boolean;
  type: 'memory' | 'redis' | 'memcached';
  ttl: number; // seconds;
  maxSize: number; // entries }
  evictionPolicy: 'lru' | 'lfu' | 'fifo';
  /**
  * Default Security Event Configuration
  * Production-ready configuration with security best practices
  */


export const DEFAULT_SECURITY_EVENT_CONFIG: SecurityEventConfig = { ,
  logging: {,
  enabled: true,
  level: 'info',
  destinations: [
  {
  type: 'database',
  config: {,
  table: 'security_events',
  connection: 'default' }
},
  enabled: true,
        filters: [],
        formatters: [{ type: 'json' }]

      { type: 'file',
  config: {,
  path: '/var/log/security/events.log',
  rotationPolicy: 'daily',
  maxSize: '100MB' }
},
  enabled: true,
        filters: [],
        formatters: [{ type: 'structured' }]
    ],
    encryption: { ,
  enabled: true,
  algorithm: 'AES-256-GCM',
  keyRotationInterval: 90,
  encryptSensitiveFields: true,
  sensitiveFields: ['userId', 'dataSubject', 'personalData'] }
},
  batchSize: 100,
    flushInterval: 5000,
    bufferSize: 1000,
    enableCircuitBreaker: true,
    circuitBreakerConfig: { ,
  failureThreshold: 5,
  resetTimeout: 60000,
  monitoringPeriod: 30000,
  enabled: true }
},
  alerting: { ,
  enabled: true,
    rules: [
      {
        id: 'failed-deletions',
        name: 'Failed Data Deletions',
        description: 'Alert on multiple failed data deletion attempts',
        enabled: true,
        eventTypes: ['data_deletion_failed'],
        conditions: [
          {
            type: 'threshold',
            field: 'eventType',
            operator: 'equals',
            value: 'data_deletion_failed',
            timeWindow: 60,
            aggregation: 'count'],
        severity: 'high',
        channels: ['security-team-email'] }
        metadata: {}

      { id: 'policy-violations',
        name: 'Critical Policy Violations',
        description: 'Alert on critical data protection policy violations',
        enabled: true,
        eventTypes: ['policy_violation_detected'],
        conditions: [
          {
            type: 'threshold',
            field: 'severity',
            operator: 'equals',
            value: 'critical',
            timeWindow: 5,
            aggregation: 'count'],
        severity: 'critical',
        channels: ['security-team-email', 'compliance-webhook'] }
        metadata: {}

      { id: 'overdue-privacy-requests',
        name: 'Overdue Privacy Requests',
        description: 'Alert on privacy requests past their response deadline',
        enabled: true,
        eventTypes: ['privacy_request_overdue'],
        conditions: [
          {
            type: 'threshold',
            field: 'eventType',
            operator: 'equals',
            value: 'privacy_request_overdue',
            timeWindow: 1440, // 24 hours
            aggregation: 'count'],
        severity: 'high',
        channels: ['privacy-team-email'] }
        metadata: {}
    ],
    channels: [
      { id: 'security-team-email',
        type: 'email',
        config: {,
  recipients: ['security@company.com'] }
          subject: 'Security Alert: {alertName}',
          template: 'security-alert-template'

  enabled: true,
        rateLimits: [
          { maxAlerts: 10,
  timeWindow: 60 }
  severity: 'high'];

      { id: 'compliance-webhook',
        type: 'webhook',
        config: {,
  url: 'https://compliance-system.company.com/webhooks/security-alerts',
          method: 'POST' }
          headers: {
            'Authorization': 'Bearer ${COMPLIANCE_WEBHOOK_TOKEN}'}

            'Content-Type': 'application/json'
  },
  enabled: true,
        rateLimits: []],
    suppressionRules: [],
    escalationPolicies: []

  retention: { ,
  policies: [
  {
  id: 'gdpr-policy',
  name: 'GDPR Retention Policy',
  framework: ComplianceFramework.GDPR,
  eventTypes: ['*'],
  dataClassifications: [DataSensitivityLevel.PII, DataSensitivityLevel.SPECIAL_CATEGORY],
  retentionPeriod: 2190, // 6 years,
  archivalRequired: true,
  encryptionRequired: true,
  immutableStorage: true,
  purgeAfterRetention: true,
  exceptions: [] }

      { id: 'sox-policy',
  name: 'SOX Retention Policy',
  framework: ComplianceFramework.SOX,
  eventTypes: ['*'],
  dataClassifications: [DataSensitivityLevel.CONFIDENTIAL, DataSensitivityLevel.RESTRICTED],
  retentionPeriod: 2555, // 7 years,
  archivalRequired: true,
  encryptionRequired: true,
  immutableStorage: true,
  purgeAfterRetention: true,
  exceptions: []],
  archival: {,
  enabled: true,
  storageBackend: 's3',
  compressionEnabled: true,
  encryptionEnabled: true,
  verificationEnabled: true }
},
  deletion: { ,
  enabled: true,
  scheduledDeletion: true,
  batchSize: 1000,
  verificationRequired: true,
  backupBeforeDeletion: true,
  auditDeletion: true }
},
  compliance: { ,
  frameworks: [
  {
  framework: ComplianceFramework.GDPR,
  enabled: true,
  requirements: [],
  reportingFrequency: 'quarterly',
  alertOnViolations: true }

      { framework: ComplianceFramework.CCPA,
  enabled: true,
  requirements: [],
  reportingFrequency: 'quarterly',
  alertOnViolations: true }

      { framework: ComplianceFramework.SOX,
  enabled: true,
  requirements: [],
  reportingFrequency: 'annually',
  alertOnViolations: true],
  reporting: {,
  enabled: true,
  autoGeneration: true,
  outputFormats: ['json', 'pdf', 'csv'],
  recipients: [
  {
  email: 'compliance@company.com',
  role: 'compliance-officer',
  frameworks: [ComplianceFramework.GDPR, ComplianceFramework.CCPA],
  reportTypes: ['violations', 'privacy-requests', 'data-deletions']],
  schedules: [
  {
  id: 'gdpr-quarterly',
  framework: ComplianceFramework.GDPR,
  frequency: 'quarterly',
  time: '09:00' }
  enabled: true]

  monitoring: { ,
  enabled: true,
  continuousMonitoring: true,
  violationAlerts: true,
  dashboardEnabled: true,
  metricsCollection: true }
},
  performance: { ,
  monitoring: {,
  enabled: true,
  metricsCollectionInterval: 30000,
  alertThresholds: [
  {
  metric: 'latency',
  threshold: 1000,
  severity: 'high',
  action: 'alert' }

        { metric: 'error_rate',
  threshold: 5,
  severity: 'medium' }
  action: 'log']

  optimization: { ,
  asyncLogging: true,
  batchProcessing: true,
  caching: {,
  enabled: true,
  type: 'redis',
  ttl: 3600,
  maxSize: 10000,
  evictionPolicy: 'lru' }
},
  compression: true

  scaling: { ,
  autoScaling: true,
  maxConcurrentEvents: 10000,
  queueMaxSize: 50000,
  workerPoolSize: 10 }
};
/**
 * Development Security Event Configuration
 * Lighter configuration for development and testing
 */
export const DEVELOPMENT_SECURITY_EVENT_CONFIG: SecurityEventConfig = { ...DEFAULT_SECURITY_EVENT_CONFIG,
  logging: {,
  ...DEFAULT_SECURITY_EVENT_CONFIG.logging,
  level: 'debug',
  destinations: [
  {
  type: 'file',
  config: {,
  path: './logs/security-events-dev.log',
  rotationPolicy: 'none' }
},
  enabled: true,
        filters: [],
        formatters: [{ type: 'json' }]
    ],
    encryption: { ...DEFAULT_SECURITY_EVENT_CONFIG.logging.encryption,
  enabled: false }
},
  retention: { ...DEFAULT_SECURITY_EVENT_CONFIG.retention,
  policies: DEFAULT_SECURITY_EVENT_CONFIG.retention.policies.map(policy => ({),
  ...policy,
  retentionPeriod: 30 // 30 days for development }
}))
};