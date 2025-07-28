/**
 * .psg (PromptSpaghetti Graph) File Format Schema - Story 6.1
 *
 * Defines the schema and validation for .psg project files using Zod.
 * Provides versioning support and comprehensive metadata structure.
 */
import { z } from 'zod';
export declare const PSG_FORMAT_VERSION = "1.0.0";
export declare const ProjectMetadataSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ProjectSettingsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const CollaborationDataSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const PsgFileSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type PsgFile = z.infer<typeof PsgFileSchema>;
export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;
export type ProjectSettings = z.infer<typeof ProjectSettingsSchema>;
export type CollaborationData = z.infer<typeof CollaborationDataSchema>;
export declare function validatePsgFile(data: unknown): {
    success: true;
    data: PsgFile;
} | {
    success: false;
    error: string;
    issues: z.ZodIssue;
};
//# sourceMappingURL=psgSchema.d.ts.map