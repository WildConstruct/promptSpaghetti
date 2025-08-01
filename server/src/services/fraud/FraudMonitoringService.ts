/**
 * Fraud Monitoring Service - Epic 17
 * 
 * Comprehensive fraud monitoring and management service that provides
 * analytics, reporting, manual review workflows, and integration with
 * external fraud prevention services.
 * 
 * Task: E17-1753114397354-F17F8C - Create fraud monitoring
 * Epic: 17 - Backstage Admin Controls
 */

import { Database } from '../../database';
import { FraudDetectionEngine } from './FraudDetectionEngine';
import { TrustScoreService } from '../trust/TrustScoreService';
import { EnforcementActionService } from '../enforcement/EnforcementActionService';
import { AuditService } from '../auth/services/AuditService';
import { 
  FraudAnalytics,
  FraudOverallMetrics,
  DetectionMetrics,
  FraudTrends,
  FalsePositiveAnalysis,
  FinancialImpact,
  FraudInsight,
  FraudAnalyticsRecommendation,
  FraudDetectionResult,
  FraudRule,
  FraudMLModel,
  FraudMonitoringConfig,
  PaymentFraudAssessment,
  AccountFraudAssessment,
  FraudNetworkAnalysis
 from '../../../../packages/core/types/FraudMonitoring';



export interface FraudReviewCase {
  caseId: string;
  type: 'payment' | 'account' | 'network' | 'manual';
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  fraudScore: number;
  riskLevel: string;
  
  // Case details
  entityType: 'user' | 'transaction' | 'account';
  entityId: string;
  detectionResult: FraudDetectionResult;
  
  // Review information
  assignedTo?: string;
  assignedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: FraudReviewNote[];
  decision?: FraudReviewDecision;
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
  
  // Context
  evidence: FraudEvidence[];
  relatedCases: string[];
  tags: string[];







export interface FraudReviewNote {
  noteId: string;
  reviewerId: string;
  note: string;
  type: 'observation' | 'question' | 'recommendation' | 'decision';
  timestamp: Date;
  attachments?: string[];







export interface FraudReviewDecision {
  decision: 'approve' | 'reject' | 'escalate' | 'modify';
  reason: string;
  confidence: number;
  actions: string[];
  modifiedFraudScore?: number;
  appealable: boolean;
  decidedBy: string;
  decidedAt: Date;







export interface FraudEvidence {
  evidenceId: string;
  type: 'behavioral' | 'transactional' | 'device' | 'network' | 'external';
  source: string;
  description: string;
  data: Record<string, unknown>;
  confidence: number;
  verifiedBy?: string;
  verifiedAt?: Date;







export interface FraudAlert {
  alertId: string;
  severity: 'info' | 'warning' | 'critical' | 'urgent';
  type: 'high_fraud_score' | 'new_fraud_pattern' | 'system_anomaly' | 'manual_review_required';
  title: string;
  description: string;
  
  // Alert details
  fraudScore?: number;
  entityType?: 'user' | 'transaction' | 'system';
  entityId?: string;
  detectionMethod?: string;
  
  // Status
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  
  // Metadata
  createdAt: Date;
  expiresAt?: Date;
  tags: string[];
  relatedAlerts: string[];





export class FraudMonitoringService {
  private db: Database;
  private fraudEngine: FraudDetectionEngine;
  private trustScoreService: TrustScoreService;
  private enforcementService: EnforcementActionService;
  private auditService: AuditService;
  private config: FraudMonitoringConfig;

  constructor(
    database: Database,
    fraudEngine: FraudDetectionEngine,
    trustScoreService: TrustScoreService,
    enforcementService: EnforcementActionService,
    auditService: AuditService,
    config?: Partial<FraudMonitoringConfig>
  ) {
    this.db = database;
    this.fraudEngine = fraudEngine;
    this.trustScoreService = trustScoreService;
    this.enforcementService = enforcementService;
    this.auditService = auditService;
    this.config = {
      enabled: true,
      realTimeMonitoring: true,
      mlModelsEnabled: false,
      rulesEngineEnabled: true,
      thresholds: {
        lowRisk: 25,
        mediumRisk: 50,
        highRisk: 75,
        veryHighRisk: 90,
        criticalRisk: 95,
        autoApprove: 30,
        autoChallenge: 50,
        autoReview: 75,
        autoBlock: 90

      responseConfig: {
        autoActions: true,
        challengeEnabled: true,
        reviewQueueEnabled: true,
        escalationThresholds: [],
        appealEnabled: true,
        appealWindow: 72

      integrations: {
        fraudServices: [],
        identityVerification: [],
        paymentIntelligence: []

      performance: {
        maxProcessingTime: 5000,
        cacheEnabled: true,
        cacheTtl: 300,
        batchProcessing: false,
        maxBatchSize: 100,
        parallelProcessing: true,
        maxConcurrency: 10

      notifications: {
        realTimeAlerts: true,
        emailNotifications: true,
        webhookEndpoints: [],
        escalationNotifications: true

      ...config
    };


  // =============================================================================
  // Fraud Analytics and Reporting
  // =============================================================================

  /**
   * Generate comprehensive fraud analytics for a time period
   */
  async generateFraudAnalytics(timeRange: {
    startDate: Date;
    endDate: Date;
  }): Promise<FraudAnalytics> {

    console.log(`📊 Generating fraud analytics for ${timeRange.startDate.toISOString()} to ${timeRange.endDate.toISOString()}`);

    const [
      overallMetrics,
      detectionMetrics,
      trends,
      falsePositiveAnalysis,
      financialImpact
    ] = await Promise.all([
      this.calculateOverallMetrics(timeRange),
      this.calculateDetectionMetrics(timeRange),
      this.calculateFraudTrends(timeRange),
      this.calculateFalsePositiveAnalysis(timeRange),
      this.calculateFinancialImpact(timeRange)
    ]);

    const insights = await this.generateFraudInsights(overallMetrics, trends);
    const recommendations = await this.generateFraudRecommendations(overallMetrics, falsePositiveAnalysis);

    return {
      period: {
        startDate: timeRange.startDate,
        endDate: timeRange.endDate,
        timeRange: 'custom'

      generatedAt: new Date(),
      overallMetrics,
      detectionMetrics,
      trends,
      falsePositiveAnalysis,
      financialImpact,
      insights,
      recommendations
    };


  /**
   * Get real-time fraud dashboard metrics
   */
  async getFraudDashboard(): Promise<{
    summary: FraudDashboardSummary;
    recentAlerts: FraudAlert[];
    pendingReviews: FraudReviewCase[];
    topRiskEntities: RiskEntity[];
    performanceMetrics: PerformanceMetrics;
> {

    const [
      summary,
      recentAlerts,
      pendingReviews,
      topRiskEntities,
      performanceMetrics
    ] = await Promise.all([
      this.getDashboardSummary(),
      this.getRecentAlerts(10),
      this.getPendingReviews(10),
      this.getTopRiskEntities(10),
      this.getPerformanceMetrics()
    ]);

    return {
      summary,
      recentAlerts,
      pendingReviews,
      topRiskEntities,
      performanceMetrics
    };


  // =============================================================================
  // Manual Review Workflow
  // =============================================================================

  /**
   * Create a new fraud review case
   */
  async createReviewCase(
    detectionResult: FraudDetectionResult,
    entityType: 'user' | 'transaction' | 'account',
    entityId: string,
    type: 'payment' | 'account' | 'network' | 'manual' = 'manual'
  ): Promise<FraudReviewCase> {

    const caseId = this.generateCaseId();
    const priority = this.determineCasePriority(detectionResult);
    const deadline = this.calculateCaseDeadline(priority);

    const reviewCase: FraudReviewCase = {
      caseId,
      type,
      status: 'pending',
      priority,
      fraudScore: detectionResult.fraudScore,
      riskLevel: detectionResult.riskLevel,
      entityType,
      entityId,
      detectionResult,
      createdAt: new Date(),
      updatedAt: new Date(),
      deadline,
      evidence: this.extractEvidence(detectionResult),
      relatedCases: [],
      tags: this.generateCaseTags(detectionResult, entityType)
    };

    // Store the case
    await this.storeReviewCase(reviewCase);

    // Auto-assign if configured
    if (this.shouldAutoAssign(reviewCase)) {
      await this.autoAssignCase(reviewCase);


    // Send notifications
    await this.notifyNewReviewCase(reviewCase);

    console.log(`📋 Created fraud review case: ${caseId} (${priority} priority)`);
    return reviewCase;


  /**
   * Assign a review case to an analyst
   */
  async assignReviewCase(caseId: string, analystId: string): Promise<FraudReviewCase> {

    const reviewCase = await this.getReviewCase(caseId);
    if (!reviewCase) {
      throw new Error(`Review case not found: ${caseId}`);


    if (reviewCase.status !== 'pending') {
      throw new Error(`Cannot assign case with status: ${reviewCase.status}`);


    // Update assignment
    await this.db.query(`
      UPDATE fraud_review_cases 
      SET assigned_to = $1, assigned_at = NOW(), status = 'under_review', updated_at = NOW()
      WHERE case_id = $2
    `, [analystId, caseId]);

    // Log assignment
    await this.auditService.logEvent({
      userId: analystId,
      action: 'fraud_case_assigned',
      details: { caseId, entityType: reviewCase.entityType, entityId: reviewCase.entityId },
      severity: 'info'
    });

    return await this.getReviewCase(caseId);


  /**
   * Add a review note to a case
   */
  async addReviewNote(
    caseId: string,
    reviewerId: string,
    note: string,
    type: 'observation' | 'question' | 'recommendation' | 'decision' = 'observation'
  ): Promise<FraudReviewNote> {

    const reviewNote: FraudReviewNote = {
      noteId: this.generateNoteId(),
      reviewerId,
      note,
      type,
      timestamp: new Date()
    };

    // Store the note
    await this.storeReviewNote(caseId, reviewNote);

    // Update case
    await this.updateCaseTimestamp(caseId);

    return reviewNote;


  /**
   * Make a decision on a review case
   */
  async makeReviewDecision(
    caseId: string,
    reviewerId: string,
    decision: {
      decision: 'approve' | 'reject' | 'escalate' | 'modify';
      reason: string;
      confidence: number;
      actions?: string[];
      modifiedFraudScore?: number;
    }
  ): Promise<FraudReviewCase> {

    const reviewCase = await this.getReviewCase(caseId);
    if (!reviewCase) {
      throw new Error(`Review case not found: ${caseId}`);


    if (reviewCase.status !== 'under_review') {
      throw new Error(`Cannot make decision on case with status: ${reviewCase.status}`);


    const reviewDecision: FraudReviewDecision = {
      ...decision,
      appealable: decision.decision !== 'escalate',
      decidedBy: reviewerId,
      decidedAt: new Date()
    };

    // Update case with decision
    const newStatus = decision.decision === 'escalate' ? 'escalated' : 
      decision.decision === 'approve' ? 'approved' : 'rejected';

    await this.db.query(`
      UPDATE fraud_review_cases 
      SET status = $1, reviewed_by = $2, reviewed_at = NOW(), 
          decision = $3, updated_at = NOW()
      WHERE case_id = $4
    `, [newStatus, reviewerId, JSON.stringify(reviewDecision), caseId]);

    // Execute decision actions
    await this.executeDecisionActions(reviewCase, reviewDecision);

    // Log decision
    await this.auditService.logEvent({
      userId: reviewerId,
      action: 'fraud_case_decided',
      details: { 
        caseId, 
        decision: decision.decision, 
        entityType: reviewCase.entityType, 
        entityId: reviewCase.entityId 

      severity: 'info'
    });

    // Send notifications
    await this.notifyDecisionMade(reviewCase, reviewDecision);

    return await this.getReviewCase(caseId);


  // =============================================================================
  // Alert Management
  // =============================================================================

  /**
   * Create a fraud alert
   */
  async createFraudAlert(
    severity: 'info' | 'warning' | 'critical' | 'urgent',
    type: 'high_fraud_score' | 'new_fraud_pattern' | 'system_anomaly' | 'manual_review_required',
    title: string,
    description: string,
    options: {
      fraudScore?: number;
      entityType?: 'user' | 'transaction' | 'system';
      entityId?: string;
      detectionMethod?: string;
      expiresAt?: Date;
      tags?: string[];
 = {}
  ): Promise<FraudAlert> {

    const alertId = this.generateAlertId();

    const alert: FraudAlert = {
      alertId,
      severity,
      type,
      title,
      description,
      fraudScore: options.fraudScore,
      entityType: options.entityType,
      entityId: options.entityId,
      detectionMethod: options.detectionMethod,
      status: 'active',
      createdAt: new Date(),
      expiresAt: options.expiresAt,
      tags: options.tags || [],
      relatedAlerts: []
    };

    // Store the alert
    await this.storeAlert(alert);

    // Send notifications for critical/urgent alerts
    if (severity === 'critical' || severity === 'urgent') {
      await this.sendAlertNotification(alert);


    console.log(`🚨 Created fraud alert: ${alertId} (${severity})`);
    return alert;


  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<FraudAlert> {

    await this.db.query(`
      UPDATE fraud_alerts 
      SET status = 'acknowledged', acknowledged_by = $1, acknowledged_at = NOW()
      WHERE alert_id = $2 AND status = 'active'
    `, [userId, alertId]);

    return await this.getAlert(alertId);


  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, userId: string): Promise<FraudAlert> {

    await this.db.query(`
      UPDATE fraud_alerts 
      SET status = 'resolved', resolved_by = $1, resolved_at = NOW()
      WHERE alert_id = $2 AND status IN ('active', 'acknowledged')
    `, [userId, alertId]);

    return await this.getAlert(alertId);


  // =============================================================================
  // Rules and Models Management
  // =============================================================================

  /**
   * Create or update a fraud rule
   */
  async upsertFraudRule(rule: Partial<FraudRule>): Promise<FraudRule> {

    const ruleId = rule.ruleId || this.generateRuleId();
    
    const fraudRule: FraudRule = {
      ruleId,
      name: rule.name || 'Unnamed Rule',
      description: rule.description || '',
      category: rule.category || 'behavioral_fraud',
      severity: rule.severity || 'medium',
      enabled: rule.enabled !== false,
      conditions: rule.conditions || [],
      actions: rule.actions || [],
      thresholds: rule.thresholds || [],
      metadata: {
        createdBy: rule.metadata?.createdBy || 'system',
        createdAt: rule.metadata?.createdAt || new Date(),
        lastModified: new Date(),
        version: '1.0.0',
        tags: rule.metadata?.tags || [],
        executionCount: 0,
        successCount: 0

    };

    // Store the rule
    await this.storeFraudRule(fraudRule);

    console.log(`📏 ${rule.ruleId ? 'Updated' : 'Created'} fraud rule: ${ruleId}`);
    return fraudRule;


  /**
   * Get fraud detection statistics
   */
  async getFraudDetectionStats(timeRange: { startDate: Date; endDate: Date }): Promise<{
    totalDetections: number;
    avgFraudScore: number;
    riskDistribution: Record<string, number>;
    topRiskFactors: Array<{ factor: string; count: number }>;
    actionDistribution: Record<string, number>;
    performanceMetrics: {
      avgProcessingTime: number;
      successRate: number;
      errorRate: number;
    };
> {
    const stats = await this.db.query(`
      SELECT 
        COUNT(*) as total_detections,
        AVG(fraud_score) as avg_fraud_score,
        AVG(processing_time) as avg_processing_time,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as success_count,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as error_count
      FROM fraud_detections 
      WHERE created_at BETWEEN $1 AND $2
    `, [timeRange.startDate, timeRange.endDate]);

    const riskDistribution = await this.db.query(`
      SELECT risk_level, COUNT(*) as count
      FROM fraud_detections 
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY risk_level
    `, [timeRange.startDate, timeRange.endDate]);

    const row = stats.rows[0];
    const total = parseInt(row.total_detections);

    return {
      totalDetections: total,
      avgFraudScore: parseFloat(row.avg_fraud_score) || 0,
      riskDistribution: Object.fromEntries(
        riskDistribution.rows.map(r => [r.risk_level, parseInt(r.count)])
      ),
      topRiskFactors: [], // Would implement with actual risk factor analysis
      actionDistribution: {}, // Would implement with actual action analysis
      performanceMetrics: {
        avgProcessingTime: parseFloat(row.avg_processing_time) || 0,
        successRate: total > 0 ? (parseInt(row.success_count) / total) * 100 : 0,
        errorRate: total > 0 ? (parseInt(row.error_count) / total) * 100 : 0

    };


  // =============================================================================
  // Private Implementation Methods
  // =============================================================================

  private async calculateOverallMetrics(_____timeRange: Error): Promise<FraudOverallMetrics> {

    // Implementation would query fraud detection results from database
    return {
      totalTransactions: 0,
      fraudulentTransactions: 0,
      fraudRate: 0,
      blockedTransactions: 0,
      reviewedTransactions: 0,
      averageFraudScore: 0,
      truePositives: 0,
      falsePositives: 0,
      trueNegatives: 0,
      falseNegatives: 0,
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0
    };


  private async calculateDetectionMetrics(_____timeRange: Error): Promise<DetectionMetrics> {

    return {
      byMethod: [],
      byRiskLevel: [],
      responseTime: {
        averageResponseTime: 0,
        percentile95: 0,
        percentile99: 0,
        slowestRequests: 0

      automationRate: 0
    };


  private async calculateFraudTrends(_____timeRange: Error): Promise<FraudTrends> {

    return {
      fraudRateTrend: 'stable',
      volumeTrend: 'stable',
      dailyFraudRates: [],
      dailyVolumes: [],
      seasonalPatterns: [],
      emergingThreats: []
    };


  private async calculateFalsePositiveAnalysis(_____timeRange: Error): Promise<FalsePositiveAnalysis> {

    return {
      overallRate: 0,
      byCategory: [],
      costImpact: 0,
      trends: [],
      improvementOpportunities: []
    };


  private async calculateFinancialImpact(_____timeRange: Error): Promise<FinancialImpact> {

    return {
      fraudPrevented: 0,
      falsePositiveCost: 0,
      operationalCost: 0,
      netBenefit: 0,
      roi: 0,
      paymentFraudPrevented: 0,
      accountFraudPrevented: 0,
      networkFraudPrevented: 0
    };


  private async generateFraudInsights(metrics: FraudOverallMetrics, _____trends: FraudTrends): Promise<FraudInsight[]> {

    const insights: FraudInsight[] = [];

    // Example insight generation
    if (metrics.fraudRate > 5) {
      insights.push({
        insightId: this.generateInsightId(),
        type: 'trend',
        title: 'High Fraud Rate Detected',
        description: `Current fraud rate of ${metrics.fraudRate}% is above normal threshold`,
        impact: 'high',
        confidence: 85,
        actionable: true,
        relatedData: { fraudRate: metrics.fraudRate },
        generatedAt: new Date()
      });


    return insights;


  private async generateFraudRecommendations(
    metrics: FraudOverallMetrics, 
    falsePositives: FalsePositiveAnalysis
  ): Promise<FraudAnalyticsRecommendation[]> {

    const recommendations: FraudAnalyticsRecommendation[] = [];

    // Example recommendation generation
    if (falsePositives.overallRate > 10) {
      recommendations.push({
        recommendationId: this.generateRecommendationId(),
        category: 'rule_adjustment',
        priority: 'high',
        title: 'Reduce False Positive Rate',
        description: `False positive rate of ${falsePositives.overallRate}% needs optimization`,
        expectedImpact: 'Reduce customer friction and operational costs',
        implementation: {
          effort: 'medium',
          timeline: '2-4 weeks',
          resources: ['fraud_analyst', 'data_scientist']

        successMetrics: ['Reduce false positive rate to <5%', 'Maintain fraud detection accuracy'],
        generatedAt: new Date()
      });


    return recommendations;


  // Dashboard helper methods
  private async getDashboardSummary(): Promise<FraudDashboardSummary> {

    return {
      todayStats: {
        totalDetections: 0,
        blockedTransactions: 0,
        reviewQueue: 0,
        avgFraudScore: 0

      weeklyTrend: {
        fraudRate: 0,
        volumeChange: 0,
        performanceChange: 0

      systemHealth: {
        status: 'healthy',
        uptime: 99.9,
        avgResponseTime: 150,
        errorRate: 0.1

    };


  private async getRecentAlerts(limit: number): Promise<FraudAlert[]> {

    const result = await this.db.query(`
      SELECT * FROM fraud_alerts 
      WHERE status IN ('active', 'acknowledged')
      ORDER BY created_at DESC 
      LIMIT $1
    `, [limit]);

    return result.rows.map(row => this.mapRowToAlert(row));


  private async getPendingReviews(limit: number): Promise<FraudReviewCase[]> {

    const result = await this.db.query(`
      SELECT * FROM fraud_review_cases 
      WHERE status IN ('pending', 'under_review')
      ORDER BY priority DESC, created_at ASC 
      LIMIT $1
    `, [limit]);

    return result.rows.map(row => this.mapRowToReviewCase(row));


  private async getTopRiskEntities(_____limit: number): Promise<RiskEntity[]> {

    // Implementation would query for highest risk entities
    return [];


  private async getPerformanceMetrics(): Promise<PerformanceMetrics> {

    return {
      avgProcessingTime: 0,
      throughput: 0,
      errorRate: 0,
      cacheHitRate: 0
    };


  // Case management helpers
  private determineCasePriority(detectionResult: FraudDetectionResult): 'low' | 'medium' | 'high' | 'urgent' {
    if (detectionResult.fraudScore >= 90) return 'urgent';
    if (detectionResult.fraudScore >= 75) return 'high';
    if (detectionResult.fraudScore >= 50) return 'medium';
    return 'low';


  private calculateCaseDeadline(priority: string): Date {
    const hours = { urgent: 2, high: 8, medium: 24, low: 72 }[priority] || 72;
    return new Date(Date.now() + hours * 60 * 60 * 1000);


  private extractEvidence(detectionResult: FraudDetectionResult): FraudEvidence[] {
    return detectionResult.riskFactors.map(rf => ({
      evidenceId: this.generateEvidenceId(),
      type: 'behavioral',
      source: 'fraud_detection_engine',
      description: rf.description,
      data: rf,
      confidence: rf.confidence
    }));


  private generateCaseTags(detectionResult: FraudDetectionResult, entityType: string): string[] {
    return [
      entityType,
      detectionResult.riskLevel,
      detectionResult.detectionMethod.primary,
      ...detectionResult.riskFactors.map(rf => rf.type)
    ];


  private shouldAutoAssign(reviewCase: FraudReviewCase): boolean {
    return reviewCase.priority === 'urgent' || reviewCase.priority === 'high';


  private async autoAssignCase(reviewCase: FraudReviewCase): Promise<void> {

    // Implementation would auto-assign to available analyst
    console.log(`🤖 Auto-assigning case ${reviewCase.caseId}`);


  private async executeDecisionActions(
    reviewCase: FraudReviewCase, 
    decision: FraudReviewDecision
  ): Promise<void> {

    // Implementation would execute enforcement actions based on decision
    console.log(`⚡ Executing decision actions for case ${reviewCase.caseId}: ${decision.decision}`);


  // Database operations
  private async storeReviewCase(reviewCase: FraudReviewCase): Promise<void> {

    await this.db.query(`
      INSERT INTO fraud_review_cases (
        case_id, type, status, priority, fraud_score, risk_level,
        entity_type, entity_id, detection_result, created_at, updated_at,
        deadline, evidence, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      reviewCase.caseId, reviewCase.type, reviewCase.status, reviewCase.priority,
      reviewCase.fraudScore, reviewCase.riskLevel, reviewCase.entityType,
      reviewCase.entityId, JSON.stringify(reviewCase.detectionResult),
      reviewCase.createdAt, reviewCase.updatedAt, reviewCase.deadline,
      JSON.stringify(reviewCase.evidence), JSON.stringify(reviewCase.tags)
    ]);


  private async getReviewCase(caseId: string): Promise<FraudReviewCase | null> {

    const result = await this.db.query(`
      SELECT * FROM fraud_review_cases WHERE case_id = $1
    `, [caseId]);

    if (result.rows.length === 0) return null;
    return this.mapRowToReviewCase(result.rows[0]);


  private mapRowToReviewCase(row: unknown): FraudReviewCase {
    return {
      caseId: row.case_id,
      type: row.type,
      status: row.status,
      priority: row.priority,
      fraudScore: row.fraud_score,
      riskLevel: row.risk_level,
      entityType: row.entity_type,
      entityId: row.entity_id,
      detectionResult: JSON.parse(row.detection_result),
      assignedTo: row.assigned_to,
      assignedAt: row.assigned_at,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      reviewNotes: [], // Would load separately
      decision: row.decision ? JSON.parse(row.decision) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deadline: row.deadline,
      evidence: JSON.parse(row.evidence || '[]'),
      relatedCases: JSON.parse(row.related_cases || '[]'),
      tags: JSON.parse(row.tags || '[]')
    };


  private async storeAlert(alert: FraudAlert): Promise<void> {

    await this.db.query(`
      INSERT INTO fraud_alerts (
        alert_id, severity, type, title, description, fraud_score,
        entity_type, entity_id, detection_method, status, created_at,
        expires_at, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      alert.alertId, alert.severity, alert.type, alert.title, alert.description,
      alert.fraudScore, alert.entityType, alert.entityId, alert.detectionMethod,
      alert.status, alert.createdAt, alert.expiresAt, JSON.stringify(alert.tags)
    ]);


  private async getAlert(alertId: string): Promise<FraudAlert | null> {

    const result = await this.db.query(`
      SELECT * FROM fraud_alerts WHERE alert_id = $1
    `, [alertId]);

    if (result.rows.length === 0) return null;
    return this.mapRowToAlert(result.rows[0]);


  private mapRowToAlert(row: unknown): FraudAlert {
    return {
      alertId: row.alert_id,
      severity: row.severity,
      type: row.type,
      title: row.title,
      description: row.description,
      fraudScore: row.fraud_score,
      entityType: row.entity_type,
      entityId: row.entity_id,
      detectionMethod: row.detection_method,
      status: row.status,
      acknowledgedBy: row.acknowledged_by,
      acknowledgedAt: row.acknowledged_at,
      resolvedBy: row.resolved_by,
      resolvedAt: row.resolved_at,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      tags: JSON.parse(row.tags || '[]'),
      relatedAlerts: JSON.parse(row.related_alerts || '[]')
    };


  private async storeReviewNote(caseId: string, note: FraudReviewNote): Promise<void> {

    await this.db.query(`
      INSERT INTO fraud_review_notes (
        note_id, case_id, reviewer_id, note, type, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [note.noteId, caseId, note.reviewerId, note.note, note.type, note.timestamp]);


  private async updateCaseTimestamp(caseId: string): Promise<void> {

    await this.db.query(`
      UPDATE fraud_review_cases SET updated_at = NOW() WHERE case_id = $1
    `, [caseId]);


  private async storeFraudRule(rule: FraudRule): Promise<void> {

    await this.db.query(`
      INSERT INTO fraud_rules (
        rule_id, name, description, category, severity, enabled,
        conditions, actions, thresholds, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (rule_id) DO UPDATE SET
        name = $2, description = $3, category = $4, severity = $5,
        enabled = $6, conditions = $7, actions = $8, thresholds = $9,
        metadata = $10
    `, [
      rule.ruleId, rule.name, rule.description, rule.category, rule.severity,
      rule.enabled, JSON.stringify(rule.conditions), JSON.stringify(rule.actions),
      JSON.stringify(rule.thresholds), JSON.stringify(rule.metadata)
    ]);


  // Notification methods
  private async notifyNewReviewCase(reviewCase: FraudReviewCase): Promise<void> {

    console.log(`📧 Notifying new review case: ${reviewCase.caseId}`);


  private async notifyDecisionMade(reviewCase: FraudReviewCase, decision: FraudReviewDecision): Promise<void> {

    console.log(`📧 Notifying decision made for case: ${reviewCase.caseId} - ${decision.decision}`);


  private async sendAlertNotification(alert: FraudAlert): Promise<void> {

    console.log(`📧 Sending alert notification: ${alert.alertId} (${alert.severity})`);


  // ID generation methods
  private generateCaseId(): string {
    return `FC-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;


  private generateNoteId(): string {
    return `FN-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;


  private generateAlertId(): string {
    return `FA-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;


  private generateRuleId(): string {
    return `FR-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;


  private generateEvidenceId(): string {
    return `FE-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;


  private generateInsightId(): string {
    return `FI-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;


  private generateRecommendationId(): string {
    return `FR-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;



// Supporting interfaces



interface FraudDashboardSummary {
  todayStats: {
    totalDetections: number;
    blockedTransactions: number;
    reviewQueue: number;
    avgFraudScore: number;



  };
  weeklyTrend: {
    fraudRate: number;
    volumeChange: number;
    performanceChange: number;
  };
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    avgResponseTime: number;
    errorRate: number;
  };




interface RiskEntity {
  entityType: 'user' | 'transaction' | 'account';
  entityId: string;
  riskScore: number;
  riskLevel: string;
  lastActivity: Date;
  actions: string[];







interface PerformanceMetrics {
  avgProcessingTime: number;
  throughput: number;
  errorRate: number;
  cacheHitRate: number;



