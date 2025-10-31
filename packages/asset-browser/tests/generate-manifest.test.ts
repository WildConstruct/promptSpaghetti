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

  it('collects .psg files with title and updatedAt and sorts by title', async () => {
    const tmp = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'psg-'));
    const graphsDir = path.join(tmp, 'graphs');
    await fs.promises.mkdir(graphsDir);
    await fs.promises.writeFile(
      path.join(graphsDir, 'b-forest-path.psg'),
      '{"nodes":[],"edges":[]}'
    );
    await fs.promises.writeFile(
      path.join(graphsDir, 'a-medieval-market.psg'),
      '{"nodes":[],"edges":[]}'
    );
    await fs.promises.writeFile(path.join(graphsDir, 'ignore.txt'), '');

    const entries = await collectGraphEntries(graphsDir);
    expect(Array.isArray(entries)).toBe(true);
    // Should only include two .psg files
    expect(entries.length).toBe(2);
    // Sorted by title asc: Forest Path, Medieval Market
    expect(entries.map((e: any) => e.title)).toEqual(
      ['A Medieval Market', 'B Forest Path'].map(toTitleCase)
    );
    // Has required fields
    for (const e of entries) {
      expect(typeof e.filename).toBe('string');
      expect(typeof e.title).toBe('string');
      expect(typeof e.updatedAt).toBe('string');
      expect(Array.isArray(e.tags)).toBe(true);
    }
  });

  it('returns empty list when directory does not exist', async () => {
    const tmp = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'psg-'));
    const nonExistent = path.join(tmp, 'nope');
    const entries = await collectGraphEntries(nonExistent);
    expect(entries).toEqual([]);
  });
});
