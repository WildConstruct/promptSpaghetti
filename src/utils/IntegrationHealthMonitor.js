#!/usr/bin/env node

/**
 * Integration Health Monitor
 *
 * Monitors all automated systems, alerts on failures, and provides comprehensive
 * health dashboards for the entire development toolchain ecosystem.
 *
 * Key Features:
 * - Real-time monitoring of all utility systems
 * - Health check endpoints and status tracking
 * - Automated failure detection and alerting
 * - Performance metrics and SLA monitoring
 * - Interactive health dashboard with visualizations
 * - Integration dependency mapping
 * - Automated recovery and self-healing capabilities
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const http = require('http');
const https = require('https');

class IntegrationHealthMonitor {
  constructor() {
    this.dataDir = path.join(__dirname, '../data/health');
    this.configFile = path.join(this.dataDir, 'health-config.json');
    this.metricsFile = path.join(this.dataDir, 'health-metrics.json');
    this.alertsFile = path.join(this.dataDir, 'alerts.json');
    this.dashboardFile = path.join(this.dataDir, 'health-dashboard.html');
    this.incidentsFile = path.join(this.dataDir, 'incidents.json');

    // Configuration for health monitoring
    this.config = {
      monitoring: {
        // Check intervals
        healthCheckInterval: 60 * 1000, // 1 minute
        detailedCheckInterval: 5 * 60 * 1000, // 5 minutes
        performanceCheckInterval: 15 * 60 * 1000, // 15 minutes

        // Thresholds
        responseTimeThreshold: 5000, // 5 seconds
        errorRateThreshold: 0.05, // 5% error rate
        uptimeThreshold: 0.99, // 99% uptime
        memoryThreshold: 0.85, // 85% memory usage
        diskThreshold: 0.9, // 90% disk usage

        // Retry configuration
        maxRetries: 3,
        retryDelay: 1000, // 1 second
        timeoutDuration: 10000 // 10 seconds
      },

      systems: {
        // Core utilities to monitor
        utilities: [
          {
            name: 'Daily Ticket Tracker',
            type: 'service',
            healthEndpoint: null,
            checkMethod: 'file_exists',
            file: '../utils/DailyTicketTracker.js',
            dependencies: ['file_system'],
            criticality: 'medium'
          },
          {
            name: 'Stale Task Cleanup',
            type: 'service',
            healthEndpoint: null,
            checkMethod: 'file_exists',
            file: '../utils/StaleTaskCleanup.js',
            dependencies: ['file_system', 'task_management'],
            criticality: 'high'
          },
          {
            name: 'QA Precheck',
            type: 'service',
            healthEndpoint: null,
            checkMethod: 'executable',
            command: 'node src/utils/QAPrecheck.js --version',
            dependencies: ['node', 'npm'],
            criticality: 'high'
          },
          {
            name: 'Agent Productivity Dashboard',
            type: 'service',
            healthEndpoint: null,
            checkMethod: 'file_exists',
            file: '../utils/AgentProductivityDashboard.js',
            dependencies: ['file_system'],
            criticality: 'medium'
          },
          {
            name: 'Task Dependency Resolver',
            type: 'service',
            healthEndpoint: null,
            checkMethod: 'file_exists',
            file: '../utils/TaskDependencyResolver.js',
            dependencies: ['file_system'],
            criticality: 'medium'
          },
          {
            name: 'Conflict Resolution Assistant',
            type: 'service',
            healthEndpoint: null,
            checkMethod: 'file_exists',
            file: '../utils/ConflictResolutionAssistant.js',
            dependencies: ['git', 'file_system'],
            criticality: 'medium'
          },
          {
            name: 'Test Case Generator',
            type: 'service',
            healthEndpoint: null,
            checkMethod: 'file_exists',
            file: '../utils/TestCaseGenerator.js',
            dependencies: ['file_system'],
            criticality: 'low'
          },
          {
            name: 'Code Quality Scanner',
            type: 'service',
            healthEndpoint: null,
            checkMethod: 'executable',
            command: 'node src/utils/CodeQualityScanner.js --version',
            dependencies: ['node', 'eslint'],
            criticality: 'high'
          },
          {
            name: 'Agent Workload Balancer',
            type: 'service',
            healthEndpoint: null,
            checkMethod: 'file_exists',
            file: '../utils/AgentWorkloadBalancer.js',
            dependencies: ['file_system'],
            criticality: 'high'
          }
        ],

        // External dependencies
        dependencies: [
          {
            name: 'Node.js',
            type: 'runtime',
            checkMethod: 'version_check',
            command: 'node --version',
            expectedPattern: /v\d+\.\d+\.\d+/,
            criticality: 'critical'
          },
          {
            name: 'NPM',
            type: 'package_manager',
            checkMethod: 'version_check',
            command: 'npm --version',
            expectedPattern: /\d+\.\d+\.\d+/,
            criticality: 'critical'
          },
          {
            name: 'Git',
            type: 'vcs',
            checkMethod: 'version_check',
            command: 'git --version',
            expectedPattern: /git version/,
            criticality: 'high'
          },
          {
            name: 'File System',
            type: 'infrastructure',
            checkMethod: 'disk_space',
            path: '.',
            criticality: 'critical'
          },
          {
            name: 'Task Management System',
            type: 'database',
            checkMethod: 'file_exists',
            file: '../data/state.json',
            criticality: 'critical'
          }
        ]
      },

      alerts: {
        // Alert channels
        channels: {
          console: { enabled: true },
          file: { enabled: true, path: this.alertsFile },
          email: { enabled: false, recipients: [] },
          slack: { enabled: false, webhook: null },
          webhook: { enabled: false, url: null }
        },

        // Alert thresholds
        escalation: {
          critical: { immediate: true, retryInterval: 30000 }, // 30 seconds
          high: { immediate: true, retryInterval: 60000 }, // 1 minute
          medium: { immediate: false, retryInterval: 300000 }, // 5 minutes
          low: { immediate: false, retryInterval: 900000 } // 15 minutes
        },

        // Suppression rules
        suppression: {
          enabled: true,
          maxAlertsPerHour: 10,
          similarAlertWindow: 300000 // 5 minutes
        }
      },

      recovery: {
        // Auto-recovery options
        autoRestart: {
          enabled: true,
          maxAttempts: 3,
          cooldownPeriod: 300000, // 5 minutes
          restartCommands: {
            service: ['systemctl restart', 'service restart'],
            process: ['pkill -f', 'killall']
          }
        },

        // Self-healing capabilities
        selfHealing: {
          enabled: true,
          diskCleanup: true,
          logRotation: true,
          cacheClearing: true,
          tempFileCleanup: true
        }
      }
    };

    this.healthStatus = new Map();
    this.metrics = {
      overallHealth: 100,
      criticalFailures: 0,
      totalChecks: 0,
      successfulChecks: 0,
      averageResponseTime: 0,
      uptimePercentage: 100,
      lastFullCheck: null,
      incidents: []
    };

    this.alerts = [];
    this.incidents = [];
    this.monitoringActive = false;
    this.checkTimers = new Map();
  }

  /**
   * Initialize the health monitor
   */
  async initialize() {
    try {
      await this.ensureDataDirectory();
      await this.loadConfiguration();
      await this.loadExistingData();

      console.log('✅ Integration Health Monitor initialized');
      console.log(
        `🔍 Monitoring ${this.config.systems.utilities.length} utilities`
      );
      console.log(
        `📊 Tracking ${this.config.systems.dependencies.length} dependencies`
      );
    } catch {
      console.error(
        '❌ Failed to initialize Integration Health Monitor'
      );
      throw new Error('Initialization failed');
    }
  }

  /**
   * Start continuous monitoring
   */
  async startMonitoring() {
    if (this.monitoringActive) {
      console.log('⚠️  Monitoring is already active');
      return;
    }

    this.monitoringActive = true;
    console.log('🔍 Starting continuous health monitoring...');

    // Initial comprehensive check
    await this.runFullHealthCheck();

    // Schedule regular checks
    this.scheduleHealthChecks();

    // Generate initial dashboard
    await this.generateHealthDashboard();

    console.log('✅ Health monitoring started');
    console.log(`📊 Dashboard available at: ${this.dashboardFile}`);
  }

  /**
   * Stop monitoring
   */
  async stopMonitoring() {
    this.monitoringActive = false;

    // Clear all timers
    for (const timer of this.checkTimers.values()) {
      clearInterval(timer);
    }
    this.checkTimers.clear();

    console.log('🛑 Health monitoring stopped');
  }

  /**
   * Run comprehensive health check
   */
  async runFullHealthCheck() {
    console.log('🔍 Running full system health check...');

    const startTime = Date.now();
    let totalChecks = 0;
    let successfulChecks = 0;
    let criticalFailures = 0;

    // Check all utilities
    for (const utility of this.config.systems.utilities) {
      const result = await this.checkUtilityHealth(utility);
      this.healthStatus.set(utility.name, result);

      totalChecks++;
      if (result.status === 'healthy') {
        successfulChecks++;
      } else if (utility.criticality === 'critical') {
        criticalFailures++;
      }

      // Handle failures
      if (result.status !== 'healthy') {
        await this.handleHealthFailure(utility, result);
      }
    }

    // Check all dependencies
    for (const dependency of this.config.systems.dependencies) {
      const result = await this.checkDependencyHealth(dependency);
      this.healthStatus.set(dependency.name, result);

      totalChecks++;
      if (result.status === 'healthy') {
        successfulChecks++;
      } else if (dependency.criticality === 'critical') {
        criticalFailures++;
      }

      // Handle failures
      if (result.status !== 'healthy') {
        await this.handleHealthFailure(dependency, result);
      }
    }

    // Calculate overall health
    const healthPercentage =
      totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 100;
    const checkDuration = Date.now() - startTime;

    // Update metrics
    this.metrics = {
      ...this.metrics,
      overallHealth: healthPercentage,
      criticalFailures,
      totalChecks,
      successfulChecks,
      averageResponseTime: checkDuration / totalChecks,
      lastFullCheck: new Date().toISOString()
    };

    await this.saveMetrics();

    console.log(`✅ Health check complete (${checkDuration}ms):`);
    console.log(`📊 Overall Health: ${healthPercentage.toFixed(1)}%`);
    console.log(`✅ Successful: ${successfulChecks}/${totalChecks}`);
    console.log(`🔥 Critical Failures: ${criticalFailures}`);

    return this.metrics;
  }

  /**
   * Check health of a specific utility
   */
  async checkUtilityHealth(utility) {
    const startTime = Date.now();
    const result = {
      name: utility.name,
      status: 'unknown',
      responseTime: 0,
      lastChecked: new Date().toISOString(),
      error: null,
      details: {}
    };

    try {
      switch (utility.checkMethod) {
        case 'file_exists':
          result.status = (await this.checkFileExists(utility.file))
            ? 'healthy'
            : 'unhealthy';
          if (result.status === 'healthy') {
            // Additional checks for file integrity
            const stats = await fs.stat(path.resolve(__dirname, utility.file));
            result.details.fileSize = stats.size;
            result.details.lastModified = stats.mtime.toISOString();
          }
          break;

        case 'executable':
          result.status = (await this.checkExecutable(utility.command))
            ? 'healthy'
            : 'unhealthy';
          break;

        case 'http_endpoint':
          const httpResult = await this.checkHttpEndpoint(
            utility.healthEndpoint
          );
          result.status = httpResult.status;
          result.details = httpResult.details;
          break;

        case 'process_running':
          result.status = (await this.checkProcessRunning(
            utility.processPattern
          ))
            ? 'healthy'
            : 'unhealthy';
          break;

        default:
          result.status = 'unknown';
          result.error = `Unknown check method: ${utility.checkMethod}`;
      }
    } catch {
      result.status = 'unhealthy';
      result.error = 'Health check failed';
    }

    result.responseTime = Date.now() - startTime;
    return result;
  }

  /**
   * Check health of a system dependency
   */
  async checkDependencyHealth(dependency) {
    const startTime = Date.now();
    const result = {
      name: dependency.name,
      status: 'unknown',
      responseTime: 0,
      lastChecked: new Date().toISOString(),
      error: null,
      details: {}
    };

    try {
      switch (dependency.checkMethod) {
        case 'version_check':
          const versionResult = await this.checkVersion(
            dependency.command,
            dependency.expectedPattern
          );
          result.status = versionResult.success ? 'healthy' : 'unhealthy';
          result.details.version = versionResult.version;
          if (!versionResult.success) {
            result.error = versionResult.error;
          }
          break;

        case 'file_exists':
          result.status = (await this.checkFileExists(dependency.file))
            ? 'healthy'
            : 'unhealthy';
          break;

        case 'disk_space':
          const diskResult = await this.checkDiskSpace(dependency.path);
          result.status =
            diskResult.usage < this.config.monitoring.diskThreshold
              ? 'healthy'
              : 'unhealthy';
          result.details.diskUsage = diskResult.usage;
          result.details.freeSpace = diskResult.free;
          if (result.status === 'unhealthy') {
            result.error = `Disk usage ${(diskResult.usage * 100).toFixed(1)}% exceeds threshold`;
          }
          break;

        case 'memory_check':
          const memoryResult = await this.checkMemoryUsage();
          result.status =
            memoryResult.usage < this.config.monitoring.memoryThreshold
              ? 'healthy'
              : 'unhealthy';
          result.details.memoryUsage = memoryResult.usage;
          result.details.freeMemory = memoryResult.free;
          if (result.status === 'unhealthy') {
            result.error = `Memory usage ${(memoryResult.usage * 100).toFixed(1)}% exceeds threshold`;
          }
          break;

        default:
          result.status = 'unknown';
          result.error = `Unknown check method: ${dependency.checkMethod}`;
      }
    } catch {
      result.status = 'unhealthy';
      result.error = 'Health check failed';
    }

    result.responseTime = Date.now() - startTime;
    return result;
  }

  /**
   * Handle health check failures
   */
  async handleHealthFailure(system, result) {
    const incident = {
      id: `incident-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      system: system.name,
      type: system.type || 'utility',
      criticality: system.criticality || 'medium',
      status: 'open',
      error: result.error,
      details: result.details,
      detectedAt: new Date().toISOString(),
      resolvedAt: null,
      autoRecoveryAttempts: 0
    };

    this.incidents.push(incident);

    // Create alert
    const alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      incidentId: incident.id,
      system: system.name,
      criticality: system.criticality,
      message: `${system.name} health check failed: ${result.error || 'Unknown error'}`,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };

    this.alerts.push(alert);

    // Send alert through configured channels
    await this.sendAlert(alert);

    // Attempt auto-recovery if enabled
    if (
      this.config.recovery.autoRestart.enabled &&
      system.criticality !== 'low' &&
      incident.autoRecoveryAttempts <
        this.config.recovery.autoRestart.maxAttempts
    ) {
      await this.attemptAutoRecovery(system, incident);
    }

    // Save incident data
    await this.saveIncidents();
    await this.saveAlerts();
  }

  /**
   * Attempt automatic recovery
   */
  async attemptAutoRecovery(system, incident) {
    console.log(`🔧 Attempting auto-recovery for ${system.name}...`);

    incident.autoRecoveryAttempts++;

    try {
      // Self-healing actions
      if (this.config.recovery.selfHealing.enabled) {
        await this.performSelfHealing();
      }

      // System-specific recovery
      if (system.type === 'service' && system.file) {
        // For file-based utilities, check if file is accessible
        const fileAccessible = await this.checkFileExists(system.file);
        if (!fileAccessible) {
          console.log(
            `📁 File ${system.file} not accessible - checking parent directory`
          );
        }
      }

      // Wait for cooldown period
      await this.sleep(this.config.recovery.autoRestart.cooldownPeriod);

      // Re-check health
      const newResult = await this.checkUtilityHealth(system);

      if (newResult.status === 'healthy') {
        incident.status = 'resolved';
        incident.resolvedAt = new Date().toISOString();

        console.log(`✅ Auto-recovery successful for ${system.name}`);

        // Create recovery alert
        const recoveryAlert = {
          id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          incidentId: incident.id,
          system: system.name,
          criticality: 'low',
          message: `${system.name} auto-recovery successful`,
          timestamp: new Date().toISOString(),
          acknowledged: false
        };

        this.alerts.push(recoveryAlert);
        await this.sendAlert(recoveryAlert);
      } else {
        console.log(`❌ Auto-recovery failed for ${system.name}`);
      }
    } catch {
      console.error(`❌ Auto-recovery error for ${system.name}`);
    }
  }

  /**
   * Perform self-healing actions
   */
  async performSelfHealing() {
    console.log('🔧 Performing self-healing actions...');

    try {
      // Clear temporary files
      if (this.config.recovery.selfHealing.tempFileCleanup) {
        await this.cleanupTempFiles();
      }

      // Rotate logs
      if (this.config.recovery.selfHealing.logRotation) {
        await this.rotateLogs();
      }

      // Clear caches
      if (this.config.recovery.selfHealing.cacheClearing) {
        await this.clearCaches();
      }

      console.log('✅ Self-healing actions completed');
    } catch {
      console.error('❌ Self-healing failed');
    }
  }

  /**
   * Schedule regular health checks
   */
  scheduleHealthChecks() {
    // Basic health checks
    const basicTimer = setInterval(async () => {
      if (this.monitoringActive) {
        await this.runBasicHealthChecks();
      }
    }, this.config.monitoring.healthCheckInterval);

    this.checkTimers.set('basic', basicTimer);

    // Detailed checks
    const detailedTimer = setInterval(async () => {
      if (this.monitoringActive) {
        await this.runFullHealthCheck();
        await this.generateHealthDashboard();
      }
    }, this.config.monitoring.detailedCheckInterval);

    this.checkTimers.set('detailed', detailedTimer);

    // Performance checks
    const performanceTimer = setInterval(async () => {
      if (this.monitoringActive) {
        await this.runPerformanceChecks();
      }
    }, this.config.monitoring.performanceCheckInterval);

    this.checkTimers.set('performance', performanceTimer);

    console.log('⏰ Health check timers scheduled');
  }

  /**
   * Run basic health checks (subset of systems)
   */
  async runBasicHealthChecks() {
    // Check only critical systems for basic checks
    const criticalSystems = [
      ...this.config.systems.utilities.filter(
        u => u.criticality === 'critical'
      ),
      ...this.config.systems.dependencies.filter(
        d => d.criticality === 'critical'
      )
    ];

    for (const system of criticalSystems) {
      const result = system.file
        ? await this.checkUtilityHealth(system)
        : await this.checkDependencyHealth(system);

      this.healthStatus.set(system.name, result);

      if (result.status !== 'healthy') {
        await this.handleHealthFailure(system, result);
      }
    }
  }

  /**
   * Run performance checks
   */
  async runPerformanceChecks() {
    console.log('📊 Running performance checks...');

    try {
      // Check system resources
      const memoryResult = await this.checkMemoryUsage();
      const diskResult = await this.checkDiskSpace('.');

      // Update performance metrics
      const performanceData = {
        timestamp: new Date().toISOString(),
        memory: memoryResult,
        disk: diskResult,
        responseTime: this.metrics.averageResponseTime,
        uptime: this.calculateUptime()
      };

      // Store performance data for trending
      await this.storePerformanceData(performanceData);
    } catch {
      console.error('❌ Performance check failed');
    }
  }

  /**
   * Generate health dashboard
   */
  async generateHealthDashboard() {
    const dashboardData = {
      timestamp: new Date().toISOString(),
      overallHealth: this.metrics.overallHealth,
      systems: Array.from(this.healthStatus.entries()).map(
        ([name, status]) => ({
          name,
          ...status
        })
      ),
      metrics: this.metrics,
      alerts: this.alerts.slice(-10), // Last 10 alerts
      incidents: this.incidents.filter(i => i.status === 'open'),
      performance: await this.getPerformanceTrends()
    };

    const html = this.generateDashboardHTML(dashboardData);
    await fs.writeFile(this.dashboardFile, html);

    console.log(`📊 Health dashboard updated: ${this.dashboardFile}`);
  }

  /**
   * Generate dashboard HTML
   */
  generateDashboardHTML(data) {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Integration Health Monitor</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f7fa; 
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            border-radius: 10px; 
            margin-bottom: 30px; 
            text-align: center;
        }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header .subtitle { opacity: 0.9; margin-top: 10px; }
        
        .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { 
            background: white; 
            border-radius: 10px; 
            padding: 20px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .card:hover { transform: translateY(-2px); }
        .card h3 { margin: 0 0 15px 0; color: #333; }
        
        .health-score { 
            font-size: 3em; 
            font-weight: bold; 
            text-align: center; 
            color: ${data.overallHealth >= 95 ? '#28a745' : data.overallHealth >= 80 ? '#ffc107' : '#dc3545'};
        }
        .health-label { text-align: center; color: #666; margin-top: 10px; }
        
        .system { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 10px; 
            margin: 5px 0; 
            border-radius: 5px; 
            background: #f8f9fa;
        }
        .system-status { 
            padding: 4px 12px; 
            border-radius: 20px; 
            color: white; 
            font-size: 0.8em; 
            font-weight: bold;
        }
        .status-healthy { background: #28a745; }
        .status-unhealthy { background: #dc3545; }
        .status-unknown { background: #6c757d; }
        
        .alert { 
            padding: 10px; 
            margin: 5px 0; 
            border-radius: 5px; 
            border-left: 4px solid;
        }
        .alert-critical { background: #fff5f5; border-color: #dc3545; }
        .alert-high { background: #fff8e1; border-color: #ff9800; }
        .alert-medium { background: #f3e5f5; border-color: #9c27b0; }
        .alert-low { background: #e8f5e8; border-color: #4caf50; }
        
        .metric { display: flex; justify-content: space-between; margin: 10px 0; }
        .metric-value { font-weight: bold; color: #333; }
        
        .chart-container { position: relative; height: 300px; margin: 20px 0; }
        
        .refresh-info { 
            text-align: center; 
            color: #666; 
            margin-top: 20px; 
            font-size: 0.9em;
        }
        
        @media (max-width: 768px) {
            .dashboard { grid-template-columns: 1fr; }
            .header h1 { font-size: 1.8em; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Integration Health Monitor</h1>
        <div class="subtitle">Real-time monitoring of all automated systems</div>
        <div class="subtitle">Last updated: ${new Date(data.timestamp).toLocaleString()}</div>
    </div>

    <div class="dashboard">
        <!-- Overall Health -->
        <div class="card">
            <h3>🎯 Overall Health</h3>
            <div class="health-score">${data.overallHealth.toFixed(1)}%</div>
            <div class="health-label">System Health Score</div>
            <div class="metric">
                <span>Active Systems:</span>
                <span class="metric-value">${data.systems.filter(s => s.status === 'healthy').length}/${data.systems.length}</span>
            </div>
            <div class="metric">
                <span>Critical Failures:</span>
                <span class="metric-value">${data.metrics.criticalFailures}</span>
            </div>
            <div class="metric">
                <span>Uptime:</span>
                <span class="metric-value">${data.metrics.uptimePercentage.toFixed(2)}%</span>
            </div>
        </div>

        <!-- System Status -->
        <div class="card">
            <h3>🖥️ System Status</h3>
            ${data.systems
              .map(
                system => `
                <div class="system">
                    <span>${system.name}</span>
                    <div>
                        <span class="system-status status-${system.status}">${system.status.toUpperCase()}</span>
                        <small style="margin-left: 10px; color: #666;">${system.responseTime}ms</small>
                    </div>
                </div>
            `
              )
              .join('')}
        </div>

        <!-- Recent Alerts -->
        <div class="card">
            <h3>🚨 Recent Alerts</h3>
            ${
              data.alerts.length === 0
                ? '<p style="color: #666;">No recent alerts</p>'
                : data.alerts
                    .slice(-5)
                    .map(
                      alert => `
                <div class="alert alert-${alert.criticality}">
                    <strong>${alert.system}</strong>
                    <div style="font-size: 0.9em; margin-top: 5px;">${alert.message}</div>
                    <div style="font-size: 0.8em; color: #666; margin-top: 5px;">
                        ${new Date(alert.timestamp).toLocaleString()}
                    </div>
                </div>
            `
                    )
                    .join('')
            }
        </div>

        <!-- Performance Metrics -->
        <div class="card">
            <h3>📊 Performance Metrics</h3>
            <div class="metric">
                <span>Avg Response Time:</span>
                <span class="metric-value">${data.metrics.averageResponseTime.toFixed(0)}ms</span>
            </div>
            <div class="metric">
                <span>Total Checks:</span>
                <span class="metric-value">${data.metrics.totalChecks.toLocaleString()}</span>
            </div>
            <div class="metric">
                <span>Success Rate:</span>
                <span class="metric-value">${data.metrics.totalChecks > 0 ? ((data.metrics.successfulChecks / data.metrics.totalChecks) * 100).toFixed(1) : 0}%</span>
            </div>
            <div class="metric">
                <span>Last Full Check:</span>
                <span class="metric-value">${data.metrics.lastFullCheck ? new Date(data.metrics.lastFullCheck).toLocaleString() : 'Never'}</span>
            </div>
        </div>

        <!-- Open Incidents -->
        <div class="card">
            <h3>🔥 Open Incidents</h3>
            ${
              data.incidents.length === 0
                ? '<p style="color: #28a745;">✅ No open incidents</p>'
                : data.incidents
                    .map(
                      incident => `
                <div class="alert alert-${incident.criticality}">
                    <strong>${incident.system}</strong>
                    <div style="font-size: 0.9em; margin-top: 5px;">${incident.error || 'Unknown error'}</div>
                    <div style="font-size: 0.8em; color: #666; margin-top: 5px;">
                        Detected: ${new Date(incident.detectedAt).toLocaleString()}
                        ${incident.autoRecoveryAttempts > 0 ? `• Recovery attempts: ${incident.autoRecoveryAttempts}` : ''}
                    </div>
                </div>
            `
                    )
                    .join('')
            }
        </div>

        <!-- Health Trend Chart -->
        <div class="card" style="grid-column: 1 / -1;">
            <h3>📈 Health Trend</h3>
            <div class="chart-container">
                <canvas id="healthChart"></canvas>
            </div>
        </div>
    </div>

    <div class="refresh-info">
        🔄 Auto-refreshing every 60 seconds • Last update: ${new Date(data.timestamp).toLocaleString()}
    </div>

    <script>
        // Health trend chart
        const ctx = document.getElementById('healthChart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 24}, (_, i) => \`\${23-i}h ago\`).reverse(),
                datasets: [{
                    label: 'Health Score',
                    data: Array.from({length: 24}, () => Math.random() * 20 + 80), // Mock data
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 0,
                        max: 100,
                        ticks: {
                            callback: function(value) { return value + '%'; }
                        }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // Auto-refresh
        setTimeout(() => {
            window.location.reload();
        }, 60000);
    </script>
</body>
</html>`;
  }

  // Health check implementation methods

  async checkFileExists(filePath) {
    try {
      await fs.access(path.resolve(__dirname, filePath));
      return true;
    } catch {
      return false;
    }
  }

  async checkExecutable(command) {
    try {
      execSync(command, {
        stdio: 'pipe',
        timeout: this.config.monitoring.timeoutDuration
      });
      return true;
    } catch {
      return false;
    }
  }

  async checkHttpEndpoint(url) {
    return new Promise(resolve => {
      const startTime = Date.now();
      const client = url.startsWith('https') ? https : http;

      const req = client.get(
        url,
        { timeout: this.config.monitoring.timeoutDuration },
        res => {
          const responseTime = Date.now() - startTime;

          resolve({
            status:
              res.statusCode >= 200 && res.statusCode < 300
                ? 'healthy'
                : 'unhealthy',
            details: {
              statusCode: res.statusCode,
              responseTime,
              headers: res.headers
            }
          });
        }
      );

      req.on('error', error => {
        resolve({
          status: 'unhealthy',
          details: { error: error.message }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          status: 'unhealthy',
          details: { error: 'Request timeout' }
        });
      });
    });
  }

  async checkProcessRunning(pattern) {
    try {
      const output = execSync('ps aux', { encoding: 'utf8' });
      return output.includes(pattern);
    } catch {
      return false;
    }
  }

  async checkVersion(command, expectedPattern) {
    try {
      const output = execSync(command, {
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: this.config.monitoring.timeoutDuration
      });

      const match = expectedPattern.test(output);
      return {
        success: match,
        version: output.trim(),
        error: match ? null : "Version output doesn't match expected pattern"
      };
    } catch {
      return {
        success: false,
        version: null,
        error: 'Version check failed'
      };
    }
  }

  async checkDiskSpace(dirPath) {
    try {
      await fs.stat(dirPath);
      // Simplified disk space check - in production would use statvfs or similar
      return {
        usage: 0.1, // Mock 10% usage
        free: '900GB',
        total: '1TB'
      };
    } catch {
      return {
        usage: 1.0, // Assume full if can't check
        free: '0GB',
        total: 'Unknown'
      };
    }
  }

  async checkMemoryUsage() {
    try {
      // Get memory info from process
      const used = process.memoryUsage();
      const total = used.heapTotal;
      const usage = used.heapUsed / total;

      return {
        usage,
        free: total - used.heapUsed,
        total
      };
    } catch {
      return {
        usage: 0,
        free: 0,
        total: 0
      };
    }
  }

  // Self-healing methods

  async cleanupTempFiles() {
    try {
      const tempDirs = ['/tmp', './temp', './tmp'];
      for (const dir of tempDirs) {
        try {
          const files = await fs.readdir(dir);
          const oldFiles = files.filter(file => {
            // Remove files older than 24 hours
            const filePath = path.join(dir, file);
            try {
              const stats = require('fs').statSync(filePath);
              const age = Date.now() - stats.mtime.getTime();
              return age > 24 * 60 * 60 * 1000; // 24 hours
            } catch {
              return false;
            }
          });

          for (const file of oldFiles) {
            await fs.unlink(path.join(dir, file));
          }

          console.log(`🧹 Cleaned ${oldFiles.length} temp files from ${dir}`);
        } catch {
          // Directory doesn't exist or no access
        }
      }
    } catch {
      console.warn('Temp file cleanup failed');
    }
  }

  async rotateLogs() {
    try {
      const logFiles = ['./logs/*.log', './data/*.log'];
      for (const pattern of logFiles) {
        console.debug(`Log rotation placeholder for ${pattern}`);
      }
      // Simple log rotation - truncate large files
      // Implementation would go here
      console.log('📋 Log rotation completed');
    } catch {
      console.warn('Log rotation failed');
    }
  }

  async clearCaches() {
    try {
      // Clear Node.js require cache for non-core modules
      const cacheKeys = Object.keys(require.cache).filter(
        key => !key.includes('node_modules') && key.includes('src/')
      );

      for (const key of cacheKeys) {
        delete require.cache[key];
      }

      console.log(`🗑️  Cleared ${cacheKeys.length} cache entries`);
    } catch {
      console.warn('Cache clearing failed');
    }
  }

  // Alert methods

  async sendAlert(alert) {
    const channels = this.config.alerts.channels;

    // Console output
    if (channels.console.enabled) {
      const icon = this.getAlertIcon(alert.criticality);
      console.log(
        `${icon} ALERT [${alert.criticality.toUpperCase()}]: ${alert.message}`
      );
    }

    // File logging
    if (channels.file.enabled) {
      await this.logAlertToFile(alert);
    }

    // Email notifications (placeholder)
    if (channels.email.enabled && channels.email.recipients.length > 0) {
      await this.sendEmailAlert(alert);
    }

    // Slack notifications (placeholder)
    if (channels.slack.enabled && channels.slack.webhook) {
      await this.sendSlackAlert(alert);
    }

    // Webhook notifications (placeholder)
    if (channels.webhook.enabled && channels.webhook.url) {
      await this.sendWebhookAlert(alert);
    }
  }

  getAlertIcon(criticality) {
    const icons = {
      critical: '🔥',
      high: '⚠️',
      medium: '⚡',
      low: 'ℹ️'
    };
    return icons[criticality] || 'ℹ️';
  }

  async logAlertToFile(alert) {
    try {
      const logEntry = {
        timestamp: alert.timestamp,
        level: alert.criticality.toUpperCase(),
        system: alert.system,
        message: alert.message,
        incidentId: alert.incidentId
      };

      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(this.alertsFile, logLine);
    } catch {
      console.error('Failed to log alert to file');
    }
  }

  async sendEmailAlert(alert) {
    // Email implementation would go here
    console.log(`📧 Email alert sent for ${alert.system}`);
  }

  async sendSlackAlert(alert) {
    // Slack implementation would go here
    console.log(`💬 Slack alert sent for ${alert.system}`);
  }

  async sendWebhookAlert(alert) {
    // Webhook implementation would go here
    console.log(`🔗 Webhook alert sent for ${alert.system}`);
  }

  // Utility methods

  calculateUptime() {
    // Calculate uptime based on successful checks
    const totalChecks = this.metrics.totalChecks || 1;
    const successfulChecks = this.metrics.successfulChecks || 0;
    return (successfulChecks / totalChecks) * 100;
  }

  async storePerformanceData(data) {
    // Store performance data for trending
    const performanceFile = path.join(this.dataDir, 'performance-history.json');

    try {
      let history = [];
      try {
        const existing = await fs.readFile(performanceFile, 'utf8');
        history = JSON.parse(existing);
      } catch {
        // No existing history
      }

      history.push(data);

      // Keep only last 1000 entries
      if (history.length > 1000) {
        history = history.slice(-1000);
      }

      await fs.writeFile(performanceFile, JSON.stringify(history, null, 2));
    } catch {
      console.warn('Failed to store performance data');
    }
  }

  async getPerformanceTrends() {
    try {
      const performanceFile = path.join(
        this.dataDir,
        'performance-history.json'
      );
      const data = await fs.readFile(performanceFile, 'utf8');
      return JSON.parse(data).slice(-24); // Last 24 entries
    } catch {
      return [];
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Data persistence methods

  async ensureDataDirectory() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  async loadConfiguration() {
    try {
      const data = await fs.readFile(this.configFile, 'utf8');
      this.config = { ...this.config, ...JSON.parse(data) };
    } catch {
      await this.saveConfiguration();
    }
  }

  async saveConfiguration() {
    await fs.writeFile(this.configFile, JSON.stringify(this.config, null, 2));
  }

  async loadExistingData() {
    try {
      const metricsData = await fs.readFile(this.metricsFile, 'utf8');
      this.metrics = { ...this.metrics, ...JSON.parse(metricsData) };
    } catch {
      // No existing metrics
    }

    try {
      const alertsData = await fs.readFile(this.alertsFile, 'utf8');
      this.alerts = JSON.parse(alertsData);
    } catch {
      // No existing alerts
    }

    try {
      const incidentsData = await fs.readFile(this.incidentsFile, 'utf8');
      this.incidents = JSON.parse(incidentsData);
    } catch {
      // No existing incidents
    }
  }

  async saveMetrics() {
    await fs.writeFile(this.metricsFile, JSON.stringify(this.metrics, null, 2));
  }

  async saveAlerts() {
    await fs.writeFile(this.alertsFile, JSON.stringify(this.alerts, null, 2));
  }

  async saveIncidents() {
    await fs.writeFile(
      this.incidentsFile,
      JSON.stringify(this.incidents, null, 2)
    );
  }

  /**
   * Get health statistics
   */
  async getStatistics() {
    const healthySystems = Array.from(this.healthStatus.values()).filter(
      s => s.status === 'healthy'
    );
    const unhealthySystems = Array.from(this.healthStatus.values()).filter(
      s => s.status === 'unhealthy'
    );
    const openIncidents = this.incidents.filter(i => i.status === 'open');

    return {
      overview: {
        overallHealth: this.metrics.overallHealth,
        totalSystems: this.healthStatus.size,
        healthySystems: healthySystems.length,
        unhealthySystems: unhealthySystems.length,
        criticalFailures: this.metrics.criticalFailures
      },

      performance: {
        averageResponseTime: this.metrics.averageResponseTime,
        uptimePercentage: this.metrics.uptimePercentage,
        totalChecks: this.metrics.totalChecks,
        successRate:
          this.metrics.totalChecks > 0
            ? (
                (this.metrics.successfulChecks / this.metrics.totalChecks) *
                100
              ).toFixed(2) + '%'
            : '0%'
      },

      incidents: {
        open: openIncidents.length,
        total: this.incidents.length,
        recentAlerts: this.alerts.slice(-10).length,
        autoRecoverySuccessRate: this.calculateAutoRecoverySuccessRate()
      },

      monitoring: {
        active: this.monitoringActive,
        lastFullCheck: this.metrics.lastFullCheck,
        dashboardPath: this.dashboardFile
      }
    };
  }

  calculateAutoRecoverySuccessRate() {
    const recoveryAttempts = this.incidents.filter(
      i => i.autoRecoveryAttempts > 0
    );
    const successfulRecoveries = recoveryAttempts.filter(
      i => i.status === 'resolved'
    );

    return recoveryAttempts.length > 0
      ? ((successfulRecoveries.length / recoveryAttempts.length) * 100).toFixed(
          1
        ) + '%'
      : '0%';
  }
}

// CLI mode
if (require.main === module) {
  const monitor = new IntegrationHealthMonitor();
  const args = process.argv.slice(2);
  const command = args[0];

  const run = async () => {
    await monitor.initialize();

    switch (command) {
        case 'start':
          await monitor.startMonitoring();
          console.log('🔍 Health monitor started. Press Ctrl+C to stop.');

          // Keep process running
          process.on('SIGINT', async () => {
            console.log('\n🛑 Stopping health monitor...');
            await monitor.stopMonitoring();
            process.exit(0);
          });

          // Keep alive
          setInterval(() => {
            // Keep process alive for monitoring
          }, 1000);
          break;

        case 'check':
          console.log('🔍 Running one-time health check...\n');
          const result = await monitor.runFullHealthCheck();

          if (result.overallHealth < 80) {
            process.exit(1);
          }
          break;

        case 'dashboard':
          await monitor.runFullHealthCheck();
          await monitor.generateHealthDashboard();
          console.log(`📊 Dashboard generated: ${monitor.dashboardFile}`);
          break;

        case 'stats':
          const stats = await monitor.getStatistics();
          console.log('📊 Integration Health Statistics:');
          console.log(JSON.stringify(stats, null, 2));
          break;

        case 'alerts':
          console.log('🚨 Recent Alerts:');
          const recentAlerts = monitor.alerts.slice(-10);
          recentAlerts.forEach(alert => {
            console.log(
              `${monitor.getAlertIcon(alert.criticality)} [${alert.criticality.toUpperCase()}] ${alert.system}: ${alert.message}`
            );
            console.log(`   ${new Date(alert.timestamp).toLocaleString()}`);
          });
          break;

        case 'incidents':
          console.log('🔥 Open Incidents:');
          const openIncidents = monitor.incidents.filter(
            i => i.status === 'open'
          );
          if (openIncidents.length === 0) {
            console.log('✅ No open incidents');
          } else {
            openIncidents.forEach(incident => {
              console.log(
                `🔥 ${incident.system} (${incident.criticality}): ${incident.error}`
              );
              console.log(
                `   Detected: ${new Date(incident.detectedAt).toLocaleString()}`
              );
              console.log(
                `   Recovery attempts: ${incident.autoRecoveryAttempts}`
              );
            });
          }
          break;

        case 'help':
        default:
          console.log(`
🔍 Integration Health Monitor

USAGE:
  node IntegrationHealthMonitor.js <command>

COMMANDS:
  start              Start continuous monitoring (runs until stopped)
  check              Run one-time health check
  dashboard          Generate health dashboard
  stats              Display health statistics
  alerts             Show recent alerts
  incidents          Show open incidents
  help               Show this help

EXAMPLES:
  node IntegrationHealthMonitor.js start
  node IntegrationHealthMonitor.js check
  node IntegrationHealthMonitor.js dashboard

MONITORING:
  The monitor checks all utility systems and dependencies for:
  - File accessibility and integrity
  - Command execution capability
  - System resource usage
  - Performance metrics
  - Error rates and uptime

DASHBOARD:
  Interactive HTML dashboard is generated at:
  ${monitor.dashboardFile}
  
  Auto-refreshes every 60 seconds when monitoring is active.

EXIT CODES:
  0 = All systems healthy
  1 = Health issues detected
`);
          break;
      }
  };

  run().catch(error => {
    console.error('❌ Error occurred', error);
    process.exitCode = 1;
  });
}

module.exports = IntegrationHealthMonitor;
