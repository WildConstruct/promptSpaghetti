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
    documentation: any;
}
//# sourceMappingURL=ExtensionInterfaceDocumentationGenerator.d.ts.map