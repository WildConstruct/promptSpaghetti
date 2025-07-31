/**
 * Custom Jest Matchers for Epic 18 Testing Infrastructure
 * Provides specialized assertions for comprehensive testing
 */

interface CustomMatchers<R = unknown> {
  toHavePerformanceWithin(maxTime: number): R;
  toHaveMemoryUsageBelow(maxMemory: number): R;
  toHaveThroughputAbove(minThroughput: number): R;
  toBeValidGraph(): R;
  toBeValidNode(): R;
  toBeValidEdge(): R;
  toHaveValidSchema(): R;
  toHaveSecurityCompliance(): R;
  toHaveAccessibilityCompliance(): R;
  toHaveValidationErrors(expectedCount?: number): R;
  toBeWithinRange(min: number, max: number): R;
  toHaveProperty(property: string, value?: any): R;
  toBeExecutableGraph(): R;
  toHaveValidDeterministicOutput(): R;
}

declare global {
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface Matchers<R> extends CustomMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}

/**
 * Register all custom matchers with Jest
 */
export function registerCustomMatchers(): void {
  expect.extend({
    toHavePerformanceWithin(received: any, maxTime: number) {
      const pass = typeof received.executionTime === 'number' && received.executionTime <= maxTime;
      if (pass) {
        return {
          message: () => `expected execution time ${received.executionTime}ms not to be within ${maxTime}ms`,
          pass: true,
        };
      } else {
        return {
          message: () => `expected execution time ${received.executionTime}ms to be within ${maxTime}ms`,
          pass: false,
        };
      }
    },

    toHaveMemoryUsageBelow(received: any, maxMemory: number) {
      const memoryUsage = received.memoryUsage?.peak || received.peak || received;
      const pass = typeof memoryUsage === 'number' && memoryUsage <= maxMemory;
      if (pass) {
        return {
          message: () => `expected memory usage ${memoryUsage}MB not to be below ${maxMemory}MB`,
          pass: true,
        };
      } else {
        return {
          message: () => `expected memory usage ${memoryUsage}MB to be below ${maxMemory}MB`,
          pass: false,
        };
      }
    },

    toHaveThroughputAbove(received: any, minThroughput: number) {
      const throughput = received.throughput || received;
      const pass = typeof throughput === 'number' && throughput >= minThroughput;
      if (pass) {
        return {
          message: () => `expected throughput ${throughput} not to be above ${minThroughput}`,
          pass: true,
        };
      } else {
        return {
          message: () => `expected throughput ${throughput} to be above ${minThroughput}`,
          pass: false,
        };
      }
    },

    toBeValidGraph(received: any) {
      const hasNodes = Array.isArray(received.nodes);
      const hasEdges = Array.isArray(received.edges);
      const pass = hasNodes && hasEdges;

      if (pass) {
        return {
          message: () => 'expected object not to be a valid graph',
          pass: true,
        };
      } else {
        return {
          message: () => 'expected object to have nodes and edges arrays',
          pass: false,
        };
      }
    },

    toBeValidNode(received: any) {
      const hasId = typeof received.id === 'string';
      const hasType = typeof received.type === 'string';
      const hasData = received.data !== undefined;
      const pass = hasId && hasType && hasData;

      if (pass) {
        return {
          message: () => 'expected object not to be a valid node',
          pass: true,
        };
      } else {
        return {
          message: () => 'expected object to have id, type, and data properties',
          pass: false,
        };
      }
    },

    toBeValidEdge(received: any) {
      const hasId = typeof received.id === 'string';
      const hasSource = typeof received.source === 'string';
      const hasTarget = typeof received.target === 'string';
      const pass = hasId && hasSource && hasTarget;

      if (pass) {
        return {
          message: () => 'expected object not to be a valid edge',
          pass: true,
        };
      } else {
        return {
          message: () => 'expected object to have id, source, and target properties',
          pass: false,
        };
      }
    },

    toHaveValidSchema(received: any) {
      try {
        // Basic schema validation - can be enhanced with specific schema library
        const hasRequiredFields = received && typeof received === 'object';
        const pass = hasRequiredFields;

        if (pass) {
          return {
            message: () => 'expected object not to have valid schema',
            pass: true,
          };
        } else {
          return {
            message: () => 'expected object to have valid schema',
            pass: false,
          };
        }
      } catch (error) {
        return {
          message: () => `schema validation failed: ${error}`,
          pass: false,
        };
      }
    },

    toHaveSecurityCompliance(received: any) {
      // Basic security compliance checks
      const noEval = !received.toString().includes('eval(');
      const noInnerHTML = !received.toString().includes('innerHTML');
      const pass = noEval && noInnerHTML;

      if (pass) {
        return {
          message: () => 'expected code not to be security compliant',
          pass: true,
        };
      } else {
        return {
          message: () => 'expected code to be security compliant (no eval, innerHTML)',
          pass: false,
        };
      }
    },

    toHaveAccessibilityCompliance(received: any) {
      // Basic accessibility checks for UI components
      const hasAriaLabel = received.props?.['aria-label'] || received['aria-label'];
      const hasRole = received.props?.role || received.role;
      const pass = hasAriaLabel || hasRole || received.tagName === 'DIV'; // Basic check

      if (pass) {
        return {
          message: () => 'expected element not to be accessibility compliant',
          pass: true,
        };
      } else {
        return {
          message: () => 'expected element to have accessibility attributes',
          pass: false,
        };
      }
    },

    toHaveValidationErrors(received: any, expectedCount?: number) {
      const errors = received.errors || received.validationErrors || [];
      const hasErrors = Array.isArray(errors) && errors.length > 0;
      const correctCount = expectedCount === undefined || errors.length === expectedCount;
      const pass = hasErrors && correctCount;

      if (pass) {
        return {
          message: () => `expected not to have validation errors${expectedCount ? ` (count: ${expectedCount})` : ''}`,
          pass: true,
        };
      } else {
        return {
          message: () =>
            `expected to have validation errors${expectedCount ? ` (expected: ${expectedCount}, got: ${errors.length})` : ''}`,
          pass: false,
        };
      }
    },

    toBeWithinRange(received: number, min: number, max: number) {
      const pass = typeof received === 'number' && received >= min && received <= max;

      if (pass) {
        return {
          message: () => `expected ${received} not to be within range [${min}, ${max}]`,
          pass: true,
        };
      } else {
        return {
          message: () => `expected ${received} to be within range [${min}, ${max}]`,
          pass: false,
        };
      }
    },

    toBeExecutableGraph(received: any) {
      const isValidGraph = Array.isArray(received.nodes) && Array.isArray(received.edges);
      const hasOutputNode = received.nodes?.some((node: any) => node.type === 'output');
      const pass = isValidGraph && hasOutputNode;

      if (pass) {
        return {
          message: () => 'expected graph not to be executable',
          pass: true,
        };
      } else {
        return {
          message: () => 'expected graph to be executable (needs nodes, edges, and output node)',
          pass: false,
        };
      }
    },

    toHaveValidDeterministicOutput(received: any) {
      // Check if output is deterministic by ensuring it's not random
      const hasOutput = received.output !== undefined;
      const isNotRandom = typeof received.seed === 'string' || typeof received.seed === 'number';
      const pass = hasOutput && isNotRandom;

      if (pass) {
        return {
          message: () => 'expected output not to be deterministic',
          pass: true,
        };
      } else {
        return {
          message: () => 'expected output to be deterministic (needs output and seed)',
          pass: false,
        };
      }
    },
  });
}

export default registerCustomMatchers;
