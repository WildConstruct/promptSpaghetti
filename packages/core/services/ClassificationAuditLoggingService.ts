/**
 * Classification Audit Logging Service
 * 
 * Provides comprehensive audit logging for data classification activities,
 * ensuring compliance and traceability for all classification-related operations.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import { DataClassificationLevel, 
  OperationContext }
  ValidationResult
 from '../types/DataClassification';


export interface AuditLogEntry { id: string;
  timestamp: Date;
  userId: string;
  sessionId: string;
  requestId: string;
  action: AuditAction;
  classification: DataClassificationLevel;
  dataId: string;
  resourceType: 'DOCUMENT' | 'FILE' | 'DATABASE' | 'API' | 'SYSTEM' | 'USER_DATA' }
  details: AuditDetails;
  context: OperationContext;
  outcome: AuditOutcome;
  metadata: AuditMetadata;
  complianceFlags: ComplianceFlag;
  riskScore: number;
  correlationId?: string;


export type AuditAction = 
  | 'CLASSIFY_DATA'
  | 'DECLASSIFY_DATA'
  | 'RECLASSIFY_DATA'
  | 'ACCESS_DATA'
  | 'EXPORT_DATA'
  | 'SHARE_DATA'
  | 'DELETE_DATA'
  | 'BACKUP_DATA'
  | 'RESTORE_DATA'
  | 'POLICY_CHANGE'
  | 'PERMISSION_GRANT'
  | 'PERMISSION_REVOKE'
  | 'ENCRYPTION_APPLIED'
  | 'ENCRYPTION_REMOVED'
  | 'COMPLIANCE_CHECK'
  | 'VIOLATION_DETECTED'
  | 'REMEDIATION_APPLIED'
  | 'ALERT_TRIGGERED'
  | 'ALERT_RESOLVED';


export interface AuditDetails { previousClassification?: DataClassificationLevel;
  newClassification?: DataClassificationLevel;
  accessMethod: string;
  toolUsed: string;
  businessJustification?: string;
  approvalRequired: boolean;
  approvedBy?: string;
  automaticAction: boolean;
  dataSize?: number;
  fieldCount?: number;
  piiDetected: boolean;
  encryptionStatus: 'ENCRYPTED' | 'NOT_ENCRYPTED' | 'PARTIALLY_ENCRYPTED';
  customProperties?: Record<string, any> }



export interface AuditOutcome { success: boolean;
  errorCode?: string;
  errorMessage?: string;
  warningMessages: string;
  executionTimeMs: number;
  resourcesAffected: number;
  complianceScore: number;
  violationsDetected: string;
  remediationRequired: boolean }



export interface AuditMetadata { sourceIP: string;
  userAgent: string;
  geolocation?: { }
  country: string;
  region: string;
  city: string;
  coordinates: [number, number];


};
  deviceInfo?: { deviceId: string;
  deviceType: string;
  operatingSystem: string;
  browser: string };
  networkInfo?: { vpnDetected: boolean;
  proxyDetected: boolean;
  networkQuality: 'HIGH' | 'MEDIUM' | 'LOW' }
};
  organizationInfo?: { organizationId: string;
  department: string;
  role: string;
  accessLevel: string };


export interface ComplianceFlag { framework: string; // GDPR, HIPAA, SOX, PCI-DSS, etc. }
  requirement: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_REVIEW' | 'EXEMPTED';
  evidence?: string;
  assessmentDate: Date;
  nextReviewDate?: Date;




export interface AuditQuery { startDate?: Date;
  endDate?: Date;
  userId?: string;
  classification?: DataClassificationLevel;
  action?: AuditAction;
  resourceType?: string;
  successOnly?: boolean;
  riskScoreMin?: number;
  riskScoreMax?: number;
  complianceFramework?: string;
  correlationId?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'riskScore' | 'classification' | 'userId';
  sortOrder?: 'asc' | 'desc' }




export interface AuditReport { id: string;
  name: string;
  description: string;
  generatedAt: Date;
  requestedBy: string;
  parameters: AuditQuery;
  summary: AuditSummary;
  entries: AuditLogEntry;
  format: 'JSON' | 'CSV' | 'PDF' | 'XML';
  retentionPeriod: number; // days }
  expiresAt: Date;




export interface AuditSummary { totalEntries: number;
  uniqueUsers: number;
  timeRange: { }
  start: Date;
  end: Date;


};
  actionBreakdown: Record<AuditAction, number>;
  classificationBreakdown: Record<DataClassificationLevel, number>;
  complianceBreakdown: Record<string, { compliant: number;
  nonCompliant: number;
  needsReview: number }>;
  riskAnalysis: { 
  averageRiskScore: number;
  highRiskEntries: number;
  criticalViolations: number };
  trendsAnalysis: { 
  activityTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
  riskTrend: 'IMPROVING' | 'DEGRADING' | 'STABLE'
  complianceTrend: 'IMPROVING' | 'DEGRADING' | 'STABLE' }
};


export interface AuditRetentionPolicy { classification: DataClassificationLevel;
  retentionDays: number;
  archiveAfterDays: number;
  permanentDeletionAfterDays: number;
  complianceRequirements: string;
  encryptionRequired: boolean;
  backupRequired: boolean }

export class ClassificationAuditLoggingService { private auditLogs: Map<string, AuditLogEntry> = new Map();
  private reports: Map<string, AuditReport> = new Map();
  private retentionPolicies: Map<DataClassificationLevel, AuditRetentionPolicy> = new Map();
  private logHandlers: ((entry: AuditLogEntry) => void)[] = [];
  private archiveHandlers: ((entries: AuditLogEntry) => void)[] = [];
  constructor() {
  this.initializeRetentionPolicies();
  this.startRetentionCleanup();
  /**
  * Initialize default audit retention policies
  */
  private initializeRetentionPolicies(): void {
  const policies: Record<DataClassificationLevel, AuditRetentionPolicy> = {
  PUBLIC: {
  classification: 'PUBLIC'
  retentionDays: 365, // 1 year
  archiveAfterDays: 90
  permanentDeletionAfterDays: 1095, // 3 years
  complianceRequirements: []
  encryptionRequired: false
  backupRequired: true }

  INTERNAL: { 
  classification: 'INTERNAL'
  retentionDays: 2555, // 7 years
  archiveAfterDays: 365
  permanentDeletionAfterDays: 3650, // 10 years
  complianceRequirements: ['SOC2', 'ISO27001']
  encryptionRequired: true
  backupRequired: true }

  CONFIDENTIAL: { 
  classification: 'CONFIDENTIAL'
  retentionDays: 2555, // 7 years
  archiveAfterDays: 365
  permanentDeletionAfterDays: 5475, // 15 years
  complianceRequirements: ['GDPR', 'HIPAA', 'SOC2']
  encryptionRequired: true
  backupRequired: true }

  RESTRICTED: { 
  classification: 'RESTRICTED'
  retentionDays: 3650, // 10 years
  archiveAfterDays: 730, // 2 years
  permanentDeletionAfterDays: 7300, // 20 years
  complianceRequirements: ['FedRAMP', 'FISMA', 'SOC2', 'ISO27001']
  encryptionRequired: true
  backupRequired: true }
};
    Object.entries(policies).forEach(([level, policy]) => { this.retentionPolicies.set(level as DataClassificationLevel, policy) });
  /**
   * Log an audit entry
   */
  async logAuditEvent(action: AuditAction)
  classification: DataClassificationLevel
    dataId: string
    details: Partial<AuditDetails>
    context: OperationContext
    outcome: Partial<AuditOutcome>
    metadata: Partial<AuditMetadata> = {}
  ): Promise<string> {

    const entryId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;}
    const entry: AuditLogEntry = { 
  id: entryId
  timestamp: new Date()
  userId: context.userId
  sessionId: context.sessionId
  requestId: context.requestId
  action
  classification
  dataId
  resourceType: this.determineResourceType(dataId)
  details: {
  accessMethod: 'API'
  toolUsed: 'PromptSpaghetti'
  approvalRequired: false
  automaticAction: false
  piiDetected: false
  encryptionStatus: 'NOT_ENCRYPTED' }
  ...details

      context
      outcome: { 
  success: true
  warningMessages: []
  executionTimeMs: 0
  resourcesAffected: 1
  complianceScore: 100
  violationsDetected: []
  remediationRequired: false }
  ...outcome

  metadata: { 
  sourceIP: context.source
  userAgent: 'Unknown' }
  ...metadata

  complianceFlags: this.generateComplianceFlags(classification, action)
      riskScore: this.calculateRiskScore(action, classification, outcome.success !== false)
      correlationId: this.generateCorrelationId(context);
  };
    // Store the entry
    this.auditLogs.set(entryId, entry);
    // Notify handlers
    this.notifyLogHandlers(entry);
    // Perform compliance checks
    await this.performComplianceChecks(entry);
    return entryId;
  /**
   * Determine resource type from data ID
   */
  private determineResourceType(dataId: string): AuditLogEntry['resourceType'] { if (dataId.startsWith('doc_')) return 'DOCUMENT';
  if (dataId.startsWith('file_')) return 'FILE';
  if (dataId.startsWith('db_')) return 'DATABASE';
  if (dataId.startsWith('api_')) return 'API';
  if (dataId.startsWith('user_')) return 'USER_DATA';
  return 'SYSTEM';
  /**
  * Generate compliance flags for the entry
  */
  private generateComplianceFlags((classification: DataClassificationLevel
  action: AuditAction): ComplianceFlag {
  const flags: ComplianceFlag = [];
  const policy = this.retentionPolicies.get(classification);
  if (policy) {
  policy.complianceRequirements.forEach(framework => {)
  flags.push({)
  framework
  requirement: this.getComplianceRequirement(framework, action)
  status: 'COMPLIANT'
  assessmentDate: new Date()
  nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days }
});
      });
    return flags;
  /**
   * Get compliance requirement for framework and action
   */
  private getComplianceRequirement(framework: string, action: AuditAction): string { const requirements: Record<string, Record<AuditAction, string>> = {
  GDPR: {
  'ACCESS_DATA': 'Article 30 - Records of processing activities'
  'EXPORT_DATA': 'Article 20 - Right to data portability'
  'DELETE_DATA': 'Article 17 - Right to erasure'
  'CLASSIFY_DATA': 'Article 25 - Data protection by design'
  'SHARE_DATA': 'Article 44 - General principle for transfers' }
 as any
      HIPAA: { 'ACCESS_DATA': '164.308(a)(1) - Access management'
  'EXPORT_DATA': '164.308(a)(4) - Information transfer'
  'CLASSIFY_DATA': '164.308(a)(7) - Contingency plan' }
 as any
      SOC2: { 'ACCESS_DATA': 'CC6.1 - Logical access controls'
  'EXPORT_DATA': 'CC6.7 - Data transmission controls'
  'CLASSIFY_DATA': 'CC6.8 - Data classification' }
 as any
    };
    return requirements[framework]?.[action] || `${framework} general compliance`;}
  /**
   * Calculate risk score for the entry
   */
  private calculateRiskScore(action: AuditAction)
  classification: DataClassificationLevel
    success: boolean): number { 
  let riskScore = 0;
  // Base risk by classification
  const classificationRisk = {
  PUBLIC: 10
  INTERNAL: 30
  CONFIDENTIAL: 60
  RESTRICTED: 90 }
};
    riskScore += classificationRisk[classification];
    // Risk by action
    const actionRisk = { 'CLASSIFY_DATA': 5
  'ACCESS_DATA': 10
  'EXPORT_DATA': 25
  'SHARE_DATA': 30
  'DELETE_DATA': 20
  'VIOLATION_DETECTED': 80
  'POLICY_CHANGE': 40
  'PERMISSION_GRANT': 35
  'ENCRYPTION_REMOVED': 70 }
 as any;
    riskScore += actionRisk[action] || 15;
    // Failure increases risk
    if (!success) {
      riskScore += 30;
    return Math.min(riskScore, 100);
  /**
   * Generate correlation ID for related events
   */
  private generateCorrelationId(context: OperationContext): string {
    return `corr-${context.sessionId}-${context.requestId}`;}
  /**
   * Perform compliance checks on the entry
   */
  private async performComplianceChecks(entry: AuditLogEntry): Promise<void> { // Check for potential violations
  const violations: string = [];
  // Check for high-risk actions on sensitive data
  if (entry.classification === 'RESTRICTED' && )
  ['EXPORT_DATA', 'SHARE_DATA'].includes(entry.action) &&
  !entry.details.approvalRequired) {
  violations.push('High-risk action on restricted data without approval');
  // Check for off-hours access
  const hour = entry.timestamp.getHours();
  if ((hour < 6 || hour > 22) && entry.classification !== 'PUBLIC') {
  violations.push('Access outside business hours');
  // Check for rapid succession of actions
  const recentEntries = Array.from(this.auditLogs.values()).filter(e => ;);
  e.userId === entry.userId &&
  e.timestamp.getTime() > Date.now() - 300000 && // Last 5 minutes
  e.id !== entry.id
  );
  if (recentEntries.length > 10) {
  violations.push('High-frequency access pattern detected');
  // Update entry with violations
  if (violations.length > 0) {
  entry.outcome.violationsDetected = violations;
  entry.outcome.remediationRequired = true;
  entry.riskScore = Math.min(entry.riskScore + (violations.length * 10), 100);
  /**
  * Query audit logs
  */
  queryAuditLogs(query: AuditQuery): AuditLogEntry { }
  let results = Array.from(this.auditLogs.values());
  // Apply filters
  if (query.startDate) { results = results.filter(entry => entry.timestamp >= query.startDate!);
  if (query.endDate) {
  results = results.filter(entry => entry.timestamp <= query.endDate!);
  if (query.userId) {
  results = results.filter(entry => entry.userId === query.userId);
  if (query.classification) {
  results = results.filter(entry => entry.classification === query.classification);
  if (query.action) {
  results = results.filter(entry => entry.action === query.action);
  if (query.resourceType) {
  results = results.filter(entry => entry.resourceType === query.resourceType);
  if (query.successOnly) {
  results = results.filter(entry => entry.outcome.success);
  if (query.riskScoreMin !== undefined) {
  results = results.filter(entry => entry.riskScore >= query.riskScoreMin!);
  if (query.riskScoreMax !== undefined) {
  results = results.filter(entry => entry.riskScore <= query.riskScoreMax!);
  if (query.complianceFramework) {
  results = results.filter(entry => )
  entry.complianceFlags.some(flag => flag.framework === query.complianceFramework)
  );
  if (query.correlationId) {
  results = results.filter(entry => entry.correlationId === query.correlationId);
  // Sort results
  const sortBy = query.sortBy || 'timestamp';
  const sortOrder = query.sortOrder || 'desc';
  results.sort((a, b) => {
  let aValue: any = a[sortBy as keyof AuditLogEntry];
  let bValue: any = b[sortBy as keyof AuditLogEntry];
  if (sortBy === 'timestamp') {
  aValue = aValue.getTime();
  bValue = bValue.getTime();
  if (sortOrder === 'asc') {
  return aValue < bValue ? -1 : aValue > bValue ? 1 : 0 } else { return aValue > bValue ? -1 : aValue < bValue ? 1 : 0 });
    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    return results.slice(offset, offset + limit);
  /**
   * Generate audit report
   */
  async generateAuditReport(name: string),
  description: string,
    query: AuditQuery,
    format: AuditReport['format'] = 'JSON',
    requestedBy: string): Promise<string> {
    const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;}
    const entries = this.queryAuditLogs(query);
    const summary = this.generateAuditSummary(entries, query);
    const report: AuditReport = { 
  id: reportId
  name
  description
  generatedAt: new Date()
  requestedBy
  parameters: query
  summary
  entries
  format
  retentionPeriod: 90, // 90 days default
  expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) }
};
    this.reports.set(reportId, report);
    return reportId;
  /**
   * Generate audit summary
   */
  private generateAuditSummary(entries: AuditLogEntry, query: AuditQuery): AuditSummary { const uniqueUsers = new Set(entries.map(e => e.userId)).size;
  const timestamps = entries.map(e => e.timestamp);
  const timeRange = {
  start: timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : new Date()
  end: timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : new Date() }
};
    // Action breakdown
    const actionBreakdown = {} as Record<AuditAction, number>;
    entries.forEach(entry => { )
  actionBreakdown[entry.action] = (actionBreakdown[entry.action] || 0) + 1 });
    // Classification breakdown
    const classificationBreakdown = {} as Record<DataClassificationLevel, number>;
    entries.forEach(entry => { )
  classificationBreakdown[entry.classification] = (classificationBreakdown[entry.classification] || 0) + 1 });
    // Compliance breakdown
    const complianceBreakdown: Record<string, any> = {};
    entries.forEach(entry => {)
  entry.complianceFlags.forEach(flag => {)
  if (!complianceBreakdown[flag.framework]) {
          complianceBreakdown[flag.framework] = { compliant: 0, nonCompliant: 0, needsReview: 0 };
        if (flag.status === 'COMPLIANT') complianceBreakdown[flag.framework].compliant++;
        else if (flag.status === 'NON_COMPLIANT') complianceBreakdown[flag.framework].nonCompliant++;
        else if (flag.status === 'NEEDS_REVIEW') complianceBreakdown[flag.framework].needsReview++;
      });
    });
    // Risk analysis
    const riskScores = entries.map(e => e.riskScore);
    const averageRiskScore = riskScores.length > 0 ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length : 0;
    const highRiskEntries = entries.filter(e => e.riskScore >= 70).length;
    const criticalViolations = entries.filter(e => e.outcome.violationsDetected.length > 0).length;
    return { totalEntries: entries.length
  uniqueUsers
  timeRange
  actionBreakdown
  classificationBreakdown
  complianceBreakdown
  riskAnalysis: {
  averageRiskScore
  highRiskEntries }
  criticalViolations

  trendsAnalysis: { 
  activityTrend: 'STABLE', // Would be calculated based on historical data
  riskTrend: 'STABLE'
  complianceTrend: 'STABLE' }
};
  /**
   * Export audit report
   */
  exportAuditReport(reportId: string): string | null { const report = this.reports.get(reportId);
  if (!report) return null;
  switch (report.format) {
  case 'JSON':
  return JSON.stringify(report, null, 2);
  case 'CSV':
  const headers = [
  'timestamp', 'userId', 'action', 'classification', 'dataId'
  'resourceType', 'success', 'riskScore', 'violationsDetected'
  ];
  const rows = report.entries.map(entry => [);
  entry.timestamp.toISOString()
  entry.userId
  entry.action
  entry.classification
  entry.dataId
  entry.resourceType
  entry.outcome.success
  entry.riskScore
  entry.outcome.violationsDetected.join('; ')
  ]);
  return [headers, ...rows].map(row => row.join(',')).join('\n');
  default:
  return JSON.stringify(report, null, 2);
  /**
  * Get audit entry by ID
  */
  getAuditEntry(entryId: string): AuditLogEntry | undefined {
  return this.auditLogs.get(entryId);
  /**
  * Get audit report by ID
  */
  getAuditReport(reportId: string): AuditReport | undefined {
  return this.reports.get(reportId);
  /**
  * Register log handler
  */
  onAuditLog(handler: (entry: AuditLogEntry) => void): void {
  this.logHandlers.push(handler);
  /**
  * Register archive handler
  */
  onArchive(handler: (entries: AuditLogEntry) => void): void {
  this.archiveHandlers.push(handler);
  /**
  * Notify log handlers
  */
  private notifyLogHandlers(entry: AuditLogEntry): void { }
  this.logHandlers.forEach(handler => { )
  try {
  handler(entry) } catch (error) { console.error('Error in audit log handler:', error) });
  /**
   * Start retention cleanup process
   */
  private startRetentionCleanup(): void { // In a real implementation, this would run periodically
    setInterval(() => {
      this.performRetentionCleanup() }, 24 * 60 * 60 * 1000); // Daily cleanup
  /**
   * Perform retention cleanup
   */
  private performRetentionCleanup(): void { const now = Date.now();
  const entriesToArchive: AuditLogEntry = [];
  const entriesToDelete: string = [];
  for (const [entryId, entry] of this.auditLogs) {
  const policy = this.retentionPolicies.get(entry.classification);
  if (!policy) continue;
  const daysSinceEntry = (now - entry.timestamp.getTime()) / (24 * 60 * 60 * 1000);
  if (daysSinceEntry > policy.permanentDeletionAfterDays) {
  entriesToDelete.push(entryId) } else if (daysSinceEntry > policy.archiveAfterDays) { entriesToArchive.push(entry);
    // Archive entries
    if (entriesToArchive.length > 0) {
      this.archiveHandlers.forEach(handler => {)
  try {
          handler(entriesToArchive) } catch (error) { console.error('Error in archive handler:', error) });
    // Delete expired entries
    entriesToDelete.forEach(entryId => { )
  this.auditLogs.delete(entryId) });
    // Clean up expired reports
    const expiredReports = Array.from(this.reports.entries());
      .filter(([_, report]) => report.expiresAt.getTime() < now)
      .map(([reportId, _]) => reportId);
    expiredReports.forEach(reportId => { )
  this.reports.delete(reportId) });
  /**
   * Get retention policy
   */
  getRetentionPolicy(classification: DataClassificationLevel): AuditRetentionPolicy | undefined {
    return this.retentionPolicies.get(classification);
  /**
   * Update retention policy
   */
  updateRetentionPolicy(classification: DataClassificationLevel, policy: AuditRetentionPolicy): void {
    this.retentionPolicies.set(classification, policy);
  /**
   * Get audit statistics
   */
  getAuditStatistics(): {
    totalEntries: number;
  entriesByClassification: Record<DataClassificationLevel, number>;
    entriesByAction: Record<string, number>;
    averageRiskScore: number;
  recentViolations: number;
    const entries = Array.from(this.auditLogs.values());
    const entriesByClassification = {} as Record<DataClassificationLevel, number>;
    const entriesByAction = {} as Record<string, number>;
    let totalRiskScore = 0;
    let recentViolations = 0;
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    entries.forEach(entry => { )
  entriesByClassification[entry.classification] = (entriesByClassification[entry.classification] || 0) + 1;
      entriesByAction[entry.action] = (entriesByAction[entry.action] || 0) + 1;
      totalRiskScore += entry.riskScore;
      if (entry.timestamp.getTime() > oneDayAgo && entry.outcome.violationsDetected.length > 0) {
        recentViolations++ });
    return { totalEntries: entries.length
  entriesByClassification
  entriesByAction
  averageRiskScore: entries.length > 0 ? totalRiskScore / entries.length : 0 }
  recentViolations
};
  /**
   * Clear audit logs (for testing purposes)
   */
  clearAuditLogs(): void {
    this.auditLogs.clear();
    this.reports.clear();

export default ClassificationAuditLoggingService;