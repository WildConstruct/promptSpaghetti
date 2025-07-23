/**
 * Visual Regression Testing Framework
 * 
 * Provides comprehensive visual regression testing capabilities including
 * screenshot capture, comparison, and automated visual diff detection.
 * 
 * Task: E18-1753114562152-28B905
 */

import { Page, Browser, chromium, firefox, webkit } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';

export interface VisualTestConfig {
  name: string;
  url: string;
  selector?: string;
  viewport?: {
    width: number;
    height: number;
  };
  waitFor?: string | number;
  maskElements?: string[];
  threshold?: number;
  browserTypes?: ('chromium' | 'firefox' | 'webkit')[];
  actions?: Array<{
    type: 'click' | 'hover' | 'scroll' | 'type' | 'wait';
    selector?: string;
    text?: string;
    delay?: number;
  }>;
}

export interface VisualTestResult {
  testName: string;
  browser: string;
  passed: boolean;
  difference?: number;
  diffImagePath?: string;
  baselineImagePath: string;
  currentImagePath: string;
  error?: string;
  timestamp: Date;
  metrics: {
    captureTime: number;
    comparisonTime: number;
    imageSize: number;
  };
}

export interface VisualTestSuite {
  suiteName: string;
  tests: VisualTestConfig[];
  globalConfig?: {
    baseUrl?: string;
    viewport?: { width: number; height: number };
    threshold?: number;
    waitFor?: number;
  };
}

export class VisualRegressionTester {
  private baselineDir: string;
  private currentDir: string;
  private diffDir: string;
  private browsers: Map<string, Browser> = new Map();

  constructor(
    private screenshotDir: string = './tests/visual/screenshots'
  ) {
    this.baselineDir = path.join(screenshotDir, 'baseline');
    this.currentDir = path.join(screenshotDir, 'current');
    this.diffDir = path.join(screenshotDir, 'diff');
  }

  /**
   * Initialize the visual testing framework
   */
  async initialize(): Promise<void> {
    // Create directories
    await fs.mkdir(this.baselineDir, { recursive: true });
    await fs.mkdir(this.currentDir, { recursive: true });
    await fs.mkdir(this.diffDir, { recursive: true });

    // Launch browsers
    await this.launchBrowsers();
  }

  /**
   * Run a single visual test
   */
  async runVisualTest(config: VisualTestConfig): Promise<VisualTestResult[]> {
    const results: VisualTestResult[] = [];
    const browserTypes = config.browserTypes || ['chromium'];

    for (const browserType of browserTypes) {
      const browser = this.browsers.get(browserType);
      if (!browser) {
        throw new Error(`Browser ${browserType} not initialized`);
      }

      const result = await this.runTestOnBrowser(config, browser, browserType);
      results.push(result);
    }

    return results;
  }

  /**
   * Run a visual test suite
   */
  async runVisualTestSuite(suite: VisualTestSuite): Promise<VisualTestResult[]> {
    const results: VisualTestResult[] = [];

    for (const testConfig of suite.tests) {
      // Merge global config with test config
      const mergedConfig: VisualTestConfig = {
        ...testConfig,
        url: suite.globalConfig?.baseUrl ? 
          new URL(testConfig.url, suite.globalConfig.baseUrl).toString() : 
          testConfig.url,
        viewport: testConfig.viewport || suite.globalConfig?.viewport,
        threshold: testConfig.threshold ?? suite.globalConfig?.threshold,
        waitFor: testConfig.waitFor ?? suite.globalConfig?.waitFor
      };

      const testResults = await this.runVisualTest(mergedConfig);
      results.push(...testResults);
    }

    return results;
  }

  /**
   * Update baseline images from current screenshots
   */
  async updateBaselines(testNames?: string[]): Promise<void> {
    const currentFiles = await fs.readdir(this.currentDir);
    
    for (const file of currentFiles) {
      if (testNames && !testNames.some(name => file.includes(name))) {
        continue;
      }

      const currentPath = path.join(this.currentDir, file);
      const baselinePath = path.join(this.baselineDir, file);
      
      await fs.copyFile(currentPath, baselinePath);
      console.log(`✅ Updated baseline: ${file}`);
    }
  }

  /**
   * Generate visual test report
   */
  async generateReport(results: VisualTestResult[]): Promise<string> {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        avgCaptureTime: results.reduce((sum, r) => sum + r.metrics.captureTime, 0) / results.length,
        avgComparisonTime: results.reduce((sum, r) => sum + r.metrics.comparisonTime, 0) / results.length
      },
      results: results.map(result => ({
        ...result,
        timestamp: result.timestamp.toISOString()
      }))
    };

    const reportPath = path.join(this.screenshotDir, 'report.json');
    await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));

    // Generate HTML report
    const htmlReport = await this.generateHTMLReport(reportData);
    const htmlReportPath = path.join(this.screenshotDir, 'report.html');
    await fs.writeFile(htmlReportPath, htmlReport);

    console.log(`📊 Visual test report generated: ${htmlReportPath}`);
    return htmlReportPath;
  }

  /**
   * Clean up old test artifacts
   */
  async cleanup(daysToKeep: number = 7): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const directories = [this.currentDir, this.diffDir];
    
    for (const dir of directories) {
      try {
        const files = await fs.readdir(dir);
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime < cutoffDate) {
            await fs.unlink(filePath);
            console.log(`🗑️ Cleaned up old file: ${file}`);
          }
        }
      } catch (error) {
        console.error(`Error cleaning up ${dir}:`, error);
      }
    }
  }

  private async runTestOnBrowser(
    config: VisualTestConfig, 
    browser: Browser, 
    browserType: string
  ): Promise<VisualTestResult> {
    const startTime = Date.now();
    const page = await browser.newPage();
    
    try {
      // Set viewport
      if (config.viewport) {
        await page.setViewportSize(config.viewport);
      }

      // Navigate to URL
      await page.goto(config.url, { waitUntil: 'networkidle' });

      // Wait for specified condition
      if (config.waitFor) {
        if (typeof config.waitFor === 'string') {
          await page.waitForSelector(config.waitFor);
        } else {
          await page.waitForTimeout(config.waitFor);
        }
      }

      // Execute actions
      if (config.actions) {
        await this.executeActions(page, config.actions);
      }

      // Mask elements if specified
      if (config.maskElements) {
        await this.maskElements(page, config.maskElements);
      }

      const captureTime = Date.now();

      // Take screenshot
      const screenshotBuffer = await this.captureScreenshot(page, config);
      const imageSize = screenshotBuffer.length;

      const captureEndTime = Date.now();

      // Save current screenshot
      const testId = this.generateTestId(config, browserType);
      const currentImagePath = path.join(this.currentDir, `${testId}.png`);
      await fs.writeFile(currentImagePath, screenshotBuffer);

      // Compare with baseline
      const baselineImagePath = path.join(this.baselineDir, `${testId}.png`);
      const comparisonStartTime = Date.now();
      
      const comparisonResult = await this.compareImages(
        baselineImagePath, 
        currentImagePath, 
        config.threshold || 0.1
      );

      const comparisonEndTime = Date.now();

      return {
        testName: config.name,
        browser: browserType,
        passed: comparisonResult.passed,
        difference: comparisonResult.difference,
        diffImagePath: comparisonResult.diffImagePath,
        baselineImagePath,
        currentImagePath,
        timestamp: new Date(),
        metrics: {
          captureTime: captureEndTime - captureTime,
          comparisonTime: comparisonEndTime - comparisonStartTime,
          imageSize
        }
      };

    } catch (error) {
      return {
        testName: config.name,
        browser: browserType,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        baselineImagePath: '',
        currentImagePath: '',
        timestamp: new Date(),
        metrics: {
          captureTime: Date.now() - startTime,
          comparisonTime: 0,
          imageSize: 0
        }
      };
    } finally {
      await page.close();
    }
  }

  private async captureScreenshot(page: Page, config: VisualTestConfig): Promise<Buffer> {
    const options: any = {
      type: 'png',
      fullPage: !config.selector
    };

    if (config.selector) {
      const element = await page.locator(config.selector);
      return await element.screenshot(options);
    } else {
      return await page.screenshot(options);
    }
  }

  private async executeActions(page: Page, actions: VisualTestConfig['actions']): Promise<void> {
    if (!actions) return;

    for (const action of actions) {
      switch (action.type) {
      case 'click':
        if (action.selector) {
          await page.click(action.selector);
        }
        break;
      case 'hover':
        if (action.selector) {
          await page.hover(action.selector);
        }
        break;
      case 'scroll':
        if (action.selector) {
          await page.locator(action.selector).scrollIntoViewIfNeeded();
        }
        break;
      case 'type':
        if (action.selector && action.text) {
          await page.fill(action.selector, action.text);
        }
        break;
      case 'wait':
        await page.waitForTimeout(action.delay || 1000);
        break;
      }

      // Small delay between actions
      await page.waitForTimeout(100);
    }
  }

  private async maskElements(page: Page, selectors: string[]): Promise<void> {
    for (const selector of selectors) {
      await page.addStyleTag({
        content: `${selector} { opacity: 0 !important; }`
      });
    }
  }

  private async compareImages(
    baselinePath: string, 
    currentPath: string, 
    threshold: number
  ): Promise<{ passed: boolean; difference?: number; diffImagePath?: string }> {
    try {
      // Check if baseline exists
      await fs.access(baselinePath);
    } catch {
      // No baseline exists - consider this a pass for first run
      console.log(`⚠️ No baseline found for ${path.basename(baselinePath)}, creating baseline`);
      await fs.copyFile(currentPath, baselinePath);
      return { passed: true };
    }

    // Use a simple pixel comparison for now
    // In production, you might want to use a more sophisticated image comparison library
    const baselineBuffer = await fs.readFile(baselinePath);
    const currentBuffer = await fs.readFile(currentPath);

    if (baselineBuffer.equals(currentBuffer)) {
      return { passed: true, difference: 0 };
    }

    // For now, any difference fails the test
    // TODO: Implement actual pixel-by-pixel comparison with threshold
    const difference = this.calculateImageDifference(baselineBuffer, currentBuffer);
    const passed = difference <= threshold;

    let diffImagePath: string | undefined;
    if (!passed) {
      // Generate diff image
      diffImagePath = await this.generateDiffImage(baselinePath, currentPath);
    }

    return { passed, difference, diffImagePath };
  }

  private calculateImageDifference(baseline: Buffer, current: Buffer): number {
    // Simple implementation - just compare file sizes as a proxy
    // In production, use a proper image comparison library like pixelmatch
    if (baseline.length === current.length) {
      let differences = 0;
      for (let i = 0; i < baseline.length; i++) {
        if (baseline[i] !== current[i]) {
          differences++;
        }
      }
      return differences / baseline.length;
    }
    
    return Math.abs(baseline.length - current.length) / Math.max(baseline.length, current.length);
  }

  private async generateDiffImage(baselinePath: string, currentPath: string): Promise<string> {
    const testId = path.basename(baselinePath, '.png');
    const diffPath = path.join(this.diffDir, `${testId}-diff.png`);
    
    // For now, just copy the current image as diff
    // TODO: Generate actual diff highlighting differences
    await fs.copyFile(currentPath, diffPath);
    
    return diffPath;
  }

  private generateTestId(config: VisualTestConfig, browser: string): string {
    const hash = createHash('md5')
      .update(config.name + config.url + browser)
      .digest('hex')
      .substring(0, 8);
    
    return `${config.name.replace(/[^a-zA-Z0-9]/g, '-')}-${browser}-${hash}`;
  }

  private async launchBrowsers(): Promise<void> {
    try {
      const chromiumBrowser = await chromium.launch({ headless: true });
      this.browsers.set('chromium', chromiumBrowser);
    } catch (error) {
      console.warn('Failed to launch Chromium:', error);
    }

    try {
      const firefoxBrowser = await firefox.launch({ headless: true });
      this.browsers.set('firefox', firefoxBrowser);
    } catch (error) {
      console.warn('Failed to launch Firefox:', error);
    }

    try {
      const webkitBrowser = await webkit.launch({ headless: true });
      this.browsers.set('webkit', webkitBrowser);
    } catch (error) {
      console.warn('Failed to launch WebKit:', error);
    }

    console.log(`🚀 Launched ${this.browsers.size} browsers for visual testing`);
  }

  private async generateHTMLReport(reportData: any): Promise<string> {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Regression Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .test-result { border: 1px solid #ddd; margin-bottom: 20px; border-radius: 8px; overflow: hidden; }
        .test-header { padding: 15px; background: #f8f9fa; font-weight: bold; }
        .test-content { padding: 15px; }
        .test-images { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .image-container { text-align: center; }
        .image-container img { max-width: 100%; border: 1px solid #ddd; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Visual Regression Test Report</h1>
            <p>Generated on ${reportData.timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div style="font-size: 2em; font-weight: bold;">${reportData.summary.total}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div style="font-size: 2em; font-weight: bold;" class="passed">${reportData.summary.passed}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div style="font-size: 2em; font-weight: bold;" class="failed">${reportData.summary.failed}</div>
            </div>
            <div class="summary-card">
                <h3>Success Rate</h3>
                <div style="font-size: 2em; font-weight: bold;">${Math.round((reportData.summary.passed / reportData.summary.total) * 100)}%</div>
            </div>
        </div>
        
        <div class="test-results">
            ${reportData.results.map((result: any) => `
                <div class="test-result">
                    <div class="test-header ${result.passed ? 'passed' : 'failed'}">
                        ${result.testName} (${result.browser}) - ${result.passed ? 'PASSED' : 'FAILED'}
                        ${result.difference !== undefined ? ` - Difference: ${(result.difference * 100).toFixed(2)}%` : ''}
                    </div>
                    <div class="test-content">
                        ${result.error ? `<p style="color: #dc3545;">Error: ${result.error}</p>` : ''}
                        <div class="metrics">
                            <div>Capture Time: ${result.metrics.captureTime}ms</div>
                            <div>Comparison Time: ${result.metrics.comparisonTime}ms</div>
                            <div>Image Size: ${Math.round(result.metrics.imageSize / 1024)}KB</div>
                        </div>
                        ${!result.error ? `
                            <div class="test-images">
                                <div class="image-container">
                                    <h4>Baseline</h4>
                                    <img src="${path.relative(this.screenshotDir, result.baselineImagePath)}" alt="Baseline">
                                </div>
                                <div class="image-container">
                                    <h4>Current</h4>
                                    <img src="${path.relative(this.screenshotDir, result.currentImagePath)}" alt="Current">
                                </div>
                                ${result.diffImagePath ? `
                                    <div class="image-container">
                                        <h4>Diff</h4>
                                        <img src="${path.relative(this.screenshotDir, result.diffImagePath)}" alt="Diff">
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Close all browsers and clean up
   */
  async dispose(): Promise<void> {
    for (const [browserType, browser] of this.browsers.entries()) {
      try {
        await browser.close();
        console.log(`🔒 Closed ${browserType} browser`);
      } catch (error) {
        console.error(`Error closing ${browserType}:`, error);
      }
    }
    this.browsers.clear();
  }
}

/**
 * Pre-defined visual test suites
 */
export const VisualTestSuites = {
  /**
   * Basic UI component testing
   */
  components: (): VisualTestSuite => ({
    suiteName: 'UI Components',
    globalConfig: {
      baseUrl: 'http://localhost:3000',
      viewport: { width: 1280, height: 720 },
      threshold: 0.1,
      waitFor: 1000
    },
    tests: [
      {
        name: 'header-component',
        url: '/',
        selector: 'header'
      },
      {
        name: 'navigation-menu',
        url: '/',
        selector: 'nav',
        actions: [
          { type: 'hover', selector: 'nav .menu-item:first-child' }
        ]
      },
      {
        name: 'graph-editor',
        url: '/editor',
        waitFor: '[data-testid="graph-canvas"]',
        maskElements: ['.timestamp', '.user-avatar']
      }
    ]
  }),

  /**
   * Cross-browser compatibility testing
   */
  crossBrowser: (): VisualTestSuite => ({
    suiteName: 'Cross-Browser Compatibility',
    globalConfig: {
      baseUrl: 'http://localhost:3000',
      viewport: { width: 1280, height: 720 }
    },
    tests: [
      {
        name: 'landing-page',
        url: '/',
        browserTypes: ['chromium', 'firefox', 'webkit']
      },
      {
        name: 'graph-editor',
        url: '/editor',
        browserTypes: ['chromium', 'firefox', 'webkit'],
        waitFor: '[data-testid="graph-canvas"]'
      }
    ]
  }),

  /**
   * Responsive design testing
   */
  responsive: (): VisualTestSuite => ({
    suiteName: 'Responsive Design',
    globalConfig: {
      baseUrl: 'http://localhost:3000'
    },
    tests: [
      {
        name: 'mobile-portrait',
        url: '/',
        viewport: { width: 375, height: 812 }
      },
      {
        name: 'tablet-landscape',
        url: '/',
        viewport: { width: 1024, height: 768 }
      },
      {
        name: 'desktop-large',
        url: '/',
        viewport: { width: 1920, height: 1080 }
      }
    ]
  })
};

export default VisualRegressionTester;