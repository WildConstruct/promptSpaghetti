import Fastify from 'fastify';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { localFragmentRoutes } from '../src/routes/localFragments';

describe('localFragmentRoutes', () => {
  let outputRoot: string;

  beforeEach(async () => {
    outputRoot = await mkdtemp(path.join(tmpdir(), 'psg-local-fragments-'));
  });

  afterEach(async () => {
    await rm(outputRoot, { recursive: true, force: true });
  });

  it('writes a PSG fragment into the user fragments folder', async () => {
    const app = Fastify();
    await localFragmentRoutes(app);

    const response = await app.inject({
      method: 'POST',
      url: '/api/local-fragments/save',
      payload: {
        folderPath: outputRoot,
        filename: 'family-dna.psg',
        content: JSON.stringify({
          version: '1.0.0',
          name: 'Family DNA',
          nodes: [],
          edges: []
        })
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      ok: true,
      filename: 'family-dna.psg'
    });
    expect(response.json().savedPath).toContain(
      path.join(outputRoot, 'fragments', 'family-dna.psg')
    );

    const saved = await readFile(
      path.join(outputRoot, 'fragments', 'family-dna.psg'),
      'utf8'
    );
    expect(JSON.parse(saved).name).toBe('Family DNA');

    await app.close();
  });

  it('rejects path traversal filenames', async () => {
    const app = Fastify();
    await localFragmentRoutes(app);

    const response = await app.inject({
      method: 'POST',
      url: '/api/local-fragments/save',
      payload: {
        folderPath: outputRoot,
        filename: '../escape.psg',
        content: '{}'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: 'Invalid local fragment save payload'
    });

    await app.close();
  });

  it('lists saved user fragments with inline PSG content', async () => {
    const app = Fastify();
    await localFragmentRoutes(app);

    await app.inject({
      method: 'POST',
      url: '/api/local-fragments/save',
      payload: {
        folderPath: outputRoot,
        filename: 'family-dna.psg',
        content: JSON.stringify({
          version: '1.0.0',
          name: 'Family DNA',
          nodes: [{ id: 'text-1' }, { id: 'choice-1' }],
          edges: []
        })
      }
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/local-fragments/list?folderPath=${encodeURIComponent(outputRoot)}`
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      ok: true,
      fragments: [
        {
          id: 'user-family-dna',
          name: 'Family DNA',
          file: 'family-dna.psg',
          type: 'MULTI-ASPECT',
          nodes: 2,
          region: 'User Fragments',
          collapsible: true,
          content: JSON.stringify(
            {
              version: '1.0.0',
              name: 'Family DNA',
              nodes: [{ id: 'text-1' }, { id: 'choice-1' }],
              edges: []
            },
            null,
            2
          )
        }
      ]
    });

    await app.close();
  });
});
