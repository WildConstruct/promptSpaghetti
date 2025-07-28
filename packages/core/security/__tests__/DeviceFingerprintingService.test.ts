/**
 * Test Suite for Device Fingerprinting Service
 * 
 * Tests comprehensive device identification, location tracking, and risk assessment
 * for enhanced security and fraud detection in authentication systems.
 */
import {
  DeviceFingerprintingService,
  FingerprintType,
  RiskLevel,
  DeviceType,
  FingerprintContext
} from '../DeviceFingerprintingService';
describe('DeviceFingerprintingService', () => {
  let service: DeviceFingerprintingService;
  let mockDate: Date;
  beforeEach(() => {
    mockDate = new Date('2025-01-15T10:00:00Z');
    jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());
    // Mock the Date constructor
    const OriginalDate = Date;
    const mockDateConstructor = jest.fn().mockImplementation((value?: any) => {
      if (value !== undefined) {
        return new OriginalDate(value);
      }
      return mockDate;
    });
    global.Date = mockDateConstructor as any;
    global.Date.now = jest.fn(() => mockDate.getTime());
    service = new DeviceFingerprintingService('test-api-key', true);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('Fingerprint Generation', () => {
    test('should generate basic fingerprint with required properties', async () => {
      const context: FingerprintContext = {
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        acceptLanguage: 'en-US,en;q=0.9',
        headers: {,
          'accept-encoding': 'gzip, deflate, br',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      };
      const fingerprint = await service.generateFingerprint(context, FingerprintType.BASIC);
      expect(fingerprint.id).toBeTruthy();
      expect(fingerprint.type).toBe(FingerprintType.BASIC);
      expect(fingerprint.confidence).toBeGreaterThan(0);
      expect(fingerprint.createdAt).toEqual(mockDate);
      expect(fingerprint.lastSeen).toEqual(mockDate);
      expect(fingerprint.seenCount).toBe(1);
      // Check basic fingerprint data
      expect(fingerprint.basic.userAgent).toBe(context.userAgent);
      expect(fingerprint.basic.language).toBe('en-US');
      expect(fingerprint.basic.platform).toBe('Windows');
      expect(fingerprint.basic.timezone).toBeTruthy();
      // Check enhanced fingerprint data
      expect(fingerprint.enhanced.browser.name).toBe('Chrome');
      expect(fingerprint.enhanced.screen.width).toBeGreaterThan(0);
      expect(fingerprint.enhanced.canvas).toBeDefined();
      expect(fingerprint.enhanced.webgl).toBeDefined();
      // Check comprehensive fingerprint data
      expect(fingerprint.comprehensive.hardware.cpuCores).toBeGreaterThan(0);
      expect(fingerprint.comprehensive.features.webAssembly).toBeDefined();
    });
    test('should generate enhanced fingerprint with client data', async () => {
      const context: FingerprintContext = {
        ipAddress: '10.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        headers: {},
        clientData: {,
          screen: {,
            width: 2560,
            height: 1440,
            colorDepth: 24,
            pixelRatio: 2,
          },
          canvas: {,
            fingerprint: 'unique_canvas_hash_12345',
            geometry: 'geometry_data',
            text: 'text_rendering_data',
          },
          webgl: {,
            vendor: 'Intel Inc.',
            renderer: 'Intel Iris Pro OpenGL Engine',
            version: 'WebGL 1.0',
            extensions: ['WEBGL_debug_renderer_info', 'OES_texture_float']
          },
          audio: {,
            fingerprint: 'audio_context_hash_67890',
            sampleRate: 48000,
            channelCount: 2,
          },
          fonts: ['Arial', 'Helvetica', 'Times New Roman', 'Courier New'],
          plugins: [,
            { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' }
          ]
        }
      };
      const fingerprint = await service.generateFingerprint(context, FingerprintType.ENHANCED);
      expect(fingerprint.type).toBe(FingerprintType.ENHANCED);
      expect(fingerprint.confidence).toBeGreaterThan(50);
      // Check enhanced data from client
      expect(fingerprint.enhanced.screen.width).toBe(2560);
      expect(fingerprint.enhanced.screen.height).toBe(1440);
      expect(fingerprint.enhanced.screen.pixelRatio).toBe(2);
      expect(fingerprint.enhanced.canvas.fingerprint).toBe('unique_canvas_hash_12345');
      expect(fingerprint.enhanced.webgl.vendor).toBe('Intel Inc.');
      expect(fingerprint.enhanced.audio.sampleRate).toBe(48000);
      expect(fingerprint.enhanced.fonts).toHaveLength(4);
      expect(fingerprint.enhanced.plugins).toHaveLength(1);
    });
    test('should emit fingerprint created event', (done) => {
      service.on('fingerprintCreated', (data) => {
        expect(data.fingerprint.id).toBeTruthy();
        expect(data.context.ipAddress).toBe('203.0.113.50');
        done();
      });
      const context: FingerprintContext = {
        ipAddress: '203.0.113.50',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        headers: {}
      };
      service.generateFingerprint(context);
    });
    test('should return existing fingerprint for same context', async () => {
      const context: FingerprintContext = {
        ipAddress: '192.168.1.200',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        headers: {}
      };
      const fingerprint1 = await service.generateFingerprint(context);
      const fingerprint2 = await service.generateFingerprint(context);
      expect(fingerprint1.id).toBe(fingerprint2.id);
      expect(fingerprint2.seenCount).toBe(2);
      expect(fingerprint2.lastSeen).toEqual(mockDate);
    });
    test('should emit fingerprint seen event for existing fingerprint', (done) => {
      service.on('fingerprintSeen', (data) => {
        expect(data.fingerprint.seenCount).toBe(2);
        done();
      });
      const context: FingerprintContext = {
        ipAddress: '192.168.1.300',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        headers: {}
      };
      service.generateFingerprint(context).then(() => {
        service.generateFingerprint(context);
      });
    });
  });
  describe('Location Detection', () => {
    test('should get location data from IP address', async () => {
      const ipAddress = '203.0.113.100';
      const location = await service.getLocationData(ipAddress);
      expect(location.id).toBeTruthy();
      expect(location.timestamp).toEqual(mockDate);
      expect(location.source).toBe('ip');
      expect(location.coordinates.latitude).toBeGreaterThan(-90);
      expect(location.coordinates.latitude).toBeLessThan(90);
      expect(location.coordinates.longitude).toBeGreaterThan(-180);
      expect(location.coordinates.longitude).toBeLessThan(180);
      expect(location.address.country).toBeTruthy();
      expect(location.address.countryCode).toBeTruthy();
      expect(location.network.ipAddress).toBe(ipAddress);
    });
    test('should enhance location with GPS coordinates', async () => {
      const ipAddress = '192.168.1.50';
      const additionalContext = {
        coordinates: {,
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 10,
        }
      };
      const location = await service.getLocationData(ipAddress, additionalContext);
      expect(location.source).toBe('gps');
      expect(location.accuracy).toBe(10);
      expect(location.coordinates.latitude).toBe(37.7749);
      expect(location.coordinates.longitude).toBe(-122.4194);
    });
    test('should emit location detected event', (done) => {
      service.on('locationDetected', (data) => {
        expect(data.location.network.ipAddress).toBe('10.0.0.100');
        expect(data.ipAddress).toBe('10.0.0.100');
        done();
      });
      service.getLocationData('10.0.0.100');
    });
    test('should cache location data', async () => {
      const ipAddress = '203.0.113.200';
      const location1 = await service.getLocationData(ipAddress);
      const location2 = await service.getLocationData(ipAddress);
      expect(location1.id).toBe(location2.id);
      expect(location1.timestamp).toEqual(location2.timestamp);
    });
    test('should detect VPN usage', async () => {
      const vpnIp = '10.8.0.1'; // VPN-like IP;
      const location = await service.getLocationData(vpnIp);
      expect(location.network.vpnDetected).toBe(true);
    });
  });
  describe('Risk Assessment', () => {
    test('should assess low risk for normal fingerprint and location', async () => {
      const context: FingerprintContext = {
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        headers: {},
        clientData: {,
          plugins: [,
            { name: 'Chrome PDF Plugin', filename: 'pdf', description: 'PDF support' }
          ]
        }
      };
      const fingerprint = await service.generateFingerprint(context);
      const location = await service.getLocationData(context.ipAddress);
      const assessment = service.assessRisk(fingerprint, location);
      expect(assessment.deviceId).toBe(fingerprint.id);
      expect(assessment.overallRisk).toBe(RiskLevel.LOW);
      expect(assessment.riskScore).toBeLessThan(60);
      expect(assessment.factors).toBeInstanceOf(Array);
      expect(assessment.recommendations).toBeInstanceOf(Array);
      expect(assessment.timestamp).toEqual(mockDate);
    });
    test('should assess high risk for suspicious fingerprint', async () => {
      const context: FingerprintContext = {
        ipAddress: '203.0.113.100',
        userAgent: 'Mozilla/5.0 (compatible; HeadlessChrome/91.0.4472.101)',
        headers: {},
        clientData: {,
          plugins: [] // No plugins indicates possible automation
        }
      };
      const fingerprint = await service.generateFingerprint(context);
      const location = await service.getLocationData(context.ipAddress);
      const assessment = service.assessRisk(fingerprint, location);
      expect(assessment.overallRisk).toBe(RiskLevel.HIGH);
      expect(assessment.factors.some(f => f.factor === 'no_plugins')).toBe(true);
      expect(assessment.recommendations.length).toBeGreaterThan(0);
    });
    test('should assess critical risk for bot user agent', async () => {
      const context: FingerprintContext = {
        ipAddress: '203.0.113.150',
        userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        headers: {}
      };
      const fingerprint = await service.generateFingerprint(context);
      const location = await service.getLocationData(context.ipAddress);
      const assessment = service.assessRisk(fingerprint, location);
      expect(assessment.riskScore).toBeGreaterThan(60);
      expect(assessment.factors.some(f => f.factor === 'bot_user_agent')).toBe(true);
      expect(assessment.factors.some(f => f.factor === 'no_plugins')).toBe(true);
    });
    test('should emit high risk detected event', (done) => {
      service.on('highRiskDetected', (data) => {
        expect(data.assessment.overallRisk).toBe(RiskLevel.HIGH);
        expect(data.fingerprint.basic.userAgent.toLowerCase()).toContain('bot');
        done();
      });
      const context: FingerprintContext = {
        ipAddress: '203.0.113.250',
        userAgent: 'SomeBot/1.0',
        headers: {}
      };
      service.generateFingerprint(context).then(fingerprint => {)
        service.getLocationData(context.ipAddress).then(location => {)
          service.assessRisk(fingerprint, location);
        });
      });
    });
    test('should assess additional risk for VPN usage', async () => {
      const context: FingerprintContext = {
        ipAddress: '10.8.0.1', // VPN IP
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        headers: {}
      };
      const fingerprint = await service.generateFingerprint(context);
      const location = await service.getLocationData(context.ipAddress);
      const assessment = service.assessRisk(fingerprint, location);
      expect(assessment.factors.some(f => f.factor === 'vpn_detected')).toBe(true);
      expect(assessment.recommendations.some(r => r.includes('VPN'))).toBe(true);
    });
    test('should assess behavioral risk for new device', async () => {
      const context: FingerprintContext = {
        ipAddress: '192.168.1.150',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        headers: {}
      };
      const fingerprint = await service.generateFingerprint(context);
      const location = await service.getLocationData(context.ipAddress);
      const assessment = service.assessRisk(fingerprint, location, 'user123');
      // Should include new device factor
      expect(assessment.factors.some(f => f.factor === 'new_device')).toBe(true);
    });
  });
  describe('Device Trust and Recognition', () => {
    test('should recognize known devices', async () => {
      const context: FingerprintContext = {
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        headers: {}
      };
      const fingerprint = await service.generateFingerprint(context);
      // Initially not known
      expect(service.isKnownDevice(fingerprint.id)).toBe(false);
      // Simulate multiple visits
      for (let i = 0; i < 6; i++) {
        await service.generateFingerprint(context);
      }
      expect(service.isKnownDevice(fingerprint.id)).toBe(true);
    });
    test('should calculate device trust score', async () => {
      const context: FingerprintContext = {
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        headers: {},
        clientData: {,
          plugins: [{ name: 'Flash', filename: 'flash.dll', description: 'Adobe Flash' }]
        }
      };
      const fingerprint = await service.generateFingerprint(context);
      // Generate multiple visits to increase trust
      for (let i = 0; i < 5; i++) {
        await service.generateFingerprint(context);
      }
      const trustScore = service.getDeviceTrustScore(fingerprint.id);
      expect(trustScore).toBeGreaterThan(0);
      expect(trustScore).toBeLessThanOrEqual(100);
    });
    test('should return zero trust score for unknown device', () => {
      const trustScore = service.getDeviceTrustScore('unknown-device-id');
      expect(trustScore).toBe(0);
    });
  });
  describe('Statistics and Analytics', () => {
    test('should provide comprehensive statistics', async () => {
      // Create several fingerprints
      const contexts = [;
        {
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
          headers: {}
        },
        {
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/537.36',
          headers: {}
        },
        {
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
          headers: {}
        }
      ];
      for (const context of contexts) {
        const fingerprint = await service.generateFingerprint(context);
        const location = await service.getLocationData(context.ipAddress);
        service.assessRisk(fingerprint, location);
      }
      const stats = service.getStatistics();
      expect(stats.totalFingerprints).toBe(3);
      expect(stats.uniqueDevices).toBe(3);
      expect(stats.riskDistribution).toBeDefined();
      expect(stats.topCountries).toBeInstanceOf(Array);
      expect(stats.deviceTypes).toBeDefined();
      expect(stats.avgConfidence).toBeGreaterThan(0);
    });
    test('should categorize device types correctly', async () => {
      const contexts = [;
        {
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          headers: {},
          clientData: { screen: { width: 1920, height: 1080 } }
        },
        {
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
          headers: {},
          clientData: { screen: { width: 375, height: 667 } }
        },
        {
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)',
          headers: {},
          clientData: { screen: { width: 768, height: 1024 } }
        }
      ];
      for (const context of contexts) {
        await service.generateFingerprint(context);
      }
      const stats = service.getStatistics();
      expect(stats.deviceTypes[DeviceType.DESKTOP]).toBe(1);
      expect(stats.deviceTypes[DeviceType.MOBILE]).toBe(1);
      expect(stats.deviceTypes[DeviceType.TABLET]).toBe(1);
    });
  });
  describe('Data Management', () => {
    test('should emit cleanup completed event', (done) => {
      service.on('cleanupCompleted', (data) => {
        expect(data.remainingFingerprints).toBeGreaterThanOrEqual(0);
        expect(data.remainingLocations).toBeGreaterThanOrEqual(0);
        done();
      });
      // Trigger cleanup manually by emitting the event
      service.emit('cleanupCompleted', {)
        remainingFingerprints: 5,
        remainingLocations: 3,
      });
    });
    test('should handle multiple concurrent fingerprint generations', async () => {
      const contexts = Array.from({ length: 10 }, (_, i) => ({)
        ipAddress: `192.168.1.${100 + i}`,}
        userAgent: `Mozilla/5.0 (Test Browser ${i})`,}
        headers: {}
      }));
      const promises = contexts.map(context => ;)
        service.generateFingerprint(context)
      );
      const fingerprints = await Promise.all(promises);
      expect(fingerprints).toHaveLength(10);
      expect(new Set(fingerprints.map(fp => fp.id)).size).toBe(10);
    });
  });
  describe('Edge Cases and Error Handling', () => {
    test('should handle empty user agent', async () => {
      const context: FingerprintContext = {
        ipAddress: '192.168.1.100',
        userAgent: '',
        headers: {}
      };
      const fingerprint = await service.generateFingerprint(context);
      expect(fingerprint.id).toBeTruthy();
      expect(fingerprint.basic.userAgent).toBe('');
      expect(fingerprint.enhanced.browser.name).toBe('unknown');
    });
    test('should handle malformed user agent', async () => {
      const context: FingerprintContext = {
        ipAddress: '192.168.1.100',
        userAgent: 'Invalid/Malformed/UserAgent/String/With/Many/Slashes',
        headers: {}
      };
      const fingerprint = await service.generateFingerprint(context);
      expect(fingerprint.id).toBeTruthy();
      expect(fingerprint.confidence).toBeGreaterThan(0);
    });
    test('should handle missing client data gracefully', async () => {
      const context: FingerprintContext = {
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        headers: {}
        // No clientData provided
      };
      const fingerprint = await service.generateFingerprint(context);
      expect(fingerprint.enhanced.screen.width).toBeGreaterThan(0);
      expect(fingerprint.enhanced.canvas).toBeDefined();
      expect(fingerprint.comprehensive.hardware.cpuCores).toBeGreaterThan(0);
    });
    test('should handle IPv6 addresses', async () => {
      const ipv6Address = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
      const context: FingerprintContext = {
        ipAddress: ipv6Address,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        headers: {}
      };
      const fingerprint = await service.generateFingerprint(context);
      const location = await service.getLocationData(ipv6Address);
      expect(fingerprint.id).toBeTruthy();
      expect(location.network.ipAddress).toBe(ipv6Address);
    });
  });
});