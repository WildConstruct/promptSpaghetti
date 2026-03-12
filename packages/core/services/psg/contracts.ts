import { z } from 'zod';
import { PSGFileSchema, type PSGFile } from '../../fileFormats/psg';

// Keep the portable .psg file flat and JSON-first.
// These richer document contracts are for API/runtime workflows layered around it.
export const PSG_PROTOCOL_VERSION = 'psg/1' as const;

export const PSG_DOCUMENT_KINDS = [
  'fragment',
  'crowd-plan',
  'scene-plan'
] as const;

export const PSG_EXPORT_TARGETS = ['comfy'] as const;

export const PSG_OPERATIONS = [
  'validate',
  'normalize',
  'expand-crowd',
  'export-comfy',
  'assets-register',
  'assets-derive',
  'scene-assemble'
] as const;

export const PSG_ASSET_KINDS = [
  'reference-still',
  'style-reference',
  'pose-reference',
  'character-sheet',
  'motion-plate',
  'alpha-sequence',
  'depth-pass',
  'mask',
  'comfy-workflow',
  'render-output'
] as const;

export const PSG_STORAGE_PROVIDERS = [
  'local',
  'supabase',
  's3',
  'blob'
] as const;

export const PSG_ASSET_SOURCES = ['upload', 'generated', 'derived'] as const;

export const PsgDocumentKindSchema = z.enum(PSG_DOCUMENT_KINDS);
export const PsgOperationSchema = z.enum(PSG_OPERATIONS);
export const PsgAssetKindSchema = z.enum(PSG_ASSET_KINDS);
export const PsgStorageProviderSchema = z.enum(PSG_STORAGE_PROVIDERS);
export const PsgAssetSourceSchema = z.enum(PSG_ASSET_SOURCES);

export const PsgProtocolMetadataSchema = z
  .object({
    id: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string().min(1)).optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional()
  })
  .strict();

export const PsgCrowdArchetypeSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    weight: z.number().positive().max(10).optional(),
    graphRef: z.string().min(1).optional(),
    fragment: PSGFileSchema.optional(),
    overrides: z.record(z.unknown()).optional()
  })
  .strict();

export const PsgCrowdPlacementSchema = z
  .object({
    zones: z.array(z.string().min(1)).max(20).optional(),
    density: z.enum(['sparse', 'medium', 'dense']).optional()
  })
  .strict();

export const PsgAssetStorageSchema = z
  .object({
    provider: PsgStorageProviderSchema,
    uri: z.string().min(1),
    contentType: z.string().min(1).optional()
  })
  .strict();

export const PsgAssetProvenanceSchema = z
  .object({
    source: PsgAssetSourceSchema,
    model: z.string().min(1).optional(),
    vendor: z.string().min(1).optional(),
    workflowId: z.string().min(1).optional(),
    generatedAt: z.string().optional(),
    parentAssetIds: z.array(z.string().min(1)).max(100).optional(),
    promptHash: z.string().min(1).optional()
  })
  .strict();

export const PsgAssetRefSchema = z
  .object({
    id: z.string().min(1),
    kind: PsgAssetKindSchema,
    role: z.string().min(1).optional(),
    storage: PsgAssetStorageSchema,
    provenance: PsgAssetProvenanceSchema,
    tags: z.array(z.string().min(1)).max(50).optional(),
    metadata: z.record(z.unknown()).optional()
  })
  .strict();

export const PsgScenePlacementSchema = z
  .object({
    id: z.string().min(1),
    assetId: z.string().min(1),
    memberId: z.string().min(1).optional(),
    zone: z.string().min(1).optional(),
    x: z.number().finite().optional(),
    y: z.number().finite().optional(),
    depthLayer: z.number().int().min(0).max(100).optional(),
    scale: z.number().positive().max(100).optional()
  })
  .strict();

export const PsgSceneCrowdMemberSchema = z
  .object({
    id: z.string().min(1),
    archetypeId: z.string().min(1),
    label: z.string().min(1),
    zone: z.string().optional(),
    density: z.enum(['sparse', 'medium', 'dense']).optional(),
    variation: z.record(z.string()),
    promptHints: z.array(z.string().min(1))
  })
  .strict();

export const PsgSceneAssemblyPlanSchema = z
  .object({
    stillAssetIds: z.array(z.string().min(1)).max(500).default([]),
    motionAssetIds: z.array(z.string().min(1)).max(500).default([]),
    placements: z.array(PsgScenePlacementSchema).max(1000).default([]),
    crowdMembers: z.array(PsgSceneCrowdMemberSchema).max(1000).default([]),
    placementRules: z.record(z.unknown()).optional(),
    renderTargets: z.array(z.string().min(1)).max(50).default([])
  })
  .strict();

export const PsgCrowdPlanSchema = z
  .object({
    count: z.number().int().min(1).max(500),
    archetypes: z.array(PsgCrowdArchetypeSchema).min(1).max(100),
    variationAxes: z.array(z.string().min(1)).max(20).default([]),
    consistencyRules: z.array(z.string().min(1)).max(50).optional(),
    placement: PsgCrowdPlacementSchema.optional(),
    seed: z.number().int().optional()
  })
  .strict();

export const PsgDocumentInputSchema = z
  .object({
    version: z.literal(PSG_PROTOCOL_VERSION),
    kind: PsgDocumentKindSchema,
    metadata: PsgProtocolMetadataSchema.optional(),
    fragment: z.unknown().optional(),
    crowd: z.unknown().optional(),
    assets: z.array(z.unknown()).optional(),
    scene: z.unknown().optional()
  })
  .strict();

export const PsgDocumentSchema = z
  .object({
    version: z.literal(PSG_PROTOCOL_VERSION),
    kind: PsgDocumentKindSchema,
    metadata: PsgProtocolMetadataSchema.default({}),
    fragment: PSGFileSchema.optional(),
    crowd: PsgCrowdPlanSchema.optional(),
    assets: z.array(PsgAssetRefSchema).default([]),
    scene: PsgSceneAssemblyPlanSchema.optional()
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.kind === 'fragment' && !value.fragment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Fragment documents require a fragment payload',
        path: ['fragment']
      });
    }

    if (value.kind === 'crowd-plan' && !value.crowd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Crowd-plan documents require a crowd payload',
        path: ['crowd']
      });
    }

    if (value.kind === 'scene-plan' && !value.scene) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Scene-plan documents require a scene payload',
        path: ['scene']
      });
    }
  });

export const PsgValidationIssueSchema = z
  .object({
    code: z.string().min(1),
    message: z.string().min(1),
    severity: z.enum(['error', 'warning']),
    path: z.string().optional()
  })
  .strict();

export const PsgCapabilitiesResponseSchema = z
  .object({
    ok: z.literal(true),
    version: z.literal(PSG_PROTOCOL_VERSION),
    supportedKinds: z.array(PsgDocumentKindSchema),
    operations: z.array(PsgOperationSchema),
    exportTargets: z.array(z.enum(PSG_EXPORT_TARGETS))
  })
  .strict();

export const PsgComfyNodeSchema = z
  .object({
    id: z.string().min(1),
    class_type: z.string().min(1),
    inputs: z.record(z.unknown()),
    _meta: z
      .object({
        title: z.string().min(1),
        promptscapeType: z.string().min(1)
      })
      .strict()
  })
  .strict();

export const PsgComfyWorkflowSchema = z
  .object({
    version: z.literal('promptscape-comfy/1'),
    metadata: z
      .object({
        name: z.string().min(1),
        description: z.string().optional(),
        sourceKind: PsgDocumentKindSchema,
        sourceVersion: z.literal(PSG_PROTOCOL_VERSION)
    })
      .strict(),
    nodes: z.record(PsgComfyNodeSchema),
    outputNodeIds: z.array(z.string().min(1)),
    assetRefs: z.array(z.string().min(1)).default([]),
    placements: z.array(PsgScenePlacementSchema).default([])
  })
  .strict();

export const PsgValidateRequestSchema = z
  .object({
    document: z.unknown()
  })
  .strict();

export const PsgValidateResponseSchema = z
  .object({
    ok: z.literal(true),
    valid: z.boolean(),
    normalized: z.boolean(),
    kind: PsgDocumentKindSchema.optional(),
    issues: z.array(PsgValidationIssueSchema),
    document: PsgDocumentSchema.optional()
  })
  .strict();

export const PsgNormalizeRequestSchema = z
  .object({
    document: z.unknown()
  })
  .strict();

export const PsgNormalizeResponseSchema = z
  .object({
    ok: z.literal(true),
    changed: z.boolean(),
    document: PsgDocumentSchema,
    issues: z.array(PsgValidationIssueSchema)
  })
  .strict();

export const PsgCrowdMemberSchema = z
  .object({
    id: z.string().min(1),
    archetypeId: z.string().min(1),
    label: z.string().min(1),
    zone: z.string().optional(),
    density: z.enum(['sparse', 'medium', 'dense']).optional(),
    variation: z.record(z.string()),
    promptHints: z.array(z.string().min(1)),
    fragment: PSGFileSchema.optional()
  })
  .strict();

export const PsgExpandCrowdRequestSchema = z
  .object({
    document: z.unknown()
  })
  .strict();

export const PsgRegisterAssetsRequestSchema = z
  .object({
    document: z.unknown(),
    assets: z.array(PsgAssetRefSchema).min(1).max(200)
  })
  .strict();

export const PsgDeriveAssetRequestSchema = z
  .object({
    document: z.unknown(),
    asset: PsgAssetRefSchema
  })
  .strict();

export const PsgExportComfyRequestSchema = z
  .object({
    document: z.unknown()
  })
  .strict();

export const PsgAssembleSceneRequestSchema = z
  .object({
    document: z.unknown()
  })
  .strict();

export const PsgExpandCrowdResponseSchema = z
  .object({
    ok: z.literal(true),
    kind: z.literal('crowd-plan'),
    document: PsgDocumentSchema,
    members: z.array(PsgCrowdMemberSchema),
    issues: z.array(PsgValidationIssueSchema)
  })
  .strict();

export const PsgExportComfyResponseSchema = z
  .object({
    ok: z.literal(true),
    target: z.literal('comfy'),
    document: PsgDocumentSchema,
    workflow: PsgComfyWorkflowSchema,
    issues: z.array(PsgValidationIssueSchema)
  })
  .strict();

export const PsgRegisterAssetsResponseSchema = z
  .object({
    ok: z.literal(true),
    document: PsgDocumentSchema,
    registeredAssets: z.array(PsgAssetRefSchema),
    issues: z.array(PsgValidationIssueSchema)
  })
  .strict();

export const PsgDeriveAssetResponseSchema = z
  .object({
    ok: z.literal(true),
    document: PsgDocumentSchema,
    asset: PsgAssetRefSchema,
    issues: z.array(PsgValidationIssueSchema)
  })
  .strict();

export const PsgAssembleSceneResponseSchema = z
  .object({
    ok: z.literal(true),
    document: PsgDocumentSchema,
    assembly: PsgSceneAssemblyPlanSchema,
    issues: z.array(PsgValidationIssueSchema)
  })
  .strict();

export type PsgProtocolMetadata = z.infer<typeof PsgProtocolMetadataSchema>;
export type PsgDocumentInput = z.infer<typeof PsgDocumentInputSchema>;
export type PsgDocument = z.infer<typeof PsgDocumentSchema>;
export type PsgCrowdPlan = z.infer<typeof PsgCrowdPlanSchema>;
export type PsgCrowdArchetype = z.infer<typeof PsgCrowdArchetypeSchema>;
export type PsgAssetStorage = z.infer<typeof PsgAssetStorageSchema>;
export type PsgAssetProvenance = z.infer<typeof PsgAssetProvenanceSchema>;
export type PsgAssetRef = z.infer<typeof PsgAssetRefSchema>;
export type PsgScenePlacement = z.infer<typeof PsgScenePlacementSchema>;
export type PsgSceneCrowdMember = z.infer<typeof PsgSceneCrowdMemberSchema>;
export type PsgSceneAssemblyPlan = z.infer<typeof PsgSceneAssemblyPlanSchema>;
export type PsgValidationIssue = z.infer<typeof PsgValidationIssueSchema>;
export type PsgCapabilitiesResponse = z.infer<
  typeof PsgCapabilitiesResponseSchema
>;
export type PsgValidateRequest = z.infer<typeof PsgValidateRequestSchema>;
export type PsgValidateResponse = z.infer<typeof PsgValidateResponseSchema>;
export type PsgNormalizeRequest = z.infer<typeof PsgNormalizeRequestSchema>;
export type PsgNormalizeResponse = z.infer<typeof PsgNormalizeResponseSchema>;
export type PsgExpandCrowdRequest = z.infer<
  typeof PsgExpandCrowdRequestSchema
>;
export type PsgRegisterAssetsRequest = z.infer<
  typeof PsgRegisterAssetsRequestSchema
>;
export type PsgDeriveAssetRequest = z.infer<typeof PsgDeriveAssetRequestSchema>;
export type PsgExportComfyRequest = z.infer<typeof PsgExportComfyRequestSchema>;
export type PsgAssembleSceneRequest = z.infer<
  typeof PsgAssembleSceneRequestSchema
>;
export type PsgCrowdMember = z.infer<typeof PsgCrowdMemberSchema>;
export type PsgExpandCrowdResponse = z.infer<
  typeof PsgExpandCrowdResponseSchema
>;
export type PsgComfyNode = z.infer<typeof PsgComfyNodeSchema>;
export type PsgComfyWorkflow = z.infer<typeof PsgComfyWorkflowSchema>;
export type PsgExportComfyResponse = z.infer<
  typeof PsgExportComfyResponseSchema
>;
export type PsgRegisterAssetsResponse = z.infer<
  typeof PsgRegisterAssetsResponseSchema
>;
export type PsgDeriveAssetResponse = z.infer<
  typeof PsgDeriveAssetResponseSchema
>;
export type PsgAssembleSceneResponse = z.infer<
  typeof PsgAssembleSceneResponseSchema
>;
export type CanonicalPsgFragment = PSGFile;
