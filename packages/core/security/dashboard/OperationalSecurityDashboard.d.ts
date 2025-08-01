/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Operational Security Dashboard
 * Task T-1752989143998-124: Design security dashboard framework
 *
 * Real-time operational security dashboard for SOC analysts and security teams,
 * providing detailed threat monitoring, incident management, and response
 * coordination capabilities for day-to-day security operations.
 *
 * Features:
 * - Real-time threat monitoring and alerting
 * - Active incident queue management
 * - Security tool integration status
 * - Response team coordination
 * - Alert triage and investigation workflows
 * - Performance metrics and SLA tracking
 *
 * Target Users:
 * - SOC Analysts (Level 1, 2, 3)
 * - Incident Responders
 * - Security Engineers
 * - Security Operations Manager
 *
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2024-01-22
 */
import React from 'react';
import { DashboardTheme } from './SecurityDashboardFramework';

}
}
export interface SecurityAlert { id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: 'malware' | 'intrusion' | 'data_exfiltration' | 'policy_violation' | 'anomaly';
    title: string;
    description: string;
    source: string;
    timestamp: Date;
    status: 'new' | 'investigating' | 'escalated' | 'resolved' | 'false_positive';
    assignee?: string;
    affectedAssets: string[];
    indicators: string[];
    responseActions: ResponseAction[] }
}
}
export interface ResponseAction { id: string;
    type: 'isolate' | 'block' | 'quarantine' | 'investigate' | 'escalate';
    description: string;
    automated: boolean;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    performer?: string;
    timestamp?: Date }
}
}
export interface SystemStatus { component: string;
    status: 'operational' | 'degraded' | 'outage' | 'maintenance';
    lastCheck: Date;
    responseTime?: number;
    uptime: number;
    criticalIssues: number }
}
}
export interface ThreatIntelligence { feed: string;
    lastUpdate: Date;
    newIndicators: number;
    activeThreats: number;
    confidence: 'high' | 'medium' | 'low';
    categories: string[] }
}
}
export interface OperationalMetrics { alerts: {
        total: number;
        newLast24h: number;
        byCategory: Record<string, number>;
        bySeverity: Record<string, number>;
        avgResponseTime: number;
        slaCompliance: number }
}
    };
    incidents: { active: number;
        resolved24h: number;
        avgResolutionTime: number;
        escalated: number };
    system: { overallHealth: number;
        componentsOperational: number;
        totalComponents: number;
        criticalIssues: number };
    team: { onlineAnalysts: number;
        totalAnalysts: number;
        workload: 'low' | 'normal' | 'high' | 'critical';
        avgCaseload: number };

}
}
export interface OperationalSecurityDashboardProps {
    alerts: SecurityAlert[];
    metrics: OperationalMetrics;
    systemStatus: SystemStatus[];
    threatIntel: ThreatIntelligence[];
    theme?: DashboardTheme;
    refreshInterval?: number;
    maxAlertsDisplayed?: number;
    enableRealTimeUpdates?: boolean;
    onAlertAction?: (alertId: string, action: string) => void;
    onSystemIssue?: (component: string, issue: string) => void;
/**
 * Operational Security Dashboard Component
 */
export declare const OperationalSecurityDashboard: React.FC<OperationalSecurityDashboardProps>;
export default OperationalSecurityDashboard;
//# sourceMappingURL=OperationalSecurityDashboard.d.ts.map
}
}