/**
 * Mock Service Worker (MSW) utilities shared by unit and integration tests.
 */

import { setupServer } from 'msw/node';
import { rest, RestHandler, RestRequest } from 'msw';
import { handlers } from '../mocks/handlers';
import { templateDb } from '../mocks/data/template-db';

type HttpMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'patch'
  | 'delete'
  | 'head'
  | 'options';

type Resolver = Parameters<typeof rest.get>[1];

type HandlerFactory = (path: string, resolver: Resolver) => RestHandler<RestRequest<unknown>>;

const methodMap: Record<HttpMethod, HandlerFactory> = {
  get: rest.get,
  post: rest.post,
  put: rest.put,
  patch: rest.patch,
  delete: rest.delete,
  head: rest.head,
  options: rest.options
};

function resolveMethod(method: string): HandlerFactory {
  const normalised = method.toLowerCase() as HttpMethod;
  const handler = methodMap[normalised];

  if (!handler) {
    throw new Error(`Unsupported HTTP method supplied to MSW helper: ${method}`);
  }

  return handler;
}

export const server = setupServer(...handlers);
let isServerListening = false;

export function setupMSW(): void {
  if (!isServerListening) {
    server.listen({ onUnhandledRequest: 'error' });
    isServerListening = true;
  }

  afterEach(() => {
    server.resetHandlers();
    templateDb.reset();
  });

  afterAll(() => {
    server.close();
    isServerListening = false;
  });
}

export const requestMocking = {
  mockJsonResponse<T>(method: string, path: string, payload: T, status = 200): void {
    const handlerFactory = resolveMethod(method);
    server.use(
      handlerFactory(path, (_req, res, ctx) => res(ctx.status(status), ctx.json(payload)))
    );
  },

  mockNetworkError(method: string, path: string, message = 'Network connection failed'): void {
    const handlerFactory = resolveMethod(method);
    server.use(
      handlerFactory(path, (_req, res) => res.networkError(message))
    );
  },

  mockSlowResponse<T>(method: string, path: string, delayMs: number, payload: T): void {
    const handlerFactory = resolveMethod(method);
    server.use(
      handlerFactory(path, (_req, res, ctx) => res(ctx.delay(delayMs), ctx.json(payload)))
    );
  },

  mockAuthFailure(path: string): void {
    server.use(
      rest.all(path, (_req, res, ctx) =>
        res(
          ctx.status(401),
          ctx.json({
            error: 'Unauthorized',
            message: 'Authentication required'
          })
        )
      )
    );
  },

  mockValidationError(method: string, path: string, errors: Record<string, string[]>): void {
    const handlerFactory = resolveMethod(method);
    server.use(
      handlerFactory(path, (_req, res, ctx) =>
        res(
          ctx.status(400),
          ctx.json({
            error: 'Validation Error',
            message: 'Request validation failed',
            details: errors
          })
        )
      )
    );
  },

  mockRateLimit(path: string, retryAfterSeconds = 60): void {
    server.use(
      rest.all(path, (_req, res, ctx) =>
        res(
          ctx.status(429),
          ctx.json({
            error: 'Rate Limited',
            message: 'Too many requests',
            retryAfter: retryAfterSeconds
          })
        )
      )
    );
  },

  resetToDefaults(): void {
    server.resetHandlers(...handlers);
    templateDb.reset();
  }
};

export function enableRequestLogging(): void {
  server.use(
    rest.all('*', (req) => {
      // eslint-disable-next-line no-console
      console.log(`MSW intercepted: ${req.method} ${req.url.href}`);
      return req.passthrough();
    })
  );
}

export const scenarioMocks = {
  maintenance(): void {
    server.use(
      rest.all('*', (_req, res, ctx) =>
        res(
          ctx.status(503),
          ctx.json({
            error: 'Service Unavailable',
            message: 'Server is temporarily unavailable for maintenance'
          })
        )
      )
    );
  },

  highLatency(delayMs = 3000): void {
    server.use(
      rest.all('*', (_req, res, ctx) =>
        res(ctx.delay(delayMs), ctx.json({ message: 'Delayed response' }))
      )
    );
  },

  partialOutage(paths: string[]): void {
    paths.forEach((routePath) => {
      server.use(
        rest.all(routePath, (_req, res, ctx) =>
          res(
            ctx.status(503),
            ctx.json({
              error: 'Service Degraded',
              message: 'This service is temporarily experiencing issues'
            })
          )
        )
      );
    });
  }
};

if (process.env.NODE_ENV === 'test') {
  beforeAll(() => {
    if (!isServerListening) {
      server.listen({ onUnhandledRequest: 'error' });
      isServerListening = true;
    }
  });

  afterEach(() => {
    server.resetHandlers();
    templateDb.reset();
  });

  afterAll(() => {
    server.close();
    isServerListening = false;
  });
}
