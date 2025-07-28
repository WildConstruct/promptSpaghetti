/**
 * Monitoring Interface
 * Epic 17.4.2 - Monitoring Dashboard
 * Task: E17-1753114397070-5493E0
 *
 * Unified monitoring dashboard that brings together health, performance,
 * API, and security monitoring with role-based views and real-time updates.
 */
import React from 'react';
export interface MonitoringMetrics {
    system: {
        cpu: number;
        memory: number;
        disk: number;
        network: {
            inbound: number;
            outbound: number;
        };
        uptime: number;
        lastUpdated: string;
    };
    api: {
        requestsPerSecond: number;
        averageLatency: number;
        errorRate: number;
        activeConnections: number;
        totalRequests: number;
        failedRequests: number;
    };
    security: {
        activeThreats: number;
        blockedAttempts: number;
        suspiciousActivity: number;
        lastIncident: string | null;
        complianceScore: number;
    };
    performance: {
        responseTime: number;
        throughput: number;
        availability: number;
        errorCount: number;
        operationsPerSecond: number;
    };
}
export interface AlertData {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    title: string;
    description: string;
    source: string;
    timestamp: string;
    acknowledged: boolean;
    resolved: boolean;
    assignee?: string;
}
export interface MonitoringViewConfig {
    layout: 'executive' | 'operational' | 'analytics' | 'compliance';
    refreshInterval: number;
    widgets: string;
    rolePermissions: string;
}
interface MonitoringInterfaceProps {
    userRole: string;
    userId: string;
    onAlertAction?: (alertId: string, action: string) => void;
    onExport?: (type: string, timeRange: string) => void;
    className?: string;
}
export declare const MonitoringInterface: React.FC<MonitoringInterfaceProps>;
export default MonitoringInterface;
//# sourceMappingURL=MonitoringInterface.d.ts.map