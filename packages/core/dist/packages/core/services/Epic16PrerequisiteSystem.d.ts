/**
 * Epic 16 Prerequisite System
 *
 * Comprehensive dependency validation and prerequisite checking system for Epic 16
 * marketplace and community features. Validates Epic dependencies (11, 13, 14, 15),
 * infrastructure requirements, and service integrations.
 */
import { EventEmitter } from 'events';
export interface PrerequisiteCheck {
    id: string;
    name: string;
    description: string;
    category: 'epic_dependency' | 'infrastructure' | 'service' | 'configuration' | 'security';
    severity: 'critical' | 'high' | 'medium' | 'low';
    dependencies?: string;
    check: () => Promise<PrerequisiteResult>;
    autoFix?: () => Promise<boolean>;
    manualFixInstructions?: string;
    estimatedFixTime?: number;
}
export interface PrerequisiteResult {
    passed: boolean;
    message: string;
    details?: Record<string, any>;
    timestamp: Date;
    errorCode?: string;
    severity?: 'critical' | 'high' | 'medium' | 'low';
    recommendation?: string;
    checkDuration?: number;
}
export interface PrerequisiteReport {
    overall: {
        passed: boolean;
        totalChecks: number;
        passedChecks: number;
        failedChecks: number;
        criticalFailures: number;
        estimatedFixTime: number;
    };
    categories: Record<string, {
        passed: boolean;
    }, checks>;
    number: any;
    failures: number;
}
export interface PrerequisiteDependencyMap {
    [checkId: string]: {
        dependsOn: string;
        requiredBy: string;
        status: 'pending' | 'checking' | 'passed' | 'failed' | 'skipped';
    };
}
export interface Epic16PrerequisiteConfig {
    enabledCategories: string;
    skipChecks: string;
    autoFixEnabled: boolean;
    timeoutMs: number;
    concurrentChecks: number;
    retryAttempts: number;
    saveReports: boolean;
    reportRetentionDays: number;
    services: {
        authService?: string;
        analyticsService?: string;
        experimentationService?: string;
        elasticSearch?: string;
        redis?: string;
        postgres?: string;
        stripe?: string;
        claude?: string;
    };
    environment: 'development' | 'staging' | 'production';
    region?: string;
}
export declare class Epic16PrerequisiteSystem extends EventEmitter {
    private config;
    private checks;
    private lastReport;
    constructor(config?: Partial<Epic16PrerequisiteConfig>);
    /**
     * Initialize all prerequisite checks
     */
    private initializeChecks;
}
//# sourceMappingURL=Epic16PrerequisiteSystem.d.ts.map