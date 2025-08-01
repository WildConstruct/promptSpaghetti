/**
 * Optimization Tools Integration
 * 
 * Integration layer that connects the optimization tools with the main
 * application server, providing unified access to administrative optimization
 * capabilities across the system.
 * 
 * Part of Epic 17 - Backstage Admin Controls
 * Task: E17-1753114397433-A161F7 - Create optimization tools
 */

import { FastifyInstance } from 'fastify';
import { OptimizationToolsService } from './OptimizationToolsService';
import { OptimizationDashboard } from './OptimizationDashboard';
import { OptimizationCLI } from './OptimizationCLI';
import { PerformanceMonitor } from '../monitoring/PerformanceMonitor';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import optimizationConfig from './optimization-config.json';



export interface OptimizationIntegrationConfig {
  enabled: boolean;
  enableWebDashboard: boolean;
  enableCLI: boolean;
  enableAutoOptimization: boolean;
  dashboardPath: string;
  cliPath: string;
  updateInterval: number; // milliseconds





/**
 * Optimization Tools Integration Service
 * 
 * Coordinates all optimization tools and integrates them with the main application
 */
export class OptimizationIntegration {
  private config: OptimizationIntegrationConfig;
  private optimizationService: OptimizationToolsService;
  private optimizationDashboard?: OptimizationDashboard;
  private optimizationCLI?: OptimizationCLI;
  
  // Service Dependencies
  private databaseService: DatabaseService;
  private redisService: RedisService;
  private auditService: AuditService;
  private performanceMonitor: PerformanceMonitor;

  constructor(
    config: OptimizationIntegrationConfig,
    dependencies: {
      databaseService: DatabaseService;
      redisService: RedisService;
      auditService: AuditService;
      performanceMonitor: PerformanceMonitor;
    }
  ) {
    this.config = config;
    this.databaseService = dependencies.databaseService;
    this.redisService = dependencies.redisService;
    this.auditService = dependencies.auditService;
    this.performanceMonitor = dependencies.performanceMonitor;


  /**
   * Initialize optimization tools integration
   */
  public async initialize(): Promise<void> {

    if (!this.config.enabled) {
      console.log('⏭️  Optimization tools disabled in configuration');
      return;


    console.log('🔧 Initializing Optimization Tools Integration...');

    try {
      // Initialize core optimization service
      await this.initializeOptimizationService();
      
      // Initialize web dashboard if enabled
      if (this.config.enableWebDashboard) {
        await this.initializeWebDashboard();

      
      // Initialize CLI tools if enabled
      if (this.config.enableCLI) {
        await this.initializeCLITools();

      
      // Setup auto-optimization if enabled
      if (this.config.enableAutoOptimization) {
        await this.setupAutoOptimization();

      
      // Setup integration monitoring
      await this.setupIntegrationMonitoring();
      
      console.log('✅ Optimization Tools Integration initialized successfully');
 catch (error) {
      console.error('❌ Failed to initialize Optimization Tools Integration:', error);
      throw error;



  /**
   * Register optimization routes with Fastify server
   */
  public registerRoutes(server: FastifyInstance): void {
    if (!this.config.enabled) return;

    // Register optimization dashboard routes
    if (this.optimizationDashboard) {
      this.optimizationDashboard.registerRoutes(server);
      console.log(`📊 Optimization dashboard routes registered at ${this.config.dashboardPath}`);


    // Register main optimization status endpoint
    server.get('/api/admin/optimization/status', async (request, reply) => {
      try {
        const status = await this.getIntegrationStatus();
        return reply.code(200).send({
          success: true,
          data: status
        });
 catch (error) {
        return reply.code(500).send({
          success: false,
          error: error.message
        });

    });

    // Register optimization configuration endpoint
    server.get('/api/admin/optimization/config', async (request, reply) => {
      return reply.code(200).send({
        success: true,
        data: {
          enabled: this.config.enabled,
          webDashboard: this.config.enableWebDashboard,
          cli: this.config.enableCLI,
          autoOptimization: this.config.enableAutoOptimization,
          categories: optimizationConfig.optimizationCategories,
          quickActions: optimizationConfig.quickActions

      });
    });

    console.log('🔗 Optimization integration routes registered');


  /**
   * Get optimization integration status
   */
  public async getIntegrationStatus(): Promise<any> {

    const dashboardData = await this.optimizationService.getOptimizationDashboard();
    
    return {
      integration: {
        enabled: this.config.enabled,
        services: {
          optimizationService: 'active',
          webDashboard: this.optimizationDashboard ? 'active' : 'disabled',
          cliTools: this.optimizationCLI ? 'active' : 'disabled'

        lastUpdate: new Date(),
        version: optimizationConfig.optimizationTools.version

      system: {
        healthScore: dashboardData.systemHealth.overallScore,
        activeOptimizations: dashboardData.optimization.activeOptimizations,
        totalRecommendations: dashboardData.recommendations.total,
        activePolicies: dashboardData.policies.activePolicies

      performance: {
        performanceGain: dashboardData.optimization.impactMetrics.performanceGain,
        costSavings: dashboardData.optimization.impactMetrics.costSavings,
        efficiencyImprovement: dashboardData.optimization.impactMetrics.efficiencyImprovement

      configuration: {
        updateInterval: this.config.updateInterval,
        autoOptimization: this.config.enableAutoOptimization,
        categories: Object.keys(optimizationConfig.optimizationCategories).length,
        policies: optimizationConfig.defaultPolicies.length,
        profiles: optimizationConfig.defaultProfiles.length

    };


  /**
   * Shutdown optimization tools integration
   */
  public async shutdown(): Promise<void> {

    console.log('⏹️  Shutting down Optimization Tools Integration...');
    
    // Stop optimization service monitoring
    if (this.optimizationService) {
      // The service doesn't have a stop method in the current implementation
      // but would be added for proper cleanup

    
    console.log('✅ Optimization Tools Integration shut down successfully');


  // Private initialization methods

  /**
   * Initialize core optimization service
   */
  private async initializeOptimizationService(): Promise<void> {

    console.log('⚡ Initializing Optimization Service...');
    
    this.optimizationService = new OptimizationToolsService({
      databaseService: this.databaseService,
      redisService: this.redisService,
      auditService: this.auditService,
      performanceMonitor: this.performanceMonitor
    });
    
    await this.optimizationService.initialize();
    
    // Load default policies and profiles
    await this.loadDefaultConfiguration();
    
    console.log('✅ Optimization Service initialized');


  /**
   * Initialize web dashboard
   */
  private async initializeWebDashboard(): Promise<void> {

    console.log('📊 Initializing Web Dashboard...');
    
    this.optimizationDashboard = new OptimizationDashboard(
      this.optimizationService,
      {
        databaseService: this.databaseService,
        redisService: this.redisService,
        auditService: this.auditService
      }
    );
    
    console.log('✅ Web Dashboard initialized');


  /**
   * Initialize CLI tools
   */
  private async initializeCLITools(): Promise<void> {

    console.log('💻 Initializing CLI Tools...');
    
    this.optimizationCLI = new OptimizationCLI(this.optimizationService);
    
    console.log('✅ CLI Tools initialized');


  /**
   * Setup auto-optimization
   */
  private async setupAutoOptimization(): Promise<void> {

    console.log('🤖 Setting up Auto-Optimization...');
    
    // Listen for critical alerts and auto-apply approved policies
    this.performanceMonitor.on('alert_triggered', async (alert) => {
      await this.handleAutoOptimizationAlert(alert);
    });
    
    // Periodic optimization checks
    setInterval(async () => {
      await this.performPeriodicOptimizations();
    }, this.config.updateInterval);
    
    console.log('✅ Auto-Optimization configured');


  /**
   * Setup integration monitoring
   */
  private async setupIntegrationMonitoring(): Promise<void> {

    console.log('📈 Setting up Integration Monitoring...');
    
    // Monitor optimization service health
    setInterval(async () => {
      await this.checkServiceHealth();
    }, 60000); // Check every minute
    
    // Log integration metrics
    this.optimizationService.on('recommendations_generated', (recommendations) => {
      console.log(`🎯 Generated ${recommendations.length} new optimization recommendations`);
      this.performanceMonitor.recordMetric('optimization_recommendations_generated', recommendations.length);
    });
    
    this.optimizationService.on('policy_created', (policy) => {
      console.log(`📋 Created new optimization policy: ${policy.name}`);
      this.performanceMonitor.recordMetric('optimization_policies_created', 1);
    });
    
    this.optimizationService.on('recommendation_applied', (event) => {
      console.log(`⚡ Applied optimization: ${event.recommendation.title}`);
      this.performanceMonitor.recordMetric('optimizations_applied', 1);
      
      if (event.result.success) {
        this.performanceMonitor.recordMetric('optimizations_successful', 1);
 else {
        this.performanceMonitor.recordMetric('optimizations_failed', 1);

    });
    
    console.log('✅ Integration Monitoring configured');


  /**
   * Load default configuration from config file
   */
  private async loadDefaultConfiguration(): Promise<void> {

    console.log('⚙️  Loading default optimization configuration...');
    
    try {
      // Create default policies
      for (const policyConfig of optimizationConfig.defaultPolicies) {
        try {
          await this.optimizationService.createOptimizationPolicy(policyConfig, 'system');
          console.log(`📋 Created default policy: ${policyConfig.name}`);
 catch (error) {
          if (!error.message.includes('already exists')) {
            console.warn(`⚠️  Failed to create policy ${policyConfig.name}:`, error.message);



      
      // Create default profiles
      for (const profileConfig of optimizationConfig.defaultProfiles) {
        try {
          await this.optimizationService.createOptimizationProfile(profileConfig);
          console.log(`⚙️  Created default profile: ${profileConfig.name}`);
 catch (error) {
          if (!error.message.includes('already exists')) {
            console.warn(`⚠️  Failed to create profile ${profileConfig.name}:`, error.message);



      
      console.log('✅ Default configuration loaded');
 catch (error) {
      console.warn('⚠️  Some default configuration items could not be loaded:', error.message);



  /**
   * Handle auto-optimization alerts
   */
  private async handleAutoOptimizationAlert(alert: any): Promise<void> {

    if (!this.config.enableAutoOptimization) return;
    
    try {
      console.log(`🚨 Processing auto-optimization alert: ${alert.title}`);
      
      // Get dashboard for current recommendations
      const dashboard = await this.optimizationService.getOptimizationDashboard();
      
      // Find high-priority recommendations that can be auto-applied
      const autoApplicableRecommendations = dashboard.recommendations.recent?.filter(rec => 
        (rec.priority === 'critical' || rec.priority === 'high') &&
        rec.status === 'approved' &&
        rec.affectedSystems.some(system => alert.affectedSystems?.includes(system))
      ) || [];
      
      // Apply auto-applicable recommendations
      for (const recommendation of autoApplicableRecommendations) {
        try {
          await this.optimizationService.applyOptimizationRecommendation(
            recommendation.recommendationId,
            'auto-optimization',
            { dryRun: false }
          );
          
          console.log(`⚡ Auto-applied optimization: ${recommendation.title}`);
 catch (error) {
          console.error(`❌ Failed to auto-apply optimization ${recommendation.title}:`, error.message);


 catch (error) {
      console.error('❌ Error handling auto-optimization alert:', error.message);



  /**
   * Perform periodic optimizations
   */
  private async performPeriodicOptimizations(): Promise<void> {

    try {
      // Generate new recommendations
      await this.optimizationService.generateRecommendations();
      
      // Check for expired recommendations and clean them up
      // This would be implemented in the optimization service
 catch (error) {
      console.error('❌ Error performing periodic optimizations:', error.message);



  /**
   * Check service health
   */
  private async checkServiceHealth(): Promise<void> {

    try {
      const dashboard = await this.optimizationService.getOptimizationDashboard();
      
      // Record health metrics
      this.performanceMonitor.recordMetric('optimization_system_health', dashboard.systemHealth.overallScore);
      this.performanceMonitor.recordMetric('optimization_active_count', dashboard.optimization.activeOptimizations);
      this.performanceMonitor.recordMetric('optimization_recommendations_total', dashboard.recommendations.total);
      
      // Check for critical health issues
      if (dashboard.systemHealth.overallScore < 60) {
        console.warn(`⚠️  Low optimization system health score: ${dashboard.systemHealth.overallScore}`);
        
        // Trigger emergency optimizations if enabled
        if (this.config.enableAutoOptimization) {
          // This could trigger emergency optimization procedures


 catch (error) {
      console.error('❌ Error checking service health:', error.message);




/**
 * Factory function to create and initialize optimization integration
 */
export async function createOptimizationIntegration(
  config: OptimizationIntegrationConfig,
  dependencies: {
    databaseService: DatabaseService;
    redisService: RedisService;
    auditService: AuditService;
    performanceMonitor: PerformanceMonitor;
  }
): Promise<OptimizationIntegration> {

  const integration = new OptimizationIntegration(config, dependencies);
  await integration.initialize();
  return integration;


/**
 * Default configuration for optimization integration
 */
export const defaultOptimizationConfig: OptimizationIntegrationConfig = {
  enabled: true,
  enableWebDashboard: true,
  enableCLI: true,
  enableAutoOptimization: false, // Disabled by default for safety
  dashboardPath: '/admin/optimization',
  cliPath: '/usr/local/bin/optimization-cli',
  updateInterval: 5 * 60 * 1000 // 5 minutes
};

/**
 * Example usage in main server file:
 * 
 * ```typescript
 * import { createOptimizationIntegration, defaultOptimizationConfig } from './admin/OptimizationIntegration';
 * 
 * // In server initialization
 * const optimizationIntegration = await createOptimizationIntegration(
 *   defaultOptimizationConfig,
 *   { databaseService, redisService, auditService, performanceMonitor }
 * );
 * 
 * // Register routes
 * optimizationIntegration.registerRoutes(server);
 * 
 * // In server shutdown
 * await optimizationIntegration.shutdown();
 * ```
 */