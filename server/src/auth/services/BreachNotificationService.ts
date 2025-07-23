/**
 * Breach Notification Service - Epic 19
 * 
 * Manages user notifications when their passwords are found in data breaches.
 * Provides secure, privacy-preserving breach notifications with user guidance
 * for password security improvement.
 */

import { AuditService } from './AuditService';
import { EmailService } from './EmailService';
import { logger } from '../../utils/logger';

export interface BreachNotification {
  id: string;
  userId: string;
  notificationId: string;
  breachSource: string;
  detectedAt: Date;
  sentAt?: Date;
  acknowledged?: boolean;
  acknowledgedAt?: Date;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  occurrenceCount: number;
  notificationType: 'EMAIL' | 'IN_APP' | 'SMS' | 'PUSH';
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'ACKNOWLEDGED';
}

export interface BreachNotificationConfig {
  enableEmailNotifications: boolean;
  enableInAppNotifications: boolean;
  enableSMSNotifications: boolean;
  enablePushNotifications: boolean;
  immediateNotificationThreshold: number; // Occurrence count threshold
  batchNotificationDelay: number; // Minutes to wait before sending batch notifications
  maxNotificationsPerDay: number;
  includeGuidance: boolean;
  includeSecurityTips: boolean;
}

export interface NotificationTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
  inAppMessage: string;
  smsMessage: string;
  pushMessage: string;
}

export class BreachNotificationService {
  private auditService: AuditService;
  private emailService: EmailService;
  private config: BreachNotificationConfig;
  private notifications: Map<string, BreachNotification> = new Map();
  private pendingNotifications: Set<string> = new Set();

  constructor(
    auditService: AuditService,
    emailService: EmailService,
    config?: Partial<BreachNotificationConfig>
  ) {
    this.auditService = auditService;
    this.emailService = emailService;
    this.config = {
      enableEmailNotifications: true,
      enableInAppNotifications: true,
      enableSMSNotifications: false,
      enablePushNotifications: false,
      immediateNotificationThreshold: 100000, // Immediately notify for passwords seen >100k times
      batchNotificationDelay: 30, // Wait 30 minutes before batch sending
      maxNotificationsPerDay: 3,
      includeGuidance: true,
      includeSecurityTips: true,
      ...config
    };

    this.initializeService();
  }

  /**
   * Initialize the breach notification service
   */
  private initializeService(): void {
    // Set up periodic processing of pending notifications
    setInterval(() => this.processPendingNotifications(), 5 * 60 * 1000); // Every 5 minutes
    
    logger.log('BreachNotificationService initialized');
  }

  /**
   * Create a breach notification for a user
   */
  async createBreachNotification(
    userId: string,
    breachSource: string,
    occurrenceCount: number,
    skipRateLimit: boolean = false
  ): Promise<BreachNotification> {
    const notificationId = this.generateNotificationId();
    const severity = this.calculateSeverity(occurrenceCount);
    
    try {
      // Check rate limiting unless skipped
      if (!skipRateLimit && !await this.checkRateLimit(userId)) {
        logger.log(`Breach notification rate limited for user ${userId}`);
        throw new Error('Notification rate limit exceeded');
      }

      const notification: BreachNotification = {
        id: notificationId,
        userId,
        notificationId,
        breachSource,
        detectedAt: new Date(),
        severity,
        occurrenceCount,
        notificationType: this.determineNotificationType(severity),
        status: 'PENDING'
      };

      // Store notification
      this.notifications.set(notificationId, notification);
      
      // Determine if immediate notification is required
      const requiresImmediateNotification = occurrenceCount >= this.config.immediateNotificationThreshold;
      
      if (requiresImmediateNotification) {
        await this.sendImmediateNotification(notification);
      } else {
        // Add to batch processing queue
        this.pendingNotifications.add(notificationId);
      }

      // Audit log the notification creation
      await this.auditService.logEvent({
        eventType: 'BREACH_NOTIFICATION_CREATED',
        userId,
        details: {
          notificationId,
          breachSource,
          occurrenceCount,
          severity,
          immediate: requiresImmediateNotification
        },
        riskLevel: 'HIGH',
        compliance: {
          frameworks: ['GDPR', 'OWASP'],
          requirements: ['breach_notification', 'user_security'],
          evidenceLevel: 'ENHANCED'
        }
      });

      return notification;

    } catch (error) {
      logger.log(`Failed to create breach notification: ${error.message}`);
      
      await this.auditService.logEvent({
        eventType: 'BREACH_NOTIFICATION_ERROR',
        userId,
        details: {
          error: error.message,
          breachSource,
          occurrenceCount
        },
        riskLevel: 'HIGH',
        compliance: {
          frameworks: ['GDPR', 'OWASP'],
          requirements: ['breach_notification'],
          evidenceLevel: 'ENHANCED'
        }
      });
      
      throw error;
    }
  }

  /**
   * Send immediate notification for high-severity breaches
   */
  private async sendImmediateNotification(notification: BreachNotification): Promise<void> {
    try {
      const template = this.getNotificationTemplate(notification);
      
      // Send email notification
      if (this.config.enableEmailNotifications) {
        await this.sendEmailNotification(notification, template);
      }

      // Send in-app notification
      if (this.config.enableInAppNotifications) {
        await this.sendInAppNotification(notification, template);
      }

      // Update notification status
      notification.status = 'SENT';
      notification.sentAt = new Date();

      logger.log(`Immediate breach notification sent for user ${notification.userId}`);

    } catch (error) {
      notification.status = 'FAILED';
      logger.log(`Failed to send immediate breach notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process pending notifications in batches
   */
  private async processPendingNotifications(): Promise<void> {
    if (this.pendingNotifications.size === 0) return;

    const currentTime = Date.now();
    const notificationsToProcess: BreachNotification[] = [];

    for (const notificationId of this.pendingNotifications) {
      const notification = this.notifications.get(notificationId);
      
      if (notification) {
        const timeSinceCreated = currentTime - notification.detectedAt.getTime();
        const batchDelayMs = this.config.batchNotificationDelay * 60 * 1000;
        
        if (timeSinceCreated >= batchDelayMs) {
          notificationsToProcess.push(notification);
          this.pendingNotifications.delete(notificationId);
        }
      }
    }

    // Process notifications in batches by user
    const notificationsByUser = this.groupNotificationsByUser(notificationsToProcess);
    
    for (const [userId, userNotifications] of notificationsByUser) {
      await this.sendBatchNotification(userId, userNotifications);
    }
  }

  /**
   * Send batch notification for multiple breaches
   */
  private async sendBatchNotification(
    userId: string, 
    notifications: BreachNotification[]
  ): Promise<void> {
    try {
      const template = this.getBatchNotificationTemplate(notifications);
      
      // Send consolidated email
      if (this.config.enableEmailNotifications) {
        await this.sendBatchEmailNotification(userId, notifications, template);
      }

      // Update all notification statuses
      notifications.forEach(notification => {
        notification.status = 'SENT';
        notification.sentAt = new Date();
      });

      logger.log(`Batch breach notification sent for user ${userId} (${notifications.length} breaches)`);

    } catch (error) {
      notifications.forEach(notification => {
        notification.status = 'FAILED';
      });
      
      logger.log(`Failed to send batch breach notification: ${error.message}`);
    }
  }

  /**
   * Generate notification templates based on breach severity
   */
  private getNotificationTemplate(notification: BreachNotification): NotificationTemplate {
    const isHighSeverity = notification.occurrenceCount >= this.config.immediateNotificationThreshold;
    
    const baseTemplate = {
      subject: isHighSeverity 
        ? '🚨 Urgent: Your password was found in a major data breach'
        : '⚠️ Security Alert: Password found in data breach',
      
      htmlBody: this.generateHTMLEmailBody(notification),
      textBody: this.generateTextEmailBody(notification),
      inAppMessage: this.generateInAppMessage(notification),
      smsMessage: this.generateSMSMessage(notification),
      pushMessage: this.generatePushMessage(notification)
    };

    return baseTemplate;
  }

  /**
   * Generate HTML email body with security guidance
   */
  private generateHTMLEmailBody(notification: BreachNotification): string {
    const severityColor = this.getSeverityColor(notification.severity);
    const guidanceSection = this.config.includeGuidance ? this.getSecurityGuidanceHTML() : '';
    
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: ${severityColor}; color: white; padding: 20px; text-align: center;">
        <h1>Security Alert: Password Breach Detected</h1>
      </div>
      
      <div style="padding: 20px;">
        <h2>What happened?</h2>
        <p>We've detected that a password associated with your account has been found in a known data breach. 
           This password has appeared <strong>${notification.occurrenceCount.toLocaleString()}</strong> times in breach databases.</p>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #856404;">Immediate Action Required</h3>
          <ul>
            <li><strong>Change your password immediately</strong> on this account and any other accounts using the same password</li>
            <li>Use a unique, strong password that you haven't used elsewhere</li>
            <li>Consider enabling two-factor authentication for additional security</li>
          </ul>
        </div>
        
        ${guidanceSection}
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This notification was sent because we detected a security concern with your account. 
          We use privacy-preserving methods to check password security without exposing your actual password.
          <br><br>
          If you have questions, please contact our security team.
        </p>
      </div>
    </div>
    `;
  }

  /**
   * Generate plain text email body
   */
  private generateTextEmailBody(notification: BreachNotification): string {
    return `
SECURITY ALERT: Password Breach Detected

We've detected that a password associated with your account has been found in a known data breach. 
This password has appeared ${notification.occurrenceCount.toLocaleString()} times in breach databases.

IMMEDIATE ACTION REQUIRED:
- Change your password immediately on this account and any other accounts using the same password
- Use a unique, strong password that you haven't used elsewhere  
- Consider enabling two-factor authentication for additional security

${this.config.includeGuidance ? this.getSecurityGuidanceText() : ''}

This notification was sent because we detected a security concern with your account.
We use privacy-preserving methods to check password security without exposing your actual password.

If you have questions, please contact our security team.
    `.trim();
  }

  /**
   * Calculate notification severity based on occurrence count
   */
  private calculateSeverity(occurrenceCount: number): BreachNotification['severity'] {
    if (occurrenceCount >= 1000000) return 'CRITICAL';
    if (occurrenceCount >= 100000) return 'HIGH';
    if (occurrenceCount >= 10000) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Determine notification type based on severity
   */
  private determineNotificationType(severity: BreachNotification['severity']): BreachNotification['notificationType'] {
    if (severity === 'CRITICAL') return 'EMAIL';
    if (severity === 'HIGH') return 'EMAIL';
    return 'IN_APP';
  }

  /**
   * Check notification rate limit for user
   */
  private async checkRateLimit(userId: string): Promise<boolean> {
    // This would typically check against persistent storage
    // For now, simplified implementation
    const today = new Date().toDateString();
    const userNotificationsToday = Array.from(this.notifications.values())
      .filter(n => n.userId === userId && n.detectedAt.toDateString() === today);
    
    return userNotificationsToday.length < this.config.maxNotificationsPerDay;
  }

  /**
   * Utility methods
   */
  private generateNotificationId(): string {
    return `BREACH-NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  private getSeverityColor(severity: string): string {
    const colors = {
      CRITICAL: '#dc3545',
      HIGH: '#fd7e14', 
      MEDIUM: '#ffc107',
      LOW: '#17a2b8'
    };
    return colors[severity as keyof typeof colors] || colors.LOW;
  }

  private groupNotificationsByUser(notifications: BreachNotification[]): Map<string, BreachNotification[]> {
    const grouped = new Map<string, BreachNotification[]>();
    
    notifications.forEach(notification => {
      const existing = grouped.get(notification.userId) || [];
      existing.push(notification);
      grouped.set(notification.userId, existing);
    });
    
    return grouped;
  }

  private getSecurityGuidanceHTML(): string {
    if (!this.config.includeSecurityTips) return '';
    
    return `
    <div style="background-color: #e3f2fd; border: 1px solid #90caf9; border-radius: 4px; padding: 15px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1565c0;">Password Security Tips</h3>
      <ul>
        <li>Use a unique password for every account</li>
        <li>Make passwords at least 12 characters long</li>
        <li>Include a mix of uppercase, lowercase, numbers, and symbols</li>
        <li>Consider using a reputable password manager</li>
        <li>Enable two-factor authentication when available</li>
        <li>Never share passwords via email or text</li>
      </ul>
    </div>
    `;
  }

  private getSecurityGuidanceText(): string {
    if (!this.config.includeSecurityTips) return '';
    
    return `
PASSWORD SECURITY TIPS:
- Use a unique password for every account
- Make passwords at least 12 characters long
- Include a mix of uppercase, lowercase, numbers, and symbols
- Consider using a reputable password manager
- Enable two-factor authentication when available
- Never share passwords via email or text
    `.trim();
  }

  private generateInAppMessage(notification: BreachNotification): string {
    return 'Security Alert: A password associated with your account was found in a data breach. Please change your password immediately.';
  }

  private generateSMSMessage(notification: BreachNotification): string {
    return 'Security Alert: Your password was found in a data breach. Change it immediately at [app]. Reply STOP to opt out.';
  }

  private generatePushMessage(notification: BreachNotification): string {
    return 'Security Alert: Password breach detected. Tap to secure your account.';
  }

  private getBatchNotificationTemplate(notifications: BreachNotification[]): NotificationTemplate {
    const count = notifications.length;
    
    return {
      subject: `🚨 Security Alert: ${count} password breaches detected`,
      htmlBody: this.generateBatchHTMLEmailBody(notifications),
      textBody: this.generateBatchTextEmailBody(notifications),
      inAppMessage: `Security Alert: ${count} passwords need immediate attention`,
      smsMessage: `Security Alert: ${count} password breaches detected. Check your account.`,
      pushMessage: `Security Alert: ${count} password breaches detected`
    };
  }

  private generateBatchHTMLEmailBody(notifications: BreachNotification[]): string {
    const breachList = notifications.map(n => 
      `<li>Password seen ${n.occurrenceCount.toLocaleString()} times in breach databases</li>`
    ).join('');

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
        <h1>Multiple Password Breaches Detected</h1>
      </div>
      
      <div style="padding: 20px;">
        <h2>What happened?</h2>
        <p>We've detected that <strong>${notifications.length}</strong> passwords associated with your account have been found in known data breaches:</p>
        
        <ul>${breachList}</ul>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #856404;">Immediate Action Required</h3>
          <ul>
            <li><strong>Change all affected passwords immediately</strong></li>
            <li>Use unique, strong passwords for each account</li>
            <li>Consider enabling two-factor authentication</li>
            <li>Review your other accounts for similar passwords</li>
          </ul>
        </div>
        
        ${this.getSecurityGuidanceHTML()}
      </div>
    </div>
    `;
  }

  private generateBatchTextEmailBody(notifications: BreachNotification[]): string {
    const breachList = notifications.map(n => 
      `- Password seen ${n.occurrenceCount.toLocaleString()} times in breach databases`
    ).join('\n');

    return `
SECURITY ALERT: Multiple Password Breaches Detected

We've detected that ${notifications.length} passwords associated with your account have been found in known data breaches:

${breachList}

IMMEDIATE ACTION REQUIRED:
- Change all affected passwords immediately
- Use unique, strong passwords for each account
- Consider enabling two-factor authentication
- Review your other accounts for similar passwords

${this.getSecurityGuidanceText()}
    `.trim();
  }

  /**
   * Send specific notification types
   */
  private async sendEmailNotification(
    notification: BreachNotification, 
    template: NotificationTemplate
  ): Promise<void> {
    // Implementation would use the EmailService
    logger.log(`Sending breach notification email to user ${notification.userId}`);
  }

  private async sendBatchEmailNotification(
    userId: string,
    notifications: BreachNotification[],
    template: NotificationTemplate
  ): Promise<void> {
    // Implementation would use the EmailService
    logger.log(`Sending batch breach notification email to user ${userId}`);
  }

  private async sendInAppNotification(
    notification: BreachNotification,
    template: NotificationTemplate
  ): Promise<void> {
    // Implementation would create in-app notification
    logger.log(`Creating in-app breach notification for user ${notification.userId}`);
  }

  /**
   * Public API methods
   */

  /**
   * Get notification statistics
   */
  public getNotificationStats(): {
    totalNotifications: number;
    pendingNotifications: number;
    sentNotifications: number;
    failedNotifications: number;
    } {
    const notifications = Array.from(this.notifications.values());
    
    return {
      totalNotifications: notifications.length,
      pendingNotifications: notifications.filter(n => n.status === 'PENDING').length,
      sentNotifications: notifications.filter(n => n.status === 'SENT').length,
      failedNotifications: notifications.filter(n => n.status === 'FAILED').length
    };
  }

  /**
   * Mark notification as acknowledged
   */
  public async acknowledgeNotification(notificationId: string, userId: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    
    if (!notification || notification.userId !== userId) {
      return false;
    }

    notification.acknowledged = true;
    notification.acknowledgedAt = new Date();

    await this.auditService.logEvent({
      eventType: 'BREACH_NOTIFICATION_ACKNOWLEDGED',
      userId,
      details: { notificationId },
      riskLevel: 'LOW',
      compliance: {
        frameworks: ['GDPR'],
        requirements: ['user_communication'],
        evidenceLevel: 'STANDARD'
      }
    });

    return true;
  }
}