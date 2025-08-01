/**
 * Alerting Configuration Management System
 * 
 * Manages configuration, rules, and policies for the unified security alerting framework.
 * Provides centralized management for alert rules, notification channels, escalation policies,
 * and integration settings with validation and version control.
 * 
 * Epic 19 - Data Protection & Privacy Controls
 * Task: E19-1753114711991-016644 - Design security alerting framework
 */

import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';
import {
  AlertRule,
  NotificationChannel,
  EscalationRule,
  AlertingConfiguration,
  AlertPriority,
  AlertCategory,
  AlertSource,
  RuleAction,
  AlertCondition,
  ChannelCondition,
  ActionCondition
 from './UnifiedSecurityAlertingFramework';



export interface ConfigurationValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];







export interface ConfigurationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'SECURITY' | 'COMPLIANCE' | 'OPERATIONS' | 'CUSTOM';
  version: string;
  configuration: Partial<AlertingConfiguration>;
  rules: AlertRule[];
  channels: NotificationChannel[];
  escalationRules: EscalationRule[];
  metadata: {
    author: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];



  };




export interface ConfigurationChange {
  id: string;
  timestamp: Date;
  userId: string;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE' | 'ENABLE' | 'DISABLE';
  resourceType: 'CONFIGURATION' | 'RULE' | 'CHANNEL' | 'ESCALATION';
  resourceId: string;
  previousValue?: unknown;
  newValue?: unknown;
  description: string;







export interface RuleTestResult {
  ruleId: string;
  testCase: Error;
  matched: boolean;
  conditions: {
    condition: AlertCondition;
    matched: boolean;
    value: Error;



[];
  executionTime: number;




export interface ConfigurationAudit {
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  changes: string[];
  ipAddress?: string;
  userAgent?: string;





/**
 * Configuration Manager for Security Alerting System
 */
export class AlertingConfigurationManager extends EventEmitter {
  private configuration: AlertingConfiguration;
  private alertRules: Map<string, AlertRule> = new Map();
  private notificationChannels: Map<string, NotificationChannel> = new Map();
  private escalationRules: EscalationRule[] = [];
  private configurationTemplates: Map<string, ConfigurationTemplate> = new Map();
  private changeHistory: ConfigurationChange[] = [];
  private auditLog: ConfigurationAudit[] = [];
  
  constructor(initialConfiguration: AlertingConfiguration) {
    super();
    this.configuration = initialConfiguration;
    this.loadDefaultConfiguration();
    this.loadDefaultTemplates();
    
    logger.info('Alerting Configuration Manager initialized');

  
  /**
   * Get current configuration
   */
  getConfiguration(): AlertingConfiguration {
    return { ...this.configuration };

  
  /**
   * Update configuration
   */
  async updateConfiguration(
    updates: Partial<AlertingConfiguration>,
    userId: string
  ): Promise<ConfigurationValidationResult> {

    const validation = this.validateConfiguration({ ...this.configuration, ...updates });
    
    if (!validation.valid) {
      return validation;

    
    const previousConfig = { ...this.configuration };
    this.configuration = { ...this.configuration, ...updates };
    
    // Record change
    this.recordConfigurationChange({
      changeType: 'UPDATE',
      resourceType: 'CONFIGURATION',
      resourceId: 'main',
      previousValue: previousConfig,
      newValue: this.configuration,
      userId,
      description: 'Configuration updated'
    });
    
    this.emit('configurationUpdated', {
      previousConfig,
      newConfig: this.configuration,
      userId
    });
    
    logger.info('Configuration updated', { userId });
    
    return validation;

  
  /**
   * Validate configuration
   */
  validateConfiguration(config: AlertingConfiguration): ConfigurationValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic validation
    if (config.alertRetentionDays < 1) {
      errors.push('Alert retention days must be at least 1');

    if (config.logRetentionDays < 1) {
      errors.push('Log retention days must be at least 1');

    if (config.maxConcurrentProcessing < 1) {
      errors.push('Max concurrent processing must be at least 1');

    if (config.processingTimeout < 1000) {
      errors.push('Processing timeout must be at least 1000ms');

    if (config.batchSize < 1) {
      errors.push('Batch size must be at least 1');

    
    // Threshold validation
    if (config.criticalAlertThreshold < 1) {
      errors.push('Critical alert threshold must be at least 1');

    if (config.highAlertThreshold < 1) {
      errors.push('High alert threshold must be at least 1');

    if (config.correlationTimeWindow < 1000) {
      warnings.push('Correlation time window is very short (< 1 second)');

    if (config.escalationTimeout < 1000) {
      warnings.push('Escalation timeout is very short (< 1 second)');

    
    // Notification channel validation
    config.notificationChannels.forEach((channel, index) => {
      if (!channel.name || channel.name.trim() === '') {
        errors.push(`Notification channel ${index} must have a name`);

      if (!channel.type) {
        errors.push(`Notification channel ${index} must have a type`);

      if (channel.rateLimits.maxPerMinute < 1) {
        warnings.push(`Notification channel ${channel.name} has very low rate limit`);

    });
    
    // Escalation chain validation
    config.escalationChain.forEach((rule, index) => {
      if (rule.level < 1) {
        errors.push(`Escalation rule ${index} level must be at least 1`);

      if (rule.triggerAfter < 1000) {
        warnings.push(`Escalation rule ${index} trigger time is very short`);

      if (rule.actions.length === 0) {
        warnings.push(`Escalation rule ${index} has no actions defined`);

    });
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };

  
  /**
   * Create alert rule
   */
  async createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt' | 'triggerCount'>, userId: string): Promise<AlertRule> {

    const newRule: AlertRule = {
      ...rule,
      id: this.generateRuleId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      triggerCount: 0
    };
    
    const validation = this.validateAlertRule(newRule);
    if (!validation.valid) {
      throw new Error(`Rule validation failed: ${validation.errors.join(', ')}`);

    
    this.alertRules.set(newRule.id, newRule);
    
    this.recordConfigurationChange({
      changeType: 'CREATE',
      resourceType: 'RULE',
      resourceId: newRule.id,
      newValue: newRule,
      userId,
      description: `Created alert rule: ${newRule.name}`
    });
    
    this.emit('alertRuleCreated', { rule: newRule, userId });
    
    logger.info('Alert rule created', {
      ruleId: newRule.id,
      name: newRule.name,
      userId
    });
    
    return newRule;

  
  /**
   * Update alert rule
   */
  async updateAlertRule(
    ruleId: string,
    updates: Partial<AlertRule>,
    userId: string
  ): Promise<AlertRule> {

    const existingRule = this.alertRules.get(ruleId);
    if (!existingRule) {
      throw new Error(`Alert rule not found: ${ruleId}`);

    
    const updatedRule: AlertRule = {
      ...existingRule,
      ...updates,
      id: ruleId, // Ensure ID cannot be changed
      updatedAt: new Date()
    };
    
    const validation = this.validateAlertRule(updatedRule);
    if (!validation.valid) {
      throw new Error(`Rule validation failed: ${validation.errors.join(', ')}`);

    
    this.alertRules.set(ruleId, updatedRule);
    
    this.recordConfigurationChange({
      changeType: 'UPDATE',
      resourceType: 'RULE',
      resourceId: ruleId,
      previousValue: existingRule,
      newValue: updatedRule,
      userId,
      description: `Updated alert rule: ${updatedRule.name}`
    });
    
    this.emit('alertRuleUpdated', {
      previousRule: existingRule,
      newRule: updatedRule,
      userId
    });
    
    return updatedRule;

  
  /**
   * Delete alert rule
   */
  async deleteAlertRule(ruleId: string, userId: string): Promise<void> {

    const rule = this.alertRules.get(ruleId);
    if (!rule) {
      throw new Error(`Alert rule not found: ${ruleId}`);

    
    this.alertRules.delete(ruleId);
    
    this.recordConfigurationChange({
      changeType: 'DELETE',
      resourceType: 'RULE',
      resourceId: ruleId,
      previousValue: rule,
      userId,
      description: `Deleted alert rule: ${rule.name}`
    });
    
    this.emit('alertRuleDeleted', { rule, userId });
    
    logger.info('Alert rule deleted', {
      ruleId,
      name: rule.name,
      userId
    });

  
  /**
   * Enable/disable alert rule
   */
  async toggleAlertRule(ruleId: string, enabled: boolean, userId: string): Promise<AlertRule> {

    const rule = this.alertRules.get(ruleId);
    if (!rule) {
      throw new Error(`Alert rule not found: ${ruleId}`);

    
    const updatedRule = { ...rule, enabled, updatedAt: new Date() };
    this.alertRules.set(ruleId, updatedRule);
    
    this.recordConfigurationChange({
      changeType: enabled ? 'ENABLE' : 'DISABLE',
      resourceType: 'RULE',
      resourceId: ruleId,
      previousValue: rule,
      newValue: updatedRule,
      userId,
      description: `${enabled ? 'Enabled' : 'Disabled'} alert rule: ${rule.name}`
    });
    
    this.emit('alertRuleToggled', { rule: updatedRule, enabled, userId });
    
    return updatedRule;

  
  /**
   * Get alert rule by ID
   */
  getAlertRule(ruleId: string): AlertRule | null {
    return this.alertRules.get(ruleId) || null;

  
  /**
   * Get all alert rules
   */
  getAlertRules(filters: {
    enabled?: boolean;
    category?: AlertCategory;
    source?: AlertSource;
    priority?: AlertPriority;
 = {}): AlertRule[] {
    let rules = Array.from(this.alertRules.values());
    
    if (filters.enabled !== undefined) {
      rules = rules.filter(r => r.enabled === filters.enabled);

    if (filters.category) {
      rules = rules.filter(r => r.categories.includes(filters.category!));

    if (filters.source) {
      rules = rules.filter(r => r.sources.includes(filters.source!));

    if (filters.priority) {
      rules = rules.filter(r => r.minimumPriority === filters.priority);

    
    return rules.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  
  /**
   * Test alert rule against sample data
   */
  testAlertRule(ruleId: string, testData: unknown): RuleTestResult {
    const rule = this.alertRules.get(ruleId);
    if (!rule) {
      throw new Error(`Alert rule not found: ${ruleId}`);

    
    const startTime = Date.now();
    const conditionResults = rule.conditions.map(condition => ({
      condition,
      matched: this.evaluateCondition(testData, condition),
      value: this.getFieldValue(testData, condition.field)
    }));
    
    const matched = conditionResults.every(r => r.matched);
    const executionTime = Date.now() - startTime;
    
    return {
      ruleId,
      testCase: testData,
      matched,
      conditions: conditionResults,
      executionTime
    };

  
  /**
   * Validate alert rule
   */
  validateAlertRule(rule: AlertRule): ConfigurationValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic validation
    if (!rule.name || rule.name.trim() === '') {
      errors.push('Rule name is required');

    if (!rule.description || rule.description.trim() === '') {
      warnings.push('Rule description is recommended');

    if (rule.conditions.length === 0) {
      errors.push('Rule must have at least one condition');

    if (rule.actions.length === 0) {
      warnings.push('Rule has no actions defined');

    if (rule.sources.length === 0) {
      warnings.push('Rule has no sources specified');

    if (rule.categories.length === 0) {
      warnings.push('Rule has no categories specified');

    
    // Condition validation
    rule.conditions.forEach((condition, index) => {
      if (!condition.field || condition.field.trim() === '') {
        errors.push(`Condition ${index + 1} must have a field`);

      if (!condition.operator) {
        errors.push(`Condition ${index + 1} must have an operator`);

      if (condition.weight < 0 || condition.weight > 1) {
        errors.push(`Condition ${index + 1} weight must be between 0 and 1`);

    });
    
    // Action validation
    rule.actions.forEach((action, index) => {
      if (!action.type) {
        errors.push(`Action ${index + 1} must have a type`);

      if (!action.parameters) {
        warnings.push(`Action ${index + 1} has no parameters`);

    });
    
    // Rate limiting validation
    if (rule.maxExecutionsPerHour < 1) {
      warnings.push('Very low execution limit may prevent rule from working effectively');

    if (rule.cooldownPeriod < 1000) {
      warnings.push('Very short cooldown period may cause rule spam');

    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };

  
  /**
   * Create notification channel
   */
  async createNotificationChannel(
    channel: Omit<NotificationChannel, 'id'>,
    userId: string
  ): Promise<NotificationChannel> {

    const newChannel: NotificationChannel = {
      ...channel,
      id: this.generateChannelId()
    };
    
    const validation = this.validateNotificationChannel(newChannel);
    if (!validation.valid) {
      throw new Error(`Channel validation failed: ${validation.errors.join(', ')}`);

    
    this.notificationChannels.set(newChannel.id, newChannel);
    
    this.recordConfigurationChange({
      changeType: 'CREATE',
      resourceType: 'CHANNEL',
      resourceId: newChannel.id,
      newValue: newChannel,
      userId,
      description: `Created notification channel: ${newChannel.name}`
    });
    
    this.emit('notificationChannelCreated', { channel: newChannel, userId });
    
    return newChannel;

  
  /**
   * Update notification channel
   */
  async updateNotificationChannel(
    channelId: string,
    updates: Partial<NotificationChannel>,
    userId: string
  ): Promise<NotificationChannel> {

    const existingChannel = this.notificationChannels.get(channelId);
    if (!existingChannel) {
      throw new Error(`Notification channel not found: ${channelId}`);

    
    const updatedChannel: NotificationChannel = {
      ...existingChannel,
      ...updates,
      id: channelId // Ensure ID cannot be changed
    };
    
    const validation = this.validateNotificationChannel(updatedChannel);
    if (!validation.valid) {
      throw new Error(`Channel validation failed: ${validation.errors.join(', ')}`);

    
    this.notificationChannels.set(channelId, updatedChannel);
    
    this.recordConfigurationChange({
      changeType: 'UPDATE',
      resourceType: 'CHANNEL',
      resourceId: channelId,
      previousValue: existingChannel,
      newValue: updatedChannel,
      userId,
      description: `Updated notification channel: ${updatedChannel.name}`
    });
    
    this.emit('notificationChannelUpdated', {
      previousChannel: existingChannel,
      newChannel: updatedChannel,
      userId
    });
    
    return updatedChannel;

  
  /**
   * Get notification channels
   */
  getNotificationChannels(enabled?: boolean): NotificationChannel[] {
    let channels = Array.from(this.notificationChannels.values());
    
    if (enabled !== undefined) {
      channels = channels.filter(c => c.enabled === enabled);

    
    return channels;

  
  /**
   * Validate notification channel
   */
  validateNotificationChannel(channel: NotificationChannel): ConfigurationValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!channel.name || channel.name.trim() === '') {
      errors.push('Channel name is required');

    if (!channel.type) {
      errors.push('Channel type is required');

    if (!channel.configuration) {
      errors.push('Channel configuration is required');

    
    // Rate limit validation
    if (channel.rateLimits.maxPerMinute < 1) {
      warnings.push('Very low rate limit may prevent notifications');

    if (channel.rateLimits.maxPerHour < channel.rateLimits.maxPerMinute) {
      errors.push('Hourly rate limit cannot be less than per-minute limit');

    if (channel.rateLimits.maxPerDay < channel.rateLimits.maxPerHour) {
      errors.push('Daily rate limit cannot be less than hourly limit');

    
    // Type-specific validation
    switch (channel.type) {
    case 'EMAIL':
      if (!channel.configuration.smtpHost && !channel.configuration.apiKey) {
        errors.push('Email channel requires SMTP configuration or API key');

      break;
    case 'WEBHOOK':
      if (!channel.configuration.url) {
        errors.push('Webhook channel requires URL');

      break;
    case 'SLACK':
      if (!channel.configuration.webhookUrl && !channel.configuration.botToken) {
        errors.push('Slack channel requires webhook URL or bot token');

      break;

    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };

  
  /**
   * Get configuration templates
   */
  getConfigurationTemplates(category?: string): ConfigurationTemplate[] {
    let templates = Array.from(this.configurationTemplates.values());
    
    if (category) {
      templates = templates.filter(t => t.category === category);

    
    return templates.sort((a, b) => b.metadata.updatedAt.getTime() - a.metadata.updatedAt.getTime());

  
  /**
   * Apply configuration template
   */
  async applyConfigurationTemplate(
    templateId: string,
    userId: string,
    overrides: Partial<AlertingConfiguration> = {}
  ): Promise<ConfigurationValidationResult> {

    const template = this.configurationTemplates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);

    
    // Apply template configuration
    const newConfig = {
      ...this.configuration,
      ...template.configuration,
      ...overrides
    };
    
    const validation = await this.updateConfiguration(newConfig, userId);
    
    if (validation.valid) {
      // Apply template rules and channels
      for (const rule of template.rules) {
        await this.createAlertRule(rule, userId);

      
      for (const channel of template.channels) {
        await this.createNotificationChannel(channel, userId);

      
      this.escalationRules = [...template.escalationRules];
      
      this.emit('templateApplied', { template, userId });
      
      logger.info('Configuration template applied', {
        templateId,
        templateName: template.name,
        userId
      });

    
    return validation;

  
  /**
   * Get configuration change history
   */
  getChangeHistory(
    filters: {
      userId?: string;
      resourceType?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
 = {}
  ): ConfigurationChange[] {
    let changes = [...this.changeHistory];
    
    if (filters.userId) {
      changes = changes.filter(c => c.userId === filters.userId);

    if (filters.resourceType) {
      changes = changes.filter(c => c.resourceType === filters.resourceType);

    if (filters.startDate) {
      changes = changes.filter(c => c.timestamp >= filters.startDate!);

    if (filters.endDate) {
      changes = changes.filter(c => c.timestamp <= filters.endDate!);

    
    changes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    if (filters.limit) {
      changes = changes.slice(0, filters.limit);

    
    return changes;

  
  /**
   * Export configuration
   */
  exportConfiguration(): {
    configuration: AlertingConfiguration;
    rules: AlertRule[];
    channels: NotificationChannel[];
    escalationRules: EscalationRule[];
    metadata: {
      exportedAt: Date;
      version: string;
    };
 {
    return {
      configuration: this.configuration,
      rules: Array.from(this.alertRules.values()),
      channels: Array.from(this.notificationChannels.values()),
      escalationRules: this.escalationRules,
      metadata: {
        exportedAt: new Date(),
        version: '1.0.0'

    };

  
  /**
   * Import configuration
   */
  async importConfiguration(
    configData: unknown,
    userId: string,
    options: {
      overwriteExisting?: boolean;
      validateOnly?: boolean;
 = {}
  ): Promise<ConfigurationValidationResult> {

    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Validate structure
      if (!configData.configuration) {
        errors.push('Missing configuration object');

      if (!Array.isArray(configData.rules)) {
        errors.push('Rules must be an array');

      if (!Array.isArray(configData.channels)) {
        errors.push('Channels must be an array');

      if (!Array.isArray(configData.escalationRules)) {
        errors.push('Escalation rules must be an array');

      
      if (errors.length > 0) {
        return { valid: false, errors, warnings };

      
      // Validate individual components
      const configValidation = this.validateConfiguration(configData.configuration);
      errors.push(...configValidation.errors);
      warnings.push(...configValidation.warnings);
      
      for (const rule of configData.rules) {
        const ruleValidation = this.validateAlertRule(rule);
        errors.push(...ruleValidation.errors.map(e => `Rule ${rule.name}: ${e}`));
        warnings.push(...ruleValidation.warnings.map(w => `Rule ${rule.name}: ${w}`));

      
      for (const channel of configData.channels) {
        const channelValidation = this.validateNotificationChannel(channel);
        errors.push(...channelValidation.errors.map(e => `Channel ${channel.name}: ${e}`));
        warnings.push(...channelValidation.warnings.map(w => `Channel ${channel.name}: ${w}`));

      
      if (options.validateOnly) {
        return { valid: errors.length === 0, errors, warnings };

      
      if (errors.length > 0) {
        return { valid: false, errors, warnings };

      
      // Apply import
      if (options.overwriteExisting) {
        this.alertRules.clear();
        this.notificationChannels.clear();

      
      await this.updateConfiguration(configData.configuration, userId);
      
      for (const rule of configData.rules) {
        if (options.overwriteExisting || !this.alertRules.has(rule.id)) {
          await this.createAlertRule(rule, userId);


      
      for (const channel of configData.channels) {
        if (options.overwriteExisting || !this.notificationChannels.has(channel.id)) {
          await this.createNotificationChannel(channel, userId);


      
      this.escalationRules = configData.escalationRules;
      
      this.emit('configurationImported', { configData, userId, options });
      
      logger.info('Configuration imported', {
        rulesCount: configData.rules.length,
        channelsCount: configData.channels.length,
        userId
      });
      
      return { valid: true, errors, warnings };
 catch (error) {
      errors.push(`Import failed: ${error instanceof Error ? error.message : String(error)}`);
      return { valid: false, errors, warnings };


  
  // PRIVATE HELPER METHODS
  
  private loadDefaultConfiguration(): void {
    // Initialize default alert rules and channels from configuration
    this.configuration.notificationChannels.forEach(channel => {
      this.notificationChannels.set(channel.id, channel);
    });
    
    this.escalationRules = [...this.configuration.escalationChain];

  
  private loadDefaultTemplates(): void {
    // Load default configuration templates
    const securityTemplate: ConfigurationTemplate = {
      id: 'security-default',
      name: 'Security Monitoring Default',
      description: 'Standard security monitoring configuration with common rules',
      category: 'SECURITY',
      version: '1.0.0',
      configuration: {
        enableRealTimeProcessing: true,
        enableCorrelation: true,
        enableAutomaticEscalation: true,
        criticalAlertThreshold: 5,
        highAlertThreshold: 10,
        correlationTimeWindow: 300000, // 5 minutes
        escalationTimeout: 3600000 // 1 hour

      rules: [],
      channels: [],
      escalationRules: [],
      metadata: {
        author: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['security', 'default']

    };
    
    this.configurationTemplates.set(securityTemplate.id, securityTemplate);

  
  private recordConfigurationChange(change: Omit<ConfigurationChange, 'id' | 'timestamp'>): void {
    const configChange: ConfigurationChange = {
      ...change,
      id: this.generateChangeId(),
      timestamp: new Date()
    };
    
    this.changeHistory.push(configChange);
    
    // Keep only last 1000 changes
    if (this.changeHistory.length > 1000) {
      this.changeHistory.shift();

    
    this.emit('configurationChanged', configChange);

  
  private evaluateCondition(data: Record<string, unknown>, condition: AlertCondition): boolean {
    const value = this.getFieldValue(data, condition.field);
    
    switch (condition.operator) {
    case 'EQUALS':
      return value === condition.value;
    case 'NOT_EQUALS':
      return value !== condition.value;
    case 'CONTAINS':
      return String(value).includes(String(condition.value));
    case 'NOT_CONTAINS':
      return !String(value).includes(String(condition.value));
    case 'GREATER_THAN':
      return Number(value) > Number(condition.value);
    case 'LESS_THAN':
      return Number(value) < Number(condition.value);
    case 'IN':
      return Array.isArray(condition.value) && condition.value.includes(value);
    case 'NOT_IN':
      return Array.isArray(condition.value) && !condition.value.includes(value);
    case 'REGEX':
      return new RegExp(String(condition.value)).test(String(value));
    default:
      return false;


  
  private getFieldValue(data: Record<string, unknown>, field: string): unknown {
    const parts = field.split('.');
    let value: Error = data;
    
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
 else {
        return undefined;


    
    return value;

  
  private generateRuleId(): string {
    return `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  
  private generateChannelId(): string {
    return `channel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  
  private generateChangeId(): string {
    return `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  
  /**
   * Cleanup resources
   */
  destroy(): void {
    this.removeAllListeners();
    logger.info('Alerting Configuration Manager destroyed');



export default AlertingConfigurationManager;