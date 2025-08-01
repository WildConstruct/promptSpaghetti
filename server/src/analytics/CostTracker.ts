import { EventEmitter } from 'events';
import { AnalyticsCollector, AnalyticsEventType } from './AnalyticsCollector';
import { AnalyticsDAO, TokenUsage } from '../database/analytics-dao';

/**
 * Provider pricing configuration
 */



export interface ProviderPricing {
  provider: string;
  models: Map<string, ModelPricing>;
  lastUpdated: number;







export interface ModelPricing {
  inputTokenPrice: number;    // Price per 1000 input tokens
  outputTokenPrice: number;   // Price per 1000 output tokens
  currency: 'USD' | 'EUR' | 'GBP';
  lastUpdated: number;





/**
 * Cost calculation result
 */



export interface CostCalculation {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: string;
  timestamp: number;





/**
 * Budget configuration
 */



export interface BudgetConfig {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: number;
  endDate?: number;
  userId?: number;
  organizationId?: number;
  isActive: boolean;
  alertThresholds: number[]; // Percentage thresholds (e.g., [50, 75, 90])
  createdAt: number;
  updatedAt: number;





/**
 * Budget usage tracking
 */



export interface BudgetUsage {
  budgetId: string;
  period: string; // ISO date string for the period
  amountUsed: number;
  amountRemaining: number;
  percentageUsed: number;
  transactionCount: number;
  lastUpdated: number;





/**
 * Cost alert
 */



export interface CostAlert {
  id: string;
  budgetId: string;
  alertType: 'threshold' | 'budget_exceeded' | 'unusual_usage';
  threshold?: number;
  currentUsage: number;
  budgetAmount: number;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: number;
  acknowledged: boolean;





/**
 * Comprehensive cost tracking and budget management system
 */
export class CostTracker extends EventEmitter {
  private analyticsCollector: AnalyticsCollector;
  private analyticsDAO: AnalyticsDAO;
  private providerPricing: Map<string, ProviderPricing> = new Map();
  private budgets: Map<string, BudgetConfig> = new Map();
  private budgetUsage: Map<string, BudgetUsage> = new Map();
  private alerts: Map<string, CostAlert> = new Map();

  constructor(analyticsCollector: AnalyticsCollector, analyticsDAO: AnalyticsDAO) {
    super();
    this.analyticsCollector = analyticsCollector;
    this.analyticsDAO = analyticsDAO;
    this.initializeDefaultPricing();


  /**
   * Initialize default pricing for common providers
   */
  private initializeDefaultPricing(): void {
    // OpenAI pricing (as of 2024)
    const openaiPricing = new Map<string, ModelPricing>();
    openaiPricing.set('gpt-4', {
      inputTokenPrice: 0.03,   // $0.03 per 1K tokens
      outputTokenPrice: 0.06,  // $0.06 per 1K tokens
      currency: 'USD',
      lastUpdated: Date.now()
    });
    openaiPricing.set('gpt-4-turbo', {
      inputTokenPrice: 0.01,
      outputTokenPrice: 0.03,
      currency: 'USD',
      lastUpdated: Date.now()
    });
    openaiPricing.set('gpt-3.5-turbo', {
      inputTokenPrice: 0.001,
      outputTokenPrice: 0.002,
      currency: 'USD',
      lastUpdated: Date.now()
    });

    this.providerPricing.set('openai', {
      provider: 'openai',
      models: openaiPricing,
      lastUpdated: Date.now()
    });

    // Anthropic pricing
    const anthropicPricing = new Map<string, ModelPricing>();
    anthropicPricing.set('claude-3-opus', {
      inputTokenPrice: 0.015,
      outputTokenPrice: 0.075,
      currency: 'USD',
      lastUpdated: Date.now()
    });
    anthropicPricing.set('claude-3-sonnet', {
      inputTokenPrice: 0.003,
      outputTokenPrice: 0.015,
      currency: 'USD',
      lastUpdated: Date.now()
    });
    anthropicPricing.set('claude-3-haiku', {
      inputTokenPrice: 0.00025,
      outputTokenPrice: 0.00125,
      currency: 'USD',
      lastUpdated: Date.now()
    });

    this.providerPricing.set('anthropic', {
      provider: 'anthropic',
      models: anthropicPricing,
      lastUpdated: Date.now()
    });

    console.log('Default provider pricing initialized');


  /**
   * Calculate cost for token usage
   */
  calculateCost(
    provider: string,
    model: string,
    inputTokens: number,
    outputTokens: number
  ): CostCalculation {
    const providerPricing = this.providerPricing.get(provider.toLowerCase());
    
    if (!providerPricing) {
      throw new Error(`Unknown provider: ${provider}`);


    const modelPricing = providerPricing.models.get(model.toLowerCase());
    
    if (!modelPricing) {
      throw new Error(`Unknown model ${model} for provider ${provider}`);


    const inputCost = (inputTokens / 1000) * modelPricing.inputTokenPrice;
    const outputCost = (outputTokens / 1000) * modelPricing.outputTokenPrice;
    const totalCost = inputCost + outputCost;

    return {
      provider,
      model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      inputCost,
      outputCost,
      totalCost,
      currency: modelPricing.currency,
      timestamp: Date.now(};


  /**
   * Track token usage and calculate cost
   */
  trackTokenUsage(
    provider: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    nodeId: string,
    graphId: string,
    sessionId: string,
    userId?: number,
    organizationId?: number
  ): CostCalculation {
    const costCalc = this.calculateCost(provider, model, inputTokens, outputTokens);

    // Record token usage event
    this.analyticsCollector.recordTokenUsage(
      provider,
      model,
      inputTokens,
      outputTokens,
      costCalc.totalCost,
      nodeId,
      graphId
    );

    // Store in database
    this.analyticsDAO.storeTokenUsage({
      sessionId,
      userId,
      organizationId,
      provider,
      model,
      promptTokens: inputTokens,
      completionTokens: outputTokens,
      totalTokens: costCalc.totalTokens,
      estimatedCostUsd: costCalc.totalCost,
      costPerToken: costCalc.totalCost / costCalc.totalTokens,
      nodeId,
      graphId,
      requestStart: Date.now()
    });

    // Update budget usage
    this.updateBudgetUsage(costCalc.totalCost, userId, organizationId);

    // Emit cost tracking event
    this.emit('cost_calculated', costCalc);

    return costCalc;


  /**
   * Create a new budget
   */
  createBudget(config: Omit<BudgetConfig, 'id' | 'createdAt' | 'updatedAt'>): BudgetConfig {
    const budget: BudgetConfig = {
      ...config,
      id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.budgets.set(budget.id, budget);
    this.initializeBudgetUsage(budget);

    this.emit('budget_created', budget);
    console.log(`Budget created: ${budget.name} - $${budget.amount} ${budget.currency}`);

    return budget;


  /**
   * Update existing budget
   */
  updateBudget(budgetId: string, updates: Partial<BudgetConfig>): BudgetConfig | null {
    const existingBudget = this.budgets.get(budgetId);
    
    if (!existingBudget) {
      throw new Error(`Budget not found: ${budgetId}`);


    const updatedBudget: BudgetConfig = {
      ...existingBudget,
      ...updates,
      id: budgetId, // Prevent ID changes
      updatedAt: Date.now()
    };

    this.budgets.set(budgetId, updatedBudget);
    this.emit('budget_updated', updatedBudget);

    return updatedBudget;


  /**
   * Get budget by ID
   */
  getBudget(budgetId: string): BudgetConfig | null {
    return this.budgets.get(budgetId) || null;


  /**
   * Get all budgets for a user or organization
   */
  getBudgets(userId?: number, organizationId?: number): BudgetConfig[] {
    return Array.from(this.budgets.values()).filter(budget => {
      if (organizationId && budget.organizationId === organizationId) return true;
      if (userId && budget.userId === userId) return true;
      if (!userId && !organizationId && !budget.userId && !budget.organizationId) return true;
      return false;
    });


  /**
   * Get budget usage for a specific period
   */
  getBudgetUsage(budgetId: string): BudgetUsage | null {
    return this.budgetUsage.get(budgetId) || null;


  /**
   * Initialize budget usage tracking
   */
  private initializeBudgetUsage(budget: BudgetConfig): void {
    const currentPeriod = this.getCurrentPeriod(budget.period);
    
    const usage: BudgetUsage = {
      budgetId: budget.id,
      period: currentPeriod,
      amountUsed: 0,
      amountRemaining: budget.amount,
      percentageUsed: 0,
      transactionCount: 0,
      lastUpdated: Date.now()
    };

    this.budgetUsage.set(budget.id, usage);


  /**
   * Update budget usage with new cost
   */
  private updateBudgetUsage(cost: number, userId?: number, organizationId?: number): void {
    const relevantBudgets = this.getBudgets(userId, organizationId)
      .filter(budget => budget.isActive);

    relevantBudgets.forEach(budget => {
      const currentPeriod = this.getCurrentPeriod(budget.period);
      let usage = this.budgetUsage.get(budget.id);

      // Reset usage if we're in a new period
      if (!usage || usage.period !== currentPeriod) {
        usage = {
          budgetId: budget.id,
          period: currentPeriod,
          amountUsed: 0,
          amountRemaining: budget.amount,
          percentageUsed: 0,
          transactionCount: 0,
          lastUpdated: Date.now()
        };


      // Update usage
      usage.amountUsed += cost;
      usage.amountRemaining = Math.max(0, budget.amount - usage.amountUsed);
      usage.percentageUsed = (usage.amountUsed / budget.amount) * 100;
      usage.transactionCount += 1;
      usage.lastUpdated = Date.now();

      this.budgetUsage.set(budget.id, usage);

      // Check for threshold alerts
      this.checkBudgetThresholds(budget, usage);

      this.emit('budget_usage_updated', { budget, usage });
    });


  /**
   * Check budget thresholds and create alerts
   */
  private checkBudgetThresholds(budget: BudgetConfig, usage: BudgetUsage): void {
    budget.alertThresholds.forEach(threshold => {
      if (usage.percentageUsed >= threshold) {
        const alertId = `${budget.id}_threshold_${threshold}_${usage.period}`;
        
        // Don't create duplicate alerts for the same threshold in the same period
        if (this.alerts.has(alertId)) return;

        const alert: CostAlert = {
          id: alertId,
          budgetId: budget.id,
          alertType: 'threshold',
          threshold,
          currentUsage: usage.amountUsed,
          budgetAmount: budget.amount,
          message: `Budget "${budget.name}" has reached ${threshold}% usage (${usage.percentageUsed.toFixed(1)}%)`,
          severity: threshold >= 90 ? 'critical' : threshold >= 75 ? 'warning' : 'info',
          timestamp: Date.now(),
          acknowledged: false
        };

        this.alerts.set(alertId, alert);
        this.emit('budget_alert', alert);
        
        console.warn(`Budget alert: ${alert.message}`);

    });

    // Check for budget exceeded
    if (usage.percentageUsed > 100) {
      const alertId = `${budget.id}_exceeded_${usage.period}`;
      
      if (!this.alerts.has(alertId)) {
        const alert: CostAlert = {
          id: alertId,
          budgetId: budget.id,
          alertType: 'budget_exceeded',
          currentUsage: usage.amountUsed,
          budgetAmount: budget.amount,
          message: `Budget "${budget.name}" has been exceeded! Used: $${usage.amountUsed.toFixed(2)}, Budget: $${budget.amount.toFixed(2)}`,
          severity: 'critical',
          timestamp: Date.now(),
          acknowledged: false
        };

        this.alerts.set(alertId, alert);
        this.emit('budget_exceeded', alert);
        
        console.error(`Budget exceeded: ${alert.message}`);




  /**
   * Get current period string for budget tracking
   */
  private getCurrentPeriod(periodType: string): string {
    const now = new Date();
    
    switch (periodType) {
    case 'daily':
      return now.toISOString().split('T')[0]; // YYYY-MM-DD
    case 'weekly':
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      return `${weekStart.getFullYear()}-W${this.getWeekNumber(weekStart)}`;
    case 'monthly':
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    case 'yearly':
      return String(now.getFullYear());
    default:
      return now.toISOString().split('T')[0];



  /**
   * Get week number for a date
   */
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);


  /**
   * Get cost summary for a time period
   */
  getCostSummary(
    startTime: number,
    endTime: number,
    userId?: number,
    organizationId?: number
  ): {
    totalCost: number;
    totalTokens: number;
    transactionCount: number;
    averageCostPerTransaction: number;
    costByProvider: Map<string, number>;
    costByModel: Map<string, number>;
    topModels: Array<{ model: string; cost: number; tokens: number }>;
 {
    // This would typically query the database
    // For now, returning a mock structure
    const mockSummary = {
      totalCost: 0,
      totalTokens: 0,
      transactionCount: 0,
      averageCostPerTransaction: 0,
      costByProvider: new Map<string, number>(),
      costByModel: new Map<string, number>(),
      topModels: []
    };

    // Would implement actual database query here
    console.log(`Getting cost summary for period ${startTime} - ${endTime}`);
    
    return mockSummary;


  /**
   * Forecast costs based on usage patterns
   */
  forecastCosts(
    days: number,
    userId?: number,
    organizationId?: number
  ): {
    forecastedDailyCost: number;
    forecastedTotalCost: number;
    confidenceInterval: { lower: number; upper: number };
    basedOnDays: number;
 {
    // Simplified forecasting - would use more sophisticated algorithms in production
    const historicalData = this.getCostSummary(
      Date.now() - (30 * 24 * 60 * 60 * 1000), // Last 30 days
      Date.now(),
      userId,
      organizationId
    );

    const dailyAverage = historicalData.totalCost / 30;
    const forecastedTotalCost = dailyAverage * days;
    
    // Simple confidence interval (±20%)
    const margin = forecastedTotalCost * 0.2;

    return {
      forecastedDailyCost: dailyAverage,
      forecastedTotalCost,
      confidenceInterval: {
        lower: forecastedTotalCost - margin,
        upper: forecastedTotalCost + margin

      basedOnDays: 30
    };


  /**
   * Get active alerts
   */
  getActiveAlerts(budgetId?: string): CostAlert[] {
    const alerts = Array.from(this.alerts.values())
      .filter(alert => !alert.acknowledged);
    
    if (budgetId) {
      return alerts.filter(alert => alert.budgetId === budgetId);

    
    return alerts;


  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    
    if (alert) {
      alert.acknowledged = true;
      this.alerts.set(alertId, alert);
      this.emit('alert_acknowledged', alert);
      return true;

    
    return false;


  /**
   * Update provider pricing
   */
  updateProviderPricing(provider: string, model: string, pricing: ModelPricing): void {
    let providerPricing = this.providerPricing.get(provider.toLowerCase());
    
    if (!providerPricing) {
      providerPricing = {
        provider: provider.toLowerCase(),
        models: new Map(),
        lastUpdated: Date.now()
      };
      this.providerPricing.set(provider.toLowerCase(), providerPricing);


    providerPricing.models.set(model.toLowerCase(), pricing);
    providerPricing.lastUpdated = Date.now();

    this.emit('pricing_updated', { provider, model, pricing });
    console.log(`Updated pricing for ${provider}/${model}`);


  /**
   * Get efficiency recommendations
   */
  getEfficiencyRecommendations(
    userId?: number,
    organizationId?: number
  ): Array<{
    type: 'model_switch' | 'usage_optimization' | 'budget_adjustment';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    estimatedSavings: number;
    actionItems: string[];
> {
    // Mock recommendations - would analyze actual usage patterns
    return [
      {
        type: 'model_switch',
        priority: 'high',
        title: 'Consider using GPT-3.5-turbo for simple tasks',
        description: 'Analysis shows 60% of your prompts could use a cheaper model with similar results',
        estimatedSavings: 45.30,
        actionItems: [
          'Review prompts marked as "simple classification"',
          'Test GPT-3.5-turbo on a sample of current GPT-4 tasks',
          'Implement automatic model selection based on complexity'
        ]

      {
        type: 'usage_optimization',
        priority: 'medium',
        title: 'Optimize prompt length',
        description: 'Average prompt length is 20% higher than similar users',
        estimatedSavings: 12.80,
        actionItems: [
          'Review and shorten system prompts',
          'Use prompt templates for common patterns',
          'Implement dynamic context trimming'
        ]

    ];


  /**
   * Export cost data
   */
  exportCostData(
    startTime: number,
    endTime: number,
    format: 'json' | 'csv' = 'json',
    userId?: number,
    organizationId?: number
  ): string {
    const summary = this.getCostSummary(startTime, endTime, userId, organizationId);
    const budgets = this.getBudgets(userId, organizationId);
    const alerts = this.getActiveAlerts();

    const exportData = {
      exportTime: Date.now(),
      period: { startTime, endTime },
      userId,
      organizationId,
      summary,
      budgets,
      alerts
    };

    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);


    // CSV format (simplified)
    const lines = [
      'Type,Name,Amount,Currency,Period,Status',
      ...budgets.map(budget => 
        `Budget,${budget.name},${budget.amount},${budget.currency},${budget.period},${budget.isActive ? 'Active' : 'Inactive'}`
      ),
      ...alerts.map(alert => 
        `Alert,${alert.alertType},${alert.currentUsage},USD,${alert.timestamp},${alert.acknowledged ? 'Acknowledged' : 'Active'}`

    ];

    return lines.join('\n');

