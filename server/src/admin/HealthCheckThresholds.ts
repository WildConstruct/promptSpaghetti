// server/src/admin/HealthCheckThresholds.ts
// Epic 17.4.5 - Health Check System Performance Thresholds
// QA Implementation by Quinn - Senior Developer & QA Architect

import { PerformanceThreshold, ThresholdCategory, AlertSeverity } from '../types/PerformanceTypes';

/**
 * Epic 17 Specific Performance Thresholds for Backstage Admin Controls
 * 
 * These thresholds are designed for:
 * - Admin control operations requiring fast response times
 * - Health check system ensuring system reliability
 * - Backstage dashboard providing real-time admin oversight
 * - System administration operations with appropriate timeout allowances
 */

}
}
export interface Epic17ThresholdConfig {
  adminOperations: Record<string, PerformanceThreshold>;
  healthChecks: Record<string, PerformanceThreshold>;
  dashboardMetrics: Record<string, PerformanceThreshold>;
  systemAdmin: Record<string, PerformanceThreshold>;
}
}
}

/**
 * Admin Control Operation Thresholds
 * These operations must be fast to ensure smooth admin workflows
 */
const ADMIN_OPERATION_THRESHOLDS: Record<string, PerformanceThreshold> = {
  // User Management Operations
  admin_user_lookup: {
    warning: 200,     // 200ms - fast user lookup for admin efficiency
    critical: 500,    // 500ms - critical threshold for user management
    category: ThresholdCategory.ADMIN_OPERATIONS,
    description: 'Admin user lookup and authentication operations',
    alertSeverity: AlertSeverity.HIGH
  }
  admin_permission_check: {
    warning: 50,      // 50ms - permission checks must be very fast
    critical: 100,    // 100ms - critical for security workflow
    category: ThresholdCategory.ADMIN_OPERATIONS,
    description: 'Admin permission validation and role checking',
    alertSeverity: AlertSeverity.CRITICAL
  }
  admin_bulk_operation: {
    warning: 2000,    // 2s - bulk operations can take longer
    critical: 5000,   // 5s - but shouldn't block admin workflow
    category: ThresholdCategory.ADMIN_OPERATIONS,
    description: 'Bulk administrative operations (batch updates, imports)',
    alertSeverity: AlertSeverity.MEDIUM
  }
  admin_audit_query: {
    warning: 1000,    // 1s - audit queries can be complex
    critical: 2000,   // 2s - but must remain responsive
    category: ThresholdCategory.ADMIN_OPERATIONS,
    description: 'Administrative audit log queries and reporting',
    alertSeverity: AlertSeverity.MEDIUM
  }
  // Policy Management Operations (Epic 17 specific)
  policy_validation: {
    warning: 300,     // 300ms - policy validation should be fast
    critical: 750,    // 750ms - critical for policy deployment workflows
    category: ThresholdCategory.ADMIN_OPERATIONS,
    description: 'Policy validation and compliance checking',
    alertSeverity: AlertSeverity.HIGH
  }
  policy_deployment: {
    warning: 1500,    // 1.5s - policy deployment coordination
    critical: 3000,   // 3s - critical for system consistency
    category: ThresholdCategory.ADMIN_OPERATIONS,
    description: 'Policy deployment across system components',
    alertSeverity: AlertSeverity.HIGH
  }
};

/**
 * Health Check System Thresholds
 * Critical for system reliability and automated recovery
 */
const HEALTH_CHECK_THRESHOLDS: Record<string, PerformanceThreshold> = {
  health_check_response: {
    warning: 100,     // 100ms - health checks must be very fast
    critical: 200,    // 200ms - critical for automated monitoring
    category: ThresholdCategory.HEALTH_CHECKS,
    description: 'Primary health check endpoint response time',
    alertSeverity: AlertSeverity.CRITICAL
  }
  health_dependency_check: {
    warning: 500,     // 500ms - dependency checks can take longer
    critical: 1000,   // 1s - but must remain responsive for monitoring
    category: ThresholdCategory.HEALTH_CHECKS,
    description: 'External dependency health validation',
    alertSeverity: AlertSeverity.HIGH
  }
  health_system_recovery: {
    warning: 5000,    // 5s - system recovery operations
    critical: 10000,  // 10s - critical for business continuity
    category: ThresholdCategory.HEALTH_CHECKS,
    description: 'Automated system recovery and restoration',
    alertSeverity: AlertSeverity.CRITICAL
  }
  health_database_connectivity: {
    warning: 250,     // 250ms - database health checks
    critical: 500,    // 500ms - critical for data operations
    category: ThresholdCategory.HEALTH_CHECKS,
    description: 'Database connectivity and performance validation',
    alertSeverity: AlertSeverity.CRITICAL
  }
  health_api_endpoints: {
    warning: 300,     // 300ms - API endpoint health validation
    critical: 600,    // 600ms - critical for service availability
    category: ThresholdCategory.HEALTH_CHECKS,
    description: 'Core API endpoint health and response validation',
    alertSeverity: AlertSeverity.HIGH
  }
};

/**
 * Backstage Dashboard Performance Thresholds
 * Admin dashboard must be responsive for effective system oversight
 */
const DASHBOARD_THRESHOLDS: Record<string, PerformanceThreshold> = {
  dashboard_load_time: {
    warning: 800,     // 800ms - dashboard should load quickly
    critical: 1500,   // 1.5s - critical for admin productivity
    category: ThresholdCategory.DASHBOARD,
    description: 'Admin dashboard initial load and render time',
    alertSeverity: AlertSeverity.MEDIUM
  }
  dashboard_widget_render: {
    warning: 300,     // 300ms - individual widgets should render fast
    critical: 600,    // 600ms - critical for dashboard usability
    category: ThresholdCategory.DASHBOARD,
    description: 'Individual dashboard widget render performance',
    alertSeverity: AlertSeverity.LOW
  }
  dashboard_data_refresh: {
    warning: 1000,    // 1s - data refresh operations
    critical: 2000,   // 2s - critical for real-time monitoring
    category: ThresholdCategory.DASHBOARD,
    description: 'Dashboard data refresh and update operations',
    alertSeverity: AlertSeverity.MEDIUM
  }
  dashboard_realtime_updates: {
    warning: 150,     // 150ms - real-time updates must be very fast
    critical: 300,    // 300ms - critical for live monitoring
    category: ThresholdCategory.DASHBOARD,
    description: 'Real-time dashboard updates and notifications',
    alertSeverity: AlertSeverity.HIGH
  }
};

/**
 * System Administration Operation Thresholds
 * These operations can take longer but have defined limits
 */
const SYSTEM_ADMIN_THRESHOLDS: Record<string, PerformanceThreshold> = {
  backup_verification: {
    warning: 30000,   // 30s - backup verification can be intensive
    critical: 60000,  // 60s - critical for backup reliability
    category: ThresholdCategory.SYSTEM_ADMIN,
    description: 'System backup verification and integrity checking',
    alertSeverity: AlertSeverity.MEDIUM
  }
  config_deployment: {
    warning: 5000,    // 5s - configuration deployment coordination
    critical: 10000,  // 10s - critical for system consistency
    category: ThresholdCategory.SYSTEM_ADMIN,
    description: 'System configuration deployment and activation',
    alertSeverity: AlertSeverity.HIGH
  }
  integration_health: {
    warning: 1000,    // 1s - integration health checks
    critical: 3000,   // 3s - critical for service coordination
    category: ThresholdCategory.SYSTEM_ADMIN,
    description: 'Third-party integration health and connectivity',
    alertSeverity: AlertSeverity.MEDIUM
  }
  system_maintenance: {
    warning: 15000,   // 15s - maintenance operations can be long
    critical: 30000,  // 30s - but must complete within reasonable time
    category: ThresholdCategory.SYSTEM_ADMIN,
    description: 'Automated system maintenance and cleanup operations',
    alertSeverity: AlertSeverity.LOW
  }
  log_rotation: {
    warning: 3000,    // 3s - log rotation operations
    critical: 7000,   // 7s - critical for system disk management
    category: ThresholdCategory.SYSTEM_ADMIN,
    description: 'System log rotation and archival operations',
    alertSeverity: AlertSeverity.LOW
  }
};

/**
 * Epic 17 Complete Threshold Configuration
 */
export const EPIC17_THRESHOLDS: Epic17ThresholdConfig = {
  adminOperations: ADMIN_OPERATION_THRESHOLDS,
  healthChecks: HEALTH_CHECK_THRESHOLDS,
  dashboardMetrics: DASHBOARD_THRESHOLDS,
  systemAdmin: SYSTEM_ADMIN_THRESHOLDS
};

/**
 * Threshold Lookup Utilities
 */
export class Epic17ThresholdManager {
  /**
   * Get threshold configuration for a specific operation
   */
  static getThreshold(operation: string): PerformanceThreshold | null {
    // Search across all threshold categories
    const allThresholds = {
      ...EPIC17_THRESHOLDS.adminOperations,
      ...EPIC17_THRESHOLDS.healthChecks,
      ...EPIC17_THRESHOLDS.dashboardMetrics,
      ...EPIC17_THRESHOLDS.systemAdmin
    };

    return allThresholds[operation] || null;
  }

  /**
   * Get all thresholds for a specific category
   */
  static getThresholdsByCategory(category: ThresholdCategory): Record<string, PerformanceThreshold> {
    const allThresholds = {
      ...EPIC17_THRESHOLDS.adminOperations,
      ...EPIC17_THRESHOLDS.healthChecks,
      ...EPIC17_THRESHOLDS.dashboardMetrics,
      ...EPIC17_THRESHOLDS.systemAdmin
    };

    return Object.entries(allThresholds)
      .filter(([_, threshold]) => threshold.category === category)
      .reduce((acc, [key, threshold]) => {
        acc[key] = threshold;
        return acc;
      }, {} as Record<string, PerformanceThreshold>);
  }

  /**
   * Validate if a measurement meets the threshold requirements
   */
  static validateThreshold(operation: string, duration: number): {
    passed: boolean;
    level: 'ok' | 'warning' | 'critical';
    threshold?: PerformanceThreshold;
  } {
    const threshold = this.getThreshold(operation);
    
    if (!threshold) {
      return { passed: true, level: 'ok' };
    }

    if (duration >= threshold.critical) {
      return { passed: false, level: 'critical', threshold };
    } else if (duration >= threshold.warning) {
      return { passed: false, level: 'warning', threshold };
    } else {
      return { passed: true, level: 'ok', threshold };
    }
  }

  /**
   * Get recommended timeout for an operation (critical threshold + 20% buffer)
   */
  static getRecommendedTimeout(operation: string): number {
    const threshold = this.getThreshold(operation);
    return threshold ? Math.round(threshold.critical * 1.2) : 5000; // Default 5s
  }
}

/**
 * Quality Assurance Notes:
 * 
 * 1. Thresholds are based on Epic 17 requirements for admin operations
 * 2. Values are conservative to ensure reliable admin workflows
 * 3. Alert severity levels prioritize critical system operations
 * 4. Integration with existing PerformanceMonitor and AlertingService
 * 5. Comprehensive coverage of all Epic 17 admin control scenarios
 * 
 * QA Validation Required:
 * - Baseline performance measurement for all operations
 * - Load testing with realistic admin workflows
 * - Alert delivery validation
 * - Integration testing with existing monitoring systems
 */