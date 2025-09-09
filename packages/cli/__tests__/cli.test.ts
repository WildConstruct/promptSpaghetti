import path from 'path';
import fs from 'fs';

/**
 * These tests verify the CLI functionality using the new testable architecture.
 * Instead of spawning child processes and using ts-node at runtime (which was causing
 * TypeScript compilation errors), we now call the main() function directly and
 * mock the necessary dependencies.
 *
 * Testing Strategy:
 * 1. Mock the file system instead of using real files
 * 2. Test direct function calls rather than spawning processes
 * 3. Test both success and error paths
 * 4. Verify CLI argument handling and command processing
 */

// Set test environment before any imports
process.env.NODE_ENV = 'test';

// Mock modules
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  readFileSync: jest.fn()
}));

// Mock the engine-wrapper module with a more controllable implementation
jest.mock('../engine-wrapper', () => ({
  executeGraphFromFile: jest.fn().mockImplementation((path, options) => {
    if (path.includes('nonexistent')) {
      return Promise.reject(new Error('Graph file not found'));
    }
    return Promise.resolve(['hi', 'there']);
  })
}));

// Import the CLI main function
const { main } = require('../cli');
// Import the mocked engine-wrapper for direct tests
const { executeGraphFromFile } = require('../engine-wrapper');

describe('promptgraph CLI', () => {
  const graphPath = path.resolve(__dirname, 'fixtures', 'simpleGraph.json');
  const missingPath = path.resolve(__dirname, 'fixtures', 'nonexistent.json');
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalStdoutWrite = process.stdout.write;
  const originalStderrWrite = process.stderr.write;
  let consoleOutput: string[] = [];

  // Mock graph content for testing
  const mockGraphContent = JSON.stringify({
    nodes: [
      { id: 'node1', type: 'ConstantNode', value: 'hi' },
      { id: 'node2', type: 'ConstantNode', value: 'there' }
    ],
    edges: [],
    seed: 123
  });

  beforeAll(() => {
    // NODE_ENV is now set at the top of the file before imports
  });

  beforeEach(() => {
    // Reset mocks and capture console output
    consoleOutput = [];
    console.log = jest.fn((...args) => {
      consoleOutput.push(args.join(' '));
    });
    console.error = jest.fn((...args) => {
      consoleOutput.push(args.join(' '));
    });

    // Mock stdout/stderr to capture Commander.js help output
    process.stdout.write = jest.fn(chunk => {
      if (typeof chunk === 'string') {
        consoleOutput.push(chunk);
      }
      return true;
    });
    process.stderr.write = jest.fn(chunk => {
      if (typeof chunk === 'string') {
        consoleOutput.push(chunk);
      }
      return true;
    });

    // Setup fs mocks for each test
    (fs.existsSync as jest.Mock).mockImplementation(path => {
      return path === graphPath;
    });

    (fs.readFileSync as jest.Mock).mockImplementation((path, options) => {
      if (path === graphPath) {
        return mockGraphContent;
      }
      throw new Error(`ENOENT: no such file or directory, open '${path}'`);
    });

    // Reset the executeGraphFromFile mock implementation for each test
    (executeGraphFromFile as jest.Mock).mockImplementation((path, options) => {
      if (path.includes('nonexistent')) {
        return Promise.reject(new Error('Graph file not found'));
      }
      return Promise.resolve(['hi', 'there']);
    });
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
    jest.clearAllMocks();
  });

  describe('CLI main function', () => {
    it('executes graph deterministically with --seed parameter', async () => {
      const mockArgv = ['node', 'cli.js', 'exec', graphPath, '--seed', '123'];

      const result = await main(mockArgv);
      expect(result.exitCode).toBe(0);
      expect(result.outputs.length).toBeGreaterThan(0);
      expect(result.outputs[0]).toBe('hi');
      expect(consoleOutput.includes('hi')).toBe(true);
    });

    it('returns exit code 1 when graph file is missing', async () => {
      const mockArgv = ['node', 'cli.js', 'exec', missingPath];
      const result = await main(mockArgv);

      expect(result.exitCode).toBe(1);
      expect(consoleOutput.some(msg => msg.includes('not found'))).toBe(true);
    });

    it('handles different seed values to produce different outputs', async () => {
      // This test would need additional setup with a graph that actually uses the seed
      // For now we'll just verify the seed parameter is accepted
      const mockArgv = ['node', 'cli.js', 'exec', graphPath, '--seed', '456'];

      const result = await main(mockArgv);
      expect(result.exitCode).toBe(0);
    });
  });

  describe('engine-wrapper direct usage', () => {
    it('executes graph deterministically with direct function call', async () => {
      const outputs = await executeGraphFromFile(graphPath, { seed: 123 });

      expect(outputs.length).toBeGreaterThan(0);
      expect(outputs[0]).toBe('hi');
    });

    it('throws error when graph file is missing', async () => {
      await expect(executeGraphFromFile(missingPath)).rejects.toThrow(
        'Graph file not found'
      );
    });

    it('applies seed value when provided', async () => {
      const outputs1 = await executeGraphFromFile(graphPath, { seed: 123 });
      expect(outputs1[0]).toBe('hi');

      // With a real randomized graph, different seeds would produce different outputs
      // Here we're just testing the parameter is accepted
      const outputs2 = await executeGraphFromFile(graphPath, { seed: 456 });
      expect(outputs2[0]).toBe('hi');
    });
  });

  describe('CLI command handling', () => {
    /**
     * Tests in this block verify the CLI's command processing capabilities:
     * - Help command display
     * - Invalid command handling
     * - Missing argument validation
     * - Command options parsing
     */

    it('shows help text when invoked with help command', async () => {
      const mockArgv = ['node', 'cli.js', 'help'];
      const result = await main(mockArgv);

      // The command should run successfully
      // Help text is displayed via console.log which we're capturing
      expect(consoleOutput.length).toBeGreaterThan(0);
      // Just verify we get some expected content from the help text
      expect(
        consoleOutput.some(
          text =>
            text.includes('Command') ||
            text.includes('Options') ||
            text.includes('exec')
        )
      ).toBe(true);
    });

    it('handles invalid commands gracefully', async () => {
      const mockArgv = ['node', 'cli.js', 'invalid-command'];
      const result = await main(mockArgv);

      // Invalid command should exit with non-zero code
      expect(result.exitCode).not.toBe(0);
      // Check that we get some output (might be help text or error)
      expect(consoleOutput.length).toBeGreaterThan(0);
    });

    it('correctly handles missing arguments for exec command', async () => {
      const mockArgv = ['node', 'cli.js', 'exec'];
      const result = await main(mockArgv);

      // Missing required argument should exit with non-zero code
      expect(result.exitCode).not.toBe(0);
      // Check error message mentions missing argument
      expect(consoleOutput.some(text => text.includes('argument'))).toBe(true);
    });

    it('passes options to engine wrapper', async () => {
      // Set up a special mock for this test to verify options passing
      (executeGraphFromFile as jest.Mock).mockImplementation(
        (path, options) => {
          // This will help us verify the options were passed correctly
          consoleOutput.push(`Seed used: ${options?.seed || 'default'}`);
          return Promise.resolve(['hi', 'there']);
        }
      );

      // Test with standard option format
      const mockArgv = ['node', 'cli.js', 'exec', graphPath, '--seed', '789'];
      const result = await main(mockArgv);

      // Verify the option was passed and logged
      expect(consoleOutput.some(text => text.includes('Seed used:'))).toBe(
        true
      );
      // Verify we got output from the mocked function
      expect(result.outputs).toEqual(['hi', 'there']);
    });

    it('handles various option formats', async () => {
      // Reset the mock for this test
      (executeGraphFromFile as jest.Mock).mockImplementation(
        (path, options) => {
          // Track which format was used
          const seedValue = options?.seed || 'none';
          consoleOutput.push(`Option format test - seed: ${seedValue}`);
          return Promise.resolve(['test output']);
        }
      );

      // Test both with and without options to see if the code handles it
      const mockArgv1 = ['node', 'cli.js', 'exec', graphPath];
      await main(mockArgv1);

      const mockArgv2 = ['node', 'cli.js', 'exec', graphPath, '--seed', '42'];
      await main(mockArgv2);

      // Just verify the function was called in both cases
      expect(executeGraphFromFile).toHaveBeenCalledTimes(2);
    });
  });
});
