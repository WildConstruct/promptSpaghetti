#!/usr/bin/env node

/**
 * Report Export System Test
 * 
 * End-to-end testing of the report export system including API endpoints,
 * service functionality, and integration testing.
 * 
 * Task: T-1752989143998-788 - Add report export options
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

/**
 * Test Configuration
 */
const TEST_CONFIG = {
  server: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
    startupDelay: 5000
  },
  export: {
    outputDir: './test-export-results',
    formats: ['pdf', 'excel', 'csv', 'json', 'xml', 'html'],
    deliveryMethods: ['file', 'email', 'webhook']
  },
  timeout: 30000
};

/**
 * Sample report data for testing
 */
const SAMPLE_REPORT_DATA = {
  metadata: {
    title: 'Test Export Report',
    description: 'Sample report generated for export system testing',
    generatedAt: new Date(),
    generatedBy: 'export-system-test',
    version: '1.0.0-test'
  },
  summary: {
    totalRecords: 1000,
    successfulOperations: 950,
    failedOperations: 50,
    averageProcessingTime: 125.7,
    dataSize: '2.5MB'
  },
  data: Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Test Item ${i + 1}`,
    value: Math.floor(Math.random() * 1000),
    category: ['A', 'B', 'C'][i % 3],
    status: Math.random() > 0.1 ? 'active' : 'inactive',
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
  })),
  charts: [
    {
      type: 'line',
      title: 'Performance Trend',
      data: Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        performance: Math.floor(Math.random() * 100) + 50
      }))
    },
    {
      type: 'bar',
      title: 'Category Distribution',
      data: [
        { category: 'A', count: 17 },
        { category: 'B', count: 16 },
        { category: 'C', count: 17 }
      ]
    }
  ]
};

/**
 * Report Export Test Runner
 */
class ReportExportTester {
  constructor() {
    this.results = {
      startTime: null,
      endTime: null,
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  /**
   * Run all export system tests
   */
  async runAllTests(): Promise<any> {
    console.log('🚀 Starting Report Export System Tests');
    console.log('=====================================\n');

    this.results.startTime = new Date();

    try {
      // Setup
      await this.setupTestEnvironment();

      // Test 1: API Endpoint Availability
      await this.testAPIEndpoints();

      // Test 2: Export Formats
      await this.testExportFormats();

      // Test 3: Delivery Methods
      await this.testDeliveryMethods();

      // Test 4: Export Options and Configuration
      await this.testExportOptions();

      // Test 5: Bulk Export
      await this.testBulkExport();

      // Test 6: Scheduled Export Creation
      await this.testScheduledExports();

      // Test 7: Export History and Statistics
      await this.testHistoryAndStatistics();

      // Test 8: Preview Functionality
      await this.testPreviewFunctionality();

      this.results.endTime = new Date();

      // Generate test report
      await this.generateTestReport();

      console.log('\n✅ All Report Export Tests Completed!');
      this.displayTestSummary();

      return this.results;

    } catch (error) {
      console.error('\n❌ Report Export Tests Failed:', error.message);
      this.results.endTime = new Date();
      
      // Generate partial report
      await this.generateTestReport();
      throw error;
    }
  }

  /**
   * Setup test environment
   */
  async setupTestEnvironment(): Promise<void> {
    console.log('🔧 Setting up test environment...');

    // Create output directory
    try {
      await fs.access(TEST_CONFIG.export.outputDir);
    } catch (error) {
      await fs.mkdir(TEST_CONFIG.export.outputDir, { recursive: true });
    }

    // Check server availability
    try {
      const response = await fetch(`${TEST_CONFIG.server.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`Server not accessible: ${response.status}`);
      }
      console.log('✅ Server is accessible');
    } catch (error) {
      console.warn('⚠️  Server might not be running:', error.message);
      console.log('   Make sure to start the server with: pnpm --filter server dev');
    }

    console.log('✅ Test environment ready\n');
  }

  /**
   * Test API endpoints
   */
  async testAPIEndpoints(): Promise<void> {
    console.log('📡 Testing API Endpoints...');

    const endpoints = [
      { method: 'GET', path: '/api/reports/options', description: 'Get export options' },
      { method: 'GET', path: '/api/reports/history', description: 'Get export history' },
      { method: 'GET', path: '/api/reports/schedules', description: 'Get scheduled exports' },
      { method: 'GET', path: '/api/reports/statistics', description: 'Get export statistics' }
    ];

    for (const endpoint of endpoints) {
      const testResult = await this.runTest(
        `API ${endpoint.method} ${endpoint.path}`,
        async () => {
          const response = await fetch(`${TEST_CONFIG.server.baseUrl}${endpoint.path}`, {
            method: endpoint.method
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          if (!data.success) {
            throw new Error(`API Error: ${data.error || 'Unknown error'}`);
          }

          return { status: response.status, dataLength: JSON.stringify(data).length };
        }
      );

      console.log(`   ${testResult.success ? '✅' : '❌'} ${endpoint.description}`);
    }

    console.log('');
  }

  /**
   * Test export formats
   */
  async testExportFormats(): Promise<void> {
    console.log('📄 Testing Export Formats...');

    for (const format of TEST_CONFIG.export.formats) {
      const testResult = await this.runTest(
        `Export Format: ${format.toUpperCase()}`,
        async () => {
          const exportConfig = {
            format,
            delivery: 'file',
            filename: `test-export-${format}-${Date.now()}.${format}`,
            options: {
              includeCharts: true,
              includeRawData: true,
              compression: false
            }
          };

          const response = await fetch(`${TEST_CONFIG.server.baseUrl}/api/reports/export`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              reportData: SAMPLE_REPORT_DATA,
              config: exportConfig
            })
          });

          if (!response.ok) {
            throw new Error(`Export failed: ${response.status} ${response.statusText}`);
          }

          const result = await response.json();
          if (!result.success) {
            throw new Error(`Export error: ${result.error}`);
          }

          return {
            exportId: result.data.id,
            filename: result.data.filename,
            size: result.data.size,
            processingTime: result.data.metadata.processingTime
          };
        }
      );

      console.log(`   ${testResult.success ? '✅' : '❌'} ${format.toUpperCase()} export - ${testResult.success ? `${testResult.result?.processingTime}ms` : testResult.error}`);
    }

    console.log('');
  }

  /**
   * Test delivery methods
   */
  async testDeliveryMethods(): Promise<void> {
    console.log('🚚 Testing Delivery Methods...');

    for (const delivery of TEST_CONFIG.export.deliveryMethods) {
      const testResult = await this.runTest(
        `Delivery Method: ${delivery}`,
        async () => {
          const exportConfig = {
            format: 'json',
            delivery,
            filename: `test-delivery-${delivery}-${Date.now()}.json`
          };

          // Add delivery-specific configuration
          if (delivery === 'email') {
            exportConfig.delivery_config = {
              email: {
                to: ['test@example.com'],
                subject: 'Test Export Delivery',
                message: 'This is a test export delivery via email.'
              }
            };
          } else if (delivery === 'webhook') {
            exportConfig.delivery_config = {
              webhook: {
                url: 'https://httpbin.org/post',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            };
          }

          const response = await fetch(`${TEST_CONFIG.server.baseUrl}/api/reports/export`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              reportData: SAMPLE_REPORT_DATA,
              config: exportConfig
            })
          });

          if (!response.ok) {
            throw new Error(`Delivery test failed: ${response.status} ${response.statusText}`);
          }

          const result = await response.json();
          if (!result.success) {
            throw new Error(`Delivery error: ${result.error}`);
          }

          return result.data;
        }
      );

      console.log(`   ${testResult.success ? '✅' : '❌'} ${delivery} delivery`);
    }

    console.log('');
  }

  /**
   * Test export options and configuration
   */
  async testExportOptions(): Promise<void> {
    console.log('⚙️  Testing Export Options...');

    const optionsTests = [
      {
        name: 'Compression enabled',
        config: { format: 'json', delivery: 'file', options: { compression: true } }
      },
      {
        name: 'Encryption enabled',
        config: { format: 'json', delivery: 'file', options: { encryption: true, password: 'test123' } }
      },
      {
        name: 'Charts excluded',
        config: { format: 'html', delivery: 'file', options: { includeCharts: false } }
      },
      {
        name: 'Raw data excluded',
        config: { format: 'html', delivery: 'file', options: { includeRawData: false } }
      }
    ];

    for (const test of optionsTests) {
      const testResult = await this.runTest(
        `Export Option: ${test.name}`,
        async () => {
          const response = await fetch(`${TEST_CONFIG.server.baseUrl}/api/reports/export`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              reportData: SAMPLE_REPORT_DATA,
              config: test.config
            })
          });

          if (!response.ok) {
            throw new Error(`Options test failed: ${response.status} ${response.statusText}`);
          }

          const result = await response.json();
          if (!result.success) {
            throw new Error(`Options error: ${result.error}`);
          }

          return result.data;
        }
      );

      console.log(`   ${testResult.success ? '✅' : '❌'} ${test.name}`);
    }

    console.log('');
  }

  /**
   * Test bulk export
   */
  async testBulkExport(): Promise<void> {
    console.log('📦 Testing Bulk Export...');

    const testResult = await this.runTest(
      'Bulk Export',
      async () => {
        const reports = [
          {
            name: 'Report 1',
            reportData: SAMPLE_REPORT_DATA,
            config: { format: 'csv', delivery: 'file' }
          },
          {
            name: 'Report 2',
            reportData: { ...SAMPLE_REPORT_DATA, metadata: { ...SAMPLE_REPORT_DATA.metadata, title: 'Bulk Test Report 2' } },
            config: { format: 'json', delivery: 'file' }
          },
          {
            name: 'Report 3',
            reportData: { ...SAMPLE_REPORT_DATA, metadata: { ...SAMPLE_REPORT_DATA.metadata, title: 'Bulk Test Report 3' } },
            config: { format: 'html', delivery: 'file' }
          }
        ];

        const response = await fetch(`${TEST_CONFIG.server.baseUrl}/api/reports/bulk-export`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reports,
            options: {
              parallel: true,
              maxConcurrency: 2,
              failFast: false
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Bulk export failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(`Bulk export error: ${result.error}`);
        }

        return {
          totalExports: result.data.totalExports,
          successfulExports: result.data.successfulExports,
          failedExports: result.data.failedExports
        };
      }
    );

    console.log(`   ${testResult.success ? '✅' : '❌'} Bulk export - ${testResult.success ? `${testResult.result?.successfulExports}/${testResult.result?.totalExports} successful` : testResult.error}`);
    console.log('');
  }

  /**
   * Test scheduled exports
   */
  async testScheduledExports(): Promise<void> {
    console.log('⏰ Testing Scheduled Exports...');

    const testResult = await this.runTest(
      'Create Scheduled Export',
      async () => {
        const scheduleData = {
          name: 'Test Scheduled Export',
          description: 'Automated test export created by test suite',
          reportQuery: 'test-query',
          exportConfig: {
            format: 'pdf',
            delivery: 'file',
            options: {
              includeCharts: true,
              includeRawData: true
            }
          },
          schedule: {
            frequency: 'daily',
            time: '09:00'
          },
          enabled: true
        };

        const response = await fetch(`${TEST_CONFIG.server.baseUrl}/api/reports/schedule`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(scheduleData)
        });

        if (!response.ok) {
          throw new Error(`Schedule creation failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(`Schedule error: ${result.error}`);
        }

        // Test canceling the schedule
        const cancelResponse = await fetch(`${TEST_CONFIG.server.baseUrl}/api/reports/schedules/${result.data.id}`, {
          method: 'DELETE'
        });

        if (!cancelResponse.ok) {
          console.warn('   ⚠️  Failed to cleanup test schedule');
        }

        return result.data;
      }
    );

    console.log(`   ${testResult.success ? '✅' : '❌'} Scheduled export creation and cleanup`);
    console.log('');
  }

  /**
   * Test history and statistics
   */
  async testHistoryAndStatistics(): Promise<void> {
    console.log('📊 Testing History and Statistics...');

    const tests = [
      {
        name: 'Export History',
        endpoint: '/api/reports/history?limit=10',
        validator: (data) => Array.isArray(data) && data.every(item => item.id && item.filename)
      },
      {
        name: 'Export Statistics',
        endpoint: '/api/reports/statistics',
        validator: (data) => typeof data.totalExports === 'number' && typeof data.successfulExports === 'number'
      },
      {
        name: 'Filtered History (CSV)',
        endpoint: '/api/reports/history?format=csv&limit=5',
        validator: (data) => Array.isArray(data)
      }
    ];

    for (const test of tests) {
      const testResult = await this.runTest(
        test.name,
        async () => {
          const response = await fetch(`${TEST_CONFIG.server.baseUrl}${test.endpoint}`);
          
          if (!response.ok) {
            throw new Error(`Request failed: ${response.status} ${response.statusText}`);
          }

          const result = await response.json();
          if (!result.success) {
            throw new Error(`API error: ${result.error}`);
          }

          if (!test.validator(result.data)) {
            throw new Error('Data validation failed');
          }

          return result.data;
        }
      );

      console.log(`   ${testResult.success ? '✅' : '❌'} ${test.name}`);
    }

    console.log('');
  }

  /**
   * Test preview functionality
   */
  async testPreviewFunctionality(): Promise<void> {
    console.log('👁️  Testing Preview Functionality...');

    const previewFormats = ['html', 'csv', 'json', 'xml'];

    for (const format of previewFormats) {
      const testResult = await this.runTest(
        `Preview ${format.toUpperCase()}`,
        async () => {
          const response = await fetch(`${TEST_CONFIG.server.baseUrl}/api/reports/preview`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              reportData: SAMPLE_REPORT_DATA,
              format
            })
          });

          if (!response.ok) {
            throw new Error(`Preview failed: ${response.status} ${response.statusText}`);
          }

          const result = await response.json();
          if (!result.success) {
            throw new Error(`Preview error: ${result.error}`);
          }

          return {
            format: result.data.format,
            previewLength: result.data.preview.length,
            recordCount: result.data.metadata.recordCount,
            estimatedSize: result.data.metadata.estimatedSize
          };
        }
      );

      console.log(`   ${testResult.success ? '✅' : '❌'} ${format.toUpperCase()} preview - ${testResult.success ? `${testResult.result?.previewLength} chars` : testResult.error}`);
    }

    console.log('');
  }

  /**
   * Run individual test with error handling
   */
  async runTest(testName: string, testFunction: () => Promise<any>): Promise<any> {
    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        testFunction(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), TEST_CONFIG.timeout)
        )
      ]);

      const duration = Date.now() - startTime;
      const testResult = {
        name: testName,
        success: true,
        result,
        duration,
        timestamp: new Date()
      };

      this.results.tests.push(testResult);
      this.results.summary.total++;
      this.results.summary.passed++;

      return testResult;

    } catch (error) {
      const duration = Date.now() - startTime;
      const testResult = {
        name: testName,
        success: false,
        error: error.message,
        duration,
        timestamp: new Date()
      };

      this.results.tests.push(testResult);
      this.results.summary.total++;
      this.results.summary.failed++;

      return testResult;
    }
  }

  /**
   * Generate comprehensive test report
   */
  async generateTestReport(): Promise<void> {
    const report = {
      testSuite: 'Report Export System',
      executionTime: this.results.endTime - this.results.startTime,
      timestamp: new Date().toISOString(),
      summary: this.results.summary,
      tests: this.results.tests,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        baseUrl: TEST_CONFIG.server.baseUrl
      },
      configuration: TEST_CONFIG
    };

    // Save JSON report
    const jsonPath = path.join(TEST_CONFIG.export.outputDir, `export-system-test-report-${Date.now()}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(TEST_CONFIG.export.outputDir, `export-system-test-report-${Date.now()}.html`);
    await fs.writeFile(htmlPath, htmlReport);

    console.log('📄 Test reports generated:');
    console.log(`   JSON: ${jsonPath}`);
    console.log(`   HTML: ${htmlPath}`);
  }

  /**
   * Generate HTML test report
   */
  generateHTMLReport(report: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Report Export System Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric h3 { margin: 0; color: #666; font-size: 14px; }
        .metric .value { font-size: 32px; font-weight: bold; margin: 10px 0; }
        .success { color: #28a745; }
        .failure { color: #dc3545; }
        .test-results { margin-top: 30px; }
        .test { padding: 15px; border-left: 4px solid #ddd; margin: 10px 0; background: #f8f9fa; }
        .test.success { border-color: #28a745; }
        .test.failure { border-color: #dc3545; }
        .test-name { font-weight: bold; margin-bottom: 5px; }
        .test-details { font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Report Export System Test Results</h1>
            <p>Test execution completed on ${new Date(report.timestamp).toLocaleString()}</p>
            <p>Duration: ${Math.round(report.executionTime / 1000)}s</p>
        </div>

        <div class="summary">
            <div class="metric">
                <h3>Total Tests</h3>
                <div class="value">${report.summary.total}</div>
            </div>
            <div class="metric">
                <h3>Passed</h3>
                <div class="value success">${report.summary.passed}</div>
            </div>
            <div class="metric">
                <h3>Failed</h3>
                <div class="value failure">${report.summary.failed}</div>
            </div>
            <div class="metric">
                <h3>Success Rate</h3>
                <div class="value">${report.summary.total > 0 ? Math.round((report.summary.passed / report.summary.total) * 100) : 0}%</div>
            </div>
        </div>

        <div class="test-results">
            <h2>Test Results</h2>
            ${report.tests.map(test => `
                <div class="test ${test.success ? 'success' : 'failure'}">
                    <div class="test-name">${test.success ? '✅' : '❌'} ${test.name}</div>
                    <div class="test-details">
                        Duration: ${test.duration}ms | 
                        Time: ${new Date(test.timestamp).toLocaleTimeString()}
                        ${test.error ? `| Error: ${test.error}` : ''}
                    </div>
                </div>
            `).join('')}
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
            <p>Environment: Node.js ${report.environment.nodeVersion} on ${report.environment.platform}</p>
            <p>Server: ${report.environment.baseUrl}</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Display test summary
   */
  displayTestSummary(): void {
    const duration = Math.round((this.results.endTime - this.results.startTime) / 1000);
    const successRate = this.results.summary.total > 0 
      ? Math.round((this.results.summary.passed / this.results.summary.total) * 100) 
      : 0;

    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    console.log(`Total Tests: ${this.results.summary.total}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`⚠️  Warnings: ${this.results.summary.warnings}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log(`⏱️  Duration: ${duration}s`);

    if (this.results.summary.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.tests
        .filter(test => !test.success)
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.error}`);
        });
    }

    console.log(`\n📁 Test results saved to: ${TEST_CONFIG.export.outputDir}`);
  }
}

/**
 * Main execution
 */
async function runExportSystemTests(): Promise<void> {
  const tester = new ReportExportTester();
  
  try {
    const results = await tester.runAllTests();
    
    if (results.summary.failed === 0) {
      console.log('\n🎉 All tests passed! Report Export System is ready for production use.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Please review the results and fix issues before deployment.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\nTest execution failed:', error);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runExportSystemTests().catch(console.error);
}

module.exports = { ReportExportTester, runExportSystemTests };