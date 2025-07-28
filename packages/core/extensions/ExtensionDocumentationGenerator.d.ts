/**
 * Extension Documentation Generator - Epic 8.4 Story 8.4.1
 * Generates comprehensive documentation for extension points
 */
import { ExtensionPointCategory, ExtensionPointPriority, ExtensionPointLifecycle } from './ExtensionPointRegistry';

export interface DocumentationOptions {
    includeExamples?: boolean;
    includeConstraints?: boolean;
    includeMetadata?: boolean;
    format?: 'markdown' | 'html' | 'json';
    filterBy?: {
        category?: ExtensionPointCategory;
        priority?: ExtensionPointPriority;
        lifecycle?: ExtensionPointLifecycle;

    };

export declare class ExtensionDocumentationGenerator {
    private static instance;
    private constructor();
    static getInstance(): ExtensionDocumentationGenerator;
    /**
     * Generate complete documentation for all extension points
     */
    generateComplete(options?: DocumentationOptions): string;
    /**
     * Generate documentation for a single extension point
     */
    generateSingle(extensionPointId: string, options?: DocumentationOptions): string;
    /**
     * Generate documentation by category
     */
    generateByCategory(category: ExtensionPointCategory, options?: DocumentationOptions): string;
    /**
     * Generate extension point index
     */
    generateIndex(): string;
    /**
     * Generate search index for extension points
     */
    generateSearchIndex(): any;
    /**
     * Generate markdown documentation
     */
    private generateMarkdown;
    /**
     * Generate markdown for a single extension point
     */
    private generateMarkdownExtensionPoint;
    /**
     * Generate HTML documentation
     */
    private generateHTML;
    /**
     * Generate HTML for a single extension point
     */
    private generateHTMLExtensionPoint;
    /**
     * Generate JSON documentation
     */
    private generateJSON;
    /**
     * Escape HTML characters
     */
    private escapeHtml;

export declare const extensionDocumentationGenerator: ExtensionDocumentationGenerator;
//# sourceMappingURL=ExtensionDocumentationGenerator.d.ts.map