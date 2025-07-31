/**
 * @fileoverview MockContext - Provides mock execution contexts for testing custom nodes
 * Creates realistic test environments without requiring full PromptScape runtime
 */
import seedrandom from 'seedrandom';
/**
 * Creates mock execution contexts for testing custom nodes
 */
export class MockContextFactory {
  /**
   * Create a mock AdvancedExecutionContext for testing
   */
  static create(config = {}) {
    const { seed = 'test-seed', variables = {}, nodeStates = {}, maxDepth = 10, trackPerformance = true } = config;
    const prng = seedrandom(seed);
    const variableMap = new Map(Object.entries(variables));
    const stateMap = new Map(Object.entries(nodeStates));
    return {
      // Basic execution context
      variables: variableMap,
      prng,
      // Advanced context features
      nodeStates: stateMap,
      evaluationDepth: 0,
      cache: new Map(),
      executionMeta: trackPerformance
        ? {
            startTime: Date.now(),
            nodeStats: new Map(),
            errors: [],
            warnings: [],
          }
        : undefined,
      // Helper methods for testing
      setVariable: (name, value) => variableMap.set(name, value),
      getVariable: name => variableMap.get(name),
      hasVariable: name => variableMap.has(name),
      clearVariables: () => variableMap.clear(),
      // State management helpers
      setState: (nodeId, state) => stateMap.set(nodeId, state),
      getState: nodeId => stateMap.get(nodeId),
      clearState: nodeId => {
        if (nodeId) {
          stateMap.delete(nodeId);
        } else {
          stateMap.clear();
        }
      },
      // Cache helpers
      setCache: (key, value) => {
        if (config.trackPerformance) {
          variableMap.get('cache')?.set(key, value);
        }
      },
      getCache: key => {
        if (config.trackPerformance) {
          return variableMap.get('cache')?.get(key);
        }
        return undefined;
      },
      // Execution helpers
      incrementDepth: () => {
        if (variableMap.get('evaluationDepth') >= maxDepth) {
          throw new Error(`Maximum evaluation depth exceeded: ${maxDepth}`);
        }
        variableMap.set('evaluationDepth', (variableMap.get('evaluationDepth') || 0) + 1);
      },
      decrementDepth: () => {
        const current = variableMap.get('evaluationDepth') || 0;
        variableMap.set('evaluationDepth', Math.max(0, current - 1));
      },
    };
  }
  /**
   * Create a minimal context with just the essentials
   */
  static createMinimal(variables = {}) {
    return this.create({
      variables,
      trackPerformance: false,
    });
  }
  /**
   * Create a context for testing stateful nodes
   */
  static createStateful(variables = {}, initialStates = {}) {
    return this.create({
      variables,
      nodeStates: initialStates,
      trackPerformance: true,
    });
  }
  /**
   * Create a context with pre-loaded cache for testing performance scenarios
   */
  static createWithCache(variables = {}, cacheEntries = {}) {
    const context = this.create({ variables, trackPerformance: true });
    // Pre-populate cache
    for (const [key, value] of Object.entries(cacheEntries)) {
      context.cache.set(key, value);
    }
    return context;
  }
}
/**
 * Helper to create deterministic test scenarios
 */
export class TestScenarios {
  /**
   * Create a scenario for testing string processing nodes
   */
  static stringProcessing(input) {
    return MockContextFactory.create({
      variables: {
        input,
        text: input,
        content: input,
      },
      seed: 'string-test',
    });
  }
  /**
   * Create a scenario for testing numeric computation nodes
   */
  static numericComputation(numbers) {
    return MockContextFactory.create({
      variables: {
        numbers,
        values: numbers,
        data: numbers,
        input: numbers[0] || 0,
      },
      seed: 'numeric-test',
    });
  }
  /**
   * Create a scenario for testing conditional logic nodes
   */
  static conditionalLogic(condition, trueValue, falseValue) {
    return MockContextFactory.create({
      variables: {
        condition,
        trueValue,
        falseValue,
        input: condition,
      },
      seed: 'conditional-test',
    });
  }
  /**
   * Create a scenario for testing array processing nodes
   */
  static arrayProcessing(items) {
    return MockContextFactory.create({
      variables: {
        items,
        array: items,
        list: items,
        input: items,
      },
      seed: 'array-test',
    });
  }
  /**
   * Create a scenario for testing object manipulation nodes
   */
  static objectManipulation(object) {
    return MockContextFactory.create({
      variables: {
        object,
        data: object,
        input: object,
      },
      seed: 'object-test',
    });
  }
  /**
   * Create a scenario for testing error handling
   */
  static errorHandling(shouldError = true) {
    return MockContextFactory.create({
      variables: {
        shouldError,
        throwError: shouldError,
        simulateError: shouldError,
      },
      seed: 'error-test',
    });
  }
}
//# sourceMappingURL=MockContext.js.map
