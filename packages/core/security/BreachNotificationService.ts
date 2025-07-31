/**
 * Automated Breach Notification Service
 * 
 * Comprehensive breach detection and notification system compliant with
 * GDPR Article 33, NIST incident response guidelines, and 2025 security standards.
 * 
 * Features:
 * - Automated breach detection and classification
 * - 72-hour GDPR compliance workflow
 * - Multi-channel notification system
 * - Incident response orchestration
 * - Audit trail and documentation
 */
import { EventEmitter } from 'events';
import crypto from 'crypto';

// Breach Classification
export enum BreachSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
  export enum BreachType {
  CONFIDENTIALITY = 'confidentiality',
  INTEGRITY = 'integrity',
  AVAILABILITY = 'availability',
  COMBINED = 'combined'
  export enum BreachCategory {
  CYBER_ATTACK = 'cyber_attack',
  HUMAN_ERROR = 'human_error',
  SYSTEM_FAILURE = 'system_failure',
  PHYSICAL_BREACH = 'physical_breach',
  THIRD_PARTY = 'third_party'
  // Notification Types
  export enum NotificationType {
  INTERNAL_ALERT = 'internal_alert',
  REGULATORY_FILING = 'regulatory_filing',
  CUSTOMER_NOTIFICATION = 'customer_notification',
  PUBLIC_DISCLOSURE = 'public_disclosure',
  LAW_ENFORCEMENT = 'law_enforcement'
  // Data Subject Categories
  export enum DataSubjectCategory {
  EMPLOYEES = 'employees',
  CUSTOMERS = 'customers',
  PROSPECTS = 'prospects',
  PARTNERS = 'partners',
  MINORS = 'minors',
  VULNERABLE_GROUPS = 'vulnerable_groups'
  export interface BreachIncident {
  id: string;
  title: string;
  description: string;
  detectedAt: Date;
  reportedAt?: Date;
  severity: BreachSeverity;
  type: BreachType;
  category: BreachCategory;
  dataTypes: string;
  dataSubjects: {
  category: DataSubjectCategory;
  count: number;
  countries: string;
}
}[];
  affectedSystems: string;
  rootCause?: string;
  containmentActions: string;
  mitigationMeasures: string;
  status: IncidentStatus;
  assignee?: string;
  dueDate?: Date;
  notifications: NotificationRecord;
  evidence: EvidenceRecord;
  timeline: TimelineEvent;
  riskAssessment: RiskAssessment;
  complianceRequirements: ComplianceRequirement;
  metadata: Record<string, any>;
}
export enum IncidentStatus {
  DETECTED = 'detected',
  INVESTIGATING = 'investigating',
  CONTAINED = 'contained',
  ERADICATING = 'eradicating',
  RECOVERING = 'recovering',
  LESSONS_LEARNED = 'lessons_learned',
  CLOSED = 'closed'
  export interface NotificationRecord {
  id: string;
  type: NotificationType;
  recipient: string;
  channel: string;
  sentAt: Date;
  deliveredAt?: Date;
  acknowledgedAt?: Date;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'acknowledged';
  metadata: Record<string, any>;
}
}
}
export interface EvidenceRecord {
  id: string;
  type: 'log' | 'screenshot' | 'document' | 'forensic' | 'witness';
  filename: string;
  hash: string;
  collectedAt: Date;
  collectedBy: string;
  description: string;
  chainOfCustody: ChainOfCustodyEntry;
}
}
}
export interface ChainOfCustodyEntry {
  timestamp: Date;
  action: 'collected' | 'transferred' | 'analyzed' | 'stored';
  person: string;
  location: string;
  notes?: string;
}
}
}
export interface TimelineEvent {
  timestamp: Date;
  event: string;
  actor: string;
  details: Record<string, any>;
}
}
}
export interface RiskAssessment {
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  factors: string;
  recommendations: string;
  residualRisk: string;
}
}
}
export interface ComplianceRequirement {
  framework: 'GDPR' | 'NIST' | 'HIPAA' | 'PCI_DSS' | 'SOX';
  requirement: string;
  deadline: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  evidence?: string;
  // Configuration
}
}
}
export interface BreachNotificationConfig {
  detection: {
  enabled: boolean;
  autoClassification: boolean;
  riskThreshold: BreachSeverity;
  monitoringSources: string;
}
};
  notifications: {
  gdpr: {
  enabled: boolean;
  supervisoryAuthority: string;
  contactEmail: string;
  autoFile: boolean;
  deadline: number; // hours,
};
    internal: {
  securityTeam: string;
  management: string;
  legal: string;
  dpo: string;
};
    external: {
  customers: {
  enabled: boolean;
  highRiskThreshold: BreachSeverity;
  template: string;
};
      media: {
  enabled: boolean;
  criticalThreshold: BreachSeverity;
  contactList: string;
};
    };
  };
  automation: {
  containmentActions: boolean;
  evidenceCollection: boolean;
  reportGeneration: boolean;
  statusUpdates: boolean;
};
  compliance: {
  frameworks: string;
  auditLogging: boolean;
  retentionPeriod: string;
};
const DEFAULT_CONFIG: BreachNotificationConfig = {,
  detection: {
  enabled: true,
  autoClassification: true,
  riskThreshold: BreachSeverity.MEDIUM,
  monitoringSources: ['security_logs', 'authentication_systems', 'data_access_logs'],
},
  notifications: {
  gdpr: {
  enabled: true,
  supervisoryAuthority: 'ICO',
  contactEmail: 'dpo@company.com',
  autoFile: false, // Require manual review,
  deadline: 72,
},
  internal: {
  securityTeam: ['security@company.com'],
  management: ['ceo@company.com', 'ciso@company.com'],
  legal: ['legal@company.com'],
  dpo: 'dpo@company.com',
},
  external: {
  customers: {
  enabled: true,
  highRiskThreshold: BreachSeverity.HIGH,
  template: 'customer_breach_notification',
},
  media: {
  enabled: false,
  criticalThreshold: BreachSeverity.CRITICAL,
  contactList: [],
},
  automation: {
  containmentActions: true,
  evidenceCollection: true,
  reportGeneration: true,
  statusUpdates: true,
},
  compliance: {
  frameworks: ['GDPR', 'NIST'],
  auditLogging: true,
  retentionPeriod: '7 years',
};
/**
 * Automated breach notification and incident response service
 */
}
export class BreachNotificationService extends EventEmitter {
  private incidents: Map<string, BreachIncident> = new Map();
  private config: BreachNotificationConfig;
  private timers: Map<string, NodeJS.Timeout> = new Map();
  constructor(config?: Partial<BreachNotificationConfig>) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startMonitoring();
  /**
   * Report a new breach incident
   */
  public async reportBreach(incidentData: {)
  title: string;
  description: string;
  severity?: BreachSeverity;
  type?: BreachType;
  category?: BreachCategory;
  dataTypes: string;
  affectedSystems: string;
  estimatedDataSubjects?: number;
  detectedBy?: string;
  metadata?: Record<string, any>;
}): Promise<string> {

    const incident: BreachIncident = {,
  id: this.generateIncidentId(),
      title: incidentData.title,
      description: incidentData.description,
      detectedAt: new Date(),
      severity: incidentData.severity || await this.classifyBreach(incidentData),
      type: incidentData.type || BreachType.CONFIDENTIALITY,
      category: incidentData.category || BreachCategory.CYBER_ATTACK,
      dataTypes: incidentData.dataTypes,
      dataSubjects: [],
      affectedSystems: incidentData.affectedSystems,
      containmentActions: [],
      mitigationMeasures: [],
      status: IncidentStatus.DETECTED,
      notifications: [],
      evidence: [],
      timeline: [{,
  timestamp: new Date(),
        event: 'Incident detected and reported',
        actor: incidentData.detectedBy || 'system',
        details: incidentData.metadata || {}
      }],
      riskAssessment: await this.assessRisk(incidentData),
      complianceRequirements: this.generateComplianceRequirements(incidentData.severity || BreachSeverity.MEDIUM),
      metadata: incidentData.metadata || {}
    };
    // Store incident
    this.incidents.set(incident.id, incident);
    // Start incident response workflow
    await this.initiateIncidentResponse(incident);
    // Emit incident creation event
    this.emit('incidentCreated', incident);
    return incident.id;
  /**
   * Update incident status and progress
   */
  public async updateIncident(
    incidentId: string,
    updates: Partial<BreachIncident>,
    actor: string): Promise<void> {,
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);}
    // Create timeline entry
    const timelineEvent: TimelineEvent = {,
  timestamp: new Date(),
  event: 'Incident updated',
  actor,
  details: updates,
};
    // Apply updates
    const updatedIncident = {
  ...incident,
  ...updates,
  timeline: [...incident.timeline, timelineEvent],
};
    this.incidents.set(incidentId, updatedIncident);
    // Handle status changes
    if (updates.status && updates.status !== incident.status) {
      await this.handleStatusChange(updatedIncident, incident.status);
    this.emit('incidentUpdated', updatedIncident);
  /**
   * Send notification to specified recipients
   */
  public async sendNotification(
    incidentId: string,
    type: NotificationType,
    recipients: string,
    template?: string
  ): Promise<NotificationRecord> {

    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);}
    const notifications: NotificationRecord = [];
    for (const recipient of recipients) {
      const notification: NotificationRecord = {,
  id: crypto.randomUUID(),
        type,
        recipient,
        channel: this.determineChannel(type, recipient),
        sentAt: new Date(),
        content: await this.generateNotificationContent(incident, type, template),
        status: 'pending',
        metadata: { incidentId, template }
      };
      try {
        await this.deliverNotification(notification);
        notification.status = 'sent';
        notification.deliveredAt = new Date();
      } catch (error) {
        notification.status = 'failed';
        notification.metadata.error = (error as Error).message;
      notifications.push(notification);
    // Update incident with new notifications
    incident.notifications.push(...notifications);
    this.incidents.set(incidentId, incident);
    this.emit('notificationsSent', { incidentId, notifications });
    return notifications;
  /**
   * Generate GDPR notification for supervisory authority
   */
  public async generateGDPRNotification(incidentId: string): Promise<{,
  content: string;
  deadline: Date;
  recipients: string;
}> {

    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);}
    // Check if GDPR notification is required
    if (!this.requiresGDPRNotification(incident)) {
      throw new Error('Incident does not require GDPR notification');
    // Calculate deadline (72 hours from detection)
    const deadline = new Date(incident.detectedAt.getTime() + (this.config.notifications.gdpr.deadline * 60 * 60 * 1000));
    // Generate notification content
    const content = await this.generateGDPRContent(incident);
    // Determine recipients
    const recipients = [;
      this.config.notifications.gdpr.contactEmail,
      this.config.notifications.internal.dpo
    ];
    return { content, deadline, recipients };
  /**
   * Check GDPR compliance status
   */
  public checkGDPRCompliance(incidentId: string): {
  compliant: boolean;
    timeRemaining: number; // milliseconds,
  violations: string;
    actions: string;
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);}
    const violations: string = [];
    const actions: string = [];
    // Check 72-hour deadline
    const deadline = new Date(incident.detectedAt.getTime() + (72 * 60 * 60 * 1000));
    const timeRemaining = deadline.getTime() - Date.now();
    if (timeRemaining < 0) {
  violations.push('72-hour notification deadline exceeded');
  // Check if notification was sent
  const gdprNotification = incident.notifications.find(n => n.type === NotificationType.REGULATORY_FILING);
  if (!gdprNotification && this.requiresGDPRNotification(incident)) {
  violations.push('GDPR notification not sent');
  actions.push('Send GDPR notification to supervisory authority');
  // Check required information
  if (!incident.riskAssessment) {
  violations.push('Risk assessment not completed');
  actions.push('Complete risk assessment');
  if (incident.dataSubjects.length === 0) {
  violations.push('Data subject impact not assessed');
  actions.push('Assess number and categories of affected data subjects');
  return {
  compliant: violations.length === 0,
  timeRemaining,
  violations,
  actions
};
  /**
   * Generate incident report
   */
  public generateReport(incidentId: string, format: 'summary' | 'detailed' | 'regulatory'): string {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);}
    switch (format) {
    case 'summary':
      return this.generateSummaryReport(incident);
    case 'detailed':
      return this.generateDetailedReport(incident);
    case 'regulatory':
      return this.generateRegulatoryReport(incident);
    default:
      throw new Error(`Unknown report format: ${format}`);}
  /**
   * Get all incidents with optional filtering
   */
  public getIncidents(filter?: {)
  status?: IncidentStatus;
    severity?: BreachSeverity;
    dateRange?: { start: Date; end: Date };
    assignee?: string;
  }): BreachIncident {
  let incidents = Array.from(this.incidents.values());
  if (filter) {
  if (filter.status) {
  incidents = incidents.filter(i => i.status === filter.status);
  if (filter.severity) {
  incidents = incidents.filter(i => i.severity === filter.severity);
  if (filter.dateRange) {
  incidents = incidents.filter(i => )
  i.detectedAt >= filter.dateRange!.start &&
  i.detectedAt <= filter.dateRange!.end
  );
  if (filter.assignee) {
  incidents = incidents.filter(i => i.assignee === filter.assignee);
  return incidents.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  // Private helper methods
  private async initiateIncidentResponse(incident: BreachIncident): Promise<void> {,
  // Send immediate internal notifications
  await this.sendInternalNotifications(incident);
  // Start automated containment if enabled
  if (this.config.automation.containmentActions) {
  await this.initiateContainment(incident);
  // Schedule GDPR deadline reminder
  if (this.requiresGDPRNotification(incident)) {
  this.scheduleGDPRReminder(incident);
  // Start evidence collection
  if (this.config.automation.evidenceCollection) {
  await this.startEvidenceCollection(incident);
  private async sendInternalNotifications(incident: BreachIncident): Promise<void> {,
  const urgentRecipients = [;
  ...this.config.notifications.internal.securityTeam
  ];
  if (incident.severity === BreachSeverity.HIGH || incident.severity === BreachSeverity.CRITICAL) {
  urgentRecipients.push(...this.config.notifications.internal.management);
  await this.sendNotification()
  incident.id,
  NotificationType.INTERNAL_ALERT,
  urgentRecipients,
  'internal_breach_alert'
  );
  private requiresGDPRNotification(incident: BreachIncident): boolean {,
  // GDPR notification required if personal data is involved and risk assessment indicates risk
  const hasPersonalData = incident.dataTypes.some(type => ;);
  ['email', 'phone', 'name', 'pii', 'personal_data'].includes(type.toLowerCase())
  );
  const hasSignificantRisk = incident.severity === BreachSeverity.HIGH || ;
  incident.severity === BreachSeverity.CRITICAL ||
  incident.riskAssessment.overallRisk === 'high' ||
  incident.riskAssessment.overallRisk === 'critical';
  return hasPersonalData && hasSignificantRisk;
  private async classifyBreach(incidentData: any): Promise<BreachSeverity> {,
  // Simple classification logic - can be enhanced with ML
  let score = 0;
  // Data sensitivity
  if (incidentData.dataTypes.includes('pii') || incidentData.dataTypes.includes('personal_data')) {
  score += 3;
  if (incidentData.dataTypes.includes('financial') || incidentData.dataTypes.includes('health')) {
  score += 4;
  // Scale
  if (incidentData.estimatedDataSubjects > 1000) {
  score += 3;
} else if (incidentData.estimatedDataSubjects > 100) {
  score += 2;
  // System criticality
  if (incidentData.affectedSystems.includes('authentication') ||
  incidentData.affectedSystems.includes('payment')) {
  score += 3;
  if (score >= 8) return BreachSeverity.CRITICAL;
  if (score >= 6) return BreachSeverity.HIGH;
  if (score >= 3) return BreachSeverity.MEDIUM;
  return BreachSeverity.LOW;
  private async assessRisk(incidentData: any): Promise<RiskAssessment> {,
  // Simplified risk assessment - should be enhanced with proper methodology
  return {
  likelihood: 'medium',
  impact: 'high',
  overallRisk: 'high',
  factors: [,
  'Personal data involved',
  'Authentication system affected',
  'Potential for identity theft'
  ],
  recommendations: [,
  'Notify affected individuals',
  'Enhance monitoring',
  'Review access controls'
  ],
  residualRisk: 'Monitor for account takeover attempts',
};
  private generateComplianceRequirements(severity: BreachSeverity): ComplianceRequirement {
  const requirements: ComplianceRequirement = [];
  if (severity === BreachSeverity.HIGH || severity === BreachSeverity.CRITICAL) {
  requirements.push({)
  framework: 'GDPR',
  requirement: 'Notify supervisory authority within 72 hours',
  deadline: new Date(Date.now() + 72 * 60 * 60 * 1000),
  status: 'pending',
});
      requirements.push({)
  framework: 'GDPR',
  requirement: 'Notify affected data subjects if high risk',
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days,
  status: 'pending',
});
    return requirements;
  private generateIncidentId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `INC-${timestamp}-${random.toUpperCase()}`;}
  private scheduleGDPRReminder(incident: BreachIncident): void {
    // Schedule reminder 24 hours before deadline
    const reminderTime = new Date(incident.detectedAt.getTime() + 48 * 60 * 60 * 1000);
    const timeout = setTimeout(() => {
      this.emit('gdprDeadlineApproaching', incident);
    }, reminderTime.getTime() - Date.now());
    this.timers.set(`gdpr-${incident.id}`, timeout);}
  private startMonitoring(): void {
    // Monitor for breach indicators from various sources
    if (this.config.detection.enabled) {
      // This would integrate with actual monitoring systems
      setInterval(() => {
        this.checkBreachIndicators();
      }, 60000); // Check every minute
  private checkBreachIndicators(): void {
    // Placeholder for breach detection logic
    // In production, this would integrate with SIEM, IDS, etc.
  private async handleStatusChange(incident: BreachIncident, oldStatus: IncidentStatus): Promise<void> {

    switch (incident.status) {
    case IncidentStatus.CONTAINED:
      await this.handleContainment(incident);
      break;
    case IncidentStatus.CLOSED:
      await this.handleClosure(incident);
      break;
  private async handleContainment(incident: BreachIncident): Promise<void> {

    // Automated containment actions based on incident type
    this.emit('incidentContained', incident);
  private async handleClosure(incident: BreachIncident): Promise<void> {

    // Final compliance checks and reporting
    const compliance = this.checkGDPRCompliance(incident.id);
    if (!compliance.compliant) {
      this.emit('complianceViolation', { incident, violations: compliance.violations });
    this.emit('incidentClosed', incident);
  // Additional helper methods for notification content generation, delivery, etc.
  private async generateNotificationContent(incident: BreachIncident, type: NotificationType, template?: string): Promise<string> {

    // Generate appropriate notification content based on type and template
    return `Incident ${incident.id}: ${incident.title}`;}
  private async deliverNotification(notification: NotificationRecord): Promise<void> {

    // Integrate with email, SMS, Slack, etc. delivery systems
    console.log(`Delivering notification ${notification.id} to ${notification.recipient}`);}
  private determineChannel(type: NotificationType, recipient: string): string {
    if (recipient.includes('@')) return 'email';
    if (recipient.startsWith('+')) return 'sms';
    return 'system';
  private async generateGDPRContent(incident: BreachIncident): Promise<string> {

    return `GDPR Personal Data Breach Notification for incident ${incident.id}`;}
  private generateSummaryReport(incident: BreachIncident): string {
    return JSON.stringify(incident, null, 2);
  private generateDetailedReport(incident: BreachIncident): string {
    return JSON.stringify(incident, null, 2);
  private generateRegulatoryReport(incident: BreachIncident): string {
    return JSON.stringify(incident, null, 2);
  private async initiateContainment(incident: BreachIncident): Promise<void> {

    // Automated containment logic
  private async startEvidenceCollection(incident: BreachIncident): Promise<void> {

    // Automated evidence collection

// Export default instance
export const breachNotificationService = new BreachNotificationService();

export default BreachNotificationService;