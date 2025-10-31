/**
 * Comprehensive utilities shared across the test suite.
 */

import fs from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';
import { expect } from '@jest/globals';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import React, { type ReactElement, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface TestTemplate {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  tags: string[];
  authorId: number;
  version: string;
  isPublic: boolean;
  graphData: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

interface TestUser {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

interface TestGraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    value?: string;
    config?: Record<string, unknown>;
  };
}

interface TestGraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated: boolean;
}

interface TestApiError {
  error: string;
  message: string;
  status: number;
  timestamp: string;
  path: string;
  [key: string]: unknown;
}

const randomBoolean = (): boolean => faker.datatype.boolean();

export const TestDataGenerators = {
  template(overrides: Partial<TestTemplate> = {}): TestTemplate {
    return {
      id: faker.number.int({ min: 1, max: 10000 }),
      name: faker.lorem.words({ min: 2, max: 4 }),
      description: faker.lorem.paragraph(),
      categoryId: faker.number.int({ min: 1, max: 5 }),
      tags: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => faker.word.noun()),
      authorId: faker.number.int({ min: 1, max: 500 }),
      version: '1.0.0',
      isPublic: randomBoolean(),
      graphData: {
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
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides
    };
  },

  user(overrides: Partial<TestUser> = {}): TestUser {
    return {
      id: faker.number.int({ min: 1, max: 10000 }),
      email: faker.internet.email(),
      username: faker.internet.userName(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      avatar: faker.image.avatar(),
      role: faker.helpers.arrayElement(['user', 'admin', 'moderator'] as const),
      isActive: randomBoolean(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides
    };
  },

  graphNode(overrides: Partial<TestGraphNode> = {}): TestGraphNode {
    return {
      id: faker.string.uuid(),
      type: faker.helpers.arrayElement(['input', 'output', 'process', 'conditional', 'loop']),
      position: {
        x: faker.number.int({ min: 0, max: 1000 }),
        y: faker.number.int({ min: 0, max: 1000 })
      },
      data: {
        label: faker.lorem.words({ min: 1, max: 3 }),
        value: faker.lorem.sentence(),
        config: {
          enabled: randomBoolean(),
          threshold: faker.number.float({ min: 0, max: 1, fractionDigits: 2 })
        }
      },
      ...overrides
    };
  },

  graphEdge(sourceId?: string, targetId?: string, overrides: Partial<TestGraphEdge> = {}): TestGraphEdge {
    return {
      id: faker.string.uuid(),
      source: sourceId ?? faker.string.uuid(),
      target: targetId ?? faker.string.uuid(),
      type: faker.helpers.arrayElement(['default', 'step', 'smoothstep', 'straight']),
      animated: randomBoolean(),
      ...overrides
    };
  },

  apiError(status = 400, overrides: Partial<TestApiError> = {}): TestApiError {
    return {
      error: faker.helpers.arrayElement([
        'Validation Error',
        'Not Found',
        'Unauthorized',
        'Internal Server Error'
      ]),
      message: faker.lorem.sentence(),
      status,
      timestamp: new Date().toISOString(),
      path: faker.system.directoryPath(),
      ...overrides
    };
  },

  largeTemplateDataset(count = 1000): TestTemplate[] {
    return Array.from({ length: count }, (_, index) =>
      TestDataGenerators.template({
        id: index + 1,
        name: `Template ${index + 1}`
      })
    );
  }
};

interface TestWrapperProps {
  children: ReactNode;
  initialEntries?: string[];
  queryClient?: QueryClient;
}

const createQueryClient = (): QueryClient =>
  new QueryClient({
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

export const TestWrapper = ({ children, initialEntries, queryClient }: TestWrapperProps) => {
  const client = queryClient ?? createQueryClient();

  return (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={initialEntries}>
        <React.Fragment>{children}</React.Fragment>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

interface RenderWithProvidersOptions extends RenderOptions {
  initialEntries?: string[];
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  { initialEntries, queryClient, ...renderOptions }: RenderWithProvidersOptions = {}
): RenderResult {
  return render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper initialEntries={initialEntries} queryClient={queryClient}>
        {children}
      </TestWrapper>
    ),
    ...renderOptions
  });
}

export const AsyncTestUtils = {
  async waitForElement(getter: () => HTMLElement | null, timeoutMs = 5000): Promise<HTMLElement> {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      const element = getter();
      if (element) {
        return element;
      }

      await AsyncTestUtils.delay(100);
    }

    throw new Error(`Element not found within ${timeoutMs}ms`);
  },

  async waitForCondition(condition: () => boolean | Promise<boolean>, timeoutMs = 5000): Promise<void> {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      // eslint-disable-next-line no-await-in-loop
      if (await condition()) {
        return;
      }

      await AsyncTestUtils.delay(100);
    }

    throw new Error(`Condition not met within ${timeoutMs}ms`);
  },

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  },

  async retryWithBackoff<T>(operation: () => Promise<T>, maxRetries = 3, baseDelay = 100): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        // eslint-disable-next-line no-await-in-loop
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt === maxRetries) {
          break;
        }

        const delayMs = baseDelay * Math.pow(2, attempt);
        await AsyncTestUtils.delay(delayMs);
      }
    }

    throw lastError ?? new Error('Retry failed without capturing an error instance.');
  }
};

const performanceNow = (): number => {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }

  return Date.now();
};

interface BenchmarkResult<T> {
  average: number;
  min: number;
  max: number;
  median: number;
  results: T[];
  durations: number[];
}

export const PerformanceTestUtils = {
  async measureTime<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performanceNow();
    const result = await operation();
    const duration = performanceNow() - start;

    return { result, duration };
  },

  async benchmark<T>(operation: () => Promise<T>, iterations = 10): Promise<BenchmarkResult<T>> {
    const durations: number[] = [];
    const results: T[] = [];

    for (let i = 0; i < iterations; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const { result, duration } = await PerformanceTestUtils.measureTime(operation);
      durations.push(duration);
      results.push(result);
    }

    const sorted = [...durations].sort((a, b) => a - b);

    return {
      average: durations.reduce((sum, value) => sum + value, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      median: sorted[Math.floor(sorted.length / 2)] ?? 0,
      results,
      durations
    };
  },

  getMemoryUsage(): { heapUsed: number } | null {
    const processRef = globalThis.process as { memoryUsage?: () => { heapUsed: number } } | undefined;
    if (processRef?.memoryUsage) {
      try {
        return processRef.memoryUsage();
      } catch {
        return null;
      }
    }

    return null;
  }
};

export const TestEnvironmentUtils = {
  isCI(): boolean {
    return Boolean(process.env.CI);
  },

  isDebug(): boolean {
    return Boolean(process.env.DEBUG);
  },

  getTestEnv(): Record<string, unknown> {
    return {
      nodeEnv: process.env.NODE_ENV,
      ci: TestEnvironmentUtils.isCI(),
      debug: TestEnvironmentUtils.isDebug(),
      platform: process.platform,
      nodeVersion: process.version
    };
  },

  skipInCI(reason?: string): void {
    if (TestEnvironmentUtils.isCI()) {
      it.skip(`Skipped in CI${reason ? `: ${reason}` : ''}`, () => undefined);
    }
  },

  runOnlyInEnv(env: string, testFn: () => void, reason?: string): void {
    if (process.env.NODE_ENV === env) {
      testFn();
    } else {
      it.skip(reason ?? `Skipped because NODE_ENV !== ${env}`, () => undefined);
    }
  }
};

export const TestDataUtils = {
  saveTestData(data: unknown, filename: string): string {
    const tempDir = path.join(process.cwd(), 'tests/temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filepath = path.join(tempDir, `${filename}.json`);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    return filepath;
  },

  loadTestData<T>(filename: string): T | null {
    const filepath = path.join(process.cwd(), 'tests/fixtures', `${filename}.json`);
    if (!fs.existsSync(filepath)) {
      return null;
    }

    const raw = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(raw) as T;
  },

  generateAndSave(generator: () => unknown, count: number, filename: string): string {
    const dataset = Array.from({ length: count }, generator);
    return TestDataUtils.saveTestData(dataset, filename);
  }
};

const customMatchers = {
  toHaveClass(received: Element, className: string) {
    const pass = received.classList.contains(className);
    return {
      message: () =>
        pass
          ? `expected element not to have class "${className}"`
          : `expected element to have class "${className}"`,
      pass
    };
  },

  toMatchAPIResponse(received: Record<string, unknown>, expected: Record<string, unknown>) {
    const missingFields = Object.keys(expected).filter((key) => !(key in received));
    const pass = missingFields.length === 0;

    return {
      message: () =>
        pass
          ? 'expected API response not to match structure'
          : `expected API response to include fields: ${missingFields.join(', ')}`,
      pass
    };
  },

  async toCompleteWithin<T>(received: Promise<T>, maxTimeMs: number) {
    const start = performanceNow();
    const result = await received;
    const duration = performanceNow() - start;
    const pass = duration <= maxTimeMs;

    return {
      message: () =>
        pass
          ? `expected operation to take longer than ${maxTimeMs}ms, but took ${duration.toFixed(2)}ms`
          : `expected operation to complete within ${maxTimeMs}ms, but took ${duration.toFixed(2)}ms`,
      pass,
      actual: duration,
      expected: maxTimeMs,
      result
    };
  }
};

expect.extend(customMatchers);

declare module '@jest/expect' {
  interface Matchers<R> {
    toHaveClass(className: string): R;
    toMatchAPIResponse(expected: Record<string, unknown>): R;
    toCompleteWithin(maxTime: number): Promise<R>;
  }
}

export const TestCategories = ['unit', 'integration', 'performance', 'e2e', 'smoke'] as const;

export const TestTimeouts = {
  short: 5_000,
  medium: 30_000,
  long: 60_000
} as const;

export { renderWithProviders as render };
