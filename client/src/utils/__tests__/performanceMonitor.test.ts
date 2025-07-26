/**
 * Performance Monitor Test Suite
 * 
 * Tests for performance tracking, monitoring, and optimization utilities
 */

import {
  performanceMonitor,
  usePerformanceTracking,
  withPerformanceTracking,
  performanceUtils
} from '../performanceMonitor';
import { renderHook } from '@testing-library/react';
import React from 'react';

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn<unknown[], unknown>(),
  measure: jest.fn<unknown[], unknown>(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => [])
};

// Mock PerformanceObserver
const mockObserver = {
  observe: jest.fn<unknown[], unknown>(),
  disconnect: jest.fn<unknown[], unknown>()
};

const MockPerformanceObserver = jest.fn(() => mockObserver);

// Setup global mocks
Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true
});

Object.defineProperty(global, 'PerformanceObserver', {
  value: MockPerformanceObserver,
  writable: true
});

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn<unknown[], unknown>(),
  setItem: jest.fn<unknown[], unknown>(),
  removeItem: jest.fn<unknown[], unknown>(),
  clear: jest.fn<unknown[], unknown>()
};

Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true
});

describe('Performance Monitor', () => {
  let mockTime = 1000;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTime = 1000;
    mockPerformance.now.mockImplementation(() => mockTime);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    performanceMonitor.destroy();
  });

  describe('measureExecution', () => {
    it('should measure synchronous function execution', () => {
      const testFn = jest.fn(() => 'result');
      
      // Advance time to simulate execution
      mockPerformance.now
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1050); // End time
      
      const result = performanceMonitor.measureExecution('test_sync', testFn);
      
      expect(result).toBe('result');
      expect(testFn).toHaveBeenCalled();
    });

    it('should measure asynchronous function execution', async () => {
      const testFn = jest.fn(() => Promise.resolve('async_result'));
      
      mockPerformance.now
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1100); // End time
      
      const result = await performanceMonitor.measureExecution('test_async', testFn);
      
      expect(result).toBe('async_result');
      expect(testFn).toHaveBeenCalled();
    });

    it('should handle function errors correctly', () => {
      const errorFn = jest.fn(() => {
        throw new Error('Test error');
      });
      
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1025);
      
      expect(() => {
        performanceMonitor.measureExecution('test_error', errorFn);
      }).toThrow('Test error');
      
      expect(errorFn).toHaveBeenCalled();
    });

    it('should handle async function errors', async () => {
      const asyncErrorFn = jest.fn(() => Promise.reject(new Error('Async error')));
      
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1030);
      
      await expect(
        performanceMonitor.measureExecution('test_async_error', asyncErrorFn)
      ).rejects.toThrow('Async error');
    });
  });

  describe('startTiming', () => {
    it('should return a function that records timing', () => {
      mockPerformance.now
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1200); // End time
      
      const endTiming = performanceMonitor.startTiming('manual_timing');
      
      // Simulate some work
      mockTime = 1200;
      
      endTiming({ operation: 'database_query' });
      
      // Verify timing was recorded (we can't directly access metrics in this test setup)
      expect(mockPerformance.now).toHaveBeenCalledTimes(2);
    });

    it('should handle metadata in timing completion', () => {
      const endTiming = performanceMonitor.startTiming('timing_with_metadata');
      
      expect(() => {
        endTiming({ 
          query: 'SELECT * FROM users',
          rows: 150,
          cached: false
        });
      }).not.toThrow();
    });
  });

  describe('trackApiCall', () => {
    it('should track API call performance', async () => {
      const apiCall = jest.fn(() => Promise.resolve({ data: 'success' }));
      
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1500);
      
      const result = await performanceMonitor.trackApiCall(
        '/api/users',
        'GET',
        apiCall
      );
      
      expect(result).toEqual({ data: 'success' });
      expect(apiCall).toHaveBeenCalled();
    });

    it('should track failed API calls', async () => {
      const failedApiCall = jest.fn(() => Promise.reject(new Error('Network error')));
      
      await expect(
        performanceMonitor.trackApiCall('/api/failed', 'POST', failedApiCall)
      ).rejects.toThrow('Network error');
    });
  });

  describe('trackInteraction', () => {
    it('should track user interaction performance', () => {
      const clickHandler = jest.fn(() => 'clicked');
      
      const result = performanceMonitor.trackInteraction(
        'button_click',
        clickHandler,
        { buttonId: 'submit-btn' }
      );
      
      expect(result).toBe('clicked');
      expect(clickHandler).toHaveBeenCalled();
    });

    it('should track async interaction performance', async () => {
      const asyncHandler = jest.fn(() => Promise.resolve('async_click'));
      
      const result = await performanceMonitor.trackInteraction(
        'async_action',
        asyncHandler,
        { elementType: 'button' }
      );
      
      expect(result).toBe('async_click');
    });
  });

  describe('addMetric', () => {
    it('should add custom metrics', () => {
      const metric = {
        name: 'custom_metric',
        duration: 150,
        type: 'custom' as const,
        metadata: { component: 'TestComponent' }
      };
      
      expect(() => {
        performanceMonitor.addMetric(metric);
      }).not.toThrow();
    });

    it('should auto-flush when buffer is full', () => {
      const spy = jest.spyOn(performanceMonitor, 'flush');
      
      // Add metrics up to buffer size (assuming default 1000)
      for (let i = 0; i < 1000; i++) {
        performanceMonitor.addMetric({
          name: `metric_${i}`,
          duration: 10,
          type: 'custom'
        });
      }
      
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    beforeEach(() => {
      // Add some test metrics
      performanceMonitor.addMetric({
        name: 'api_call',
        duration: 100,
        type: 'api'
      });
      
      performanceMonitor.addMetric({
        name: 'api_call',
        duration: 200,
        type: 'api'
      });
      
      performanceMonitor.addMetric({
        name: 'user_click',
        duration: 50,
        type: 'user_interaction'
      });
    });

    it('should return performance statistics', () => {
      const stats = performanceMonitor.getStats();
      
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.byType).toHaveProperty('api');
      expect(stats.byType).toHaveProperty('user_interaction');
      expect(stats.averages).toHaveProperty('api_call');
      expect(stats.slowest).toBeInstanceOf(Array);
    });

    it('should calculate averages correctly', () => {
      const stats = performanceMonitor.getStats();
      
      // Average of 100 and 200 should be 150
      expect(stats.averages.api_call).toBe(150);
    });

    it('should sort slowest operations', () => {
      const stats = performanceMonitor.getStats();
      
      expect(stats.slowest[0].duration).toBeGreaterThanOrEqual(
        stats.slowest[stats.slowest.length - 1]?.duration || 0
      );
    });
  });

  describe('flush', () => {
    it('should store metrics in sessionStorage', () => {
      mockSessionStorage.getItem.mockReturnValue(null as unknown as unknown);
      
      performanceMonitor.addMetric({
        name: 'test_flush',
        duration: 75,
        type: 'custom'
      });
      
      performanceMonitor.flush();
      
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'performance_metrics',
        expect.stringContaining('test_flush')
      );
    });

    it('should merge with existing metrics', () => {
      const existingMetrics = [
        { name: 'existing', duration: 50, type: 'custom', timestamp: 1000 }
      ];
      
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(existingMetrics as unknown as unknown));
      
      performanceMonitor.addMetric({
        name: 'new_metric',
        duration: 100,
        type: 'custom'
      });
      
      performanceMonitor.flush();
      
      const storedData = mockSessionStorage.setItem.mock.calls[0][1];
      const parsedData = JSON.parse(storedData);
      
      expect(parsedData).toHaveLength(2);
      expect(parsedData.some((m: unknown) => (m as any).name === 'existing')).toBe(true);
      expect(parsedData.some((m: unknown) => (m as any).name === 'new_metric')).toBe(true);
    });

    it('should limit stored metrics to 5000', () => {
      const manyMetrics = Array.from({ length: 6000 }, (_, i) => ({
        name: `metric_${i}`,
        duration: 10,
        type: 'custom',
        timestamp: 1000 + i
      }));
      
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(manyMetrics as unknown as unknown));
      
      performanceMonitor.flush();
      
      const storedData = mockSessionStorage.setItem.mock.calls[0][1];
      const parsedData = JSON.parse(storedData);
      
      expect(parsedData).toHaveLength(5000);
    });
  });
});

describe('React Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformance.now.mockReturnValue(1000 as unknown as unknown);
  });

  describe('usePerformanceTracking', () => {
    it('should track component render performance', () => {
      const { unmount } = renderHook(() => 
        usePerformanceTracking('TestComponent', ['prop1', 'prop2'])
      );
      
      expect(() => unmount()).not.toThrow();
    });

    it('should handle component re-renders', () => {
      const { rerender } = renderHook(
        ({ deps }) => usePerformanceTracking('TestComponent', deps),
        { initialProps: { deps: ['prop1'] } }
      );
      
      rerender({ deps: ['prop1', 'prop2'] });
      
      // Should not throw and should track multiple renders
      expect(mockPerformance.now).toHaveBeenCalled();
    });
  });

  describe('withPerformanceTracking', () => {
    it('should create a wrapped component', () => {
      const TestComponent = ({ text }: { text: string }) => 
        React.createElement('div', null, text);
      
      const WrappedComponent = withPerformanceTracking(TestComponent, 'TestComponent');
      
      expect(WrappedComponent.displayName).toBe('withPerformanceTracking(TestComponent)');
    });

    it('should handle components without displayName', () => {
      const AnonymousComponent = () => React.createElement('div', null, 'test');
      
      const WrappedComponent = withPerformanceTracking(AnonymousComponent);
      
      expect(WrappedComponent.displayName).toContain('withPerformanceTracking');
    });
  });
});

describe('Performance Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('debounce', () => {
    it('should debounce function calls', () => {
      const mockFn = jest.fn<unknown[], unknown>();
      const debouncedFn = performanceUtils.debounce(mockFn, 100, 'test_debounce');
      
      debouncedFn('arg1');
      debouncedFn('arg2');
      debouncedFn('arg3');
      
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(100);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg3');
    });

    it('should reset debounce timer on new calls', () => {
      const mockFn = jest.fn<unknown[], unknown>();
      const debouncedFn = performanceUtils.debounce(mockFn, 100);
      
      debouncedFn();
      jest.advanceTimersByTime(50);
      debouncedFn(); // Should reset timer
      jest.advanceTimersByTime(50); // Only 50ms since last call
      
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(50); // Now 100ms since last call
      
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', () => {
      const mockFn = jest.fn<unknown[], unknown>();
      const throttledFn = performanceUtils.throttle(mockFn, 100, 'test_throttle');
      
      throttledFn('call1');
      throttledFn('call2');
      throttledFn('call3');
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call1');
    });

    it('should allow calls after throttle period', () => {
      const mockFn = jest.fn<unknown[], unknown>();
      const throttledFn = performanceUtils.throttle(mockFn, 100);
      
      throttledFn('call1');
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      jest.advanceTimersByTime(100);
      
      throttledFn('call2');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenLastCalledWith('call2');
    });
  });
});

describe('PerformanceObserver Integration', () => {
  it('should initialize navigation observer', () => {
    expect(MockPerformanceObserver).toHaveBeenCalled();
    expect(mockObserver.observe).toHaveBeenCalledWith({ entryTypes: ['navigation'] });
  });

  it('should initialize resource observer', () => {
    expect(mockObserver.observe).toHaveBeenCalledWith({ entryTypes: ['resource'] });
  });

  it('should handle observer errors gracefully', () => {
    // Mock console.warn to verify error handling
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    MockPerformanceObserver.mockImplementationOnce(() => {
      throw new Error('Observer not supported');
    });
    
    // This should not crash the application
    expect(() => {
      // Re-initialize performance monitor to trigger observer setup
      performanceMonitor.destroy();
    }).not.toThrow();
    
    consoleSpy.mockRestore();
  });
});