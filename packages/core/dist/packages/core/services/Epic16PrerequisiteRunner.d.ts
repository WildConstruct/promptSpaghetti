/**
 * Epic 16 Prerequisite Runner
 *
 * CLI and programmatic runner for Epic 16 prerequisite checks with
 * formatted reporting, auto-fix capabilities, and progress monitoring.
 */
import { PrerequisiteReport } from './Epic16PrerequisiteSystem';
export interface PrerequisiteRunnerOptions {
    categories?: string;
    skipChecks?: string;
    onlyChecks?: string;
    autoFix?: boolean;
    timeout?: number;
    concurrency?: number;
    format?: 'console' | 'json' | 'html' | 'markdown';
    outputFile?: string;
    verbose?: boolean;
    colors?: boolean;
    configFile?: string;
    environment?: 'development' | 'staging' | 'production';
}
export interface PrerequisiteRunnerResult {
    success: boolean;
    report: PrerequisiteReport;
    autoFixResults?: Record<string, boolean>;
    outputPath?: string;
    duration: number;
}
export declare class Epic16PrerequisiteRunner {
    private system;
    private options;
    constructor(options?: PrerequisiteRunnerOptions);
    /**
     * Run prerequisite checks with the configured options
     */
    run(): Promise<PrerequisiteRunnerResult>;
    /**
     * Run quick status check for monitoring
     */
    getQuickStatus(): Promise<{
        status: 'healthy' | 'degraded' | 'critical';
    }, message>;
    string: any;
    details: any;
}
//# sourceMappingURL=Epic16PrerequisiteRunner.d.ts.map