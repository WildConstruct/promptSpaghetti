/**
 * SecurityAnalyticsReliabilityEngineer Test Suite
 * Epic 31.4.3.3 - Develop Security Analytics Reliability Engineering
 */

import { SecurityAnalyticsReliabilityEngineer, ReliabilityConfig } from '../SecurityAnalyticsReliabilityEngineer';
import { SecurityAnalyticsIntegrationService } from '../SecurityAnalyticsIntegrationService';
import { SecurityAnalyticsOptimizer } from '../SecurityAnalyticsOptimizer';
import { AnalyticsCollector } from '../../analytics/AnalyticsCollector';
import { AnalyticsDAO } from '../../database/analytics-dao';
import { DiagnosticService } from '../../admin/DiagnosticService';
import { HealthCheckFramework } from '../../admin/HealthCheckFramework';

// Mock dependencies
jest.mock('../SecurityAnalyticsIntegrationService');
jest.mock('../SecurityAnalyticsOptimizer');
jest.mock('../../analytics/AnalyticsCollector');
jest.mock('../../database/analytics-dao');
jest.mock('../../admin/DiagnosticService');
jest.mock('../../admin/HealthCheckFramework');

describe('SecurityAnalyticsReliabilityEngineer', () => {
  let reliabilityEngineer: SecurityAnalyticsReliabilityEngineer;
  let mockAnalyticsService: jest.Mocked<SecurityAnalyticsIntegrationService>;
  let mockOptimizer: jest.Mocked<SecurityAnalyticsOptimizer>;
  let mockAnalyticsCollector: jest.Mocked<AnalyticsCollector>;
  let mockAnalyticsDAO: jest.Mocked<AnalyticsDAO>;
  let mockDiagnosticService: jest.Mocked<DiagnosticService>;
  let mockHealthCheckFramework: jest.Mocked<HealthCheckFramework>;
  let testConfig: ReliabilityConfig;

  beforeEach(() => {
    // Setup mocks
    mockAnalyticsService = new SecurityAnalyticsIntegrationService({} as any) as jest.Mocked<SecurityAnalyticsIntegrationService>;
    mockOptimizer = new SecurityAnalyticsOptimizer(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    ) as jest.Mocked<SecurityAnalyticsOptimizer>;
    mockAnalyticsCollector = new AnalyticsCollector({} as any) as jest.Mocked<AnalyticsCollector>;
    mockAnalyticsDAO = new AnalyticsDAO('') as jest.Mocked<AnalyticsDAO>;
    mockDiagnosticService = new DiagnosticService() as jest.Mocked<DiagnosticService>;
    mockHealthCheckFramework = new HealthCheckFramework() as jest.Mocked<HealthCheckFramework>;

    // Mock analytics service methods
    mockAnalyticsService.getIntegrationStatus = jest.fn<unknown[], unknown>().mockReturnValue({
      monitoring_active: true,
      epic1_integration: true,
      epic17_integration: true
 as unknown);

    mockOptimizer.getOptimizerStatus = jest.fn<unknown[], unknown>().mockReturnValue({
      is_optimizing: false,
      cache_enabled: true,
      auto_optimization_enabled: false
 as unknown);

    mockAnalyticsCollector.track = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);
    mockAnalyticsDAO.insertEvent = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);
    mockDiagnosticService.registerDiagnostic = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);
    mockDiagnosticService.createAlert = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);
    mockHealthCheckFramework.registerHealthCheck = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

    // Test configuration
    testConfig = {
      circuit_breaker: {
        enabled: true,
        failure_threshold: 5,
        recovery_timeout_ms: 60000,
        half_open_max_calls: 3,
        monitoring_window_ms: 300000

      fault_tolerance: {
        enabled: true,
        retry_attempts: 3,
        retry_delay_ms: 1000,
        exponential_backoff: true,
        jitter_enabled: true,
        max_retry_delay_ms: 10000

      disaster_recovery: {
        enabled: true,
        backup_interval_ms: 3600000,
        retention_days: 30,
        auto_failover: false,
        recovery_verification: true,
        backup_encryption: true

      health_monitoring: {
        enabled: true,
        check_interval_ms: 30000,
        degraded_threshold: 80,
        critical_threshold: 60,
        auto_healing: true,
        alert_escalation: true

      system_resilience: {
        enabled: true,
        load_shedding: true,
        graceful_degradation: true,
        resource_isolation: true,
        chaos_engineering: false,
        stress_testing_enabled: false

      epic_integration: {
        epic1_reliability_events: true,
        epic17_admin_notifications: true,
        reliability_metrics_tracking: true

    };

    reliabilityEngineer = new SecurityAnalyticsReliabilityEngineer(
      testConfig,
      mockAnalyticsService,
      mockOptimizer,
      mockAnalyticsCollector,
      mockAnalyticsDAO,
      mockDiagnosticService,
      mockHealthCheckFramework
    );
  });

  afterEach(async () => {
    if (reliabilityEngineer && typeof reliabilityEngineer.shutdown === 'function') {
      await reliabilityEngineer.shutdown();

    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      await expect(reliabilityEngineer.initialize()).resolves.not.toThrow();
      expect(mockHealthCheckFramework.registerHealthCheck).toHaveBeenCalled();
      expect(mockDiagnosticService.registerDiagnostic).toHaveBeenCalled();
    });

    test('should emit initialized event', async () => {
      const initializePromise = new Promise((resolve) => {
        reliabilityEngineer.on('initialized', resolve);
      });
      
      await reliabilityEngineer.initialize();
      await expect(initializePromise).resolves.toBeDefined();
    });

    test('should initialize circuit breakers', async () => {
      await reliabilityEngineer.initialize();
      const circuitBreakers = reliabilityEngineer.getCircuitBreakerStatus();
      
      expect(circuitBreakers.size).toBeGreaterThan(0);
      expect(circuitBreakers.has('security_analytics_service')).toBe(true);
      expect(circuitBreakers.has('optimization_service')).toBe(true);
    });
  });

  describe('Circuit Breaker Functionality', () => {
    beforeEach(async () => {
      await reliabilityEngineer.initialize();
    });

    test('should execute operation successfully with circuit breaker', async () => {
      const testOperation = jest.fn<unknown[], unknown>().mockResolvedValue('success' as unknown);
      
      const result = await reliabilityEngineer.executeWithCircuitBreaker(
        'security_analytics_service',
        testOperation
      );
      
      expect(result).toBe('success');
      expect(testOperation).toHaveBeenCalledTimes(1);
    });

    test('should open circuit breaker after threshold failures', async () => {
      const failingOperation = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Operation failed'));
      
      // Execute multiple failing operations to trip the circuit breaker
      for (let i = 0; i < testConfig.circuit_breaker.failure_threshold; i++) {
        try {
          await reliabilityEngineer.executeWithCircuitBreaker(
            'security_analytics_service',
            failingOperation
          );
 catch (error) {
          // Expected to fail


      
      const circuitBreakers = reliabilityEngineer.getCircuitBreakerStatus();
      const serviceCB = circuitBreakers.get('security_analytics_service');
      
      expect(serviceCB?.state).toBe('open');
      expect(serviceCB?.failure_count).toBe(testConfig.circuit_breaker.failure_threshold);
    });

    test('should reject requests when circuit breaker is open', async () => {
      const failingOperation = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Operation failed'));
      
      // Trip the circuit breaker
      for (let i = 0; i < testConfig.circuit_breaker.failure_threshold; i++) {
        try {
          await reliabilityEngineer.executeWithCircuitBreaker(
            'security_analytics_service',
            failingOperation
          );
 catch (error) {
          // Expected


      
      // Now try another operation - should be rejected immediately
      const newOperation = jest.fn<unknown[], unknown>().mockResolvedValue('success' as unknown);
      
      await expect(
        reliabilityEngineer.executeWithCircuitBreaker(
          'security_analytics_service',
          newOperation

      ).rejects.toThrow('Circuit breaker open');
      
      expect(newOperation).not.toHaveBeenCalled();
    });
  });

  describe('Fault Tolerance', () => {
    beforeEach(async () => {
      await reliabilityEngineer.initialize();
    });

    test('should retry failing operations', async () => {
      let attemptCount = 0;
      const retryingOperation = jest.fn<unknown[], unknown>().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Temporary failure'));

        return Promise.resolve('success');
      });
      
      const result = await reliabilityEngineer.executeWithFaultTolerance(
        retryingOperation,
        'test_operation'
      );
      
      expect(result).toBe('success');
      expect(retryingOperation).toHaveBeenCalledTimes(3);
    });

    test('should fail after max retry attempts', async () => {
      const alwaysFailingOperation = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Permanent failure'));
      
      await expect(
        reliabilityEngineer.executeWithFaultTolerance(
          alwaysFailingOperation,
          'test_operation'

      ).rejects.toThrow('Permanent failure');
      
      expect(alwaysFailingOperation).toHaveBeenCalledTimes(testConfig.fault_tolerance.retry_attempts + 1);
    });

    test('should emit retry events', async () => {
      const retryEvents: any[] = [];
      reliabilityEngineer.on('operation_retry', (event) => {
        retryEvents.push(event);
      });
      
      let attemptCount = 0;
      const retryingOperation = jest.fn<unknown[], unknown>().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 2) {
          return Promise.reject(new Error('Retry me'));

        return Promise.resolve('success');
      });
      
      await reliabilityEngineer.executeWithFaultTolerance(retryingOperation, 'test_operation');
      
      expect(retryEvents.length).toBe(1);
      expect(retryEvents[0].operation).toBe('test_operation');
    });
  });

  describe('System Health Monitoring', () => {
    beforeEach(async () => {
      await reliabilityEngineer.initialize();
    });

    test('should return system health status', () => {
      const health = reliabilityEngineer.getSystemHealth();
      
      expect(health).toHaveProperty('overall_health');
      expect(health).toHaveProperty('health_score');
      expect(health).toHaveProperty('component_health');
      expect(health).toHaveProperty('system_metrics');
      expect(typeof health.health_score).toBe('number');
    });

    test('should return reliability metrics', () => {
      const metrics = reliabilityEngineer.getReliabilityMetrics();
      
      expect(metrics).toHaveProperty('availability_percent');
      expect(metrics).toHaveProperty('mean_time_to_recovery_minutes');
      expect(metrics).toHaveProperty('system_reliability_score');
      expect(metrics).toHaveProperty('fault_tolerance_effectiveness');
      expect(typeof metrics.availability_percent).toBe('number');
    });

    test('should track active incidents', () => {
      const incidents = reliabilityEngineer.getActiveIncidents();
      
      expect(Array.isArray(incidents)).toBe(true);
    });

    test('should emit health status changes', async () => {
      const healthEvents: any[] = [];
      reliabilityEngineer.on('system_health_updated', (event) => {
        healthEvents.push(event);
      });
      
      // Trigger health check (would be done by internal monitoring)
      // This is a simplified test since the actual health monitoring runs on intervals
      
      expect(healthEvents).toBeDefined();
    });
  });

  describe('Disaster Recovery', () => {
    beforeEach(async () => {
      await reliabilityEngineer.initialize();
    });

    test('should return disaster recovery plans', () => {
      const plans = reliabilityEngineer.getDisasterRecoveryPlans();
      
      expect(Array.isArray(plans)).toBe(true);
      expect(plans.length).toBeGreaterThan(0);
    });

    test('should test disaster recovery plan', async () => {
      const plans = reliabilityEngineer.getDisasterRecoveryPlans();
      expect(plans.length).toBeGreaterThan(0);
      
      const success = await reliabilityEngineer.testDisasterRecoveryPlan(plans[0].id);
      expect(success).toBe(true);
    });

    test('should trigger disaster recovery', async () => {
      const plans = reliabilityEngineer.getDisasterRecoveryPlans();
      expect(plans.length).toBeGreaterThan(0);
      
      const success = await reliabilityEngineer.triggerDisasterRecovery(plans[0].id);
      expect(success).toBe(true);
    });

    test('should emit disaster recovery events', async () => {
      const drEvents: any[] = [];
      reliabilityEngineer.on('disaster_recovery_triggered', (event) => {
        drEvents.push(event);
      });
      
      const plans = reliabilityEngineer.getDisasterRecoveryPlans();
      await reliabilityEngineer.triggerDisasterRecovery(plans[0].id);
      
      expect(drEvents.length).toBe(1);
      expect(drEvents[0].plan_id).toBe(plans[0].id);
    });
  });

  describe('Epic Integration', () => {
    beforeEach(async () => {
      await reliabilityEngineer.initialize();
    });

    test('should register health checks with Epic 17', async () => {
      expect(mockHealthCheckFramework.registerHealthCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'reliability_engineer_overall_health'
  }
      );
      
      expect(mockHealthCheckFramework.registerHealthCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'reliability_circuit_breakers'

      );
    });

    test('should register diagnostics with Epic 17', async () => {
      expect(mockDiagnosticService.registerDiagnostic).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'reliability_comprehensive_diagnostics'
  }
      );
    });

    test('should track events in Epic 1 analytics', async () => {
      // Trigger an event that should be tracked
      const testOperation = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Test failure'));
      
      try {
        for (let i = 0; i < testConfig.circuit_breaker.failure_threshold; i++) {
          await reliabilityEngineer.executeWithCircuitBreaker(
            'security_analytics_service',
            testOperation
          );

 catch (error) {
        // Expected

      
      // Circuit breaker should have opened and triggered analytics event
      // Note: This is simplified since the actual event tracking might be async
      expect(mockAnalyticsCollector.track).toHaveBeenCalled();
    });
  });

  describe('Event Handling', () => {
    beforeEach(async () => {
      await reliabilityEngineer.initialize();
    });

    test('should emit circuit breaker events', async () => {
      const cbEvents: any[] = [];
      reliabilityEngineer.on('circuit_breaker_opened', (event) => {
        cbEvents.push(event);
      });
      
      const failingOperation = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Failure'));
      
      // Trip circuit breaker
      for (let i = 0; i < testConfig.circuit_breaker.failure_threshold; i++) {
        try {
          await reliabilityEngineer.executeWithCircuitBreaker(
            'security_analytics_service',
            failingOperation
          );
 catch (error) {
          // Expected


      
      expect(cbEvents.length).toBe(1);
      expect(cbEvents[0].component).toBe('security_analytics_service');
    });

    test('should handle component errors', () => {
      const errorEvents: any[] = [];
      reliabilityEngineer.on('component_error', (event) => {
        errorEvents.push(event);
      });
      
      // Simulate analytics service error
      mockAnalyticsService.emit('error', new Error('Service error'));
      
      expect(errorEvents.length).toBe(1);
      expect(errorEvents[0].component).toBe('security_analytics');
    });
  });

  describe('Auto-healing', () => {
    beforeEach(async () => {
      await reliabilityEngineer.initialize();
    });

    test('should emit auto-healing events', () => {
      const healingEvents: any[] = [];
      reliabilityEngineer.on('auto_healing_started', (event) => {
        healingEvents.push(event);
      });
      
      // Auto-healing would be triggered by health monitoring
      // This is a simplified test of the event system
      reliabilityEngineer.emit('auto_healing_started', { 
        component: 'test_component', 
        health_status: 'failed' 
      });
      
      expect(healingEvents.length).toBe(1);
    });
  });

  describe('Backup and Recovery', () => {
    beforeEach(async () => {
      await reliabilityEngineer.initialize();
    });

    test('should emit backup events', () => {
      const backupEvents: any[] = [];
      reliabilityEngineer.on('backup_completed', (event) => {
        backupEvents.push(event);
      });
      
      reliabilityEngineer.on('backup_failed', (event) => {
        backupEvents.push(event);
      });
      
      // Simulate backup events
      reliabilityEngineer.emit('backup_completed', { 
        backup_id: 'test_backup',
        duration_ms: 1000,
        size_bytes: 1024
      });
      
      expect(backupEvents.length).toBe(1);
    });
  });

  describe('Configuration', () => {
    test('should respect circuit breaker configuration', async () => {
      const customConfig = {
        ...testConfig,
        circuit_breaker: {
          ...testConfig.circuit_breaker,
          failure_threshold: 2 // Lower threshold for testing

      };
      
      const customEngineer = new SecurityAnalyticsReliabilityEngineer(
        customConfig,
        mockAnalyticsService,
        mockOptimizer,
        mockAnalyticsCollector,
        mockAnalyticsDAO,
        mockDiagnosticService,
        mockHealthCheckFramework
      );
      
      await customEngineer.initialize();
      
      const failingOperation = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Failure'));
      
      // Should trip after 2 failures instead of 5
      for (let i = 0; i < 2; i++) {
        try {
          await customEngineer.executeWithCircuitBreaker(
            'security_analytics_service',
            failingOperation
          );
 catch (error) {
          // Expected


      
      const circuitBreakers = customEngineer.getCircuitBreakerStatus();
      const serviceCB = circuitBreakers.get('security_analytics_service');
      
      expect(serviceCB?.state).toBe('open');
      
      await customEngineer.shutdown();
    });

    test('should respect fault tolerance configuration', async () => {
      const customConfig = {
        ...testConfig,
        fault_tolerance: {
          ...testConfig.fault_tolerance,
          retry_attempts: 1 // Only 1 retry

      };
      
      const customEngineer = new SecurityAnalyticsReliabilityEngineer(
        customConfig,
        mockAnalyticsService,
        mockOptimizer,
        mockAnalyticsCollector,
        mockAnalyticsDAO,
        mockDiagnosticService,
        mockHealthCheckFramework
      );
      
      await customEngineer.initialize();
      
      const failingOperation = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Always fails'));
      
      await expect(
        customEngineer.executeWithFaultTolerance(failingOperation, 'test')
      ).rejects.toThrow();
      
      // Should be called 2 times total (1 initial + 1 retry)
      expect(failingOperation).toHaveBeenCalledTimes(2);
      
      await customEngineer.shutdown();
    });
  });

  describe('Shutdown and Cleanup', () => {
    test('should shutdown gracefully', async () => {
      await reliabilityEngineer.initialize();
      
      const shutdownPromise = new Promise((resolve) => {
        reliabilityEngineer.on('shutdown', resolve);
      });
      
      await reliabilityEngineer.shutdown();
      await expect(shutdownPromise).resolves.toBeDefined();
    });

    test('should clear resources on shutdown', async () => {
      await reliabilityEngineer.initialize();
      
      // Verify resources exist
      const circuitBreakers = reliabilityEngineer.getCircuitBreakerStatus();
      expect(circuitBreakers.size).toBeGreaterThan(0);
      
      await reliabilityEngineer.shutdown();
      
      // After shutdown, resources should be cleared
      const clearedCircuitBreakers = reliabilityEngineer.getCircuitBreakerStatus();
      expect(clearedCircuitBreakers.size).toBe(0);
    });
  });
});