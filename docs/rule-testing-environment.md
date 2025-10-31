# Rule Testing Environment

## Overview

The Rule Testing Environment provides a comprehensive testing framework for security and compliance rules in the Prompt Spaghetti project. It orchestrates testing across multiple compliance frameworks (GDPR, CCPA, HIPAA, etc.) and integrates with existing rule engines to provide automated testing, performance benchmarking, and conflict resolution validation.

## Architecture

### Core Components

1. **RuleTestingEnvironment** - Main orchestration class
2. **ComplianceRuleEngine Integration** - Tests compliance rule evaluation
3. **RuleTestingFramework Integration** - Leverages existing testing framework
4. **ValidationRulesEngine Integration** - Tests validation rule systems
5. **CLI Interface** - Command-line access for automation
6. **Performance Benchmarking** - Stress testing and performance analysis

### Key Features

- **Multi-Framework Testing**: Supports GDPR, CCPA, HIPAA, SOX, PCI_DSS, ISO_27001, SOC_2, NIST, PIPEDA, LGPD, PDPA
- **Comprehensive Test Types**: Unit, Integration, Functional, Performance, Security, Regression
- **Automated Setup/Teardown**: Isolated test environments with automatic cleanup
- **Performance Benchmarking**: Stress testing with configurable load parameters
- **Conflict Resolution Testing**: Validates rule conflict detection and resolution
- **Synthetic Data Generation**: Creates test data for various scenarios
- **Real-time Reporting**: Live test execution monitoring and detailed reports

## Installation & Setup

### Prerequisites

```bash
# Install dependencies
npm install

# Ensure TypeScript and ts-node are available
npm install -g typescript ts-node
```

### Basic Setup

```bash
# Generate sample configuration
npm run rule-test generate-config

# Setup testing environment
npm run rule-test:setup

# Check status
npm run rule-test:status
```

### Custom Configuration

Create a `rule-test-config.json` file:

```json
{
  "name": "Production Rule Testing Environment",
  "description": "Production-ready rule testing configuration",
  "frameworks": ["GDPR", "CCPA", "HIPAA", "SOX"],
  "testTypes": ["UNIT", "INTEGRATION", "FUNCTIONAL", "PERFORMANCE", "SECURITY"],
  "performance": {
    "maxExecutionTime": 60000,
    "maxRuleCount": 5000,
    "maxConcurrency": 20
  },
  "data": {
    "generateSyntheticData": true,
    "datasetSize": "large",
    "includeEdgeCases": true
  },
  "reporting": {
    "enableRealTimeReporting": true,
    "generateDetailedReports": true,
    "exportResults": true
  }
}
```

Then setup with custom config:

```bash
npm run rule-test setup --config rule-test-config.json
```

## Usage

### CLI Commands

#### Environment Management

```bash
# Setup environment
npm run rule-test:setup
npm run rule-test setup --config custom-config.json

# Check status
npm run rule-test:status

# Teardown environment
npm run rule-test teardown --force
```

#### Test Execution

```bash
# Run comprehensive test suite
npm run rule-test:run

# Test specific framework
npm run rule-test run --framework GDPR

# Run specific test types
npm run rule-test run --integration
npm run rule-test run --performance
npm run rule-test run --conflicts

# Export results
npm run rule-test run --output ./test-reports/
```

#### Performance Benchmarking

```bash
# Run standard benchmarks
npm run rule-test:benchmark

# Custom benchmark parameters
npm run rule-test benchmark --rules 1000 --data 10000 --concurrency 10

# Extended benchmark duration
npm run rule-test benchmark --duration 120
```

### Programmatic Usage

```typescript
import RuleTestingEnvironment, {
  TestEnvironmentConfig
} from './server/src/services/RuleTestingEnvironment';

const config: TestEnvironmentConfig = {
  name: 'Custom Test Environment',
  description: 'Programmatic testing setup',
  frameworks: ['GDPR', 'CCPA'],
  testTypes: ['UNIT', 'INTEGRATION'],
  performance: {
    maxExecutionTime: 30000,
    maxRuleCount: 1000,
    maxConcurrency: 5
  },
  data: {
    generateSyntheticData: true,
    datasetSize: 'medium',
    includeEdgeCases: true
  },
  reporting: {
    enableRealTimeReporting: true,
    generateDetailedReports: true,
    exportResults: true
  }
};

// Initialize and setup
const testEnv = new RuleTestingEnvironment(config);
await testEnv.setupEnvironment();

// Execute tests
const reports = await testEnv.executeTestSuite();

// Get metrics
const metrics = testEnv.getMetrics();
console.log(`Tests: ${metrics.totalTests}, Passed: ${metrics.passedTests}`);

// Cleanup
await testEnv.teardownEnvironment();
```

## Test Types

### Framework Testing

Tests specific compliance frameworks:

```bash
# Test GDPR compliance rules
npm run rule-test run --framework GDPR

# Test CCPA privacy rules
npm run rule-test run --framework CCPA

# Test HIPAA healthcare rules
npm run rule-test run --framework HIPAA
```

### Integration Testing

Tests interactions between different rule systems:

- Cross-framework rule interactions
- Validation and compliance rule integration
- Rule engine component integration
- End-to-end workflow testing

### Performance Benchmarking

Comprehensive performance testing:

- **High Volume Testing**: 1000+ rules with 10000+ data points
- **Complex Dependencies**: Rules with intricate dependency chains
- **Concurrent Processing**: Multi-threaded rule evaluation
- **Memory Profiling**: Memory usage under load
- **Latency Analysis**: Response time distribution

### Conflict Resolution Testing

Validates rule conflict detection and resolution:

- **Allow/Deny Conflicts**: Contradictory permission rules
- **Priority Conflicts**: Rules with competing priorities
- **Scope Overlap**: Rules affecting same data/operations
- **Action Conflicts**: Incompatible rule actions
- **Dependency Cycles**: Circular rule dependencies
- **Temporal Conflicts**: Time-based rule interactions

## Reporting

### Test Reports

Each test execution generates comprehensive reports:

```json
{
  "id": "test-report-12345",
  "testSuite": {
    "name": "GDPR Compliance Testing",
    "framework": "GDPR"
  },
  "summary": {
    "total": 150,
    "passed": 145,
    "failed": 3,
    "skipped": 2,
    "duration": 45000
  },
  "results": [...],
  "metrics": {
    "coverage": 95.2,
    "performance": {
      "avgExecutionTime": 300,
      "rulesPerSecond": 333.33
    }
  },
  "recommendations": [
    "Consider optimizing rule R-12345 for better performance",
    "Rule conflict detected between R-67890 and R-11111"
  ]
}
```

### Performance Metrics

- **Rules per Second**: Rule evaluation throughput
- **Average Execution Time**: Mean rule evaluation time
- **Memory Usage**: Peak memory consumption
- **CPU Utilization**: Processing resource usage
- **Error Rates**: Failed evaluation percentage

### Export Formats

Reports can be exported in multiple formats:

- JSON (programmatic access)
- HTML (human-readable)
- CSV (spreadsheet analysis)
- XML (system integration)

## Configuration Reference

### TestEnvironmentConfig

```typescript
interface TestEnvironmentConfig {
  name: string; // Environment name
  description: string; // Environment description
  frameworks: ComplianceFramework[]; // Frameworks to test
  testTypes: RuleTestType[]; // Types of tests to run
  performance: {
    maxExecutionTime: number; // Max test execution time (ms)
    maxRuleCount: number; // Max rules per test
    maxConcurrency: number; // Max concurrent tests
  };
  data: {
    generateSyntheticData: boolean; // Generate test data
    datasetSize: 'small' | 'medium' | 'large'; // Data volume
    includeEdgeCases: boolean; // Include edge case data
  };
  reporting: {
    enableRealTimeReporting: boolean; // Live reporting
    generateDetailedReports: boolean; // Detailed reports
    exportResults: boolean; // Export capability
  };
}
```

### Supported Frameworks

- **GDPR** - General Data Protection Regulation
- **CCPA** - California Consumer Privacy Act
- **HIPAA** - Health Insurance Portability and Accountability Act
- **SOX** - Sarbanes-Oxley Act
- **PCI_DSS** - Payment Card Industry Data Security Standard
- **ISO_27001** - International Organization for Standardization 27001
- **SOC_2** - System and Organization Controls 2
- **NIST** - National Institute of Standards and Technology
- **PIPEDA** - Personal Information Protection and Electronic Documents Act
- **LGPD** - Lei Geral de Proteção de Dados
- **PDPA** - Personal Data Protection Act
- **CUSTOM** - Custom compliance frameworks

## Integration with Existing Systems

### ComplianceRuleEngine Integration

The testing environment seamlessly integrates with the existing ComplianceRuleEngine:

- Leverages existing rule definitions and evaluation logic
- Tests actual production rule configurations
- Validates rule conflict detection algorithms
- Benchmarks rule evaluation performance

### RuleTestingFramework Integration

Built on top of the comprehensive RuleTestingFramework:

- Uses existing test generation capabilities
- Leverages 10 test suite categories and 25+ validation rules
- Integrates with automated test execution pipeline
- Utilizes existing reporting and metrics collection

### ValidationRulesEngine Integration

Connects with validation systems for comprehensive testing:

- Tests validation rule effectiveness
- Validates security pattern detection
- Benchmarks validation performance
- Tests integration between validation and compliance rules

## Best Practices

### Test Data Management

1. **Use Synthetic Data**: Generate realistic but safe test data
2. **Include Edge Cases**: Test boundary conditions and error scenarios
3. **Vary Data Sizes**: Test with small, medium, and large datasets
4. **Clean Up**: Always teardown test environments after use

### Performance Testing

1. **Baseline First**: Establish performance baselines before optimization
2. **Gradual Load**: Increase load gradually to identify breaking points
3. **Monitor Resources**: Track memory, CPU, and network usage
4. **Document Results**: Maintain performance test history for regression detection

### Continuous Integration

1. **Automated Testing**: Integrate with CI/CD pipelines
2. **Regression Detection**: Run tests on every rule change
3. **Performance Gates**: Fail builds on performance regressions
4. **Report Generation**: Automatically generate and archive test reports

### Security Testing

1. **Test Attack Scenarios**: Include malicious input testing
2. **Validate Security Controls**: Ensure security rules work as expected
3. **Test Bypass Attempts**: Verify rules can't be circumvented
4. **Monitor Security Metrics**: Track security-related test results

## Troubleshooting

### Common Issues

#### Environment Setup Fails

```bash
# Check dependencies
npm list commander ts-node

# Reinstall if missing
npm install commander@^12.0.0 ts-node@^10.9.0

# Check TypeScript compilation
npx tsc --noEmit server/src/services/RuleTestingEnvironment.ts
```

#### Test Execution Timeouts

- Increase `maxExecutionTime` in configuration
- Reduce `maxRuleCount` for complex rules
- Lower `maxConcurrency` if experiencing resource contention

#### Memory Issues

- Use smaller `datasetSize` ('small' instead of 'large')
- Reduce `maxConcurrency` to limit parallel processing
- Increase Node.js memory limit: `node --max-old-space-size=4096`

#### Import/Export Errors

- Ensure proper TypeScript compilation
- Check file permissions for output directories
- Verify all dependencies are installed

### Debug Mode

Enable detailed logging:

```bash
# Enable debug logging
DEBUG=rule-testing:* npm run rule-test run

# Enable verbose output
npm run rule-test run --verbose
```

### Performance Analysis

```bash
# Profile memory usage
node --inspect server/src/cli/rule-testing-cli.ts benchmark

# CPU profiling
node --prof server/src/cli/rule-testing-cli.ts benchmark --rules 1000
```

## Contributing

### Adding New Test Types

1. Extend `RuleTestType` enum in RuleTestingFramework
2. Add test generation logic for new type
3. Update CLI to support new test type option
4. Add documentation and examples

### Adding New Frameworks

1. Add framework to `ComplianceFramework` type
2. Create framework-specific rule definitions
3. Add test scenarios for new framework
4. Update documentation

### Performance Optimizations

1. Profile existing performance bottlenecks
2. Implement optimizations with benchmarks
3. Add regression tests for performance improvements
4. Document performance characteristics

## License

This testing environment is part of the Prompt Spaghetti project and follows the same licensing terms.

## Support

For issues, questions, or contributions:

1. Check existing documentation
2. Run diagnostic commands (`rule-test status`)
3. Review logs and error messages
4. Create detailed issue reports with reproduction steps
