# Documentation Testing Framework

A comprehensive testing framework for validating documentation accuracy, code examples, API contracts, and tutorial content in the PromptScape project.

## Overview

This framework ensures that documentation stays synchronized with the actual codebase by validating:

- **Code Examples**: TypeScript, JavaScript, shell commands, and configuration files
- **API Documentation**: Request/response formats, endpoints, and status codes  
- **Links**: Internal file references, external URLs, and anchor links
- **Tutorial Content**: Step-by-step guides and getting started examples

## Quick Start

### Running Documentation Tests

```bash
# Test all documentation
pnpm test:docs

# Watch mode for development
pnpm test:docs:watch

# Generate coverage report
pnpm test:docs:coverage
```

### Basic Usage

```typescript
import { DocTestFramework } from './DocTestFramework';

const docTest = new DocTestFramework({
  validateCodeBlocks: true,
  validateApiExamples: true,
  validateLinks: true,
  generateReport: true
});

const summary = await docTest.runTests();
console.log(`Tested ${summary.totalFiles} files with ${summary.passedTests}/${summary.totalTests} passing tests`);
```

## Framework Components

### 🏗️ DocTestFramework

Main orchestrator that coordinates all validation activities.

- **File Discovery**: Finds documentation using glob patterns
- **Parallel Processing**: Tests multiple files concurrently 
- **Report Generation**: Creates JSON, HTML, or Markdown reports
- **Error Aggregation**: Collects and categorizes issues across files

### 📄 CodeBlockExtractor

Extracts and parses code blocks from markdown files.

- **Language Detection**: Identifies programming languages and shell types
- **Metadata Parsing**: Extracts filenames, titles, and highlight information
- **Statistics**: Analyzes code distribution and complexity
- **Inline Code**: Handles both fenced blocks and inline snippets

### 🔧 TypeScriptValidator  

Validates TypeScript, JavaScript, TSX, and JSX code examples.

- **Syntax Validation**: Uses TypeScript compiler for accurate parsing
- **Import Checking**: Verifies module availability and package dependencies
- **Type Safety**: Optional type checking for TypeScript examples
- **Error Reporting**: Provides line-by-line error details with context

### 🌐 ApiValidator

Validates API documentation and examples.

- **Format Detection**: Extracts HTTP methods, endpoints, and JSON examples
- **Request Validation**: Checks URL formats, headers, and request bodies
- **Network Testing**: Optional live API validation (disabled by default)
- **Response Matching**: Compares expected vs actual API responses

### 💻 CliValidator

Validates command-line examples and shell scripts.

- **Syntax Checking**: Validates shell command syntax and structure
- **Command Availability**: Checks if commands exist on the system
- **Safety Analysis**: Identifies potentially dangerous operations
- **Argument Parsing**: Handles complex shell quoting and escaping

## Configuration

### Basic Configuration

```typescript
const config: DocTestConfig = {
  // File patterns
  documentationPaths: [
    'README.md',
    'docs/**/*.md', 
    'packages/**/README.md'
  ],
  
  // Validation features  
  validateCodeBlocks: true,
  validateApiExamples: true,
  validateLinks: true,
  
  // Performance
  maxConcurrentFiles: 5,
  timeout: 30000,
  
  // Reporting
  generateReport: true,
  reportFormat: 'json'
};
```

### Advanced Configuration

```typescript
const advancedConfig: DocTestConfig = {
  // TypeScript validation
  typescript: {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      strict: false,
      skipLibCheck: true
    },
    validateTypes: true,
    allowUndeclaredImports: false
  },
  
  // API validation  
  api: {
    baseUrl: 'http://localhost:8000',
    skipNetworkRequests: false,
    validateResponses: true,
    timeout: 5000
  },
  
  // CLI validation
  cli: {
    allowedCommands: ['npm', 'pnpm', 'git', 'node'],
    validateCommands: true,
    skipExecution: true,
    safetyChecks: true
  }
};
```

## Testing Examples

### Example: Valid TypeScript Code

```typescript
// This code block will pass validation
interface User {
  id: number;
  name: string;
  email: string;
}

const createUser = (userData: Partial<User>): User => {
  return {
    id: Date.now(),
    name: userData.name || 'Anonymous',
    email: userData.email || 'no-email@example.com'
  };
};
```

### Example: Valid API Documentation

```
GET /api/users

Response:
```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "total": 1
}
```

### Example: Valid CLI Commands

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build
```

## Integration with CI/CD

### GitHub Actions

```yaml
- name: Test Documentation
  run: |
    pnpm install
    pnpm test:docs
    
- name: Upload Documentation Report
  uses: actions/upload-artifact@v3
  with:
    name: doc-test-report
    path: test-results/documentation-test-report.json
```

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "pnpm test:docs && lint-staged"
    }
  }
}
```

## Report Formats

### JSON Report

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "summary": {
    "totalFiles": 45,
    "passedFiles": 43,
    "failedFiles": 2,
    "totalTests": 127,
    "passedTests": 121,
    "failedTests": 6
  },
  "breakdown": {
    "codeBlocks": {"total": 89, "passed": 85, "failed": 4},
    "apiExamples": {"total": 23, "passed": 21, "failed": 2}, 
    "links": {"total": 15, "passed": 15, "failed": 0}
  }
}
```

### Markdown Report

```markdown
# Documentation Test Report

**Generated:** Jan 15, 2024 at 10:30 AM
**Execution Time:** 2.3s

## Summary
- **Files Tested:** 45
- **Files Passed:** 43  
- **Files Failed:** 2
- **Success Rate:** 95.6%

## Common Errors
1. **Invalid TypeScript syntax** (3 occurrences)
2. **Missing import statements** (2 occurrences)
3. **Broken internal links** (1 occurrence)
```

## Best Practices

### Documentation Authors

1. **Use Specific Language Tags**: Always specify the correct language for code blocks
2. **Test Examples Locally**: Run code examples before committing documentation
3. **Keep Examples Simple**: Focus on clarity over comprehensive functionality
4. **Update Regularly**: Review documentation when code changes

### Code Examples

```typescript
// ✅ Good: Specific language, complete example
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
};

// ❌ Bad: Generic language, incomplete code  
const config = {
  // ... configuration options
};
```

### API Documentation

```markdown
<!-- ✅ Good: Complete request/response cycle -->
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}

Response: 201 Created
{
  "id": 123,
  "name": "John Doe", 
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00Z"
}

<!-- ❌ Bad: Incomplete information -->
POST /api/users
Creates a new user
```

## Troubleshooting

### Common Issues

**TypeScript validation errors**
- Ensure all imports are available in the project
- Check that TypeScript compiler options match your project
- Consider setting `allowUndeclaredImports: true` for documentation examples

**CLI command validation failures**
- Update `allowedCommands` list for your environment  
- Set `skipExecution: true` to avoid running commands during testing
- Review safety checks for potentially dangerous operations

**API validation timeouts**
- Increase `api.timeout` for slower networks
- Set `skipNetworkRequests: true` to test format only
- Ensure test environment has network access

**Link validation failures**
- Check that referenced files exist at specified paths
- Verify external URLs are accessible
- Update documentation paths if files have moved

### Debug Mode

```typescript
const docTest = new DocTestFramework({
  verbose: true,
  generateReport: true,
  reportFormat: 'markdown'
});

// Enable detailed logging
process.env.DOC_TEST_DEBUG = 'true';
```

## Contributing

See the main project [CONTRIBUTING.md](../../CONTRIBUTING.md) for general contribution guidelines.

### Documentation Testing Specific Guidelines

1. **Add Tests**: Include test cases for new validation features
2. **Update Examples**: Keep this README's examples current
3. **Performance**: Consider impact on test execution time
4. **Backwards Compatibility**: Maintain configuration compatibility

## License

This documentation testing framework is part of the PromptScape project and follows the same license terms.