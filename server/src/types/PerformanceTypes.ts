// server/src/types/PerformanceTypes.ts
// Epic 17 Performance Monitoring Type Definitions
// QA Implementation by Quinn - Senior Developer & QA Architect

/**
 * Performance threshold configuration for Epic 17 operations
 */
}
export interface PerformanceThreshold {
  /** Warning threshold in milliseconds */
  warning: number;
  
  /** Critical threshold in milliseconds */
  critical: number;
  
  /** Threshold category for organization */
  category: ThresholdCategory;
  
  /** Human-readable description of what this threshold measures */
  description: string;
  
  /** Alert severity level when threshold is breached */
  alertSeverity: AlertSeverity;
  
  /** Optional tags for filtering and organization */
  tags?: string[];
  
  /** Optional environment-specific overrides */
  environmentOverrides?: Record<string, Partial<Pick<PerformanceThreshold, 'warning' | 'critical'>>>;
}
}

/**
 * Categories for organizing performance thresholds
 */
export enum ThresholdCategory {
  ADMIN_OPERATIONS = 'admin_operations',
  HEALTH_CHECKS = 'health_checks',
  DASHBOARD = 'dashboard',
  SYSTEM_ADMIN = 'system_admin',
  API_ENDPOINTS = 'api_endpoints',
  DATABASE = 'database',
  INTEGRATION = 'integration'
}

/**
 * Alert severity levels for threshold breaches
 */
export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Performance measurement result
 */
}
export interface PerformanceMeasurement {
  /** Operation identifier */
  operation: string;
  
  /** Duration in milliseconds */
  duration: number;
  
  /** Timestamp of measurement */
  timestamp: Date;
  
  /** Optional additional metadata */
  metadata?: Record<string, any>;
  
  /** User or session identifier */
  userId?: string;
  
  /** Request identifier for tracing */
  requestId?: string;
}
}

/**
 * Threshold validation result
 */
}
export interface ThresholdValidationResult {
  /** Whether the measurement passed the threshold */
  passed: boolean;
  
  /** Severity level of the result */
  level: 'ok' | 'warning' | 'critical';
  
  /** The threshold that was evaluated against */
  threshold?: PerformanceThreshold;
  
  /** Performance measurement that was validated */
  measurement: PerformanceMeasurement;
  
  /** Recommendations for improvement if threshold was breached */
  recommendations?: string[];
}
}

/**
 * Performance alert configuration
 */
}
export interface PerformanceAlert {
  /** Alert identifier */
  id: string;
  
  /** Operation that breached threshold */
  operation: string;
  
  /** Threshold validation result */
  result: ThresholdValidationResult;
  
  /** Alert severity */
  severity: AlertSeverity;
  
  /** Alert message */
  message: string;
  
  /** Timestamp when alert was created */
  createdAt: Date;
  
  /** Whether alert has been acknowledged */
  acknowledged: boolean;
  
  /** Optional alert tags */
  tags?: string[];
}
}

/**
 * Epic 17 specific health check result
 */
}
export interface HealthCheckResult {
  /** Health check identifier */
  checkId: string;
  
  /** Whether health check passed */
  healthy: boolean;
  
  /** Duration of health check in milliseconds */
  duration: number;
  
  /** Timestamp of health check */
  timestamp: Date;
  
  /** Optional error message if unhealthy */
  error?: string;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
  
  /** Threshold validation result */
  thresholdResult?: ThresholdValidationResult;
}
}

/**
 * System health status aggregation
 */
}
export interface SystemHealthStatus {
  /** Overall system health */
  healthy: boolean;
  
  /** Individual health check results */
  checks: Record<string, HealthCheckResult>;
  
  /** Performance summary */
  performanceSummary: {
    averageResponseTime: number;
    slowestOperation: string;
    fastestOperation: string;
    thresholdBreaches: number;
}
  };
  
  /** System uptime */
  uptime: number;
  
  /** Last health check timestamp */
  lastCheck: Date;
}