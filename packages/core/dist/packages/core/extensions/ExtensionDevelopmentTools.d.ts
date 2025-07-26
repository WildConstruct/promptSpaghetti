/**
 * Extension Development Tools - Epic 8.4 Story 8.4.2
 * Tools and utilities for extension development and testing
 */
import { BaseExtension, ExtensionContext, ExtensionValidationResult } from './interfaces/ExtensionInterfaces';
export declare class ExtensionDevelopmentKit {
    private static instance;
    private constructor();
    static getInstance(): ExtensionDevelopmentKit;
    /**
     * Create a new extension skeleton
     */
    createExtensionSkeleton(config: ExtensionSkeletonConfig): string;
    /**
     * Validate extension implementation
     */
    validateExtension(extension: any): ExtensionValidationResult;
    /**
     * Test extension lifecycle
     */
    testExtensionLifecycle(extension: BaseExtension): Promise<LifecycleTestResult>;
    /**
     * Generate extension documentation
     */
    generateExtensionDocumentation(extension: BaseExtension): string;
    /**
     * Create test extension instance
     */
    createTestExtension(config?: Partial<TestExtensionConfig>): BaseExtension;
    /**
     * Create mock extension context
     */
    createMockExtensionContext(extensionId: string): ExtensionContext;
    private generateBaseClass;
    private generateExtensionClass;
    private generateTypeSpecificMethods;
    private generateExports;
    private generateAPIReference;
    private getTypeSpecificAPIDocs;
    private generateExamples;
    private getTypeSpecificExample;
    private testPhase;
    private toPascalCase;
}
interface ExtensionSkeletonConfig {
    id: string;
    name: string;
    type: 'node' | 'ui' | 'transform' | 'storage';
    author: string;
    description: string;
}
interface TestExtensionConfig {
    id?: string;
    name?: string;
    version?: string;
    description?: string;
    author?: string;
    dependencies?: string[];
    permissions?: string[];
}
interface LifecycleTestResult {
    success: boolean;
    phases: LifecyclePhaseResult[];
    errors: Error[];
    duration: number;
}
interface LifecyclePhaseResult {
    phase: string;
    success: boolean;
    duration: number;
    error?: Error;
}
export declare const extensionDevelopmentKit: ExtensionDevelopmentKit;
export {};
//# sourceMappingURL=ExtensionDevelopmentTools.d.ts.map