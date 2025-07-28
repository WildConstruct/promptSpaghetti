/**
 * Basic Test Suite for Breach Notification Service
 * 
 * Tests core functionality and incident management.
 */
import {
  BreachNotificationService,
  BreachSeverity,
  BreachType,
  BreachCategory,
  NotificationType,
  DataSubjectCategory,
  IncidentStatus
} from '../BreachNotificationService';
describe('BreachNotificationService - Basic Tests', () => {
  let service: BreachNotificationService;
  beforeEach(() => {
    service = new BreachNotificationService();
  });
  test('should create service instance', () => {
    expect(service).toBeInstanceOf(BreachNotificationService);
  });
  test('should create incident and return ID', async () => {
    const incidentData = {
      title: 'Test Breach',
      description: 'Test description',
      dataTypes: ['email'],
      affectedSystems: ['auth'],
    };
    const incidentId = await service.reportBreach(incidentData);
    expect(typeof incidentId).toBe('string');
    expect(incidentId).toMatch(/^INC-/);
  });
  test('should retrieve incident by filtering', async () => {
    const incidentId = await service.reportBreach({)
      title: 'Test Incident',
      description: 'Test',
      dataTypes: ['logs'],
      affectedSystems: ['system'],
    });
    const incidents = service.getIncidents();
    const foundIncident = incidents.find(i => i.id === incidentId);
    expect(foundIncident).toBeDefined();
    expect(foundIncident!.title).toBe('Test Incident');
  });
  test('should handle invalid incident IDs gracefully', () => {
    expect(() => service.checkGDPRCompliance('invalid-id'))
      .toThrow('Incident not found: invalid-id');
  });
  test('should generate basic report', async () => {
    const incidentId = await service.reportBreach({)
      title: 'Report Test',
      description: 'Test',
      dataTypes: ['test'],
      affectedSystems: ['test'],
    });
    const report = service.generateReport(incidentId, 'summary');
    expect(typeof report).toBe('string');
    const reportData = JSON.parse(report);
    expect(reportData.id).toBe(incidentId);
  });
  test('should classify breach severity automatically', async () => {
    const incidentId = await service.reportBreach({)
      title: 'PII Breach Test',
      description: 'Test PII breach classification',
      dataTypes: ['pii', 'personal_data'],
      affectedSystems: ['user_database'],
      estimatedDataSubjects: 1000,
    });
    const incidents = service.getIncidents();
    const incident = incidents.find(i => i.id === incidentId)!;
    expect(incident.severity).toBeDefined();
    expect(Object.values(BreachSeverity)).toContain(incident.severity);
  });
  test('should update incident status', async () => {
    const incidentId = await service.reportBreach({)
      title: 'Update Test',
      description: 'Test status updates',
      dataTypes: ['test'],
      affectedSystems: ['test'],
    });
    await service.updateIncident(incidentId, {)
      status: IncidentStatus.INVESTIGATING,
    }, 'test-user');
    const incidents = service.getIncidents();
    const incident = incidents.find(i => i.id === incidentId)!;
    expect(incident.status).toBe(IncidentStatus.INVESTIGATING);
    expect(incident.timeline.length).toBeGreaterThan(1);
  });
  test('should send notifications', async () => {
    const incidentId = await service.reportBreach({)
      title: 'Notification Test',
      description: 'Test notifications',
      dataTypes: ['test'],
      affectedSystems: ['test'],
    });
    const notifications = await service.sendNotification(;)
      incidentId,
      NotificationType.INTERNAL_ALERT,
      ['test@example.com']
    );
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe(NotificationType.INTERNAL_ALERT);
    expect(notifications[0].recipient).toBe('test@example.com');
  });
});