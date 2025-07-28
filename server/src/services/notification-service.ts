// Epic 17.1.5 - Notification Service for Scheduling System

import { EventEmitter } from 'events';
import {
  ScheduleNotification,
  FeatureToggleSchedule,
  ScheduleExecution,
  ScheduleConflict
} from '../database/scheduling-models';

}
export interface NotificationChannel {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'in_app';
  config: Record<string, any>;
  enabled: boolean;
}
}

}
export interface NotificationTemplate {
  id: string;
  type: string;
  subject: string;
  body: string;
  variables: string[];
}
}

}
export interface NotificationEvent {
  type: 'execution_success' | 'execution_failure' | 'conflict_detected' | 'schedule_expired';
  scheduleId: string;
  schedule: FeatureToggleSchedule;
  execution?: ScheduleExecution;
  conflict?: ScheduleConflict;
  metadata: Record<string, any>;
  timestamp: Date;
}
}

export class NotificationService extends EventEmitter {
  private channels: Map<string, NotificationChannel> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private notifications: Map<string, ScheduleNotification> = new Map();

  constructor() {
    super();
    this.initializeDefaultTemplates();
    this.initializeDefaultChannels();
  }

  private initializeDefaultTemplates() {
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: 'execution_success',
        type: 'execution_success',
        subject: '✅ Schedule Executed Successfully: {{scheduleName}}',
        body: `
Schedule "{{scheduleName}}" has been executed successfully.

📋 **Details:**
- Feature Toggle: {{toggleName}}
- Action: {{action}}
- Execution Time: {{executionTime}}
- Duration: {{duration}}ms
- Users Affected: {{affectedUsers}}

📊 **Results:**
- Status: {{status}}
- Before Value: {{beforeValue}}
- After Value: {{afterValue}}

🔗 **Links:**
- View Schedule: {{scheduleUrl}}
- View Execution History: {{historyUrl}}

---
This is an automated notification from the Feature Toggle Scheduling System.
        `.trim(),
        variables: ['scheduleName', 'toggleName', 'action', 'executionTime', 'duration', 'affectedUsers', 'status', 'beforeValue', 'afterValue', 'scheduleUrl', 'historyUrl']
  }
      {
        id: 'execution_failure',
        type: 'execution_failure',
        subject: '❌ Schedule Execution Failed: {{scheduleName}}',
        body: `
Schedule "{{scheduleName}}" execution has failed.

📋 **Details:**
- Feature Toggle: {{toggleName}}
- Action: {{action}}
- Execution Time: {{executionTime}}
- Duration: {{duration}}ms

❌ **Error Information:**
- Error Code: {{errorCode}}
- Error Message: {{errorMessage}}
- Retryable: {{retryable}}
- Retry Attempt: {{retryAttempt}}

🔧 **Next Steps:**
{{#if retryable}}
- The system will automatically retry this execution
- Next retry scheduled for: {{nextRetry}}
{{else}}
- Manual intervention required
- Please check the schedule configuration and feature toggle status
{{/if}}

🔗 **Links:**
- View Schedule: {{scheduleUrl}}
- View Execution History: {{historyUrl}}
- Troubleshooting Guide: {{troubleshootingUrl}}

---
This is an automated notification from the Feature Toggle Scheduling System.
        `.trim(),
        variables: ['scheduleName', 'toggleName', 'action', 'executionTime', 'duration', 'errorCode', 'errorMessage', 'retryable', 'retryAttempt', 'nextRetry', 'scheduleUrl', 'historyUrl', 'troubleshootingUrl']
  }
      {
        id: 'conflict_detected',
        type: 'conflict_detected',
        subject: '⚠️ Schedule Conflict Detected: {{scheduleName}}',
        body: `
A scheduling conflict has been detected for "{{scheduleName}}".

📋 **Schedule Details:**
- Feature Toggle: {{toggleName}}
- Action: {{action}}
- Start Time: {{startTime}}
- Conflict Resolution: {{conflictResolution}}

⚠️ **Conflict Information:**
- Conflict Type: {{conflictType}}
- Severity: {{severity}}
- Description: {{conflictDescription}}
- Conflicting Schedules: {{conflictingScheduleNames}}

🔧 **Recommended Actions:**
{{#if autoResolvable}}
- This conflict can be automatically resolved
- Resolution strategy: {{suggestedResolution}}
{{else}}
- Manual intervention required
- Consider rescheduling or adjusting priority
- Review conflicting schedules and modify as needed
{{/if}}

🔗 **Links:**
- View Schedule: {{scheduleUrl}}
- View Conflicts: {{conflictsUrl}}
- Schedule Management: {{managementUrl}}

---
This is an automated notification from the Feature Toggle Scheduling System.
        `.trim(),
        variables: ['scheduleName', 'toggleName', 'action', 'startTime', 'conflictResolution', 'conflictType', 'severity', 'conflictDescription', 'conflictingScheduleNames', 'autoResolvable', 'suggestedResolution', 'scheduleUrl', 'conflictsUrl', 'managementUrl']
  }
      {
        id: 'schedule_expired',
        type: 'schedule_expired',
        subject: '⏰ Schedule Expired: {{scheduleName}}',
        body: `
Schedule "{{scheduleName}}" has expired and will no longer execute.

📋 **Schedule Details:**
- Feature Toggle: {{toggleName}}
- Schedule Type: {{scheduleType}}
- Start Time: {{startTime}}
- End Time: {{endTime}}
- Total Executions: {{executionCount}}

📊 **Execution Summary:**
- Successful Executions: {{successfulExecutions}}
- Failed Executions: {{failedExecutions}}
- Success Rate: {{successRate}}%
- Average Duration: {{averageDuration}}ms

🔧 **Next Steps:**
- Review execution history for insights
- Consider creating a new schedule if needed
- Archive or delete this schedule to keep the system clean

🔗 **Links:**
- View Schedule: {{scheduleUrl}}
- View Execution History: {{historyUrl}}
- Create New Schedule: {{createScheduleUrl}}

---
This is an automated notification from the Feature Toggle Scheduling System.
        `.trim(),
        variables: ['scheduleName', 'toggleName', 'scheduleType', 'startTime', 'endTime', 'executionCount', 'successfulExecutions', 'failedExecutions', 'successRate', 'averageDuration', 'scheduleUrl', 'historyUrl', 'createScheduleUrl']
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private initializeDefaultChannels() {
    // This would typically load from configuration
    const defaultChannels: NotificationChannel[] = [
      {
        id: 'email_default',
        type: 'email',
        config: {
          smtp: {
            host: process.env.SMTP_HOST || 'localhost',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            }
  }
          from: process.env.NOTIFICATION_FROM_EMAIL || 'noreply@example.com'
  }
        enabled: true
  }
      {
        id: 'slack_default',
        type: 'slack',
        config: {
          webhookUrl: process.env.SLACK_WEBHOOK_URL,
          channel: process.env.SLACK_CHANNEL || '#feature-toggles',
          username: 'Feature Toggle Bot',
          iconEmoji: ':robot_face:'
  }
        enabled: !!process.env.SLACK_WEBHOOK_URL
  }
      {
        id: 'webhook_default',
        type: 'webhook',
        config: {
          url: process.env.NOTIFICATION_WEBHOOK_URL,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.NOTIFICATION_WEBHOOK_TOKEN ? `Bearer ${process.env.NOTIFICATION_WEBHOOK_TOKEN}` : undefined
          }
  }
        enabled: !!process.env.NOTIFICATION_WEBHOOK_URL
      }
    ];

    defaultChannels.forEach(channel => {
      this.channels.set(channel.id, channel);
    });
  }

  // Register notification configuration
  async registerNotification(notification: Omit<ScheduleNotification, 'id'>): Promise<ScheduleNotification> {

    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullNotification: ScheduleNotification = {
      id,
      ...notification,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.notifications.set(id, fullNotification);
    return fullNotification;
  }

  // Send notification for a specific event
  async sendNotification(event: NotificationEvent): Promise<void> {

    // Find all notifications that should be triggered for this event
    const relevantNotifications = Array.from(this.notifications.values())
      .filter(notification => 
        notification.scheduleId === event.scheduleId &&
        notification.type === event.type &&
        notification.enabled &&
        this.shouldTriggerNotification(notification, event)
      );

    // Send notifications through all configured channels
    for (const notification of relevantNotifications) {
      try {
        await this.sendNotificationThroughChannels(notification, event);
      } catch (error) {
        console.error(`Failed to send notification ${notification.id}:`, error);
        this.emit('notification_error', { notification, event, error });
      }
    }
  }

  private shouldTriggerNotification(notification: ScheduleNotification, event: NotificationEvent): boolean {
    const { conditions } = notification;

    switch (event.type) {
    case 'execution_success':
      return conditions.onSuccess === true;
      
    case 'execution_failure':
      if (conditions.onFailure === false) return false;
      if (conditions.afterFailureCount && event.execution) {
        // Check if failure count threshold is reached
        const schedule = event.schedule;
        return schedule.failureCount >= conditions.afterFailureCount;
      }
      return conditions.onFailure === true;
      
    case 'conflict_detected':
      return true; // Always notify about conflicts
      
    case 'schedule_expired':
      return true; // Always notify about expiration
      
    default:
      return false;
    }
  }

  private async sendNotificationThroughChannels(
    notification: ScheduleNotification, 
    event: NotificationEvent
  ): Promise<void> {

    const template = this.templates.get(notification.type);
    if (!template) {
      throw new Error(`Template not found for notification type: ${notification.type}`);
    }

    // Prepare notification variables
    const variables = this.prepareNotificationVariables(notification, event, template);
    
    // Render template
    const renderedNotification = this.renderTemplate(template, variables);

    // Send through each configured channel
    for (const channelType of notification.channels) {
      const channel = Array.from(this.channels.values())
        .find(c => c.type === channelType && c.enabled);
      
      if (!channel) {
        console.warn(`No enabled channel found for type: ${channelType}`);
        continue;
      }

      try {
        await this.sendThroughChannel(channel, renderedNotification, notification.recipients);
      } catch (error) {
        console.error(`Failed to send through ${channelType} channel:`, error);
      }
    }
  }

  private prepareNotificationVariables(
    notification: ScheduleNotification,
    event: NotificationEvent,
    _____template: NotificationTemplate
  ): Record<string, any> {
    const { schedule, execution, conflict, metadata } = event;
    
    const baseVariables = {
      scheduleName: schedule.name,
      toggleName: metadata.toggleName || 'Unknown',
      action: schedule.action,
      scheduleType: schedule.type,
      startTime: schedule.startTime.toLocaleString(),
      endTime: schedule.endTime?.toLocaleString() || 'No end time',
      executionCount: schedule.executionCount,
      scheduleUrl: `${process.env.BASE_URL}/admin/schedules/${schedule.id}`,
      historyUrl: `${process.env.BASE_URL}/admin/schedules/${schedule.id}/history`,
      managementUrl: `${process.env.BASE_URL}/admin/schedules`,
      createScheduleUrl: `${process.env.BASE_URL}/admin/schedules/create`,
      troubleshootingUrl: `${process.env.BASE_URL}/docs/troubleshooting`
    };

    let eventSpecificVariables = {};

    switch (event.type) {
    case 'execution_success':
    case 'execution_failure':
      if (execution) {
        eventSpecificVariables = {
          executionTime: execution.executionTime.toLocaleString(),
          duration: execution.duration,
          affectedUsers: execution.affectedUsers || 0,
          status: execution.status,
          beforeValue: JSON.stringify(execution.beforeValue),
          afterValue: JSON.stringify(execution.afterValue),
          errorCode: execution.error?.code,
          errorMessage: execution.error?.message,
          retryable: execution.error?.retryable,
          retryAttempt: metadata.retryAttempt || 1,
          nextRetry: metadata.nextRetry
        };
      }
      break;

    case 'conflict_detected':
      if (conflict) {
        eventSpecificVariables = {
          conflictType: conflict.conflictType,
          severity: conflict.severity,
          conflictDescription: conflict.description,
          conflictingScheduleNames: metadata.conflictingScheduleNames || 'Unknown',
          autoResolvable: conflict.autoResolvable,
          suggestedResolution: conflict.suggestedResolution?.action || 'Manual review required',
          conflictsUrl: `${process.env.BASE_URL}/admin/schedules/conflicts`
        };
      }
      break;

    case 'schedule_expired':
      eventSpecificVariables = {
        successfulExecutions: metadata.successfulExecutions || 0,
        failedExecutions: metadata.failedExecutions || 0,
        successRate: metadata.successRate || 0,
        averageDuration: metadata.averageDuration || 0
      };
      break;
    }

    return { ...baseVariables, ...eventSpecificVariables };
  }

  private renderTemplate(template: NotificationTemplate, variables: Record<string, any>): { subject: string; body: string } {
    // Simple template rendering - in production, you might use a more sophisticated template engine
    let subject = template.subject;
    let body = template.body;

    // Replace variables in subject and body
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const stringValue = value?.toString() || '';
      
      subject = subject.replace(new RegExp(placeholder, 'g'), stringValue);
      body = body.replace(new RegExp(placeholder, 'g'), stringValue);
    });

    // Handle simple conditionals (basic Handlebars-like syntax)
    body = this.handleConditionals(body, variables);

    return { subject, body };
  }

  private handleConditionals(text: string, variables: Record<string, any>): string {
    // Handle {{#if variable}} ... {{/if}} blocks
    const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    
    return text.replace(ifRegex, (match, variable, content) => {
      return variables[variable] ? content.trim() : '';
    });
  }

  private async sendThroughChannel(
    channel: NotificationChannel,
    notification: { subject: string; body: string },
    recipients: string[]
  ): Promise<void> {

    switch (channel.type) {
    case 'email':
      await this.sendEmail(channel, notification, recipients);
      break;
      
    case 'slack':
      await this.sendSlack(channel, notification);
      break;
      
    case 'webhook':
      await this.sendWebhook(channel, notification, recipients);
      break;
      
    case 'in_app':
      await this.sendInApp(channel, notification, recipients);
      break;
      
    default:
      console.warn(`Unsupported channel type: ${channel.type}`);
    }
  }

  private async sendEmail(
    channel: NotificationChannel,
    notification: { subject: string; body: string },
    recipients: string[]
  ): Promise<void> {

    // Email implementation would go here
    // This is a placeholder - in production you'd use nodemailer or similar
    console.log('Email notification:', {
      channel: channel.id,
      to: recipients,
      subject: notification.subject,
      body: notification.body
    });
  }

  private async sendSlack(
    channel: NotificationChannel,
    notification: { subject: string; body: string }
  ): Promise<void> {

    const { webhookUrl, username, iconEmoji, channel: slackChannel } = channel.config;
    
    if (!webhookUrl) {
      throw new Error('Slack webhook URL not configured');
    }

    const payload = {
      channel: slackChannel,
      username: username,
      icon_emoji: iconEmoji,
      text: notification.subject,
      attachments: [
        {
          color: 'good',
          text: notification.body,
          mrkdwn_in: ['text']
        }
      ]
    };

    // In production, you'd make an actual HTTP request to the Slack webhook
    console.log('Slack notification:', payload);
  }

  private async sendWebhook(
    channel: NotificationChannel,
    notification: { subject: string; body: string },
    recipients: string[]
  ): Promise<void> {

    const { url, method, headers } = channel.config;
    
    if (!url) {
      throw new Error('Webhook URL not configured');
    }

    const payload = {
      type: 'schedule_notification',
      subject: notification.subject,
      body: notification.body,
      recipients: recipients,
      timestamp: new Date().toISOString()
    };

    // In production, you'd make an actual HTTP request
    console.log('Webhook notification:', {
      url,
      method,
      headers,
      payload
    });
  }

  private async sendInApp(
    channel: NotificationChannel,
    notification: { subject: string; body: string },
    recipients: string[]
  ): Promise<void> {

    // In-app notification implementation
    // This would typically store notifications in a database for user retrieval
    console.log('In-app notification:', {
      recipients,
      subject: notification.subject,
      body: notification.body,
      timestamp: new Date()
    });

    // Emit event for real-time delivery via WebSocket
    this.emit('in_app_notification', {
      recipients,
      notification: {
        subject: notification.subject,
        body: notification.body,
        timestamp: new Date()
      }
    });
  }

  // Utility methods for schedule service integration
  async notifyExecutionSuccess(schedule: FeatureToggleSchedule, execution: ScheduleExecution, metadata: Record<string, any> = {}): Promise<void> {

    const event: NotificationEvent = {
      type: 'execution_success',
      scheduleId: schedule.id,
      schedule,
      execution,
      metadata,
      timestamp: new Date()
    };

    await this.sendNotification(event);
  }

  async notifyExecutionFailure(schedule: FeatureToggleSchedule, execution: ScheduleExecution, metadata: Record<string, any> = {}): Promise<void> {

    const event: NotificationEvent = {
      type: 'execution_failure',
      scheduleId: schedule.id,
      schedule,
      execution,
      metadata,
      timestamp: new Date()
    };

    await this.sendNotification(event);
  }

  async notifyConflictDetected(schedule: FeatureToggleSchedule, conflict: ScheduleConflict, metadata: Record<string, any> = {}): Promise<void> {

    const event: NotificationEvent = {
      type: 'conflict_detected',
      scheduleId: schedule.id,
      schedule,
      conflict,
      metadata,
      timestamp: new Date()
    };

    await this.sendNotification(event);
  }

  async notifyScheduleExpired(schedule: FeatureToggleSchedule, metadata: Record<string, any> = {}): Promise<void> {

    const event: NotificationEvent = {
      type: 'schedule_expired',
      scheduleId: schedule.id,
      schedule,
      metadata,
      timestamp: new Date()
    };

    await this.sendNotification(event);
  }
}