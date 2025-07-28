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
        errors: string;
    }>;
    getMetadata(data: string | ArrayBuffer): Promise<any>;
}
export declare class JSONFormatProcessor implements FormatProcessor {
    export(template: ProjectTemplate, version?: TemplateVersion, options: {}): any;
    include_version_info?: boolean;
    pretty_print?: boolean;
    include_metadata?: boolean;
}
//# sourceMappingURL=TemplateExportFormats.d.ts.map