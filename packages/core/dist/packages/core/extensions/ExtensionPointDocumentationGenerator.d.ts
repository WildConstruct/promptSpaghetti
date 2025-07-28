/**
 * Extension Point Documentation Generator
 * Generates documentation for extension points in the system
 */
export interface ExtensionPointDocumentation {
    name: string;
    description: string;
    interface: string;
    examples: string;
    version: string;
}
export declare class ExtensionPointDocumentationGenerator {
    constructor();
    /**
     * Generate documentation for all extension points
     */
    generateDocumentation(): ExtensionPointDocumentation;
}
//# sourceMappingURL=ExtensionPointDocumentationGenerator.d.ts.map