/**
 * Revenue ETL (Extract, Transform, Load) Service
 * Story 30.1.1 - Revenue Data Warehouse Integration
 * 
 * Extends Epic 1 analytics warehouse with revenue fact tables and
 * implements ETL processes for revenue data transformation
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { 
  RevenueEvent, 
  RevenueAggregation, 
  TemplateRevenueMetrics, 
  CreatorRevenueMetrics 
 from '../revenue/RevenueDataModel';
import { 
  Transaction, 
  Order, 
  PaymentProvider, 
  LicenseType 
 from '../marketplace/transaction.types';

// ETL Job Types
export enum ETLJobType {
  REVENUE_FACT_LOAD = 'revenue_fact_load',
  TEMPLATE_METRICS_AGGREGATION = 'template_metrics_aggregation',
  CREATOR_METRICS_AGGREGATION = 'creator_metrics_aggregation',
  REVENUE_RECONCILIATION = 'revenue_reconciliation',
  HISTORICAL_BACKFILL = 'historical_backfill'


// ETL Job Status
export enum ETLJobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRYING = 'retrying'


// ETL Job Configuration



export interface ETLJobConfig {
  id: string;
  type: ETLJobType;
  status: ETLJobStatus;
  source_table: string;
  target_table: string;
  batch_size: number;
  start_date: Date;
  end_date: Date;
  filters?: Record<string, any>;
  transformation_rules?: Record<string, any>;
  created_at: Date;
  started_at?: Date;
  completed_at?: Date;
  error_message?: string;
  retry_count: number;
  max_retries: number;





// Revenue Fact Table Schema



export interface RevenueFact {
  id: string;
  
  // Time Dimension
  date_key: string; // YYYYMMDD format
  hour_key: number; // 0-23
  quarter_key: string; // YYYYQ format
  month_key: string; // YYYYMM format
  week_key: string; // YYYYWW format
  
  // Transaction Dimensions
  transaction_id: string;
  order_id: string;
  user_id: string;
  template_id?: string;
  creator_id?: string;
  
  // Product Dimensions
  license_type?: LicenseType;
  payment_provider: PaymentProvider;
  
  // Geographic Dimensions
  country_code?: string;
  state_code?: string;
  city?: string;
  
  // Marketing Dimensions
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer_domain?: string;
  
  // Measures (Facts)
  gross_revenue_cents: number;
  net_revenue_cents: number;
  fee_cents: number;
  tax_cents: number;
  discount_cents: number;
  commission_cents: number;
  
  // Derived Measures
  is_first_purchase: boolean;
  is_refund: boolean;
  customer_lifetime_order_number: number;
  days_since_last_purchase: number;
  
  // Quality Flags
  data_quality_score: number;
  is_suspicious_transaction: boolean;
  reconciliation_status: 'pending' | 'matched' | 'discrepancy';
  
  created_at: Date;
  updated_at: Date;





export class RevenueETLService extends EventEmitter {
  private dbConnection: any;
  private batchSize: number;
  private retryMaxAttempts: number;
  private retryDelayMs: number;

  constructor(
    dbConnection: any,
    options: {
      batchSize?: number;
      retryMaxAttempts?: number;
      retryDelayMs?: number;
 = {}
  ) {
    super();
    this.dbConnection = dbConnection;
    this.batchSize = options.batchSize || 1000;
    this.retryMaxAttempts = options.retryMaxAttempts || 3;
    this.retryDelayMs = options.retryDelayMs || 5000;


  /**
   * Execute ETL job
   */
  async executeETLJob(jobConfig: ETLJobConfig): Promise<void> {

    const startTime = performance.now();
    
    try {
      // Update job status to running
      await this.updateJobStatus(jobConfig.id, ETLJobStatus.RUNNING, new Date());
      
      this.emit('job_started', { jobId: jobConfig.id, type: jobConfig.type });
      
      switch (jobConfig.type) {
        case ETLJobType.REVENUE_FACT_LOAD:
          await this.executeRevenueFactLoad(jobConfig);
          break;
        case ETLJobType.TEMPLATE_METRICS_AGGREGATION:
          await this.executeTemplateMetricsAggregation(jobConfig);
          break;
        case ETLJobType.CREATOR_METRICS_AGGREGATION:
          await this.executeCreatorMetricsAggregation(jobConfig);
          break;
        case ETLJobType.REVENUE_RECONCILIATION:
          await this.executeRevenueReconciliation(jobConfig);
          break;
        case ETLJobType.HISTORICAL_BACKFILL:
          await this.executeHistoricalBackfill(jobConfig);
          break;
        default:
          throw new Error(`Unknown ETL job type: ${jobConfig.type}`);

      
      // Update job status to completed
      await this.updateJobStatus(jobConfig.id, ETLJobStatus.COMPLETED, undefined, new Date());
      
      const duration = performance.now() - startTime;
      this.emit('job_completed', { 
        jobId: jobConfig.id, 
        type: jobConfig.type, 
        duration 
      });
 catch (error) {
      await this.handleJobError(jobConfig, error as Error);
      throw error;



  /**
   * Load revenue events into fact table with dimensional modeling
   */
  private async executeRevenueFactLoad(jobConfig: ETLJobConfig): Promise<void> {

    const query = `
      SELECT 
        re.id,
        re.timestamp,
        re.user_id,
        re.amount_cents,
        re.currency,
        re.transaction_id,
        re.order_id,
        re.template_id,
        re.creator_id,
        re.revenue_type,
        re.payment_provider,
        re.license_type,
        re.country_code,
        re.state_code,
        re.city,
        re.utm_source,
        re.utm_medium,
        re.utm_campaign,
        re.referrer,
        
        -- Join transaction data for additional facts
        t.fee_cents,
        t.net_amount_cents,
        
        -- Join order data for additional context
        o.tax_cents,
        o.discount_cents,
        
        -- Calculate derived measures
        (SELECT COUNT(*) FROM revenue_events re2 
         WHERE re2.user_id = re.user_id 
         AND re2.timestamp <= re.timestamp 
         AND re2.revenue_type = 'purchase') as customer_lifetime_order_number,
         
        CASE 
          WHEN LAG(re.timestamp) OVER (PARTITION BY re.user_id ORDER BY re.timestamp) IS NULL 
          THEN true 
          ELSE false 
        END as is_first_purchase
        
      FROM revenue_events re
      LEFT JOIN transactions t ON re.transaction_id = t.id
      LEFT JOIN orders o ON re.order_id = o.id
      WHERE re.created_at BETWEEN $1 AND $2
      AND re.id NOT IN (SELECT revenue_event_id FROM revenue_facts WHERE revenue_event_id = re.id)
      ORDER BY re.timestamp
      LIMIT $3
    `;

    let offset = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const events = await this.dbConnection.query(query, [
        jobConfig.start_date,
        jobConfig.end_date,
        this.batchSize
      ]);

      if (events.rows.length === 0) {
        hasMoreData = false;
        break;


      // Transform events to revenue facts
      const revenueFacts = await Promise.all(
        events.rows.map(event => this.transformToRevenueFact(event))
      );

      // Load facts into warehouse
      await this.loadRevenueFactsBatch(revenueFacts);

      this.emit('batch_processed', {
        jobId: jobConfig.id,
        batchSize: events.rows.length,
        offset
      });

      offset += this.batchSize;
      
      if (events.rows.length < this.batchSize) {
        hasMoreData = false;




  /**
   * Transform revenue event to fact table format
   */
  private async transformToRevenueFact(event: any): Promise<RevenueFact> {

    const eventDate = new Date(event.timestamp);
    
    // Calculate derived measures
    const daysSinceLastPurchase = await this.calculateDaysSinceLastPurchase(
      event.user_id, 
      eventDate
    );
    
    const isFirstPurchase = event.customer_lifetime_order_number === 1;
    const isRefund = event.revenue_type === 'refund';
    
    // Calculate data quality score
    const dataQualityScore = this.calculateDataQualityScore(event);
    
    // Detect suspicious transactions
    const isSuspiciousTransaction = this.detectSuspiciousTransaction(event);
    
    // Extract referrer domain
    const referrerDomain = event.referrer ? 
      new URL(event.referrer).hostname : null;

    return {
      id: `fact_${event.id}`,
      
      // Time dimensions
      date_key: this.formatDateKey(eventDate),
      hour_key: eventDate.getHours(),
      quarter_key: this.formatQuarterKey(eventDate),
      month_key: this.formatMonthKey(eventDate),
      week_key: this.formatWeekKey(eventDate),
      
      // Transaction dimensions
      transaction_id: event.transaction_id,
      order_id: event.order_id,
      user_id: event.user_id,
      template_id: event.template_id,
      creator_id: event.creator_id,
      
      // Product dimensions
      license_type: event.license_type,
      payment_provider: event.payment_provider,
      
      // Geographic dimensions
      country_code: event.country_code,
      state_code: event.state_code,
      city: event.city,
      
      // Marketing dimensions
      utm_source: event.utm_source,
      utm_medium: event.utm_medium,
      utm_campaign: event.utm_campaign,
      referrer_domain: referrerDomain,
      
      // Measures
      gross_revenue_cents: event.amount_cents,
      net_revenue_cents: event.net_amount_cents || event.amount_cents,
      fee_cents: event.fee_cents || 0,
      tax_cents: event.tax_cents || 0,
      discount_cents: event.discount_cents || 0,
      commission_cents: await this.calculateCommission(event),
      
      // Derived measures
      is_first_purchase: isFirstPurchase,
      is_refund: isRefund,
      customer_lifetime_order_number: event.customer_lifetime_order_number,
      days_since_last_purchase: daysSinceLastPurchase,
      
      // Quality flags
      data_quality_score: dataQualityScore,
      is_suspicious_transaction: isSuspiciousTransaction,
      reconciliation_status: 'pending',
      
      created_at: new Date(),
      updated_at: new Date(};


  /**
   * Aggregate template revenue metrics
   */
  private async executeTemplateMetricsAggregation(jobConfig: ETLJobConfig): Promise<void> {

    const query = `
      WITH template_revenue_data AS (
        SELECT 
          rf.template_id,
          rf.creator_id,
          COUNT(DISTINCT rf.transaction_id) as transaction_count,
          COUNT(DISTINCT rf.user_id) as unique_buyers,
          SUM(rf.gross_revenue_cents) as total_revenue_cents,
          SUM(rf.net_revenue_cents) as net_revenue_cents,
          SUM(rf.commission_cents) as commission_cents,
          SUM(CASE WHEN rf.is_refund THEN rf.gross_revenue_cents ELSE 0 END) as refund_cents,
          AVG(rf.gross_revenue_cents) as avg_order_value_cents,
          SUM(CASE WHEN NOT rf.is_first_purchase THEN 1 ELSE 0 END)::DECIMAL / 
            NULLIF(COUNT(DISTINCT rf.user_id), 0) as repeat_purchase_rate,
          MIN(rf.created_at) as first_sale_at,
          MAX(rf.created_at) as last_sale_at,
          
          -- License type breakdown
          jsonb_agg(
            DISTINCT jsonb_build_object(
              'license_type', rf.license_type,
              'count', COUNT(*) OVER (PARTITION BY rf.license_type),
              'revenue_cents', SUM(rf.gross_revenue_cents) OVER (PARTITION BY rf.license_type)

          ) as license_breakdown
          
        FROM revenue_facts rf
        WHERE rf.template_id IS NOT NULL
        AND rf.created_at BETWEEN $1 AND $2
        GROUP BY rf.template_id, rf.creator_id

      INSERT INTO template_revenue_metrics (
        template_id, creator_id, total_revenue_cents, gross_revenue_cents,
        net_revenue_cents, commission_cents, refund_cents, transaction_count,
        unique_buyers, repeat_purchase_rate, average_order_value_cents,
        license_breakdown, first_sale_at, last_sale_at,
        period_start, period_end, updated_at

      SELECT 
        template_id, creator_id, total_revenue_cents, total_revenue_cents,
        net_revenue_cents, commission_cents, refund_cents, transaction_count,
        unique_buyers, repeat_purchase_rate, avg_order_value_cents::INTEGER,
        license_breakdown, first_sale_at, last_sale_at,
        $1, $2, NOW()
      FROM template_revenue_data
      
      ON CONFLICT (template_id, period_start, period_end)
      DO UPDATE SET
        total_revenue_cents = EXCLUDED.total_revenue_cents,
        gross_revenue_cents = EXCLUDED.gross_revenue_cents,
        net_revenue_cents = EXCLUDED.net_revenue_cents,
        commission_cents = EXCLUDED.commission_cents,
        refund_cents = EXCLUDED.refund_cents,
        transaction_count = EXCLUDED.transaction_count,
        unique_buyers = EXCLUDED.unique_buyers,
        repeat_purchase_rate = EXCLUDED.repeat_purchase_rate,
        average_order_value_cents = EXCLUDED.average_order_value_cents,
        license_breakdown = EXCLUDED.license_breakdown,
        first_sale_at = EXCLUDED.first_sale_at,
        last_sale_at = EXCLUDED.last_sale_at,
        updated_at = NOW()
    `;

    await this.dbConnection.query(query, [
      jobConfig.start_date,
      jobConfig.end_date
    ]);


  /**
   * Aggregate creator revenue metrics
   */
  private async executeCreatorMetricsAggregation(jobConfig: ETLJobConfig): Promise<void> {

    const query = `
      WITH creator_revenue_data AS (
        SELECT 
          rf.creator_id,
          SUM(rf.commission_cents) as total_earnings_cents,
          COUNT(DISTINCT rf.template_id) as template_count,
          COUNT(DISTINCT rf.transaction_id) as total_sales,
          COUNT(DISTINCT rf.user_id) as unique_buyers,
          
          -- Find top performing template
          (SELECT template_id FROM revenue_facts rf2 
           WHERE rf2.creator_id = rf.creator_id 
           GROUP BY template_id 
           ORDER BY SUM(commission_cents) DESC 
           LIMIT 1) as top_template_id,
           
          (SELECT SUM(commission_cents) FROM revenue_facts rf2 
           WHERE rf2.creator_id = rf.creator_id 
           AND rf2.template_id = (
             SELECT template_id FROM revenue_facts rf3 
             WHERE rf3.creator_id = rf.creator_id 
             GROUP BY template_id 
             ORDER BY SUM(commission_cents) DESC 
             LIMIT 1
           )) as top_template_revenue_cents,
           
          -- Revenue by license type
          jsonb_agg(
            DISTINCT jsonb_build_object(
              'license_type', rf.license_type,
              'count', COUNT(*) OVER (PARTITION BY rf.license_type),
              'revenue_cents', SUM(rf.commission_cents) OVER (PARTITION BY rf.license_type)

          ) as revenue_by_license_type
          
        FROM revenue_facts rf
        WHERE rf.creator_id IS NOT NULL
        AND rf.created_at BETWEEN $1 AND $2
        GROUP BY rf.creator_id

      INSERT INTO creator_revenue_metrics (
        creator_id, total_earnings_cents, pending_payout_cents,
        paid_out_cents, lifetime_earnings_cents, template_count,
        active_template_count, total_sales, unique_buyers,
        top_template_id, top_template_revenue_cents, revenue_by_license_type,
        payout_frequency, next_payout_date, payment_method,
        period_start, period_end, updated_at

      SELECT 
        creator_id, total_earnings_cents, total_earnings_cents,
        0, total_earnings_cents, template_count,
        template_count, total_sales, unique_buyers,
        top_template_id, top_template_revenue_cents, revenue_by_license_type,
        'monthly', $2 + INTERVAL '1 month', 'stripe_connect',
        $1, $2, NOW()
      FROM creator_revenue_data
      
      ON CONFLICT (creator_id, period_start, period_end)
      DO UPDATE SET
        total_earnings_cents = EXCLUDED.total_earnings_cents,
        template_count = EXCLUDED.template_count,
        total_sales = EXCLUDED.total_sales,
        unique_buyers = EXCLUDED.unique_buyers,
        top_template_id = EXCLUDED.top_template_id,
        top_template_revenue_cents = EXCLUDED.top_template_revenue_cents,
        revenue_by_license_type = EXCLUDED.revenue_by_license_type,
        updated_at = NOW()
    `;

    await this.dbConnection.query(query, [
      jobConfig.start_date,
      jobConfig.end_date
    ]);


  /**
   * Execute revenue reconciliation
   */
  private async executeRevenueReconciliation(jobConfig: ETLJobConfig): Promise<void> {

    // Reconcile revenue facts with source transactions
    const reconciliationQuery = `
      UPDATE revenue_facts rf
      SET reconciliation_status = CASE 
        WHEN t.net_amount_cents = rf.net_revenue_cents THEN 'matched'
        ELSE 'discrepancy'
      END
      FROM transactions t
      WHERE rf.transaction_id = t.id
      AND rf.reconciliation_status = 'pending'
      AND rf.created_at BETWEEN $1 AND $2
    `;

    await this.dbConnection.query(reconciliationQuery, [
      jobConfig.start_date,
      jobConfig.end_date
    ]);

    // Log discrepancies
    const discrepancyQuery = `
      INSERT INTO etl_reconciliation_log (
        fact_id, transaction_id, discrepancy_type, 
        expected_amount, actual_amount, created_at

      SELECT 
        rf.id, rf.transaction_id, 'amount_mismatch',
        t.net_amount_cents, rf.net_revenue_cents, NOW()
      FROM revenue_facts rf
      JOIN transactions t ON rf.transaction_id = t.id
      WHERE rf.reconciliation_status = 'discrepancy'
      AND rf.created_at BETWEEN $1 AND $2
    `;

    await this.dbConnection.query(discrepancyQuery, [
      jobConfig.start_date,
      jobConfig.end_date
    ]);


  /**
   * Execute historical backfill
   */
  private async executeHistoricalBackfill(jobConfig: ETLJobConfig): Promise<void> {

    // This would implement a more complex backfill process
    // for historical data that needs to be processed
    const backfillQuery = `
      INSERT INTO revenue_events (
        id, event_type, timestamp, session_id, user_id,
        amount_cents, currency, transaction_id, order_id,
        template_id, creator_id, revenue_type, payment_provider,
        license_type, country_code, metadata, created_at

      SELECT 
        'hist_' || t.id,
        'transaction_completed',
        EXTRACT(EPOCH FROM t.created_at) * 1000,
        'historical_session',
        t.user_id,
        t.net_amount_cents,
        t.currency,
        t.id,
        o.id,
        oi.template_id,
        tm.creator_id,
        CASE t.transaction_type 
          WHEN 'purchase' THEN 'purchase'
          WHEN 'refund' THEN 'refund'
          ELSE 'purchase'
        END,
        t.provider,
        oi.license_type,
        o.billing_address->>'country',
        '{}',
        t.created_at
      FROM transactions t
      JOIN orders o ON t.payment_intent_id = o.payment_intent_id
      JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN templates tm ON oi.template_id = tm.id
      WHERE t.created_at BETWEEN $1 AND $2
      AND t.status = 'succeeded'
      AND NOT EXISTS (
        SELECT 1 FROM revenue_events re 
        WHERE re.transaction_id = t.id

    `;

    await this.dbConnection.query(backfillQuery, [
      jobConfig.start_date,
      jobConfig.end_date
    ]);


  // Helper methods
  private async loadRevenueFactsBatch(facts: RevenueFact[]): Promise<void> {

    if (facts.length === 0) return;

    const values = facts.map((fact, index) => {
      const offset = index * 24; // 24 fields per fact
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, 
              $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10},
              $${offset + 11}, $${offset + 12}, $${offset + 13}, $${offset + 14}, $${offset + 15},
              $${offset + 16}, $${offset + 17}, $${offset + 18}, $${offset + 19}, $${offset + 20},
              $${offset + 21}, $${offset + 22}, $${offset + 23}, $${offset + 24})`;
    }).join(', ');

    const params = facts.flatMap(fact => [
      fact.id, fact.date_key, fact.hour_key, fact.quarter_key, fact.month_key,
      fact.week_key, fact.transaction_id, fact.order_id, fact.user_id, fact.template_id,
      fact.creator_id, fact.license_type, fact.payment_provider, fact.country_code, fact.state_code,
      fact.city, fact.gross_revenue_cents, fact.net_revenue_cents, fact.fee_cents, fact.commission_cents,
      fact.is_first_purchase, fact.customer_lifetime_order_number, fact.data_quality_score, fact.created_at
    ]);

    const query = `
      INSERT INTO revenue_facts (
        id, date_key, hour_key, quarter_key, month_key, week_key,
        transaction_id, order_id, user_id, template_id, creator_id,
        license_type, payment_provider, country_code, state_code, city,
        gross_revenue_cents, net_revenue_cents, fee_cents, commission_cents,
        is_first_purchase, customer_lifetime_order_number, data_quality_score, created_at
      ) VALUES ${values}
      ON CONFLICT (id) DO NOTHING
    `;

    await this.dbConnection.query(query, params);


  // Utility methods for date formatting
  private formatDateKey(date: Date): string {
    return date.toISOString().slice(0, 10).replace(/-/g, '');


  private formatQuarterKey(date: Date): string {
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    return `${date.getFullYear()}Q${quarter}`;


  private formatMonthKey(date: Date): string {
    return date.toISOString().slice(0, 7).replace('-', '');


  private formatWeekKey(date: Date): string {
    const week = this.getWeekNumber(date);
    return `${date.getFullYear()}W${week.toString().padStart(2, '0')}`;


  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);


  private async calculateDaysSinceLastPurchase(userId: string, currentDate: Date): Promise<number> {

    // Implementation would query for last purchase date
    return 0; // Placeholder


  private calculateDataQualityScore(event: any): number {
    let score = 1.0;
    
    // Deduct points for missing required fields
    if (!event.transaction_id) score -= 0.2;
    if (!event.user_id) score -= 0.2;
    if (!event.amount_cents) score -= 0.3;
    if (!event.currency) score -= 0.1;
    if (!event.payment_provider) score -= 0.1;
    
    // Deduct points for suspicious patterns
    if (event.amount_cents > 100000000) score -= 0.1; // Very large amounts
    if (event.amount_cents === 0) score -= 0.1; // Zero amounts
    
    return Math.max(0, score);


  private detectSuspiciousTransaction(event: any): boolean {
    // Simple suspicious transaction detection
    if (event.amount_cents > 100000000) return true; // Very large amounts
    if (event.amount_cents < 0 && event.revenue_type !== 'refund') return true;
    
    return false;


  private async calculateCommission(event: any): Promise<number> {

    if (event.creator_id && event.revenue_type === 'purchase') {
      // Default commission rate - would be fetched from creator settings
      return Math.round(event.amount_cents * 0.7);

    return 0;


  private async updateJobStatus(
    jobId: string, 
    status: ETLJobStatus, 
    startedAt?: Date, 
    completedAt?: Date
  ): Promise<void> {

    const updates: string[] = ['status = $2'];
    const params: any[] = [jobId, status];
    
    if (startedAt) {
      updates.push('started_at = $3');
      params.push(startedAt);

    
    if (completedAt) {
      updates.push('completed_at = $' + (params.length + 1));
      params.push(completedAt);


    const query = `UPDATE etl_jobs SET ${updates.join(', ')} WHERE id = $1`;
    await this.dbConnection.query(query, params);


  private async handleJobError(jobConfig: ETLJobConfig, error: Error): Promise<void> {

    const retryCount = jobConfig.retry_count + 1;
    
    if (retryCount <= jobConfig.max_retries) {
      // Schedule retry
      await this.dbConnection.query(
        'UPDATE etl_jobs SET status = $1, retry_count = $2, error_message = $3 WHERE id = $4',
        [ETLJobStatus.RETRYING, retryCount, error.message, jobConfig.id]
      );
      
      this.emit('job_retry_scheduled', { 
        jobId: jobConfig.id, 
        retryCount, 
        error: error.message 
      });
 else {
      // Mark as failed
      await this.dbConnection.query(
        'UPDATE etl_jobs SET status = $1, error_message = $2 WHERE id = $3',
        [ETLJobStatus.FAILED, error.message, jobConfig.id]
      );
      
      this.emit('job_failed', { 
        jobId: jobConfig.id, 
        error: error.message 
      });




export { ETLJobType, ETLJobStatus, ETLJobConfig, RevenueFact };