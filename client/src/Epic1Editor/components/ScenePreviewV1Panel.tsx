import React, { useEffect, useState } from 'react';
import {
  ApiPsgClient,
  type PsgDocument,
  type PsgImagePreviewResponse
} from '@promptscape/core/services/psg';
import type { ImageBootstrapSelectionSummary } from '../utils/imageBootstrapSelection';
import {
  getSurfaceBiasedComparableLabel,
  type PlacementSurface
} from '../utils/scenePreviewComparables';
import { getPreviewBackendFingerprint } from '../utils/previewBackendLabel';

export type ScenePlacement = {
  id: string;
  surface: PlacementSurface;
  label: string;
  provenance: string;
  previewSource?: 'cached' | 'fresh';
  sourcePreviewResultId?: string;
  imageUrl?: string;
  prompt?: string;
  seed?: number;
  preferredComparableId?: string;
  preferredComparableLabel?: string;
  preferredComparableLabels?: string[];
  comparableReasonSummary?: string;
  surfaceBiasLabel?: string;
  lockedTraitSummary?: string;
  variableTraitSummary?: string;
  forceSynthesisSummary?: string;
  guidanceNote?: string;
};

type ScenePreviewMode = 'grouped' | 'isolated';

export interface ScenePreviewV1State {
  placements: ScenePlacement[];
  usedCachedPreviewResultIds: string[];
  mode: ScenePreviewMode;
}

interface ScenePreviewV1PanelProps {
  summary: ImageBootstrapSelectionSummary;
  document: PsgDocument;
  psgAccessMode: 'offline' | 'local' | 'cloud';
  hostedUpgradeOperations: string[];
  previewBackendId?: string;
  previewModel?: string;
  cachedPreviewResponse?: PsgImagePreviewResponse | null;
  persistedState?: ScenePreviewV1State | null;
  onPersistedStateChange?: (state: ScenePreviewV1State) => void;
  isHighlighted?: boolean;
  highlightBiasSurface?: 'wall' | 'floor' | 'both' | null;
  externalPopulateRequest?: {
    surface: PlacementSurface;
    requestId: number;
  } | null;
  onPromotePlacement?: (payload: {
    preferredComparableRefId?: string;
    preferredComparableLabel?: string;
    lockedTraitKeys: string[];
    forceSynthesisKeys: string[];
    note?: string;
  }) => void;
}

function deriveFallbackPlacement(
  summary: ImageBootstrapSelectionSummary,
  surface: PlacementSurface,
  index: number
): ScenePlacement {
  const preferred = summary.preferredComparableRefs[index % Math.max(1, summary.preferredComparableRefs.length)];
  if (preferred?.label) {
    return {
      id: `${surface}-${index + 1}`,
      surface,
      label: preferred.label,
      provenance: `comparable:${preferred.id}`
    };
  }

  return {
    id: `${surface}-${index + 1}`,
    surface,
    label: summary.bootstrapMode || `bootstrap-${index + 1}`,
    provenance: summary.analysisSources[0]?.fixtureId || 'graph-derived'
  };
}

function getComparableReasonSummary(
  summary: ImageBootstrapSelectionSummary,
  label: string | undefined
): string | undefined {
  if (!label) {
    return undefined;
  }

  const match = summary.preferredComparableRefs.find(ref => ref.label === label);
  if (!match?.reasonCodes?.length) {
    return undefined;
  }

  return match.reasonCodes.join(', ');
}

function buildFallbackPlacement(
  summary: ImageBootstrapSelectionSummary,
  surface: PlacementSurface,
  index: number
): ScenePlacement {
  const fallback = deriveFallbackPlacement(summary, surface, index);
  return {
    ...fallback,
    label:
      getSurfaceBiasedComparableLabel(summary, surface, index) || fallback.label,
    preferredComparableId:
      summary.preferredComparableRefs[
        index % Math.max(1, summary.preferredComparableRefs.length)
      ]?.id,
    preferredComparableLabel:
      summary.preferredComparableRefs[
        index % Math.max(1, summary.preferredComparableRefs.length)
      ]?.label,
    preferredComparableLabels:
      summary.preferredComparableRefs[
        index % Math.max(1, summary.preferredComparableRefs.length)
      ]?.label
        ? [
            summary.preferredComparableRefs[
              index % Math.max(1, summary.preferredComparableRefs.length)
            ]?.label as string
          ]
        : undefined,
    comparableReasonSummary: getComparableReasonSummary(
      summary,
      summary.preferredComparableRefs[
        index % Math.max(1, summary.preferredComparableRefs.length)
      ]?.label
    ),
    surfaceBiasLabel: getSurfaceBiasedComparableLabel(summary, surface, index),
    lockedTraitSummary: summary.lockedTraitKeys.join(', ') || undefined,
    variableTraitSummary: summary.variableTraitKeys.join(', ') || undefined,
    forceSynthesisSummary: summary.forceSynthesisKeys.join(', ') || undefined,
    guidanceNote: summary.notes || undefined
  };
}

function buildPreviewPlacement(params: {
  summary: ImageBootstrapSelectionSummary;
  surface: PlacementSurface;
  response: Awaited<ReturnType<ApiPsgClient['previewImages']>>;
  result: Awaited<ReturnType<ApiPsgClient['previewImages']>>['preview']['results'][number];
  index: number;
  placementIndex: number;
  mode: ScenePreviewMode;
}): ScenePlacement {
  const { summary, surface, response, result, index, placementIndex, mode } = params;
  const preferredComparableLabels =
    mode === 'grouped'
      ? result?.metadata.preferredComparableLabels || []
      : (result?.metadata.preferredComparableLabels || []).slice(0, 1);
  return {
    id: `${surface}-${placementIndex + 1}`,
    surface,
    sourcePreviewResultId: result?.id,
    label:
      getSurfaceBiasedComparableLabel(summary, surface, placementIndex) ||
      preferredComparableLabels[0] ||
      summary.bootstrapMode ||
      `preview-${placementIndex + 1}`,
    provenance: `${response.preview.backend.id}:${result?.seed ?? 'auto'}`,
    imageUrl: result?.imageUrl,
    prompt: result?.prompt,
    seed: result?.seed,
    preferredComparableId: summary.preferredComparableRefs.find(
      ref => ref.label === preferredComparableLabels[0]
    )?.id,
    preferredComparableLabel: preferredComparableLabels[0],
    preferredComparableLabels,
    comparableReasonSummary: getComparableReasonSummary(
      summary,
      preferredComparableLabels[0]
    ),
    surfaceBiasLabel: getSurfaceBiasedComparableLabel(
      summary,
      surface,
      placementIndex + index
    ),
    lockedTraitSummary: result?.metadata.lockedTraitKeys.join(', ') || undefined,
    variableTraitSummary:
      result?.metadata.variableTraitKeys.join(', ') || undefined,
    forceSynthesisSummary:
      (result?.metadata.forceSynthesisKeys || []).join(', ') || undefined,
    guidanceNote: result?.metadata.guidanceNotes || undefined
  };
}

function getScenePopulateBatchSize(params: {
  requestedBatchSize: number;
  previewBackendId?: string;
  previewProfile?: 'bootstrap' | 'scene';
  mode: ScenePreviewMode;
}): number {
  const { requestedBatchSize, previewBackendId, previewProfile, mode } = params;
  const effectiveProfile =
    previewProfile ||
    (previewBackendId?.includes('scene') ? 'scene' : 'bootstrap');

  return effectiveProfile === 'scene' && mode === 'grouped'
    ? Math.max(requestedBatchSize, 3)
    : requestedBatchSize;
}

export const ScenePreviewV1Panel: React.FC<ScenePreviewV1PanelProps> = ({
  summary,
  document,
  psgAccessMode,
  hostedUpgradeOperations,
  previewBackendId,
  previewModel,
  cachedPreviewResponse,
  persistedState,
  onPersistedStateChange,
  isHighlighted = false,
  highlightBiasSurface,
  externalPopulateRequest,
  onPromotePlacement
}) => {
  const [placements, setPlacements] = useState<ScenePlacement[]>(
    persistedState?.placements || []
  );
  const [usedCachedPreviewResultIds, setUsedCachedPreviewResultIds] = useState<string[]>(
    persistedState?.usedCachedPreviewResultIds || []
  );
  const [isLoadingSurface, setIsLoadingSurface] = useState<PlacementSurface | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [batchSize, setBatchSize] = useState(3);
  const [sceneMode, setSceneMode] = useState<ScenePreviewMode>(
    persistedState?.mode || 'grouped'
  );
  const selectedAssets = document.assets.filter(asset =>
    summary.assetIds.includes(asset.id)
  );

  const grouped = {
    wall: placements.filter(placement => placement.surface === 'wall'),
    floor: placements.filter(placement => placement.surface === 'floor')
  };
  const hasGroupedFamilyPlacements = placements.some(
    placement => (placement.preferredComparableLabels?.length || 0) > 1
  );
  const hasCachedPreviewPlacements = placements.some(
    placement => placement.previewSource === 'cached'
  );
  const hasFreshPreviewPlacements = placements.some(
    placement => placement.previewSource === 'fresh'
  );
  const hasPersistedSceneState =
    (persistedState?.placements.length || 0) > 0 ||
    (persistedState?.usedCachedPreviewResultIds.length || 0) > 0;

  const canUseHostedPreview =
    psgAccessMode === 'cloud' &&
    hostedUpgradeOperations.includes('images-preview') &&
    !!summary.reviewCheckpoint;
  const effectiveSceneBatchSize = getScenePopulateBatchSize({
    requestedBatchSize: batchSize,
    previewBackendId,
    previewProfile: previewBackendId?.includes('scene') ? 'scene' : 'bootstrap',
    mode: sceneMode
  });
  const activePreviewTarget = canUseHostedPreview
    ? getPreviewBackendFingerprint({
        label: previewBackendId || 'default preview backend',
        model: previewModel || undefined,
        profile: previewBackendId?.includes('scene') ? 'scene' : 'bootstrap'
      })
    : null;
  const queuedRefinement =
    typeof summary.notes === 'string' &&
    summary.notes.startsWith('Scene preview promoted');

  useEffect(() => {
    setPlacements(persistedState?.placements || []);
    setUsedCachedPreviewResultIds(persistedState?.usedCachedPreviewResultIds || []);
    setSceneMode(persistedState?.mode || 'grouped');
  }, [summary.bootstrapGroupId, persistedState]);

  useEffect(() => {
    onPersistedStateChange?.({
      placements,
      usedCachedPreviewResultIds,
      mode: sceneMode
    });
  }, [onPersistedStateChange, placements, sceneMode, usedCachedPreviewResultIds]);

  const addPlacement = async (surface: PlacementSurface) => {
    setIsLoadingSurface(surface);
    setError(null);
    try {
      let nextPlacements: ScenePlacement[];

      const reusablePreviewResults =
        canUseHostedPreview &&
        summary.reviewCheckpoint &&
        cachedPreviewResponse &&
        cachedPreviewResponse.preview.results.length > 0
          ? cachedPreviewResponse.preview.results.filter(
              result => !usedCachedPreviewResultIds.includes(result.id)
            )
          : null;

      if (reusablePreviewResults && reusablePreviewResults.length > 0 && cachedPreviewResponse) {
        nextPlacements = reusablePreviewResults
          .slice(0, effectiveSceneBatchSize)
          .map((result, index) =>
            ({
              ...buildPreviewPlacement({
                summary,
                surface,
                response: cachedPreviewResponse,
                result,
                index,
                placementIndex: placements.length + index,
                mode: sceneMode
              }),
              previewSource: 'cached' as const
            })
          );
        setUsedCachedPreviewResultIds(current => [
          ...current,
          ...reusablePreviewResults
            .slice(0, effectiveSceneBatchSize)
            .map(result => result.id)
        ]);
      } else if (canUseHostedPreview && summary.reviewCheckpoint) {
        const client = new ApiPsgClient();
        const response = await client.previewImages(document, summary.reviewCheckpoint, {
          count: effectiveSceneBatchSize,
          backendId: previewBackendId,
          model: previewModel,
          includePromptBlueprint: true
        });
        nextPlacements = response.preview.results.map((result, index) =>
          ({
              ...buildPreviewPlacement({
                summary,
                surface,
                response,
                result,
                index,
                placementIndex: placements.length + index,
                mode: sceneMode
              }),
            previewSource: 'fresh' as const
          })
          );
      } else {
        nextPlacements = Array.from({ length: effectiveSceneBatchSize }, (_, index) =>
          buildFallbackPlacement(summary, surface, placements.length + index)
        );
      }

      setPlacements(current => [...current, ...nextPlacements]);
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : 'Failed to place preview'
      );
    } finally {
      setIsLoadingSurface(null);
    }
  };

  useEffect(() => {
    if (!externalPopulateRequest) {
      return;
    }

    void addPlacement(externalPopulateRequest.surface);
  }, [externalPopulateRequest?.requestId]);

  const rerollPlacement = async (placementId: string) => {
    const target = placements.find(placement => placement.id === placementId);
    if (!target) {
      return;
    }

    setIsLoadingSurface(target.surface);
    setError(null);
    try {
      let replacement: ScenePlacement;

      if (canUseHostedPreview && summary.reviewCheckpoint) {
        const client = new ApiPsgClient();
        const response = await client.previewImages(document, summary.reviewCheckpoint, {
          count: 1,
          backendId: previewBackendId,
          model: previewModel,
          includePromptBlueprint: true
        });
        replacement = buildPreviewPlacement({
          summary,
          surface: target.surface,
          response,
          result: response.preview.results[0],
          index: 0,
          placementIndex: placements.findIndex(placement => placement.id === placementId),
          mode: sceneMode
        });
      } else {
        const placementIndex = placements.findIndex(
          placement => placement.id === placementId
        );
        replacement = buildFallbackPlacement(
          summary,
          target.surface,
          placementIndex + 1
        );
        replacement.id = placementId;
      }

      setPlacements(current =>
        current.map(placement =>
          placement.id === placementId ? { ...replacement, id: placementId } : placement
        )
      );
      if (target.sourcePreviewResultId) {
        setUsedCachedPreviewResultIds(current =>
          current.filter(id => id !== target.sourcePreviewResultId)
        );
      }
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : 'Failed to reroll placement'
      );
    } finally {
      setIsLoadingSurface(null);
    }
  };

  const promotePlacement = (placement: ScenePlacement) => {
    onPromotePlacement?.({
      preferredComparableRefId: placement.preferredComparableId,
      preferredComparableLabel:
        placement.surfaceBiasLabel || placement.preferredComparableLabel,
      lockedTraitKeys: summary.lockedTraitKeys,
      forceSynthesisKeys: (placement.forceSynthesisSummary || '')
        .split(',')
        .map(value => value.trim())
        .filter(Boolean),
      note: [
        `Scene preview promoted ${placement.surface} family: ${
          placement.surfaceBiasLabel ||
          placement.preferredComparableLabel ||
          placement.label
        }`,
        placement.guidanceNote
      ]
        .filter(Boolean)
        .join(' | ')
    });
  };

  return (
    <div
      data-testid="scene-preview-v1-panel"
      style={{
        ...styles.panel,
        ...(isHighlighted ? styles.panelHighlighted : null)
      }}
    >
      <div style={styles.kicker} data-testid="scene-preview-v1-kicker">Scene Preview V1</div>
      <div style={styles.title}>Feature-flagged comprehension surface</div>
      <div style={styles.copy}>
        Click the wall or floor to place graph-backed placeholders using the
        selected bootstrap metadata.
      </div>
      {activePreviewTarget ? (
        <div style={styles.activePreviewTarget}>
          Active scene preview target: {activePreviewTarget}
        </div>
      ) : null}
      <div style={styles.activeSceneMode}>
        Active scene mode: {sceneMode === 'grouped' ? 'grouped families' : 'isolated props'}
      </div>
      {hasGroupedFamilyPlacements && sceneMode === 'grouped' ? (
        <div style={styles.groupedFamilyBanner}>
          Reusing grouped scene preview families
        </div>
      ) : null}
      {queuedRefinement ? (
        <div style={styles.queuedBanner}>
          <div>
            Active refinement bias
            {summary.preferredComparableRefs[0]?.label
              ? `: ${summary.preferredComparableRefs[0].label}`
              : ''}
          </div>
          {summary.lockedTraitKeys.length > 0 ? (
            <div
              style={{
                ...styles.queuedMeta,
                ...(highlightBiasSurface === 'wall' ||
                highlightBiasSurface === 'both'
                  ? styles.queuedMetaHighlighted
                  : null)
              }}
            >
              lock: {summary.lockedTraitKeys.join(', ')}
            </div>
          ) : null}
          {summary.forceSynthesisKeys.length > 0 ? (
            <div
              style={{
                ...styles.queuedMeta,
                ...(highlightBiasSurface === 'floor' ||
                highlightBiasSurface === 'both'
                  ? styles.queuedMetaHighlighted
                  : null)
              }}
            >
              force synth: {summary.forceSynthesisKeys.join(', ')}
            </div>
          ) : null}
        </div>
      ) : null}
      <div style={styles.batchControls}>
        <label style={styles.batchField}>
          <span>Populate count</span>
          <input
            type="number"
            min={1}
            max={4}
            value={batchSize}
            onChange={event =>
              setBatchSize(
                Math.max(1, Math.min(4, Number.parseInt(event.target.value || '1', 10)))
              )
            }
            style={styles.batchInput}
          />
        </label>
        <label style={styles.batchField}>
          <span>Scene mode</span>
          <select
            value={sceneMode}
            onChange={event => setSceneMode(event.target.value as ScenePreviewMode)}
            style={styles.batchInput}
          >
            <option value="grouped">Grouped families</option>
            <option value="isolated">Isolated props</option>
          </select>
        </label>
      </div>
      <div style={styles.referencePanel}>
        <div style={styles.sectionLabel}>Reference Check</div>
        <div style={styles.referenceList}>
          {selectedAssets.length > 0 ? (
            selectedAssets.map(asset => (
              <div key={asset.id} style={styles.referenceCard}>
                <strong>{asset.id}</strong>
                <span>
                  {asset.role || asset.kind}
                </span>
                <span style={styles.referenceUri}>{asset.storage.uri}</span>
              </div>
            ))
          ) : (
            <div style={styles.emptyReference}>No source refs found in the current document.</div>
          )}
        </div>
      </div>
      <div style={styles.viewport}>
        <button
          type="button"
          style={styles.wall}
          onClick={() => void addPlacement('wall')}
          aria-label="Populate wall surface"
        >
          <div style={styles.surfaceLabel}>Wall</div>
          <div style={styles.placementColumn}>
            {grouped.wall.map(placement => (
              <div key={placement.id} style={styles.placementCard}>
                <strong>{placement.label}</strong>
                <span>{placement.provenance}</span>
                {placement.preferredComparableLabels?.length ? (
                  <span style={styles.reasoningLine}>
                    {placement.preferredComparableLabels.length > 1
                      ? `comparables: ${placement.preferredComparableLabels.join(', ')}`
                      : `comparable: ${placement.preferredComparableLabel}`}
                  </span>
                ) : null}
                {placement.surfaceBiasLabel ? (
                  <span style={styles.reasoningLine}>
                    surface bias: {placement.surfaceBiasLabel}
                  </span>
                ) : null}
                {placement.comparableReasonSummary ? (
                  <span style={styles.reasoningLine}>
                    why: {placement.comparableReasonSummary}
                  </span>
                ) : null}
                {placement.lockedTraitSummary ? (
                  <span style={styles.reasoningLine}>
                    locked: {placement.lockedTraitSummary}
                  </span>
                ) : null}
                {placement.variableTraitSummary ? (
                  <span style={styles.reasoningLine}>
                    vary: {placement.variableTraitSummary}
                  </span>
                ) : null}
                {placement.forceSynthesisSummary ? (
                  <span style={styles.reasoningLine}>
                    force synth: {placement.forceSynthesisSummary}
                  </span>
                ) : null}
                {placement.guidanceNote ? (
                  <span style={styles.reasoningLine}>
                    note: {placement.guidanceNote}
                  </span>
                ) : null}
                {placement.imageUrl ? (
                  <span style={styles.previewLine}>{placement.imageUrl}</span>
                ) : null}
                {placement.previewSource ? (
                  <span style={styles.reasoningLine}>
                    preview source: {placement.previewSource === 'cached'
                      ? 'cached bootstrap preview'
                      : 'fresh scene preview'}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={event => {
                    event.stopPropagation();
                    void rerollPlacement(placement.id);
                  }}
                  style={styles.rerollButton}
                >
                  Reroll
                </button>
                {onPromotePlacement ? (
                  <button
                    type="button"
                    onClick={event => {
                      event.stopPropagation();
                      promotePlacement(placement);
                    }}
                    style={styles.promoteButton}
                  >
                    Promote To Graph
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </button>
        <button
          type="button"
          style={styles.floor}
          onClick={() => void addPlacement('floor')}
          aria-label="Populate floor surface"
        >
          <div style={styles.surfaceLabel}>Floor</div>
          <div style={styles.floorPlacements}>
            {grouped.floor.map(placement => (
              <div key={placement.id} style={styles.floorChip}>
                <strong>{placement.label}</strong>
                <span>{placement.provenance}</span>
                {placement.preferredComparableLabels?.length ? (
                  <span style={styles.reasoningLine}>
                    {placement.preferredComparableLabels.length > 1
                      ? `comparables: ${placement.preferredComparableLabels.join(', ')}`
                      : `comparable: ${placement.preferredComparableLabel}`}
                  </span>
                ) : null}
                {placement.surfaceBiasLabel ? (
                  <span style={styles.reasoningLine}>
                    surface bias: {placement.surfaceBiasLabel}
                  </span>
                ) : null}
                {placement.comparableReasonSummary ? (
                  <span style={styles.reasoningLine}>
                    why: {placement.comparableReasonSummary}
                  </span>
                ) : null}
                {placement.lockedTraitSummary ? (
                  <span style={styles.reasoningLine}>
                    locked: {placement.lockedTraitSummary}
                  </span>
                ) : null}
                {placement.variableTraitSummary ? (
                  <span style={styles.reasoningLine}>
                    vary: {placement.variableTraitSummary}
                  </span>
                ) : null}
                {placement.forceSynthesisSummary ? (
                  <span style={styles.reasoningLine}>
                    force synth: {placement.forceSynthesisSummary}
                  </span>
                ) : null}
                {placement.guidanceNote ? (
                  <span style={styles.reasoningLine}>
                    note: {placement.guidanceNote}
                  </span>
                ) : null}
                {placement.imageUrl ? (
                  <span style={styles.previewLine}>{placement.imageUrl}</span>
                ) : null}
                {placement.previewSource ? (
                  <span style={styles.reasoningLine}>
                    preview source: {placement.previewSource === 'cached'
                      ? 'cached bootstrap preview'
                      : 'fresh scene preview'}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={event => {
                    event.stopPropagation();
                    void rerollPlacement(placement.id);
                  }}
                  style={styles.rerollButton}
                >
                  Reroll
                </button>
                {onPromotePlacement ? (
                  <button
                    type="button"
                    onClick={event => {
                      event.stopPropagation();
                      promotePlacement(placement);
                    }}
                    style={styles.promoteButton}
                  >
                    Promote To Graph
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </button>
      </div>
      {error ? <div style={styles.error}>{error}</div> : null}
      <div style={styles.footer}>
        <span data-testid="scene-preview-v1-summary">
          {placements.length} placement{placements.length === 1 ? '' : 's'}
          {effectiveSceneBatchSize !== batchSize
            ? ` · scene batch ${effectiveSceneBatchSize}`
            : ''}
          {isLoadingSurface ? ` · loading ${isLoadingSurface}` : ''}
          {!isLoadingSurface && hasCachedPreviewPlacements && hasFreshPreviewPlacements
            ? ' · cached + fresh preview mix'
            : ''}
          {!isLoadingSurface &&
          hasCachedPreviewPlacements &&
          !hasFreshPreviewPlacements &&
          cachedPreviewResponse &&
          canUseHostedPreview
            ? ' · reusing cached bootstrap preview'
            : ''}
          {!isLoadingSurface &&
          hasFreshPreviewPlacements &&
          !hasCachedPreviewPlacements
            ? ' · using fresh scene preview'
            : ''}
          {!isLoadingSurface && hasPersistedSceneState
            ? ' · saved scene state'
            : ''}
          {!canUseHostedPreview ? ' · fallback mode' : ''}
        </span>
        <button
          type="button"
          onClick={() => {
            setPlacements([]);
            setUsedCachedPreviewResultIds([]);
          }}
          style={styles.clearButton}
        >
          {hasPersistedSceneState ? 'Reset saved scene preview' : 'Clear'}
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    zIndex: 20,
    width: 340,
    padding: '14px 16px',
    borderRadius: 14,
    border: '1px solid rgba(20, 83, 45, 0.24)',
    background:
      'linear-gradient(180deg, rgba(251, 250, 245, 0.98), rgba(243, 244, 246, 0.98))',
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)',
    pointerEvents: 'auto'
  },
  panelHighlighted: {
    border: '1px solid rgba(217, 119, 6, 0.55)',
    boxShadow: '0 0 0 3px rgba(251, 191, 36, 0.18), 0 18px 40px rgba(15, 23, 42, 0.18)'
  },
  kicker: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#166534',
    marginBottom: 6
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: '#111827'
  },
  copy: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 1.5,
    color: '#4b5563'
  },
  activePreviewTarget: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 1.4,
    color: '#166534'
  },
  activeSceneMode: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 1.4,
    color: '#1f2937'
  },
  groupedFamilyBanner: {
    marginTop: 8,
    padding: '6px 8px',
    borderRadius: 8,
    background: 'rgba(59, 130, 246, 0.1)',
    color: '#1d4ed8',
    fontSize: 11,
    lineHeight: 1.4
  },
  queuedBanner: {
    marginTop: 10,
    padding: '8px 10px',
    borderRadius: 10,
    background: 'rgba(16, 185, 129, 0.12)',
    color: '#065f46',
    fontSize: 12,
    fontWeight: 700
  },
  queuedMeta: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: 500,
    color: '#047857',
    lineHeight: 1.4
  },
  queuedMetaHighlighted: {
    background: 'rgba(250, 204, 21, 0.16)',
    borderRadius: 6,
    padding: '2px 6px',
    color: '#92400e'
  },
  viewport: {
    marginTop: 12,
    display: 'grid',
    gap: 0,
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid #d6d3d1',
    background: '#f5f5f4'
  },
  referencePanel: {
    marginTop: 12,
    display: 'grid',
    gap: 8
  },
  batchControls: {
    marginTop: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  batchField: {
    display: 'grid',
    gap: 6,
    fontSize: 12,
    color: '#4b5563'
  },
  batchInput: {
    width: 88,
    padding: '8px 10px',
    borderRadius: 10,
    border: '1px solid #d6d3d1',
    background: '#fff'
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#4b5563'
  },
  referenceList: {
    display: 'grid',
    gap: 8
  },
  referenceCard: {
    display: 'grid',
    gap: 4,
    padding: '8px 10px',
    borderRadius: 10,
    border: '1px solid #e7e5e4',
    background: '#fff',
    fontSize: 12,
    color: '#374151'
  },
  referenceUri: {
    fontSize: 11,
    color: '#6b7280',
    wordBreak: 'break-all'
  },
  emptyReference: {
    fontSize: 12,
    color: '#6b7280'
  },
  wall: {
    minHeight: 150,
    border: 'none',
    padding: '12px',
    background:
      'linear-gradient(180deg, rgba(191, 219, 254, 0.85), rgba(226, 232, 240, 0.92))',
    textAlign: 'left',
    cursor: 'pointer'
  },
  floor: {
    minHeight: 96,
    border: 'none',
    borderTop: '1px solid #d6d3d1',
    padding: '12px',
    background:
      'linear-gradient(180deg, rgba(214, 211, 209, 0.92), rgba(168, 162, 158, 0.98))',
    textAlign: 'left',
    cursor: 'pointer'
  },
  surfaceLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#374151',
    marginBottom: 8
  },
  placementColumn: {
    display: 'grid',
    gap: 8
  },
  placementCard: {
    display: 'grid',
    gap: 4,
    maxWidth: 160,
    padding: '8px 10px',
    borderRadius: 10,
    background: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    color: '#374151'
  },
  floorPlacements: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8
  },
  floorChip: {
    display: 'grid',
    gap: 2,
    minWidth: 108,
    padding: '8px 10px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.84)',
    fontSize: 11,
    color: '#374151'
  },
  footer: {
    marginTop: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    fontSize: 12,
    color: '#4b5563'
  },
  clearButton: {
    border: '1px solid #d6d3d1',
    background: '#fff',
    borderRadius: 999,
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 12
  },
  rerollButton: {
    justifySelf: 'start',
    marginTop: 4,
    border: '1px solid #d6d3d1',
    background: '#fff',
    borderRadius: 999,
    padding: '6px 10px',
    cursor: 'pointer',
    fontSize: 11
  },
  promoteButton: {
    justifySelf: 'start',
    marginTop: 4,
    border: '1px solid rgba(22, 101, 52, 0.2)',
    background: 'rgba(22, 163, 74, 0.1)',
    color: '#166534',
    borderRadius: 999,
    padding: '6px 10px',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 600
  },
  previewLine: {
    fontSize: 11,
    color: '#0f766e',
    wordBreak: 'break-all'
  },
  reasoningLine: {
    fontSize: 11,
    color: '#4b5563',
    lineHeight: 1.4
  },
  error: {
    marginTop: 10,
    padding: '10px 12px',
    borderRadius: 10,
    background: '#fef2f2',
    color: '#b91c1c',
    fontSize: 12
  }
};

export default ScenePreviewV1Panel;
