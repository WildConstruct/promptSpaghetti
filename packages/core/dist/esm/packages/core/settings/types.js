// packages/core/settings/types.ts
// Settings type definitions for Epic 7.3 Advanced Settings Modal
import { z } from 'zod';
/**
 * Seed override configuration
 */
export const SeedSettingsSchema = z.object({ enabled: z.boolean().default(false),
    value: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).optional(),
    history: z.array(z.number().int()).max(10).default([]),
    autoGenerate: z.boolean().default(true) });
;
/**
 * Sampling temperature configuration for randomness control
 */
export const TemperatureSettingsSchema = z.object({ enabled: z.boolean().default(false),
    value: z.number().min(0.1).max(2.0).default(1.0),
    showIndicator: z.boolean().default(true),
    presets: z.array(z.object({}), name, z.string(), value, z.number(), description, z.string()) });
([]) => { name: 'Conservative', value; 0.3, description; 'More predictable results'; },
    { name: 'Balanced', value: 1.0, description: 'Standard randomness' },
    { name: 'Creative', value: 1.7, description: 'More varied results' };
;
/**
 * Run count configuration for batch execution
 */
export const RunCountSettingsSchema = z.object({ value: z.number().int().min(1).max(50).default(5),
    showPerformanceWarning: z.boolean().default(true),
    presets: z.array(z.number().int()).default([1, 3, 5, 10, 20]) });
;
/**
 * Batch execution configuration
 */
export const BatchSettingsSchema = z.object({ batchSize: z.number().int().min(1).max(100).default(5),
    outputFormat: z.enum(['individual', 'combined', 'csv', 'json']).default('individual') }, namingPattern, z.string().default('result-{seed}-{timestamp}'), includeMetadata, z.boolean().default(true), autoDownload, z.boolean().default(false));
;
/**
 * Performance and debugging settings
 */
export const PerformanceSettingsSchema = z.object({ showExecutionTimes: z.boolean().default(false),
    enableCaching: z.boolean().default(true),
    showMemoryUsage: z.boolean().default(false),
    logExecutionSteps: z.boolean().default(false) });
;
/**
 * UI and accessibility settings
 */
export const UISettingsSchema = z.object({ theme: z.enum(['auto', 'light', 'dark']).default('auto'),
    showTooltips: z.boolean().default(true),
    enableKeyboardShortcuts: z.boolean().default(true),
    reduceAnimations: z.boolean().default(false),
    highContrast: z.boolean().default(false) });
;
/**
 * Complete settings schema
 */
export const AdvancedSettingsSchema = z.object({
    seed: SeedSettingsSchema,
    temperature: TemperatureSettingsSchema,
    runCount: RunCountSettingsSchema,
    batch: BatchSettingsSchema,
    // System settings
    performance: PerformanceSettingsSchema,
    ui: UISettingsSchema,
    // Metadata
    version: z.string().default('1.0.0'),
    lastModified: z.string().datetime().optional(),
    userId: z.string().optional()
});
;
/**
 * Settings group configuration for UI organization
 */
export const SettingsGroupSchema = z.object({ id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    icon: z.string().optional(),
    order: z.number().int().min(0).default(0),
    collapsible: z.boolean().default(true),
    defaultExpanded: z.boolean().default(true) });
;
/**
 * Individual setting item configuration
 */
export const SettingItemSchema = z.object({ key: z.string(),
    groupId: z.string(),
    label: z.string(),
    description: z.string().optional(),
    type: z.enum(['boolean', 'number', 'string', 'select', 'slider', 'multiselect']),
    validation: z.unknown().optional(),
    defaultValue: z.unknown(),
    options: z.array(z.unknown()).optional(), // For select/multiselect,
    min: z.number().optional(), // For number/slider,
    max: z.number().optional(), // For number/slider,
    step: z.number().optional(), // For number/slider,
    placeholder: z.string().optional(),
    helpText: z.string().optional(),
    disabled: z.boolean().default(false),
    advanced: z.boolean().default(false) // Show only in advanced mode }
});
;
