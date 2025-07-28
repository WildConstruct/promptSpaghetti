// Epic 17 - Security Audit Service
// Performs regular security header audits and monitoring

import { FastifyInstance } from 'fastify';
import { auditSecurityHeaders, SecurityAuditResult } from '../middleware/security-headers';

}
export interface SecurityAuditConfig {
  enabled: boolean;
  intervalMinutes: number;
  endpoints: string[];
  alertThresholds: {
    scoreThreshold: number;
    criticalIssues: number;
    highIssues: number;
}
  };
  notifications: {
    enabled: boolean;
    webhookUrl?: string;
    emailRecipients?: string[];
  };
}

}
export interface AuditRecord {
  id: string;
  timestamp: Date;
  endpoint: string;
  result: SecurityAuditResult;
  alerts: string[];
}
}

export class SecurityAuditService {
  private config: SecurityAuditConfig;
  private auditHistory: AuditRecord[] = [];
  private intervalId?: NodeJS.Timeout;
  private server: FastifyInstance;

  constructor(server: FastifyInstance, config: SecurityAuditConfig) {
    this.server = server;
    this.config = config;
  }

  // Start regular security audits
  start(): void {
    if (!this.config.enabled) {
      console.log('Security audit service is disabled');
      return;
    }

    console.log(`Starting security audit service (interval: ${this.config.intervalMinutes} minutes)`);
    
    // Run initial audit
    this.performAudit();

    // Schedule regular audits
    this.intervalId = setInterval(() => {
      this.performAudit();
    }, this.config.intervalMinutes * 60 * 1000);
  }

  // Stop the audit service
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      console.log('Security audit service stopped');
    }
  }

  // Perform security audit on all configured endpoints
  private async performAudit(): Promise<void> {

    console.log('Performing security audit...');

    for (const endpoint of this.config.endpoints) {
      try {
        await this.auditEndpoint(endpoint);
      } catch (error) {
        console.error(`Failed to audit endpoint ${endpoint}:`, error);
      }
    }
  }

  // Audit a specific endpoint
  private async auditEndpoint(endpoint: string): Promise<AuditRecord> {

    try {
      // Make request to endpoint to get headers
      const response = await this.makeAuditRequest(endpoint);
      
      // Audit the security headers
      const auditResult = auditSecurityHeaders(response.headers);
      
      // Generate alerts based on thresholds
      const alerts = this.generateAlerts(auditResult);
      
      // Create audit record
      const record: AuditRecord = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        endpoint,
        result: auditResult,
        alerts
      };

      // Store audit record
      this.auditHistory.push(record);
      this.trimAuditHistory();

      // Send alerts if necessary
      if (alerts.length > 0) {
        await this.sendAlerts(record);
      }

      console.log(`Security audit completed for ${endpoint}: Score ${auditResult.score}/${auditResult.maxScore}`);
      
      return record;
    } catch (error) {
      console.error(`Security audit failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Make a request to audit endpoint headers
  private async makeAuditRequest(endpoint: string): Promise<{ headers: Record<string, string> }> {
    try {
      // For local server, we can make internal requests
      const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
      const fullUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
      
      const response = await fetch(fullUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'SecurityAuditService/1.0'
        }
      });

      // Convert Headers to plain object
      const headers: Record<string, string> = {};
      response.headers.forEach((value, name) => {
        headers[name.toLowerCase()] = value;
      });

      return { headers };
    } catch (error) {
      console.error(`Failed to make audit request to ${endpoint}:`, error);
      throw error;
    }
  }

  // Generate alerts based on audit results
  private generateAlerts(result: SecurityAuditResult): string[] {
    const alerts: string[] = [];

    // Check score threshold
    const scorePercentage = (result.score / result.maxScore) * 100;
    if (scorePercentage < this.config.alertThresholds.scoreThreshold) {
      alerts.push(`Security score below threshold: ${scorePercentage.toFixed(1)}% (threshold: ${this.config.alertThresholds.scoreThreshold}%)`);
    }

    // Check critical issues
    if (result.summary.critical > this.config.alertThresholds.criticalIssues) {
      alerts.push(`Too many critical security issues: ${result.summary.critical} (threshold: ${this.config.alertThresholds.criticalIssues})`);
    }

    // Check high issues
    if (result.summary.high > this.config.alertThresholds.highIssues) {
      alerts.push(`Too many high-severity security issues: ${result.summary.high} (threshold: ${this.config.alertThresholds.highIssues})`);
    }

    // Specific header alerts
    result.headers.forEach(header => {
      if (!header.present) {
        if (header.severity === 'critical') {
          alerts.push(`CRITICAL: Missing security header: ${header.name}`);
        } else if (header.severity === 'high') {
          alerts.push(`HIGH: Missing security header: ${header.name}`);
        }
      }
    });

    return alerts;
  }

  // Send alerts via configured notification methods
  private async sendAlerts(record: AuditRecord): Promise<void> {

    if (!this.config.notifications.enabled || record.alerts.length === 0) {
      return;
    }

    const alertMessage = this.formatAlertMessage(record);

    try {
      // Send webhook notification
      if (this.config.notifications.webhookUrl) {
        await this.sendWebhookAlert(alertMessage, record);
      }

      // Send email notifications
      if (this.config.notifications.emailRecipients?.length) {
        await this.sendEmailAlerts(alertMessage, record);
      }

      console.log(`Security alerts sent for ${record.endpoint}`);
    } catch (error) {
      console.error('Failed to send security alerts:', error);
    }
  }

  // Format alert message
  private formatAlertMessage(record: AuditRecord): string {
    const { result, alerts, endpoint, timestamp } = record;
    const scorePercentage = ((result.score / result.maxScore) * 100).toFixed(1);

    return `
🚨 SECURITY AUDIT ALERT

Endpoint: ${endpoint}
Timestamp: ${timestamp.toISOString()}
Security Score: ${result.score}/${result.maxScore} (${scorePercentage}%)

Issues Summary:
- Critical: ${result.summary.critical}
- High: ${result.summary.high}
- Medium: ${result.summary.medium}
- Low: ${result.summary.low}

Alerts:
${alerts.map(alert => `- ${alert}`).join('\n')}

Missing Headers:
${result.headers.filter(h => !h.present).map(h => `- ${h.name} (${h.severity}): ${h.recommendation}`).join('\n')}
    `.trim();
  }

  // Send webhook alert
  private async sendWebhookAlert(message: string, record: AuditRecord): Promise<void> {

    if (!this.config.notifications.webhookUrl) return;

    const payload = {
      text: message,
      attachments: [{
        color: record.result.passed ? 'good' : 'danger',
        fields: [
          {
            title: 'Endpoint',
            value: record.endpoint,
            short: true
  }
          {
            title: 'Score',
            value: `${record.result.score}/${record.result.maxScore}`,
            short: true
  }
          {
            title: 'Alerts',
            value: record.alerts.length.toString(),
            short: true
          }
        ]
      }]
    };

    await fetch(this.config.notifications.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
  }
      body: JSON.stringify(payload)
    });
  }

  // Send email alerts (placeholder - would integrate with email service)
  private async sendEmailAlerts(message: string, _____record: AuditRecord): Promise<void> {

    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    console.log('Email alerts would be sent to:', this.config.notifications.emailRecipients);
    console.log('Alert message:', message);
  }

  // Trim audit history to prevent memory issues
  private trimAuditHistory(): void {
    const maxRecords = 1000; // Keep last 1000 audit records
    if (this.auditHistory.length > maxRecords) {
      this.auditHistory = this.auditHistory.slice(-maxRecords);
    }
  }

  // Get audit history
  getAuditHistory(limit = 50): AuditRecord[] {
    return this.auditHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get latest audit results
  getLatestAuditResults(): Record<string, AuditRecord> {
    const latest: Record<string, AuditRecord> = {};
    
    for (const record of this.auditHistory) {
      if (!latest[record.endpoint] || record.timestamp > latest[record.endpoint].timestamp) {
        latest[record.endpoint] = record;
      }
    }

    return latest;
  }

  // Get audit statistics
  getAuditStatistics(): {
    totalAudits: number;
    averageScore: number;
    passRate: number;
    alertsLast24h: number;
    endpoints: Record<string, {
      lastAudit: Date;
      score: number;
      passed: boolean;
      alertCount: number;
    }>;
    } {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRecords = this.auditHistory.filter(r => r.timestamp > last24h);
    
    const totalScore = this.auditHistory.reduce((sum, r) => sum + r.result.score, 0);
    const passedAudits = this.auditHistory.filter(r => r.result.passed).length;
    const alertsLast24h = recentRecords.reduce((sum, r) => sum + r.alerts.length, 0);
    
    const latest = this.getLatestAuditResults();
    const endpoints: Record<string, any> = {};
    
    Object.entries(latest).forEach(([endpoint, record]) => {
      endpoints[endpoint] = {
        lastAudit: record.timestamp,
        score: record.result.score,
        passed: record.result.passed,
        alertCount: record.alerts.length
      };
    });

    return {
      totalAudits: this.auditHistory.length,
      averageScore: this.auditHistory.length > 0 ? totalScore / this.auditHistory.length : 0,
      passRate: this.auditHistory.length > 0 ? (passedAudits / this.auditHistory.length) * 100 : 0,
      alertsLast24h,
      endpoints
    };
  }

  // Trigger manual audit
  async triggerManualAudit(endpoint?: string): Promise<AuditRecord[]> {

    const endpointsToAudit = endpoint ? [endpoint] : this.config.endpoints;
    const results: AuditRecord[] = [];

    for (const ep of endpointsToAudit) {
      try {
        const result = await this.auditEndpoint(ep);
        results.push(result);
      } catch (error) {
        console.error(`Manual audit failed for ${ep}:`, error);
      }
    }

    return results;
  }
}

// Default configuration
export const defaultAuditConfig: SecurityAuditConfig = {
  enabled: process.env.SECURITY_AUDIT_ENABLED !== 'false',
  intervalMinutes: parseInt(process.env.SECURITY_AUDIT_INTERVAL || '60'), // 1 hour
  endpoints: [
    '/',
    '/health',
    '/preview',
    '/api/auth/login',
    '/api/corrections',
    '/api/workspace'
  ],
  alertThresholds: {
    scoreThreshold: 70, // Alert if score below 70%
    criticalIssues: 0,  // Alert on any critical issues
    highIssues: 2       // Alert if more than 2 high issues
  }
  notifications: {
    enabled: process.env.SECURITY_ALERTS_ENABLED === 'true',
    webhookUrl: process.env.SECURITY_WEBHOOK_URL,
    emailRecipients: process.env.SECURITY_EMAIL_RECIPIENTS?.split(',')
  }
};