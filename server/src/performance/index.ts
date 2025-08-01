/**
 * Performance Testing and Optimization Suite
 * 
 * This module provides comprehensive performance testing, monitoring, and optimization
 * capabilities for the collaborative editing system.
 */

export { PerformanceTestSuite, SimulatedUser, TEST_SCENARIOS } from './PerformanceTestSuite';
export type { 
  TestScenario, 
  PerformanceMetrics, 
  OperationType, 
  DocumentComplexity, 
  NetworkConditions 
 from './PerformanceTestSuite';

export { MetricsCollector } from './MetricsCollector';
export type { 
  SystemMetrics, 
  WebSocketMetrics, 
  CollaborationMetrics, 
  PerformanceThresholds, 
  PerformanceAlert, 
  MetricsWindow 
 from './MetricsCollector';

export { PerformanceDashboard } from './PerformanceDashboard';
export type { 
  DashboardConfig, 
  DashboardData 
 from './PerformanceDashboard';

export { LoadTestRunner } from './LoadTestRunner';
export type { 
  LoadTestConfig, 
  LoadTestResult 
 from './LoadTestRunner';

export { PerformanceOptimizer } from './PerformanceOptimizer';
export type { 
  OptimizationStrategy, 
  OptimizationAction, 
  OptimizationResult 
 from './PerformanceOptimizer';

// Internal imports for PerformanceSystem class
import { MetricsCollector } from './MetricsCollector';
import { PerformanceDashboard } from './PerformanceDashboard';
import { LoadTestRunner } from './LoadTestRunner';
import { PerformanceOptimizer } from './PerformanceOptimizer';

/**
 * Complete performance testing and optimization system
 */
export class PerformanceSystem {
  private metricsCollector: MetricsCollector;
  private dashboard: PerformanceDashboard;
  private loadTestRunner: LoadTestRunner;
  private optimizer: PerformanceOptimizer;
  private isRunning: boolean = false;

  constructor() {
    this.metricsCollector = new MetricsCollector();
    this.dashboard = new PerformanceDashboard(this.metricsCollector);
    this.loadTestRunner = new LoadTestRunner();
    this.optimizer = new PerformanceOptimizer(this.metricsCollector);

    this.setupIntegrations();


  /**
   * Start the complete performance system
   */
  start(): void {
    if (this.isRunning) {
      return;


    console.log('Starting performance testing and optimization system');
    
    this.metricsCollector.startCollection();
    this.dashboard.start();
    this.optimizer.start();
    
    this.isRunning = true;
    console.log('Performance system started successfully');


  /**
   * Stop the performance system
   */
  stop(): void {
    if (!this.isRunning) {
      return;


    console.log('Stopping performance system');
    
    this.optimizer.stop();
    this.dashboard.stop();
    this.metricsCollector.stopCollection();
    this.loadTestRunner.stop();
    
    this.isRunning = false;
    console.log('Performance system stopped');


  /**
   * Get system components
   */
  getComponents() {
    return {
      metricsCollector: this.metricsCollector,
      dashboard: this.dashboard,
      loadTestRunner: this.loadTestRunner,
      optimizer: this.optimizer
    };


  /**
   * Run comprehensive performance assessment
   */
  async runPerformanceAssessment(serverUrl: string): Promise<any> {

    console.log('Starting comprehensive performance assessment');
    
    // Run predefined test scenarios
    const testConfigs = LoadTestRunner.createCollaborativeEditingTests(serverUrl);
    const results = await this.loadTestRunner.runTestSuite(testConfigs);
    
    // Generate assessment report
    const report = {
      timestamp: Date.now(),
      summary: {
        totalTests: results.length,
        passedTests: results.filter(r => r.summary.successRate >= 95).length,
        averageLatency: results.reduce((acc, r) => acc + r.summary.averageLatency, 0) / results.length,
        overallThroughput: results.reduce((acc, r) => acc + r.summary.throughput, 0)

      recommendations: this.optimizer.getRecommendations(),
      results
    };
    
    console.log('Performance assessment completed');
    return report;


  /**
   * Setup integrations between components
   */
  private setupIntegrations(): void {
    // Connect dashboard to load test runner
    this.loadTestRunner.setDashboard(this.dashboard);
    
    // Connect optimizer to dashboard
    this.dashboard.setWebSocketServer = (wsServer) => {
      this.optimizer.setWebSocketServer(wsServer);
    };

