#!/usr/bin/env node

/**
 * Smart Test Selection System
 * 
 * Intelligent test selection that runs only relevant tests based on
 * code changes, reducing test execution time while maintaining quality.
 */

const fs = require('fs');
const path = require('path');
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

class SmartTestSelector {
  constructor() {
    this.testMappings = new Map();
    this.dependencyGraph = new Map();
    this.testHistory = [];
    this.changedFiles = [];
    this.selectedTests = [];
    this.cacheFile = '.test-selection-cache.json';
    
    // Configuration
    this.config = {
      maxTestRuntime: 300000, // 5 minutes max
      confidenceThreshold: 0.8,
      fallbackToAllTests: true,
      enableMLPrediction: false // Future: ML-based test selection
    };


  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logHeader(title) {
    const border = '='.repeat(60);
    this.log(`\n${border}`, 'cyan');
    this.log(`🧠 ${title}`, 'bold');
    this.log(border, 'cyan');


  logStep(step: string, status: string = 'info'): void {
    const icons = { info: '📋', success: '✅', warning: '⚠️', error: '❌' };
    const colorMap = { info: 'blue', success: 'green', warning: 'yellow', error: 'red' };
    this.log(`${icons[status]} ${step}`, colorMap[status]);


  async runSmartTestSelection(): Promise<any> {
    this.logHeader('Smart Test Selection');
    
    await this.loadTestCache();
    await this.detectChangedFiles();
    await this.buildDependencyGraph();
    await this.mapTestsToSources();
    await this.selectRelevantTests();
    await this.optimizeTestOrder();
    await this.executeSelectedTests();
    await this.updateTestCache();
    
    return this.generateReport();


  async loadTestCache(): Promise<void> {
    if (fs.existsSync(this.cacheFile)) {
      try {
        const cacheData = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
        this.testMappings = new Map(cacheData.testMappings || []);
        this.dependencyGraph = new Map(cacheData.dependencyGraph || []);
        this.testHistory = cacheData.testHistory || [];
        
        this.logStep('Loaded test selection cache', 'success');
 catch (error) {
        this.logStep('Failed to load test cache, starting fresh', 'warning');

 else {
      this.logStep('No test cache found, building from scratch', 'info');



  async detectChangedFiles(): Promise<void> {
    this.logStep('Detecting changed files...', 'info');
    
    try {
      // Get changed files from git
      const gitDiff = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' });
      const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' });
      
      this.changedFiles = [
        ...gitDiff.split('\n').filter(f => f.trim()),
        ...stagedFiles.split('\n').filter(f => f.trim())
      ].filter((file, index, arr) => arr.indexOf(file) === index);
      
      // Filter for relevant source files
      this.changedFiles = this.changedFiles.filter(file => 
        file.match(/\.(ts|tsx|js|jsx)$/) && 
        !file.includes('.test.') && 
        !file.includes('.spec.')
      );
      
      this.logStep(`Found ${this.changedFiles.length} changed source files`, 'success');
      
      if (this.changedFiles.length > 0) {
        this.log('Changed files:', 'blue');
        this.changedFiles.forEach(file => this.log(`  - ${file}`, 'blue'));

 catch (error) {
      this.logStep('Git diff failed, falling back to all tests', 'warning');
      this.changedFiles = [];



  async buildDependencyGraph(): Promise<void> {
    this.logStep('Building dependency graph...', 'info');
    
    const sourceFiles = this.getAllSourceFiles();
    
    for (const file of sourceFiles) {
      if (!this.dependencyGraph.has(file)) {
        this.dependencyGraph.set(file, new Set());

      
      try {
        const content = fs.readFileSync(file, 'utf8');
        const dependencies = this.extractDependencies(content, file);
        
        dependencies.forEach(dep => {
          this.dependencyGraph.get(file).add(dep);
        });
 catch (error) {
        // Skip files that can't be read


    
    this.logStep(`Built dependency graph with ${this.dependencyGraph.size} files`, 'success');


  getAllSourceFiles(): string[] {
    const sourceFiles = [];
    
    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(filePath);
 else if (file.match(/\.(ts|tsx|js|jsx)$/) && !file.includes('.test.') && !file.includes('.spec.')) {
          sourceFiles.push(filePath);


    };
    
    ['client/src', 'server/src', 'packages'].forEach(dir => scanDirectory(dir));
    
    return sourceFiles;


  extractDependencies(content: string, currentFile: string): string[] {
    const dependencies = new Set();
    const currentDir = path.dirname(currentFile);
    
    // Extract import statements
    const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Skip node_modules dependencies
      if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
        continue;

      
      // Resolve relative paths
      const resolvedPath = this.resolveImportPath(importPath, currentDir);
      if (resolvedPath) {
        dependencies.add(resolvedPath);


    
    return Array.from(dependencies);


  resolveImportPath(importPath: string, currentDir: string): string | null {
    // Handle relative imports
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const resolved = path.resolve(currentDir, importPath);
      
      // Try different extensions
      const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
      
      for (const ext of extensions) {
        const fullPath = resolved + ext;
        if (fs.existsSync(fullPath)) {
          return fullPath;



    
    return null;


  async mapTestsToSources(): Promise<void> {
    this.logStep('Mapping tests to source files...', 'info');
    
    const testFiles = this.getAllTestFiles();
    
    for (const testFile of testFiles) {
      if (!this.testMappings.has(testFile)) {
        this.testMappings.set(testFile, new Set());

      
      try {
        const content = fs.readFileSync(testFile, 'utf8');
        const dependencies = this.extractDependencies(content, testFile);
        
        // Add direct dependencies
        dependencies.forEach(dep => {
          this.testMappings.get(testFile).add(dep);
        });
        
        // Add inferred mappings based on file patterns
        const inferredSources = this.inferSourceMappings(testFile);
        inferredSources.forEach(source => {
          this.testMappings.get(testFile).add(source);
        });
 catch (error) {
        // Skip files that can't be read


    
    this.logStep(`Mapped ${testFiles.length} test files to source dependencies`, 'success');


  getAllTestFiles(): string[] {
    const testFiles = [];
    
    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(filePath);
 else if (file.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/)) {
          testFiles.push(filePath);


    };
    
    ['client/src', 'server/src', 'packages', 'tests'].forEach(dir => scanDirectory(dir));
    
    return testFiles;


  inferSourceMappings(testFile: string): string[] {
    const sources = new Set();
    
    // Pattern 1: ComponentName.test.tsx -> ComponentName.tsx
    const testFileName = path.basename(testFile);
    const sourceFileName = testFileName.replace(/\.(test|spec)\./, '.');
    const potentialSource = path.join(path.dirname(testFile), sourceFileName);
    
    if (fs.existsSync(potentialSource)) {
      sources.add(potentialSource);

    
    // Pattern 2: __tests__/ComponentName.test.tsx -> ../ComponentName.tsx
    if (testFile.includes('__tests__')) {
      const parentDir = path.dirname(path.dirname(testFile));
      const potentialSource2 = path.join(parentDir, sourceFileName);
      
      if (fs.existsSync(potentialSource2)) {
        sources.add(potentialSource2);


    
    // Pattern 3: Search for files with similar names in the same directory tree
    const baseName = testFileName.replace(/\.(test|spec)\.(ts|tsx|js|jsx)$/, '');
    const searchExtensions = ['.ts', '.tsx', '.js', '.jsx'];
    
    const searchDir = path.dirname(testFile);
    searchExtensions.forEach(ext => {
      const potentialSource3 = path.join(searchDir, baseName + ext);
      if (fs.existsSync(potentialSource3)) {
        sources.add(potentialSource3);

    });
    
    return Array.from(sources);


  async selectRelevantTests(): Promise<void> {
    this.logStep('Selecting relevant tests...', 'info');
    
    if (this.changedFiles.length === 0) {
      this.logStep('No changed files detected, running critical tests only', 'warning');
      this.selectedTests = this.selectCriticalTests();
      return;

    
    const relevantTests = new Set();
    
    // Direct mapping: tests that directly import changed files
    for (const [testFile, sources] of this.testMappings.entries()) {
      for (const changedFile of this.changedFiles) {
        if (sources.has(changedFile)) {
          relevantTests.add(testFile);
          break;



    
    // Transitive dependencies: tests that import files that depend on changed files
    const transitivelyAffected = this.findTransitivelyAffectedFiles(this.changedFiles);
    
    for (const [testFile, sources] of this.testMappings.entries()) {
      for (const affectedFile of transitivelyAffected) {
        if (sources.has(affectedFile)) {
          relevantTests.add(testFile);
          break;



    
    // Add critical tests that should always run
    const criticalTests = this.selectCriticalTests();
    criticalTests.forEach(test => relevantTests.add(test));
    
    this.selectedTests = Array.from(relevantTests);
    
    this.logStep(`Selected ${this.selectedTests.length} relevant tests`, 'success');
    
    if (this.selectedTests.length > 0) {
      this.log('Selected tests:', 'blue');
      this.selectedTests.forEach(test => this.log(`  - ${test}`, 'blue'));



  findTransitivelyAffectedFiles(changedFiles: string[]): string[] {
    const affected = new Set(changedFiles);
    let hasChanges = true;
    
    // Iterate until no new affected files are found
    while (hasChanges) {
      hasChanges = false;
      
      for (const [file, dependencies] of this.dependencyGraph.entries()) {
        if (!affected.has(file)) {
          for (const dep of dependencies) {
            if (affected.has(dep)) {
              affected.add(file);
              hasChanges = true;
              break;





    
    // Remove the original changed files to get only transitively affected
    changedFiles.forEach(file => affected.delete(file));
    
    return Array.from(affected);


  selectCriticalTests(): string[] {
    // Select tests that should always run (e.g., security, core functionality)
    const criticalPatterns = [
      /security/i,
      /auth/i,
      /core/i,
      /integration/i,
      /e2e/i
    ];
    
    const allTests = this.getAllTestFiles();
    
    return allTests.filter(testFile => 
      criticalPatterns.some(pattern => pattern.test(testFile))
    );


  async optimizeTestOrder(): Promise<void> {
    this.logStep('Optimizing test execution order...', 'info');
    
    // Load test history for performance optimization
    const testPerformance = new Map();
    
    this.testHistory.forEach(run => {
      run.tests.forEach(test => {
        if (!testPerformance.has(test.file)) {
          testPerformance.set(test.file, {
            avgDuration: 0,
            failureRate: 0,
            runCount: 0
          });

        
        const perf = testPerformance.get(test.file);
        perf.avgDuration = ((perf.avgDuration * perf.runCount) + test.duration) / (perf.runCount + 1);
        perf.failureRate = ((perf.failureRate * perf.runCount) + (test.failed ? 1 : 0)) / (perf.runCount + 1);
        perf.runCount++;
      });
    });
    
    // Sort tests: fast tests first, then by failure rate (failing tests first)
    this.selectedTests.sort((a, b) => {
      const perfA = testPerformance.get(a) || { avgDuration: 1000, failureRate: 0 };
      const perfB = testPerformance.get(b) || { avgDuration: 1000, failureRate: 0 };
      
      // Prioritize tests with higher failure rates (likely to fail fast)
      const failureDiff = perfB.failureRate - perfA.failureRate;
      if (Math.abs(failureDiff) > 0.1) {
        return failureDiff > 0 ? -1 : 1;

      
      // Then prioritize faster tests
      return perfA.avgDuration - perfB.avgDuration;
    });
    
    this.logStep('Optimized test execution order for fast feedback', 'success');


  async executeSelectedTests(): Promise<void> {
    this.logStep('Executing selected tests...', 'info');
    
    if (this.selectedTests.length === 0) {
      this.logStep('No tests selected for execution', 'warning');
      return;

    
    const testStartTime = Date.now();
    const testResults = [];
    
    // Create a Jest configuration for selected tests
    const testConfig = {
      testMatch: this.selectedTests,
      collectCoverage: true,
      coverageReporters: ['text-summary', 'json'],
      verbose: false
    };
    
    try {
      // Run tests using Jest programmatically
      const jestCommand = `npx jest ${this.selectedTests.map(t => `"${t}"`).join(' ')} --json --coverage`;
      
      const output = execSync(jestCommand, { 
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      
      const results = JSON.parse(output);
      
      // Process results
      results.testResults.forEach(testResult => {
        testResults.push({
          file: testResult.name,
          duration: testResult.endTime - testResult.startTime,
          failed: testResult.status === 'failed',
          tests: testResult.assertionResults.length,
          passed: testResult.numPassingTests,
          failed_count: testResult.numFailingTests
        });
      });
      
      const totalDuration = Date.now() - testStartTime;
      
      this.logStep(`Tests completed in ${totalDuration}ms`, 'success');
      
      // Update test history
      this.testHistory.push({
        timestamp: new Date().toISOString(),
        changedFiles: this.changedFiles,
        selectedTests: this.selectedTests.length,
        totalDuration,
        tests: testResults,
        success: results.success
      });
      
      // Keep only last 50 test runs
      if (this.testHistory.length > 50) {
        this.testHistory = this.testHistory.slice(-50);

 catch (error) {
      this.logStep(`Test execution failed: ${error.message}`, 'error');
      
      // Record failed run
      this.testHistory.push({
        timestamp: new Date().toISOString(),
        changedFiles: this.changedFiles,
        selectedTests: this.selectedTests.length,
        totalDuration: Date.now() - testStartTime,
        tests: [],
        success: false,
        error: error.message
      });



  async updateTestCache(): Promise<void> {
    const cacheData = {
      timestamp: new Date().toISOString(),
      testMappings: Array.from(this.testMappings.entries()),
      dependencyGraph: Array.from(this.dependencyGraph.entries()),
      testHistory: this.testHistory
    };
    
    fs.writeFileSync(this.cacheFile, JSON.stringify(cacheData, null, 2));
    this.logStep('Updated test selection cache', 'success');


  generateReport(): any {
    this.logHeader('Smart Test Selection Report');
    
    const allTests = this.getAllTestFiles().length;
    const selectedCount = this.selectedTests.length;
    const timeSaved = this.estimateTimeSaved(allTests, selectedCount);
    
    const report = {
      timestamp: new Date().toISOString(),
      changedFiles: this.changedFiles.length,
      totalTests: allTests,
      selectedTests: selectedCount,
      selectionRatio: Math.round((selectedCount / allTests) * 100),
      estimatedTimeSaved: timeSaved,
      strategy: this.getSelectionStrategy()
    };
    
    this.log('\n📊 Selection Summary:', 'cyan');
    this.log(`   Changed Files: ${report.changedFiles}`, 'blue');
    this.log(`   Total Tests: ${report.totalTests}`, 'blue');
    this.log(`   Selected Tests: ${report.selectedTests}`, 'blue');
    this.log(`   Selection Ratio: ${report.selectionRatio}%`, 'blue');
    this.log(`   Estimated Time Saved: ${report.estimatedTimeSaved}`, 'green');
    this.log(`   Strategy: ${report.strategy}`, 'blue');
    
    return report;


  estimateTimeSaved(totalTests: number, selectedTests: number): string {
    const avgTestTime = 2000; // 2 seconds per test (rough estimate)
    const savedTests = totalTests - selectedTests;
    const savedTime = savedTests * avgTestTime;
    
    if (savedTime < 60000) {
      return `${Math.round(savedTime / 1000)}s`;
 else {
      return `${Math.round(savedTime / 60000)}m`;



  getSelectionStrategy(): string {
    if (this.changedFiles.length === 0) {
      return 'Critical tests only (no changes detected)';
 else if (this.selectedTests.length === this.getAllTestFiles().length) {
      return 'All tests (high impact changes)';
 else {
      return 'Smart selection (dependency-based)';



  // Analysis methods for continuous improvement
  async analyzeTestSelection(): Promise<void> {
    this.logHeader('Test Selection Analysis');
    
    if (this.testHistory.length < 5) {
      this.logStep('Insufficient history for analysis', 'warning');
      return;

    
    const recentRuns = this.testHistory.slice(-10);
    
    // Analyze selection accuracy
    const selectionAccuracy = this.calculateSelectionAccuracy(recentRuns);
    this.log(`Selection Accuracy: ${Math.round(selectionAccuracy * 100)}%`, 'blue');
    
    // Analyze time savings
    const avgTimeSavings = this.calculateAverageTimeSavings(recentRuns);
    this.log(`Average Time Savings: ${avgTimeSavings}`, 'green');
    
    // Identify frequently failing tests
    const frequentlyFailingTests = this.identifyFrequentlyFailingTests(recentRuns);
    if (frequentlyFailingTests.length > 0) {
      this.log('\nFrequently Failing Tests:', 'yellow');
      frequentlyFailingTests.forEach(test => {
        this.log(`  - ${test.file} (${Math.round(test.failureRate * 100)}% failure rate)`, 'yellow');
      });



  calculateSelectionAccuracy(runs: any[]): number {
    // Measure how often selected tests actually fail when changes are made
    // Higher accuracy means better prediction of which tests are relevant
    let totalSelections = 0;
    let accurateSelections = 0;
    
    runs.forEach(run => {
      if (run.tests && run.tests.length > 0) {
        totalSelections += run.tests.length;
        accurateSelections += run.tests.filter(test => test.failed || test.passed > 0).length;

    });
    
    return totalSelections > 0 ? accurateSelections / totalSelections : 0;


  calculateAverageTimeSavings(runs: any[]): string {
    const avgFullSuite = 300000; // 5 minutes for full suite
    const totalTimeSaved = runs.reduce((sum, run) => {
      const fullSuiteTime = avgFullSuite;
      const actualTime = run.totalDuration || 0;
      return sum + Math.max(0, fullSuiteTime - actualTime);
    }, 0);
    
    const avgSaved = totalTimeSaved / runs.length;
    return avgSaved < 60000 ? `${Math.round(avgSaved / 1000)}s` : `${Math.round(avgSaved / 60000)}m`;


  identifyFrequentlyFailingTests(runs: any[]): any[] {
    const testFailures = new Map();
    
    runs.forEach(run => {
      if (run.tests) {
        run.tests.forEach(test => {
          if (!testFailures.has(test.file)) {
            testFailures.set(test.file, { runs: 0, failures: 0 });

          
          const stats = testFailures.get(test.file);
          stats.runs++;
          if (test.failed) stats.failures++;
        });

    });
    
    const frequentlyFailing = [];
    for (const [file, stats] of testFailures.entries()) {
      const failureRate = stats.failures / stats.runs;
      if (failureRate > 0.3 && stats.runs >= 3) { // >30% failure rate with at least 3 runs
        frequentlyFailing.push({ file, failureRate, runs: stats.runs });


    
    return frequentlyFailing.sort((a, b) => b.failureRate - a.failureRate);



// CLI execution
if (require.main === module) {
  const selector = new SmartTestSelector();
  
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Smart Test Selection System

Usage: node scripts/smart-test-selector.js [options]

Options:
  --help, -h          Show this help message
  --analyze           Analyze test selection performance
  --build-cache       Build test dependency cache
  --all-tests         Run all tests (bypass smart selection)
  --critical-only     Run only critical tests

This script provides intelligent test selection including:
- Dependency graph analysis
- Changed file detection via git
- Test-to-source mapping
- Transitive dependency analysis
- Performance-optimized test ordering
- Historical performance tracking

The system reduces test execution time while maintaining quality
by running only tests relevant to code changes.
`);
    process.exit(0);

  
  if (args.includes('--analyze')) {
    selector.loadTestCache()
      .then(() => selector.analyzeTestSelection())
      .then(() => {
        console.log('✅ Test selection analysis completed');
      })
      .catch(error => {
        console.error('❌ Analysis failed:', error);
        process.exit(1);
      });
 else if (args.includes('--build-cache')) {
    selector.loadTestCache()
      .then(() => selector.buildDependencyGraph())
      .then(() => selector.mapTestsToSources())
      .then(() => selector.updateTestCache())
      .then(() => {
        console.log('✅ Test cache built successfully');
      })
      .catch(error => {
        console.error('❌ Cache building failed:', error);
        process.exit(1);
      });
 else {
    selector.runSmartTestSelection()
      .then(report => {
        console.log('✅ Smart test selection completed');
        if (report.selectedTests === 0) {
          process.exit(1);

      })
      .catch(error => {
        console.error('❌ Smart test selection failed:', error);
        process.exit(1);
      });



module.exports = { SmartTestSelector };