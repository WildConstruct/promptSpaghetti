import Fastify from 'fastify';
import { registerEnhancedAdminRoutes } from '../src/admin-panel-enhanced';

function basicAuth(password: string): string {
  return `Basic ${Buffer.from(`admin:${password}`).toString('base64')}`;
}

describe('enhanced admin diagnostics', () => {
  const previousEnableAdmin = process.env.ENABLE_ADMIN;
  const previousAdminPassword = process.env.ADMIN_PASSWORD;

  beforeEach(() => {
    process.env.ENABLE_ADMIN = 'true';
    process.env.ADMIN_PASSWORD = 'test-admin-password';
  });

  afterEach(() => {
    if (typeof previousEnableAdmin === 'undefined') {
      delete process.env.ENABLE_ADMIN;
    } else {
      process.env.ENABLE_ADMIN = previousEnableAdmin;
    }

    if (typeof previousAdminPassword === 'undefined') {
      delete process.env.ADMIN_PASSWORD;
    } else {
      process.env.ADMIN_PASSWORD = previousAdminPassword;
    }
  });

  it('runs real parser diagnostics instead of a not-implemented placeholder', async () => {
    const app = Fastify();
    await registerEnhancedAdminRoutes(app);

    const response = await app.inject({
      method: 'POST',
      url: '/admin/test-feature',
      headers: {
        authorization: basicAuth('test-admin-password')
      },
      payload: {
        feature: 'parse',
        prompt: 'A {driver|mechanic} watches the Indy 500 from the grandstand',
        model: 'openai/gpt-4o-mini'
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      success: true,
      feature: 'parse',
      result: {
        mode: 'heuristic-parse-v1',
        summary: {
          choiceGroupCount: 1
        },
        choiceGroups: [
          {
            placeholder: '{driver|mechanic}',
            options: ['driver', 'mechanic']
          }
        ]
      }
    });

    await app.close();
  });

  it('rejects unknown admin diagnostics clearly', async () => {
    const app = Fastify();
    await registerEnhancedAdminRoutes(app);

    const response = await app.inject({
      method: 'POST',
      url: '/admin/test-feature',
      headers: {
        authorization: basicAuth('test-admin-password')
      },
      payload: {
        feature: 'unknown',
        prompt: 'A prompt'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      success: false,
      error: 'Unknown admin feature diagnostic'
    });

    await app.close();
  });
});
