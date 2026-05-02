import { LocalImageSandboxService } from '../src/services/LocalImageSandboxService';

describe('LocalImageSandboxService.getStatus', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.LOCAL_IMAGE_OUTPUT_DIR;
    delete process.env.LOCAL_IMAGE_COMFY_API_URL;
    delete process.env.LOCAL_IMAGE_COMFY_CHECKPOINT;
    delete process.env.ENABLE_LOCAL_IMAGE_SANDBOX;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('reports disabled state honestly', async () => {
    process.env.ENABLE_LOCAL_IMAGE_SANDBOX = 'false';
    process.env.LOCAL_IMAGE_OUTPUT_DIR = '.local-output/local-image-sandbox-test';

    const service = new LocalImageSandboxService({
      fetchImpl: jest.fn()
    });
    const status = await service.getStatus();

    expect(status).toMatchObject({
      available: false,
      runtimeReachable: false,
      checkpointStatus: 'unknown'
    });
    expect(status.reason).toContain('ENABLE_LOCAL_IMAGE_SANDBOX=true');
  });

  it('reports unreachable Comfy runtime distinctly', async () => {
    process.env.ENABLE_LOCAL_IMAGE_SANDBOX = 'true';
    process.env.LOCAL_IMAGE_COMFY_CHECKPOINT = 'flux1-schnell-fp8.safetensors';
    process.env.LOCAL_IMAGE_OUTPUT_DIR = '.local-output/local-image-sandbox-test';

    const fetchImpl = jest.fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>(
      async () => {
        throw new Error('connect ECONNREFUSED 127.0.0.1:8188');
      }
    );
    const service = new LocalImageSandboxService({
      fetchImpl
    });
    const status = await service.getStatus();

    expect(status).toMatchObject({
      available: false,
      runtimeReachable: false,
      checkpointStatus: 'unknown',
      checkpoint: 'flux1-schnell-fp8.safetensors'
    });
    expect(status.reason).toContain('unreachable');
    expect(status.lastError).toContain('ECONNREFUSED');
  });

  it('reports checkpoint mismatch when the pinned checkpoint is missing', async () => {
    process.env.ENABLE_LOCAL_IMAGE_SANDBOX = 'true';
    process.env.LOCAL_IMAGE_COMFY_CHECKPOINT = 'flux1-schnell-fp8.safetensors';
    process.env.LOCAL_IMAGE_OUTPUT_DIR = '.local-output/local-image-sandbox-test';

    const fetchImpl = jest
      .fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ devices: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          input: {
            required: {
              ckpt_name: [['dreamshaper.safetensors', 'juggernaut.safetensors']]
            }
          }
        })
      });

    const service = new LocalImageSandboxService({
      fetchImpl
    });
    const status = await service.getStatus();

    expect(status).toMatchObject({
      available: false,
      runtimeReachable: true,
      checkpointStatus: 'mismatch'
    });
    expect(status.reason).toContain('pinned checkpoint');
    expect(status.reason).toContain('dreamshaper.safetensors');
  });

  it('reports ready when Comfy is reachable and the pinned checkpoint exists', async () => {
    process.env.ENABLE_LOCAL_IMAGE_SANDBOX = 'true';
    process.env.LOCAL_IMAGE_COMFY_CHECKPOINT = 'flux1-schnell-fp8.safetensors';
    process.env.LOCAL_IMAGE_OUTPUT_DIR = '.local-output/local-image-sandbox-test';

    const fetchImpl = jest
      .fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ devices: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          input: {
            required: {
              ckpt_name: [['flux1-schnell-fp8.safetensors', 'dreamshaper.safetensors']]
            }
          }
        })
      });

    const service = new LocalImageSandboxService({
      fetchImpl
    });
    const status = await service.getStatus();

    expect(status).toMatchObject({
      available: true,
      runtimeReachable: true,
      checkpointStatus: 'ready',
      checkpoint: 'flux1-schnell-fp8.safetensors',
      outputDirWritable: true
    });
    expect(status.reason).toBeUndefined();
  });
});
