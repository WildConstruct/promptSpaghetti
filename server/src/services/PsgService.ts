import {
  parsePsgWithCompatibility,
  type PSGFile
} from '../../../packages/core/fileFormats/psg';
import {
  PSG_OPERATIONS,
  PSG_DOCUMENT_KINDS,
  PSG_EXPORT_TARGETS,
  PSG_PROTOCOL_VERSION,
  PsgAssetRefSchema,
  PsgCapabilitiesResponseSchema,
  PsgComfyWorkflowSchema,
  PsgCrowdPlanSchema,
  PsgDocumentInputSchema,
  PsgDocumentSchema,
  PsgReviewCheckpointSchema,
  PsgReviewGuidanceSchema,
  PsgSceneAssemblyPlanSchema,
  type PsgCapabilitiesResponse,
  type PsgAssetRef,
  type PsgCrowdArchetype,
  type PsgCrowdMember,
  type PsgComfyNode,
  type PsgDocument,
  type PsgDocumentInput,
  type PsgGenerationBatchRequest,
  type PsgImagePreviewRequestBody,
  type PsgReviewCheckpoint,
  type PsgReviewGuidance,
  type PsgSceneAssemblyPlan,
  type PsgValidationIssue
} from '../../../packages/core/services/psg/contracts';
import { ImageBootstrapAnalysisService } from './ImageBootstrapAnalysisService';
import {
  listPreviewBackends,
  resolvePreviewBackend
} from './imagePreviewBackends';
import { generatePreviewPayload } from './imagePreviewProviders';

type NormalizeDocumentResult = {
  document: PsgDocument;
  changed: boolean;
  issues: PsgValidationIssue[];
};

type ValidateFragmentResult = {
  issues: PsgValidationIssue[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function looksLikeFlatPsgDocument(value: unknown): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    typeof value.version === 'string' &&
    Array.isArray(value.nodes) &&
    Array.isArray(value.edges)
  );
}

function buildMetadata(
  metadata: PsgDocument['metadata'],
  sourceFragment?: PSGFile
): PsgDocument['metadata'] {
  return {
    ...metadata,
    name: metadata.name || sourceFragment?.name,
    description: metadata.description || sourceFragment?.description,
    tags: metadata.tags || sourceFragment?.metadata?.tags,
    updatedAt: metadata.updatedAt || new Date().toISOString()
  };
}

function buildIssue(
  code: string,
  message: string,
  severity: 'error' | 'warning',
  path?: string
): PsgValidationIssue {
  return { code, message, severity, path };
}

function stableVariantValue(
  axis: string,
  memberIndex: number,
  axisIndex: number
): string {
  const normalizedAxis = axis.trim().toLowerCase().replace(/\s+/g, '-');
  const slot = ((memberIndex + axisIndex) % 3) + 1;
  return `${normalizedAxis}-${slot}`;
}

export class PsgService {
  private imageBootstrapAnalysis = new ImageBootstrapAnalysisService();

  getCapabilities(): PsgCapabilitiesResponse {
    return PsgCapabilitiesResponseSchema.parse({
      ok: true,
      version: PSG_PROTOCOL_VERSION,
      supportedKinds: [...PSG_DOCUMENT_KINDS],
      operations: [...PSG_OPERATIONS],
      exportTargets: [...PSG_EXPORT_TARGETS],
      previewBackends: listPreviewBackends()
    });
  }

  validateDocument(input: unknown) {
    try {
      const normalized = this.normalizeDocument(input);
      const issues =
        normalized.document.kind === 'fragment' && normalized.document.fragment
          ? [
              ...normalized.issues,
              ...this.validateFragment(normalized.document.fragment).issues
            ]
          : normalized.issues;

      return {
        ok: true as const,
        valid: !issues.some(issue => issue.severity === 'error'),
        normalized: normalized.changed,
        kind: normalized.document.kind,
        issues,
        document: normalized.document
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Invalid PSG document';

      return {
        ok: true as const,
        valid: false,
        normalized: false,
        issues: [buildIssue('INVALID_DOCUMENT', message, 'error')]
      };
    }
  }

  normalizeDocument(input: unknown): NormalizeDocumentResult {
    const documentInput = this.coerceDocumentInput(input);
    const metadata = documentInput.metadata || {};
    const assets = Array.isArray(documentInput.assets)
      ? documentInput.assets.map(asset => PsgAssetRefSchema.parse(asset))
      : [];
    const scene = documentInput.scene
      ? PsgSceneAssemblyPlanSchema.parse(documentInput.scene)
      : undefined;

    if (documentInput.kind === 'fragment') {
      const fragment = parsePsgWithCompatibility(
        JSON.stringify(documentInput.fragment)
      );
      const document = PsgDocumentSchema.parse({
        version: PSG_PROTOCOL_VERSION,
        kind: 'fragment',
        metadata: buildMetadata(metadata, fragment),
        fragment,
        assets,
        scene
      });

      return {
        document,
        changed: JSON.stringify(input) !== JSON.stringify(document),
        issues: []
      };
    }

    if (documentInput.kind === 'scene-plan') {
      const document = PsgDocumentSchema.parse({
        version: PSG_PROTOCOL_VERSION,
        kind: 'scene-plan',
        metadata: buildMetadata(metadata),
        assets,
        scene
      });

      return {
        document,
        changed: JSON.stringify(input) !== JSON.stringify(document),
        issues: []
      };
    }

    const crowd = PsgCrowdPlanSchema.parse(documentInput.crowd);
    const document = PsgDocumentSchema.parse({
      version: PSG_PROTOCOL_VERSION,
      kind: 'crowd-plan',
      metadata: buildMetadata(metadata),
      crowd,
      assets,
      scene
    });

    return {
      document,
      changed: JSON.stringify(input) !== JSON.stringify(document),
      issues: []
    };
  }

  registerAssets(input: unknown, assetsInput: PsgAssetRef[]) {
    const normalized = this.normalizeDocument(input);
    const nextDocument = this.mergeAssets(normalized.document, assetsInput);

    return {
      ok: true as const,
      document: nextDocument,
      registeredAssets: assetsInput,
      issues: normalized.issues
    };
  }

  deriveAsset(input: unknown, assetInput: PsgAssetRef) {
    const normalized = this.normalizeDocument(input);
    const asset = PsgAssetRefSchema.parse(assetInput);
    const issues = [...normalized.issues];
    const parentIds = asset.provenance.parentAssetIds || [];
    const knownAssetIds = new Set(normalized.document.assets.map(entry => entry.id));

    parentIds.forEach(parentId => {
      if (!knownAssetIds.has(parentId)) {
        issues.push(
          buildIssue(
            'UNKNOWN_PARENT_ASSET',
            `Derived asset "${asset.id}" references unknown parent asset "${parentId}"`,
            'warning',
            'asset.provenance.parentAssetIds'
          )
        );
      }
    });

    const nextDocument = this.mergeAssets(normalized.document, [asset]);
    return {
      ok: true as const,
      document: nextDocument,
      asset,
      issues
    };
  }

  expandCrowd(input: unknown) {
    const normalized = this.normalizeDocument(input);

    if (normalized.document.kind !== 'crowd-plan' || !normalized.document.crowd) {
      throw new Error('Crowd expansion requires a crowd-plan document');
    }

    const crowd = normalized.document.crowd;
    const pool = this.buildArchetypePool(crowd.archetypes);
    const zones = crowd.placement?.zones?.length
      ? crowd.placement.zones
      : undefined;

    const members: PsgCrowdMember[] = Array.from({ length: crowd.count }).map(
      (_, index) => {
        const archetype = pool[index % pool.length];
        const variation = Object.fromEntries(
          crowd.variationAxes.map((axis, axisIndex) => [
            axis,
            stableVariantValue(axis, index, axisIndex)
          ])
        );
        const zone = zones ? zones[index % zones.length] : undefined;
        const density = crowd.placement?.density;
        const promptHints = [archetype.label];

        if (zone) {
          promptHints.push(zone);
        }

        if (density) {
          promptHints.push(`${density}-density`);
        }

        Object.entries(variation).forEach(([axis, value]) => {
          promptHints.push(`${axis}:${value}`);
        });

        return {
          id: `${archetype.id}-${index + 1}`,
          archetypeId: archetype.id,
          label: `${archetype.label} ${index + 1}`,
          zone,
          density,
          variation,
          promptHints,
          fragment: archetype.fragment
        };
      }
    );

    return {
      ok: true as const,
      kind: 'crowd-plan' as const,
      document: normalized.document,
      members,
      issues: normalized.issues
    };
  }

  exportComfy(input: unknown) {
    const normalized = this.normalizeDocument(input);

    if (normalized.document.kind !== 'fragment' || !normalized.document.fragment) {
      throw new Error('Comfy export currently supports fragment documents only');
    }

    const fragment = normalized.document.fragment;
    const nodeIdMap = new Map<string, string>(
      fragment.nodes.map((node, index) => [node.id, String(index + 1)])
    );
    const edgeOrder = new Map<string, number>();
    const nodes: Record<string, PsgComfyNode> = {};

    fragment.nodes.forEach(node => {
      const comfyId = nodeIdMap.get(node.id);
      if (!comfyId) {
        return;
      }
      nodes[comfyId] = {
        id: comfyId,
        class_type: this.mapNodeTypeToComfyClass(node.type),
        inputs: this.buildBaseComfyInputs(node),
        _meta: {
          title: node.name || node.id,
          promptscapeType: node.type
        }
      };
    });

    fragment.edges.forEach(edge => {
      const targetId = nodeIdMap.get(edge.target);
      const sourceId = nodeIdMap.get(edge.source);
      if (!targetId || !sourceId) {
        return;
      }

      const currentCount = edgeOrder.get(edge.target) || 0;
      edgeOrder.set(edge.target, currentCount + 1);

      const key =
        edge.targetHandle ||
        edge.sourceHandle ||
        `input_${currentCount + 1}`;

      nodes[targetId].inputs[key] = [sourceId, 0];
    });

    const workflow = PsgComfyWorkflowSchema.parse({
      version: 'promptscape-comfy/1',
      metadata: {
        name:
          normalized.document.metadata.name ||
          fragment.name ||
          'Untitled PSG Export',
        description:
          normalized.document.metadata.description || fragment.description,
        sourceKind: normalized.document.kind,
        sourceVersion: PSG_PROTOCOL_VERSION
      },
      nodes,
      outputNodeIds: fragment.nodes
        .filter(node => node.type === 'Output')
        .map(node => nodeIdMap.get(node.id))
        .filter((value): value is string => typeof value === 'string'),
      assetRefs: normalized.document.assets.map(asset => asset.id),
      placements: normalized.document.scene?.placements || []
    });

    return {
      ok: true as const,
      target: 'comfy' as const,
      document: normalized.document,
      workflow,
      issues: normalized.issues
    };
  }

  assembleScene(input: unknown) {
    const normalized = this.normalizeDocument(input);
    const assembly = this.buildSceneAssembly(normalized.document);

    return {
      ok: true as const,
      document: PsgDocumentSchema.parse({
        ...normalized.document,
        scene: assembly
      }),
      assembly,
      issues: normalized.issues
    };
  }

  registerImageBatch(input: unknown, assetsInput: PsgAssetRef[]) {
    return this.registerAssets(input, assetsInput);
  }

  async analyzeImages(input: unknown, assetIds: string[], userIntent?: string) {
    const normalized = this.normalizeDocument(input);
    const matchedAssets = normalized.document.assets.filter(asset =>
      assetIds.includes(asset.id)
    );
    const { analyses, exactMatches, comparableMatches, checkpoint } =
      await this.imageBootstrapAnalysis.analyzeAssetsAsync({
        assets: matchedAssets,
        userIntent
      });

    return {
      ok: true as const,
      document: normalized.document,
      analyses,
      exactMatches,
      comparableMatches,
      checkpoint,
      issues: normalized.issues
    };
  }

  applyImageReview(
    input: unknown,
    checkpointInput: PsgReviewCheckpoint,
    guidanceInput: PsgReviewGuidance
  ) {
    const normalized = this.normalizeDocument(input);
    const guidance = PsgReviewGuidanceSchema.parse(guidanceInput);
    const checkpoint = this.imageBootstrapAnalysis.applyReviewGuidance({
      checkpoint: PsgReviewCheckpointSchema.parse({
        ...checkpointInput,
        guidance
      }),
      guidance
    });

    return {
      ok: true as const,
      document: normalized.document,
      checkpoint,
      issues: normalized.issues
    };
  }

  draftGraphFromImages(input: unknown, checkpointInput: PsgReviewCheckpoint) {
    const normalized = this.normalizeDocument(input);
    const checkpoint = PsgReviewCheckpointSchema.parse(checkpointInput);
    const bootstrapMode =
      checkpoint.guidance?.bootstrapMode ||
      checkpoint.bootstrapMode ||
      checkpoint.analyses[0]?.bootstrapMode ||
      'character-variation';
    const preferredComparableIds =
      checkpoint.guidance?.preferredComparableMatchIds || [];
    const preferredComparables = checkpoint.comparableMatches.filter(match =>
      preferredComparableIds.includes(match.id)
    );
    const preferredComparableRefs = preferredComparables.map(match => ({
      id: match.id,
      label: match.label,
      origin: match.origin,
      score: match.score,
      sourceRef: match.sourceRef,
      reasonCodes: match.reasonCodes
    }));
    const forceSynthesisKeys = checkpoint.guidance?.forceSynthesisKeys || [];
    const variableTraits = checkpoint.analyses[0]?.variableTraits || [];
    const analysisSources = checkpoint.analyses.map(analysis => ({
      assetId: analysis.assetId,
      fixtureId: analysis.analysisSource?.fixtureId,
      selectionMode: analysis.analysisSource?.selectionMode
    }));
    const traitKeys = variableTraits.length > 0
      ? variableTraits.map(trait => trait.key)
      : ['variation'];
    const traitLabels = traitKeys.length > 0 ? traitKeys : ['variation'];

    const draftFragment = {
      version: '1.0.0',
      name: `Image Bootstrap Draft (${bootstrapMode})`,
      metadata: {
        imageBootstrap: {
          bootstrapMode,
          reviewId: checkpoint.reviewId,
          preferredComparableRefs,
          forceSynthesisKeys,
          lockedTraitKeys: checkpoint.guidance?.lockedTraitKeys || [],
          variableTraitKeys: checkpoint.guidance?.variableTraitKeys || [],
          notes: checkpoint.guidance?.notes || '',
          assetIds: checkpoint.analyses.map(analysis => analysis.assetId),
          analysisSources
        }
      },
      nodes: [
        {
          id: 'n1',
          type: 'TextBlock',
          x: 0,
          y: 0,
          value: checkpoint.guidance?.notes || `${bootstrapMode} reference`,
          data: {
            bootstrapMode,
            preferredComparableRefs,
            forceSynthesisKeys,
            lockedTraitKeys: checkpoint.guidance?.lockedTraitKeys || [],
            variableTraitKeys: checkpoint.guidance?.variableTraitKeys || [],
            notes: checkpoint.guidance?.notes || '',
            assetIds: checkpoint.analyses.map(analysis => analysis.assetId),
            analysisSources
          }
        },
        {
          id: 'n2',
          type: 'WeightedChoice',
          x: 220,
          y: 0,
          data: {
            bootstrapMode,
            preferredComparableRefs,
            forceSynthesisKeys,
            lockedTraitKeys: checkpoint.guidance?.lockedTraitKeys || [],
            variableTraitKeys: checkpoint.guidance?.variableTraitKeys || [],
            notes: checkpoint.guidance?.notes || '',
            assetIds: checkpoint.analyses.map(analysis => analysis.assetId),
            analysisSources
          },
          options: traitLabels.map((label, index) => {
            const trait = variableTraits.find(candidate => candidate.key === label);
            return {
              id: `opt-${index + 1}`,
              label,
              text: trait?.value || label,
              weight: 1,
              meta: {
                traitKey: label,
                classification: trait?.classification || 'variable',
                forceSynthesis: forceSynthesisKeys.includes(label),
                preferredComparableRefs
              }
            };
          })
        },
        {
          id: 'n3',
          type: 'Output',
          x: 440,
          y: 0,
          template: '{n1} {n2}',
          data: {
            bootstrapMode,
            preferredComparableRefs,
            forceSynthesisKeys,
            lockedTraitKeys: checkpoint.guidance?.lockedTraitKeys || [],
            variableTraitKeys: checkpoint.guidance?.variableTraitKeys || [],
            notes: checkpoint.guidance?.notes || '',
            assetIds: checkpoint.analyses.map(analysis => analysis.assetId),
            analysisSources
          }
        }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n3' },
        { id: 'e2', source: 'n2', target: 'n3' }
      ]
    };

    return {
      ok: true as const,
      document: normalized.document,
      draftFragment,
      checkpoint,
      issues: normalized.issues
    };
  }

  async previewImages(
    input: unknown,
    checkpointInput: PsgReviewCheckpoint,
    requestInput: PsgImagePreviewRequestBody
  ) {
    const normalized = this.normalizeDocument(input);
    const checkpoint = PsgReviewCheckpointSchema.parse(checkpointInput);
    const request = requestInput;
    const resolvedPreview = resolvePreviewBackend(request);
    const generated = await generatePreviewPayload({
      document: normalized.document,
      checkpoint,
      request,
      resolvedBackend: resolvedPreview
    });

    return {
      ok: true as const,
      document: normalized.document,
      checkpoint,
      preview: generated.preview,
      issues: [...normalized.issues, ...resolvedPreview.issues, ...generated.issues]
    };
  }

  generateImageBatch(
    input: unknown,
    checkpointInput: PsgReviewCheckpoint,
    requestInput: PsgGenerationBatchRequest
  ) {
    const normalized = this.normalizeDocument(input);
    const checkpoint = PsgReviewCheckpointSchema.parse(checkpointInput);
    const request = requestInput;
    const locked = checkpoint.guidance?.lockedTraitKeys || request.lockTraitKeys;
    const variable =
      checkpoint.guidance?.variableTraitKeys || request.varyTraitKeys;

    return {
      ok: true as const,
      document: normalized.document,
      checkpoint,
      batch: {
        count: request.count,
        seed: request.seed,
        promptBlueprint: `locked:${locked.join(',') || 'world'} | vary:${variable.join(',') || 'details'}`,
        previewAssetIds: normalized.document.assets.map(asset => asset.id)
      },
      issues: normalized.issues
    };
  }

  private coerceDocumentInput(input: unknown): PsgDocumentInput {
    if (looksLikeFlatPsgDocument(input)) {
      return PsgDocumentInputSchema.parse({
        version: PSG_PROTOCOL_VERSION,
        kind: 'fragment',
        metadata: {
          name: typeof input.name === 'string' ? input.name : undefined,
          description:
            typeof input.description === 'string' ? input.description : undefined
        },
        fragment: input
      });
    }

    return PsgDocumentInputSchema.parse(input);
  }

  private validateFragment(fragment: PSGFile): ValidateFragmentResult {
    const issues: PsgValidationIssue[] = [];
    const nodeIds = new Set<string>();
    const edgeIds = new Set<string>();

    fragment.nodes.forEach((node, index) => {
      if (nodeIds.has(node.id)) {
        issues.push(
          buildIssue(
            'DUPLICATE_NODE_ID',
            `Duplicate node id "${node.id}" detected`,
            'error',
            `fragment.nodes.${index}.id`
          )
        );
      } else {
        nodeIds.add(node.id);
      }
    });

    fragment.edges.forEach((edge, index) => {
      if (edgeIds.has(edge.id)) {
        issues.push(
          buildIssue(
            'DUPLICATE_EDGE_ID',
            `Duplicate edge id "${edge.id}" detected`,
            'error',
            `fragment.edges.${index}.id`
          )
        );
      } else {
        edgeIds.add(edge.id);
      }

      if (!nodeIds.has(edge.source)) {
        issues.push(
          buildIssue(
            'MISSING_SOURCE_NODE',
            `Edge "${edge.id}" references missing source node "${edge.source}"`,
            'error',
            `fragment.edges.${index}.source`
          )
        );
      }

      if (!nodeIds.has(edge.target)) {
        issues.push(
          buildIssue(
            'MISSING_TARGET_NODE',
            `Edge "${edge.id}" references missing target node "${edge.target}"`,
            'error',
            `fragment.edges.${index}.target`
          )
        );
      }
    });

    if (!fragment.nodes.some(node => node.type === 'Output')) {
      issues.push(
        buildIssue(
          'NO_OUTPUT_NODE',
          'Fragment has no Output node; this may be intentional for library fragments',
          'warning',
          'fragment.nodes'
        )
      );
    }

    return { issues };
  }

  private buildArchetypePool(archetypes: PsgCrowdArchetype[]) {
    const pool = archetypes.flatMap(archetype =>
      Array.from({ length: Math.max(1, Math.round(archetype.weight || 1)) }).map(
        () => archetype
      )
    );

    return pool.length > 0 ? pool : archetypes;
  }

  private mergeAssets(document: PsgDocument, incomingAssets: PsgAssetRef[]) {
    const nextAssets = new Map(document.assets.map(asset => [asset.id, asset]));
    incomingAssets.forEach(asset => {
      nextAssets.set(asset.id, PsgAssetRefSchema.parse(asset));
    });

    return PsgDocumentSchema.parse({
      ...document,
      assets: Array.from(nextAssets.values())
    });
  }

  private buildSceneAssembly(document: PsgDocument): PsgSceneAssemblyPlan {
    if (document.scene) {
      return PsgSceneAssemblyPlanSchema.parse(document.scene);
    }

    const stillAssetIds = document.assets
      .filter(asset =>
        asset.kind === 'reference-still' ||
        asset.kind === 'style-reference' ||
        asset.kind === 'pose-reference' ||
        asset.kind === 'character-sheet' ||
        asset.kind === 'render-output'
      )
      .map(asset => asset.id);
    const motionAssetIds = document.assets
      .filter(asset =>
        asset.kind === 'motion-plate' || asset.kind === 'alpha-sequence'
      )
      .map(asset => asset.id);

    return PsgSceneAssemblyPlanSchema.parse({
      stillAssetIds,
      motionAssetIds,
      placements: [],
      crowdMembers: [],
      renderTargets: []
    });
  }

  private buildBaseComfyInputs(node: PSGFile['nodes'][number]) {
    switch (node.type) {
      case 'TextBlock':
        return {
          text:
            typeof node.value === 'string'
              ? node.value
              : typeof node.data?.value === 'string'
                ? node.data.value
                : ''
        };
      case 'Output':
        return {
          template: node.template || ''
        };
      case 'Concat':
        return {
          separator:
            typeof node.value === 'string'
              ? node.value
              : typeof node.data?.separator === 'string'
                ? node.data.separator
                : ''
        };
      case 'WeightedChoice':
        return {
          options: Array.isArray(node.options) ? node.options : []
        };
      default:
        return node.data && typeof node.data === 'object' ? { ...node.data } : {};
    }
  }

  private mapNodeTypeToComfyClass(nodeType: string): string {
    switch (nodeType) {
      case 'TextBlock':
        return 'PromptScapeText';
      case 'WeightedChoice':
        return 'PromptScapeWeightedChoice';
      case 'Concat':
        return 'PromptScapeConcat';
      case 'Output':
        return 'PromptScapeOutput';
      default:
        return `PromptScape${nodeType}`;
    }
  }
}
