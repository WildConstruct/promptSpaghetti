# CLI Testing Strategy

This document outlines the testing approach for the BMad-Method CLI tools.

## Testing Philosophy

The CLI tests have been refactored to follow these key principles:

1. **Direct module testing** - Tests call exported functions directly rather than spawning child processes
2. **File system mocking** - Tests use mock file system operations to avoid dependencies on real files
3. **Environment awareness** - Code detects test environments and adjusts behavior accordingly
4. **Console output capture** - Tests verify both output values and displayed messages

## Test Organization

The tests are organized into logical groups:

1. **CLI main function tests** - Verify core functionality with different arguments
2. **Engine-wrapper direct tests** - Test the underlying execution logic
3. **Command handling tests** - Verify CLI command parsing and validation

## Mocking Strategy

The tests use Jest mocks to simulate:

- File system operations (`fs.existsSync`, `fs.readFileSync`)
- Console output (`console.log`, `console.error`)
- Process behavior (`process.exit` prevention in test mode)

## Key Test Cases

1. **Happy path** - Verify successful execution with various arguments
2. **Error handling** - Test graceful handling of missing files and invalid input
3. **Command parsing** - Test CLI argument parsing and command validation
4. **Option handling** - Test short and long-form CLI options

## Future Improvements

1. **Integration tests** - Add tests that verify CLI integration with other framework components
2. **Performance tests** - Add tests for execution speed and resource usage
3. **Cross-platform tests** - Ensure CLI works consistently across operating systems

## Running the Tests

```bash
# Run all CLI tests
npm test -- --testPathPattern=packages/cli/__tests__/cli.test.ts

# Run specific test case
npm test -- --testPathPattern=packages/cli/__tests__/cli.test.ts -t "executes graph deterministically"
```
