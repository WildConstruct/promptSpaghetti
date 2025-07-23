#!/usr/bin/env node

/**
 * Architecture Validator
 * 
 * Automated tool to validate adherence to architectural rules and patterns
 * - Code organization compliance
 * - Dependency rule validation  
 * - Naming convention enforcement
 * - Design pattern detection
 */

const fs = require('fs').promises;
const path = require('path');
const { parse } = require('@typescript-eslint/parser');

class ArchitectureValidator {
  constructor() {
    this.baseDir = process.cwd();
    this.violations = {
      structural: [],
      naming: [],
      dependencies: [],
      patterns: [],
      security: []
    };
    
    this.rules = {
      // File organization rules
      fileOrganization: {
        requiredDirectories: ['src', 'types', '__tests__'],
        prohibitedPatterns: [
          /.*\/utils\/.*\/utils\//,  // Nested utils directories
          /.*\/helpers\/.*\/helpers\//  // Nested helpers directories
        ]
      },
      
      // Naming convention rules
      namingConventions: {
        interfaces: /^[A-Z][a-zA-Z0-9]*$/,
        classes: /^[A-Z][a-zA-Z0-9]*$/,
        functions: /^[a-z][a-zA-Z0-9]*$/,
        variables: /^[a-z][a-zA-Z0-9]*$/,
        constants: /^[A-Z][A-Z0-9_]*$/,
        files: {
          components: /^[A-Z][a-zA-Z0-9]*\.(tsx|ts)$/,
          services: /^[a-z][a-zA-Z0-9]*Service\.ts$/,
          types: /^[a-z][a-zA-Z0-9]*Types\.ts$/,
          utils: /^[a-z][a-zA-Z0-9]*Utils\.ts$/
        }
      },
      
      // Dependency rules by package
      dependencies: {
        'packages/core': {
          allowed: ['zod', 'uuid', 'seedrandom'],
          prohibited: ['react', 'express', '@mui/material', 'fastify']
        },
        'packages/ui-kit': {
          allowed: ['react', '@mui/material', '@emotion/react'],
          prohibited: ['fastify', 'sqlite3', 'redis']
        },
        'server': {
          allowed: ['fastify', 'sqlite3', 'redis', 'zod'],
          prohibited: ['react', '@mui/material']
        }
      },
      
      // Security patterns
      security: {
        prohibitedPatterns: [
          /eval\s*\(/g,
          /Function\s*\(/g,
          /new\s+Function/g,
          /__proto__/g,
          /constructor\.constructor/g
        ],
        requiredPatterns: [
          /SecureValidation\./g  // Must use security validation
        ]
      }
    };
    
    this.stats = {
      filesAnalyzed: 0,
      violationsFound: 0,
      rulesChecked: 0
    };
  }

  async validate() {
    console.log('🏗️  Architecture Validator');
    console.log('========================');
    
    try {
      // 1. Analyze project structure
      console.log('\n📁 Analyzing project structure...');
      await this.validateProjectStructure();
      
      // 2. Validate file organization
      console.log('📂 Validating file organization...');
      await this.validateFileOrganization();
      
      // 3. Check naming conventions
      console.log('🏷️  Checking naming conventions...');
      await this.validateNamingConventions();
      
      // 4. Verify dependency rules
      console.log('📦 Verifying dependency rules...');
      await this.validateDependencyRules();
      
      // 5. Check design patterns
      console.log('🎨 Checking design patterns...');
      await this.validateDesignPatterns();
      
      // 6. Security rule validation
      console.log('🔒 Validating security rules...');
      await this.validateSecurityRules();
      
      // 7. Generate report
      console.log('\n📋 Generating validation report...');
      await this.generateReport();
      
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  }

  async validateProjectStructure() {
    const requiredStructure = {
      'packages/': ['core', 'ui-kit', 'graph-core'],
      'server/': ['src'],
      'client/': ['src'],
      'docs/': ['architecture'],
      'tools/': []
    };
    
    for (const [directory, subdirs] of Object.entries(requiredStructure)) {
      try {
        await fs.access(path.join(this.baseDir, directory));
        
        for (const subdir of subdirs) {
          try {
            await fs.access(path.join(this.baseDir, directory, subdir));
          } catch {
            this.violations.structural.push({
              type: 'missing_directory',
              message: `Required directory missing: ${directory}${subdir}`,
              severity: 'error'
            });
          }
        }
      } catch {
        this.violations.structural.push({
          type: 'missing_directory',
          message: `Required top-level directory missing: ${directory}`,
          severity: 'error'
        });
      }
    }
  }

  async validateFileOrganization() {
    const sourceFiles = await this.findSourceFiles();
    
    for (const file of sourceFiles) {
      const relativePath = path.relative(this.baseDir, file);
      
      // Check for prohibited patterns
      for (const pattern of this.rules.fileOrganization.prohibitedPatterns) {
        if (pattern.test(relativePath)) {
          this.violations.structural.push({
            type: 'prohibited_pattern',
            file: relativePath,
            message: `File organization violates pattern rule: ${pattern}`,
            severity: 'warning'
          });
        }
      }
      
      // Check co-location rules
      if (file.includes('__tests__')) {
        const testFile = file;
        const sourceFile = testFile.replace('__tests__/', '').replace('.test.', '.');
        
        try {
          await fs.access(sourceFile);
        } catch {
          this.violations.structural.push({
            type: 'orphaned_test',
            file: relativePath,
            message: 'Test file has no corresponding source file',
            severity: 'warning'
          });
        }
      }
    }
  }

  async validateNamingConventions() {
    const typeScriptFiles = await this.findSourceFiles('**/*.ts');
    
    for (const file of typeScriptFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        await this.validateFileNaming(file, content);
      } catch (error) {
        console.warn(`Could not validate naming in ${file}: ${error.message}`);
      }
    }
  }

  async validateFileNaming(filePath, content) {
    const fileName = path.basename(filePath);
    const relativePath = path.relative(this.baseDir, filePath);
    
    // Validate file naming patterns
    if (fileName.endsWith('.tsx')) {
      if (!this.rules.namingConventions.files.components.test(fileName)) {
        this.violations.naming.push({
          type: 'file_naming',
          file: relativePath,
          message: `React component file should use PascalCase: ${fileName}`,
          severity: 'error'
        });
      }
    }
    
    if (fileName.includes('Service.ts')) {
      if (!this.rules.namingConventions.files.services.test(fileName)) {
        this.violations.naming.push({
          type: 'file_naming',
          file: relativePath,
          message: `Service file should follow camelCaseService.ts pattern: ${fileName}`,
          severity: 'error'
        });
      }
    }
    
    // Parse TypeScript content for naming validation
    try {
      const ast = this.parseTypeScript(content);
      this.validateASTNaming(ast, relativePath);
    } catch (error) {
      // Skip files that can't be parsed (might be invalid TS)
    }
  }

  parseTypeScript(content) {
    try {
      return parse(content, {
        sourceType: 'module',
        ecmaVersion: 2020,
        ecmaFeatures: {
          jsx: true
        }
      });
    } catch (error) {
      // Fallback to simple regex-based validation
      return null;
    }
  }

  validateASTNaming(ast, filePath) {
    if (!ast) return;
    
    // Simple regex-based validation as fallback
    const content = ast.toString();
    
    // Check interface naming
    const interfaceMatches = content.match(/interface\s+(\w+)/g);
    if (interfaceMatches) {
      interfaceMatches.forEach(match => {
        const interfaceName = match.replace('interface ', '');
        if (!this.rules.namingConventions.interfaces.test(interfaceName)) {
          this.violations.naming.push({
            type: 'interface_naming',
            file: filePath,
            message: `Interface should use PascalCase: ${interfaceName}`,
            severity: 'error'
          });
        }
      });
    }
    
    // Check class naming
    const classMatches = content.match(/class\s+(\w+)/g);
    if (classMatches) {
      classMatches.forEach(match => {
        const className = match.replace('class ', '');
        if (!this.rules.namingConventions.classes.test(className)) {
          this.violations.naming.push({
            type: 'class_naming',
            file: filePath,
            message: `Class should use PascalCase: ${className}`,
            severity: 'error'
          });
        }
      });
    }
    
    // Check function naming
    const functionMatches = content.match(/function\s+(\w+)/g);
    if (functionMatches) {
      functionMatches.forEach(match => {
        const functionName = match.replace('function ', '');
        if (!this.rules.namingConventions.functions.test(functionName)) {
          this.violations.naming.push({
            type: 'function_naming',
            file: filePath,
            message: `Function should use camelCase: ${functionName}`,
            severity: 'error'
          });
        }
      });
    }
  }

  async validateDependencyRules() {
    const packageJsonFiles = await this.findPackageJsonFiles();
    
    for (const packageFile of packageJsonFiles) {
      try {
        const content = await fs.readFile(packageFile, 'utf8');
        const packageData = JSON.parse(content);
        const packageDir = path.dirname(packageFile);
        const relativePath = path.relative(this.baseDir, packageDir);
        
        await this.validatePackageDependencies(relativePath, packageData);
      } catch (error) {
        console.warn(`Could not validate ${packageFile}: ${error.message}`);
      }
    }
  }

  async validatePackageDependencies(packagePath, packageData) {
    const rules = this.getDependencyRulesForPackage(packagePath);
    if (!rules) return;
    
    const allDeps = {
      ...packageData.dependencies,
      ...packageData.devDependencies
    };
    
    // Check prohibited dependencies
    for (const prohibited of rules.prohibited) {
      if (allDeps[prohibited]) {
        this.violations.dependencies.push({
          type: 'prohibited_dependency',
          package: packagePath,
          dependency: prohibited,
          message: `Package ${packagePath} should not depend on ${prohibited}`,
          severity: 'error'
        });
      }
    }
    
    // Check for missing allowed dependencies (if they're used in imports)
    const sourceFiles = await this.findSourceFiles(`${packagePath}/**/*.ts`);
    const imports = new Set();
    
    for (const file of sourceFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const importMatches = content.match(/import.*from\s+['"]([^'"]+)['"]/g);
        if (importMatches) {
          importMatches.forEach(match => {
            const importPath = match.match(/from\s+['"]([^'"]+)['"]/)?.[1];
            if (importPath && !importPath.startsWith('.') && !importPath.startsWith('/')) {
              const packageName = importPath.split('/')[0];
              imports.add(packageName);
            }
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    // Check if imported packages are declared as dependencies
    for (const importedPackage of imports) {
      if (!allDeps[importedPackage] && !this.isBuiltinModule(importedPackage)) {
        this.violations.dependencies.push({
          type: 'missing_dependency',
          package: packagePath,
          dependency: importedPackage,
          message: `Package ${packagePath} imports ${importedPackage} but doesn't declare it as a dependency`,
          severity: 'warning'
        });
      }
    }
  }

  getDependencyRulesForPackage(packagePath) {
    for (const [pattern, rules] of Object.entries(this.rules.dependencies)) {
      if (packagePath.includes(pattern)) {
        return rules;
      }
    }
    return null;
  }

  isBuiltinModule(moduleName) {
    const builtins = [
      'fs', 'path', 'crypto', 'util', 'events', 'stream', 'http', 'https',
      'url', 'querystring', 'buffer', 'child_process', 'cluster', 'os'
    ];
    return builtins.includes(moduleName);
  }

  async validateDesignPatterns() {
    const sourceFiles = await this.findSourceFiles('**/*.ts');
    
    for (const file of sourceFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        await this.validatePatternsInFile(file, content);
      } catch (error) {
        console.warn(`Could not validate patterns in ${file}: ${error.message}`);
      }
    }
  }

  async validatePatternsInFile(filePath, content) {
    const relativePath = path.relative(this.baseDir, filePath);
    
    // Check for God objects (classes with too many methods)
    const classMatches = content.match(/class\s+(\w+)[^{]*\{([^{}]*|\{[^{}]*\})*\}/gs);
    if (classMatches) {
      classMatches.forEach(match => {
        const methodMatches = match.match(/\w+\s*\([^)]*\)\s*\{/g);
        if (methodMatches && methodMatches.length > 10) {
          const className = match.match(/class\s+(\w+)/)?.[1];
          this.violations.patterns.push({
            type: 'god_object',
            file: relativePath,
            message: `Class ${className} has too many methods (${methodMatches.length}). Consider splitting into smaller classes.`,
            severity: 'warning'
          });
        }
      });
    }
    
    // Check for singleton pattern usage (discouraged)
    if (content.includes('getInstance') && content.includes('private static')) {
      this.violations.patterns.push({
        type: 'singleton_pattern',
        file: relativePath,
        message: 'Singleton pattern detected. Consider using dependency injection instead.',
        severity: 'warning'
      });
    }
    
    // Check for proper interface usage
    const interfaceCount = (content.match(/interface\s+\w+/g) || []).length;
    const classCount = (content.match(/class\s+\w+/g) || []).length;
    
    if (classCount > 0 && interfaceCount === 0 && !filePath.includes('test')) {
      this.violations.patterns.push({
        type: 'missing_interfaces',
        file: relativePath,
        message: 'Consider defining interfaces for better testability and abstraction.',
        severity: 'info'
      });
    }
  }

  async validateSecurityRules() {
    const sourceFiles = await this.findSourceFiles('**/*.ts');
    
    for (const file of sourceFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        await this.validateSecurityInFile(file, content);
      } catch (error) {
        console.warn(`Could not validate security in ${file}: ${error.message}`);
      }
    }
  }

  async validateSecurityInFile(filePath, content) {
    const relativePath = path.relative(this.baseDir, filePath);
    
    // Check for prohibited security patterns
    for (const pattern of this.rules.security.prohibitedPatterns) {
      if (pattern.test(content)) {
        this.violations.security.push({
          type: 'dangerous_pattern',
          file: relativePath,
          pattern: pattern.toString(),
          message: `Dangerous pattern detected: ${pattern}. Use safe alternatives.`,
          severity: 'error'
        });
      }
    }
    
    // Check for user input handling
    if (content.includes('req.body') || content.includes('request.body')) {
      if (!content.includes('SecureValidation') && !content.includes('.parse(')) {
        this.violations.security.push({
          type: 'unvalidated_input',
          file: relativePath,
          message: 'User input detected without validation. Use SecureValidation or schema validation.',
          severity: 'error'
        });
      }
    }
    
    // Check for SQL injection risks
    const sqlPatterns = [
      /query\s*\(\s*`.*\$\{/g,
      /query\s*\(\s*'.*'\s*\+/g,
      /query\s*\(\s*".*"\s*\+/g
    ];
    
    for (const pattern of sqlPatterns) {
      if (pattern.test(content)) {
        this.violations.security.push({
          type: 'sql_injection_risk',
          file: relativePath,
          message: 'Potential SQL injection risk. Use parameterized queries or prepared statements.',
          severity: 'error'
        });
      }
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        filesAnalyzed: this.stats.filesAnalyzed,
        violationsFound: this.getTotalViolations(),
        ruleCategories: Object.keys(this.violations).length
      },
      violations: this.violations,
      recommendations: this.generateRecommendations(),
      complianceScore: this.calculateComplianceScore()
    };
    
    await fs.writeFile(
      path.join(this.baseDir, 'architecture-validation-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    // Generate human-readable report
    const readableReport = this.generateReadableReport(report);
    await fs.writeFile(
      path.join(this.baseDir, 'architecture-validation-report.md'),
      readableReport
    );
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Structural recommendations
    if (this.violations.structural.length > 0) {
      recommendations.push({
        category: 'Structure',
        priority: 'High',
        action: 'Fix project structure violations to ensure proper organization'
      });
    }
    
    // Security recommendations
    if (this.violations.security.length > 0) {
      recommendations.push({
        category: 'Security',
        priority: 'Critical',
        action: 'Address security violations immediately - they pose potential risks'
      });
    }
    
    // Dependency recommendations
    if (this.violations.dependencies.length > 0) {
      recommendations.push({
        category: 'Dependencies',
        priority: 'Medium',
        action: 'Clean up dependency violations to maintain proper layer separation'
      });
    }
    
    // Pattern recommendations
    if (this.violations.patterns.length > 0) {
      recommendations.push({
        category: 'Design Patterns',
        priority: 'Low',
        action: 'Improve design patterns for better maintainability'
      });
    }
    
    return recommendations;
  }

  calculateComplianceScore() {
    const totalFiles = this.stats.filesAnalyzed;
    const totalViolations = this.getTotalViolations();
    
    if (totalFiles === 0) return 100;
    
    const violationRate = totalViolations / totalFiles;
    const complianceScore = Math.max(0, 100 - (violationRate * 20)); // Scale violations
    
    return Math.round(complianceScore);
  }

  generateReadableReport(report) {
    let markdown = `# Architecture Validation Report

Generated: ${report.timestamp}

## Summary

- **Files Analyzed**: ${report.summary.filesAnalyzed}
- **Violations Found**: ${report.summary.violationsFound}
- **Compliance Score**: ${report.complianceScore}%

## Violations by Category

`;

    for (const [category, violations] of Object.entries(this.violations)) {
      if (violations.length > 0) {
        markdown += `### ${category.charAt(0).toUpperCase() + category.slice(1)} (${violations.length} violations)

`;
        violations.forEach(violation => {
          markdown += `- **${violation.type}**: ${violation.message}`;
          if (violation.file) markdown += ` (${violation.file})`;
          markdown += '\n';
        });
        markdown += '\n';
      }
    }

    markdown += `## Recommendations

`;
    report.recommendations.forEach(rec => {
      markdown += `### ${rec.category} (${rec.priority} Priority)

${rec.action}

`;
    });

    return markdown;
  }

  getTotalViolations() {
    return Object.values(this.violations).reduce((sum, violations) => sum + violations.length, 0);
  }

  printSummary() {
    console.log('\n📊 Validation Summary:');
    console.log('=====================');
    console.log(`Files analyzed: ${this.stats.filesAnalyzed}`);
    console.log(`Total violations: ${this.getTotalViolations()}`);
    console.log(`Compliance score: ${this.calculateComplianceScore()}%`);
    
    console.log('\nViolations by category:');
    for (const [category, violations] of Object.entries(this.violations)) {
      if (violations.length > 0) {
        console.log(`  ${category}: ${violations.length}`);
      }
    }
    
    console.log('\n📋 Reports generated:');
    console.log('  • architecture-validation-report.json');
    console.log('  • architecture-validation-report.md');
    
    if (this.getTotalViolations() > 0) {
      console.log(`\n⚠️  ${this.getTotalViolations()} architecture violations found. See report for details.`);
    } else {
      console.log('\n✅ No architecture violations found!');
    }
  }

  async findSourceFiles(pattern = '**/*.{ts,tsx}') {
    const files = [];
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
            if (pattern.includes('**/*.ts') && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
              files.push(fullPath);
            } else if (typeof pattern === 'string' && entry.name.match(pattern)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }
    
    await walkDir(this.baseDir);
    this.stats.filesAnalyzed = files.length;
    return files;
  }

  async findPackageJsonFiles() {
    const files = [];
    const excludePatterns = ['node_modules'];

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
          } else if (entry.name === 'package.json') {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }
    
    await walkDir(this.baseDir);
    return files;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Architecture Validator

Usage: node architecture-validator.js [options]

Options:
  --help       Show this help message
  --verbose    Show detailed validation output

Features:
  - Project structure validation
  - File organization compliance
  - Naming convention enforcement  
  - Dependency rule validation
  - Design pattern detection
  - Security rule checking
    `);
    process.exit(0);
  }
  
  const validator = new ArchitectureValidator();
  validator.validate().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ArchitectureValidator;