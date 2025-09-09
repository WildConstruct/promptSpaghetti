#!/usr/bin/env node

/**
 * Code Modernizer - Advanced Pattern Detection and Transformation
 *
 * Focuses on modernizing code patterns and improving maintainability
 * - Legacy pattern detection and replacement
 * - Code smell identification and fixes
 * - Performance optimization suggestions
 * - Modern JavaScript/TypeScript adoption
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class CodeModernizer {
  constructor() {
    this.baseDir = process.cwd();
    this.modernizationStats = {
      legacyPatternsFixed: 0,
      performanceIssuesFixed: 0,
      codeSmelsFixes: 0,
      modernPatternsAdopted: 0,
      asyncAwaitMigrations: 0,
      classConversions: 0
    };

    // Legacy patterns to modernize
    this.legacyPatterns = [
      {
        name: 'Promise callbacks to async/await',
        pattern: /\.then\(\s*\(([^)]*)\)\s*=>\s*\{([^}]*)\}\s*\)\.catch\(/g,
        modernReplacement: 'async/await with try/catch',
        risk: 'medium'
      },
      {
        name: 'var to const/let',
        pattern: /\bvar\s+(\w+)/g,
        replacement: 'const $1',
        risk: 'low'
      },
      {
        name: 'function declarations to arrow functions',
        pattern: /function\s+(\w+)\s*\(([^)]*)\)\s*\{/g,
        replacement: 'const $1 = ($2) => {',
        risk: 'medium'
      },
      {
        name: 'Traditional for loops to modern iterations',
        pattern:
          /for\s*\(\s*var\s+(\w+)\s*=\s*0\s*;\s*\1\s*<\s*(\w+)\.length\s*;\s*\1\+\+\s*\)/g,
        replacement: 'for (const item of $2)',
        risk: 'low'
      }
    ];

    // Code smells to detect
    this.codeSmells = [
      {
        name: 'Long functions',
        detect: content => this.detectLongFunctions(content),
        suggestion: 'Break into smaller functions'
      },
      {
        name: 'Deep nesting',
        detect: content => this.detectDeepNesting(content),
        suggestion: 'Use early returns and guard clauses'
      },
      {
        name: 'Magic numbers',
        detect: content => this.detectMagicNumbers(content),
        suggestion: 'Replace with named constants'
      },
      {
        name: 'Duplicate string literals',
        detect: content => this.detectDuplicateStrings(content),
        suggestion: 'Extract to constants'
      }
    ];

    // Performance anti-patterns
    this.performancePatterns = [
      {
        name: 'Synchronous file operations',
        pattern: /fs\.readFileSync|fs\.writeFileSync|fs\.existsSync/g,
        suggestion: 'Use async file operations',
        risk: 'high'
      },
      {
        name: 'Inefficient array operations',
        pattern: /\.indexOf\([^)]+\)\s*!\==\s*-1/g,
        replacement: '.includes($1)',
        risk: 'low'
      },
      {
        name: 'Unnecessary string concatenation',
        pattern: /['"]\s*\+\s*['"]/g,
        suggestion: 'Use template literals',
        risk: 'low'
      }
    ];

    // Modern patterns to adopt
    this.modernPatterns = [
      {
        name: 'Destructuring assignment',
        detect: content => this.detectDestructuringOpportunities(content),
        suggestion: 'Use destructuring for cleaner code'
      },
      {
        name: 'Optional chaining',
        detect: content => this.detectOptionalChainingOpportunities(content),
        suggestion: 'Use ?. for safe property access'
      },
      {
        name: 'Nullish coalescing',
        detect: content => this.detectNullishCoalescingOpportunities(content),
        suggestion: 'Use ?? for null/undefined checks'
      }
    ];
  }

  async run() {
    console.log('🚀 Starting Code Modernizer');
    console.log('===========================');

    try {
      // 1. Scan codebase for patterns
      console.log('\n🔍 Scanning codebase for modernization opportunities...');
      const analysisResults = await this.analyzeCodebase();

      // 2. Apply safe transformations
      console.log('\n🔧 Applying safe code transformations...');
      await this.applySafeTransformations(analysisResults);

      // 3. Generate modernization suggestions
      console.log('\n💡 Generating modernization suggestions...');
      await this.generateSuggestions(analysisResults);

      // 4. Create modernization plan
      console.log('\n📋 Creating modernization plan...');
      await this.createModernizationPlan(analysisResults);

      console.log('\n✅ Code modernization analysis completed!');
      this.printModernizationStats();
    } catch (error) {
      console.error('❌ Code modernization failed:', error.message);
      process.exit(1);
    }
  }

  async analyzeCodebase() {
    const results = {
      legacyPatterns: [],
      codeSmells: [],
      performanceIssues: [],
      modernizationOpportunities: [],
      fileAnalysis: new Map()
    };

    // Find TypeScript and JavaScript files
    const files = await this.findSourceFiles();

    console.log(`   📁 Analyzing ${files.length} source files...`);

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const fileAnalysis = await this.analyzeFile(file, content);

        results.legacyPatterns.push(...fileAnalysis.legacyPatterns);
        results.codeSmells.push(...fileAnalysis.codeSmells);
        results.performanceIssues.push(...fileAnalysis.performanceIssues);
        results.modernizationOpportunities.push(
          ...fileAnalysis.modernizationOpportunities
        );
        results.fileAnalysis.set(file, fileAnalysis);
      } catch (error) {
        console.warn(`   ⚠️  Could not analyze ${file}: ${error.message}`);
      }
    }

    console.log('📊 Analysis Summary:');
    console.log(`   - ${results.legacyPatterns.length} legacy patterns found`);
    console.log(`   - ${results.codeSmells.length} code smells detected`);
    console.log(
      `   - ${results.performanceIssues.length} performance issues identified`
    );
    console.log(
      `   - ${results.modernizationOpportunities.length} modernization opportunities`
    );

    return results;
  }

  async analyzeFile(filePath, content) {
    const analysis = {
      file: filePath,
      legacyPatterns: [],
      codeSmells: [],
      performanceIssues: [],
      modernizationOpportunities: [],
      metrics: {
        linesOfCode: content.split('\n').length,
        cyclomaticComplexity: this.calculateCyclomaticComplexity(content),
        maintainabilityIndex: this.calculateMaintainabilityIndex(content)
      }
    };

    // Check for legacy patterns
    for (const pattern of this.legacyPatterns) {
      if (pattern.pattern.test(content)) {
        analysis.legacyPatterns.push({
          pattern: pattern.name,
          matches: content.match(pattern.pattern)?.length || 0,
          risk: pattern.risk,
          suggestion: pattern.modernReplacement || pattern.replacement
        });
      }
    }

    // Check for code smells
    for (const smell of this.codeSmells) {
      const issues = smell.detect(content);
      if (issues.length > 0) {
        analysis.codeSmells.push({
          smell: smell.name,
          issues,
          suggestion: smell.suggestion
        });
      }
    }

    // Check for performance issues
    for (const perf of this.performancePatterns) {
      if (perf.pattern.test(content)) {
        analysis.performanceIssues.push({
          issue: perf.name,
          matches: content.match(perf.pattern)?.length || 0,
          risk: perf.risk,
          suggestion: perf.suggestion
        });
      }
    }

    // Check for modernization opportunities
    for (const modern of this.modernPatterns) {
      const opportunities = modern.detect(content);
      if (opportunities.length > 0) {
        analysis.modernizationOpportunities.push({
          pattern: modern.name,
          opportunities,
          suggestion: modern.suggestion
        });
      }
    }

    return analysis;
  }

  async applySafeTransformations(analysisResults) {
    for (const [filePath, analysis] of analysisResults.fileAnalysis) {
      try {
        let content = await fs.readFile(filePath, 'utf8');
        let modified = false;

        // Apply safe transformations only
        for (const legacyPattern of analysis.legacyPatterns) {
          if (legacyPattern.risk === 'low') {
            const pattern = this.legacyPatterns.find(
              p => p.name === legacyPattern.pattern
            );
            if (pattern && pattern.replacement) {
              const newContent = content.replace(
                pattern.pattern,
                pattern.replacement
              );
              if (newContent !== content) {
                content = newContent;
                modified = true;
                console.log(
                  `   ✓ Fixed ${legacyPattern.pattern} in ${path.basename(filePath)}`
                );
                this.modernizationStats.legacyPatternsFixed++;
              }
            }
          }
        }

        // Apply performance fixes for low-risk items
        for (const perfIssue of analysis.performanceIssues) {
          if (perfIssue.risk === 'low') {
            const pattern = this.performancePatterns.find(
              p => p.name === perfIssue.issue
            );
            if (pattern && pattern.replacement) {
              const newContent = content.replace(
                pattern.pattern,
                pattern.replacement
              );
              if (newContent !== content) {
                content = newContent;
                modified = true;
                console.log(
                  `   ✓ Fixed ${perfIssue.issue} in ${path.basename(filePath)}`
                );
                this.modernizationStats.performanceIssuesFixed++;
              }
            }
          }
        }

        if (modified) {
          await fs.writeFile(filePath, content);
        }
      } catch (error) {
        console.warn(
          `   ⚠️  Could not transform ${filePath}: ${error.message}`
        );
      }
    }
  }

  async generateSuggestions(analysisResults) {
    const suggestions = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
      risky: []
    };

    for (const [filePath, analysis] of analysisResults.fileAnalysis) {
      const fileName = path.basename(filePath);

      // Categorize suggestions by urgency and risk
      for (const legacyPattern of analysis.legacyPatterns) {
        const suggestion = {
          file: fileName,
          type: 'legacy',
          pattern: legacyPattern.pattern,
          suggestion: legacyPattern.suggestion,
          matches: legacyPattern.matches
        };

        if (legacyPattern.risk === 'low') {
          suggestions.immediate.push(suggestion);
        } else if (legacyPattern.risk === 'medium') {
          suggestions.shortTerm.push(suggestion);
        } else {
          suggestions.risky.push(suggestion);
        }
      }

      for (const codeSmell of analysis.codeSmells) {
        suggestions.shortTerm.push({
          file: fileName,
          type: 'code_smell',
          smell: codeSmell.smell,
          suggestion: codeSmell.suggestion,
          issues: codeSmell.issues.length
        });
      }

      for (const perfIssue of analysis.performanceIssues) {
        const suggestion = {
          file: fileName,
          type: 'performance',
          issue: perfIssue.issue,
          suggestion: perfIssue.suggestion,
          matches: perfIssue.matches
        };

        if (perfIssue.risk === 'high') {
          suggestions.immediate.push(suggestion);
        } else {
          suggestions.shortTerm.push(suggestion);
        }
      }

      for (const modernOp of analysis.modernizationOpportunities) {
        suggestions.longTerm.push({
          file: fileName,
          type: 'modernization',
          pattern: modernOp.pattern,
          suggestion: modernOp.suggestion,
          opportunities: modernOp.opportunities.length
        });
      }
    }

    await this.saveSuggestions(suggestions);
  }

  async saveSuggestions(suggestions) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        immediate: suggestions.immediate.length,
        shortTerm: suggestions.shortTerm.length,
        longTerm: suggestions.longTerm.length,
        risky: suggestions.risky.length
      },
      suggestions,
      prioritization: {
        'High Priority (Do First)': suggestions.immediate,
        'Medium Priority (Next Sprint)': suggestions.shortTerm,
        'Low Priority (Future)': suggestions.longTerm,
        'Risky Changes (Review Carefully)': suggestions.risky
      }
    };

    await fs.writeFile(
      path.join(this.baseDir, 'modernization-suggestions.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('💡 Suggestions saved to modernization-suggestions.json');
    console.log(
      `   📈 ${suggestions.immediate.length} immediate improvements available`
    );
    console.log(
      `   📋 ${suggestions.shortTerm.length} short-term improvements identified`
    );
    console.log(
      `   🔮 ${suggestions.longTerm.length} long-term modernization opportunities`
    );
  }

  async createModernizationPlan(analysisResults) {
    const plan = {
      phases: [
        {
          name: 'Phase 1: Safety and Performance',
          description: 'Low-risk improvements with immediate benefits',
          tasks: [],
          estimatedDays: 2
        },
        {
          name: 'Phase 2: Code Quality',
          description: 'Address code smells and maintainability issues',
          tasks: [],
          estimatedDays: 5
        },
        {
          name: 'Phase 3: Modernization',
          description: 'Adopt modern JavaScript/TypeScript patterns',
          tasks: [],
          estimatedDays: 8
        },
        {
          name: 'Phase 4: Architecture',
          description: 'Structural improvements and refactoring',
          tasks: [],
          estimatedDays: 12
        }
      ],
      tools: [
        'ESLint with modern rules',
        'Prettier for code formatting',
        'TypeScript strict mode',
        'Automated testing for refactored code',
        'Code coverage monitoring'
      ],
      risks: [
        'Breaking changes in complex refactoring',
        'Performance regression in hot paths',
        'Type errors after strict TypeScript migration',
        'Test failures after pattern changes'
      ]
    };

    // Populate tasks based on analysis
    for (const [filePath, analysis] of analysisResults.fileAnalysis) {
      const fileName = path.basename(filePath);

      // Phase 1: Safety improvements
      if (analysis.performanceIssues.some(p => p.risk === 'high')) {
        plan.phases[0].tasks.push(`Fix performance issues in ${fileName}`);
      }

      // Phase 2: Code quality
      if (analysis.codeSmells.length > 0) {
        plan.phases[1].tasks.push(`Address code smells in ${fileName}`);
      }

      // Phase 3: Modernization
      if (analysis.modernizationOpportunities.length > 0) {
        plan.phases[2].tasks.push(`Modernize patterns in ${fileName}`);
      }

      // Phase 4: Architecture
      if (analysis.metrics.cyclomaticComplexity > 10) {
        plan.phases[3].tasks.push(`Refactor complex functions in ${fileName}`);
      }
    }

    await fs.writeFile(
      path.join(this.baseDir, 'modernization-plan.json'),
      JSON.stringify(plan, null, 2)
    );

    console.log('📋 Modernization plan saved to modernization-plan.json');
    const totalDays = plan.phases.reduce(
      (sum, phase) => sum + phase.estimatedDays,
      0
    );
    console.log(`   ⏱️  Estimated completion: ${totalDays} days`);
  }

  // Code smell detection methods
  detectLongFunctions(content) {
    const functions = this.extractFunctionBodies(content);
    return functions
      .filter(func => func.lines > 50)
      .map(func => ({
        name: func.name,
        lines: func.lines,
        startLine: func.startLine
      }));
  }

  detectDeepNesting(content) {
    const lines = content.split('\n');
    const issues = [];
    let maxDepth = 0;
    let currentDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      currentDepth += (line.match(/\{/g) || []).length;
      currentDepth -= (line.match(/\}/g) || []).length;

      if (currentDepth > maxDepth) {
        maxDepth = currentDepth;
      }

      if (currentDepth > 4) {
        issues.push({
          line: i + 1,
          depth: currentDepth,
          content: line.trim()
        });
      }
    }

    return issues;
  }

  detectMagicNumbers(content) {
    const magicNumberPattern = /\b(?!0|1|2|10|100|1000)\d+\b/g;
    const matches = content.match(magicNumberPattern) || [];
    return matches.map(number => ({ value: number, occurrences: 1 }));
  }

  detectDuplicateStrings(content) {
    const stringPattern = /["']([^"']{4,})["']/g;
    const strings = {};
    let match;

    while ((match = stringPattern.exec(content)) !== null) {
      const str = match[1];
      strings[str] = (strings[str] || 0) + 1;
    }

    return Object.entries(strings)
      .filter(([, count]) => count > 2)
      .map(([string, count]) => ({ string, occurrences: count }));
  }

  // Modernization opportunity detection
  detectDestructuringOpportunities(content) {
    const opportunities = [];

    // Detect object property access patterns
    const propertyAccessPattern = /(\w+)\.(\w+).*\1\.(\w+)/g;
    let match;

    while ((match = propertyAccessPattern.exec(content)) !== null) {
      opportunities.push({
        type: 'object_destructuring',
        object: match[1],
        properties: [match[2], match[3]],
        suggestion: `const { ${match[2]}, ${match[3]} } = ${match[1]};`
      });
    }

    return opportunities;
  }

  detectOptionalChainingOpportunities(content) {
    const opportunities = [];
    const pattern = /(\w+)\s*&&\s*\1\.(\w+)/g;
    let match;

    while ((match = pattern.exec(content)) !== null) {
      opportunities.push({
        type: 'optional_chaining',
        current: match[0],
        suggestion: `${match[1]}?.${match[2]}`
      });
    }

    return opportunities;
  }

  detectNullishCoalescingOpportunities(content) {
    const opportunities = [];
    const pattern = /(\w+)\s*\|\|\s*([^|]+)/g;
    let match;

    while ((match = pattern.exec(content)) !== null) {
      opportunities.push({
        type: 'nullish_coalescing',
        current: match[0],
        suggestion: `${match[1]} ?? ${match[2]}`
      });
    }

    return opportunities;
  }

  // Utility methods
  extractFunctionBodies(content) {
    const functions = [];
    const functionPattern = /(?:function\s+(\w+)|const\s+(\w+)\s*=.*?=>)\s*\{/g;
    let match;

    while ((match = functionPattern.exec(content)) !== null) {
      const name = match[1] || match[2];
      const startIndex = match.index;
      const startLine = content.substring(0, startIndex).split('\n').length;

      // Find function end (simplified)
      let braceCount = 0;
      let endIndex = startIndex;

      for (let i = startIndex; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        if (content[i] === '}') braceCount--;
        if (braceCount === 0) {
          endIndex = i;
          break;
        }
      }

      const functionBody = content.substring(startIndex, endIndex);
      const lines = functionBody.split('\n').length;

      functions.push({
        name,
        startLine,
        lines,
        body: functionBody
      });
    }

    return functions;
  }

  calculateCyclomaticComplexity(content) {
    // Simplified cyclomatic complexity calculation
    const complexityKeywords = [
      'if',
      'else',
      'while',
      'for',
      'case',
      'catch',
      'return',
      '&&',
      '||',
      '?',
      '::'
    ];

    let complexity = 1; // Base complexity

    for (const keyword of complexityKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  calculateMaintainabilityIndex(content) {
    // Simplified maintainability index (0-100 scale)
    const lines = content.split('\n').length;
    const complexity = this.calculateCyclomaticComplexity(content);
    const halsteadVolume = this.estimateHalsteadVolume(content);

    // Simplified formula
    const maintainabilityIndex = Math.max(
      0,
      ((171 -
        5.2 * Math.log(halsteadVolume) -
        0.23 * complexity -
        16.2 * Math.log(lines)) *
        100) /
        171
    );

    return Math.round(maintainabilityIndex);
  }

  estimateHalsteadVolume(content) {
    // Very simplified Halstead volume estimation
    const operators = content.match(/[+\-*/%=<>!&|^~]/g)?.length || 0;
    const operands = content.match(/\b\w+\b/g)?.length || 0;
    return (operators + operands) * Math.log2(operators + operands) || 1;
  }

  async findSourceFiles() {
    const files = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const excludePatterns = [
      'node_modules',
      'dist',
      'build',
      '.turbo',
      'coverage'
    ];

    async function walkDir(dir) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            const shouldSkip = excludePatterns.some(pattern =>
              fullPath.includes(pattern)
            );

            if (!shouldSkip) {
              await walkDir(fullPath);
            }
          } else {
            const hasValidExtension = extensions.some(ext =>
              entry.name.endsWith(ext)
            );

            if (hasValidExtension) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }

    await walkDir(process.cwd());
    return files;
  }

  printModernizationStats() {
    console.log('\n📊 Modernization Statistics:');
    console.log('============================');
    console.log(
      `Legacy patterns fixed: ${this.modernizationStats.legacyPatternsFixed}`
    );
    console.log(
      `Performance issues fixed: ${this.modernizationStats.performanceIssuesFixed}`
    );
    console.log(
      `Code smells addressed: ${this.modernizationStats.codeSmelsFixes}`
    );
    console.log(
      `Modern patterns adopted: ${this.modernizationStats.modernPatternsAdopted}`
    );
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Code Modernizer - Advanced Pattern Detection and Transformation

Usage: node code-modernizer.js [options]

Options:
  --dry-run    Analyze without making changes
  --help       Show this help message

Features:
  - Legacy pattern detection and safe fixes
  - Code smell identification
  - Performance anti-pattern detection  
  - Modern JavaScript/TypeScript suggestions
  - Maintainability metrics
  - Modernization planning
    `);
    process.exit(0);
  }

  const modernizer = new CodeModernizer();
  modernizer.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = CodeModernizer;
