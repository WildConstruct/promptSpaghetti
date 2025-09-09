import { z } from 'zod';

export const PresetMetaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  tags: z.array(z.string()).default([]),
  nodeTypes: z.array(z.string()).default([]),
  engineVersion: z.string().optional(),
  thumbnail: z.string().optional(),
  lastModified: z.union([z.string(), z.number()]).optional(),
  author: z.string().optional(),
  outputType: z.string().optional()
});

export type PresetMeta = z.infer<typeof PresetMetaSchema>;

export const MinimalManifestSchema = z.object({
  presets: z.array(
    z.object({
      id: z.string().min(1),
      path: z.string().min(1),
      tags: z.array(z.string()).optional(),
      nodeTypes: z.array(z.string()).optional(),
      thumbnail: z.string().optional()
    })
  )
});

export const NpmStyleManifestSchema = z.object({
  name: z.string().optional(),
  version: z.string().optional(),
  presetLibrary: z.object({
    presets: z.array(
      z.object({
        id: z.string().min(1),
        path: z.string().min(1),
        tags: z.array(z.string()).optional(),
        nodeTypes: z.array(z.string()).optional(),
        thumbnail: z.string().optional()
      })
    )
  })
});

export type MinimalManifest = z.infer<typeof MinimalManifestSchema>;
export type NpmStyleManifest = z.infer<typeof NpmStyleManifestSchema>;

export function validateMinimalManifest(input: unknown): MinimalManifest {
  return MinimalManifestSchema.parse(input);
}

export function validateNpmStyleManifest(input: unknown): NpmStyleManifest {
  return NpmStyleManifestSchema.parse(input);
}
