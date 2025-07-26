#!/usr/bin/env node

/**
 * Advanced Code Quality Monitoring Dashboard
 * 
 * Real-time dashboard that monitors code quality metrics, trends, and
 * provides actionable insights for development teams.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

class QualityMonitoringDashboard {
  constructor() {
    this.port = 3001;
    this.dataDir = 'quality-monitoring-data';
    this.server = null;
    this.metrics = {
      quality: {},
      security: {},
      performance: {},
      trends: {},
      alerts: []
    };
    
    this.refreshInterval = 30000; // 30 seconds
    this.monitoringActive = false;
  }

  log(message, color = 'reset') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
  }

  async startDashboard() {
    this.log('🚀 Starting Quality Monitoring Dashboard...', 'cyan');
    
    await this.initializeDataDirectory();
    await this.startWebServer();
    await this.startMonitoring();
    
    this.log(`📊 Dashboard available at http://localhost:${this.port}`, 'green');
    this.log('Press Ctrl+C to stop monitoring', 'yellow');
  }

  async initializeDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      this.log('Created monitoring data directory', 'success');
    }
  }

  async startWebServer() {
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    return new Promise((resolve) => {
      server.listen(this.port, () => {
        this.server = server;
        this.log(`Web server started on port ${this.port}`, 'green');
        resolve();
      });
    });
  }

  handleRequest(req, res) {
    const url = req.url;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (url === '/' || url === '/dashboard') {
      this.serveDashboardHTML(res);
    } else if (url === '/api/metrics') {
      this.serveMetrics(res);
    } else if (url === '/api/alerts') {
      this.serveAlerts(res);
    } else if (url === '/api/trends') {
      this.serveTrends(res);
    } else if (url.startsWith('/api/history/')) {
      this.serveHistoricalData(req, res);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  }

  serveDashboardHTML(res) {
    const html = this.generateDashboardHTML();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  serveMetrics(res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(this.metrics, null, 2));
  }

  serveAlerts(res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(this.metrics.alerts, null, 2));
  }

  serveTrends(res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(this.metrics.trends, null, 2));
  }

  serveHistoricalData(req, res) {
    const metric = req.url.split('/')[3];
    const historicalData = this.loadHistoricalData(metric);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(historicalData, null, 2));
  }

  async startMonitoring() {
    this.monitoringActive = true;
    await this.collectInitialMetrics();
    
    const monitoringLoop = async () => {
      if (!this.monitoringActive) return;
      
      try {
        await this.updateMetrics();
        await this.checkAlerts();
        await this.saveMetricsSnapshot();
      } catch (error) {
        this.log(`Monitoring error: ${error.message}`, 'red');
      }
      
      setTimeout(monitoringLoop, this.refreshInterval);
    };
    
    monitoringLoop();
  }

  async collectInitialMetrics() {
    this.log('📊 Collecting initial metrics...', 'blue');
    
    await this.updateQualityMetrics();
    await this.updateSecurityMetrics();
    await this.updatePerformanceMetrics();
    await this.calculateTrends();
    
    this.log('Initial metrics collection completed', 'green');
  }

  async updateMetrics() {
    this.log('🔄 Updating metrics...', 'blue');
    
    await Promise.all([
      this.updateQualityMetrics(),
      this.updateSecurityMetrics(), 
      this.updatePerformanceMetrics()
    ]);
    
    await this.calculateTrends();
  }

  async updateQualityMetrics() {
    try {
      // Run quality improvement tests
      const { runQualityTests } = require('../client/src/utils/__tests__/testRunner.js');
      const report = await runQualityTests();
      
      this.metrics.quality = {
        totalTests: report.totalTests,
        passedTests: report.passedTests,
        failedTests: report.failedTests,
        coverage: report.coverage,
        categories: report.categories,
        overallHealth: this.calculateQualityHealth(report),
        lastUpdated: new Date().toISOString()
      };
      
      // Check for quality regressions
      if (report.failedTests > 0) {
        this.addAlert('quality', 'Quality tests failing', 'warning');
      }
      
    } catch (error) {
      this.metrics.quality = {
        error: error.message,
        lastUpdated: new Date().toISOString()
      };
      this.addAlert('quality', 'Quality metrics collection failed', 'error');
    }
  }

  async updateSecurityMetrics() {
    try {
      // Run security scanner
      const { SecurityScanner } = require('./security-scanner.js');
      const scanner = new SecurityScanner();
      const report = await scanner.runComprehensiveScan();
      
      this.metrics.security = {
        vulnerabilities: report.summary.total,
        critical: report.summary.critical,
        high: report.summary.high,
        medium: report.summary.medium,
        low: report.summary.low,
        securityHealth: this.calculateSecurityHealth(report.summary),
        lastUpdated: new Date().toISOString()
      };
      
      // Check for critical security issues
      if (report.summary.critical > 0) {
        this.addAlert('security', `${report.summary.critical} critical vulnerabilities found`, 'critical');
      } else if (report.summary.high > 0) {
        this.addAlert('security', `${report.summary.high} high severity vulnerabilities found`, 'warning');
      }
      
    } catch (error) {
      this.metrics.security = {
        error: error.message,
        lastUpdated: new Date().toISOString()
      };
      this.addAlert('security', 'Security metrics collection failed', 'error');
    }
  }

  async updatePerformanceMetrics() {
    try {
      // Run performance regression detector
      const { PerformanceRegressionDetector } = require('./performance-regression-detector.js');
      const detector = new PerformanceRegressionDetector();
      
      // Collect current metrics without full regression analysis
      await detector.collectCurrentMetrics();
      
      this.metrics.performance = {
        testExecution: detector.currentMetrics.testExecution?.duration || null,
        bundleSize: detector.currentMetrics.bundle?.total || null,
        buildTime: detector.currentMetrics.build?.duration || null,
        memoryUsage: detector.currentMetrics.memory?.heapUsedDelta || null,
        performanceHealth: this.calculatePerformanceHealth(detector.currentMetrics),
        lastUpdated: new Date().toISOString()
      };
      
    } catch (error) {
      this.metrics.performance = {
        error: error.message,
        lastUpdated: new Date().toISOString()
      };
      this.addAlert('performance', 'Performance metrics collection failed', 'error');
    }
  }

  calculateQualityHealth(report) {
    if (!report || report.totalTests === 0) return 0;
    
    const testScore = (report.passedTests / report.totalTests) * 40;
    const coverageScore = Object.values(report.coverage || {}).reduce((sum, val) => sum + val, 0) / Object.keys(report.coverage || {}).length * 0.6;
    
    return Math.round(testScore + coverageScore);
  }

  calculateSecurityHealth(summary) {
    if (!summary) return 0;
    
    const total = summary.total || 0;
    if (total === 0) return 100;
    
    // Weighted scoring: critical=-40, high=-20, medium=-10, low=-5
    const score = 100 - (
      (summary.critical || 0) * 40 +
      (summary.high || 0) * 20 +
      (summary.medium || 0) * 10 +
      (summary.low || 0) * 5
    );
    
    return Math.max(0, Math.round(score));
  }

  calculatePerformanceHealth(metrics) {
    if (!metrics) return 0;
    
    let score = 100;
    
    // Penalize slow performance
    if (metrics.testExecution?.duration > 2000) score -= 20;
    if (metrics.buildTime?.duration > 10000) score -= 15;
    if (metrics.bundleSize?.total > 1024 * 1024) score -= 10; // > 1MB
    
    return Math.max(0, score);
  }

  async calculateTrends() {
    const historicalData = this.loadRecentHistoricalData();
    
    if (historicalData.length < 2) {
      this.metrics.trends = { insufficient_data: true };
      return;
    }
    
    this.metrics.trends = {
      quality: this.calculateTrendDirection(historicalData, 'quality.overallHealth'),
      security: this.calculateTrendDirection(historicalData, 'security.securityHealth'),
      performance: this.calculateTrendDirection(historicalData, 'performance.performanceHealth'),
      testExecution: this.calculateTrendDirection(historicalData, 'performance.testExecution'),
      lastCalculated: new Date().toISOString()
    };
  }

  calculateTrendDirection(data, metricPath) {
    const values = data.map(entry => {
      const value = metricPath.split('.').reduce((obj, key) => obj?.[key], entry);
      return typeof value === 'number' ? value : null;
    }).filter(v => v !== null);
    
    if (values.length < 2) return 'unknown';
    
    const recent = values.slice(-3); // Last 3 values
    const trend = recent[recent.length - 1] - recent[0];
    
    if (Math.abs(trend) < 5) return 'stable';
    return trend > 0 ? 'improving' : 'declining';
  }

  addAlert(category, message, severity) {
    const alert = {
      id: Date.now().toString(),
      category,
      message,
      severity,
      timestamp: new Date().toISOString()
    };
    
    this.metrics.alerts.unshift(alert);
    
    // Keep only last 50 alerts
    if (this.metrics.alerts.length > 50) {
      this.metrics.alerts = this.metrics.alerts.slice(0, 50);
    }
    
    this.log(`🚨 Alert [${severity}]: ${message}`, severity === 'critical' ? 'red' : 'yellow');
  }

  async checkAlerts() {
    // Clear old alerts (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.metrics.alerts = this.metrics.alerts.filter(alert => 
      new Date(alert.timestamp) > oneHourAgo
    );
    
    // Check for system health degradation
    const overallHealth = this.calculateOverallHealth();
    if (overallHealth < 70) {
      this.addAlert('system', `Overall system health degraded to ${overallHealth}%`, 'warning');
    }
  }

  calculateOverallHealth() {
    const weights = { quality: 0.4, security: 0.4, performance: 0.2 };
    let totalScore = 0;
    let totalWeight = 0;
    
    if (this.metrics.quality.overallHealth !== undefined) {
      totalScore += this.metrics.quality.overallHealth * weights.quality;
      totalWeight += weights.quality;
    }
    
    if (this.metrics.security.securityHealth !== undefined) {
      totalScore += this.metrics.security.securityHealth * weights.security;
      totalWeight += weights.security;
    }
    
    if (this.metrics.performance.performanceHealth !== undefined) {
      totalScore += this.metrics.performance.performanceHealth * weights.performance;
      totalWeight += weights.performance;
    }
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  async saveMetricsSnapshot() {
    const snapshot = {
      timestamp: new Date().toISOString(),
      ...this.metrics
    };
    
    const filename = `metrics-${Date.now()}.json`;
    const filepath = path.join(this.dataDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2));
    
    // Clean up old snapshots (keep last 100)
    this.cleanupOldSnapshots();
  }

  cleanupOldSnapshots() {
    const files = fs.readdirSync(this.dataDir)
      .filter(file => file.startsWith('metrics-'))
      .sort()
      .reverse();
    
    if (files.length > 100) {
      files.slice(100).forEach(file => {
        fs.unlinkSync(path.join(this.dataDir, file));
      });
    }
  }

  loadRecentHistoricalData() {
    const files = fs.readdirSync(this.dataDir)
      .filter(file => file.startsWith('metrics-'))
      .sort()
      .reverse()
      .slice(0, 10); // Last 10 snapshots
    
    return files.map(file => {
      try {
        const data = fs.readFileSync(path.join(this.dataDir, file), 'utf8');
        return JSON.parse(data);
      } catch (error) {
        return null;
      }
    }).filter(Boolean);
  }

  loadHistoricalData(metric) {
    const historicalData = this.loadRecentHistoricalData();
    return historicalData.map(entry => ({
      timestamp: entry.timestamp,
      value: metric.split('.').reduce((obj, key) => obj?.[key], entry)
    }));
  }

  generateDashboardHTML() {
    const overallHealth = this.calculateOverallHealth();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quality Monitoring Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa;
            color: #333;
            line-height: 1.6;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .dashboard {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 1rem;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .metric-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: transform 0.2s ease;
        }
        
        .metric-card:hover {
            transform: translateY(-2px);
        }
        
        .metric-header {
            display: flex;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .metric-icon {
            font-size: 1.5rem;
            margin-right: 0.5rem;
        }
        
        .metric-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #4a5568;
        }
        
        .metric-value {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        
        .metric-subtitle {
            color: #718096;
            font-size: 0.9rem;
        }
        
        .health-excellent { color: #48bb78; }
        .health-good { color: #38b2ac; }
        .health-warning { color: #ed8936; }
        .health-critical { color: #e53e3e; }
        
        .trend-up { color: #48bb78; }
        .trend-down { color: #e53e3e; }
        .trend-stable { color: #4a5568; }
        
        .alerts-section {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .alert-item {
            padding: 0.75rem;
            margin-bottom: 0.5rem;
            border-radius: 8px;
            border-left: 4px solid;
        }
        
        .alert-critical {
            background: #fed7d7;
            border-color: #e53e3e;
        }
        
        .alert-warning {
            background: #feebc8;
            border-color: #ed8936;
        }
        
        .alert-info {
            background: #bee3f8;
            border-color: #3182ce;
        }
        
        .refresh-indicator {
            position: fixed;
            top: 1rem;
            right: 1rem;
            background: white;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            animation: spin 2s linear infinite;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .last-updated {
            text-align: center;
            color: #718096;
            font-size: 0.9rem;
            margin-top: 2rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Quality Monitoring Dashboard</h1>
        <p>Real-time code quality, security, and performance monitoring</p>
        <div style="margin-top: 1rem;">
            <span style="font-size: 2rem; font-weight: bold;" class="${this.getHealthClass(overallHealth)}">
                ${overallHealth}%
            </span>
            <div>Overall System Health</div>
        </div>
    </div>
    
    <div class="refresh-indicator">🔄</div>
    
    <div class="dashboard">
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-icon">🧪</span>
                    <span class="metric-title">Quality Health</span>
                </div>
                <div class="metric-value ${this.getHealthClass(this.metrics.quality.overallHealth || 0)}">
                    ${this.metrics.quality.overallHealth || 0}%
                </div>
                <div class="metric-subtitle">
                    ${this.metrics.quality.passedTests || 0}/${this.metrics.quality.totalTests || 0} tests passing
                    <span class="trend-${this.metrics.trends.quality || 'stable'}">
                        ${this.getTrendIcon(this.metrics.trends.quality)}
                    </span>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-icon">🔒</span>
                    <span class="metric-title">Security Health</span>
                </div>
                <div class="metric-value ${this.getHealthClass(this.metrics.security.securityHealth || 0)}">
                    ${this.metrics.security.securityHealth || 0}%
                </div>
                <div class="metric-subtitle">
                    ${this.metrics.security.vulnerabilities || 0} vulnerabilities detected
                    <span class="trend-${this.metrics.trends.security || 'stable'}">
                        ${this.getTrendIcon(this.metrics.trends.security)}
                    </span>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-icon">⚡</span>
                    <span class="metric-title">Performance Health</span>
                </div>
                <div class="metric-value ${this.getHealthClass(this.metrics.performance.performanceHealth || 0)}">
                    ${this.metrics.performance.performanceHealth || 0}%
                </div>
                <div class="metric-subtitle">
                    Test execution: ${this.metrics.performance.testExecution || 'N/A'}ms
                    <span class="trend-${this.metrics.trends.performance || 'stable'}">
                        ${this.getTrendIcon(this.metrics.trends.performance)}
                    </span>
                </div>
            </div>
        </div>
        
        <div class="alerts-section">
            <h2>🚨 Recent Alerts</h2>
            <div id="alerts-container">
                ${this.generateAlertsHTML()}
            </div>
        </div>
        
        <div class="last-updated">
            Last updated: ${new Date().toLocaleString()}
        </div>
    </div>
    
    <script>
        // Auto-refresh every 30 seconds
        setInterval(() => {
            location.reload();
        }, 30000);
        
        // Real-time updates via WebSocket could be added here
    </script>
</body>
</html>`;
  }

  getHealthClass(health) {
    if (health >= 90) return 'health-excellent';
    if (health >= 75) return 'health-good';
    if (health >= 50) return 'health-warning';
    return 'health-critical';
  }

  getTrendIcon(trend) {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  }

  generateAlertsHTML() {
    if (!this.metrics.alerts || this.metrics.alerts.length === 0) {
      return '<p style="color: #48bb78;">✅ No active alerts</p>';
    }
    
    return this.metrics.alerts.slice(0, 10).map(alert => `
      <div class="alert-item alert-${alert.severity}">
        <strong>${alert.category.toUpperCase()}</strong>: ${alert.message}
        <div style="font-size: 0.8rem; color: #718096; margin-top: 0.25rem;">
          ${new Date(alert.timestamp).toLocaleString()}
        </div>
      </div>
    `).join('');
  }

  async stopDashboard() {
    this.monitoringActive = false;
    
    if (this.server) {
      this.server.close();
      this.log('Web server stopped', 'yellow');
    }
    
    this.log('Quality monitoring dashboard stopped', 'yellow');
  }
}

// CLI execution
if (require.main === module) {
  const dashboard = new QualityMonitoringDashboard();
  
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Quality Monitoring Dashboard

Usage: node scripts/quality-monitoring-dashboard.js [options]

Options:
  --help, -h         Show this help message
  --port <n>         Set dashboard port (default: 3001)
  --interval <ms>    Set refresh interval in milliseconds (default: 30000)

This creates a real-time web dashboard that monitors:
- Code quality metrics and test results
- Security vulnerability status
- Performance metrics and trends
- System health indicators
- Alert notifications

The dashboard automatically refreshes and provides historical trend analysis
to help development teams maintain high code quality standards.
`);
    process.exit(0);
  }
  
  // Handle custom port
  const portIndex = args.indexOf('--port');
  if (portIndex !== -1 && args[portIndex + 1]) {
    dashboard.port = parseInt(args[portIndex + 1]);
  }
  
  // Handle custom refresh interval
  const intervalIndex = args.indexOf('--interval');
  if (intervalIndex !== -1 && args[intervalIndex + 1]) {
    dashboard.refreshInterval = parseInt(args[intervalIndex + 1]);
  }
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down dashboard...');
    await dashboard.stopDashboard();
    process.exit(0);
  });
  
  dashboard.startDashboard().catch(error => {
    console.error('Dashboard failed to start:', error);
    process.exit(1);
  });
}

module.exports = { QualityMonitoringDashboard };