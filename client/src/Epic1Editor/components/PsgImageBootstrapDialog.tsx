import React, { useEffect, useMemo, useState } from 'react';
import {
  ApiPsgClient,
  type PsgAssetRef,
  type PsgDocument,
  type PsgImagePreviewResponse,
  type PsgPreviewBackend,
  type PsgReviewCheckpoint,
  type PsgReviewGuidance
} from '@promptscape/core/services/psg';
import { loadReactFlowFromPsgContent } from '../utils/psgDocument';
import type { ImageBootstrapSelectionSummary } from '../utils/imageBootstrapSelection';
import { getPreviewBackendFingerprint } from '../utils/previewBackendLabel';

interface PsgImageBootstrapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: PsgDocument;
  assets: PsgAssetRef[];
  psgAccessMode: 'offline' | 'local' | 'cloud';
  hostedUpgradeOperations: string[];
  previewBackends?: PsgPreviewBackend[];
  selectedPreviewBackendId?: string | null;
  selectedPreviewModel?: string | null;
  onChangePreviewBackend?: (backendId: string) => void;
  onChangePreviewModel?: (model: string) => void;
  initialSelectionSummary?: ImageBootstrapSelectionSummary | null;
  onApplyDraft: (payload: {
    nodes: ReturnType<typeof loadReactFlowFromPsgContent>['nodes'];
    edges: ReturnType<typeof loadReactFlowFromPsgContent>['edges'];
    checkpoint: PsgReviewCheckpoint;
  }) => void;
}

type TraitMode = 'locked' | 'variable' | 'reject';

const REASON_CODE_LABELS: Record<string, string> = {
  'saved-reuse-signal': 'saved reuse',
  'asset-bootstrap-preference': 'asset preference',
  'fixture-comparable': 'fixture comparable',
  'role-similarity': 'role similarity',
  'prop-family-match': 'prop family match',
  'set-dressing-adjacency': 'set dressing adjacency',
  'archetype-adjacency': 'archetype adjacency',
  'adjacent-family': 'adjacent family',
  'world-fit': 'world fit',
  'style-similarity': 'style similarity',
  'prop-wear-match': 'prop wear match',
  'crowd-supporting-role': 'crowd supporting role',
  'bootstrap-mode-similarity': 'bootstrap mode similarity'
};

function splitCsv(input: string): string[] {
  return input
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
}

function formatReasonCodes(reasonCodes: string[]): string {
  if (reasonCodes.length === 0) {
    return 'no explanation';
  }

  return reasonCodes
    .map(code => REASON_CODE_LABELS[code] || code.replaceAll('-', ' '))
    .join(', ');
}

function getComparablePriorityBadges(reasonCodes: string[]): string[] {
  const badges: string[] = [];
  if (reasonCodes.includes('saved-reuse-signal')) {
    badges.push('Saved reuse signal');
  }
  if (reasonCodes.includes('fixture-comparable')) {
    badges.push('Fixture comparable');
  }
  if (reasonCodes.includes('adjacent-family')) {
    badges.push('Adjacent family');
  }
  return badges;
}

export const PsgImageBootstrapDialog: React.FC<PsgImageBootstrapDialogProps> = ({
  isOpen,
  onClose,
  document,
  assets,
  psgAccessMode,
  hostedUpgradeOperations,
  previewBackends = [],
  selectedPreviewBackendId,
  selectedPreviewModel,
  onChangePreviewBackend,
  onChangePreviewModel,
  initialSelectionSummary,
  onApplyDraft
}) => {
  const isRefinementMode = Boolean(initialSelectionSummary);
  const hasScenePromotedSeed = Boolean(
    initialSelectionSummary?.notes?.startsWith('Scene preview promoted')
  );
  const imageAssets = useMemo(
    () =>
      assets.filter(
        asset =>
          asset.storage.contentType?.startsWith('image/') ||
          asset.kind === 'reference-still' ||
          asset.kind === 'style-reference' ||
          asset.kind === 'pose-reference' ||
          asset.kind === 'character-sheet'
      ),
    [assets]
  );
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(
    imageAssets.map(asset => asset.id)
  );
  const [userIntent, setUserIntent] = useState('');
  const [checkpoint, setCheckpoint] = useState<PsgReviewCheckpoint | null>(null);
  const [traitModes, setTraitModes] = useState<Record<string, TraitMode>>({});
  const [primarySubjectId, setPrimarySubjectId] = useState('');
  const [excludedRegionIds, setExcludedRegionIds] = useState<string[]>([]);
  const [bootstrapMode, setBootstrapMode] = useState('');
  const [addedLockedTraits, setAddedLockedTraits] = useState('');
  const [addedVariableTraits, setAddedVariableTraits] = useState('');
  const [preferredComparableMatchIds, setPreferredComparableMatchIds] = useState<
    string[]
  >([]);
  const [explicitFixtureAssetIds, setExplicitFixtureAssetIds] = useState<string[]>(
    []
  );
  const [forceSynthesisKeys, setForceSynthesisKeys] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [previewSeedInput, setPreviewSeedInput] = useState('');
  const [previewCount, setPreviewCount] = useState(4);
  const [previewResponse, setPreviewResponse] =
    useState<PsgImagePreviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canUseHostedBootstrap =
    psgAccessMode === 'cloud' &&
    hostedUpgradeOperations.includes('images-analyze') &&
    hostedUpgradeOperations.includes('images-review') &&
    hostedUpgradeOperations.includes('images-draft-graph');
  const canUseHostedPreview =
    psgAccessMode === 'cloud' &&
    hostedUpgradeOperations.includes('images-preview');
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

  const allTraits = useMemo(() => {
    if (!checkpoint) {
      return [];
    }
    return checkpoint.analyses.flatMap(analysis => [
      ...analysis.lockedTraits,
      ...analysis.variableTraits
    ]);
  }, [checkpoint]);

  const subjects = useMemo(
    () => checkpoint?.analyses.flatMap(analysis => analysis.subjects) || [],
    [checkpoint]
  );

  const regions = useMemo(
    () => checkpoint?.analyses.flatMap(analysis => analysis.regions) || [],
    [checkpoint]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialSelectionSummary?.assetIds?.length) {
      setSelectedAssetIds(initialSelectionSummary.assetIds);
    } else {
      setSelectedAssetIds(imageAssets.map(asset => asset.id));
    }

    setBootstrapMode(initialSelectionSummary?.bootstrapMode || '');
    setPreferredComparableMatchIds(
      initialSelectionSummary?.preferredComparableRefs.map(ref => ref.id) || []
    );
    setExplicitFixtureAssetIds(
      initialSelectionSummary?.analysisSources
        .filter(source => source.selectionMode === 'explicit')
        .map(source => source.assetId) || []
    );
    setForceSynthesisKeys(initialSelectionSummary?.forceSynthesisKeys || []);
    setNotes(initialSelectionSummary?.notes || '');
    if (
      initialSelectionSummary &&
      (initialSelectionSummary.lockedTraitKeys.length > 0 ||
        initialSelectionSummary.variableTraitKeys.length > 0)
    ) {
      setTraitModes({
        ...Object.fromEntries(
          initialSelectionSummary.lockedTraitKeys.map(key => [
            key,
            'locked' as const
          ])
        ),
        ...Object.fromEntries(
          initialSelectionSummary.variableTraitKeys.map(key => [
            key,
            'variable' as const
          ])
        )
      });
    }
  }, [imageAssets, initialSelectionSummary, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleToggleAsset = (assetId: string) => {
    setSelectedAssetIds(current =>
      current.includes(assetId)
        ? current.filter(id => id !== assetId)
        : [...current, assetId]
    );
  };

  const handleAnalyze = async () => {
    if (!canUseHostedBootstrap) {
      setError('Hosted image bootstrap is not available in this runtime mode.');
      return;
    }
    if (selectedAssetIds.length === 0) {
      setError('Select at least one image asset to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setPreviewResponse(null);
    try {
      const client = new ApiPsgClient();
      const result = await client.analyzeImages(
        document,
        selectedAssetIds,
        userIntent || undefined
      );
      setCheckpoint(result.checkpoint);
      setBootstrapMode(result.checkpoint.bootstrapMode || '');
      setPrimarySubjectId(
        result.checkpoint.analyses[0]?.subjects.find(subject => subject.primary)?.id || ''
      );
      setExcludedRegionIds([]);
      setPreferredComparableMatchIds(current =>
        current.length > 0
          ? result.checkpoint.comparableMatches
              .filter(match => current.includes(match.id))
              .map(match => match.id)
          : []
      );
      setExplicitFixtureAssetIds(current =>
        result.checkpoint.analyses
          .filter(
            analysis =>
              current.includes(analysis.assetId) ||
              analysis.analysisSource?.selectionMode === 'explicit'
          )
          .map(analysis => analysis.assetId)
      );
      setForceSynthesisKeys(current =>
        current.filter(key =>
          result.checkpoint.analyses.some(analysis =>
            [...analysis.lockedTraits, ...analysis.variableTraits].some(
              trait => trait.key === key
            )
          )
        )
      );
      setTraitModes(current => {
        const defaultModes = Object.fromEntries(
          result.checkpoint.analyses.flatMap(analysis => [
            ...analysis.lockedTraits.map(trait => [trait.key, 'locked' as const]),
            ...analysis.variableTraits.map(trait => [trait.key, 'variable' as const])
          ])
        );

        return {
          ...defaultModes,
          ...Object.fromEntries(
            Object.entries(current).filter(([key]) =>
              result.checkpoint.analyses.some(analysis =>
                [...analysis.lockedTraits, ...analysis.variableTraits].some(
                  trait => trait.key === key
                )
              )
            )
          )
        };
      });
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : 'Failed to analyze images'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const buildGuidance = (): PsgReviewGuidance | null => {
    if (!checkpoint) {
      return null;
    }

    return {
      bootstrapMode:
        bootstrapMode.length > 0
          ? (bootstrapMode as NonNullable<PsgReviewGuidance['bootstrapMode']>)
          : undefined,
      primarySubjectId: primarySubjectId || undefined,
      excludedRegionIds,
      lockedTraitKeys: Object.entries(traitModes)
        .filter(([, mode]) => mode === 'locked')
        .map(([key]) => key),
      variableTraitKeys: Object.entries(traitModes)
        .filter(([, mode]) => mode === 'variable')
        .map(([key]) => key),
      rejectedTraitKeys: Object.entries(traitModes)
        .filter(([, mode]) => mode === 'reject')
        .map(([key]) => key),
      addedLockedTraits: splitCsv(addedLockedTraits),
      addedVariableTraits: splitCsv(addedVariableTraits),
      explicitFixtureSelections: checkpoint.analyses
        .filter(
          analysis =>
            explicitFixtureAssetIds.includes(analysis.assetId) &&
            analysis.analysisSource?.fixtureId
        )
        .map(analysis => ({
          assetId: analysis.assetId,
          fixtureId: analysis.analysisSource?.fixtureId as string
        })),
      preferredComparableMatchIds,
      forceSynthesisKeys,
      notes: notes || undefined
    };
  };

  const handlePreview = async () => {
    if (!checkpoint) {
      setError('Analyze images before requesting a preview.');
      return;
    }
    if (!canUseHostedPreview) {
      setError('Hosted image preview is not available in this runtime mode.');
      return;
    }

    setIsPreviewing(true);
    setError(null);
    try {
      const guidance = buildGuidance();
      if (!guidance) {
        throw new Error('Preview guidance is unavailable.');
      }
      const client = new ApiPsgClient();
      const reviewed = await client.reviewImages(document, checkpoint, guidance);
      const preview = await client.previewImages(document, reviewed.checkpoint, {
        count: previewCount,
        seed:
          previewSeedInput.trim().length > 0
            ? Number.parseInt(previewSeedInput, 10)
            : undefined,
        backendId: selectedPreviewBackend?.id || undefined,
        model: selectedPreviewModel || undefined,
        includePromptBlueprint: true
      });
      setPreviewResponse(preview);
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : 'Failed to build preview'
      );
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleDraftGraph = async () => {
    if (!checkpoint) {
      setError('Analyze images before drafting a graph.');
      return;
    }

    setIsDrafting(true);
    setError(null);
    try {
      const guidance = buildGuidance();
      if (!guidance) {
        throw new Error('Draft guidance is unavailable.');
      }
      const client = new ApiPsgClient();
      const reviewed = await client.reviewImages(document, checkpoint, guidance);
      const drafted = await client.draftImageGraph(document, reviewed.checkpoint);
      const loaded = loadReactFlowFromPsgContent(
        JSON.stringify(drafted.draftFragment)
      );
      onApplyDraft({
        nodes: loaded.nodes,
        edges: loaded.edges,
        checkpoint: reviewed.checkpoint
      });
      onClose();
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : 'Failed to draft graph'
      );
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.dialog} onClick={event => event.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>
              {isRefinementMode ? 'Refine Image Bootstrap' : 'Image Bootstrap'}
            </h2>
            <p style={styles.subtitle}>
              {isRefinementMode
                ? `Re-analyze the selected bootstrap, review the machine read, then replace bootstrap group ${initialSelectionSummary?.bootstrapGroupId} in place.`
                : 'Analyze attached image assets, review the machine read, then draft a subgraph from the reviewed structure and insert it into the current graph.'}
            </p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            Close
          </button>
        </div>

        <div style={styles.note}>
          {canUseHostedBootstrap
            ? isRefinementMode
              ? `This uses the hosted PSG image bootstrap path and will replace ${initialSelectionSummary?.bootstrapGroupId} after review.`
              : 'This uses the hosted PSG image bootstrap path. Analyze first, then confirm the interpretation before drafting the graph insert.'
            : 'Hosted image bootstrap is currently unavailable. Attach image assets in PSG Scene Assets first, then use this when the hosted PSG path is available.'}
        </div>

        {hasScenePromotedSeed ? (
          <div style={styles.promotedSeedBanner}>
            <strong>Scene-promoted refinement queued</strong>
            <div style={styles.promotedSeedMeta}>
              preferred family:{' '}
              {initialSelectionSummary?.preferredComparableRefs[0]?.label || 'none'}
            </div>
            {initialSelectionSummary?.lockedTraitKeys.length ? (
              <div style={styles.promotedSeedMeta}>
                locked traits: {initialSelectionSummary.lockedTraitKeys.join(', ')}
              </div>
            ) : null}
            {initialSelectionSummary?.forceSynthesisKeys.length ? (
              <div style={styles.promotedSeedMeta}>
                force synthesis: {initialSelectionSummary.forceSynthesisKeys.join(', ')}
              </div>
            ) : null}
          </div>
        ) : null}

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Reference Images</h3>
          {imageAssets.length === 0 ? (
            <div style={styles.emptyState}>
              No image assets are attached yet. Add them in PSG Scene Assets first.
            </div>
          ) : (
            <div style={styles.assetList}>
              {imageAssets.map(asset => (
                <label key={asset.id} style={styles.assetRow}>
                  <input
                    type="checkbox"
                    checked={selectedAssetIds.includes(asset.id)}
                    onChange={() => handleToggleAsset(asset.id)}
                  />
                  <span>
                    <strong>{asset.id}</strong> · {asset.role || asset.kind}
                  </span>
                </label>
              ))}
            </div>
          )}
          <label style={styles.field}>
            <span>User intent</span>
            <textarea
              value={userIntent}
              onChange={event => setUserIntent(event.target.value)}
              style={styles.textarea}
              placeholder="same world, generate prop variations with worn edges"
            />
          </label>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || imageAssets.length === 0}
            style={styles.secondaryButton}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Images'}
          </button>
        </div>

        {checkpoint && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Review Checkpoint</h3>
            <div style={styles.grid}>
              <label style={styles.field}>
                <span>Bootstrap mode</span>
                <select
                  value={bootstrapMode}
                  onChange={event => setBootstrapMode(event.target.value)}
                  style={styles.input}
                >
                  {[
                    'character-variation',
                    'prop-variation',
                    'set-dressing-variation',
                    'environment-world-anchor',
                    'crowd-archetype-expansion'
                  ].map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label style={styles.field}>
                <span>Primary subject</span>
                <select
                  value={primarySubjectId}
                  onChange={event => setPrimarySubjectId(event.target.value)}
                  style={styles.input}
                >
                  <option value="">(auto)</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.label || subject.id}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {checkpoint.analyses.some(analysis => analysis.analysisSource) ? (
              <div style={styles.subsection}>
                <strong>Analysis provenance</strong>
                <div style={styles.assetList}>
                  {checkpoint.analyses
                    .filter(analysis => analysis.analysisSource)
                    .map(analysis => (
                      <div key={analysis.assetId} style={styles.assetRow}>
                        <div style={styles.analysisSourceRow}>
                          <span>
                            <strong>{analysis.assetId}</strong> ·{' '}
                            {analysis.analysisSource?.fixtureId ||
                              analysis.analysisSource?.selectionMode ||
                              'derived'}
                            {analysis.analysisSource?.selectionMode
                              ? ` (${analysis.analysisSource.selectionMode})`
                              : ''}
                          </span>
                          {analysis.analysisSource?.fixtureId ? (
                            <label style={styles.inlineCheckbox}>
                              <input
                                type="checkbox"
                                checked={explicitFixtureAssetIds.includes(
                                  analysis.assetId
                                )}
                                onChange={() =>
                                  setExplicitFixtureAssetIds(current =>
                                    current.includes(analysis.assetId)
                                      ? current.filter(
                                          assetId => assetId !== analysis.assetId
                                        )
                                      : [...current, analysis.assetId]
                                  )
                                }
                              />
                              <span>lock explicitly</span>
                            </label>
                          ) : null}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : null}

            <div style={styles.subsection}>
              <strong>Traits</strong>
              <div style={styles.traitList}>
                {allTraits.map(trait => (
                  <label key={trait.key} style={styles.traitRow}>
                    <div style={styles.traitMeta}>
                      <span>
                        <strong>{trait.key}</strong>: {trait.value}
                      </span>
                      <span style={styles.traitConfidence}>
                        confidence {trait.confidence.toFixed(2)}
                      </span>
                    </div>
                    <div style={styles.traitControls}>
                      <select
                        value={traitModes[trait.key] || 'variable'}
                        onChange={event =>
                          setTraitModes(current => ({
                            ...current,
                            [trait.key]: event.target.value as TraitMode
                          }))
                        }
                        style={styles.traitSelect}
                      >
                        <option value="locked">locked</option>
                        <option value="variable">variable</option>
                        <option value="reject">reject</option>
                      </select>
                      <label style={styles.inlineCheckbox}>
                        <input
                          type="checkbox"
                          checked={forceSynthesisKeys.includes(trait.key)}
                          onChange={() =>
                            setForceSynthesisKeys(current =>
                              current.includes(trait.key)
                                ? current.filter(key => key !== trait.key)
                                : [...current, trait.key]
                            )
                          }
                        />
                        <span>force synthesis</span>
                      </label>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.subsection}>
              <strong>Matches</strong>
              <div style={styles.matchGrid}>
                <div style={styles.matchColumn}>
                  <div style={styles.matchHeader}>Exact Matches</div>
                  {checkpoint.exactMatches.map(match => (
                    <div key={match.id} style={styles.matchCard}>
                      <strong>{match.label}</strong>
                      {getComparablePriorityBadges(match.reasonCodes).length > 0 ? (
                        <div style={styles.matchBadgeRow}>
                          {getComparablePriorityBadges(match.reasonCodes).map(badge => (
                            <span key={badge} style={styles.matchBadge}>
                              {badge}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <div style={styles.mutedLine}>
                        score {match.score.toFixed(2)} ·{' '}
                        {formatReasonCodes(match.reasonCodes)}
                      </div>
                      {match.sourceRef ? (
                        <div style={styles.mutedLine}>source {match.sourceRef}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
                <div style={styles.matchColumn}>
                  <div style={styles.matchHeader}>Comparable References</div>
                  {checkpoint.comparableMatches.map(match => (
                    <label key={match.id} style={styles.matchCard}>
                      <div style={styles.matchSelectable}>
                        <input
                          type="checkbox"
                          checked={preferredComparableMatchIds.includes(match.id)}
                          onChange={() =>
                            setPreferredComparableMatchIds(current =>
                              current.includes(match.id)
                                ? current.filter(id => id !== match.id)
                                : [...current, match.id]
                            )
                          }
                        />
                        <strong>{match.label}</strong>
                      </div>
                      {getComparablePriorityBadges(match.reasonCodes).length > 0 ? (
                        <div style={styles.matchBadgeRow}>
                          {getComparablePriorityBadges(match.reasonCodes).map(badge => (
                            <span key={badge} style={styles.matchBadge}>
                              {badge}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <div style={styles.mutedLine}>
                        score {match.score.toFixed(2)} ·{' '}
                        {formatReasonCodes(match.reasonCodes)}
                      </div>
                      {match.sourceRef ? (
                        <div style={styles.mutedLine}>source {match.sourceRef}</div>
                      ) : null}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={styles.subsection}>
              <strong>Exclude regions</strong>
              <div style={styles.assetList}>
                {regions.map(region => (
                  <label key={region.id} style={styles.assetRow}>
                    <input
                      type="checkbox"
                      checked={excludedRegionIds.includes(region.id)}
                      onChange={() =>
                        setExcludedRegionIds(current =>
                          current.includes(region.id)
                            ? current.filter(id => id !== region.id)
                            : [...current, region.id]
                        )
                      }
                    />
                    <span>{region.label || region.id}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.grid}>
              <label style={styles.field}>
                <span>Add locked traits</span>
                <input
                  value={addedLockedTraits}
                  onChange={event => setAddedLockedTraits(event.target.value)}
                  style={styles.input}
                  placeholder="weathering_level, world_palette"
                />
              </label>
              <label style={styles.field}>
                <span>Add variable traits</span>
                <input
                  value={addedVariableTraits}
                  onChange={event => setAddedVariableTraits(event.target.value)}
                  style={styles.input}
                  placeholder="damage_pattern, label_variant"
                />
              </label>
            </div>

            <label style={styles.field}>
              <span>Review notes</span>
              <textarea
                value={notes}
                onChange={event => setNotes(event.target.value)}
                style={styles.textarea}
                placeholder="preserve silhouette, vary surface wear and colorway"
              />
            </label>

            <div style={styles.summary}>
              <div>Analyses: {checkpoint.analyses.length}</div>
              <div>Uncertain traits: {checkpoint.uncertainTraits.length}</div>
              <div>Exact matches: {checkpoint.exactMatches.length}</div>
              <div>Comparable matches: {checkpoint.comparableMatches.length}</div>
            </div>

            <div style={styles.subsection}>
              <strong>Preview</strong>
              {selectedPreviewBackend ? (
                <div style={styles.mutedLine}>
                  Active bootstrap preview target:{' '}
                  {getPreviewBackendFingerprint({
                    label: selectedPreviewBackend.label,
                    model: selectedPreviewModel || selectedPreviewBackend.model,
                    profile: selectedPreviewBackend.profile
                  })}
                </div>
              ) : null}
              <div style={styles.grid}>
                {previewBackends.length > 0 ? (
                  <>
                    <label style={styles.field}>
                      <span>Bootstrap preview backend</span>
                      <select
                        value={selectedPreviewBackend?.id || ''}
                        onChange={event =>
                          onChangePreviewBackend?.(event.target.value)
                        }
                        style={styles.input}
                      >
                        {previewBackends.map(backend => (
                          <option key={backend.id} value={backend.id}>
                            {backend.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label style={styles.field}>
                      <span>Bootstrap preview model</span>
                      <select
                        value={
                          selectedPreviewModel || availablePreviewModels[0] || ''
                        }
                        onChange={event =>
                          onChangePreviewModel?.(event.target.value)
                        }
                        style={styles.input}
                        disabled={availablePreviewModels.length === 0}
                      >
                        {availablePreviewModels.map(model => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                ) : null}
                <label style={styles.field}>
                  <span>Preview count</span>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={previewCount}
                    onChange={event =>
                      setPreviewCount(
                        Math.max(
                          1,
                          Math.min(8, Number.parseInt(event.target.value || '1', 10))
                        )
                      )
                    }
                    style={styles.input}
                  />
                </label>
                <label style={styles.field}>
                  <span>Seed</span>
                  <input
                    value={previewSeedInput}
                    onChange={event => setPreviewSeedInput(event.target.value)}
                    style={styles.input}
                    placeholder="optional"
                  />
                </label>
              </div>
              <div style={styles.previewActions}>
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={isPreviewing || !canUseHostedPreview}
                  style={styles.secondaryButton}
                >
                  {isPreviewing ? 'Previewing...' : 'Generate Preview'}
                </button>
                {!canUseHostedPreview ? (
                  <span style={styles.mutedLine}>
                    Hosted preview is unavailable in this runtime mode.
                  </span>
                ) : null}
              </div>
              {previewResponse ? (
                <div style={styles.previewPanel}>
                  <div style={styles.previewMeta}>
                    <div>
                      <strong>
                        {getPreviewBackendFingerprint(previewResponse.preview.backend)}
                      </strong>
                    </div>
                    <div>
                      seed {previewResponse.preview.seed ?? 'auto'} ·{' '}
                      {previewResponse.preview.count} result
                      {previewResponse.preview.count === 1 ? '' : 's'}
                    </div>
                  </div>
                  {previewResponse.preview.promptBlueprint ? (
                    <div style={styles.previewBlueprint}>
                      {previewResponse.preview.promptBlueprint}
                    </div>
                  ) : null}
                  <div style={styles.previewGrid}>
                    {previewResponse.preview.results.map(result => (
                      <div key={result.id} style={styles.previewCard}>
                        <div style={styles.previewCardHeader}>
                          <strong>{result.id}</strong>
                          <span>seed {result.seed}</span>
                        </div>
                        <div style={styles.previewUrl}>{result.imageUrl}</div>
                        <div style={styles.previewPrompt}>{result.prompt}</div>
                        <div style={styles.previewMetadata}>
                          locked: {result.metadata.lockedTraitKeys.join(', ') || 'none'}
                        </div>
                        <div style={styles.previewMetadata}>
                          vary: {result.metadata.variableTraitKeys.join(', ') || 'none'}
                        </div>
                        {(result.metadata.forceSynthesisKeys || []).length > 0 ? (
                          <div style={styles.previewMetadata}>
                            force synth:{' '}
                            {(result.metadata.forceSynthesisKeys || []).join(', ')}
                          </div>
                        ) : null}
                        {result.metadata.guidanceNotes ? (
                          <div style={styles.previewMetadata}>
                            note: {result.metadata.guidanceNotes}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.footer}>
          <button
            onClick={handleDraftGraph}
            disabled={!checkpoint || isDrafting}
            style={styles.primaryButton}
          >
            {isDrafting
              ? isRefinementMode
                ? 'Refining...'
                : 'Drafting...'
              : isRefinementMode
                ? 'Refine And Replace'
                : 'Draft And Insert'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(10, 12, 16, 0.68)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1450,
    padding: '24px'
  },
  dialog: {
    width: 'min(980px, 100%)',
    maxHeight: '92vh',
    overflow: 'auto',
    background: '#fcfaf5',
    borderRadius: '22px',
    padding: '22px',
    boxShadow: '0 28px 80px rgba(0, 0, 0, 0.32)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '16px'
  },
  title: { margin: 0 },
  subtitle: { margin: '8px 0 0', color: '#6b7280' },
  closeButton: {
    border: '1px solid #d6d3d1',
    background: '#fff',
    borderRadius: '999px',
    padding: '10px 16px',
    cursor: 'pointer',
    height: 'fit-content'
  },
  note: {
    background: '#f3efe4',
    borderRadius: '16px',
    padding: '14px 16px',
    color: '#57534e',
    marginBottom: '18px'
  },
  promotedSeedBanner: {
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '16px',
    padding: '14px 16px',
    color: '#166534',
    marginBottom: '18px',
    display: 'grid',
    gap: '6px'
  },
  promotedSeedMeta: {
    fontSize: '13px',
    lineHeight: 1.5,
    color: '#166534'
  },
  section: {
    display: 'grid',
    gap: '14px',
    marginBottom: '18px'
  },
  sectionTitle: {
    margin: 0
  },
  subsection: {
    display: 'grid',
    gap: '10px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px'
  },
  field: {
    display: 'grid',
    gap: '6px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid #d6d3d1',
    background: '#fff'
  },
  textarea: {
    width: '100%',
    minHeight: '88px',
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid #d6d3d1',
    background: '#fff',
    resize: 'vertical'
  },
  assetList: {
    display: 'grid',
    gap: '8px'
  },
  assetRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid #e7e5e4',
    background: '#fff'
  },
  analysisSourceRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px'
  },
  traitList: {
    display: 'grid',
    gap: '8px'
  },
  traitRow: {
    display: 'grid',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid #e7e5e4',
    background: '#fff'
  },
  traitMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px'
  },
  traitControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap'
  },
  traitSelect: {
    minWidth: '120px',
    padding: '8px 10px',
    borderRadius: '10px',
    border: '1px solid #d6d3d1',
    background: '#fff'
  },
  traitConfidence: {
    color: '#6b7280',
    fontSize: '12px'
  },
  inlineCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#57534e',
    fontSize: '14px'
  },
  matchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px'
  },
  matchColumn: {
    display: 'grid',
    gap: '8px'
  },
  matchHeader: {
    fontWeight: 700
  },
  matchCard: {
    display: 'grid',
    gap: '6px',
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid #e7e5e4',
    background: '#fff'
  },
  matchSelectable: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  matchBadgeRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  matchBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '999px',
    background: '#ede9fe',
    color: '#5b21b6',
    fontSize: '11px',
    fontWeight: 700
  },
  mutedLine: {
    color: '#6b7280',
    fontSize: '13px'
  },
  summary: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    color: '#57534e',
    fontSize: '14px'
  },
  previewActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  previewPanel: {
    display: 'grid',
    gap: '10px',
    padding: '12px',
    borderRadius: '14px',
    background: '#f7f5ef',
    border: '1px solid #e7e5e4'
  },
  previewMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
    fontSize: '13px',
    color: '#44403c'
  },
  previewBlueprint: {
    padding: '10px 12px',
    borderRadius: '10px',
    background: '#fff',
    border: '1px solid #e7e5e4',
    fontSize: '12px',
    color: '#57534e',
    wordBreak: 'break-word'
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px'
  },
  previewCard: {
    display: 'grid',
    gap: '8px',
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid #e7e5e4',
    background: '#fff'
  },
  previewCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
    fontSize: '12px',
    color: '#57534e'
  },
  previewUrl: {
    fontSize: '12px',
    color: '#0f766e',
    wordBreak: 'break-all'
  },
  previewPrompt: {
    fontSize: '12px',
    color: '#44403c',
    lineHeight: 1.5
  },
  previewMetadata: {
    fontSize: '12px',
    color: '#6b7280'
  },
  error: {
    background: '#fef2f2',
    color: '#b91c1c',
    borderRadius: '12px',
    padding: '12px 14px',
    marginBottom: '16px'
  },
  emptyState: {
    color: '#6b7280'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  secondaryButton: {
    border: '1px solid #d6d3d1',
    background: '#fff',
    borderRadius: '999px',
    padding: '12px 18px',
    cursor: 'pointer'
  },
  primaryButton: {
    border: 'none',
    background: '#111827',
    color: '#fff',
    borderRadius: '999px',
    padding: '12px 18px',
    cursor: 'pointer'
  }
};

export default PsgImageBootstrapDialog;
