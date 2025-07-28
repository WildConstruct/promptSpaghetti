/**
 * Security Scanning API Routes - Epic 18
 * 
 * RESTful API endpoints for security scanning, vulnerability management,
 * compliance reporting, and security metrics. Integrates with SecurityScanningService
 * to provide comprehensive security monitoring capabilities.
 * 
 * Task: E18-1753114562477-13BA6D - Add security scanning
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SecurityScanningService, DEFAULT_SECURITY_SCAN_CONFIG, SecurityScanConfig } from '../services/SecurityScanningService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { AnalyticsCollector } from '../analytics/AnalyticsCollector';

// =============================================================================
// Request/Response Schemas
// =============================================================================

const SecurityMetricsSchema = {
  type: 'object',
  properties: {
    timestamp: { type: 'string', format: 'date-time' },
    overallRiskScore: { type: 'number', minimum: 0, maximum: 100 },
    vulnerabilityTrend: { 
      type: 'array', 
      items: { type: 'number' }
  }
    meanTimeToFix: { type: 'number' },
    vulnerabilityDensity: { type: 'number' },
    packageSecurity: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        outdated: { type: 'number' },
        vulnerable: { type: 'number' },
        riskScore: { type: 'number' }
      }
  }
    codeSecurityScore: { type: 'number' },
    infrastructureScore: { type: 'number' },
    complianceScore: { type: 'number' },
    securityDebt: { type: 'number' }
  }
};

const SecurityVulnerabilitySchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    type: { type: 'string', enum: ['dependency', 'code', 'infrastructure', 'configuration'] },
    severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'info'] },
    title: { type: 'string' },
    description: { type: 'string' },
    cve: { type: 'string' },
    cwe: { type: 'string' },
    package: { type: 'string' },
    version: { type: 'string' },
    file: { type: 'string' },
    line: { type: 'number' },
    column: { type: 'number' },
    recommendation: { type: 'string' },
    references: { type: 'array', items: { type: 'string' } },
    patchAvailable: { type: 'boolean' },
    firstDetected: { type: 'string', format: 'date-time' },
    lastSeen: { type: 'string', format: 'date-time' },
    status: { type: 'string', enum: ['open', 'acknowledged', 'fixed', 'false_positive', 'risk_accepted'] },
    assignee: { type: 'string' },
    dueDate: { type: 'string', format: 'date-time' },
    metadata: { type: 'object' }
  }
};

const SecurityScanRequestSchema = {
  type: 'object',
  properties: {
    scanType: { 
      type: 'string', 
      enum: ['dependency', 'static', 'dynamic', 'infrastructure', 'compliance', 'comprehensive'] 
  }
    options: { type: 'object' }
  }
  required: ['scanType']
};

const VulnerabilityUpdateSchema = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['open', 'acknowledged', 'fixed', 'false_positive', 'risk_accepted'] },
    assignee: { type: 'string' },
    dueDate: { type: 'string', format: 'date-time' }
  }
  required: ['status']
};

// =============================================================================
// Security Scanning API Routes
// =============================================================================

export async function securityRoutes(fastify: FastifyInstance) {
  // Initialize services
  let securityScanningService: SecurityScanningService;
  
  try {
    const databaseService = new DatabaseService({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'promptscape',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password'
    });
    
    const redisService = new RedisService({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0')
    });
    
    const auditService = new AuditService(databaseService);
    const analyticsCollector = new AnalyticsCollector(databaseService, redisService);
    
    // Load security scan configuration
    const securityConfig: SecurityScanConfig = {
      ...DEFAULT_SECURITY_SCAN_CONFIG,
      integrations: {
        snyk: {
          enabled: !!process.env.SNYK_API_KEY,
          apiKey: process.env.SNYK_API_KEY
  }
        sonarqube: {
          enabled: !!process.env.SONARQUBE_URL,
          serverUrl: process.env.SONARQUBE_URL,
          token: process.env.SONARQUBE_TOKEN
  }
        owaspZap: {
          enabled: !!process.env.OWASP_ZAP_API_KEY,
          apiKey: process.env.OWASP_ZAP_API_KEY
        }
  }
      notifications: {
        email: process.env.SECURITY_ALERT_EMAILS ? process.env.SECURITY_ALERT_EMAILS.split(',') : [],
        webhook: process.env.SECURITY_WEBHOOK_URL,
        slackChannel: process.env.SECURITY_SLACK_CHANNEL
      }
    };
    
    securityScanningService = new SecurityScanningService(
      securityConfig,
      databaseService,
      redisService,
      auditService,
      analyticsCollector
    );
    
    // Start the service
    await securityScanningService.start();
    
    // Setup event listeners
    securityScanningService.on('scanCompleted', (result) => {
      fastify.log.info(`Security scan completed: ${result.scanId} (${result.scanType})`);
      
      if (result.summary.critical > 0 || result.summary.high > 5) {
        fastify.log.warn(`High-risk vulnerabilities detected in scan ${result.scanId}`);
      }
    });
    
    securityScanningService.on('thresholdBreach', (alert) => {
      fastify.log.error(`Security threshold breach detected: ${JSON.stringify(alert)}`);
    });
    
  } catch (error) {
    fastify.log.error('Failed to initialize Security Scanning Service:', error);
    // Continue without the service - routes will return appropriate errors
  }
  
  // =============================================================================
  // GET /api/security/metrics - Get current security metrics
  // =============================================================================
  
  fastify.get('/metrics', {
    schema: {
      description: 'Get current comprehensive security metrics',
      tags: ['Security'],
      response: {
        200: SecurityMetricsSchema,
        503: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!securityScanningService) {
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Security Scanning Service is not available'
        });
      }
      
      const metrics = await securityScanningService.getCurrentMetrics();
      
      if (!metrics) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'No security metrics available. Run a scan first.'
        });
      }
      
      return reply.send(metrics);
      
    } catch (error) {
      fastify.log.error('Error fetching security metrics:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch security metrics'
      });
    }
  });
  
  // =============================================================================
  // POST /api/security/scan - Start a security scan
  // =============================================================================
  
  fastify.post<{
    Body: {
      scanType: 'dependency' | 'static' | 'dynamic' | 'infrastructure' | 'compliance' | 'comprehensive';
      options?: any;
    }
  }>('/scan', {
    schema: {
      description: 'Start a security scan',
      tags: ['Security'],
      body: SecurityScanRequestSchema,
      response: {
        202: {
          type: 'object',
          properties: {
            scanId: { type: 'string' },
            scanType: { type: 'string' },
            status: { type: 'string' },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
  }
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      if (!securityScanningService) {
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Security Scanning Service is not available'
        });
      }
      
      const { scanType, options = {} } = request.body;
      
      // Validate scan type
      const validScanTypes = ['dependency', 'static', 'dynamic', 'infrastructure', 'compliance', 'comprehensive'];
      if (!validScanTypes.includes(scanType)) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: `Invalid scan type. Must be one of: ${validScanTypes.join(', ')}`
        });
      }
      
      const scanId = await securityScanningService.queueScan(scanType, options);
      
      return reply.status(202).send({
        scanId,
        scanType,
        status: 'queued',
        message: 'Security scan queued successfully',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      fastify.log.error('Error starting security scan:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to start security scan'
      });
    }
  });
  
  // =============================================================================
  // GET /api/security/scans - Get scan history
  // =============================================================================
  
  fastify.get<{
    Querystring: {
      limit?: number;
      scanType?: string;
    }
  }>('/scans', {
    schema: {
      description: 'Get security scan history',
      tags: ['Security'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 100 },
          scanType: { type: 'string' }
        }
  }
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              scanId: { type: 'string' },
              scanType: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              duration: { type: 'number' },
              status: { type: 'string' },
              summary: {
                type: 'object',
                properties: {
                  totalVulnerabilities: { type: 'number' },
                  critical: { type: 'number' },
                  high: { type: 'number' },
                  medium: { type: 'number' },
                  low: { type: 'number' },
                  info: { type: 'number' },
                  riskScore: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      if (!securityScanningService) {
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Security Scanning Service is not available'
        });
      }
      
      const { limit = 10, scanType } = request.query;
      
      let scans = await securityScanningService.getScanHistory(limit);
      
      // Filter by scan type if provided
      if (scanType) {
        scans = scans.filter(scan => scan.scanType === scanType);
      }
      
      // Return summary view without full vulnerability details
      const scanSummaries = scans.map(scan => ({
        scanId: scan.scanId,
        scanType: scan.scanType,
        timestamp: scan.timestamp,
        duration: scan.duration,
        status: scan.status,
        summary: scan.summary
      }));
      
      return reply.send(scanSummaries);
      
    } catch (error) {
      fastify.log.error('Error fetching scan history:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch scan history'
      });
    }
  });
  
  // =============================================================================
  // GET /api/security/scans/:scanId - Get specific scan result
  // =============================================================================
  
  fastify.get<{
    Params: { scanId: string }
  }>('/scans/:scanId', {
    schema: {
      description: 'Get detailed scan result',
      tags: ['Security'],
      params: {
        type: 'object',
        properties: {
          scanId: { type: 'string' }
  }
        required: ['scanId']
      }
    }
  }, async (request, reply) => {
    try {
      if (!securityScanningService) {
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Security Scanning Service is not available'
        });
      }
      
      const { scanId } = request.params;
      
      const scans = await securityScanningService.getScanHistory(100);
      const scan = scans.find(s => s.scanId === scanId);
      
      if (!scan) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Scan not found'
        });
      }
      
      return reply.send(scan);
      
    } catch (error) {
      fastify.log.error('Error fetching scan result:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch scan result'
      });
    }
  });
  
  // =============================================================================
  // GET /api/security/vulnerabilities - Get vulnerabilities
  // =============================================================================
  
  fastify.get<{
    Querystring: {
      status?: 'open' | 'acknowledged' | 'fixed' | 'false_positive' | 'risk_accepted';
      severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
      type?: 'dependency' | 'code' | 'infrastructure' | 'configuration';
      limit?: number;
    }
  }>('/vulnerabilities', {
    schema: {
      description: 'Get security vulnerabilities with optional filtering',
      tags: ['Security'],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['open', 'acknowledged', 'fixed', 'false_positive', 'risk_accepted'] },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'info'] },
          type: { type: 'string', enum: ['dependency', 'code', 'infrastructure', 'configuration'] },
          limit: { type: 'number', minimum: 1, maximum: 1000 }
        }
  }
      response: {
        200: {
          type: 'array',
          items: SecurityVulnerabilitySchema
        }
      }
    }
  }, async (request, reply) => {
    try {
      if (!securityScanningService) {
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Security Scanning Service is not available'
        });
      }
      
      const { status, severity, type, limit = 100 } = request.query;
      
      let vulnerabilities = await securityScanningService.getVulnerabilities(status);
      
      // Apply filters
      if (severity) {
        vulnerabilities = vulnerabilities.filter(vuln => vuln.severity === severity);
      }
      
      if (type) {
        vulnerabilities = vulnerabilities.filter(vuln => vuln.type === type);
      }
      
      // Apply limit
      vulnerabilities = vulnerabilities.slice(0, limit);
      
      return reply.send(vulnerabilities);
      
    } catch (error) {
      fastify.log.error('Error fetching vulnerabilities:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch vulnerabilities'
      });
    }
  });
  
  // =============================================================================
  // PATCH /api/security/vulnerabilities/:id - Update vulnerability status
  // =============================================================================
  
  fastify.patch<{
    Params: { id: string };
    Body: {
      status: string;
      assignee?: string;
      dueDate?: string;
    };
  }>('/vulnerabilities/:id', {
    schema: {
      description: 'Update vulnerability status',
      tags: ['Security'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
  }
        required: ['id']
  }
      body: VulnerabilityUpdateSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
  }
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      if (!securityScanningService) {
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Security Scanning Service is not available'
        });
      }
      
      const { id } = request.params;
      const { status, assignee, dueDate } = request.body;
      
      await securityScanningService.updateVulnerabilityStatus(id, status, assignee);
      
      return reply.send({
        success: true,
        message: 'Vulnerability status updated successfully'
      });
      
    } catch (error) {
      fastify.log.error('Error updating vulnerability:', error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Vulnerability not found'
        });
      }
      
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update vulnerability status'
      });
    }
  });
  
  // =============================================================================
  // GET /api/security/recommendations - Get security recommendations
  // =============================================================================
  
  fastify.get<{
    Querystring: {
      category?: string;
      priority?: 'critical' | 'high' | 'medium' | 'low';
      status?: string;
      limit?: number;
    }
  }>('/recommendations', {
    schema: {
      description: 'Get security improvement recommendations',
      tags: ['Security'],
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          status: { type: 'string' },
          limit: { type: 'number', minimum: 1, maximum: 100 }
        }
  }
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              category: { type: 'string' },
              priority: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              impact: { type: 'string' },
              effort: { type: 'string' },
              actions: { type: 'array' },
              relatedVulnerabilities: { type: 'array' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      if (!securityScanningService) {
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Security Scanning Service is not available'
        });
      }
      
      const { category, priority, status, limit = 50 } = request.query;
      
      let recommendations = await securityScanningService.getRecommendations(status);
      
      // Apply filters
      if (category) {
        recommendations = recommendations.filter(rec => rec.category === category);
      }
      
      if (priority) {
        recommendations = recommendations.filter(rec => rec.priority === priority);
      }
      
      // Apply limit
      recommendations = recommendations.slice(0, limit);
      
      return reply.send(recommendations);
      
    } catch (error) {
      fastify.log.error('Error fetching recommendations:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch recommendations'
      });
    }
  });
  
  // =============================================================================
  // GET /api/security/compliance - Get compliance status
  // =============================================================================
  
  fastify.get<{
    Querystring: {
      framework?: 'OWASP' | 'PCI-DSS' | 'SOC2' | 'GDPR' | 'HIPAA' | 'ISO27001';
      status?: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
    }
  }>('/compliance', {
    schema: {
      description: 'Get compliance status for various security frameworks',
      tags: ['Security'],
      querystring: {
        type: 'object',
        properties: {
          framework: { type: 'string', enum: ['OWASP', 'PCI-DSS', 'SOC2', 'GDPR', 'HIPAA', 'ISO27001'] },
          status: { type: 'string', enum: ['compliant', 'non_compliant', 'partial', 'not_applicable'] }
        }
  }
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              framework: { type: 'string' },
              category: { type: 'string' },
              requirement: { type: 'string' },
              status: { type: 'string' },
              severity: { type: 'string' },
              finding: { type: 'string' },
              recommendation: { type: 'string' },
              evidence: { type: 'string' },
              lastAssessed: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      if (!securityScanningService) {
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Security Scanning Service is not available'
        });
      }
      
      const { framework, status } = request.query;
      
      // Get latest compliance scan results
      const scans = await securityScanningService.getScanHistory(10);
      const complianceScans = scans.filter(scan => 
        scan.scanType === 'compliance' || scan.scanType === 'comprehensive'
      );
      
      if (complianceScans.length === 0) {
        return reply.send([]);
      }
      
      let compliance = complianceScans[0].compliance;
      
      // Apply filters
      if (framework) {
        compliance = compliance.filter(item => item.framework === framework);
      }
      
      if (status) {
        compliance = compliance.filter(item => item.status === status);
      }
      
      return reply.send(compliance);
      
    } catch (error) {
      fastify.log.error('Error fetching compliance data:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch compliance data'
      });
    }
  });
  
  // =============================================================================
  // GET /api/security/health - Health check for security service
  // =============================================================================
  
  fastify.get('/health', {
    schema: {
      description: 'Health check for Security Scanning Service',
      tags: ['Security'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            service: { type: 'string' },
            version: { type: 'string' },
            uptime: { type: 'number' },
            lastScan: { type: 'string', format: 'date-time' },
            enabledScanTypes: { type: 'array', items: { type: 'string' } },
            integrations: {
              type: 'object',
              properties: {
                snyk: { type: 'boolean' },
                sonarqube: { type: 'boolean' },
                owaspZap: { type: 'boolean' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const isAvailable = !!securityScanningService;
    let lastScan = null;
    let enabledScanTypes: string[] = [];
    let integrations = { snyk: false, sonarqube: false, owaspZap: false };
    
    if (securityScanningService) {
      try {
        const scans = await securityScanningService.getScanHistory(1);
        if (scans.length > 0) {
          lastScan = scans[0].timestamp.toISOString();
        }
        
        // Get enabled scan types from config
        enabledScanTypes = Object.entries(DEFAULT_SECURITY_SCAN_CONFIG.enabledScanTypes)
          .filter(([, enabled]) => enabled)
          .map(([type]) => type);
          
        // Get integration status
        integrations = {
          snyk: !!process.env.SNYK_API_KEY,
          sonarqube: !!process.env.SONARQUBE_URL,
          owaspZap: !!process.env.OWASP_ZAP_API_KEY
        };
      } catch (error) {
        // Handle gracefully
      }
    }
    
    const health = {
      status: isAvailable ? 'healthy' : 'unavailable',
      service: 'Security Scanning Service',
      version: '1.0.0',
      uptime: process.uptime(),
      lastScan,
      enabledScanTypes,
      integrations
    };
    
    return reply.send(health);
  });
  
  // =============================================================================
  // WebSocket for real-time security updates
  // =============================================================================
  
  fastify.register(async function(fastify) {
    fastify.get('/stream', { websocket: true }, (connection, request) => {
      fastify.log.info('Security WebSocket connection established');
      
      if (securityScanningService) {
        // Send current metrics
        securityScanningService.getCurrentMetrics().then(metrics => {
          if (metrics) {
            connection.socket.send(JSON.stringify({
              type: 'metrics',
              data: metrics
            }));
          }
        });
        
        // Listen for security events
        const handleScanCompleted = (result: any) => {
          connection.socket.send(JSON.stringify({
            type: 'scanCompleted',
            data: {
              scanId: result.scanId,
              scanType: result.scanType,
              summary: result.summary,
              timestamp: result.timestamp
            }
          }));
        };
        
        const handleThresholdBreach = (alert: any) => {
          connection.socket.send(JSON.stringify({
            type: 'alert',
            data: alert
          }));
        };
        
        const handleVulnerabilityUpdate = (update: any) => {
          connection.socket.send(JSON.stringify({
            type: 'vulnerabilityUpdate',
            data: update
          }));
        };
        
        securityScanningService.on('scanCompleted', handleScanCompleted);
        securityScanningService.on('thresholdBreach', handleThresholdBreach);
        securityScanningService.on('vulnerabilityUpdated', handleVulnerabilityUpdate);
        
        // Cleanup on disconnect
        connection.socket.on('close', () => {
          fastify.log.info('Security WebSocket connection closed');
          if (securityScanningService) {
            securityScanningService.off('scanCompleted', handleScanCompleted);
            securityScanningService.off('thresholdBreach', handleThresholdBreach);
            securityScanningService.off('vulnerabilityUpdated', handleVulnerabilityUpdate);
          }
        });
      }
    });
  });
  
  // Cleanup on server shutdown
  fastify.addHook('onClose', async () => {
    if (securityScanningService) {
      await securityScanningService.stop();
    }
  });
}

export default securityRoutes;