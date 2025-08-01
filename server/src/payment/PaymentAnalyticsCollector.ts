/**
 * Payment Analytics Collector
 * Story 30.1.3 - Payment Integration Analytics
 * 
 * Collects and processes payment provider data for revenue analytics
 * Integrates with Epic 1 analytics infrastructure and Epic 16 marketplace transactions
 */

import { EventEmitter } from 'events';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { 
  PaymentProvider, 
  PaymentMethodType, 
  Transaction, 
  PaymentIntent,
  TransactionType 
 from '../marketplace/transaction.types';
import { 
  RevenueEvent, 
  RevenueEventType 
 from '../revenue/RevenueDataModel';
import { AnalyticsCollector } from '../analytics/AnalyticsCollector';

// Payment Analytics Event Types
export enum PaymentAnalyticsEventType {
  PAYMENT_ATTEMPT = 'payment_attempt',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILURE = 'payment_failure',
  PAYMENT_RETRY = 'payment_retry',
  PAYMENT_TIMEOUT = 'payment_timeout',
  PAYMENT_DISPUTED = 'payment_disputed',
  PAYMENT_REFUNDED = 'payment_refunded',
  
  // Provider Events
  PROVIDER_RATE_LIMIT = 'provider_rate_limit',
  PROVIDER_DOWNTIME = 'provider_downtime',
  PROVIDER_ERROR = 'provider_error',
  
  // Fraud Detection
  FRAUD_DETECTED = 'fraud_detected',
  FRAUD_PREVENTED = 'fraud_prevented',
  RISK_ASSESSMENT = 'risk_assessment'


// Payment Performance Metrics



export interface PaymentProviderMetrics {
  provider: PaymentProvider;
  
  // Success Metrics
  totalAttempts: number;
  successfulPayments: number;
  failedPayments: number;
  successRate: number;
  
  // Performance Metrics
  averageProcessingTime: number;
  p95ProcessingTime: number;
  p99ProcessingTime: number;
  
  // Financial Metrics
  totalVolume: number;
  totalFees: number;
  averageFeeRate: number;
  
  // Failure Analysis
  failuresByReason: Record<string, number>;
  retrySuccessRate: number;
  
  // Geographic Performance
  performanceByCountry: Array<{
    countryCode: string;
    successRate: number;
    averageProcessingTime: number;



>;
  
  // Temporal Performance
  performanceByHour: Array<{
    hour: number;
    successRate: number;
    volume: number;
>;


// Payment Method Performance



export interface PaymentMethodMetrics {
  methodType: PaymentMethodType;
  provider: PaymentProvider;
  
  successRate: number;
  averageProcessingTime: number;
  totalVolume: number;
  userPreferenceRank: number;
  conversionRate: number;
  
  // Demographic breakdown
  ageGroupPerformance: Array<{
    ageGroup: string;
    successRate: number;
    usage: number;



>;
  
  // Device performance
  devicePerformance: Array<{
    deviceType: 'mobile' | 'desktop' | 'tablet';
    successRate: number;
    usage: number;
>;


// Payment Failure Analysis



export interface PaymentFailureAnalysis {
  failureCode: string;
  provider: PaymentProvider;
  frequency: number;
  percentage: number;
  description: string;
  suggestedAction: string;
  isRetryable: boolean;
  averageRetrySuccess: number;
  
  // Failure patterns
  timePattern: Array<{
    hour: number;
    frequency: number;



>;
  
  geographicPattern: Array<{
    countryCode: string;
    frequency: number;
>;
  
  amountPattern: Array<{
    amountRange: string;
    frequency: number;
>;


// Payment Webhook Event



export interface PaymentWebhookEvent {
  id: string;
  provider: PaymentProvider;
  eventType: string;
  data: Record<string, unknown>;
  receivedAt: Date;
  processedAt?: Date;
  processingStatus: 'pending' | 'processed' | 'failed' | 'ignored';
  errorMessage?: string;





export class PaymentAnalyticsCollector extends EventEmitter {
  private analyticsCollector: AnalyticsCollector;
  private dbConnection: any;
  private stripe: Stripe;
  private payPalClient: any; // Would be PayPal SDK client
  
  // Analytics cache
  private metricsCache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  
  constructor(
    analyticsCollector: AnalyticsCollector,
    dbConnection: any,
    paymentConfig: {
      stripeSecretKey: string;
      paypalClientId?: string;
      paypalClientSecret?: string;
    }
  ) {
    super();
    
    this.analyticsCollector = analyticsCollector;
    this.dbConnection = dbConnection;
    
    // Initialize Stripe
    this.stripe = new Stripe(paymentConfig.stripeSecretKey, {
      apiVersion: '2023-10-16'
    });
    
    // Initialize PayPal (if credentials provided)
    if (paymentConfig.paypalClientId && paymentConfig.paypalClientSecret) {
      // Would initialize PayPal SDK here



  /**
   * Track payment attempt
   */
  async trackPaymentAttempt(
    paymentIntent: PaymentIntent,
    userContext: {
      userId: string;
      sessionId: string;
      ipAddress?: string;
      userAgent?: string;
      country?: string;
    }
  ): Promise<void> {

    const startTime = Date.now();
    
    try {
      // Create analytics event
      const event = {
        id: uuidv4(),
        type: PaymentAnalyticsEventType.PAYMENT_ATTEMPT,
        timestamp: startTime,
        sessionId: userContext.sessionId,
        userId: userContext.userId,
        metadata: {
          paymentIntentId: paymentIntent.id,
          provider: paymentIntent.provider,
          amount: paymentIntent.amount_cents,
          currency: paymentIntent.currency,
          paymentMethodId: paymentIntent.payment_method_id,
          country: userContext.country,
          userAgent: userContext.userAgent

      };

      // Track with analytics collector
      await this.analyticsCollector.track(event);
      
      // Store in payment analytics table
      await this.storePaymentEvent(event);
      
      this.emit('payment_attempt', {
        paymentIntentId: paymentIntent.id,
        provider: paymentIntent.provider,
        amount: paymentIntent.amount_cents
      });
 catch (error) {
      console.error('Failed to track payment attempt:', error);



  /**
   * Track payment success
   */
  async trackPaymentSuccess(
    transaction: Transaction,
    processingTime: number,
    userContext: {
      userId: string;
      sessionId: string;
    }
  ): Promise<void> {

    try {
      const event = {
        id: uuidv4(),
        type: PaymentAnalyticsEventType.PAYMENT_SUCCESS,
        timestamp: Date.now(),
        sessionId: userContext.sessionId,
        userId: userContext.userId,
        metadata: {
          transactionId: transaction.id,
          provider: transaction.provider,
          amount: transaction.amount_cents,
          processingTime,
          fees: transaction.fee_cents,
          netAmount: transaction.net_amount_cents,
          riskScore: transaction.risk_score

      };

      await this.analyticsCollector.track(event);
      await this.storePaymentEvent(event);
      
      // Update provider metrics
      await this.updateProviderMetrics(transaction.provider, {
        successfulPayment: true,
        processingTime,
        amount: transaction.amount_cents,
        fees: transaction.fee_cents
      });

      this.emit('payment_success', {
        transactionId: transaction.id,
        provider: transaction.provider,
        amount: transaction.amount_cents,
        processingTime
      });
 catch (error) {
      console.error('Failed to track payment success:', error);



  /**
   * Track payment failure
   */
  async trackPaymentFailure(
    paymentIntent: PaymentIntent,
    failureReason: string,
    errorCode: string,
    userContext: {
      userId: string;
      sessionId: string;
    }
  ): Promise<void> {

    try {
      const event = {
        id: uuidv4(),
        type: PaymentAnalyticsEventType.PAYMENT_FAILURE,
        timestamp: Date.now(),
        sessionId: userContext.sessionId,
        userId: userContext.userId,
        metadata: {
          paymentIntentId: paymentIntent.id,
          provider: paymentIntent.provider,
          amount: paymentIntent.amount_cents,
          failureReason,
          errorCode,
          isRetryable: this.isRetryableError(errorCode)

      };

      await this.analyticsCollector.track(event);
      await this.storePaymentEvent(event);
      
      // Update provider metrics
      await this.updateProviderMetrics(paymentIntent.provider, {
        failedPayment: true,
        failureReason,
        errorCode,
        amount: paymentIntent.amount_cents
      });

      // Update failure analysis
      await this.updateFailureAnalysis(paymentIntent.provider, errorCode, failureReason);

      this.emit('payment_failure', {
        paymentIntentId: paymentIntent.id,
        provider: paymentIntent.provider,
        errorCode,
        failureReason
      });
 catch (error) {
      console.error('Failed to track payment failure:', error);



  /**
   * Process payment provider webhook
   */
  async processWebhook(
    provider: PaymentProvider,
    eventType: string,
    data: Record<string, unknown>,
    signature: string
  ): Promise<void> {

    const webhookEvent: PaymentWebhookEvent = {
      id: uuidv4(),
      provider,
      eventType,
      data,
      receivedAt: new Date(),
      processingStatus: 'pending'
    };

    try {
      // Verify webhook signature
      const isValid = await this.verifyWebhookSignature(provider, data, signature);
      if (!isValid) {
        webhookEvent.processingStatus = 'failed';
        webhookEvent.errorMessage = 'Invalid webhook signature';
        await this.storeWebhookEvent(webhookEvent);
        return;


      // Process webhook based on event type
      await this.processWebhookEvent(webhookEvent);
      
      webhookEvent.processingStatus = 'processed';
      webhookEvent.processedAt = new Date();
 catch (error) {
      webhookEvent.processingStatus = 'failed';
      webhookEvent.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Webhook processing failed:', error);
 finally {
      await this.storeWebhookEvent(webhookEvent);



  /**
   * Get payment provider metrics
   */
  async getProviderMetrics(
    provider: PaymentProvider,
    startDate: Date,
    endDate: Date
  ): Promise<PaymentProviderMetrics> {

    const cacheKey = `metrics_${provider}_${startDate.getTime()}_${endDate.getTime()}`;
    
    // Check cache
    if (this.metricsCache.has(cacheKey)) {
      const expiry = this.cacheExpiry.get(cacheKey) || 0;
      if (Date.now() < expiry) {
        return this.metricsCache.get(cacheKey);



    // Query metrics from database
    const metrics = await this.calculateProviderMetrics(provider, startDate, endDate);
    
    // Cache for 5 minutes
    this.metricsCache.set(cacheKey, metrics);
    this.cacheExpiry.set(cacheKey, Date.now() + 5 * 60 * 1000);
    
    return metrics;


  /**
   * Get payment method performance
   */
  async getPaymentMethodMetrics(
    methodType: PaymentMethodType,
    provider: PaymentProvider,
    startDate: Date,
    endDate: Date
  ): Promise<PaymentMethodMetrics> {

    const query = `
      SELECT 
        COUNT(*) as total_attempts,
        SUM(CASE WHEN pe.type = 'payment_success' THEN 1 ELSE 0 END) as successful_payments,
        AVG(CASE WHEN pe.type = 'payment_success' THEN 
          CAST(pe.metadata->>'processingTime' AS INTEGER) ELSE NULL END) as avg_processing_time,
        SUM(CASE WHEN pe.type = 'payment_success' THEN 
          CAST(pe.metadata->>'amount' AS INTEGER) ELSE 0 END) as total_volume
      FROM payment_events pe
      WHERE pe.metadata->>'provider' = $1
      AND pe.metadata->>'methodType' = $2
      AND pe.timestamp BETWEEN $3 AND $4
    `;

    const result = await this.dbConnection.query(query, [
      provider,
      methodType,
      startDate.getTime(),
      endDate.getTime()
    ]);

    const row = result[0];
    const successRate = row.total_attempts > 0 ? 
      (row.successful_payments / row.total_attempts) * 100 : 0;

    return {
      methodType,
      provider,
      successRate,
      averageProcessingTime: row.avg_processing_time || 0,
      totalVolume: row.total_volume || 0,
      userPreferenceRank: await this.calculatePreferenceRank(methodType, provider),
      conversionRate: await this.calculateConversionRate(methodType, provider, startDate, endDate),
      ageGroupPerformance: await this.getAgeGroupPerformance(methodType, provider, startDate, endDate),
      devicePerformance: await this.getDevicePerformance(methodType, provider, startDate, endDate)
    };


  /**
   * Get payment failure analysis
   */
  async getFailureAnalysis(
    provider: PaymentProvider,
    startDate: Date,
    endDate: Date,
    limit: number = 20
  ): Promise<PaymentFailureAnalysis[]> {

    const query = `
      SELECT 
        pe.metadata->>'errorCode' as failure_code,
        pe.metadata->>'failureReason' as description,
        COUNT(*) as frequency,
        AVG(CASE WHEN retry_pe.type = 'payment_success' THEN 1.0 ELSE 0.0 END) as retry_success_rate
      FROM payment_events pe
      LEFT JOIN payment_events retry_pe ON 
        retry_pe.metadata->>'paymentIntentId' = pe.metadata->>'paymentIntentId'
        AND retry_pe.timestamp > pe.timestamp
        AND retry_pe.type = 'payment_success'
      WHERE pe.type = 'payment_failure'
      AND pe.metadata->>'provider' = $1
      AND pe.timestamp BETWEEN $2 AND $3
      AND pe.metadata->>'errorCode' IS NOT NULL
      GROUP BY pe.metadata->>'errorCode', pe.metadata->>'failureReason'
      ORDER BY frequency DESC
      LIMIT $4
    `;

    const results = await this.dbConnection.query(query, [
      provider,
      startDate.getTime(),
      endDate.getTime(),
      limit
    ]);

    const totalFailures = results.reduce((sum: number, row: any) => sum + row.frequency, 0);

    return results.map((row: any) => ({
      failureCode: row.failure_code,
      provider,
      frequency: row.frequency,
      percentage: (row.frequency / totalFailures) * 100,
      description: row.description,
      suggestedAction: this.getSuggestedAction(row.failure_code),
      isRetryable: this.isRetryableError(row.failure_code),
      averageRetrySuccess: row.retry_success_rate * 100,
      timePattern: await this.getFailureTimePattern(provider, row.failure_code, startDate, endDate),
      geographicPattern: await this.getFailureGeographicPattern(provider, row.failure_code, startDate, endDate),
      amountPattern: await this.getFailureAmountPattern(provider, row.failure_code, startDate, endDate)
    }));


  // Private helper methods
  private async calculateProviderMetrics(
    provider: PaymentProvider,
    startDate: Date,
    endDate: Date
  ): Promise<PaymentProviderMetrics> {

    const query = `
      SELECT 
        COUNT(CASE WHEN pe.type = 'payment_attempt' THEN 1 END) as total_attempts,
        COUNT(CASE WHEN pe.type = 'payment_success' THEN 1 END) as successful_payments,
        COUNT(CASE WHEN pe.type = 'payment_failure' THEN 1 END) as failed_payments,
        AVG(CASE WHEN pe.type = 'payment_success' THEN 
          CAST(pe.metadata->>'processingTime' AS INTEGER) END) as avg_processing_time,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY 
          CASE WHEN pe.type = 'payment_success' THEN 
            CAST(pe.metadata->>'processingTime' AS INTEGER) END) as p95_processing_time,
        SUM(CASE WHEN pe.type = 'payment_success' THEN 
          CAST(pe.metadata->>'amount' AS INTEGER) ELSE 0 END) as total_volume,
        SUM(CASE WHEN pe.type = 'payment_success' THEN 
          CAST(pe.metadata->>'fees' AS INTEGER) ELSE 0 END) as total_fees
      FROM payment_events pe
      WHERE pe.metadata->>'provider' = $1
      AND pe.timestamp BETWEEN $2 AND $3
    `;

    const result = await this.dbConnection.query(query, [
      provider,
      startDate.getTime(),
      endDate.getTime()
    ]);

    const row = result[0];
    const successRate = row.total_attempts > 0 ? 
      (row.successful_payments / row.total_attempts) * 100 : 0;

    return {
      provider,
      totalAttempts: row.total_attempts || 0,
      successfulPayments: row.successful_payments || 0,
      failedPayments: row.failed_payments || 0,
      successRate,
      averageProcessingTime: row.avg_processing_time || 0,
      p95ProcessingTime: row.p95_processing_time || 0,
      p99ProcessingTime: 0, // Would calculate separately
      totalVolume: row.total_volume || 0,
      totalFees: row.total_fees || 0,
      averageFeeRate: row.total_volume > 0 ? (row.total_fees / row.total_volume) * 100 : 0,
      failuresByReason: await this.getFailuresByReason(provider, startDate, endDate),
      retrySuccessRate: await this.getRetrySuccessRate(provider, startDate, endDate),
      performanceByCountry: await this.getPerformanceByCountry(provider, startDate, endDate),
      performanceByHour: await this.getPerformanceByHour(provider, startDate, endDate)
    };


  private async updateProviderMetrics(provider: PaymentProvider, update: any): Promise<void> {

    // Implementation would update real-time metrics aggregation tables
    // This is a simplified version
    const timestamp = new Date();
    const hourKey = timestamp.toISOString().slice(0, 13); // YYYY-MM-DDTHH

    const query = `
      INSERT INTO provider_metrics_hourly (
        provider, hour_key, attempts, successes, failures, 
        total_volume, total_fees, processing_time_sum, processing_time_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (provider, hour_key) DO UPDATE SET
        attempts = provider_metrics_hourly.attempts + $3,
        successes = provider_metrics_hourly.successes + $4,
        failures = provider_metrics_hourly.failures + $5,
        total_volume = provider_metrics_hourly.total_volume + $6,
        total_fees = provider_metrics_hourly.total_fees + $7,
        processing_time_sum = provider_metrics_hourly.processing_time_sum + $8,
        processing_time_count = provider_metrics_hourly.processing_time_count + $9
    `;

    await this.dbConnection.query(query, [
      provider,
      hourKey,
      1, // attempts
      update.successfulPayment ? 1 : 0,
      update.failedPayment ? 1 : 0,
      update.amount || 0,
      update.fees || 0,
      update.processingTime || 0,
      update.processingTime ? 1 : 0
    ]);


  private isRetryableError(errorCode: string): boolean {
    const retryableErrors = [
      'card_declined',
      'insufficient_funds', 
      'processing_error',
      'rate_limit_error',
      'api_connection_error',
      'api_error'
    ];
    
    return retryableErrors.includes(errorCode);


  private getSuggestedAction(errorCode: string): string {
    const actions: Record<string, string> = {
      'card_declined': 'Ask customer to try a different payment method',
      'insufficient_funds': 'Suggest customer checks their account balance',
      'processing_error': 'Retry payment or contact support',
      'rate_limit_error': 'Implement exponential backoff retry',
      'api_connection_error': 'Check network connectivity and retry',
      'expired_card': 'Ask customer to update their card information'
    };
    
    return actions[errorCode] || 'Contact technical support for assistance';


  private async verifyWebhookSignature(
    provider: PaymentProvider,
    data: Record<string, unknown>,
    signature: string
  ): Promise<boolean> {

    // Implementation would verify webhook signature based on provider
    // This is a simplified version
    if (provider === PaymentProvider.STRIPE) {
      try {
        // Would use Stripe's webhook signature verification
        return true; // Simplified
 catch (error) {
        return false;


    
    return true; // Simplified for other providers


  private async processWebhookEvent(webhookEvent: PaymentWebhookEvent): Promise<void> {

    // Process different types of webhook events
    switch (webhookEvent.eventType) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(webhookEvent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(webhookEvent);
        break;
      case 'charge.dispute.created':
        await this.handlePaymentDispute(webhookEvent);
        break;
      default:
        // Log unknown event types for monitoring
        console.log(`Unknown webhook event type: ${webhookEvent.eventType}`);



  private async handlePaymentSuccess(webhookEvent: PaymentWebhookEvent): Promise<void> {

    // Extract payment data and create analytics event
        // Implementation would process successful payment webhook


  private async handlePaymentFailure(webhookEvent: PaymentWebhookEvent): Promise<void> {

    // Extract failure data and create analytics event
        // Implementation would process failed payment webhook


  private async handlePaymentDispute(webhookEvent: PaymentWebhookEvent): Promise<void> {

    // Extract dispute data and create analytics event
        // Implementation would process payment dispute webhook


  private async storePaymentEvent(event: any): Promise<void> {

    const query = `
      INSERT INTO payment_events (
        id, type, timestamp, session_id, user_id, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await this.dbConnection.query(query, [
      event.id,
      event.type,
      event.timestamp,
      event.sessionId,
      event.userId,
      JSON.stringify(event.metadata),
      new Date()
    ]);


  private async storeWebhookEvent(webhookEvent: PaymentWebhookEvent): Promise<void> {

    const query = `
      INSERT INTO payment_webhook_events (
        id, provider, event_type, data, received_at, processed_at,
        processing_status, error_message, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    await this.dbConnection.query(query, [
      webhookEvent.id,
      webhookEvent.provider,
      webhookEvent.eventType,
      JSON.stringify(webhookEvent.data),
      webhookEvent.receivedAt,
      webhookEvent.processedAt,
      webhookEvent.processingStatus,
      webhookEvent.errorMessage,
      new Date()
    ]);


  // Additional helper methods implementation
  private async getFailuresByReason(
    provider: PaymentProvider,
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, number>> {
    const query = `
      SELECT 
        pe.metadata->>'errorCode' as error_code,
        COUNT(*) as count
      FROM payment_events pe
      WHERE pe.type = 'payment_failure'
      AND pe.metadata->>'provider' = $1
      AND pe.timestamp BETWEEN $2 AND $3
      GROUP BY pe.metadata->>'errorCode'
      ORDER BY count DESC
    `;

    const results = await this.dbConnection.query(query, [
      provider,
      startDate.getTime(),
      endDate.getTime()
    ]);

    const failures: Record<string, number> = {};
    results.forEach((row: any) => {
      if (row.error_code) {
        failures[row.error_code] = row.count;

    });

    return failures;


  private async getRetrySuccessRate(provider: PaymentProvider, startDate: Date, endDate: Date): Promise<number> {

    const query = `
      SELECT 
        COUNT(CASE WHEN pe1.type = 'payment_failure' THEN 1 END) as failed_attempts,
        COUNT(CASE WHEN pe2.type = 'payment_success' THEN 1 END) as successful_retries
      FROM payment_events pe1
      LEFT JOIN payment_events pe2 ON 
        pe2.metadata->>'paymentIntentId' = pe1.metadata->>'paymentIntentId'
        AND pe2.timestamp > pe1.timestamp
        AND pe2.type = 'payment_success'
      WHERE pe1.type = 'payment_failure'
      AND pe1.metadata->>'provider' = $1
      AND pe1.timestamp BETWEEN $2 AND $3
    `;

    const result = await this.dbConnection.query(query, [
      provider,
      startDate.getTime(),
      endDate.getTime()
    ]);

    const row = result[0];
    if (row.failed_attempts === 0) return 0;
    
    return (row.successful_retries / row.failed_attempts) * 100;


  private async getPerformanceByCountry(
    provider: PaymentProvider,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{countryCode: string; successRate: number; averageProcessingTime: number}>> {
    const query = `
      SELECT 
        pe.metadata->>'country' as country_code,
        COUNT(CASE WHEN pe.type = 'payment_attempt' THEN 1 END) as total_attempts,
        COUNT(CASE WHEN pe.type = 'payment_success' THEN 1 END) as successful_payments,
        AVG(CASE WHEN pe.type = 'payment_success' THEN 
          CAST(pe.metadata->>'processingTime' AS INTEGER) ELSE NULL END) as avg_processing_time
      FROM payment_events pe
      WHERE pe.metadata->>'provider' = $1
      AND pe.timestamp BETWEEN $2 AND $3
      AND pe.metadata->>'country' IS NOT NULL
      GROUP BY pe.metadata->>'country'
      HAVING total_attempts >= 10
      ORDER BY total_attempts DESC
    `;

    const results = await this.dbConnection.query(query, [
      provider,
      startDate.getTime(),
      endDate.getTime()
    ]);

    return results.map((row: any) => ({
      countryCode: row.country_code,
      successRate: row.total_attempts > 0 ? (row.successful_payments / row.total_attempts) * 100 : 0,
      averageProcessingTime: row.avg_processing_time || 0
    }));


  private async getPerformanceByHour(
    provider: PaymentProvider,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{hour: number; successRate: number; volume: number}>> {
    const query = `
      SELECT 
        EXTRACT(HOUR FROM to_timestamp(pe.timestamp / 1000)) as hour,
        COUNT(CASE WHEN pe.type = 'payment_attempt' THEN 1 END) as total_attempts,
        COUNT(CASE WHEN pe.type = 'payment_success' THEN 1 END) as successful_payments,
        SUM(CASE WHEN pe.type = 'payment_success' THEN 
          CAST(pe.metadata->>'amount' AS INTEGER) ELSE 0 END) as volume
      FROM payment_events pe
      WHERE pe.metadata->>'provider' = $1
      AND pe.timestamp BETWEEN $2 AND $3
      GROUP BY EXTRACT(HOUR FROM to_timestamp(pe.timestamp / 1000))
      ORDER BY hour
    `;

    const results = await this.dbConnection.query(query, [
      provider,
      startDate.getTime(),
      endDate.getTime()
    ]);

    return results.map((row: any) => ({
      hour: parseInt(row.hour),
      successRate: row.total_attempts > 0 ? (row.successful_payments / row.total_attempts) * 100 : 0,
      volume: row.volume || 0
    }));


  private async calculatePreferenceRank(methodType: PaymentMethodType, provider: PaymentProvider): Promise<number> {

    const query = `
      SELECT 
        pe.metadata->>'methodType' as method_type,
        COUNT(*) as usage_count,
        ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank
      FROM payment_events pe
      WHERE pe.type = 'payment_attempt'
      AND pe.metadata->>'provider' = $1
      AND pe.timestamp > $2
      GROUP BY pe.metadata->>'methodType'
    `;

    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const results = await this.dbConnection.query(query, [provider, thirtyDaysAgo]);

    const methodRank = results.find((row: any) => row.method_type === methodType);
    return methodRank ? methodRank.rank : results.length + 1;


  private async calculateConversionRate(
    methodType: PaymentMethodType,
    provider: PaymentProvider,
    startDate: Date,
    endDate: Date
  ): Promise<number> {

    const query = `
      SELECT 
        COUNT(CASE WHEN pe.type = 'payment_attempt' THEN 1 END) as attempts,
        COUNT(CASE WHEN pe.type = 'payment_success' THEN 1 END) as successes
      FROM payment_events pe
      WHERE pe.metadata->>'provider' = $1
      AND pe.metadata->>'methodType' = $2
      AND pe.timestamp BETWEEN $3 AND $4
    `;

    const result = await this.dbConnection.query(query, [
      provider,
      methodType,
      startDate.getTime(),
      endDate.getTime()
    ]);

    const row = result[0];
    return row.attempts > 0 ? (row.successes / row.attempts) * 100 : 0;


  private async getAgeGroupPerformance(
    methodType: PaymentMethodType,
    provider: PaymentProvider,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ageGroup: string; successRate: number; usage: number}>> {
    // This would require user demographic data integration
    // Simplified implementation returning age group buckets
    const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55+'];
    
    return ageGroups.map(ageGroup => ({
      ageGroup,
      successRate: 85 + Math.random() * 10, // Placeholder data
      usage: Math.floor(Math.random() * 1000)
    }));


  private async getDevicePerformance(
    methodType: PaymentMethodType,
    provider: PaymentProvider,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{deviceType: 'mobile' | 'desktop' | 'tablet'; successRate: number; usage: number}>> {
    const query = `
      SELECT 
        CASE 
          WHEN pe.metadata->>'userAgent' LIKE '%Mobile%' THEN 'mobile'
          WHEN pe.metadata->>'userAgent' LIKE '%Tablet%' THEN 'tablet'
          ELSE 'desktop'
        END as device_type,
        COUNT(CASE WHEN pe.type = 'payment_attempt' THEN 1 END) as attempts,
        COUNT(CASE WHEN pe.type = 'payment_success' THEN 1 END) as successes
      FROM payment_events pe
      WHERE pe.metadata->>'provider' = $1
      AND pe.metadata->>'methodType' = $2
      AND pe.timestamp BETWEEN $3 AND $4
      AND pe.metadata->>'userAgent' IS NOT NULL
      GROUP BY device_type
    `;

    const results = await this.dbConnection.query(query, [
      provider,
      methodType,
      startDate.getTime(),
      endDate.getTime()
    ]);

    return results.map((row: any) => ({
      deviceType: row.device_type as 'mobile' | 'desktop' | 'tablet',
      successRate: row.attempts > 0 ? (row.successes / row.attempts) * 100 : 0,
      usage: row.attempts || 0
    }));


  private async updateFailureAnalysis(
    provider: PaymentProvider,
    errorCode: string,
    failureReason: string
  ): Promise<void> {

    const timestamp = new Date();
    const hourKey = timestamp.toISOString().slice(0, 13); // YYYY-MM-DDTHH

    const query = `
      INSERT INTO payment_failure_analysis (
        provider, error_code, failure_reason, hour_key, count, last_updated
      ) VALUES ($1, $2, $3, $4, 1, $5)
      ON CONFLICT (provider, error_code, hour_key) DO UPDATE SET
        count = payment_failure_analysis.count + 1,
        last_updated = $5
    `;

    await this.dbConnection.query(query, [
      provider,
      errorCode,
      failureReason,
      hourKey,
      timestamp
    ]);


  private async getFailureTimePattern(
    provider: PaymentProvider,
    errorCode: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{hour: number; frequency: number}>> {
    const query = `
      SELECT 
        EXTRACT(HOUR FROM to_timestamp(pe.timestamp / 1000)) as hour,
        COUNT(*) as frequency
      FROM payment_events pe
      WHERE pe.type = 'payment_failure'
      AND pe.metadata->>'provider' = $1
      AND pe.metadata->>'errorCode' = $2
      AND pe.timestamp BETWEEN $3 AND $4
      GROUP BY EXTRACT(HOUR FROM to_timestamp(pe.timestamp / 1000))
      ORDER BY hour
    `;

    const results = await this.dbConnection.query(query, [
      provider,
      errorCode,
      startDate.getTime(),
      endDate.getTime()
    ]);

    return results.map((row: any) => ({
      hour: parseInt(row.hour),
      frequency: row.frequency
    }));


  private async getFailureGeographicPattern(
    provider: PaymentProvider,
    errorCode: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{countryCode: string; frequency: number}>> {
    const query = `
      SELECT 
        pe.metadata->>'country' as country_code,
        COUNT(*) as frequency
      FROM payment_events pe
      WHERE pe.type = 'payment_failure'
      AND pe.metadata->>'provider' = $1
      AND pe.metadata->>'errorCode' = $2
      AND pe.timestamp BETWEEN $3 AND $4
      AND pe.metadata->>'country' IS NOT NULL
      GROUP BY pe.metadata->>'country'
      ORDER BY frequency DESC
    `;

    const results = await this.dbConnection.query(query, [
      provider,
      errorCode,
      startDate.getTime(),
      endDate.getTime()
    ]);

    return results.map((row: any) => ({
      countryCode: row.country_code,
      frequency: row.frequency
    }));


  private async getFailureAmountPattern(
    provider: PaymentProvider,
    errorCode: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{amountRange: string; frequency: number}>> {
    const query = `
      SELECT 
        CASE 
          WHEN CAST(pe.metadata->>'amount' AS INTEGER) < 1000 THEN '$0-$10'
          WHEN CAST(pe.metadata->>'amount' AS INTEGER) < 5000 THEN '$10-$50'
          WHEN CAST(pe.metadata->>'amount' AS INTEGER) < 10000 THEN '$50-$100'
          WHEN CAST(pe.metadata->>'amount' AS INTEGER) < 25000 THEN '$100-$250'
          ELSE '$250+'
        END as amount_range,
        COUNT(*) as frequency
      FROM payment_events pe
      WHERE pe.type = 'payment_failure'
      AND pe.metadata->>'provider' = $1
      AND pe.metadata->>'errorCode' = $2
      AND pe.timestamp BETWEEN $3 AND $4
      AND pe.metadata->>'amount' IS NOT NULL
      GROUP BY amount_range
      ORDER BY frequency DESC
    `;

    const results = await this.dbConnection.query(query, [
      provider,
      errorCode,
      startDate.getTime(),
      endDate.getTime()
    ]);

    return results.map((row: any) => ({
      amountRange: row.amount_range,
      frequency: row.frequency
    }));



export {
  PaymentAnalyticsEventType,
  PaymentProviderMetrics,
  PaymentMethodMetrics,
  PaymentFailureAnalysis,
  PaymentWebhookEvent
};