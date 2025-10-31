/**
 * Edge Case State Transition Tests
 * Testing boundary conditions, error scenarios, and complex state interactions
 */

import { StateTransitionTestFramework } from '../utils/StateTransitionTestFramework';
import { StateLock } from '../../src/utils/StateLock.js';
import fs from 'fs/promises';
import path from 'path';

describe('Edge Case State Transition Tests', () => {
  let framework: StateTransitionTestFramework;
  let testStateFile: string;
  let stateLock: StateLock;

  beforeEach(async () => {
    testStateFile = path.join(
      __dirname,
      '..',
      '..',
      'test-data',
      `edge-case-state-${Date.now()}.json`
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
      await fs.unlink(`${testStateFile}.lock`).catch(err => {
        const lockError = err as NodeJS.ErrnoException;
        if (lockError && lockError.code !== 'ENOENT') {
          console.warn('Failed to remove lock file:', lockError);
        }
      });
    } catch (error) {
      const stateError = error as NodeJS.ErrnoException;
      if (stateError && stateError.code !== 'ENOENT') {
        console.warn('Failed to remove state file:', stateError);
      }
    }
  });

  describe('Malformed Task Data', () => {
    it('should handle task with missing required fields', async () => {
      const taskId = 'malformed-task-1';

      // Create task with minimal/missing data
      await stateLock.transaction(state => {
        state.tasks[taskId] = {
          id: taskId,
          status: 'IN_PROGRESS'
          // Missing title, epic, created timestamp, assignee
        };
      });

      try {
        await framework.testValidTransition(taskId, 'IN_PROGRESS', 'REVIEW');
        fail('Should have failed due to missing assignee condition');
      } catch (error) {
        expect(error.message).toContain('hasAssignee');
      }

      // State should remain unchanged
      const state = await stateLock.readState();
      expect(state.tasks[taskId].status).toBe('IN_PROGRESS');
    });

    it('should handle task with null/undefined status', async () => {
      const taskId = 'null-status-task';

      await stateLock.transaction(state => {
        state.tasks[taskId] = {
          id: taskId,
          title: 'Test Task',
          status: null,
          epic: 'E18'
        };
      });

      try {
        await framework.testValidTransition(taskId, null as unknown, 'IN_PROGRESS');
        fail('Should have failed with null status');
      } catch (error) {
        expect(error.message).toContain('Unknown state: null');
      }
    });

    it('should handle task with invalid status value', async () => {
      const taskId = 'invalid-status-task';

      await stateLock.transaction(state => {
        state.tasks[taskId] = {
          id: taskId,
          title: 'Test Task',
          status: 'INVALID_STATE',
          epic: 'E18'
        };
      });

      try {
        await framework.testValidTransition(
          taskId,
          'INVALID_STATE',
          'IN_PROGRESS'
        );
        fail('Should have failed with invalid status');
      } catch (error) {
        expect(error.message).toContain('Unknown state: INVALID_STATE');
      }
    });

    it('should handle circular references in task data', async () => {
      const taskId = 'circular-ref-task';

      await stateLock.transaction(state => {
        const task = {
          id: taskId,
          title: 'Circular Reference Task',
          status: 'UNASSIGNED',
          epic: 'E18',
          created: new Date().toISOString()
        };

        // Create circular reference (this tests JSON serialization)
        (task as unknown as { self: unknown }).self = task;
        state.tasks[taskId] = task;
      });

      // This should handle the circular reference gracefully
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

  describe('State File Corruption Scenarios', () => {
    it('should handle completely missing state file', async () => {
      await fs.unlink(testStateFile);

      // Framework should create new state or handle missing file
      const event = await framework.testValidTransition(
        'new-task',
        'UNASSIGNED',
        'IN_PROGRESS',
        {
          assignee: 'test-agent'
        }
      );

      expect(event.success).toBe(true);
    });

    it('should handle state file with invalid JSON', async () => {
      await fs.writeFile(testStateFile, '{invalid json content');

      try {
        await framework.testValidTransition(
          'any-task',
          'UNASSIGNED',
          'IN_PROGRESS'
        );
        fail('Should have failed with invalid JSON');
      } catch (error) {
        expect(error.message.toLowerCase()).toContain('json');
      }
    });

    it('should handle state file with missing structure', async () => {
      await fs.writeFile(testStateFile, JSON.stringify({ someField: 'value' }));

      const event = await framework.testValidTransition(
        'new-task',
        'UNASSIGNED',
        'IN_PROGRESS',
        {
          assignee: 'test-agent'
        }
      );

      expect(event.success).toBe(true);
    });

    it('should handle state file with corrupt task structure', async () => {
      const corruptState = {
        meta: { cycle: 1, updated: new Date().toISOString() },
        tasks: 'not an object', // Should be object
        assignments: {}
      };

      await fs.writeFile(testStateFile, JSON.stringify(corruptState));

      try {
        await framework.testValidTransition(
          'any-task',
          'UNASSIGNED',
          'IN_PROGRESS'
        );
        fail('Should have failed with corrupt tasks structure');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Extreme Load and Timing', () => {
    it('should handle rapid-fire transitions on same task', async () => {
      const taskId = 'rapid-fire-task';

      await stateLock.transaction(state => {
        state.tasks[taskId] = {
          id: taskId,
          title: 'Rapid Fire Task',
          status: 'UNASSIGNED',
          epic: 'E18',
          created: new Date().toISOString()
        };
      });

      // Attempt multiple rapid transitions - only first should succeed
      const promises = [
        framework.testValidTransition(taskId, 'UNASSIGNED', 'IN_PROGRESS', {
          assignee: 'agent1'
        }),
        framework.testValidTransition(taskId, 'UNASSIGNED', 'CANCELLED', {
          reason: 'cancel'
        }),
        framework.testValidTransition(taskId, 'UNASSIGNED', 'IN_PROGRESS', {
          assignee: 'agent2'
        })
      ];

      const results = await Promise.allSettled(promises);

      // Only one should succeed due to state locks
      const successes = results.filter(r => r.status === 'fulfilled').length;
      const failures = results.filter(r => r.status === 'rejected').length;

      expect(successes).toBe(1);
      expect(failures).toBe(2);
    });

    it('should handle transitions with microsecond timing differences', async () => {
      const taskCount = 50;
      const promises: Promise<unknown>[] = [];

      // Create many tasks and transition them simultaneously
      for (let i = 0; i < taskCount; i++) {
        promises.push(
          (async () => {
            const taskId = `micro-timing-task-${i}`;

            await stateLock.transaction(state => {
              state.tasks[taskId] = {
                id: taskId,
                title: `Micro Timing Task ${i}`,
                status: 'UNASSIGNED',
                epic: 'E18',
                created: new Date().toISOString()
              };
            });

            return framework.testValidTransition(
              taskId,
              'UNASSIGNED',
              'IN_PROGRESS',
              { assignee: `agent-${i}` }
            );
          })()
        );
      }

      const results = await Promise.allSettled(promises);
      const successes = results.filter(r => r.status === 'fulfilled').length;

      // All should succeed since they're different tasks
      expect(successes).toBe(taskCount);

      // Verify final state consistency
      const finalState = await stateLock.readState();
      const inProgressTasks = Object.values(finalState.tasks).filter(
        (task: { status: string }) => task.status === 'IN_PROGRESS'
      );
      expect(inProgressTasks).toHaveLength(taskCount);
    }, 30000);
  });

  describe('Memory and Resource Constraints', () => {
    it('should handle very large task objects', async () => {
      const taskId = 'large-task';
      const largeData = 'x'.repeat(1000000); // 1MB string

      await stateLock.transaction(state => {
        state.tasks[taskId] = {
          id: taskId,
          title: 'Large Task',
          status: 'UNASSIGNED',
          epic: 'E18',
          created: new Date().toISOString(),
          largeField: largeData,
          metadata: {
            description: largeData,
            notes: largeData
          }
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

      // Verify large data persisted correctly
      const state = await stateLock.readState();
      expect(state.tasks[taskId].largeField).toHaveLength(1000000);
    });

    it('should handle tasks with deeply nested structures', async () => {
      const taskId = 'nested-task';

      // Create deeply nested structure
      const deeplyNested: unknown = { level: 0 };
      let current = deeplyNested;

      for (let i = 1; i <= 100; i++) {
        current.next = { level: i };
        current = current.next;
      }

      await stateLock.transaction(state => {
        state.tasks[taskId] = {
          id: taskId,
          title: 'Deeply Nested Task',
          status: 'UNASSIGNED',
          epic: 'E18',
          created: new Date().toISOString(),
          nestedData: deeplyNested
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
    });

    it('should handle state with thousands of tasks', async () => {
      const taskCount = 1000;

      // Create many tasks at once
      await stateLock.transaction(state => {
        for (let i = 0; i < taskCount; i++) {
          state.tasks[`bulk-task-${i}`] = {
            id: `bulk-task-${i}`,
            title: `Bulk Task ${i}`,
            status: 'UNASSIGNED',
            epic: 'E18',
            created: new Date().toISOString()
          };
        }
      });

      // Transition a specific task
      const targetTask = 'bulk-task-500';
      const event = await framework.testValidTransition(
        targetTask,
        'UNASSIGNED',
        'IN_PROGRESS',
        {
          assignee: 'test-agent'
        }
      );

      expect(event.success).toBe(true);

      // Verify state integrity
      const state = await stateLock.readState();
      expect(Object.keys(state.tasks)).toHaveLength(taskCount);
      expect(state.tasks[targetTask].status).toBe('IN_PROGRESS');
    }, 30000);
  });

  describe('Boundary Value Testing', () => {
    it('should handle empty string task ID', async () => {
      try {
        await framework.testValidTransition('', 'UNASSIGNED', 'IN_PROGRESS');
        fail('Should have failed with empty task ID');
      } catch (error) {
        expect(error.message).toContain('not found');
      }
    });

    it('should handle very long task IDs', async () => {
      const longTaskId = 'task-' + 'x'.repeat(10000);

      await stateLock.transaction(state => {
        state.tasks[longTaskId] = {
          id: longTaskId,
          title: 'Long ID Task',
          status: 'UNASSIGNED',
          epic: 'E18',
          created: new Date().toISOString()
        };
      });

      const event = await framework.testValidTransition(
        longTaskId,
        'UNASSIGNED',
        'IN_PROGRESS',
        {
          assignee: 'test-agent'
        }
      );

      expect(event.success).toBe(true);
    });

    it('should handle special characters in task data', async () => {
      const taskId = 'special-char-task';
      const specialChars = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./';

      await stateLock.transaction(state => {
        state.tasks[taskId] = {
          id: taskId,
          title: `Task with ${specialChars}`,
          status: 'UNASSIGNED',
          epic: 'E18',
          created: new Date().toISOString(),
          specialField: specialChars
        };
      });

      const event = await framework.testValidTransition(
        taskId,
        'UNASSIGNED',
        'IN_PROGRESS',
        {
          assignee: 'test-agent',
          notes: `Notes with ${specialChars}`
        }
      );

      expect(event.success).toBe(true);
    });

    it('should handle Unicode and emoji in task data', async () => {
      const taskId = 'unicode-task';
      const unicodeText = '🚀 测试 العربية русский 日本語 𝕌𝕟𝕚𝕔𝕠𝕕𝕖';

      await stateLock.transaction(state => {
        state.tasks[taskId] = {
          id: taskId,
          title: `Unicode Task ${unicodeText}`,
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
          assignee: 'test-agent',
          description: unicodeText
        }
      );

      expect(event.success).toBe(true);

      // Verify Unicode data persisted correctly
      const state = await stateLock.readState();
      expect(state.tasks[taskId].description).toBe(unicodeText);
    });
  });

  describe('Time-based Edge Cases', () => {
    it('should handle transitions at exact midnight boundaries', async () => {
      const taskId = 'midnight-task';

      // Mock system time to be near midnight
      const originalNow = Date.now;
      Date.now = jest.fn(() => new Date('2023-12-31T23:59:59.999Z').getTime());

      try {
        await stateLock.transaction(state => {
          state.tasks[taskId] = {
            id: taskId,
            title: 'Midnight Task',
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
            assignee: 'midnight-agent'
          }
        );

        expect(event.success).toBe(true);
        expect(event.timestamp).toContain('23:59:59');
      } finally {
        Date.now = originalNow;
      }
    });

    it('should handle transitions with leap year timestamps', async () => {
      const taskId = 'leap-year-task';

      await stateLock.transaction(state => {
        state.tasks[taskId] = {
          id: taskId,
          title: 'Leap Year Task',
          status: 'UNASSIGNED',
          epic: 'E18',
          created: '2024-02-29T12:00:00.000Z' // Leap year date
        };
      });

      const event = await framework.testValidTransition(
        taskId,
        'UNASSIGNED',
        'IN_PROGRESS',
        {
          assignee: 'leap-agent'
        }
      );

      expect(event.success).toBe(true);
    });

    it('should handle historical timestamps (far past)', async () => {
      const taskId = 'historical-task';

      await stateLock.transaction(state => {
        state.tasks[taskId] = {
          id: taskId,
          title: 'Historical Task',
          status: 'UNASSIGNED',
          epic: 'E18',
          created: '1970-01-01T00:00:01.000Z' // Near Unix epoch
        };
      });

      const event = await framework.testValidTransition(
        taskId,
        'UNASSIGNED',
        'IN_PROGRESS',
        {
          assignee: 'historical-agent'
        }
      );

      expect(event.success).toBe(true);
    });
  });

  describe('Complex State Scenarios', () => {
    it('should handle cyclic task references', async () => {
      const taskId1 = 'cyclic-task-1';
      const taskId2 = 'cyclic-task-2';

      await stateLock.transaction(state => {
        state.tasks[taskId1] = {
          id: taskId1,
          title: 'Cyclic Task 1',
          status: 'UNASSIGNED',
          epic: 'E18',
          created: new Date().toISOString(),
          dependsOn: taskId2
        };

        state.tasks[taskId2] = {
          id: taskId2,
          title: 'Cyclic Task 2',
          status: 'UNASSIGNED',
          epic: 'E18',
          created: new Date().toISOString(),
          dependsOn: taskId1 // Creates cycle
        };
      });

      // Both transitions should work despite the cycle
      const event1 = await framework.testValidTransition(
        taskId1,
        'UNASSIGNED',
        'IN_PROGRESS',
        { assignee: 'agent1' }
      );

      const event2 = await framework.testValidTransition(
        taskId2,
        'UNASSIGNED',
        'IN_PROGRESS',
        { assignee: 'agent2' }
      );

      expect(event1.success).toBe(true);
      expect(event2.success).toBe(true);
    });

    it('should maintain referential integrity across transitions', async () => {
      const parentTaskId = 'parent-task';
      const childTaskId = 'child-task';

      await stateLock.transaction(state => {
        state.tasks[parentTaskId] = {
          id: parentTaskId,
          title: 'Parent Task',
          status: 'UNASSIGNED',
          epic: 'E18',
          created: new Date().toISOString(),
          children: [childTaskId]
        };

        state.tasks[childTaskId] = {
          id: childTaskId,
          title: 'Child Task',
          status: 'UNASSIGNED',
          epic: 'E18',
          created: new Date().toISOString(),
          parent: parentTaskId
        };
      });

      // Transition parent task
      await framework.testValidTransition(
        parentTaskId,
        'UNASSIGNED',
        'IN_PROGRESS',
        { assignee: 'parent-agent' }
      );

      // Verify child task reference is maintained
      const state = await stateLock.readState();
      expect(state.tasks[childTaskId].parent).toBe(parentTaskId);
      expect(state.tasks[parentTaskId].children).toContain(childTaskId);
    });
  });
});
