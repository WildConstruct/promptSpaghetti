/**
 * Epic 17 Toggle Conditions Service
 * 
 * Advanced conditional evaluation system for feature toggles providing:
 * - Complex condition expressions with context variables
 * - User/segment targeting with dynamic rule evaluation
 * - Time-based and percentage rollout conditions
 * - A/B testing integration and multivariate conditions
 * - Security-hardened expression evaluation
 */
import { ConditionalNode, ConditionalBranch, ConditionalConfig } from '../runtime/nodes/Conditional';
import { SafeExpressionEvaluator } from '../runtime/expression-evaluator';
import { securityAudit, SecuritySeverity, SecurityEventCategory } from '../runtime/security-audit-logger';
import { ErrorFactory } from '../errors/ErrorFactory';

// Core condition interfaces


export interface ToggleCondition { id: string;
  toggleId: string;
  name: string;
  description: string;
  conditionType: ConditionType;
  expression: string;
  parameters: ConditionParameters;
  priority: number; // Higher number = higher priority }
  active: boolean;
  metadata: ConditionMetadata;
  created: Date;
  lastModified: Date;


export enum ConditionType { USER_ATTRIBUTE = 'user_attribute',       // Based on user properties (id, email, role, etc.)
  USER_SEGMENT = 'user_segment',           // Based on predefined user segments
  PERCENTAGE = 'percentage',               // Percentage-based rollout
  TIME_WINDOW = 'time_window',             // Time-based activation
  AB_TEST = 'ab_test',                     // A/B testing conditions
  MULTIVARIATE = 'multivariate',           // Multivariate testing
  CUSTOM_EXPRESSION = 'custom_expression', // Custom JavaScript-like expressions
  DEPENDENCY = 'dependency',               // Based on other toggles
  GEOGRAPHIC = 'geographic',               // Geographic/location-based
  DEVICE_TYPE = 'device_type',             // Device/platform-based
  TRAFFIC_SPLIT = 'traffic_split',         // Traffic splitting conditions
  FEATURE_FLAG = 'feature_flag'            // Based on other feature flags
  export interface ConditionParameters {
  // User-based parameters
  userAttributes?: UserAttributeParams;
  userSegments?: string;
  // Rollout parameters
  percentage?: number;
  salt?: string; // For consistent percentage calculation }
  // Time-based parameters
  startTime?: Date;
  endTime?: Date;
  timezone?: string;
  schedule?: ScheduleParams;
  // A/B Testing parameters
  experiment?: ExperimentParams;
  // Geographic parameters
  countries?: string;
  regions?: string;
  cities?: string;
  // Device parameters
  deviceTypes?: string;
  platforms?: string;
  browsers?: string;
  // Dependency parameters
  requiredToggles?: string;
  conflictingToggles?: string;
  // Custom expression parameters
  customVariables?: Record<string, any>;
  functions?: Record<string, Function>;




export interface UserAttributeParams { attributes: Array<{ }
  key: string;
  operator: ComparisonOperator;
  value: any;


>;
  logic: 'AND' | 'OR';

export enum ComparisonOperator { EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_EQUAL = 'greater_equal',
  LESS_EQUAL = 'less_equal',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  MATCHES_REGEX = 'matches_regex',
  IN_LIST = 'in_list',
  NOT_IN_LIST = 'not_in_list'
  export interface ScheduleParams {
  daysOfWeek?: number; // 0-6, Sunday=0;
  hoursOfDay?: number; // 0-23;
  recurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' }




export interface ExperimentParams { experimentId: string;
  variant: string;
  trafficAllocation: number; // 0-100;
  stickiness?: 'user' | 'session' | 'device' }




export interface ConditionMetadata { category: string;
  tags: string;
  epic?: string;
  story?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical' }
  businessImpact: string;
  technicalNotes: string;
  author: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  // Evaluation interfaces




export interface EvaluationContext { user?: UserContext;
  request?: RequestContext;
  environment?: EnvironmentContext;
  toggles?: Record<string, boolean>;
  experiments?: Record<string, string>;
  timestamp?: Date;
  customData?: Record<string, any> }



export interface UserContext { id: string;
  email?: string;
  role?: string;
  segment?: string;
  attributes?: Record<string, any>;
  groups?: string;
  permissions?: string }



export interface RequestContext { ip?: string;
  userAgent?: string;
  country?: string;
  region?: string;
  city?: string;
  device?: DeviceInfo;
  session?: SessionInfo }



export interface DeviceInfo { type: 'mobile' | 'tablet' | 'desktop' | 'unknown' }
  platform: string;
  browser?: string;
  version?: string;




export interface SessionInfo { id: string;
  startTime: Date;
  duration: number; // seconds }
  pageViews: number;




export interface EnvironmentContext { environment: 'development' | 'staging' | 'production' }
  region: string;
  timezone: string;
  version: string;
  // Evaluation results




export interface ConditionEvaluationResult { conditionId: string;
  result: boolean;
  score?: number; // 0-1 for weighted conditions;
  reason: string;
  executionTime: number; // milliseconds;
  metadata: { }
  evaluatedAt: Date;
  contextHash: string;
  intermediateValues?: Record<string, any>;


};


export interface ToggleEvaluationResult { toggleId: string;
  enabled: boolean;
  variant?: string; // for multivariate toggles;
  conditions: ConditionEvaluationResult;
  fallbackReason?: string;
  confidence: number; // 0-1;
  metadata: { }
  evaluatedAt: Date;
  totalExecutionTime: number;
  cacheHit: boolean;


};

// Service configuration


export interface ToggleConditionsConfig { evaluation: {;
  enableCaching: boolean;
  cacheTimeToLive: number; // seconds;
  maxConditionsPerToggle: number;
  evaluationTimeout: number; // milliseconds }
  strictMode: boolean;


};
  security: { ,
  allowCustomExpressions: boolean;
  maxExpressionComplexity: number;
  enableSecurityAudit: boolean;
  blockedPatterns: string };
  rollout: { ,
  defaultSalt: string;
  stickinessDuration: number; // seconds,
  enableGradualRollout: boolean;
  rolloutRateLimit: number; // percentage per hour }
};
  experiments: { ,
  enableABTesting: boolean;
  defaultTrafficAllocation: number;
  maxVariants: number;
  stickinessStrategy: 'user' | 'session' | 'device' }
};
/**
 * Toggle Conditions Service
 * 
 * Core service for evaluating complex conditions for feature toggles in Epic 17.
 * Provides secure, performant, and flexible condition evaluation.
 */

export class ToggleConditionsService {
  private conditions: Map<string, ToggleCondition> = new Map();
  private toggleConditions: Map<string, string> = new Map(); // toggleId -> conditionIds
  private evaluationCache: Map<string, ConditionEvaluationResult> = new Map();
  private config: ToggleConditionsConfig;
  private expressionEvaluator: SafeExpressionEvaluator;
  constructor(config: Partial<ToggleConditionsConfig> = {}) { this.config = {
  evaluation: {
  enableCaching: true
  cacheTimeToLive: 300, // 5 minutes
  maxConditionsPerToggle: 20
  evaluationTimeout: 1000, // 1 second
  strictMode: false }
  ...config.evaluation

  security: { 
  allowCustomExpressions: true
  maxExpressionComplexity: 100
  enableSecurityAudit: true
  blockedPatterns: ['eval', 'Function', 'constructor', 'prototype', '__proto__'] }
  ...config.security

  rollout: { 
  defaultSalt: 'toggle-conditions-v1'
  stickinessDuration: 86400, // 24 hours
  enableGradualRollout: true
  rolloutRateLimit: 10, // 10% per hour }
  ...config.rollout

  experiments: { 
  enableABTesting: true
  defaultTrafficAllocation: 100
  maxVariants: 10
  stickinessStrategy: 'user' }
  ...config.experiments
};
    this.expressionEvaluator = new SafeExpressionEvaluator({ )
  timeout: this.config.evaluation.evaluationTimeout
  maxComplexity: this.config.security.maxExpressionComplexity }
});
    // Clean up expired cache entries periodically
    if (this.config.evaluation.enableCaching) { setInterval(() => this.cleanupCache(), this.config.evaluation.cacheTimeToLive * 1000);
  /**
  * Add or update a condition for a toggle
  */
  async addCondition(condition: Omit<ToggleCondition, 'id' | 'created' | 'lastModified'>): Promise<ToggleCondition> {
  const id = this.generateConditionId();
  const fullCondition: ToggleCondition = {
  ...condition
  id
  created: new Date()
  lastModified: new Date() }
};
    // Validate condition
    const validation = await this.validateCondition(fullCondition);
    if (!validation.valid && this.config.evaluation.strictMode) {
      throw new Error(`Condition validation failed: ${validation.errors.join(', ')}`);}
    this.conditions.set(id, fullCondition);
    // Update toggle-condition mapping
    const toggleConditions = this.toggleConditions.get(condition.toggleId) || [];
    toggleConditions.push(id);
    this.toggleConditions.set(condition.toggleId, toggleConditions);
    // Clear cache for affected toggle
    this.clearToggleCache(condition.toggleId);
    return fullCondition;
  /**
   * Remove a condition
   */
  async removeCondition(conditionId: string): Promise<boolean> { const condition = this.conditions.get(conditionId);
  if (!condition) {
  return false;
  this.conditions.delete(conditionId);
  // Update toggle-condition mapping
  const toggleConditions = this.toggleConditions.get(condition.toggleId) || [];
  const index = toggleConditions.indexOf(conditionId);
  if (index > -1) {
  toggleConditions.splice(index, 1);
  this.toggleConditions.set(condition.toggleId, toggleConditions);
  // Clear cache for affected toggle
  this.clearToggleCache(condition.toggleId);
  return true;
  /**
  * Evaluate all conditions for a toggle
  */
  async evaluateToggle(toggleId: string, context: EvaluationContext): Promise<ToggleEvaluationResult> {
  const startTime = Date.now();
  const conditionIds = this.toggleConditions.get(toggleId) || [];
  if (conditionIds.length === 0) {
  return {
  toggleId
  enabled: false
  conditions: []
  fallbackReason: 'No conditions configured'
  confidence: 0
  metadata: {
  evaluatedAt: new Date()
  totalExecutionTime: Date.now() - startTime
  cacheHit: false }
};
    // Evaluate all conditions
    const conditionResults: ConditionEvaluationResult = [];
    let overallResult = false;
    let variant: string | undefined;
    for (const conditionId of conditionIds) { const condition = this.conditions.get(conditionId);
      if (!condition || !condition.active) {
        continue;
      try {
        const result = await this.evaluateCondition(condition, context);
        conditionResults.push(result);
        // Apply condition logic (OR-based by default)
        if (result.result) {
          overallResult = true;
          // Extract variant for multivariate toggles
          if (condition.conditionType === ConditionType.MULTIVARIATE && result.metadata.intermediateValues?.variant) {
            variant = result.metadata.intermediateValues.variant } catch (error) { const errorMessage = error instanceof Error ? error.message : String(error);
        conditionResults.push({)
  conditionId
          result: false }
          reason: `Evaluation error: ${errorMessage}`}

  executionTime: 0
          metadata: { 
  evaluatedAt: new Date()
  contextHash: this.generateContextHash(context) }
});
    // Calculate confidence based on condition results
    const confidence = this.calculateConfidence(conditionResults);
    return { toggleId
  enabled: overallResult
  variant
  conditions: conditionResults
  confidence
  metadata: {
  evaluatedAt: new Date()
  totalExecutionTime: Date.now() - startTime
  cacheHit: false }
};
  /**
   * Evaluate a single condition
   */
  async evaluateCondition(condition: ToggleCondition, context: EvaluationContext): Promise<ConditionEvaluationResult> {

    const startTime = Date.now();
    const contextHash = this.generateContextHash(context);
    // Check cache first
    const cacheKey = `${condition.id}_${contextHash}`;}
    if (this.config.evaluation.enableCaching) {
      const cached = this.evaluationCache.get(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        return cached;
    let result = false;
    let reason = '';
    const intermediateValues: Record<string, any> = {};
    try {
      switch (condition.conditionType) {
      case ConditionType.USER_ATTRIBUTE:
        result = this.evaluateUserAttribute(condition, context);
        reason = result ? 'User attributes match condition' : 'User attributes do not match';
        break;
      case ConditionType.USER_SEGMENT:
        result = this.evaluateUserSegment(condition, context);
        reason = result ? 'User in target segment' : 'User not in target segment';
        break;
      case ConditionType.PERCENTAGE:
        const percentageResult = this.evaluatePercentage(condition, context);
        result = percentageResult.included;
        intermediateValues.hash = percentageResult.hash;
        intermediateValues.threshold = percentageResult.threshold;
        reason = result ? `Included in ${condition.parameters.percentage}% rollout` : 'Excluded from rollout';}
        break;
      case ConditionType.TIME_WINDOW:
        result = this.evaluateTimeWindow(condition, context);
        reason = result ? 'Within time window' : 'Outside time window';
        break;
      case ConditionType.AB_TEST:
        const abResult = this.evaluateABTest(condition, context);
        result = abResult.included;
        intermediateValues.variant = abResult.variant;
        reason = result ? `Assigned to variant: ${abResult.variant}` : 'Not included in A/B test';}
        break;
      case ConditionType.MULTIVARIATE:
        const mvResult = this.evaluateMultivariate(condition, context);
        result = mvResult.included;
        intermediateValues.variant = mvResult.variant;
        reason = result ? `Assigned to variant: ${mvResult.variant}` : 'Not included in multivariate test';}
        break;
      case ConditionType.CUSTOM_EXPRESSION:
        result = await this.evaluateCustomExpression(condition, context);
        reason = result ? 'Custom expression evaluated to true' : 'Custom expression evaluated to false';
        break;
      case ConditionType.DEPENDENCY:
        result = this.evaluateDependency(condition, context);
        reason = result ? 'Dependencies satisfied' : 'Dependencies not met';
        break;
      case ConditionType.GEOGRAPHIC:
        result = this.evaluateGeographic(condition, context);
        reason = result ? 'Geographic criteria met' : 'Outside target geographic area';
        break;
      case ConditionType.DEVICE_TYPE:
        result = this.evaluateDeviceType(condition, context);
        reason = result ? 'Device type matches' : 'Device type does not match';
        break;
      case ConditionType.TRAFFIC_SPLIT:
        const trafficResult = this.evaluateTrafficSplit(condition, context);
        result = trafficResult.included;
        intermediateValues.bucket = trafficResult.bucket;
        reason = result ? `Traffic split: bucket ${trafficResult.bucket}` : 'Not in target traffic bucket';}
        break;
      case ConditionType.FEATURE_FLAG:
        result = this.evaluateFeatureFlag(condition, context);
        reason = result ? 'Required feature flags active' : 'Required feature flags not active';
        break;
      default:
        throw new Error(`Unknown condition type: ${condition.conditionType}`);}
 catch (error) { result = false;
  reason = error instanceof Error ? error.message : String(error);
  if (this.config.security.enableSecurityAudit) {
  securityAudit.logEvent()
  SecuritySeverity.ERROR
  SecurityEventCategory.EXPRESSION_VALIDATION
  'Condition evaluation failed'
  {
  conditionId: condition.id
  conditionType: condition.conditionType
  error: reason }

          false
        );
    const evaluationResult: ConditionEvaluationResult = { 
  conditionId: condition.id
  result
  reason
  executionTime: Date.now() - startTime
  metadata: {
  evaluatedAt: new Date()
  contextHash }
  intermediateValues
};
    // Cache the result
    if (this.config.evaluation.enableCaching) { this.evaluationCache.set(cacheKey, evaluationResult);
  return evaluationResult;
  /**
  * Get all conditions for a toggle
  */
  getToggleConditions(toggleId: string): ToggleCondition {
  const conditionIds = this.toggleConditions.get(toggleId) || [];
  return conditionIds
  .map(id => this.conditions.get(id))
  .filter((condition): condition is ToggleCondition => condition !== undefined)
  .sort((a, b) => b.priority - a.priority);
  /**
  * Bulk evaluate multiple toggles
  */
  async evaluateToggles(toggleIds: string, context: EvaluationContext): Promise<Map<string, ToggleEvaluationResult>> { }
  const results = new Map<string, ToggleEvaluationResult>();
  const evaluationPromises = toggleIds.map(async (toggleId) => { const result = await this.evaluateToggle(toggleId, context);
  results.set(toggleId, result) });
    await Promise.all(evaluationPromises);
    return results;
  // Private evaluation methods
  private evaluateUserAttribute(condition: ToggleCondition, context: EvaluationContext): boolean { const params = condition.parameters.userAttributes;
    if (!params || !context.user) {
      return false;
    const results = params.attributes.map(attr => {)
  const userValue = context.user?.attributes?.[attr.key];
      return this.compareValues(userValue, attr.operator, attr.value) });
    return params.logic === 'AND' ? results.every(r => r) : results.some(r => r);
  private evaluateUserSegment(condition: ToggleCondition, context: EvaluationContext): boolean {
    const segments = condition.parameters.userSegments;
    if (!segments || !context.user?.segment) {
      return false;
    return segments.includes(context.user.segment);
  private evaluatePercentage(condition: ToggleCondition, context: EvaluationContext): { included: boolean; hash: string; threshold: number } {
    const percentage = condition.parameters.percentage || 0;
    const salt = condition.parameters.salt || this.config.rollout.defaultSalt;
    const userId = context.user?.id || 'anonymous';
    const hash = this.generateHash(`${condition.id}_${userId}_${salt}`);}
    const hashValue = parseInt(hash.substring(0, 8), 16);
    const threshold = (hashValue / 0xFFFFFFFF) * 100;
    return { included: threshold < percentage,
  hash }
  threshold
};
  private evaluateTimeWindow(condition: ToggleCondition, context: EvaluationContext): boolean {
    const now = context.timestamp || new Date();
    const startTime = condition.parameters.startTime;
    const endTime = condition.parameters.endTime;
    const schedule = condition.parameters.schedule;
    // Check basic time window
    if (startTime && now < startTime) return false;
    if (endTime && now > endTime) return false;
    // Check schedule if specified
    if (schedule) {
      const dayOfWeek = now.getDay();
      const hourOfDay = now.getHours();
      if (schedule.daysOfWeek && !schedule.daysOfWeek.includes(dayOfWeek)) {
        return false;
      if (schedule.hoursOfDay && !schedule.hoursOfDay.includes(hourOfDay)) {
        return false;
    return true;
  private evaluateABTest(condition: ToggleCondition, context: EvaluationContext): { included: boolean; variant: string } {
    const experiment = condition.parameters.experiment;
    if (!experiment) {
      return { included: false, variant: 'control' };
    // Check traffic allocation
    const percentageResult = this.evaluatePercentage({ )
  ...condition,
      parameters: {,
  percentage: experiment.trafficAllocation }
        salt: `ab_${experiment.experimentId}`}
    }, context);
    return { included: percentageResult.included,
  variant: percentageResult.included ? experiment.variant : 'control' }
};
  private evaluateMultivariate(condition: ToggleCondition, context: EvaluationContext): { included: boolean; variant: string } {
    // Simplified multivariate logic - would be more complex in full implementation
    const experiment = condition.parameters.experiment;
    if (!experiment) {
      return { included: false, variant: 'default' };
    const percentageResult = this.evaluatePercentage(condition, context);
    return { included: percentageResult.included,
  variant: experiment.variant }
};
  private async evaluateCustomExpression(condition: ToggleCondition, context: EvaluationContext): Promise<boolean> { if (!this.config.security.allowCustomExpressions) {
  return false;
  try {
  // Create safe evaluation context
  const evalContext = {
  user: context.user
  request: context.request
  environment: context.environment
  timestamp: context.timestamp }
  ...condition.parameters.customVariables
};
      const result = await this.expressionEvaluator.evaluate(condition.expression, evalContext);
      return Boolean(result);
 catch (error) {
      if (this.config.evaluation.strictMode) {
        throw error;
      return false;
  private evaluateDependency(condition: ToggleCondition, context: EvaluationContext): boolean {
    const required = condition.parameters.requiredToggles || [];
    const conflicting = condition.parameters.conflictingToggles || [];
    // Check required toggles
    for (const toggleId of required) {
      if (!context.toggles?.[toggleId]) {
        return false;
    // Check conflicting toggles
    for (const toggleId of conflicting) {
      if (context.toggles?.[toggleId]) {
        return false;
    return true;
  private evaluateGeographic(condition: ToggleCondition, context: EvaluationContext): boolean {
    const countries = condition.parameters.countries;
    const regions = condition.parameters.regions;
    const cities = condition.parameters.cities;
    if (countries && context.request?.country) {
      return countries.includes(context.request.country);
    if (regions && context.request?.region) {
      return regions.includes(context.request.region);
    if (cities && context.request?.city) {
      return cities.includes(context.request.city);
    return false;
  private evaluateDeviceType(condition: ToggleCondition, context: EvaluationContext): boolean {
    const deviceTypes = condition.parameters.deviceTypes;
    const platforms = condition.parameters.platforms;
    if (deviceTypes && context.request?.device?.type) {
      return deviceTypes.includes(context.request.device.type);
    if (platforms && context.request?.device?.platform) {
      return platforms.includes(context.request.device.platform);
    return false;
  private evaluateTrafficSplit(condition: ToggleCondition, context: EvaluationContext): { included: boolean; bucket: number } {
    const userId = context.user?.id || 'anonymous';
    const hash = this.generateHash(`traffic_${condition.id}_${userId}`);}
    const bucket = parseInt(hash.substring(0, 2), 16) % 100;
    const percentage = condition.parameters.percentage || 0;
    return { included: bucket < percentage }
  bucket
};
  private evaluateFeatureFlag(condition: ToggleCondition, context: EvaluationContext): boolean { const requiredFlags = condition.parameters.requiredToggles || [];
  return requiredFlags.every(flagId => )
  context.toggles?.[flagId] === true
  );
  // Helper methods
  private compareValues(userValue: any, operator: ComparisonOperator, targetValue: any): boolean {,
  switch (operator) {
  case ComparisonOperator.EQUALS:,
  return userValue === targetValue;
  case ComparisonOperator.NOT_EQUALS:,
  return userValue !== targetValue;
  case ComparisonOperator.GREATER_THAN:,
  return Number(userValue) > Number(targetValue);
  case ComparisonOperator.LESS_THAN:,
  return Number(userValue) < Number(targetValue);
  case ComparisonOperator.GREATER_EQUAL:,
  return Number(userValue) >= Number(targetValue);
  case ComparisonOperator.LESS_EQUAL:,
  return Number(userValue) <= Number(targetValue);
  case ComparisonOperator.CONTAINS:,
  return String(userValue).includes(String(targetValue));
  case ComparisonOperator.NOT_CONTAINS:,
  return !String(userValue).includes(String(targetValue));
  case ComparisonOperator.STARTS_WITH:,
  return String(userValue).startsWith(String(targetValue));
  case ComparisonOperator.ENDS_WITH:,
  return String(userValue).endsWith(String(targetValue));
  case ComparisonOperator.MATCHES_REGEX: }
  try { return new RegExp(String(targetValue)).test(String(userValue)) } catch { return false;
    case ComparisonOperator.IN_LIST:
      return Array.isArray(targetValue) && targetValue.includes(userValue);
    case ComparisonOperator.NOT_IN_LIST: return Array.isArray(targetValue) && !targetValue.includes(userValue) }
  default:
      return false;
  private generateHash(input: string): string {
    // Simple hash function - would use crypto.createHash in full implementation
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    return Math.abs(hash).toString(16);
  private generateConditionId(): string {
    return `cond_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateContextHash(context: EvaluationContext): string { const hashInput = JSON.stringify({)
  userId: context.user?.id,
  segment: context.user?.segment,
  country: context.request?.country,
  device: context.request?.device?.type,
  timestamp: Math.floor((context.timestamp?.getTime() || Date.now()) / 60000) // minute precision }
});
    return this.generateHash(hashInput);
  private calculateConfidence(results: ConditionEvaluationResult): number {
    if (results.length === 0) return 0;
    const successfulEvaluations = results.filter(r => !r.reason.includes('error')).length;
    return successfulEvaluations / results.length;
  private async validateCondition(condition: ToggleCondition): Promise<{ valid: boolean; errors: string; warnings: string }> { const errors: string = [];
  const warnings: string = [];
  // Validate expression for custom expressions
  if (condition.conditionType === ConditionType.CUSTOM_EXPRESSION) {
  try {
  this.expressionEvaluator.validate(condition.expression) } catch (error) {
        errors.push(`Invalid custom expression: ${error}`);}
    // Validate parameters based on condition type
    if (condition.conditionType === ConditionType.PERCENTAGE) { const percentage = condition.parameters.percentage;
  if (percentage === undefined || percentage < 0 || percentage > 100) {
  errors.push('Percentage must be between 0 and 100');
  return {
  valid: errors.length === 0,
  errors }
  warnings
};
  private clearToggleCache(toggleId: string): void {
    const keysToDelete: string = [];
    for (const key of this.evaluationCache.keys()) {
      if (key.startsWith(toggleId)) {
        keysToDelete.push(key);
    keysToDelete.forEach(key => this.evaluationCache.delete(key));
  private cleanupCache(): void {
    const now = Date.now();
    const ttlMs = this.config.evaluation.cacheTimeToLive * 1000;
    for (const [key, result] of this.evaluationCache.entries()) {
      if (now - result.metadata.evaluatedAt.getTime() > ttlMs) {
        this.evaluationCache.delete(key);
  private isCacheValid(result: ConditionEvaluationResult): boolean {
    const now = Date.now();
    const ttlMs = this.config.evaluation.cacheTimeToLive * 1000;
    return now - result.metadata.evaluatedAt.getTime() < ttlMs;

export default ToggleConditionsService;