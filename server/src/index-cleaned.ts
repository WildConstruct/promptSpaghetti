// Cleaned server - removed all disabled services for production readiness
import Fastify, { FastifyRequest } from 'fastify';
import { z } from 'zod';
import { executeGraph, initializeAnalytics } from './engine-basic';
import { Graph, Node } from './exporter-standalone';
import {
  graphToBundle,
  bundleToGraph,
  exportGraph,
  validateBundleCompatibility,
  getExportStats,
  ExportFormat
} from './exporter-standalone';
import { validateGraph } from './graphValidator';
import { initDatabase, healthCheck } from './minimal-db';
// Initialize Fastify
const server = Fastify({ logger: false });

// Global analytics placeholder
let analyticsEnabled = false;

// Initialize core services
async function initializeServices() {
  try {
    // Initialize database
    const db = initDatabase();
    console.log('✅ Database initialized');

    // Initialize analytics (basic)
    initializeAnalytics();
    analyticsEnabled = true;
    console.log('✅ Analytics services initialized');

    return true;
  } catch (error) {
    console.error('❌ Service initialization failed:', error);
    return false;
  }
}

// Root endpoint
server.get('/', async (request, reply) => {
  return {
    status: 'PromptScape API - Production Ready',
    version: '1.0.0',
    engine: 'basic',
    features: [
      'graph-execution',
      'deterministic-seeding',
      'variable-context',
      'analytics-tracking',
      'health-monitoring'
    ],
    nodeTypes: [
      'WeightedChoice',
      'Output',
      'Concat',
      'SetVariable',
      'GetVariable',
      'Include'
    ]
  };
});

// Health check endpoint
server.get('/health', async (request, reply) => {
  try {
    const dbHealthy = healthCheck();
    const analyticsHealthy = analyticsEnabled;

    const status = dbHealthy && analyticsHealthy ? 'healthy' : 'degraded';

    return {
      status,
      services: {
        database: dbHealthy ? 'connected' : 'disconnected',
        analytics: analyticsHealthy ? 'active' : 'inactive',
        engine: 'basic'
      },
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  } catch (error) {
    return reply.code(500).send({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Graph execution endpoint
server.post('/preview', async (request, reply) => {
  try {
    const graph = request.body as Graph;

    // Validate graph structure
    const validation = validateGraph(graph);
    if (!validation.valid) {
      return reply.code(400).send({
        error: 'Invalid graph structure',
        details: validation.errors,
        timestamp: new Date().toISOString()
      });
    }

    // Execute graph with analytics tracking
    const sessionId = (request as any).session?.id || 'anonymous';
    const userId = (request as any).user?.id;

    const result = await executeGraph(graph, sessionId, userId);

    return {
      success: true,
      outputs: result.outputs,
      executionPath: result.executionPath,
      metadata: {
        nodeCount: graph.nodes?.length || 0,
        outputCount: result.outputs.length,
        seed: graph.seed,
        engine: 'basic',
        executionTime: result.executionPath?.executionTimeMs || 0,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Graph execution error:', error);

    // Track error in analytics (basic logging)
    if (analyticsEnabled) {
      console.log(`Analytics: Graph execution error - ${error.message}`);
    }

    return reply.code(500).send({
      success: false,
      error: 'Graph execution failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Advanced export endpoint with multiple formats
server.post('/export', async (request, reply) => {
  try {
    const body = request.body as {
      graph: Graph;
      format?: ExportFormat;
      metadata?: any;
    };

    const { graph, format = 'bundle', metadata } = body;

    // Basic validation
    const validation = validateGraph(graph);
    if (!validation.valid) {
      return reply.code(400).send({
        success: false,
        error: 'Invalid graph for export',
        details: validation.errors
      });
    }

    // Get export statistics
    const stats = getExportStats(graph);

    // Generate export
    const exportResult = exportGraph(graph, format, metadata);

    return {
      success: true,
      export: {
        data: exportResult.data,
        filename: exportResult.filename,
        mimeType: exportResult.mimeType,
        format,
        stats
      },
      metadata: {
        timestamp: new Date().toISOString(),
        nodeCount: stats.nodeCount,
        complexity: stats.complexity,
        estimatedOutputs: stats.estimatedOutputs
      }
    };
  } catch (error) {
    return reply.code(500).send({
      success: false,
      error: 'Export failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Import endpoint for bundles
server.post('/import', async (request, reply) => {
  try {
    const bundle = request.body;

    // Validate bundle compatibility
    const compatibility = validateBundleCompatibility(bundle);

    if (!compatibility.compatible) {
      return reply.code(400).send({
        success: false,
        error: 'Incompatible bundle',
        issues: compatibility.issues,
        warnings: compatibility.warnings
      });
    }

    // Convert bundle to graph
    const graph = bundleToGraph(bundle);

    // Validate resulting graph
    const validation = validateGraph(graph);
    if (!validation.valid) {
      return reply.code(400).send({
        success: false,
        error: 'Imported graph is invalid',
        details: validation.errors
      });
    }

    return {
      success: true,
      graph,
      compatibility: {
        warnings: compatibility.warnings,
        bundleFormat: (bundle as any).format,
        engineVersion: (bundle as any).compatibility?.engineVersion
      },
      metadata: {
        timestamp: new Date().toISOString(),
        importedNodes: graph.nodes?.length || 0
      }
    };
  } catch (error) {
    return reply.code(500).send({
      success: false,
      error: 'Import failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Analytics summary endpoint
server.get('/analytics/summary', async (request, reply) => {
  try {
    if (!analyticsEnabled) {
      return reply.code(503).send({
        error: 'Analytics service not available'
      });
    }

    // Basic analytics summary
    return {
      status: 'Analytics available',
      collector: analyticsEnabled ? 'active' : 'inactive',
      mode: 'basic',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return reply.code(500).send({
      error: 'Analytics summary failed',
      message: error.message
    });
  }
});

// Graceful shutdown
async function gracefulShutdown() {
  console.log('🛑 Graceful shutdown initiated...');
  try {
    await server.close();
    console.log('✅ Server closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const start = async () => {
  try {
    // Initialize services first
    const servicesReady = await initializeServices();
    if (!servicesReady) {
      console.error('❌ Failed to initialize core services');
      process.exit(1);
    }

    // Start server
    const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;
    await server.listen({ port, host: '0.0.0.0' });

    console.log(`🚀 PromptScape Server running on port ${port}`);
    console.log('✅ Production ready with core functionality');
    console.log('📊 Analytics tracking enabled');
    console.log(
      '🎯 Endpoints: /, /health, /preview, /export, /import, /analytics/summary'
    );
    console.log('🔧 Engine: Basic with deterministic execution');
  } catch (err) {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
  }
};

start();
