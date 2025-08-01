/**
 * Intelligent Throttling Manager Based on Usage Analytics
 * Epic 31 - Task E31-1753313263544-7B0466
 * 
 * Advanced intelligent throttling system that leverages usage analytics to
 * dynamically adjust rate limits, implement adaptive throttling strategies,
 * and optimize system performance based on real-time usage patterns.
 */

import { EventEmitter } from 'events';
import { RateLimiter, RateLimitStrategy, RateLimitResult } from '../../packages/core/security/RateLimiter';
import { PerformanceMonitoringService, SystemMetrics } from '../analytics/PerformanceMonitoringService';
import { PredictiveAPILoadManager, LoadPrediction } from './PredictiveAPILoadManager';
import { MetricsCollector } from '../performance/MetricsCollector';

// ============================================================================
// Core Interfaces and Types
// ============================================================================



export interface IntelligentThrottlingConfig {
  // Analytics-based throttling configuration
  analytics_integration: {
    enabled: boolean;
    usage_analysis_window_minutes: number;
    pattern_detection_sensitivity: number;
    adaptive_learning_rate: number;
    real_time_adjustment_enabled: boolean;



  };
  
  // Intelligent throttling strategies
  throttling_strategies: {
    usage_based_throttling: {
      enabled: boolean;
      usage_threshold_percentile: number;
      throttle_reduction_factor: number;
      recovery_multiplier: number;
    };
    predictive_throttling: {
      enabled: boolean;
      prediction_confidence_threshold: number;
      preemptive_throttling_enabled: boolean;
      load_spike_protection: boolean;
    };
    adaptive_throttling: {
      enabled: boolean;
      adaptation_interval_seconds: number;
      performance_target_response_time_ms: number;
      error_rate_threshold: number;
    };
    user_behavior_throttling: {
      enabled: boolean;
      behavior_profiling_enabled: boolean;
      suspicious_activity_detection: boolean;
      progressive_throttling: boolean;
    };
  };
  
  // Dynamic rate limit management
  dynamic_rate_limits: {
    base_rate_limits: {
      requests_per_minute: number;
      burst_capacity: number;
      concurrent_requests: number;
    };
    adjustment_parameters: {
      max_increase_factor: number;
      max_decrease_factor: number;
      adjustment_granularity: number;
      cooldown_period_seconds: number;
    };
    user_tier_multipliers: {
      free_tier: number;
      premium_tier: number;
      enterprise_tier: number;
    };
  };
  
  // Usage pattern analysis
  usage_pattern_analysis: {
    enabled: boolean;
    pattern_recognition_algorithms: ('statistical' | 'machine_learning' | 'time_series' | 'anomaly_detection')[];
    historical_data_window_hours: number;
    pattern_significance_threshold: number;
    seasonal_adjustment_enabled: boolean;
  };
  
  // Throttling enforcement
  throttling_enforcement: {
    enforcement_mode: 'strict' | 'gradual' | 'adaptive';
    grace_period_seconds: number;
    progressive_penalties: boolean;
    whitelist_bypass_enabled: boolean;
    emergency_override_enabled: boolean;
  };
  
  // Monitoring and alerting
  monitoring: {
    real_time_metrics_enabled: boolean;
    throttling_effectiveness_tracking: boolean;
    user_impact_monitoring: boolean;
    alert_thresholds: {
      excessive_throttling_threshold: number;
      system_overload_threshold: number;
      user_satisfaction_threshold: number;
    };
    notification_channels: string[];
  };




export interface UsageAnalytics {
  user_id: string;
  analysis_period: {
    start_time: number;
    end_time: number;
    duration_minutes: number;



  };
  usage_patterns: {
    request_rate: {
      average_per_minute: number;
      peak_per_minute: number;
      standard_deviation: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    };
    temporal_patterns: {
      peak_hours: number[];
      low_activity_hours: number[];
      weekly_pattern: Record<string, number>;
      seasonal_adjustments: number;
    };
    endpoint_usage: {
      endpoint: string;
      request_count: number;
      average_response_time: number;
      error_rate: number;
[];
    resource_consumption: {
      cpu_usage: number;
      memory_usage: number;
      bandwidth_usage: number;
      storage_usage: number;
    };
  };
  behavior_indicators: {
    abuse_likelihood: number;
    automation_probability: number;
    usage_legitimacy_score: number;
    anomaly_detection_flags: string[];
  };
  throttling_history: {
    throttled_requests: number;
    throttling_duration_seconds: number;
    throttling_effectiveness: number;
    user_satisfaction_impact: number;
  };




export interface ThrottlingDecision {
  decision_id: string;
  timestamp: number;
  user_id: string;
  endpoint: string;
  decision_type: 'allow' | 'throttle' | 'block';
  throttling_strategy: string;
  rate_limit_applied: {
    requests_per_minute: number;
    burst_capacity: number;
    current_usage: number;



  };
  decision_rationale: {
    primary_factor: string;
    contributing_factors: string[];
    confidence_score: number;
    usage_analytics_weight: number;
    predictive_analytics_weight: number;
  };
  impact_assessment: {
    performance_impact: number;
    user_experience_impact: number;
    system_resource_savings: number;
    business_impact: number;
  };
  enforcement_details: {
    throttle_duration_seconds: number;
    retry_after_seconds: number;
    progressive_penalty_applied: boolean;
    bypass_conditions: string[];
  };




export interface ThrottlingEffectivenessMetrics {
  measurement_period: {
    start_time: number;
    end_time: number;
    duration_hours: number;



  };
  throttling_statistics: {
    total_requests_processed: number;
    requests_throttled: number;
    requests_blocked: number;
    throttling_rate: number;
    false_positive_rate: number;
  };
  performance_impact: {
    system_load_reduction: number;
    response_time_improvement: number;
    error_rate_reduction: number;
    resource_utilization_optimization: number;
  };
  user_impact_analysis: {
    affected_users_count: number;
    average_throttling_duration: number;
    user_satisfaction_score: number;
    retention_impact: number;
  };
  business_metrics: {
    cost_savings: number;
    uptime_improvement: number;
    capacity_optimization: number;
    revenue_protection: number;
  };


// ============================================================================
// Usage Analytics Engine
// ============================================================================

export class UsageAnalyticsEngine extends EventEmitter {
  private config: IntelligentThrottlingConfig;
  private userAnalytics: Map<string, UsageAnalytics> = new Map();
  private usageHistory: Map<string, any[]> = new Map();
  private patternModels: Map<string, any> = new Map();
  
  constructor(config: IntelligentThrottlingConfig) {
    super();
    this.config = config;
    this.initializePatternRecognition();

  
  /**
   * Analyze user usage patterns and generate analytics
   */
  async analyzeUserUsage(
    userId: string, 
    timeWindowMinutes: number = this.config.analytics_integration.usage_analysis_window_minutes
  ): Promise<UsageAnalytics> {

    const endTime = Date.now();
    const startTime = endTime - (timeWindowMinutes * 60 * 1000);
    
    try {
      // Collect user usage data for the time window
      const usageData = await this.collectUserUsageData(userId, startTime, endTime);
      
      // Analyze usage patterns
      const usagePatterns = await this.analyzeUsagePatterns(usageData);
      
      // Detect behavioral indicators
      const behaviorIndicators = await this.analyzeBehaviorIndicators(userId, usageData);
      
      // Get throttling history
      const throttlingHistory = await this.getThrottlingHistory(userId, startTime, endTime);
      
      const analytics: UsageAnalytics = {
        user_id: userId,
        analysis_period: {
          start_time: startTime,
          end_time: endTime,
          duration_minutes: timeWindowMinutes

        usage_patterns: usagePatterns,
        behavior_indicators: behaviorIndicators,
        throttling_history: throttlingHistory
      };
      
      // Store analytics
      this.userAnalytics.set(userId, analytics);
      
      // Update pattern models
      await this.updatePatternModels(userId, analytics);
      
      this.emit('usage-analytics-generated', {
        user_id: userId,
        analysis_period: analytics.analysis_period,
        request_rate: analytics.usage_patterns.request_rate.average_per_minute,
        abuse_likelihood: analytics.behavior_indicators.abuse_likelihood,
        legitimacy_score: analytics.behavior_indicators.usage_legitimacy_score
      });
      
      return analytics;
 catch (error) {
      this.emit('usage-analytics-error', {
        user_id: userId,
        error: error.message,
        timestamp: Date.now()
      });
      
      throw new Error(`Failed to analyze user usage: ${error.message}`);


  
  /**
   * Detect usage anomalies and suspicious patterns
   */
  async detectUsageAnomalies(userId: string): Promise<{
    anomalies: unknown[];
    risk_score: number;
    recommended_actions: string[];
> {

    const analytics = this.userAnalytics.get(userId);
    if (!analytics) {
      throw new Error(`No analytics data available for user: ${userId}`);

    
    const anomalies = [];
    let riskScore = 0;
    const recommendedActions = [];
    
    // Detect rate anomalies
    if (analytics.usage_patterns.request_rate.average_per_minute > 1000) {
      anomalies.push({
        type: 'high_request_rate',
        severity: 'high',
        value: analytics.usage_patterns.request_rate.average_per_minute,
        threshold: 1000
      });
      riskScore += 30;
      recommendedActions.push('Apply aggressive throttling');

    
    // Detect behavioral anomalies
    if (analytics.behavior_indicators.abuse_likelihood > 0.7) {
      anomalies.push({
        type: 'potential_abuse',
        severity: 'critical',
        likelihood: analytics.behavior_indicators.abuse_likelihood,
        threshold: 0.7
      });
      riskScore += 40;
      recommendedActions.push('Implement strict rate limiting');

    
    // Detect automation patterns
    if (analytics.behavior_indicators.automation_probability > 0.8) {
      anomalies.push({
        type: 'automated_behavior',
        severity: 'medium',
        probability: analytics.behavior_indicators.automation_probability,
        threshold: 0.8
      });
      riskScore += 20;
      recommendedActions.push('Verify user authenticity');

    
    // Detect resource consumption anomalies
    if (analytics.usage_patterns.resource_consumption.cpu_usage > 80) {
      anomalies.push({
        type: 'high_resource_consumption',
        severity: 'high',
        cpu_usage: analytics.usage_patterns.resource_consumption.cpu_usage,
        threshold: 80
      });
      riskScore += 25;
      recommendedActions.push('Limit resource-intensive operations');

    
    this.emit('anomalies-detected', {
      user_id: userId,
      anomalies_count: anomalies.length,
      risk_score: riskScore,
      recommended_actions: recommendedActions.length
    });
    
    return {
      anomalies,
      risk_score: Math.min(riskScore, 100),
      recommended_actions: recommendedActions
    };

  
  /**
   * Get usage analytics for a user
   */
  getUserAnalytics(userId: string): UsageAnalytics | null {
    return this.userAnalytics.get(userId) || null;

  
  /**
   * Update usage data with new request information
   */
  async updateUsageData(userId: string, requestData: {
    endpoint: string;
    response_time: number;
    status_code: number;
    resource_usage: Error;
  }): Promise<void> {

    // Update usage history
    if (!this.usageHistory.has(userId)) {
      this.usageHistory.set(userId, []);

    
    const userHistory = this.usageHistory.get(userId)!;
    userHistory.push({
      timestamp: Date.now(),
      ...requestData
    });
    
    // Maintain history size limit
    const maxHistorySize = 10000;
    if (userHistory.length > maxHistorySize) {
      userHistory.splice(0, userHistory.length - maxHistorySize);

    
    this.emit('usage-data-updated', {
      user_id: userId,
      endpoint: requestData.endpoint,
      timestamp: Date.now()
    });

  
  // Private helper methods
  private initializePatternRecognition(): void {
    if (this.config.usage_pattern_analysis.enabled) {
      this.config.usage_pattern_analysis.pattern_recognition_algorithms.forEach(algorithm => {
        this.patternModels.set(algorithm, this.createPatternModel(algorithm));
      });


  
  private createPatternModel(algorithm: string): unknown {
    // Initialize pattern recognition model based on algorithm type
    switch (algorithm) {
      case 'statistical':
        return { type: 'statistical', model: {} };
      case 'machine_learning':
        return { type: 'machine_learning', model: {} };
      case 'time_series':
        return { type: 'time_series', model: {} };
      case 'anomaly_detection':
        return { type: 'anomaly_detection', model: {} };
      default:
        return { type: 'default', model: {} };


  
  private async collectUserUsageData(userId: string, startTime: number, endTime: number): Promise<any[]> {

    const userHistory = this.usageHistory.get(userId) || [];
    return userHistory.filter(entry => 
      entry.timestamp >= startTime && entry.timestamp <= endTime
    );

  
  private async analyzeUsagePatterns(usageData: unknown[]): Promise<unknown> {

    if (usageData.length === 0) {
      return this.getDefaultUsagePatterns();

    
    // Calculate request rate statistics
    const requestCount = usageData.length;
    const timeSpanMinutes = Math.max(
      1,
      (usageData[usageData.length - 1].timestamp - usageData[0].timestamp
    ) / (60 * 1000));
    const averagePerMinute = requestCount / timeSpanMinutes;
    
    // Find peak request rate (requests per minute in busiest minute)
    const requestsByMinute = this.groupRequestsByMinute(usageData);
    const peakPerMinute = Math.max(...Object.values(requestsByMinute));
    
    // Calculate standard deviation
    const rates = Object.values(requestsByMinute);
    const mean = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const variance = rates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / rates.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Analyze temporal patterns
    const temporalPatterns = this.analyzeTemporalPatterns(usageData);
    
    // Analyze endpoint usage
    const endpointUsage = this.analyzeEndpointUsage(usageData);
    
    // Calculate resource consumption
    const resourceConsumption = this.calculateResourceConsumption(usageData);
    
    return {
      request_rate: {
        average_per_minute: averagePerMinute,
        peak_per_minute: peakPerMinute,
        standard_deviation: standardDeviation,
        trend: this.determineTrend(requestsByMinute)

      temporal_patterns: temporalPatterns,
      endpoint_usage: endpointUsage,
      resource_consumption: resourceConsumption
    };

  
  private async analyzeBehaviorIndicators(userId: string, usageData: unknown[]): Promise<unknown> {

    return {
      abuse_likelihood: this.calculateAbuseLikelihood(usageData),
      automation_probability: this.calculateAutomationProbability(usageData),
      usage_legitimacy_score: this.calculateLegitimacyScore(usageData),
      anomaly_detection_flags: this.detectAnomalyFlags(usageData)
    };

  
  private async getThrottlingHistory(userId: string, startTime: number, endTime: number): Promise<unknown> {

    // Mock implementation - would query actual throttling history
    return {
      throttled_requests: Math.floor(Math.random() * 50),
      throttling_duration_seconds: Math.floor(Math.random() * 3600),
      throttling_effectiveness: Math.random(),
      user_satisfaction_impact: Math.random() * 20
    };

  
  private async updatePatternModels(userId: string, analytics: UsageAnalytics): Promise<void> {

    // Update pattern recognition models with new analytics data
    this.emit('pattern-models-updated', {
      user_id: userId,
      timestamp: Date.now()
    });

  
  private getDefaultUsagePatterns(): unknown {
    return {
      request_rate: {
        average_per_minute: 0,
        peak_per_minute: 0,
        standard_deviation: 0,
        trend: 'stable' as const

      temporal_patterns: {
        peak_hours: [],
        low_activity_hours: [],
        weekly_pattern: {},
        seasonal_adjustments: 0

      endpoint_usage: [],
      resource_consumption: {
        cpu_usage: 0,
        memory_usage: 0,
        bandwidth_usage: 0,
        storage_usage: 0

    };

  
  private groupRequestsByMinute(usageData: unknown[]): Record<number, number> {
    const groupedByMinute: Record<number, number> = {};
    
    usageData.forEach(entry => {
      const minute = Math.floor(entry.timestamp / (60 * 1000));
      groupedByMinute[minute] = (groupedByMinute[minute] || 0) + 1;
    });
    
    return groupedByMinute;

  
  private determineTrend(requestsByMinute: Record<number, number>): 'increasing' | 'decreasing' | 'stable' {
    const minutes = Object.keys(requestsByMinute).map(Number).sort();
    if (minutes.length < 2) return 'stable';
    
    const firstHalf = minutes.slice(0, Math.floor(minutes.length / 2));
    const secondHalf = minutes.slice(Math.floor(minutes.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, min) => sum + requestsByMinute[min], 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, min) => sum + requestsByMinute[min], 0) / secondHalf.length;
    
    const changePercent = (secondHalfAvg - firstHalfAvg) / firstHalfAvg;
    
    if (changePercent > 0.1) return 'increasing';
    if (changePercent < -0.1) return 'decreasing';
    return 'stable';

  
  private analyzeTemporalPatterns(usageData: unknown[]): unknown {
    const hourlyActivity: Record<number, number> = {};
    
    usageData.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });
    
    const sortedHours = Object.entries(hourlyActivity)
      .sort(([, a], [, b]) => b - a)
      .map(([hour]) => parseInt(hour));
    
    return {
      peak_hours: sortedHours.slice(0, 3),
      low_activity_hours: sortedHours.slice(-3),
      weekly_pattern: hourlyActivity,
      seasonal_adjustments: 0
    };

  
  private analyzeEndpointUsage(usageData: unknown[]): unknown[] {
    const endpointStats: Record<string, any> = {};
    
    usageData.forEach(entry => {
      const endpoint = entry.endpoint || '/unknown';
      if (!endpointStats[endpoint]) {
        endpointStats[endpoint] = {
          endpoint,
          request_count: 0,
          total_response_time: 0,
          error_count: 0
        };

      
      endpointStats[endpoint].request_count++;
      endpointStats[endpoint].total_response_time += entry.response_time || 0;
      if (entry.status_code >= 400) {
        endpointStats[endpoint].error_count++;

    });
    
    return Object.values(endpointStats).map((stats: unknown) => ({
      endpoint: stats.endpoint,
      request_count: stats.request_count,
      average_response_time: stats.total_response_time / stats.request_count,
      error_rate: stats.error_count / stats.request_count
    }));

  
  private calculateResourceConsumption(usageData: unknown[]): unknown {
    const totalUsage = usageData.reduce((acc, entry) => {
      const usage = entry.resource_usage || {};
      return {
        cpu_usage: acc.cpu_usage + (usage.cpu || 0),
        memory_usage: acc.memory_usage + (usage.memory || 0),
        bandwidth_usage: acc.bandwidth_usage + (usage.bandwidth || 0),
        storage_usage: acc.storage_usage + (usage.storage || 0)
      };
    }, { cpu_usage: 0, memory_usage: 0, bandwidth_usage: 0, storage_usage: 0 });
    
    const count = Math.max(1, usageData.length);
    return {
      cpu_usage: totalUsage.cpu_usage / count,
      memory_usage: totalUsage.memory_usage / count,
      bandwidth_usage: totalUsage.bandwidth_usage / count,
      storage_usage: totalUsage.storage_usage / count
    };

  
  private calculateAbuseLikelihood(usageData: unknown[]): number {
    let abuseFactor = 0;
    
    // High request rate increases abuse likelihood
    const requestRate = usageData.length / Math.max(1, usageData.length / 60);
    if (requestRate > 100) abuseFactor += 0.3;
    if (requestRate > 500) abuseFactor += 0.3;
    
    // High error rate increases abuse likelihood
    const errorCount = usageData.filter(entry => entry.status_code >= 400).length;
    const errorRate = errorCount / Math.max(1, usageData.length);
    if (errorRate > 0.2) abuseFactor += 0.2;
    
    // Repetitive patterns increase abuse likelihood
    const endpoints = new Set(usageData.map(entry => entry.endpoint));
    if (endpoints.size === 1 && usageData.length > 100) abuseFactor += 0.2;
    
    return Math.min(abuseFactor, 1.0);

  
  private calculateAutomationProbability(usageData: unknown[]): number {
    let automationFactor = 0;
    
    // Very regular timing patterns suggest automation
    const timings = usageData.map((entry, i) => 
      i > 0 ? entry.timestamp - usageData[i - 1].timestamp : 0
    ).slice(1);
    
    if (timings.length > 10) {
      const avgTiming = timings.reduce((sum, t) => sum + t, 0) / timings.length;
      const variance = timings.reduce((sum, t) => sum + Math.pow(t - avgTiming, 2), 0) / timings.length;
      
      // Low variance in timing suggests automation
      if (variance < avgTiming * 0.1) automationFactor += 0.4;

    
    // High request volume suggests automation
    if (usageData.length > 1000) automationFactor += 0.3;
    
    // Perfect patterns suggest automation
    const userAgents = new Set(usageData.map(entry => entry.user_agent).filter(Boolean));
    if (userAgents.size === 1) automationFactor += 0.3;
    
    return Math.min(automationFactor, 1.0);

  
  private calculateLegitimacyScore(usageData: unknown[]): number {
    let legitimacyScore = 1.0;
    
    // Reduce score for suspicious patterns
    legitimacyScore -= this.calculateAbuseLikelihood(usageData) * 0.3;
    legitimacyScore -= this.calculateAutomationProbability(usageData) * 0.2;
    
    // Increase score for normal patterns
    const errorRate = usageData.filter(entry => entry.status_code >= 400).length / Math.max(1, usageData.length);
    if (errorRate < 0.05) legitimacyScore += 0.1;
    
    // Diverse endpoint usage increases legitimacy
    const endpoints = new Set(usageData.map(entry => entry.endpoint));
    if (endpoints.size > 5) legitimacyScore += 0.1;
    
    return Math.max(0, Math.min(legitimacyScore, 1.0));

  
  private detectAnomalyFlags(usageData: unknown[]): string[] {
    const flags = [];
    
    if (usageData.length > 10000) flags.push('extremely_high_volume');
    
    const errorRate = usageData.filter(entry => entry.status_code >= 400).length / Math.max(1, usageData.length);
    if (errorRate > 0.5) flags.push('high_error_rate');
    
    const endpoints = new Set(usageData.map(entry => entry.endpoint));
    if (endpoints.size === 1 && usageData.length > 100) flags.push('single_endpoint_focus');
    
    return flags;



// ============================================================================
// Main Intelligent Throttling Manager
// ============================================================================

export class IntelligentThrottlingManager extends EventEmitter {
  private config: IntelligentThrottlingConfig;
  private rateLimiter: RateLimiter;
  private performanceMonitor: PerformanceMonitoringService;
  private predictiveLoadManager: PredictiveAPILoadManager | null;
  private usageAnalyticsEngine: UsageAnalyticsEngine;
  private throttlingDecisions: Map<string, ThrottlingDecision[]> = new Map();
  private dynamicRateLimits: Map<string, any> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  
  constructor(
    config: IntelligentThrottlingConfig,
    rateLimiter: RateLimiter,
    performanceMonitor: PerformanceMonitoringService,
    predictiveLoadManager?: PredictiveAPILoadManager
  ) {
    super();
    this.config = config;
    this.rateLimiter = rateLimiter;
    this.performanceMonitor = performanceMonitor;
    this.predictiveLoadManager = predictiveLoadManager || null;
    this.usageAnalyticsEngine = new UsageAnalyticsEngine(config);
    
    this.setupEventListeners();

  
  /**
   * Initialize the intelligent throttling system
   */
  async initialize(): Promise<void> {

    try {
      // Initialize base rate limits
      await this.initializeBaseRateLimits();
      
      // Start analytics-based monitoring
      if (this.config.analytics_integration.enabled) {
        await this.startAnalyticsMonitoring();

      
      // Start adaptive adjustment cycle
      if (this.config.throttling_strategies.adaptive_throttling.enabled) {
        await this.startAdaptiveAdjustments();

      
      this.emit('intelligent-throttling-initialized', {
        timestamp: Date.now(),
        config_summary: {
          analytics_enabled: this.config.analytics_integration.enabled,
          adaptive_throttling: this.config.throttling_strategies.adaptive_throttling.enabled,
          predictive_throttling: this.config.throttling_strategies.predictive_throttling.enabled,
          user_behavior_analysis: this.config.throttling_strategies.user_behavior_throttling.enabled

      });
 catch (error) {
      this.emit('initialization-error', {
        error: error.message,
        timestamp: Date.now()
      });
      throw error;


  
  /**
   * Make intelligent throttling decision for a request
   */
  async makeThrottlingDecision(
    userId: string,
    endpoint: string,
    requestContext: Record<string, unknown> = {}
  ): Promise<ThrottlingDecision> {

    const startTime = Date.now();
    
    try {
      // Get or analyze user usage analytics
      let userAnalytics = this.usageAnalyticsEngine.getUserAnalytics(userId);
      if (!userAnalytics) {
        userAnalytics = await this.usageAnalyticsEngine.analyzeUserUsage(userId);

      
      // Get current system metrics
      const systemMetrics = await this.performanceMonitor.getSystemMetrics();
      
      // Get predictive load information if available
      let loadPrediction: LoadPrediction | null = null;
      if (this.predictiveLoadManager && this.config.throttling_strategies.predictive_throttling.enabled) {
        const predictionStatus = this.predictiveLoadManager.getCurrentPredictionStatus();
        loadPrediction = predictionStatus.current_prediction;

      
      // Apply different throttling strategies
      const strategyResults = await this.applyThrottlingStrategies(
        userId,
        endpoint,
        userAnalytics,
        systemMetrics,
        loadPrediction,
        requestContext
      );
      
      // Combine strategy results into final decision
      const finalDecision = this.combineStrategyResults(strategyResults, userId, endpoint);
      
      // Update usage data
      await this.usageAnalyticsEngine.updateUsageData(userId, {
        endpoint,
        response_time: Date.now() - startTime,
        status_code: finalDecision.decision_type === 'allow' ? 200 : 429,
        resource_usage: requestContext.resource_usage || {}
      });
      
      // Store decision
      this.storeThrottlingDecision(userId, finalDecision);
      
      // Emit decision event
      this.emit('throttling-decision-made', {
        user_id: userId,
        endpoint,
        decision_type: finalDecision.decision_type,
        throttling_strategy: finalDecision.throttling_strategy,
        confidence_score: finalDecision.decision_rationale.confidence_score
      });
      
      return finalDecision;
 catch (error) {
      this.emit('throttling-decision-error', {
        user_id: userId,
        endpoint,
        error: error.message,
        timestamp: Date.now()
      });
      
      // Fallback to standard rate limiting
      return this.createFallbackDecision(userId, endpoint);


  
  /**
   * Get throttling effectiveness metrics
   */
  async getThrottlingEffectiveness(
    timeWindowHours: number = 24
  ): Promise<ThrottlingEffectivenessMetrics> {

    const endTime = Date.now();
    const startTime = endTime - (timeWindowHours * 60 * 60 * 1000);
    
    // Collect throttling statistics
    const allDecisions = Array.from(this.throttlingDecisions.values()).flat()
      .filter(decision => decision.timestamp >= startTime && decision.timestamp <= endTime);
    
    const totalRequests = allDecisions.length;
    const throttledRequests = allDecisions.filter(d => d.decision_type === 'throttle').length;
    const blockedRequests = allDecisions.filter(d => d.decision_type === 'block').length;
    
    // Calculate performance impact
    const performanceImpact = await this.calculatePerformanceImpact(startTime, endTime);
    
    // Calculate user impact
    const userImpact = await this.calculateUserImpact(allDecisions);
    
    // Calculate business metrics
    const businessMetrics = await this.calculateBusinessMetrics(performanceImpact, userImpact);
    
    return {
      measurement_period: {
        start_time: startTime,
        end_time: endTime,
        duration_hours: timeWindowHours

      throttling_statistics: {
        total_requests_processed: totalRequests,
        requests_throttled: throttledRequests,
        requests_blocked: blockedRequests,
        throttling_rate: totalRequests > 0 ? (throttledRequests + blockedRequests) / totalRequests : 0,
        false_positive_rate: this.calculateFalsePositiveRate(allDecisions)

      performance_impact: performanceImpact,
      user_impact_analysis: userImpact,
      business_metrics: businessMetrics
    };

  
  /**
   * Update dynamic rate limits based on analytics
   */
  async updateDynamicRateLimits(): Promise<void> {

    try {
      // Get current system performance
      const systemMetrics = await this.performanceMonitor.getSystemMetrics();
      
      // Calculate system load factor
      const loadFactor = this.calculateSystemLoadFactor(systemMetrics);
      
      // Get predictive insights if available
      let predictiveAdjustment = 1.0;
      if (this.predictiveLoadManager) {
        const analytics = await this.predictiveLoadManager.getPredictiveAnalytics();
        predictiveAdjustment = this.calculatePredictiveAdjustment(analytics);

      
      // Update rate limits for each user tier
      const baseLimits = this.config.dynamic_rate_limits.base_rate_limits;
      const adjustmentParams = this.config.dynamic_rate_limits.adjustment_parameters;
      const tierMultipliers = this.config.dynamic_rate_limits.user_tier_multipliers;
      
      Object.entries(tierMultipliers).forEach(([tier, multiplier]) => {
        const adjustedLimits = {
          requests_per_minute: Math.floor(
            baseLimits.requests_per_minute * 
            multiplier * 
            loadFactor * 
            predictiveAdjustment
          ),
          burst_capacity: Math.floor(
            baseLimits.burst_capacity * 
            multiplier * 
            loadFactor
          ),
          concurrent_requests: Math.floor(
            baseLimits.concurrent_requests * 
            multiplier * 
            loadFactor

        };
        
        // Apply adjustment constraints
        adjustedLimits.requests_per_minute = Math.max(
          Math.floor(baseLimits.requests_per_minute * adjustmentParams.max_decrease_factor),
          Math.min(
            Math.floor(baseLimits.requests_per_minute * adjustmentParams.max_increase_factor),
            adjustedLimits.requests_per_minute

        );
        
        this.dynamicRateLimits.set(tier, adjustedLimits);
      });
      
      this.emit('dynamic-rate-limits-updated', {
        load_factor: loadFactor,
        predictive_adjustment: predictiveAdjustment,
        updated_tiers: Object.keys(tierMultipliers),
        timestamp: Date.now()
      });
 catch (error) {
      this.emit('rate-limit-update-error', {
        error: error.message,
        timestamp: Date.now()
      });


  
  /**
   * Get current throttling status
   */
  getCurrentThrottlingStatus(): {
    system_status: unknown;
    active_throttling_decisions: number;
    recent_analytics: unknown;
    dynamic_limits: unknown;
 {
    const recentDecisions = Array.from(this.throttlingDecisions.values())
      .flat()
      .filter(decision => Date.now() - decision.timestamp < 3600000) // Last hour
      .length;
    
    return {
      system_status: {
        analytics_enabled: this.config.analytics_integration.enabled,
        adaptive_throttling_active: this.config.throttling_strategies.adaptive_throttling.enabled,
        predictive_throttling_active: this.config.throttling_strategies.predictive_throttling.enabled,
        monitoring_active: this.monitoringInterval !== null

      active_throttling_decisions: recentDecisions,
      recent_analytics: {
        users_analyzed: this.usageAnalyticsEngine.userAnalytics.size,
        pattern_models_active: this.usageAnalyticsEngine.patternModels.size

      dynamic_limits: Object.fromEntries(this.dynamicRateLimits.entries())
    };

  
  // Private helper methods
  private setupEventListeners(): void {
    // Listen to usage analytics events
    this.usageAnalyticsEngine.on('usage-analytics-generated', (event) => {
      this.emit('usage-analytics-generated', event);
    });
    
    this.usageAnalyticsEngine.on('anomalies-detected', (event) => {
      this.emit('usage-anomalies-detected', event);
    });

  
  private async initializeBaseRateLimits(): Promise<void> {

    const baseLimits = this.config.dynamic_rate_limits.base_rate_limits;
    const tierMultipliers = this.config.dynamic_rate_limits.user_tier_multipliers;
    
    Object.entries(tierMultipliers).forEach(([tier, multiplier]) => {
      this.dynamicRateLimits.set(tier, {
        requests_per_minute: Math.floor(baseLimits.requests_per_minute * multiplier),
        burst_capacity: Math.floor(baseLimits.burst_capacity * multiplier),
        concurrent_requests: Math.floor(baseLimits.concurrent_requests * multiplier)
      });
    });

  
  private async startAnalyticsMonitoring(): Promise<void> {

    const intervalMs = this.config.analytics_integration.usage_analysis_window_minutes * 60 * 1000;
    
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.updateDynamicRateLimits();
        
        // Analyze high-activity users
        const activeUsers = Array.from(this.usageAnalyticsEngine.usageHistory.keys());
        for (const userId of activeUsers.slice(0, 100)) { // Limit to top 100 active users
          try {
            await this.usageAnalyticsEngine.analyzeUserUsage(userId);
 catch (error) {
            // Continue with other users if one fails


 catch (error) {
        this.emit('monitoring-cycle-error', {
          error: error.message,
          timestamp: Date.now()
        });

    }, intervalMs);

  
  private async startAdaptiveAdjustments(): Promise<void> {

    const intervalMs = this.config.throttling_strategies.adaptive_throttling.adaptation_interval_seconds * 1000;
    
    setInterval(async () => {
      try {
        await this.performAdaptiveAdjustments();
 catch (error) {
        this.emit('adaptive-adjustment-error', {
          error: error.message,
          timestamp: Date.now()
        });

    }, intervalMs);

  
  private async performAdaptiveAdjustments(): Promise<void> {

    const systemMetrics = await this.performanceMonitor.getSystemMetrics();
    const targetResponseTime = this.config.throttling_strategies.adaptive_throttling.performance_target_response_time_ms;
    const errorRateThreshold = this.config.throttling_strategies.adaptive_throttling.error_rate_threshold;
    
    // Get current performance metrics
    const currentResponseTime = systemMetrics.performance.nodeExecutionTime.value;
    const currentErrorRate = systemMetrics.performance.errorRate.value / 100; // Convert to decimal
    
    // Determine if adjustments are needed
    let adjustmentFactor = 1.0;
    
    if (currentResponseTime > targetResponseTime) {
      // Slow response times - reduce limits
      adjustmentFactor = Math.max(0.8, targetResponseTime / currentResponseTime);
 else if (currentResponseTime < targetResponseTime * 0.7) {
      // Fast response times - potentially increase limits
      adjustmentFactor = Math.min(1.2, 1.0 + (targetResponseTime - currentResponseTime) / targetResponseTime * 0.3);

    
    if (currentErrorRate > errorRateThreshold) {
      // High error rate - reduce limits more aggressively
      adjustmentFactor *= Math.max(0.5, 1.0 - currentErrorRate);

    
    // Apply adjustments if significant
    if (Math.abs(adjustmentFactor - 1.0) > 0.05) {
      await this.applyAdaptiveAdjustment(adjustmentFactor);

    
    this.emit('adaptive-adjustment-performed', {
      adjustment_factor: adjustmentFactor,
      current_response_time: currentResponseTime,
      target_response_time: targetResponseTime,
      current_error_rate: currentErrorRate,
      timestamp: Date.now()
    });

  
  private async applyAdaptiveAdjustment(adjustmentFactor: number): Promise<void> {

    // Update dynamic rate limits with adaptive adjustment
    for (const [tier, limits] of this.dynamicRateLimits.entries()) {
      const adjustedLimits = {
        requests_per_minute: Math.floor(limits.requests_per_minute * adjustmentFactor),
        burst_capacity: Math.floor(limits.burst_capacity * adjustmentFactor),
        concurrent_requests: Math.floor(limits.concurrent_requests * adjustmentFactor)
      };
      
      this.dynamicRateLimits.set(tier, adjustedLimits);


  
  private async applyThrottlingStrategies(
    userId: string,
    endpoint: string,
    userAnalytics: UsageAnalytics,
    systemMetrics: SystemMetrics,
    loadPrediction: LoadPrediction | null,
    requestContext: unknown
  ): Promise<any[]> {

    const strategyResults = [];
    
    // Usage-based throttling strategy
    if (this.config.throttling_strategies.usage_based_throttling.enabled) {
      const usageResult = await this.applyUsageBasedThrottling(userAnalytics, endpoint);
      strategyResults.push(usageResult);

    
    // Predictive throttling strategy
    if (this.config.throttling_strategies.predictive_throttling.enabled && loadPrediction) {
      const predictiveResult = await this.applyPredictiveThrottling(loadPrediction, userId, endpoint);
      strategyResults.push(predictiveResult);

    
    // Adaptive throttling strategy
    if (this.config.throttling_strategies.adaptive_throttling.enabled) {
      const adaptiveResult = await this.applyAdaptiveThrottling(systemMetrics, userAnalytics);
      strategyResults.push(adaptiveResult);

    
    // User behavior throttling strategy
    if (this.config.throttling_strategies.user_behavior_throttling.enabled) {
      const behaviorResult = await this.applyUserBehaviorThrottling(userAnalytics, userId);
      strategyResults.push(behaviorResult);

    
    return strategyResults;

  
  private async applyUsageBasedThrottling(userAnalytics: UsageAnalytics, endpoint: string): Promise<unknown> {

    const config = this.config.throttling_strategies.usage_based_throttling;
    const requestRate = userAnalytics.usage_patterns.request_rate.average_per_minute;
    
    // Calculate percentile threshold
    const thresholdRate = 100; // Mock threshold - would be calculated from analytics
    
    let decision = 'allow';
    let rateLimitAdjustment = 1.0;
    
    if (requestRate > thresholdRate * (config.usage_threshold_percentile / 100)) {
      decision = 'throttle';
      rateLimitAdjustment = config.throttle_reduction_factor;

    
    return {
      strategy: 'usage_based',
      decision,
      confidence: 0.8,
      rate_limit_adjustment: rateLimitAdjustment,
      rationale: `Request rate: ${requestRate}/min, threshold: ${thresholdRate}/min`
    };

  
  private async applyPredictiveThrottling(
    loadPrediction: LoadPrediction,
    userId: string,
    endpoint: string
  ): Promise<unknown> {

    const config = this.config.throttling_strategies.predictive_throttling;
    const predictedLoad = loadPrediction.predicted_metrics.request_rate.value;
    const confidence = loadPrediction.predicted_metrics.request_rate.confidence;
    
    let decision = 'allow';
    let rateLimitAdjustment = 1.0;
    
    if (confidence >= config.prediction_confidence_threshold) {
      if (loadPrediction.risk_assessment.overload_probability > 0.7 && config.preemptive_throttling_enabled) {
        decision = 'throttle';
        rateLimitAdjustment = 0.7;
 else if (loadPrediction.risk_assessment.performance_degradation_risk > 0.6 && config.load_spike_protection) {
        decision = 'throttle';
        rateLimitAdjustment = 0.8;


    
    return {
      strategy: 'predictive',
      decision,
      confidence,
      rate_limit_adjustment: rateLimitAdjustment,
      rationale: `Predicted load: ${predictedLoad}, overload risk: ${loadPrediction.risk_assessment.overload_probability}`
    };

  
  private async applyAdaptiveThrottling(systemMetrics: SystemMetrics, userAnalytics: UsageAnalytics): Promise<unknown> {

    const config = this.config.throttling_strategies.adaptive_throttling;
    const currentResponseTime = systemMetrics.performance.nodeExecutionTime.value;
    const currentErrorRate = systemMetrics.performance.errorRate.value / 100;
    
    let decision = 'allow';
    let rateLimitAdjustment = 1.0;
    
    if (currentResponseTime > config.performance_target_response_time_ms) {
      decision = 'throttle';
      rateLimitAdjustment = Math.max(0.5, config.performance_target_response_time_ms / currentResponseTime);

    
    if (currentErrorRate > config.error_rate_threshold) {
      decision = 'throttle';
      rateLimitAdjustment = Math.min(rateLimitAdjustment, Math.max(0.3, 1.0 - currentErrorRate));

    
    return {
      strategy: 'adaptive',
      decision,
      confidence: 0.9,
      rate_limit_adjustment: rateLimitAdjustment,
      rationale: `Response time: ${currentResponseTime}ms, error rate: ${(currentErrorRate * 100).toFixed(2)}%`
    };

  
  private async applyUserBehaviorThrottling(userAnalytics: UsageAnalytics, userId: string): Promise<unknown> {

    const config = this.config.throttling_strategies.user_behavior_throttling;
    const abuseLikelihood = userAnalytics.behavior_indicators.abuse_likelihood;
    const legitimacyScore = userAnalytics.behavior_indicators.usage_legitimacy_score;
    
    let decision = 'allow';
    let rateLimitAdjustment = 1.0;
    
    if (config.suspicious_activity_detection && abuseLikelihood > 0.7) {
      decision = 'block';
      rateLimitAdjustment = 0.1;
 else if (config.progressive_throttling && legitimacyScore < 0.5) {
      decision = 'throttle';
      rateLimitAdjustment = legitimacyScore;

    
    return {
      strategy: 'user_behavior',
      decision,
      confidence: 0.75,
      rate_limit_adjustment: rateLimitAdjustment,
      rationale: `Abuse likelihood: ${abuseLikelihood}, legitimacy: ${legitimacyScore}`
    };

  
  private combineStrategyResults(strategyResults: unknown[], userId: string, endpoint: string): ThrottlingDecision {
    // Weight and combine strategy results
    const weights = {
      usage_based: 0.25,
      predictive: 0.30,
      adaptive: 0.30,
      user_behavior: 0.15
    };
    
    let weightedDecision = 0; // 0 = allow, 1 = throttle, 2 = block
    let combinedConfidence = 0;
    let combinedRateLimitAdjustment = 1.0;
    const contributingFactors: string[] = [];
    
    strategyResults.forEach(result => {
      const weight = weights[result.strategy] || 0.25;
      
      let decisionValue = 0;
      if (result.decision === 'throttle') decisionValue = 1;
      if (result.decision === 'block') decisionValue = 2;
      
      weightedDecision += decisionValue * weight;
      combinedConfidence += result.confidence * weight;
      combinedRateLimitAdjustment *= result.rate_limit_adjustment;
      
      contributingFactors.push(`${result.strategy}: ${result.rationale}`);
    });
    
    // Determine final decision
    let finalDecision: 'allow' | 'throttle' | 'block' = 'allow';
    if (weightedDecision > 1.5) finalDecision = 'block';
    else if (weightedDecision > 0.5) finalDecision = 'throttle';
    
    // Get applicable rate limits
    const userTier = this.getUserTier(userId); // Mock implementation
    const rateLimitApplied = this.dynamicRateLimits.get(userTier) || this.dynamicRateLimits.get('free_tier')!;
    
    return {
      decision_id: `throttling_decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      user_id: userId,
      endpoint: endpoint,
      decision_type: finalDecision,
      throttling_strategy: strategyResults.map(r => r.strategy).join(', '),
      rate_limit_applied: {
        requests_per_minute: Math.floor(rateLimitApplied.requests_per_minute * combinedRateLimitAdjustment),
        burst_capacity: Math.floor(rateLimitApplied.burst_capacity * combinedRateLimitAdjustment),
        current_usage: 0 // Would be calculated from actual usage

      decision_rationale: {
        primary_factor: strategyResults[0]?.strategy || 'default',
        contributing_factors: contributingFactors,
        confidence_score: combinedConfidence,
        usage_analytics_weight: weights.usage_based + weights.user_behavior,
        predictive_analytics_weight: weights.predictive + weights.adaptive

      impact_assessment: {
        performance_impact: finalDecision === 'allow' ? 0 : combinedRateLimitAdjustment * 10,
        user_experience_impact: finalDecision === 'block' ? 100 : finalDecision === 'throttle' ? 30 : 0,
        system_resource_savings: finalDecision === 'allow' ? 0 : (1 - combinedRateLimitAdjustment) * 100,
        business_impact: finalDecision === 'block' ? -50 : finalDecision === 'throttle' ? -10 : 0

      enforcement_details: {
        throttle_duration_seconds: finalDecision === 'throttle' ? 60 : 0,
        retry_after_seconds: finalDecision === 'block' ? 300 : finalDecision === 'throttle' ? 60 : 0,
        progressive_penalty_applied: false,
        bypass_conditions: []

    };

  
  private createFallbackDecision(userId: string, endpoint: string): ThrottlingDecision {
    const userTier = this.getUserTier(userId);
    const rateLimitApplied = this.dynamicRateLimits.get(userTier) || this.dynamicRateLimits.get('free_tier')!;
    
    return {
      decision_id: `fallback_decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      user_id: userId,
      endpoint: endpoint,
      decision_type: 'allow',
      throttling_strategy: 'fallback',
      rate_limit_applied: {
        requests_per_minute: rateLimitApplied.requests_per_minute,
        burst_capacity: rateLimitApplied.burst_capacity,
        current_usage: 0

      decision_rationale: {
        primary_factor: 'fallback',
        contributing_factors: ['Error in throttling analysis'],
        confidence_score: 0.5,
        usage_analytics_weight: 0,
        predictive_analytics_weight: 0

      impact_assessment: {
        performance_impact: 0,
        user_experience_impact: 0,
        system_resource_savings: 0,
        business_impact: 0

      enforcement_details: {
        throttle_duration_seconds: 0,
        retry_after_seconds: 0,
        progressive_penalty_applied: false,
        bypass_conditions: []

    };

  
  private storeThrottlingDecision(userId: string, decision: ThrottlingDecision): void {
    if (!this.throttlingDecisions.has(userId)) {
      this.throttlingDecisions.set(userId, []);

    
    const userDecisions = this.throttlingDecisions.get(userId)!;
    userDecisions.push(decision);
    
    // Maintain decision history limit
    const maxDecisions = 1000;
    if (userDecisions.length > maxDecisions) {
      userDecisions.shift();


  
  private calculateSystemLoadFactor(systemMetrics: SystemMetrics): number {
    const cpuUtilization = systemMetrics.infrastructure.cpuUtilization.value / 100;
    const memoryUtilization = systemMetrics.infrastructure.memoryUtilization.value / 100;
    
    // Higher utilization = lower rate limits (inverse relationship)
    const avgUtilization = (cpuUtilization + memoryUtilization) / 2;
    return Math.max(0.3, 1.0 - avgUtilization * 0.7);

  
  private calculatePredictiveAdjustment(analytics: unknown): number {
    // Mock implementation - would use actual predictive analytics
    return 0.9; // Slightly reduce limits based on predictions

  
  private async calculatePerformanceImpact(startTime: number, endTime: number): Promise<unknown> {

    // Mock implementation - would calculate actual performance metrics
    return {
      system_load_reduction: 15,
      response_time_improvement: 12,
      error_rate_reduction: 8,
      resource_utilization_optimization: 18
    };

  
  private async calculateUserImpact(decisions: ThrottlingDecision[]): Promise<unknown> {

    const affectedUsers = new Set(decisions.filter(d => d.decision_type !== 'allow').map(d => d.user_id));
    const avgThrottlingDuration = decisions
      .filter(d => d.decision_type === 'throttle')
      .reduce((sum, d) => sum + d.enforcement_details.throttle_duration_seconds, 0) / 
      Math.max(1, decisions.filter(d => d.decision_type === 'throttle').length);
    
    return {
      affected_users_count: affectedUsers.size,
      average_throttling_duration: avgThrottlingDuration,
      user_satisfaction_score: 85, // Mock score
      retention_impact: -2 // Mock percentage
    };

  
  private async calculateBusinessMetrics(performanceImpact: unknown, userImpact: unknown): Promise<unknown> {

    return {
      cost_savings: performanceImpact.resource_utilization_optimization * 10, // Mock calculation
      uptime_improvement: performanceImpact.system_load_reduction * 0.1,
      capacity_optimization: performanceImpact.resource_utilization_optimization,
      revenue_protection: Math.max(0, userImpact.user_satisfaction_score - 80) * 100
    };

  
  private calculateFalsePositiveRate(decisions: ThrottlingDecision[]): number {
    // Mock implementation - would analyze actual false positives
    const throttledOrBlocked = decisions.filter(d => d.decision_type !== 'allow');
    const falsePositives = throttledOrBlocked.filter(d => d.decision_rationale.confidence_score < 0.7);
    
    return throttledOrBlocked.length > 0 ? falsePositives.length / throttledOrBlocked.length : 0;

  
  private getUserTier(userId: string): string {
    // Mock implementation - would lookup actual user tier
    const hash = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    if (hash % 10 < 2) return 'enterprise_tier';
    if (hash % 10 < 5) return 'premium_tier';
    return 'free_tier';

  
  /**
   * Shutdown the intelligent throttling system
   */
  async shutdown(): Promise<void> {

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;

    
    this.emit('intelligent-throttling-shutdown', {
      timestamp: Date.now()
    });



export default IntelligentThrottlingManager;