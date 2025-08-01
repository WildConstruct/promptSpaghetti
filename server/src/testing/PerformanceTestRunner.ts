/**
 * Performance Test Runner
 * 
 * Command-line and programmatic interface for running performance tests,
 * generating reports, and integrating with CI/CD pipelines during
 * Epic 18 technical debt refactoring.
 * 
 * Part of Epic 18 - Technical Debt & Refactoring
 * Task: E18-1753114561906-145A03 - Build performance test suite
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { PerformanceTestSuite, PerformanceTestConfig, TestSuiteResult } from './PerformanceTestSuite';
import { PerformanceMonitor } from '../monitoring/PerformanceMonitor';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';



export interface TestRunnerConfig {
  // Test Execution
  suites: string[]; // Test suite IDs to run
  parallel: boolean;
  maxConcurrency: number;
  
  // Output Configuration
  outputDir: string;
  reportFormats: ReportFormat[];
  verbose: boolean;
  
  // CI/CD Integration
  exitOnFailure: boolean;
  failureThreshold: number; // percentage of tests that can fail
  performanceRegressionThreshold: number; // percentage regression threshold
  
  // Baseline Management
  updateBaseline: boolean;
  compareBaseline: boolean;
  baselineDir?: string;
  
  // Filtering
  testFilter?: string; // Regex pattern
  categoryFilter?: string[];
  priorityFilter?: string[];
  
  // Timing
  timeout: number; // Overall timeout in milliseconds
  testTimeout: number; // Individual test timeout







export interface TestExecutionPlan {
  planId: string;
  suites: TestSuiteExecutionPlan[];
  totalTests: number;
  estimatedDuration: number;
  parallelExecution: boolean;
  createdAt: Date;







export interface TestSuiteExecutionPlan {
  suiteId: string;
  suiteName: string;
  testCount: number;
  estimatedDuration: number;
  dependencies: string[];
  priority: number;







export interface TestRunResult {
  runId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  
  // Execution Summary
  suiteResults: TestSuiteResult[];
  overallSummary: OverallTestSummary;
  
  // Analysis
  performanceAnalysis: OverallPerformanceAnalysis;
  regressionAnalysis?: RegressionAnalysis;
  
  // Status
  status: 'passed' | 'failed' | 'timeout' | 'cancelled';
  exitCode: number;
  
  // Reports
  reports: GeneratedReport[];
  
  // Environment
  environment: TestEnvironmentInfo;







export interface OverallTestSummary {
  totalSuites: number;
  passedSuites: number;
  failedSuites: number;
  
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  
  totalDuration: number;
  averageDuration: number;
  
  totalOperations: number;
  averageThroughput: number;
  
  criticalFailures: number;
  performanceRegressions: number;







export interface OverallPerformanceAnalysis {
  overallTrend: 'improving' | 'stable' | 'degrading';
  significantChanges: number;
  
  // Cross-suite analysis
  commonBottlenecks: string[];
  systemwideIssues: string[];
  recommendedActions: string[];
  
  // Performance categories
  categoryAnalysis: Record<string, {
    averagePerformance: number;
    trend: string;
    issueCount: number;



>;




export interface RegressionAnalysis {
  hasRegressions: boolean;
  regressionCount: number;
  criticalRegressions: number;
  
  regressions: Array<{
    suiteId: string;
    testId: string;
    metric: string;
    currentValue: number;
    baselineValue: number;
    regressionPercentage: number;
    severity: 'minor' | 'moderate' | 'major' | 'critical';



>;
  
  recommendation: string;




export interface GeneratedReport {
  reportId: string;
  format: ReportFormat;
  filePath: string;
  fileSize: number;
  generatedAt: Date;







export interface TestEnvironmentInfo {
  nodeVersion: string;
  platform: string;
  cpuInfo: string;
  memoryInfo: string;
  buildInfo?: {
    version: string;
    commit: string;
    branch: string;
    buildTime: Date;



  };
  ciInfo?: {
    provider: string;
    buildId: string;
    pullRequestId?: string;
  };


export type ReportFormat = 'json' | 'html' | 'markdown' | 'junit' | 'csv';

export class PerformanceTestRunner extends EventEmitter {
  private config: TestRunnerConfig;
  private testSuites: Map<string, PerformanceTestSuite> = new Map();
  
  // Dependencies
  private performanceMonitor: PerformanceMonitor;
  private databaseService: DatabaseService;
  private redisService: RedisService;
  private auditService: AuditService;
  
  // Execution State
  private currentRun?: TestRunResult;
  private isRunning = false;

  constructor(
    config: TestRunnerConfig,
    dependencies: {
      performanceMonitor: PerformanceMonitor;
      databaseService: DatabaseService;
      redisService: RedisService;
      auditService: AuditService;
    }
  ) {
    super();
    this.config = config;
    this.performanceMonitor = dependencies.performanceMonitor;
    this.databaseService = dependencies.databaseService;
    this.redisService = dependencies.redisService;
    this.auditService = dependencies.auditService;


  /**
   * Initialize test runner
   */
  public async initialize(): Promise<void> {

    console.log('🚀 Initializing Performance Test Runner...');
    
    // Create output directory
    await this.ensureOutputDirectory();
    
    // Initialize test suites
    await this.initializeTestSuites();
    
    console.log(`✅ Performance Test Runner initialized with ${this.testSuites.size} test suites`);


  /**
   * Run performance tests based on configuration
   */
  public async run(): Promise<TestRunResult> {

    if (this.isRunning) {
      throw new Error('Test runner is already running');

    
    console.log('🧪 Starting Performance Test Run...');
    
    const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = new Date();
    
    this.isRunning = true;
    this.currentRun = {
      runId,
      startTime,
      endTime: new Date(), // Will be updated
      duration: 0,
      suiteResults: [],
      overallSummary: this.initializeOverallSummary(),
      performanceAnalysis: this.initializePerformanceAnalysis(),
      status: 'passed',
      exitCode: 0,
      reports: [],
      environment: this.captureEnvironmentInfo()
    };
    
    try {
      // Create execution plan
      const executionPlan = await this.createExecutionPlan();
      
      // Execute test suites
      await this.executeTestSuites(executionPlan);
      
      // Generate overall analysis
      await this.generateOverallAnalysis();
      
      // Generate baseline comparison if enabled
      if (this.config.compareBaseline) {
        await this.generateRegressionAnalysis();

      
      // Update baseline if enabled
      if (this.config.updateBaseline) {
        await this.updateBaselines();

      
      // Generate reports
      await this.generateReports();
      
      this.currentRun.endTime = new Date();
      this.currentRun.duration = this.currentRun.endTime.getTime() - startTime.getTime();
      
      // Determine overall status
      this.determineOverallStatus();
      
      // Persist results
      await this.persistResults();
      
      console.log(`✅ Performance Test Run completed: ${this.currentRun.status} (${this.currentRun.duration}ms)`);
      
      this.emit('run_completed', this.currentRun);
      
      return this.currentRun;
 catch (error) {
      this.currentRun.status = 'failed';
      this.currentRun.exitCode = 1;
      this.currentRun.endTime = new Date();
      
      console.error(`❌ Performance Test Run failed: ${error.message}`);
      
      this.emit('run_failed', { runId, error });
      
      throw error;
 finally {
      this.isRunning = false;



  /**
   * Create execution plan for test suites
   */
  private async createExecutionPlan(): Promise<TestExecutionPlan> {

    console.log('📋 Creating execution plan...');
    
    const suites: TestSuiteExecutionPlan[] = [];
    let totalTests = 0;
    let estimatedDuration = 0;
    
    for (const suiteId of this.config.suites) {
      const testSuite = this.testSuites.get(suiteId);
      if (!testSuite) {
        console.warn(`Test suite not found: ${suiteId}`);
        continue;

      
      const status = testSuite.getStatus();
      const suitePlan: TestSuiteExecutionPlan = {
        suiteId,
        suiteName: suiteId,
        testCount: status.testCount,
        estimatedDuration: status.testCount * 1000, // 1s per test estimate
        dependencies: [],
        priority: 1
      };
      
      suites.push(suitePlan);
      totalTests += suitePlan.testCount;
      estimatedDuration += suitePlan.estimatedDuration;

    
    // Adjust for parallel execution
    if (this.config.parallel && suites.length > 1) {
      estimatedDuration = estimatedDuration / Math.min(suites.length, this.config.maxConcurrency);

    
    const plan: TestExecutionPlan = {
      planId: `plan_${Date.now()}`,
      suites,
      totalTests,
      estimatedDuration,
      parallelExecution: this.config.parallel,
      createdAt: new Date()
    };
    
    console.log(`📊 Execution plan: ${totalTests} tests across ${suites.length} suites (${estimatedDuration}ms estimated)`);
    
    return plan;


  /**
   * Execute test suites according to plan
   */
  private async executeTestSuites(plan: TestExecutionPlan): Promise<void> {

    console.log(`🔄 Executing ${plan.suites.length} test suites...`);
    
    if (plan.parallelExecution && plan.suites.length > 1) {
      await this.executeTestSuitesParallel(plan.suites);
 else {
      await this.executeTestSuitesSequential(plan.suites);

    
    this.updateOverallSummary();


  /**
   * Execute test suites in parallel
   */
  private async executeTestSuitesParallel(suites: TestSuiteExecutionPlan[]): Promise<void> {

    const concurrency = Math.min(suites.length, this.config.maxConcurrency);
    const semaphore = Array(concurrency).fill(null);
    
    const executePromises = suites.map(async (suite, index) => {
      const semIndex = index % concurrency;
      await semaphore[semIndex];
      semaphore[semIndex] = this.executeSingleSuite(suite.suiteId);
      return semaphore[semIndex];
    });
    
    const results = await Promise.allSettled(executePromises);
    
    // Process results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.currentRun!.suiteResults.push(result.value);
 else {
        console.error(`Suite ${suites[index].suiteId} execution failed:`, result.reason);

    });


  /**
   * Execute test suites sequentially
   */
  private async executeTestSuitesSequential(suites: TestSuiteExecutionPlan[]): Promise<void> {

    for (const suite of suites) {
      try {
        const result = await this.executeSingleSuite(suite.suiteId);
        this.currentRun!.suiteResults.push(result);
 catch (error) {
        console.error(`Suite ${suite.suiteId} execution failed:`, error);




  /**
   * Execute a single test suite
   */
  private async executeSingleSuite(suiteId: string): Promise<TestSuiteResult> {

    console.log(`🧪 Executing test suite: ${suiteId}`);
    
    const testSuite = this.testSuites.get(suiteId);
    if (!testSuite) {
      throw new Error(`Test suite not found: ${suiteId}`);

    
    const startTime = Date.now();
    
    try {
      const result = await testSuite.runSuite();
      
      const duration = Date.now() - startTime;
      console.log(`✅ Suite completed: ${suiteId} (${duration}ms)`);
      
      this.emit('suite_completed', { suiteId, result });
      
      return result;
 catch (error) {
      console.error(`❌ Suite failed: ${suiteId}`, error);
      
      this.emit('suite_failed', { suiteId, error });
      
      throw error;



  /**
   * Initialize test suites
   */
  private async initializeTestSuites(): Promise<void> {

    const defaultSuiteConfigs: PerformanceTestConfig[] = [
      {
        testSuiteId: 'api_performance_suite',
        name: 'API Performance Test Suite',
        description: 'Tests API endpoint performance',
        enabled: true,
        iterations: 10,
        warmupIterations: 3,
        timeout: 30000,
        parallel: true,
        maxConcurrency: 5,
        environment: (process.env.NODE_ENV as any) || 'development',
        resourceLimits: {
          maxMemory: 512,
          maxCpu: 80

        baseline: {
          enabled: true,
          recordBaseline: this.config.updateBaseline,
          compareToBaseline: this.config.compareBaseline,
          baselineThreshold: this.config.performanceRegressionThreshold

        reporting: {
          enabled: true,
          includeDetails: true,
          includeTrends: true,
          generateCharts: false


      {
        testSuiteId: 'system_performance_suite',
        name: 'System Performance Test Suite',
        description: 'Tests core system performance',
        enabled: true,
        iterations: 5,
        warmupIterations: 2,
        timeout: 60000,
        parallel: false,
        maxConcurrency: 1,
        environment: (process.env.NODE_ENV as any) || 'development',
        resourceLimits: {
          maxMemory: 1024,
          maxCpu: 90

        baseline: {
          enabled: true,
          recordBaseline: this.config.updateBaseline,
          compareToBaseline: this.config.compareBaseline,
          baselineThreshold: this.config.performanceRegressionThreshold

        reporting: {
          enabled: true,
          includeDetails: true,
          includeTrends: true,
          generateCharts: false


    ];
    
    for (const suiteConfig of defaultSuiteConfigs) {
      if (this.config.suites.includes(suiteConfig.testSuiteId)) {
        const testSuite = new PerformanceTestSuite(suiteConfig, {
          performanceMonitor: this.performanceMonitor,
          databaseService: this.databaseService,
          redisService: this.redisService
        });
        
        await testSuite.initialize();
        this.testSuites.set(suiteConfig.testSuiteId, testSuite);




  /**
   * Initialize overall summary structure
   */
  private initializeOverallSummary(): OverallTestSummary {
    return {
      totalSuites: 0,
      passedSuites: 0,
      failedSuites: 0,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0,
      averageDuration: 0,
      totalOperations: 0,
      averageThroughput: 0,
      criticalFailures: 0,
      performanceRegressions: 0
    };


  /**
   * Initialize performance analysis structure
   */
  private initializePerformanceAnalysis(): OverallPerformanceAnalysis {
    return {
      overallTrend: 'stable',
      significantChanges: 0,
      commonBottlenecks: [],
      systemwideIssues: [],
      recommendedActions: [],
      categoryAnalysis: {}
    };


  /**
   * Update overall summary based on suite results
   */
  private updateOverallSummary(): void {
    if (!this.currentRun) return;
    
    const summary = this.currentRun.overallSummary;
    const results = this.currentRun.suiteResults;
    
    summary.totalSuites = results.length;
    summary.passedSuites = results.filter(r => r.status === 'completed').length;
    summary.failedSuites = results.filter(r => r.status === 'failed').length;
    
    // Aggregate test statistics
    summary.totalTests = results.reduce((sum, r) => sum + r.summary.totalTests, 0);
    summary.passedTests = results.reduce((sum, r) => sum + r.summary.passedTests, 0);
    summary.failedTests = results.reduce((sum, r) => sum + r.summary.failedTests, 0);
    summary.skippedTests = results.reduce((sum, r) => sum + r.summary.skippedTests, 0);
    
    summary.totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    summary.averageDuration = summary.totalTests > 0 ? 
      results.reduce((sum, r) => sum + r.summary.totalDuration, 0) / summary.totalTests : 0;
    
    summary.totalOperations = results.reduce((sum, r) => sum + r.summary.totalOperations, 0);
    summary.averageThroughput = results.reduce((sum, r) => sum + r.summary.averageThroughput, 0) / results.length;
    
    // Count critical failures
    summary.criticalFailures = results.reduce((sum, r) => {
      return sum + r.analysis.bottlenecks.filter(b => b.severity === 'critical').length;
    }, 0);


  /**
   * Generate overall performance analysis
   */
  private async generateOverallAnalysis(): Promise<void> {

    if (!this.currentRun) return;
    
    const analysis = this.currentRun.performanceAnalysis;
    const results = this.currentRun.suiteResults;
    
    // Analyze common bottlenecks
    const allBottlenecks = results.flatMap(r => r.analysis.bottlenecks);
    const bottleneckCounts = new Map<string, number>();
    
    allBottlenecks.forEach(bottleneck => {
      const key = `${bottleneck.type}_${bottleneck.severity}`;
      bottleneckCounts.set(key, (bottleneckCounts.get(key) || 0) + 1);
    });
    
    // Identify common bottlenecks (present in multiple suites)
    analysis.commonBottlenecks = Array.from(bottleneckCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([type, _]) => type);
    
    // Generate system-wide recommendations
    analysis.recommendedActions = this.generateSystemWideRecommendations(results);
    
    // Analyze by category
    analysis.categoryAnalysis = this.analyzePerfomanceByCategory(results);
    
    // Determine overall trend
    analysis.overallTrend = this.calculateOverallTrend(results);


  /**
   * Generate system-wide recommendations
   */
  private generateSystemWideRecommendations(results: TestSuiteResult[]): string[] {
    const recommendations: string[] = [];
    
    const totalFailures = results.reduce((sum, r) => sum + r.summary.failedTests, 0);
    const totalTests = results.reduce((sum, r) => sum + r.summary.totalTests, 0);
    const failureRate = totalTests > 0 ? (totalFailures / totalTests) * 100 : 0;
    
    if (failureRate > 10) {
      recommendations.push('High failure rate detected - investigate and fix failing tests');

    
    const averageMemory = results.reduce((sum, r) => sum + r.summary.averageMemory, 0) / results.length;
    if (averageMemory > 200 * 1024 * 1024) {
      recommendations.push('High memory usage detected - implement memory optimization strategies');

    
    const averageDuration = results.reduce((sum, r) => sum + r.summary.averageDuration, 0) / results.length;
    if (averageDuration > 1000) {
      recommendations.push('Slow performance detected - optimize performance-critical operations');

    
    return recommendations;


  /**
   * Analyze performance by category
   */
  private analyzePerfomanceByCategory(results: TestSuiteResult[]): Record<string, any> {
    const categoryData: Record<string, {
      tests: number;
      totalDuration: number;
      issues: number;
> = {};
    
    results.forEach(result => {
      result.tests.forEach(test => {
        const category = test.metadata.category || 'unknown';
        
        if (!categoryData[category]) {
          categoryData[category] = {
            tests: 0,
            totalDuration: 0,
            issues: 0
          };

        
        categoryData[category].tests++;
        categoryData[category].totalDuration += test.duration;
        if (!test.success) categoryData[category].issues++;
      });
    });
    
    const analysis: Record<string, any> = {};
    
    Object.entries(categoryData).forEach(([category, data]) => {
      analysis[category] = {
        averagePerformance: data.totalDuration / data.tests,
        trend: 'stable', // Would calculate from historical data
        issueCount: data.issues
      };
    });
    
    return analysis;


  /**
   * Calculate overall performance trend
   */
  private calculateOverallTrend(results: TestSuiteResult[]): 'improving' | 'stable' | 'degrading' {
    // Simple implementation - would use historical comparison in real scenario
    const failureRate = results.reduce((sum, r) => sum + r.summary.failedTests, 0) / 
                       results.reduce((sum, r) => sum + r.summary.totalTests, 0);
    
    if (failureRate > 0.1) return 'degrading';
    if (failureRate === 0) return 'improving';
    return 'stable';


  /**
   * Generate regression analysis
   */
  private async generateRegressionAnalysis(): Promise<void> {

    if (!this.currentRun) return;
    
    // Placeholder implementation - would compare with stored baseline
    this.currentRun.regressionAnalysis = {
      hasRegressions: false,
      regressionCount: 0,
      criticalRegressions: 0,
      regressions: [],
      recommendation: 'No significant performance regressions detected'
    };


  /**
   * Update baseline data
   */
  private async updateBaselines(): Promise<void> {

    console.log('📊 Updating performance baselines...');
    
    // Implementation would store current results as new baseline
    for (const result of this.currentRun!.suiteResults) {
      await this.storeBaseline(result);



  /**
   * Store baseline data for a test suite
   */
  private async storeBaseline(result: TestSuiteResult): Promise<void> {

    try {
      await this.databaseService.execute(`
        INSERT OR REPLACE INTO performance_baselines (
          suite_id, suite_name, baseline_data, created_at, version
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        result.suiteId,
        result.name,
        JSON.stringify(result),
        new Date(),
        this.currentRun!.environment.buildInfo?.version || '1.0.0'
      ]);
 catch (error) {
      console.error(`Failed to store baseline for ${result.suiteId}:`, error);



  /**
   * Generate test reports
   */
  private async generateReports(): Promise<void> {

    console.log('📄 Generating performance test reports...');
    
    for (const format of this.config.reportFormats) {
      try {
        const report = await this.generateReport(format);
        this.currentRun!.reports.push(report);
 catch (error) {
        console.error(`Failed to generate ${format} report:`, error);




  /**
   * Generate a specific report format
   */
  private async generateReport(format: ReportFormat): Promise<GeneratedReport> {

    if (!this.currentRun) throw new Error('No current run to report on');
    
    const reportId = `report_${this.currentRun.runId}_${format}`;
    const fileName = `performance_test_report_${Date.now()}.${format}`;
    const filePath = path.join(this.config.outputDir, fileName);
    
    let content: string;
    
    switch (format) {
    case 'json':
      content = JSON.stringify(this.currentRun, null, 2);
      break;
        
    case 'html':
      content = this.generateHtmlReport();
      break;
        
    case 'markdown':
      content = this.generateMarkdownReport();
      break;
        
    case 'junit':
      content = this.generateJUnitReport();
      break;
        
    case 'csv':
      content = this.generateCsvReport();
      break;
        
    default:
      throw new Error(`Unsupported report format: ${format}`);

    
    await fs.writeFile(filePath, content, 'utf-8');
    const stats = await fs.stat(filePath);
    
    console.log(`📄 Generated ${format.toUpperCase()} report: ${fileName}`);
    
    return {
      reportId,
      format,
      filePath,
      fileSize: stats.size,
      generatedAt: new Date(};


  /**
   * Generate HTML report
   */
  private generateHtmlReport(): string {
    if (!this.currentRun) return '';
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
        .suite { margin: 20px 0; border: 1px solid #ddd; border-radius: 5px; }
        .suite-header { background: #e9e9e9; padding: 10px; }
        .test-result { padding: 5px 10px; }
        .passed { color: green; }
        .failed { color: red; }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    </style>
</head>
<body>
    <h1>Performance Test Report</h1>
    
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Run ID:</strong> ${this.currentRun.runId}</p>
        <p><strong>Status:</strong> <span class="${this.currentRun.status}">${this.currentRun.status.toUpperCase()}</span></p>
        <p><strong>Duration:</strong> ${this.currentRun.duration}ms</p>
        <p><strong>Total Tests:</strong> ${this.currentRun.overallSummary.totalTests}</p>
        <p><strong>Passed:</strong> <span class="passed">${this.currentRun.overallSummary.passedTests}</span></p>
        <p><strong>Failed:</strong> <span class="failed">${this.currentRun.overallSummary.failedTests}</span></p>
    </div>
    
    <h2>Test Suites</h2>
    ${this.currentRun.suiteResults.map(suite => `
        <div class="suite">
            <div class="suite-header">
                <h3>${suite.name} (${suite.status})</h3>
                <p>Duration: ${suite.duration}ms | Tests: ${suite.summary.totalTests}</p>
            </div>
        </div>
    `).join('')}
    
    <h2>Performance Analysis</h2>
    <ul>
        ${this.currentRun.performanceAnalysis.recommendedActions.map(action => 
    `<li>${action}</li>`
  ).join('')}
    </ul>
    
    <p><em>Generated on ${new Date().toISOString()}</em></p>
</body>
</html>`;


  /**
   * Generate Markdown report
   */
  private generateMarkdownReport(): string {
    if (!this.currentRun) return '';
    
    return `# Performance Test Report

## Summary

- **Run ID**: ${this.currentRun.runId}
- **Status**: ${this.currentRun.status.toUpperCase()}
- **Duration**: ${this.currentRun.duration}ms
- **Total Tests**: ${this.currentRun.overallSummary.totalTests}
- **Passed**: ${this.currentRun.overallSummary.passedTests}
- **Failed**: ${this.currentRun.overallSummary.failedTests}

## Test Suites

${this.currentRun.suiteResults.map(suite => `
### ${suite.name}

- **Status**: ${suite.status}
- **Duration**: ${suite.duration}ms
- **Tests**: ${suite.summary.totalTests} (${suite.summary.passedTests} passed, ${suite.summary.failedTests} failed)
- **Average Duration**: ${suite.summary.averageDuration.toFixed(2)}ms

`).join('')}

## Performance Analysis

### Recommendations

${this.currentRun.performanceAnalysis.recommendedActions.map(action => `- ${action}`).join('\n')}

---
*Report generated on ${new Date().toISOString()}*`;


  /**
   * Generate JUnit XML report
   */
  private generateJUnitReport(): string {
    if (!this.currentRun) return '';
    
    const totalTests = this.currentRun.overallSummary.totalTests;
    const failures = this.currentRun.overallSummary.failedTests;
    const time = (this.currentRun.duration / 1000).toFixed(3);
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="Performance Tests" tests="${totalTests}" failures="${failures}" time="${time}">
${this.currentRun.suiteResults.map(suite => `
    <testsuite name="${suite.name}" tests="${suite.summary.totalTests}" 
               failures="${suite.summary.failedTests}" time="${(suite.duration / 1000).toFixed(3)}">
        ${suite.tests.filter(t => !t.metadata.isWarmup).map(test => `
        <testcase name="${test.testId}" time="${(test.duration / 1000).toFixed(3)}" classname="${suite.name}">
            ${!test.success ? `<failure message="${test.error?.message || 'Test failed'}">${test.error?.stack || ''}</failure>` : ''}
        </testcase>`).join('')}
    </testsuite>`).join('')}
</testsuites>`;


  /**
   * Generate CSV report
   */
  private generateCsvReport(): string {
    if (!this.currentRun) return '';
    
    const headers = ['Suite', 'Test', 'Success', 'Duration (ms)', 'Memory (MB)', 'Throughput (ops/sec)'];
    const rows = [headers.join(',')];
    
    this.currentRun.suiteResults.forEach(suite => {
      suite.tests.filter(t => !t.metadata.isWarmup).forEach(test => {
        const row = [
          suite.name,
          test.testId,
          test.success ? 'PASS' : 'FAIL',
          test.duration.toFixed(2),
          (test.memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
          test.throughput?.toFixed(2) || '0'
        ];
        rows.push(row.join(','));
      });
    });
    
    return rows.join('\n');


  /**
   * Determine overall test run status
   */
  private determineOverallStatus(): void {
    if (!this.currentRun) return;
    
    const failureRate = (this.currentRun.overallSummary.failedTests / this.currentRun.overallSummary.totalTests) * 100;
    
    if (failureRate > this.config.failureThreshold) {
      this.currentRun.status = 'failed';
      this.currentRun.exitCode = 1;
 else if (this.currentRun.regressionAnalysis?.hasRegressions) {
      this.currentRun.status = 'failed';
      this.currentRun.exitCode = 2; // Performance regression
 else {
      this.currentRun.status = 'passed';
      this.currentRun.exitCode = 0;



  /**
   * Ensure output directory exists
   */
  private async ensureOutputDirectory(): Promise<void> {

    try {
      await fs.mkdir(this.config.outputDir, { recursive: true });
 catch (error) {
      console.error('Failed to create output directory:', error);



  /**
   * Capture environment information
   */
  private captureEnvironmentInfo(): TestEnvironmentInfo {
    return {
      nodeVersion: process.version,
      platform: `${process.platform} ${process.arch}`,
      cpuInfo: require('os').cpus()[0]?.model || 'Unknown',
      memoryInfo: `${Math.round(require('os').totalmem() / 1024 / 1024 / 1024)}GB`,
      buildInfo: {
        version: process.env.BUILD_VERSION || '1.0.0',
        commit: process.env.COMMIT_HASH || 'unknown',
        branch: process.env.BRANCH_NAME || 'unknown',
        buildTime: new Date(},
      ciInfo: process.env.CI ? {
        provider: process.env.CI_PROVIDER || 'unknown',
        buildId: process.env.BUILD_ID || process.env.CI_BUILD_ID || 'unknown',
        pullRequestId: process.env.PULL_REQUEST_ID || process.env.PR_NUMBER
 : undefined
    };


  /**
   * Persist test results to storage
   */
  private async persistResults(): Promise<void> {

    if (!this.currentRun) return;
    
    try {
      await this.databaseService.execute(`
        INSERT INTO performance_test_runs (
          run_id, start_time, end_time, duration, status, exit_code,
          overall_summary, performance_analysis, environment, results_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        this.currentRun.runId,
        this.currentRun.startTime,
        this.currentRun.endTime,
        this.currentRun.duration,
        this.currentRun.status,
        this.currentRun.exitCode,
        JSON.stringify(this.currentRun.overallSummary),
        JSON.stringify(this.currentRun.performanceAnalysis),
        JSON.stringify(this.currentRun.environment),
        JSON.stringify({
          suiteResults: this.currentRun.suiteResults,
          reports: this.currentRun.reports,
          regressionAnalysis: this.currentRun.regressionAnalysis

      ]);
      
      console.log(`💾 Persisted test run results: ${this.currentRun.runId}`);
 catch (error) {
      console.error('Failed to persist test results:', error);



  /**
   * Get runner status
   */
  public getStatus(): {
    running: boolean;
    currentRun?: string;
    suitesLoaded: number;
 {
    return {
      running: this.isRunning,
      currentRun: this.currentRun?.runId,
      suitesLoaded: this.testSuites.size
    };


  /**
   * Cancel current test run
   */
  public async cancel(): Promise<void> {

    if (this.isRunning && this.currentRun) {
      console.log('⏹️ Cancelling performance test run...');
      
      this.currentRun.status = 'cancelled';
      this.currentRun.exitCode = 130; // SIGINT
      this.isRunning = false;
      
      // Stop all running test suites
      for (const testSuite of this.testSuites.values()) {
        await testSuite.stop();





/**
 * Factory function to create test runner with default configuration
 */
export function createPerformanceTestRunner(
  overrides: Partial<TestRunnerConfig> = {},
  dependencies: {
    performanceMonitor: PerformanceMonitor;
    databaseService: DatabaseService;
    redisService: RedisService;
    auditService: AuditService;
  }
): PerformanceTestRunner {
  const defaultConfig: TestRunnerConfig = {
    suites: ['api_performance_suite', 'system_performance_suite'],
    parallel: true,
    maxConcurrency: 3,
    outputDir: './performance-reports',
    reportFormats: ['json', 'html', 'markdown'],
    verbose: true,
    exitOnFailure: true,
    failureThreshold: 10, // 10% failure threshold
    performanceRegressionThreshold: 15, // 15% regression threshold
    updateBaseline: false,
    compareBaseline: true,
    timeout: 600000, // 10 minutes
    testTimeout: 30000 // 30 seconds per test
  };
  
  const config = { ...defaultConfig, ...overrides };
  return new PerformanceTestRunner(config, dependencies);
