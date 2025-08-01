/**
 * Classification Audit Logger
 * 
 * Comprehensive audit logging system for data classification operations,
 * providing tamper-evident logging, compliance reporting, and forensic analysis capabilities.
 * 
 * Features:
 * - Immutable audit trail with cryptographic integrity
 * - Structured logging with full context capture
 * - Compliance report generation (GDPR, HIPAA, PCI-DSS, etc.)
 * - Retention policy enforcement
 * - Export capabilities for external SIEM integration
 * - Query and search functionality
 * - Automated log rotation and archival
 * - Real-time streaming to external systems
 */
import { EventEmitter } from 'events';
import { createHash, createHmac, randomBytes } from 'crypto';
import { ClassificationLevel,
  DataCategory,
  ComplianceFramework,
  ClassificationResult }
  DataElement
 from './DataClassifier';
import { MonitoringEvent, AlertSeverity } from './ClassificationMonitor';

// Audit Event Types
export enum AuditEventType { CLASSIFICATION_PERFORMED = 'classification_performed',
  CLASSIFICATION_UPDATED = 'classification_updated',
  RULE_APPLIED = 'rule_applied',
  RULE_MODIFIED = 'rule_modified',
  POLICY_VIOLATION = 'policy_violation',
  ACCESS_GRANTED = 'access_granted',
  ACCESS_DENIED = 'access_denied',
  DATA_EXPORTED = 'data_exported',
  DATA_DELETED = 'data_deleted',
  CONFIGURATION_CHANGED = 'configuration_changed',
  SYSTEM_EVENT = 'system_event'
  // Audit Log Entry
  export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  actor: { }
  userId?: string;
  systemId?: string;
  ipAddress: string;
  userAgent?: string;
  sessionId?: string;


};
  target: { dataId?: string;
  resourceType: string;
  resourceId: string;
  classification?: ClassificationResult };
  action: { ,
  operation: string;
  result: 'success' | 'failure';
  reason?: string;
  duration?: number };
  context: { ,
  environment: string;
  applicationVersion: string;
  correlationId?: string;
  parentEventId?: string;
  metadata: Record<string, any> };
  compliance: { 
  frameworks: ComplianceFramework;
  dataCategory?: DataCategory;
  retentionRequired: boolean;
  encryptionApplied: boolean };
  integrity: { 
  hash: string;
  previousHash: string;
  signature?: string;
  sequenceNumber: number };

// Query Filters


export interface AuditQueryFilter {
  startDate?: Date;
  endDate?: Date;
  eventTypes?: AuditEventType;
  userIds?: string;
  dataIds?: string;
  classificationLevels?: ClassificationLevel;
  complianceFrameworks?: ComplianceFramework;
  resultStatus?: 'success' | 'failure';
  searchText?: string;
  limit?: number;
  offset?: number;
  // Compliance Report




export interface ComplianceReport { framework: ComplianceFramework;
  reportPeriod: { }
  start: Date;
  end: Date;


};
  summary: { 
  totalEvents: number;
  compliantEvents: number;
  violations: number;
  complianceRate: number };
  dataProcessing: { 
  classified: number;
  accessed: number;
  exported: number;
  deleted: number };
  violationDetails: Array<{ ,
  timestamp: Date;
  eventId: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  remediation?: string }>;
  recommendations: string;
  generatedAt: Date;
  generatedBy: string;

// Retention Policy


export interface RetentionPolicy {
  framework: ComplianceFramework;
  eventType: AuditEventType;
  retentionDays: number;
  archiveAfterDays?: number;
  deleteAfterDays: number;
  requiresApproval: boolean;
  // Export Format


export enum ExportFormat { JSON = 'json',
  CSV = 'csv',
  SYSLOG = 'syslog',
  CEF = 'cef', // Common Event Format
  LEEF = 'leef' // Log Event Extended Format
  // Logger Configuration
  export interface AuditLoggerConfig {
  enableRealTimeLogging: boolean;
  enableCompression: boolean;
  enableEncryption: boolean;
  encryptionKey?: Buffer;
  signatureKey?: Buffer;
  retentionPolicies: RetentionPolicy;
  logRotationSizeMB: number;
  logRotationIntervalHours: number;
  archiveLocation: string;
  streamEndpoints?: Array<{ }
  url: string;
  format: ExportFormat;
  headers?: Record<string, string>;


>;
  performanceMode: 'balanced' | 'high_performance' | 'high_security';
/**
 * Classification Audit Logger Service
 */

export class ClassificationAuditLogger extends EventEmitter { private logs: AuditLogEntry = [];
  private logIndex: Map<string, number> = new Map();
  private sequenceNumber: number = 0;
  private lastHash: string = '0'.repeat(64);
  private rotationTimer?: NodeJS.Timeout;
  private archiveTimer?: NodeJS.Timeout;
  private currentLogSize: number = 0;
  private signatureKey: Buffer;
  // Performance optimizations
  private batchQueue: AuditLogEntry = [];
  private batchTimer?: NodeJS.Timeout;
  private compressionCache: Map<string, Buffer> = new Map();
  constructor(private config: AuditLoggerConfig) {
  super();
  this.signatureKey = config.signatureKey || randomBytes(32);
  this.initializeTimers();
  /**
  * Log a classification event
  */
  public async logClassification(
  dataElement: DataElement
  result: ClassificationResult
  actor: AuditLogEntry['actor']
  duration: number): Promise<string> {
  const entry = await this.createAuditEntry({)
  eventType: AuditEventType.CLASSIFICATION_PERFORMED
  actor
  target: {
  dataId: dataElement.id
  resourceType: 'data_element'
  resourceId: dataElement.id
  classification: result }

  action: { 
  operation: 'classify'
  result: 'success' }
  duration

  context: { 
  environment: process.env.NODE_ENV || 'production'
  applicationVersion: process.env.APP_VERSION || '1.0.0'
  metadata: {
  fieldName: dataElement.fieldName
  dataType: dataElement.dataType
  source: dataElement.source
  confidence: result.confidence
  matchedRules: result.matchedRules }

  compliance: { 
  frameworks: result.complianceRequirements
  dataCategory: result.category
  retentionRequired: true
  encryptionApplied: result.encryptionRequired }
});
    return entry.id;
  /**
   * Log a classification update
   */
  public async logClassificationUpdate(
    dataId: string
    oldLevel: ClassificationLevel
    newLevel: ClassificationLevel
    reason: string
    actor: AuditLogEntry['actor']): Promise<string> { 
  const entry = await this.createAuditEntry({)
  eventType: AuditEventType.CLASSIFICATION_UPDATED
  actor
  target: {
  dataId
  resourceType: 'classification'
  resourceId: dataId }

  action: { 
  operation: 'update_classification'
  result: 'success' }
  reason

  context: { 
  environment: process.env.NODE_ENV || 'production'
  applicationVersion: process.env.APP_VERSION || '1.0.0'
  metadata: {
  oldLevel
  newLevel
  changeReason: reason }

  compliance: { 
  frameworks: []
  retentionRequired: true
  encryptionApplied: false }
});
    return entry.id;
  /**
   * Log a policy violation
   */
  public async logPolicyViolation(
    violation: { 
  dataId: string;
  policyId: string;
  description: string;
  severity: AlertSeverity;
  framework: ComplianceFramework }
  actor: AuditLogEntry['actor']): Promise<string> { 
  const entry = await this.createAuditEntry({)
  eventType: AuditEventType.POLICY_VIOLATION
  actor
  target: {
  dataId: violation.dataId
  resourceType: 'policy'
  resourceId: violation.policyId }

  action: { 
  operation: 'policy_check'
  result: 'failure'
  reason: violation.description }

  context: { 
  environment: process.env.NODE_ENV || 'production'
  applicationVersion: process.env.APP_VERSION || '1.0.0'
  metadata: {
  severity: violation.severity
  violationType: 'compliance'
  requiresRemediation: true }

  compliance: { 
  frameworks: [violation.framework]
  retentionRequired: true
  encryptionApplied: false }
});
    // Emit alert for critical violations
    if (violation.severity === AlertSeverity.CRITICAL) { this.emit('criticalViolation', {)
  entry }
        violation
      });
    return entry.id;
  /**
   * Log data access event
   */
  public async logDataAccess(
    dataId: string
    accessGranted: boolean
    reason: string
    actor: AuditLogEntry['actor']
    classification?: ClassificationResult
  ): Promise<string> { const entry = await this.createAuditEntry({)
  eventType: accessGranted ? AuditEventType.ACCESS_GRANTED : AuditEventType.ACCESS_DENIED
  actor
  target: {
  dataId
  resourceType: 'data'
  resourceId: dataId }
  classification

  action: { 
  operation: 'access_request'
  result: accessGranted ? 'success' : 'failure' }
  reason

  context: { 
  environment: process.env.NODE_ENV || 'production'
  applicationVersion: process.env.APP_VERSION || '1.0.0'
  metadata: {
  accessType: 'read' }
  accessGranted

  compliance: { 
  frameworks: classification?.complianceRequirements || []
  dataCategory: classification?.category
  retentionRequired: true
  encryptionApplied: false }
});
    return entry.id;
  /**
   * Query audit logs
   */
  public async queryLogs(filter: AuditQueryFilter): Promise<AuditLogEntry> { let results = [...this.logs];
  // Apply filters
  if (filter.startDate) {
  results = results.filter(log => log.timestamp >= filter.startDate!);
  if (filter.endDate) {
  results = results.filter(log => log.timestamp <= filter.endDate!);
  if (filter.eventTypes && filter.eventTypes.length > 0) {
  results = results.filter(log => filter.eventTypes!.includes(log.eventType));
  if (filter.userIds && filter.userIds.length > 0) {
  results = results.filter(log => )
  log.actor.userId && filter.userIds!.includes(log.actor.userId)
  );
  if (filter.dataIds && filter.dataIds.length > 0) {
  results = results.filter(log => )
  log.target.dataId && filter.dataIds!.includes(log.target.dataId)
  );
  if (filter.classificationLevels && filter.classificationLevels.length > 0) {
  results = results.filter(log => )
  log.target.classification &&
  filter.classificationLevels!.includes(log.target.classification.level)
  );
  if (filter.complianceFrameworks && filter.complianceFrameworks.length > 0) {
  results = results.filter(log => )
  log.compliance.frameworks.some(f => filter.complianceFrameworks!.includes(f))
  );
  if (filter.resultStatus) {
  results = results.filter(log => log.action.result === filter.resultStatus);
  if (filter.searchText) {
  const searchLower = filter.searchText.toLowerCase();
  results = results.filter(log => )
  JSON.stringify(log).toLowerCase().includes(searchLower)
  );
  // Apply pagination
  const offset = filter.offset || 0;
  const limit = filter.limit || 100;
  return results.slice(offset, offset + limit);
  /**
  * Generate compliance report
  */
  public async generateComplianceReport(
  framework: ComplianceFramework,
  startDate: Date,
  endDate: Date): Promise<ComplianceReport> {
  const relevantLogs = await this.queryLogs({)
  startDate
  endDate
  complianceFrameworks: [framework] }
});
    const violations = relevantLogs.filter(;);
      log => log.eventType === AuditEventType.POLICY_VIOLATION
    );
    const dataProcessing = { classified: relevantLogs.filter()
  log => log.eventType === AuditEventType.CLASSIFICATION_PERFORMED
  ).length
  accessed: relevantLogs.filter()
  log => log.eventType === AuditEventType.ACCESS_GRANTED ||
  log.eventType === AuditEventType.ACCESS_DENIED
  ).length
  exported: relevantLogs.filter()
  log => log.eventType === AuditEventType.DATA_EXPORTED
  ).length
  deleted: relevantLogs.filter() }
  log => log.eventType === AuditEventType.DATA_DELETED
  ).length
};
    const violationDetails = violations.map(log => ({ )
  timestamp: log.timestamp
  eventId: log.id
  description: log.action.reason || 'Policy violation'
  severity: this.mapAlertSeverityToComplianceSeverity()
  log.context.metadata.severity || AlertSeverity.WARNING
  )
  remediation: log.context.metadata.remediation }
}));
    const complianceRate = relevantLogs.length > 0;
      ? ((relevantLogs.length - violations.length) / relevantLogs.length) * 100
      : 100;
    const report: ComplianceReport = { framework
  reportPeriod: {
  start: startDate
  end: endDate }

  summary: { 
  totalEvents: relevantLogs.length
  compliantEvents: relevantLogs.length - violations.length
  violations: violations.length }
  complianceRate

      dataProcessing
      violationDetails
      recommendations: this.generateRecommendations(framework, violations)
      generatedAt: new Date()
      generatedBy: 'system';
  };
    // Log report generation
    await this.createAuditEntry({ )
  eventType: AuditEventType.SYSTEM_EVENT
  actor: {
  systemId: 'audit_logger'
  ipAddress: '127.0.0.1' }

  target: { 
  resourceType: 'compliance_report' }
        resourceId: `report_${framework}_${Date.now()}`}

  action: { 
  operation: 'generate_report'
  result: 'success' }

  context: { 
  environment: process.env.NODE_ENV || 'production'
        applicationVersion: process.env.APP_VERSION || '1.0.0'
        metadata: {
          framework }
          reportPeriod: { start: startDate, end: endDate }
          violationCount: violations.length

  compliance: { 
  frameworks: [framework]
  retentionRequired: true
  encryptionApplied: false }
});
    return report;
  /**
   * Export logs in specified format
   */
  public async exportLogs(((
    filter: AuditQueryFilter
    format: ExportFormat
  ): Promise<string> { const logs = await this.queryLogs(filter);
    switch (format) {
    case ExportFormat.JSON:
      return this.exportAsJSON(logs);
    case ExportFormat.CSV:
      return this.exportAsCSV(logs);
    case ExportFormat.SYSLOG:
      return this.exportAsSyslog(logs);
    case ExportFormat.CEF:
      return this.exportAsCEF(logs);
    case ExportFormat.LEEF: return this.exportAsLEEF(logs) }
  default:
      throw new Error(`Unsupported export format: ${format}`);}
  /**
   * Verify log integrity
   */
  public async verifyIntegrity(
    startId?: string
    endId?: string
  ): Promise<{
    valid: boolean;
  errors: Array<{ logId: string; error: string }>;
> {
    const errors: Array<{ logId: string; error: string }> = [];
    let valid = true;
    const startIndex = startId ? this.logIndex.get(startId) || 0 : 0;
    const endIndex = endId ? this.logIndex.get(endId) || this.logs.length - 1 : this.logs.length - 1;
    let expectedHash = startIndex > 0 ? this.logs[startIndex - 1].integrity.hash : '0'.repeat(64);
    for (let i = startIndex; i <= endIndex; i++) { const log = this.logs[i];
  // Verify hash chain
  if (log.integrity.previousHash !== expectedHash) {
  errors.push({)
  logId: log.id,
  error: 'Hash chain broken' }
});
        valid = false;
      // Verify log hash
      const calculatedHash = this.calculateLogHash(log);
      if (log.integrity.hash !== calculatedHash) { errors.push({)
  logId: log.id,
  error: 'Log hash mismatch' }
});
        valid = false;
      // Verify signature if present
      if (log.integrity.signature && !this.verifySignature(log)) { errors.push({)
  logId: log.id,
  error: 'Invalid signature' }
});
        valid = false;
      expectedHash = log.integrity.hash;
    return { valid, errors };
  // Private helper methods
  private async createAuditEntry(data: Omit<AuditLogEntry, 'id' | 'timestamp' | 'integrity'>)
  ): Promise<AuditLogEntry> { const entry: AuditLogEntry = {
  id: this.generateLogId()
  timestamp: new Date()
  ...data
  integrity: {
  hash: ''
  previousHash: this.lastHash
  sequenceNumber: ++this.sequenceNumber }
};
    // Calculate hash
    entry.integrity.hash = this.calculateLogHash(entry);
    // Add signature if configured
    if (this.config.performanceMode === 'high_security') { entry.integrity.signature = this.signLog(entry);
    // Update last hash
    this.lastHash = entry.integrity.hash;
    // Store log
    if (this.config.performanceMode === 'high_performance') {
      // Batch mode
      this.batchQueue.push(entry);
      this.scheduleBatchFlush() } else {
      // Immediate mode
      await this.storeLog(entry);
    return entry;
  private async storeLog(entry: AuditLogEntry): Promise<void> {

    this.logs.push(entry);
    this.logIndex.set(entry.id, this.logs.length - 1);
    this.currentLogSize += JSON.stringify(entry).length;
    // Stream to external systems if configured
    if (this.config.enableRealTimeLogging && this.config.streamEndpoints) {
      this.streamLog(entry);
    // Check rotation
    if (this.currentLogSize > this.config.logRotationSizeMB * 1024 * 1024) {
      await this.rotateLogs();
    this.emit('logStored', { entry });
  private calculateLogHash(entry: AuditLogEntry): string { const content = {
  id: entry.id
  timestamp: entry.timestamp.toISOString()
  eventType: entry.eventType
  actor: entry.actor
  target: entry.target
  action: entry.action
  context: entry.context
  compliance: entry.compliance
  previousHash: entry.integrity.previousHash
  sequenceNumber: entry.integrity.sequenceNumber }
};
    return createHash('sha256')
      .update(JSON.stringify(content))
      .digest('hex');
  private signLog(entry: AuditLogEntry): string { const content = JSON.stringify({)
  id: entry.id
  hash: entry.integrity.hash
  timestamp: entry.timestamp.toISOString() }
});
    return createHmac('sha256', this.signatureKey)
      .update(content)
      .digest('hex');
  private verifySignature(entry: AuditLogEntry): boolean { if (!entry.integrity.signature) return false;
  const expectedSignature = this.signLog(entry);
  return entry.integrity.signature === expectedSignature;
  private scheduleBatchFlush(): void { }
  if (this.batchTimer) return;
  this.batchTimer = setTimeout(async () => { const batch = [...this.batchQueue];
  this.batchQueue = [];
  this.batchTimer = undefined;
  for (const entry of batch) {
  await this.storeLog(entry) }, 1000); // Flush every second
  private async streamLog(entry: AuditLogEntry): Promise<void> { if (!this.config.streamEndpoints) return;
  for (const endpoint of this.config.streamEndpoints) {
  try {
  // In production, this would use an HTTP client
  this.emit('logStreamed', {)
  endpoint: endpoint.url
  format: endpoint.format }
  entry
});
 catch (error) { this.emit('streamError', {)
  endpoint: endpoint.url
  error: error instanceof Error ? error.message : 'Unknown error' }
});
  private async rotateLogs(): Promise<void> {

    const rotatedLogs = [...this.logs];
    const rotationId = `rotation_${Date.now()}`;}
    // Archive current logs
    this.emit('logsRotated', { )
  rotationId
  logCount: rotatedLogs.length
  size: this.currentLogSize }
});
    // Reset current logs
    this.logs = [];
    this.logIndex.clear();
    this.currentLogSize = 0;
    // Create rotation entry
    await this.createAuditEntry({ )
  eventType: AuditEventType.SYSTEM_EVENT
  actor: {
  systemId: 'audit_logger'
  ipAddress: '127.0.0.1' }

  target: { 
  resourceType: 'audit_logs'
  resourceId: rotationId }

  action: { 
  operation: 'rotate_logs'
  result: 'success' }

  context: { 
  environment: process.env.NODE_ENV || 'production'
  applicationVersion: process.env.APP_VERSION || '1.0.0'
  metadata: {
  rotatedCount: rotatedLogs.length
  previousSize: this.currentLogSize }

  compliance: { 
  frameworks: []
  retentionRequired: true
  encryptionApplied: false }
});
  private exportAsJSON(logs: AuditLogEntry): string { return JSON.stringify({)
  exportedAt: new Date()
  logCount: logs.length }
  logs
}, null, 2);
  private exportAsCSV(logs: AuditLogEntry): string { const headers = [
      'id', 'timestamp', 'eventType', 'userId', 'ipAddress'
      'resourceType', 'resourceId', 'operation', 'result'
      'classificationLevel', 'framework', 'hash'
    ];
    const rows = logs.map(log => [);
      log.id
      log.timestamp.toISOString()
      log.eventType
      log.actor.userId || ''
      log.actor.ipAddress
      log.target.resourceType
      log.target.resourceId
      log.action.operation
      log.action.result
      log.target.classification?.level || ''
      log.compliance.frameworks.join(';') }
      log.integrity.hash
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  private exportAsSyslog(logs: AuditLogEntry): string {
    return logs.map(log => {)
  const facility = 16; // Local0;
      const severity = log.action.result === 'failure' ? 3 : 6; // Error : Info;
      const priority = facility * 8 + severity;
      return `<${priority}>${log.timestamp.toISOString()} ${log.actor.systemId || 'audit'} ${log.eventType}: ${JSON.stringify(log)}`;}
    }).join('\n');
  private exportAsCEF(logs: AuditLogEntry): string { return logs.map(log => {)
  const cef = [
        'CEF:0',
        'SecurityAudit',
        'ClassificationSystem',
        '1.0',
        log.eventType,
        log.action.reason || log.eventType,
        this.mapToSeverity(log) }
        `src=${log.actor.ipAddress}`}

        `duser=${log.actor.userId || 'system'}`}

        'dvchost=classification-system',
        `msg=${JSON.stringify(log.action)}`}

        `cs1=${log.integrity.hash}`}

        'cs1Label=EventHash'
      ];
      return cef.join('|');
    }).join('\n');
  private exportAsLEEF(logs: AuditLogEntry): string { return logs.map(log => {)
  const leef = [
        'LEEF:2.0',
        'SecurityAudit',
        'ClassificationSystem',
        '1.0',
        log.eventType }
        `devTime=${log.timestamp.getTime()}`}

        `src=${log.actor.ipAddress}`}

        `usrName=${log.actor.userId || 'system'}`}

        `action=${log.action.operation}`}

        `result=${log.action.result}`}

        `hash=${log.integrity.hash}`}
      ];
      return leef.join('|');
    }).join('\n');
  private mapToSeverity(log: AuditLogEntry): number { if (log.action.result === 'failure') return 7;
    if (log.eventType === AuditEventType.POLICY_VIOLATION) return 5;
    if (log.eventType === AuditEventType.ACCESS_DENIED) return 4;
    return 3;
  private mapAlertSeverityToComplianceSeverity(severity: AlertSeverity): 'low' | 'medium' | 'high' | 'critical' {
    switch (severity) {
    case AlertSeverity.INFO: return 'low';
    case AlertSeverity.WARNING: return 'medium';
    case AlertSeverity.ERROR: return 'high';
    case AlertSeverity.CRITICAL: return 'critical';,
  default: return 'medium';
  private generateRecommendations(((
    framework: ComplianceFramework }
    violations: AuditLogEntry
  ): string {
    const recommendations: string = [];
    if (violations.length > 10) {
      recommendations.push('Review and update classification rules to reduce false positives');
    const criticalCount = violations.filter(;);
      v => v.context.metadata.severity === AlertSeverity.CRITICAL
    ).length;
    if (criticalCount > 0) {
      recommendations.push('Immediate remediation required for critical violations');
      recommendations.push('Implement automated controls to prevent critical violations');
    switch (framework) {
    case ComplianceFramework.GDPR:
      recommendations.push('Ensure data minimization principles are followed');
      recommendations.push('Implement regular data protection impact assessments');
      break;
    case ComplianceFramework.HIPAA:
      recommendations.push('Review access controls for protected health information');
      recommendations.push('Ensure encryption is enabled for all PHI data');
      break;
    case ComplianceFramework.PCI_DSS:
      recommendations.push('Implement network segmentation for cardholder data');
      recommendations.push('Enable comprehensive logging for all access to payment data');
      break;
    return recommendations;
  private generateLogId(): string {
    return `log_${Date.now()}_${randomBytes(8).toString('hex')}`;}
  private initializeTimers(): void { // Log rotation timer
  if (this.config.logRotationIntervalHours > 0) {
  this.rotationTimer = setInterval()
  () => this.rotateLogs(),
  this.config.logRotationIntervalHours * 60 * 60 * 1000
  );
  // Archive timer for retention policies
  this.archiveTimer = setInterval()
  () => this.enforceRetentionPolicies(),
  24 * 60 * 60 * 1000 // Daily
  );
  private async enforceRetentionPolicies(): Promise<void> {
  for (const policy of this.config.retentionPolicies) {
  const cutoffDate = new Date(;);
  Date.now() - policy.retentionDays * 24 * 60 * 60 * 1000
  );
  const logsToArchive = this.logs.filter(;);
  log => log.eventType === policy.eventType &&
  log.compliance.frameworks.includes(policy.framework) &&
  log.timestamp < cutoffDate
  );
  if (logsToArchive.length > 0) {
  this.emit('logsArchived', {)
  policy,
  logCount: logsToArchive.length,
  oldestLog: logsToArchive[0].timestamp }
});
        // Remove from active logs
        this.logs = this.logs.filter()
          log => !logsToArchive.includes(log)
        );
        // Rebuild index
        this.logIndex.clear();
        this.logs.forEach((log, index) => { this.logIndex.set(log.id, index) });
  /**
   * Cleanup and shutdown
   */
  public destroy(): void {
    if (this.rotationTimer) clearInterval(this.rotationTimer);
    if (this.archiveTimer) clearInterval(this.archiveTimer);
    if (this.batchTimer) clearTimeout(this.batchTimer);
    // Flush any pending logs
    if (this.batchQueue.length > 0) {
      const batch = [...this.batchQueue];
      this.batchQueue = [];
      batch.forEach(entry => this.storeLog(entry));
    this.logs = [];
    this.logIndex.clear();
    this.compressionCache.clear();
    this.removeAllListeners();

export default ClassificationAuditLogger;