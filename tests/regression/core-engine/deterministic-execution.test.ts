/**
 * Core Engine Regression Tests - Deterministic Execution
 * 
 * These tests ensure that graph execution remains deterministic across code changes.
 * Uses golden file approach to validate exact output matches.
 * 
 * CRITICAL: Any test failure indicates a breaking change to core functionality.
 */

import { executeGraph } from '../../../server/src/engine';
import { Graph } from '../../../packages/core/graphSchema';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const GOLDEN_FILES_DIR = join(__dirname, 'golden-files');

interface GoldenTestCase {
  name: string;
  graph: Graph;
  expectedSeeds: number[];
  description: string;
}

// Core regression test cases
const GOLDEN_TEST_CASES: GoldenTestCase[] = [
  {
    name: 'simple-weighted-choice',
    description: 'Basic weighted choice with deterministic seed',
    graph: {
      id: 'test-graph-1',
      seed: 12345,
      nodes: [
        {
          id: 'choice1',
          type: 'WeightedChoice',
          choices: [
            { text: 'Option A', weight: 3 },
            { text: 'Option B', weight: 2 },
            { text: 'Option C', weight: 1 }
          ]
        },
        {
          id: 'output1',
          type: 'Output',
          inputs: ['choice1']
        }
      ],
      edges: [
        { id: 'e1', source: 'choice1', target: 'output1' }
      ]
    },
    expectedSeeds: [12345, 67890, 11111, 99999]
  },

  {
    name: 'complex-branching-graph',
    description: 'Complex graph with multiple paths and concatenation',
    graph: {
      id: 'test-graph-2',
      seed: 54321,
      nodes: [
        {
          id: 'var1',
          type: 'SetVariable',
          key: 'subject',
          value: 'regression testing'
        },
        {
          id: 'choice1',
          type: 'WeightedChoice',
          choices: [
            { text: 'Testing is', weight: 1 },
            { text: 'Quality assurance is', weight: 1 }
          ]
        },
        {
          id: 'choice2',
          type: 'WeightedChoice',
          choices: [
            { text: 'essential', weight: 2 },
            { text: 'critical', weight: 1 },
            { text: 'important', weight: 1 }
          ]
        },
        {
          id: 'getVar1',
          type: 'GetVariable',
          key: 'subject',
          inputs: ['var1']
        },
        {
          id: 'concat1',
          type: 'Concat',
          inputs: ['choice1', 'choice2', 'getVar1']
        },
        {
          id: 'output1',
          type: 'Output',
          inputs: ['concat1']
        }
      ],
      edges: [
        { id: 'e1', source: 'var1', target: 'getVar1' },
        { id: 'e2', source: 'choice1', target: 'concat1' },
        { id: 'e3', source: 'choice2', target: 'concat1' },
        { id: 'e4', source: 'getVar1', target: 'concat1' },
        { id: 'e5', source: 'concat1', target: 'output1' }
      ]
    },
    expectedSeeds: [54321, 98765, 13579, 24680]
  },

  {
    name: 'advanced-nodes-regression',
    description: 'Advanced nodes (Epic 7) with complex configurations',
    graph: {
      id: 'test-graph-3', 
      seed: 42,
      nodes: [
        {
          id: 'weightedAdv1',
          type: 'WeightedAdvanced',
          choices: [
            { text: 'Alpha', weight: 10 },
            { text: 'Beta', weight: 5 },
            { text: 'Gamma', weight: 2 }
          ],
          distributionConfig: {
            type: 'exponential',
            normalize: true,
            temperature: 1.0
          }
        },
        {
          id: 'conditional1',
          type: 'Conditional',
          branches: [
            { condition: 'true', output: 'Condition met' },
            { condition: 'false', output: 'Condition not met' }
          ],
          defaultOutput: 'Default output',
          conditionalConfig: {
            allowUnknownFunctions: false,
            maxExpressionLength: 100
          }
        },
        {
          id: 'sequential1',
          type: 'Sequential',
          sequence: ['First', 'Second', 'Third', 'Fourth'],
          pattern: {
            type: 'cyclical',
            config: { cycleLength: 3 }
          }
        },
        {
          id: 'markov1',
          type: 'Markov',
          states: ['start', 'middle', 'end'],
          transitions: {
            start: { middle: 0.7, end: 0.3 },
            middle: { middle: 0.4, end: 0.6 },
            end: { start: 1.0 }
          },
          initialState: 'start',
          markovConfig: {
            maxSteps: 5,
            terminationConditions: ['end']
          }
        },
        {
          id: 'output1',
          type: 'Output',
          inputs: ['weightedAdv1']
        },
        {
          id: 'output2', 
          type: 'Output',
          inputs: ['conditional1']
        },
        {
          id: 'output3',
          type: 'Output', 
          inputs: ['sequential1']
        },
        {
          id: 'output4',
          type: 'Output',
          inputs: ['markov1']
        }
      ],
      edges: [
        { id: 'e1', source: 'weightedAdv1', target: 'output1' },
        { id: 'e2', source: 'conditional1', target: 'output2' },
        { id: 'e3', source: 'sequential1', target: 'output3' },
        { id: 'e4', source: 'markov1', target: 'output4' }
      ]
    },
    expectedSeeds: [42, 123, 456, 789]
  }
];

/**
 * Load or create golden file for a test case
 */
function getGoldenFile(testName: string, seed: number): string {
  const filename = `${testName}_seed_${seed}.golden`;
  const filepath = join(GOLDEN_FILES_DIR, filename);
  
  if (!existsSync(filepath)) {
    throw new Error(
      `Golden file ${filepath} does not exist. ` +
      'Run \'npm run test:regression:generate-golden\' to create baseline files.'
    );
  }
  
  return readFileSync(filepath, 'utf-8').trim();
}

/**
 * Save golden file (for baseline generation)
 */
function saveGoldenFile(testName: string, seed: number, output: string): void {
  const filename = `${testName}_seed_${seed}.golden`;
  const filepath = join(GOLDEN_FILES_DIR, filename);
  writeFileSync(filepath, output + '\n');
}

/**
 * Generate golden files for all test cases
 * Call this when establishing new baselines
 */
export async function generateGoldenFiles(): Promise<void> {
  console.log('Generating golden files for regression tests...');
  
  for (const testCase of GOLDEN_TEST_CASES) {
    console.log(`Generating golden files for: ${testCase.name}`);
    
    for (const seed of testCase.expectedSeeds) {
      const graphWithSeed = { ...testCase.graph, seed };
      
      try {
        const outputs = await executeGraph(graphWithSeed);
        const output = outputs.join('\n');
        saveGoldenFile(testCase.name, seed, output);
        console.log(`  ✓ Saved golden file for seed ${seed}`);
      } catch (error) {
        console.error(`  ✗ Failed to generate golden file for seed ${seed}:`, error);
        throw error;
      }
    }
  }
  
  console.log('Golden file generation complete!');
}

describe('Core Engine Regression - Deterministic Execution', () => {
  
  describe('Golden File Tests', () => {
    for (const testCase of GOLDEN_TEST_CASES) {
      describe(`${testCase.name}: ${testCase.description}`, () => {
        
        for (const seed of testCase.expectedSeeds) {
          it(`should produce identical output for seed ${seed}`, async () => {
            const graphWithSeed = { ...testCase.graph, seed };
            
            // Execute graph
            const outputs = await executeGraph(graphWithSeed);
            const actualOutput = outputs.join('\n');
            
            // Compare with golden file
            const expectedOutput = getGoldenFile(testCase.name, seed);
            
            expect(actualOutput).toBe(expectedOutput);
          }, 10000); // 10 second timeout for complex graphs
        }
        
        it('should produce different outputs for different seeds', async () => {
          const outputs = new Set<string>();
          
          for (const seed of testCase.expectedSeeds.slice(0, 3)) {
            const graphWithSeed = { ...testCase.graph, seed };
            const result = await executeGraph(graphWithSeed);
            outputs.add(result.join('\n'));
          }
          
          // Should have unique outputs for different seeds
          expect(outputs.size).toBeGreaterThan(1);
        });
        
      });
    }
  });
  
  describe('Performance Regression', () => {
    it('should execute simple graphs within performance threshold', async () => {
      const testCase = GOLDEN_TEST_CASES[0]; // Simple weighted choice
      const startTime = performance.now();
      
      await executeGraph(testCase.graph);
      
      const executionTime = performance.now() - startTime;
      expect(executionTime).toBeLessThan(100); // 100ms threshold
    });
    
    it('should execute complex graphs within performance threshold', async () => {
      const testCase = GOLDEN_TEST_CASES[1]; // Complex branching graph
      const startTime = performance.now();
      
      await executeGraph(testCase.graph);
      
      const executionTime = performance.now() - startTime;
      expect(executionTime).toBeLessThan(500); // 500ms threshold for complex graphs
    });
    
    it('should execute advanced nodes within performance threshold', async () => {
      const testCase = GOLDEN_TEST_CASES[2]; // Advanced nodes
      const startTime = performance.now();
      
      await executeGraph(testCase.graph);
      
      const executionTime = performance.now() - startTime;
      expect(executionTime).toBeLessThan(1000); // 1s threshold for advanced nodes
    });
  });
  
  describe('Error Handling Regression', () => {
    it('should handle malformed graphs consistently', async () => {
      const malformedGraph = {
        id: 'malformed',
        seed: 12345,
        nodes: [
          {
            id: 'output1',
            type: 'Output',
            inputs: ['nonexistent'] // References non-existent node
          }
        ],
        edges: []
      };
      
      await expect(executeGraph(malformedGraph)).rejects.toThrow('Node nonexistent not found');
    });
    
    it('should handle invalid node types consistently', async () => {
      const invalidGraph = {
        id: 'invalid',
        seed: 12345,
        nodes: [
          {
            id: 'invalid1',
            type: 'InvalidType' as any,
            inputs: []
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['invalid1']
          }
        ],
        edges: [
          { id: 'e1', source: 'invalid1', target: 'output1' }
        ]
      };
      
      await expect(executeGraph(invalidGraph)).rejects.toThrow('Unsupported node type InvalidType');
    });
  });
  
  describe('Memory Usage Regression', () => {
    it('should not leak memory during execution', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Execute multiple graphs
      for (let i = 0; i < 10; i++) {
        await executeGraph(GOLDEN_TEST_CASES[0].graph);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;
      
      // Should not grow by more than 10MB
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024);
    });
  });
  
});

// Export for golden file generation script
export { generateGoldenFiles, GOLDEN_TEST_CASES };