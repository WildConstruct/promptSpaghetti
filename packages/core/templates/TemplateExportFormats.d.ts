/**
 * Template Export Formats and Utilities
 * Advanced export format processors for templates with versioning support
 */
import { ProjectTemplate } from './ProjectTemplateManager';
import { TemplateVersion } from './TemplateVersionManager';
export interface FormatProcessor {
    export(template: ProjectTemplate, version?: TemplateVersion, options?: any): Promise<string | ArrayBuffer>;
    import(data: string | ArrayBuffer, options?: any): Promise<ProjectTemplate>;
    validate(data: string | ArrayBuffer): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    getMetadata(data: string | ArrayBuffer): Promise<any>;
}
export declare class JSONFormatProcessor implements FormatProcessor {
    export(template: ProjectTemplate, version?: TemplateVersion, options?: {)
        include_version_info?: boolean;
        pretty_print?: boolean;
        include_metadata?: boolean;
    }): Promise<string>;
    import(data: string): Promise<ProjectTemplate>;
    validate(data: string): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    getMetadata(data: string): Promise<any>;
}
export declare class YAMLFormatProcessor implements FormatProcessor {
    export(template: ProjectTemplate, version?: TemplateVersion, options?: {)
        include_version_info?: boolean;
        include_metadata?: boolean;
    }): Promise<string>;
    import(data: string): Promise<ProjectTemplate>;
    validate(data: string): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    getMetadata(data: string): Promise<any>;
}
export declare class BundleFormatProcessor implements FormatProcessor {
    export(template: ProjectTemplate, version?: TemplateVersion, options?: {)
        include_dependencies?: boolean;
        include_assets?: boolean;
        include_documentation?: boolean;
        compress?: boolean;
    }): Promise<ArrayBuffer>;
    import(data: ArrayBuffer): Promise<ProjectTemplate>;
    validate(data: ArrayBuffer): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    getMetadata(data: ArrayBuffer): Promise<any>;
    private generateReadme;
    private generateExamples;
    private verifyBundle;
    private calculateChecksum;
}
export declare class ZipFormatProcessor implements FormatProcessor {
    export(template: ProjectTemplate, version?: TemplateVersion, options?: {)
        include_version_history?: boolean;
        include_dependencies?: boolean;
        separate_files?: boolean;
    }): Promise<ArrayBuffer>;
    import(data: ArrayBuffer): Promise<ProjectTemplate>;
    validate(data: ArrayBuffer): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    getMetadata(data: ArrayBuffer): Promise<any>;
    private generateReadme;
}
export declare class TemplateFormatRegistry {
    private processors;
    constructor();
    registerProcessor(format: string, processor: FormatProcessor): void;
    getProcessor(format: string): FormatProcessor;
    getSupportedFormats(): string[];
    detectFormat(data: string | ArrayBuffer): Promise<string | null>;
}
//# sourceMappingURL=TemplateExportFormats.d.ts.map