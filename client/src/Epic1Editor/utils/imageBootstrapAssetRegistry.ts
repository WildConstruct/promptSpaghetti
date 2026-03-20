import type { PsgAssetRef } from '@promptscape/core/services/psg';

export type RegistryAsset = {
  id: string;
  name: string;
  type: 'psg';
  metadata: {
    keywords: string[];
    theme?: string;
    mood?: string;
    setting?: string;
    style?: string;
    entities?: string[];
    extractedAt: number;
  };
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function extractComparableLabels(metadata: PsgAssetRef['metadata']): string[] {
  const refs = metadata?.imageBootstrapPreferredComparableRefs;
  if (!Array.isArray(refs)) {
    return [];
  }

  return refs
    .map(ref =>
      typeof ref === 'object' &&
      ref &&
      'label' in ref &&
      typeof ref.label === 'string'
        ? ref.label
        : null
    )
    .filter((label): label is string => Boolean(label));
}

export function toAssetRegistryAssets(assets: PsgAssetRef[]): RegistryAsset[] {
  return assets.map(asset => {
    const comparableLabels = extractComparableLabels(asset.metadata);
    const fixture =
      typeof asset.metadata?.imageBootstrapFixture === 'string'
        ? asset.metadata.imageBootstrapFixture
        : undefined;
    const keywords = Array.from(
      new Set([
        asset.id,
        asset.role || asset.kind,
        ...(asset.tags || []),
        ...asStringArray(asset.metadata?.promptHints),
        ...comparableLabels,
        fixture || '',
        typeof asset.metadata?.notes === 'string' ? asset.metadata.notes : '',
        typeof asset.metadata?.localFileName === 'string'
          ? asset.metadata.localFileName
          : ''
      ].filter(Boolean))
    );

    return {
      id: asset.id,
      name: asset.role || asset.id,
      type: 'psg',
      metadata: {
        keywords,
        theme: fixture,
        entities: comparableLabels,
        extractedAt: Date.now()
      }
    };
  });
}
