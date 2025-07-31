/**
 * Centralized Performance Alerting Service
 * Provides enterprise-grade alerting for performance metrics with:
 * - Multi-channel notification support (email, Slack, SMS, webhooks)
 * - Escalation policies and severity-based routing
 * - Alert correlation and deduplication
 * - Historical alert tracking and analytics
 * - Integration with existing performance monitoring
 */

import EventEmitter from 'events';
import nodemailer from 'nodemailer';
import { WebhookClient } from '@slack/webhook';

}
}
export interface AlertConfig {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'contains';
  threshold: number | string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  channels: AlertChannel[];
  cooldownMinutes: number;
  enabled: boolean;
  tags: string[];
}
}
}

}
}
export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  config: {
    recipients?: string[];
    slackWebhookUrl?: string;
    webhookUrl?: string;
    smsNumbers?: string[];
}
}
  };
}

}
}
export interface Alert {
  id: string;
  configId: string;
  metric: string;
  value: number | string;
  threshold: number | string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  escalatedTo?: string;
  context: Record<string, any>;
}
}
}

}
}
export interface EscalationPolicy {
  id: string;
  name: string;
  rules: EscalationRule[];
  enabled: boolean;
}
}
}

}
}
export interface EscalationRule {
  afterMinutes: number;
  severity: string[];
  channels: AlertChannel[];
  assignTo?: string;
}
}
}

export class AlertingService extends EventEmitter {
  private alertConfigs: Map<string, AlertConfig> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private alertHistory: Alert[] = [];
  private escalationPolicies: Map<string, EscalationPolicy> = new Map();
  private cooldownTracker: Map<string, Date> = new Map();
  private emailTransporter: any;
  private enabled: boolean = true;

  constructor() {
    super();
    this.setupEmailTransporter();
    this.startEscalationProcessor();
  }

  /**
   * Configure email transport for alert notifications
   */
  private setupEmailTransporter(): void {
    const emailConfig = {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };

    if (emailConfig.auth.user && emailConfig.auth.pass) {
      this.emailTransporter = nodemailer.createTransporter(emailConfig);
    }
  }

  /**
   * Add or update alert configuration
   */
  addAlertConfig(config: AlertConfig): void {
    this.alertConfigs.set(config.id, config);
    this.emit('configAdded', config);
  }

  /**
   * Remove alert configuration
   */
  removeAlertConfig(configId: string): void {
    this.alertConfigs.delete(configId);
    this.emit('configRemoved', configId);
  }

  /**
   * Add escalation policy
   */
  addEscalationPolicy(policy: EscalationPolicy): void {
    this.escalationPolicies.set(policy.id, policy);
    this.emit('policyAdded', policy);
  }

  /**
   * Check metric against all alert configurations
   */
  async checkMetric(metric: string, value: number | string, context: Record<string, any> = {}): Promise<void> {

    if (!this.enabled) return;

    for (const [configId, config] of this.alertConfigs) {
      if (config.metric === metric && config.enabled) {
        const isTriggered = this.evaluateCondition(value, config.condition, config.threshold);
        
        if (isTriggered) {
          await this.triggerAlert(config, value, context);
        } else {
          // Check if we should resolve an existing alert
          await this.maybeResolveAlert(configId);
        }
      }
    }
  }

  /**
   * Evaluate alert condition
   */
  private evaluateCondition(value: number | string, condition: string, threshold: number | string): boolean {
    if (typeof value === 'number' && typeof threshold === 'number') {
      switch (condition) {
      case 'gt': return value > threshold;
      case 'gte': return value >= threshold;
      case 'lt': return value < threshold;
      case 'lte': return value <= threshold;
      case 'eq': return value === threshold;
      default: return false;
      }
    }

    if (typeof value === 'string' && typeof threshold === 'string') {
      switch (condition) {
      case 'eq': return value === threshold;
      case 'contains': return value.includes(threshold);
      default: return false;
      }
    }

    return false;
  }

  /**
   * Trigger an alert
   */
  private async triggerAlert(config: AlertConfig, value: number | string, context: Record<string, any>): Promise<void> {

    const alertKey = `${config.id}-${config.metric}`;
    
    // Check cooldown
    const lastAlert = this.cooldownTracker.get(alertKey);
    if (lastAlert && Date.now() - lastAlert.getTime() < config.cooldownMinutes * 60 * 1000) {
      return;
    }

    // Check if alert already exists and not resolved
    const existingAlert = Array.from(this.activeAlerts.values()).find(
      alert => alert.configId === config.id && !alert.resolved
    );

    if (existingAlert) {
      // Update existing alert
      existingAlert.value = value;
      existingAlert.timestamp = new Date();
      existingAlert.context = { ...existingAlert.context, ...context };
    } else {
      // Create new alert
      const alert: Alert = {
        id: `${config.id}-${Date.now()}`,
        configId: config.id,
        metric: config.metric,
        value,
        threshold: config.threshold,
        severity: config.severity,
        message: this.generateAlertMessage(config, value),
        timestamp: new Date(),
        resolved: false,
        context
      };

      this.activeAlerts.set(alert.id, alert);
      this.alertHistory.push(alert);
    }

    // Send notifications
    await this.sendNotifications(config, value, context);
    
    // Update cooldown
    this.cooldownTracker.set(alertKey, new Date());
    
    this.emit('alertTriggered', { config, value, context });
  }

  /**
   * Resolve an alert if conditions are no longer met
   */
  private async maybeResolveAlert(configId: string): Promise<void> {

    const activeAlert = Array.from(this.activeAlerts.values()).find(
      alert => alert.configId === configId && !alert.resolved
    );

    if (activeAlert) {
      activeAlert.resolved = true;
      activeAlert.resolvedAt = new Date();
      
      const config = this.alertConfigs.get(configId);
      if (config) {
        await this.sendResolutionNotifications(config, activeAlert);
      }
      
      this.emit('alertResolved', activeAlert);
    }
  }

  /**
   * Send alert notifications through configured channels
   */
  private async sendNotifications(config: AlertConfig, value: number | string, context: Record<string, any>): Promise<void> {

    const message = this.generateAlertMessage(config, value);
    
    for (const channel of config.channels) {
      try {
        switch (channel.type) {
        case 'email':
          await this.sendEmailAlert(channel, config, message, context);
          break;
        case 'slack':
          await this.sendSlackAlert(channel, config, message, context);
          break;
        case 'webhook':
          await this.sendWebhookAlert(channel, config, message, value, context);
          break;
        case 'sms':
          await this.sendSMSAlert(channel, config, message);
          break;
        }
      } catch (error) {
        console.error(`Failed to send ${channel.type} alert:`, error);
        this.emit('notificationError', { channel, error });
      }
    }
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(channel: AlertChannel, config: AlertConfig, message: string, context: Record<string, any>): Promise<void> {

    if (!this.emailTransporter || !channel.config.recipients) return;

    const mailOptions = {
      from: process.env.ALERT_FROM_EMAIL || 'alerts@example.com',
      to: channel.config.recipients.join(','),
      subject: `[${config.severity.toUpperCase()}] ${config.name}`,
      html: this.generateEmailHTML(config, message, context)
    };

    await this.emailTransporter.sendMail(mailOptions);
  }

  /**
   * Send Slack alert
   */
  private async sendSlackAlert(channel: AlertChannel, config: AlertConfig, message: string, context: Record<string, any>): Promise<void> {

    if (!channel.config.slackWebhookUrl) return;

    const webhook = new WebhookClient(channel.config.slackWebhookUrl);
    
    const color = this.getSeverityColor(config.severity);
    const attachment = {
      color,
      title: config.name,
      text: message,
      fields: [
        {
          title: 'Severity',
          value: config.severity.toUpperCase(),
          short: true
  }
        {
          title: 'Metric',
          value: config.metric,
          short: true
  }
        {
          title: 'Threshold',
          value: config.threshold.toString(),
          short: true
  }
        {
          title: 'Timestamp',
          value: new Date().toISOString(),
          short: true
        }
      ],
      footer: 'Performance Monitoring',
      ts: Math.floor(Date.now() / 1000)
    };

    await webhook.send({
      text: `Performance Alert: ${config.name}`,
      attachments: [attachment]
    });
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(channel: AlertChannel, config: AlertConfig, message: string, value: number | string, context: Record<string, any>): Promise<void> {

    if (!channel.config.webhookUrl) return;

    const payload = {
      alert: {
        id: `${config.id}-${Date.now()}`,
        name: config.name,
        metric: config.metric,
        value,
        threshold: config.threshold,
        severity: config.severity,
        message,
        timestamp: new Date().toISOString(),
        context
      }
    };

    const response = await fetch(channel.config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
  }
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }
  }

  /**
   * Send SMS alert (placeholder - integrate with SMS service)
   */
  private async sendSMSAlert(channel: AlertChannel, config: AlertConfig, message: string): Promise<void> {

    // Integrate with SMS service like Twilio
    console.log(`SMS Alert would be sent to ${channel.config.smsNumbers}: ${message}`);
  }

  /**
   * Send resolution notifications
   */
  private async sendResolutionNotifications(config: AlertConfig, alert: Alert): Promise<void> {

    const message = `RESOLVED: ${config.name} - The alert condition is no longer met.`;
    
    for (const channel of config.channels) {
      try {
        if (channel.type === 'slack' && channel.config.slackWebhookUrl) {
          const webhook = new WebhookClient(channel.config.slackWebhookUrl);
          await webhook.send({
            text: `✅ Alert Resolved: ${config.name}`,
            attachments: [{
              color: 'good',
              text: message,
              footer: 'Performance Monitoring',
              ts: Math.floor(Date.now() / 1000)
            }]
          });
        }
      } catch (error) {
        console.error('Failed to send resolution notification:', error);
      }
    }
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(config: AlertConfig, value: number | string): string {
    return `Alert: ${config.name}\n` +
           `Metric: ${config.metric}\n` +
           `Current Value: ${value}\n` +
           `Threshold: ${config.threshold}\n` +
           `Condition: ${config.condition}\n` +
           `Severity: ${config.severity}\n` +
           `Description: ${config.description}`;
  }

  /**
   * Generate HTML email content
   */
  private generateEmailHTML(config: AlertConfig, message: string, context: Record<string, any>): string {
    const contextHtml = Object.entries(context)
      .map(([key, value]) => `<tr><td><strong>${key}:</strong></td><td>${value}</td></tr>`)
      .join('');

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background-color: ${this.getSeverityColor(config.severity)}; color: white; padding: 15px; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .context { margin-top: 20px; }
            table { border-collapse: collapse; width: 100%; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>[${config.severity.toUpperCase()}] ${config.name}</h2>
          </div>
          <div class="content">
            <pre>${message}</pre>
            ${contextHtml ? `
              <div class="context">
                <h3>Context:</h3>
                <table>${contextHtml}</table>
              </div>
            ` : ''}
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Get color for severity level
   */
  private getSeverityColor(severity: string): string {
    switch (severity) {
    case 'info': return '#36a3f7';
    case 'warning': return '#faad14';
    case 'critical': return '#ff4d4f';
    case 'emergency': return '#a61e4d';
    default: return '#666666';
    }
  }

  /**
   * Start escalation processor
   */
  private startEscalationProcessor(): void {
    setInterval(async () => {
      await this.processEscalations();
    }, 60 * 1000); // Check every minute
  }

  /**
   * Process escalations for unresolved alerts
   */
  private async processEscalations(): Promise<void> {

    const now = new Date();
    
    for (const alert of this.activeAlerts.values()) {
      if (alert.resolved || alert.escalatedTo) continue;
      
      const config = this.alertConfigs.get(alert.configId);
      if (!config) continue;
      
      // Find applicable escalation policies
      for (const policy of this.escalationPolicies.values()) {
        if (!policy.enabled) continue;
        
        for (const rule of policy.rules) {
          if (!rule.severity.includes(alert.severity)) continue;
          
          const alertAge = now.getTime() - alert.timestamp.getTime();
          const escalationTime = rule.afterMinutes * 60 * 1000;
          
          if (alertAge >= escalationTime) {
            await this.escalateAlert(alert, rule);
            alert.escalatedTo = rule.assignTo || 'escalation-team';
            break;
          }
        }
      }
    }
  }

  /**
   * Escalate alert according to escalation rule
   */
  private async escalateAlert(alert: Alert, rule: EscalationRule): Promise<void> {

    const config = this.alertConfigs.get(alert.configId);
    if (!config) return;
    
    // Send escalation notifications
    const escalationMessage = `ESCALATED: ${config.name}\n` +
                             `Original Alert Time: ${alert.timestamp.toISOString()}\n` +
                             `Escalated After: ${rule.afterMinutes} minutes\n` +
                             `Assigned To: ${rule.assignTo || 'Escalation Team'}`;
    
    for (const channel of rule.channels) {
      try {
        if (channel.type === 'slack' && channel.config.slackWebhookUrl) {
          const webhook = new WebhookClient(channel.config.slackWebhookUrl);
          await webhook.send({
            text: `🚨 ESCALATED ALERT: ${config.name}`,
            attachments: [{
              color: 'danger',
              text: escalationMessage,
              footer: 'Performance Monitoring - Escalation',
              ts: Math.floor(Date.now() / 1000)
            }]
          });
        }
      } catch (error) {
        console.error('Failed to send escalation notification:', error);
      }
    }
    
    this.emit('alertEscalated', { alert, rule });
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert && !alert.resolved) {
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();
      this.emit('alertAcknowledged', alert);
      return true;
    }
    return false;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit: number = 100): Alert[] {
    return this.alertHistory.slice(-limit);
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics(): any {
    const total = this.alertHistory.length;
    const resolved = this.alertHistory.filter(a => a.resolved).length;
    const acknowledged = this.alertHistory.filter(a => a.acknowledgedBy).length;
    const escalated = this.alertHistory.filter(a => a.escalatedTo).length;
    
    const severityCounts = this.alertHistory.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total,
      resolved,
      acknowledged,
      escalated,
      active: total - resolved,
      resolutionRate: total > 0 ? (resolved / total) * 100 : 0,
      acknowledgmentRate: total > 0 ? (acknowledged / total) * 100 : 0,
      severityBreakdown: severityCounts
    };
  }

  /**
   * Enable or disable alerting
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.emit('enabledChanged', enabled);
  }

  /**
   * Test alert configuration
   */
  async testAlert(configId: string): Promise<boolean> {

    const config = this.alertConfigs.get(configId);
    if (!config) return false;
    
    try {
      await this.sendNotifications(config, 'TEST_VALUE', { test: true });
      return true;
    } catch (error) {
      console.error('Test alert failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const alertingService = new AlertingService();