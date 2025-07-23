/**
 * Tests for Refactoring Test Utilities
 * Validates the refactoring and migration testing utilities for Epic 18
 */

import {
  MigrationTestHelper,
  LegacySystemMock,
  RefactoringValidator,
  MigrationStep
} from '../RefactoringTestUtils';

describe('Refactoring Test Utilities', () => {
  beforeEach(() => {
    MigrationTestHelper.clearResults();
  });

  describe('MigrationTestHelper', () => {
    test('should test successful migration step', async () => {
      const migrationStep: MigrationStep = {
        id: 'step-1',
        name: 'Add new field',
        description: 'Adds a new field to the data structure',
        execute: async (state) => {
          return { ...state, newField: 'added' };
        },
        rollback: async (state) => {
          const { newField, ...rolledBack } = state;
          return rolledBack;
        }
      };

      const beforeState = { existingField: 'value' };
      const expectedAfterState = { existingField: 'value', newField: 'added' };

      const result = await MigrationTestHelper.testMigrationStep(
        migrationStep,
        beforeState,
        expectedAfterState
      );

      expect(result.success).toBe(true);
      expect(result.stepId).toBe('step-1');
      expect(result.stepName).toBe('Add new field');
      expect(result.error).toBeNull();
      expect(result.beforeState).toEqual(beforeState);
      expect(result.afterState).toEqual(expectedAfterState);
      expect(result.rollbackSuccessful).toBe(true);
      expect(result.executionTime).toBeGreaterThan(0);
    });

    test('should handle migration step failure', async () => {
      const migrationStep: MigrationStep = {
        id: 'failing-step',
        name: 'Failing step',
        execute: async (state) => {
          throw new Error('Migration failed');
        }
      };

      const result = await MigrationTestHelper.testMigrationStep(
        migrationStep,
        { test: 'data' }
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Migration failed');
      expect(result.afterState).toBeNull();
    });

    test('should test complete migration path', async () => {
      const steps: MigrationStep[] = [
        {
          id: 'step-1',
          name: 'First step',
          execute: async (state) => ({ ...state, step1: true })
        },
        {
          id: 'step-2', 
          name: 'Second step',
          execute: async (state) => ({ ...state, step2: true })
        },
        {
          id: 'step-3',
          name: 'Third step',
          execute: async (state) => ({ ...state, step3: true })
        }
      ];

      const initialState = { initial: true };
      
      const result = await MigrationTestHelper.testMigrationPath(
        'test-migration',
        steps,
        initialState
      );

      expect(result.success).toBe(true);
      expect(result.migrationId).toBe('test-migration');
      expect(result.failedAtStep).toBeNull();
      expect(result.initialState).toEqual(initialState);
      expect(result.finalState).toEqual({
        initial: true,
        step1: true,
        step2: true,
        step3: true
      });
      expect(result.stepResults).toHaveLength(3);
      expect(result.totalSteps).toBe(3);
      expect(result.completedSteps).toBe(3);
    });

    test('should handle migration path failure', async () => {
      const steps: MigrationStep[] = [
        {
          id: 'step-1',
          name: 'Successful step',
          execute: async (state) => ({ ...state, success: true })
        },
        {
          id: 'step-2',
          name: 'Failing step',
          execute: async (state) => {
            throw new Error('Step 2 failed');
          }
        },
        {
          id: 'step-3',
          name: 'Never reached',
          execute: async (state) => ({ ...state, never: true })
        }
      ];

      const result = await MigrationTestHelper.testMigrationPath(
        'failing-migration',
        steps,
        { start: true }
      );

      expect(result.success).toBe(false);
      expect(result.failedAtStep).toBe(1); // Second step (0-indexed)
      expect(result.stepResults).toHaveLength(2); // Only first two steps attempted
      expect(result.completedSteps).toBe(1); // Only first step succeeded
      expect(result.totalSteps).toBe(3);
    });

    test('should test backward compatibility', () => {
      const oldInterface = {
        getValue: () => 'old',
        calculate: (a: number, b: number) => a + b,
        config: { version: '1.0' }
      };

      const newInterface = {
        getValue: () => 'new', // Different return value
        calculate: (a: number, b: number) => a + b, // Same implementation
        config: { version: '2.0' }, // Different config
        newMethod: () => 'added' // New method
      };

      const testCases = [
        {
          name: 'getValue compatibility',
          methodName: 'getValue',
          args: []
        },
        {
          name: 'calculate compatibility',
          methodName: 'calculate', 
          args: [5, 3]
        },
        {
          name: 'config property',
          propertyName: 'config'
        }
      ];

      const result = MigrationTestHelper.testBackwardCompatibility(
        oldInterface,
        newInterface,
        testCases
      );

      expect(result.compatible).toBe(false); // getValue returns different value
      expect(result.totalTests).toBe(3);
      expect(result.passedTests).toBe(1); // Only calculate should pass
      expect(result.failedTests).toBe(2); // getValue and config fail
      
      const getValueResult = result.results.find(r => r.testCase.methodName === 'getValue');
      expect(getValueResult?.compatible).toBe(false);
      
      const calculateResult = result.results.find(r => r.testCase.methodName === 'calculate');
      expect(calculateResult?.compatible).toBe(true);
    });
  });

  describe('LegacySystemMock', () => {
    test('should create version-specific mocks', () => {
      const v1Mock = LegacySystemMock.forVersion('1.5.0');
      const v2Mock = LegacySystemMock.forVersion('2.1.0');

      expect(v1Mock.getVersion()).toBe('1.5.0');
      expect(v2Mock.getVersion()).toBe('2.1.0');

      expect(v1Mock.supportsFeature('variables')).toBe(false);
      expect(v2Mock.supportsFeature('variables')).toBe(true);

      expect(v1Mock.supportsFeature('async')).toBe(false);
      expect(v2Mock.supportsFeature('async')).toBe(true);
    });

    test('should execute graphs in v1 mode', () => {
      const v1Mock = LegacySystemMock.forVersion('1.0.0');
      
      const graph = {
        nodes: [
          { type: 'basic', data: { text: 'Hello' } },
          { type: 'basic', data: { text: 'World' } },
          { type: 'output', data: {} }
        ]
      };

      const result = v1Mock.executeGraph(graph);

      expect(result.result).toBe('Hello World');
      expect(result.variables).toEqual({});
      expect(result.executionTime).toBeGreaterThan(0);
    });

    test('should execute graphs in v2 mode with variables', () => {
      const v2Mock = LegacySystemMock.forVersion('2.0.0');
      
      const graph = {
        nodes: [
          { type: 'SetVariable', variableName: 'greeting', value: 'Hello' },
          { type: 'GetVariable', variableName: 'greeting' },
          { type: 'WeightedChoice', choices: [{ value: ' World', weight: 1 }] }
        ]
      };

      const result = v2Mock.executeGraph(graph);

      expect(result.result).toBe('Hello World');
      expect(result.variables.greeting).toBe('Hello');
      expect(result.executionTime).toBeGreaterThan(0);
    });

    test('should maintain internal state', () => {
      const mock = LegacySystemMock.forVersion('2.0.0');
      
      mock.setState({ testValue: 42 });
      const state = mock.getState();

      expect(state.testValue).toBe(42);

      mock.setState({ anotherValue: 'test' });
      const updatedState = mock.getState();

      expect(updatedState.testValue).toBe(42); // Should maintain existing state
      expect(updatedState.anotherValue).toBe('test');
    });

    test('should provide supported node types', () => {
      const v1Mock = LegacySystemMock.forVersion('1.0.0');
      const v2Mock = LegacySystemMock.forVersion('2.0.0');

      const v1NodeTypes = v1Mock.getSupportedNodeTypes();
      const v2NodeTypes = v2Mock.getSupportedNodeTypes();

      expect(v1NodeTypes).toEqual(['basic', 'weighted', 'output']);
      expect(v2NodeTypes).toEqual(['basic', 'weighted', 'output', 'variable', 'include']);
    });
  });

  describe('RefactoringValidator', () => {
    test('should compare function behavior successfully', async () => {
      const oldFunction = (a: number, b: number) => a + b;
      const newFunction = (x: number, y: number) => x + y; // Same logic, different param names

      const testCases = [
        { name: 'positive numbers', args: [2, 3] as [number, number], expectedResult: 5 },
        { name: 'negative numbers', args: [-1, -2] as [number, number], expectedResult: -3 },
        { name: 'zero', args: [0, 5] as [number, number], expectedResult: 5 }
      ];

      const result = await RefactoringValidator.compareFunctionBehavior(
        oldFunction,
        newFunction,
        testCases
      );

      expect(result.success).toBe(true);
      expect(result.totalTests).toBe(3);
      expect(result.passedTests).toBe(3);
      expect(result.failedTests).toBe(0);
    });

    test('should detect function behavior differences', async () => {
      const oldFunction = (a: number, b: number) => a + b;
      const newFunction = (a: number, b: number) => a * b; // Different logic

      const testCases = [
        { name: 'test case 1', args: [2, 3] as [number, number] },
        { name: 'test case 2', args: [4, 5] as [number, number] }
      ];

      const result = await RefactoringValidator.compareFunctionBehavior(
        oldFunction,
        newFunction,
        testCases
      );

      expect(result.success).toBe(false);
      expect(result.totalTests).toBe(2);
      expect(result.passedTests).toBe(0);
      expect(result.failedTests).toBe(2);

      expect(result.results[0].oldResult).toBe(5); // 2 + 3
      expect(result.results[0].newResult).toBe(6); // 2 * 3
      expect(result.results[0].success).toBe(false);
    });

    test('should handle async functions', async () => {
      const oldAsyncFunction = async (delay: number) => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return `Waited ${delay}ms`;
      };

      const newAsyncFunction = async (ms: number) => {
        await new Promise(resolve => setTimeout(resolve, ms));
        return `Waited ${ms}ms`;
      };

      const testCases = [
        { name: 'short delay', args: [10] as [number] },
        { name: 'longer delay', args: [50] as [number] }
      ];

      const result = await RefactoringValidator.compareFunctionBehavior(
        oldAsyncFunction,
        newAsyncFunction,
        testCases
      );

      expect(result.success).toBe(true);
      expect(result.results[0].oldResult).toBe('Waited 10ms');
      expect(result.results[0].newResult).toBe('Waited 10ms');
    });

    test('should validate interface compatibility', () => {
      const oldObject = {
        method1: () => 'old',
        method2: (x: number) => x * 2,
        prop1: 'value1',
        prop2: 42
      };

      const newObject = {
        method1: () => 'new', // Changed return value
        method2: (x: number) => x * 2, // Same implementation
        // prop1 is missing
        prop2: 42,
        newProp: 'added'
      };

      const result = RefactoringValidator.validateInterfaceCompatibility(
        oldObject,
        newObject,
        ['method1', 'method2'], // Required methods
        ['prop1', 'prop2'] // Required properties
      );

      expect(result.compatible).toBe(false); // prop1 is missing
      expect(result.issues).toContain('Required property \'prop1\' is missing');
      expect(result.warnings).toContain('Property \'prop1\' was removed');
      expect(result.addedMembers).toContain('newProp');
      expect(result.removedMembers).toContain('prop1');
    });

    test('should handle custom validators', async () => {
      const oldFunction = (input: string) => input.toUpperCase();
      const newFunction = (input: string) => input.toLowerCase();

      const testCases = [
        {
          name: 'custom validation',
          args: ['Hello'] as [string],
          validator: (oldResult: string | undefined, newResult: string | undefined) => {
            if (oldResult === 'HELLO' && newResult === 'hello') {
              return { valid: true }; // Accept this specific difference
            }
            return { valid: false, message: 'Results should match exactly' };
          }
        }
      ];

      const result = await RefactoringValidator.compareFunctionBehavior(
        oldFunction,
        newFunction,
        testCases
      );

      expect(result.success).toBe(true); // Custom validator allows the difference
      expect(result.results[0].success).toBe(true);
    });
  });
});