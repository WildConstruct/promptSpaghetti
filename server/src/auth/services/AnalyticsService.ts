// Epic 11 Analytics Service
// Registration analytics and monitoring service

import { DatabaseService } from '../database/DatabaseService';
import { AuthConfig } from '../types';



export interface RegistrationMetrics {
  dailyRegistrations: number;
  weeklyRegistrations: number;
  monthlyRegistrations: number;
  conversionRate: number;
  averageCompletionTime: number;
  dropOffPoints: Array<{
    step: string;
    count: number;
    percentage: number;



>;
  sourceBreakdown: Record<string, {
    visits: number;
    registrations: number;
    conversionRate: number;
>;




export interface FormAnalytics {
  fieldInteractionTime: Record<string, number>;
  fieldErrorRate: Record<string, number>;
  mostProblematicFields: Array<{
    field: string;
    errorRate: number;
    averageTime: number;



>;
  stepCompletionRates: Record<number, number>;


export class AnalyticsService {
  private db: DatabaseService;
  private config: AuthConfig;

  constructor(config: AuthConfig, db: DatabaseService) {
    this.config = config;
    this.db = db;


  async trackRegistrationEvent(
    eventType: string,
    data: {
      emailHash?: string;
      ipAddress?: string;
      userAgent?: string;
      source?: string;
      referrer?: string;
      additionalData?: any;
    }
  ): Promise<void> {

    try {
      await this.db.query(`
        INSERT INTO registration_analytics (
          event_type, email_hash, ip_address, user_agent, 
          source, referrer, additional_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        eventType,
        data.emailHash,
        data.ipAddress,
        data.userAgent,
        data.source || 'organic',
        data.referrer,
        JSON.stringify(data.additionalData || {})
      ]);
 catch (error) {
      console.error('Failed to track registration event:', error);



  async trackFormFieldInteraction(
    sessionId: string,
    fieldName: string,
    eventType: 'focus' | 'blur' | 'change' | 'error',
    data: {
      fieldValueLength?: number;
      errorMessage?: string;
      timeSpentMs?: number;
    }
  ): Promise<void> {

    try {
      await this.db.query(`
        INSERT INTO form_field_analytics (
          session_id, field_name, event_type, field_value_length,
          error_message, time_spent_ms
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        sessionId,
        fieldName,
        eventType,
        data.fieldValueLength || null,
        data.errorMessage || null,
        data.timeSpentMs || null
      ]);
 catch (error) {
      console.error('Failed to track form field interaction:', error);



  async trackRegistrationFunnel(
    sessionId: string,
    step: string,
    data: {
      emailHash?: string;
      stepData?: any;
      durationMs?: number;
    }
  ): Promise<void> {

    try {
      await this.db.query(`
        INSERT INTO registration_funnel (
          session_id, email_hash, step, step_data, duration_ms
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        sessionId,
        data.emailHash,
        step,
        JSON.stringify(data.stepData || {}),
        data.durationMs
      ]);
 catch (error) {
      console.error('Failed to track registration funnel:', error);



  async getRegistrationMetrics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<RegistrationMetrics> {

    const timeframes = {
      day: '1 day',
      week: '1 week',
      month: '1 month'
    };

    try {
      // Get registration counts
      const registrationCounts = await this.db.query(`
        SELECT 
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day') as daily,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 week') as weekly,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 month') as monthly
        FROM registration_analytics 
        WHERE event_type = 'completed'
      `);

      // Get conversion rates from funnel
      const conversionData = await this.db.query(`
        WITH funnel_stats AS (
          SELECT 
            COUNT(DISTINCT CASE WHEN step = 'started' THEN session_id END) as started,
            COUNT(DISTINCT CASE WHEN step = 'completed' THEN session_id END) as completed
          FROM registration_funnel
          WHERE created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'

        SELECT 
          started,
          completed,
          CASE WHEN started > 0 THEN completed::DECIMAL / started ELSE 0 END as conversion_rate
        FROM funnel_stats
      `);

      // Get average completion time
      const completionTime = await this.db.query(`
        WITH session_times AS (
          SELECT 
            session_id,
            MIN(created_at) as start_time,
            MAX(created_at) as end_time
          FROM registration_funnel
          WHERE created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
            AND step IN ('started', 'completed')
          GROUP BY session_id
          HAVING COUNT(DISTINCT step) = 2

        SELECT AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as avg_seconds
        FROM session_times
      `);

      // Get drop-off points
      const dropOffData = await this.db.query(`
        WITH step_counts AS (
          SELECT 
            step,
            COUNT(DISTINCT session_id) as count
          FROM registration_funnel
          WHERE created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
          GROUP BY step
        ),
        total_started AS (
          SELECT count as total FROM step_counts WHERE step = 'started'

        SELECT 
          sc.step,
          sc.count,
          CASE WHEN ts.total > 0 THEN (sc.count::DECIMAL / ts.total * 100)::INTEGER ELSE 0 END as percentage
        FROM step_counts sc
        CROSS JOIN total_started ts
        ORDER BY sc.count DESC
      `);

      // Get source breakdown
      const sourceData = await this.db.query(`
        SELECT 
          COALESCE(source, 'organic') as source,
          COUNT(*) FILTER (WHERE event_type = 'started') as visits,
          COUNT(*) FILTER (WHERE event_type = 'completed') as registrations
        FROM registration_analytics
        WHERE created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
        GROUP BY source
      `);

      const counts = registrationCounts.rows[0] || { daily: 0, weekly: 0, monthly: 0 };
      const conversion = conversionData.rows[0] || { conversion_rate: 0 };
      const avgTime = completionTime.rows[0]?.avg_seconds || 0;

      return {
        dailyRegistrations: parseInt(counts.daily),
        weeklyRegistrations: parseInt(counts.weekly),
        monthlyRegistrations: parseInt(counts.monthly),
        conversionRate: parseFloat(conversion.conversion_rate),
        averageCompletionTime: Math.round(avgTime),
        dropOffPoints: dropOffData.rows.map(row => ({
          step: row.step,
          count: parseInt(row.count),
          percentage: parseInt(row.percentage)
        })),
        sourceBreakdown: sourceData.rows.reduce((acc, row) => {
          const visits = parseInt(row.visits);
          const registrations = parseInt(row.registrations);
          acc[row.source] = {
            visits,
            registrations,
            conversionRate: visits > 0 ? registrations / visits : 0
          };
          return acc;
        }, {})
      };
 catch (error) {
      console.error('Failed to get registration metrics:', error);
      throw error;



  async getFormAnalytics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<FormAnalytics> {

    const timeframes = {
      day: '1 day',
      week: '1 week',
      month: '1 month'
    };

    try {
      // Get field interaction times
      const fieldTimes = await this.db.query(`
        SELECT 
          field_name,
          AVG(time_spent_ms) as avg_time_ms
        FROM form_field_analytics
        WHERE event_type = 'blur' 
          AND time_spent_ms IS NOT NULL
          AND created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
        GROUP BY field_name
      `);

      // Get field error rates
      const fieldErrors = await this.db.query(`
        WITH field_stats AS (
          SELECT 
            field_name,
            COUNT(*) as total_interactions,
            COUNT(*) FILTER (WHERE event_type = 'error') as error_count
          FROM form_field_analytics
          WHERE created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
          GROUP BY field_name

        SELECT 
          field_name,
          CASE WHEN total_interactions > 0 
            THEN error_count::DECIMAL / total_interactions 
            ELSE 0 
          END as error_rate
        FROM field_stats
      `);

      // Get step completion rates
      const stepCompletion = await this.db.query(`
        WITH step_progression AS (
          SELECT 
            session_id,
            MAX(CASE WHEN step = 'form_step_1' THEN 1 ELSE 0 END) as reached_step_1,
            MAX(CASE WHEN step = 'form_step_2' THEN 1 ELSE 0 END) as reached_step_2,
            MAX(CASE WHEN step = 'form_step_3' THEN 1 ELSE 0 END) as reached_step_3,
            MAX(CASE WHEN step = 'completed' THEN 1 ELSE 0 END) as completed
          FROM registration_funnel
          WHERE created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
          GROUP BY session_id

        SELECT 
          1 as step_number,
          AVG(reached_step_1::INTEGER) as completion_rate
        FROM step_progression
        UNION ALL
        SELECT 
          2 as step_number,
          CASE WHEN SUM(reached_step_1) > 0 
            THEN AVG(reached_step_2::INTEGER) 
            ELSE 0 
          END as completion_rate
        FROM step_progression
        WHERE reached_step_1 = 1
        UNION ALL
        SELECT 
          3 as step_number,
          CASE WHEN SUM(reached_step_2) > 0 
            THEN AVG(reached_step_3::INTEGER) 
            ELSE 0 
          END as completion_rate
        FROM step_progression
        WHERE reached_step_2 = 1
        ORDER BY step_number
      `);

      // Combine data for most problematic fields
      const fieldTimeMap = fieldTimes.rows.reduce((acc, row) => {
        acc[row.field_name] = parseFloat(row.avg_time_ms) || 0;
        return acc;
      }, {});

      const fieldErrorMap = fieldErrors.rows.reduce((acc, row) => {
        acc[row.field_name] = parseFloat(row.error_rate) || 0;
        return acc;
      }, {});

      const mostProblematicFields = Object.keys({ ...fieldTimeMap, ...fieldErrorMap })
        .map(field => ({
          field,
          errorRate: fieldErrorMap[field] || 0,
          averageTime: fieldTimeMap[field] || 0
        }))
        .filter(item => item.errorRate > 0.1 || item.averageTime > 10000) // High error rate or >10s
        .sort((a, b) => b.errorRate - a.errorRate)
        .slice(0, 10);

      return {
        fieldInteractionTime: fieldTimeMap,
        fieldErrorRate: fieldErrorMap,
        mostProblematicFields,
        stepCompletionRates: stepCompletion.rows.reduce((acc, row) => {
          acc[row.step_number] = parseFloat(row.completion_rate);
          return acc;
        }, {})
      };
 catch (error) {
      console.error('Failed to get form analytics:', error);
      throw error;



  async getABTestResults(experimentName: string): Promise<{
    variants: Array<{
      variant: string;
      participants: number;
      conversions: number;
      conversionRate: number;
>;
    winner?: string;
    confidence?: number;
> {
    try {
      const results = await this.db.query(`
        SELECT 
          variant,
          COUNT(*) as participants,
          COUNT(*) FILTER (WHERE converted = true) as conversions,
          AVG(CASE WHEN converted THEN 1.0 ELSE 0.0 END) as conversion_rate
        FROM registration_experiments
        WHERE experiment_name = $1
        GROUP BY variant
        ORDER BY conversion_rate DESC
      `, [experimentName]);

      const variants = results.rows.map(row => ({
        variant: row.variant,
        participants: parseInt(row.participants),
        conversions: parseInt(row.conversions),
        conversionRate: parseFloat(row.conversion_rate)
      }));

      // Simple statistical significance calculation (would need more sophisticated analysis in production)
      let winner: string | undefined;
      let confidence: number | undefined;

      if (variants.length >= 2) {
        const [best, second] = variants;
        if (best.participants >= 100 && second.participants >= 100) {
          // Simplified z-test
          const p1 = best.conversionRate;
          const p2 = second.conversionRate;
          const n1 = best.participants;
          const n2 = second.participants;
          
          const pooledP = (best.conversions + second.conversions) / (n1 + n2);
          const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
          const z = Math.abs(p1 - p2) / se;
          
          // Approximate confidence level
          confidence = Math.min(99.9, Math.max(0, (1 - 2 * (1 - normalCDF(z))) * 100));
          
          if (confidence > 95) {
            winner = best.variant;




      return {
        variants,
        winner,
        confidence
      };
 catch (error) {
      console.error('Failed to get A/B test results:', error);
      throw error;



  async trackEmailDelivery(
    userId: string | null,
    emailType: string,
    emailAddress: string,
    status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed',
    metadata?: any
  ): Promise<void> {

    try {
      await this.db.query(`
        INSERT INTO email_deliveries (
          user_id, email_type, email_address, status, metadata
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, email_type, email_address) 
        DO UPDATE SET 
          status = EXCLUDED.status,
          metadata = EXCLUDED.metadata,
          ${status}_at = NOW()
      `, [
        userId,
        emailType,
        emailAddress,
        status,
        JSON.stringify(metadata || {})
      ]);
 catch (error) {
      console.error('Failed to track email delivery:', error);



  async getEmailDeliveryStats(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
    deliveryRates: Record<string, number>;
    openRates: Record<string, number>;
    clickRates: Record<string, number>;
    bounceRates: Record<string, number>;
> {
    const timeframes = {
      day: '1 day',
      week: '1 week',
      month: '1 month'
    };

    try {
      const stats = await this.db.query(`
        SELECT 
          email_type,
          COUNT(*) as total_sent,
          COUNT(*) FILTER (WHERE status IN ('delivered', 'opened', 'clicked')) as delivered,
          COUNT(*) FILTER (WHERE status IN ('opened', 'clicked')) as opened,
          COUNT(*) FILTER (WHERE status = 'clicked') as clicked,
          COUNT(*) FILTER (WHERE status = 'bounced') as bounced
        FROM email_deliveries
        WHERE sent_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
        GROUP BY email_type
      `);

      const deliveryRates: Record<string, number> = {};
      const openRates: Record<string, number> = {};
      const clickRates: Record<string, number> = {};
      const bounceRates: Record<string, number> = {};

      stats.rows.forEach(row => {
        const totalSent = parseInt(row.total_sent);
        const delivered = parseInt(row.delivered);
        const opened = parseInt(row.opened);
        const clicked = parseInt(row.clicked);
        const bounced = parseInt(row.bounced);

        deliveryRates[row.email_type] = totalSent > 0 ? delivered / totalSent : 0;
        openRates[row.email_type] = delivered > 0 ? opened / delivered : 0;
        clickRates[row.email_type] = opened > 0 ? clicked / opened : 0;
        bounceRates[row.email_type] = totalSent > 0 ? bounced / totalSent : 0;
      });

      return {
        deliveryRates,
        openRates,
        clickRates,
        bounceRates
      };
 catch (error) {
      console.error('Failed to get email delivery stats:', error);
      throw error;




// Helper function for normal CDF approximation
function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));


function erf(x: number): number {
  // Approximation of error function
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
