import { parseManifest } from '../src/services/ManifestParser';
import { validateMinimalManifest, validateNpmStyleManifest } from '../src/services/PresetValidator';

describe('Manifest parsing and validation', () => {
  test('validates and parses minimal manifest', () => {
    const minimal = {
      presets: [
        { id: 'wc-basic', path: './wc-basic.psglib', tags: ['writing'], nodeTypes: ['LLM'], thumbnail: 'thumbs/x.png' },
        { id: 'wc-2', path: './wc-2.psglib' },
      ],
    };

    const validated = validateMinimalManifest(minimal);
    expect(validated.presets.length).toBe(2);

    const res = parseManifest(minimal);
    expect(res.type).toBe('minimal');
    expect(res.presets[0]).toMatchObject({ id: 'wc-basic', path: './wc-basic.psglib', tags: ['writing'] });
  });

  test('validates and parses npm-style manifest', () => {
    const npmStyle = {
      name: '@org/preset-library',
      version: '0.1.0',
      presetLibrary: {
        presets: [
          { id: 'wc-basic', path: 'dist/wc-basic.psglib', tags: ['writing'], nodeTypes: ['LLM'], thumbnail: 'dist/thumbs/x.png' },
        ],
      },
    };

    const validated = validateNpmStyleManifest(npmStyle);
    expect(validated.presetLibrary.presets.length).toBe(1);

    const res = parseManifest(npmStyle);
    expect(res.type).toBe('npm-style');
    expect(res.presets[0]).toMatchObject({ id: 'wc-basic', path: 'dist/wc-basic.psglib', tags: ['writing'] });
  });

  test('invalid minimal manifest throws', () => {
    const bad = { presets: [{ path: './missing-id.psglib' }] } as any;
    expect(() => validateMinimalManifest(bad)).toThrow();
  });
});
