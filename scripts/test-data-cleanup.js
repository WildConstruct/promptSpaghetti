#!/usr/bin/env node

/**
 * Test Data Cleanup Script
 * Automated cleanup of test data, temporary files, and expired data
 */

const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

class TestDataCleanup {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.cleanupConfig = {
      // Directories to clean
      directories: [
        'test-data',
        'test-results', 
        'coverage',
        'playwright-report',
        'cross-browser-reports',
        '.tmp',
        'temp'
      ],
      
      // File patterns to clean
      patterns: [
        '**/*.test.db',
        '**/*.test.sqlite',
        '**/test-snapshot-*.json',
        '**/temp-*.json',
        '**/.DS_Store',
        '**/Thumbs.db',
        '**/desktop.ini'
      ],
      
      // Age thresholds (in days)
      retention: {
        testResults: 7,
        snapshots: 14,
        coverage: 3,
        logs: 7,
        temporary: 1
      },
      
      // Size thresholds (in MB)
      sizeThresholds: {
        maxFileSize: 100,
        maxDirectorySize: 1000
      }
    };
    
    this.statistics = {
      filesRemoved: 0,
      directoriesRemoved: 0,
      bytesFreed: 0,
      errorsEncountered: 0
    };
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
      header: chalk.cyan.bold
    };
    
    console.log(`[${timestamp}] ${colors[level] || chalk.white}${message}${chalk.reset('')}`);
  }

  async run(options = {}) {
    this.log('Starting test data cleanup...', 'header');
    
    try {
      const {
        dryRun = false,
        aggressive = false,
        maxAge = 7,
        skipBackup = false
      } = options;

      // Create backup before cleanup (unless skipped)
      if (!skipBackup && !dryRun) {
        await this.createBackup();
      }

      // Clean temporary files
      await this.cleanTemporaryFiles(dryRun, maxAge);

      // Clean test databases
      await this.cleanTestDatabases(dryRun, maxAge);

      // Clean test snapshots
      await this.cleanTestSnapshots(dryRun, maxAge);

      // Clean coverage reports
      await this.cleanCoverageReports(dryRun, maxAge);

      // Clean browser test results
      await this.cleanBrowserTestResults(dryRun, maxAge);

      // Clean log files
      await this.cleanLogFiles(dryRun, maxAge);

      // Aggressive cleanup (only if explicitly enabled)
      if (aggressive) {
        await this.aggressiveCleanup(dryRun);
      }

      // Clean empty directories
      await this.cleanEmptyDirectories(dryRun);

      // Generate report
      this.generateReport(dryRun);

    } catch (error) {
      this.log(`Cleanup failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async createBackup() {
    this.log('Creating backup before cleanup...', 'info');
    
    const backupDir = path.join(this.projectRoot, 'backups', 'test-data');
    const backupFile = path.join(backupDir, `cleanup-backup-${Date.now()}.tar.gz`);
    
    await fs.mkdir(backupDir, { recursive: true });
    
    // In a real implementation, you would use a proper archiving library
    // For now, we'll create a simple backup manifest
    const manifest = {
      timestamp: new Date().toISOString(),
      directories: this.cleanupConfig.directories,
      note: 'Backup created before test data cleanup'
    };
    
    const manifestPath = path.join(backupDir, `cleanup-manifest-${Date.now()}.json`);
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    
    this.log(`Backup manifest created: ${manifestPath}`, 'success');
  }

  async cleanTemporaryFiles(dryRun, maxAge) {
    this.log('Cleaning temporary files...', 'info');
    
    const tempDirs = ['temp', '.tmp', 'tmp'];
    const tempPatterns = [
      /^temp-/,
      /\.tmp$/,
      /\.temp$/,
      /~$/,
      /\.bak$/
    ];
    
    for (const tempDir of tempDirs) {
      const fullPath = path.join(this.projectRoot, tempDir);
      if (await this.exists(fullPath)) {
        await this.cleanDirectory(fullPath, {
          maxAge,
          patterns: tempPatterns,
          dryRun,
          type: 'temporary'
        });
      }
    }

    // Clean temp files in common directories
    const commonDirs = ['tests', 'test-data', 'coverage'];
    for (const dir of commonDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (await this.exists(fullPath)) {
        await this.cleanFilesInDirectory(fullPath, tempPatterns, maxAge, dryRun);
      }
    }
  }

  async cleanTestDatabases(dryRun, maxAge) {
    this.log('Cleaning test databases...', 'info');
    
    const dbPatterns = [
      /\.test\.db$/,
      /\.test\.sqlite$/,
      /test-.*\.db$/,
      /.*-test\.db$/
    ];
    
    const searchDirs = [
      'test-data/databases',
      'tests',
      'server/test-data'
    ];
    
    for (const dir of searchDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (await this.exists(fullPath)) {
        await this.cleanFilesInDirectory(fullPath, dbPatterns, maxAge, dryRun);
      }
    }
  }

  async cleanTestSnapshots(dryRun, maxAge) {
    this.log('Cleaning test snapshots...', 'info');
    
    const snapshotPatterns = [
      /test-snapshot-.*\.json$/,
      /snapshot-.*\.json$/,
      /.*\.snapshot$/
    ];
    
    const searchDirs = [
      'test-data/snapshots',
      'tests/snapshots',
      '__snapshots__'
    ];
    
    for (const dir of searchDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (await this.exists(fullPath)) {
        await this.cleanFilesInDirectory(fullPath, snapshotPatterns, maxAge, dryRun);
      }
    }
  }

  async cleanCoverageReports(dryRun, maxAge) {
    this.log('Cleaning coverage reports...', 'info');
    
    const coverageDir = path.join(this.projectRoot, 'coverage');
    if (await this.exists(coverageDir)) {
      // Keep the latest coverage report, clean older ones
      const files = await fs.readdir(coverageDir);
      const reports = [];
      
      for (const file of files) {
        const filePath = path.join(coverageDir, file);
        const stats = await fs.stat(filePath);
        if (stats.isFile() && file.endsWith('.html')) {
          reports.push({
            name: file,
            path: filePath,
            mtime: stats.mtime
          });
        }
      }
      
      // Sort by modification time, keep the latest
      reports.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
      const toRemove = reports.slice(3); // Keep latest 3 reports
      
      for (const report of toRemove) {
        const age = (Date.now() - report.mtime.getTime()) / (1000 * 60 * 60 * 24);
        if (age > maxAge) {
          await this.removeFile(report.path, dryRun, 'coverage report');
        }
      }
    }
  }

  async cleanBrowserTestResults(dryRun, maxAge) {
    this.log('Cleaning browser test results...', 'info');
    
    const browserDirs = [
      'playwright-report',
      'cross-browser-reports',
      'test-results'
    ];
    
    for (const dir of browserDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (await this.exists(fullPath)) {
        await this.cleanDirectory(fullPath, {
          maxAge,
          dryRun,
          type: 'browser test results'
        });
      }
    }
  }

  async cleanLogFiles(dryRun, maxAge) {
    this.log('Cleaning log files...', 'info');
    
    const logPatterns = [
      /\.log$/,
      /\.log\.\d+$/,
      /debug\.log$/,
      /error\.log$/,
      /test\.log$/
    ];
    
    const searchDirs = [
      'logs',
      'test-logs',
      'server/logs'
    ];
    
    for (const dir of searchDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (await this.exists(fullPath)) {
        await this.cleanFilesInDirectory(fullPath, logPatterns, maxAge, dryRun);
      }
    }
  }

  async aggressiveCleanup(dryRun) {
    this.log('Performing aggressive cleanup...', 'warning');
    
    // Clean all node_modules in test directories
    const testNodeModules = [
      'tests/node_modules',
      'test-data/node_modules'
    ];
    
    for (const dir of testNodeModules) {
      const fullPath = path.join(this.projectRoot, dir);
      if (await this.exists(fullPath)) {
        await this.removeDirectory(fullPath, dryRun, 'test node_modules');
      }
    }
    
    // Clean large test files
    await this.cleanLargeTestFiles(dryRun);
  }

  async cleanLargeTestFiles(dryRun) {
    const maxSize = this.cleanupConfig.sizeThresholds.maxFileSize * 1024 * 1024; // MB to bytes
    
    const searchDirs = ['test-data', 'tests', 'coverage'];
    
    for (const dir of searchDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (await this.exists(fullPath)) {
        await this.findAndRemoveLargeFiles(fullPath, maxSize, dryRun);
      }
    }
  }

  async findAndRemoveLargeFiles(directory, maxSize, dryRun) {
    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        
        if (entry.isDirectory()) {
          await this.findAndRemoveLargeFiles(fullPath, maxSize, dryRun);
        } else if (entry.isFile()) {
          const stats = await fs.stat(fullPath);
          if (stats.size > maxSize) {
            const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
            await this.removeFile(fullPath, dryRun, `large test file (${sizeMB}MB)`);
          }
        }
      }
    } catch (error) {
      this.statistics.errorsEncountered++;
    }
  }

  async cleanEmptyDirectories(dryRun) {
    this.log('Cleaning empty directories...', 'info');
    
    const cleanupDirs = this.cleanupConfig.directories.map(dir => 
      path.join(this.projectRoot, dir)
    );
    
    for (const dir of cleanupDirs) {
      if (await this.exists(dir)) {
        await this.removeEmptyDirectories(dir, dryRun);
      }
    }
  }

  async removeEmptyDirectories(directory, dryRun) {
    try {
      const entries = await fs.readdir(directory);
      
      // First, recursively clean subdirectories
      for (const entry of entries) {
        const fullPath = path.join(directory, entry);
        const stats = await fs.stat(fullPath);
        if (stats.isDirectory()) {
          await this.removeEmptyDirectories(fullPath, dryRun);
        }
      }
      
      // Check if directory is now empty
      const remainingEntries = await fs.readdir(directory);
      if (remainingEntries.length === 0) {
        await this.removeDirectory(directory, dryRun, 'empty directory');
      }
    } catch (error) {
      this.statistics.errorsEncountered++;
    }
  }

  async cleanDirectory(directory, options) {
    const { maxAge, patterns = [], dryRun, type = 'directory' } = options;
    const cutoffDate = new Date(Date.now() - (maxAge * 24 * 60 * 60 * 1000));
    
    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        const stats = await fs.stat(fullPath);
        
        if (stats.mtime < cutoffDate) {
          if (entry.isDirectory()) {
            await this.removeDirectory(fullPath, dryRun, type);
          } else {
            // Check if file matches cleanup patterns
            const shouldClean = patterns.length === 0 || 
              patterns.some(pattern => pattern.test(entry.name));
            
            if (shouldClean) {
              await this.removeFile(fullPath, dryRun, type);
            }
          }
        }
      }
    } catch (error) {
      this.statistics.errorsEncountered++;
    }
  }

  async cleanFilesInDirectory(directory, patterns, maxAge, dryRun) {
    const cutoffDate = new Date(Date.now() - (maxAge * 24 * 60 * 60 * 1000));
    
    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isFile()) {
          const shouldMatch = patterns.some(pattern => pattern.test(entry.name));
          if (shouldMatch) {
            const fullPath = path.join(directory, entry.name);
            const stats = await fs.stat(fullPath);
            
            if (stats.mtime < cutoffDate) {
              await this.removeFile(fullPath, dryRun, 'pattern match');
            }
          }
        } else if (entry.isDirectory()) {
          // Recursively clean subdirectories
          const subDir = path.join(directory, entry.name);
          await this.cleanFilesInDirectory(subDir, patterns, maxAge, dryRun);
        }
      }
    } catch (error) {
      this.statistics.errorsEncountered++;
    }
  }

  async removeFile(filePath, dryRun, type = 'file') {
    try {
      const stats = await fs.stat(filePath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      
      if (dryRun) {
        this.log(`Would remove ${type}: ${filePath} (${sizeMB}MB)`, 'warning');
      } else {
        await fs.unlink(filePath);
        this.log(`Removed ${type}: ${filePath} (${sizeMB}MB)`, 'success');
        this.statistics.filesRemoved++;
        this.statistics.bytesFreed += stats.size;
      }
    } catch (error) {
      this.log(`Failed to remove ${filePath}: ${error.message}`, 'error');
      this.statistics.errorsEncountered++;
    }
  }

  async removeDirectory(dirPath, dryRun, type = 'directory') {
    try {
      if (dryRun) {
        this.log(`Would remove ${type}: ${dirPath}`, 'warning');
      } else {
        await fs.rm(dirPath, { recursive: true, force: true });
        this.log(`Removed ${type}: ${dirPath}`, 'success');
        this.statistics.directoriesRemoved++;
      }
    } catch (error) {
      this.log(`Failed to remove directory ${dirPath}: ${error.message}`, 'error');
      this.statistics.errorsEncountered++;
    }
  }

  async exists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  generateReport(dryRun) {
    this.log('\n📊 Cleanup Report:', 'header');
    
    const mode = dryRun ? 'DRY RUN' : 'ACTUAL CLEANUP';
    this.log(`Mode: ${mode}`, 'info');
    
    this.log(`Files processed: ${this.statistics.filesRemoved}`, 'info');
    this.log(`Directories processed: ${this.statistics.directoriesRemoved}`, 'info');
    
    const mbFreed = (this.statistics.bytesFreed / 1024 / 1024).toFixed(2);
    this.log(`Space ${dryRun ? 'would be freed' : 'freed'}: ${mbFreed}MB`, 'success');
    
    if (this.statistics.errorsEncountered > 0) {
      this.log(`Errors encountered: ${this.statistics.errorsEncountered}`, 'error');
    }
    
    if (dryRun) {
      this.log('\nRun without --dry-run to perform actual cleanup', 'warning');
    }
  }

  async runCleanupSchedule() {
    this.log('Running scheduled cleanup tasks...', 'header');
    
    const schedules = [
      { type: 'daily', maxAge: 1, aggressive: false },
      { type: 'weekly', maxAge: 7, aggressive: false },
      { type: 'monthly', maxAge: 30, aggressive: true }
    ];
    
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayOfMonth = today.getDate();
    
    // Daily cleanup
    await this.run({ maxAge: 1, skipBackup: true });
    
    // Weekly cleanup (Sundays)
    if (dayOfWeek === 0) {
      await this.run({ maxAge: 7, aggressive: false });
    }
    
    // Monthly cleanup (1st of month)
    if (dayOfMonth === 1) {
      await this.run({ maxAge: 30, aggressive: true });
    }
  }
}

// CLI mode
if (require.main === module) {
  const cleanup = new TestDataCleanup();
  const args = process.argv.slice(2);
  
  const options = {
    dryRun: args.includes('--dry-run'),
    aggressive: args.includes('--aggressive'),
    maxAge: parseInt(args.find(arg => arg.startsWith('--max-age='))?.split('=')[1]) || 7,
    skipBackup: args.includes('--skip-backup'),
    schedule: args.includes('--schedule')
  };
  
  async function main() {
    try {
      if (options.schedule) {
        await cleanup.runCleanupSchedule();
      } else {
        await cleanup.run(options);
      }
    } catch (error) {
      console.error('Cleanup failed:', error.message);
      process.exit(1);
    }
  }
  
  main();
}

module.exports = TestDataCleanup;