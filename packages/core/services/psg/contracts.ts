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
  'scene-assemble',
  'images-register-batch',
  'images-analyze',
  'images-review',
  'images-draft-graph',
  'images-preview',
  'images-generate-batch'
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
export const PsgBootstrapModeSchema = z.enum([
  'character-variation',
  'prop-variation',
  'set-dressing-variation',
  'environment-world-anchor',
  'crowd-archetype-expansion'
]);
export const PsgSubjectKindSchema = z.enum([
  'person',
  'prop',
  'vehicle',
  'architecture',
  'environment',
  'texture',
  'graphic',
  'mixed',
  'unknown'
]);
export const PsgEvidenceSourceSchema = z.enum([
  'segmentation',
  'multimodal-model',
  'retrieval',
  'heuristic',
  'human'
]);
export const PsgRetrievalOriginSchema = z.enum([
  'exact',
  'comparable',
  'synthesized'
]);

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

export const PsgDetectedRegionSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1).optional(),
    kind: z.enum(['subject', 'part', 'background', 'material', 'unknown']).default('unknown'),
    bbox: z
      .object({
        x: z.number().finite().min(0),
        y: z.number().finite().min(0),
        width: z.number().positive(),
        height: z.number().positive()
      })
      .strict()
      .optional(),
    maskAssetId: z.string().min(1).optional(),
    confidence: z.number().min(0).max(1).optional(),
    tags: z.array(z.string().min(1)).max(50).default([])
  })
  .strict();

export const PsgDetectedSubjectSchema = z
  .object({
    id: z.string().min(1),
    subjectKind: PsgSubjectKindSchema.default('unknown'),
    label: z.string().min(1).optional(),
    confidence: z.number().min(0).max(1).optional(),
    primary: z.boolean().optional(),
    regionIds: z.array(z.string().min(1)).max(100).default([]),
    tags: z.array(z.string().min(1)).max(50).default([])
  })
  .strict();

export const PsgVariationAxisSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    kind: z.enum(['locked', 'variable']).default('variable'),
    values: z.array(z.string().min(1)).max(50).default([]),
    confidence: z.number().min(0).max(1).optional(),
    sourceIds: z.array(z.string().min(1)).max(20).default([])
  })
  .strict();

export const PsgEvidenceSchema = z
  .object({
    source: PsgEvidenceSourceSchema,
    sourceId: z.string().min(1).optional(),
    score: z.number().min(0).max(1),
    summary: z.string().min(1).optional()
  })
  .strict();

export const PsgReconciledTraitSchema = z
  .object({
    key: z.string().min(1),
    value: z.string().min(1),
    classification: z.enum(['locked', 'variable', 'unknown']).default('unknown'),
    confidence: z.number().min(0).max(1),
    provenance: z.array(PsgEvidenceSourceSchema).min(1).max(10),
    evidence: z.array(PsgEvidenceSchema).max(20).default([]),
    conflicts: z.array(z.string().min(1)).max(20).default([])
  })
  .strict();

export const PsgComparableMatchSchema = z
  .object({
    id: z.string().min(1),
    origin: PsgRetrievalOriginSchema,
    kind: z.enum(['fragment', 'asset', 'graph-template', 'crowd-archetype']),
    label: z.string().min(1),
    score: z.number().min(0).max(1),
    reasonCodes: z.array(z.string().min(1)).max(20).default([]),
    sourceRef: z.string().min(1).optional()
  })
  .strict();

export const PsgImageAnalysisRecordSchema = z
  .object({
    assetId: z.string().min(1),
    subjectKind: PsgSubjectKindSchema.default('unknown'),
    bootstrapMode: PsgBootstrapModeSchema.optional(),
    analysisSource: z
      .object({
        fixtureId: z.string().min(1).optional(),
        selectionMode: z.enum(['explicit', 'heuristic', 'derived']).optional()
      })
      .strict()
      .optional(),
    subjects: z.array(PsgDetectedSubjectSchema).max(100).default([]),
    regions: z.array(PsgDetectedRegionSchema).max(500).default([]),
    lockedTraits: z.array(PsgReconciledTraitSchema).max(100).default([]),
    variableTraits: z.array(PsgReconciledTraitSchema).max(100).default([]),
    variationAxes: z.array(PsgVariationAxisSchema).max(50).default([]),
    segmentationFindings: z.array(z.string().min(1)).max(100).default([]),
    modelFindings: z.array(z.string().min(1)).max(100).default([]),
    comparableSearchTerms: z.array(z.string().min(1)).max(50).default([]),
    confidence: z.number().min(0).max(1).optional()
  })
  .strict();

export const PsgReviewGuidanceSchema = z
  .object({
    bootstrapMode: PsgBootstrapModeSchema.optional(),
    primarySubjectId: z.string().min(1).optional(),
    excludedRegionIds: z.array(z.string().min(1)).max(100).default([]),
    lockedTraitKeys: z.array(z.string().min(1)).max(100).default([]),
    variableTraitKeys: z.array(z.string().min(1)).max(100).default([]),
    rejectedTraitKeys: z.array(z.string().min(1)).max(100).default([]),
    addedLockedTraits: z.array(z.string().min(1)).max(50).default([]),
    addedVariableTraits: z.array(z.string().min(1)).max(50).default([]),
    explicitFixtureSelections: z
      .array(
        z
          .object({
            assetId: z.string().min(1),
            fixtureId: z.string().min(1)
          })
          .strict()
      )
      .max(50)
      .default([]),
    preferredComparableMatchIds: z.array(z.string().min(1)).max(50).default([]),
    forceSynthesisKeys: z.array(z.string().min(1)).max(50).default([]),
    notes: z.string().max(5000).optional()
  })
  .strict();

export const PsgReviewCheckpointSchema = z
  .object({
    reviewId: z.string().min(1),
    bootstrapMode: PsgBootstrapModeSchema.optional(),
    analyses: z.array(PsgImageAnalysisRecordSchema).min(1).max(200),
    exactMatches: z.array(PsgComparableMatchSchema).max(100).default([]),
    comparableMatches: z.array(PsgComparableMatchSchema).max(100).default([]),
    uncertainTraits: z.array(PsgReconciledTraitSchema).max(100).default([]),
    guidance: PsgReviewGuidanceSchema.optional()
  })
  .strict();

export const PsgGenerationBatchRequestSchema = z
  .object({
    count: z.number().int().min(1).max(100).default(20),
    seed: z.number().int().optional(),
    lockTraitKeys: z.array(z.string().min(1)).max(100).default([]),
    varyTraitKeys: z.array(z.string().min(1)).max(100).default([]),
    diversityTarget: z.enum(['low', 'medium', 'high']).default('medium'),
    previewOnly: z.boolean().default(true)
  })
  .strict();

export const PsgPreviewBackendSchema = z
  .object({
    id: z.string().min(1),
    mode: z.enum(['mock', 'vendor']),
    label: z.string().min(1),
    profile: z.enum(['bootstrap', 'scene']).optional(),
    model: z.string().min(1).optional(),
    supportedModels: z.array(z.string().min(1)).default([]).optional()
  })
  .strict();

export const PsgImagePreviewRequestBodySchema = z
  .object({
    count: z.number().int().min(1).max(8).default(4),
    seed: z.number().int().optional(),
    backendId: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    includePromptBlueprint: z.boolean().default(true)
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
    exportTargets: z.array(z.enum(PSG_EXPORT_TARGETS)),
    previewBackends: z.array(PsgPreviewBackendSchema).default([])
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

export const PsgImageRegisterBatchRequestSchema = z
  .object({
    document: z.unknown(),
    assets: z.array(PsgAssetRefSchema).min(1).max(50)
  })
  .strict();

export const PsgImageAnalyzeRequestSchema = z
  .object({
    document: z.unknown(),
    assetIds: z.array(z.string().min(1)).min(1).max(50),
    userIntent: z.string().max(2000).optional()
  })
  .strict();

export const PsgImageReviewRequestSchema = z
  .object({
    document: z.unknown(),
    checkpoint: PsgReviewCheckpointSchema,
    guidance: PsgReviewGuidanceSchema
  })
  .strict();

export const PsgImageDraftGraphRequestSchema = z
  .object({
    document: z.unknown(),
    checkpoint: PsgReviewCheckpointSchema
  })
  .strict();

export const PsgImageGenerateBatchRequestSchema = z
  .object({
    document: z.unknown(),
    checkpoint: PsgReviewCheckpointSchema,
    request: PsgGenerationBatchRequestSchema
  })
  .strict();

export const PsgImagePreviewRequestSchema = z
  .object({
    document: z.unknown(),
    checkpoint: PsgReviewCheckpointSchema,
    request: PsgImagePreviewRequestBodySchema
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

export const PsgImageRegisterBatchResponseSchema = z
  .object({
    ok: z.literal(true),
    document: PsgDocumentSchema,
    registeredAssets: z.array(PsgAssetRefSchema),
    issues: z.array(PsgValidationIssueSchema)
  })
  .strict();

export const PsgImageAnalyzeResponseSchema = z
  .object({
    ok: z.literal(true),
    document: PsgDocumentSchema,
    analyses: z.array(PsgImageAnalysisRecordSchema),
    exactMatches: z.array(PsgComparableMatchSchema),
    comparableMatches: z.array(PsgComparableMatchSchema),
    checkpoint: PsgReviewCheckpointSchema,
    issues: z.array(PsgValidationIssueSchema)
  })
  .strict();

export const PsgImageReviewResponseSchema = z
  .object({
    ok: z.literal(true),
    document: PsgDocumentSchema,
    checkpoint: PsgReviewCheckpointSchema,
    issues: z.array(PsgValidationIssueSchema)
  })
  .strict();

export const PsgImageDraftGraphResponseSchema = z
  .object({
    ok: z.literal(true),
    document: PsgDocumentSchema,
    draftFragment: PSGFileSchema,
    checkpoint: PsgReviewCheckpointSchema,
    issues: z.array(PsgValidationIssueSchema)
  })
  .strict();

export const PsgImagePreviewResponseSchema = z
  .object({
    ok: z.literal(true),
    document: PsgDocumentSchema,
    checkpoint: PsgReviewCheckpointSchema,
    preview: z
      .object({
        backend: PsgPreviewBackendSchema,
        count: z.number().int().min(1),
        seed: z.number().int().optional(),
        promptBlueprint: z.string().min(1).optional(),
        results: z
          .array(
            z
              .object({
                id: z.string().min(1),
                seed: z.number().int(),
                prompt: z.string().min(1),
                imageUrl: z.string().min(1),
                width: z.number().int().positive(),
                height: z.number().int().positive(),
                metadata: z
                  .object({
                    assetIds: z.array(z.string().min(1)).default([]),
                    preferredComparableLabels: z.array(z.string().min(1)).default([]),
                    lockedTraitKeys: z.array(z.string().min(1)).default([]),
                    variableTraitKeys: z.array(z.string().min(1)).default([]),
                    forceSynthesisKeys: z.array(z.string().min(1)).default([]),
                    guidanceNotes: z.string().default('')
                  })
                  .strict()
              })
              .strict()
          )
          .max(8)
          .default([])
      })
      .strict(),
    issues: z.array(PsgValidationIssueSchema)
  })
  .strict();

export const PsgImageGenerateBatchResponseSchema = z
  .object({
    ok: z.literal(true),
    document: PsgDocumentSchema,
    checkpoint: PsgReviewCheckpointSchema,
    batch: z
      .object({
        count: z.number().int().min(1),
        seed: z.number().int().optional(),
        promptBlueprint: z.string().min(1),
        previewAssetIds: z.array(z.string().min(1)).default([])
      })
      .strict(),
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
export type PsgBootstrapMode = z.infer<typeof PsgBootstrapModeSchema>;
export type PsgSubjectKind = z.infer<typeof PsgSubjectKindSchema>;
export type PsgEvidenceSource = z.infer<typeof PsgEvidenceSourceSchema>;
export type PsgRetrievalOrigin = z.infer<typeof PsgRetrievalOriginSchema>;
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
export type PsgImageRegisterBatchRequest = z.infer<
  typeof PsgImageRegisterBatchRequestSchema
>;
export type PsgImageAnalyzeRequest = z.infer<typeof PsgImageAnalyzeRequestSchema>;
export type PsgImageReviewRequest = z.infer<typeof PsgImageReviewRequestSchema>;
export type PsgImageDraftGraphRequest = z.infer<
  typeof PsgImageDraftGraphRequestSchema
>;
export type PsgImagePreviewRequest = z.infer<typeof PsgImagePreviewRequestSchema>;
export type PsgImageGenerateBatchRequest = z.infer<
  typeof PsgImageGenerateBatchRequestSchema
>;
export type PsgCrowdMember = z.infer<typeof PsgCrowdMemberSchema>;
export type PsgDetectedRegion = z.infer<typeof PsgDetectedRegionSchema>;
export type PsgDetectedSubject = z.infer<typeof PsgDetectedSubjectSchema>;
export type PsgVariationAxis = z.infer<typeof PsgVariationAxisSchema>;
export type PsgEvidence = z.infer<typeof PsgEvidenceSchema>;
export type PsgReconciledTrait = z.infer<typeof PsgReconciledTraitSchema>;
export type PsgComparableMatch = z.infer<typeof PsgComparableMatchSchema>;
export type PsgImageAnalysisRecord = z.infer<typeof PsgImageAnalysisRecordSchema>;
export type PsgReviewGuidance = z.infer<typeof PsgReviewGuidanceSchema>;
export type PsgReviewCheckpoint = z.infer<typeof PsgReviewCheckpointSchema>;
export type PsgGenerationBatchRequest = z.infer<
  typeof PsgGenerationBatchRequestSchema
>;
export type PsgPreviewBackend = z.infer<typeof PsgPreviewBackendSchema>;
export type PsgImagePreviewRequestBody = z.infer<
  typeof PsgImagePreviewRequestBodySchema
>;
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
export type PsgImageRegisterBatchResponse = z.infer<
  typeof PsgImageRegisterBatchResponseSchema
>;
export type PsgImageAnalyzeResponse = z.infer<
  typeof PsgImageAnalyzeResponseSchema
>;
export type PsgImageReviewResponse = z.infer<typeof PsgImageReviewResponseSchema>;
export type PsgImageDraftGraphResponse = z.infer<
  typeof PsgImageDraftGraphResponseSchema
>;
export type PsgImagePreviewResponse = z.infer<
  typeof PsgImagePreviewResponseSchema
>;
export type PsgImageGenerateBatchResponse = z.infer<
  typeof PsgImageGenerateBatchResponseSchema
>;
export type CanonicalPsgFragment = PSGFile;
