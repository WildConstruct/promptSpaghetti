import { z } from 'zod';

export const LOCAL_IMAGE_PROVIDER = 'comfy-local' as const;
export const LOCAL_IMAGE_DEFAULT_COUNT = 20;
export const LOCAL_IMAGE_MAX_COUNT = 20;
export const LOCAL_IMAGE_PINNED_CHECKPOINT =
  'flux1-schnell-fp8.safetensors' as const;
export const LocalImageCheckpointStatusSchema = z.enum([
  'ready',
  'missing',
  'mismatch',
  'unknown'
]);

export const LocalImageRuntimeStatusSchema = z
  .object({
    ok: z.literal(true),
    provider: z.literal(LOCAL_IMAGE_PROVIDER),
    available: z.boolean(),
    reason: z.string().optional(),
    outputDir: z.string().min(1).optional(),
    apiUrl: z.string().min(1).optional(),
    checkpoint: z.string().min(1).optional(),
    checkpointStatus: LocalImageCheckpointStatusSchema.optional(),
    runtimeReachable: z.boolean().optional(),
    outputDirWritable: z.boolean().optional(),
    lastError: z.string().optional(),
    defaultCount: z.number().int().min(1).max(LOCAL_IMAGE_MAX_COUNT),
    maxCount: z.number().int().min(1).max(LOCAL_IMAGE_MAX_COUNT)
  })
  .strict();

export const LocalImageBatchRequestSchema = z
  .object({
    prompt: z.string().min(1).max(4000),
    negativePrompt: z.string().max(4000).optional(),
    count: z
      .number()
      .int()
      .min(1)
      .max(LOCAL_IMAGE_MAX_COUNT)
      .default(LOCAL_IMAGE_DEFAULT_COUNT),
    startSeed: z.number().int().min(0).max(2_147_483_647).optional(),
    width: z.number().int().min(256).max(2048).default(1024),
    height: z.number().int().min(256).max(2048).default(1024),
    labelPrefix: z.string().min(1).max(120).optional()
  })
  .strict();

export const LocalImageBatchItemSchema = z
  .object({
    index: z.number().int().min(0),
    seed: z.number().int().min(0),
    prompt: z.string().min(1),
    provider: z.literal(LOCAL_IMAGE_PROVIDER),
    filename: z.string().min(1),
    outputPath: z.string().min(1),
    downloadUrl: z.string().min(1)
  })
  .strict();

export const LocalImageBatchResponseSchema = z
  .object({
    ok: z.literal(true),
    provider: z.literal(LOCAL_IMAGE_PROVIDER),
    runId: z.string().min(1),
    outputDir: z.string().min(1),
    manifestPath: z.string().min(1),
    prompt: z.string().min(1),
    count: z.number().int().min(1).max(LOCAL_IMAGE_MAX_COUNT),
    items: z.array(LocalImageBatchItemSchema)
  })
  .strict();

export type LocalImageRuntimeStatus = z.infer<typeof LocalImageRuntimeStatusSchema>;
export type LocalImageCheckpointStatus = z.infer<
  typeof LocalImageCheckpointStatusSchema
>;
export type LocalImageBatchRequest = z.infer<typeof LocalImageBatchRequestSchema>;
export type LocalImageBatchItem = z.infer<typeof LocalImageBatchItemSchema>;
export type LocalImageBatchResponse = z.infer<typeof LocalImageBatchResponseSchema>;
