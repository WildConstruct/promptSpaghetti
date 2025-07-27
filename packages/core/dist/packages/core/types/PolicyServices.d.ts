/**
 * Policy Services Interfaces - Epic 17 Implementation
 * Task: E17-1753114397367-674DF3 - Design policy interfaces
 *
 * Service interfaces and API contracts for policy management system.
 * Defines contracts for policy CRUD operations, evaluation services,
 * and administrative functions.
 */
import { BasePolicy, PolicyType, PolicyStatus, PolicySearchCriteria, PolicySearchResult, PolicyValidationResult, PolicyAssignment, PolicyEvaluation, EvaluationContext, PolicyAnalytics, PolicyTemplate, PolicyExport, PolicyImport, PolicyDiff, AssignmentTargetType, AnalyticsPeriod, ExportFormat, ExportMetadata, ComplianceFramework } from './PolicyInterfaces';
/**
 * Main policy management service interface
 */
export interface IPolicyService {
    createPolicy(policy: CreatePolicyRequest): Promise<PolicyServiceResponse<BasePolicy>>;
    updatePolicy(id: string, updates: UpdatePolicyRequest): Promise<PolicyServiceResponse<BasePolicy>>;
    getPolicy(id: string, version?: string): Promise<PolicyServiceResponse<BasePolicy>>;
    getPolicies(criteria?: PolicySearchCriteria): Promise<PolicyServiceResponse<PolicySearchResult>>;
    deletePolicy(id: string): Promise<PolicyServiceResponse<void>>;
    activatePolicy(id: string): Promise<PolicyServiceResponse<BasePolicy>>;
    deactivatePolicy(id: string, reason?: string): Promise<PolicyServiceResponse<BasePolicy>>;
    deprecatePolicy(id: string, replacementId?: string): Promise<PolicyServiceResponse<BasePolicy>>;
    archivePolicy(id: string): Promise<PolicyServiceResponse<BasePolicy>>;
    validatePolicy(policy: Partial<BasePolicy>): Promise<PolicyServiceResponse<PolicyValidationResult>>;
    testPolicy(id: string, testCases: PolicyTestCase[]): Promise<PolicyServiceResponse<PolicyTestResult>>;
    dryRunPolicy(policy: Partial<BasePolicy>, context: EvaluationContext): Promise<PolicyServiceResponse<PolicyEvaluation>>;
    createPolicyVersion(id: string, changes: Partial<BasePolicy>): Promise<PolicyServiceResponse<BasePolicy>>;
    getPolicyVersions(id: string): Promise<PolicyServiceResponse<PolicyVersion[]>>;
    comparePolicyVersions(id: string, version1: string, version2: string): Promise<PolicyServiceResponse<PolicyDiff>>;
    rollbackToVersion(id: string, version: string): Promise<PolicyServiceResponse<BasePolicy>>;
    bulkCreatePolicies(policies: CreatePolicyRequest[]): Promise<PolicyServiceResponse<BulkOperationResult>>;
    bulkUpdatePolicies(updates: BulkUpdateRequest[]): Promise<PolicyServiceResponse<BulkOperationResult>>;
    bulkDeletePolicies(ids: string[]): Promise<PolicyServiceResponse<BulkOperationResult>>;
}
/**
 * Policy evaluation service interface
 */
export interface IPolicyEvaluationService {
    evaluatePolicy(policyId: string, context: EvaluationContext): Promise<PolicyServiceResponse<PolicyEvaluation>>;
    evaluatePolicies(policyIds: string[], context: EvaluationContext): Promise<PolicyServiceResponse<PolicyEvaluation[]>>;
    evaluateForContext(context: EvaluationContext): Promise<PolicyServiceResponse<PolicyEvaluation>>;
    bulkEvaluate(requests: EvaluationRequest[]): Promise<PolicyServiceResponse<PolicyEvaluation[]>>;
    evaluateRealtime(context: EvaluationContext): Promise<PolicyServiceResponse<PolicyEvaluation>>;
    getCachedEvaluation(cacheKey: string): Promise<PolicyServiceResponse<PolicyEvaluation | null>>;
    invalidateEvaluationCache(policyIds?: string[]): Promise<PolicyServiceResponse<void>>;
    getEvaluationMetrics(period?: AnalyticsPeriod): Promise<PolicyServiceResponse<EvaluationPerformanceMetrics>>;
}
/**
 * Policy assignment service interface
 */
export interface IPolicyAssignmentService {
    createAssignment(assignment: CreateAssignmentRequest): Promise<PolicyServiceResponse<PolicyAssignment>>;
    updateAssignment(id: string, updates: UpdateAssignmentRequest): Promise<PolicyServiceResponse<PolicyAssignment>>;
    getAssignment(id: string): Promise<PolicyServiceResponse<PolicyAssignment>>;
    getAssignments(criteria?: AssignmentSearchCriteria): Promise<PolicyServiceResponse<AssignmentSearchResult>>;
    deleteAssignment(id: string): Promise<PolicyServiceResponse<void>>;
    getAssignmentsForTarget(targetType: AssignmentTargetType, targetId: string): Promise<PolicyServiceResponse<PolicyAssignment[]>>;
    assignPolicyToTarget(policyId: string, targetType: AssignmentTargetType, targetId: string, options?: AssignmentOptions): Promise<PolicyServiceResponse<PolicyAssignment>>;
    unassignPolicyFromTarget(policyId: string, targetType: AssignmentTargetType, targetId: string): Promise<PolicyServiceResponse<void>>;
    bulkAssign(assignments: CreateAssignmentRequest[]): Promise<PolicyServiceResponse<BulkOperationResult>>;
    bulkUnassign(criteria: AssignmentSearchCriteria): Promise<PolicyServiceResponse<BulkOperationResult>>;
    resolveAssignmentConflicts(targetType: AssignmentTargetType, targetId: string): Promise<PolicyServiceResponse<ConflictResolutionResult>>;
    getInheritanceChain(assignmentId: string): Promise<PolicyServiceResponse<AssignmentInheritanceChain>>;
    validateAssignment(assignment: CreateAssignmentRequest): Promise<PolicyServiceResponse<AssignmentValidationResult>>;
    simulateAssignment(assignment: CreateAssignmentRequest): Promise<PolicyServiceResponse<AssignmentSimulationResult>>;
}
/**
 * Policy analytics service interface
 */
export interface IPolicyAnalyticsService {
    generateAnalytics(period: AnalyticsPeriod, criteria?: AnalyticsSearchCriteria): Promise<PolicyServiceResponse<PolicyAnalytics>>;
    getUsageAnalytics(policyIds?: string[], period?: AnalyticsPeriod): Promise<PolicyServiceResponse<UsageAnalytics>>;
    getComplianceAnalytics(frameworks?: ComplianceFramework[], period?: AnalyticsPeriod): Promise<PolicyServiceResponse<ComplianceAnalytics>>;
    getPerformanceAnalytics(period?: AnalyticsPeriod): Promise<PolicyServiceResponse<PerformanceAnalytics>>;
    getRealTimeMetrics(): Promise<PolicyServiceResponse<RealTimeMetrics>>;
    getSystemHealth(): Promise<PolicyServiceResponse<SystemHealthMetrics>>;
    generateComplianceReport(frameworks: ComplianceFramework[], format?: ReportFormat): Promise<PolicyServiceResponse<ComplianceReport>>;
    generateUsageReport(period: AnalyticsPeriod, format?: ReportFormat): Promise<PolicyServiceResponse<UsageReport>>;
    generateAuditReport(period: AnalyticsPeriod, format?: ReportFormat): Promise<PolicyServiceResponse<AuditReport>>;
    getInsights(criteria?: InsightCriteria): Promise<PolicyServiceResponse<PolicyInsight[]>>;
    getRecommendations(criteria?: RecommendationCriteria): Promise<PolicyServiceResponse<PolicyRecommendation[]>>;
}
/**
 * Policy template service interface
 */
export interface IPolicyTemplateService {
    createTemplate(template: CreateTemplateRequest): Promise<PolicyServiceResponse<PolicyTemplate>>;
    updateTemplate(id: string, updates: UpdateTemplateRequest): Promise<PolicyServiceResponse<PolicyTemplate>>;
    getTemplate(id: string): Promise<PolicyServiceResponse<PolicyTemplate>>;
    getTemplates(criteria?: TemplateSearchCriteria): Promise<PolicyServiceResponse<TemplateSearchResult>>;
    deleteTemplate(id: string): Promise<PolicyServiceResponse<void>>;
    createPolicyFromTemplate(templateId: string, customizations: TemplateCustomization): Promise<PolicyServiceResponse<BasePolicy>>;
    getTemplateUsage(templateId: string): Promise<PolicyServiceResponse<TemplateUsageStats>>;
    recommendTemplates(context: TemplateRecommendationContext): Promise<PolicyServiceResponse<PolicyTemplate[]>>;
    searchTemplatesByFramework(frameworks: ComplianceFramework[]): Promise<PolicyServiceResponse<PolicyTemplate[]>>;
    validateTemplate(template: CreateTemplateRequest): Promise<PolicyServiceResponse<TemplateValidationResult>>;
    testTemplate(templateId: string, testData: TemplateTestData): Promise<PolicyServiceResponse<TemplateTestResult>>;
}
/**
 * Policy import/export service interface
 */
export interface IPolicyImportExportService {
    exportPolicies(criteria: PolicySearchCriteria, options: ExportOptions): Promise<PolicyServiceResponse<PolicyExport>>;
    exportAssignments(criteria: AssignmentSearchCriteria, options: ExportOptions): Promise<PolicyServiceResponse<PolicyAssignment[]>>;
    downloadExport(exportId: string): Promise<PolicyServiceResponse<Blob>>;
    importPolicies(data: ImportData, options: ImportOptions): Promise<PolicyServiceResponse<PolicyImport>>;
    validateImportData(data: ImportData): Promise<PolicyServiceResponse<ImportValidationResult>>;
    getImportStatus(importId: string): Promise<PolicyServiceResponse<PolicyImport>>;
    scheduleBatchExport(criteria: PolicySearchCriteria, schedule: ExportSchedule): Promise<PolicyServiceResponse<BatchJob>>;
    scheduleBatchImport(source: ImportSource, schedule: ImportSchedule): Promise<PolicyServiceResponse<BatchJob>>;
}
export interface PolicyServiceResponse<T> {
    success: boolean;
    data?: T;
    error?: ServiceError;
    metadata?: ResponseMetadata;
}
export interface ServiceError {
    code: string;
    message: string;
    details?: any;
    timestamp: Date;
    requestId?: string;
}
export interface ResponseMetadata {
    requestId: string;
    timestamp: Date;
    executionTime: number;
    fromCache?: boolean;
    rateLimitRemaining?: number;
}
export interface CreatePolicyRequest {
    policy: Omit<BasePolicy, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy'>;
    validateOnly?: boolean;
    dryRun?: boolean;
}
export interface UpdatePolicyRequest {
    policy: Partial<BasePolicy>;
    incrementVersion?: boolean;
    reason?: string;
    validateOnly?: boolean;
}
export interface PolicyTestCase {
    testId: string;
    name: string;
    description: string;
    context: EvaluationContext;
    expectedDecision: 'allow' | 'deny' | 'conditional' | 'review_required';
    expectedReasons?: string[];
}
export interface PolicyTestResult {
    testId: string;
    passed: boolean;
    actualResult: PolicyEvaluation;
    expectedResult: Partial<PolicyEvaluation>;
    deviations: TestDeviation[];
    executionTime: number;
}
export interface TestDeviation {
    field: string;
    expected: any;
    actual: any;
    severity: 'info' | 'warning' | 'error';
}
export interface PolicyVersion {
    version: string;
    createdAt: Date;
    createdBy: string;
    changeLog: string;
    status: PolicyStatus;
    policy: BasePolicy;
}
export interface BulkOperationResult {
    totalRequested: number;
    successful: number;
    failed: number;
    results: BulkOperationItem[];
    errors: ServiceError[];
}
export interface BulkOperationItem {
    id: string;
    success: boolean;
    error?: ServiceError;
    data?: any;
}
export interface BulkUpdateRequest {
    id: string;
    updates: Partial<BasePolicy>;
    reason?: string;
}
export interface EvaluationRequest {
    policyId?: string;
    context: EvaluationContext;
    options?: EvaluationOptions;
}
export interface EvaluationOptions {
    useCache?: boolean;
    cacheExpiration?: number;
    includeTrace?: boolean;
    maxEvaluationTime?: number;
}
export interface EvaluationPerformanceMetrics {
    totalEvaluations: number;
    averageLatency: number;
    p50Latency: number;
    p95Latency: number;
    p99Latency: number;
    errorRate: number;
    cacheHitRate: number;
    timeframe: AnalyticsPeriod;
}
export interface CreateAssignmentRequest {
    assignment: Omit<PolicyAssignment, 'assignmentId' | 'assignedAt'>;
}
export interface UpdateAssignmentRequest {
    assignment: Partial<PolicyAssignment>;
    reason?: string;
}
export interface AssignmentSearchCriteria {
    policyIds?: string[];
    targetTypes?: AssignmentTargetType[];
    targetIds?: string[];
    statuses?: string[];
    assignedAfter?: Date;
    assignedBefore?: Date;
}
export interface AssignmentSearchResult {
    assignments: PolicyAssignment[];
    totalCount: number;
    pageSize: number;
    currentPage: number;
}
export interface AssignmentOptions {
    priority?: number;
    overridable?: boolean;
    reason?: string;
    effectiveFrom?: Date;
    effectiveUntil?: Date;
}
export interface ConflictResolutionResult {
    hasConflicts: boolean;
    conflicts: AssignmentConflict[];
    resolvedAssignments: PolicyAssignment[];
    recommendations: ConflictRecommendation[];
}
export interface AssignmentConflict {
    conflictType: 'priority' | 'contradiction' | 'duplicate';
    involvedAssignments: string[];
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}
export interface ConflictRecommendation {
    recommendationType: 'merge' | 'prioritize' | 'exclude' | 'manual_review';
    description: string;
    automatable: boolean;
}
export interface AssignmentInheritanceChain {
    assignmentId: string;
    chain: InheritanceLevel[];
    effectivePolicy: BasePolicy;
    overrides: string[];
}
export interface InheritanceLevel {
    assignmentId: string;
    targetType: AssignmentTargetType;
    targetId: string;
    policyId: string;
    priority: number;
}
export interface AssignmentValidationResult {
    valid: boolean;
    errors: AssignmentValidationError[];
    warnings: AssignmentValidationWarning[];
}
export interface AssignmentValidationError {
    field: string;
    message: string;
    code: string;
    severity: 'error' | 'warning';
}
export interface AssignmentValidationWarning {
    field: string;
    message: string;
    code: string;
    recommendation?: string;
}
export interface AssignmentSimulationResult {
    wouldSucceed: boolean;
    predictedConflicts: AssignmentConflict[];
    impactAnalysis: AssignmentImpact;
    recommendations: string[];
}
export interface AssignmentImpact {
    affectedTargets: number;
    cascadingAssignments: number;
    performanceImpact: 'low' | 'medium' | 'high';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}
export interface AnalyticsSearchCriteria {
    policyTypes?: PolicyType[];
    policyIds?: string[];
    targetTypes?: AssignmentTargetType[];
    complianceFrameworks?: ComplianceFramework[];
    includeInactive?: boolean;
}
export interface UsageAnalytics {
    period: AnalyticsPeriod;
    policyUsage: PolicyUsageData[];
    totalEvaluations: number;
    uniqueContexts: number;
    topPolicies: TopPolicyData[];
}
export interface PolicyUsageData {
    policyId: string;
    policyName: string;
    evaluationCount: number;
    successRate: number;
    averageLatency: number;
    errorCount: number;
}
export interface TopPolicyData {
    policyId: string;
    policyName: string;
    rank: number;
    evaluationCount: number;
    impact: 'low' | 'medium' | 'high';
}
export interface ComplianceAnalytics {
    period: AnalyticsPeriod;
    overallScore: number;
    frameworkScores: FrameworkScore[];
    violations: ComplianceViolation[];
    recommendations: ComplianceRecommendation[];
}
export interface FrameworkScore {
    framework: ComplianceFramework;
    score: number;
    maxScore: number;
    lastAssessed: Date;
    trending: 'up' | 'stable' | 'down';
}
export interface ComplianceViolation {
    violationId: string;
    framework: ComplianceFramework;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    policyId?: string;
    detectedAt: Date;
    status: 'open' | 'acknowledged' | 'resolved' | 'false_positive';
}
export interface ComplianceRecommendation {
    recommendationId: string;
    framework: ComplianceFramework;
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
}
export interface PerformanceAnalytics {
    period: AnalyticsPeriod;
    systemMetrics: SystemPerformanceMetrics;
    policyMetrics: PolicyPerformanceMetrics[];
    bottlenecks: PerformanceBottleneck[];
}
export interface SystemPerformanceMetrics {
    totalRequests: number;
    averageLatency: number;
    errorRate: number;
    throughput: number;
    availability: number;
}
export interface PolicyPerformanceMetrics {
    policyId: string;
    averageEvaluationTime: number;
    cacheHitRate: number;
    errorRate: number;
    complexity: 'low' | 'medium' | 'high';
}
export interface PerformanceBottleneck {
    type: 'latency' | 'throughput' | 'memory' | 'cpu';
    component: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
}
export interface RealTimeMetrics {
    timestamp: Date;
    activeEvaluations: number;
    requestsPerSecond: number;
    averageLatency: number;
    errorRate: number;
    cacheHitRate: number;
    systemLoad: number;
}
export interface SystemHealthMetrics {
    overallHealth: 'healthy' | 'degraded' | 'critical';
    healthScore: number;
    components: ComponentHealth[];
    lastCheck: Date;
}
export interface ComponentHealth {
    component: string;
    status: 'healthy' | 'degraded' | 'critical';
    details: string;
    lastCheck: Date;
}
export interface CreateTemplateRequest {
    template: Omit<PolicyTemplate, 'templateId' | 'createdAt' | 'createdBy' | 'popularity' | 'usage_count'>;
}
export interface UpdateTemplateRequest {
    template: Partial<PolicyTemplate>;
    reason?: string;
}
export interface TemplateSearchCriteria {
    policyTypes?: PolicyType[];
    complianceFrameworks?: ComplianceFramework[];
    industries?: string[];
    customizable?: boolean;
    minimumRating?: number;
    text?: string;
}
export interface TemplateSearchResult {
    templates: PolicyTemplate[];
    totalCount: number;
    pageSize: number;
    currentPage: number;
}
export interface TemplateCustomization {
    fieldValues: Record<string, any>;
    customFields?: Record<string, any>;
    name?: string;
    description?: string;
}
export interface TemplateUsageStats {
    templateId: string;
    totalUsages: number;
    recentUsages: number;
    averageRating: number;
    successRate: number;
    popularCustomizations: PopularCustomization[];
}
export interface PopularCustomization {
    field: string;
    value: any;
    usageCount: number;
    percentage: number;
}
export interface TemplateRecommendationContext {
    organizationType?: string;
    industry?: string;
    region?: string;
    complianceRequirements?: ComplianceFramework[];
    existingPolicies?: string[];
}
export interface TemplateValidationResult {
    valid: boolean;
    errors: TemplateValidationError[];
    warnings: TemplateValidationWarning[];
}
export interface TemplateValidationError {
    field: string;
    message: string;
    code: string;
    severity: 'error' | 'warning';
}
export interface TemplateValidationWarning {
    field: string;
    message: string;
    code: string;
    suggestion?: string;
}
export interface TemplateTestData {
    customizations: TemplateCustomization[];
    validationTests: TemplateValidationTest[];
}
export interface TemplateValidationTest {
    testName: string;
    expectedValid: boolean;
    customization: TemplateCustomization;
}
export interface TemplateTestResult {
    testsPassed: number;
    totalTests: number;
    results: TemplateTestCaseResult[];
    overallSuccess: boolean;
}
export interface TemplateTestCaseResult {
    testName: string;
    passed: boolean;
    error?: string;
    generatedPolicy?: BasePolicy;
}
export interface ExportOptions {
    format: ExportFormat;
    includeAssignments?: boolean;
    includeVersionHistory?: boolean;
    includeAnalytics?: boolean;
    compression?: boolean;
    encryption?: ExportEncryption;
}
export interface ExportEncryption {
    enabled: boolean;
    algorithm?: string;
    keyId?: string;
}
export interface ImportData {
    format: ExportFormat;
    data: string | Buffer;
    metadata?: ExportMetadata;
}
export interface ImportOptions {
    conflictResolution?: ImportConflictResolution;
    validateOnly?: boolean;
    skipInvalid?: boolean;
    createAssignments?: boolean;
    overwriteExisting?: boolean;
}
export interface ImportConflictResolution {
    strategy: 'skip' | 'overwrite' | 'merge' | 'rename' | 'manual';
    customResolver?: string;
}
export interface ImportValidationResult {
    valid: boolean;
    totalPolicies: number;
    validPolicies: number;
    invalidPolicies: number;
    errors: ImportValidationError[];
    warnings: ImportValidationWarning[];
}
export interface ImportValidationError {
    policyId?: string;
    message: string;
    field?: string;
    lineNumber?: number;
    code: string;
}
export interface ImportValidationWarning {
    policyId?: string;
    message: string;
    field?: string;
    lineNumber?: number;
    code: string;
    suggestion?: string;
}
export interface ExportSchedule {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    timezone: string;
    enabled: boolean;
}
export interface ImportSchedule {
    frequency: 'hourly' | 'daily' | 'weekly';
    time?: string;
    timezone: string;
    enabled: boolean;
}
export interface BatchJob {
    jobId: string;
    type: 'export' | 'import';
    status: 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled';
    schedule: ExportSchedule | ImportSchedule;
    createdAt: Date;
    lastRunAt?: Date;
    nextRunAt?: Date;
    results?: BatchJobResult[];
}
export interface BatchJobResult {
    runId: string;
    startedAt: Date;
    completedAt?: Date;
    status: 'running' | 'completed' | 'failed';
    recordsProcessed: number;
    errors: ServiceError[];
    outputLocation?: string;
}
export interface ImportSource {
    type: 'url' | 'file' | 's3' | 'database';
    location: string;
    credentials?: SourceCredentials;
    format: ExportFormat;
}
export interface SourceCredentials {
    type: 'basic' | 'bearer' | 'oauth' | 'aws' | 'key';
    credentials: Record<string, string>;
}
export interface PolicyInsight {
    insightId: string;
    type: 'usage' | 'performance' | 'compliance' | 'security' | 'optimization';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    actionable: boolean;
    relatedPolicies: string[];
    generatedAt: Date;
}
export interface PolicyRecommendation {
    recommendationId: string;
    category: 'security' | 'performance' | 'compliance' | 'user_experience' | 'cost_optimization';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    expectedImpact: string;
    implementationComplexity: 'low' | 'medium' | 'high';
    estimatedEffort: string;
    relatedPolicies: string[];
    generatedAt: Date;
}
export interface InsightCriteria {
    types?: string[];
    minImpact?: 'low' | 'medium' | 'high' | 'critical';
    actionableOnly?: boolean;
    policyIds?: string[];
    generatedAfter?: Date;
}
export interface RecommendationCriteria {
    categories?: string[];
    minPriority?: 'low' | 'medium' | 'high' | 'critical';
    maxComplexity?: 'low' | 'medium' | 'high';
    policyIds?: string[];
    implementable?: boolean;
}
export type ReportFormat = 'pdf' | 'html' | 'csv' | 'json' | 'xml';
export interface ComplianceReport {
    reportId: string;
    generatedAt: Date;
    period: AnalyticsPeriod;
    frameworks: ComplianceFramework[];
    overallScore: number;
    frameworkResults: FrameworkResult[];
    violations: ComplianceViolation[];
    recommendations: ComplianceRecommendation[];
    format: ReportFormat;
    downloadUrl?: string;
}
export interface FrameworkResult {
    framework: ComplianceFramework;
    score: number;
    maxScore: number;
    passedControls: number;
    totalControls: number;
    criticalFindings: number;
    status: 'compliant' | 'partially_compliant' | 'non_compliant';
}
export interface UsageReport {
    reportId: string;
    generatedAt: Date;
    period: AnalyticsPeriod;
    totalEvaluations: number;
    uniquePolicies: number;
    topPolicies: TopPolicyData[];
    usageTrends: UsageTrendData[];
    format: ReportFormat;
    downloadUrl?: string;
}
export interface UsageTrendData {
    date: Date;
    evaluations: number;
    uniquePolicies: number;
    averageLatency: number;
    errorRate: number;
}
export interface AuditReport {
    reportId: string;
    generatedAt: Date;
    period: AnalyticsPeriod;
    auditTrail: AuditTrailEntry[];
    policyChanges: PolicyChangeEntry[];
    accessLog: AccessLogEntry[];
    securityEvents: SecurityEventEntry[];
    format: ReportFormat;
    downloadUrl?: string;
}
export interface AuditTrailEntry {
    timestamp: Date;
    userId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    details: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}
export interface PolicyChangeEntry {
    timestamp: Date;
    policyId: string;
    changeType: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated';
    changedBy: string;
    changeSummary: string;
    previousVersion?: string;
    newVersion?: string;
}
export interface AccessLogEntry {
    timestamp: Date;
    userId: string;
    resourceType: string;
    resourceId: string;
    action: string;
    result: 'success' | 'failure' | 'partial';
    ipAddress?: string;
    userAgent?: string;
}
export interface SecurityEventEntry {
    timestamp: Date;
    eventType: 'authentication' | 'authorization' | 'policy_violation' | 'suspicious_activity';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    userId?: string;
    affectedResources: string[];
    mitigationTaken?: string;
}
//# sourceMappingURL=PolicyServices.d.ts.map