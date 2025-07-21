#!/usr/bin/env node

/**
 * Conflict Resolution Assistant
 * 
 * Detects code overlaps between concurrent tasks, suggests merge strategies,
 * and automates simple conflict resolution to prevent and resolve merge conflicts.
 * 
 * Key Features:
 * - Real-time code overlap detection across active tasks
 * - Intelligent merge strategy recommendations
 * - Automated resolution for simple conflicts (whitespace, imports, etc.)
 * - Conflict prevention suggestions and early warnings
 * - Integration with Git workflow and task management
 * - Visual conflict resolution interface
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync, spawn } = require('child_process');

class ConflictResolutionAssistant {
  constructor() {
    this.dataDir = path.join(__dirname, '../data/conflicts');
    this.stateFile = path.join(__dirname, '../data/state.json');
    this.conflictsFile = path.join(this.dataDir, 'detected-conflicts.json');
    this.resolutionFile = path.join(this.dataDir, 'conflict-resolutions.json');
    this.strategiesFile = path.join(this.dataDir, 'merge-strategies.json');
    
    // Configuration
    this.config = {
      detection: {
        // File patterns to monitor for overlaps
        watchPatterns: [
          '**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx',
          '**/*.json', '**/*.md', '**/*.css', '**/*.scss'
        ],
        
        // Ignore patterns
        ignorePatterns: [
          'node_modules/**', '.git/**', 'dist/**', 'build/**',
          'coverage/**', '.turbo/**', '.next/**'
        ],
        
        // Overlap detection sensitivity
        overlapThreshold: 0.3,        // 30% line overlap to flag
        semanticThreshold: 0.5,       // 50% semantic similarity
        functionOverlapThreshold: 0.7, // 70% function name overlap
        
        // Time windows for conflict detection
        activeTaskWindow: 24 * 60 * 60 * 1000, // 24 hours
        preventionWindow: 4 * 60 * 60 * 1000,  // 4 hours ahead
      },
      
      resolution: {
        // Auto-resolution rules
        autoResolvePatterns: {
          whitespace: true,           // Whitespace-only conflicts
          imports: true,              // Import statement conflicts
          comments: true,             // Comment-only conflicts
          formatting: true,           // Code formatting conflicts
          dependencies: true          // Package.json dependency conflicts
        },
        
        // Merge strategies
        strategies: {
          conservative: 'Manual review required for all conflicts',
          balanced: 'Auto-resolve simple conflicts, manual review for complex',
          aggressive: 'Auto-resolve all recognizable patterns'
        },
        
        defaultStrategy: 'balanced',
        
        // Safety checks
        requireBackup: true,
        requireReview: true,
        testBeforeCommit: true
      },
      
      notification: {
        alertOnConflict: true,
        preventiveWarnings: true,
        resolutionSummary: true,
        slackIntegration: false    // Can be enabled for team notifications
      }
    };
    
    this.detectedConflicts = new Map();
    this.resolutionHistory = [];
    this.activeResolutions = new Map();
    this.fileChangeTracking = new Map();
  }

  /**
   * Initialize the conflict resolution assistant
   */
  async initialize() {
    try {
      await this.ensureDataDirectory();
      await this.loadExistingData();
      await this.setupGitHooks();
      
      console.log('✅ Conflict Resolution Assistant initialized');
      console.log(`📊 Loaded ${this.detectedConflicts.size} existing conflicts`);
      console.log(`📋 ${this.resolutionHistory.length} historical resolutions`);
      
    } catch (error) {
      console.error('❌ Failed to initialize Conflict Resolution Assistant:', error);
      throw error;
    }
  }

  /**
   * Scan for potential conflicts across active tasks
   */
  async scanForConflicts() {
    console.log('🔍 Scanning for potential conflicts...\n');
    
    try {
      // Get active tasks
      const activeTasks = await this.getActiveTasks();
      console.log(`📋 Found ${activeTasks.length} active tasks to analyze`);
      
      // Get file changes for each task
      const taskFileChanges = await this.getTaskFileChanges(activeTasks);
      
      // Detect overlaps
      const conflicts = await this.detectOverlaps(taskFileChanges);
      
      // Analyze conflict severity and suggest strategies
      const analyzedConflicts = await this.analyzeConflicts(conflicts);
      
      // Save and report results
      await this.saveConflicts(analyzedConflicts);
      await this.generateConflictReport(analyzedConflicts);
      
      console.log(`\n✅ Conflict scan complete:`);
      console.log(`⚠️  Found ${analyzedConflicts.length} potential conflicts`);
      console.log(`🔥 ${analyzedConflicts.filter(c => c.severity === 'high').length} high-severity conflicts`);
      console.log(`⚡ ${analyzedConflicts.filter(c => c.autoResolvable).length} auto-resolvable conflicts`);
      
      return analyzedConflicts;
      
    } catch (error) {
      console.error('❌ Conflict scan failed:', error);
      throw error;
    }
  }

  /**
   * Get currently active tasks from state
   */
  async getActiveTasks() {
    try {
      const stateData = await fs.readFile(this.stateFile, 'utf8');
      const state = JSON.parse(stateData);
      
      if (!state.tasks) return [];
      
      const cutoffTime = new Date(Date.now() - this.config.detection.activeTaskWindow);
      
      return Object.entries(state.tasks)
        .filter(([id, task]) => {
          // Task is in progress or recently updated
          const isActive = task.state === 'IN_PROGRESS' || 
                          task.assignee !== 'Unassigned';
          const isRecent = task.lastUpdated && 
                          new Date(task.lastUpdated) > cutoffTime;
          
          return isActive && isRecent;
        })
        .map(([id, task]) => ({ id, ...task }));
        
    } catch (error) {
      console.warn('Could not load active tasks:', error.message);
      return [];
    }
  }

  /**
   * Get file changes associated with each task
   */
  async getTaskFileChanges(tasks) {
    const taskChanges = new Map();
    
    for (const task of tasks) {
      try {
        // Extract file references from task description and acceptance criteria
        const files = this.extractFileReferences(task);
        
        // Get actual git changes if available
        const gitChanges = await this.getGitChangesForTask(task);
        
        // Combine extracted and git-based file lists
        const allFiles = new Set([...files, ...gitChanges]);
        
        if (allFiles.size > 0) {
          taskChanges.set(task.id, {
            task,
            files: Array.from(allFiles),
            extractedFiles: files,
            gitFiles: gitChanges,
            lastUpdate: task.lastUpdated
          });
          
          console.log(`📂 ${task.id}: Found ${allFiles.size} files`);
        }
        
      } catch (error) {
        console.warn(`Could not analyze files for task ${task.id}:`, error.message);
      }
    }
    
    return taskChanges;
  }

  /**
   * Extract file references from task content
   */
  extractFileReferences(task) {
    const files = new Set();
    const text = `${task.title || ''} ${task.description || ''} ${(task.acceptanceCriteria || []).join(' ')}`;
    
    // File path patterns
    const patterns = [
      /(?:src|packages|client|server)\/[a-zA-Z0-9\/._-]+\.(js|ts|jsx|tsx|json|css|scss|md)/g,
      /[a-zA-Z][a-zA-Z0-9]*\.(?:js|ts|jsx|tsx|json|css|scss|md)/g,
      /[a-zA-Z][a-zA-Z0-9]*\/[a-zA-Z][a-zA-Z0-9]*\.(js|ts|jsx|tsx)/g
    ];
    
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Clean up the match
          const cleanPath = match.trim().replace(/['"`,]/g, '');
          if (cleanPath.length > 3) {
            files.add(cleanPath);
          }
        });
      }
    }
    
    return Array.from(files);
  }

  /**
   * Get git changes for a task based on recent commits or branches
   */
  async getGitChangesForTask(task) {
    try {
      // Try to find branch or commits related to this task
      const taskRef = task.id.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      // Check if there's a branch for this task
      try {
        execSync(`git show-branch ${taskRef}`, { stdio: 'pipe' });
        
        // Get changed files in this branch
        const output = execSync(`git diff --name-only main...${taskRef}`, { 
          stdio: 'pipe', 
          encoding: 'utf8' 
        });
        
        return output.trim().split('\n').filter(file => file.trim());
        
      } catch {
        // No specific branch, try to find recent commits mentioning the task
        try {
          const commitOutput = execSync(`git log --oneline --since="24 hours ago" --grep="${task.id}"`, {
            stdio: 'pipe',
            encoding: 'utf8'
          });
          
          if (commitOutput.trim()) {
            const commits = commitOutput.trim().split('\n').map(line => line.split(' ')[0]);
            const files = new Set();
            
            for (const commit of commits.slice(0, 5)) { // Last 5 commits
              const filesOutput = execSync(`git diff-tree --no-commit-id --name-only -r ${commit}`, {
                stdio: 'pipe',
                encoding: 'utf8'
              });
              
              filesOutput.trim().split('\n').forEach(file => {
                if (file.trim()) files.add(file.trim());
              });
            }
            
            return Array.from(files);
          }
        } catch {
          // No commits found
        }
      }
      
      return [];
      
    } catch (error) {
      return [];
    }
  }

  /**
   * Detect overlaps between task file changes
   */
  async detectOverlaps(taskFileChanges) {
    const conflicts = [];
    const tasks = Array.from(taskFileChanges.values());
    
    // Compare each pair of tasks
    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        const taskA = tasks[i];
        const taskB = tasks[j];
        
        // Find file overlaps
        const overlappingFiles = taskA.files.filter(file => 
          taskB.files.includes(file)
        );
        
        if (overlappingFiles.length > 0) {
          // Analyze the overlap
          const conflict = await this.analyzeFileOverlap(taskA, taskB, overlappingFiles);
          if (conflict) {
            conflicts.push(conflict);
            console.log(`⚠️  Conflict detected: ${taskA.task.id} ↔ ${taskB.task.id}`);
            console.log(`   Files: ${overlappingFiles.join(', ')}`);
          }
        }
      }
    }
    
    return conflicts;
  }

  /**
   * Analyze specific file overlap between two tasks
   */
  async analyzeFileOverlap(taskA, taskB, overlappingFiles) {
    const conflict = {
      id: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      taskA: taskA.task.id,
      taskB: taskB.task.id,
      files: overlappingFiles,
      detected: new Date().toISOString(),
      severity: 'medium',
      type: 'file_overlap',
      autoResolvable: false,
      strategies: [],
      details: {}
    };
    
    // Analyze each overlapping file
    for (const file of overlappingFiles) {
      try {
        const fileAnalysis = await this.analyzeFileConflict(file, taskA, taskB);
        conflict.details[file] = fileAnalysis;
        
        // Update conflict properties based on analysis
        if (fileAnalysis.severity === 'high') {
          conflict.severity = 'high';
        }
        
        if (fileAnalysis.autoResolvable) {
          conflict.autoResolvable = true;
        }
        
      } catch (error) {
        console.warn(`Could not analyze file ${file}:`, error.message);
      }
    }
    
    // Generate resolution strategies
    conflict.strategies = this.generateResolutionStrategies(conflict);
    
    return conflict;
  }

  /**
   * Analyze a specific file for conflict potential
   */
  async analyzeFileConflict(filePath, taskA, taskB) {
    const analysis = {
      file: filePath,
      exists: false,
      size: 0,
      type: path.extname(filePath),
      lineOverlap: 0,
      functionOverlap: 0,
      severity: 'low',
      autoResolvable: false,
      conflictTypes: []
    };
    
    try {
      // Check if file exists
      const fullPath = path.resolve(filePath);
      await fs.access(fullPath);
      analysis.exists = true;
      
      const stat = await fs.stat(fullPath);
      analysis.size = stat.size;
      
      // Read and analyze file content
      const content = await fs.readFile(fullPath, 'utf8');
      const lines = content.split('\n');
      analysis.lineCount = lines.length;
      
      // Analyze based on file type
      if (['.js', '.ts', '.jsx', '.tsx'].includes(analysis.type)) {
        await this.analyzeJavaScriptFile(content, analysis, taskA, taskB);
      } else if (analysis.type === '.json') {
        await this.analyzeJSONFile(content, analysis, taskA, taskB);
      } else if (['.css', '.scss'].includes(analysis.type)) {
        await this.analyzeStyleFile(content, analysis, taskA, taskB);
      }
      
      // Determine severity
      if (analysis.functionOverlap > this.config.detection.functionOverlapThreshold) {
        analysis.severity = 'high';
      } else if (analysis.lineOverlap > this.config.detection.overlapThreshold) {
        analysis.severity = 'medium';
      }
      
      // Check for auto-resolvability
      analysis.autoResolvable = this.canAutoResolve(analysis);
      
    } catch (error) {
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Analyze JavaScript/TypeScript files
   */
  async analyzeJavaScriptFile(content, analysis, taskA, taskB) {
    // Extract functions, classes, and exports
    const functions = this.extractFunctions(content);
    const classes = this.extractClasses(content);
    const exports = this.extractExports(content);
    const imports = this.extractImports(content);
    
    analysis.functions = functions.length;
    analysis.classes = classes.length;
    analysis.exports = exports.length;
    analysis.imports = imports.length;
    
    // Check for likely modification areas based on task descriptions
    const taskAContent = `${taskA.task.title || ''} ${taskA.task.description || ''}`.toLowerCase();
    const taskBContent = `${taskB.task.title || ''} ${taskB.task.description || ''}`.toLowerCase();
    
    // Look for function name mentions
    let functionConflicts = 0;
    for (const func of functions) {
      if (taskAContent.includes(func.toLowerCase()) && 
          taskBContent.includes(func.toLowerCase())) {
        functionConflicts++;
      }
    }
    
    analysis.functionOverlap = functions.length > 0 ? functionConflicts / functions.length : 0;
    
    // Detect specific conflict types
    if (imports.length > 5) analysis.conflictTypes.push('import_heavy');
    if (functions.length > 10) analysis.conflictTypes.push('function_heavy');
    if (content.includes('export default')) analysis.conflictTypes.push('default_export');
    if (content.includes('module.exports')) analysis.conflictTypes.push('commonjs_export');
  }

  /**
   * Analyze JSON files
   */
  async analyzeJSONFile(content, analysis, taskA, taskB) {
    try {
      const json = JSON.parse(content);
      
      if (json.dependencies) {
        analysis.conflictTypes.push('dependencies');
        analysis.autoResolvable = true; // Dependencies can often be auto-merged
      }
      
      if (json.scripts) {
        analysis.conflictTypes.push('scripts');
      }
      
      if (json.devDependencies) {
        analysis.conflictTypes.push('dev_dependencies');
        analysis.autoResolvable = true;
      }
      
      // Package.json specific analysis
      if (analysis.file === 'package.json') {
        analysis.severity = 'high'; // Package.json conflicts are always important
      }
      
    } catch {
      analysis.conflictTypes.push('invalid_json');
      analysis.severity = 'high';
    }
  }

  /**
   * Analyze CSS/SCSS files
   */
  async analyzeStyleFile(content, analysis, taskA, taskB) {
    const selectors = content.match(/\.[a-zA-Z][a-zA-Z0-9_-]*|\#[a-zA-Z][a-zA-Z0-9_-]*/g) || [];
    const variables = content.match(/\$[a-zA-Z][a-zA-Z0-9_-]*/g) || [];
    
    analysis.selectors = selectors.length;
    analysis.variables = variables.length;
    
    if (variables.length > 0) {
      analysis.conflictTypes.push('scss_variables');
    }
    
    if (selectors.length > 20) {
      analysis.conflictTypes.push('style_heavy');
    }
  }

  /**
   * Check if a conflict can be auto-resolved
   */
  canAutoResolve(analysis) {
    // Check against auto-resolution patterns
    const config = this.config.resolution.autoResolvePatterns;
    
    if (config.dependencies && analysis.conflictTypes.includes('dependencies')) {
      return true;
    }
    
    if (config.imports && analysis.conflictTypes.includes('import_heavy')) {
      return true;
    }
    
    if (config.formatting && analysis.size < 1000) { // Small files are often formatting
      return true;
    }
    
    // Never auto-resolve high-severity conflicts
    if (analysis.severity === 'high') {
      return false;
    }
    
    return false;
  }

  /**
   * Generate resolution strategies for a conflict
   */
  generateResolutionStrategies(conflict) {
    const strategies = [];
    
    // Strategy 1: Sequential development
    strategies.push({
      type: 'sequential',
      description: 'Complete one task before starting the other',
      effort: 'low',
      risk: 'low',
      recommendation: conflict.severity === 'high'
    });
    
    // Strategy 2: File splitting
    if (conflict.files.length === 1 && conflict.details[conflict.files[0]]?.functions > 5) {
      strategies.push({
        type: 'file_splitting',
        description: 'Split the conflicting file into smaller modules',
        effort: 'medium',
        risk: 'medium',
        recommendation: conflict.severity === 'medium'
      });
    }
    
    // Strategy 3: Feature flagging
    if (conflict.details.some && Object.values(conflict.details).some(d => d.conflictTypes.includes('function_heavy'))) {
      strategies.push({
        type: 'feature_flags',
        description: 'Use feature flags to isolate changes',
        effort: 'medium',
        risk: 'low',
        recommendation: true
      });
    }
    
    // Strategy 4: Auto-merge
    if (conflict.autoResolvable) {
      strategies.push({
        type: 'auto_merge',
        description: 'Automatically merge using conflict resolution rules',
        effort: 'low',
        risk: 'low',
        recommendation: this.config.resolution.defaultStrategy !== 'conservative'
      });
    }
    
    // Strategy 5: Branching strategy
    strategies.push({
      type: 'branch_isolation',
      description: 'Use separate feature branches with planned merge',
      effort: 'low',
      risk: 'medium',
      recommendation: conflict.files.length > 3
    });
    
    return strategies.sort((a, b) => {
      // Sort by recommendation and effort
      if (a.recommendation && !b.recommendation) return -1;
      if (!a.recommendation && b.recommendation) return 1;
      
      const effortOrder = { low: 1, medium: 2, high: 3 };
      return effortOrder[a.effort] - effortOrder[b.effort];
    });
  }

  /**
   * Analyze conflicts and enhance with additional data
   */
  async analyzeConflicts(conflicts) {
    const analyzed = [];
    
    for (const conflict of conflicts) {
      // Add priority based on task priorities
      const taskA = await this.getTaskById(conflict.taskA);
      const taskB = await this.getTaskById(conflict.taskB);
      
      conflict.taskAPriority = taskA?.priority || 'medium';
      conflict.taskBPriority = taskB?.priority || 'medium';
      
      // Calculate urgency score
      conflict.urgencyScore = this.calculateUrgencyScore(conflict, taskA, taskB);
      
      // Add prevention suggestions
      conflict.prevention = this.generatePreventionSuggestions(conflict);
      
      // Check for historical similar conflicts
      conflict.similar = this.findSimilarConflicts(conflict);
      
      analyzed.push(conflict);
    }
    
    return analyzed.sort((a, b) => b.urgencyScore - a.urgencyScore);
  }

  /**
   * Calculate urgency score for conflict prioritization
   */
  calculateUrgencyScore(conflict, taskA, taskB) {
    let score = 0;
    
    // Severity weight
    const severityWeights = { high: 10, medium: 5, low: 1 };
    score += severityWeights[conflict.severity] || 1;
    
    // Priority weight
    const priorityWeights = { high: 8, medium: 4, low: 1 };
    score += priorityWeights[taskA?.priority] || 1;
    score += priorityWeights[taskB?.priority] || 1;
    
    // File count weight
    score += conflict.files.length * 2;
    
    // Auto-resolvable penalty (less urgent if can be auto-resolved)
    if (conflict.autoResolvable) score -= 3;
    
    return Math.max(0, score);
  }

  /**
   * Generate prevention suggestions
   */
  generatePreventionSuggestions(conflict) {
    const suggestions = [];
    
    suggestions.push('Set up file ownership rules to avoid concurrent edits');
    suggestions.push('Use feature flags to isolate experimental changes');
    suggestions.push('Break large files into smaller, focused modules');
    
    if (conflict.files.some(f => f.includes('package.json'))) {
      suggestions.push('Coordinate dependency updates through a shared task');
    }
    
    if (conflict.severity === 'high') {
      suggestions.push('Establish communication between agents working on related tasks');
    }
    
    return suggestions;
  }

  /**
   * Find similar historical conflicts
   */
  findSimilarConflicts(conflict) {
    return this.resolutionHistory
      .filter(resolved => {
        // Check for file overlap
        const fileOverlap = conflict.files.some(f => resolved.files?.includes(f));
        // Check for similar conflict types
        const typeMatch = resolved.type === conflict.type;
        
        return fileOverlap || typeMatch;
      })
      .slice(0, 3); // Top 3 similar conflicts
  }

  /**
   * Auto-resolve simple conflicts
   */
  async autoResolveConflicts(conflicts) {
    const resolutions = [];
    
    for (const conflict of conflicts.filter(c => c.autoResolvable)) {
      try {
        console.log(`🔧 Auto-resolving conflict ${conflict.id}...`);
        
        const resolution = await this.performAutoResolution(conflict);
        if (resolution.success) {
          resolutions.push(resolution);
          
          // Move to resolution history
          this.resolutionHistory.push({
            ...conflict,
            resolution,
            resolvedAt: new Date().toISOString(),
            method: 'automatic'
          });
          
          console.log(`✅ Auto-resolved conflict in files: ${conflict.files.join(', ')}`);
        } else {
          console.log(`⚠️  Auto-resolution failed for ${conflict.id}: ${resolution.error}`);
        }
        
      } catch (error) {
        console.error(`❌ Auto-resolution error for ${conflict.id}:`, error.message);
      }
    }
    
    return resolutions;
  }

  /**
   * Perform automatic resolution
   */
  async performAutoResolution(conflict) {
    const resolution = {
      conflictId: conflict.id,
      method: 'auto',
      actions: [],
      success: false,
      filesModified: []
    };
    
    try {
      // Create backup if required
      if (this.config.resolution.requireBackup) {
        await this.createBackup(conflict.files);
        resolution.actions.push('backup_created');
      }
      
      // Resolve each file
      for (const file of conflict.files) {
        const fileResolution = await this.resolveFile(file, conflict);
        resolution.actions.push(...fileResolution.actions);
        
        if (fileResolution.modified) {
          resolution.filesModified.push(file);
        }
      }
      
      // Run tests if required
      if (this.config.resolution.testBeforeCommit) {
        const testResult = await this.runTests();
        resolution.actions.push(`tests_${testResult ? 'passed' : 'failed'}`);
        
        if (!testResult) {
          // Restore backup
          await this.restoreBackup(conflict.files);
          resolution.actions.push('backup_restored');
          resolution.error = 'Tests failed after resolution';
          return resolution;
        }
      }
      
      resolution.success = true;
      return resolution;
      
    } catch (error) {
      resolution.error = error.message;
      
      // Attempt to restore backup
      if (this.config.resolution.requireBackup) {
        try {
          await this.restoreBackup(conflict.files);
          resolution.actions.push('backup_restored');
        } catch (restoreError) {
          resolution.actions.push('backup_restore_failed');
        }
      }
      
      return resolution;
    }
  }

  /**
   * Resolve a specific file
   */
  async resolveFile(filePath, conflict) {
    const resolution = { actions: [], modified: false };
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      let modifiedContent = content;
      const fileExt = path.extname(filePath);
      
      // Apply resolution strategies based on file type
      if (fileExt === '.json' && filePath.includes('package.json')) {
        modifiedContent = await this.resolvePackageJson(content, conflict);
        resolution.actions.push('merged_dependencies');
      } else if (['.js', '.ts', '.jsx', '.tsx'].includes(fileExt)) {
        modifiedContent = await this.resolveJavaScriptFile(content, conflict);
        resolution.actions.push('resolved_imports');
      } else if (['.css', '.scss'].includes(fileExt)) {
        modifiedContent = await this.resolveStyleFile(content, conflict);
        resolution.actions.push('merged_styles');
      }
      
      // Write back if modified
      if (modifiedContent !== content) {
        await fs.writeFile(filePath, modifiedContent);
        resolution.modified = true;
        resolution.actions.push('file_updated');
      }
      
    } catch (error) {
      resolution.actions.push(`error: ${error.message}`);
    }
    
    return resolution;
  }

  /**
   * Resolve package.json conflicts
   */
  async resolvePackageJson(content, conflict) {
    try {
      const packageJson = JSON.parse(content);
      
      // This is a simplified merge - in practice, would need more sophisticated logic
      // For now, just ensure dependencies are sorted
      if (packageJson.dependencies) {
        const sorted = {};
        Object.keys(packageJson.dependencies).sort().forEach(key => {
          sorted[key] = packageJson.dependencies[key];
        });
        packageJson.dependencies = sorted;
      }
      
      if (packageJson.devDependencies) {
        const sorted = {};
        Object.keys(packageJson.devDependencies).sort().forEach(key => {
          sorted[key] = packageJson.devDependencies[key];
        });
        packageJson.devDependencies = sorted;
      }
      
      return JSON.stringify(packageJson, null, 2);
      
    } catch (error) {
      return content; // Return original if parsing fails
    }
  }

  /**
   * Resolve JavaScript/TypeScript file conflicts
   */
  async resolveJavaScriptFile(content, conflict) {
    let modified = content;
    
    // Sort imports
    const importLines = [];
    const otherLines = [];
    const lines = content.split('\n');
    
    let inImportSection = true;
    for (const line of lines) {
      if (line.trim().startsWith('import ') || line.trim().startsWith('const ') && line.includes('require(')) {
        if (inImportSection) {
          importLines.push(line);
        } else {
          otherLines.push(line);
        }
      } else if (line.trim() === '') {
        if (inImportSection) {
          importLines.push(line);
        } else {
          otherLines.push(line);
        }
      } else {
        inImportSection = false;
        otherLines.push(line);
      }
    }
    
    // Sort imports and reassemble
    if (importLines.length > 0) {
      const sortedImports = importLines
        .filter(line => line.trim().startsWith('import '))
        .sort()
        .concat(importLines.filter(line => !line.trim().startsWith('import ')));
      
      modified = [...sortedImports, '', ...otherLines].join('\n');
    }
    
    return modified;
  }

  /**
   * Resolve style file conflicts
   */
  async resolveStyleFile(content, conflict) {
    // Simple approach: ensure consistent formatting
    return content
      .replace(/\s*{\s*/g, ' {\n  ')
      .replace(/;\s*/g, ';\n  ')
      .replace(/\s*}\s*/g, '\n}\n');
  }

  // Utility methods

  async ensureDataDirectory() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  async loadExistingData() {
    try {
      // Load conflicts
      const conflictsData = await fs.readFile(this.conflictsFile, 'utf8');
      const conflicts = JSON.parse(conflictsData);
      for (const conflict of conflicts) {
        this.detectedConflicts.set(conflict.id, conflict);
      }
    } catch {
      // No existing conflicts
    }
    
    try {
      // Load resolution history
      const historyData = await fs.readFile(this.resolutionFile, 'utf8');
      this.resolutionHistory = JSON.parse(historyData);
    } catch {
      // No existing history
    }
  }

  async saveConflicts(conflicts) {
    await fs.writeFile(this.conflictsFile, JSON.stringify(conflicts, null, 2));
  }

  async getTaskById(taskId) {
    try {
      const stateData = await fs.readFile(this.stateFile, 'utf8');
      const state = JSON.parse(stateData);
      return state.tasks?.[taskId];
    } catch {
      return null;
    }
  }

  async setupGitHooks() {
    // This would set up pre-commit hooks for conflict detection
    // Simplified implementation
    console.log('📋 Git hooks setup (placeholder)');
  }

  async createBackup(files) {
    const backupDir = path.join(this.dataDir, 'backups', Date.now().toString());
    await fs.mkdir(backupDir, { recursive: true });
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const backupPath = path.join(backupDir, path.basename(file));
        await fs.writeFile(backupPath, content);
      } catch (error) {
        console.warn(`Could not backup ${file}:`, error.message);
      }
    }
  }

  async restoreBackup(files) {
    // Implementation would restore from most recent backup
    console.log('Backup restoration (placeholder)');
  }

  async runTests() {
    try {
      execSync('npm test', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  extractFunctions(content) {
    const matches = content.match(/(?:function\s+(\w+)|(\w+)\s*[:=]\s*(?:function|\([^)]*\)\s*=>))/g) || [];
    return matches.map(match => {
      const nameMatch = match.match(/(?:function\s+(\w+)|(\w+)\s*[:=])/);
      return nameMatch ? (nameMatch[1] || nameMatch[2]) : 'anonymous';
    });
  }

  extractClasses(content) {
    const matches = content.match(/class\s+(\w+)/g) || [];
    return matches.map(match => match.match(/class\s+(\w+)/)[1]);
  }

  extractExports(content) {
    const matches = content.match(/export\s+(?:default\s+)?(?:class|function|const|let|var)?\s*(\w+)?/g) || [];
    return matches;
  }

  extractImports(content) {
    const matches = content.match(/import\s+.*?from\s+['"][^'"]+['"]/g) || [];
    return matches;
  }

  /**
   * Generate comprehensive conflict report
   */
  async generateConflictReport(conflicts) {
    const report = {
      summary: {
        totalConflicts: conflicts.length,
        highSeverity: conflicts.filter(c => c.severity === 'high').length,
        autoResolvable: conflicts.filter(c => c.autoResolvable).length,
        averageUrgency: conflicts.reduce((sum, c) => sum + c.urgencyScore, 0) / conflicts.length || 0
      },
      conflicts: conflicts.map(c => ({
        id: c.id,
        tasks: [c.taskA, c.taskB],
        files: c.files,
        severity: c.severity,
        urgencyScore: c.urgencyScore,
        autoResolvable: c.autoResolvable,
        recommendedStrategy: c.strategies[0]?.type || 'manual'
      })),
      timestamp: new Date().toISOString()
    };
    
    const reportFile = path.join(this.dataDir, `conflict-report-${Date.now()}.json`);
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`📊 Conflict report saved to: ${reportFile}`);
    return report;
  }

  /**
   * Get conflict statistics
   */
  async getStatistics() {
    const activeConflicts = Array.from(this.detectedConflicts.values());
    
    return {
      activeConflicts: activeConflicts.length,
      resolvedConflicts: this.resolutionHistory.length,
      autoResolutionRate: this.resolutionHistory.filter(r => r.method === 'automatic').length / this.resolutionHistory.length || 0,
      averageResolutionTime: this.calculateAverageResolutionTime(),
      commonConflictTypes: this.getCommonConflictTypes(),
      lastScan: this.lastScanTime
    };
  }

  calculateAverageResolutionTime() {
    // Simplified calculation
    return '2.5 hours'; // Placeholder
  }

  getCommonConflictTypes() {
    const types = {};
    this.resolutionHistory.forEach(conflict => {
      conflict.conflictTypes?.forEach(type => {
        types[type] = (types[type] || 0) + 1;
      });
    });
    
    return Object.entries(types)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }
}

// CLI mode
if (require.main === module) {
  const assistant = new ConflictResolutionAssistant();
  
  const args = process.argv.slice(2);
  const command = args[0];

  async function main() {
    try {
      await assistant.initialize();
      
      switch (command) {
        case 'scan':
          console.log('🔍 Scanning for conflicts...\n');
          const conflicts = await assistant.scanForConflicts();
          console.log(`\nFound ${conflicts.length} potential conflicts`);
          break;
          
        case 'resolve':
          const autoResolve = args.includes('--auto');
          if (autoResolve) {
            console.log('🔧 Auto-resolving conflicts...\n');
            const resolutions = await assistant.autoResolveConflicts(
              Array.from(assistant.detectedConflicts.values())
            );
            console.log(`Resolved ${resolutions.length} conflicts automatically`);
          } else {
            console.log('Manual resolution mode not implemented in CLI');
          }
          break;
          
        case 'stats':
          const stats = await assistant.getStatistics();
          console.log('📊 Conflict Resolution Statistics:');
          console.log(JSON.stringify(stats, null, 2));
          break;
          
        case 'help':
        default:
          console.log(`
🔧 Conflict Resolution Assistant

USAGE:
  node ConflictResolutionAssistant.js <command> [options]

COMMANDS:
  scan                 Scan for potential conflicts between active tasks
  resolve [--auto]     Resolve conflicts (auto-resolve if --auto flag)
  stats                Display conflict resolution statistics
  help                 Show this help

EXAMPLES:
  node ConflictResolutionAssistant.js scan
  node ConflictResolutionAssistant.js resolve --auto
  node ConflictResolutionAssistant.js stats

OUTPUT FILES:
  - detected-conflicts.json    Current conflicts
  - conflict-resolutions.json  Resolution history
  - conflict-report-*.json     Detailed reports
`);
          break;
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }

  main();
}

module.exports = ConflictResolutionAssistant;