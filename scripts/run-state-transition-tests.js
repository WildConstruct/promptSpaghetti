#!/usr/bin/env node

/**
 * State Transition Test Runner
 * Orchestrates state transition tests with comprehensive reporting
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

class StateTransitionTestRunner {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.testDir = path.join(this.projectRoot, 'tests', 'state-transitions');
    this.reportDir = path.join(this.projectRoot, 'test-results', 'state-transitions');
    this.startTime = Date.now();
    
    this.testConfig = {
      timeout: 60000, // 60 seconds per test file
      maxRetries: 2,
      parallel: true,
      coverage: true,
      verbose: true
    };

    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      testFiles: [],
      coverage: null
    };


  log(message: string, level: string = 'info'): void {
    const timestamp = new Date().toISOString();
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
      header: chalk.cyan.bold
    };
    
    console.log(`[${timestamp}] ${colors[level] || chalk.white}${message}${chalk.reset('')}`);


  async run(options: any = {}): Promise<void> {
    this.log('🧪 Starting State Transition Tests...', 'header');
    
    const config = { ...this.testConfig, ...options };

    try {
      // Setup test environment
      await this.setupTestEnvironment();
      
      // Discovery test files
      const testFiles = await this.discoverTestFiles();
      this.log(`Found ${testFiles.length} test files`);

      // Run pre-test validation
      await this.validateTestEnvironment();

      // Execute tests
      if (config.parallel) {
        await this.runTestsInParallel(testFiles, config);
 else {
        await this.runTestsSequentially(testFiles, config);


      // Generate coverage report
      if (config.coverage) {
        await this.generateCoverageReport();


      // Generate comprehensive report
      await this.generateTestReport();

      // Cleanup
      await this.cleanup();

      this.log('✅ State transition tests completed successfully!', 'success');
      return this.results;
 catch (error) {
      this.log(`❌ Test run failed: ${error.message}`, 'error');
      throw error;



  async setupTestEnvironment(): Promise<void> {
    this.log('Setting up test environment...', 'info');
    
    // Create report directories
    await fs.mkdir(this.reportDir, { recursive: true });
    
    // Create test data directories
    const testDataDir = path.join(this.projectRoot, 'test-data');
    await fs.mkdir(testDataDir, { recursive: true });
    
    // Ensure clean state for tests
    await this.cleanupPreviousTestData();
    
    // Verify dependencies
    await this.verifyDependencies();


  async discoverTestFiles(): Promise<string[]> {
    const testFiles = [];
    
    try {
      const files = await fs.readdir(this.testDir);
      
      for (const file of files) {
        if (file.endsWith('.test.ts') || file.endsWith('.test.js')) {
          const filePath = path.join(this.testDir, file);
          const stats = await fs.stat(filePath);
          
          testFiles.push({
            name: file,
            path: filePath,
            size: stats.size,
            modified: stats.mtime
          });


 catch (error) {
      this.log(`Warning: Could not read test directory: ${error.message}`, 'warning');


    return testFiles.sort((a, b) => a.name.localeCompare(b.name));


  async validateTestEnvironment(): Promise<void> {
    this.log('Validating test environment...', 'info');
    
    // Check if Jest is available
    try {
      execSync('npx jest --version', { cwd: this.projectRoot, stdio: 'pipe' });
 catch (error) {
      throw new Error('Jest is not available. Please install Jest.');


    // Check if TypeScript compilation works
    try {
      execSync('npx tsc --noEmit --skipLibCheck', { 
        cwd: this.projectRoot, 
        stdio: 'pipe' 
      });
 catch (error) {
      this.log('Warning: TypeScript compilation issues detected', 'warning');


    // Verify StateLock utility exists
    const stateLockPath = path.join(this.projectRoot, 'src', 'utils', 'StateLock.js');
    try {
      await fs.access(stateLockPath);
 catch (error) {
      throw new Error('StateLock utility not found. Required for state transition tests.');


    this.log('✅ Environment validation passed', 'success');


  async runTestsInParallel(testFiles: string[], config: any): Promise<void> {
    this.log('Running tests in parallel...', 'info');
    
    const maxConcurrency = Math.min(testFiles.length, 4); // Limit concurrency
    const chunks = this.chunkArray(testFiles, maxConcurrency);
    
    for (const chunk of chunks) {
      const promises = chunk.map(testFile => this.runSingleTestFile(testFile, config));
      const chunkResults = await Promise.allSettled(promises);
      
      this.processTestResults(chunkResults, chunk);



  async runTestsSequentially(testFiles: string[], config: any): Promise<void> {
    this.log('Running tests sequentially...', 'info');
    
    for (const testFile of testFiles) {
      try {
        const result = await this.runSingleTestFile(testFile, config);
        this.processTestResults([{ status: 'fulfilled', value: result }], [testFile]);
 catch (error) {
        this.processTestResults([{ status: 'rejected', reason: error }], [testFile]);




  async runSingleTestFile(testFile, config) {
    const startTime = Date.now();
    this.log(`Running ${testFile.name}...`);

    const jestArgs = [
      'jest',
      `--testPathPattern=${testFile.name}`,
      '--testTimeout=' + config.timeout,
      '--verbose',
      '--no-cache'
    ];

    if (config.coverage) {
      jestArgs.push('--coverage');
      jestArgs.push('--coverageDirectory=' + path.join(this.reportDir, 'coverage'));


    try {
      const output = execSync(jestArgs.join(' '), {
        cwd: this.projectRoot,
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });

      const duration = Date.now() - startTime;
      const result = this.parseJestOutput(output, testFile.name, duration);
      
      this.log(`✅ ${testFile.name} completed in ${duration}ms`, 'success');
      return result;
 catch (error) {
      const duration = Date.now() - startTime;
      this.log(`❌ ${testFile.name} failed after ${duration}ms`, 'error');
      
      return {
        testFile: testFile.name,
        passed: false,
        duration,
        error: error.message,
        stdout: error.stdout || '',
        stderr: error.stderr || ''
      };



  parseJestOutput(output, testFile, duration) {
    const lines = output.split('\\n');
    const result = {
      testFile,
      passed: false,
      duration,
      tests: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      },
      suites: [],
      coverage: null
    };

    // Parse test results
    for (const line of lines) {
      if (line.includes('Tests:')) {
        const match = line.match(/Tests:\\s+(\\d+)\\s+passed/);
        if (match) {
          result.tests.passed = parseInt(match[1]);

        
        const failedMatch = line.match(/(\\d+)\\s+failed/);
        if (failedMatch) {
          result.tests.failed = parseInt(failedMatch[1]);

        
        const skippedMatch = line.match(/(\\d+)\\s+skipped/);
        if (skippedMatch) {
          result.tests.skipped = parseInt(skippedMatch[1]);

        
        const totalMatch = line.match(/(\\d+)\\s+total/);
        if (totalMatch) {
          result.tests.total = parseInt(totalMatch[1]);


      
      if (line.includes('Test Suites:') && line.includes('passed')) {
        result.passed = true;



    return result;


  processTestResults(results, testFiles) {
    results.forEach((result, index) => {
      const testFile = testFiles[index];
      
      if (result.status === 'fulfilled') {
        const testResult = result.value;
        this.results.testFiles.push(testResult);
        
        if (testResult.passed) {
          this.results.passed += testResult.tests.passed || 1;
 else {
          this.results.failed += testResult.tests.failed || 1;

        
        this.results.total += testResult.tests.total || 1;
        this.results.skipped += testResult.tests.skipped || 0;
 else {
        this.results.failed++;
        this.results.total++;
        this.results.testFiles.push({
          testFile: testFile.name,
          passed: false,
          error: result.reason.message
        });

    });


  async generateCoverageReport() {
    this.log('Generating coverage report...', 'info');
    
    try {
      // Run coverage analysis specifically for state transition code
      execSync([
        'npx jest',
        '--coverage',
        '--collectCoverageFrom="src/utils/StateLock.js"',
        '--collectCoverageFrom="tests/utils/StateTransitionTestFramework.ts"',
        '--coverageDirectory=' + path.join(this.reportDir, 'coverage'),
        '--coverageReporters=json,lcov,html,text'
      ].join(' '), {
        cwd: this.projectRoot,
        stdio: 'pipe'
      });

      this.log('✅ Coverage report generated', 'success');
 catch (error) {
      this.log(`Warning: Coverage generation failed: ${error.message}`, 'warning');



  async generateTestReport() {
    this.results.duration = Date.now() - this.startTime;
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        skipped: this.results.skipped,
        passRate: this.results.total > 0 ? (this.results.passed / this.results.total * 100).toFixed(2) + '%' : '0%',
        duration: this.results.duration + 'ms'
      },
      testFiles: this.results.testFiles,
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage()

    };

    // Generate JSON report
    const jsonReportPath = path.join(this.reportDir, 'state-transition-report.json');
    await fs.writeFile(jsonReportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHtmlReport(report);
    const htmlReportPath = path.join(this.reportDir, 'state-transition-report.html');
    await fs.writeFile(htmlReportPath, htmlReport);

    this.log('📊 Reports generated:', 'info');
    this.log(`   JSON: ${jsonReportPath}`, 'info');
    this.log(`   HTML: ${htmlReportPath}`, 'info');

    // Console summary
    this.printSummary(report.summary);


  generateHtmlReport(report) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>State Transition Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .test-file { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .test-file.passed { border-left: 4px solid #28a745; }
        .test-file.failed { border-left: 4px solid #dc3545; }
        .timestamp { color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>State Transition Test Report</h1>
        <div class="timestamp">Generated: ${report.timestamp}</div>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <div style="font-size: 2em;">${report.summary.total}</div>
        </div>
        <div class="metric">
            <h3>Passed</h3>
            <div style="font-size: 2em;" class="passed">${report.summary.passed}</div>
        </div>
        <div class="metric">
            <h3>Failed</h3>
            <div style="font-size: 2em;" class="failed">${report.summary.failed}</div>
        </div>
        <div class="metric">
            <h3>Pass Rate</h3>
            <div style="font-size: 2em;">${report.summary.passRate}</div>
        </div>
        <div class="metric">
            <h3>Duration</h3>
            <div style="font-size: 2em;">${report.summary.duration}</div>
        </div>
    </div>
    
    <h2>Test Files</h2>
    ${report.testFiles.map(testFile => `
        <div class="test-file ${testFile.passed ? 'passed' : 'failed'}">
            <h3>${testFile.testFile}</h3>
            <p>Status: <span class="${testFile.passed ? 'passed' : 'failed'}">${testFile.passed ? 'PASSED' : 'FAILED'}</span></p>
            ${testFile.duration ? `<p>Duration: ${testFile.duration}ms</p>` : ''}
            ${testFile.tests ? `
                <p>Tests: ${testFile.tests.passed} passed, ${testFile.tests.failed} failed, ${testFile.tests.skipped} skipped of ${testFile.tests.total} total</p>
            ` : ''}
            ${testFile.error ? `<pre style="background: #f8f9fa; padding: 10px; border-radius: 3px;">${testFile.error}</pre>` : ''}
        </div>
    `).join('')}
    
</body>
</html>`;


  printSummary(summary) {
    this.log('\\n📊 Test Summary:', 'header');
    this.log(`Total: ${summary.total}`, 'info');
    this.log(`Passed: ${summary.passed}`, 'success');
    this.log(`Failed: ${summary.failed}`, summary.failed > 0 ? 'error' : 'info');
    this.log(`Skipped: ${summary.skipped}`, 'warning');
    this.log(`Pass Rate: ${summary.passRate}`, summary.passRate === '100.00%' ? 'success' : 'warning');
    this.log(`Duration: ${summary.duration}`, 'info');


  async cleanupPreviousTestData() {
    const testDataDir = path.join(this.projectRoot, 'test-data');
    
    try {
      const files = await fs.readdir(testDataDir);
      for (const file of files) {
        if (file.startsWith('test-state-') || file.startsWith('edge-case-state-')) {
          await fs.unlink(path.join(testDataDir, file));


 catch (error) {
      // Directory might not exist



  async verifyDependencies() {
    const requiredPackages = [
      '@types/jest',
      'jest',
      'ts-jest',
      'typescript'
    ];

    for (const pkg of requiredPackages) {
      try {
        require.resolve(pkg);
 catch (error) {
        this.log(`Warning: ${pkg} not found`, 'warning');




  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));

    return chunks;


  async cleanup() {
    this.log('Cleaning up test environment...', 'info');
    await this.cleanupPreviousTestData();



// CLI mode
if (require.main === module) {
  const runner = new StateTransitionTestRunner();
  const args = process.argv.slice(2);
  
  const options = {
    parallel: !args.includes('--sequential'),
    coverage: !args.includes('--no-coverage'),
    verbose: args.includes('--verbose'),
    timeout: parseInt(args.find(arg => arg.startsWith('--timeout='))?.split('=')[1]) || 60000
  };
  
  async function main() {
    try {
      await runner.run(options);
      process.exit(0);
 catch (error) {
      console.error('Test run failed:', error.message);
      process.exit(1);


  
  main();


module.exports = StateTransitionTestRunner;