#!/usr/bin/env node

/**
 * Coverage Report Generator
 * 
 * Generates comprehensive test coverage reports and analysis
 * for the codebase to identify areas needing attention.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CoverageReportGenerator {
  constructor() {
    this.baseDir = process.cwd();
    this.sourceFiles = new Map();
    this.testFiles = new Map();
    this.coverageData = {
      summary: {
        totalSourceFiles: 0,
        totalTestFiles: 0,
        coveragePercentage: 0,
        lastGenerated: new Date().toISOString()
      },
      byDirectory: {},
      uncoveredFiles: [],
      criticalGaps: []
    };
  }

  /**
   * Scan directory for source and test files
   */
  scanFiles(dir = this.baseDir, excludePaths = ['node_modules', '.git', 'coverage-report', 'dist', 'build']) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = path.relative(this.baseDir, fullPath);
      
      // Skip excluded paths
      if (excludePaths.some(exclude => relativePath.includes(exclude))) {
        continue;
      }

      if (fs.statSync(fullPath).isDirectory()) {
        this.scanFiles(fullPath, excludePaths);
      } else if (this.isSourceFile(item)) {
        this.sourceFiles.set(relativePath, {
          path: relativePath,
          size: fs.statSync(fullPath).size,
          lastModified: fs.statSync(fullPath).mtime,
          hasTest: false,
          testFiles: []
        });
      } else if (this.isTestFile(item)) {
        this.testFiles.set(relativePath, {
          path: relativePath,
          size: fs.statSync(fullPath).size,
          lastModified: fs.statSync(fullPath).mtime
        });
      }
    }
  }

  /**
   * Check if file is a source file
   */
  isSourceFile(filename) {
    return /\.(ts|tsx|js|jsx)$/.test(filename) && 
           !/\.test\.(ts|tsx|js|jsx)$/.test(filename) &&
           !/\.spec\.(ts|tsx|js|jsx)$/.test(filename);
  }

  /**
   * Check if file is a test file
   */
  isTestFile(filename) {
    return /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(filename);
  }

  /**
   * Match source files with their corresponding tests
   */
  matchSourceWithTests() {
    // Map test files to potential source files
    for (const [testPath, testInfo] of this.testFiles) {
      const possibleSourcePaths = this.getPossibleSourcePaths(testPath);
      
      for (const sourcePath of possibleSourcePaths) {
        if (this.sourceFiles.has(sourcePath)) {
          const sourceFile = this.sourceFiles.get(sourcePath);
          sourceFile.hasTest = true;
          sourceFile.testFiles.push(testPath);
        }
      }
    }
  }

  /**
   * Get possible source file paths for a test file
   */
  getPossibleSourcePaths(testPath) {
    const possibilities = [];
    
    // Remove .test or .spec from filename
    let basePath = testPath
      .replace(/\.(test|spec)\.(ts|tsx|js|jsx)$/, '.$2')
      .replace('/__tests__/', '/');
    
    possibilities.push(basePath);
    
    // Try different directory structures
    if (testPath.includes('__tests__')) {
      basePath = testPath.replace('/__tests__/', '/').replace(/\.(test|spec)\.(ts|tsx|js|jsx)$/, '.$2');
      possibilities.push(basePath);
    }
    
    // Try same directory
    const dir = path.dirname(testPath);
    const filename = path.basename(testPath).replace(/\.(test|spec)\.(ts|tsx|js|jsx)$/, '.$2');
    possibilities.push(path.join(dir, filename));
    
    return possibilities;
  }

  /**
   * Generate coverage statistics by directory
   */
  generateDirectoryStats() {
    const dirStats = {};
    
    for (const [sourcePath, sourceInfo] of this.sourceFiles) {
      const dir = path.dirname(sourcePath);
      
      if (!dirStats[dir]) {
        dirStats[dir] = {
          totalFiles: 0,
          testedFiles: 0,
          coverage: 0,
          criticalFiles: [],
          uncoveredFiles: []
        };
      }
      
      dirStats[dir].totalFiles++;
      if (sourceInfo.hasTest) {
        dirStats[dir].testedFiles++;
      } else {
        dirStats[dir].uncoveredFiles.push(sourcePath);
        
        // Mark as critical if it's in important directories
        if (this.isCriticalPath(sourcePath)) {
          dirStats[dir].criticalFiles.push(sourcePath);
        }
      }
      
      dirStats[dir].coverage = (dirStats[dir].testedFiles / dirStats[dir].totalFiles) * 100;
    }
    
    this.coverageData.byDirectory = dirStats;
  }

  /**
   * Check if a file path is in a critical directory
   */
  isCriticalPath(filePath) {
    const criticalPaths = [
      'server/src/auth',
      'server/src/middleware',
      'server/src/engine.ts',
      'server/src/services',
      'client/src/pages',
      'client/src/components/auth',
      'packages/core/validation.ts',
      'packages/core/runtime'
    ];
    
    return criticalPaths.some(critical => filePath.includes(critical));
  }

  /**
   * Generate overall summary statistics
   */
  generateSummary() {
    this.coverageData.summary.totalSourceFiles = this.sourceFiles.size;
    this.coverageData.summary.totalTestFiles = this.testFiles.size;
    
    const testedFiles = Array.from(this.sourceFiles.values()).filter(f => f.hasTest).length;
    this.coverageData.summary.coveragePercentage = 
      this.sourceFiles.size > 0 ? (testedFiles / this.sourceFiles.size) * 100 : 0;
    
    // Collect uncovered files
    this.coverageData.uncoveredFiles = Array.from(this.sourceFiles.entries())
      .filter(([, info]) => !info.hasTest)
      .map(([path]) => path);
    
    // Collect critical gaps
    this.coverageData.criticalGaps = this.coverageData.uncoveredFiles
      .filter(path => this.isCriticalPath(path));
  }

  /**
   * Generate detailed HTML report
   */
  generateHTMLReport() {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Coverage Report - Generated ${new Date().toLocaleDateString()}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { background: #f5f5f5; padding: 20px; margin-bottom: 20px; }
    .summary { display: flex; gap: 20px; margin-bottom: 30px; }
    .stat-box { background: #e3f2fd; padding: 15px; border-radius: 5px; text-align: center; }
    .critical { background: #ffebee; border-left: 4px solid #f44336; }
    .good { background: #e8f5e8; border-left: 4px solid #4caf50; }
    .warning { background: #fff3e0; border-left: 4px solid #ff9800; }
    .directory { margin-bottom: 20px; }
    .file-list { max-height: 300px; overflow-y: auto; font-family: monospace; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
    .coverage-bar { background: #ddd; height: 20px; border-radius: 10px; overflow: hidden; }
    .coverage-fill { height: 100%; background: linear-gradient(90deg, #f44336 0%, #ff9800 50%, #4caf50 100%); }
  </style>
</head>
<body>
  <div class="header">
    <h1>Test Coverage Report</h1>
    <p>Generated: ${this.coverageData.summary.lastGenerated}</p>
    <p>Total Source Files: ${this.coverageData.summary.totalSourceFiles}</p>
    <p>Total Test Files: ${this.coverageData.summary.totalTestFiles}</p>
  </div>

  <div class="summary">
    <div class="stat-box ${this.coverageData.summary.coveragePercentage >= 70 ? 'good' : this.coverageData.summary.coveragePercentage >= 40 ? 'warning' : 'critical'}">
      <h3>Overall Coverage</h3>
      <h2>${this.coverageData.summary.coveragePercentage.toFixed(1)}%</h2>
    </div>
    <div class="stat-box critical">
      <h3>Critical Gaps</h3>
      <h2>${this.coverageData.criticalGaps.length}</h2>
    </div>
    <div class="stat-box warning">
      <h3>Uncovered Files</h3>
      <h2>${this.coverageData.uncoveredFiles.length}</h2>
    </div>
  </div>

  <h2>Coverage by Directory</h2>
  <table>
    <thead>
      <tr>
        <th>Directory</th>
        <th>Coverage</th>
        <th>Files (Tested/Total)</th>
        <th>Critical Gaps</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(this.coverageData.byDirectory)
        .sort(([,a], [,b]) => a.coverage - b.coverage)
        .map(([dir, stats]) => `
          <tr>
            <td>${dir}</td>
            <td>
              <div class="coverage-bar">
                <div class="coverage-fill" style="width: ${stats.coverage}%"></div>
              </div>
              ${stats.coverage.toFixed(1)}%
            </td>
            <td>${stats.testedFiles}/${stats.totalFiles}</td>
            <td>${stats.criticalFiles.length}</td>
          </tr>
        `).join('')}
    </tbody>
  </table>

  <h2>Critical Coverage Gaps (${this.coverageData.criticalGaps.length} files)</h2>
  <div class="file-list critical">
    ${this.coverageData.criticalGaps.map(file => `<div>${file}</div>`).join('')}
  </div>

  <h2>All Uncovered Files (${this.coverageData.uncoveredFiles.length} files)</h2>
  <div class="file-list">
    ${this.coverageData.uncoveredFiles.map(file => `<div>${file}</div>`).join('')}
  </div>
</body>
</html>`;
    
    return html;
  }

  /**
   * Generate JSON report
   */
  generateJSONReport() {
    return JSON.stringify(this.coverageData, null, 2);
  }

  /**
   * Generate markdown summary
   */
  generateMarkdownSummary() {
    const md = `# Test Coverage Report

**Generated:** ${this.coverageData.summary.lastGenerated}

## Summary
- **Total Source Files:** ${this.coverageData.summary.totalSourceFiles}
- **Total Test Files:** ${this.coverageData.summary.totalTestFiles}
- **Overall Coverage:** ${this.coverageData.summary.coveragePercentage.toFixed(1)}%
- **Critical Gaps:** ${this.coverageData.criticalGaps.length} files
- **Uncovered Files:** ${this.coverageData.uncoveredFiles.length} files

## Coverage by Directory

| Directory | Coverage | Files (Tested/Total) | Critical Gaps |
|-----------|----------|---------------------|---------------|
${Object.entries(this.coverageData.byDirectory)
  .sort(([,a], [,b]) => a.coverage - b.coverage)
  .map(([dir, stats]) => 
    `| ${dir} | ${stats.coverage.toFixed(1)}% | ${stats.testedFiles}/${stats.totalFiles} | ${stats.criticalFiles.length} |`
  ).join('\n')}

## Critical Coverage Gaps

${this.coverageData.criticalGaps.length > 0 ? 
  this.coverageData.criticalGaps.map(file => `- \`${file}\``).join('\n') : 
  'No critical gaps identified.'}

## Top Priority Recommendations

${this.generateRecommendations()}
`;
    
    return md;
  }

  /**
   * Generate recommendations based on coverage data
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Critical files without tests
    if (this.coverageData.criticalGaps.length > 0) {
      recommendations.push('1. **IMMEDIATE:** Add tests for critical security and authentication files');
    }
    
    // Directories with low coverage
    const lowCoverageDirs = Object.entries(this.coverageData.byDirectory)
      .filter(([, stats]) => stats.coverage < 50 && stats.totalFiles > 3)
      .sort(([,a], [,b]) => a.coverage - b.coverage);
    
    if (lowCoverageDirs.length > 0) {
      recommendations.push(`2. **HIGH PRIORITY:** Improve coverage for directories: ${lowCoverageDirs.slice(0, 3).map(([dir]) => `\`${dir}\``).join(', ')}`);
    }
    
    // Overall coverage improvement
    if (this.coverageData.summary.coveragePercentage < 70) {
      recommendations.push('3. **MEDIUM PRIORITY:** Target 70%+ overall coverage by focusing on core business logic');
    }
    
    return recommendations.join('\n');
  }

  /**
   * Run the complete coverage analysis
   */
  async run() {
    console.log('🔍 Scanning codebase for source and test files...');
    this.scanFiles();
    
    console.log('🔗 Matching source files with tests...');
    this.matchSourceWithTests();
    
    console.log('📊 Generating coverage statistics...');
    this.generateDirectoryStats();
    this.generateSummary();
    
    console.log('📝 Generating reports...');
    
    // Ensure coverage-reports directory exists
    const reportsDir = path.join(this.baseDir, 'coverage-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Write reports
    fs.writeFileSync(
      path.join(reportsDir, 'coverage-summary.md'), 
      this.generateMarkdownSummary()
    );
    
    fs.writeFileSync(
      path.join(reportsDir, 'coverage-detail.json'), 
      this.generateJSONReport()
    );
    
    fs.writeFileSync(
      path.join(reportsDir, 'coverage-report.html'), 
      this.generateHTMLReport()
    );
    
    // Output summary to console
    console.log(`
📋 COVERAGE REPORT SUMMARY
==========================
Total Source Files: ${this.coverageData.summary.totalSourceFiles}
Total Test Files: ${this.coverageData.summary.totalTestFiles}
Overall Coverage: ${this.coverageData.summary.coveragePercentage.toFixed(1)}%
Critical Gaps: ${this.coverageData.criticalGaps.length} files
Uncovered Files: ${this.coverageData.uncoveredFiles.length} files

📁 Reports generated in coverage-reports/
- coverage-summary.md (Markdown summary)
- coverage-detail.json (Detailed JSON data)
- coverage-report.html (Interactive HTML report)
`);

    return this.coverageData;
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new CoverageReportGenerator();
  generator.run().catch(console.error);
}

module.exports = CoverageReportGenerator;