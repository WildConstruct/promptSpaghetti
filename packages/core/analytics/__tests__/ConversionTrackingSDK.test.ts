/**
 * Tests for Conversion Tracking SDK - Story 30.2 Task 2
 */
import { ConversionTrackingSDK, ConversionTrackingConfig } from '../ConversionTrackingSDK';
import { ConversionArchitectureManager } from '../ConversionFunnelArchitecture';
import { SessionTrackingManager } from '../SessionTrackingIntegration';
import { AnalyticsClient } from '../AnalyticsClient';

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({)
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1, // OPEN,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock navigator
Object.defineProperty(global, 'navigator', {)
  value: {,
  onLine: true,
  userAgent: 'test-agent',
  language: 'en-US',
  doNotTrack: '0',
},
  writable: true;
  });

// Mock document
Object.defineProperty(global, 'document', {)
  value: {,
  referrer: 'https://example.com',
  hidden: false,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
},
  configurable: true;
  });

// Mock window
Object.defineProperty(global, 'window', {)
  value: {,
  location: {,
  href: 'https://test.com/page',
  pathname: '/page',
  search: '?utm_source=test&utm_medium=cpc',
},
  innerWidth: 1920,
    innerHeight: 1080,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn();
  },
  writable: true;
  });

// Mock localStorage and sessionStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });
Object.defineProperty(global, 'sessionStorage', { value: sessionStorageMock });
describe('ConversionTrackingSDK', () => {
  let sdk: ConversionTrackingSDK;
  let mockAnalyticsClient: jest.Mocked<AnalyticsClient>;
  let mockConversionArchitecture: jest.Mocked<ConversionArchitectureManager>;
  let mockSessionManager: jest.Mocked<SessionTrackingManager>;
  let config: ConversionTrackingConfig;
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    sessionStorageMock.getItem.mockReturnValue(null);
    // Create mock instances
    mockAnalyticsClient = {
      makeRequest: jest.fn().mockResolvedValue({ success: true }),
      getSummary: jest.fn().mockResolvedValue({ success: true })
} as any;
    mockConversionArchitecture = {
      createEnhancedEvent: jest.fn().mockReturnValue({,)
  id: 'test-event-001',
        userId: 'user-123',
        sessionId: 'session-456',
        timestamp: Date.now(),
        type: 'template_purchased',
        category: 'revenue',
        value: 25.00,
        properties: {},
        metadata: {},
        deviceFingerprint: 'test-fingerprint',
        attributionData: {,
  touchpoints: [],
          primaryAttribution: {,
  name: 'direct',
            weight: 1.0,
            touchpoint: {} as any,
            attribution_value: 0;
  },
  assistedAttribution: [];
  },
  privacyConsent: {,
  tracking: true,
  analytics: true,
  personalization: true,
  crossDevice: false,
},
  realTimeProcessing: {,
  streamId: 'stream-123',
  batchId: 'batch-456',
  processed: false,
  latency: 0,
}
    } as any;
    mockSessionManager = {
  trackConversionEvent: jest.fn(),
  updateConsentPreferences: jest.fn(),
  getCurrentSessionAnalytics: jest.fn().mockReturnValue({,)
  totalSessions: 1,
  uniqueUsers: 1,
}
    } as any;
    config = {
  baseUrl: 'https://api.test.com',
  enableRealTimeStreaming: true,
  streamingEndpoint: '/api/conversion-events/stream',
  batchSize: 10,
  flushInterval: 1000,
  respectDoNotTrack: true,
  requireExplicitConsent: false,
  enableCrossDeviceTracking: false,
  enableOfflineBuffering: true,
  maxOfflineEvents: 100,
  eventValidationRules: [],
  deduplicationWindow: 60000,
  enableDebugLogging: false,
};
    sdk = new ConversionTrackingSDK(config, mockConversionArchitecture, mockSessionManager);
  });
  afterEach(() => {
    sdk.destroy();
  });
  describe('Event Tracking', () => {
  it('should track conversion events successfully', async () => {
  const result = await sdk.trackConversionEvent('template_purchased', {)
  templateId: 'tpl-001',
  price: 25.00,
}, 25.00);
      expect(result).toBe(true);
      expect(mockConversionArchitecture.createEnhancedEvent).toHaveBeenCalledWith()
        expect.objectContaining({)
  type: 'template_purchased',
  value: 25.00,
}),
        [],
        expect.objectContaining({)
  tracking: true,
  analytics: true,
}
      );
      expect(mockSessionManager.trackConversionEvent).toHaveBeenCalledWith()
        'template_purchased',
        25.00,
        expect.objectContaining({)
  templateId: 'tpl-001',
  price: 25.00,
}
      );
    });
    it('should respect Do Not Track setting', async () => {
      Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });
      const result = await sdk.trackConversionEvent('template_viewed');
      expect(result).toBe(false);
      expect(mockConversionArchitecture.createEnhancedEvent).not.toHaveBeenCalled();
    });
    it('should handle tracking with touchpoints', async () => {
      const touchpoints = [;
        {
          id: 'tp-001',
          timestamp: Date.now() - 3600000,
          channel: 'organic_search' as const,
          source: 'google',
          medium: 'organic',
          position: 1,
          influence: 0.8];
      const result = await sdk.trackConversionEvent(;);
        'template_purchased',
        { templateId: 'tpl-001' },
        25.00,
        touchpoints
      );
      expect(result).toBe(true);
      expect(mockConversionArchitecture.createEnhancedEvent).toHaveBeenCalledWith()
        expect.any(Object),
        touchpoints,
        expect.any(Object)
      );
    });
    it('should track funnel steps', async () => {
  const result = await sdk.trackFunnelStep('marketplace-discovery', 'template-view', {)
  templateId: 'tpl-001',
  category: 'character-development',
});
      expect(result).toBe(true);
      expect(mockConversionArchitecture.createEnhancedEvent).toHaveBeenCalledWith()
        expect.objectContaining({)
  type: 'funnel_step_template-view',
  properties: expect.objectContaining({,)
  funnelId: 'marketplace-discovery',
  stepId: 'template-view',
  templateId: 'tpl-001',
}
        }),
        expect.any(Array),
        expect.any(Object)
      );
    });
    it('should track attribution touchpoints', async () => {
  const result = await sdk.trackTouchpoint('paid_search', 'google', 'cpc', {)
  campaign: 'summer-sale',
  value: 100,
});
      expect(result).toBe(true);
      expect(mockConversionArchitecture.createEnhancedEvent).toHaveBeenCalledWith()
        expect.objectContaining({)
  type: 'touchpoint_tracked',
  properties: expect.objectContaining({,)
  touchpoint: expect.objectContaining({,)
  channel: 'paid_search',
  source: 'google',
  medium: 'cpc',
}),
            campaign: 'summer-sale';
  }
        }),
        expect.arrayContaining([)
          expect.objectContaining({)
  channel: 'paid_search',
  source: 'google',
  medium: 'cpc',
}
        ]),
        expect.any(Object)
      );
    });
  });
  describe('Privacy and Consent', () => {
  it('should update consent preferences', () => {
  const consent = {
  tracking: false,
  analytics: true,
  personalization: false,
  crossDevice: false,
};
      sdk.updateConsentPreferences(consent);
      expect(mockSessionManager.updateConsentPreferences).toHaveBeenCalledWith(consent);
    });
    it('should respect explicit consent requirement', async () => {
      sdk = new ConversionTrackingSDK()
        { ...config, requireExplicitConsent: true },
        mockConversionArchitecture,
        mockSessionManager
      );
      // Mock consent as not given
      localStorageMock.getItem.mockImplementation((key) => {
  if (key === 'ps_consent') {
  return JSON.stringify({)
  tracking: false,
  analytics: false,
  personalization: false,
  crossDevice: false,
});
        return null;
      });
      const result = await sdk.trackConversionEvent('template_viewed');
      expect(result).toBe(false);
      expect(mockConversionArchitecture.createEnhancedEvent).not.toHaveBeenCalled();
    });
    it('should clear data when tracking consent is revoked', () => {
      const clearSpy = jest.spyOn(sdk as any, 'clearEventData');
      sdk.updateConsentPreferences({ tracking: false });
      expect(clearSpy).toHaveBeenCalled();
    });
  });
  describe('Event Validation', () => {
    it('should validate events with custom rules', async () => {
      const configWithValidation: ConversionTrackingConfig = {
        ...config,
        eventValidationRules: [,
          {
            field: 'value',
            type: 'range',
            value: { min: 0, max: 1000 },
            errorMessage: 'Value must be between 0 and 1000'];
  };
      sdk = new ConversionTrackingSDK()
        configWithValidation,
        mockConversionArchitecture,
        mockSessionManager
      );
      // Test valid value
      let result = await sdk.trackConversionEvent('purchase', {}, 500);
      expect(result).toBe(true);
      // Test invalid value
      result = await sdk.trackConversionEvent('purchase', {}, 1500);
      expect(result).toBe(false);
    });
    it('should detect and filter duplicate events', async () => {
      // Track the same event twice quickly
      await sdk.trackConversionEvent('template_purchased', { templateId: 'tpl-001' }, 25.00);
      const result = await sdk.trackConversionEvent('template_purchased', { templateId: 'tpl-001' }, 25.00);
      expect(result).toBe(false); // Second event should be filtered as duplicate
    });
  });
  describe('Offline Handling', () => {
    it('should buffer events when offline', async () => {
      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      const result = await sdk.trackConversionEvent('template_viewed');
      expect(result).toBe(true);
      const metrics = sdk.getTrackingMetrics();
      expect(metrics.offlineEvents).toBeGreaterThan(0);
    });
    it('should process offline buffer when coming back online', async () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      await sdk.trackConversionEvent('event1');
      await sdk.trackConversionEvent('event2');
      // Go back online
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      // Simulate online event
      const onlineEvent = new Event('online');
      window.dispatchEvent(onlineEvent);
      // Allow async processing
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockAnalyticsClient.makeRequest).toHaveBeenCalled();
    });
    it('should save offline events to localStorage', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      await sdk.trackConversionEvent('template_viewed');
      expect(localStorageMock.setItem).toHaveBeenCalledWith()
        'ps_offline_events',
        expect.any(String)
      );
    });
  });
  describe('Real-time Streaming', () => {
  it('should initialize WebSocket connection for streaming', () => {
  expect(global.WebSocket).toHaveBeenCalledWith()
  expect.stringContaining('ws://api.test.com/api/conversion-events/stream'));
});
    it('should send events via WebSocket when connected', async () => {
      const mockWs = (global.WebSocket as jest.Mock).mock.instances[0];
      mockWs.readyState = 1; // OPEN
      await sdk.trackConversionEvent('template_purchased', {}, 25.00);
      // Allow batch processing
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockWs.send).toHaveBeenCalledWith()
        expect.stringContaining('conversion_events_batch')
      );
    });
    it('should fallback to API when WebSocket is not available', async () => {
      const mockWs = (global.WebSocket as jest.Mock).mock.instances[0];
      mockWs.readyState = 3; // CLOSED
      await sdk.trackConversionEvent('template_purchased', {}, 25.00);
      await sdk.flushQueue();
      expect(mockAnalyticsClient.makeRequest).toHaveBeenCalledWith()
        '/analytics/conversion-events/batch',
        expect.objectContaining({)
  method: 'POST',
  body: expect.any(String),
}
      );
    });
  });
  describe('Metrics and Monitoring', () => {
    it('should track processing metrics', async () => {
      await sdk.trackConversionEvent('event1');
      await sdk.trackConversionEvent('event2');
      await sdk.trackConversionEvent('event3');
      const metrics = sdk.getTrackingMetrics();
      expect(metrics.eventsTracked).toBe(3);
      expect(metrics.queueSize).toBeGreaterThanOrEqual(0);
      expect(metrics.streamingConnected).toBe(true);
    });
    it('should count validation errors', async () => {
      // Force a validation error by providing invalid data
      mockConversionArchitecture.createEnhancedEvent.mockImplementationOnce(() => {
        throw new Error('Validation failed');
      });
      const result = await sdk.trackConversionEvent('invalid_event');
      expect(result).toBe(false);
      const metrics = sdk.getTrackingMetrics();
      expect(metrics.eventsTracked).toBe(0); // Event wasn't tracked due to error
    });
    it('should count duplicates filtered', async () => {
      // Track same event twice
      await sdk.trackConversionEvent('duplicate_test', { id: 'same' });
      await sdk.trackConversionEvent('duplicate_test', { id: 'same' });
      const metrics = sdk.getTrackingMetrics();
      expect(metrics.duplicatesFiltered).toBeGreaterThan(0);
    });
  });
  describe('Queue Management', () => {
    it('should flush queue when batch size is reached', async () => {
      const flushSpy = jest.spyOn(sdk, 'flushQueue');
      // Track enough events to trigger batch flush
      for (let i = 0; i < config.batchSize; i++) {
        await sdk.trackConversionEvent(`event_${i}`);}
      expect(flushSpy).toHaveBeenCalled();
    });
    it('should flush queue on page unload', () => {
      const flushSpy = jest.spyOn(sdk, 'flushQueue');
      // Simulate beforeunload event
      const beforeUnloadEvent = new Event('beforeunload');
      window.dispatchEvent(beforeUnloadEvent);
      expect(flushSpy).toHaveBeenCalled();
    });
    it('should retry failed events with backoff', async () => {
      mockAnalyticsClient.makeRequest.mockRejectedValueOnce(new Error('Network error'));
      mockAnalyticsClient.makeRequest.mockResolvedValueOnce({ success: true });
      await sdk.trackConversionEvent('retry_test');
      await sdk.flushQueue();
      // Allow retry processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      expect(mockAnalyticsClient.makeRequest).toHaveBeenCalledTimes(2);
    });
  });
  describe('Context Building', () => {
  it('should extract UTM parameters from URL', async () => {
  await sdk.trackConversionEvent('test_event');
  expect(mockConversionArchitecture.createEnhancedEvent).toHaveBeenCalledWith()
  expect.objectContaining({)
  properties: expect.objectContaining({,)
  source: 'test',
  medium: 'cpc',
}
        }),
        expect.any(Array),
        expect.any(Object)
      );
    });
    it('should generate consistent device and session IDs', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'deviceId') return 'consistent-device-id';
        if (key === 'userId') return 'consistent-user-id';
        return null;
      });
      sessionStorageMock.getItem.mockImplementation((key) => {
        if (key === 'sessionId') return 'consistent-session-id';
        return null;
      });
      await sdk.trackConversionEvent('test_event');
      expect(mockConversionArchitecture.createEnhancedEvent).toHaveBeenCalledWith()
        expect.objectContaining({)
  userId: 'consistent-user-id',
  sessionId: 'consistent-session-id',
  properties: expect.objectContaining({,)
  deviceId: 'consistent-device-id',
}
        }),
        expect.any(Array),
        expect.any(Object)
      );
    });
  });
  describe('Error Handling', () => {
    it('should handle conversion architecture errors gracefully', async () => {
      mockConversionArchitecture.createEnhancedEvent.mockImplementationOnce(() => {
        throw new Error('Architecture error');
      });
      const result = await sdk.trackConversionEvent('error_test');
      expect(result).toBe(false);
      expect(mockSessionManager.trackConversionEvent).not.toHaveBeenCalled();
    });
    it('should report errors to monitoring endpoint', async () => {
  const configWithErrorReporting: ConversionTrackingConfig = {,
  ...config,
  errorReportingEndpoint: '/api/errors',
};
      sdk = new ConversionTrackingSDK()
        configWithErrorReporting,
        mockConversionArchitecture,
        mockSessionManager
      );
      // Mock fetch for error reporting
      global.fetch = jest.fn().mockResolvedValue({ ok: true });
      mockConversionArchitecture.createEnhancedEvent.mockImplementationOnce(() => {
        throw new Error('Test error');
      });
      await sdk.trackConversionEvent('error_test');
      expect(global.fetch).toHaveBeenCalledWith()
        '/api/errors',
        expect.objectContaining({)
  method: 'POST',
  body: expect.stringContaining('Test error'),
}
      );
    });
  });
  describe('SDK Lifecycle', () => {
    it('should clean up resources on destroy', () => {
      const mockWs = (global.WebSocket as jest.Mock).mock.instances[0];
      sdk.destroy();
      expect(mockWs.close).toHaveBeenCalled();
    });
    it('should flush remaining events on destroy', () => {
      const flushSpy = jest.spyOn(sdk, 'flushQueue');
      sdk.destroy();
      expect(flushSpy).toHaveBeenCalled();
    });
  });
});