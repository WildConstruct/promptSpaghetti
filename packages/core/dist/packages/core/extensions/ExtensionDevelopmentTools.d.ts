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
}
//# sourceMappingURL=ExtensionDevelopmentTools.d.ts.map