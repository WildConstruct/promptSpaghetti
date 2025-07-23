/**
 * Segment Testing Service
 * Epic 17.1.4 - User Targeting System
 * Task: E17-1753114396793-C49ACF
 * 
 * Comprehensive segment testing framework with validation, performance testing,
 * A/B testing integration, and real-time analysis capabilities.
 */

import { UserSegmentationService, TargetingRule, UserSegment, SegmentEvaluationResult } from './UserSegmentationService';
import { CohortAnalyzer } from '../analytics/CohortAnalyzer';
import { AnalyticsDAO } from '../database/analytics-dao';

// Segment Testing Types
export type TestType = 
  | 'validation'        // Validate rule logic and syntax
  | 'performance'       // Test query performance at scale
  | 'accuracy'          // Test segment accuracy against known data
  | 'overlap'           // Test segment overlap analysis
  | 'stability'         // Test segment stability over time
  | 'integration'       // Test integration with feature toggles
  | 'load'              // Load testing with high user volume
  | 'regression';       // Regression testing after changes

export type TestStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export type TestSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SegmentTest {
  id: string;
  name: string;
  description?: string;
  testType: TestType;
  segmentId: string;
  segmentSnapshot: UserSegment;
  
  // Test Configuration
  config: TestConfiguration;
  expectations?: TestExpectation[];
  
  // Execution Details
  status: TestStatus;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  
  // Results
  results?: TestResult;
  errors?: TestError[];
  
  // Metadata
  createdBy: string;
  createdAt: string;
  version: string;
}

export interface TestConfiguration {
  // Sample Configuration
  sampleSize?: number;
  sampleMethod?: 'random' | 'stratified' | 'systematic';
  
  // Performance Testing
  maxExecutionTime?: number; // milliseconds
  concurrentUsers?: number;
  iterationCount?: number;
  
  // Accuracy Testing
  goldStandardData?: GoldStandardEntry[];
  toleranceThreshold?: number; // percentage
  
  // Load Testing
  rampUpDuration?: number;
  sustainedLoad?: number;
  
  // Comparison Testing
  compareWithSegments?: string[];
  baselineMetrics?: Record<string, number>;
  
  // General Settings
  includeDebugInfo?: boolean;
  failOnWarnings?: boolean;
  timeoutMs?: number;
}

export interface TestExpectation {
  id: string;
  description: string;
  metric: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'not_equals';
  expectedValue: number | [number, number];
  severity: TestSeverity;
  failureMessage?: string;
}

export interface TestResult {
  testId: string;
  status: 'passed' | 'failed' | 'warning';
  score: number; // 0-100
  
  // Core Metrics
  executionTime: number;
  memoryUsage?: number;
  usersTested: number;
  matchingUsers: number;
  matchRate: number;
  
  // Performance Metrics
  averageQueryTime?: number;
  peakQueryTime?: number;
  queryCount?: number;
  throughput?: number; // queries per second
  
  // Accuracy Metrics
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  
  // Overlap Analysis
  overlapAnalysis?: OverlapAnalysis;
  
  // Stability Metrics
  stabilityScore?: number;
  variance?: number;
  
  // Integration Results
  integrationResults?: IntegrationTestResult[];
  
  // Detailed Results
  sampleResults?: SegmentEvaluationResult[];
  errorRate?: number;
  warnings: TestWarning[];
  recommendations: string[];
  
  // Raw Data
  rawMetrics?: Record<string, any>;
  testLogs?: string[];
}

export interface GoldStandardEntry {
  userId: string;
  expectedMatch: boolean;
  reason?: string;
  confidence?: number;
}

export interface OverlapAnalysis {
  totalUsers: number;
  overlappingSegments: Array<{
    segmentId: string;
    segmentName: string;
    overlapCount: number;
    overlapPercentage: number;
    jaccard: number; // Jaccard similarity coefficient
  }>;
  uniqueUsers: number;
  exclusiveUsers: number;
}

export interface IntegrationTestResult {
  testName: string;
  passed: boolean;
  details: string;
  executionTime: number;
}

export interface TestError {
  id: string;
  code: string;
  message: string;
  severity: TestSeverity;
  timestamp: string;
  context?: Record<string, any>;
  stackTrace?: string;
}

export interface TestWarning {
  id: string;
  message: string;
  severity: TestSeverity;
  suggestion?: string;
}

export interface BatchTestRequest {
  testConfigs: Array<{
    segmentId: string;
    testTypes: TestType[];
    config?: Partial<TestConfiguration>;
  }>;
  runInParallel?: boolean;
  maxConcurrency?: number;
  stopOnFailure?: boolean;
  createdBy: string;
}

export interface BatchTestResult {
  batchId: string;
  tests: SegmentTest[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    avgExecutionTime: number;
    totalDuration: number;
  };
  timestamp: string;
}

export interface TestReport {
  segmentId: string;
  segmentName: string;
  reportType: 'summary' | 'detailed' | 'comparison';
  generatedAt: string;
  
  // Summary Statistics
  totalTests: number;
  passRate: number;
  avgScore: number;
  recentTrends: Array<{
    date: string;
    testsRun: number;
    passRate: number;
    avgScore: number;
  }>;
  
  // Test Breakdown
  testsByType: Record<TestType, {
    count: number;
    passRate: number;
    avgScore: number;
  }>;
  
  // Performance Insights
  performanceInsights: {
    avgExecutionTime: number;
    performanceTrend: 'improving' | 'stable' | 'degrading';
    bottlenecks: string[];
  };
  
  // Quality Assessment
  qualityScore: number;
  recommendations: string[];
  criticalIssues: string[];
  
  // Historical Data
  tests: SegmentTest[];
}

export class SegmentTestingService {
  private segmentationService: UserSegmentationService;
  private cohortAnalyzer: CohortAnalyzer;
  private analyticsDAO: AnalyticsDAO;
  private activeTests: Map<string, SegmentTest> = new Map();
  private testHistory: Map<string, SegmentTest[]> = new Map();

  constructor(
    segmentationService: UserSegmentationService,
    cohortAnalyzer: CohortAnalyzer,
    analyticsDAO: AnalyticsDAO
  ) {
    this.segmentationService = segmentationService;
    this.cohortAnalyzer = cohortAnalyzer;
    this.analyticsDAO = analyticsDAO;
  }

  // Test Creation and Management
  async createTest(request: {
    name: string;
    description?: string;
    testType: TestType;
    segmentId: string;
    config?: TestConfiguration;
    expectations?: Omit<TestExpectation, 'id'>[];
    createdBy: string;
  }): Promise<SegmentTest> {
    const segment = await this.segmentationService.getSegment(request.segmentId);
    if (!segment) {
      throw new Error(`Segment ${request.segmentId} not found`);
    }

    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate expectation IDs
    const expectations = request.expectations?.map(exp => ({
      ...exp,
      id: `expectation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));

    const test: SegmentTest = {
      id: testId,
      name: request.name,
      description: request.description,
      testType: request.testType,
      segmentId: request.segmentId,
      segmentSnapshot: { ...segment }, // Snapshot current state
      config: this.getDefaultConfigForTestType(request.testType, request.config),
      expectations,
      status: 'pending',
      createdBy: request.createdBy,
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    };

    this.activeTests.set(testId, test);
    await this.logTestAction('create', test);

    return test;
  }

  async runTest(testId: string): Promise<SegmentTest> {
    const test = this.activeTests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    if (test.status === 'running') {
      throw new Error(`Test ${testId} is already running`);
    }

    // Update status
    test.status = 'running';
    test.startedAt = new Date().toISOString();
    this.activeTests.set(testId, test);

    try {
      // Run the test based on type
      const results = await this.executeTest(test);
      
      // Evaluate expectations
      const expectationResults = await this.evaluateExpectations(test, results);
      
      // Determine overall status
      const hasFailures = expectationResults.some(e => !e.passed && e.severity === 'critical');
      const hasWarnings = expectationResults.some(e => !e.passed && e.severity !== 'critical');
      
      test.status = hasFailures ? 'failed' : 'completed';
      test.completedAt = new Date().toISOString();
      test.duration = Date.now() - new Date(test.startedAt!).getTime();
      test.results = {
        ...results,
        status: hasFailures ? 'failed' : hasWarnings ? 'warning' : 'passed'
      };

      this.activeTests.set(testId, test);

      // Archive test results
      await this.archiveTest(test);

      await this.logTestAction('complete', test);

      return test;

    } catch (error) {
      test.status = 'failed';
      test.completedAt = new Date().toISOString();
      test.duration = test.startedAt ? Date.now() - new Date(test.startedAt).getTime() : 0;
      test.errors = [{
        id: `error_${Date.now()}`,
        code: 'TEST_EXECUTION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        severity: 'critical',
        timestamp: new Date().toISOString(),
        stackTrace: error instanceof Error ? error.stack : undefined
      }];

      this.activeTests.set(testId, test);
      await this.logTestAction('fail', test);

      throw error;
    }
  }

  async cancelTest(testId: string): Promise<boolean> {
    const test = this.activeTests.get(testId);
    if (!test) return false;

    if (test.status !== 'running') {
      throw new Error(`Cannot cancel test ${testId} - current status: ${test.status}`);
    }

    test.status = 'cancelled';
    test.completedAt = new Date().toISOString();
    test.duration = test.startedAt ? Date.now() - new Date(test.startedAt).getTime() : 0;

    this.activeTests.set(testId, test);
    await this.logTestAction('cancel', test);

    return true;
  }

  // Batch Testing
  async runBatchTests(request: BatchTestRequest): Promise<BatchTestResult> {
    const startTime = Date.now();
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const tests: SegmentTest[] = [];
    
    // Create all tests first
    for (const testConfig of request.testConfigs) {
      for (const testType of testConfig.testTypes) {
        const test = await this.createTest({
          name: `${testType} test for ${testConfig.segmentId}`,
          testType,
          segmentId: testConfig.segmentId,
          config: testConfig.config,
          createdBy: request.createdBy
        });
        tests.push(test);
      }
    }

    // Run tests
    const results: SegmentTest[] = [];
    const concurrency = request.maxConcurrency || (request.runInParallel ? 3 : 1);

    if (request.runInParallel) {
      // Run in batches with concurrency limit
      for (let i = 0; i < tests.length; i += concurrency) {
        const batch = tests.slice(i, i + concurrency);
        const batchPromises = batch.map(test => this.runTest(test.id));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Stop on failure if requested
        if (request.stopOnFailure && batchResults.some(t => t.status === 'failed')) {
          break;
        }
      }
    } else {
      // Run sequentially
      for (const test of tests) {
        const result = await this.runTest(test.id);
        results.push(result);

        if (request.stopOnFailure && result.status === 'failed') {
          break;
        }
      }
    }

    // Calculate summary
    const passed = results.filter(t => t.results?.status === 'passed').length;
    const failed = results.filter(t => t.results?.status === 'failed').length;
    const warnings = results.filter(t => t.results?.status === 'warning').length;
    const avgExecutionTime = results.reduce((sum, t) => sum + (t.duration || 0), 0) / results.length;

    return {
      batchId,
      tests: results,
      summary: {
        total: results.length,
        passed,
        failed,
        warnings,
        avgExecutionTime,
        totalDuration: Date.now() - startTime
      },
      timestamp: new Date().toISOString()
    };
  }

  // Test Execution by Type
  private async executeTest(test: SegmentTest): Promise<TestResult> {
    switch (test.testType) {
    case 'validation':
      return await this.runValidationTest(test);
    case 'performance':
      return await this.runPerformanceTest(test);
    case 'accuracy':
      return await this.runAccuracyTest(test);
    case 'overlap':
      return await this.runOverlapTest(test);
    case 'stability':
      return await this.runStabilityTest(test);
    case 'integration':
      return await this.runIntegrationTest(test);
    case 'load':
      return await this.runLoadTest(test);
    case 'regression':
      return await this.runRegressionTest(test);
    default:
      throw new Error(`Unknown test type: ${test.testType}`);
    }
  }

  private async runValidationTest(test: SegmentTest): Promise<TestResult> {
    const startTime = Date.now();
    const warnings: TestWarning[] = [];
    const recommendations: string[] = [];
    
    const segment = test.segmentSnapshot;
    let score = 100;

    // Rule validation
    for (const rule of segment.rules) {
      // Check for common issues
      if (rule.operator === 'matches' && typeof rule.value === 'string') {
        try {
          new RegExp(rule.value);
        } catch {
          score -= 20;
          warnings.push({
            id: `warning_${Date.now()}`,
            message: `Invalid regex pattern in rule ${rule.id}`,
            severity: 'high',
            suggestion: 'Fix the regular expression syntax'
          });
        }
      }

      // Check for logical issues
      if (rule.operator === 'exists' && rule.value !== undefined) {
        score -= 5;
        warnings.push({
          id: `warning_${Date.now()}`,
          message: `Rule ${rule.id} uses 'exists' operator with a value`,
          severity: 'medium',
          suggestion: 'Exists operator should not have a value'
        });
      }
    }

    // Check for rule conflicts
    const conflictingRules = this.findConflictingRules(segment.rules);
    if (conflictingRules.length > 0) {
      score -= 30;
      warnings.push({
        id: `warning_${Date.now()}`,
        message: `Found ${conflictingRules.length} conflicting rule(s)`,
        severity: 'high',
        suggestion: 'Review and resolve rule conflicts'
      });
    }

    // Performance recommendations
    if (segment.rules.length > 10) {
      recommendations.push('Consider breaking down complex segments into smaller, more focused segments');
    }

    if (segment.rules.some(r => r.operator === 'matches')) {
      recommendations.push('Regular expression rules may impact performance - consider using simpler operators when possible');
    }

    return {
      testId: test.id,
      status: score >= 70 ? 'passed' : 'failed',
      score: Math.max(0, score),
      executionTime: Date.now() - startTime,
      usersTested: 0,
      matchingUsers: 0,
      matchRate: 0,
      warnings,
      recommendations
    };
  }

  private async runPerformanceTest(test: SegmentTest): Promise<TestResult> {
    const startTime = Date.now();
    const config = test.config;
    const sampleSize = config.sampleSize || 1000;
    const _____maxTime = config.maxExecutionTime || 5000;
    
    const queryTimes: number[] = [];
    const errors: number[] = [];
    
    // Generate test users
    const testUserIds = Array.from({ length: sampleSize }, (_, i) => `test_user_${i}`);
    
    let matchingUsers = 0;
    
    for (const userId of testUserIds) {
      const queryStart = Date.now();
      try {
        const result = await this.segmentationService.evaluateUserForSegment(userId, test.segmentId);
        const queryTime = Date.now() - queryStart;
        queryTimes.push(queryTime);
        
        if (result.matches) {
          matchingUsers++;
        }
      } catch (error) {
        errors.push(Date.now() - queryStart);
      }
    }

    const avgQueryTime = queryTimes.reduce((sum, time) => sum + time, 0) / queryTimes.length;
    const peakQueryTime = Math.max(...queryTimes);
    const errorRate = errors.length / sampleSize;
    const throughput = sampleSize / ((Date.now() - startTime) / 1000);
    
    let score = 100;
    const warnings: TestWarning[] = [];
    const recommendations: string[] = [];

    // Performance scoring
    if (avgQueryTime > 100) {
      score -= 30;
      warnings.push({
        id: `warning_${Date.now()}`,
        message: `Average query time ${avgQueryTime}ms exceeds recommended 100ms`,
        severity: 'high',
        suggestion: 'Optimize segment rules for better performance'
      });
    }

    if (errorRate > 0.01) {
      score -= 40;
      warnings.push({
        id: `warning_${Date.now()}`,
        message: `Error rate ${(errorRate * 100).toFixed(2)}% is too high`,
        severity: 'high',
        suggestion: 'Fix segment rule errors'
      });
    }

    if (throughput < 100) {
      score -= 20;
      recommendations.push('Consider caching or optimizing queries for better throughput');
    }

    return {
      testId: test.id,
      status: score >= 70 ? 'passed' : 'failed',
      score: Math.max(0, score),
      executionTime: Date.now() - startTime,
      usersTested: sampleSize,
      matchingUsers,
      matchRate: (matchingUsers / sampleSize) * 100,
      averageQueryTime: avgQueryTime,
      peakQueryTime,
      queryCount: queryTimes.length,
      throughput,
      errorRate: errorRate * 100,
      warnings,
      recommendations
    };
  }

  private async runAccuracyTest(test: SegmentTest): Promise<TestResult> {
    const startTime = Date.now();
    const goldStandard = test.config.goldStandardData || [];
    
    if (goldStandard.length === 0) {
      throw new Error('Accuracy test requires gold standard data');
    }

    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;

    for (const entry of goldStandard) {
      const result = await this.segmentationService.evaluateUserForSegment(entry.userId, test.segmentId);
      
      if (entry.expectedMatch && result.matches) {
        truePositives++;
      } else if (!entry.expectedMatch && !result.matches) {
        trueNegatives++;
      } else if (!entry.expectedMatch && result.matches) {
        falsePositives++;
      } else {
        falseNegatives++;
      }
    }

    const accuracy = (truePositives + trueNegatives) / goldStandard.length;
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = (2 * precision * recall) / (precision + recall) || 0;

    const score = accuracy * 100;
    const tolerance = test.config.toleranceThreshold || 90;

    return {
      testId: test.id,
      status: score >= tolerance ? 'passed' : 'failed',
      score,
      executionTime: Date.now() - startTime,
      usersTested: goldStandard.length,
      matchingUsers: truePositives + falsePositives,
      matchRate: ((truePositives + falsePositives) / goldStandard.length) * 100,
      accuracy: accuracy * 100,
      precision: precision * 100,
      recall: recall * 100,
      f1Score: f1Score * 100,
      warnings: [],
      recommendations: score < tolerance ? ['Review segment rules for better accuracy'] : []
    };
  }

  private async runOverlapTest(test: SegmentTest): Promise<TestResult> {
    const startTime = Date.now();
    const compareWith = test.config.compareWithSegments || [];
    
    if (compareWith.length === 0) {
      throw new Error('Overlap test requires segments to compare with');
    }

    // Get sample users
    const sampleSize = test.config.sampleSize || 1000;
    const testUserIds = Array.from({ length: sampleSize }, (_, i) => `test_user_${i}`);
    
    // Evaluate all segments
    const segmentMatches: Record<string, Set<string>> = {};
    segmentMatches[test.segmentId] = new Set();
    
    for (const segmentId of compareWith) {
      segmentMatches[segmentId] = new Set();
    }

    for (const userId of testUserIds) {
      for (const segmentId of [test.segmentId, ...compareWith]) {
        try {
          const result = await this.segmentationService.evaluateUserForSegment(userId, segmentId);
          if (result.matches) {
            segmentMatches[segmentId].add(userId);
          }
        } catch (error) {
          // Skip on error
        }
      }
    }

    // Calculate overlaps
    const overlappingSegments: OverlapAnalysis['overlappingSegments'] = [];
    const currentSegmentUsers = segmentMatches[test.segmentId];
    
    for (const otherSegmentId of compareWith) {
      const otherSegmentUsers = segmentMatches[otherSegmentId];
      const intersection = new Set([...currentSegmentUsers].filter(u => otherSegmentUsers.has(u)));
      const union = new Set([...currentSegmentUsers, ...otherSegmentUsers]);
      
      const overlapCount = intersection.size;
      const overlapPercentage = (overlapCount / currentSegmentUsers.size) * 100;
      const jaccard = intersection.size / union.size;

      const otherSegment = await this.segmentationService.getSegment(otherSegmentId);
      
      overlappingSegments.push({
        segmentId: otherSegmentId,
        segmentName: otherSegment?.name || 'Unknown',
        overlapCount,
        overlapPercentage,
        jaccard
      });
    }

    const allUsers = new Set<string>();
    Object.values(segmentMatches).forEach(users => {
      users.forEach(user => allUsers.add(user));
    });

    const overlapAnalysis: OverlapAnalysis = {
      totalUsers: allUsers.size,
      overlappingSegments,
      uniqueUsers: currentSegmentUsers.size,
      exclusiveUsers: currentSegmentUsers.size - overlappingSegments.reduce((sum, seg) => sum + seg.overlapCount, 0)
    };

    let score = 100;
    const warnings: TestWarning[] = [];
    
    // Check for high overlap (might indicate redundant segments)
    const highOverlap = overlappingSegments.filter(seg => seg.overlapPercentage > 80);
    if (highOverlap.length > 0) {
      score -= 20;
      warnings.push({
        id: `warning_${Date.now()}`,
        message: `High overlap detected with ${highOverlap.length} segment(s)`,
        severity: 'medium',
        suggestion: 'Consider consolidating overlapping segments'
      });
    }

    return {
      testId: test.id,
      status: 'passed',
      score,
      executionTime: Date.now() - startTime,
      usersTested: sampleSize,
      matchingUsers: currentSegmentUsers.size,
      matchRate: (currentSegmentUsers.size / sampleSize) * 100,
      overlapAnalysis,
      warnings,
      recommendations: []
    };
  }

  private async runStabilityTest(test: SegmentTest): Promise<TestResult> {
    const startTime = Date.now();
    const iterations = test.config.iterationCount || 10;
    const sampleSize = test.config.sampleSize || 100;
    
    const matchCounts: number[] = [];
    const testUserIds = Array.from({ length: sampleSize }, (_, i) => `test_user_${i}`);
    
    // Run multiple iterations
    for (let i = 0; i < iterations; i++) {
      let matches = 0;
      for (const userId of testUserIds) {
        try {
          const result = await this.segmentationService.evaluateUserForSegment(userId, test.segmentId);
          if (result.matches) matches++;
        } catch (error) {
          // Skip on error
        }
      }
      matchCounts.push(matches);
    }

    // Calculate stability metrics
    const mean = matchCounts.reduce((sum, count) => sum + count, 0) / matchCounts.length;
    const variance = matchCounts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / matchCounts.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;
    
    const stabilityScore = Math.max(0, 100 - (coefficientOfVariation * 100));
    
    const score = stabilityScore;
    const warnings: TestWarning[] = [];
    
    if (coefficientOfVariation > 0.1) {
      warnings.push({
        id: `warning_${Date.now()}`,
        message: `High variability detected (CV: ${(coefficientOfVariation * 100).toFixed(2)}%)`,
        severity: 'medium',
        suggestion: 'Review segment rules for consistency'
      });
    }

    return {
      testId: test.id,
      status: score >= 70 ? 'passed' : 'failed',
      score,
      executionTime: Date.now() - startTime,
      usersTested: sampleSize * iterations,
      matchingUsers: Math.round(mean),
      matchRate: (mean / sampleSize) * 100,
      stabilityScore,
      variance,
      warnings,
      recommendations: score < 70 ? ['Improve segment rule consistency for better stability'] : []
    };
  }

  private async runIntegrationTest(test: SegmentTest): Promise<TestResult> {
    const startTime = Date.now();
    const integrationResults: IntegrationTestResult[] = [];
    
    // Test 1: Segment evaluation integration
    const evalStart = Date.now();
    try {
      const result = await this.segmentationService.evaluateUserForSegment('test_user', test.segmentId);
      integrationResults.push({
        testName: 'Segment Evaluation',
        passed: true,
        details: `Successfully evaluated user (matches: ${result.matches})`,
        executionTime: Date.now() - evalStart
      });
    } catch (error) {
      integrationResults.push({
        testName: 'Segment Evaluation',
        passed: false,
        details: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - evalStart
      });
    }

    // Test 2: Batch evaluation integration
    const batchStart = Date.now();
    try {
      const batchResult = await this.segmentationService.batchEvaluateSegments({
        segmentIds: [test.segmentId],
        userIds: ['test_user_1', 'test_user_2']
      });
      integrationResults.push({
        testName: 'Batch Evaluation',
        passed: batchResult.segmentResults.length > 0,
        details: `Processed ${batchResult.totalUsers} users`,
        executionTime: Date.now() - batchStart
      });
    } catch (error) {
      integrationResults.push({
        testName: 'Batch Evaluation',
        passed: false,
        details: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - batchStart
      });
    }

    // Test 3: Metrics integration
    const metricsStart = Date.now();
    try {
      const metrics = await this.segmentationService.getSegmentMetrics(test.segmentId);
      integrationResults.push({
        testName: 'Metrics Integration',
        passed: metrics.totalUsers >= 0,
        details: `Retrieved metrics for ${metrics.totalUsers} users`,
        executionTime: Date.now() - metricsStart
      });
    } catch (error) {
      integrationResults.push({
        testName: 'Metrics Integration',
        passed: false,
        details: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - metricsStart
      });
    }

    const passed = integrationResults.filter(r => r.passed).length;
    const total = integrationResults.length;
    const score = (passed / total) * 100;

    return {
      testId: test.id,
      status: score >= 80 ? 'passed' : 'failed',
      score,
      executionTime: Date.now() - startTime,
      usersTested: 2,
      matchingUsers: 0,
      matchRate: 0,
      integrationResults,
      warnings: [],
      recommendations: score < 80 ? ['Fix integration issues before deployment'] : []
    };
  }

  private async runLoadTest(test: SegmentTest): Promise<TestResult> {
    const startTime = Date.now();
    const concurrentUsers = test.config.concurrentUsers || 10;
    const sustainedLoad = test.config.sustainedLoad || 60000; // 1 minute
    const rampUp = test.config.rampUpDuration || 10000; // 10 seconds
    
    let totalQueries = 0;
    let successfulQueries = 0;
    const queryTimes: number[] = [];
    
    const endTime = startTime + rampUp + sustainedLoad;
    
    // Simulate load testing
    const promises: Promise<void>[] = [];
    
    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(
        (async () => {
          while (Date.now() < endTime) {
            const queryStart = Date.now();
            totalQueries++;
            
            try {
              await this.segmentationService.evaluateUserForSegment(`load_user_${i}`, test.segmentId);
              successfulQueries++;
              queryTimes.push(Date.now() - queryStart);
            } catch (error) {
              // Count as failed query
            }
            
            // Brief pause between queries
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        })()
      );
    }

    await Promise.all(promises);

    const avgQueryTime = queryTimes.reduce((sum, time) => sum + time, 0) / queryTimes.length || 0;
    const peakQueryTime = Math.max(...queryTimes, 0);
    const successRate = (successfulQueries / totalQueries) * 100;
    const throughput = totalQueries / ((Date.now() - startTime) / 1000);

    let score = 100;
    const warnings: TestWarning[] = [];
    
    if (successRate < 95) {
      score -= 40;
      warnings.push({
        id: `warning_${Date.now()}`,
        message: `Low success rate: ${successRate.toFixed(2)}%`,
        severity: 'high',
        suggestion: 'Investigate query failures under load'
      });
    }

    if (avgQueryTime > 200) {
      score -= 30;
      warnings.push({
        id: `warning_${Date.now()}`,
        message: `High average query time under load: ${avgQueryTime}ms`,
        severity: 'medium',
        suggestion: 'Optimize for better performance under load'
      });
    }

    return {
      testId: test.id,
      status: score >= 70 ? 'passed' : 'failed',
      score,
      executionTime: Date.now() - startTime,
      usersTested: totalQueries,
      matchingUsers: 0,
      matchRate: successRate,
      averageQueryTime: avgQueryTime,
      peakQueryTime,
      queryCount: totalQueries,
      throughput,
      warnings,
      recommendations: []
    };
  }

  private async runRegressionTest(test: SegmentTest): Promise<TestResult> {
    const startTime = Date.now();
    const baseline = test.config.baselineMetrics || {};
    
    // Get current metrics
    const currentMetrics = await this.segmentationService.getSegmentMetrics(test.segmentId);
    
    let score = 100;
    const warnings: TestWarning[] = [];
    const regressions: string[] = [];
    
    // Compare with baseline
    const checks = [
      { metric: 'totalUsers', current: currentMetrics.totalUsers, baseline: baseline.totalUsers },
      { metric: 'activeUsers', current: currentMetrics.activeUsers, baseline: baseline.activeUsers },
      { metric: 'retentionRate', current: currentMetrics.retentionRate, baseline: baseline.retentionRate }
    ];

    for (const check of checks) {
      if (check.baseline !== undefined && check.current !== undefined) {
        const change = ((check.current - check.baseline) / check.baseline) * 100;
        
        if (Math.abs(change) > 20) { // 20% threshold
          score -= 20;
          regressions.push(`${check.metric}: ${change > 0 ? '+' : ''}${change.toFixed(1)}%`);
          warnings.push({
            id: `warning_${Date.now()}`,
            message: `Significant change in ${check.metric}: ${change.toFixed(1)}%`,
            severity: Math.abs(change) > 50 ? 'high' : 'medium',
            suggestion: `Investigate ${check.metric} changes`
          });
        }
      }
    }

    return {
      testId: test.id,
      status: score >= 70 ? 'passed' : 'failed',
      score,
      executionTime: Date.now() - startTime,
      usersTested: 0,
      matchingUsers: 0,
      matchRate: 0,
      warnings,
      recommendations: regressions.length > 0 ? ['Review recent changes that may have caused regressions'] : []
    };
  }

  // Helper Methods
  private getDefaultConfigForTestType(testType: TestType, customConfig?: TestConfiguration): TestConfiguration {
    const baseConfig: TestConfiguration = {
      sampleSize: 1000,
      sampleMethod: 'random',
      maxExecutionTime: 5000,
      includeDebugInfo: false,
      failOnWarnings: false,
      timeoutMs: 30000
    };

    const typeDefaults: Record<TestType, Partial<TestConfiguration>> = {
      validation: { sampleSize: 0 },
      performance: { sampleSize: 1000, maxExecutionTime: 3000 },
      accuracy: { toleranceThreshold: 90 },
      overlap: { sampleSize: 1000 },
      stability: { iterationCount: 10, sampleSize: 100 },
      integration: { sampleSize: 10 },
      load: { concurrentUsers: 10, sustainedLoad: 60000, rampUpDuration: 10000 },
      regression: { sampleSize: 0 }
    };

    return { ...baseConfig, ...typeDefaults[testType], ...customConfig };
  }

  private findConflictingRules(rules: TargetingRule[]): Array<{ rule1: string; rule2: string; conflict: string }> {
    const conflicts: Array<{ rule1: string; rule2: string; conflict: string }> = [];
    
    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        const rule1 = rules[i];
        const rule2 = rules[j];
        
        // Check for same attribute with conflicting conditions
        if (rule1.attribute === rule2.attribute) {
          if (
            (rule1.operator === 'equals' && rule2.operator === 'not_equals' && rule1.value === rule2.value) ||
            (rule1.operator === 'exists' && rule2.operator === 'not_exists')
          ) {
            conflicts.push({
              rule1: rule1.id,
              rule2: rule2.id,
              conflict: `Conflicting conditions on ${rule1.attribute}`
            });
          }
        }
      }
    }
    
    return conflicts;
  }

  private async evaluateExpectations(test: SegmentTest, results: TestResult): Promise<Array<{ expectation: TestExpectation; passed: boolean; actualValue: number }>> {
    if (!test.expectations) return [];
    
    const evaluationResults: Array<{ expectation: TestExpectation; passed: boolean; actualValue: number }> = [];
    
    for (const expectation of test.expectations) {
      const actualValue = (results as any)[expectation.metric] || 0;
      let passed = false;
      
      switch (expectation.operator) {
      case 'equals':
        passed = actualValue === expectation.expectedValue;
        break;
      case 'not_equals':
        passed = actualValue !== expectation.expectedValue;
        break;
      case 'greater_than':
        passed = actualValue > (expectation.expectedValue as number);
        break;
      case 'less_than':
        passed = actualValue < (expectation.expectedValue as number);
        break;
      case 'between':
        if (Array.isArray(expectation.expectedValue) && expectation.expectedValue.length === 2) {
          passed = actualValue >= expectation.expectedValue[0] && actualValue <= expectation.expectedValue[1];
        }
        break;
      }
      
      evaluationResults.push({ expectation, passed, actualValue });
    }
    
    return evaluationResults;
  }

  private async archiveTest(test: SegmentTest): Promise<void> {
    const segmentHistory = this.testHistory.get(test.segmentId) || [];
    segmentHistory.push(test);
    this.testHistory.set(test.segmentId, segmentHistory);
    
    // Remove from active tests
    this.activeTests.delete(test.id);
  }

  private async logTestAction(action: string, test: SegmentTest): Promise<void> {
    console.log(`Segment test ${action}:`, {
      testId: test.id,
      testName: test.name,
      testType: test.testType,
      segmentId: test.segmentId,
      status: test.status,
      timestamp: new Date().toISOString()
    });
  }

  // Public API Methods
  async getTest(testId: string): Promise<SegmentTest | null> {
    return this.activeTests.get(testId) || null;
  }

  async getTestHistory(segmentId: string): Promise<SegmentTest[]> {
    return this.testHistory.get(segmentId) || [];
  }

  async generateTestReport(segmentId: string, reportType: 'summary' | 'detailed' | 'comparison' = 'summary'): Promise<TestReport> {
    const tests = this.testHistory.get(segmentId) || [];
    const segment = await this.segmentationService.getSegment(segmentId);
    
    if (!segment) {
      throw new Error(`Segment ${segmentId} not found`);
    }

    const passedTests = tests.filter(t => t.results?.status === 'passed').length;
    const passRate = tests.length > 0 ? (passedTests / tests.length) * 100 : 0;
    const avgScore = tests.length > 0 
      ? tests.reduce((sum, t) => sum + (t.results?.score || 0), 0) / tests.length 
      : 0;

    return {
      segmentId,
      segmentName: segment.name,
      reportType,
      generatedAt: new Date().toISOString(),
      totalTests: tests.length,
      passRate,
      avgScore,
      recentTrends: [], // Would implement trend calculation
      testsByType: this.calculateTestsByType(tests),
      performanceInsights: {
        avgExecutionTime: tests.reduce((sum, t) => sum + (t.duration || 0), 0) / tests.length || 0,
        performanceTrend: 'stable',
        bottlenecks: []
      },
      qualityScore: avgScore,
      recommendations: [],
      criticalIssues: [],
      tests: reportType === 'detailed' ? tests : tests.slice(-10) // Last 10 tests for summary
    };
  }

  private calculateTestsByType(tests: SegmentTest[]): Record<TestType, { count: number; passRate: number; avgScore: number }> {
    const result = {} as Record<TestType, { count: number; passRate: number; avgScore: number }>;
    
    const testTypes = ['validation', 'performance', 'accuracy', 'overlap', 'stability', 'integration', 'load', 'regression'] as TestType[];
    
    for (const type of testTypes) {
      const typeTests = tests.filter(t => t.testType === type);
      const passed = typeTests.filter(t => t.results?.status === 'passed').length;
      const avgScore = typeTests.length > 0
        ? typeTests.reduce((sum, t) => sum + (t.results?.score || 0), 0) / typeTests.length
        : 0;
      
      result[type] = {
        count: typeTests.length,
        passRate: typeTests.length > 0 ? (passed / typeTests.length) * 100 : 0,
        avgScore
      };
    }
    
    return result;
  }
}

export default SegmentTestingService;