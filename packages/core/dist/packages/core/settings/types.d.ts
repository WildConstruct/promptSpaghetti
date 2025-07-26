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
    history?: number[];
    value?: number;
    enabled?: boolean;
    autoGenerate?: boolean;
}, {
    history?: number[];
    value?: number;
    enabled?: boolean;
    autoGenerate?: boolean;
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
        name?: string;
        description?: string;
        value?: number;
    }, {
        name?: string;
        description?: string;
        value?: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    value?: number;
    enabled?: boolean;
    showIndicator?: boolean;
    presets?: {
        name?: string;
        description?: string;
        value?: number;
    }[];
}, {
    value?: number;
    enabled?: boolean;
    showIndicator?: boolean;
    presets?: {
        name?: string;
        description?: string;
        value?: number;
    }[];
}>;
/**
 * Run count configuration for batch execution
 */
export declare const RunCountSettingsSchema: z.ZodObject<{
    value: z.ZodDefault<z.ZodNumber>;
    showPerformanceWarning: z.ZodDefault<z.ZodBoolean>;
    presets: z.ZodDefault<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    value?: number;
    presets?: number[];
    showPerformanceWarning?: boolean;
}, {
    value?: number;
    presets?: number[];
    showPerformanceWarning?: boolean;
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
    includeMetadata?: boolean;
    batchSize?: number;
    outputFormat?: "json" | "csv" | "individual" | "combined";
    namingPattern?: string;
    autoDownload?: boolean;
}, {
    includeMetadata?: boolean;
    batchSize?: number;
    outputFormat?: "json" | "csv" | "individual" | "combined";
    namingPattern?: string;
    autoDownload?: boolean;
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
    enableCaching?: boolean;
    showExecutionTimes?: boolean;
    showMemoryUsage?: boolean;
    logExecutionSteps?: boolean;
}, {
    enableCaching?: boolean;
    showExecutionTimes?: boolean;
    showMemoryUsage?: boolean;
    logExecutionSteps?: boolean;
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
    theme?: "auto" | "light" | "dark";
    showTooltips?: boolean;
    enableKeyboardShortcuts?: boolean;
    reduceAnimations?: boolean;
    highContrast?: boolean;
}, {
    theme?: "auto" | "light" | "dark";
    showTooltips?: boolean;
    enableKeyboardShortcuts?: boolean;
    reduceAnimations?: boolean;
    highContrast?: boolean;
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
        history?: number[];
        value?: number;
        enabled?: boolean;
        autoGenerate?: boolean;
    }, {
        history?: number[];
        value?: number;
        enabled?: boolean;
        autoGenerate?: boolean;
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
            name?: string;
            description?: string;
            value?: number;
        }, {
            name?: string;
            description?: string;
            value?: number;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        value?: number;
        enabled?: boolean;
        showIndicator?: boolean;
        presets?: {
            name?: string;
            description?: string;
            value?: number;
        }[];
    }, {
        value?: number;
        enabled?: boolean;
        showIndicator?: boolean;
        presets?: {
            name?: string;
            description?: string;
            value?: number;
        }[];
    }>;
    runCount: z.ZodObject<{
        value: z.ZodDefault<z.ZodNumber>;
        showPerformanceWarning: z.ZodDefault<z.ZodBoolean>;
        presets: z.ZodDefault<z.ZodArray<z.ZodNumber, "many">>;
    }, "strip", z.ZodTypeAny, {
        value?: number;
        presets?: number[];
        showPerformanceWarning?: boolean;
    }, {
        value?: number;
        presets?: number[];
        showPerformanceWarning?: boolean;
    }>;
    batch: z.ZodObject<{
        batchSize: z.ZodDefault<z.ZodNumber>;
        outputFormat: z.ZodDefault<z.ZodEnum<["individual", "combined", "csv", "json"]>>;
        namingPattern: z.ZodDefault<z.ZodString>;
        includeMetadata: z.ZodDefault<z.ZodBoolean>;
        autoDownload: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        includeMetadata?: boolean;
        batchSize?: number;
        outputFormat?: "json" | "csv" | "individual" | "combined";
        namingPattern?: string;
        autoDownload?: boolean;
    }, {
        includeMetadata?: boolean;
        batchSize?: number;
        outputFormat?: "json" | "csv" | "individual" | "combined";
        namingPattern?: string;
        autoDownload?: boolean;
    }>;
    performance: z.ZodObject<{
        showExecutionTimes: z.ZodDefault<z.ZodBoolean>;
        enableCaching: z.ZodDefault<z.ZodBoolean>;
        showMemoryUsage: z.ZodDefault<z.ZodBoolean>;
        logExecutionSteps: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enableCaching?: boolean;
        showExecutionTimes?: boolean;
        showMemoryUsage?: boolean;
        logExecutionSteps?: boolean;
    }, {
        enableCaching?: boolean;
        showExecutionTimes?: boolean;
        showMemoryUsage?: boolean;
        logExecutionSteps?: boolean;
    }>;
    ui: z.ZodObject<{
        theme: z.ZodDefault<z.ZodEnum<["auto", "light", "dark"]>>;
        showTooltips: z.ZodDefault<z.ZodBoolean>;
        enableKeyboardShortcuts: z.ZodDefault<z.ZodBoolean>;
        reduceAnimations: z.ZodDefault<z.ZodBoolean>;
        highContrast: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        theme?: "auto" | "light" | "dark";
        showTooltips?: boolean;
        enableKeyboardShortcuts?: boolean;
        reduceAnimations?: boolean;
        highContrast?: boolean;
    }, {
        theme?: "auto" | "light" | "dark";
        showTooltips?: boolean;
        enableKeyboardShortcuts?: boolean;
        reduceAnimations?: boolean;
        highContrast?: boolean;
    }>;
    version: z.ZodDefault<z.ZodString>;
    lastModified: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    performance?: {
        enableCaching?: boolean;
        showExecutionTimes?: boolean;
        showMemoryUsage?: boolean;
        logExecutionSteps?: boolean;
    };
    seed?: {
        history?: number[];
        value?: number;
        enabled?: boolean;
        autoGenerate?: boolean;
    };
    version?: string;
    lastModified?: string;
    userId?: string;
    temperature?: {
        value?: number;
        enabled?: boolean;
        showIndicator?: boolean;
        presets?: {
            name?: string;
            description?: string;
            value?: number;
        }[];
    };
    batch?: {
        includeMetadata?: boolean;
        batchSize?: number;
        outputFormat?: "json" | "csv" | "individual" | "combined";
        namingPattern?: string;
        autoDownload?: boolean;
    };
    ui?: {
        theme?: "auto" | "light" | "dark";
        showTooltips?: boolean;
        enableKeyboardShortcuts?: boolean;
        reduceAnimations?: boolean;
        highContrast?: boolean;
    };
    runCount?: {
        value?: number;
        presets?: number[];
        showPerformanceWarning?: boolean;
    };
}, {
    performance?: {
        enableCaching?: boolean;
        showExecutionTimes?: boolean;
        showMemoryUsage?: boolean;
        logExecutionSteps?: boolean;
    };
    seed?: {
        history?: number[];
        value?: number;
        enabled?: boolean;
        autoGenerate?: boolean;
    };
    version?: string;
    lastModified?: string;
    userId?: string;
    temperature?: {
        value?: number;
        enabled?: boolean;
        showIndicator?: boolean;
        presets?: {
            name?: string;
            description?: string;
            value?: number;
        }[];
    };
    batch?: {
        includeMetadata?: boolean;
        batchSize?: number;
        outputFormat?: "json" | "csv" | "individual" | "combined";
        namingPattern?: string;
        autoDownload?: boolean;
    };
    ui?: {
        theme?: "auto" | "light" | "dark";
        showTooltips?: boolean;
        enableKeyboardShortcuts?: boolean;
        reduceAnimations?: boolean;
        highContrast?: boolean;
    };
    runCount?: {
        value?: number;
        presets?: number[];
        showPerformanceWarning?: boolean;
    };
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
    id?: string;
    name?: string;
    description?: string;
    icon?: string;
    defaultExpanded?: boolean;
    collapsible?: boolean;
    order?: number;
}, {
    id?: string;
    name?: string;
    description?: string;
    icon?: string;
    defaultExpanded?: boolean;
    collapsible?: boolean;
    order?: number;
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
    description?: string;
    options?: unknown[];
    validation?: unknown;
    type?: "string" | "number" | "boolean" | "select" | "slider" | "multiselect";
    placeholder?: string;
    defaultValue?: unknown;
    key?: string;
    label?: string;
    advanced?: boolean;
    disabled?: boolean;
    min?: number;
    max?: number;
    step?: number;
    groupId?: string;
    helpText?: string;
}, {
    description?: string;
    options?: unknown[];
    validation?: unknown;
    type?: "string" | "number" | "boolean" | "select" | "slider" | "multiselect";
    placeholder?: string;
    defaultValue?: unknown;
    key?: string;
    label?: string;
    advanced?: boolean;
    disabled?: boolean;
    min?: number;
    max?: number;
    step?: number;
    groupId?: string;
    helpText?: string;
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