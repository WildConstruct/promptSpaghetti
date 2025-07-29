/**
 * Epic 31.4.1 - Security Anomaly Detection and Automated Alerting
 * 
 * Implements advanced anomaly detection algorithms for security analytics
 * infrastructure monitoring and automated alerting capabilities.
 * Integrates with Epic 1 analytics and Epic 17 security systems.
 * 
 * Task: E31-1753313263581-019263
 */
import { EventEmitter } from 'events';
import { SecurityIntelligence, SecurityAnalyticsConfig } from './MLSecurityAnalyticsFramework';

// ==========================================
// TYPES AND INTERFACES
// ==========================================

export interface AnomalyDetectionConfig {
  enableRealTimeDetection: boolean;
  detectionSensitivity: number;
  alertThreshold: number;
  enableAdaptiveThresholds: boolean;
  baselineTrainingPeriod: number;
  anomalyRetentionDays: number;
  enableCorrelationAnalysis: boolean;
  autoResponseEnabled: boolean;
  escalationRules: EscalationRule;
}
export interface SecurityAnomaly {
  id: string;
  timestamp: Date;
  anomalyType: AnomalyType;
  severity: AnomalySeverity;
  confidence: number;
  description: string;
  affectedSystems: string;
  affectedMetrics: string;
  deviationMagnitude: number;
  baselineValue: number;
  observedValue: number;
  statisticalSignificance: number;
  correlatedAnomalies: string;
  riskAssessment: AnomalyRiskAssessment;
  alertsTriggered: SecurityAlert;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
}
export enum AnomalyType {
  METRIC_THRESHOLD_BREACH = 'metric_threshold_breach',
  STATISTICAL_OUTLIER = 'statistical_outlier',
  PATTERN_DEVIATION = 'pattern_deviation',
  CORRELATION_ANOMALY = 'correlation_anomaly',
  TREND_ANOMALY = 'trend_anomaly',
  SEASONALITY_DEVIATION = 'seasonality_deviation',
  VOLUME_SPIKE = 'volume_spike',
  FREQUENCY_ANOMALY = 'frequency_anomaly',
  LATENCY_ANOMALY = 'latency_anomaly',
  ERROR_RATE_SPIKE = 'error_rate_spike',
  CAPACITY_ANOMALY = 'capacity_anomaly',
  BEHAVIORAL_DRIFT = 'behavioral_drift'
  export enum AnomalySeverity {
  INFO = 'info',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
  export interface AnomalyRiskAssessment {
  businessImpact: number; // 0-100,
  securityImpact: number; // 0-100,
  operationalImpact: number; // 0-100,
  complianceRisk: number; // 0-100,
  cascadeRisk: number; // 0-100,
  mitigationUrgency: 'immediate' | 'high' | 'medium' | 'low';
  estimatedDowntime: number; // minutes,
  affectedUserCount: number;
  dataExposureRisk: number; // 0-100,
}
export interface SecurityAlert {
  id: string;
  timestamp: Date;
  alertType: AlertType;
  severity: AnomalySeverity;
  title: string;
  description: string;
  sourceAnomaly: string;
  targetChannels: NotificationChannel;
  escalationLevel: number;
  isEscalated: boolean;
  escalatedAt?: Date;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  suppressUntil?: Date;
  metadata: Record<string, unknown>;
}
export enum AlertType {
  THRESHOLD_BREACH = 'threshold_breach',
  ANOMALY_DETECTED = 'anomaly_detected',
  SYSTEM_FAILURE = 'system_failure',
  SECURITY_INCIDENT = 'security_incident',
  PERFORMANCE_DEGRADATION = 'performance_degradation',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  CAPACITY_WARNING = 'capacity_warning',
  ERROR_SPIKE = 'error_spike',
  AVAILABILITY_ALERT = 'availability_alert',
  CORRELATION_ALERT = 'correlation_alert'
  export interface NotificationChannel {
  channelType: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
  target: string;
  enabled: boolean;
  severity: AnomalySeverity;
  rateLimiting: RateLimitConfig;
  template?: string;
}
export interface RateLimitConfig {
  maxAlertsPerHour: number;
  maxAlertsPerDay: number;
  burstLimit: number;
  cooldownPeriod: number; // minutes,
}
export interface EscalationRule {
  id: string;
  name: string;
  conditions: EscalationCondition;
  timeoutMinutes: number;
  targetChannels: NotificationChannel;
  autoEscalate: boolean;
  maxEscalationLevel: number;
}
export interface EscalationCondition {
  field: 'severity' | 'anomalyType' | 'businessImpact' | 'affectedSystems';
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: unknown;
}
export interface MetricBaseline {
  metricName: string;
  systemName: string;
  mean: number;
  standardDeviation: number;
  median: number;
  percentile95: number;
  percentile99: number;
  minValue: number;
  maxValue: number;
  dataPoints: number;
  lastUpdated: Date;
  seasonalPatterns: SeasonalPattern;
  trendCoefficient: number;
}
export interface SeasonalPattern {
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  pattern: number;
  strength: number;
  phase: number;
}
export interface AnomalyDetectionModel {
  modelId: string;
  modelType: DetectionModelType;
  name: string;
  description: string;
  targetMetrics: string;
  sensitivity: number;
  isActive: boolean;
  accuracy: number;
  falsePositiveRate: number;
  lastTrained: Date;
  trainingDataSize: number;
  parameters: Record<string, unknown>;
}
export enum DetectionModelType {
  STATISTICAL_THRESHOLD = 'statistical_threshold',
  Z_SCORE = 'z_score',
  ISOLATION_FOREST = 'isolation_forest',
  LOCAL_OUTLIER_FACTOR = 'local_outlier_factor',
  ONE_CLASS_SVM = 'one_class_svm',
  AUTOENCODER = 'autoencoder',
  LSTM_AUTOENCODER = 'lstm_autoencoder',
  CHANGEPOINT_DETECTION = 'changepoint_detection'
  export interface SecurityMetric {
  id: string;
  timestamp: Date;
  systemName: string;
  metricName: string;
  value: number;
  unit: string;
  tags: Record<string, string>;
  metadata: Record<string, unknown>;
  // ==========================================
  // MAIN ANOMALY DETECTOR CLASS
  // ==========================================
}
export class SecurityAnomalyDetector extends EventEmitter {
  private config: AnomalyDetectionConfig;
  private detectedAnomalies: Map<string, SecurityAnomaly> = new Map();
  private activeAlerts: Map<string, SecurityAlert> = new Map();
  private metricBaselines: Map<string, MetricBaseline> = new Map();
  private detectionModels: Map<string, AnomalyDetectionModel> = new Map();
  private metricHistory: Map<string, SecurityMetric> = new Map();
  private isProcessing = false;
  private processingInterval?: NodeJS.Timeout;
  constructor(config: Partial<AnomalyDetectionConfig> = {}) {
  super();
  this.config = {
  enableRealTimeDetection: true,
  detectionSensitivity: 0.75,
  alertThreshold: 0.8,
  enableAdaptiveThresholds: true,
  baselineTrainingPeriod: 604800000, // 7 days,
  anomalyRetentionDays: 30,
  enableCorrelationAnalysis: true,
  autoResponseEnabled: false,
  escalationRules: [],
  ...config
};
    this.initializeDefaultModels();
    if (this.config.enableRealTimeDetection) {
  this.startRealTimeProcessing();
  // ==========================================
  // METRIC PROCESSING
  // ==========================================
  /**
  * Process incoming security metric for anomaly detection
  */
  public async processMetric(metric: SecurityMetric): Promise<void> {,
  try {
  // Store metric in history
  this.storeMetric(metric);
  // Update baseline if needed
  await this.updateBaseline(metric);
  // Detect anomalies in real-time
  if (this.config.enableRealTimeDetection) {
  await this.detectAnomaliesForMetric(metric);
  this.emit('metricProcessed', metric);
} catch (error) {
      console.error('Error processing security metric:', error);
      this.emit('error', { error, metric });
  /**
   * Detect anomalies for a specific metric
   */
  private async detectAnomaliesForMetric(metric: SecurityMetric): Promise<void> {
    const anomalies: SecurityAnomaly = [];
    // Run all active detection models
    for (const model of this.detectionModels.values()) {
      if (!model.isActive || !model.targetMetrics.includes(metric.metricName)) {
        continue;
      const modelAnomalies = await this.runDetectionModel(model, metric);
      anomalies.push(...modelAnomalies);
    // Process detected anomalies
    for (const anomaly of anomalies) {
      await this.handleAnomaly(anomaly);
  /**
   * Run specific detection model on metric
   */
  private async runDetectionModel(()
    model: AnomalyDetectionModel,
    metric: SecurityMetric,
  ): Promise<SecurityAnomaly> {
    const anomalies: SecurityAnomaly = [];
    const metricKey = `${metric.systemName}:${metric.metricName}`;}
    const baseline = this.metricBaselines.get(metricKey);
    if (!baseline) {
      return anomalies; // Need baseline before detecting anomalies
    let isAnomalous = false;
    let deviationMagnitude = 0;
    let confidence = 0;
    switch (model.modelType) {
      case DetectionModelType.STATISTICAL_THRESHOLD:
        ({ isAnomalous, deviationMagnitude, confidence } = )
          this.detectStatisticalThresholdAnomaly(metric, baseline, model));
        break;
      case DetectionModelType.Z_SCORE:
        ({ isAnomalous, deviationMagnitude, confidence } = )
          this.detectZScoreAnomaly(metric, baseline, model));
        break;
      case DetectionModelType.CHANGEPOINT_DETECTION:
        ({ isAnomalous, deviationMagnitude, confidence } = )
          await this.detectChangepointAnomaly(metric, baseline, model));
        break;
      default:
        console.warn(`Unsupported detection model: ${model.modelType}`);}
        return anomalies;
    if (isAnomalous && confidence >= this.config.detectionSensitivity) {
      const anomaly = this.createAnomaly(;);
        metric,
        baseline,
        model,
        deviationMagnitude,
        confidence
      );
      anomalies.push(anomaly);
    return anomalies;
  // ==========================================
  // DETECTION ALGORITHMS
  // ==========================================
  private detectStatisticalThresholdAnomaly(metric: SecurityMetric)
    baseline: MetricBaseline,
    model: AnomalyDetectionModel): { isAnomalous: boolean; deviationMagnitude: number; confidence: number } {
    const threshold = baseline.standardDeviation * (model.sensitivity || 2);
    const upperBound = baseline.mean + threshold;
    const lowerBound = baseline.mean - threshold;
    const isAnomalous = metric.value > upperBound || metric.value < lowerBound;
    const deviationMagnitude = Math.abs(metric.value - baseline.mean) / baseline.standardDeviation;
    const confidence = Math.min(0.99, deviationMagnitude / 3); // Cap at 99%;
    return { isAnomalous, deviationMagnitude, confidence };
  private detectZScoreAnomaly(metric: SecurityMetric)
    baseline: MetricBaseline,
    model: AnomalyDetectionModel): { isAnomalous: boolean; deviationMagnitude: number; confidence: number } {
    const zScore = Math.abs((metric.value - baseline.mean) / baseline.standardDeviation);
    const threshold = model.sensitivity || 2.5;
    const isAnomalous = zScore > threshold;
    const deviationMagnitude = zScore;
    const confidence = Math.min(0.99, zScore / 4); // Normalize to 0-1 range;
    return { isAnomalous, deviationMagnitude, confidence };
  private async detectChangepointAnomaly(metric: SecurityMetric)
    baseline: MetricBaseline,
    model: AnomalyDetectionModel): Promise<{ isAnomalous: boolean; deviationMagnitude: number; confidence: number }> {
    const metricKey = `${metric.systemName}:${metric.metricName}`;}
    const recentValues = this.getRecentMetricValues(metricKey, 50);
    if (recentValues.length < 20) {
      return { isAnomalous: false, deviationMagnitude: 0, confidence: 0 };
    // Simple changepoint detection using moving averages
    const windowSize = 10;
    const recentMean = this.calculateMean(recentValues.slice(-windowSize));
    const previousMean = this.calculateMean(recentValues.slice(-windowSize * 2, -windowSize));
    const changeMagnitude = Math.abs(recentMean - previousMean);
    const changeRatio = changeMagnitude / baseline.standardDeviation;
    const isAnomalous = changeRatio > (model.sensitivity || 1.5);
    const confidence = Math.min(0.95, changeRatio / 3);
    return { isAnomalous, deviationMagnitude: changeRatio, confidence };
  // ==========================================
  // ANOMALY HANDLING
  // ==========================================
  private async handleAnomaly(anomaly: SecurityAnomaly): Promise<void> {
    // Store anomaly
    this.detectedAnomalies.set(anomaly.id, anomaly);
    // Perform correlation analysis if enabled
    if (this.config.enableCorrelationAnalysis) {
      await this.performCorrelationAnalysis(anomaly);
    // Generate alerts if threshold met
    if (anomaly.confidence >= this.config.alertThreshold) {
      await this.generateAlert(anomaly);
    // Emit anomaly event
    this.emit('anomalyDetected', anomaly);
    console.log()
      `🔍 SECURITY ANOMALY: ${anomaly.anomalyType} in ${anomaly.affectedSystems.join()}
        ',
        '
      )} (confidence: ${anomaly.confidence})`);}
  private async performCorrelationAnalysis(anomaly: SecurityAnomaly): Promise<void> {
  const correlatedAnomalies: string = [];
  const timeWindow = 5 * 60 * 1000; // 5 minutes;
  // Find other anomalies in the same time window
  for (const [id, otherAnomaly] of this.detectedAnomalies) {
  if (id === anomaly.id || otherAnomaly.isResolved) continue;
  const timeDiff = Math.abs(anomaly.timestamp.getTime() - otherAnomaly.timestamp.getTime());
  if (timeDiff <= timeWindow) {
  // Check for system overlap
  const systemOverlap = anomaly.affectedSystems.some(system =>;);
  otherAnomaly.affectedSystems.includes(system)
  );
  if (systemOverlap || this.calculateCorrelationScore(anomaly, otherAnomaly) > 0.7) {
  correlatedAnomalies.push(id);
  anomaly.correlatedAnomalies = correlatedAnomalies;
  // Escalate severity if highly correlated
  if (correlatedAnomalies.length >= 3) {
  anomaly.severity = this.escalateSeverity(anomaly.severity);
  anomaly.riskAssessment.cascadeRisk = Math.min(100, correlatedAnomalies.length * 20);
  private calculateCorrelationScore(anomaly1: SecurityAnomaly, anomaly2: SecurityAnomaly): number {,
  let score = 0;
  // Similar anomaly types
  if (anomaly1.anomalyType === anomaly2.anomalyType) score += 0.4;
  // Similar metrics
  const metricOverlap = anomaly1.affectedMetrics.filter(metric =>;);
  anomaly2.affectedMetrics.includes(metric)
  ).length;
  score += (metricOverlap / Math.max(anomaly1.affectedMetrics.length, 1)) * 0.3;
  // Similar severity
  const severityOrder = ['info', 'low', 'medium', 'high', 'critical'];
  const severityDiff = Math.abs(;);
  severityOrder.indexOf(anomaly1.severity) - severityOrder.indexOf(anomaly2.severity)
  );
  score += (1 - severityDiff / 4) * 0.3;
  return Math.min(1, score);
  // ==========================================
  // ALERTING SYSTEM
  // ==========================================
  private async generateAlert(anomaly: SecurityAnomaly): Promise<void> {,
  const alert: SecurityAlert = {,
  id: this.generateAlertId(),
  timestamp: new Date(),
  alertType: this.mapAnomalyToAlertType(anomaly.anomalyType),
  severity: anomaly.severity,
  title: this.generateAlertTitle(anomaly),
  description: this.generateAlertDescription(anomaly),
  sourceAnomaly: anomaly.id,
  targetChannels: this.getTargetChannels(anomaly.severity),
  escalationLevel: 0,
  isEscalated: false,
  metadata: {
  confidence: anomaly.confidence,
  deviationMagnitude: anomaly.deviationMagnitude,
  affectedSystems: anomaly.affectedSystems,
  correlatedAnomalies: anomaly.correlatedAnomalies,
};
    // Store alert
    this.activeAlerts.set(alert.id, alert);
    anomaly.alertsTriggered.push(alert);
    // Send notifications
    await this.sendNotifications(alert);
    // Schedule escalation if configured
    this.scheduleEscalation(alert);
    this.emit('alertGenerated', alert);
  private async sendNotifications(alert: SecurityAlert): Promise<void> {
    for (const channel of alert.targetChannels) {
      if (!channel.enabled || !channel.severity.includes(alert.severity)) {
        continue;
      // Check rate limiting
      if (await this.isRateLimited(channel, alert)) {
        console.log(`Rate limiting alert to ${channel.channelType}:${channel.target}`);}
        continue;
      try {
        await this.sendNotification(channel, alert);
        this.emit('notificationSent', { channel, alert });
      } catch (error) {
        console.error(`Failed to send notification to ${channel.channelType}:${channel.target}:`, error);}
        this.emit('notificationFailed', { channel, alert, error });
  private async sendNotification(channel: NotificationChannel, alert: SecurityAlert): Promise<void> {
    // Integration points with Epic 17 notification system
    switch (channel.channelType) {
      case 'email':
        console.log(`📧 EMAIL ALERT: ${alert.title} → ${channel.target}`);}
        break;
      case 'slack':
        console.log(`💬 SLACK ALERT: ${alert.title} → ${channel.target}`);}
        break;
      case 'webhook':
        console.log(`🔗 WEBHOOK ALERT: ${alert.title} → ${channel.target}`);}
        break;
      case 'sms':
        console.log(`📱 SMS ALERT: ${alert.title} → ${channel.target}`);}
        break;
      case 'pagerduty':
        console.log(`📟 PAGERDUTY ALERT: ${alert.title} → ${channel.target}`);}
        break;
  private scheduleEscalation(alert: SecurityAlert): void {
    const applicableRules = this.config.escalationRules.filter(rule =>;);
      this.evaluateEscalationConditions(rule.conditions, alert)
    );
    for (const rule of applicableRules) {
      if (rule.autoEscalate) {
        setTimeout(async () => {
          await this.escalateAlert(alert.id, rule);
        }, rule.timeoutMinutes * 60 * 1000);
  private async escalateAlert(alertId: string, rule: EscalationRule): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert || alert.isEscalated || alert.resolvedAt) return;
    alert.isEscalated = true;
    alert.escalatedAt = new Date();
    alert.escalationLevel += 1;
    // Send escalation notifications
    for (const channel of rule.targetChannels) {
      try {
        await this.sendNotification(channel, {)
  ...alert,
          title: `[ESCALATED] ${alert.title}`}
},
  description: `ESCALATED ALERT: ${alert.description}`}
        });
      } catch (error) {
        console.error('Escalation notification failed:', error);
    this.emit('alertEscalated', { alert, rule });
  // ==========================================
  // BASELINE MANAGEMENT
  // ==========================================
  private async updateBaseline(metric: SecurityMetric): Promise<void> {
    const metricKey = `${metric.systemName}:${metric.metricName}`;}
    let baseline = this.metricBaselines.get(metricKey);
    if (!baseline) {
  baseline = this.createNewBaseline(metric);
  this.metricBaselines.set(metricKey, baseline);
  // Update baseline with new metric
  const recentValues = this.getRecentMetricValues(metricKey, 1000);
  if (recentValues.length >= 30) { // Minimum data points for meaningful baseline
  baseline.mean = this.calculateMean(recentValues);
  baseline.standardDeviation = this.calculateStandardDeviation(recentValues, baseline.mean);
  baseline.median = this.calculateMedian(recentValues);
  baseline.percentile95 = this.calculatePercentile(recentValues, 95);
  baseline.percentile99 = this.calculatePercentile(recentValues, 99);
  baseline.minValue = Math.min(...recentValues);
  baseline.maxValue = Math.max(...recentValues);
  baseline.dataPoints = recentValues.length;
  baseline.lastUpdated = new Date();
  // Update seasonal patterns if adaptive thresholds enabled
  if (this.config.enableAdaptiveThresholds) {
  this.updateSeasonalPatterns(baseline, recentValues);
  private createNewBaseline(metric: SecurityMetric): MetricBaseline {,
  return {
  metricName: metric.metricName,
  systemName: metric.systemName,
  mean: metric.value,
  standardDeviation: 0,
  median: metric.value,
  percentile95: metric.value,
  percentile99: metric.value,
  minValue: metric.value,
  maxValue: metric.value,
  dataPoints: 1,
  lastUpdated: new Date(),
  seasonalPatterns: [],
  trendCoefficient: 0,
};
  private updateSeasonalPatterns(baseline: MetricBaseline, values: number): void {
  // Simplified seasonal pattern detection
  // In a real implementation, this would use more sophisticated time series analysis
  if (values.length >= 168) { // 1 week of hourly data
  const hourlyPattern = this.calculateHourlyPattern(values);
  baseline.seasonalPatterns = [{
  period: 'hourly',
  pattern: hourlyPattern,
  strength: this.calculatePatternStrength(hourlyPattern),
  phase: 0,
}];
  // ==========================================
  // UTILITY METHODS
  // ==========================================
  private storeMetric(metric: SecurityMetric): void {
    const metricKey = `${metric.systemName}:${metric.metricName}`;}
    if (!this.metricHistory.has(metricKey)) {
  this.metricHistory.set(metricKey, []);
  const history = this.metricHistory.get(metricKey)!;
  history.push(metric);
  // Keep only recent data to prevent memory issues
  const maxHistory = 10000;
  if (history.length > maxHistory) {
  history.splice(0, history.length - maxHistory);
  private getRecentMetricValues(metricKey: string, count: number): number {,
  const history = this.metricHistory.get(metricKey) || [];
  return history.slice(-count).map(m => m.value);
  private calculateMean(values: number): number {,
  return values.reduce((sum, val) => sum + val, 0) / values.length;
  private calculateStandardDeviation(values: number, mean: number): number {,
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
  private calculateMedian(values: number): number {,
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
  ? (sorted[mid - 1] + sorted[mid]) / 2
  : sorted[mid];
  private calculatePercentile(values: number, percentile: number): number {,
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
  private calculateHourlyPattern(values: number): number {,
  const pattern = new Array(24).fill(0);
  const counts = new Array(24).fill(0);
  values.forEach((value, index) => {
  const hour = index % 24;
  pattern[hour] += value;
  counts[hour]++;
});
    return pattern.map((sum, i) => counts[i] > 0 ? sum / counts[i] : 0);
  private calculatePatternStrength(pattern: number): number {
    const mean = this.calculateMean(pattern);
    const variance = this.calculateStandardDeviation(pattern, mean);
    return variance / Math.max(mean, 1); // Coefficient of variation
  private createAnomaly(metric: SecurityMetric)
    baseline: MetricBaseline,
    model: AnomalyDetectionModel,
    deviationMagnitude: number,
    confidence: number): SecurityAnomaly {,
    const severity = this.calculateAnomalySeverity(deviationMagnitude, confidence);
    const riskAssessment = this.assessAnomalyRisk(metric, severity, deviationMagnitude);
    return {
      id: this.generateAnomalyId(),
      timestamp: new Date(),
      anomalyType: this.mapModelToAnomalyType(model.modelType),
      severity,
      confidence,
      description: `${model.name} detected anomaly in ${metric.metricName} for ${metric.systemName}`}
},
  affectedSystems: [metric.systemName],
      affectedMetrics: [metric.metricName],
      deviationMagnitude,
      baselineValue: baseline.mean,
      observedValue: metric.value,
      statisticalSignificance: confidence,
      correlatedAnomalies: [],
      riskAssessment,
      alertsTriggered: [],
      isResolved: false;
  };
  private calculateAnomalySeverity(deviationMagnitude: number, confidence: number): AnomalySeverity {
  const score = deviationMagnitude * confidence;
  if (score >= 4) return AnomalySeverity.CRITICAL;
  if (score >= 3) return AnomalySeverity.HIGH;
  if (score >= 2) return AnomalySeverity.MEDIUM;
  if (score >= 1) return AnomalySeverity.LOW;
  return AnomalySeverity.INFO;
  private assessAnomalyRisk(metric: SecurityMetric)
  severity: AnomalySeverity,
  deviationMagnitude: number): AnomalyRiskAssessment {,
  const severityMultiplier = {
  [AnomalySeverity.INFO]: 0.1,
  [AnomalySeverity.LOW]: 0.3,
  [AnomalySeverity.MEDIUM]: 0.5,
  [AnomalySeverity.HIGH]: 0.8,
  [AnomalySeverity.CRITICAL]: 1.0,
};
    const baseRisk = severityMultiplier[severity] * 100;
    return {
  businessImpact: Math.min(100, baseRisk * 0.8),
  securityImpact: Math.min(100, baseRisk),
  operationalImpact: Math.min(100, baseRisk * 0.9),
  complianceRisk: Math.min(100, baseRisk * 0.6),
  cascadeRisk: Math.min(100, deviationMagnitude * 15),
  mitigationUrgency: severity === AnomalySeverity.CRITICAL ? 'immediate' :,
  severity === AnomalySeverity.HIGH ? 'high' :,
  severity === AnomalySeverity.MEDIUM ? 'medium' : 'low',
  estimatedDowntime: Math.min(240, baseRisk * 2.4), // minutes,
  affectedUserCount: Math.min(10000, baseRisk * 50),
  dataExposureRisk: Math.min(100, baseRisk * 0.7),
};
  private mapModelToAnomalyType(modelType: DetectionModelType): AnomalyType {
  const mapping: Record<DetectionModelType, AnomalyType> = {,
  [DetectionModelType.STATISTICAL_THRESHOLD]: AnomalyType.METRIC_THRESHOLD_BREACH,
  [DetectionModelType.Z_SCORE]: AnomalyType.STATISTICAL_OUTLIER,
  [DetectionModelType.ISOLATION_FOREST]: AnomalyType.STATISTICAL_OUTLIER,
  [DetectionModelType.LOCAL_OUTLIER_FACTOR]: AnomalyType.STATISTICAL_OUTLIER,
  [DetectionModelType.ONE_CLASS_SVM]: AnomalyType.PATTERN_DEVIATION,
  [DetectionModelType.AUTOENCODER]: AnomalyType.PATTERN_DEVIATION,
  [DetectionModelType.LSTM_AUTOENCODER]: AnomalyType.TREND_ANOMALY,
  [DetectionModelType.CHANGEPOINT_DETECTION]: AnomalyType.TREND_ANOMALY,
};
    return mapping[modelType] || AnomalyType.STATISTICAL_OUTLIER;
  private mapAnomalyToAlertType(anomalyType: AnomalyType): AlertType {
  const mapping: Record<AnomalyType, AlertType> = {,
  [AnomalyType.METRIC_THRESHOLD_BREACH]: AlertType.THRESHOLD_BREACH,
  [AnomalyType.STATISTICAL_OUTLIER]: AlertType.ANOMALY_DETECTED,
  [AnomalyType.PATTERN_DEVIATION]: AlertType.ANOMALY_DETECTED,
  [AnomalyType.CORRELATION_ANOMALY]: AlertType.CORRELATION_ALERT,
  [AnomalyType.TREND_ANOMALY]: AlertType.ANOMALY_DETECTED,
  [AnomalyType.SEASONALITY_DEVIATION]: AlertType.ANOMALY_DETECTED,
  [AnomalyType.VOLUME_SPIKE]: AlertType.ANOMALY_DETECTED,
  [AnomalyType.FREQUENCY_ANOMALY]: AlertType.ANOMALY_DETECTED,
  [AnomalyType.LATENCY_ANOMALY]: AlertType.PERFORMANCE_DEGRADATION,
  [AnomalyType.ERROR_RATE_SPIKE]: AlertType.ERROR_SPIKE,
  [AnomalyType.CAPACITY_ANOMALY]: AlertType.CAPACITY_WARNING,
  [AnomalyType.BEHAVIORAL_DRIFT]: AlertType.ANOMALY_DETECTED,
};
    return mapping[anomalyType] || AlertType.ANOMALY_DETECTED;
  private escalateSeverity(severity: AnomalySeverity): AnomalySeverity {
  const escalation: Record<AnomalySeverity, AnomalySeverity> = {,
  [AnomalySeverity.INFO]: AnomalySeverity.LOW,
  [AnomalySeverity.LOW]: AnomalySeverity.MEDIUM,
  [AnomalySeverity.MEDIUM]: AnomalySeverity.HIGH,
  [AnomalySeverity.HIGH]: AnomalySeverity.CRITICAL,
  [AnomalySeverity.CRITICAL]: AnomalySeverity.CRITICAL,
};
    return escalation[severity];
  private generateAlertTitle(anomaly: SecurityAnomaly): string {
    return `Security Anomaly: ${anomaly.anomalyType.replace()}
      /_/g,
      ' '
    ).toUpperCase()} in ${anomaly.affectedSystems.join(', ')}`;}
  private generateAlertDescription(anomaly: SecurityAnomaly): string {
    return `Detected ${anomaly.anomalyType} with ${(anomaly.confidence * 100).toFixed(1)}% confidence. ` +}
           `Observed value: ${anomaly.observedValue}, Baseline: ${anomaly.baselineValue}. ` +}
           `Deviation magnitude: ${anomaly.deviationMagnitude.toFixed(2)}σ`;}
  private getTargetChannels(severity: AnomalySeverity): NotificationChannel {
  // Default notification channels - would be configurable
  const channels: NotificationChannel = [
  {
  channelType: 'email',
  target: 'security-alerts@company.com',
  enabled: true,
  severity: [AnomalySeverity.MEDIUM, AnomalySeverity.HIGH, AnomalySeverity.CRITICAL],
  rateLimiting: {
  maxAlertsPerHour: 10,
  maxAlertsPerDay: 50,
  burstLimit: 3,
  cooldownPeriod: 5];
  return channels.filter(channel => channel.severity.includes(severity));
  private async isRateLimited(channel: NotificationChannel, alert: SecurityAlert): Promise<boolean> {,
  // Simplified rate limiting - in production would use Redis or similar
  return false; // Always allow for now
  private evaluateEscalationConditions(conditions: EscalationCondition, alert: SecurityAlert): boolean {,
  return conditions.every(condition => {)
  switch (condition.field) {
  case 'severity':,
  return condition.operator === 'equals' ? alert.severity === condition.value :,
  condition.operator === 'greater_than' ? this.getSeverityLevel(alert.severity) > this.getSeverityLevel(condition.value as AnomalySeverity) :,
  false;
  default:,
  return false;
});
  private getSeverityLevel(severity: AnomalySeverity): number {
  const levels = {
  [AnomalySeverity.INFO]: 0,
  [AnomalySeverity.LOW]: 1,
  [AnomalySeverity.MEDIUM]: 2,
  [AnomalySeverity.HIGH]: 3,
  [AnomalySeverity.CRITICAL]: 4,
};
    return levels[severity] || 0;
  private generateAnomalyId(): string {
    return `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private initializeDefaultModels(): void {
    const defaultModels: AnomalyDetectionModel = [
      {
        modelId: 'statistical-threshold-v1',
        modelType: DetectionModelType.STATISTICAL_THRESHOLD,
        name: 'Statistical Threshold Detector',
        description: 'Detects anomalies using statistical thresholds',
        targetMetrics: ['*'], // All metrics
        sensitivity: 2.0,
        isActive: true,
        accuracy: 0.82,
        falsePositiveRate: 0.05,
        lastTrained: new Date(),
        trainingDataSize: 0,
        parameters: { threshold_multiplier: 2.0 }
  }
      {
        modelId: 'z-score-v1',
        modelType: DetectionModelType.Z_SCORE,
        name: 'Z-Score Detector',
        description: 'Detects anomalies using z-score analysis',
        targetMetrics: ['response_time', 'error_rate', 'throughput'],
        sensitivity: 2.5,
        isActive: true,
        accuracy: 0.78,
        falsePositiveRate: 0.08,
        lastTrained: new Date(),
        trainingDataSize: 0,
        parameters: { z_threshold: 2.5 }
    ];
    defaultModels.forEach(model => this.detectionModels.set(model.modelId, model));
  private startRealTimeProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    this.processingInterval = setInterval(async () => {
      if (!this.isProcessing) {
        this.isProcessing = true;
        try {
          await this.performBatchProcessing();
        } catch (error) {
  console.error('Batch processing error:', error);
} finally {
          this.isProcessing = false;
    }, 60000); // Process every minute
  private async performBatchProcessing(): Promise<void> {
    // Clean up old anomalies
    this.cleanupOldAnomalies();
    // Update baselines for all metrics
    for (const [metricKey, baseline] of this.metricBaselines) {
      if (this.config.enableAdaptiveThresholds) {
        const recentValues = this.getRecentMetricValues(metricKey, 100);
        if (recentValues.length >= 50) {
          baseline.mean = this.calculateMean(recentValues);
          baseline.standardDeviation = this.calculateStandardDeviation(recentValues, baseline.mean);
          baseline.lastUpdated = new Date();
  private cleanupOldAnomalies(): void {
    const cutoff = Date.now() - (this.config.anomalyRetentionDays * 24 * 60 * 60 * 1000);
    for (const [id, anomaly] of this.detectedAnomalies) {
      if (anomaly.timestamp.getTime() < cutoff) {
        this.detectedAnomalies.delete(id);
    for (const [id, alert] of this.activeAlerts) {
      if (alert.timestamp.getTime() < cutoff && alert.resolvedAt) {
        this.activeAlerts.delete(id);
  // ==========================================
  // PUBLIC API METHODS
  // ==========================================
  public getDetectedAnomalies(): SecurityAnomaly {
    return Array.from(this.detectedAnomalies.values());
  public getActiveAnomalies(): SecurityAnomaly {
    return Array.from(this.detectedAnomalies.values())
      .filter(anomaly => !anomaly.isResolved);
  public getActiveAlerts(): SecurityAlert {
    return Array.from(this.activeAlerts.values())
      .filter(alert => !alert.resolvedAt);
  public getMetricBaselines(): MetricBaseline {
    return Array.from(this.metricBaselines.values());
  public getDetectionModels(): AnomalyDetectionModel {
    return Array.from(this.detectionModels.values());
  public resolveAnomaly(anomalyId: string, resolvedBy: string, notes?: string): boolean {
    const anomaly = this.detectedAnomalies.get(anomalyId);
    if (!anomaly) return false;
    anomaly.isResolved = true;
    anomaly.resolvedAt = new Date();
    anomaly.resolvedBy = resolvedBy;
    anomaly.resolutionNotes = notes;
    // Resolve associated alerts
    for (const alert of anomaly.alertsTriggered) {
      const activeAlert = this.activeAlerts.get(alert.id);
      if (activeAlert) {
        activeAlert.resolvedAt = new Date();
        activeAlert.resolvedBy = resolvedBy;
    this.emit('anomalyResolved', anomaly);
    return true;
  public acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return false;
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = acknowledgedBy;
    this.emit('alertAcknowledged', alert);
    return true;
  public updateConfiguration(newConfig: Partial<AnomalyDetectionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.enableRealTimeDetection !== undefined) {
      if (newConfig.enableRealTimeDetection) {
        this.startRealTimeProcessing();
      } else if (this.processingInterval) {
        clearInterval(this.processingInterval);
        this.processingInterval = undefined;
  public addDetectionModel(model: AnomalyDetectionModel): void {
    this.detectionModels.set(model.modelId, model);
    this.emit('modelAdded', model);
  public removeDetectionModel(modelId: string): boolean {
    const removed = this.detectionModels.delete(modelId);
    if (removed) {
      this.emit('modelRemoved', modelId);
    return removed;
  public destroy(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    this.removeAllListeners();
    this.detectedAnomalies.clear();
    this.activeAlerts.clear();
    this.metricBaselines.clear();
    this.detectionModels.clear();
    this.metricHistory.clear();

export default SecurityAnomalyDetector;