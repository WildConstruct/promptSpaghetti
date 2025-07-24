/**
 * Epic 16 Embedded Template Preview - E16-1753114247039-7095F5
 *
 * Embeddable template preview component for social sharing and external site integration.
 * Builds upon existing TemplatePreviewModal and EmbeddableContent infrastructure.
 */
import React from 'react';
import { Template } from './TemplatePreviewModal';
import { EmbedConfiguration, EmbedTheme, EmbedSize, EmbedFeatures } from '../embed/EmbeddableContent';
export interface EmbeddedTemplatePreviewProps {
    template: Template;
    embedConfig: EmbedConfiguration;
    showCustomization?: boolean;
    onCustomize?: (config: Partial<EmbedConfiguration>) => void;
    onShare?: (method: ShareMethod) => void;
    onPreview?: (template: Template) => void;
    onPurchase?: (template: Template) => void;
    onLike?: (template: Template) => void;
    onRate?: (template: Template, rating: number) => void;
    className?: string;
    variant?: 'compact' | 'standard' | 'detailed' | 'showcase';
    interactive?: boolean;
    autoPlay?: boolean;
    showMetrics?: boolean;
    showSocialActions?: boolean;
    showPurchaseButton?: boolean;
    maxWidth?: number;
    maxHeight?: number;
}
export interface ShareMethod {
    type: 'link' | 'embed' | 'social' | 'email' | 'copy';
    platform?: 'twitter' | 'linkedin' | 'facebook' | 'reddit' | 'discord';
    customization?: EmbedCustomization;
}
export interface EmbedCustomization {
    size: EmbedSize;
    theme: EmbedTheme;
    features: EmbedFeatures;
    layout: EmbedLayout;
    branding: EmbedBranding;
    social: EmbedSocialConfig;
}
export interface EmbedLayout {
    orientation: 'horizontal' | 'vertical' | 'grid';
    showHeader: boolean;
    showFooter: boolean;
    showSidebar: boolean;
    contentAlignment: 'left' | 'center' | 'right';
    spacing: 'tight' | 'normal' | 'loose';
    borderRadius: number;
    shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}
export interface EmbedBranding {
    showLogo: boolean;
    showTitle: boolean;
    showAuthor: boolean;
    showPoweredBy: boolean;
    customColors?: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
    };
    customFonts?: {
        heading: string;
        body: string;
    };
}
export interface EmbedSocialConfig {
    showLikes: boolean;
    showShares: boolean;
    showComments: boolean;
    showRating: boolean;
    showDownloads: boolean;
    enableInteraction: boolean;
    showAuthorInfo: boolean;
    showStats: boolean;
}
export interface PreviewSize {
    width: number;
    height: number;
    label: string;
    icon: React.ComponentType<unknown>;
    description: string;
}
export declare const PREVIEW_SIZES: PreviewSize[];
export declare const EmbedCodeGenerator: React.FC<{
    template: Template;
    customization: EmbedCustomization;
    onCustomizationChange: (updates: Partial<EmbedCustomization>) => void;
}>;
export declare const EmbedCustomizationPanel: React.FC<{
    customization: EmbedCustomization;
    onCustomizationChange: (updates: Partial<EmbedCustomization>) => void;
    previewSize: PreviewSize;
    onPreviewSizeChange: (size: PreviewSize) => void;
}>;
export declare const EmbeddedTemplatePreview: React.FC<EmbeddedTemplatePreviewProps>;
export default EmbeddedTemplatePreview;
//# sourceMappingURL=EmbeddedTemplatePreview.d.ts.map