/**
 * Epic 17 System Checks - Unit Tests
 * 
 * Tests the comprehensive system diagnostic capabilities for
 * Epic 17 Backstage Admin Controls with performance threshold integration.
 * 
 * Task: E17-1753114397245-5B9324 - Implement system checks
 */

import { DiagnosticService } from '../admin/DiagnosticService';
import { Epic17ThresholdManager } from '../admin/HealthCheckThresholds';
import { DiagnosticStatus, DiagnosticSeverity, DiagnosticCategory } from '../admin/DiagnosticService';
import { DatabaseService } from '../auth/database/DatabaseService';

// Mock DatabaseService to avoid configuration requirements in tests
class MockDatabaseService {
  async testConnection() {
    return new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay
  }

  async query(sql: string, params?: any[]) {
    return [];
  }

  async initialize() {
    return true;
  }

  async close() {
    return true;
  }
}

describe('Epic 17 System Checks', () => {
  let diagnosticService: DiagnosticService;
  let mockDatabaseService: MockDatabaseService;

  beforeEach(() => {
    mockDatabaseService = new MockDatabaseService();
    diagnosticService = new DiagnosticService(mockDatabaseService as any);
  });

  describe('Epic 17 Diagnostic Initialization', () => {
    it('should initialize Epic 17 system checks', async () => {
      const diagnostics = await diagnosticService.listAvailableDiagnostics();
      
      // Check that Epic 17 diagnostics are registered (auto-generated + manual)
      const epic17Diagnostics = diagnostics.filter(d => d.diagnosticId.startsWith('epic17_'));
      expect(epic17Diagnostics.length).toBeGreaterThanOrEqual(15); // Should have at least 15 Epic 17 diagnostics
      
      // Verify some key Epic 17 diagnostics are present
      const diagnosticIds = epic17Diagnostics.map(d => d.diagnosticId);
      expect(diagnosticIds).toContain('epic17_admin_user_lookup');
      expect(diagnosticIds).toContain('epic17_admin_permission_check');
      expect(diagnosticIds).toContain('epic17_health_check_response');
      expect(diagnosticIds).toContain('epic17_dashboard_load_time');
      expect(diagnosticIds).toContain('epic17_health_database_connectivity');
    });

    it('should register Epic 17 diagnostic suites', async () => {
      const suites = await diagnosticService.listDiagnosticSuites();
      
      const epic17Suites = suites.filter(s => s.suiteId.startsWith('epic17_'));
      expect(epic17Suites.length).toBeGreaterThanOrEqual(2); // Should have at least 2 Epic 17 suites
      
      const suiteIds = epic17Suites.map(s => s.suiteId);
      expect(suiteIds).toContain('epic17_system_health');
      expect(suiteIds).toContain('epic17_performance_check');
    });
  });

  describe('Epic 17 Threshold Integration', () => {
    it('should integrate with Epic 17 performance thresholds', () => {
      // Test threshold manager integration
      const adminUserThreshold = Epic17ThresholdManager.getThreshold('admin_user_lookup');
      expect(adminUserThreshold).toBeDefined();
      expect(adminUserThreshold?.warning).toBe(200);
      expect(adminUserThreshold?.critical).toBe(500);

      const healthCheckThreshold = Epic17ThresholdManager.getThreshold('health_check_response');
      expect(healthCheckThreshold).toBeDefined();
      expect(healthCheckThreshold?.warning).toBe(100);
      expect(healthCheckThreshold?.critical).toBe(200);
    });

    it('should validate threshold requirements correctly', () => {
      const fastOperation = Epic17ThresholdManager.validateThreshold('admin_user_lookup', 50);
      expect(fastOperation.passed).toBe(true);
      expect(fastOperation.level).toBe('ok');

      const warningOperation = Epic17ThresholdManager.validateThreshold('admin_user_lookup', 300);
      expect(warningOperation.passed).toBe(false);
      expect(warningOperation.level).toBe('warning');

      const criticalOperation = Epic17ThresholdManager.validateThreshold('admin_user_lookup', 600);
      expect(criticalOperation.passed).toBe(false);
      expect(criticalOperation.level).toBe('critical');
    });
  });

  describe('Epic 17 System Health Suite', () => {
    it('should execute Epic 17 system health suite', async () => {
      const execution = await diagnosticService.runEpic17SystemHealth('test-admin-user');
      
      expect(execution.executionId).toBeDefined();
      expect(execution.suiteId).toBe('epic17_system_health');
      expect(execution.status).toBe('completed');
      expect(execution.results.length).toBeGreaterThan(0);
      
      // Verify Epic 17 diagnostics were executed
      const epic17Results = execution.results.filter(r => r.diagnosticId.startsWith('epic17_'));
      expect(epic17Results.length).toBeGreaterThan(0);
      
      // Check that performance thresholds were evaluated
      const performanceResults = epic17Results.filter(r => r.details.threshold);
      expect(performanceResults.length).toBeGreaterThan(0);
    });

    it('should provide comprehensive health summary', async () => {
      const summary = await diagnosticService.getEpic17HealthSummary();
      
      expect(summary.overallStatus).toBeDefined();
      expect(summary.criticalIssues).toBeGreaterThanOrEqual(0);
      expect(summary.warningIssues).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(summary.thresholdViolations)).toBe(true);
      expect(Array.isArray(summary.recommendations)).toBe(true);
    });
  });

  describe('Epic 17 Performance Check Suite', () => {
    it('should execute Epic 17 performance validation suite', async () => {
      const execution = await diagnosticService.runEpic17PerformanceCheck('test-admin-user');
      
      expect(execution.executionId).toBeDefined();
      expect(execution.suiteId).toBe('epic17_performance_check');
      expect(execution.status).toBe('completed');
      
      // All results should be performance-related
      execution.results.forEach(result => {
        expect(result.details.threshold).toBeDefined();
        expect(typeof result.duration).toBe('number');
      });
    });
  });

  describe('Epic 17 Individual Diagnostics', () => {
    it('should execute admin user lookup diagnostic', async () => {
      const diagnostic = {
        diagnosticId: 'epic17_admin_user_lookup',
        name: 'Epic 17 Admin User Lookup Performance',
        category: DiagnosticCategory.PERFORMANCE,
        description: 'Test admin user lookup',
        enabled: true,
        timeout: 5000,
        retryAttempts: 2,
        severity: DiagnosticSeverity.HIGH,
        parameters: { operation: 'admin_user_lookup' }
      };

      const result = await diagnosticService.runSingleDiagnostic(diagnostic, 'test-exec');
      
      expect(result.diagnosticId).toBe('epic17_admin_user_lookup');
      expect(result.status).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
      expect(result.details.metrics).toBeDefined();
      expect(result.details.threshold).toBeDefined();
    });

    it('should execute admin permission check diagnostic', async () => {
      const diagnostic = {
        diagnosticId: 'epic17_admin_permission_check',
        name: 'Epic 17 Admin Permission Check Performance',
        category: DiagnosticCategory.SECURITY,
        description: 'Test admin permission validation',
        enabled: true,
        timeout: 2000,
        retryAttempts: 3,
        severity: DiagnosticSeverity.CRITICAL,
        parameters: { operation: 'admin_permission_check' }
      };

      const result = await diagnosticService.runSingleDiagnostic(diagnostic, 'test-exec');
      
      expect(result.diagnosticId).toBe('epic17_admin_permission_check');
      expect(result.status).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
      expect(result.details.metrics.permissionCheckTime).toBeGreaterThan(0);
    });

    it('should execute health check response diagnostic', async () => {
      const diagnostic = {
        diagnosticId: 'epic17_health_check_response',
        name: 'Epic 17 Health Check Response Time',
        category: DiagnosticCategory.PERFORMANCE,
        description: 'Test health check endpoint',
        enabled: true,
        timeout: 3000,
        retryAttempts: 2,
        severity: DiagnosticSeverity.CRITICAL,
        parameters: { operation: 'health_check_response' }
      };

      const result = await diagnosticService.runSingleDiagnostic(diagnostic, 'test-exec');
      
      expect(result.diagnosticId).toBe('epic17_health_check_response');
      expect(result.status).toBeDefined();
      expect(result.details.metrics.healthCheckTime).toBeGreaterThan(0);
      expect(result.details.metrics.endpointsChecked).toBeGreaterThan(0);
    });

    it('should execute dashboard load time diagnostic', async () => {
      const diagnostic = {
        diagnosticId: 'epic17_dashboard_load_time',
        name: 'Epic 17 Dashboard Load Performance',
        category: DiagnosticCategory.PERFORMANCE,
        description: 'Test dashboard loading',
        enabled: true,
        timeout: 4000,
        retryAttempts: 2,
        severity: DiagnosticSeverity.MEDIUM,
        parameters: { operation: 'dashboard_load_time' }
      };

      const result = await diagnosticService.runSingleDiagnostic(diagnostic, 'test-exec');
      
      expect(result.diagnosticId).toBe('epic17_dashboard_load_time');
      expect(result.status).toBeDefined();
      expect(result.details.metrics.dashboardLoadTime).toBeGreaterThan(0);
      expect(result.details.metrics.widgetsLoaded).toBeGreaterThan(0);
    });

    it('should execute database connectivity diagnostic', async () => {
      const diagnostic = {
        diagnosticId: 'epic17_database_connectivity',
        name: 'Epic 17 Database Health Check',
        category: DiagnosticCategory.DATABASE,
        description: 'Test database connectivity',
        enabled: true,
        timeout: 5000,
        retryAttempts: 3,
        severity: DiagnosticSeverity.CRITICAL,
        parameters: { operation: 'health_database_connectivity' }
      };

      const result = await diagnosticService.runSingleDiagnostic(diagnostic, 'test-exec');
      
      expect(result.diagnosticId).toBe('epic17_database_connectivity');
      expect(result.status).toBeDefined();
      expect(result.details.metrics.connectionTime).toBeGreaterThan(0);
    });
  });

  describe('Epic 17 Recommendations System', () => {
    it('should generate appropriate recommendations for threshold violations', async () => {
      // This is tested implicitly through the diagnostic executions above
      // The recommendation system is integrated into each diagnostic check
      const execution = await diagnosticService.runEpic17PerformanceCheck('test-admin-user');
      
      execution.results.forEach(result => {
        if (!result.details.threshold || result.status === DiagnosticStatus.HEALTHY) {
          return; // Skip healthy results
        }
        
        // Threshold violation results should have recommendations
        expect(Array.isArray(result.recommendations)).toBe(true);
        if (result.status === DiagnosticStatus.CRITICAL || result.status === DiagnosticStatus.WARNING) {
          expect(result.recommendations.length).toBeGreaterThan(0);
        }
      });
    });
  });
});