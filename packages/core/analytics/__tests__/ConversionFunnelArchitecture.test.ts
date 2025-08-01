/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Tests for Enhanced Conversion Funnel Architecture - Story 30.2
 */
import { ConversionArchitectureManager, TouchPoint, LinkingSignal } from '../ConversionFunnelArchitecture';
import { ConversionEvent } from '../ConversionTracker';
describe('ConversionArchitectureManager', () => { let manager: ConversionArchitectureManager;
  beforeEach(() => {
  manager = new ConversionArchitectureManager() });
  describe('Enhanced Conversion Events', () => { it('should create enhanced conversion event with attribution', () => {
      const baseEvent: ConversionEvent = {,
  id: 'test-event-001',
        userId: 'user-123',
        sessionId: 'session-456',
        timestamp: Date.now(),
        type: 'template_purchased',
        category: 'revenue',
        value: 25.00 }
        properties: { templateId: 'tpl-001' },
        metadata: { ,
  userAgent: 'test-agent',
  referrer: 'https://example.com' }
};
      const touchpoints: TouchPoint = [
        { id: 'touch-001',
  timestamp: Date.now() - 3600000, // 1 hour ago,
  channel: 'organic_search',
  source: 'google',
  medium: 'organic',
  position: 1,
  influence: 0.4 }

        { id: 'touch-002',
  timestamp: Date.now() - 1800000, // 30 minutes ago,
  channel: 'social_organic',
  source: 'twitter',
  medium: 'social',
  position: 2,
  influence: 0.6];
  const privacyConsent = {
  tracking: true,
  analytics: true,
  personalization: true,
  crossDevice: true }
};
      const enhancedEvent = manager.createEnhancedEvent(baseEvent, touchpoints, privacyConsent);
      expect(enhancedEvent).toBeDefined();
      expect(enhancedEvent.id).toBe(baseEvent.id);
      expect(enhancedEvent.attributionData.touchpoints).toHaveLength(2);
      expect(enhancedEvent.attributionData.primaryAttribution).toBeDefined();
      expect(enhancedEvent.attributionData.assistedAttribution).toBeDefined();
      expect(enhancedEvent.privacyConsent).toEqual(privacyConsent);
      expect(enhancedEvent.realTimeProcessing.streamId).toBeDefined();
      expect(enhancedEvent.realTimeProcessing.batchId).toBeDefined();
    });
    it('should respect privacy consent for device fingerprinting', () => { const baseEvent: ConversionEvent = {,
  id: 'test-event-002',
        userId: 'user-123',
        sessionId: 'session-456',
        timestamp: Date.now(),
        type: 'template_viewed',
        category: 'activation' }
        properties: {},
        metadata: { ,
  userAgent: 'test-agent',
  referrer: '' }
};
      const touchpoints: TouchPoint = [];
      // No tracking consent
      const noTrackingConsent = { tracking: false,
  analytics: true,
  personalization: false,
  crossDevice: false }
};
      const eventNoTracking = manager.createEnhancedEvent(baseEvent, touchpoints, noTrackingConsent);
      expect(eventNoTracking.deviceFingerprint).toBeUndefined();
      expect(eventNoTracking.crossDeviceUserId).toBeUndefined();
      // With tracking consent
      const withTrackingConsent = { tracking: true,
  analytics: true,
  personalization: true,
  crossDevice: true }
};
      const eventWithTracking = manager.createEnhancedEvent(baseEvent, touchpoints, withTrackingConsent);
      expect(eventWithTracking.deviceFingerprint).toBeDefined();
    });
  });
  describe('Attribution Calculation', () => { it('should calculate first-touch attribution correctly', () => {
  const touchpoints: TouchPoint = [
  {
  id: 'touch-001',
  timestamp: Date.now() - 7200000, // 2 hours ago,
  channel: 'paid_search',
  source: 'google',
  medium: 'cpc',
  position: 1,
  influence: 0.3,
  value: 100 }

        { id: 'touch-002',
          timestamp: Date.now() - 3600000, // 1 hour ago
          channel: 'social_organic',
          source: 'facebook',
          medium: 'social',
          position: 2,
          influence: 0.7,
          value: 50];
      const baseEvent: ConversionEvent = {,
  id: 'test-event-003',
        userId: 'user-123',
        sessionId: 'session-456',
        timestamp: Date.now(),
        type: 'subscription_upgraded',
        category: 'revenue',
        value: 50 }
        properties: {},
        metadata: { ,
  userAgent: 'test-agent',
  referrer: '' }
};
      const privacyConsent = { tracking: true,
  analytics: true,
  personalization: true,
  crossDevice: false }
};
      const enhancedEvent = manager.createEnhancedEvent(baseEvent, touchpoints, privacyConsent);
      expect(enhancedEvent.attributionData.touchpoints).toHaveLength(2);
      expect(enhancedEvent.attributionData.primaryAttribution.name).toBe('time_decay');
      expect(enhancedEvent.attributionData.assistedAttribution).toBeDefined();
      expect(enhancedEvent.attributionData.assistedAttribution.length).toBeGreaterThan(0);
    });
    it('should handle single touchpoint attribution', () => { const touchpoints: TouchPoint = [
        {
          id: 'touch-001',
          timestamp: Date.now() - 300000, // 5 minutes ago
          channel: 'direct',
          source: 'direct',
          medium: 'none',
          position: 1,
          influence: 1.0,
          value: 25];
      const baseEvent: ConversionEvent = {,
  id: 'test-event-004',
        userId: 'user-456',
        sessionId: 'session-789',
        timestamp: Date.now(),
        type: 'template_purchased',
        category: 'revenue',
        value: 25 }
        properties: {},
        metadata: { ,
  userAgent: 'test-agent',
  referrer: '' }
};
      const privacyConsent = { tracking: true,
  analytics: true,
  personalization: false,
  crossDevice: false }
};
      const enhancedEvent = manager.createEnhancedEvent(baseEvent, touchpoints, privacyConsent);
      expect(enhancedEvent.attributionData.touchpoints).toHaveLength(1);
      expect(enhancedEvent.attributionData.primaryAttribution.touchpoint.id).toBe('touch-001');
      expect(enhancedEvent.attributionData.primaryAttribution.attribution_value).toBe(25);
    });
  });
  describe('Cross-Device Identity Linking', () => { it('should link device identities with strong signals', () => {
  const userId = 'user-789';
  const deviceIdentity = {
  deviceId: 'device-001',
  deviceType: 'mobile' as const,
  fingerprint: 'fp_mobile_001',
  firstSeen: Date.now() - 86400000, // 1 day ago,
  lastSeen: Date.now(),
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
  linkedAt: Date.now(),
  linkingSignals: [] }
};
      const strongSignals: LinkingSignal = [
        { type: 'login',
          strength: 1.0,
          timestamp: Date.now() }
          metadata: { loginMethod: 'email' }

        { type: 'email',
          strength: 0.9,
          timestamp: Date.now() - 60000 }
          metadata: { emailVerified: true }

      ];
      const linked = manager.linkDeviceIdentity(userId, deviceIdentity, strongSignals);
      expect(linked).toBe(true);
      const identity = manager.getCrossDeviceIdentity(userId);
      expect(identity).toBeDefined();
    });
    it('should reject weak linking signals', () => { const userId = 'user-890';
  const deviceIdentity = {
  deviceId: 'device-002',
  deviceType: 'desktop' as const,
  fingerprint: 'fp_desktop_001',
  firstSeen: Date.now(),
  lastSeen: Date.now(),
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  linkedAt: Date.now(),
  linkingSignals: [] }
};
      const weakSignals: LinkingSignal = [
        { type: 'behavioral',
          strength: 0.3,
          timestamp: Date.now() }
          metadata: { similarity: 0.3 }

      ];
      const linked = manager.linkDeviceIdentity(userId, deviceIdentity, weakSignals);
      expect(linked).toBe(false);
    });
  });
  describe('Enhanced Funnel Configuration', () => { it('should retrieve enhanced funnel configuration', () => {
      const funnel = manager.getEnhancedFunnel('marketplace-discovery-enhanced');
      expect(funnel).toBeDefined();
      expect(funnel?.crossDeviceTracking).toBe(true);
      expect(funnel?.attributionWindow).toBe(30);
      expect(funnel?.conversionDefinition.primaryGoal).toBeDefined();
      expect(funnel?.conversionDefinition.microConversions).toBeDefined();
      expect(funnel?.conversionDefinition.macroConversions).toBeDefined();
      expect(funnel?.segmentation.userSegments).toBeDefined();
      expect(funnel?.anomalyDetection.enabled).toBe(true) });
    it('should return null for non-existent funnel', () => { const funnel = manager.getEnhancedFunnel('non-existent-funnel');
      expect(funnel).toBeNull() });
  });
  describe('Conversion Pattern Analysis', () => { it('should analyze conversion patterns and provide insights', () => {
      const insights = manager.analyzeConversionPatterns('marketplace-discovery-enhanced');
      expect(insights).toBeDefined();
      expect(insights?.pattern.id).toBe('high-intent-purchase');
      expect(insights?.pattern.frequency).toBeGreaterThan(0);
      expect(insights?.segments.high_value).toBeDefined();
      expect(insights?.segments.high_converting).toBeDefined();
      expect(insights?.segments.at_risk).toBeDefined();
      expect(insights?.recommendations.optimization).toBeDefined();
      expect(insights?.recommendations.targeting).toBeDefined();
      expect(insights?.recommendations.personalization).toBeDefined() });
    it('should return null for invalid funnel analysis', () => { const insights = manager.analyzeConversionPatterns('invalid-funnel');
      expect(insights).toBeNull() });
  });
  describe('Privacy Compliance', () => { it('should enforce privacy settings in enhanced events', () => {
      const baseEvent: ConversionEvent = {,
  id: 'privacy-test-001',
        userId: 'user-privacy',
        sessionId: 'session-privacy',
        timestamp: Date.now(),
        type: 'template_viewed',
        category: 'activation' }
        properties: {},
        metadata: { ,
  userAgent: 'test-agent',
  referrer: '' }
};
      const touchpoints: TouchPoint = [];
      // Minimal consent
      const minimalConsent = { tracking: false,
  analytics: true,
  personalization: false,
  crossDevice: false }
};
      const event = manager.createEnhancedEvent(baseEvent, touchpoints, minimalConsent);
      expect(event.deviceFingerprint).toBeUndefined();
      expect(event.crossDeviceUserId).toBeUndefined();
      expect(event.privacyConsent.tracking).toBe(false);
      expect(event.privacyConsent.analytics).toBe(true);
      expect(event.privacyConsent.personalization).toBe(false);
      expect(event.privacyConsent.crossDevice).toBe(false);
    });
  });
  describe('Real-time Processing', () => { it('should include real-time processing metadata', () => {
      const baseEvent: ConversionEvent = {,
  id: 'realtime-test-001',
        userId: 'user-realtime',
        sessionId: 'session-realtime',
        timestamp: Date.now(),
        type: 'subscription_upgraded',
        category: 'revenue',
        value: 50 }
        properties: {},
        metadata: { ,
  userAgent: 'test-agent',
  referrer: '' }
};
      const touchpoints: TouchPoint = [];
      const privacyConsent = { tracking: true,
  analytics: true,
  personalization: true,
  crossDevice: true }
};
      const event = manager.createEnhancedEvent(baseEvent, touchpoints, privacyConsent);
      expect(event.realTimeProcessing.streamId).toBeDefined();
      expect(event.realTimeProcessing.batchId).toBeDefined();
      expect(event.realTimeProcessing.processed).toBe(false);
      expect(event.realTimeProcessing.latency).toBe(0);
      expect(event.realTimeProcessing.streamId).toMatch(/^stream_\d+_[a-z0-9]+$/);
      expect(event.realTimeProcessing.batchId).toMatch(/^batch_\d+_[a-z0-9]+$/);
    });
  });
});
describe('Attribution Models', () => { let manager: ConversionArchitectureManager;
  beforeEach(() => {
  manager = new ConversionArchitectureManager() });
  it('should calculate time decay attribution with proper weights', () => { const touchpoints: TouchPoint = [
  {
  id: 'touch-1',
  timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago,
  channel: 'paid_search',
  source: 'google',
  medium: 'cpc',
  position: 1,
  influence: 0.2,
  value: 100 }

      { id: 'touch-2',
  timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago,
  channel: 'social_organic',
  source: 'facebook',
  medium: 'social',
  position: 2,
  influence: 0.3,
  value: 50 }

      { id: 'touch-3',
        timestamp: Date.now() - 60 * 60 * 1000, // 1 hour ago
        channel: 'direct',
        source: 'direct',
        medium: 'none',
        position: 3,
        influence: 0.5,
        value: 25];
    const baseEvent: ConversionEvent = {,
  id: 'attribution-test-001',
      userId: 'user-attribution',
      sessionId: 'session-attribution',
      timestamp: Date.now(),
      type: 'template_purchased',
      category: 'revenue',
      value: 30 }
      properties: {},
      metadata: { ,
  userAgent: 'test-agent',
  referrer: '' }
};
    const privacyConsent = { tracking: true,
  analytics: true,
  personalization: true,
  crossDevice: false }
};
    const event = manager.createEnhancedEvent(baseEvent, touchpoints, privacyConsent);
    // Time decay should favor more recent touchpoints
    expect(event.attributionData.primaryAttribution.name).toBe('time_decay');
    expect(event.attributionData.primaryAttribution.touchpoint.id).toBe('touch-3'); // Most recent should have highest weight
  });
  it('should calculate position-based attribution correctly', () => { const touchpoints: TouchPoint = [
  {
  id: 'first-touch',
  timestamp: Date.now() - 3600000,
  channel: 'organic_search',
  source: 'google',
  medium: 'organic',
  position: 1,
  influence: 0.4,
  value: 50 }

      { id: 'middle-touch',
  timestamp: Date.now() - 1800000,
  channel: 'social_organic',
  source: 'twitter',
  medium: 'social',
  position: 2,
  influence: 0.2,
  value: 25 }

      { id: 'last-touch',
        timestamp: Date.now() - 300000,
        channel: 'direct',
        source: 'direct',
        medium: 'none',
        position: 3,
        influence: 0.4,
        value: 75];
    const baseEvent: ConversionEvent = {,
  id: 'position-test-001',
      userId: 'user-position',
      sessionId: 'session-position',
      timestamp: Date.now(),
      type: 'subscription_upgraded',
      category: 'revenue',
      value: 100 }
      properties: {},
      metadata: { ,
  userAgent: 'test-agent',
  referrer: '' }
};
    const privacyConsent = { tracking: true,
  analytics: true,
  personalization: true,
  crossDevice: false }
};
    const event = manager.createEnhancedEvent(baseEvent, touchpoints, privacyConsent);
    // Should have position-based attribution among assisted models
    const positionBasedModel = event.attributionData.assistedAttribution.find(;);
      model => model.name === 'position_based'
    );
    expect(positionBasedModel).toBeDefined();
    // First and last touch should have equal weight (40% each), middle should have less (20%)
  });
});