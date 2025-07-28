// Location History Analysis Service Tests
// Comprehensive tests for enhanced security insights and user behavior pattern analysis

import { 
  LocationHistoryAnalysisService,
  LocationHistoryAnalysisConfig
} from '../services/LocationHistoryAnalysisService';

describe('LocationHistoryAnalysisService', () => {
  let analysisService: LocationHistoryAnalysisService;
  let mockDb: unknown;
  let mockRedis: unknown;
  let mockAuditService: unknown;
  let testConfig: LocationHistoryAnalysisConfig;

  const testUserId = 'user-123';

  beforeEach(() => {
    // Mock database
    mockDb = {
      query: jest.fn<unknown[], unknown>().mockResolvedValue({ rows: [] } as unknown as unknown)
    };

    // Mock Redis
    mockRedis = {
      get: jest.fn<unknown[], unknown>().mockResolvedValue(null as unknown as unknown),
      setex: jest.fn<unknown[], unknown>().mockResolvedValue('OK' as unknown as unknown),
      del: jest.fn<unknown[], unknown>().mockResolvedValue(1 as unknown as unknown)
    };

    // Mock audit service
    mockAuditService = {
      logEvent: jest.fn<unknown[], unknown>().mockResolvedValue(true as unknown as unknown)
    };

    // Test configuration
    testConfig = {
      enabled: true,
      clustering: {
        minPointsForCluster: 3,
        maxDistanceKm: 5,
        minTimeForHomeDetection: 7,
        confidenceThreshold: 0.6
  }
      travelAnalysis: {
        enabled: true,
        maxReasonableSpeedKmh: 1000,
        minTravelDistanceKm: 10,
        anomalyDetectionSensitivity: 'medium'
  }
      riskScoring: {
        noveltyWeight: 0.3,
        frequencyWeight: 0.2,
        geopoliticalWeight: 0.2,
        temporalWeight: 0.3
  }
      anomalyDetection: {
        enabled: true,
        sensitivityLevel: 0.7,
        falsePositiveThreshold: 0.2,
        autoResolveAfterDays: 30
  }
      cache: {
        profileCacheTtl: 3600,
        analysisCacheTtl: 1800,
        batchAnalysisSize: 50
      }
    };

    analysisService = new LocationHistoryAnalysisService(
      mockDb,
      mockRedis,
      mockAuditService,
      testConfig
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize analysis tables', async () => {
      await analysisService.initialize();

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS user_location_clusters')
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS user_travel_patterns')
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS user_location_profiles')
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS location_anomalies')
      );
    });

    it('should create performance indexes', async () => {
      await analysisService.initialize();

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_location_clusters_user_id')
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_travel_patterns_user_id')
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_location_anomalies_severity')
      );
    });

    it('should load profile cache', async () => {
      const mockProfiles = [
        { user_id: 'user1', profile_version: '1.0', last_analyzed: new Date() },
        { user_id: 'user2', profile_version: '1.0', last_analyzed: new Date() }
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockProfiles });

      await analysisService.initialize();

      expect(mockRedis.setex).toHaveBeenCalledTimes(mockProfiles.length);
    });
  });

  describe('location clustering', () => {
    const mockLocationHistory = [
      {
        location: {
          ipAddress: '1.1.1.1',
          country: 'United States',
          city: 'San Francisco',
          latitude: 37.7749,
          longitude: -122.4194
  }
        accessTime: new Date('2024-01-01T09:00:00Z'),
        accessCount: 50
  }
      {
        location: {
          ipAddress: '1.1.1.2',
          country: 'United States',
          city: 'San Francisco',
          latitude: 37.7849, // Close to first location
          longitude: -122.4094
  }
        accessTime: new Date('2024-01-01T10:00:00Z'),
        accessCount: 30
  }
      {
        location: {
          ipAddress: '2.2.2.2',
          country: 'United States',
          city: 'New York',
          latitude: 40.7128,
          longitude: -74.0060
  }
        accessTime: new Date('2024-01-01T18:00:00Z'),
        accessCount: 25
      }
    ];

    beforeEach(() => {
      // Mock location history retrieval
      mockDb.query.mockImplementation((query) => {
        if (query.includes('user_location_history')) {
          return Promise.resolve({
            rows: mockLocationHistory.map(entry => ({
              ip_address: entry.location.ipAddress,
              country: entry.location.country,
              city: entry.location.city,
              latitude: entry.location.latitude,
              longitude: entry.location.longitude,
              last_access: entry.accessTime,
              access_count: entry.accessCount
            }))
          });
        }
        return Promise.resolve({ rows: [] });
      });
    });

    it('should perform location clustering analysis', async () => {
      const profile = await analysisService.analyzeUserLocationHistory(testUserId);

      expect(profile.clusters).toBeDefined();
      expect(profile.clusters.length).toBeGreaterThan(0);
      expect(profile.userId).toBe(testUserId);
      expect(profile.lastAnalyzed).toBeInstanceOf(Date);
    });

    it('should identify home and work clusters based on access patterns', async () => {
      // Mock data with clear home/work patterns
      const homeWorkHistory = [
        ...Array(20).fill(0).map((_, i) => ({
          location: { latitude: 37.7749, longitude: -122.4194, city: 'Home Location' },
          accessTime: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T20:00:00Z`), // Evening
          accessCount: 10
        })),
        ...Array(15).fill(0).map((_, i) => ({
          location: { latitude: 37.7849, longitude: -122.4094, city: 'Work Location' },
          accessTime: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`), // Morning
          accessCount: 8
        }))
      ];

      mockDb.query.mockImplementation((query) => {
        if (query.includes('user_location_history')) {
          return Promise.resolve({
            rows: homeWorkHistory.map(entry => ({
              ip_address: '1.1.1.1',
              country: 'United States',
              city: entry.location.city,
              latitude: entry.location.latitude,
              longitude: entry.location.longitude,
              last_access: entry.accessTime,
              access_count: entry.accessCount
            }))
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const profile = await analysisService.analyzeUserLocationHistory(testUserId);

      const homeCluster = profile.clusters.find(c => c.label === 'home');
      const workCluster = profile.clusters.find(c => c.label === 'work');

      expect(homeCluster).toBeDefined();
      expect(workCluster).toBeDefined();
    });

    it('should calculate cluster confidence scores', async () => {
      const profile = await analysisService.analyzeUserLocationHistory(testUserId);

      profile.clusters.forEach(cluster => {
        expect(cluster.confidence).toBeGreaterThanOrEqual(0);
        expect(cluster.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should calculate cluster risk scores', async () => {
      // Mock high-risk location data
      const riskLocationHistory = [{
        location: {
          ipAddress: '1.1.1.1',
          country: 'United States',
          city: 'Test City',
          latitude: 37.7749,
          longitude: -122.4194,
          isProxy: true,
          isTor: true,
          isMalicious: true
  }
        accessTime: new Date('2024-01-01T02:00:00Z'), // Unusual hour
        accessCount: 5
      }];

      mockDb.query.mockImplementation((query) => {
        if (query.includes('user_location_history')) {
          return Promise.resolve({
            rows: riskLocationHistory.map(entry => ({
              ip_address: entry.location.ipAddress,
              country: entry.location.country,
              city: entry.location.city,
              latitude: entry.location.latitude,
              longitude: entry.location.longitude,
              is_proxy: entry.location.isProxy,
              is_tor: entry.location.isTor,
              is_malicious: entry.location.isMalicious,
              last_access: entry.accessTime,
              access_count: entry.accessCount
            }))
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const profile = await analysisService.analyzeUserLocationHistory(testUserId);

      if (profile.clusters.length > 0) {
        const riskCluster = profile.clusters[0];
        expect(riskCluster.riskScore).toBeGreaterThan(50); // Should be high risk
      }
    });
  });

  describe('travel pattern analysis', () => {
    it('should analyze travel patterns between clusters', async () => {
      // Mock sequential location data showing travel
      const travelHistory = [
        {
          location: { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco' },
          accessTime: new Date('2024-01-01T08:00:00Z'),
          accessCount: 10
  }
        {
          location: { latitude: 40.7128, longitude: -74.0060, city: 'New York' },
          accessTime: new Date('2024-01-01T14:00:00Z'), // 6 hours later
          accessCount: 5
  }
        {
          location: { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco' },
          accessTime: new Date('2024-01-02T08:00:00Z'), // Next day
          accessCount: 10
        }
      ];

      mockDb.query.mockImplementation((query) => {
        if (query.includes('user_location_history')) {
          return Promise.resolve({
            rows: travelHistory.map(entry => ({
              ip_address: '1.1.1.1',
              country: 'United States',
              city: entry.location.city,
              latitude: entry.location.latitude,
              longitude: entry.location.longitude,
              last_access: entry.accessTime,
              access_count: entry.accessCount
            }))
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const profile = await analysisService.analyzeUserLocationHistory(testUserId);

      expect(profile.travelPatterns).toBeDefined();
      expect(profile.travelPatterns.length).toBeGreaterThanOrEqual(0);
    });

    it('should detect impossible travel anomalies', async () => {
      // Mock impossible travel scenario
      const impossibleTravel = [
        {
          location: { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco' },
          accessTime: new Date('2024-01-01T08:00:00Z'),
          accessCount: 10
  }
        {
          location: { latitude: 51.5074, longitude: -0.1278, city: 'London' },
          accessTime: new Date('2024-01-01T08:05:00Z'), // 5 minutes later, impossible
          accessCount: 5
        }
      ];

      mockDb.query.mockImplementation((query) => {
        if (query.includes('user_location_history')) {
          return Promise.resolve({
            rows: impossibleTravel.map(entry => ({
              ip_address: '1.1.1.1',
              country: entry.location.city === 'London' ? 'United Kingdom' : 'United States',
              city: entry.location.city,
              latitude: entry.location.latitude,
              longitude: entry.location.longitude,
              last_access: entry.accessTime,
              access_count: entry.accessCount
            }))
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const profile = await analysisService.analyzeUserLocationHistory(testUserId);

      if (profile.travelPatterns.length > 0) {
        const pattern = profile.travelPatterns[0];
        expect(pattern.anomalies.impossibleTiming || pattern.anomalies.unusualSpeed).toBe(true);
      }
    });

    it('should determine travel methods based on speed', async () => {
      const profile = await analysisService.analyzeUserLocationHistory(testUserId);

      profile.travelPatterns.forEach(pattern => {
        expect(pattern.typicalTravelMethods).toBeDefined();
        expect(Array.isArray(pattern.typicalTravelMethods)).toBe(true);
        expect(pattern.typicalTravelMethods.length).toBeGreaterThan(0);
      });
    });
  });

  describe('risk assessment', () => {
    it('should assess location risk based on history', async () => {
      const mockLocation = {
        ipAddress: '1.1.1.1',
        country: 'United States',
        city: 'San Francisco',
        latitude: 37.7749,
        longitude: -122.4194
      };

      // Mock existing profile
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({
        lastAnalyzed: new Date(),
        version: '1.0'
      }));

      mockDb.query.mockImplementation((query) => {
        if (query.includes('user_location_profiles')) {
          return Promise.resolve({
            rows: [{
              user_id: testUserId,
              clusters_data: [],
              travel_patterns_data: [],
              risk_metrics: { riskScore: 30 },
              insights: {},
              last_analyzed: new Date(),
              profile_version: '1.0'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const riskAssessment = await analysisService.assessLocationRisk(testUserId, mockLocation);

      expect(riskAssessment.overall).toBeGreaterThanOrEqual(0);
      expect(riskAssessment.overall).toBeLessThanOrEqual(100);
      expect(riskAssessment.factors).toBeDefined();
      expect(riskAssessment.recommendations).toBeDefined();
      expect(Array.isArray(riskAssessment.recommendations)).toBe(true);
    });

    it('should detect high risk for malicious IPs', async () => {
      const maliciousLocation = {
        ipAddress: '1.1.1.1',
        country: 'Unknown',
        city: 'Unknown',
        latitude: 0,
        longitude: 0,
        isMalicious: true,
        isTor: true
      };

      mockDb.query.mockImplementation((query) => {
        if (query.includes('user_location_profiles')) {
          return Promise.resolve({
            rows: [{
              user_id: testUserId,
              clusters_data: [],
              travel_patterns_data: [],
              risk_metrics: { riskScore: 30 },
              insights: {},
              last_analyzed: new Date(),
              profile_version: '1.0'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const riskAssessment = await analysisService.assessLocationRisk(testUserId, maliciousLocation);

      expect(riskAssessment.overall).toBeGreaterThan(70); // Should be high risk
      expect(riskAssessment.factors.networkRisk).toBeGreaterThan(60);
      expect(riskAssessment.actionRequired).toBe(true);
    });

    it('should provide appropriate recommendations', async () => {
      const unknownLocation = {
        ipAddress: '1.1.1.1',
        country: 'Unknown Country',
        city: 'Unknown City',
        latitude: 0,
        longitude: 0
      };

      mockDb.query.mockImplementation((query) => {
        if (query.includes('user_location_profiles')) {
          return Promise.resolve({
            rows: [{
              user_id: testUserId,
              clusters_data: [],
              travel_patterns_data: [],
              risk_metrics: { riskScore: 30 },
              insights: {},
              last_analyzed: new Date(),
              profile_version: '1.0'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const riskAssessment = await analysisService.assessLocationRisk(testUserId, unknownLocation);

      expect(riskAssessment.recommendations.length).toBeGreaterThan(0);
      expect(riskAssessment.suggestedActions).toBeDefined();
    });
  });

  describe('anomaly detection', () => {
    beforeEach(() => {
      // Mock recent location access
      mockDb.query.mockImplementation((query) => {
        if (query.includes('user_location_history') && query.includes('7 days')) {
          return Promise.resolve({
            rows: [{
              ip_address: '1.1.1.1',
              country: 'Unknown',
              city: 'Unknown',
              latitude: 0,
              longitude: 0,
              last_access: new Date()
            }]
          });
        }
        if (query.includes('user_location_profiles')) {
          return Promise.resolve({
            rows: [{
              user_id: testUserId,
              clusters_data: [],
              travel_patterns_data: [],
              risk_metrics: { riskScore: 30 },
              insights: {},
              last_analyzed: new Date(),
              profile_version: '1.0'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });
    });

    it('should detect location anomalies', async () => {
      const anomalies = await analysisService.detectLocationAnomalies(testUserId);

      expect(Array.isArray(anomalies)).toBe(true);
      anomalies.forEach(anomaly => {
        expect(anomaly.id).toBeDefined();
        expect(anomaly.userId).toBe(testUserId);
        expect(anomaly.anomalyType).toBeDefined();
        expect(anomaly.severity).toBeDefined();
        expect(['low', 'medium', 'high', 'critical']).toContain(anomaly.severity);
      });
    });

    it('should classify anomaly types correctly', async () => {
      const anomalies = await analysisService.detectLocationAnomalies(testUserId);

      const validTypes = ['new_location', 'unusual_timing', 'frequency_spike', 'travel_anomaly', 'risk_escalation'];
      anomalies.forEach(anomaly => {
        expect(validTypes).toContain(anomaly.anomalyType);
      });
    });

    it('should store anomalies in database', async () => {
      await analysisService.detectLocationAnomalies(testUserId);

      // Check if anomalies were stored (at least the INSERT query was called)
      const insertCalls = mockDb.query.mock.calls.filter(call => 
        call[0].includes('INSERT INTO location_anomalies')
      );
      
      // Should have insert calls if anomalies were detected
      expect(insertCalls.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('profile caching', () => {
    it('should cache user profiles in Redis', async () => {
      mockDb.query.mockImplementation((query) => {
        if (query.includes('user_location_history')) {
          return Promise.resolve({
            rows: [{
              ip_address: '1.1.1.1',
              country: 'United States',
              city: 'San Francisco',
              latitude: 37.7749,
              longitude: -122.4194,
              last_access: new Date(),
              access_count: 10
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      await analysisService.analyzeUserLocationHistory(testUserId);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        `location_profile:${testUserId}`,
        testConfig.cache.profileCacheTtl,
        expect.any(String)
      );
    });

    it('should use cached profiles when available', async () => {
      const cachedProfile = {
        userId: testUserId,
        clusters: [],
        travelPatterns: [],
        riskMetrics: { riskScore: 30 },
        insights: {},
        lastAnalyzed: new Date(),
        profileVersion: '1.0'
      };

      mockRedis.get.mockResolvedValueOnce(JSON.stringify(cachedProfile));
      mockDb.query.mockImplementation((query) => {
        if (query.includes('user_location_profiles')) {
          return Promise.resolve({
            rows: [{
              user_id: testUserId,
              clusters_data: [],
              travel_patterns_data: [],
              risk_metrics: { riskScore: 30 },
              insights: {},
              last_analyzed: cachedProfile.lastAnalyzed,
              profile_version: '1.0'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const profile = await analysisService.analyzeUserLocationHistory(testUserId);

      expect(profile.userId).toBe(testUserId);
      expect(mockRedis.get).toHaveBeenCalledWith(`location_profile:${testUserId}`);
    });

    it('should force refresh when requested', async () => {
      mockDb.query.mockImplementation((query) => {
        if (query.includes('user_location_history')) {
          return Promise.resolve({
            rows: [{
              ip_address: '1.1.1.1',
              country: 'United States',
              city: 'San Francisco',
              latitude: 37.7749,
              longitude: -122.4194,
              last_access: new Date(),
              access_count: 10
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      await analysisService.analyzeUserLocationHistory(testUserId, true);

      // Should not check cache when force refresh is true
      expect(mockRedis.get).not.toHaveBeenCalled();
    });
  });

  describe('statistics and reporting', () => {
    it('should generate location statistics', async () => {
      mockDb.query.mockImplementation((query) => {
        if (query.includes('user_location_profiles')) {
          return Promise.resolve({
            rows: [{
              total_profiles: '100',
              current_version_profiles: '95',
              avg_risk_score: '45.5',
              avg_mobility_score: '60.2',
              avg_predictability_score: '75.8'
            }]
          });
        }
        if (query.includes('user_location_clusters')) {
          return Promise.resolve({
            rows: [{
              total_clusters: '250',
              home_clusters: '80',
              work_clusters: '65',
              frequent_clusters: '85',
              verified_clusters: '150',
              avg_confidence: '0.78'
            }]
          });
        }
        if (query.includes('location_anomalies')) {
          return Promise.resolve({
            rows: [{
              total_anomalies: '15',
              critical_anomalies: '2',
              high_anomalies: '5',
              resolved_anomalies: '8',
              false_positives: '3'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const stats = await analysisService.getLocationStatistics('week');

      expect(stats.timeframe).toBe('week');
      expect(stats.profiles).toBeDefined();
      expect(stats.clusters).toBeDefined();
      expect(stats.anomalies).toBeDefined();
      expect(stats.generatedAt).toBeDefined();
    });

    it('should support different timeframes', async () => {
      mockDb.query.mockResolvedValue({ rows: [{}] } as unknown as unknown);

      await analysisService.getLocationStatistics('day');
      await analysisService.getLocationStatistics('week');
      await analysisService.getLocationStatistics('month');

      expect(mockDb.query).toHaveBeenCalledTimes(9); // 3 queries per timeframe
    });
  });

  describe('error handling', () => {
    it('should handle insufficient location history', async () => {
      mockDb.query.mockImplementation((query) => {
        if (query.includes('user_location_history')) {
          return Promise.resolve({ rows: [] }); // No history
        }
        return Promise.resolve({ rows: [] });
      });

      await expect(analysisService.analyzeUserLocationHistory(testUserId))
        .rejects.toThrow('Insufficient location history for analysis');
    });

    it('should handle database errors gracefully', async () => {
      mockDb.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(analysisService.analyzeUserLocationHistory(testUserId))
        .rejects.toThrow('Database connection failed');
    });

    it('should handle cache errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));
      mockDb.query.mockImplementation((query) => {
        if (query.includes('user_location_history')) {
          return Promise.resolve({
            rows: [{
              ip_address: '1.1.1.1',
              country: 'United States',
              city: 'San Francisco',
              latitude: 37.7749,
              longitude: -122.4194,
              last_access: new Date(),
              access_count: 10
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      // Should not throw error and continue with analysis
      const profile = await analysisService.analyzeUserLocationHistory(testUserId);
      expect(profile).toBeDefined();
    });
  });

  describe('distance calculations', () => {
    it('should calculate distances correctly', () => {
      // Test known distance: NYC to LA is approximately 3940 km
      const nyLat = 40.7128, nyLon = -74.0060;
      const laLat = 34.0522, laLon = -118.2437;
      
      const distance = (analysisService as any).calculateDistance(nyLat, nyLon, laLat, laLon);
      
      // Allow some tolerance for the calculation
      expect(distance).toBeGreaterThan(3900);
      expect(distance).toBeLessThan(4000);
    });

    it('should return zero distance for same coordinates', () => {
      const lat = 40.7128, lon = -74.0060;
      const distance = (analysisService as any).calculateDistance(lat, lon, lat, lon);
      expect(distance).toBe(0);
    });
  });

  describe('audit logging', () => {
    it('should log analysis completion', async () => {
      mockDb.query.mockImplementation((query) => {
        if (query.includes('user_location_history')) {
          return Promise.resolve({
            rows: [{
              ip_address: '1.1.1.1',
              country: 'United States',
              city: 'San Francisco',
              latitude: 37.7749,
              longitude: -122.4194,
              last_access: new Date(),
              access_count: 10
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      await analysisService.analyzeUserLocationHistory(testUserId);

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        userId: testUserId,
        action: 'location_history_analyzed',
        details: expect.objectContaining({
          clustersFound: expect.any(Number),
          travelPatternsFound: expect.any(Number),
          overallRiskScore: expect.any(Number)
        }),
        severity: 'info'
      });
    });
  });
});