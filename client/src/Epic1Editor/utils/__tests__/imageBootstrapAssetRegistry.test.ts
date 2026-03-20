import { toAssetRegistryAssets } from '../imageBootstrapAssetRegistry';

describe('toAssetRegistryAssets', () => {
  it('maps persisted bootstrap fixture and comparable metadata into searchable registry keywords', () => {
    const result = toAssetRegistryAssets([
      {
        id: 'prop-1',
        kind: 'reference-still',
        role: 'hero-prop',
        storage: {
          provider: 'local',
          uri: 'file://prop-1.png',
          contentType: 'image/png'
        },
        provenance: {
          source: 'upload'
        },
        tags: ['venue', 'rusted'],
        metadata: {
          imageBootstrapFixture: 'hero-prop-venue',
          imageBootstrapPreferredComparableRefs: [
            {
              id: 'comp-1',
              label: 'rusted venue prop fragment'
            }
          ],
          notes: 'keep the venue wear family'
        }
      }
    ]);

    expect(result).toEqual([
      expect.objectContaining({
        id: 'prop-1',
        name: 'hero-prop',
        type: 'psg',
        metadata: expect.objectContaining({
          theme: 'hero-prop-venue',
          entities: ['rusted venue prop fragment'],
          keywords: expect.arrayContaining([
            'prop-1',
            'hero-prop',
            'venue',
            'rusted',
            'hero-prop-venue',
            'rusted venue prop fragment',
            'keep the venue wear family'
          ])
        })
      })
    ]);
  });
});
