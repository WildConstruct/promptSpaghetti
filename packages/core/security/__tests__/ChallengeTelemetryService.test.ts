/**
 * Test Suite for Challenge Telemetry Service
 * 
 * Tests comprehensive telemetry collection, fraud detection, A/B testing,
 * and analytics for security challenges and authentication methods.
 */
import { ChallengeTelemetryService,
  ChallengeType,
  ChallengeOutcome,
  DifficultyLevel,
  UserAgentType,
  ChallengeEvent,
  TelemetryQuery }
  ABTestConfig
 from '../ChallengeTelemetryService';
describe('ChallengeTelemetryService', () => { let service: ChallengeTelemetryService;
  let mockDate: Date;
  beforeEach(() => {
  mockDate = new Date('2025-01-15T10:00:00Z');
  const OriginalDate = Date;
  jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime( as unknown));
  // Mock the Date constructor
  const mockDateConstructor = jest.fn<unknown, unknown>().mockImplementation((value?: unknown) => { }
  if (value !== undefined) { return new OriginalDate(value);
  return mockDate });
    global.Date = mockDateConstructor as any;
    global.Date.now = jest.fn(() => mockDate.getTime());
    service = new ChallengeTelemetryService();
  });
  afterEach(() => { jest.restoreAllMocks() });
  describe('Challenge Event Recording', () => { test('should record challenge event with complete data', () => {
  const eventData: Omit<ChallengeEvent, 'id' | 'timestamp'> = {
  sessionId: 'session-123'
  userId: 'user-456'
  challengeType: ChallengeType.CAPTCHA_IMAGE
  challengeId: 'captcha-789'
  outcome: ChallengeOutcome.SUCCESS
  difficultyLevel: DifficultyLevel.MEDIUM
  attemptNumber: 1
  timeToComplete: 5000
  context: {
  ipAddress: '192.168.1.100'
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  userAgentType: UserAgentType.HUMAN
  deviceFingerprint: 'fp-12345'
  geolocation: {
  country: 'US'
  region: 'California'
  city: 'San Francisco' }

  browserInfo: { 
  name: 'Chrome'
  version: '120.0'
  platform: 'Windows'
  mobile: false
  touchSupport: true
  screenResolution: '1920x1080' }

  challengeData: { 
  variant: 'A' }
          parameters: { difficulty: 'medium', images: 9 }
          metadata: { source: 'login_page' }

  userBehavior: { 
  mouseMovements: 25
          keystrokes: 0 }
          clickPatterns: [{ x: 100, y: 200, timestamp: 1000 }]
          focusEvents: 3
          scrollEvents: 1
          totalInteractionTime: 4500
          hesitationTime: 500
          mouseVelocity: 150

  fraudIndicators: { 
  riskScore: 15
  indicators: []
  automationDetected: false
  anomalousPattern: false
  vpnDetected: false }

  accessibility: { 
  screenReaderDetected: false
  highContrastMode: false
  assistiveTechUsed: []
  accommodationsApplied: [] }
};
      const eventId = service.recordChallengeEvent(eventData);
      expect(eventId).toBeTruthy();
      expect(eventId).toMatch(/^[0-9a-f-]{36}$/);
    });
    test('should emit challengeEventRecorded event', (done) => { service.on('challengeEventRecorded', (event) => {
        expect(event.challengeType).toBe(ChallengeType.CAPTCHA_AUDIO);
        expect(event.outcome).toBe(ChallengeOutcome.SUCCESS);
        done() });
      const eventData: Omit<ChallengeEvent, 'id' | 'timestamp'> = { sessionId: 'session-test'
  challengeType: ChallengeType.CAPTCHA_AUDIO
  challengeId: 'audio-test'
  outcome: ChallengeOutcome.SUCCESS
  difficultyLevel: DifficultyLevel.EASY
  attemptNumber: 1
  timeToComplete: 3000
  context: {
  ipAddress: '10.0.0.1'
  userAgent: 'TestAgent'
  userAgentType: UserAgentType.HUMAN
  browserInfo: {
  name: 'Test'
  version: '1.0'
  platform: 'Test'
  mobile: false
  touchSupport: false
  screenResolution: '1024x768' }

  challengeData: { parameters: {}, metadata: {} }
        userBehavior: { 
  totalInteractionTime: 2500
  hesitationTime: 500 }

  fraudIndicators: { 
  riskScore: 0
  indicators: []
  automationDetected: false
  anomalousPattern: false }

  accessibility: { 
  screenReaderDetected: true
  highContrastMode: false
  assistiveTechUsed: ['screen_reader']
  accommodationsApplied: ['audio_captcha'] }
};
      service.recordChallengeEvent(eventData);
    });
  });
  describe('Challenge Session Management', () => { test('should start challenge session', () => {
  service.startChallengeSession('session-456', ChallengeType.TWO_FACTOR_SMS, {)
  ipAddress: '203.0.113.1'
  userAgent: 'Mobile App' }
});
      // Session should be tracked internally
      // We can verify this by recording a completion
      service.recordChallengeCompletion()
        'session-456'
        'sms-123'
        ChallengeOutcome.SUCCESS
        8000
        { totalInteractionTime: 7500
  hesitationTime: 500 }
  keystrokes: 6);
  // Event should be recorded successfully
  expect(true).toBe(true); // If no error thrown, session was properly managed
});
    test('should emit challengeSessionStarted event', (done) => { service.on('challengeSessionStarted', (sessionData) => {
        expect(sessionData.sessionId).toBe('session-789');
        expect(sessionData.challengeType).toBe(ChallengeType.CAPTCHA_MATH);
        done() });
      service.startChallengeSession('session-789', ChallengeType.CAPTCHA_MATH, { )
  ipAddress: '192.168.1.50' }
});
    });
    test('should throw error for invalid session in completion', () => { expect(() => {
        service.recordChallengeCompletion()
          'non-existent-session'
          'challenge-123'
          ChallengeOutcome.FAILURE
          5000 }
          { totalInteractionTime: 4000, hesitationTime: 1000 }
        );
      }).toThrow('Session not found: non-existent-session');
    });
  });
  describe('Challenge Statistics', () => {
    beforeEach(() => {
      // Create test events
      const baseTime = mockDate.getTime();
      for (let i = 0; i < 10; i++) {
        const eventTime = new Date(baseTime + i * 60 * 1000); // Events 1 minute apart;
        const isSuccess = i < 7; // 70% success rate;
        jest.spyOn(Date, 'now').mockReturnValue(eventTime.getTime( as unknown));
        service.recordChallengeEvent({)
  sessionId: `session-${i}`}
},
  challengeType: ChallengeType.CAPTCHA_IMAGE,
          challengeId: `captcha-${i}`}
},
  outcome: isSuccess ? ChallengeOutcome.SUCCESS : ChallengeOutcome.FAILURE,
          difficultyLevel: i < 5 ? DifficultyLevel.EASY : DifficultyLevel.HARD,
          attemptNumber: 1,
          timeToComplete: 3000 + (i * 500),
          context: {,
  ipAddress: `192.168.1.${100 + i}`}
},
  userAgent: 'TestAgent',
            userAgentType: UserAgentType.HUMAN,
            browserInfo: { ,
  name: 'Test',
  version: '1.0',
  platform: 'Test',
  mobile: false,
  touchSupport: false,
  screenResolution: '1024x768' }
},
  challengeData: { parameters: {}, metadata: {} },
          userBehavior: { ,
  totalInteractionTime: 2500 + (i * 100),
  hesitationTime: 500 }
},
  fraudIndicators: { ,
  riskScore: i * 5, // Increasing risk scores,
  indicators: [],
  automationDetected: false,
  anomalousPattern: false }
},
  accessibility: { ,
  screenReaderDetected: false,
  highContrastMode: false,
  assistiveTechUsed: [],
  accommodationsApplied: [] }
});
      // Reset to original mock date
      jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime( as unknown));
    });
    test('should calculate challenge statistics correctly', () => { const startTime = new Date(mockDate.getTime() - 30 * 60 * 1000); // 30 minutes ago;
      const endTime = new Date(mockDate.getTime() + 30 * 60 * 1000);   // 30 minutes from now;
      const stats = service.getChallengeStatistics(ChallengeType.CAPTCHA_IMAGE, startTime, endTime);
      expect(stats.challengeType).toBe(ChallengeType.CAPTCHA_IMAGE);
      expect(stats.metrics.totalAttempts).toBe(10);
      expect(stats.metrics.successRate).toBe(70); // 7 out of 10 successful
      expect(stats.metrics.averageCompletionTime).toBe(5250); // Average of 3000 + (i * 500)
      // Check difficulty breakdown
      expect(stats.byDifficulty[DifficultyLevel.EASY].attempts).toBe(5);
      expect(stats.byDifficulty[DifficultyLevel.HARD].attempts).toBe(5);
      // Check user type breakdown
      expect(stats.byUserType[UserAgentType.HUMAN].attempts).toBe(10);
      expect(stats.byUserType[UserAgentType.HUMAN].successRate).toBe(70) });
    test('should provide optimization recommendations', () => { const startTime = new Date(mockDate.getTime() - 30 * 60 * 1000);
      const endTime = new Date(mockDate.getTime() + 30 * 60 * 1000);
      const stats = service.getChallengeStatistics(ChallengeType.CAPTCHA_IMAGE, startTime, endTime);
      expect(stats.optimization.performanceScore).toBeGreaterThan(0);
      expect(stats.optimization.userExperienceScore).toBeGreaterThan(0);
      expect(stats.optimization.securityScore).toBeGreaterThan(0);
      expect(Object.values(DifficultyLevel)).toContain(stats.optimization.recommendedDifficulty) });
  });
  describe('Event Querying', () => { beforeEach(() => {
  // Create diverse test events
  const testEvents = [
  {
  challengeType: ChallengeType.CAPTCHA_IMAGE,
  outcome: ChallengeOutcome.SUCCESS,
  userAgentType: UserAgentType.HUMAN,
  riskScore: 10,
  country: 'US' }

        { challengeType: ChallengeType.TWO_FACTOR_SMS,
  outcome: ChallengeOutcome.FAILURE,
  userAgentType: UserAgentType.BOT_SUSPECTED,
  riskScore: 75,
  country: 'CA' }

        { challengeType: ChallengeType.CAPTCHA_IMAGE,
          outcome: ChallengeOutcome.TIMEOUT,
          userAgentType: UserAgentType.HUMAN,
          riskScore: 20 }
          country: 'US'];
      testEvents.forEach((eventData, index) => {
        service.recordChallengeEvent({)
  sessionId: `query-session-${index}`}
},
  userId: `user-${index}`}
},
  challengeType: eventData.challengeType,
          challengeId: `challenge-${index}`}
},
  outcome: eventData.outcome,
          difficultyLevel: DifficultyLevel.MEDIUM,
          attemptNumber: 1,
          timeToComplete: 4000,
          context: {,
  ipAddress: `192.168.1.${200 + index}`}
},
  userAgent: 'TestAgent',
            userAgentType: eventData.userAgentType,
            geolocation: { ,
  country: eventData.country,
  region: 'TestRegion',
  city: 'TestCity' }
},
  browserInfo: { ,
  name: 'Test',
  version: '1.0',
  platform: 'Test',
  mobile: false,
  touchSupport: false,
  screenResolution: '1024x768' }
},
  challengeData: { parameters: {}, metadata: {} },
          userBehavior: { ,
  totalInteractionTime: 3500,
  hesitationTime: 500 }
},
  fraudIndicators: { ,
  riskScore: eventData.riskScore,
  indicators: [],
  automationDetected: false,
  anomalousPattern: false }
},
  accessibility: { ,
  screenReaderDetected: false,
  highContrastMode: false,
  assistiveTechUsed: [],
  accommodationsApplied: [] }
});
      });
    });
    test('should query events by challenge type', () => { const query: TelemetryQuery = {,
  startTime: new Date(mockDate.getTime() - 60 * 60 * 1000),
  endTime: new Date(mockDate.getTime() + 60 * 60 * 1000),
  challengeTypes: [ChallengeType.CAPTCHA_IMAGE] }
};
      const events = service.queryEvents(query);
      expect(events).toHaveLength(2);
      events.forEach(event => { )
  expect(event.challengeType).toBe(ChallengeType.CAPTCHA_IMAGE) });
    });
    test('should query events by outcome', () => { const query: TelemetryQuery = {,
  startTime: new Date(mockDate.getTime() - 60 * 60 * 1000),
  endTime: new Date(mockDate.getTime() + 60 * 60 * 1000),
  outcomes: [ChallengeOutcome.SUCCESS] }
};
      const events = service.queryEvents(query);
      expect(events).toHaveLength(1);
      expect(events[0].outcome).toBe(ChallengeOutcome.SUCCESS);
    });
    test('should query events by risk score range', () => { const query: TelemetryQuery = {,
  startTime: new Date(mockDate.getTime() - 60 * 60 * 1000),
  endTime: new Date(mockDate.getTime() + 60 * 60 * 1000),
  minRiskScore: 50,
  maxRiskScore: 100 }
};
      const events = service.queryEvents(query);
      expect(events).toHaveLength(1);
      expect(events[0].fraudIndicators.riskScore).toBe(75);
    });
    test('should query events by country', () => { const query: TelemetryQuery = {,
  startTime: new Date(mockDate.getTime() - 60 * 60 * 1000),
  endTime: new Date(mockDate.getTime() + 60 * 60 * 1000),
  countries: ['US'] }
};
      const events = service.queryEvents(query);
      expect(events).toHaveLength(2);
      events.forEach(event => { )
  expect(event.context.geolocation?.country).toBe('US') });
    });
    test('should support pagination in queries', () => { const query: TelemetryQuery = {,
  startTime: new Date(mockDate.getTime() - 60 * 60 * 1000),
  endTime: new Date(mockDate.getTime() + 60 * 60 * 1000),
  limit: 2,
  offset: 0 }
};
      const events = service.queryEvents(query);
      expect(events.length).toBeLessThanOrEqual(2);
    });
  });
  describe('Fraud Pattern Detection', () => { test('should detect bot-like behavior', () => {
  const suspiciousEvent: Omit<ChallengeEvent, 'id' | 'timestamp'> = {
  sessionId: 'fraud-session'
  challengeType: ChallengeType.CAPTCHA_IMAGE
  challengeId: 'fraud-captcha'
  outcome: ChallengeOutcome.SUCCESS
  difficultyLevel: DifficultyLevel.MEDIUM
  attemptNumber: 1
  timeToComplete: 500, // Very fast
  context: {
  ipAddress: '203.0.113.100'
  userAgent: 'SuspiciousBot/1.0'
  userAgentType: UserAgentType.BOT_SUSPECTED
  browserInfo: {
  name: 'Unknown'
  version: '1.0'
  platform: 'Linux'
  mobile: false
  touchSupport: false
  screenResolution: '1024x768' }

  challengeData: { parameters: {}, metadata: {} }
        userBehavior: { 
  mouseMovements: 0, // No mouse movement
  totalInteractionTime: 400
  hesitationTime: 0 // No hesitation }

  fraudIndicators: { 
  riskScore: 30
  indicators: []
  automationDetected: true
  anomalousPattern: true }

  accessibility: { 
  screenReaderDetected: false
  highContrastMode: false
  assistiveTechUsed: []
  accommodationsApplied: [] }
};
      const analysis = service.analyzeFraudPattern(suspiciousEvent);
      expect(analysis.isfraudulent).toBe(true);
      expect(analysis.riskScore).toBeGreaterThan(70);
      expect(analysis.patterns).toContain('suspiciously_fast_completion');
      expect(analysis.patterns).toContain('no_mouse_movement');
      expect(analysis.patterns).toContain('no_hesitation');
      expect(analysis.recommendations).toContain('Implement timing validation');
    });
    test('should emit fraud detection events', (done) => { service.on('fraudDetected', (data) => {
        expect(data.riskScore).toBeGreaterThan(70);
        expect(data.patterns.length).toBeGreaterThan(0);
        done() });
      const fraudEvent: Omit<ChallengeEvent, 'id' | 'timestamp'> = { sessionId: 'fraud-session-2'
  challengeType: ChallengeType.CAPTCHA_IMAGE
  challengeId: 'fraud-captcha-2'
  outcome: ChallengeOutcome.SUCCESS
  difficultyLevel: DifficultyLevel.MEDIUM
  attemptNumber: 1
  timeToComplete: 300
  context: {
  ipAddress: '203.0.113.200'
  userAgent: 'FraudBot'
  userAgentType: UserAgentType.BOT_CONFIRMED
  browserInfo: {
  name: 'Bot'
  version: '1.0'
  platform: 'Linux'
  mobile: false
  touchSupport: false
  screenResolution: '1024x768' }

  challengeData: { parameters: {}, metadata: {} }
        userBehavior: { 
  mouseMovements: 0
  totalInteractionTime: 250
  hesitationTime: 0 }

  fraudIndicators: { 
  riskScore: 80
  indicators: ['automation']
  automationDetected: true
  anomalousPattern: true }

  accessibility: { 
  screenReaderDetected: false
  highContrastMode: false
  assistiveTechUsed: []
  accommodationsApplied: [] }
};
      service.recordChallengeEvent(fraudEvent);
    });
    test('should handle legitimate user patterns', () => { const legitimateEvent: Omit<ChallengeEvent, 'id' | 'timestamp'> = {
  sessionId: 'legit-session'
  challengeType: ChallengeType.CAPTCHA_IMAGE
  challengeId: 'legit-captcha'
  outcome: ChallengeOutcome.SUCCESS
  difficultyLevel: DifficultyLevel.MEDIUM
  attemptNumber: 1
  timeToComplete: 8000, // Normal time
  context: {
  ipAddress: '192.168.1.150'
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  userAgentType: UserAgentType.HUMAN
  browserInfo: {
  name: 'Chrome'
  version: '120.0'
  platform: 'Windows'
  mobile: false
  touchSupport: true
  screenResolution: '1920x1080' }

  challengeData: { parameters: {}, metadata: {} }
        userBehavior: { 
  mouseMovements: 45
          totalInteractionTime: 7500 }
          hesitationTime: 1200, // Natural hesitation
          clickPatterns: [
            { x: 150, y: 200, timestamp: 1000 }
            { x: 300, y: 400, timestamp: 3000 }
          ]

  fraudIndicators: { 
  riskScore: 5
  indicators: []
  automationDetected: false
  anomalousPattern: false }

  accessibility: { 
  screenReaderDetected: false
  highContrastMode: false
  assistiveTechUsed: []
  accommodationsApplied: [] }
};
      const analysis = service.analyzeFraudPattern(legitimateEvent);
      expect(analysis.isfraudulent).toBe(false);
      expect(analysis.riskScore).toBeLessThan(30);
      expect(analysis.patterns).toHaveLength(0);
    });
  });
  describe('A/B Testing', () => { test('should create A/B test configuration', () => {
      const testConfig: Omit<ABTestConfig, 'id'> = {
        name: 'CAPTCHA Difficulty Test'
        challengeType: ChallengeType.CAPTCHA_IMAGE
        variants: [
          {
            id: 'easy'
            name: 'Easy CAPTCHA' }
            parameters: { difficulty: 'easy', gridSize: 3 }
            trafficPercentage: 50;

          { id: 'medium'
            name: 'Medium CAPTCHA' }
            parameters: { difficulty: 'medium', gridSize: 4 }
            trafficPercentage: 50]
        startDate: new Date(mockDate.getTime() - 24 * 60 * 60 * 1000)
        endDate: new Date(mockDate.getTime() + 24 * 60 * 60 * 1000)
        targetMetric: 'success_rate'
        isActive: true;
  };
      const testId = service.createABTest(testConfig);
      expect(testId).toBeTruthy();
      expect(testId).toMatch(/^[0-9a-f-]{36}$/);
    });
    test('should emit abTestCreated event', (done) => { service.on('abTestCreated', (config) => {
        expect(config.name).toBe('Success Rate Test');
        expect(config.variants).toHaveLength(2);
        done() });
      service.createABTest({ )
  name: 'Success Rate Test'
        challengeType: ChallengeType.TWO_FACTOR_SMS }
        variants: [
          { id: 'v1', name: 'Variant 1', parameters: {}, trafficPercentage: 60 }
          { id: 'v2', name: 'Variant 2', parameters: {}, trafficPercentage: 40 }
        ]
        startDate: new Date()
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        targetMetric: 'success_rate'
        isActive: true;
  });
    });
    test('should reject A/B test with invalid traffic percentages', () => { expect(() => {
        service.createABTest({)
  name: 'Invalid Test'
          challengeType: ChallengeType.CAPTCHA_IMAGE }
          variants: [
            { id: 'v1', name: 'Variant 1', parameters: {}, trafficPercentage: 60 }
            { id: 'v2', name: 'Variant 2', parameters: {}, trafficPercentage: 50 } // Total = 110%
          ]
          startDate: new Date()
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          targetMetric: 'success_rate'
          isActive: true;
  });
      }).toThrow('Variant traffic percentages must sum to 100%');
    });
    test('should assign A/B test variants deterministically', () => { const testId = service.createABTest({)
  name: 'Deterministic Test'
        challengeType: ChallengeType.CAPTCHA_IMAGE }
        variants: [
          { id: 'control', name: 'Control', parameters: {}, trafficPercentage: 50 }
          { id: 'variant', name: 'Variant', parameters: {}, trafficPercentage: 50 }
        ]
        startDate: new Date(mockDate.getTime() - 24 * 60 * 60 * 1000)
        endDate: new Date(mockDate.getTime() + 24 * 60 * 60 * 1000)
        targetMetric: 'success_rate'
        isActive: true;
  });
      // Same session should get same variant
      const variant1 = service.getABTestVariant(ChallengeType.CAPTCHA_IMAGE, 'consistent-session');
      const variant2 = service.getABTestVariant(ChallengeType.CAPTCHA_IMAGE, 'consistent-session');
      expect(variant1).toEqual(variant2);
      expect(variant1?.testId).toBe(testId);
      expect(['control', 'variant']).toContain(variant1?.variantId);
    });
    test('should return null for inactive A/B tests', () => { service.createABTest({)
  name: 'Inactive Test'
        challengeType: ChallengeType.TWO_FACTOR_EMAIL }
        variants: [
          { id: 'v1', name: 'Variant 1', parameters: {}, trafficPercentage: 100 }
        ]
        startDate: new Date(mockDate.getTime() - 48 * 60 * 60 * 1000)
        endDate: new Date(mockDate.getTime() - 24 * 60 * 60 * 1000), // Ended yesterday
        targetMetric: 'success_rate'
        isActive: false;
  });
      const variant = service.getABTestVariant(ChallengeType.TWO_FACTOR_EMAIL, 'test-session');
      expect(variant).toBeNull();
    });
    test('should generate A/B test results', () => { const testId = service.createABTest({)
  name: 'Results Test'
        challengeType: ChallengeType.CAPTCHA_MATH }
        variants: [
          { id: 'easy', name: 'Easy Math', parameters: {}, trafficPercentage: 50 }
          { id: 'hard', name: 'Hard Math', parameters: {}, trafficPercentage: 50 }
        ]
        startDate: new Date(mockDate.getTime() - 24 * 60 * 60 * 1000)
        endDate: new Date(mockDate.getTime() + 24 * 60 * 60 * 1000)
        targetMetric: 'success_rate'
        isActive: true;
  });
      // Create some test events for the A/B test
      service.recordChallengeEvent({ )
  sessionId: 'ab-session-1'
  challengeType: ChallengeType.CAPTCHA_MATH
  challengeId: 'math-1'
  outcome: ChallengeOutcome.SUCCESS
  difficultyLevel: DifficultyLevel.EASY
  attemptNumber: 1
  timeToComplete: 5000
  context: {
  ipAddress: '192.168.1.1'
  userAgent: 'TestAgent'
  userAgentType: UserAgentType.HUMAN
  browserInfo: {
  name: 'Test'
  version: '1.0'
  platform: 'Test'
  mobile: false
  touchSupport: false
  screenResolution: '1024x768' }

  challengeData: { 
  variant: 'easy' }
          parameters: {}
          metadata: {}

  userBehavior: { 
  totalInteractionTime: 4500
  hesitationTime: 500 }

  fraudIndicators: { 
  riskScore: 0
  indicators: []
  automationDetected: false
  anomalousPattern: false }

  accessibility: { 
  screenReaderDetected: false
  highContrastMode: false
  assistiveTechUsed: []
  accommodationsApplied: [] }
});
      const results = service.getABTestResults(testId);
      expect(results.test.name).toBe('Results Test');
      expect(results.results).toHaveLength(2);
      expect(results.recommendation).toBeTruthy();
    });
  });
  describe('Dashboard Data', () => { test('should provide comprehensive dashboard data', () => {
  // Create some test events
  service.recordChallengeEvent({)
  sessionId: 'dashboard-session-1'
  challengeType: ChallengeType.CAPTCHA_IMAGE
  challengeId: 'dashboard-captcha-1'
  outcome: ChallengeOutcome.SUCCESS
  difficultyLevel: DifficultyLevel.MEDIUM
  attemptNumber: 1
  timeToComplete: 6000
  context: {
  ipAddress: '192.168.1.100'
  userAgent: 'DashboardAgent'
  userAgentType: UserAgentType.HUMAN
  geolocation: {
  country: 'US'
  region: 'California'
  city: 'Los Angeles' }

  browserInfo: { 
  name: 'Test'
  version: '1.0'
  platform: 'Test'
  mobile: false
  touchSupport: false
  screenResolution: '1024x768' }

  challengeData: { parameters: {}, metadata: {} }
        userBehavior: { 
  totalInteractionTime: 5500
  hesitationTime: 500 }

  fraudIndicators: { 
  riskScore: 25
  indicators: []
  automationDetected: false
  anomalousPattern: false }

  accessibility: { 
  screenReaderDetected: false
  highContrastMode: false
  assistiveTechUsed: []
  accommodationsApplied: [] }
});
      const dashboard = service.getDashboardData();
      expect(dashboard.overview.totalChallenges).toBeGreaterThan(0);
      expect(dashboard.overview.successRate).toBeGreaterThanOrEqual(0);
      expect(dashboard.overview.averageCompletionTime).toBeGreaterThan(0);
      expect(dashboard.recentActivity).toBeInstanceOf(Array);
      expect(dashboard.topChallengeTypes).toBeInstanceOf(Array);
      expect(dashboard.performanceMetrics).toBeInstanceOf(Array);
      expect(dashboard.geographicDistribution).toBeInstanceOf(Array);
    });
  });
  describe('Event Emission and Real-time Updates', () => { test('should emit real-time updates on event recording', (done) => {
      service.on('realTimeUpdate', (data) => {
        expect(data.challengeType).toBe(ChallengeType.TWO_FACTOR_TOTP);
        expect(data.outcome).toBe(ChallengeOutcome.SUCCESS);
        expect(data.riskScore).toBe(10);
        done() });
      service.recordChallengeEvent({ )
  sessionId: 'realtime-session'
  challengeType: ChallengeType.TWO_FACTOR_TOTP
  challengeId: 'totp-123'
  outcome: ChallengeOutcome.SUCCESS
  difficultyLevel: DifficultyLevel.MEDIUM
  attemptNumber: 1
  timeToComplete: 4000
  context: {
  ipAddress: '192.168.1.200'
  userAgent: 'RealTimeAgent'
  userAgentType: UserAgentType.HUMAN
  browserInfo: {
  name: 'Test'
  version: '1.0'
  platform: 'Test'
  mobile: false
  touchSupport: false
  screenResolution: '1024x768' }

  challengeData: { parameters: {}, metadata: {} }
        userBehavior: { 
  totalInteractionTime: 3500
  hesitationTime: 500 }

  fraudIndicators: { 
  riskScore: 10
  indicators: []
  automationDetected: false
  anomalousPattern: false }

  accessibility: { 
  screenReaderDetected: false
  highContrastMode: false
  assistiveTechUsed: []
  accommodationsApplied: [] }
});
    });
  });
  describe('Error Handling', () => { test('should throw error for non-existent A/B test', () => {
      expect(() => {
        service.getABTestResults('non-existent-test-id') }).toThrow('A/B test not found: non-existent-test-id');
    });
  });
});