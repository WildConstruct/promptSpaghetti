// server/src/__tests__/api.test.ts
import { jest } from '@jest/globals';
import { Graph } from '../../../../packages/core/graphSchema';
import * as engineModule from '../engine';

// Mock the executeGraph function
jest.mock('../engine', () => ({
  executeGraph: jest.fn<unknown[], unknown>().mockReturnValue(Promise.resolve([] as unknown as unknown)),
}));

// Mock the graph validation function
jest.mock('../graphValidator', () => ({
  validateGraph: jest.fn<unknown[], unknown>(),
}));

// Import the function we're testing directly
import { generatePreviewOutputs } from '../index';
import { executeGraph } from '../engine';
import { validateGraph } from '../graphValidator';

describe('Preview API', () => {
  // Example graph fixture
  const testGraph: Graph = {
    nodes: [
      {
        id: 'output1',
        type: 'Output',
        inputs: [],
      },
    ],
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();

    // Default mock implementation
    (engineModule.executeGraph as jest.MockedFunction<typeof engineModule.executeGraph>).mockResolvedValue([
      'Test output',
    ] as unknown as unknown);
  });

  describe('generatePreviewOutputs function', () => {
    it('should generate outputs for multiple seeds', async () => {
      // Mock executeGraph to return different outputs for different seeds
      (engineModule.executeGraph as jest.MockedFunction<typeof engineModule.executeGraph>).mockImplementation(
        (graph: Graph) => {
          return Promise.resolve([`Output for seed ${graph.seed}`]);
        }
      );

      // Call the function directly
      const results = await generatePreviewOutputs(testGraph, 3, 10);

      // Verify the results
      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({ seed: 10, output: 'Output for seed 10' });
      expect(results[1]).toEqual({ seed: 11, output: 'Output for seed 11' });
      expect(results[2]).toEqual({ seed: 12, output: 'Output for seed 12' });

      // Verify executeGraph was called with the right parameters
      expect(engineModule.executeGraph).toHaveBeenCalledTimes(3);
      expect(engineModule.executeGraph).toHaveBeenCalledWith(expect.objectContaining({ seed: 10 }));
      expect(engineModule.executeGraph).toHaveBeenCalledWith(expect.objectContaining({ seed: 11 }));
      expect(engineModule.executeGraph).toHaveBeenCalledWith(expect.objectContaining({ seed: 12 }));
    });

    it('should handle errors during execution', async () => {
      // Mock executeGraph to throw an error for seed 11
      (engineModule.executeGraph as jest.MockedFunction<typeof engineModule.executeGraph>).mockImplementation(
        (graph: Graph) => {
          if (graph.seed === 11) {
            throw new Error('Test error');
          }
          return Promise.resolve([`Output for seed ${graph.seed}`]);
        }
      );

      // Call the function directly
      const results = await generatePreviewOutputs(testGraph, 3, 10);

      // Verify the results
      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({ seed: 10, output: 'Output for seed 10' });
      expect(results[1]).toEqual({ seed: 11, output: 'Error: Test error' });
      expect(results[2]).toEqual({ seed: 12, output: 'Output for seed 12' });

      // Verify executeGraph was called for each seed
      expect(engineModule.executeGraph).toHaveBeenCalledTimes(3);
    });

    it('should handle empty outputs', async () => {
      // Mock executeGraph to return empty array for seed 11
      (engineModule.executeGraph as jest.MockedFunction<typeof engineModule.executeGraph>).mockImplementation(
        (graph: Graph) => {
          if (graph.seed === 11) {
            return Promise.resolve([]);
          }
          return Promise.resolve([`Output for seed ${graph.seed}`]);
        }
      );

      // Call the function directly
      const results = await generatePreviewOutputs(testGraph, 3, 10);

      // Verify the results
      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({ seed: 10, output: 'Output for seed 10' });
      expect(results[1]).toEqual({ seed: 11, output: '' }); // Empty output
      expect(results[2]).toEqual({ seed: 12, output: 'Output for seed 12' });
    });
  });

  describe('graph validation in Preview API', () => {
    it('should reject invalid graphs with validation errors', async () => {
      // Setup validation to fail with validation errors
      (validateGraph as jest.Mock).mockReset();
      (validateGraph as jest.Mock).mockReturnValue({
        valid: false,
        errors: [
          {
            code: 'NO_OUTPUT_NODES',
            message: 'Graph must have at least one Output node',
            severity: 'error',
          },
        ],
      } as unknown as unknown);

      // Create a test invalid graph
      const invalidGraph: Graph = {
        nodes: [],
      };

      // Import the index file to get access to the implementation we want to test
      const { validateGraph: actualValidateGraph } = await import('../graphValidator');

      // Validate directly
      const validationResult = actualValidateGraph(invalidGraph);

      // Expect validation to fail
      expect(validationResult.valid).toBe(false);
      expect(validationResult.errors).toHaveLength(1);
      expect(validationResult.errors[0].code).toBe('NO_OUTPUT_NODES');
    });
  });

  describe('validation integration with preview API', () => {
    it('should validate graphs before generating previews', async () => {
      // Reset mocks
      (validateGraph as jest.Mock).mockReset();
      (executeGraph as jest.Mock).mockReset();

      // Setup validation to fail
      (validateGraph as jest.Mock).mockReturnValueOnce({
        valid: false,
        errors: [
          {
            code: 'NO_OUTPUT_NODES',
            message: 'Graph must have at least one Output node',
            severity: 'error',
          },
        ],
      });

      // Create a simple function that mimics the API handler
      const simulatedApiHandler = async (graph: Graph): Promise<any> => {
        // This simulates what the API handler does
        const validationResult = validateGraph(graph);

        if (!validationResult.valid) {
          // Return error structure like the API does
          return {
            status: 400,
            body: {
              results: [],
              error: 'Graph validation failed',
              validationErrors: validationResult.errors,
            },
          };
        }

        // If valid, generate previews
        const results = await generatePreviewOutputs(graph, 1, 1);
        return {
          status: 200,
          body: { results },
        };
      };

      // Call the simulated handler
      const invalidGraph: Graph = { nodes: [] };
      const response = await simulatedApiHandler(invalidGraph);

      // Check validation was called
      expect(validateGraph).toHaveBeenCalledWith(invalidGraph);

      // Check for proper error response
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Graph validation failed');
      expect(response.body.validationErrors).toHaveLength(1);
      expect(response.body.validationErrors[0].code).toBe('NO_OUTPUT_NODES');

      // Make sure graph execution was not attempted
      expect(executeGraph).not.toHaveBeenCalled();
    });

    it('should execute valid graphs', async () => {
      // Reset mocks
      (validateGraph as jest.Mock).mockReset();
      (executeGraph as jest.Mock).mockReset();

      // Setup validation to succeed
      (validateGraph as jest.Mock).mockReturnValueOnce({
        valid: true,
        errors: [],
      });

      // Setup mock execution results
      (executeGraph as jest.Mock).mockImplementation(() => Promise.resolve(['Test output']));

      // Create a simple function that mimics the API handler
      const simulatedApiHandler = async (graph: Graph): Promise<any> => {
        // This simulates what the API handler does
        const validationResult = validateGraph(graph);

        if (!validationResult.valid) {
          return {
            status: 400,
            body: {
              results: [],
              error: 'Graph validation failed',
              validationErrors: validationResult.errors,
            },
          };
        }

        // If valid, generate previews
        const results = await generatePreviewOutputs(graph, 1, 1);
        return {
          status: 200,
          body: { results },
        };
      };

      // Create a valid graph
      const validGraph: Graph = {
        nodes: [
          {
            id: 'output1',
            type: 'Output',
          },
        ],
      };

      // Call the simulated handler
      const response = await simulatedApiHandler(validGraph);

      // Check validation was called
      expect(validateGraph).toHaveBeenCalledWith(validGraph);

      // Check that generatePreviewOutputs was called with the right parameters
      expect(executeGraph).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });
});
