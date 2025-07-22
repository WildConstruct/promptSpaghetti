/**
 * Adaptive Throttling Middleware for Fastify
 * Task: E17-1753114397229-D69134 - Implement throttling rules
 * 
 * Integrates the Adaptive Throttling Rules Engine with Fastify to provide
 * intelligent request throttling based on system conditions and threat levels.
 */

import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { 
  AdaptiveThrottlingRulesEngine, 
  ThrottlingContext, 
  ThrottlingResult,
  SystemMetrics
} from '../../../packages/core/security/AdaptiveThrottlingRules';
import { RateLimitingService, ThreatLevel } from '../../../packages/core/security/RateLimitingService';

// ========================================
// Middleware Configuration
// ========================================

export interface AdaptiveThrottlingConfig {
  enabled: boolean;
  skipHealthChecks: boolean;
  skipStaticAssets: boolean;
  trustedProxies: string[];
  maxDelayMs: number;
  enableMetricsCollection: boolean;
  systemMetricsInterval: number; // ms
  logThrottledRequests: boolean;
  customThreatAssessment?: (request: FastifyRequest) => ThreatLevel;
  onThrottled?: (request: FastifyRequest, result: ThrottlingResult) => void;
  onError?: (error: Error, request: FastifyRequest) => void;
}

export interface SystemMonitor {
  getCPUUsage(): Promise<number>;
  getMemoryUsage(): Promise<number>;
  getActiveConnections(): number;
  getRequestsPerSecond(): number;
  getAverageResponseTime(): number;
  getErrorRate(): number;
  getQueueDepth(): number;
}

// ========================================
// Default System Monitor Implementation
// ========================================

class DefaultSystemMonitor implements SystemMonitor {
  private requestCounts: number[] = [];
  private responseTimes: number[] = [];
  private errorCount: number = 0;
  private totalRequests: number = 0;
  private activeConnections: number = 0;
  private queueDepth: number = 0;

  async getCPUUsage(): Promise<number> {
    // Simplified CPU usage estimation
    // In production, use actual system monitoring libraries
    const loadAvg = process.cpuUsage();
    return Math.min(100, (loadAvg.user + loadAvg.system) / 1000000);
  }

  async getMemoryUsage(): Promise<number> {
    const usage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    return (usage.heapUsed / totalMemory) * 100;
  }

  getActiveConnections(): number {
    return this.activeConnections;
  }

  getRequestsPerSecond(): number {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    const recentRequests = this.requestCounts.filter(time => time > oneSecondAgo);
    return recentRequests.length;
  }

  getAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;
    const sum = this.responseTimes.reduce((a, b) => a + b, 0);
    return sum / this.responseTimes.length;
  }

  getErrorRate(): number {
    if (this.totalRequests === 0) return 0;
    return (this.errorCount / this.totalRequests) * 100;
  }

  getQueueDepth(): number {
    return this.queueDepth;
  }

  recordRequest(startTime: number, isError: boolean): void {
    const now = Date.now();
    this.requestCounts.push(now);
    this.responseTimes.push(now - startTime);
    this.totalRequests++;
    
    if (isError) {
      this.errorCount++;
    }

    // Clean up old data (keep last 60 seconds)
    const cutoff = now - 60000;
    this.requestCounts = this.requestCounts.filter(time => time > cutoff);
    this.responseTimes = this.responseTimes.filter((_, index) => 
      this.requestCounts[index] > cutoff
    );
  }

  setActiveConnections(count: number): void {
    this.activeConnections = count;
  }

  setQueueDepth(depth: number): void {
    this.queueDepth = depth;
  }
}

// ========================================
// Adaptive Throttling Middleware
// ========================================

export class AdaptiveThrottlingMiddleware {
  private engine: AdaptiveThrottlingRulesEngine;
  private monitor: SystemMonitor;
  private config: AdaptiveThrottlingConfig;
  private metricsInterval?: NodeJS.Timeout;

  constructor(
    rateLimitingService: RateLimitingService,
    config: Partial<AdaptiveThrottlingConfig> = {},
    monitor?: SystemMonitor
  ) {
    this.config = {
      enabled: true,
      skipHealthChecks: true,
      skipStaticAssets: true,
      trustedProxies: [],
      maxDelayMs: 10000,
      enableMetricsCollection: true,
      systemMetricsInterval: 30000, // 30 seconds
      logThrottledRequests: true,
      ...config
    };

    this.engine = new AdaptiveThrottlingRulesEngine(rateLimitingService);
    this.monitor = monitor || new DefaultSystemMonitor();
    
    if (this.config.enableMetricsCollection) {
      this.startMetricsCollection();
    }

    this.setupEventListeners();
  }

  /**
   * Create Fastify middleware function
   */
  createMiddleware() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      if (!this.config.enabled) {
        return;
      }

      try {
        // Skip certain requests based on configuration
        if (this.shouldSkipRequest(request)) {
          return;
        }

        const startTime = Date.now();
        const context = await this.buildThrottlingContext(request);
        const result = await this.engine.applyThrottling(context);

        // Handle throttling result
        await this.handleThrottlingResult(request, reply, result, startTime);

      } catch (error) {
        console.error('Adaptive throttling middleware error:', error);
        
        if (this.config.onError) {
          this.config.onError(error as Error, request);
        }

        // Fail open - allow request to proceed
        return;
      }
    };
  }

  /**
   * Get current engine statistics
   */
  getStatistics() {
    return {
      engine: this.engine.getStatistics(),
      systemMetrics: this.getSystemMetrics()
    };
  }

  /**
   * Update system metrics manually
   */
  updateSystemMetrics(metrics: Partial<SystemMetrics>): void {
    this.engine.updateSystemMetrics(metrics);
  }

  /**
   * Enable or disable the middleware
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.engine.setEnabled(enabled);
  }

  /**
   * Add a custom throttling rule
   */
  addThrottlingRule(rule: any): void {
    this.engine.addRule(rule);
  }

  /**
   * Remove a throttling rule
   */
  removeThrottlingRule(ruleId: string): boolean {
    return this.engine.removeRule(ruleId);
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    this.engine.cleanup();
  }

  // ========================================
  // Private Implementation
  // ========================================

  private shouldSkipRequest(request: FastifyRequest): boolean {
    // Skip health checks
    if (this.config.skipHealthChecks && 
        (request.url === '/health' || request.url === '/status')) {
      return true;
    }

    // Skip static assets
    if (this.config.skipStaticAssets && 
        /\.(css|js|png|jpg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(request.url)) {
      return true;
    }

    return false;
  }

  private async buildThrottlingContext(request: FastifyRequest): Promise<ThrottlingContext> {
    // Extract IP address (considering trusted proxies)
    const ip = this.extractClientIP(request);

    // Extract user ID if available
    const userId = (request as any).userId?.toString();

    // Extract user agent
    const userAgent = request.headers['user-agent'] || 'unknown';

    // Get current system metrics for load assessment
    const cpuUsage = await this.monitor.getCPUUsage();
    const memoryUsage = await this.monitor.getMemoryUsage();
    const systemLoad = (cpuUsage + memoryUsage) / 2;

    // Assess threat level
    const threatLevel = this.assessThreatLevel(request);

    // Calculate recent failures (simplified)
    const recentFailures = this.calculateRecentFailures(ip, request.url);
    const consecutiveFailures = this.calculateConsecutiveFailures(ip, request.url);

    return {
      requestId: this.generateRequestId(),
      endpoint: request.url,
      method: request.method,
      userId,
      ip,
      userAgent,
      timestamp: Date.now(),
      systemLoad,
      threatLevel,
      recentFailures,
      consecutiveFailures
    };
  }

  private extractClientIP(request: FastifyRequest): string {
    // Check for forwarded IP headers from trusted proxies
    const forwardedFor = request.headers['x-forwarded-for'];
    const realIP = request.headers['x-real-ip'];
    const cfConnectingIP = request.headers['cf-connecting-ip'];

    if (cfConnectingIP && typeof cfConnectingIP === 'string') {
      return cfConnectingIP;
    }

    if (realIP && typeof realIP === 'string') {
      return realIP;
    }

    if (forwardedFor && typeof forwardedFor === 'string') {
      return forwardedFor.split(',')[0].trim();
    }

    return request.ip || 'unknown';
  }

  private assessThreatLevel(request: FastifyRequest): ThreatLevel {
    // Use custom threat assessment if provided
    if (this.config.customThreatAssessment) {
      return this.config.customThreatAssessment(request);
    }

    // Default threat assessment logic
    let threatScore = 0;

    // Check for suspicious patterns in user agent
    const userAgent = request.headers['user-agent'] || '';
    if (userAgent.includes('bot') || userAgent.includes('crawler') || userAgent === '') {
      threatScore += 10;
    }

    // Check for suspicious request patterns
    if (request.url.includes('admin') || request.url.includes('config')) {
      threatScore += 15;
    }

    // Check for common attack patterns
    const suspiciousPatterns = ['../', '<script', 'union select', 'drop table'];
    const requestData = JSON.stringify({
      url: request.url,
      headers: request.headers,
      query: request.query
    }).toLowerCase();

    for (const pattern of suspiciousPatterns) {
      if (requestData.includes(pattern)) {
        threatScore += 25;
      }
    }

    // Determine threat level
    if (threatScore >= 50) return ThreatLevel.CRITICAL;
    if (threatScore >= 30) return ThreatLevel.HIGH;
    if (threatScore >= 15) return ThreatLevel.MEDIUM;
    return ThreatLevel.LOW;
  }

  private calculateRecentFailures(ip: string, endpoint: string): number {
    // Simplified implementation - in production, use proper tracking
    // This would query the rate limiting service for recent failures
    return 0;
  }

  private calculateConsecutiveFailures(ip: string, endpoint: string): number {
    // Simplified implementation - in production, use proper tracking
    // This would query the rate limiting service for consecutive failures
    return 0;
  }

  private async handleThrottlingResult(
    request: FastifyRequest,
    reply: FastifyReply,
    result: ThrottlingResult,
    startTime: number
  ): Promise<void> {
    const monitor = this.monitor as DefaultSystemMonitor;

    switch (result.action) {
    case 'allow':
      // Request allowed - continue normally
      monitor.recordRequest(startTime, false);
      return;

    case 'throttle':
      // Apply throttling delay
      if (result.delay > 0) {
        const actualDelay = Math.min(result.delay, this.config.maxDelayMs);
        await this.delay(actualDelay);
      }
      
      // Set throttling headers
      reply.header('X-Throttled', 'true');
      reply.header('X-Throttle-Delay', result.delay.toString());
      reply.header('X-Throttle-Reason', result.reason);
      
      if (this.config.logThrottledRequests) {
        console.log(`Request throttled: ${request.method} ${request.url} - ${result.reason} (${result.delay}ms delay)`);
      }
      
      monitor.recordRequest(startTime, false);
      
      if (this.config.onThrottled) {
        this.config.onThrottled(request, result);
      }
      return;

    case 'block':
      // Block the request
      monitor.recordRequest(startTime, true);
      
      reply.code(429).send({
        error: 'Too Many Requests',
        message: result.reason,
        type: 'throttling_block',
        retryAfter: result.delay || 60
      });
      
      if (this.config.logThrottledRequests) {
        console.log(`Request blocked: ${request.method} ${request.url} - ${result.reason}`);
      }
      
      if (this.config.onThrottled) {
        this.config.onThrottled(request, result);
      }
      return;

    case 'shed':
      // Load shedding - drop the request
      monitor.recordRequest(startTime, true);
      
      reply.code(503).send({
        error: 'Service Unavailable',
        message: 'System under high load - request dropped',
        type: 'load_shedding',
        retryAfter: 30
      });
      
      if (this.config.logThrottledRequests) {
        console.log(`Request shed: ${request.method} ${request.url} - load shedding`);
      }
      return;

    default:
      // Unknown action - allow request
      monitor.recordRequest(startTime, false);
      return;
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getSystemMetrics(): Promise<SystemMetrics> {
    return {
      cpuUsage: await this.monitor.getCPUUsage(),
      memoryUsage: await this.monitor.getMemoryUsage(),
      activeConnections: this.monitor.getActiveConnections(),
      requestsPerSecond: this.monitor.getRequestsPerSecond(),
      averageResponseTime: this.monitor.getAverageResponseTime(),
      errorRate: this.monitor.getErrorRate(),
      queueDepth: this.monitor.getQueueDepth()
    };
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(async () => {
      try {
        const metrics = await this.getSystemMetrics();
        this.engine.updateSystemMetrics(metrics);
      } catch (error) {
        console.error('Error collecting system metrics:', error);
      }
    }, this.config.systemMetricsInterval);
  }

  private setupEventListeners(): void {
    // Listen to throttling events for monitoring
    this.engine.on('throttlingApplied', (event) => {
      if (this.config.logThrottledRequests) {
        console.log(`Throttling applied: ${event.rule} - ${event.result.reason}`);
      }
    });

    this.engine.on('circuitBreakerOpened', (event) => {
      console.warn(`Circuit breaker opened: ${event.ruleId} after ${event.failureCount} failures`);
    });

    this.engine.on('circuitBreakerClosed', (event) => {
      console.info(`Circuit breaker closed: ${event.ruleId} - recovery successful`);
    });
  }
}

// ========================================
// Fastify Plugin
// ========================================

export function createAdaptiveThrottlingPlugin(
  rateLimitingService: RateLimitingService,
  config?: Partial<AdaptiveThrottlingConfig>,
  systemMonitor?: SystemMonitor
) {
  return async function adaptiveThrottlingPlugin(fastify: FastifyInstance) {
    const middleware = new AdaptiveThrottlingMiddleware(
      rateLimitingService,
      config,
      systemMonitor
    );

    // Add middleware as preHandler hook
    fastify.addHook('preHandler', middleware.createMiddleware());

    // Decorate Fastify instance with throttling methods
    fastify.decorate('adaptiveThrottling', middleware);

    // Add statistics endpoint
    fastify.get('/api/throttling/stats', async () => {
      return middleware.getStatistics();
    });

    // Add control endpoints
    fastify.post('/api/throttling/enable', async (request) => {
      const { enabled } = request.body as { enabled: boolean };
      middleware.setEnabled(enabled);
      return { success: true, enabled };
    });

    // Cleanup on server close
    fastify.addHook('onClose', async () => {
      middleware.cleanup();
    });
  };
}

// Type augmentation for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    adaptiveThrottling: AdaptiveThrottlingMiddleware;
  }
}

export default AdaptiveThrottlingMiddleware;