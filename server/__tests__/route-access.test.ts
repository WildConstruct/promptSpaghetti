import Fastify from 'fastify';
import { requireRouteAccess } from '../src/utils/routeAccess';

const mockGetSupabaseAuthContext = jest.fn();
const mockConsumeUserQuota = jest.fn();

jest.mock('../src/services/supabase', () => ({
  getSupabaseAuthContext: (...args: unknown[]) =>
    mockGetSupabaseAuthContext(...args)
}));

jest.mock('../src/utils/usageQuota', () => ({
  consumeUserQuota: (...args: unknown[]) => mockConsumeUserQuota(...args)
}));

function createAuthContext(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-1',
    email: 'user-1@example.com',
    appMetadata: {},
    userMetadata: {},
    capabilities: [],
    subscriptionActive: false,
    subscriptionState: 'inactive',
    plan: 'free',
    ...overrides
  };
}

async function buildProtectedApp(
  options: Parameters<typeof requireRouteAccess>[0]
) {
  const app = Fastify();
  const handler = jest.fn(async request => ({
    ok: true,
    userId: request.authUserId ?? null
  }));

  app.post(
    '/protected',
    {
      preHandler: [requireRouteAccess(options)]
    },
    handler
  );

  return { app, handler };
}

describe('requireRouteAccess', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.ENABLE_CLOUD_LLM;
    delete process.env.ENABLE_CLOUD_AGENT;
    delete process.env.ENABLE_CLOUD_PSG;
    delete process.env.REQUIRE_SUBSCRIPTION_FOR_CLOUD;
    delete process.env.ALLOW_ALL_AUTHENTICATED_CLOUD;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('allows public-demo routes without auth or quota checks', async () => {
    const { app, handler } = await buildProtectedApp({
      access: 'public-demo'
    });

    const response = await app.inject({
      method: 'POST',
      url: '/protected'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true, userId: null });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(mockGetSupabaseAuthContext).not.toHaveBeenCalled();
    expect(mockConsumeUserQuota).not.toHaveBeenCalled();

    await app.close();
  });

  it('rejects authenticated routes when bearer auth is missing', async () => {
    const { app, handler } = await buildProtectedApp({
      access: 'authenticated-user',
      capability: 'cloud-agent',
      quotaBucket: 'cloud-agent'
    });

    const response = await app.inject({
      method: 'POST',
      url: '/protected'
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: 'Authentication required' });
    expect(handler).not.toHaveBeenCalled();
    expect(mockConsumeUserQuota).not.toHaveBeenCalled();

    await app.close();
  });

  it('rejects disabled capabilities before auth-dependent work runs', async () => {
    process.env.ENABLE_CLOUD_PSG = 'false';
    const { app, handler } = await buildProtectedApp({
      access: 'authenticated-user',
      capability: 'cloud-psg',
      quotaBucket: 'cloud-psg'
    });

    const response = await app.inject({
      method: 'POST',
      url: '/protected',
      headers: { authorization: 'Bearer valid-token' }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({ error: 'Capability disabled' });
    expect(handler).not.toHaveBeenCalled();
    expect(mockGetSupabaseAuthContext).not.toHaveBeenCalled();
    expect(mockConsumeUserQuota).not.toHaveBeenCalled();

    await app.close();
  });

  it('rejects authenticated users without the required capability', async () => {
    mockGetSupabaseAuthContext.mockResolvedValue(
      createAuthContext({
        capabilities: [],
        subscriptionActive: false,
        subscriptionState: 'inactive',
        plan: 'free'
      })
    );
    const { app, handler } = await buildProtectedApp({
      access: 'authenticated-user',
      capability: 'cloud-agent',
      quotaBucket: 'cloud-agent'
    });

    const response = await app.inject({
      method: 'POST',
      url: '/protected',
      headers: { authorization: 'Bearer valid-token' }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: 'Capability not granted for this account',
      capability: 'cloud-agent',
      plan: 'free',
      subscriptionState: 'inactive'
    });
    expect(handler).not.toHaveBeenCalled();
    expect(mockConsumeUserQuota).not.toHaveBeenCalled();

    await app.close();
  });

  it('allows capable users and records quota before the handler runs', async () => {
    mockGetSupabaseAuthContext.mockResolvedValue(
      createAuthContext({
        capabilities: ['cloud-agent'],
        plan: 'pro'
      })
    );
    mockConsumeUserQuota.mockReturnValue({
      allowed: true,
      limit: 300,
      used: 1,
      remaining: 299,
      resetAt: new Date(Date.now() + 60_000).toISOString(),
      plan: 'pro'
    });
    const { app, handler } = await buildProtectedApp({
      access: 'authenticated-user',
      capability: 'cloud-agent',
      quotaBucket: 'cloud-agent'
    });

    const response = await app.inject({
      method: 'POST',
      url: '/protected',
      headers: { authorization: 'Bearer valid-token' }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true, userId: 'user-1' });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(mockConsumeUserQuota).toHaveBeenCalledWith({
      userId: 'user-1',
      bucket: 'cloud-agent',
      plan: 'pro'
    });

    await app.close();
  });

  it('returns 429 and skips the handler when quota is exhausted', async () => {
    const resetAt = new Date(Date.now() + 60_000).toISOString();
    mockGetSupabaseAuthContext.mockResolvedValue(
      createAuthContext({
        capabilities: ['cloud-psg'],
        plan: 'free'
      })
    );
    mockConsumeUserQuota.mockReturnValue({
      allowed: false,
      limit: 160,
      used: 160,
      remaining: 0,
      resetAt,
      plan: 'free'
    });
    const { app, handler } = await buildProtectedApp({
      access: 'authenticated-user',
      capability: 'cloud-psg',
      quotaBucket: 'cloud-psg'
    });

    const response = await app.inject({
      method: 'POST',
      url: '/protected',
      headers: { authorization: 'Bearer valid-token' }
    });

    expect(response.statusCode).toBe(429);
    expect(response.headers['retry-after']).toBeDefined();
    expect(response.json()).toMatchObject({
      error: 'Daily usage quota exceeded',
      quota: {
        bucket: 'cloud-psg',
        plan: 'free',
        limit: 160,
        used: 160,
        remaining: 0,
        resetAt
      }
    });
    expect(handler).not.toHaveBeenCalled();

    await app.close();
  });
});
