// Enhanced Device Identification Service Tests
// Comprehensive test coverage for device identification and trust scoring

import { 
  EnhancedDeviceIdentificationService,
  EnhancedDeviceProfile,
  AnomalyReport
} from '../services/EnhancedDeviceIdentificationService';
import { DeviceFingerprintingService } from '../services/DeviceFingerprintingService';
import { GeolocationService, GeolocationData } from '../auth/services/GeolocationService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';

// Mock implementations
class MockDeviceFingerprintingService {
  async generateFingerprint(components: unknown): Promise<string> {
    return `fp_${JSON.stringify(components).split('').reduce((a, b) => a + b.charCodeAt(0), 0)}`;
  }

  async calculateTrustScore(fingerprint: string, context: unknown): Promise<number> {
    // Mock trust score based on fingerprint characteristics
    if (fingerprint.includes('suspicious')) return 20;
    if (fingerprint.includes('trusted')) return 90;
    return 65;
  }
}

class MockGeolocationService {
  async getGeolocationData(ipAddress: string): Promise<GeolocationData> {
    const mockData: Record<string, GeolocationData> = {
      '192.168.1.1': {
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        regionCode: 'CA',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        coordinates: { latitude: 37.7749, longitude: -122.4194 },
        confidence: 0.9,
        source: 'ipapi'
      },
      '8.8.8.8': {
        country: 'United States',
        countryCode: 'US',
        region: 'Virginia',
        regionCode: 'VA',
        city: 'Ashburn',
        timezone: 'America/New_York',
        coordinates: { latitude: 39.0437, longitude: -77.4875 },
        isVpn: true,
        confidence: 0.8,
        source: 'ipapi'
      },
      '1.2.3.4': {
        country: 'Germany',
        countryCode: 'DE',
        region: 'Berlin',
        regionCode: 'BE',
        city: 'Berlin',
        timezone: 'Europe/Berlin',
        coordinates: { latitude: 52.5200, longitude: 13.4050 },
        isTor: true,
        confidence: 0.7,
        source: 'ipapi'
      }
    };

    return mockData[ipAddress] || {
      country: 'Unknown',
      countryCode: 'XX',
      region: 'Unknown',
      regionCode: 'XX',
      city: 'Unknown',
      timezone: 'UTC',
      confidence: 0.1,
      source: 'fallback'
    };
  }
}

class MockDatabaseService {
  private tables: Map<string, any[]> = new Map([
    ['device_fingerprints', []],
    ['device_user_associations', []],
    ['device_anomalies', []],
    ['device_fingerprint_history', []],
    ['device_location_history', []],
    ['device_security_events', []]
  ]);

  async query(sql: string, params: any[] = []): Promise<{ rows: any[] }> {
    // Handle CREATE TABLE
    if (sql.includes('CREATE TABLE')) {
      return { rows: [] };
    }

    // Handle CREATE INDEX
    if (sql.includes('CREATE INDEX')) {
      return { rows: [] };
    }

    // Handle INSERT INTO device_fingerprints
    if (sql.includes('INSERT INTO device_fingerprints')) {
      const [deviceId, fingerprint, components, trustScore, firstSeen, lastSeen, trustFactors, dataQuality] = params;
      this.tables.get('device_fingerprints')!.push({
        device_id: deviceId,
        fingerprint,
        components,
        trust_score: trustScore,
        first_seen: firstSeen,
        last_seen: lastSeen,
        trust_factors: trustFactors,
        data_quality: dataQuality,
        update_count: 1,
        collection_errors: '[]'
      });
      return { rows: [] };
    }

    // Handle INSERT INTO device_user_associations
    if (sql.includes('INSERT INTO device_user_associations')) {
      const associations = this.tables.get('device_user_associations')!;
      const existing = associations.find(a => 
        a.device_fingerprint === params[0] && a.user_id === params[1]
      );

      if (existing) {
        existing.last_seen = new Date();
        existing.login_count++;
        existing.verified = existing.verified || params[6];
      } else {
        associations.push({
          device_fingerprint: params[0],
          user_id: params[1],
          first_seen: new Date(),
          last_seen: new Date(),
          login_count: 1,
          verified: params[6],
          trust_level: 50
        });
      }
      return { rows: [] };
    }

    // Handle SELECT from device_fingerprints
    if (sql.includes('SELECT') && sql.includes('device_fingerprints') && sql.includes('WHERE fingerprint = $1')) {
      const fingerprint = params[0];
      const device = this.tables.get('device_fingerprints')!.find(d => d.fingerprint === fingerprint);
      return { rows: device ? [device] : [] };
    }

    // Handle SELECT from device_user_associations
    if (sql.includes('SELECT') && sql.includes('device_user_associations')) {
      const associations = this.tables.get('device_user_associations')!;
      if (sql.includes('WHERE device_fingerprint = $1')) {
        return { rows: associations.filter(a => a.device_fingerprint === params[0]) };
      }
      if (sql.includes('WHERE user_id = $1')) {
        return { rows: associations.filter(a => a.user_id === params[0]) };
      }
      return { rows: associations };
    }

    // Handle UPDATE device_fingerprints
    if (sql.includes('UPDATE device_fingerprints')) {
      const devices = this.tables.get('device_fingerprints')!;
      const fingerprint = params[params.length - 1]; // Last parameter is fingerprint
      const device = devices.find(d => d.fingerprint === fingerprint);
      
      if (device) {
        if (sql.includes('components =')) device.components = params[0];
        if (sql.includes('last_seen =')) device.last_seen = params[1];
        if (sql.includes('update_count =')) device.update_count = params[2];
        if (sql.includes('trust_level =')) device.trust_level = params[0];
      }
      return { rows: [] };
    }

    // Handle other SELECT queries with empty results
    if (sql.includes('SELECT')) {
      return { rows: [] };
    }

    return { rows: [] };
  }

  // Helper methods for testing
  setMockData(table: string, data: any[]) {
    this.tables.set(table, data);
  }

  getMockData(table: string) {
    return this.tables.get(table) || [];
  }
}

class MockRedisService {
  private cache: Map<string, string> = new Map();

  async setex(key: string, expiry: number, value: string): Promise<void> {
    this.cache.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.cache.get(key) || null;
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  clearCache() {
    this.cache.clear();
  }
}

class MockAuditService {
  public events: any[] = [];

  async logEvent(event: unknown): Promise<void> {
    this.events.push({
      ...event,
      timestamp: new Date()
    });
  }

  getEvents(action?: string): any[] {
    return action 
      ? this.events.filter(e => e.action === action)
      : this.events;
  }

  clearEvents() {
    this.events = [];
  }
}

describe('EnhancedDeviceIdentificationService', () => {
  let enhancedDeviceService: EnhancedDeviceIdentificationService;
  let mockDeviceService: MockDeviceFingerprintingService;
  let mockGeoService: MockGeolocationService;
  let mockDb: MockDatabaseService;
  let mockRedis: MockRedisService;
  let mockAudit: MockAuditService;

  beforeEach(() => {
    mockDeviceService = new MockDeviceFingerprintingService();
    mockGeoService = new MockGeolocationService();
    mockDb = new MockDatabaseService();
    mockRedis = new MockRedisService();
    mockAudit = new MockAuditService();

    enhancedDeviceService = new EnhancedDeviceIdentificationService(
      mockDeviceService as any,
      mockGeoService as any,
      mockDb as any,
      mockRedis as any,
      mockAudit as any,
      {
        trustWeights: {
          age: 0.15,
          consistency: 0.25,
          userAssociation: 0.20,
          locationStability: 0.15,
          securityEvents: 0.15,
          verificationLevel: 0.10
        },
        thresholds: {
          highTrust: 80,
          mediumTrust: 60,
          lowTrust: 40,
          suspiciousChange: 30,
          criticalAnomaly: 50
        }
      }
    );
  });

  afterEach(() => {
    mockRedis.clearCache();
    mockAudit.clearEvents();
  });

  describe('identifyDevice', () => {
    it('should create new device profile for unknown fingerprint', async () => {
      const request = {
        fingerprint: 'new_fingerprint_123',
        components: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          language: 'en-US',
          screenResolution: '1920x1080',
          canvasFingerprint: 'canvas123',
          webglFingerprint: 'webgl123',
          audioFingerprint: 'audio123',
          availableFonts: ['Arial', 'Times New Roman'],
          plugins: []
        },
        ipAddress: '192.168.1.1',
        userId: 'user123',
        sessionId: 'session123'
      };

      const result = await enhancedDeviceService.identifyDevice(request);

      expect(result.isNewDevice).toBe(true);
      expect(result.deviceProfile.fingerprint).toBe('new_fingerprint_123');
      expect(result.deviceProfile.trustScore).toBeGreaterThan(0);
      expect(result.deviceProfile.riskLevel).toBeDefined();
      expect(result.trustDecision.decision).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('should identify returning device correctly', async () => {
      // First, create a device
      const request = {
        fingerprint: 'returning_fingerprint',
        components: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          language: 'en-US',
          screenResolution: '1920x1080',
          canvasFingerprint: 'canvas456',
          webglFingerprint: 'webgl456',
          audioFingerprint: 'audio456',
          availableFonts: ['Arial'],
          plugins: []
        },
        ipAddress: '192.168.1.1',
        userId: 'user123'
      };

      // First identification
      await enhancedDeviceService.identifyDevice(request);

      // Second identification with same fingerprint
      const result = await enhancedDeviceService.identifyDevice(request);

      expect(result.isNewDevice).toBe(false);
      expect(result.deviceProfile.fingerprint).toBe('returning_fingerprint');
    });

    it('should detect fingerprint changes as anomalies', async () => {
      // Create initial device
      const initialRequest = {
        fingerprint: 'original_fingerprint',
        components: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          canvasFingerprint: 'original_canvas',
          webglFingerprint: 'original_webgl'
        },
        ipAddress: '192.168.1.1',
        userId: 'user123'
      };

      await enhancedDeviceService.identifyDevice(initialRequest);

      // Simulate fingerprint change
      const changedRequest = {
        fingerprint: 'changed_fingerprint',
        components: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          canvasFingerprint: 'changed_canvas',
          webglFingerprint: 'changed_webgl'
        },
        ipAddress: '192.168.1.1',
        userId: 'user123'
      };

      const result = await enhancedDeviceService.identifyDevice(changedRequest);

      expect(result.anomalies.length).toBeGreaterThan(0);
      expect(result.anomalies.some(a => a.type === 'fingerprint_change')).toBe(true);
    });

    it('should detect impossible travel as location anomaly', async () => {
      // Create device in San Francisco
      const sfRequest = {
        fingerprint: 'travel_device',
        components: { userAgent: 'Mozilla/5.0' },
        ipAddress: '192.168.1.1', // San Francisco
        userId: 'user123'
      };

      await enhancedDeviceService.identifyDevice(sfRequest);

      // Immediately appear in Berlin (impossible travel)
      const berlinRequest = {
        fingerprint: 'travel_device',
        components: { userAgent: 'Mozilla/5.0' },
        ipAddress: '1.2.3.4', // Berlin
        userId: 'user123'
      };

      const result = await enhancedDeviceService.identifyDevice(berlinRequest);

      expect(result.anomalies.some(a => a.type === 'location_jump')).toBe(true);
    });

    it('should detect security violations', async () => {
      const request = {
        fingerprint: 'spoofed_device',
        components: {
          userAgent: 'Mozilla/5.0',
          spoofingDetected: true
        },
        ipAddress: '192.168.1.1',
        userId: 'user123'
      };

      const result = await enhancedDeviceService.identifyDevice(request);

      expect(result.anomalies.some(a => a.type === 'security_violation')).toBe(true);
    });

    it('should make appropriate trust decisions based on risk level', async () => {
      // High trust device
      const trustedRequest = {
        fingerprint: 'trusted_device',
        components: {
          userAgent: 'Mozilla/5.0',
          canvasFingerprint: 'trusted_canvas'
        },
        ipAddress: '192.168.1.1',
        userId: 'user123'
      };

      const trustedResult = await enhancedDeviceService.identifyDevice(trustedRequest);
      expect(['allow', 'monitor']).toContain(trustedResult.trustDecision.decision);

      // Suspicious device
      const suspiciousRequest = {
        fingerprint: 'suspicious_device',
        components: {
          userAgent: 'Mozilla/5.0',
          spoofingDetected: true,
          canvasFingerprint: 'suspicious_canvas'
        },
        ipAddress: '1.2.3.4', // Tor IP
        userId: 'user123'
      };

      const suspiciousResult = await enhancedDeviceService.identifyDevice(suspiciousRequest);
      expect(['challenge', 'block']).toContain(suspiciousResult.trustDecision.decision);
    });

    it('should log device identification events', async () => {
      const request = {
        fingerprint: 'logged_device',
        components: { userAgent: 'Mozilla/5.0' },
        ipAddress: '192.168.1.1',
        userId: 'user123'
      };

      await enhancedDeviceService.identifyDevice(request);

      const events = mockAudit.getEvents('device_identified');
      expect(events.length).toBe(1);
      expect(events[0].details.fingerprint).toBe('logged_device');
      expect(events[0].userId).toBe('user123');
    });
  });

  describe('getDeviceTrustScore', () => {
    it('should return zero trust for unknown device', async () => {
      const result = await enhancedDeviceService.getDeviceTrustScore('unknown_device');

      expect(result.trustScore).toBe(0);
      expect(result.riskLevel).toBe('critical');
      expect(result.factors).toEqual({});
    });

    it('should calculate trust score for known device', async () => {
      // Create a device first
      const request = {
        fingerprint: 'known_device',
        components: { userAgent: 'Mozilla/5.0' },
        ipAddress: '192.168.1.1',
        userId: 'user123'
      };

      await enhancedDeviceService.identifyDevice(request);

      const result = await enhancedDeviceService.getDeviceTrustScore('known_device');

      expect(result.trustScore).toBeGreaterThan(0);
      expect(result.riskLevel).toBeDefined();
      expect(typeof result.factors).toBe('object');
    });
  });

  describe('linkDeviceToUser', () => {
    it('should create device-user association', async () => {
      await enhancedDeviceService.linkDeviceToUser('device123', 'user456', true);

      const associations = mockDb.getMockData('device_user_associations');
      expect(associations.length).toBe(1);
      expect(associations[0].device_fingerprint).toBe('device123');
      expect(associations[0].user_id).toBe('user456');
      expect(associations[0].verified).toBe(true);
    });

    it('should update existing association', async () => {
      // Create initial association
      await enhancedDeviceService.linkDeviceToUser('device123', 'user456', false);

      // Update with verification
      await enhancedDeviceService.linkDeviceToUser('device123', 'user456', true);

      const associations = mockDb.getMockData('device_user_associations');
      expect(associations.length).toBe(1);
      expect(associations[0].verified).toBe(true);
      expect(associations[0].login_count).toBe(2);
    });
  });

  describe('getUserDevices', () => {
    it('should return empty array for user with no devices', async () => {
      const devices = await enhancedDeviceService.getUserDevices('user_no_devices');
      expect(devices).toEqual([]);
    });

    it('should return devices associated with user', async () => {
      // Create device and link to user
      const request = {
        fingerprint: 'user_device',
        components: { userAgent: 'Mozilla/5.0' },
        ipAddress: '192.168.1.1',
        userId: 'user789'
      };

      await enhancedDeviceService.identifyDevice(request);
      await enhancedDeviceService.linkDeviceToUser('user_device', 'user789', true);

      const devices = await enhancedDeviceService.getUserDevices('user789');
      expect(devices.length).toBeGreaterThan(0);
    });
  });

  describe('setDeviceTrust', () => {
    it('should mark device as trusted', async () => {
      // Create device first
      const request = {
        fingerprint: 'trust_device',
        components: { userAgent: 'Mozilla/5.0' },
        ipAddress: '192.168.1.1',
        userId: 'user123'
      };

      await enhancedDeviceService.identifyDevice(request);

      await enhancedDeviceService.setDeviceTrust(
        'trust_device', 
        true, 
        'Admin verification', 
        'admin123'
      );

      const auditEvents = mockAudit.getEvents('device_trust_updated');
      expect(auditEvents.length).toBe(1);
      expect(auditEvents[0].details.trusted).toBe(true);
      expect(auditEvents[0].details.reason).toBe('Admin verification');
    });

    it('should mark device as untrusted', async () => {
      const request = {
        fingerprint: 'untrust_device',
        components: { userAgent: 'Mozilla/5.0' },
        ipAddress: '192.168.1.1',
        userId: 'user123'
      };

      await enhancedDeviceService.identifyDevice(request);

      await enhancedDeviceService.setDeviceTrust(
        'untrust_device', 
        false, 
        'Security violation',
        'admin123'
      );

      const auditEvents = mockAudit.getEvents('device_trust_updated');
      expect(auditEvents.length).toBe(1);
      expect(auditEvents[0].details.trusted).toBe(false);
    });
  });

  describe('detectDeviceCloning', () => {
    it('should detect devices with same canvas fingerprint', async () => {
      // Create two devices with same canvas fingerprint
      mockDb.setMockData('device_fingerprints', [
        {
          fingerprint: 'device1',
          components: JSON.stringify({ canvasFingerprint: 'same_canvas' })
        },
        {
          fingerprint: 'device2',
          components: JSON.stringify({ canvasFingerprint: 'same_canvas' })
        }
      ]);

      const result = await enhancedDeviceService.detectDeviceCloning('device1');

      expect(result.possibleCloning).toBe(true);
      expect(result.indicators).toContain('Duplicate canvas fingerprint detected');
      expect(result.relatedDevices).toContain('device2');
    });

    it('should return false for unique devices', async () => {
      mockDb.setMockData('device_fingerprints', [
        {
          fingerprint: 'unique_device',
          components: JSON.stringify({ canvasFingerprint: 'unique_canvas' })
        }
      ]);

      const result = await enhancedDeviceService.detectDeviceCloning('unique_device');

      expect(result.possibleCloning).toBe(false);
      expect(result.indicators).toEqual([]);
      expect(result.relatedDevices).toEqual([]);
    });
  });

  describe('trust score calculation', () => {
    it('should give higher trust to older devices', async () => {
      // Create device profile with old first_seen date
      const oldDevice = {
        fingerprint: 'old_device',
        device_id: 'dev123',
        trust_score: 50,
        first_seen: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        last_seen: new Date(),
        components: JSON.stringify({}),
        trust_factors: JSON.stringify({}),
        collection_errors: '[]'
      };

      mockDb.setMockData('device_fingerprints', [oldDevice]);

      const result = await enhancedDeviceService.getDeviceTrustScore('old_device');
      expect(result.trustScore).toBeGreaterThan(50);
    });

    it('should give lower trust to devices with security events', async () => {
      // Setup device with security events
      const deviceWithEvents = {
        fingerprint: 'risky_device',
        device_id: 'dev456',
        trust_score: 50,
        first_seen: new Date(),
        last_seen: new Date(),
        components: JSON.stringify({}),
        trust_factors: JSON.stringify({}),
        collection_errors: '[]'
      };

      mockDb.setMockData('device_fingerprints', [deviceWithEvents]);
      mockDb.setMockData('device_security_events', [
        {
          device_fingerprint: 'risky_device',
          event_type: 'anomaly_detected',
          severity: 'high',
          timestamp: new Date(),
          details: '{}'
        }
      ]);

      const result = await enhancedDeviceService.getDeviceTrustScore('risky_device');
      expect(result.trustScore).toBeLessThan(70);
    });
  });

  describe('anomaly detection patterns', () => {
    it('should detect canvas fingerprint changes', async () => {
      const initialRequest = {
        fingerprint: 'canvas_change_test',
        components: {
          canvasFingerprint: 'original_canvas',
          webglFingerprint: 'original_webgl'
        },
        ipAddress: '192.168.1.1',
        userId: 'user123'
      };

      await enhancedDeviceService.identifyDevice(initialRequest);

      const changedRequest = {
        fingerprint: 'canvas_change_test_new',
        components: {
          canvasFingerprint: 'changed_canvas',
          webglFingerprint: 'changed_webgl'
        },
        ipAddress: '192.168.1.1',
        userId: 'user123'
      };

      const result = await enhancedDeviceService.identifyDevice(changedRequest);
      
      const fingerprintChanges = result.anomalies.filter(a => a.type === 'fingerprint_change');
      expect(fingerprintChanges.length).toBeGreaterThan(0);
    });

    it('should calculate fingerprint change severity correctly', async () => {
      const request = {
        fingerprint: 'severity_test',
        components: {
          canvasFingerprint: 'changed',
          webglFingerprint: 'changed',
          audioFingerprint: 'changed',
          userAgent: 'changed'
        },
        ipAddress: '192.168.1.1',
        userId: 'user123'
      };

      // Create initial device
      await enhancedDeviceService.identifyDevice({
        ...request,
        fingerprint: 'severity_test_original',
        components: {
          canvasFingerprint: 'original',
          webglFingerprint: 'original',
          audioFingerprint: 'original',
          userAgent: 'original'
        }
      });

      const result = await enhancedDeviceService.identifyDevice(request);
      
      const criticalAnomalies = result.anomalies.filter(a => a.severity === 'critical');
      expect(criticalAnomalies.length).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Create service with failing database
      const failingDb = {
        query: jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Database error'))
      };

      const failingService = new EnhancedDeviceIdentificationService(
        mockDeviceService as any,
        mockGeoService as any,
        failingDb as any,
        mockRedis as any,
        mockAudit as any
      );

      const request = {
        fingerprint: 'error_test',
        components: { userAgent: 'Mozilla/5.0' },
        ipAddress: '192.168.1.1',
        userId: 'user123'
      };

      await expect(failingService.identifyDevice(request)).rejects.toThrow('Database error');

      const errorEvents = mockAudit.getEvents('device_identification_error');
      expect(errorEvents.length).toBe(1);
    });
  });

  describe('schema initialization', () => {
    it('should create required database tables and indexes', async () => {
      const queries: string[] = [];
      const mockDbWithQueryCapture = {
        query: jest.fn<unknown[], unknown>().mockImplementation((sql: string) => {
          queries.push(sql);
          return Promise.resolve({ rows: [] });
        })
      };

      const service = new EnhancedDeviceIdentificationService(
        mockDeviceService as any,
        mockGeoService as any,
        mockDbWithQueryCapture as any,
        mockRedis as any,
        mockAudit as any
      );

      await service.initializeSchema();

      expect(queries.length).toBeGreaterThan(0);
      expect(queries.some(q => q.includes('CREATE TABLE IF NOT EXISTS device_anomalies'))).toBe(true);
      expect(queries.some(q => q.includes('CREATE TABLE IF NOT EXISTS device_fingerprint_history'))).toBe(true);
      expect(queries.some(q => q.includes('CREATE TABLE IF NOT EXISTS device_location_history'))).toBe(true);
      expect(queries.some(q => q.includes('CREATE INDEX'))).toBe(true);
    });
  });

  describe('caching behavior', () => {
    it('should cache device profiles', async () => {
      const request = {
        fingerprint: 'cached_device',
        components: { userAgent: 'Mozilla/5.0' },
        ipAddress: '192.168.1.1',
        userId: 'user123'
      };

      // First call should cache the profile
      await enhancedDeviceService.identifyDevice(request);

      // Check if cached
      const cached = await mockRedis.get('device_profile:cached_device');
      expect(cached).toBeTruthy();
    });

    it('should use cached profiles when available', async () => {
      const profile = {
        deviceId: 'cached123',
        fingerprint: 'cached_device',
        trustScore: 75,
        riskLevel: 'medium',
        metadata: { lastUpdated: new Date() }
      };

      // Pre-cache a profile
      await mockRedis.setex(
        'device_profile:cached_device',
        3600,
        JSON.stringify(profile)
      );

      const request = {
        fingerprint: 'cached_device',
        components: { userAgent: 'Mozilla/5.0' },
        ipAddress: '192.168.1.1',
        userId: 'user123'
      };

      const result = await enhancedDeviceService.identifyDevice(request);
      expect(result.deviceProfile.deviceId).toBe('cached123');
    });
  });
});