import fs from 'fs';
import os from 'os';
import path from 'path';

let collectGraphEntries: any;
let toTitleCase: any;

beforeAll(async () => {
  const mod: any = await import('../scripts/build/lib.cjs');
  const cjs = mod.default ?? mod;
  collectGraphEntries = cjs.collectGraphEntries;
  toTitleCase = cjs.toTitleCase;
});

describe('generate-graph-manifest helper', () => {
  it('toTitleCase converts filenames nicely', () => {
    expect(toTitleCase('medieval-market')).toBe('Medieval Market');
    expect(toTitleCase('forest_path')).toBe('Forest Path');
    expect(toTitleCase('CityPlaza')).toBe('City Plaza');
  });

  it('skips invalid .psg files lacking nodes/edges', async () => {
    const tmp = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'psg-'));
    const graphsDir = path.join(tmp, 'graphs');
    await fs.promises.mkdir(graphsDir);
    // invalid: no nodes/edges
    await fs.promises.writeFile(
      path.join(graphsDir, 'bad.psg'),
      '{"title":"Bad"}'
    );
    // valid minimal shape
    await fs.promises.writeFile(
      path.join(graphsDir, 'good.psg'),
      '{"nodes":[],"edges":[]}'
    );
    const entries = await collectGraphEntries(graphsDir);
    expect(entries.length).toBe(1);
    expect(entries[0].filename).toBe('good.psg');
  });

  it('collects .psg files deterministically and sorts by title', async () => {
    const tmp = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'psg-'));
    const graphsDir = path.join(tmp, 'graphs');
    await fs.promises.mkdir(graphsDir);
    await fs.promises.writeFile(
      path.join(graphsDir, 'b-forest-path.psg'),
      JSON.stringify({
        kind: 'graph',
        version: '1.0',
        meta: {
          name: 'Forest Path',
          updatedAt: '2024-01-02T03:04:05.000Z'
        },
        graph: { nodes: [], edges: [] }
      })
    );
    await fs.promises.writeFile(
      path.join(graphsDir, 'a-medieval-market.psg'),
      '{"nodes":[],"edges":[]}'
    );
    await fs.promises.writeFile(path.join(graphsDir, 'ignore.txt'), '');

    const filePath = path.join(graphsDir, 'a-medieval-market.psg');
    const firstEntries = await collectGraphEntries(graphsDir);
    await fs.promises.utimes(
      filePath,
      new Date('2026-01-01T00:00:00.000Z'),
      new Date('2026-01-01T00:00:00.000Z')
    );
    const secondEntries = await collectGraphEntries(graphsDir);

    expect(secondEntries).toEqual(firstEntries);

    const entries = firstEntries;
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBe(2);
    expect(entries.map((e: any) => e.title)).toEqual([
      'A Medieval Market',
      'Forest Path'
    ]);
    expect(entries[0].updatedAt).toBeUndefined();
    expect(entries[1].updatedAt).toBe('2024-01-02T03:04:05.000Z');
    expect(Array.isArray(entries[0].tags)).toBe(true);
    expect(Array.isArray(entries[1].tags)).toBe(true);
  });

  it('returns empty list when directory does not exist', async () => {
    const tmp = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'psg-'));
    const nonExistent = path.join(tmp, 'nope');
    const entries = await collectGraphEntries(nonExistent);
    expect(entries).toEqual([]);
  });
});
