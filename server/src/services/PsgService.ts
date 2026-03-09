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
  PsgSceneAssemblyPlanSchema,
  type PsgCapabilitiesResponse,
  type PsgAssetRef,
  type PsgCrowdArchetype,
  type PsgCrowdMember,
  type PsgComfyNode,
  type PsgDocument,
  type PsgDocumentInput,
  type PsgSceneAssemblyPlan,
  type PsgValidationIssue
} from '../../../packages/core/services/psg/contracts';

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
  getCapabilities(): PsgCapabilitiesResponse {
    return PsgCapabilitiesResponseSchema.parse({
      ok: true,
      version: PSG_PROTOCOL_VERSION,
      supportedKinds: [...PSG_DOCUMENT_KINDS],
      operations: [...PSG_OPERATIONS],
      exportTargets: [...PSG_EXPORT_TARGETS]
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
    const nodeIdMap = new Map(
      fragment.nodes.map((node, index) => [node.id, String(index + 1)])
    );
    const edgeOrder = new Map<string, number>();
    const nodes: Record<string, PsgComfyNode> = {};

    fragment.nodes.forEach(node => {
      const comfyId = nodeIdMap.get(node.id)!;
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
