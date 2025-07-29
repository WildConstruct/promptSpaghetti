/**
 * Epic 16 Embed Customization Interface - E16-1753114247041-8D9574
 *
 * Visual embed builder with drag-and-drop customization for template embeds.
 * Extends existing EmbeddableContent system with advanced customization capabilities.
 */
import React from 'react';
import { Template } from './TemplatePreviewModal';
import { EmbedCustomization, PreviewSize } from './EmbeddedTemplatePreview';

export interface EmbedCustomizationInterfaceProps {
    template: Template;
    initialCustomization?: EmbedCustomization;
    onCustomizationChange: (customization: EmbedCustomization) => void;
    onSave: (customization: EmbedCustomization) => Promise<void>;
    onCancel: () => void;
    onPreview: (customization: EmbedCustomization) => void;
    onExport: (customization: EmbedCustomization, format: 'iframe' | 'javascript' | 'react') => string;
    className?: string;
    presets?: EmbedPreset[];

export interface EmbedPreset {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    category: 'social' | 'blog' | 'portfolio' | 'ecommerce' | 'documentation' | 'custom';
    customization: EmbedCustomization;
    popular: boolean;

export interface EmbedWidget {
    id: string;
    type: 'header' | 'preview' | 'metadata' | 'actions' | 'stats' | 'comments' | 'author' | 'footer';
    name: string;
    description: string;
    icon: React.ComponentType<unknown>;
    configurable: boolean;
    required: boolean;
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    visible: boolean;
    config: Record<string, any>;

export interface CustomFont {
    family: string;
    category: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting';
    weights: number[];
    url?: string;
    provider: 'google' | 'adobe' | 'custom';

export interface CustomTheme {
    id: string;
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
        textSecondary: string;
        border: string;
        success: string;
        warning: string;
        error: string;
        info: string;
    };
    fonts: {
        heading: CustomFont;
        body: CustomFont;
        ui: CustomFont;
    };
    spacing: {
        unit: number;
        scale: number[];
    };
    borderRadius: {
        small: number;
        medium: number;
        large: number;
    };
    shadows: {
        small: string;
        medium: string;
        large: string;
    };

export declare const PresetSelector: React.FC<{
    presets: EmbedPreset[];
    selectedPreset?: string;
    onPresetSelect: (preset: EmbedPreset) => void;
}>;
export declare const VisualLayoutBuilder: React.FC<{
    widgets: EmbedWidget[];
    onWidgetsChange: (widgets: EmbedWidget[]) => void;
    previewSize: PreviewSize;
}>;
export declare const EmbedCustomizationInterface: React.FC<EmbedCustomizationInterfaceProps>;
export default EmbedCustomizationInterface;
//# sourceMappingURL=EmbedCustomizationInterface.d.ts.map