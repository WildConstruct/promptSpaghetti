# Epic 1 Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for Epic 1's Prompt Spaghetti MVP implementation. Our goal is to achieve >90% test coverage while ensuring all critical paths are thoroughly tested.

## Test Structure

### 1. Unit Tests

Each node type has its own comprehensive test suite:

#### TextBlockNode Tests (`TextBlockNode.test.ts`)
- Basic functionality (creation, configuration)
- Inline editing workflow (start, update, commit, cancel)
- Validation (max length, required fields, variable syntax)
- Character and word counting
- Variable detection
- Serialization/deserialization
- Edge cases (long text, special characters, concurrent edits)

#### WeightedChoiceNode Tests (`WeightedChoiceNode.test.ts`)
- Option management (add, remove, update)
- Weight management (normalize, distribute, percentages)
- Validation (min/max options, zero weights, duplicates)
- Inline editing with validation
- Statistical analysis
- Edge cases (large weights, many options)

#### ConcatNode Tests (`ConcatNode.test.ts`)
- Configuration management (separator, trim settings)
- Preview functionality
- Separator presets
- Input handling (empty, null, mixed types)
- Trimming behavior
- Edge cases (long separators, special characters)

#### VariableNode Tests (`VariableNode.test.ts`)
- Variable name validation and management
- Default value handling (all types)
- Mode configuration (get/set/both)
- Type validation and consistency
- Reserved name detection
- Edge cases (circular references, long names)

#### OutputNode Tests (`OutputNode.test.ts`)
- Input management (various types)
- Statistics calculation (word/line count)
- Format detection (JSON, Markdown, code)
- Preview generation
- Locking behavior
- Edge cases (large outputs, special formats)

### 2. System Tests

#### Validation Tests (`validation.test.ts`)
- Node-level validation for all types
- Graph-level validation (cycles, orphans, structure)
- Error aggregation and reporting
- Value sanitization
- Cross-node validation (duplicate variables)

#### Determinism Tests (`determinism.test.ts`)
- Same seed = same output verification
- Node-specific seed isolation
- Multi-seed execution
- Complex graph determinism
- Weighted choice distribution
- Execution order consistency

### 3. Integration Tests (`integration.test.ts`)

#### Complete Workflows
- Simple greeting workflow
- Weighted choices with concatenation
- Complex variable management
- Variable get/set patterns

#### Edit and Execute
- Node editing before execution
- Validation after editing
- Commit/rollback scenarios

#### PSG Format Integration
- Loading graphs from PSG v2 format
- Configuration preservation
- Round-trip serialization

#### Multi-seed Execution
- Seed variation testing
- Preview generation
- Statistical analysis

#### Error Handling
- Missing variables
- Partial execution
- Invalid configurations

#### Performance Tests
- Large graphs (50+ nodes)
- Deep nesting (20+ levels)
- Execution time benchmarks

## Test Coverage Goals

### Target: >90% Coverage

**Priority Areas (100% coverage required):**
- Node execution logic
- Validation rules
- Serialization/deserialization
- Variable substitution
- Deterministic execution

**High Priority (>95% coverage):**
- Inline editing workflows
- Configuration management
- Error handling paths
- Graph traversal

**Medium Priority (>85% coverage):**
- UI helpers (preview, stats)
- Edge case handling
- Performance optimizations

## Running Tests

### Run All Epic 1 Tests
```bash
npm test packages/core/runtime/nodes/epic1
```

### Run with Coverage
```bash
./packages/core/runtime/nodes/epic1/__tests__/run-tests.sh
```

### Run Specific Test Suite
```bash
npm test TextBlockNode.test.ts
npm test validation.test.ts
npm test integration.test.ts
```

### Watch Mode
```bash
npm test -- --watch packages/core/runtime/nodes/epic1
```

## Test Patterns

### 1. Arrange-Act-Assert
```typescript
it('should validate max length', async () => {
  // Arrange
  const node = new TextBlockNode('test', 'Short', { maxLength: 10 });
  
  // Act
  node.startEdit();
  node.updateEditBuffer('This is too long');
  
  // Assert
  await expect(node.commitEdit()).rejects.toThrow('Validation failed');
  expect(node.getValidationErrors()).toContain('Text exceeds maximum length');
});
```

### 2. Data-Driven Tests
```typescript
const validNames = ['simple', 'withNumbers123', 'with_underscores'];
validNames.forEach(name => {
  it(`should accept valid variable name: ${name}`, () => {
    const node = new VariableNode('test', { name });
    expect(node.getCurrentValue().name).toBe(name);
  });
});
```

### 3. Edge Case Testing
```typescript
describe('Edge cases', () => {
  it('should handle very large weights', () => {
    const node = new WeightedChoiceNode('test', [
      { id: '1', text: 'A', weight: 999999 },
      { id: '2', text: 'B', weight: 1 }
    ]);
    // Test behavior with extreme values
  });
});
```

## Mocking Strategy

### When to Mock
- External dependencies (file system, network)
- Time-based operations
- Random number generation (for non-determinism tests)

### When NOT to Mock
- Node interactions
- Validation logic
- Execution engine
- Core business logic

## Test Maintenance

### Adding New Features
1. Write tests first (TDD approach)
2. Ensure existing tests still pass
3. Update integration tests
4. Check coverage doesn't decrease

### Fixing Bugs
1. Write a failing test that reproduces the bug
2. Fix the implementation
3. Ensure test passes
4. Add edge case tests

### Refactoring
1. Ensure full test coverage before refactoring
2. Run tests continuously during refactoring
3. Update tests if API changes
4. Maintain or improve coverage

## CI/CD Integration

### Pre-commit Hooks
- Run unit tests for changed files
- Check coverage thresholds

### Pull Request Checks
- Full test suite execution
- Coverage report generation
- Performance regression tests

### Main Branch Protection
- All tests must pass
- Coverage must meet thresholds
- No decrease in coverage allowed

## Performance Testing

### Benchmarks
- Node execution time
- Graph traversal efficiency
- Memory usage patterns
- Large graph handling

### Monitoring
- Track test execution time
- Identify slow tests
- Optimize test performance

## Documentation

### Test Documentation
- Each test file has a header comment
- Complex tests have inline explanations
- Integration tests document workflows

### Coverage Reports
- HTML reports for detailed analysis
- LCOV for CI integration
- Text summaries for console

## Best Practices

1. **Keep tests focused** - One concept per test
2. **Use descriptive names** - Test names should explain what and why
3. **Avoid test interdependence** - Each test should be isolated
4. **Clean up after tests** - Reset state, clear mocks
5. **Test the public API** - Don't test implementation details
6. **Use meaningful assertions** - Be specific about expectations
7. **Handle async properly** - Use async/await consistently

## Troubleshooting

### Common Issues

**Tests timing out**
- Check for unresolved promises
- Verify async operations complete
- Look for infinite loops

**Flaky tests**
- Remove time dependencies
- Fix race conditions
- Ensure proper cleanup

**Coverage gaps**
- Check for untested error paths
- Add edge case tests
- Test all configuration options

### Debug Commands
```bash
# Run single test with debugging
node --inspect-brk ./node_modules/.bin/jest TextBlockNode.test.ts

# Run with verbose output
npm test -- --verbose

# Run specific test by name
npm test -- -t "should handle weighted choices"
```

## Future Improvements

1. **Visual regression tests** - For UI components
2. **Property-based testing** - For complex validations
3. **Mutation testing** - To verify test quality
4. **Performance benchmarks** - Track execution speed
5. **Integration with monitoring** - Real-world usage patterns