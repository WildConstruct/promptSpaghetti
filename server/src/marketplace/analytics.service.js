import {
  TimeRange,
  AggregationType,
  AnalyticsEventSchema,
  AnalyticsQuerySchema,
  CustomReportSchema,
 from './analytics.types';
export class AnalyticsService {
  db;
  constructor(db) {
    this.db = db;

  // Event Tracking
  async trackEvent(eventData) {
    const validatedData = AnalyticsEventSchema.parse(eventData);
    const [event] = await this.db.query(
      `INSERT INTO analytics_events 
       (template_id, user_id, event_type, event_data, metadata, timestamp, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [
        validatedData.template_id,
        validatedData.user_id,
        validatedData.event_type,
        JSON.stringify(validatedData.event_data),
        JSON.stringify(validatedData.metadata),
      ]
    );
    return this.mapEventRow(event);

  async batchTrackEvents(events) {
    const validatedEvents = events.map(event => AnalyticsEventSchema.parse(event));
    const values = validatedEvents
      .map((event, index) => {
        const offset = index * 5;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, NOW(), NOW())`;
      })
      .join(', ');
    const params = validatedEvents.flatMap(event => [
      event.template_id,
      event.user_id,
      event.event_type,
      JSON.stringify(event.event_data),
      JSON.stringify(event.metadata),
    ]);
    const results = await this.db.query(
      `INSERT INTO analytics_events 
       (template_id, user_id, event_type, event_data, metadata, timestamp, created_at)
       VALUES ${values}
       RETURNING *`,
      params
    );
    return results.map(this.mapEventRow);

  // Query Analytics Data
  async queryAnalytics(queryInput) {
    const query = AnalyticsQuerySchema.parse(queryInput);
    const { sql, params } = this.buildAnalyticsQuery(query);
    const results = await this.db.query(sql, params);
    return results;

  // Template Metrics
  async getTemplateMetrics(templateId, timeRange, startDate, endDate) {
    const { start, end } = this.getTimeRangeDates(timeRange, startDate, endDate);
    // Get basic metrics
    const [metricsRow] = await this.db.query(
      `SELECT 
         COUNT(CASE WHEN event_type = 'views' THEN 1 END) as views,
         COUNT(DISTINCT CASE WHEN event_type = 'views' THEN user_id END) as unique_views,
         COUNT(CASE WHEN event_type = 'downloads' THEN 1 END) as downloads,
         COUNT(CASE WHEN event_type = 'likes' THEN 1 END) as likes,
         AVG(CASE WHEN event_type = 'ratings' THEN (event_data->>'rating')::numeric END) as average_rating,
         COUNT(CASE WHEN event_type = 'ratings' THEN 1 END) as total_ratings,
         SUM(CASE WHEN event_type = 'revenue' THEN (event_data->>'amount')::numeric ELSE 0 END) as revenue,
         SUM(CASE WHEN event_type = 'usage_time' THEN (event_data->>'minutes')::numeric ELSE 0 END) as usage_minutes,
         COUNT(CASE WHEN event_type = 'error_rate' THEN 1 END) as error_count,
         CASE 
           WHEN COUNT(*) > 0 THEN 
             1.0 - (COUNT(CASE WHEN event_type = 'error_rate' THEN 1 END)::float / COUNT(*)::float)
           ELSE 1.0 
         END as success_rate
       FROM analytics_events 
       WHERE template_id = $1 AND timestamp BETWEEN $2 AND $3`,
      [templateId, start, end]
    );
    // Get demographics
    const demographics = await this.getTemplateDemographics(templateId, start, end);
    // Get trends
    const trends = await this.getTemplateTrends(templateId, start, end);
    return {
      template_id: templateId,
      period_start: start,
      period_end: end,
      metrics: {
        views: parseInt(metricsRow.views) || 0,
        unique_views: parseInt(metricsRow.unique_views) || 0,
        downloads: parseInt(metricsRow.downloads) || 0,
        likes: parseInt(metricsRow.likes) || 0,
        average_rating: parseFloat(metricsRow.average_rating) || 0,
        total_ratings: parseInt(metricsRow.total_ratings) || 0,
        revenue: parseFloat(metricsRow.revenue) || 0,
        usage_minutes: parseFloat(metricsRow.usage_minutes) || 0,
        error_count: parseInt(metricsRow.error_count) || 0,
        success_rate: parseFloat(metricsRow.success_rate) || 1.0,
        conversion_rate: this.calculateConversionRate(metricsRow),
      },
      demographics,
      trends,
    };

  // Creator Dashboard
  async getCreatorDashboard(creatorId, timeRange, startDate, endDate) {
    const { start, end } = this.getTimeRangeDates(timeRange, startDate, endDate);
    // Get creator templates
    const templates = await this.db.query('SELECT id FROM templates WHERE creator_id = $1', [creatorId]);
    const templateIds = templates.map(t => t.id);
    if (templateIds.length === 0) {
      return this.getEmptyCreatorDashboard(creatorId, timeRange, start, end);

    // Get overview metrics
    const overview = await this.getCreatorOverview(templateIds, start, end);
    // Get performance summary
    const performanceSummary = await this.getCreatorPerformance(templateIds, start, end);
    // Get traffic metrics
    const trafficMetrics = await this.getCreatorTraffic(templateIds, start, end);
    // Get financial metrics
    const financialMetrics = await this.getCreatorFinancials(templateIds, start, end);
    return {
      creator_id: creatorId,
      period: timeRange,
      period_start: start,
      period_end: end,
      overview,
      performance_summary: performanceSummary,
      traffic_metrics: trafficMetrics,
      financial_metrics: financialMetrics,
    };

  // Custom Reports
  async createCustomReport(creatorId, reportData) {
    const validatedData = CustomReportSchema.parse(reportData);
    const [report] = await this.db.query(
      `INSERT INTO custom_reports 
       (creator_id, name, description, configuration, is_scheduled, schedule, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [
        creatorId,
        validatedData.name,
        validatedData.description,
        JSON.stringify(validatedData.configuration),
        validatedData.is_scheduled,
        JSON.stringify(validatedData.schedule),
      ]
    );
    return this.mapReportRow(report);

  async getCustomReports(creatorId) {
    const reports = await this.db.query('SELECT * FROM custom_reports WHERE creator_id = $1 ORDER BY created_at DESC', [
      creatorId,
    ]);
    return reports.map(this.mapReportRow);

  async generateReport(reportId) {
    const [report] = await this.db.query('SELECT * FROM custom_reports WHERE id = $1', [reportId]);
    if (!report) {
      throw new Error('Report not found');

    const configuration = JSON.parse(report.configuration);
    const results = await this.queryAnalytics(configuration.query);
    return {
      report_id: reportId,
      generated_at: new Date(),
      data: results,
      configuration: configuration.visualization,
    };

  // Analytics Insights
  async generateInsights(creatorId, templateIds) {
    const insights = [];
    // Trend insights
    const trendInsights = await this.generateTrendInsights(creatorId, templateIds);
    insights.push(...trendInsights);
    // Anomaly detection
    const anomalyInsights = await this.detectAnomalies(creatorId, templateIds);
    insights.push(...anomalyInsights);
    // Opportunity insights
    const opportunityInsights = await this.findOpportunities(creatorId, templateIds);
    insights.push(...opportunityInsights);
    return insights;

  // Helper Methods
  buildAnalyticsQuery(query) {
    let sql = 'SELECT ';
    const params = [];
    let paramIndex = 1;
    // Select fields based on aggregation
    const metricSelects = query.metric_types.map(metric => {
      switch (query.aggregation) {
        case AggregationType.COUNT:
          return `COUNT(CASE WHEN event_type = '${metric}' THEN 1 END) as ${metric}_count`;
        case AggregationType.SUM:
          return `SUM(CASE WHEN event_type = '${metric}' THEN (event_data->>'value')::numeric ELSE 0 END) as ${metric}_sum`;
        case AggregationType.AVERAGE:
          return `AVG(CASE WHEN event_type = '${metric}' THEN (event_data->>'value')::numeric END) as ${metric}_avg`;
        case AggregationType.UNIQUE:
          return `COUNT(DISTINCT CASE WHEN event_type = '${metric}' THEN user_id END) as ${metric}_unique`;
        default:
          return `COUNT(CASE WHEN event_type = '${metric}' THEN 1 END) as ${metric}_count`;

    });
    sql += metricSelects.join(', ');
    // Group by fields
    if (query.group_by && query.group_by.length > 0) {
      sql += ', ' + query.group_by.join(', ');

    sql += ' FROM analytics_events WHERE 1=1';
    // Add filters
    if (query.creator_id) {
      sql += ` AND template_id IN (SELECT id FROM templates WHERE creator_id = $${paramIndex})`;
      params.push(query.creator_id);
      paramIndex++;

    if (query.template_ids && query.template_ids.length > 0) {
      sql += ` AND template_id = ANY($${paramIndex})`;
      params.push(query.template_ids);
      paramIndex++;

    // Time range
    const { start, end } = this.getTimeRangeDates(query.time_range, query.start_date, query.end_date);
    sql += ` AND timestamp BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
    params.push(start, end);
    paramIndex += 2;
    // Additional filters
    if (query.filters) {
      if (query.filters.countries && query.filters.countries.length > 0) {
        sql += ` AND metadata->>'location'->>'country' = ANY($${paramIndex})`;
        params.push(query.filters.countries);
        paramIndex++;

      if (query.filters.device_types && query.filters.device_types.length > 0) {
        sql += ` AND metadata->>'device_type' = ANY($${paramIndex})`;
        params.push(query.filters.device_types);
        paramIndex++;


    // Group by
    if (query.group_by && query.group_by.length > 0) {
      sql += ' GROUP BY ' + query.group_by.join(', ');

    // Sort
    if (query.sort) {
      sql += ` ORDER BY ${query.sort.field} ${query.sort.direction}`;

    // Limit and offset
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(query.limit || 100, query.offset || 0);
    return { sql, params };

  getTimeRangeDates(timeRange, startDate, endDate) {
    const end = endDate || new Date();
    let start;
    switch (timeRange) {
      case TimeRange.LAST_24H:
        start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
        break;
      case TimeRange.LAST_7D:
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case TimeRange.LAST_30D:
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case TimeRange.LAST_90D:
        start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case TimeRange.LAST_YEAR:
        start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case TimeRange.ALL_TIME:
        start = new Date('2020-01-01');
        break;
      case TimeRange.CUSTOM:
        start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    return { start, end };

  async getTemplateDemographics(templateId, start, end) {
    // Implementation for demographics data
    const [countriesData, devicesData] = await Promise.all([
      this.db.query(
        `SELECT metadata->>'location'->>'country' as country, COUNT(*) as count
         FROM analytics_events 
         WHERE template_id = $1 AND timestamp BETWEEN $2 AND $3
         AND metadata->>'location'->>'country' IS NOT NULL
         GROUP BY metadata->>'location'->>'country'
         ORDER BY count DESC LIMIT 10`,
        [templateId, start, end]
      ),
      this.db.query(
        `SELECT metadata->>'device_type' as device, COUNT(*) as count
         FROM analytics_events 
         WHERE template_id = $1 AND timestamp BETWEEN $2 AND $3
         AND metadata->>'device_type' IS NOT NULL
         GROUP BY metadata->>'device_type'
         ORDER BY count DESC`,
        [templateId, start, end]
      ),
    ]);
    const totalEvents = countriesData.reduce((sum, row) => sum + parseInt(row.count), 0);
    return {
      top_countries: countriesData.map(row => ({
        country: row.country,
        count: parseInt(row.count),
        percentage: totalEvents > 0 ? (parseInt(row.count) / totalEvents) * 100 : 0,
      })),
      device_breakdown: devicesData.map(row => ({
        device: row.device,
        count: parseInt(row.count),
        percentage: totalEvents > 0 ? (parseInt(row.count) / totalEvents) * 100 : 0,
      })),
      user_segments: [], // Placeholder for user segments
    };

  async getTemplateTrends(templateId, start, end) {
    const dailyMetrics = await this.db.query(
      `SELECT 
         DATE(timestamp) as date,
         COUNT(CASE WHEN event_type = 'views' THEN 1 END) as views,
         COUNT(CASE WHEN event_type = 'downloads' THEN 1 END) as downloads,
         SUM(CASE WHEN event_type = 'revenue' THEN (event_data->>'amount')::numeric ELSE 0 END) as revenue
       FROM analytics_events 
       WHERE template_id = $1 AND timestamp BETWEEN $2 AND $3
       GROUP BY DATE(timestamp)
       ORDER BY date`,
      [templateId, start, end]
    );
    return {
      daily_metrics: dailyMetrics.map(row => ({
        date: new Date(row.date),
        views: parseInt(row.views),
        downloads: parseInt(row.downloads),
        revenue: parseFloat(row.revenue) || 0,
      })),
      growth_rates: {
        views_growth: 0, // Calculate based on previous period
        downloads_growth: 0,
        revenue_growth: 0,
      },
    };

  calculateConversionRate(metricsRow) {
    const views = parseInt(metricsRow.views) || 0;
    const downloads = parseInt(metricsRow.downloads) || 0;
    return views > 0 ? (downloads / views) * 100 : 0;

  getEmptyCreatorDashboard(creatorId, timeRange, start, end) {
    return {
      creator_id: creatorId,
      period: timeRange,
      period_start: start,
      period_end: end,
      overview: {
        total_templates: 0,
        active_templates: 0,
        total_views: 0,
        total_downloads: 0,
        total_revenue: 0,
        average_rating: 0,
        top_performing_template: {
          id: '',
          title: '',
          views: 0,
          downloads: 0,
          revenue: 0,
        },
      },
      performance_summary: {
        views_trend: 0,
        downloads_trend: 0,
        revenue_trend: 0,
        rating_trend: 0,
        market_share: 0,
        ranking_position: 0,
      },
      traffic_metrics: {
        unique_visitors: 0,
        returning_visitors: 0,
        bounce_rate: 0,
        average_session_duration: 0,
        top_referrers: [],
      },
      financial_metrics: {
        gross_revenue: 0,
        net_revenue: 0,
        platform_fee: 0,
        payout_amount: 0,
        revenue_by_template: [],
      },
    };

  async getCreatorOverview(templateIds, start, end) {
    // Implementation placeholder
    return {
      total_templates: templateIds.length,
      active_templates: templateIds.length,
      total_views: 0,
      total_downloads: 0,
      total_revenue: 0,
      average_rating: 0,
      top_performing_template: {
        id: '',
        title: '',
        views: 0,
        downloads: 0,
        revenue: 0,
      },
    };

  async getCreatorPerformance(templateIds, start, end) {
    // Implementation placeholder
    return {
      views_trend: 0,
      downloads_trend: 0,
      revenue_trend: 0,
      rating_trend: 0,
      market_share: 0,
      ranking_position: 0,
    };

  async getCreatorTraffic(templateIds, start, end) {
    // Implementation placeholder
    return {
      unique_visitors: 0,
      returning_visitors: 0,
      bounce_rate: 0,
      average_session_duration: 0,
      top_referrers: [],
    };

  async getCreatorFinancials(templateIds, start, end) {
    // Implementation placeholder
    return {
      gross_revenue: 0,
      net_revenue: 0,
      platform_fee: 0,
      payout_amount: 0,
      revenue_by_template: [],
    };

  async generateTrendInsights(creatorId, templateIds) {
    // Implementation placeholder
    return [];

  async detectAnomalies(creatorId, templateIds) {
    // Implementation placeholder
    return [];

  async findOpportunities(creatorId, templateIds) {
    // Implementation placeholder
    return [];

  mapEventRow(row) {
    return {
      id: row.id,
      template_id: row.template_id,
      user_id: row.user_id,
      event_type: row.event_type,
      event_data: JSON.parse(row.event_data),
      metadata: JSON.parse(row.metadata),
      timestamp: new Date(row.timestamp),
      created_at: new Date(row.created_at),
    };

  mapReportRow(row) {
    return {
      id: row.id,
      creator_id: row.creator_id,
      name: row.name,
      description: row.description,
      configuration: JSON.parse(row.configuration),
      is_scheduled: row.is_scheduled,
      schedule: row.schedule ? JSON.parse(row.schedule) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };


