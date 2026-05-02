import Fastify from 'fastify';
import { localImageRoutes } from '../src/routes/localImage';

describe('localImageRoutes', () => {
  async function buildApp(serviceOverrides?: Record<string, unknown>) {
    const app = Fastify();
    const service = {
      getStatus: jest.fn(() => ({
        ok: true,
        provider: 'comfy-local',
        available: false,
        reason: 'Local sandbox generation is disabled.',
        apiUrl: 'http://127.0.0.1:8188',
        outputDir: 'C:/tmp/local-image',
        defaultCount: 20,
        maxCount: 20
      })),
      generateBatch: jest.fn(),
      readGeneratedFile: jest.fn(),
      ...serviceOverrides
    };

    await localImageRoutes(app, service as never);
    return { app, service };
  }

  it('returns local runtime status', async () => {
    const { app } = await buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/local-image/status'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      provider: 'comfy-local',
      available: false,
      defaultCount: 20,
      maxCount: 20
    });

    await app.close();
  });

  it('rejects invalid batch payloads', async () => {
    const { app } = await buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/local-image/batch',
      payload: {
        prompt: '',
        count: 21
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: 'Invalid local image batch payload'
    });

    await app.close();
  });

  it('surfaces local runtime availability issues as 503 responses', async () => {
    const { app } = await buildApp({
      getStatus: jest.fn(() => ({
        ok: true,
        provider: 'comfy-local',
        available: false,
        reason: 'Local sandbox generation needs LOCAL_IMAGE_COMFY_CHECKPOINT set.',
        apiUrl: 'http://127.0.0.1:8188',
        outputDir: 'C:/tmp/local-image',
        defaultCount: 20,
        maxCount: 20
      })),
      generateBatch: jest.fn(async () => {
        throw new Error(
          'Local sandbox generation needs LOCAL_IMAGE_COMFY_CHECKPOINT set.'
        );
      })
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/local-image/batch',
      payload: {
        prompt: 'oak tree archetype',
        count: 20
      }
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: 'Local sandbox generation needs LOCAL_IMAGE_COMFY_CHECKPOINT set.'
    });

    await app.close();
  });

  it('returns generated batch metadata for a local tree run', async () => {
    const { app, service } = await buildApp({
      getStatus: jest.fn(() => ({
        ok: true,
        provider: 'comfy-local',
        available: true,
        apiUrl: 'http://127.0.0.1:8188',
        outputDir: 'C:/tmp/local-image',
        defaultCount: 20,
        maxCount: 20
      })),
      generateBatch: jest.fn(async () => ({
        ok: true,
        provider: 'comfy-local',
        runId: 'local-image-tree-123',
        outputDir: 'C:/tmp/local-image/local-image-tree-123',
        manifestPath: 'C:/tmp/local-image/local-image-tree-123/manifest.json',
        prompt:
          'oak tree archetype, shared trunk DNA, documentary still, natural light',
        count: 20,
        items: [
          {
            index: 0,
            seed: 1200,
            prompt:
              'oak tree archetype, shared trunk DNA, documentary still, natural light',
            provider: 'comfy-local',
            filename: '01-seed-1200.png',
            outputPath:
              'C:/tmp/local-image/local-image-tree-123/01-seed-1200.png',
            downloadUrl:
              '/api/local-image/files/local-image-tree-123/01-seed-1200.png'
          },
          {
            index: 1,
            seed: 1201,
            prompt:
              'oak tree archetype, shared trunk DNA, documentary still, natural light',
            provider: 'comfy-local',
            filename: '02-seed-1201.png',
            outputPath:
              'C:/tmp/local-image/local-image-tree-123/02-seed-1201.png',
            downloadUrl:
              '/api/local-image/files/local-image-tree-123/02-seed-1201.png'
          }
        ]
      }))
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/local-image/batch',
      payload: {
        prompt:
          'oak tree archetype, shared trunk DNA, documentary still, natural light',
        count: 20,
        startSeed: 1200,
        labelPrefix: 'tree-family-demo'
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      provider: 'comfy-local',
      manifestPath: 'C:/tmp/local-image/local-image-tree-123/manifest.json',
      count: 20,
      items: [
        expect.objectContaining({ index: 0, seed: 1200 }),
        expect.objectContaining({ index: 1, seed: 1201 })
      ]
    });
    expect(service.generateBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        count: 20,
        startSeed: 1200,
        labelPrefix: 'tree-family-demo'
      })
    );

    await app.close();
  });

  it('serves generated image files back to the browser', async () => {
    const { app } = await buildApp({
      readGeneratedFile: jest.fn(async () => Buffer.from('png-data'))
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/local-image/files/tree-run/01-seed-1200.png'
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('image/png');
    expect(response.body).toBe('png-data');

    await app.close();
  });
});
