# Refactoring Tools Guide

This guide documents the comprehensive refactoring and code modernization tools built for the Prompt Spaghetti codebase.

## Overview

The refactoring framework consists of three interconnected tools designed to modernize and maintain code quality across the entire codebase:

1. **Refactoring Framework** - Core transformation engine
2. **Code Modernizer** - Pattern detection and modernization
3. **Refactoring CLI** - Unified command-line interface

## Tools Architecture

### 1. Refactoring Framework (`tools/refactoring-framework.js`)

**Purpose**: Automated structural transformations and migrations

**Key Features**:

- JavaScript to TypeScript migration
- Import modernization and organization
- Duplicate code detection and removal
- Security vulnerability fixes
- Test configuration updates
- Configuration file modernization

**Usage**:

```bash
# Run full refactoring suite
node tools/refactoring-framework.js

# Show help
node tools/refactoring-framework.js --help

# Dry run mode
node tools/refactoring-framework.js --dry-run
```

**Transformation Types**:

| Transformation      | Risk Level | Description                                             |
| ------------------- | ---------- | ------------------------------------------------------- |
| JS to TS Migration  | Medium     | Converts .js files to .ts/.tsx                          |
| Import Organization | Low        | Sorts and modernizes import statements                  |
| Security Fixes      | High       | Removes dangerous patterns (eval, Function constructor) |
| Duplicate Removal   | Medium     | Identifies and suggests duplicate code removal          |
| Config Updates      | Low        | Modernizes package.json, tsconfig.json                  |

### 2. Code Modernizer (`tools/code-modernizer.js`)

**Purpose**: Advanced pattern detection and code quality improvements

**Key Features**:

- Legacy pattern detection and replacement
- Code smell identification
- Performance anti-pattern detection
- Modern JavaScript/TypeScript pattern suggestions
- Maintainability metrics calculation
- Modernization planning

**Usage**:

```bash
# Run modernization analysis
node tools/code-modernizer.js

# Show help
node tools/code-modernizer.js --help

# Analyze without changes
node tools/code-modernizer.js --dry-run
```

**Detection Categories**:

**Legacy Patterns**:

- Promise callbacks → async/await
- `var` declarations → `const`/`let`
- Function declarations → arrow functions
- Traditional for loops → modern iterations

**Code Smells**:

- Functions longer than 50 lines
- Nesting deeper than 4 levels
- Magic numbers and duplicate strings
- Complex conditional logic

**Performance Issues**:

- Synchronous file operations
- Inefficient array operations
- Unnecessary string concatenation
- Memory leaks and resource waste

### 3. Refactoring CLI (`tools/refactoring-cli.js`)

**Purpose**: Unified command-line interface for all refactoring operations

**Key Features**:

- Interactive refactoring sessions
- Batch transformations with validation
- Safe refactoring modes
- Integration with build tools
- Progress tracking and reporting

**Usage**:

```bash
# Interactive mode
node tools/refactoring-cli.js interactive

# Analyze codebase
node tools/refactoring-cli.js analyze

# Migrate JS to TS
node tools/refactoring-cli.js migrate --dry-run

# Apply modernizations
node tools/refactoring-cli.js modernize --patterns="async-await,destructuring"

# Validate changes
node tools/refactoring-cli.js validate

# Create and execute refactoring plan
node tools/refactoring-cli.js plan --execute
```

## Workflow Integration

### Recommended Refactoring Process

1. **Analysis Phase**

   ```bash
   # Comprehensive codebase analysis
   node tools/refactoring-cli.js analyze
   ```

2. **Planning Phase**

   ```bash
   # Create refactoring plan
   node tools/refactoring-cli.js plan
   ```

3. **Security Phase** (High Priority)

   ```bash
   # Address security issues first
   node tools/refactoring-cli.js modernize --patterns="security-fixes"
   ```

4. **Migration Phase**

   ```bash
   # Migrate JavaScript to TypeScript
   node tools/refactoring-cli.js migrate
   ```

5. **Modernization Phase**

   ```bash
   # Apply modern patterns
   node tools/refactoring-cli.js modernize
   ```

6. **Validation Phase**
   ```bash
   # Validate all changes
   node tools/refactoring-cli.js validate
   ```

### CI/CD Integration

```yaml
# .github/workflows/refactoring.yml
name: Code Refactoring Check

on:
  pull_request:
    branches: [main]

jobs:
  refactoring_check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run refactoring analysis
        run: node tools/refactoring-cli.js analyze
      - name: Validate code quality
        run: node tools/refactoring-cli.js validate
```

## Configuration

### Safe Mode Settings

The tools operate in "safe mode" by default, applying only low-risk transformations:

```javascript
// Safe transformations (applied automatically)
- Import organization
- var → const/let conversions
- Simple performance improvements
- Configuration updates

// Risky transformations (manual review required)
- Complex function refactoring
- Architecture changes
- API signature modifications
- Legacy library replacements
```

### Customization Options

Create `.refactoringrc.json` for project-specific settings:

```json
{
  "safeMode": true,
  "excludePatterns": ["legacy-integration/**", "third-party/**"],
  "transformations": {
    "jsToTs": true,
    "modernizeImports": true,
    "securityFixes": true,
    "performanceOptimizations": "safe-only"
  },
  "validation": {
    "runTypeCheck": true,
    "runLinting": true,
    "runTests": true,
    "runBuild": false
  }
}
```

## Output and Reports

### Analysis Reports

**`refactoring-analysis.json`** - Comprehensive analysis results:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "summary": {
    "totalFiles": 1250,
    "jsFilesToMigrate": 45,
    "securityIssues": 3,
    "legacyPatterns": 127,
    "codeSmells": 89,
    "performanceIssues": 23
  },
  "structural": {
    /* detailed structural analysis */
  },
  "modernization": {
    /* modernization opportunities */
  }
}
```

**`modernization-suggestions.json`** - Prioritized suggestions:

```json
{
  "prioritization": {
    "High Priority (Do First)": [
      {
        "file": "auth.js",
        "type": "security",
        "issue": "Function constructor usage",
        "suggestion": "Replace with safe evaluation"
      }
    ],
    "Medium Priority (Next Sprint)": [
      /* ... */
    ],
    "Low Priority (Future)": [
      /* ... */
    ]
  }
}
```

**`refactoring-plan.json`** - Execution roadmap:

```json
{
  "phases": [
    {
      "name": "Security Fixes",
      "priority": 1,
      "estimatedDays": 1,
      "tasks": ["Fix 3 security issues"],
      "validation": ["Security scan", "Manual review"]
    }
  ],
  "totalEstimatedDays": 8
}
```

## Advanced Usage

### Interactive Mode

```bash
node tools/refactoring-cli.js interactive
```

Interactive mode provides a REPL-like environment:

```
🎮 Interactive Refactoring Mode

refactor> analyze
🔍 Analyzing codebase for refactoring opportunities...
📊 Analysis complete: 45 JS files to migrate, 23 performance issues

refactor> migrate --dry-run
🔍 DRY RUN MODE - Would migrate 45 JavaScript files:
   • packages/core/nodeSchemas.js → nodeSchemas.ts
   • packages/core/graphSchema.js → graphSchema.ts

refactor> plan --execute
📋 Creating refactoring plan...
🚀 Executing Refactoring Plan...
```

### Pattern-Specific Modernization

```bash
# Apply specific patterns only
node tools/refactoring-cli.js modernize --patterns="async-await,destructuring,optional-chaining"

# Focus on performance
node tools/refactoring-cli.js modernize --patterns="performance-only"

# Security-focused modernization
node tools/refactoring-cli.js modernize --patterns="security-fixes"
```

### Batch Processing

```bash
# Process multiple directories
for dir in packages/core packages/cli client/src; do
  node tools/refactoring-cli.js modernize --directory="$dir"
done

# Validate entire codebase after refactoring
node tools/refactoring-cli.js validate --comprehensive
```

## Performance Metrics

The tools track and report on various metrics:

### Code Quality Metrics

- **Cyclomatic Complexity**: Measures code complexity
- **Maintainability Index**: Overall maintainability score (0-100)
- **Lines of Code**: Tracks code growth/reduction
- **Function Length**: Identifies overly long functions

### Modernization Progress

- **Legacy Pattern Reduction**: Percentage of legacy patterns eliminated
- **TypeScript Adoption**: Percentage of codebase in TypeScript
- **Modern Pattern Usage**: Adoption of ES6+ features
- **Security Score**: Security vulnerability reduction

### Performance Impact

- **Build Time**: Impact on compilation speed
- **Bundle Size**: Effect on output size
- **Runtime Performance**: Impact on execution speed
- **Memory Usage**: Memory footprint changes

## Troubleshooting

### Common Issues

1. **TypeScript Migration Errors**

   ```bash
   # Fix missing type definitions
   npm install --save-dev @types/node @types/react

   # Run type checking
   npx tsc --noEmit
   ```

2. **Import Resolution Issues**

   ```bash
   # Update tsconfig.json paths
   # Check module resolution strategy
   # Verify file extensions in imports
   ```

3. **Build Failures After Refactoring**

   ```bash
   # Validate step by step
   node tools/refactoring-cli.js validate

   # Check specific issues
   npm run typecheck
   npm run lint
   npm test
   ```

4. **Performance Regression**

   ```bash
   # Run performance tests
   npm run test:performance

   # Profile bundle size
   npm run analyze
   ```

### Recovery Procedures

If refactoring causes issues:

1. **Git Reset** (if using version control)

   ```bash
   git checkout -- .
   git clean -fd
   ```

2. **Incremental Recovery**

   ```bash
   # Re-run with safe mode
   node tools/refactoring-cli.js modernize --safe-mode
   ```

3. **Manual Rollback**
   ```bash
   # Restore from backup
   cp -r backup/* .
   ```

## Best Practices

### Before Refactoring

- [ ] Create complete backup of codebase
- [ ] Ensure all tests pass
- [ ] Document current architecture
- [ ] Plan refactoring in phases
- [ ] Set up proper monitoring

### During Refactoring

- [ ] Work in small, incremental changes
- [ ] Run validation after each phase
- [ ] Test thoroughly before proceeding
- [ ] Monitor performance impact
- [ ] Keep detailed change log

### After Refactoring

- [ ] Run comprehensive test suite
- [ ] Performance benchmark comparison
- [ ] Update documentation
- [ ] Team code review
- [ ] Deploy with extra monitoring

## Future Enhancements

### Planned Features

- **AI-Powered Refactoring**: Machine learning suggestions
- **Visual Diff Tools**: GUI for reviewing changes
- **Team Collaboration**: Multi-developer refactoring workflows
- **Custom Rules Engine**: Project-specific transformation rules
- **Integration APIs**: Webhook and API integration
- **Automated Testing**: Generate tests for refactored code

### Extensibility

The refactoring framework is designed to be extensible:

```javascript
// Custom transformation plugin
class CustomTransformation {
  name = 'custom-pattern';

  detect(content) {
    // Detection logic
  }

  transform(content) {
    // Transformation logic
  }

  validate(content) {
    // Validation logic
  }
}

// Register custom transformation
framework.registerTransformation(new CustomTransformation());
```

This comprehensive refactoring toolset provides the foundation for maintaining code quality and keeping the Prompt Spaghetti codebase modern, secure, and maintainable as it continues to evolve.
