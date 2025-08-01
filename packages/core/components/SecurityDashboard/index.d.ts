/**
 * Security Dashboard Components - Main Export
 * Task T-1752989143998-955: Implement security dashboard
 *
 * Main export file for security dashboard components providing a unified
 * interface for importing and using all security dashboard functionality.
 *
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2025-07-22
 */
export { default as SecurityDashboardMain } from './SecurityDashboardMain';
export { default as SecurityDashboardDataService } from './SecurityDashboardDataService';
export { SecurityDashboardFramework,
  DashboardType,
  SecurityRole,
  DashboardTheme }
} from '../../security/dashboard/SecurityDashboardFramework';
export { SecurityDashboardWorkflow } from '../../security/dashboard/SecurityDashboardWorkflow';
export { OperationalSecurityDashboard } from '../../security/dashboard/OperationalSecurityDashboard';
export { ExecutiveSecurityDashboard } from '../../security/dashboard/ExecutiveSecurityDashboard';
export { ComplianceSecurityDashboard } from '../../security/dashboard/ComplianceSecurityDashboard';
export type { SecurityDashboardMainProps,
  SecurityMetrics,
  SecurityAlert,
  ResponseAction,
  ComplianceStatus,
  ComplianceViolation }
} from './SecurityDashboardMain';
export type { SecurityAction, DataServiceConfig, ApiResponse } from './SecurityDashboardDataService';
export type { DashboardConfig,
  WidgetConfiguration,
  DashboardLayout,
  DashboardPermissions,
  SecurityDashboardFrameworkOptions }
} from '../../security/dashboard/SecurityDashboardFramework';
export type { SecurityWorkflowEvent,
  SecurityEventType,
  SecuritySeverity,
  SecurityActionType,
  SecurityWorkflowConfig }
} from '../../security/dashboard/SecurityDashboardWorkflow';
//# sourceMappingURL=index.d.ts.map
