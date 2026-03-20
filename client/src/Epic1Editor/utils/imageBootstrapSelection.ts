import type { Node } from 'reactflow';
import type { PsgReviewCheckpoint } from '@promptscape/core/services/psg';

type PreferredComparableRef = {
  id: string;
  label?: string;
  origin?: string;
  score?: number;
  sourceRef?: string;
  reasonCodes?: string[];
};

type AnalysisSource = {
  assetId: string;
  fixtureId?: string;
  selectionMode?: 'explicit' | 'heuristic' | 'derived';
};

export type ImageBootstrapSelectionSummary = {
  bootstrapGroupId: string;
  bootstrapMode?: string;
  assetIds: string[];
  analysisSources: AnalysisSource[];
  reviewCheckpoint?: PsgReviewCheckpoint;
  preferredComparableRefs: PreferredComparableRef[];
  forceSynthesisKeys: string[];
  lockedTraitKeys: string[];
  variableTraitKeys: string[];
  notes?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function getImageBootstrapSelectionSummary(
  nodes: Node[]
): ImageBootstrapSelectionSummary | null {
  const bootstrapNodes = nodes.filter(node => {
    if (!node.selected || !isRecord(node.data)) {
      return false;
    }
    return node.data.bootstrapInserted === true;
  });

  if (bootstrapNodes.length === 0) {
    return null;
  }

  const groupId =
    bootstrapNodes.find(node => isRecord(node.data))?.data?.bootstrapGroupId;
  if (typeof groupId !== 'string' || groupId.length === 0) {
    return null;
  }

  const preferredComparableRefs = bootstrapNodes.flatMap(node => {
    const refs = isRecord(node.data)
      ? node.data.preferredComparableRefs
      : undefined;
    return Array.isArray(refs) ? refs.filter(isRecord) : [];
  });

  const dedupedComparables = Array.from(
    new Map(
      preferredComparableRefs
        .filter(ref => typeof ref.id === 'string' && ref.id.length > 0)
        .map(ref => [ref.id, ref as PreferredComparableRef])
    ).values()
  );

  const analysisSources = Array.from(
    new Map(
      bootstrapNodes
        .flatMap(node => {
          const sources = isRecord(node.data) ? node.data.analysisSources : undefined;
          return Array.isArray(sources) ? sources.filter(isRecord) : [];
        })
        .filter(
          source =>
            typeof source.assetId === 'string' && source.assetId.length > 0
        )
        .map(source => [
          `${source.assetId}:${typeof source.fixtureId === 'string' ? source.fixtureId : ''}:${typeof source.selectionMode === 'string' ? source.selectionMode : ''}`,
          source as AnalysisSource
        ])
    ).values()
  );

  const reviewCheckpoint = bootstrapNodes.find(node => {
    return isRecord(node.data) && isRecord(node.data.reviewCheckpoint);
  })?.data?.reviewCheckpoint as PsgReviewCheckpoint | undefined;

  const forceSynthesisKeys = Array.from(
    new Set(
      bootstrapNodes.flatMap(node => {
        const keys = isRecord(node.data) ? node.data.forceSynthesisKeys : undefined;
        return Array.isArray(keys)
          ? keys.filter((value): value is string => typeof value === 'string')
          : [];
      })
    )
  );

  const lockedTraitKeys = Array.from(
    new Set(
      bootstrapNodes.flatMap(node => {
        const keys = isRecord(node.data) ? node.data.lockedTraitKeys : undefined;
        return Array.isArray(keys)
          ? keys.filter((value): value is string => typeof value === 'string')
          : [];
      })
    )
  );

  const variableTraitKeys = Array.from(
    new Set(
      bootstrapNodes.flatMap(node => {
        const keys = isRecord(node.data) ? node.data.variableTraitKeys : undefined;
        return Array.isArray(keys)
          ? keys.filter((value): value is string => typeof value === 'string')
          : [];
      })
    )
  );

  const bootstrapMode = bootstrapNodes.find(
    node =>
      isRecord(node.data) && typeof node.data.bootstrapMode === 'string'
  )?.data?.bootstrapMode as string | undefined;
  const assetIds = Array.from(
    new Set(
      bootstrapNodes.flatMap(node => {
        const ids = isRecord(node.data) ? node.data.assetIds : undefined;
        return Array.isArray(ids)
          ? ids.filter((value): value is string => typeof value === 'string')
          : [];
      })
    )
  );
  const notes = bootstrapNodes.find(
    node => isRecord(node.data) && typeof node.data.notes === 'string'
  )?.data?.notes as string | undefined;

  return {
    bootstrapGroupId: groupId,
    bootstrapMode,
    assetIds,
    analysisSources,
    reviewCheckpoint,
    preferredComparableRefs: dedupedComparables,
    forceSynthesisKeys,
    lockedTraitKeys,
    variableTraitKeys,
    notes
  };
}
