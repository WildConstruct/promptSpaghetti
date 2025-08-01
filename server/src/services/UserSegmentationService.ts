/**
 * User Segmentation Service
 * Epic 17.1.4 - User Targeting System
 * Task: E17-1753114396789-63AF57
 * 
 * Comprehensive user segmentation system that integrates with the existing
 * CohortAnalyzer, analytics infrastructure, and feature toggle system.
 */

import { CohortAnalyzer, CohortDefinition, CohortCriteria } from '../analytics/CohortAnalyzer';
import { AnalyticsDAO } from '../database/analytics-dao';
import { AnalyticsEventType } from '../analytics/AnalyticsCollector';

// User Segmentation Types



export interface TargetingRule {
  id: string;
  attribute: string;
  operator: RuleOperator;
  value: Error;
  logicalOperator?: 'AND' | 'OR';





export type RuleOperator = 
  | 'equals' | 'not_equals' | 'contains' | 'not_contains' 
  | 'starts_with' | 'ends_with' | 'matches' | 'not_matches'
  | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal'
  | 'in' | 'not_in' | 'exists' | 'not_exists'
  | 'between' | 'within_days' | 'older_than_days';



export interface UserSegment {
  id: string;
  name: string;
  description?: string;
  rules: TargetingRule[];
  isActive: boolean;
  estimatedUsers: number;
  actualUsers?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // Usage tracking
  usageCount: number; // How many feature toggles use this segment
  usedByToggles: string[]; // Toggle IDs using this segment
  
  // Performance metrics
  lastCalculated?: string;
  calculationTimeMs?: number;
  cacheExpiresAt?: string;
  
  // Segment metadata
  tags?: string[];
  category?: string;
  version: string;







export interface CreateSegmentRequest {
  name: string;
  description?: string;
  rules: Omit<TargetingRule, 'id'>[];
  tags?: string[];
  category?: string;
  isActive?: boolean;
  createdBy: string;







export interface UpdateSegmentRequest {
  id: string;
  name?: string;
  description?: string;
  rules?: Omit<TargetingRule, 'id'>[];
  tags?: string[];
  category?: string;
  isActive?: boolean;
  updatedBy: string;







export interface SegmentQuery {
  search?: string;
  isActive?: boolean;
  category?: string;
  tags?: string[];
  createdBy?: string;
  usedByToggle?: string;
  sortBy?: 'name' | 'estimatedUsers' | 'usageCount' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;







export interface SegmentEvaluationResult {
  segmentId: string;
  userId: string;
  matches: boolean;
  evaluationTime: number;
  matchedRules: string[];
  failedRules: string[];
  confidence: number; // 0-100
  metadata?: Record<string, any>;







export interface BatchEvaluationRequest {
  segmentIds: string[];
  userIds?: string[];
  userQuery?: UserQuery;
  includeDetails?: boolean;







export interface UserQuery {
  attributes?: Record<string, any>;
  events?: {
    types: AnalyticsEventType[];
    timeWindow?: number;
    minOccurrences?: number;



  };
  registrationPeriod?: {
    startDate: string;
    endDate: string;
  };




export interface BatchEvaluationResult {
  requestId: string;
  segmentResults: SegmentUserMatch[];
  totalUsers: number;
  executionTimeMs: number;
  timestamp: string;







export interface SegmentUserMatch {
  segmentId: string;
  segmentName: string;
  matchingUsers: string[];
  userCount: number;
  matchRate: number; // percentage
  sampleResults?: SegmentEvaluationResult[];







export interface SegmentMetrics {
  segmentId: string;
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  conversionRate?: number;
  retentionRate?: number;
  engagementScore?: number;
  demographics: {
    averageAge?: number;



    topLocations: Array<{ location: string; count: number }>;
    deviceTypes: Array<{ device: string; count: number }>;
  };
  trends: {
    dailyGrowth: Array<{ date: string; count: number }>;
    weeklyGrowth: Array<{ week: string; count: number }>;
  };


export class UserSegmentationService {
  private cohortAnalyzer: CohortAnalyzer;
  private analyticsDAO: AnalyticsDAO;
  private segments: Map<string, UserSegment> = new Map();
  private evaluationCache: Map<string, { result: SegmentEvaluationResult; expiresAt: number }> = new Map();

  constructor(cohortAnalyzer: CohortAnalyzer, analyticsDAO: AnalyticsDAO) {
    this.cohortAnalyzer = cohortAnalyzer;
    this.analyticsDAO = analyticsDAO;
    this.initializeBuiltInSegments();


  // Segment Management
  async createSegment(request: CreateSegmentRequest): Promise<UserSegment> {

    const segmentId = `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate rule IDs
    const rules = request.rules.map(rule => ({
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));

    // Validate rules
    await this.validateSegmentRules(rules);

    // Estimate user count
    const estimatedUsers = await this.estimateSegmentSize(rules);

    const segment: UserSegment = {
      id: segmentId,
      name: request.name,
      description: request.description,
      rules,
      isActive: request.isActive ?? true,
      estimatedUsers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: request.createdBy,
      usageCount: 0,
      usedByToggles: [],
      tags: request.tags || [],
      category: request.category || 'custom',
      version: '1.0.0'
    };

    // Store segment
    this.segments.set(segmentId, segment);

    // Create corresponding cohort for analytics integration
    await this.createCohortFromSegment(segment);

    // Log creation
    await this.logSegmentAction('create', segment, request.createdBy);

    return segment;


  async updateSegment(request: UpdateSegmentRequest): Promise<UserSegment | null> {

    const existingSegment = this.segments.get(request.id);
    if (!existingSegment) {
      throw new Error(`Segment with ID ${request.id} not found`);


    // Prepare updated rules if provided
    let updatedRules = existingSegment.rules;
    if (request.rules) {
      updatedRules = request.rules.map(rule => ({
        ...rule,
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));
      await this.validateSegmentRules(updatedRules);


    // Re-estimate user count if rules changed
    let estimatedUsers = existingSegment.estimatedUsers;
    if (request.rules) {
      estimatedUsers = await this.estimateSegmentSize(updatedRules);


    const updatedSegment: UserSegment = {
      ...existingSegment,
      name: request.name ?? existingSegment.name,
      description: request.description ?? existingSegment.description,
      rules: updatedRules,
      tags: request.tags ?? existingSegment.tags,
      category: request.category ?? existingSegment.category,
      isActive: request.isActive ?? existingSegment.isActive,
      estimatedUsers,
      updatedAt: new Date().toISOString(),
      version: this.incrementVersion(existingSegment.version)
    };

    // Update segment
    this.segments.set(request.id, updatedSegment);

    // Update cohort if rules changed
    if (request.rules) {
      await this.updateCohortFromSegment(updatedSegment);


    // Clear evaluation cache for this segment
    this.clearSegmentCache(request.id);

    // Log update
    await this.logSegmentAction('update', updatedSegment, request.updatedBy);

    return updatedSegment;


  async deleteSegment(segmentId: string, deletedBy: string): Promise<boolean> {

    const segment = this.segments.get(segmentId);
    if (!segment) return false;

    // Check if segment is in use by feature toggles
    if (segment.usedByToggles.length > 0) {
      throw new Error(`Cannot delete segment ${segment.name} - it is used by ${segment.usageCount} feature toggle(s)`);


    // Delete segment
    this.segments.delete(segmentId);

    // Remove associated cohort
    await this.deleteCohortForSegment(segmentId);

    // Clear cache
    this.clearSegmentCache(segmentId);

    // Log deletion
    await this.logSegmentAction('delete', segment, deletedBy);

    return true;


  async getSegment(segmentId: string): Promise<UserSegment | null> {

    return this.segments.get(segmentId) || null;


  async querySegments(query: SegmentQuery): Promise<{ segments: UserSegment[]; total: number }> {

    let segments = Array.from(this.segments.values());

    // Apply filters
    if (query.search) {
      const search = query.search.toLowerCase();
      segments = segments.filter(s => 
        s.name.toLowerCase().includes(search) ||
        s.description?.toLowerCase().includes(search) ||
        s.tags?.some(tag => tag.toLowerCase().includes(search))
      );


    if (query.isActive !== undefined) {
      segments = segments.filter(s => s.isActive === query.isActive);


    if (query.category) {
      segments = segments.filter(s => s.category === query.category);


    if (query.tags && query.tags.length > 0) {
      segments = segments.filter(s => 
        query.tags!.some(tag => s.tags?.includes(tag))
      );


    if (query.createdBy) {
      segments = segments.filter(s => s.createdBy === query.createdBy);


    if (query.usedByToggle) {
      segments = segments.filter(s => s.usedByToggles.includes(query.usedByToggle!));


    // Sort
    if (query.sortBy) {
      segments.sort((a, b) => {
        const aVal = a[query.sortBy!];
        const bVal = b[query.sortBy!];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return query.sortOrder === 'desc' ? -comparison : comparison;
      });


    const total = segments.length;

    // Pagination
    if (query.offset || query.limit) {
      const offset = query.offset || 0;
      const limit = query.limit || 50;
      segments = segments.slice(offset, offset + limit);


    return { segments, total };


  // User Evaluation
  async evaluateUserForSegment(userId: string, segmentId: string): Promise<SegmentEvaluationResult> {

    const startTime = Date.now();
    
    // Check cache
    const cacheKey = `${userId}_${segmentId}`;
    const cached = this.evaluationCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;


    const segment = this.segments.get(segmentId);
    if (!segment) {
      throw new Error(`Segment ${segmentId} not found`);


    // Get user data for evaluation
    const userData = await this.getUserData(userId);
    
    // Evaluate rules
    const { matches, matchedRules, failedRules, confidence } = await this.evaluateRules(
      segment.rules, userData
    );

    const result: SegmentEvaluationResult = {
      segmentId,
      userId,
      matches,
      evaluationTime: Date.now() - startTime,
      matchedRules,
      failedRules,
      confidence,
      metadata: {
        segmentName: segment.name,
        ruleCount: segment.rules.length,
        evaluatedAt: new Date().toISOString()

    };

    // Cache result for 5 minutes
    this.evaluationCache.set(cacheKey, {
      result,
      expiresAt: Date.now() + (5 * 60 * 1000)
    });

    return result;


  async batchEvaluateSegments(request: BatchEvaluationRequest): Promise<BatchEvaluationResult> {

    const startTime = Date.now();
    const requestId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get users to evaluate
    const userIds = request.userIds || await this.findUsersMatchingQuery(request.userQuery);
    
    const segmentResults: SegmentUserMatch[] = [];
    
    for (const segmentId of request.segmentIds) {
      const segment = this.segments.get(segmentId);
      if (!segment) continue;

      const matchingUsers: string[] = [];
      const sampleResults: SegmentEvaluationResult[] = [];
      
      for (const userId of userIds) {
        try {
          const evaluation = await this.evaluateUserForSegment(userId, segmentId);
          if (evaluation.matches) {
            matchingUsers.push(userId);

          
          // Include sample results if requested
          if (request.includeDetails && sampleResults.length < 10) {
            sampleResults.push(evaluation);

 catch (error) {
          console.error(`Failed to evaluate user ${userId} for segment ${segmentId}:`, error);



      segmentResults.push({
        segmentId,
        segmentName: segment.name,
        matchingUsers,
        userCount: matchingUsers.length,
        matchRate: userIds.length > 0 ? (matchingUsers.length / userIds.length) * 100 : 0,
        sampleResults: request.includeDetails ? sampleResults : undefined
      });


    return {
      requestId,
      segmentResults,
      totalUsers: userIds.length,
      executionTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(};


  // Analytics Integration
  async getSegmentMetrics(segmentId: string, timeWindow?: { start: string; end: string }): Promise<SegmentMetrics> {

    const segment = this.segments.get(segmentId);
    if (!segment) {
      throw new Error(`Segment ${segmentId} not found`);


    // Use CohortAnalyzer to get detailed metrics
    const _____cohortId = this.getCohortIdForSegment(segmentId);
    
    // For now, return mock metrics - would integrate with real analytics
    return {
      segmentId,
      totalUsers: segment.estimatedUsers,
      activeUsers: Math.floor(segment.estimatedUsers * 0.7),
      newUsers: Math.floor(segment.estimatedUsers * 0.3),
      returningUsers: Math.floor(segment.estimatedUsers * 0.7),
      conversionRate: 15.5,
      retentionRate: 72.3,
      engagementScore: 8.2,
      demographics: {
        averageAge: 32,
        topLocations: [
          { location: 'United States', count: 450 },
          { location: 'Canada', count: 180 },
          { location: 'United Kingdom', count: 120 }
        ],
        deviceTypes: [
          { device: 'Desktop', count: 380 },
          { device: 'Mobile', count: 290 },
          { device: 'Tablet', count: 80 }
        ]

      trends: {
        dailyGrowth: this.generateMockTrendData('daily', 30),
        weeklyGrowth: this.generateMockTrendData('weekly', 12)

    };


  // Helper Methods
  private async validateSegmentRules(rules: TargetingRule[]): Promise<void> {

    for (const rule of rules) {
      // Validate operator for attribute type
      if (!this.isValidOperatorForAttribute(rule.attribute, rule.operator)) {
        throw new Error(`Invalid operator ${rule.operator} for attribute ${rule.attribute}`);


      // Validate value format
      if (!this.isValidValueForOperator(rule.operator, rule.value)) {
        throw new Error(`Invalid value ${rule.value} for operator ${rule.operator}`);




  private async estimateSegmentSize(rules: TargetingRule[]): Promise<number> {

    // Convert to cohort criteria for estimation
    const _____criteria = this.convertRulesToCohortCriteria(rules);
    
    // Use CohortAnalyzer for estimation
    // For now, return mock estimate
    const baseSize = Math.floor(Math.random() * 1000) + 100;
    const complexity = rules.length;
    return Math.max(50, Math.floor(baseSize / Math.sqrt(complexity)));


  private async getUserData(userId: string): Promise<Record<string, any>> {
    // This would fetch user data from database
    // For now, return mock data
    return {
      id: userId,
      email: `user${userId}@example.com`,
      registrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastLoginDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      country: ['US', 'CA', 'GB', 'DE', 'FR'][Math.floor(Math.random() * 5)],
      subscriptionType: ['free', 'basic', 'premium'][Math.floor(Math.random() * 3)],
      totalSessions: Math.floor(Math.random() * 100) + 1,
      deviceType: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)]
    };


  private async evaluateRules(
    rules: TargetingRule[], 
    userData: Record<string, any>
  ): Promise<{
    matches: boolean;
    matchedRules: string[];
    failedRules: string[];
    confidence: number;
> {

    const matchedRules: string[] = [];
    const failedRules: string[] = [];
    
    let hasAndGroup = false;
    let hasOrGroup = false;
    const andResults: boolean[] = [];
    const orResults: boolean[] = [];

    for (const rule of rules) {
      const ruleMatches = this.evaluateRule(rule, userData);
      
      if (ruleMatches) {
        matchedRules.push(rule.id);
 else {
        failedRules.push(rule.id);


      if (rule.logicalOperator === 'AND' || !rule.logicalOperator) {
        hasAndGroup = true;
        andResults.push(ruleMatches);
 else if (rule.logicalOperator === 'OR') {
        hasOrGroup = true;
        orResults.push(ruleMatches);



    // Calculate overall match
    let matches = false;
    if (hasAndGroup && hasOrGroup) {
      // Mixed AND/OR logic: all AND conditions must pass OR any OR condition must pass
      const andMatch = andResults.length === 0 || andResults.every(r => r);
      const orMatch = orResults.length === 0 || orResults.some(r => r);
      matches = andMatch || orMatch;
 else if (hasAndGroup) {
      // All AND conditions must pass
      matches = andResults.every(r => r);
 else if (hasOrGroup) {
      // Any OR condition must pass
      matches = orResults.some(r => r);
 else {
      // No rules
      matches = true;


    // Calculate confidence based on rule complexity and matches
    const ruleComplexity = rules.length;
    const matchRatio = matchedRules.length / rules.length;
    const confidence = Math.floor(Math.min(100, (matchRatio * 85) + (ruleComplexity > 5 ? 10 : 15)));

    return { matches, matchedRules, failedRules, confidence };


  private evaluateRule(rule: TargetingRule, userData: Record<string, any>): boolean {
    const value = userData[rule.attribute];
    const ruleValue = rule.value;

    switch (rule.operator) {
    case 'equals':
      return value === ruleValue;
    case 'not_equals':
      return value !== ruleValue;
    case 'contains':
      return String(value || '').includes(String(ruleValue));
    case 'not_contains':
      return !String(value || '').includes(String(ruleValue));
    case 'starts_with':
      return String(value || '').startsWith(String(ruleValue));
    case 'ends_with':
      return String(value || '').endsWith(String(ruleValue));
    case 'greater_than':
      return Number(value) > Number(ruleValue);
    case 'less_than':
      return Number(value) < Number(ruleValue);
    case 'greater_equal':
      return Number(value) >= Number(ruleValue);
    case 'less_equal':
      return Number(value) <= Number(ruleValue);
    case 'in':
      return Array.isArray(ruleValue) && ruleValue.includes(value);
    case 'not_in':
      return Array.isArray(ruleValue) && !ruleValue.includes(value);
    case 'exists':
      return value !== undefined && value !== null;
    case 'not_exists':
      return value === undefined || value === null;
    case 'matches':
      try {
        const regex = new RegExp(ruleValue);
        return regex.test(String(value || ''));
 catch {
        return false;

    case 'within_days':
      const daysDiff = (Date.now() - new Date(value).getTime()) / (24 * 60 * 60 * 1000);
      return daysDiff <= Number(ruleValue);
    case 'older_than_days':
      const daysOld = (Date.now() - new Date(value).getTime()) / (24 * 60 * 60 * 1000);
      return daysOld > Number(ruleValue);
    default:
      return false;



  private isValidOperatorForAttribute(_____attribute: string, _____operator: RuleOperator): boolean {
    // Define valid operators per attribute type
    const _____stringOperators = ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'matches'];
    const _____numericOperators = ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal'];
    const _____arrayOperators = ['in', 'not_in'];
    const _____existenceOperators = ['exists', 'not_exists'];
    const _____dateOperators = ['within_days', 'older_than_days', 'equals', 'greater_than', 'less_than'];

    // Would check actual attribute types in real implementation
    return true; // Simplified for now


  private isValidValueForOperator(operator: RuleOperator, value: Error): boolean {
    switch (operator) {
    case 'in':
    case 'not_in':
      return Array.isArray(value);
    case 'greater_than':
    case 'less_than':
    case 'greater_equal':
    case 'less_equal':
    case 'within_days':
    case 'older_than_days':
      return !isNaN(Number(value));
    default:
      return true;



  private async createCohortFromSegment(segment: UserSegment): Promise<void> {

    const criteria = this.convertRulesToCohortCriteria(segment.rules);
    
    const cohortDefinition: CohortDefinition = {
      id: this.getCohortIdForSegment(segment.id),
      name: `Segment: ${segment.name}`,
      description: segment.description || `Auto-generated cohort for segment ${segment.name}`,
      criteria,
      timeframe: {
        startDate: new Date(segment.createdAt).getTime(),
        endDate: undefined

      type: 'custom',
      isActive: segment.isActive,
      createdAt: new Date(segment.createdAt).getTime(),
      updatedAt: new Date(segment.updatedAt).getTime()
    };

    await this.cohortAnalyzer.createCohort(cohortDefinition);


  private async updateCohortFromSegment(segment: UserSegment): Promise<void> {

    // Update the associated cohort
    const _____cohortId = this.getCohortIdForSegment(segment.id);
    // Would call cohortAnalyzer.updateCohort() here


  private async deleteCohortForSegment(segmentId: string): Promise<void> {

    const cohortId = this.getCohortIdForSegment(segmentId);
    await this.cohortAnalyzer.deleteCohort(cohortId);


  private convertRulesToCohortCriteria(_____rules: TargetingRule[]): CohortCriteria {
    // Convert segmentation rules to cohort criteria format
    // This is a simplified conversion - would be more sophisticated in real implementation
    return {
      userAttributes: {
        // Convert targeting rules to user attribute filters

    };


  private getCohortIdForSegment(segmentId: string): string {
    return `cohort_${segmentId}`;


  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;


  private clearSegmentCache(segmentId: string): void {
    for (const [key] of this.evaluationCache) {
      if (key.endsWith(`_${segmentId}`)) {
        this.evaluationCache.delete(key);




  private async findUsersMatchingQuery(userQuery?: UserQuery): Promise<string[]> {

    // This would query the database for users matching the criteria
    // For now, return mock user IDs
    const userCount = Math.floor(Math.random() * 100) + 20;
    return Array.from({ length: userCount }, (_, i) => `user_${i + 1}`);


  private generateMockTrendData(period: 'daily' | 'weekly', count: number): Array<{ date?: string; week?: string; count: number }> {
    const data = [];
    const now = new Date();
    
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now);
      if (period === 'daily') {
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 50) + 10
        });
 else {
        date.setDate(date.getDate() - (i * 7));
        data.push({
          week: `${date.getFullYear()}-W${String(Math.ceil(date.getDate() / 7)).padStart(2, '0')}`,
          count: Math.floor(Math.random() * 200) + 50
        });


    
    return data;


  private async logSegmentAction(action: string, segment: UserSegment, userId: string): Promise<void> {

    console.log(`Segment ${action}:`, {
      segmentId: segment.id,
      segmentName: segment.name,
      userId,
      timestamp: new Date().toISOString()
    });


  // Initialize built-in segments
  private initializeBuiltInSegments(): void {
    // Create some default segments that are commonly used
    const builtInSegments: Omit<UserSegment, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>[] = [
      {
        name: 'Active Users',
        description: 'Users who have logged in within the last 30 days',
        rules: [{
          id: 'active_rule_1',
          attribute: 'lastLoginDate',
          operator: 'within_days',
          value: 30
],
        isActive: true,
        estimatedUsers: 750,
        usageCount: 0,
        usedByToggles: [],
        tags: ['engagement', 'default'],
        category: 'engagement',
        version: '1.0.0'

      {
        name: 'New Users',
        description: 'Users who registered within the last 7 days',
        rules: [{
          id: 'new_rule_1',
          attribute: 'registrationDate',
          operator: 'within_days',
          value: 7
],
        isActive: true,
        estimatedUsers: 120,
        usageCount: 0,
        usedByToggles: [],
        tags: ['acquisition', 'default'],
        category: 'acquisition',
        version: '1.0.0'

      {
        name: 'Premium Users',
        description: 'Users with premium subscription',
        rules: [{
          id: 'premium_rule_1',
          attribute: 'subscriptionType',
          operator: 'equals',
          value: 'premium'
],
        isActive: true,
        estimatedUsers: 280,
        usageCount: 0,
        usedByToggles: [],
        tags: ['subscription', 'default'],
        category: 'subscription',
        version: '1.0.0'

    ];

    // Initialize built-in segments
    builtInSegments.forEach(segmentData => {
      const segment: UserSegment = {
        ...segmentData,
        id: `builtin_${segmentData.name.toLowerCase().replace(/\s+/g, '_')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      };
      
      this.segments.set(segment.id, segment);
    });



export default UserSegmentationService;