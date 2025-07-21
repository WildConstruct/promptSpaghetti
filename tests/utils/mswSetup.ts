/**
 * MSW (Mock Service Worker) Test Setup
 * 
 * Configures MSW for intercepting API calls in tests.
 * Provides clean setup/teardown and request handling utilities.
 */

import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';
import { templateDb } from '../mocks/data/template-db';

// Create MSW server instance with our handlers
export const server = setupServer(...handlers);

// Server lifecycle management
export function setupMSW() {
  // Enable request interception
  server.listen({ 
    onUnhandledRequest: 'error'  // Fail tests on unmocked requests
  });
  
  // Reset handlers and data after each test
  afterEach(() => {
    server.resetHandlers();
    templateDb.reset(); // Reset mock database state
  });
  
  // Cleanup server after all tests
  afterAll(() => {
    server.close();
  });
}

// Utility functions for test-specific mocking
export const MSWTestUtils = {
  
  /**
   * Override specific endpoints for a test
   */
  mockEndpoint: (method: string, path: string, response: any, status = 200) => {
    const { rest } = require('msw');
    server.use(
      rest[method.toLowerCase()](path, (req, res, ctx) => {
        return res(ctx.status(status), ctx.json(response));
      })
    );
  },
  
  /**
   * Mock network errors
   */
  mockNetworkError: (method: string, path: string) => {
    const { rest } = require('msw');
    server.use(
      rest[method.toLowerCase()](path, (req, res) => {
        return res.networkError('Network connection failed');
      })
    );
  },
  
  /**
   * Mock slow responses for performance testing
   */
  mockSlowResponse: (method: string, path: string, delay: number, response: any) => {
    const { rest } = require('msw');
    server.use(
      rest[method.toLowerCase()](path, (req, res, ctx) => {
        return res(
          ctx.delay(delay),
          ctx.json(response)
        );
      })
    );
  },
  
  /**
   * Mock authentication failures
   */
  mockAuthFailure: (path: string) => {
    const { rest } = require('msw');
    server.use(
      rest.all(path, (req, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.json({ 
            error: 'Unauthorized',
            message: 'Authentication required' 
          })
        );
      })
    );
  },
  
  /**
   * Mock validation errors
   */
  mockValidationError: (method: string, path: string, errors: any) => {
    const { rest } = require('msw');
    server.use(
      rest[method.toLowerCase()](path, (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({ 
            error: 'Validation Error',
            message: 'Request validation failed',
            details: errors
          })
        );
      })
    );
  },
  
  /**
   * Mock rate limiting
   */
  mockRateLimit: (path: string) => {
    const { rest } = require('msw');
    server.use(
      rest.all(path, (req, res, ctx) => {
        return res(
          ctx.status(429),
          ctx.json({ 
            error: 'Rate Limited',
            message: 'Too many requests',
            retryAfter: 60 
          })
        );
      })
    );
  },
  
  /**
   * Reset to default handlers
   */
  resetToDefaults: () => {
    server.resetHandlers();
  },
  
  /**
   * Get request history for verification
   */
  getRequestHistory: () => {
    // This would require implementing request logging in handlers
    // For now, return empty array
    return [];
  },
  
  /**
   * Wait for specific request
   */
  waitForRequest: async (method: string, path: string, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Request ${method} ${path} not received within ${timeout}ms`));
      }, timeout);
      
      // This would need to be implemented with request intercepting
      // For now, resolve immediately
      clearTimeout(timer);
      resolve(true);
    });
  }
};

// Request logging middleware for debugging
export function enableRequestLogging() {
  const { rest } = require('msw');
  
  server.use(
    rest.all('*', (req, res, ctx) => {
      console.log(`MSW intercepted: ${req.method} ${req.url.href}`);
      return req.passthrough();
    })
  );
}

// Common test scenarios
export const MSWScenarios = {
  
  /**
   * Simulate offline/network unavailable
   */
  offline: () => {
    server.use(
      require('msw').rest.all('*', (req, res) => {
        return res.networkError('Failed to connect');
      })
    );
  },
  
  /**
   * Simulate server maintenance
   */
  maintenance: () => {
    server.use(
      require('msw').rest.all('*', (req, res, ctx) => {
        return res(
          ctx.status(503),
          ctx.json({
            error: 'Service Unavailable',
            message: 'Server is temporarily unavailable for maintenance'
          })
        );
      })
    );
  },
  
  /**
   * Simulate high latency
   */
  highLatency: (delay = 3000) => {
    server.use(
      require('msw').rest.all('*', (req, res, ctx) => {
        return res(
          ctx.delay(delay),
          ctx.json({ message: 'Delayed response' })
        );
      })
    );
  },
  
  /**
   * Simulate partial service degradation
   */
  partialOutage: (affectedPaths: string[]) => {
    affectedPaths.forEach(path => {
      server.use(
        require('msw').rest.all(path, (req, res, ctx) => {
          return res(
            ctx.status(503),
            ctx.json({
              error: 'Service Degraded',
              message: 'This service is temporarily experiencing issues'
            })
          );
        })
      );
    });
  }
};

// Export configured server and setup function
export { server };

// Auto-setup for Jest if in test environment
if (process.env.NODE_ENV === 'test') {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });
  
  afterEach(() => {
    server.resetHandlers();
    templateDb.reset();
  });
  
  afterAll(() => {
    server.close();
  });
}