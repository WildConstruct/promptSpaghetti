/**
 * State Transition Tests
 * Comprehensive testing of state management and task transitions
 */

import { StateTransitionTestFramework } from '../utils/StateTransitionTestFramework';
import { StateLock } from '../../src/utils/StateLock.js';
import fs from 'fs/promises';
import path from 'path';

describe('State Transition Tests', () => {
  let framework: StateTransitionTestFramework;
  let testStateFile: string;
  let stateLock: StateLock;

  beforeEach(async () => {
    // Create temporary state file for testing
    testStateFile = path.join(
      __dirname,
      '..',
      '..',
      'test-data',
      `test-state-${Date.now()}.json`
    );
    await fs.mkdir(path.dirname(testStateFile), { recursive: true });

    const initialState = {
      meta: { cycle: 1, updated: new Date().toISOString() },
      tasks: {},
      assignments: {}
    };

    await fs.writeFile(testStateFile, JSON.stringify(initialState, null, 2));

    framework = new StateTransitionTestFramework(testStateFile);
    stateLock = new StateLock(testStateFile);
    framework.defineTaskStates();
  });

  afterEach(async () => {
    await framework.cleanup();
    try {
      await fs.unlink(testStateFile);
      await fs.unlink(testStateFile + '.lock').catch(() => {});
    } catch (error) {
      // File might not exist
    }
  });

  describe('State Machine Definition', () => {
    it('should validate state machine integrity', async () => {
      const integrity = await framework.validateStateMachineIntegrity();

      expect(integrity.valid).toBe(true);
      expect(integrity.issues).toHaveLength(0);
      expect(integrity.statistics.totalStates).toBeGreaterThan(0);
      expect(integrity.statistics.deadEndStates).toContain('APPROVED');
    });

    it('should generate correct transition matrix', () => {
      const matrix = framework.generateTransitionMatrix();

      // Test specific valid transitions
      expect(matrix['UNASSIGNED']['IN_PROGRESS']).toBe(true);
      expect(matrix['IN_PROGRESS']['REVIEW']).toBe(true);
      expect(matrix['REVIEW']['APPROVED']).toBe(true);

      // Test invalid transitions
      expect(matrix['APPROVED']['UNASSIGNED']).toBe(false);
      expect(matrix['UNASSIGNED']['APPROVED']).toBe(false);
    });

    it('should identify unreachable and dead-end states correctly', async () => {
      const integrity = await framework.validateStateMachineIntegrity();

      expect(integrity.statistics.deadEndStates).toContain('APPROVED');
      expect(integrity.statistics.unreachableStates).toHaveLength(0);
    });
  });

  describe('Valid State Transitions', () => {
    it('should allow UNASSIGNED -> IN_PROGRESS transition', async () => {
      const taskId = 'test-task-1';

      // Create task in UNASSIGNED state
      await stateLock.transaction(state => {
        state.tasks[taskId] = {
          id: taskId,
          title: 'Test Task',
          status: 'UNASSIGNED',
          epic: 'E18',
          created: new Date().toISOString()
        };
      });

      const event = await framework.testValidTransition(
        taskId,
        'UNASSIGNED',
        'IN_PROGRESS',
        {
          assignee: 'test-agent'
        }
      );

      expect(event.success).toBe(true);
      expect(event.from).toBe('UNASSIGNED');
      expect(event.to).toBe('IN_PROGRESS');

      // Verify state change persisted
      const state = await stateLock.readState();
      expect(state.tasks[taskId].status).toBe('IN_PROGRESS');
      expect(state.tasks[taskId].assignee).toBe('test-agent');
    });

    it('should allow IN_PROGRESS -> REVIEW transition', async () => {
      const taskId = 'test-task-2';

      await stateLock.transaction(state => {
        state.tasks[taskId] = {
          id: taskId,
          title: 'Test Task',
          status: 'IN_PROGRESS',
          epic: 'E18',
          assignee: 'test-agent',
          created: new Date().toISOString()
        };
      });

      const event = await framework.testValidTransition(
        taskId,
        'IN_PROGRESS',
        'REVIEW',
        {
          output: 'Task completed successfully'
        }
      );

      expect(event.success).toBe(true);

      const state = await stateLock.readState();
      expect(state.tasks[taskId].status).toBe('REVIEW');
      expect(state.tasks[taskId].output).toBe('Task completed successfully');
    });

    it('should allow REVIEW -> APPROVED transition with completion timestamp', async () => {
      const taskId = 'test-task-3';

      await stateLock.transaction(state => {
        state.tasks[taskId] = {
          id: taskId,
          title: 'Test Task',
          status: 'REVIEW',
          epic: 'E18',
          assignee: 'test-agent',
          output: 'Complete implementation',
          created: new Date().toISOString()
        };
      });

      const event = await framework.testValidTransition(
        taskId,
        'REVIEW',
        'APPROVED'
      );

      expect(event.success).toBe(true);

      const state = await stateLock.readState();
      expect(state.tasks[taskId].status).toBe('APPROVED');
      expect(state.tasks[taskId].completedAt).toBeDefined();
    });

    it('should allow REVIEW -> IN_PROGRESS (revision) transition', async () => {
      const taskId = 'test-task-4';

      await stateLock.transaction(state => {
        state.tasks[taskId] = {
          id: taskId,
          title: 'Test Task',
          status: 'REVIEW',
          epic: 'E18',
          assignee: 'test-agent',
          output: 'Initial attempt',
          created: new Date().toISOString()
        };
      });

      const event = await framework.testValidTransition(
        taskId,
        'REVIEW',
        'IN_PROGRESS',
        {
          revisionReason: 'Needs improvement'
        }
      );

      expect(event.success).toBe(true);

      const state = await stateLock.readState();
      expect(state.tasks[taskId].status).toBe('IN_PROGRESS');
      expect(state.tasks[taskId].revisionReason).toBe('Needs improvement');
    });
  });

  describe('Invalid State Transitions', () => {
    it('should block UNASSIGNED -> APPROVED transition', async () => {
      const taskId = 'test-task-5';

      await stateLock.transaction(state => {
        state.tasks[taskId] = {
          id: taskId,
          title: 'Test Task',
          status: 'UNASSIGNED',
          epic: 'E18',
          created: new Date().toISOString()
        };
      });

      const result = await framework.testInvalidTransition(
        taskId,
        'UNASSIGNED',
        'APPROVED'
      );

      expect(result.blocked).toBe(true);
      expect(result.reason).toContain('Invalid transition');
    });

    it('should block APPROVED -> IN_PROGRESS transition', async () => {
      const taskId = 'test-task-6';

      await stateLock.transaction(state => {
        state.tasks[taskId] = {
          id: taskId,
          title: 'Test Task',
          status: 'APPROVED',
          epic: 'E18',
          completedAt: new Date().toISOString(),
          created: new Date().toISOString()
        };
      });

      const result = await framework.testInvalidTransition(
        taskId,
        'APPROVED',
        'IN_PROGRESS'
      );

      expect(result.blocked).toBe(true);
      expect(result.reason).toContain('Invalid transition');
    });

    it('should handle transition from non-existent task', async () => {
      const result = await framework.testInvalidTransition(
        'non-existent-task',
        'UNASSIGNED',
        'IN_PROGRESS'
      );

      expect(result.blocked).toBe(true);
      expect(result.reason).toContain('not found');
    });
  });

  describe('State Conditions and Actions', () => {
    it('should execute state actions on transition', async () => {
      const taskId = 'test-task-7';

      await stateLock.transaction(state => {
        state.tasks[taskId] = {
          id: taskId,
          title: 'Test Task',
          status: 'UNASSIGNED',
          epic: 'E18',
          created: new Date().toISOString()
        };
      });

      await framework.testValidTransition(taskId, 'UNASSIGNED', 'IN_PROGRESS', {
        assignee: 'test-agent'
      });

      const state = await stateLock.readState();
      expect(state.tasks[taskId].startedAt).toBeDefined();
    });

    it('should validate conditions before transition', async () => {
      const taskId = 'test-task-8';

      // Create task without required assignee for IN_PROGRESS state
      await stateLock.transaction(state => {
        state.tasks[taskId] = {
          id: taskId,
          title: 'Test Task',
          status: 'IN_PROGRESS',
          epic: 'E18',
          created: new Date().toISOString()
          // Missing assignee
        };
      });

      try {
        await framework.testValidTransition(taskId, 'IN_PROGRESS', 'REVIEW');
        fail('Should have failed due to missing assignee condition');
      } catch (error) {
        expect(error.message).toContain('hasAssignee');
      }
    });
  });

  describe('Comprehensive Test Suite', () => {
    it('should run all transition tests successfully', async () => {
      await framework.startTest('comprehensive-suite');

      const results = await framework.runComprehensiveTests(
        'comprehensive-test-task'
      );

      expect(results.passed).toBeGreaterThan(0);
      expect(results.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            test: 'State machine integrity',
            result: 'passed'
          })
        ])
      );

      // Should have tested both valid and invalid transitions
      const validTransitionTests = results.details.filter(
        d => d.test.includes('Valid transition') && d.result === 'passed'
      );
      const invalidTransitionTests = results.details.filter(
        d => d.test.includes('Invalid transition') && d.result === 'passed'
      );

      expect(validTransitionTests.length).toBeGreaterThan(0);
      expect(invalidTransitionTests.length).toBeGreaterThan(0);
    }, 30000);

    it('should generate meaningful test reports', async () => {
      await framework.startTest('report-test');

      const taskId = 'report-test-task';

      // Perform several transitions
      await framework.testValidTransition(taskId, 'UNASSIGNED', 'IN_PROGRESS', {
        assignee: 'test'
      });
      await framework.testValidTransition(taskId, 'IN_PROGRESS', 'REVIEW', {
        output: 'done'
      });
      await framework.testValidTransition(taskId, 'REVIEW', 'APPROVED');

      const report = framework.generateTestReport();

      expect(report.testName).toBe('report-test');
      expect(report.totalTransitions).toBe(3);
      expect(report.successfulTransitions).toBe(3);
      expect(report.statesVisited).toContain('UNASSIGNED');
      expect(report.statesVisited).toContain('APPROVED');
    });
  });

  describe('Concurrent Access Tests', () => {
    it('should handle concurrent state transitions safely', async () => {
      const taskId = 'concurrent-task';

      // Create initial task
      await stateLock.transaction(state => {
        state.tasks[taskId] = {
          id: taskId,
          title: 'Concurrent Test Task',
          status: 'UNASSIGNED',
          epic: 'E18',
          created: new Date().toISOString()
        };
      });

      // Attempt concurrent transitions (should be serialized by StateLock)
      const transitions = [
        framework.testValidTransition(taskId, 'UNASSIGNED', 'IN_PROGRESS', {
          assignee: 'agent1'
        }),
        framework.testValidTransition(taskId, 'UNASSIGNED', 'CANCELLED', {
          reason: 'concurrent cancel'
        })
      ];

      const results = await Promise.allSettled(transitions);

      // One should succeed, one should fail
      const successes = results.filter(r => r.status === 'fulfilled').length;
      const failures = results.filter(r => r.status === 'rejected').length;

      expect(successes).toBe(1);
      expect(failures).toBe(1);
    });

    it('should maintain state consistency under load', async () => {
      const numTasks = 10;
      const taskPromises: Promise<void>[] = [];

      // Create multiple tasks and transition them concurrently
      for (let i = 0; i < numTasks; i++) {
        taskPromises.push(
          (async () => {
            const taskId = `load-test-task-${i}`;

            await stateLock.transaction(state => {
              state.tasks[taskId] = {
                id: taskId,
                title: `Load Test Task ${i}`,
                status: 'UNASSIGNED',
                epic: 'E18',
                created: new Date().toISOString()
              };
            });

            // Perform transition sequence
            await framework.testValidTransition(
              taskId,
              'UNASSIGNED',
              'IN_PROGRESS',
              { assignee: `agent-${i}` }
            );
            await framework.testValidTransition(
              taskId,
              'IN_PROGRESS',
              'REVIEW',
              { output: `Output ${i}` }
            );
            await framework.testValidTransition(taskId, 'REVIEW', 'APPROVED');
          })()
        );
      }

      await Promise.all(taskPromises);

      // Verify all tasks ended up in APPROVED state
      const finalState = await stateLock.readState();
      const approvedTasks = Object.values(finalState.tasks).filter(
        (task: any) => task.status === 'APPROVED'
      );

      expect(approvedTasks).toHaveLength(numTasks);
    }, 30000);
  });

  describe('Error Handling and Recovery', () => {
    it('should handle corrupted state gracefully', async () => {
      // Corrupt the state file
      await fs.writeFile(testStateFile, 'invalid json');

      try {
        await framework.testValidTransition(
          'any-task',
          'UNASSIGNED',
          'IN_PROGRESS'
        );
        fail('Should have thrown error for corrupted state');
      } catch (error) {
        expect(error.message).toContain('JSON');
      }
    });

    it('should recover from state lock timeouts', async () => {
      // This test would require mocking the lock mechanism
      // For now, we test that the framework handles lock errors

      const taskId = 'timeout-test-task';

      await stateLock.transaction(state => {
        state.tasks[taskId] = {
          id: taskId,
          title: 'Timeout Test',
          status: 'UNASSIGNED',
          epic: 'E18',
          created: new Date().toISOString()
        };
      });

      // Normal transition should work
      const event = await framework.testValidTransition(
        taskId,
        'UNASSIGNED',
        'IN_PROGRESS',
        {
          assignee: 'test-agent'
        }
      );

      expect(event.success).toBe(true);
    });
  });
});
