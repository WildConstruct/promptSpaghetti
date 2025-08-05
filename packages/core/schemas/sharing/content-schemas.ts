/**
 * Content-related Sharing Schemas
 * Schemas for shared content, versions, annotations, and metadata
 */
import { z } from 'zod';
import { ContentTypeSchema } from './core-schemas';

// Content Version
export const ContentVersionSchema = z.object({
  version: z.string(),
  createdAt: z.date(),
  createdBy: z.string(),
  changeLog: z.string().optional(),
  size: z.number().int().positive(),
  checksum: z.string()
});

export type ContentVersion = z.infer<typeof ContentVersionSchema>;

// Version Control
export const VersionControlSchema = z.object({
  currentVersion: z.string(),
  versionHistory: z.array(ContentVersionSchema),
  allowVersioning: z.boolean().default(true),
  maxVersions: z.number().int().positive().default(10)
});

export type VersionControl = z.infer<typeof VersionControlSchema>;

// Sticky Note Annotation
export const StickyNoteSchema = z.object({
  id: z.string().uuid(),
  content: z.string().max(500),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  color: z.string().default('#ffeb3b'),
  createdBy: z.string(),
  createdAt: z.date()
});

export type StickyNote = z.infer<typeof StickyNoteSchema>;

// Connection Label
export const ConnectionLabelSchema = z.object({
  id: z.string().uuid(),
  connectionId: z.string(),
  label: z.string().max(100),
  position: z.number().min(0).max(1).default(0.5)
});

export type ConnectionLabel = z.infer<typeof ConnectionLabelSchema>;

// Annotation Region
export const AnnotationRegionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['rectangle', 'circle', 'polygon', 'freehand']),
  coordinates: z.array(z.object({
    x: z.number(),
    y: z.number()
  })),
  style: z.object({
    strokeColor: z.string().default('#ff0000'),
    strokeWidth: z.number().default(2),
    fillColor: z.string().optional(),
    opacity: z.number().min(0).max(1).default(0.3)
  })
});

export type AnnotationRegion = z.infer<typeof AnnotationRegionSchema>;

// Content Annotations
export const ContentAnnotationsSchema = z.object({
  connectionLabels: z.array(ConnectionLabelSchema).default([]),
  stickyNotes: z.array(StickyNoteSchema).default([]),
  regions: z.array(AnnotationRegionSchema).default([])
});

export type ContentAnnotations = z.infer<typeof ContentAnnotationsSchema>;

// Shared Content Metadata
export const SharedContentMetadataSchema = z.object({
  exportId: z.string(),
  originalContentId: z.string(),
  contentType: ContentTypeSchema,
  fileSize: z.number().int().positive(),
  mimeType: z.string(),
  thumbnail: z.string().url().optional(),
  preview: z.string().url().optional(),
  dimensions: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive()
  }).optional()
});

export type SharedContentMetadata = z.infer<typeof SharedContentMetadataSchema>;