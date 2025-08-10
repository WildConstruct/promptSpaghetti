/**
 * Tests for PreviewEngine
 */

import { PreviewEngine, PreviewState, PreviewUpdate } from '../PreviewEngine';
import {
  Epic1Graph,
  ExecutionResult
} from '../../../../runtime/nodes/epic1/Epic1ExecutionEngine';
import { TextBlockNode } from '../../../../runtime/nodes/epic1/TextBlockNode';
import { OutputNode } from '../../../../runtime/nodes/epic1/OutputNode';

// Mock the execution engine
jest.mock('../../../../runtime/nodes/epic1/Epic1ExecutionEngine', () => {
  return {
    Epic1ExecutionEngine: jest.fn().mockImplementation((graph, seed) => ({
      execute: jest.fn().mockResolvedValue({
        success: true,
        output: `Test output for seed ${seed}`,
        results: new Map(),
        stats: {
          totalDuration: 50,
          nodesExecuted: 2,
          errors: [],
          warnings: []
        },
        context: {}
      })
    }))
  };
});

describe('PreviewEngine', () => {
  let engine: PreviewEngine;
  let mockGraph: Epic1Graph;

  beforeEach(() => {
    // Clear all timers
    jest.clearAllTimers();
    jest.useFakeTimers();

    // Create test graph
    const textNode = new TextBlockNode({ id: 'node1', text: 'Hello' });
    const outputNode = new OutputNode({ id: 'node2', label: 'Output' });

    mockGraph = {
      nodes: new Map([
        ['node1', textNode],
        ['node2', outputNode]
      ]),
      edges: [{ id: 'edge1', source: 'node1', target: 'node2' }]
    };

    // Create engine with short debounce for testing
    engine = new PreviewEngine({
      debounceDelay: 100,
      seeds: [1, 2, 3]
    });
  });

  afterEach(() => {
    engine.dispose();
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      const defaultEngine = new PreviewEngine();
      expect(defaultEngine.getState()).toBe(PreviewState.IDLE);
      expect(defaultEngine.getSeeds()).toEqual([1234, 5678, 9012]);
      defaultEngine.dispose();
    });

    it('should initialize with custom options', () => {
      expect(engine.getState()).toBe(PreviewState.IDLE);
      expect(engine.getSeeds()).toEqual([1, 2, 3]);
    });
  });

  describe('Debouncing', () => {
    it('should debounce rapid updates', async () => {
      const callback = jest.fn();
      engine.subscribe(callback);

      // Make rapid updates
      engine.updatePreview(mockGraph);
      engine.updatePreview(mockGraph);
      engine.updatePreview(mockGraph);

      // Should immediately go to pending
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ state: PreviewState.PENDING })
      );

      // Clear callback history
      callback.mockClear();

      // Fast forward past debounce delay
      jest.advanceTimersByTime(150);

      // Should start executing
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ state: PreviewState.EXECUTING })
      );

      // Let execution complete
      await jest.runAllTimersAsync();

      // Should complete with results
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          state: PreviewState.IDLE,
          results: expect.arrayContaining([
            expect.objectContaining({
              success: true,
              output: expect.any(String)
            })
          ])
        })
      );
    });

    it('should cancel pending execution on new update', async () => {
      const callback = jest.fn();
      engine.subscribe(callback);

      // First update
      engine.updatePreview(mockGraph);

      // Advance halfway through debounce
      jest.advanceTimersByTime(50);

      // New update should cancel the first
      engine.updatePreview(mockGraph);

      // Advance past original debounce time
      jest.advanceTimersByTime(100);

      // Should still be pending (new debounce timer)
      expect(engine.getState()).toBe(PreviewState.PENDING);

      // Advance to complete new debounce
      jest.advanceTimersByTime(50);

      // Now should be executing
      expect(engine.getState()).toBe(PreviewState.EXECUTING);
    });
  });

  describe('Immediate execution', () => {
    it('should bypass debouncing with updatePreviewImmediate', async () => {
      const callback = jest.fn();
      engine.subscribe(callback);

      // Immediate update
      const promise = engine.updatePreviewImmediate(mockGraph);

      // Should immediately start executing
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ state: PreviewState.EXECUTING })
      );

      // Wait for completion
      await promise;

      // Should have results
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          state: PreviewState.IDLE,
          results: expect.any(Array)
        })
      );
    });
  });

  describe('Subscription management', () => {
    it('should notify subscribers of state changes', async () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const unsub1 = engine.subscribe(callback1);
      const unsub2 = engine.subscribe(callback2);

      engine.updatePreview(mockGraph);

      // Both should be notified
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();

      // Unsubscribe first callback
      unsub1();
      callback1.mockClear();
      callback2.mockClear();

      // Update again
      engine.updatePreview(mockGraph);

      // Only second callback should be notified
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();

      unsub2();
    });

    it('should send current state to new subscribers', () => {
      // Execute first
      engine.updatePreview(mockGraph);
      jest.advanceTimersByTime(150);

      // Subscribe after state change
      const callback = jest.fn();
      engine.subscribe(callback);

      // Should receive current state immediately
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          state: PreviewState.EXECUTING
        })
      );
    });

    it('should handle errors in subscriber callbacks', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      const normalCallback = jest.fn();

      // Mock console.error
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      engine.subscribe(errorCallback);
      engine.subscribe(normalCallback);

      engine.updatePreview(mockGraph);

      // Error callback throws, but normal callback should still be called
      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalledWith(
        'Error in preview update callback:',
        expect.any(Error)
      );

      consoleError.mockRestore();
    });
  });

  describe('Seed management', () => {
    it('should update seeds', () => {
      const newSeeds = [100, 200, 300];
      engine.setSeeds(newSeeds);
      expect(engine.getSeeds()).toEqual(newSeeds);
    });

    it('should use updated seeds for execution', async () => {
      const callback = jest.fn();
      engine.subscribe(callback);

      // Update seeds
      engine.setSeeds([999]);

      // Execute
      await engine.updatePreviewImmediate(mockGraph);

      // Check results contain the new seed
      const lastCall = callback.mock.calls[callback.mock.calls.length - 1][0];
      expect(lastCall.results).toHaveLength(1);
      expect(lastCall.results[0].output).toContain('999');
    });
  });

  describe('Debounce delay management', () => {
    it('should update debounce delay', () => {
      engine.setDebounceDelay(500);

      const callback = jest.fn();
      engine.subscribe(callback);

      engine.updatePreview(mockGraph);

      // Advance less than new delay
      jest.advanceTimersByTime(400);

      // Should still be pending
      expect(engine.getState()).toBe(PreviewState.PENDING);

      // Advance past new delay
      jest.advanceTimersByTime(150);

      // Now should be executing
      expect(engine.getState()).toBe(PreviewState.EXECUTING);
    });

    it('should handle negative delay values', () => {
      engine.setDebounceDelay(-100);

      // Should be set to 0
      const callback = jest.fn();
      engine.subscribe(callback);

      engine.updatePreview(mockGraph);

      // Should execute immediately with 0 delay
      jest.advanceTimersByTime(0);
      expect(engine.getState()).toBe(PreviewState.EXECUTING);
    });
  });

  describe('Error handling', () => {
    it('should handle execution errors', async () => {
      // Mock execution to fail
      const {
        Epic1ExecutionEngine
      } = require('../../../../runtime/nodes/epic1/Epic1ExecutionEngine');
      Epic1ExecutionEngine.mockImplementationOnce(() => ({
        execute: jest.fn().mockRejectedValue(new Error('Execution failed'))
      }));

      const callback = jest.fn();
      engine.subscribe(callback);

      await engine.updatePreviewImmediate(mockGraph);

      // Should report error state
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          state: PreviewState.ERROR,
          error: expect.objectContaining({
            message: 'Execution failed'
          })
        })
      );
    });

    it('should handle execution timeout', async () => {
      // Create engine with very short timeout
      const timeoutEngine = new PreviewEngine({
        maxExecutionTime: 10,
        seeds: [1]
      });

      // Mock slow execution
      const {
        Epic1ExecutionEngine
      } = require('../../../../runtime/nodes/epic1/Epic1ExecutionEngine');
      Epic1ExecutionEngine.mockImplementationOnce(() => ({
        execute: jest.fn(
          () =>
            new Promise(resolve => {
              setTimeout(resolve, 1000);
            })
        )
      }));

      const callback = jest.fn();
      timeoutEngine.subscribe(callback);

      jest.useRealTimers();
      await timeoutEngine.updatePreviewImmediate(mockGraph);
      jest.useFakeTimers();

      // Should timeout
      const lastCall = callback.mock.calls[callback.mock.calls.length - 1][0];
      expect(lastCall.state).toBe(PreviewState.ERROR);
      expect(lastCall.error?.message).toContain('timeout');

      timeoutEngine.dispose();
    });
  });

  describe('Cancellation', () => {
    it('should cancel in-progress execution on new update', async () => {
      const callback = jest.fn();
      engine.subscribe(callback);

      // Start execution
      engine.updatePreview(mockGraph);
      jest.advanceTimersByTime(150);

      // Should be executing
      expect(engine.getState()).toBe(PreviewState.EXECUTING);

      // New update should cancel current execution
      engine.updatePreview(mockGraph);

      // Should go back to pending
      expect(engine.getState()).toBe(PreviewState.PENDING);
    });

    it('should not update state after cancellation', async () => {
      // Mock slow execution
      const {
        Epic1ExecutionEngine
      } = require('../../../../runtime/nodes/epic1/Epic1ExecutionEngine');
      let resolveExecution: any;
      Epic1ExecutionEngine.mockImplementationOnce(() => ({
        execute: jest.fn(
          () =>
            new Promise(resolve => {
              resolveExecution = resolve;
            })
        )
      }));

      const callback = jest.fn();
      engine.subscribe(callback);

      // Start execution
      engine.updatePreview(mockGraph);
      jest.advanceTimersByTime(150);

      // Clear callback history
      callback.mockClear();

      // Cancel by disposing
      engine.dispose();

      // Complete the execution after disposal
      if (resolveExecution) {
        resolveExecution({
          success: true,
          output: 'Should not see this'
        });
      }

      // Should not have received any updates after disposal
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should clean up resources on dispose', () => {
      const callback = jest.fn();
      engine.subscribe(callback);

      // Start a pending execution
      engine.updatePreview(mockGraph);

      // Dispose
      engine.dispose();

      // Advance timers
      jest.advanceTimersByTime(200);

      // Callback should not be called after dispose
      callback.mockClear();
      jest.advanceTimersByTime(1000);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('State getters', () => {
    it('should return current state', () => {
      expect(engine.getState()).toBe(PreviewState.IDLE);

      engine.updatePreview(mockGraph);
      expect(engine.getState()).toBe(PreviewState.PENDING);
    });

    it('should return last update', async () => {
      expect(engine.getLastUpdate()).toBeNull();

      await engine.updatePreviewImmediate(mockGraph);

      const lastUpdate = engine.getLastUpdate();
      expect(lastUpdate).not.toBeNull();
      expect(lastUpdate?.state).toBe(PreviewState.IDLE);
      expect(lastUpdate?.results).toBeDefined();
      expect(lastUpdate?.timestamp).toBeGreaterThan(0);
    });
  });
});
