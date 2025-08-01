/**
 * Security Alerting Framework Factory
 * 
 * Factory class for creating and configuring the unified security alerting framework
 * with proper initialization of all components, service integrations, and default configurations.
 * 
 * Epic 19 - Data Protection & Privacy Controls
 * Task: E19-1753114711991-016644 - Design security alerting framework
 */

import { Database } from 'sqlite3';
import { logger } from '../../utils/logger';
import {
  UnifiedSecurityAlertingFramework,
  AlertingConfiguration,
  AlertPriority,
  AlertCategory,
  AlertSource,
  NotificationChannel,
  EscalationRule
 from './UnifiedSecurityAlertingFramework';
import { AlertingConfigurationManager } from './AlertingConfigurationManager';
import { 
  SecurityAlertingAnalytics,
  SecurityAlertingConfig
 from '../../../../packages/core/security/SecurityAlertingAnalytics';
import { HealthMonitoringService } from '../HealthMonitoringService';
import { ProjectHealthAlertService } from '../project-health-alert-service';
import { AttributionService } from '../attribution-service';
import { AnalyticsDAO } from '../../database/analytics-dao';



export interface FrameworkInitializationOptions {
  // Database configuration
  database: Database;
  
  // Service dependencies
  attributionService?: AttributionService;
  analyticsDAO?: AnalyticsDAO;
  
  // Configuration overrides
  configurationOverrides?: Partial<AlertingConfiguration>;
  
  // Feature flags
  enableSecurityAnalytics?: boolean;
  enableHealthMonitoring?: boolean;
  enableProjectHealth?: boolean;
  enableRealTimeProcessing?: boolean;
  enableMachineLearning?: boolean;
  
  // Integration settings
  notificationChannels?: NotificationChannel[];
  escalationRules?: EscalationRule[];
  
  // Environment settings
  environment?: 'development' | 'staging' | 'production';
  logLevel?: 'error' | 'warn' | 'info' | 'debug';







export interface FrameworkComponents {
  framework: UnifiedSecurityAlertingFramework;
  configurationManager: AlertingConfigurationManager;
  securityAnalytics: SecurityAlertingAnalytics;
  healthMonitoring: HealthMonitoringService;
  projectHealthService: ProjectHealthAlertService;





/**
 * Factory for creating and configuring the security alerting framework
 */
export class SecurityAlertingFrameworkFactory {
  
  /**
   * Create complete security alerting framework with all components
   */
  static async createFramework(options: FrameworkInitializationOptions): Promise<FrameworkComponents> {

    logger.info('Initializing Security Alerting Framework', {
      environment: options.environment || 'development',
      enableSecurityAnalytics: options.enableSecurityAnalytics !== false,
      enableHealthMonitoring: options.enableHealthMonitoring !== false,
      enableProjectHealth: options.enableProjectHealth !== false
    });
    
    try {
      // Create configuration
      const configuration = this.createDefaultConfiguration(options);
      
      // Initialize service components
      const securityAnalytics = await this.createSecurityAnalytics(configuration, options);
      const healthMonitoring = this.createHealthMonitoring(options);
      const projectHealthService = this.createProjectHealthService(options);
      
      // Create configuration manager
      const configurationManager = new AlertingConfigurationManager(configuration);
      
      // Create main framework
      const framework = new UnifiedSecurityAlertingFramework(
        configuration,
        securityAnalytics,
        healthMonitoring,
        projectHealthService
      );
      
      // Apply additional configuration
      await this.applyAdditionalConfiguration(framework, configurationManager, options);
      
      // Setup framework integrations
      await this.setupFrameworkIntegrations(framework, {
        securityAnalytics,
        healthMonitoring,
        projectHealthService,
        configurationManager
      });
      
      logger.info('Security Alerting Framework initialized successfully');
      
      return {
        framework,
        configurationManager,
        securityAnalytics,
        healthMonitoring,
        projectHealthService
      };
 catch (error) {
      logger.error('Failed to initialize Security Alerting Framework', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;


  
  /**
   * Create framework with minimal configuration for testing
   */
  static createTestFramework(options: Partial<FrameworkInitializationOptions> = {}): FrameworkComponents {
    const testOptions: FrameworkInitializationOptions = {
      database: options.database || {} as Database,
      environment: 'development',
      enableRealTimeProcessing: false,
      enableMachineLearning: false,
      configurationOverrides: {
        enableRealTimeProcessing: false,
        enableCorrelation: true,
        enableAutomaticEscalation: false,
        enableMachineLearning: false,
        alertRetentionDays: 7,
        logRetentionDays: 3,
        maxConcurrentProcessing: 5,
        processingTimeout: 5000,
        batchSize: 10,
        ...options.configurationOverrides

      ...options
    };
    
    // Synchronous creation for testing
    return this.createFrameworkSync(testOptions);

  
  // PRIVATE FACTORY METHODS
  
  private static createDefaultConfiguration(options: FrameworkInitializationOptions): AlertingConfiguration {
    const environment = options.environment || 'development';
    
    // Environment-specific defaults
    const environmentDefaults = this.getEnvironmentDefaults(environment);
    
    const defaultConfig: AlertingConfiguration = {
      // General settings
      enableRealTimeProcessing: options.enableRealTimeProcessing !== false,
      enableCorrelation: true,
      enableAutomaticEscalation: environment === 'production',
      enableMachineLearning: options.enableMachineLearning !== false && environment === 'production',
      
      // Thresholds (environment-specific)
      criticalAlertThreshold: environmentDefaults.criticalThreshold,
      highAlertThreshold: environmentDefaults.highThreshold,
      correlationTimeWindow: environmentDefaults.correlationWindow,
      escalationTimeout: environmentDefaults.escalationTimeout,
      
      // Retention policies
      alertRetentionDays: environmentDefaults.alertRetentionDays,
      logRetentionDays: environmentDefaults.logRetentionDays,
      archivedAlertRetentionDays: environmentDefaults.archivedRetentionDays,
      
      // Performance settings
      maxConcurrentProcessing: environmentDefaults.maxConcurrent,
      processingTimeout: environmentDefaults.processingTimeout,
      batchSize: environmentDefaults.batchSize,
      
      // Integration settings
      securityAnalyticsConfig: this.createSecurityAnalyticsConfig(options),
      healthMonitoringEnabled: options.enableHealthMonitoring !== false,
      projectHealthEnabled: options.enableProjectHealth !== false,
      
      // Notification and escalation
      notificationChannels: options.notificationChannels || this.createDefaultNotificationChannels(environment),
      escalationChain: options.escalationRules || this.createDefaultEscalationChain(environment)
    };
    
    // Apply configuration overrides
    return { ...defaultConfig, ...options.configurationOverrides };

  
  private static getEnvironmentDefaults(environment: string) {
    switch (environment) {
    case 'production':
      return {
        criticalThreshold: 3,
        highThreshold: 10,
        correlationWindow: 300000, // 5 minutes
        escalationTimeout: 1800000, // 30 minutes
        alertRetentionDays: 365,
        logRetentionDays: 90,
        archivedRetentionDays: 2555, // 7 years
        maxConcurrent: 50,
        processingTimeout: 30000,
        batchSize: 100
      };
    case 'staging':
      return {
        criticalThreshold: 5,
        highThreshold: 15,
        correlationWindow: 600000, // 10 minutes
        escalationTimeout: 3600000, // 1 hour
        alertRetentionDays: 90,
        logRetentionDays: 30,
        archivedRetentionDays: 365,
        maxConcurrent: 20,
        processingTimeout: 15000,
        batchSize: 50
      };
    default: // development
      return {
        criticalThreshold: 10,
        highThreshold: 25,
        correlationWindow: 1800000, // 30 minutes
        escalationTimeout: 7200000, // 2 hours
        alertRetentionDays: 30,
        logRetentionDays: 7,
        archivedRetentionDays: 90,
        maxConcurrent: 10,
        processingTimeout: 10000,
        batchSize: 20
      };


  
  private static createSecurityAnalyticsConfig(options: FrameworkInitializationOptions): Partial<SecurityAlertingConfig> {
    const environment = options.environment || 'development';
    
    return {
      enableRealTimeAnalytics: options.enableRealTimeProcessing !== false,
      enablePatternAnalysis: true,
      enableThreatIntelligence: environment === 'production',
      enableAutomatedResponse: environment === 'production',
      alertRetentionDays: environment === 'production' ? 365 : 30,
      patternAnalysisWindow: 3600000, // 1 hour
      threatIntelligenceUpdate: 86400000, // 24 hours
      machinelearningEnabled: options.enableMachineLearning !== false,
      escalationThresholds: {
        criticalAlertCount: 3,
        highAlertCount: 10,
        correlatedAlertCount: 5,
        timeWindowMinutes: 60,
        failedAccessAttempts: 5,
        dataExfiltrationThreshold: 100, // MB
        anomalyScoreThreshold: 0.8

      correlationRules: [],
      responseAutomation: {
        enabled: environment === 'production',
        confidenceThreshold: 0.9,
        maxAutomaticActions: 10,
        cooldownPeriod: 300000, // 5 minutes
        approvalBypass: {
          emergencyConditions: ['CRITICAL_SECURITY_INCIDENT'],
          bypassApprovers: [],
          auditRequired: true,
          timeLimit: 3600000 // 1 hour

        responseTemplates: []

    };

  
  private static createDefaultNotificationChannels(environment: string): NotificationChannel[] {
    const channels: NotificationChannel[] = [];
    
    // Console/Log channel for all environments
    channels.push({
      id: 'console-default',
      type: 'EMAIL', // Would be 'CONSOLE' in real implementation
      name: 'Console Logging',
      enabled: true,
      configuration: {
        logLevel: environment === 'production' ? 'error' : 'info'

      conditions: [],
      rateLimits: {
        maxPerMinute: 100,
        maxPerHour: 1000,
        maxPerDay: 10000

    });
    
    // Email notifications for production
    if (environment === 'production') {
      channels.push({
        id: 'email-critical',
        type: 'EMAIL',
        name: 'Critical Alerts Email',
        enabled: true,
        configuration: {
          recipients: ['security@company.com', 'ops@company.com'],
          subject: '[CRITICAL] Security Alert: {{title}}',
          template: 'critical-alert'

        conditions: [
          {
            field: 'priority',
            operator: 'IN',
            value: ['CRITICAL', 'EMERGENCY']

        ],
        rateLimits: {
          maxPerMinute: 5,
          maxPerHour: 50,
          maxPerDay: 200

      });

    
    return channels;

  
  private static createDefaultEscalationChain(environment: string): EscalationRule[] {
    const escalationRules: EscalationRule[] = [];
    
    if (environment === 'production') {
      // Level 1: Immediate notification for critical alerts
      escalationRules.push({
        level: 1,
        triggerAfter: 0, // Immediate
        conditions: [
          {
            condition: 'priority',
            value: 'CRITICAL'

        ],
        actions: [
          {
            type: 'EMAIL',
            parameters: {
              recipients: ['security-oncall@company.com']

            conditions: [],
            enabled: true

        ]
      });
      
      // Level 2: Escalate unacknowledged critical alerts after 15 minutes
      escalationRules.push({
        level: 2,
        triggerAfter: 900000, // 15 minutes
        conditions: [
          {
            condition: 'status',
            value: 'NEW'

          {
            condition: 'priority',
            value: 'CRITICAL'

        ],
        actions: [
          {
            type: 'PAGER',
            parameters: {
              service: 'security-team'

            conditions: [],
            enabled: true

        ],
        assignTo: ['security-manager@company.com']
      });
      
      // Level 3: Executive escalation for emergency alerts after 30 minutes
      escalationRules.push({
        level: 3,
        triggerAfter: 1800000, // 30 minutes
        conditions: [
          {
            condition: 'priority',
            value: 'EMERGENCY'

        ],
        actions: [
          {
            type: 'PAGER',
            parameters: {
              service: 'executive-team'

            conditions: [],
            enabled: true

        ],
        assignTo: ['ciso@company.com', 'cto@company.com']
      });
 else {
      // Development/staging: simpler escalation
      escalationRules.push({
        level: 1,
        triggerAfter: 3600000, // 1 hour
        conditions: [
          {
            condition: 'status',
            value: 'NEW'

        ],
        actions: [
          {
            type: 'EMAIL',
            parameters: {
              recipients: ['dev-team@company.com']

            conditions: [],
            enabled: true

        ]
      });

    
    return escalationRules;

  
  private static async createSecurityAnalytics(
    configuration: AlertingConfiguration,
    options: FrameworkInitializationOptions
  ): Promise<SecurityAlertingAnalytics> {

    if (options.enableSecurityAnalytics === false) {
      // Return mock analytics for testing
      return {} as SecurityAlertingAnalytics;

    
    const analyticsConfig: SecurityAlertingConfig = {
      ...configuration.securityAnalyticsConfig,
      enableRealTimeAnalytics: configuration.enableRealTimeProcessing,
      machinelearningEnabled: configuration.enableMachineLearning
 as SecurityAlertingConfig;
    
    return new SecurityAlertingAnalytics(analyticsConfig);

  
  private static createHealthMonitoring(options: FrameworkInitializationOptions): HealthMonitoringService {
    const healthMonitoring = HealthMonitoringService.getInstance();
    
    if (options.enableHealthMonitoring !== false) {
      // Register default health checks
      if (options.database) {
        healthMonitoring.registerDatabaseHealthCheck(async () => {
          // Mock database check for now
          return true;
        });


    
    return healthMonitoring;

  
  private static createProjectHealthService(options: FrameworkInitializationOptions): ProjectHealthAlertService {
    if (!options.database) {
      throw new Error('Database is required for ProjectHealthAlertService');

    
    const attributionService = options.attributionService || {} as AttributionService;
    const analyticsDAO = options.analyticsDAO || {} as AnalyticsDAO;
    
    return new ProjectHealthAlertService(
      options.database,
      attributionService,
      analyticsDAO
    );

  
  private static async applyAdditionalConfiguration(
    framework: UnifiedSecurityAlertingFramework,
    configurationManager: AlertingConfigurationManager,
    options: FrameworkInitializationOptions
  ): Promise<void> {

    // Apply default alert rules
    const defaultRules = this.createDefaultAlertRules(options.environment || 'development');
    
    for (const rule of defaultRules) {
      try {
        await configurationManager.createAlertRule(rule, 'system');
 catch (error) {
        logger.warn('Failed to create default alert rule', {
          ruleName: rule.name,
          error: error instanceof Error ? error.message : String(error)
        });



  
  private static createDefaultAlertRules(environment: string) {
    const rules = [];
    
    // Critical security incident rule
    rules.push({
      name: 'Critical Security Incident Detection',
      description: 'Detects and escalates critical security incidents',
      enabled: true,
      conditions: [
        {
          field: 'category',
          operator: 'IN' as const,
          value: ['SECURITY_INCIDENT', 'THREAT_DETECTION'],
          weight: 1.0

        {
          field: 'priority',
          operator: 'IN' as const,
          value: ['CRITICAL', 'EMERGENCY'],
          weight: 1.0

      ],
      sources: [AlertSource.SECURITY_ANALYTICS, AlertSource.THREAT_DETECTION] as AlertSource[],
      categories: [AlertCategory.SECURITY_INCIDENT, AlertCategory.THREAT_DETECTION] as AlertCategory[],
      minimumPriority: AlertPriority.HIGH,
      actions: [
        {
          type: 'EMAIL' as const,
          parameters: {
            template: 'critical-security-alert',
            priority: 'high'

          conditions: [],
          enabled: true

      ],
      cooldownPeriod: 300000, // 5 minutes
      maxExecutionsPerHour: 10,
      createdBy: 'system'
    });
    
    // System health degradation rule
    rules.push({
      name: 'System Health Degradation',
      description: 'Monitors system health and alerts on degradation',
      enabled: true,
      conditions: [
        {
          field: 'category',
          operator: 'EQUALS' as const,
          value: 'SYSTEM_HEALTH',
          weight: 1.0

        {
          field: 'severity',
          operator: 'IN' as const,
          value: ['ERROR', 'CRITICAL'],
          weight: 0.8

      ],
      sources: [AlertSource.HEALTH_MONITORING] as AlertSource[],
      categories: [AlertCategory.SYSTEM_HEALTH] as AlertCategory[],
      minimumPriority: AlertPriority.MEDIUM,
      actions: [
        {
          type: 'WEBHOOK' as const,
          parameters: {
            url: '/api/system-health/alert',
            method: 'POST'

          conditions: [],
          enabled: environment === 'production'

      ],
      cooldownPeriod: 600000, // 10 minutes
      maxExecutionsPerHour: 20,
      createdBy: 'system'
    });
    
    return rules;

  
  private static async setupFrameworkIntegrations(
    framework: UnifiedSecurityAlertingFramework,
    components: {
      securityAnalytics: SecurityAlertingAnalytics;
      healthMonitoring: HealthMonitoringService;
      projectHealthService: ProjectHealthAlertService;
      configurationManager: AlertingConfigurationManager;

  ): Promise<void> {

    // Setup cross-component event handlers
    components.configurationManager.on('alertRuleCreated', (data) => {
      logger.info('New alert rule created', {
        ruleId: data.rule.id,
        name: data.rule.name
      });
    });
    
    components.configurationManager.on('configurationUpdated', (data) => {
      logger.info('Alerting configuration updated', {
        userId: data.userId
      });
    });
    
    // Setup health monitoring integration
    if (components.healthMonitoring.isMonitoringActive()) {
      components.healthMonitoring.startMonitoring(30000); // 30 second intervals

    
    logger.info('Framework integrations setup completed');

  
  /**
   * Synchronous framework creation for testing
   */
  private static createFrameworkSync(options: FrameworkInitializationOptions): FrameworkComponents {
    const configuration = this.createDefaultConfiguration(options);
    
    // Create mock components for testing
    const securityAnalytics = {} as SecurityAlertingAnalytics;
    const healthMonitoring = HealthMonitoringService.getInstance();
    const projectHealthService = {} as ProjectHealthAlertService;
    
    const configurationManager = new AlertingConfigurationManager(configuration);
    const framework = new UnifiedSecurityAlertingFramework(
      configuration,
      securityAnalytics,
      healthMonitoring,
      projectHealthService
    );
    
    return {
      framework,
      configurationManager,
      securityAnalytics,
      healthMonitoring,
      projectHealthService
    };

  
  /**
   * Validate framework prerequisites
   */
  static validatePrerequisites(options: FrameworkInitializationOptions): string[] {
    const errors: string[] = [];
    
    if (!options.database) {
      errors.push('Database instance is required');

    
    if (options.enableProjectHealth !== false && !options.attributionService) {
      errors.push('AttributionService is required when project health monitoring is enabled');

    
    if (options.enableProjectHealth !== false && !options.analyticsDAO) {
      errors.push('AnalyticsDAO is required when project health monitoring is enabled');

    
    // Validate notification channels
    if (options.notificationChannels) {
      options.notificationChannels.forEach((channel, index) => {
        if (!channel.name || !channel.type) {
          errors.push(`Notification channel ${index} is missing required fields`);

      });

    
    return errors;



export default SecurityAlertingFrameworkFactory;