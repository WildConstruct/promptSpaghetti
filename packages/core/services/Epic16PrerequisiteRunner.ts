/**
 * Epic 16 Prerequisite Runner
 * 
 * CLI and programmatic runner for Epic 16 prerequisite checks with
 * formatted reporting, auto-fix capabilities, and progress monitoring.
 */
import { Epic16PrerequisiteSystem, PrerequisiteReport, Epic16PrerequisiteConfig } from './Epic16PrerequisiteSystem';
import * as fs from 'fs/promises';
import * as path from 'path';

// =============================================================================
// CLI and Runner Types
// =============================================================================


export interface PrerequisiteRunnerOptions { // Check options
  categories?: string;
  skipChecks?: string;
  onlyChecks?: string;
  // Execution options
  autoFix?: boolean;
  timeout?: number;
  concurrency?: number;
  // Output options
  format?: 'console' | 'json' | 'html' | 'markdown';
  outputFile?: string;
  verbose?: boolean;
  colors?: boolean;
  // Configuration
  configFile?: string;
  environment?: 'development' | 'staging' | 'production' }




export interface PrerequisiteRunnerResult {
  success: boolean;
  report: PrerequisiteReport;
  autoFixResults?: Record<string, boolean>;
  outputPath?: string;
  duration: number;
  // =============================================================================
  // Prerequisite Runner Implementation
  // =============================================================================


export class Epic16PrerequisiteRunner {
  private system: Epic16PrerequisiteSystem;
  private options: PrerequisiteRunnerOptions;
  constructor(options: PrerequisiteRunnerOptions = {}) { this.options = {
  format: 'console'
  verbose: false
  colors: true
  environment: 'development'
  timeout: 30000
  concurrency: 5 }
  ...options
};
    this.system = new Epic16PrerequisiteSystem(this.buildSystemConfig());
    this.setupEventListeners();
  /**
   * Run prerequisite checks with the configured options
   */
  public async run(): Promise<PrerequisiteRunnerResult> { const startTime = Date.now();
  try {
  // Load configuration if specified
  if (this.options.configFile) {
  await this.loadConfigFile(this.options.configFile);
  // Filter checks based on options
  this.filterChecks();
  // Run prerequisite checks
  this.log('🔍 Starting Epic 16 prerequisite checks...', 'info');
  const report = await this.system.runAllChecks();
  // Auto-fix if enabled
  let autoFixResults: Record<string, boolean> | undefined;
  if (this.options.autoFix && !report.overall.passed) {
  this.log('🔧 Running auto-fix for failed checks...', 'info');
  autoFixResults = await this.system.autoFixFailures();
  // Re-run checks after auto-fix
  this.log('🔍 Re-running checks after auto-fix...', 'info');
  const updatedReport = await this.system.runAllChecks();
  Object.assign(report, updatedReport);
  // Generate output
  const outputPath = await this.generateOutput(report, autoFixResults);
  const duration = Date.now() - startTime;
  const result: PrerequisiteRunnerResult = {
  success: report.overall.passed
  report
  autoFixResults
  outputPath }
  duration
};
      // Display summary
      this.displaySummary(result);
      return result;
 catch (error) {
      this.log(`❌ Prerequisite check failed: ${error instanceof Error ? error.message : String(error)}`, 'error');}
      throw error;
  /**
   * Run quick status check for monitoring
   */
  public async getQuickStatus(): Promise<{ status: 'healthy' | 'degraded' | 'critical' }
  message: string;
  details: any;
> {

    try {
      const quickStatus = await this.system.getQuickStatus();
      let message: string;
      switch (quickStatus.overall) {
      case 'healthy':
        message = '✅ All critical prerequisites are healthy';
        break;
      case 'degraded':
        message = `⚠️ ${quickStatus.criticalFailures} critical prerequisite(s) failing`;}
        break;
      case 'critical':
        message = `❌ ${quickStatus.criticalFailures} critical prerequisites failing - Epic 16 may not function properly`;}
        break;
      return { status: quickStatus.overall,
  message,
  details: quickStatus }
};
 catch (error) { return {
        status: 'critical' }
        message: `❌ Unable to check prerequisite status: ${error instanceof Error ? error.message : String(error)}`}
},
  details: { error: String(error) }
      };
  // =============================================================================
  // Private Implementation Methods
  // =============================================================================
  private buildSystemConfig(): Epic16PrerequisiteConfig { return {
  enabledCategories: this.options.categories || ['epic_dependency', 'infrastructure', 'service', 'configuration', 'security'],
  skipChecks: this.options.skipChecks || [],
  autoFixEnabled: this.options.autoFix || false,
  timeoutMs: this.options.timeout || 30000,
  concurrentChecks: this.options.concurrency || 5,
  retryAttempts: 2,
  saveReports: true,
  reportRetentionDays: 30,
  services: {,
  authService: process.env.EPIC11_AUTH_SERVICE_URL,
  analyticsService: process.env.EPIC13_ANALYTICS_SERVICE_URL,
  elasticSearch: process.env.ELASTICSEARCH_URL,
  redis: process.env.REDIS_URL,
  postgres: process.env.DATABASE_URL,
  stripe: process.env.STRIPE_SECRET_KEY,
  claude: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY }
},
  environment: this.options.environment || 'development';
  };
  private setupEventListeners(): void {
    if (this.options.verbose) {
      this.system.on('checks_started', (data) => {
        this.log(`🚀 Starting ${data.totalChecks} prerequisite checks...`, 'info');}
      });
      this.system.on('check_started', (data) => {
        this.log(`  ⏳ Checking: ${data.check.name}`, 'debug');}
      });
      this.system.on('check_completed', (data) => {
        const icon = data.result.passed ? '✅' : '❌';
        this.log(`  ${icon} ${data.checkId}: ${data.result.message}`, data.result.passed ? 'debug' : 'warn');}
      });
      this.system.on('autofix_started', (data) => {
        this.log(`  🔧 Auto-fixing: ${data.checkId}`, 'info');}
      });
      this.system.on('autofix_completed', (data) => {
        const icon = data.success ? '✅' : '❌';
        this.log(`  ${icon} Auto-fix ${data.success ? 'succeeded' : 'failed'}: ${data.checkId}`, data.success ? 'info' : 'warn');}
      });
  private async loadConfigFile(configPath: string): Promise<void> {

    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent);
      // Merge with existing options
      Object.assign(this.options, config);
      this.log(`📄 Loaded configuration from ${configPath}`, 'info');}
 catch (error) {
      this.log(`⚠️ Failed to load configuration file ${configPath}: ${error instanceof Error ? error.message : String(error)}`, 'warn');}
  private filterChecks(): void {
    // Implementation would filter the checks in the system based on options
    // This is a placeholder for the filtering logic
    if (this.options.onlyChecks && this.options.onlyChecks.length > 0) {
      this.log(`🎯 Running only specified checks: ${this.options.onlyChecks.join(', ')}`, 'info');}
    if (this.options.skipChecks && this.options.skipChecks.length > 0) {
      this.log(`⏭️ Skipping checks: ${this.options.skipChecks.join(', ')}`, 'info');}
  private async generateOutput(report: PrerequisiteReport, autoFixResults?: Record<string, boolean>): Promise<string | undefined> {

    if (!this.options.outputFile && this.options.format === 'console') {
      return undefined;
    let output: string;
    let extension: string;
    switch (this.options.format) {
    case 'json':
      output = JSON.stringify({ report, autoFixResults }, null, 2);
      extension = 'json';
      break;
    case 'html':
      output = this.generateHTMLReport(report, autoFixResults);
      extension = 'html';
      break;
    case 'markdown':
      output = this.generateMarkdownReport(report, autoFixResults);
      extension = 'md';
      break;
    case 'console':
    default:
      return undefined;
    if (this.options.outputFile) { await fs.writeFile(this.options.outputFile, output, 'utf-8');
      return this.options.outputFile } else {
      // Generate default filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `epic16-prerequisites-${timestamp}.${extension}`;}
      const outputPath = path.join(process.cwd(), filename);
      await fs.writeFile(outputPath, output, 'utf-8');
      return outputPath;
  private generateHTMLReport(report: PrerequisiteReport, autoFixResults?: Record<string, boolean>): string { const statusColor = report.overall.passed ? '#10b981' : '#ef4444';
    const statusText = report.overall.passed ? 'PASSED' : 'FAILED';
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Epic 16 Prerequisites Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px }
        .header { text-align: center; margin-bottom: 30px }
        .status { font-size: 24px; font-weight: bold; color: ${statusColor}; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center }
        .summary-card h3 { margin: 0 0 10px 0; color: #666 }
        .summary-card .value { font-size: 28px; font-weight: bold; color: #333 }
        .categories { margin-bottom: 30px }
        .category { margin-bottom: 20px }
        .category h3 { margin: 0 0 10px 0; padding: 10px; background: #e9ecef; border-radius: 4px }
        .checks { margin-left: 20px }
        .check { display: flex; align-items: center; padding: 8px; margin: 4px 0; border-radius: 4px }
        .check.passed { background: #d1fae5 }
        .check.failed { background: #fee2e2 }
        .check-icon { margin-right: 10px; font-size: 16px }
        .check-name { font-weight: 500; flex: 1 }
        .check-message { color: #666; font-size: 14px }
        .recommendations { background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107 }
        .autofix-results { background: #e7f3ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0066cc; margin-top: 20px }
        .timestamp { text-align: center; color: #666; font-size: 14px; margin-top: 30px }
    </style>
</head>
<body>
    <div class="header">
        <h1>Epic 16 Prerequisites Report</h1>
        <div class="status">${statusText}</div>}
        <p>Generated on ${report.generatedAt.toLocaleString()}</p>}
    </div>
    <div class="summary">
        <div class="summary-card">
            <h3>Total Checks</h3>
            <div class="value">${report.overall.totalChecks}</div>}
        </div>
        <div class="summary-card">
            <h3>Passed</h3>
            <div class="value" style="color: #10b981;">${report.overall.passedChecks}</div>}
        </div>
        <div class="summary-card">
            <h3>Failed</h3>
            <div class="value" style="color: #ef4444;">${report.overall.failedChecks}</div>}
        </div>
        <div class="summary-card">
            <h3>Critical Failures</h3>
            <div class="value" style="color: #dc2626;">${report.overall.criticalFailures}</div>}
        </div>
        <div class="summary-card">
            <h3>Est. Fix Time</h3>
            <div class="value">${report.overall.estimatedFixTime}m</div>}
        </div>
    </div>
    <div class="categories">
        ${Object.entries(report.categories).map(([category, stats]) => `}
            <div class="category">
                <h3>${category.replace(/_/g, ' ').toUpperCase()}</h3>}
                <div class="checks">
                    ${Object.entries(report.results)}
    .filter(([checkId]) => {
      // Find the check category (this is simplified)
      return true; // Would need to implement proper category filtering

    .map(([checkId, result]) => `
                        <div class="check ${result.passed ? 'passed' : 'failed'}">}
                            <span class="check-icon">${result.passed ? '✅' : '❌'}</span>}
                            <span class="check-name">${checkId}</span>}
                            <span class="check-message">${result.message}</span>}
                        </div>
                      `).join('')}
                </div>
            </div>
        `).join('')}
    </div>
    ${report.recommendations.length > 0 ? `}
        <div class="recommendations">
            <h3>📋 Recommendations</h3>
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    ` : ''}
    ${autoFixResults ? `}
        <div class="autofix-results">
            <h3>🔧 Auto-Fix Results</h3>
            <ul>
                ${Object.entries(autoFixResults).map(([checkId, success]) => `}
                    <li>${success ? '✅' : '❌'} ${checkId}: ${success ? 'Fixed' : 'Failed to fix'}</li>}
                `).join('')}
            </ul>
        </div>
    ` : ''}
    <div class="timestamp">
        Report ID: ${report.reportId} | Version: ${report.version}
    </div>
</body>
</html>`;
  private generateMarkdownReport(report: PrerequisiteReport, autoFixResults?: Record<string, boolean>): string {
    const statusEmoji = report.overall.passed ? '✅' : '❌';
    const statusText = report.overall.passed ? 'PASSED' : 'FAILED';
    let markdown = '# Epic 16 Prerequisites Report\n\n';
    markdown += `## ${statusEmoji} Overall Status: ${statusText}\n\n`;}
    markdown += `**Generated:** ${report.generatedAt.toLocaleString()}\n`;}
    markdown += `**Report ID:** ${report.reportId}\n`;}
    markdown += `**Version:** ${report.version}\n\n`;}
    // Summary
    markdown += '## 📊 Summary\n\n';
    markdown += '| Metric | Value |\n';
    markdown += '|--------|-------|\n';
    markdown += `| Total Checks | ${report.overall.totalChecks} |\n`;}
    markdown += `| Passed | ${report.overall.passedChecks} |\n`;}
    markdown += `| Failed | ${report.overall.failedChecks} |\n`;}
    markdown += `| Critical Failures | ${report.overall.criticalFailures} |\n`;}
    markdown += `| Estimated Fix Time | ${report.overall.estimatedFixTime} minutes |\n\n`;}
    // Categories
    markdown += '## 📋 Categories\n\n';
    for (const [category, stats] of Object.entries(report.categories)) {
      const categoryEmoji = stats.passed ? '✅' : '❌';
      markdown += `### ${categoryEmoji} ${category.replace(/_/g, ' ').toUpperCase()}\n\n`;}
      markdown += `- **Checks:** ${stats.checks}\n`;}
      markdown += `- **Failures:** ${stats.failures}\n\n`;}
    // Detailed Results
    markdown += '## 🔍 Detailed Results\n\n';
    for (const [checkId, result] of Object.entries(report.results)) {
      const checkEmoji = result.passed ? '✅' : '❌';
      markdown += `### ${checkEmoji} ${checkId}\n\n`;}
      markdown += `**Message:** ${result.message}\n\n`;}
      if (result.recommendation) {
        markdown += `**Recommendation:** ${result.recommendation}\n\n`;}
      if (result.errorCode) {
        markdown += `**Error Code:** ${result.errorCode}\n\n`;}
    // Recommendations
    if (report.recommendations.length > 0) {
      markdown += '## 💡 Recommendations\n\n';
      for (const recommendation of report.recommendations) {
        markdown += `- ${recommendation}\n`;}
      markdown += '\n';
    // Auto-fix results
    if (autoFixResults) {
      markdown += '## 🔧 Auto-Fix Results\n\n';
      for (const [checkId, success] of Object.entries(autoFixResults)) {
        const fixEmoji = success ? '✅' : '❌';
        markdown += `- ${fixEmoji} **${checkId}:** ${success ? 'Fixed successfully' : 'Failed to fix'}\n`;}
      markdown += '\n';
    return markdown;
  private displaySummary(result: PrerequisiteRunnerResult): void {
    const { report, autoFixResults, duration } = result;
    this.log('', 'info'); // Empty line
    this.log('═'.repeat(60), 'info');
    this.log('📊 EPIC 16 PREREQUISITES SUMMARY', 'info');
    this.log('═'.repeat(60), 'info');
    // Overall status
    const statusIcon = report.overall.passed ? '✅' : '❌';
    const statusText = report.overall.passed ? 'PASSED' : 'FAILED';
    const statusColor = report.overall.passed ? 'green' : 'red';
    this.log(`${statusIcon} Overall Status: ${statusText}`, statusColor);}
    this.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`, 'info');}
    this.log('', 'info');
    // Metrics
    this.log('📈 Metrics:', 'info');
    this.log(`   Total Checks: ${report.overall.totalChecks}`, 'info');}
    this.log(`   Passed: ${report.overall.passedChecks}`, 'green');}
    this.log(`   Failed: ${report.overall.failedChecks}`, report.overall.failedChecks > 0 ? 'red' : 'info');}
    this.log(`   Critical Failures: ${report.overall.criticalFailures}`, report.overall.criticalFailures > 0 ? 'red' : 'info');}
    if (report.overall.estimatedFixTime > 0) {
      this.log(`   Estimated Fix Time: ${report.overall.estimatedFixTime} minutes`, 'yellow');}
    this.log('', 'info');
    // Categories summary
    this.log('📂 Categories:', 'info');
    for (const [category, stats] of Object.entries(report.categories)) {
      const categoryIcon = stats.passed ? '✅' : '❌';
      const categoryName = category.replace(/_/g, ' ').toUpperCase();
      this.log(`   ${categoryIcon} ${categoryName}: ${stats.checks - stats.failures}/${stats.checks} passed`, stats.passed ? 'green' : 'red');}
    // Auto-fix results
    if (autoFixResults) {
      this.log('', 'info');
      this.log('🔧 Auto-Fix Results:', 'info');
      const fixedCount = Object.values(autoFixResults).filter(Boolean).length;
      const totalFixes = Object.keys(autoFixResults).length;
      this.log(`   Fixed: ${fixedCount}/${totalFixes}`, fixedCount > 0 ? 'green' : 'info');}
      for (const [checkId, success] of Object.entries(autoFixResults)) {
        const fixIcon = success ? '✅' : '❌';
        this.log(`   ${fixIcon} ${checkId}`, success ? 'green' : 'red');}
    // Recommendations
    if (report.recommendations.length > 0) {
      this.log('', 'info');
      this.log('💡 Key Recommendations:', 'info');
      for (const recommendation of report.recommendations.slice(0, 3)) {
        this.log(`   • ${recommendation}`, 'yellow');}
      if (report.recommendations.length > 3) {
        this.log(`   ... and ${report.recommendations.length - 3} more`, 'info');}
    // Output file
    if (result.outputPath) {
      this.log('', 'info');
      this.log(`📄 Report saved to: ${result.outputPath}`, 'info');}
    this.log('═'.repeat(60), 'info');
    // Exit guidance
    if (!report.overall.passed) { this.log('', 'info');
      this.log('❌ Epic 16 prerequisites are not satisfied.', 'red');
      this.log('🔧 Run with --auto-fix to attempt automatic fixes.', 'yellow');
      this.log('📖 Check manual fix instructions for unresolved issues.', 'yellow') } else {
      this.log('', 'info');
      this.log('🎉 All Epic 16 prerequisites are satisfied!', 'green');
      this.log('🚀 Epic 16 marketplace and community features are ready to deploy.', 'green');
  private log(message: string, level: 'info' | 'warn' | 'error' | 'debug' | 'green' | 'red' | 'yellow' = 'info'): void {
    if (!this.options.verbose && level === 'debug') {
      return;
    let colorCode = '';
    if (this.options.colors) {
      switch (level) {
      case 'error':
      case 'red':
        colorCode = '\x1b[31m'; // Red
        break;
      case 'warn':
      case 'yellow':
        colorCode = '\x1b[33m'; // Yellow
        break;
      case 'green':
        colorCode = '\x1b[32m'; // Green
        break;
      case 'debug':
        colorCode = '\x1b[36m'; // Cyan
        break;
      case 'info':
      default:
        colorCode = '\x1b[0m'; // Reset
        break;
    const resetCode = this.options.colors ? '\x1b[0m' : '';
    console.log(`${colorCode}${message}${resetCode}`);}

// =============================================================================
// CLI Entry Point and Utilities
// =============================================================================
/**
 * Create a prerequisite runner with CLI-friendly defaults
 */
export function createEpic16PrerequisiteRunner(options: PrerequisiteRunnerOptions = {}): Epic16PrerequisiteRunner {
  return new Epic16PrerequisiteRunner(options);
/**
 * Run Epic 16 prerequisites with default settings (useful for npm scripts)
 */
export async function runEpic16Prerequisites(options: PrerequisiteRunnerOptions = {}): Promise<PrerequisiteRunnerResult> {

  const runner = createEpic16PrerequisiteRunner(options);
  return await runner.run();
/**
 * Quick health check for monitoring (returns exit code)
 */
export async function checkEpic16Health(): Promise<number> {

  const runner = createEpic16PrerequisiteRunner({ verbose: false });
  try { const status = await runner.getQuickStatus();
  console.log(status.message);
  switch (status.status) {
  case 'healthy':
  return 0;
  case 'degraded':
  return 1;
  case 'critical':
  default: }
  return 2;
 catch (error) {
    console.error(`❌ Health check failed: ${error instanceof Error ? error.message : String(error)}`);}
    return 3;

export default Epic16PrerequisiteRunner;