# Regression Testing Suite

This directory contains regression tests to ensure critical functionality remains stable across code changes.

## Overview

Regression tests focus on:
1. **Golden File Tests** - Deterministic output validation
2. **Performance Benchmarks** - Performance regression detection  
3. **API Contract Tests** - External API stability
4. **Database Migration Tests** - Data integrity across schema changes
5. **Security Boundary Tests** - Security feature preservation

## Test Categories

### 1. Core Engine Regression (`core-engine/`)
- Graph execution deterministic output
- Advanced node algorithm correctness
- Memory usage and performance benchmarks
- Security boundary validation

### 2. API Stability (`api-stability/`)
- Preview endpoint contract compliance
- Export/import round-trip integrity
- Error response format consistency
- Authentication and authorization

### 3. Database Integrity (`database-integrity/`)
- Schema migration compatibility
- Data persistence across versions
- Query performance benchmarks
- Transaction consistency

### 4. Performance Benchmarks (`performance/`)
- Graph execution speed thresholds
- Memory usage limits
- Concurrent user scenarios
- Frontend rendering performance

### 5. Security Regression (`security/`)
- Expression evaluation sandboxing
- Prototype pollution prevention
- Authentication bypass attempts
- Data sanitization effectiveness

## Running Regression Tests

```bash
# Run all regression tests
npm run test:regression

# Run specific category
npm run test:regression:core-engine
npm run test:regression:api-stability
npm run test:regression:performance

# Generate new golden files (when expected behavior changes)
npm run test:regression:generate-golden

# Performance benchmarking
npm run test:regression:benchmark
```

## Adding New Regression Tests

1. **Identify Critical Path**: Focus on business-critical functionality
2. **Create Baseline**: Establish expected behavior with current code
3. **Add Assertions**: Test both positive and negative cases
4. **Set Thresholds**: Define acceptable performance boundaries
5. **Document Purpose**: Explain what regression is being prevented

## CI/CD Integration

Regression tests run automatically on:
- Pull requests to main branch
- Pre-release builds
- Nightly performance benchmarks
- Security vulnerability scans

## Performance Thresholds

Current acceptable limits:
- Graph execution (100 nodes): < 100ms
- Memory usage (1000 nodes): < 50MB  
- API response time: < 1s
- Database query time: < 100ms
- Frontend render time: < 500ms

## Updating Baselines

When legitimate changes require updating expected outputs:

```bash
# Review changes carefully
npm run test:regression:review-changes

# Update specific golden files  
npm run test:regression:update-golden -- --test-pattern="specific-test"

# Update performance baselines
npm run test:regression:update-benchmarks
```

⚠️ **Important**: Always review baseline changes to ensure they represent legitimate improvements, not regressions.