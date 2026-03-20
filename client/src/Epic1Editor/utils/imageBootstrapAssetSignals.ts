import type {
  PsgAssetRef,
  PsgComparableMatch,
  PsgReviewCheckpoint
} from '@promptscape/core/services/psg';

type AssetBootstrapMetadata = {
  imageBootstrapFixture?: string;
  imageBootstrapFixtureSelectionMode?: 'explicit' | 'heuristic' | 'derived';
  imageBootstrapBootstrapMode?: string;
  imageBootstrapPreferredComparableRefs?: Array<{
    id: string;
    label: string;
    origin: PsgComparableMatch['origin'];
    score: number;
    sourceRef?: string;
  }>;
};

function getPreferredComparableRefs(
  checkpoint: PsgReviewCheckpoint
): AssetBootstrapMetadata['imageBootstrapPreferredComparableRefs'] {
  const preferredIds = new Set(
    checkpoint.guidance?.preferredComparableMatchIds ?? []
  );

  return checkpoint.comparableMatches
    .filter(match => preferredIds.has(match.id))
    .map(match => ({
      id: match.id,
      label: match.label,
      origin: match.origin,
      score: match.score,
      sourceRef: match.sourceRef
    }));
}

export function applyImageBootstrapSignalsToAssets(
  assets: PsgAssetRef[],
  checkpoint: PsgReviewCheckpoint
): PsgAssetRef[] {
  if (assets.length === 0 || checkpoint.analyses.length === 0) {
    return assets;
  }

  const preferredComparableRefs = getPreferredComparableRefs(checkpoint);
  const analysisByAssetId = new Map(
    checkpoint.analyses.map(analysis => [analysis.assetId, analysis] as const)
  );

  return assets.map(asset => {
    const analysis = analysisByAssetId.get(asset.id);
    if (!analysis) {
      return asset;
    }

    const metadata: Record<string, unknown> = {
      ...(asset.metadata || {})
    };
    const bootstrapMetadata: AssetBootstrapMetadata = {
      imageBootstrapBootstrapMode: checkpoint.bootstrapMode
    };

    if (preferredComparableRefs.length > 0) {
      bootstrapMetadata.imageBootstrapPreferredComparableRefs =
        preferredComparableRefs;
    }

    if (analysis.analysisSource?.fixtureId) {
      bootstrapMetadata.imageBootstrapFixtureSelectionMode =
        analysis.analysisSource.selectionMode;
      if (analysis.analysisSource.selectionMode === 'explicit') {
        bootstrapMetadata.imageBootstrapFixture =
          analysis.analysisSource.fixtureId;
      }
    }

    return {
      ...asset,
      metadata: {
        ...metadata,
        ...bootstrapMetadata
      }
    };
  });
}
