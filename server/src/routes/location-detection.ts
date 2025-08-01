// Location Detection API Routes
// REST API for geographic threat analysis and location monitoring

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { LocationDetectionService } from '../services/LocationDetectionService';



interface LocationDetectionRequest {
  ipAddress?: string;







interface AcknowledgeAlertRequest {
  acknowledgedBy: string;
  notes?: string;







interface LocationFilters {
  severity?: 'low' | 'medium' | 'high' | 'critical';
  acknowledged?: boolean;
  alertType?: string;
  limit?: number;
  offset?: number;





export async function locationDetectionRoutes(
  fastify: FastifyInstance,
  locationService: LocationDetectionService
) {
  // Detect location for current request
  fastify.post<{
    Body: LocationDetectionRequest;
>('/location/detect', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Body: LocationDetectionRequest;
>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;


      const ipAddress = request.body.ipAddress || request.ip;
      const location = await locationService.detectLocation(userId, ipAddress);
      const risk = await locationService.calculateLocationRisk(userId, location);

      return {
        location,
        risk,
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Location detection error:', error);
      reply.code(500).send({
        error: 'Failed to detect location',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Get user's location history
  fastify.get<{
    Querystring: { limit?: number };
>('/location/history', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Querystring: { limit?: number };
>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;


      const { limit = 50 } = request.query;
      const history = await locationService.getUserLocationHistory(userId, limit);

      return {
        history,
        count: history.length,
        limit,
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Location history error:', error);
      reply.code(500).send({
        error: 'Failed to retrieve location history',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Get location alerts for current user
  fastify.get<{
    Querystring: LocationFilters;
>('/location/alerts', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Querystring: LocationFilters;
>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;


      const { severity, acknowledged, alertType, limit = 100 } = request.query;
      const alerts = await locationService.getLocationAlerts(userId, severity, acknowledged, limit);

      return {
        alerts,
        count: alerts.length,
        filters: { severity, acknowledged, alertType },
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Location alerts error:', error);
      reply.code(500).send({
        error: 'Failed to retrieve location alerts',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Acknowledge a location alert
  fastify.post<{
    Params: { alertId: string };
    Body: AcknowledgeAlertRequest;
>('/location/alerts/:alertId/acknowledge', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Params: { alertId: string };
    Body: AcknowledgeAlertRequest;
>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;


      const { alertId } = request.params;
      const { acknowledgedBy } = request.body;

      await locationService.acknowledgeAlert(alertId, acknowledgedBy || userId);

      return {
        success: true,
        message: 'Alert acknowledged successfully',
        alertId,
        acknowledgedBy: acknowledgedBy || userId,
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Alert acknowledgment error:', error);
      reply.code(500).send({
        error: 'Failed to acknowledge alert',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Get all location alerts (admin/security roles)
  fastify.get<{
    Querystring: LocationFilters & { userId?: string };
>('/location/admin/alerts', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'ops'].includes(role))) {
        reply.code(403).send({ error: 'Admin or security role required' });
        return;

]
  }, async (request: FastifyRequest<{
    Querystring: LocationFilters & { userId?: string };
>, reply: FastifyReply) => {
    try {
      const { userId, severity, acknowledged, alertType, limit = 100 } = request.query;
      const alerts = await locationService.getLocationAlerts(userId, severity, acknowledged, limit);

      // Enhanced admin view with additional statistics
      const alertsByType = alerts.reduce((acc, alert) => {
        acc[alert.alertType] = (acc[alert.alertType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const alertsBySeverity = alerts.reduce((acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        alerts,
        statistics: {
          total: alerts.length,
          byType: alertsByType,
          bySeverity: alertsBySeverity,
          unacknowledged: alerts.filter(a => !a.acknowledged).length

        filters: { userId, severity, acknowledged, alertType, limit },
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Admin location alerts error:', error);
      reply.code(500).send({
        error: 'Failed to retrieve location alerts',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Get location statistics (admin/security roles)
  fastify.get<{
    Querystring: { timeframe?: 'day' | 'week' | 'month' };
>('/location/admin/statistics', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'ops'].includes(role))) {
        reply.code(403).send({ error: 'Admin or security role required' });
        return;

]
  }, async (request: FastifyRequest<{
    Querystring: { timeframe?: 'day' | 'week' | 'month' };
>, reply: FastifyReply) => {
    try {
      const { timeframe = 'week' } = request.query;
      const statistics = await locationService.getLocationStatistics(timeframe);

      return {
        statistics,
        timeframe,
        timestamp: new Date().toISOString(),
        description: 'Location detection system statistics'
      };
 catch (error) {
      request.log.error('Location statistics error:', error);
      reply.code(500).send({
        error: 'Failed to retrieve location statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Manual location analysis (admin only)
  fastify.post<{
    Body: {
      userId: string;
      ipAddress: string;
      forceRefresh?: boolean;
    };
>('/location/admin/analyze', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.includes('admin')) {
        reply.code(403).send({ error: 'Admin role required' });
        return;

]
  }, async (request: FastifyRequest<{
    Body: {
      userId: string;
      ipAddress: string;
      forceRefresh?: boolean;
    };
>, reply: FastifyReply) => {
    try {
      const { userId, ipAddress, forceRefresh } = request.body;

      if (!userId || !ipAddress) {
        reply.code(400).send({ error: 'User ID and IP address are required' });
        return;


      // Clear cache if force refresh is requested
      if (forceRefresh) {
        await (locationService as any).redis.del(`location:${ipAddress}`);


      const location = await locationService.detectLocation(userId, ipAddress);
      const risk = await locationService.calculateLocationRisk(userId, location);
      const history = await locationService.getUserLocationHistory(userId, 10);

      return {
        analysis: {
          location,
          risk,
          recentHistory: history

        metadata: {
          analyzedBy: (request.user as any)?.id,
          forceRefresh,
          analysisType: 'manual_admin_analysis'

        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Manual location analysis error:', error);
      reply.code(500).send({
        error: 'Failed to perform location analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Bulk acknowledge alerts (admin only)
  fastify.post<{
    Body: {
      alertIds: string[];
      acknowledgedBy: string;
      reason?: string;
    };
>('/location/admin/alerts/bulk-acknowledge', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.includes('admin')) {
        reply.code(403).send({ error: 'Admin role required' });
        return;

]
  }, async (request: FastifyRequest<{
    Body: {
      alertIds: string[];
      acknowledgedBy: string;
      reason?: string;
    };
>, reply: FastifyReply) => {
    try {
      const { alertIds, acknowledgedBy, reason } = request.body;

      if (!alertIds || alertIds.length === 0) {
        reply.code(400).send({ error: 'Alert IDs are required' });
        return;


      const results = [];
      for (const alertId of alertIds) {
        try {
          await locationService.acknowledgeAlert(alertId, acknowledgedBy);
          results.push({ alertId, status: 'acknowledged' });
 catch (error) {
          results.push({ 
            alertId, 
            status: 'failed', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });



      const successCount = results.filter(r => r.status === 'acknowledged').length;
      const failureCount = results.length - successCount;

      return {
        success: failureCount === 0,
        message: `${successCount} alerts acknowledged, ${failureCount} failed`,
        results,
        summary: {
          total: alertIds.length,
          successful: successCount,
          failed: failureCount

        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Bulk acknowledge error:', error);
      reply.code(500).send({
        error: 'Failed to bulk acknowledge alerts',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Location threat intelligence feed (admin only)
  fastify.get('/location/admin/threat-intel', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.includes('admin')) {
        reply.code(403).send({ error: 'Admin role required' });
        return;

]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get recent threat intelligence data
      const threatIntel = await (locationService as any).db.query(`
        SELECT 
          ip_address, threat_type, confidence, source, description,
          first_seen, last_seen, active
        FROM malicious_ips 
        WHERE active = true 
        ORDER BY last_seen DESC 
        LIMIT 1000
      `);

      const stats = await (locationService as any).db.query(`
        SELECT 
          threat_type,
          COUNT(*) as count,
          AVG(confidence) as avg_confidence
        FROM malicious_ips 
        WHERE active = true 
        GROUP BY threat_type
        ORDER BY count DESC
      `);

      return {
        threatIntelligence: threatIntel.rows,
        statistics: stats.rows,
        summary: {
          totalMaliciousIPs: threatIntel.rows.length,
          averageConfidence: stats.rows.length > 0 ? 
            Math.round(stats.rows.reduce((sum, row) => sum + parseFloat(row.avg_confidence), 0) / stats.rows.length) : 0

        lastUpdated: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Threat intelligence error:', error);
      reply.code(500).send({
        error: 'Failed to retrieve threat intelligence',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Health check for location detection service
  fastify.get('/location/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Test basic functionality
      const testIP = '8.8.8.8'; // Google DNS for testing
      const config = (locationService as any).config;

      // Test database connectivity
      const dbTest = await (locationService as any).db.query('SELECT 1 as test');
      const dbHealthy = dbTest.rows.length > 0;

      // Test Redis connectivity
      let redisHealthy = false;
      try {
        await (locationService as any).redis.ping();
        redisHealthy = true;
 catch (error) {
        redisHealthy = false;


      // Test geolocation provider (without making actual request)
      const providerConfigured = config.providers.primary && 
                                config.providers.apiKeys[config.providers.primary];

      return {
        status: dbHealthy && redisHealthy ? 'healthy' : 'degraded',
        checks: {
          database: dbHealthy ? 'ok' : 'failed',
          redis: redisHealthy ? 'ok' : 'failed',
          geolocationProvider: providerConfigured ? 'configured' : 'not_configured'

        configuration: {
          primaryProvider: config.providers.primary,
          fallbackProviders: config.providers.fallback?.length || 0,
          impossibleTravelEnabled: config.impossibleTravel.enabled,
          regionalRiskEnabled: config.regionalRisk.enabled,
          notificationsEnabled: config.notifications.enabled

        statistics: {
          cacheEnabled: config.cache.ipLocationTtl > 0,
          highRiskCountries: config.regionalRisk.highRiskCountries?.length || 0

        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Location detection health check failed:', error);
      reply.code(503).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

  });

  // Documentation endpoint
  fastify.get('/location/docs', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      title: 'Location Detection API Documentation',
      description: 'Geographic threat analysis and unusual location monitoring system',
      features: [
        'Real-time IP geolocation with multiple provider support',
        'Impossible travel detection and analysis',
        'Proxy/VPN/Tor detection',
        'Malicious IP identification',
        'Regional risk assessment',
        'Location history tracking',
        'Automated threat alerting',
        'Comprehensive audit logging'
      ],
      providers: [
        'IP-API (free tier supported)',
        'IPGeolocation.io',
        'IPStack',
        'MaxMind GeoIP2 (license required)'
      ],
      alertTypes: [
        {
          type: 'new_country',
          description: 'First access from a new country',
          severity: 'medium'

        {
          type: 'new_city',
          description: 'First access from a new city',
          severity: 'low'

        {
          type: 'impossible_travel',
          description: 'Physically impossible travel speed detected',
          severity: 'high'

        {
          type: 'proxy_detected',
          description: 'Access via proxy, VPN, or Tor network',
          severity: 'medium-high'

        {
          type: 'malicious_ip',
          description: 'Access from known malicious IP address',
          severity: 'critical'

        {
          type: 'high_risk_region',
          description: 'Access from high-risk geographical region',
          severity: 'medium'

      ],
      riskFactors: [
        'Geographic novelty (new countries/cities)',
        'Impossible travel patterns',
        'Proxy/anonymization service usage',
        'Malicious IP reputation',
        'Regional risk assessment',
        'Access frequency anomalies'
      ],
      endpoints: [
        {
          path: '/location/detect',
          method: 'POST',
          description: 'Detect and analyze location for current request',
          auth: 'required'

        {
          path: '/location/history',
          method: 'GET',
          description: 'Get user location access history',
          auth: 'required'

        {
          path: '/location/alerts',
          method: 'GET',
          description: 'Get location-based security alerts',
          auth: 'required'

        {
          path: '/location/alerts/:id/acknowledge',
          method: 'POST',
          description: 'Acknowledge a location alert',
          auth: 'required'

        {
          path: '/location/admin/alerts',
          method: 'GET',
          description: 'Get all location alerts (admin view)',
          auth: 'admin required'

        {
          path: '/location/admin/statistics',
          method: 'GET',
          description: 'Get location detection statistics',
          auth: 'security role required'

        {
          path: '/location/admin/analyze',
          method: 'POST',
          description: 'Manual location analysis',
          auth: 'admin required'

      ],
      integrations: {
        auditSystem: 'Logs all location events and alerts',
        threatIntelligence: 'Integrates with malicious IP databases',
        riskAssessment: 'Provides location risk scoring',
        alerting: 'Real-time notifications for suspicious locations'

    };
  });
