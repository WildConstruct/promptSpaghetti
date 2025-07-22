# Security Event Logging Best Practices
**Task T-1752989143998-720: Add security event logging best practices**  
**Epic 19 - Security & Compliance Framework**

## Overview

This document outlines comprehensive best practices for security event logging within the Wild Construct platform, ensuring compliance with industry standards (SOX, GDPR, HIPAA, ISO 27001) while providing actionable security insights through advanced analytics.

## 🎯 Core Principles

### 1. **Comprehensive Coverage**
- Log all security-relevant events across the entire application stack
- Include authentication, authorization, data access, and system events
- Capture both successful and failed security operations
- Monitor administrative actions and privilege changes

### 2. **Structured Logging**
- Use consistent JSON format for all security events
- Include standardized fields: timestamp, event type, actor, target, outcome
- Maintain backward compatibility for log format changes
- Enable machine-readable parsing and analysis

### 3. **Contextual Information**
- Include sufficient context to understand the event significance
- Capture IP addresses, user agents, and device fingerprints
- Log geolocation data when available and compliant
- Maintain session and correlation IDs for event tracking

### 4. **Privacy by Design**
- Hash or mask sensitive data (passwords, tokens, PII)
- Comply with data protection regulations (GDPR, CCPA)
- Implement data retention policies based on legal requirements
- Provide mechanisms for data subject access and deletion

## 📝 Event Categories and Requirements

### Authentication Events
```typescript
// REQUIRED: Log all authentication attempts
securityLogger.logAccountLocked(lockout, {
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
  geolocation: await getGeolocation(request.ip),
  deviceInfo: {
    deviceId: extractDeviceFingerprint(request),
    deviceType: detectDeviceType(request),
    platform: detectPlatform(request),
    browser: detectBrowser(request)
  },
  threatContext: {
    riskScore: await calculateRiskScore(request),
    attackVector: detectAttackVector(request),
    indicators: getSecurityIndicators(request)
  }
});
```

**Events to Log:**
- ✅ Login attempts (successful/failed)
- ✅ Account lockouts and unlocks
- ✅ Password changes/resets
- ✅ Multi-factor authentication events
- ✅ Session creation/termination
- ✅ Privilege escalation attempts

### Authorization Events
```typescript
// REQUIRED: Log access control decisions
securityLogger.logSecurityAlert('unauthorized_access', 'high', {
  requestedResource: request.path,
  requiredPermissions: requiredPerms,
  userPermissions: userPerms,
  accessDecision: 'denied',
  policyViolation: true
}, context);
```

**Events to Log:**
- ✅ Access granted/denied decisions
- ✅ Permission changes
- ✅ Role assignments/removals
- ✅ Resource access attempts
- ✅ Administrative actions
- ✅ Emergency access usage

### Data Protection Events
```typescript
// REQUIRED: Log data access and manipulation
securityLogger.createAuditTrail(
  'data_access',
  'user_data',
  userId,
  'system',
  'data-classifier',
  {
    before: null,
    after: { classification: 'sensitive', retention: 2555 },
    fields: ['classification', 'retention']
  },
  'Automated classification update',
  context
);
```

**Events to Log:**
- ✅ Data classification changes
- ✅ Sensitive data access
- ✅ Data exports/downloads
- ✅ Bulk data operations
- ✅ Data retention actions
- ✅ Deletion operations

### System Security Events
```typescript
// REQUIRED: Log system-level security events
securityLogger.logSecurityAlert('system_anomaly', 'critical', {
  anomalyType: 'unusual_traffic_pattern',
  metrics: {
    requestVolume: currentVolume,
    baselineVolume: baseline,
    deviationFactor: deviation
  },
  mitigationActions: ['rate_limiting_enabled', 'monitoring_enhanced']
}, context);
```

**Events to Log:**
- ✅ System configuration changes
- ✅ Security policy updates
- ✅ Anomaly detection alerts
- ✅ Intrusion attempts
- ✅ Malware detection
- ✅ System compromises

## 🔧 Implementation Guidelines

### 1. **Log Structure Standards**

#### Minimum Required Fields
```typescript
interface SecurityLogEntry {
  id: string;                    // Unique event identifier
  timestamp: Date;               // UTC timestamp
  level: LogLevel;              // DEBUG, INFO, WARN, ERROR, CRITICAL, SECURITY
  eventType: SecurityEventType; // Standardized event type
  message: string;              // Human-readable description
  actor: Actor;                 // Who performed the action
  target?: Target;              // What was affected
  context: LogContext;          // Environmental context
  details: Record<string, any>; // Event-specific details
  outcome: Outcome;             // success, failure, pending, unknown
  severity: Severity;           // low, medium, high, critical
  compliance: ComplianceInfo;   // Retention and framework requirements
  metadata: EventMetadata;      // Source, checksums, correlation IDs
}
```

#### Context Enrichment
```typescript
interface LogContext {
  // User Context
  userId?: string;
  userEmail?: string;
  sessionId?: string;
  
  // Request Context
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  
  // Geographic Context
  geolocation?: {
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  
  // Device Context
  deviceInfo?: {
    deviceId: string;
    deviceType: 'mobile' | 'desktop' | 'tablet' | 'server';
    platform: string;
    browser: string;
  };
  
  // Threat Context
  threatContext?: {
    riskScore: number;           // 0-100 risk assessment
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    attackVector?: string;       // Type of potential attack
    indicators: string[];        // Security indicators detected
  };
}
```

### 2. **Performance Considerations**

#### Asynchronous Logging
```typescript
// RECOMMENDED: Use async logging to avoid blocking main thread
class AsyncSecurityLogger extends SecurityLogger {
  private logQueue: SecurityLogEntry[] = [];
  private processingLock = false;
  
  public async logEvent(entry: SecurityLogEntry): Promise<string> {
    this.logQueue.push(entry);
    
    // Process queue asynchronously
    setImmediate(() => this.processLogQueue());
    
    return entry.id;
  }
  
  private async processLogQueue(): Promise<void> {
    if (this.processingLock || this.logQueue.length === 0) return;
    
    this.processingLock = true;
    
    try {
      const batch = this.logQueue.splice(0, 100); // Process in batches
      await this.batchProcessLogs(batch);
    } finally {
      this.processingLock = false;
    }
  }
}
```

#### High-Volume Scenarios
```typescript
// RECOMMENDED: Implement sampling for high-volume events
class SamplingSecurityLogger extends SecurityLogger {
  private samplingRates = new Map<SecurityEventType, number>([
    [SecurityEventType.ACCOUNT_LOCKED, 1.0],        // Log all lockouts
    [SecurityEventType.SECURITY_ALERT, 1.0],        // Log all alerts
    [SecurityEventType.AUDIT_LOG_ACCESS, 0.1],      // Sample 10% of access logs
    [SecurityEventType.POLICY_VIOLATION, 1.0]       // Log all violations
  ]);
  
  public shouldLog(eventType: SecurityEventType): boolean {
    const rate = this.samplingRates.get(eventType) || 1.0;
    return Math.random() < rate;
  }
}
```

### 3. **Storage and Retention**

#### Tiered Storage Strategy
```typescript
interface StoragePolicy {
  tier: 'hot' | 'warm' | 'cold' | 'archive';
  retentionDays: number;
  compressionEnabled: boolean;
  encryptionRequired: boolean;
  accessFrequency: 'immediate' | 'minutes' | 'hours' | 'days';
}

const STORAGE_POLICIES: Record<ComplianceFramework, StoragePolicy[]> = {
  [ComplianceFramework.SOX]: [
    { tier: 'hot', retentionDays: 90, compressionEnabled: false, encryptionRequired: true, accessFrequency: 'immediate' },
    { tier: 'warm', retentionDays: 365, compressionEnabled: true, encryptionRequired: true, accessFrequency: 'minutes' },
    { tier: 'cold', retentionDays: 2555, compressionEnabled: true, encryptionRequired: true, accessFrequency: 'hours' }
  ],
  // ... other frameworks
};
```

#### Data Lifecycle Management
```typescript
class LogLifecycleManager {
  async manageLogRetention(): Promise<void> {
    // Hot → Warm transition (after 90 days)
    await this.transitionLogs('hot', 'warm', 90);
    
    // Warm → Cold transition (after 1 year)
    await this.transitionLogs('warm', 'cold', 365);
    
    // Cold → Archive transition (after 3 years)
    await this.transitionLogs('cold', 'archive', 1095);
    
    // Delete expired logs (based on compliance requirements)
    await this.deleteExpiredLogs();
  }
}
```

## 🚨 Security and Privacy Requirements

### 1. **Data Sanitization**
```typescript
class DataSanitizer {
  static sanitizeLogData(data: any): any {
    const sensitive = ['password', 'token', 'secret', 'key', 'ssn', 'creditcard'];
    
    return this.deepSanitize(data, (key, value) => {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        return this.maskSensitiveData(value);
      }
      return value;
    });
  }
  
  static maskSensitiveData(value: string): string {
    if (value.length <= 8) return '*'.repeat(value.length);
    return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
  }
}
```

### 2. **Log Integrity Protection**
```typescript
class LogIntegrityManager {
  static generateChecksum(entry: SecurityLogEntry): string {
    const data = {
      id: entry.id,
      timestamp: entry.timestamp.toISOString(),
      eventType: entry.eventType,
      actor: entry.actor.id,
      target: entry.target?.id
    };
    
    return crypto.createHash('sha256')
      .update(JSON.stringify(data) + process.env.LOG_INTEGRITY_SECRET)
      .digest('hex');
  }
  
  static verifyChecksum(entry: SecurityLogEntry): boolean {
    const expectedChecksum = this.generateChecksum(entry);
    return crypto.timingSafeEqual(
      Buffer.from(entry.metadata.checksum, 'hex'),
      Buffer.from(expectedChecksum, 'hex')
    );
  }
}
```

### 3. **Access Control**
```typescript
interface LogAccessPolicy {
  role: string;
  allowedEventTypes: SecurityEventType[];
  fieldRestrictions: string[];
  timeWindow?: { start: Date; end: Date };
  ipRestrictions?: string[];
}

class LogAccessController {
  static async authorizeLogAccess(
    user: User,
    query: LogQuery
  ): Promise<boolean> {
    const policy = await this.getUserLogAccessPolicy(user);
    
    // Check event type permissions
    if (query.eventTypes && !query.eventTypes.every(type => 
        policy.allowedEventTypes.includes(type))) {
      return false;
    }
    
    // Check time window restrictions
    if (policy.timeWindow && query.startTime && 
        query.startTime < policy.timeWindow.start) {
      return false;
    }
    
    return true;
  }
}
```

## 📊 Monitoring and Alerting

### 1. **Key Metrics to Track**
```typescript
interface SecurityMetrics {
  // Event Volume Metrics
  eventsPerSecond: number;
  eventsByType: Record<SecurityEventType, number>;
  eventsBySeverity: Record<Severity, number>;
  
  // Security Posture Metrics  
  failedLoginRate: number;
  accountLockoutRate: number;
  privilegeEscalationAttempts: number;
  policyViolations: number;
  
  // System Health Metrics
  logProcessingLatency: number;
  logStorageUtilization: number;
  integrityCheckFailures: number;
  retentionComplianceScore: number;
}
```

### 2. **Alert Thresholds**
```typescript
const ALERT_THRESHOLDS = {
  // Critical Alerts (immediate response)
  CRITICAL_EVENTS_PER_MINUTE: 10,
  FAILED_LOGIN_PERCENTAGE: 25,
  PRIVILEGE_ESCALATION_ATTEMPTS: 3,
  SYSTEM_COMPROMISE_INDICATORS: 1,
  
  // High Priority Alerts (15-minute response)
  ACCOUNT_LOCKOUTS_PER_HOUR: 50,
  POLICY_VIOLATIONS_PER_HOUR: 20,
  ANOMALY_DETECTION_SCORE: 80,
  
  // Medium Priority Alerts (1-hour response)
  EVENT_VOLUME_DEVIATION: 200, // % above baseline
  LOG_PROCESSING_LATENCY: 10000, // ms
  STORAGE_UTILIZATION: 85 // %
};
```

### 3. **Automated Response Actions**
```typescript
interface AutomatedResponse {
  trigger: AlertCondition;
  actions: ResponseAction[];
  cooldownPeriod: number; // seconds
}

const AUTOMATED_RESPONSES: AutomatedResponse[] = [
  {
    trigger: { type: 'threshold', metric: 'failed_login_rate', value: 50 },
    actions: [
      { type: 'rate_limit', target: 'authentication', factor: 2 },
      { type: 'notify', recipients: ['security-team@company.com'] },
      { type: 'log', level: 'critical', message: 'High failed login rate detected' }
    ],
    cooldownPeriod: 300
  },
  {
    trigger: { type: 'pattern', pattern: 'privilege_escalation' },
    actions: [
      { type: 'disable_user', duration: 3600 },
      { type: 'notify', recipients: ['security-team@company.com', 'admin-team@company.com'] },
      { type: 'escalate', severity: 'critical' }
    ],
    cooldownPeriod: 0 // No cooldown for security incidents
  }
];
```

## 🔍 Analysis and Insights

### 1. **Behavioral Analysis**
```typescript
class BehaviorAnalyzer {
  static async analyzeUserBehavior(userId: string): Promise<BehaviorAnalysis> {
    const baseline = await this.getUserBaseline(userId);
    const recentActivity = await this.getRecentActivity(userId, 24); // last 24 hours
    
    const analysis = {
      riskScore: this.calculateRiskScore(baseline, recentActivity),
      anomalies: this.detectAnomalies(baseline, recentActivity),
      recommendations: this.generateRecommendations(baseline, recentActivity)
    };
    
    return analysis;
  }
  
  private static detectAnomalies(
    baseline: UserBaseline, 
    activity: SecurityLogEntry[]
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];
    
    // Time-based anomalies
    const unusualHours = this.detectUnusualAccessTimes(baseline, activity);
    if (unusualHours.length > 0) {
      anomalies.push({
        type: 'temporal',
        severity: 'medium',
        description: `Access at unusual hours: ${unusualHours.join(', ')}`,
        evidence: unusualHours
      });
    }
    
    // Location-based anomalies
    const unusualLocations = this.detectUnusualLocations(baseline, activity);
    if (unusualLocations.length > 0) {
      anomalies.push({
        type: 'geolocation',
        severity: 'high',
        description: `Access from unusual locations: ${unusualLocations.join(', ')}`,
        evidence: unusualLocations
      });
    }
    
    return anomalies;
  }
}
```

### 2. **Threat Pattern Detection**
```typescript
class ThreatPatternDetector {
  static async detectPatterns(logs: SecurityLogEntry[]): Promise<ThreatPattern[]> {
    const patterns: ThreatPattern[] = [];
    
    // Brute force detection
    const bruteForcePattern = await this.detectBruteForce(logs);
    if (bruteForcePattern) patterns.push(bruteForcePattern);
    
    // Credential stuffing detection
    const credentialStuffingPattern = await this.detectCredentialStuffing(logs);
    if (credentialStuffingPattern) patterns.push(credentialStuffingPattern);
    
    // Insider threat detection
    const insiderThreatPattern = await this.detectInsiderThreats(logs);
    if (insiderThreatPattern) patterns.push(insiderThreatPattern);
    
    return patterns;
  }
  
  private static async detectBruteForce(logs: SecurityLogEntry[]): Promise<ThreatPattern | null> {
    const failedLogins = logs.filter(log => 
      log.eventType === SecurityEventType.ACCOUNT_LOCKED &&
      log.details.reason === 'EXCESSIVE_FAILED_ATTEMPTS'
    );
    
    if (failedLogins.length < 5) return null;
    
    // Group by IP address
    const ipGroups = this.groupBy(failedLogins, log => log.context.ipAddress || 'unknown');
    
    for (const [ip, attempts] of Object.entries(ipGroups)) {
      if (attempts.length >= 5) {
        return {
          type: 'brute_force',
          confidence: 0.9,
          severity: 'high',
          indicators: {
            sourceIp: ip,
            attemptCount: attempts.length,
            timeWindow: this.calculateTimeWindow(attempts),
            targetAccounts: [...new Set(attempts.map(a => a.context.userEmail))]
          },
          mitigations: [
            'Block source IP',
            'Implement progressive delays',
            'Enable CAPTCHA verification'
          ]
        };
      }
    }
    
    return null;
  }
}
```

## 📋 Compliance Requirements

### 1. **SOX Compliance**
- **Retention Period**: 7 years minimum
- **Immutability**: Logs must be tamper-evident
- **Access Controls**: Role-based access with audit trails
- **Integrity**: Cryptographic checksums required
- **Availability**: 99.9% uptime requirement

### 2. **GDPR Compliance**
- **Data Minimization**: Only log necessary personal data
- **Purpose Limitation**: Use logs only for security purposes
- **Storage Limitation**: Delete data when no longer needed
- **Subject Rights**: Provide access, rectification, erasure capabilities
- **Data Protection by Design**: Implement privacy-preserving logging

### 3. **HIPAA Compliance** (if applicable)
- **Administrative Safeguards**: Assign security responsibilities
- **Physical Safeguards**: Secure log storage infrastructure
- **Technical Safeguards**: Access controls and encryption
- **Audit Controls**: Monitor access to logs
- **Transmission Security**: Encrypt logs in transit

### 4. **ISO 27001 Compliance**
- **Risk-Based Approach**: Log based on risk assessment
- **Continuous Monitoring**: Real-time security monitoring
- **Incident Response**: Automated response to security events
- **Management Review**: Regular review of log effectiveness
- **Improvement**: Continuously improve logging practices

## 🛠️ Tools and Integrations

### 1. **SIEM Integration**
```typescript
class SIEMIntegration {
  static async sendToSIEM(entry: SecurityLogEntry): Promise<void> {
    const siemFormat = this.convertToSIEMFormat(entry);
    
    await this.siemClient.sendEvent(siemFormat);
    
    // Send to multiple SIEM systems for redundancy
    if (entry.severity === 'critical') {
      await Promise.all([
        this.siemClient.sendEvent(siemFormat),
        this.backupSIEMClient.sendEvent(siemFormat)
      ]);
    }
  }
}
```

### 2. **External Log Aggregation**
```typescript
class LogAggregationService {
  static async aggregateToElasticsearch(entries: SecurityLogEntry[]): Promise<void> {
    const bulkBody = entries.flatMap(entry => [
      { index: { _index: `security-logs-${new Date().toISOString().slice(0, 7)}` } },
      entry
    ]);
    
    await this.elasticsearchClient.bulk({ body: bulkBody });
  }
  
  static async streamToSplunk(entries: SecurityLogEntry[]): Promise<void> {
    for (const entry of entries) {
      await this.splunkClient.sendEvent({
        time: entry.timestamp.getTime() / 1000,
        source: entry.metadata.source,
        sourcetype: 'security_event',
        event: entry
      });
    }
  }
}
```

## 📖 Implementation Checklist

### Phase 1: Core Logging Infrastructure
- [ ] ✅ Implement SecurityLogger base class
- [ ] ✅ Define log entry structure and schemas
- [ ] ✅ Create event type taxonomy
- [ ] ✅ Implement data sanitization
- [ ] ✅ Add integrity protection (checksums)

### Phase 2: Enhanced Analytics
- [ ] ✅ Implement SecurityEventAnalytics engine
- [ ] ✅ Add behavioral baseline tracking
- [ ] ✅ Create threat pattern detection
- [ ] ✅ Build executive dashboard
- [ ] ✅ Implement automated alerting

### Phase 3: Compliance and Storage
- [ ] 🔄 Implement retention policies
- [ ] 🔄 Add compliance reporting
- [ ] 🔄 Create data lifecycle management
- [ ] 🔄 Implement tiered storage
- [ ] 🔄 Add audit trail verification

### Phase 4: Integration and Monitoring
- [ ] ⏳ SIEM integration
- [ ] ⏳ External aggregation (Elasticsearch, Splunk)
- [ ] ⏳ Real-time monitoring dashboard
- [ ] ⏳ Automated response system
- [ ] ⏳ Performance optimization

## 🎯 Success Metrics

### Technical Metrics
- **Log Coverage**: 95% of security events captured
- **Processing Latency**: < 100ms average
- **Storage Efficiency**: 80% compression ratio
- **Integrity Verification**: 100% checksum validation
- **Query Performance**: < 2s for standard queries

### Security Metrics
- **Detection Rate**: 90% of known attack patterns
- **False Positive Rate**: < 5% for critical alerts
- **Response Time**: < 5 minutes for critical incidents
- **Compliance Score**: 100% for applicable frameworks
- **Audit Readiness**: Pass all external audits

### Business Metrics
- **Cost per GB**: Minimize storage and processing costs
- **Operational Efficiency**: Reduce manual security analysis by 70%
- **Risk Reduction**: Demonstrable improvement in security posture
- **Compliance Savings**: Reduce audit preparation time by 50%

---

## 🔗 Related Documentation

- [Security Event Analytics API Reference](./security-event-analytics-api.md)
- [Compliance Framework Implementation](./compliance-framework.md)
- [Incident Response Playbooks](./incident-response-playbooks.md)
- [Data Classification and Protection](./data-classification-framework.md)
- [Security Monitoring Dashboard Guide](./security-monitoring-dashboard.md)

---

**Last Updated**: 2025-07-22  
**Document Version**: 1.0  
**Maintained by**: Security Engineering Team  
**Review Cycle**: Quarterly