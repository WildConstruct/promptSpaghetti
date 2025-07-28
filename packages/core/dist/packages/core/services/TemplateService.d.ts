import { Template, TemplateFilter } from '../types/TemplateTypes';
/**
 * Template storage interface - can be implemented for local/server storage
 */
export interface TemplateStorage {
    save(template: Template): Promise<Template>;
    load(id: string): Promise<Template | null>;
    loadAll(): Promise<Template>;
    update(id: string, updates: Partial<Template>): Promise<Template>;
    delete(id: string): Promise<void>;
    search(filter: TemplateFilter): Promise<Template>;
}
export declare class LocalTemplateStorage implements TemplateStorage {
    private readonly storageKey;
    private getStoredTemplates;
    private saveStoredTemplates;
}
//# sourceMappingURL=TemplateService.d.ts.map