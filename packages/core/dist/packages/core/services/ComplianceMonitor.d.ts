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
}
export interface ComplianceContext {
    timestamp: Date;
    userId?: string;
    systemComponent: string;
    environment: 'development' | 'staging' | 'production';
    data?: Record<string, unknown>;
}
export interface ComplianceResult {
    checkId: string;
    status: 'compliant' | 'non_compliant' | 'warning' | 'error';
    score: number;
    message: string;
    details?: string;
    evidence?: ComplianceEvidence;
    remediation?: RemediationAction;
    timestamp: Date;
}
export interface ComplianceEvidence {
    type: 'log' | 'configuration' | 'data' | 'certificate' | 'audit_trail';
    source: string;
    content: string;
    timestamp: Date;
}
export interface RemediationAction {
    id: string;
    description: string;
    automated: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedTime: string;
    execute?: () => Promise<void>;
}
export interface ComplianceDashboard {
    overallScore: number;
    frameworkScores: Record<string, number>;
    recentViolations: ComplianceViolation;
    trendData: ComplianceTrend;
    upcomingAudits: UpcomingAudit;
}
export interface ComplianceViolation {
    id: string;
    checkId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    detectedAt: Date;
    status: 'open' | 'investigating' | 'resolved' | 'accepted';
    assignedTo?: string;
    dueDate?: Date;
}
export interface ComplianceTrend {
    framework: string;
    period: string;
    score: number;
    previousScore: number;
    trend: 'improving' | 'stable' | 'declining';
}
export interface UpcomingAudit {
    framework: string;
    type: 'internal' | 'external';
    scheduledDate: Date;
    preparationStatus: 'not_started' | 'in_progress' | 'ready';
    requiredEvidence: string;
}
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
}
//# sourceMappingURL=ComplianceMonitor.d.ts.map