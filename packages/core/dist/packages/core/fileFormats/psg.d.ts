/**
 * .psg (PromptScape Graph) File Format
 *
 * Defines the structure and validation for native project files
 * that can be saved, loaded, and shared between users.
 */
import { z } from 'zod';
import { Node } from 'reactflow';
export declare const ProjectMetadataSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const GraphContentSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const EditorSettingsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ExportMetadataSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const PSGFileSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;
export type GraphContent = z.infer<typeof GraphContentSchema>;
export type EditorSettings = z.infer<typeof EditorSettingsSchema>;
export type ExportMetadata = z.infer<typeof ExportMetadataSchema>;
export type PSGFile = z.infer<typeof PSGFileSchema>;
/**
 * Creates a new .psg file from graph data
 */
export declare function createPSGFile(nodes: Node): any;
//# sourceMappingURL=psg.d.ts.map