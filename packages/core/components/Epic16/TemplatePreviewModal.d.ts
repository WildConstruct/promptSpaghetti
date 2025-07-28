/**
 * Epic 16 Template Preview Modal Component
 *
 * Modal component for previewing marketplace templates with Claude integration,
 * sandboxed content protection, and purchase flow integration.
 */
import React from 'react';
import { MarketplaceTemplate } from './MarketplaceCard';

interface PreviewResult {
    output: string;
    cost: number;
    qualityScore: number;
    tokens: number;
    model: string;
    executionTime: number;


interface TemplatePreviewModalProps {
    template: MarketplaceTemplate;
    isOpen: boolean;
    onClose: () => void;
    onPurchase: (template: MarketplaceTemplate) => void;
    onPreviewGenerate?: (template: MarketplaceTemplate, input: string, model?: string) => Promise<PreviewResult>;
    isPurchased?: boolean;
    currentUser?: {
        id: string;
        name: string;
        tier: 'free' | 'pro' | 'enterprise';

    };

export declare const TemplatePreviewModal: React.FC<TemplatePreviewModalProps>;
export default TemplatePreviewModal;
//# sourceMappingURL=TemplatePreviewModal.d.ts.map