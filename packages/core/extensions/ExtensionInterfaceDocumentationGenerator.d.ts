/**
 * Extension Interface Documentation Generator - Epic 8.4 Story 8.4.2
 * Generates comprehensive documentation for extension interfaces
 */
import { BaseExtension } from './interfaces/ExtensionInterfaces';
export declare class ExtensionInterfaceDocumentationGenerator {
    private static instance;
    private constructor();
    static getInstance(): ExtensionInterfaceDocumentationGenerator;
    /**
     * Generate complete interface documentation
     */
    generateInterfaceDocumentation(extensionType?: string): string;
    /**
     * Generate documentation for specific extension
     */
    generateExtensionDocumentation(extension: BaseExtension): string;
    /**
     * Generate API reference documentation
     */
    generateAPIReference(): string;
    /**
     * Generate developer guide
     */
    generateDeveloperGuide(): string;
    /**
     * Generate troubleshooting guide
     */
    generateTroubleshootingGuide(): string;
    /**
     * Private helper methods
     */
    private generateHeaderSection;
    private generateFooterSection;
    private generateCompleteDocumentation;
    private generateBaseInterfaceDocumentation;
    private generateTypeSpecificDocumentation;
    private generateNodeExtensionMethods;
    private generateUIExtensionMethods;
    private generateTransformExtensionMethods;
    private generateStorageExtensionMethods;
    private formatMethods;
    private generateExtensionContextDocumentation;
    private generateValidationResultsDocumentation;
    private generateUsageExamples;

export declare const extensionInterfaceDocumentationGenerator: ExtensionInterfaceDocumentationGenerator;
//# sourceMappingURL=ExtensionInterfaceDocumentationGenerator.d.ts.map