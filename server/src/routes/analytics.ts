import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AnalyticsDAO, AnalyticsFilters } from '../database/analytics-dao';
import { AnalyticsDashboard } from '../analytics/AnalyticsDashboard';
import { CostTracker } from '../analytics/CostTracker';
import { getDatabase } from '../database/connection';

// Validation schemas
const AnalyticsQuerySchema = z.object({
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  userId: z.number().optional(),
  organizationId: z.number().optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0)
});

const TimeRangeSchema = z.object({
  startTime: z.number(),
  endTime: z.number(),
  granularity: z.enum(['hour', 'day']).default('hour')
});

const BudgetCreateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  alertThresholds: z.array(z.number().min(0).max(100)).default([75, 90]),
  userId: z.number().optional(),
  organizationId: z.number().optional()
});

const BudgetUpdateSchema = BudgetCreateSchema.partial();

const ReportConfigSchema = z.object({
  startTime: z.number(),
  endTime: z.number(),
  format: z.enum(['json', 'csv', 'html', 'pdf']).default('json'),
  includeHeatMap: z.boolean().default(false),
  includeCostAnalysis: z.boolean().default(true),
  includePatterns: z.boolean().default(true)
});

/**
 * Analytics API routes
 */
export async function analyticsRoutes(
  fastify: FastifyInstance,
  analyticsDashboard: AnalyticsDashboard,
  costTracker: CostTracker
) {
  const analyticsDAO = new AnalyticsDAO(getDatabase());

  // Get analytics summary
  fastify.get<{
    Querystring: z.infer<typeof AnalyticsQuerySchema>;
  }>('/analytics/summary', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startTime: { type: 'number' },
          endTime: { type: 'number' },
          userId: { type: 'number' },
          organizationId: { type: 'number' },
          limit: { type: 'number', minimum: 1, maximum: 1000, default: 100 },
          offset: { type: 'number', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = AnalyticsQuerySchema.parse(request.query);
      
      const filters: AnalyticsFilters = {
        startTime: query.startTime || Date.now() - (24 * 60 * 60 * 1000), // Default: last 24 hours
        endTime: query.endTime || Date.now(),
        userId: query.userId,
        organizationId: query.organizationId,
        limit: query.limit,
        offset: query.offset
      };

      const summary = analyticsDAO.getAnalyticsSummary(filters);
      
      reply.send({
        success: true,
        data: summary,
        meta: {
          period: {
            startTime: filters.startTime,
            endTime: filters.endTime
  }
          generatedAt: Date.now()
        }
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve analytics summary',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get time series data
  fastify.get<{
    Querystring: z.infer<typeof TimeRangeSchema> & { metric: string };
  }>('/analytics/timeseries/:metric', {
    schema: {
      params: {
        type: 'object',
        properties: {
          metric: { type: 'string', enum: ['executions', 'tokens', 'cost', 'errors'] }
  }
        required: ['metric']
  }
      querystring: {
        type: 'object',
        properties: {
          startTime: { type: 'number' },
          endTime: { type: 'number' },
          granularity: { type: 'string', enum: ['hour', 'day'], default: 'hour' }
  }
        required: ['startTime', 'endTime']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { metric } = request.params as { metric: string };
      const query = TimeRangeSchema.parse(request.query);
      
      const filters: AnalyticsFilters = {
        startTime: query.startTime,
        endTime: query.endTime
      };

      const timeSeriesData = analyticsDAO.getTimeSeriesData(metric, query.granularity, filters);
      
      reply.send({
        success: true,
        data: {
          metric,
          granularity: query.granularity,
          dataPoints: timeSeriesData
  }
        meta: {
          period: {
            startTime: query.startTime,
            endTime: query.endTime
  }
          totalDataPoints: timeSeriesData.length
        }
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve time series data',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get heat map data
  fastify.get<{
    Querystring: z.infer<typeof TimeRangeSchema>;
  }>('/analytics/heatmap', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startTime: { type: 'number' },
          endTime: { type: 'number' }
  }
        required: ['startTime', 'endTime']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = TimeRangeSchema.parse(request.query);
      
      const heatMapData = analyticsDashboard.getHeatMapData(query.startTime, query.endTime);
      
      reply.send({
        success: true,
        data: heatMapData,
        meta: {
          period: {
            startTime: query.startTime,
            endTime: query.endTime
  }
          totalPoints: heatMapData.length
        }
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve heat map data',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get usage patterns
  fastify.get<{
    Params: { type: 'hourly' | 'daily' | 'weekly' };
  }>('/analytics/patterns/:type', {
    schema: {
      params: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['hourly', 'daily', 'weekly'] }
  }
        required: ['type']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { type } = request.params as { type: 'hourly' | 'daily' | 'weekly' };
      
      const patterns = analyticsDashboard.getUsagePatterns(type);
      
      reply.send({
        success: true,
        data: patterns
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve usage patterns',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get dashboard data
  fastify.get('/analytics/dashboard', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const dashboardData = analyticsDashboard.getAnalyticsDashboardData();
      
      reply.send({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve dashboard data',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get dashboard HTML
  fastify.get('/analytics/dashboard/html', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const dashboardHTML = analyticsDashboard.generateHTMLDashboard();
      
      reply.type('text/html').send(dashboardHTML);
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to generate dashboard HTML',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Cost tracking routes

  // Get cost summary
  fastify.get<{
    Querystring: z.infer<typeof TimeRangeSchema> & { userId?: number; organizationId?: number };
  }>('/analytics/costs/summary', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startTime: { type: 'number' },
          endTime: { type: 'number' },
          userId: { type: 'number' },
          organizationId: { type: 'number' }
  }
        required: ['startTime', 'endTime']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any;
      
      const costSummary = costTracker.getCostSummary(
        query.startTime,
        query.endTime,
        query.userId,
        query.organizationId
      );
      
      reply.send({
        success: true,
        data: costSummary
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve cost summary',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get cost forecast
  fastify.get<{
    Querystring: { days: number; userId?: number; organizationId?: number };
  }>('/analytics/costs/forecast', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          days: { type: 'number', minimum: 1, maximum: 365 },
          userId: { type: 'number' },
          organizationId: { type: 'number' }
  }
        required: ['days']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any;
      
      const forecast = costTracker.forecastCosts(
        query.days,
        query.userId,
        query.organizationId
      );
      
      reply.send({
        success: true,
        data: forecast
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to generate cost forecast',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Budget management routes

  // Create budget
  fastify.post<{
    Body: z.infer<typeof BudgetCreateSchema>;
  }>('/analytics/budgets', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'amount', 'period'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string' },
          amount: { type: 'number', minimum: 0.01 },
          currency: { type: 'string', minLength: 3, maxLength: 3, default: 'USD' },
          period: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'yearly'] },
          alertThresholds: { type: 'array', items: { type: 'number', minimum: 0, maximum: 100 } },
          userId: { type: 'number' },
          organizationId: { type: 'number' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const budgetConfig = BudgetCreateSchema.parse(request.body);
      
      const budget = costTracker.createBudget({
        ...budgetConfig,
        isActive: true,
        startDate: Date.now()
      });
      
      reply.status(201).send({
        success: true,
        data: budget
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to create budget',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get budgets
  fastify.get<{
    Querystring: { userId?: number; organizationId?: number };
  }>('/analytics/budgets', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          userId: { type: 'number' },
          organizationId: { type: 'number' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any;
      
      const budgets = costTracker.getBudgets(query.userId, query.organizationId);
      
      reply.send({
        success: true,
        data: budgets
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve budgets',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Update budget
  fastify.put<{
    Params: { budgetId: string };
    Body: z.infer<typeof BudgetUpdateSchema>;
  }>('/analytics/budgets/:budgetId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          budgetId: { type: 'string' }
  }
        required: ['budgetId']
  }
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string' },
          amount: { type: 'number', minimum: 0.01 },
          currency: { type: 'string', minLength: 3, maxLength: 3 },
          period: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'yearly'] },
          alertThresholds: { type: 'array', items: { type: 'number', minimum: 0, maximum: 100 } }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { budgetId } = request.params as { budgetId: string };
      const updates = BudgetUpdateSchema.parse(request.body);
      
      const updatedBudget = costTracker.updateBudget(budgetId, updates);
      
      if (!updatedBudget) {
        reply.status(404).send({
          success: false,
          error: 'Budget not found'
        });
        return;
      }
      
      reply.send({
        success: true,
        data: updatedBudget
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to update budget',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get budget usage
  fastify.get<{
    Params: { budgetId: string };
  }>('/analytics/budgets/:budgetId/usage', {
    schema: {
      params: {
        type: 'object',
        properties: {
          budgetId: { type: 'string' }
  }
        required: ['budgetId']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { budgetId } = request.params as { budgetId: string };
      
      const usage = costTracker.getBudgetUsage(budgetId);
      
      if (!usage) {
        reply.status(404).send({
          success: false,
          error: 'Budget usage not found'
        });
        return;
      }
      
      reply.send({
        success: true,
        data: usage
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve budget usage',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get active alerts
  fastify.get('/analytics/alerts', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const alerts = costTracker.getActiveAlerts();
      
      reply.send({
        success: true,
        data: alerts
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve alerts',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Acknowledge alert
  fastify.post<{
    Params: { alertId: string };
  }>('/analytics/alerts/:alertId/acknowledge', {
    schema: {
      params: {
        type: 'object',
        properties: {
          alertId: { type: 'string' }
  }
        required: ['alertId']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { alertId } = request.params as { alertId: string };
      
      const acknowledged = costTracker.acknowledgeAlert(alertId);
      
      if (!acknowledged) {
        reply.status(404).send({
          success: false,
          error: 'Alert not found'
        });
        return;
      }
      
      reply.send({
        success: true,
        message: 'Alert acknowledged'
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to acknowledge alert',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get efficiency recommendations
  fastify.get<{
    Querystring: { userId?: number; organizationId?: number };
  }>('/analytics/recommendations', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          userId: { type: 'number' },
          organizationId: { type: 'number' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any;
      
      const recommendations = costTracker.getEfficiencyRecommendations(
        query.userId,
        query.organizationId
      );
      
      reply.send({
        success: true,
        data: recommendations
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve recommendations',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Generate analytics report
  fastify.post<{
    Body: z.infer<typeof ReportConfigSchema>;
  }>('/analytics/reports', {
    schema: {
      body: {
        type: 'object',
        required: ['startTime', 'endTime'],
        properties: {
          startTime: { type: 'number' },
          endTime: { type: 'number' },
          format: { type: 'string', enum: ['json', 'csv', 'html', 'pdf'], default: 'json' },
          includeHeatMap: { type: 'boolean', default: false },
          includeCostAnalysis: { type: 'boolean', default: true },
          includePatterns: { type: 'boolean', default: true }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const config = ReportConfigSchema.parse(request.body);
      
      const report = analyticsDashboard.generateAnalyticsReport(
        config.startTime,
        config.endTime,
        config.format
      );
      
      const contentType = config.format === 'html' ? 'text/html' :
        config.format === 'csv' ? 'text/csv' :
          config.format === 'pdf' ? 'application/pdf' :
            'application/json';
      
      reply.type(contentType).send(report);
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to generate report',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Export analytics data
  fastify.get<{
    Querystring: z.infer<typeof TimeRangeSchema> & { format?: 'json' | 'csv' };
  }>('/analytics/export', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startTime: { type: 'number' },
          endTime: { type: 'number' },
          format: { type: 'string', enum: ['json', 'csv'], default: 'json' }
  }
        required: ['startTime', 'endTime']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any;
      
      const exportData = costTracker.exportCostData(
        query.startTime,
        query.endTime,
        query.format || 'json'
      );
      
      const contentType = query.format === 'csv' ? 'text/csv' : 'application/json';
      const filename = `analytics_export_${Date.now()}.${query.format || 'json'}`;
      
      reply
        .type(contentType)
        .header('Content-Disposition', `attachment; filename="${filename}"`)
        .send(exportData);
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to export analytics data',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
}