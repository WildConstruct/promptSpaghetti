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
    dependencies?: string[];
    check: () => Promise<PrerequisiteResult>;
    autoFix?: () => Promise<boolean>;
    manualFixInstructions?: string;
    estimatedFixTime?: number;

export interface PrerequisiteResult {
    passed: boolean;
    message: string;
    details?: Record<string, any>;
    timestamp: Date;
    errorCode?: string;
    severity?: 'critical' | 'high' | 'medium' | 'low';
    recommendation?: string;
    checkDuration?: number;

export interface PrerequisiteReport {
    overall: {,
        passed: boolean;
        totalChecks: number;
        passedChecks: number;
        failedChecks: number;
        criticalFailures: number;
        estimatedFixTime: number;
    };
    categories: Record<string, {
        passed: boolean;
        checks: number;
        failures: number;
    }>;
    results: Record<string, PrerequisiteResult>;
    dependencies: PrerequisiteDependencyMap;
    recommendations: string[];
    reportId: string;
    generatedAt: Date;
    version: string;

export interface PrerequisiteDependencyMap {
    [checkId: string]: {
        dependsOn: string[];
        requiredBy: string[];
        status: 'pending' | 'checking' | 'passed' | 'failed' | 'skipped';
    };

export interface Epic16PrerequisiteConfig {
    enabledCategories: string[];
    skipChecks: string[];
    autoFixEnabled: boolean;
    timeoutMs: number;
    concurrentChecks: number;
    retryAttempts: number;
    saveReports: boolean;
    reportRetentionDays: number;
    services: {,
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

export declare class Epic16PrerequisiteSystem extends EventEmitter {
    private config;
    private checks;
    private lastReport;
    constructor(config?: Partial<Epic16PrerequisiteConfig>);
    /**
     * Initialize all prerequisite checks
     */
    private initializeChecks;
    /**
     * Add a prerequisite check
     */
    addCheck(check: PrerequisiteCheck): void;
    /**
     * Remove a prerequisite check
     */
    removeCheck(checkId: string): boolean;
    /**
     * Run all prerequisite checks
     */
    runAllChecks(): Promise<PrerequisiteReport>;
    /**
     * Run specific prerequisite checks
     */
    runChecks(checkIds: string[]): Promise<Record<string, PrerequisiteResult>>;
    /**
     * Auto-fix failed prerequisites
     */
    autoFixFailures(): Promise<Record<string, boolean>>;
    /**
     * Get the last prerequisite report
     */
    getLastReport(): PrerequisiteReport | null;
    /**
     * Get prerequisite summary for quick status check
     */
    getQuickStatus(): Promise<{
        overall: 'healthy' | 'degraded' | 'critical';
        criticalFailures: number;
        totalChecks: number;
        lastCheckTime?: Date;
    }>;
    private buildDependencyMap;
    private executeChecksWithDependencies;
    private processCheckAsync;
    private checkDependenciesSatisfied;
    private executeCheckWithTimeout;
    private generateReport;
    private checkEpic11Auth;
    private fixEpic11Auth;
    private checkEpic11Roles;
    private fixEpic11Roles;
    private checkEpic13Analytics;
    private fixEpic13Analytics;
    private checkClickHouse;
    private checkEpic14Experimentation;
    private fixEpic14Experimentation;
    private checkEpic15Clients;
    private checkElasticsearch;
    private fixElasticsearch;
    private checkRedis;
    private fixRedis;
    private checkPostgreSQL;
    private fixPostgreSQL;
    private checkStripe;
    private fixStripe;
    private checkClaudeAPI;
    private fixClaudeAPI;
    private checkCloudFront;
    private checkEnvironmentConfig;
    private fixEnvironmentConfig;
    private checkMarketplaceSchema;
    private fixMarketplaceSchema;
    private checkSSLCertificates;
    private checkSecurityHeaders;
    private fixSecurityHeaders;

export default Epic16PrerequisiteSystem;
//# sourceMappingURL=Epic16PrerequisiteSystem.d.ts.map