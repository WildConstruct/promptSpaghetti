/**
 * Lockout Notification Service
 *
 * Comprehensive notification system for account lockout events with template
 * management, multi-channel delivery, and tracking capabilities.
 *
 * Features:
 * - Multi-channel notification delivery (email, SMS, push)
 * - Template-based message generation
 * - Delivery status tracking and retry logic
 * - User preference management
 * - Administrative notification routing
 * - Localization support
 */
import { EventEmitter } from 'events';
import crypto from 'crypto';
import { LockoutReason, NotificationType, AccountLockout, AdminRole } from './AccountLockoutService';
// Notification Channels
export var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["EMAIL"] = "email";
    NotificationChannel["SMS"] = "sms";
    NotificationChannel["PUSH"] = "push";
    NotificationChannel["ADMIN_CONSOLE"] = "admin_console";
    NotificationChannel["SLACK"] = "slack";
    NotificationChannel["TEAMS"] = "teams";
    // Notification Priority
    NotificationChannel[NotificationChannel["export"] = void 0] = "export";
    NotificationChannel[NotificationChannel["enum"] = void 0] = "enum";
    NotificationChannel[NotificationChannel["NotificationPriority"] = void 0] = "NotificationPriority";
})(NotificationChannel || (NotificationChannel = {}));
{
    LOW = 'low',
        MEDIUM = 'medium',
        HIGH = 'high',
        URGENT = 'urgent',
        CRITICAL = 'critical';
    // Notification Status
    export let NotificationStatus;
    (function (NotificationStatus) {
        NotificationStatus["PENDING"] = "pending";
        NotificationStatus["QUEUED"] = "queued";
        NotificationStatus["SENDING"] = "sending";
        NotificationStatus["SENT"] = "sent";
        NotificationStatus["DELIVERED"] = "delivered";
        NotificationStatus["READ"] = "read";
        NotificationStatus["FAILED"] = "failed";
        NotificationStatus["RETRYING"] = "retrying";
        NotificationStatus["EXPIRED"] = "expired";
        // Template Variables
        NotificationStatus[NotificationStatus["export"] = void 0] = "export";
        NotificationStatus[NotificationStatus["interface"] = void 0] = "interface";
        NotificationStatus[NotificationStatus["TemplateVariables"] = void 0] = "TemplateVariables";
    })(NotificationStatus || (NotificationStatus = {}));
    {
        userName: string;
        userEmail: string;
        lockoutReason: string;
        lockoutTime: string;
        unlockTime ?  : string;
        expiryTime ?  : string;
        supportEmail: string;
        supportPhone: string;
        lockoutId: string;
        adminName ?  : string;
        companyName: string;
        appName: string;
        securityTips: string;
        nextSteps: string;
        estimatedResolution ?  : string;
        // Notification Template
    }
}
;
language: string;
timezone: string;
quietHours: {
    enabled: boolean;
    start: string; // HH:MM format,
    end: string; // HH:MM format,
}
;
frequency: {
    immediate: boolean;
    digest: boolean;
    digestFrequency: 'daily' | 'weekly',
    ;
}
;
metadata: Record;
;
sentAt ?  : Date;
deliveredAt ?  : Date;
readAt ?  : Date;
failureReason ?  : string;
providerResponse ?  : any;
metadata: Record;
;
recipients: {
    roles: AdminRole;
    emails: string;
    slackChannels ?  : string;
}
;
template: string;
priority: NotificationPriority;
enabled: boolean;
export class LockoutNotificationService extends EventEmitter {
    templates = new Map();
    preferences = new Map();
    notifications = new Map();
    deliveries = new Map();
    adminRules = new Map();
    constructor() {
        super();
        this.initializeDefaultTemplates();
        this.initializeAdminRules();
        this.startDeliveryProcessor();
        /**
        * Send lockout notification to user
        */
    }
    /**
    * Send lockout notification to user
    */
    async sendLockoutNotification(lockout, channels) {
        const userPrefs = this.getUserPreferences(lockout.userId);
        const effectiveChannels = channels || this.getPreferredChannels(userPrefs);
        const variables = this.buildTemplateVariables(lockout);
        const templateId = this.selectTemplate(NotificationType.LOCKOUT_NOTIFICATION, userPrefs.language);
        const request = {
            id: crypto.randomUUID(),
            type: NotificationType.LOCKOUT_NOTIFICATION,
            recipient: lockout.userEmail,
            channels: effectiveChannels,
            priority: this.calculatePriority(lockout),
            templateId,
            variables,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours,
            metadata: {
                lockoutId: lockout.id,
                userId: lockout.userId,
                reason: lockout.reason,
            },
            return: await this.queueNotification(request),
            /**
             * Send unlock notification to user
             */
            async sendUnlockNotification(lockout, adminName) {
                const userPrefs = this.getUserPreferences(lockout.userId);
                const channels = this.getPreferredChannels(userPrefs);
                const variables = this.buildTemplateVariables(lockout, { adminName });
                const templateId = this.selectTemplate(NotificationType.UNLOCK_NOTIFICATION, userPrefs.language);
                const request = {
                    id: crypto.randomUUID(),
                    type: NotificationType.UNLOCK_NOTIFICATION,
                    recipient: lockout.userEmail,
                    channels,
                    priority: NotificationPriority.HIGH,
                    templateId,
                    variables,
                    metadata: {
                        lockoutId: lockout.id,
                        userId: lockout.userId,
                        adminName
                    },
                    return: await this.queueNotification(request),
                    /**
                     * Send security alert notification
                     */
                    async sendSecurityAlert(lockout, alertDetails) {
                        const userPrefs = this.getUserPreferences(lockout.userId);
                        const channels = [NotificationChannel.EMAIL, NotificationChannel.PUSH]; // Security alerts always use multiple channels;
                        const variables = this.buildTemplateVariables(lockout, alertDetails);
                        const templateId = this.selectTemplate(NotificationType.SECURITY_ALERT, userPrefs.language);
                        const request = {
                            id: crypto.randomUUID(),
                            type: NotificationType.SECURITY_ALERT,
                            recipient: lockout.userEmail,
                            channels,
                            priority: NotificationPriority.URGENT,
                            templateId,
                            variables,
                            metadata: {
                                lockoutId: lockout.id,
                                userId: lockout.userId,
                                alertDetails
                            },
                            return: await this.queueNotification(request),
                            /**
                             * Send admin notification for approval required
                             */
                            async sendAdminNotification(type, lockout, adminRoles, details) {
                                const notifications = [];
                                for (const role of adminRoles) {
                                    const recipients = this.getAdminRecipients(role);
                                    for (const recipient of recipients) {
                                        const variables = this.buildAdminTemplateVariables(lockout, details);
                                        const templateId = this.selectTemplate(type, 'en'); // Admin notifications in English by default;
                                        const request = {
                                            id: crypto.randomUUID(),
                                            type,
                                            recipient,
                                            channels: [NotificationChannel.EMAIL, NotificationChannel.ADMIN_CONSOLE],
                                            priority: NotificationPriority.HIGH,
                                            templateId,
                                            variables,
                                            metadata: {
                                                lockoutId: lockout.id,
                                                adminRole: role,
                                                details
                                            },
                                            const: notificationId = await this.queueNotification(request),
                                            notifications, : .push(notificationId),
                                            return: notifications }((userId, preferences) => {
                                            const current = this.getUserPreferences(userId);
                                            const updated = { ...current, ...preferences, userId };
                                            this.preferences.set(userId, updated);
                                            this.emit('preferencesUpdated', { userId, preferences: updated });
                                            /**
                                             * Get notification delivery status
                                             */
                                        }
                                        /**
                                         * Get notification delivery status
                                         */
                                        , 
                                        /**
                                         * Get notification delivery status
                                         */
                                        public, getNotificationStatus(notificationId, string), {
                                            request: NotificationRequest | null,
                                            deliveries: NotificationDelivery,
                                            summary: {
                                                totalDeliveries: number,
                                                successful: number,
                                                failed: number,
                                                pending: number
                                            },
                                            const: request = this.notifications.get(notificationId) || null,
                                            const: deliveries = Array.from(this.deliveries.values()),
                                            : 
                                                .filter(d => d.requestId === notificationId),
                                            const: summary = {
                                                totalDeliveries: deliveries.length,
                                                successful: deliveries.filter(d => d.status === NotificationStatus.DELIVERED).length,
                                                failed: deliveries.filter(d => d.status === NotificationStatus.FAILED).length,
                                                pending: deliveries.filter(d => []),
                                                NotificationStatus, : .PENDING,
                                                NotificationStatus, : .QUEUED,
                                                NotificationStatus, : .SENDING
                                            } });
                                    }
                                }
                            } };
                    } };
            } };
        includes(d.status);
        length;
    }
    ;
}
return { request, deliveries, summary };
getUserNotificationHistory(((userId, limit = 50) => {
    return Array.from(this.notifications.values())
        .filter(n => n.metadata.userId === userId)
        .sort((a, b) => b.metadata.createdAt - a.metadata.createdAt)
        .slice(0, limit);
    /**
    * Create custom notification template
    */
}
/**
* Create custom notification template
*/
)
/**
* Create custom notification template
*/
, 
/**
* Create custom notification template
*/
public, createTemplate(template, (Omit)), string, {
    const: id = crypto.randomUUID(),
    const: fullTemplate, NotificationTemplate = {
        id,
        ...template
    },
    this: .templates.set(id, fullTemplate),
    this: .emit('templateCreated', fullTemplate),
    return: id,
    /**
     * Test notification delivery
     */
    async testNotification(recipient, channel, templateId, variables) {
        const request = {
            id: crypto.randomUUID(),
            type: NotificationType.LOCKOUT_NOTIFICATION,
            recipient,
            channels: [channel],
            priority: NotificationPriority.LOW,
            templateId,
            variables,
            metadata: {
                test: true,
                testTimestamp: Date.now(),
            },
            return: await this.queueNotification(request),
            let, notifications = Array.from(this.notifications.values()),
            let, deliveries = Array.from(this.deliveries.values()),
            if(dateRange) {
                notifications = notifications.filter(n => { });
                const createdAt = new Date(n.metadata.createdAt);
                return createdAt >= dateRange.start && createdAt <= dateRange.end;
            } };
    } });
const notificationIds = new Set(notifications.map(n => n.id));
deliveries = deliveries.filter(d => notificationIds.has(d.requestId));
const byType = {};
const byChannel = {};
const byStatus = {};
const failureReasons = {};
notifications.forEach(n => { });
byType[n.type] = (byType[n.type] || 0) + 1;
;
deliveries.forEach(d => { });
byChannel[d.channel] = (byChannel[d.channel] || 0) + 1;
byStatus[d.status] = (byStatus[d.status] || 0) + 1;
if (d.status === NotificationStatus.FAILED && d.failureReason) {
    failureReasons[d.failureReason] = (failureReasons[d.failureReason] || 0) + 1;
}
;
const successfulDeliveries = deliveries.filter(d => d.status === NotificationStatus.DELIVERED);
const deliveryRate = deliveries.length > 0 ? (successfulDeliveries.length / deliveries.length) * 100 : 0;
const totalDeliveryTime = successfulDeliveries.reduce((sum, d) => {
    if (d.sentAt && d.deliveredAt) {
        return sum + (d.deliveredAt.getTime() - d.sentAt.getTime());
        return sum;
    }
    0;
});
const averageDeliveryTime = successfulDeliveries.length > 0;
totalDeliveryTime / successfulDeliveries.length;
0;
return {
    totalNotifications: notifications.length,
    byType,
    byChannel,
    byStatus,
    deliveryRate,
    averageDeliveryTime,
    failureReasons: Object.entries(failureReasons),
    : 
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count)
};
async;
queueNotification(request, NotificationRequest);
Promise < string > {
    request, : .metadata.createdAt = Date.now(),
    request, : .metadata.queuedAt = Date.now(),
    this: .notifications.set(request.id, request),
    // Create delivery records for each channel
    for(, channel, of, request) { }, : .channels
};
{
    const delivery = {
        id: crypto.randomUUID(),
        requestId: request.id,
        channel,
        recipient: request.recipient,
        status: NotificationStatus.QUEUED,
        attempts: 0,
        content: await this.renderTemplate(request.templateId, request.variables, channel),
        metadata: {
            priority: request.priority,
            type: request.type,
        },
        this: .deliveries.set(delivery.id, delivery),
        this: .emit('notificationQueued', request),
        // Process immediately for high priority
        if(request) { }, : .priority === NotificationPriority.URGENT || request.priority === NotificationPriority.CRITICAL }, { setImmediate };
    (() => this.processNotification(request.id));
    return request.id;
    async;
    processNotification(requestId, string);
    Promise < void  > {
        const: request = this.notifications.get(requestId),
        if(, request) { }, return: ,
        const: deliveries = Array.from(this.deliveries.values()),
        : 
            .filter(d => d.requestId === requestId && d.status === NotificationStatus.QUEUED),
        for(, delivery, of, deliveries) {
            await this.attemptDelivery(delivery);
        },
        async attemptDelivery(delivery) {
            delivery.status = NotificationStatus.SENDING;
            delivery.attempts++;
            try {
                // Simulate delivery based on channel
                const success = await this.simulateDelivery(delivery);
                if (success) {
                    delivery.status = NotificationStatus.SENT;
                    delivery.sentAt = new Date();
                    // Simulate delivery confirmation after a delay
                    setTimeout(() => {
                        delivery.status = NotificationStatus.DELIVERED;
                        delivery.deliveredAt = new Date();
                        this.emit('notificationDelivered', delivery);
                    }, 1000 + Math.random() * 2000);
                }
                else {
                    delivery.status = NotificationStatus.FAILED;
                    delivery.failureReason = 'Simulated delivery failure';
                    this.emit('notificationFailed', delivery);
                    // Schedule retry if applicable
                    await this.scheduleRetry(delivery);
                }
                try { }
                catch (error) {
                    delivery.status = NotificationStatus.FAILED;
                    delivery.failureReason = error instanceof Error ? error.message : 'Unknown error';
                    this.emit('notificationFailed', delivery);
                    await this.scheduleRetry(delivery);
                }
            }
            finally {
            }
        },
        async simulateDelivery(delivery) {
            // Simulate different success rates based on channel
            const successRates = {
                [NotificationChannel.EMAIL]: 0.95,
                [NotificationChannel.SMS]: 0.98,
                [NotificationChannel.PUSH]: 0.90,
                [NotificationChannel.ADMIN_CONSOLE]: 0.99,
                [NotificationChannel.SLACK]: 0.97,
                [NotificationChannel.TEAMS]: 0.96,
            };
            const successRate = successRates[delivery.channel] || 0.95;
            const random = Math.random();
            // Add small delay to simulate network latency
            await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
            return random < successRate;
        },
        async scheduleRetry(delivery) {
            const template = this.templates.get(this.notifications.get(delivery.requestId)?.templateId || '');
            if (!template || delivery.attempts >= template.retryPolicy.maxAttempts) {
                return;
                const delay = Math.min();
                ;
                template.retryPolicy.baseDelaySeconds * Math.pow(template.retryPolicy.backoffMultiplier, delivery.attempts - 1),
                    template.retryPolicy.maxDelaySeconds;
                 * 1000;
                delivery.status = NotificationStatus.RETRYING;
                setTimeout(() => {
                    this.attemptDelivery(delivery);
                }, delay);
            }
        },
        variables: TemplateVariables,
        channel: NotificationChannel, Promise() { subject ?  : string; body: string; html ?  : string; } } > {
        const: template = this.templates.get(templateId),
        if(, template) {
            throw new Error(`Template not found: ${templateId}`);
        },
        let, subject = template.subject,
        let, body = template.bodyText,
        let, html = template.bodyHtml,
        // Replace variables in all fields
        const: variableMap = variables,
        for(, [key, value], of, Object) { }, : .entries(variableMap)
    };
    {
        const placeholder = `{{${key}}}`;
    }
    const stringValue = String(value);
    if (subject)
        subject = subject.replace(new RegExp(placeholder, 'g'), stringValue);
    body = body.replace(new RegExp(placeholder, 'g'), stringValue);
    if (html)
        html = html.replace(new RegExp(placeholder, 'g'), stringValue);
    return { subject, body, html };
    buildTemplateVariables(lockout, AccountLockout),
        additional;
    (Record) = {};
    TemplateVariables;
    {
        return {
            userName: lockout.userEmail.split('@')[0], // Simple name extraction,
            userEmail: lockout.userEmail,
            lockoutReason: this.getLockoutReasonText(lockout.reason),
            lockoutTime: lockout.lockoutTime.toLocaleString(),
            unlockTime: lockout.unlockTime?.toLocaleString(),
            expiryTime: lockout.expiryTime?.toLocaleString(),
            supportEmail: 'support@company.com',
            supportPhone: '+1-800-SUPPORT',
            lockoutId: lockout.id,
            companyName: 'SecureAuth Corp',
            appName: 'SecureAuth Platform',
            securityTips: [
                'Use a strong, unique password',
                'Enable two-factor authentication',
                'Keep your software updated',
                'Be cautious of phishing emails'
            ],
            nextSteps: this.getNextSteps(lockout.reason),
            estimatedResolution: this.getEstimatedResolution(lockout.reason),
            ...additional
        };
        buildAdminTemplateVariables(lockout, AccountLockout),
            details;
        Record;
        TemplateVariables;
        {
            const base = this.buildTemplateVariables(lockout, details);
            return {
                ...base,
                nextSteps: [
                    'Review lockout details',
                    'Verify user identity if needed',
                    'Make unlock decision',
                    'Document resolution'
                ]
            };
            getLockoutReasonText(reason, LockoutReason);
            string;
            {
                const reasonMap = {
                    [LockoutReason.EXCESSIVE_FAILED_ATTEMPTS]: 'multiple failed login attempts',
                    [LockoutReason.SUSPICIOUS_ACTIVITY]: 'suspicious account activity',
                    [LockoutReason.SECURITY_POLICY_VIOLATION]: 'security policy violation',
                    [LockoutReason.ADMIN_MANUAL_LOCK]: 'administrative action',
                    [LockoutReason.SYSTEM_SECURITY_ALERT]: 'system security alert',
                    [LockoutReason.COMPLIANCE_REQUIREMENT]: 'compliance requirement',
                };
                return reasonMap[reason] || 'security concerns';
                getNextSteps(reason, LockoutReason);
                string;
                {
                    const stepMap = {
                        [LockoutReason.EXCESSIVE_FAILED_ATTEMPTS]: [
                            'Wait for automatic unlock in 30 minutes',
                            'Reset your password if you\'ve forgotten it',
                            'Contact support if you need immediate access'
                        ],
                        [LockoutReason.SUSPICIOUS_ACTIVITY]: [
                            'Review recent account activity',
                            'Change your password immediately',
                            'Contact support to verify the activity',
                            'Enable additional security measures'
                        ],
                        [LockoutReason.SECURITY_POLICY_VIOLATION]: [
                            'Contact your administrator',
                            'Review company security policies',
                            'Provide necessary documentation'
                        ],
                        [LockoutReason.ADMIN_MANUAL_LOCK]: [
                            'Contact your administrator',
                            'Provide identification if requested'
                        ],
                        [LockoutReason.SYSTEM_SECURITY_ALERT]: [
                            'Wait for automatic unlock in 1 hour',
                            'Monitor your email for updates',
                            'Contact support if the issue persists'
                        ],
                        [LockoutReason.COMPLIANCE_REQUIREMENT]: [
                            'Contact your compliance officer',
                            'Provide required documentation',
                            'Complete any pending verification steps'
                        ]
                    };
                    return stepMap[reason] || ['Contact support for assistance'];
                    getEstimatedResolution(reason, LockoutReason);
                    string;
                    {
                        const resolutionMap = {
                            [LockoutReason.EXCESSIVE_FAILED_ATTEMPTS]: '30 minutes (automatic)',
                            [LockoutReason.SUSPICIOUS_ACTIVITY]: '24 hours (review required)',
                            [LockoutReason.SECURITY_POLICY_VIOLATION]: '1-3 business days',
                            [LockoutReason.ADMIN_MANUAL_LOCK]: '1-2 business days',
                            [LockoutReason.SYSTEM_SECURITY_ALERT]: '1 hour (automatic)',
                            [LockoutReason.COMPLIANCE_REQUIREMENT]: '3-5 business days',
                        };
                        return resolutionMap[reason] || 'Unknown - contact support';
                        calculatePriority(lockout, AccountLockout);
                        NotificationPriority;
                        {
                            const priorityMap = {
                                [LockoutReason.EXCESSIVE_FAILED_ATTEMPTS]: NotificationPriority.MEDIUM,
                                [LockoutReason.SUSPICIOUS_ACTIVITY]: NotificationPriority.HIGH,
                                [LockoutReason.SECURITY_POLICY_VIOLATION]: NotificationPriority.HIGH,
                                [LockoutReason.ADMIN_MANUAL_LOCK]: NotificationPriority.MEDIUM,
                                [LockoutReason.SYSTEM_SECURITY_ALERT]: NotificationPriority.URGENT,
                                [LockoutReason.COMPLIANCE_REQUIREMENT]: NotificationPriority.HIGH,
                            };
                            return priorityMap[lockout.reason] || NotificationPriority.MEDIUM;
                            getUserPreferences(userId, string);
                            UserNotificationPreferences;
                            {
                                return this.preferences.get(userId) || {
                                    userId,
                                    channels: {
                                        email: true,
                                        sms: false,
                                        push: true,
                                    },
                                    language: 'en',
                                    timezone: 'UTC',
                                    quietHours: {
                                        enabled: false,
                                        start: '22:00',
                                        end: '08:00',
                                    },
                                    frequency: {
                                        immediate: true,
                                        digest: false,
                                        digestFrequency: 'daily',
                                    },
                                    metadata: {}
                                };
                                getPreferredChannels(preferences, UserNotificationPreferences);
                                NotificationChannel;
                                {
                                    const channels = [];
                                    if (preferences.channels.email)
                                        channels.push(NotificationChannel.EMAIL);
                                    if (preferences.channels.sms)
                                        channels.push(NotificationChannel.SMS);
                                    if (preferences.channels.push)
                                        channels.push(NotificationChannel.PUSH);
                                    return channels.length > 0 ? channels : [NotificationChannel.EMAIL];
                                    selectTemplate(type, NotificationType, language, string);
                                    string;
                                    {
                                        const templateKey = `${type}_${language}`;
                                    }
                                    const fallbackKey = `${type}_en`;
                                }
                                for (const [id, template] of this.templates) {
                                    if (template.type === type && template.language === language) {
                                        return id;
                                        // Fallback to English
                                        for (const [id, template] of this.templates) {
                                            if (template.type === type && template.language === 'en') {
                                                return id;
                                                throw new Error(`No template found for type ${type} and language ${language}`);
                                            }
                                            getAdminRecipients(role, AdminRole);
                                            string;
                                            {
                                                // In production, this would query an admin directory service
                                                const adminMap = {
                                                    [AdminRole.SUPER_ADMIN]: ['super-admin@company.com'],
                                                    [AdminRole.SECURITY_ADMIN]: ['security-team@company.com'],
                                                    [AdminRole.SYSTEM_ADMIN]: ['sysadmin@company.com'],
                                                    [AdminRole.HELP_DESK]: ['helpdesk@company.com'],
                                                    [AdminRole.COMPLIANCE_OFFICER]: ['compliance@company.com'],
                                                };
                                                return adminMap[role] || [];
                                                initializeDefaultTemplates();
                                                void {
                                                    // Lockout notification template
                                                    this: .templates.set('lockout_en', {}),
                                                    id: 'lockout_en',
                                                    type: NotificationType.LOCKOUT_NOTIFICATION,
                                                    channel: NotificationChannel.EMAIL,
                                                    language: 'en',
                                                    subject: 'Account Temporarily Locked - {{appName}}',
                                                    bodyText: `Dear {{userName}},
Your account has been temporarily locked due to {{lockoutReason}}.
Details:
- Account: {{userEmail}}
- Locked at: {{lockoutTime}}
- Reference ID: {{lockoutId}}
{{#expiryTime}}
- Automatic unlock: {{expiryTime}}
{{/expiryTime}}
Next steps:
{{#nextSteps}}
- {{.}}
{{/nextSteps}}
Estimated resolution: {{estimatedResolution}}
If you believe this is an error or need immediate assistance, please contact our support team:
- Email: {{supportEmail}}
- Phone: {{supportPhone}}
Security tips:
{{#securityTips}}
- {{.}}
{{/securityTips}}
Best regards,
{{companyName}} Security Team`,
                                                    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #d32f2f;">Account Temporarily Locked</h2>
  <p>Dear <strong>{{userName}}</strong>,</p>
  <p>Your account has been temporarily locked due to <strong>{{lockoutReason}}</strong>.</p>
  <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h3>Details:</h3>
    <ul>
      <li><strong>Account:</strong> {{userEmail}}</li>
      <li><strong>Locked at:</strong> {{lockoutTime}}</li>
      <li><strong>Reference ID:</strong> {{lockoutId}}</li>
      {{#expiryTime}}<li><strong>Automatic unlock:</strong> {{expiryTime}}</li>{{/expiryTime}}
    </ul>
  </div>
  <h3>Next steps:</h3>
  <ul>
    {{#nextSteps}}<li>{{.}}</li>{{/nextSteps}}
  </ul>
  <p><strong>Estimated resolution:</strong> {{estimatedResolution}}</p>
  <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h4>Need help?</h4>
    <p>Contact our support team:</p>
    <ul>
      <li>Email: <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></li>
      <li>Phone: {{supportPhone}}</li>
    </ul>
  </div>
  <p>Best regards,<br>{{companyName}} Security Team</p>
</div>`,
                                                    variables: ['userName', 'userEmail', 'lockoutReason', 'lockoutTime', 'lockoutId', 'expiryTime', 'nextSteps', 'estimatedResolution', 'supportEmail', 'supportPhone', 'securityTips', 'companyName', 'appName'],
                                                    priority: NotificationPriority.HIGH,
                                                    retryPolicy: {
                                                        maxAttempts: 3,
                                                        backoffMultiplier: 2,
                                                        baseDelaySeconds: 30,
                                                        maxDelaySeconds: 300,
                                                        retryOn: ['timeout', 'network_error', 'service_unavailable'],
                                                    },
                                                    expiryMinutes: 60,
                                                    metadata: {}
                                                };
                                                ;
                                                // Unlock notification template
                                                this.templates.set('unlock_en', {});
                                                id: 'unlock_en',
                                                    type;
                                                NotificationType.UNLOCK_NOTIFICATION,
                                                    channel;
                                                NotificationChannel.EMAIL,
                                                    language;
                                                'en',
                                                    subject;
                                                'Account Unlocked - {{appName}}',
                                                    bodyText;
                                                `Dear {{userName}},
Good news! Your account has been unlocked and you can now access {{appName}} normally.
Details:
- Account: {{userEmail}}
- Unlocked at: {{unlockTime}}
{{#adminName}}
- Unlocked by: {{adminName}}
{{/adminName}}
- Reference ID: {{lockoutId}}
You can now log in at your convenience. We recommend taking the following security steps:
{{#securityTips}}
- {{.}}
{{/securityTips}}
If you have any questions or concerns, please contact our support team:
- Email: {{supportEmail}}
- Phone: {{supportPhone}}
Thank you for your patience.
Best regards,
{{companyName}} Security Team`,
                                                    variables;
                                                ['userName', 'userEmail', 'unlockTime', 'adminName', 'lockoutId', 'securityTips', 'supportEmail', 'supportPhone', 'companyName', 'appName'],
                                                    priority;
                                                NotificationPriority.HIGH,
                                                    retryPolicy;
                                                {
                                                    maxAttempts: 3,
                                                        backoffMultiplier;
                                                    2,
                                                        baseDelaySeconds;
                                                    30,
                                                        maxDelaySeconds;
                                                    300,
                                                        retryOn;
                                                    ['timeout', 'network_error', 'service_unavailable'],
                                                    ;
                                                }
                                                expiryMinutes: 60,
                                                    metadata;
                                                { }
                                            }
                                            ;
                                            // Security alert template
                                            this.templates.set('security_alert_en', {});
                                            id: 'security_alert_en',
                                                type;
                                            NotificationType.SECURITY_ALERT,
                                                channel;
                                            NotificationChannel.EMAIL,
                                                language;
                                            'en',
                                                subject;
                                            'URGENT: Security Alert - {{appName}}',
                                                bodyText;
                                            `SECURITY ALERT,
Dear {{userName}},
We have detected suspicious activity on your account and have temporarily locked it for your protection.
IMMEDIATE ACTIONS REQUIRED:
{{#nextSteps}}
- {{.}}
{{/nextSteps}}
Account details:
- Email: {{userEmail}}
- Alert time: {{lockoutTime}}
- Reference ID: {{lockoutId}}
This is a security-critical notification. Please take immediate action to secure your account.
Contact our security team immediately:
- Email: {{supportEmail}}
- Phone: {{supportPhone}} (24/7 security hotline)
DO NOT IGNORE THIS MESSAGE.
{{companyName}} Security Team`,
                                                variables;
                                            ['userName', 'userEmail', 'lockoutTime', 'lockoutId', 'nextSteps', 'supportEmail', 'supportPhone', 'companyName', 'appName'],
                                                priority;
                                            NotificationPriority.URGENT,
                                                retryPolicy;
                                            {
                                                maxAttempts: 5,
                                                    backoffMultiplier;
                                                1.5,
                                                    baseDelaySeconds;
                                                10,
                                                    maxDelaySeconds;
                                                120,
                                                    retryOn;
                                                ['timeout', 'network_error', 'service_unavailable'],
                                                ;
                                            }
                                            expiryMinutes: 30,
                                                metadata;
                                            { }
                                        }
                                        ;
                                        initializeAdminRules();
                                        void {
                                            // High-priority lockouts require immediate admin notification
                                            this: .adminRules.set('urgent_lockout_alert', {}),
                                            id: 'urgent_lockout_alert',
                                            trigger: {
                                                event: 'account_locked',
                                                conditions: {
                                                    reason: [LockoutReason.SUSPICIOUS_ACTIVITY, LockoutReason.SYSTEM_SECURITY_ALERT],
                                                    threatLevel: 'high',
                                                },
                                                recipients: {
                                                    roles: [AdminRole.SECURITY_ADMIN, AdminRole.SUPER_ADMIN],
                                                    emails: ['security-alerts@company.com'],
                                                },
                                                template: 'admin_urgent_alert_en',
                                                priority: NotificationPriority.URGENT,
                                                enabled: true
                                            },
                                            startDeliveryProcessor() {
                                                // Process queued notifications every 30 seconds
                                                setInterval(() => {
                                                    const queuedDeliveries = Array.from(this.deliveries.values());
                                                })
                                                    .filter(d => d.status === NotificationStatus.QUEUED);
                                                for (const delivery of queuedDeliveries) {
                                                    this.attemptDelivery(delivery);
                                                }
                                                30000;
                                                ;
                                                // Export default instance
                                                export const lockoutNotificationService = new LockoutNotificationService();
                                                export default LockoutNotificationService;
                                            }
                                        };
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
