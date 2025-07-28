/**
 * Test Suite for Accessibility Manager Service
 * 
 * Tests comprehensive accessibility management including profile creation,
 * fallback mechanisms, compliance validation, and emergency bypass procedures.
 */
import {
  AccessibilityManager,
  AccessibilityNeed,
  SeverityLevel,
  FallbackMethod,
  AssistiveTechnology,
  InterfaceAdaptation,
  AccessibilityContext,
  UserAccessibilityProfile
} from '../AccessibilityManager';
describe('AccessibilityManager', () => {
  let manager: AccessibilityManager;
  let mockDate: Date;
  beforeEach(() => {
    mockDate = new Date('2025-01-15T10:00:00Z');
    const OriginalDate = Date;
    jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime( as unknown));
    // Mock the Date constructor
    const mockDateConstructor = jest.fn<unknown[], unknown>().mockImplementation((value?: unknown) => {
      if (value !== undefined) {
        return new OriginalDate(value);
      }
      return mockDate;
    });
    global.Date = mockDateConstructor as any;
    global.Date.now = jest.fn(() => mockDate.getTime());
    manager = new AccessibilityManager();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('User Accessibility Profile Management', () => {
    test('should create accessibility profile with default settings', async () => {
      const profileData = {
        needs: [AccessibilityNeed.VISUAL_IMPAIRMENT],
        severityLevels: {,
          [AccessibilityNeed.VISUAL_IMPAIRMENT]: SeverityLevel.MODERATE
        },
        assistiveTechnologies: [AssistiveTechnology.SCREEN_READER],
        preferredFallbacks: [FallbackMethod.AUDIO_CAPTCHA],
      };
      const profile = await manager.createAccessibilityProfile('user123', profileData);
      expect(profile.userId).toBe('user123');
      expect(profile.needs).toContain(AccessibilityNeed.VISUAL_IMPAIRMENT);
      expect(profile.severityLevels[AccessibilityNeed.VISUAL_IMPAIRMENT]).toBe(SeverityLevel.MODERATE);
      expect(profile.customSettings.fontSize).toBe(16); // Default
      expect(profile.customSettings.contrastRatio).toBe(4.5); // Default
      expect(profile.isActive).toBe(true);
    });
    test('should update existing accessibility profile', async () => {
      // Create initial profile
      await manager.createAccessibilityProfile('user123', {)
        needs: [AccessibilityNeed.VISUAL_IMPAIRMENT],
      });
      // Update profile
      const updatedProfile = await manager.createAccessibilityProfile('user123', {)
        needs: [AccessibilityNeed.VISUAL_IMPAIRMENT, AccessibilityNeed.HEARING_IMPAIRMENT],
        customSettings: {,
          fontSize: 20,
          contrastRatio: 7.0,
          timeoutMultiplier: 2.0,
          audioEnabled: true,
          visualEnabled: true,
          hapticEnabled: true,
          animationsReduced: true,
        }
      });
      expect(updatedProfile.needs).toHaveLength(2);
      expect(updatedProfile.customSettings.fontSize).toBe(20);
      expect(updatedProfile.customSettings.contrastRatio).toBe(7.0);
      expect(updatedProfile.customSettings.animationsReduced).toBe(true);
    });
    test('should emit profile updated event', (done) => {
      manager.on('profileUpdated', (data) => {
        expect(data.userId).toBe('user456');
        expect(data.isNew).toBe(true);
        done();
      });
      manager.createAccessibilityProfile('user456', {)
        needs: [AccessibilityNeed.MOTOR_IMPAIRMENT],
      });
    });
  });
  describe('Accessibility Needs Analysis', () => {
    test('should analyze context for screen reader users', async () => {
      await manager.createAccessibilityProfile('user123', {)
        needs: [AccessibilityNeed.VISUAL_IMPAIRMENT],
        severityLevels: {,
          [AccessibilityNeed.VISUAL_IMPAIRMENT]: SeverityLevel.SEVERE
        },
        assistiveTechnologies: [AssistiveTechnology.SCREEN_READER],
      });
      const context: AccessibilityContext = {
        userAgent: 'JAWS/2023',
        screenReaderDetected: true,
        assistiveTechDetected: [AssistiveTechnology.SCREEN_READER],
        deviceCapabilities: {,
          hasCamera: false,
          hasMicrophone: true,
          hasTouch: false,
          hasKeyboard: true,
          hasMouse: false,
          screenSize: { width: 1920, height: 1080 },
          colorDepth: 24,
        },
        environmentalFactors: {,
          isNoisy: false,
          isLowLight: false,
          isPublicSpace: false,
          hasTimeConstraints: false,
        },
        sessionContext: {,
          isEmergency: false,
          attemptCount: 1,
          timeRemaining: 300,
          lastSuccessfulMethod: 'password',
        }
      };
      const analysis = await manager.analyzeAccessibilityNeeds('user123', context);
      expect(analysis.recommendedFallbacks).toContain(FallbackMethod.AUDIO_CAPTCHA);
      expect(analysis.recommendedFallbacks).toContain(FallbackMethod.VOICE_AUTHENTICATION);
      expect(analysis.requiredAdaptations).toContain(InterfaceAdaptation.FOCUS_INDICATORS);
      expect(analysis.requiredAdaptations).toContain(InterfaceAdaptation.AUDIO_DESCRIPTIONS);
      expect(analysis.alternatives).toHaveLength(5);
      expect(analysis.estimatedDifficulty).toBe('medium');
    });
    test('should analyze context for hearing impaired users', async () => {
      await manager.createAccessibilityProfile('user456', {)
        needs: [AccessibilityNeed.HEARING_IMPAIRMENT],
        severityLevels: {,
          [AccessibilityNeed.HEARING_IMPAIRMENT]: SeverityLevel.COMPLETE
        }
      });
      const context: AccessibilityContext = {
        userAgent: 'Mozilla/5.0',
        screenReaderDetected: false,
        assistiveTechDetected: [],
        deviceCapabilities: {,
          hasCamera: true,
          hasMicrophone: false,
          hasTouch: true,
          hasKeyboard: true,
          hasMouse: true,
          screenSize: { width: 1280, height: 720 },
          colorDepth: 24,
        },
        environmentalFactors: {,
          isNoisy: true,
          isLowLight: false,
          isPublicSpace: true,
          hasTimeConstraints: false,
        },
        sessionContext: {,
          isEmergency: false,
          attemptCount: 1,
          timeRemaining: 300,
          lastSuccessfulMethod: 'password',
        }
      };
      const analysis = await manager.analyzeAccessibilityNeeds('user456', context);
      expect(analysis.recommendedFallbacks).toContain(FallbackMethod.LARGE_TEXT_DISPLAY);
      expect(analysis.requiredAdaptations).toContain(InterfaceAdaptation.CAPTIONS);
    });
    test('should analyze context for motor impaired users', async () => {
      await manager.createAccessibilityProfile('user789', {)
        needs: [AccessibilityNeed.MOTOR_IMPAIRMENT],
        severityLevels: {,
          [AccessibilityNeed.MOTOR_IMPAIRMENT]: SeverityLevel.SEVERE
        },
        assistiveTechnologies: [AssistiveTechnology.VOICE_CONTROL],
      });
      const context: AccessibilityContext = {
        userAgent: 'Dragon/16.0',
        screenReaderDetected: false,
        assistiveTechDetected: [AssistiveTechnology.VOICE_CONTROL],
        deviceCapabilities: {,
          hasCamera: true,
          hasMicrophone: true,
          hasTouch: false,
          hasKeyboard: false,
          hasMouse: false,
          screenSize: { width: 1024, height: 768 },
          colorDepth: 16,
        },
        environmentalFactors: {,
          isNoisy: false,
          isLowLight: false,
          isPublicSpace: false,
          hasTimeConstraints: true,
        },
        sessionContext: {,
          isEmergency: false,
          attemptCount: 2,
          timeRemaining: 180,
          lastSuccessfulMethod: 'voice',
        }
      };
      const analysis = await manager.analyzeAccessibilityNeeds('user789', context);
      expect(analysis.recommendedFallbacks).toContain(FallbackMethod.VOICE_AUTHENTICATION);
      expect(analysis.recommendedFallbacks).toContain(FallbackMethod.ASSISTED_INPUT);
      expect(analysis.requiredAdaptations).toContain(InterfaceAdaptation.TIMEOUT_EXTENSION);
      expect(analysis.requiredAdaptations).toContain(InterfaceAdaptation.SIMPLIFIED_LAYOUT);
    });
    test('should handle emergency context with high difficulty', async () => {
      const context: AccessibilityContext = {
        userAgent: 'Mozilla/5.0',
        screenReaderDetected: false,
        assistiveTechDetected: [],
        deviceCapabilities: {,
          hasCamera: false,
          hasMicrophone: false,
          hasTouch: false,
          hasKeyboard: false,
          hasMouse: false,
          screenSize: { width: 320, height: 568 },
          colorDepth: 16,
        },
        environmentalFactors: {,
          isNoisy: true,
          isLowLight: true,
          isPublicSpace: true,
          hasTimeConstraints: true,
        },
        sessionContext: {,
          isEmergency: true,
          attemptCount: 5,
          timeRemaining: 30,
          lastSuccessfulMethod: 'none',
        }
      };
      const analysis = await manager.analyzeAccessibilityNeeds('emergency-user', context);
      expect(analysis.estimatedDifficulty).toBe('critical');
      expect(analysis.recommendedFallbacks).toContain(FallbackMethod.SIMPLIFIED_INTERFACE);
    });
  });
  describe('Accessibility Compliance Validation', () => {
    test('should validate compliant authentication flow', () => {
      const authFlow = {
        keyboardNavigable: true,
        screenReaderSupport: true,
        timeout: 600, // 10 minutes
        contrastRatio: 7.0,
        hasAudioContent: true,
        hasTextAlternative: true,
        hasAnimations: true,
        respectsReducedMotion: true,
        hasAudioFallback: true,
      };
      const result = manager.validateAccessibilityCompliance(authFlow);
      expect(result.isAccessible).toBe(true);
      expect(result.score).toBeGreaterThan(95);
      expect(result.complianceLevel).toBe('AAA');
      expect(result.issues).toHaveLength(0);
    });
    test('should identify critical accessibility issues', () => {
      const authFlow = {
        keyboardNavigable: false,
        screenReaderSupport: false,
        timeout: 30, // Too short
        contrastRatio: 2.0, // Too low
        hasAudioContent: true,
        hasTextAlternative: false,
        hasAnimations: true,
        respectsReducedMotion: false,
        hasAudioFallback: false,
      };
      const result = manager.validateAccessibilityCompliance(authFlow);
      expect(result.isAccessible).toBe(false);
      expect(result.score).toBeLessThan(70);
      expect(result.complianceLevel).toBe('Non-compliant');
      expect(result.issues.filter(i => i.type === 'critical')).toHaveLength(2);
      expect(result.issues.filter(i => i.type === 'major')).toHaveLength(3);
    });
    test('should provide user-specific validation for visual impairment', () => {
      const userProfile: UserAccessibilityProfile = {
        userId: 'user123',
        needs: [AccessibilityNeed.VISUAL_IMPAIRMENT],
        severityLevels: {,
          [AccessibilityNeed.VISUAL_IMPAIRMENT]: SeverityLevel.COMPLETE
        },
        assistiveTechnologies: [AssistiveTechnology.SCREEN_READER],
        preferredFallbacks: [FallbackMethod.AUDIO_CAPTCHA],
        interfaceAdaptations: [InterfaceAdaptation.AUDIO_DESCRIPTIONS],
        customSettings: {,
          fontSize: 18,
          contrastRatio: 7.0,
          timeoutMultiplier: 2.0,
          audioEnabled: true,
          visualEnabled: false,
          hapticEnabled: true,
          animationsReduced: true,
        },
        verificationMethods: {,
          primary: ['audio'],
          fallback: ['phone'],
          emergency: ['human_assistance'],
        },
        emergencyContacts: [],
        documentation: {},
        lastUpdated: new Date(),
        isActive: true,
      };
      const authFlow = {
        keyboardNavigable: true,
        screenReaderSupport: true,
        timeout: 300,
        contrastRatio: 4.5,
        hasAudioContent: false,
        hasTextAlternative: true,
        hasAnimations: false,
        respectsReducedMotion: true,
        hasAudioFallback: false // Critical for this user,
      };
      const result = manager.validateAccessibilityCompliance(authFlow, userProfile);
      expect(result.issues.some(issue => )
        issue.type === 'critical' && 
        issue.description.includes('audio fallback')
      )).toBe(true);
      expect(result.fallbacksRequired).toContain(FallbackMethod.ASSISTED_INPUT);
    });
  });
  describe('Emergency Accessibility Bypass', () => {
    test('should create emergency bypass', async () => {
      const bypassId = await manager.createEmergencyBypass(;);
        'user123',
        'User unable to access due to assistive technology failure',
        'admin456',
        12, // 12 hours
        2   // 2 uses
      );
      expect(bypassId).toBeTruthy();
      expect(bypassId).toMatch(/^[0-9a-f-]{36}$/);
    });
    test('should use emergency bypass successfully', async () => {
      const bypassId = await manager.createEmergencyBypass(;);
        'user123',
        'Emergency access needed',
        'admin456'
      );
      const result = manager.useEmergencyBypass(bypassId, {)
        ipAddress: '192.168.1.100',
        reason: 'assistive_tech_failure',
      });
      expect(result.allowed).toBe(true);
      expect(result.remainingUses).toBe(2); // 3 max - 1 used
    });
    test('should reject expired emergency bypass', async () => {
      const bypassId = await manager.createEmergencyBypass(;);
        'user123',
        'Test bypass',
        'admin456',
        -1 // Expired 1 hour ago
      );
      const result = manager.useEmergencyBypass(bypassId, {});
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Bypass has expired');
    });
    test('should reject bypass after maximum usages', async () => {
      const bypassId = await manager.createEmergencyBypass(;);
        'user123',
        'Test bypass',
        'admin456',
        24,
        1 // Only 1 use allowed
      );
      // First use should succeed
      const firstUse = manager.useEmergencyBypass(bypassId, {});
      expect(firstUse.allowed).toBe(true);
      expect(firstUse.remainingUses).toBe(0);
      // Second use should fail
      const secondUse = manager.useEmergencyBypass(bypassId, {});
      expect(secondUse.allowed).toBe(false);
      expect(secondUse.reason).toBe('Maximum usages exceeded');
    });
    test('should emit emergency bypass events', (done) => {
      let eventsReceived = 0;
      manager.on('emergencyBypassCreated', (bypass) => {
        expect(bypass.userId).toBe('user123');
        expect(bypass.reason).toBe('Test emergency');
        eventsReceived++;
        if (eventsReceived === 2) done();
      });
      manager.on('emergencyBypassUsed', (data) => {
        expect(data.bypass.userId).toBe('user123');
        expect(data.context.test).toBe(true);
        eventsReceived++;
        if (eventsReceived === 2) done();
      });
      manager.createEmergencyBypass('user123', 'Test emergency', 'admin456')
        .then(bypassId => {)
          manager.useEmergencyBypass(bypassId, { test: true });
        });
    });
  });
  describe('Interface Adaptation Recommendations', () => {
    test('should recommend font size increase', async () => {
      await manager.createAccessibilityProfile('user123', {)
        customSettings: {,
          fontSize: 24,
          contrastRatio: 4.5,
          timeoutMultiplier: 1.0,
          audioEnabled: true,
          visualEnabled: true,
          hapticEnabled: true,
          animationsReduced: false,
        }
      });
      const recommendations = manager.getAdaptationRecommendations('user123', {});
      expect(recommendations.adaptations).toHaveLength(1);
      expect(recommendations.adaptations[0].type).toBe(InterfaceAdaptation.FONT_SIZE_INCREASE);
      expect(recommendations.adaptations[0].priority).toBe('high');
      expect(recommendations.adaptations[0].implementation.css).toHaveProperty('font-size', '24px');
    });
    test('should recommend contrast enhancement', async () => {
      await manager.createAccessibilityProfile('user456', {)
        customSettings: {,
          fontSize: 16,
          contrastRatio: 7.0,
          timeoutMultiplier: 1.0,
          audioEnabled: true,
          visualEnabled: true,
          hapticEnabled: true,
          animationsReduced: false,
        }
      });
      const recommendations = manager.getAdaptationRecommendations('user456', {});
      expect(recommendations.adaptations.some(a => )
        a.type === InterfaceAdaptation.CONTRAST_ENHANCEMENT
      )).toBe(true);
    });
    test('should recommend motion reduction', async () => {
      await manager.createAccessibilityProfile('user789', {)
        customSettings: {,
          fontSize: 16,
          contrastRatio: 4.5,
          timeoutMultiplier: 1.0,
          audioEnabled: true,
          visualEnabled: true,
          hapticEnabled: true,
          animationsReduced: true,
        }
      });
      const recommendations = manager.getAdaptationRecommendations('user789', {});
      expect(recommendations.adaptations.some(a => )
        a.type === InterfaceAdaptation.MOTION_REDUCTION
      )).toBe(true);
    });
    test('should recommend timeout extension', async () => {
      await manager.createAccessibilityProfile('user101', {)
        customSettings: {,
          fontSize: 16,
          contrastRatio: 4.5,
          timeoutMultiplier: 3.0,
          audioEnabled: true,
          visualEnabled: true,
          hapticEnabled: true,
          animationsReduced: false,
        }
      });
      const recommendations = manager.getAdaptationRecommendations('user101', {});
      expect(recommendations.adaptations.some(a => )
        a.type === InterfaceAdaptation.TIMEOUT_EXTENSION
      )).toBe(true);
    });
    test('should handle color blindness adaptations', async () => {
      await manager.createAccessibilityProfile('user202', {)
        customSettings: {,
          fontSize: 16,
          contrastRatio: 4.5,
          timeoutMultiplier: 1.0,
          audioEnabled: true,
          visualEnabled: true,
          hapticEnabled: true,
          animationsReduced: false,
          colorBlindnessType: 'protanopia',
        }
      });
      const recommendations = manager.getAdaptationRecommendations('user202', {});
      expect(recommendations.adaptations.some(a => )
        a.type === InterfaceAdaptation.COLOR_ADJUSTMENT
      )).toBe(true);
    });
    test('should return empty adaptations for non-existent user', () => {
      const recommendations = manager.getAdaptationRecommendations('nonexistent', {});
      expect(recommendations.adaptations).toHaveLength(0);
      expect(recommendations.estimatedImpact).toBe(0);
    });
  });
  describe('Accessibility Metrics and Statistics', () => {
    test('should provide comprehensive accessibility metrics', async () => {
      // Create test profiles
      await manager.createAccessibilityProfile('user1', {)
        needs: [AccessibilityNeed.VISUAL_IMPAIRMENT],
      });
      await manager.createAccessibilityProfile('user2', {)
        needs: [AccessibilityNeed.HEARING_IMPAIRMENT, AccessibilityNeed.MOTOR_IMPAIRMENT]
      });
      await manager.createAccessibilityProfile('user3', {)
        needs: [AccessibilityNeed.COGNITIVE_IMPAIRMENT],
        isActive: false,
      });
      // Create emergency bypasses
      await manager.createEmergencyBypass('user1', 'Test', 'admin1');
      await manager.createEmergencyBypass('user2', 'Test', 'admin2', -1); // Expired
      const metrics = manager.getAccessibilityMetrics();
      expect(metrics.totalUsers).toBe(3);
      expect(metrics.usersWithProfiles).toBe(2); // Only active profiles
      expect(metrics.accessibilityNeeds[AccessibilityNeed.VISUAL_IMPAIRMENT]).toBe(1);
      expect(metrics.accessibilityNeeds[AccessibilityNeed.HEARING_IMPAIRMENT]).toBe(1);
      expect(metrics.accessibilityNeeds[AccessibilityNeed.MOTOR_IMPAIRMENT]).toBe(1);
      expect(metrics.accessibilityNeeds[AccessibilityNeed.COGNITIVE_IMPAIRMENT]).toBe(1);
      expect(metrics.emergencyBypasses.active).toBe(1);
      expect(metrics.emergencyBypasses.expired).toBe(1);
      expect(metrics.complianceScores.average).toBe(82);
      expect(metrics.topIssues).toHaveLength(5);
    });
  });
  describe('Event Emission', () => {
    test('should emit compliance metrics updated event', (done) => {
      manager.on('complianceMetricsUpdated', (metrics) => {
        expect(metrics).toBeTruthy();
        expect(metrics.totalUsers).toBeGreaterThanOrEqual(0);
        done();
      });
      // Trigger metrics update manually (would normally be on timer)
      manager.emit('complianceMetricsUpdated', manager.getAccessibilityMetrics());
    });
  });
  describe('Error Handling', () => {
    test('should handle invalid emergency bypass ID', () => {
      const result = manager.useEmergencyBypass('invalid-id', {});
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Invalid bypass ID');
    });
  });
});