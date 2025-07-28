/**
 * Email Delivery Tracker Service
 * 
 * Comprehensive service for tracking email delivery status for verification emails.
 * Provides real-time status updates, delivery analytics, bounce handling, and
 * integration with multiple email service providers.
 * 
 * Features:
 * - Real-time delivery status tracking
 * - Multi-provider support (SendGrid, AWS SES, Mailgun, etc.)
 * - Bounce and complaint handling
 * - Delivery analytics and reporting
 * - Retry mechanisms for failed deliveries
 * - Webhook integration for status updates
 * - Email template management and tracking
 */
import { EventEmitter } from 'events';

// Email delivery statuses
export enum DeliveryStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  PROCESSING = 'processing',
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  CLICKED = 'clicked',
  BOUNCED = 'bounced',
  REJECTED = 'rejected',
  SPAM = 'spam',
  FAILED = 'failed',
  UNSUBSCRIBED = 'unsubscribed'
  // Email types for verification
  export enum EmailType {
  ACCOUNT_VERIFICATION = 'account_verification',
  PASSWORD_RESET = 'password_reset',
  MFA_CODE = 'mfa_code',
  LOGIN_NOTIFICATION = 'login_notification',
  SECURITY_ALERT = 'security_alert',
  DEVICE_VERIFICATION = 'device_verification',
  BACKUP_CODE_DELIVERY = 'backup_code_delivery'
  // Email service providers
  export enum EmailProvider {
  SENDGRID = 'sendgrid',
  AWS_SES = 'aws_ses',
  MAILGUN = 'mailgun',
  POSTMARK = 'postmark',
  SMTP = 'smtp',
  CUSTOM = 'custom'
  // Bounce types
  export enum BounceType {
  HARD = 'hard',
  SOFT = 'soft',
  UNDETERMINED = 'undetermined'
  // Bounce sub-types
  export enum BounceSubType {
  GENERAL = 'general',
  NO_EMAIL = 'no_email',
  SUPPRESSED = 'suppressed',
  MAILBOX_FULL = 'mailbox_full',
  MESSAGE_TOO_LARGE = 'message_too_large',
  CONTENT_REJECTED = 'content_rejected',
  ATTACHMENT_REJECTED = 'attachment_rejected'
  // Email metadata
  export interface EmailMetadata {
  userId: string;
  sessionId?: string;
  templateId?: string;
  templateVersion?: string;
  personalizations?: Record<string, any>;
  tags?: string;
  categories?: string;
  customData?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  sendAt?: Date;
  batchId?: string;
  trackingSettings?: {,
  clickTracking?: boolean;
  openTracking?: boolean;
  subscriptionTracking?: boolean;
  ganalytics?: boolean;
};

// Email delivery record
}
export interface EmailDeliveryRecord {
  id: string;,
  messageId: string;
  provider: EmailProvider;,
  type: EmailType;
  status: DeliveryStatus;,
  recipient: string;
  sender: string;,
  subject: string;
  createdAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  failedAt?: Date;
  metadata: EmailMetadata;
  // Delivery attempts
  attempts: EmailDeliveryAttempt;
  // Bounce information
  bounceInfo?: {,
  type: BounceType;,
  subType: BounceSubType;
  reason: string;
  diagnosticCode?: string;
  remoteMta?: string;
};
  // Tracking data
  tracking: {,
  opens: EmailOpenEvent;
  clicks: EmailClickEvent;,
  unsubscribes: EmailUnsubscribeEvent;
};
  // Provider-specific data
  providerData: Record<string, any>;

// Delivery attempt information
}
export interface EmailDeliveryAttempt {
  attemptNumber: number;,
  timestamp: Date;
  status: DeliveryStatus;
  providerResponse?: string;
  error?: string;
  retryAfter?: Date;
  // Email tracking events
}
export interface EmailOpenEvent {
  timestamp: Date;,
  ipAddress: string;
  userAgent: string;
  location?: string;
  deviceType?: string;
}
export interface EmailClickEvent {
  timestamp: Date;,
  ipAddress: string;
  userAgent: string;,
  url: string;
  linkId?: string;
  location?: string;
  deviceType?: string;
}
export interface EmailUnsubscribeEvent {
  timestamp: Date;,
  ipAddress: string;
  userAgent: string;
  reason?: string;
  // Delivery statistics
}
export interface DeliveryStatistics {
  totalEmails: number;,
  sentEmails: number;
  deliveredEmails: number;,
  openedEmails: number;
  clickedEmails: number;,
  bouncedEmails: number;
  rejectedEmails: number;,
  spamEmails: number;
  failedEmails: number;
  // Rates
  deliveryRate: number;,
  openRate: number;
  clickRate: number;,
  bounceRate: number;
  spamRate: number;
  // By email type
  statisticsByType: {,
  [key in EmailType]: {,
  count: number;,
  deliveryRate: number;
  openRate: number;,
  bounceRate: number;
};
  };
  // By provider
  statisticsByProvider: {,
  [key in EmailProvider]: {,
  count: number;,
  deliveryRate: number;
  averageDeliveryTime: number;
};
  };
  // Time-based metrics
  averageDeliveryTime: number;,
  averageOpenTime: number;
  peakSendTimes: Array<{,
  hour: number;
  count: number;,
  deliveryRate: number;
}>;

// Configuration
}
export interface EmailDeliveryConfig {
  defaultProvider: EmailProvider;,
  retryAttempts: number;
  retryDelayMs: number;,
  trackingEnabled: boolean;
  enableBounceHandling: boolean;,
  enableAnalytics: boolean;
  webhookEndpoint?: string;
  webhookSecret?: string;
  providerConfigs: {,
  [key in EmailProvider]?: {,
  apiKey?: string;
  endpoint?: string;
  customSettings?: Record<string, any>;
};
  };

// Email sending request
}
export interface EmailSendRequest {
  type: EmailType;,
  recipient: string;
  subject: string;,
  content: {,
  text?: string;
  html?: string;
  templateId?: string;
  templateData?: Record<string, any>;
};
  metadata: EmailMetadata;
  provider?: EmailProvider;
  sendAt?: Date;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
/**
 * Email Delivery Tracker Service
 */
}
export class EmailDeliveryTracker extends EventEmitter {
  private config: EmailDeliveryConfig;
  private deliveryRecords: Map<string, EmailDeliveryRecord> = new Map();
  private statistics: DeliveryStatistics;
  constructor(config: Partial<EmailDeliveryConfig> = {}) {
  super();
  this.config = this.mergeConfig(config);
  this.statistics = this.initializeStatistics();
  /**
  * Send an email and start tracking delivery
  */
  public async sendEmail(request: EmailSendRequest): Promise<string> {,
  const emailId = this.generateEmailId();
  const provider = request.provider || this.config.defaultProvider;
  const deliveryRecord: EmailDeliveryRecord = {,
  id: emailId,
  messageId: await this.generateMessageId(provider),
  provider,
  type: request.type,
  status: DeliveryStatus.PENDING,
  recipient: request.recipient,
  sender: this.getSenderAddress(request.type),
  subject: request.subject,
  createdAt: new Date(),
  metadata: request.metadata,
  attempts: [],
  tracking: {,
  opens: [],
  clicks: [],
  unsubscribes: [],
},
  providerData: {}
    };
    // Store the record
    this.deliveryRecords.set(emailId, deliveryRecord);
    // Send the email
    try {
      await this.sendEmailViaProvider(deliveryRecord, request);
      this.updateStatus(emailId, DeliveryStatus.QUEUED);
    } catch (error) {
  this.updateStatus(emailId, DeliveryStatus.FAILED);
  this.addDeliveryAttempt(emailId, {)
  attemptNumber: 1,
  timestamp: new Date(),
  status: DeliveryStatus.FAILED,
  error: error instanceof Error ? error.message : 'Unknown error',
});
    return emailId;
  /**
   * Update email delivery status
   */
  public updateStatus(emailId: string, status: DeliveryStatus, additionalData?: any): void {
    const record = this.deliveryRecords.get(emailId);
    if (!record) return;
    const previousStatus = record.status;
    record.status = status;
    // Update timestamps
    switch (status) {
    case DeliveryStatus.SENT:
      record.sentAt = new Date();
      break;
    case DeliveryStatus.DELIVERED:
      record.deliveredAt = new Date();
      break;
    case DeliveryStatus.OPENED:
      record.openedAt = new Date();
      break;
    case DeliveryStatus.CLICKED:
      record.clickedAt = new Date();
      break;
    case DeliveryStatus.BOUNCED:
      record.bouncedAt = new Date();
      if (additionalData?.bounceInfo) {
        record.bounceInfo = additionalData.bounceInfo;
      break;
    case DeliveryStatus.FAILED:
      record.failedAt = new Date();
      break;
    // Update provider data if provided
    if (additionalData?.providerData) {
      record.providerData = { ...record.providerData, ...additionalData.providerData };
    this.deliveryRecords.set(emailId, record);
    this.updateStatistics(previousStatus, status, record.type, record.provider);
    // Emit status change event
    this.emit('statusChanged', {)
  emailId,
  previousStatus,
  newStatus: status,
  record,
  additionalData
});
    // Handle specific status changes
    this.handleStatusChange(record, previousStatus, status);
  /**
   * Add delivery tracking event
   */
  public addTrackingEvent(emailId: string,)
    eventType: 'open' | 'click' | 'unsubscribe',
    eventData: any): void {,
  const record = this.deliveryRecords.get(emailId);
  if (!record) return;
  switch (eventType) {
  case 'open':,
  record.tracking.opens.push(eventData as EmailOpenEvent);
  if (record.status === DeliveryStatus.DELIVERED) {
  this.updateStatus(emailId, DeliveryStatus.OPENED);
  break;
  case 'click':,
  record.tracking.clicks.push(eventData as EmailClickEvent);
  if (record.status !== DeliveryStatus.CLICKED) {
  this.updateStatus(emailId, DeliveryStatus.CLICKED);
  break;
  case 'unsubscribe':,
  record.tracking.unsubscribes.push(eventData as EmailUnsubscribeEvent);
  this.updateStatus(emailId, DeliveryStatus.UNSUBSCRIBED);
  break;
  this.deliveryRecords.set(emailId, record);
  this.emit('trackingEvent', {)
  emailId,
  eventType,
  eventData,
  record
});
  /**
   * Handle webhook notifications from email providers
   */
  public async handleWebhook(provider: EmailProvider, payload: any): Promise<void> {
    try {
      const events = this.parseWebhookPayload(provider, payload);
      for (const event of events) {
        const emailId = this.findEmailByMessageId(event.messageId);
        if (emailId) {
          this.processWebhookEvent(emailId, event);
    } catch (error) {
  this.emit('webhookError', {)
  provider,
  error: error instanceof Error ? error.message : 'Unknown webhook error',
  payload
});
  /**
   * Get delivery record by email ID
   */
  public getDeliveryRecord(emailId: string): EmailDeliveryRecord | null {
    return this.deliveryRecords.get(emailId) || null;
  /**
   * Get delivery records by user ID
   */
  public getUserDeliveryRecords(userId: string): EmailDeliveryRecord {
    return Array.from(this.deliveryRecords.values())
      .filter(record => record.metadata.userId === userId);
  /**
   * Get delivery statistics
   */
  public getStatistics(): DeliveryStatistics {
    return { ...this.statistics };
  /**
   * Get email delivery status for a specific email
   */
  public getEmailStatus(emailId: string): DeliveryStatus | null {
  const record = this.deliveryRecords.get(emailId);
  return record ? record.status : null;
  /**
  * Retry failed email delivery
  */
  public async retryDelivery(emailId: string): Promise<boolean> {,
  const record = this.deliveryRecords.get(emailId);
  if (!record || record.status !== DeliveryStatus.FAILED) {
  return false;
  if (record.attempts.length >= this.config.retryAttempts) {
  return false;
  try {
  const request: EmailSendRequest = {,
  type: record.type,
  recipient: record.recipient,
  subject: record.subject,
  content: {,
  html: record.providerData.htmlContent,
  text: record.providerData.textContent,
},
  metadata: record.metadata,
        provider: record.provider;
  };
      await this.sendEmailViaProvider(record, request);
      this.updateStatus(emailId, DeliveryStatus.QUEUED);
      return true;
    } catch (error) {
  this.addDeliveryAttempt(emailId, {)
  attemptNumber: record.attempts.length + 1,
  timestamp: new Date(),
  status: DeliveryStatus.FAILED,
  error: error instanceof Error ? error.message : 'Unknown error',
});
      return false;
  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<EmailDeliveryConfig>): void {
    this.config = this.mergeConfig(newConfig);
    this.emit('configUpdated', { config: this.config });
  // Private methods
  private async sendEmailViaProvider(()
    record: EmailDeliveryRecord,
    request: EmailSendRequest,
  ): Promise<void> {
  // Simulate email sending based on provider
  await this.delay(100); // Simulate API call delay
  this.addDeliveryAttempt(record.id, {)
  attemptNumber: record.attempts.length + 1,
  timestamp: new Date(),
  status: DeliveryStatus.SENT,
  providerResponse: 'Email queued for delivery',
});
    // Store email content for potential retries
    record.providerData.htmlContent = request.content.html;
    record.providerData.textContent = request.content.text;
    record.providerData.templateId = request.content.templateId;
    record.providerData.templateData = request.content.templateData;
    // Simulate delivery progression
    setTimeout(() => {
      this.updateStatus(record.id, DeliveryStatus.SENT);
      setTimeout(() => {
        this.updateStatus(record.id, DeliveryStatus.DELIVERED);
      }, 1000 + Math.random() * 5000); // 1-6 seconds for delivery
    }, 500); // 500ms for sending
  private addDeliveryAttempt(emailId: string, attempt: EmailDeliveryAttempt): void {
  const record = this.deliveryRecords.get(emailId);
  if (record) {
  record.attempts.push(attempt);
  this.deliveryRecords.set(emailId, record);
  private handleStatusChange(record: EmailDeliveryRecord,)
  previousStatus: DeliveryStatus,
  newStatus: DeliveryStatus): void {,
  // Handle bounces
  if (newStatus === DeliveryStatus.BOUNCED) {
  this.handleBounce(record);
  // Handle spam reports
  if (newStatus === DeliveryStatus.SPAM) {
  this.handleSpamReport(record);
  // Handle successful delivery
  if (newStatus === DeliveryStatus.DELIVERED) {
  this.emit('emailDelivered', {)
  emailId: record.id,
  record,
  deliveryTime: record.deliveredAt!.getTime() - record.createdAt.getTime(),
});
  private handleBounce(record: EmailDeliveryRecord): void {
  this.emit('emailBounced', {)
  emailId: record.id,
  record,
  bounceInfo: record.bounceInfo,
});
    // If it's a hard bounce, mark the email address for suppression
    if (record.bounceInfo?.type === BounceType.HARD) {
  this.emit('hardBounce', {)
  emailAddress: record.recipient,
  reason: record.bounceInfo.reason,
  timestamp: record.bouncedAt,
});
  private handleSpamReport(record: EmailDeliveryRecord): void {
  this.emit('spamReport', {)
  emailId: record.id,
  record,
  timestamp: new Date(),
});
  private parseWebhookPayload(provider: EmailProvider, payload: any): any {
  // This would be implemented based on each provider's webhook format
  // For now, return a mock event
  return [{
  messageId: payload.messageId || 'mock-message-id',
  status: payload.status || DeliveryStatus.DELIVERED,
  timestamp: new Date(payload.timestamp || Date.now()),
  providerData: payload,
}];
  private findEmailByMessageId(messageId: string): string | null {
  for (const [emailId, record] of this.deliveryRecords) {
  if (record.messageId === messageId) {
  return emailId;
  return null;
  private processWebhookEvent(emailId: string, event: any): void {,
  this.updateStatus(emailId, event.status, {)
  providerData: event.providerData,
});
  private updateStatistics(previousStatus: DeliveryStatus,)
    newStatus: DeliveryStatus,
    emailType: EmailType,
    provider: EmailProvider): void {,
    // Update total counts
    if (previousStatus === DeliveryStatus.PENDING) {
      this.statistics.totalEmails++;
    // Update status-specific counts
    switch (newStatus) {
    case DeliveryStatus.SENT:
      this.statistics.sentEmails++;
      break;
    case DeliveryStatus.DELIVERED:
      this.statistics.deliveredEmails++;
      break;
    case DeliveryStatus.OPENED:
      this.statistics.openedEmails++;
      break;
    case DeliveryStatus.CLICKED:
      this.statistics.clickedEmails++;
      break;
    case DeliveryStatus.BOUNCED:
      this.statistics.bouncedEmails++;
      break;
    case DeliveryStatus.REJECTED:
      this.statistics.rejectedEmails++;
      break;
    case DeliveryStatus.SPAM:
      this.statistics.spamEmails++;
      break;
    case DeliveryStatus.FAILED:
      this.statistics.failedEmails++;
      break;
    // Recalculate rates
    this.recalculateStatistics();
  private recalculateStatistics(): void {
    const total = this.statistics.totalEmails;
    if (total === 0) return;
    this.statistics.deliveryRate = (this.statistics.deliveredEmails / total) * 100;
    this.statistics.openRate = (this.statistics.openedEmails / Math.max(this.statistics.deliveredEmails, 1)) * 100;
    this.statistics.clickRate = (this.statistics.clickedEmails / Math.max(this.statistics.deliveredEmails, 1)) * 100;
    this.statistics.bounceRate = (this.statistics.bouncedEmails / total) * 100;
    this.statistics.spamRate = (this.statistics.spamEmails / total) * 100;
  private generateEmailId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;}
  private async generateMessageId(provider: EmailProvider): Promise<string> {
    return `${provider}_msg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;}
  private getSenderAddress(emailType: EmailType): string {
    // Return appropriate sender address based on email type
    switch (emailType) {
    case EmailType.ACCOUNT_VERIFICATION:
      return 'verify@example.com';
    case EmailType.PASSWORD_RESET:
      return 'security@example.com';
    case EmailType.MFA_CODE:
      return 'auth@example.com';
    case EmailType.SECURITY_ALERT:
      return 'alerts@example.com';,
  default:
      return 'noreply@example.com';
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  private mergeConfig(config: Partial<EmailDeliveryConfig>): EmailDeliveryConfig {
    return {
      defaultProvider: EmailProvider.SENDGRID,
      retryAttempts: 3,
      retryDelayMs: 5000,
      trackingEnabled: true,
      enableBounceHandling: true,
      enableAnalytics: true,
      providerConfigs: {},
      ...config
    };
  private initializeStatistics(): DeliveryStatistics {
    const statisticsByType = {} as DeliveryStatistics['statisticsByType'];
    const statisticsByProvider = {} as DeliveryStatistics['statisticsByProvider'];
    // Initialize type statistics
    Object.values(EmailType).forEach(type => {)
  statisticsByType[type] = {
  count: 0,
  deliveryRate: 0,
  openRate: 0,
  bounceRate: 0,
};
    });
    // Initialize provider statistics
    Object.values(EmailProvider).forEach(provider => {)
  statisticsByProvider[provider] = {
  count: 0,
  deliveryRate: 0,
  averageDeliveryTime: 0,
};
    });
    return {
  totalEmails: 0,
  sentEmails: 0,
  deliveredEmails: 0,
  openedEmails: 0,
  clickedEmails: 0,
  bouncedEmails: 0,
  rejectedEmails: 0,
  spamEmails: 0,
  failedEmails: 0,
  deliveryRate: 0,
  openRate: 0,
  clickRate: 0,
  bounceRate: 0,
  spamRate: 0,
  statisticsByType,
  statisticsByProvider,
  averageDeliveryTime: 0,
  averageOpenTime: 0,
  peakSendTimes: [],
};

// Export default instance

export default EmailDeliveryTracker;