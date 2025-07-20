// Anomaly Detection Service Tests
// Comprehensive tests for anomaly detection functionality

import { AnomalyDetectionService, AnomalyDetectionConfig } from '../services/AnomalyDetectionService';
import { EventEmitter } from 'events';

describe('AnomalyDetectionService', () => {
  let anomalyService: AnomalyDetectionService;
  let mockDb: any;
  let mockRedis: any;
  let mockAuditService: any;
  let testConfig: AnomalyDetectionConfig;

  beforeEach(() => {
    // Mock database
    mockDb = {
      query: jest.fn().mockResolvedValue({ rows: [] })
    };

    // Mock Redis
    mockRedis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      setex: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1)
    };

    // Mock audit service
    mockAuditService = {
      logEvent: jest.fn().mockResolvedValue(true)
    };

    // Test configuration
    testConfig = {
      enabled: true,
      checkIntervalSeconds: 60,
      retentionDays: 30,
      patterns: [],
      notification: {
        email: ['security@test.com']
      },
      responseConfig: {
        autoBlock: true,
        autoDisable: false,
        requireManualReview: true
      }
    };

    anomalyService = new AnomalyDetectionService(
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
    it('should initialize database tables on start', async () => {
      await anomalyService.start();

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS anomaly_patterns')
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS anomaly_events')
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS anomaly_actions_log')
      );
    });

    it('should load default patterns on start', async () => {
      await anomalyService.start();

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO anomaly_patterns'),
        expect.arrayContaining([
          'brute-force-login',
          'Brute Force Login Detection',
          expect.any(String), // description
          'high',
          true,
          10,
          5,
          expect.any(String), // conditions JSON
          expect.any(String)  // actions JSON
        ])
      );
    });

    it('should start periodic anomaly checking', async () => {
      jest.useFakeTimers();
      
      await anomalyService.start();
      
      // Fast-forward time to trigger check
      jest.advanceTimersByTime(testConfig.checkIntervalSeconds * 1000);
      
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM anomaly_patterns')
      );

      jest.useRealTimers();
    });
  });

  describe('pattern detection', () => {
    beforeEach(async () => {
      // Mock enabled patterns
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          id: 'brute-force-login',
          name: 'Brute Force Login Detection',
          severity: 'high',
          enabled: true,
          threshold: 5,
          window_size_minutes: 5,
          conditions: {
            events: ['login_failed'],
            aggregateType: 'count',
            comparisonOperator: '>='
          },
          actions: [{
            type: 'block_ip',
            config: { duration: 3600 }
          }]
        }]
      });
    });

    it('should detect brute force login attempts', async () => {
      // Mock audit data showing 6 failed attempts (exceeds threshold of 5)
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ /* patterns */ }] }) // getEnabledPatterns
        .mockResolvedValueOnce({ // anomaly query
          rows: [{
            ip_address: '192.168.1.100',
            user_id: 'user123',
            session_id: 'session456',
            event_count: '6',
            unique_users: '1',
            unique_ips: '1',
            first_event: new Date(Date.now() - 300000), // 5 minutes ago
            last_event: new Date(),
            event_details: [{ action: 'login_failed' }]
          }]
        })
        .mockResolvedValueOnce({ rows: [] }) // check for recent similar anomaly
        .mockResolvedValueOnce({ rows: [{ id: 'anomaly-123' }] }); // create anomaly event

      await (anomalyService as any).performAnomalyCheck();

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO anomaly_events'),
        expect.arrayContaining([
          'brute-force-login',
          'Brute Force Login Detection',
          'high',
          6, // trigger value
          5, // threshold
          expect.stringContaining('192.168.1.100'), // affected entities JSON
          expect.any(String), // event data JSON
          expect.stringContaining('Threshold 5 exceeded with value 6')
        ])
      );
    });

    it('should not create duplicate anomalies for same IP', async () => {
      // Mock recent similar anomaly exists
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ /* patterns */ }] })
        .mockResolvedValueOnce({
          rows: [{
            ip_address: '192.168.1.100',
            user_id: 'user123',
            session_id: 'session456',
            event_count: '6',
            unique_users: '1',
            unique_ips: '1',
            first_event: new Date(Date.now() - 300000),
            last_event: new Date(),
            event_details: [{ action: 'login_failed' }]
          }]
        })
        .mockResolvedValueOnce({ rows: [{ id: 'existing-anomaly' }] }); // similar recent anomaly

      await (anomalyService as any).performAnomalyCheck();

      // Should not create new anomaly event
      expect(mockDb.query).not.toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO anomaly_events'),
        expect.any(Array)
      );
    });

    it('should handle different aggregate types correctly', async () => {
      const testCases = [
        { aggregateType: 'count', eventCount: '10', expected: 10 },
        { aggregateType: 'distinct_count', uniqueUsers: '5', expected: 5 },
        { aggregateType: 'rate', eventCount: '20', firstEvent: new Date(Date.now() - 10000), lastEvent: new Date(), expected: 2 }
      ];

      for (const testCase of testCases) {
        const row = {
          event_count: testCase.eventCount,
          unique_users: testCase.uniqueUsers || '1',
          first_event: testCase.firstEvent || new Date(),
          last_event: testCase.lastEvent || new Date()
        };

        const result = (anomalyService as any).extractTriggerValue(row, testCase.aggregateType);
        expect(result).toBe(testCase.expected);
      }
    });

    it('should evaluate thresholds correctly', async () => {
      const testCases = [
        { value: 10, threshold: 5, operator: '>', expected: true },
        { value: 3, threshold: 5, operator: '>', expected: false },
        { value: 5, threshold: 5, operator: '>=', expected: true },
        { value: 4, threshold: 5, operator: '>=', expected: false },
        { value: 3, threshold: 5, operator: '<', expected: true },
        { value: 5, threshold: 5, operator: '==', expected: true }
      ];

      for (const testCase of testCases) {
        const result = (anomalyService as any).evaluateThreshold(
          testCase.value,
          testCase.threshold,
          testCase.operator
        );
        expect(result).toBe(testCase.expected);
      }
    });
  });

  describe('response actions', () => {
    it('should block IP address when action is triggered', async () => {
      const affectedEntities = { ipAddress: '192.168.1.100' };
      const action = {
        type: 'block_ip',
        config: { duration: 3600 }
      };

      await (anomalyService as any).performAction(action, affectedEntities, 'action-log-123');

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'blocked_ip:192.168.1.100',
        3600,
        expect.stringContaining('Anomaly detection auto-block')
      );
    });

    it('should disable account when action is triggered', async () => {
      const affectedEntities = { userId: 'user123' };
      const action = {
        type: 'disable_account',
        config: { reason: 'Security anomaly detected' }
      };

      await (anomalyService as any).performAction(action, affectedEntities, 'action-log-123');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        expect.arrayContaining(['user123', 'Security anomaly detected'])
      );
    });

    it('should require 2FA when action is triggered', async () => {
      const affectedEntities = { userId: 'user123' };
      const action = {
        type: 'require_2fa',
        config: { temporary: true, duration: 86400 }
      };

      await (anomalyService as any).performAction(action, affectedEntities, 'action-log-123');

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'require_2fa:user123',
        86400,
        expect.stringContaining('Security anomaly detected')
      );
    });

    it('should send notifications when action is triggered', async () => {
      const affectedEntities = { userId: 'user123', ipAddress: '192.168.1.100' };
      const action = {
        type: 'notify',
        config: { message: 'Security alert', channels: ['security'] }
      };

      const emitSpy = jest.spyOn(anomalyService, 'emit');

      await (anomalyService as any).performAction(action, affectedEntities, 'action-log-123');

      expect(emitSpy).toHaveBeenCalledWith('notification_required', {
        config: action.config,
        affectedEntities,
        timestamp: expect.any(Date)
      });
    });

    it('should create security incident when action is triggered', async () => {
      const affectedEntities = { userId: 'user123' };
      const action = {
        type: 'create_incident',
        config: { priority: 'high', category: 'brute_force' }
      };

      await (anomalyService as any).performAction(action, affectedEntities, 'action-log-123');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO security_incidents'),
        expect.arrayContaining([
          'Security Anomaly: brute_force',
          'Automated incident created due to anomaly detection',
          'high',
          'brute_force',
          expect.any(String) // affected entities JSON
        ])
      );
    });

    it('should log action execution status', async () => {
      const action = { type: 'notify', config: {} };
      const affectedEntities = { userId: 'user123' };

      await (anomalyService as any).performAction(action, affectedEntities, 'action-log-123');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE anomaly_actions_log'),
        expect.arrayContaining(['action-log-123'])
      );
    });

    it('should handle action failures gracefully', async () => {
      const action = { type: 'block_ip', config: { duration: 3600 } };
      const affectedEntities = { ipAddress: '192.168.1.100' };

      // Mock Redis failure
      mockRedis.setex.mockRejectedValueOnce(new Error('Redis connection failed'));

      await expect(
        (anomalyService as any).performAction(action, affectedEntities, 'action-log-123')
      ).rejects.toThrow('Redis connection failed');

      // Should log the failure
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE anomaly_actions_log'),
        expect.arrayContaining(['action-log-123'])
      );
    });
  });

  describe('anomaly management', () => {
    it('should retrieve anomaly events with filters', async () => {
      const mockAnomalies = [
        {
          id: 'anomaly-1',
          pattern_id: 'brute-force-login',
          pattern_name: 'Brute Force Login Detection',
          severity: 'high',
          timestamp: new Date(),
          trigger_value: '10',
          threshold: '5',
          affected_entities: { ipAddress: '192.168.1.100' },
          event_data: {},
          description: 'Test anomaly',
          resolved: false,
          resolved_at: null,
          resolved_by: null,
          false_positive: false
        }
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockAnomalies });

      const result = await anomalyService.getAnomalyEvents({
        severity: 'high',
        resolved: false,
        limit: 10
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('anomaly-1');
      expect(result[0].severity).toBe('high');
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE 1=1 AND severity = $1 AND resolved = $2'),
        ['high', false]
      );
    });

    it('should resolve anomaly events', async () => {
      await anomalyService.resolveAnomaly('anomaly-123', 'admin-user', true);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE anomaly_events'),
        ['anomaly-123', 'admin-user', true]
      );
    });

    it('should get anomaly statistics', async () => {
      const mockStats = {
        total_anomalies: '150',
        resolved_anomalies: '140',
        false_positives: '10',
        critical_anomalies: '5',
        high_anomalies: '25',
        anomalies_24h: '8',
        anomalies_7d: '32'
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockStats] });

      const result = await anomalyService.getAnomalyStatistics();

      expect(result).toEqual(mockStats);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('COUNT(*) as total_anomalies')
      );
    });
  });

  describe('event emission', () => {
    it('should emit anomaly_detected event when anomaly is created', async () => {
      const emitSpy = jest.spyOn(anomalyService, 'emit');

      mockDb.query
        .mockResolvedValueOnce({ rows: [] }) // no recent similar
        .mockResolvedValueOnce({ rows: [{ id: 'anomaly-123' }] }); // create anomaly

      const pattern = {
        id: 'test-pattern',
        name: 'Test Pattern',
        severity: 'high' as const,
        threshold: 5,
        actions: []
      };

      await (anomalyService as any).createAnomalyEvent(pattern, 10, {
        ip_address: '192.168.1.100',
        user_id: 'user123'
      });

      expect(emitSpy).toHaveBeenCalledWith('anomaly_detected', {
        id: 'anomaly-123',
        patternId: 'test-pattern',
        severity: 'high',
        description: expect.stringContaining('Test Pattern'),
        affectedEntities: expect.objectContaining({
          ipAddress: '192.168.1.100',
          userId: 'user123'
        })
      });
    });

    it('should emit error event on check failure', async () => {
      const emitSpy = jest.spyOn(anomalyService, 'emit');
      
      // Mock database error
      mockDb.query.mockRejectedValueOnce(new Error('Database connection failed'));

      await (anomalyService as any).performAnomalyCheck();

      expect(emitSpy).toHaveBeenCalledWith('error', expect.any(Error));
    });
  });

  describe('service lifecycle', () => {
    it('should start and stop service correctly', async () => {
      expect((anomalyService as any).isRunning).toBe(false);

      await anomalyService.start();
      expect((anomalyService as any).isRunning).toBe(true);
      expect((anomalyService as any).checkInterval).toBeDefined();

      await anomalyService.stop();
      expect((anomalyService as any).isRunning).toBe(false);
      expect((anomalyService as any).checkInterval).toBeUndefined();
    });

    it('should not start if already running', async () => {
      await anomalyService.start();
      const firstInterval = (anomalyService as any).checkInterval;

      await anomalyService.start(); // Should not create new interval
      expect((anomalyService as any).checkInterval).toBe(firstInterval);

      await anomalyService.stop();
    });

    it('should not stop if already stopped', async () => {
      expect((anomalyService as any).isRunning).toBe(false);
      
      await anomalyService.stop(); // Should not throw
      expect((anomalyService as any).isRunning).toBe(false);
    });
  });
});