#!/usr/bin/env node

/**
 * Epic 13 Minimal Analytics API Test
 * Creates a standalone analytics API server to test Epic 13 functionality
 */

const Fastify = require('fastify');
const Database = require('better-sqlite3');

console.log('🚀 Epic 13 Minimal Analytics API Server');
console.log('=====================================\n');

async function createMinimalAnalyticsAPI() {
  const fastify = Fastify({ logger: true });
  
  // Initialize in-memory database for testing
  const db = new Database(':memory:');
  
  // Create basic analytics tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT UNIQUE,
      event_type TEXT,
      timestamp INTEGER,
      session_id TEXT,
      user_id INTEGER,
      organization_id INTEGER,
      metadata TEXT,
      category TEXT,
      severity TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    );
    
    CREATE TABLE IF NOT EXISTS analytics_summary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_events INTEGER DEFAULT 0,
      unique_users INTEGER DEFAULT 0,
      unique_sessions INTEGER DEFAULT 0,
      total_executions INTEGER DEFAULT 0,
      success_rate REAL DEFAULT 100.0,
      last_updated INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    );
    
    INSERT INTO analytics_summary (total_events, unique_users, unique_sessions, total_executions)
    VALUES (1247, 23, 156, 892);
  `);
  
  console.log('✅ Database initialized with test data');
  
  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    return { 
      status: 'healthy', 
      service: 'epic13-analytics-api',
      timestamp: Date.now(),
      database: 'connected'
    };
  });
  
  // Analytics summary endpoint
  fastify.get('/api/analytics/summary', async (request, reply) => {
    try {
      const summary = db.prepare('SELECT * FROM analytics_summary ORDER BY id DESC LIMIT 1').get();
      
      return {
        success: true,
        data: {
          totalEvents: summary.total_events,
          uniqueUsers: summary.unique_users,
          uniqueSessions: summary.unique_sessions,
          totalGraphExecutions: summary.total_executions,
          totalNodeExecutions: summary.total_executions * 4.2, // Estimated
          totalTokenUsage: summary.total_executions * 156,
          totalCost: summary.total_executions * 0.023,
          averageExecutionTime: 1847,
          successRate: summary.success_rate,
          topNodeTypes: [
            { type: 'WeightedChoice', count: 334, avgTime: 1205 },
            { type: 'Concat', count: 298, avgTime: 823 },
            { type: 'Output', count: 260, avgTime: 445 }
          ],
          providerUsage: [
            { provider: 'openai', tokens: 89234, cost: 12.45 },
            { provider: 'anthropic', tokens: 49872, cost: 8.23 }
          ],
          errorBreakdown: [
            { type: 'validation_error', count: 12 },
            { type: 'execution_timeout', count: 7 }
          ]
        },
        meta: {
          period: {
            startTime: Date.now() - (24 * 60 * 60 * 1000),
            endTime: Date.now()
          },
          generatedAt: Date.now()
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: 'Failed to retrieve analytics summary',
        details: error.message
      };
    }
  });
  
  // Dashboard data endpoint
  fastify.get('/api/analytics/dashboard', async (request, reply) => {
    return {
      success: true,
      data: {
        realTimeMetrics: {
          activeUsers: 8,
          activeSessions: 12,
          executionsPerMinute: 4.2,
          errorRate: 2.1
        },
        performanceMetrics: {
          avgResponseTime: 1847,
          p95ResponseTime: 3204,
          throughput: 156,
          memoryUsage: 67.3
        },
        costMetrics: {
          todaySpend: 23.45,
          monthlySpend: 789.23,
          budgetRemaining: 210.77,
          costPerExecution: 0.023
        },
        alerts: [
          {
            id: 'alert_001',
            type: 'performance',
            severity: 'warning',
            message: 'Response time increased by 15% in the last hour',
            timestamp: Date.now() - 3600000
          }
        ]
      }
    };
  });
  
  // Time series endpoint
  fastify.get('/api/analytics/timeseries/:metric', async (request, reply) => {
    const { metric } = request.params;
    const validMetrics = ['executions', 'tokens', 'cost', 'errors'];
    
    if (!validMetrics.includes(metric)) {
      reply.status(400);
      return { success: false, error: 'Invalid metric' };
    }
    
    // Generate mock time series data
    const dataPoints = [];
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = now - (i * hourMs);
      let value;
      
      switch (metric) {
        case 'executions':
          value = Math.floor(Math.random() * 50) + 20;
          break;
        case 'tokens':
          value = Math.floor(Math.random() * 5000) + 2000;
          break;
        case 'cost':
          value = (Math.random() * 2) + 0.5;
          break;
        case 'errors':
          value = Math.floor(Math.random() * 5);
          break;
      }
      
      dataPoints.push({ timestamp, value });
    }
    
    return {
      success: true,
      data: {
        metric,
        granularity: 'hour',
        dataPoints
      },
      meta: {
        totalDataPoints: dataPoints.length
      }
    };
  });
  
  // Cost summary endpoint
  fastify.get('/api/analytics/costs/summary', async (request, reply) => {
    return {
      success: true,
      data: {
        totalCost: 234.56,
        dailyAverage: 7.82,
        weeklyTrend: 12.3, // percentage
        topProviders: [
          { provider: 'openai', cost: 145.67, percentage: 62.1 },
          { provider: 'anthropic', cost: 88.89, percentage: 37.9 }
        ],
        costBreakdown: {
          compute: 156.78,
          storage: 34.12,
          bandwidth: 43.66
        }
      }
    };
  });
  
  // Budgets endpoint
  fastify.get('/api/analytics/budgets', async (request, reply) => {
    return {
      success: true,
      data: [
        {
          id: 'budget_001',
          name: 'Monthly AI Spend',
          amount: 1000,
          currency: 'USD',
          period: 'monthly',
          spent: 789.23,
          remaining: 210.77,
          alertThresholds: [75, 90],
          status: 'warning'
        },
        {
          id: 'budget_002', 
          name: 'Development Team',
          amount: 500,
          currency: 'USD',
          period: 'monthly',
          spent: 234.56,
          remaining: 265.44,
          alertThresholds: [75, 90],
          status: 'healthy'
        }
      ]
    };
  });
  
  // Alerts endpoint
  fastify.get('/api/analytics/alerts', async (request, reply) => {
    return {
      success: true,
      data: [
        {
          id: 'alert_001',
          type: 'budget',
          severity: 'warning',
          title: 'Budget threshold reached',
          message: 'Monthly AI Spend budget is at 78.9% (warning threshold: 75%)',
          timestamp: Date.now() - 1800000,
          acknowledged: false
        },
        {
          id: 'alert_002',
          type: 'performance',
          severity: 'info',
          title: 'High usage detected',
          message: 'Execution rate increased by 25% in the last 2 hours',
          timestamp: Date.now() - 7200000,
          acknowledged: true
        }
      ]
    };
  });
  
  // Usage patterns endpoint
  fastify.get('/api/analytics/patterns/:type', async (request, reply) => {
    const { type } = request.params;
    const validTypes = ['hourly', 'daily', 'weekly'];
    
    if (!validTypes.includes(type)) {
      reply.status(400);
      return { success: false, error: 'Invalid pattern type' };
    }
    
    // Generate mock pattern data
    const patterns = {
      hourly: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        usage: Math.floor(Math.random() * 100) + 20,
        peak: i >= 9 && i <= 17 // Business hours
      })),
      daily: Array.from({ length: 7 }, (_, i) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        usage: Math.floor(Math.random() * 200) + 50,
        isWeekend: i >= 5
      })),
      weekly: Array.from({ length: 12 }, (_, i) => ({
        week: i + 1,
        usage: Math.floor(Math.random() * 500) + 200,
        trend: Math.random() > 0.5 ? 'up' : 'down'
      }))
    };
    
    return {
      success: true,
      data: {
        type,
        patterns: patterns[type],
        insights: {
          peakUsage: type === 'hourly' ? '2-4 PM' : type === 'daily' ? 'Wednesday' : 'Week 8',
          averageUsage: patterns[type].reduce((sum, p) => sum + p.usage, 0) / patterns[type].length,
          recommendation: 'Consider scaling resources during peak hours'
        }
      }
    };
  });

  // Export endpoint
  fastify.get('/api/analytics/export', async (request, reply) => {
    const { format = 'json' } = request.query;
    
    const exportData = {
      exportId: `export_${Date.now()}`,
      generatedAt: Date.now(),
      period: {
        startTime: Date.now() - (7 * 24 * 60 * 60 * 1000),
        endTime: Date.now()
      },
      summary: {
        totalEvents: 1247,
        totalExecutions: 892,
        totalCost: 234.56
      },
      details: 'Full analytics export would contain detailed event data'
    };
    
    if (format === 'csv') {
      const csv = [
        'timestamp,event_type,cost,executions',
        `${Date.now()},summary,234.56,892`,
        `${Date.now() - 86400000},summary,227.34,856`
      ].join('\n');
      
      reply.type('text/csv');
      return csv;
    }
    
    return {
      success: true,
      data: exportData
    };
  });
  
  return fastify;
}

async function startServer() {
  try {
    const server = await createMinimalAnalyticsAPI();
    
    const port = process.env.PORT || 8001;
    await server.listen({ port, host: '0.0.0.0' });
    
    console.log(`🎉 Epic 13 Analytics API server running on port ${port}`);
    console.log('📊 Available endpoints:');
    console.log('  GET /health');
    console.log('  GET /api/analytics/summary');
    console.log('  GET /api/analytics/dashboard');
    console.log('  GET /api/analytics/timeseries/:metric');
    console.log('  GET /api/analytics/costs/summary');
    console.log('  GET /api/analytics/budgets');
    console.log('  GET /api/analytics/alerts');
    console.log('  GET /api/analytics/export?format=json|csv');
    console.log('');
    console.log('🧪 Test with:');
    console.log(`  curl http://localhost:${port}/health`);
    console.log(`  curl http://localhost:${port}/api/analytics/summary`);
    console.log('');
    console.log('✨ This demonstrates Epic 13 Analytics API functionality!');
    
  } catch (error) {
    console.error('❌ Failed to start Epic 13 analytics server:', error);
    process.exit(1);
  }
}

// Start server if run directly
if (require.main === module) {
  startServer();
}

module.exports = { createMinimalAnalyticsAPI };