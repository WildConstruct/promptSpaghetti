// SessionMonitoringService Unit Tests

import { SessionMonitoringService, SessionMetrics, SessionAlert } from '../SessionMonitoringService';
import { DatabaseService } from '../../database/DatabaseService';
import { SessionService } from '../SessionService';
import { AuditService } from '../AuditService';
import { RedisService } from '../../database/RedisService';
import { AuthConfig } from '../../types';

// Mock dependencies
jest.mock('../../database/DatabaseService');
jest.mock('../SessionService');
jest.mock('../AuditService');
jest.mock('../../database/RedisService');

describe('SessionMonitoringService', () => {
  let service: SessionMonitoringService;
  let mockDbService: jest.Mocked<DatabaseService>;
  let mockSessionService: jest.Mocked<SessionService>;
  let mockAuditService: jest.Mocked<AuditService>;
  let mockRedisService: jest.Mocked<RedisService>;
  let mockConfig: AuthConfig;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Create mock instances
    mockDbService = new DatabaseService({} as any) as jest.Mocked<DatabaseService>;
    mockSessionService = new SessionService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    ) as jest.Mocked<SessionService>;
    mockAuditService = new AuditService({} as any, {} as any) as jest.Mocked<AuditService>;
    mockRedisService = new RedisService({} as any) as jest.Mocked<RedisService>;

    mockConfig = {
      sessionExpiration: 86400,
      refreshTokenExpiration: 604800,
      otpExpiration: 300,
      maxLoginAttempts: 5,
      lockoutDuration: 900,
      passwordResetExpiration: 3600,
      totpWindow: 1,
      totpSecretLength: 32,
      domain: 'example.com',
      secure: true,
      sameSite: 'strict',
      httpOnly: true
    };

    // Create service instance
    service = new SessionMonitoringService(
      mockConfig,
      mockDbService,
      mockSessionService,
      mockAuditService,
      mockRedisService
    );

    // Setup default mock implementations
    mockDbService.query = jest.fn<unknown[], unknown>().mockResolvedValue({ rows: [] } as unknown as unknown as unknown as unknown);
    mockAuditService.logEvent = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown as unknown as unknown);
    mockRedisService.setex = jest.fn<unknown[], unknown>().mockResolvedValue('OK' as unknown as unknown as unknown as unknown);
    mockRedisService.get = jest.fn<unknown[], unknown>().mockResolvedValue(null as unknown as unknown as unknown as unknown);
  });

  afterEach(() => {
    jest.useRealTimers();
    service.stopMonitoring();
  });

  describe('collectMetrics', () => {
    it('should collect and calculate session metrics correctly', async () => {
      const mockSessions = [
        {
          user_id: 'user-1',
          device_info: { platform: 'Windows' },
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          created_at: new Date(Date.now() - 3600000), // 1 hour ago
          last_accessed_at: new Date()
        },
        {
          user_id: 'user-1',
          device_info: { platform: 'iOS' },
          ip_address: '192.168.1.2',
          user_agent: 'Safari',
          created_at: new Date(Date.now() - 7200000), // 2 hours ago
          last_accessed_at: new Date()
        },
        {
          user_id: 'user-2',
          device_info: { platform: 'Android' },
          ip_address: '192.168.1.3',
          user_agent: 'Chrome',
          created_at: new Date(Date.now() - 1800000), // 30 min ago
          last_accessed_at: new Date()
        }
      ];

      mockDbService.query
        .mockResolvedValueOnce({ rows: mockSessions }) // Active sessions
        .mockResolvedValueOnce({ rows: [{ count: '2' }] }); // Suspicious activities

      const metrics = await service.collectMetrics();

      expect(metrics.totalActiveSessions).toBe(3);
      expect(metrics.sessionsByDevice).toEqual({
        Windows: 1,
        iOS: 1,
        Android: 1
      });
      expect(metrics.concurrentSessionsPerUser).toEqual({
        'user-1': 2,
        'user-2': 1
      });
      expect(metrics.suspiciousActivities).toBe(2);
      expect(metrics.averageSessionDuration).toBeGreaterThan(0);
    });

    it('should handle empty sessions gracefully', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [] }) // No active sessions
        .mockResolvedValueOnce({ rows: [{ count: '0' }] }); // No suspicious activities

      const metrics = await service.collectMetrics();

      expect(metrics.totalActiveSessions).toBe(0);
      expect(metrics.sessionsByDevice).toEqual({});
      expect(metrics.concurrentSessionsPerUser).toEqual({});
      expect(metrics.averageSessionDuration).toBe(0);
    });
  });

  describe('createAlert', () => {
    it('should create and store an alert', async () => {
      const alertData = {
        type: 'concurrent_limit' as const,
        userId: 'user-123',
        severity: 'medium' as const,
        details: {
          sessionCount: 6,
          threshold: 5
        }
      };

      const alert = await service.createAlert(alertData);

      expect(alert).toMatchObject({
        ...alertData,
        id: expect.any(String),
        createdAt: expect.any(Date),
        resolved: false
      });

      expect(mockDbService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO session_alerts'),
        expect.arrayContaining([
          expect.any(String), // id
          alertData.type,
          alertData.userId,
          undefined, // sessionId
          alertData.severity,
          JSON.stringify(alertData.details),
          expect.any(Date), // createdAt
          false // resolved
        ])
      );

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        userId: alertData.userId,
        action: 'session_alert_created',
        details: expect.objectContaining({
          alertType: alertData.type,
          severity: alertData.severity
        }),
        severity: alertData.severity
      });
    });

    it('should handle critical alerts with automatic actions', async () => {
      const criticalAlert = {
        type: 'session_hijack_attempt' as const,
        userId: 'user-123',
        sessionId: 'session-123',
        severity: 'critical' as const,
        details: {
          ipAddresses: ['192.168.1.1', '10.0.0.1'],
          userAgents: ['Chrome', 'Firefox']
        }
      };

      mockDbService.query.mockResolvedValueOnce({ rows: [] }); // Alert insert
      mockDbService.query.mockResolvedValueOnce({ 
        rows: [{ email: 'user@example.com' }] 
      }); // User email lookup
      mockSessionService.revokeAllUserSessions = jest.fn<unknown[], unknown>().mockResolvedValue(2 as unknown as unknown as unknown as unknown);

      const alert = await service.createAlert(criticalAlert);

      expect(alert.severity).toBe('critical');
      expect(mockSessionService.revokeAllUserSessions).toHaveBeenCalledWith('user-123');
      expect(mockDbService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO notifications'),
        expect.any(Array)
      );
    });
  });

  describe('resolveAlert', () => {
    it('should mark alert as resolved', async () => {
      const alertId = 'alert-123';
      const resolvedBy = 'admin-user';

      await service.resolveAlert(alertId, resolvedBy);

      expect(mockDbService.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE session_alerts'),
        [expect.any(Date), resolvedBy, alertId]
      );

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        userId: resolvedBy,
        action: 'session_alert_resolved',
        details: { alertId },
        severity: 'info'
      });
    });
  });

  describe('monitoring cycle', () => {
    it('should start and stop monitoring', async () => {
      const collectMetricsSpy = jest.spyOn(service, 'collectMetrics').mockResolvedValue({
        totalActiveSessions: 10,
        sessionsByDevice: {},
        sessionsByLocation: {},
        averageSessionDuration: 3600,
        suspiciousActivities: 0,
        concurrentSessionsPerUser: {}
      } as unknown as unknown as unknown as unknown);

      service.startMonitoring(100); // 100ms interval for testing

      // Advance timer to trigger monitoring
      jest.advanceTimersByTime(100);

      await Promise.resolve(); // Let promises resolve

      expect(collectMetricsSpy).toHaveBeenCalled();

      service.stopMonitoring();

      // Clear call count
      collectMetricsSpy.mockClear();

      // Advance timer again - should not trigger after stop
      jest.advanceTimersByTime(100);

      expect(collectMetricsSpy).not.toHaveBeenCalled();
    });
  });

  describe('getSessionAnalytics', () => {
    it('should generate comprehensive analytics report', async () => {
      const userId = 'user-123';
      const timeRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      // Mock metrics query
      mockDbService.query
        .mockResolvedValueOnce({ 
          rows: [{
            total_sessions: '42',
            unique_devices: '3',
            unique_locations: '5',
            avg_duration: '3600.5',
            peak_concurrent: '4'
          }]
        })
        // Mock login attempts
        .mockResolvedValueOnce({
          rows: [{
            failed_attempts: '7',
            successful_logins: '35'
          }]
        })
        // Mock hourly patterns
        .mockResolvedValueOnce({
          rows: [
            { hour: '9', count: '10' },
            { hour: '14', count: '15' },
            { hour: '18', count: '8' }
          ]
        })
        // Mock device stats
        .mockResolvedValueOnce({
          rows: [
            { device: 'Windows', count: '20' },
            { device: 'MacOS', count: '15' },
            { device: 'iOS', count: '7' }
          ]
        })
        // Mock location stats
        .mockResolvedValueOnce({
          rows: [
            { ip_address: '192.168.1.1', count: '25' }
          ]
        });

      const analytics = await service.getSessionAnalytics(userId, timeRange);

      expect(analytics).toMatchObject({
        userId,
        timeRange,
        metrics: {
          totalSessions: 42,
          uniqueDevices: 3,
          uniqueLocations: 5,
          averageDuration: 3600.5,
          peakConcurrentSessions: 4,
          failedAttempts: 7,
          successfulLogins: 35
        },
        patterns: {
          mostActiveHours: expect.any(Array),
          commonDevices: expect.arrayContaining([
            { device: 'Windows', count: 20 }
          ]),
          commonLocations: expect.any(Array)
        },
        anomalies: expect.any(Array)
      });

      // Check hourly pattern array
      expect(analytics.patterns.mostActiveHours).toHaveLength(24);
      expect(analytics.patterns.mostActiveHours[9]).toBe(10);
      expect(analytics.patterns.mostActiveHours[14]).toBe(15);
      expect(analytics.patterns.mostActiveHours[18]).toBe(8);
    });
  });

  describe('anomaly detection', () => {
    it('should detect concurrent session limit violations', async () => {
      const metrics: SessionMetrics = {
        totalActiveSessions: 20,
        sessionsByDevice: {},
        sessionsByLocation: {},
        averageSessionDuration: 3600,
        suspiciousActivities: 0,
        concurrentSessionsPerUser: {
          'user-1': 6, // Over threshold
          'user-2': 3  // Under threshold
        }
      };

      const createAlertSpy = jest.spyOn(service, 'createAlert').mockResolvedValue({
        id: 'alert-1',
        type: 'concurrent_limit',
        userId: 'user-1',
        severity: 'medium',
        details: {},
        createdAt: new Date( as unknown as unknown),
        resolved: false
      });

      // Mock additional queries for other anomaly checks
      mockDbService.query.mockResolvedValue({ rows: [] } as unknown as unknown as unknown as unknown);

      await (service as any).checkForAnomalies(metrics);

      expect(createAlertSpy).toHaveBeenCalledWith({
        type: 'concurrent_limit',
        userId: 'user-1',
        severity: 'medium',
        details: {
          sessionCount: 6,
          threshold: 5
        }
      });

      expect(createAlertSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-2' })
      );
    });

    it('should detect rapid location changes', async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{
          user_id: 'user-123',
          session_token: 'session-123',
          ip_address: '192.168.1.1',
          created_at: new Date(),
          prev_ip: '10.0.0.1',
          prev_created: new Date(Date.now() - 60000) // 1 minute ago
        }]
      });

      // Mock the getLocationFromIP method to return location data
      jest.spyOn(service as any, 'getLocationFromIP')
        .mockResolvedValueOnce({ latitude: 40.7128, longitude: -74.0060, city: 'New York' }) // prev_ip location
        .mockResolvedValueOnce({ latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles' }); // current ip location

      const createAlertSpy = jest.spyOn(service, 'createAlert').mockResolvedValue({
        id: 'alert-1',
        type: 'rapid_location_change',
        userId: 'user-123',
        sessionId: 'session-123',
        severity: 'high',
        details: {},
        createdAt: new Date( as unknown as unknown),
        resolved: false
      });

      await (service as any).checkRapidLocationChanges();

      expect(createAlertSpy).toHaveBeenCalledWith({
        type: 'rapid_location_change',
        userId: 'user-123',
        sessionId: 'session-123',
        severity: 'high',
        details: expect.objectContaining({
          fromLocation: expect.any(Object),
          toLocation: expect.any(Object),
          distanceKm: expect.any(Number)
        })
      });
    });

    it('should detect session hijacking attempts', async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{
          session_token: 'session-123',
          user_id: 'user-123',
          ips: ['192.168.1.1', '10.0.0.1'],
          user_agents: ['Chrome', 'Firefox'],
          ip_count: 2,
          ua_count: 2
        }]
      });

      mockSessionService.revokeSession = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown as unknown as unknown);

      const createAlertSpy = jest.spyOn(service, 'createAlert').mockImplementation(async () => ({
        id: 'alert-1',
        type: 'session_hijack_attempt',
        userId: 'user-123',
        sessionId: 'session-123',
        severity: 'critical',
        details: {},
        createdAt: new Date(),
        resolved: false
      }));

      await (service as any).checkSessionHijacking();

      expect(createAlertSpy).toHaveBeenCalledWith({
        type: 'session_hijack_attempt',
        userId: 'user-123',
        sessionId: 'session-123',
        severity: 'critical',
        details: {
          ipAddresses: ['192.168.1.1', '10.0.0.1'],
          userAgents: ['Chrome', 'Firefox'],
          ipCount: 2,
          userAgentCount: 2
        }
      });

      expect(mockSessionService.revokeSession).toHaveBeenCalledWith(
        'session-123',
        'Potential session hijacking detected'
      );
    });
  });

  describe('caching', () => {
    it('should cache metrics after collection', async () => {
      const metrics: SessionMetrics = {
        totalActiveSessions: 10,
        sessionsByDevice: { Windows: 5, MacOS: 5 },
        sessionsByLocation: { US: 10 },
        averageSessionDuration: 3600,
        suspiciousActivities: 0,
        concurrentSessionsPerUser: { 'user-1': 2 }
      };

      mockDbService.query.mockResolvedValue({ rows: [] } as unknown as unknown as unknown as unknown);
      
      await (service as any).updateMetricsCache(metrics);

      expect(mockRedisService.setex).toHaveBeenCalledWith(
        'session_metrics:current',
        300, // 5 minutes TTL
        expect.stringContaining('"totalActiveSessions":10')
      );
    });

    it('should return cached metrics when available', async () => {
      const cachedMetrics = {
        metrics: {
          totalActiveSessions: 15,
          sessionsByDevice: {},
          sessionsByLocation: {},
          averageSessionDuration: 4000,
          suspiciousActivities: 1,
          concurrentSessionsPerUser: {}
        },
        timestamp: new Date()
      };

      mockRedisService.get.mockResolvedValue(JSON.stringify(cachedMetrics as unknown as unknown as unknown as unknown));

      const metrics = await service.getCachedMetrics();

      expect(metrics).toEqual(cachedMetrics.metrics);
      expect(mockRedisService.get).toHaveBeenCalledWith('session_metrics:current');
    });
  });

  describe('monitoring rules', () => {
    it('should retrieve monitoring rules', async () => {
      const mockRules = [
        {
          id: 'rule-1',
          name: 'Concurrent Session Limit',
          type: 'concurrent_sessions',
          enabled: true,
          threshold: 5,
          parameters: { grace_period_minutes: 5 },
          action: 'alert'
        }
      ];

      mockDbService.query.mockResolvedValue({ rows: mockRules } as unknown as unknown as unknown as unknown);

      const rules = await service.getMonitoringRules();

      expect(rules).toEqual(mockRules);
      expect(mockDbService.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM session_monitoring_rules WHERE enabled = true')
      );
    });

    it('should update monitoring rule', async () => {
      const ruleId = 'rule-1';
      const updates = {
        threshold: 10,
        enabled: false
      };

      await service.updateMonitoringRule(ruleId, updates);

      expect(mockDbService.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE session_monitoring_rules SET'),
        [ruleId, 10, false]
      );
    });
  });
});