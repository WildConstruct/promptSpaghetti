/**
 * Funnel Configuration System - Story 30.2 Task 5
 *
 * Advanced funnel configuration interface with drag-and-drop step management,
 * conditional logic setup, success criteria definition, and real-time validation.
 *
 * Features:
 * - Visual funnel step builder with drag-and-drop
 * - Conditional path configuration
 * - Advanced event criteria matching
 * - Success metrics definition
 * - Real-time funnel validation
 * - Template-based funnel creation
 * - Import/export capabilities
 */
import React from 'react';
import { ConversionFunnelDefinition, ConversionStep, FunnelCategory } from '../../analytics/ConversionDataModel';
export interface FunnelConfigurationProps {
    initialFunnel?: Partial<ConversionFunnelDefinition>;
    templates?: FunnelTemplate;
    availableEvents?: EventDefinition;
    availableProperties?: PropertyDefinition;
    onSave?: (funnel: ConversionFunnelDefinition) => void;
    onCancel?: () => void;
    onValidation?: (isValid: boolean, errors: ValidationError) => void;
}
export interface FunnelTemplate {
    id: string;
    name: string;
    description: string;
    category: FunnelCategory;
    steps: Partial<ConversionStep>[];
    defaultConfiguration: Partial<ConversionFunnelDefinition>;
    tags: string;
}
export interface EventDefinition {
    type: string;
    name: string;
    description: string;
    category: string;
    properties: PropertyDefinition;
    examples: unknown;
}
export interface PropertyDefinition {
    path: string;
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
    description: string;
    possibleValues?: unknown;
    validation?: PropertyValidation;
}
export interface PropertyValidation {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    customValidator?: string;
}
export interface ValidationError {
    field: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    suggestion?: string;
}
export interface DragItem {
    type: 'step' | 'condition' | 'path';
    id: string;
    data: Record<string, unknown>;
}
export declare const FunnelConfiguration: React.FC<FunnelConfigurationProps>;
export default FunnelConfiguration;
//# sourceMappingURL=FunnelConfiguration.d.ts.map