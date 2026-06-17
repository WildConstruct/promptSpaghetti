import { z } from 'zod';

/**
 * Card Normalization contracts.
 *
 * Per-asset normalization for crowd-card figures: a head unit, ground plane,
 * pivot/anchor and crop, plus the derived head count and an approve state.
 * The record is stored additively on `PsgAssetRef.metadata.normalization`
 * (see ./normalization.ts) and later drives per-placement scale/anchor in
 * scene assembly. Schemas mirror the style of `services/psg/contracts.ts`.
 */

export const CARD_NORMALIZATION_VERSION = 'card-norm/1' as const;

export const POSE_CLASSES = [
  'standing-relaxed',
  'standing-alert',
  'seated',
  'walking',
  'leaning'
] as const;

export const NORMALIZATION_STATUSES = [
  'unsolved',
  'auto',
  'edited',
  'approved'
] as const;

export const HEAD_UNIT_MODES = ['visual-oval', 'bbox'] as const;

export const PoseClassSchema = z.enum(POSE_CLASSES);
export const NormalizationStatusSchema = z.enum(NORMALIZATION_STATUSES);
export const HeadUnitModeSchema = z.enum(HEAD_UNIT_MODES);

const unit = () => z.number().min(0).max(1);
const point = () =>
  z
    .object({ x: z.number().finite(), y: z.number().finite() })
    .strict();

export const HeadUnitSchema = z
  .object({
    centerX: z.number().finite(),
    centerY: z.number().finite(),
    width: z.number().positive(),
    height: z.number().positive(),
    rotation: z.number().finite().default(0),
    mode: HeadUnitModeSchema.default('visual-oval'),
    includesHeadwear: z.boolean().default(true),
    confidence: unit().default(0)
  })
  .strict();

export const GroundPlaneSchema = z
  .object({
    y: z.number().finite(),
    angle: z.number().finite().default(0),
    leftContact: point(),
    rightContact: point(),
    supportWidth: z.number().min(0),
    confidence: unit().default(0)
  })
  .strict();

export const PivotAnchorSchema = z
  .object({
    x: z.number().finite(),
    y: z.number().finite(),
    uv: z
      .object({ u: unit(), v: unit() })
      .strict(),
    lockToGround: z.boolean().default(true)
  })
  .strict();

export const CropBoxSchema = z
  .object({
    x: z.number().finite(),
    y: z.number().finite(),
    width: z.number().positive(),
    height: z.number().positive(),
    padding: z
      .object({
        top: z.number().min(0).max(100).default(0),
        right: z.number().min(0).max(100).default(0),
        bottom: z.number().min(0).max(100).default(0),
        left: z.number().min(0).max(100).default(0)
      })
      .strict()
      .default({ top: 0, right: 0, bottom: 0, left: 0 })
  })
  .strict();

export const NormalizationConfidenceSchema = z
  .object({
    mask: unit(),
    pose: unit(),
    head: unit(),
    ground: unit(),
    overall: unit()
  })
  .strict();

export const CardNormalizationSchema = z
  .object({
    version: z.literal(CARD_NORMALIZATION_VERSION).default(CARD_NORMALIZATION_VERSION),
    assetId: z.string().min(1),
    imageWidth: z.number().int().positive(),
    imageHeight: z.number().int().positive(),
    head: HeadUnitSchema,
    ground: GroundPlaneSchema,
    pivot: PivotAnchorSchema,
    crop: CropBoxSchema,
    observedHeadCount: z.number().min(0),
    canonicalHeadCount: z.number().positive().default(7.5),
    archetype: z.string().min(1),
    poseClass: PoseClassSchema.default('standing-relaxed'),
    targetHeightM: z.number().positive().optional(),
    confidence: NormalizationConfidenceSchema,
    status: NormalizationStatusSchema.default('unsolved'),
    updatedAt: z.string().min(1)
  })
  .strict();

export type PoseClass = z.infer<typeof PoseClassSchema>;
export type NormalizationStatus = z.infer<typeof NormalizationStatusSchema>;
export type HeadUnitMode = z.infer<typeof HeadUnitModeSchema>;
export type HeadUnit = z.infer<typeof HeadUnitSchema>;
export type GroundPlane = z.infer<typeof GroundPlaneSchema>;
export type PivotAnchor = z.infer<typeof PivotAnchorSchema>;
export type CropBox = z.infer<typeof CropBoxSchema>;
export type NormalizationConfidence = z.infer<typeof NormalizationConfidenceSchema>;
export type CardNormalization = z.infer<typeof CardNormalizationSchema>;
