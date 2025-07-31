# API Monitoring Usage Examples

This document provides practical examples and usage guides for implementing and consuming monitoring features across the PromptScape application APIs.

## Table of Contents

1. [Financial Services API Monitoring](#financial-services-api-monitoring)
2. [Performance Metrics Collection](#performance-metrics-collection)
3. [Analytics Events Tracking](#analytics-events-tracking)
4. [WebSocket Monitoring](#websocket-monitoring)
5. [Security Event Monitoring](#security-event-monitoring)
6. [Health Check Implementation](#health-check-implementation)
7. [Custom Metrics Integration](#custom-metrics-integration)
8. [Monitoring Data Consumption](#monitoring-data-consumption)

## Financial Services API Monitoring

### Basic API Usage with Monitoring

```javascript
// Register financial data with automatic monitoring
const registerFinancialData = async () => {
  try {
    const response = await fetch('/api/financial-services/data/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        externalId: 'TXN-123456789',
        dataType: 'transaction',
        jurisdiction: 'US',
        ownerId: 'user-456',
        accountNumber: 'ACCT-789012',
        transactionId: 'TXN-123456789',
        amount: 1500.75,
        currency: 'USD',
        transactionDate: '2025-07-21T10:30:00.000Z',
        institutionName: 'Example Bank',
        retentionPeriodYears: 7,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('Financial data registered successfully:', result.data);
      // This automatically triggers audit logging and monitoring events
    } else {
      console.error('Registration failed:', result.error);
      // Error events are automatically tracked for monitoring
    }
  } catch (error) {
    console.error('API call failed:', error);
    // Network errors are tracked by the monitoring system
  }
};

// Execute deletion workflow with monitoring
const executeDeletionWorkflow = async workflowId => {
  try {
    const response = await fetch('/api/financial-services/deletion-workflows/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        workflowId: workflowId,
        overrides: {
          batchSize: 25,
          requireApproval: true,
        },
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('Deletion workflow executed:', {
        batchId: result.data.batchId,
        processed: result.data.recordsProcessed,
        deleted: result.data.recordsDeleted,
        failed: result.data.recordsFailed,
      });

      // Monitor execution results for compliance reporting
      if (result.data.recordsFailed > 0) {
        console.warn(`${result.data.recordsFailed} records failed deletion`);
      }
    }
  } catch (error) {
    console.error('Deletion workflow execution failed:', error);
  }
};
```

### Monitoring Deletion Workflow Performance

```javascript
// Custom monitoring wrapper for deletion workflows
class DeletionWorkflowMonitor {
  constructor(analyticsCollector) {
    this.analytics = analyticsCollector;
  }

  async executeWithMonitoring(workflowId, overrides = {}) {
    const startTime = performance.now();
    const operationId = `deletion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Record operation start
    this.analytics.recordEvent({
      id: operationId,
      type: 'financial_deletion_start',
      timestamp: Date.now(),
      sessionId: this.analytics.currentSessionId,
      metadata: {
        workflowId,
        overrides,
        operationId,
      },
    });

    try {
      const response = await fetch('/api/financial-services/deletion-workflows/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({ workflowId, overrides }),
      });

      const result = await response.json();
      const executionTime = performance.now() - startTime;

      // Record successful completion
      this.analytics.recordEvent({
        id: `${operationId}-complete`,
        type: 'financial_deletion_complete',
        timestamp: Date.now(),
        sessionId: this.analytics.currentSessionId,
        metadata: {
          workflowId,
          operationId,
          executionTimeMs: executionTime,
          recordsProcessed: result.data?.recordsProcessed || 0,
          recordsDeleted: result.data?.recordsDeleted || 0,
          recordsFailed: result.data?.recordsFailed || 0,
          success: result.success,
        },
      });

      return result;
    } catch (error) {
      const executionTime = performance.now() - startTime;

      // Record error
      this.analytics.recordEvent({
        id: `${operationId}-error`,
        type: 'financial_deletion_error',
        timestamp: Date.now(),
        sessionId: this.analytics.currentSessionId,
        metadata: {
          workflowId,
          operationId,
          executionTimeMs: executionTime,
          errorMessage: error.message,
          success: false,
        },
      });

      throw error;
    }
  }

  getAuthToken() {
    // Implementation to get JWT token
    return localStorage.getItem('jwtToken');
  }
}

// Usage example
const monitor = new DeletionWorkflowMonitor(analyticsCollector);
await monitor.executeWithMonitoring('workflow-123', { batchSize: 50 });
```

## Performance Metrics Collection

### Client-Side Performance Monitoring

```javascript
// Performance monitoring for graph execution
class GraphExecutionMonitor {
  constructor(analyticsCollector) {
    this.analytics = analyticsCollector;
  }

  async executeGraphWithMonitoring(graph, options = {}) {
    const { runs = 5, seedStart = 1 } = options;
    const graphId = graph.id || `graph-${Date.now()}`;
    const startTime = performance.now();

    // Record execution start
    this.analytics.recordGraphExecutionStart(graphId, graph.nodes.length, graph.edges?.length || 0, seedStart);

    try {
      const response = await fetch('/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': this.analytics.currentSessionId,
          'X-User-Id': this.getCurrentUserId(),
        },
        body: JSON.stringify({ graph, runs, seedStart }),
      });

      const result = await response.json();
      const executionTime = performance.now() - startTime;

      if (result.results && result.results.length > 0) {
        // Calculate total output length
        const totalOutputLength = result.results.reduce((sum, r) => sum + r.output.length, 0);

        // Record successful completion
        this.analytics.recordGraphExecutionComplete(
          graphId,
          executionTime,
          totalOutputLength,
          graph.nodes.length,
          graph.edges?.length || 0
        );

        // Record performance metrics
        this.analytics.recordPerformanceMetric(
          'graph_execution_time',
          executionTime,
          'milliseconds',
          'graph_executor',
          null,
          graphId
        );

        this.analytics.recordPerformanceMetric(
          'output_generation_rate',
          (totalOutputLength / executionTime) * 1000, // chars per second
          'chars_per_second',
          'graph_executor',
          null,
          graphId
        );
      } else {
        throw new Error(result.error || 'No results returned');
      }

      return result;
    } catch (error) {
      const executionTime = performance.now() - startTime;

      // Record execution error
      this.analytics.recordGraphExecutionError(
        graphId,
        error.message,
        graph.nodes.length,
        graph.edges?.length || 0,
        executionTime
      );

      throw error;
    }
  }

  getCurrentUserId() {
    // Implementation to get current user ID
    return localStorage.getItem('userId');
  }
}

// Usage example
const graphMonitor = new GraphExecutionMonitor(analyticsCollector);
const results = await graphMonitor.executeGraphWithMonitoring(myGraph, {
  runs: 10,
  seedStart: 42,
});
```

### Server-Side Performance Monitoring

```javascript
// Express middleware for API performance monitoring
const performanceMonitoringMiddleware = analyticsCollector => {
  return (req, res, next) => {
    const startTime = performance.now();
    const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Record API call start
    analyticsCollector.recordEvent({
      id: `${requestId}-start`,
      type: 'api_call_start',
      timestamp: Date.now(),
      sessionId: req.headers['x-session-id'] || 'unknown',
      userId: req.user?.id,
      metadata: {
        method: req.method,
        path: req.path,
        userAgent: req.headers['user-agent'],
        requestId,
      },
    });

    // Override res.end to capture completion metrics
    const originalEnd = res.end;
    res.end = function (...args) {
      const executionTime = performance.now() - startTime;

      // Record API call completion
      analyticsCollector.recordEvent({
        id: `${requestId}-complete`,
        type: 'api_call_complete',
        timestamp: Date.now(),
        sessionId: req.headers['x-session-id'] || 'unknown',
        userId: req.user?.id,
        metadata: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          executionTimeMs: executionTime,
          requestId,
          success: res.statusCode < 400,
        },
      });

      // Record performance metrics
      analyticsCollector.recordPerformanceMetric(
        'api_response_time',
        executionTime,
        'milliseconds',
        'api_server',
        null,
        req.path
      );

      originalEnd.apply(this, args);
    };

    next();
  };
};

// Usage in Express app
app.use(performanceMonitoringMiddleware(analyticsCollector));
```

## Analytics Events Tracking

### User Interaction Tracking

```javascript
// Canvas interaction monitoring
class CanvasInteractionTracker {
  constructor(analyticsCollector) {
    this.analytics = analyticsCollector;
  }

  trackNodeCreation(nodeType, position, graphId) {
    this.analytics.recordUserInteraction('node_created', graphId, {
      nodeType,
      canvasPosition: position,
      interactionType: 'creation',
    });
  }

  trackNodeUpdate(nodeId, nodeType, changes, graphId) {
    this.analytics.recordUserInteraction('node_updated', graphId, {
      nodeId,
      nodeType,
      changes: Object.keys(changes),
      interactionType: 'property_update',
    });
  }

  trackConnectionCreation(sourceNodeId, targetNodeId, graphId) {
    this.analytics.recordUserInteraction('connection_created', graphId, {
      sourceNodeId,
      targetNodeId,
      interactionType: 'connection',
    });
  }

  trackCanvasNavigation(action, viewport, graphId) {
    this.analytics.recordUserInteraction('canvas_interaction', graphId, {
      interactionType: action, // 'pan', 'zoom', 'select'
      viewport: {
        x: viewport.x,
        y: viewport.y,
        zoom: viewport.zoom,
      },
    });
  }
}

// Usage in React component
const CanvasEditor = () => {
  const tracker = new CanvasInteractionTracker(analyticsCollector);

  const handleNodeCreate = useCallback(
    (nodeType, position) => {
      const newNode = createNode(nodeType, position);
      tracker.trackNodeCreation(nodeType, position, currentGraphId);
      return newNode;
    },
    [currentGraphId]
  );

  const handleNodeUpdate = useCallback(
    (nodeId, changes) => {
      const node = getNodeById(nodeId);
      tracker.trackNodeUpdate(nodeId, node.type, changes, currentGraphId);
      updateNode(nodeId, changes);
    },
    [currentGraphId]
  );

  // ... rest of component
};
```

### Business Event Tracking

```javascript
// Business metrics tracking for compliance operations
class ComplianceMetricsTracker {
  constructor(analyticsCollector) {
    this.analytics = analyticsCollector;
  }

  trackPolicyAcceptance(policyId, userId, version) {
    this.analytics.recordEvent({
      id: `policy-acceptance-${Date.now()}`,
      type: 'conversion_event',
      timestamp: Date.now(),
      sessionId: this.analytics.currentSessionId,
      userId,
      metadata: {
        eventType: 'policy_acceptance',
        policyId,
        policyVersion: version,
        complianceCategory: 'data_protection',
      },
    });
  }

  trackDataClassification(dataId, classification, confidence) {
    this.analytics.recordEvent({
      id: `data-classification-${Date.now()}`,
      type: 'feature_usage',
      timestamp: Date.now(),
      sessionId: this.analytics.currentSessionId,
      metadata: {
        feature: 'data_classification',
        dataId,
        classification,
        confidenceScore: confidence,
        category: 'data_protection',
      },
    });
  }

  trackRetentionExecution(recordCount, dataCategory, outcome) {
    this.analytics.recordEvent({
      id: `retention-execution-${Date.now()}`,
      type: 'conversion_event',
      timestamp: Date.now(),
      sessionId: this.analytics.currentSessionId,
      metadata: {
        eventType: 'retention_execution',
        recordCount,
        dataCategory,
        outcome, // 'success', 'partial', 'failed'
        complianceCategory: 'data_retention',
      },
    });
  }
}

// Usage in compliance operations
const complianceTracker = new ComplianceMetricsTracker(analyticsCollector);

// Track policy acceptance
complianceTracker.trackPolicyAcceptance('gdpr-policy-v2', 'user-123', '2.0');

// Track data classification
complianceTracker.trackDataClassification('data-456', 'PII', 0.95);

// Track retention execution
complianceTracker.trackRetentionExecution(1250, 'FINANCIAL', 'success');
```

## WebSocket Monitoring

### Real-time Connection Monitoring

```javascript
// WebSocket connection monitoring
class WebSocketMonitor {
  constructor(metricsCollector) {
    this.metrics = metricsCollector;
    this.connections = new Map();
    this.messageStats = {
      sent: 0,
      received: 0,
      errors: 0,
    };
  }

  onConnection(ws, connectionInfo) {
    const connectionId = connectionInfo.connectionId;
    const startTime = Date.now();

    this.connections.set(connectionId, {
      connectedAt: startTime,
      userId: connectionInfo.userId,
      documentId: connectionInfo.documentId,
      messagesSent: 0,
      messagesReceived: 0,
      lastActivity: startTime,
    });

    // Record current connection metrics
    this.updateConnectionMetrics();

    ws.on('message', message => this.onMessage(connectionId, message));
    ws.on('close', () => this.onDisconnection(connectionId));
    ws.on('error', error => this.onError(connectionId, error));
  }

  onMessage(connectionId, message) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.messagesReceived++;
      connection.lastActivity = Date.now();
      this.messageStats.received++;
    }

    // Calculate message processing latency
    const messageData = JSON.parse(message);
    if (messageData.timestamp) {
      const latency = Date.now() - messageData.timestamp;
      this.recordMessageLatency(latency);
    }
  }

  onDisconnection(connectionId) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      const sessionDuration = Date.now() - connection.connectedAt;

      // Record session metrics
      this.metrics.recordCollaborationMetrics({
        sessionDuration,
        messagesExchanged: connection.messagesReceived + connection.messagesSent,
        documentId: connection.documentId,
      });

      this.connections.delete(connectionId);
      this.updateConnectionMetrics();
    }
  }

  onError(connectionId, error) {
    this.messageStats.errors++;

    const connection = this.connections.get(connectionId);
    if (connection) {
      // Record error metrics
      this.metrics.recordWebSocketMetrics({
        errorRate: (this.messageStats.errors / (this.messageStats.sent + this.messageStats.received)) * 100,
        lastError: error.message,
        connectionId,
      });
    }
  }

  updateConnectionMetrics() {
    const activeDocuments = new Set(Array.from(this.connections.values()).map(c => c.documentId)).size;

    const averageUsersPerDocument = activeDocuments > 0 ? this.connections.size / activeDocuments : 0;

    this.metrics.recordWebSocketMetrics({
      connectionCount: this.connections.size,
      activeDocuments,
      averageUsersPerDocument,
      bytesTransferred: this.calculateBytesTransferred(),
    });
  }

  recordMessageLatency(latency) {
    this.metrics.recordWebSocketMetrics({
      messageLatency: latency,
    });
  }

  calculateBytesTransferred() {
    // Implementation to calculate total bytes transferred
    return this.messageStats.sent * 100 + this.messageStats.received * 100; // Simplified
  }

  getConnectionMetrics() {
    return {
      totalConnections: this.connections.size,
      activeDocuments: new Set(Array.from(this.connections.values()).map(c => c.documentId)).size,
      messageStats: this.messageStats,
      avgSessionDuration: this.calculateAverageSessionDuration(),
    };
  }

  calculateAverageSessionDuration() {
    if (this.connections.size === 0) return 0;

    const now = Date.now();
    const totalDuration = Array.from(this.connections.values()).reduce(
      (sum, conn) => sum + (now - conn.connectedAt),
      0
    );

    return totalDuration / this.connections.size;
  }
}

// Usage in WebSocket server
const wsMonitor = new WebSocketMonitor(metricsCollector);

wss.on('connection', (ws, req) => {
  const connectionInfo = {
    connectionId: generateConnectionId(),
    userId: extractUserId(req),
    documentId: extractDocumentId(req),
    connectedAt: Date.now(),
  };

  wsMonitor.onConnection(ws, connectionInfo);
});
```

## Security Event Monitoring

### Authentication Event Tracking

```javascript
// Authentication monitoring
class AuthenticationMonitor {
  constructor(analyticsCollector, auditService) {
    this.analytics = analyticsCollector;
    this.audit = auditService;
  }

  async trackLoginAttempt(username, ipAddress, userAgent, success, mfaRequired = false) {
    const eventId = `login-attempt-${Date.now()}`;

    // Analytics event
    this.analytics.recordEvent({
      id: eventId,
      type: success ? 'authentication_success' : 'authentication_failure',
      timestamp: Date.now(),
      sessionId: this.analytics.currentSessionId,
      metadata: {
        username: this.hashUsername(username),
        ipAddress: this.hashIpAddress(ipAddress),
        userAgent: this.hashUserAgent(userAgent),
        mfaRequired,
        attemptType: 'password_login',
      },
    });

    // Audit trail
    await this.audit.logEvent({
      userId: username,
      action: success ? 'login_success' : 'login_failure',
      resourceType: 'authentication',
      resourceId: eventId,
      details: {
        ipAddress,
        userAgent,
        mfaRequired,
        timestamp: Date.now(),
      },
      severity: success ? 'info' : 'warn',
    });

    // Track consecutive failures for anomaly detection
    if (!success) {
      await this.trackFailedLoginSequence(username, ipAddress);
    }
  }

  async trackMFAVerification(userId, method, success, deviceTrust) {
    const eventId = `mfa-verification-${Date.now()}`;

    this.analytics.recordEvent({
      id: eventId,
      type: success ? 'mfa_success' : 'mfa_failure',
      timestamp: Date.now(),
      sessionId: this.analytics.currentSessionId,
      userId,
      metadata: {
        method, // 'totp', 'sms', 'email'
        deviceTrustScore: deviceTrust,
        success,
      },
    });

    await this.audit.logEvent({
      userId,
      action: success ? 'mfa_verification_success' : 'mfa_verification_failure',
      resourceType: 'mfa',
      resourceId: eventId,
      details: {
        method,
        deviceTrustScore: deviceTrust,
      },
      severity: success ? 'info' : 'warn',
    });
  }

  async trackAnomalousActivity(userId, activityType, riskScore, context) {
    const eventId = `anomaly-${Date.now()}`;

    this.analytics.recordEvent({
      id: eventId,
      type: 'security_anomaly',
      timestamp: Date.now(),
      sessionId: this.analytics.currentSessionId,
      userId,
      metadata: {
        activityType, // 'impossible_travel', 'unusual_device', 'off_hours_access'
        riskScore,
        context,
        severity: riskScore > 80 ? 'critical' : riskScore > 50 ? 'high' : 'medium',
      },
    });

    await this.audit.logEvent({
      userId,
      action: 'anomalous_activity_detected',
      resourceType: 'security_event',
      resourceId: eventId,
      details: {
        activityType,
        riskScore,
        context,
        detectionTime: Date.now(),
      },
      severity: riskScore > 80 ? 'critical' : 'warn',
    });
  }

  async trackFailedLoginSequence(username, ipAddress) {
    // Implementation to track consecutive failed logins
    // This would integrate with anomaly detection systems
    const key = `failed_logins:${this.hashUsername(username)}:${this.hashIpAddress(ipAddress)}`;

    // Increment failure count and check thresholds
    // If threshold exceeded, generate security alert
  }

  hashUsername(username) {
    // Simple hash for privacy protection
    return require('crypto').createHash('sha256').update(username).digest('hex').substr(0, 8);
  }

  hashIpAddress(ip) {
    // Hash IP address for privacy while maintaining uniqueness for analysis
    return require('crypto').createHash('sha256').update(ip).digest('hex').substr(0, 12);
  }

  hashUserAgent(userAgent) {
    // Hash user agent string
    return require('crypto').createHash('sha256').update(userAgent).digest('hex').substr(0, 10);
  }
}

// Usage in authentication routes
const authMonitor = new AuthenticationMonitor(analyticsCollector, auditService);

// In login endpoint
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  try {
    const user = await authenticateUser(username, password);

    await authMonitor.trackLoginAttempt(username, ipAddress, userAgent, true, user.mfaEnabled);

    if (user.mfaEnabled) {
      // Handle MFA flow
      return res.json({ requiresMFA: true, userId: user.id });
    }

    const token = generateJWTToken(user);
    res.json({ token, user });
  } catch (error) {
    await authMonitor.trackLoginAttempt(username, ipAddress, userAgent, false);
    res.status(401).json({ error: 'Authentication failed' });
  }
});
```

## Health Check Implementation

### Comprehensive Health Monitoring

```javascript
// Health check service with monitoring integration
class HealthCheckService {
  constructor(dependencies) {
    this.database = dependencies.database;
    this.redis = dependencies.redis;
    this.wsServer = dependencies.wsServer;
    this.metricsCollector = dependencies.metricsCollector;
    this.financialService = dependencies.financialService;
  }

  async getHealthStatus() {
    const startTime = performance.now();
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      uptime: process.uptime(),
      checks: {},
    };

    try {
      // Database health check
      health.checks.database = await this.checkDatabase();

      // Redis health check
      health.checks.redis = await this.checkRedis();

      // WebSocket health check
      health.checks.websocket = await this.checkWebSocket();

      // Financial services health check
      health.checks.financialServices = await this.checkFinancialServices();

      // System resources check
      health.checks.system = await this.checkSystemResources();

      // Determine overall status
      health.status = this.calculateOverallStatus(health.checks);

      // Record health check metrics
      const executionTime = performance.now() - startTime;
      this.metricsCollector.recordPerformanceMetric(
        'health_check_duration',
        executionTime,
        'milliseconds',
        'health_service'
      );

      return health;
    } catch (error) {
      health.status = 'unhealthy';
      health.error = error.message;
      return health;
    }
  }

  async checkDatabase() {
    try {
      const startTime = performance.now();
      await this.database.query('SELECT 1');
      const responseTime = performance.now() - startTime;

      return {
        status: 'healthy',
        responseTime: Math.round(responseTime),
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  async checkRedis() {
    try {
      if (!this.redis) {
        return { status: 'disabled', message: 'Redis not configured' };
      }

      const startTime = performance.now();
      await this.redis.ping();
      const responseTime = performance.now() - startTime;

      return {
        status: 'healthy',
        responseTime: Math.round(responseTime),
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  async checkWebSocket() {
    try {
      const metrics = this.wsServer.getHealthMetrics();
      const isHealthy = metrics.totalConnections >= 0; // Basic validation

      return {
        status: isHealthy ? 'healthy' : 'degraded',
        connections: metrics.totalConnections,
        activeDocuments: metrics.activeDocuments,
        uptime: metrics.uptime,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  async checkFinancialServices() {
    try {
      // Test basic financial service functionality
      const testResult = await this.financialService.healthCheck();

      return {
        status: 'healthy',
        serviceVersion: '1.0.0',
        lastChecked: new Date().toISOString(),
        ...testResult,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  async checkSystemResources() {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      const isMemoryHealthy = memoryUsagePercent < 85;

      return {
        status: isMemoryHealthy ? 'healthy' : 'degraded',
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
          total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
          percentage: Math.round(memoryUsagePercent),
        },
        process: {
          pid: process.pid,
          uptime: Math.round(process.uptime()),
          nodeVersion: process.version,
        },
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  calculateOverallStatus(checks) {
    const statuses = Object.values(checks).map(check => check.status);

    if (statuses.includes('unhealthy')) {
      return 'unhealthy';
    } else if (statuses.includes('degraded')) {
      return 'degraded';
    } else if (statuses.every(status => status === 'healthy' || status === 'disabled')) {
      return 'healthy';
    } else {
      return 'unknown';
    }
  }

  // Detailed health check for monitoring systems
  async getDetailedHealth() {
    const basicHealth = await this.getHealthStatus();

    // Add additional monitoring-specific metrics
    const currentMetrics = this.metricsCollector.getCurrentMetrics();
    const performanceSummary = this.metricsCollector.getPerformanceSummary(300000); // Last 5 minutes

    return {
      ...basicHealth,
      performance: {
        current: currentMetrics,
        summary: performanceSummary,
      },
      monitoring: {
        activeAlerts: this.metricsCollector.getActiveAlerts(),
        lastMetricUpdate: currentMetrics.system?.timestamp || null,
      },
    };
  }
}

// Usage in health endpoint
app.get('/health', async (req, res) => {
  const healthService = new HealthCheckService({
    database: db,
    redis: redisService,
    wsServer: webSocketServer,
    metricsCollector,
    financialService,
  });

  const health = await healthService.getHealthStatus();
  const statusCode = health.status === 'healthy' ? 200 : 503;

  res.status(statusCode).json(health);
});

// Detailed health endpoint for monitoring tools
app.get('/health/detailed', async (req, res) => {
  const healthService = new HealthCheckService({
    database: db,
    redis: redisService,
    wsServer: webSocketServer,
    metricsCollector,
    financialService,
  });

  const health = await healthService.getDetailedHealth();
  res.json(health);
});
```

## Custom Metrics Integration

### Creating Custom Business Metrics

```javascript
// Custom metrics for business-specific monitoring
class BusinessMetricsCollector {
  constructor(analyticsCollector, metricsCollector) {
    this.analytics = analyticsCollector;
    this.metrics = metricsCollector;
  }

  // Track compliance framework adoption
  trackComplianceFrameworkUsage(framework, organizationId, featureUsage) {
    this.analytics.recordEvent({
      id: `compliance-usage-${Date.now()}`,
      type: 'feature_usage',
      timestamp: Date.now(),
      sessionId: this.analytics.currentSessionId,
      organizationId,
      metadata: {
        feature: 'compliance_framework',
        framework, // 'GDPR', 'CCPA', 'SOX', 'HIPAA'
        ...featureUsage,
      },
    });

    // Record framework-specific performance metrics
    this.metrics.recordPerformanceMetric(
      `compliance_framework_${framework.toLowerCase()}_usage`,
      1,
      'count',
      'compliance_service',
      null,
      organizationId
    );
  }

  // Track data retention effectiveness
  trackDataRetentionEffectiveness(category, totalRecords, retentionCompliant, overdue) {
    const complianceRate = (retentionCompliant / totalRecords) * 100;
    const overdueRate = (overdue / totalRecords) * 100;

    this.metrics.recordPerformanceMetric(
      'data_retention_compliance_rate',
      complianceRate,
      'percentage',
      'retention_service',
      null,
      category
    );

    this.metrics.recordPerformanceMetric(
      'data_retention_overdue_rate',
      overdueRate,
      'percentage',
      'retention_service',
      null,
      category
    );

    this.analytics.recordEvent({
      id: `retention-effectiveness-${Date.now()}`,
      type: 'performance_metric',
      timestamp: Date.now(),
      sessionId: this.analytics.currentSessionId,
      metadata: {
        metricType: 'data_retention_effectiveness',
        category,
        totalRecords,
        retentionCompliant,
        overdue,
        complianceRate,
        overdueRate,
      },
    });
  }

  // Track financial data lifecycle efficiency
  trackFinancialDataLifecycleMetrics(workflowId, executionMetrics) {
    const { recordsProcessed, recordsDeleted, recordsFailed, executionTimeMs, verificationSteps, safetyChecks } =
      executionMetrics;

    const successRate = (recordsDeleted / recordsProcessed) * 100;
    const failureRate = (recordsFailed / recordsProcessed) * 100;
    const throughput = recordsProcessed / (executionTimeMs / 1000); // records per second

    // Record efficiency metrics
    this.metrics.recordPerformanceMetric(
      'financial_deletion_success_rate',
      successRate,
      'percentage',
      'financial_lifecycle_service',
      null,
      workflowId
    );

    this.metrics.recordPerformanceMetric(
      'financial_deletion_throughput',
      throughput,
      'records_per_second',
      'financial_lifecycle_service',
      null,
      workflowId
    );

    this.metrics.recordPerformanceMetric(
      'financial_deletion_verification_time',
      verificationSteps.averageTimeMs || 0,
      'milliseconds',
      'financial_lifecycle_service',
      null,
      workflowId
    );

    // Record business event
    this.analytics.recordEvent({
      id: `financial-lifecycle-${Date.now()}`,
      type: 'conversion_event',
      timestamp: Date.now(),
      sessionId: this.analytics.currentSessionId,
      metadata: {
        eventType: 'financial_data_lifecycle_execution',
        workflowId,
        successRate,
        failureRate,
        throughput,
        recordsProcessed,
        verificationSteps: verificationSteps.completed,
        safetyChecks: safetyChecks.passed,
      },
    });
  }

  // Track user adoption of privacy features
  trackPrivacyFeatureAdoption(userId, feature, adoptionStage) {
    this.analytics.recordEvent({
      id: `privacy-adoption-${Date.now()}`,
      type: 'conversion_event',
      timestamp: Date.now(),
      sessionId: this.analytics.currentSessionId,
      userId,
      metadata: {
        eventType: 'privacy_feature_adoption',
        feature, // 'data_export', 'data_deletion', 'consent_management'
        adoptionStage, // 'discovered', 'trial', 'adopted', 'expert'
        category: 'privacy_controls',
      },
    });
  }

  // Generate business metrics summary
  generateBusinessMetricsSummary(timeWindow = 3600000) {
    // 1 hour default
    const endTime = Date.now();
    const startTime = endTime - timeWindow;

    const analyticsWindow = this.analytics.getAnalyticsWindow(startTime, endTime);
    const performanceWindow = this.metrics.getMetricsWindow(startTime, endTime);

    return {
      timeWindow: {
        start: new Date(startTime).toISOString(),
        end: new Date(endTime).toISOString(),
        durationMs: timeWindow,
      },
      compliance: {
        frameworkUsage: this.summarizeComplianceUsage(analyticsWindow.events),
        retentionEffectiveness: this.summarizeRetentionMetrics(performanceWindow),
      },
      financialServices: {
        lifecycleEfficiency: this.summarizeFinancialMetrics(analyticsWindow.events),
        operationalMetrics: this.summarizeOperationalMetrics(performanceWindow),
      },
      privacy: {
        featureAdoption: this.summarizePrivacyAdoption(analyticsWindow.events),
        userEngagement: this.summarizeUserEngagement(analyticsWindow.events),
      },
    };
  }

  summarizeComplianceUsage(events) {
    const complianceEvents = events.filter(
      e => e.metadata?.feature === 'compliance_framework' || e.metadata?.category === 'compliance'
    );

    const frameworkCounts = {};
    complianceEvents.forEach(event => {
      const framework = event.metadata?.framework || 'unknown';
      frameworkCounts[framework] = (frameworkCounts[framework] || 0) + 1;
    });

    return {
      totalUsage: complianceEvents.length,
      frameworkBreakdown: frameworkCounts,
      activeFrameworks: Object.keys(frameworkCounts).length,
    };
  }

  summarizeRetentionMetrics(metricsWindow) {
    // Implementation to analyze retention effectiveness metrics
    const retentionMetrics = metricsWindow.systemMetrics.filter(m => m.component === 'retention_service');

    return {
      averageComplianceRate: this.calculateAverage(retentionMetrics, 'complianceRate'),
      totalRecordsProcessed: this.calculateSum(retentionMetrics, 'recordsProcessed'),
      retentionTrends: this.calculateTrends(retentionMetrics),
    };
  }

  summarizeFinancialMetrics(events) {
    const financialEvents = events.filter(e => e.metadata?.eventType === 'financial_data_lifecycle_execution');

    return {
      totalExecutions: financialEvents.length,
      averageSuccessRate: this.calculateAverageFromEvents(financialEvents, 'successRate'),
      averageThroughput: this.calculateAverageFromEvents(financialEvents, 'throughput'),
      totalRecordsProcessed: this.calculateSumFromEvents(financialEvents, 'recordsProcessed'),
    };
  }

  summarizePrivacyAdoption(events) {
    const privacyEvents = events.filter(e => e.metadata?.eventType === 'privacy_feature_adoption');

    const featureCounts = {};
    const stageCounts = {};

    privacyEvents.forEach(event => {
      const feature = event.metadata?.feature || 'unknown';
      const stage = event.metadata?.adoptionStage || 'unknown';

      featureCounts[feature] = (featureCounts[feature] || 0) + 1;
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
    });

    return {
      totalAdoptionEvents: privacyEvents.length,
      featureBreakdown: featureCounts,
      adoptionStageBreakdown: stageCounts,
    };
  }

  calculateAverageFromEvents(events, property) {
    if (events.length === 0) return 0;
    const sum = events.reduce((acc, event) => acc + (event.metadata?.[property] || 0), 0);
    return sum / events.length;
  }

  calculateSumFromEvents(events, property) {
    return events.reduce((acc, event) => acc + (event.metadata?.[property] || 0), 0);
  }
}

// Usage example
const businessMetrics = new BusinessMetricsCollector(analyticsCollector, metricsCollector);

// Track compliance framework usage
businessMetrics.trackComplianceFrameworkUsage('GDPR', 'org-123', {
  rulesEvaluated: 45,
  policiesCreated: 3,
  dataSubjectsProcessed: 1200,
});

// Track data retention effectiveness
businessMetrics.trackDataRetentionEffectiveness('FINANCIAL', 10000, 9750, 250);

// Track financial lifecycle metrics
businessMetrics.trackFinancialDataLifecycleMetrics('workflow-456', {
  recordsProcessed: 1500,
  recordsDeleted: 1450,
  recordsFailed: 50,
  executionTimeMs: 45000,
  verificationSteps: { completed: 3, averageTimeMs: 250 },
  safetyChecks: { passed: 5, failed: 0 },
});

// Generate business summary
const summary = businessMetrics.generateBusinessMetricsSummary(3600000); // Last hour
console.log('Business Metrics Summary:', summary);
```

## Monitoring Data Consumption

### Consuming Monitoring Data from External Systems

```javascript
// Monitoring data API client for external systems
class MonitoringDataClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  // Get real-time metrics
  async getCurrentMetrics() {
    const response = await fetch(`${this.baseUrl}/api/monitoring/current`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return response.json();
  }

  // Get metrics for a specific time window
  async getMetricsWindow(startTime, endTime) {
    const params = new URLSearchParams({
      start: startTime.toISOString(),
      end: endTime.toISOString(),
    });

    const response = await fetch(`${this.baseUrl}/api/monitoring/window?${params}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return response.json();
  }

  // Subscribe to real-time metrics via WebSocket
  subscribeToMetrics(onMetrics, onError) {
    const ws = new WebSocket(`${this.baseUrl.replace('http', 'ws')}/monitoring/stream`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    ws.on('message', data => {
      try {
        const metrics = JSON.parse(data);
        onMetrics(metrics);
      } catch (error) {
        onError(error);
      }
    });

    ws.on('error', onError);

    return {
      close: () => ws.close(),
      ws,
    };
  }

  // Get financial services specific metrics
  async getFinancialServicesMetrics(timeWindow = 3600000) {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - timeWindow);

    const response = await fetch(`${this.baseUrl}/api/monitoring/financial-services`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startTime, endTime }),
    });

    return response.json();
  }

  // Export monitoring data
  async exportMetrics(startTime, endTime, format = 'json') {
    const params = new URLSearchParams({
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      format,
    });

    const response = await fetch(`${this.baseUrl}/api/monitoring/export?${params}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (format === 'json') {
      return response.json();
    } else {
      return response.text();
    }
  }
}

// Usage example for monitoring dashboard
const monitoringClient = new MonitoringDataClient('https://api.promptscape.com', 'your-api-key');

// Real-time monitoring dashboard
class MonitoringDashboard {
  constructor(client) {
    this.client = client;
    this.subscription = null;
  }

  async initialize() {
    // Get initial metrics
    const currentMetrics = await this.client.getCurrentMetrics();
    this.updateDashboard(currentMetrics);

    // Subscribe to real-time updates
    this.subscription = this.client.subscribeToMetrics(
      metrics => this.updateDashboard(metrics),
      error => this.handleError(error)
    );
  }

  updateDashboard(metrics) {
    // Update dashboard components with new metrics
    this.updateSystemHealth(metrics.system);
    this.updatePerformanceCharts(metrics.performance);
    this.updateSecurityEvents(metrics.security);
    this.updateFinancialServices(metrics.financialServices);
  }

  updateSystemHealth(systemMetrics) {
    if (!systemMetrics) return;

    // Update system health indicators
    document.getElementById('cpu-usage').textContent = `${systemMetrics.cpu.mean?.toFixed(1)}%`;
    document.getElementById('memory-usage').textContent = `${systemMetrics.memory.mean?.toFixed(1)}%`;
    document.getElementById('health-score').textContent = systemMetrics.healthScore;

    // Update health status color
    const healthElement = document.getElementById('health-status');
    if (systemMetrics.healthScore > 80) {
      healthElement.className = 'status healthy';
    } else if (systemMetrics.healthScore > 60) {
      healthElement.className = 'status warning';
    } else {
      healthElement.className = 'status critical';
    }
  }

  updatePerformanceCharts(performanceMetrics) {
    if (!performanceMetrics) return;

    // Update performance charts (assuming Chart.js or similar)
    if (this.responseTimeChart) {
      this.responseTimeChart.data.labels.push(new Date().toLocaleTimeString());
      this.responseTimeChart.data.datasets[0].data.push(performanceMetrics.averageResponseTime);

      // Keep only last 20 data points
      if (this.responseTimeChart.data.labels.length > 20) {
        this.responseTimeChart.data.labels.shift();
        this.responseTimeChart.data.datasets[0].data.shift();
      }

      this.responseTimeChart.update('none');
    }
  }

  updateSecurityEvents(securityMetrics) {
    if (!securityMetrics?.events) return;

    const securityLog = document.getElementById('security-events');
    securityMetrics.events.slice(-5).forEach(event => {
      const eventElement = document.createElement('div');
      eventElement.className = `security-event ${event.severity}`;
      eventElement.innerHTML = `
        <span class="timestamp">${new Date(event.timestamp).toLocaleString()}</span>
        <span class="event-type">${event.type}</span>
        <span class="description">${event.description}</span>
      `;
      securityLog.appendChild(eventElement);
    });

    // Keep only last 10 events visible
    while (securityLog.children.length > 10) {
      securityLog.removeChild(securityLog.firstChild);
    }
  }

  updateFinancialServices(financialMetrics) {
    if (!financialMetrics) return;

    document.getElementById('deletion-success-rate').textContent =
      `${financialMetrics.deletionSuccessRate?.toFixed(1)}%`;
    document.getElementById('retention-compliance').textContent =
      `${financialMetrics.retentionCompliance?.toFixed(1)}%`;
    document.getElementById('active-workflows').textContent = financialMetrics.activeWorkflows || 0;
  }

  handleError(error) {
    console.error('Monitoring dashboard error:', error);
    // Show error notification to user
    this.showNotification('Connection to monitoring service lost', 'error');
  }

  showNotification(message, type) {
    // Implementation to show user notifications
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      document.body.removeChild(notification);
    }, 5000);
  }

  async generateReport(timeRange) {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - timeRange);

    try {
      const reportData = await this.client.exportMetrics(startTime, endTime, 'json');
      this.downloadReport(reportData, startTime, endTime);
    } catch (error) {
      this.handleError(error);
    }
  }

  downloadReport(data, startTime, endTime) {
    const filename = `monitoring-report-${startTime.toISOString().split('T')[0]}-to-${endTime.toISOString().split('T')[0]}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  destroy() {
    if (this.subscription) {
      this.subscription.close();
    }
  }
}

// Initialize monitoring dashboard
const dashboard = new MonitoringDashboard(monitoringClient);
dashboard.initialize();

// Generate daily report
document.getElementById('generate-report-btn').addEventListener('click', () => {
  dashboard.generateReport(24 * 60 * 60 * 1000); // Last 24 hours
});
```

## Summary

This document provides comprehensive examples for implementing and consuming monitoring features across the PromptScape application. The examples demonstrate:

- **Financial Services API Monitoring**: Complete audit trails and performance tracking for compliance operations
- **Performance Metrics Collection**: System resource monitoring and optimization
- **Analytics Events Tracking**: User behavior and business metrics collection
- **WebSocket Monitoring**: Real-time connection and collaboration metrics
- **Security Event Monitoring**: Authentication, authorization, and anomaly detection
- **Health Check Implementation**: Comprehensive system health monitoring
- **Custom Metrics Integration**: Business-specific monitoring capabilities
- **Monitoring Data Consumption**: External system integration and dashboard creation

These examples provide the foundation for building robust monitoring and observability capabilities that support both operational excellence and regulatory compliance requirements.

---

_Last updated: 2025-07-21_  
_For implementation questions, refer to the main monitoring documentation: `docs/execution-monitoring-observability.md`_
