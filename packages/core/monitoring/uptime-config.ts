/**
 * Uptime Monitoring Configuration
 * Defines endpoints and services to monitor for Epic 1
 */

import { apm } from './APMService';
import { monitoring } from './MonitoringService';

/**
 * Initialize uptime monitoring for Epic 1
 */
export function initializeUptimeMonitoring(): void {
  // API endpoints
  apm.addUptimeCheck({
    id: 'api-health',
    name: 'API Health Check',
    url: 'http://localhost:8000/health',
    method: 'GET',
    interval: 30,
    timeout: 5,
    expectedStatus: [200],
  });
  
  apm.addUptimeCheck({
    id: 'api-preview',
    name: 'Preview Endpoint',
    url: 'http://localhost:8000/preview',
    method: 'POST',
    interval: 60,
    timeout: 10,
    expectedStatus: [200, 400], // 400 for invalid request is ok
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Frontend checks
  apm.addUptimeCheck({
    id: 'frontend-app',
    name: 'React App',
    url: 'http://localhost:3000',
    method: 'HEAD',
    interval: 60,
    timeout: 5,
    expectedStatus: [200],
  });
  
  // External dependencies (if any)
  if (process.env.NODE_ENV === 'production') {
    apm.addUptimeCheck({
      id: 'cdn-assets',
      name: 'CDN Assets',
      url: 'https://cdn.example.com/health',
      method: 'HEAD',
      interval: 300, // Check every 5 minutes
      timeout: 10,
      expectedStatus: [200, 304],
    });
  }
  
  // Database health (when implemented)
  // apm.addUptimeCheck({
  //   id: 'database',
  //   name: 'Database Connection',
  //   url: 'http://localhost:8000/api/db-health',
  //   method: 'GET',
  //   interval: 30,
  //   timeout: 5,
  //   expectedStatus: [200],
  // });
  
  // Set up alert thresholds for uptime
  monitoring.setThreshold('uptime.failure', 1, 3); // Warning at 1 failure, critical at 3
  
  // Register health checks with monitoring service
  monitoring.registerHealthCheck('api', async () => {
    try {
      const response = await fetch('http://localhost:8000/health');
      return response.ok;
    } catch {
      return false;
    }
  });
  
  monitoring.registerHealthCheck('frontend', async () => {
    try {
      const response = await fetch('http://localhost:3000', { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  });
  
  monitoring.registerHealthCheck('memory', async () => {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      const heapUsed = usage.heapUsed;
      const limit = 1024 * 1024 * 1024; // 1GB limit
      return heapUsed < limit;
    }
    return true;
  });
}

/**
 * Performance baseline configuration
 */
export function initializePerformanceBaselines(): void {
  // Critical user journey baselines
  
  // Graph creation performance
  monitoring.setThreshold('workflow.graph-creation.duration', 3000, 5000);
  
  // Inline editing responsiveness
  monitoring.setThreshold('workflow.inline-editing.duration', 500, 1000);
  
  // Preview generation
  monitoring.setThreshold('workflow.graph-execution.duration', 2000, 3000);
  
  // File operations
  monitoring.setThreshold('workflow.file-save.duration', 1500, 3000);
  
  // API response times
  monitoring.setThreshold('api.response.time', 200, 500);
  
  // Frontend metrics
  monitoring.setThreshold('page.load.time', 2000, 3000);
  monitoring.setThreshold('time.to.interactive', 3000, 5000);
  
  // Error thresholds
  monitoring.setThreshold('error.rate', 0.1, 1); // 0.1% warning, 1% critical
  monitoring.setThreshold('errors.total', 10, 50); // Per hour
  
  // Resource usage
  monitoring.setThreshold('memory.usage', 512 * 1024 * 1024, 768 * 1024 * 1024);
  monitoring.setThreshold('cpu.usage', 70, 90);
}

/**
 * Initialize Epic 1 specific metrics
 */
export function initializeEpic1Metrics(): void {
  // Inline editing metrics
  monitoring.setThreshold('inline.edit.start.time', 100, 200);
  monitoring.setThreshold('inline.edit.save.time', 500, 1000);
  monitoring.setThreshold('inline.edit.preview.update', 300, 500);
  
  // Node generation metrics
  monitoring.setThreshold('prompt.parse.time', 200, 500);
  monitoring.setThreshold('node.generation.time', 500, 1000);
  monitoring.setThreshold('graph.layout.time', 300, 600);
  
  // Feature flag metrics
  monitoring.setThreshold('feature.flag.evaluation.time', 10, 50);
  monitoring.setThreshold('feature.flag.error.rate', 0.01, 0.1);
  
  // Rollback metrics
  monitoring.setThreshold('rollback.execution.time', 30000, 60000); // 30s warning, 60s critical
  monitoring.setThreshold('rollback.verification.time', 5000, 10000);
}

/**
 * Start all monitoring systems
 */
export function startMonitoring(): void {
  console.log('🚀 Starting Epic 1 monitoring systems...');
  
  initializeUptimeMonitoring();
  initializePerformanceBaselines();
  initializeEpic1Metrics();
  
  // Log monitoring status
  console.log('✅ Uptime monitoring active');
  console.log('✅ Performance baselines configured');
  console.log('✅ Epic 1 metrics initialized');
  
  // Periodic health check
  setInterval(async () => {
    const health = await monitoring.checkHealth();
    if (health.status !== 'healthy') {
      console.warn('⚠️ System health degraded:', health);
    }
  }, 60000); // Check every minute
}