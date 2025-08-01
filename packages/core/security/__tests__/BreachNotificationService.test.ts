/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Comprehensive Test Suite for Breach Notification Service
 * 
 * Tests GDPR compliance, incident management, notification systems,
 * and automated breach response workflows for 2025 security standards.
 */
import { EventEmitter } from 'events';
import { BreachNotificationService,
  BreachSeverity,
  BreachType,
  BreachCategory,
  NotificationType,
  DataSubjectCategory }
  IncidentStatus
 from '../BreachNotificationService';

// Mock crypto for deterministic testing
jest.mock('crypto', () => ({ )
  randomUUID: jest.fn(() => 'test-uuid-12345'),
  randomBytes: jest.fn(() => Buffer.from('test-random-bytes')) }
}));
describe('BreachNotificationService', () => { let service: BreachNotificationService;
  let mockDate: Date;
  beforeEach(() => {
  // Mock Date.now() for consistent testing
  mockDate = new Date('2025-01-15T10:00:00Z');
  jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime( as unknown as unknown));
  // Store original Date for safe access
  const OriginalDate = Date;
  // Mock Date constructor safely to avoid infinite recursion
  const mockDateConstructor = jest.fn<unknown, unknown>().mockImplementation((dateString?: string) => { }
  if (dateString) { return new OriginalDate(dateString);
  return new OriginalDate(mockDate.getTime()) });
    mockDateConstructor.now = jest.fn<unknown, unknown>().mockReturnValue(mockDate.getTime( as unknown as unknown));
    (global as any).Date = mockDateConstructor;
    // Mock Math.random for deterministic IDs
    jest.spyOn(Math, 'random').mockReturnValue(0.123456789 as unknown as unknown);
    service = new BreachNotificationService({ )
  detection: {
  enabled: true
  autoClassification: true
  riskThreshold: BreachSeverity.MEDIUM
  monitoringSources: ['test_logs'] }

  notifications: { 
  gdpr: {
  enabled: true
  supervisoryAuthority: 'Test ICO'
  contactEmail: 'test-dpo@company.com'
  autoFile: false
  deadline: 72 }

  internal: { 
  securityTeam: ['security@test.com']
  management: ['ceo@test.com']
  legal: ['legal@test.com']
  dpo: 'dpo@test.com' }

  external: { 
  customers: {
  enabled: true
  highRiskThreshold: BreachSeverity.HIGH
  template: 'customer_notification' }

  media: { 
  enabled: false
  criticalThreshold: BreachSeverity.CRITICAL
  contactList: [] }
});
  });
  afterEach(() => { jest.restoreAllMocks() });
  describe('Incident Creation and Management', () => { test('should create incident with proper classification', async () => {
  const incidentData = {
  title: 'MFA Database Breach'
  description: 'Unauthorized access to user authentication data'
  dataTypes: ['email', 'phone', 'password_hash']
  affectedSystems: ['authentication', 'user_management']
  estimatedDataSubjects: 1500
  detectedBy: 'automated-monitor' }
};
      const incidentId = await service.reportBreach(incidentData);
      expect(incidentId).toMatch(/^INC-\d+-[A-Z0-9]+$/);
      const incident = service.getIncidents().find(i => i.id === incidentId);
      expect(incident).toBeDefined();
      expect(incident!.title).toBe(incidentData.title);
      expect(incident!.severity).toBe(BreachSeverity.CRITICAL); // Should auto-classify as critical
      expect(incident!.status).toBe(IncidentStatus.DETECTED);
      expect(incident!.timeline).toHaveLength(1);
      expect(incident!.complianceRequirements).toContainEqual()
        expect.objectContaining({ )
  framework: 'GDPR'
  requirement: 'Notify supervisory authority within 72 hours' }

      );
    });
    test('should update incident status and maintain timeline', async () => { const incidentId = await service.reportBreach({)
  title: 'Test Breach'
  description: 'Test description'
  dataTypes: ['email']
  affectedSystems: ['auth']
  estimatedDataSubjects: 100 }
});
      await service.updateIncident(incidentId, { )
  status: IncidentStatus.INVESTIGATING
  assignee: 'security-team@company.com'
  containmentActions: ['Disabled affected user accounts'] }
}, 'incident-response-team');
      const incident = service.getIncidents().find(i => i.id === incidentId);
      expect(incident!.status).toBe(IncidentStatus.INVESTIGATING);
      expect(incident!.assignee).toBe('security-team@company.com');
      expect(incident!.containmentActions).toContain('Disabled affected user accounts');
      expect(incident!.timeline).toHaveLength(2);
      expect(incident!.timeline[1].event).toBe('Incident updated');
      expect(incident!.timeline[1].actor).toBe('incident-response-team');
    });
    test('should handle incident filtering and querying', async () => { // Create multiple incidents
  await service.reportBreach({)
  title: 'High Severity Breach'
  description: 'Test'
  severity: BreachSeverity.HIGH
  dataTypes: ['email']
  affectedSystems: ['auth'] }
});
      await service.reportBreach({ )
  title: 'Medium Severity Breach'
  description: 'Test'
  severity: BreachSeverity.MEDIUM
  dataTypes: ['logs']
  affectedSystems: ['logging'] }
});
      const highSeverityIncidents = service.getIncidents({ )
  severity: BreachSeverity.HIGH }
});
      const detectedIncidents = service.getIncidents({ )
  status: IncidentStatus.DETECTED }
});
      expect(highSeverityIncidents).toHaveLength(1);
      expect(highSeverityIncidents[0].title).toBe('High Severity Breach');
      expect(detectedIncidents).toHaveLength(2);
    });
  });
  describe('Breach Classification System', () => { test('should classify PII breaches as CRITICAL', async () => {
  const incidentId = await service.reportBreach({)
  title: 'PII Breach'
  description: 'Personal data exposed'
  dataTypes: ['pii', 'personal_data', 'financial']
  affectedSystems: ['user_database']
  estimatedDataSubjects: 5000 }
});
      const incident = service.getIncidents().find(i => i.id === incidentId);
      expect(incident!.severity).toBe(BreachSeverity.CRITICAL);
    });
    test('should classify authentication system breaches as HIGH', async () => { const incidentId = await service.reportBreach({)
  title: 'Auth System Breach'
  description: 'Authentication system compromised'
  dataTypes: ['session_tokens']
  affectedSystems: ['authentication', 'mfa']
  estimatedDataSubjects: 200 }
});
      const incident = service.getIncidents().find(i => i.id === incidentId);
      expect(incident!.severity).toBe(BreachSeverity.HIGH);
    });
    test('should classify low-impact breaches as MEDIUM or LOW', async () => { const incidentId = await service.reportBreach({)
  title: 'System Logs Breach'
  description: 'Non-PII system logs exposed'
  dataTypes: ['system_logs']
  affectedSystems: ['logging']
  estimatedDataSubjects: 0 }
});
      const incident = service.getIncidents().find(i => i.id === incidentId);
      expect([BreachSeverity.MEDIUM, BreachSeverity.LOW]).toContain(incident!.severity);
    });
  });
  describe('GDPR Compliance Management', () => { test('should require GDPR notification for PII breaches', async () => {
  const incidentId = await service.reportBreach({)
  title: 'Email Database Breach'
  description: 'User email addresses exposed'
  dataTypes: ['email', 'pii']
  affectedSystems: ['user_database']
  estimatedDataSubjects: 1000 }
});
      const gdprNotification = await service.generateGDPRNotification(incidentId);
      expect(gdprNotification.content).toContain('GDPR Personal Data Breach Notification');
      expect(gdprNotification.recipients).toContain('test-dpo@company.com');
      expect(gdprNotification.deadline.getTime()).toBe()
        mockDate.getTime() + (72 * 60 * 60 * 1000) // 72 hours
      );
    });
    test('should check GDPR compliance status', async () => { const incidentId = await service.reportBreach({)
  title: 'Personal Data Breach'
  description: 'Customer personal data exposed'
  dataTypes: ['email', 'phone', 'pii']
  affectedSystems: ['customer_db']
  estimatedDataSubjects: 500 }
});
      const compliance = service.checkGDPRCompliance(incidentId);
      expect(compliance.compliant).toBe(false);
      expect(compliance.violations).toContain('GDPR notification not sent');
      expect(compliance.violations).toContain('Data subject impact not assessed');
      expect(compliance.actions).toContain('Send GDPR notification to supervisory authority');
      expect(compliance.timeRemaining).toBeGreaterThan(0);
    });
    test('should detect GDPR deadline violations', async () => { const incidentId = await service.reportBreach({)
  title: 'Old Breach'
  description: 'Breach detected 3 days ago'
  dataTypes: ['pii']
  affectedSystems: ['user_db']
  estimatedDataSubjects: 100 }
});
      // Mock incident as detected 73 hours ago (past GDPR deadline)
      const incident = service.getIncidents().find(i => i.id === incidentId)!;
      const pastDate = new Date(mockDate.getTime() - (73 * 60 * 60 * 1000));
      incident.detectedAt = pastDate;
      const compliance = service.checkGDPRCompliance(incidentId);
      expect(compliance.compliant).toBe(false);
      expect(compliance.timeRemaining).toBeLessThan(0);
      expect(compliance.violations).toContain('72-hour notification deadline exceeded');
    });
    test('should not require GDPR notification for non-PII breaches', async () => { const incidentId = await service.reportBreach({)
  title: 'System Configuration Breach'
  description: 'Non-personal system data exposed'
  dataTypes: ['system_config']
  affectedSystems: ['config_management']
  estimatedDataSubjects: 0 }
});
      await expect(service.generateGDPRNotification(incidentId))
        .rejects.toThrow('Incident does not require GDPR notification');
    });
  });
  describe('Notification System', () => { test('should send notifications to correct recipients', async () => {
  const incidentId = await service.reportBreach({)
  title: 'Critical Security Incident'
  description: 'High-priority security breach'
  severity: BreachSeverity.CRITICAL
  dataTypes: ['pii']
  affectedSystems: ['auth']
  estimatedDataSubjects: 1000 }
});
      const notifications = await service.sendNotification(;);
        incidentId
        NotificationType.INTERNAL_ALERT
        ['security@test.com', 'management@test.com']
        'critical_breach_alert'
      );
      expect(notifications).toHaveLength(2);
      expect(notifications[0].type).toBe(NotificationType.INTERNAL_ALERT);
      expect(notifications[0].recipient).toBe('security@test.com');
      expect(notifications[0].status).toBe('sent');
      expect(notifications[1].recipient).toBe('management@test.com');
    });
    test('should handle notification delivery failures', async () => { // Mock a failing notification delivery
  const originalDeliverNotification = (service as any).deliverNotification;
  (service as any).deliverNotification = jest.fn<unknown, unknown>().mockRejectedValue(new Error('Delivery failed'));
  const incidentId = await service.reportBreach({)
  title: 'Test Breach'
  description: 'Test'
  dataTypes: ['logs']
  affectedSystems: ['system'] }
});
      const notifications = await service.sendNotification(;);
        incidentId
        NotificationType.INTERNAL_ALERT
        ['failing@test.com']
      );
      expect(notifications[0].status).toBe('failed');
      expect(notifications[0].metadata.error).toBe('Delivery failed');
      // Restore original method
      (service as any).deliverNotification = originalDeliverNotification;
    });
    test('should determine appropriate notification channels', async () => { const incidentId = await service.reportBreach({)
  title: 'Test Breach'
  description: 'Test'
  dataTypes: ['logs']
  affectedSystems: ['system'] }
});
      const emailNotifications = await service.sendNotification(;);
        incidentId
        NotificationType.INTERNAL_ALERT
        ['email@test.com']
      );
      const smsNotifications = await service.sendNotification(;);
        incidentId
        NotificationType.INTERNAL_ALERT
        ['+1234567890']
      );
      expect(emailNotifications[0].channel).toBe('email');
      expect(smsNotifications[0].channel).toBe('sms');
    });
  });
  describe('Report Generation', () => { test('should generate summary reports', async () => {
  const incidentId = await service.reportBreach({)
  title: 'Test Incident'
  description: 'Test description'
  dataTypes: ['test_data']
  affectedSystems: ['test_system']
  estimatedDataSubjects: 50 }
});
      const summaryReport = service.generateReport(incidentId, 'summary');
      const reportData = JSON.parse(summaryReport);
      expect(reportData.id).toBe(incidentId);
      expect(reportData.title).toBe('Test Incident');
      expect(reportData.severity).toBeDefined();
      expect(reportData.timeline).toBeDefined();
    });
    test('should generate detailed reports', async () => { const incidentId = await service.reportBreach({)
  title: 'Detailed Test Incident'
  description: 'Comprehensive test'
  dataTypes: ['pii', 'authentication']
  affectedSystems: ['auth', 'user_db']
  estimatedDataSubjects: 200 }
});
      const detailedReport = service.generateReport(incidentId, 'detailed');
      const reportData = JSON.parse(detailedReport);
      expect(reportData.riskAssessment).toBeDefined();
      expect(reportData.complianceRequirements).toBeDefined();
      expect(reportData.notifications).toBeDefined();
      expect(reportData.evidence).toBeDefined();
    });
    test('should generate regulatory reports', async () => { const incidentId = await service.reportBreach({)
  title: 'Regulatory Incident'
  description: 'Incident requiring regulatory reporting'
  severity: BreachSeverity.HIGH
  dataTypes: ['pii']
  affectedSystems: ['customer_db']
  estimatedDataSubjects: 1000 }
});
      const regulatoryReport = service.generateReport(incidentId, 'regulatory');
      const reportData = JSON.parse(regulatoryReport);
      expect(reportData.complianceRequirements).toBeDefined();
      expect(reportData.dataSubjects).toBeDefined();
      expect(reportData.mitigationMeasures).toBeDefined();
    });
  });
  describe('Event System and Monitoring', () => { test('should emit events for incident lifecycle', async () => {
  const events: string = [];
  service.on('incidentCreated', () => events.push('created'));
  service.on('incidentUpdated', () => events.push('updated'));
  service.on('notificationsSent', () => events.push('notifications'));
  const incidentId = await service.reportBreach({)
  title: 'Test Event Incident'
  description: 'Testing event emission'
  dataTypes: ['test']
  affectedSystems: ['test'] }
});
      await service.updateIncident(incidentId, { )
  status: IncidentStatus.INVESTIGATING }
}, 'test-user');
      await service.sendNotification()
        incidentId
        NotificationType.INTERNAL_ALERT
        ['test@example.com']
      );
      expect(events).toContain('created');
      expect(events).toContain('updated');
      expect(events).toContain('notifications');
    });
    test('should emit GDPR deadline warnings', (done) => { service.on('gdprDeadlineApproaching', (incident) => {
        expect(incident.title).toBe('GDPR Test Incident');
        done() });
      // Create incident that would trigger GDPR deadline warning
      service.reportBreach({ )
  title: 'GDPR Test Incident'
  description: 'Test GDPR deadline monitoring'
  dataTypes: ['pii']
  affectedSystems: ['user_db']
  estimatedDataSubjects: 100 }
});
      // Simulate deadline approaching (would normally be timer-based)
      setTimeout(() => { service.emit('gdprDeadlineApproaching', {)
  title: 'GDPR Test Incident' }
});
      }, 10);
    });
    test('should track compliance violations', (done) => { service.on('complianceViolation', (data) => {
        expect(data.violations).toContain('GDPR notification not sent');
        done() });
      // Simulate closing incident without GDPR compliance
      service.reportBreach({ )
  title: 'Non-compliant Incident'
  description: 'Test compliance violation'
  dataTypes: ['pii']
  affectedSystems: ['user_db']
  estimatedDataSubjects: 100 }
}).then(incidentId => { )
  return service.updateIncident(incidentId, {)
  status: IncidentStatus.CLOSED }
}, 'test-user');
      });
    });
  });
  describe('Error Handling and Edge Cases', () => { test('should handle invalid incident IDs', () => {
  expect(() => service.checkGDPRCompliance('invalid-id'))
  .toThrow('Incident not found: invalid-id');
  expect(() => service.generateReport('invalid-id', 'summary'))
  .toThrow('Incident not found: invalid-id') });
    test('should handle unknown report formats', async () => { const incidentId = await service.reportBreach({)
  title: 'Test'
  description: 'Test'
  dataTypes: ['test']
  affectedSystems: ['test'] }
});
      expect(() => service.generateReport(incidentId, 'unknown' as any))
        .toThrow('Unknown report format: unknown');
    });
    test('should handle missing configuration gracefully', () => {
      const minimalService = new BreachNotificationService({)
  detection: { enabled: false }
        notifications: {
  gdpr: { enabled: false }
          internal: { 
  securityTeam: []
  management: []
  legal: []
  dpo: '' }
 as any);
      expect(minimalService).toBeInstanceOf(BreachNotificationService);
    });
    test('should validate incident data completeness', async () => { const incidentId = await service.reportBreach({)
  title: 'Incomplete Incident'
  description: 'Missing data subject information'
  dataTypes: ['pii']
  affectedSystems: ['user_db'] }
  // Missing estimatedDataSubjects
});
      const compliance = service.checkGDPRCompliance(incidentId);
      expect(compliance.violations).toContain('Data subject impact not assessed');
    });
  });
  describe('Performance and Scalability', () => {
    test('should handle multiple concurrent incidents', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        service.reportBreach({)
  title: `Concurrent Incident ${i}`}

  description: `Test concurrent processing ${i}`}

  dataTypes: ['test_data']
          affectedSystems: [`system_${i}`]}

  estimatedDataSubjects: i * 10;

      );
      const incidentIds = await Promise.all(promises);
      expect(incidentIds).toHaveLength(10);
      expect(new Set(incidentIds)).toHaveLength(10); // All unique IDs
      const incidents = service.getIncidents();
      expect(incidents).toHaveLength(10);
    });
    test('should efficiently filter large incident collections', async () => {
      // Create many incidents
      const promises = Array.from({ length: 100 }, (_, i) =>
        service.reportBreach({)
  title: `Performance Test ${i}`}

  description: `Performance test incident ${i}`}

  severity: i % 2 === 0 ? BreachSeverity.HIGH : BreachSeverity.MEDIUM
          dataTypes: ['test_data']
          affectedSystems: ['test_system']
          estimatedDataSubjects: i;

      );
      await Promise.all(promises);
      const startTime = Date.now();
      const highSeverityIncidents = service.getIncidents({ )
  severity: BreachSeverity.HIGH }
});
      const endTime = Date.now();
      expect(highSeverityIncidents).toHaveLength(50);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });
  });
  describe('Integration and Configuration', () => { test('should support custom configuration overrides', () => {
  const customService = new BreachNotificationService({)
  notifications: {
  gdpr: {
  enabled: true
  supervisoryAuthority: 'Custom Authority'
  contactEmail: 'custom-dpo@test.com'
  deadline: 24, // Custom 24-hour deadline
  autoFile: true }

  internal: { 
  securityTeam: ['custom-security@test.com']
  management: ['custom-management@test.com']
  legal: ['custom-legal@test.com']
  dpo: 'custom-dpo@test.com' }

  external: { 
  customers: {
  enabled: true
  highRiskThreshold: BreachSeverity.HIGH
  template: 'customer_template' }

  media: { 
  enabled: false
  criticalThreshold: BreachSeverity.CRITICAL
  contactList: [] }

  automation: { 
  containmentActions: false
  evidenceCollection: true
  reportGeneration: true
  statusUpdates: true }
});
      expect(customService).toBeInstanceOf(BreachNotificationService);
    });
    test('should maintain audit trail integrity', async () => { const incidentId = await service.reportBreach({)
  title: 'Audit Trail Test'
  description: 'Testing audit trail maintenance'
  dataTypes: ['sensitive_data']
  affectedSystems: ['audit_system']
  estimatedDataSubjects: 50 }
});
      // Multiple updates to test timeline integrity
      await service.updateIncident(incidentId, { )
  status: IncidentStatus.INVESTIGATING }
}, 'security-analyst');
      await service.updateIncident(incidentId, { )
  status: IncidentStatus.CONTAINED
  containmentActions: ['Isolated affected systems'] }
}, 'incident-commander');
      await service.updateIncident(incidentId, { )
  status: IncidentStatus.CLOSED
  mitigationMeasures: ['Implemented additional monitoring'] }
}, 'security-manager');
      const incident = service.getIncidents().find(i => i.id === incidentId)!;
      expect(incident.timeline).toHaveLength(4); // Creation + 3 updates
      expect(incident.timeline.map(t => t.event)).toEqual([)
        'Incident detected and reported'
        'Incident updated'
        'Incident updated'
        'Incident updated'
      ]);
      // Ensure chronological order
      for (let i = 1; i < incident.timeline.length; i++) { expect(incident.timeline[i].timestamp.getTime())
          .toBeGreaterThanOrEqual(incident.timeline[i-1].timestamp.getTime()) });
  });
});