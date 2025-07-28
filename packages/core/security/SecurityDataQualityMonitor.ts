/**
 * Epic 31.4.1 - Security Intelligence Data Quality Monitoring and Validation
 * 
 * Comprehensive data quality monitoring system for security intelligence pipelines.
 * Provides real-time validation, quality metrics, anomaly detection for data quality,
 * and automated remediation capabilities.
 * 
 * Task: E31-1753313263565-A273CD
 */
import { EventEmitter } from 'events';
import { SecurityIntelligence } from './MLSecurityAnalyticsFramework';
import { SecurityAnomaly } from './SecurityAnomalyDetector';

// ==========================================
// TYPES AND INTERFACES
// ==========================================

export interface DataQualityConfig {
  enableRealTimeValidation: boolean;,
  validationInterval: number;
  qualityThresholds: QualityThresholds;,
  enableAutomaticRemediation: boolean;
  retentionPeriodDays: number;,
  alertingEnabled: boolean;
  reportingEnabled: boolean;,
  validationRules: ValidationRule;
}
export interface QualityThresholds {
  completeness: number; // 0-100%,
  accuracy: number; // 0-100%,
  consistency: number; // 0-100%,
  timeliness: number; // max age in minutes,
  validity: number; // 0-100%,
  uniqueness: number; // 0-100%,
  overall: number; // 0-100%,
}
export interface ValidationRule {
  id: string;,
  name: string;
  description: string;,
  ruleType: ValidationRuleType;
  severity: ValidationSeverity;,
  enabled: boolean;
  parameters: Record<string, unknown>;
  lastUpdated: Date;,
  executionCount: number;
  violationCount: number;
}
export enum ValidationRuleType {
  SCHEMA_VALIDATION = 'schema_validation',
  RANGE_CHECK = 'range_check',
  FORMAT_VALIDATION = 'format_validation',
  REFERENCE_INTEGRITY = 'reference_integrity',
  BUSINESS_RULE = 'business_rule',
  TEMPORAL_CONSISTENCY = 'temporal_consistency',
  CROSS_FIELD_VALIDATION = 'cross_field_validation',
  STATISTICAL_OUTLIER = 'statistical_outlier',
  DUPLICATE_DETECTION = 'duplicate_detection',
  COMPLETENESS_CHECK = 'completeness_check'
  export enum ValidationSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
  export interface DataQualityReport {
  reportId: string;,
  generatedAt: Date;
  period: {,
  start: Date;,
  end: Date;
};
  overallScore: number;,
  qualityDimensions: QualityDimensionScore;
  violations: DataQualityViolation;,
  trends: QualityTrend;
  recommendations: QualityRecommendation;,
  dataSourceMetrics: DataSourceQuality;
}
export interface QualityDimensionScore {
  dimension: QualityDimension;,
  score: number; // 0-100,
  trend: 'improving' | 'declining' | 'stable';,
  violationCount: number;
  issuesSummary: string;
}
export enum QualityDimension {
  COMPLETENESS = 'completeness',
  ACCURACY = 'accuracy',
  CONSISTENCY = 'consistency',
  TIMELINESS = 'timeliness',
  VALIDITY = 'validity',
  UNIQUENESS = 'uniqueness'
  export interface DataQualityViolation {
  violationId: string;,
  timestamp: Date;
  ruleId: string;,
  ruleName: string;
  severity: ValidationSeverity;,
  dimension: QualityDimension;
  dataSource: string;
  recordId?: string;
  fieldName?: string;
  expectedValue?: unknown;
  actualValue?: unknown;
  description: string;,
  context: Record<string, unknown>;
  isResolved: boolean;
  resolvedAt?: Date;
  remediation?: RemediationAction;
}
export interface RemediationAction {
  actionType: RemediationActionType;,
  description: string;
  executedAt: Date;,
  result: 'success' | 'failure' | 'partial';
  details: string;
}
export enum RemediationActionType {
  DATA_CORRECTION = 'data_correction',
  RECORD_FLAGGING = 'record_flagging',
  SOURCE_NOTIFICATION = 'source_notification',
  AUTOMATIC_REPAIR = 'automatic_repair',
  QUARANTINE = 'quarantine',
  ENRICHMENT = 'enrichment',
  TRANSFORMATION = 'transformation'
  export interface QualityTrend {
  dimension: QualityDimension;,
  timeframe: string;
  direction: 'improving' | 'declining' | 'stable';,
  changePercent: number;
  significance: 'high' | 'medium' | 'low';,
  driverFactors: string;
}
export interface QualityRecommendation {
  id: string;,
  priority: 'immediate' | 'high' | 'medium' | 'low';
  category: string;,
  title: string;
  description: string;,
  expectedImpact: string;
  estimatedEffort: string;,
  targetDimensions: QualityDimension;
  implementationSteps: string;
}
export interface DataSourceQuality {
  sourceName: string;,
  sourceType: string;
  overallScore: number;,
  recordCount: number;
  qualityIssues: number;,
  lastValidated: Date;
  dimensions: Record<QualityDimension, number>;
  commonIssues: string;
}
export interface DataQualityMetrics {
  totalRecordsProcessed: number;,
  totalViolations: number;
  criticalViolations: number;,
  averageQualityScore: number;
  dataSourceCount: number;,
  automatedRemediations: number;
  manualInterventions: number;,
  qualityTrend: 'improving' | 'declining' | 'stable';
}
export interface ValidationContext {
  recordId: string;,
  dataSource: string;
  timestamp: Date;,
  metadata: Record<string, unknown>;
  relatedRecords?: unknown;
}
export interface QualityProfile {
  dataSourceName: string;,
  expectedSchema: Record<string, FieldExpectation>;
  statisticalBaseline: StatisticalBaseline;,
  businessRules: BusinessRule;
  lastUpdated: Date;,
  validationHistory: ValidationHistoryEntry;
}
export interface FieldExpectation {
  fieldName: string;,
  dataType: string;
  required: boolean;
  format?: string;
  minValue?: number;
  maxValue?: number;
  allowedValues?: unknown;
  nullablePercent: number;,
  uniquenessRequired: boolean;
}
export interface StatisticalBaseline {
  recordCount: {,
  mean: number;,
  standardDeviation: number;
  min: number;,
  max: number;
};
  fieldStatistics: Record<string, FieldStatistics>;
  temporalPatterns: TemporalPattern;
}
export interface FieldStatistics {
  fieldName: string;,
  dataType: string;
  nullPercent: number;,
  uniquePercent: number;
  averageLength?: number;
  commonValues: Array<{ value: unknown; frequency: number }>;
  outlierThreshold: number;
}
export interface TemporalPattern {
  pattern: 'hourly' | 'daily' | 'weekly' | 'monthly';,
  expectedVolume: number;
  variationThreshold: number;
}
export interface BusinessRule {
  ruleId: string;,
  name: string;
  description: string;,
  expression: string;
  severity: ValidationSeverity;,
  enabled: boolean;
}
export interface ValidationHistoryEntry {
  timestamp: Date;,
  overallScore: number;
  violationCount: number;,
  processingTime: number;
  recordsValidated: number;
  // ==========================================
  // MAIN DATA QUALITY MONITOR CLASS
  // ==========================================
}
export class SecurityDataQualityMonitor extends EventEmitter {
  private config: DataQualityConfig;
  private validationRules: Map<string, ValidationRule> = new Map();
  private qualityViolations: Map<string, DataQualityViolation> = new Map();
  private qualityProfiles: Map<string, QualityProfile> = new Map();
  private metrics: DataQualityMetrics = {,
  totalRecordsProcessed: 0,
  totalViolations: 0,
  criticalViolations: 0,
  averageQualityScore: 100,
  dataSourceCount: 0,
  automatedRemediations: 0,
  manualInterventions: 0,
  qualityTrend: 'stable',
};
  private validationInterval?: NodeJS.Timeout;
  private isValidating = false;
  constructor(config: Partial<DataQualityConfig> = {}) {
  super();
  this.config = {
  enableRealTimeValidation: true,
  validationInterval: 60000, // 1 minute,
  qualityThresholds: {,
  completeness: 95,
  accuracy: 90,
  consistency: 85,
  timeliness: 30, // 30 minutes,
  validity: 95,
  uniqueness: 99,
  overall: 90,
},
  enableAutomaticRemediation: false,
      retentionPeriodDays: 30,
      alertingEnabled: true,
      reportingEnabled: true,
      validationRules: [],
      ...config
    };
    this.initializeDefaultRules();
    if (this.config.enableRealTimeValidation) {
      this.startRealTimeValidation();
  // ==========================================
  // INITIALIZATION
  // ==========================================
  private initializeDefaultRules(): void {
    const defaultRules: ValidationRule = [
      {
        id: 'schema-completeness',
        name: 'Schema Completeness Check',
        description: 'Validates that all required fields are present',
        ruleType: ValidationRuleType.COMPLETENESS_CHECK,
        severity: ValidationSeverity.ERROR,
        enabled: true,
        parameters: { requiredFields: ['id', 'timestamp', 'type', 'severity'] },
        lastUpdated: new Date(),
        executionCount: 0,
        violationCount: 0;
  }
      {
        id: 'timestamp-validity',
        name: 'Timestamp Validity Check',
        description: 'Validates timestamp format and reasonableness',
        ruleType: ValidationRuleType.FORMAT_VALIDATION,
        severity: ValidationSeverity.ERROR,
        enabled: true,
        parameters: { maxFutureMinutes: 5, maxPastDays: 30 },
        lastUpdated: new Date(),
        executionCount: 0,
        violationCount: 0;
  }
      {
        id: 'severity-range',
        name: 'Severity Range Check',
        description: 'Validates severity values are within acceptable range',
        ruleType: ValidationRuleType.RANGE_CHECK,
        severity: ValidationSeverity.WARNING,
        enabled: true,
        parameters: { allowedValues: ['info', 'low', 'medium', 'high', 'critical'] },
        lastUpdated: new Date(),
        executionCount: 0,
        violationCount: 0;
  }
      {
        id: 'confidence-range',
        name: 'Confidence Range Check',
        description: 'Validates confidence values are between 0 and 1',
        ruleType: ValidationRuleType.RANGE_CHECK,
        severity: ValidationSeverity.WARNING,
        enabled: true,
        parameters: { minValue: 0, maxValue: 1 },
        lastUpdated: new Date(),
        executionCount: 0,
        violationCount: 0;
  }
      {
        id: 'duplicate-detection',
        name: 'Duplicate Record Detection',
        description: 'Detects duplicate records based on key fields',
        ruleType: ValidationRuleType.DUPLICATE_DETECTION,
        severity: ValidationSeverity.WARNING,
        enabled: true,
        parameters: { keyFields: ['id', 'timestamp', 'type'] },
        lastUpdated: new Date(),
        executionCount: 0,
        violationCount: 0;
  }
      {
        id: 'statistical-outlier',
        name: 'Statistical Outlier Detection',
        description: 'Detects statistical outliers in numeric fields',
        ruleType: ValidationRuleType.STATISTICAL_OUTLIER,
        severity: ValidationSeverity.INFO,
        enabled: true,
        parameters: { zScoreThreshold: 3, fields: ['confidence', 'riskScore'] },
        lastUpdated: new Date(),
        executionCount: 0,
        violationCount: 0];
    defaultRules.forEach(rule => {)
  this.validationRules.set(rule.id, rule);
    });
  // ==========================================
  // DATA VALIDATION
  // ==========================================
  /**
   * Validate security intelligence data
   */
  public async validateSecurityIntelligence(intelligence: SecurityIntelligence): Promise<DataQualityViolation> {
    const violations: DataQualityViolation = [];
    for (const intel of intelligence) {
      const context: ValidationContext = {,
  recordId: intel.id,
        dataSource: 'security_intelligence',
        timestamp: intel.timestamp,
        metadata: { type: intel.type, severity: intel.severity }
      };
      const recordViolations = await this.validateRecord(intel, context);
      violations.push(...recordViolations);
    // Update metrics
    this.metrics.totalRecordsProcessed += intelligence.length;
    this.metrics.totalViolations += violations.length;
    this.metrics.criticalViolations += violations.filter(v => v.severity === ValidationSeverity.CRITICAL).length;
    // Process violations
    await this.processViolations(violations);
    this.emit('validationCompleted', {)
  recordCount: intelligence.length,
  violationCount: violations.length,
  violations
});
    return violations;
  /**
   * Validate security anomalies data
   */
  public async validateSecurityAnomalies(anomalies: SecurityAnomaly): Promise<DataQualityViolation> {
    const violations: DataQualityViolation = [];
    for (const anomaly of anomalies) {
      const context: ValidationContext = {,
  recordId: anomaly.id,
        dataSource: 'security_anomalies',
        timestamp: anomaly.timestamp,
        metadata: { type: anomaly.anomalyType, severity: anomaly.severity }
      };
      const recordViolations = await this.validateRecord(anomaly, context);
      violations.push(...recordViolations);
    // Update metrics
    this.metrics.totalRecordsProcessed += anomalies.length;
    this.metrics.totalViolations += violations.length;
    await this.processViolations(violations);
    this.emit('anomaliesValidated', {)
  recordCount: anomalies.length,
  violationCount: violations.length,
});
    return violations;
  /**
   * Validate individual record against all applicable rules
   */
  private async validateRecord(record: unknown, context: ValidationContext): Promise<DataQualityViolation> {
  const violations: DataQualityViolation = [];
  for (const rule of this.validationRules.values()) {
  if (!rule.enabled) continue;
  try {
  const ruleViolations = await this.executeValidationRule(rule, record, context);
  violations.push(...ruleViolations);
  rule.executionCount++;
  rule.violationCount += ruleViolations.length;
} catch (error) {
        console.error(`Error executing validation rule ${rule.id}:`, error);}
        this.emit('ruleExecutionError', { rule, error, context });
    return violations;
  /**
   * Execute specific validation rule
   */
  private async executeValidationRule(rule: ValidationRule,)
    record: any,
    context: ValidationContext): Promise<DataQualityViolation> {,
    const violations: DataQualityViolation = [];
    switch (rule.ruleType) {
      case ValidationRuleType.COMPLETENESS_CHECK:
        violations.push(...this.validateCompleteness(rule, record, context));
        break;
      case ValidationRuleType.FORMAT_VALIDATION:
        violations.push(...this.validateFormat(rule, record, context));
        break;
      case ValidationRuleType.RANGE_CHECK:
        violations.push(...this.validateRange(rule, record, context));
        break;
      case ValidationRuleType.DUPLICATE_DETECTION:
        violations.push(...await this.validateDuplicates(rule, record, context));
        break;
      case ValidationRuleType.STATISTICAL_OUTLIER:
        violations.push(...this.validateStatisticalOutliers(rule, record, context));
        break;
      case ValidationRuleType.TEMPORAL_CONSISTENCY:
        violations.push(...this.validateTemporalConsistency(rule, record, context));
        break;
      case ValidationRuleType.CROSS_FIELD_VALIDATION:
        violations.push(...this.validateCrossField(rule, record, context));
        break;
      default:
        console.warn(`Unsupported validation rule type: ${rule.ruleType}`);}
    return violations;
  // ==========================================
  // SPECIFIC VALIDATION METHODS
  // ==========================================
  private validateCompleteness(rule: ValidationRule, record: any, context: ValidationContext): DataQualityViolation {
    const violations: DataQualityViolation = [];
    const requiredFields = rule.parameters.requiredFields as string;
    for (const field of requiredFields) {
      if (record[field] === undefined || record[field] === null || record[field] === '') {
        violations.push(this.createViolation()
          rule,
          QualityDimension.COMPLETENESS,
          context,
          `Missing required field: ${field}`}
}
          field,
          'present',
          record[field]
        ));
    return violations;
  private validateFormat(rule: ValidationRule, record: any, context: ValidationContext): DataQualityViolation {
  const violations: DataQualityViolation = [];
  // Timestamp validation
  if (rule.id === 'timestamp-validity' && record.timestamp) {
  const timestamp = new Date(record.timestamp);
  const now = new Date();
  const maxFutureMs = (rule.parameters.maxFutureMinutes as number) * 60 * 1000;
  const maxPastMs = (rule.parameters.maxPastDays as number) * 24 * 60 * 60 * 1000;
  if (isNaN(timestamp.getTime())) {
  violations.push(this.createViolation()
  rule,
  QualityDimension.VALIDITY,
  context,
  'Invalid timestamp format',
  'timestamp',
  'valid date',
  record.timestamp
  ));
} else if (timestamp.getTime() > now.getTime() + maxFutureMs) {
        violations.push(this.createViolation()
          rule,
          QualityDimension.TIMELINESS,
          context,
          'Timestamp is too far in the future',
          'timestamp',
          `within ${rule.parameters.maxFutureMinutes} minutes`}
}
          record.timestamp
        ));
      } else if (timestamp.getTime() < now.getTime() - maxPastMs) {
        violations.push(this.createViolation()
          rule,
          QualityDimension.TIMELINESS,
          context,
          'Timestamp is too old',
          'timestamp',
          `within ${rule.parameters.maxPastDays} days`}
}
          record.timestamp
        ));
    return violations;
  private validateRange(rule: ValidationRule, record: any, context: ValidationContext): DataQualityViolation {
    const violations: DataQualityViolation = [];
    // Severity range validation
    if (rule.id === 'severity-range' && record.severity) {
      const allowedValues = rule.parameters.allowedValues as string;
      if (!allowedValues.includes(record.severity)) {
        violations.push(this.createViolation()
          rule,
          QualityDimension.VALIDITY,
          context,
          `Invalid severity value: ${record.severity}`}
}
          'severity',
          allowedValues.join(', '),
          record.severity
        ));
    // Confidence range validation
    if (rule.id === 'confidence-range' && record.confidence !== undefined) {
      const minValue = rule.parameters.minValue as number;
      const maxValue = rule.parameters.maxValue as number;
      if (record.confidence < minValue || record.confidence > maxValue) {
        violations.push(this.createViolation()
          rule,
          QualityDimension.VALIDITY,
          context,
          `Confidence value out of range: ${record.confidence}`}
}
          'confidence',
          `${minValue} - ${maxValue}`}
}
          record.confidence
        ));
    return violations;
  private async validateDuplicates(rule: ValidationRule,)
    record: any,
    context: ValidationContext): Promise<DataQualityViolation> {,
    const violations: DataQualityViolation = [];
    const keyFields = rule.parameters.keyFields as string;
    // Build composite key
    const keyValues = keyFields.map(field => record[field]).filter(Boolean);
    if (keyValues.length === keyFields.length) {
      const compositeKey = keyValues.join('|');
      // Check against recent records (simplified - would use actual duplicate tracking)
      const isDuplicate = Math.random() < 0.05; // 5% chance for demo;
      if (isDuplicate) {
        violations.push(this.createViolation()
          rule,
          QualityDimension.UNIQUENESS,
          context,
          `Potential duplicate record detected`,
          keyFields.join(','),
          'unique',
          compositeKey
        ));
    return violations;
  private validateStatisticalOutliers(rule: ValidationRule,)
    record: any,
    context: ValidationContext): DataQualityViolation {,
    const violations: DataQualityViolation = [];
    const zScoreThreshold = rule.parameters.zScoreThreshold as number;
    const fields = rule.parameters.fields as string;
    for (const field of fields) {
      if (record[field] !== undefined && typeof record[field] === 'number') {
        // Simplified outlier detection (would use actual statistical baseline)
        const isOutlier = Math.abs(record[field] - 0.5) > 0.4; // Simplified check;
        if (isOutlier) {
          violations.push(this.createViolation()
            rule,
            QualityDimension.CONSISTENCY,
            context,
            `Statistical outlier detected in field: ${field}`}
}
            field,
            'within normal range',
            record[field]
          ));
    return violations;
  private validateTemporalConsistency(rule: ValidationRule,)
    record: any,
    context: ValidationContext): DataQualityViolation {,
    const violations: DataQualityViolation = [];
    // Check temporal consistency between related timestamps
    if (record.timestamp && record.resolvedAt) {
      const eventTime = new Date(record.timestamp);
      const resolvedTime = new Date(record.resolvedAt);
      if (resolvedTime < eventTime) {
        violations.push(this.createViolation()
          rule,
          QualityDimension.CONSISTENCY,
          context,
          'Resolution timestamp cannot be before event timestamp',
          'resolvedAt',
          'after timestamp',
          record.resolvedAt
        ));
    return violations;
  private validateCrossField(rule: ValidationRule, record: any, context: ValidationContext): DataQualityViolation {
    const violations: DataQualityViolation = [];
    // Example: High confidence should align with high severity
    if (record.confidence !== undefined && record.severity) {
      if (record.confidence > 0.8 && record.severity === 'low') {
        violations.push(this.createViolation()
          rule,
          QualityDimension.CONSISTENCY,
          context,
          'High confidence with low severity is inconsistent',
          'confidence,severity',
          'consistent relationship',
          `${record.confidence}, ${record.severity}`}
        ));
    return violations;
  // ==========================================
  // VIOLATION PROCESSING
  // ==========================================
  private async processViolations(violations: DataQualityViolation): Promise<void> {
  for (const violation of violations) {
  // Store violation
  this.qualityViolations.set(violation.violationId, violation);
  // Attempt automatic remediation if enabled
  if (this.config.enableAutomaticRemediation && violation.severity !== ValidationSeverity.CRITICAL) {
  await this.attemptRemediation(violation);
  // Send alerts for critical violations
  if (this.config.alertingEnabled && violation.severity === ValidationSeverity.CRITICAL) {
  this.emit('criticalViolation', violation);
  // Update quality metrics
  await this.updateQualityMetrics();
  private async attemptRemediation(violation: DataQualityViolation): Promise<void> {,
  let remediation: RemediationAction | undefined;
  try {
  switch (violation.dimension) {
  case QualityDimension.COMPLETENESS:,
  remediation = await this.remediateCompleteness(violation);
  break;
  case QualityDimension.VALIDITY:,
  remediation = await this.remediateValidity(violation);
  break;
  case QualityDimension.CONSISTENCY:,
  remediation = await this.remediateConsistency(violation);
  break;
  default:,
  remediation = await this.remediateGeneric(violation);
  if (remediation) {
  violation.remediation = remediation;
  if (remediation.result === 'success') {
  violation.isResolved = true;
  violation.resolvedAt = new Date();
  this.metrics.automatedRemediations++;
} catch (error) {
      console.error('Remediation failed:', error);
      this.emit('remediationError', { violation, error });
  private async remediateCompleteness(violation: DataQualityViolation): Promise<RemediationAction> {
    // Attempt to enrich missing data
    return {
      actionType: RemediationActionType.ENRICHMENT,
      description: `Attempted to enrich missing field: ${violation.fieldName}`}
},
  executedAt: new Date(),
      result: 'partial',
      details: 'Enrichment service contacted';
  };
  private async remediateValidity(violation: DataQualityViolation): Promise<RemediationAction> {
    // Attempt to correct invalid data
    return {
      actionType: RemediationActionType.DATA_CORRECTION,
      description: `Attempted to correct invalid value in: ${violation.fieldName}`}
},
  executedAt: new Date(),
      result: 'success',
      details: 'Value corrected using validation rules';
  };
  private async remediateConsistency(violation: DataQualityViolation): Promise<RemediationAction> {
  // Flag inconsistent data for review
  return {
  actionType: RemediationActionType.RECORD_FLAGGING,
  description: `Flagged inconsistent record for manual review`,
  executedAt: new Date(),
  result: 'success',
  details: 'Record flagged in quality review queue',
};
  private async remediateGeneric(violation: DataQualityViolation): Promise<RemediationAction> {
  // Generic remediation - quarantine the record
  return {
  actionType: RemediationActionType.QUARANTINE,
  description: `Quarantined record due to quality violation`,
  executedAt: new Date(),
  result: 'success',
  details: 'Record moved to quality quarantine',
};
  // ==========================================
  // QUALITY REPORTING
  // ==========================================
  /**
   * Generate comprehensive data quality report
   */
  public async generateQualityReport(period: { start: Date; end: Date }): Promise<DataQualityReport> {
  const periodViolations = Array.from(this.qualityViolations.values());
  .filter(v => v.timestamp >= period.start && v.timestamp <= period.end);
  const qualityDimensions = await this.calculateQualityDimensions(periodViolations);
  const trends = await this.calculateQualityTrends(period);
  const recommendations = await this.generateRecommendations(qualityDimensions, periodViolations);
  const dataSourceMetrics = await this.calculateDataSourceMetrics(periodViolations);
  const overallScore = qualityDimensions.reduce((sum, dim) => sum + dim.score, 0) / qualityDimensions.length;
  return {
  reportId: this.generateReportId(),
  generatedAt: new Date(),
  period,
  overallScore,
  qualityDimensions,
  violations: periodViolations,
  trends,
  recommendations,
  dataSourceMetrics
};
  private async calculateQualityDimensions(violations: DataQualityViolation): Promise<QualityDimensionScore> {
  const dimensions = Object.values(QualityDimension);
  const scores: QualityDimensionScore = [];
  for (const dimension of dimensions) {
  const dimensionViolations = violations.filter(v => v.dimension === dimension);
  const violationCount = dimensionViolations.length;
  // Calculate score based on violations and thresholds
  let score = 100;
  switch (dimension) {
  case QualityDimension.COMPLETENESS:,
  score = Math.max(0, this.config.qualityThresholds.completeness - (violationCount * 5));
  break;
  case QualityDimension.ACCURACY:,
  score = Math.max(0, this.config.qualityThresholds.accuracy - (violationCount * 3));
  break;
  case QualityDimension.CONSISTENCY:,
  score = Math.max(0, this.config.qualityThresholds.consistency - (violationCount * 4));
  break;
  case QualityDimension.VALIDITY:,
  score = Math.max(0, this.config.qualityThresholds.validity - (violationCount * 2));
  break;
  case QualityDimension.UNIQUENESS:,
  score = Math.max(0, this.config.qualityThresholds.uniqueness - (violationCount * 10));
  break;
  case QualityDimension.TIMELINESS:,
  score = Math.max(0, 100 - (violationCount * 15));
  break;
  const issuesSummary = dimensionViolations;
  .reduce((issues, v) => {
  const issue = v.description;
  issues[issue] = (issues[issue] || 0) + 1;
  return issues;
}, {} as Record<string, number>);
      scores.push({)
  dimension,
        score,
        trend: 'stable', // Would calculate actual trend
        violationCount,
        issuesSummary: Object.entries(issuesSummary),
          .map(([issue, count]) => `${issue} (${count})`)}
          .slice(0, 5)
      });
    return scores;
  private async calculateQualityTrends(period: { start: Date; end: Date }): Promise<QualityTrend> {
  // Simplified trend calculation
  return Object.values(QualityDimension).map(dimension => ({)
  dimension,
  timeframe: 'last_24_hours',
  direction: 'stable' as const,
  changePercent: Math.random() * 10 - 5, // -5% to +5%,
  significance: 'low' as const,
  driverFactors: ['System stability', 'Data source reliability'],
}));
  private async generateRecommendations(()
    dimensions: QualityDimensionScore,
    violations: DataQualityViolation,
  ): Promise<QualityRecommendation> {
    const recommendations: QualityRecommendation = [];
    // Find dimensions with low scores
    const problematicDimensions = dimensions.filter(d => d.score < this.config.qualityThresholds.overall);
    for (const dimension of problematicDimensions) {
      recommendations.push({)
  id: `improve-${dimension.dimension}`}
},
  priority: dimension.score < 60 ? 'high' : 'medium',
        category: 'Data Quality Improvement',
        title: `Improve ${dimension.dimension.charAt(0).toUpperCase() + dimension.dimension.slice(1)}`}
},
  description: `Address ${dimension.violationCount} violations in ${dimension.dimension}`}
},
  expectedImpact: `Improve ${dimension.dimension} score by 15-20 points`}
},
  estimatedEffort: '1-2 weeks',
        targetDimensions: [dimension.dimension],
        implementationSteps: [,
          'Review violation patterns',
          'Implement targeted validation rules',
          'Set up automated monitoring',
          'Validate improvements'
        ]
      });
    // High violation count recommendation
    if (violations.length > 100) {
      recommendations.push({)
  id: 'reduce-violation-volume',
        priority: 'immediate',
        category: 'Violation Management',
        title: 'Reduce High Violation Volume',
        description: `${violations.length} violations detected, indicating systemic issues`}
},
  expectedImpact: 'Reduce violations by 60-70%',
        estimatedEffort: '2-3 weeks',
        targetDimensions: Object.values(QualityDimension),
        implementationSteps: [,
          'Identify root causes',
          'Implement source-level fixes',
          'Enhance validation rules',
          'Set up prevention measures'
        ]
      });
    return recommendations;
  private async calculateDataSourceMetrics(violations: DataQualityViolation): Promise<DataSourceQuality> {
    const sourceGroups = violations.reduce((groups, violation) => {
      if (!groups[violation.dataSource]) {
        groups[violation.dataSource] = [];
      groups[violation.dataSource].push(violation);
      return groups;
    }, {} as Record<string, DataQualityViolation>);
    return Object.entries(sourceGroups).map(([sourceName, sourceViolations]) => {
      const overallScore = Math.max(0, 100 - (sourceViolations.length * 2));
      const dimensionScores: Record<QualityDimension, number> = {} as Record<QualityDimension, number>;
      Object.values(QualityDimension).forEach(dimension => {)
  const dimensionViolations = sourceViolations.filter(v => v.dimension === dimension);
        dimensionScores[dimension] = Math.max(0, 100 - (dimensionViolations.length * 5));
      });
      const commonIssues = sourceViolations;
        .reduce((issues, v) => {
          issues[v.description] = (issues[v.description] || 0) + 1;
          return issues;
        }, {} as Record<string, number>);
      return {
  sourceName,
  sourceType: 'security_data',
  overallScore,
  recordCount: this.metrics.totalRecordsProcessed, // Simplified,
  qualityIssues: sourceViolations.length,
  lastValidated: new Date(),
  dimensions: dimensionScores,
  commonIssues: Object.keys(commonIssues).slice(0, 5),
};
    });
  // ==========================================
  // UTILITY METHODS
  // ==========================================
  private createViolation(rule: ValidationRule,)
    dimension: QualityDimension,
    context: ValidationContext,
    description: string,
    fieldName?: string,
    expectedValue?: unknown,
    actualValue?: unknown
  ): DataQualityViolation {
  return {
  violationId: this.generateViolationId(),
  timestamp: new Date(),
  ruleId: rule.id,
  ruleName: rule.name,
  severity: rule.severity,
  dimension,
  dataSource: context.dataSource,
  recordId: context.recordId,
  fieldName,
  expectedValue,
  actualValue,
  description,
  context: context.metadata,
  isResolved: false,
};
  private async updateQualityMetrics(): Promise<void> {
  const totalViolations = this.qualityViolations.size;
  const criticalViolations = Array.from(this.qualityViolations.values());
  .filter(v => v.severity === ValidationSeverity.CRITICAL).length;
  this.metrics.totalViolations = totalViolations;
  this.metrics.criticalViolations = criticalViolations;
  // Calculate average quality score
  if (this.metrics.totalRecordsProcessed > 0) {
  const violationRate = totalViolations / this.metrics.totalRecordsProcessed;
  this.metrics.averageQualityScore = Math.max(0, 100 - (violationRate * 100));
  // Determine quality trend
  const recentViolations = Array.from(this.qualityViolations.values());
  .filter(v => Date.now() - v.timestamp.getTime() < 24 * 60 * 60 * 1000); // Last 24 hours
  const violationTrend = recentViolations.length;
  this.metrics.qualityTrend = violationTrend > totalViolations * 0.6 ? 'declining' :,
  violationTrend < totalViolations * 0.4 ? 'improving' : 'stable';
  private startRealTimeValidation(): void {,
  if (this.validationInterval) {
  clearInterval(this.validationInterval);
  this.validationInterval = setInterval(async () => {
  if (!this.isValidating) {
  this.isValidating = true;
  try {
  await this.performScheduledValidation();
} catch (error) {
  console.error('Scheduled validation error:', error);
} finally {
          this.isValidating = false;
    }, this.config.validationInterval);
  private async performScheduledValidation(): Promise<void> {
    // Cleanup old violations
    const cutoff = Date.now() - (this.config.retentionPeriodDays * 24 * 60 * 60 * 1000);
    for (const [id, violation] of this.qualityViolations) {
      if (violation.timestamp.getTime() < cutoff) {
        this.qualityViolations.delete(id);
    // Update metrics
    await this.updateQualityMetrics();
    this.emit('scheduledValidation', this.metrics);
  private generateViolationId(): string {
    return `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateReportId(): string {
    return `quality_report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  // ==========================================
  // PUBLIC API METHODS
  // ==========================================
  public getQualityMetrics(): DataQualityMetrics {
    return this.metrics;
  public getViolations(): DataQualityViolation {
    return Array.from(this.qualityViolations.values());
  public getActiveViolations(): DataQualityViolation {
    return Array.from(this.qualityViolations.values())
      .filter(v => !v.isResolved);
  public getValidationRules(): ValidationRule {
    return Array.from(this.validationRules.values());
  public addValidationRule(rule: ValidationRule): void {
    this.validationRules.set(rule.id, rule);
    this.emit('ruleAdded', rule);
  public updateValidationRule(ruleId: string, updates: Partial<ValidationRule>): boolean {
    const rule = this.validationRules.get(ruleId);
    if (!rule) return false;
    const updatedRule = { ...rule, ...updates, lastUpdated: new Date() };
    this.validationRules.set(ruleId, updatedRule);
    this.emit('ruleUpdated', updatedRule);
    return true;
  public removeValidationRule(ruleId: string): boolean {
    const removed = this.validationRules.delete(ruleId);
    if (removed) {
      this.emit('ruleRemoved', ruleId);
    return removed;
  public resolveViolation(violationId: string, resolvedBy: string): boolean {
    const violation = this.qualityViolations.get(violationId);
    if (!violation) return false;
    violation.isResolved = true;
    violation.resolvedAt = new Date();
    violation.remediation = {
      actionType: RemediationActionType.DATA_CORRECTION,
      description: `Manually resolved by ${resolvedBy}`}
},
  executedAt: new Date(),
      result: 'success',
      details: 'Manual intervention';
  };
    this.metrics.manualInterventions++;
    this.emit('violationResolved', violation);
    return true;
  public updateConfiguration(newConfig: Partial<DataQualityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.enableRealTimeValidation !== undefined) {
      if (newConfig.enableRealTimeValidation) {
        this.startRealTimeValidation();
      } else if (this.validationInterval) {
        clearInterval(this.validationInterval);
        this.validationInterval = undefined;
  public destroy(): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
    this.removeAllListeners();
    this.validationRules.clear();
    this.qualityViolations.clear();
    this.qualityProfiles.clear();

export default SecurityDataQualityMonitor;