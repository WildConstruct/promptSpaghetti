/**
 * Test Suite for Password Guidance Service
 * 
 * Tests comprehensive password security guidance, compromise assessment,
 * and user security recommendations for 2025 security standards.
 */

import {
  PasswordGuidanceService,
  RiskLevel,
  CompromiseType,
  ActionPriority,
  GuidanceCategory,
  CompromiseIndicator,
  SecurityRecommendation,
  GuidanceSession
} from '../PasswordGuidanceService';

describe('PasswordGuidanceService', () => {
  let service: PasswordGuidanceService;
  let mockDate: Date;

  beforeEach(() => {
    mockDate = new Date('2025-01-15T10:00:00Z');
    jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());
    
    service = new PasswordGuidanceService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Risk Assessment and Classification', () => {
    test('should classify data breach as high risk', () => {
      const indicators: CompromiseIndicator[] = [{
        type: CompromiseType.DATA_BREACH,
        description: 'User data exposed in major breach',
        confidence: 95,
        source: 'HaveIBeenPwned',
        detectedAt: new Date(),
        evidence: ['Password hash found in breach database'],
        affectedAccounts: ['user@example.com']
      }];

      const riskLevel = (service as any).calculateRiskLevel(indicators);
      expect(riskLevel).toBe(RiskLevel.CRITICAL);
    });

    test('should classify weak password as medium risk', () => {
      const indicators: CompromiseIndicator[] = [{
        type: CompromiseType.WEAK_PASSWORD,
        description: 'Password does not meet strength requirements',
        confidence: 100,
        source: 'password_analyzer',
        detectedAt: new Date(),
        evidence: ['Dictionary word detected', 'No special characters'],
        affectedAccounts: ['user@example.com']
      }];

      const riskLevel = (service as any).calculateRiskLevel(indicators);
      expect([RiskLevel.MEDIUM, RiskLevel.LOW]).toContain(riskLevel);
    });

    test('should classify multiple indicators as critical risk', () => {
      const indicators: CompromiseIndicator[] = [
        {
          type: CompromiseType.DATA_BREACH,
          description: 'Found in major data breach',
          confidence: 90,
          source: 'breach_database',
          detectedAt: new Date(),
          evidence: ['Password hash exposed'],
          affectedAccounts: ['user@example.com']
        },
        {
          type: CompromiseType.CREDENTIAL_STUFFING,
          description: 'Login attempts from multiple IPs',
          confidence: 85,
          source: 'security_monitor',
          detectedAt: new Date(),
          evidence: ['Failed login from 5 different countries'],
          affectedAccounts: ['user@example.com']
        }
      ];

      const riskLevel = (service as any).calculateRiskLevel(indicators);
      expect(riskLevel).toBe(RiskLevel.CRITICAL);
    });
  });

  describe('Immediate Actions Generation', () => {
    test('should generate password change action for data breach', () => {
      const actions = service.getImmediateActions(CompromiseType.DATA_BREACH);
      
      const passwordChangeAction = actions.find(a => a.id === 'change-password-immediate');
      expect(passwordChangeAction).toBeDefined();
      expect(passwordChangeAction!.priority).toBe(ActionPriority.IMMEDIATE);
      expect(passwordChangeAction!.steps).toHaveLength(3);
      
      // Verify step structure
      expect(passwordChangeAction!.steps[0].title).toBe('Access Account Settings');
      expect(passwordChangeAction!.steps[1].title).toBe('Create Strong Password');
      expect(passwordChangeAction!.steps[2].title).toBe('Confirm Password Change');
    });

    test('should generate account activity review action', () => {
      const actions = service.getImmediateActions(CompromiseType.PHISHING);
      
      const activityAction = actions.find(a => a.id === 'check-account-activity');
      expect(activityAction).toBeDefined();
      expect(activityAction!.category).toBe(GuidanceCategory.IMMEDIATE_ACTIONS);
      expect(activityAction!.steps).toHaveLength(3);
    });

    test('should include secure other accounts action for credential stuffing', () => {
      const actions = service.getImmediateActions(CompromiseType.CREDENTIAL_STUFFING);
      
      const secureAccountsAction = actions.find(a => a.id === 'secure-other-accounts');
      expect(secureAccountsAction).toBeDefined();
      expect(secureAccountsAction!.priority).toBe(ActionPriority.URGENT);
      expect(secureAccountsAction!.estimatedTime).toBe('30-60 minutes');
    });

    test('should not include secure other accounts for weak password', () => {
      const actions = service.getImmediateActions(CompromiseType.WEAK_PASSWORD);
      
      const secureAccountsAction = actions.find(a => a.id === 'secure-other-accounts');
      expect(secureAccountsAction).toBeUndefined();
    });
  });

  describe('Guidance Session Management', () => {
    test('should create guidance session with proper structure', async () => {
      const userId = 'test-user-123';
      const indicators: CompromiseIndicator[] = [{
        type: CompromiseType.DATA_BREACH,
        description: 'Password found in breach',
        confidence: 90,
        source: 'security_scan',
        detectedAt: new Date(),
        evidence: ['Hash found in database'],
        affectedAccounts: [userId]
      }];

      const session = await service.assessPasswordCompromise(userId, indicators);

      expect(session.id).toMatch(/^PWD-\d+-[A-F0-9]+$/);
      expect(session.userId).toBe(userId);
      expect(session.riskLevel).toBeDefined();
      expect(session.recommendations.length).toBeGreaterThan(0);
      expect(session.status).toBe('active');
      expect(session.expiresAt).toBeInstanceOf(Date);
    });

    test('should emit guidanceSessionCreated event', async () => {
      const userId = 'test-user-456';
      const indicators: CompromiseIndicator[] = [{
        type: CompromiseType.PHISHING,
        description: 'Credentials entered on phishing site',
        confidence: 80,
        source: 'user_report',
        detectedAt: new Date(),
        evidence: ['Suspicious URL reported'],
        affectedAccounts: [userId]
      }];

      const eventPromise = new Promise((resolve) => {
        service.once('guidanceSessionCreated', resolve);
      });

      await service.assessPasswordCompromise(userId, indicators);
      
      const emittedSession = await eventPromise;
      expect(emittedSession).toBeDefined();
    });

    test('should prioritize recommendations correctly', async () => {
      const userId = 'test-user-789';
      const indicators: CompromiseIndicator[] = [{
        type: CompromiseType.MALWARE,
        description: 'Malware detected on device',
        confidence: 95,
        source: 'antivirus',
        detectedAt: new Date(),
        evidence: ['Keylogger detected'],
        affectedAccounts: [userId]
      }];

      const session = await service.assessPasswordCompromise(userId, indicators);
      
      // Verify recommendations are sorted by priority
      const priorities = session.recommendations.map(r => r.priority);
      const immediateCount = priorities.filter(p => p === ActionPriority.IMMEDIATE).length;
      const urgentCount = priorities.filter(p => p === ActionPriority.URGENT).length;
      
      expect(immediateCount).toBeGreaterThan(0);
      expect(urgentCount).toBeGreaterThan(0);
      
      // First recommendations should be highest priority
      expect(session.recommendations[0].priority).toBe(ActionPriority.IMMEDIATE);
    });
  });

  describe('MFA Recommendations', () => {
    test('should generate comprehensive MFA recommendation', () => {
      const mfaRec = (service as any).getMFARecommendation();
      
      expect(mfaRec.id).toBe('enable-mfa');
      expect(mfaRec.category).toBe(GuidanceCategory.MFA_SETUP);
      expect(mfaRec.priority).toBe(ActionPriority.URGENT);
      expect(mfaRec.steps).toHaveLength(3);
      
      // Verify MFA setup steps
      expect(mfaRec.steps[0].title).toBe('Choose MFA Method');
      expect(mfaRec.steps[1].title).toBe('Set Up Authenticator App');
      expect(mfaRec.steps[2].title).toBe('Complete MFA Setup');
      
      // Verify benefits and risks are documented
      expect(mfaRec.benefits.length).toBeGreaterThan(0);
      expect(mfaRec.risks.length).toBeGreaterThan(0);
    });
  });

  describe('Password Manager Recommendations', () => {
    test('should generate password manager setup recommendation', () => {
      const pwdMgrRec = (service as any).getPasswordManagerRecommendation();
      
      expect(pwdMgrRec.id).toBe('use-password-manager');
      expect(pwdMgrRec.category).toBe(GuidanceCategory.PASSWORD_MANAGEMENT);
      expect(pwdMgrRec.steps).toHaveLength(4);
      
      // Verify password manager setup steps
      expect(pwdMgrRec.steps[0].title).toBe('Choose Password Manager');
      expect(pwdMgrRec.steps[1].title).toBe('Install Browser Extension');
      expect(pwdMgrRec.steps[2].title).toBe('Import Existing Passwords');
      expect(pwdMgrRec.steps[3].title).toBe('Generate New Strong Passwords');
      
      // Import step should be optional
      expect(pwdMgrRec.steps[2].required).toBe(false);
      
      // Other steps should be required
      expect(pwdMgrRec.steps[0].required).toBe(true);
      expect(pwdMgrRec.steps[1].required).toBe(true);
      expect(pwdMgrRec.steps[3].required).toBe(true);
    });
  });

  describe('Progress Tracking', () => {
    test('should track action completion', async () => {
      const userId = 'progress-test-user';
      const indicators: CompromiseIndicator[] = [{
        type: CompromiseType.REUSED_PASSWORD,
        description: 'Same password used on multiple sites',
        confidence: 100,
        source: 'password_audit',
        detectedAt: new Date(),
        evidence: ['Password reuse detected'],
        affectedAccounts: [userId]
      }];

      const session = await service.assessPasswordCompromise(userId, indicators);
      const actionId = session.recommendations[0].id;
      
      const result = service.markActionCompleted(session.id, actionId);
      expect(result).toBe(true);
      
      const progress = service.getSessionProgress(session.id);
      expect(progress).toBeDefined();
      expect(progress!.completed).toBe(1);
      expect(progress!.percentage).toBeGreaterThan(0);
    });

    test('should emit actionCompleted event', async () => {
      const userId = 'event-test-user';
      const indicators: CompromiseIndicator[] = [{
        type: CompromiseType.WEAK_PASSWORD,
        description: 'Password too simple',
        confidence: 100,
        source: 'strength_checker',
        detectedAt: new Date(),
        evidence: ['Only 6 characters', 'No numbers'],
        affectedAccounts: [userId]
      }];

      const session = await service.assessPasswordCompromise(userId, indicators);
      const actionId = session.recommendations[0].id;
      
      const eventPromise = new Promise((resolve) => {
        service.once('actionCompleted', resolve);
      });

      service.markActionCompleted(session.id, actionId);
      
      const emittedData = await eventPromise;
      expect(emittedData).toHaveProperty('sessionId', session.id);
      expect(emittedData).toHaveProperty('actionId', actionId);
      expect(emittedData).toHaveProperty('progress');
    });

    test('should calculate progress correctly', async () => {
      const userId = 'calculation-test-user';
      const indicators: CompromiseIndicator[] = [{
        type: CompromiseType.SOCIAL_ENGINEERING,
        description: 'Credentials revealed through social engineering',
        confidence: 75,
        source: 'incident_report',
        detectedAt: new Date(),
        evidence: ['Employee reported fake IT call'],
        affectedAccounts: [userId]
      }];

      const session = await service.assessPasswordCompromise(userId, indicators);
      const totalActions = session.recommendations.length;
      
      // Complete half the actions
      const actionsToComplete = Math.floor(totalActions / 2);
      for (let i = 0; i < actionsToComplete; i++) {
        service.markActionCompleted(session.id, session.recommendations[i].id);
      }
      
      const progress = service.getSessionProgress(session.id);
      expect(progress!.completed).toBe(actionsToComplete);
      expect(progress!.total).toBe(totalActions);
      expect(progress!.percentage).toBe(Math.round((actionsToComplete / totalActions) * 100));
    });
  });

  describe('User Security Dashboard', () => {
    test('should generate security dashboard for user', () => {
      const userId = 'dashboard-test-user';
      
      const dashboard = service.getUserSecurityDashboard(userId);
      
      expect(dashboard).toHaveProperty('profile');
      expect(dashboard).toHaveProperty('activeSessions');
      expect(dashboard).toHaveProperty('recommendedActions');
      expect(dashboard).toHaveProperty('securityTips');
      
      expect(Array.isArray(dashboard.activeSessions)).toBe(true);
      expect(Array.isArray(dashboard.recommendedActions)).toBe(true);
      expect(Array.isArray(dashboard.securityTips)).toBe(true);
    });

    test('should provide personalized security tips based on risk score', () => {
      const lowRiskTips = (service as any).getSecurityTips(30);
      const highRiskTips = (service as any).getSecurityTips(80);
      
      expect(lowRiskTips.length).toBeGreaterThan(0);
      expect(highRiskTips.length).toBeGreaterThan(lowRiskTips.length);
      
      // High risk should include additional urgent tips
      expect(highRiskTips.some((tip: string) => tip.includes('elevated'))).toBe(true);
    });

    test('should include MFA recommendation for users without MFA', () => {
      const userProfile = {
        userId: 'no-mfa-user',
        riskScore: 40,
        mfaEnabled: false,
        passwordLastChanged: new Date(),
        recentBreaches: [],
        securityScore: 60,
        recommendations: []
      };

      const recommendations = (service as any).getPersonalizedRecommendations(userProfile);
      const mfaRec = recommendations.find((r: SecurityRecommendation) => r.id === 'enable-mfa');
      
      expect(mfaRec).toBeDefined();
    });
  });

  describe('Risk Score Calculation', () => {
    test('should calculate user risk score based on profile factors', () => {
      const highRiskProfile = {
        userId: 'high-risk-user',
        riskScore: 0,
        mfaEnabled: false,
        passwordLastChanged: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000), // 400 days ago
        recentBreaches: [
          {
            type: CompromiseType.DATA_BREACH,
            description: 'Recent breach',
            confidence: 90,
            source: 'breach_db',
            detectedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
            evidence: [],
            affectedAccounts: ['high-risk-user']
          }
        ],
        securityScore: 30,
        recommendations: []
      };

      const riskScore = (service as any).calculateUserRiskScore(highRiskProfile);
      
      expect(riskScore).toBeGreaterThan(50); // Should be high risk
      expect(riskScore).toBeLessThanOrEqual(100);
    });

    test('should calculate lower risk for secure profile', () => {
      const lowRiskProfile = {
        userId: 'low-risk-user',
        riskScore: 0,
        mfaEnabled: true,
        passwordLastChanged: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        recentBreaches: [],
        securityScore: 90,
        recommendations: []
      };

      const riskScore = (service as any).calculateUserRiskScore(lowRiskProfile);
      
      expect(riskScore).toBeLessThan(25); // Should be low risk
    });
  });

  describe('Monitoring Recommendations', () => {
    test('should generate basic monitoring for all risk levels', () => {
      const basicMonitoring = (service as any).getMonitoringRecommendations(RiskLevel.LOW);
      
      expect(basicMonitoring.length).toBeGreaterThan(0);
      const alertsRec = basicMonitoring.find((r: SecurityRecommendation) => 
        r.id === 'enable-security-alerts'
      );
      expect(alertsRec).toBeDefined();
    });

    test('should generate enhanced monitoring for high risk', () => {
      const highRiskMonitoring = (service as any).getMonitoringRecommendations(RiskLevel.HIGH);
      const lowRiskMonitoring = (service as any).getMonitoringRecommendations(RiskLevel.LOW);
      
      expect(highRiskMonitoring.length).toBeGreaterThan(lowRiskMonitoring.length);
      
      const creditMonitoring = highRiskMonitoring.find((r: SecurityRecommendation) => 
        r.id === 'credit-monitoring'
      );
      expect(creditMonitoring).toBeDefined();
    });
  });

  describe('Prevention Recommendations', () => {
    test('should generate security awareness training', () => {
      const preventionRecs = (service as any).getPreventionRecommendations();
      
      const trainingRec = preventionRecs.find((r: SecurityRecommendation) => 
        r.id === 'security-awareness-training'
      );
      expect(trainingRec).toBeDefined();
      expect(trainingRec.category).toBe(GuidanceCategory.PREVENTION);
      expect(trainingRec.steps.length).toBeGreaterThan(0);
    });

    test('should generate regular security checkup recommendation', () => {
      const preventionRecs = (service as any).getPreventionRecommendations();
      
      const checkupRec = preventionRecs.find((r: SecurityRecommendation) => 
        r.id === 'regular-security-checkups'
      );
      expect(checkupRec).toBeDefined();
      expect(checkupRec.priority).toBe(ActionPriority.LOW);
      expect(checkupRec.estimatedTime).toBe('15 minutes monthly');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle empty indicators gracefully', () => {
      const riskLevel = (service as any).calculateRiskLevel([]);
      expect(riskLevel).toBe(RiskLevel.LOW);
    });

    test('should handle invalid session ID', () => {
      const result = service.markActionCompleted('invalid-session', 'some-action');
      expect(result).toBe(false);
      
      const progress = service.getSessionProgress('invalid-session');
      expect(progress).toBeNull();
    });

    test('should handle duplicate action completion', async () => {
      const userId = 'duplicate-test-user';
      const indicators: CompromiseIndicator[] = [{
        type: CompromiseType.WEAK_PASSWORD,
        description: 'Test weak password',
        confidence: 100,
        source: 'test',
        detectedAt: new Date(),
        evidence: [],
        affectedAccounts: [userId]
      }];

      const session = await service.assessPasswordCompromise(userId, indicators);
      const actionId = session.recommendations[0].id;
      
      // Complete action twice
      const result1 = service.markActionCompleted(session.id, actionId);
      const result2 = service.markActionCompleted(session.id, actionId);
      
      expect(result1).toBe(true);
      expect(result2).toBe(true); // Should still return true
      
      const progress = service.getSessionProgress(session.id);
      expect(progress!.completed).toBe(1); // Should only count once
    });
  });

  describe('Session ID Generation', () => {
    test('should generate unique session IDs', () => {
      const id1 = (service as any).generateSessionId();
      const id2 = (service as any).generateSessionId();
      
      expect(id1).toMatch(/^PWD-\d+-[A-F0-9]+$/);
      expect(id2).toMatch(/^PWD-\d+-[A-F0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('Recommendation Prioritization', () => {
    test('should prioritize immediate actions first', () => {
      const recommendations: SecurityRecommendation[] = [
        {
          id: 'low-priority',
          title: 'Low Priority Action',
          description: 'Test',
          category: GuidanceCategory.PREVENTION,
          priority: ActionPriority.LOW,
          estimatedTime: '5 min',
          difficulty: 'easy',
          steps: [],
          benefits: [],
          risks: []
        },
        {
          id: 'immediate-action',
          title: 'Immediate Action',
          description: 'Test',
          category: GuidanceCategory.IMMEDIATE_ACTIONS,
          priority: ActionPriority.IMMEDIATE,
          estimatedTime: '1 min',
          difficulty: 'easy',
          steps: [],
          benefits: [],
          risks: []
        }
      ];

      const prioritized = (service as any).prioritizeRecommendations(
        recommendations, 
        RiskLevel.HIGH
      );

      expect(prioritized[0].id).toBe('immediate-action');
      expect(prioritized[1].id).toBe('low-priority');
    });
  });
});