/**
 * Refactoring Test Utilities for Epic 18
 * Specialized utilities for testing code refactoring and migration
 */

/**
 * Migration Test Helper
 * Utilities for testing migration paths and backward compatibility
 */
export class MigrationTestHelper {
  private static migrationResults: Map<string, MigrationResult> = new Map();

  /**
   * Test a migration step
   */
  static async testMigrationStep(
    step: MigrationStep,
    beforeState: unknown,
    expectedAfterState?: unknown
  ): Promise<MigrationStepResult> {
    const startTime = performance.now(); // Use high-resolution timing
    let error: Error | null = null;
    let actualAfterState: unknown = null;
    let rollbackSuccessful = false;

    try {
      // Execute migration step
      actualAfterState = await step.execute(beforeState);

      // Validate result if expected state provided
      if (expectedAfterState) {
        const isValid = this.deepCompare(actualAfterState, expectedAfterState);
        if (!isValid) {
          throw new Error('Migration result does not match expected state');
        }
      }

      // Test rollback if available
      if (step.rollback) {
        const rolledBackState = await step.rollback(actualAfterState);
        rollbackSuccessful = this.deepCompare(rolledBackState, beforeState);
      }
    } catch (err) {
      error = err as Error;
    }

    const executionTime = performance.now() - startTime;

    const result: MigrationStepResult = {
      stepId: step.id,
      stepName: step.name,
      success: error === null,
      error,
      beforeState,
      afterState: actualAfterState,
      rollbackSuccessful,
      executionTime: executionTime > 0 ? executionTime : 0.1, // Ensure positive value
      timestamp: new Date().toISOString()
    };

    return result;
  }

  /**
   * Test complete migration path
   */
  static async testMigrationPath(
    migrationId: string,
    steps: MigrationStep[],
    initialState: unknown
  ): Promise<MigrationResult> {
    const startTime = Date.now();
    const stepResults: MigrationStepResult[] = [];
    let currentState = initialState;
    let overallSuccess = true;
    let failedAtStep: number | null = null;

    // Execute each step
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepResult = await this.testMigrationStep(step, currentState);

      stepResults.push(stepResult);

      if (!stepResult.success) {
        overallSuccess = false;
        failedAtStep = i;
        break;
      }

      currentState = stepResult.afterState;
    }

    const result: MigrationResult = {
      migrationId,
      success: overallSuccess,
      failedAtStep,
      initialState,
      finalState: currentState,
      stepResults,
      totalSteps: steps.length,
      completedSteps: stepResults.filter(r => r.success).length,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

    this.migrationResults.set(migrationId, result);
    return result;
  }

  /**
   * Test backward compatibility
   */
  static testBackwardCompatibility(
    oldInterface: unknown,
    newInterface: unknown,
    testCases: CompatibilityTestCase[]
  ): CompatibilityResult {
    const results: CompatibilityTestResult[] = [];
    let overallCompatible = true;

    for (const testCase of testCases) {
      let compatible = true;
      let error: string | null = null;

      try {
        // Test if old interface method exists in new interface
        if (testCase.methodName) {
          const oldMethod = oldInterface[testCase.methodName];
          const newMethod = newInterface[testCase.methodName];

          if (!newMethod) {
            compatible = false;
            error = `Method ${testCase.methodName} not found in new interface`;
          } else if (typeof oldMethod !== typeof newMethod) {
            compatible = false;
            error = `Method ${testCase.methodName} type changed from ${typeof oldMethod} to ${typeof newMethod}`;
          } else if (testCase.args) {
            // Test method call with arguments
            const oldResult = oldMethod.apply(oldInterface, testCase.args);
            const newResult = newMethod.apply(newInterface, testCase.args);

            if (!this.deepCompare(oldResult, newResult)) {
              compatible = false;
              error = `Method ${testCase.methodName} produces different results`;
            }
          }
        }

        // Test property compatibility
        if (testCase.propertyName) {
          const oldProperty = oldInterface[testCase.propertyName];
          const newProperty = newInterface[testCase.propertyName];

          if (oldProperty !== undefined && newProperty === undefined) {
            compatible = false;
            error = `Property ${testCase.propertyName} removed from new interface`;
          } else if (typeof oldProperty !== typeof newProperty) {
            compatible = false;
            error = `Property ${testCase.propertyName} type changed`;
          } else if (!this.deepCompare(oldProperty, newProperty)) {
            compatible = false;
            error = `Property ${testCase.propertyName} value changed`;
          }
        }
      } catch (err) {
        compatible = false;
        error = `Error testing compatibility: ${(err as Error).message}`;
      }

      results.push({
        testCase,
        compatible,
        error
      });

      if (!compatible) {
        overallCompatible = false;
      }
    }

    return {
      compatible: overallCompatible,
      results,
      totalTests: testCases.length,
      passedTests: results.filter(r => r.compatible).length,
      failedTests: results.filter(r => !r.compatible).length
    };
  }

  /**
   * Get migration results
   */
  static getMigrationResults(
    migrationId?: string
  ): MigrationResult | MigrationResult[] {
    if (migrationId) {
      const result = this.migrationResults.get(migrationId);
      if (!result) {
        throw new Error(`Migration ${migrationId} not found`);
      }
      return result;
    }
    return Array.from(this.migrationResults.values());
  }

  /**
   * Clear migration results
   */
  static clearResults(): void {
    this.migrationResults.clear();
  }

  /**
   * Deep comparison utility
   */
  private static deepCompare(obj1: unknown, obj2: unknown): boolean {
    if (obj1 === obj2) {return true;}

    if (obj1 === null || obj1 === undefined) {return false;}
    if (obj2 === null || obj2 === undefined) {return false;}
    if (typeof obj1 !== typeof obj2) {return false;}

    if (Array.isArray(obj1) !== Array.isArray(obj2)) {return false;}

    if (Array.isArray(obj1)) {
      if (obj1.length !== obj2.length) {return false;}
      for (let i = 0; i < obj1.length; i++) {
        if (!this.deepCompare(obj1[i], obj2[i])) {return false;}
      }
      return true;
    }

    if (typeof obj1 === 'object') {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);

      if (keys1.length !== keys2.length) {return false;}

      for (const key of keys1) {
        if (!keys2.includes(key)) {return false;}
        if (!this.deepCompare(obj1[key], obj2[key])) {return false;}
      }
      return true;
    }

    return false;
  }
}

/**
 * Legacy System Mock
 * Creates mocks of legacy systems for testing migrations
 */
export class LegacySystemMock {
  private version: string;
  private behavior: LegacyBehavior;
  private state: unknown = {};

  constructor(version: string, behavior: LegacyBehavior = {}) {
    this.version = version;
    this.behavior = behavior;
  }

  /**
   * Create mock for specific version
   */
  static forVersion(version: string): LegacySystemMock {
    const behavior: LegacyBehavior = {};

    // Version-specific behaviors
    if (version.startsWith('1.')) {
      behavior.executionEngine = 'v1';
      behavior.nodeTypes = ['basic', 'weighted', 'output'];
      behavior.hasVariableSupport = false;
      behavior.supportsAsync = false;
    } else if (version.startsWith('2.')) {
      behavior.executionEngine = 'v2';
      behavior.nodeTypes = [
        'basic',
        'weighted',
        'output',
        'variable',
        'include'
      ];
      behavior.hasVariableSupport = true;
      behavior.supportsAsync = true;
    }

    return new LegacySystemMock(version, behavior);
  }

  /**
   * Execute graph in legacy mode
   */
  executeGraph(graph: unknown, options: unknown = {}): unknown {
    if (this.behavior.executionEngine === 'v1') {
      return this.executeV1(graph, options);
    } else if (this.behavior.executionEngine === 'v2') {
      return this.executeV2(graph, options);
    }

    throw new Error(
      `Unknown execution engine: ${this.behavior.executionEngine}`
    );
  }

  /**
   * Get supported node types
   */
  getSupportedNodeTypes(): string[] {
    return this.behavior.nodeTypes || [];
  }

  /**
   * Check feature support
   */
  supportsFeature(feature: string): boolean {
    switch (feature) {
      case 'variables':
        return this.behavior.hasVariableSupport || false;
      case 'async':
        return this.behavior.supportsAsync || false;
      default:
        return false;
    }
  }

  private executeV1(graph: unknown): unknown {
    // Simulate v1 execution behavior
    if (!graph.nodes || graph.nodes.length === 0) {
      return { result: '', variables: {} };
    }

    // V1 simple execution - just concatenate node values
    const result = graph.nodes
      .filter((node: unknown) => (node as { type: string }).type !== 'output')
      .map((node: unknown) => (node as { data?: { text?: string; value?: string } }).data?.text || (node as { data?: { text?: string; value?: string } }).data?.value || '')
      .join(' ');

    return {
      result,
      variables: {}, // V1 doesn't support variables
      executionTime: Math.random() * 100 + 50 // Simulate slower execution
    };
  }

  private executeV2(graph: unknown): unknown {
    // Simulate v2 execution behavior with variable support
    const variables: Record<string, unknown> = {};
    let result = '';

    if (graph.nodes) {
      for (const node of graph.nodes) {
        switch (node.type) {
          case 'SetVariable':
            variables[node.variableName] = node.value;
            break;
          case 'GetVariable':
            result += variables[node.variableName] || '';
            break;
          case 'WeightedChoice':
            if (node.choices && node.choices.length > 0) {
              // Simple selection for testing
              result += node.choices[0].value;
            }
            break;
          default:
            result += node.data?.text || node.data?.value || '';
        }
      }
    }

    return {
      result,
      variables,
      executionTime: Math.random() * 50 + 20 // Simulate faster execution
    };
  }

  /**
   * Get version info
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * Set internal state for testing
   */
  setState(state: unknown): void {
    this.state = { ...this.state, ...state };
  }

  /**
   * Get internal state
   */
  getState(): unknown {
    return { ...this.state };
  }
}

/**
 * Refactoring Validator
 * Validates that refactored code maintains expected behavior
 */
export class RefactoringValidator {
  /**
   * Compare two function implementations
   */
  static async compareFunctionBehavior<TArgs extends unknown[], TReturn>(
    oldFunction: (...args: TArgs) => TReturn | Promise<TReturn>,
    newFunction: (...args: TArgs) => TReturn | Promise<TReturn>,
    testCases: FunctionTestCase<TArgs, TReturn>[]
  ): Promise<FunctionComparisonResult<TArgs, TReturn>> {
    const results: FunctionTestResult<TArgs, TReturn>[] = [];
    let overallSuccess = true;

    for (const testCase of testCases) {
      let success = true;
      let error: string | null = null;
      let oldResult: TReturn | undefined;
      let newResult: TReturn | undefined;
      let oldError: Error | null = null;
      let newError: Error | null = null;

      try {
        // Test old function
        try {
          oldResult = await oldFunction(...testCase.args);
        } catch (err) {
          oldError = err as Error;
        }

        // Test new function
        try {
          newResult = await newFunction(...testCase.args);
        } catch (err) {
          newError = err as Error;
        }

        // Compare results
        if (oldError && newError) {
          // Both threw errors - check if error messages are similar
          if (oldError.message !== newError.message) {
            success = false;
            error = `Error messages differ: "${oldError.message}" vs "${newError.message}"`;
          }
        } else if (oldError || newError) {
          // One threw error, other didn't
          success = false;
          error = `Error behavior differs: old ${oldError ? 'threw' : 'succeeded'}, new ${newError ? 'threw' : 'succeeded'}`;
        } else {
          // Both succeeded - compare results
          if (!this.deepEqual(oldResult, newResult)) {
            success = false;
            error = `Results differ: ${JSON.stringify(oldResult)} vs ${JSON.stringify(newResult)}`;
          }
        }

        // Apply custom validator if provided (regardless of default comparison result)
        if (testCase.validator) {
          const validationResult = testCase.validator(oldResult, newResult);
          if (validationResult.valid) {
            // Custom validator overrides default comparison
            success = true;
            error = null;
          } else if (validationResult.message) {
            success = false;
            error = validationResult.message;
          }
        }
      } catch (err) {
        success = false;
        error = `Test execution failed: ${(err as Error).message}`;
      }

      results.push({
        testCase,
        success,
        error,
        oldResult,
        newResult,
        oldError,
        newError
      });

      if (!success) {
        overallSuccess = false;
      }
    }

    return {
      success: overallSuccess,
      results,
      totalTests: testCases.length,
      passedTests: results.filter(r => r.success).length,
      failedTests: results.filter(r => !r.success).length
    };
  }

  /**
   * Validate object interface compatibility
   */
  static validateInterfaceCompatibility(
    oldObject: unknown,
    newObject: unknown,
    requiredMethods: string[] = [],
    requiredProperties: string[] = []
  ): InterfaceCompatibilityResult {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check required methods
    for (const methodName of requiredMethods) {
      if (typeof oldObject[methodName] === 'function') {
        if (typeof newObject[methodName] !== 'function') {
          issues.push(
            `Required method '${methodName}' is missing or not a function`
          );
        }
      }
    }

    // Check required properties
    for (const propName of requiredProperties) {
      if (oldObject[propName] !== undefined) {
        if (newObject[propName] === undefined) {
          issues.push(`Required property '${propName}' is missing`);
        } else if (typeof oldObject[propName] !== typeof newObject[propName]) {
          warnings.push(
            `Property '${propName}' type changed from ${typeof oldObject[propName]} to ${typeof newObject[propName]}`
          );
        }
      }
    }

    // Check for new methods/properties (might be breaking changes)
    const oldKeys = Object.keys(oldObject);
    const newKeys = Object.keys(newObject);

    const addedKeys = newKeys.filter(key => !oldKeys.includes(key));
    const removedKeys = oldKeys.filter(key => !newKeys.includes(key));

    for (const key of removedKeys) {
      if (typeof oldObject[key] === 'function') {
        warnings.push(`Method '${key}' was removed`);
      } else {
        warnings.push(`Property '${key}' was removed`);
      }
    }

    return {
      compatible: issues.length === 0,
      issues,
      warnings,
      addedMembers: addedKeys,
      removedMembers: removedKeys
    };
  }

  private static deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) {return true;}
    if (a instanceof Date && b instanceof Date)
      {return a.getTime() === b.getTime();}
    if (!a || !b || (typeof a !== 'object' && typeof b !== 'object'))
      {return a === b;}
    if (a === null || a === undefined || b === null || b === undefined)
      {return false;}
    if (a.prototype !== b.prototype) {return false;}

    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) {return false;}

    return keys.every(k => this.deepEqual(a[k], b[k]));
  }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface MigrationStep {
  id: string;
  name: string;
  description?: string;
  execute: (beforeState: unknown) => unknown | Promise<unknown>;
  rollback?: (afterState: unknown) => unknown | Promise<unknown>;
  validate?: (state: unknown) => boolean;
}

export interface MigrationStepResult {
  stepId: string;
  stepName: string;
  success: boolean;
  error: Error | null;
  beforeState: unknown;
  afterState: unknown;
  rollbackSuccessful: boolean;
  executionTime: number;
  timestamp: string;
}

export interface MigrationResult {
  migrationId: string;
  success: boolean;
  failedAtStep: number | null;
  initialState: unknown;
  finalState: unknown;
  stepResults: MigrationStepResult[];
  totalSteps: number;
  completedSteps: number;
  executionTime: number;
  timestamp: string;
}

export interface CompatibilityTestCase {
  name: string;
  methodName?: string;
  propertyName?: string;
  args?: unknown[];
  expectedResult?: unknown;
}

export interface CompatibilityTestResult {
  testCase: CompatibilityTestCase;
  compatible: boolean;
  error: string | null;
}

export interface CompatibilityResult {
  compatible: boolean;
  results: CompatibilityTestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

export interface LegacyBehavior {
  executionEngine?: string;
  nodeTypes?: string[];
  hasVariableSupport?: boolean;
  supportsAsync?: boolean;
}

export interface FunctionTestCase<TArgs extends unknown[], TReturn> {
  name: string;
  args: TArgs;
  expectedResult?: TReturn;
  validator?: (
    oldResult: TReturn | undefined,
    newResult: TReturn | undefined
  ) => {
    valid: boolean;
    message?: string;
  };
}

export interface FunctionTestResult<TArgs extends unknown[], TReturn> {
  testCase: FunctionTestCase<TArgs, TReturn>;
  success: boolean;
  error: string | null;
  oldResult: TReturn | undefined;
  newResult: TReturn | undefined;
  oldError: Error | null;
  newError: Error | null;
}

export interface FunctionComparisonResult<TArgs extends unknown[], TReturn> {
  success: boolean;
  results: FunctionTestResult<TArgs, TReturn>[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

export interface InterfaceCompatibilityResult {
  compatible: boolean;
  issues: string[];
  warnings: string[];
  addedMembers: string[];
  removedMembers: string[];
}

export default {
  MigrationTestHelper,
  LegacySystemMock,
  RefactoringValidator
};
