/**
 * Continuous Compliance Monitoring Service
 * Provides real-time compliance checking for security, privacy, and regulatory requirements
 */

export interface ComplianceCheck {
    id: string;
    name: string;
    description: string;
    category: 'security' | 'privacy' | 'regulatory' | 'operational';
    framework: 'GDPR' | 'CCPA' | 'SOC2' | 'ISO27001' | 'MPA' | 'INTERNAL';
    severity: 'low' | 'medium' | 'high' | 'critical';
    autoFix: boolean;
    frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
    check: (context: ComplianceContext) => Promise<ComplianceResult>;

export interface ComplianceContext {
    timestamp: Date;
    userId?: string;
    systemComponent: string;
    environment: 'development' | 'staging' | 'production';
    data?: Record<string, unknown>;

export interface ComplianceResult {
    checkId: string;
    status: 'compliant' | 'non_compliant' | 'warning' | 'error';
    score: number;
    message: string;
    details?: string;
    evidence?: ComplianceEvidence[];
    remediation?: RemediationAction[];
    timestamp: Date;

export interface ComplianceEvidence {
    type: 'log' | 'configuration' | 'data' | 'certificate' | 'audit_trail';
    source: string;
    content: string;
    timestamp: Date;

export interface RemediationAction {
    id: string;
    description: string;
    automated: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedTime: string;
    execute?: () => Promise<void>;

export interface ComplianceDashboard {
    overallScore: number;
    frameworkScores: Record<string, number>;
    recentViolations: ComplianceViolation[];
    trendData: ComplianceTrend[];
    upcomingAudits: UpcomingAudit[];

export interface ComplianceViolation {
    id: string;
    checkId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    detectedAt: Date;
    status: 'open' | 'investigating' | 'resolved' | 'accepted';
    assignedTo?: string;
    dueDate?: Date;

export interface ComplianceTrend {
    framework: string;
    period: string;
    score: number;
    previousScore: number;
    trend: 'improving' | 'stable' | 'declining';

export interface UpcomingAudit {
    framework: string;
    type: 'internal' | 'external';
    scheduledDate: Date;
    preparationStatus: 'not_started' | 'in_progress' | 'ready';
    requiredEvidence: string[];

export declare class ComplianceMonitor {
    private checks;
    private results;
    private violations;
    private isMonitoring;
    private monitoringIntervals;
    constructor();
    /**
     * Initialize all compliance checks
     */
    private initializeComplianceChecks;
    /**
     * Start continuous compliance monitoring
     */
    startMonitoring(): void;
    /**
     * Stop continuous compliance monitoring
     */
    stopMonitoring(): void;
    /**
     * Run a specific compliance check
     */
    runComplianceCheck(checkId: string, context?: ComplianceContext): Promise<ComplianceResult>;
    /**
     * Run full compliance scan across all checks
     */
    runFullComplianceScan(): Promise<ComplianceDashboard>;
    /**
     * Get current compliance dashboard
     */
    generateComplianceDashboard(): ComplianceDashboard;
    /**
     * Handle compliance violation
     */
    private handleComplianceViolation;
    /**
     * Attempt automatic remediation
     */
    private attemptAutoRemediation;
    /**
     * Send critical compliance alert
     */
    private sendCriticalComplianceAlert;
    /**
     * Calculate trend data for compliance metrics
     */
    private calculateTrendData;
    /**
     * Get upcoming audits
     */
    private getUpcomingAudits;
    /**
     * Convert frequency string to milliseconds
     */
    private getIntervalMs;
    /**
     * Check data encryption compliance (GDPR)
     */
    private checkDataEncryption;
    /**
     * Check consent management compliance (GDPR)
     */
    private checkConsentManagement;
    /**
     * Check data retention compliance (GDPR)
     */
    private checkDataRetention;
    /**
     * Check data portability support (GDPR)
     */
    private checkDataPortability;
    /**
     * Check access controls (SOC 2)
     */
    private checkAccessControls;
    /**
     * Check audit logging (SOC 2)
     */
    private checkAuditLogging;
    /**
     * Check encryption standards (SOC 2)
     */
    private checkEncryptionStandards;
    /**
     * Check content encryption (MPA)
     */
    private checkContentEncryption;
    /**
     * Check content access tracking (MPA)
     */
    private checkContentAccessTracking;
    /**
     * Check SSL certificates (Internal)
     */
    private checkSSLCertificates;
    /**
     * Check security headers (Internal)
     */
    private checkSecurityHeaders;
    /**
     * Check rate limiting (Internal)
     */
    private checkRateLimiting;

export interface EnhancedComplianceDashboard extends ComplianceDashboard {
    baselineTracking: {,
        overallBaselineHealth: number;
        baselinesMet: number;
        totalBaselines: number;
        criticalDeviations: number;
        frameworkBaselines: Record<string, {
            baselinesMet: number;
            totalBaselines: number;
            averagePerformance: number;
            status: 'healthy' | 'warning' | 'critical';
        }>;
    };
    historicalTrends: {,
        improvingMetrics: number;
        decliningMetrics: number;
        stableMetrics: number;
        forecastAlerts: {,
            metric: string;
            framework: string;
            predictedIssue: string;
            timeframe: string;
            risk: 'low' | 'medium' | 'high';
        }[];
    };
    auditReadiness: {,
        overallReadiness: number;
        frameworkReadiness: Record<string, {
            score: number;
            status: 'ready' | 'needs_preparation' | 'not_ready';
            missingEvidence: string[];
            nextAuditDue?: Date;
        }>;
    };
/**
 * Enhanced Compliance Monitor with Baseline Tracking Integration
 */
export declare class EnhancedComplianceMonitor extends ComplianceMonitor {
    private baselineTracker;
    private historicalAnalyzer;
    constructor();
    private initializeIntegration;
    /**
     * Generate enhanced compliance dashboard with baseline tracking
     */
    generateEnhancedDashboard(): Promise<EnhancedComplianceDashboard>;
    /**
     * Record compliance measurement and update baselines
     */
    recordComplianceMeasurement();
      framework: 'GDPR' | 'CCPA' | 'SOC2' | 'ISO27001' | 'MPA' | 'INTERNAL',
      metricName: string,
      actualValue: number,
      context?: Record<string,
      any>
    ): Promise<void>;
    /**
     * Get compliance trend analysis for a specific framework
     */
    getFrameworkTrendAnalysis(framework: string, daysPeriod?: number): Promise<any>;
    private generateForecastAlerts;
    private calculateAuditReadiness;
    private identifyMissingEvidence;
    private getNextAuditDate;

export declare const enhancedComplianceMonitor: EnhancedComplianceMonitor;
//# sourceMappingURL=ComplianceMonitor.d.ts.map