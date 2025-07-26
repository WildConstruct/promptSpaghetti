import { ValidationReport, AutoFixSuggestion, CrossPlatformIssue } from '../validation/ValidationEngine.js';
import { ValidationResult } from '../types/index.js';
import { Platform, Logger, MetricsInterface } from '../types/index.js';
/**
 * Comprehensive error reporting and notification system
 */
export declare class ErrorReportingSystem {
    private logger;
    private metrics;
    private notifications;
    private listeners;
    private maxNotifications;
    constructor(logger: Logger, metrics: MetricsInterface);
    /**
     * Report a validation error with detailed context
     */
    reportValidationError(error: ValidationResult, context: ErrorContext): void;
    /**
     * Report a runtime error during transformation
     */
    reportRuntimeError(error: Error, context: ErrorContext): void;
    /**
     * Report cross-platform compatibility issues
     */
    reportCompatibilityIssue(issue: CrossPlatformIssue, context: ErrorContext): void;
    /**
     * Generate comprehensive error report from validation report
     */
    generateErrorReport(validationReport: ValidationReport, context: ErrorContext): ErrorReport;
    /**
     * Get notifications with filtering options
     */
    getNotifications(filter?: NotificationFilter): ErrorNotification[];
    /**
     * Acknowledge a notification
     */
    acknowledgeNotification(notificationId: string): void;
    /**
     * Clear acknowledged notifications
     */
    clearAcknowledged(): void;
    /**
     * Export error report in specified format
     */
    exportReport(report: ErrorReport, format: 'json' | 'html' | 'csv'): string;
    /**
     * Add error reporting listener
     */
    addListener(listener: ErrorReportingListener): void;
    /**
     * Remove error reporting listener
     */
    removeListener(listener: ErrorReportingListener): void;
    private addNotification;
    private notifyListeners;
    private mapValidationSeverity;
    private mapIssueSeverity;
    private calculatePlatformCompatibility;
    private generateRecommendations;
    private generateReportDownloadUrl;
    private exportAsJSON;
    private exportAsHTML;
    private exportAsCSV;
}
export interface ErrorContext {
    adaptorId?: string;
    platform?: Platform;
    graphId?: string;
    userId?: string;
    sessionId?: string;
    operation?: string;
    metadata?: Record<string, unknown>;
}
export interface ErrorNotification {
    id: string;
    type: 'validation' | 'runtime' | 'compatibility' | 'configuration';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    timestamp: Date;
    context: ErrorContext;
    error: unknown;
    autoFixable: boolean;
    suggestions: Array<{
        type: 'fix' | 'alternative' | 'workaround';
        description: string;
    }>;
    acknowledged: boolean;
    acknowledgedAt?: Date;
    metadata: Record<string, unknown>;
}
export interface ErrorReport {
    id: string;
    timestamp: Date;
    graphId: string;
    context: ErrorContext;
    summary: {
        totalErrors: number;
        totalWarnings: number;
        totalInfos: number;
        overallValid: boolean;
        platformCompatibility: number;
    };
    platformDetails: Map<Platform, PlatformErrorDetails>;
    recommendations: string[];
    autoFixSuggestions: AutoFixSuggestion[];
    export: {
        formats: string[];
        downloadUrl: string;
    };
}
export interface PlatformErrorDetails {
    platform: Platform;
    adaptorId: string;
    adaptorVersion: string;
    compatible: boolean;
    quality: unknown;
    errors: ValidationResult[];
    warnings: ValidationResult[];
    infos: ValidationResult[];
    capabilities: unknown;
    performance: {
        validationDuration: number;
        supportedFeatures: number;
        unsupportedFeatures: number;
    };
}
export interface NotificationFilter {
    type?: 'validation' | 'runtime' | 'compatibility' | 'configuration';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    platform?: Platform;
    acknowledged?: boolean;
    limit?: number;
}
export type ErrorReportingListener = (event: string, data: unknown) => void;
