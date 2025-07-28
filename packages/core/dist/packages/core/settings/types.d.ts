import { z } from 'zod';
/**
 * Seed override configuration
 */
export declare const SeedSettingsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
/**
 * Sampling temperature configuration for randomness control
 */
export declare const TemperatureSettingsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
/**
 * Run count configuration for batch execution
 */
export declare const RunCountSettingsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
/**
 * Batch execution configuration
 */
export declare const BatchSettingsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
/**
 * Performance and debugging settings
 */
export declare const PerformanceSettingsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
/**
 * UI and accessibility settings
 */
export declare const UISettingsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
/**
 * Complete settings schema
 */
export declare const AdvancedSettingsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
/**
 * Settings group configuration for UI organization
 */
export declare const SettingsGroupSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
/**
 * Individual setting item configuration
 */
export declare const SettingItemSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
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
export interface SettingsValidationResult {
    valid: boolean;
    errors: string;
    warnings: string;
}
export interface SettingsExport {
    settings: AdvancedSettings;
    metadata: {
        exportedAt: string;
        version: string;
        appVersion: string;
    };
}
//# sourceMappingURL=types.d.ts.map