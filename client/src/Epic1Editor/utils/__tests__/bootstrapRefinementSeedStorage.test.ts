import {
  BOOTSTRAP_REFINEMENT_SEED_STORAGE_KEY,
  readBootstrapRefinementSeedFromStorage,
  writeBootstrapRefinementSeedToStorage
} from '../bootstrapRefinementSeedStorage';

describe('bootstrapRefinementSeedStorage', () => {
  it('round-trips a refinement seed', () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      }
    };

    writeBootstrapRefinementSeedToStorage(storage, {
      bootstrapGroupId: 'bootstrap-group-1',
      bootstrapMode: 'prop-variation',
      assetIds: ['prop-1'],
      analysisSources: [],
      preferredComparableRefs: [
        {
          id: 'comp-1',
          label: 'rusted venue chair'
        }
      ],
      forceSynthesisKeys: ['damage_pattern'],
      lockedTraitKeys: ['world_style'],
      variableTraitKeys: ['damage_pattern'],
      notes: 'Scene preview promoted wall family: rusted venue chair'
    });

    expect(store.has(BOOTSTRAP_REFINEMENT_SEED_STORAGE_KEY)).toBe(true);
    expect(readBootstrapRefinementSeedFromStorage(storage)).toEqual(
      expect.objectContaining({
        bootstrapGroupId: 'bootstrap-group-1',
        forceSynthesisKeys: ['damage_pattern']
      })
    );
  });

  it('clears persisted state when given null', () => {
    const store = new Map<string, string>([
      [BOOTSTRAP_REFINEMENT_SEED_STORAGE_KEY, '{"bootstrapGroupId":"bootstrap-group-1"}']
    ]);
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      }
    };

    writeBootstrapRefinementSeedToStorage(storage, null);

    expect(store.has(BOOTSTRAP_REFINEMENT_SEED_STORAGE_KEY)).toBe(false);
    expect(readBootstrapRefinementSeedFromStorage(storage)).toBeNull();
  });
});
