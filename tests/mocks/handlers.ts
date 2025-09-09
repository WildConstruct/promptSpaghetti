/**
 * MSW Request Handlers for API Mocking
 *
 * Centralized request handlers for all API endpoints used in testing.
 * Provides realistic API responses with proper status codes and data structures.
 */

import { rest } from 'msw';
import { templateHandlers } from './template-handlers';
import { authHandlers } from './auth-handlers';
import { userHandlers } from './user-handlers';
import { categoryHandlers } from './category-handlers';
import { analyticsHandlers } from './analytics-handlers';

// Combine all handlers
export const handlers = [
  // Template API endpoints
  ...templateHandlers,

  // Authentication endpoints
  ...authHandlers,

  // User management endpoints
  ...userHandlers,

  // Category management endpoints
  ...categoryHandlers,

  // Analytics endpoints
  ...analyticsHandlers,

  // Health check endpoint
  rest.get('/api/health', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      })
    );
  }),

  // Fallback handler for unhandled requests
  rest.all('*', (req, res, ctx) => {
    console.warn(`Unhandled ${req.method} request to ${req.url.href}`);
    return res(
      ctx.status(404),
      ctx.json({
        error: 'Not Found',
        message: `No handler found for ${req.method} ${req.url.pathname}`,
        path: req.url.pathname
      })
    );
  })
];

// Export individual handler groups for selective mocking
export {
  templateHandlers,
  authHandlers,
  userHandlers,
  categoryHandlers,
  analyticsHandlers
};
