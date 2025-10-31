/**
 * State Transition Test Framework
 * Comprehensive testing utilities for state management and transitions
 */

import { StateLock } from '../../src/utils/StateLock.js';
import { TestDataManager } from './TestDataManager';

type TaskRecord = {
  id: string;
  status: string;
  title?: string;
  epic?: string;
  assignee?: string | null;
  dueDate?: string;
  output?: string;
  completedAt?: string;
  rejectionReason?: string;
  startedAt?: string;
  updated?: string;
  [key: string]: unknown;
};

interface LockedState {
  tasks: Record<string, TaskRecord>;
  [key: string]: unknown;
}

type ConditionFn = (state: TaskRecord) => boolean;
type ActionFn = (state: TaskRecord) => Partial<TaskRecord> | void;
type TransitionData = Partial<TaskRecord>;

export interface StateDefinition {
  name: string;
  validTransitions: string[];
  conditions?: Record<string, ConditionFn>;
  actions?: Record<string, ActionFn>;
}

export interface TransitionEvent {
  from: string;
  to: string;
  event: string;
  timestamp: string;
  data?: TransitionData;
  success: boolean;
  error?: string;
}

export interface StateTestConfig {
  initialState: string;
  finalState?: string;
  maxTransitions: number;
  timeout: number;
  validateStateIntegrity: boolean;
  trackHistory: boolean;
}

export class StateTransitionTestFramework {
  private stateLock: StateLock;
  private testDataManager: TestDataManager;
  private states: Map<string, StateDefinition> = new Map();
  private transitionHistory: TransitionEvent[] = [];
  private currentTest: string | null = null;
  private currentTestConfig: StateTestConfig | null = null;

  constructor(stateFilePath?: string) {
    this.stateLock = new StateLock(stateFilePath);
    this.testDataManager = new TestDataManager();
  }

  /**
   * Define state machine structure
   */
  defineStates(states: StateDefinition[]): void {
    this.states.clear();
    states.forEach(state => {
      this.states.set(state.name, state);
    });
  }

  /**
   * Initialize task state testing structure
   */
  defineTaskStates(): void {
    this.defineStates([
      {
        name: 'UNASSIGNED',
        validTransitions: ['IN_PROGRESS', 'CANCELLED'],
        conditions: {
          canAssign: state => !state.assignee,
          hasRequirements: state => state.title && state.epic
        }
      },
      {
        name: 'IN_PROGRESS',
        validTransitions: ['REVIEW', 'UNASSIGNED', 'CANCELLED'],
        conditions: {
          hasAssignee: state => !!state.assignee,
          withinDeadline: state =>
            !state.dueDate || new Date(state.dueDate) > new Date()
        },
        actions: {
          startWork: state => ({
            ...state,
            startedAt: new Date().toISOString()
          })
        }
      },
      {
        name: 'REVIEW',
        validTransitions: ['APPROVED', 'IN_PROGRESS', 'REJECTED'],
        conditions: {
          hasOutput: state => state.output && state.output.length > 0,
          hasAssignee: state => !!state.assignee
        }
      },
      {
        name: 'APPROVED',
        validTransitions: [],
        conditions: {
          isComplete: state => state.completedAt
        },
        actions: {
          complete: state => ({
            ...state,
            completedAt: new Date().toISOString()
          })
        }
      },
      {
        name: 'REJECTED',
        validTransitions: ['IN_PROGRESS', 'CANCELLED'],
        conditions: {
          hasRejectionReason: state => state.rejectionReason
        }
      },
      {
        name: 'CANCELLED',
        validTransitions: ['UNASSIGNED'],
        conditions: {
          canReopen: state => state.status !== 'APPROVED'
        }
      }
    ]);
  }

  /**
   * Start a new state transition test
   */
  async startTest(
    testName: string,
    config: Partial<StateTestConfig> = {}
  ): Promise<void> {
    this.currentTest = testName;
    this.transitionHistory = [];

    const testConfig: StateTestConfig = {
      initialState: 'UNASSIGNED',
      maxTransitions: 50,
      timeout: 30000,
      validateStateIntegrity: true,
      trackHistory: true,
      ...config
    };

    // Store test configuration in memory (skip TestDataManager for now)
    this.currentTestConfig = testConfig;
  }

  /**
   * Test valid state transition
   */
  async testValidTransition(
    taskId: string,
    fromState: string,
    toState: string,
    data?: TransitionData
  ): Promise<TransitionEvent> {
    const timestamp = new Date().toISOString();

    try {
      // Validate transition is allowed
      const fromStateDefinition = this.states.get(fromState);
      if (!fromStateDefinition) {
        throw new Error(`Unknown state: ${fromState}`);
      }

      if (!fromStateDefinition.validTransitions.includes(toState)) {
        throw new Error(`Invalid transition from ${fromState} to ${toState}`);
      }

      // Perform the actual state transition
      await this.stateLock.transaction((state: LockedState) => {
        const task = state.tasks[taskId];
        if (!task) {
          throw new Error(`Task ${taskId} not found`);
        }

        if (task.status !== fromState) {
          throw new Error(
            `Task ${taskId} is in state ${task.status}, expected ${fromState}`
          );
        }

        // Check conditions
        const stateDefinition = this.states.get(fromState);
        if (stateDefinition?.conditions) {
          for (const [conditionName, conditionFn] of Object.entries(
            stateDefinition.conditions
          )) {
            if (!conditionFn(task)) {
              throw new Error(
                `Condition ${conditionName} failed for transition ${fromState} -> ${toState}`
              );
            }
          }
        }

        // Apply state change
        task.status = toState;
        task.updated = timestamp;

        // Apply any data changes
        if (data) {
          Object.assign(task, data);
        }

        // Execute state actions
        const toStateDefinition = this.states.get(toState);
        if (toStateDefinition?.actions) {
          for (const [, actionFn] of Object.entries(
            toStateDefinition.actions
          )) {
            const result = actionFn(task);
            if (result) {
              Object.assign(task, result);
            }
          }
        }

        return task;
      });

      const event: TransitionEvent = {
        from: fromState,
        to: toState,
        event: `${fromState}_TO_${toState}`,
        timestamp,
        data,
        success: true
      };

      this.transitionHistory.push(event);
      return event;
    } catch (error) {
      const event: TransitionEvent = {
        from: fromState,
        to: toState,
        event: `${fromState}_TO_${toState}`,
        timestamp,
        data,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };

      this.transitionHistory.push(event);
      throw error;
    }
  }

  /**
   * Test invalid state transition (should fail)
   */
  async testInvalidTransition(
    taskId: string,
    fromState: string,
    toState: string
  ): Promise<{ blocked: boolean; reason: string }> {
    try {
      await this.testValidTransition(taskId, fromState, toState);
      return { blocked: false, reason: 'Transition unexpectedly succeeded' };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      return { blocked: true, reason };
    }
  }

  /**
   * Test state machine integrity
   */
  async validateStateMachineIntegrity(): Promise<{
    valid: boolean;
    issues: string[];
    statistics: {
      totalStates: number;
      totalTransitions: number;
      deadEndStates: string[];
      unreachableStates: string[];
    };
  }> {
    const issues: string[] = [];
    const allStates = Array.from(this.states.keys());
    const reachableStates = new Set<string>();
    const deadEndStates: string[] = [];

    // Check for dead-end states (no outgoing transitions)
    for (const [stateName, stateDefinition] of this.states) {
      if (stateDefinition.validTransitions.length === 0) {
        deadEndStates.push(stateName);
      }
    }

    // Check for unreachable states using graph traversal
    const visitState = (stateName: string, visited: Set<string>) => {
      if (visited.has(stateName)) {
        return;
      }
      visited.add(stateName);
      reachableStates.add(stateName);

      const stateDefinition = this.states.get(stateName);
      if (stateDefinition) {
        for (const nextState of stateDefinition.validTransitions) {
          visitState(nextState, visited);
        }
      }
    };

    // Start from typical initial states
    const initialStates = ['UNASSIGNED', 'DRAFT', 'PENDING', 'INITIAL'];
    for (const initialState of initialStates) {
      if (this.states.has(initialState)) {
        visitState(initialState, new Set());
      }
    }

    const unreachableStates = allStates.filter(
      state => !reachableStates.has(state)
    );

    // Validate transition targets exist
    for (const [stateName, stateDefinition] of this.states) {
      for (const targetState of stateDefinition.validTransitions) {
        if (!this.states.has(targetState)) {
          issues.push(
            `State ${stateName} has invalid transition to non-existent state ${targetState}`
          );
        }
      }
    }

    const totalTransitions = Array.from(this.states.values()).reduce(
      (sum, state) => sum + state.validTransitions.length,
      0
    );

    return {
      valid: issues.length === 0,
      issues,
      statistics: {
        totalStates: allStates.length,
        totalTransitions,
        deadEndStates,
        unreachableStates
      }
    };
  }

  /**
   * Generate comprehensive state transition matrix
   */
  generateTransitionMatrix(): Record<string, Record<string, boolean>> {
    const matrix: Record<string, Record<string, boolean>> = {};
    const allStates = Array.from(this.states.keys());

    for (const fromState of allStates) {
      matrix[fromState] = {};
      const stateDefinition = this.states.get(fromState);

      for (const toState of allStates) {
        matrix[fromState][toState] =
          stateDefinition?.validTransitions.includes(toState) || false;
      }
    }

    return matrix;
  }

  /**
   * Run comprehensive state transition test suite
   */
  async runComprehensiveTests(taskId: string): Promise<{
    passed: number;
    failed: number;
    skipped: number;
    details: Array<{
      test: string;
      result: 'passed' | 'failed' | 'skipped';
      message: string;
      duration: number;
    }>;
  }> {
    const results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      details: [] as Array<{
        test: string;
        result: 'passed' | 'failed' | 'skipped';
        message: string;
        duration: number;
      }>
    };

    const allStates = Array.from(this.states.keys());

    // Test 1: State machine integrity
    const startTime = Date.now();
    try {
      const integrity = await this.validateStateMachineIntegrity();
      const duration = Date.now() - startTime;

      if (integrity.valid) {
        results.passed++;
        results.details.push({
          test: 'State machine integrity',
          result: 'passed',
          message: `Valid state machine with ${integrity.statistics.totalStates} states and ${integrity.statistics.totalTransitions} transitions`,
          duration
        });
      } else {
        results.failed++;
        results.details.push({
          test: 'State machine integrity',
          result: 'failed',
          message: `Issues found: ${integrity.issues.join(', ')}`,
          duration
        });
      }
    } catch (error) {
      results.failed++;
      results.details.push({
        test: 'State machine integrity',
        result: 'failed',
        message: (error instanceof Error ? error.message : String(error)),
        duration: Date.now() - startTime
      });
    }

    // Test 2: Valid transitions for each state
    for (const fromState of allStates) {
      const stateDefinition = this.states.get(fromState);
      if (!stateDefinition) {
        continue;
      }

      for (const toState of stateDefinition.validTransitions) {
        const testStart = Date.now();
        try {
          // Create a test task in the from state
          await this.createTestTask(taskId, fromState);
          await this.testValidTransition(taskId, fromState, toState);

          results.passed++;
          results.details.push({
            test: `Valid transition ${fromState} -> ${toState}`,
            result: 'passed',
            message: 'Transition completed successfully',
            duration: Date.now() - testStart
          });
        } catch (error) {
          results.failed++;
          results.details.push({
            test: `Valid transition ${fromState} -> ${toState}`,
            result: 'failed',
            message: (error instanceof Error ? error.message : String(error)),
            duration: Date.now() - testStart
          });
        }
      }
    }

    // Test 3: Invalid transitions
    const transitionMatrix = this.generateTransitionMatrix();
    for (const fromState of allStates) {
      for (const toState of allStates) {
        if (!transitionMatrix[fromState][toState] && fromState !== toState) {
          const testStart = Date.now();
          try {
            await this.createTestTask(taskId, fromState);
            const result = await this.testInvalidTransition(
              taskId,
              fromState,
              toState
            );

            if (result.blocked) {
              results.passed++;
              results.details.push({
                test: `Invalid transition ${fromState} -> ${toState}`,
                result: 'passed',
                message: `Correctly blocked: ${result.reason}`,
                duration: Date.now() - testStart
              });
            } else {
              results.failed++;
              results.details.push({
                test: `Invalid transition ${fromState} -> ${toState}`,
                result: 'failed',
                message: 'Invalid transition was not blocked',
                duration: Date.now() - testStart
              });
            }
          } catch (error) {
            results.failed++;
            results.details.push({
              test: `Invalid transition ${fromState} -> ${toState}`,
              result: 'failed',
              message: (error instanceof Error ? error.message : String(error)),
              duration: Date.now() - testStart
            });
          }
        }
      }
    }

    return results;
  }

  /**
   * Create test task in specific state
   */
  private async createTestTask(
    taskId: string,
    initialState: string
  ): Promise<void> {
    await this.stateLock.transaction(state => {
      state.tasks[taskId] = {
        id: taskId,
        title: `Test Task ${taskId}`,
        status: initialState,
        epic: 'TEST',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        assignee: initialState === 'UNASSIGNED' ? null : 'test-agent'
      };
    });
  }

  /**
   * Get transition history for analysis
   */
  getTransitionHistory(): TransitionEvent[] {
    return [...this.transitionHistory];
  }

  /**
   * Generate test report
   */
  generateTestReport(): {
    testName: string;
    totalTransitions: number;
    successfulTransitions: number;
    failedTransitions: number;
    statesVisited: string[];
    transitionsByState: Record<string, number>;
    averageTransitionTime: number;
  } {
    const statesVisited = [
      ...new Set(
        this.transitionHistory
          .map(t => t.from)
          .concat(this.transitionHistory.map(t => t.to))
      )
    ];
    const transitionsByState: Record<string, number> = {};

    for (const event of this.transitionHistory) {
      transitionsByState[event.from] =
        (transitionsByState[event.from] || 0) + 1;
    }

    const transitionTimes = this.transitionHistory
      .map((_, i, arr) =>
        i > 0
          ? new Date(arr[i].timestamp).getTime() -
            new Date(arr[i - 1].timestamp).getTime()
          : 0
      )
      .filter(time => time > 0);

    return {
      testName: this.currentTest || 'Unknown',
      totalTransitions: this.transitionHistory.length,
      successfulTransitions: this.transitionHistory.filter(t => t.success)
        .length,
      failedTransitions: this.transitionHistory.filter(t => !t.success).length,
      statesVisited,
      transitionsByState,
      averageTransitionTime:
        transitionTimes.length > 0
          ? transitionTimes.reduce((a, b) => a + b, 0) / transitionTimes.length
          : 0
    };
  }

  /**
   * Cleanup test resources
   */
  async cleanup(): Promise<void> {
    this.transitionHistory = [];
    this.currentTest = null;
    await this.testDataManager.cleanup();
  }
}
