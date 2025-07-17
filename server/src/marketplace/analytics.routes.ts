import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsEventSchema,
  AnalyticsQuerySchema,
  CustomReportSchema,
  TimeRange,
} from './analytics.types';

// Request/Response schemas
const TrackEventRequest = AnalyticsEventSchema;

const BatchTrackEventsRequest = z.object({
  events: z.array(AnalyticsEventSchema).min(1).max(100),
});

const DashboardQueryParams = z.object({
  time_range: z.nativeEnum(TimeRange),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
});

const MetricsQueryParams = DashboardQueryParams;

const InsightsQueryParams = z.object({
  template_ids: z.string().optional().transform(val => 
    val ? val.split(',').filter(Boolean) : undefined
  ),
});

const ExportRequest = z.object({
  query: AnalyticsQuerySchema,
  format: z.enum(['csv', 'xlsx', 'json']).default('csv'),
});

const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
  const analyticsService = new AnalyticsService(fastify.db);

  // Track single analytics event
  fastify.post('/events', {
    schema: {
      body: TrackEventRequest,
      response: {
        200: z.object({
          success: z.boolean(),
          event_id: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    try {
      const eventData = request.body;
      const event = await analyticsService.trackEvent(eventData);
      
      reply.send({
        success: true,
        event_id: event.id,
      });
    } catch (error) {
      fastify.log.error('Failed to track analytics event:', error);
      reply.status(500).send({
        error: 'Failed to track analytics event',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Track multiple analytics events
  fastify.post('/events/batch', {
    schema: {
      body: BatchTrackEventsRequest,
      response: {
        200: z.object({
          success: z.boolean(),
          events_tracked: z.number(),
        }),
      },
    },
  }, async (request, reply) => {
    try {
      const { events } = request.body;
      const trackedEvents = await analyticsService.batchTrackEvents(events);
      
      reply.send({
        success: true,
        events_tracked: trackedEvents.length,
      });
    } catch (error) {
      fastify.log.error('Failed to batch track analytics events:', error);
      reply.status(500).send({
        error: 'Failed to batch track analytics events',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get creator dashboard
  fastify.get('/creators/:creatorId/dashboard', {
    schema: {
      params: z.object({
        creatorId: z.string().uuid(),
      }),
      querystring: DashboardQueryParams,
    },
  }, async (request, reply) => {
    try {
      const { creatorId } = request.params;
      const { time_range, start_date, end_date } = request.query;

      const dashboard = await analyticsService.getCreatorDashboard(
        creatorId,
        time_range,
        start_date,
        end_date
      );

      reply.send(dashboard);
    } catch (error) {
      fastify.log.error('Failed to fetch creator dashboard:', error);
      reply.status(500).send({
        error: 'Failed to fetch creator dashboard',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get template metrics
  fastify.get('/templates/:templateId/metrics', {
    schema: {
      params: z.object({
        templateId: z.string().uuid(),
      }),
      querystring: MetricsQueryParams,
    },
  }, async (request, reply) => {
    try {
      const { templateId } = request.params;
      const { time_range, start_date, end_date } = request.query;

      const metrics = await analyticsService.getTemplateMetrics(
        templateId,
        time_range,
        start_date,
        end_date
      );

      reply.send(metrics);
    } catch (error) {
      fastify.log.error('Failed to fetch template metrics:', error);
      reply.status(500).send({
        error: 'Failed to fetch template metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Query analytics data
  fastify.post('/query', {
    schema: {
      body: AnalyticsQuerySchema,
    },
  }, async (request, reply) => {
    try {
      const query = request.body;
      const results = await analyticsService.queryAnalytics(query);
      
      reply.send(results);
    } catch (error) {
      fastify.log.error('Failed to query analytics data:', error);
      reply.status(500).send({
        error: 'Failed to query analytics data',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Create custom report
  fastify.post('/reports', {
    schema: {
      body: CustomReportSchema,
    },
  }, async (request, reply) => {
    try {
      // Extract creator ID from auth context (placeholder)
      const creatorId = request.user?.id;
      if (!creatorId) {
        return reply.status(401).send({ error: 'Authentication required' });
      }

      const reportData = request.body;
      const report = await analyticsService.createCustomReport(creatorId, reportData);
      
      reply.status(201).send(report);
    } catch (error) {
      fastify.log.error('Failed to create custom report:', error);
      reply.status(500).send({
        error: 'Failed to create custom report',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get creator's custom reports
  fastify.get('/creators/:creatorId/reports', {
    schema: {
      params: z.object({
        creatorId: z.string().uuid(),
      }),
    },
  }, async (request, reply) => {
    try {
      const { creatorId } = request.params;
      const reports = await analyticsService.getCustomReports(creatorId);
      
      reply.send(reports);
    } catch (error) {
      fastify.log.error('Failed to fetch custom reports:', error);
      reply.status(500).send({
        error: 'Failed to fetch custom reports',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Generate report
  fastify.post('/reports/:reportId/generate', {
    schema: {
      params: z.object({
        reportId: z.string().uuid(),
      }),
    },
  }, async (request, reply) => {
    try {
      const { reportId } = request.params;
      const reportData = await analyticsService.generateReport(reportId);
      
      reply.send(reportData);
    } catch (error) {
      fastify.log.error('Failed to generate report:', error);
      reply.status(500).send({
        error: 'Failed to generate report',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Update custom report
  fastify.patch('/reports/:reportId', {
    schema: {
      params: z.object({
        reportId: z.string().uuid(),
      }),
      body: CustomReportSchema.partial(),
    },
  }, async (request, reply) => {
    try {
      const { reportId } = request.params;
      const updates = request.body;

      const [updatedReport] = await fastify.db.query(
        `UPDATE custom_reports 
         SET name = COALESCE($2, name),
             description = COALESCE($3, description),
             configuration = COALESCE($4, configuration),
             is_scheduled = COALESCE($5, is_scheduled),
             schedule = COALESCE($6, schedule),
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [
          reportId,
          updates.name,
          updates.description,
          updates.configuration ? JSON.stringify(updates.configuration) : null,
          updates.is_scheduled,
          updates.schedule ? JSON.stringify(updates.schedule) : null,
        ]
      );

      if (!updatedReport) {
        return reply.status(404).send({ error: 'Report not found' });
      }

      reply.send({
        ...updatedReport,
        configuration: JSON.parse(updatedReport.configuration),
        schedule: updatedReport.schedule ? JSON.parse(updatedReport.schedule) : undefined,
        created_at: new Date(updatedReport.created_at),
        updated_at: new Date(updatedReport.updated_at),
      });
    } catch (error) {
      fastify.log.error('Failed to update custom report:', error);
      reply.status(500).send({
        error: 'Failed to update custom report',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Delete custom report
  fastify.delete('/reports/:reportId', {
    schema: {
      params: z.object({
        reportId: z.string().uuid(),
      }),
    },
  }, async (request, reply) => {
    try {
      const { reportId } = request.params;

      const [deletedReport] = await fastify.db.query(
        'DELETE FROM custom_reports WHERE id = $1 RETURNING id',
        [reportId]
      );

      if (!deletedReport) {
        return reply.status(404).send({ error: 'Report not found' });
      }

      reply.send({ success: true });
    } catch (error) {
      fastify.log.error('Failed to delete custom report:', error);
      reply.status(500).send({
        error: 'Failed to delete custom report',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Generate insights
  fastify.get('/creators/:creatorId/insights', {
    schema: {
      params: z.object({
        creatorId: z.string().uuid(),
      }),
      querystring: InsightsQueryParams,
    },
  }, async (request, reply) => {
    try {
      const { creatorId } = request.params;
      const { template_ids } = request.query;

      const insights = await analyticsService.generateInsights(creatorId, template_ids);
      
      reply.send(insights);
    } catch (error) {
      fastify.log.error('Failed to generate insights:', error);
      reply.status(500).send({
        error: 'Failed to generate insights',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Dismiss insight
  fastify.post('/insights/:insightId/dismiss', {
    schema: {
      params: z.object({
        insightId: z.string().uuid(),
      }),
    },
  }, async (request, reply) => {
    try {
      const { insightId } = request.params;

      await fastify.db.query(
        'UPDATE analytics_insights SET is_dismissed = true WHERE id = $1',
        [insightId]
      );

      reply.send({ success: true });
    } catch (error) {
      fastify.log.error('Failed to dismiss insight:', error);
      reply.status(500).send({
        error: 'Failed to dismiss insight',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Export analytics data
  fastify.post('/export', {
    schema: {
      body: ExportRequest,
    },
  }, async (request, reply) => {
    try {
      const { query, format } = request.body;
      const results = await analyticsService.queryAnalytics(query);

      // Set appropriate headers based on format
      const filename = `analytics_export_${new Date().toISOString().split('T')[0]}`;
      
      switch (format) {
        case 'csv':
          reply.header('Content-Type', 'text/csv');
          reply.header('Content-Disposition', `attachment; filename="${filename}.csv"`);
          reply.send(convertToCSV(results));
          break;
          
        case 'xlsx':
          reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          reply.header('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
          // Note: Would need xlsx library for actual Excel export
          reply.send(JSON.stringify(results));
          break;
          
        case 'json':
        default:
          reply.header('Content-Type', 'application/json');
          reply.header('Content-Disposition', `attachment; filename="${filename}.json"`);
          reply.send(results);
          break;
      }
    } catch (error) {
      fastify.log.error('Failed to export analytics data:', error);
      reply.status(500).send({
        error: 'Failed to export analytics data',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Aggregate analytics data (maintenance endpoint)
  fastify.post('/aggregate', {
    schema: {
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    try {
      await fastify.db.query('SELECT aggregate_analytics_data()');
      
      reply.send({
        success: true,
        message: 'Analytics data aggregated successfully',
      });
    } catch (error) {
      fastify.log.error('Failed to aggregate analytics data:', error);
      reply.status(500).send({
        error: 'Failed to aggregate analytics data',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Generate insights (maintenance endpoint)
  fastify.post('/insights/generate', {
    schema: {
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    try {
      await fastify.db.query('SELECT generate_analytics_insights()');
      
      reply.send({
        success: true,
        message: 'Analytics insights generated successfully',
      });
    } catch (error) {
      fastify.log.error('Failed to generate analytics insights:', error);
      reply.status(500).send({
        error: 'Failed to generate analytics insights',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
};

// Helper function to convert JSON to CSV
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      }).join(',')
    )
  ].join('\n');

  return csvContent;
}

export default analyticsRoutes;