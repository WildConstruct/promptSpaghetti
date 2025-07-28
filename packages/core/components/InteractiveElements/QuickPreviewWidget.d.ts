/**
 * Epic 16 Quick Preview Widget
 *
 * Interactive preview widget for marketplace templates with
 * zoom, download, sharing, and detailed information display.
 */
import React from 'react';
import { QuickPreviewElement, Epic16InteractiveElementsService } from '../../services/Epic16InteractiveElementsService';

interface QuickPreviewWidgetProps {
    element: QuickPreviewElement;
    interactiveService: Epic16InteractiveElementsService;
    userId: string;
    templateId: string;
    templateData: TemplatePreviewData;
    onClose?: () => void;
    onDownload?: (templateId: string) => void;
    onShare?: (templateId: string, platform: string) => void;
    onPurchase?: (templateId: string) => void;


interface TemplatePreviewData {
    id: string;
    title: string;
    description: string;
    author: string;
    authorAvatar?: string;
    price: number;
    originalPrice?: number;
    currency: string;
    rating: number;
    reviewCount: number;
    downloadCount: number;
    category: string;
    tags: string[];
    license: string;
    previewUrl: string;
    thumbnails: string[];
    demoUrl?: string;
    fileSize: string;
    fileFormat: string[];
    lastUpdated: Date;
    compatibility: string[];
    features: string[];
    whatsIncluded: string[];
    requirements: string[];
    isPurchased: boolean;
    isInWishlist: boolean;
    canDownload: boolean;

export declare const QuickPreviewWidget: React.FC<QuickPreviewWidgetProps>;
export default QuickPreviewWidget;
//# sourceMappingURL=QuickPreviewWidget.d.ts.map