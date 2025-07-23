/**
 * Comprehensive Test Utilities and Helpers
 * 
 * Collection of utility functions, matchers, and helpers for testing.
 * Provides common testing patterns, data generators, and assertion helpers.
 */

import { faker } from '@faker-js/faker';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Test data generators
export const TestDataGenerators = {
  
  /**
   * Generate template test data
   */
  template: (overrides?: Partial<any>) => ({
    id: faker.number.int({ min: 1, max: 10000 }),
    name: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    category_id: faker.number.int({ min: 1, max: 5 }),
    tags: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.word.noun()),
    author_id: faker.number.int({ min: 1, max: 1000 }),
    version: '1.0.0',
    is_public: faker.datatype.boolean(),
    graph_data: {
      nodes: [
        {
          id: faker.string.uuid(),
          type: faker.helpers.arrayElement(['input', 'output', 'process', 'ai']),
          position: { x: faker.number.int({ min: 0, max: 500 }), y: faker.number.int({ min: 0, max: 500 }) },
          data: { label: faker.lorem.words(2) }
        }
      ],
      edges: []
    },
    variables: [],
    customization_points: [],
    usage_count: faker.number.int({ min: 0, max: 100 }),
    average_rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
    download_count: faker.number.int({ min: 0, max: 1000 }),
    favorite_count: faker.number.int({ min: 0, max: 50 }),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
    ...overrides
  }),

  /**
   * Generate user test data
   */
  user: (overrides?: Partial<any>) => ({
    id: faker.number.int({ min: 1, max: 10000 }),
    email: faker.internet.email(),
    username: faker.internet.userName(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    avatar: faker.image.avatar(),
    role: faker.helpers.arrayElement(['user', 'admin', 'moderator']),
    isActive: faker.datatype.boolean(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides
  }),

  /**
   * Generate graph node test data
   */
  graphNode: (overrides?: Partial<any>) => ({
    id: faker.string.uuid(),
    type: faker.helpers.arrayElement(['input', 'output', 'process', 'conditional', 'loop']),
    position: { 
      x: faker.number.int({ min: 0, max: 1000 }), 
      y: faker.number.int({ min: 0, max: 1000 }) 
    },
    data: {
      label: faker.lorem.words(2),
      value: faker.lorem.sentence(),
      config: {
        param1: faker.datatype.boolean(),
        param2: faker.number.int({ min: 1, max: 100 }),
        param3: faker.lorem.word()
      }
    },
    ...overrides
  }),

  /**
   * Generate graph edge test data
   */
  graphEdge: (sourceId?: string, targetId?: string, overrides?: Partial<any>) => ({
    id: faker.string.uuid(),
    source: sourceId || faker.string.uuid(),
    target: targetId || faker.string.uuid(),
    type: faker.helpers.arrayElement(['default', 'step', 'smoothstep', 'straight']),
    animated: faker.datatype.boolean(),
    ...overrides
  }),

  /**
   * Generate API error response
   */
  apiError: (status = 400, overrides?: Partial<any>) => ({
    error: faker.helpers.arrayElement(['Validation Error', 'Not Found', 'Unauthorized', 'Internal Server Error']),
    message: faker.lorem.sentence(),
    status,
    timestamp: new Date().toISOString(),
    path: faker.system.filePath(),
    ...overrides
  }),

  /**
   * Generate large dataset for performance testing
   */
  largeTemplateDataset: (count = 1000) => {
    return Array.from({ length: count }, (_, index) => 
      TestDataGenerators.template({ 
        id: index + 1,
        name: `Template ${index + 1} - ${faker.lorem.words(2)}`
      })
    );
  }
};

// Custom test wrapper for React components
interface TestWrapperProps {
  children: ReactNode;
  initialEntries?: string[];
  queryClient?: QueryClient;
}

const TestWrapper = ({ children, initialEntries = ['/'], queryClient }: TestWrapperProps) => {
  const client = queryClient || new QueryClient({
    defaultOptions: {
      queries: { 
        retry: false,
        cacheTime: 0
      },
      mutations: { 
        retry: false 
      }
    }
  });

  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Enhanced render function with common providers
export function renderWithProviders(
  ui: ReactElement,
  options: RenderOptions & {
    initialEntries?: string[];
    queryClient?: QueryClient;
  } = {}
): RenderResult {
  const { initialEntries, queryClient, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper 
        initialEntries={initialEntries} 
        queryClient={queryClient}
      >
        {children}
      </TestWrapper>
    ),
    ...renderOptions
  });
}

// Test utilities for async operations
export const AsyncTestUtils = {
  
  /**
   * Wait for element to appear with custom timeout
   */
  waitForElement: async (getElement: () => HTMLElement | null, timeout = 5000) => {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      const element = getElement();
      if (element) return element;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Element not found within ${timeout}ms`);
  },

  /**
   * Wait for condition to be true
   */
  waitForCondition: async (condition: () => boolean, timeout = 5000) => {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      if (condition()) return;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  },

  /**
   * Simulate network delay
   */
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Retry operation with backoff
   */
  retryWithBackoff: async <T,>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 100
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          await AsyncTestUtils.delay(delay);
        }
      }
    }
    
    throw lastError!;
  }
};

// Performance testing utilities
export const PerformanceTestUtils = {
  
  /**
   * Measure execution time
   */
  measureTime: async <T,>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await operation();
    const end = performance.now();
    
    return {
      result,
      duration: end - start
    };
  },

  /**
   * Run performance benchmark
   */
  benchmark: async <T,>(
    operation: () => Promise<T>,
    iterations = 10
  ): Promise<{
    average: number;
    min: number;
    max: number;
    median: number;
    results: T[];
    durations: number[];
  }> => {
    const durations: number[] = [];
    const results: T[] = [];

    for (let i = 0; i < iterations; i++) {
      const { result, duration } = await PerformanceTestUtils.measureTime(operation);
      durations.push(duration);
      results.push(result);
    }

    const sortedDurations = [...durations].sort((a, b) => a - b);
    
    return {
      average: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      median: sortedDurations[Math.floor(sortedDurations.length / 2)],
      results,
      durations
    };
  },

  /**
   * Memory usage snapshot
   */
  getMemoryUsage: () => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory;
    }
    
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage();
    }
    
    return null;
  },

  /**
   * Check for memory leaks
   */
  checkMemoryLeak: async (operation: () => Promise<void>, threshold = 1024 * 1024) => {
    const initialMemory = PerformanceTestUtils.getMemoryUsage();
    
    if (!initialMemory) {
      console.warn('Memory usage tracking not available');
      return;
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    await operation();

    // Force garbage collection again
    if (global.gc) {
      global.gc();
    }

    const finalMemory = PerformanceTestUtils.getMemoryUsage();
    const memoryDiff = finalMemory.heapUsed - initialMemory.heapUsed;

    if (memoryDiff > threshold) {
      console.warn(`Potential memory leak detected: ${memoryDiff} bytes`);
    }

    return {
      initialMemory,
      finalMemory,
      difference: memoryDiff,
      leaked: memoryDiff > threshold
    };
  }
};

// Custom Jest matchers
export const customMatchers = {
  
  /**
   * Check if element has specific CSS class
   */
  toHaveClass: (received: Element, className: string) => {
    const pass = received.classList.contains(className);
    return {
      message: () =>
        pass
          ? `expected element not to have class "${className}"`
          : `expected element to have class "${className}"`,
      pass
    };
  },

  /**
   * Check if API response has expected structure
   */
  toMatchAPIResponse: (received: any, expected: any) => {
    const requiredFields = Object.keys(expected);
    const receivedFields = Object.keys(received);
    
    const missingFields = requiredFields.filter(field => !receivedFields.includes(field));
    const pass = missingFields.length === 0;
    
    return {
      message: () =>
        pass
          ? 'expected API response not to match structure'
          : `expected API response to have fields: ${missingFields.join(', ')}`,
      pass
    };
  },

  /**
   * Check if execution time is within expected range
   */
  toCompleteWithin: (received: Promise<any>, maxTime: number) => {
    return PerformanceTestUtils.measureTime(() => received).then(({ duration }) => {
      const pass = duration <= maxTime;
      return {
        message: () =>
          pass
            ? `expected operation to take more than ${maxTime}ms, but took ${duration.toFixed(2)}ms`
            : `expected operation to complete within ${maxTime}ms, but took ${duration.toFixed(2)}ms`,
        pass
      };
    });
  }
};

// Test environment utilities
export const TestEnvironmentUtils = {
  
  /**
   * Check if running in CI environment
   */
  isCI: () => Boolean(process.env.CI),

  /**
   * Check if running in debug mode
   */
  isDebug: () => Boolean(process.env.DEBUG),

  /**
   * Get test environment variables
   */
  getTestEnv: () => ({
    nodeEnv: process.env.NODE_ENV,
    ci: TestEnvironmentUtils.isCI(),
    debug: TestEnvironmentUtils.isDebug(),
    platform: process.platform,
    nodeVersion: process.version
  }),

  /**
   * Skip test in specific environments
   */
  skipInCI: (testFn: () => void, reason?: string) => {
    if (TestEnvironmentUtils.isCI()) {
      it.skip(`skipped in CI${reason ? `: ${reason}` : ''}`, testFn);
    } else {
      testFn();
    }
  },

  /**
   * Run test only in specific environment
   */
  runOnlyInEnv: (env: string, testFn: () => void) => {
    if (process.env.NODE_ENV === env) {
      testFn();
    } else {
      it.skip(`skipped (not in ${env} environment)`, testFn);
    }
  }
};

// Test data persistence utilities
export const TestDataUtils = {
  
  /**
   * Save test data to temporary file
   */
  saveTestData: (data: any, filename: string) => {
    const fs = require('fs');
    const path = require('path');
    
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const filepath = path.join(tempDir, `${filename}.json`);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    
    return filepath;
  },

  /**
   * Load test data from file
   */
  loadTestData: (filename: string) => {
    const fs = require('fs');
    const path = require('path');
    
    const filepath = path.join(__dirname, '../fixtures', `${filename}.json`);
    
    if (fs.existsSync(filepath)) {
      return JSON.parse(fs.readFileSync(filepath, 'utf8'));
    }
    
    return null;
  },

  /**
   * Generate test dataset and save
   */
  generateAndSave: (generator: () => any, count: number, filename: string) => {
    const data = Array.from({ length: count }, generator);
    return TestDataUtils.saveTestData(data, filename);
  }
};

// Export everything
export {
  TestWrapper,
  renderWithProviders as render
};

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveClass(className: string): R;
      toMatchAPIResponse(expected: any): R;
      toCompleteWithin(maxTime: number): R;
    }
  }
}

// Export test categories for organization
export const TEST_CATEGORIES = {
  UNIT: 'unit',
  INTEGRATION: 'integration',
  E2E: 'e2e',
  PERFORMANCE: 'performance',
  ACCESSIBILITY: 'accessibility',
  VISUAL: 'visual',
  SECURITY: 'security'
} as const;

// Export common test timeouts
export const TEST_TIMEOUTS = {
  UNIT: 5000,
  INTEGRATION: 15000,
  E2E: 30000,
  PERFORMANCE: 60000,
  DATABASE: 120000
} as const;