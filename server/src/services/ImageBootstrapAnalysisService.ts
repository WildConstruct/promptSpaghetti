import {
  PsgImageAnalysisRecordSchema,
  PsgReviewCheckpointSchema,
  type PsgAssetRef,
  type PsgComparableMatch,
  type PsgImageAnalysisRecord,
  type PsgReconciledTrait,
  type PsgReviewCheckpoint,
  type PsgReviewGuidance
} from '../../../packages/core/services/psg/contracts';
import {
  inferBootstrapModeFromAssetRole,
  inferSubjectKind,
  resolveImageBootstrapFixture,
  type MultimodalStageResult,
  type SegmentationStageResult
} from './imageBootstrapFixtures';
import {
  generateSegmentationStage,
  generateSegmentationStageAsync
} from './imageSegmentationProviders';

const EVIDENCE_WEIGHTS = {
  segmentation: 0.35,
  'multimodal-model': 0.3,
  retrieval: 0.2,
  heuristic: 0.15
} as const;

export class ImageBootstrapAnalysisService {
  analyzeAssets(params: {
    assets: PsgAssetRef[];
    userIntent?: string;
  }): {
    analyses: PsgImageAnalysisRecord[];
    exactMatches: PsgComparableMatch[];
    comparableMatches: PsgComparableMatch[];
    checkpoint: PsgReviewCheckpoint;
  } {
    const { assets, userIntent } = params;
    const analyses = assets.map(asset => this.buildImageAnalysis(asset, userIntent));
    const exactMatches = assets.map(asset =>
      this.buildExactMatch(asset, userIntent)
    );
    const comparableMatches = assets.flatMap(asset =>
      this.buildComparableMatches(asset, userIntent)
    );
    const checkpoint = this.buildReviewCheckpoint({
      analyses,
      exactMatches,
      comparableMatches
    });

    return {
      analyses,
      exactMatches,
      comparableMatches,
      checkpoint
    };
  }

  async analyzeAssetsAsync(params: {
    assets: PsgAssetRef[];
    userIntent?: string;
  }): Promise<{
    analyses: PsgImageAnalysisRecord[];
    exactMatches: PsgComparableMatch[];
    comparableMatches: PsgComparableMatch[];
    checkpoint: PsgReviewCheckpoint;
  }> {
    const { assets, userIntent } = params;
    const analyses = await Promise.all(
      assets.map(asset => this.buildImageAnalysisAsync(asset, userIntent))
    );
    const exactMatches = assets.map(asset =>
      this.buildExactMatch(asset, userIntent)
    );
    const comparableMatches = assets.flatMap(asset =>
      this.buildComparableMatches(asset, userIntent)
    );
    const checkpoint = this.buildReviewCheckpoint({
      analyses,
      exactMatches,
      comparableMatches
    });

    return {
      analyses,
      exactMatches,
      comparableMatches,
      checkpoint
    };
  }

  runSegmentationStage(asset: PsgAssetRef): SegmentationStageResult {
    return generateSegmentationStage(asset);
  }

  async runSegmentationStageAsync(
    asset: PsgAssetRef
  ): Promise<SegmentationStageResult> {
    return generateSegmentationStageAsync(asset);
  }

  runMultimodalStage(asset: PsgAssetRef, userIntent?: string): MultimodalStageResult {
    const roleLabel = asset.role || 'reference';
    const intentLabel = userIntent || 'none';

    return {
      findings: [`intent:${intentLabel}`, `semantic:${roleLabel}`],
      lockedTraitHints: [intentLabel === 'none' ? roleLabel : intentLabel],
      variableTraitHints: [roleLabel],
      comparableSearchTerms: [
        roleLabel,
        inferBootstrapModeFromAssetRole(asset.role),
        intentLabel
      ].filter(term => term !== 'none')
    };
  }

  reconcileTraitEvidence(params: {
    asset: PsgAssetRef;
    segmentation: SegmentationStageResult;
    multimodal: MultimodalStageResult;
  }): {
    lockedTraits: PsgReconciledTrait[];
    variableTraits: PsgReconciledTrait[];
  } {
    const { asset, segmentation, multimodal } = params;
    const roleLabel = asset.role || 'reference';
    const lockedValue = multimodal.lockedTraitHints[0] || roleLabel;
    const variableValue = multimodal.variableTraitHints[0] || roleLabel;
    const lockedEvidence = [
      {
        source: 'multimodal-model' as const,
        score: 0.64,
        summary: 'Mock semantic analysis result'
      },
      {
        source: 'heuristic' as const,
        score: lockedValue === roleLabel ? 0.54 : 0.42,
        summary: `Role heuristic:${roleLabel}`
      }
    ];
    const variableEvidence = [
      {
        source: 'segmentation' as const,
        score: 0.6,
        summary: segmentation.findings[0] || 'Mock segmented subject'
      },
      {
        source: 'multimodal-model' as const,
        score: 0.56,
        summary: multimodal.findings[0] || 'Mock variable trait'
      }
    ];
    const lockedConflicts =
      lockedValue !== roleLabel ? [`role:${roleLabel} differs from locked:${lockedValue}`] : [];
    const variableConflicts =
      variableValue !== roleLabel
        ? [`role:${roleLabel} differs from variable:${variableValue}`]
        : [];

    return {
      lockedTraits: [
        {
          key: 'world_style',
          value: lockedValue,
          classification: 'locked',
          confidence: this.calculateWeightedConfidence(lockedEvidence, lockedConflicts),
          provenance: ['multimodal-model', 'heuristic'],
          evidence: lockedEvidence,
          conflicts: lockedConflicts
        }
      ],
      variableTraits: [
        {
          key: 'variation_axis',
          value: variableValue,
          classification: 'variable',
          confidence: this.calculateWeightedConfidence(
            variableEvidence,
            variableConflicts
          ),
          provenance: ['segmentation', 'multimodal-model'],
          evidence: variableEvidence,
          conflicts: variableConflicts
        }
      ]
    };
  }

  buildImageAnalysis(asset: PsgAssetRef, userIntent?: string): PsgImageAnalysisRecord {
    const fixtureResolution = this.resolveFixture(asset, userIntent);
    const fixture = fixtureResolution?.fixture;
    if (fixture) {
      return PsgImageAnalysisRecordSchema.parse({
        ...fixture.buildAnalysis(asset),
        analysisSource: {
          fixtureId: fixture.id,
          selectionMode: fixtureResolution?.selectionMode
        }
      });
    }

    const segmentation = this.runSegmentationStage(asset);
    const multimodal = this.runMultimodalStage(asset, userIntent);
    const reconciled = this.reconcileTraitEvidence({
      asset,
      segmentation,
      multimodal
    });
    const variationValue = asset.role || 'reference';

    return PsgImageAnalysisRecordSchema.parse({
      assetId: asset.id,
      subjectKind: segmentation.subjectKind,
      bootstrapMode: segmentation.bootstrapMode,
      analysisSource: {
        selectionMode: 'derived'
      },
      subjects: segmentation.subjects,
      regions: segmentation.regions,
      lockedTraits: reconciled.lockedTraits,
      variableTraits: reconciled.variableTraits,
      variationAxes: [
        {
          id: `${asset.id}-axis-1`,
          label: 'variation_axis',
          kind: 'variable',
          values: [variationValue],
          confidence: 0.58,
          sourceIds: [asset.id]
        }
      ],
      segmentationFindings: segmentation.findings,
      modelFindings: multimodal.findings,
      comparableSearchTerms: multimodal.comparableSearchTerms,
      confidence: this.calculateAnalysisConfidence(reconciled)
    });
  }

  async buildImageAnalysisAsync(
    asset: PsgAssetRef,
    userIntent?: string
  ): Promise<PsgImageAnalysisRecord> {
    const fixtureResolution = this.resolveFixture(asset, userIntent);
    const fixture = fixtureResolution?.fixture;
    if (fixture) {
      return PsgImageAnalysisRecordSchema.parse({
        ...fixture.buildAnalysis(asset),
        analysisSource: {
          fixtureId: fixture.id,
          selectionMode: fixtureResolution?.selectionMode
        }
      });
    }

    const segmentation = await this.runSegmentationStageAsync(asset);
    const multimodal = this.runMultimodalStage(asset, userIntent);
    const reconciled = this.reconcileTraitEvidence({
      asset,
      segmentation,
      multimodal
    });
    const variationValue = asset.role || 'reference';

    return PsgImageAnalysisRecordSchema.parse({
      assetId: asset.id,
      subjectKind: segmentation.subjectKind,
      bootstrapMode: segmentation.bootstrapMode,
      analysisSource: {
        selectionMode: 'derived'
      },
      subjects: segmentation.subjects,
      regions: segmentation.regions,
      lockedTraits: reconciled.lockedTraits,
      variableTraits: reconciled.variableTraits,
      variationAxes: [
        {
          id: `${asset.id}-axis-1`,
          label: 'variation_axis',
          kind: 'variable',
          values: [variationValue],
          confidence: 0.58,
          sourceIds: [asset.id]
        }
      ],
      segmentationFindings: segmentation.findings,
      modelFindings: multimodal.findings,
      comparableSearchTerms: multimodal.comparableSearchTerms,
      confidence: this.calculateAnalysisConfidence(reconciled)
    });
  }

  buildExactMatch(asset: PsgAssetRef, userIntent?: string): PsgComparableMatch {
    const fixture = this.resolveFixture(asset, userIntent)?.fixture;
    if (fixture) {
      return fixture.buildComparableMatches(asset).exact;
    }

    return {
      id: `exact-${asset.id}`,
      origin: 'exact',
      kind: 'asset',
      label: asset.role || asset.id,
      score: 0.82,
      reasonCodes: ['asset-id-match', 'role-match'],
      sourceRef: asset.id
    };
  }

  buildComparableMatches(
    asset: PsgAssetRef,
    userIntent?: string
  ): PsgComparableMatch[] {
    const metadataPreferred = this.readMetadataPreferredComparables(asset);
    const fixture = this.resolveFixture(asset, userIntent)?.fixture;
    if (fixture) {
      return [...metadataPreferred, fixture.buildComparableMatches(asset).comparable].sort(
        (left, right) => right.score - left.score
      );
    }

    const heuristic = this.buildHeuristicComparable(asset, userIntent);
    const secondary = this.buildAdjacentComparable(asset, userIntent);

    const deduped = new Map<string, PsgComparableMatch>();
    [...metadataPreferred, heuristic, secondary].forEach(match => {
      if (!match) {
        return;
      }
      const key = match.sourceRef || match.label;
      if (!deduped.has(key) || (deduped.get(key)?.score || 0) < match.score) {
        deduped.set(key, match);
      }
    });

    return [...deduped.values()].sort((left, right) => right.score - left.score);
  }

  private resolveFixture(asset: PsgAssetRef, userIntent?: string) {
    return resolveImageBootstrapFixture(asset, userIntent);
  }

  private readMetadataPreferredComparables(asset: PsgAssetRef): PsgComparableMatch[] {
    const metadata = asset.metadata;
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return [];
    }

    const refs = (metadata as Record<string, unknown>)
      .imageBootstrapPreferredComparableRefs;
    if (!Array.isArray(refs)) {
      return [];
    }

    return refs
      .filter(
        ref =>
          !!ref &&
          typeof ref === 'object' &&
          typeof (ref as Record<string, unknown>).id === 'string' &&
          typeof (ref as Record<string, unknown>).label === 'string'
      )
      .map(ref => {
        const record = ref as Record<string, unknown>;
        const score =
          typeof record.score === 'number'
            ? Math.min(0.95, Math.max(0.65, record.score + 0.08))
            : 0.74;
        return {
          id: `meta-${String(record.id)}`,
          origin: 'comparable' as const,
          kind: 'asset',
          label: String(record.label),
          score: Number(score.toFixed(2)),
          reasonCodes: ['saved-reuse-signal', 'asset-bootstrap-preference'],
          sourceRef:
            typeof record.sourceRef === 'string' ? record.sourceRef : asset.id
        };
      });
  }

  private buildHeuristicComparable(
    asset: PsgAssetRef,
    userIntent?: string
  ): PsgComparableMatch {
    const roleLabel = asset.role || asset.id;
    const intent = (userIntent || '').trim().toLowerCase();
    const normalizedRole = roleLabel.toLowerCase();
    let label = roleLabel;
    let reasonCodes = ['role-similarity', 'bootstrap-mode-similarity'];
    let score = 0.61;

    if (normalizedRole.includes('prop')) {
      label = intent.includes('venue')
        ? 'venue-adjacent prop fragment'
        : 'weathered prop fragment';
      reasonCodes = ['role-similarity', 'prop-family-match'];
      score = 0.66;
    } else if (normalizedRole.includes('set') || normalizedRole.includes('environment')) {
      label = 'set-dressing companion fragment';
      reasonCodes = ['role-similarity', 'set-dressing-adjacency'];
      score = 0.64;
    } else if (normalizedRole.includes('crowd') || normalizedRole.includes('extra')) {
      label = 'crowd-adjacent archetype fragment';
      reasonCodes = ['role-similarity', 'archetype-adjacency'];
      score = 0.63;
    }

    return {
      id: `comp-${asset.id}-primary`,
      origin: 'comparable',
      kind: 'asset',
      label,
      score,
      reasonCodes,
      sourceRef: asset.id
    };
  }

  private buildAdjacentComparable(
    asset: PsgAssetRef,
    userIntent?: string
  ): PsgComparableMatch | null {
    const roleLabel = (asset.role || asset.id).toLowerCase();
    const intent = (userIntent || '').toLowerCase();

    if (roleLabel.includes('prop')) {
      return {
        id: `comp-${asset.id}-adjacent`,
        origin: 'comparable',
        kind: 'asset',
        label: intent.includes('variation')
          ? 'set-dressing adjacent prop'
          : 'companion venue prop',
        score: 0.58,
        reasonCodes: ['adjacent-family', 'world-fit'],
        sourceRef: `${asset.id}:adjacent`
      };
    }

    if (roleLabel.includes('crowd') || roleLabel.includes('extra')) {
      return {
        id: `comp-${asset.id}-adjacent`,
        origin: 'comparable',
        kind: 'crowd-archetype',
        label: 'supporting crowd archetype fragment',
        score: 0.57,
        reasonCodes: ['adjacent-family', 'crowd-supporting-role'],
        sourceRef: `${asset.id}:adjacent`
      };
    }

    return null;
  }

  buildReviewCheckpoint(params: {
    analyses: PsgImageAnalysisRecord[];
    exactMatches: PsgComparableMatch[];
    comparableMatches: PsgComparableMatch[];
    guidance?: PsgReviewGuidance;
  }): PsgReviewCheckpoint {
    const { analyses, exactMatches, comparableMatches, guidance } = params;
    const bootstrapMode = analyses[0]?.bootstrapMode;
    const uncertainTraits = analyses.flatMap(analysis =>
      [...analysis.lockedTraits, ...analysis.variableTraits].filter(
        trait => trait.confidence < 0.7
      )
    );

    return PsgReviewCheckpointSchema.parse({
      reviewId: `review-${Date.now()}`,
      bootstrapMode,
      analyses,
      exactMatches,
      comparableMatches,
      uncertainTraits,
      guidance
    });
  }

  applyReviewGuidance(params: {
    checkpoint: PsgReviewCheckpoint;
    guidance: PsgReviewGuidance;
  }): PsgReviewCheckpoint {
    const { checkpoint, guidance } = params;
    const explicitFixtureSelections = guidance.explicitFixtureSelections || [];
    const analyses = checkpoint.analyses.map(analysis => {
      const nextSubjects = analysis.subjects.map(subject => ({
        ...subject,
        primary: guidance.primarySubjectId
          ? subject.id === guidance.primarySubjectId
          : subject.primary
      }));
      const nextRegions = analysis.regions.filter(
        region => !guidance.excludedRegionIds.includes(region.id)
      );
      const nextLockedTraits = [
        ...analysis.lockedTraits.map(trait =>
          this.applyTraitGuidance(trait, 'locked', guidance)
        ),
        ...guidance.addedLockedTraits.map(value =>
          this.buildHumanGuidedTrait(value, 'locked')
        )
      ].filter(Boolean) as PsgReconciledTrait[];
      const nextVariableTraits = [
        ...analysis.variableTraits.map(trait =>
          this.applyTraitGuidance(trait, 'variable', guidance)
        ),
        ...guidance.addedVariableTraits.map(value =>
          this.buildHumanGuidedTrait(value, 'variable')
        )
      ].filter(Boolean) as PsgReconciledTrait[];
      const nextBootstrapMode = guidance.bootstrapMode || analysis.bootstrapMode;
      const explicitFixtureSelection = explicitFixtureSelections.find(
        selection =>
          selection.assetId === analysis.assetId &&
          selection.fixtureId === analysis.analysisSource?.fixtureId
      );
      const updatedAnalysis = {
        ...analysis,
        bootstrapMode: nextBootstrapMode,
        analysisSource: analysis.analysisSource
          ? {
              ...analysis.analysisSource,
              selectionMode: explicitFixtureSelection
                ? 'explicit'
                : analysis.analysisSource.selectionMode
            }
          : analysis.analysisSource,
        subjects: nextSubjects,
        regions: nextRegions,
        lockedTraits: nextLockedTraits,
        variableTraits: nextVariableTraits,
        confidence: this.calculateAnalysisConfidence({
          lockedTraits: nextLockedTraits,
          variableTraits: nextVariableTraits
        })
      };

      return PsgImageAnalysisRecordSchema.parse(updatedAnalysis);
    });
    const comparableMatches = this.prioritizeComparableMatches(
      checkpoint.comparableMatches,
      guidance.preferredComparableMatchIds
    );

    return this.buildReviewCheckpoint({
      analyses,
      exactMatches: checkpoint.exactMatches,
      comparableMatches,
      guidance
    });
  }

  private calculateWeightedConfidence(
    evidence: Array<{ source: keyof typeof EVIDENCE_WEIGHTS; score: number }>,
    conflicts: string[]
  ) {
    const weightedScore = evidence.reduce(
      (total, item) => total + item.score * EVIDENCE_WEIGHTS[item.source],
      0
    );
    const totalWeight = evidence.reduce(
      (total, item) => total + EVIDENCE_WEIGHTS[item.source],
      0
    );
    const baseScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
    const conflictPenalty = Math.min(conflicts.length * 0.08, 0.24);

    return Number(Math.max(0, Math.min(1, baseScore - conflictPenalty)).toFixed(2));
  }

  private calculateAnalysisConfidence(reconciled: {
    lockedTraits: PsgReconciledTrait[];
    variableTraits: PsgReconciledTrait[];
  }) {
    const traits = [...reconciled.lockedTraits, ...reconciled.variableTraits];
    if (traits.length === 0) {
      return 0;
    }

    const total = traits.reduce((sum, trait) => sum + trait.confidence, 0);
    return Number((total / traits.length).toFixed(2));
  }

  private applyTraitGuidance(
    trait: PsgReconciledTrait,
    fallbackClassification: 'locked' | 'variable',
    guidance: PsgReviewGuidance
  ) {
    if (guidance.rejectedTraitKeys.includes(trait.key)) {
      return null;
    }

    let classification = trait.classification;
    if (guidance.lockedTraitKeys.includes(trait.key)) {
      classification = 'locked';
    } else if (guidance.variableTraitKeys.includes(trait.key)) {
      classification = 'variable';
    } else if (classification === 'unknown') {
      classification = fallbackClassification;
    }

    const humanAdjusted =
      guidance.lockedTraitKeys.includes(trait.key) ||
      guidance.variableTraitKeys.includes(trait.key) ||
      guidance.forceSynthesisKeys.includes(trait.key);
    const nextEvidence = humanAdjusted
      ? [
          ...trait.evidence,
          {
            source: 'human' as const,
            score: 1,
            summary: `User confirmed ${classification} classification`
          }
        ]
      : trait.evidence;
    const nextProvenance = humanAdjusted
      ? Array.from(new Set([...trait.provenance, 'human']))
      : trait.provenance;
    const nextConflicts = guidance.forceSynthesisKeys.includes(trait.key)
      ? [...trait.conflicts, `user requested synthesis for ${trait.key}`]
      : trait.conflicts;
    const nextConfidence = humanAdjusted
      ? Number(Math.min(1, trait.confidence + 0.25).toFixed(2))
      : trait.confidence;

    return {
      ...trait,
      classification,
      evidence: nextEvidence,
      provenance: nextProvenance,
      conflicts: nextConflicts,
      confidence: nextConfidence
    };
  }

  private buildHumanGuidedTrait(
    value: string,
    classification: 'locked' | 'variable'
  ): PsgReconciledTrait {
    return {
      key: value,
      value,
      classification,
      confidence: 0.95,
      provenance: ['human'],
      evidence: [
        {
          source: 'human',
          score: 1,
          summary: 'User added trait during review'
        }
      ],
      conflicts: []
    };
  }

  private prioritizeComparableMatches(
    matches: PsgComparableMatch[],
    preferredIds: string[]
  ) {
    if (preferredIds.length === 0) {
      return matches;
    }

    const preferred = new Set(preferredIds);
    return [...matches].sort((left, right) => {
      const leftPreferred = preferred.has(left.id) ? 1 : 0;
      const rightPreferred = preferred.has(right.id) ? 1 : 0;
      if (leftPreferred !== rightPreferred) {
        return rightPreferred - leftPreferred;
      }
      return right.score - left.score;
    });
  }
}
