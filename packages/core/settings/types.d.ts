import { z } from 'zod';
/**
 * Seed override configuration
 */
export declare const SeedSettingsSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    value: z.ZodOptional<z.ZodNumber>;
    history: z.ZodDefault<z.ZodArray<z.ZodNumber, "many">>;
    autoGenerate: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    history: number[];
    autoGenerate: boolean;
    value?: number | undefined;
}, {
    enabled?: boolean | undefined;
    value?: number | undefined;
    history?: number[] | undefined;
    autoGenerate?: boolean | undefined;
}>;
/**
 * Sampling temperature configuration for randomness control
 */
export declare const TemperatureSettingsSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    value: z.ZodDefault<z.ZodNumber>;
    showIndicator: z.ZodDefault<z.ZodBoolean>;
    presets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodNumber;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: number;
        name: string;
        description: string;
    }, {
        value: number;
        name: string;
        description: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    value: number;
    showIndicator: boolean;
    presets: {
        value: number;
        name: string;
        description: string;
    }[];
}, {
    enabled?: boolean | undefined;
    value?: number | undefined;
    showIndicator?: boolean | undefined;
    presets?: {
        value: number;
        name: string;
        description: string;
    }[] | undefined;
}>;
/**
 * Run count configuration for batch execution
 */
export declare const RunCountSettingsSchema: z.ZodObject<{
    value: z.ZodDefault<z.ZodNumber>;
    showPerformanceWarning: z.ZodDefault<z.ZodBoolean>;
    presets: z.ZodDefault<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    value: number;
    presets: number[];
    showPerformanceWarning: boolean;
}, {
    value?: number | undefined;
    presets?: number[] | undefined;
    showPerformanceWarning?: boolean | undefined;
}>;
/**
 * Batch execution configuration
 */
export declare const BatchSettingsSchema: z.ZodObject<{
    batchSize: z.ZodDefault<z.ZodNumber>;
    outputFormat: z.ZodDefault<z.ZodEnum<["individual", "combined", "csv", "json"]>>;
    namingPattern: z.ZodDefault<z.ZodString>;
    includeMetadata: z.ZodDefault<z.ZodBoolean>;
    autoDownload: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    batchSize: number;
    outputFormat: "individual" | "combined" | "csv" | "json";
    namingPattern: string;
    includeMetadata: boolean;
    autoDownload: boolean;
}, {
    batchSize?: number | undefined;
    outputFormat?: "individual" | "combined" | "csv" | "json" | undefined;
    namingPattern?: string | undefined;
    includeMetadata?: boolean | undefined;
    autoDownload?: boolean | undefined;
}>;
/**
 * Performance and debugging settings
 */
export declare const PerformanceSettingsSchema: z.ZodObject<{
    showExecutionTimes: z.ZodDefault<z.ZodBoolean>;
    enableCaching: z.ZodDefault<z.ZodBoolean>;
    showMemoryUsage: z.ZodDefault<z.ZodBoolean>;
    logExecutionSteps: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    showExecutionTimes: boolean;
    enableCaching: boolean;
    showMemoryUsage: boolean;
    logExecutionSteps: boolean;
}, {
    showExecutionTimes?: boolean | undefined;
    enableCaching?: boolean | undefined;
    showMemoryUsage?: boolean | undefined;
    logExecutionSteps?: boolean | undefined;
}>;
/**
 * UI and accessibility settings
 */
export declare const UISettingsSchema: z.ZodObject<{
    theme: z.ZodDefault<z.ZodEnum<["auto", "light", "dark"]>>;
    showTooltips: z.ZodDefault<z.ZodBoolean>;
    enableKeyboardShortcuts: z.ZodDefault<z.ZodBoolean>;
    reduceAnimations: z.ZodDefault<z.ZodBoolean>;
    highContrast: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    theme: "auto" | "light" | "dark";
    showTooltips: boolean;
    enableKeyboardShortcuts: boolean;
    reduceAnimations: boolean;
    highContrast: boolean;
}, {
    theme?: "auto" | "light" | "dark" | undefined;
    showTooltips?: boolean | undefined;
    enableKeyboardShortcuts?: boolean | undefined;
    reduceAnimations?: boolean | undefined;
    highContrast?: boolean | undefined;
}>;
/**
 * Complete settings schema
 */
export declare const AdvancedSettingsSchema: z.ZodObject<{
    seed: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        value: z.ZodOptional<z.ZodNumber>;
        history: z.ZodDefault<z.ZodArray<z.ZodNumber, "many">>;
        autoGenerate: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        history: number[];
        autoGenerate: boolean;
        value?: number | undefined;
    }, {
        enabled?: boolean | undefined;
        value?: number | undefined;
        history?: number[] | undefined;
        autoGenerate?: boolean | undefined;
    }>;
    temperature: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        value: z.ZodDefault<z.ZodNumber>;
        showIndicator: z.ZodDefault<z.ZodBoolean>;
        presets: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodNumber;
            description: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: number;
            name: string;
            description: string;
        }, {
            value: number;
            name: string;
            description: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        value: number;
        showIndicator: boolean;
        presets: {
            value: number;
            name: string;
            description: string;
        }[];
    }, {
        enabled?: boolean | undefined;
        value?: number | undefined;
        showIndicator?: boolean | undefined;
        presets?: {
            value: number;
            name: string;
            description: string;
        }[] | undefined;
    }>;
    runCount: z.ZodObject<{
        value: z.ZodDefault<z.ZodNumber>;
        showPerformanceWarning: z.ZodDefault<z.ZodBoolean>;
        presets: z.ZodDefault<z.ZodArray<z.ZodNumber, "many">>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        presets: number[];
        showPerformanceWarning: boolean;
    }, {
        value?: number | undefined;
        presets?: number[] | undefined;
        showPerformanceWarning?: boolean | undefined;
    }>;
    batch: z.ZodObject<{
        batchSize: z.ZodDefault<z.ZodNumber>;
        outputFormat: z.ZodDefault<z.ZodEnum<["individual", "combined", "csv", "json"]>>;
        namingPattern: z.ZodDefault<z.ZodString>;
        includeMetadata: z.ZodDefault<z.ZodBoolean>;
        autoDownload: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        batchSize: number;
        outputFormat: "individual" | "combined" | "csv" | "json";
        namingPattern: string;
        includeMetadata: boolean;
        autoDownload: boolean;
    }, {
        batchSize?: number | undefined;
        outputFormat?: "individual" | "combined" | "csv" | "json" | undefined;
        namingPattern?: string | undefined;
        includeMetadata?: boolean | undefined;
        autoDownload?: boolean | undefined;
    }>;
    performance: z.ZodObject<{
        showExecutionTimes: z.ZodDefault<z.ZodBoolean>;
        enableCaching: z.ZodDefault<z.ZodBoolean>;
        showMemoryUsage: z.ZodDefault<z.ZodBoolean>;
        logExecutionSteps: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        showExecutionTimes: boolean;
        enableCaching: boolean;
        showMemoryUsage: boolean;
        logExecutionSteps: boolean;
    }, {
        showExecutionTimes?: boolean | undefined;
        enableCaching?: boolean | undefined;
        showMemoryUsage?: boolean | undefined;
        logExecutionSteps?: boolean | undefined;
    }>;
    ui: z.ZodObject<{
        theme: z.ZodDefault<z.ZodEnum<["auto", "light", "dark"]>>;
        showTooltips: z.ZodDefault<z.ZodBoolean>;
        enableKeyboardShortcuts: z.ZodDefault<z.ZodBoolean>;
        reduceAnimations: z.ZodDefault<z.ZodBoolean>;
        highContrast: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        theme: "auto" | "light" | "dark";
        showTooltips: boolean;
        enableKeyboardShortcuts: boolean;
        reduceAnimations: boolean;
        highContrast: boolean;
    }, {
        theme?: "auto" | "light" | "dark" | undefined;
        showTooltips?: boolean | undefined;
        enableKeyboardShortcuts?: boolean | undefined;
        reduceAnimations?: boolean | undefined;
        highContrast?: boolean | undefined;
    }>;
    version: z.ZodDefault<z.ZodString>;
    lastModified: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    seed: {
        enabled: boolean;
        history: number[];
        autoGenerate: boolean;
        value?: number | undefined;
    };
    temperature: {
        enabled: boolean;
        value: number;
        showIndicator: boolean;
        presets: {
            value: number;
            name: string;
            description: string;
        }[];
    };
    runCount: {
        value: number;
        presets: number[];
        showPerformanceWarning: boolean;
    };
    batch: {
        batchSize: number;
        outputFormat: "individual" | "combined" | "csv" | "json";
        namingPattern: string;
        includeMetadata: boolean;
        autoDownload: boolean;
    };
    performance: {
        showExecutionTimes: boolean;
        enableCaching: boolean;
        showMemoryUsage: boolean;
        logExecutionSteps: boolean;
    };
    ui: {
        theme: "auto" | "light" | "dark";
        showTooltips: boolean;
        enableKeyboardShortcuts: boolean;
        reduceAnimations: boolean;
        highContrast: boolean;
    };
    version: string;
    lastModified?: string | undefined;
    userId?: string | undefined;
}, {
    seed: {
        enabled?: boolean | undefined;
        value?: number | undefined;
        history?: number[] | undefined;
        autoGenerate?: boolean | undefined;
    };
    temperature: {
        enabled?: boolean | undefined;
        value?: number | undefined;
        showIndicator?: boolean | undefined;
        presets?: {
            value: number;
            name: string;
            description: string;
        }[] | undefined;
    };
    runCount: {
        value?: number | undefined;
        presets?: number[] | undefined;
        showPerformanceWarning?: boolean | undefined;
    };
    batch: {
        batchSize?: number | undefined;
        outputFormat?: "individual" | "combined" | "csv" | "json" | undefined;
        namingPattern?: string | undefined;
        includeMetadata?: boolean | undefined;
        autoDownload?: boolean | undefined;
    };
    performance: {
        showExecutionTimes?: boolean | undefined;
        enableCaching?: boolean | undefined;
        showMemoryUsage?: boolean | undefined;
        logExecutionSteps?: boolean | undefined;
    };
    ui: {
        theme?: "auto" | "light" | "dark" | undefined;
        showTooltips?: boolean | undefined;
        enableKeyboardShortcuts?: boolean | undefined;
        reduceAnimations?: boolean | undefined;
        highContrast?: boolean | undefined;
    };
    version?: string | undefined;
    lastModified?: string | undefined;
    userId?: string | undefined;
}>;
/**
 * Settings group configuration for UI organization
 */
export declare const SettingsGroupSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    order: z.ZodDefault<z.ZodNumber>;
    collapsible: z.ZodDefault<z.ZodBoolean>;
    defaultExpanded: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    order: number;
    collapsible: boolean;
    defaultExpanded: boolean;
    description?: string | undefined;
    icon?: string | undefined;
}, {
    name: string;
    id: string;
    description?: string | undefined;
    icon?: string | undefined;
    order?: number | undefined;
    collapsible?: boolean | undefined;
    defaultExpanded?: boolean | undefined;
}>;
/**
 * Individual setting item configuration
 */
export declare const SettingItemSchema: z.ZodObject<{
    key: z.ZodString;
    groupId: z.ZodString;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["boolean", "number", "string", "select", "slider", "multiselect"]>;
    validation: z.ZodOptional<z.ZodUnknown>;
    defaultValue: z.ZodUnknown;
    options: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
    min: z.ZodOptional<z.ZodNumber>;
    max: z.ZodOptional<z.ZodNumber>;
    step: z.ZodOptional<z.ZodNumber>;
    placeholder: z.ZodOptional<z.ZodString>;
    helpText: z.ZodOptional<z.ZodString>;
    disabled: z.ZodDefault<z.ZodBoolean>;
    advanced: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "string" | "number" | "boolean" | "select" | "slider" | "multiselect";
    key: string;
    groupId: string;
    label: string;
    disabled: boolean;
    advanced: boolean;
    options?: unknown[] | undefined;
    validation?: unknown;
    description?: string | undefined;
    defaultValue?: unknown;
    min?: number | undefined;
    max?: number | undefined;
    step?: number | undefined;
    placeholder?: string | undefined;
    helpText?: string | undefined;
}, {
    type: "string" | "number" | "boolean" | "select" | "slider" | "multiselect";
    key: string;
    groupId: string;
    label: string;
    options?: unknown[] | undefined;
    validation?: unknown;
    description?: string | undefined;
    defaultValue?: unknown;
    min?: number | undefined;
    max?: number | undefined;
    step?: number | undefined;
    placeholder?: string | undefined;
    helpText?: string | undefined;
    disabled?: boolean | undefined;
    advanced?: boolean | undefined;
}>;
export type SeedSettings = z.infer<typeof SeedSettingsSchema>;
export type TemperatureSettings = z.infer<typeof TemperatureSettingsSchema>;
export type RunCountSettings = z.infer<typeof RunCountSettingsSchema>;
export type BatchSettings = z.infer<typeof BatchSettingsSchema>;
export type PerformanceSettings = z.infer<typeof PerformanceSettingsSchema>;
export type UISettings = z.infer<typeof UISettingsSchema>;
export type AdvancedSettings = z.infer<typeof AdvancedSettingsSchema>;
export type SettingsGroup = z.infer<typeof SettingsGroupSchema>;
export type SettingItem = z.infer<typeof SettingItemSchema>;
/**
 * Settings change event
 */
export interface SettingsChangeEvent {
    key: string;
    value: any;
    previousValue: any;
    timestamp: Date;
    source: 'user' | 'system' | 'import';
}
/**
 * Settings validation result
 */
export interface SettingsValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Settings export/import format
 */
export interface SettingsExport {
    settings: AdvancedSettings;
    metadata: {
        exportedAt: string;
        version: string;
        appVersion: string;
    };
}
//# sourceMappingURL=types.d.ts.map