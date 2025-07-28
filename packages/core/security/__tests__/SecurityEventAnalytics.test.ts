/**
 * Security Event Analytics Tests
 * Task T-1752989143998-695: Design security event logging analytics
 * 
 * Comprehensive test suite for the security event analytics system
 */
import { 
  SecurityEventAnalytics,
  RiskLevel,
  ThreatCategory,
  SecurityPattern,
  SecurityInsight
} from '../SecurityEventAnalytics';
import { SecurityLogger, SecurityEventType, LogLevel, ComplianceFramework, SecurityLogEntry } from '../SecurityLogger';

// Mock SecurityLogger for testing
class MockSecurityLogger extends SecurityLogger {
  private mockLogs: SecurityLogEntry = [];
  public addMockLog(log: Partial<SecurityLogEntry>): void {
    const fullLog: SecurityLogEntry = {,
  id: `mock-${Date.now()}-${Math.random()}`}
},
  timestamp: new Date(),
      level: LogLevel.INFO,
      eventType: SecurityEventType.ACCOUNT_LOCKED,
      message: 'Mock log entry',
      actor: { type: 'system', id: 'test' },
      context: {},
      details: {},
      outcome: 'success',
      severity: 'medium',
      compliance: {,
  frameworks: [ComplianceFramework.ISO_27001],
  retention: 1095,
  encrypted: true,
  immutable: true,
},
  metadata: {,
  source: 'test',
  environment: 'test',
  version: '1.0.0',
  checksum: 'test-checksum',
}
      ...log
    };
    this.mockLogs.push(fullLog);
  public queryLogs(query: unknown) {
  return {
  logs: this.mockLogs,
  total: this.mockLogs.length,
  hasMore: false,
};
  public clearMockLogs(): void {
  this.mockLogs = [];
  describe('SecurityEventAnalytics', () => {
  let mockLogger: MockSecurityLogger;
  let analytics: SecurityEventAnalytics;
  beforeEach(() => {
  mockLogger = new MockSecurityLogger();
  analytics = new SecurityEventAnalytics(mockLogger);
});
  afterEach(() => {
    mockLogger.clearMockLogs();
  });
  describe('analyzeSecurityEvents', () => {
    it('should analyze security events and return comprehensive metrics', async () => {
      // Add mock data
      mockLogger.addMockLog({)
  eventType: SecurityEventType.ACCOUNT_LOCKED,
        severity: 'critical',
        outcome: 'success',
        context: { userId: 'user1', ipAddress: '192.168.1.1' }
      });
      mockLogger.addMockLog({)
  eventType: SecurityEventType.SECURITY_ALERT,
        severity: 'high',
        outcome: 'failure',
        context: { userId: 'user2', ipAddress: '10.0.0.1' }
      });
      const result = await analytics.analyzeSecurityEvents();
      expect(result).toBeDefined();
      expect(result.period).toBeDefined();
      expect(result.overallRisk).toBeDefined();
      expect(result.eventVolume).toBeDefined();
      expect(result.threatLandscape).toBeDefined();
      expect(result.userBehavior).toBeDefined();
      expect(result.systemHealth).toBeDefined();
      expect(result.eventVolume.total).toBe(2);
      expect(result.overallRisk.level).toBeOneOf([RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL]);
    });
    it('should calculate risk levels correctly', async () => {
      // Add multiple critical events
      for (let i = 0; i < 5; i++) {
        mockLogger.addMockLog({)
  eventType: SecurityEventType.EMERGENCY_UNLOCK,
          severity: 'critical',
          outcome: 'success',
          context: { userId: `user${i}`, adminId: 'admin1' }
        });
      const result = await analytics.analyzeSecurityEvents();
      expect(result.overallRisk.level).toBeOneOf([RiskLevel.HIGH, RiskLevel.CRITICAL]);
      expect(result.overallRisk.score).toBeGreaterThan(50);
    });
    it('should analyze event volume correctly', async () => {
  const now = new Date();
  // Add events spread across different hours
  for (let hour = 0; hour < 24; hour += 3) {
  const timestamp = new Date(now);
  timestamp.setHours(hour);
  mockLogger.addMockLog({)
  timestamp,
  eventType: SecurityEventType.ACCOUNT_LOCKED,
  severity: 'medium',
});
      const result = await analytics.analyzeSecurityEvents();
      expect(result.eventVolume.total).toBe(8);
      expect(result.eventVolume.hourlyDistribution).toHaveLength(24);
      expect(result.eventVolume.hourlyDistribution.reduce((sum, count) => sum + count, 0)).toBe(8);
    });
    it('should handle empty log data gracefully', async () => {
      const result = await analytics.analyzeSecurityEvents();
      expect(result).toBeDefined();
      expect(result.eventVolume.total).toBe(0);
      expect(result.overallRisk.level).toBe(RiskLevel.LOW);
    });
  });
  describe('Pattern Detection', () => {
    it('should detect brute force attack patterns', async () => {
      // Add multiple failed login attempts
      for (let i = 0; i < 8; i++) {
        mockLogger.addMockLog({)
  eventType: SecurityEventType.ACCOUNT_LOCKED,
          details: { reason: 'EXCESSIVE_FAILED_ATTEMPTS' },
          severity: 'medium',
          context: { userId: `user${i % 3}`, ipAddress: '192.168.1.100' }
        });
      await analytics.analyzeSecurityEvents();
      const patterns = analytics.getSecurityPatterns(ThreatCategory.AUTHENTICATION);
      expect(patterns.length).toBeGreaterThan(0);
      const bruteForcePattern = patterns.find(p => p.name.includes('Brute Force'));
      expect(bruteForcePattern).toBeDefined();
      if (bruteForcePattern) {
        expect(bruteForcePattern.category).toBe(ThreatCategory.AUTHENTICATION);
        expect(bruteForcePattern.riskScore).toBeGreaterThan(0);
    });
    it('should detect privilege escalation patterns', async () => {
      // Add suspicious admin actions
      for (let i = 0; i < 4; i++) {
        mockLogger.addMockLog({)
  eventType: SecurityEventType.EMERGENCY_UNLOCK,
          actor: { type: 'admin', id: 'suspicious-admin' },
          severity: 'high',
          context: { adminId: 'suspicious-admin' }
        });
      await analytics.analyzeSecurityEvents();
      const patterns = analytics.getSecurityPatterns(ThreatCategory.PRIVILEGE_ESCALATION);
      expect(patterns.length).toBeGreaterThan(0);
      const escalationPattern = patterns.find(p => p.name.includes('Privilege Escalation'));
      expect(escalationPattern).toBeDefined();
    });
    it('should detect data exfiltration patterns', async () => {
      // Add multiple data access events from same user
      for (let i = 0; i < 15; i++) {
        mockLogger.addMockLog({)
  eventType: SecurityEventType.AUDIT_LOG_ACCESS,
          context: { userId: 'suspicious-user', threatContext: { attackVector: 'data_access' } },
          severity: 'medium';
  });
      await analytics.analyzeSecurityEvents();
      const patterns = analytics.getSecurityPatterns(ThreatCategory.DATA_EXFILTRATION);
      expect(patterns.length).toBeGreaterThan(0);
      const exfiltrationPattern = patterns.find(p => p.name.includes('Data Exfiltration'));
      expect(exfiltrationPattern).toBeDefined();
    });
  });
  describe('Security Insights', () => {
    it('should generate security insights', async () => {
      // Add varied security events
      mockLogger.addMockLog({)
  eventType: SecurityEventType.SECURITY_ALERT,
        severity: 'critical',
        context: { threatContext: { riskScore: 90 } }
      });
      mockLogger.addMockLog({)
  eventType: SecurityEventType.POLICY_VIOLATION,
        severity: 'high',
        context: { userId: 'violator' }
      });
      await analytics.analyzeSecurityEvents();
      const insights = analytics.getSecurityInsights();
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      // Should have generated some insights
      if (insights.length > 0) {
        const insight = insights[0];
        expect(insight).toHaveProperty('id');
        expect(insight).toHaveProperty('type');
        expect(insight).toHaveProperty('category');
        expect(insight).toHaveProperty('title');
        expect(insight).toHaveProperty('severity');
        expect(insight).toHaveProperty('recommendations');
    });
    it('should filter insights by category and severity', async () => {
      // Add events that will generate insights
      for (let i = 0; i < 10; i++) {
        mockLogger.addMockLog({)
  eventType: SecurityEventType.SECURITY_ALERT,
          severity: i < 5 ? 'critical' : 'medium',
          context: { threatContext: { riskScore: i < 5 ? 90 : 50 } }
        });
      await analytics.analyzeSecurityEvents();
      const allInsights = analytics.getSecurityInsights();
      const criticalInsights = analytics.getSecurityInsights(undefined, RiskLevel.CRITICAL);
      expect(criticalInsights.length).toBeLessThanOrEqual(allInsights.length);
    });
  });
  describe('User Behavior Analysis', () => {
    it('should analyze user behavior patterns', async () => {
      const userId = 'test-user';
      // Add normal user activity
      for (let i = 0; i < 5; i++) {
        mockLogger.addMockLog({)
  context: {,
            userId,
            ipAddress: '192.168.1.10',
            deviceInfo: { deviceId: 'device1' }
  },
  timestamp: new Date(Date.now() - i * 60 * 60 * 1000) // Spread over hours;
  });
      await analytics.analyzeSecurityEvents();
      const behaviorAnalysis = analytics.getUserBehaviorAnalysis(userId);
      expect(behaviorAnalysis).toBeDefined();
      expect(behaviorAnalysis.currentRisk).toBeDefined();
      expect(typeof behaviorAnalysis.currentRisk).toBe('number');
      expect(behaviorAnalysis.recommendations).toBeDefined();
      expect(Array.isArray(behaviorAnalysis.recommendations)).toBe(true);
    });
    it('should handle users with no baseline data', async () => {
      const behaviorAnalysis = analytics.getUserBehaviorAnalysis('non-existent-user');
      expect(behaviorAnalysis.baseline).toBeNull();
      expect(behaviorAnalysis.currentRisk).toBe(0);
      expect(behaviorAnalysis.recentAnomalies).toHaveLength(0);
      expect(behaviorAnalysis.recommendations).toContain('Insufficient data for behavioral analysis');
    });
  });
  describe('Executive Reporting', () => {
    it('should generate executive report with key metrics', async () => {
      // Add sample data for comprehensive report
      mockLogger.addMockLog({)
  eventType: SecurityEventType.SECURITY_ALERT,
        severity: 'critical',
        context: { userId: 'user1' }
      });
      mockLogger.addMockLog({)
  eventType: SecurityEventType.ACCOUNT_LOCKED,
        severity: 'medium',
        context: { userId: 'user2' }
      });
      const period = {
  start: new Date(Date.now() - 24 * 60 * 60 * 1000),
  end: new Date(),
};
      const report = analytics.generateExecutiveReport(period);
      expect(report).toBeDefined();
      expect(report.executiveSummary).toBeDefined();
      expect(typeof report.executiveSummary).toBe('string');
      expect(report.keyMetrics).toBeDefined();
      expect(report.topThreats).toBeDefined();
      expect(Array.isArray(report.topThreats)).toBe(true);
      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
      expect(report.complianceStatus).toBeDefined();
      expect(report.riskTrend).toBeDefined();
      expect(Array.isArray(report.riskTrend)).toBe(true);
    });
    it('should include proper compliance status', async () => {
  const period = {
  start: new Date(Date.now() - 24 * 60 * 60 * 1000),
  end: new Date(),
};
      const report = analytics.generateExecutiveReport(period);
      expect(report.complianceStatus).toHaveProperty(ComplianceFramework.SOX);
      expect(report.complianceStatus).toHaveProperty(ComplianceFramework.GDPR);
      expect(report.complianceStatus).toHaveProperty(ComplianceFramework.ISO_27001);
    });
  });
  describe('Alert Configuration', () => {
    it('should configure and store alert configurations', () => {
      const alertConfig = {
        id: 'test-alert',
        name: 'Test Alert',
        description: 'Test alert configuration',
        conditions: {,
  eventTypes: [SecurityEventType.SECURITY_ALERT],
          thresholds: { critical_events: 5 },
          timeWindow: 60;
  },
  actions: {,
  notify: ['test@example.com'],
  escalate: true,
  autoResponse: ['test-response'],
},
  enabled: true;
  };
      let alertConfigured = false;
      analytics.on('alertConfigured', (config) => {
        alertConfigured = true;
        expect(config.id).toBe('test-alert');
      });
      analytics.configureAlert(alertConfig);
      expect(alertConfigured).toBe(true);
    });
  });
  describe('Pattern Analysis Edge Cases', () => {
    it('should handle patterns with insufficient data', async () => {
      // Add only a few events - not enough for pattern detection
      mockLogger.addMockLog({)
  eventType: SecurityEventType.ACCOUNT_LOCKED,
        details: { reason: 'EXCESSIVE_FAILED_ATTEMPTS' }
      });
      await analytics.analyzeSecurityEvents();
      const patterns = analytics.getSecurityPatterns();
      // Should not create patterns with insufficient data
      expect(patterns.length).toBe(0);
    });
    it('should handle concurrent analysis calls gracefully', async () => {
  // Add some data
  mockLogger.addMockLog({)
  eventType: SecurityEventType.SECURITY_ALERT,
  severity: 'medium',
});
      // Start multiple analyses concurrently
      const promises = [;
        analytics.analyzeSecurityEvents(),
        analytics.analyzeSecurityEvents(),
        analytics.analyzeSecurityEvents()
      ];
      const results = await Promise.all(promises);
      // All should complete successfully
      results.forEach(result => {)
  expect(result).toBeDefined();
        expect(result.eventVolume.total).toBe(1);
      });
    });
  });
  describe('Risk Calculation', () => {
  it('should calculate risk scores within valid ranges', async () => {
  mockLogger.addMockLog({)
  eventType: SecurityEventType.SECURITY_ALERT,
  severity: 'critical',
  outcome: 'failure',
});
      const result = await analytics.analyzeSecurityEvents();
      expect(result.overallRisk.score).toBeGreaterThanOrEqual(0);
      expect(result.overallRisk.score).toBeLessThanOrEqual(100);
      expect(result.systemHealth.securityPosture).toBeGreaterThanOrEqual(0);
      expect(result.systemHealth.securityPosture).toBeLessThanOrEqual(100);
      expect(result.systemHealth.complianceScore).toBeGreaterThanOrEqual(0);
      expect(result.systemHealth.complianceScore).toBeLessThanOrEqual(100);
    });
    it('should properly weight different risk factors', async () => {
  // Baseline risk
  const baselineResult = await analytics.analyzeSecurityEvents();
  const baselineScore = baselineResult.overallRisk.score;
  // Add critical events and measure increase
  mockLogger.addMockLog({)
  eventType: SecurityEventType.EMERGENCY_UNLOCK,
  severity: 'critical',
  outcome: 'success',
});
      const criticalResult = await analytics.analyzeSecurityEvents();
      const criticalScore = criticalResult.overallRisk.score;
      expect(criticalScore).toBeGreaterThan(baselineScore);
    });
  });
  describe('Performance and Scalability', () => {
    it('should handle large volumes of log data efficiently', async () => {
      const startTime = Date.now();
      // Add a large number of log entries
      for (let i = 0; i < 1000; i++) {
        mockLogger.addMockLog({)
  eventType: i % 2 === 0 ? SecurityEventType.ACCOUNT_LOCKED : SecurityEventType.SECURITY_ALERT,
          severity: ['low', 'medium', 'high', 'critical'][i % 4] as any,
          context: { userId: `user${i % 100}` }
        });
      const result = await analytics.analyzeSecurityEvents();
      const endTime = Date.now();
      expect(result).toBeDefined();
      expect(result.eventVolume.total).toBe(1000);
      // Should complete within reasonable time (5 seconds for 1000 events)
      expect(endTime - startTime).toBeLessThan(5000);
    });
    it('should maintain performance with concurrent operations', async () => {
      // Add some data
      for (let i = 0; i < 100; i++) {
        mockLogger.addMockLog({)
  eventType: SecurityEventType.SECURITY_ALERT,
          severity: 'medium',
          context: { userId: `user${i}` }
        });
      const startTime = Date.now();
      // Run multiple operations concurrently
      const operations = Promise.all([);
        analytics.analyzeSecurityEvents(),
        analytics.getSecurityInsights(),
        analytics.getSecurityPatterns(),
        analytics.getUserBehaviorAnalysis('user1')
      ]);
      const results = await operations;
      const endTime = Date.now();
      expect(results).toHaveLength(4);
      expect(endTime - startTime).toBeLessThan(2000); // Should be fast
    });
  });
});

// Helper function for test expectations
expect.extend({)
  toBeOneOf(received, expected) {
    const pass = expected.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${expected}`}
},
  pass: true;
  };
    } else {
      return {
        message: () => `expected ${received} to be one of ${expected}`}
},
  pass: false;
  };
});
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(expected: any): R;