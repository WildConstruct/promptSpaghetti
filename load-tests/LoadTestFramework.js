/**
 * Load Test Framework for PromptScape Application
 * 
 * Comprehensive load testing framework for testing key user flows including:
 * - Authentication flows (login, registration, token refresh)
 * - Graph execution and preview endpoints
 * - File browser operations
 * - Analytics and metrics collection
 * 
 * Task: T-1752989144295-507 - Implement automated load test scripts for key user flows
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const { EventEmitter } = require('events');

/**
 * Load test configuration
 */
class LoadTestConfig {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:8000';
    this.concurrency = options.concurrency || 10;
    this.duration = options.duration || 60000; // 60 seconds
    this.rampUpTime = options.rampUpTime || 10000; // 10 seconds
    this.timeout = options.timeout || 30000; // 30 seconds
    this.thinkTime = options.thinkTime || { min: 100, max: 2000 }; // Think time between requests
    this.userPool = options.userPool || [];
    this.reportInterval = options.reportInterval || 5000; // 5 seconds
  }
}

/**
 * Request metrics tracking
 */
class RequestMetrics {
  constructor() {
    this.requests = [];
    this.errors = [];
    this.startTime = Date.now();
    this.endTime = null;
  }

  recordRequest(method, url, statusCode, responseTime, error = null) {
    const timestamp = Date.now();
    
    const request = {
      timestamp,
      method,
      url,
      statusCode,
      responseTime,
      success: statusCode >= 200 && statusCode < 400,
      error
    };

    this.requests.push(request);
    
    if (error || statusCode >= 400) {
      this.errors.push({
        ...request,
        errorMessage: error ? error.message : `HTTP ${statusCode}`
      });
    }
  }

  getStats() {
    const totalRequests = this.requests.length;
    const successfulRequests = this.requests.filter(r => r.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const responseTimes = this.requests.map(r => r.responseTime);
    
    const stats = {
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
      errorRate: totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0,
      averageResponseTime: responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0,
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      p50: this.percentile(responseTimes, 50),
      p90: this.percentile(responseTimes, 90),
      p95: this.percentile(responseTimes, 95),
      p99: this.percentile(responseTimes, 99),
      requestsPerSecond: this.getRequestsPerSecond(),
      errors: this.errors,
      testDuration: this.endTime ? this.endTime - this.startTime : Date.now() - this.startTime
    };

    return stats;
  }

  percentile(arr, percentile) {
    if (arr.length === 0) return 0;
    const sorted = arr.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  getRequestsPerSecond() {
    const duration = (this.endTime || Date.now()) - this.startTime;
    return duration > 0 ? (this.requests.length / duration) * 1000 : 0;
  }

  finish() {
    this.endTime = Date.now();
  }
}

/**
 * HTTP Client for making requests
 */
class HttpClient {
  constructor(baseUrl, timeout = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
    this.cookies = {};
    this.headers = {};
  }

  setCookie(name, value) {
    this.cookies[name] = value;
  }

  setHeader(name, value) {
    this.headers[name] = value;
  }

  async makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const requestOptions = {
        method,
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LoadTest/1.0',
          ...this.headers,
          ...headers
        },
        timeout: this.timeout
      };

      // Add cookies
      if (Object.keys(this.cookies).length > 0) {
        requestOptions.headers.Cookie = Object.entries(this.cookies)
          .map(([name, value]) => `${name}=${value}`)
          .join('; ');
      }

      // Add content length for POST/PUT requests
      let requestData = '';
      if (data) {
        requestData = typeof data === 'string' ? data : JSON.stringify(data);
        requestOptions.headers['Content-Length'] = Buffer.byteLength(requestData);
      }

      const startTime = Date.now();
      const req = client.request(requestOptions, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          
          // Parse cookies from response
          const setCookies = res.headers['set-cookie'];
          if (setCookies) {
            setCookies.forEach(cookie => {
              const [nameValue] = cookie.split(';');
              const [name, value] = nameValue.split('=');
              if (name && value) {
                this.cookies[name.trim()] = value.trim();
              }
            });
          }

          let parsedData;
          try {
            parsedData = responseData ? JSON.parse(responseData) : {};
          } catch (e) {
            parsedData = responseData;
          }

          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData,
            responseTime,
            rawData: responseData
          });
        });
      });

      req.on('error', (error) => {
        const responseTime = Date.now() - startTime;
        reject({ error, responseTime });
      });

      req.on('timeout', () => {
        req.destroy();
        const responseTime = Date.now() - startTime;
        reject({ error: new Error('Request timeout'), responseTime });
      });

      if (requestData) {
        req.write(requestData);
      }
      
      req.end();
    });
  }

  async get(path, headers = {}) {
    return this.makeRequest('GET', path, null, headers);
  }

  async post(path, data = null, headers = {}) {
    return this.makeRequest('POST', path, data, headers);
  }

  async put(path, data = null, headers = {}) {
    return this.makeRequest('PUT', path, data, headers);
  }

  async delete(path, headers = {}) {
    return this.makeRequest('DELETE', path, null, headers);
  }
}

/**
 * Virtual User simulation
 */
class VirtualUser extends EventEmitter {
  constructor(id, config, userCredentials = null) {
    super();
    this.id = id;
    this.config = config;
    this.client = new HttpClient(config.baseUrl, config.timeout);
    this.userCredentials = userCredentials;
    this.metrics = new RequestMetrics();
    this.isRunning = false;
    this.sessionData = {};
  }

  async executeRequest(method, path, data = null, headers = {}) {
    try {
      const response = await this.client.makeRequest(method, path, data, headers);
      
      this.metrics.recordRequest(
        method, 
        path, 
        response.statusCode, 
        response.responseTime
      );

      this.emit('request', {
        userId: this.id,
        method,
        path,
        statusCode: response.statusCode,
        responseTime: response.responseTime,
        success: response.statusCode >= 200 && response.statusCode < 400
      });

      return response;
    } catch (error) {
      this.metrics.recordRequest(
        method, 
        path, 
        0, 
        error.responseTime || 0, 
        error.error || error
      );

      this.emit('error', {
        userId: this.id,
        method,
        path,
        error: error.error || error,
        responseTime: error.responseTime || 0
      });

      throw error;
    }
  }

  async thinkTime() {
    const { min, max } = this.config.thinkTime;
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async start(testScenario) {
    this.isRunning = true;
    this.emit('userStarted', this.id);

    try {
      await testScenario(this);
    } catch (error) {
      this.emit('userError', { userId: this.id, error });
    } finally {
      this.isRunning = false;
      this.metrics.finish();
      this.emit('userFinished', this.id);
    }
  }

  stop() {
    this.isRunning = false;
  }

  getMetrics() {
    return this.metrics.getStats();
  }
}

/**
 * Load Test Runner
 */
class LoadTestRunner extends EventEmitter {
  constructor(config) {
    super();
    this.config = config instanceof LoadTestConfig ? config : new LoadTestConfig(config);
    this.users = [];
    this.globalMetrics = new RequestMetrics();
    this.isRunning = false;
    this.reportTimer = null;
  }

  async runLoadTest(testScenario, testName = 'Load Test') {
    console.log(`🚀 Starting ${testName}`);
    console.log(`📊 Configuration:`);
    console.log(`   - Concurrency: ${this.config.concurrency} users`);
    console.log(`   - Duration: ${this.config.duration / 1000}s`);
    console.log(`   - Ramp-up: ${this.config.rampUpTime / 1000}s`);
    console.log(`   - Target: ${this.config.baseUrl}`);
    console.log();

    this.isRunning = true;
    this.globalMetrics = new RequestMetrics();
    
    // Start reporting
    this.startReporting();

    // Calculate user spawn interval
    const spawnInterval = this.config.rampUpTime / this.config.concurrency;
    
    // Spawn users with ramp-up
    for (let i = 0; i < this.config.concurrency; i++) {
      setTimeout(() => {
        if (this.isRunning) {
          this.spawnUser(i, testScenario);
        }
      }, i * spawnInterval);
    }

    // Run for specified duration
    await new Promise(resolve => {
      setTimeout(() => {
        this.stopLoadTest();
        resolve();
      }, this.config.duration);
    });

    // Wait for all users to finish
    await this.waitForUsersToFinish();

    // Generate final report
    this.stopReporting();
    const finalStats = this.generateReport();
    
    console.log('\n📈 Final Load Test Results:');
    console.log('============================');
    this.printReport(finalStats);

    return finalStats;
  }

  spawnUser(userId, testScenario) {
    const userCredentials = this.config.userPool.length > 0 
      ? this.config.userPool[userId % this.config.userPool.length]
      : null;

    const user = new VirtualUser(userId, this.config, userCredentials);
    
    // Forward user events to global metrics
    user.on('request', (data) => {
      this.globalMetrics.recordRequest(
        data.method,
        data.path,
        data.statusCode,
        data.responseTime
      );
      this.emit('request', data);
    });

    user.on('error', (data) => {
      this.globalMetrics.recordRequest(
        data.method,
        data.path,
        0,
        data.responseTime,
        data.error
      );
      this.emit('userError', data);
    });

    this.users.push(user);
    user.start(testScenario);
  }

  stopLoadTest() {
    this.isRunning = false;
    this.users.forEach(user => user.stop());
  }

  async waitForUsersToFinish(timeout = 30000) {
    const startTime = Date.now();
    
    while (this.users.some(user => user.isRunning) && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  startReporting() {
    this.reportTimer = setInterval(() => {
      const stats = this.globalMetrics.getStats();
      console.log(`⏱️  [${new Date().toISOString()}] ` +
        `Requests: ${stats.totalRequests}, ` +
        `RPS: ${stats.requestsPerSecond.toFixed(2)}, ` +
        `Success: ${stats.successRate.toFixed(1)}%, ` +
        `Avg Response: ${stats.averageResponseTime.toFixed(0)}ms`);
    }, this.config.reportInterval);
  }

  stopReporting() {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }
    this.globalMetrics.finish();
  }

  generateReport() {
    const globalStats = this.globalMetrics.getStats();
    const userStats = this.users.map(user => user.getMetrics());

    return {
      global: globalStats,
      users: userStats,
      summary: {
        totalUsers: this.users.length,
        completedUsers: userStats.filter(u => u.testDuration > 0).length,
        averageUserRequests: userStats.length > 0 
          ? userStats.reduce((sum, u) => sum + u.totalRequests, 0) / userStats.length 
          : 0
      }
    };
  }

  printReport(stats) {
    const { global } = stats;
    
    console.log(`📊 Total Requests: ${global.totalRequests}`);
    console.log(`✅ Successful: ${global.successfulRequests} (${global.successRate.toFixed(1)}%)`);
    console.log(`❌ Failed: ${global.failedRequests} (${global.errorRate.toFixed(1)}%)`);
    console.log(`⚡ Requests/sec: ${global.requestsPerSecond.toFixed(2)}`);
    console.log(`⏱️  Response Times:`);
    console.log(`   - Average: ${global.averageResponseTime.toFixed(0)}ms`);
    console.log(`   - Min: ${global.minResponseTime}ms`);
    console.log(`   - Max: ${global.maxResponseTime}ms`);
    console.log(`   - P50: ${global.p50}ms`);
    console.log(`   - P90: ${global.p90}ms`);
    console.log(`   - P95: ${global.p95}ms`);
    console.log(`   - P99: ${global.p99}ms`);
    
    if (global.errors.length > 0) {
      console.log(`\n🚨 Top Errors:`);
      const errorCounts = {};
      global.errors.forEach(error => {
        const key = error.errorMessage || `HTTP ${error.statusCode}`;
        errorCounts[key] = (errorCounts[key] || 0) + 1;
      });
      
      Object.entries(errorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([error, count]) => {
          console.log(`   - ${error}: ${count} occurrences`);
        });
    }

    console.log(`\n⏱️  Test Duration: ${(global.testDuration / 1000).toFixed(1)}s`);
  }

  // Export results to JSON
  exportResults(stats, filename) {
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const finalFilename = filename || `load-test-results-${timestamp}.json`;
    
    const exportData = {
      timestamp: new Date().toISOString(),
      config: this.config,
      results: stats
    };

    fs.writeFileSync(finalFilename, JSON.stringify(exportData, null, 2));
    console.log(`📁 Results exported to: ${finalFilename}`);
    
    return finalFilename;
  }
}

module.exports = {
  LoadTestConfig,
  LoadTestRunner,
  VirtualUser,
  HttpClient,
  RequestMetrics
};