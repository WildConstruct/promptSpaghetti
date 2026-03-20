import React from 'react';
import type {
  PsgImagePreviewResponse,
  PsgPreviewBackend
} from '@promptscape/core/services/psg';
import type { ImageBootstrapSelectionSummary } from '../utils/imageBootstrapSelection';
import { getSurfaceBiasedComparableLabel } from '../utils/scenePreviewComparables';
import { getPreviewBackendFingerprint } from '../utils/previewBackendLabel';

type PreviewMeta = {
  updatedAt: number;
  state: 'fresh' | 'cached';
};

interface ImageBootstrapSelectionPanelProps {
  summary: ImageBootstrapSelectionSummary;
  scenePreviewPlacementCount?: number;
  scenePreviewMode?: 'grouped' | 'isolated' | null;
  highlightSceneBiasSurface?: 'wall' | 'floor' | 'both' | null;
  onChangeScenePreviewMode?: (mode: 'grouped' | 'isolated') => void;
  onClearSavedScenePreview?: () => void;
  onOpenScenePreview?: () => void;
  onPopulateSceneSurface?: (surface: 'wall' | 'floor') => void;
  onRefine?: () => void;
  onClearQueuedRefinement?: () => void;
  onPreview?: () => void;
  onRefreshPreview?: () => void;
  previewBackends?: PsgPreviewBackend[];
  selectedPreviewBackendId?: string | null;
  selectedPreviewModel?: string | null;
  onChangePreviewBackend?: (backendId: string) => void;
  onChangePreviewModel?: (model: string) => void;
  onRerollPreviewResult?: (resultId: string) => void;
  onPromotePreviewResult?: (
    result: PsgImagePreviewResponse['preview']['results'][number]
  ) => void;
  canPreview?: boolean;
  isPreviewing?: boolean;
  promotedPreviewResultId?: string | null;
  previewMeta?: PreviewMeta | null;
  previewResponse?: PsgImagePreviewResponse | null;
  previewError?: string | null;
}

export const ImageBootstrapSelectionPanel: React.FC<
  ImageBootstrapSelectionPanelProps
> = ({
  summary,
  onRefine,
  scenePreviewMode,
  highlightSceneBiasSurface,
  onChangeScenePreviewMode,
  onClearSavedScenePreview,
  onOpenScenePreview,
  onPopulateSceneSurface,
  onClearQueuedRefinement,
  onPreview,
  onRefreshPreview,
  previewBackends = [],
  selectedPreviewBackendId,
  selectedPreviewModel,
  onChangePreviewBackend,
  onChangePreviewModel,
  onRerollPreviewResult,
  onPromotePreviewResult,
  canPreview = false,
  isPreviewing = false,
  promotedPreviewResultId,
  previewMeta,
  previewResponse,
  previewError
}) => {
  const queuedRefinement =
    typeof summary.notes === 'string' &&
    summary.notes.startsWith('Scene preview promoted');
  const wallFamily = getSurfaceBiasedComparableLabel(summary, 'wall', 0);
  const floorFamily = getSurfaceBiasedComparableLabel(summary, 'floor', 0);
  const wallComparable = summary.preferredComparableRefs.find(
    ref => ref.label === wallFamily
  );
  const floorComparable = summary.preferredComparableRefs.find(
    ref => ref.label === floorFamily
  );
  const hasActiveSceneBias = Boolean(wallFamily || floorFamily);
  const selectedPreviewBackend =
    previewBackends.find(backend => backend.id === selectedPreviewBackendId) ||
    previewBackends[0] ||
    null;
  const availablePreviewModels =
    selectedPreviewBackend?.supportedModels?.length
      ? selectedPreviewBackend.supportedModels
      : selectedPreviewBackend?.model
        ? [selectedPreviewBackend.model]
        : [];
  const isScenePreviewSet = previewResponse?.preview.backend.profile === 'scene';
  const hasMultiFamilyPreviewResults = Boolean(
    previewResponse?.preview.results.some(
      result => result.metadata.preferredComparableLabels.length > 1
    )
  );

  return (
    <div style={styles.panel}>
      <div style={styles.kicker}>Image Bootstrap</div>
      <div style={styles.title}>
        {summary.bootstrapMode || 'Bootstrap draft'} grounded in selected refs
      </div>
      {queuedRefinement ? (
        <div style={styles.queuedBanner}>
          <div>
            Queued refinement
            {summary.preferredComparableRefs[0]?.label
              ? `: ${summary.preferredComparableRefs[0].label}`
              : ''}
          </div>
          {summary.lockedTraitKeys.length > 0 ? (
            <div style={styles.queuedMeta}>
              lock: {summary.lockedTraitKeys.join(', ')}
            </div>
          ) : null}
          {summary.forceSynthesisKeys.length > 0 ? (
            <div style={styles.queuedMeta}>
              force synth: {summary.forceSynthesisKeys.join(', ')}
            </div>
          ) : null}
          {onClearQueuedRefinement ? (
            <button
              type="button"
              onClick={onClearQueuedRefinement}
              style={styles.clearQueuedButton}
            >
              Clear queued refinement
            </button>
          ) : null}
        </div>
      ) : null}
      {summary.analysisSources.length > 0 ? (
        <div style={styles.section}>
          <strong>Analysis source</strong>
          <div style={styles.inlineList}>
            {summary.analysisSources.map(source => {
              const label =
                source.fixtureId ||
                source.selectionMode ||
                source.assetId;
              return (
                <div key={`${source.assetId}-${source.fixtureId || source.selectionMode || 'derived'}`}>
                  {label}
                  {source.selectionMode ? ` (${source.selectionMode})` : ''}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      {onPopulateSceneSurface ? (
        <div style={styles.section} data-testid="scene-quick-actions">
          <strong>Scene quick actions</strong>
          {hasActiveSceneBias ? (
            <div style={styles.sceneBiasBox}>
              <div style={styles.sceneBiasTitle}>Active scene bias</div>
              {wallFamily ? (
                <div
                  style={{
                    ...styles.sceneBiasLine,
                    ...(highlightSceneBiasSurface === 'wall' ||
                    highlightSceneBiasSurface === 'both'
                      ? styles.sceneBiasLineHighlighted
                      : null)
                  }}
                >
                  wall: {wallFamily}
                  {wallComparable?.reasonCodes?.length ? (
                    <div style={styles.sceneBiasReason}>
                      why: {wallComparable.reasonCodes.join(', ')}
                    </div>
                  ) : null}
                </div>
              ) : null}
              {floorFamily ? (
                <div
                  style={{
                    ...styles.sceneBiasLine,
                    ...(highlightSceneBiasSurface === 'floor' ||
                    highlightSceneBiasSurface === 'both'
                      ? styles.sceneBiasLineHighlighted
                      : null)
                  }}
                >
                  floor: {floorFamily}
                  {floorComparable?.reasonCodes?.length ? (
                    <div style={styles.sceneBiasReason}>
                      why: {floorComparable.reasonCodes.join(', ')}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
          <div style={styles.inlineActions}>
            <button
              type="button"
              onClick={() => onPopulateSceneSurface('wall')}
              style={styles.secondaryInlineButton}
              data-testid="scene-quick-populate-wall"
            >
              Populate wall{wallFamily ? `: ${wallFamily}` : ''}
            </button>
            <button
              type="button"
              onClick={() => onPopulateSceneSurface('floor')}
              style={styles.secondaryInlineButton}
              data-testid="scene-quick-populate-floor"
            >
              Populate floor{floorFamily ? `: ${floorFamily}` : ''}
            </button>
          </div>
        </div>
      ) : null}
      {scenePreviewPlacementCount && scenePreviewPlacementCount > 0 ? (
        <div style={styles.section}>
          <strong>Saved scene preview</strong>
          <div style={styles.inlineList}>
            {scenePreviewPlacementCount} placement
            {scenePreviewPlacementCount === 1 ? '' : 's'} saved for this bootstrap
            {scenePreviewMode ? ` · ${scenePreviewMode}` : ''}
          </div>
          {onChangeScenePreviewMode ? (
            <div style={styles.inlineActions}>
              <button
                type="button"
                onClick={() => onChangeScenePreviewMode('grouped')}
                style={styles.secondaryInlineButton}
                disabled={scenePreviewMode === 'grouped'}
              >
                Use grouped
              </button>
              <button
                type="button"
                onClick={() => onChangeScenePreviewMode('isolated')}
                style={styles.secondaryInlineButton}
                disabled={scenePreviewMode === 'isolated'}
              >
                Use isolated
              </button>
            </div>
          ) : null}
          {onOpenScenePreview ? (
            <button
              type="button"
              onClick={onOpenScenePreview}
              style={styles.secondaryInlineButton}
              data-testid="scene-open-preview"
            >
              Open scene preview
            </button>
          ) : null}
          {onClearSavedScenePreview ? (
            <button
              type="button"
              onClick={onClearSavedScenePreview}
              style={styles.clearQueuedButton}
              data-testid="scene-clear-saved-preview"
            >
              Clear saved scene preview
            </button>
          ) : null}
        </div>
      ) : null}
      {summary.preferredComparableRefs.length > 0 ? (
        <div style={styles.section}>
          <strong>Preferred comparables</strong>
          <div style={styles.chips}>
            {summary.preferredComparableRefs.map(ref => (
              <span key={ref.id} style={styles.chip}>
                {ref.label || ref.id}
                {ref.reasonCodes?.length ? ` · ${ref.reasonCodes.join(', ')}` : ''}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {summary.forceSynthesisKeys.length > 0 ? (
        <div style={styles.section}>
          <strong>Force synthesis</strong>
          <div style={styles.inlineList}>{summary.forceSynthesisKeys.join(', ')}</div>
        </div>
      ) : null}
      {summary.variableTraitKeys.length > 0 ? (
        <div style={styles.section}>
          <strong>Variable traits</strong>
          <div style={styles.inlineList}>{summary.variableTraitKeys.join(', ')}</div>
        </div>
      ) : null}
      {summary.notes ? (
        <div style={styles.section}>
          <strong>Review note</strong>
          <div style={styles.note}>{summary.notes}</div>
        </div>
      ) : null}
      {onPreview ? (
        <div style={styles.section}>
          {selectedPreviewBackend ? (
            <div style={styles.inlineList}>
              Active bootstrap preview target:{' '}
              {getPreviewBackendFingerprint({
                label: selectedPreviewBackend.label,
                model: selectedPreviewModel || selectedPreviewBackend.model,
                profile: selectedPreviewBackend.profile
              })}
            </div>
          ) : null}
          {previewBackends.length > 0 ? (
            <div style={styles.previewSelectorGrid}>
              <label style={styles.selectorField}>
                <span>Bootstrap preview backend</span>
                <select
                  value={selectedPreviewBackend?.id || ''}
                  onChange={event =>
                    onChangePreviewBackend?.(event.target.value)
                  }
                  style={styles.selectorInput}
                >
                  {previewBackends.map(backend => (
                    <option key={backend.id} value={backend.id}>
                      {backend.label}
                    </option>
                  ))}
                </select>
              </label>
              <label style={styles.selectorField}>
                <span>Bootstrap preview model</span>
                <select
                  value={selectedPreviewModel || availablePreviewModels[0] || ''}
                  onChange={event =>
                    onChangePreviewModel?.(event.target.value)
                  }
                  style={styles.selectorInput}
                  disabled={availablePreviewModels.length === 0}
                >
                  {availablePreviewModels.map(model => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}
          <button
            type="button"
            onClick={onPreview}
            style={styles.secondaryButton}
            disabled={!canPreview || isPreviewing}
          >
            {isPreviewing ? 'Previewing...' : 'Preview Bootstrap...'}
          </button>
        </div>
      ) : null}
      {previewError ? (
        <div style={styles.errorBox}>{previewError}</div>
      ) : null}
      {previewResponse ? (
        <div style={styles.section}>
          <div style={styles.previewHeader}>
            <strong>Preview</strong>
            {onRefreshPreview ? (
              <button
                type="button"
                onClick={onRefreshPreview}
                style={styles.refreshPreviewButton}
                disabled={isPreviewing}
              >
                Refresh all
              </button>
            ) : null}
          </div>
          <div style={styles.inlineList}>
            {getPreviewBackendFingerprint(previewResponse.preview.backend)}
          </div>
          {previewMeta ? (
            <div style={styles.previewStatus}>
              {previewMeta.state === 'cached' ? 'Cached preview' : 'Fresh preview'}
              {' · '}
              {new Date(previewMeta.updatedAt).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit'
              })}
            </div>
          ) : null}
          {previewResponse.preview.promptBlueprint ? (
            <div style={styles.previewPrompt}>
              {previewResponse.preview.promptBlueprint}
            </div>
          ) : null}
          {isScenePreviewSet ? (
            <div style={styles.scenePreviewGrouping}>
              Scene-oriented preview set
              {hasMultiFamilyPreviewResults
                ? ' · grouped by nearby comparable families'
                : ''}
            </div>
          ) : null}
          <div style={styles.previewGrid}>
            {previewResponse.preview.results.map(result => (
              <div
                key={result.id}
                style={{
                  ...styles.previewCard,
                  ...(promotedPreviewResultId === result.id
                    ? styles.previewCardPromoted
                    : null)
                }}
              >
                <img
                  src={result.imageUrl}
                  alt={result.prompt}
                  style={styles.previewImage}
                />
                {promotedPreviewResultId === result.id ? (
                  <div style={styles.promotedBadge}>Promoted to queued refinement</div>
                ) : null}
                <div style={styles.previewMeta}>seed: {result.seed}</div>
                {result.metadata.preferredComparableLabels.length > 0 ? (
                  <div style={styles.previewMeta}>
                    {result.metadata.preferredComparableLabels.length > 1
                      ? `families: ${result.metadata.preferredComparableLabels.join(', ')}`
                      : `family: ${result.metadata.preferredComparableLabels[0]}`}
                  </div>
                ) : null}
                {(result.metadata.forceSynthesisKeys || []).length > 0 ? (
                  <div style={styles.previewMeta}>
                    force synth: {(result.metadata.forceSynthesisKeys || []).join(', ')}
                  </div>
                ) : null}
                {result.metadata.guidanceNotes ? (
                  <div style={styles.previewMeta}>
                    note: {result.metadata.guidanceNotes}
                  </div>
                ) : null}
                <div style={styles.previewActions}>
                  {onRerollPreviewResult ? (
                    <button
                      type="button"
                      style={styles.previewActionButton}
                      onClick={() => onRerollPreviewResult(result.id)}
                      disabled={isPreviewing}
                    >
                      Reroll
                    </button>
                  ) : null}
                  {onPromotePreviewResult ? (
                    <button
                      type="button"
                      style={styles.previewActionButton}
                      onClick={() => onPromotePreviewResult(result)}
                    >
                      Promote
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {onRefine ? (
        <button type="button" onClick={onRefine} style={styles.button}>
          Refine Bootstrap...
        </button>
      ) : null}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'absolute',
    top: 84,
    right: 20,
    zIndex: 20,
    width: 320,
    padding: '14px 16px',
    borderRadius: 12,
    border: '1px solid rgba(34, 211, 238, 0.35)',
    background: 'rgba(15, 23, 42, 0.92)',
    color: '#e2e8f0',
    boxShadow: '0 16px 32px rgba(15, 23, 42, 0.24)',
    pointerEvents: 'auto'
  },
  kicker: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#67e8f9',
    marginBottom: 6
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 10
  },
  section: {
    marginTop: 10
  },
  queuedBanner: {
    marginTop: 2,
    padding: '8px 10px',
    borderRadius: 10,
    background: 'rgba(16, 185, 129, 0.14)',
    color: '#d1fae5',
    fontSize: 12,
    fontWeight: 700
  },
  queuedMeta: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: 500,
    color: '#a7f3d0',
    lineHeight: 1.4
  },
  clearQueuedButton: {
    marginTop: 8,
    width: '100%',
    padding: '6px 8px',
    borderRadius: 8,
    border: '1px solid rgba(167, 243, 208, 0.24)',
    background: 'rgba(6, 95, 70, 0.24)',
    color: '#d1fae5',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer'
  },
  secondaryInlineButton: {
    marginTop: 8,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    border: '1px solid rgba(148, 163, 184, 0.35)',
    background: 'rgba(148, 163, 184, 0.12)',
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: 600,
    padding: '6px 10px',
    cursor: 'pointer'
  },
  inlineActions: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 8
  },
  sceneBiasBox: {
    marginTop: 8,
    padding: '8px 10px',
    borderRadius: 10,
    background: 'rgba(59, 130, 246, 0.12)',
    border: '1px solid rgba(96, 165, 250, 0.18)'
  },
  sceneBiasTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#bfdbfe',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  sceneBiasLine: {
    marginTop: 4,
    fontSize: 12,
    color: '#dbeafe',
    lineHeight: 1.4
  },
  sceneBiasReason: {
    marginTop: 2,
    fontSize: 11,
    color: '#bfdbfe',
    lineHeight: 1.4
  },
  sceneBiasLineHighlighted: {
    background: 'rgba(250, 204, 21, 0.16)',
    borderRadius: 6,
    padding: '2px 6px',
    color: '#fef3c7'
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6
  },
  chip: {
    padding: '4px 8px',
    borderRadius: 999,
    background: 'rgba(34, 211, 238, 0.14)',
    color: '#cffafe',
    fontSize: 12
  },
  inlineList: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 1.5,
    color: '#cbd5e1'
  },
  note: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 1.5,
    color: '#cbd5e1'
  },
  previewSelectorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 8,
    marginBottom: 10
  },
  selectorField: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
    fontSize: 12,
    color: '#cbd5e1'
  },
  selectorInput: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid rgba(148, 163, 184, 0.28)',
    background: 'rgba(15, 23, 42, 0.6)',
    color: '#f8fafc',
    fontSize: 12
  },
  secondaryButton: {
    marginTop: 14,
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(148, 163, 184, 0.35)',
    background: 'rgba(148, 163, 184, 0.14)',
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer'
  },
  errorBox: {
    marginTop: 10,
    padding: '8px 10px',
    borderRadius: 10,
    background: 'rgba(248, 113, 113, 0.12)',
    color: '#fecaca',
    fontSize: 12,
    lineHeight: 1.4
  },
  previewPrompt: {
    marginTop: 6,
    padding: '8px 10px',
    borderRadius: 10,
    background: 'rgba(34, 211, 238, 0.1)',
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 1.5
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  refreshPreviewButton: {
    padding: '4px 8px',
    borderRadius: 8,
    border: '1px solid rgba(148, 163, 184, 0.24)',
    background: 'rgba(148, 163, 184, 0.1)',
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer'
  },
  previewStatus: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 1.4,
    color: '#94a3b8'
  },
  scenePreviewGrouping: {
    marginTop: 8,
    padding: '6px 8px',
    borderRadius: 8,
    background: 'rgba(59, 130, 246, 0.1)',
    color: '#bfdbfe',
    fontSize: 11,
    lineHeight: 1.4
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 8,
    marginTop: 8
  },
  previewCard: {
    padding: 8,
    borderRadius: 10,
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(34, 211, 238, 0.12)'
  },
  previewCardPromoted: {
    border: '1px solid rgba(16, 185, 129, 0.45)',
    boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.18) inset'
  },
  previewImage: {
    display: 'block',
    width: '100%',
    aspectRatio: '1 / 1',
    objectFit: 'cover',
    borderRadius: 8,
    background: 'rgba(15, 23, 42, 0.8)'
  },
  previewMeta: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 1.4,
    color: '#cbd5e1'
  },
  promotedBadge: {
    marginTop: 6,
    padding: '4px 6px',
    borderRadius: 999,
    background: 'rgba(16, 185, 129, 0.14)',
    color: '#d1fae5',
    fontSize: 10,
    fontWeight: 700,
    textAlign: 'center'
  },
  previewActions: {
    display: 'flex',
    gap: 6,
    marginTop: 8
  },
  previewActionButton: {
    flex: 1,
    padding: '6px 8px',
    borderRadius: 8,
    border: '1px solid rgba(148, 163, 184, 0.24)',
    background: 'rgba(148, 163, 184, 0.1)',
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer'
  },
  button: {
    marginTop: 14,
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(34, 211, 238, 0.35)',
    background: 'rgba(34, 211, 238, 0.14)',
    color: '#cffafe',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer'
  }
};
