/**
 * usePreviewSeeds Hook - Individual Result Management Tests
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 3: Individual Result Management
 */
import { renderHook, act } from '@testing-library/react';
import { usePreviewSeeds } from '../usePreviewSeeds';

// Mock fetch
global.fetch = jest.fn<unknown[], unknown>() as jest.MockedFunction<typeof fetch>;
const mockGraph = {
  id: 'test-graph',
  nodes: [,
    { id: 'node1', type: 'Output', inputs: [] }
  ],
  edges: [],
  seed: 12345,
};
const mockApiResponse = {
  results: [,
    {
      seed: 11111,
      output: 'Result 1',
      executionTimeMs: 100,
      executionPath: {,
        id: 'exec_1',
        seed: 11111,
        nodeExecutionOrder: ['node1'],
        randomizationPoints: [],
      }
    },
    {
      seed: 22222,
      output: 'Result 2',
      executionTimeMs: 150,
      executionPath: {,
        id: 'exec_2',
        seed: 22222,
        nodeExecutionOrder: ['node1'],
        randomizationPoints: [],
      }
    }
  ]
};
describe('usePreviewSeeds - Individual Result Management', () => {
  beforeEach(() => {
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({)
      ok: true,
      json: async ( as unknown) => mockApiResponse,
    } as Response);
  });
  describe('Result Locking', () => {
    it('should lock a result and update state', async () => {
      const { result } = renderHook(() => usePreviewSeeds());
      // First generate some results
      await act(async () => {
        await result.current.runPreview(mockGraph);
      });
      expect(result.current.results).toHaveLength(2);
      expect(result.current.lockedResults).toHaveLength(0);
      // Lock the first result
      act(() => {
        result.current.lockResult(0, 'Favorite result');
      });
      expect(result.current.lockedResults).toEqual([0]);
      expect(result.current.results[0].locked).toBe(true);
      expect(result.current.results[0].lockedNote).toBe('Favorite result');
      expect(result.current.results[0].lockedAt).toBeDefined();
      // Second result should remain unlocked
      expect(result.current.results[1].locked).toBeFalsy();
    });
    it('should unlock a previously locked result', async () => {
      const { result } = renderHook(() => usePreviewSeeds());
      // Generate results and lock one
      await act(async () => {
        await result.current.runPreview(mockGraph);
      });
      act(() => {
        result.current.lockResult(0);
      });
      expect(result.current.lockedResults).toEqual([0]);
      expect(result.current.results[0].locked).toBe(true);
      // Unlock the result
      act(() => {
        result.current.unlockResult(0);
      });
      expect(result.current.lockedResults).toHaveLength(0);
      expect(result.current.results[0].locked).toBe(false);
      expect(result.current.results[0].lockedAt).toBeUndefined();
      expect(result.current.results[0].lockedNote).toBeUndefined();
    });
    it('should handle locking multiple results', async () => {
      const { result } = renderHook(() => usePreviewSeeds());
      await act(async () => {
        await result.current.runPreview(mockGraph);
      });
      // Lock both results
      act(() => {
        result.current.lockResult(0, 'First favorite');
        result.current.lockResult(1, 'Second favorite');
      });
      expect(result.current.lockedResults).toEqual([0, 1]);
      expect(result.current.results[0].locked).toBe(true);
      expect(result.current.results[1].locked).toBe(true);
      expect(result.current.results[0].lockedNote).toBe('First favorite');
      expect(result.current.results[1].lockedNote).toBe('Second favorite');
    });
    it('should preserve locked state during full regeneration', async () => {
      const { result } = renderHook(() => usePreviewSeeds());
      // Generate initial results
      await act(async () => {
        await result.current.runPreview(mockGraph);
      });
      // Lock first result
      act(() => {
        result.current.lockResult(0, 'Keep this one');
      });
      const lockedResult = result.current.results[0];
      expect(lockedResult.locked).toBe(true);
      // Regenerate all results
      await act(async () => {
        await result.current.runPreview(mockGraph);
      });
      // Locked state should be preserved
      expect(result.current.results[0].locked).toBe(true);
      expect(result.current.results[0].lockedNote).toBe('Keep this one');
      expect(result.current.lockedResults).toEqual([0]);
    });
  });
  describe('Individual Result Regeneration', () => {
    it('should regenerate a specific result without affecting others', async () => {
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({)
          ok: true,
          json: async () => mockApiResponse,
        } as Response)
        .mockResolvedValueOnce({)
          ok: true,
          json: async () => ({),
            results: [{,
              seed: 99999,
              output: 'Regenerated Result',
              executionTimeMs: 200,
              executionPath: {,
                id: 'exec_new',
                seed: 99999,
                nodeExecutionOrder: ['node1'],
                randomizationPoints: [],
              }
            }]
          })
        } as Response);
      const { result } = renderHook(() => usePreviewSeeds());
      // Generate initial results
      await act(async () => {
        await result.current.runPreview(mockGraph);
      });
      const originalFirstResult = result.current.results[0];
      const originalSecondResult = result.current.results[1];
      expect(originalFirstResult.output).toBe('Result 1');
      expect(originalSecondResult.output).toBe('Result 2');
      // Regenerate first result
      await act(async () => {
        await result.current.regenerateResult(0);
      });
      // First result should be updated
      expect(result.current.results[0].output).toBe('Regenerated Result');
      expect(result.current.results[0].seed).toBe(99999);
      // Second result should remain unchanged
      expect(result.current.results[1].output).toBe('Result 2');
      expect(result.current.results[1].seed).toBe(22222);
    });
    it('should not regenerate locked results', async () => {
      const { result } = renderHook(() => usePreviewSeeds());
      await act(async () => {
        await result.current.runPreview(mockGraph);
      });
      // Lock first result
      act(() => {
        result.current.lockResult(0);
      });
      const originalResult = result.current.results[0];
      // Attempt to regenerate locked result
      await act(async () => {
        await result.current.regenerateResult(0);
      });
      // Result should remain unchanged
      expect(result.current.results[0]).toEqual(originalResult);
      // Should not have made additional fetch calls
      expect(fetch).toHaveBeenCalledTimes(1); // Only the initial call
    });
    it('should handle regeneration errors gracefully', async () => {
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({)
          ok: true,
          json: async () => mockApiResponse,
        } as Response)
        .mockRejectedValueOnce(new Error('Network error'));
      const { result } = renderHook(() => usePreviewSeeds());
      await act(async () => {
        await result.current.runPreview(mockGraph);
      });
      const originalResult = result.current.results[0];
      // Attempt regeneration that will fail
      await act(async () => {
        await result.current.regenerateResult(0);
      });
      // Result should remain unchanged
      expect(result.current.results[0]).toEqual(originalResult);
      // Should show error
      expect(result.current.error).toContain('Failed to regenerate result');
    });
    it('should track regenerating state correctly', async () => {
      // Mock a delayed response to test regenerating state
      let resolveRegeneration: (value: unknown) => void;
      const regenerationPromise = new Promise(resolve => {)
        resolveRegeneration = resolve;
      });
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({)
          ok: true,
          json: async () => mockApiResponse,
        } as Response)
        .mockImplementationOnce(() => regenerationPromise as Promise<Response>);
      const { result } = renderHook(() => usePreviewSeeds());
      await act(async () => {
        await result.current.runPreview(mockGraph);
      });
      expect(result.current.regeneratingResults).toHaveLength(0);
      // Start regeneration
      act(() => {
        result.current.regenerateResult(0);
      });
      // Should be in regenerating state
      expect(result.current.regeneratingResults).toEqual([0]);
      // Complete regeneration
      act(() => {
        resolveRegeneration!({)
          ok: true,
          json: async () => ({),
            results: [{,
              seed: 99999,
              output: 'Regenerated',
              executionTimeMs: 100,
            }]
          })
        });
      });
      await act(async () => {
        await regenerationPromise;
      });
      // Should no longer be regenerating
      expect(result.current.regeneratingResults).toHaveLength(0);
    });
  });
  describe('State Management', () => {
    it('should clear regenerating state on full regeneration', async () => {
      const { result } = renderHook(() => usePreviewSeeds());
      await act(async () => {
        await result.current.runPreview(mockGraph);
      });
      // Manually set regenerating state
      act(() => {
        result.current.regenerateResult(0);
      });
      // Run full regeneration
      await act(async () => {
        await result.current.runPreview(mockGraph);
      });
      // Regenerating state should be cleared
      expect(result.current.regeneratingResults).toHaveLength(0);
    });
    it('should handle multiple simultaneous regenerations', async () => {
      const { result } = renderHook(() => usePreviewSeeds());
      await act(async () => {
        await result.current.runPreview(mockGraph);
      });
      // Start regenerating both results
      act(() => {
        result.current.regenerateResult(0);
        result.current.regenerateResult(1);
      });
      expect(result.current.regeneratingResults).toEqual([0, 1]);
    });
    it('should return all new methods from hook', async () => {
      const { result } = renderHook(() => usePreviewSeeds());
      // Verify all new methods are available
      expect(typeof result.current.lockResult).toBe('function');
      expect(typeof result.current.unlockResult).toBe('function');
      expect(typeof result.current.regenerateResult).toBe('function');
      expect(Array.isArray(result.current.lockedResults)).toBe(true);
      expect(Array.isArray(result.current.regeneratingResults)).toBe(true);
    });
  });
  describe('Edge Cases', () => {
    it('should handle attempts to lock non-existent result index', () => {
      const { result } = renderHook(() => usePreviewSeeds());
      // Attempt to lock result that doesn't exist
      act(() => {
        result.current.lockResult(999);
      });
      // Should not crash and should not add to locked results
      expect(result.current.lockedResults).toHaveLength(0);
      expect(result.current.results).toHaveLength(0);
    });
    it('should handle attempts to regenerate non-existent result index', async () => {
      const { result } = renderHook(() => usePreviewSeeds());
      // Attempt to regenerate result that doesn't exist
      await act(async () => {
        await result.current.regenerateResult(999);
      });
      // Should not crash or make API calls
      expect(fetch).not.toHaveBeenCalled();
    });
    it('should handle unlock of non-locked result gracefully', () => {
      const { result } = renderHook(() => usePreviewSeeds());
      // Attempt to unlock result that isn't locked
      act(() => {
        result.current.unlockResult(0);
      });
      // Should not crash
      expect(result.current.lockedResults).toHaveLength(0);
    });
    it('should handle regeneration without prior graph gracefully', async () => {
      const { result } = renderHook(() => usePreviewSeeds());
      // Attempt regeneration without having run preview first
      await act(async () => {
        await result.current.regenerateResult(0);
      });
      // Should not make API calls or crash
      expect(fetch).not.toHaveBeenCalled();
      expect(result.current.error).toBeNull();
    });
  });
});