/**
 * Status Controls Component - Epic 17
 *
 * Comprehensive status management interface for system operations,
 * user states, process monitoring, and administrative controls.
 *
 * Task: E17-1753114397016-18BAC3 - Implement status controls
 * Epic: 17 - Backstage Admin Controls
 */
import React from 'react';
export type SystemStatus = 'operational' | 'degraded' | 'down' | 'maintenance';
export type ServiceStatus = 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'locked' | 'pending';
export type ProcessStatus = 'running' | 'idle' | 'busy' | 'error' | 'stopped';

export interface SystemService {
    id: string;
    name: string;
    displayName: string;
    description: string;
    status: ServiceStatus;
    health: number;
    uptime: number;
    lastRestart: Date;
    autoRestart: boolean;
    dependencies: string[];
    port?: number;
    url?: string;
    logs: ServiceLog[];
    metrics: ServiceMetrics;


export interface ServiceLog {
    id: string;
    timestamp: Date;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    service: string;
    details?: Record<string, any>;


export interface ServiceMetrics {
    cpuUsage: number;
    memoryUsage: number;
    requestCount: number;
    errorRate: number;
    responseTime: number;
    throughput: number;


export interface SystemOverview {
    overallStatus: SystemStatus;
    totalServices: number;
    runningServices: number;
    erroredServices: number;
    systemLoad: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
    uptime: number;
    activeUsers: number;
    backgroundJobs: number;


export interface StatusControlsProps {
    className?: string;
    adminLevel?: 'admin' | 'super_admin' | 'system';
    onServiceAction?: (serviceId: string, action: string) => void;
    onSystemAction?: (action: string) => void;

export declare const StatusControls: React.FC<StatusControlsProps>;
export default StatusControls;
//# sourceMappingURL=StatusControls.d.ts.map