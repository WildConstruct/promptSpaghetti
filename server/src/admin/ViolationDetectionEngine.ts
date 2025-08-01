/**
 * Violation Detection Engine - Epic 17.5.4
 * 
 * Automated scanning and detection engine for policy violations.
 * Integrates with trust scoring, content analysis, and behavior monitoring.
 * 
 * Task: E17-1753114397376-1B07D9 - Develop enforcement tools
 * Epic: 17 - Backstage Admin Controls
 */

import { Database } from '../database';
import { TrustScoreService } from '../services/trust/TrustScoreService';
import { ContentQualityMetricsService } from '../marketplace/ContentQualityMetricsService';
import { PolicyViolation } from './PolicyManagementService';
import {
  UserTrustScore,
  TemplateTrustScore,
  TransactionTrustScore,
  RiskFactor,
  FraudIndicator
 from '../../../packages/core/types/TrustTypes';



export interface ViolationRule {
  ruleId: string;
  name: string;
  description: string;
  category: 'trust_score' | 'fraud_detection' | 'content_quality' | 'user_behavior' | 'transaction_monitoring';
  severity: 'low' | 'medium' | 'high' | 'critical';
  entityTypes: ('user' | 'template' | 'transaction')[];
  conditions: {
    trustScore?: {
      operator: 'lt' | 'lte' | 'gt' | 'gte' | 'eq';
      value: number;



    };
    riskFactors?: {
      minimumCount: number;
      severities: ('low' | 'medium' | 'high' | 'critical')[];
    };
    fraudIndicators?: {
      minimumCount: number;
      minimumScore: number;
    };
    contentQuality?: {
      minimumScore: number;
      requiredFlags: string[];
    };
    userBehavior?: {
      patterns: string[];
      timeWindow: number; // minutes
    };
    transaction?: {
      minimumAmount: number;
      velocityThreshold: number;
      riskScore: number;
    };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;




export interface ScanOptions {
  entityTypes?: ('user' | 'template' | 'transaction')[];
  entityIds?: string[];
  ruleIds?: string[];
  categories?: string[];
  severities?: ('low' | 'medium' | 'high' | 'critical')[];
  timeRange?: {
    from: Date;
    to: Date;



  };
  maxResults?: number;




export interface ScanResult {
  totalScanned: number;
  violationsFound: number;
  violationsByCategory: Record<string, number>;
  violationsBySeverity: Record<string, number>;
  violations: PolicyViolation[];
  scanDuration: number;
  timestamp: Date;





export class ViolationDetectionEngine {
  private db: Database;
  private trustScoreService: TrustScoreService;
  private contentQualityService: ContentQualityMetricsService;
  private activeRules: Map<string, ViolationRule> = new Map();

  constructor(
    database: Database,
    trustScoreService: TrustScoreService,
    contentQualityService: ContentQualityMetricsService
  ) {
    this.db = database;
    this.trustScoreService = trustScoreService;
    this.contentQualityService = contentQualityService;


  // =============================================================================
  // Core Detection Methods
  // =============================================================================

  /**
   * Initialize detection engine and load active rules
   */
  async initialize(): Promise<void> {

    console.log('🔍 Initializing Violation Detection Engine');
    await this.loadActiveRules();
    console.log(`✅ Loaded ${this.activeRules.size} active violation rules`);


  /**
   * Perform comprehensive violation scan
   */
  async scanForViolations(options: ScanOptions = {}): Promise<ScanResult> {

    const startTime = Date.now();
    console.log('🚨 Starting violation detection scan', options);

    const violations: PolicyViolation[] = [];
    let totalScanned = 0;

    // Refresh rules if needed
    if (this.activeRules.size === 0) {
      await this.loadActiveRules();


    // Filter rules based on options
    const applicableRules = this.getApplicableRules(options);
    console.log(`🔎 Using ${applicableRules.length} applicable rules`);

    // Scan each entity type
    if (!options.entityTypes || options.entityTypes.includes('user')) {
      const userViolations = await this.scanUserViolations(applicableRules, options);
      violations.push(...userViolations);
      totalScanned += userViolations.length;


    if (!options.entityTypes || options.entityTypes.includes('template')) {
      const templateViolations = await this.scanTemplateViolations(applicableRules, options);
      violations.push(...templateViolations);
      totalScanned += templateViolations.length;


    if (!options.entityTypes || options.entityTypes.includes('transaction')) {
      const transactionViolations = await this.scanTransactionViolations(applicableRules, options);
      violations.push(...transactionViolations);
      totalScanned += transactionViolations.length;


    // Aggregate results
    const scanDuration = Date.now() - startTime;
    const result: ScanResult = {
      totalScanned,
      violationsFound: violations.length,
      violationsByCategory: this.aggregateViolationsByCategory(violations),
      violationsBySeverity: this.aggregateViolationsBySeverity(violations),
      violations: options.maxResults ? violations.slice(0, options.maxResults) : violations,
      scanDuration,
      timestamp: new Date()
    };

    console.log(`✅ Scan completed: ${result.violationsFound} violations found in ${scanDuration}ms`);
    return result;


  /**
   * Scan specific entity for violations
   */
  async scanEntity(
    entityType: 'user' | 'template' | 'transaction',
    entityId: string,
    ruleIds?: string[]
  ): Promise<PolicyViolation[]> {

    console.log(`🔍 Scanning ${entityType} ${entityId} for violations`);

    const applicableRules = this.getApplicableRules({
      entityTypes: [entityType],
      entityIds: [entityId],
      ruleIds
    });

    switch (entityType) {
    case 'user':
      return await this.scanUserViolations(applicableRules, { entityIds: [entityId] });
    case 'template':
      return await this.scanTemplateViolations(applicableRules, { entityIds: [entityId] });
    case 'transaction':
      return await this.scanTransactionViolations(applicableRules, { entityIds: [entityId] });
    default:
      throw new Error(`Unknown entity type: ${entityType}`);



  // =============================================================================
  // Entity-Specific Scanning Methods
  // =============================================================================

  /**
   * Scan users for policy violations
   */
  private async scanUserViolations(rules: ViolationRule[], options: ScanOptions): Promise<PolicyViolation[]> {

    const violations: PolicyViolation[] = [];
    const userRules = rules.filter(r => r.entityTypes.includes('user'));
    
    if (userRules.length === 0) return violations;

    console.log(`👥 Scanning users with ${userRules.length} rules`);

    // Get user IDs to scan
    const userIds = await this.getUserIdsToScan(options);
    
    for (const userId of userIds) {
      try {
        const userTrustScore = await this.trustScoreService.calculateUserTrustScore(userId);
        
        for (const rule of userRules) {
          const violation = await this.evaluateUserRule(rule, userTrustScore, userId);
          if (violation) {
            violations.push(violation);


 catch (error) {
        console.error(`❌ Error scanning user ${userId}:`, error);



    return violations;


  /**
   * Scan templates for policy violations
   */
  private async scanTemplateViolations(rules: ViolationRule[], options: ScanOptions): Promise<PolicyViolation[]> {

    const violations: PolicyViolation[] = [];
    const templateRules = rules.filter(r => r.entityTypes.includes('template'));
    
    if (templateRules.length === 0) return violations;

    console.log(`📄 Scanning templates with ${templateRules.length} rules`);

    // Get template IDs to scan
    const templateIds = await this.getTemplateIdsToScan(options);
    
    for (const templateId of templateIds) {
      try {
        const templateTrustScore = await this.trustScoreService.calculateTemplateTrustScore(templateId);
        
        for (const rule of templateRules) {
          const violation = await this.evaluateTemplateRule(rule, templateTrustScore, templateId);
          if (violation) {
            violations.push(violation);


 catch (error) {
        console.error(`❌ Error scanning template ${templateId}:`, error);



    return violations;


  /**
   * Scan transactions for policy violations
   */
  private async scanTransactionViolations(rules: ViolationRule[], options: ScanOptions): Promise<PolicyViolation[]> {

    const violations: PolicyViolation[] = [];
    const transactionRules = rules.filter(r => r.entityTypes.includes('transaction'));
    
    if (transactionRules.length === 0) return violations;

    console.log(`💳 Scanning transactions with ${transactionRules.length} rules`);

    // Get transaction IDs to scan
    const transactionIds = await this.getTransactionIdsToScan(options);
    
    for (const transactionId of transactionIds) {
      try {
        const transactionTrustScore = await this.trustScoreService.calculateTransactionTrustScore(transactionId);
        
        for (const rule of transactionRules) {
          const violation = await this.evaluateTransactionRule(rule, transactionTrustScore, transactionId);
          if (violation) {
            violations.push(violation);


 catch (error) {
        console.error(`❌ Error scanning transaction ${transactionId}:`, error);



    return violations;


  // =============================================================================
  // Rule Evaluation Methods
  // =============================================================================

  /**
   * Evaluate user against violation rule
   */
  private async evaluateUserRule(
    rule: ViolationRule,
    userTrustScore: UserTrustScore,
    userId: string
  ): Promise<PolicyViolation | null> {

    const conditions = rule.conditions;
    let violation: PolicyViolation | null = null;

    // Check trust score conditions
    if (conditions.trustScore) {
      if (!this.evaluateTrustScoreCondition(userTrustScore.score, conditions.trustScore)) {
        return null;

      
      violation = {
        violationId: this.generateViolationId(),
        policyId: rule.ruleId,
        entityType: 'user',
        entityId: userId,
        violationType: `trust_score_${conditions.trustScore.operator}_${conditions.trustScore.value}`,
        severity: rule.severity,
        evidence: {
          trustScore: userTrustScore.score,
          threshold: conditions.trustScore.value,
          operator: conditions.trustScore.operator

        detectedAt: new Date(),
        status: 'pending'
      };


    // Check risk factor conditions
    if (conditions.riskFactors && userTrustScore.riskFactors) {
      const matchingRisks = userTrustScore.riskFactors.filter(rf => 
        conditions.riskFactors!.severities.includes(rf.severity)
      );
      
      if (matchingRisks.length >= conditions.riskFactors.minimumCount) {
        violation = {
          violationId: this.generateViolationId(),
          policyId: rule.ruleId,
          entityType: 'user',
          entityId: userId,
          violationType: 'risk_factors_threshold_exceeded',
          severity: rule.severity,
          evidence: {
            riskFactorCount: matchingRisks.length,
            threshold: conditions.riskFactors.minimumCount,
            riskFactors: matchingRisks

          detectedAt: new Date(),
          status: 'pending'
        };



    // Check user behavior conditions
    if (conditions.userBehavior) {
      const behaviorViolation = await this.evaluateUserBehaviorCondition(userId, conditions.userBehavior);
      if (behaviorViolation) {
        violation = {
          violationId: this.generateViolationId(),
          policyId: rule.ruleId,
          entityType: 'user',
          entityId: userId,
          violationType: 'suspicious_behavior_pattern',
          severity: rule.severity,
          evidence: behaviorViolation,
          detectedAt: new Date(),
          status: 'pending'
        };



    return violation;


  /**
   * Evaluate template against violation rule
   */
  private async evaluateTemplateRule(
    rule: ViolationRule,
    templateTrustScore: TemplateTrustScore,
    templateId: string
  ): Promise<PolicyViolation | null> {

    const conditions = rule.conditions;
    let violation: PolicyViolation | null = null;

    // Check trust score conditions
    if (conditions.trustScore) {
      if (!this.evaluateTrustScoreCondition(templateTrustScore.score, conditions.trustScore)) {
        return null;

      
      violation = {
        violationId: this.generateViolationId(),
        policyId: rule.ruleId,
        entityType: 'template',
        entityId: templateId,
        violationType: `trust_score_${conditions.trustScore.operator}_${conditions.trustScore.value}`,
        severity: rule.severity,
        evidence: {
          trustScore: templateTrustScore.score,
          threshold: conditions.trustScore.value,
          operator: conditions.trustScore.operator

        detectedAt: new Date(),
        status: 'pending'
      };


    // Check content quality conditions
    if (conditions.contentQuality) {
      const qualityViolation = await this.evaluateContentQualityCondition(templateId, conditions.contentQuality);
      if (qualityViolation) {
        violation = {
          violationId: this.generateViolationId(),
          policyId: rule.ruleId,
          entityType: 'template',
          entityId: templateId,
          violationType: 'content_quality_violation',
          severity: rule.severity,
          evidence: qualityViolation,
          detectedAt: new Date(),
          status: 'pending'
        };



    return violation;


  /**
   * Evaluate transaction against violation rule
   */
  private async evaluateTransactionRule(
    rule: ViolationRule,
    transactionTrustScore: TransactionTrustScore,
    transactionId: string
  ): Promise<PolicyViolation | null> {

    const conditions = rule.conditions;
    let violation: PolicyViolation | null = null;

    // Check fraud indicators
    if (conditions.fraudIndicators && transactionTrustScore.fraudIndicators) {
      if (transactionTrustScore.fraudIndicators.length >= conditions.fraudIndicators.minimumCount ||
          transactionTrustScore.fraudScore >= conditions.fraudIndicators.minimumScore) {
        
        violation = {
          violationId: this.generateViolationId(),
          policyId: rule.ruleId,
          entityType: 'transaction',
          entityId: transactionId,
          violationType: 'fraud_indicators_detected',
          severity: rule.severity,
          evidence: {
            fraudScore: transactionTrustScore.fraudScore,
            fraudIndicators: transactionTrustScore.fraudIndicators,
            thresholds: conditions.fraudIndicators

          detectedAt: new Date(),
          status: 'pending'
        };



    // Check transaction-specific conditions
    if (conditions.transaction) {
      const transactionViolation = await this.evaluateTransactionCondition(transactionId, conditions.transaction);
      if (transactionViolation) {
        violation = {
          violationId: this.generateViolationId(),
          policyId: rule.ruleId,
          entityType: 'transaction',
          entityId: transactionId,
          violationType: 'transaction_threshold_exceeded',
          severity: rule.severity,
          evidence: transactionViolation,
          detectedAt: new Date(),
          status: 'pending'
        };



    return violation;


  // =============================================================================
  // Condition Evaluation Helpers
  // =============================================================================

  private evaluateTrustScoreCondition(score: number, condition: { operator: string; value: number }): boolean {
    switch (condition.operator) {
    case 'lt': return score < condition.value;
    case 'lte': return score <= condition.value;
    case 'gt': return score > condition.value;
    case 'gte': return score >= condition.value;
    case 'eq': return score === condition.value;
    default: return false;



  private async evaluateUserBehaviorCondition(userId: string, condition: any): Promise<any | null> {

    // Placeholder for user behavior analysis
    // Would analyze recent user activity patterns, velocity, etc.
    return null;


  private async evaluateContentQualityCondition(templateId: string, condition: any): Promise<any | null> {

    // Placeholder for content quality analysis
    // Would integrate with ContentQualityMetricsService
    return null;


  private async evaluateTransactionCondition(transactionId: string, condition: any): Promise<any | null> {

    // Placeholder for transaction analysis
    // Would analyze transaction patterns, amounts, velocity, etc.
    return null;


  // =============================================================================
  // Helper Methods
  // =============================================================================

  private async loadActiveRules(): Promise<void> {

    const result = await this.db.query(`
      SELECT rule_id, name, description, category, severity, entity_types, 
             conditions, is_active, created_at, updated_at
      FROM violation_rules 
      WHERE is_active = true
    `);

    this.activeRules.clear();
    for (const row of result.rows) {
      const rule: ViolationRule = {
        ruleId: row.rule_id,
        name: row.name,
        description: row.description,
        category: row.category,
        severity: row.severity,
        entityTypes: JSON.parse(row.entity_types),
        conditions: JSON.parse(row.conditions),
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
      this.activeRules.set(rule.ruleId, rule);



  private getApplicableRules(options: ScanOptions): ViolationRule[] {
    let rules = Array.from(this.activeRules.values());

    if (options.ruleIds) {
      rules = rules.filter(r => options.ruleIds!.includes(r.ruleId));


    if (options.categories) {
      rules = rules.filter(r => options.categories!.includes(r.category));


    if (options.severities) {
      rules = rules.filter(r => options.severities!.includes(r.severity));


    if (options.entityTypes) {
      rules = rules.filter(r => r.entityTypes.some(et => options.entityTypes!.includes(et)));


    return rules;


  private async getUserIdsToScan(options: ScanOptions): Promise<string[]> {

    if (options.entityIds) {
      return options.entityIds;


    // Default: scan recent users or all users up to a limit
    const result = await this.db.query(`
      SELECT id FROM users 
      ORDER BY created_at DESC 
      LIMIT 1000
    `);

    return result.rows.map(row => row.id);


  private async getTemplateIdsToScan(options: ScanOptions): Promise<string[]> {

    if (options.entityIds) {
      return options.entityIds;


    // Default: scan recent templates
    const result = await this.db.query(`
      SELECT id FROM templates 
      ORDER BY created_at DESC 
      LIMIT 1000
    `);

    return result.rows.map(row => row.id);


  private async getTransactionIdsToScan(options: ScanOptions): Promise<string[]> {

    if (options.entityIds) {
      return options.entityIds;


    // Default: scan recent transactions
    const result = await this.db.query(`
      SELECT id FROM transactions 
      ORDER BY created_at DESC 
      LIMIT 1000
    `);

    return result.rows.map(row => row.id);


  private aggregateViolationsByCategory(violations: PolicyViolation[]): Record<string, number> {
    const categoryMap: Record<string, number> = {};
    for (const violation of violations) {
      const category = violation.violationType.split('_')[0] || 'unknown';
      categoryMap[category] = (categoryMap[category] || 0) + 1;

    return categoryMap;


  private aggregateViolationsBySeverity(violations: PolicyViolation[]): Record<string, number> {
    const severityMap: Record<string, number> = {};
    for (const violation of violations) {
      severityMap[violation.severity] = (severityMap[violation.severity] || 0) + 1;

    return severityMap;


  private generateViolationId(): string {
    return `VIO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

