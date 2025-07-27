export interface ExportOptions {
    name?: string;
    description?: string;
    includeInactive?: boolean;
    includeStatistics?: boolean;
    ruleIds?: string[];
}
export interface ImportOptions {
    overwrite?: boolean;
    merge?: boolean;
    skipDuplicates?: boolean;
}
export interface CorrectionRule {
    id: string;
    name: string;
    description?: string;
    findPattern: string;
    replaceWith: string;
    isRegex: boolean;
    isActive: boolean;
    priority: number;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=correctionsStore.d.ts.map