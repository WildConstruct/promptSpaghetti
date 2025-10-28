import React from 'react';
import { act, renderHook } from '@testing-library/react';
import {
  performanceMonitor,
  usePerformanceTracking,
  withPerformanceTracking,
  performanceUtils,
  type PerformanceMetric
} from '../performanceMonitor';

const originalPerformance = global.performance;

beforeEach(() => {
  jest.useFakeTimers();
  const nowValues: number[] = [];
  let current = 0;
  global.performance = {
    ...originalPerformance,
    now: jest.fn(() => {
      current += nowValues.shift() ?? 16;
      return current;
    }),
    getEntriesByType: jest.fn(() => []),
    mark: jest.fn(),
    measure: jest.fn(),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn()
  } as unknown as Performance;
  performanceMonitor.flush();
});

afterEach(() => {
  jest.useRealTimers();
  global.performance = originalPerformance;
  performanceMonitor.flush();
});

describe('performanceMonitor', () => {
  it('measures synchronous execution', () => {
    const result = performanceMonitor.measureExecution('sync', () => 'value');
    expect(result).toBe('value');
    expect(performanceMonitor.getMetrics()).toHaveLength(1);
  });

  it('measures asynchronous execution', async () => {
    const result = await performanceMonitor.measureExecution('async', async () => {
      await Promise.resolve();
      return 'async-value';
    });
    expect(result).toBe('async-value');
    expect(performanceMonitor.getMetrics()).toHaveLength(1);
  });

  it('captures metrics via startTiming', () => {
    const endTiming = performanceMonitor.startTiming('operation');
    endTiming({ action: 'complete' });
    const metrics = performanceMonitor.getMetrics();
    expect(metrics[0]?.name).toBe('operation');
    expect(metrics[0]?.metadata).toEqual({ action: 'complete' });
  });

  it('tracks API calls', async () => {
    await performanceMonitor.trackApiCall('/users', 'GET', () =>
      Promise.resolve({ status: 200 })
    );
    const metric = performanceMonitor.getMetrics()[0];
    expect(metric?.name).toBe('api:GET:/users');
    expect(metric?.type).toBe('api');
  });

  it('provides metric summaries', () => {
    performanceMonitor.addMetric({
      name: 'render',
      duration: 10,
      timestamp: 0,
      type: 'component'
    });
    performanceMonitor.addMetric({
      name: 'render',
      duration: 20,
      timestamp: 10,
      type: 'component'
    });

    const stats = performanceMonitor.getStats();
    expect(stats.total).toBe(2);
    expect(stats.byType.component).toBe(2);

    const summary = performanceUtils.summarize(performanceMonitor.getMetrics());
    expect(summary.average).toBeGreaterThan(0);
  });
});

describe('usePerformanceTracking', () => {
  it('records mount and unmount timings', () => {
    const { unmount } = renderHook(({ deps }) => {
      usePerformanceTracking('test-hook', deps);
    }, { initialProps: { deps: [] as unknown[] } });

    unmount();
    const metricNames = performanceMonitor.getMetrics().map(metric => metric.name);
    expect(metricNames.some(name => name.includes('hook:test-hook'))).toBe(true);
  });
});

describe('withPerformanceTracking', () => {
  it('wraps component with perf tracking', () => {
    const Component: React.FC<{ label: string }> = ({ label }) => <div>{label}</div>;
    const Wrapped = withPerformanceTracking(Component, 'Component');

    const { unmount } = renderHook(({ label }) => <Wrapped label={label} />, {
      initialProps: { label: 'ok' }
    });

    unmount();
    const metrics = performanceMonitor.getMetrics();
    expect(metrics.some((metric: PerformanceMetric) => metric.type === 'component')).toBe(true);
  });
});
