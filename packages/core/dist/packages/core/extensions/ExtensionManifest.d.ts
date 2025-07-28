/**
 * Extension Manifest - Epic 8.4 Story 8.4.3
 * Standardized manifest format for extensions with validation and parsing
 */
import { z } from 'zod';
export declare const ExtensionManifestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type ExtensionManifest = z.infer<typeof ExtensionManifestSchema>;
export declare class ExtensionManifestParser {
    private static instance;
    private cache;
    private constructor();
    static getInstance(): ExtensionManifestParser;
    /**
    * Parse manifest from JSON string
    */
    parseManifest(jsonString: string): ParseResult<ExtensionManifest>;
    /**
     * Parse manifest from file path
     */
    parseManifestFromFile(filePath: string): Promise<ParseResult<ExtensionManifest>>;
    /**
     * Validate manifest dependencies
     */
    validateDependencies(manifest: ExtensionManifest): any;
    availableExtensions: Map<string, ExtensionManifest>;
    ExtensionValidationResult: any;
}
//# sourceMappingURL=ExtensionManifest.d.ts.map