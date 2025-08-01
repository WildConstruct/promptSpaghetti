/**
 * Revenue Collection API
 * Story 30.1.1 - Revenue Data Model Integration  
 * 
 * Extends Epic 16 marketplace APIs with revenue tracking and
 * integrates with Epic 1 analytics infrastructure
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { 
  RevenueEvent, 
  RevenueEventType, 
  RevenueEventSchema,
  RevenueAttribution 
 from './RevenueDataModel';
import { 
  Transaction, 
  Order, 
  TransactionType,
  PaymentProvider 
 from '../marketplace/transaction.types';
import { AnalyticsCollector } from '../analytics/AnalyticsCollector';

// Revenue Collection Service
export class RevenueCollectionService {
  private analyticsCollector: AnalyticsCollector;
  private dbConnection: any; // Use your actual DB connection type

  constructor(analyticsCollector: AnalyticsCollector, dbConnection: any) {
    this.analyticsCollector = analyticsCollector;
    this.dbConnection = dbConnection;


  /**
   * Record a completed transaction as a revenue event
   */
  async recordTransactionRevenue(
    transaction: Transaction, 
    order: Order,
    sessionId: string,
    userContext?: {
      userId?: string;
      organizationId?: string;
      ipAddress?: string;
      userAgent?: string;
      referrer?: string;
      utmParams?: {
        source?: string;
        medium?: string;
        campaign?: string;
      };

  ): Promise<RevenueEvent> {

    // Create revenue event
    const revenueEvent: RevenueEvent = {
      id: uuidv4(),
      type: this.mapTransactionToRevenueEventType(transaction.transaction_type),
      timestamp: Date.now(),
      sessionId,
      userId: userContext?.userId || transaction.user_id,
      organizationId: userContext?.organizationId,
      metadata: {
        transaction_id: transaction.id,
        order_id: order.id,
        payment_provider: transaction.provider,
        risk_score: transaction.risk_score,
        fraud_flags: transaction.fraud_flags

      revenue_data: {
        amount_cents: transaction.net_amount_cents,
        currency: transaction.currency,
        transaction_id: transaction.id,
        order_id: order.id,
        revenue_type: this.mapTransactionType(transaction.transaction_type),
        payment_provider: transaction.provider,
        country_code: order.billing_address.country,
        state_code: order.billing_address.state,
        city: order.billing_address.city,
        user_agent: userContext?.userAgent,
        referrer: userContext?.referrer,
        utm_source: userContext?.utmParams?.source,
        utm_medium: userContext?.utmParams?.medium,
        utm_campaign: userContext?.utmParams?.campaign

    };

    // Process order items for template attribution
    await this.processOrderItemAttribution(order, transaction, revenueEvent);

    // Stream to Epic 1 analytics infrastructure
    await this.analyticsCollector.track(revenueEvent);

    // Store in revenue events table
    await this.storeRevenueEvent(revenueEvent);

    // Trigger real-time aggregation update
    await this.updateRealtimeAggregations(revenueEvent);

    return revenueEvent;


  /**
   * Process revenue attribution for order items
   */
  private async processOrderItemAttribution(
    order: Order, 
    transaction: Transaction, 
    revenueEvent: RevenueEvent
  ): Promise<void> {

    for (const item of order.items) {
      // Get template and creator information
      const templateInfo = await this.getTemplateInfo(item.template_id);
      
      if (templateInfo) {
        // Create attribution record
        const attribution: RevenueAttribution = {
          id: uuidv4(),
          transaction_id: transaction.id,
          template_id: item.template_id,
          creator_id: templateInfo.creator_id,
          attribution_model: 'direct', // Default for direct purchases
          attribution_percentage: 1.0,
          revenue_cents: item.total_price_cents,
          commission_cents: this.calculateCommission(item.total_price_cents, templateInfo.commission_rate),
          created_at: new Date()
        };

        await this.storeRevenueAttribution(attribution);

        // Add template context to revenue event
        if (!revenueEvent.revenue_data.template_id) {
          revenueEvent.revenue_data.template_id = item.template_id;
          revenueEvent.revenue_data.creator_id = templateInfo.creator_id;
          revenueEvent.revenue_data.license_type = item.license_type;


        // Create commission event for creator
        await this.createCommissionEvent(attribution, revenueEvent.sessionId);




  /**
   * Create commission earned event for creators
   */
  private async createCommissionEvent(
    attribution: RevenueAttribution,
    sessionId: string
  ): Promise<void> {

    const commissionEvent: RevenueEvent = {
      id: uuidv4(),
      type: RevenueEventType.COMMISSION_EARNED,
      timestamp: Date.now(),
      sessionId,
      userId: attribution.creator_id,
      metadata: {
        attribution_id: attribution.id,
        transaction_id: attribution.transaction_id,
        template_id: attribution.template_id

      revenue_data: {
        amount_cents: attribution.commission_cents,
        currency: 'USD', // Default currency
        template_id: attribution.template_id,
        creator_id: attribution.creator_id,
        revenue_type: 'commission',
        payment_provider: PaymentProvider.STRIPE // Will be updated with actual provider

    };

    await this.analyticsCollector.track(commissionEvent);
    await this.storeRevenueEvent(commissionEvent);


  /**
   * Handle subscription-related revenue events
   */
  async recordSubscriptionRevenue(
    subscriptionEvent: {
      type: 'created' | 'renewed' | 'cancelled' | 'upgraded' | 'downgraded';
      subscription_id: string;
      user_id: string;
      plan_id: string;
      amount_cents: number;
      currency: string;
      billing_cycle: 'monthly' | 'annual';
      previous_plan_id?: string;

    sessionId: string
  ): Promise<RevenueEvent> {

    const eventType = this.mapSubscriptionEventType(subscriptionEvent.type);
    
    const revenueEvent: RevenueEvent = {
      id: uuidv4(),
      type: eventType,
      timestamp: Date.now(),
      sessionId,
      userId: subscriptionEvent.user_id,
      metadata: {
        subscription_id: subscriptionEvent.subscription_id,
        plan_id: subscriptionEvent.plan_id,
        billing_cycle: subscriptionEvent.billing_cycle,
        previous_plan_id: subscriptionEvent.previous_plan_id

      revenue_data: {
        amount_cents: subscriptionEvent.amount_cents,
        currency: subscriptionEvent.currency,
        revenue_type: 'subscription',
        payment_provider: PaymentProvider.STRIPE // Will be determined dynamically

    };

    await this.analyticsCollector.track(revenueEvent);
    await this.storeRevenueEvent(revenueEvent);
    await this.updateRealtimeAggregations(revenueEvent);

    return revenueEvent;


  /**
   * Handle refund revenue events
   */
  async recordRefundRevenue(
    refund: {
      id: string;
      transaction_id: string;
      order_id: string;
      amount_cents: number;
      reason: string;
      processed_by: string;

    sessionId: string
  ): Promise<RevenueEvent> {

    const revenueEvent: RevenueEvent = {
      id: uuidv4(),
      type: RevenueEventType.TRANSACTION_REFUNDED,
      timestamp: Date.now(),
      sessionId,
      metadata: {
        refund_id: refund.id,
        transaction_id: refund.transaction_id,
        order_id: refund.order_id,
        refund_reason: refund.reason,
        processed_by: refund.processed_by

      revenue_data: {
        amount_cents: -refund.amount_cents, // Negative for refunds
        currency: 'USD',
        transaction_id: refund.transaction_id,
        order_id: refund.order_id,
        revenue_type: 'refund',
        payment_provider: PaymentProvider.STRIPE

    };

    await this.analyticsCollector.track(revenueEvent);
    await this.storeRevenueEvent(revenueEvent);
    await this.updateRealtimeAggregations(revenueEvent);

    return revenueEvent;


  /**
   * Update real-time revenue aggregations
   */
  private async updateRealtimeAggregations(revenueEvent: RevenueEvent): Promise<void> {

    const now = new Date();
    const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Update hourly aggregation
    await this.upsertAggregation('hourly', hourStart, revenueEvent);
    
    // Update daily aggregation
    await this.upsertAggregation('daily', dayStart, revenueEvent);


  /**
   * Upsert aggregation record
   */
  private async upsertAggregation(
    type: 'hourly' | 'daily', 
    periodStart: Date, 
    revenueEvent: RevenueEvent
  ): Promise<void> {

    const periodEnd = new Date(periodStart);
    if (type === 'hourly') {
      periodEnd.setHours(periodEnd.getHours() + 1);
 else {
      periodEnd.setDate(periodEnd.getDate() + 1);


    // Implementation would use database upsert operations
    // This is a simplified version
    const query = `
      INSERT INTO revenue_aggregations (
        aggregation_type, period_start, period_end, 
        total_revenue_cents, transaction_count,
        payment_method_breakdown, geographic_breakdown
      ) VALUES ($1, $2, $3, $4, 1, $5, $6)
      ON CONFLICT (aggregation_type, period_start, period_end)
      DO UPDATE SET
        total_revenue_cents = revenue_aggregations.total_revenue_cents + $4,
        transaction_count = revenue_aggregations.transaction_count + 1,
        updated_at = NOW()
    `;

    const paymentMethodBreakdown = JSON.stringify([{
      provider: revenueEvent.revenue_data.payment_provider,
      revenue_cents: revenueEvent.revenue_data.amount_cents,
      transaction_count: 1
]);

    const geographicBreakdown = JSON.stringify([{
      country_code: revenueEvent.revenue_data.country_code,
      revenue_cents: revenueEvent.revenue_data.amount_cents,
      transaction_count: 1
]);

    await this.dbConnection.query(query, [
      type,
      periodStart,
      periodEnd,
      revenueEvent.revenue_data.amount_cents,
      paymentMethodBreakdown,
      geographicBreakdown
    ]);


  // Helper methods
  private mapTransactionToRevenueEventType(transactionType: TransactionType): RevenueEventType {
    switch (transactionType) {
      case TransactionType.PURCHASE:
        return RevenueEventType.TRANSACTION_COMPLETED;
      case TransactionType.REFUND:
      case TransactionType.PARTIAL_REFUND:
        return RevenueEventType.TRANSACTION_REFUNDED;
      case TransactionType.SUBSCRIPTION:
      case TransactionType.SUBSCRIPTION_RENEWAL:
        return RevenueEventType.SUBSCRIPTION_RENEWED;
      default:
        return RevenueEventType.TRANSACTION_COMPLETED;



  private mapTransactionType(transactionType: TransactionType): 'purchase' | 'subscription' | 'commission' | 'refund' {
    switch (transactionType) {
      case TransactionType.PURCHASE:
        return 'purchase';
      case TransactionType.SUBSCRIPTION:
      case TransactionType.SUBSCRIPTION_RENEWAL:
        return 'subscription';
      case TransactionType.REFUND:
      case TransactionType.PARTIAL_REFUND:
        return 'refund';
      default:
        return 'purchase';



  private mapSubscriptionEventType(eventType: string): RevenueEventType {
    switch (eventType) {
      case 'created':
        return RevenueEventType.SUBSCRIPTION_CREATED;
      case 'renewed':
        return RevenueEventType.SUBSCRIPTION_RENEWED;
      case 'cancelled':
        return RevenueEventType.SUBSCRIPTION_CANCELLED;
      case 'upgraded':
        return RevenueEventType.SUBSCRIPTION_UPGRADED;
      case 'downgraded':
        return RevenueEventType.SUBSCRIPTION_DOWNGRADED;
      default:
        return RevenueEventType.SUBSCRIPTION_RENEWED;



  private async getTemplateInfo(templateId: string): Promise<{
    creator_id: string;
    commission_rate: number;
 | null> {

    // Implementation would query template information
    // Returning mock data for now
    return {
      creator_id: 'creator-uuid',
      commission_rate: 0.7 // 70% to creator
    };


  private calculateCommission(totalPriceCents: number, commissionRate: number): number {
    return Math.round(totalPriceCents * commissionRate);


  private async storeRevenueEvent(event: RevenueEvent): Promise<void> {

    const query = `
      INSERT INTO revenue_events (
        id, event_type, timestamp, session_id, user_id, organization_id,
        amount_cents, currency, transaction_id, order_id,
        template_id, creator_id, revenue_type, payment_provider,
        license_type, country_code, state_code, city,
        user_agent, referrer, utm_source, utm_medium, utm_campaign,
        metadata
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16,
        $17,
        $18,
        $19,
        $20,
        $21,
        $22,
        $23,
        $24

    `;

    await this.dbConnection.query(query, [
      event.id,
      event.type,
      event.timestamp,
      event.sessionId,
      event.userId,
      event.organizationId,
      event.revenue_data.amount_cents,
      event.revenue_data.currency,
      event.revenue_data.transaction_id,
      event.revenue_data.order_id,
      event.revenue_data.template_id,
      event.revenue_data.creator_id,
      event.revenue_data.revenue_type,
      event.revenue_data.payment_provider,
      event.revenue_data.license_type,
      event.revenue_data.country_code,
      event.revenue_data.state_code,
      event.revenue_data.city,
      event.revenue_data.user_agent,
      event.revenue_data.referrer,
      event.revenue_data.utm_source,
      event.revenue_data.utm_medium,
      event.revenue_data.utm_campaign,
      JSON.stringify(event.metadata)
    ]);


  private async storeRevenueAttribution(attribution: RevenueAttribution): Promise<void> {

    const query = `
      INSERT INTO revenue_attribution (
        id, transaction_id, template_id, creator_id, affiliate_id, campaign_id,
        attribution_model, attribution_percentage, revenue_cents, commission_cents
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    await this.dbConnection.query(query, [
      attribution.id,
      attribution.transaction_id,
      attribution.template_id,
      attribution.creator_id,
      attribution.affiliate_id,
      attribution.campaign_id,
      attribution.attribution_model,
      attribution.attribution_percentage,
      attribution.revenue_cents,
      attribution.commission_cents
    ]);



// Fastify API Routes
export async function revenueCollectionRoutes(fastify: FastifyInstance) {
  // Revenue event recording endpoint
  fastify.post('/api/revenue/record-transaction', {
    schema: {
      body: z.object({
        transaction_id: z.string().uuid(),
        order_id: z.string().uuid(),
        session_id: z.string().uuid(),
        user_context: z.object({
          user_id: z.string().uuid().optional(),
          organization_id: z.string().uuid().optional(),
          ip_address: z.string().optional(),
          user_agent: z.string().optional(),
          referrer: z.string().optional(),
          utm_params: z.object({
            source: z.string().optional(),
            medium: z.string().optional(),
            campaign: z.string().optional()
          }).optional()
        }).optional()


  }, async (request: FastifyRequest<{
    Body: {
      transaction_id: string;
      order_id: string;
      session_id: string;
      user_context?: any;

>, reply: FastifyReply) => {
    try {
      // Get transaction and order from database
      const transaction = await getTransaction(request.body.transaction_id);
      const order = await getOrder(request.body.order_id);

      if (!transaction || !order) {
        return reply.status(404).send({ error: 'Transaction or order not found' });


      // Record revenue
      const revenueCollectionService = new RevenueCollectionService(
        fastify.analyticsCollector,
        fastify.db
      );

      const revenueEvent = await revenueCollectionService.recordTransactionRevenue(
        transaction,
        order,
        request.body.session_id,
        request.body.user_context
      );

      reply.send({
        success: true,
        revenue_event_id: revenueEvent.id,
        amount_cents: revenueEvent.revenue_data.amount_cents
      });
 catch (error) {
      fastify.log.error('Revenue recording failed:', error);
      reply.status(500).send({ error: 'Failed to record revenue' });

  });

  // Subscription revenue recording
  fastify.post('/api/revenue/record-subscription', {
    schema: {
      body: z.object({
        type: z.enum(['created', 'renewed', 'cancelled', 'upgraded', 'downgraded']),
        subscription_id: z.string(),
        user_id: z.string().uuid(),
        plan_id: z.string(),
        amount_cents: z.number().int().min(0),
        currency: z.string().length(3),
        billing_cycle: z.enum(['monthly', 'annual']),
        session_id: z.string().uuid(),
        previous_plan_id: z.string().optional()


  }, async (request: FastifyRequest<{
    Body: any
>, reply: FastifyReply) => {
    try {
      const revenueCollectionService = new RevenueCollectionService(
        fastify.analyticsCollector,
        fastify.db
      );

      const revenueEvent = await revenueCollectionService.recordSubscriptionRevenue(
        request.body,
        request.body.session_id
      );

      reply.send({
        success: true,
        revenue_event_id: revenueEvent.id
      });
 catch (error) {
      fastify.log.error('Subscription revenue recording failed:', error);
      reply.status(500).send({ error: 'Failed to record subscription revenue' });

  });


// Helper functions (would be implemented elsewhere)
async function getTransaction(transactionId: string): Promise<Transaction | null> {

  // Implementation would query transaction from database
  return null;


async function getOrder(orderId: string): Promise<Order | null> {

  // Implementation would query order from database
  return null;


export { RevenueCollectionService };