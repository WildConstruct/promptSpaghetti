/**
 * Basic Test Suite for Password Guidance Service
 * 
 * Tests core functionality of password security guidance.
 */
import {
  PasswordGuidanceService,
  RiskLevel,
  CompromiseType,
  ActionPriority,
  GuidanceCategory,
  CompromiseIndicator
} from '../PasswordGuidanceService';
describe('PasswordGuidanceService - Basic Tests', () => {
  let service: PasswordGuidanceService;
  beforeEach(() => {
    service = new PasswordGuidanceService();
  });
  test('should create service instance', () => {
    expect(service).toBeInstanceOf(PasswordGuidanceService);
  });
  test('should generate immediate actions for data breach', () => {
    const actions = service.getImmediateActions(CompromiseType.DATA_BREACH);
    expect(actions.length).toBeGreaterThan(0);
    expect(actions[0].priority).toBe(ActionPriority.IMMEDIATE);
    expect(actions[0].category).toBe(GuidanceCategory.IMMEDIATE_ACTIONS);
  });
  test('should create guidance session', async () => {
    const userId = 'test-user';
    const indicators: CompromiseIndicator[] = [{
      type: CompromiseType.DATA_BREACH,
      description: 'Password found in breach',
      confidence: 90,
      source: 'test',
      detectedAt: new Date(),
      evidence: ['test evidence'],
      affectedAccounts: [userId],
    }];
    const session = await service.assessPasswordCompromise(userId, indicators);
    expect(session.userId).toBe(userId);
    expect(session.status).toBe('active');
    expect(session.recommendations.length).toBeGreaterThan(0);
  });
  test('should track action completion', async () => {
    const userId = 'test-user';
    const indicators: CompromiseIndicator[] = [{
      type: CompromiseType.WEAK_PASSWORD,
      description: 'Password too weak',
      confidence: 100,
      source: 'test',
      detectedAt: new Date(),
      evidence: [],
      affectedAccounts: [userId],
    }];
    const session = await service.assessPasswordCompromise(userId, indicators);
    const actionId = session.recommendations[0].id;
    const result = service.markActionCompleted(session.id, actionId);
    expect(result).toBe(true);
    const progress = service.getSessionProgress(session.id);
    expect(progress?.completed).toBe(1);
  });
  test('should generate user security dashboard', () => {
    const userId = 'dashboard-user';
    const dashboard = service.getUserSecurityDashboard(userId);
    expect(dashboard).toHaveProperty('profile');
    expect(dashboard).toHaveProperty('activeSessions');
    expect(dashboard).toHaveProperty('recommendedActions');
    expect(dashboard).toHaveProperty('securityTips');
  });
  test('should handle invalid session ID gracefully', () => {
    const result = service.markActionCompleted('invalid-id', 'action');
    expect(result).toBe(false);
    const progress = service.getSessionProgress('invalid-id');
    expect(progress).toBeNull();
  });
});